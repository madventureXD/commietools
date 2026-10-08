import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'

const passed = []
for (const [mutant, expected] of [
  ['protect-noop', /independent reader did not demand a password/u],
  ['unlock-noop', /PasswordException|No password given/u],
  ['always-valid', /Manipulated signature falsely accepted/u]
]) {
  const result = spawnSync(process.execPath, ['scripts/pdf-browser-audit.mjs', mutant], { encoding: 'utf8', windowsHide: true, timeout: 180_000, maxBuffer: 5 * 1024 * 1024 })
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stdout + result.stderr, expected)
  passed.push({ mutant, exit: result.status })
}
console.log(JSON.stringify({ passed, scope: 'Isolated API effect substitutions in fixture; same independent reader and integrity assertions as mandatory PDF browser job' }, null, 2))
