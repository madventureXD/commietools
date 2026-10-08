import { build } from 'esbuild'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { starte } from './belege/cdp-harness.mjs'

const mutant = process.argv[2] ?? ''
if (mutant && !['protect-noop', 'unlock-noop', 'always-valid'].includes(mutant)) throw new Error('Unknown PDF effect mutant')

const files = {
  '/assets/qpdf.wasm': 'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm',
  '/assets/engine.js': 'packages/tools/src/pdf/m7-wasm/engine.js',
  '/assets/engine_bg.wasm': 'packages/tools/src/pdf/m7-wasm/engine_bg.wasm',
  '/assets/pdf.worker.mjs': 'node_modules/pdfjs-dist/build/pdf.worker.mjs',
  '/fixtures/keystore.p12': 'test-assets/pdf/m7/keystore.p12'
}
const bundled = await build({ entryPoints: ['apps/web/src/test-fixtures/pdf-effects.ts'], bundle: true, write: false, format: 'esm', platform: 'browser', define: { __PDF_EFFECT_MUTANT__: JSON.stringify(mutant) }, external: ['fs', 'path'], plugins: [{
  name: 'wasm-urls', setup(api) {
    api.onResolve({ filter: /qpdf\.wasm\?url$/ }, () => ({ path: 'qpdf-wasm-url', namespace: 'url' }))
    api.onLoad({ filter: /.*/, namespace: 'url' }, () => ({ contents: 'export default "/assets/qpdf.wasm"', loader: 'js' }))
    api.onResolve({ filter: /m7-wasm\/engine\.js$/ }, () => ({ path: '/assets/engine.js', external: true }))
  }
}] })
const csp = readFileSync('apps/web/public/_headers', 'utf8').split(/\r?\n/u).find((line) => line.trimStart().startsWith('Content-Security-Policy:')).split('Content-Security-Policy: ')[1]
const server = createServer((request, response) => {
  response.setHeader('Content-Security-Policy', csp)
  response.setHeader('X-Content-Type-Options', 'nosniff')
  const url = request.url.split('?')[0]
  if (url in files) {
    response.setHeader('Content-Type', url.endsWith('.wasm') ? 'application/wasm' : /\.m?js$/u.test(url) ? 'text/javascript' : 'application/octet-stream')
    response.end(readFileSync(resolve(files[url])))
  } else if (url === '/test.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(bundled.outputFiles[0].contents) }
  else { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><script type="module" src="/test.js"></script>') }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
let browser
try {
  browser = await starte({})
  await browser.oeffne(`http://127.0.0.1:${server.address().port}/`)
  const result = await browser.evaluate(`(async () => { const m = await import('/test.js'); return m.runPdfEffects() })()`)
  assert.equal(result.length, 3)
  assert.deepEqual(browser.fehler, [])
  const parserProbes = browser.consoleMessages.filter((item) => item.text.includes('"parserProbe"')).map((item) => JSON.parse(item.text))
  assert.equal(parserProbes.length, 3)
  const external = browser.anfragen.filter((url) => !url.startsWith(`http://127.0.0.1:${server.address().port}/`) && !url.startsWith('blob:') && !url.startsWith('data:'))
  assert.deepEqual(external, [])
  console.log(JSON.stringify({ csp, passed: result, parserProbes, oversizedInputProbes: 'PDF signing/verification >100 MiB and PKCS#12 >16 MiB rejected before WASM copy', externalBrowserRequests: 0 }, null, 2))
} catch (error) {
  console.error(JSON.stringify(browser?.consoleMessages ?? [], null, 2))
  throw error
} finally { await browser?.ende(); server.close() }
