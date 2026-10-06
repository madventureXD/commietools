/**
 * Baustellenfoto-Beschrifter (Welle D, Werkzeug 19) — reine Fachlogik, keine Texte, kein DOM.
 *
 * **Warum die Geometrie hier und nicht im Zeichencode:** Die Beschriftung wird zweimal gezeichnet —
 * einmal klein in der Vorschau, einmal in voller Bildgröße für das Ergebnis. Beide müssen
 * **dieselbe** Anordnung zeigen. Deshalb rechnet diese Datei die Anordnung in **Anteilen** der
 * Bildfläche (0..1), nicht in Pixeln: Ein in Pixeln gesetztes Maß läuft auf schmalen Bildschirmen
 * über, und ein in Pixeln positionierter Pfeil passt nach dem Verkleinern nicht mehr zum Bild.
 *
 * Der Zeitstempel kommt aus den EXIF-Daten, wenn dort einer steht; fehlt er, bleibt das Feld leer
 * statt geraten zu werden — ein erfundenes Aufnahmedatum wäre hier besonders schädlich, weil es
 * später als Beleg gelesen wird.
 */
import type { MetadataEntry } from './metadata/metadata'

export const captionLimits = {
  noteMax: 160,
  photosMax: 60,
  /** Anteil der Bildhöhe für die Textleiste. */
  bandFractionMin: 0.06,
  bandFractionMax: 0.22,
  /** Anteil der Bildbreite, den der Text höchstens einnimmt. */
  textWidthFraction: 0.94,
  fontSizeFractionMin: 0.018,
  fontSizeFractionMax: 0.075
} as const

export interface CaptionArrow {
  /** Zielpunkt in Prozent der Bildfläche, 0..100. */
  readonly x: number
  readonly y: number
}

export interface CaptionPhoto {
  readonly id: string
  /** Dateiname ohne Endung — wird für den Vorschlag des Speichernamens gebraucht. */
  readonly name: string
  readonly note: string
  /** `JJJJ-MM-TT HH:MM`, oder leer, wenn kein Zeitstempel vorliegt. */
  readonly timestamp: string
  readonly timestampFromExif: boolean
  /** Woher die Zeit stammt. `ModifyDate` ist nicht die Aufnahmezeit und wird anders benannt. */
  readonly timestampSource?: TimestampSource | null
  readonly arrow: CaptionArrow | null
}

export interface CaptionLayout {
  /** Höhe der Textleiste als Anteil der Bildhöhe. */
  readonly bandFraction: number
  /** Schriftgröße als Anteil der Bildhöhe. */
  readonly fontSizeFraction: number
  /** Innenabstand als Anteil der Bildhöhe. */
  readonly paddingFraction: number
}

/**
 * Anordnung der Textleiste. Die Leiste wächst mit dem Bild, bleibt aber in Anteilen, damit
 * Vorschau und Ergebnis gleich aussehen.
 */
export function captionLayout(): CaptionLayout {
  return {
    bandFraction: 0.14,
    fontSizeFraction: 0.045,
    paddingFraction: 0.022
  }
}

/** Prüft einen Zeitstempel `JJJJ-MM-TT HH:MM` (oder nur das Datum). */
export function isUsableTimestamp(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true // leer ist erlaubt: „kein Zeitstempel"
  const treffer = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/)
  if (!treffer) return false
  const [, jahr, monat, tag, stunde, minute] = treffer
  const monatZahl = Number(monat)
  const tagZahl = Number(tag)
  if (monatZahl < 1 || monatZahl > 12 || tagZahl < 1 || tagZahl > 31) return false
  if (stunde !== undefined && (Number(stunde) > 23 || Number(minute) > 59)) return false
  // Den Tag gegen den echten Monat prüfen — der 31. Februar ist kein Datum.
  const geprueft = new Date(Date.UTC(Number(jahr), monatZahl, 0))
  return geprueft.getUTCDate() >= tagZahl
}

/**
 * Reihenfolge der Zeitquellen: Aufnahmezeit, Erstellzeit, **Änderungsdatum**.
 *
 * Die dritte Quelle heißt beim eigenen Exif-Leser des Projekts `ModifyDate` (Tag 0x0132), nicht
 * `DateTime` — das war ein Fehler, den erst ein echtes Fremdfoto aufgedeckt hat (Windows-Systembild,
 * in Photoshop bearbeitet: es hat nur `ModifyDate`). Sie ist **nicht** die Aufnahmezeit, deshalb
 * wird die Herkunft mitgegeben und in der Oberfläche benannt.
 */
