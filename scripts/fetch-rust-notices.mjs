import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'

// Revisions from the published crates' .cargo_vcs_info.json, not mutable branches.
const sources = [
  ['asn1-rs-impl', '0.2.0', 'rusticata/asn1-rs', 'a20e5f7319c896737ad0f2557037817b91ad854f', ['LICENSE-MIT', 'LICENSE-APACHE']],
  ['defmt-parser', '1.0.0', 'knurling-rs/defmt', '4a8cdb44891ed57b8ff5a023b6bec7137c48708f', ['LICENSE-MIT', 'LICENSE-APACHE']],
]
const records = []
for (const [name, version, repository, revision, names] of sources) {
  if (process.argv.includes('--inspect')) {
    const response = await fetch(`https://api.github.com/repos/${repository}/git/trees/${revision}?recursive=1`)
    const tree = await response.json()
    console.log(name, response.status, (tree.tree ?? []).filter((entry) => /LICENSE|COPYING/u.test(entry.path)).map((entry) => entry.path))
    continue
  }
  for (const file of names) {
    const source = `https://raw.githubusercontent.com/${repository}/${revision}/${file}`
    const response = await fetch(source, { signal: AbortSignal.timeout(30_000) })
    if (!response.ok) throw new Error(`${response.status}: ${source}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length < 100) throw new Error(`Incomplete notice: ${source}`)
    const target = `upstream-notices/${name}-${version}/${file.split('/').at(-1)}`
    await mkdir(dirname(resolve('licenses', target)), { recursive: true })
    await writeFile(resolve('licenses', target), bytes)
    records.push({ name, version, file, target, source, revision, sha256: createHash('sha256').update(bytes).digest('hex') })
  }
}
if (process.argv.includes('--inspect')) process.exit(0)
await writeFile('licenses/upstream-notices.json', JSON.stringify({ sources: records }, null, 2) + '\n')
console.log(`Fetched ${records.length} original notices; bytes preserved.`)
// Keep the imported manifest readable as a reproducible source record.
JSON.parse(await readFile('licenses/upstream-notices.json', 'utf8'))
