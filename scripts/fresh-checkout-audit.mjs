import { spawnSync, execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { resolve, dirname, sep } from 'node:path'
import { createHash } from 'node:crypto'

const root = resolve('.')
const fresh = resolve('tmp', `ms-fresh-${Date.now()}`)
if (!fresh.startsWith(resolve(root, 'tmp') + sep) || existsSync(fresh)) throw new Error('Unsafe/existing fresh checkout target')
const npmCli = process.env.npm_execpath
if (!npmCli) throw new Error('Run through npm so its CLI identity is explicit')
const run = (command, args, cwd) => {
  console.log(JSON.stringify({ command, args, cwd }))
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', windowsHide: true })
  if (result.status !== 0) throw new Error(`Fresh checkout step failed: ${command}, exit ${result.status}`)
}
run('git', ['clone', '--local', '--no-hardlinks', root, fresh], root)
// Overlay the authorized, uncommitted candidate, not ignored workstation evidence/dependencies.
const files = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root }).toString('utf8').split('\0').filter(Boolean))]
for (const file of files) {
  const source = resolve(root, file); const destination = resolve(fresh, file)
  if (!source.startsWith(root + sep) || !destination.startsWith(fresh + sep)) throw new Error('Overlay escaped checkout')
  if (!existsSync(source)) { if (existsSync(destination)) rmSync(destination); continue }
  mkdirSync(dirname(destination), { recursive: true }); copyFileSync(source, destination)
}
if (existsSync(resolve(fresh, 'QM')) || existsSync(resolve(fresh, 'work'))) throw new Error('Fresh checkout contains private evidence helpers')
run(process.execPath, [npmCli, 'ci'], fresh)
run(process.execPath, [npmCli, 'run', 'check'], fresh)
run(process.execPath, [npmCli, 'run', 'build'], fresh)
run(process.execPath, ['scripts/build-signer.mjs', 'tmp/rebuild', 'tmp/rebuilt-wasm'], fresh)
const expected = readFileSync(resolve(root, 'packages/tools/src/pdf/m7-wasm/engine_bg.wasm'))
const rebuilt = readFileSync(resolve(fresh, 'tmp/rebuilt-wasm/engine_bg.wasm'))
if (!expected.equals(rebuilt)) throw new Error('Fresh checkout WASM differs from candidate')
const record = { kind: 'local clone + exact uncommitted candidate overlay', sameComputer: true, fresh, files: files.length, qmAbsent: true, workAbsent: true, npmCi: 'passed', check: 'passed', build: 'passed', wasm: createHash('sha256').update(rebuilt).digest('hex') }
mkdirSync(resolve(root, 'uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7'), { recursive: true })
writeFileSync(resolve(root, 'uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/fresh-checkout.json'), JSON.stringify(record, null, 2) + '\n')
console.log(JSON.stringify(record, null, 2))
