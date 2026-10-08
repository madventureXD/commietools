import { spawn } from 'node:child_process'
import { startDistServer } from './belege/dist-server.mjs'

const service = await startDistServer()
const mode = process.argv[2] ?? 'a11y'
const run = (scheme) => new Promise((done, reject) => {
  const child = spawn(process.execPath, ['scripts/viewport-audit.mjs', mode], {
    env: { ...process.env, COMMIETOOLS_AUDIT_URL: service.origin, COMMIETOOLS_AUDIT_SCHEME: scheme }, stdio: 'inherit', windowsHide: true
  })
  child.once('error', reject); child.once('exit', done)
})
try {
  const results = mode === 'a11y' ? [await run('light'), await run('dark')] : [await run('light')]
  if (results.some((result) => result !== 0)) process.exitCode = 1
} finally { await service.close() }
