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
if (process.argv.includes('protect')) {
  const protection = await api('branches/main/protection', 'PUT', { required_status_checks: { strict: true, contexts: ['Releasepflicht'] }, enforce_admins: true, required_pull_request_reviews: null, restrictions: null, allow_force_pushes: false, allow_deletions: false })
  result.main = { requiredChecks: protection.required_status_checks.contexts, strict: protection.required_status_checks.strict, enforceAdmins: protection.enforce_admins.enabled, forcePushes: protection.allow_force_pushes.enabled, deletions: protection.allow_deletions.enabled }
}
if (process.argv.includes('runs')) {
  const list = await api('actions/runs?branch=audit-fertigstellung-2026-10-08&per_page=5')
  result.runs = list.workflow_runs.map((run) => ({ id: run.id, url: run.html_url, sha: run.head_sha, status: run.status, conclusion: run.conclusion }))
}
if (process.argv.includes('pr')) {
  const existing = await api('pulls?head=madventureXD:audit-fertigstellung-2026-10-08&state=open')
  const pr = existing[0] ?? await api('pulls', 'POST', { title: 'Audit-Sanierung: Reparaturen und überprüfbare Pflichtgates', head: 'audit-fertigstellung-2026-10-08', base: 'main', draft: true, body: 'Behebt Lizenzgate, Dateiauswahl-/URL-Lebenszyklus, Sprach-/Menüprüfung, Offlinecache, OCR-Worker und PDF-Wirkungsgates. Ergänzt SHA-gebundene Pflichtjobs, reproduzierbaren WASM-Bau und portable Gegenproben.\n\nLokale Prüfungen und konkrete noch nicht erfüllte Geräte-/Betriebskriterien stehen in uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/. Ein grüner lokaler Lauf ersetzt diese fehlenden Abnahmen nicht. Dieses PR ist der isolierte CI-Prüfweg; kein Merge oder Produktionspush.' })
  result.pullRequest = pr.html_url
}
const mode = ['protect', 'runs', 'pr'].find((value) => process.argv.includes(value))
writeFileSync(`uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-${mode}.json`, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
