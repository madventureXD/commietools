import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { PROGRAMMER_BASES, PROGRAMMER_WORD_SIZES, appendSnippet, splitRpnTokens } from '../calculator-ui'

type Translate = (key: string) => string

/**
 * Der Rechenkern (mathjs, 89,5 KiB gzip) und der Verlaufsspeicher werden **dynamisch** geladen.
 * Ein statischer Import hinge mathjs an das Startbündel — genau der Fehler, der bei den
 * PDF-Engines behoben wurde (ADR 0003).
 */
type CalculatorModule = typeof import('@commietools/tools/calculator/core')
type HistoryModule = typeof import('@commietools/tools/calculator/history')
/** Einstellungsdatensatz, direkt aus dem Speichermodul — keine zweite Typkopie. */
type CalculatorSettings = Parameters<HistoryModule['writeSettings']>[0]
type AngleMode = 'rad' | 'deg' | 'grad'
type NumberBase = 2 | 8 | 10 | 16
type UiMode = 'standard' | 'scientific' | 'programmer' | 'rpn'

interface HistoryEntry {
  readonly expression: string
  readonly display: string
  readonly at: number
}

/** Rechnerarten der Oberfläche. Die Beschriftungen kommen aus den Sprachkatalogen. */
const MODES: readonly { readonly value: UiMode; readonly key: string }[] = [
  { value: 'standard', key: 'tool.calculator.modeStandard' },
  { value: 'scientific', key: 'tool.calculator.modeScientific' },
  { value: 'programmer', key: 'tool.calculator.modeProgrammer' },
  { value: 'rpn', key: 'tool.calculator.modeRpn' }
]

const ANGLES: readonly { readonly value: AngleMode; readonly key: string }[] = [
  { value: 'rad', key: 'tool.calculator.angleRad' },
  { value: 'deg', key: 'tool.calculator.angleDeg' },
  { value: 'grad', key: 'tool.calculator.angleGrad' }
]

const BASE_LABELS: Record<NumberBase, string> = {
  2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX'
}

