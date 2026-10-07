// Generierter Bestandsblock der Haupt-README (Karte M1-001).
//
// Die Umfangszahlen der README werden **aus dem kanonischen Katalog abgeleitet**, nicht im
// Fliesstext gepflegt. Dieses Skript schreibt einen klar markierten Block zwischen zwei
// HTML-Kommentarmarken und prueft ihn; `npm run check` faellt, sobald der Block veraltet ist.
//
// Usage: node scripts/readme-scope.mjs generate|check
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestsPath = join(root, 'packages', 'tools', 'src', 'catalog', 'manifests.ts')
const searchDir = join(root, 'packages', 'tools', 'src', 'catalog', 'generated', 'search')
const readmePath = process.env.README_SCOPE_PATH ? resolve(process.env.README_SCOPE_PATH) : join(root, 'README.md')
const mode = process.argv[2] ?? 'check'

const BEGIN = '<!-- BEGIN GENERATED SCOPE (scripts/readme-scope.mjs) -->'
const END = '<!-- END GENERATED SCOPE -->'

/** Feste Reihenfolge, damit die Ausgabe deterministisch bleibt und nicht von der Zaehlung abhaengt. */
const categoryOrder = ['text', 'pdf', 'image', 'developer', 'generator', 'calculator', 'craft']

function fail(message) {
  console.error(`README scope audit failed: ${message}`)
  process.exit(1)
}

async function loadManifests() {
  const source = readFileSync(manifestsPath, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText, 'utf8').toString('base64')}`)
}

const { toolManifests, suiteManifests } = await loadManifests()
if (!toolManifests.length) fail('no tool manifests found')

const languages = readdirSync(searchDir).filter((name) => name.endsWith('.ts')).map((name) => name.slice(0, -'.ts'.length)).sort()
const counts = new Map()
for (const tool of toolManifests) counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1)
const orderedCategories = [...categoryOrder.filter((c) => counts.has(c)), ...[...counts.keys()].filter((c) => !categoryOrder.includes(c)).sort()]
const pdfRoutes = counts.get('pdf') ?? 0

const block = [
  BEGIN,
  '<!-- Do not edit by hand: run `npm run readme:generate` after changing the catalogue. -->',
  '',
  `The canonical catalogue currently holds **${toolManifests.length} tools** across **${suiteManifests.length} curated suites** and **${languages.length} languages** (\`${languages.join('`, `')}\`). **${pdfRoutes}** of the tools are PDF tools.`,
  '',
  `- Per category: ${orderedCategories.map((c) => `${c} ${counts.get(c)}`).join(' · ')}`,
  `- Suites: ${suiteManifests.map((s) => `\`${s.id}\``).join(', ')}`,
  END
].join('\n')

/** Prueft die relativen Markdown-Links der README gegen den Dateibaum. */
function brokenLinks(content) {
  const broken = []
  for (const match of content.matchAll(/\]\(([^)]+)\)/gu)) {
    const target = match[1].trim()
    if (!target || target.startsWith('#') || /^[a-z]+:/iu.test(target)) continue
    const path = target.split('#')[0]
    if (!path) continue
    if (!existsSync(join(root, path))) broken.push(target)
  }
  return broken
}

const content = readFileSync(readmePath, 'utf8')

if (mode === 'generate') {
  if (!content.includes(BEGIN) || !content.includes(END)) fail(`README.md must contain the markers "${BEGIN}" and "${END}"`)
  const start = content.indexOf(BEGIN)
  const end = content.indexOf(END)
  if (end < start) fail('END marker appears before BEGIN marker')
  const next = content.slice(0, start) + block + content.slice(end + END.length)
  writeFileSync(readmePath, next, 'utf8')
  console.log(`README scope block written: ${toolManifests.length} tools, ${suiteManifests.length} suites, ${pdfRoutes} PDF routes, ${languages.length} languages`)
} else if (mode === 'check') {
  if (!content.includes(BEGIN) || !content.includes(END)) fail(`README.md must contain the markers "${BEGIN}" and "${END}"`)
  const start = content.indexOf(BEGIN)
  const end = content.indexOf(END)
  if (end < start) fail('END marker appears before BEGIN marker')
  const current = content.slice(start, end + END.length)
  if (current !== block) {
    const currentLines = current.split('\n')
    const expectedLines = block.split('\n')
    const index = currentLines.findIndex((line, position) => line !== expectedLines[position])
    const hint = index === -1 ? `line count differs (${currentLines.length} vs ${expectedLines.length})` : `first difference on line ${index + 1}:\n  now:      ${currentLines[index] ?? '<end of file>'}\n  expected: ${expectedLines[index] ?? '<end of file>'}`
    fail(`README scope block is out of date - run npm run readme:generate\n  ${hint}`)
  }
  const broken = brokenLinks(content)
  if (broken.length) fail(`README has broken links: ${broken.join(', ')}`)
  console.log(`README scope check passed: ${toolManifests.length} tools, ${suiteManifests.length} suites, ${pdfRoutes} PDF routes, ${languages.length} languages, links resolve`)
} else {
  fail(`unknown mode "${mode}" - use generate or check`)
}
