import { readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { starte } from './belege/cdp-harness.mjs'

const delivery = JSON.parse(readFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/github-delivery.json'))
const check = delivery.delivery.checks.find((item) => item.name === 'Cloudflare Pages' && item.conclusion === 'success')
const origin = check?.output.summary.match(/https:\/\/[a-z0-9]+\.commietools\.pages\.dev/u)?.[0]
assert.ok(origin, 'Successful own immutable audit preview required')
const response = await fetch(origin + '/build.json', { signal: AbortSignal.timeout(30000) })
assert.equal(response.status, 200)
const nel = JSON.parse(response.headers.get('nel'))
const reportTo = JSON.parse(response.headers.get('report-to'))
assert.equal(nel.report_to, reportTo.group)
const browser = await starte({})
const record = { checkedAt: new Date().toISOString(), sourceRevision: delivery.delivery.sha, origin, nel, reportTo, build: await response.json(), phases: [], scope: 'Own disposable fresh then used browser profile, own audit preview, harmless synthetic offline fetch only; no user document or provider-internal receipt claim.', protocol: 'https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-enableReportingApi' }
try {
  await browser.send('Network.enableReportingApi', { enable: true })
  for (const profileState of ['fresh', 'already-used']) {
    await browser.oeffne(origin)
    await browser.send('Network.setBypassServiceWorker', { bypass: true })
    await browser.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })
    const failedFetch = await browser.evaluate(`fetch('/build.json?audit-nel=${profileState}', {cache:'no-store'}).then(() => 'unexpected success', error => String(error))`)
    assert.match(failedFetch, /TypeError|Failed to fetch/iu)
    await browser.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })
    await browser.send('Network.setBypassServiceWorker', { bypass: false })
    // Allow the browser's reporting queue to dispatch; absence remains an observation.
    await browser.warte(15000)
    record.phases.push({ profileState, failedFetch, reportingEvents: structuredClone(browser.reportingEvents) })
    console.log('NEL observed: ' + profileState + ', events=' + browser.reportingEvents.length)
  }
  record.reportingRequests = browser.anfragen.filter((url) => reportTo.endpoints.some((endpoint) => url.startsWith(endpoint.url)))
  record.dispatchObserved = record.reportingRequests.length > 0 || browser.reportingEvents.some(({ params }) => params.report?.status === 'Success')
} finally {
  await browser.ende()
  writeFileSync('uebergabe/07-pruefung/fertigstellung/2026-10-08-ms1-ms7/nel-preview.json', JSON.stringify(record, null, 2) + '\n')
}
console.log(JSON.stringify(record, null, 2))
