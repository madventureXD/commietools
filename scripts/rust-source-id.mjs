import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export function rustSourceId(component, root) {
  if (component.name === 'pdf_signer') {
    const hash = createHash('sha256')
    const walk = (relative) => {
      for (const entry of readdirSync(join(root, 'crates/pdf-signer-engine', relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (['target', '.git'].includes(entry.name)) continue
        const path = relative ? `${relative}/${entry.name}` : entry.name
        if (entry.isDirectory()) walk(path)
        else { hash.update(path + '\0'); hash.update(readFileSync(join(root, 'crates/pdf-signer-engine', path))) }
      }
    }
    walk('')
    return `vendored-sha256:${hash.digest('hex')}`
  }
  const lock = readFileSync(join(root, 'crates/pdf-signer-wasm/Cargo.lock'), 'utf8')
  for (const block of lock.split('[[package]]')) {
    if (/^name = "([^"]+)"/mu.exec(block)?.[1] !== component.name || /^version = "([^"]+)"/mu.exec(block)?.[1] !== component.version) continue
    const checksum = /^checksum = "([0-9a-f]{64})"/mu.exec(block)?.[1]
    const source = /^source = "([^"]+)"/mu.exec(block)?.[1]
    if (source && checksum) return `${source}#sha256:${checksum}`
  }
  throw new Error(`No immutable source identity: ${component.name} ${component.version}`)
}
