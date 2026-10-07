import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  acceptAttributeFor
} from '@commietools/tools'
import {
  inspectPdf,
  type PdfInspection
} from '@commietools/tools/pdf/core'
import {
  compressPdf,
  protectPdf,
  unlockPdf,
  type PdfCompressionMode,
  type PdfModifyPermission,
  type PdfPrintPermission
} from '@commietools/tools/pdf/m5'
import { createFormatContext, formatBytes as anzeigeBytes } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'
import { PdfWarnings, baseName, pdfErrorKey, usePdfThumbnails, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

type PdfFile = { name: string; bytes: Uint8Array; inspection?: PdfInspection }

function useResult() {
  const [result, setResult] = useState<{ bytes: Uint8Array; url: string } | null>(null)
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url) }, [result])
  return [result, (bytes?: Uint8Array) => setResult((old) => { if (old) URL.revokeObjectURL(old.url); return bytes ? { bytes, url: URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })) } : null })] as const
}

function Facts({ file, t }: { file: PdfFile; t: Translate }) {
  const thumbnails = usePdfThumbnails(file.inspection ? file.bytes : null)
  return <><div className="pdf-document-facts"><strong>{file.name}</strong><span>{formatBytes(file.bytes.length)}</span>{file.inspection && <span>{file.inspection.pageCount} {t('tool.pdf.pages')}</span>}</div>{file.inspection && <PdfWarnings inspection={file.inspection} t={t} />}{thumbnails.images.length > 0 && <div className="pdf-thumbnail-grid">{thumbnails.images.map((image, index) => <figure className="pdf-page-card" key={index}><img src={image} alt={`${t('tool.pdf.page')} ${index + 1}`} /><figcaption>{index + 1}</figcaption></figure>)}</div>}</>
}

function DownloadResult({ url, name, title, t, children }: { url: string; name: string; title: string; t: Translate; children?: ReactNode }) {
  return <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{title}</h2><LocalBadge>{t('status.local')}</LocalBadge></div>{children}<SaveFileControl url={url} suggestedName={name} mimeType="application/pdf" t={t} /></section>
}

/**
 * Karte M3-010: Die Byte-Angabe benutzte `toFixed` und damit immer den **Punkt** — in einer
 * deutschen Oberfläche stand dort „4.5 KB" statt „4,5 KB". Jetzt über den gemeinsamen
 * Formatkontext (Region), nicht über die Oberflächensprache.
 */
function formatBytes(bytes: number, context = createFormatContext(document.documentElement.lang || 'de', navigator.languages)): string {
  return anzeigeBytes(bytes, context)
}

