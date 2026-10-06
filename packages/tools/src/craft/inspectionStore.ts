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
import { get, set, del } from 'idb-keyval'
import { inspectionLimits, isIntervalMonths, clampWarnDays, type InspectionItem } from './inspection'

const KEY = 'inspection.items.v1'

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

/** Gespeicherte Liste und Warnschwelle, oder `null`, wenn nichts Brauchbares vorliegt. */
export async function readInspection(): Promise<StoredInspection | null> {
  try {
    const stored = await get<unknown>(KEY)
    if (!stored || typeof stored !== 'object') return null
    const document = stored as Record<string, unknown>
    const items = Array.isArray(document.items)
      ? document.items.map(readItem).filter((item): item is InspectionItem => item !== null).slice(0, inspectionLimits.itemsMax)
      : []
    const warnDays = clampWarnDays(typeof document.warnDays === 'string' ? document.warnDays : String(document.warnDays ?? ''))
    return { warnDays: warnDays ?? 30, items }
  } catch {
    return null
  }
}

export async function writeInspection(value: StoredInspection): Promise<void> {
  await set(KEY, { warnDays: value.warnDays, items: value.items })
}

export async function clearInspection(): Promise<void> {
  await del(KEY)
}

/** Schlüssel des Bereichs — für Prüfungen und die Übergabe. */
export const INSPECTION_STORAGE_KEY = KEY
