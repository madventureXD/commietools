/**
 * Verlauf, Variablen und Einstellungen für den Rechner (Entwurf C im Konzept).
 *
 * Vier getrennte Bereiche: Verlauf, Variablen, Einstellungen — und ein eigener Bereich für
 * Werkzeug 9 „Aufmaß", der hier bewusst noch nicht angelegt ist, damit Rechner-Verlauf und
 * Aufmaßdaten sich nie vermischen.
 *
 * Der Verlauf ist ein Ringpuffer mit fester Obergrenze: die Datenbank wächst damit nicht und
 * es braucht keine Aufräumlogik.
 */
import { get, set, del } from 'idb-keyval'

export interface HistoryEntry {
  readonly expression: string
  readonly display: string
  readonly at: number
}

/** Rechnerart der Oberfläche. Der Rechenkern kennt diese Einteilung nicht — sie ist Bedienung. */
export type CalculatorUiMode = 'standard' | 'scientific' | 'programmer' | 'rpn'

export interface CalculatorSettings {
  readonly fractionMode: boolean
  readonly mode: CalculatorUiMode
  readonly angleMode: 'rad' | 'deg' | 'grad'
  /** Anzeige-Basis des Programmierer-Modus. */
  readonly base: 2 | 8 | 10 | 16
  /** Wortbreite in Bit, Zweierkomplement. */
  readonly wordBits: number
  /** Mit Vorzeichen (`intN`) oder ohne (`uintN`). */
  readonly signed: boolean
}

export const HISTORY_LIMIT = 200

const KEYS = {
  history: 'calculator.history',
  variables: 'calculator.variables',
  settings: 'calculator.settings'
} as const

const DEFAULT_SETTINGS: CalculatorSettings = {
  fractionMode: false,
  mode: 'standard',
  angleMode: 'rad',
  base: 16,
  wordBits: 32,
  signed: true
}

export async function readHistory(): Promise<readonly HistoryEntry[]> {
  const stored = await get<HistoryEntry[]>(KEYS.history)
  return Array.isArray(stored) ? stored : []
}

/** Fügt einen Eintrag vorn an und schneidet den Ringpuffer auf `HISTORY_LIMIT` ab. */
export async function pushHistory(
  current: readonly HistoryEntry[],
  entry: HistoryEntry
): Promise<readonly HistoryEntry[]> {
  const next = [entry, ...current].slice(0, HISTORY_LIMIT)
  await set(KEYS.history, next)
  return next
}

export async function clearHistory(): Promise<readonly HistoryEntry[]> {
  await del(KEYS.history)
  return []
}

export async function readVariables(): Promise<Record<string, string>> {
  const stored = await get<Record<string, string>>(KEYS.variables)
  return stored && typeof stored === 'object' ? stored : {}
}

export async function writeVariables(variables: Record<string, string>): Promise<void> {
  await set(KEYS.variables, variables)
}

export async function readSettings(): Promise<CalculatorSettings> {
  const stored = await get<CalculatorSettings>(KEYS.settings)
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS
}

export async function writeSettings(settings: CalculatorSettings): Promise<void> {
  await set(KEYS.settings, settings)
}
