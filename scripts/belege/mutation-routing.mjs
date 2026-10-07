/**
 * Mutationsgegenproben zu QM-Karte **M4-010** (Stufe R9).
 *
 *   M1 — einen Eintrag aus der Zuordnung entfernen      → Vollständigkeitsprüfung
 *   M2 — einen Eintrag ohne Werkzeug im Register ergänzen → Gegenrichtung
 *   M3 — Suche über `in` statt `Object.hasOwn`            → Prototyp-Schlüssel kommen durch
 *   M4 — unbekannte ID wieder auf `PdfRedactTool` leiten  → die alte Voreinstellung
 *
 * Beleg ist die `AssertionError`-Zeile. Rücknahme aus dem Arbeitsspeicher (die Datei ist noch nicht
 * versioniert bzw. soll unverändert bleiben).
 *
 * Aufruf: node tmp/m4-010-mutationen.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Portiert nach `scripts/belege/` (2026-10-07, Stufe R9): Wurzel aus dem Ablageort statt fest. */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AUSGABE = join(REPO, 'uebergabe', '06-protokolle', `mutationen-routing-${new Date().toISOString().slice(0, 10)}.txt`)
const APP = 'apps/web/src/App.tsx'

const laufe = []
const zeile = (text) => { laufe.push(text); console.log(text) }
const sicherungen = new Map()

function mutiere(datei, alt, neu) {
  const pfad = `${REPO}/${datei}`
  const inhalt = readFileSync(pfad, 'utf8')
  if (!sicherungen.has(datei)) sicherungen.set(datei, inhalt)
  if (!inhalt.includes(alt)) throw new Error(`Nicht gefunden in ${datei}: ${alt.slice(0, 60)}`)
  writeFileSync(pfad, inhalt.replace(alt, neu), 'utf8')
}

function nimmZurueck(datei) {
  const original = sicherungen.get(datei)
  if (original !== undefined) writeFileSync(`${REPO}/${datei}`, original, 'utf8')
}

function pruefeLauf() {
  let ausgabe
  let exit = 0
  try {
    ausgabe = execSync('npx vitest run src/tool-routing.test.ts --root apps/web', { cwd: REPO, stdio: 'pipe', encoding: 'utf8' })
  } catch (fehler) {
    exit = fehler.status ?? 1
    ausgabe = String(fehler.stdout ?? '') + String(fehler.stderr ?? '')
  }
  const assertion = ausgabe.split('\n').filter((z) => z.includes('AssertionError'))
  const fehlgeschlagen = /Tests\s+\d+ failed/u.test(ausgabe)
  zeile(`  Exit ${exit} · Tests fehlgeschlagen: ${fehlgeschlagen} · AssertionError-Zeilen: ${assertion.length}`)
  for (const z of assertion.slice(0, 2)) zeile(`    ${z.trim()}`)
  if (!fehlgeschlagen && assertion.length === 0) zeile('  ⚠︎ GEGENPROBE SCHLUG NICHT AN — Prüfmittel verdächtig')
  return { fehlgeschlagen, assertion: assertion.length > 0 }
}

const ergebnisse = {}
zeile(`Mutationsgegenproben M4-010 — ${new Date().toISOString()}`)

const faelle = [
  ['M1', 'Eintrag entfernt (pdf-merge)', "  'pdf-merge': PdfMerge,\n", ''],
  ['M2', 'Eintrag ohne Register-Werkzeug ergaenzt', "} satisfies Record<ToolId, WerkzeugKomponente>", "  'nicht-im-register': PdfMerge,\n} satisfies Record<ToolId, WerkzeugKomponente>"],
  ['M3', 'Suche ueber `in` statt Object.hasOwn', "if (!Object.hasOwn(toolRenderers, id)) return undefined", "if (!(id in toolRenderers)) return undefined"],
  ['M4', 'unbekannte ID auf das Schwaerzen geleitet', 'if (!Object.hasOwn(toolRenderers, id)) return undefined', "if (!Object.hasOwn(toolRenderers, id)) return id.startsWith('pdf-') ? PdfRedactTool : undefined"],
]

for (const [nummer, beschreibung, alt, neu] of faelle) {
  zeile(`\n${nummer} — ${beschreibung}`)
  try {
    if (nummer === 'M1') {
      // entfernter Eintrag: die Zeile verschwindet, der Rest bleibt
      mutiere(APP, alt, '')
    } else if (nummer === 'M4') {
      mutiere(APP, alt, "if (!Object.hasOwn(toolRenderers, id)) return PdfRedactTool")
    } else {
      mutiere(APP, alt, neu)
    }
    ergebnisse[nummer] = pruefeLauf()
  } finally { nimmZurueck(APP) }
}

zeile('\nZusammenfassung')
for (const [nummer, ergebnis] of Object.entries(ergebnisse)) {
  zeile(`  ${nummer}: ${ergebnis.fehlgeschlagen && ergebnis.assertion ? 'GEGENPROBE GEGRIFFEN' : 'NICHT GEGRIFFEN — Prüfmittel prüfen'}`)
}
writeFileSync(AUSGABE, laufe.join('\n') + '\n')
console.log(`\nAusgabe: ${AUSGABE}`)
