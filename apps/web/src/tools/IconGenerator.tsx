import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import {
  ICO_MAX_SIZE,
  ICON_SIZES,
  MASKABLE_SAFE_ZONE,
  acceptAttributeFor,
  buildManifestIcons,
  formatBytes,
  formatNames,
  inputMimeTypes,
  planIcon,
  readOnlyFormatNames,
  type IconFit,
  type ManifestIconEntry
} from '@commietools/tools'
import type { Locale } from '@commietools/i18n'
import { Button, LocalBadge } from '@commietools/ui'
import { buildIcoBlob, renderIconSet, type RenderedIcon } from './iconGeneratorRender'
import { SaveFileControl } from './SaveFileControl'
import { anzeigeKontext } from './formatContext'

type Translate = (key: string) => string

/** Formats offered by this tool, straight from the manifest. */
const acceptedFormatNames = formatNames(inputMimeTypes('icon-generator'))
/** Formats the tool can read but not write back: JPEG and WebP, since output is PNG and ICO. */
const partialFormatNames = readOnlyFormatNames('icon-generator')

/** Sizes a fresh form starts with: favicon, Apple touch icon and PWA icons. */
const DEFAULT_SIZES = [16, 32, 48, 180, 192, 512]

/** Edge length of the preview tiles; only shows the arrangement, not the final detail. */
const PREVIEW_EDGE = 160

function iconFileName(size: number, maskable: boolean): string {
  return `${maskable ? 'icon-maskable' : 'icon'}-${size}.png`
}

function drawPreview(
  canvas: HTMLCanvasElement | null,
  image: HTMLImageElement,
  fit: IconFit,
  contentScale: number,
  background: string | null
): void {
  if (!canvas) return
  canvas.width = PREVIEW_EDGE
  canvas.height = PREVIEW_EDGE
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, PREVIEW_EDGE, PREVIEW_EDGE)
  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, PREVIEW_EDGE, PREVIEW_EDGE)
  }
  const plan = planIcon(
    { width: image.naturalWidth, height: image.naturalHeight },
    PREVIEW_EDGE,
    { fit, contentScale }
  )
  context.drawImage(image, plan.draw.x, plan.draw.y, plan.draw.width, plan.draw.height)
}

function usePreview(
  ref: RefObject<HTMLCanvasElement | null>,
  image: HTMLImageElement | null,
  fit: IconFit,
  contentScale: number,
  background: string | null,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled || !image || !ref.current) return
    drawPreview(ref.current, image, fit, contentScale, background)
  }, [ref, image, fit, contentScale, background, enabled])
}

