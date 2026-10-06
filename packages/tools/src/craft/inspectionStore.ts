/**
 * Eigener Speicherbereich für Werkzeug 23 „Prüffristen".
 *
 * **Bewusst getrennt von den Rechner-Bereichen** (wie beim Aufmaß): Die Liste trägt Gegenstände,
 * Prüftermine und Notizen eines Betriebs. Sie gehört nicht in einen Verlauf, den man beim Leeren
 * mitlöscht oder beim Herumzeigen sieht.
 *
 * Gespeichert wird **ein** Eintrag (`inspection.items.v1`) mit Liste und Warnschwelle. Gelesen
 * wird nur, was strukturell passt; ein fremder oder beschädigter Eintrag führt zu `null`, nicht zu
 * einem Absturz.
 */
import { createIndexedStore, type StoredResult } from '../storage/indexedStore'
import type { StorageOutcome } from '@commietools/core/storage'
import { inspectionLimits, isIntervalMonths, clampWarnDays, type InspectionItem } from './inspection'

const KEY = 'inspection.items.v1'
const speicher = createIndexedStore()

export interface StoredInspection {
  readonly warnDays: number
  readonly items: readonly InspectionItem[]
}

function readText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

function readItem(value: unknown): InspectionItem | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string' || !item.id) return null
  const label = readText(item.label, inspectionLimits.labelMax)
  if (!label) return null
  const intervalMonths = typeof item.intervalMonths === 'string' ? item.intervalMonths : ''
  if (!isIntervalMonths(intervalMonths)) return null
  const lastChecked = typeof item.lastChecked === 'string' ? item.lastChecked : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastChecked)) return null
  return { id: item.id, label, intervalMonths, lastChecked, note: readText(item.note, inspectionLimits.noteMax) }
}

/** Eine Liste liegt vor, wenn ein Gegenstand mit einer Liste von Einträgen dasteht. */
const istListeRoh = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false
  return Array.isArray((value as Record<string, unknown>).items)
}

/**
 * Gespeicherte Liste und Warnschwelle, **mit Zustand** (Karte M8-003).
 *
 * `status: 'ok'` und `value: null` heißt: es liegt **keine** Liste vor. Jeder andere Zustand
 * heißt: sie konnte nicht gelesen werden — ein vorhandener Prüfplan ist dann gerade **nicht**
 * sichtbar, und die Oberfläche sagt das, statt eine leere Liste zu zeigen.
 */
export async function readInspection(): Promise<StoredResult<StoredInspection | null>> {
  const stored = await speicher.read(KEY, null, istListeRoh)
  if (stored.status !== 'ok' || stored.value === null) return { status: stored.status, value: null }
  const document = stored.value
  const items = Array.isArray(document.items)
    ? document.items.map(readItem).filter((item): item is InspectionItem => item !== null).slice(0, inspectionLimits.itemsMax)
    : []
  const warnDays = clampWarnDays(typeof document.warnDays === 'string' ? document.warnDays : String(document.warnDays ?? ''))
  return { status: 'ok', value: { warnDays: warnDays ?? 30, items } }
}

export async function writeInspection(value: StoredInspection): Promise<StorageOutcome> {
  return speicher.write(KEY, { warnDays: value.warnDays, items: value.items })
}

export async function clearInspection(): Promise<StorageOutcome> {
  return speicher.remove(KEY)
}

/** Schlüssel des Bereichs — für Prüfungen und die Übergabe. */
export const INSPECTION_STORAGE_KEY = KEY
