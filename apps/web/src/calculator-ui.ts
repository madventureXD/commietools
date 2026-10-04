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
 * Hängt ein Tasten-Schnipsel an den Ausdruck an.
 *
 * Ein Leerzeichen wird **nur** gesetzt, wo sonst zwei Bezeichner verschmelzen würden
 * (`2` + `e` → `2 e`, sonst läse der Kern `2e` als halbe wissenschaftliche Schreibweise).
 * Zwei Ziffern werden dagegen **verbunden** — sonst ergäbe die Tastenfolge 6 1 4 4 0 den
 * Ausdruck `6 1 4 4 0`, und der Kern meldet „Der Ausdruck ist nicht lesbar". Genau dieser
 * Fehler war in der ersten Fassung: mehrstellige Zahlen ließen sich nicht tippen.
 */
export function appendSnippet(current: string, snippet: string): string {
  const trimmed = current.replace(/\s+$/u, '')
  if (!trimmed) return snippet
  const lastCharacter = trimmed.slice(-1)
  const firstCharacter = snippet.slice(0, 1)
  const isDigit = (character: string) => /^[0-9]$/u.test(character)
  const lastIsWord = /[0-9A-Za-z.]$/u.test(trimmed)
  const firstIsWord = /^[0-9A-Za-z.]/u.test(snippet)
  // Innerhalb einer Hexadezimalzahl (`0xAF`) gehören auch Buchstaben zusammen.
  const insideHexLiteral = /0x[0-9A-Fa-f]*$/u.test(trimmed)
  const needsSpace = lastIsWord && firstIsWord && !(isDigit(lastCharacter) && isDigit(firstCharacter)) && !insideHexLiteral
  return needsSpace ? `${trimmed} ${snippet}` : `${trimmed}${snippet}`
}

/**
 * Ziffernbuchstaben des Programmierer-Modus (`A`–`F`) brauchen ein `0x` vor sich: ohne Präfix liest
 * mathjs einen Namen und meldet „Unbekannte Funktion oder unbekannter Name" — die Taste wäre tot.
 * Steht schon eine Hexadezimalzahl am Ende, wird nur angehängt (`0xA` + `F` → `0xAF`).
 */
export function appendHexDigit(current: string, digit: string): string {
  const trimmed = current.replace(/\s+$/u, '')
  if (/0x[0-9A-Fa-f]*$/u.test(trimmed)) return appendSnippet(trimmed, digit)
  return appendSnippet(trimmed, `0x${digit.toUpperCase()}`)
}

/** Anzeige der Basis im Programmierer-Modus. */
export const PROGRAMMER_BASES = [16, 10, 8, 2] as const
/** Wortbreiten des Zweierkomplements. */
export const PROGRAMMER_WORD_SIZES = [8, 16, 32, 64] as const

/**
 * Genauigkeitszustand einer Rechnung für die Ampel.
 *
 * **Verglichen werden Zeichenketten, nicht Werte.** Ein mathjs-Vergleich (`math.equal`) prüft mit
 * Toleranz (`relTol` 1e-12) und hält `0,333…` (14 Stellen) für gleich `0,333…` (64 Stellen) —
 * gemessen am 2026-10-04; die Ampel wäre damit blind. `raw === full` fragt dagegen: hat die
 * Anzeige denselben Text wie der volle Wert? Nur dann ist sie der ganze Wert.
 *
 * `complete` heißt **nicht** „mathematisch exakt": `√2×√2` zeigt `2` vollständig an, obwohl die
 * Wurzel zwischendurch gerundet wurde (gemessen). Die Ampel ist ein Wahrheitsanzeiger für das
 * Angezeigte, keine Fehlermeldung.
 */
export type AccuracyState = 'complete' | 'rounded'

export function accuracyOf(raw: string, full: string): AccuracyState {
  return raw && raw === full ? 'complete' : 'rounded'
}
