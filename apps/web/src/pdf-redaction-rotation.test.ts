import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { redactPdf } from '@commietools/tools/pdf/m9'

/**
 * **Regressionstest zur Rotation (Karte M7-003).**
 *
 * Gemessen am 2026-10-07 (`work/m7-003-rotation-sonde.mjs`): MuPDF setzt Redaktionsrechtecke im
 * **angezeigten** Seitenraum. Auf einer um 90 Grad gedrehten Seite traf ein Rechteck im unrotierten
 * Raum den Text **nicht**; dasselbe Rechteck in Anzeigekoordinaten entfernte ihn.
 *
 * Der Test hält beide Hälften fest: Anzeigekoordinaten treffen, unrotierte Koordinaten treffen
 * nicht. Ohne die zweite Hälfte wäre nicht belegt, dass der Test überhaupt etwas prüft.
 */
const BREITE = 595.28
const HOEHE = 841.89

async function baueRotierteSeite() {
  const document = await PDFDocument.create()
  const font = await document.embedFont(StandardFonts.Helvetica)
  const page = document.addPage([BREITE, HOEHE])
  page.setRotation(degrees(90))
  page.drawText('DREHTEXT', { x: 100, y: 700, size: 18, font })
  return new Uint8Array(await document.save())
}

async function seitenText(bytes: Uint8Array) {
  const task = getDocument({ data: bytes.slice() })
  const document = await task.promise
  const page = await document.getPage(1)
  const content = await page.getTextContent()
  const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ').trim()
  page.cleanup()
  await document.cleanup()
  await task.destroy()
  return text
}

/** Textkasten in Anzeigekoordinaten, aus pdf.js — unabhängig von der Projektlogik. */
async function kastenInAnzeige(bytes: Uint8Array) {
  const task = getDocument({ data: bytes.slice() })
  const document = await task.promise
  const page = await document.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  const content = await page.getTextContent()
  const item = content.items.find((eintrag) => 'str' in eintrag && eintrag.str.trim() === 'DREHTEXT')
  if (!item || !('str' in item)) throw new Error('Text nicht gefunden')
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const matrix = pdfjs.Util.transform(viewport.transform, item.transform)
  const gedreht = viewport.rotation === 90 || viewport.rotation === 270
  const dx = gedreht ? item.height : item.width
  const dy = gedreht ? item.width : item.height
  const rand = 10
  page.cleanup()
  await document.cleanup()
  await task.destroy()
  return { x: matrix[4] - rand, y: matrix[5] - rand, width: dx + 2 * rand, height: dy + 2 * rand, viewport: { width: viewport.width, height: viewport.height } }
}

describe('Schwärzung auf einer gedrehten Seite (M7-003)', () => {
  it('hat eine um 90 Grad gedrehte Seite mit quer liegender Anzeige', async () => {
    const bytes = await baueRotierteSeite()
    const kasten = await kastenInAnzeige(bytes)
    expect(kasten.viewport.width).toBeCloseTo(HOEHE, 1)
    expect(kasten.viewport.height).toBeCloseTo(BREITE, 1)
  })

  it('entfernt den Text, wenn das Rechteck in Anzeigekoordinaten liegt', async () => {
    const bytes = await baueRotierteSeite()
    const kasten = await kastenInAnzeige(bytes)
    const ergebnis = redactPdf(bytes, [{ pageIndex: 0, x: kasten.x, y: kasten.y, width: kasten.width, height: kasten.height }])
    expect(await seitenText(ergebnis)).not.toContain('DREHTEXT')
  })

  it('Gegenprobe: dieselbe Stelle im unrotierten Raum trifft den Text NICHT', async () => {
    const bytes = await baueRotierteSeite()
    // Der Text liegt unrotiert bei x 100…229, y_oben 123,9…141,9 — würde MuPDF diesen Raum
    // erwarten, müsste dieses Rechteck treffen.
    const ergebnis = redactPdf(bytes, [{ pageIndex: 0, x: 95, y: 118, width: 140, height: 30 }])
    expect(await seitenText(ergebnis)).toContain('DREHTEXT')
  })
})
