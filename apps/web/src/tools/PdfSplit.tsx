import { useRef, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf, parseSplitGroups, splitPdf } from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, baseName, pdfErrorKey, usePdfThumbnails, type LoadedPdf, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

type Mode = 'every' | 'groups'

export function PdfSplit({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [mode, setMode] = useState<Mode>('every')
  const [selection, setSelection] = useState('1-3; 4-6')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{ url: string; pages: number[]; name: string }[]>([])
  /**
   * Auftragsgeneration (Karte M4-005): Jeder Auftrag merkt sich seine Nummer und den
   * **Eingabestand**, mit dem er läuft. Dateiwechsel und neuer Auftrag erhöhen die Nummer — ein
   * spätes Ergebnis eines alten Auftrags wird damit verworfen, statt Liste, Fehler, Fortschritt
   * oder Dateinamen des neuen zu überschreiben. Der Dateiname kommt aus dem Auftrag und nicht aus
   * dem Formular, das sich während der Verarbeitung ändern kann.
   */
  const generationRef = useRef(0)
  const thumbnails = usePdfThumbnails(file?.bytes ?? null)

  function clearResults() {
    results.forEach((result) => URL.revokeObjectURL(result.url))
    setResults([])
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    // Ein laufender Auftrag gehört zur alten Datei: ungültig machen, bevor der Zustand wechselt.
    generationRef.current += 1
    clearResults()
    setError('')
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection: await inspectPdf(bytes) })
    } catch (caught) {
      setFile(null)
      setError(pdfErrorKey(caught))
    }
    event.target.value = ''
  }

  async function process() {
    if (!file) return
    const generation = (generationRef.current += 1)
    // Unveränderlicher Eingabestand des Auftrags.
    const snapshot = { name: file.name, bytes: file.bytes, pageCount: file.inspection.pageCount, mode, selection }
    setProcessing(true)
    setError('')
    clearResults()
    try {
      const groups = snapshot.mode === 'every' ? Array.from({ length: snapshot.pageCount }, (_, index) => [index]) : parseSplitGroups(snapshot.selection, snapshot.pageCount)
      const outputs = await splitPdf(snapshot.bytes, groups)
      const erzeugt = outputs.map((bytes, index) => ({
        url: URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })),
        pages: (groups[index] ?? []).map((page) => page + 1),
        name: snapshot.name
      }))
      if (generation !== generationRef.current) {
        // Verspätetes Ergebnis eines alten Auftrags: verwerfen und die URLs sofort freigeben.
        erzeugt.forEach((result) => URL.revokeObjectURL(result.url))
        return
      }
      setResults(erzeugt)
    } catch (caught) {
      if (generation === generationRef.current) setError(pdfErrorKey(caught))
    } finally {
      // Nur der aktuelle Auftrag darf den Fortschritt beenden — sonst stünde der neue Auftrag
      // ohne Fortschritt da, während er noch läuft.
      if (generation === generationRef.current) setProcessing(false)
    }
  }

  return <div className="stack"><section className="settings-card stack">
    <h2>{t('tool.pdf.files')}</h2><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-split')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>
    {file && <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} />
      <div className="pdf-thumbnail-grid">{thumbnails.images.map((image, index) => <figure className="pdf-page-card" key={index}><img src={image} alt={`${t('tool.pdf.page')} ${index + 1}`} /><figcaption>{index + 1}</figcaption></figure>)}</div>
      <h2>{t('tool.pdfSplit.mode')}</h2><div className="segmented"><Button className={mode === 'every' ? 'active' : ''} onClick={() => setMode('every')}>{t('tool.pdfSplit.every')}</Button><Button className={mode === 'groups' ? 'active' : ''} onClick={() => setMode('groups')}>{t('tool.pdfSplit.groups')}</Button></div>
      {mode === 'groups' && <label className="field"><span>{t('tool.pdfSplit.selection')}</span><input value={selection} onChange={(event) => setSelection(event.target.value)} /><small>{t('tool.pdfSplit.hint')}</small></label>}
      <Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfSplit.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </section>
  {results.length > 0 && <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{t('tool.pdfSplit.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><div className="pdf-result-list">{results.map((result, index) => <div className="settings-card stack" key={result.url}><strong>{t('tool.pdfSplit.download').replace('{number}', String(index + 1))} ({result.pages.join(', ')})</strong><SaveFileControl url={result.url} suggestedName={`${baseName(result.name)}-pages-${result.pages.join('-')}.pdf`} mimeType="application/pdf" t={t} /></div>)}</div></section>}
  </div>
}

