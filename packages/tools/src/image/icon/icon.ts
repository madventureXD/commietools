/**
 * Icon and favicon sets: the geometry of the target squares and the Windows ICO
 * container.
 *
 * Only numbers and bytes are computed here; drawing happens in the web
 * application. Two things are deliberately fixed in this module:
 *
 *   1. A maskable icon does not draw edge to edge. The artwork is shrunk into
 *      the safe zone (a circle of 80 % of the shorter edge), because Android
 *      crops maskable icons into the shape the launcher wants.
 *   2. The ICO container embeds complete PNG files. Windows has read PNG frames
 *      since Vista and derives the transparency mask from the alpha channel
 *      itself, so no separate bitmap mask is written.
 */

import type { Size } from '../resize/resize'

export interface IconBox {
  x: number
  y: number
  width: number
  height: number
}

/** `cover` fills the square and crops, `contain` fits it and leaves the rest to the background. */
export type IconFit = 'cover' | 'contain'

export interface IconPlanItem {
  /** Edge length of the square output. */
  size: number
  fit: IconFit
  /** Share of the square the artwork occupies; 1 means edge to edge. */
  contentScale: number
  /**
   * Where the source image is drawn on the square, in output pixels. With
   * `cover` this rectangle may extend beyond the square; the canvas clips it.
   */
  draw: IconBox
}

export interface IconPlanOptions {
  fit?: IconFit
  /** Shrinks the artwork towards the centre; 0.8 is the maskable safe zone. */
  contentScale?: number
}

/**
 * Sizes a web project usually needs: Windows' icon ladder, the sizes taken from
 * the web app manifest specification, and 180 px for the Apple touch icon.
 */
export const ICON_SIZES = [16, 20, 24, 32, 40, 48, 64, 96, 128, 180, 192, 256, 512] as const

/** Share of the shorter edge that stays visible in any maskable icon mask. */
export const MASKABLE_SAFE_ZONE = 0.8

/**
 * An ICO directory entry stores the edge length in a single byte, where 0 means
 * 256. Larger frames cannot be described and would be read as a different size.
 */
export const ICO_MAX_SIZE = 256

export type IconErrorCode = 'no-frames' | 'too-many-frames' | 'not-a-png' | 'unsupported-size'

export class IconError extends Error {
  readonly code: IconErrorCode

  constructor(code: IconErrorCode) {
    super(code)
    this.name = 'IconError'
    this.code = code
  }
}

/** Keeps a list of requested sizes whole, unique, ascending and non-empty. */
export function normalizeSizes(sizes: readonly number[]): number[] {
  const seen = new Set<number>()
  const result: number[] = []
  for (const size of sizes) {
    if (!Number.isFinite(size)) continue
    const whole = Math.round(size)
    if (whole < 1 || seen.has(whole)) continue
    seen.add(whole)
    result.push(whole)
  }
  return result.sort((left, right) => left - right)
}

/** The subset of sizes an ICO container can describe. */
export function icoSizes(sizes: readonly number[]): number[] {
  return normalizeSizes(sizes).filter((size) => size <= ICO_MAX_SIZE)
}

function clampContentScale(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 1
  return Math.min(1, Math.max(0.1, value))
}

/**
 * Computes where one source image lands on a square of the requested size.
 * Invalid input falls back to a usable plan instead of failing, so a
 * half-finished form never breaks the preview.
 */
export function planIcon(source: Size, size: number, options: IconPlanOptions = {}): IconPlanItem {
  const square = Math.max(1, Math.round(size) || 1)
  const fit: IconFit = options.fit === 'contain' ? 'contain' : 'cover'
  const contentScale = clampContentScale(options.contentScale)
  const sourceWidth = Math.max(1, Math.round(source.width) || 1)
  const sourceHeight = Math.max(1, Math.round(source.height) || 1)

  const base = fit === 'cover'
    ? Math.max(square / sourceWidth, square / sourceHeight)
    : Math.min(square / sourceWidth, square / sourceHeight)
  const scale = base * contentScale
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  return {
    size: square,
    fit,
    contentScale,
    draw: {
      x: Math.round((square - width) / 2),
      y: Math.round((square - height) / 2),
      width,
      height
    }
  }
}

export function planIcons(source: Size, sizes: readonly number[], options: IconPlanOptions = {}): IconPlanItem[] {
  return normalizeSizes(sizes).map((size) => planIcon(source, size, options))
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const

/**
 * Reads width and height from a PNG's IHDR chunk, or returns `null` when the
 * bytes are not a PNG. Used instead of trusting a caller's size argument, so a
 * frame's declared size and its content can never disagree.
 */
export function readPngSize(data: Uint8Array): Size | null {
  if (data.byteLength < 24) return null
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (view.getUint8(index) !== PNG_SIGNATURE[index]) return null
  }
  // The first chunk must be IHDR: length 13, then the four type bytes.
  if (view.getUint32(8, false) !== 13) return null
  const type = String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15))
  if (type !== 'IHDR') return null
  const width = view.getUint32(16, false)
  const height = view.getUint32(20, false)
  if (!width || !height) return null
  return { width, height }
}

/**
 * Builds a Windows ICO file from complete PNG frames.
 *
 * Layout: a six byte ICONDIR (reserved, type, count), then one 16 byte
 * ICONDIRENTRY per frame, then all image data in the same order. Every value is
 * little-endian, as the format requires.
 */
export function buildIco(frames: readonly Uint8Array[]): Uint8Array {
  if (!frames.length) throw new IconError('no-frames')
  if (frames.length > 0xffff) throw new IconError('too-many-frames')

  const items = frames.map((data) => {
    const size = readPngSize(data)
    if (!size) throw new IconError('not-a-png')
    if (size.width > ICO_MAX_SIZE || size.height > ICO_MAX_SIZE) throw new IconError('unsupported-size')
    return { data, size }
  })

  const headerSize = 6 + items.length * 16
  const output = new Uint8Array(items.reduce((total, item) => total + item.data.byteLength, headerSize))
  const view = new DataView(output.buffer)
  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true) // 1 marks an icon, 2 would mark a cursor
  view.setUint16(4, items.length, true)

  let offset = headerSize
  items.forEach((item, index) => {
    const entry = 6 + index * 16
    // 0 stands for 256, the largest edge the directory can describe.
    output[entry] = item.size.width === ICO_MAX_SIZE ? 0 : item.size.width
    output[entry + 1] = item.size.height === ICO_MAX_SIZE ? 0 : item.size.height
    output[entry + 2] = 0 // colour count: 0 for true colour
    output[entry + 3] = 0 // reserved
    view.setUint16(entry + 4, 1, true) // colour planes
    view.setUint16(entry + 6, 32, true) // bits per pixel
    view.setUint32(entry + 8, item.data.byteLength, true)
    view.setUint32(entry + 12, offset, true)
    output.set(item.data, offset)
    offset += item.data.byteLength
  })

  return output
}

export interface ManifestIconEntry {
  /** File name as it will sit next to the manifest. */
  file: string
  size: number
  purpose?: 'any' | 'maskable'
}

/**
 * The `icons` array of a web app manifest. Its keys and the two purpose values
 * are fixed by the manifest specification and are not display text.
 */
export function buildManifestIcons(entries: readonly ManifestIconEntry[]): string {
  const icons = entries.map((entry) => ({
    src: entry.file,
    sizes: `${entry.size}x${entry.size}`,
    type: 'image/png',
    purpose: entry.purpose ?? 'any'
  }))
  return JSON.stringify(icons, null, 2)
}
