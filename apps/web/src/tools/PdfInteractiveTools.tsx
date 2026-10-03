import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import {
  acceptAttributeFor
} from '@commietools/tools'
import {
  inspectPdf
} from '@commietools/tools/pdf/core'
import {
  addPdfAnnotation,
  deletePdfAnnotation,
  fillPdfForm,
  inspectPdfAnnotations,
  inspectPdfForm,
  type PdfAnnotationInfo,
  type PdfAnnotationType,
  type PdfFormInspection,
  type PdfFormValue
} from '@commietools/tools/pdf/m4'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, baseName, pdfErrorKey, usePdfThumbnails, type LoadedPdf, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

type InteractivePdf = LoadedPdf & { form?: PdfFormInspection }

function usePdfDownload() {
  const [url, setUrl] = useState('')
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  return [url, (bytes?: Uint8Array) => setUrl((old) => { if (old) URL.revokeObjectURL(old); return bytes ? URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })) : '' })] as const
}

function Result({ url, name, title, t }: { url: string; name: string; title: string; t: Translate }) {
  return <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{title}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><SaveFileControl url={url} suggestedName={name} mimeType="application/pdf" t={t} /></section>
}

function DocumentFacts({ file, t }: { file: LoadedPdf; t: Translate }) {
  const thumbnails = usePdfThumbnails(file.bytes)
  return <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} /><div className="pdf-thumbnail-grid">{thumbnails.images.map((image, index) => <figure className="pdf-page-card" key={index}><img src={image} alt={`${t('tool.pdf.page')} ${index + 1}`} /><figcaption>{index + 1}</figcaption></figure>)}</div></>
}

function FormField({ field, value, onChange, t }: { field: PdfFormInspection['fields'][number]; value: PdfFormValue; onChange: (value: PdfFormValue) => void; t: Translate }) {
  const suffix = [field.required ? t('tool.pdfForm.required') : '', field.readOnly ? t('tool.pdfForm.readOnly') : ''].filter(Boolean).join(' · ')
  if (field.type === 'checkbox') return <label className="check-field pdf-form-field"><input type="checkbox" checked={Boolean(value)} disabled={field.readOnly} onChange={(event) => onChange(event.target.checked)} /><span>{field.label}{suffix && <small>{suffix}</small>}</span></label>
  if (field.type === 'radio' || field.type === 'choice') return <label className="field pdf-form-field"><span>{field.label}</span><select value={String(value)} disabled={field.readOnly} onChange={(event) => onChange(event.target.value)}><option value="">—</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{suffix && <small>{suffix}</small>}</label>
  if (field.type === 'text') return <label className="field pdf-form-field"><span>{field.label}</span>{field.multiline ? <textarea value={String(value)} disabled={field.readOnly} onChange={(event) => onChange(event.target.value)} /> : <input value={String(value)} disabled={field.readOnly} onChange={(event) => onChange(event.target.value)} />}{suffix && <small>{suffix}</small>}</label>
  return <div className="pdf-form-field"><strong>{field.label}</strong><p>{t('tool.pdfForm.unsupported')}</p></div>
}

