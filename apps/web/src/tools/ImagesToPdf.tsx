import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { imagesToPdf, type PdfImageFit, type PdfOrientation, type PdfPageSize } from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { pdfErrorKey, useDownload, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

interface LoadedImage { id: string; name: string; bytes: Uint8Array; mimeType: 'image/jpeg' | 'image/png'; preview: string }

export function ImagesToPdf({ t }: { t: Translate }) {
  const [images, setImages] = useState<LoadedImage[]>([])
  const [pageSize, setPageSize] = useState<PdfPageSize>('a4')
  const [orientation, setOrientation] = useState<PdfOrientation>('auto')
  const [fit, setFit] = useState<PdfImageFit>('contain')
  const [margin, setMargin] = useState(24)
  const [result, setResult] = useState<Uint8Array | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const download = useDownload(result)
  const imagesRef = useRef(images)
  imagesRef.current = images

  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview)), [])

  async function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = [...(event.target.files ?? [])]
    const next = await Promise.all(selected.map(async (file) => ({ id: crypto.randomUUID(), name: file.name, bytes: new Uint8Array(await file.arrayBuffer()), mimeType: file.type as LoadedImage['mimeType'], preview: URL.createObjectURL(file) })))
    setImages((current) => [...current, ...next])
    setResult(null); setError(''); event.target.value = ''
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target]!, next[index]!]; return next })
    setResult(null)
  }

  function remove(id: string) {
    setImages((current) => { const found = current.find((image) => image.id === id); if (found) URL.revokeObjectURL(found.preview); return current.filter((image) => image.id !== id) })
    setResult(null)
  }

  async function process() {
    setProcessing(true); setError('')
    try { setResult(await imagesToPdf(images, { pageSize, orientation, fit, margin })) }
    catch (caught) { setResult(null); setError(pdfErrorKey(caught)) }
    finally { setProcessing(false) }
  }

  return <div className="stack"><section className="settings-card stack"><h2>{t('tool.pdf.files')}</h2><label className="field"><span>{t('tool.imagesToPdf.choose')}</span><input type="file" multiple accept={acceptAttributeFor('images-to-pdf')} onChange={selectImages} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>
    {images.length > 0 && <div className="pdf-file-list">{images.map((image, index) => <div className="pdf-file-row" key={image.id}><img className="pdf-file-preview" src={image.preview} alt="" /><div className="pdf-file-info"><strong>{image.name}</strong><span>{index + 1}</span></div><div className="pdf-row-actions"><Button disabled={index === 0} onClick={() => move(index, -1)}>{t('tool.pdf.moveUp')}</Button><Button disabled={index === images.length - 1} onClick={() => move(index, 1)}>{t('tool.pdf.moveDown')}</Button><Button onClick={() => remove(image.id)}>{t('tool.pdf.remove')}</Button></div></div>)}</div>}
    {images.length > 0 && <><h2>{t('tool.imagesToPdf.settings')}</h2><div className="form-grid"><label className="field"><span>{t('tool.imagesToPdf.pageSize')}</span><select value={pageSize} onChange={(event) => setPageSize(event.target.value as PdfPageSize)}><option value="auto">{t('tool.imagesToPdf.auto')}</option><option value="a4">{t('tool.imagesToPdf.a4')}</option><option value="letter">{t('tool.imagesToPdf.letter')}</option></select></label><label className="field"><span>{t('tool.imagesToPdf.orientation')}</span><select value={orientation} onChange={(event) => setOrientation(event.target.value as PdfOrientation)}><option value="auto">{t('tool.imagesToPdf.autoOrientation')}</option><option value="portrait">{t('tool.imagesToPdf.portrait')}</option><option value="landscape">{t('tool.imagesToPdf.landscape')}</option></select></label><label className="field"><span>{t('tool.imagesToPdf.margin')}</span><input type="number" min="0" max="144" value={margin} onChange={(event) => setMargin(Math.max(0, Math.min(144, Number(event.target.value))))} /></label><label className="field"><span>{t('tool.imagesToPdf.fit')}</span><select value={fit} onChange={(event) => setFit(event.target.value as PdfImageFit)}><option value="contain">{t('tool.imagesToPdf.contain')}</option><option value="cover">{t('tool.imagesToPdf.cover')}</option></select></label></div><Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.imagesToPdf.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}</section>
    {result && download && <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{t('tool.imagesToPdf.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><p>{t('tool.imagesToPdf.success').replace('{count}', String(images.length))}</p><SaveFileControl url={download} suggestedName="images.pdf" mimeType="application/pdf" t={t} /></section>}
  </div>
}
