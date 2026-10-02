import { useState, type ChangeEvent } from 'react'
import { acceptAttributeFor, inspectPdf, mergePdfs } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, baseName, pdfErrorKey, useDownload, usePdfThumbnails, type LoadedPdf, type Translate } from './pdfUi'

function Preview({ file }: { file: LoadedPdf }) {
  const { images } = usePdfThumbnails(file.bytes, 100)
  return images[0] ? <img className="pdf-file-preview" src={images[0]} alt="" /> : <span className="pdf-preview-placeholder">PDF</span>
}

export function PdfMerge({ t }: { t: Translate }) {
  const [files, setFiles] = useState<LoadedPdf[]>([])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<Uint8Array | null>(null)
  const downloadUrl = useDownload(result)

  async function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = [...(event.target.files ?? [])]
    setError('')
    try {
      const loaded = await Promise.all(selected.map(async (file) => {
        const bytes = new Uint8Array(await file.arrayBuffer())
        return { id: crypto.randomUUID(), name: file.name, bytes, inspection: await inspectPdf(bytes) }
      }))
      setFiles((current) => [...current, ...loaded])
      setResult(null)
    } catch (caught) {
      setError(pdfErrorKey(caught))
    }
    event.target.value = ''
  }

  function move(index: number, offset: number) {
    const destination = index + offset
    if (destination < 0 || destination >= files.length) return
    setFiles((current) => {
      const next = [...current]
      const source = next[index]
      const target = next[destination]
      if (!source || !target) return current
      ;[next[index], next[destination]] = [target, source]
      return next
    })
    setResult(null)
  }

  async function process() {
    if (!files.length) return setError('tool.pdfMerge.empty')
    setProcessing(true)
    setError('')
    try {
      setResult(await mergePdfs(files.map(({ name, bytes }) => ({ name, bytes }))))
    } catch (caught) {
      setError(pdfErrorKey(caught))
    } finally {
      setProcessing(false)
    }
  }

  return <div className="stack">
    <section className="settings-card stack">
      <h2>{t('tool.pdf.files')}</h2>
      <label className="field"><span>{t('tool.pdf.chooseMultiple')}</span><input type="file" multiple accept={acceptAttributeFor('pdf-merge')} onChange={selectFiles} /></label>
      <p className="privacy-note">{t('tool.pdf.local')}</p>
      <div className="pdf-file-list">{files.map((file, index) => <article className="pdf-file-row" key={file.id}>
        <Preview file={file} />
        <div className="pdf-file-info"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span><PdfWarnings inspection={file.inspection} t={t} /></div>
        <div className="pdf-row-actions"><Button disabled={index === 0} onClick={() => move(index, -1)} aria-label={t('tool.pdf.moveUp')}>↑</Button><Button disabled={index === files.length - 1} onClick={() => move(index, 1)} aria-label={t('tool.pdf.moveDown')}>↓</Button><Button onClick={() => { setFiles((current) => current.filter((item) => item.id !== file.id)); setResult(null) }}>{t('tool.pdf.remove')}</Button></div>
      </article>)}</div>
      {error && <p className="error" role="alert">{t(error)}</p>}
      <Button className="primary" disabled={!files.length || processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfMerge.action')}</Button>
    </section>
    {result && downloadUrl && <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{t('tool.pdfMerge.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><a className="button primary" href={downloadUrl} download={`${baseName(files[0]?.name ?? 'documents')}-merged.pdf`}>{t('tool.pdf.download')}</a></section>}
  </div>
}

