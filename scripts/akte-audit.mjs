// Pruefer fuer die Akte (QM-Karten M10-001 ff.).
//
// Regelkreise, jeder aus einer Karte:
//   listen    (M10-001) Die verbindliche Aufgabenliste fuehrt NUR offene Arbeit.
//                        - kein "[x]" in der Aufgabenliste
//                        - jeder offene Punkt traegt eine eindeutige ID "OP-nnn"
//                        - jeder relative Verweis in der Akte loest auf (Datei und Anker)
//                        - jedes Konzept unter 03-konzepte/ hat einen Statuskopf
//                        - jede DRINGEND-Akte nennt ihren Zustand (offen oder historisch)
//
// Usage: node scripts/akte-audit.mjs [listen]
//        ohne Argument laufen die Regelkreise der Akte.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const uebergabe = join(root, 'uebergabe')

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
function withoutCode(text) {
  return text.replace(/```[\s\S]*?```/gu, '').replace(/`[^`\n]*`/gu, '')
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

const registry = { listen: checkListen }
const requested = process.argv.slice(2)
const run = requested.length ? requested : ['listen']
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
