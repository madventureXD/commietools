import type { Temporal as TemporalNamespace } from '@js-temporal/polyfill'
import { addToDate, type DateResult } from '../calculator/dates'

type TemporalApi = typeof TemporalNamespace

/**
 * Abnahme-, Übergabe- und Mängelprotokoll (Welle D, Werkzeug 20) — reine Fachlogik.
 *
 * Keine Texte, kein DOM: Beschriftungen kommen aus den Sprachpaketen, das Zeichnen ins PDF aus
 * `pdf/report.ts`. Neu ist die Rechnung der **Gewährleistungsfristen**: sie werden aus dem
 * Abnahmedatum berechnet und nie behauptet.
 */

export interface HandoverItem {
  readonly id: string
  readonly description: string
  readonly location: string
  readonly deadline: string
}

export interface HandoverDraft {
  readonly object: string
  readonly client: string
  readonly contractor: string
  readonly date: string
  readonly items: readonly HandoverItem[]
}

export const handoverLimits = {
  objectMax: 120,
  nameMax: 80,
  descriptionMax: 400,
  locationMax: 120,
  itemsMax: 60,
  photosMax: 12
} as const

/** Ein leeres Mängelfeld. Die Kennung ist fortlaufend, damit die Oberfläche stabil bleibt. */
export function emptyItem(number: number): HandoverItem {
  return { id: `mangel-${number}`, description: '', location: '', deadline: '' }
}

/**
 * Prüft eine Zeile. Leere Zeilen sind **kein** Fehler (sie werden beim Erzeugen übersprungen),
 * halb ausgefüllte dagegen schon: eine Frist ohne Beschreibung ergibt keinen Sinn.
 */
export function itemErrorKeys(item: HandoverItem): readonly string[] {
  const fehler: string[] = []
  const beschreibung = item.description.trim()
  const ort = item.location.trim()
  const frist = item.deadline.trim()
  if (!beschreibung && (ort || frist)) fehler.push('tool.handover.error.descriptionMissing')
  if (beschreibung.length > handoverLimits.descriptionMax) fehler.push('tool.handover.error.descriptionLong')
  if (ort.length > handoverLimits.locationMax) fehler.push('tool.handover.error.locationLong')
  if (frist && !isIsoDate(frist)) fehler.push('tool.handover.error.deadlineInvalid')
  return fehler
}

/** Gefüllte Zeilen — leere Zeilen fallen weg, statt im PDF als leere Tabellenzeile zu landen. */
export function filledItems(items: readonly HandoverItem[]): readonly HandoverItem[] {
  return items.filter((item) => item.description.trim() !== '')
}

/**
 * Prüft das ganze Protokoll.
 *
 * `signatureCount` ist die Zahl der unterschriebenen Rollen. Fehlt sie, wird das **gemeldet** und
 * nicht still ein leeres Feld erzeugt — die Erzeugung ist trotzdem möglich, weil ein Protokoll
 * auch ohne Unterschrift verschickt werden darf (dann steht der Hinweis im PDF).
 */
export function reportErrorKeys(draft: HandoverDraft, signatureCount: number): readonly string[] {
  const fehler: string[] = []
  if (!draft.object.trim()) fehler.push('tool.handover.error.objectMissing')
  if (draft.object.length > handoverLimits.objectMax) fehler.push('tool.handover.error.objectLong')
  if (draft.client.length > handoverLimits.nameMax) fehler.push('tool.handover.error.clientLong')
  if (draft.contractor.length > handoverLimits.nameMax) fehler.push('tool.handover.error.contractorLong')
  if (!isIsoDate(draft.date)) fehler.push('tool.handover.error.dateInvalid')
  const zeilen = filledItems(draft.items)
  if (!zeilen.length) fehler.push('tool.handover.error.noItems')
  if (zeilen.length > handoverLimits.itemsMax) fehler.push('tool.handover.error.tooManyItems')
  for (const zeile of zeilen) fehler.push(...itemErrorKeys(zeile))
  if (signatureCount === 0) fehler.push('tool.handover.error.noSignature')
  return fehler
}

/** Strenges Kalenderdatum: `JJJJ-MM-TT` und wirklich vorhandener Tag (kein 31.02.). */
export function isIsoDate(value: string): boolean {
  const treffer = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!treffer) return false
  const [, jahr, monat, tag] = treffer
  const datum = new Date(`${jahr}-${monat}-${tag}T00:00:00Z`)
  if (Number.isNaN(datum.getTime())) return false
  return datum.getUTCFullYear() === Number(jahr) && datum.getUTCMonth() + 1 === Number(monat) && datum.getUTCDate() === Number(tag)
}

export interface WarrantyDeadline {
  readonly key: 'bgb' | 'vob'
  readonly years: number
  readonly date: string
}

/**
 * Gewährleistungsfristen aus dem Abnahmedatum.
 *
 * BGB § 634a Abs. 1 Nr. 2: fünf Jahre bei einem Bauwerk. VOB/B § 13 Abs. 4 Nr. 2: vier Jahre,
 * wenn VOB/B vereinbart ist. **Beide Zahlen sind Rechtsanwendung, keine Rechtsberatung** — das
 * steht als Hinweis in der Oberfläche. Ob VOB/B gilt, entscheidet der Vertrag, nicht das Werkzeug.
 */
export function warrantyDeadlines(acceptanceIso: string, temporal: TemporalApi): readonly WarrantyDeadline[] {
  if (!isIsoDate(acceptanceIso)) return []
  const grenzen: readonly { key: 'bgb' | 'vob'; years: number }[] = [
    { key: 'bgb', years: 5 },
    { key: 'vob', years: 4 }
  ]
  return grenzen.map((grenze) => {
    const ergebnis: DateResult = addToDate(acceptanceIso, grenze.years, 'years', temporal)
    return { key: grenze.key, years: grenze.years, date: ergebnis.values?.iso ?? '' }
  }).filter((grenze) => grenze.date !== '')
}

/** Dateiname des Protokolls: aus Objekt und Datum, ohne unzulässige Zeichen. */
export function reportFileName(object: string, date: string): string {
  const teil = (wert: string) => wert.trim().replace(/\.[a-z0-9]{1,6}$/iu, '').replace(/[\\/:*?"<>|]/gu, '-').replace(/\s+/gu, '-').slice(0, 60)
  const objekt = teil(object) || 'protokoll'
  const datum = isIsoDate(date) ? date : ''
  return [objekt, datum, 'protokoll'].filter(Boolean).join('-').toLowerCase() + '.pdf'
}
