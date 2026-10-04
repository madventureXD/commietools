import { useEffect, useState } from 'react'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PdfToolError, type PdfInspection } from '@commietools/tools/pdf/core'

export type Translate = (key: string) => string

export interface LoadedPdf {
  readonly id: string
  readonly name: string
  readonly bytes: Uint8Array
  readonly inspection: PdfInspection
}

export function pdfErrorKey(error: unknown): string {
  if (error instanceof PdfToolError) return `tool.pdf.error.${error.code}`
  return 'tool.pdf.error.generic'
}

export function baseName(name: string): string {
  return name.replace(/\.pdf$/iu, '') || 'document'
}

export function PdfWarnings({ inspection, t }: { inspection: PdfInspection; t: Translate }) {
  const warnings = [
    inspection.hasSignatures && 'tool.pdf.warning.signature',
    inspection.hasXfa && 'tool.pdf.warning.xfa',
    inspection.hasForms && !inspection.hasXfa && 'tool.pdf.warning.forms',
    inspection.hasAnnotations && 'tool.pdf.warning.annotations'
  ].filter(Boolean) as string[]
  if (!warnings.length) return null
  return <div className="pdf-warnings">{warnings.map((key) => <p className="warning" key={key}>{t(key)}</p>)}</div>
}

export function usePdfThumbnails(bytes: Uint8Array | null, maxWidth = 150) {
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState(false)
  useEffect(() => {
    let cancelled = false
    if (!bytes) {
      setImages([])
      return
    }
    setError(false)
    let task: { destroy: () => Promise<void> } | undefined
    void import('pdfjs-dist').then(async ({ GlobalWorkerOptions, getDocument }) => {
      GlobalWorkerOptions.workerSrc = workerUrl
      const loadingTask = getDocument({ data: bytes.slice() })
      task = loadingTask
      const document = await loadingTask.promise
      const next: string[] = []
      for (let number = 1; number <= document.numPages; number += 1) {
        if (cancelled) break
        const page = await document.getPage(number)
        const original = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: maxWidth / original.width })
        const canvas = window.document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas unavailable')
        await page.render({ canvas, canvasContext: context, viewport }).promise
        next.push(canvas.toDataURL('image/webp', 0.8))
        page.cleanup()
        if (!cancelled) setImages([...next])
      }
      document.cleanup()
    }).catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
      if (task) void task.destroy()
    }
  }, [bytes, maxWidth])
  return { images, error }
}

export function useDownload(bytes: Uint8Array | null) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!bytes) {
      setUrl('')
      return
    }
    const blobBytes = new Uint8Array(bytes)
    const next = URL.createObjectURL(new Blob([blobBytes], { type: 'application/pdf' }))
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [bytes])
  return url
}

export interface RenderedPdfPage {
  readonly pageNumber: number
  readonly blob: Blob
  readonly width: number
  readonly height: number
}

export interface ExtractedPdfPage {
  readonly pageNumber: number
  readonly text: string
}

export async function extractPdfText(bytes: Uint8Array, pages?: readonly number[]): Promise<ExtractedPdfPage[]> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = workerUrl
  const task = getDocument({ data: bytes.slice() })
  try {
    const document = await task.promise
    const indexes = pages ?? Array.from({ length: document.numPages }, (_, index) => index)
    const results: ExtractedPdfPage[] = []
    for (const index of indexes) {
      const page = await document.getPage(index + 1)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => 'str' in item ? item.str : '')
        .join(' ')
        .replace(/\s+/gu, ' ')
        .trim()
      results.push({ pageNumber: index + 1, text })
      page.cleanup()
    }
    document.cleanup()
    return results
  } finally {
    await task.destroy()
  }
}

