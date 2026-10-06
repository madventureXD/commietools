/**
 * **IndexedDB-Zugriffe mit expliziten Ergebnissen (Karte M8-003).**
 *
 * Der Verlauf des Rechners, das Aufmaß und die Prüffristen liegen in IndexedDB (`idb-keyval`).
 * Bis 2026-10-07 liefen diese Zugriffe **ungeschützt**: `await get(...)` einer gesperrten
 * Datenbank oder einer vollen Platte wirft, und der Wurf wanderte ungebremst in die Oberfläche.
 * Beim Rechner war die Folge am härtesten: Sein Ladeeffekt holte die Rechen-Engine und die
 * gespeicherten Einstellungen in **einem** `Promise.all` — scheiterte der Speicher, wurde auch
 * die Engine nie gesetzt und das Werkzeug war **unbenutzbar**, obwohl der Speicher mit dem
 * Rechnen nichts zu tun hat.
 *
 * Deshalb hier dasselbe Muster wie für `localStorage` in `@commietools/core/storage`: kein Wurf,
 * sondern ein Zustand — `ok`, `unavailable`, `quota`, `invalid`. Der Aufrufer entscheidet sichtbar:
 * ein Speicherfehler schaltet den **flüchtigen Sitzungsbetrieb** ein (mit wahrer Warnung), ein
 * Enginefehler bleibt ein Enginefehler. Beides wird nicht vermischt.
 *
 * **`invalid` heißt: es steht etwas da, das wir nicht verstehen.** Dann gilt der Rückfallwert, und
 * der Aufrufer kann es sagen — aber es ist **kein** Syntaxfehler des Nutzers und darf auch nicht
 * so gemeldet werden.
 */
import { del, get, set } from 'idb-keyval'
import type { StorageOutcome } from '@commietools/core/storage'

export interface StoredResult<T> {
  readonly status: StorageOutcome
  /** Bei `ok` der gespeicherte Wert, sonst der Rückfallwert des Aufrufers. Nie `undefined`. */
  readonly value: T
}

/**
 * Ordnet einen Fehler einem Zustand zu. Die Unterscheidung ist wichtig: `quota` heißt „voll",
 * `unavailable` heißt „nicht erreichbar" (gesperrte Website-Daten, fehlende Datenbank, andere
 * Browser ohne IndexedDB). Beide führen zur flüchtigen Sitzung, aber die Meldung darf den Grund
 * nicht erfinden.
 */
export function classifyStorageError(fehler: unknown): StorageOutcome {
  const name = fehler instanceof Error ? fehler.name : ''
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' ? 'quota' : 'unavailable'
}

export interface IndexedStore {
  read<T>(key: string, fallback: T, validate: (value: unknown) => value is T): Promise<StoredResult<T>>
  write(key: string, value: unknown): Promise<StorageOutcome>
  remove(key: string): Promise<StorageOutcome>
}

export function createIndexedStore(): IndexedStore {
  return {
    async read<T>(key: string, fallback: T, validate: (value: unknown) => value is T): Promise<StoredResult<T>> {
      try {
        const stored = await get<unknown>(key)
        if (stored === undefined || stored === null) return { status: 'ok', value: fallback }
        if (!validate(stored)) return { status: 'invalid', value: fallback }
        return { status: 'ok', value: stored }
      } catch (fehler) {
        return { status: classifyStorageError(fehler), value: fallback }
      }
    },
    async write(key: string, value: unknown): Promise<StorageOutcome> {
      try {
        await set(key, value)
        return 'ok'
      } catch (fehler) {
        return classifyStorageError(fehler)
      }
    },
    async remove(key: string): Promise<StorageOutcome> {
      try {
        await del(key)
        return 'ok'
      } catch (fehler) {
        return classifyStorageError(fehler)
      }
    }
  }
}
