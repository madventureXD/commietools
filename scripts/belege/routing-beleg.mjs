/**
 * Beleg zu QM-Karte **M4-010** (Stufe R9): die Routenzuordnung fällt nicht mehr auf ein fachfremdes
 * Werkzeug zurück.
 *
 * Fall A — unbekannte Adresse `/tools/nicht-vorhanden`: keine Werkzeugoberfläche, sondern die
 *          Meldung „Diese Werkzeugadresse gibt es nicht" — **nicht** das Schwärzen.
 * Fall B — zwei echte Werkzeuge zeichnen ihre Überschrift (lokale und nachgeladene Komponente).
 * Fall C — Prototyp-Namen (`/tools/constructor`, `/tools/toString`) finden ebenfalls nichts.
 *
 * Je Fall frischer Browser.
 *
 * Portiert nach `scripts/belege/` (2026-10-07, Stufe R9): Pfade relativ zum Ablageort, Browser aus
 * der Umgebung.
 *
 * Aufruf:  COMMIETOOLS_PREVIEW_URL=http://localhost:4173 node scripts/belege/routing-beleg.cjs
 */
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { starte } from './cdp-harness.mjs'
import fs from 'node:fs'
import path from 'node:path'

/** Ablageort dieses Skripts — ESM kennt kein `__dirname`. */
const HIER = dirname(fileURLToPath(import.meta.url))

const BASIS = process.env.COMMIETOOLS_PREVIEW_URL ?? 'http://localhost:4173'
const AUSGABE = process.env.COMMIETOOLS_BELEG_AUSGABE ?? path.join(HIER, '..', '..', 'uebergabe', '06-protokolle', 'screenshots', '2026-10-07-r9-u2')

const zeilen = []
const notiz = (text) => { zeilen.push(text); console.log(text) }
let fehler = 0
const pruefe = (bedingung, text) => { if (!bedingung) { fehler += 1; notiz(`  FEHLGESCHLAGEN: ${text}`) } else notiz(`  ok: ${text}`) }

const SCHWAERZEN = /schwärz|redact/i

async function lage(seite, adresse) {
  await seite.oeffne(`${BASIS}${adresse}`)
  await seite.warte(1500)
  return seite.evaluate(`(() => {
    const text = (document.body.innerText ?? '').replace(/\\s+/g, ' ')
    return {
      text: text.slice(0, 400),
      werkzeugHuelle: document.querySelectorAll('article.tool-shell').length,
      ueberschrift: document.querySelector('article.tool-shell h1')?.textContent?.trim() ?? null,
      meldung: document.querySelector('.error')?.textContent?.trim() ?? null,
      titel: document.title,
    }
  })()`)
}

async function fallA() {
  notiz('Fall A — unbekannte Adresse liefert keine Werkzeugoberfläche')
  const seite = await starte({})
  try {
    const l = await lage(seite, '/tools/nicht-vorhanden')
    notiz(`  Meldung: ${l.meldung ?? 'keine'}`)
    notiz(`  Werkzeughüllen: ${l.werkzeugHuelle}`)
    pruefe(l.werkzeugHuelle === 0, 'keine Werkzeugoberfläche gezeichnet')
    pruefe(l.meldung !== null && /gibt es nicht/i.test(l.meldung), 'die Meldung „Diese Werkzeugadresse gibt es nicht" steht da')
    pruefe(!SCHWAERZEN.test(l.text), 'kein Schwärzen-Werkzeug geöffnet (die frühere Voreinstellung)')
    await seite.schuss(path.join(AUSGABE, 'fall-a-unbekannte-adresse.png'))
  } finally { await seite.ende() }
}

async function fallB() {
  const faelle = [
    ['/tools/text-statistics', 'Textstatistik'],
    ['/tools/image-resize', 'Bild skalieren'],
  ]
  for (const [adresse, erwartet] of faelle) {
    notiz(`Fall B — ${adresse} zeichnet seine Oberfläche`)
    const seite = await starte({})
    try {
      const l = await lage(seite, adresse)
      notiz(`  Überschrift: ${l.ueberschrift ?? 'keine'}`)
      pruefe(l.werkzeugHuelle === 1, `genau eine Werkzeughülle (${adresse})`)
      pruefe((l.ueberschrift ?? '').includes(erwartet), `Überschrift nennt „${erwartet}"`)
      await seite.schuss(path.join(AUSGABE, `fall-b-${adresse.split('/').pop()}.png`))
    } finally { await seite.ende() }
  }
}

async function fallC() {
  notiz('Fall C — Prototyp-Namen finden nichts')
  for (const adresse of ['/tools/constructor', '/tools/toString']) {
    const seite = await starte({})
    try {
      const l = await lage(seite, adresse)
      pruefe(l.werkzeugHuelle === 0, `${adresse}: keine Werkzeugoberfläche`)
      pruefe(l.meldung !== null, `${adresse}: Meldung steht da`)
    } finally { await seite.ende() }
  }
}

;(async () => {
  fs.mkdirSync(AUSGABE, { recursive: true })
  notiz(`Beleg M4-010 — ${new Date().toISOString()}`)
  notiz(`Basis: ${BASIS}`)
  await fallA()
  await fallB()
  await fallC()
  notiz(`Ergebnis: ${fehler === 0 ? 'BELEG ERBRACHT' : fehler + ' FEHLGESCHLAGEN'}`)
  fs.writeFileSync(path.join(AUSGABE, 'beleg.txt'), zeilen.join('\n') + '\n')
  process.exit(fehler === 0 ? 0 : 1)
})().catch((ausnahme) => { console.error(ausnahme); process.exit(1) })
