import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { buildIdentity } from './build-identity.mjs'

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const root = resolve('.')
const files = []
const walk = (relative = '') => {
  for (const entry of readdirSync(join(root, 'apps/web/dist', relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = relative ? `${relative}/${entry.name}` : entry.name
    if (entry.isDirectory()) walk(path)
    else { const bytes = readFileSync(join(root, 'apps/web/dist', path)); files.push({ path, bytes: bytes.length, sha256: hash(bytes) }) }
  }
}
walk()
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const sourceId = buildIdentity(root)
const built = JSON.parse(readFileSync('apps/web/dist/build.json', 'utf8'))
if (sourceId !== built.buildId) throw new Error('Dist is stale for current source; rebuild before freezing')
const sourceFiles = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0'))]
  .filter((path) => path && existsSync(path) && (/^(apps|packages|crates|scripts|licenses|test-assets|\.github|\.cargo)\//u.test(path) || !path.includes('/')))
  .sort().map((path) => ({ path, sha256: hash(readFileSync(path)) }))
const provenance = {
  schemaVersion: 1, sourceRevision: revision, sourceId,
  workingTreeHasChanges: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
  sourceDigest: hash(JSON.stringify(sourceFiles)), sourceFiles,
  locks: ['package-lock.json', 'crates/pdf-signer-engine/Cargo.lock', 'crates/pdf-signer-wasm/Cargo.lock'].map((path) => ({ path, sha256: hash(readFileSync(path)) })),
  wasm: { path: 'packages/tools/src/pdf/m7-wasm/engine_bg.wasm', sha256: hash(readFileSync('packages/tools/src/pdf/m7-wasm/engine_bg.wasm')) },
  toolchain: JSON.parse(readFileSync('licenses/rust-components.json', 'utf8')).grundlage.werkzeuge,
  distDigest: hash(JSON.stringify(files)), files,
  taskAuthorization: 'MS1–MS7 authorized by user; no repeat approval required within scope',
  releaseApproval: 'scope authorized; independent release conditions still outstanding', independentA2: 'not-recorded', deployment: null
}
const path = process.argv[2] ?? 'uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/release-candidate.json'
writeFileSync(path, JSON.stringify(provenance, null, 2) + '\n')
console.log(JSON.stringify({ sourceId, distDigest: provenance.distDigest, files: files.length, workingTreeHasChanges: provenance.workingTreeHasChanges }))
