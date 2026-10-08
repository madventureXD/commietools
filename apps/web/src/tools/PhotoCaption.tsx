import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor, readMetadata } from '@commietools/tools'
import { imagesToPdf, type PdfImageInput } from '@commietools/tools/pdf/core'
import {
  captionLimits,
  captionText,
  exifTimestampFrom,
  isUsableTimestamp,
  normaliseArrow,
  resultName,
  type CaptionPhoto
} from '@commietools/tools/image/caption'
import { Button } from '@commietools/ui'
import { SaveFileControl } from './SaveFileControl'
import { arrowFromClick, drawPreview, loadImage, renderCaptioned, captionedBytes } from './captionRender'

type Translate = (key: string) => string

interface PhotoCaptionProps {
  readonly t: Translate
  readonly locale: string
}

interface LoadedPhoto {
  readonly photo: CaptionPhoto
  readonly image: HTMLImageElement
}

interface Rendered {
  readonly name: string
  readonly blob: Blob
}

/** Fortlaufende Nummer für die Vorschau-Elemente — kein Zufall, damit React stabil bleibt. */
let laufendeNummer = 0

export function PhotoCaption({ t }: PhotoCaptionProps) {
  const [photos, setPhotos] = useState<readonly LoadedPhoto[]>([])
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [rendered, setRendered] = useState<readonly Rendered[]>([])
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const vorschauRefs = useRef(new Map<string, HTMLCanvasElement>())

  // Vorschau neu zeichnen, wenn sich Notiz, Zeitstempel oder Pfeil ändern.
  useEffect(() => {
    for (const eintrag of photos) {
      const canvas = vorschauRefs.current.get(eintrag.photo.id)
      if (canvas) drawPreview(canvas, eintrag.image, eintrag.photo)
    }
  }, [photos])

  async function choose(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const dateien = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!dateien.length) return
    if (dateien.length > captionLimits.photosMax - photos.length) {
      setErrorKey('tool.photoCaption.error.tooMany')
      return
    }
    const geladen: LoadedPhoto[] = []
    let unlesbar = 0
    for (const datei of dateien) {
      if (!datei.type.startsWith('image/')) continue
      try {
        const puffer = await datei.arrayBuffer()
        const bericht = readMetadata(new Uint8Array(puffer))
        const zeit = exifTimestampFrom(bericht.entries)
        const image = await loadImage(datei)
        geladen.push({
          image,
          photo: {
            id: `foto-${laufendeNummer++}`,
            name: datei.name.replace(/\.[a-z0-9]{1,6}$/iu, ''),
            note: '',
            timestamp: zeit.value,
            timestampFromExif: Boolean(zeit.value),
            timestampSource: zeit.from,
            arrow: null
          }
        })
      } catch {
        unlesbar += 1
      }
    }
    if (!geladen.length) {
      setErrorKey('tool.photoCaption.error.selection')
      return
    }
    setErrorKey(unlesbar ? 'tool.photoCaption.error.image' : null)
    setPhotos((vorher) => [...vorher, ...geladen])
    setRendered([])
    setPdfBlob(null)
  }

  function update(id: string, patch: Partial<CaptionPhoto>): void {
    setPhotos((vorher) => vorher.map((eintrag) => (eintrag.photo.id === id ? { ...eintrag, photo: { ...eintrag.photo, ...patch } } : eintrag)))
  }

  function setArrow(id: string, clientX: number, clientY: number): void {
    const canvas = vorschauRefs.current.get(id)
    if (!canvas) return
    const punkt = arrowFromClick(canvas, clientX, clientY)
    update(id, { arrow: normaliseArrow(punkt.x, punkt.y) })
  }

  async function render(): Promise<void> {
    if (!photos.length) {
      setErrorKey('tool.photoCaption.error.none')
      return
    }
    const zuLang = photos.find((eintrag) => eintrag.photo.note.length > captionLimits.noteMax)
    if (zuLang) {
      setErrorKey('tool.photoCaption.error.note')
      return
    }
    const schlechteZeit = photos.find((eintrag) => !isUsableTimestamp(eintrag.photo.timestamp))
    if (schlechteZeit) {
      setErrorKey('tool.photoCaption.error.timestamp')
      return
    }
    setBusy(true)
    setErrorKey(null)
    try {
      // Ein Bild nach dem anderen: so liegt nie die gesamte Serie gleichzeitig als Bildfläche
      // im Speicher — das ist die Grenze, die bei vielen großen Fotos zuerst reißt.
      const ergebnisse: Rendered[] = []
      const pdfBilder: PdfImageInput[] = []
      const verwendet: string[] = []
      for (const [index, eintrag] of photos.entries()) {
        const blob = await renderCaptioned(eintrag.photo, eintrag.image, format, 0.9)
        const name = resultName(eintrag.photo.name, index, verwendet, format === 'image/png' ? 'png' : 'jpg')
        verwendet.push(name)
        ergebnisse.push({ name, blob })
        pdfBilder.push({ bytes: await captionedBytes(eintrag.photo, eintrag.image), name, mimeType: 'image/jpeg' })
      }
      const pdf = await imagesToPdf(pdfBilder, { pageSize: 'a4', orientation: 'auto', fit: 'contain', margin: 18 })
      setRendered(ergebnisse)
      setPdfBlob(new Blob([new Uint8Array(pdf)], { type: 'application/pdf' }))
    } catch {
      setErrorKey('tool.photoCaption.error.image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <section className="settings-card stack">
        <h2>{t('tool.photoCaption.photos')}</h2>
        <label className="field">
          <span>{t('tool.photoCaption.choose')}</span>
          <input type="file" multiple accept={acceptAttributeFor('photo-caption')} onChange={choose} />
        </label>
        <p className="privacy-note">{t('tool.photoCaption.local')}</p>
        {!photos.length && <p className="scan-note">{t('tool.photoCaption.empty')}</p>}
        {errorKey && <p className="error" role="alert">{t(errorKey)}</p>}
      </section>

      {photos.map((eintrag) => (
        <section className="settings-card stack" key={eintrag.photo.id}>
          <div className="preview-heading">
            <h2>{eintrag.photo.name || t('tool.photoCaption.preview')}</h2>
            <button type="button" className="text-link" aria-label={`${t('tool.photoCaption.remove')}: ${eintrag.photo.name}`} onClick={() => setPhotos((vorher) => vorher.filter((e) => e.photo.id !== eintrag.photo.id))}>
              {t('tool.photoCaption.remove')}
            </button>
          </div>
          <canvas
            ref={(element) => {
              if (element) vorschauRefs.current.set(eintrag.photo.id, element)
              else vorschauRefs.current.delete(eintrag.photo.id)
            }}
            className="caption-canvas"
            role="img"
            aria-label={`${t('tool.photoCaption.preview')}: ${eintrag.photo.name}`}
            onClick={(event) => setArrow(eintrag.photo.id, event.clientX, event.clientY)}
          />
          <p className="scan-note">{t('tool.photoCaption.arrowHint')}</p>
          <div className="form-grid">
            <label className="field">
              <span>{t('tool.photoCaption.note')}</span>
              <input value={eintrag.photo.note} maxLength={captionLimits.noteMax} onChange={(event) => update(eintrag.photo.id, { note: event.target.value })} />
            </label>
            <label className="field">
              <span>{t('tool.photoCaption.timestamp')}</span>
              <input
                value={eintrag.photo.timestamp}
                placeholder="2026-10-06 09:30"
                aria-invalid={!isUsableTimestamp(eintrag.photo.timestamp) || undefined}
                onChange={(event) => update(eintrag.photo.id, { timestamp: event.target.value, timestampFromExif: false })}
              />
              <small className="scan-note">{eintrag.photo.timestampFromExif
                ? (eintrag.photo.timestampSource === 'ModifyDate' ? t('tool.photoCaption.fromModified') : t('tool.photoCaption.fromExif'))
                : t('tool.photoCaption.noExif')}</small>
            </label>
          </div>
          <div className="download-row">
            <Button
              className={eintrag.photo.arrow ? 'active' : ''}
              aria-pressed={eintrag.photo.arrow !== null}
              onClick={() => update(eintrag.photo.id, { arrow: null })}
              disabled={!eintrag.photo.arrow}
            >
              {t('tool.photoCaption.arrowClear')}
            </Button>
            <span className="scan-note">{captionText(eintrag.photo)}</span>
          </div>
        </section>
      ))}

      {photos.length > 0 && (
        <details className="settings-card">
          <summary>{t('tool.photoCaption.settings')}</summary>
          <div className="form-grid">
            <label className="field">
              <span>{t('tool.photoCaption.format')}</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as 'image/jpeg' | 'image/png')}>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
              </select>
            </label>
          </div>
        </details>
      )}

      {photos.length > 0 && (
        <div className="download-row">
          <Button className="primary" disabled={busy} onClick={render}>{busy ? t('tool.photoCaption.rendering') : t('tool.photoCaption.render')}</Button>
        </div>
      )}

      {(rendered.length > 0 || pdfBlob) && (
        <section className="settings-card stack" aria-live="polite">
          <h2>{t('tool.photoCaption.result')}</h2>
          <p className="scan-note">{t('tool.photoCaption.resultNote')}</p>
          {pdfBlob && (
            <SaveFileControl suggestedName={t('tool.photoCaption.pdfName')} mimeType="application/pdf" blob={pdfBlob} t={t} />
          )}
          {rendered.map((eintrag) => (
            <SaveFileControl key={eintrag.name} suggestedName={eintrag.name} mimeType={format} blob={eintrag.blob} t={t} />
          ))}
        </section>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.photoCaption.assumptions')}</p>
        <p className="scan-note">{t('tool.photoCaption.sources')}</p>
      </details>
    </div>
  )
}
