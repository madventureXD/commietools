import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { geometryShapes, geometryUnitSymbols, roundForDisplay } from '@commietools/tools/calculator/geometry'

type Translate = (key: string) => string

/** Zwölf gültige Stellen, in der Sprache des Nutzers geschrieben. */
function formatValue(value: number, locale: string): string {
  const rounded = roundForDisplay(value)
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 12 }).format(rounded)
}

export function Geometry({ t, locale }: { t: Translate; locale: string }) {
  const [shapeId, setShapeId] = useState(geometryShapes[0]?.id ?? '')
  const [input, setInput] = useState<Record<string, string>>({})
  const [errorKey, setErrorKey] = useState('')
  const [outputs, setOutputs] = useState<ReturnType<(typeof geometryShapes)[number]['compute']> | null>(null)

  const shape = geometryShapes.find((item) => item.id === shapeId) ?? geometryShapes[0]
  if (!shape) return null

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const values: Record<string, number> = {}
    for (const field of shape.inputs) {
      if (field.constant !== undefined) {
        values[field.id] = field.constant
        continue
      }
      const raw = (input[field.id] ?? '').trim().replace(',', '.')
      const parsed = Number(raw)
      if (!raw || !Number.isFinite(parsed)) {
        setOutputs(null)
        setErrorKey(raw ? 'tool.calcCommon.error.invalid' : 'tool.calcCommon.error.empty')
        return
      }
      if (parsed < 0 || (field.unit === 'count' && parsed < 3)) {
        setOutputs(null)
        setErrorKey('tool.calcCommon.error.range')
        return
      }
      values[field.id] = parsed
    }
    setErrorKey('')
    setOutputs(shape.compute(values))
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="geometry-shape">{t('tool.geometry.shape')}</label>
          <select
            id="geometry-shape"
            value={shapeId}
            onChange={(event) => {
              setShapeId(event.target.value)
              setInput({})
              setOutputs(null)
              setErrorKey('')
            }}
          >
            {geometryShapes.map((item) => (
              <option key={item.id} value={item.id}>{t(item.titleKey)}</option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          {shape.inputs.map((field) => (
            <div className="field" key={field.id}>
              <label htmlFor={`geometry-${field.id}`}>
                {t(field.labelKey)}{geometryUnitSymbols[field.unit] ? ` (${geometryUnitSymbols[field.unit]})` : ''}
              </label>
              <input
                id={`geometry-${field.id}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={input[field.id] ?? ''}
                onChange={(event) => setInput({ ...input, [field.id]: event.target.value })}
              />
            </div>
          ))}
        </div>

        <button type="submit">{t('tool.calcCommon.calculate')}</button>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.calcCommon.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {outputs && !errorKey && (
        <div className="settings-card stack">
          <h2>{t('tool.calcCommon.result')}</h2>
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool.calcCommon.values')}</th>
                  <th scope="col">{t('tool.geometry.formulaColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {outputs.map((entry) => (
                  <tr key={entry.key}>
                    <th scope="row">
                      {t(entry.labelKey)}: {formatValue(entry.value, locale)}
                      {geometryUnitSymbols[entry.unit] ? ` ${geometryUnitSymbols[entry.unit]}` : ''}
                    </th>
                    <td><code>{entry.formula}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.geometry.roundNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <h3>{t('tool.calcCommon.assumptions')}</h3>
        <p className="scan-note">{t('tool.geometry.assumptions')}</p>
        <p className="scan-note">{t('tool.geometry.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.geometry.summary')}</p>
      <LocalBadge />
    </div>
  )
}
