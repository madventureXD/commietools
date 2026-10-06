import { describe, expect, it } from 'vitest'
import { loadTemporal } from '@commietools/tools/calculator/calendars'
import {
  clampWarnDays,
  inspectionLimits,
  isIntervalMonths,
  parseCount,
  plan,
  toCsv,
  type InspectionItem
} from '@commietools/tools/craft/inspection'

const temporal = await loadTemporal()

const heute = '2026-10-06'

const eintrag = (teil: Partial<InspectionItem> & { id: string }): InspectionItem => ({
  label: 'Leiter',
  intervalMonths: '12',
  lastChecked: '2025-10-06',
  note: '',
  ...teil
})

const rechnen = (items: InspectionItem[], warnDays = 30) => plan(items, heute, warnDays, temporal)

describe('Prüffristen — Fälligkeit rechnen', () => {
  it('verschiebt über Monatsenden korrekt (31.01. + 1 Monat)', () => {
    // Erwartung mit Temporal erzeugt, nicht im Kopf gerechnet: 2026 ist kein Schaltjahr.
    const ergebnis = rechnen([eintrag({ id: 'a', intervalMonths: '1', lastChecked: '2026-01-31' })])
    expect(ergebnis.ok).toBe(true)
    expect(ergebnis.rows[0]?.nextDue).toBe('2026-02-28')
  })

  it('nimmt im Schaltjahr den 29. Februar', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', intervalMonths: '1', lastChecked: '2024-01-31' })])
    expect(ergebnis.rows[0]?.nextDue).toBe('2024-02-29')
  })

  it('rechnet über den Jahreswechsel', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', intervalMonths: '3', lastChecked: '2025-12-15' })])
    expect(ergebnis.rows[0]?.nextDue).toBe('2026-03-15')
  })

  it('behält den Monatsletzten über ein Jahr', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', intervalMonths: '12', lastChecked: '2026-02-28' })])
    expect(ergebnis.rows[0]?.nextDue).toBe('2027-02-28')
  })

  it('zählt „heute fällig" als bald fällig, nicht als überfällig', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', intervalMonths: '12', lastChecked: '2025-10-06' })])
    expect(ergebnis.rows[0]?.daysUntil).toBe(0)
    expect(ergebnis.rows[0]?.state).toBe('dueSoon')
  })

  it('trennt die Warnschwelle genau an der Grenze', () => {
    // 2026-11-05 ist 30 Tage entfernt, 2026-11-06 ist 31 Tage entfernt (mit Temporal gemessen).
    const grenzfall = rechnen([eintrag({ id: 'a', intervalMonths: '7', lastChecked: '2026-04-05' })], 30)
    const knappDaneben = rechnen([eintrag({ id: 'b', intervalMonths: '7', lastChecked: '2026-04-06' })], 30)
    expect(grenzfall.rows[0]?.daysUntil).toBe(30)
    expect(grenzfall.rows[0]?.state).toBe('dueSoon')
    expect(knappDaneben.rows[0]?.daysUntil).toBe(31)
    expect(knappDaneben.rows[0]?.state).toBe('ok')
  })

  it('meldet Überfälliges mit negativen Tagen', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', intervalMonths: '2', lastChecked: '2026-08-01' })])
    expect(ergebnis.rows[0]?.daysUntil).toBe(-5)
    expect(ergebnis.rows[0]?.state).toBe('overdue')
  })

  it('sortiert überfällig vor bald fällig vor in Ordnung', () => {
    // Restzeiten mit Temporal gemessen: -97 / -16 / 14 / 45 Tage.
    const ergebnis = rechnen([
      eintrag({ id: 'ok', intervalMonths: '2', lastChecked: '2026-09-20' }),
      eintrag({ id: 'bald', intervalMonths: '12', lastChecked: '2025-10-20' }),
      eintrag({ id: 'ueberfaellig-spaet', intervalMonths: '3', lastChecked: '2026-06-20' }),
      eintrag({ id: 'ueberfaellig-frueh', intervalMonths: '6', lastChecked: '2026-01-01' })
    ])
    expect(ergebnis.rows.map((row) => row.id)).toEqual(['ueberfaellig-frueh', 'ueberfaellig-spaet', 'bald', 'ok'])
    expect(ergebnis.rows.map((row) => row.state)).toEqual(['overdue', 'overdue', 'dueSoon', 'ok'])
  })
})

