import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  acceptAttributeFor,
  detectImageFormat,
  findMetadataSegments,
  formatNames,
  inputMimeTypes,
  readOnlyFormatNames,
  readMetadata,
  stripMetadata,
  type ImageFormat,
  type MetadataEntry,
  type MetadataGroup,
  type MetadataReport,
  type MetadataSegment
} from '@commietools/tools'
import type { Locale } from '@commietools/i18n'
import { Button, LocalBadge } from '@commietools/ui'
import { SaveFileControl } from './SaveFileControl'

/** Formats offered by this tool, straight from the manifest. */
const acceptedFormatNames = formatNames(inputMimeTypes('image-metadata'))
/** Formats the tool can read but not clean losslessly. */
const partialFormatNames = readOnlyFormatNames('image-metadata')

type Translate = (key: string) => string

const groupOrder: readonly MetadataGroup[] = ['camera', 'time', 'exposure', 'image', 'location', 'software', 'author']

/** Returns the fallback when a catalog has no entry for the key. */
function translated(t: Translate, key: string, fallback: string): string {
  const value = t(key)
  return value === key ? fallback : value
}

function formatBytes(bytes: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: bytes < 1024 * 1024 ? 1 : 2 })
  if (bytes < 1024) return `${formatter.format(bytes)} B`
  if (bytes < 1024 * 1024) return `${formatter.format(bytes / 1024)} kB`
  return `${formatter.format(bytes / (1024 * 1024))} MB`
}

function cleanedName(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? `${name.slice(0, dot)}-clean${name.slice(dot)}` : `${name}-clean`
}

function entryLabel(t: Translate, entry: MetadataEntry): string {
  return translated(t, `tool.imageMetadata.tag.${entry.tag}`, entry.tag)
}

function entryValue(t: Translate, entry: MetadataEntry): string {
  return entry.valueKey ? translated(t, entry.valueKey, entry.value) : entry.value
}

