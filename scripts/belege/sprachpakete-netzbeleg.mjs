/**
 * Beleg: Welche Dateien holt die Seite wirklich? (Aufteilung der Werkzeugtexte je Werkzeug)
 *
 * Portiert aus `work/hebel2-netzbeleg.cjs` (2026-10-05) im Durchzug der QM-Stufe R8 (Karte M10-004).
 * Fachlich unveraendert; portabel gemacht:
 *   - Browserprogramm und Adresse kommen aus der Umgebung (COMMIETOOLS_BROWSER,
 *     COMMIETOOLS_PREVIEW_URL) statt aus einem festen Rechnerpfad,
 *   - Voraussetzungen werden **vor** der Messung geprueft (klarer Abbruch, Exit 2),
 *   - der eigene Browserprozess und das Profil werden immer aufgeraeumt.
 *
 * Gemessen wird mit frischem Browserprofil (kein Dienst-Worker, kein Zwischenspeicher) ueber
 * `Network.requestWillBeSent` auf drei Routen:
 *   1. Startseite `/`                — darf **kein** Werkzeug-Textpaket holen
 *   2. Werkzeugroute Rechner         — holt gemeinsames Paket + `calculator`, kein fremdes Werkzeug
 *   3. Werkzeugroute Bild-Metadaten  — holt gemeinsames Paket + `image-metadata`, kein fremdes
 *
 * Aufruf:  npm run beleg:sprachpakete
 *   (oder: COMMIETOOLS_PREVIEW_URL=http://localhost:4173 node scripts/belege/sprachpakete-netzbeleg.mjs)
 */
import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { EXIT_BEFUND, REPO, abbruch, aufraeumen, browserPfad, pruefeDatei, pruefePreview, previewUrl } from './voraussetzungen.mjs'

const BASE = previewUrl()
const ASSETS = join(REPO, 'apps', 'web', 'dist', 'assets')
const OUT_DIR = process.env.COMMIETOOLS_BELEG_AUSGABE ?? join(REPO, 'uebergabe', '07-pruefung', 'hebel2')
// Datierte Ausgabedatei: ein Lauf ueberschreibt **nie** einen frueheren Beleg (Aktenregel:
// ergaenzen statt umschreiben). Der Beleg vom 2026-10-05 steht unveraendert in `beleg.txt`.
const LOG = join(OUT_DIR, process.env.COMMIETOOLS_BELEG_DATEI ?? `beleg-${new Date().toISOString().slice(0, 10)}.txt`)
const PORT = 9500 + Math.floor(Math.random() * 400)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let browserProcess = null
let activeSocket = null
const profil = join(tmpdir(), `ct-netz-${Date.now()}`)

const log = (line) => {
  appendFileSync(LOG, `${line}\n`)
  console.log(line)
}

