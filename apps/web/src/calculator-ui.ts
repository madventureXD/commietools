/**
 * Bedien-Helfer des Rechners, bewusst ohne React und ohne Rechenkern: reine Funktionen,
 * damit sie ohne Browser prüfbar sind.
 */

/**
 * Zerlegt die RPN-Eingabe in Tokens. Getrennt wird an Leerraum; ein Komma als Dezimaltrenner
 * bleibt Teil der Zahl (`3,5 2 *` ist gültig) und wird erst im Kern normalisiert.
 */
export function splitRpnTokens(input: string): readonly string[] {
  return input.trim() ? input.trim().split(/\s+/u) : []
}

/**
 * Hängt ein Tasten-Schnipsel an den Ausdruck an. Fehlt zwischen Vorhandenem und Schnipsel ein
 * Trennzeichen, wird eines gesetzt — sonst verschmilzt `2+3` mit `sin(` zu `2+3sin(`.
 */
export function appendSnippet(current: string, snippet: string): string {
  const trimmed = current.replace(/\s+$/u, '')
  if (!trimmed) return snippet
  const needsSpace = !/[\s(^*/+-]$/u.test(trimmed) && !/^[\s)^*/+-]/u.test(snippet)
  return needsSpace ? `${trimmed} ${snippet}` : `${trimmed}${snippet}`
}

/** Anzeige der Basis im Programmierer-Modus. */
export const PROGRAMMER_BASES = [16, 10, 8, 2] as const

/** Wortbreiten des Zweierkomplements. */
export const PROGRAMMER_WORD_SIZES = [8, 16, 32, 64] as const
