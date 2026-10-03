import { useEffect, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf, organizePdf, type PdfPagePlan } from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, baseName, pdfErrorKey, useDownload, usePdfThumbnails, type LoadedPdf, type Translate } from './pdfUi'

interface PageItem extends PdfPagePlan { readonly id: string }

export function PdfOrganize({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<Uint8Array | null>(null)
  const thumbnails = usePdfThumbnails(file?.bytes ?? null)
  const downloadUrl = useDownload(result)

  useEffect(() => setResult(null), [pages])

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    setError('')
    setResult(null)
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      const inspection = await inspectPdf(bytes)
      setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection })
      setPages(Array.from({ length: inspection.pageCount }, (_, sourceIndex) => ({ id: crypto.randomUUID(), sourceIndex, rotation: 0 })))
    } catch (caught) {
      setFile(null)
      setPages([])
      setError(pdfErrorKey(caught))
    }
    event.target.value = ''
  }

  function update(id: string, transform: (page: PageItem) => PageItem) {
    setPages((current) => current.map((page) => page.id === id ? transform(page) : page))
  }

  function move(index: number, offset: number) {
    const destination = index + offset
    if (destination < 0 || destination >= pages.length) return
    setPages((current) => {
      const next = [...current]
      const source = next[index]
      const target = next[destination]
      if (!source || !target) return current
      ;[next[index], next[destination]] = [target, source]
      return next
    })
  }

  async function process() {
    if (!file) return
    if (!pages.length) return setError('tool.pdfOrganize.empty')
    setProcessing(true)
    setError('')
    try { setResult(await organizePdf(file.bytes, pages)) } catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }

  return <div className="stack"><section className="settings-card stack">
    <h2>{t('tool.pdf.files')}</h2><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-organize')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>
    {file && <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} />
      <div className="pdf-organizer" aria-label={t('tool.pdf.preview')}>{pages.map((page, index) => <article className="pdf-organizer-card" key={page.id}>
        {thumbnails.images[page.sourceIndex] ? <img src={thumbnails.images[page.sourceIndex]} alt={t('tool.pdfOrganize.original').replace('{number}', String(page.sourceIndex + 1))} style={{ transform: `rotate(${page.rotation}deg)` }} /> : <span className="pdf-preview-placeholder">PDF</span>}
        <strong>{index + 1}</strong><span>{t('tool.pdfOrganize.original').replace('{number}', String(page.sourceIndex + 1))}</span>
        <div className="pdf-page-actions"><Button disabled={index === 0} onClick={() => move(index, -1)} aria-label={t('tool.pdf.moveUp')}>←</Button><Button disabled={index === pages.length - 1} onClick={() => move(index, 1)} aria-label={t('tool.pdf.moveDown')}>→</Button><Button onClick={() => update(page.id, (item) => ({ ...item, rotation: item.rotation - 90 }))}>{t('tool.pdf.left')}</Button><Button onClick={() => update(page.id, (item) => ({ ...item, rotation: item.rotation + 90 }))}>{t('tool.pdf.right')}</Button><Button onClick={() => setPages((current) => current.flatMap((item) => item.id === page.id ? [item, { ...item, id: crypto.randomUUID() }] : [item]))}>{t('tool.pdf.duplicate')}</Button><Button disabled={pages.length === 1} onClick={() => setPages((current) => current.filter((item) => item.id !== page.id))}>{t('tool.pdf.remove')}</Button></div>
      </article>)}</div><Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfOrganize.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </section>
  {result && downloadUrl && <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{t('tool.pdfOrganize.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><a className="button primary" href={downloadUrl} download={`${baseName(file?.name ?? 'document')}-organized.pdf`}>{t('tool.pdf.download')}</a></section>}
  </div>
}