const ZEITQUELLEN = ['DateTimeOriginal', 'CreateDate', 'ModifyDate'] as const
export type TimestampSource = (typeof ZEITQUELLEN)[number]

/** Zeitstempel samt Herkunft; `value` leer, wenn keine Quelle etwas Brauchbares liefert. */
export function exifTimestampFrom(entries: readonly MetadataEntry[]): { value: string; from: TimestampSource | null } {
  for (const tag of ZEITQUELLEN) {
    const eintrag = entries.find((entry) => entry.tag === tag)
    if (!eintrag) continue
    const umgewandelt = normalizeExifDate(eintrag.value)
    if (umgewandelt) return { value: umgewandelt, from: tag }
  }
  return { value: '', from: null }
}

/** Die Aufnahmezeit der Datei als `JJJJ-MM-TT HH:MM`; leer, wenn keine brauchbare Zeit darin steht. */
export function exifTimestamp(entries: readonly MetadataEntry[]): string {
  return exifTimestampFrom(entries).value
}

/**
 * Bringt eine Aufnahmezeit auf `JJJJ-MM-TT HH:MM`.
 *
 * Zwei Schreibweisen kommen vor und beide müssen gehen: der eigene Exif-Leser des Projekts
 * liefert die Zeit **bereits umgesetzt** als `2026-10-05 14:22:07`, rohe Exif-Daten schreiben
 * `2026:10:05 14:22:07`. (Belegt im Browser-Beleg: der Leser gibt ISO aus.)
 */
export function normalizeExifDate(value: string): string {
  const treffer = value.trim().match(/^(\d{4})[-:](\d{2})[-:](\d{2})[ T](\d{2}):(\d{2})/)
  if (!treffer) return ''
  const [, jahr, monat, tag, stunde, minute] = treffer
  const kandidat = `${jahr}-${monat}-${tag} ${stunde}:${minute}`
  return isUsableTimestamp(kandidat) ? kandidat : ''
}

/** Pfeilziel auf 0..100 begrenzen; fehlende oder unbrauchbare Werte ergeben keinen Pfeil. */
export function normaliseArrow(x: number, y: number): CaptionArrow | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) }
}

/** Der Text, der in der Leiste steht: Zeitstempel und Notiz, leere Teile fallen weg. */
export function captionText(photo: Pick<CaptionPhoto, 'timestamp' | 'note'>): string {
  return [photo.timestamp.trim(), photo.note.trim()].filter(Boolean).join(' · ')
}

/**
 * Anfangs- und Endpunkt des Pfeils in Anteilen der Bildfläche.
 *
 * Der Pfeil beginnt an der **Oberkante der Textleiste** — genau unter dem Ziel, damit er nicht
 * quer über das Bild läuft — und endet am Zielpunkt. Liegt das Ziel in der Leiste, gibt es keinen
 * Pfeil: er hätte keine Strecke.
 */
export function arrowGeometry(
  arrow: CaptionArrow,
  layout: CaptionLayout = captionLayout()
): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
  const to = { x: arrow.x / 100, y: arrow.y / 100 }
  const leiste = 1 - layout.bandFraction
  if (to.y >= leiste) return null
  if (Math.abs(to.y - leiste) < 0.01) return null
  return { from: { x: to.x, y: leiste }, to }
}

/** Ergebnisname je Foto: „foto-beschriftet.jpg" bleibt eindeutig, auch wenn der Name doppelt vorkommt. */
export function resultName(name: string, index: number, used: readonly string[] = [], endung: 'jpg' | 'png' = 'jpg'): string {
  const basis = name.trim().replace(/\.[a-z0-9]{1,6}$/iu, '').replace(/[\\/:*?"<>|]/gu, '-') || `foto-${index + 1}`
  let kandidat = `${basis}-beschriftet.${endung}`
  let zaehler = 2
  while (used.includes(kandidat)) {
    kandidat = `${basis}-beschriftet-${zaehler}.${endung}`
    zaehler += 1
  }
  return kandidat
}
