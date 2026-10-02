/**
 * Image metadata inspection, reading and lossless removal.
 *
 * Removal works on the container level: metadata blocks are dropped from the
 * byte stream while compressed pixel data is copied unchanged. Output for JPEG,
 * PNG and WebP is therefore pixel-identical to the input.
 *
 * Reading is implemented here for the subset this tool displays: the TIFF
 * structure behind EXIF (JPEG APP1, PNG eXIf, WebP EXIF) and PNG text chunks.
 * No parsing library is involved, so the tool ships without a runtime
 * dependency and without a second supply-chain entry.
 */

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff' | 'avif' | 'heic' | 'unknown'

/** Container-level metadata block. Identifiers map to translation keys. */
export type MetadataSegment =
  | 'exif'
  | 'xmp'
  | 'iptc'
  | 'comment'
  | 'icc-profile'
  | 'app-marker'
  | 'png-text'
  | 'png-time'
  | 'webp-exif'
  | 'webp-xmp'

export type MetadataGroup = 'camera' | 'exposure' | 'image' | 'time' | 'location' | 'software' | 'author'

export interface MetadataEntry {
  /** Tag name as written in the file; also the translation key suffix. */
  tag: string
  group: MetadataGroup
  /** Raw value. Used directly when no translation key applies. */
  value: string
  /** Translation key for enumerated values such as orientation or flash mode. */
  valueKey?: string
}

export interface MetadataPosition {
  latitude: number
  longitude: number
  altitude: number | null
}

export interface MetadataReport {
  format: ImageFormat
  entries: readonly MetadataEntry[]
  position: MetadataPosition | null
}

export interface StripOptions {
  /** Keep ICC colour profiles. Dropping them can change how images are displayed. */
  keepColorProfiles?: boolean
}

export interface StripResult {
  data: Uint8Array
  format: ImageFormat
  /** True when the pixel data was copied untouched. */
  lossless: boolean
  removed: readonly MetadataSegment[]
  changed: boolean
}

const JPEG_SOI = 0xd8
const JPEG_SOS = 0xda
const JPEG_APP0 = 0xe0
const JPEG_APP1 = 0xe1
const JPEG_APP2 = 0xe2
const JPEG_APP13 = 0xed
const JPEG_APP14 = 0xee
const JPEG_COM = 0xfe

const TIFF_EXIF_IFD = 0x8769
const TIFF_GPS_IFD = 0x8825

const TYPE_BYTE = 1
const TYPE_ASCII = 2
const TYPE_SHORT = 3
const TYPE_LONG = 4
const TYPE_RATIONAL = 5
const TYPE_UNDEFINED = 7
const TYPE_SLONG = 9
const TYPE_SRATIONAL = 10

const typeSizes: Readonly<Record<number, number>> = {
  [TYPE_BYTE]: 1,
  [TYPE_ASCII]: 1,
  [TYPE_SHORT]: 2,
  [TYPE_LONG]: 4,
  [TYPE_RATIONAL]: 8,
  [TYPE_UNDEFINED]: 1,
  [TYPE_SLONG]: 4,
  [TYPE_SRATIONAL]: 8
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  let text = ''
  for (let index = 0; index < length; index += 1) {
    const byte = bytes[offset + index]
    if (byte === undefined) return text
    text += String.fromCharCode(byte)
  }
  return text
}