export function PdfFormFill({ t }: { t: Translate }) {
  const [file, setFile] = useState<InteractivePdf | null>(null)
  const [values, setValues] = useState<Record<string, PdfFormValue>>({})
  const [flatten, setFlatten] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [url, setResult] = usePdfDownload()
  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      const [inspection, form] = await Promise.all([inspectPdf(bytes), Promise.resolve(inspectPdfForm(bytes))])
      setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection, form })
      setValues(Object.fromEntries(form.fields.map((field) => [field.name, field.value])))
      setError(''); setResult()
    } catch (caught) { setFile(null); setError(pdfErrorKey(caught)) }
    event.target.value = ''
  }
  async function process() {
    if (!file) return
    setProcessing(true); setError(''); setResult()
    try { setResult(fillPdfForm(file.bytes, values, flatten)) } catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }
  return <div className="stack"><section className="settings-card stack"><h2>{t('tool.pdf.files')}</h2><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-form-fill')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>{file && <><DocumentFacts file={file} t={t} />{file.form?.hasXfa && <p className="warning">{t('tool.pdfForm.xfa')}</p>}{file.form?.fields.length ? <div className="pdf-form-grid">{file.form.fields.map((field) => <FormField key={field.name} field={field} value={values[field.name] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} t={t} />)}</div> : <p>{t('tool.pdfForm.noFields')}</p>}<label className="check-field"><input type="checkbox" checked={flatten} onChange={(event) => setFlatten(event.target.checked)} />{t('tool.pdfForm.flatten')}</label>{flatten && <p className="warning">{t('tool.pdfForm.flattenWarning')}</p>}<Button className="primary" disabled={processing || !file.form?.fields.length} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfForm.action')}</Button></>}{error && <p className="error" role="alert">{t(error)}</p>}</section>{url && <Result url={url} name={`${baseName(file?.name ?? 'form')}-filled.pdf`} title={t('tool.pdfForm.result')} t={t} />}</div>
}

const annotationTypes: readonly PdfAnnotationType[] = ['Text', 'FreeText', 'Highlight', 'Underline', 'StrikeOut', 'Square', 'Circle', 'Line', 'Ink']

function hexRgb(value: string): [number, number, number] { const parsed = Number.parseInt(value.slice(1), 16); return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255] }