describe('Prüffristen — Grenzwerte und Fehlerfälle', () => {
  it('weist eine leere Liste ab', () => {
    const ergebnis = rechnen([])
    expect(ergebnis.ok).toBe(false)
    expect(ergebnis.error).toBe('empty')
  })

  it('weist eine fehlende oder zu lange Bezeichnung ab', () => {
    expect(rechnen([eintrag({ id: 'a', label: '   ' })]).error).toBe('label')
    expect(rechnen([eintrag({ id: 'a', label: 'x'.repeat(inspectionLimits.labelMax + 1) })]).error).toBe('label')
    const ergebnis = rechnen([eintrag({ id: 'a', label: '   ' })])
    expect(ergebnis.errorItemId).toBe('a')
  })

  it('weist ein Intervall außerhalb der Grenzen ab — je Grenze eine Prüfung', () => {
    expect(rechnen([eintrag({ id: 'a', intervalMonths: String(inspectionLimits.intervalMinMonths - 1) })]).error).toBe('interval')
    expect(rechnen([eintrag({ id: 'a', intervalMonths: String(inspectionLimits.intervalMaxMonths + 1) })]).error).toBe('interval')
    expect(rechnen([eintrag({ id: 'a', intervalMonths: '3.5' })]).error).toBe('interval')
    expect(rechnen([eintrag({ id: 'a', intervalMonths: '' })]).error).toBe('interval')
    // Untergrenze und Obergrenze selbst müssen durchgehen.
    expect(rechnen([eintrag({ id: 'a', intervalMonths: String(inspectionLimits.intervalMinMonths) })]).ok).toBe(true)
    expect(rechnen([eintrag({ id: 'a', intervalMonths: String(inspectionLimits.intervalMaxMonths) })]).ok).toBe(true)
  })

  it('weist unbrauchbare und unmögliche Daten ab', () => {
    expect(rechnen([eintrag({ id: 'a', lastChecked: '' })]).error).toBe('date')
    expect(rechnen([eintrag({ id: 'a', lastChecked: '06.10.2026' })]).error).toBe('date')
    expect(rechnen([eintrag({ id: 'a', lastChecked: '2026-02-31' })]).error).toBe('date')
  })

  it('weist eine Prüfung in der Zukunft ab', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', lastChecked: '2026-10-07' })])
    expect(ergebnis.error).toBe('future')
    expect(ergebnis.errorItemId).toBe('a')
    // Der heutige Tag selbst ist erlaubt.
    expect(rechnen([eintrag({ id: 'a', lastChecked: heute })]).ok).toBe(true)
  })

  it('kürzt eine zu lange Notiz, statt sie abzuweisen', () => {
    const ergebnis = rechnen([eintrag({ id: 'a', note: 'n'.repeat(inspectionLimits.noteMax + 50) })])
    expect(ergebnis.ok).toBe(true)
    expect(ergebnis.rows[0]?.note).toHaveLength(inspectionLimits.noteMax)
  })

  it('weist zu viele Einträge ab', () => {
    const viele = Array.from({ length: inspectionLimits.itemsMax + 1 }, (_, index) => eintrag({ id: `i${index}` }))
    expect(rechnen(viele).error).toBe('tooMany')
  })

  it('prüft die Warnschwelle gegen ihre eigenen Grenzen', () => {
    expect(clampWarnDays(String(inspectionLimits.warnDaysMin - 1))).toBeNull()
    expect(clampWarnDays(String(inspectionLimits.warnDaysMax + 1))).toBeNull()
    expect(clampWarnDays('Dreißig')).toBeNull()
    expect(clampWarnDays('30')).toBe(30)
    expect(clampWarnDays(String(inspectionLimits.warnDaysMin))).toBe(inspectionLimits.warnDaysMin)
    expect(clampWarnDays(String(inspectionLimits.warnDaysMax))).toBe(inspectionLimits.warnDaysMax)
  })

  it('nimmt Komma als Dezimaltrennzeichen an, aber keine halben Monate', () => {
    expect(parseCount('2,5')).toBeNull()
    expect(parseCount('2.5')).toBeNull()
    expect(parseCount(' 4 ')).toBe(4)
    expect(isIntervalMonths('4')).toBe(true)
    expect(isIntervalMonths('4,5')).toBe(false)
  })
})

describe('Prüffristen — Export', () => {
  const kopf = ['Bezeichnung', 'Notiz', 'Intervall', 'Letzte Prüfung', 'Fällig am', 'Resttage']

  it('gibt genau die gerechneten Zeilen aus, mit Datum im Format der Sprache', () => {
    const ergebnis = rechnen([
      eintrag({ id: 'a', intervalMonths: '3', lastChecked: '2026-07-15', label: 'Leiter', note: 'Halle 2' })
    ])
    const csv = toCsv(ergebnis.rows, kopf, 'de-DE')
    const zeilen = csv.trim().split('\r\n')
    expect(zeilen).toHaveLength(2)
    expect(zeilen[0]).toBe(kopf.join(';'))
    // Fällig 2026-10-15, Bezugstag 2026-10-06 → 9 Resttage (mit Temporal gemessen), Datum deutsch.
    expect(zeilen[1]).toBe('Leiter;Halle 2;3;15.07.2026;15.10.2026;9')
  })

  it('setzt spanische Datumsangaben und schützt Sonderzeichen', () => {
    const ergebnis = rechnen([
      eintrag({ id: 'a', intervalMonths: '3', lastChecked: '2025-12-15', label: 'Leiter; Halle "2"', note: '' })
    ])
    const csv = toCsv(ergebnis.rows, kopf, 'es-ES')
    const zeilen = csv.trim().split('\r\n')
    expect(zeilen[1]).toContain('"Leiter; Halle ""2"""')
    expect(zeilen[1]).toContain('15 mar 2026')
  })

  it('schreibt eine Zeile je Eintrag — Anzahl gegen die Liste geprüft', () => {
    const eintraege = [
      eintrag({ id: 'a', lastChecked: '2026-08-01', intervalMonths: '2' }),
      eintrag({ id: 'b', lastChecked: '2025-10-06' }),
      eintrag({ id: 'c', lastChecked: '2026-04-06', intervalMonths: '7' })
    ]
    const ergebnis = rechnen(eintraege)
    const csv = toCsv(ergebnis.rows, kopf, 'de-DE')
    expect(csv.trim().split('\r\n')).toHaveLength(eintraege.length + 1)
  })
})
