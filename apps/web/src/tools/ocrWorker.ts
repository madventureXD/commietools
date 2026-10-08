import workerUrl from 'tesseract.js/dist/worker.min.js?url'

type Progress = { status: string; progress: number }
type Pending = { resolve: (data: unknown) => void; reject: (reason: Error) => void }
type Packet = { jobId: string; status: 'progress' | 'resolve' | 'reject'; data: unknown }

/** Own the native worker before initialization, so model failure and cancellation settle all jobs.
 * Protocol: installed Tesseract.js 7 worker-script/dispatchHandlers (Apache-2.0).
 * Deliberately only supports the four operations used by this tool; no parallel jobs.
 */
export function createOcrWorker(options: {
  corePath: string; langPath: string; logger: (progress: Progress) => void
  workerPath?: string; cacheMethod?: 'none' | 'refresh'
}) {
  const native = new Worker(options.workerPath ?? workerUrl)
  const pending = new Map<string, Pending>()
  let sequence = 0
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const terminate = (reason = new Error('OCR worker terminated')) => {
    if (stopped) return
    stopped = true
    clearTimeout(timer)
    native.terminate()
    for (const job of pending.values()) job.reject(reason)
    pending.clear()
  }
  native.onerror = (event) => { event.preventDefault(); terminate(new Error(event.message || 'OCR worker failed')) }
  native.onmessageerror = () => terminate(new Error('Invalid OCR worker message'))
  native.onmessage = ({ data }: MessageEvent<Packet>) => {
    const job = pending.get(data.jobId)
    if (!job) return
    if (data.status === 'progress') { options.logger(data.data as Progress); return }
    pending.delete(data.jobId)
    clearTimeout(timer)
    if (data.status === 'resolve') job.resolve(data.data)
    else { job.reject(new Error(String(data.data))); terminate(new Error(String(data.data))) }
  }
  const run = (action: string, payload: unknown) => new Promise<unknown>((resolve, reject) => {
    if (stopped) { reject(new Error('OCR worker terminated')); return }
    if (pending.size) { reject(new Error('Concurrent OCR job')); return }
    const jobId = String(++sequence)
    pending.set(jobId, { resolve, reject })
    timer = setTimeout(() => terminate(new Error('OCR worker timeout')), 120_000)
    try { native.postMessage({ workerId: 'commietools-ocr', jobId, action, payload }) }
    catch (error) { terminate(error instanceof Error ? error : new Error(String(error))) }
  })
  return {
    async initialize(language: string) {
      try {
        await run('load', { options: { lstmOnly: true, corePath: options.corePath, logging: false } })
        await run('loadLanguage', { langs: [language], options: { langPath: options.langPath, gzip: true, lstmOnly: true, cacheMethod: options.cacheMethod } })
        await run('initialize', { langs: [language], oem: 1, config: {} })
      } catch (error) { terminate(); throw error }
    },
    async recognize(blob: Blob) {
      const image = new Uint8Array(await blob.arrayBuffer())
      return { data: await run('recognize', { image, options: {}, output: { text: true } }) as { text: string } }
    },
    async terminate() { terminate() }
  }
}
