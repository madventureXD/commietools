/** Serve the actual dist with its declared Pages headers; Vite preview does not apply _headers. */
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, sep, extname } from 'node:path'

export async function startDistServer({ port = 0, root = resolve('apps/web/dist'), auditFiles = {} } = {}) {
  const rules = []
  let current
  for (const line of readFileSync(resolve(root, '_headers'), 'utf8').split(/\r?\n/u)) {
    if (!line.trim()) continue
    if (!/^\s/u.test(line)) { current = { path: line.trim(), headers: {} }; rules.push(current) }
    else {
      const colon = line.indexOf(':')
      if (colon > 0 && current) current.headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
    }
  }
  const mime = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.png': 'image/png', '.pdf': 'application/pdf' }
  const server = createServer((request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname
    for (const rule of rules) {
      if (rule.path.endsWith('*') ? path.startsWith(rule.path.slice(0, -1)) : path === rule.path) {
        for (const [name, value] of Object.entries(rule.headers)) response.setHeader(name, value)
      }
    }
    if (Object.hasOwn(auditFiles, path)) {
      const extra = auditFiles[path]
      response.setHeader('Content-Type', extra.type)
      response.end(extra.bytes)
      return
    }
    let file = resolve(root, '.' + decodeURIComponent(path))
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403); response.end(); return }
    if (!existsSync(file) || !statSync(file).isFile()) {
      if (extname(path) || path.startsWith('/assets/')) { response.writeHead(404); response.end(); return }
      file = resolve(root, 'index.html')
    }
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream')
    response.end(readFileSync(file))
  })
  await new Promise((done) => server.listen(port, '127.0.0.1', done))
  return { server, origin: `http://127.0.0.1:${server.address().port}`, async close() { await new Promise((done) => server.close(done)) } }
}
