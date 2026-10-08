import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const server = await startDistServer()
const browser = await starte({})
async function until(expression, description, limit = 120) {
  for (let attempt = 0; attempt < limit; attempt += 1) {
    if (await browser.evaluate(expression)) return
    await browser.warte(100)
  }
  throw new Error(`Timeout: ${description}`)
}
async function choose() {
  const document = await browser.send('DOM.getDocument')
  const input = await browser.send('DOM.querySelector', { nodeId: document.root.nodeId, selector: 'input[type=file]' })
  assert.ok(input.nodeId)
  await browser.send('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [resolve('test-assets/pdf/m7/sample.pdf')] })
  await until('!!document.querySelector(".pdf-document-facts")', 'PDF inspection')
}
try {
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: `navigator.serviceWorker.register = ((original) => (...args) => new Promise((resolve, reject) => setTimeout(() => original(...args).then(resolve, reject), 9000)))(navigator.serviceWorker.register.bind(navigator.serviceWorker)); window.__offlineReady = null; addEventListener('commietools-offline-readiness', event => { window.__offlineReady = event.detail });` })
  await browser.send('Page.navigate', { url: server.origin + '/tools/pdf-split' })
  await until('!!document.querySelector("input[type=file]")', 'first tool visit')
  await choose()
  assert.equal(await browser.evaluate('!!navigator.serviceWorker.controller'), false, 'Initial visit must precede delayed SW control')
  await until('window.__offlineReady?.status === "ready" && window.__offlineReady.urls.some(url => url.includes("PdfSplit")) && window.__offlineReady.urls.some(url => url.includes("pdf-"))', 'tool + language cache acknowledgement after late controller', 250)
  const readiness = await browser.evaluate('window.__offlineReady')
  await browser.evaluate(`window.__realCachePut = Cache.prototype.put; Cache.prototype.put = async () => { throw new DOMException('Quota test', 'QuotaExceededError') }; document.dispatchEvent(new Event('visibilitychange'))`)
  await until('window.__offlineReady?.status === "incomplete"', 'quota failure must revoke readiness', 250)
  await browser.evaluate(`Cache.prototype.put = window.__realCachePut; document.dispatchEvent(new Event('visibilitychange'))`)
  await until('window.__offlineReady?.status === "ready"', 'readiness recovery after quota probe', 250)
  await browser.send('Network.clearBrowserCache')
  await server.close()
  let unreachable = false
  try { await fetch(server.origin, { signal: AbortSignal.timeout(1500) }) } catch { unreachable = true }
  assert.equal(unreachable, true, 'Own HTTP server must really be stopped')
  await browser.send('Page.reload')
  await until('!!document.querySelector("input[type=file]")', 'offline reload')
  await choose()
  await browser.evaluate('document.querySelector("main button.primary").click()')
  await until('!!document.querySelector(".pdf-result-list")', 'actual offline PDF splitting')
  assert.equal(await browser.evaluate('!!document.querySelector(".error")'), false)
  await browser.evaluate(`(async () => { for (const name of await caches.keys()) { const cache = await caches.open(name); for (const request of await cache.keys()) if (request.url.includes('PdfSplit')) await cache.delete(request) } document.dispatchEvent(new Event('visibilitychange')) })()`)
  await browser.send('Network.clearBrowserCache')
  await until('window.__offlineReady?.status === "incomplete"', 'evicted tool chunk must revoke readiness', 250)
  console.log(JSON.stringify({ passed: 'First uncontrolled tool visit; SW delayed beyond old timeout; cache acknowledgements; quota failure revokes readiness and recovers; HTTP cache cleared; real server stopped; offline reload and actual PDF split; evicted tool chunk revokes readiness', readiness }, null, 2))
} finally { server.server.close(); await browser.ende() }
