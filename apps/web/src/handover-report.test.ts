import { describe, expect, it } from 'vitest'
import { loadTemporal } from '@commietools/tools/calculator/calendars'
import {
  emptyItem,
  filledItems,
  handoverLimits,
  isIsoDate,
  itemErrorKeys,
  reportErrorKeys,
  reportFileName,
  warrantyDeadlines,
  type HandoverDraft
} from '@commietools/tools/craft/handover'

const temporal = await loadTemporal()

const entwurf = (patch: Partial<HandoverDraft> = {}): HandoverDraft => ({
  object: 'Haus Musterweg 4',
  client: 'Frau Meier',
  contractor: 'Firma Bau',
  date: '2026-10-06',
  items: [{ ...emptyItem(1), description: 'Riss in der Decke', location: 'Wohnzimmer', deadline: '2026-10-20' }],
  ...patch
})

describe('Übergabeprotokoll — Datum', () => {
  it('nimmt nur wirklich vorhandene Kalendertage an', () => {
    expect(isIsoDate('2026-10-06')).toBe(true)
    expect(isIsoDate('2024-02-29')).toBe(true)
    expect(isIsoDate('2026-02-29')).toBe(false)
    expect(isIsoDate('2026-02-31')).toBe(false)
    expect(isIsoDate('2026-13-01')).toBe(false)
    expect(isIsoDate('2026-10-6')).toBe(false)
    expect(isIsoDate('06.10.2026')).toBe(false)
    expect(isIsoDate('')).toBe(false)
  })
})

describe('Übergabeprotokoll — Zeilen', () => {
  it('lässt leere Zeilen weg, statt sie als leere Tabellenzeile zu drucken', () => {
    const zeilen = [emptyItem(1), { ...emptyItem(2), description: '  ' }, { ...emptyItem(3), description: 'Fuge' }]
    expect(filledItems(zeilen).map((zeile) => zeile.description)).toEqual(['Fuge'])
  })

  it('meldet halb ausgefüllte Zeilen', () => {
    expect(itemErrorKeys({ ...emptyItem(1), deadline: '2026-10-20' })).toContain('tool.handover.error.descriptionMissing')
    expect(itemErrorKeys({ ...emptyItem(1), description: 'Fuge', deadline: '20.10.2026' })).toContain('tool.handover.error.deadlineInvalid')
    expect(itemErrorKeys({ ...emptyItem(1), description: 'Fuge', deadline: '' })).toEqual([])
  })

  it('prüft Längen an den erklärten Grenzen', () => {
    expect(itemErrorKeys({ ...emptyItem(1), description: 'x'.repeat(handoverLimits.descriptionMax + 1) })).toContain('tool.handover.error.descriptionLong')
    expect(itemErrorKeys({ ...emptyItem(1), description: 'x'.repeat(handoverLimits.descriptionMax) })).toEqual([])
    expect(itemErrorKeys({ ...emptyItem(1), description: 'Fuge', location: 'y'.repeat(handoverLimits.locationMax + 1) })).toContain('tool.handover.error.locationLong')
  })
})

describe('Übergabeprotokoll — ganze Prüfung', () => {
  it('nimmt einen vollständigen Entwurf an', () => {
    expect(reportErrorKeys(entwurf(), 2)).toEqual([])
  })

  it('meldet fehlende Pflichtangaben', () => {
    expect(reportErrorKeys(entwurf({ object: '  ' }), 2)).toContain('tool.handover.error.objectMissing')
    expect(reportErrorKeys(entwurf({ date: '2026-02-30' }), 2)).toContain('tool.handover.error.dateInvalid')
    expect(reportErrorKeys(entwurf({ items: [emptyItem(1)] }), 2)).toContain('tool.handover.error.noItems')
  })

  it('meldet die fehlende Unterschrift, ohne die Erzeugung zu verhindern', () => {
    const fehler = reportErrorKeys(entwurf(), 0)
    expect(fehler).toEqual(['tool.handover.error.noSignature'])
    // Genau dieser Schlüssel ist der Hinweis, den die Oberfläche durchlässt.
    expect(fehler.filter((key) => key !== 'tool.handover.error.noSignature')).toEqual([])
  })

  it('meldet zu viele Zeilen', () => {
    const viele = Array.from({ length: handoverLimits.itemsMax + 1 }, (_, index) => ({ ...emptyItem(index + 1), description: `Mangel ${index + 1}` }))
    expect(reportErrorKeys(entwurf({ items: viele }), 1)).toContain('tool.handover.error.tooManyItems')
  })
})

describe('Übergabeprotokoll — Gewährleistungsfristen', () => {
  it('rechnet fünf und vier Jahre ab dem Abnahmedatum', () => {
    const fristen = warrantyDeadlines('2026-10-06', temporal)
    expect(fristen).toEqual([
      { key: 'bgb', years: 5, date: '2031-10-06' },
      { key: 'vob', years: 4, date: '2030-10-06' }
    ])
  })

  it('trifft den Schalttag', () => {
    // Vom Rechner nachgerechnet: 2028-02-29 + 4 Jahre = 2032-02-29 (2032 ist ein Schaltjahr),
    // + 5 Jahre = 2033-02-28 (2033 nicht). Meine erste Erwartung war falsch, der Rechner richtig.
    expect(warrantyDeadlines('2028-02-29', temporal).map((frist) => frist.date)).toEqual(['2033-02-28', '2032-02-29'])
  })

  it('rechnet über den Jahreswechsel', () => {
    expect(warrantyDeadlines('2026-12-31', temporal).map((frist) => frist.date)).toEqual(['2031-12-31', '2030-12-31'])
  })

  it('gibt ohne brauchbares Datum nichts zurück, statt zu raten', () => {
    expect(warrantyDeadlines('', temporal)).toEqual([])
    expect(warrantyDeadlines('2026-02-30', temporal)).toEqual([])
  })
})

describe('Übergabeprotokoll — Dateiname', () => {
  it('bildet den Namen aus Objekt und Datum', () => {
    expect(reportFileName('Haus Musterweg 4', '2026-10-06')).toBe('haus-musterweg-4-2026-10-06-protokoll.pdf')
  })

  it('entschärft unzulässige Zeichen und fängt leere Namen ab', () => {
    expect(reportFileName('Haus/Weg:4', '')).toBe('haus-weg-4-protokoll.pdf')
    expect(reportFileName('   ', '2026-10-06')).toBe('protokoll-2026-10-06-protokoll.pdf')
  })
})
