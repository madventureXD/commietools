import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  cableLimits,
  currentFromPower,
  kappaAssumptionFor,
  planCable,
  roundForDisplay,
  voltageDropLimitFor,
  type CableResult,
  type ConductorMaterial,
  type CurrentInputMode,
  type PhaseMode,
  type UsageKind
} from '@commietools/tools/craft/cable'

type Translate = (key: string) => string

const PHASE_MODES: readonly PhaseMode[] = ['single', 'three']
const INPUT_MODES: readonly CurrentInputMode[] = ['current', 'power']
const MATERIALS: readonly ConductorMaterial[] = ['copper', 'aluminium']
const USAGES: readonly UsageKind[] = ['lighting', 'other']

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

export function Cable({ t, locale }: { t: Translate; locale: string }) {
  const [phaseMode, setPhaseMode] = useState<PhaseMode>('single')
  const [inputMode, setInputMode] = useState<CurrentInputMode>('current')
  const [voltage, setVoltage] = useState('230')
  const [current, setCurrent] = useState('16')
  const [power, setPower] = useState('')
  const [length, setLength] = useState('30')
  const [material, setMaterial] = useState<ConductorMaterial>('copper')
  const [kappa, setKappa] = useState(String(kappaAssumptionFor('copper').kappa))
  const [usage, setUsage] = useState<UsageKind>('lighting')
  // **Die Strombelastbarkeit wird eingetragen, nicht nachgeschlagen** — das Feld startet leer,
  // damit niemand glaubt, das Werkzeug führe eine Tabelle.
  const [ampacity, setAmpacity] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<CableResult | null>(null)

  const kappaAnnahme = kappaAssumptionFor(material)

  function waehleMaterial(next: ConductorMaterial): void {
    setMaterial(next)
    setKappa(String(kappaAssumptionFor(next).kappa))
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const spannung = parseNumber(voltage)
    // Strom entweder direkt oder aus der Leistung.
    let strom = parseNumber(current)
    if (inputMode === 'power') {
      const ausLeistung = currentFromPower(parseNumber(power), spannung, phaseMode)
      if (!ausLeistung.ok) {
        setResult(null)
        setErrorKey(ausLeistung.errorKey)
        return
      }
      strom = ausLeistung.current
    }
    const check = planCable({
      phaseMode,
      voltage: spannung,
      current: strom,
      lengthMeters: parseNumber(length),
      kappa: parseNumber(kappa),
      usage,
      ampacity: parseNumber(ampacity)
    })
    if (!check.ok) {
      setResult(null)
      setErrorKey(check.errorKey)
      return
    }
    setErrorKey('')
    setResult(check.result)
  }

  const rows: Array<{ key: string; value: string; note?: string }> = result
    ? [
        {
          key: 'tool.cable.out.dropVolts',
          value: `${formatValue(result.dropVolts, locale, 3)} V`,
          note: `${formatValue(result.dropCrossSection, locale, 1)} mm²`
        },
        { key: 'tool.cable.out.dropPercent', value: `${formatValue(result.dropPercent, locale, 3)} %` },
        { key: 'tool.cable.out.requiredSection', value: `${formatValue(result.requiredCrossSection, locale, 3)} mm²` },
        {
          key: 'tool.cable.out.chosenSection',
          value: result.chosenCrossSection === null ? '—' : `${formatValue(result.chosenCrossSection, locale, 1)} mm²`
        },
        { key: 'tool.cable.out.utilisation', value: `${formatValue(result.utilisationPercent, locale, 1)} %` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cable-phase">{t('tool.cable.phaseMode')}</label>
            <select id="cable-phase" value={phaseMode} onChange={(event) => { setPhaseMode(event.target.value as PhaseMode); setResult(null); setErrorKey('') }}>
              {PHASE_MODES.map((mode) => (
                <option key={mode} value={mode}>{t(`tool.cable.phaseMode.${mode}`)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="cable-voltage">{t('tool.cable.voltage')} (V)</label>
            <input id="cable-voltage" type="text" inputMode="decimal" autoComplete="off" min={cableLimits.voltage.min} max={cableLimits.voltage.max} value={voltage} onChange={(event) => setVoltage(event.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="cable-input-mode">{t('tool.cable.inputMode')}</label>
            <select id="cable-input-mode" value={inputMode} onChange={(event) => { setInputMode(event.target.value as CurrentInputMode); setResult(null); setErrorKey('') }}>
              {INPUT_MODES.map((mode) => (
                <option key={mode} value={mode}>{t(`tool.cable.inputMode.${mode}`)}</option>
              ))}
            </select>
          </div>

          {inputMode === 'current' ? (
            <div className="field">
              <label htmlFor="cable-current">{t('tool.cable.current')} (A)</label>
              <input id="cable-current" type="text" inputMode="decimal" autoComplete="off" min={cableLimits.current.min} max={cableLimits.current.max} value={current} onChange={(event) => setCurrent(event.target.value)} />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="cable-power">{t('tool.cable.power')} (W)</label>
              <input id="cable-power" type="text" inputMode="decimal" autoComplete="off" min={cableLimits.power.min} max={cableLimits.power.max} value={power} onChange={(event) => setPower(event.target.value)} />
            </div>
          )}

          <div className="field">
            <label htmlFor="cable-length">{t('tool.cable.length')} (m)</label>
            <input id="cable-length" type="text" inputMode="decimal" autoComplete="off" min={cableLimits.length.min} max={cableLimits.length.max} value={length} onChange={(event) => setLength(event.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="cable-material">{t('tool.cable.material')}</label>
            <select id="cable-material" value={material} onChange={(event) => waehleMaterial(event.target.value as ConductorMaterial)}>
              {MATERIALS.map((wert) => (
                <option key={wert} value={wert}>{t(`tool.cable.material.${wert}`)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="cable-usage">{t('tool.cable.usage')}</label>
            <select id="cable-usage" value={usage} onChange={(event) => { setUsage(event.target.value as UsageKind); setResult(null); setErrorKey('') }}>
              {USAGES.map((wert) => (
                <option key={wert} value={wert}>{t(`tool.cable.usage.${wert}`)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="cable-ampacity">{t('tool.cable.ampacity')} (A)</label>
            <input id="cable-ampacity" type="text" inputMode="decimal" autoComplete="off" min={cableLimits.ampacity.min} max={cableLimits.ampacity.max} value={ampacity} onChange={(event) => setAmpacity(event.target.value)} aria-describedby="cable-ampacity-hint" />
          </div>
        </div>

        {/* Der Hinweis zur Strombelastbarkeit muss **sichtbar** beim Feld stehen. */}
        <p id="cable-ampacity-hint" className="scan-note">{t('tool.cable.ampacityHint')}</p>

        <details className="settings-card" open>
          <summary>{t('tool.cable.settings')}</summary>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="cable-kappa">{t('tool.cable.kappa')}</label>
              <input id="cable-kappa" type="text" inputMode="decimal" autoComplete="off" min={cableLimits.kappa.min} max={cableLimits.kappa.max} value={kappa} onChange={(event) => { setKappa(event.target.value); setResult(null); setErrorKey('') }} aria-describedby="cable-kappa-hint" />
            </div>
          </div>
          <p id="cable-kappa-hint" className="scan-note">{t(kappaAnnahme.sourceKey)}</p>
          <p className="scan-note">{t('tool.cable.kappaSpread')}</p>
          <button type="button" className="text-link" onClick={() => setKappa(String(kappaAnnahme.kappa))}>{t('tool.cable.resetKappa')}</button>
          <p className="scan-note">{`${t('tool.cable.limit')}: ${formatValue(voltageDropLimitFor(usage).percent, locale, 1)} %`}</p>
          <p className="scan-note">{t('tool.cable.limitSource')}</p>
        </details>

        <button type="submit">{t('tool.cable.action')}</button>

        {/* Der Vorplanungs-Hinweis steht sichtbar neben der Aktion, nicht versteckt. */}
        <p className="privacy-note" role="note">{t('tool.cable.disclaimer')}</p>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.cable.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {result && !errorKey && (
        <div className="settings-card stack">
          <h2>{t('tool.cable.result')}</h2>
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
                    <th scope="row">
                      {t(row.key)}: {row.value}
                      {row.note ? <><br /><span className="scan-note">{row.note}</span></> : null}
                    </th>
                    <td><code>{result.formulas[index] ?? ''}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t(result.withinLimit ? 'tool.cable.withinLimit' : 'tool.cable.overLimit')}</p>
          <p className={result.ampacityWithin ? 'scan-note' : 'error'} role={result.ampacityWithin ? undefined : 'alert'}>
            {t(result.ampacityWithin ? 'tool.cable.ampacityOk' : 'tool.cable.ampacityOver')}
          </p>
          {result.beyondSeries && <p className="scan-note">{t('tool.cable.beyondSeries')}</p>}
          <p className="scan-note">{t('tool.cable.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.cable.formula')}</summary>
        <p className="scan-note">{t('tool.cable.assumptions')}</p>
        <p className="scan-note">{t('tool.cable.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.cable.ampacityHint')}</p>
      <LocalBadge />
    </div>
  )
}
