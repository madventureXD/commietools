/**
 * Zugriff auf den Browserspeicher mit **expliziten Ergebnissen** (Karte M8-003).
 *
 * `localStorage.getItem` kann werfen — nicht erst beim Schreiben: In manchen Privatmodi und bei
 * blockierten Website-Daten wirft schon der **Zugriff** auf `window.localStorage` oder das Lesen
 * einen `SecurityError`. Die Oberfläche rief das direkt im Startpfad auf (`preferredTheme`,
 * `preferredLocale`, Werkzeugschublade); ein Wurf dort brach die ganze Anwendung ab — ein leerer
 * Bildschirm statt eines Werkzeugs.
 *
 * Deshalb gibt es hier kein `null`-oder-Wurf, sondern einen Zustand: `ok`, `unavailable`, `quota`,
 * `invalid`. Die Aufrufer entscheiden damit sichtbar — kein leerer `catch`-Block, der einen
 * verlorenen Wert verschweigt.
 *
 * **Grenze:** Der Adapter ersetzt keine Persistenzgarantie. Er sagt nur ehrlich, ob ein Zugriff
 * gelungen ist; eine Anzeige „gespeichert" darf daran gebunden werden, nicht an den Aufruf allein.
 */

export type StorageOutcome = 'ok' | 'unavailable' | 'quota' | 'invalid'

export interface StorageRead {
  readonly status: StorageOutcome
  /** Nur bei `ok` gesetzt; sonst `null`. */
  readonly value: string | null
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : (window.localStorage ?? null)
  } catch {
    // Schon der Zugriff kann werfen (blockierte Website-Daten).
    return null
  }
}

/** Liest einen Wert. `unavailable` statt eines Wurfs, wenn der Speicher nicht zugänglich ist. */
export function readLocal(key: string): StorageRead {
  const store = storage()
  if (!store) return { status: 'unavailable', value: null }
  try {
    return { status: 'ok', value: store.getItem(key) }
  } catch {
    return { status: 'unavailable', value: null }
  }
}

/** Schreibt einen Wert. `quota` heißt: Der Speicher ist voll, der Wert liegt **nicht** darin. */
export function writeLocal(key: string, value: string): StorageOutcome {
  const store = storage()
  if (!store) return 'unavailable'
  try {
    store.setItem(key, value)
    return 'ok'
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' ? 'quota' : 'unavailable'
  }
}

/**
 * Liest JSON und prüft es. Kaputter Speicherinhalt ist kein Absturzgrund: `invalid` heißt „steht
 * etwas, das wir nicht verstehen" — der Aufrufer nimmt dann seinen Rückfallwert.
 */
export function readLocalJson<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  const read = readLocal(key)
  if (read.status !== 'ok' || read.value === null) return fallback
  try {
    const parsed: unknown = JSON.parse(read.value)
    return validate(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}