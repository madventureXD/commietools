/**
 * Warmlauf des Laufzeitcaches für Sprachpakete (Karte M8-002).
 *
 * **Der Befund (gemessen am ausgelieferten Build, 2026-10-06):** Titel-, Such- und Werkzeugtexte
 * werden beim Öffnen über `import()` geholt. Beim **ersten** Besuch geschieht das, bevor der
 * Service Worker die Seite kontrolliert — diese Anfragen laufen am Worker vorbei. Die
 * Laufzeitregel (`runtimeCaching`, `commietools-language-packs-v1`) greift deshalb nicht, und die
 * Pakete liegen nur im flüchtigen HTTP-Cache. Nach einer Löschung des HTTP-Caches ist der erste
 * Besuch **offline nicht bedienbar**: Der Worker liefert 7 von 7 Antworten aus dem Precache, aber
 * `/assets/ui-en-*.js` fehlt — die Seite bleibt leer.
 *
 * **Die Maßnahme:** Sobald der Worker die Seite kontrolliert, werden genau die Sprachpakete, die
 * dieser Start ohnehin geholt hat (aktive Sprache plus Englisch als Rückfall, dazu die Texte der
 * geöffneten Werkzeugroute), **noch einmal** angefordert. Diese Anfragen laufen durch den Worker
 * und wandern damit in den Laufzeitcache. Danach wird das Vorhandensein im Cache **geprüft** —
 * eine Bestätigung, keine Annahme.
 *
 * Nur die Adressen dieses Starts werden warm gehalten: kein Vorabladen fremder Sprachen oder
 * nicht geöffneter Werkzeuge (Datensparsamkeit, ADR 0003).
 */

/** Muster der Laufzeitregel in `vite.config.ts` — muss dazu passen. */
export const LANGUAGE_PACK_PATTERN = /\/(?:search|tools|ui)-[a-z]{2,3}(?:-[A-Z]{2})?-[A-Za-z0-9_-]+\.js$/u

/** Name des Caches, den die Laufzeitregel benutzt. */
export const LANGUAGE_PACK_CACHE = 'commietools-language-packs-v1'

/**
 * Die Sprachpakete aus den geladenen Ressourcen herausfiltern. Doppelte Adressen fallen weg.
 * Bewusst über die **tatsächlich geholten** Adressen: So wird nur warm gehalten, was dieser Start
 * wirklich braucht, und es gibt keine Liste, die mit dem Bauwerkzeugkasten auseinanderläuft.
 */
export function languagePackUrls(entries: readonly string[]): string[] {
  const gefunden = new Set<string>()
  for (const eintrag of entries) {
    if (LANGUAGE_PACK_PATTERN.test(eintrag)) gefunden.add(eintrag)
  }
  return [...gefunden]
}

/** Die gerade geladenen Ressourcen der Seite (leer, wo die Schnittstelle fehlt). */
function geladeneRessourcen(): string[] {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') return []
  return performance.getEntriesByType('resource').map((eintrag) => eintrag.name)
}

/** Wartet, bis der Service Worker die Seite kontrolliert — höchstens `timeoutMs`. */
async function aufKontrolleWarten(timeoutMs = 8000): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false
  if (navigator.serviceWorker.controller) return true
  return new Promise((fertig) => {
    const frist = setTimeout(() => fertig(false), timeoutMs)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      clearTimeout(frist)
      fertig(Boolean(navigator.serviceWorker.controller))
    }, { once: true })
  })
}

/**
 * Fordert die Sprachpakete dieses Starts erneut an und prüft, ob sie im Laufzeitcache liegen.
 * Gibt die Namen der warm gehaltenen Pakete zurück (leer, wenn der Worker nicht kontrolliert).
 *
 * Fehler werden geschluckt: Der Warmlauf ist eine Verbesserung der Offline-Bereitschaft, kein
 * Grund, den Start scheitern zu lassen.
 */
export async function warmLanguagePackCache(): Promise<string[]> {
  if (!(await aufKontrolleWarten())) return []
  const adressen = languagePackUrls(geladeneRessourcen())
  if (!adressen.length) return []
  try {
    await Promise.all(adressen.map((adresse) => fetch(adresse, { cache: 'no-cache' }).then((antwort) => {
      if (!antwort.ok) throw new Error(`${adresse}: ${antwort.status}`)
    })))
    // Vorhandensein prüfen, nicht annehmen.
    const cache = await caches.open(LANGUAGE_PACK_CACHE)
    const drin = await Promise.all(adressen.map(async (adresse) => ((await cache.match(adresse)) ? adresse : null)))
    return drin.filter((eintrag): eintrag is string => eintrag !== null)
  } catch {
    return []
  }
}
