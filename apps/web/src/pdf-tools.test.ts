import { describe, expect, it } from 'vitest'
import { PDFDocument, degrees } from 'pdf-lib'
import { addPdfPageNumbers, addPdfWatermark, addVisiblePdfSignature, imagesToPdf, inspectPdf, mergePdfs, organizePdf, parsePageSelection, parseSplitGroups, PdfToolError, resolvePdfPagePlacement, resolvePdfPlacement, splitPdf } from '@commietools/tools/pdf/core'
import { addPdfAnnotation, deletePdfAnnotation, fillPdfForm, inspectPdfAnnotations, inspectPdfForm } from '@commietools/tools/pdf/m4'
import { compressionArguments, protectionArguments } from '@commietools/tools/pdf/m5'
import { addPdfAttachments, cleanPdfMetadata, comparePdfStructure, cropPdfPages, listPdfAttachments, readPdfMetadata, removePdfAttachment, renamePdfAttachment, safeAttachmentName } from '@commietools/tools/pdf/m8'
import { preflightPdfA, redactPdf } from '@commietools/tools/pdf/m9'
import * as mupdf from 'mupdf'

async function fixture(sizes: readonly [number, number][]) {
  const document = await PDFDocument.create()
  sizes.forEach(([width, height], index) => {
    const page = document.addPage([width, height])
    if (index === 1) page.setRotation(degrees(90))
  })
  document.setTitle('CommieTools fixture')
  return new Uint8Array(await document.save())
}

describe('PDF foundation', () => {
  it('inspects page geometry and metadata', async () => {
    const result = await inspectPdf(await fixture([[200, 300], [400, 500]]))
    expect(result.pageCount).toBe(2)
    expect(result.pages[0]).toMatchObject({ width: 200, height: 300, rotation: 0 })
    expect(result.pages[1]?.rotation).toBe(90)
    expect(result.title).toBe('CommieTools fixture')
  })

  it('rejects invalid data', async () => {
    await expect(inspectPdf(new Uint8Array([1, 2, 3]))).rejects.toMatchObject({ code: 'invalid' })
  })

  it('rejects empty data', async () => {
    await expect(inspectPdf(new Uint8Array())).rejects.toMatchObject({ code: 'empty' })
  })
})

describe('page range parser', () => {
  it('parses pages and forward ranges', () => expect(parsePageSelection('1-3, 5', 5)).toEqual([0, 1, 2, 4]))
  it('preserves reverse ranges', () => expect(parsePageSelection('4-2', 4)).toEqual([3, 2, 1]))
  it('allows intentional duplicates', () => expect(parsePageSelection('1,1,2', 2)).toEqual([0, 0, 1]))
  it('parses split groups', () => expect(parseSplitGroups('1-2; 3,5; 4', 5)).toEqual([[0, 1], [2, 4], [3]]))
  it('rejects malformed selections', () => expect(() => parsePageSelection('1-x', 3)).toThrow(PdfToolError))
  it('rejects pages outside the document', () => expect(() => parsePageSelection('4', 3)).toThrow(PdfToolError))
})

describe('M1 PDF operations', () => {
  it('merges documents in input order', async () => {
    const first = await fixture([[100, 200], [200, 300]])
    const second = await fixture([[300, 400]])
    const output = await mergePdfs([{ name: 'a.pdf', bytes: first }, { name: 'b.pdf', bytes: second }])
    expect((await inspectPdf(output)).pages.map(({ width }) => width)).toEqual([100, 200, 300])
  })

  it('merges selected pages in requested order', async () => {
    const source = await fixture([[100, 200], [200, 300], [300, 400]])
    const output = await mergePdfs([{ name: 'a.pdf', bytes: source, pages: [2, 0] }])
    expect((await inspectPdf(output)).pages.map(({ width }) => width)).toEqual([300, 100])
  })

  it('splits a document into custom groups', async () => {
    const source = await fixture([[100, 200], [200, 300], [300, 400]])
    const [first, second] = await splitPdf(source, [[0, 2], [1]])
    expect((await inspectPdf(first!)).pages.map(({ width }) => width)).toEqual([100, 300])
    expect((await inspectPdf(second!)).pageCount).toBe(1)
  })

  it('organizes, duplicates and rotates pages', async () => {
    const source = await fixture([[100, 200], [200, 300], [300, 400]])
    const output = await organizePdf(source, [{ sourceIndex: 2, rotation: 90 }, { sourceIndex: 0, rotation: -90 }, { sourceIndex: 2, rotation: 0 }])
    const result = await inspectPdf(output)
    expect(result.pages.map(({ width }) => width)).toEqual([300, 100, 300])
    expect(result.pages.map(({ rotation }) => rotation)).toEqual([90, 270, 0])
  })
})

