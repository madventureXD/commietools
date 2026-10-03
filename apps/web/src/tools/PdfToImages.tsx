import { useEffect, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf, parsePageSelection } from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, pdfErrorKey, renderPdfPages, usePdfThumbnails, type LoadedPdf, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

interface ImageResult { pageNumber: number; url: string; width: number; height: number }

export function PdfToImages({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [selection, setSelection] = useState('1')
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [dpi, setDpi] = useState(150)
  const [quality, setQuality] = useState(0.9)
  const [background, setBackground] = useState('#ffffff')
  const [results, setResults] = useState<ImageResult[]>([])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const thumbnails = usePdfThumbnails(file?.bytes ?? null)

  useEffect(() => () => results.forEach((result) => URL.revokeObjectURL(result.url)), [results])
  function clearResults() { results.forEach((result) => URL.revokeObjectURL(result.url)); setResults([]) }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return
    clearResults(); setError('')
    try { const bytes = new Uint8Array(await selected.arrayBuffer()); const inspection = await inspectPdf(bytes); setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection }); setSelection(`1-${inspection.pageCount}`) }
    catch (caught) { setFile(null); setError(pdfErrorKey(caught)) }
    event.target.value = ''
  }

  async function process() {
    if (!file) return
    setProcessing(true); setError(''); clearResults()
    try { const pages = parsePageSelection(selection, file.inspection.pageCount); const rendered = await renderPdfPages(file.bytes, pages, { dpi, format, quality, background }); setResults(rendered.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }))) }
    catch (caught) { setError(pdfErrorKey(caught)) }
    finally { setProcessing(false) }
  }

  return <div className="stack"><section className="settings-card stack"><h2>{t('tool.pdf.files')}</h2><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-to-images')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>
    {file && <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} /><div className="pdf-thumbnail-grid">{thumbnails.images.map((image, index) => <figure className="pdf-page-card" key={index}><img src={image} alt={`${t('tool.pdf.page')} ${index + 1}`} /><figcaption>{index + 1}</figcaption></figure>)}</div>
      <h2>{t('tool.pdfToImages.settings')}</h2><div className="form-grid"><label className="field"><span>{t('tool.pdfToImages.selection')}</span><input value={selection} onChange={(event) => setSelection(event.target.value)} /><small>{t('tool.pdfToImages.selectionHint')}</small></label><label className="field"><span>{t('tool.pdfToImages.format')}</span><select value={format} onChange={(event) => setFormat(event.target.value as 'png' | 'jpeg')}><option value="png">PNG</option><option value="jpeg">JPEG</option></select></label><label className="field"><span>{t('tool.pdfToImages.resolution')}</span><select value={dpi} onChange={(event) => setDpi(Number(event.target.value))}>{[72, 96, 150, 300].map((value) => <option key={value} value={value}>{value} DPI</option>)}</select></label>{format === 'jpeg' && <label className="field"><span>{t('tool.pdfToImages.quality')} ({Math.round(quality * 100)}%)</span><input type="range" min="0.5" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>}<label className="field"><span>{t('tool.pdfToImages.background')}</span><input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label></div>{dpi >= 300 && <p className="warning">{t('tool.pdfToImages.large')}</p>}<Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfToImages.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}</section>
    {results.length > 0 && <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{t('tool.pdfToImages.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><div className="pdf-image-results">{results.map((result) => <figure className="pdf-page-card" key={result.url}><img src={result.url} alt={`${t('tool.pdf.page')} ${result.pageNumber}`} /><figcaption>{result.width} × {result.height}</figcaption><SaveFileControl url={result.url} suggestedName={`page-${result.pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`} mimeType={format === 'jpeg' ? 'image/jpeg' : 'image/png'} t={t} /></figure>)}</div></section>}
  </div>
}
