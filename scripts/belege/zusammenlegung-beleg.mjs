/**
 * Beleg zur QM-Karte **M4-009** (Stufe R9): die zusammengelegten Stellen verhalten sich in der
 * ausgelieferten Seite wie vorher — und zwar an den **sichtbaren** Stellen.
 *
 * Fall A — Anzeigeformat: ein Bild über 1 MiB wird von einem Bildwerkzeug in der gemeinsamen Form
 *          angezeigt („KB" groß geschrieben, ab 1 MiB zwei Nachkommastellen).
 * Fall B — Suchladezustand: Katalogsuche **und** Werkzeugmenü liefern Treffer (gemeinsamer Haken).
 * Fall C — Ergebnis-Adresse: ein Werkzeug erzeugt nach dem Lauf eine `blob:`-Adresse zum Speichern.
 *
 * Je Fall frischer Browser (eigenes Profil, kein Dienst-Worker, kein Zwischenspeicher).
 *
 * Portiert nach `scripts/belege/` (2026-10-07, Stufe R9): Pfade relativ zum Ablageort, Browser aus
 * der Umgebung, Prüfbilder in den Temporärordner (nicht in den Bestand).
 *
 * Aufruf:  COMMIETOOLS_PREVIEW_URL=http://localhost:4173 node scripts/belege/zusammenlegung-beleg.cjs
 */
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { starte } from './cdp-harness.mjs'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'

/** Ablageort dieses Skripts — ESM kennt kein `__dirname`. */
const HIER = dirname(fileURLToPath(import.meta.url))

const BASIS = process.env.COMMIETOOLS_PREVIEW_URL ?? 'http://localhost:4173'
const AUSGABE = process.env.COMMIETOOLS_BELEG_AUSGABE ?? path.join(HIER, '..', '..', 'uebergabe', '06-protokolle', 'screenshots', '2026-10-07-r9-u1')
const BILD = path.join(os.tmpdir(), 'ct-beleg-gross.png')
const BILD_KLEIN = path.join(os.tmpdir(), 'ct-beleg-klein.png')
const PDF = path.join(HIER, '..', '..', 'test-assets')

const zeilen = []
const notiz = (text) => { zeilen.push(text); console.log(text) }
let fehler = 0
const pruefe = (bedingung, text) => { if (!bedingung) { fehler += 1; notiz(`  FEHLGESCHLAGEN: ${text}`) } else { notiz(`  ok: ${text}`) } }

const crcTabelle = (() => {
  const tabelle = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); tabelle[n] = c }
  return tabelle
})()
const crc32 = (puffer) => { let c = -1; for (const b of puffer) c = crcTabelle[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0 }
const chunk = (typ, daten) => {
  const laenge = Buffer.alloc(4); laenge.writeUInt32BE(daten.length)
  const koerper = Buffer.concat([Buffer.from(typ, 'ascii'), daten])
  const pruef = Buffer.alloc(4); pruef.writeUInt32BE(crc32(koerper))
  return Buffer.concat([laenge, koerper, pruef])
}

/**
 * Prüfbild im Beleg erzeugen — kein Fremdbild im Bestand, keine Bibliothek. `rauschen` macht das
 * Bild unkomprimierbar, damit die Größe sich sicher über/unter 1 MiB legen lässt.
 */
function erzeugeBild(datei, breite, hoehe, rauschen) {
  const kopf = Buffer.alloc(13)
  kopf.writeUInt32BE(breite, 0); kopf.writeUInt32BE(hoehe, 4)
  kopf[8] = 8; kopf[9] = 2 // 8 Bit je Kanal, RGB
  const reiheLaenge = 1 + breite * 3
  const reihen = Buffer.alloc(reiheLaenge * hoehe)
  for (let y = 0; y < hoehe; y += 1) {
    for (let x = 0; x < breite * 3; x += 1) {
      reihen[y * reiheLaenge + 1 + x] = rauschen ? Math.floor(Math.random() * 256) : ((x + y) % 256)
    }
  }
  const daten = zlib.deflateSync(reihen, { level: rauschen ? 0 : 9 })
  fs.writeFileSync(datei, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', kopf),
    chunk('IDAT', daten),
    chunk('IEND', Buffer.alloc(0)),
  ]))
  return fs.statSync(datei).size
}

