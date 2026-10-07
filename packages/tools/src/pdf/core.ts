import { degrees, EncryptedPDFError, PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export type PdfIssueCode = 'encrypted' | 'invalid' | 'empty' | 'password' | 'range' | 'unsupported' | 'timeout'

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

export type PdfPlacementAnchor = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface PdfPlacementRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface PdfTextStyle {
  readonly fontSize: number
  readonly color: string
  readonly opacity: number
  readonly rotation: number
  readonly anchor: PdfPlacementAnchor
  readonly margin: number
}

export interface PdfWatermarkOptions extends PdfTextStyle {
  readonly text: string
  /** Optional browser-rendered PNG. Used for full Unicode without bundling a font. */
  readonly textImage?: Uint8Array
  readonly pages: readonly number[]
  readonly tiled: boolean
  readonly spacing: number
}

export type PdfNumberFormat = 'number' | 'page-total' | 'dash'

export interface PdfPageNumberOptions extends Omit<PdfTextStyle, 'rotation'> {
  readonly pages: readonly number[]
  readonly start: number
  readonly prefix: string
  readonly suffix: string
  readonly format: PdfNumberFormat
  /** Optional PNGs matching `pages`, rendered by the caller for full Unicode. */
  readonly textImages?: readonly Uint8Array[]
}

export interface PdfSignatureOptions {
  readonly pageIndex: number
  readonly image: Uint8Array
  readonly mimeType: 'image/png' | 'image/jpeg'
  readonly width: number
  readonly opacity: number
  readonly rotation: number
  readonly anchor: PdfPlacementAnchor
  readonly margin: number
  readonly dateText?: string
}

interface PdfPageBox { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

export interface PdfPagePlacement extends PdfPlacementRect {
  /** Rotation that keeps added content upright in the viewer. */
  readonly rotation: number
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function parseHexColor(value: string) {
  const match = /^#?([0-9a-f]{6})$/iu.exec(value.trim())
  if (!match?.[1]) throw new PdfToolError('unsupported', 'Colour must be a six-digit hexadecimal value')
  const numeric = Number.parseInt(match[1], 16)
  return rgb(((numeric >> 16) & 255) / 255, ((numeric >> 8) & 255) / 255, (numeric & 255) / 255)
}

function validatePages(pages: readonly number[], pageCount: number) {
  if (!pages.length || pages.some((page) => page < 0 || page >= pageCount)) {
    throw new PdfToolError('range', 'Invalid page selection')
  }
  return [...new Set(pages)]
}

export function resolvePdfPlacement(pageWidth: number, pageHeight: number, elementWidth: number, elementHeight: number, anchor: PdfPlacementAnchor, margin: number): PdfPlacementRect {
  const safeMargin = clamp(margin, 0, Math.min(pageWidth, pageHeight) / 2)
  const width = clamp(elementWidth, 1, Math.max(1, pageWidth - safeMargin * 2))
  const height = clamp(elementHeight, 1, Math.max(1, pageHeight - safeMargin * 2))
  const horizontal = anchor.endsWith('left') ? safeMargin : anchor.endsWith('right') ? pageWidth - safeMargin - width : (pageWidth - width) / 2
  const vertical = anchor.startsWith('top') ? pageHeight - safeMargin - height : anchor.startsWith('bottom') ? safeMargin : (pageHeight - height) / 2
  return { x: horizontal, y: vertical, width, height }
}

/** Resolves a visual anchor into PDF user-space, including CropBox offsets and page rotation. */
export function resolvePdfPagePlacement(pageWidth: number, pageHeight: number, cropBox: PdfPageBox, pageRotation: number, elementWidth: number, elementHeight: number, anchor: PdfPlacementAnchor, margin: number): PdfPagePlacement {
  const rotation = normalizeRotation(pageRotation)
  const rotated = rotation === 90 || rotation === 270
  const visualWidth = rotated ? cropBox.height : cropBox.width
  const visualHeight = rotated ? cropBox.width : cropBox.height
  const visual = resolvePdfPlacement(visualWidth, visualHeight, elementWidth, elementHeight, anchor, margin)
  if (rotation === 90) return { x: cropBox.x + cropBox.width - visual.y - visual.height, y: cropBox.y + visual.x + visual.width, width: visual.width, height: visual.height, rotation: -90 }
  if (rotation === 180) return { x: cropBox.x + cropBox.width - visual.x, y: cropBox.y + cropBox.height - visual.y, width: visual.width, height: visual.height, rotation: -180 }
  if (rotation === 270) return { x: cropBox.x + visual.y + visual.height, y: cropBox.y + cropBox.height - visual.x - visual.width, width: visual.width, height: visual.height, rotation: -270 }
  return { x: cropBox.x + visual.x, y: cropBox.y + visual.y, width: visual.width, height: visual.height, rotation: 0 }
}

export function formatPdfPageNumber(index: number, total: number, options: Pick<PdfPageNumberOptions, 'start' | 'prefix' | 'suffix' | 'format'>) {
  const number = options.start + index
  const core = options.format === 'page-total' ? `${number} / ${options.start + total - 1}` : options.format === 'dash' ? `– ${number} –` : String(number)
  return `${options.prefix}${core}${options.suffix}`
}

export async function addPdfWatermark(bytes: Uint8Array, options: PdfWatermarkOptions): Promise<Uint8Array> {
  const document = await loadPdf(bytes)
  const pages = validatePages(options.pages, document.getPageCount())
  const text = options.text.trim()
  if (!text) throw new PdfToolError('empty', 'Watermark text is empty')
  const fontSize = clamp(options.fontSize, 6, 144)
  const font = options.textImage ? null : await document.embedFont(StandardFonts.Helvetica)
  const textImage = options.textImage ? await document.embedPng(options.textImage) : null
  let width: number
  let height: number
  if (textImage) {
    height = fontSize * 1.2
    width = height * textImage.width / textImage.height
  } else {
    try { width = font!.widthOfTextAtSize(text, fontSize) } catch { throw new PdfToolError('unsupported', 'The selected text contains characters that are not supported by the standard PDF font') }
    height = font!.heightAtSize(fontSize)
  }
  const color = parseHexColor(options.color)
  for (const pageIndex of pages) {
    const page = document.getPage(pageIndex)
    const { width: pageWidth, height: pageHeight } = page.getSize()
    const crop = page.getCropBox()
    const pageRotation = page.getRotation().angle
    const draw = (placement: PdfPagePlacement) => {
      const rotation = placement.rotation + clamp(options.rotation, -180, 180)
      if (textImage) page.drawImage(textImage, { x: placement.x, y: placement.y, width: placement.width, height: placement.height, opacity: clamp(options.opacity, 0.05, 1), rotate: degrees(rotation) })
      else page.drawText(text, { x: placement.x, y: placement.y, size: fontSize, font: font!, color, opacity: clamp(options.opacity, 0.05, 1), rotate: degrees(rotation) })
    }
    if (options.tiled) {
      const spacing = clamp(options.spacing, 10, 400)
      const rotated = normalizeRotation(pageRotation) % 180 !== 0
      const visualWidth = rotated ? crop.height : crop.width
      const visualHeight = rotated ? crop.width : crop.height
      for (let y = spacing / 2; y < visualHeight; y += height + spacing) {
        for (let x = -width / 3; x < visualWidth; x += width + spacing) {
          const tileOrigin = resolvePdfPagePlacement(pageWidth, pageHeight, crop, pageRotation, width, height, 'bottom-left', 0)
          const base = resolvePdfPlacement(visualWidth, visualHeight, width, height, 'bottom-left', 0)
          const dx = x - base.x; const dy = y - base.y
          let xPosition = tileOrigin.x; let yPosition = tileOrigin.y
          if (normalizeRotation(pageRotation) === 90) { xPosition -= dy; yPosition += dx }
          else if (normalizeRotation(pageRotation) === 180) { xPosition -= dx; yPosition -= dy }
          else if (normalizeRotation(pageRotation) === 270) { xPosition += dy; yPosition -= dx }
          else { xPosition += dx; yPosition += dy }
          draw({ ...tileOrigin, x: xPosition, y: yPosition })
        }
      }
    } else {
      draw(resolvePdfPagePlacement(pageWidth, pageHeight, crop, pageRotation, width, height, options.anchor, options.margin))
    }
  }
  return document.save()
}

export async function addPdfPageNumbers(bytes: Uint8Array, options: PdfPageNumberOptions): Promise<Uint8Array> {
  const document = await loadPdf(bytes)
  const pages = validatePages(options.pages, document.getPageCount())
  const font = options.textImages ? null : await document.embedFont(StandardFonts.Helvetica)
  if (options.textImages && options.textImages.length !== pages.length) throw new PdfToolError('range', 'Page number image count does not match selected pages')
  const images = options.textImages ? await Promise.all(options.textImages.map((image) => document.embedPng(image))) : null
  const fontSize = clamp(options.fontSize, 6, 72)
  const color = parseHexColor(options.color)
  pages.forEach((pageIndex, logicalIndex) => {
    const page = document.getPage(pageIndex)
    const text = formatPdfPageNumber(logicalIndex, pages.length, options)
    let width: number
    let height: number
    const image = images?.[logicalIndex]
    if (image) { height = fontSize * 1.2; width = height * image.width / image.height }
    else { try { width = font!.widthOfTextAtSize(text, fontSize) } catch { throw new PdfToolError('unsupported', 'The selected prefix or suffix is not supported by the standard PDF font') }; height = font!.heightAtSize(fontSize) }
    const size = page.getSize()
    const placement = resolvePdfPagePlacement(size.width, size.height, page.getCropBox(), page.getRotation().angle, width, height, options.anchor, options.margin)
    if (image) page.drawImage(image, { x: placement.x, y: placement.y, width: placement.width, height: placement.height, rotate: degrees(placement.rotation), opacity: clamp(options.opacity, 0.05, 1) })
    else page.drawText(text, { x: placement.x, y: placement.y, size: fontSize, font: font!, color, rotate: degrees(placement.rotation), opacity: clamp(options.opacity, 0.05, 1) })
  })
  return document.save()
}

export async function addVisiblePdfSignature(bytes: Uint8Array, options: PdfSignatureOptions): Promise<Uint8Array> {
  const document = await loadPdf(bytes)
  if (options.pageIndex < 0 || options.pageIndex >= document.getPageCount()) throw new PdfToolError('range', 'Signature page is outside the document')
  let image
  try {
    image = options.mimeType === 'image/jpeg' ? await document.embedJpg(options.image) : await document.embedPng(options.image)
  } catch {
    throw new PdfToolError('unsupported', 'Signature image is damaged or unsupported')
  }
  const page = document.getPage(options.pageIndex)
  const pageSize = page.getSize()
  const width = clamp(options.width, 24, pageSize.width)
  const height = width * image.height / image.width
  const placement = resolvePdfPagePlacement(pageSize.width, pageSize.height, page.getCropBox(), page.getRotation().angle, width, height, options.anchor, options.margin)
  page.drawImage(image, { x: placement.x, y: placement.y, width: placement.width, height: placement.height, opacity: clamp(options.opacity, 0.05, 1), rotate: degrees(placement.rotation + clamp(options.rotation, -180, 180)) })
  if (options.dateText?.trim()) {
    const font = await document.embedFont(StandardFonts.Helvetica)
    const text = options.dateText.trim()
    const size = 9
    try {
      font.widthOfTextAtSize(text, size)
    } catch {
      throw new PdfToolError('unsupported', 'The date label is not supported by the standard PDF font')
    }
    page.drawText(text, { x: placement.x, y: Math.max(2, placement.y - 12), size, font, color: rgb(0.2, 0.2, 0.2) })
  }
  return document.save()
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

