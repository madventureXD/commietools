import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildReportPdf } from '@commietools/tools/pdf/report'
import type { ReportPdfInput, ReportPdfLabels } from '@commietools/tools/pdf/report'

/** Gültiges 1x1-PNG (rotes Pixel) als Bytes, damit Foto- und Unterschriftseinbettung geprüft wird. */
const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const pngBytes = (): Uint8Array => Uint8Array.from(atob(PNG_1X1), (character) => character.charCodeAt(0))

const labels: ReportPdfLabels = {
  object: 'Objekt',
  client: 'Auftraggeber',
  contractor: 'Auftragnehmer',
  date: 'Datum',
  items: 'Mängel',
  description: 'Beschreibung',
  location: 'Ort',
  deadline: 'Frist',
  photos: 'Fotos',
  signatures: 'Unterschriften',
  warranty: 'Gewährleistung',
  page: 'Seite',
  empty: 'Keine Mängel erfasst.'
}

function baseInput(overrides: Partial<ReportPdfInput> = {}): ReportPdfInput {
  return {
    title: 'Abnahmeprotokoll',
    object: 'Musterstraße 1',
    client: 'Bauherrin',
    contractor: 'Baufirma',
    date: '2026-10-06',
    items: [
      { description: 'Kratzer an der Türzarge im Erdgeschoss', location: 'EG Flur', deadline: '2026-11-01' },
      { description: 'Fliesenfuge im Bad unvollständig', location: 'OG Bad', deadline: '2026-11-15' }
    ],
    photos: [],
    signatures: [],
    warranty: [],
    labels,
    disclaimer: 'Dieses Protokoll wurde maschinell erstellt und ist ohne Unterschrift ungültig.',
    ...overrides
  }
}

async function load(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes)
}

describe('Übergabe-/Mängelprotokoll als PDF', () => {
  it('erzeugt ein ladbares PDF mit mindestens einer Seite', async () => {
    const bytes = await buildReportPdf(baseInput({
      photos: [{ bytes: pngBytes(), mimeType: 'image/png', note: 'Kratzer' }],
      signatures: [{ role: 'Bauherrin', bytes: pngBytes(), mimeType: 'image/png' }]
    }))
    const document = await load(bytes)
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('legt die Seite im A4-Format an', async () => {
    const document = await load(await buildReportPdf(baseInput()))
    const { width, height } = document.getPage(0).getSize()
    expect(Math.abs(width - 595)).toBeLessThanOrEqual(2)
    expect(Math.abs(height - 842)).toBeLessThanOrEqual(2)
  })

  it('fügt bei vielen Mängeln und Fotos mehr Seiten an', async () => {
    const small = await load(await buildReportPdf(baseInput()))
    const manyItems = Array.from({ length: 60 }, (_, index) => ({
      description: `Mangel Nummer ${index + 1} mit ausreichend langem Text, damit die Beschreibungsspalte umbrochen wird`,
      location: `Ort ${index + 1}`,
      deadline: '2026-12-01'
    }))
    const photos = Array.from({ length: 4 }, () => ({ bytes: pngBytes(), mimeType: 'image/png' as const }))
    const big = await load(await buildReportPdf(baseInput({ items: manyItems, photos })))
    expect(big.getPageCount()).toBeGreaterThan(small.getPageCount())
  })

  it('liefert auch ohne Mängel ein ladbares PDF', async () => {
    const document = await load(await buildReportPdf(baseInput({ items: [] })))
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('entschärft Umlaute und typografische Zeichen ohne Ausnahme', async () => {
    const bytes = await buildReportPdf(baseInput({
      title: 'Abnahme – „Größe geprüft“',
      object: 'Wohnanlage Südstraße 27 (Größe ca. 300 m²)',
      items: [{ description: 'Türblatt streift – Größe prüfen', location: 'EG „Flur“', deadline: 'Prüfung: 2026-11-01' }]
    }))
    const document = await load(bytes)
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('setzt Gewährleistungsfristen als eigenen Block', async () => {
    const document = await load(await buildReportPdf(baseInput({
      warranty: [{ label: 'Gewährleistung Fenster', date: '2027-04-30' }]
    })))
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1)
  })
})