function matches(bytes: Uint8Array, offset: number, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

function utf8(bytes: Uint8Array, offset: number, length: number): string {
  try {
    return new TextDecoder('utf-8').decode(bytes.subarray(offset, offset + length))
  } catch {
    return ascii(bytes, offset, length)
  }
}

export function detectImageFormat(bytes: Uint8Array): ImageFormat {
  if (bytes.length < 12) return 'unknown'
  if (matches(bytes, 0, [0xff, 0xd8])) return 'jpeg'
  if (matches(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp'
  if (ascii(bytes, 0, 4) === 'GIF8') return 'gif'
  if (ascii(bytes, 0, 2) === 'BM') return 'bmp'
  if (matches(bytes, 0, [0x49, 0x49, 0x2a, 0x00]) || matches(bytes, 0, [0x4d, 0x4d, 0x00, 0x2a])) return 'tiff'
  if (ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4)
    if (brand.startsWith('avif') || brand.startsWith('avis')) return 'avif'
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) return 'heic'
  }
  return 'unknown'
}

/* ------------------------------------------------------------------ *
 * Container inspection
 * ------------------------------------------------------------------ */

interface ContainerBlock {
  kind: MetadataSegment | null
  offset: number
  total: number
}

function jpegSegmentKind(bytes: Uint8Array, offset: number, marker: number): MetadataSegment | null {
  if (marker === JPEG_COM) return 'comment'
  if (marker === JPEG_APP1) {
    if (matches(bytes, offset + 4, [0x45, 0x78, 0x69, 0x66, 0x00, 0x00])) return 'exif'
    if (ascii(bytes, offset + 4, 28).includes('ns.adobe.com/xap')) return 'xmp'
    return 'app-marker'
  }
  if (marker === JPEG_APP2) return ascii(bytes, offset + 4, 11) === 'ICC_PROFILE' ? 'icc-profile' : 'app-marker'
  if (marker === JPEG_APP13) return 'iptc'
  if (marker >= JPEG_APP1 && marker <= 0xef) return 'app-marker'
  if (marker === JPEG_SOI || marker === JPEG_APP0 || marker === JPEG_APP14) return null
  return null
}

function jpegBlocks(bytes: Uint8Array): ContainerBlock[] {
  const blocks: ContainerBlock[] = []
  let offset = 2
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) break
    const marker = bytes[offset + 1]
    if (marker === undefined) break
    if (marker === 0xff) {
      offset += 1
      continue
    }
    if (marker === JPEG_SOS) break
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2
      continue
    }
    const length = ((bytes[offset + 2] ?? 0) << 8) | (bytes[offset + 3] ?? 0)
    if (length < 2 || offset + 2 + length > bytes.length) break
    blocks.push({ kind: jpegSegmentKind(bytes, offset, marker), offset, total: 2 + length })
    offset += 2 + length
  }
  return blocks
}

function pngSegmentKind(bytes: Uint8Array, offset: number): MetadataSegment | null {
  const type = ascii(bytes, offset + 4, 4)
  if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') return 'png-text'
  if (type === 'eXIf') return 'exif'
  if (type === 'tIME') return 'png-time'
  if (type === 'iCCP') return 'icc-profile'
  return null
}

function pngBlocks(bytes: Uint8Array): ContainerBlock[] {
  const blocks: ContainerBlock[] = []
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length =
      ((bytes[offset] ?? 0) << 24) | ((bytes[offset + 1] ?? 0) << 16) | ((bytes[offset + 2] ?? 0) << 8) | (bytes[offset + 3] ?? 0)
    if (length < 0 || offset + 12 + length > bytes.length) break
    blocks.push({ kind: pngSegmentKind(bytes, offset), offset, total: 12 + length })
    offset += 12 + length
  }
  return blocks
}

function webpSegmentKind(bytes: Uint8Array, offset: number): MetadataSegment | null {
  const fourcc = ascii(bytes, offset, 4)
  if (fourcc === 'EXIF') return 'webp-exif'
  if (fourcc === 'XMP ') return 'webp-xmp'
  if (fourcc === 'ICCP') return 'icc-profile'
  return null
}

function webpBlocks(bytes: Uint8Array): ContainerBlock[] {
  const blocks: ContainerBlock[] = []
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const size =
      (bytes[offset + 4] ?? 0) | ((bytes[offset + 5] ?? 0) << 8) | ((bytes[offset + 6] ?? 0) << 16) | ((bytes[offset + 7] ?? 0) << 24)
    if (size < 0 || offset + 8 + size > bytes.length) break
    const padded = size + (size % 2)
    blocks.push({ kind: webpSegmentKind(bytes, offset), offset, total: 8 + padded })
    offset += 8 + padded
  }
  return blocks
}

