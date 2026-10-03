import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  MAX_SCALE,
  MIN_SCALE,
  WATERMARK_ANCHORS,
  acceptAttributeFor,
  auxiliaryMimeTypes,
  clampOpacity,
  formatNames,
  inputMimeTypes,
  placeWatermark,
  type WatermarkAnchor,
  type WatermarkBox
} from '@commietools/tools'
import type { Locale } from '@commietools/i18n'
import { Button, LocalBadge } from '@commietools/ui'
import { drawMark, measureMark, plannedMarkSize, renderWatermark, type MarkSource } from './imageWatermarkRender'

type Translate = (key: string) => string

/** Formats offered by this tool, straight from the manifest. */
const acceptedFormatNames = formatNames(inputMimeTypes('image-watermark'))
const logoFormatNames = formatNames(auxiliaryMimeTypes('image-watermark', 'logo'))

/** Longest edge of the preview canvas; the saved file keeps the original size. */
const PREVIEW_EDGE = 640

const FONTS = [
  { key: 'tool.watermark.font.sans', value: 'system-ui, sans-serif' },
  { key: 'tool.watermark.font.serif', value: 'Georgia, serif' },
  { key: 'tool.watermark.font.mono', value: 'ui-monospace, Consolas, monospace' }
] as const

const ANCHOR_KEYS: Record<WatermarkAnchor, string> = {
  'top-left': 'tool.watermark.anchor.topLeft',
  top: 'tool.watermark.anchor.top',
  'top-right': 'tool.watermark.anchor.topRight',
  left: 'tool.watermark.anchor.left',
  center: 'tool.watermark.anchor.center',
  right: 'tool.watermark.anchor.right',
  'bottom-left': 'tool.watermark.anchor.bottomLeft',
  bottom: 'tool.watermark.anchor.bottom',
  'bottom-right': 'tool.watermark.anchor.bottomRight'
}

function formatBytes(bytes: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  if (bytes < 1024) return `${formatter.format(bytes)} B`
  if (bytes < 1024 * 1024) return `${formatter.format(bytes / 1024)} kB`
  return `${formatter.format(bytes / (1024 * 1024))} MB`
}

function outputName(name: string, type: string): string {
  const dot = name.lastIndexOf('.')
  const extension = dot > 0 ? name.slice(dot) : type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.jpg'
  const base = dot > 0 ? name.slice(0, dot) : name
  return `${base}-watermark${extension}`
}

function scaleBox(box: WatermarkBox, factor: number): WatermarkBox {
  return {
    x: box.x * factor,
    y: box.y * factor,
    width: box.width * factor,
    height: box.height * factor
  }
}

