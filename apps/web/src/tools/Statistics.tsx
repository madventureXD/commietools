import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { regress, regressionText, summarise, type StatisticsResult } from '@commietools/tools/calculator/statistics'

type Translate = (key: string) => string

const MODES = ['summary', 'regression'] as const
type Mode = (typeof MODES)[number]

/** Anzeigereihenfolge der Kennwerte — fest, damit sie nicht von der Objektordnung abhängt. */
const SUMMARY_KEYS = [
  'count', 'sum', 'mean', 'median', 'q1', 'q3', 'iqr', 'min', 'max', 'range',
  'deviationSample', 'deviationPopulation', 'varianceSample', 'variancePopulation',
  'lowerFence', 'upperFence', 'modeCount', 'modes'
] as const

const REGRESSION_KEYS = ['count', 'meanX', 'meanY', 'slope', 'intercept', 'line', 'correlation', 'rSquared', 'sumX', 'sumY'] as const

export function Statistics({ t, locale }: { t: Translate; locale: string }) {
  const [mode, setMode] = useState<Mode>('summary')
  const [data, setData] = useState('')
  const [pairs, setPairs] = useState('')
  const [result, setResult] = useState<StatisticsResult | null>(null)
  const [line, setLine] = useState('')
  const [errorKey, setErrorKey] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'summary') {
      const outcome = summarise(data)
      if (!outcome.ok) {
        setResult(null)
        setLine('')
        setErrorKey(`tool.calcCommon.error.${outcome.error === 'empty' ? 'empty' : 'invalid'}`)
        return
      }
      setErrorKey('')
      setLine('')
      setResult(outcome)
      return
    }
    const outcome = regress(pairs)
    if (!outcome.ok) {
      setResult(null)
      setLine('')
      setErrorKey(`tool.calcCommon.error.${outcome.error === 'empty' ? 'empty' : outcome.error === 'range' ? 'range' : 'invalid'}`)
      return
    }
    setErrorKey('')
    setLine(regressionText(outcome.slope, outcome.intercept))
    setResult(outcome)
  }

  const format = (value: number | undefined): string => {
    if (value === undefined || !Number.isFinite(value)) return '—'
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 12 }).format(value)
  }

  const keys = mode === 'summary' ? SUMMARY_KEYS : REGRESSION_KEYS

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="statistics-mode">{t('tool.statistics.mode')}</label>
          <select
            id="statistics-mode"
            value={mode}
            onChange={(event) => { setMode(event.target.value as Mode); setResult(null); setLine(''); setErrorKey('') }}
          >
            {MODES.map((item) => <option key={item} value={item}>{t(`tool.statistics.mode.${item}`)}</option>)}
          </select>
        </div>

        {mode === 'summary' ? (
          <div className="field">
            <label htmlFor="statistics-data">{t('tool.statistics.field.data')}</label>
            <textarea id="statistics-data" rows={5} spellCheck={false} value={data} onChange={(event) => setData(event.target.value)} />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="statistics-pairs">{t('tool.statistics.field.pairs')}</label>
            <textarea id="statistics-pairs" rows={5} spellCheck={false} placeholder={'1 2\n2 4\n3 6'} value={pairs} onChange={(event) => setPairs(event.target.value)} />
          </div>
        )}

        <button type="submit">{t('tool.calcCommon.calculate')}</button>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.calcCommon.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {result?.ok && (
        <div className="results" aria-live="polite">
          <dl>
            {keys.map((key) => (
              <div key={key}>
                <dt>{t(`tool.statistics.out.${key}`)}</dt>
                <dd>{key === 'line' ? line : format(result.values[key])}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {result?.ok && result.ignored.length > 0 && (
        <p className="scan-note">{t('tool.statistics.note.ignored')} {result.ignored.join(', ')}</p>
      )}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note">{t('tool.statistics.formulas')}</p>
        <h2>{t('tool.calcCommon.assumptions')}</h2>
        <p className="scan-note">{t('tool.statistics.assumptions')}</p>
        <p className="scan-note">{t('tool.statistics.note.spread')}</p>
        <p className="scan-note">{t('tool.statistics.note.quartile')}</p>
        <p className="scan-note">{t('tool.statistics.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.statistics.summary')}</p>
      <LocalBadge />
    </div>
  )
}