function containerBlocks(bytes: Uint8Array, format: ImageFormat): ContainerBlock[] {
  if (format === 'jpeg') return jpegBlocks(bytes)
  if (format === 'png') return pngBlocks(bytes)
  if (format === 'webp') return webpBlocks(bytes)
  return []
}

/** Lists removable metadata blocks without modifying the image. */
export function findMetadataSegments(bytes: Uint8Array, options: StripOptions = {}): readonly MetadataSegment[] {
  const keepColorProfiles = options.keepColorProfiles ?? true
  const found: MetadataSegment[] = []
  for (const block of containerBlocks(bytes, detectImageFormat(bytes))) {
    const kind = block.kind
    if (!kind) continue
    if (kind === 'icc-profile' && keepColorProfiles) continue
    if (!found.includes(kind)) found.push(kind)
  }
  return found
}

/* ------------------------------------------------------------------ *
 * Lossless removal
 * ------------------------------------------------------------------ */

function concat(parts: readonly Uint8Array[], total: number): Uint8Array {
  const output = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

function writeLe32(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff])
}

function rebuild(
  bytes: Uint8Array,
  blocks: readonly ContainerBlock[],
  head: Uint8Array,
  tail: Uint8Array,
  keepColorProfiles: boolean
): { data: Uint8Array; removed: MetadataSegment[] } | null {
  if (!blocks.length) return null
  const removed: MetadataSegment[] = []
  const parts: Uint8Array[] = [head]
  let size = head.length

  for (const block of blocks) {
    const kind = block.kind
    if (kind === null || (kind === 'icc-profile' && keepColorProfiles)) {
      const raw = bytes.subarray(block.offset, block.offset + block.total)
      parts.push(raw)
      size += raw.length
    } else {
      removed.push(kind)
    }
  }

  if (!removed.length) return { data: bytes, removed }
  if (tail.length) {
    parts.push(tail)
    size += tail.length
  }
  return { data: concat(parts, size), removed }
}

function stripWebpBytes(bytes: Uint8Array, keepColorProfiles: boolean): { data: Uint8Array; removed: MetadataSegment[] } | null {
  const blocks = webpBlocks(bytes)
  if (!blocks.length) return null
  const removed: MetadataSegment[] = []
  const parts: Uint8Array[] = []
  let payload = 4

  const droppedExif = blocks.some((block) => block.kind === 'webp-exif')
  const droppedXmp = blocks.some((block) => block.kind === 'webp-xmp')

  for (const block of blocks) {
    const kind = block.kind
    if (kind !== null && !(kind === 'icc-profile' && keepColorProfiles)) {
      removed.push(kind)
      continue
    }
    const raw = bytes.subarray(block.offset, block.offset + block.total)
    if (ascii(bytes, block.offset, 4) === 'VP8X') {
      // Clear the EXIF and XMP flags so readers do not look for removed blocks.
      const cleared = new Uint8Array(raw)
      let flags = cleared[8] ?? 0
      if (droppedExif) flags &= ~0x08
      if (droppedXmp) flags &= ~0x04
      cleared[8] = flags
      parts.push(cleared)
    } else {
      parts.push(raw)
    }
    payload += raw.length
  }

  if (!removed.length) return { data: bytes, removed }

  const header = new Uint8Array(12)
  header.set([0x52, 0x49, 0x46, 0x46], 0)
  header.set(writeLe32(payload), 4)
  header.set([0x57, 0x45, 0x42, 0x50], 8)
  return { data: concat([header, ...parts], 12 + payload - 4), removed }
}

/**
 * Removes metadata blocks from the container. Pixel data is copied byte for byte.
 * Formats without a supported container return the input unchanged.
 */
