import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { solve, type EquationDegree, type EquationSolution } from '@commietools/tools/calculator/equations'

type Translate = (key: string) => string

const DEGREES: readonly { readonly id: EquationDegree; readonly fields: readonly string[] }[] = [
  { id: 'linear', fields: ['a', 'b'] },
  { id: 'quadratic', fields: ['a', 'b', 'c'] },
  { id: 'cubic', fields: ['a', 'b', 'c', 'd'] }
]

export function Equations({ t, locale }: { t: Translate; locale: string }) {
  const [degree, setDegree] = useState<EquationDegree>('quadratic')
  const [coefficients, setCoefficients] = useState<Record<string, string>>({})
  const [solution, setSolution] = useState<EquationSolution | null>(null)
  const [errorKey, setErrorKey] = useState('')

  const fields = DEGREES.find((item) => item.id === degree)?.fields ?? ['a', 'b', 'c']

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const outcome = solve(degree, fields.map((field) => coefficients[field] ?? ''))
    if (!outcome.ok) {
      setSolution(null)
      setErrorKey(`tool.calcCommon.error.${outcome.error === 'degenerate' ? 'range' : 'invalid'}`)
      return
    }
    setErrorKey('')
    setSolution(outcome)
  }

  const format = (value: number): string => new Intl.NumberFormat(locale, { maximumFractionDigits: 12 }).format(value)

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="equations-degree">{t('tool.equations.degree')}</label>
          <select
            id="equations-degree"
            value={degree}
            onChange={(event) => { setDegree(event.target.value as EquationDegree); setSolution(null); setErrorKey('') }}
          >
            {DEGREES.map((item) => <option key={item.id} value={item.id}>{t(`tool.equations.degree.${item.id}`)}</option>)}
          </select>
        </div>

        <div className="form-grid">
          {fields.map((field) => (
            <div className="field" key={field}>
              <label htmlFor={`equations-${field}`}>{t(`tool.equations.field.${field}`)}</label>
              <input
                id={`equations-${field}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={coefficients[field] ?? ''}
                onChange={(event) => setCoefficients({ ...coefficients, [field]: event.target.value })}
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

      {solution?.ok && (
        <div className="results" aria-live="polite">
          <dl>
            <div>
              <dt>{t('tool.equations.out.roots')}</dt>
              <dd>
                {solution.roots.length
                  ? solution.roots.map((root) => `x = ${format(root.value)}`).join('  ·  ')
                  : t('tool.equations.out.noRoots')}
              </dd>
            </div>
            {solution.discriminant !== null && (
              <div><dt>{t('tool.equations.out.discriminant')}</dt><dd>{format(solution.discriminant)}</dd></div>
            )}
            {solution.vertex !== null && (
              <div><dt>{t('tool.equations.out.vertex')}</dt><dd>{format(solution.vertex)}</dd></div>
            )}
            <div>
              <dt>{t('tool.equations.out.check')}</dt>
              <dd>
                {solution.roots.length
                  ? solution.roots.map((root) => format(root.check)).join('  ·  ')
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {solution?.ok && (
        <div className="settings-card stack">
          <h2>{t('tool.equations.out.steps')}</h2>
          <ol className="metadata-entries">
            {solution.steps.map((step) => (
              <li key={`${step.labelKey}-${step.detail}`}>
                <strong>{t(step.labelKey)}</strong>
                <code>{step.detail}</code>
              </li>
            ))}
          </ol>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note">{t('tool.equations.formulas')}</p>
        <h3>{t('tool.calcCommon.assumptions')}</h3>
        <p className="scan-note">{t('tool.equations.assumptions')}</p>
        <p className="scan-note">{t('tool.equations.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.equations.summary')}</p>
      <LocalBadge />
    </div>
  )
}