describe('M3 PDF placement operations', () => {
  it('places elements at all shared anchor extremes', () => {
    expect(resolvePdfPlacement(600, 800, 100, 40, 'top-left', 20)).toEqual({ x: 20, y: 740, width: 100, height: 40 })
    expect(resolvePdfPlacement(600, 800, 100, 40, 'center', 20)).toEqual({ x: 250, y: 380, width: 100, height: 40 })
    expect(resolvePdfPlacement(600, 800, 100, 40, 'bottom-right', 20)).toEqual({ x: 480, y: 20, width: 100, height: 40 })
  })

  it('maps visual placement through CropBox offsets and page rotation', () => {
    const crop = { x: 10, y: 20, width: 200, height: 300 }
    expect(resolvePdfPagePlacement(240, 340, crop, 0, 50, 20, 'top-left', 10)).toEqual({ x: 20, y: 290, width: 50, height: 20, rotation: 0 })
    expect(resolvePdfPagePlacement(240, 340, crop, 90, 50, 20, 'top-left', 10)).toEqual({ x: 20, y: 80, width: 50, height: 20, rotation: -90 })
  })

  it('adds a watermark only to selected pages', async () => {
    const source = await fixture([[300, 400], [300, 400]])
    const output = await addPdfWatermark(source, { text: 'DRAFT', pages: [1], anchor: 'center', fontSize: 36, margin: 20, opacity: 0.25, rotation: -30, color: '#c91f2c', tiled: false, spacing: 80 })
    expect((await inspectPdf(output)).pageCount).toBe(2)
    expect(output.byteLength).toBeGreaterThan(source.byteLength)
  })

  it('accepts a caller-rendered Unicode watermark layer', async () => {
    const source = await fixture([[300, 400]])
    const image = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X2NDWQAAAABJRU5ErkJggg=='), (character) => character.charCodeAt(0))
    const output = await addPdfWatermark(source, { text: 'Grüße – 東京', textImage: image, pages: [0], anchor: 'center', fontSize: 36, margin: 20, opacity: 0.25, rotation: -30, color: '#c91f2c', tiled: false, spacing: 80 })
    expect((await inspectPdf(output)).pageCount).toBe(1)
  })

  it('numbers a selected logical range independently of physical page numbers', async () => {
    const source = await fixture([[300, 400], [300, 400], [300, 400]])
    const output = await addPdfPageNumbers(source, { pages: [1, 2], anchor: 'bottom-center', fontSize: 11, margin: 24, opacity: 1, color: '#17181b', start: 5, prefix: 'Page ', suffix: '', format: 'page-total' })
    expect((await inspectPdf(output)).pageCount).toBe(3)
    expect(output.byteLength).toBeGreaterThan(source.byteLength)
  })

  it('embeds a visible signature image without changing the page count', async () => {
    const source = await fixture([[300, 400]])
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X2NDWQAAAABJRU5ErkJggg=='
    const image = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
    const output = await addVisiblePdfSignature(source, { pageIndex: 0, image, mimeType: 'image/png', width: 120, opacity: 1, rotation: 0, anchor: 'bottom-right', margin: 20, dateText: '2026-10-03' })
    expect((await inspectPdf(output)).pageCount).toBe(1)
    expect(output.byteLength).toBeGreaterThan(source.byteLength)
  })
})

