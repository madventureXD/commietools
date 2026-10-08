import { test } from 'node:test'
import assert from 'node:assert/strict'
import { approvedReview, unresolvedReviews } from './rust-review-policy.mjs'

const component = { name: 'signer', version: '1', license: 'GPL-3.0-or-later', repository: 'https://example.org/signer', sourceId: 'sha256:immutable' }
const approval = { ...component, status: 'approved', needsDecision: false, purposes: ['license'], decidedBy: 'operator', decidedAt: '2026-10-08', reason: 'specific decision' }
test('pending, rejected and legacy entries confer no permission', () => {
  for (const review of [{ ...component }, { ...approval, status: 'pending' }, { ...approval, status: 'rejected' }, { ...approval, needsDecision: true }]) {
    assert.equal(approvedReview(component, [review], 'license'), false)
    assert.equal(unresolvedReviews([component], [review]).length, 1)
  }
})
test('approval binds expression, origin, version, purpose and accountable decision', () => {
  assert.equal(approvedReview(component, [approval], 'license'), true)
  assert.equal(approvedReview(component, [approval], 'notice'), false)
  for (const changed of [{ license: 'FORBIDDEN' }, { repository: 'https://example.org/imposter' }, { version: '2' }, { sourceId: 'sha256:other' }]) {
    assert.equal(approvedReview({ ...component, ...changed }, [approval], 'license'), false)
  }
  assert.equal(approvedReview(component, [{ ...approval, decidedBy: '' }], 'license'), false)
})
