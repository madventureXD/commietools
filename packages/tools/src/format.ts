/**
 * **Gemeinsamer Formatkontext** (Karte M3-010).
 *
 * Die Karte beanstandet, dass Zahlen innerhalb derselben Oberfläche verschiedenen Regeln folgen:
 * einige Stellen formatieren mit der **Oberflächensprache**, andere still mit `navigator`
 * (`Intl.NumberFormat(undefined, …)`, `toLocaleString()`), wieder andere fest mit `toFixed` (Punkt).
 *
 * Regel hier — **Sprache und Region bleiben getrennt**:
 * - `uiLocale` steuert die Texte.
 * - `regionLocale` steuert Zahlen, Datum und Maßeinheiten-Schreibweise.
 * - Ohne Regionswahl wird ein **deterministischer Default** gebildet und hier dokumentiert, statt
 *   an jeder Stelle erneut still `navigator` zu benutzen:
 *   1. die erste Browsersprache, die eine **Region** trägt (`de-DE`, `en-US`, `pt-BR` …),
 *   2. sonst die Oberflächensprache,
 *   3. sonst `de-DE` (Projektvorgabe).
 *
 * **Technische Austauschsyntax bleibt unberührt:** JSON, CSS, CSV und Dateiinhalte brauchen den
 * Punkt als Dezimaltrenner; dafür gibt es `formatTechnicalNumber` — und `Intl.NumberFormat` ist
 * ausdrücklich **kein** Eingabeparser (Zahleneingabe hat eine eigene Grammatik).
 */
export interface FormatContext {
  /** Sprache der Oberfläche (Texte). */
  uiLocale: string
  /** Region für Zahlen, Datum und Maßeinheiten. */
  regionLocale: string
}

const MIT_REGION = /^[a-z]{2,3}-[A-Z]{2}$/u
const FALLBACK_REGION = 'de-DE'

/**
 * Bildet den Formatkontext. `sprachen` ist typischerweise `navigator.languages`.
 * Die Reihenfolge der Entscheidung ist oben dokumentiert.
 */
export function createFormatContext(uiLocale: string, sprachen: readonly string[] = []): FormatContext {
  const mitRegion = sprachen.find((sprache) => MIT_REGION.test(sprache))
  return { uiLocale, regionLocale: mitRegion ?? (MIT_REGION.test(uiLocale) ? uiLocale : FALLBACK_REGION) }
}

/** Zahl für die **Anzeige**: folgt der Region (Gruppen- und Dezimaltrenner). */
export function formatNumber(value: number, context: FormatContext, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(context.regionLocale, options).format(value)
}

/** Zahl für **technische Ausgabe** (JSON, CSS, CSV): immer Punkt, nie Gruppenzeichen. */
export function formatTechnicalNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', { useGrouping: false, maximumFractionDigits: 20, ...options }).format(value)
}

/** Byte-Angabe für die Anzeige — mit dem Dezimaltrenner der Region. */
export function formatBytes(bytes: number, context: FormatContext): string {
  if (bytes < 1024) return `${formatNumber(bytes, context, { maximumFractionDigits: 0 })} B`
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, context, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KB`
  return `${formatNumber(bytes / 1024 / 1024, context, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MB`
}

/**
 * Datum und Uhrzeit für die Anzeige. Die **Zeitzone wird sichtbar gemacht**: angezeigt wird in der
 * Zeitzone des Geräts, und der Zeitzonenname steht dabei — sonst ist ein Datum ohne Bezug nicht
 * nachprüfbar (die Karte verlangt einen sichtbaren Datums-/Zeitzonenvertrag).
 */
export function formatDateTime(value: Date, context: FormatContext): string {
  return new Intl.DateTimeFormat(context.regionLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

/** Zeitzonenkennung des Geräts, für Hinweise neben zeitabhängigen Ergebnissen. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}
