import { degrees, EncryptedPDFError, PDFDocument } from 'pdf-lib'

export type PdfIssueCode = 'encrypted' | 'invalid' | 'empty' | 'range' | 'unsupported'

export class PdfToolError extends Error {
  constructor(public readonly code: PdfIssueCode, message: string) {
    super(message)
    this.name = 'PdfToolError'
  }
}

export interface PdfPageInfo {
  readonly index: number
  readonly width: number
  readonly height: number
  readonly rotation: number
}

export interface PdfInspection {
  readonly pageCount: number
  readonly pages: readonly PdfPageInfo[]
  readonly title?: string
  readonly hasSignatures: boolean
  readonly hasForms: boolean
  readonly hasXfa: boolean
  readonly hasAnnotations: boolean
}

export interface PdfInput {
  readonly name: string
  readonly bytes: Uint8Array
  readonly pages?: readonly number[]
}

export interface PdfPagePlan {
  readonly sourceIndex: number
  readonly rotation: number
}

export type PdfPageSize = 'auto' | 'a4' | 'letter'
export type PdfOrientation = 'auto' | 'portrait' | 'landscape'
export type PdfImageFit = 'contain' | 'cover'

export interface PdfImageInput {
  readonly name: string
  readonly bytes: Uint8Array
  readonly mimeType: 'image/jpeg' | 'image/png'
}

export interface ImagesToPdfOptions {
  readonly pageSize: PdfPageSize
  readonly orientation: PdfOrientation
  readonly margin: number
  readonly fit: PdfImageFit
}

function structuralFlags(bytes: Uint8Array) {
  const source = new TextDecoder('latin1').decode(bytes)
  return {
    hasSignatures: /\/Type\s*\/Sig\b|\/ByteRange\s*\[/u.test(source),
    hasForms: /\/AcroForm\b/u.test(source),
    hasXfa: /\/XFA\b/u.test(source),
    hasAnnotations: /\/Annots\s*\[/u.test(source)
  }
}

async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  if (!bytes.length) throw new PdfToolError('empty', 'PDF file is empty')
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false })
  } catch (error) {
    if (error instanceof EncryptedPDFError || (error instanceof Error && /encrypt/i.test(error.message))) {
      throw new PdfToolError('encrypted', 'Encrypted PDFs are not supported by this operation')
    }
    throw new PdfToolError('invalid', error instanceof Error ? error.message : 'Invalid PDF')
  }
}

export async function inspectPdf(bytes: Uint8Array): Promise<PdfInspection> {
  const document = await loadPdf(bytes)
  const pages = document.getPages().map((page, index) => {
    const { width, height } = page.getSize()
    return { index, width, height, rotation: page.getRotation().angle }
  })
  return {
    pageCount: pages.length,
    pages,
    title: document.getTitle(),
    ...structuralFlags(bytes)
  }
}

export function parsePageSelection(value: string, pageCount: number): number[] {
  const compact = value.replace(/\s+/gu, '')
  if (!compact) throw new PdfToolError('range', 'No page selection')
  const result: number[] = []
  for (const part of compact.split(',')) {
    const match = /^(\d+)(?:-(\d+))?$/u.exec(part)
    if (!match) throw new PdfToolError('range', `Invalid page selection: ${part}`)
    const start = Number(match[1])
    const end = Number(match[2] ?? match[1])
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      throw new PdfToolError('range', `Page outside document: ${part}`)
    }
    const step = start <= end ? 1 : -1
    for (let page = start; ; page += step) {
      result.push(page - 1)
      if (page === end) break
    }
  }
  return result
}

export function parseSplitGroups(value: string, pageCount: number): number[][] {
  const groups = value.split(';').map((group) => group.trim()).filter(Boolean)
  if (!groups.length) throw new PdfToolError('range', 'No split groups')
  return groups.map((group) => parsePageSelection(group, pageCount))
}

