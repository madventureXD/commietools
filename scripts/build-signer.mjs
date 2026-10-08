import { spawnSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { homedir } from 'node:os'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const root = resolve('.')
const target = resolve(process.argv[2] ?? 'crates/pdf-signer-wasm/target')
const output = resolve(process.argv[3] ?? 'packages/tools/src/pdf/m7-wasm')
if (!target.startsWith(root + '\\') && !target.startsWith(root + '/')) throw new Error('Build target must stay in workspace')
if (!output.startsWith(root + '\\') && !output.startsWith(root + '/')) throw new Error('WASM output must stay in workspace')
const cli = spawnSync('wasm-bindgen', ['--version'], { encoding: 'utf8', windowsHide: true })
if (cli.status !== 0 || cli.stdout.trim() !== 'wasm-bindgen 0.2.129') throw new Error('Exact wasm-bindgen CLI 0.2.129 required')
// Cargo path package identities can change binary layout even after rustc source remapping.
// The Windows release contract uses one temporary virtual drive; underlying writes stay in this checkout.
const drive = 'J:'
let mapped = false
let buildRoot = root
if (process.platform === 'win32') {
  const probe = spawnSync('subst.exe', [], { encoding: 'utf8', windowsHide: true })
  const { existsSync } = await import('node:fs')
  if (probe.status !== 0 || existsSync(drive + '\\')) throw new Error('Reference build drive J: must be free; no existing drive is modified')
  const mapping = spawnSync('subst.exe', [drive, root], { encoding: 'utf8', windowsHide: true })
  if (mapping.status !== 0) throw new Error(mapping.stderr || 'Cannot create temporary reference drive')
  mapped = true; buildRoot = drive + '\\'
}
const flags = ['--cfg', 'getrandom_backend="wasm_js"',
  `--remap-path-prefix=${buildRoot}=/commietools/`,
  `--remap-path-prefix=${root}=/commietools`,
  `--remap-path-prefix=${process.env.CARGO_HOME ?? join(homedir(), '.cargo')}=/cargo`,
  `--remap-path-prefix=${process.env.RUSTUP_HOME ?? join(homedir(), '.rustup')}=/rustup`]
const args = ['+1.99.0', 'build', '--locked', '--offline', '--release', '--target', 'wasm32-unknown-unknown', '--target-dir', target, '--manifest-path', 'crates/pdf-signer-wasm/Cargo.toml']
let build
let cleanupError
try {
  build = spawnSync('cargo', args, { cwd: buildRoot, env: { ...process.env, CARGO_ENCODED_RUSTFLAGS: flags.join('\u001f') }, stdio: 'inherit', windowsHide: true })
} finally {
  if (mapped) {
    const removal = spawnSync('subst.exe', [drive, '/D'], { encoding: 'utf8', windowsHide: true })
    if (removal.status !== 0) cleanupError = new Error('Cannot remove temporary reference drive J:')
  }
}
if (cleanupError) throw cleanupError
if (build.status !== 0) process.exit(build.status ?? 1)
mkdirSync(output, { recursive: true })
const binding = spawnSync('wasm-bindgen', [join(target, 'wasm32-unknown-unknown/release/commietools_pdf_signer_wasm.wasm'), '--target', 'web', '--out-dir', output, '--out-name', 'engine'], { stdio: 'inherit', windowsHide: true })
if (binding.status !== 0) process.exit(binding.status ?? 1)
const wasm = readFileSync(join(output, 'engine_bg.wasm'))
if (wasm.includes(Buffer.from(root)) || wasm.includes(Buffer.from(homedir()))) throw new Error('Host paths survived WASM remapping')
const record = { rust: '1.99.0', wasmBindgen: '0.2.129', target: 'wasm32-unknown-unknown', locked: true, offline: true, referenceBuildRoot: process.platform === 'win32' ? 'J:\\' : null, flags, sha256: createHash('sha256').update(wasm).digest('hex') }
writeFileSync(join(target, 'build-record.json'), JSON.stringify(record, null, 2) + '\n')
console.log(JSON.stringify(record, null, 2))
