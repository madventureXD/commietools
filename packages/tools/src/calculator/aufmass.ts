/**
 * Kern des Werkzeugs „Aufmaß" (Welle 6 der Suite „Rechnen").
 *
 * **Zwei getrennte Ebenen — das ist der Kern des Werkzeugs:**
 *
 * 1. **Aufmaßzeile** — eine beschriftete Rechnung aus Maßen (Maßkette oder Formel), Ergebnis mit
 *    Einheit. Das ist die Mengenermittlung.
 * 2. **Position** — Menge × Einheit × Einzelpreis = Betrag, mit Positionsnummer.
 *
 * Beides wird bewusst **nicht** vermischt: Wer Menge und Preis in eine Zeile schreibt, kann die
 * Menge nicht mehr nachrechnen. Eine Position kann ihre Menge aus einer Aufmaßzeile beziehen
 * (`sourceRowId`) — dann bleibt der Rechenweg bis zum Maß sichtbar (VOB: nachvollziehbar).
 *
 * **Keine neue Abhängigkeit, keine Gleitkommazahl.** Gerechnet wird wie in `commercial.ts` in
 * `BigInt` mit fester Skala. Der Auswerter ist ein eigener, kleiner Vorrangparser — mathjs wird
 * hier absichtlich **nicht** importiert, damit die Fachlogik engine-frei und ohne Browser prüfbar
 * bleibt. Annahmen und Grenzen stehen in den Sprachkatalogen.
 *
 * Keine Anzeigetexte: Ergebnisse sind exakte Dezimalzeichenketten mit Punkt; Schreibweise je
 * Sprache (Trennzeichen, Komma) macht die Oberfläche beziehungsweise der Export über Optionen.
 * Fehler sind Codes.
 */
import { numberCell, spreadsheetRow, textCell, type CsvCell } from './spreadsheet'

/** Interne Skala: 12 Nachkommastellen. Für Maße und Beträge deutlich übererfüllt. */
const SCALE = 10n ** 12n

/** Höchstzahl an Zeichen einer Formel — schützt vor entarteten Eingaben. */
export const MAX_EXPRESSION_LENGTH = 500

/** Höchstzahl an Nachkommastellen in der Eingabe. */
const MAX_INPUT_DECIMALS = 12

export type MeasureErrorCode = 'empty' | 'invalid' | 'syntax' | 'zeroDivisor' | 'range'

export interface MeasureResult {
  readonly ok: boolean
  /** Exakter Dezimalwert mit Punkt, auf `decimals` Stellen gerundet — **nur für die Anzeige**. */
  readonly display: string
  /**
   * Der **exakte** skalierte Wert. Wer weiterrechnet, nimmt diesen und nicht `display`: Die
   * Anzeige ist gerundet, und ein Rückweg über den Text wäre zusätzlich mehrdeutig — `9.800`
   * ließe sich als 9,8 oder als 9800 lesen (Tausenderpunkt). Genau daran ist ein Test gescheitert.
   */
  readonly value: bigint | null
  readonly error: MeasureErrorCode | null
}

/** Die wählbaren Einheiten. Als Auswahl, nicht frei — sonst sind Summen nicht mehr bildbar. */
export const measureUnits = ['m', 'm2', 'm3', 'stk', 'kg', 'l', 'h'] as const

export type MeasureUnit = (typeof measureUnits)[number]

/**
 * Gruppen für die Anzeige. Summiert wird **je Einheit**, nie über Gruppen hinweg: m³ und l sind
 * beide Volumen, aber ohne Umrechnung nicht addierbar; m und m² sind es ohnehin nicht.
 */
export const unitGroups = ['length', 'area', 'volume', 'count', 'mass', 'time'] as const

export type UnitGroup = (typeof unitGroups)[number]

export const unitGroup: Readonly<Record<MeasureUnit, UnitGroup>> = {
  m: 'length',
  m2: 'area',
  m3: 'volume',
  stk: 'count',
  kg: 'mass',
  l: 'volume',
  h: 'time'
}