describe('M2 image conversion', () => {
  const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='), (character) => character.charCodeAt(0))

  it('creates one PDF page per image', async () => {
    const output = await imagesToPdf([
      { name: 'first.png', bytes: png, mimeType: 'image/png' },
      { name: 'second.png', bytes: png, mimeType: 'image/png' }
    ], { pageSize: 'a4', orientation: 'portrait', margin: 24, fit: 'contain' })
    const result = await inspectPdf(output)
    expect(result.pageCount).toBe(2)
    expect(result.pages[0]?.width).toBeCloseTo(595.28, 1)
    expect(result.pages[0]?.height).toBeCloseTo(841.89, 1)
  })

  it('supports automatic landscape pages', async () => {
    const output = await imagesToPdf([{ name: 'pixel.png', bytes: png, mimeType: 'image/png' }], { pageSize: 'letter', orientation: 'landscape', margin: 0, fit: 'cover' })
    const [page] = (await inspectPdf(output)).pages
    expect(page?.width).toBe(792)
    expect(page?.height).toBe(612)
  })

  it('rejects an empty image collection', async () => {
    await expect(imagesToPdf([], { pageSize: 'auto', orientation: 'auto', margin: 0, fit: 'contain' })).rejects.toMatchObject({ code: 'empty' })
  })
})

describe('M4 interactive PDF operations', () => {
  async function formFixture() {
    const document = await PDFDocument.create()
    const page = document.addPage([400, 500])
    const form = document.getForm()
    const name = form.createTextField('person.name'); name.addToPage(page, { x: 40, y: 400, width: 220, height: 28 })
    const accepted = form.createCheckBox('accepted'); accepted.addToPage(page, { x: 40, y: 350, width: 20, height: 20 })
    const country = form.createDropdown('country'); country.setOptions(['Deutschland', 'France']); country.addToPage(page, { x: 40, y: 300, width: 180, height: 28 })
    return new Uint8Array(await document.save())
  }

  it('inspects and fills AcroForm fields with Unicode values', async () => {
    const source = await formFixture()
    const initial = inspectPdfForm(source)
    expect(initial.fields.map((field) => field.name)).toEqual(['person.name', 'accepted', 'country'])
    const output = fillPdfForm(source, { 'person.name': 'Jörg Weiß', accepted: true, country: 'Deutschland' })
    const result = inspectPdfForm(output)
    expect(result.fields.find((field) => field.name === 'person.name')?.value).toBe('Jörg Weiß')
    expect(result.fields.find((field) => field.name === 'accepted')?.value).toBe(true)
    expect(result.fields.find((field) => field.name === 'country')?.value).toBe('Deutschland')
  })

  it('can irreversibly flatten filled form fields', async () => {
    const output = fillPdfForm(await formFixture(), { 'person.name': 'Ada' }, true)
    expect(inspectPdfForm(output).fields).toHaveLength(0)
  })

  it('adds and deletes a genuine PDF annotation', async () => {
    const source = await fixture([[400, 500]])
    const added = addPdfAnnotation(source, { pageIndex: 0, type: 'Highlight', rect: [40, 60, 220, 90], contents: 'Wichtig', author: 'CommieTools', color: [1, 0.8, 0], opacity: 0.5 })
    const annotations = inspectPdfAnnotations(added)
    expect(annotations).toHaveLength(1)
    expect(annotations[0]).toMatchObject({ type: 'Highlight', contents: 'Wichtig', author: 'CommieTools' })
    expect(inspectPdfAnnotations(deletePdfAnnotation(added, 0, 0))).toHaveLength(0)
  })
})

describe('M5 QPDF operation plans', () => {
  it('always chooses AES-256 and maps permissions explicitly', () => {
    const args = protectionArguments({ userPassword: 'Öffnen 2026', ownerPassword: 'Verwalten 2026', printing: 'low', modification: 'form', allowExtraction: false })
    expect(args).toContain('--bits=256')
    expect(args).toContain('--print=low')
    expect(args).toContain('--modify=form')
    expect(args).toContain('--extract=n')
  })

  it('rejects empty or identical protection passwords', () => {
    expect(() => protectionArguments({ userPassword: '', ownerPassword: 'owner', printing: 'full', modification: 'all', allowExtraction: true })).toThrow(PdfToolError)
    expect(() => protectionArguments({ userPassword: 'same', ownerPassword: 'same', printing: 'full', modification: 'all', allowExtraction: true })).toThrow(PdfToolError)
  })

  it('keeps structural compression lossless unless an image level is selected', () => {
    expect(compressionArguments('lossless')).not.toContain('--optimize-images')
    expect(compressionArguments('balanced')).toEqual(expect.arrayContaining(['--optimize-images', '--jpeg-quality=82']))
    expect(compressionArguments('strong')).toEqual(expect.arrayContaining(['--optimize-images', '--jpeg-quality=65']))
  })
})

