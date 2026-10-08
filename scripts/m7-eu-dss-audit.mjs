import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { initSync, verify_pdf as verifyPdf } from '../packages/tools/src/pdf/m7-wasm/engine.js'

const root = resolve('test-assets/pdf/m7/external/eu-dss')
const wasm = await readFile(resolve('packages/tools/src/pdf/m7-wasm/engine_bg.wasm'))
initSync({ module: wasm })

const names = (await readdir(root)).filter((name) => name.endsWith('.pdf')).sort()
const manifest = JSON.parse(await readFile(resolve(root, 'expectations.json'), 'utf8'))
assert.deepEqual(names, manifest.fixtures.map((fixture) => fixture.name).sort(), 'Fixture set differs from manifest')
assert.equal(names.length, 13, 'The reference corpus must be complete')
assert.ok((await readFile(resolve(root, 'LICENSE.eu-dss.txt'))).length > 100)
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
      padesLevel: report.padesLevel,
      modificationKind: report.modificationKind,
      timestampCount: report.timestampCount,
      hasValidationMaterial: report.hasValidationMaterial,
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

const failures = []
for (const fixture of manifest.fixtures) {
  const result = results.find((item) => item.name === fixture.name)
  try {
    assert.equal(result.sha256, fixture.sha256, `${fixture.name}: original fixture changed`)
    assert.equal(result.parsed, true, `${fixture.name}: parser/setup failed`)
    for (const key of ['signatures', 'allValid', 'documentIntact', 'timestampCount']) {
      assert.equal(result[key], fixture.expected[key], `${fixture.name}: ${key}`)
    }
    assert.deepEqual(result.signaturesDetail.map((signature) => signature.valid), fixture.expected.valid, `${fixture.name}: CMS integrity`)
    assert.equal(result.signaturesDetail.filter((signature) => signature.timestamp).length, fixture.expected.timestampCount)
  } catch (error) { failures.push(error.message) }
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
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else console.error('PASS: 13 hash-bound DSS fixtures, CMS/document/timestamp expectations checked.')
