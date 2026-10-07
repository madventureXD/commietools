import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { anzeigeKontext } from './formatContext'
import {
  planWoodDryMass,
  planWoodMoisture,
  planWoodWeight,
  woodSpecies,
  woodSpeciesById,
  woodVolumeFromMm
} from '@commietools/tools/craft/wood'

type Translate = (key: string) => string

type Mode = 'moisture' | 'dryMass' | 'weight'
const MODES: readonly Mode[] = ['moisture', 'dryMass', 'weight']

function formatValue(value: number, locale: string, digits = 12): string {
  return new Intl.NumberFormat(anzeigeKontext(locale).regionLocale, { maximumFractionDigits: digits }).format(value)
}

function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

export function Wood({ t, locale }: { t: Translate; locale: string }) {
  const [mode, setMode] = useState<Mode>('moisture')
  const [moistureInput, setMoistureInput] = useState({ wet: '13', dry: '10' })
  const [target, setTarget] = useState('12')
  const [speciesId, setSpeciesId] = useState('spruce')
  const [density, setDensity] = useState('0,46')
  const [dims, setDims] = useState({ a: '60', b: '120' })
  const [rest, setRest] = useState({ length: '4', count: '1' })
  const [errorKey, setErrorKey] = useState('')
  const [rows, setRows] = useState<Array<{ key: string; value: string; formula: string }> | null>(null)

  function chooseSpecies(id: string) {
    setSpeciesId(id)
    const species = woodSpeciesById(id)
    if (species) setDensity(String(species.density).replace('.', ','))
    setRows(null)
    setErrorKey('')
  }

  const fail = (key: string) => {
    setRows(null)
    setErrorKey(key)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'moisture') {
      const check = planWoodMoisture({ wetKg: parseNumber(moistureInput.wet), dryKg: parseNumber(moistureInput.dry) })
      if (!check.ok) return fail(check.errorKey)
      const value = check.result
      setErrorKey('')
      setRows([
        { key: 'tool.wood.out.moisture', value: `${formatValue(value.moisturePercent, locale, 2)} %`, formula: value.formula },
        { key: 'tool.wood.out.band', value: t(`tool.wood.out.band.${value.band}`), formula: '0–6 % trocken · 6–35 % Arbeitsbereich · ab 35 % nass' },
        { key: 'tool.wood.out.water', value: `${formatValue(value.waterKg, locale, 3)} kg`, formula: 'W = m_nass − m_darr' },
        { key: 'tool.wood.out.dryShare', value: `${formatValue(value.drySharePercent, locale, 2)} %`, formula: 'Anteil = m_darr / m_nass · 100' }
      ])
      return
    }
    if (mode === 'dryMass') {
      const check = planWoodDryMass(parseNumber(moistureInput.wet), parseNumber(target))
      if (!check.ok) return fail(check.errorKey)
      const value = check.result
      setErrorKey('')
      setRows([
        { key: 'tool.wood.out.dryMass', value: `${formatValue(value.dryKg, locale, 3)} kg`, formula: value.formula },
        { key: 'tool.wood.out.water', value: `${formatValue(value.waterKg, locale, 3)} kg`, formula: 'W = m_nass − m_darr' }
      ])
      return
    }
    const volume = woodVolumeFromMm(parseNumber(dims.a), parseNumber(dims.b), parseNumber(rest.length) * 1000)
    const check = planWoodWeight({ volumeM3: volume, density: parseNumber(density), count: parseNumber(rest.count) })
    if (!check.ok) return fail(check.errorKey)
    const value = check.result
    setErrorKey('')
    setRows([
      { key: 'tool.wood.out.volume', value: `${formatValue(value.volumeM3, locale, 4)} m³`, formula: 'V = B · H · L' },
      { key: 'tool.wood.out.mass', value: `${formatValue(value.massKg, locale, 2)} kg`, formula: value.formula },
      { key: 'tool.wood.out.total', value: `${formatValue(value.totalMassKg, locale, 2)} kg`, formula: 'm_ges = m · Stückzahl' }
    ])
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="wood-mode">{t('tool.wood.mode')}</label>
          <select id="wood-mode" value={mode} onChange={(event) => { setMode(event.target.value as Mode); setRows(null); setErrorKey('') }}>
            {MODES.map((item) => (
              <option key={item} value={item}>{t(`tool.wood.mode.${item}`)}</option>
            ))}
          </select>
        </div>

        {mode !== 'weight' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="wood-wet">{t('tool.wood.wetMass')}</label>
              <input id="wood-wet" type="text" inputMode="decimal" autoComplete="off" value={moistureInput.wet} onChange={(event) => setMoistureInput({ ...moistureInput, wet: event.target.value })} />
            </div>
            {mode === 'moisture' ? (
              <div className="field">
                <label htmlFor="wood-dry">{t('tool.wood.dryMass')}</label>
                <input id="wood-dry" type="text" inputMode="decimal" autoComplete="off" value={moistureInput.dry} onChange={(event) => setMoistureInput({ ...moistureInput, dry: event.target.value })} />
              </div>
            ) : (
              <div className="field">
                <label htmlFor="wood-target">{t('tool.wood.targetMoisture')}</label>
                <input id="wood-target" type="text" inputMode="decimal" autoComplete="off" value={target} onChange={(event) => setTarget(event.target.value)} />
              </div>
            )}
          </div>
        )}

        {mode === 'weight' && (
          <>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="wood-species">{t('tool.wood.species')}</label>
                <select id="wood-species" value={speciesId} onChange={(event) => chooseSpecies(event.target.value)}>
                  {woodSpecies.map((item) => (
                    <option key={item.id} value={item.id}>{t(item.titleKey)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="wood-density">{t('tool.wood.density')}</label>
                <input id="wood-density" type="text" inputMode="decimal" autoComplete="off" value={density} onChange={(event) => setDensity(event.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="wood-a">{t('tool.wood.dimA')}</label>
                <input id="wood-a" type="text" inputMode="decimal" autoComplete="off" value={dims.a} onChange={(event) => setDims({ ...dims, a: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="wood-b">{t('tool.wood.dimB')}</label>
                <input id="wood-b" type="text" inputMode="decimal" autoComplete="off" value={dims.b} onChange={(event) => setDims({ ...dims, b: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="wood-length">{t('tool.wood.length')}</label>
                <input id="wood-length" type="text" inputMode="decimal" autoComplete="off" value={rest.length} onChange={(event) => setRest({ ...rest, length: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="wood-count">{t('tool.wood.count')}</label>
                <input id="wood-count" type="text" inputMode="decimal" autoComplete="off" value={rest.count} onChange={(event) => setRest({ ...rest, count: event.target.value })} />
              </div>
            </div>
          </>
        )}

        <button type="submit">{t('tool.craft.calculate')}</button>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.craft.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {rows && !errorKey && (
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
                    <td><code>{row.formula}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.wood.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.wood.assumptions')}</p>
        <p className="scan-note">{t('tool.wood.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.wood.summary')}</p>
      <LocalBadge />
    </div>
  )
}
