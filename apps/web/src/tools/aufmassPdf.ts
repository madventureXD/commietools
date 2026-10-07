/**
 * PDF-Ausgabe des Aufmaßblattes.
 *
 * Nutzt die im Projekt bereits erprobte `pdf-lib` und wird **erst beim Auslösen** geladen
 * (`await import`), damit die Aufmaß-Route ohne PDF-Engine startet — dieselbe Ladelinie wie bei
 * allen PDF-Werkzeugen.
 *
 * Schrift: `Helvetica` (WinAnsi) genügt für Deutsch, Englisch und Spanisch einschließlich
 * Umlauten, `ñ`, `×`, `÷` und `²`. Zeichen außerhalb von WinAnsi werden ersetzt, statt still eine
 * kaputte Datei zu erzeugen.
 */
import type { ComputedDocument, MeasureUnit } from '@commietools/tools/calculator/aufmass'
import { anzeigeKontext } from './formatContext'

export interface AufmassPdfLabels {
  readonly title: string
  readonly client: string
  readonly rows: string
  readonly positions: string
  readonly quantity: string
  readonly unit: string
  readonly unitPrice: string
  readonly amount: string
  readonly sum: string
  readonly sectionSum: string
  readonly total: string
  readonly totals: string
}

/**
 * Zeichen außerhalb von WinAnsi ersetzen — keine kaputte Datei, keine stille Lüge.
 *
 * WinAnsi ist nicht Latin-1: Der Bereich 0x80–0x9F ist belegt (CP1252). Diese Codes roh
 * durchzureichen scheitert jedoch an `pdf-lib`, das die Standardfont selbst kodiert — ein
 * Versuch mit `String.fromCharCode(0x97)` für den Gedankenstrich hat die Erzeugung sofort
 * abgebrochen. Deshalb wird auf **sichtbare ASCII-Entsprechungen** abgebildet: Der Titel
 * „Bad EG — Nord" steht dann als „Bad EG - Nord" im PDF, nicht als „Bad EG ? Nord".
 */
const TRANSLITERATION: Readonly<Record<string, string>> = {
  '—': '-', '–': '-', '−': '-', '…': '...', '•': '*', '·': '*',
  '„': '"', '“': '"', '”': '"', '‚': "'", '‘': "'", '’': "'", '´': "'",
  '€': 'EUR', '‰': 'o/oo', '™': '(TM)', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z',
  'Œ': 'OE', 'œ': 'oe', 'Ÿ': 'Y', '†': '+', '‡': '++', 'ˆ': '^'
}

function winAnsi(text: string): string {
  let result = ''
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0
    if (code <= 0xff && !(code >= 0x80 && code <= 0x9f)) {
      result += character
      continue
    }
    result += TRANSLITERATION[character] ?? '?'
  }
  return result
}

/** Maßzahl mit drei Nachkommastellen — dieselbe Genauigkeit wie in der Oberfläche. */
function measure(text: string, locale: string): string {
  const value = Number(text)
  if (!Number.isFinite(value)) return text
  return new Intl.NumberFormat(anzeigeKontext(locale).regionLocale, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value)
}

/** Geldbetrag mit zwei Nachkommastellen; ohne Tausenderzeichen, damit die Datei ruhig bleibt. */
function number(text: string, locale: string): string {
  const value = Number(text)
  if (!Number.isFinite(value)) return text
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(value)
}

export async function buildAufmassPdf(
  document: ComputedDocument,
  labels: AufmassPdfLabels,
  locale: string,
  unitLabel: (unit: MeasureUnit) => string
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const width = 595.28
  const height = 841.89
  const margin = 48
  const lineHeight = 14
  const black = rgb(0.09, 0.09, 0.11)
  const grey = rgb(0.42, 0.44, 0.5)

  let page = pdf.addPage([width, height])
  let cursor = height - margin

  const ensure = (needed: number) => {
    if (cursor - needed < margin) {
      page = pdf.addPage([width, height])
      cursor = height - margin
    }
  }

  const write = (text: string, size: number, useBold: boolean, indent = 0, color = black) => {
    ensure(lineHeight)
    page.drawText(winAnsi(text).slice(0, 300), {
      x: margin + indent,
      y: cursor,
      size,
      font: useBold ? bold : font,
      color
    })
    cursor -= lineHeight
  }

  write(labels.title, 16, true)
  cursor -= 4
  if (document.title) write(document.title, 12, true)
  if (document.client) write(`${labels.client}: ${document.client}`, 10, false, 0, grey)
  cursor -= 6

  for (const section of document.sections) {
    ensure(lineHeight * 3)
    write(section.label || labels.rows, 12, true)
    for (const row of section.rows) {
      const value = row.display ? ` = ${measure(row.display, locale)} ${unitLabel(row.unit)}` : ''
      write(`${row.label}: ${row.expression}${value}`, 10, false, 12)
    }
    for (const position of section.positions) {
      const from = position.sourceExpression ? ` (${position.sourceExpression})` : ''
      const amount = position.amountDisplay ? number(position.amountDisplay, locale) : '—'
      write(
        `${position.label}: ${measure(position.quantityDisplay, locale)} ${unitLabel(position.unit)}${from} × ${number(position.unitPrice, locale)} = ${amount}`,
        10,
        false,
        12
      )
    }
    write(`${labels.sectionSum}: ${number(document.sectionTotals[section.id] ?? '', locale)}`, 10, true, 12)
    cursor -= 6
  }

  const quantities = (Object.keys(document.totalsByUnit) as MeasureUnit[])
    .map((unit) => `${measure(document.totalsByUnit[unit] ?? '', locale)} ${unitLabel(unit)}`)
    .join('   ')
  if (quantities) {
    ensure(lineHeight * 2)
    write(`${labels.totals}: ${quantities}`, 10, false, 0, grey)
  }
  ensure(lineHeight * 2)
  write(`${labels.total}: ${number(document.totalAmount, locale)}`, 13, true)

  return pdf.save()
}
