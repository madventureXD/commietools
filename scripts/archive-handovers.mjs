import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const root = resolve('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/archiv')
mkdirSync(root, { recursive: true })
const sources = [
  ['6e33dc3^', '2026-10-04-rechner-welle5.md'],
  ['6e33dc3^', '2026-10-03-rechner-welle4.md'],
  ['6e33dc3^', '2026-10-03-rechner-welle2-oberflaeche.md'],
  ['ed0ee4e^', '2026-10-05-werkzeugtexte-je-werkzeug.md']
]
const entries = sources.map(([ref, name]) => {
  const revision = execFileSync('git', ['rev-parse', ref], { encoding: 'utf8' }).trim()
  const path = `uebergabe/05-uebergaben/${name}`
  const bytes = execFileSync('git', ['show', `${revision}:${path}`])
  const archive = `${name}.txt`; writeFileSync(resolve(root, archive), bytes)
  return { revision, path, archive, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
})
writeFileSync(resolve(root, 'manifest.json'), JSON.stringify({ decision: 'Archive variant implemented within authorized MS6 scope; no retroactive claim of individual approval in 2026-10-04/05', entries }, null, 2) + '\n')
console.log(JSON.stringify(entries, null, 2))
