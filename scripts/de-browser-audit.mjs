import assert from 'node:assert/strict'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const service = await startDistServer()
const browser = await starte({})
const passed = []
const until = async (expression) => {
  for (let n = 0; n < 100; n += 1) { if (await browser.evaluate(expression)) return; await browser.warte(50) }
  throw new Error('D/E state timeout: ' + expression)
}
const open = async (route, selector) => {
  await browser.oeffne(service.origin + '/tools/' + route)
  await until(`!!document.querySelector(${JSON.stringify(selector)})`)
}
const set = async (selector, value) => {
  await browser.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw Error('Missing field '+${JSON.stringify(selector)}); const type = el.tagName === 'SELECT' ? HTMLSelectElement : HTMLInputElement; Object.getOwnPropertyDescriptor(type.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); })()`)
  await browser.warte(100)
}
const number = (text) => Number(text.replace(/\./gu, '').match(/-?\d+(?:,\d+)?/u)?.[0]?.replace(',', '.') ?? 'NaN')
const near = (actual, expected, tolerance) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected} ± ${tolerance}`)
const rows = () => browser.evaluate(`Array.from(document.querySelectorAll('main tbody tr')).map(row => row.innerText)`)
try {
  await open('lighting', 'main select')
  await set('main .tool-content select', 'sanitary')
  for (const [index, value] of [[1, '15'], [2, '0.8'], [3, '2000']]) await set(`main .tool-content .field:nth-child(${index + 2}) input`, value)
  const lighting = await browser.evaluate(`Array.from(document.querySelectorAll('main dl.results dd')).map(el => el.innerText)`)
  assert.deepEqual(lighting.map(number), [3750, 2])
  assert.match(await browser.evaluate('document.querySelector(".lighting-span").innerText'), /100–200/u)
  assert.equal(await browser.evaluate('document.querySelectorAll("main table:not(.lighting-table) tbody tr").length'), 14)
  passed.push({ tool: 'lighting', case: '15m² × 200lx / 0.8 = 3750lm; /2000lm rounded to 2; source conflict 100–200lx; 14 sources' })

  await open('threads', '#threads-core-hole')
  near(number(await browser.evaluate('document.querySelector("#threads-core-hole").value')), 8.5, 0.001)
  await set('#threads-wrench-series', 'din')
  const din = await browser.evaluate('document.querySelector("#threads-wrench").value')
  await set('#threads-wrench-series', 'iso')
  const iso = await browser.evaluate('document.querySelector("#threads-wrench").value')
  assert.notEqual(din, iso)
  passed.push({ tool: 'threads', case: 'M10 coarse core hole 10−1.5=8.5mm; independently labelled wrench series have distinct displayed values', din, iso })

  await open('cable', '#cable-current')
  for (const [id, value] of [['phase','single'],['voltage','230'],['input-mode','current'],['current','16'],['length','30'],['material','copper'],['usage','lighting'],['ampacity','20']]) await set('#cable-' + id, value)
  await browser.evaluate('document.querySelector("main form button[type=submit]").click()')
  await until('document.querySelectorAll("main tbody tr").length > 0')
  const cable = await rows()
  assert.ok(cable.some((row) => /genormter Querschnitt/iu.test(row) && /2,5/u.test(row)))
  assert.ok(cable.some((row) => /Auslastung/iu.test(row) && /80/u.test(row)))
  passed.push({ tool: 'cable', case: '230V single-phase, 16A, 30m Cu: A=960/(56×6.9)=2.484mm² → 2.5mm²; ampacity 16/20=80%' })

  await open('pipes', '#pipes-power')
  for (const [id, value] of [['power','10'],['spread','10'],['temperature','20'],['material','copper'],['size','cu-15x10']]) await set('#pipes-' + id, value)
  await browser.evaluate('document.querySelector("main form button[type=submit]").click()')
  await until('document.querySelectorAll("main tbody tr").length > 0')
  const pipes = await rows()
  const displayed = (label) => number(pipes.find((row) => row.startsWith(label))?.split(':')[1] ?? '')
  const flow = 10_000 / (4186 * 10 * 998.2) * 3600
  near(displayed('Volumenstrom'), flow, 0.001)
  near(displayed('Innendurchmesser'), 13, 0.001)
  near(displayed('Strömungsgeschwindigkeit'), flow / 3600 / (Math.PI * 0.013 ** 2 / 4), 0.001)
  passed.push({ tool: 'pipes', case: '10kW, 10K, water20°C, copper15×1mm: actual displayed flow, diameter and velocity vs independent formula', flow })

  await open('heatload', '#heatload-outdoor-temp')
  assert.equal(await browser.evaluate('document.querySelector("#heatload-outdoor-temp").value'), '')
  for (const [id,value] of [['outdoor-temp','-10'],['raum-1-name','MS6 Raum'],['raum-1-area','20'],['raum-1-air','0,5'],['raum-1-flaeche-2-area','20'],['raum-1-flaeche-2-u','1,65']]) await set('#heatload-' + id,value)
  const heat = await browser.evaluate(`Array.from(document.querySelectorAll('main tr')).find(row => row.innerText.startsWith('MS6 Raum'))?.innerText`)
  assert.ok(heat)
  assert.match(heat, /990/u)
  assert.match(await browser.evaluate('document.querySelector("main").innerText'), /DIN EN 12831/u)
  passed.push({ tool: 'heatload', case: 'Outdoor temperature initially empty; 1.65W/(m²K)×20m²×30K = 990W transmission; visible DIN EN12831 boundary' })

  await open('inspection', 'main .tool-content .download-row button')
  await browser.evaluate('document.querySelector("main .tool-content .download-row button").click()')
  await until('!!document.querySelector("main tbody input")')
  for (const [column,value] of [[1,'MS6 Prüffrist'],[2,'1'],[3,'2026-01-31'],[4,'ä; 日本']]) await set(`main tbody tr:first-child td:nth-child(${column}) input`,value)
  await until('document.querySelector("main tbody tr").innerText.includes("28.02.2026")')
  await browser.warte(500)
  await browser.send('Page.reload')
  await until('document.querySelector("main tbody input")?.value === "MS6 Prüffrist"')
  assert.equal(await browser.evaluate('document.querySelector("main tbody tr td:nth-child(4) input").value'), 'ä; 日本')
  assert.match(await browser.evaluate('document.querySelector("main tbody tr").innerText'), /28\.02\.2026/u)
  passed.push({ tool: 'inspection', case: 'Actual UI entry survives reload with Unicode note; 31 January +1 month clamps to 28 February' })

  const external = browser.anfragen.filter((url) => !url.startsWith(service.origin) && !url.startsWith('data:') && !url.startsWith('blob:'))
  assert.deepEqual(external, []); assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ passed, externalRequests: 0, scope: 'Six actual D/E browser cases; remaining photo/handover and original specialist/device criteria remain explicitly open' }, null, 2))
} finally { await browser.ende(); await service.close() }
