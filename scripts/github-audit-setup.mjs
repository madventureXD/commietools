import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'

let token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
if (!token) {
  const credentials = execFileSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000, windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' } })
  token = credentials.split('\n').find((line) => line.startsWith('password='))?.slice(9)
}
if (!token) throw new Error('No existing authenticated GitHub credential')
const api = async (path, method = 'GET', body) => {
  const response = await fetch('https://api.github.com/repos/madventureXD/commietools/' + path, { method, headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) })
  const json = await response.json()
  if (!response.ok) throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}, ${json.message}`)
  return json
}
const result = { checkedAt: new Date().toISOString() }
if (process.argv.includes('sources')) {
  const delivery = JSON.parse(readFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-delivery.json'))
  const check = delivery.delivery.checks.find((item) => item.name === 'Cloudflare Pages' && item.conclusion === 'success')
  const origin = check?.output.summary.match(/https:\/\/[a-z0-9]+\.commietools\.pages\.dev/u)?.[0]
  if (!origin) throw new Error('Successful own preview required')
  const response = await fetch(origin + '/licenses/registry.json', { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error('Public registry unavailable')
  const registry = await response.json()
  const signer = registry.artifacts.find((item) => item.id === 'pdf-signer-wasm-0.3.2')
  const revision = signer.source.match(/\/tree\/([a-f0-9]{40})\/crates\/pdf-signer-engine$/u)?.[1]
  if (!revision || !signer.build.includes('/blob/' + revision + '/crates/pdf-signer-wasm/README.md')) throw new Error('Published modified source and build link must share immutable revision')
  const tree = await api(`git/trees/${revision}?recursive=1`)
  if (tree.truncated) throw new Error('Complete source tree required')
  const paths = ['crates/pdf-signer-engine/Cargo.toml', 'crates/pdf-signer-engine/Cargo.lock', 'crates/pdf-signer-engine/src/lib.rs', 'crates/pdf-signer-wasm/Cargo.toml', 'crates/pdf-signer-wasm/Cargo.lock', 'crates/pdf-signer-wasm/src/lib.rs', 'crates/pdf-signer-wasm/README.md', 'scripts/build-signer.mjs']
  const files = []
  const normalize = (bytes) => bytes.toString('utf8').replaceAll('\r\n', '\n')
  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
  for (const path of paths) {
    const file = await api(`contents/${path}?ref=${revision}`)
    const bytes = Buffer.from(file.content, 'base64')
    if (normalize(bytes) !== normalize(readFileSync(path))) throw new Error('Published build/source differs: ' + path)
    files.push({ path, gitBlob: file.sha, publicSha256: hash(bytes), currentSourceEqualIgnoringCheckoutLineEndings: true })
  }
  const qpdf = registry.artifacts.find((item) => item.id === 'qpdf-wasm-12.2.0')
  const upstreamResources = []
  for (const [url, expected] of [[qpdf.source, '0.3.0'], [qpdf.build.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/'), '12.2.0']]) {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
    const bytes = Buffer.from(await response.arrayBuffer())
    if (response.status !== 200 || !bytes.toString('utf8').includes(expected)) throw new Error('Wrong upstream source/build resource: ' + url)
    upstreamResources.push({ url, status: response.status, expectedContent: expected, sha256: hash(bytes), bytes: bytes.length })
  }
  result.sources = { deploymentRevision: delivery.delivery.sha, publishedSourceRevision: revision, origin, source: signer.source, build: signer.build, wasmSha256: signer.sha256, engineSourceFiles: tree.tree.filter((item) => item.type === 'blob' && item.path.startsWith('crates/pdf-signer-engine/')).length, files, upstreamResources, scope: 'Actual published registry links and immutable GitHub source/build instructions; no upstream-only link substituted for modified GPL sources. QPDF release and pinned Dockerfile are actual upstream resources, not own SPA fallback.' }
}
if (process.argv.includes('artifact')) {
  const delivery = JSON.parse(readFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-delivery.json'))
  const sha = delivery.delivery.sha
  const check = delivery.delivery.checks.find((check) => check.name === 'Cloudflare Pages' && check.conclusion === 'success')
  const origin = check?.output.summary.match(/https:\/\/[a-z0-9]+\.commietools\.pages\.dev/u)?.[0]
  if (!origin) throw new Error('Successful immutable preview required')
  const list = await api('actions/runs?branch=audit-fertigstellung-2026-10-08&per_page=10')
  const run = list.workflow_runs.find((run) => run.head_sha === sha)
  if (!run) throw new Error('Matching actual CI run required')
  const artifacts = await api(`actions/runs/${run.id}/artifacts`)
  const artifact = artifacts.artifacts.find((artifact) => artifact.name === 'checked-dist' && !artifact.expired)
  if (!artifact) throw new Error('Actual checked-dist artifact required')
  const response = await fetch(artifact.archive_download_url, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`Artifact HTTP ${response.status}`)
  const directory = resolve(`tmp/github-artifact-${run.id}`)
  mkdirSync(directory, { recursive: true })
  const zip = join(directory, 'artifact.zip')
  const bytes = Buffer.from(await response.arrayBuffer())
  writeFileSync(zip, bytes)
  const dist = join(directory, 'dist'); mkdirSync(dist, { recursive: true })
  execFileSync('tar.exe', ['-xf', zip, '-C', dist], { windowsHide: true, stdio: 'pipe' })
  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
  const files = []
  const walk = (relative = '') => {
    for (const entry of readdirSync(join(dist, relative), { withFileTypes: true })) {
      const path = relative ? relative + '/' + entry.name : entry.name
      if (entry.isDirectory()) walk(path)
      else files.push({ path, sha256: hash(readFileSync(join(dist, path))) })
    }
  }
  walk()
  const controls = ['_headers', '_redirects', '_routes.json']
  const publicFiles = files.filter(({ path }) => !controls.includes(path))
  let next = 0
  const differences = []
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < publicFiles.length) {
      const file = publicFiles[next++]
      const response = await fetch(origin + '/' + file.path, { signal: AbortSignal.timeout(30000) })
      const bytes = Buffer.from(await response.arrayBuffer())
      if (response.status !== 200 || hash(bytes) !== file.sha256) differences.push({ path: file.path, status: response.status, ciSha256: file.sha256, publicSha256: hash(bytes) })
    }
  }))
  result.artifact = { sha, run: run.id, origin, archiveSha256: hash(bytes), checkedFiles: publicFiles.length, hostingControlFiles: files.filter(({ path }) => controls.includes(path)), differences, scope: 'Every public dist file compared against actual checked-dist CI archive; hosting control files consumed by provider are separately identified. Preview, not production.' }
}
if (process.argv.includes('logs')) {
  const list = await api('actions/runs?branch=audit-fertigstellung-2026-10-08&per_page=5')
  const failed = []
  for (const run of list.workflow_runs) {
    const jobs = await api(`actions/runs/${run.id}/jobs`)
    for (const job of jobs.jobs.filter((job) => job.conclusion === 'failure')) failed.push(job)
  }
  for (const failedJob of failed) {
  const job = failedJob.id
  const response = await fetch(`https://api.github.com/repos/madventureXD/commietools/actions/jobs/${job}/logs`, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Job logs HTTP ${response.status}`)
  const logs = await response.text()
  writeFileSync(`QM/83-ms1-ms7-2026-10-08/github-failed-${job}.log`, logs)
  console.log(logs.slice(-16000))
  }
}
if (process.argv.includes('delivery')) {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const checks = await api(`commits/${sha}/check-runs`)
  const status = await api(`commits/${sha}/status`)
  const deployments = await api(`deployments?sha=${sha}`)
  const comments = await api('issues/1/comments')
  result.delivery = { sha, checks: checks.check_runs.map(({ name, conclusion, details_url, output }) => ({ name, conclusion, details_url, output })), comments: comments.map(({ body, html_url }) => ({ body, html_url })), statuses: status.statuses.map(({ context, state, target_url }) => ({ context, state, target_url })), deployments: [] }
  for (const deployment of deployments) {
    const statuses = await api(`deployments/${deployment.id}/statuses`)
    result.delivery.deployments.push({ id: deployment.id, environment: deployment.environment, statuses: statuses.map(({ state, environment_url, log_url }) => ({ state, environment_url, log_url })) })
  }
}
if (process.argv.includes('protect')) {
  const protection = await api('branches/main/protection', 'PUT', { required_status_checks: { strict: true, contexts: ['Releasepflicht'] }, enforce_admins: true, required_pull_request_reviews: null, restrictions: null, allow_force_pushes: false, allow_deletions: false })
  result.main = { requiredChecks: protection.required_status_checks.contexts, strict: protection.required_status_checks.strict, enforceAdmins: protection.enforce_admins.enabled, forcePushes: protection.allow_force_pushes.enabled, deletions: protection.allow_deletions.enabled }
}
if (process.argv.includes('runs')) {
  const list = await api('actions/runs?branch=audit-fertigstellung-2026-10-08&per_page=5')
  result.runs = []
  for (const run of list.workflow_runs) {
    const jobs = await api(`actions/runs/${run.id}/jobs`)
    result.runs.push({ id: run.id, url: run.html_url, sha: run.head_sha, status: run.status, conclusion: run.conclusion, jobs: jobs.jobs.map((job) => ({ id: job.id, name: job.name, status: job.status, conclusion: job.conclusion, activeSteps: job.steps.filter((step) => step.status === 'in_progress').map((step) => step.name), failedSteps: job.steps.filter((step) => step.conclusion === 'failure').map((step) => step.name) })) })
  }
}
if (process.argv.includes('pr')) {
  const existing = await api('pulls?head=madventureXD:audit-fertigstellung-2026-10-08&state=open')
  const pr = existing[0] ?? await api('pulls', 'POST', { title: 'Audit-Sanierung: Reparaturen und überprüfbare Pflichtgates', head: 'audit-fertigstellung-2026-10-08', base: 'main', draft: true, body: 'Behebt Lizenzgate, Dateiauswahl-/URL-Lebenszyklus, Sprach-/Menüprüfung, Offlinecache, OCR-Worker und PDF-Wirkungsgates. Ergänzt SHA-gebundene Pflichtjobs, reproduzierbaren WASM-Bau und portable Gegenproben.\n\nLokale Prüfungen und konkrete noch nicht erfüllte Geräte-/Betriebskriterien stehen in uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/. Ein grüner lokaler Lauf ersetzt diese fehlenden Abnahmen nicht. Dieses PR ist der isolierte CI-Prüfweg; kein Merge oder Produktionspush.' })
  result.pullRequest = pr.html_url
}
const mode = ['protect', 'runs', 'pr', 'logs', 'delivery', 'artifact', 'sources'].find((value) => process.argv.includes(value))
writeFileSync(`uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-${mode}.json`, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
if (result.artifact?.differences.length) process.exitCode = 1