export function stripMetadata(bytes: Uint8Array, options: StripOptions = {}): StripResult {
  const keepColorProfiles = options.keepColorProfiles ?? true
  const format = detectImageFormat(bytes)
  let stripped: { data: Uint8Array; removed: MetadataSegment[] } | null = null

  if (format === 'jpeg') {
    const blocks = jpegBlocks(bytes)
    const last = blocks.at(-1)
    const end = last ? last.offset + last.total : 2
    stripped = rebuild(bytes, blocks, bytes.subarray(0, 2), bytes.subarray(end), keepColorProfiles)
  } else if (format === 'png') {
    const blocks = pngBlocks(bytes)
    const last = blocks.at(-1)
    const end = last ? last.offset + last.total : 8
    stripped = rebuild(bytes, blocks, bytes.subarray(0, 8), bytes.subarray(end), keepColorProfiles)
  } else if (format === 'webp') {
    stripped = stripWebpBytes(bytes, keepColorProfiles)
  }

  if (!stripped || !stripped.removed.length) {
    return {
      data: bytes,
      format,
      lossless: format === 'jpeg' || format === 'png' || format === 'webp',
      removed: [],
      changed: false
    }
  }
  return { data: stripped.data, format, lossless: true, removed: stripped.removed, changed: true }
}

/* ------------------------------------------------------------------ *
 * EXIF reading
 * ------------------------------------------------------------------ */

type TagValue =
  | { kind: 'text'; text: string }
  | { kind: 'numbers'; numbers: readonly number[] }
  | { kind: 'rationals'; pairs: readonly (readonly [number, number])[] }

/** Endianness-aware access to the TIFF block. */
interface TiffAccess {
  byteLength: number
  uint8(offset: number): number
  uint16(offset: number): number
  uint32(offset: number): number
  int32(offset: number): number
}

function createAccess(view: DataView, littleEndian: boolean): TiffAccess {
  return {
    byteLength: view.byteLength,
    uint8: (offset) => view.getUint8(offset),
    uint16: (offset) => view.getUint16(offset, littleEndian),
    uint32: (offset) => view.getUint32(offset, littleEndian),
    int32: (offset) => view.getInt32(offset, littleEndian)
  }
}

interface TagDefinition {
  group: MetadataGroup
  /** Displayed as number with a translation key instead of a raw value. */
  enumerated?: boolean
  /** Normalised to an ISO-like timestamp. */
  date?: boolean
  /** Used for the location block instead of the entry list. */
  hidden?: boolean
  /** Value layout hint for formatting. */
  format?: 'exposure-time' | 'aperture' | 'focal-length' | 'ev' | 'iso' | 'millimetres' | 'degrees' | 'bytes-text'
}

