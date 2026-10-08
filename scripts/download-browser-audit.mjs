import { build } from 'esbuild'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { starte } from './belege/cdp-harness.mjs'

const output = resolve('tmp', `ms-download-${Date.now()}`); mkdirSync(output, { recursive: true })
const bundle = await build({ entryPoints: ['apps/web/src/test-fixtures/save-download.tsx'], bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } })
const server = createServer((request, response) => {
  response.setHeader('Content-Type', request.url === '/test.js' ? 'text/javascript' : 'text/html')
  response.end(request.url === '/test.js' ? bundle.outputFiles[0].contents : '<!doctype html><html><body><script src="/test.js"></script></body></html>')
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
let browser
try {
  browser = await starte({ download: output })
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: 'Object.defineProperty(window, "showSaveFilePicker", { value: undefined, configurable: true })' })
  await browser.oeffne(`http://127.0.0.1:${server.address().port}/`)
  for (let attempt = 0; attempt < 50 && !await browser.evaluate('!!document.querySelector("button")'); attempt += 1) await browser.warte(100)
  assert.deepEqual(browser.fehler, [])
  const rect = await browser.evaluate(`(() => { const r = document.querySelector('button').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
  await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...rect })
  await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...rect })
  const file = resolve(output, 'Prüfung-日本語.pdf')
  for (let attempt = 0; attempt < 100 && !existsSync(file); attempt += 1) await browser.warte(100)
  assert.equal(existsSync(file), true, 'Real browser download did not reach disk')
  const bytes = readFileSync(file)
  assert.deepEqual(bytes, Buffer.from([37, 80, 68, 70, 45, 49, 46, 55, 10, 0, 255]))
  assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ passed: 'Actual SaveFileControl, trusted browser click, fallback download, Unicode filename, bytes read back from disk', file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), nativePicker: 'not tested; deliberately disabled for fallback' }, null, 2))
} catch (error) { console.error(JSON.stringify({ errors: browser?.fehler, console: browser?.consoleMessages }, null, 2)); throw error }
finally { await browser?.ende(); server.close() }
