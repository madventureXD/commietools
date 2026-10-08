import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const output = resolve('tmp/craft-audit'); mkdirSync(output, { recursive: true })
const photoPath = resolve(output, 'Canon_40D.jpg')
const source = 'https://raw.githubusercontent.com/ianare/exif-samples/master/jpg/Canon_40D.jpg'
if (!existsSync(photoPath)) {
  const response = await fetch(source, { signal: AbortSignal.timeout(30_000) }); assert.equal(response.ok, true)
  writeFileSync(photoPath, Buffer.from(await response.arrayBuffer()))
}
const sourceBytes = readFileSync(photoPath)
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
assert.equal(hash(sourceBytes), '6bfdabd4fc33d112283c147acccc574e770bbe6fbdbc3d4da968ba7b606ecc2f', 'Foreign EXIF fixture changed; review original provenance before accepting new bytes')
const bundle = await build({ entryPoints: ['apps/web/src/test-fixtures/craft-reader.ts'], bundle: true, write: false, format: 'esm', platform: 'browser' })
const service = await startDistServer({ auditFiles: {
  '/audit-reader.js': { type: 'text/javascript', bytes: bundle.outputFiles[0].contents },
  '/audit-pdf-worker.mjs': { type: 'text/javascript', bytes: readFileSync('node_modules/pdfjs-dist/build/pdf.worker.mjs') },
  '/audit-photo.jpg': { type: 'image/jpeg', bytes: sourceBytes }
} })
const browser = await starte({ download: output })
const passed = []
const until = async (expression, limit = 200) => {
  for (let n = 0; n < limit; n += 1) { if (await browser.evaluate(expression)) return; await browser.warte(100) }
  throw new Error('Craft state timeout: ' + expression)
}
const set = async (selector, value) => {
  await browser.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) throw Error('Missing '+${JSON.stringify(selector)}); const type=e.tagName==='SELECT'?HTMLSelectElement:HTMLInputElement; Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(e,${JSON.stringify(value)}); e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true})); })()`)
  await browser.warte(100)
}
const choose = async (files) => {
  const doc = await browser.send('DOM.getDocument'); const input = await browser.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'main input[type=file]' })
  assert.ok(input.nodeId); await browser.send('DOM.setFileInputFiles', { nodeId: input.nodeId, files })
}
const savePdf = async (renderPages = true) => {
  await browser.evaluate('document.querySelector("main .save-file-control button").click()')
  await until('window.__auditBlobs.some(blob=>blob.type==="application/pdf")')
  return browser.evaluate(`(async()=>{const m=await import('/audit-reader.js'); return m.readPdfBlob(window.__auditBlobs.filter(blob=>blob.type==='application/pdf').at(-1),${renderPages})})()`)
}
const workingSet = () => Number(execFileSync('powershell.exe', ['-NoProfile', '-Command', "(Get-Process msedge -ErrorAction SilentlyContinue | Measure-Object WorkingSet64 -Sum).Sum"], { encoding: 'utf8', windowsHide: true }).trim() || 0)
try {
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window,'showSaveFilePicker',{value:undefined,configurable:true}); window.__auditBlobs=[]; URL.createObjectURL=((original)=>(blob)=>{window.__auditBlobs.push(blob);return original(blob)})(URL.createObjectURL.bind(URL));` })
  await browser.oeffne(service.origin + '/tools/photo-caption')
  console.log('CRAFT stage: foreign EXIF and pixel comparison')
  await until('!!document.querySelector("main input[type=file]")')
  await choose([photoPath])
  await until('!!document.querySelector("main .caption-canvas")')
  assert.equal(await browser.evaluate('document.querySelectorAll("main .form-grid input")[1].value'), '2008-05-30 15:56')
  const pixel = await browser.evaluate(`(async()=>{const m=await import('/audit-reader.js');return m.compareCaptionPixels(await (await fetch('/audit-photo.jpg')).blob())})()`)
  passed.push({ tool: 'photo-caption', exif: '2008-05-30 15:56 from foreign Canon_40D sample', pixel, source, attribution: 'Ianaré Sévi, Iguana iguana male head, CC BY-SA 3.0; exif-samples downscaled derivative', sha256: hash(sourceBytes) })
  for (const [name, colour] of [['red', '#ff0000'], ['blue', '#0000ff']]) {
    const bytes = await browser.evaluate(`(async()=>{const m=await import('/audit-reader.js');return m.colourImage(${JSON.stringify(colour)},800,600)})()`)
    writeFileSync(resolve(output, name + '.png'), Buffer.from(bytes, 'base64'))
  }
  await choose([resolve(output, 'red.png'), resolve(output, 'blue.png')])
  await until('document.querySelectorAll("main .caption-canvas").length===3')
  await browser.evaluate('document.querySelector("main button.primary").click()')
  await until('document.querySelectorAll("main .save-file-control").length===4')
  const photoPdf = await savePdf()
  console.log('CRAFT stage: photo PDF independently read')
  assert.equal(photoPdf.length, 3); assert.equal(photoPdf.reduce((sum, page) => sum + page.images, 0), 3)
  assert.ok(photoPdf[1].center[0] > 240 && photoPdf[1].center[2] < 10)
  assert.ok(photoPdf[2].center[2] > 240 && photoPdf[2].center[0] < 10)
  assert.equal(hash(readFileSync(photoPath)), hash(sourceBytes))
  passed.push({ tool: 'photo-caption', pdfPages: 3, independentReader: 'PDF.js; image order foreign/red/blue verified by rendered pixels', sourceBytesUnchanged: true })

  await browser.oeffne(service.origin + '/tools/handover-report')
  console.log('CRAFT stage: report fields and signatures')
  await until('!!document.querySelector("main button.primary")')
  await browser.evaluate('document.querySelector("main button.primary").click()')
  await until('!!document.querySelector("main [role=alert]")')
  assert.equal(await browser.evaluate('!!document.querySelector("main .save-file-control")'), false)
  for (const [index, value] of [[1, 'Auditobjekt'], [2, '2028-02-29'], [3, 'Auftraggeber'], [4, 'Auftragnehmer']]) await set(`main .settings-card:first-child .field:nth-child(${index}) input`, value)
  for (const [column, value] of [[1, 'Mangel eins'], [2, 'Raum A'], [3, '2028-03-15']]) await set(`main tbody tr:first-child td:nth-child(${column}) input`, value)
  await browser.evaluate('document.querySelector("main table").closest("section").querySelector(".download-row button").click()')
  await until('document.querySelectorAll("main tbody tr").length===2')
  await set('main tbody tr:nth-child(2) td:first-child input', 'Mangel zwei')
  await choose([resolve(output, 'red.png')])
  await until('Array.from(document.querySelectorAll("main label")).some(label=>label.innerText.includes("red.png") && label.querySelector("input"))')
  await until('document.querySelector("main").innerText.includes("2033-02-28") && document.querySelector("main").innerText.includes("2032-02-29")')
  await browser.evaluate('document.querySelector("main button.primary").click()')
  await until('!!document.querySelector("main .save-file-control")')
  assert.match(await browser.evaluate('document.querySelector("main [role=status]").innerText'), /Unterschrift/u)
  await browser.evaluate(`window.__signatureEvents=[];window.__signatureExports=[];const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,...args){const label=this.getAttribute('aria-label');return original.call(this,blob=>{if(label)window.__signatureExports.push({label,size:blob?.size});callback(blob)},...args)};for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,event=>{if(event.target.closest('.signature-pad'))window.__signatureEvents.push({type,label:event.target.getAttribute('aria-label'),text:event.target.textContent})},true)`)
  for (let index = 0; index < 2; index += 1) {
    console.log('CRAFT signature start ' + index)
    await browser.evaluate(`document.querySelectorAll('.signature-pad canvas')[${index}].scrollIntoView({block:'center',behavior:'instant'})`)
    await browser.warte(100)
    const rect = await browser.evaluate(`(()=>{const c=document.querySelectorAll('.signature-pad canvas')[${index}];const r=c.getBoundingClientRect();const x=r.x+r.width*.25,y=r.y+r.height*.5;if(document.elementFromPoint(x,y)!==c)throw Error('Canvas obscured: '+document.elementFromPoint(x,y)?.outerHTML.slice(0,200));return {x,y}})()`)
    await browser.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...rect })
    await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...rect })
    for (let step = 1; step <= 6; step += 1) await browser.send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1, x: rect.x + step * 15, y: rect.y + (step % 2) * 12 })
    await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: rect.x + 90, y: rect.y })
    await browser.warte(500)
    console.log(JSON.stringify({ signatureFinished: index, exports: await browser.evaluate('window.__signatureExports'), errors: browser.fehler }))
  }
  await browser.warte(300)
  await until('window.__signatureExports.length===2')
  await until('!document.querySelector("main .download-row > button.primary").disabled')
  console.log('CRAFT both signature images exported')
  const ink = await browser.evaluate('Array.from(document.querySelectorAll(".signature-pad canvas"),c=>{const data=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let count=0;for(let i=3;i<data.length;i+=4)if(data[i])count++;return count})')
  assert.ok(ink.every((count) => count > 0), 'Actual pointer signatures have no ink: ' + ink)
  await browser.evaluate('window.__auditBlobs=[]; document.querySelector("main .download-row > button.primary").click()')
  await browser.warte(300)
  await until('!!document.querySelector("main .save-file-control") && !document.querySelector("main button.primary").disabled && !document.querySelector("main [role=status]")')
  const report = await savePdf(false)
  console.log(JSON.stringify({ handoverIndependentRead: report, ink, signatureEvents: await browser.evaluate('window.__signatureEvents'), signatureExports: await browser.evaluate('window.__signatureExports') }))
  const allText = report.map((page) => page.text).join(' ')
  for (const text of ['Auditobjekt', 'Mangel eins', 'Mangel zwei', 'Raum A', '2028-03-15', '2033-02-28', '2032-02-29']) assert.ok(allText.includes(text), 'Missing report text: ' + text)
  assert.equal(report.length, 3); assert.equal(report.reduce((sum, page) => sum + page.images, 0), 3)
  passed.push({ tool: 'handover-report', emptyMandatoryFieldsBlocked: true, missingSignatureWarning: true, dates: 'Leap day +5 years=2033-02-28; +4=2032-02-29', pdfPages: 3, pdfImages: 3, actualPointerSignatures: 2, independentReader: 'PDF.js document, text and image operator list; report page raster rendering is a separate probe' })

  await browser.oeffne(service.origin + '/tools/photo-caption')
  console.log('CRAFT stage: measured photo load')
  await until('!!document.querySelector("main input[type=file]")')
  const large = await browser.evaluate(`(async()=>{const m=await import('/audit-reader.js');return m.colourImage('#4499aa',4000,3000)})()`)
  const samples = []
  for (let n = 0; n < 12; n += 1) { const path = resolve(output, `load-${n}.png`); writeFileSync(path, Buffer.from(large, 'base64')); samples.push(path) }
  const before = workingSet(); const started = Date.now(); let peak = before
  const poll = setInterval(() => { peak = Math.max(peak, workingSet()) }, 500)
  try {
    await choose(samples); await until('document.querySelectorAll("main .caption-canvas").length===12', 500)
    await browser.evaluate('document.querySelector("main button.primary").click()')
    await until('document.querySelectorAll("main .save-file-control").length===13', 1000)
  } finally { clearInterval(poll) }
  passed.push({ tool: 'photo-caption', measuredLoad: { count: 12, width: 4000, height: 3000, totalPixels: 144_000_000, elapsedMs: Date.now() - started, allEdgeWorkingSetBefore: before, allEdgeWorkingSetPeak: peak, processScope: 'all Edge processes; includes any existing unrelated Edge processes', result: 'passed; tested load, not maximum or crash boundary' } })
  const external = browser.anfragen.filter((url) => !url.startsWith(service.origin) && !url.startsWith('data:') && !url.startsWith('blob:'))
  assert.deepEqual(external, []); assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ passed, externalBrowserRequests: 0, limits: 'Measured supported load does not establish a hardware-independent maximum.' }, null, 2))
} catch (error) {
  console.error(JSON.stringify({ runtimeErrors: browser.fehler, signatureEvents: await browser.evaluate('window.__signatureEvents').catch(() => null), signatureExports: await browser.evaluate('window.__signatureExports').catch(() => null) }))
  throw error
} finally { await browser.ende(); await service.close() }
