import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  KEYPADS,
  SHEET_GROUPS,
  appendRpnToken,
  dropRpnToken,
  hasSecondPlane,
  isKeyEnabled,
  resolveKey,
  swapRpnTokens,
  type KeyDefinition,
  type KeypadMode
} from '@commietools/tools/calculator/keypad'
import { toMathML } from '@commietools/tools/calculator/render'
import { accuracyOf, appendHexDigit, appendSnippet, splitRpnTokens } from '../calculator-ui'

type Translate = (key: string) => string

/**
 * Der Rechenkern (mathjs, 89,5 KiB gzip) und der Verlaufsspeicher werden **dynamisch** geladen —
 * ein statischer Import hinge mathjs an das Startbündel (ADR 0003). Tastenfeld und 2D-Satz sind
 * dagegen reine Daten und dürfen statisch geladen werden: sie ziehen keinen Rechenkern nach.
 */
type CalculatorModule = typeof import('@commietools/tools/calculator/core')
type HistoryModule = typeof import('@commietools/tools/calculator/history')
/** Einstellungsdatensatz, direkt aus dem Speichermodul — keine zweite Typkopie. */
type CalculatorSettings = Parameters<HistoryModule['writeSettings']>[0]
type AngleMode = 'rad' | 'deg' | 'grad'
type NumberBase = 2 | 8 | 10 | 16
type UiMode = KeypadMode

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

const BASE_LABELS: Record<NumberBase, string> = { 2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX' }
const BASES: readonly NumberBase[] = [16, 10, 8, 2]
const WORD_SIZES: readonly number[] = [8, 16, 32, 64]

/** Die Rückschritt-Taste trägt ein Symbol statt eines Wortes. */
function KeyIcon({ id }: { id: string }) {
  if (id !== 'backspace') return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9L3 12z" />
      <path d="M12 9.5l5 5M17 9.5l-5 5" />
    </svg>
  )
}

