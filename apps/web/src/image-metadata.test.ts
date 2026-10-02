import { describe, expect, it } from 'vitest'
import { detectImageFormat, findMetadataSegments, readMetadata, stripMetadata } from '@commietools/tools'

/* ------------------------------------------------------------------ *
 * Fixture builders
 * ------------------------------------------------------------------ */

function put16(target: number[], offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >> 8) & 0xff
}

function put32(target: number[], offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >> 8) & 0xff
  target[offset + 2] = (value >> 16) & 0xff
  target[offset + 3] = (value >> 24) & 0xff
}

function putText(target: number[], offset: number, text: string, length: number) {
  for (let index = 0; index < length; index += 1) {
    target[offset + index] = index < text.length ? text.charCodeAt(index) : 0
  }
}

function putRational(target: number[], offset: number, numerator: number, denominator: number) {
  put32(target, offset, numerator)
  put32(target, offset + 4, denominator)
}

/** Builds a little-endian TIFF block with IFD0, an Exif sub-IFD and a GPS IFD. */
function buildTiff(): Uint8Array {
  const ifd0At = 8
  const ifd0Size = 2 + 4 * 12 + 4
  const exifAt = ifd0At + ifd0Size
  const exifSize = 2 + 3 * 12 + 4
  const gpsAt = exifAt + exifSize
  const gpsSize = 2 + 5 * 12 + 4

  let dataAt = gpsAt + gpsSize
  const reserve = (length: number) => {
    if (dataAt % 4) dataAt += 4 - (dataAt % 4)
    const start = dataAt
    dataAt += length
    return start
  }

  const makeAt = reserve(6)
  const modelAt = reserve(7)
  const exposureAt = reserve(8)
  const dateAt = reserve(20)
  const latitudeAt = reserve(24)
  const longitudeAt = reserve(24)
  const altitudeAt = reserve(8)

  const bytes = new Array<number>(dataAt).fill(0)

  // TIFF header: byte order, magic and offset of IFD0.
  bytes[0] = 0x49
  bytes[1] = 0x49
  put16(bytes, 2, 0x002a)
  put32(bytes, 4, ifd0At)

  put16(bytes, ifd0At, 4)
  put16(bytes, ifd0At + 2, 0x010f)
  put16(bytes, ifd0At + 4, 2)
  put32(bytes, ifd0At + 6, 6)
  put32(bytes, ifd0At + 10, makeAt)
  put16(bytes, ifd0At + 14, 0x0110)
  put16(bytes, ifd0At + 16, 2)
  put32(bytes, ifd0At + 18, 7)
  put32(bytes, ifd0At + 22, modelAt)
  put16(bytes, ifd0At + 26, 0x8769)
  put16(bytes, ifd0At + 28, 4)
  put32(bytes, ifd0At + 30, 1)
  put32(bytes, ifd0At + 34, exifAt)
  put16(bytes, ifd0At + 38, 0x8825)
  put16(bytes, ifd0At + 40, 4)
  put32(bytes, ifd0At + 42, 1)
  put32(bytes, ifd0At + 46, gpsAt)

  put16(bytes, exifAt, 3)
  put16(bytes, exifAt + 2, 0x829a)
  put16(bytes, exifAt + 4, 5)
  put32(bytes, exifAt + 6, 1)
  put32(bytes, exifAt + 10, exposureAt)
  put16(bytes, exifAt + 14, 0x9003)
  put16(bytes, exifAt + 16, 2)
  put32(bytes, exifAt + 18, 20)
  put32(bytes, exifAt + 22, dateAt)
  put16(bytes, exifAt + 26, 0x9209)
  put16(bytes, exifAt + 28, 3)
  put32(bytes, exifAt + 30, 1)
  put16(bytes, exifAt + 34, 1)

  put16(bytes, gpsAt, 5)
  put16(bytes, gpsAt + 2, 0x0001)
  put16(bytes, gpsAt + 4, 2)
  put32(bytes, gpsAt + 6, 2)
  bytes[gpsAt + 10] = 0x4e
  put16(bytes, gpsAt + 14, 0x0002)
  put16(bytes, gpsAt + 16, 5)
  put32(bytes, gpsAt + 18, 3)
  put32(bytes, gpsAt + 22, latitudeAt)
  put16(bytes, gpsAt + 26, 0x0003)
  put16(bytes, gpsAt + 28, 2)
  put32(bytes, gpsAt + 30, 2)
  bytes[gpsAt + 34] = 0x45
  put16(bytes, gpsAt + 38, 0x0004)
  put16(bytes, gpsAt + 40, 5)
  put32(bytes, gpsAt + 42, 3)
  put32(bytes, gpsAt + 46, longitudeAt)
  put16(bytes, gpsAt + 50, 0x0006)
  put16(bytes, gpsAt + 52, 5)
  put32(bytes, gpsAt + 54, 1)
  put32(bytes, gpsAt + 58, altitudeAt)

  putText(bytes, makeAt, 'Canon', 6)
  putText(bytes, modelAt, 'EOS R5', 7)
  putRational(bytes, exposureAt, 1, 250)
  putText(bytes, dateAt, '2026:10:02 14:33:12', 20)
  putRational(bytes, latitudeAt, 50, 1)
  putRational(bytes, latitudeAt + 8, 56, 1)
  putRational(bytes, latitudeAt + 16, 1234, 100)
  putRational(bytes, longitudeAt, 6, 1)
  putRational(bytes, longitudeAt + 8, 57, 1)
  putRational(bytes, longitudeAt + 16, 3000, 100)
  putRational(bytes, altitudeAt, 42, 1)

  return new Uint8Array(bytes)
}

