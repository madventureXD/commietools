import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { PDFFont, PDFPage } from 'pdf-lib'

export interface ReportPdfItem {
  readonly description: string
  readonly location: string
  readonly deadline: string
}

export interface ReportPdfPhoto {
  readonly bytes: Uint8Array
  readonly mimeType: 'image/jpeg' | 'image/png'
  readonly note?: string
}

export interface ReportPdfSignature {
  readonly role: string
  readonly bytes: Uint8Array
  readonly mimeType: 'image/jpeg' | 'image/png'
}

export interface ReportPdfLabels {
  readonly object: string
  readonly client: string
  readonly contractor: string
  readonly date: string
  readonly items: string
  readonly description: string
  readonly location: string
  readonly deadline: string
  readonly photos: string
  readonly signatures: string
  readonly warranty: string
  readonly page: string
  readonly empty: string
}

export interface ReportPdfInput {
  readonly title: string
  readonly object: string
  readonly client: string
  readonly contractor: string
  readonly date: string
  readonly items: readonly ReportPdfItem[]
  readonly photos: readonly ReportPdfPhoto[]
  readonly signatures: readonly ReportPdfSignature[]
  readonly warranty: readonly { readonly label: string; readonly date: string }[]
  readonly labels: ReportPdfLabels
  readonly disclaimer: string
}

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2
/** Unterkante des Inhaltsbereichs; die Fußzeile liegt darunter. */
const BOTTOM_LIMIT = MARGIN
/** Unter diesen Restplatz wird keine Tabellenzeile mehr gesetzt, sondern umgebrochen. */
const MIN_SPACE = 80

const BLACK = rgb(0, 0, 0)
const GREY = rgb(0.45, 0.45, 0.45)
const RULE = rgb(0.65, 0.65, 0.65)

const DESC_RATIO = 0.6
const LOC_RATIO = 0.2
const COL_PAD = 5

/** Höhe einer Foto-Zelle ohne Beschriftung. */
const PHOTO_CELL_HEIGHT = 260
const PHOTO_COLUMN_GAP = 12
const PHOTO_NOTE_SPACE = 14
const PHOTO_ROW_GAP = 10

const SIGNATURE_LABEL_HEIGHT = 14
const SIGNATURE_MAX_WIDTH = 240
const SIGNATURE_MAX_HEIGHT = 90
const SIGNATURE_GAP = 24

/**
 * pdf-lib zeichnet mit der Standardkodierung WinAnsi; unbekannte Zeichen lassen `drawText`
 * zur Laufzeit werfen. Deshalb bilden wir typografische Zeichen auf ASCII ab und ersetzen
 * alles außerhalb des WinAnsi-Bereichs (druckbares ASCII und Latin-1-Buchstaben ab 0xA0)
 * durch '?'. So kann keine Beschriftung aus Nutzereingaben den Aufbau abbrechen.
 */
function toWinAnsi(value: string): string {
  const normalized = value
    .replace(/[\u201C\u201D\u201E\u201F]/gu, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/gu, "'")
    .replace(/[\u2013\u2014]/gu, '-')
  let output = ''
  for (const character of normalized) {
    const code = character.codePointAt(0)
    if (code === undefined) continue
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) output += character
    else output += '?'
  }
  return output
}

/**
 * Bricht Text auf die Spaltenbreite um. Gemessen wird mit `widthOfTextAtSize`, damit die
 * Umbruchgrenzen zur tatsächlichen Schriftbreite passen und nicht geschätzt werden.
 */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const clean = toWinAnsi(text)
  const measure = (value: string) => font.widthOfTextAtSize(value, size)
  const lines: string[] = []
  for (const paragraph of clean.split('\n')) {
    const words = paragraph.split(/\s+/u).filter((word) => word.length > 0)
    if (!words.length) {
      lines.push('')
      continue
    }
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (measure(candidate) <= maxWidth) {
        current = candidate
        continue
      }
      if (current) lines.push(current)
      // Einzelnes Wort breiter als die Spalte: zeichenweise zerlegen, sonst läuft es über.
      if (measure(word) > maxWidth) {
        let chunk = ''
        for (const character of word) {
          if (measure(chunk + character) <= maxWidth) chunk += character
          else {
            if (chunk) lines.push(chunk)
            chunk = character
          }
        }
        current = chunk
      } else {
        current = word
      }
    }
    if (current) lines.push(current)
  }
  return lines.length ? lines : ['']
}

function drawRule(page: PDFPage, y: number) {
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4_WIDTH - MARGIN, y }, thickness: 0.75, color: RULE })
}