/** IFD0, Exif-IFD and GPS-IFD tags this tool displays. */
const tagDefinitions: Readonly<Record<string, TagDefinition & { ifd: 'ifd0' | 'exif' | 'gps'; id: number }>> = {
  Make: { ifd: 'ifd0', id: 0x010f, group: 'camera' },
  Model: { ifd: 'ifd0', id: 0x0110, group: 'camera' },
  Orientation: { ifd: 'ifd0', id: 0x0112, group: 'image', enumerated: true },
  Software: { ifd: 'ifd0', id: 0x0131, group: 'software' },
  ModifyDate: { ifd: 'ifd0', id: 0x0132, group: 'time', date: true },
  Artist: { ifd: 'ifd0', id: 0x013b, group: 'author' },
  HostComputer: { ifd: 'ifd0', id: 0x013c, group: 'software' },
  ImageDescription: { ifd: 'ifd0', id: 0x010e, group: 'author' },
  Copyright: { ifd: 'ifd0', id: 0x8298, group: 'author' },
  ExposureTime: { ifd: 'exif', id: 0x829a, group: 'exposure', format: 'exposure-time' },
  FNumber: { ifd: 'exif', id: 0x829d, group: 'exposure', format: 'aperture' },
  ExposureProgram: { ifd: 'exif', id: 0x8822, group: 'exposure', enumerated: true },
  ISOSpeedRatings: { ifd: 'exif', id: 0x8827, group: 'exposure', format: 'iso' },
  DateTimeOriginal: { ifd: 'exif', id: 0x9003, group: 'time', date: true },
  CreateDate: { ifd: 'exif', id: 0x9004, group: 'time', date: true },
  OffsetTimeOriginal: { ifd: 'exif', id: 0x9011, group: 'time' },
  ExposureBiasValue: { ifd: 'exif', id: 0x9204, group: 'exposure', format: 'ev' },
  MeteringMode: { ifd: 'exif', id: 0x9207, group: 'exposure', enumerated: true },
  Flash: { ifd: 'exif', id: 0x9209, group: 'exposure', enumerated: true },
  FocalLength: { ifd: 'exif', id: 0x920a, group: 'exposure', format: 'focal-length' },
  UserComment: { ifd: 'exif', id: 0x9286, group: 'author', format: 'bytes-text' },
  ColorSpace: { ifd: 'exif', id: 0xa001, group: 'image', enumerated: true },
  WhiteBalance: { ifd: 'exif', id: 0xa403, group: 'exposure', enumerated: true },
  FocalLengthIn35mmFilm: { ifd: 'exif', id: 0xa405, group: 'exposure', format: 'millimetres' },
  BodySerialNumber: { ifd: 'exif', id: 0xa431, group: 'camera' },
  LensModel: { ifd: 'exif', id: 0xa434, group: 'camera' },
  // Location values feed the coordinate block instead of the entry list.
  GPSLatitudeRef: { ifd: 'gps', id: 0x0001, group: 'location', hidden: true },
  GPSLatitude: { ifd: 'gps', id: 0x0002, group: 'location', hidden: true },
  GPSLongitudeRef: { ifd: 'gps', id: 0x0003, group: 'location', hidden: true },
  GPSLongitude: { ifd: 'gps', id: 0x0004, group: 'location', hidden: true },
  GPSAltitudeRef: { ifd: 'gps', id: 0x0005, group: 'location', hidden: true },
  GPSAltitude: { ifd: 'gps', id: 0x0006, group: 'location', hidden: true },
  GPSImgDirection: { ifd: 'gps', id: 0x0011, group: 'location', format: 'degrees' },
  GPSProcessingMethod: { ifd: 'gps', id: 0x001b, group: 'location', format: 'bytes-text' },
  GPSDateStamp: { ifd: 'gps', id: 0x001d, group: 'time', date: true }
}

const definitionsByIfdAndId = Object.entries(tagDefinitions).reduce<Record<string, string>>((map, [name, definition]) => {
  map[`${definition.ifd}:${definition.id}`] = name
  return map
}, {})

function readEntryValue(access: TiffAccess, entryOffset: number, type: number, count: number, tiffStart: number): TagValue | null {
  const size = typeSizes[type]
  if (!size || count < 0) return null
  const total = size * count
  if (total > 4 * 1024 * 1024) return null
  const inline = total <= 4
  const dataOffset = inline ? entryOffset + 8 : access.uint32(entryOffset + 8)
  const start = inline ? dataOffset : tiffStart + dataOffset
  if (start < 0 || start + total > access.byteLength) return null

  if (type === TYPE_ASCII) {
    let text = ''
    for (let index = 0; index < count; index += 1) {
      const byte = access.uint8(start + index)
      if (byte === 0) break
      text += String.fromCharCode(byte)
    }
    return { kind: 'text', text }
  }

  if (type === TYPE_UNDEFINED || type === TYPE_BYTE) {
    const bytes: number[] = []
    for (let index = 0; index < total; index += 1) bytes.push(access.uint8(start + index))
    return { kind: 'numbers', numbers: bytes }
  }

  const numbers: number[] = []
  const pairs: [number, number][] = []
  for (let index = 0; index < count; index += 1) {
    const position = start + index * size
    if (type === TYPE_SHORT) numbers.push(access.uint16(position))
    else if (type === TYPE_LONG) numbers.push(access.uint32(position))
    else if (type === TYPE_SLONG) numbers.push(access.int32(position))
    else if (type === TYPE_RATIONAL) pairs.push([access.uint32(position), access.uint32(position + 4)])
    else if (type === TYPE_SRATIONAL) pairs.push([access.int32(position), access.int32(position + 4)])
    else return null
  }
  if (pairs.length) return { kind: 'rationals', pairs }
  return { kind: 'numbers', numbers }
}

