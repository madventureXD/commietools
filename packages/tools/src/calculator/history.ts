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
import { createIndexedStore, type StoredResult } from '../storage/indexedStore'
import type { StorageOutcome } from '@commietools/core/storage'

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
  /**
   * **Alle Zugriffe melden ihren Zustand (Karte M8-003)** — kein Wurf mehr. `status !== 'ok'`
   * heißt: Der Wert stammt aus dem Rückfall und liegt **nicht** gespeichert vor; die Oberfläche
   * schaltet dann in den flüchtigen Sitzungsbetrieb und sagt es.
   */
  readHistory(): Promise<StoredResult<readonly HistoryEntry[]>>
  /** Fügt einen Eintrag vorn an und schneidet den Ringpuffer auf `HISTORY_LIMIT` ab. */
  pushHistory(current: readonly HistoryEntry[], entry: HistoryEntry): Promise<StoredResult<readonly HistoryEntry[]>>
  clearHistory(): Promise<StoredResult<readonly HistoryEntry[]>>
  readVariables(): Promise<StoredResult<Record<string, string>>>
  writeVariables(variables: Record<string, string>): Promise<StorageOutcome>
  readSettings(): Promise<StoredResult<CalculatorSettings>>
  writeSettings(settings: CalculatorSettings): Promise<StorageOutcome>
}

const istEintragsliste = (value: unknown): value is HistoryEntry[] => Array.isArray(value)
const istVariablen = (value: unknown): value is Record<string, string> => typeof value === 'object' && value !== null && !Array.isArray(value)
const istEinstellungen = (value: unknown): value is Partial<CalculatorSettings> => typeof value === 'object' && value !== null && !Array.isArray(value)

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
  const speicher = createIndexedStore()

  return {
    namespace,
    async readHistory(): Promise<StoredResult<readonly HistoryEntry[]>> {
      return speicher.read(keys.history, [] as readonly HistoryEntry[], istEintragsliste)
    },
    async pushHistory(current: readonly HistoryEntry[], entry: HistoryEntry): Promise<StoredResult<readonly HistoryEntry[]>> {
      const next = [entry, ...current].slice(0, HISTORY_LIMIT)
      const status = await speicher.write(keys.history, next)
      // **Kein „gespeichert"-Erfolg bei flüchtiger Ablage:** Der neue Verlauf gilt in der Sitzung,
      // aber der Zustand sagt, ob er auch liegt. Bei einem Fehlschlag wird `next` trotzdem
      // angezeigt — verlorene Eingaben zu verschweigen wäre schlimmer als sie flüchtig zu halten.
      return { status, value: next }
    },
    async clearHistory(): Promise<StoredResult<readonly HistoryEntry[]>> {
      const status = await speicher.remove(keys.history)
      return { status, value: [] }
    },
    async readVariables(): Promise<StoredResult<Record<string, string>>> {
      return speicher.read<Record<string, string>>(keys.variables, {}, istVariablen)
    },
    async writeVariables(variables: Record<string, string>): Promise<StorageOutcome> {
      return speicher.write(keys.variables, variables)
    },
    async readSettings(): Promise<StoredResult<CalculatorSettings>> {
      const stored = await speicher.read<Partial<CalculatorSettings>>(keys.settings, {}, istEinstellungen)
      // Zusammenführen statt ersetzen: ein gespeicherter Datensatz aus einer früheren Fassung hat
      // einzelne Felder nicht — dann gilt die Vorgabe. Keine Migration nötig. Ein Feld `mode` aus
      // der Fassung vor der Aufteilung fällt dabei weg: die Rechenart ist keine Einstellung mehr,
      // sondern das Werkzeug selbst. Der Zustand wird **durchgereicht**, auch wenn der Wert
      // zusammengesetzt wurde: er beschreibt den Zugriff, nicht die Form des Ergebnisses.
      return { status: stored.status, value: { ...fallback, ...stored.value } }
    },
    async writeSettings(settings: CalculatorSettings): Promise<StorageOutcome> {
      return speicher.write(keys.settings, settings)
    }
  }
}
