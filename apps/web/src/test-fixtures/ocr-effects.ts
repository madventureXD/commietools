import { createOcrWorker } from '../tools/ocrWorker'

function check(value: unknown, message: string): void { if (!value) throw new Error(message) }
export async function runOcrEffects() {
  const Original = window.Worker
  let created = 0; let terminated = 0
  window.Worker = class extends Original {
    constructor(url: string | URL, options?: WorkerOptions) { super(url, options); created += 1 }
    override terminate() { terminated += 1; super.terminate() }
  }
  const make = (langPath: string, cacheMethod?: 'none') => createOcrWorker({ workerPath: '/worker.js', corePath: '/core/', langPath, cacheMethod, logger: () => {} })
  const passed: string[] = []
  try {
    const broken = make('/broken', 'none')
    let failed = false
    try { await broken.initialize('eng') } catch { failed = true }
    check(failed && terminated === created, 'Corrupt training data did not reject and release its native worker')
    await broken.terminate()
    check(terminated === created, 'Duplicate termination')
    passed.push('Actual Tesseract WASM + invalid gzipped model: rejection and exactly one termination')

    const waiting = make('/delayed', 'none')
    const pending = waiting.initialize('eng').then(() => false, () => true)
    while (!(await fetch('/delayed-status').then((response) => response.json()))) await new Promise((done) => setTimeout(done, 50))
    await waiting.terminate()
    check(await pending, 'Cancellation failed to settle initialization')
    check(terminated === created, 'Cancellation leaked worker')
    passed.push('Cancellation during actual model download settles initialization and releases worker')

    const canvas = document.createElement('canvas'); canvas.width = 500; canvas.height = 140
    const context = canvas.getContext('2d')!; context.fillStyle = 'white'; context.fillRect(0, 0, 500, 140)
    context.fillStyle = 'black'; context.font = '64px sans-serif'; context.fillText('HELLO 123', 20, 90)
    const image = await new Promise<Blob>((done) => canvas.toBlob((blob) => done(blob!), 'image/png'))
    for (const lang of ['eng', 'deu', 'spa']) for (const offline of [false, true]) {
      const worker = make('/good')
      await worker.initialize(lang)
      const result = await worker.recognize(image)
      check(/HELLO\s+123/u.test(result.data.text), 'Real OCR output mismatch: ' + result.data.text)
      await worker.terminate()
      if (!offline) await fetch('/block-model?lang=' + lang, { method: 'POST' })
    }
    check(created === terminated, 'Successful OCR left workers alive')
    passed.push('Real eng/deu/spa OCR HELLO 123; each new worker repeats with its network model route blocked, using IndexedDB model cache')
    return passed
  } finally { window.Worker = Original }
}