/**
 * Datei in **alle** passenden Dateifelder legen.
 *
 * Weg über die Seite selbst (`File` + `DataTransfer` + `input`/`change`): Der CDP-Weg
 * (`DOM.setFileInputFiles`) griff bei Werkzeugen, die ihr Dateifeld beim Zustandswechsel **neu
 * erzeugen**, ins Leere — gemessen am 2026-10-07 (`belegt: [0]` trotz erfolgreichem Aufruf), und
 * damit war der Fehlschlag ein **Prüfmittel**-Fehler, kein Produktfehler.
 */
async function setzeDatei(seite, wahl, datei) {
  const inhalt = fs.readFileSync(datei).toString('base64')
  const name = path.basename(datei)
  const typ = name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png'
  const gesetzt = await seite.evaluate(`(() => {
    const zeichen = atob(${JSON.stringify(inhalt)})
    const puffer = new Uint8Array(zeichen.length)
    for (let i = 0; i < zeichen.length; i += 1) puffer[i] = zeichen.charCodeAt(i)
    const datei = new File([puffer], ${JSON.stringify(name)}, { type: ${JSON.stringify(typ)} })
    const felder = [...document.querySelectorAll(${JSON.stringify(wahl)})]
    if (felder.length === 0) return false
    const uebertragung = new DataTransfer()
    uebertragung.items.add(datei)
    for (const feld of felder) {
      feld.files = uebertragung.files
      feld.dispatchEvent(new Event('input', { bubbles: true }))
      feld.dispatchEvent(new Event('change', { bubbles: true }))
    }
    return true
  })()`)
  if (gesetzt !== true) throw new Error(`Dateifeld nicht gefunden: ${wahl}`)
  await seite.warte(2000)
}

/** React-gesteuertes Textfeld setzen (der Umweg über den nativen Setter ist nötig). */
async function setzeText(seite, wahl, text) {
  return seite.evaluate(`(() => {
    const feld = document.querySelector(${JSON.stringify(wahl)})
    if (!feld) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(feld, ${JSON.stringify(text)})
    feld.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
}

const groesseVon = (datei) => fs.statSync(datei).size

/** Die gemeinsame Anzeigeform (R6/M3-010) nachbilden — der erwartete Text, gegen den gemessen wird. */
function erwarteteGroesse(bytes, sprache = 'de-DE') {
  const zahl = new Intl.NumberFormat(sprache, { maximumFractionDigits: 0 }).format(bytes)
  if (bytes < 1024) return `${zahl} B`
  const kb = new Intl.NumberFormat(sprache, { maximumFractionDigits: 1 }).format(bytes / 1024)
  if (bytes < 1024 * 1024) return `${kb} KB`
  const mb = new Intl.NumberFormat(sprache, { maximumFractionDigits: 2 }).format(bytes / (1024 * 1024))
  return `${mb} MB`
}

async function fallA() {
  notiz('Fall A — Anzeigeformat (Bildwerkzeug, gemeinsame Form aus R6)')
  const gross = erzeugeBild(BILD, 1200, 800, true)
  const klein = erzeugeBild(BILD_KLEIN, 60, 60, true)
  notiz(`  Prüfbilder erzeugt: groß ${gross} B (${(gross / 1024 / 1024).toFixed(2)} MiB), klein ${klein} B`)

  for (const [datei, name, ueberMiB] of [[BILD, 'groß', true], [BILD_KLEIN, 'klein', false]]) {
    const seite = await starte({})
    try {
      await seite.oeffne(`${BASIS}/tools/image-resize`)
      await setzeDatei(seite, 'input[type=file]', datei)
      await seite.warte(1500)
      const text = await seite.evaluate('(() => document.body.innerText.replace(/\\n+/g, " | "))()')
      const treffer = text.match(/(\d[\d.,]*)\s*(B|KB|kB|MB)\b/g) ?? []
      const erwartet = erwarteteGroesse(groesseVon(datei))
      notiz(`  [${name}] gefundene Größenangaben: ${JSON.stringify(treffer.slice(0, 6))}`)
      notiz(`  [${name}] erwartete Angabe (gemeinsame Form): „${erwartet}"`)
      pruefe(treffer.length > 0, `[${name}] die Seite zeigt mindestens eine Größenangabe`)
      pruefe(text.includes(erwartet), `[${name}] die Seite zeigt genau die gemeinsame Form „${erwartet}"`)
      pruefe(!/\bkB\b/.test(text), `[${name}] keine kleingeschriebene Einheit „kB" mehr`)
      if (ueberMiB) {
        const mb = treffer.find((wert) => / MB$/.test(wert))
        pruefe(mb !== undefined, `[${name}] über 1 MiB wird in MB angezeigt`)
        if (mb) pruefe(/,\d{2} MB$/.test(mb), `[${name}] MB mit zwei Nachkommastellen (${mb})`)
      } else {
        const kb = treffer.find((wert) => / KB$/.test(wert))
        pruefe(kb !== undefined, `[${name}] unter 1 MiB wird in KB angezeigt`)
        if (kb) pruefe(/,\d KB$/.test(kb), `[${name}] KB mit einer Nachkommastelle (${kb})`)
      }
      await seite.schuss(path.join(AUSGABE, `fall-a-bildgroesse-${name}.png`))
    } finally { await seite.ende() }
  }
}

