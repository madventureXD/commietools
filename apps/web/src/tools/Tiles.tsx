import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  TILE_LIMITS,
  planTiles,
  roundForDisplay,
  tileFormats,
  tilePatternById,
  tilePatterns,
  type TilesResult
} from '@commietools/tools/craft/tiles'

type Translate = (key: string) => string

type InputMode = 'dimensions' | 'area'
const INPUT_MODES: readonly InputMode[] = ['dimensions', 'area']

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

export function Tiles({ t, locale }: { t: Translate; locale: string }) {
  const [inputMode, setInputMode] = useState<InputMode>('area')
  const [dims, setDims] = useState({ length: '', breadth: '' })
  const [area, setArea] = useState('')
  const firstPattern = tilePatternById('grid') ?? tilePatterns[0]
  const [patternId, setPatternId] = useState(firstPattern?.id ?? '')
  const [formatId, setFormatId] = useState('30x30')
  const [tileSize, setTileSize] = useState({ length: '300', breadth: '300' })
  const [settings, setSettings] = useState({
    joint: '3',
    depth: '8',
    density: '1600',
    notch: '8',
    bag: '25',
    surcharge: String(firstPattern?.surchargePercent ?? '')
  })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<TilesResult | null>(null)

  const pattern = tilePatternById(patternId) ?? firstPattern

  /** Übernimmt den Zuschlag einer Verlegeart; die übrigen Felder bleiben erhalten. */
  function applyPattern(id: string) {
    const next = tilePatternById(id)
    if (!next) return
    setPatternId(next.id)
    setSettings((current) => ({ ...current, surcharge: String(next.surchargePercent) }))
    setResult(null)
    setErrorKey('')
  }

  /** Übernimmt die Maße eines Formats in die Felder; jedes andere Maß bleibt eintragbar. */
  function applyFormat(id: string) {
    setFormatId(id)
    const entry = tileFormats.find((format) => format.id === id)
    if (entry) setTileSize({ length: String(entry.lengthMm), breadth: String(entry.breadthMm) })
    setResult(null)
    setErrorKey('')
  }

  function resetToPattern() {
    if (pattern) applyPattern(pattern.id)
  }

  function measuredArea(): number {
    if (inputMode === 'area') return parseNumber(area)
    return parseNumber(dims.length) * parseNumber(dims.breadth)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planTiles({
      areaSquareMeters: measuredArea(),
      tileLengthMm: parseNumber(tileSize.length),
      tileBreadthMm: parseNumber(tileSize.breadth),
      jointMm: parseNumber(settings.joint),
      jointDepthMm: parseNumber(settings.depth),
      jointDensity: parseNumber(settings.density),
      notchMm: parseNumber(settings.notch),
      surchargePercent: parseNumber(settings.surcharge),
      bagSizeKg: parseNumber(settings.bag)
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
        { key: 'tool.tiles.out.area', value: `${formatValue(result.areaWithSurcharge, locale)} m²` },
        { key: 'tool.tiles.out.tiles', value: `${result.tiles}` },
        { key: 'tool.tiles.out.perSquareMeter', value: formatValue(result.tilesPerSquareMeter, locale, 3) },
        { key: 'tool.tiles.out.reserve', value: `${result.tiles - result.tilesWithoutSurcharge}` },
        { key: 'tool.tiles.out.jointLength', value: `${formatValue(result.jointLengthMeters, locale, 2)} m` },
        { key: 'tool.tiles.out.adhesive', value: `${formatValue(result.adhesiveKg, locale, 1)} kg` },
        { key: 'tool.tiles.out.adhesiveBags', value: `${result.adhesiveBags} × ${formatValue(parseNumber(settings.bag), locale, 1)} kg`, note: `${t('tool.tiles.out.remainder')}: ${formatValue(result.adhesiveRemainderKg, locale, 1)} kg` },
        { key: 'tool.tiles.out.jointMortar', value: `${formatValue(result.jointMortarKg, locale, 1)} kg` },
        { key: 'tool.tiles.out.jointMortarBags', value: `${result.jointMortarBags} × ${formatValue(parseNumber(settings.bag), locale, 1)} kg`, note: `${t('tool.tiles.out.remainder')}: ${formatValue(result.jointMortarRemainderKg, locale, 1)} kg` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="tiles-input-mode">{t('tool.craft.inputMode')}</label>
            <select id="tiles-input-mode" value={inputMode} onChange={(event) => { setInputMode(event.target.value as InputMode); setResult(null); setErrorKey('') }}>
              {INPUT_MODES.map((item) => (
                <option key={item} value={item}>{t(`tool.tiles.inputMode.${item}`)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="tiles-format">{t('tool.tiles.format')}</label>
            <select id="tiles-format" value={formatId} onChange={(event) => applyFormat(event.target.value)}>
              {tileFormats.map((format) => (
                <option key={format.id} value={format.id}>{`${format.lengthMm} × ${format.breadthMm} mm`}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="tiles-pattern">{t('tool.tiles.pattern')}</label>
            <select id="tiles-pattern" value={patternId} onChange={(event) => applyPattern(event.target.value)}>
              {tilePatterns.map((item) => (
                <option key={item.id} value={item.id}>{t(item.titleKey)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          {inputMode === 'dimensions' && (
            <>
              <div className="field">
                <label htmlFor="tiles-length">{t('tool.craft.length')} (m)</label>
                <input id="tiles-length" type="text" inputMode="decimal" autoComplete="off" value={dims.length} onChange={(event) => setDims({ ...dims, length: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="tiles-breadth">{t('tool.craft.breadth')} (m)</label>
                <input id="tiles-breadth" type="text" inputMode="decimal" autoComplete="off" value={dims.breadth} onChange={(event) => setDims({ ...dims, breadth: event.target.value })} />
              </div>
            </>
          )}
          {inputMode === 'area' && (
            <div className="field">
              <label htmlFor="tiles-area">{t('tool.craft.area')} (m²)</label>
              <input id="tiles-area" type="text" inputMode="decimal" autoComplete="off" value={area} onChange={(event) => setArea(event.target.value)} />
            </div>
          )}
          <div className="field">
            <label htmlFor="tiles-tile-length">{t('tool.tiles.length')}</label>
            <input id="tiles-tile-length" type="text" inputMode="decimal" autoComplete="off" value={tileSize.length} onChange={(event) => setTileSize({ ...tileSize, length: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="tiles-tile-breadth">{t('tool.tiles.breadth')}</label>
            <input id="tiles-tile-breadth" type="text" inputMode="decimal" autoComplete="off" value={tileSize.breadth} onChange={(event) => setTileSize({ ...tileSize, breadth: event.target.value })} />
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.tiles.settings')}{pattern ? <> — <code>{`${pattern.surchargePercent} %`}</code></> : null}</summary>
          {pattern && <p className="scan-note">{t(`tool.craft.valueSource.${pattern.source}`)}</p>}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tiles-joint">{t('tool.tiles.jointWidth')}</label>
              <input id="tiles-joint" type="text" inputMode="decimal" autoComplete="off" min={TILE_LIMITS.jointMm.min} max={TILE_LIMITS.jointMm.max} value={settings.joint} onChange={(event) => setSettings({ ...settings, joint: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tiles-depth">{t('tool.tiles.jointDepth')}</label>
              <input id="tiles-depth" type="text" inputMode="decimal" autoComplete="off" value={settings.depth} onChange={(event) => setSettings({ ...settings, depth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tiles-density">{t('tool.tiles.jointDensity')}</label>
              <input id="tiles-density" type="text" inputMode="decimal" autoComplete="off" value={settings.density} onChange={(event) => setSettings({ ...settings, density: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tiles-notch">{t('tool.tiles.notch')}</label>
              <input id="tiles-notch" type="text" inputMode="decimal" autoComplete="off" value={settings.notch} onChange={(event) => setSettings({ ...settings, notch: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tiles-surcharge">{t('tool.tiles.patternSurcharge')}</label>
              <input id="tiles-surcharge" type="text" inputMode="decimal" autoComplete="off" value={settings.surcharge} onChange={(event) => setSettings({ ...settings, surcharge: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tiles-bag">{t('tool.tiles.bagSize')}</label>
              <input id="tiles-bag" type="text" inputMode="decimal" autoComplete="off" value={settings.bag} onChange={(event) => setSettings({ ...settings, bag: event.target.value })} />
            </div>
          </div>
          <button type="button" className="text-link" onClick={resetToPattern}>{t('tool.craft.reset')}</button>
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
          <p className="scan-note">{t('tool.tiles.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.tiles.assumptions')}</p>
        <p className="scan-note">{t('tool.tiles.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.tiles.summary')}</p>
      <LocalBadge />
    </div>
  )
}