function segment(marker: number, payload: readonly number[]): number[] {
  const length = payload.length + 2
  return [0xff, marker, (length >> 8) & 0xff, length & 0xff, ...payload]
}

const pixelData = [0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]

/** JPEG with JFIF, EXIF, ICC and IPTC blocks plus an entropy-coded tail. */
function buildJpeg(): Uint8Array {
  const exif = [...[0x45, 0x78, 0x69, 0x66, 0x00, 0x00], ...buildTiff()]
  const icc = [...'ICC_PROFILE\0'.split('').map((character) => character.charCodeAt(0)), 1, 1, 9, 9]
  return new Uint8Array([
    0xff, 0xd8,
    ...segment(0xe0, [0x4a, 0x46, 0x49, 0x46, 0x00, 1, 1, 0, 0, 1, 0, 1, 0, 0]),
    ...segment(0xe1, exif),
    ...segment(0xe2, icc),
    ...segment(0xed, [0x50, 0x68, 0x6f, 0x74, 0x6f]),
    ...segment(0xda, [3, 1, 0, 2, 17, 3, 17, 0, 63, 0]),
    ...pixelData,
    0xff, 0xd9
  ])
}

function crc32(): number[] {
  return [0, 0, 0, 0]
}

function pngChunk(type: string, payload: number[]): number[] {
  const length = payload.length
  const header = [(length >> 24) & 0xff, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff]
  return [...header, ...type.split('').map((character) => character.charCodeAt(0)), ...payload, ...crc32()]
}

function buildPng(): Uint8Array {
  const text = [...'Author'.split('').map((character) => character.charCodeAt(0)), 0, ...'Ada Lovelace'.split('').map((character) => character.charCodeAt(0))]
  const iccp = [...'ICC'.split('').map((character) => character.charCodeAt(0)), 0, 0, ...pixelData]
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...pngChunk('IHDR', [0, 0, 0, 2, 0, 0, 0, 1, 8, 6, 0, 0, 0]),
    ...pngChunk('iCCP', iccp),
    ...pngChunk('tEXt', text),
    ...pngChunk('IDAT', pixelData),
    ...pngChunk('IEND', [])
  ])
}

function le32(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff]
}

function fourcc(text: string): number[] {
  return text.split('').map((character) => character.charCodeAt(0))
}

function buildWebp(): Uint8Array {
  // VP8X payload: flags, three reserved bytes and the canvas size minus one.
  const vp8x = [...fourcc('VP8X'), ...le32(10), 0x0c, 0, 0, 0, 1, 0, 0, 1, 0, 0]
  const vp8 = [...fourcc('VP8 '), ...le32(pixelData.length), ...pixelData]
  const tiff = buildTiff()
  const exif = [...fourcc('EXIF'), ...le32(tiff.length), ...tiff]
  const xmp = [...fourcc('XMP '), ...le32(4), ...fourcc('<x/>')]
  const body = [...fourcc('WEBP'), ...vp8x, ...vp8, ...exif, ...xmp]
  return new Uint8Array([...fourcc('RIFF'), ...le32(body.length), ...body])
}

/* ------------------------------------------------------------------ *
 * Tests
 * ------------------------------------------------------------------ */

