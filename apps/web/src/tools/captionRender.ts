import { arrowGeometry, captionLayout, captionText, type CaptionPhoto } from '@commietools/tools/image/caption'

/**
 * Zeichnen der Beschriftung. Dieselbe Funktion bedient Vorschau und Ergebnis: die Anordnung kommt
 * als Anteil der Bildfläche herein (`captionLayout`), damit beide gleich aussehen. Eine in Pixel
 * gesetzte Schrift oder Leiste liefe auf schmalen Bildschirmen über.
 */
const BAND_COLOUR = 'rgba(12, 14, 18, 0.78)'
const TEXT_COLOUR = '#ffffff'
const ARROW_COLOUR = '#ff4b59'

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

function contextOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('no-2d-context')
  return context
}

/** Lädt eine Bilddatei; der Objekt-URL wird wieder freigegeben, sobald das Bild steht. */
export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image-unreadable')) }
    image.src = url
  })
}

/** Zeichnet Leiste, Text und Pfeil in einen vorhandenen Zusammenhang. */
export function drawCaption(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  arrow: CaptionPhoto['arrow']
): void {
  const layout = captionLayout()
  const leiste = Math.round(height * layout.bandFraction)
  const innen = Math.round(height * layout.paddingFraction)
  const schrift = Math.max(10, Math.round(height * layout.fontSizeFraction))

  // Textleiste unten.
  context.fillStyle = BAND_COLOUR
  context.fillRect(0, height - leiste, width, leiste)

  // Pfeil zuerst, damit der Text darüber liegt.
  const geometrie = arrow ? arrowGeometry(arrow, layout) : null
  if (geometrie) {
    const von = { x: geometrie.from.x * width, y: geometrie.from.y * height }
    const nach = { x: geometrie.to.x * width, y: geometrie.to.y * height }
    const strich = Math.max(3, Math.round(height * 0.005))
    const kopf = Math.max(8, Math.round(height * 0.025))
    const winkel = Math.atan2(nach.y - von.y, nach.x - von.x)
    const spitze = () => {
      context.beginPath()
      context.moveTo(nach.x, nach.y)
      context.lineTo(nach.x - kopf * Math.cos(winkel - Math.PI / 7), nach.y - kopf * Math.sin(winkel - Math.PI / 7))
      context.lineTo(nach.x - kopf * Math.cos(winkel + Math.PI / 7), nach.y - kopf * Math.sin(winkel + Math.PI / 7))
      context.closePath()
    }
    // Erst eine weiße Unterlage, dann der farbige Strich: auf dunklen Bildstellen wäre ein
    // dünner roter Pfeil sonst kaum zu erkennen (im Belegbild nachgemessen und verbessert).
    context.strokeStyle = '#ffffff'
    context.fillStyle = '#ffffff'
    context.lineWidth = strich * 2.4
    context.beginPath()
    context.moveTo(von.x, von.y)
    context.lineTo(nach.x, nach.y)
    context.stroke()
    spitze()
    context.fill()
    context.strokeStyle = ARROW_COLOUR
    context.fillStyle = ARROW_COLOUR
    context.lineWidth = strich
    context.beginPath()
    context.moveTo(von.x, von.y)
    context.lineTo(nach.x, nach.y)
    context.stroke()
    // Pfeilspitze am Ziel
    spitze()
    context.fill()
  }

  if (!text) return
  const geprueft = String(text)
  context.fillStyle = TEXT_COLOUR
  context.font = `600 ${schrift}px Inter, ui-sans-serif, system-ui, sans-serif`
  context.textBaseline = 'top'

  // Umbruch in höchstens zwei Zeilen; zu lange Texte werden gekürzt, nicht über den Rand gezeichnet.
  const breite = width * 0.94 - innen * 2
  const zeilen = wrapText(context, geprueft, breite, 2)
  const zeilenhoehe = Math.round(schrift * 1.25)
  const gesamt = zeilen.length * zeilenhoehe
  let y = height - leiste + Math.max(innen, Math.round((leiste - gesamt) / 2))
  for (const zeile of zeilen) {
    context.fillText(zeile, innen, y)
    y += zeilenhoehe
  }
}

/**
 * Bricht Text auf die angegebene Breite. Reicht der Platz für höchstens `maxLines` Zeilen nicht,
 * wird die **letzte** Zeile mit … gekürzt — der Text wird nie über den Rand gezeichnet.
 */
export function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const passt = (kandidat: string) => context.measureText(kandidat).width <= maxWidth
  const woerter = text.split(/\s+/).filter(Boolean)
  const zeilen: string[] = []
  let aktuell = ''
  let uebrig = false
  for (const wort of woerter) {
    const kandidat = aktuell ? `${aktuell} ${wort}` : wort
    if (passt(kandidat) || !aktuell) {
      aktuell = kandidat
      continue
    }
    if (zeilen.length + 1 >= maxLines) {
      uebrig = true
      break
    }
    zeilen.push(aktuell)
    aktuell = wort
  }
  if (aktuell) zeilen.push(aktuell)
  if (uebrig && zeilen.length) {
    let letzte = zeilen[zeilen.length - 1] ?? ''
    while (letzte.length > 1 && !passt(`${letzte}…`)) letzte = letzte.slice(0, -1)
    zeilen[zeilen.length - 1] = `${letzte}…`
  }
  return zeilen.slice(0, maxLines)
}

/**
 * Vorschau: gezeichnet wird mit fester Breite, die Anzeige skaliert per CSS
 * (`max-width: 100%`). Damit hängt die Anordnung nicht daran, ob das Element im Augenblick des
 * Zeichnens schon vermessen ist — und Vorschau und Ergebnis zeigen dieselben Anteile.
 */
export const PREVIEW_WIDTH = 1200

export function drawPreview(canvas: HTMLCanvasElement, image: HTMLImageElement, photo: CaptionPhoto): void {
  const verhaeltnis = (image.naturalHeight || 3) / (image.naturalWidth || 4)
  canvas.width = PREVIEW_WIDTH
  canvas.height = Math.max(120, Math.round(PREVIEW_WIDTH * verhaeltnis))
  const context = contextOf(canvas)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  drawCaption(context, canvas.width, canvas.height, captionText(photo), photo.arrow)
}

/** Fertiges Bild in voller Größe. */
export async function renderCaptioned(photo: CaptionPhoto, image: HTMLImageElement, format: 'image/jpeg' | 'image/png', quality: number): Promise<Blob> {
  const canvas = createCanvas(image.naturalWidth || 1, image.naturalHeight || 1)
  const context = contextOf(canvas)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  drawCaption(context, canvas.width, canvas.height, captionText(photo), photo.arrow)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('render-failed'))), format, quality)
  })
}

/** Der Beschriftungsanteil als Datenquelle für das PDF (volle Größe, JPEG). */
export async function captionedBytes(photo: CaptionPhoto, image: HTMLImageElement): Promise<Uint8Array> {
  const blob = await renderCaptioned(photo, image, 'image/jpeg', 0.85)
  return new Uint8Array(await blob.arrayBuffer())
}

/** Punkt aus einem Klick auf die Vorschau in Prozent der Bildfläche. */
export function arrowFromClick(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return { x: 50, y: 50 }
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) }
}