export async function comparePdfRendering(left: Uint8Array, right: Uint8Array, channelTolerance = 16): Promise<number[]> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = workerUrl
  const leftTask = getDocument({ data: left.slice() }), rightTask = getDocument({ data: right.slice() })
  try {
    const [a, b] = await Promise.all([leftTask.promise, rightTask.promise])
    const count = Math.max(a.numPages, b.numPages), ratios: number[] = []
    for (let number = 1; number <= count; number += 1) {
      if (number > a.numPages || number > b.numPages) { ratios.push(1); continue }
      const [ap, bp] = await Promise.all([a.getPage(number), b.getPage(number)])
      const av0 = ap.getViewport({ scale: 1 }), bv0 = bp.getViewport({ scale: 1 })
      if (Math.abs(av0.width - bv0.width) > .01 || Math.abs(av0.height - bv0.height) > .01) { ratios.push(1); ap.cleanup(); bp.cleanup(); continue }
      const scale = Math.min(1, 700 / Math.max(av0.width, av0.height)), av = ap.getViewport({ scale }), bv = bp.getViewport({ scale })
      const width = Math.max(1, Math.ceil(av.width)), height = Math.max(1, Math.ceil(av.height))
      const render = async (page: typeof ap, viewport: typeof av) => { const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw new PdfToolError('unsupported','Canvas unavailable');context.fillStyle='#fff';context.fillRect(0,0,width,height);await page.render({canvas,canvasContext:context,viewport,background:'#ffffff'}).promise;return context.getImageData(0,0,width,height).data }
      const [ad, bd] = await Promise.all([render(ap,av), render(bp,bv)])
      let different = 0
      for (let i=0;i<ad.length;i+=4) if (Math.max(Math.abs(ad[i]!-bd[i]!),Math.abs(ad[i+1]!-bd[i+1]!),Math.abs(ad[i+2]!-bd[i+2]!)) > channelTolerance) different += 1
      ratios.push(different/(width*height)); ap.cleanup(); bp.cleanup()
    }
    a.cleanup(); b.cleanup(); return ratios
  } finally { await Promise.all([leftTask.destroy(),rightTask.destroy()]) }
}

export async function renderPdfPagePreview(bytes: Uint8Array, pageNumber: number, scale: number, rotation: number): Promise<Blob> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = workerUrl
  const task = getDocument({ data: bytes.slice() })
  try {
    const document = await task.promise
    const page = await document.getPage(pageNumber)
    const viewport = page.getViewport({ scale, rotation })
    if (viewport.width * viewport.height > 40_000_000) throw new PdfToolError('unsupported', 'Rendered page exceeds the memory safety limit')
    const canvas = window.document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const context = canvas.getContext('2d')
    if (!context) throw new PdfToolError('unsupported', 'Canvas unavailable')
    await page.render({ canvas, canvasContext: context, viewport, background: '#ffffff' }).promise
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Image encoding failed')), 'image/webp', 0.92))
    page.cleanup()
    document.cleanup()
    return blob
  } finally {
    await task.destroy()
  }
}

export async function renderPdfPages(bytes: Uint8Array, pages: readonly number[], options: { dpi: number; format: 'png' | 'jpeg'; quality: number; background: string }): Promise<RenderedPdfPage[]> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = workerUrl
  const task = getDocument({ data: bytes.slice() })
  try {
    const document = await task.promise
    const results: RenderedPdfPage[] = []
    for (const pageIndex of pages) {
      const page = await document.getPage(pageIndex + 1)
      const viewport = page.getViewport({ scale: options.dpi / 72 })
      const width = Math.ceil(viewport.width)
      const height = Math.ceil(viewport.height)
      if (width * height > 40_000_000) throw new PdfToolError('unsupported', 'Rendered page exceeds the memory safety limit')
      const canvas = window.document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new PdfToolError('unsupported', 'Canvas unavailable')
      context.fillStyle = options.background
      context.fillRect(0, 0, width, height)
      await page.render({ canvas, canvasContext: context, viewport, background: options.background }).promise
      const mime = options.format === 'png' ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new PdfToolError('unsupported', 'Image encoding failed')), mime, options.quality))
      results.push({ pageNumber: pageIndex + 1, blob, width, height })
      page.cleanup()
    }
    document.cleanup()
    return results
  } finally {
    await task.destroy()
  }
}

