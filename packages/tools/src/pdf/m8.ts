import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFRawStream, PDFStream, PDFString, decodePDFRawStream } from 'pdf-lib'
import { PdfToolError, inspectPdf } from './core'
import { repairPdfWithQpdf } from './m5'

export interface PdfMetadata {
  title?: string; author?: string; subject?: string; keywords: readonly string[]
  creator?: string; producer?: string; creationDate?: Date; modificationDate?: Date
}

async function load(bytes: Uint8Array) {
  if (!bytes.length) throw new PdfToolError('empty', 'PDF file is empty')
  try { return await PDFDocument.load(bytes, { updateMetadata: false }) }
  catch (error) { throw new PdfToolError('invalid', error instanceof Error ? error.message : 'Invalid PDF') }
}

export async function readPdfMetadata(bytes: Uint8Array): Promise<PdfMetadata> {
  const pdf = await load(bytes)
  return { title: pdf.getTitle(), author: pdf.getAuthor(), subject: pdf.getSubject(), keywords: pdf.getKeywords()?.split(/[,;]\s*/u).filter(Boolean) ?? [], creator: pdf.getCreator(), producer: pdf.getProducer(), creationDate: pdf.getCreationDate(), modificationDate: pdf.getModificationDate() }
}

export async function cleanPdfMetadata(bytes: Uint8Array): Promise<Uint8Array> {
  const pdf = await load(bytes)
  pdf.setTitle(''); pdf.setAuthor(''); pdf.setSubject(''); pdf.setKeywords([]); pdf.setCreator(''); pdf.setProducer('')
  pdf.catalog.delete(PDFName.of('Metadata'))
  return pdf.save({ updateFieldAppearances: false })
}

export interface PdfCropOptions { pages: readonly number[]; top: number; right: number; bottom: number; left: number }
export async function cropPdfPages(bytes: Uint8Array, options: PdfCropOptions): Promise<Uint8Array> {
  const pdf = await load(bytes)
  if (!options.pages.length) throw new PdfToolError('range', 'No pages selected')
  for (const index of options.pages) {
    const page = pdf.getPage(index)
    if (!page) throw new PdfToolError('range', 'Page outside document')
    const box = page.getCropBox()
    const width = box.width - options.left - options.right
    const height = box.height - options.top - options.bottom
    if (width < 10 || height < 10 || [options.top, options.right, options.bottom, options.left].some((value) => !Number.isFinite(value) || value < 0)) throw new PdfToolError('range', 'Crop margins are invalid')
    page.setCropBox(box.x + options.left, box.y + options.bottom, width, height)
  }
  return pdf.save({ updateFieldAppearances: false })
}

export interface PdfRepairResult { bytes: Uint8Array; pageCount: number; changed: boolean }
export async function repairAndValidatePdf(bytes: Uint8Array): Promise<PdfRepairResult> {
  const repaired = await repairPdfWithQpdf(bytes)
  const inspection = await inspectPdf(repaired)
  return { bytes: repaired, pageCount: inspection.pageCount, changed: repaired.length !== bytes.length || !repaired.every((value, index) => value === bytes[index]) }
}

