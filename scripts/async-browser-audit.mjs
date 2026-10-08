import { build } from 'esbuild'
import { createServer } from 'node:http'
import assert from 'node:assert/strict'
import { starte } from './belege/cdp-harness.mjs'

const mocks = {
  '@commietools/tools': 'export const acceptAttributeFor = () => ".pdf"',
  '@commietools/tools/pdf/core': 'export const inspectPdf = async () => window.delayedInspection ? window.delayedInspection() : ({pageCount:1}); export const parseSplitGroups=()=>[[0]]; export const splitPdf=async()=>[new Uint8Array([1])]',
  '@commietools/ui': 'import React from "react"; export const Button=(props)=>React.createElement("button",props); export const LocalBadge=(props)=>React.createElement("span",props)',
  './pdfUi': 'export const usePdfThumbnails=()=>({images:[]}); export const PdfWarnings=()=>null; export const baseName=(s)=>s; export const pdfErrorKey=()=>"error"',
  './SaveFileControl': 'export const SaveFileControl=()=>null'
}
const bundled = await build({ entryPoints: ['apps/web/src/test-fixtures/async-react.tsx'], bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' }, plugins: [{
  name: 'controlled-engine', setup(api) {
    api.onResolve({ filter: /.*/ }, (args) => args.path in mocks ? { path: args.path, namespace: 'fixture' } : undefined)
    api.onLoad({ filter: /.*/, namespace: 'fixture' }, (args) => ({ contents: mocks[args.path], loader: 'js', resolveDir: process.cwd() }))
  }
}] })
const server = createServer((request, response) => {
  response.setHeader('Content-Type', request.url === '/test.js' ? 'text/javascript' : 'text/html')
  response.end(request.url === '/test.js' ? bundled.outputFiles[0].contents : '<!doctype html><script src="/test.js"></script>')
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
let browser
try {
  browser = await starte({})
  await browser.oeffne(`http://127.0.0.1:${server.address().port}/`)
  const passed = await browser.evaluate('runAsyncTests()')
  assert.equal(passed.length, 3)
  assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ passed }, null, 2))
} finally { await browser?.ende(); server.close() }
