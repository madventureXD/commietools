/**
 * Verlauf, Variablen und Einstellungen — **je Rechenart ein eigener Speicherbereich**
 * (Entscheidung 2026-10-04: ein Werkzeug je Rechenart, Verlauf und Einstellungen je Werkzeug).
 *
 * Getrennte Bereiche je Werkzeug: Verlauf, Variablen, Einstellungen — und ein eigener Bereich für
 * Werkzeug „Aufmaß", der hier bewusst nicht angelegt ist, damit Rechner-Verlauf und Aufmaßdaten
 * sich nie vermischen.
 *
 * Der Verlauf ist ein Ringpuffer mit fester Obergrenze: die Datenbank wächst damit nicht und
 * es braucht keine Aufräumlogik.
 *
 * **Der alte gemeinsame Bereich `calculator.*` wird nicht mehr benutzt und nicht gelöscht.** Er
 * enthielt den Verlauf **aller vier** Rechenarten in einer Liste — genau die Vermischung, die die
 * Aufteilung beendet. Er bleibt im Gerät liegen; gelöscht wird nur auf ausdrücklichen
 * Nutzerwunsch, und „Verlauf löschen" löscht genau einen Bereich.
 */
import { get, set, del } from 'idb-keyval'

export interface HistoryEntry {
  readonly expression: string
  readonly display: string
  readonly at: number
}

export interface CalculatorSettings {
  /** Zahlenmodell: Bruch (exakt) gegen Dezimal. Nicht jede Rechenart bietet den Umschalter. */
  readonly fractionMode: boolean
  /** Winkelmodus der Winkelfunktionen. Nur der wissenschaftliche Rechner bietet ihn an. */
  readonly angleMode: 'rad' | 'deg' | 'grad'
  /** Anzeige-Basis des Programmiererrechners. */
  readonly base: 2 | 8 | 10 | 16
  /** Wortbreite in Bit, Zweierkomplement. */
  readonly wordBits: number
  /** Mit Vorzeichen (`intN`) oder ohne (`uintN`). */
  readonly signed: boolean
  /**
   * Anzeige 1 (zweidimensional, gesetzt) gegen Anzeige 2 (roher Term).
   * Vorgabe: **zweidimensional** — die schöne Anzeige ist die erste.
   */
  readonly twoDimensional: boolean
}

export const HISTORY_LIMIT = 200

/**
 * Vorgabe-Einstellungen des Rahmens. Jede Rechenart legt ihre eigenen darüber
 * (`calculatorStore`): der Standardrechner kennt keinen Winkelmodus und keine Basis, der
 * Programmiererrechner kein Zahlenmodell — die Felder bleiben trotzdem im Datensatz, damit
 * **ein** Speicherformat gilt und die Prüfung nicht vier Formate kennen muss.
 */
export const DEFAULT_SETTINGS: CalculatorSettings = {
  fractionMode: false,
  angleMode: 'rad',
  base: 16,
  wordBits: 32,
  signed: true,
  twoDimensional: true
}

/** Die nicht mehr benutzten Schlüssel des gemeinsamen Rechners — benannt, nicht gelöscht. */
export const RETIRED_STORE_KEYS = ['calculator.history', 'calculator.variables', 'calculator.settings'] as const

export interface CalculatorStore {
  readonly namespace: string
  readHistory(): Promise<readonly HistoryEntry[]>
  /** Fügt einen Eintrag vorn an und schneidet den Ringpuffer auf `HISTORY_LIMIT` ab. */
  pushHistory(current: readonly HistoryEntry[], entry: HistoryEntry): Promise<readonly HistoryEntry[]>
  clearHistory(): Promise<readonly HistoryEntry[]>
  readVariables(): Promise<Record<string, string>>
  writeVariables(variables: Record<string, string>): Promise<void>
  readSettings(): Promise<CalculatorSettings>
  writeSettings(settings: CalculatorSettings): Promise<void>
}

/**
 * Speicher eines Werkzeugs. `namespace` ist die Werkzeugkennung — die Schlüssel liegen damit
 * sichtbar getrennt in der Datenbank (`<namespace>.history`, `<namespace>.variables`,
 * `<namespace>.settings`).
 */
export function calculatorStore(namespace: string, defaults: Partial<CalculatorSettings> = {}): CalculatorStore {
  const keys = {
    history: `${namespace}.history`,
    variables: `${namespace}.variables`,
    settings: `${namespace}.settings`
  } as const
  const fallback: CalculatorSettings = { ...DEFAULT_SETTINGS, ...defaults }

  return {
    namespace,
    async readHistory(): Promise<readonly HistoryEntry[]> {
      const stored = await get<HistoryEntry[]>(keys.history)
      return Array.isArray(stored) ? stored : []
    },
    async pushHistory(current: readonly HistoryEntry[], entry: HistoryEntry): Promise<readonly HistoryEntry[]> {
      const next = [entry, ...current].slice(0, HISTORY_LIMIT)
      await set(keys.history, next)
      return next
    },
    async clearHistory(): Promise<readonly HistoryEntry[]> {
      await del(keys.history)
      return []
    },
    async readVariables(): Promise<Record<string, string>> {
      const stored = await get<Record<string, string>>(keys.variables)
      return stored && typeof stored === 'object' ? stored : {}
    },
    async writeVariables(variables: Record<string, string>): Promise<void> {
      await set(keys.variables, variables)
    },
    async readSettings(): Promise<CalculatorSettings> {
      const stored = await get<Partial<CalculatorSettings>>(keys.settings)
      // Zusammenführen statt ersetzen: ein gespeicherter Datensatz aus einer früheren Fassung hat
      // einzelne Felder nicht — dann gilt die Vorgabe. Keine Migration nötig. Ein Feld `mode` aus
      // der Fassung vor der Aufteilung fällt dabei weg: die Rechenart ist keine Einstellung mehr,
      // sondern das Werkzeug selbst.
      return stored ? { ...fallback, ...stored } : fallback
    },
    async writeSettings(settings: CalculatorSettings): Promise<void> {
      await set(keys.settings, settings)
    }
  }
}
