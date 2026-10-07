// Pruefer fuer die Architekturentscheidungen (Karte M2-005).
//
// Vier Regeln, alle aus der Karte:
//   1. Jede ADR-Datei hat genau EINEN Indexeintrag (Vollstaendigkeit, keine Doppelzeile).
//   2. Jeder Indexeintrag verweist auf eine vorhandene Datei (Existenz).
//   3. Keine zwei AKTIVEN Entscheidungen tragen dieselbe Nummer (Eindeutigkeit).
//      Eine Weiterverweisakte ist keine eigene Entscheidung und zaehlt nicht mit.
//   4. Jede Weiterverweisakte nennt einen vorhandenen Nachfolger, und der Nachfolger nennt
//      die Weiterverweisakte (alte und neue Verweise loesen sich auf).
//
// Usage: node scripts/adr-audit.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const adrDir = join(root, 'uebergabe', '04-entscheidungen')
const indexName = 'README.md'
const stubMarker = /^\*\*Status:\*\*\s*Weiterverweis\b/m

function fail(message) {
  console.error(`ADR audit failed: ${message}`)
  process.exit(1)
}

const entries = readdirSync(adrDir).filter((name) => /^\d{4}-.+\.md$/u.test(name)).sort()
if (!entries.length) fail(`no ADR files found in ${adrDir}`)

const indexContent = readFileSync(join(adrDir, indexName), 'utf8')
const indexLinks = [...indexContent.matchAll(/\]\(([^)]+)\)/gu)]
  .map((match) => match[1])
  .filter((target) => /^\d{4}-.+\.md$/u.test(target))

const files = new Map(entries.map((name) => [name, readFileSync(join(adrDir, name), 'utf8')]))

// Regel 1 + 3
const seenIds = new Map()
const problems = []
for (const [name, content] of files) {
  const id = name.slice(0, 4)
  const count = indexLinks.filter((target) => target === name).length
  if (count !== 1) problems.push(`${name}: ${count === 0 ? 'fehlt im Index' : `steht ${count}x im Index`}`)
  const isStub = stubMarker.test(content)
  if (!isStub) {
    if (seenIds.has(id)) problems.push(`Nummer ${id} doppelt: ${seenIds.get(id)} und ${name}`)
    else seenIds.set(id, name)
  }
}
if (problems.length) fail(problems.join('\n  '))

// Regel 2
for (const target of new Set(indexLinks)) {
  if (!existsSync(join(adrDir, target))) fail(`Index verweist auf eine fehlende Datei: ${target}`)
}

// Regel 2b: jeder relative Verweis INNERHALB einer ADR-Datei muss aufloesen.
for (const [name, content] of files) {
  for (const match of content.matchAll(/\]\(([^)]+)\)/gu)) {
    const target = match[1].trim()
    if (!target || target.startsWith('#') || /^[a-z]+:/iu.test(target)) continue
    const path = target.split('#')[0]
    if (!path) continue
    if (!existsSync(join(adrDir, path))) fail(`${name} verweist auf eine fehlende Datei: ${target}`)
  }
}

// Regel 4
const stubs = [...files].filter(([, content]) => stubMarker.test(content))
for (const [name, content] of stubs) {
  // Der Nachfolger steht **in der Status-Zeile** — nicht irgendein Verweis irgendwo im Text.
  const statusLine = content.split('\n').find((line) => /^\*\*Status:\*\*\s*Weiterverweis\b/u.test(line)) ?? ''
  const target = /\]\(([^)]+)\)/u.exec(statusLine)?.[1]
  if (!target || !/^\d{4}-.+\.md$/u.test(target)) fail(`Weiterverweisakte ${name}: die Status-Zeile nennt keinen Nachfolger (erwartet einen Link auf "<NNNN>-….md")`)
  if (!files.has(target)) fail(`Weiterverweisakte ${name} verweist auf eine fehlende Datei: ${target}`)
  if (!files.get(target).includes(`](${name})`)) fail(`Nachfolger ${target} verlinkt die Weiterverweisakte ${name} nicht (nur der Dateiname als Text genügt nicht)`)
}

const ids = entries.map((name) => name.slice(0, 4)).filter((id, position, all) => all.indexOf(id) === position)
console.log(`ADR check passed: ${entries.length} files, ${ids.length} decisions + ${stubs.length} Weiterverweisakte(n), index complete, ids unique`)