/** Kopfbereich: Titel groß/fett, darunter die vier Kopfangaben in zwei Spalten. */
function drawHeader(page: PDFPage, regular: PDFFont, bold: PDFFont, input: ReportPdfInput): number {
  let y = A4_HEIGHT - MARGIN
  const titleSize = 20
  y -= titleSize
  page.drawText(toWinAnsi(input.title), { x: MARGIN, y, size: titleSize, font: bold, color: BLACK })
  y -= 12
  drawRule(page, y)
  y -= 22

  const { labels } = input
  const columnWidth = CONTENT_WIDTH / 2
  const size = 10
  const rows: readonly (readonly { readonly label: string; readonly value: string }[])[] = [
    [{ label: labels.object, value: input.object }, { label: labels.contractor, value: input.contractor }],
    [{ label: labels.client, value: input.client }, { label: labels.date, value: input.date }]
  ]
  for (const row of rows) {
    row.forEach((field, index) => {
      const x = MARGIN + index * columnWidth
      const caption = `${toWinAnsi(field.label)}: `
      page.drawText(caption, { x, y, size, font: bold, color: BLACK })
      const captionWidth = bold.widthOfTextAtSize(caption, size)
      page.drawText(toWinAnsi(field.value), { x: x + captionWidth, y, size, font: regular, color: BLACK })
    })
    y -= 17
  }
  return y - 10
}

/** Kopfzeile der Mängeltabelle; wird nach einem Seitenumbruch wiederholt. */
function drawTableHead(page: PDFPage, bold: PDFFont, labels: ReportPdfLabels, top: number): number {
  const size = 10
  const baseline = top - 12
  page.drawText(toWinAnsi(labels.description), { x: MARGIN + COL_PAD, y: baseline, size, font: bold, color: BLACK })
  page.drawText(toWinAnsi(labels.location), { x: MARGIN + CONTENT_WIDTH * DESC_RATIO + COL_PAD, y: baseline, size, font: bold, color: BLACK })
  page.drawText(toWinAnsi(labels.deadline), { x: MARGIN + CONTENT_WIDTH * (DESC_RATIO + LOC_RATIO) + COL_PAD, y: baseline, size, font: bold, color: BLACK })
  drawRule(page, top - 18)
  return top - 22
}