export function ImageWatermark({ t, locale }: { t: Translate; locale: Locale }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('image/jpeg')
  const [fileSize, setFileSize] = useState(0)
  const [mode, setMode] = useState<'text' | 'logo'>('text')
  const [text, setText] = useState('© ')
  const [font, setFont] = useState<string>(FONTS[0].value)
  const [colour, setColour] = useState('#ffffff')
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [logoName, setLogoName] = useState('')
  const [anchor, setAnchor] = useState<WatermarkAnchor>('bottom-right')
  const [tiled, setTiled] = useState(false)
  const [spacing, setSpacing] = useState(60)
  const [margin, setMargin] = useState(4)
  const [scale, setScale] = useState(18)
  const [opacity, setOpacity] = useState(70)
  const [rotation, setRotation] = useState(0)
  const [quality, setQuality] = useState(0.9)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ url: string; size: number } | null>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const sourceUrl = useRef('')
  const logoUrl = useRef('')

  const mark: MarkSource | null = useMemo(() => {
    if (mode === 'logo') return logo ? { kind: 'logo', image: logo } : null
    return { kind: 'text', text, font, colour }
  }, [mode, logo, text, font, colour])

  const options = useMemo(() => ({
    anchor,
    scale: scale / 100,
    margin: margin / 100,
    rotation,
    tiled,
    spacing: spacing / 100
  }), [anchor, scale, margin, rotation, tiled, spacing])

  const placement = useMemo(() => {
    if (!image || !mark) return null
    const measured = measureMark(mark)
    const boxes = placeWatermark(
      { width: image.naturalWidth, height: image.naturalHeight },
      measured,
      options
    )
    const factor = Math.min(1, PREVIEW_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    return { boxes, factor, size: plannedMarkSize(image, mark, options.scale) }
  }, [image, mark, options])

  useEffect(() => () => {
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current)
    if (logoUrl.current) URL.revokeObjectURL(logoUrl.current)
  }, [])

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url)
  }, [result])

  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas || !image || !mark || !placement) return
    const width = Math.max(1, Math.round(image.naturalWidth * placement.factor))
    const height = Math.max(1, Math.round(image.naturalHeight * placement.factor))
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    for (const box of placement.boxes) {
      drawMark(context, mark, scaleBox(box, placement.factor), options.rotation, clampOpacity(opacity / 100))
    }
  }, [image, mark, placement, options.rotation, opacity])

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current)
    setResult(null)
    setError('')
    const url = URL.createObjectURL(file)
    sourceUrl.current = url
    const loaded = new Image()
    loaded.onload = () => {
      setImage(loaded)
      setFileName(file.name)
      setFileSize(file.size)
      setFileType(file.type || 'image/jpeg')
    }
    loaded.onerror = () => setError('tool.watermark.error')
    loaded.src = url
  }

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (logoUrl.current) URL.revokeObjectURL(logoUrl.current)
    setResult(null)
    setError('')
    const url = URL.createObjectURL(file)
    logoUrl.current = url
    const loaded = new Image()
    loaded.onload = () => {
      setLogo(loaded)
      setLogoName(file.name)
      setMode('logo')
    }
    loaded.onerror = () => setError('tool.watermark.error')
    loaded.src = url
  }

  async function apply() {
    if (!image || !mark) return
    setBusy(true)
    setError('')
    try {
      const format = (fileType === 'image/png' || fileType === 'image/webp' ? fileType : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'
      const blob = await renderWatermark(image, mark, {
        ...options,
        opacity: clampOpacity(opacity / 100),
        format,
        quality
      })
      if (result) URL.revokeObjectURL(result.url)
      setResult({ url: URL.createObjectURL(blob), size: blob.size })
    } catch {
      setError('tool.watermark.error')
    } finally {
      setBusy(false)
    }
  }

  const ready = Boolean(image && mark && (mode === 'text' ? text.trim() : true))

  return (
    <div className="stack">
      <section className="settings-card stack">
        <h2>{t('tool.watermark.source')}</h2>
        <div className="metadata-layout">
          <div className="stack">
            <label className="field">
              <span>{t('tool.watermark.chooseFile')}</span>
              <input type="file" accept={acceptAttributeFor('image-watermark')} onChange={selectImage} />
            </label>
            <p className="format-list">
              <span>{t('tool.formats')}</span>
              {acceptedFormatNames.map((name) => <span className="format-chip" key={name}>{name}</span>)}
            </p>
            {fileName && (
              <dl className="results metadata-facts">
                <div>
                  <dt>{t('tool.watermark.selected')}</dt>
                  <dd className="fact-text">{fileName}</dd>
                </div>
                {image && (
                  <div>
                    <dt>{t('tool.watermark.originalSize')}</dt>
                    <dd className="fact-text">{`${image.naturalWidth} × ${image.naturalHeight} px`}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('tool.imageMetadata.size')}</dt>
                  <dd className="fact-text">{formatBytes(fileSize, locale)}</dd>
                </div>
              </dl>
            )}
            {error && <p className="error" role="alert">{t(error)}</p>}
            <p className="privacy-note">{t('tool.watermark.privacy')}</p>
            <p className="scan-note">{t('tool.watermark.burnedIn')}</p>
          </div>

          {image && placement && (
            <figure className="resize-preview">
              <canvas className="watermark-stage" ref={previewRef} role="img" aria-label={t('tool.watermark.preview')} />
              <figcaption className="scan-note">{t('tool.watermark.previewHint')}</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.watermark.mark')}</h2>
        <div className="segmented" role="group" aria-label={t('tool.watermark.mark')}>
          <Button className={mode === 'text' ? 'active' : ''} aria-pressed={mode === 'text'} onClick={() => setMode('text')}>
            {t('tool.watermark.mode.text')}
          </Button>
          <Button className={mode === 'logo' ? 'active' : ''} aria-pressed={mode === 'logo'} onClick={() => setMode('logo')}>
            {t('tool.watermark.mode.logo')}
          </Button>
        </div>

        {mode === 'text' ? (
          <div className="form-grid">
            <label className="field">
              <span>{t('tool.watermark.text')}</span>
              <input type="text" value={text} placeholder={t('tool.watermark.textPlaceholder')} onChange={(event) => setText(event.target.value)} />
            </label>
            <label className="field">
              <span>{t('tool.watermark.font')}</span>
              <select value={font} onChange={(event) => setFont(event.target.value)}>
                {FONTS.map((item) => <option key={item.key} value={item.value}>{t(item.key)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>{t('tool.watermark.color')}</span>
              <input type="color" value={colour} onChange={(event) => setColour(event.target.value)} />
            </label>
          </div>
        ) : (
          <div className="stack">
            <label className="field">
              <span>{t('tool.watermark.logo')}</span>
              <input type="file" accept={auxiliaryMimeTypes('image-watermark', 'logo').join(',')} onChange={selectLogo} />
            </label>
            <p className="format-list">
              <span>{t('tool.formats')}</span>
              {logoFormatNames.map((name) => <span className="format-chip" key={name}>{name}</span>)}
            </p>
            {logoName && <p className="scan-note">{logoName}</p>}
            <p className="scan-note">{t('tool.watermark.logoHint')}</p>
          </div>
        )}
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.watermark.position')}</h2>
        <div className="anchor-grid" role="group" aria-label={t('tool.watermark.position')}>
          {WATERMARK_ANCHORS.map((item) => (
            <Button
              key={item}
              className={anchor === item && !tiled ? 'active' : ''}
              aria-pressed={anchor === item}
              aria-label={t(ANCHOR_KEYS[item])}
              title={t(ANCHOR_KEYS[item])}
              onClick={() => { setAnchor(item); setTiled(false) }}
            >
              <span className="anchor-dot" aria-hidden="true" />
            </Button>
          ))}
        </div>
        <p className="anchor-caption">{t(ANCHOR_KEYS[anchor])}</p>
        <label className="check-field">
          <input type="checkbox" checked={tiled} onChange={(event) => setTiled(event.target.checked)} />
          {t('tool.watermark.tiled')}
        </label>
        {tiled ? (
          <>
            <label className="field">
              <span>{`${t('tool.watermark.spacing')}: ${spacing} %`}</span>
              <input type="range" min={0} max={300} value={spacing} onChange={(event) => setSpacing(Number(event.target.value))} />
            </label>
            <p className="scan-note">{t('tool.watermark.disabledInPattern')}</p>
          </>
        ) : (
          <label className="field">
            <span>{`${t('tool.watermark.margin')}: ${margin} %`}</span>
            <input type="range" min={0} max={20} value={margin} onChange={(event) => setMargin(Number(event.target.value))} />
          </label>
        )}
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.watermark.appearance')}</h2>
        <label className="field">
          <span>{`${t('tool.watermark.size')}: ${scale} %`}</span>
          <input type="range" min={Math.round(MIN_SCALE * 100)} max={Math.round(MAX_SCALE * 100)} value={scale} onChange={(event) => setScale(Number(event.target.value))} />
        </label>
        <label className="field">
          <span>{`${t('tool.watermark.opacity')}: ${opacity} %`}</span>
          <input type="range" min={5} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
        </label>
        <label className="field">
          <span>{`${t('tool.watermark.rotation')}: ${rotation}°`}</span>
          <input type="range" min={-180} max={180} value={rotation} onChange={(event) => setRotation(Number(event.target.value))} />
        </label>
        <p className="scan-note">{t('tool.watermark.rotationHint')}</p>
        <dl className="results metadata-facts">
          <div>
            <dt>{t('tool.watermark.size')}</dt>
            <dd className="fact-text">{placement ? `${placement.size.width} × ${placement.size.height} px` : '–'}</dd>
          </div>
          <div>
            <dt>{t('tool.watermark.tiles')}</dt>
            <dd className="fact-text">{placement ? placement.boxes.length : 0}</dd>
          </div>
        </dl>
        {fileType !== 'image/png' && (
          <label className="field">
            <span>{`${t('tool.watermark.quality')}: ${Math.round(quality * 100)} %`}</span>
            <input type="range" min={40} max={100} value={Math.round(quality * 100)} onChange={(event) => setQuality(Number(event.target.value) / 100)} />
          </label>
        )}
        <p className="scan-note">{t('tool.watermark.qualityHint')}</p>
        <div className="download-row">
          <Button className="primary" disabled={busy || !ready} onClick={apply}>
            {busy ? t('tool.watermark.processing') : t('tool.watermark.action')}
          </Button>
        </div>
      </section>

      {result && (
        <section className="settings-card stack" aria-live="polite">
          <div className="preview-heading">
            <h2>{t('tool.watermark.result')}</h2>
            <LocalBadge>{t('status.local')}</LocalBadge>
          </div>
          <dl className="results metadata-facts">
            <div>
              <dt>{t('tool.imageMetadata.size')}</dt>
              <dd className="fact-text">{formatBytes(result.size, locale)}</dd>
            </div>
          </dl>
          <img className="resize-result" src={result.url} alt="" />
          <div className="download-row">
            <a className="button primary" href={result.url} download={outputName(fileName, fileType)}>
              {t('tool.watermark.download')}
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
