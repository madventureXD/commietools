import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const directory = 'uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/'
const evidence = 'QM/83-ms1-ms7-2026-10-08/'
const results = JSON.parse(readFileSync(evidence + 'verification-final.json')).results
if (results.length !== 21 || results.some(({ exit }) => exit !== 0)) throw new Error('21 actual successful stages required')
const manifest = JSON.parse(readFileSync(directory + 'release-candidate.json'))
const record = { recordedAt: new Date().toISOString(), scope: 'Integrated local run, 21 stages; actual CI and public preview recorded separately. No native/device/production acceptance implied.', sourceId: manifest.sourceId, sourceDigest: manifest.sourceDigest, distDigest: manifest.distDigest, wasm: manifest.wasm, results: results.map((result) => {
  const bytes = readFileSync(evidence + result.log)
  return { ...result, logSha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, excerpt: bytes.toString('utf8').slice(-6000) }
}) }
writeFileSync(directory + 'abschluss-proof-results.json', JSON.stringify(record, null, 2) + '\n')
console.log('21 successful integrated stages frozen with log hashes and excerpts')
