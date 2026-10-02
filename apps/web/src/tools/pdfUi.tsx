import { useEffect, useState } from 'react'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PdfToolError, type PdfInspection } from '@commietools/tools'

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