async function fallB() {
  notiz('Fall B — Suchladezustand (Katalogsuche und Werkzeugmenü)')
  const seite = await starte({})
  try {
    await seite.oeffne(`${BASIS}/`)
    const gesetzt = await setzeText(seite, '.search-field input[type=search]', 'beton')
    pruefe(gesetzt === true, 'Suchfeld im Katalog gefunden und gesetzt')
    await seite.warte(1500)
    const katalog = await seite.evaluate(`(() => {
      const bereich = document.querySelector('#tools')
      const zaehler = bereich?.querySelector('.search-count')?.textContent?.trim() ?? null
      const leer = bereich?.querySelector('.search-empty')?.textContent?.trim() ?? null
      const karten = bereich ? bereich.querySelectorAll('.catalog-grid > *').length : 0
      const knoepfe = bereich ? [...bereich.querySelectorAll('button')].map((x) => (x.textContent ?? '').trim()).slice(0, 4) : []
      const verweise = bereich ? [...bereich.querySelectorAll('a')].map((x) => x.getAttribute('href')).slice(0, 3) : []
      return { zaehler, leer, karten, knoepfe, verweise }
    })()`)
    notiz(`  Kataloglage: ${JSON.stringify(katalog)}`)
    pruefe(katalog.zaehler !== null, 'die Katalogsuche zeigt ihren Trefferzähler (Suche greift)')
    pruefe(katalog.karten > 0, 'die Katalogsuche listet Treffer auf')
    pruefe(katalog.leer === null, 'die Katalogsuche meldet **nicht** „keine Treffer"')
    await seite.schuss(path.join(AUSGABE, 'fall-b-katalogsuche.png'))
  } finally { await seite.ende() }

  const zweite = await starte({})
  try {
    await zweite.oeffne(`${BASIS}/`)
    const geoeffnet = await zweite.evaluate(`(() => {
      const knopf = [...document.querySelectorAll('button')].find((x) => /Werkzeug|Menü|Werkzeuge/.test(x.textContent ?? ''))
      if (!knopf) return false
      knopf.click()
      return true
    })()`)
    pruefe(geoeffnet === true, 'Werkzeugmenü lässt sich öffnen')
    await zweite.warte(700)
    const gesetzt = await setzeText(zweite, '.tool-menu input, input[type=search], input[type=text]', 'beton')
    pruefe(gesetzt === true, 'Suchfeld im Menü gefunden und gesetzt')
    await zweite.warte(1200)
    const treffer = await zweite.evaluate(`(() => [...document.querySelectorAll('.tool-menu-row, .tool-menu-open')].length)()`)
    notiz(`  Menütreffer: ${treffer}`)
    pruefe(treffer > 0, 'das Werkzeugmenü liefert Treffer')
    await zweite.schuss(path.join(AUSGABE, 'fall-b-menuesuche.png'))
  } finally { await zweite.ende() }
}