export async function buildReportPdf(input: ReportPdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)

  const newPage = (): PDFPage => document.addPage([A4_WIDTH, A4_HEIGHT])

  let page = newPage()
  let cursorY = drawHeader(page, regular, bold, input)

  const { labels } = input

  // Mängelliste als Tabelle.
  cursorY = drawTableHead(page, bold, labels, cursorY)
  let tableTop = cursorY
  if (!input.items.length) {
    page.drawText(toWinAnsi(labels.empty), { x: MARGIN + COL_PAD, y: cursorY - 12, size: 10, font: regular, color: BLACK })
    cursorY -= 26
  }
  for (const item of input.items) {
    const descriptionLines = wrapText(item.description, regular, 10, CONTENT_WIDTH * DESC_RATIO - COL_PAD * 2)
    const rowHeight = Math.max(16, descriptionLines.length * 12 + 4)
    const fits = cursorY - rowHeight - BOTTOM_LIMIT >= MIN_SPACE
    if (!fits && cursorY < tableTop - 0.5) {
      page = newPage()
      cursorY = drawTableHead(page, bold, labels, A4_HEIGHT - MARGIN)
      tableTop = cursorY
    }
    const baseline = cursorY - 12
    descriptionLines.forEach((line, index) => {
      page.drawText(line, { x: MARGIN + COL_PAD, y: baseline - index * 12, size: 10, font: regular, color: BLACK })
    })
    page.drawText(toWinAnsi(item.location), { x: MARGIN + CONTENT_WIDTH * DESC_RATIO + COL_PAD, y: baseline, size: 10, font: regular, color: BLACK })
    page.drawText(toWinAnsi(item.deadline), { x: MARGIN + CONTENT_WIDTH * (DESC_RATIO + LOC_RATIO) + COL_PAD, y: baseline, size: 10, font: regular, color: BLACK })
    cursorY -= rowHeight
    drawRule(page, cursorY + 2)
  }

  // Gewährleistungsfristen direkt nach der Liste, je Zeile "Label: Datum".
  if (input.warranty.length) {
    cursorY -= 14
    const blockHeight = 20 + input.warranty.length * 13
    if (cursorY - blockHeight - BOTTOM_LIMIT < MIN_SPACE && cursorY < tableTop - 0.5) {
      page = newPage()
      cursorY = A4_HEIGHT - MARGIN - 10
    }
    page.drawText(toWinAnsi(labels.warranty), { x: MARGIN, y: cursorY - 10, size: 11, font: bold, color: BLACK })
    cursorY -= 24
    for (const entry of input.warranty) {
      page.drawText(`${toWinAnsi(entry.label)}: ${toWinAnsi(entry.date)}`, { x: MARGIN, y: cursorY, size: 9, font: regular, color: BLACK })
      cursorY -= 13
    }
  }

  // Fotos: beginnen auf einer neuen Seite, zweispaltiges Raster mit erhaltenem Seitenverhältnis.
  if (input.photos.length) {
    page = newPage()
    cursorY = A4_HEIGHT - MARGIN
    const cellWidth = (A4_WIDTH - 2 * MARGIN - PHOTO_COLUMN_GAP) / 2
    let column = 0
    for (const photo of input.photos) {
      if (column === 0 && cursorY - PHOTO_CELL_HEIGHT - PHOTO_NOTE_SPACE < BOTTOM_LIMIT) {
        page = newPage()
        cursorY = A4_HEIGHT - MARGIN
      }
      const image = photo.mimeType === 'image/jpeg' ? await document.embedJpg(photo.bytes) : await document.embedPng(photo.bytes)
      const scale = Math.min(cellWidth / image.width, PHOTO_CELL_HEIGHT / image.height)
      const width = image.width * scale
      const height = image.height * scale
      const x = MARGIN + column * (cellWidth + PHOTO_COLUMN_GAP)
      page.drawImage(image, { x, y: cursorY - height, width, height })
      if (photo.note) {
        page.drawText(toWinAnsi(photo.note), { x, y: cursorY - PHOTO_CELL_HEIGHT - 8, size: 8, font: regular, color: GREY })
      }
      if (column === 0) {
        column = 1
      } else {
        column = 0
        cursorY -= PHOTO_CELL_HEIGHT + PHOTO_NOTE_SPACE + PHOTO_ROW_GAP
      }
    }
  }

  // Unterschriften: eigene Seite am Ende, nebeneinander.
  if (input.signatures.length) {
    page = newPage()
    cursorY = A4_HEIGHT - MARGIN
    const count = input.signatures.length
    const slotWidth = Math.max(60, (CONTENT_WIDTH - SIGNATURE_GAP * (count - 1)) / count)
    let x = MARGIN
    for (const signature of input.signatures) {
      page.drawText(toWinAnsi(signature.role), { x, y: cursorY - 10, size: 10, font: bold, color: BLACK })
      const image = signature.mimeType === 'image/jpeg' ? await document.embedJpg(signature.bytes) : await document.embedPng(signature.bytes)
      const imageWidth = Math.min(slotWidth, SIGNATURE_MAX_WIDTH)
      const scale = Math.min(imageWidth / image.width, SIGNATURE_MAX_HEIGHT / image.height)
      const width = image.width * scale
      const height = image.height * scale
      const imageY = cursorY - SIGNATURE_LABEL_HEIGHT - height
      page.drawImage(image, { x, y: imageY, width, height })
      const lineY = cursorY - SIGNATURE_LABEL_HEIGHT - SIGNATURE_MAX_HEIGHT - 6
      page.drawLine({ start: { x, y: lineY }, end: { x: x + slotWidth - SIGNATURE_GAP / 2, y: lineY }, thickness: 0.75, color: BLACK })
      x += slotWidth
    }
  }

  // Fußzeile auf jeder Seite nachtragen: Seitenzahl erst jetzt bekannt.
  const pages = document.getPages()
  const pageCount = pages.length
  const footerSize = 7
  const footerLineHeight = 9
  const footerTop = 38
  const footerRuleY = 44
  const footerLines = wrapText(input.disclaimer, regular, footerSize, CONTENT_WIDTH - 80)
  pages.forEach((current, index) => {
    drawRule(current, footerRuleY)
    footerLines.forEach((line, lineIndex) => {
      current.drawText(line, { x: MARGIN, y: footerTop - lineIndex * footerLineHeight, size: footerSize, font: regular, color: GREY })
    })
    const pageText = `${toWinAnsi(labels.page)} ${index + 1} / ${pageCount}`
    const textWidth = regular.widthOfTextAtSize(pageText, footerSize)
    const pageLabelY = footerTop - (footerLines.length - 1) * footerLineHeight
    current.drawText(pageText, { x: A4_WIDTH - MARGIN - textWidth, y: pageLabelY, size: footerSize, font: regular, color: GREY })
  })

  return document.save()
}
