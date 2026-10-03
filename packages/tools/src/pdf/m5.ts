import createQpdfModule from '@neslinesli93/qpdf-wasm'
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url'
import { PdfToolError } from './core'

export type PdfPrintPermission = 'none' | 'low' | 'full'
export type PdfModifyPermission = 'none' | 'assembly' | 'form' | 'annotate' | 'all'
export type PdfCompressionMode = 'lossless' | 'balanced' | 'strong'

export interface PdfProtectionOptions {
  readonly userPassword: string
  readonly ownerPassword: string
  readonly printing: PdfPrintPermission
  readonly modification: PdfModifyPermission
  readonly allowExtraction: boolean
}

type QpdfRuntime = {
  callMain(args: string[]): number
  FS: {
    writeFile(path: string, data: Uint8Array): void
    readFile(path: string): Uint8Array
    unlink(path: string): void
  }
}

type QpdfFactory = (options: {
  locateFile: () => string
  noInitialRun: boolean
  print: (message: string) => void
  printErr: (message: string) => void
}) => Promise<QpdfRuntime>

const qpdfFactory = createQpdfModule as unknown as QpdfFactory

function cleanMessage(messages: readonly string[]): string {
  return messages.join('\n').replaceAll(/\/input-[^\s:]*/gu, 'input.pdf').replaceAll(/\/output-[^\s:]*/gu, 'output.pdf').trim()
}

async function runQpdf(bytes: Uint8Array, args: readonly string[]): Promise<Uint8Array> {
  if (!bytes.length) throw new PdfToolError('empty', 'PDF file is empty')
  const messages: string[] = []
  const qpdf = await qpdfFactory({ locateFile: () => qpdfWasmUrl, noInitialRun: true, print: (message) => messages.push(message), printErr: (message) => messages.push(message) })
  const token = crypto.randomUUID()
  const input = `/input-${token}.pdf`
  const output = `/output-${token}.pdf`
  qpdf.FS.writeFile(input, bytes)
  try {
    const exitCode = qpdf.callMain([input, ...args, output])
    if (exitCode !== 0) {
      const detail = cleanMessage(messages)
      if (args.includes('--decrypt') || /invalid password|incorrect password|password supplied is incorrect/iu.test(detail)) throw new PdfToolError('password', 'The PDF password is incorrect')
      throw new PdfToolError('unsupported', detail || `QPDF stopped with code ${exitCode}`)
    }
    return new Uint8Array(qpdf.FS.readFile(output))
  } catch (error) {
    if (error instanceof PdfToolError) throw error
    const detail = cleanMessage(messages)
    if (args.includes('--decrypt') || /invalid password|incorrect password|password supplied is incorrect/iu.test(detail)) throw new PdfToolError('password', 'The PDF password is incorrect')
    throw new PdfToolError('unsupported', detail || (error instanceof Error ? error.message : 'QPDF could not process the PDF'))
  } finally {
    try { qpdf.FS.unlink(input) } catch { /* virtual file already released */ }
    try { qpdf.FS.unlink(output) } catch { /* no output after a failed operation */ }
  }
}

export function protectionArguments(options: PdfProtectionOptions): string[] {
  if (!options.userPassword || !options.ownerPassword) throw new PdfToolError('password', 'Both passwords are required')
  if (options.userPassword === options.ownerPassword) throw new PdfToolError('password', 'User and owner passwords must be different')
  return [
    '--encrypt',
    `--user-password=${options.userPassword}`,
    `--owner-password=${options.ownerPassword}`,
    '--bits=256',
    `--print=${options.printing}`,
    `--modify=${options.modification}`,
    `--extract=${options.allowExtraction ? 'y' : 'n'}`,
    '--'
  ]
}

export function compressionArguments(mode: PdfCompressionMode): string[] {
  const common = ['--object-streams=generate', '--compress-streams=y', '--decode-level=generalized', '--recompress-flate', '--compression-level=9', '--remove-unreferenced-resources=auto']
  if (mode === 'lossless') return common
  return [...common, '--optimize-images', `--jpeg-quality=${mode === 'strong' ? 65 : 82}`]
}

export async function protectPdf(bytes: Uint8Array, options: PdfProtectionOptions): Promise<Uint8Array> {
  return runQpdf(bytes, protectionArguments(options))
}

export async function unlockPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  if (!password) throw new PdfToolError('password', 'A password is required')
  return runQpdf(bytes, [`--password=${password}`, '--decrypt'])
}

export async function compressPdf(bytes: Uint8Array, mode: PdfCompressionMode): Promise<Uint8Array> {
  return runQpdf(bytes, compressionArguments(mode))
}