export async function mergePdfs(inputs: readonly PdfInput[]): Promise<Uint8Array> {
  if (!inputs.length) throw new PdfToolError('empty', 'No PDF files selected')
  const output = await PDFDocument.create()
  for (const input of inputs) {
    const source = await loadPdf(input.bytes)
    const indices = input.pages ?? source.getPageIndices()
    if (!indices.length || indices.some((index) => index < 0 || index >= source.getPageCount())) {
      throw new PdfToolError('range', `Invalid page selection for ${input.name}`)
    }
    const pages = await output.copyPages(source, [...indices])
    pages.forEach((page) => output.addPage(page))
  }
  return output.save()
}

export async function splitPdf(bytes: Uint8Array, groups: readonly (readonly number[])[]): Promise<Uint8Array[]> {
  const source = await loadPdf(bytes)
  if (!groups.length) throw new PdfToolError('range', 'No split groups')
  const results: Uint8Array[] = []
  for (const group of groups) {
    if (!group.length || group.some((index) => index < 0 || index >= source.getPageCount())) {
      throw new PdfToolError('range', 'Invalid split group')
    }
    const output = await PDFDocument.create()
    const pages = await output.copyPages(source, [...group])
    pages.forEach((page) => output.addPage(page))
    results.push(await output.save())
  }
  return results
}

function normalizeRotation(value: number): number {
  return ((Math.round(value / 90) * 90) % 360 + 360) % 360
}

export async function organizePdf(bytes: Uint8Array, plan: readonly PdfPagePlan[]): Promise<Uint8Array> {
  if (!plan.length) throw new PdfToolError('empty', 'A PDF must contain at least one page')
  const source = await loadPdf(bytes)
  if (plan.some((entry) => entry.sourceIndex < 0 || entry.sourceIndex >= source.getPageCount())) {
    throw new PdfToolError('range', 'Invalid page plan')
  }
  const output = await PDFDocument.create()
  for (const entry of plan) {
    const [page] = await output.copyPages(source, [entry.sourceIndex])
    if (!page) throw new PdfToolError('invalid', 'Could not copy PDF page')
    page.setRotation(degrees(normalizeRotation(page.getRotation().angle + entry.rotation)))
    output.addPage(page)
  }
  return output.save()
}

const FIXED_PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792]
} as const

function orientSize(size: readonly [number, number], orientation: PdfOrientation, imageLandscape: boolean): [number, number] {
  const landscape = orientation === 'landscape' || (orientation === 'auto' && imageLandscape)
  const short = Math.min(...size)
  const long = Math.max(...size)
  return landscape ? [long, short] : [short, long]
}

export async function imagesToPdf(inputs: readonly PdfImageInput[], options: ImagesToPdfOptions): Promise<Uint8Array> {
  if (!inputs.length) throw new PdfToolError('empty', 'No image files selected')
  const output = await PDFDocument.create()
  const margin = Math.max(0, options.margin)
  for (const input of inputs) {
    let image
    try {
      image = input.mimeType === 'image/jpeg' ? await output.embedJpg(input.bytes) : await output.embedPng(input.bytes)
    } catch {
      throw new PdfToolError('unsupported', `Unsupported or damaged image: ${input.name}`)
    }
    const intrinsic: [number, number] = [image.width, image.height]
    const pageSize = options.pageSize === 'auto'
      ? orientSize([image.width + margin * 2, image.height + margin * 2], options.orientation, image.width > image.height)
      : orientSize(FIXED_PAGE_SIZES[options.pageSize], options.orientation, image.width > image.height)
    const page = output.addPage(pageSize)
    const availableWidth = Math.max(1, pageSize[0] - margin * 2)
    const availableHeight = Math.max(1, pageSize[1] - margin * 2)
    const scale = options.fit === 'cover'
      ? Math.max(availableWidth / intrinsic[0], availableHeight / intrinsic[1])
      : Math.min(availableWidth / intrinsic[0], availableHeight / intrinsic[1])
    const width = intrinsic[0] * scale
    const height = intrinsic[1] * scale
    page.drawImage(image, { x: (pageSize[0] - width) / 2, y: (pageSize[1] - height) / 2, width, height })
  }
  return output.save()
}