export function IconGenerator({ t, locale }: { t: Translate; locale: Locale }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [sizes, setSizes] = useState<number[]>(DEFAULT_SIZES)
  const [fit, setFit] = useState<IconFit>('cover')
  const [transparent, setTransparent] = useState(false)
  const [background, setBackground] = useState('#ffffff')
  const [maskable, setMaskable] = useState(true)
  const [withIco, setWithIco] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<{
    icons: { icon: RenderedIcon; file: string; url: string }[]
    ico: { blob: Blob; url: string; size: number } | null
    manifest: string
  } | null>(null)
  const plainPreview = useRef<HTMLCanvasElement>(null)
  const maskPreview = useRef<HTMLCanvasElement>(null)
  const sourceUrl = useRef('')

  const padBackground = transparent ? null : background

  usePreview(plainPreview, image, fit, 1, padBackground, true)
  usePreview(maskPreview, image, fit, MASKABLE_SAFE_ZONE, background, maskable)

  useEffect(() => () => {
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current)
  }, [])

  useEffect(() => () => {
    if (!result) return
    result.icons.forEach((entry) => URL.revokeObjectURL(entry.url))
    if (result.ico) URL.revokeObjectURL(result.ico.url)
  }, [result])

  function toggleSize(size: number) {
    setSizes((current) => current.includes(size)
      ? current.filter((item) => item !== size)
      : [...current, size].sort((left, right) => left - right))
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current)
    setResult(null)
    setCopied(false)
    setError('')
    const url = URL.createObjectURL(file)
    sourceUrl.current = url
    const loaded = new Image()
    loaded.onload = () => {
      setImage(loaded)
      setFileName(file.name)
      setFileSize(file.size)
    }
    loaded.onerror = () => setError('tool.iconGenerator.error')
    loaded.src = url
  }

  async function generate() {
    if (!image || !sizes.length) return
    setBusy(true)
    setError('')
    try {
      const icons = await renderIconSet(image, {
        sizes,
        fit,
        background: padBackground,
        maskable,
        maskableBackground: background
      })
      const entries = icons.map((icon) => ({
        icon,
        file: iconFileName(icon.size, icon.maskable),
        url: URL.createObjectURL(icon.blob)
      }))
      const icoBlob = withIco ? await buildIcoBlob(icons) : null
      const manifestEntries: ManifestIconEntry[] = entries.map((entry) => ({
        file: entry.file,
        size: entry.icon.size,
        purpose: entry.icon.maskable ? 'maskable' : 'any'
      }))
      setResult({
        icons: entries,
        ico: icoBlob ? { blob: icoBlob, url: URL.createObjectURL(icoBlob), size: icoBlob.size } : null,
        manifest: buildManifestIcons(manifestEntries)
      })
    } catch {
      setError('tool.iconGenerator.error')
    } finally {
      setBusy(false)
    }
  }

  async function copyManifest() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.manifest)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const oversized = sizes.some((size) => size > ICO_MAX_SIZE)

  return (
    <div className="stack">
      <section className="settings-card stack">
        <h2>{t('tool.iconGenerator.source')}</h2>
        <div className="metadata-layout">
          <div className="stack">
            <label className="field">
              <span>{t('tool.iconGenerator.chooseFile')}</span>
              <input type="file" accept={acceptAttributeFor('icon-generator')} onChange={selectFile} />
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
                  <dt>{t('tool.iconGenerator.selected')}</dt>
                  <dd className="fact-text">{fileName}</dd>
                </div>
                {image && (
                  <div>
                    <dt>{t('tool.iconGenerator.originalSize')}</dt>
                    <dd className="fact-text">{`${image.naturalWidth} × ${image.naturalHeight} px`}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('tool.imageMetadata.size')}</dt>
                  <dd className="fact-text">{formatBytes(fileSize, anzeigeKontext(locale))}</dd>
                </div>
              </dl>
            )}
            {error && <p className="error" role="alert">{t(error)}</p>}
            <p className="privacy-note">{t('tool.iconGenerator.privacy')}</p>
          </div>

          {image && (
            <div className="icon-preview-grid">
              <figure className="icon-tile">
                <canvas ref={plainPreview} role="img" aria-label={t('tool.iconGenerator.preview')} />
              </figure>
              {maskable && (
                <figure className="icon-tile">
                  <canvas ref={maskPreview} role="img" aria-label={t('tool.iconGenerator.maskableChip')} />
                  <figcaption>{t('tool.iconGenerator.maskableChip')}</figcaption>
                </figure>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.iconGenerator.sizes')}</h2>
        <div className="icon-size-list">
          {ICON_SIZES.map((size) => (
            <label className="check-field" key={size}>
              <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleSize(size)} />
              {`${size} px`}
            </label>
          ))}
        </div>
        <p className="scan-note">{t('tool.iconGenerator.sizesHint')}</p>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.iconGenerator.fit')}</h2>
        <div className="inline-field">
          <label htmlFor="icon-fit">{t('tool.iconGenerator.fit')}</label>
          <select id="icon-fit" value={fit} onChange={(event) => setFit(event.target.value as IconFit)}>
            <option value="cover">{t('tool.iconGenerator.fit.cover')}</option>
            <option value="contain">{t('tool.iconGenerator.fit.contain')}</option>
          </select>
        </div>
        <p className="scan-note">{t('tool.iconGenerator.fitHint')}</p>
        <div className="form-grid">
          <label className="check-field">
            <input type="checkbox" checked={transparent} onChange={(event) => setTransparent(event.target.checked)} />
            {t('tool.iconGenerator.transparent')}
          </label>
          <label className="field">
            <span>{t('tool.iconGenerator.background')}</span>
            <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
          </label>
        </div>
        <p className="scan-note">{t('tool.iconGenerator.backgroundHint')}</p>
        {transparent && <p className="scan-note">{t('tool.iconGenerator.transparentHint')}</p>}
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.iconGenerator.result')}</h2>
        <label className="check-field">
          <input type="checkbox" checked={maskable} onChange={(event) => setMaskable(event.target.checked)} />
          {t('tool.iconGenerator.maskable')}
        </label>
        <p className="scan-note">{t('tool.iconGenerator.maskableHint')}</p>
        <label className="check-field">
          <input type="checkbox" checked={withIco} onChange={(event) => setWithIco(event.target.checked)} />
          {t('tool.iconGenerator.ico')}
        </label>
        <p className="scan-note">{t('tool.iconGenerator.icoHint')}</p>
        {withIco && oversized && <p className="scan-note">{t('tool.iconGenerator.icoOversize')}</p>}
        <div className="download-row">
          <Button className="primary" disabled={busy || !image || !sizes.length} onClick={generate}>
            {busy ? t('tool.iconGenerator.processing') : t('tool.iconGenerator.action')}
          </Button>
          <span className="scan-note">{`${sizes.length}${maskable ? ` + ${sizes.length}` : ''} PNG`}</span>
        </div>
      </section>

      {result && (
        <section className="settings-card stack" aria-live="polite">
          <div className="preview-heading">
            <h2>{t('tool.iconGenerator.result')}</h2>
            <LocalBadge>{t('status.local')}</LocalBadge>
          </div>
          <p className="scan-note">{t('tool.iconGenerator.resultHint')}</p>
          <div className="icon-result-grid">
            {result.icons.map((entry) => (
              <figure className="icon-result" key={`${entry.file}-${entry.icon.maskable ? 'm' : 'p'}`}>
                <img src={entry.url} alt="" width={entry.icon.size} height={entry.icon.size} />
                <figcaption>
                  <span>{entry.file}</span>
                  <span className="scan-note">{formatBytes(entry.icon.blob.size, anzeigeKontext(locale))}</span>
                  <SaveFileControl blob={entry.icon.blob} suggestedName={entry.file} mimeType="image/png" t={t} />
                </figcaption>
              </figure>
            ))}
            {result.ico && (
              <figure className="icon-result">
                <img src={result.ico.url} alt="" width={48} height={48} />
                <figcaption>
                  <span>favicon.ico</span>
                  <span className="scan-note">{formatBytes(result.ico.size, anzeigeKontext(locale))}</span>
                  <SaveFileControl blob={result.ico.blob} suggestedName="favicon.ico" mimeType="image/x-icon" t={t} />
                </figcaption>
              </figure>
            )}
          </div>

          <h3>{t('tool.iconGenerator.manifest')}</h3>
          <p className="scan-note">{t('tool.iconGenerator.manifestHint')}</p>
          <label className="field">
            <span>{t('tool.iconGenerator.manifest')}</span>
            <textarea className="icon-manifest" readOnly value={result.manifest} />
          </label>
          <div className="download-row">
            <Button onClick={copyManifest}>{copied ? t('tool.iconGenerator.copied') : t('tool.iconGenerator.copy')}</Button>
          </div>
        </section>
      )}
    </div>
  )
}
