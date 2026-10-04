import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  METAL_LIMITS,
  metalFieldUse,
  metalMaterialById,
  metalMaterials,
  metalProfiles,
  planMetalWeight,
  type MetalProfile,
  type MetalResult
} from '@commietools/tools/craft/metal'

type Translate = (key: string) => string

function formatValue(value: number, locale: string, digits = 12): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)
}

function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

export function MetalWeight({ t, locale }: { t: Translate; locale: string }) {
  const [profile, setProfile] = useState<MetalProfile>('round')
  const [materialId, setMaterialId] = useState('steel')
  const [density, setDensity] = useState('7,85')
  const [fields, setFields] = useState({ a: '20', b: '5', t: '2' })
  const [rest, setRest] = useState({ length: '6', count: '1' })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<MetalResult | null>(null)

  const use = metalFieldUse(profile)

  function chooseMaterial(id: string) {
    setMaterialId(id)
    const material = metalMaterialById(id)
    if (material) setDensity(String(material.density).replace('.', ','))
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planMetalWeight({
      profile,
      fields: { a: parseNumber(fields.a), b: parseNumber(fields.b), t: parseNumber(fields.t) },
      lengthM: parseNumber(rest.length),
      density: parseNumber(density),
      count: parseNumber(rest.count)
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
        { key: 'tool.metal.out.area', value: `${formatValue(result.areaMm2, locale, 2)} mm²` },
        { key: 'tool.metal.out.massPerMeter', value: `${formatValue(result.massPerMeterKg, locale, 3)} kg` },
        { key: 'tool.metal.out.mass', value: `${formatValue(result.massKg, locale, 3)} kg` },
        { key: 'tool.metal.out.total', value: `${formatValue(result.totalMassKg, locale, 3)} kg` },
        { key: 'tool.metal.out.volume', value: `${formatValue(result.volumeDm3, locale, 3)} dm³` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="metal-profile">{t('tool.metal.profile')}</label>
            <select id="metal-profile" value={profile} onChange={(event) => { setProfile(event.target.value as MetalProfile); setResult(null); setErrorKey('') }}>
              {metalProfiles.map((item) => (
                <option key={item} value={item}>{t(`tool.metal.profile.${item}`)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="metal-material">{t('tool.metal.material')}</label>
            <select id="metal-material" value={materialId} onChange={(event) => chooseMaterial(event.target.value)}>
              {metalMaterials.map((item) => (
                <option key={item.id} value={item.id}>{t(item.titleKey)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="metal-density">{t('tool.metal.density')}</label>
            <input id="metal-density" type="text" inputMode="decimal" autoComplete="off" value={density} onChange={(event) => setDensity(event.target.value)} />
          </div>
        </div>
        {metalMaterialById(materialId)?.sourced === false && (
          <p className="scan-note">{t('tool.craft.valueSource.experience')}</p>
        )}

        <div className="form-grid">
          {use.a && (
            <div className="field">
              <label htmlFor="metal-a">{t(`tool.metal.dimA.${profile}`)}</label>
              <input id="metal-a" type="text" inputMode="decimal" autoComplete="off" min={METAL_LIMITS.dimension.min} max={METAL_LIMITS.dimension.max} value={fields.a} onChange={(event) => setFields({ ...fields, a: event.target.value })} />
            </div>
          )}
          {use.b && (
            <div className="field">
              <label htmlFor="metal-b">{t(`tool.metal.dimB.${profile}`)}</label>
              <input id="metal-b" type="text" inputMode="decimal" autoComplete="off" value={fields.b} onChange={(event) => setFields({ ...fields, b: event.target.value })} />
            </div>
          )}
          {use.t && (
            <div className="field">
              <label htmlFor="metal-t">{t('tool.metal.wall')}</label>
              <input id="metal-t" type="text" inputMode="decimal" autoComplete="off" min={METAL_LIMITS.thickness.min} max={METAL_LIMITS.thickness.max} value={fields.t} onChange={(event) => setFields({ ...fields, t: event.target.value })} />
            </div>
          )}
          <div className="field">
            <label htmlFor="metal-length">{t('tool.metal.length')}</label>
            <input id="metal-length" type="text" inputMode="decimal" autoComplete="off" value={rest.length} onChange={(event) => setRest({ ...rest, length: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="metal-count">{t('tool.metal.count')}</label>
            <input id="metal-count" type="text" inputMode="decimal" autoComplete="off" min={METAL_LIMITS.count.min} max={METAL_LIMITS.count.max} value={rest.count} onChange={(event) => setRest({ ...rest, count: event.target.value })} />
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
                    <td><code>{index === 0 ? result.formula : index === 1 ? 'm′ = F · ρ / 1000' : 'm = m′ · L'}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.metal.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h3>{t('tool.craft.assumptions')}</h3>
        <p className="scan-note">{t('tool.metal.assumptions')}</p>
        <p className="scan-note">{t('tool.metal.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.metal.summary')}</p>
      <LocalBadge />
    </div>
  )
}
