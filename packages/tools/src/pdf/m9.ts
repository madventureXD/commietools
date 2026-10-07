import * as mupdf from 'mupdf'
import { PdfToolError } from './core'

export interface PdfRedactionArea { pageIndex: number; x: number; y: number; width: number; height: number }

/** Page box in PDF points as reported by the inspection (unrotated). */
export interface PdfRedactionPageBox { readonly width: number; readonly height: number }

/**
 * Result of checking a redaction area against one page.
 *
 * This is the single place where a redaction rectangle is validated, so the keyboard form, the
 * pointer drag and the tests all judge the same model. `reason` is a code, never a sentence: the
 * interface translates it.
 */
export type PdfRedactionAreaCheck =
  | { readonly ok: true; readonly area: PdfRedactionArea }
  | { readonly ok: false; readonly reason: 'number' | 'size' | 'bounds' }

/** Rounding slack when an area is checked against the page box (PDF points). */
const PAGE_EPSILON = 0.01

export function normaliseRedactionArea(input: PdfRedactionArea, page: PdfRedactionPageBox): PdfRedactionAreaCheck {
  const values = [input.pageIndex, input.x, input.y, input.width, input.height]
  if (!values.every(Number.isFinite)) return { ok: false, reason: 'number' }
  if (input.width <= 0 || input.height <= 0) return { ok: false, reason: 'size' }
  if (input.x < -PAGE_EPSILON || input.y < -PAGE_EPSILON
    || input.x + input.width > page.width + PAGE_EPSILON
    || input.y + input.height > page.height + PAGE_EPSILON) return { ok: false, reason: 'bounds' }
  return { ok: true, area: { pageIndex: input.pageIndex, x: input.x, y: input.y, width: input.width, height: input.height } }
}

/**
 * Moves one redaction area inside its page by `dx`/`dy` PDF points and clamps it at the page box.
 * Used by the arrow-key control, so the keyboard path clamps exactly like the pointer path.
 */
export function nudgeRedactionArea(area: PdfRedactionArea, page: PdfRedactionPageBox, dx: number, dy: number): PdfRedactionArea {
  const x = Math.min(Math.max(area.x + dx, 0), Math.max(0, page.width - area.width))
  const y = Math.min(Math.max(area.y + dy, 0), Math.max(0, page.height - area.height))
  return { pageIndex: area.pageIndex, x, y, width: area.width, height: area.height }
}

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
