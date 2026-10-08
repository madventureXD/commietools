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


declare const __APP_BUILD_ID__: string
export const APP_BUILD_ID = typeof __APP_BUILD_ID__ === 'string' ? __APP_BUILD_ID__ : 'development'
export const USED_ASSET_CACHE = `commietools-used-assets-${APP_BUILD_ID}`

export type OfflineReadiness = { build: string; route: string; locale: string; status: 'unknown' | 'ready' | 'incomplete'; urls: string[] }
export let offlineReadiness: OfflineReadiness = { build: APP_BUILD_ID, route: '', locale: '', status: 'unknown', urls: [] }

/** Explicit cache.put acknowledgement; a fetch response alone does not mean durable storage. */
export async function warmLanguagePackCache(): Promise<string[]> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return []
  const urls = new Set(geladeneRessourcen().filter((entry) => {
    const url = new URL(entry, location.href)
    return url.origin === location.origin && url.pathname.startsWith('/assets/')
  }))
  offlineReadiness = { build: APP_BUILD_ID, route: location.pathname, locale: document.documentElement.lang, status: 'unknown', urls: [] }
  window.dispatchEvent(new CustomEvent('commietools-offline-readiness', { detail: offlineReadiness }))
  try {
    const response = await fetch('/asset-map.json')
    if (!response.ok) return []
    const graph = await response.json() as { buildId: string; assets: Record<string, string[]> }
    if (graph.buildId !== APP_BUILD_ID) return []
    const visit = (address: string): void => {
      for (const dependency of graph.assets[new URL(address).pathname.slice(1)] ?? []) {
        const url = new URL(dependency, location.origin + '/').href
        if (!urls.has(url)) { urls.add(url); visit(url) }
      }
    }
    for (const address of [...urls]) visit(address)
  } catch { return [] }
  const saved: string[] = []
  for (const address of urls) {
    try {
      const cache = await caches.open(USED_ASSET_CACHE)
      const response = await fetch(address, { cache: 'no-cache' })
      if (!response.ok || response.type === 'opaque') continue
      await cache.put(address, response.clone())
      if (await cache.match(address, { ignoreVary: true })) saved.push(address)
    } catch { /* Quota, eviction and network failure confer no readiness. */ }
  }
  offlineReadiness = { ...offlineReadiness, status: saved.length === urls.size && saved.length > 0 ? 'ready' : 'incomplete', urls: saved }
  window.dispatchEvent(new CustomEvent('commietools-offline-readiness', { detail: offlineReadiness }))
  return saved
}

/** Follow later resources and controller changes, including installation beyond the initial load. */
export function observeUsedAssetCache(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  let running = false
  let again = false
  const run = async (): Promise<void> => {
    if (running) { again = true; return }
    running = true
    try { await warmLanguagePackCache() } finally {
      running = false
      if (again) { again = false; schedule() }
    }
  }
  const schedule = (): void => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { void run() }, 250)
  }
  // Re-fetching an address creates a resource entry too. Observe only genuinely new addresses.
  const seen = new Set(geladeneRessourcen())
  const observer = new PerformanceObserver((list) => {
    let changed = false
    for (const entry of list.getEntries()) {
      if (!seen.has(entry.name)) { seen.add(entry.name); changed = true }
    }
    if (changed) schedule()
  })
  observer.observe({ type: 'resource', buffered: true })
  // A previously loaded locale creates no new resource entry on a warm switch.
  // Readiness must still describe the actual current UI language.
  const languageObserver = new MutationObserver(schedule)
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
  navigator.serviceWorker?.addEventListener('controllerchange', schedule)
  document.addEventListener('visibilitychange', schedule)
  window.addEventListener('online', schedule)
  window.addEventListener('offline', schedule)
  window.addEventListener('pageshow', schedule)
  schedule()
  return () => {
    observer.disconnect()
    languageObserver.disconnect()
    navigator.serviceWorker?.removeEventListener('controllerchange', schedule)
    document.removeEventListener('visibilitychange', schedule)
    window.removeEventListener('online', schedule)
    window.removeEventListener('offline', schedule)
    window.removeEventListener('pageshow', schedule)
    if (timer) clearTimeout(timer)
  }
}
