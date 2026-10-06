import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  FLOORING_DEFAULTS,
  flooringPatternById,
  flooringPatterns,
  planFlooring,
  roundForDisplay,
  type FlooringPattern,
  type FlooringResult
} from '@commietools/tools/craft/flooring'

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

export function Flooring({ t, locale }: { t: Translate; locale: string }) {
  const [room, setRoom] = useState({
    length: preset(FLOORING_DEFAULTS.lengthM),
    breadth: preset(FLOORING_DEFAULTS.breadthM)
  })
  const firstPattern = flooringPatternById('parallel') ?? flooringPatterns[0]
  const [patternId, setPatternId] = useState(firstPattern?.id ?? '')
  const [settings, setSettings] = useState({
    surcharge: String(firstPattern?.surchargePercent ?? ''),
    packageArea: preset(FLOORING_DEFAULTS.packageAreaM2.value),
    rollArea: preset(FLOORING_DEFAULTS.underlayRollAreaM2.value),
    overlap: preset(FLOORING_DEFAULTS.underlayOverlapPercent.value),
    trimPiece: preset(FLOORING_DEFAULTS.trimPieceLengthM.value)
  })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<FlooringResult | null>(null)

  const pattern = flooringPatternById(patternId) ?? firstPattern

  /** Übernimmt den Zuschlag einer Verlegeart; die übrigen Felder bleiben erhalten. */
  function applyPattern(id: string) {
    const next = flooringPatternById(id)
    if (!next) return
    setPatternId(next.id)
    setSettings((current) => ({ ...current, surcharge: String(next.surchargePercent) }))
    setResult(null)
    setErrorKey('')
  }

  function resetDefaults() {
    setSettings((current) => ({
      ...current,
      surcharge: pattern ? String(pattern.surchargePercent) : current.surcharge,
      packageArea: preset(FLOORING_DEFAULTS.packageAreaM2.value),
      rollArea: preset(FLOORING_DEFAULTS.underlayRollAreaM2.value),
      overlap: preset(FLOORING_DEFAULTS.underlayOverlapPercent.value),
      trimPiece: preset(FLOORING_DEFAULTS.trimPieceLengthM.value)
    }))
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planFlooring({
      lengthM: parseNumber(room.length),
      breadthM: parseNumber(room.breadth),
      packageAreaM2: parseNumber(settings.packageArea),
      pattern: patternId as FlooringPattern,
      surchargePercent: parseNumber(settings.surcharge),
      underlayRollAreaM2: parseNumber(settings.rollArea),
      underlayOverlapPercent: parseNumber(settings.overlap),
      trimPieceLengthM: parseNumber(settings.trimPiece)
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
        { key: 'tool.flooring.out.area', value: `${formatValue(result.areaM2, locale, 3)} m²` },
        { key: 'tool.flooring.out.surcharge', value: `${formatValue(result.surchargeM2, locale, 3)} m²` },
        { key: 'tool.flooring.out.required', value: `${formatValue(result.requiredM2, locale, 3)} m²` },
        { key: 'tool.flooring.out.packages', value: `${result.packages} × ${formatValue(parseNumber(settings.packageArea), locale, 2)} m²` },
        { key: 'tool.flooring.out.offcut', value: `${formatValue(result.offcutM2, locale, 3)} m²` },
        { key: 'tool.flooring.out.underlay', value: `${formatValue(result.underlayM2, locale, 3)} m²` },
        { key: 'tool.flooring.out.underlayRolls', value: `${result.underlayRolls} × ${formatValue(parseNumber(settings.rollArea), locale, 2)} m²` },
        { key: 'tool.flooring.out.perimeter', value: `${formatValue(result.perimeterM, locale, 3)} m` },
        { key: 'tool.flooring.out.trimPieces', value: `${result.trimPieces} × ${formatValue(parseNumber(settings.trimPiece), locale, 2)} m` },
        { key: 'tool.flooring.out.trimMeters', value: `${formatValue(result.trimMeters, locale, 3)} m` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="flooring-length">{t('tool.flooring.length')}</label>
            <input id="flooring-length" type="text" inputMode="decimal" autoComplete="off" value={room.length} onChange={(event) => setRoom({ ...room, length: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="flooring-breadth">{t('tool.flooring.breadth')}</label>
            <input id="flooring-breadth" type="text" inputMode="decimal" autoComplete="off" value={room.breadth} onChange={(event) => setRoom({ ...room, breadth: event.target.value })} />
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.flooring.settings')}{pattern ? <> — <code>{`${pattern.surchargePercent} %`}</code></> : null}</summary>
          {pattern && <p className="scan-note">{t(`tool.craft.valueSource.${pattern.source}`)}</p>}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="flooring-pattern">{t('tool.flooring.pattern')}</label>
              <select id="flooring-pattern" value={patternId} onChange={(event) => applyPattern(event.target.value)}>
                {flooringPatterns.map((item) => (
                  <option key={item.id} value={item.id}>{t(item.titleKey)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="flooring-surcharge">{t('tool.flooring.surcharge')}</label>
              <input id="flooring-surcharge" type="text" inputMode="decimal" autoComplete="off" value={settings.surcharge} onChange={(event) => setSettings({ ...settings, surcharge: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="flooring-package">{t('tool.flooring.packageArea')}</label>
              <input id="flooring-package" type="text" inputMode="decimal" autoComplete="off" value={settings.packageArea} onChange={(event) => setSettings({ ...settings, packageArea: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="flooring-roll">{t('tool.flooring.underlayRoll')}</label>
              <input id="flooring-roll" type="text" inputMode="decimal" autoComplete="off" value={settings.rollArea} onChange={(event) => setSettings({ ...settings, rollArea: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="flooring-overlap">{t('tool.flooring.underlayOverlap')}</label>
              <input id="flooring-overlap" type="text" inputMode="decimal" autoComplete="off" value={settings.overlap} onChange={(event) => setSettings({ ...settings, overlap: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="flooring-trim">{t('tool.flooring.trimPiece')}</label>
              <input id="flooring-trim" type="text" inputMode="decimal" autoComplete="off" value={settings.trimPiece} onChange={(event) => setSettings({ ...settings, trimPiece: event.target.value })} />
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
          <p className="scan-note">{t('tool.flooring.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.flooring.assumptions')}</p>
        <p className="scan-note">{t('tool.flooring.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.flooring.summary')}</p>
      <LocalBadge />
    </div>
  )
}
