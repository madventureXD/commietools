/**
 * Eigener Speicherbereich für Werkzeug 9 „Aufmaß".
 *
 * **Bewusst getrennt vom Rechner-Verlauf** (`history.ts`): Aufmaße enthalten Preise und
 * Kundendaten. Lägen sie im Verlauf, stünden sie zwischen Rechenergebnissen und würden beim
 * Leeren des Verlaufs mitgelöscht — oder schlimmer, beim Herumzeigen mit sichtbar.
 *
 * Gespeichert wird **ein** Blatt (`aufmass.sheet.v1`). Gelesen wird nur, was strukturell passt;
 * ein fremder oder beschädigter Eintrag führt zu `null`, nicht zu einem Absturz.
 */
import { createIndexedStore, type StoredResult } from '../storage/indexedStore'
import type { StorageOutcome } from '@commietools/core/storage'
import { measureUnits, type AufmassDocument, type AufmassPosition, type AufmassRow, type AufmassSection, type MeasureUnit } from './aufmass'

const KEY = 'aufmass.sheet.v1'
const speicher = createIndexedStore()

function isUnit(value: unknown): value is MeasureUnit {
  return typeof value === 'string' && (measureUnits as readonly string[]).includes(value)
}

function readRow(value: unknown): AufmassRow | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (typeof row.id !== 'string' || typeof row.label !== 'string' || typeof row.expression !== 'string') return null
  if (!isUnit(row.unit)) return null
  return { id: row.id, label: row.label, expression: row.expression, unit: row.unit }
}

function readPosition(value: unknown): AufmassPosition | null {
  if (!value || typeof value !== 'object') return null
  const position = value as Record<string, unknown>
  if (typeof position.id !== 'string' || typeof position.label !== 'string') return null
  if (typeof position.quantity !== 'string' || typeof position.unitPrice !== 'string') return null
  if (!isUnit(position.unit)) return null
  return {
    id: position.id,
    label: position.label,
    quantity: position.quantity,
    sourceRowId: typeof position.sourceRowId === 'string' ? position.sourceRowId : null,
    unit: position.unit,
    unitPrice: position.unitPrice
  }
}

function readSection(value: unknown): AufmassSection | null {
  if (!value || typeof value !== 'object') return null
  const section = value as Record<string, unknown>
  if (typeof section.id !== 'string' || typeof section.label !== 'string') return null
  const rows = Array.isArray(section.rows) ? section.rows.map(readRow).filter((row): row is AufmassRow => row !== null) : []
  const positions = Array.isArray(section.positions)
    ? section.positions.map(readPosition).filter((position): position is AufmassPosition => position !== null)
    : []
  return { id: section.id, label: section.label, rows, positions }
}

/** Ein Blatt liegt vor, wenn ein Gegenstand mit einer Liste von Abschnitten dasteht. */
const istBlattRoh = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false
  return Array.isArray((value as Record<string, unknown>).sections)
}

/**
 * Das gespeicherte Blatt, **mit Zustand** (Karte M8-003).
 *
 * `status: 'ok'` und `value: null` heißt: es liegt **kein** Blatt vor.
 * `status: 'unavailable' | 'quota' | 'invalid'` heißt: es konnte nicht gelesen werden — die
 * Oberfläche schaltet dann in den flüchtigen Sitzungsbetrieb, statt ein leeres Blatt zu zeigen,
 * als wäre nichts vorhanden. Der Unterschied ist wichtig: „kein Blatt" ist harmlos, „nicht
 * gelesen" bedeutet, dass ein vorhandenes Blatt gerade **nicht** sichtbar ist.
 */
export async function readSheet(): Promise<StoredResult<AufmassDocument | null>> {
  const stored = await speicher.read(KEY, null, istBlattRoh)
  if (stored.status !== 'ok' || stored.value === null) return { status: stored.status, value: null }
  const document = stored.value
  const sections = Array.isArray(document.sections)
    ? document.sections.map(readSection).filter((section): section is AufmassSection => section !== null)
    : []
  return {
    status: 'ok',
    value: {
      title: typeof document.title === 'string' ? document.title : '',
      client: typeof document.client === 'string' ? document.client : '',
      sections
    }
  }
}

export async function writeSheet(document: AufmassDocument): Promise<StorageOutcome> {
  return speicher.write(KEY, document)
}

export async function clearSheet(): Promise<StorageOutcome> {
  return speicher.remove(KEY)
}

/** Schlüssel des Bereichs — für Prüfungen und die Übergabe. */
export const AUFMASS_STORAGE_KEY = KEY
