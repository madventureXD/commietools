import { describe, expect, it } from 'vitest'
import { PDFDocument, degrees } from 'pdf-lib'
import { addPdfAnnotation, addPdfPageNumbers, addPdfWatermark, addVisiblePdfSignature, deletePdfAnnotation, fillPdfForm, imagesToPdf, inspectPdf, inspectPdfAnnotations, inspectPdfForm, mergePdfs, organizePdf, parsePageSelection, parseSplitGroups, PdfToolError, resolvePdfPagePlacement, resolvePdfPlacement, splitPdf } from '@commietools/tools'

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