/** gzip-Groesse der gebauten Datei, sonst null. */
const gzipOf = (file) => {
  const target = join(ASSETS, file.replace(/^assets\//u, ''))
  if (!existsSync(target)) return null
  return gzipSync(readFileSync(target), { level: 9 }).length
}

class Cdp {
  constructor(socket) {
    this.socket = socket
    this.next = 1
    this.pending = new Map()
    this.listeners = []
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.method) {
        for (const listener of this.listeners) listener(message)
        return
      }
      const entry = this.pending.get(message.id)
      if (!entry) return
      this.pending.delete(message.id)
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
      else entry.resolve(message.result)
    })
  }
  send(method, params = {}) {
    const id = this.next++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }
  async evaluate(expression, ms = 15000) {
    const result = await Promise.race([
      this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Zeitlimit ${ms} ms`)), ms)),
    ])
    if (result.exceptionDetails) throw new Error(`Seitenfehler: ${result.exceptionDetails.text}`)
    return result.result?.value
  }
}

async function main() {
  const browser = browserPfad()
  pruefeDatei(ASSETS, 'Gebautes Buendel (apps/web/dist/assets) — erst `npm run build` fahren')
  await pruefePreview(BASE)
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(LOG, `Netzbeleg Werkzeugtexte je Werkzeug, ${new Date().toISOString()}\nGrundlage: ${BASE}\nBrowser: ${browser}\n`, 'utf8')

  const proc = (browserProcess = spawn(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--remote-allow-origins=*',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, '--window-size=1360,1000', 'about:blank',
  ], { stdio: 'ignore' }))
  proc.on('error', (error) => abbruch(`Browser startet nicht (${browser}): ${error.message}`))

  let target = null
  for (let attempt = 0; attempt < 60 && !target; attempt += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      target = list.find((entry) => entry.type === 'page') ?? null
    } catch { /* noch nicht offen */ }
    if (!target) await sleep(500)
  }
  if (!target) throw new Error('Kein Browserziel — der Browser laeuft, meldet aber keine Seite')

  const socket = (activeSocket = new WebSocket(target.webSocketDebuggerUrl))
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve)
    socket.addEventListener('error', reject)
  })
  const cdp = new Cdp(socket)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')

  let recording = false
  let seen = []
  cdp.listeners.push((message) => {
    if (!recording || message.method !== 'Network.requestWillBeSent') return
    const url = message.params?.request?.url ?? ''
    if (!url.startsWith(BASE) || !/\.js(\?|$)/u.test(url)) return
    const file = url.slice(BASE.length + 1)
    if (!seen.includes(file)) seen.push(file)
  })

  const visit = async (route) => {
    seen = []
    recording = true
    await cdp.send('Page.navigate', { url: `${BASE}${route}` })
    await sleep(3500)
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (await cdp.evaluate('Boolean(document.querySelector(\'.tool-content, .keypad, main.detail-page form, main.detail-page\'))')) break
      await sleep(400)
    }
    await sleep(1200)
    recording = false
    return [...seen]
  }

  const summary = []
  for (const [name, route, mustHave, mustNotHave] of [
    // Der Bauteiler nennt das Werkzeug-Textpaket `tools-<sprache>-*.js` (Vite-Benennung nach dem
    // erzeugten Modul). Die Startseite darf es **nicht** holen.
    ['Startseite', '/', [], ['tools-de-', 'tools-en-']],
    ['Werkzeugroute (Rechner)', '/tools/calculator', ['tools-de-calculator-', 'tools-de-common-'], ['tools-de-image-metadata-', 'tools-de-aufmass-']],
    ['Werkzeugroute (Bild-Metadaten)', '/tools/image-metadata', ['tools-de-image-metadata-', 'tools-de-common-'], ['tools-de-calculator-']],
  ]) {
    const files = await visit(route)
    const withSize = files.map((file) => ({ file, gzip: gzipOf(file) }))
    const total = withSize.reduce((sum, entry) => sum + (entry.gzip ?? 0), 0)
    log(`\n=== ${name}: ${route}`)
    for (const entry of withSize.sort((a, b) => (b.gzip ?? 0) - (a.gzip ?? 0))) {
      log(`  ${String(entry.gzip ?? '—').padStart(7)} B gzip  ${entry.file}`)
    }
    log(`  Summe der geholten JavaScript-Dateien: ${total} B gzip`)
    const hits = (needle) => files.filter((file) => file.includes(needle))
    for (const needle of mustHave) {
      if (!hits(needle).length) throw new Error(`${name}: erwartete Datei mit "${needle}" fehlt`)
      log(`  ok geholt: ${hits(needle).join(', ')}`)
    }
    for (const needle of mustNotHave) {
      if (hits(needle).length) throw new Error(`${name}: Datei mit "${needle}" wurde unerwartet geholt`)
      log(`  ok nicht geholt: nichts mit "${needle}"`)
    }
    summary.push({ name, route, total, files: withSize.length, messages: hits('tools-de-').length })
  }

  log('\nErgebnis:')
  for (const entry of summary) {
    log(`  ${entry.name}: ${entry.files} JavaScript-Dateien, ${entry.total} B gzip, Werkzeug-Textpaket ${entry.messages ? 'geholt' : 'nicht geholt'}`)
  }
  const home = summary[0]
  log(`  Startseite ohne Werkzeugtexte: ${home.total} B gzip`)
  for (const entry of summary.slice(1)) log(`  ${entry.name}: ${entry.total} B gzip (nur eigenes Werkzeug)`)
  log('BELEG ERBRACHT')
}

main()
  .then(() => {
    aufraeumen({ profil, prozess: browserProcess, socket: activeSocket })
    setTimeout(() => process.exit(0), 300)
  })
  .catch((error) => {
    appendFileSync(LOG, `FEHLGESCHLAGEN: ${error.message}\n`)
    console.error('Beleg fehlgeschlagen:', error.message)
    aufraeumen({ profil, prozess: browserProcess, socket: activeSocket })
    process.exitCode = EXIT_BEFUND
  })
