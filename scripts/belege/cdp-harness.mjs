/**
 * Gemeinsamer Aufsatz für Browser-Belege: Edge kopflos starten, mit CDP sprechen.
 * Kein Testframework — nur das Nötigste (siehe Anleitung „Belege gehören in den Browser").
 *
 * Portiert aus `work/ct-harness.cjs` (2026-10-07, Stufe R9/R10): das Browserprogramm kommt aus der
 * Umgebung (`COMMIETOOLS_BROWSER`), sonst gilt der übliche Edge-Pfad; fehlt es, bricht der Aufruf
 * **vor** der Messung mit Exit 2 ab statt mitten in einem Beleg zu scheitern.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'node:net'

const EDGE = process.env.COMMIETOOLS_BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

export async function starte({ breite = 1360, hoehe = 1100, schema = 'light', praeziserSpeicher = false, download }) {
  if (!fs.existsSync(EDGE)) {
    console.error(`Browserprogramm nicht gefunden: ${EDGE}\nSetze COMMIETOOLS_BROWSER auf ein Chromium/Edge (z. B. msedge.exe).`)
    process.exit(2)
  }
  const reservation = createServer()
  await new Promise((done) => reservation.listen(0, '127.0.0.1', done))
  const port = reservation.address().port
  await new Promise((done) => reservation.close(done))
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-beleg-'))
  const flags = ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-allow-origins=*', '--hide-scrollbars',
    '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--window-size=' + breite + ',' + hoehe]
  if (praeziserSpeicher) flags.push('--enable-precise-memory-info')
  flags.push('about:blank')
  const prozess = spawn(EDGE, flags, { stdio: 'ignore' })

  let ziel = null
  for (let i = 0; i < 60 && !ziel; i += 1) {
    try {
      const liste = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()
      ziel = liste.find((e) => e.type === 'page') ?? null
    } catch { /* Dienst antwortet noch nicht — weiter warten. */ }
    if (!ziel) await new Promise((r) => setTimeout(r, 300))
  }
  if (!ziel) { prozess.kill(); throw new Error('Edge-Debug-Ziel nicht gefunden') }

  const socket = new WebSocket(ziel.webSocketDebuggerUrl)
  await new Promise((res, rej) => { socket.addEventListener('open', res); socket.addEventListener('error', rej) })
  let laufend = 1
  const offen = new Map()
  const anfragen = []
  const fehler = []
  const consoleMessages = []
  const reportingEvents = []
  socket.addEventListener('message', (ereignis) => {
    const nachricht = JSON.parse(ereignis.data)
    if (nachricht.method?.startsWith('Network.reportingApi')) reportingEvents.push({ method: nachricht.method, params: nachricht.params })
    if (nachricht.method === 'Network.requestWillBeSent') anfragen.push(nachricht.params.request.url)
    if (nachricht.method === 'Runtime.exceptionThrown') fehler.push(nachricht.params.exceptionDetails.exception?.description ?? nachricht.params.exceptionDetails.text)
    if (nachricht.method === 'Runtime.consoleAPICalled') consoleMessages.push({ type: nachricht.params.type, text: nachricht.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ') })
    const eintrag = offen.get(nachricht.id)
    if (eintrag) {
      offen.delete(nachricht.id); clearTimeout(eintrag.timer)
      if (nachricht.error) eintrag.reject(new Error(nachricht.error.message)); else eintrag.resolve(nachricht.result)
    }
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = laufend++
    const timer = setTimeout(() => { offen.delete(id); reject(new Error('CDP timeout: ' + method)) }, 180_000)
    offen.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }))
  })
  socket.addEventListener('close', () => {
    for (const entry of offen.values()) { clearTimeout(entry.timer); entry.reject(new Error('CDP connection closed')) }
    offen.clear()
  })
  const evaluate = async (ausdruck) => {
    const ergebnis = await send('Runtime.evaluate', { expression: ausdruck, returnByValue: true, awaitPromise: true })
    if (ergebnis.exceptionDetails) throw new Error('Seitenfehler: ' + (ergebnis.exceptionDetails.exception?.description ?? ergebnis.exceptionDetails.text))
    return ergebnis.result.value
  }
  const warte = (ms) => new Promise((r) => setTimeout(r, ms))
  /** Wartet, bis ein Knopf mit passendem Muster da ist — und bricht ab, wenn dort noch ein Sprachschlüssel steht. */
  const klicke = async (muster, beschreibung, notiz) => {
    for (let versuch = 0; versuch < 40; versuch += 1) {
      const lage = await evaluate(`(() => {
        const knopf = [...document.querySelectorAll('button')].find((x) => ${muster}.test(x.textContent))
        return knopf ? { text: knopf.textContent.trim(), schluessel: /^tool\\./.test(knopf.textContent.trim()), aus: knopf.disabled } : null
      })()`)
      if (lage && !lage.schluessel && !lage.aus) {
        await evaluate(`(() => { [...document.querySelectorAll('button')].find((x) => ${muster}.test(x.textContent)).click(); return true })()`)
        if (notiz) notiz('   geklickt: ' + beschreibung + ' ("' + lage.text + '")')
        await warte(400)
        return true
      }
      if (lage?.schluessel) throw new Error('Sprachschlüssel statt Text: ' + lage.text + ' (' + beschreibung + ')')
      await warte(400)
    }
    const lage = await evaluate(`(() => ({
      adresse: location.pathname,
      knoepfe: [...document.querySelectorAll('button')].map((x) => JSON.stringify(x.textContent.trim())),
      fehler: document.querySelector('.error')?.textContent ?? null
    }))()`)
    throw new Error('Knopf nicht gefunden: ' + beschreibung + ' — Lage: ' + JSON.stringify(lage))
  }
  const schuss = async (datei) => {
    const groesse = await evaluate('(() => ({ width: Math.round(document.documentElement.scrollWidth), height: Math.round(document.documentElement.scrollHeight) }))()')
    const bild = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: groesse.width, height: groesse.height, scale: 1 } })
    fs.writeFileSync(datei, Buffer.from(bild.data, 'base64'))
    return datei
  }

  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable')
  // Foreground headless test page: PDF.js display rendering relies on animation frames.
  // This is fixture calibration, not evidence of a native window or actual device focus.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await send('Page.bringToFront')
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: schema }] })
  await send('Emulation.setDeviceMetricsOverride', { width: breite, height: hoehe, deviceScaleFactor: 1, mobile: false })
  if (download) { fs.mkdirSync(download, { recursive: true }); await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: download }) }

  return {
    send, evaluate, klicke, schuss, warte, anfragen, fehler, consoleMessages, reportingEvents, profil: profile,
    async oeffne(url) { await send('Page.navigate', { url }); await warte(4000) },
    async ende() { await send('Browser.close').catch(() => {}); socket.close(); prozess.kill(); await warte(300); try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* Profil schon fort — nicht schlimm. */ } }
  }
}
