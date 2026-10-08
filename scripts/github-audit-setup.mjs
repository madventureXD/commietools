import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

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
    result.runs.push({ id: run.id, url: run.html_url, sha: run.head_sha, status: run.status, conclusion: run.conclusion, jobs: jobs.jobs.map((job) => ({ id: job.id, name: job.name, status: job.status, conclusion: job.conclusion, failedSteps: job.steps.filter((step) => step.conclusion === 'failure').map((step) => step.name) })) })
  }
}
if (process.argv.includes('pr')) {
  const existing = await api('pulls?head=madventureXD:audit-fertigstellung-2026-10-08&state=open')
  const pr = existing[0] ?? await api('pulls', 'POST', { title: 'Audit-Sanierung: Reparaturen und überprüfbare Pflichtgates', head: 'audit-fertigstellung-2026-10-08', base: 'main', draft: true, body: 'Behebt Lizenzgate, Dateiauswahl-/URL-Lebenszyklus, Sprach-/Menüprüfung, Offlinecache, OCR-Worker und PDF-Wirkungsgates. Ergänzt SHA-gebundene Pflichtjobs, reproduzierbaren WASM-Bau und portable Gegenproben.\n\nLokale Prüfungen und konkrete noch nicht erfüllte Geräte-/Betriebskriterien stehen in uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/. Ein grüner lokaler Lauf ersetzt diese fehlenden Abnahmen nicht. Dieses PR ist der isolierte CI-Prüfweg; kein Merge oder Produktionspush.' })
  result.pullRequest = pr.html_url
}
const mode = ['protect', 'runs', 'pr', 'logs', 'delivery'].find((value) => process.argv.includes(value))
writeFileSync(`uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-${mode}.json`, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
