import { createFormatContext, type FormatContext } from '@commietools/tools'

/**
 * **Anzeige-Formatkontext für Werkzeugoberflächen** (Nachtrag zu Karte M3-010).
 *
 * Die Werkzeuge reichten bisher ihre **Oberflächensprache** (`locale`) direkt an
 * `Intl.NumberFormat` weiter. Damit bestimmte die Sprache das Zahlenformat: Auf einem Gerät mit
 * englischer Region, aber deutscher Oberfläche, stand überall „1.234,5" statt „1,234.5" — und
 * umgekehrt wichen die vier in R6 umgestellten Stellen von allen übrigen ab.
 *
 * Diese Funktion macht aus der Oberflächensprache den **Anzeige**-Kontext: Zahlen und Datum folgen
 * der **Region** (`navigator.languages`, dokumentierter Default in `createFormatContext`), die Texte
 * weiterhin der Sprache. Ohne Argument wird die Dokumentsprache genutzt.
 *
 * **Nicht für technische Ausgaben** (JSON, CSS, CSV, Exportwerte): dort bleibt der Punkt, siehe
 * `formatTechnicalNumber` in `@commietools/tools`.
 */
export function anzeigeKontext(uiLocale?: string): FormatContext {
  const sprache = uiLocale ?? (typeof document !== 'undefined' ? document.documentElement.lang : '') ?? ''
  const sprachen = typeof navigator !== 'undefined' ? navigator.languages : []
  return createFormatContext(sprache || 'de', sprachen)
}
