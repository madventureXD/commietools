import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const directory = resolve('tmp/pdf-ui-acceptance'); mkdirSync(directory, { recursive: true })
const document = await PDFDocument.create(); const font = await document.embedFont(StandardFonts.Helvetica)
const page = document.addPage([500, 500])
page.drawText('AUDIT_SECRET_REMOVE', { x: 40, y: 450, font, size: 14 })
page.drawText('Public heading', { x: 40, y: 350, font, size: 18 })
page.drawText('Left column', { x: 40, y: 300, font, size: 12 }); page.drawText('Right column', { x: 270, y: 300, font, size: 12 })
const rotated = document.addPage([500, 500]); rotated.setRotation(degrees(90)); rotated.drawText('Rotated heading', { x: 40, y: 300, font })
document.addPage([500, 500]) // deliberately no text, represents the no-text/scan branch
const fixture = resolve(directory, 'synthetic-columns-rotation.pdf'); writeFileSync(fixture, await document.save())
const bundle = await build({ entryPoints: ['apps/web/src/test-fixtures/craft-reader.ts'], bundle: true, write: false, format: 'esm', platform: 'browser' })
const service = await startDistServer({ auditFiles: { '/audit-reader.js': { type: 'text/javascript', bytes: bundle.outputFiles[0].contents }, '/audit-pdf-worker.mjs': { type: 'text/javascript', bytes: readFileSync('node_modules/pdfjs-dist/build/pdf.worker.mjs') } } })
const browser = await starte({ download: directory })
const passed = []
const until = async (expression) => { for (let n = 0; n < 250; n += 1) { if (await browser.evaluate(expression)) return; await browser.warte(100) }; throw Error('PDF UI timeout: ' + expression) }
const press = async (key, code, vk) => { await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, ...(key === 'Enter' ? { text: '\r' } : key === ' ' ? { text: ' ' } : {}) }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk }); await browser.warte(50) }
const tabTo = async (selector) => { for (let n = 0; n < 180; n += 1) { if (await browser.evaluate(`document.activeElement?.matches(${JSON.stringify(selector)})`)) return; await press('Tab', 'Tab', 9) }; throw Error('Keyboard cannot reach ' + selector) }
const choose = async () => { const doc = await browser.send('DOM.getDocument'); const input = await browser.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'main input[type=file]' }); await browser.send('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [fixture] }) }
const fields = async () => { for (const [index, text] of [[1, '0'], [2, '0'], [3, '500'], [4, '100']]) { await tabTo(`.redaction-form .field:nth-child(${index}) input`); await browser.send('Input.insertText', { text }); await browser.warte(100); assert.equal(await browser.evaluate('document.activeElement.value'), text) }; await tabTo('.redaction-form button'); await press('Enter', 'Enter', 13); await until('document.querySelectorAll(".redaction-list li").length===1') }
try {
  await browser.send('Page.bringToFront'); await browser.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(window,'showSaveFilePicker',{value:undefined,configurable:true});window.__auditBlobs=[];URL.createObjectURL=((fn)=>(blob)=>{window.__auditBlobs.push(blob);return fn(blob)})(URL.createObjectURL.bind(URL))" })
  await browser.oeffne(service.origin + '/tools/pdf-redact'); await choose(); await until('!!document.querySelector(".redaction-form")')
  await fields(); await tabTo('.redaction-area-select'); const before = await browser.evaluate('document.querySelector(".redaction-area-select").textContent')
  await press('ArrowDown', 'ArrowDown', 40); await browser.warte(100); assert.notEqual(await browser.evaluate('document.querySelector(".redaction-area-select").textContent'), before)
  await press('Tab', 'Tab', 9); await press('Enter', 'Enter', 13); await until('!document.querySelector(".redaction-list li")')
  await fields(); await tabTo('main .check-field:last-of-type input'); await press(' ', 'Space', 32); await tabTo('main button.primary'); await press('Enter', 'Enter', 13)
  await until('!!document.querySelector(".save-file-control")'); await tabTo('.save-file-control button'); await press('Enter', 'Enter', 13)
  await until('window.__auditBlobs.some(blob=>blob.type==="application/pdf")')
  const output = await browser.evaluate("(async()=>{const m=await import('/audit-reader.js');return m.readPdfBlob(window.__auditBlobs.filter(blob=>blob.type==='application/pdf').at(-1),false)})()")
  assert.equal(output.length, 3); assert.ok(!output[0].text.includes('AUDIT_SECRET_REMOVE')); assert.ok(output[0].text.includes('Public heading'))
  passed.push({ tool: 'pdf-redact', input: 'CDP file attachment; native file picker unavailable', actualKeyboard: 'Tab/Enter/Space: create, nudge, delete, recreate, confirm, export and save', independentTextRemoval: true, retainedOutsideText: true, rotationPresentOnSecondPage: true })
  await browser.oeffne(service.origin + '/tools/pdf-viewer'); await choose(); await until('document.querySelector(".pdf-text-content")?.textContent.includes("Right column")')
  await browser.send('Page.bringToFront'); await browser.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await until('document.querySelectorAll(".pdf-viewer-thumbs button").length===3')
  await browser.send('Accessibility.enable'); const first = await browser.send('Accessibility.getFullAXTree')
  assert.equal(first.nodes.filter((node) => !node.ignored && node.role?.value === 'StaticText' && node.name?.value.includes('Left column')).length, 1)
  for (const [index, expected] of [[2, 'Rotated heading'], [3, null]]) {
    await tabTo(`.pdf-viewer-thumbs button:nth-child(${index})`); await press('Enter', 'Enter', 13)
    if (expected) await until(`document.querySelector('.pdf-text-content')?.textContent.includes(${JSON.stringify(expected)})`)
    else await until('!!document.querySelector("#pdf-text-view-body .scan-note") && !document.querySelector(".pdf-text-content")')
    assert.equal(await browser.evaluate('document.activeElement?.tagName'), 'BUTTON')
  }
  passed.push({ tool: 'pdf-viewer', accessibilityTree: 'single exposed text node for columns; rotated page reachable; no-text branch disclosed', keyboardPageSwitchFocus: true, limit: 'synthetic stream order; AX tree is not an actual screen-reader utterance; blank page is not a photographed scan' })
  assert.deepEqual(browser.fehler, []); console.log(JSON.stringify({ passed }, null, 2))
} catch (error) { console.error(JSON.stringify({ state: await browser.evaluate("({fields:Array.from(document.querySelectorAll('.redaction-form input'),e=>e.value),errors:Array.from(document.querySelectorAll('main .error'),e=>e.textContent),active:document.activeElement?.outerHTML.slice(0,300)})"), errors: browser.fehler })); throw error }
finally { await browser.ende(); await service.close() }
