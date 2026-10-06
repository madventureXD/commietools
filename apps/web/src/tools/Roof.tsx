import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  pitchDegFromPercent,
  pitchDegFromRatio,
  pitchPercentFromDeg,
  planRoof,
  ROOF_LIMITS,
  type RoofResult,
  type RoofShape
} from '@commietools/tools/craft/roof'

type Translate = (key: string) => string

const SHAPES: readonly RoofShape[] = ['pent', 'gable', 'hip']
type PitchUnit = 'deg' | 'percent' | 'ratio'
const PITCH_UNITS: readonly PitchUnit[] = ['deg', 'percent', 'ratio']

function formatValue(value: number, locale: string, digits = 12): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)
}

function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

export function Roof({ t, locale }: { t: Translate; locale: string }) {
  const [shape, setShape] = useState<RoofShape>('gable')
  const [pitchUnit, setPitchUnit] = useState<PitchUnit>('deg')
  const [pitch, setPitch] = useState('35')
  const [rise, setRise] = useState('1')
  const [run, setRun] = useState('4')
  const [sizes, setSizes] = useState({ length: '12', width: '9', overhang: '0,5' })
  const [settings, setSettings] = useState({ waste: '10', spacing: '0,8', covering: '10' })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<RoofResult | null>(null)

  /** Neigung in Grad aus der gewählten Eingabeart. */
  function pitchInDegrees(): number {
    if (pitchUnit === 'percent') return pitchDegFromPercent(parseNumber(pitch))
    if (pitchUnit === 'ratio') return pitchDegFromRatio(parseNumber(rise), parseNumber(run))
    return parseNumber(pitch)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planRoof({
      shape,
      lengthM: parseNumber(sizes.length),
      widthM: parseNumber(sizes.width),
      pitchDeg: pitchInDegrees(),
      overhangM: parseNumber(sizes.overhang),
      wastePercent: parseNumber(settings.waste),
      spanSpacingM: parseNumber(settings.spacing),
      coveringPerSqm: parseNumber(settings.covering)
    })
    if (!check.ok) {
      setResult(null)
      setErrorKey(check.errorKey)
      return
    }
    setErrorKey('')
    setResult(check.result)
  }

  const rows: Array<{ key: string; value: string }> = result
    ? [
        { key: 'tool.roof.out.pitchDeg', value: `${formatValue(result.pitchDegreesUsed ?? 0, locale, 2)}°` },
        { key: 'tool.roof.out.pitchPercent', value: `${formatValue(pitchPercentFromDeg(result.pitchDegreesUsed ?? 0), locale, 1)} %` },
        { key: 'tool.roof.out.factor', value: formatValue(result.pitchFactor, locale, 4) },
        { key: 'tool.roof.out.footprint', value: `${formatValue(result.footprintAreaM2, locale, 2)} m²` },
        { key: 'tool.roof.out.roofArea', value: `${formatValue(result.roofAreaM2, locale, 2)} m²` },
        { key: 'tool.roof.out.roofAreaWaste', value: `${formatValue(result.roofAreaWithWasteM2, locale, 2)} m²` },
        { key: 'tool.roof.out.firstHeight', value: `${formatValue(result.firstHeightM, locale, 3)} m` },
        { key: 'tool.roof.out.rafterLength', value: `${formatValue(result.rafterLengthM, locale, 3)} m` },
        { key: 'tool.roof.out.rafterCount', value: String(result.rafterCount) },
        { key: 'tool.roof.out.ridgeLength', value: `${formatValue(result.ridgeLengthM, locale, 3)} m` },
        { key: 'tool.roof.out.covering', value: `${result.coveringPieces} ${t('tool.roof.out.covering')}` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="roof-shape">{t('tool.roof.shape')}</label>
            <select id="roof-shape" value={shape} onChange={(event) => { setShape(event.target.value as RoofShape); setResult(null); setErrorKey('') }}>
              {SHAPES.map((item) => (
                <option key={item} value={item}>{t(`tool.roof.shape.${item}`)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="roof-pitch-unit">{t('tool.roof.pitchUnit')}</label>
            <select id="roof-pitch-unit" value={pitchUnit} onChange={(event) => { setPitchUnit(event.target.value as PitchUnit); setResult(null); setErrorKey('') }}>
              {PITCH_UNITS.map((item) => (
                <option key={item} value={item}>{t(`tool.roof.pitchUnit.${item}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          {pitchUnit === 'ratio' ? (
            <>
              <div className="field">
                <label htmlFor="roof-rise">{t('tool.roof.rise')}</label>
                <input id="roof-rise" type="text" inputMode="decimal" autoComplete="off" value={rise} onChange={(event) => setRise(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="roof-run">{t('tool.roof.run')}</label>
                <input id="roof-run" type="text" inputMode="decimal" autoComplete="off" value={run} onChange={(event) => setRun(event.target.value)} />
              </div>
            </>
          ) : (
            <div className="field">
              <label htmlFor="roof-pitch">
                {t('tool.roof.pitch')}{pitchUnit === 'deg' ? ' (°)' : ' (%)'}
              </label>
              <input id="roof-pitch" type="text" inputMode="decimal" autoComplete="off" value={pitch} onChange={(event) => setPitch(event.target.value)} />
            </div>
          )}
          <div className="field">
            <label htmlFor="roof-overhang">{t('tool.roof.overhang')}</label>
            <input id="roof-overhang" type="text" inputMode="decimal" autoComplete="off" value={sizes.overhang} onChange={(event) => setSizes({ ...sizes, overhang: event.target.value })} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="roof-length">{t('tool.roof.length')}</label>
            <input id="roof-length" type="text" inputMode="decimal" autoComplete="off" value={sizes.length} onChange={(event) => setSizes({ ...sizes, length: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="roof-width">{t('tool.roof.width')}</label>
            <input id="roof-width" type="text" inputMode="decimal" autoComplete="off" value={sizes.width} onChange={(event) => setSizes({ ...sizes, width: event.target.value })} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="roof-waste">{t('tool.roof.waste')}</label>
            <input id="roof-waste" type="text" inputMode="decimal" autoComplete="off" min={ROOF_LIMITS.wastePercent.min} max={ROOF_LIMITS.wastePercent.max} value={settings.waste} onChange={(event) => setSettings({ ...settings, waste: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="roof-spacing">{t('tool.roof.spacing')}</label>
            <input id="roof-spacing" type="text" inputMode="decimal" autoComplete="off" value={settings.spacing} onChange={(event) => setSettings({ ...settings, spacing: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="roof-covering">{t('tool.roof.covering')}</label>
            <input id="roof-covering" type="text" inputMode="decimal" autoComplete="off" value={settings.covering} onChange={(event) => setSettings({ ...settings, covering: event.target.value })} />
          </div>
        </div>

        <button type="submit">{t('tool.craft.calculate')}</button>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.craft.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {result && !errorKey && (
        <div className="settings-card stack">
          <h2>{t('tool.craft.result')}</h2>
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool.craft.values')}</th>
                  <th scope="col">{t('tool.craft.formula')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.key}>
                    <th scope="row">{t(row.key)}: {row.value}</th>
                    <td><code>{result.formulas[index] ?? ''}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.roof.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.roof.assumptions')}</p>
        <p className="scan-note">{t('tool.roof.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.roof.summary')}</p>
      <LocalBadge />
    </div>
  )
}
