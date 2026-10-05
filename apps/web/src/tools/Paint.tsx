import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  PAINT_DEFAULTS,
  PAINT_LIMITS,
  planPaint,
  roundForDisplay,
  type PaintResult,
  type PatternRepeat
} from '@commietools/tools/craft/paint'

type Translate = (key: string) => string

const REPEATS: readonly PatternRepeat[] = ['free', 'straight', 'half']

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

export function Paint({ t, locale }: { t: Translate; locale: string }) {
  const [surface, setSurface] = useState({
    perimeter: preset(PAINT_DEFAULTS.perimeterM),
    height: preset(PAINT_DEFAULTS.heightM),
    doors: '1',
    windows: '1',
    doorArea: preset(PAINT_DEFAULTS.doorAreaM2.value),
    windowArea: preset(PAINT_DEFAULTS.windowAreaM2.value),
    doorWidth: preset(PAINT_DEFAULTS.doorWidthM.value),
    windowWidth: preset(PAINT_DEFAULTS.windowWidthM.value),
    extra: '0'
  })
  const [settings, setSettings] = useState({
    coats: '2',
    coverage: preset(PAINT_DEFAULTS.coverageSqmPerLitre.value),
    tin: preset(PAINT_DEFAULTS.tinSizeL.value),
    rollLength: preset(PAINT_DEFAULTS.rollLengthM.value),
    rollWidth: preset(PAINT_DEFAULTS.rollWidthM.value),
    repeatLength: '0',
    allowance: preset(PAINT_DEFAULTS.cutAllowanceM.value)
  })
  const [repeat, setRepeat] = useState<PatternRepeat>('free')
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<PaintResult | null>(null)

  /** Wechselt das Muster und setzt eine sinnvolle Rapportlänge, wenn keine eingetragen ist. */
  function applyRepeat(next: PatternRepeat) {
    setRepeat(next)
    setSettings((current) => ({
      ...current,
      repeatLength: next === 'free' ? '0' : current.repeatLength === '0' ? '0,64' : current.repeatLength
    }))
    setResult(null)
    setErrorKey('')
  }

  function resetDefaults() {
    setSurface((current) => ({
      ...current,
      doorArea: preset(PAINT_DEFAULTS.doorAreaM2.value),
      windowArea: preset(PAINT_DEFAULTS.windowAreaM2.value),
      doorWidth: preset(PAINT_DEFAULTS.doorWidthM.value),
      windowWidth: preset(PAINT_DEFAULTS.windowWidthM.value)
    }))
    setSettings((current) => ({
      ...current,
      coverage: preset(PAINT_DEFAULTS.coverageSqmPerLitre.value),
      tin: preset(PAINT_DEFAULTS.tinSizeL.value),
      rollLength: preset(PAINT_DEFAULTS.rollLengthM.value),
      rollWidth: preset(PAINT_DEFAULTS.rollWidthM.value),
      allowance: preset(PAINT_DEFAULTS.cutAllowanceM.value)
    }))
    setResult(null)
    setErrorKey('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const check = planPaint({
      perimeterM: parseNumber(surface.perimeter),
      heightM: parseNumber(surface.height),
      doorCount: parseNumber(surface.doors),
      doorAreaM2: parseNumber(surface.doorArea),
      doorWidthM: parseNumber(surface.doorWidth),
      windowCount: parseNumber(surface.windows),
      windowAreaM2: parseNumber(surface.windowArea),
      windowWidthM: parseNumber(surface.windowWidth),
      extraDeductionM2: parseNumber(surface.extra),
      coats: parseNumber(settings.coats),
      coverageSqmPerLitre: parseNumber(settings.coverage),
      tinSizeL: parseNumber(settings.tin),
      rollLengthM: parseNumber(settings.rollLength),
      rollWidthM: parseNumber(settings.rollWidth),
      repeatM: parseNumber(settings.repeatLength),
      repeat,
      cutAllowanceM: parseNumber(settings.allowance)
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
        { key: 'tool.paint.out.gross', value: `${formatValue(result.grossAreaM2, locale, 3)} m²` },
        { key: 'tool.paint.out.deduction', value: `${formatValue(result.deductionAreaM2, locale, 3)} m²` },
        { key: 'tool.paint.out.net', value: `${formatValue(result.netAreaM2, locale, 3)} m²` },
        { key: 'tool.paint.out.netWidth', value: `${formatValue(result.netWidthM, locale, 3)} m` },
        {
          key: 'tool.paint.out.cut',
          value: `${formatValue(result.cutLengthM, locale, 3)} m`,
          note: result.repeatStepM > 0 ? `${t('tool.paint.out.repeatStep')}: ${formatValue(result.repeatStepM, locale, 3)} m` : undefined
        },
        { key: 'tool.paint.out.perRoll', value: `${result.dropsPerRoll}` },
        { key: 'tool.paint.out.drops', value: `${result.drops}` },
        { key: 'tool.paint.out.rolls', value: `${result.rolls}` },
        { key: 'tool.paint.out.paintPerCoat', value: `${formatValue(result.paintLitresPerCoat, locale, 2)} l` },
        { key: 'tool.paint.out.paintTotal', value: `${formatValue(result.paintLitres, locale, 2)} l` },
        { key: 'tool.paint.out.tins', value: `${result.paintTins} × ${formatValue(parseNumber(settings.tin), locale, 2)} l` },
        { key: 'tool.paint.out.offcut', value: `${formatValue(result.offcutAreaM2, locale, 3)} m²` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="paint-perimeter">{t('tool.paint.perimeter')}</label>
            <input id="paint-perimeter" type="text" inputMode="decimal" autoComplete="off" min={PAINT_LIMITS.perimeterM.min} value={surface.perimeter} onChange={(event) => setSurface({ ...surface, perimeter: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="paint-height">{t('tool.paint.height')}</label>
            <input id="paint-height" type="text" inputMode="decimal" autoComplete="off" value={surface.height} onChange={(event) => setSurface({ ...surface, height: event.target.value })} />
          </div>
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.paint.openings')}</summary>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="paint-doors">{t('tool.paint.doors')}</label>
              <input id="paint-doors" type="text" inputMode="numeric" autoComplete="off" value={surface.doors} onChange={(event) => setSurface({ ...surface, doors: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-windows">{t('tool.paint.windows')}</label>
              <input id="paint-windows" type="text" inputMode="numeric" autoComplete="off" value={surface.windows} onChange={(event) => setSurface({ ...surface, windows: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-door-area">{t('tool.paint.doorArea')}</label>
              <input id="paint-door-area" type="text" inputMode="decimal" autoComplete="off" value={surface.doorArea} onChange={(event) => setSurface({ ...surface, doorArea: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-window-area">{t('tool.paint.windowArea')}</label>
              <input id="paint-window-area" type="text" inputMode="decimal" autoComplete="off" value={surface.windowArea} onChange={(event) => setSurface({ ...surface, windowArea: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-door-width">{t('tool.paint.doorWidth')}</label>
              <input id="paint-door-width" type="text" inputMode="decimal" autoComplete="off" value={surface.doorWidth} onChange={(event) => setSurface({ ...surface, doorWidth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-window-width">{t('tool.paint.windowWidth')}</label>
              <input id="paint-window-width" type="text" inputMode="decimal" autoComplete="off" value={surface.windowWidth} onChange={(event) => setSurface({ ...surface, windowWidth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-extra">{t('tool.paint.extraDeduction')}</label>
              <input id="paint-extra" type="text" inputMode="decimal" autoComplete="off" value={surface.extra} onChange={(event) => setSurface({ ...surface, extra: event.target.value })} />
            </div>
          </div>
        </details>

        <details className="settings-card" open>
          <summary>{t('tool.paint.settings')}</summary>
          <p className="scan-note">{t(`tool.craft.valueSource.${PAINT_DEFAULTS.coverageSqmPerLitre.source}`)}</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="paint-coats">{t('tool.paint.coats')}</label>
              <input id="paint-coats" type="text" inputMode="numeric" autoComplete="off" value={settings.coats} onChange={(event) => setSettings({ ...settings, coats: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-coverage">{t('tool.paint.coverage')}</label>
              <input id="paint-coverage" type="text" inputMode="decimal" autoComplete="off" min={PAINT_LIMITS.coverageSqmPerLitre.min} max={PAINT_LIMITS.coverageSqmPerLitre.max} value={settings.coverage} onChange={(event) => setSettings({ ...settings, coverage: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-tin">{t('tool.paint.tinSize')}</label>
              <input id="paint-tin" type="text" inputMode="decimal" autoComplete="off" value={settings.tin} onChange={(event) => setSettings({ ...settings, tin: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-repeat">{t('tool.paint.repeat')}</label>
              <select id="paint-repeat" value={repeat} onChange={(event) => applyRepeat(event.target.value as PatternRepeat)}>
                {REPEATS.map((item) => (
                  <option key={item} value={item}>{t(`tool.paint.repeat.${item}`)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="paint-repeat-length">{t('tool.paint.repeatLength')}</label>
              <input id="paint-repeat-length" type="text" inputMode="decimal" autoComplete="off" value={settings.repeatLength} onChange={(event) => setSettings({ ...settings, repeatLength: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-roll-length">{t('tool.paint.rollLength')}</label>
              <input id="paint-roll-length" type="text" inputMode="decimal" autoComplete="off" value={settings.rollLength} onChange={(event) => setSettings({ ...settings, rollLength: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-roll-width">{t('tool.paint.rollWidth')}</label>
              <input id="paint-roll-width" type="text" inputMode="decimal" autoComplete="off" value={settings.rollWidth} onChange={(event) => setSettings({ ...settings, rollWidth: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paint-allowance">{t('tool.paint.cutAllowance')}</label>
              <input id="paint-allowance" type="text" inputMode="decimal" autoComplete="off" value={settings.allowance} onChange={(event) => setSettings({ ...settings, allowance: event.target.value })} />
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
          <p className="scan-note">{t('tool.paint.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h3>{t('tool.craft.assumptions')}</h3>
        <p className="scan-note">{t('tool.paint.assumptions')}</p>
        <p className="scan-note">{t('tool.paint.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.paint.summary')}</p>
      <LocalBadge />
    </div>
  )
}
