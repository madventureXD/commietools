import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Official OSV API query of exact Cargo lock versions. A completed scan is not a risk waiver.
const locks = ['crates/pdf-signer-engine/Cargo.lock', 'crates/pdf-signer-wasm/Cargo.lock']
const packages = new Map()
for (const path of locks) {
  const text = readFileSync(path, 'utf8')
  for (const block of text.split('[[package]]').slice(1)) {
    const name = /^name = "([^"]+)"/mu.exec(block)?.[1]
    const version = /^version = "([^"]+)"/mu.exec(block)?.[1]
    const source = /^source = "([^"]+)"/mu.exec(block)?.[1]
    if (!name || !version || !source?.startsWith('registry+')) continue
    const key = `${name}@${version}`
    if (!packages.has(key)) packages.set(key, { name, version, locks: [] })
    packages.get(key).locks.push(path)
  }
}
const list = [...packages.values()]
const response = await fetch('https://api.osv.dev/v1/querybatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ queries: list.map(({ name, version }) => ({ package: { name, ecosystem: 'crates.io' }, version })) }), signal: AbortSignal.timeout(60_000) })
if (!response.ok) throw new Error(`OSV batch: ${response.status}`)
const batch = await response.json()
if (batch.results?.length !== list.length || batch.results.some((result) => result.next_page_token)) throw new Error('Incomplete OSV scan')
const hits = []
for (let index = 0; index < list.length; index += 1) {
  for (const { id } of batch.results[index].vulns ?? []) {
    const response = await fetch(`https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(30_000) })
    if (!response.ok) throw new Error(`OSV detail ${id}: ${response.status}`)
    const advisory = await response.json()
    if (!advisory.withdrawn) hits.push({ package: list[index], id, aliases: advisory.aliases ?? [], summary: advisory.summary, modified: advisory.modified, affected: advisory.affected, references: advisory.references })
  }
}
const record = { retrievedAt: new Date().toISOString(), source: 'https://google.github.io/osv.dev/api/', scope: 'All registry packages in both exact locks, including dev/optional packages; superset of reachable browser graph', packages: list.length, locks: locks.map((path) => ({ path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') })), hits, securityApproval: 'not conferred by scan completion' }
writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/rust-advisories.json', JSON.stringify(record, null, 2) + '\n')
console.log(JSON.stringify(record, null, 2))
