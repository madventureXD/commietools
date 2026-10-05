import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  TIRE_DEFAULTS,
  planTires,
  roundForDisplay,
  type TireResult
} from '@commietools/tools/craft/tires'

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

interface Row {
  readonly key: string
  readonly value: string
  /** Verweise auf die Rechenweg-Zeilen, die zu diesem Wert gehören. */
  readonly formulaIndexes: readonly number[]
}

export function Tires({ t, locale }: { t: Translate; locale: string }) {
  const [size, setSize] = useState({
    width: preset(TIRE_DEFAULTS.widthMm.value),
    profile: preset(TIRE_DEFAULTS.profilePercent.value),
    rim: preset(TIRE_DEFAULTS.rimInch.value),
    speed: preset(TIRE_DEFAULTS.speedKmh.value)
  })
  const [reference, setReference] = useState({
    width: preset(TIRE_DEFAULTS.referenceWidthMm.value),
    profile: preset(TIRE_DEFAULTS.referenceProfilePercent.value),
    rim: preset(TIRE_DEFAULTS.referenceRimInch.value)
  })
  const [torque, setTorque] = useState({
    value: preset(TIRE_DEFAULTS.torqueNm.value),
    tolerance: preset(TIRE_DEFAULTS.tolerancePercent.value)
  })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<TireResult | null>(null)

  function resetDefaults() {
    setSize({
      width: preset(TIRE_DEFAULTS.widthMm.value),
      profile: preset(TIRE_DEFAULTS.profilePercent.value),
      rim: preset(TIRE_DEFAULTS.rimInch.value),
      speed: preset(TIRE_DEFAULTS.speedKmh.value)
    })
    setReference({
      width: preset(TIRE_DEFAULTS.referenceWidthMm.value),
      profile: preset(TIRE_DEFAULTS.referenceProfilePercent.value),
      rim: preset(TIRE_DEFAULTS.referenceRimInch.value)
    })
    setTorque({
      value: preset(TIRE_DEFAULTS.torqueNm.value),
      tolerance: preset(TIRE_DEFAULTS.tolerancePercent.value)
    })
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planTires({
      widthMm: parseNumber(size.width),
      profilePercent: parseNumber(size.profile),
      rimInch: parseNumber(size.rim),
      referenceWidthMm: parseNumber(reference.width),
      referenceProfilePercent: parseNumber(reference.profile),
      referenceRimInch: parseNumber(reference.rim),
      speedKmh: parseNumber(size.speed),
      torqueNm: parseNumber(torque.value),
      tolerancePercent: parseNumber(torque.tolerance)
    })
    if (!check.ok) {
      setResult(null)
      setErrorKey(check.errorKey)
      return
    }
    setErrorKey('')
    setResult(check.result)
  }

  const rows: Row[] = result
    ? [
        { key: 'tool.tires.out.sidewall', value: `${formatValue(result.sidewallMm, locale, 2)} mm`, formulaIndexes: [0] },
        { key: 'tool.tires.out.diameter', value: `${formatValue(result.diameterMm, locale, 2)} mm`, formulaIndexes: [1] },
        { key: 'tool.tires.out.circumference', value: `${formatValue(result.circumferenceM, locale, 4)} m`, formulaIndexes: [2] },
        { key: 'tool.tires.out.revolutions', value: formatValue(result.revolutionsPerKm, locale, 2), formulaIndexes: [3] },
        { key: 'tool.tires.out.wheelRpm', value: `${formatValue(result.wheelRpm, locale, 1)} U/min`, formulaIndexes: [4] },
        { key: 'tool.tires.out.referenceCircumference', value: `${formatValue(result.referenceCircumferenceM, locale, 4)} m`, formulaIndexes: [5] },
        { key: 'tool.tires.out.deviation', value: `${formatValue(result.circumferenceDeviationPercent, locale, 3)} %`, formulaIndexes: [6] },
        { key: 'tool.tires.out.trueSpeed', value: `${formatValue(result.trueSpeedKmh, locale, 2)} km/h`, formulaIndexes: [7] },
        { key: 'tool.tires.out.torqueFtLb', value: `${formatValue(result.torqueFtLb, locale, 2)} ft·lb`, formulaIndexes: [8] },
        { key: 'tool.tires.out.torqueKgfM', value: `${formatValue(result.torqueKgfM, locale, 2)} kgf·m`, formulaIndexes: [9] },
        {
          key: 'tool.tires.out.torqueRange',
          value: `${formatValue(result.torqueMinNm, locale, 1)} Nm bis ${formatValue(result.torqueMaxNm, locale, 1)} Nm`,
          formulaIndexes: [10, 11]
        }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="tires-width">{t('tool.tires.width')}</label>
            <input id="tires-width" type="text" inputMode="decimal" autoComplete="off" value={size.width} onChange={(event) => setSize({ ...size, width: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="tires-profile">{t('tool.tires.profile')}</label>
            <input id="tires-profile" type="text" inputMode="decimal" autoComplete="off" value={size.profile} onChange={(event) => setSize({ ...size, profile: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="tires-rim">{t('tool.tires.rim')}</label>
            <input id="tires-rim" type="text" inputMode="decimal" autoComplete="off" value={size.rim} onChange={(event) => setSize({ ...size, rim: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="tires-speed">{t('tool.tires.speed')}</label>
            <input id="tires-speed" type="text" inputMode="decimal" autoComplete="off" value={size.speed} onChange={(event) => setSize({ ...size, speed: event.target.value })} />
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.tires.reference')}</summary>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tires-ref-width">{t('tool.tires.referenceWidth')}</label>
              <input id="tires-ref-width" type="text" inputMode="decimal" autoComplete="off" value={reference.width} onChange={(event) => setReference({ ...reference, width: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tires-ref-profile">{t('tool.tires.referenceProfile')}</label>
              <input id="tires-ref-profile" type="text" inputMode="decimal" autoComplete="off" value={reference.profile} onChange={(event) => setReference({ ...reference, profile: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tires-ref-rim">{t('tool.tires.referenceRim')}</label>
              <input id="tires-ref-rim" type="text" inputMode="decimal" autoComplete="off" value={reference.rim} onChange={(event) => setReference({ ...reference, rim: event.target.value })} />
            </div>
          </div>
        </details>

        <details className="settings-card" open>
          <summary>{t('tool.tires.torqueSection')}</summary>
          <p className="scan-note">{t(`tool.craft.valueSource.${TIRE_DEFAULTS.torqueNm.source}`)}</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tires-torque">{t('tool.tires.torque')}</label>
              <input id="tires-torque" type="text" inputMode="decimal" autoComplete="off" value={torque.value} onChange={(event) => setTorque({ ...torque, value: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tires-tolerance">{t('tool.tires.tolerance')}</label>
              <input id="tires-tolerance" type="text" inputMode="decimal" autoComplete="off" value={torque.tolerance} onChange={(event) => setTorque({ ...torque, tolerance: event.target.value })} />
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
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{t(row.key)}: {row.value}</th>
                    <td>
                      {row.formulaIndexes.map((index) => (
                        <code key={index}>{result.formulas[index] ?? ''}</code>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.tires.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h3>{t('tool.craft.assumptions')}</h3>
        <p className="scan-note">{t('tool.tires.assumptions')}</p>
        <p className="scan-note">{t('tool.tires.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.tires.summary')}</p>
      <LocalBadge />
    </div>
  )
}
