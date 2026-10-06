import * as mupdf from 'mupdf'
import { PdfToolError } from './core'

export type PdfFormFieldType = 'text' | 'checkbox' | 'radio' | 'choice' | 'signature' | 'unsupported'

export interface PdfFormFieldInfo {
  readonly name: string
  readonly label: string
  readonly type: PdfFormFieldType
  readonly value: string | boolean
  readonly options: readonly string[]
  readonly readOnly: boolean
  readonly required: boolean
  readonly multiline: boolean
}

export interface PdfFormInspection {
  readonly fields: readonly PdfFormFieldInfo[]
  readonly hasXfa: boolean
}

export type PdfFormValue = string | boolean

function openPdf(bytes: Uint8Array) {
  if (!bytes.length) throw new PdfToolError('empty', 'PDF file is empty')
  try { return new mupdf.PDFDocument(bytes) }
  catch (error) { throw new PdfToolError('invalid', error instanceof Error ? error.message : 'Invalid PDF') }
}

function widgetType(widget: mupdf.PDFWidget): PdfFormFieldType {
  if (widget.isText()) return 'text'
  if (widget.isCheckbox()) return 'checkbox'
  if (widget.isRadioButton()) return 'radio'
  if (widget.isChoice()) return 'choice'
  if (widget.getFieldType() === 'signature') return 'signature'
  return 'unsupported'
}

function widgetValue(widget: mupdf.PDFWidget, type: PdfFormFieldType): string | boolean {
  const value = widget.getValue()
  return type === 'checkbox' ? Boolean(value && value !== 'Off') : value
}

function collectWidgets(document: mupdf.PDFDocument) {
  const widgets = new Map<string, mupdf.PDFWidget>()
  for (let pageIndex = 0; pageIndex < document.countPages(); pageIndex += 1) {
    const page = document.loadPage(pageIndex)
    for (const widget of page.getWidgets()) if (!widgets.has(widget.getName())) widgets.set(widget.getName(), widget)
  }
  return widgets
}

export function inspectPdfForm(bytes: Uint8Array): PdfFormInspection {
  const document = openPdf(bytes)
  try {
    const fields = [...collectWidgets(document).values()].map((widget): PdfFormFieldInfo => {
      const type = widgetType(widget)
      return {
        name: widget.getName(),
        label: widget.getLabel() || widget.getName(),
        type,
        value: widgetValue(widget, type),
        options: type === 'choice' || type === 'radio' ? widget.getOptions() : [],
        readOnly: widget.isReadOnly(),
        required: Boolean(widget.getFieldFlags() & mupdf.PDFWidget.FIELD_IS_REQUIRED),
        multiline: type === 'text' && widget.isMultiline()
      }
    })
    return { fields, hasXfa: /\/XFA\b/u.test(new TextDecoder('latin1').decode(bytes)) }
  } finally { document.destroy() }
}

export function fillPdfForm(bytes: Uint8Array, values: Readonly<Record<string, PdfFormValue>>, flatten = false): Uint8Array {
  const document = openPdf(bytes)
  try {
    const widgets = collectWidgets(document)
    for (const [name, value] of Object.entries(values)) {
      const widget = widgets.get(name)
      if (!widget || widget.isReadOnly()) continue
      const type = widgetType(widget)
      if (type === 'text') widget.setTextValue(String(value))
      else if (type === 'choice' || type === 'radio') widget.setChoiceValue(String(value))
      else if (type === 'checkbox') {
        const checked = Boolean(widgetValue(widget, type))
        if (checked !== Boolean(value)) widget.toggle()
      }
    }
    if (flatten) document.bake(false, true)
    const output = document.saveToBuffer('compress')
    try { return new Uint8Array(output.asUint8Array()) } finally { output.destroy() }
  } catch (error) {
    if (error instanceof PdfToolError) throw error
    throw new PdfToolError('unsupported', error instanceof Error ? error.message : 'Could not fill form')
  } finally { document.destroy() }
}

