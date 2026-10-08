import { build } from 'esbuild'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { starte } from './belege/cdp-harness.mjs'

mkdirSync(resolve('tmp/ocr-audit'), { recursive: true })
const models = {}; const provenance = []
for (const lang of ['eng', 'deu', 'spa']) {
  const source = `https://tessdata.projectnaptha.com/4.0.0_fast/${lang}.traineddata.gz`
  const modelPath = resolve(`tmp/ocr-audit/${lang}.traineddata.gz`)
  if (!existsSync(modelPath)) {
    const response = await fetch(source, { signal: AbortSignal.timeout(60_000) })
    assert.equal(response.ok, true)
    writeFileSync(modelPath, Buffer.from(await response.arrayBuffer()))
  }
  models[lang] = readFileSync(modelPath)
  provenance.push({ lang, source, sha256: createHash('sha256').update(models[lang]).digest('hex') })
}
const bundled = await build({ entryPoints: ['apps/web/src/test-fixtures/ocr-effects.ts'], bundle: true, write: false, format: 'esm', platform: 'browser', plugins: [{
  name: 'worker-url', setup(api) {
    api.onResolve({ filter: /worker\.min\.js\?url$/ }, () => ({ path: 'ocr-url', namespace: 'url' }))
    api.onLoad({ filter: /.*/, namespace: 'url' }, () => ({ contents: 'export default "/worker.js"', loader: 'js' }))
  }
}] })
const csp = readFileSync('apps/web/public/_headers', 'utf8').split(/\r?\n/u).find((line) => line.trimStart().startsWith('Content-Security-Policy:')).split('Content-Security-Policy: ')[1]
let delayed = false; const blocked = new Set(); const goodDownloads = { eng: 0, deu: 0, spa: 0 }
const server = createServer((request, response) => {
  response.setHeader('Content-Security-Policy', csp)
  response.setHeader('X-Content-Type-Options', 'nosniff')
  const url = request.url.split('?')[0]
  if (url.startsWith('/core/') && /^[a-z0-9.-]+$/u.test(basename(url))) {
    const path = resolve('node_modules/tesseract.js-core', basename(url))
    if (!existsSync(path)) { response.writeHead(404); response.end(); return }
    response.setHeader('Content-Type', url.endsWith('.wasm') ? 'application/wasm' : 'text/javascript'); response.end(readFileSync(path))
  } else if (url === '/worker.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(readFileSync('node_modules/tesseract.js/dist/worker.min.js')) }
  else if (url === '/test.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(bundled.outputFiles[0].contents) }
  else if (url === '/broken/eng.traineddata.gz') { response.end(gzipSync(Buffer.from('invalid training data'))) }
  else if (url === '/delayed/eng.traineddata.gz') { delayed = true; /* Intentionally pending until worker cancellation; closed with server. */ }
  else if (url === '/delayed-status') { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(delayed)) }
  else if (url === '/block-model') { blocked.add(new URL(request.url, 'http://localhost').searchParams.get('lang')); response.end() }
  else if (/^\/good\/(eng|deu|spa)\.traineddata\.gz$/u.test(url)) { const lang = url.match(/(eng|deu|spa)\.traineddata/u)[1]; if (blocked.has(lang)) response.writeHead(503); else goodDownloads[lang] += 1; response.end(blocked.has(lang) ? '' : models[lang]) }
  else { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><script type="module" src="/test.js"></script>') }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
let browser
try {
  browser = await starte({})
  await browser.oeffne(`http://127.0.0.1:${server.address().port}/`)
  const passed = await browser.evaluate(`(async () => { const m = await import('/test.js'); return m.runOcrEffects() })()`)
  assert.equal(passed.length, 3); assert.deepEqual(goodDownloads, { eng: 1, deu: 1, spa: 1 }); assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ csp, models: provenance, passed, goodDownloads }, null, 2))
} catch (error) { console.error(JSON.stringify(browser?.consoleMessages ?? [], null, 2)); throw error }
finally { await browser?.ende(); server.closeAllConnections(); server.close() }
