/**
 * Zellen für Tabellenprogramme — typisiert und entschärft (Karte M8-004).
 *
 * Ein Freitextfeld, das mit `=`, `+`, `-`, `@`, Tabulator oder Wagenrücklauf beginnt, wird von
 * Excel, LibreOffice und Google Sheets beim Öffnen einer CSV als **Formel** gelesen — auch wenn es
 * in Anführungszeichen steht. Aus einer Bezeichnung wie `=1+1` wird so eine rechnende Zelle, aus
 * `=cmd|'/c calc'!A1` ein Aufruf („CSV Injection", OWASP).
 *
 * Zwei Dinge folgen daraus, und beide sind hier umgesetzt:
 *
 * 1. **Zellen sind typisiert.** Ein Rechenwert ist eine **Zahl** und bleibt numerisch — auch eine
 *    negative (`-12,5`). Nur **Text** wird neutralisiert. Eine pauschale Zeichenfilterung würde
 *    valide negative Zahlen zerstören.
 * 2. **Neutralisiert wird an der Quelle.** Text, der mit einem Formelzeichen beginnt, bekommt ein
 *    führendes Apostroph — die übliche Kennzeichnung „dies ist Text". Vollbreite Zeichen der
 *    Formelstarter (`＝ ＋ － ＠`) sind mitgenommen, weil Importer sie unterschiedlich auslegen.
 *
 * **Grenze, ausdrücklich:** Das ist **keine** Garantie. OWASP beschreibt die Neutralisierung als
 * importerabhängig; ein Tabellenprogramm kann sich anders verhalten, und ein Importeur mit
 * Makros bleibt gefährlich. Der Export heißt deshalb „maschinenlesbar", nicht „tabellensicher",
 * und die Oberfläche sagt das.
 */

export type CellKind = 'text' | 'number'

export interface CsvCell {
  readonly kind: CellKind
  readonly value: string
}

/** Kurzweg für die häufigste Zelle. */
export const textCell = (value: string): CsvCell => ({ kind: 'text', value })
export const numberCell = (value: string): CsvCell => ({ kind: 'number', value })

/**
 * Beginnt der Text mit einem Zeichen, das ein Tabellenprogramm als Formel liest?
 * ASCII (`= + - @`), Tabulator und Wagenrücklauf wie in der OWASP-Beschreibung, dazu die
 * Vollbreiten-Entsprechungen.
 */
const FORMELSTART = /^[=+\-@\t\r＝＋－＠]/u

/**
 * Entschärft und maskiert **eine** Zelle.
 *
 * Reihenfolge ist wichtig: erst neutralisieren, dann Anführungszeichen verdoppeln, dann quoten —
 * so bleibt die Kennzeichnung Teil des Feldinhalts.
 */
export function spreadsheetField(cell: CsvCell, delimiter: string): string {
  const neutralisiert = cell.kind === 'text' && FORMELSTART.test(cell.value) ? `'${cell.value}` : cell.value
  const escaped = neutralisiert.replace(/"/gu, '""')
  // Nur quoten, was es braucht: das Trennzeichen, ein Anführungszeichen, ein Zeilenumbruch oder
  // ein Tabulator (den manche Importer ebenfalls als Spaltentrenner lesen).
  // Ein Dezimalkomma bei `;`-Trennung darf ausdrücklich **nicht** gequotet werden.
  return escaped.includes(delimiter) || /["\r\n\t]/u.test(escaped) ? `"${escaped}"` : escaped
}

/** Eine Zeile aus typisierten Zellen. */
export function spreadsheetRow(cells: readonly CsvCell[], delimiter: string): string {
  return cells.map((cell) => spreadsheetField(cell, delimiter)).join(delimiter)
}
