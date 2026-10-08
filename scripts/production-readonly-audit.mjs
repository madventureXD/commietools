import { writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const origin = 'https://commietools.org'
const responses = []
for (const path of ['/', '/licenses', '/impressum', '/build.json', '/licenses/registry.json']) {
  const response = await fetch(origin + path, { redirect: 'follow', signal: AbortSignal.timeout(30_000) })
  const bytes = Buffer.from(await response.arrayBuffer())
  const headers = Object.fromEntries([...response.headers].filter(([name]) => ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'nel', 'report-to', 'reporting-endpoints', 'content-type', 'cache-control', 'cf-ray', 'etag'].includes(name)))
  responses.push({ path, finalUrl: response.url, status: response.status, headers, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
}
const record = { observedAt: new Date().toISOString(), origin, scope: 'Read-only requests to the existing public deployment; no deployment of the current candidate; no old browser profile/NEL receiver inspection', responses }
writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/production-readonly.json', JSON.stringify(record, null, 2) + '\n')
console.log(JSON.stringify(record, null, 2))
