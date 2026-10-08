// MS0: prueft die eingefrorene Kriterienbasis, keine Produktabnahme.
// Aufruf: node scripts/belege/fertigstellung-basis.mjs
// Keine Abhaengigkeit von QM/, work/, Browsern oder Benutzerprofilen.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = resolve(root, 'uebergabe/07-pruefung/fertigstellung/2026-10-08-ms0')
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const section = (text, heading) => {
  const marker = `### ${heading}`
  const start = text.indexOf(marker)
  assert(start >= 0, `Missing section ${heading}`)
  const rest = text.slice(text.indexOf('\n', start) + 1)
  const end = rest.search(/^### /m)
  return rest.slice(0, end < 0 ? rest.length : end).trim()
}

try {
  const basis = readJson(resolve(base, 'basis.json'))
  const scope = readJson(resolve(base, 'funktionsumfang.json'))
  const sources = new Map()
  assert.equal(basis.schemaVersion, 1)
  assert.match(basis.sourceRevision, /^[0-9a-f]{40}$/)
  assert.equal(basis.sources.length, 23)
  for (const source of basis.sources) {
    const path = resolve(base, source.snapshot)
    const localPath = relative(base, path)
    assert(!localPath.startsWith('..') && !isAbsolute(localPath), 'Source outside evidence directory')
    const bytes = readFileSync(path)
    assert.equal(bytes.length, source.bytes, `${source.origin}: byte count`)
    assert.equal(sha256(bytes), source.sha256, `${source.origin}: hash`)
    assert(!sources.has(source.snapshot), 'Duplicate source snapshot')
    sources.set(source.snapshot, { ...source, text: bytes.toString('utf8') })
  }
  const matrix = [...sources.values()].find((source) => source.origin.endsWith('/20-kartenmatrix.md'))
  assert(matrix, 'Missing original audit matrix')
  const expected = new Map([...matrix.text.matchAll(/^\| (M\d+-\d+) \| ([BRFO]) \| (.+) \|\r?$/gm)].map((row) => [row[1], { verdict: row[2], scope: row[3] }]))
  assert.equal(expected.size, 59)
  assert.equal(basis.cards.length, 59)
  assert.equal(new Set(basis.cards.map((card) => card.id)).size, 59)
  const counts = { B: 0, R: 0, F: 0, O: 0 }
  const findings = new Map()
  const timetable = readFileSync(resolve(base, 'abnahmefenster.md'), 'utf8')
  for (const card of basis.cards) {
    assert(expected.has(card.id), `Unexpected card ${card.id}`)
    const originalAudit = expected.get(card.id)
    assert.equal(card.auditVerdict, originalAudit.verdict, `${card.id}: verdict drift`)
    assert.equal(card.auditEvidenceAndRemainingScope, originalAudit.scope, `${card.id}: remaining scope drift`)
    assert.equal(card.auditSource, matrix.snapshot)
    const source = sources.get(card.source)
    assert(source, `${card.id}: missing original source`)
    assert.equal(card.sourceSha256, source.sha256)
    const heading = `## ${card.id} – ${card.title}`
    const start = source.text.indexOf(heading)
    assert(start >= 0, `${card.id}: original heading`)
    assert.equal(source.text.slice(0, start).split('\n').length, card.line)
    const rest = source.text.slice(start)
    const next = rest.indexOf('\n## ', heading.length)
    const original = rest.slice(0, next < 0 ? rest.length : next)
    assert.equal(card.acceptance, section(original, 'Abnahme'), `${card.id}: acceptance changed`)
    assert.equal(card.boundaries, section(original, 'Nicht tun / Abgrenzung'), `${card.id}: boundary changed`)
    assert(card.acceptance.length > 0 && card.boundaries.length > 0)
    assert.equal(card.expectedResult, card.acceptance)
    assert.equal(card.trackingState, {
      B: 'core-confirmed-limited', R: 'awaiting-acceptance', F: 'reopened', O: 'known-open'
    }[card.auditVerdict], `${card.id}: MS0 state drift`)
    counts[card.auditVerdict] += 1
    if (card.auditVerdict === 'B') {
      assert.equal(card.trackingState, 'core-confirmed-limited')
      assert.equal(card.milestone, 'regression-only')
    } else {
      assert.match(card.milestone, /^MS[1-7]$/)
      assert(card.responsibleRole.length > 0)
      assert(card.externalAcceptanceGroups.includes('gegenpruefung'))
      for (const group of card.externalAcceptanceGroups) assert(timetable.includes(`| \`${group}\` |`), `${card.id}: missing responsibility/window ${group}`)
    }
    if (card.auditVerdict === 'F') {
      assert.equal(card.trackingState, 'reopened')
      assert.match(card.finding, /^N[1-8]$/)
      findings.set(card.finding, (findings.get(card.finding) ?? 0) + 1)
    }
    // MS0 darf die Produktergebnisse nicht durch administrativen Abschluss ersetzen.
    assert.equal(card.measurement, null)
    assert.equal(card.independentAcceptance, 'not-granted')
    assert.deepEqual(card.evidenceArtifacts, [])
  }
  assert.deepEqual(counts, { B: 33, R: 16, F: 9, O: 1 })
  assert.equal(findings.size, 8)
  assert.equal(findings.get('N6'), 2)
  assert.equal(scope.sourceRevision, basis.sourceRevision)
  assert.equal(scope.tools.length, 8)
  const expectedTools = ['inspection', 'photo-caption', 'handover-report', 'threads', 'lighting', 'heatload', 'pipes', 'cable'].sort()
  assert.deepEqual(scope.tools.map((tool) => tool.toolId).sort(), expectedTools)
  const manifests = readFileSync(resolve(root, 'packages/tools/src/catalog/manifests.ts'), 'utf8')
  for (const tool of scope.tools) {
    assert(manifests.includes(`id: '${tool.toolId}', route: '${tool.route}'`), `${tool.toolId}: actual route`)
    const source = sources.get(tool.source)
    assert(source, `${tool.toolId}: missing source`)
    const start = source.text.indexOf(tool.heading)
    assert(start >= 0, `${tool.toolId}: original heading`)
    const rest = source.text.slice(source.text.indexOf('\n', start) + 1)
    const next = rest.search(/^#{2,3} /m)
    const originalScope = rest.slice(0, next < 0 ? rest.length : next).trim()
    assert.equal(tool.originalScope, originalScope, `${tool.toolId}: complete original scope`)
    assert.equal(tool.sourceSha256, source.sha256)
    const acceptanceMarker = '**Abnahmekriterien:**'
    const markerIndex = originalScope.indexOf(acceptanceMarker)
    assert(markerIndex >= 0, `${tool.toolId}: no acceptance section`)
    assert.equal(tool.acceptance, originalScope.slice(markerIndex + acceptanceMarker.length).trim(), `${tool.toolId}: complete acceptance`)
    assert.equal(tool.result, null)
  }
  console.log(JSON.stringify({
    status: 'PASS', productAcceptance: false, sourceRevision: basis.sourceRevision,
    cards: basis.cards.length, counts, open: counts.R + counts.F + counts.O,
    findings: findings.size, sources: sources.size, waveTools: scope.tools.length,
    externalReservations: 'not-confirmed'
  }, null, 2))
} catch (error) {
  console.error(`MS0 evidence verification failed: ${error.message}`)
  process.exitCode = 1
}