export function PdfSecurity({ t }: { t: Translate }) {
  const [mode, setMode] = useState<'protect' | 'unlock'>('protect')
  const [file, setFile] = useState<PdfFile | null>(null)
  const [userPassword, setUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [printing, setPrinting] = useState<PdfPrintPermission>('full')
  const [modification, setModification] = useState<PdfModifyPermission>('all')
  const [allowExtraction, setAllowExtraction] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useResult()

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; if (!selected) return
    try {
      const bytes = new Uint8Array(await selected.arrayBuffer())
      const inspection = mode === 'protect' ? await inspectPdf(bytes) : undefined
      setFile({ name: selected.name, bytes, inspection }); setError(''); setResult()
    } catch (caught) { setFile(null); setError(pdfErrorKey(caught)) }
    event.target.value = ''
  }

  async function process() {
    if (!file) return
    if (mode === 'protect' && userPassword !== confirmPassword) { setError('tool.pdfSecurity.passwordMismatch'); return }
    if (mode === 'protect' && userPassword === ownerPassword) { setError('tool.pdfSecurity.passwordDistinct'); return }
    setProcessing(true); setError(''); setResult()
    try {
      const bytes = mode === 'protect'
        ? await protectPdf(file.bytes, { userPassword, ownerPassword, printing, modification, allowExtraction })
        : await unlockPdf(file.bytes, userPassword)
      if (mode === 'unlock') await inspectPdf(bytes)
      setResult(bytes)
    } catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) }
  }

  function changeMode(next: 'protect' | 'unlock') { setMode(next); setFile(null); setResult(); setError(''); setUserPassword(''); setConfirmPassword(''); setOwnerPassword('') }
  const ready = file && userPassword && (mode === 'unlock' || (confirmPassword && ownerPassword))
  return <div className="stack"><section className="settings-card stack"><div className="segmented"><Button className={mode === 'protect' ? 'active' : ''} onClick={() => changeMode('protect')}>{t('tool.pdfSecurity.protect')}</Button><Button className={mode === 'unlock' ? 'active' : ''} onClick={() => changeMode('unlock')}>{t('tool.pdfSecurity.unlock')}</Button></div><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-security')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')} {t('tool.pdfSecurity.passwordPrivacy')}</p>{file && <><Facts file={file} t={t} /><div className="form-grid"><label className="field"><span>{t('tool.pdfSecurity.userPassword')}</span><input type="password" autoComplete="new-password" value={userPassword} onChange={(event) => setUserPassword(event.target.value)} /></label>{mode === 'protect' && <><label className="field"><span>{t('tool.pdfSecurity.confirmPassword')}</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label><label className="field"><span>{t('tool.pdfSecurity.ownerPassword')}</span><input type="password" autoComplete="new-password" value={ownerPassword} onChange={(event) => setOwnerPassword(event.target.value)} /></label><label className="field"><span>{t('tool.pdfSecurity.printing')}</span><select value={printing} onChange={(event) => setPrinting(event.target.value as PdfPrintPermission)}><option value="none">{t('tool.pdfSecurity.none')}</option><option value="low">{t('tool.pdfSecurity.low')}</option><option value="full">{t('tool.pdfSecurity.full')}</option></select></label><label className="field"><span>{t('tool.pdfSecurity.modify')}</span><select value={modification} onChange={(event) => setModification(event.target.value as PdfModifyPermission)}><option value="none">{t('tool.pdfSecurity.none')}</option><option value="assembly">{t('tool.pdfSecurity.assembly')}</option><option value="form">{t('tool.pdfSecurity.form')}</option><option value="annotate">{t('tool.pdfSecurity.annotate')}</option><option value="all">{t('tool.pdfSecurity.all')}</option></select></label><label className="check-field"><input type="checkbox" checked={allowExtraction} onChange={(event) => setAllowExtraction(event.target.checked)} />{t('tool.pdfSecurity.extract')}</label></>}</div>{mode === 'protect' && <p className="warning">{t('tool.pdfSecurity.permissionsWarning')}</p>}<Button className="primary" disabled={processing || !ready} onClick={process}>{processing ? t('tool.pdf.processing') : t(mode === 'protect' ? 'tool.pdfSecurity.actionProtect' : 'tool.pdfSecurity.actionUnlock')}</Button></>}{error && <p className="error" role="alert">{t(error)}</p>}</section>{result && file && <DownloadResult url={result.url} name={`${baseName(file.name)}-${mode === 'protect' ? 'protected' : 'unlocked'}.pdf`} title={t(mode === 'protect' ? 'tool.pdfSecurity.resultProtected' : 'tool.pdfSecurity.resultUnlocked')} t={t} />}</div>
}

export function PdfCompress({ t }: { t: Translate }) {
  const [file, setFile] = useState<PdfFile | null>(null)
  const [mode, setMode] = useState<PdfCompressionMode>('lossless')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useResult()
  async function selectFile(event: ChangeEvent<HTMLInputElement>) { const selected = event.target.files?.[0]; if (!selected) return; try { const bytes = new Uint8Array(await selected.arrayBuffer()); const inspection = await inspectPdf(bytes); setFile({ name: selected.name, bytes, inspection }); setResult(); setError('') } catch (caught) { setFile(null); setError(pdfErrorKey(caught)) } event.target.value = '' }
  async function process() { if (!file) return; setProcessing(true); setResult(); setError(''); try { const bytes = await compressPdf(file.bytes, mode); await inspectPdf(bytes); setResult(bytes) } catch (caught) { setError(pdfErrorKey(caught)) } finally { setProcessing(false) } }
  const saving = result && file ? (1 - result.bytes.length / file.bytes.length) * 100 : 0
  return <div className="stack"><section className="settings-card stack"><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-compress')} onChange={selectFile} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>{file && <><Facts file={file} t={t} /><label className="field"><span>{t('tool.pdfCompress.mode')}</span><select value={mode} onChange={(event) => { setMode(event.target.value as PdfCompressionMode); setResult() }}><option value="lossless">{t('tool.pdfCompress.lossless')}</option><option value="balanced">{t('tool.pdfCompress.balanced')}</option><option value="strong">{t('tool.pdfCompress.strong')}</option></select></label>{mode !== 'lossless' && <p className="warning">{t('tool.pdfCompress.lossyWarning')}</p>}<p>{t('tool.pdfCompress.noPromise')}</p><Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfCompress.action')}</Button></>}{error && <p className="error" role="alert">{t(error)}</p>}</section>{result && file && <DownloadResult url={result.url} name={`${baseName(file.name)}-optimized.pdf`} title={t('tool.pdfCompress.result')} t={t}><dl className="results pdf-size-results"><div><dt>{t('tool.pdfCompress.originalSize')}</dt><dd>{formatBytes(file.bytes.length)}</dd></div><div><dt>{t('tool.pdfCompress.resultSize')}</dt><dd>{formatBytes(result.bytes.length)}</dd></div><div><dt>{t('tool.pdfCompress.saving')}</dt><dd>{saving.toFixed(1)}%</dd></div></dl>{saving < 0 && <p className="warning">{t('tool.pdfCompress.larger')}</p>}</DownloadResult>}</div>
}