export function ImageMetadata({ t, locale }: { t: Translate; locale: Locale }) {
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [bytes, setBytes] = useState<Uint8Array | null>(null)
  const [report, setReport] = useState<MetadataReport | null>(null)
  const [error, setError] = useState('')
  const [keepColorProfiles, setKeepColorProfiles] = useState(true)
  const [cleaned, setCleaned] = useState<{ url: string; removed: readonly MetadataSegment[]; saved: number } | null>(null)
  const [dimensions, setDimensions] = useState('')
  const previewUrl = useRef('')
  const [preview, setPreview] = useState('')

  const format: ImageFormat = bytes ? detectImageFormat(bytes) : 'unknown'
  const supported = format === 'jpeg' || format === 'png' || format === 'webp'
  const segments = useMemo(() => (bytes ? findMetadataSegments(bytes, { keepColorProfiles }) : []), [bytes, keepColorProfiles])
  const groups = useMemo(() => {
    const map = new Map<MetadataGroup, MetadataEntry[]>()
    for (const entry of report?.entries ?? []) {
      const list = map.get(entry.group) ?? []
      list.push(entry)
      map.set(entry.group, list)
    }
    return map
  }, [report])

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (cleaned) URL.revokeObjectURL(cleaned.url)
    }
  }, [cleaned])

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (cleaned) URL.revokeObjectURL(cleaned.url)
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    setCleaned(null)
    setDimensions('')
    setError('')
    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const url = URL.createObjectURL(file)
      previewUrl.current = url
      setPreview(url)
      setFileName(file.name)
      setFileType(file.type)
      setBytes(data)
      setReport(readMetadata(data))
    } catch {
      setError('tool.imageMetadata.readError')
      setBytes(null)
      setReport(null)
      setFileName(file.name)
    }
  }

  function removeMetadata() {
    if (!bytes) return
    const result = stripMetadata(bytes, { keepColorProfiles })
    if (!result.changed) {
      setCleaned(null)
      return
    }
    const url = URL.createObjectURL(new Blob([new Uint8Array(result.data)], { type: fileType || 'application/octet-stream' }))
    setCleaned({ url, removed: result.removed, saved: bytes.length - result.data.length })
  }

  const position = report?.position ?? null

  return (
    <div className="stack">
      <section className="settings-card stack">
        <h2>{t('tool.imageMetadata.file')}</h2>
        <div className="metadata-layout">
          <div className="stack">
            <label className="field">
              <span>{t('tool.imageMetadata.chooseFile')}</span>
              <input type="file" accept={acceptAttributeFor('image-metadata')} onChange={selectFile} />
            </label>
            <p className="format-list">
              <span>{t('tool.formats')}</span>
              {acceptedFormatNames.map((name) => <span className="format-chip" key={name}>{name}</span>)}
            </p>
            {partialFormatNames.length > 0 && (
              <p className="format-list">
                <span>{t('tool.formats.readOnly')}</span>
                {partialFormatNames.map((name) => <span className="format-chip" key={name}>{name}</span>)}
              </p>
            )}
            {fileName && (
              <dl className="results metadata-facts">
                <div>
                  <dt>{t('tool.imageMetadata.selected')}</dt>
                  <dd className="fact-text">{fileName}</dd>
                </div>
                {bytes && (
                  <div>
                    <dt>{t('tool.imageMetadata.size')}</dt>
                    <dd className="fact-text">{formatBytes(bytes.length, locale)}</dd>
                  </div>
                )}
                {dimensions && (
                  <div>
                    <dt>{t('tool.imageMetadata.dimensions')}</dt>
                    <dd className="fact-text">{dimensions}</dd>
                  </div>
                )}
              </dl>
            )}
            {error && <p className="error" role="alert">{t(error)}</p>}
          </div>
          {preview && <img className="metadata-preview" src={preview} alt="" onLoad={(event) => setDimensions(`${event.currentTarget.naturalWidth} × ${event.currentTarget.naturalHeight} px`)} />}
        </div>
        <p className="privacy-note">{t('tool.imageMetadata.privacy')}</p>
      </section>

      {bytes && (
        <section className="settings-card stack" aria-live="polite">
          <div className="preview-heading">
            <h2>{t('tool.imageMetadata.found')}</h2>
            <LocalBadge>{t('status.local')}</LocalBadge>
          </div>
          {segments.length === 0 && (report?.entries.length ?? 0) === 0 ? (
            <p className="scan-note">{t('tool.imageMetadata.none')}</p>
          ) : (
            <>
              <ul className="segment-list">
                {segments.map((segment) => (
                  <li key={segment}>{t(`tool.imageMetadata.segment.${segment}`)}</li>
                ))}
              </ul>
              {groupOrder.map((group) => {
                const entries = groups.get(group)
                if (!entries?.length) return null
                return (
                  <div key={group} className="metadata-group">
                    <h3>{t(`tool.imageMetadata.group.${group}`)}</h3>
                    <dl className="metadata-entries">
                      {entries.map((entry) => (
                        <div key={`${entry.group}-${entry.tag}`}>
                          <dt>{entryLabel(t, entry)}</dt>
                          <dd>{entryValue(t, entry)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )
              })}
              {position && (
                <div className="metadata-group">
                  <h3>{t('tool.imageMetadata.position')}</h3>
                  <dl className="metadata-entries">
                    <div>
                      <dt>{t('tool.imageMetadata.coordinates')}</dt>
                      <dd>{`${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`}</dd>
                    </div>
                    {position.altitude !== null && (
                      <div>
                        <dt>{t('tool.imageMetadata.altitude')}</dt>
                        <dd>{`${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(position.altitude)} m`}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {bytes && (
        <section className="settings-card stack">
          <h2>{t('tool.imageMetadata.settings')}</h2>
          <label className="check-field">
            <input type="checkbox" checked={keepColorProfiles} onChange={(event) => setKeepColorProfiles(event.target.checked)} />
            {t('tool.imageMetadata.keepColorProfiles')}
          </label>
          <p className="scan-note">{t('tool.imageMetadata.keepColorProfilesHint')}</p>
          <p className="scan-note">{t('tool.imageMetadata.lossless')}</p>
          <div className="download-row">
            <Button className="primary" disabled={!supported} onClick={removeMetadata}>{t('tool.imageMetadata.action')}</Button>
          </div>
          {!supported && (
            <p className="error" role="alert">
              {t('tool.imageMetadata.unsupported')} {t('tool.imageMetadata.unsupportedHint')}
            </p>
          )}
        </section>
      )}

      {cleaned && (
        <section className="settings-card stack" aria-live="polite">
          <h2>{t('tool.imageMetadata.result')}</h2>
          {cleaned.removed.length === 0 ? (
            <p className="scan-note">{t('tool.imageMetadata.removedNone')}</p>
          ) : (
            <>
              <p className="scan-note">{t('tool.imageMetadata.removed')}</p>
              <ul className="segment-list">
                {cleaned.removed.map((segment) => (
                  <li key={segment}>{t(`tool.imageMetadata.segment.${segment}`)}</li>
                ))}
              </ul>
            </>
          )}
          <p className="scan-note">
            {t('tool.imageMetadata.savedBytes')}: {formatBytes(Math.max(cleaned.saved, 0), locale)}
          </p>
          <p className="privacy-note">{t('tool.imageMetadata.lossless')}</p>
          <SaveFileControl url={cleaned.url} suggestedName={cleanedName(fileName)} mimeType={fileType || 'application/octet-stream'} t={t} />
        </section>
      )}
    </div>
  )
}
