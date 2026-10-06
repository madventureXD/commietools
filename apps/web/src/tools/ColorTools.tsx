import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'
import {
  CVD_TYPES,
  MAX_PALETTE_COLORS,
  acceptAttributeFor,
  contrastVerdict,
  formatNames,
  inputMimeTypes,
  paletteFromPixels,
  parseColor,
  rgbToHsl,
  rgbToLab,
  simulateCvd,
  toHex,
  type CvdType,
  type Rgb
} from '@commietools/tools'
import { Button } from '@commietools/ui'

type Translate = (key: string) => string

/** Formats offered by this tool, straight from the manifest. */
const acceptedFormatNames = formatNames(inputMimeTypes('color-tools'))

/** Longest edge of the working canvas; the click is mapped back to the original pixels. */
const WORK_EDGE = 900

/** Colours shown in the simulation table: the picked one plus the palette. */
const MAX_TABLE_COLORS = 6

const CVD_KEYS: Record<CvdType, string> = {
  protanopia: 'tool.colorTools.protanopia',
  deuteranopia: 'tool.colorTools.deuteranopia',
  tritanopia: 'tool.colorTools.tritanopia',
  achromatopsia: 'tool.colorTools.achromatopsia'
}

function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
}

function distinct(colors: readonly Rgb[]): Rgb[] {
  const seen = new Set<string>()
  const result: Rgb[] = []
  for (const color of colors) {
    const key = toHex(color)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(color)
  }
  return result
}

