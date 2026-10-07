/**
 * Mutationsgegenproben zu QM-Karte **M4-009** (Stufe R9).
 *
 * Drei Gegenproben, jede mit Rücknahme über `git checkout --`:
 *   M1 — `divRound` rundet einen halben Rest **ab** statt auf  → Verhalten (Rechner-Prüfungen)
 *   M2 — gemeinsame `formatBytes` zeigt MB mit **einer** Nachkommastelle → Anzeigeform (R6-Prüfung)
 *   M3 — eine **Kopie** wird wiedereingebaut (und benutzt) → Wächter `consolidation.test.ts`
 *
 * Beleg ist die Zeile mit `AssertionError`, nicht der Exit-Code allein. Schlägt eine Gegenprobe
 * nicht an, ist **zuerst das Prüfmittel** zu verdächtigen und als solches zu benennen.
 *
 * Aufruf: node tmp/m4-009-mutationen.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Portiert nach `scripts/belege/` (2026-10-07, Stufe R9): Wurzel aus dem Ablageort statt fest. */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AUSGABE = join(REPO, 'uebergabe', '06-protokolle', `mutationen-zusammenlegung-${new Date().toISOString().slice(0, 10)}.txt`)
const RUNDUNG = 'packages/tools/src/calculator/rounding.ts'
const FORMAT = 'packages/tools/src/format.ts'
const BILD = 'apps/web/src/tools/ImageResize.tsx'

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

/** Rücknahme aus der Sicherung im Arbeitsspeicher — gilt auch für noch nicht versionierte Dateien. */
function nimmZurueck(datei) {
  const original = sicherungen.get(datei)
  if (original === undefined) return
  writeFileSync(`${REPO}/${datei}`, original, 'utf8')
}

/** Führt den Prüflauf aus und sucht die Belegzeile. */
function pruefeLauf(datei, beschreibung) {
  let ausgabe
  let exit = 0
  try {
    ausgabe = execSync(`npx vitest run ${datei} --root apps/web`, { cwd: REPO, stdio: 'pipe', encoding: 'utf8' })
  } catch (fehler) {
    exit = fehler.status ?? 1
    ausgabe = String(fehler.stdout ?? '') + String(fehler.stderr ?? '')
  }
  const assertion = ausgabe.split('\n').filter((z) => z.includes('AssertionError'))
  const fehlgeschlagen = /Tests\s+\d+ failed/u.test(ausgabe)
  zeile(`  Exit ${exit} · Tests fehlgeschlagen: ${fehlgeschlagen} · AssertionError-Zeilen: ${assertion.length}`)
  for (const z of assertion.slice(0, 2)) zeile(`    ${z.trim()}`)
  if (!fehlgeschlagen && assertion.length === 0) zeile(`  ⚠︎ GEGENPROBE SCHLUG NICHT AN — Prüfmittel verdächtig (${beschreibung})`)
  return { fehlgeschlagen, assertion: assertion.length > 0 }
}

const ergebnisse = {}

zeile(`Mutationsgegenproben M4-009 — ${new Date().toISOString()}`)

zeile('\nM1 — divRound rundet halbe Reste ab (statt auf)')
try {
  mutiere(RUNDUNG, 'const quotient = (a * 2n + b) / (b * 2n)', 'const quotient = (a * 2n + b - 1n) / (b * 2n)')
  ergebnisse.M1 = pruefeLauf('src/rounding.test.ts', 'divRound')
} finally { nimmZurueck(RUNDUNG) }

zeile('\nM2 — gemeinsame formatBytes: MB mit einer Nachkommastelle')
try {
  mutiere(FORMAT, "minimumFractionDigits: 2, maximumFractionDigits: 2", "minimumFractionDigits: 1, maximumFractionDigits: 1")
  ergebnisse.M2 = pruefeLauf('src/format-context.test.ts', 'formatBytes')
} finally { nimmZurueck(FORMAT) }

zeile('\nM3 — Kopie wiedereingebaut und benutzt (Wächter muss greifen)')
try {
  mutiere(BILD, 'function outputName(name: string', 'function formatBytes(bytes: number, locale: string): string {\n  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })\n  if (bytes < 1024) return `${formatter.format(bytes)} B`\n  if (bytes < 1024 * 1024) return `${formatter.format(bytes / 1024)} kB`\n  return `${formatter.format(bytes / (1024 * 1024))} MB`\n}\n\nfunction outputName(name: string')
  mutiere(BILD, 'formatBytes(result.size, anzeigeKontext(locale))', 'formatBytes(result.size, locale)')
  ergebnisse.M3 = pruefeLauf('src/consolidation.test.ts', 'Kopie-Wächter')
} finally { nimmZurueck(BILD) }

zeile('\nZusammenfassung')
for (const [name, ergebnis] of Object.entries(ergebnisse)) {
  zeile(`  ${name}: ${ergebnis.fehlgeschlagen && ergebnis.assertion ? 'GEGENPROBE GEGRIFFEN (Test gescheitert, AssertionError belegt)' : 'NICHT GEGRIFFEN — Prüfmittel prüfen'}`)
}
zeile('\nArbeitsbaum nach Rücknahme:')
zeile(execSync('git status --porcelain', { cwd: REPO, encoding: 'utf8' }).trim() || '  (sauber außer den bekannten Ausnahmen)')
writeFileSync(AUSGABE, laufe.join('\n') + '\n')
console.log(`\nAusgabe: ${AUSGABE}`)
