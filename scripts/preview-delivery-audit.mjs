import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { starte } from './belege/cdp-harness.mjs'

const delivery = JSON.parse(readFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-delivery.json'))
const cloudflare = delivery.delivery.checks.find((check) => check.name === 'Cloudflare Pages' && check.conclusion === 'success')
const origin = cloudflare?.output.summary.match(/https:\/\/[a-z0-9]+\.commietools\.pages\.dev/u)?.[0]
assert.ok(origin, 'Actual successful immutable Cloudflare preview required')
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex')
const record = { observedAt: new Date().toISOString(), origin, sourceRevision: delivery.delivery.sha, scope: 'Actual immutable audit preview; does not claim production publication or receiver access', responses: [], browser: null }
for (const path of ['/', '/licenses', '/build.json', '/licenses/registry.json']) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000) })
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(response.status, 200)
  const headers = Object.fromEntries([...response.headers].filter(([name]) => ['content-security-policy', 'nel', 'report-to', 'content-type', 'cache-control'].includes(name)))
  record.responses.push({ path, status: response.status, headers, sha256: digest(bytes) })
  if (path === '/build.json') record.build = JSON.parse(bytes)
  if (path === '/') assert.ok(headers['content-security-policy'].includes("'wasm-unsafe-eval'"))
}
mkdirSync('tmp/preview-audit', { recursive: true })
const document = await PDFDocument.create()
const font = await document.embedFont(StandardFonts.Helvetica)
document.addPage([600, 300]).drawText('HELLO 123', { x: 40, y: 180, size: 55, font })
const fixture = resolve('tmp/preview-audit/hello.pdf')
writeFileSync(fixture, await document.save())
const browser = await starte({})
const attach = async () => {
  const { root } = await browser.send('DOM.getDocument')
  const { nodeId } = await browser.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type=file]' })
  await browser.send('DOM.setFileInputFiles', { nodeId, files: [fixture] })
  for (let i = 0; i < 80; i++) {
    if (await browser.evaluate('document.querySelector(".tool-content")?.innerText.includes("hello.pdf")')) return
    await browser.warte(250)
  }
  throw new Error('Actual public UI did not inspect PDF')
}
const wait = async (expression) => {
  for (let i = 0; i < 560; i++) {
    if (await browser.evaluate(expression)) return
    if (await browser.evaluate('Boolean(document.querySelector(".error"))')) throw new Error(await browser.evaluate('document.querySelector(".error").textContent'))
    await browser.warte(250)
  }
  throw new Error('Public result timeout')
}
try {
  await browser.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await browser.send('Page.bringToFront')
  await browser.oeffne(origin + '/tools/pdf-signature-verify')
  await attach()
  await browser.klicke('/^Signaturen überprüfen$/', 'public signature verification')
  await wait('Boolean(document.querySelector("section[aria-live=polite]"))')
  const signature = await browser.evaluate('document.querySelector(".tool-content").innerText')
  assert.match(signature, /keine|nicht signiert|0 Signaturen/iu)
  await browser.oeffne(origin + '/tools/pdf-text-ocr')
  await attach()
  const results = []
  for (const lang of ['eng', 'deu', 'spa']) {
    await browser.send('Page.bringToFront')
    await browser.evaluate(`(() => {
      const selects = [...document.querySelectorAll('.tool-content select')];
      const set = (el, value) => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('change', { bubbles: true })); };
      set(selects[0], 'ocr'); set(selects[1], ${JSON.stringify(lang)});
      const consent = document.querySelector('.consent-row input'); if (!consent.checked) consent.click();
    })()`)
    await browser.warte(100)
    await browser.klicke('/^Text extrahieren$/', 'public OCR ' + lang)
    await wait('Boolean(document.querySelector(".ocr-result"))')
    const text = await browser.evaluate('document.querySelector(".ocr-result").value')
    assert.match(text, /HELLO\s+123/u)
    results.push({ lang, text })
    console.log('Public OCR passed: ' + lang)
  }
  assert.deepEqual(browser.fehler, [])
  record.browser = { signature, ocr: results, requests: browser.anfragen, runtimeErrors: browser.fehler, nativePicker: false }
} catch (error) {
  record.browser = { requests: browser.anfragen, runtimeErrors: browser.fehler, console: browser.consoleMessages, error: String(error) }
  console.error(JSON.stringify(record.browser, null, 2))
  throw error
} finally {
  writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/preview-delivery.json', JSON.stringify(record, null, 2) + '\n')
  await browser.ende()
}
console.log(JSON.stringify(record, null, 2))
