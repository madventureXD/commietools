/**
 * Zwischenspeicher für nachgeladene Module (Karte M4-004).
 *
 * Der bisherige Aufbau in den erzeugten Ladedateien (und im Sprachpaket) war überall derselbe und
 * hatte überall denselben Fehler:
 *
 * ```ts
 * const cached = cache.get(key); if (cached) return cached
 * const promise = import(…)
 * cache.set(key, promise); return promise
 * ```
 *
 * Ein **abgelehnter** Import bleibt damit für immer im Zwischenspeicher liegen. Der nächste
 * Versuch findet die Ablehnung, gibt sie sofort wieder zurück und lädt **nie** neu — ein
 * Netzaussetzer beim ersten Aufruf macht die Sprache oder das Werkzeug dauerhaft unbrauchbar, und
 * kein Wiederholen hilft. Genau das hält die Karte fest: „Sprachladefehler bleiben gecacht".
 *
 * `cachedLoader` entfernt die Ablehnung deshalb wieder — aber **nur genau dieses** Promise und
 * **nur, solange es noch das aktuelle ist**. Die zweite Bedingung ist nicht Kosmetik: Treffen zwei
 * Anfragen (Sprache A langsam, B schnell) aufeinander, darf der späte Fehlschlag von A den bereits
 * gelungenen Eintrag von B nicht löschen.
 */
export function cachedLoader<K, V>(cache: Map<K, Promise<V>>, key: K, load: () => Promise<V>): Promise<V> {
  const cached = cache.get(key)
  if (cached) return cached
  const promise = load()
  cache.set(key, promise)
  promise.catch(() => {
    if (cache.get(key) === promise) cache.delete(key)
  })
  return promise
}
