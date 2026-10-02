/**
 * Geometry for scaling, cropping, rotating and mirroring images.
 *
 * Only numbers are computed here; drawing happens in the web application. The
 * pipeline order is fixed and documented so the preview, the numbers a user
 * types and the rendered result can never disagree:
 *
 *   1. orient  – quarter turns, then mirroring
 *   2. crop    – the crop rectangle refers to the orientated image
 *   3. scale   – to the requested size, aspect ratio preserved on request
 */

export interface Size {
  width: number
  height: number
}

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export type ResizeMode = 'dimensions' | 'percent'

export interface ResizeOptions {
  mode: ResizeMode
  /** Target width in pixels when mode is `dimensions`. */
  width?: number
  /** Target height in pixels when mode is `dimensions`. */
  height?: number
  /** Derive the missing edge from the source so nothing is stretched. */
  lockAspect?: boolean
  /** Target percentage of the cropped size when mode is `percent`. */
  percent?: number
  /** Clockwise quarter turns, 0 to 3. */
  quarterTurns?: number
  flipHorizontal?: boolean
  flipVertical?: boolean
  /** Crop inside the orientated image. Defaults to the whole image. */
  crop?: CropRect | null
}

export interface ResizePlan {
  source: Size
  /** Size after rotation and mirroring. */
  oriented: Size
  quarterTurns: 0 | 1 | 2 | 3
  flipHorizontal: boolean
  flipVertical: boolean
  /** Crop inside the orientated image, always within bounds. */
  crop: CropRect
  target: Size
  /** Target width divided by cropped width. */
  scale: number
  /** True when a requested edge had to be limited to the supported maximum. */
  clamped: boolean
}

/**
 * Browser canvas implementations fail past roughly 10,000 to 16,000 pixels per
 * edge and are limited to 4,096 on some mobile devices. Reaching that limit is
 * reported instead of silently producing a broken canvas.
 */
export const MAX_EDGE = 10000

function whole(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.round(value))
}

/** Coordinates start at zero, unlike sizes. */
function offset(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.round(value))
}

export function orientedSize(source: Size, quarterTurns: number): Size {
  const turns = normalizeTurns(quarterTurns)
  return turns % 2 === 1 ? { width: source.height, height: source.width } : { width: source.width, height: source.height }
}

export function normalizeTurns(quarterTurns: number | undefined): 0 | 1 | 2 | 3 {
  if (quarterTurns === undefined || !Number.isFinite(quarterTurns)) return 0
  const turns = Math.round(quarterTurns) % 4
  return (turns < 0 ? turns + 4 : turns) as 0 | 1 | 2 | 3
}

/** Keeps a crop rectangle inside the image and at least one pixel in size. */
export function clampCrop(crop: CropRect | null | undefined, bounds: Size): CropRect {
  if (!crop) return { x: 0, y: 0, width: bounds.width, height: bounds.height }
  const width = Math.min(whole(crop.width, bounds.width), bounds.width)
  const height = Math.min(whole(crop.height, bounds.height), bounds.height)
  const x = Math.min(offset(crop.x, 0), bounds.width - width)
  const y = Math.min(offset(crop.y, 0), bounds.height - height)
  return { x, y, width, height }
}

/**
 * Computes the whole pipeline. Invalid input falls back to the largest sensible
 * result instead of failing, so a half-typed number never breaks the preview.
 */
export function planResize(source: Size, options: ResizeOptions): ResizePlan {
  const safeSource: Size = { width: whole(source.width, 1), height: whole(source.height, 1) }
  const quarterTurns = normalizeTurns(options.quarterTurns)
  const oriented = orientedSize(safeSource, quarterTurns)
  const crop = clampCrop(options.crop, oriented)

  const ratio = crop.width / crop.height
  let target: Size
  if (options.mode === 'percent') {
    const requested = options.percent
    const usable = Number.isFinite(requested) && (requested ?? 0) > 0
    const factor = (usable ? Math.max(1, Math.round(requested as number)) : 100) / 100
    target = { width: whole(crop.width * factor, crop.width), height: whole(crop.height * factor, crop.height) }
  } else {
    const hasWidth = Number.isFinite(options.width) && (options.width ?? 0) > 0
    const hasHeight = Number.isFinite(options.height) && (options.height ?? 0) > 0
    if (options.lockAspect !== false) {
      // Preserve the cropped aspect ratio, taking whichever edge was given.
      if (hasWidth) {
        const width = whole(options.width, crop.width)
        target = { width, height: whole(width / ratio, crop.height) }
      } else if (hasHeight) {
        const height = whole(options.height, crop.height)
        target = { width: whole(height * ratio, crop.width), height }
      } else {
        target = { width: crop.width, height: crop.height }
      }
    } else {
      target = {
        width: hasWidth ? whole(options.width, crop.width) : crop.width,
        height: hasHeight ? whole(options.height, crop.height) : crop.height
      }
    }
  }

  const clampedWidth = Math.min(target.width, MAX_EDGE)
  const clampedHeight = Math.min(target.height, MAX_EDGE)
  const clamped = clampedWidth !== target.width || clampedHeight !== target.height
  const finalTarget = { width: clampedWidth, height: clampedHeight }

  return {
    source: safeSource,
    oriented,
    quarterTurns,
    flipHorizontal: Boolean(options.flipHorizontal),
    flipVertical: Boolean(options.flipVertical),
    crop,
    target: finalTarget,
    scale: finalTarget.width / crop.width,
    clamped
  }
}

/** Scale factor that fits an image into a preview box without enlarging it. */
export function fitScale(box: Size, image: Size): number {
  if (box.width <= 0 || box.height <= 0 || image.width <= 0 || image.height <= 0) return 1
  return Math.min(1, box.width / image.width, box.height / image.height)
}

/** Source rectangle of the orientated image that ends up in the result. */
export function cropSourceRect(plan: ResizePlan): CropRect {
  return plan.crop
}

/**
 * Position of the crop rectangle as fractions of the orientated image, so the
 * overlay follows the image at any display size instead of assuming one scale.
 */
export function cropBoxFraction(plan: ResizePlan): CropRect {
  return {
    x: plan.crop.x / plan.oriented.width,
    y: plan.crop.y / plan.oriented.height,
    width: plan.crop.width / plan.oriented.width,
    height: plan.crop.height / plan.oriented.height
  }
}