export function PdfAnnotate({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [annotations, setAnnotations] = useState<PdfAnnotationInfo[]>([])
  const [type, setType] = useState<PdfAnnotationType>('Text')
  const [page, setPage] = useState(1)
  const [contents, setContents] = useState('')
  const [author, setAuthor] = useState('CommieTools')
  const [color, setColor] = useState('#ffd43b')
  const [opacity, setOpacity] = useState(0.6)
  const [box, setBox] = useState({ x: 10, y: 10, width: 35, height: 10 })
  const [inkStrokes, setInkStrokes] = useState<[number, number][][]>([])
  const drawing = useRef(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [url, setResult] = usePdfDownload()
  async function load(name: string, bytes: Uint8Array) { const inspection = await inspectPdf(bytes); setFile({ id: crypto.randomUUID(), name, bytes, inspection }); setAnnotations(inspectPdfAnnotations(bytes)); setResult(bytes) }
  async function selectFile(event: ChangeEvent<HTMLInputElement>) { const selected = event.target.files?.[0]; if (!selected) return; try { await load(selected.name, new Uint8Array(await selected.arrayBuffer())); setError('') } catch (caught) { setError(pdfErrorKey(caught)) } event.target.value = '' }
  async function add() {
    if (!file) return
    setProcessing(true); setError('')
    try {
      const size = file.inspection.pages[page - 1]; if (!size) throw new Error('Invalid page')
      const x0 = size.width * box.x / 100; const y0 = size.height * box.y / 100
      const rect: [number, number, number, number] = [x0, y0, x0 + size.width * box.width / 100, y0 + size.height * box.height / 100]
      const ink = type === 'Ink' ? inkStrokes.map((stroke) => stroke.map(([x, y]) => [size.width * x / 100, size.height * y / 100] as const)) : undefined
      const bytes = addPdfAnnotation(file.bytes, { pageIndex: page - 1, type, rect, contents, author, color: hexRgb(color), opacity, ink })
      await load(file.name, bytes)
      setInkStrokes([])
    } catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }
  function inkPoint(event: PointerEvent<SVGSVGElement>): [number, number] {
    const bounds = event.currentTarget.getBoundingClientRect()
    return [Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)), Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100))]
  }
  function startInk(event: PointerEvent<SVGSVGElement>) { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); setInkStrokes((current) => [...current, [inkPoint(event)]]) }
  function moveInk(event: PointerEvent<SVGSVGElement>) { if (!drawing.current) return; const point = inkPoint(event); setInkStrokes((current) => current.map((stroke, index) => index === current.length - 1 ? [...stroke, point] : stroke)) }
  function stopInk() { drawing.current = false }
  async function remove(annotation: PdfAnnotationInfo) {
    if (!file) return
    try { await load(file.name, deletePdfAnnotation(file.bytes, annotation.pageIndex, annotation.index)); setError('') } catch (caught) { setError(pdfErrorKey(caught)) }
  }
  const number = (label: string, key: keyof typeof box) => <label className="field"><span>{label}</span><input type="number" min="0" max="100" value={box[key]} onChange={(event) => setBox((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>
  return <div className="stack"><section className="settings-card stack"><h2>{t('tool.pdf.files')}</h2><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-annotate')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>{file && <><DocumentFacts file={file} t={t} /><div className="form-grid"><label className="field"><span>{t('tool.pdfAnnotate.type')}</span><select value={type} onChange={(event) => setType(event.target.value as PdfAnnotationType)}>{annotationTypes.map((item) => <option key={item} value={item}>{t(`tool.pdfAnnotate.${item}`)}</option>)}</select></label><label className="field"><span>{t('tool.pdfAnnotate.page')}</span><input type="number" min="1" max={file.inspection.pageCount} value={page} onChange={(event) => setPage(Number(event.target.value))} /></label><label className="field"><span>{t('tool.pdfAnnotate.contents')}</span><textarea value={contents} onChange={(event) => setContents(event.target.value)} /></label><label className="field"><span>{t('tool.pdfAnnotate.author')}</span><input value={author} onChange={(event) => setAuthor(event.target.value)} /></label><label className="field"><span>{t('tool.pdfAnnotate.color')}</span><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><label className="field"><span>{t('tool.pdfAnnotate.opacity')} ({Math.round(opacity * 100)}%)</span><input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label>{type !== 'Ink' && <>{number(t('tool.pdfAnnotate.x'), 'x')}{number(t('tool.pdfAnnotate.y'), 'y')}{number(t('tool.pdfAnnotate.width'), 'width')}{number(t('tool.pdfAnnotate.height'), 'height')}</>}</div>{type === 'Ink' && <div className="pdf-ink-editor"><div className="preview-heading"><strong>{t('tool.pdfAnnotate.draw')}</strong><Button onClick={() => setInkStrokes([])}>{t('tool.pdfAnnotate.clear')}</Button></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={t('tool.pdfAnnotate.draw')} onPointerDown={startInk} onPointerMove={moveInk} onPointerUp={stopInk} onPointerCancel={stopInk}>{inkStrokes.map((stroke, index) => <polyline key={index} points={stroke.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}</svg><small>{t('tool.pdfAnnotate.drawHelp')}</small></div>}<Button className="primary" disabled={processing || (type === 'Ink' && !inkStrokes.some((stroke) => stroke.length > 1))} onClick={add}>{processing ? t('tool.pdf.processing') : t('tool.pdfAnnotate.add')}</Button><h2>{t('tool.pdfAnnotate.existing')}</h2>{annotations.length ? <ul className="pdf-annotation-list">{annotations.map((annotation) => <li key={`${annotation.pageIndex}-${annotation.index}`}><span><strong>{t(`tool.pdfAnnotate.${annotation.type}`)}</strong> · {t('tool.pdfAnnotate.page')} {annotation.pageIndex + 1}{annotation.contents && <> · {annotation.contents}</>}</span><Button onClick={() => remove(annotation)}>{t('tool.pdfAnnotate.delete')}</Button></li>)}</ul> : <p>{t('tool.pdfAnnotate.none')}</p>}</>}{error && <p className="error" role="alert">{t(error)}</p>}</section>{url && file && <Result url={url} name={`${baseName(file.name)}-annotated.pdf`} title={t('tool.pdfAnnotate.result')} t={t} />}</div>
}
