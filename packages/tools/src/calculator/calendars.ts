/**
 * Kalenderumrechnung für das Werkzeug „Umrechnen" (Welle 4 der Suite „Rechnen").
 *
 * **Zwei Wege, zwei Engines:**
 * - **Anzeige** (gregorianisches Datum → Kalenderdatum) läuft über `Intl.DateTimeFormat`.
 *   Das kann jeder Browser für alle 18 Kalender, ganz ohne Zusatzpaket.
 * - **Rückweg** (Kalenderdatum → gregorianisch) braucht `Temporal`. Ist es im Browser nativ
 *   vorhanden (Edge 154: ja), wird es genutzt; sonst wird `@js-temporal/polyfill` **erst dann**
 *   nachgeladen. Das ist eine Abfrage zur Laufzeit, keine Bauzeitentscheidung.
 *
 * **Gemessen am 2026-10-03 mit 0.5.1:** Alle 18 Kalender gehen **beide** Wege, auch coptic,
 * ethiopic, chinese und dangi. Der frühere Befund im Konzept („4 von 17 defekt") bestätigt sich
 * mit dieser Version nicht. Der Rückweg bleibt trotzdem in einem `try/catch`: Schlägt er fehl,
 * meldet der Kern `unsupported` — **nie stillschweigend ein falsches Datum**.
 */
import type { Temporal as TemporalNamespace } from '@js-temporal/polyfill'

/** Alle Kalender, die `Intl.supportedValuesOf('calendar')` führt, in fester Reihenfolge. */
export const calendarIds = [
  'iso8601',
  'gregory',
  'japanese',
  'buddhist',
  'roc',
  'indian',
  'persian',
  'hebrew',
  'islamic',
  'islamic-civil',
  'islamic-rgsa',
  'islamic-tbla',
  'islamic-umalqura',
  'chinese',
  'dangi',
  'coptic',
  'ethiopic',
  'ethioaa'
] as const

export type CalendarId = (typeof calendarIds)[number]

export type TemporalApi = typeof TemporalNamespace

export type CalendarErrorCode = 'invalidDate' | 'invalidCalendarDate' | 'unsupported'

export interface CalendarConversion {
  readonly ok: boolean
  /** ISO-Datum im gregorianischen Kalender (und zugleich der Eingabewert des Rückwegs). */
  readonly iso: string
  /** Datum im Zielkalender als ISO mit Kalenderannotation, etwa `5787-01-22[u-ca=hebrew]`. */
  readonly calendarDate: string
  /** Lesbare Form in der Sprache des Nutzers. */
  readonly display: string
  readonly error: CalendarErrorCode | null
}

function fail(error: CalendarErrorCode): CalendarConversion {
  return { ok: false, iso: '', calendarDate: '', display: '', error }
}

export function isCalendarId(value: string): value is CalendarId {
  return (calendarIds as readonly string[]).includes(value)
}

/**
 * Liefert Temporal: nativ, wenn vorhanden, sonst das nachgeladene Polyfill.
 * Der dynamische Import liegt bewusst hier — so hängt das Polyfill an genau diesem Werkzeug
 * und nicht am Startbündel.
 */
export async function loadTemporal(): Promise<TemporalApi> {
  const native = (globalThis as { Temporal?: TemporalApi }).Temporal
  if (native) return native
  const module = await import('@js-temporal/polyfill')
  return module.Temporal
}

/** Lesbare Darstellung eines Kalenderdatums. Reiner `Intl`-Weg, ohne Temporal. */
export function formatCalendarDate(iso: string, calendar: CalendarId, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', calendar }).format(new Date(`${iso}T12:00:00Z`))
  } catch {
    return ''
  }
}

/**
 * Vorwärts: gregorianisches ISO-Datum → Datum im gewählten Kalender.
 *
 * `Temporal.PlainDate.from` nimmt die Kalenderannotation im ISO-Format (`2026-10-03[u-ca=hebrew]`).
 * Genau dieser Wert ist auch die Eingabe des Rückwegs — deshalb liefert der Kern ihn mit.
 */
export function toCalendar(iso: string, calendar: CalendarId, temporal: TemporalApi, locale = 'de-DE'): CalendarConversion {
  try {
    const date = temporal.PlainDate.from(iso).withCalendar(calendar)
    return {
      ok: true,
      iso,
      calendarDate: date.toString(),
      display: formatCalendarDate(iso, calendar, locale) || date.toString(),
      error: null
    }
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    return fail(name === 'RangeError' ? 'invalidDate' : 'unsupported')
  }
}

/**
 * Rückweg: Kalenderdatum → gregorianisches ISO-Datum.
 *
 * Gelesen wird über **`monthCode`** (etwa `M01`), nicht über die Monatszahl: In Kalendern mit
 * Schaltmonaten (hebräisch, chinesisch) ist die Monatszahl allein nicht eindeutig.
 * Schlägt die Umrechnung fehl — etwa weil eine Engine einen Kalender nicht vollständig führt —
 * kommt `unsupported` zurück und **kein** geratenes Datum.
 */
export function fromCalendar(calendarDate: string, temporal: TemporalApi): CalendarConversion {
  try {
    const date = temporal.PlainDate.from(calendarDate)
    const iso = date.withCalendar('iso8601').toString()
    return { ok: true, iso, calendarDate, display: '', error: null }
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    return fail(name === 'RangeError' ? 'invalidCalendarDate' : 'unsupported')
  }
}

/**
 * Baut ein Kalenderdatum aus Jahr, Monat und Tag im gewählten Kalender — der Weg, den ein Nutzer
 * ohne ISO-Vorkenntnis geht.
 *
 * Gelesen wird über **`monthCode`** (etwa `M01`), nicht über die Monatszahl: In Kalendern mit
 * Schaltmonaten (hebräisch, chinesisch) ist die Monatszahl allein nicht eindeutig. Der
 * Property-Bag ist zugleich der **einzige** Ort, an dem `monthCode` von Temporal angenommen wird
 * — im ISO-Textformat (`5787-M01-22`) lehnt Temporal ihn ab.
 */
export function fromCalendarParts(
  year: number,
  monthCode: number,
  day: number,
  calendar: CalendarId,
  temporal: TemporalApi
): CalendarConversion {
  try {
    const date = temporal.PlainDate.from({
      year,
      monthCode: `M${String(monthCode).padStart(2, '0')}`,
      day,
      calendar
    })
    return { ok: true, iso: date.withCalendar('iso8601').toString(), calendarDate: date.toString(), display: '', error: null }
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    return fail(name === 'RangeError' ? 'invalidCalendarDate' : 'unsupported')
  }
}
