import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const logRoot = resolve('QM/83-ms1-ms7-2026-10-08')
const evidenceRoot = resolve('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7')
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const read = (path) => JSON.parse(readFileSync(path, 'utf8'))
const integrated = read(resolve(logRoot, 'verification-final.json'))
const corrected = read(resolve(logRoot, 'verification-root-final.json'))
const replacement = new Map(corrected.results.map((item) => [item.name, item]))
const stages = integrated.results.map((item) => replacement.get(item.name) ?? item)
if (stages.some((item) => item.exit !== 0)) throw new Error('A final stage is still failing')
const candidate = read(resolve(evidenceRoot, 'release-candidate.json'))
const record = (item) => {
  const bytes = readFileSync(resolve(logRoot, item.log))
  return { ...item, sha256: hash(bytes), tail: bytes.toString('utf8').slice(-6000) }
}
const other = ['a11y-browser', 'viewport-browser', 'rust-test'].map((name) => {
  const log = `${name}.log`
  const text = readFileSync(resolve(logRoot, log), 'utf8')
  const expected = name === 'a11y-browser'
    ? ['Audit passed (a11y, Schema light): 65 routes × 2 widths', 'Audit passed (a11y, Schema dark): 65 routes × 2 widths']
    : name === 'viewport-browser' ? ['Audit passed (overflow, Schema light): 65 routes']
      : ['12 passed', '38 passed']
  if (expected.some((marker) => !text.includes(marker))) throw new Error(`Missing success evidence: ${name}`)
  return { ...record({ name, log }), expected, scope: name === 'rust-test' ? 'Native tests after lockfile patches; five ignored tests remain' : 'Earlier full geometry matrix; subsequent menu change only adds Tab boundary handling, retested separately' }
})
const result = {
  schemaVersion: 1, recordedAt: new Date().toISOString(),
  sourceId: candidate.sourceId, sourceDigest: candidate.sourceDigest,
  distDigest: candidate.distDigest, wasm: candidate.wasm.sha256,
  status: 'local automated stages passed; overall independent acceptance incomplete',
  stages: stages.map(record), additionalEvidence: other,
  correction: { previous: integrated.results.filter((item) => item.exit !== 0), reason: 'OP-062 had been marked completed in the active list. Moved verbatim to a new archive; akte audit and subsequent complete root check/build pass.', replacement: corrected.results, previousResultSha256: hash(readFileSync(resolve(logRoot, 'verification-final.json'))), rawLogReuse: 'Repeated stages overwrite their named raw log. Previous exit remains recorded; the check log tail/hash here describes the successful replacement.' },
  limits: ['No independent A2', 'No actual GitHub or Cloudflare account run', 'No native picker, screen reader, touch or real zoom acceptance', 'D/E full photo/handover and specialist criteria remain open', 'Offline additional locale/build/old-profile combinations remain open', 'No publication; public read-only header measurement describes the previous deployment'],
  rawLogs: 'Local QM log files; hashes and bounded tails retained here. Re-run named scripts for new evidence.'
}
writeFileSync(resolve(evidenceRoot, 'proof-results.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ stages: stages.length, allAutomatedStagesPassed: true, additionalEvidence: other.length, status: result.status }))
