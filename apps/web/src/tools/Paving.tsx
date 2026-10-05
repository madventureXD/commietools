import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  PAVING_DEFAULTS,
  planPaving,
  roundForDisplay,
  stonesPerSquareMeter,
  type PavingResult
} from '@commietools/tools/craft/paving'

type Translate = (key: string) => string

/** Zwölf gültige Stellen, in der Sprache des Nutzers geschrieben. */
function formatValue(value: number, locale: string, digits = 12): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(roundForDisplay(value))
}

/** Liest eine Zahl aus einem Textfeld: Komma oder Punkt als Dezimaltrennzeichen. */
function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

/** Vorgabewert als Textfeld, in deutscher Schreibweise mit Komma. */
function preset(value: number): string {
  return String(value).replace('.', ',')
}

export function Paving({ t, locale }: { t: Translate; locale: string }) {
  const [area, setArea] = useState({
    length: preset(PAVING_DEFAULTS.lengthM),
    breadth: preset(PAVING_DEFAULTS.breadthM),
    stoneLength: preset(PAVING_DEFAULTS.stoneLengthCm.value),
    stoneBreadth: preset(PAVING_DEFAULTS.stoneBreadthCm.value),
    stoneThickness: preset(PAVING_DEFAULTS.stoneThicknessCm.value),
    joint: preset(PAVING_DEFAULTS.jointMm.value),
    surcharge: preset(PAVING_DEFAULTS.surchargePercent.value),
    slope: preset(PAVING_DEFAULTS.slopePercent.value)
  })
  const [setup, setSetup] = useState({
    bedThickness: preset(PAVING_DEFAULTS.bedThicknessCm.value),
    bedDensity: preset(PAVING_DEFAULTS.bedDensity.value),
    jointDepth: preset(PAVING_DEFAULTS.jointFillDepthCm.value),
    jointDensity: preset(PAVING_DEFAULTS.jointDensity.value),
    baseCourse: preset(PAVING_DEFAULTS.baseCourseCm.value),
    bulkFactor: preset(PAVING_DEFAULTS.bulkFactor.value),
    stonesPerPallet: preset(PAVING_DEFAULTS.stonesPerPallet.value)
  })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<PavingResult | null>(null)

  function resetDefaults() {
    setSetup((current) => ({
      ...current,
      bedThickness: preset(PAVING_DEFAULTS.bedThicknessCm.value),
      bedDensity: preset(PAVING_DEFAULTS.bedDensity.value),
      jointDepth: preset(PAVING_DEFAULTS.jointFillDepthCm.value),
      jointDensity: preset(PAVING_DEFAULTS.jointDensity.value),
      baseCourse: preset(PAVING_DEFAULTS.baseCourseCm.value),
      bulkFactor: preset(PAVING_DEFAULTS.bulkFactor.value),
      stonesPerPallet: preset(PAVING_DEFAULTS.stonesPerPallet.value)
    }))
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planPaving({
      lengthM: parseNumber(area.length),
      breadthM: parseNumber(area.breadth),
      stoneLengthCm: parseNumber(area.stoneLength),
      stoneBreadthCm: parseNumber(area.stoneBreadth),
      stoneThicknessCm: parseNumber(area.stoneThickness),
      jointMm: parseNumber(area.joint),
      surchargePercent: parseNumber(area.surcharge),
      slopePercent: parseNumber(area.slope),
      bedThicknessCm: parseNumber(setup.bedThickness),
      bedDensity: parseNumber(setup.bedDensity),
      jointFillDepthCm: parseNumber(setup.jointDepth),
      jointDensity: parseNumber(setup.jointDensity),
      baseCourseCm: parseNumber(setup.baseCourse),
      bulkFactor: parseNumber(setup.bulkFactor),
      stonesPerPallet: parseNumber(setup.stonesPerPallet)
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
        { key: 'tool.paving.out.area', value: `${formatValue(result.areaM2, locale, 3)} m²` },
        { key: 'tool.paving.out.slope', value: `${formatValue(result.slopeDropM, locale, 3)} m` },
        { key: 'tool.paving.out.perSquareMeter', value: formatValue(result.stonesPerSquareMeter, locale, 2) },
        { key: 'tool.paving.out.stones', value: `${result.stones}` },
        { key: 'tool.paving.out.pallets', value: `${result.pallets}` },
        { key: 'tool.paving.out.bedVolume', value: `${formatValue(result.bedVolumeM3, locale, 3)} m³` },
        { key: 'tool.paving.out.bedTons', value: `${formatValue(result.bedTons, locale, 3)} t` },
        { key: 'tool.paving.out.jointMaterial', value: `${formatValue(result.jointMaterialKg, locale, 1)} kg` },
        { key: 'tool.paving.out.digDepth', value: `${formatValue(result.digDepthM, locale, 3)} m` },
        { key: 'tool.paving.out.digVolume', value: `${formatValue(result.digVolumeM3, locale, 3)} m³` },
        { key: 'tool.paving.out.digBulk', value: `${formatValue(result.digBulkVolumeM3, locale, 3)} m³` }
      ]
    : []

  const context = `${t('tool.paving.out.perSquareMeter')}: ${formatValue(
    stonesPerSquareMeter(parseNumber(area.stoneLength), parseNumber(area.stoneBreadth), parseNumber(area.joint)),
    locale,
    2
  )}`

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="paving-length">{t('tool.paving.length')}</label>
            <input id="paving-length" type="text" inputMode="decimal" autoComplete="off" value={area.length} onChange={(event) => setArea({ ...area, length: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="paving-breadth">{t('tool.paving.breadth')}</label>
            <input id="paving-breadth" type="text" inputMode="decimal" autoComplete="off" value={area.breadth} onChange={(event) => setArea({ ...area, breadth: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="paving-slope">{t('tool.paving.slope')}</label>
            <input id="paving-slope" type="text" inputMode="decimal" autoComplete="off" value={area.slope} onChange={(event) => setArea({ ...area, slope: event.target.value })} />
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.paving.settings')} — <code>{context}</code></summary>
          <p className="scan-note">{t(`tool.craft.valueSource.${PAVING_DEFAULTS.stoneLengthCm.source}`)}</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="paving-stone-length">{t('tool.paving.stoneLength')}</label>
              <input id="paving-stone-length" type="text" inputMode="decimal" autoComplete="off" value={area.stoneLength} onChange={(event) => setArea({ ...area, stoneLength: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-stone-breadth">{t('tool.paving.stoneBreadth')}</label>
              <input id="paving-stone-breadth" type="text" inputMode="decimal" autoComplete="off" value={area.stoneBreadth} onChange={(event) => setArea({ ...area, stoneBreadth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-stone-thickness">{t('tool.paving.stoneThickness')}</label>
              <input id="paving-stone-thickness" type="text" inputMode="decimal" autoComplete="off" value={area.stoneThickness} onChange={(event) => setArea({ ...area, stoneThickness: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-joint">{t('tool.paving.joint')}</label>
              <input id="paving-joint" type="text" inputMode="decimal" autoComplete="off" value={area.joint} onChange={(event) => setArea({ ...area, joint: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-surcharge">{t('tool.paving.surcharge')}</label>
              <input id="paving-surcharge" type="text" inputMode="decimal" autoComplete="off" value={area.surcharge} onChange={(event) => setArea({ ...area, surcharge: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-pallet">{t('tool.paving.stonesPerPallet')}</label>
              <input id="paving-pallet" type="text" inputMode="decimal" autoComplete="off" value={setup.stonesPerPallet} onChange={(event) => setSetup({ ...setup, stonesPerPallet: event.target.value })} />
            </div>
          </div>
        </details>

        <details className="settings-card" open>
          <summary>{t('tool.paving.out.digDepth')}</summary>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="paving-bed">{t('tool.paving.bedThickness')}</label>
              <input id="paving-bed" type="text" inputMode="decimal" autoComplete="off" value={setup.bedThickness} onChange={(event) => setSetup({ ...setup, bedThickness: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-bed-density">{t('tool.paving.bedDensity')}</label>
              <input id="paving-bed-density" type="text" inputMode="decimal" autoComplete="off" value={setup.bedDensity} onChange={(event) => setSetup({ ...setup, bedDensity: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-joint-depth">{t('tool.paving.jointDepth')}</label>
              <input id="paving-joint-depth" type="text" inputMode="decimal" autoComplete="off" value={setup.jointDepth} onChange={(event) => setSetup({ ...setup, jointDepth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-joint-density">{t('tool.paving.jointDensity')}</label>
              <input id="paving-joint-density" type="text" inputMode="decimal" autoComplete="off" value={setup.jointDensity} onChange={(event) => setSetup({ ...setup, jointDensity: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-base-course">{t('tool.paving.baseCourse')}</label>
              <input id="paving-base-course" type="text" inputMode="decimal" autoComplete="off" value={setup.baseCourse} onChange={(event) => setSetup({ ...setup, baseCourse: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paving-bulk">{t('tool.paving.bulkFactor')}</label>
              <input id="paving-bulk" type="text" inputMode="decimal" autoComplete="off" value={setup.bulkFactor} onChange={(event) => setSetup({ ...setup, bulkFactor: event.target.value })} />
            </div>
          </div>
          <button type="button" className="text-link" onClick={resetDefaults}>{t('tool.craft.reset')}</button>
        </details>

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
          <p className="scan-note">{t('tool.paving.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h3>{t('tool.craft.assumptions')}</h3>
        <p className="scan-note">{t('tool.paving.assumptions')}</p>
        <p className="scan-note">{t('tool.paving.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.paving.summary')}</p>
      <LocalBadge />
    </div>
  )
}
