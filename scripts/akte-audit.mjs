// Pruefer fuer die Akte (QM-Karten M10-001, M10-002, M10-005).
//
// Regelkreise, jeder aus einer Karte:
//   listen    (M10-001) Die verbindliche Aufgabenliste fuehrt NUR offene Arbeit.
//                        - kein "[x]" in der Aufgabenliste
//                        - jeder offene Punkt traegt eine eindeutige ID "OP-nnn"
//                        - jeder relative Verweis in der Akte loest auf (Datei und Anker)
//                        - jedes Konzept unter 03-konzepte/ hat einen Statuskopf
//                        - jede DRINGEND-Akte nennt ihren Zustand (offen oder historisch)
//   uebergabe (M10-002) Uebergaben folgen der Uebergabespezifikation.
//                        - Kopffelder Datum / Bearbeitet durch / Auftrag / Status, ohne Platzhalter
//                        - Pflichtabschnitte; gleichwertige Ueberschriften sind zugelassen und
//                          werden als solche gemeldet (abweichende Ueberschrift != fehlender Inhalt)
//                        - Pruefnachweis (ausgefuehrte Pruefung mit Exit/Beleg) und Revision
//                          (Commit-Hash oder ausdrueckliches "nichts committet") sind Pflicht
//                        - Uebergaben vor dem Stichtag sind historisch: Luecken werden gemeldet,
//                          aber nicht gewertet (Auftrag: OP-018/OP-036)
//
// Usage: node scripts/akte-audit.mjs [listen] [uebergabe] [abschluss] [uebergabe-selftest]
//        ohne Argument laufen die Regelkreise der Akte (nicht der Selbsttest).
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const uebergabe = join(root, 'uebergabe')

// Stichtag der Uebergabespezifikation (M10-002). Aeltere Uebergaben sind historisch und werden
// nur gemeldet; sie werden nicht rueckwirkend umgeschrieben (Karte: "Nicht tun").
const SPEC_DATE = '2026-10-07'

function fail(message) {
  console.error(`Akte audit failed: ${message}`)
  process.exit(1)
}
function report(name, detail, warnings = []) {
  for (const w of warnings) console.log(`  Hinweis: ${w}`)
  console.log(`${name}: ${detail}`)
}

