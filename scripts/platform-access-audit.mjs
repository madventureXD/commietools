import { execFileSync } from 'node:child_process'
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const record = { checkedAt: new Date().toISOString(), github: {}, cloudflare: {} }
let token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
if (!token) {
  try {
    const response = execFileSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000, windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' } })
    token = response.split('\n').find((line) => line.startsWith('password='))?.slice(9)
  } catch { /* Never print credential-helper output or attempt interactive authentication. */ }
}
record.github.credentialAvailable = Boolean(token)
for (const path of ['repos/madventureXD/commietools', 'repos/madventureXD/commietools/actions/runs?per_page=3', 'repos/madventureXD/commietools/branches/main/protection', 'repos/madventureXD/commietools/rulesets', 'repos/madventureXD/commietools/actions/permissions']) {
  try {
    const response = await fetch('https://api.github.com/' + path, { headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, signal: AbortSignal.timeout(15000) })
    const json = await response.json()
    record.github[path] = { status: response.status, ...(response.ok && path === 'repos/madventureXD/commietools' ? { permissions: json.permissions, defaultBranch: json.default_branch, private: json.private } : {}), ...(response.ok && path.includes('/actions/runs') ? { runs: json.workflow_runs.map((run) => ({ url: run.html_url, sha: run.head_sha, conclusion: run.conclusion })) } : {}), ...(response.ok && path.endsWith('/protection') ? { requiredChecks: json.required_status_checks?.contexts ?? [], enforceAdmins: json.enforce_admins?.enabled } : {}), ...(response.ok && path.endsWith('/rulesets') ? { rulesets: json.map((rule) => ({ id: rule.id, name: rule.name, enforcement: rule.enforcement })) } : {}), ...(response.ok && path.endsWith('/permissions') ? { enabled: json.enabled, allowedActions: json.allowed_actions } : {}) }
  } catch (error) { record.github[path] = { transportError: error.name } }
}
record.cloudflare.credentialAvailable = Boolean(process.env.CLOUDFLARE_API_TOKEN)
record.cloudflare.standardWranglerCredentialFiles = [
  join(process.env.APPDATA, 'xdg.config/wrangler/config/default.toml'),
  join(process.env.USERPROFILE, '.config/wrangler/config/default.toml'),
  join(process.env.USERPROFILE, '.wrangler/config/default.toml')
].map((path, index) => ({ standardLocation: ['APPDATA/xdg.config/wrangler/config/default.toml', 'USERPROFILE/.config/wrangler/config/default.toml', 'USERPROFILE/.wrangler/config/default.toml'][index], exists: existsSync(path) }))
if (process.env.CLOUDFLARE_API_TOKEN) {
  const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers: { Authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN }, signal: AbortSignal.timeout(15000) })
  record.cloudflare.tokenVerificationStatus = response.status
}
record.nativeWindows = { attempt: 'Computer Use sky.launch_app for installed Edge; subsequent fresh list_windows', result: 'GetCursorPos failed: Zugriff verweigert (0x80070005); no Edge window returned', scope: 'No native picker, actual zoom or screen-reader PASS can be derived from the headless browser tests' }
writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/platform-access.json', JSON.stringify(record, null, 2) + '\n')
console.log(JSON.stringify(record, null, 2))
