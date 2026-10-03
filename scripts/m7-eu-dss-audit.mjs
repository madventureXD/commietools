import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { initSync, verify_pdf as verifyPdf } from '../packages/tools/src/pdf/m7-wasm/engine.js'

const root = resolve('test-assets/pdf/m7/external/eu-dss')
const wasm = await readFile(resolve('packages/tools/src/pdf/m7-wasm/engine_bg.wasm'))
initSync({ module: wasm })

const names = (await readdir(root)).filter((name) => name.endsWith('.pdf')).sort()
const results = []
for (const name of names) {
  const bytes = await readFile(resolve(root, name))
  const base = {
    name,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  }
  try {
    const report = verifyPdf(bytes)
    results.push({
      ...base,
      parsed: true,
      signatures: report.signatures.length,
      allValid: report.allValid,
      documentIntact: report.documentIntact,
      signaturesDetail: report.signatures.map((signature) => ({
        valid: signature.valid,
        timestamp: signature.isTimestamp,
        coversWholeDocument: signature.coversWholeDocument,
        signer: signature.signer ?? null,
        detail: signature.detail
      }))
    })
  } catch (error) {
    results.push({ ...base, parsed: false, error: String(error) })
  }
}

const output = JSON.stringify({
  source: 'EU DSS',
  sourceCommit: 'c8aea1f90958a851f651fe39f1575fcbd6d4a11d',
  engine: 'pdf_signer 0.3.2 / CommieTools WASM',
  results
}, null, 2) + '\n'
if (process.argv.includes('--write')) {
  await writeFile(resolve(root, 'commietools-results.json'), output)
}
console.log(output)
