import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const dist = fileURLToPath(new URL('../apps/web/dist/', import.meta.url))
const html = await readFile(join(dist, 'index.html'), 'utf8')
const entryMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/u)
if (!entryMatch) throw new Error('Could not find the production entry script in index.html')

const warningBudgets = { entry: 200 * 1024, catalogBase: 15 * 1024, searchLocale: 25 * 1024, toolMessages: 30 * 1024, uiMessages: 30 * 1024 }
const baselinePath = fileURLToPath(new URL('./bundle-size-baseline.json', import.meta.url))
let baseline = {}
try { baseline = JSON.parse(await readFile(baselinePath, 'utf8')) } catch { /* Optional until the first baseline is checked in. */ }
function warnSize(label, size, budget, baselineKey) {
  const previous = Number(baseline[baselineKey])
  const delta = Number.isFinite(previous) ? `, ${size - previous >= 0 ? '+' : ''}${size - previous} B zum Referenzstand` : ''
  console.warn(`${size > budget ? 'WARNUNG' : 'Größe'}: ${label} ${size} B gzip (Warnschwelle ${budget} B${delta})`)
}

/**
 * Schwere Engines. Geprüft wird **inhaltlich**, nicht über den Dateinamen: ein umbenannter
 * Chunk darf die Sperre nicht umgehen (der Dateiname-Test war die Lücke, die den Start
 * einmal 10,4 MB WASM laden ließ).
 */
const engines = [
  {
    label: 'PDF',
    // Package/runtime signatures, not plain product names that may legitimately
    // occur in the searchable catalogue or explanatory copy.
    content: /(?:pdfjs-dist|pdf-lib|mupdf-wasm|qpdf-wasm|PDFDocument)/u,
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
if (/(?:search|tools|ui)-(?!en-)[a-z]{2,3}(?:-[A-Z]{2})?-/u.test(basename(absolute))) throw new Error(`Optionales Sprachpaket ist statisch vom Start erreichbar: ${basename(absolute)}`)
  if (/(?:Werkzeuge|Herramientas|Datenschutz|Privacidad)/u.test(source)) throw new Error(`Nicht-englische Sprachdaten sind statisch vom Start erreichbar: ${basename(absolute)}`)

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
warnSize('initiales JavaScript', compressedSize, warningBudgets.entry, 'entry')

const assets = await readdir(join(dist, 'assets'))
const languageAssets = assets.filter((item) => /^(?:search|tools|ui)-[a-z]{2,3}(?:-[A-Z]{2})?-.*\.js$/u.test(item))
const serviceWorker = await readFile(join(dist, 'sw.js'), 'utf8')
for (const name of languageAssets) {
  if (serviceWorker.includes(`assets/${name}`)) throw new Error(`Sprachpaket wird unzulässig vorab gecacht: ${name}`)
}

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
      console.warn(`WARNUNG: ${engine.label}-Chunk überschreitet ${engine.routeBudget} B gzip: ${name} mit ${size} B`)
    }
    reported.push(`${name} ${size} B`)
  }
}

const optionalPdfFiles = assets.filter((name) => engines[0].filename.test(name) || /^(?:Pdf|ImagesToPdf-|pdf-|pdfUi-)/u.test(name))
for (const name of assets.filter((item) => item.startsWith('catalog-base-') || (languageAssets.includes(item) && !item.startsWith('tools-')))) {
  const size = gzipSync(await readFile(join(dist, 'assets', name))).length
  const kind = name.startsWith('catalog-base') ? 'catalogBase' : name.startsWith('search-') ? 'searchLocale' : 'uiMessages'
  const locale = /^(?:search|ui)-([a-z]{2,3}(?:-[A-Z]{2})?)-/u.exec(name)?.[1] ?? 'base'
  warnSize(kind === 'catalogBase' ? 'Katalogbasis' : `${kind} ${locale}`, size, warningBudgets[kind], `${kind}:${locale}`)
}
/**
 * Die Werkzeugtexte liegen **je Werkzeug** (2026-10-05): 49 Pakete je Sprache (gemeinsame Texte
 * plus ein Paket je Werkzeug). Zwei Kennzahlen, weil eine allein in die Irre führt:
 *
 * 1. **Was eine Werkzeugroute lädt**: gemeinsames Paket + größtes Werkzeugpaket. Das ist die
 *    Last, die ein Besuch tatsächlich zahlt — sie wird gegen die alte Schwelle geprüft.
 * 2. **Summe je Sprache** (alle 49 Pakete): rein informativ mit eigener, weiterer Schwelle. Sie
 *    wächst gegenüber einem Einzelpaket allein durch den gzip-Kopf je Datei (gemessen +28 %) und
 *    sagt nichts über die Last eines Besuchs.
 */
const toolTextTotals = new Map()
for (const name of assets.filter((item) => item.startsWith('tools-') && item.endsWith('.js'))) {
  const locale = /^tools-([a-z]{2,3}(?:-[A-Z]{2})?)-/u.exec(name)?.[1]
  if (!locale) continue
  const entry = toolTextTotals.get(locale) ?? { bytes: 0, count: 0, common: 0, largest: 0, largestName: '' }
  const size = gzipSync(await readFile(join(dist, 'assets', name))).length
  entry.bytes += size
  entry.count += 1
  if (name.startsWith(`tools-${locale}-common-`)) entry.common = size
  else if (size > entry.largest) { entry.largest = size; entry.largestName = name }
  toolTextTotals.set(locale, entry)
}
/**
 * Die **Summe** aller Werkzeugtextpakete je Sprache ist keine Last eines Besuchs — ein Besuch
 * lädt genau ein Werkzeug. Sie ist eine Kontrolle gegen ausufernde Einzelpakete. Jede Datei
 * trägt einen eigenen gzip-Kopf, die Summe wächst also schon mit der Zahl der Pakete; eine
 * feste Obergrenze wird damit mit jedem neuen Werkzeug enger, ohne dass etwas größer wird.
 * Deshalb ist die Schwelle **je Paket** gerechnet (850 B gzip; gemessen am 2026-10-05: 779/703/766 B
 * je Paket). Entscheidung und Messwerte: ADR 0011.
 */
const toolMessagesTotalPerPackage = 850
for (const [locale, total] of toolTextTotals) {
  warnSize(`toolMessages ${locale} je Route (gemeinsam ${total.common} + größtes Werkzeug ${total.largest})`, total.common + total.largest, warningBudgets.toolMessages, `toolMessagesRoute:${locale}`)
  warnSize(`toolMessages ${locale} gesamt (${total.count} Pakete, ${toolMessagesTotalPerPackage} B je Paket)`, total.bytes, toolMessagesTotalPerPackage * total.count, `toolMessagesTotal:${locale}`)
}
console.log(`Bundle audit passed: entry ${compressedSize} B gzip; optional PDF artifacts: ${optionalPdfFiles.length}`)
for (const line of reported) console.log(`  route engine: ${line}`)
