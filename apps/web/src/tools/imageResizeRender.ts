import createPica from 'pica'
import type { ResizePlan } from '@commietools/tools'

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp'

export interface RenderOptions {
  format: OutputFormat
  /** Quality for lossy formats, 0 to 1. */
  quality: number
}

function contextOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('no-2d-context')
  return context
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Draws the source image in its target orientation: quarter turns first, then
 * mirroring, both around the centre of the orientated canvas.
 */
function drawOrientated(context: CanvasRenderingContext2D, image: HTMLImageElement, plan: ResizePlan): void {
  const plain = plan.quarterTurns === 0 && !plan.flipHorizontal && !plan.flipVertical
  if (plain) {
    context.drawImage(image, 0, 0, plan.oriented.width, plan.oriented.height)
    return
  }
  context.save()
  context.translate(plan.oriented.width / 2, plan.oriented.height / 2)
  context.rotate((Math.PI / 2) * plan.quarterTurns)
  context.scale(plan.flipHorizontal ? -1 : 1, plan.flipVertical ? -1 : 1)
  context.drawImage(image, -plan.source.width / 2, -plan.source.height / 2, plan.source.width, plan.source.height)
  context.restore()
}

function isWholeImage(plan: ResizePlan): boolean {
  return plan.crop.x === 0 && plan.crop.y === 0 && plan.crop.width === plan.oriented.width && plan.crop.height === plan.oriented.height
}

/**
 * Draws the source image in its target orientation onto a fresh canvas, used for
 * the live preview. Quarter turns first, then mirroring.
 */
export function renderOrientationPreview(image: HTMLImageElement, plan: ResizePlan): HTMLCanvasElement {
  const canvas = createCanvas(plan.oriented.width, plan.oriented.height)
  drawOrientated(contextOf(canvas), image, plan)
  return canvas
}

/**
 * Runs the described pipeline and returns the encoded result. Scaling is done by
 * pica, which filters in high quality and can offload to a web worker.
 */
export async function renderPlan(image: HTMLImageElement, plan: ResizePlan, options: RenderOptions): Promise<Blob> {
  const pica = createPica()
  const orientated = createCanvas(plan.oriented.width, plan.oriented.height)
  drawOrientated(contextOf(orientated), image, plan)

  let source = orientated
  if (!isWholeImage(plan)) {
    const cropped = createCanvas(plan.crop.width, plan.crop.height)
    contextOf(cropped).drawImage(orientated, -plan.crop.x, -plan.crop.y)
    source = cropped
  }

  const sameSize = source.width === plan.target.width && source.height === plan.target.height
  if (sameSize) return await pica.toBlob(source, options.format, options.quality)

  const target = createCanvas(plan.target.width, plan.target.height)
  await pica.resize(source, target)
  return await pica.toBlob(target, options.format, options.quality)
}
