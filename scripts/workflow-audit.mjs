import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const version = '1.7.12'
const platform = process.platform === 'win32' ? 'windows_amd64.zip' : 'linux_amd64.tar.gz'
const directory = resolve(`tmp/actionlint-${version}`)
await mkdir(directory, { recursive: true })
const archive = `actionlint_${version}_${platform}`
const base = `https://github.com/rhysd/actionlint/releases/download/v${version}/`
const checksums = await (await fetch(base + `actionlint_${version}_checksums.txt`)).text()
const expected = checksums.split('\n').find((line) => line.trim().endsWith(archive))?.split(/\s+/u)[0]
if (!/^[0-9a-f]{64}$/u.test(expected ?? '')) throw new Error('Missing upstream actionlint checksum')
const response = await fetch(base + archive)
if (!response.ok) throw new Error(`actionlint download: ${response.status}`)
const bytes = Buffer.from(await response.arrayBuffer())
const actual = createHash('sha256').update(bytes).digest('hex')
if (actual !== expected) throw new Error('actionlint archive checksum mismatch')
const path = resolve(directory, archive)
await writeFile(path, bytes)
const unpack = spawnSync(process.platform === 'win32' ? 'tar.exe' : 'tar', ['-xf', path, '-C', directory], { encoding: 'utf8', windowsHide: true })
if (unpack.status !== 0) throw new Error(unpack.stderr || 'Cannot extract actionlint')
// License is part of the verified upstream release, retained with the local audit tool.
if ((await readFile(resolve(directory, 'LICENSE.txt'), 'utf8')).length < 100) throw new Error('Missing actionlint license')
const executable = resolve(directory, process.platform === 'win32' ? 'actionlint.exe' : 'actionlint')
const result = spawnSync(executable, ['-shellcheck=', '-pyflakes=', '.github/workflows/quality.yml'], { encoding: 'utf8', windowsHide: true })
console.log(JSON.stringify({ version, source: base + archive, sha256: actual, exit: result.status, stdout: result.stdout, stderr: result.stderr }, null, 2))
process.exitCode = result.status ?? 1
