import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent, type ReactNode } from 'react'
import {
  acceptAttributeFor,
  auxiliaryMimeTypes
} from '@commietools/tools'
import {
  addPdfPageNumbers,
  addPdfWatermark,
  addVisiblePdfSignature,
  formatPdfPageNumber,
  inspectPdf,
  parsePageSelection,
  type PdfNumberFormat,
  type PdfPlacementAnchor
} from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, baseName, pdfErrorKey, usePdfThumbnails, type LoadedPdf, type Translate } from './pdfUi'

const anchors: readonly PdfPlacementAnchor[] = ['top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
const anchorKeys: Record<PdfPlacementAnchor, string> = {
  'top-left': 'tool.pdfPlacement.topLeft',
  'top-center': 'tool.pdfPlacement.topCenter',
  'top-right': 'tool.pdfPlacement.topRight',
  'middle-left': 'tool.pdfPlacement.middleLeft',
  center: 'tool.pdfPlacement.center',
  'middle-right': 'tool.pdfPlacement.middleRight',
  'bottom-left': 'tool.pdfPlacement.bottomLeft',
  'bottom-center': 'tool.pdfPlacement.bottomCenter',
  'bottom-right': 'tool.pdfPlacement.bottomRight'
}

function canvasPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => canvas.toBlob(async (blob) => blob ? resolve(new Uint8Array(await blob.arrayBuffer())) : reject(new Error('PNG export failed')), 'image/png'))
}

async function renderTextPng(text: string, fontSize: number, color: string, font = 'system-ui, sans-serif'): Promise<Uint8Array> {
  const scale = 2
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas unavailable')
  context.font = `700 ${fontSize * scale}px ${font}`
  const metrics = context.measureText(text)
  canvas.width = Math.max(2, Math.ceil(metrics.width + 8 * scale))
  canvas.height = Math.max(2, Math.ceil(fontSize * 1.45 * scale))
  const final = canvas.getContext('2d')!
  final.font = `700 ${fontSize * scale}px ${font}`
  final.fillStyle = color
  final.textBaseline = 'middle'
  final.fillText(text, 4 * scale, canvas.height / 2)
  return canvasPng(canvas)
}

type SignatureSource = { bytes: Uint8Array; mimeType: 'image/png' | 'image/jpeg'; name: string }

function SignaturePad({ onChange, clearLabel, label }: { onChange: (signature: SignatureSource | null) => void; clearLabel: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!; const context = canvas.getContext('2d')!; const at = point(event)
    drawing.current = true; canvas.setPointerCapture(event.pointerId); context.beginPath(); context.moveTo(at.x, at.y)
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const context = canvasRef.current!.getContext('2d')!; const at = point(event)
    context.lineWidth = 4; context.lineCap = 'round'; context.lineJoin = 'round'; context.strokeStyle = '#17181b'; context.lineTo(at.x, at.y); context.stroke()
  }
  async function end(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    drawing.current = false; canvasRef.current!.releasePointerCapture(event.pointerId)
    onChange({ bytes: await canvasPng(canvasRef.current!), mimeType: 'image/png', name: label })
  }
  function clear() { const canvas = canvasRef.current!; canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height); onChange(null) }
  return <div className="signature-pad"><canvas ref={canvasRef} width="720" height="240" aria-label={label} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} /><Button onClick={clear}>{clearLabel}</Button></div>
}

function AnchorSelect({ value, onChange, t }: { value: PdfPlacementAnchor; onChange: (value: PdfPlacementAnchor) => void; t: Translate }) {
  return <label className="field"><span>{t('tool.pdfPlacement.anchor')}</span><select value={value} onChange={(event) => onChange(event.target.value as PdfPlacementAnchor)}>{anchors.map((anchor) => <option key={anchor} value={anchor}>{t(anchorKeys[anchor])}</option>)}</select></label>
}

