import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf } from '@commietools/tools/pdf/core'
import { Button } from '@commietools/ui'
import { extractPdfText, PdfWarnings, pdfErrorKey, renderPdfPagePreview, usePdfThumbnails, type ExtractedPdfPage, type LoadedPdf, type Translate } from './pdfUi'

export function PdfViewer({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1.25)
  const [rotation, setRotation] = useState(0)
  const [preview, setPreview] = useState('')
  const [texts, setTexts] = useState<ExtractedPdfPage[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const thumbnails = usePdfThumbnails(file?.bytes ?? null, 110)

  useEffect(() => {
    if (!file) return
    let cancelled = false
    void extractPdfText(file.bytes).then((value) => { if (!cancelled) setTexts(value) }).catch(() => {})
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
      {query.trim().length >= 2 && <div className="viewer-search-results"><strong>{matches.length} {t('tool.pdfViewer.matches')}</strong>{matches.length ? matches.map((match) => <Button key={match.pageNumber} onClick={() => setPage(match.pageNumber)}>{t('tool.pdf.page')} {match.pageNumber}</Button>) : <span>{t('tool.pdfViewer.noMatches')}</span>}</div>}
      <div className="pdf-viewer-controls"><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} aria-label={t('tool.pdfViewer.previous')}>←</Button><strong>{page} / {file.inspection.pageCount}</strong><Button disabled={page >= file.inspection.pageCount} onClick={() => setPage((value) => value + 1)} aria-label={t('tool.pdfViewer.next')}>→</Button><Button onClick={() => setZoom((value) => Math.max(.6, value - .2))} aria-label={t('tool.pdfViewer.zoomOut')}>−</Button><span>{Math.round(zoom * 100)}%</span><Button onClick={() => setZoom((value) => Math.min(3, value + .2))} aria-label={t('tool.pdfViewer.zoomIn')}>+</Button><Button onClick={() => setRotation((value) => (value + 90) % 360)}>{t('tool.pdfViewer.rotate')} ↻</Button></div>
      <div className="pdf-viewer-layout"><aside className="pdf-viewer-thumbs">{thumbnails.images.map((image, index) => <button className={page === index + 1 ? 'active' : ''} key={image} onClick={() => setPage(index + 1)}><img src={image} alt={`${t('tool.pdf.page')} ${index + 1}`} /><span>{index + 1}</span></button>)}</aside><div className="pdf-viewer-stage">{preview && <img src={preview} alt={`${t('tool.pdf.page')} ${page}`} />}</div></div>
      {!texts.find((item) => item.pageNumber === page)?.text && <p className="scan-note">{t('tool.pdfViewer.textUnavailable')}</p>}
    </>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </section>
}
