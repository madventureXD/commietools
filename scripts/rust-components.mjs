/**
 * Erzeugt die Rust-Komponentenliste aus dem tatsächlichen Build (M9-001).
 *
 * Warum: Das Artefaktregister führte für die Signatur-WASM zwei Komponenten; im Zielprofil
 * `wasm32-unknown-unknown` sind es 174 fremde Abhängigkeiten. Ein generischer SPDX-Text ersetzt
 * die Originalhinweise nicht — deshalb werden die Originaldateien (LICENSE/NOTICE/COPYING) der
 * tatsächlich eingebundenen Versionen mitkopiert und im Bericht verzeichnet.
 *
 * Aufruf:  node scripts/rust-components.mjs          (erzeugt/aktualisiert)
 *          node scripts/rust-components.mjs check    (prüft nur, ohne zu schreiben)
 *
 * Gebunden wird die Liste an: Lockfile-Hash, Rust-Werkzeugversionen, Zielprofil, Ausgabehash der
 * gebauten WASM. Ändert sich eine dieser Größen, meldet `check` eine Abweichung.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { homedir } from 'node:os'

const wurzel = resolve('.')
const KARTE = join(wurzel, 'licenses', 'rust-components.json')
const HINWEISE = join(wurzel, 'licenses', 'notices', 'rust')
const ZIEL = 'wasm32-unknown-unknown'
const MANIFEST = 'crates/pdf-signer-wasm/Cargo.toml'
const WASM = 'packages/tools/src/pdf/m7-wasm/engine_bg.wasm'
const modus = process.argv[2] ?? 'erzeugen'

const kurz = (puffer) => createHash('sha256').update(puffer).digest('hex').slice(0, 16)
const dateiHash = (pfad) => (existsSync(pfad) ? kurz(readFileSync(pfad)) : null)

/** Alle Dateien, die als Originalhinweis zählen. */
const istHinweis = (name) => /^(LICENSE|LICENCE|COPYING|NOTICE|UNLICENSE|COPYRIGHT)/i.test(name)

function quelleVerzeichnis(name, version, manifestPath) {
  const basis = join(homedir(), '.cargo', 'registry', 'src')
  if (existsSync(basis)) {
    for (const register of readdirSync(basis)) {
      const ordner = join(basis, register, `${name}-${version}`)
      if (existsSync(ordner)) return ordner
    }
  }
  // Pfad-Abhaengigkeiten (vendorte Crates wie pdf_signer) stehen NICHT im Registry-Zwischenspeicher.
  // Vorher wurden sie deshalb als "Paketquelle nicht im Zwischenspeicher" gefuehrt und ihr
  // Originalhinweis fehlte im Register (gemessen 2026-10-07, Karte M2-001 Auflage A3). Jetzt gilt
  // das Verzeichnis des Manifests als Quelle.
  if (manifestPath) {
    const ordner = dirname(manifestPath)
    if (existsSync(ordner)) return { ordner, herkunft: 'pfad' }
  }
  return null
}

function komponenten() {
  const roh = execFileSync(
    'cargo',
    ['metadata', '--format-version', '1', '--filter-platform', ZIEL, '--manifest-path', MANIFEST],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  )
  const daten = JSON.parse(roh)
  const eigene = new Set(daten.workspace_members)
  const imGraph = new Set(daten.resolve.nodes.map((n) => n.id))
  return daten.packages
    .filter((p) => imGraph.has(p.id) && !eigene.has(p.id))
    .map((p) => ({
      name: p.name,
      version: p.version,
      license: p.license ?? null,
      repository: p.repository ?? null,
      edition: p.edition ?? null,
      manifestPath: p.manifest_path ?? null,
    }))
    .sort((a, b) => (a.name + a.version).localeCompare(b.name + b.version))
}

function werkzeuge() {
  const frage = (programm, argumente) => {
    try {
      return execFileSync(programm, argumente, { encoding: 'utf8' }).trim().split('\n')[0]
    } catch {
      return null
    }
  }
  return {
    rustc: frage('rustc', ['--version']),
    cargo: frage('cargo', ['--version']),
    wasmBindgen: frage('wasm-bindgen', ['--version']),
  }
}