/** Funktionsnamen als Schnipsel — Bezeichner, keine Anzeigetexte. */
const SCIENTIFIC_KEYS: readonly string[] = [
  'sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'atan2(',
  'sinh(', 'cosh(', 'tanh(', 'log2(', 'log10(', 'log(', 'exp(',
  'sqrt(', 'pow(', 'abs(', 'round(', 'floor(', 'ceil(', 'fix(',
  'factorial(', 'combinations(', 'permutations(', 'max(', 'min(', 'sum(', 'gcd(', 'lcm(', 'mod(', 'pi', 'e'
]

/** Bitoperationen: eingefügt wird der mathjs-Name, angezeigt die vertraute Schreibweise. */
const PROGRAMMER_KEYS: readonly { readonly label: string; readonly snippet: string }[] = [
  { label: 'AND', snippet: ' bitAnd ' },
  { label: 'OR', snippet: ' bitOr ' },
  { label: 'XOR', snippet: ' bitXor ' },
  { label: 'NOT', snippet: 'bitNot(' },
  { label: '<<', snippet: ' leftShift ' },
  { label: '>>', snippet: ' rightArithShift ' }
]

const RPN_KEYS: readonly { readonly label: string; readonly snippet: string }[] = [
  { label: '+', snippet: '+' }, { label: '-', snippet: '-' },
  { label: '×', snippet: '*' }, { label: '÷', snippet: '/' },
  { label: 'xʸ', snippet: '^' }, { label: 'mod', snippet: 'mod' },
  { label: '±', snippet: 'neg' }, { label: '√', snippet: 'sqrt' },
  { label: '1/x', snippet: 'inv' }, { label: 'n!', snippet: 'fact' }
]

export function Calculator({ t }: { t: Translate }) {
  const [core, setCore] = useState<CalculatorModule | null>(null)
  const [store, setStore] = useState<HistoryModule | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [expression, setExpression] = useState('')
  const [rpnInput, setRpnInput] = useState('')
  const [mode, setMode] = useState<UiMode>('standard')
  const [fractionMode, setFractionMode] = useState(false)
  const [angleMode, setAngleMode] = useState<AngleMode>('rad')
  const [base, setBase] = useState<NumberBase>(16)
  const [wordBits, setWordBits] = useState(32)
  const [signed, setSigned] = useState(true)

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
        setMode(settings.mode)
        setAngleMode(settings.angleMode)
        setBase(settings.base)
        setWordBits(settings.wordBits)
        setSigned(settings.signed)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(
    () => ({ number: fractionMode ? ('Fraction' as const) : ('BigNumber' as const), angleMode }),
    [fractionMode, angleMode]
  )

  /** Variablen als Auswertungs-Scope: der Wert wird beim Setzen bereits geprüft und geparst. */
  const scope = useMemo(() => {
    if (!core) return {}
    const entries = Object.entries(variables).flatMap(([name, value]) => {
      const parsed = core.evaluate(value, options)
      return parsed.ok && name.trim() ? [[name, parsed.raw] as const] : []
    })
    return Object.fromEntries(entries) as Record<string, unknown>
  }, [core, variables, options])

  /** RPN-Vorschau: Stapel und Rechenweg entstehen **live**, sonst wäre der Modus blind. */
  const rpn = useMemo(() => {
    if (!core || mode !== 'rpn') return null
    const tokens = splitRpnTokens(rpnInput)
    return tokens.length ? core.evaluateRpn(tokens, options, scope) : null
  }, [core, mode, rpnInput, options, scope])

  /** Darstellungen des Programmierer-Modus: andere Basen und der Wert in der Wortbreite. */
  const representations = useMemo(() => {
    if (!core || mode !== 'programmer' || !expression.trim()) return null
    const rows = PROGRAMMER_BASES.map((item) => {
      const value = item === 10 ? core.evaluate(expression, options, scope) : core.toBase(expression, item, options)
      return { base: item, text: value.ok ? value.display : '—' }
    })
    const word = core.toWord(expression, wordBits, signed, options)
    return { rows, word }
  }, [core, mode, expression, options, scope, wordBits, signed])

  /**
   * Einstellungen vollständig schreiben: `writeSettings` ersetzt den Datensatz, ein Teilobjekt
   * würde die übrigen Werte verlieren. `patch` ist der gerade geänderte Wert — der State ist zu
   * diesem Zeitpunkt noch alt.
   */
  const saveSettings = useCallback(
    (patch: Partial<CalculatorSettings>) => {
      if (!store) return
      void store.writeSettings({ fractionMode, mode, angleMode, base, wordBits, signed, ...patch })
    },
    [store, fractionMode, mode, angleMode, base, wordBits, signed]
  )

  const runCalculation = useCallback(
    async (input: string) => {
      if (!core || !store) return
      const calculation = core.evaluate(input, options, scope)
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
    if (mode === 'rpn') {
      const tokens = splitRpnTokens(rpnInput)
      const outcome = rpn ?? (core && tokens.length ? core.evaluateRpn(tokens, options, scope) : null)
      if (!outcome) return
      if (!outcome.ok) {
        setResult('')
        setErrorKey(`tool.calculator.error.${outcome.error ?? 'unsupported'}`)
        return
      }
      setResult(outcome.display)
      setErrorKey('')
      if (store) {
        const entry: HistoryEntry = { expression: rpnInput.trim(), display: outcome.display, at: Date.now() }
        void store.pushHistory(history, entry).then(setHistory)
      }
      return
    }
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

  const switchFraction = async (fraction: boolean) => {
    setFractionMode(fraction)
    setResult('')
    setErrorKey('')
    saveSettings({ fractionMode: fraction })
  }

  const switchMode = (next: UiMode) => {
    setMode(next)
    setResult('')
    setErrorKey('')
    saveSettings({ mode: next })
  }

  const switchAngle = (next: AngleMode) => {
    setAngleMode(next)
    setResult('')
    saveSettings({ angleMode: next })
  }

  const switchBase = (next: NumberBase) => {
    setBase(next)
    saveSettings({ base: next })
  }

  const switchWordBits = (next: number) => {
    setWordBits(next)
    saveSettings({ wordBits: next })
  }

  const switchSigned = (next: boolean) => {
    setSigned(next)
    saveSettings({ signed: next })
  }

  /** Anhängen eines Schnipsels an das jeweils sichtbare Eingabefeld. */
  const insert = (snippet: string) => {
    if (mode === 'rpn') {
      setRpnInput((current) => appendSnippet(current, snippet))
      return
    }
    setExpression((current) => appendSnippet(current, snippet))
  }

  if (loadError) {
    return (
      <div className="stack">
        <p className="error" role="alert">{t('tool.calculator.error.unsupported')}</p>
      </div>
    )
  }

  const inputValue = mode === 'rpn' ? rpnInput : expression
  const setInputValue = mode === 'rpn' ? setRpnInput : setExpression

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <span id="calculator-mode-label">{t('tool.calculator.mode')}</span>
          <div className="segmented" role="radiogroup" aria-labelledby="calculator-mode-label">
            {MODES.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={mode === item.value}
                className={mode === item.value ? 'active' : ''}
                onClick={() => switchMode(item.value)}
              >
                {t(item.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span id="calculator-number-label">{t('tool.calculator.numberMode')}</span>
          <div className="segmented" role="radiogroup" aria-labelledby="calculator-number-label">
            <button
              type="button"
              role="radio"
              aria-checked={!fractionMode}
              className={!fractionMode ? 'active' : ''}
              onClick={() => void switchFraction(false)}
            >
              {t('tool.calculator.numberBignumber')}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={fractionMode}
              className={fractionMode ? 'active' : ''}
              onClick={() => void switchFraction(true)}
            >
              {t('tool.calculator.numberFraction')}
            </button>
          </div>
        </div>

        {mode === 'scientific' && (
          <div className="field">
            <span id="calculator-angle-label">{t('tool.calculator.angleMode')}</span>
            <div className="segmented" role="radiogroup" aria-labelledby="calculator-angle-label">
              {ANGLES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={angleMode === item.value}
                  className={angleMode === item.value ? 'active' : ''}
                  onClick={() => switchAngle(item.value)}
                >
                  {t(item.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'programmer' && (
          <>
            <div className="form-grid">
              <div className="field">
                <span id="calculator-base-label">{t('tool.calculator.base')}</span>
                <div className="segmented" role="radiogroup" aria-labelledby="calculator-base-label">
                  {PROGRAMMER_BASES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={base === item}
                      className={base === item ? 'active' : ''}
                      onClick={() => switchBase(item)}
                    >
                      {BASE_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <span id="calculator-word-label">{t('tool.calculator.wordSize')}</span>
                <div className="segmented" role="radiogroup" aria-labelledby="calculator-word-label">
                  {PROGRAMMER_WORD_SIZES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={wordBits === item}
                      className={wordBits === item ? 'active' : ''}
                      onClick={() => switchWordBits(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="field">
              <span id="calculator-sign-label">{t('tool.calculator.wordSigned')}</span>
              <div className="segmented" role="radiogroup" aria-labelledby="calculator-sign-label">
                <button
                  type="button"
                  role="radio"
                  aria-checked={signed}
                  className={signed ? 'active' : ''}
                  onClick={() => switchSigned(true)}
                >
                  {t('tool.calculator.wordSignedYes')}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={!signed}
                  className={!signed ? 'active' : ''}
                  onClick={() => switchSigned(false)}
                >
                  {t('tool.calculator.wordSignedNo')}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="calculator-expression">
            {mode === 'rpn' ? t('tool.calculator.rpnTokens') : t('tool.calculator.expression')}
          </label>
          <input
            id="calculator-expression"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={mode === 'rpn' ? t('tool.calculator.rpnPlaceholder') : t('tool.calculator.placeholder')}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </div>

        {mode === 'scientific' && (
          <div className="field">
            <span>{t('tool.calculator.functions')}</span>
            <div className="segmented">
              {SCIENTIFIC_KEYS.map((snippet) => (
                <button key={snippet} type="button" onClick={() => insert(snippet)}>{snippet.replace(/\($/u, '')}</button>
              ))}
            </div>
          </div>
        )}

        {mode === 'programmer' && (
          <div className="field">
            <span>{t('tool.calculator.bitOperations')}</span>
            <div className="segmented">
              {PROGRAMMER_KEYS.map((item) => (
                <button key={item.label} type="button" onClick={() => insert(item.snippet)}>{item.label}</button>
              ))}
            </div>
          </div>
        )}

        {mode === 'rpn' && (
          <div className="field">
            <span>{t('tool.calculator.rpnKeys')}</span>
            <div className="segmented">
              {RPN_KEYS.map((item) => (
                <button key={item.label} type="button" onClick={() => insert(item.snippet)}>{item.label}</button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={!core}>{t('tool.calculator.calculate')}</button>
      </form>

      {(result || errorKey) && (
        <div className="results" aria-live="polite">
          {errorKey ? (
            <>
              <h2>{t('tool.calculator.result')}</h2>
              <p className="error" role="alert">{t(errorKey)}</p>
            </>
          ) : (
            <dl>
              <div>
                <dt>{t('tool.calculator.result')}</dt>
                <dd>{result}</dd>
              </div>
            </dl>
          )}
        </div>
      )}

      {mode === 'rpn' && (
        <div className="settings-card stack">
          <h2>{t('tool.calculator.rpnStack')}</h2>
          {rpn && rpn.stack.length > 0 ? (
            <ul className="metadata-entries">
              {[...rpn.stack].reverse().map((value, index) => (
                <li key={`${index}-${value}`}><code>{value}</code></li>
              ))}
            </ul>
          ) : (
            <p className="scan-note">{t('tool.calculator.rpnStackEmpty')}</p>
          )}
          {rpn && rpn.steps.length > 0 && (
            <>
              <h2>{t('tool.calculator.rpnSteps')}</h2>
              <ul className="metadata-entries">
                {rpn.steps.map((step, index) => (
                  <li key={`${index}-${step.expression}`}>
                    <code>{step.expression} = {step.result}</code>
                    <span className="scan-note">[{step.stack.join(' ')}]</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {mode === 'programmer' && representations && (
        <div className="settings-card stack">
          <h2>{t('tool.calculator.representations')}</h2>
          <dl className="metadata-entries">
            {representations.rows.map((row) => (
              <div key={row.base}>
                <dt>{BASE_LABELS[row.base]}</dt>
                <dd><code>{row.text}</code></dd>
              </div>
            ))}
            <div>
              <dt>{wordBits} Bit · {signed ? t('tool.calculator.wordSignedYes') : t('tool.calculator.wordSignedNo')}</dt>
              <dd><code>{representations.word.ok ? representations.word.display : '—'}</code></dd>
            </div>
          </dl>
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
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'rpn') setRpnInput(entry.expression)
                      else setExpression(entry.expression)
                    }}
                  >
                    {t('tool.calculator.reuse')}
                  </button>
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
        <p className="scan-note">{t('tool.calculator.formulaAngle')}</p>
        <p className="scan-note">{t('tool.calculator.formulaProgrammer')}</p>
        <p className="scan-note">{t('tool.calculator.formulaRpn')}</p>
        <p className="scan-note">{t('tool.calculator.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.calculator.exactNote')}</p>
      <LocalBadge />
    </div>
  )
}