/** Nachkommastellen der Anzeige: Maße drei, Geld zwei. */
export const MEASURE_DECIMALS = 3
export const MONEY_DECIMALS = 2

// — Auswerter ——————————————————————————————————————————————————————————————

/** Kaufmännische Rundung (halbe auf), vorzeichenunabhängig. */
function divRound(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error('zeroDivisor')
  const negative = (numerator < 0n) !== (denominator < 0n)
  const a = numerator < 0n ? -numerator : numerator
  const b = denominator < 0n ? -denominator : denominator
  const quotient = (a * 2n + b) / (b * 2n)
  return negative ? -quotient : quotient
}

/**
 * Zahleneingabe. Dokumentierte Annahmen (stehen so auch in der Oberfläche):
 * - Ein Komma ist immer das Dezimaltrennzeichen („3,50" = 3,5).
 * - Ohne Komma gilt: Steht hinter dem **letzten** Punkt genau eine Dreiergruppe, ist er ein
 *   Tausendertrenner („1.234" = 1234); sonst ist der letzte Punkt das Dezimaltrennzeichen
 *   („3.50" = 3,5). Der ambivalente Fall wird als Tausendertrenner gelesen — die erwartete
 *   Bedeutung in einem deutschsprachigen Werkzeug.
 * - Leerzeichen und ein führendes `+` werden verworfen.
 * - Ein führendes `-` ist **kein** zulässiger Wert: Maße und Preise sind nicht negativ.
 */
export function parseMeasureNumber(text: string): bigint | null {
  const raw = text.trim().replace(/\s/gu, '').replace(/^\+/u, '')
  if (!raw || raw.startsWith('-')) return null

  let normalized = raw
  if (raw.includes(',')) {
    normalized = raw.replace(/\./gu, '').replace(',', '.')
  } else if (raw.includes('.')) {
    const lastGroup = raw.slice(raw.lastIndexOf('.') + 1)
    normalized = /^\d{3}$/u.test(lastGroup) ? raw.replace(/\./gu, '') : raw.replace(/\.(?=.*\.)/gu, '')
  }

  const match = /^(\d*)(?:\.(\d*))?$/u.exec(normalized)
  if (!match) return null
  const [, whole = '', fraction = ''] = match
  if (!whole && !fraction) return null
  if (fraction.length > MAX_INPUT_DECIMALS) return null
  return BigInt(`${whole}${fraction.padEnd(12, '0')}`)
}