async function fallC() {
  notiz('Fall C — Ergebnis-Adresse (Werkzeug erzeugt blob:-Adresse)')
  const datei = 'm4-005-schnell-B.pdf'
  const pfad = path.join(PDF, datei)
  const seite = await starte({})
  try {
    await seite.oeffne(`${BASIS}/tools/pdf-compress`)
    await setzeDatei(seite, 'input[type=file]', pfad)
    notiz(`  Datei: ${datei}`)
    const feld = await seite.evaluate(`(() => {
      const felder = [...document.querySelectorAll('input[type=file]')]
      return { anzahl: felder.length, belegt: felder.map((x) => x.files?.length ?? 0), sichtbar: felder.map((x) => x.offsetParent !== null) }
    })()`)
    notiz(`  Dateifelder: ${JSON.stringify(feld)}`)
    await seite.warte(1500)
    const gestartet = await seite.evaluate(`(() => {
      const knopf = [...document.querySelectorAll('article.tool-shell button')].find((x) => /optimieren|komprimieren|anwenden/i.test(x.textContent ?? ''))
      if (!knopf || knopf.disabled) return false
      knopf.click()
      return true
    })()`)
    pruefe(gestartet === true, 'die Werkzeugtaste wurde im Werkzeugbereich gefunden und geklickt')
    await seite.warte(4000)
    const lage = await seite.evaluate(`(() => {
      const huelle = document.querySelector('article.tool-shell') ?? document
      const adressen = [...document.querySelectorAll('a[href^="blob:"]')].map((x) => x.getAttribute('href'))
      const knoepfe = [...huelle.querySelectorAll('button')].map((x) => (x.textContent ?? '').trim())
      const speichern = knoepfe.filter((text) => /Speichern|Herunterladen|Save|Download/i.test(text))
      const fehler = huelle.querySelector('.error')?.textContent?.trim() ?? null
      const text = (huelle.textContent ?? '').replace(/\\s+/g, ' ').slice(0, 300)
      return { adressen, speichern, fehler, text, knoepfe: knoepfe.slice(0, 10) }
    })()`)
    notiz(`  Werkzeugknöpfe: ${JSON.stringify(lage.knoepfe)}`)
    notiz(`  blob:-Adressen: ${lage.adressen.length}, Speicherknöpfe: ${JSON.stringify(lage.speichern)}`)
    notiz(`  Fehlermeldung: ${lage.fehler ?? 'keine'}`)
    notiz(`  Inhalt: ${lage.text}`)
    pruefe(lage.fehler === null, 'das Werkzeug meldet keinen Fehler')
    pruefe(lage.speichern.length > 0, 'nach dem Lauf steht ein Speicherknopf bereit (Ergebnis-Adresse gesetzt)')
    await seite.schuss(path.join(AUSGABE, 'fall-c-ergebnisadresse.png'))
  } finally { await seite.ende() }
}

;(async () => {
  fs.mkdirSync(AUSGABE, { recursive: true })
  notiz(`Beleg M4-009 — ${new Date().toISOString()}`)
  notiz(`Basis: ${BASIS}`)
  await fallA()
  await fallB()
  await fallC()
  notiz(`Ergebnis: ${fehler === 0 ? 'BELEG ERBRACHT' : fehler + ' FEHLGESCHLAGEN'}`)
  fs.writeFileSync(path.join(AUSGABE, 'beleg.txt'), zeilen.join('\n') + '\n')
  process.exit(fehler === 0 ? 0 : 1)
})().catch((ausnahme) => { console.error(ausnahme); process.exit(1) })