describe('M8 document maintenance', () => {
  it('reads and removes supported metadata', async () => {
    const source = await fixture([[200, 300]])
    expect((await readPdfMetadata(source)).title).toBe('CommieTools fixture')
    expect((await readPdfMetadata(await cleanPdfMetadata(source))).title).toBe('')
  })

  it('sets a smaller crop box without changing the page count', async () => {
    const output = await cropPdfPages(await fixture([[200, 300]]), { pages: [0], top: 10, right: 20, bottom: 30, left: 40 })
    const loaded = await PDFDocument.load(output)
    expect(loaded.getPage(0).getCropBox()).toMatchObject({ x: 40, y: 30, width: 140, height: 260 })
  })

  it('adds, lists and extracts an embedded attachment', async () => {
    const payload = new TextEncoder().encode('M8 attachment')
    const output = await addPdfAttachments(await fixture([[200, 300]]), [{ name: 'test.txt', bytes: payload, mimeType: 'text/plain' }])
    const [attachment] = await listPdfAttachments(output)
    expect(attachment?.name).toBe('test.txt')
    expect(new TextDecoder().decode(attachment?.bytes)).toBe('M8 attachment')
    const renamed = await renamePdfAttachment(output, 0, '../../unsafe:name.txt')
    expect((await listPdfAttachments(renamed))[0]?.name).toBe('unsafe_name.txt')
    expect(await listPdfAttachments(await removePdfAttachment(renamed, 0))).toHaveLength(0)
    expect(safeAttachmentName('..\\..\\CON?.txt')).toBe('CON_.txt')
    expect(safeAttachmentName('../CON')).toBe('_CON')
    expect(safeAttachmentName('report\u202Efdp.exe')).toBe('report_fdp.exe')
  })

  it('compares geometry and extracted text independently', () => {
    const comparison = comparePdfStructure({ pages: [{ width: 200, height: 300, rotation: 0, text: 'A' }] }, { pages: [{ width: 200, height: 300, rotation: 0, text: 'B' }] })
    expect(comparison.pages[0]).toMatchObject({ geometryEqual: true, textEqual: false })
  })
})

describe('M9 compliance and redaction gates', () => {
  it('detects a declared PDF/A flavour without claiming conformance', () => {
    const bytes = new TextEncoder().encode('%PDF-1.7\n<x:xmpmeta><pdfaid:part>2</pdfaid:part><pdfaid:conformance>B</pdfaid:conformance></x:xmpmeta>\n/OutputIntent')
    expect(preflightPdfA(bytes)).toMatchObject({ declaredPart: '2', declaredConformance: 'B', hasXmp: true, hasOutputIntent: true, verdict: 'needs-independent-validation' })
  })

  it('applies a destructive full-page redaction', async () => {
    const document = await PDFDocument.create()
    const page = document.addPage([300, 300])
    page.drawText('SECRET VALUE', { x: 40, y: 140 })
    document.setTitle('Sensitive title')
    const source = new Uint8Array(await document.save())
    const annotated = addPdfAnnotation(source, { pageIndex: 0, type: 'Text', rect: [20, 20, 40, 40], contents: 'Sensitive note', author: 'Tester', color: [1, 1, 0], opacity: 1 })
    const output = redactPdf(annotated, [{ pageIndex: 0, x: 0, y: 0, width: 300, height: 300 }], { clearMetadata: true, removePageAnnotations: true })
    const checked = new mupdf.PDFDocument(output)
    try { expect(checked.loadPage(0).toStructuredText('').asText()).not.toContain('SECRET VALUE'); expect(checked.loadPage(0).getAnnotations()).toHaveLength(0); expect(checked.getMetaData('info:Title') ?? '').toBe('') }
    finally { checked.destroy() }
  })
})
