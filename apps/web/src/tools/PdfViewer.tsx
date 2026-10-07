import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf } from '@commietools/tools/pdf/core'
import { Button } from '@commietools/ui'
import { extractPdfText, PdfWarnings, pdfErrorKey, renderPdfPagePreview, usePdfThumbnails, withTimeout, type ExtractedPdfPage, type LoadedPdf, type Translate } from './pdfUi'

export function PdfViewer({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1.25)
  const [rotation, setRotation] = useState(0)
  const [preview, setPreview] = useState('')
  const [texts, setTexts] = useState<ExtractedPdfPage[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [showText, setShowText] = useState(true)
  const [textError, setTextError] = useState('')
  const thumbnails = usePdfThumbnails(file?.bytes ?? null, 110)

  /**
   * **Fokuserhalt beim Blättern und Zoomen** (Karte M7-004: „Zoom-/Seitenwechsel fokuserhaltend").
   * Gemessen: nach dem Seitenwechsel liegt der Fokus auf `body`, weil der gedrückte Knopf beim
   * Neurendern ersetzt wird — ein Tastaturnutzer verlöre damit seine Position. Der auslösende Knopf
   * wird deshalb gemerkt und nach dem Zustandswechsel wieder fokussiert.
   */
  const fokus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const ziel = fokus.current
    fokus.current = null
    if (!ziel) return
    const setze = () => {
      // Auf der letzten Seite wird „Nächste Seite" deaktiviert — ein deaktiviertes Element verliert
      // den Fokus (gemessen). Dann wandert er auf die Gegenrichtung, statt auf `body` zu fallen.
      const nutzbar = ziel.isConnected && !(ziel as HTMLButtonElement).disabled
      if (nutzbar) { if (document.activeElement !== ziel) ziel.focus() }
      else {
        // Die Schaltflächen der Steuerleiste in Reihenfolge prüfen und die erste nutzbare nehmen.
        const ausweich = [...document.querySelectorAll<HTMLButtonElement>('.pdf-viewer-controls button')].find((knopf) => !knopf.disabled)
        ausweich?.focus()
      }
    }
    setze()
    const rahmen = requestAnimationFrame(setze)
    return () => cancelAnimationFrame(rahmen)
  }, [page, zoom, rotation])
  function merkeFokus(event: MouseEvent<HTMLButtonElement>) {
    fokus.current = event.currentTarget
  }

  useEffect(() => {
    if (!file) return
    let cancelled = false
    // Mit Zeitgrenze: Bleibt die Textextraktion stehen, darf die Ansicht nicht „kein Text"
    // behaupten — das wäre eine falsche Aussage über die Datei.
    void withTimeout(extractPdfText(file.bytes))
      .then((value) => { if (!cancelled) { setTexts(value); setTextError('') } })
      .catch((caught: unknown) => { if (!cancelled) setTextError(pdfErrorKey(caught)) })
    return () => { cancelled = true }
  }, [file])

  useEffect(() => {
    if (!file) return
    let cancelled = false
    let objectUrl = ''
    void renderPdfPagePreview(file.bytes, page, zoom, rotation).then((blob) => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(blob)
      setPreview((current) => { if (current) URL.revokeObjectURL(current); return objectUrl })
    }).catch((caught) => !cancelled && setError(pdfErrorKey(caught)))
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [file, page, zoom, rotation])

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (needle.length < 2) return []
    return texts.filter((item) => item.text.toLocaleLowerCase().includes(needle))
  }, [texts, query])

  /** Text der angezeigten Seite — Grundlage der zugänglichen Textansicht (Karte M7-004). */
  const pageText = texts.find((item) => item.pageNumber === page)?.text ?? ''

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return
    setError(''); setTexts([]); setQuery(''); setPage(1); setRotation(0); setZoom(1.25)
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      const inspection = await inspectPdf(bytes)
      setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection })
    } catch (caught) { setFile(null); setError(pdfErrorKey(caught)) }
    event.target.value = ''
  }

  return <section className="settings-card stack pdf-viewer-card">
    <label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-viewer')} onChange={selectFile} /></label>
    <p className="privacy-note">{t('tool.pdf.local')}</p>
    {file && <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} />
      <label className="field"><span>{t('tool.pdfViewer.search')}</span><input type="search" value={query} placeholder={t('tool.pdfViewer.searchPlaceholder')} onChange={(event) => setQuery(event.target.value)} /></label>
      {query.trim().length >= 2 && <div className="viewer-search-results"><strong>{matches.length} {t('tool.pdfViewer.matches')}</strong>{matches.length ? matches.map((match) => <Button key={match.pageNumber} onClick={(event) => { merkeFokus(event); setPage(match.pageNumber) }}>{t('tool.pdf.page')} {match.pageNumber}</Button>) : <span>{t('tool.pdfViewer.noMatches')}</span>}</div>}
      <div className="pdf-viewer-controls"><Button disabled={page <= 1} onClick={(event) => { merkeFokus(event); setPage((value) => value - 1) }} aria-label={t('tool.pdfViewer.previous')}>←</Button><strong>{page} / {file.inspection.pageCount}</strong><Button disabled={page >= file.inspection.pageCount} onClick={(event) => { merkeFokus(event); setPage((value) => value + 1) }} aria-label={t('tool.pdfViewer.next')}>→</Button><Button onClick={(event) => { merkeFokus(event); setZoom((value) => Math.max(.6, value - .2)) }} aria-label={t('tool.pdfViewer.zoomOut')}>−</Button><span>{Math.round(zoom * 100)}%</span><Button onClick={(event) => { merkeFokus(event); setZoom((value) => Math.min(3, value + .2)) }} aria-label={t('tool.pdfViewer.zoomIn')}>+</Button><Button onClick={(event) => { merkeFokus(event); setRotation((value) => (value + 90) % 360) }}>{t('tool.pdfViewer.rotate')} ↻</Button></div>
      <div className="pdf-viewer-layout"><aside className="pdf-viewer-thumbs">{thumbnails.images.map((image, index) => <button className={page === index + 1 ? 'active' : ''} key={image} aria-current={page === index + 1 ? 'page' : undefined} aria-label={`${t('tool.pdf.page')} ${index + 1}`} onClick={(event) => { merkeFokus(event); setPage(index + 1) }}><img src={image} alt="" /><span>{index + 1}</span></button>)}</aside><div className="pdf-viewer-stage">{preview && <img src={preview} alt={`${t('tool.pdf.page')} ${page}`} />}</div></div>
      {/*
        Zugängliche Textansicht (Karte M7-004): Die Rasterdarstellung allein bietet assistiver
        Technik keinen Dokumentinhalt. Der Text liegt bereits vor (Suche) und wird hier als
        eigener Bereich mit Seitenbezug ausgegeben — die Lesereihenfolge folgt dem Inhaltsstrom
        der Datei; die Grenze steht sichtbar im Hinweis.
      */}
      <section className="pdf-text-view" aria-labelledby="pdf-text-view-title">
        <div className="pdf-text-view-head">
          <h2 id="pdf-text-view-title">{t('tool.pdfViewer.textView')}</h2>
          <Button aria-expanded={showText} aria-controls="pdf-text-view-body" onClick={(event) => { merkeFokus(event); setShowText((value) => !value) }}>{t(showText ? 'tool.pdfViewer.hideText' : 'tool.pdfViewer.showText')}</Button>
        </div>
        <p className="scan-note">{t('tool.pdfViewer.textViewHint')}</p>
        {showText && <div id="pdf-text-view-body" className="stack">
          <h3>{t('tool.pdfViewer.textOfPage').replace('{page}', String(page))}</h3>
          {textError ? <p className="error" role="alert">{t(textError)}</p> : pageText ? <p className="pdf-text-content">{pageText}</p> : <p className="scan-note">{t('tool.pdfViewer.textUnavailable')}</p>}
        </div>}
      </section>
    </>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </section>
}
