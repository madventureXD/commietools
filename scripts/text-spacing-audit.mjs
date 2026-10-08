import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { PDFDocument } from 'pdf-lib'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const source = readFileSync('scripts/viewport-audit.mjs', 'utf8')
const syntax = ts.createSourceFile('scanner.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
const extract = (name) => {
  const declaration = syntax.statements.filter(ts.isVariableStatement).flatMap(s => s.declarationList.declarations).find(d => d.name.getText(syntax) === name)
  assert.ok(declaration && ts.isNoSubstitutionTemplateLiteral(declaration.initializer))
  return runInNewContext(declaration.initializer.getText(syntax), {}, { timeout: 100 })
}
const a11y = extract('A11Y_JS'), overflow = extract('OVERFLOW_JS')
const output = 'uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/text-spacing.json'
mkdirSync('tmp/text-spacing', { recursive: true })
const document = await PDFDocument.create(); document.addPage([400, 400])
const file = resolve('tmp/text-spacing/Audit-sehr-langer-Dateiname-ä-日本.pdf'); writeFileSync(file, await document.save())
const service = await startDistServer()
const record = { checkedAt: new Date().toISOString(), build: JSON.parse(readFileSync('apps/web/dist/build.json')).buildId, scannerSha256: createHash('sha256').update(source).digest('hex'), cases: [], scope: 'Actual CSS text spacing: 1.5 line height, 2em paragraph spacing, .12em letter and .16em word spacing. Headless layout, no native zoom or mobile-device claim.' }
try {
  for (const scheme of ['light', 'dark']) {
    const browser = await starte({ schema: scheme })
    const until = async expression => { for (let n = 0; n < 150; n++) { if (await browser.evaluate(expression)) return; await browser.warte(100) }; throw Error('Text-spacing state timeout: ' + expression) }
    try {
      for (const locale of ['de', 'en', 'es']) for (const route of ['/', '/tools/lighting', '/tools/pdf-split']) {
        await browser.oeffne(service.origin + route)
        await browser.evaluate(`(()=>{const el=document.querySelector('.language-select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,${JSON.stringify(locale)});el.dispatchEvent(new Event('change',{bubbles:true}));})()`)
        await until(`document.documentElement.lang===${JSON.stringify(locale)} && !!document.querySelector('main')`)
        await browser.warte(350)
        if (route.endsWith('lighting')) await until('document.querySelectorAll("main dl.results dd").length>0')
        if (route.endsWith('pdf-split')) {
          await until('!!document.querySelector("main input[type=file]")')
          const { root } = await browser.send('DOM.getDocument')
          const { nodeId } = await browser.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'main input[type=file]' })
          await browser.send('DOM.setFileInputFiles', { nodeId, files: [file] })
          await until('!!document.querySelector(".pdf-document-facts")')
        }
        await browser.evaluate(`(()=>{const style=document.createElement('style');style.textContent='* {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p {margin-bottom:2em !important}';document.head.append(style)})()`)
        for (const width of [320, 390]) {
          await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: false })
          await browser.warte(150)
          const findings = await browser.evaluate(a11y), layout = await browser.evaluate(overflow)
          const problems = [...layout.offenders, ...findings.clipped, ...findings.targets, ...findings.names, ...findings.labels, ...findings.opened.names, ...findings.opened.targets]
          record.cases.push({ scheme, locale, route, width, controls: findings.controls, menuControls: findings.opened.elements, problems })
          writeFileSync(output, JSON.stringify(record, null, 2) + '\n')
          console.log(`Text spacing ${problems.length ? 'FAILED' : 'passed'}: ${scheme}/${locale}/${route}/${width}`)
        }
      }
      assert.deepEqual(browser.fehler, [])
    } finally { await browser.ende() }
  }
  assert.equal(record.cases.length, 36)
  record.passed = record.cases.every(c => c.problems.length === 0)
  assert.equal(record.passed, true, JSON.stringify(record.cases.filter(c => c.problems.length)))
} finally { await service.close(); writeFileSync(output, JSON.stringify(record, null, 2) + '\n') }
