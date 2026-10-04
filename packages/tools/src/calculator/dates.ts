/**
 * Zeit und Datum für das Werkzeug „Zeit und Datum" (Welle 4 der Suite „Rechnen").
 *
 * Datumsarithmetik rechnet über **Temporal** (`PlainDate`), nicht über `Date`: Nur so stimmen
 * Monats- und Jahresgrenzen (31. Januar + 1 Monat = 28./29. Februar, 29. Februar + 1 Jahr =
 * 28. Februar). Temporals sind unveränderlich — jede Rechnung liefert ein neues Datum.
 *
 * **Fristenregel (BGB §§ 187–188, 193), hier umgesetzt:**
 * - Der Tag des Ereignisses zählt nicht mit; die Frist beginnt am Tag danach (§ 187 Abs. 1).
 * - Eine nach Wochen/Monaten/Jahren bestimmte Frist endet mit Ablauf des Tages, der dem
 *   **Ereignistag** entspricht (§ 188 Abs. 2 in Verbindung mit § 187 Abs. 1).
 * - Fehlt dieser Tag im letzten Monat, endet die Frist mit dem letzten Tag des Monats
 *   (§ 188 Abs. 3).
 * - Fällt das Ende auf Samstag oder Sonntag, verschiebt es sich auf den nächsten Werktag
 *   (§ 193). **Feiertage sind nicht berücksichtigt** — das wäre ein eigener Kalender je
 *   Bundesland und gehört in einen eigenen Schritt.
 */
import type { Temporal as TemporalNamespace } from '@js-temporal/polyfill'

type TemporalApi = typeof TemporalNamespace
type PlainDate = ReturnType<TemporalApi['PlainDate']['from']>

export type DateErrorCode = 'invalidDate' | 'invalidRange' | 'unsupported'

export interface DateResult {
  readonly ok: boolean
  readonly values: Readonly<Record<string, string>>
  readonly error: DateErrorCode | null
}

export type DurationUnit = 'days' | 'weeks' | 'months' | 'years'

function fail(error: DateErrorCode): DateResult {
  return { ok: false, values: {}, error }
}

function parse(iso: string, temporal: TemporalApi): PlainDate | null {
  const trimmed = iso.trim()
  if (!trimmed) return null
  try {
    return temporal.PlainDate.from(trimmed)
  } catch {
    return null
  }
}

/** Abstand zwischen zwei Daten — Tage, Wochen, volle Monate und volle Jahre. */
export function dateDifference(fromIso: string, toIso: string, temporal: TemporalApi): DateResult {
  const from = parse(fromIso, temporal)
  const to = parse(toIso, temporal)
  if (!from || !to) return fail('invalidDate')

  const days = from.until(to).days
  const months = from.until(to, { largestUnit: 'months' }).months
  const years = from.until(to, { largestUnit: 'years' }).years
  const weeks = Math.trunc(days / 7)
  return {
    ok: true,
    values: {
      days: String(days),
      weeks: String(weeks),
      weeksRemainder: String(days - weeks * 7),
      months: String(months),
      years: String(years),
      workingDays: String(countWorkingDays(fromIso, toIso, temporal)),
      // Rückrichtung ist nicht einfach die negative Zahl, sondern ein eigenes Ergebnis.
      reverse: `${fromIso} → ${toIso}`
    },
    error: null
  }
}

/** Datum verschieben. Monats- und Jahresgrenzen behandelt Temporal korrekt. */
export function addToDate(iso: string, amount: number, unit: DurationUnit, temporal: TemporalApi): DateResult {
  const date = parse(iso, temporal)
  if (!date) return fail('invalidDate')
  if (!Number.isInteger(amount)) return fail('invalidRange')
  const duration = unit === 'days' ? { days: amount }
    : unit === 'weeks' ? { weeks: amount }
      : unit === 'months' ? { months: amount }
        : { years: amount }
  const result = date.add(duration)
  return { ok: true, values: { iso: result.toString() }, error: null }
}

/** Kalenderwoche (ISO 8601) und Wochentag eines Datums. */
export function isoWeek(iso: string, temporal: TemporalApi): DateResult {
  const date = parse(iso, temporal)
  if (!date) return fail('invalidDate')
  const week = date.weekOfYear
  const isoYear = date.yearOfWeek
  return {
    ok: true,
    values: {
      week: String(week),
      isoYear: String(isoYear),
      weekday: String(date.dayOfWeek),
      dayOfYear: String(date.dayOfYear),
      daysInMonth: String(date.daysInMonth),
      leapYear: String(date.inLeapYear)
    },
    error: null
  }
}

/**
 * Werktage (Montag bis Freitag) zwischen zwei Daten, **einschließlich** des Enddatums und ohne
 * das Startdatum — so, wie ein Stundenzettel zählt. Feiertage sind nicht berücksichtigt.
 */
