import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  CRAFT_LIMITS,
  craftMixById,
  craftMixes,
  craftMixesOfKind,
  planCraftMix,
  roundForDisplay,
  volumeFromArea,
  volumeFromDimensions,
  type CraftMixKind,
  type CraftMixResult
} from '@commietools/tools/craft/concrete'

type Translate = (key: string) => string

const KINDS: readonly CraftMixKind[] = ['concrete', 'mortar', 'screed']
type InputMode = 'dimensions' | 'area' | 'volume'
const INPUT_MODES: readonly InputMode[] = ['dimensions', 'area', 'volume']

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

export function Concrete({ t, locale }: { t: Translate; locale: string }) {
  const [kind, setKind] = useState<CraftMixKind>('concrete')
  // Vorauswahl: der häufigste Fall — Fundamente, Bodenplatten, einfache Decken.
  const first = craftMixById('c2025') ?? craftMixesOfKind('concrete')[0]
  const [mixId, setMixId] = useState(first?.id ?? '')
  const [inputMode, setInputMode] = useState<InputMode>('dimensions')
  const [dims, setDims] = useState({ length: '', breadth: '', thickness: '' })
  const [area, setArea] = useState('')
  const [volume, setVolume] = useState('')
  const [settings, setSettings] = useState({
    cement: String(first?.cementPerCubicMeter ?? ''),
    ratio: String(first?.waterCementRatio ?? '').replace('.', ','),
    density: String(first?.freshDensity ?? ''),
    waste: '5',
    bag: '25'
  })
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState<CraftMixResult | null>(null)

  const mix = craftMixById(mixId) ?? first
  const kindMixes = craftMixesOfKind(kind)
  if (!mix) return null

  /** Übernimmt die Vorschlagswerte einer Mischung; Verschnitt und Sackgröße bleiben erhalten. */
  function applyMix(next: typeof mix) {
    if (!next) return
    setMixId(next.id)
    setSettings((current) => ({
      ...current,
      cement: String(next.cementPerCubicMeter),
      ratio: String(next.waterCementRatio).replace('.', ','),
      density: String(next.freshDensity)
    }))
    setResult(null)
    setErrorKey('')
  }

  function resetToMix() {
    applyMix(mix)
  }

  function mixedVolume(): number {
    if (inputMode === 'volume') return parseNumber(volume)
    if (inputMode === 'area') return volumeFromArea(parseNumber(area), parseNumber(dims.thickness))
    return volumeFromDimensions(parseNumber(dims.length), parseNumber(dims.breadth), parseNumber(dims.thickness))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const measured = mixedVolume()
    if (inputMode !== 'volume' && Number.isNaN(measured)) {
      setResult(null)
      setErrorKey('tool.craft.error.empty')
      return
    }
    const check = planCraftMix({
      volumeCubicMeters: measured,
      cementPerCubicMeter: parseNumber(settings.cement),
      waterCementRatio: parseNumber(settings.ratio),
      freshDensity: parseNumber(settings.density),
      wastePercent: parseNumber(settings.waste),
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

  const outputRows: Array<{ key: string; value: string; note?: string }> = result
    ? [
        { key: 'tool.craft.out.volume', value: `${formatValue(result.volumeCubicMeters, locale)} m³` },
        { key: 'tool.craft.out.cement', value: `${formatValue(result.cementKg, locale, 1)} kg` },
        { key: 'tool.craft.out.bags', value: `${result.bags} × ${formatValue(parseNumber(settings.bag), locale, 1)} kg`, note: `${t('tool.craft.out.bagsRemainder')}: ${formatValue(result.bagsRemainderKg, locale, 1)} kg` },
        { key: 'tool.craft.out.water', value: `${formatValue(result.waterLiters, locale, 1)} l` },
        { key: 'tool.craft.out.aggregate', value: `${formatValue(result.aggregateKg, locale, 1)} kg` },
        { key: 'tool.craft.out.totalMass', value: `${formatValue(result.totalMassKg, locale, 1)} kg` },
        { key: 'tool.craft.out.ratio', value: `1 : ${formatValue(result.aggregatePerCement, locale, 2)}` }
      ]
    : []

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="concrete-kind">{t('tool.concrete.kind')}</label>
            <select
              id="concrete-kind"
              value={kind}
              onChange={(event) => {
                const nextKind = event.target.value as CraftMixKind
                setKind(nextKind)
                applyMix(craftMixesOfKind(nextKind)[0])
              }}
            >
              {KINDS.map((item) => (
                <option key={item} value={item}>{t(`tool.concrete.kind.${item}`)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="concrete-mix">{t('tool.concrete.mix')}</label>
            <select id="concrete-mix" value={mixId} onChange={(event) => applyMix(craftMixById(event.target.value))}>
              {kindMixes.map((item) => (
                <option key={item.id} value={item.id}>{t(item.titleKey)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="concrete-input-mode">{t('tool.craft.inputMode')}</label>
            <select id="concrete-input-mode" value={inputMode} onChange={(event) => { setInputMode(event.target.value as InputMode); setResult(null); setErrorKey('') }}>
              {INPUT_MODES.map((item) => (
                <option key={item} value={item}>{t(`tool.craft.inputMode.${item}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          {inputMode !== 'volume' && (
            <div className="field">
              <label htmlFor="concrete-thickness">{t('tool.craft.thickness')} (m)</label>
              <input id="concrete-thickness" type="text" inputMode="decimal" autoComplete="off" value={dims.thickness} onChange={(event) => setDims({ ...dims, thickness: event.target.value })} />
            </div>
          )}
          {inputMode === 'dimensions' && (
            <>
              <div className="field">
                <label htmlFor="concrete-length">{t('tool.craft.length')} (m)</label>
                <input id="concrete-length" type="text" inputMode="decimal" autoComplete="off" value={dims.length} onChange={(event) => setDims({ ...dims, length: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="concrete-breadth">{t('tool.craft.breadth')} (m)</label>
                <input id="concrete-breadth" type="text" inputMode="decimal" autoComplete="off" value={dims.breadth} onChange={(event) => setDims({ ...dims, breadth: event.target.value })} />
              </div>
            </>
          )}
          {inputMode === 'area' && (
            <div className="field">
              <label htmlFor="concrete-area">{t('tool.craft.area')} (m²)</label>
              <input id="concrete-area" type="text" inputMode="decimal" autoComplete="off" value={area} onChange={(event) => setArea(event.target.value)} />
            </div>
          )}
          {inputMode === 'volume' && (
            <div className="field">
              <label htmlFor="concrete-volume">{t('tool.craft.volume')} ({t('tool.craft.volumeUnit')})</label>
              <input id="concrete-volume" type="text" inputMode="decimal" autoComplete="off" value={volume} onChange={(event) => setVolume(event.target.value)} />
            </div>
          )}
        </div>

        <details className="settings-card" open>
          <summary>{t('tool.concrete.recipe')} — <code>{mix.ratioHint}</code></summary>
          <p className="scan-note">{t(`tool.craft.valueSource.${mix.source}`)}</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="concrete-cement">{t('tool.concrete.cementPerCubicMeter')}</label>
              <input id="concrete-cement" type="text" inputMode="decimal" autoComplete="off" min={CRAFT_LIMITS.cementPerCubicMeter.min} max={CRAFT_LIMITS.cementPerCubicMeter.max} value={settings.cement} onChange={(event) => setSettings({ ...settings, cement: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="concrete-ratio">{t('tool.concrete.waterCementRatio')}</label>
              <input id="concrete-ratio" type="text" inputMode="decimal" autoComplete="off" value={settings.ratio} onChange={(event) => setSettings({ ...settings, ratio: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="concrete-density">{t('tool.concrete.freshDensity')}</label>
              <input id="concrete-density" type="text" inputMode="decimal" autoComplete="off" value={settings.density} onChange={(event) => setSettings({ ...settings, density: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="concrete-waste">{t('tool.concrete.waste')}</label>
              <input id="concrete-waste" type="text" inputMode="decimal" autoComplete="off" value={settings.waste} onChange={(event) => setSettings({ ...settings, waste: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="concrete-bag">{t('tool.concrete.bagSize')}</label>
              <input id="concrete-bag" type="text" inputMode="decimal" autoComplete="off" value={settings.bag} onChange={(event) => setSettings({ ...settings, bag: event.target.value })} />
            </div>
          </div>
          <button type="button" className="text-link" onClick={resetToMix}>{t('tool.craft.reset')}</button>
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
                {outputRows.map((row, index) => (
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
          <p className="scan-note">{t('tool.concrete.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.concrete.assumptions')}</p>
        <p className="scan-note">{t('tool.concrete.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.concrete.summary')}</p>
      <LocalBadge />
    </div>
  )
}