function readIfd(access: TiffAccess, tiffStart: number, ifdOffset: number, ifd: 'ifd0' | 'exif' | 'gps'): Map<string, TagValue> {
  const tags = new Map<string, TagValue>()
  const base = tiffStart + ifdOffset
  if (base < 0 || base + 2 > access.byteLength) return tags
  const count = access.uint16(base)
  if (count > 512) return tags
  for (let index = 0; index < count; index += 1) {
    const entryOffset = base + 2 + index * 12
    if (entryOffset + 12 > access.byteLength) break
    const id = access.uint16(entryOffset)
    const type = access.uint16(entryOffset + 2)
    const valueCount = access.uint32(entryOffset + 4)
    const name = definitionsByIfdAndId[`${ifd}:${id}`]
    if (!name) continue
    const value = readEntryValue(access, entryOffset, type, valueCount, tiffStart)
    if (value) tags.set(name, value)
  }
  return tags
}

function tiffOffsetOf(bytes: Uint8Array, exifStart: number): number | null {
  if (matches(bytes, exifStart, [0x45, 0x78, 0x69, 0x66, 0x00, 0x00])) return exifStart + 6
  if (matches(bytes, exifStart, [0x49, 0x49, 0x2a, 0x00]) || matches(bytes, exifStart, [0x4d, 0x4d, 0x00, 0x2a])) return exifStart
  return null
}

interface ExifData {
  ifd0: Map<string, TagValue>
  exif: Map<string, TagValue>
  gps: Map<string, TagValue>
}

/** Reads an IFD chain entry holding an offset to a sub-IFD. */
function pointer(access: TiffAccess, tiffStart: number, ifdOffset: number, tag: number): number | null {
  const base = tiffStart + ifdOffset
  if (base < 0 || base + 2 > access.byteLength) return null
  const count = access.uint16(base)
  if (count > 512) return null
  for (let index = 0; index < count; index += 1) {
    const entryOffset = base + 2 + index * 12
    if (entryOffset + 12 > access.byteLength) return null
    if (access.uint16(entryOffset) === tag) return access.uint32(entryOffset + 8)
  }
  return null
}

function readExif(bytes: Uint8Array, exifStart: number): ExifData | null {
  const tiffStart = tiffOffsetOf(bytes, exifStart)
  if (tiffStart === null || tiffStart + 8 > bytes.length) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const byteOrder = view.getUint16(tiffStart, false)
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return null
  const access = createAccess(view, byteOrder === 0x4949)
  const ifd0Offset = access.uint32(tiffStart + 4)
  const ifd0 = readIfd(access, tiffStart, ifd0Offset, 'ifd0')
  const exifIfdOffset = pointer(access, tiffStart, ifd0Offset, TIFF_EXIF_IFD)
  const gpsIfdOffset = pointer(access, tiffStart, ifd0Offset, TIFF_GPS_IFD)
  return {
    ifd0,
    exif: exifIfdOffset === null ? new Map() : readIfd(access, tiffStart, exifIfdOffset, 'exif'),
    gps: gpsIfdOffset === null ? new Map() : readIfd(access, tiffStart, gpsIfdOffset, 'gps')
  }
}

/* ------------------------------------------------------------------ *
 * Value formatting
 * ------------------------------------------------------------------ */

function trimNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0'
  const rounded = Number(value.toFixed(decimals))
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '')
}

function ratioOf(pair: readonly [number, number] | undefined): number | null {
  if (!pair) return null
  const [numerator, denominator] = pair
  if (!denominator) return null
  return numerator / denominator
}

