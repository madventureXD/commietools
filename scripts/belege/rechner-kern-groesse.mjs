/**
 * Beleg: Was kostet der mathjs-Rechenkern je Rechnerart?
 *
 * Portiert aus `work/rechner-mathjs-messung.mjs` (2026-10-04) im Durchzug der QM-Stufe R8
 * (Karte M10-004). Fachlich unveraendert: je Variante wird ein eigenstaendiges Buendel gebaut
 * (esbuild, --bundle --minify) und roh sowie gzip gemessen. Grundlage der Zahlen in ADR 0005.
 *
 * Portabel gemacht:
 *   - gemessen wird in einem **temporaeren** Ordner (vorher: `out/` im Arbeitsverzeichnis),
 *   - `mathjs` und `esbuild` werden **vor** der Messung geprueft (klarer Abbruch, Exit 2),
 *   - der temporaere Ordner wird immer aufgeraeumt.
 *
 * Aufruf:  npm run beleg:rechner-kern
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { REPO, abbruch, pruefeDatei } from './voraussetzungen.mjs'

const ARITHMETIC = ['add', 'subtract', 'multiply', 'divide', 'unaryMinus', 'pow', 'mod', 'bignumber', 'fraction', 'format', 'evaluate', 'parse', 'compile', 'typeOf', 'numeric']
const ROUNDING = ['abs', 'round', 'floor', 'ceil', 'fix', 'sign']
const LISTS = ['max', 'min', 'sum', 'gcd', 'lcm']
const TRIG = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh']
const LOGPOW = ['log', 'log10', 'log2', 'exp', 'sqrt', 'cbrt', 'nthRoot', 'pow', 'pi', 'e']
const COMBIN = ['factorial', 'combinations', 'permutations']
const UNITS = ['unit']
const BITS = ['bitAnd', 'bitOr', 'bitXor', 'bitNot', 'leftShift', 'rightArithShift', 'rightLogShift']

const dedupe = (a) => [...new Set(a)]

const VARIANTS = {
  // Heutiger Stand: die kuratierte Liste der Suite (Vergleichsmassstab).
  heute_gesamt: dedupe([...ARITHMETIC, ...ROUNDING, ...LISTS, ...TRIG, ...LOGPOW, ...COMBIN, ...UNITS, ...BITS]),
  standard: dedupe([...ARITHMETIC, ...ROUNDING, ...LISTS]),
  wissenschaftlich: dedupe([...ARITHMETIC, ...ROUNDING, ...LISTS, ...TRIG, ...LOGPOW, ...COMBIN, ...UNITS]),
  programmierer: dedupe([...ARITHMETIC, ...ROUNDING, ...LISTS, ...BITS]),
  rpn: dedupe([...ARITHMETIC, ...ROUNDING, ...LISTS, 'sqrt', 'factorial', 'pow']),
}

pruefeDatei(join(REPO, 'node_modules', 'mathjs'), 'Abhaengigkeit mathjs (npm install)')
pruefeDatei(join(REPO, 'node_modules', 'esbuild'), 'Abhaengigkeit esbuild (npm install)')

let build
try {
  ({ build } = await import('esbuild'))
} catch (error) {
  abbruch(`esbuild laesst sich nicht laden: ${error.message}`)
}

const out = mkdtempSync(join(tmpdir(), 'ct-rechnerkern-'))
try {
  const results = []
  for (const [name, factories] of Object.entries(VARIANTS)) {
    const imports = factories.map((f) => `${f}Dependencies`).join(', ')
    const entry = `import { create, ${imports} } from 'mathjs'\ncreate({ ${imports} }, { number: 'BigNumber' })\n`
    writeFileSync(join(out, `${name}.entry.js`), entry)
    await build({
      entryPoints: [join(out, `${name}.entry.js`)],
      bundle: true,
      minify: true,
      format: 'esm',
      target: 'es2020',
      outfile: join(out, `${name}.bundle.js`),
      logLevel: 'error',
      absWorkingDir: REPO,
      // Der Einstieg liegt in einem temporaeren Ordner — `mathjs` wird deshalb ueber den
      // Modulordner des Projekts aufgeloest (sonst waere die Messung ortsgebunden).
      nodePaths: [join(REPO, 'node_modules')],
    })
    const raw = readFileSync(join(out, `${name}.bundle.js`))
    const gz = gzipSync(raw, { level: 9 }).length
    results.push({ name, factories: factories.length, raw: raw.length, gzip: gz })
  }

  console.log('Variante          Factories      roh B      gzip B    gzip KiB')
  for (const r of results) {
    console.log(
      r.name.padEnd(18),
      String(r.factories).padStart(4),
      String(r.raw).padStart(12),
      String(r.gzip).padStart(12),
      (r.gzip / 1024).toFixed(1).padStart(10),
    )
  }
  console.log(`\nGemessen mit esbuild/gzip -9 gegen node_modules/mathjs in ${REPO}`)
  console.log('BELEG ERBRACHT')
} finally {
  rmSync(out, { recursive: true, force: true })
}
