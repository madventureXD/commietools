import { useEffect, useState } from 'react'
import { Button } from '@commietools/ui'

type Translate = (key: string) => string

interface SaveFilePickerOptions {
  suggestedName?: string
  types?: { description?: string; accept: Record<string, string[]> }[]
}

interface WritableFileHandle {
  createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }>
}

type PickerWindow = Window & {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<WritableFileHandle>
}

export interface SaveFileControlProps {
  readonly suggestedName: string
  readonly mimeType: string
  readonly t: Translate
  readonly url?: string
  readonly blob?: Blob
  readonly getBlob?: () => Promise<Blob | null>
  readonly className?: string
}

function expectedExtension(name: string): string {
  const match = name.match(/(\.[a-z0-9]{1,10})$/iu)
  return match?.[1]?.toLowerCase() ?? ''
}

export function normaliseFileName(value: string, fallback: string): string {
  const extension = expectedExtension(fallback)
  let name = value
    // Steuerzeichen werden hier **bewusst** entfernt: ein Dateiname darf sie nicht tragen.
    // eslint-disable-next-line no-control-regex -- Absicht, siehe Zeile darüber
    .replace(/[\u0000-\u001f\u007f]/gu, '')
    .replace(/[\\/:*?"<>|]/gu, '-')
    .trim()
    .replace(/[. ]+$/u, '')
  if (!name) name = fallback
  if (extension && !name.toLowerCase().endsWith(extension)) {
    name = name.replace(/\.[a-z0-9]{1,10}$/iu, '') + extension
  }
  const stem = extension ? name.slice(0, -extension.length) : name
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/iu.test(stem)) name = `_${name}`
  const maxLength = 180
  if (name.length > maxLength) {
    const keep = Math.max(1, maxLength - extension.length)
    name = `${stem.slice(0, keep)}${extension}`
  }
  return name
}

async function blobFrom(props: SaveFileControlProps): Promise<Blob | null> {
  if (props.blob) return props.blob
  if (props.getBlob) return props.getBlob()
  if (props.url) return (await fetch(props.url)).blob()
  return null
}

function fallbackDownload(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function SaveFileControl(props: SaveFileControlProps) {
  const { suggestedName, mimeType, t, className = '' } = props
  const [fileName, setFileName] = useState(suggestedName)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const picker = typeof window !== 'undefined' ? (window as PickerWindow).showSaveFilePicker : undefined

  useEffect(() => {
    setFileName(suggestedName)
    setStatus('')
  }, [suggestedName])

  async function save() {
    setBusy(true)
    setStatus('')
    const finalName = normaliseFileName(fileName, suggestedName)
    setFileName(finalName)
    try {
      let handle: WritableFileHandle | null = null
      if (picker) {
        const extension = expectedExtension(finalName)
        try {
          // The picker must be the first awaited operation so the browser still sees
          // the direct click/tap that grants transient user activation.
          handle = await picker.call(window, {
            suggestedName: finalName,
            types: extension ? [{ description: extension.slice(1).toUpperCase(), accept: { [mimeType]: [extension] } }] : undefined
          })
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            setStatus('save.cancelled')
            return
          }
          // Some mobile browsers expose the API but reject the picker. Their safe
          // fallback remains the ordinary browser download.
          handle = null
        }
      }
      const data = await blobFrom(props)
      if (!data) throw new Error('No file data')
      if (handle) {
        const writable = await handle.createWritable()
        await writable.write(data)
        await writable.close()
        setStatus('save.saved')
      } else {
        fallbackDownload(data, finalName)
        setStatus('save.downloadStarted')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') setStatus('save.cancelled')
      else setStatus('save.error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`save-file-control stack ${className}`.trim()}>
      <label className="field">
        <span>{t('save.fileName')}</span>
        <input value={fileName} onChange={(event) => setFileName(event.target.value)} onBlur={() => setFileName(normaliseFileName(fileName, suggestedName))} />
      </label>
      <div className="download-row">
        <Button className="primary" disabled={busy} onClick={save}>
          {busy ? t('save.saving') : t(picker ? 'save.saveAs' : 'save.download')}
        </Button>
      </div>
      {!picker && <p className="scan-note">{t('save.browserLocation')}</p>}
      {status && <p className={status === 'save.error' ? 'error' : 'scan-note'} role={status === 'save.error' ? 'alert' : 'status'}>{t(status)}</p>}
    </div>
  )
}
