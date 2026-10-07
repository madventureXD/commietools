import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor, cropBoxFraction, fitScale, formatBytes, formatNames, inputMimeTypes, planResize, readOnlyFormatNames, type CropRect, type ResizeMode } from '@commietools/tools'
import type { Locale } from '@commietools/i18n'
import { Button, LocalBadge } from '@commietools/ui'
import { renderOrientationPreview, renderPlan } from './imageResizeRender'
import { SaveFileControl } from './SaveFileControl'
import { anzeigeKontext } from './formatContext'

/** Formats offered by this tool, straight from the manifest. */
const acceptedFormatNames = formatNames(inputMimeTypes('image-resize'))
/** Formats the tool can read but not write back; empty for this tool. */
const partialFormatNames = readOnlyFormatNames('image-resize')

type Translate = (key: string) => string

/** Preview box the orientated image is fitted into. */
const previewBox = { width: 560, height: 420 }

function outputName(name: string, width: number, height: number, type: string): string {
  const dot = name.lastIndexOf('.')
  const extension = dot > 0 ? name.slice(dot) : type === 'image/webp' ? '.webp' : type === 'image/png' ? '.png' : '.jpg'
  const base = dot > 0 ? name.slice(0, dot) : name
  return `${base}-${width}x${height}${extension}`
}