function PdfInput({ toolId, file, setFile, setError, t }: { toolId: string; file: LoadedPdf | null; setFile: (file: LoadedPdf | null) => void; setError: (error: string) => void; t: Translate }) {
  const thumbnails = usePdfThumbnails(file?.bytes ?? null)
  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
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
  return <>
    <label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor(toolId)} onChange={selectFile} /></label>
    <p className="privacy-note">{t('tool.pdf.local')}</p>
    {file && <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} />
      <div className="pdf-thumbnail-grid">{thumbnails.images.map((image, index) => <figure className="pdf-page-card" key={index}><img src={image} alt={`${t('tool.pdf.page')} ${index + 1}`} /><figcaption>{index + 1}</figcaption></figure>)}</div></>}
  </>
}

function Result({ url, name, title, t }: { url: string; name: string; title: string; t: Translate }) {
  return <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{title}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><a className="button primary" href={url} download={name}>{t('tool.pdf.download')}</a></section>
}

function usePdfResult() {
  const [url, setUrl] = useState('')
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  return [url, (bytes?: Uint8Array) => setUrl((old) => {
    if (old) URL.revokeObjectURL(old)
    return bytes ? URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })) : ''
  })] as const
}

function NumberField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number }) {
  return <label className="field"><span>{label}</span><input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function ToolFrame({ children, result }: { children: ReactNode; result?: ReactNode }) {
  return <div className="stack"><section className="settings-card stack">{children}</section>{result}</div>
}

export function PdfWatermark({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [pages, setPages] = useState('1')
  const [text, setText] = useState('VERTRAULICH')
  const [anchor, setAnchor] = useState<PdfPlacementAnchor>('center')
  const [fontSize, setFontSize] = useState(52)
  const [margin, setMargin] = useState(28)
  const [opacity, setOpacity] = useState(0.22)
  const [rotation, setRotation] = useState(-35)
  const [color, setColor] = useState('#c91f2c')
  const [tiled, setTiled] = useState(false)
  const [spacing, setSpacing] = useState(80)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [url, setResult] = usePdfResult()

  function selected(next: LoadedPdf | null) {
    setFile(next); setResult(); if (next) setPages(`1-${next.inspection.pageCount}`)
  }
  async function process() {
    if (!file) return
    setProcessing(true); setError(''); setResult()
    try {
      setResult(await addPdfWatermark(file.bytes, { text, textImage: await renderTextPng(text, fontSize, color), pages: parsePageSelection(pages, file.inspection.pageCount), anchor, fontSize, margin, opacity, rotation, color, tiled, spacing }))
    } catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }
  return <ToolFrame result={url && <Result url={url} name={`${baseName(file?.name ?? 'document')}-watermark.pdf`} title={t('tool.pdfWatermark.result')} t={t} />}>
    <h2>{t('tool.pdf.files')}</h2><PdfInput toolId="pdf-watermark" file={file} setFile={selected} setError={setError} t={t} />
    {file && <><div className="form-grid"><label className="field"><span>{t('tool.pdfWatermark.text')}</span><input value={text} onChange={(event) => setText(event.target.value)} /></label><label className="field"><span>{t('tool.pdfPlacement.pages')}</span><input value={pages} onChange={(event) => setPages(event.target.value)} /><small>{t('tool.pdfPlacement.pagesHint')}</small></label><AnchorSelect value={anchor} onChange={setAnchor} t={t} /><NumberField label={t('tool.pdfPlacement.margin')} value={margin} onChange={setMargin} min={0} max={200} /><NumberField label={t('tool.pdfPlacement.fontSize')} value={fontSize} onChange={setFontSize} min={6} max={144} /><NumberField label={t('tool.pdfPlacement.rotation')} value={rotation} onChange={setRotation} min={-180} max={180} /><label className="field"><span>{t('tool.pdfPlacement.color')}</span><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><label className="field"><span>{t('tool.pdfPlacement.opacity')} ({Math.round(opacity * 100)}%)</span><input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label><label className="check-field"><input type="checkbox" checked={tiled} onChange={(event) => setTiled(event.target.checked)} />{t('tool.pdfWatermark.tiled')}</label>{tiled && <NumberField label={t('tool.pdfWatermark.spacing')} value={spacing} onChange={setSpacing} min={10} max={400} />}</div><Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfWatermark.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </ToolFrame>
}

export function PdfPageNumbers({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [pages, setPages] = useState('1')
  const [anchor, setAnchor] = useState<PdfPlacementAnchor>('bottom-center')
  const [fontSize, setFontSize] = useState(11)
  const [margin, setMargin] = useState(24)
  const [opacity, setOpacity] = useState(1)
  const [color, setColor] = useState('#17181b')
  const [start, setStart] = useState(1)
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [format, setFormat] = useState<PdfNumberFormat>('number')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [url, setResult] = usePdfResult()
  function selected(next: LoadedPdf | null) { setFile(next); setResult(); if (next) setPages(`1-${next.inspection.pageCount}`) }
  async function process() {
    if (!file) return
    setProcessing(true); setError(''); setResult()
    try {
      const selectedPages = parsePageSelection(pages, file.inspection.pageCount)
      const numberOptions = { start, prefix, suffix, format }
      const textImages = await Promise.all(selectedPages.map((_, index) => renderTextPng(formatPdfPageNumber(index, selectedPages.length, numberOptions), fontSize, color)))
      setResult(await addPdfPageNumbers(file.bytes, { pages: selectedPages, anchor, fontSize, margin, opacity, color, start, prefix, suffix, format, textImages }))
    }
    catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }
  return <ToolFrame result={url && <Result url={url} name={`${baseName(file?.name ?? 'document')}-numbered.pdf`} title={t('tool.pdfPageNumbers.result')} t={t} />}>
    <h2>{t('tool.pdf.files')}</h2><PdfInput toolId="pdf-page-numbers" file={file} setFile={selected} setError={setError} t={t} />
    {file && <><div className="form-grid"><label className="field"><span>{t('tool.pdfPlacement.pages')}</span><input value={pages} onChange={(event) => setPages(event.target.value)} /><small>{t('tool.pdfPlacement.pagesHint')}</small></label><NumberField label={t('tool.pdfPageNumbers.start')} value={start} onChange={setStart} min={-9999} max={99999} /><label className="field"><span>{t('tool.pdfPageNumbers.format')}</span><select value={format} onChange={(event) => setFormat(event.target.value as PdfNumberFormat)}><option value="number">{t('tool.pdfPageNumbers.number')}</option><option value="page-total">{t('tool.pdfPageNumbers.pageTotal')}</option><option value="dash">{t('tool.pdfPageNumbers.dash')}</option></select></label><AnchorSelect value={anchor} onChange={setAnchor} t={t} /><label className="field"><span>{t('tool.pdfPageNumbers.prefix')}</span><input value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label><label className="field"><span>{t('tool.pdfPageNumbers.suffix')}</span><input value={suffix} onChange={(event) => setSuffix(event.target.value)} /></label><NumberField label={t('tool.pdfPlacement.fontSize')} value={fontSize} onChange={setFontSize} min={6} max={72} /><NumberField label={t('tool.pdfPlacement.margin')} value={margin} onChange={setMargin} min={0} max={200} /><label className="field"><span>{t('tool.pdfPlacement.color')}</span><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><label className="field"><span>{t('tool.pdfPlacement.opacity')} ({Math.round(opacity * 100)}%)</span><input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label></div><Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfPageNumbers.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </ToolFrame>
}

export function PdfVisibleSignature({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [signature, setSignature] = useState<SignatureSource | null>(null)
  const [sourceMode, setSourceMode] = useState<'draw' | 'name' | 'image'>('draw')
  const [signatureName, setSignatureName] = useState('')
  const [page, setPage] = useState(1)
  const [anchor, setAnchor] = useState<PdfPlacementAnchor>('bottom-right')
  const [width, setWidth] = useState(160)
  const [margin, setMargin] = useState(28)
  const [opacity, setOpacity] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [dateText, setDateText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [url, setResult] = usePdfResult()
  async function selectSignature(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    const mimeType = selected.type === 'image/jpeg' ? 'image/jpeg' : selected.type === 'image/png' ? 'image/png' : null
    if (!mimeType) { setSignature(null); setError('tool.pdf.error.unsupported'); return }
    setSignature({ bytes: new Uint8Array(await selected.arrayBuffer()), mimeType, name: selected.name }); setError(''); event.target.value = ''
  }
  async function process() {
    if (!file) return
    let selectedSignature = signature
    if (sourceMode === 'name' && signatureName.trim()) selectedSignature = { bytes: await renderTextPng(signatureName.trim(), 72, '#17181b', '"Segoe Script", "Brush Script MT", cursive'), mimeType: 'image/png', name: signatureName.trim() }
    if (!selectedSignature) { setError('tool.pdfSignature.required'); return }
    setProcessing(true); setError(''); setResult()
    try { setResult(await addVisiblePdfSignature(file.bytes, { pageIndex: page - 1, image: selectedSignature.bytes, mimeType: selectedSignature.mimeType, width, opacity, rotation, anchor, margin, dateText })) }
    catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }
  return <ToolFrame result={url && <Result url={url} name={`${baseName(file?.name ?? 'document')}-signed-visible.pdf`} title={t('tool.pdfSignature.result')} t={t} />}>
    <p className="pdf-signature-disclaimer">{t('tool.pdfSignature.disclaimer')}</p><h2>{t('tool.pdf.files')}</h2><PdfInput toolId="pdf-visible-signature" file={file} setFile={(next) => { setFile(next); setResult(); setPage(1) }} setError={setError} t={t} />
    {file && <><fieldset className="signature-source"><legend>{t('tool.pdfSignature.source')}</legend><div className="segmented">{(['draw', 'name', 'image'] as const).map((mode) => <Button key={mode} className={sourceMode === mode ? 'active' : ''} aria-pressed={sourceMode === mode} onClick={() => { setSourceMode(mode); setSignature(null); setError('') }}>{t(`tool.pdfSignature.${mode}`)}</Button>)}</div>{sourceMode === 'draw' && <SignaturePad onChange={setSignature} clearLabel={t('tool.pdfSignature.clear')} label={t('tool.pdfSignature.canvas')} />}{sourceMode === 'name' && <label className="field"><span>{t('tool.pdfSignature.nameLabel')}</span><input value={signatureName} onChange={(event) => setSignatureName(event.target.value)} /></label>}{sourceMode === 'image' && <label className="field"><span>{t('tool.pdfSignature.image')}</span><input type="file" accept={auxiliaryMimeTypes('pdf-visible-signature', 'signature').join(',')} onChange={selectSignature} />{signature && <small>{signature.name}</small>}</label>}</fieldset><div className="form-grid"><NumberField label={t('tool.pdfSignature.page')} value={page} onChange={setPage} min={1} max={file.inspection.pageCount} /><AnchorSelect value={anchor} onChange={setAnchor} t={t} /><NumberField label={t('tool.pdfSignature.width')} value={width} onChange={setWidth} min={24} max={600} /><NumberField label={t('tool.pdfPlacement.margin')} value={margin} onChange={setMargin} min={0} max={200} /><NumberField label={t('tool.pdfPlacement.rotation')} value={rotation} onChange={setRotation} min={-180} max={180} /><label className="field"><span>{t('tool.pdfPlacement.opacity')} ({Math.round(opacity * 100)}%)</span><input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label><label className="field"><span>{t('tool.pdfSignature.date')}</span><input value={dateText} onChange={(event) => setDateText(event.target.value)} /></label></div><Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfSignature.action')}</Button></>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </ToolFrame>
}
