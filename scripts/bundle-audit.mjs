import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const dist = fileURLToPath(new URL('../apps/web/dist/', import.meta.url))
const html = await readFile(join(dist, 'index.html'), 'utf8')
const entryMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/u)
if (!entryMatch) throw new Error('Could not find the production entry script in index.html')

const forbidden = /(?:pdfjs|pdf-lib|mupdf|qpdf|pdf\.worker)/iu
const entryBudget = 250 * 1024
const visited = new Set()

async function inspect(file) {
  const absolute = resolve(dist, file.replace(/^[\\/]+/u, ''))
  if (visited.has(absolute)) return
  visited.add(absolute)
  const source = await readFile(absolute, 'utf8')
  if (forbidden.test(basename(absolute))) {
    throw new Error(`Heavy PDF engine is statically reachable from the initial page: ${basename(absolute)}`)
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
const optionalPdfFiles = assets.filter((name) => forbidden.test(name) || /^(?:Pdf|ImagesToPdf-|pdf-|pdfUi-)/u.test(name))
console.log(`Bundle audit passed: entry ${compressedSize} B gzip; optional PDF artifacts: ${optionalPdfFiles.length}`)