export function countWorkingDays(fromIso: string, toIso: string, temporal: TemporalApi): number {
  const from = parse(fromIso, temporal)
  const to = parse(toIso, temporal)
  if (!from || !to) return 0
  const days = from.until(to).days
  if (days <= 0) return 0
  const fullWeeks = Math.trunc(days / 7)
  let count = fullWeeks * 5
  let cursor = from.add({ days: fullWeeks * 7 })
  for (let index = 0; index < days - fullWeeks * 7; index += 1) {
    cursor = cursor.add({ days: 1 })
    if (cursor.dayOfWeek <= 5) count += 1
  }
  return count
}

/**
 * Fristende nach BGB. `eventIso` ist der Tag des Ereignisses (Zugang, Lieferung, Abnahme).
 * Fällt das rechnerische Ende auf ein Wochenende, rutscht es auf den Montag.
 */
export function deadline(eventIso: string, amount: number, unit: DurationUnit, temporal: TemporalApi): DateResult {
  const event = parse(eventIso, temporal)
  if (!event) return fail('invalidDate')
  if (!Number.isInteger(amount) || amount <= 0) return fail('invalidRange')

  // § 187 Abs. 1: Der Ereignistag zählt nicht mit — die Frist beginnt am Tag danach.
  const start = event.add({ days: 1 })
  // § 188 Abs. 2: Der Fristbeginn liegt einen Tag nach dem Ereignis, deshalb läuft die
  // Verschiebung um `amount-1` über denselben Zeitraum und von dort um einen Tag zurück.
  // Achtung: Temporal lehnt gemischte Vorzeichen in einem Feldobjekt ab (RangeError) — die
  // Subtraktion ist deshalb ein eigener Schritt.
  const span = unit === 'days' ? { days: amount - 1 }
    : unit === 'weeks' ? { weeks: amount }
      : unit === 'months' ? { months: amount }
        : { years: amount }
  const computed = unit === 'days' ? start.add(span) : start.add(span).subtract({ days: 1 })

  // § 193: Sonnabend und Sonntag schieben das Ende auf den nächsten Werktag.
  let end = computed
  let shifted = 0
  while (end.dayOfWeek === 6 || end.dayOfWeek === 7) {
    end = end.add({ days: 1 })
    shifted += 1
  }

  return {
    ok: true,
    values: {
      start: start.toString(),
      end: end.toString(),
      rawEnd: computed.toString(),
      shifted: String(shifted),
      duration: `${amount} ${unit}`
    },
    error: null
  }
}

/**
 * Zeitdauer aus Text: `1:30`, `1,5h`, `90min`, `2h 15m`. Rückgabe in Minuten (Dezimal).
 */
export function parseDuration(text: string): number | null {
  const trimmed = text.trim().toLowerCase().replace(/\s+/gu, ' ')
  if (!trimmed) return null

  const clock = /^(\d+):([0-5]?\d)$/u.exec(trimmed)
  if (clock) return Number(clock[1]) * 60 + Number(clock[2])

  const hours = /(\d+(?:[.,]\d+)?)\s*(?:h|std|stunden?|hours?)/u.exec(trimmed)
  const minutes = /(\d+(?:[.,]\d+)?)\s*(?:m|min|minuten?|minutes?)/u.exec(trimmed)
  if (hours || minutes) {
    const h = hours ? Number(hours[1]?.replace(',', '.')) : 0
    const m = minutes ? Number(minutes[1]?.replace(',', '.')) : 0
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null
    return h * 60 + m
  }

  const plain = Number(trimmed.replace(',', '.'))
  return Number.isFinite(plain) ? plain : null
}

/** Minuten als `H:MM` — die Schreibweise eines Stundenzettels. */
export function formatMinutes(minutes: number): string {
  const negative = minutes < 0
  const total = Math.round(Math.abs(minutes))
  const hours = Math.trunc(total / 60)
  const rest = total - hours * 60
  return `${negative ? '-' : ''}${hours}:${String(rest).padStart(2, '0')}`
}

/** Summe mehrerer Dauern (eine je Zeile) und die Umrechnung in Dezimalstunden. */
export function sumDurations(text: string): DateResult {
  const lines = text.split(/\r?\n|;/u).map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return fail('invalidDate')
  let total = 0
  for (const line of lines) {
    const minutes = parseDuration(line)
    if (minutes === null) return fail('invalidDate')
    total += minutes
  }
  return {
    ok: true,
    values: {
      total: formatMinutes(total),
      minutes: String(Math.round(total)),
      decimalHours: (total / 60).toFixed(2),
      lines: String(lines.length)
    },
    error: null
  }
}
