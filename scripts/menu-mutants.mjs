import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { startDistServer } from './belege/dist-server.mjs'

const server = await startDistServer()
const run = (mutant) => new Promise((done, reject) => {
  let output = ''
  const child = spawn(process.execPath, ['scripts/viewport-audit.mjs', 'a11y'], { env: { ...process.env,
    COMMIETOOLS_AUDIT_URL: server.origin, COMMIETOOLS_AUDIT_ROUTES: '/tools/pdf-split', COMMIETOOLS_AUDIT_WIDTHS: '390',
    COMMIETOOLS_AUDIT_SCHEME: 'light', COMMIETOOLS_AUDIT_MUTANT: mutant
  }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', (data) => { output += data }); child.stderr.on('data', (data) => { output += data })
  child.once('error', reject); child.once('exit', (exit) => done({ exit, output }))
})
try {
  const baseline = await run(''); assert.equal(baseline.exit, 0, baseline.output)
  const passed = []
  for (const mutant of ['wrong-trigger', 'small-menu-target']) {
    const result = await run(mutant); assert.equal(result.exit, 1, result.output)
    assert.match(result.output, mutant === 'wrong-trigger' ? /Menu is not an open modal dialog/u : /MenueZiele<44=1/u)
    passed.push({ mutant, exit: result.exit })
  }
  console.log(JSON.stringify({ baseline: baseline.exit, passed }, null, 2))
} finally { await server.close() }