export function ColorTools({ t }: { t: Translate }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [pixels, setPixels] = useState<ImageData | null>(null)
  const [error, setError] = useState('')
  const [color, setColor] = useState<Rgb>({ r: 29, g: 53, b: 87 })
  const [inputText, setInputText] = useState('#1d3557')
  const [inputValid, setInputValid] = useState(true)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [palette, setPalette] = useState<Rgb[]>([])
  const [paletteCount, setPaletteCount] = useState(5)
  const [paletteBusy, setPaletteBusy] = useState(false)
  const [background, setBackground] = useState<Rgb>({ r: 255, g: 255, b: 255 })
  const [copied, setCopied] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceUrl = useRef('')

  const hsl = useMemo(() => rgbToHsl(color), [color])
  const lab = useMemo(() => rgbToLab(color), [color])
  const verdict = useMemo(() => contrastVerdict(color, background), [color, background])

  useEffect(() => () => {
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current)
  }, [])

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current)
    setError('')
    setPalette([])
    setCursor(null)
    const url = URL.createObjectURL(file)
    sourceUrl.current = url
    const loaded = new Image()
    loaded.onload = () => {
      setImage(loaded)
      setFileName(file.name)
    }
    loaded.onerror = () => setError('tool.colorTools.error')
    loaded.src = url
  }

  // The working canvas keeps the full pixels, so a click reads the real colour
  // and not an interpolated one from a scaled-down preview.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const factor = Math.min(1, WORK_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.max(1, Math.round(image.naturalWidth * factor))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * factor))
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    setPixels(context.getImageData(0, 0, canvas.width, canvas.height))
  }, [image])

  function adoptColor(next: Rgb) {
    setColor(next)
    setInputText(toHex(next))
    setInputValid(true)
  }

  function readPixel(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas || !pixels) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.min(pixels.width - 1, Math.max(0, Math.round(((clientX - rect.left) / rect.width) * pixels.width)))
    const y = Math.min(pixels.height - 1, Math.max(0, Math.round(((clientY - rect.top) / rect.height) * pixels.height)))
    const offset = (y * pixels.width + x) * 4
    setCursor({ x, y })
    adoptColor({ r: pixels.data[offset] ?? 0, g: pixels.data[offset + 1] ?? 0, b: pixels.data[offset + 2] ?? 0 })
  }

  function pick(event: MouseEvent<HTMLCanvasElement>) {
    readPixel(event.clientX, event.clientY)
  }

  function moveCursor(event: KeyboardEvent<HTMLCanvasElement>) {
    if (!cursor || !pixels) return
    const step = event.shiftKey ? 10 : 1
    let { x, y } = cursor
    if (event.key === 'ArrowLeft') x -= step
    else if (event.key === 'ArrowRight') x += step
    else if (event.key === 'ArrowUp') y -= step
    else if (event.key === 'ArrowDown') y += step
    else return
    event.preventDefault()
    x = Math.min(pixels.width - 1, Math.max(0, x))
    y = Math.min(pixels.height - 1, Math.max(0, y))
    setCursor({ x, y })
    const offset = (y * pixels.width + x) * 4
    adoptColor({ r: pixels.data[offset] ?? 0, g: pixels.data[offset + 1] ?? 0, b: pixels.data[offset + 2] ?? 0 })
  }

  function commitInput(value: string) {
    setInputText(value)
    const parsed = parseColor(value)
    if (parsed) {
      setColor(parsed)
      setInputValid(true)
    } else {
      setInputValid(false)
    }
  }

  function buildPalette() {
    if (!pixels) return
    setPaletteBusy(true)
    try {
      setPalette(paletteFromPixels(pixels.data, { count: paletteCount, step: 4 }))
    } catch {
      setError('tool.colorTools.error')
    } finally {
      setPaletteBusy(false)
    }
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
    } catch {
      setCopied('')
    }
  }

  const tableColors = distinct([color, ...palette]).slice(0, MAX_TABLE_COLORS)
  const cursorLeft = cursor && pixels ? `${(cursor.x / pixels.width) * 100}%` : '0%'
  const cursorTop = cursor && pixels ? `${(cursor.y / pixels.height) * 100}%` : '0%'

  return (
    <div className="stack">
      <section className="settings-card stack">
        <h2>{t('tool.colorTools.source')}</h2>
        <div className="metadata-layout">
          <div className="stack">
            <label className="field">
              <span>{t('tool.colorTools.chooseFile')}</span>
              <input type="file" accept={acceptAttributeFor('color-tools')} onChange={selectImage} />
            </label>
            <p className="format-list">
              <span>{t('tool.formats')}</span>
              {acceptedFormatNames.map((name) => <span className="format-chip" key={name}>{name}</span>)}
            </p>
            {fileName && (
              <dl className="results metadata-facts">
                <div>
                  <dt>{t('tool.colorTools.selected')}</dt>
                  <dd className="fact-text">{fileName}</dd>
                </div>
                {image && (
                  <div>
                    <dt>{t('tool.colorTools.originalSize')}</dt>
                    <dd className="fact-text">{`${image.naturalWidth} × ${image.naturalHeight} px`}</dd>
                  </div>
                )}
                {cursor && (
                  <div>
                    <dt>{t('tool.colorTools.picker')}</dt>
                    <dd className="fact-text">{`${cursor.x}, ${cursor.y}`}</dd>
                  </div>
                )}
              </dl>
            )}
            {error && <p className="error" role="alert">{t(error)}</p>}
            <span className="color-preview" style={{ background: toHex(color) }} aria-hidden="true" />
            <p className="privacy-note">{t('tool.colorTools.privacy')}</p>
          </div>

          {image && (
            <figure className="color-figure">
              <div className="color-stage">
                <canvas
                  className="color-canvas"
                  ref={canvasRef}
                  tabIndex={0}
                  role="img"
                  aria-label={t('tool.colorTools.picker')}
                  onClick={pick}
                  onKeyDown={moveCursor}
                />
                {cursor && <span className="color-cursor" style={{ left: cursorLeft, top: cursorTop }} aria-hidden="true" />}
              </div>
              <figcaption className="scan-note">{t('tool.colorTools.pickHint')}</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.colorTools.color')}</h2>
        <div className="form-grid">
          <label className="field">
            <span>{t('tool.colorTools.input')}</span>
            <input type="text" value={inputText} onChange={(event) => commitInput(event.target.value)} />
          </label>
          <label className="field">
            <span>{t('tool.colorTools.color')}</span>
            <input type="color" value={toHex(color)} onChange={(event) => commitInput(event.target.value)} />
          </label>
        </div>
        <p className="scan-note">{t('tool.colorTools.inputHint')}</p>
        {!inputValid && <p className="error" role="alert">{t('tool.colorTools.invalid')}</p>}

        <dl className="results metadata-facts">
          {([
            ['HEX', toHex(color)],
            ['RGB', `rgb(${color.r}, ${color.g}, ${color.b})`],
            ['HSL', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
            ['LAB', `lab(${formatNumber(lab.l)}, ${formatNumber(lab.a)}, ${formatNumber(lab.b)})`]
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className="fact-text"><button className="text-link" onClick={() => copyValue(value)}>{value}</button></dd>
            </div>
          ))}
        </dl>
        <div className="download-row">
          <span className="scan-note">{copied ? `${copied} → ${t('tool.colorTools.copied')}` : t('tool.colorTools.copy')}</span>
        </div>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.colorTools.palette')}</h2>
        <label className="field">
          <span>{`${t('tool.colorTools.paletteCount')}: ${paletteCount}`}</span>
          <input type="range" min={2} max={MAX_PALETTE_COLORS} value={paletteCount} onChange={(event) => setPaletteCount(Number(event.target.value))} />
        </label>
        <p className="scan-note">{t('tool.colorTools.paletteHint')}</p>
        <div className="download-row">
          <Button className="primary" disabled={!pixels || paletteBusy} onClick={buildPalette}>
            {paletteBusy ? t('tool.colorTools.paletteWorking') : t('tool.colorTools.paletteAction')}
          </Button>
          {!pixels && <span className="scan-note">{t('tool.colorTools.paletteEmpty')}</span>}
        </div>
        {palette.length > 0 && (
          <ul className="swatch-list">
            {palette.map((entry) => (
              <li key={toHex(entry)}>
                <button className="swatch" style={{ background: toHex(entry) }} onClick={() => adoptColor(entry)} title={t('tool.colorTools.paletteUse')} aria-label={`${toHex(entry)} – ${t('tool.colorTools.paletteUse')}`} />
                <span>{toHex(entry)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.colorTools.contrast')}</h2>
        <div className="form-grid">
          <label className="field">
            <span>{t('tool.colorTools.foreground')}</span>
            <input type="color" value={toHex(color)} onChange={(event) => commitInput(event.target.value)} />
          </label>
          <label className="field">
            <span>{t('tool.colorTools.background')}</span>
            <input type="color" value={toHex(background)} onChange={(event) => setBackground(parseColor(event.target.value) ?? background)} />
          </label>
        </div>
        <div className="download-row">
          <Button onClick={() => { setBackground(color); adoptColor(background) }}>{t('tool.colorTools.swap')}</Button>
        </div>
        <dl className="results metadata-facts">
          <div>
            <dt>{t('tool.colorTools.ratio')}</dt>
            <dd className="fact-text">{`${formatNumber(verdict.ratio, 2)} : 1`}</dd>
          </div>
        </dl>
        <ul className="verdict-list">
          {[
            ['tool.colorTools.aa', verdict.aa],
            ['tool.colorTools.aaa', verdict.aaa],
            ['tool.colorTools.large', verdict.large]
          ].map(([key, ok]) => (
            <li key={String(key)} className={ok ? 'ok' : 'bad'}>
              <span aria-hidden="true">{ok ? '✓' : '✗'}</span>
              {t(String(key))} — {ok ? t('tool.colorTools.pass') : t('tool.colorTools.fail')}
            </li>
          ))}
        </ul>
        <p className="contrast-sample" style={{ color: toHex(color), background: toHex(background) }}>{t('tool.colorTools.sampleText')}</p>
        <p className="scan-note">{t('tool.colorTools.contrastHint')}</p>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.colorTools.simulation')}</h2>
        <p className="scan-note">{t('tool.colorTools.simulationHint')}</p>
        <div className="cvd-table-wrap">
          <table className="cvd-table">
            <thead>
              <tr>
                <th scope="col">HEX</th>
                {CVD_TYPES.map((type) => <th scope="col" key={type}>{t(CVD_KEYS[type])}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableColors.map((entry) => (
                <tr key={toHex(entry)}>
                  <th scope="row">
                    <span className="swatch-inline" style={{ background: toHex(entry) }} aria-hidden="true" />
                    {toHex(entry)}
                  </th>
                  {CVD_TYPES.map((type) => {
                    const simulated = simulateCvd(entry, type)
                    return (
                      <td key={type}>
                        <span className="swatch-inline" style={{ background: toHex(simulated) }} aria-hidden="true" />
                        {toHex(simulated)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