export interface PdfAttachment { index: number; name: string; description?: string; size: number; bytes: Uint8Array }
function text(value: unknown): string | undefined { return value instanceof PDFString || value instanceof PDFHexString ? value.decodeText() : undefined }
function attachmentEntries(pdf: PDFDocument): PdfAttachment[] {
  const names = pdf.catalog.lookup(PDFName.of('Names'), PDFDict)?.lookup(PDFName.of('EmbeddedFiles'), PDFDict)?.lookup(PDFName.of('Names'), PDFArray)
  if (!names) return []
  const result: PdfAttachment[] = []
  for (let i = 0; i + 1 < names.size(); i += 2) {
    const name = text(names.lookup(i)) ?? `attachment-${result.length + 1}`
    const spec = names.lookup(i + 1, PDFDict)
    const stream = spec?.lookup(PDFName.of('EF'), PDFDict)?.lookupMaybe(PDFName.of('UF'), PDFStream) ?? spec?.lookup(PDFName.of('EF'), PDFDict)?.lookupMaybe(PDFName.of('F'), PDFStream)
    if (!(stream instanceof PDFRawStream)) continue
    const bytes = new Uint8Array(decodePDFRawStream(stream).decode())
    result.push({ index: result.length, name: text(spec.lookup(PDFName.of('UF'))) ?? text(spec.lookup(PDFName.of('F'))) ?? name, description: text(spec.lookup(PDFName.of('Desc'))), size: bytes.length, bytes })
  }
  return result
}
export async function listPdfAttachments(bytes: Uint8Array): Promise<PdfAttachment[]> { return attachmentEntries(await load(bytes)) }
export async function addPdfAttachments(bytes: Uint8Array, files: readonly { name: string; bytes: Uint8Array; mimeType?: string }[]): Promise<Uint8Array> {
  const pdf = await load(bytes)
  for (const file of files) await pdf.attach(file.bytes, file.name, { mimeType: file.mimeType, description: `Embedded with CommieTools: ${file.name}` })
  return pdf.save({ updateFieldAppearances: false })
}
export async function removePdfAttachment(bytes: Uint8Array, index: number): Promise<Uint8Array> {
  const pdf = await load(bytes)
  const names = pdf.catalog.lookup(PDFName.of('Names'), PDFDict)?.lookup(PDFName.of('EmbeddedFiles'), PDFDict)?.lookup(PDFName.of('Names'), PDFArray)
  if (!names || index < 0 || index * 2 + 1 >= names.size()) throw new PdfToolError('range', 'Attachment outside document')
  names.remove(index * 2 + 1); names.remove(index * 2)
  return pdf.save({ updateFieldAppearances: false })
}
export function safeAttachmentName(name: string, fallback = 'attachment'): string {
  const leaf = name.replaceAll('\\', '/').split('/').pop() ?? ''
  // Steuerzeichen und Richtungsmarken werden hier **bewusst** entfernt: sie gehören nicht in einen Dateinamen.
  // eslint-disable-next-line no-control-regex -- Absicht, siehe Zeile darüber
  let cleaned = leaf.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069<>:"|?*]/gu, '_').replace(/^\.+/u, '').trim().replace(/[. ]+$/u, '').slice(0, 180)
  if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(cleaned)) cleaned = `_${cleaned}`
  return cleaned && cleaned !== '.' && cleaned !== '..' ? cleaned : fallback
}
export async function renamePdfAttachment(bytes: Uint8Array, index: number, requestedName: string): Promise<Uint8Array> {
  const pdf = await load(bytes)
  const names = pdf.catalog.lookup(PDFName.of('Names'), PDFDict)?.lookup(PDFName.of('EmbeddedFiles'), PDFDict)?.lookup(PDFName.of('Names'), PDFArray)
  if (!names || index < 0 || index * 2 + 1 >= names.size()) throw new PdfToolError('range', 'Attachment outside document')
  const name = safeAttachmentName(requestedName)
  names.set(index * 2, PDFHexString.fromText(name))
  const spec = names.lookup(index * 2 + 1, PDFDict)
  spec.set(PDFName.of('F'), PDFString.of(name)); spec.set(PDFName.of('UF'), PDFHexString.fromText(name))
  return pdf.save({ updateFieldAppearances: false })
}

export interface PdfComparison { samePageCount: boolean; pages: readonly { page: number; geometryEqual: boolean; textEqual: boolean }[] }
export function comparePdfStructure(left: { pages: readonly { width: number; height: number; rotation: number; text: string }[] }, right: { pages: readonly { width: number; height: number; rotation: number; text: string }[] }): PdfComparison {
  const count = Math.max(left.pages.length, right.pages.length)
  return { samePageCount: left.pages.length === right.pages.length, pages: Array.from({ length: count }, (_, index) => { const a = left.pages[index]; const b = right.pages[index]; return { page: index + 1, geometryEqual: !!a && !!b && Math.abs(a.width - b.width) < .01 && Math.abs(a.height - b.height) < .01 && a.rotation === b.rotation, textEqual: !!a && !!b && a.text === b.text } }) }
}
