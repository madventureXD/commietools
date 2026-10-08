import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'

const componentsPath = 'licenses/rust-components.json'
const reviewsPath = 'licenses/rust-review.json'
const componentsBytes = readFileSync(componentsPath)
const reviewsBytes = readFileSync(reviewsPath)
const audit = () => spawnSync(process.execPath, ['scripts/license-audit.mjs', 'rust-check'], { encoding: 'utf8' })
assert.equal(audit().status, 0, 'Baseline must pass before mutation evidence counts')
const passed = []
try {
  const components = JSON.parse(componentsBytes)
  components.komponenten.find((component) => component.name === 'pdf_signer').license = 'LicenseRef-Forbidden'
  writeFileSync(componentsPath, JSON.stringify(components))
  const forbidden = audit()
  assert.equal(forbidden.status, 1)
  assert.match(forbidden.stderr, /LicenseRef-Forbidden/u)
  passed.push('Same name/version with forbidden replacement license: rejected')
  writeFileSync(componentsPath, componentsBytes)
  const pending = JSON.parse(reviewsBytes)
  for (const review of pending.review) { review.status = 'pending'; review.needsDecision = true }
  writeFileSync(reviewsPath, JSON.stringify(pending))
  const decisions = audit()
  assert.equal(decisions.status, 1)
  assert.match(decisions.stderr, /Entscheidung pending/u)
  passed.push('Every decision pending: rejected')
  const expired = JSON.parse(reviewsBytes)
  for (const review of expired.review.filter((review) => review.purposes?.includes('notice'))) review.expiresAt = '2000-01-01'
  writeFileSync(reviewsPath, JSON.stringify(expired))
  const notices = audit()
  assert.equal(notices.status, 1)
  assert.match(notices.stderr, /Originalhinweis fehlt und ist nicht entschieden/u)
  passed.push('Expired notice exceptions: rejected')
} finally { writeFileSync(componentsPath, componentsBytes); writeFileSync(reviewsPath, reviewsBytes) }
assert.equal(audit().status, 0, 'Restored original gate must pass')
console.log(JSON.stringify({ passed, originalBytesRestored: true }, null, 2))
