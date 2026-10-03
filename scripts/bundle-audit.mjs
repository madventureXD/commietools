import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const dist = fileURLToPath(new URL('../apps/web/dist/', import.meta.url))
const html = await readFile(join(dist, 'index.html'), 'utf8')
const entryMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/u)
if (!entryMatch) throw new Error('Could not find the production entry script in index.html')

const entryBudget = 250 * 1024

/**
 * Schwere Engines. Geprüft wird **inhaltlich**, nicht über den Dateinamen: ein umbenannter
 * Chunk darf die Sperre nicht umgehen (der Dateiname-Test war die Lücke, die den Start
 * einmal 10,4 MB WASM laden ließ).
 */
const engines = [
  {
    label: 'PDF',
    content: /(?:pdfjs|pdf-lib|mupdf|qpdf|PDFDocument)/u,
    filename: /(?:pdfjs|pdf-lib|mupdf|qpdf|pdf\.worker)/iu,
    /** Engines, die beim Start erreichbar sein dürfen, gibt es nicht. */
    staticBudget: 0
  },
  {
    label: 'Rechenkern (mathjs)',
    content: /(?:parseDependencies|DecimalError|typed-function)/u,
    filename: /(?:^|[-_])core[-_]/iu,
    /** Nachgeladen erlaubt, aber nicht unbegrenzt: gemessen 94,3 KiB, Reserve für Welle 2. */
    routeBudget: 110 * 1024
  }
]

const visited = new Set()
const staticSources = new Map()

async function inspect(file) {
  const absolute = resolve(dist, file.replace(/^[\\/]+/u, ''))
  if (visited.has(absolute)) return
  visited.add(absolute)
  const source = await readFile(absolute, 'utf8')
  staticSources.set(absolute, source)

  for (const engine of engines) {
    if (engine.filename.test(basename(absolute))) {
      throw new Error(`${engine.label} engine is statically reachable from the initial page (by name): ${basename(absolute)}`)
    }
    if (engine.staticBudget === 0 && engine.content.test(source)) {
      throw new Error(`${engine.label} engine is statically reachable from the initial page (by content): ${basename(absolute)}`)
    }
  }

  const staticImports = [...source.matchAll(/(?:^|;)import(?:[^"'(]*?from)?["']([^"']+)["']/gu)]
  for (const match of staticImports) {
    const specifier = match[1]
    if (specifier?.startsWith('.')) await inspect(join(dirname(file), specifier))
  }
}

await inspect(entryMatch[1])
const entryFile = resolve(dist, entryMatch[1].replace(/^[\\/]+/u, ''))
const entrySource = await readFile(entryFile)
const compressedSize = gzipSync(entrySource).length
if (compressedSize > entryBudget) {
  throw new Error(`Initial entry exceeds ${entryBudget} compressed bytes: ${compressedSize}`)
}

const assets = await readdir(join(dist, 'assets'))

/**
 * Nachgeladene Engine-Chunks über ihren **Inhalt** finden und budgetieren. So bleibt die
 * Prüfung wirksam, wenn ein Chunk umbenannt oder anders geschnitten wird.
 */
const reported = []
for (const name of assets) {
  if (!name.endsWith('.js')) continue
  const file = join(dist, 'assets', name)
  if (staticSources.has(resolve(file))) continue
  const source = await readFile(file, 'utf8')
  for (const engine of engines) {
    if (engine.routeBudget === undefined) continue
    if (!engine.content.test(source)) continue
    const size = gzipSync(source).length
    if (size > engine.routeBudget) {
      throw new Error(`${engine.label} chunk exceeds its route budget of ${engine.routeBudget} bytes: ${name} at ${size} bytes`)
    }
    reported.push(`${name} ${size} B`)
  }
}

const optionalPdfFiles = assets.filter((name) => engines[0].filename.test(name) || /^(?:Pdf|ImagesToPdf-|pdf-|pdfUi-)/u.test(name))
console.log(`Bundle audit passed: entry ${compressedSize} B gzip; optional PDF artifacts: ${optionalPdfFiles.length}`)
for (const line of reported) console.log(`  route engine: ${line}`)
