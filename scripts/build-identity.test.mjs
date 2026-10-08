import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canonicalSourceBytes } from './build-identity.mjs'

test('checkout line endings do not change text identity; real source edits do', () => {
  assert.deepEqual(canonicalSourceBytes('sample.ts', Buffer.from('const x=1\r\n')), canonicalSourceBytes('sample.ts', Buffer.from('const x=1\n')))
  assert.notDeepEqual(canonicalSourceBytes('sample.ts', Buffer.from('const x=1\n')), canonicalSourceBytes('sample.ts', Buffer.from('const x=2\n')))
})
test('binary source identity preserves every byte including CRLF sequences', () => {
  const bytes = Buffer.from([0, 97, 13, 10, 255])
  assert.deepEqual(canonicalSourceBytes('engine.wasm', bytes), bytes)
  assert.notDeepEqual(canonicalSourceBytes('engine.wasm', bytes), Buffer.from([0, 97, 10, 255]))
})