// ---------- Hilfen ----------
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}
function rel(p) {
  return relative(root, p).split('\\').join('/')
}
// Fenced Blocks und Inline-Code entfernen: ein Verweis in Backticks ist Prosa, kein Verweis.
// Mehrfache Backtick-Folgen duerfen sich selbst enthalten; die Entfernung laeuft deshalb bis zum
// Fixpunkt (erst dreifach, dann doppelt, dann einfach) — sonst bleibt aus `` ``x`` `` Resttext stehen.
function withoutCode(text) {
  let out = text
  let previous
  do {
    previous = out
    out = out
      .replace(/```[\s\S]*?```/gu, '')
      .replace(/``[\s\S]*?``/gu, '')
      .replace(/`[^`\n]*`/gu, '')
  } while (out !== previous)
  return out
}
function headingSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/gu, '-')
}
function headingsOf(text) {
  return [...text.matchAll(/^#{1,6}\s+(.*)$/gmu)].map((m) => m[1].trim())
}
function sectionBody(text, heading) {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => /^#{1,6}\s+/u.test(line) && line.replace(/^#{1,6}\s+/u, '').trim() === heading)
  if (start < 0) return ''
  const rest = []
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#{1,6}\s+/u.test(lines[i])) break
    rest.push(lines[i])
  }
  return rest.join('\n')
}

// ---------- M10-001 ----------
function checkListen() {
  const problems = []
  const tasksFile = join(uebergabe, '01-stand', 'offene-punkte.md')
  const tasks = readFileSync(tasksFile, 'utf8')
  const lines = tasks.split('\n')

  lines.forEach((line, index) => {
    if (/^-\s\[x\]/u.test(line)) problems.push(`${rel(tasksFile)}:${index + 1}: erledigter Punkt in der aktiven Liste (gehoert ins Archiv)`)
  })
  const ids = []
  lines.forEach((line, index) => {
    if (!/^-\s\[ \]/u.test(line)) return
    const id = /\bOP-\d{3}\b/u.exec(line)
    if (!id) problems.push(`${rel(tasksFile)}:${index + 1}: offener Punkt ohne ID "OP-nnn"`)
    else ids.push(id[0])
  })
  const doubled = ids.filter((id, position) => ids.indexOf(id) !== position)
  for (const id of new Set(doubled)) problems.push(`${rel(tasksFile)}: ID ${id} mehrfach vergeben`)

  let links = 0
  const files = walk(uebergabe)
  for (const file of files) {
    const text = withoutCode(readFileSync(file, 'utf8'))
    for (const match of text.matchAll(/\]\(([^)\s]+)\)/gu)) {
      const target = match[1]
      if (/^(?:[a-z]+:|\/|#)/iu.test(target)) continue
      links += 1
      const [pathPart, anchor] = target.split('#')
      const abs = resolve(dirname(file), decodeURIComponent(pathPart || ''))
      if (!existsSync(abs)) {
        problems.push(`${rel(file)}: Verweis zeigt auf eine fehlende Datei: ${target}`)
        continue
      }
      if (anchor && statSync(abs).isFile() && !new Set(headingsOf(readFileSync(abs, 'utf8')).map(headingSlug)).has(anchor.toLowerCase())) {
        problems.push(`${rel(file)}: Verweis zeigt auf einen fehlenden Anker: ${target}`)
      }
    }
  }

  const konzeptDir = join(uebergabe, '03-konzepte')
  let konzepte = 0
  for (const name of readdirSync(konzeptDir)) {
    if (!name.endsWith('.md') || name === 'README.md') continue
    konzepte += 1
    const body = readFileSync(join(konzeptDir, name), 'utf8')
    if (!/^\*\*Status/mu.test(body) && !/Statuskopf/u.test(body)) {
      problems.push(`03-konzepte/${name}: kein Statuskopf (weder "**Status:**" noch datierter Statuskopf-Zusatz)`)
    }
  }

  let dringend = 0
  for (const name of readdirSync(uebergabe)) {
    if (!name.startsWith('DRINGEND-')) continue
    dringend += 1
    const body = readFileSync(join(uebergabe, name), 'utf8')
    const historisch = /historischer Vorgang/u.test(body)
    const offen = /^\*\*Status:\*\*.*offen/mu.test(body)
    if (!historisch && !offen) {
      problems.push(`${name}: nennt seinen Zustand nicht (weder "historischer Vorgang" noch "**Status:** ... offen")`)
    }
  }

  if (problems.length) return { problems }
  return {
    problems: [],
    detail: `${files.length} Akten-Dateien, ${links} relative Verweise, ${ids.length} aktive Punkte (IDs eindeutig), ${konzepte} Konzepte mit Statuskopf, ${dringend} DRINGEND-Akte(n) eingeordnet`,
  }
}

// ---------- M10-002 ----------
const PLACEHOLDER = /(<[A-Za-zÄÖÜäöüß][^>]*>|YYYY-MM-DD|noch nicht committed|<Hash)/u
const SECTIONS = [
  { name: 'Ziel der Sitzung', accepted: /^(?:Ziel der Sitzung|Ziel|Auftrag und Ziel|Zweck)/iu, verwandt: /^(?:Ziel|Auftrag|Zweck|Ausgangslage)/iu },
  { name: 'Ergebnis', accepted: /^(?:Ergebnis|Ergebnis und Stand)/iu, verwandt: /^(?:Ergebnis|Was jetzt da ist|Stand|Resultat|Erreicht|Bericht)/iu },
  { name: 'Geänderte Bereiche', accepted: /^Ge(?:ä|ae)nderte Bereiche/iu, verwandt: /^(?:Ge(?:ä|ae)nderte|Betroffene|Ber(?:ü|ue)hrte|Dateien)/iu },
  { name: 'Entscheidungen und Annahmen', accepted: /^Entscheidungen(?: und Annahmen)?/iu, verwandt: /^(?:Entscheidung|Annahme|Abweichung)/iu },
  { name: 'Prüfungen', accepted: /^Pr(?:ü|ue)fungen/iu, verwandt: /^(?:Pr(?:ü|ue)fung|Test|Beleg|Nachweis|Pr(?:ü|ue)fkette)/iu },
  { name: 'Offene Punkte und Risiken', accepted: /^Offene Punkte(?: und Risiken)?/iu, verwandt: /^(?:Offene|Risiko|Rest|Grenze|Nicht gepr(?:ü|ue)ft)/iu },
  { name: 'Empfohlener nächster Schritt', accepted: /^(?:Empfohlener n(?:ä|ae)chster Schritt|N(?:ä|ae)chster Schritt)/iu, verwandt: /^(?:Empfohlen|N(?:ä|ae)chste|Empfehlung|Weiter)/iu },
  { name: 'Git', accepted: /^Git/iu, verwandt: /^(?:Git|Commit|Versionierung)/iu },
]
const FIELDS = [
  { name: 'Datum', re: /^\*\*Datum:\*\*\s*(.*)$/mu },
  { name: 'Bearbeitet durch', re: /^\*\*(?:Bearbeitet durch|Bearbeiter|Verfasst von):\*\*\s*(.*)$/mu },
  { name: 'Auftrag', re: /^\*\*Auftrag:\*\*\s*(.*)$/mu },
  { name: 'Status', re: /^\*\*Status:\*\*\s*(.*)$/mu },
]

function pruefeUebergabe(dir, { strictFrom = SPEC_DATE } = {}) {
  const problems = []
  const warnings = []
  const names = readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'README.md')
  let strict = 0
  let historisch = 0
  for (const name of names) {
    const body = readFileSync(join(dir, name), 'utf8')
    const date = /^(\d{4}-\d{2}-\d{2})/u.exec(name)?.[1] ?? ''
    const isStrict = date >= strictFrom
    if (isStrict) strict += 1
    else historisch += 1
    const found = []
    const fehlend = []
    const abweichend = []
    const headings = headingsOf(body)
    for (const section of SECTIONS) {
      const exact = headings.find((h) => section.accepted.test(h))
      if (exact) { found.push(section.name); continue }
      const related = headings.find((h) => section.verwandt.test(h))
      if (related) { abweichend.push(`${section.name} -> "${related}"`); found.push(section.name); continue }
      fehlend.push(section.name)
    }
    const line = (message) => (isStrict ? problems : warnings).push(`${name}: ${message}`)

    // Pflichtfelder: vorhanden, nicht leer, kein Platzhalter
    for (const field of FIELDS) {
      const match = field.re.exec(body)
      if (!match) { line(`Kopffeld "${field.name}" fehlt`); continue }
      if (!match[1].trim() || PLACEHOLDER.test(match[1])) line(`Kopffeld "${field.name}" ist leer oder Platzhaltertext`)
    }
    for (const missing of fehlend) line(`Pflichtabschnitt fehlt: ${missing}`)
    // Eine gleichwertige, aber nicht in der Liste gefuehrte Ueberschrift ist KEIN Mangel:
    // sie wird gemeldet, damit ein Mensch sie ansieht (Karte: fehlender Inhalt != andere Ueberschrift).
    for (const variant of abweichend) warnings.push(`${name}: abweichende Ueberschrift (gleichwertig, bitte pruefen): ${variant}`)
    if (!body.includes('# ') || /^#\s*Übergabe:\s*<Titel>/mu.test(body)) line('Titelzeile fehlt oder ist Platzhalter')

    // Pruefnachweis
    const pruefHeading = headings.find((h) => SECTIONS[4].accepted.test(h) || SECTIONS[4].verwandt.test(h)) ?? 'Prüfungen'
    const pruefBody = sectionBody(body, pruefHeading)
    const nachweis = /(npm run|cargo |node --check|Exit \d|Exit-Code|bestanden|gr(?:ü|ue)n|passed)/iu.test(pruefBody)
    // Eine Zeile, die NUR "nicht ausgeführt" sagt, ist der Platzhalter der Vorlage. Mit Begruendung
    // ("nicht ausgeführt — kein Bau noetig") ist es eine Aussage und bleibt zulaessig.
    const leereZeile = /^\s*\|[^|]*\|\s*nicht ausgef(?:ü|ue)hrt\s*\|\s*$/mu.test(pruefBody)
    if (!nachweis || leereZeile) line('kein Pruefnachweis (ausgefuehrte Pruefung mit Exit oder Beleg fehlt)')

    // Revision
    const gitBody = sectionBody(body, headings.find((h) => SECTIONS[7].verwandt.test(h)) ?? 'Git')
    const revision = /\b[0-9a-f]{7,40}\b/u.test(gitBody) || /(nicht committed|noch nicht committed|keine Commits|kein Commit|nichts committed)/iu.test(gitBody)
    if (!revision) line('keine Revision (weder Commit-Hash noch ausdruecklicher Hinweis, dass nichts committet wurde)')
  }
  if (problems.length) return { problems, warnings }
  return { problems: [], warnings, detail: `${strict} Uebergaben ab ${strictFrom} streng geprueft, ${historisch} historische nur gemeldet` }
}

// ---------- Selbsttest der Uebergabepruefung (M10-002, Abnahme) ----------
function selftestUebergabe() {
  const dir = mkdtempSync(join(tmpdir(), 'akte-selftest-'))
  const kopf = (extra = '') => `# Übergabe: Prüffall\n\n**Datum:** 2026-10-08\n**Bearbeitet durch:** Faber\n**Auftrag:** Testfall\n**Status:** abgeschlossen\n${extra}`
  const gut = [
    kopf(),
    '## Ziel der Sitzung\nEtwas bauen.\n',
    '## Ergebnis\nGebaut.\n',
    '## Geänderte Bereiche\n- `scripts/x.mjs` – neu\n',
    '## Entscheidungen und Annahmen\n- keine\n',
    '## Prüfungen\n\n| Prüfung | Ergebnis |\n|---|---|\n| `npm run check` | Exit 0, 719 Tests |\n',
    '## Offene Punkte und Risiken\n- [ ] nichts\n',
    '## Empfohlener nächster Schritt\n1. weiter\n',
    '## Git\n- Commit: `abc1234`\n',
  ].join('\n')
  const varianten = gut.replace('## Ziel der Sitzung', '## Auftrag und Zweck').replace('## Geänderte Bereiche', '## Betroffene Bereiche')
  const ohnePruefnachweis = gut.replace('| `npm run check` | Exit 0, 719 Tests |', '| `npm run check` | nicht ausgeführt |')
  const ohneRevision = gut.replace('- Commit: `abc1234`', '- Commit: offen')
  const platzhalter = gut.replace('**Auftrag:** Testfall', '**Auftrag:** <Auftrag und gewünschtes Ergebnis>')
  const faelle = [
    ['gleichwertige andere Ueberschrift besteht', varianten, 0],
    ['fehlender Pruefnachweis scheitert', ohnePruefnachweis, 1],
    ['Pruefzeile "nicht ausgefuehrt" MIT Begruendung besteht', gut.replace('| `npm run check` | Exit 0, 719 Tests |', '| `npm run build` | nicht ausgeführt — kein Bau nötig |'), 0],
    ['fehlende Revision scheitert', ohneRevision, 1],
    ['Platzhaltertext im Pflichtfeld scheitert', platzhalter, 1],
    ['Pflichtabschnitt fehlt scheitert', gut.replace('## Offene Punkte und Risiken\n- [ ] nichts\n', ''), 1],
  ]
  let ok = 0
  for (const [name, content, erwartet] of faelle) {
    writeFileSync(join(dir, '2026-10-08-prueffall.md'), content)
    const result = pruefeUebergabe(dir, { strictFrom: '2026-10-08' })
    const passt = (result.problems.length ? 1 : 0) === erwartet
    console.log(`${passt ? 'ok      ' : 'FEHLER  '} | ${name} | erwartet ${erwartet === 1 ? 'scheitert' : 'besteht'}, ${result.problems.length ? 'scheitert' : 'besteht'}`)
    if (!passt) result.problems.forEach((p) => console.log(`          ${p}`))
    if (passt) ok += 1
  }
  rmSync(dir, { recursive: true, force: true })
  if (ok !== faelle.length) fail(`Selbsttest der Uebergabepruefung: ${ok} von ${faelle.length} Faellen wie erwartet`)
  console.log(`uebergabe-selftest: ${ok} von ${faelle.length} Faellen wie erwartet`)
}

const registry = {
  listen: checkListen,
  uebergabe: () => pruefeUebergabe(join(uebergabe, '05-uebergaben')),
  'uebergabe-selftest': selftestUebergabe,
}
const requested = process.argv.slice(2)
const run = requested.length ? requested : ['listen', 'uebergabe']
for (const name of run) {
  if (!registry[name]) fail(`unbekannter Regelkreis "${name}" (bekannt: ${Object.keys(registry).join(', ')})`)
  const result = registry[name]()
  if (result && result.problems && result.problems.length) {
    console.error(`Akte audit failed [${name}]:`)
    for (const p of result.problems) console.error(`  - ${p}`)
    process.exit(1)
  }
  if (result && result.detail) report(name, result.detail, result.warnings ?? [])
}
