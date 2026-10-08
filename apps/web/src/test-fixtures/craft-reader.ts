import { getDocument, GlobalWorkerOptions, OPS } from 'pdfjs-dist'
import { captionLayout, type CaptionPhoto } from '../../../../packages/tools/src/image/caption'
import { loadImage, renderCaptioned } from '../tools/captionRender'

GlobalWorkerOptions.workerSrc = '/audit-pdf-worker.mjs'
export async function readPdfBlob(blob: Blob, renderPages = true) {
  const loading = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
  try {
    const pdf = await loading.promise
    const pages = []
    for (let n = 1; n <= pdf.numPages; n += 1) {
      const page = await pdf.getPage(n)
      const text = await page.getTextContent()
      const ops = await page.getOperatorList()
      const canvas = document.createElement('canvas')
      const viewport = page.getViewport({ scale: 0.5 })
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height)
      if (renderPages) await page.render({ canvas, viewport }).promise
      const pixel = [...canvas.getContext('2d')!.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data]
      const imageOps = ops.fnArray.map((op, index) => ({ name: Object.entries(OPS).find(([, value]) => value === op)?.[0] ?? '', index })).filter((entry) => entry.name.startsWith('paintImage'))
      const images = imageOps.reduce((count, entry) => {
        if (entry.name.endsWith('Repeat')) return count + (ops.argsArray[entry.index]?.[3]?.length ?? 2) / 2
        if (entry.name.endsWith('Group')) return count + (ops.argsArray[entry.index]?.[0]?.length ?? 1)
        return count + 1
      }, 0)
      pages.push({ text: text.items.map((item) => 'str' in item ? item.str : '').join(' '), images, imageOps: imageOps.map((entry) => entry.name), center: pixel })
      canvas.width = 0; canvas.height = 0
    }
    return pages
  } finally { await loading.destroy() }
}
export async function compareCaptionPixels(blob: Blob) {
  const image = await loadImage(blob)
  const photo: CaptionPhoto = { id: 'pixel-audit', name: 'foreign', note: 'Auditmarke', timestamp: '2008-05-30 15:56', timestampFromExif: true, timestampSource: 'DateTimeOriginal', arrow: null }
  const result = await loadImage(await renderCaptioned(photo, image, 'image/png', 1))
  const pixels = (value: HTMLImageElement) => {
    const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight
    canvas.getContext('2d')!.drawImage(value, 0, 0)
    return canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
  }
  const original = pixels(image); const changed = pixels(result)
  const height = image.naturalHeight; const width = image.naturalWidth
  const bandStart = height - Math.round(height * captionLayout().bandFraction)
  let outside = 0; let inside = 0
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const index = (y * width + x) * 4
    if (original.subarray(index, index + 4).some((value, channel) => value !== changed[index + channel])) {
      if (y < bandStart) outside += 1; else inside += 1
    }
  }
  if (outside !== 0 || inside === 0) throw new Error(`Pixel preservation failed: ${outside} outside/${inside} inside`)
  return { width, height, bandStart, outside, inside, output: 'lossless PNG; no arrow in this preservation probe' }
}
export async function colourImage(colour: string, width: number, height: number) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
  const context = canvas.getContext('2d')!; context.fillStyle = colour; context.fillRect(0, 0, width, height)
  const blob = await new Promise<Blob>((done) => canvas.toBlob((value) => done(value!), 'image/png'))
  canvas.width = 0; canvas.height = 0
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let start = 0; start < bytes.length; start += 32768) binary += String.fromCharCode(...bytes.subarray(start, start + 32768))
  return btoa(binary)
}
