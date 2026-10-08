import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const service = await startDistServer()
const browser = await starte({})
const passed = []
const until = async (expression, limit = 250) => {
  for (let n = 0; n < limit; n += 1) { if (await browser.evaluate(expression)) return; await browser.warte(100) }
  throw new Error('Offline locale timeout: ' + expression)
}
const locale = async (value) => {
  await browser.evaluate(`(()=>{const e=document.querySelector('.language-select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await until(`document.documentElement.lang===${JSON.stringify(value)} && !!document.querySelector('main input[type=file]')`)
}
const split = async () => {
  const doc = await browser.send('DOM.getDocument'); const input = await browser.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'main input[type=file]' })
  await browser.send('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [resolve('test-assets/pdf/m7/sample.pdf')] })
  await until('!!document.querySelector(".pdf-document-facts")')
  await browser.evaluate('document.querySelector("main button.primary").click()')
  await until('!!document.querySelector(".pdf-result-list")')
}
try {
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__offlineReady=null;addEventListener('commietools-offline-readiness',event=>window.__offlineReady=event.detail)` })
  await browser.oeffne(service.origin + '/tools/pdf-split')
  for (const value of ['de', 'en', 'es']) {
    await locale(value); await split()
    await until(`window.__offlineReady?.status==='ready' && window.__offlineReady.locale===${JSON.stringify(value)}`)
  }
  await browser.send('Network.clearBrowserCache'); await service.close()
  let stopped = false
  try { await fetch(service.origin, { signal: AbortSignal.timeout(1500) }) } catch { stopped = true }
  assert.equal(stopped, true)
  await browser.send('Page.reload')
  await until('!!document.querySelector("main input[type=file]")')
  for (const value of ['es', 'de', 'en']) { await locale(value); await split(); assert.equal(await browser.evaluate('!!document.querySelector("main .error")'), false); passed.push({ locale: value, actualOfflinePdfSplit: true, httpCacheCleared: true, ownServerStopped: true }) }
  assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ passed, build: JSON.parse(readFileSync('apps/web/dist/build.json', 'utf8')).buildId, profile: 'previously used same browser profile; all three UI locales warmed before disconnection' }, null, 2))
} finally { await browser.ende(); service.server.close() }