export function ImageResize({ t, locale }: { t: Translate; locale: Locale }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('image/jpeg')
  const [fileSize, setFileSize] = useState(0)
  const [quarterTurns, setQuarterTurns] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [crop, setCrop] = useState<CropRect | null>(null)
  const [mode, setMode] = useState<ResizeMode>('dimensions')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(768)
  const [lockAspect, setLockAspect] = useState(true)
  const [percent, setPercent] = useState(50)
  const [quality, setQuality] = useState(0.9)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewUrl = useRef('')

  const plan = useMemo(
    () =>
      image
        ? planResize(
            { width: image.naturalWidth, height: image.naturalHeight },
            { mode, width, height, lockAspect, percent, quarterTurns, flipHorizontal, flipVertical, crop }
          )
        : null,
    [image, mode, width, height, lockAspect, percent, quarterTurns, flipHorizontal, flipVertical, crop]
  )

  const scale = plan ? fitScale(previewBox, plan.oriented) : 1

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url)
    }
  }, [result])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image || !plan) return
    const painted = renderOrientationPreview(image, plan)
    canvas.width = painted.width
    canvas.height = painted.height
    canvas.getContext('2d')?.drawImage(painted, 0, 0)
  }, [image, plan])

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    if (result) URL.revokeObjectURL(result.url)
    setResult(null)
    setError('')
    setCrop(null)
    setQuarterTurns(0)
    setFlipHorizontal(false)
    setFlipVertical(false)

    const url = URL.createObjectURL(file)
    previewUrl.current = url
    const loaded = new Image()
    loaded.onload = () => {
      setImage(loaded)
      setWidth(loaded.naturalWidth)
      setHeight(loaded.naturalHeight)
    }
    loaded.onerror = () => setError('tool.imageResize.error')
    loaded.src = url
    setFileName(file.name)
    setFileType(file.type || 'image/jpeg')
    setFileSize(file.size)
  }

  function resetAll() {
    setQuarterTurns(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setCrop(null)
    setMode('dimensions')
    setLockAspect(true)
    if (image) {
      setWidth(image.naturalWidth)
      setHeight(image.naturalHeight)
    }
  }

  function rotate(step: number) {
    setQuarterTurns((current) => (current + step + 4) % 4)
    setCrop(null)
  }

  async function process() {
    if (!image || !plan) return
    setProcessing(true)
    setError('')
    try {
      const format = fileType === 'image/png' || fileType === 'image/webp' ? fileType : 'image/jpeg'
      const blob = await renderPlan(image, plan, { format, quality })
      if (result) URL.revokeObjectURL(result.url)
      setResult({ url: URL.createObjectURL(blob), size: blob.size, width: plan.target.width, height: plan.target.height })
    } catch {
      setError('tool.imageResize.error')
    } finally {
      setProcessing(false)
    }
  }

  const cropBox = plan ? cropBoxFraction(plan) : null
  const oriented = plan?.oriented ?? { width: 1, height: 1 }
  const cropValue = (key: keyof CropRect) => (plan ? plan.crop[key] : 0)
  const updateCrop = (key: keyof CropRect, value: number) =>
    setCrop({ ...(crop ?? { x: 0, y: 0, width: oriented.width, height: oriented.height }), [key]: value })

  return (
    <div className="stack">
      <section className="settings-card stack">
        <h2>{t('tool.imageResize.source')}</h2>
        <div className="metadata-layout">
          <div className="stack">
            <label className="field">
              <span>{t('tool.imageResize.chooseFile')}</span>
              <input type="file" accept={acceptAttributeFor('image-resize')} onChange={selectFile} />
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
                  <dt>{t('tool.imageResize.selected')}</dt>
                  <dd className="fact-text">{fileName}</dd>
                </div>
                {image && (
                  <div>
                    <dt>{t('tool.imageResize.originalSize')}</dt>
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
            <p className="privacy-note">{t('tool.imageResize.privacy')}</p>
          </div>

          {image && plan && (
            <figure className="resize-preview">
              <div
                className="resize-stage"
                style={{ width: `min(100%, ${Math.round(oriented.width * scale)}px)`, aspectRatio: `${oriented.width} / ${oriented.height}` }}
              >
                <canvas ref={canvasRef} role="img" aria-label={t('tool.imageResize.preview')} style={{ width: '100%', height: '100%' }} />
                {cropBox && (
                  <span
                    className="resize-crop-frame"
                    aria-hidden="true"
                    style={{
                      left: `${cropBox.x * 100}%`,
                      top: `${cropBox.y * 100}%`,
                      width: `${cropBox.width * 100}%`,
                      height: `${cropBox.height * 100}%`
                    }}
                  />
                )}
              </div>
              <figcaption className="scan-note">{t('tool.imageResize.previewHint')}</figcaption>
            </figure>
          )}
        </div>
      </section>

      {image && plan && (
        <>
          <section className="settings-card stack">
            <h2>{t('tool.imageResize.transform')}</h2>
            <div className="segmented">
              <Button onClick={() => rotate(-1)}>{t('tool.imageResize.rotateLeft')}</Button>
              <Button onClick={() => rotate(1)}>{t('tool.imageResize.rotateRight')}</Button>
              <Button className={flipHorizontal ? 'active' : ''} aria-pressed={flipHorizontal} onClick={() => setFlipHorizontal((value) => !value)}>
                {t('tool.imageResize.flipHorizontal')}
              </Button>
              <Button className={flipVertical ? 'active' : ''} aria-pressed={flipVertical} onClick={() => setFlipVertical((value) => !value)}>
                {t('tool.imageResize.flipVertical')}
              </Button>
              <Button onClick={resetAll}>{t('tool.imageResize.reset')}</Button>
            </div>
          </section>

          <section className="settings-card stack">
            <h2>{t('tool.imageResize.crop')}</h2>
            <div className="form-grid">
              {(['x', 'y', 'width', 'height'] as const).map((key) => (
                <label className="field" key={key}>
                  <span>{t(`tool.imageResize.crop${key === 'x' ? 'X' : key === 'y' ? 'Y' : key === 'width' ? 'Width' : 'Height'}`)}</span>
                  <input type="number" min={key === 'x' || key === 'y' ? 0 : 1} value={cropValue(key)} onChange={(event) => updateCrop(key, Number(event.target.value))} />
                </label>
              ))}
            </div>
            <div className="download-row">
              <Button onClick={() => setCrop(null)}>{t('tool.imageResize.cropReset')}</Button>
              <span className="scan-note">{`${oriented.width} × ${oriented.height} px`}</span>
            </div>
          </section>

          <section className="settings-card stack">
            <h2>{t('tool.imageResize.size')}</h2>
            <div className="inline-field">
              <label htmlFor="resize-mode">{t('tool.imageResize.mode')}</label>
              <select id="resize-mode" value={mode} onChange={(event) => setMode(event.target.value as ResizeMode)}>
                <option value="dimensions">{t('tool.imageResize.mode.dimensions')}</option>
                <option value="percent">{t('tool.imageResize.mode.percent')}</option>
              </select>
            </div>
            {mode === 'dimensions' ? (
              <div className="form-grid">
                <label className="field">
                  <span>{t('tool.imageResize.width')}</span>
                  <input type="number" min={1} max={10000} value={width} onChange={(event) => setWidth(Number(event.target.value))} />
                </label>
                <label className="field">
                  <span>{t('tool.imageResize.height')}</span>
                  {/* With a locked aspect ratio the width decides, so show the derived value here. */}
                  {lockAspect ? (
                    <input type="number" value={plan.target.height} readOnly aria-readonly="true" />
                  ) : (
                    <input type="number" min={1} max={10000} value={height} onChange={(event) => setHeight(Number(event.target.value))} />
                  )}
                </label>
                <label className="check-field">
                  <input type="checkbox" checked={lockAspect} onChange={(event) => setLockAspect(event.target.checked)} />
                  {t('tool.imageResize.lockAspect')}
                </label>
              </div>
            ) : (
              <label className="field">
                <span>{`${t('tool.imageResize.percent')}: ${percent}%`}</span>
                <input type="range" min={1} max={400} value={percent} onChange={(event) => setPercent(Number(event.target.value))} />
              </label>
            )}
            <dl className="results metadata-facts">
              <div>
                <dt>{t('tool.imageResize.outputSize')}</dt>
                <dd className="fact-text">{`${plan.target.width} × ${plan.target.height} px`}</dd>
              </div>
            </dl>
            {plan.clamped && <p className="error" role="alert">{t('tool.imageResize.clamped')}</p>}
            {plan.scale > 1 && <p className="scan-note">{t('tool.imageResize.upscaleHint')}</p>}
          </section>

          <section className="settings-card stack">
            <h2>{t('tool.imageResize.output')}</h2>
            {fileType !== 'image/png' && (
              <label className="field">
                <span>{`${t('tool.imageResize.quality')}: ${Math.round(quality * 100)}%`}</span>
                <input type="range" min={40} max={100} value={Math.round(quality * 100)} onChange={(event) => setQuality(Number(event.target.value) / 100)} />
              </label>
            )}
            <p className="scan-note">{t('tool.imageResize.qualityHint')}</p>
            <p className="scan-note">{t('tool.imageResize.filterHint')}</p>
            <div className="download-row">
              <Button className="primary" disabled={processing} onClick={process}>{processing ? t('tool.imageResize.processing') : t('tool.imageResize.action')}</Button>
            </div>
          </section>
        </>
      )}

      {result && plan && (
        <section className="settings-card stack" aria-live="polite">
          <div className="preview-heading">
            <h2>{t('tool.imageResize.result')}</h2>
            <LocalBadge>{t('status.local')}</LocalBadge>
          </div>
          <dl className="results metadata-facts">
            <div>
              <dt>{t('tool.imageResize.outputSize')}</dt>
              <dd className="fact-text">{`${result.width} × ${result.height} px`}</dd>
            </div>
            <div>
              <dt>{t('tool.imageMetadata.size')}</dt>
              <dd className="fact-text">{formatBytes(result.size, anzeigeKontext(locale))}</dd>
            </div>
          </dl>
          <img className="resize-result" src={result.url} alt="" />
          <SaveFileControl url={result.url} suggestedName={outputName(fileName, result.width, result.height, fileType)} mimeType={fileType} t={t} />
        </section>
      )}
    </div>
  )
}
