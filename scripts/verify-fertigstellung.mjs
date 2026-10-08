/** One bounded entry point for the authorized local acceptance runs. No deployment or push. */
import { spawn } from 'node:child_process'
import { mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const output = resolve(process.env.COMMIETOOLS_EVIDENCE_DIR ?? 'QM/83-ms1-ms7-2026-10-08')
mkdirSync(output, { recursive: true })
const results = []
const npmCli = process.env.npm_execpath
if (!npmCli && !process.argv.includes('--pdf-only')) throw new Error('Run npm run verify:finish so npm CLI identity is explicit')
const steps = [
  ['signer-build-a', process.execPath, ['scripts/build-signer.mjs', 'tmp/ms-remap-a']],
  ['signer-build-b', process.execPath, ['scripts/build-signer.mjs', 'tmp/ms-remap-b', 'tmp/ms-remap-b-output']],
  ['rust-components', process.execPath, ['scripts/rust-components.mjs']],
  ['workflow', process.execPath, ['scripts/workflow-audit.mjs']],
  ['licenses', process.execPath, [npmCli, 'run', 'licenses:generate']],
  ['check', process.execPath, [npmCli, 'run', 'check']],
  ['build', process.execPath, [npmCli, 'run', 'build']],
  ['async-browser', process.execPath, ['scripts/async-browser-audit.mjs']],
  ['pdf-browser', process.execPath, ['scripts/pdf-browser-audit.mjs']],
  ['ocr-browser', process.execPath, ['scripts/ocr-browser-audit.mjs']],
  ['offline-browser', process.execPath, ['scripts/offline-browser-audit.mjs']],
  ['a11y-browser', process.execPath, ['scripts/ui-browser-audit.mjs']],
  ['viewport-browser', process.execPath, ['scripts/ui-browser-audit.mjs', 'overflow']]
]
if (process.argv.includes('--pdf-only')) { steps.splice(0, 8); steps.splice(1) }
if (process.argv.includes('extras')) {
  steps.splice(0, steps.length,
    ['workflow', process.execPath, ['scripts/workflow-audit.mjs']],
    ['menu-mutants', process.execPath, ['scripts/menu-mutants.mjs']],
    ['language-mutants', process.execPath, ['scripts/language-mutants.mjs']],
    ['download-browser', process.execPath, ['scripts/download-browser-audit.mjs']],
    ['menu-keyboard', process.execPath, ['scripts/menu-keyboard-audit.mjs']],
    ['fresh-checkout', process.execPath, ['scripts/fresh-checkout-audit.mjs']])
}
if (process.argv.includes('remaining')) {
  steps.splice(0, steps.length,
    ['download-browser', process.execPath, ['scripts/download-browser-audit.mjs']],
    ['pdf-mutants', process.execPath, ['scripts/pdf-mutants.mjs']])
}
if (process.argv.includes('advisories')) steps.splice(0, steps.length, ['rust-advisories', process.execPath, ['scripts/rust-advisories.mjs']])
if (process.argv.includes('public-read')) steps.splice(0, steps.length, ['production-readonly', process.execPath, ['scripts/production-readonly-audit.mjs']])
if (process.argv.includes('de')) steps.splice(0, steps.length, ['de-browser', process.execPath, ['scripts/de-browser-audit.mjs']], ['menu-keyboard', process.execPath, ['scripts/menu-keyboard-audit.mjs']])
if (process.argv.includes('rust-patches')) {
  steps.splice(0, steps.length,
    ['patch-crossbeam', 'cargo', ['+1.99.0', 'update', '--manifest-path', 'crates/pdf-signer-engine/Cargo.toml', '-p', 'crossbeam-epoch', '--precise', '0.9.20']],
    ['patch-rustls', 'cargo', ['+1.99.0', 'update', '--manifest-path', 'crates/pdf-signer-engine/Cargo.toml', '-p', 'rustls', '--precise', '0.23.45']],
    ['rust-test', 'cargo', ['+1.99.0', 'test', '--locked', '--manifest-path', 'crates/pdf-signer-engine/Cargo.toml']])
}
if (process.argv.includes('final')) {
  steps.splice(0, steps.length,
    ['rust-components', process.execPath, ['scripts/rust-components.mjs']],
    ['licenses', process.execPath, [npmCli, 'run', 'licenses:generate']],
    ['check', process.execPath, [npmCli, 'run', 'check']],
    ['build', process.execPath, [npmCli, 'run', 'build']],
    ['workflow', process.execPath, ['scripts/workflow-audit.mjs']],
    ['async-browser', process.execPath, ['scripts/async-browser-audit.mjs']],
    ['pdf-browser', process.execPath, ['scripts/pdf-browser-audit.mjs']],
    ['ocr-browser', process.execPath, ['scripts/ocr-browser-audit.mjs']],
    ['offline-browser', process.execPath, ['scripts/offline-browser-audit.mjs']],
    ['download-browser', process.execPath, ['scripts/download-browser-audit.mjs']],
    ['menu-mutants', process.execPath, ['scripts/menu-mutants.mjs']],
    ['menu-keyboard', process.execPath, ['scripts/menu-keyboard-audit.mjs']],
    ['language-mutants', process.execPath, ['scripts/language-mutants.mjs']],
    ['pdf-mutants', process.execPath, ['scripts/pdf-mutants.mjs']],
    ['de-browser', process.execPath, ['scripts/de-browser-audit.mjs']],
    ['craft-browser', process.execPath, ['scripts/craft-browser-audit.mjs']],
    ['offline-locales', process.execPath, ['scripts/offline-locale-audit.mjs']],
    ['pdf-ui', process.execPath, ['scripts/pdf-ui-acceptance.mjs']],
    ['fresh-checkout', process.execPath, ['scripts/fresh-checkout-audit.mjs']],
    ['rust-advisories', process.execPath, ['scripts/rust-advisories.mjs']],
    ['release-manifest', process.execPath, ['scripts/release-manifest.mjs']])
}
if (process.argv.includes('repro')) {
  steps.splice(0, steps.length,
    ['signer-build-a', process.execPath, ['scripts/build-signer.mjs', 'tmp/ms-reference-a']],
    ['signer-build-b', process.execPath, ['scripts/build-signer.mjs', 'tmp/ms-reference-b', 'tmp/ms-reference-b-output']],
    ['rust-components', process.execPath, ['scripts/rust-components.mjs']],
    ['licenses', process.execPath, [npmCli, 'run', 'licenses:generate']],
    ['fresh-checkout', process.execPath, ['scripts/fresh-checkout-audit.mjs']])
}
if (process.argv.includes('root-final')) {
  steps.splice(0, steps.length,
    ['check', process.execPath, [npmCli, 'run', 'check']],
    ['build', process.execPath, [npmCli, 'run', 'build']],
    ['workflow', process.execPath, ['scripts/workflow-audit.mjs']],
    ['release-manifest', process.execPath, ['scripts/release-manifest.mjs']])
}
if (process.argv.includes('completion')) {
  steps.splice(0, steps.length,
    ['craft-browser', process.execPath, ['scripts/craft-browser-audit.mjs']],
    ['ocr-browser', process.execPath, ['scripts/ocr-browser-audit.mjs']])
}
if (process.argv.includes('language')) steps.splice(0, steps.length, ['language-mutants', process.execPath, ['scripts/language-mutants.mjs']])
if (process.argv.includes('craft')) steps.splice(0, steps.length, ['craft-browser', process.execPath, ['scripts/craft-browser-audit.mjs']])
if (process.argv.includes('offline-locales')) steps.splice(0, steps.length, ['offline-locales', process.execPath, ['scripts/offline-locale-audit.mjs']])
if (process.argv.includes('pdf-ui')) steps.splice(0, steps.length, ['pdf-ui', process.execPath, ['scripts/pdf-ui-acceptance.mjs']])
if (process.argv.includes('effects')) steps.splice(0, steps.length, ['pdf-browser', process.execPath, ['scripts/pdf-browser-audit.mjs']], ['pdf-mutants', process.execPath, ['scripts/pdf-mutants.mjs']])
if (process.argv.includes('access')) steps.splice(0, steps.length, ['platform-access', process.execPath, ['scripts/platform-access-audit.mjs']])
if (process.argv.includes('github-protect')) steps.splice(0, steps.length, ['github-protect', process.execPath, ['scripts/github-audit-setup.mjs', 'protect']])
if (process.argv.includes('github-pr')) steps.splice(0, steps.length, ['github-pr', process.execPath, ['scripts/github-audit-setup.mjs', 'pr']])
if (process.argv.includes('github-runs')) steps.splice(0, steps.length, ['github-runs', process.execPath, ['scripts/github-audit-setup.mjs', 'runs']])
if (process.argv.includes('github-logs')) steps.splice(0, steps.length, ['github-logs', process.execPath, ['scripts/github-audit-setup.mjs', 'logs']])
if (process.argv.includes('github-delivery')) steps.splice(0, steps.length, ['github-delivery', process.execPath, ['scripts/github-audit-setup.mjs', 'delivery']])
if (process.argv.includes('preview')) steps.splice(0, steps.length, ['preview-delivery', process.execPath, ['scripts/preview-delivery-audit.mjs']])
if (process.argv.includes('github-artifact')) steps.splice(0, steps.length, ['github-artifact', process.execPath, ['scripts/github-audit-setup.mjs', 'artifact']])
if (process.argv.includes('licenses-refresh')) steps.splice(0, steps.length, ['rust-components', process.execPath, ['scripts/rust-components.mjs']], ['licenses', process.execPath, [npmCli, 'run', 'licenses:generate']])
if (process.argv.includes('nel-preview')) steps.splice(0, steps.length, ['nel-preview', process.execPath, ['scripts/nel-preview-audit.mjs']])
for (const [name, executable, args] of steps) {
  console.log(`START ${name}`)
  const fd = openSync(resolve(output, `${name}.log`), 'w')
  let exit = await new Promise((done, reject) => {
    const child = spawn(executable, args, { stdio: ['ignore', fd, fd], windowsHide: true })
    child.once('error', reject); child.once('exit', done)
  })
  closeSync(fd)
  if (name === 'signer-build-b' && exit === 0) {
    try {
      assert.deepEqual(readFileSync('packages/tools/src/pdf/m7-wasm/engine_bg.wasm'), readFileSync(resolve(args[2], 'engine_bg.wasm')))
    } catch (error) {
      console.error(`Independent signer build differs: ${error.message}`)
      exit = 1
    }
  }
  results.push({ name, exit, log: `${name}.log` })
  console.log(`END ${name}: ${exit}`)
  const suffix = ['extras', 'remaining', 'repro', 'advisories', 'rust-patches', 'public-read', 'de', 'final', 'root-final', 'completion', 'language', 'craft', 'offline-locales', 'pdf-ui', 'effects', 'access', 'github-protect', 'github-pr', 'github-runs'].find((mode) => process.argv.includes(mode))
  writeFileSync(resolve(output, `verification${suffix ? '-' + suffix : ''}.json`), JSON.stringify({ results }, null, 2) + '\n')
}
if (results.some((result) => result.exit !== 0)) process.exitCode = 1
