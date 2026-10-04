import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const baseUrl = process.env.COMMIETOOLS_AUDIT_URL ?? 'http://127.0.0.1:5173'
const edgePath = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const catalog = await readFile(new URL('../packages/tools/src/catalog/toolIndex.ts', import.meta.url), 'utf8')
const allRoutes = [...catalog.matchAll(/"route": "([^"]+)"/gu)].map((match) => match[1])
const routes = process.env.COMMIETOOLS_AUDIT_ROUTES?.split(',').filter(Boolean) ?? allRoutes
const profile = await mkdtemp(join(tmpdir(), 'commietools-viewport-'))
const port = 9333 + Math.floor(Math.random() * 500)
const edge = spawn(edgePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' })

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
let socket
let nextId = 0
const pending = new Map()

function command(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

try {
  let target
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      target = targets.find((item) => item.type === 'page')
      if (target) break
    } catch { /* Edge is still starting. */ }
    await delay(100)
  }
  if (!target) throw new Error('Edge debugging target did not start')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result)
  })
  await command('Page.enable')
  await command('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: true })

  const failures = []
  for (const route of routes) {
    await command('Page.navigate', { url: `${baseUrl}${route}` })
    await delay(650)
    const result = await command('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const width = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll('body *')].flatMap((element) => {
          const style = getComputedStyle(element); const rect = element.getBoundingClientRect();
          const scrollContainer = [...function* () { let parent = element.parentElement; while (parent) { yield parent; parent = parent.parentElement } }()].find((parent) => { const parentStyle = getComputedStyle(parent); return /(auto|scroll)/.test(parentStyle.overflowX) && parent.scrollWidth > parent.clientWidth });
          if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0 || rect.right <= width + 0.5 || scrollContainer) return [];
          return [{ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 100), right: Math.round(rect.right * 10) / 10, width: Math.round(rect.width * 10) / 10, ancestors: [...function* () { let parent = element.parentElement; while (parent && parent !== document.body) { yield parent.tagName.toLowerCase() + (parent.className ? '.' + String(parent.className).trim().replace(/\\s+/g, '.') : ''); parent = parent.parentElement } }()].slice(0, 5) }];
        });
        return { viewport: width, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 12) };
      })()`
    })
    const measurement = result.result.value
    if (measurement.scrollWidth > measurement.viewport || measurement.offenders.length) failures.push({ route, ...measurement })
  }
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2))
    process.exitCode = 1
  } else {
    console.log(`Viewport audit passed: ${routes.length} tool routes at 320 px`)
  }
} finally {
  socket?.close()
  edge.kill()
  if (edge.exitCode === null) await Promise.race([once(edge, 'exit'), delay(2000)])
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try { await rm(profile, { recursive: true, force: true }); break } catch (error) { if (attempt === 4) throw error; await delay(200) }
  }
}