export function Calculator({ t, locale }: { t: Translate; locale: string }) {
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
  const [twoDimensional, setTwoDimensional] = useState(true)
  const [second, setSecond] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [representationsOpen, setRepresentationsOpen] = useState(true)

  const [result, setResult] = useState('')
  const [resultRaw, setResultRaw] = useState('')
  /** Derselbe Wert in voller Rechengenauigkeit — Grundlage der Ampel, nie angezeigt. */
  const [resultFull, setResultFull] = useState('')
  /** Wahr, wenn für diese Rechnung automatisch das andere Zahlenmodell gerechnet hat. */
  const [autoModel, setAutoModel] = useState(false)
  /** Ampel: angeheftet per Klick (Tippen). Maus und Tastatur öffnen über CSS — siehe `styles.css`. */
  const [accuracyPinned, setAccuracyPinned] = useState(false)
  const [errorKey, setErrorKey] = useState('')

  /**
   * Ergebnis zurücksetzen — **alle** zusammengehörigen Werte. Ein vergessenes `full` ließe die
   * Ampel auf einer alten Rechnung stehen, und ein vergessenes `autoModel` zeigte einen Hinweis,
   * der nicht mehr gilt.
   */
  const clearResult = useCallback(() => {
    setResult('')
    setResultRaw('')
    setResultFull('')
    setAutoModel(false)
    setErrorKey('')
  }, [])
  const [copyStatus, setCopyStatus] = useState('')
  const [history, setHistory] = useState<readonly HistoryEntry[]>([])
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [variableName, setVariableName] = useState('')
  const [variableValue, setVariableValue] = useState('')

  /**
   * Dezimaltrenner der Sprache — **ein** Wert für Eingabe und Anzeige (Entscheidung 2026-10-04).
   * Der Rohwert (`raw`) trägt immer den Punkt und bleibt damit maschinenlesbar.
   */
  const decimalSeparator: ',' | '.' = locale === 'en' ? '.' : ','

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
        setTwoDimensional(settings.twoDimensional)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(
    () => ({ number: fractionMode ? ('Fraction' as const) : ('BigNumber' as const), angleMode, decimalSeparator }),
    [fractionMode, angleMode, decimalSeparator]
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

  /**
   * Gesetzter Satz **nur des Ergebnisses** (MathML aus dem Ausdrucksbaum). Die Eingabezeile bleibt
   * roher Text: sie bleibt damit kopierbar und immer lesbar — das Ergebnis steht darüber
   * (Entscheidung von Thomas, 2026-10-04). Was sich nicht setzen lässt — eine unbekannte Form, ein
   * Hexadezimalwert wie `F000` —, ergibt `null` und fällt auf den rohen Term zurück.
   */
  const twoDimResult = useMemo(() => {
    if (!core || !twoDimensional || !resultRaw) return null
    // Der 2D-Satz kennt keine Basisschreibweise: `F000` ist für den Ausdrucksbaum ein Name.
    // Statt eine falsche Zahl zu setzen, zeigt der Programmierer dann den rohen Term.
    if (mode === 'programmer' && base !== 10) return null
    try {
      const node = core.calculatorFor(options).parse(resultRaw.trim())
      return toMathML(node as never, resultRaw.trim(), decimalSeparator)
    } catch {
      return null
    }
  }, [core, twoDimensional, mode, base, options, resultRaw, decimalSeparator])

  /**
   * Ergebnis in der gewählten Anzeige-Basis. Die Auswahl „Anzeige-Basis" im Programmierer-Modus
   * ist eine Anzeige-Einstellung — sie muss auch das Ergebnis betreffen, nicht nur die
   * Darstellungstafel. Vorher stand bei aktivem HEX das Ergebnis `61440` statt `F000`.
   */
  const displayResult = useMemo(() => {
    if (!core || mode !== 'programmer' || base === 10 || !resultRaw) return result
    const converted = core.toBase(resultRaw, base, options)
    return converted.ok ? converted.display : result
  }, [core, mode, base, resultRaw, result, options])

  /**
   * Genauigkeitsampel. Sie bleibt aus, wo sie nicht ehrlich sein könnte:
   * **RPN** trägt die gerundete 14-Stellen-Darstellung von Schritt zu Schritt im Stapel weiter
   * (gemessen: `1/3 3 *` wäre dort `1`) — „vollständig" wäre eine Falschaussage. Im
   * **Programmierer-Modus** mit anderer Anzeige-Basis zeigt die Anzeige eine Schreibweise, nicht
   * den Wert. Beides steht so in der Übergabe, damit es nicht als Versehen gelesen wird.
   */
  const accuracy = useMemo(() => {
    if (!resultRaw || mode === 'rpn') return null
    if (mode === 'programmer' && base !== 10) return null
    return accuracyOf(resultRaw, resultFull)
  }, [resultRaw, resultFull, mode, base])

  const accuracyStateKey =
    accuracy === 'complete' ? 'tool.calculator.accuracyStateComplete' : 'tool.calculator.accuracyStateRounded'

  /** Zweidimensional nur, wenn der Ausdruck **und** ein vorhandenes Ergebnis gesetzt sind. */
  const showsTwoDim = Boolean(twoDimResult)

  /** RPN-Vorschau: Stapel und Rechenweg entstehen **live**, sonst wäre der Modus blind. */
  const rpn = useMemo(() => {
    if (!core || mode !== 'rpn') return null
    const tokens = splitRpnTokens(rpnInput)
    return tokens.length ? core.evaluateRpn(tokens, options, scope) : null
  }, [core, mode, rpnInput, options, scope])

  /** Darstellungen des Programmierer-Modus: andere Basen und der Wert in der Wortbreite. */
  const representations = useMemo(() => {
    if (!core || mode !== 'programmer' || !expression.trim()) return null
    const rows = BASES.map((item) => {
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
      void store.writeSettings({
        fractionMode, mode, angleMode, base, wordBits, signed, twoDimensional, ...patch
      })
    },
    [store, fractionMode, mode, angleMode, base, wordBits, signed, twoDimensional]
  )

  /**
   * Rechnen hängt **nicht** am lokalen Speicher: `store` versorgt nur Verlauf und Einstellungen.
   * Fehlt er (blockiertes IndexedDB, privates Fenster), muss `=` trotzdem rechnen — vorher tat es
   * stumm gar nichts, ohne Ergebnis und ohne Fehlermeldung.
   */
  const runCalculation = useCallback(
    async (input: string) => {
      if (!core) return
      let calculation = core.evaluate(input, options, scope)
      let usedOtherModel = false
      /**
       * Automatisches Ausweichen — **einmalig und sichtbar**. Das Bruch-Modell kann Wurzeln und
       * Winkelfunktionen nicht rechnen (`numberModel`). Statt den Nutzer stehen zu lassen, rechnet
       * der Rechner dieselbe Eingabe im Dezimal-Modell. Die Einstellung bleibt, wo sie war, und der
       * Hinweis dazu steht hinter der Ampel und unter dem Ergebnis.
       */
      if (!calculation.ok && calculation.error === 'numberModel') {
        const alternative = { ...options, number: fractionMode ? ('BigNumber' as const) : ('Fraction' as const) }
        const fallback = core.evaluate(input, alternative, scope)
        if (fallback.ok) {
          calculation = fallback
          usedOtherModel = true
        }
      }
      if (!calculation.ok) {
        clearResult()
        setErrorKey(`tool.calculator.error.${calculation.error ?? 'unsupported'}`)
        return
      }
      /**
       * **Kein Bruch nach dem Modellwechsel.** Hat automatisch das Dezimal-Modell gerechnet, ist
       * die Zahl kein exakter Bruch mehr: `toFraction` machte aus dem gerundeten `1.4142135623731`
       * den Scheinbruch `14142135623731/10000000000000` — eine Genauigkeit, die es nicht gibt.
       * Im Beleglauf am 2026-10-04 gefunden und hier behoben.
       */
      const display = fractionMode && !usedOtherModel ? core.toFraction(calculation.raw, options).display : calculation.display
      setResult(display)
      setResultRaw(calculation.raw)
      setResultFull(calculation.full)
      setAutoModel(usedOtherModel)
      setErrorKey('')
      setCopyStatus('')
      if (!store) return
      const entry: HistoryEntry = { expression: input.trim(), display, at: Date.now() }
      setHistory(await store.pushHistory(history, entry))
    },
    [core, store, fractionMode, options, scope, history]
  )

  /**
   * RPN rechnet über den **Tokenstapel**, nicht über den Ausdrucksleser. `=` im RPN-Modus muss
   * denselben Weg nehmen wie die Eingabetaste — vorher bekam der Ausdrucksleser die Zeichenkette
   * `3 4 + 5 *` und meldete „Der Ausdruck ist nicht lesbar".
   */
  const runRpn = useCallback(async () => {
    if (!core) return
    const tokens = splitRpnTokens(rpnInput)
    if (!tokens.length) return
    const outcome = core.evaluateRpn(tokens, options, scope)
    if (!outcome.ok) {
      clearResult()
      setErrorKey(`tool.calculator.error.${outcome.error ?? 'unsupported'}`)
      return
    }
    setResult(outcome.display)
    setResultRaw(outcome.raw)
    setResultFull(outcome.full)
    setAutoModel(false)
    setErrorKey('')
    setCopyStatus('')
    if (!store) return
    const entry: HistoryEntry = { expression: rpnInput.trim(), display: outcome.display, at: Date.now() }
    setHistory(await store.pushHistory(history, entry))
  }, [core, store, rpnInput, options, scope, history])

  /**
   * Rückfall ins Dezimal-Modell — **sichtbar**, nicht still. Im Bruch-Modell kann mathjs Wurzeln
   * und Winkelfunktionen nicht rechnen (gemessen: `sqrt(2)` und `sin(30)` → „Cannot implicitly
   * convert a Fraction to BigNumber"). Statt den Nutzer mit einer Meldung stehen zu lassen, rechnet
   * dieser Knopf dieselbe Eingabe im Dezimal-Modell und stellt das Modell dauerhaft um.
   */
  const retryInDecimal = () => {
    if (!core) return
    setFractionMode(false)
    saveSettings({ fractionMode: false })
    const calculation = core.evaluate(expression, { ...options, number: 'BigNumber' }, scope)
    if (!calculation.ok) {
      clearResult()
      setErrorKey(`tool.calculator.error.${calculation.error ?? 'unsupported'}`)
      return
    }
    setResult(calculation.display)
    setResultRaw(calculation.raw)
    setResultFull(calculation.full)
    setAutoModel(false)
    setErrorKey('')
    setCopyStatus('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'rpn') {
      void runRpn()
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

  const switchFraction = (fraction: boolean) => {
    setFractionMode(fraction)
    clearResult()
    saveSettings({ fractionMode: fraction })
  }

  const switchMode = (next: UiMode) => {
    setMode(next)
    clearResult()
    setSecond(false)
    setSheetOpen(false)
    saveSettings({ mode: next })
  }

  const switchAngle = (next: AngleMode) => {
    setAngleMode(next)
    clearResult()
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

  const switchDisplay = (twoD: boolean) => {
    setTwoDimensional(twoD)
    saveSettings({ twoDimensional: twoD })
  }

  const inputValue = mode === 'rpn' ? rpnInput : expression
  const setInputValue = mode === 'rpn' ? setRpnInput : setExpression

  /**
   * Schnipsel anhängen. In RPN mit Leerzeichen — dort wird an Leerraum zerlegt. Die
   * Ziffernbuchstaben `A`–`F` des Programmierer-Modus bekommen ihr `0x`: ohne Präfix wären sie
   * ein mathjs-Name und die Taste damit tot.
   */
  const appendToInput = (snippet: string) => {
    if (mode === 'rpn') {
      setRpnInput((current) => appendRpnToken(current, snippet))
      return
    }
    if (mode === 'programmer' && /^[A-F]$/u.test(snippet)) {
      setExpression((current) => appendHexDigit(current, snippet))
      return
    }
    setExpression((current) => appendSnippet(current, snippet))
  }

  /** Ein Tastendruck. Aktionstasten tragen keinen Schnipsel und werden über ihre Kennung geführt. */
  const pressKey = (definition: KeyDefinition) => {
    const { snippet } = resolveKey(definition, second)

    if (!snippet) {
      switch (definition.id) {
        case 'clear':
          setInputValue('')
          clearResult()
          break
        case 'backspace':
          setInputValue((current) => current.slice(0, -1))
          break
        case 'more':
          setSheetOpen((open) => !open)
          break
        case 'representations':
          setRepresentationsOpen((open) => !open)
          break
        case 'second':
          setSecond((active) => !active)
          break
        case 'ans':
          if (resultRaw) appendToInput(resultRaw)
          break
        case 'rpnSwap':
          setRpnInput((current) => swapRpnTokens(current))
          break
        case 'rpnDrop':
          setRpnInput((current) => dropRpnToken(current))
          break
        case 'equals':
          if (mode === 'rpn') void runRpn()
          else void runCalculation(expression)
          break
        default:
          break
      }
      return
    }

    appendToInput(snippet)
    // `2nd` gilt für **einen** Anschlag — sonst entstehen unbemerkte Folgefehler.
    if (second && hasSecondPlane(definition)) setSecond(false)
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('tool.calculator.copyDone')
    } catch {
      setCopyStatus('tool.calculator.copyFailed')
    }
  }

  useEffect(() => {
    if (!sheetOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sheetOpen])

  if (loadError) {
    return (
      <div className="stack">
        <p className="error" role="alert">{t('tool.calculator.error.unsupported')}</p>
      </div>
    )
  }

  const layout = KEYPADS[mode]

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
              onClick={() => switchFraction(false)}
            >
              {t('tool.calculator.numberBignumber')}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={fractionMode}
              className={fractionMode ? 'active' : ''}
              onClick={() => switchFraction(true)}
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
                  {BASES.map((item) => (
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
                  {WORD_SIZES.map((item) => (
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

        {/* Anzeige 1 (gesetzt) und Anzeige 2 (roher Term) — gleiche Höhe, ein Klick Unterschied. */}
        <div className={`calculator-display${showsTwoDim ? '' : ' raw'}`}>
          {showsTwoDim ? (
            <>
              {/* Ergebnis zuerst, rohe Eingabezeile darunter — in beiden Anzeigearten dieselbe
                  Reihenfolge, damit die Zeilen beim Umschalten nicht die Plätze tauschen. */}
              <div
                className="calculator-math-block"
                role="math"
                aria-label={result}
                dangerouslySetInnerHTML={{ __html: twoDimResult as string }}
              />
              <p className="expression-line">{inputValue || t('tool.calculator.placeholder')}</p>
            </>
          ) : (
            <>
              {displayResult && <p className="result-line">{displayResult}</p>}
              <p className="expression-line">{inputValue || t('tool.calculator.placeholder')}</p>
            </>
          )}

          <div className="calculator-flags">
            <span className={`calculator-flag${fractionMode ? '' : ' active'}`}>
              {fractionMode ? 'BRUCH' : 'DEZ'}
            </span>
            {mode === 'scientific' && <span className="calculator-flag active">{angleMode.toUpperCase()}</span>}
            {mode === 'programmer' && <span className="calculator-flag active">{BASE_LABELS[base]}</span>}
            {second && <span className="calculator-flag active">{t('tool.calculator.secondActive')}</span>}
            {accuracy && (
              <span className={`calculator-accuracy${accuracyPinned ? ' open' : ''}`}>
                {/* Das Zeichen trägt die Bedeutung; der Zustandstext steht im zugänglichen Namen,
                    damit Vorleser ihn ohne Öffnen haben. Die Erklärung selbst wird **über CSS**
                    auf `:hover` und `:focus-within` sichtbar — damit sie auch dann erscheint, wenn
                    ein Tastatur- oder Zeigereignis nicht als React-Ereignis ankommt (gemessen:
                    im headless-Browser kam beim Ansteuern kein Fokusereignis an). */}
                <button
                  type="button"
                  className={`accuracy-light ${accuracy}`}
                  aria-expanded={accuracyPinned}
                  aria-label={`${t('tool.calculator.accuracyLabel')}: ${t(accuracyStateKey)}`}
                  onClick={() => setAccuracyPinned((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setAccuracyPinned(false)
                  }}
                >
                  <span aria-hidden="true">{accuracy === 'complete' ? '=' : '≈'}</span>
                </button>
                <span className="accuracy-bubble" role="status">
                  <span className="accuracy-bubble-title">{t('tool.calculator.accuracyOpen')}</span>
                  <span><b aria-hidden="true">=</b> {t('tool.calculator.accuracyComplete')}</span>
                  <span><b aria-hidden="true">≈</b> {t('tool.calculator.accuracyRounded')}</span>
                  {autoModel && <span>{t('tool.calculator.accuracyModel')}</span>}
                </span>
              </span>
            )}
            <span className="calculator-display-tools">
              <button
                type="button"
                className="button calculator-icon-button"
                aria-label={t('tool.calculator.key.history')}
                onClick={() => {
                  document.getElementById('calculator-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M12 7v5l3 2" />
                  <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
                  <path d="M3 4v4h4" />
                </svg>
              </button>
              <span className="calculator-switch" role="group" aria-label={t('tool.calculator.display')}>
                <button
                  type="button"
                  aria-pressed={twoDimensional}
                  className={twoDimensional ? 'active' : ''}
                  aria-label={t('tool.calculator.display2d')}
                  onClick={() => switchDisplay(true)}
                >
                  <span className="fraction-glyph">1<i>2</i></span>
                </button>
                <button
                  type="button"
                  aria-pressed={!twoDimensional}
                  className={!twoDimensional ? 'active' : ''}
                  aria-label={t('tool.calculator.displayRaw')}
                  onClick={() => switchDisplay(false)}
                >
                  1/2
                </button>
              </span>
            </span>
          </div>
        </div>

        <div className="calculator-copy-row">
          <button type="button" className="button" onClick={() => void copyToClipboard(inputValue)}>
            {t('tool.calculator.copyExpression')}
          </button>
          <button type="button" className="button" onClick={() => void copyToClipboard(resultRaw || result)}>
            {t('tool.calculator.copyResult')}
          </button>
          {copyStatus && <span className="calculator-copy-status" role="status">{t(copyStatus)}</span>}
        </div>

        <div
          className="keypad"
          role="group"
          aria-label={t('tool.calculator.keypad')}
          style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}
        >
          {layout.rows.flatMap((row, rowIndex) =>
            row.map((definition, columnIndex) => {
              if (!definition) {
                return <span key={`gap-${rowIndex}-${columnIndex}`} className="keypad-gap" aria-hidden="true" />
              }
              const resolved = resolveKey(definition, second)
              const enabled = mode === 'programmer' ? isKeyEnabled(definition, base) : true
              const showSecond = second && hasSecondPlane(definition)
              const armed = (definition.id === 'second' && second) || (definition.id === 'more' && sheetOpen)
              return (
                <button
                  key={definition.id}
                  type="button"
                  className={`keypad-key ${definition.role}${armed ? ' armed' : ''}`}
                  style={{
                    gridColumn: definition.colSpan ? `span ${definition.colSpan}` : undefined,
                    gridRow: definition.rowSpan ? `span ${definition.rowSpan}` : undefined
                  }}
                  aria-label={definition.ariaKey ? t(definition.ariaKey) : resolved.label}
                  aria-pressed={definition.id === 'second' ? second : undefined}
                  disabled={!enabled}
                  onClick={() => pressKey(definition)}
                >
                  {showSecond ? (
                    <>
                      <span className="key-second">{definition.label}</span>
                      <span className="key-first">{resolved.label}</span>
                    </>
                  ) : definition.id === 'backspace' ? (
                    <KeyIcon id="backspace" />
                  ) : (
                    resolved.label
                  )}
                </button>
              )
            })
          )}
        </div>

        {sheetOpen && (
          <div className="calculator-sheet" role="group" aria-label={t('tool.calculator.moreFunctions')}>
            <div className="inline-field">
              <h3>{t('tool.calculator.moreFunctions')}</h3>
              <button type="button" className="button" onClick={() => setSheetOpen(false)}>
                {t('tool.calculator.sheet.close')}
              </button>
            </div>
            {SHEET_GROUPS.map((group) => (
              <div key={group.titleKey} className="calculator-sheet-group">
                <p>{t(group.titleKey)}</p>
                <div className="calculator-sheet-keys">
                  {group.entries.map((entry) => (
                    <button
                      key={entry.label}
                      type="button"
                      className="button"
                      onClick={() => {
                        appendToInput(entry.snippet)
                        setSheetOpen(false)
                      }}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
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
              {/* Nur bei diesem Fehler: der Weg heraus steht direkt daneben. */}
              {errorKey === 'tool.calculator.error.numberModel' && (
                <button type="button" className="button" onClick={retryInDecimal}>
                  {t('tool.calculator.retryDecimal')}
                </button>
              )}
            </>
          ) : (
            <>
              <dl>
                <div>
                  <dt>{t('tool.calculator.result')}</dt>
                  <dd>{result}</dd>
                </div>
              </dl>
              {/* Sichtbar ohne Öffnen: der stille Modellwechsel darf nicht übersehen werden. */}
              {autoModel && <p className="scan-note">{t('tool.calculator.accuracyModel')}</p>}
            </>
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

      {mode === 'programmer' && representationsOpen && representations && (
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

      <div className="settings-card stack" id="calculator-history">
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
