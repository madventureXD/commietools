import { useState, type ChangeEvent } from 'react'
import { acceptAttributeFor, auxiliaryMimeTypes } from '@commietools/tools'
import { inspectPdf } from '@commietools/tools/pdf/core'
import { signPdfWithCertificate, verifyPdfSignatures, type PdfSignatureVerification } from '@commietools/tools/pdf/m7'
import { Button, LocalBadge } from '@commietools/ui'
import { baseName, pdfErrorKey, useDownload, type Translate } from './pdfUi'
import { SaveFileControl } from './SaveFileControl'

type InputFile = { name: string; bytes: Uint8Array }

async function readFile(event: ChangeEvent<HTMLInputElement>): Promise<InputFile | null> {
  const selected = event.target.files?.[0]
  event.target.value = ''
  return selected ? { name: selected.name, bytes: new Uint8Array(await selected.arrayBuffer()) } : null
}

function message(error: unknown, fallback: string): string {
  const common = pdfErrorKey(error)
  return common === 'tool.pdf.error.generic' ? fallback : common
}

export function PdfCertificateSign({ t }: { t: Translate }) {
  const [pdf, setPdf] = useState<InputFile | null>(null)
  const [certificate, setCertificate] = useState<InputFile | null>(null)
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<Uint8Array | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const downloadUrl = useDownload(result)

  async function choosePdf(event: ChangeEvent<HTMLInputElement>) {
    try { const file = await readFile(event); if (file) { await inspectPdf(file.bytes); setPdf(file); setResult(null); setError('') } }
    catch (caught) { setPdf(null); setError(message(caught, 'tool.pdfCertificateSign.failed')) }
  }
  async function chooseCertificate(event: ChangeEvent<HTMLInputElement>) {
    const file = await readFile(event); if (file) { setCertificate(file); setResult(null); setError('') }
  }
  async function process() {
    if (!pdf || !certificate || !password) return
    setProcessing(true); setError(''); setResult(null)
    try {
      const signed = await signPdfWithCertificate(pdf.bytes, certificate.bytes, password)
      const report = await verifyPdfSignatures(signed)
      if (!report.allValid) throw new Error('Self-verification failed')
      setResult(signed)
    } catch (caught) { console.error('PDF certificate signing failed', caught); setError('tool.pdfCertificateSign.failed') }
    finally { setProcessing(false) }
  }

  return <div className="stack"><section className="settings-card stack">
    <label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-certificate-sign')} onChange={choosePdf} /></label>
    {pdf && <strong>{pdf.name}</strong>}
    <label className="field"><span>{t('tool.pdfCertificateSign.certificate')}</span><input type="file" accept={`${auxiliaryMimeTypes('pdf-certificate-sign', 'certificate').join(',')},.p12,.pfx`} onChange={chooseCertificate} /></label>
    {certificate && <strong>{certificate.name}</strong>}
    <label className="field"><span>{t('tool.pdfCertificateSign.password')}</span><input type="password" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    <p className="privacy-note">{t('tool.pdfCertificateSign.privacy')}</p><p className="warning">{t('tool.pdfCertificateSign.scope')}</p>
    <Button className="primary" disabled={!pdf || !certificate || !password || processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfCertificateSign.action')}</Button>
    {error && <p className="error" role="alert">{t(error)}</p>}
  </section>{result && pdf && downloadUrl && <section className="settings-card stack" aria-live="polite"><div className="preview-heading"><h2>{t('tool.pdfCertificateSign.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><SaveFileControl url={downloadUrl} suggestedName={`${baseName(pdf.name)}-signed.pdf`} mimeType="application/pdf" t={t} /></section>}</div>
}

export function PdfSignatureVerify({ t }: { t: Translate }) {
  const [file, setFile] = useState<InputFile | null>(null)
  const [report, setReport] = useState<PdfSignatureVerification | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  async function choosePdf(event: ChangeEvent<HTMLInputElement>) {
    try { const next = await readFile(event); if (next) { await inspectPdf(next.bytes); setFile(next); setReport(null); setError('') } }
    catch (caught) { setFile(null); setError(message(caught, 'tool.pdfVerify.failed')) }
  }
  async function process() {
    if (!file) return
    setProcessing(true); setError(''); setReport(null)
    try { setReport(await verifyPdfSignatures(file.bytes)) }
    catch { setError('tool.pdfVerify.failed') }
    finally { setProcessing(false) }
  }
  return <div className="stack"><section className="settings-card stack"><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-signature-verify')} onChange={choosePdf} /></label><p className="privacy-note">{t('tool.pdf.local')}</p>{file && <strong>{file.name}</strong>}<Button className="primary" disabled={!file || processing} onClick={process}>{processing ? t('tool.pdf.processing') : t('tool.pdfVerify.action')}</Button>{error && <p className="error" role="alert">{t(error)}</p>}</section>
  {report && <section className="settings-card stack" aria-live="polite">{report.signatures.length === 0 ? <p className="warning">{t('tool.pdfVerify.none')}</p> : <><div className="signature-verdict"><strong>{t(report.allValid ? 'tool.pdfVerify.valid' : 'tool.pdfVerify.invalid')}</strong><span>{t(report.documentIntact ? 'tool.pdfVerify.intact' : 'tool.pdfVerify.changed')}</span></div>{report.signatures.map((signature, index) => <dl className="results" key={index}><div><dt>{t('tool.pdfVerify.signer')}</dt><dd>{signature.signer ?? '—'}</dd></div><div><dt>{t('tool.pdfVerify.coverage')}</dt><dd>{signature.coversWholeDocument ? '✓' : '✕'}</dd></div><div><dt>{t('tool.pdfVerify.trustUnknown')}</dt><dd>{signature.chainTrusted === true ? '✓' : '—'}</dd></div></dl>)}<p className="warning">{t('tool.pdfVerify.trustWarning')}</p></>}</section>}</div>
}
