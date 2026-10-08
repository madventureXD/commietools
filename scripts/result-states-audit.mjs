import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

// Reuse the actual scanner, including its menu and negative-probe contract, without duplication.
const source = readFileSync('scripts/viewport-audit.mjs', 'utf8')
const syntax = ts.createSourceFile('scanner.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
const expression = (name) => {
  const declarations = syntax.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations)
  const declaration = declarations.find((item) => item.name.getText(syntax) === name)
  assert.ok(declaration && ts.isNoSubstitutionTemplateLiteral(declaration.initializer), 'Only existing constant string scanner allowed')
  return runInNewContext(declaration.initializer.getText(syntax), {}, { timeout: 100 })
}
const a11y = expression('A11Y_JS'), overflow = expression('OVERFLOW_JS')
const output = resolve('tmp/result-state-audit'); mkdirSync(output, { recursive: true })
const document = await PDFDocument.create(); const font = await document.embedFont(StandardFonts.Helvetica)
for (const text of ['Audit result page one', 'Audit result page two']) document.addPage([400, 400]).drawText(text, { x: 25, y: 300, size: 18, font })
const pdf = resolve(output, 'Audit-PDF-langer-Dateiname-ä-日本.pdf'); writeFileSync(pdf, await document.save())
const image = resolve(output, 'Audit-Icon-langer-Dateiname-ä-日本.png')
writeFileSync(image, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jQYQAAAAASUVORK5CYII=', 'base64'))
const service = await startDistServer()
const record = { checkedAt: new Date().toISOString(), build: JSON.parse(readFileSync('apps/web/dist/build.json')).buildId, scannerSha256: createHash('sha256').update(source).digest('hex'), cases: [], scope: 'Actual generated PDF viewer, organizer and icon states and opened details, three locales, three widths, both schemes. Heuristic scanner, no native zoom/reader/touch claim.' }
try {
  for (const scheme of ['light', 'dark']) {
    const browser = await starte({ schema: scheme })
    const until = async (expression) => { for (let i = 0; i < 300; i++) { if (await browser.evaluate(expression)) return; await browser.warte(100) }; throw Error('Result state timeout: ' + expression) }
    const choose = async (file) => { const { root } = await browser.send('DOM.getDocument'); const { nodeId } = await browser.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'main input[type=file]' }); assert.ok(nodeId); await browser.send('DOM.setFileInputFiles', { nodeId, files: [file] }) }
    try {
      for (const locale of ['de', 'en', 'es']) for (const route of ['pdf-viewer', 'pdf-organize', 'icon-generator']) {
        await browser.oeffne(service.origin + '/tools/' + route)
        await browser.evaluate(`(() => {const el=document.querySelector('.language-select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,${JSON.stringify(locale)});el.dispatchEvent(new Event('change',{bubbles:true}));})()`)
        await until(`document.documentElement.lang===${JSON.stringify(locale)} && !!document.querySelector('main input[type=file]')`)
        await browser.warte(500)
        await choose(route.startsWith('pdf-') ? pdf : image)
        if (route === 'pdf-viewer') await until('document.querySelectorAll(".pdf-viewer-thumbs button").length===2')
        else if (route === 'pdf-organize') {
          await until('document.querySelectorAll(".pdf-organizer-card").length===2')
          await browser.evaluate('document.querySelectorAll(".pdf-page-actions button")[3].click()')
          await browser.warte(100)
          await browser.evaluate('document.querySelectorAll(".pdf-page-actions button")[4].click()')
          await until('document.querySelectorAll(".pdf-organizer-card").length===3')
          await browser.evaluate('document.querySelector("main button.primary").click()')
          await until('!!document.querySelector("main .save-file-control")')
        }
        else { await until('!document.querySelector("main button.primary").disabled'); await browser.evaluate('document.querySelector("main button.primary").click()'); await until('document.querySelectorAll(".icon-result").length===13') }
        for (const width of [320, 390, 1360]) {
          await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: false })
          await browser.warte(150)
          await browser.evaluate('document.querySelectorAll("main details").forEach(element=>element.open=true)')
          const findings = await browser.evaluate(a11y)
          const layout = await browser.evaluate(overflow)
          // A deliberately long editable filename uses native single-line input scrolling.
          // Keep the raw scanner findings and prove actual Home/End access before classifying it.
          const scrollableNames = await browser.evaluate(`Array.from(document.querySelectorAll('.save-file-control input')).filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>({value:el.value,width:el.clientWidth,scrollWidth:el.scrollWidth,editable:!el.disabled&&!el.readOnly,name:el.closest('label')?.querySelector('span')?.textContent.trim()}))`)
          const inputScrolling = []
          for (let index = 0; index < scrollableNames.length; index++) {
            const entry = scrollableNames[index]
            assert.equal(entry.editable, true)
            await browser.evaluate(`Array.from(document.querySelectorAll('.save-file-control input')).filter(el=>el.scrollWidth>el.clientWidth+1)[${index}].focus()`)
            for (const [key, vk] of [['End', 35], ['Home', 36]]) {
              await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: vk })
              await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: vk })
              const position = await browser.evaluate('({value:document.activeElement.value,position:document.activeElement.selectionStart,scrollLeft:document.activeElement.scrollLeft})')
              assert.equal(position.value, entry.value)
              assert.equal(position.position, key === 'End' ? entry.value.length : 0)
              if (key === 'End') assert.ok(position.scrollLeft > 0)
              inputScrolling.push({ ...entry, key, ...position })
            }
          }
          const provenScroll = findings.clipped.filter(item=>item.element==='input' && scrollableNames.some(entry=>entry.name===item.name && entry.width===item.clientWidth && entry.scrollWidth===item.scrollWidth))
          assert.equal(provenScroll.length, scrollableNames.length)
          const problems = ['targets', 'names', 'labels', 'contrast', 'ariaHidden'].flatMap((name) => findings[name].map((finding) => ({ kind: name, ...finding })))
          problems.push(...findings.clipped.filter(item=>!provenScroll.includes(item)).map(item=>({kind:'clipped',...item})))
          problems.push(...findings.headings.jumps, ...findings.headings.jumpsOpened, ...findings.opened.names, ...findings.opened.targets, ...layout.offenders)
          const entry = { scheme, locale, route, width, controls: findings.controls, menuControls: findings.opened.elements, headings: findings.headings, skippedContrast: findings.skippedContrast, rawClipped: findings.clipped, nativeInputScrolling: inputScrolling, problems }
          record.cases.push(entry)
          writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/result-states.json', JSON.stringify(record, null, 2) + '\n')
          assert.ok(findings.controls > 0 && findings.opened.elements > 0)
          console.log(`Result state ${problems.length ? 'FAILED ' + problems.length : 'passed'}: ${scheme}/${locale}/${route}/${width}`)
        }
      }
      assert.deepEqual(browser.fehler, [])
    } finally { await browser.ende() }
  }
  assert.equal(record.cases.length, 54)
  record.passed = record.cases.every(({ problems }) => problems.length === 0)
  assert.equal(record.passed, true, JSON.stringify(record.cases.filter(({ problems }) => problems.length)))
} finally { await service.close(); writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/result-states.json', JSON.stringify(record, null, 2) + '\n') }
