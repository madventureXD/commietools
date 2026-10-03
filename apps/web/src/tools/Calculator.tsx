import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'

type Translate = (key: string) => string

/**
 * Der Rechenkern (mathjs, 89,5 KiB gzip) und der Verlaufsspeicher werden **dynamisch** geladen.
 * Ein statischer Import hinge mathjs an das Startbündel — genau der Fehler, der bei den
 * PDF-Engines behoben wurde (ADR 0003).
 */
type CalculatorModule = typeof import('@commietools/tools/calculator/core')
type HistoryModule = typeof import('@commietools/tools/calculator/history')

interface HistoryEntry {
  readonly expression: string
  readonly display: string
  readonly at: number
}

export function Calculator({ t }: { t: Translate }) {
  const [core, setCore] = useState<CalculatorModule | null>(null)
  const [store, setStore] = useState<HistoryModule | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [expression, setExpression] = useState('')
  const [fractionMode, setFractionMode] = useState(false)
  const [result, setResult] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [history, setHistory] = useState<readonly HistoryEntry[]>([])
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [variableName, setVariableName] = useState('')
  const [variableValue, setVariableValue] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('@commietools/tools/calculator/core'),
      import('@commietools/tools/calculator/history')
    ])
      .then(async ([coreModule, historyModule]) => {
        if (cancelled) return
        setCore(coreModule)
        setStore(historyModule)
        const [savedHistory, savedVariables, settings] = await Promise.all([
          historyModule.readHistory(),
          historyModule.readVariables(),
          historyModule.readSettings()
        ])
        if (cancelled) return
        setHistory(savedHistory)
        setVariables(savedVariables)
        setFractionMode(settings.fractionMode)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(() => ({ number: fractionMode ? ('Fraction' as const) : ('BigNumber' as const) }), [fractionMode])

  /** Variablen als Auswertungs-Scope: der Wert wird beim Setzen bereits geprüft und geparst. */
  const scope = useMemo(() => {
    if (!core) return {}
    const entries = Object.entries(variables).flatMap(([name, value]) => {
      const parsed = core.evaluate(value, options)
      return parsed.ok && name.trim() ? [[name, parsed.raw] as const] : []
    })
    return Object.fromEntries(entries) as Record<string, unknown>
  }, [core, variables, options])

  const runCalculation = useCallback(
    async (input: string) => {
      if (!core || !store) return
      const calculation = fractionMode
        ? core.evaluate(input, options, scope)
        : core.evaluate(input, options, scope)
      if (!calculation.ok) {
        setResult('')
        setErrorKey(`tool.calculator.error.${calculation.error ?? 'unsupported'}`)
        return
      }
      const display = fractionMode ? core.toFraction(calculation.raw, options).display : calculation.display
      setResult(display)
      setErrorKey('')
      const entry: HistoryEntry = { expression: input.trim(), display, at: Date.now() }
      setHistory(await store.pushHistory(history, entry))
    },
    [core, store, fractionMode, options, scope, history]
  )

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void runCalculation(expression)
  }

  const addVariable = async () => {
    if (!core || !store) return
    const name = variableName.trim()
    if (!name) return
    const parsed = core.evaluate(variableValue || '0', options)
    if (!parsed.ok) {
      setErrorKey('tool.calculator.error.syntax')
      return
    }
    const next = { ...variables, [name]: parsed.raw }
    setVariables(next)
    await store.writeVariables(next)
    setVariableName('')
    setVariableValue('')
    setErrorKey('')
  }

  const removeVariable = async (name: string) => {
    if (!store) return
    const next = { ...variables }
    delete next[name]
    setVariables(next)
    await store.writeVariables(next)
  }

  const clearHistory = async () => {
    if (!store) return
    setHistory(await store.clearHistory())
  }

  const switchMode = async (fraction: boolean) => {
    setFractionMode(fraction)
    setResult('')
    setErrorKey('')
    if (store) await store.writeSettings({ fractionMode: fraction })
  }

  if (loadError) {
    return (
      <div className="stack">
        <p className="error" role="alert">{t('tool.calculator.error.unsupported')}</p>
      </div>
    )
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="calculator-expression">{t('tool.calculator.expression')}</label>
          <input
            id="calculator-expression"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('tool.calculator.placeholder')}
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
          />
        </div>

        <div className="field">
          <span>{t('tool.calculator.mode')}</span>
          <div className="segment-list" role="radiogroup" aria-label={t('tool.calculator.mode')}>
            <button
              type="button"
              role="radio"
              aria-checked={!fractionMode}
              className={!fractionMode ? 'active' : ''}
              onClick={() => void switchMode(false)}
            >
              {t('tool.calculator.modeStandard')}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={fractionMode}
              className={fractionMode ? 'active' : ''}
              onClick={() => void switchMode(true)}
            >
              {t('tool.calculator.modeFraction')}
            </button>
          </div>
        </div>

        <button type="submit" disabled={!core}>{t('tool.calculator.calculate')}</button>
      </form>

      {(result || errorKey) && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.calculator.result')}</h2>
          {errorKey ? <p className="error" role="alert">{t(errorKey)}</p> : <p className="result-value">{result}</p>}
        </div>
      )}

      <div className="settings-card stack">
        <h2>{t('tool.calculator.variables')}</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="calculator-variable-name">{t('tool.calculator.variableName')}</label>
            <input
              id="calculator-variable-name"
              type="text"
              value={variableName}
              onChange={(event) => setVariableName(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="calculator-variable-value">{t('tool.calculator.variableValue')}</label>
            <input
              id="calculator-variable-value"
              type="text"
              value={variableValue}
              onChange={(event) => setVariableValue(event.target.value)}
            />
          </div>
        </div>
        <button type="button" onClick={() => void addVariable()}>{t('tool.calculator.addVariable')}</button>
        {Object.entries(variables).length > 0 && (
          <ul className="metadata-entries">
            {Object.entries(variables).map(([name, value]) => (
              <li key={name}>
                <code>{name} = {value}</code>
                <button type="button" onClick={() => void removeVariable(name)}>{t('tool.calculator.removeVariable')}</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="settings-card stack">
        <h2>{t('tool.calculator.history')}</h2>
        {history.length === 0 ? (
          <p className="scan-note">{t('tool.calculator.historyEmpty')}</p>
        ) : (
          <>
            <ul className="metadata-entries">
              {history.map((entry) => (
                <li key={`${entry.at}-${entry.expression}`}>
                  <code>{entry.expression} = {entry.display}</code>
                  <button type="button" onClick={() => setExpression(entry.expression)}>{t('tool.calculator.reuse')}</button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => void clearHistory()}>{t('tool.calculator.clearHistory')}</button>
          </>
        )}
      </div>

      <details className="settings-card">
        <summary>{t('tool.calculator.formula')}</summary>
        <p className="scan-note">{t('tool.calculator.formulaText')}</p>
        <p className="scan-note">{t('tool.calculator.formulaNumber')}</p>
        <p className="scan-note">{t('tool.calculator.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.calculator.exactNote')}</p>
      <LocalBadge />
    </div>
  )
}