export type PdfAnnotationType = 'Text' | 'FreeText' | 'Highlight' | 'Underline' | 'StrikeOut' | 'Square' | 'Circle' | 'Line' | 'Ink'

export interface PdfAnnotationInfo {
  readonly pageIndex: number
  readonly index: number
  readonly type: string
  readonly contents: string
  readonly author: string
  readonly rect: readonly [number, number, number, number]
}

export interface PdfAnnotationOptions {
  readonly pageIndex: number
  readonly type: PdfAnnotationType
  readonly rect: readonly [number, number, number, number]
  readonly contents: string
  readonly author: string
  readonly color: readonly [number, number, number]
  readonly opacity: number
  readonly ink?: readonly (readonly (readonly [number, number])[])[]
}

export function inspectPdfAnnotations(bytes: Uint8Array): PdfAnnotationInfo[] {
  const document = openPdf(bytes)
  try {
    const result: PdfAnnotationInfo[] = []
    for (let pageIndex = 0; pageIndex < document.countPages(); pageIndex += 1) {
      const page = document.loadPage(pageIndex)
      page.getAnnotations().forEach((annotation, index) => result.push({ pageIndex, index, type: annotation.getType(), contents: annotation.getContents(), author: annotation.getAuthor(), rect: annotation.getBounds() }))
    }
    return result
  } finally { document.destroy() }
}

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)) }

export function addPdfAnnotation(bytes: Uint8Array, options: PdfAnnotationOptions): Uint8Array {
  const document = openPdf(bytes)
  try {
    if (options.pageIndex < 0 || options.pageIndex >= document.countPages()) throw new PdfToolError('range', 'Annotation page is outside the document')
    const page = document.loadPage(options.pageIndex)
    const [x0, y0, x1, y1] = options.rect
    if (!(x1 > x0 && y1 > y0)) throw new PdfToolError('range', 'Annotation rectangle is invalid')
    const annotation = page.createAnnotation(options.type)
    const textMarkup = ['Highlight', 'Underline', 'StrikeOut'].includes(options.type)
    if (!textMarkup) annotation.setRect([x0, y0, x1, y1])
    annotation.setContents(options.contents)
    annotation.setAuthor(options.author)
    annotation.setColor([...options.color])
    annotation.setOpacity(clamp(options.opacity, 0.05, 1))
    annotation.setFlags(mupdf.PDFAnnotation.IS_PRINT)
    if (textMarkup) annotation.setQuadPoints([[x0, y0, x1, y0, x0, y1, x1, y1]])
    if (options.type === 'Line') annotation.setLine([x0, y0], [x1, y1])
    if (options.type === 'Square' || options.type === 'Circle' || options.type === 'Line' || options.type === 'Ink') annotation.setBorderWidth(2)
    if (options.type === 'Ink') annotation.setInkList(options.ink?.length ? options.ink.map((stroke) => stroke.map(([x, y]) => [x, y])) : [[[x0, y0], [x1, y1]]])
    if (options.type === 'FreeText') annotation.setDefaultAppearance('Helv', 12, [...options.color])
    annotation.update(); page.update()
    const output = document.saveToBuffer('compress')
    try { return new Uint8Array(output.asUint8Array()) } finally { output.destroy() }
  } catch (error) {
    if (error instanceof PdfToolError) throw error
    throw new PdfToolError('unsupported', error instanceof Error ? error.message : 'Could not add annotation')
  } finally { document.destroy() }
}

export function deletePdfAnnotation(bytes: Uint8Array, pageIndex: number, annotationIndex: number): Uint8Array {
  const document = openPdf(bytes)
  try {
    if (pageIndex < 0 || pageIndex >= document.countPages()) throw new PdfToolError('range', 'Annotation page is outside the document')
    const page = document.loadPage(pageIndex)
    const annotation = page.getAnnotations()[annotationIndex]
    if (!annotation) throw new PdfToolError('range', 'Annotation does not exist')
    page.deleteAnnotation(annotation); page.update()
    const output = document.saveToBuffer('compress')
    try { return new Uint8Array(output.asUint8Array()) } finally { output.destroy() }
  } finally { document.destroy() }
}
