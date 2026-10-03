import createPica from 'pica'
import { ICO_MAX_SIZE, MASKABLE_SAFE_ZONE, buildIco, normalizeSizes, planIcon, type IconFit } from '@commietools/tools'

export interface IconRenderOptions {
  sizes: readonly number[]
  fit: IconFit
  /** CSS colour for padded edges; `null` keeps them transparent. */
  background: string | null
  maskable: boolean
  /** The maskable variant must be opaque, so it always gets a colour. */
  maskableBackground: string
}

export interface RenderedIcon {
  size: number
  maskable: boolean
  blob: Blob
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function contextOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('no-2d-context')
  return context
}

/**
 * Draws one square at the requested size: the source image is scaled with pica
 * to the size the plan asks for and placed at the planned offset. With `cover`
 * that rectangle is larger than the square, so the canvas crops it.
 */
async function buildSquare(
  image: HTMLImageElement,
  size: number,
  fit: IconFit,
  background: string | null,
  contentScale: number,
  pica: ReturnType<typeof createPica>
): Promise<HTMLCanvasElement> {
  const plan = planIcon(
    { width: image.naturalWidth, height: image.naturalHeight },
    size,
    { fit, contentScale }
  )

  const square = createCanvas(size, size)
  const context = contextOf(square)
  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, size, size)
  }
  if (plan.draw.width <= 0 || plan.draw.height <= 0) return square

  const source = createCanvas(image.naturalWidth, image.naturalHeight)
  contextOf(source).drawImage(image, 0, 0)

  let scaled = source
  if (source.width !== plan.draw.width || source.height !== plan.draw.height) {
    scaled = createCanvas(plan.draw.width, plan.draw.height)
    await pica.resize(source, scaled)
  }
  context.drawImage(scaled, plan.draw.x, plan.draw.y)
  return square
}

async function squareToBlob(
  square: HTMLCanvasElement,
  size: number,
  pica: ReturnType<typeof createPica>
): Promise<Blob> {
  if (square.width === size) return await pica.toBlob(square, 'image/png', 1)
  const target = createCanvas(size, size)
  await pica.resize(square, target)
  return await pica.toBlob(target, 'image/png', 1)
}

/**
 * Renders the whole set. The largest size is scaled once from the original and
 * every smaller size is taken from that square, so a large photo is not decoded
 * and filtered again for each of the smaller icons.
 */
export async function renderIconSet(image: HTMLImageElement, options: IconRenderOptions): Promise<RenderedIcon[]> {
  const sizes = normalizeSizes(options.sizes)
  if (!sizes.length) return []
  const pica = createPica()
  const largest = Math.max(...sizes)
  const results: RenderedIcon[] = []

  const plain = await buildSquare(image, largest, options.fit, options.background, 1, pica)
  for (const size of sizes) {
    results.push({ size, maskable: false, blob: await squareToBlob(plain, size, pica) })
  }

  if (options.maskable) {
    const masked = await buildSquare(image, largest, options.fit, options.maskableBackground, MASKABLE_SAFE_ZONE, pica)
    for (const size of sizes) {
      results.push({ size, maskable: true, blob: await squareToBlob(masked, size, pica) })
    }
  }

  return results
}

/**
 * Collects the frames for favicon.ico. The format describes edges up to 256
 * pixels in a single byte, so larger sizes are skipped instead of being written
 * with a wrong size.
 */
export async function buildIcoBlob(icons: readonly RenderedIcon[]): Promise<Blob | null> {
  const frames: Uint8Array[] = []
  for (const icon of icons) {
    if (icon.maskable || icon.size > ICO_MAX_SIZE) continue
    frames.push(new Uint8Array(await icon.blob.arrayBuffer()))
  }
  if (!frames.length) return null
  return new Blob([new Uint8Array(buildIco(frames))], { type: 'image/x-icon' })
}
