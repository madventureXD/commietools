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
    let gekuerzt = stem.slice(0, keep)
    /**
     * **Nicht mitten in einem Zeichenpaar abschneiden** (Karte M3-007): Ein Emoji besteht aus zwei
     * UTF-16-Einheiten. Endet der gekürzte Name auf der ersten Hälfte, ist er kein gültiger Text
     * mehr — der Browser zeigt dann ein Ersatzzeichen und der Dateiname ist beschädigt. Gemessen:
     * `a` + 90 × 😊 wurde zu `…\uD83D.pdf` (nicht wohlgeformt).
     */
    if (/[\uD800-\uDBFF]$/u.test(gekuerzt)) gekuerzt = gekuerzt.slice(0, -1)
    name = `${gekuerzt}${extension}`
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

/**
 * **Speicheradapter (Karte M5-002).**
 *
 * Bis zum 2026-10-06 steckte der ganze Ablauf in der Komponente und war damit im automatischen
 * Testlauf unbenutzt: eine Mutation, die das Schreiben überspringt („Save-noop"), hätte jeden Test
 * überstanden. Hier steht der Ablauf als reine Funktion mit **injizierter Umgebung** — testbar
 * ohne Browser, und die Komponente bleibt für die Darstellung zuständig.
 *
 * Reihenfolge ist Teil des Vertrags: **Der Picker wird als erste erwartete Operation aufgerufen.**
 * Sonst hat der Browser die unmittelbare Nutzeraktivierung (Klick) schon verbraucht und lehnt den
 * Dialog ab. Erst danach werden die Daten erzeugt — bei großen Dateien kann das dauern.
 */
export type SaveOutcome = 'saved' | 'cancelled' | 'downloaded' | 'error'

export interface SaveEnvironment {
  /** Die Picker-Schnittstelle, falls der Browser sie anbietet. */
  readonly picker?: (options: SaveFilePickerOptions) => Promise<WritableFileHandle>
  /** Der Rückfallweg: gewöhnlicher Browserdownload. */
  readonly download: (blob: Blob, name: string) => void
}

function istAbbruch(fehler: unknown): boolean {
  return typeof DOMException !== 'undefined' && fehler instanceof DOMException && fehler.name === 'AbortError'
}

export async function saveWithAdapter(options: {
  readonly name: string
  readonly mimeType: string
  readonly environment: SaveEnvironment
  readonly getBlob: () => Promise<Blob | null>
}): Promise<SaveOutcome> {
  const { name, mimeType, environment, getBlob } = options
  let handle: WritableFileHandle | null = null
  if (environment.picker) {
    const extension = expectedExtension(name)
    try {
      handle = await environment.picker({
        suggestedName: name,
        types: extension ? [{ description: extension.slice(1).toUpperCase(), accept: { [mimeType]: [extension] } }] : undefined
      })
    } catch (fehler) {
      // Nutzerabbruch ist ein Ergebnis, kein Fehler — und er löst **nicht** heimlich einen
      // Download aus (die Karte nennt genau das).
      if (istAbbruch(fehler)) return 'cancelled'
      // Manche Browser bieten die Schnittstelle an und lehnen den Dialog trotzdem ab.
      // Für sie bleibt der gewöhnliche Downloadweg.
      handle = null
    }
  }
  try {
    const daten = await getBlob()
    if (!daten) return 'error'
    if (handle) {
      const schreibbar = await handle.createWritable()
      await schreibbar.write(daten)
      await schreibbar.close()
      return 'saved'
    }
    environment.download(daten, name)
    return 'downloaded'
  } catch (fehler) {
    return istAbbruch(fehler) ? 'cancelled' : 'error'
  }
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
      const ergebnis = await saveWithAdapter({
        name: finalName,
        mimeType,
        environment: {
          picker: picker ? (optionen) => picker.call(window, optionen) : undefined,
          download: fallbackDownload
        },
        getBlob: () => blobFrom(props)
      })
      setStatus({
        saved: 'save.saved',
        cancelled: 'save.cancelled',
        downloaded: 'save.downloadStarted',
        error: 'save.error'
      }[ergebnis])
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
