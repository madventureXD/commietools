import { markSize, placeWatermark, type WatermarkBox, type WatermarkOptions } from '@commietools/tools'

/**
 * Font size a text mark is measured at. The plan scales the mark to a share of
 * the image's short edge, so measuring once at a fixed reference size keeps the
 * geometry independent of the final size.
 */
const REFERENCE_FONT_SIZE = 100

export type MarkSource =
  | { kind: 'text'; text: string; font: string; colour: string }
  | { kind: 'logo'; image: HTMLImageElement }

export interface WatermarkRenderOptions extends WatermarkOptions {
  /** 0 to 1. */
  opacity: number
  format: 'image/jpeg' | 'image/png' | 'image/webp'
  quality: number
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

function contextOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('no-2d-context')
  return context
}

function fontSpec(source: Extract<MarkSource, { kind: 'text' }>, size: number): string {
  return `${size}px ${source.font}`
}

/** Size of the mark at the reference font size, measured on a throwaway canvas. */
export function measureMark(mark: MarkSource): { width: number; height: number } {
  if (mark.kind === 'logo') {
    return {
      width: Math.max(1, mark.image.naturalWidth || 1),
      height: Math.max(1, mark.image.naturalHeight || 1)
    }
  }
  const context = contextOf(createCanvas(8, 8))
  context.font = fontSpec(mark, REFERENCE_FONT_SIZE)
  const metrics = context.measureText(mark.text || ' ')
  const ascent = metrics.actualBoundingBoxAscent
  const descent = metrics.actualBoundingBoxDescent
  const height = Number.isFinite(ascent) && Number.isFinite(descent) && ascent + descent > 0
    ? ascent + descent
    : REFERENCE_FONT_SIZE
  return { width: Math.max(1, metrics.width), height: Math.max(1, height) }
}

/**
 * Draws one mark into an axis-aligned box, rotated around the box centre. The
 * box keeps the size the plan asked for; a text mark is scaled so its line is
 * exactly as wide as the box.
 */
export function drawMark(
  context: CanvasRenderingContext2D,
  mark: MarkSource,
  box: WatermarkBox,
  rotation: number,
  opacity: number
): void {
  context.save()
  context.globalAlpha = opacity
  context.translate(box.x + box.width / 2, box.y + box.height / 2)
  context.rotate((rotation * Math.PI) / 180)

  if (mark.kind === 'logo') {
    context.drawImage(mark.image, -box.width / 2, -box.height / 2, box.width, box.height)
  } else {
    const measured = measureMark(mark)
    const size = (REFERENCE_FONT_SIZE * box.width) / measured.width
    context.font = fontSpec(mark, size)
    context.fillStyle = mark.colour
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(mark.text, 0, 0)
  }
  context.restore()
}

/**
 * Draws the image at full size and stamps the mark on it. The geometry comes
 * from the shared plan, so the preview and the saved file place the mark
 * identically.
 */
export async function renderWatermark(
  image: HTMLImageElement,
  mark: MarkSource,
  options: WatermarkRenderOptions
): Promise<Blob> {
  const canvas = createCanvas(image.naturalWidth, image.naturalHeight)
  const context = contextOf(canvas)
  context.drawImage(image, 0, 0)

  const measured = measureMark(mark)
  const boxes = placeWatermark(
    { width: canvas.width, height: canvas.height },
    measured,
    options
  )
  for (const box of boxes) drawMark(context, mark, box, options.rotation, options.opacity)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('encoding-failed'))),
      options.format,
      options.quality
    )
  })
}

/** Size the mark will have on the full image, for the summary line. */
export function plannedMarkSize(image: HTMLImageElement, mark: MarkSource, scale: number) {
  return markSize(
    { width: image.naturalWidth, height: image.naturalHeight },
    measureMark(mark),
    scale
  )
}
