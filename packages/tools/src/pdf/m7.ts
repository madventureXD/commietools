export interface PdfSignatureVerification {
  readonly allValid: boolean
  readonly allTrusted: boolean
  readonly documentIntact: boolean
  readonly signatures: readonly {
    readonly valid: boolean
    readonly isTimestamp: boolean
    readonly byteRange: readonly number[]
    readonly signedLen: number
    readonly coversWholeDocument: boolean
    readonly signer?: string
    readonly chainTrusted?: boolean
    readonly detail: string
  }[]
}

type Engine = {
  sign_pdf(pdf: Uint8Array, keystore: Uint8Array, password: string, signingTime: string): Uint8Array
  verify_pdf(pdf: Uint8Array): PdfSignatureVerification
}

let enginePromise: Promise<Engine> | undefined

async function loadEngine(): Promise<Engine> {
  enginePromise ??= import('./m7-wasm/engine.js').then(async (module) => {
    await module.default()
    return module as unknown as Engine
  })
  return enginePromise
}

export async function signPdfWithCertificate(pdf: Uint8Array, keystore: Uint8Array, password: string): Promise<Uint8Array> {
  const engine = await loadEngine()
  const now = new Date()
  const two = (value: number) => String(value).padStart(2, '0')
  const signingTime = `D:${now.getUTCFullYear()}${two(now.getUTCMonth() + 1)}${two(now.getUTCDate())}${two(now.getUTCHours())}${two(now.getUTCMinutes())}${two(now.getUTCSeconds())}Z`
  return new Uint8Array(engine.sign_pdf(pdf, keystore, password, signingTime))
}

export async function verifyPdfSignatures(pdf: Uint8Array): Promise<PdfSignatureVerification> {
  const engine = await loadEngine()
  return engine.verify_pdf(pdf)
}

