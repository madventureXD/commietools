import { PDFArray, PDFDocument, PDFName, PDFNumber, StandardFonts, type PDFObject } from 'pdf-lib'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { protectPdf, unlockPdf, repairPdfWithQpdf } from '../../../../packages/tools/src/pdf/m5'
import { certificateInputLimits, signPdfWithCertificate, verifyPdfSignatures } from '../../../../packages/tools/src/pdf/m7'

GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.mjs'
declare const __PDF_EFFECT_MUTANT__: string
function check(value: unknown, message: string): void { if (!value) throw new Error(message) }
async function contents(bytes: Uint8Array, password?: string): Promise<string[]> {
  const loading = getDocument({ data: new Uint8Array(bytes), password })
  try {
    const pdf = await loading.promise
    const pages: string[] = []
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const text = await (await pdf.getPage(number)).getTextContent()
      pages.push(text.items.map((item) => 'str' in item ? item.str : '').join(' '))
    }
    return pages
  } finally { await loading.destroy() }
}
export async function runPdfEffects(): Promise<string[]> {
  const passed: string[] = []
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  pdf.addPage().drawText('Fixture Page 1', { font })
  pdf.addPage().drawText('Fixture Page 2', { font })
  const source = await pdf.save({ useObjectStreams: false })
  const rejectsLimit = async (operation: Promise<unknown>) => {
    let rejected = false
    try { await operation } catch (error) { rejected = error instanceof RangeError && error.message.includes('input limit') }
    check(rejected, 'Oversized signature input reached the parser')
  }
  const oversized = new Uint8Array(certificateInputLimits.pdfBytes + 1)
  await rejectsLimit(verifyPdfSignatures(oversized))
  await rejectsLimit(signPdfWithCertificate(oversized, new Uint8Array(), ''))
  await rejectsLimit(signPdfWithCertificate(source, new Uint8Array(certificateInputLimits.keystoreBytes + 1), ''))
  for (const depth of [5, 64, 128]) {
    const nestedPdf = await PDFDocument.create(); nestedPdf.addPage()
    let object: PDFObject = PDFNumber.of(1)
    for (let level = 0; level < depth; level += 1) { const array = PDFArray.withContext(nestedPdf.context); array.push(object); object = array }
    nestedPdf.catalog.set(PDFName.of('AuditNested'), object)
    const bytes = await nestedPdf.save({ useObjectStreams: false })
    const started = performance.now()
    let outcome: string
    try { const report = await verifyPdfSignatures(bytes); check(report.signatures.length === 0, 'Nested unsigned fixture gained signatures'); outcome = 'returned unsigned report' }
    catch (error) { check(!(error instanceof WebAssembly.RuntimeError), 'Nesting trapped the WASM engine'); outcome = 'controlled error: ' + String(error) }
    check(performance.now() - started < 5000, 'Harmless nesting corpus exceeded five seconds')
    console.log(JSON.stringify({ parserProbe: 'lopdf 0.42.0; documented maximum nesting 100', depth, bytes: bytes.length, outcome, elapsedMs: performance.now() - started }))
  }
  const baseline = await contents(source)
  check(baseline.length === 2 && baseline[0]?.includes('Fixture Page 1'), 'Independent reader fixture invalid')
  const protectedPdf = __PDF_EFFECT_MUTANT__ === 'protect-noop' ? source : await protectPdf(source, { userPassword: 'test-user', ownerPassword: 'test-owner', printing: 'none', modification: 'none', allowExtraction: false }).catch((error: unknown) => { throw new Error('protect: ' + String(error)) })
  let locked = false
  try { await contents(protectedPdf) } catch (error) { locked = error instanceof Error && error.name === 'PasswordException' }
  check(locked, 'QPDF protect is a no-op: independent reader did not demand a password')
  check(JSON.stringify(await contents(protectedPdf, 'test-user')) === JSON.stringify(baseline), 'Protected document content changed')
  let wrong = false
  try { await unlockPdf(protectedPdf, 'wrong') } catch { wrong = true }
  check(wrong, 'QPDF accepted wrong password')
  const unlocked = __PDF_EFFECT_MUTANT__ === 'unlock-noop' ? protectedPdf : await unlockPdf(protectedPdf, 'test-user')
  check(JSON.stringify(await contents(unlocked)) === JSON.stringify(baseline), 'QPDF unlock is a no-op or changed content')
  passed.push('QPDF WASM: real AES protection, independent password demand, wrong password rejected, unlocked page/text content preserved')
  const original = Array.from(source, (byte) => String.fromCharCode(byte)).join('')
  const broken = original.replace(/\d{10} 00000 n/u, '0000000001 00000 n')
  check(broken !== original, 'No cross-reference entry was damaged')
  const brokenBytes = new Uint8Array([...broken].map((character) => character.charCodeAt(0)))
  const repaired = await repairPdfWithQpdf(brokenBytes).catch((error: unknown) => { throw new Error('repair: ' + String(error)) })
  check(JSON.stringify(await contents(repaired)) === JSON.stringify(baseline), 'QPDF repair did not preserve content')
  check(!new TextDecoder().decode(repaired).includes('0000000001 00000 n'), 'QPDF repair returned broken input unchanged')
  passed.push('QPDF WASM: damaged cross-reference repaired, independent page/text reader confirms result')
  const keystore = new Uint8Array(await (await fetch('/fixtures/keystore.p12')).arrayBuffer())
  const signed = await signPdfWithCertificate(source, keystore, 'password')
  const verified = await verifyPdfSignatures(signed)
  check(verified.signatures.length === 1 && verified.allValid && verified.documentIntact && verified.signatures[0]?.coversWholeDocument, 'Browser P12 signature roundtrip failed')
  check(!verified.allTrusted, 'Synthetic self-signed fixture was declared trusted')
  const manipulated = new Uint8Array(signed)
  const marker = new TextDecoder().decode(signed).indexOf('/MediaBox')
  check(marker > 0, 'No signed fixture marker')
  manipulated[marker + 1] = 88
  const rejected = await verifyPdfSignatures(manipulated)
  const allegedValid = __PDF_EFFECT_MUTANT__ === 'always-valid' ? true : rejected.allValid
  check(!allegedValid, 'Manipulated signature falsely accepted')
  passed.push('Shipped signature WASM: synthetic P12 signing, integrity/coverage, tampering rejected, trust remains unasserted')
  return passed
}
