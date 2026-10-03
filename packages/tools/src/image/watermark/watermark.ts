/**
 * Geometry of a text or logo watermark.
 *
 * Only numbers are computed here; drawing happens in the web application. The
 * mark is described by its measured size, so the same module serves a rendered
 * text line and an uploaded logo:
 *
 *   markSize   – scales the mark to the requested share of the short edge
 *   placements – where the mark (or the tile grid) sits on the image
 *
 * The returned boxes stay axis-aligned. Rotation is applied when drawing,
 * around the centre of each box — turning the box instead would make the
 * preview and the result disagree about where the corners are.
 */

import type { Size } from '../resize/resize'

export type WatermarkAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'

/** Reading order: rows from top to bottom, columns from left to right. */
export const WATERMARK_ANCHORS: readonly WatermarkAnchor[] = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right'
]

export interface WatermarkBox {
  x: number
  y: number
  width: number
  height: number
}

export interface WatermarkOptions {
  anchor: WatermarkAnchor
  /** Mark width as a share of the image's shorter edge. */
  scale: number
  /** Distance from the edge as a share of the image's shorter edge. */
  margin: number
  /** Clockwise rotation in degrees. */
  rotation: number
  /** Repeat the mark over the whole image instead of placing it once. */
  tiled: boolean
  /** Gap between tiles as a share of the mark's own size. */
  spacing: number
}

/** Smallest share of the short edge a mark may take; below this it is unreadable. */
export const MIN_SCALE = 0.02
/** Largest share; at 1 the mark spans the whole short edge. */
export const MAX_SCALE = 1

export function clampOpacity(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 1
  return Math.min(1, Math.max(0, value))
}

export function clampScale(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return MIN_SCALE
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
}

/** Rotation is normalised to a half turn, so ±180 and 180 mean the same. */
export function normalizeRotation(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0
  const degrees = Math.round(value) % 360
  if (degrees > 180) return degrees - 360
  if (degrees <= -180) return degrees + 360
  return degrees
}

export function clampSpacing(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0.5
  return Math.min(4, Math.max(0, value))
}

function whole(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.max(1, Math.round(value))
}

function shortEdge(source: Size): number {
  return Math.max(1, Math.min(whole(source.width, 1), whole(source.height, 1)))
}

/**
 * Scales a mark to the requested share of the image's shorter edge, keeping its
 * own aspect ratio. An unmeasurable mark falls back to a square.
 */
export function markSize(source: Size, mark: Size, scale: number): Size {
  const target = Math.round(shortEdge(source) * clampScale(scale))
  const width = Math.max(1, target)
  const ratio = Number.isFinite(mark.width) && Number.isFinite(mark.height) && mark.width > 0 && mark.height > 0
    ? mark.height / mark.width
    : 1
  return { width, height: Math.max(1, Math.round(width * ratio)) }
}

/**
 * The anchors are read in reading order, so the index carries both coordinates:
 * the column (index % 3) decides left/centre/right, the row (index / 3) decides
 * top/middle/bottom.
 */
function alongAxis(position: 0 | 1 | 2, extent: number, mark: number, gap: number): number {
  if (position === 0) return gap
  if (position === 2) return Math.max(gap, extent - mark - gap)
  return Math.round((extent - mark) / 2)
}

/**
 * Places the mark once at the chosen anchor. The result is a single box; with
 * `tiled` the whole image is covered instead.
 */
export function placeWatermark(source: Size, mark: Size, options: WatermarkOptions): WatermarkBox[] {
  const canvas: Size = { width: whole(source.width, 1), height: whole(source.height, 1) }
  const size = markSize(canvas, mark, options.scale)
  const gap = Math.round(shortEdge(canvas) * Math.min(0.4, Math.max(0, Number.isFinite(options.margin) ? options.margin : 0)))
  if (!options.tiled) return [singlePlacement(canvas, size, gap, options.anchor)]
  return tiledPlacements(canvas, size, clampSpacing(options.spacing), normalizeRotation(options.rotation))
}

function singlePlacement(canvas: Size, size: Size, gap: number, anchor: WatermarkAnchor): WatermarkBox {
  const index = Math.max(0, WATERMARK_ANCHORS.indexOf(anchor))
  const column = (index % 3) as 0 | 1 | 2
  const row = Math.floor(index / 3) as 0 | 1 | 2
  // A large mark with a large edge distance would stick out; the gap gives way.
  const gapX = Math.min(gap, Math.max(0, Math.floor((canvas.width - size.width) / 2)))
  const gapY = Math.min(gap, Math.max(0, Math.floor((canvas.height - size.height) / 2)))
  return {
    x: alongAxis(column, canvas.width, size.width, gapX),
    y: alongAxis(row, canvas.height, size.height, gapY),
    width: size.width,
    height: size.height
  }
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** True when a circle around `centre` can still reach the image rectangle. */
function reachesImage(centreX: number, centreY: number, radius: number, canvas: Size): boolean {
  const dx = centreX < 0 ? -centreX : centreX > canvas.width ? centreX - canvas.width : 0
  const dy = centreY < 0 ? -centreY : centreY > canvas.height ? centreY - canvas.height : 0
  return dx * dx + dy * dy <= radius * radius
}

/**
 * Covers the whole image with a rotated grid.
 *
 * The grid is built over a square the size of the image's diagonal, centred on
 * the image, and then turned by the mark's rotation. That way the tiles stay
 * square to the mark at any angle, and rotating never leaves a bare corner.
 * Tiles that cannot touch the image are dropped.
 */
function tiledPlacements(canvas: Size, size: Size, spacing: number, rotation: number): WatermarkBox[] {
  // A text mark is much wider than it is tall, so its own height would stack the
  // rows far tighter than the columns. The row step therefore keeps at least
  // half the mark's width as breathing room.
  const rowHeight = Math.max(size.height, Math.round(size.width * 0.5))
  const stepX = size.width * (1 + spacing)
  const stepY = rowHeight * (1 + spacing)
  const diagonal = Math.ceil(Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height))
  const columns = Math.ceil(diagonal / stepX) + 1
  const rows = Math.ceil(diagonal / stepY) + 1
  const centreX = canvas.width / 2
  const centreY = canvas.height / 2
  const radius = Math.sqrt(size.width * size.width + size.height * size.height) / 2
  const angle = toRadians(rotation)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const boxes: WatermarkBox[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const localX = (column - (columns - 1) / 2) * stepX
      const localY = (row - (rows - 1) / 2) * stepY
      const offsetX = localX * cos - localY * sin
      const offsetY = localX * sin + localY * cos
      const x = centreX + offsetX - size.width / 2
      const y = centreY + offsetY - size.height / 2
      if (!reachesImage(x + size.width / 2, y + size.height / 2, radius, canvas)) continue
      boxes.push({ x: Math.round(x), y: Math.round(y), width: size.width, height: size.height })
    }
  }
  return boxes
}
