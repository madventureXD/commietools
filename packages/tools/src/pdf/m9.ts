import * as mupdf from 'mupdf'
import { PdfToolError } from './core'

export interface PdfRedactionArea { pageIndex: number; x: number; y: number; width: number; height: number }

function open(bytes: Uint8Array) {
  if (!bytes.length) throw new PdfToolError('empty', 'PDF file is empty')
  try { return new mupdf.PDFDocument(bytes) }
  catch (error) { throw new PdfToolError('invalid', error instanceof Error ? error.message : 'Invalid PDF') }
}

export function redactPdf(bytes: Uint8Array, areas: readonly PdfRedactionArea[], options: { clearMetadata?: boolean; removePageAnnotations?: boolean } = {}): Uint8Array {
  if (!areas.length) throw new PdfToolError('range', 'No redaction areas selected')
  const document = open(bytes)
  try {
    const byPage = new Map<number, PdfRedactionArea[]>()
    for (const area of areas) {
      if (area.pageIndex < 0 || area.pageIndex >= document.countPages() || ![area.x, area.y, area.width, area.height].every(Number.isFinite) || area.width <= 0 || area.height <= 0) throw new PdfToolError('range', 'Redaction area is invalid')
      byPage.set(area.pageIndex, [...(byPage.get(area.pageIndex) ?? []), area])
    }
    for (const [pageIndex, pageAreas] of byPage) {
      const page = document.loadPage(pageIndex)
      if (options.removePageAnnotations) for (const annotation of page.getAnnotations()) page.deleteAnnotation(annotation)
      for (const area of pageAreas) {
        const annotation = page.createAnnotation('Redact')
        annotation.setRect([area.x, area.y, area.x + area.width, area.y + area.height])
        annotation.update()
      }
      page.applyRedactions(true)
      page.update()
    }
    if (options.clearMetadata) for (const key of ['info:Title','info:Author','info:Subject','info:Keywords','info:Creator','info:Producer','info:CreationDate','info:ModDate']) document.setMetaData(key, '')
    const output = document.saveToBuffer('garbage,compress')
    try { return new Uint8Array(output.asUint8Array()) } finally { output.destroy() }
  } catch (error) {
    if (error instanceof PdfToolError) throw error
    throw new PdfToolError('unsupported', error instanceof Error ? error.message : 'Could not redact PDF')
  } finally { document.destroy() }
}

export interface PdfAPreflight {
  readonly declaredPart?: string
  readonly declaredConformance?: string
  readonly hasXmp: boolean
  readonly hasOutputIntent: boolean
  readonly hasEncryption: boolean
  readonly hasJavaScript: boolean
  readonly hasEmbeddedFiles: boolean
  readonly verdict: 'not-declared' | 'needs-independent-validation'
}

export function preflightPdfA(bytes: Uint8Array): PdfAPreflight {
  if (!bytes.length) throw new PdfToolError('empty', 'PDF file is empty')
  const source = new TextDecoder('latin1').decode(bytes)
  if (!source.startsWith('%PDF-')) throw new PdfToolError('invalid', 'Invalid PDF header')
  const part = /pdfaid:part\s*[=>]["']?\s*(\d)/iu.exec(source)?.[1]
  const conformance = /pdfaid:conformance\s*[=>]["']?\s*([A-Z])/iu.exec(source)?.[1]?.toUpperCase()
  return {
    declaredPart: part,
    declaredConformance: conformance,
    hasXmp: /\/Type\s*\/Metadata\b|<x:xmpmeta\b/iu.test(source),
    hasOutputIntent: /\/OutputIntents?\b/iu.test(source),
    hasEncryption: /\/Encrypt\b/u.test(source),
    hasJavaScript: /\/JavaScript\b|\/JS\b/u.test(source),
    hasEmbeddedFiles: /\/EmbeddedFiles\b/u.test(source),
    verdict: part ? 'needs-independent-validation' : 'not-declared'
  }
}
