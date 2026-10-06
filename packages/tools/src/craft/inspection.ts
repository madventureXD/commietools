/**
 * Prüffristen (Welle D, Werkzeug 23) — reine Fachlogik, keine Texte, kein DOM.
 *
 * **Warum keine vorgeschlagenen Intervalle:** Prüffristen für Leitern, PSA und Prüfmittel stammen
 * aus der Gefährdungsbeurteilung des Betreibers und aus Unfallverhütungsvorschriften. Beides ist
 * nicht frei übernehmbar (Konzept Q2), und ein geratener Vorschlag wäre hier gefährlich statt
 * hilfreich. Das Werkzeug rechnet, was eingegeben wird, und sagt in seinen Annahmen, woher die
 * Frist kommen muss.
 *
 * **Datumsarithmetik über Temporal** (wie `calculator/dates.ts`): nur so stimmen Monatsenden
 * (31. Januar + 1 Monat = 28./29. Februar).
 */
import type { Temporal as TemporalNamespace } from '@js-temporal/polyfill'
import { addToDate } from '../calculator/dates'

type TemporalApi = typeof TemporalNamespace

/** Grenzen je Feld. Jede Grenze wird in `plan` auch wirklich abgefragt (nicht nur angelegt). */
export const inspectionLimits = {
  intervalMinMonths: 1,
  intervalMaxMonths: 120,
  warnDaysMin: 1,
  warnDaysMax: 365,
  labelMax: 80,
  noteMax: 200,
  itemsMax: 200,
  daysUntilOverdueMax: 36500
} as const

export type InspectionErrorCode =
  | 'empty'
  | 'label'
  | 'interval'
  | 'date'
  | 'future'
  | 'tooMany'

export interface InspectionItem {
  readonly id: string
  readonly label: string
  readonly intervalMonths: string
  /** Letzte Prüfung, ISO `JJJJ-MM-TT`. */
  readonly lastChecked: string
  readonly note: string
}

export type InspectionState = 'overdue' | 'dueSoon' | 'ok'

export interface InspectionRow {
  readonly id: string
  readonly label: string
  readonly note: string
  readonly intervalMonths: number
  readonly lastChecked: string
  /** Fällig am, ISO — aus der letzten Prüfung plus Intervall. */
  readonly nextDue: string
  /** Tage bis zur Fälligkeit; negativ bedeutet überfällig. */
  readonly daysUntil: number
  readonly state: InspectionState
}

export interface InspectionPlan {
  readonly ok: boolean
  readonly error: InspectionErrorCode | null
  /** Zeile, auf die sich der Fehler bezieht (Kennung), oder `null` beim Fehler der Gesamtliste. */
  readonly errorItemId: string | null
  readonly rows: readonly InspectionRow[]
}

function fail(error: InspectionErrorCode, errorItemId: string | null = null): InspectionPlan {
  return { ok: false, error, errorItemId, rows: [] }
}

/** Ganzzahl aus einem Feldwert; `null`, wenn es keine ist. */
export function parseCount(value: string): number | null {
  const trimmed = value.trim().replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null
  const number = Number(trimmed)
  if (!Number.isFinite(number)) return null
  return Number.isInteger(number) ? number : null
}

/** Ein Intervall in Monaten ist nur brauchbar, wenn es eine ganze Zahl im erlaubten Bereich ist. */
export function isIntervalMonths(value: string): boolean {
  const months = parseCount(value)
  return months !== null && months >= inspectionLimits.intervalMinMonths && months <= inspectionLimits.intervalMaxMonths
}

/**
 * Rechnet die Liste durch.
 *
 * Reihenfolge: überfällig zuerst, dann bald fällig, dann in Ordnung; innerhalb einer Gruppe die
 * kleinste Restzeit zuerst. Der Zustand ist eine Aussage über **Tage**, nicht über Kalendertage
 * mit Uhrzeit: „heute fällig" (Restzeit 0) zählt als bald fällig, nicht als überfällig.
 */
export function plan(
  items: readonly InspectionItem[],
  todayIso: string,
  warnDays: number,
  temporal: TemporalApi
): InspectionPlan {
  if (!items.length) return fail('empty')
  if (items.length > inspectionLimits.itemsMax) return fail('tooMany')

  const today = parseDate(todayIso, temporal)
  if (!today) return fail('date')

  const rows: InspectionRow[] = []
  for (const item of items) {
    const label = item.label.trim()
    if (!label || label.length > inspectionLimits.labelMax) return fail('label', item.id)
    if (!isIntervalMonths(item.intervalMonths)) return fail('interval', item.id)

    const lastChecked = parseDate(item.lastChecked, temporal)
    if (!lastChecked) return fail('date', item.id)
    // Eine Prüfung in der Zukunft kann nicht stattgefunden haben.
    if (today.until(lastChecked).days > 0) return fail('future', item.id)

    const shifted = addToDate(item.lastChecked.trim(), Number(item.intervalMonths), 'months', temporal)
    if (!shifted.ok) return fail('date', item.id)
    const nextDue = shifted.values.iso ?? ''
    const due = parseDate(nextDue, temporal)
    if (!due) return fail('date', item.id)

    const daysUntil = today.until(due).days
    const state: InspectionState = daysUntil < 0 ? 'overdue' : daysUntil <= warnDays ? 'dueSoon' : 'ok'
    rows.push({
      id: item.id,
      label,
      note: item.note.trim().slice(0, inspectionLimits.noteMax),
      intervalMonths: Number(item.intervalMonths),
      lastChecked: item.lastChecked.trim(),
      nextDue,
      daysUntil,
      state
    })
  }

  const rank: Record<InspectionState, number> = { overdue: 0, dueSoon: 1, ok: 2 }
  rows.sort((first, second) => rank[first.state] - rank[second.state] || first.daysUntil - second.daysUntil || first.label.localeCompare(second.label))
  return { ok: true, error: null, errorItemId: null, rows }
}

function parseDate(iso: string, temporal: TemporalApi) {
  const trimmed = iso.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  try {
    return temporal.PlainDate.from(trimmed)
  } catch {
    return null
  }
}

/** Ist die Warnschwelle ein brauchbarer Wert? Wird in der Oberfläche vor der Rechnung geprüft. */
export function clampWarnDays(value: string): number | null {
  const days = parseCount(value)
  if (days === null) return null
  if (days < inspectionLimits.warnDaysMin || days > inspectionLimits.warnDaysMax) return null
  return days
}

/**
 * Datum im Format der Sprache — **eine** Stelle für Oberfläche und Export, damit beide
 * dieselbe Schreibweise zeigen.
 */
export function formatInspectionDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${iso}T12:00:00Z`))
}

/**
 * Tabelle für den Export. Trennzeichen ist das Semikolon, weil die Tabelle in deutschen und
 * spanischen Tabellenprogrammen geöffnet wird; Datumsangaben stehen im Format der Sprache.
 */
export function toCsv(rows: readonly InspectionRow[], headers: readonly string[], locale: string): string {
  const feld = (value: string) => (/[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)
  const tag = (iso: string) => formatInspectionDate(iso, locale)
  const zeilen = [headers.map(feld).join(';')]
  for (const row of rows) {
    zeilen.push([
      row.label,
      row.note,
      String(row.intervalMonths),
      tag(row.lastChecked),
      tag(row.nextDue),
      String(row.daysUntil)
    ].map(feld).join(';'))
  }
  return zeilen.join('\r\n') + '\r\n'
}
