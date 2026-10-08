import { Component, type ReactNode } from 'react'
import { readLocal, writeLocal } from '@commietools/core/storage'
import { Button } from '@commietools/ui'
import { darfNeuLaden, istVeralteteFassung, NEULADEN_SCHLUESSEL } from './tool-load-recovery'
import { APP_BUILD_ID } from './pwaWarmCache'

type Translate = (key: string) => string

/**
 * **Fehlergrenze für die Werkzeugoberfläche (Karte M4-004).**
 *
 * Die Werkzeuge werden über `lazy()` nachgeladen. Scheitert dieser Import — abgebrochenes Netz
 * oder ein Chunk, den es in der neuen Fassung nicht mehr gibt — wirft React beim Rendern. Ohne
 * Fehlergrenze reißt das die ganze Seite ab, und der Nutzer sieht einen **leeren Bildschirm ohne
 * Erklärung**: kein Ende des Ladens, keine Ursache, keine Möglichkeit, es erneut zu versuchen.
 *
 * Zwei getrennte Wege, weil die Ursachen verschieden sind:
 *
 * - **Veralteter Deployment-Chunk:** Ein Neuladen holt die aktuelle Fassung. Der Knopf ist
 *   **einmal** verfügbar; der Merker im Gerätespeicher verhindert eine Neuladeschleife.
 * - **Auswertungsfehler:** Der Chunk ist geladen und wirft. Hier wird gesagt, dass ein Neuladen
 *   nicht hilft — eine Wiederholung anzubieten, die nichts bewirkt, wäre eine Behauptung.
 *
 * **Eigener Zusage-Zwischenspeicher von `lazy()`:** Ein abgelehnter Import bleibt in Reacts
 * `lazy`-Zusage hängen. Ein zweiter Renderversuch derselben Komponente wirft sofort wieder —
 * ein erneutes Rendern ist deshalb **kein** erneuter Ladeversuch. Aus dem Grund steht hier kein
 * „Erneut versuchen", das nur den Fehler wiederholt; die Grenze legt beim Verlassen der Route
 * eine neue Instanz an (die Seite wechselt beim Zurückgehen), und für den Chunk-Fall ist das
 * Neuladen der richtige Weg.
 *
 * **Grenze, ausdrücklich:** Ein Neuladen verwirft nicht gespeicherte Eingaben im Werkzeug. Der
 * Hinweis steht deshalb sichtbar neben dem Knopf; Daten in Gerätespeicher und IndexedDB bleiben
 * erhalten (sie werden nicht gelöscht). Beides wird nicht automatisch ausgelöst — es ist immer
 * eine Entscheidung des Nutzers.
 */
export class ToolErrorBoundary extends Component<{ t: Translate; children: ReactNode }, { nachricht: string | null; buildChanged: boolean }> {
  override state = { nachricht: null as string | null, buildChanged: false }
  private mounted = true

  override componentWillUnmount(): void { this.mounted = false }
  override componentDidMount(): void { this.mounted = true }
  override componentDidCatch(): void {
    void fetch('/build.json', { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) return
      const remote = await response.json() as { buildId?: string }
      if (this.mounted && remote.buildId && remote.buildId !== APP_BUILD_ID) this.setState({ buildChanged: true })
    }).catch(() => { /* Offline and unknown causes retain the neutral message. */ })
  }

  static getDerivedStateFromError(fehler: unknown): { nachricht: string } {
    return { nachricht: fehler instanceof Error ? fehler.message : String(fehler) }
  }

  override render(): ReactNode {
    const nachricht = this.state.nachricht
    if (nachricht === null) return this.props.children
    return <LoadFailureNotice t={this.props.t} messageKey={istVeralteteFassung(nachricht, this.state.buildChanged) ? 'tool.chunkStale' : 'tool.chunkFailed'} />
  }
}

/**
 * **Der sichtbare Fehlerweg eines Nachladefehlers** — für die Werkzeugtexte und für die
 * Fehlergrenze dieselbe Darstellung, damit beide Wege nicht auseinanderlaufen.
 *
 * **Warum hier kein „Erneut versuchen" steht (gemessen 2026-10-07):** Ein gescheiterter
 * dynamischer Modulimport lässt sich im **selben Dokument nicht wiederholen**. Der Browser merkt
 * sich die gescheiterte Adresse im Modulspeicher; jeder weitere `import()` derselben Adresse
 * scheitert sofort, **ohne** eine neue Netzanfrage. Nachgewiesen mit einem Minimalversuch
 * (`work/modulimport-probe.cjs`): drei Versuche, dazwischen die Sperre aufgehoben — genau **eine**
 * Netzanfrage, dreimal dieselbe Fehlermeldung. Ein Knopf „Erneut versuchen" wäre damit eine
 * Wiederholung, die nichts bewirken kann; die Karte verbietet zudem ausdrücklich ein beliebiges
 * `?timestamp`-Anhängen an Importe, mit dem man die Adresse austricksen könnte. Ehrlich bleibt das
 * kontrollierte **Neuladen** — es holt ein neues Dokument mit leerem Modulspeicher —, und es wird
 * genau **einmal** angeboten (Merker im Gerätespeicher, siehe `darfNeuLaden`).
 */
export function LoadFailureNotice({ t, messageKey }: { t: Translate; messageKey: string }): ReactNode {
  const erlaubt = darfNeuLaden(readLocal(NEULADEN_SCHLUESSEL).value, Date.now())
  const neuLaden = (): void => {
    writeLocal(NEULADEN_SCHLUESSEL, String(Date.now()))
    location.reload()
  }
  return (
    <div className="settings-card stack" role="alert">
      <p className="error">{t(messageKey)}</p>
      <p className="scan-note">{t('tool.reloadLosesInput')}</p>
      {erlaubt
        ? <Button className="primary" onClick={neuLaden}>{t('action.reload')}</Button>
        : <p className="scan-note">{t('tool.reloadAgain')}</p>}
    </div>
  )
}
