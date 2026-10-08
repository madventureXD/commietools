import React, { act, StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useResultUrl } from '../tools/resultUrl'
import { PdfSplit } from '../tools/PdfSplit'

const host = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean; runAsyncTests: () => Promise<string[]>; delayedInspection?: () => Promise<{ pageCount: number }> }
host.IS_REACT_ACT_ENVIRONMENT = true
function check(value: unknown, message: string): void { if (!value) throw new Error(message) }
const flush = () => new Promise<void>((done) => setTimeout(done, 0))
host.runAsyncTests = async () => {
  const passed: string[] = []
  const open = new Set<string>()
  let created = 0
  let revoked = 0
  const realCreate = URL.createObjectURL.bind(URL)
  const realRevoke = URL.revokeObjectURL.bind(URL)
  URL.createObjectURL = (blob) => { const url = realCreate(blob); open.add(url); created += 1; return url }
  URL.revokeObjectURL = (url) => { check(open.delete(url), 'Unknown or duplicate revoke: ' + url); revoked += 1; realRevoke(url) }
  let setResult: ReturnType<typeof useResultUrl>[1] = () => { throw new Error('Hook not mounted') }
  function Result() {
    const [url, set] = useResultUrl('application/pdf')
    setResult = set
    useEffect(() => { set(new Uint8Array([1])) }, [set])
    return <a href={url}>{String(1)}</a>
  }
  const div = document.createElement('div'); document.body.append(div)
  const root = createRoot(div)
  await act(async () => { root.render(<StrictMode><Result /></StrictMode>); await flush() })
  check(created === 2 && revoked === 1 && open.size === 1, 'StrictMode replay ownership')
  await act(async () => { setResult(new Uint8Array([2])); setResult(new Uint8Array([3])); await flush() })
  check(open.size === 1, 'Batched replacement leaked an address')
  await act(async () => { setResult(null); await flush() })
  check(open.size === 0, 'Reset leaked an address')
  await act(async () => { setResult(new Uint8Array([4])); await flush() })
  await act(async () => { root.unmount(); await flush() })
  const before = created
  setResult(new Uint8Array([5]))
  check(open.size === 0 && created === revoked && before === created, 'Unmount/late setter ownership')
  passed.push('StrictMode, batched replacement, reset, unmount, late setter: every URL identity closed exactly once')

  // Actual component; only the PDF engine is controlled to expose ordering of awaits.
  const renderRoot = createRoot(div)
  await act(async () => { renderRoot.render(<StrictMode><PdfSplit t={(key) => key} /></StrictMode>); await flush() })
  async function choose(name: string, read: () => Promise<ArrayBuffer>) {
    const file = new File([new Uint8Array([1])], name)
    Object.defineProperty(file, 'arrayBuffer', { value: read })
    const input = div.querySelector<HTMLInputElement>('input[type=file]')!
    const transfer = new DataTransfer(); transfer.items.add(file); input.files = transfer.files
    await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })); await flush() })
  }
  const bytes = () => Promise.resolve(new Uint8Array([1]).buffer)
  for (const fail of [false, true]) {
    let complete: () => void = () => {}
    const late = new Promise<ArrayBuffer>((resolve, reject) => { complete = () => fail ? reject(new Error('late A error')) : resolve(new Uint8Array([1]).buffer) })
    await choose('A.pdf', () => late)
    check(!div.querySelector('.pdf-document-facts'), 'Old document remains actionable while loading')
    await choose('B.pdf', bytes)
    check(div.querySelector('.pdf-document-facts')?.textContent?.includes('B.pdf'), 'B did not finish')
    await act(async () => { complete(); await flush() })
    check(div.querySelector('.pdf-document-facts')?.textContent?.includes('B.pdf') && !div.querySelector('.error'), 'Late A overwrote B')
  }
  passed.push('Actual PdfSplit: delayed file-read success and error cannot overwrite B')
  for (const fail of [false, true]) {
    let finish: () => void = () => {}
    host.delayedInspection = () => new Promise((resolve, reject) => { finish = () => fail ? reject(new Error('late inspection')) : resolve({ pageCount: 9 }) })
    await choose('inspection-A.pdf', bytes)
    host.delayedInspection = undefined
    await choose('inspection-B.pdf', bytes)
    await act(async () => { finish(); await flush() })
    check(div.querySelector('.pdf-document-facts')?.textContent?.includes('inspection-B.pdf') && !div.querySelector('.error'), 'Late inspection overwrote B')
  }
  let completeUnmount: () => void = () => {}
  await choose('late.pdf', () => new Promise((resolve) => { completeUnmount = () => resolve(new Uint8Array([1]).buffer) }))
  await act(async () => { renderRoot.unmount(); completeUnmount(); await flush() })
  check(open.size === 0, 'Unmount leaked resources')
  passed.push('Actual PdfSplit: unmount invalidates pending selection')
  URL.createObjectURL = realCreate; URL.revokeObjectURL = realRevoke
  return passed
}
