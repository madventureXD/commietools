import { useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { anzeigeKontext } from './formatContext'
import {
  RECOMMENDED_PRESSURE_GRADIENT,
  RECOMMENDED_VELOCITY,
  SPECIFIC_HEAT_SOURCE,
  WATER_SOURCE,
  defaultRoughnessId,
  defaultSpecificHeat,
  innerDiameterMm,
  pipeMaterials,
  pipeSizesFor,
  planPipes,
  roughnessById,
  roughnessFor,
  roundForDisplay,
  type PipeMaterial,
  type PipesResult
} from '@commietools/tools/craft/pipes'

type Translate = (key: string) => string

interface PipesProps {
  readonly t: Translate
  readonly locale: string
}

/** Zwölf gültige Stellen, in der Sprache des Nutzers geschrieben. */
function formatValue(value: number, locale: string, digits = 12): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(anzeigeKontext(locale).regionLocale, { maximumFractionDigits: digits }).format(roundForDisplay(value))
}

/** Liest eine Zahl aus einem Textfeld: Komma oder Punkt als Dezimaltrennzeichen. */
function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

export function Pipes({ t, locale }: PipesProps) {
  const [power, setPower] = useState('10')
  const [spread, setSpread] = useState('10')
  const [temperature, setTemperature] = useState('40')
  const [material, setMaterial] = useState<PipeMaterial>('copper')
  const sizes = useMemo(() => pipeSizesFor(material), [material])
  const [sizeId, setSizeId] = useState(sizes[0]?.id ?? '')
  const [wall, setWall] = useState(sizes[0] ? String(sizes[0].wallMm) : '')
  const [roughnessId, setRoughnessId] = useState(defaultRoughnessId('copper'))
  const [specificHeat, setSpecificHeat] = useState(String(defaultSpecificHeat))
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<PipesResult | null>(null)

  const size = sizes.find((entry) => entry.id === sizeId) ?? pipeSizesFor(material)[0]
  const roughness = roughnessById(roughnessId)
  const outerMm = size?.outerMm ?? Number.NaN
  const wallMm = parseNumber(wall)
  const innerMm = innerDiameterMm(outerMm, wallMm)
  const roughnessOptions = roughnessFor(material)

  /** Wechselt die Rohrart: erste Nennweite, deren Wanddicke und die Vorgabe-Rauigkeit übernehmen. */
  function applyMaterial(next: PipeMaterial) {
    const erste = pipeSizesFor(next)[0]
    setMaterial(next)
    if (erste) {
      setSizeId(erste.id)
      setWall(String(erste.wallMm))
    }
    setRoughnessId(defaultRoughnessId(next))
    setResult(null)
    setErrorKey('')
  }

  /** Übernimmt die Wanddicke einer gewählten Nennweite; sie bleibt danach änderbar. */
  function applySize(id: string) {
    const gewaehlt = pipeSizesFor(material).find((entry) => entry.id === id)
    setSizeId(id)
    if (gewaehlt) setWall(String(gewaehlt.wallMm))
    setResult(null)
    setErrorKey('')
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const check = planPipes({
      powerKw: parseNumber(power),
      spreadK: parseNumber(spread),
      temperatureC: parseNumber(temperature),
      material,
      outerMm,
      wallMm,
      roughnessMm: roughness ? roughness.kMm : Number.NaN,
      specificHeat: parseNumber(specificHeat)
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
        { key: 'tool.pipes.out.inner', value: `${formatValue(result.innerMm, locale, 3)} mm` },
        { key: 'tool.pipes.out.density', value: `${formatValue(result.densityKgM3, locale, 2)} kg/m³` },
        { key: 'tool.pipes.out.viscosity', value: `${formatValue(result.viscosityM2S, locale, 9)} m²/s` },
        { key: 'tool.pipes.out.massFlow', value: `${formatValue(result.massFlowKgS, locale, 5)} kg/s` },
        { key: 'tool.pipes.out.volumeFlow', value: `${formatValue(result.volumeFlowM3H, locale, 4)} m³/h` },
        { key: 'tool.pipes.out.area', value: `${formatValue(result.areaM2, locale, 9)} m²` },
        { key: 'tool.pipes.out.velocity', value: `${formatValue(result.velocityMs, locale, 4)} m/s`, note: t('tool.pipes.velocityBand') },
        { key: 'tool.pipes.out.reynolds', value: formatValue(result.reynolds, locale, 1) },
        { key: 'tool.pipes.out.regime', value: t(`tool.pipes.regime.${result.regime}`) },
        { key: 'tool.pipes.out.lambda', value: formatValue(result.frictionFactor, locale, 6) },
        { key: 'tool.pipes.out.gradient', value: `${formatValue(result.pressureGradientPaPerM, locale, 3)} Pa/m`, note: `${t('tool.pipes.velocityBand').split(':')[0]}: ${RECOMMENDED_PRESSURE_GRADIENT.minPaPerM} – ${RECOMMENDED_PRESSURE_GRADIENT.maxPaPerM} Pa/m` }
      ]
    : []

  const velocityHint = result
    ? result.velocityStatus === 'above'
      ? 'tool.pipes.velocity.above'
      : result.velocityStatus === 'below'
        ? 'tool.pipes.velocity.below'
        : 'tool.pipes.velocity.within'
    : ''

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <h2>{t('tool.pipes.input')}</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="pipes-power">{t('tool.pipes.power')}</label>
            <input id="pipes-power" type="text" inputMode="decimal" autoComplete="off" value={power} onChange={(event) => setPower(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pipes-spread">{t('tool.pipes.spread')}</label>
            <input id="pipes-spread" type="text" inputMode="decimal" autoComplete="off" value={spread} onChange={(event) => setSpread(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pipes-temperature">{t('tool.pipes.temperature')}</label>
            <input id="pipes-temperature" type="text" inputMode="decimal" autoComplete="off" value={temperature} onChange={(event) => setTemperature(event.target.value)} />
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.pipes.settings')}</summary>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="pipes-material">{t('tool.pipes.material')}</label>
              <select id="pipes-material" value={material} onChange={(event) => applyMaterial(event.target.value as PipeMaterial)}>
                {pipeMaterials.map((entry) => (
                  <option key={entry.id} value={entry.id}>{t(entry.titleKey)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pipes-size">{t('tool.pipes.size')}</label>
              <select id="pipes-size" value={sizeId} onChange={(event) => applySize(event.target.value)}>
                {sizes.map((entry) => (
                  <option key={entry.id} value={entry.id}>{`${entry.label} mm — ID ${formatValue(innerDiameterMm(entry.outerMm, entry.wallMm), locale, 2)} mm`}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pipes-outer">{t('tool.pipes.outer')}</label>
              <input id="pipes-outer" type="text" inputMode="decimal" autoComplete="off" value={Number.isFinite(outerMm) ? String(outerMm) : ''} readOnly />
            </div>
            <div className="field">
              <label htmlFor="pipes-wall">{t('tool.pipes.wall')}</label>
              <input id="pipes-wall" type="text" inputMode="decimal" autoComplete="off" value={wall} onChange={(event) => { setWall(event.target.value); setResult(null); setErrorKey('') }} />
            </div>
            <div className="field">
              <label htmlFor="pipes-inner">{t('tool.pipes.inner')}</label>
              <input id="pipes-inner" type="text" inputMode="decimal" autoComplete="off" value={Number.isFinite(innerMm) ? formatValue(innerMm, locale, 3) : ''} readOnly />
            </div>
            <div className="field">
              <label htmlFor="pipes-roughness">{t('tool.pipes.roughness')}</label>
              <select id="pipes-roughness" value={roughnessId} onChange={(event) => { setRoughnessId(event.target.value); setResult(null); setErrorKey('') }}>
                {roughnessOptions.map((entry) => (
                  <option key={entry.id} value={entry.id}>{`${t(entry.titleKey)} — k ${entry.kMm} mm`}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pipes-heat">{t('tool.pipes.specificHeat')}</label>
              <input id="pipes-heat" type="text" inputMode="decimal" autoComplete="off" value={specificHeat} onChange={(event) => { setSpecificHeat(event.target.value); setResult(null); setErrorKey('') }} />
            </div>
          </div>
          <p className="scan-note">{t('tool.pipes.wallNote')}</p>
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
          {velocityHint && <p className="scan-note" role="status">{t(velocityHint)}</p>}
          {result.proposal && (
            <p className="scan-note">
              {t('tool.pipes.out.proposal')}: <strong>{`${result.proposal.label} mm — ID ${formatValue(result.proposal.innerMm, locale, 2)} mm`}</strong>
              {`, w = ${formatValue(result.proposal.velocityMs, locale, 3)} m/s`}
              <br />{t('tool.pipes.proposalNote')}
            </p>
          )}
          <p className="scan-note">{t('tool.pipes.overview')}</p>
          <p className="scan-note">{t('tool.pipes.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.pipes.assumptions')}</p>
        <p className="scan-note">{t('tool.pipes.sources')}</p>
        <h2>{t('tool.pipes.sizeSource')}</h2>
        <ul className="scan-note">
          {size && <li>{`${size.label} mm: ${size.source.label} — ${size.source.url} (Abruf ${size.source.retrieved})`}</li>}
          {roughness && <li>{`k = ${roughness.kMm} mm: ${roughness.source.label} — ${roughness.source.url} (Abruf ${roughness.source.retrieved})`}</li>}
          <li>{`Wasser: ${WATER_SOURCE.label} — ${WATER_SOURCE.url} (Abruf ${WATER_SOURCE.retrieved})`}</li>
          <li>{`Richtwert Geschwindigkeit: ${RECOMMENDED_VELOCITY.source.label} — ${RECOMMENDED_VELOCITY.source.url} (Abruf ${RECOMMENDED_VELOCITY.source.retrieved})`}</li>
          <li>{`Richtwert Druckgefälle: ${RECOMMENDED_PRESSURE_GRADIENT.source.label} — ${RECOMMENDED_PRESSURE_GRADIENT.source.url} (Abruf ${RECOMMENDED_PRESSURE_GRADIENT.source.retrieved})`}</li>
          <li>{`Wärmekapazität: ${SPECIFIC_HEAT_SOURCE.label}`}</li>
        </ul>
      </details>

      <p className="privacy-note">{t('tool.pipes.summary')}</p>
      <LocalBadge />
    </div>
  )
}
