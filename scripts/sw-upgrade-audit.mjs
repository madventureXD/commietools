import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const oldArtifact = JSON.parse(readFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-artifact-first.json')).artifact
const oldRoot = resolve(`tmp/github-artifact-${oldArtifact.run}/dist`)
const oldBuild = JSON.parse(readFileSync(resolve(oldRoot, 'build.json'))).buildId
const newBuild = JSON.parse(readFileSync('apps/web/dist/build.json')).buildId
assert.notEqual(oldBuild, newBuild, 'Two real distinct builds required')
let server = await startDistServer({ root: oldRoot })
const origin = server.origin
const port = Number(new URL(origin).port)
const browser = await starte({})
const record = { checkedAt: new Date().toISOString(), oldRevision: oldArtifact.sha, oldBuild, newBuild, oldArtifactArchive: oldArtifact.archiveSha256, scope: 'Real CI artifact A replaced by actual current dist B on same own origin, same disposable used browser profile; no synthetic SW/build response.', phases: [] }
const until = async (expression) => {
  for (let i = 0; i < 600; i++) { if (await browser.evaluate(expression)) return; await browser.warte(100) }
  throw new Error('SW upgrade timeout: ' + expression)
}
const locale = async (value) => {
  await browser.evaluate(`(() => {const el=document.querySelector('.language-select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await until(`document.documentElement.lang===${JSON.stringify(value)}`)
}
const split = async () => {
  await until('!!document.querySelector("main input[type=file]")')
  // The locale loader replaces the tool subtree; never keep a node from that transition.
  for (let attempt = 0; ; attempt++) {
    await browser.warte(250)
    const { root } = await browser.send('DOM.getDocument')
    const { nodeId } = await browser.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'main input[type=file]' })
    if (!nodeId) { if (attempt < 9) continue; throw new Error('PDF input unavailable after locale transition') }
    try { await browser.send('DOM.setFileInputFiles', { nodeId, files: [resolve('test-assets/pdf/m7/sample.pdf')] }); break }
    catch (error) { if (attempt >= 9 || !String(error).includes('Could not find node with given id')) throw error }
  }
  await until('!!document.querySelector(".pdf-document-facts")')
  await browser.evaluate('document.querySelector("main button.primary").click()')
  await until('!!document.querySelector(".pdf-result-list")')
}
try {
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__offlineReady=null;addEventListener('commietools-offline-readiness',event=>window.__offlineReady=event.detail)` })
  await browser.oeffne(origin + '/tools/inspection')
  await browser.evaluate('document.querySelector("main .download-row button").click()')
  await until('!!document.querySelector("main tbody input")')
  await browser.evaluate(`(() => {const el=document.querySelector('main tbody input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'Audit Altprofil ä日本');el.dispatchEvent(new Event('input',{bubbles:true}));})()`)
  await browser.warte(1000)
  await browser.oeffne(origin + '/tools/pdf-split')
  for (const value of ['de', 'en']) {
    await locale(value); await split()
    await until(`window.__offlineReady?.status==='ready' && window.__offlineReady.build===${JSON.stringify(oldBuild)} && window.__offlineReady.locale===${JSON.stringify(value)}`)
  }
  const unrequestedThirdLanguage = browser.anfragen.filter((url) => /\/(?:ui|tools|search)-es-/u.test(url))
  assert.deepEqual(unrequestedThirdLanguage, [])
  record.phases.push({ phase: 'old build warm', build: oldBuild, locales: ['de', 'en'], thirdLanguageRequests: unrequestedThirdLanguage })
  await server.close()
  server = await startDistServer({ port })
  await browser.evaluate(`window.__changedController=false;navigator.serviceWorker.addEventListener('controllerchange',()=>window.__changedController=true,{once:true})`)
  await browser.evaluate('navigator.serviceWorker.getRegistration().then(registration=>registration.update())')
  await until('window.__changedController===true')
  // autoUpdate may reload itself. Do not race that actual lifecycle with a second reload.
  await browser.warte(5000)
  if (await browser.evaluate(`window.__offlineReady?.build!==${JSON.stringify(newBuild)}`)) await browser.send('Page.reload')
  await until(`window.__offlineReady?.status==='ready' && window.__offlineReady.build===${JSON.stringify(newBuild)}`)
  for (const value of ['de', 'en']) {
    await locale(value); await split()
    await until(`window.__offlineReady?.status==='ready' && window.__offlineReady.locale===${JSON.stringify(value)}`)
  }
  record.phases.push({ phase: 'actual SW update and reload', readiness: await browser.evaluate('window.__offlineReady'), cacheNames: await browser.evaluate('caches.keys()') })
  await browser.oeffne(origin + '/tools/inspection')
  await until('document.querySelector("main tbody input")?.value === "Audit Altprofil ä日本"')
  record.phases.push({ phase: 'user data after update', storedName: await browser.evaluate('document.querySelector("main tbody input").value') })
  await browser.oeffne(origin + '/tools/pdf-split')
  await until(`window.__offlineReady?.status==='ready' && window.__offlineReady.build===${JSON.stringify(newBuild)}`)
  await browser.send('Network.clearBrowserCache')
  await server.close()
  await browser.send('Page.reload')
  await until('!!document.querySelector("main input[type=file]")')
  for (const value of ['de', 'en']) { await locale(value); await split(); record.phases.push({ phase: 'new build offline split', locale: value, httpCacheCleared: true, serverStopped: true }) }
  assert.deepEqual(browser.fehler, [])
  record.passed = true
} catch (error) {
  record.error = String(error)
  record.diagnostics = await browser.evaluate(`(async()=>({readiness:window.__offlineReady,caches:await caches.keys(),scripts:[...document.scripts].map(el=>el.src),registration:await navigator.serviceWorker.getRegistration().then(reg=>({active:reg?.active?.state,waiting:reg?.waiting?.state,installing:reg?.installing?.state})),changedController:window.__changedController}))()`)
  record.runtimeErrors = browser.fehler
  record.console = browser.consoleMessages
  throw error
} finally {
  await browser.ende(); server.server.close()
  writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/sw-upgrade.json', JSON.stringify(record, null, 2) + '\n')
}
console.log(JSON.stringify(record, null, 2))
