import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf, parsePageSelection } from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { baseName, extractPdfText, PdfWarnings, pdfErrorKey, renderPdfPages, type LoadedPdf, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'
import { createOcrWorker } from './ocrWorker'

type Mode = 'auto' | 'native' | 'ocr'
type OcrLanguage = 'deu' | 'eng' | 'spa'
type OcrWorker = ReturnType<typeof createOcrWorker>

const OCR_CORE = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/'
const OCR_LANGUAGES = 'https://tessdata.projectnaptha.com/4.0.0_fast'

export function PdfTextOcr({ t }: { t: Translate }) {
  const [file, setFile] = useState<LoadedPdf | null>(null)
  const [selection, setSelection] = useState('1')
  const [mode, setMode] = useState<Mode>('auto')
  const [language, setLanguage] = useState<OcrLanguage>('deu')
  const [consent, setConsent] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const workerRef = useRef<OcrWorker | null>(null)
  const generationRef = useRef(0)
  useEffect(() => () => {
    generationRef.current += 1
    const worker = workerRef.current
    workerRef.current = null
    void worker?.terminate().catch(() => {})
  }, [])

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return
    event.target.value = ''
    const generation = (generationRef.current += 1)
    const previous = workerRef.current
    workerRef.current = null
    void previous?.terminate().catch(() => {})
    setFile(null); setProcessing(true)
    setText(''); setError(''); setProgress(0)
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      if (generation !== generationRef.current) return
      const inspection = await inspectPdf(bytes)
      if (generation !== generationRef.current) return
      setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection })
      setSelection(`1-${inspection.pageCount}`)
    } catch (caught) {
      if (generation === generationRef.current) { setFile(null); setError(pdfErrorKey(caught)) }
    } finally { if (generation === generationRef.current) setProcessing(false) }
  }

  async function process() {
    if (!file || processing) return
    const generation = (generationRef.current += 1)
    const current = () => generation === generationRef.current
    const snapshot = { file, selection, mode, language, consent }
    let worker: OcrWorker | null = null
    setError(''); setText(''); setProgress(0)
    setProcessing(true)
    try {
      const pages = parsePageSelection(snapshot.selection, snapshot.file.inspection.pageCount)
      const nativePages = await extractPdfText(snapshot.file.bytes, pages)
      if (!current()) return
      const needsOcr = snapshot.mode === 'ocr' || (snapshot.mode === 'auto' && nativePages.some((item) => item.text.length < 10))
      if (needsOcr && !snapshot.consent) { setError('tool.pdfTextOcr.needConsent'); return }
      if (needsOcr) {
        if (!current()) return
        worker = createOcrWorker({
          corePath: OCR_CORE,
          langPath: OCR_LANGUAGES,
          logger: (message) => { if (current() && message.status === 'recognizing text') setProgress(message.progress) }
        })
        workerRef.current = worker
        await worker.initialize(snapshot.language)
        if (!current()) return
      }
      const output: string[] = []
      let completed = 0
      for (const item of nativePages) {
        let pageText = item.text
        if (!current()) return
        if (worker && (snapshot.mode === 'ocr' || pageText.length < 10)) {
          const rendered = (await renderPdfPages(snapshot.file.bytes, [item.pageNumber - 1], { dpi: 180, format: 'png', quality: 1, background: '#ffffff' }))[0]
          if (!current()) return
          if (!rendered) throw new Error('Page rendering failed')
          const result = await worker.recognize(rendered.blob)
          if (!current()) return
          pageText = result.data.text.trim()
        }
        output.push(`--- ${t('tool.pdf.page')} ${item.pageNumber} ---\n${pageText}`)
        completed += 1
        setProgress(completed / nativePages.length)
      }
      if (!current()) return
      const combined = output.join('\n\n').trim()
      setText(combined)
      if (!combined.replace(/---.*---/gu, '').trim()) setError('tool.pdfTextOcr.empty')
    } catch (caught) {
      if (current()) setError(pdfErrorKey(caught))
    } finally {
      if (worker) await worker.terminate().catch(() => {})
      if (workerRef.current === worker) workerRef.current = null
      if (current()) setProcessing(false)
    }
  }

  async function cancel() {
    const generation = (generationRef.current += 1)
    const worker = workerRef.current
    workerRef.current = null
    if (worker) await worker.terminate().catch(() => {})
    if (generation === generationRef.current) { setProcessing(false); setError('tool.pdfTextOcr.cancelled') }
  }

  const resultBlob = text ? new Blob([text], { type: 'text/plain;charset=utf-8' }) : undefined
  return <div className="stack"><section className="settings-card stack">
    <label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-text-ocr')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>
    {file && <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span></div><PdfWarnings inspection={file.inspection} t={t} />
      <div className="form-grid"><label className="field"><span>{t('tool.pdfTextOcr.selection')}</span><input value={selection} onChange={(event) => setSelection(event.target.value)} /><small>{t('tool.pdfTextOcr.selectionHint')}</small></label><label className="field"><span>{t('tool.pdfTextOcr.mode')}</span><select value={mode} onChange={(event) => setMode(event.target.value as Mode)}><option value="auto">{t('tool.pdfTextOcr.auto')}</option><option value="native">{t('tool.pdfTextOcr.native')}</option><option value="ocr">{t('tool.pdfTextOcr.ocr')}</option></select></label>{mode !== 'native' && <label className="field"><span>{t('tool.pdfTextOcr.language')}</span><select value={language} onChange={(event) => setLanguage(event.target.value as OcrLanguage)}>{(['deu', 'eng', 'spa'] as const).map((code) => <option value={code} key={code}>{t(`tool.pdfTextOcr.language.${code}`)}</option>)}</select></label>}</div>
      {mode !== 'native' && <><label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>{t('tool.pdfTextOcr.downloadConsent')}</span></label><p className="scan-note">{t('tool.pdfTextOcr.firstDownload')}</p></>}
      {processing ? <div className="ocr-progress"><label>{t('tool.pdfTextOcr.progress')} <progress max="1" value={progress} /> {Math.round(progress * 100)}%</label><Button onClick={cancel}>{t('tool.pdfTextOcr.cancel')}</Button></div> : <Button className="primary" onClick={() => void process()}>{t('tool.pdfTextOcr.action')}</Button>}
    </>}{error && <p className="error" role="alert">{t(error)}</p>}</section>
    {text && file && <section className="settings-card stack"><div className="preview-heading"><h2>{t('tool.pdfTextOcr.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><textarea className="ocr-result" value={text} onChange={(event) => setText(event.target.value)} /><SaveFileControl blob={resultBlob} suggestedName={`${baseName(file.name)}.txt`} mimeType="text/plain" t={t} /></section>}
  </div>
}