/** Skalierter Wert als exakte Dezimalzeichenkette, auf `decimals` Stellen gerundet. */
export function formatMeasure(value: bigint, decimals = MEASURE_DECIMALS): string {
  const factor = 10n ** BigInt(12 - decimals)
  const rounded = divRound(value, factor)
  const negative = rounded < 0n
  const digits = (negative ? -rounded : rounded).toString().padStart(decimals + 1, '0')
  const whole = digits.slice(0, digits.length - decimals)
  const fraction = decimals > 0 ? digits.slice(digits.length - decimals) : ''
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`
}

function mul(a: bigint, b: bigint): bigint {
  return divRound(a * b, SCALE)
}

function div(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('zeroDivisor')
  return divRound(a * SCALE, b)
}

/**
 * Vorrangparser für Maßketten. Unterstützt `+ - * /`, die Zeichen `× ÷ ·` als Schreibweisen der
 * Multiplikation und Division, Klammern, unäre Vorzeichen und Dezimalzahlen.
 *
 * Bewusst klein gehalten: keine Funktionen, keine Variablen, kein `eval`. Ein Taschenrechner-CAS
 * wäre für Maßketten eine Abhängigkeit ohne Gegenwert (siehe Werkzeugbeschreibung).
 */
class MeasureParser {
  private index = 0

  constructor(private readonly input: string) {}

  parse(): bigint {
    const value = this.expression()
    this.skipSpace()
    if (this.index < this.input.length) throw new Error('syntax')
    return value
  }

  private expression(): bigint {
    let value = this.term()
    for (;;) {
      this.skipSpace()
      const char = this.input[this.index]
      if (char === '+') {
        this.index += 1
        value += this.term()
      } else if (char === '-') {
        this.index += 1
        value -= this.term()
      } else {
        return value
      }
    }
  }

  private term(): bigint {
    let value = this.factor()
    for (;;) {
      this.skipSpace()
      const char = this.input[this.index]
      if (char === '*' || char === '×' || char === '·') {
        this.index += 1
        value = mul(value, this.factor())
      } else if (char === '/' || char === '÷') {
        this.index += 1
        value = div(value, this.factor())
      } else {
        return value
      }
    }
  }

  private factor(): bigint {
    this.skipSpace()
    const char = this.input[this.index]
    if (char === '-') {
      this.index += 1
      return -this.factor()
    }
    if (char === '+') {
      this.index += 1
      return this.factor()
    }
    return this.primary()
  }

  private primary(): bigint {
    this.skipSpace()
    if (this.input[this.index] === '(') {
      this.index += 1
      const value = this.expression()
      this.skipSpace()
      if (this.input[this.index] !== ')') throw new Error('syntax')
      this.index += 1
      return value
    }
    const start = this.index
    while (this.index < this.input.length && /[0-9.,]/u.test(this.input[this.index] as string)) {
      this.index += 1
    }
    if (start === this.index) throw new Error('syntax')
    const number = parseMeasureNumber(this.input.slice(start, this.index))
    if (number === null) throw new Error('invalid')
    return number
  }

  private skipSpace(): void {
    while (this.index < this.input.length && /\s/u.test(this.input[this.index] as string)) {
      this.index += 1
    }
  }
}

/** Wertet eine Maßkette oder Formel aus. Leere Eingabe ist ein eigener Fehlerfall. */
export function evaluateMeasure(expression: string, decimals = MEASURE_DECIMALS): MeasureResult {
  const trimmed = expression.trim()
  if (!trimmed) return { ok: false, display: '', value: null, error: 'empty' }
  if (trimmed.length > MAX_EXPRESSION_LENGTH) return { ok: false, display: '', value: null, error: 'range' }
  try {
    const value = new MeasureParser(trimmed).parse()
    if (value < 0n) return { ok: false, display: '', value: null, error: 'range' }
    return { ok: true, display: formatMeasure(value, decimals), value, error: null }
  } catch (error) {
    const code = error instanceof Error ? error.message : 'invalid'
    const known: MeasureErrorCode =
      code === 'syntax' || code === 'invalid' || code === 'zeroDivisor' || code === 'range'
        ? code
        : 'invalid'
    return { ok: false, display: '', value: null, error: known }
  }
}

// — Dokument ——————————————————————————————————————————————————————————————

/** Eine beschriftete Rechnung aus Maßen — die Mengenermittlung. */
export interface AufmassRow {
  readonly id: string
  readonly label: string
  /** Maßkette oder Formel, etwa `3,50 × 2,80` oder `2 × (2,40 + 1,80)`. */
  readonly expression: string
  readonly unit: MeasureUnit
}

/** Eine Position: Menge × Einzelpreis = Betrag. Die Menge kann aus einer Aufmaßzeile stammen. */
export interface AufmassPosition {
  readonly id: string
  readonly label: string
  /** Menge als Text — wird nicht gelesen, wenn `sourceRowId` gesetzt ist. */
  readonly quantity: string
  /** Aufmaßzeile, aus der die Menge stammt. Dann bleibt der Rechenweg sichtbar. */
  readonly sourceRowId: string | null
  readonly unit: MeasureUnit
  readonly unitPrice: string
}

/** Ein Abschnitt — je Raum oder Bauteil. */
export interface AufmassSection {
  readonly id: string
  readonly label: string
  readonly rows: readonly AufmassRow[]
  readonly positions: readonly AufmassPosition[]
}

export interface AufmassDocument {
  /** Kopfzeile des Blattes: Objekt oder Bauvorhaben. */
  readonly title: string
  /** Auftraggeber oder Notiz. Bleibt lokal, siehe Speicherbereich. */
  readonly client: string
  readonly sections: readonly AufmassSection[]
}

export const emptyDocument: AufmassDocument = { title: '', client: '', sections: [] }

// — Berechnung ——————————————————————————————————————————————————————————————

export interface ComputedRow extends AufmassRow {
  readonly value: bigint | null
  readonly display: string
  readonly error: MeasureErrorCode | null
}

export interface ComputedPosition extends AufmassPosition {
  readonly quantityValue: bigint | null
  readonly quantityDisplay: string
  readonly amountValue: bigint | null
  readonly amountDisplay: string
  readonly error: MeasureErrorCode | null
  /** Der Rechenweg: Maße der Quelle, sonst die eingetragene Menge. */
  readonly sourceExpression: string | null
}

export interface ComputedSection {
  readonly id: string
  readonly label: string
  readonly rows: readonly ComputedRow[]
  readonly positions: readonly ComputedPosition[]
}

export interface ComputedDocument {
  readonly title: string
  readonly client: string
  readonly sections: readonly ComputedSection[]
  /** Mengensummen je Einheit — nie über Gruppen hinweg addiert. */
  readonly totalsByUnit: Readonly<Partial<Record<MeasureUnit, string>>>
  /** Betragssumme über alle Positionen. */
  readonly totalAmount: string
  /** Positionssumme je Abschnitt, für die Zwischensummenzeile. */
  readonly sectionTotals: Readonly<Record<string, string>>
}

/** Ausdruck → skalierten Wert. Die **eine** Stelle, an der ein Auswertergebnis in einen Wert übergeht. */
function measureValue(expression: string): {
  value: bigint | null
  display: string
  error: MeasureErrorCode | null
} {
  const result = evaluateMeasure(expression)
  return { value: result.value, display: result.display, error: result.error }
}

/** Eine Aufmaßzeile auswerten. Fehler bleiben sichtbar, statt stillschweigend null zu werden. */
export function computeRow(row: AufmassRow): ComputedRow {
  const { value, display, error } = measureValue(row.expression)
  return { ...row, value, display, error }
}

/** Eine Position auswerten — Menge aus der Quelle oder eingetragen, dann × Preis. */
export function computePosition(position: AufmassPosition, rows: readonly AufmassRow[]): ComputedPosition {
  const source = position.sourceRowId ? rows.find((row) => row.id === position.sourceRowId) : undefined

  /**
   * Ist eine Quelle **benannt**, aber nicht mehr vorhanden (gelöschte Aufmaßzeile), wird nicht
   * stillschweigend die eigene Menge gerechnet: Die Zahl wäre dann nicht mehr die, die auf dem
   * Blatt steht. Der Fehler bleibt sichtbar.
   */
  if (position.sourceRowId !== null && !source) {
    return {
      ...position,
      quantityValue: null,
      quantityDisplay: '',
      amountValue: null,
      amountDisplay: '',
      error: 'invalid',
      sourceExpression: null
    }
  }

  const quantity = measureValue(source ? source.expression : position.quantity)

  if (quantity.value === null || quantity.error !== null) {
    return {
      ...position,
      quantityValue: null,
      quantityDisplay: '',
      amountValue: null,
      amountDisplay: '',
      error: quantity.error ?? 'invalid',
      sourceExpression: source ? source.expression : null
    }
  }

  const price = parseMeasureNumber(position.unitPrice)
  if (price === null) {
    return {
      ...position,
      quantityValue: quantity.value,
      quantityDisplay: quantity.display,
      amountValue: null,
      amountDisplay: '',
      error: 'invalid',
      sourceExpression: source ? source.expression : null
    }
  }

  const amount = mul(quantity.value, price)
  return {
    ...position,
    quantityValue: quantity.value,
    quantityDisplay: quantity.display,
    amountValue: amount,
    amountDisplay: formatMeasure(amount, MONEY_DECIMALS),
    error: null,
    sourceExpression: source ? source.expression : null
  }
}

/** Das ganze Dokument durchrechnen. Alle Zahlen bleiben exakt. */
export function computeDocument(document: AufmassDocument): ComputedDocument {
  const sections: ComputedSection[] = document.sections.map((section) => ({
    id: section.id,
    label: section.label,
    rows: section.rows.map(computeRow),
    positions: section.positions.map((position) => computePosition(position, section.rows))
  }))

  const totals = new Map<MeasureUnit, bigint>()
  for (const section of sections) {
    for (const row of section.rows) {
      if (row.value === null) continue
      totals.set(row.unit, (totals.get(row.unit) ?? 0n) + row.value)
    }
  }

  const totalsByUnit: Partial<Record<MeasureUnit, string>> = {}
  for (const unit of measureUnits) {
    const value = totals.get(unit)
    if (value !== undefined) totalsByUnit[unit] = formatMeasure(value, MEASURE_DECIMALS)
  }

  let total = 0n
  const sectionTotals: Record<string, string> = {}
  for (const section of sections) {
    let sectionTotal = 0n
    for (const position of section.positions) {
      if (position.amountValue === null) continue
      sectionTotal += position.amountValue
      total += position.amountValue
    }
    sectionTotals[section.id] = formatMeasure(sectionTotal, MONEY_DECIMALS)
  }

  return {
    title: document.title,
    client: document.client,
    sections,
    totalsByUnit,
    totalAmount: formatMeasure(total, MONEY_DECIMALS),
    sectionTotals
  }
}

// — Export ——————————————————————————————————————————————————————————————

/** Überschriften des Exports, aus den Sprachkatalogen. Die Logik kennt keine Texte. */
export interface ExportLabels {
  readonly title: string
  readonly client: string
  readonly section: string
  readonly quantity: string
  readonly unit: string
  readonly unitPrice: string
  readonly amount: string
  readonly measure: string
  readonly sum: string
  readonly total: string
  readonly expression: string
}

export interface ExportOptions {
  /** Feldtrenner der CSV: `;` für deutschsprachige Tabellenprogramme, `,` sonst. */
  readonly delimiter: string
  /** Dezimaltrennzeichen der Ausgabe. */
  readonly decimal: string
  /** Tausenderzeichen, oder leer für keine Gruppierung. */
  readonly thousands: string
  readonly labels: ExportLabels
}

export const defaultExportOptions: ExportOptions = {
  delimiter: ';',
  decimal: ',',
  thousands: '.',
  labels: {
    title: 'Title',
    client: 'Client',
    section: 'Section',
    quantity: 'Quantity',
    unit: 'Unit',
    unitPrice: 'Unit price',
    amount: 'Amount',
    measure: 'Measurement',
    sum: 'Sum',
    total: 'Total',
    expression: 'Working'
  }
}

/** Exakte Dezimalzeichenkette in die Schreibweise der Ausgabe bringen. */
export function localizeNumber(text: string, options: ExportOptions): string {
  if (!text) return ''
  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text
  const [whole = '', fraction] = body.split('.')
  const grouped = options.thousands
    ? whole.replace(/\B(?=(\d{3})+(?!\d))/gu, options.thousands)
    : whole
  const result = fraction ? `${grouped}${options.decimal}${fraction}` : grouped
  return negative ? `-${result}` : result
}

/** Das Blatt als CSV — mit Rechenweg, damit es nachrechenbar bleibt. Zellen sind typisiert (M8-004). */
export function toCsv(document: ComputedDocument, options: ExportOptions = defaultExportOptions): string {
  const lines: string[] = []
  const row = (...cells: readonly CsvCell[]) => lines.push(spreadsheetRow(cells, options.delimiter))

  if (document.title) row(textCell(document.title))
  if (document.client) row(textCell(`${options.labels.client}: ${document.client}`))
  lines.push('')

  for (const section of document.sections) {
    row(textCell(options.labels.section), textCell(section.label))
    row(textCell(options.labels.measure), textCell(options.labels.unit), textCell(options.labels.expression))
    for (const entry of section.rows) {
      row(textCell(entry.label), textCell(entry.unit), textCell(entry.display ? `${entry.expression} = ${localizeNumber(entry.display, options)}` : entry.expression))
    }
    lines.push('')
    row(textCell(options.labels.quantity), textCell(options.labels.unit), textCell(options.labels.unitPrice), textCell(options.labels.amount))
    for (const position of section.positions) {
      row(
        textCell(position.label),
        numberCell(localizeNumber(position.quantityDisplay, options)),
        textCell(position.unit),
        numberCell(localizeNumber(position.unitPrice, options)),
        numberCell(localizeNumber(position.amountDisplay, options))
      )
    }
    row(textCell(options.labels.sum), textCell(''), textCell(''), textCell(''), numberCell(localizeNumber(document.sectionTotals[section.id] ?? '', options)))
    lines.push('')
  }

  row(textCell(options.labels.total), textCell(''), numberCell(localizeNumber(document.totalAmount, options)))
  return lines.join('\r\n')
}

/** Das Blatt als Text für die Zwischenablage — dieselbe Reihenfolge, fester Spaltenabstand. */
export function toText(
  document: ComputedDocument,
  options: ExportOptions = defaultExportOptions,
  unitLabel: (unit: MeasureUnit) => string = (unit) => unit
): string {
  const lines: string[] = []
  if (document.title) lines.push(document.title)
  if (document.client) lines.push(`${options.labels.client}: ${document.client}`)
  lines.push('')

  for (const section of document.sections) {
    lines.push(`${options.labels.section}: ${section.label}`)
    for (const entry of section.rows) {
      const value = entry.display ? ` = ${localizeNumber(entry.display, options)} ${unitLabel(entry.unit)}` : ''
      lines.push(`  ${entry.label}: ${entry.expression}${value}`)
    }
    for (const position of section.positions) {
      const amount = position.amountDisplay ? localizeNumber(position.amountDisplay, options) : '—'
      const from = position.sourceExpression ? ` (${position.sourceExpression})` : ''
      lines.push(
        `  ${position.label}: ${localizeNumber(position.quantityDisplay, options)} ${unitLabel(position.unit)}${from} × ${localizeNumber(position.unitPrice, options)} = ${amount}`
      )
    }
    lines.push(`  ${options.labels.sum}: ${localizeNumber(document.sectionTotals[section.id] ?? '', options)}`)
    lines.push('')
  }

  const quantities = measureUnits
    .filter((unit) => document.totalsByUnit[unit] !== undefined)
    .map((unit) => `${localizeNumber(document.totalsByUnit[unit] ?? '', options)} ${unitLabel(unit)}`)
  if (quantities.length > 0) lines.push(`${options.labels.measure} — ${options.labels.sum}: ${quantities.join(' · ')}`)
  lines.push(`${options.labels.total}: ${localizeNumber(document.totalAmount, options)}`)
  return lines.join('\n')
}

/** Kennzahlen für die Übergabe und die Anzeige. */
export function documentStats(document: ComputedDocument) {
  let rows = 0
  let positions = 0
  let broken = 0
  for (const section of document.sections) {
    rows += section.rows.length
    positions += section.positions.length
    broken += section.rows.filter((row) => row.error !== null).length
    broken += section.positions.filter((position) => position.error !== null).length
  }
  return { sections: document.sections.length, rows, positions, broken }
}
