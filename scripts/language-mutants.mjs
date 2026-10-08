import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'

const path = 'packages/i18n/src/common/es.ts'
const original = readFileSync(path)
const text = original.toString('utf8')
const clause = "'nav.main': 'Navegación principal',"
assert.equal(text.split(clause).length, 2)
const run = () => spawnSync(process.execPath, ['../../node_modules/vitest/vitest.mjs', 'run', 'src/language-contract.test.ts'], { cwd: 'apps/web', encoding: 'utf8', windowsHide: true })
const rootRun = () => spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'check'], { encoding: 'utf8', windowsHide: true })
assert.equal(run().status, 0, 'Language baseline failed')
try {
  const passed = []
  for (const [name, replacement, expected] of [
    ['missing-ui-key', '', /nav\.main/u],
    ['lone-surrogate-ui', "'nav.main': '\\ud800',", /Unicode|surrogate/u],
    ['extra-ui-key', clause + " 'audit.unexpected': 'extra',", /extra key|audit\.unexpected/u],
    ['changed-ui-placeholder', "'nav.main': 'Navegación {unexpected}',", /placeholders|nav\.main/u]
  ]) {
    writeFileSync(path, text.replace(clause, replacement))
    const result = rootRun()
    assert.equal(result.status, 1, result.stdout + result.stderr)
    assert.match(result.stdout + result.stderr, expected)
    passed.push({ name, exit: result.status })
  }
  console.log(JSON.stringify({ passed, regularRootGate: 'Actual complete npm run check invoked for each corrupted source; exact restoration in finally' }, null, 2))
} finally { writeFileSync(path, original) }
assert.equal(run().status, 0, 'Restored language baseline failed')
