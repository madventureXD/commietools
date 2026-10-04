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
import { get, set, del } from 'idb-keyval'
import { measureUnits, type AufmassDocument, type AufmassPosition, type AufmassRow, type AufmassSection, type MeasureUnit } from './aufmass'

const KEY = 'aufmass.sheet.v1'

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

/** Das gespeicherte Blatt, oder `null`, wenn keines vorliegt oder es nicht passt. */
export async function readSheet(): Promise<AufmassDocument | null> {
  try {
    const stored = await get<unknown>(KEY)
    if (!stored || typeof stored !== 'object') return null
    const document = stored as Record<string, unknown>
    const sections = Array.isArray(document.sections)
      ? document.sections.map(readSection).filter((section): section is AufmassSection => section !== null)
      : []
    return {
      title: typeof document.title === 'string' ? document.title : '',
      client: typeof document.client === 'string' ? document.client : '',
      sections
    }
  } catch {
    return null
  }
}

export async function writeSheet(document: AufmassDocument): Promise<void> {
  await set(KEY, document)
}

export async function clearSheet(): Promise<void> {
  await del(KEY)
}

/** Schlüssel des Bereichs — für Prüfungen und die Übergabe. */
export const AUFMASS_STORAGE_KEY = KEY