function sammeln(pruefen) {
  const liste = komponenten()
  const fehlend = []
  const gesammelt = []
  for (const k of liste) {
    const quelle = quelleVerzeichnis(k.name, k.version, k.manifestPath)
    const quelleOrdner = typeof quelle === 'string' ? quelle : quelle?.ordner ?? null
    let hinweise = []
    if (quelleOrdner) hinweise = readdirSync(quelleOrdner).filter(istHinweis)
    if (hinweise.length === 0) {
      fehlend.push(`${k.name} ${k.version}`)
      gesammelt.push({ ...k, noticeFiles: [], noticeMissing: true, noticeSource: quelleOrdner ? 'Paket ohne Hinweisdatei' : 'Paketquelle nicht im Zwischenspeicher' })
      continue
    }
    const zielOrdner = join(HINWEISE, `${k.name}-${k.version}`)
    if (!pruefen) mkdirSync(zielOrdner, { recursive: true })
    const kopiert = []
    for (const datei of hinweise) {
      const ziel = join(zielOrdner, datei)
      if (!pruefen) writeFileSync(ziel, readFileSync(join(quelleOrdner, datei)))
      kopiert.push(`notices/rust/${k.name}-${k.version}/${datei}`)
    }
    gesammelt.push({ ...k, noticeFiles: kopiert, noticeSource: quelle?.herkunft === 'pfad' ? 'Pfad-Abhaengigkeit' : undefined })
  }
  const kopf = {
    schemaVersion: 1,
    erzeugt: new Date().toISOString(),
    grundlage: {
      zielprofil: ZIEL,
      manifest: MANIFEST,
      lockfile: dateiHash('crates/pdf-signer-wasm/Cargo.lock'),
      engineLockfile: dateiHash('crates/pdf-signer-engine/Cargo.lock'),
      wasmAusgabe: dateiHash(WASM),
      werkzeuge: werkzeuge(),
      hinweis: 'Bindet die Liste an Werkzeugstand und Ausgabe; ändert sich eine Größe, ist die Liste neu zu erzeugen.',
    },
    anzahl: gesammelt.length,
    mitOriginalhinweis: gesammelt.filter((k) => !k.noticeMissing).length,
    komponenten: gesammelt,
  }
  return { kopf, fehlend }
}

function lizenzverteilung(kopf) {
  const zaehler = new Map()
  for (const k of kopf.komponenten) zaehler.set(k.license ?? '(keine Angabe)', (zaehler.get(k.license ?? '(keine Angabe)') ?? 0) + 1)
  return [...zaehler.entries()].sort((a, b) => b[1] - a[1])
}

if (modus === 'check') {
  if (!existsSync(KARTE)) {
    console.error('licenses/rust-components.json fehlt — erst erzeugen: node scripts/rust-components.mjs')
    process.exit(1)
  }
  const alt = JSON.parse(readFileSync(KARTE, 'utf8'))
  const { kopf } = sammeln(true)
  const abweichungen = []
  if (alt.anzahl !== kopf.anzahl) abweichungen.push(`Komponentenzahl ${alt.anzahl} → ${kopf.anzahl}`)
  for (const [schluessel, wert] of Object.entries(kopf.grundlage)) {
    if (schluessel === 'hinweis' || schluessel === 'werkzeuge') continue
    const altWert = alt.grundlage?.[schluessel]
    if (altWert !== wert) abweichungen.push(`${schluessel}: ${altWert} → ${wert}`)
  }
  for (const schluessel of ['rustc', 'wasmBindgen']) {
    if (alt.grundlage?.werkzeuge?.[schluessel] !== kopf.grundlage.werkzeuge[schluessel]) {
      abweichungen.push(`${schluessel}: ${alt.grundlage?.werkzeuge?.[schluessel]} → ${kopf.grundlage.werkzeuge[schluessel]}`)
    }
  }
  // Sind alle verzeichneten Originalhinweise noch da?
  for (const k of alt.komponenten ?? []) {
    for (const rel of k.noticeFiles ?? []) {
      const pfad = join(wurzel, 'licenses', rel)
      if (!existsSync(pfad) || statSync(pfad).size === 0) abweichungen.push(`Hinweisdatei fehlt oder ist leer: ${rel}`)
    }
  }
  if (abweichungen.length) {
    console.error('rust-components: Liste nicht aktuell oder Hinweise fehlen:')
    for (const a of abweichungen) console.error(`  ${a}`)
    process.exit(1)
  }
  console.log(`rust-components: aktuell — ${alt.anzahl} Komponenten, ${alt.mitOriginalhinweis} mit Originalhinweis, ${(alt.komponenten ?? []).filter((k) => k.noticeMissing).length} ohne.`)
  process.exit(0)
}

if (existsSync(HINWEISE)) rmSync(HINWEISE, { recursive: true, force: true })
const { kopf, fehlend } = sammeln(false)
writeFileSync(KARTE, JSON.stringify(kopf, null, 2) + '\n')
console.log(`rust-components: ${kopf.anzahl} Komponenten im Zielprofil ${ZIEL}, ${kopf.mitOriginalhinweis} mit mitgeliefertem Originalhinweis.`)
console.log(`  Werkzeuge: ${kopf.grundlage.werkzeuge.rustc} · wasm-bindgen ${kopf.grundlage.werkzeuge.wasmBindgen}`)
console.log(`  Ausgabe wasm: ${kopf.grundlage.wasmAusgabe ?? '(nicht gebaut)'}`)
if (fehlend.length) console.log(`  ohne Hinweisdatei (${fehlend.length}): ${fehlend.join(', ')}`)
console.log('  Lizenzangaben:')
for (const [ausdruck, n] of lizenzverteilung(kopf)) console.log(`    ${String(n).padStart(3)} × ${ausdruck}`)
