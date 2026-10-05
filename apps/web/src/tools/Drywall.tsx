import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  DRYWALL_DEFAULTS,
  planDrywall,
  roundForDisplay,
  type DrywallLayers,
  type DrywallResult
} from '@commietools/tools/craft/drywall'

type Translate = (key: string) => string

const LAYERS: readonly DrywallLayers[] = [1, 2]

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

export function Drywall({ t, locale }: { t: Translate; locale: string }) {
  const [surface, setSurface] = useState({
    perimeter: preset(DRYWALL_DEFAULTS.perimeterM),
    height: preset(DRYWALL_DEFAULTS.heightM),
    doors: '1',
    windows: '1',
    doorArea: preset(DRYWALL_DEFAULTS.doorAreaM2.value),
    windowArea: preset(DRYWALL_DEFAULTS.windowAreaM2.value)
  })
  const [layers, setLayers] = useState<DrywallLayers>(1)
  const [settings, setSettings] = useState({
    plateLength: preset(DRYWALL_DEFAULTS.plateLengthM.value),
    plateWidth: preset(DRYWALL_DEFAULTS.plateWidthM.value),
    spacing: preset(DRYWALL_DEFAULTS.studSpacingM.value),
    profileLength: preset(DRYWALL_DEFAULTS.profileLengthM.value),
    screws: preset(DRYWALL_DEFAULTS.screwsPerSqm.value),
    filler: preset(DRYWALL_DEFAULTS.fillerPerSqm.value),
    bag: preset(DRYWALL_DEFAULTS.bagSizeKg.value)
  })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<DrywallResult | null>(null)

  function resetDefaults() {
    setSettings((current) => ({
      ...current,
      plateLength: preset(DRYWALL_DEFAULTS.plateLengthM.value),
      plateWidth: preset(DRYWALL_DEFAULTS.plateWidthM.value),
      spacing: preset(DRYWALL_DEFAULTS.studSpacingM.value),
      profileLength: preset(DRYWALL_DEFAULTS.profileLengthM.value),
      screws: preset(DRYWALL_DEFAULTS.screwsPerSqm.value),
      filler: preset(DRYWALL_DEFAULTS.fillerPerSqm.value),
      bag: preset(DRYWALL_DEFAULTS.bagSizeKg.value)
    }))
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planDrywall({
      perimeterM: parseNumber(surface.perimeter),
      heightM: parseNumber(surface.height),
      doorCount: parseNumber(surface.doors),
      doorAreaM2: parseNumber(surface.doorArea),
      windowCount: parseNumber(surface.windows),
      windowAreaM2: parseNumber(surface.windowArea),
      layers,
      plateLengthM: parseNumber(settings.plateLength),
      plateWidthM: parseNumber(settings.plateWidth),
      studSpacingM: parseNumber(settings.spacing),
      profileLengthM: parseNumber(settings.profileLength),
      screwsPerSqm: parseNumber(settings.screws),
      fillerPerSqm: parseNumber(settings.filler),
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
        { key: 'tool.drywall.out.gross', value: `${formatValue(result.grossAreaM2, locale, 3)} m²` },
        { key: 'tool.drywall.out.deduction', value: `${formatValue(result.deductionAreaM2, locale, 3)} m²` },
        { key: 'tool.drywall.out.net', value: `${formatValue(result.netAreaM2, locale, 3)} m²` },
        { key: 'tool.drywall.out.strips', value: `${result.strips}` },
        { key: 'tool.drywall.out.platesPerStrip', value: `${result.platesPerStrip}` },
        { key: 'tool.drywall.out.platesPerLayer', value: `${result.platesPerLayer}` },
        { key: 'tool.drywall.out.plates', value: `${result.plates}` },
        { key: 'tool.drywall.out.offcut', value: `${formatValue(result.offcutAreaM2, locale, 3)} m²` },
        { key: 'tool.drywall.out.studs', value: `${result.studs}` },
        { key: 'tool.drywall.out.studMeters', value: `${formatValue(result.studMeters, locale, 2)} m` },
        { key: 'tool.drywall.out.studProfiles', value: `${result.studProfiles}` },
        { key: 'tool.drywall.out.trackProfiles', value: `${result.trackProfiles}` },
        { key: 'tool.drywall.out.screws', value: `${result.screws}` },
        { key: 'tool.drywall.out.filler', value: `${formatValue(result.fillerKg, locale, 2)} kg` },
        {
          key: 'tool.drywall.out.fillerBags',
          value: `${result.fillerBags} × ${formatValue(parseNumber(settings.bag), locale, 1)} kg`,
          note: `${t('tool.drywall.out.remainder')}: ${formatValue(result.fillerRemainderKg, locale, 2)} kg`
        },
        { key: 'tool.drywall.out.tape', value: `${formatValue(result.tapeMeters, locale, 2)} m` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="drywall-perimeter">{t('tool.drywall.perimeter')}</label>
            <input id="drywall-perimeter" type="text" inputMode="decimal" autoComplete="off" value={surface.perimeter} onChange={(event) => setSurface({ ...surface, perimeter: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="drywall-height">{t('tool.drywall.height')}</label>
            <input id="drywall-height" type="text" inputMode="decimal" autoComplete="off" value={surface.height} onChange={(event) => setSurface({ ...surface, height: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="drywall-layers">{t('tool.drywall.layers')}</label>
            <select id="drywall-layers" value={layers} onChange={(event) => { setLayers(Number(event.target.value) === 2 ? 2 : 1); setResult(null); setErrorKey('') }}>
              {LAYERS.map((item) => (
                <option key={item} value={item}>{t(`tool.drywall.layers.${item}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.drywall.openings')}</summary>
          <p className="scan-note">{t('tool.drywall.out.deduction')}: {t('tool.craft.lastChecked')}</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="drywall-doors">{t('tool.drywall.doors')}</label>
              <input id="drywall-doors" type="text" inputMode="numeric" autoComplete="off" value={surface.doors} onChange={(event) => setSurface({ ...surface, doors: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-windows">{t('tool.drywall.windows')}</label>
              <input id="drywall-windows" type="text" inputMode="numeric" autoComplete="off" value={surface.windows} onChange={(event) => setSurface({ ...surface, windows: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-door-area">{t('tool.drywall.doorArea')}</label>
              <input id="drywall-door-area" type="text" inputMode="decimal" autoComplete="off" value={surface.doorArea} onChange={(event) => setSurface({ ...surface, doorArea: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-window-area">{t('tool.drywall.windowArea')}</label>
              <input id="drywall-window-area" type="text" inputMode="decimal" autoComplete="off" value={surface.windowArea} onChange={(event) => setSurface({ ...surface, windowArea: event.target.value })} />
            </div>
          </div>
        </details>

        <details className="settings-card" open>
          <summary>{t('tool.drywall.settings')}</summary>
          <p className="scan-note">{t(`tool.craft.valueSource.${DRYWALL_DEFAULTS.plateLengthM.source}`)}</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="drywall-plate-length">{t('tool.drywall.plateLength')}</label>
              <input id="drywall-plate-length" type="text" inputMode="decimal" autoComplete="off" value={settings.plateLength} onChange={(event) => setSettings({ ...settings, plateLength: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-plate-width">{t('tool.drywall.plateWidth')}</label>
              <input id="drywall-plate-width" type="text" inputMode="decimal" autoComplete="off" value={settings.plateWidth} onChange={(event) => setSettings({ ...settings, plateWidth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-spacing">{t('tool.drywall.studSpacing')}</label>
              <input id="drywall-spacing" type="text" inputMode="decimal" autoComplete="off" value={settings.spacing} onChange={(event) => setSettings({ ...settings, spacing: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-profile-length">{t('tool.drywall.profileLength')}</label>
              <input id="drywall-profile-length" type="text" inputMode="decimal" autoComplete="off" value={settings.profileLength} onChange={(event) => setSettings({ ...settings, profileLength: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-screws">{t('tool.drywall.screwsPerSqm')}</label>
              <input id="drywall-screws" type="text" inputMode="decimal" autoComplete="off" value={settings.screws} onChange={(event) => setSettings({ ...settings, screws: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-filler">{t('tool.drywall.fillerPerSqm')}</label>
              <input id="drywall-filler" type="text" inputMode="decimal" autoComplete="off" value={settings.filler} onChange={(event) => setSettings({ ...settings, filler: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="drywall-bag">{t('tool.drywall.bagSize')}</label>
              <input id="drywall-bag" type="text" inputMode="decimal" autoComplete="off" value={settings.bag} onChange={(event) => setSettings({ ...settings, bag: event.target.value })} />
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
          <p className="scan-note">{t('tool.drywall.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h3>{t('tool.craft.assumptions')}</h3>
        <p className="scan-note">{t('tool.drywall.assumptions')}</p>
        <p className="scan-note">{t('tool.drywall.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.drywall.summary')}</p>
      <LocalBadge />
    </div>
  )
}
