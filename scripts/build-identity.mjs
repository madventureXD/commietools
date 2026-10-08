import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'

const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.json', '.rs', '.toml', '.lock', '.md', '.svg', '.html'])
export function canonicalSourceBytes(path, bytes) {
  return textExtensions.has(extname(path)) ? Buffer.from(bytes.toString('utf8').replace(/\r\n/gu, '\n')) : bytes
}

/** Source identity includes uncommitted changes; HEAD alone cannot identify a local candidate. */
export function buildIdentity(root = resolve('../..')) {
  const hash = createHash('sha256')
  const walk = (relative) => {
    for (const item of readdirSync(join(root, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = `${relative}/${item.name}`
      if (item.isDirectory()) walk(path)
      else { hash.update(path + '\0'); hash.update(canonicalSourceBytes(path, readFileSync(join(root, path)))) }
    }
  }
  for (const path of ['apps/web/src', 'packages/core/src', 'packages/i18n/src', 'packages/tools/src', 'packages/ui/src', 'crates/pdf-signer-engine/src', 'crates/pdf-signer-wasm/src']) walk(path)
  for (const path of ['package-lock.json', 'apps/web/vite.config.ts', 'scripts/build-identity.mjs', 'crates/pdf-signer-wasm/Cargo.lock', 'crates/pdf-signer-engine/Cargo.lock']) hash.update(canonicalSourceBytes(path, readFileSync(join(root, path))))
  return hash.digest('hex')
}
