import { useRef, useState, type ChangeEvent } from 'react'
import workerUrl from 'tesseract.js/dist/worker.min.js?url'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf, parsePageSelection } from '@commietools/tools/pdf/core'
import { Button, LocalBadge } from '@commietools/ui'
import { baseName, extractPdfText, PdfWarnings, pdfErrorKey, renderPdfPages, type LoadedPdf, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

type Mode = 'auto' | 'native' | 'ocr'
type OcrLanguage = 'deu' | 'eng' | 'spa'
type OcrWorker = Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>>

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
  const cancelledRef = useRef(false)

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return
    setText(''); setError(''); setProgress(0)
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      const inspection = await inspectPdf(bytes)
      setFile({ id: crypto.randomUUID(), name: selected.name, bytes, inspection })
      setSelection(`1-${inspection.pageCount}`)
    } catch (caught) { setFile(null); setError(pdfErrorKey(caught)) }
    event.target.value = ''
  }

  async function process() {
    if (!file) return
    cancelledRef.current = false
    setError(''); setText(''); setProgress(0)
    setProcessing(true)
    try {
      const pages = parsePageSelection(selection, file.inspection.pageCount)
      const nativePages = await extractPdfText(file.bytes, pages)
      const needsOcr = mode === 'ocr' || (mode === 'auto' && nativePages.some((item) => item.text.length < 10))
      if (needsOcr && !consent) { setError('tool.pdfTextOcr.needConsent'); return }
      let worker: OcrWorker | null = null
      if (needsOcr) {
        const { createWorker } = await import('tesseract.js')
        worker = await createWorker(language, 1, {
          workerPath: workerUrl,
          corePath: OCR_CORE,
          langPath: OCR_LANGUAGES,
          logger: (message) => { if (message.status === 'recognizing text') setProgress(message.progress) }
        })
        workerRef.current = worker
      }
      const output: string[] = []
      let completed = 0
      for (const item of nativePages) {
        let pageText = item.text
        if (worker && (mode === 'ocr' || pageText.length < 10)) {
          const rendered = (await renderPdfPages(file.bytes, [item.pageNumber - 1], { dpi: 180, format: 'png', quality: 1, background: '#ffffff' }))[0]
          if (!rendered) throw new Error('Page rendering failed')
          const result = await worker.recognize(rendered.blob)
          pageText = result.data.text.trim()
        }
        output.push(`--- ${t('tool.pdf.page')} ${item.pageNumber} ---\n${pageText}`)
        completed += 1
        setProgress(completed / nativePages.length)
      }
      if (worker) await worker.terminate()
      workerRef.current = null
      const combined = output.join('\n\n').trim()
      setText(combined)
      if (!combined.replace(/---.*---/gu, '').trim()) setError('tool.pdfTextOcr.empty')
    } catch (caught) {
      setError(cancelledRef.current ? 'tool.pdfTextOcr.cancelled' : pdfErrorKey(caught))
    } finally {
      if (workerRef.current) await workerRef.current.terminate().catch(() => {})
      workerRef.current = null
      setProcessing(false)
    }
  }

  async function cancel() {
    cancelledRef.current = true
    const worker = workerRef.current
    workerRef.current = null
    if (worker) await worker.terminate().catch(() => {})
    setProcessing(false); setError('tool.pdfTextOcr.cancelled')
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