const datePattern = /^(\d{4}):(\d{2}):(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/

function normalizeDate(text: string): string {
  const match = datePattern.exec(text)
  if (!match) return text.trim()
  const [, year, month, day, hour, minute, second] = match
  return hour === undefined ? `${year}-${month}-${day}` : `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/** Decodes EXIF byte strings that carry an 8-byte character-set prefix. */
function decodeTextBytes(numbers: readonly number[]): string {
  const prefix = numbers
    .slice(0, 8)
    .map((byte) => (byte === 0 ? '\0' : String.fromCharCode(byte)))
    .join('')
  const payload = numbers.slice(8)
  if (prefix.startsWith('UNICODE')) {
    try {
      return new TextDecoder('utf-16be').decode(new Uint8Array(payload)).replace(/\0+$/, '').trim()
    } catch {
      return ''
    }
  }
  return payload
    .filter((byte) => byte !== 0)
    .map((byte) => String.fromCharCode(byte))
    .join('')
    .trim()
}

function formatValue(definition: TagDefinition, tag: string, value: TagValue): MetadataEntry | null {
  const group = definition.group
  if (definition.enumerated) {
    const number = value.kind === 'numbers' ? value.numbers[0] : undefined
    if (number === undefined) return null
    return { tag, group, value: String(number), valueKey: `tool.imageMetadata.value.${tag}.${number}` }
  }

  if (value.kind === 'text') {
    const text = definition.date ? normalizeDate(value.text) : value.text.trim()
    return text ? { tag, group, value: text } : null
  }

  if (definition.format === 'bytes-text') {
    const text = value.kind === 'numbers' ? decodeTextBytes(value.numbers) : ''
    return text ? { tag, group, value: text } : null
  }

  if (value.kind === 'numbers') {
    const numbers = value.numbers
    const first = numbers[0]
    if (first === undefined) return null
    const text =
      definition.format === 'millimetres' || definition.format === 'iso'
        ? `${trimNumber(first)}`
        : String(first)
    return { tag, group, value: definition.format === 'millimetres' ? `${text} mm` : text }
  }

  const pairs = value.pairs
  const first = ratioOf(pairs[0])
  if (first === null) return null
  if (definition.format === 'exposure-time') {
    if (first <= 0) return null
    return { tag, group, value: first >= 1 ? `${trimNumber(first)} s` : `1/${Math.round(1 / first)} s` }
  }
  if (definition.format === 'aperture') return { tag, group, value: `f/${trimNumber(first, 1)}` }
  if (definition.format === 'focal-length') return { tag, group, value: `${trimNumber(first, 1)} mm` }
  if (definition.format === 'degrees') return { tag, group, value: `${trimNumber(first, 1)}°` }
  if (definition.format === 'ev') {
    const sign = first > 0 ? '+' : ''
    return { tag, group, value: `${sign}${trimNumber(first, 1)} EV` }
  }
  return { tag, group, value: trimNumber(first) }
}

function positionOf(gps: Map<string, TagValue>): MetadataPosition | null {
  const latitude = gps.get('GPSLatitude')
  const longitude = gps.get('GPSLongitude')
  const latitudeRef = gps.get('GPSLatitudeRef')
  const longitudeRef = gps.get('GPSLongitudeRef')
  const altitude = gps.get('GPSAltitude')
  const altitudeRef = gps.get('GPSAltitudeRef')

  const toDegrees = (value: TagValue | undefined, ref: TagValue | undefined): number | null => {
    if (!value || value.kind !== 'rationals') return null
    const degrees = ratioOf(value.pairs[0])
    const minutes = ratioOf(value.pairs[1])
    const seconds = ratioOf(value.pairs[2])
    if (degrees === null || minutes === null || seconds === null) return null
    const sign = ref && ref.kind === 'text' && /^[SW]$/i.test(ref.text.trim()) ? -1 : 1
    return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600)
  }

  const lat = toDegrees(latitude, latitudeRef)
  const lon = toDegrees(longitude, longitudeRef)
  if (lat === null || lon === null) return null

  let height: number | null = null
  if (altitude && altitude.kind === 'rationals') {
    const metres = ratioOf(altitude.pairs[0])
    if (metres !== null) {
      const below = altitudeRef && altitudeRef.kind === 'numbers' && altitudeRef.numbers[0] === 1
      height = below ? -metres : metres
    }
  }
  return { latitude: lat, longitude: lon, altitude: height }
}

function pngTextEntry(bytes: Uint8Array, offset: number, length: number): MetadataEntry | null {
  const type = ascii(bytes, offset + 4, 4)
  const dataStart = offset + 8
  const keywordEnd = (() => {
    for (let index = 0; index < length; index += 1) {
      if (bytes[dataStart + index] === 0) return index
    }
    return -1
  })()
  if (keywordEnd <= 0) return null
  const keyword = ascii(bytes, dataStart, keywordEnd)
  const known: Readonly<Record<string, { tag: string; group: MetadataGroup }>> = {
    Author: { tag: 'Artist', group: 'author' },
    Copyright: { tag: 'Copyright', group: 'author' },
    Description: { tag: 'ImageDescription', group: 'author' },
    Title: { tag: 'ImageDescription', group: 'author' },
    Software: { tag: 'Software', group: 'software' },
    Comment: { tag: 'UserComment', group: 'author' }
  }
  const definition = known[keyword]
  if (!definition) return null
  if (type === 'tEXt') {
    const text = utf8(bytes, dataStart + keywordEnd + 1, length - keywordEnd - 1).trim()
    return text ? { ...definition, value: text } : null
  }
  if (type === 'iTXt') {
    // keyword \0 compressionFlag \0 compressionMethod language \0 translated \0 text
    const start = dataStart + keywordEnd + 1
    const flag = bytes[start]
    if (flag === 1) return null
    let cursor = start + 3
    const skipToNull = () => {
      while (cursor < dataStart + length && bytes[cursor] !== 0) cursor += 1
      cursor += 1
    }
    skipToNull()
    skipToNull()
    const text = utf8(bytes, cursor, dataStart + length - cursor).trim()
    return text ? { ...definition, value: text } : null
  }
  return null
}

/**
 * Reads the metadata this tool displays. Unreadable or absent metadata is not an
 * error: the report then contains no entries.
 */
export function readMetadata(bytes: Uint8Array): MetadataReport {
  const format = detectImageFormat(bytes)
  const entries: MetadataEntry[] = []
  let position: MetadataPosition | null = null

  if (format === 'jpeg') {
    for (const block of jpegBlocks(bytes)) {
      if (block.kind !== 'exif') continue
      const data = readExif(bytes, block.offset + 4)
      if (data) {
        appendEntries(entries, data)
        position = positionOf(data.gps)
      }
      break
    }
  } else if (format === 'png') {
    for (const block of pngBlocks(bytes)) {
      const type = ascii(bytes, block.offset + 4, 4)
      const length = block.total - 12
      if (type === 'eXIf') {
        const data = readExif(bytes, block.offset + 8)
        if (data) {
          appendEntries(entries, data)
          position = positionOf(data.gps)
        }
      } else if (type === 'tEXt' || type === 'iTXt') {
        const entry = pngTextEntry(bytes, block.offset, length)
        if (entry) entries.push(entry)
      }
    }
  } else if (format === 'webp') {
    for (const block of webpBlocks(bytes)) {
      if (block.kind !== 'webp-exif') continue
      const data = readExif(bytes, block.offset + 8)
      if (data) {
        appendEntries(entries, data)
        position = positionOf(data.gps)
      }
      break
    }
  }

  return { format, entries, position }
}

function appendEntries(entries: MetadataEntry[], data: ExifData): void {
  const order: readonly ('ifd0' | 'exif' | 'gps')[] = ['ifd0', 'exif', 'gps']
  for (const ifd of order) {
    const tags = data[ifd]
    for (const [name, definition] of Object.entries(tagDefinitions)) {
      if (definition.ifd !== ifd || definition.hidden) continue
      const value = tags.get(name)
      if (!value) continue
      const entry = formatValue(definition, name, value)
      if (entry) entries.push(entry)
    }
  }
}