describe('image format detection', () => {
  it('recognises the supported containers', () => {
    expect(detectImageFormat(buildJpeg())).toBe('jpeg')
    expect(detectImageFormat(buildPng())).toBe('png')
    expect(detectImageFormat(buildWebp())).toBe('webp')
    expect(detectImageFormat(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toBe('unknown')
  })
})

describe('metadata discovery', () => {
  it('lists removable blocks without touching colour profiles by default', () => {
    expect(findMetadataSegments(buildJpeg())).toEqual(['exif', 'iptc'])
    expect(findMetadataSegments(buildJpeg(), { keepColorProfiles: false })).toEqual(['exif', 'icc-profile', 'iptc'])
    expect(findMetadataSegments(buildPng())).toEqual(['png-text'])
    expect(findMetadataSegments(buildWebp())).toEqual(['webp-exif', 'webp-xmp'])
  })
})

describe('lossless removal', () => {
  const latin = (data: Uint8Array) => String.fromCharCode(...data)

  it('drops JPEG metadata segments and keeps the pixel data byte for byte', () => {
    const original = buildJpeg()
    const result = stripMetadata(original)

    expect(result.changed).toBe(true)
    expect(result.lossless).toBe(true)
    expect(result.removed).toEqual(['exif', 'iptc'])
    expect(result.data.length).toBeLessThan(original.length)

    // SOI, JFIF and the colour profile survive; the entropy-coded tail is untouched.
    expect([...result.data.subarray(0, 2)]).toEqual([0xff, 0xd8])
    expect(result.data[6]).toBe(0x4a)
    expect(latin(result.data)).toContain('ICC_PROFILE')
    expect(latin(result.data)).not.toContain('Exif')
    expect(latin(result.data)).not.toContain('Photo')
    expect([...result.data.subarray(result.data.length - pixelData.length - 2)]).toEqual([...pixelData, 0xff, 0xd9])
  })

  it('keeps ICC profiles when asked to', () => {
    const result = stripMetadata(buildJpeg(), { keepColorProfiles: false })
    expect(result.removed).toEqual(['exif', 'icc-profile', 'iptc'])
    expect(latin(result.data)).not.toContain('ICC_PROFILE')
  })

  it('drops PNG text chunks and keeps every image chunk in order', () => {
    const original = buildPng()
    const result = stripMetadata(original)

    expect(result.removed).toEqual(['png-text'])
    expect(result.data.length).toBeLessThan(original.length)
    expect([...result.data.subarray(0, 8)]).toEqual([...original.subarray(0, 8)])

    const types: string[] = []
    let offset = 8
    while (offset + 12 <= result.data.length) {
      const length =
        ((result.data[offset] ?? 0) << 24) | ((result.data[offset + 1] ?? 0) << 16) | ((result.data[offset + 2] ?? 0) << 8) | (result.data[offset + 3] ?? 0)
      types.push(String.fromCharCode(...result.data.subarray(offset + 4, offset + 8)))
      offset += 12 + length
    }
    expect(types).toEqual(['IHDR', 'iCCP', 'IDAT', 'IEND'])
  })

  it('drops WebP metadata chunks, fixes the RIFF size and clears VP8X flags', () => {
    const original = buildWebp()
    const result = stripMetadata(original)

    expect(result.removed).toEqual(['webp-exif', 'webp-xmp'])
    const size = (result.data[4] ?? 0) | ((result.data[5] ?? 0) << 8) | ((result.data[6] ?? 0) << 16) | ((result.data[7] ?? 0) << 24)
    expect(size).toBe(result.data.length - 8)
    expect(result.data[20]).toBe(0x00)
  })

  it('returns the input unchanged when there is nothing to remove', () => {
    const stripped = stripMetadata(buildJpeg()).data
    const again = stripMetadata(stripped)
    expect(again.changed).toBe(false)
    expect(again.data).toBe(stripped)
  })
})

describe('metadata reading', () => {
  it('reads camera, exposure, time and GPS values from JPEG EXIF', () => {
    const report = readMetadata(buildJpeg())
    const values = new Map(report.entries.map((entry) => [entry.tag, entry.value]))

    expect(report.format).toBe('jpeg')
    expect(values.get('Make')).toBe('Canon')
    expect(values.get('Model')).toBe('EOS R5')
    expect(values.get('ExposureTime')).toBe('1/250 s')
    expect(values.get('DateTimeOriginal')).toBe('2026-10-02 14:33:12')
    expect(values.get('Flash')).toBe('1')
    expect(report.entries.find((entry) => entry.tag === 'Flash')?.valueKey).toBe('tool.imageMetadata.value.Flash.1')

    expect(report.position?.latitude).toBeCloseTo(50.936761, 5)
    expect(report.position?.longitude).toBeCloseTo(6.958333, 5)
    expect(report.position?.altitude).toBe(42)
  })

  it('reads PNG text chunks and WebP EXIF', () => {
    const png = readMetadata(buildPng())
    expect(png.entries).toEqual([{ tag: 'Artist', group: 'author', value: 'Ada Lovelace' }])

    const webp = readMetadata(buildWebp())
    expect(webp.entries.some((entry) => entry.tag === 'Model')).toBe(true)
    expect(webp.position?.latitude).toBeCloseTo(50.936761, 5)
  })

  it('reports nothing for images without metadata instead of failing', () => {
    const blank = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const report = readMetadata(blank)
    expect(report.entries).toEqual([])
    expect(report.position).toBe(null)
  })
})
