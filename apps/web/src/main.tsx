import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@commietools/ui/tokens.css'
import './styles.css'
import { App } from './App'
import { warmLanguagePackCache } from './pwaWarmCache'

registerSW({ immediate: true })

/**
 * Warmlauf des Laufzeitcaches (Karte M8-002). Beim **ersten** Besuch werden die Sprachpakete
 * geholt, bevor der Service Worker die Seite kontrolliert — sie laufen am Worker vorbei und liegen
 * danach nur im flüchtigen HTTP-Cache. Nach einer Löschung des HTTP-Caches bleibt die Seite offline
 * leer. Der Warmlauf holt genau die Pakete dieses Starts nach der Kontrolle erneut, damit die
 * Laufzeitregel sie in den CacheStorage legt.
 *
 * Der Aufruf wartet auf das Ende des Seitenladens (vorher sind die Pakete noch nicht angefordert)
 * und wiederholt sich einmal, falls im ersten Anlauf noch keines gefunden wurde. Fehler bleiben
 * folgenlos — dies ist eine Verbesserung der Offline-Bereitschaft, kein Startkriterium.
 */
function starteWarmlauf(): void {
  const versuch = (rest: number): void => {
    void warmLanguagePackCache().then((warm) => {
      if (!warm.length && rest > 0) setTimeout(() => versuch(rest - 1), 1500)
    })
  }
  versuch(2)
}

if (document.readyState === 'complete') starteWarmlauf()
else window.addEventListener('load', starteWarmlauf, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

