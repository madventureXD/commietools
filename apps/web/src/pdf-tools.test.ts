import { describe, expect, it } from 'vitest'
import { PDFDocument, degrees } from 'pdf-lib'
import { inspectPdf, mergePdfs, organizePdf, parsePageSelection, parseSplitGroups, PdfToolError, splitPdf } from '@commietools/tools'

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
