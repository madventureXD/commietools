/**
 * Der **gemeinsame Rahmen** der vier Rechenarten.
 *
 * Warum es ihn gibt: `Calculator.tsx` bestand zu rund drei Vierteln aus Teilen, die alle vier
 * Rechenarten gleich brauchen (Anzeige in zwei Zuständen, Tastenfeld-Ausgabe, Kopieren, Ergebnis,
 * Verlauf, Variablen, Formel und Quelle, Laden und Speichern). Vier Werkzeuge, die das jeweils
 * abschreiben, ergäben **mehr** Code statt weniger. Der Rahmen steht deshalb einmal hier, und jede
 * Rechenart belegt ihn mit ihrem Tastenfeld, ihren Einstellungen und ihren Texten
 * (Entscheidung 2026-10-04: ein Werkzeug je Rechenart, Rahmen geteilt).
 *
 * **Was der Rahmen nicht mehr kennt:** die Rechenart als Zustand. Es gibt kein `mode`, keinen
 * Umschalter, kein Feld `mode` in den Einstellungen. Was eine Rechenart zusätzlich braucht,
 * deklariert sie in ihrem `CalculatorFrameSpec` — als Fähigkeit, nicht als Verzweigung.
 *
 * Der Rechenkern (mathjs, 89,5 KiB gzip) und der Verlaufsspeicher werden **dynamisch** geladen —
 * ein statischer Import hinge mathjs an das Startbündel (ADR 0003).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  hasSecondPlane,
  isKeyEnabled,
  resolveKey,
  type KeyDefinition,
  type KeypadLayout,
  type SheetGroup
} from '@commietools/tools/calculator/keypad'
import {
  parseRpnInput,
  rpnActionForSnippet,
  rpnInputReducer,
  rpnInputText,
  type RpnInputAction,
  type RpnInputState
} from '@commietools/tools/calculator/rpnInput'
import { toMathML } from '@commietools/tools/calculator/render'
import { calculatorStore, type CalculatorSettings, type HistoryEntry } from '@commietools/tools/calculator/history'
import { accuracyOf, appendHexDigit, appendSnippet, splitRpnTokens } from '../calculator-ui'

type Translate = (key: string) => string
type CoreModule = typeof import('@commietools/tools/calculator/core')
type Options = Parameters<CoreModule['evaluate']>[1]

/** Zahlensysteme der Anzeige-Basis. */
export type NumberBase = 2 | 8 | 10 | 16
/** Winkelmodi des wissenschaftlichen Rechners. */
export type AngleMode = 'rad' | 'deg' | 'grad'

/**
 * Einstellungen **einer** Rechenart. Der Rahmen hält den Datensatz und schreibt ihn; welche Felder
 * eine Rechenart überhaupt anzeigt, entscheidet sie selbst (`renderSettings`).
 */
export interface CalculatorState {
  readonly fractionMode: boolean
  readonly angleMode: AngleMode
  readonly base: NumberBase
  readonly wordBits: number
  readonly signed: boolean
  readonly twoDimensional: boolean
  /** Ändert einen Wert **und** schreibt den vollständigen Datensatz in den Speicher. */
  readonly set: (patch: Partial<CalculatorSettings>) => void
}

/** Was eine Zusatztafel von der Rechenart erfährt — Kern und Einstellungen inbegriffen. */
export interface PanelInfo {
  readonly core: CoreModule
  readonly options: Options
  readonly state: CalculatorState
  readonly input: string
  readonly result: string
  readonly resultRaw: string
}

/** Was eine Rechenart in den Rahmen hineingibt. */
export interface CalculatorFrameSpec {
  /** Speicherkennung — eigener Verlauf, eigene Variablen, eigene Einstellungen (Entscheidung 1). */
  readonly storageKey: string
  readonly layout: KeypadLayout
  /** `expression`: ein Ausdruck wird ausgewertet. `rpn`: eine Tokenfolge über den Stapel. */
  readonly input: 'expression' | 'rpn'
  /** Blatt „Weitere Funktionen"; `null` lässt Taste und Tafel weg (das RPN-Feld hat keine). */
  readonly sheet: readonly SheetGroup[] | null
  /** Bietet den Umschalter des Zahlenmodells? Der Programmierer- und der RPN-Rechner nicht. */
  readonly numberModelSwitch: boolean
  readonly settingsDefaults?: Partial<CalculatorSettings>
  /** Genauigkeitsampel: nie, immer, oder nur wo die Anzeige den Wert selbst zeigt. */
  readonly accuracy: 'never' | 'always'
  accuracyAllowed?: (state: CalculatorState) => boolean
  /** Darf die zweidimensionale Anzeige arbeiten? Der Programmierer nur in Basis 10. */
  allowTwoDim?: (state: CalculatorState) => boolean
  /** Bezeichnung und Platzhalter des Eingabefelds — Vorgabe: der gemeinsame Ausdruck. */
  readonly labelKey?: string
  readonly placeholderKey?: string
  /** Eigener Rechenregel-Text dieser Rechenart (Pflicht: Abschnitt „Formel und Quelle"). */
  readonly rulesKey: string
  /** Eigene Einstellungsfelder; der Zustand kommt aus dem Rahmen. */
  renderSettings?: (state: CalculatorState) => ReactNode
  /** Eigene Kennzeichen in der Anzeige (Winkelmodus, Anzeige-Basis). */
  renderFlags?: (state: CalculatorState) => ReactNode
  /** Zusatztafeln unter dem Ergebnis (Programmiererrechner: Darstellungen der Basen). */
  renderPanels?: (info: PanelInfo) => ReactNode
  /** Formt das angezeigte Ergebnis um (Programmiererrechner: andere Anzeige-Basis). */
  displayResult?: (core: CoreModule, options: Options, state: CalculatorState, result: string, resultRaw: string) => string
  /** Hängt ein Tasten-Schnipsel an die Eingabe (Programmierer: Ziffernbuchstaben `A`–`F`). */
  appendSnippet?: (current: string, snippet: string) => string
}

const BASES: readonly NumberBase[] = [16, 10, 8, 2]
const BASE_LABELS: Record<NumberBase, string> = { 2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX' }

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

/** Kennzeichen der Anzeige-Basis — auch die Anzeige des Programmierers nutzt diese Beschriftungen. */
export function baseLabel(base: NumberBase): string {
  return BASE_LABELS[base]
}

/** Die vier Basen des Programmiererrechners, für dessen Einstellungsfeld. */
export const CALCULATOR_BASES: readonly NumberBase[] = BASES

export function CalculatorFrame({ spec, t, locale }: { spec: CalculatorFrameSpec; t: Translate; locale: string }) {
  /**
   * Der Speicher wird **einmal je Kennung** gebaut: die Vorgabewerte einer Rechenart kommen aus
   * einer festen Referenz, sonst ergäbe ein bei jedem Rendern neu gebildetes Objekt einen neuen
   * Speicher — und das Laden liefe in eine Endlosschleife.
   */
  const settingsDefaults = useRef(spec.settingsDefaults)
  const store = useMemo(() => calculatorStore(spec.storageKey, settingsDefaults.current), [spec.storageKey])
  const [core, setCore] = useState<CoreModule | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [settings, setSettings] = useState<CalculatorSettings>(() => ({
    fractionMode: false,
    angleMode: 'rad',
    base: 16,
    wordBits: 32,
    signed: true,
    twoDimensional: true,
    ...spec.settingsDefaults
  }))

  const [expression, setExpression] = useState('')
  /**
   * Der RPN-Modus führt einen **eigenen Eingabezustand** (Karte M6-002): Nur dort sind der
   * bearbeitete Zahlentoken und die abgeschlossenen Tokens geschieden. Der Text allein kann das
   * nicht ausdrücken — `3` sieht als abgeschlossener Wert genauso aus wie als begonnene Zahl.
   * Alle übrigen Rechnerarten arbeiten weiter mit dem Text.
   */
  const [rpnState, setRpnState] = useState<RpnInputState>({ tokens: [], draft: '' })
  const inputText = spec.input === 'rpn' ? rpnInputText(rpnState) : expression
  const setInputText = (next: string) => {
    if (spec.input === 'rpn') setRpnState(parseRpnInput(next))
    else setExpression(next)
  }
  const [second, setSecond] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [result, setResult] = useState('')
  const [resultRaw, setResultRaw] = useState('')
  /** Derselbe Wert in voller Rechengenauigkeit — Grundlage der Ampel, nie angezeigt. */
  const [resultFull, setResultFull] = useState('')
  /** Wahr, wenn für diese Rechnung automatisch das andere Zahlenmodell gerechnet hat. */
  const [autoModel, setAutoModel] = useState(false)
  /**
   * Wahr, wenn die **Anzeige** auf `0` gerundet wurde, der Wert aber nicht null ist (Karte
   * M4-002). Die Kennzeichnung ist der Hinweis am Ergebnis — **keine** neue Ampelstufe
   * (Entscheidung von Thomas am 2026-10-06).
   */
  const [displayRoundedToZero, setDisplayRoundedToZero] = useState(false)
  /** Ampel: angeheftet per Klick (Tippen). Maus und Tastatur öffnen über CSS — siehe `styles.css`. */
  const [accuracyPinned, setAccuracyPinned] = useState(false)
  const [errorKey, setErrorKey] = useState('')
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
      store.readSettings()
    ])
      .then(async ([coreModule, saved]) => {
        if (cancelled) return
        setCore(coreModule)
        setSettings(saved)
        const [savedHistory, savedVariables] = await Promise.all([store.readHistory(), store.readVariables()])
        if (cancelled) return
        setHistory(savedHistory)
        setVariables(savedVariables)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [store])

  const options: Options = useMemo(
    () => ({ number: settings.fractionMode ? ('Fraction' as const) : ('BigNumber' as const), angleMode: settings.angleMode, decimalSeparator }),
    [settings.fractionMode, settings.angleMode, decimalSeparator]
  )

  const state: CalculatorState = useMemo(
    () => ({
      fractionMode: settings.fractionMode,
      angleMode: settings.angleMode,
      base: settings.base,
      wordBits: settings.wordBits,
      signed: settings.signed,
      twoDimensional: settings.twoDimensional,
      set: (patch) => {
        setSettings((current) => {
          const next = { ...current, ...patch }
          void store.writeSettings(next)
          return next
        })
      }
    }),
    [settings, store]
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

  const clearResult = useCallback(() => {
    setResult('')
    setResultRaw('')
    setResultFull('')
    setAutoModel(false)
    setDisplayRoundedToZero(false)
    setErrorKey('')
  }, [])

  /**
   * RPN-Vorschau: Stapel und Rechenweg entstehen **live**, sonst wäre die Eingabe blind.
   */
  const rpn = useMemo(() => {
    if (!core || spec.input !== 'rpn') return null
    const tokens = splitRpnTokens(inputText)
    return tokens.length ? core.evaluateRpn(tokens, options, scope) : null
  }, [core, spec.input, inputText, options, scope])

  const allowTwoDim = spec.allowTwoDim ? spec.allowTwoDim(state) : true

  /**
   * Gesetzter Satz **nur des Ergebnisses** (MathML aus dem Ausdrucksbaum). Die Eingabezeile bleibt
   * roher Text: sie bleibt damit kopierbar und immer lesbar — das Ergebnis steht darüber
   * (Entscheidung von Thomas, 2026-10-04).
   */
  const twoDimResult = useMemo(() => {
    if (!core || !settings.twoDimensional || !resultRaw || !allowTwoDim) return null
    try {
      const node = core.calculatorFor(options).parse(resultRaw.trim())
      return toMathML(node as never, resultRaw.trim(), decimalSeparator)
    } catch {
      return null
    }
  }, [core, settings.twoDimensional, resultRaw, allowTwoDim, options, decimalSeparator])

  const shownResult = useMemo(
    () => (spec.displayResult && core ? spec.displayResult(core, options, state, result, resultRaw) : result),
    [spec, core, options, state, result, resultRaw]
  )

  /**
   * Genauigkeitsampel. Sie bleibt aus, wo sie nicht ehrlich sein könnte: im RPN-Rechner trägt der
   * Stapel die gerundete 14-Stellen-Darstellung von Schritt zu Schritt weiter (`1/3 3 *` wäre dort
   * `1`), und im Programmiererrechner mit anderer Anzeige-Basis zeigt die Anzeige eine
   * Schreibweise, nicht den Wert. Beides steht so in der Übergabe.
   */
  const accuracy = useMemo(() => {
    if (spec.accuracy === 'never') return null
    if (!resultRaw) return null
    if (spec.accuracyAllowed && !spec.accuracyAllowed(state)) return null
    return accuracyOf(resultRaw, resultFull)
  }, [spec, state, resultRaw, resultFull])

  const accuracyStateKey =
    accuracy === 'complete' ? 'tool.calc.accuracyStateComplete' : 'tool.calc.accuracyStateRounded'

  const showsTwoDim = Boolean(twoDimResult)

  /**
   * Wertet die Eingabe aus — je Rechenart über den Ausdrucksleser oder über den Stapel.
   * `store` versorgt nur Verlauf und Einstellungen: fehlt er (blockiertes IndexedDB, privates
   * Fenster), muss trotzdem gerechnet werden.
   */
  const runCalculation = useCallback(
    async (input: string) => {
      if (!core) return
      let calculation: ReturnType<CoreModule['evaluate']>
      if (spec.input === 'rpn') {
        const tokens = splitRpnTokens(input)
        if (!tokens.length) return
        calculation = core.evaluateRpn(tokens, options, scope)
      } else {
        calculation = core.evaluate(input, options, scope)
      }
      let usedOtherModel = false
      /**
       * Automatisches Ausweichen — **einmalig und sichtbar**. Das Bruch-Modell kann Wurzeln und
       * Winkelfunktionen nicht rechnen (`numberModel`). Statt den Nutzer stehen zu lassen, rechnet
       * der Rechner dieselbe Eingabe im Dezimal-Modell. Die Einstellung bleibt, wo sie war, und der
       * Hinweis dazu steht hinter der Ampel und unter dem Ergebnis.
       */
      if (spec.input === 'expression' && spec.numberModelSwitch && !calculation.ok && calculation.error === 'numberModel') {
        const alternative = { ...options, number: settings.fractionMode ? ('BigNumber' as const) : ('Fraction' as const) }
        const fallback = core.evaluate(input, alternative, scope)
        if (fallback.ok) {
          calculation = fallback
          usedOtherModel = true
        }
      }
      if (!calculation.ok) {
        clearResult()
        setErrorKey(`tool.calc.error.${calculation.error ?? 'unsupported'}`)
        return
      }
      /**
       * **Kein Bruch nach dem Modellwechsel.** Hat automatisch das Dezimal-Modell gerechnet, ist
       * die Zahl kein exakter Bruch mehr: `toFraction` machte aus dem gerundeten `1.4142135623731`
       * den Scheinbruch `14142135623731/10000000000000` — eine Genauigkeit, die es nicht gibt.
       */
      /**
       * Im Bruchmodell ist die Anzeige der Bruch aus dem echten Wert — dort wird nie genullt.
       * Das Kennzeichen gilt deshalb nur für die Anzeige, die direkt vom Rechenkern kommt.
       */
      const usedFraction = settings.fractionMode && !usedOtherModel
      const display = usedFraction ? core.toFraction(calculation.raw, options).display : calculation.display
      setResult(display)
      setResultRaw(calculation.raw)
      setResultFull(calculation.full)
      setDisplayRoundedToZero(!usedFraction && calculation.displayRoundedToZero)
      setAutoModel(usedOtherModel)
      setErrorKey('')
      setCopyStatus('')
      const entry: HistoryEntry = { expression: input.trim(), display, at: Date.now() }
      setHistory(await store.pushHistory(history, entry))
    },
    [core, spec, settings.fractionMode, options, scope, clearResult, store, history]
  )

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void runCalculation(inputText)
  }

  /**
   * Ein Schritt im RPN-Eingabezustand. Tippen, Einfügen und Tastenfeld laufen über denselben
   * Reducer; die Tastatureingabe wird dabei als Text neu ausgelegt (`parseRpnInput`).
   */
  const applyRpn = (action: RpnInputAction) => {
    setRpnState((current) => rpnInputReducer(current, action))
  }

  /**
   * Schnipsel anhängen. Im RPN-Modus übernimmt der Eingabereducer (Karte M6-002): Ziffern
   * erweitern den laufenden Zahlentoken, eine Operator- oder Werttaste schließt ihn zuerst ab.
   * Was der Reducer nicht kennt — etwa ein eingesetztes Ergebnis — ist ein **fertiger** Wert und
   * geht denselben Weg wie eine Operator-Taste. Sonst mit Leerzeichen: dort wird an Leerraum
   * zerlegt. Die Ziffernbuchstaben `A`–`F` des Programmiererrechners bekommen ihr `0x`: ohne
   * Präfix wären sie ein mathjs-Name und die Taste damit tot.
   */
  const appendToInput = (snippet: string) => {
    if (spec.input === 'rpn') {
      applyRpn(rpnActionForSnippet(snippet) ?? { type: 'operator', value: snippet })
      return
    }
    const append = spec.appendSnippet ?? appendSnippet
    setExpression((current) => append(current, snippet))
  }

  /** Ein Tastendruck. Aktionstasten tragen keinen Schnipsel und werden über ihre Kennung geführt. */
  const pressKey = (definition: KeyDefinition) => {
    const { snippet } = resolveKey(definition, second)

    if (!snippet) {
      switch (definition.id) {
        case 'clear':
          if (spec.input === 'rpn') applyRpn({ type: 'clear' })
          else setExpression('')
          clearResult()
          break
        case 'backspace':
          if (spec.input === 'rpn') applyRpn({ type: 'backspace' })
          else setExpression((current) => current.slice(0, -1))
          break
        case 'more':
          setSheetOpen((open) => !open)
          break
        case 'second':
          setSecond((active) => !active)
          break
        case 'ans':
          if (resultRaw) appendToInput(resultRaw)
          break
        case 'rpnSwap':
          applyRpn({ type: 'swap' })
          break
        case 'rpnDrop':
          applyRpn({ type: 'drop' })
          break
        case 'equals':
          void runCalculation(inputText)
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

  const addVariable = async () => {
    if (!core) return
    const name = variableName.trim()
    if (!name) return
    const parsed = core.evaluate(variableValue || '0', options)
    if (!parsed.ok) {
      setErrorKey('tool.calc.error.syntax')
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
    const next = { ...variables }
    delete next[name]
    setVariables(next)
    await store.writeVariables(next)
  }

  const clearHistory = async () => {
    setHistory(await store.clearHistory())
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('tool.calc.copyDone')
    } catch {
      setCopyStatus('tool.calc.copyFailed')
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
        <p className="error" role="alert">{t('tool.calc.error.unsupported')}</p>
      </div>
    )
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        {spec.numberModelSwitch && (
          <div className="field">
            <span id="calculator-number-label">{t('tool.calc.numberMode')}</span>
            <div className="segmented" role="radiogroup" aria-labelledby="calculator-number-label">
              <button
                type="button"
                role="radio"
                aria-checked={!settings.fractionMode}
                className={!settings.fractionMode ? 'active' : ''}
                onClick={() => {
                  clearResult()
                  state.set({ fractionMode: false })
                }}
              >
                {t('tool.calc.numberBignumber')}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={settings.fractionMode}
                className={settings.fractionMode ? 'active' : ''}
                onClick={() => {
                  clearResult()
                  state.set({ fractionMode: true })
                }}
              >
                {t('tool.calc.numberFraction')}
              </button>
            </div>
          </div>
        )}

        {spec.renderSettings?.(state)}

        <div className="field">
          <label htmlFor="calculator-expression">
            {t(spec.labelKey ?? 'tool.calc.expression')}
          </label>
          <input
            id="calculator-expression"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={t(spec.placeholderKey ?? 'tool.calc.placeholder')}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              // Im RPN-Modus schließt Enter den bearbeiteten Zahlentoken ab, statt das Formular
              // abzuschicken (Karte M6-002). Ein leerer Enter tut nichts — er dupliziert keinen Wert.
              if (spec.input !== 'rpn' || event.key !== 'Enter') return
              event.preventDefault()
              applyRpn({ type: 'commit' })
            }}
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
                aria-label={shownResult}
                dangerouslySetInnerHTML={{ __html: twoDimResult as string }}
              />
              <p className="expression-line">{inputText || t(spec.placeholderKey ?? 'tool.calc.placeholder')}</p>
            </>
          ) : (
            <>
              {shownResult && <p className="result-line">{shownResult}</p>}
              <p className="expression-line">{inputText || t(spec.placeholderKey ?? 'tool.calc.placeholder')}</p>
            </>
          )}

          <div className="calculator-flags">
            {spec.numberModelSwitch && (
              <span className={`calculator-flag${settings.fractionMode ? '' : ' active'}`}>
                {settings.fractionMode ? t('tool.calc.numberShortFraction') : t('tool.calc.numberShortDecimal')}
              </span>
            )}
            {spec.renderFlags?.(state)}
            {second && <span className="calculator-flag active">{t('tool.calc.secondActive')}</span>}
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
                  aria-label={`${t('tool.calc.accuracyLabel')}: ${t(accuracyStateKey)}`}
                  onClick={() => setAccuracyPinned((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setAccuracyPinned(false)
                  }}
                >
                  <span aria-hidden="true">{accuracy === 'complete' ? '=' : '≈'}</span>
                </button>
                <span className="accuracy-bubble" role="status">
                  <span className="accuracy-bubble-title">{t('tool.calc.accuracyOpen')}</span>
                  <span><b aria-hidden="true">=</b> {t('tool.calc.accuracyComplete')}</span>
                  <span><b aria-hidden="true">≈</b> {t('tool.calc.accuracyRounded')}</span>
                  {autoModel && <span>{t('tool.calc.accuracyModel')}</span>}
                </span>
              </span>
            )}
            <span className="calculator-display-tools">
              <button
                type="button"
                className="button calculator-icon-button"
                aria-label={t('tool.calc.key.history')}
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
              <span className="calculator-switch" role="group" aria-label={t('tool.calc.display')}>
                <button
                  type="button"
                  aria-pressed={settings.twoDimensional}
                  className={settings.twoDimensional ? 'active' : ''}
                  aria-label={t('tool.calc.display2d')}
                  onClick={() => state.set({ twoDimensional: true })}
                >
                  <span className="fraction-glyph">1<i>2</i></span>
                </button>
                <button
                  type="button"
                  aria-pressed={!settings.twoDimensional}
                  className={!settings.twoDimensional ? 'active' : ''}
                  aria-label={t('tool.calc.displayRaw')}
                  onClick={() => state.set({ twoDimensional: false })}
                >
                  1/2
                </button>
              </span>
            </span>
          </div>
        </div>

        <div className="calculator-copy-row">
          <button type="button" className="button" onClick={() => void copyToClipboard(inputText)}>
            {t('tool.calc.copyExpression')}
          </button>
          <button type="button" className="button" onClick={() => void copyToClipboard(resultRaw || result)}>
            {t('tool.calc.copyResult')}
          </button>
          {copyStatus && <span className="calculator-copy-status" role="status">{t(copyStatus)}</span>}
        </div>

        <div
          className="keypad"
          role="group"
          aria-label={t('tool.calc.keypad')}
          style={{ gridTemplateColumns: `repeat(${spec.layout.columns}, minmax(0, 1fr))` }}
        >
          {spec.layout.rows.flatMap((row, rowIndex) =>
            row.map((definition, columnIndex) => {
              if (!definition) {
                return <span key={`gap-${rowIndex}-${columnIndex}`} className="keypad-gap" aria-hidden="true" />
              }
              const resolved = resolveKey(definition, second)
              const enabled = isKeyEnabled(definition, settings.base)
              const showSecond = second && hasSecondPlane(definition)
              const armed = (definition.id === 'second' && second) || (definition.id === 'more' && sheetOpen)
              return (
                <button
                  key={definition.id}
                  type="button"
                  className={`keypad-key ${definition.role}${armed ? ' armed' : ''}${definition.role === 'operator' && resolved.label.length > 1 ? ' wortzeichen' : ''}`}
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

        {spec.sheet && sheetOpen && (
          <div className="calculator-sheet" role="group" aria-label={t('tool.calc.moreFunctions')}>
            <div className="inline-field">
              <h3>{t('tool.calc.moreFunctions')}</h3>
              <button type="button" className="button" onClick={() => setSheetOpen(false)}>
                {t('tool.calc.sheet.close')}
              </button>
            </div>
            {spec.sheet.map((group) => (
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

        <button type="submit" disabled={!core}>{t('tool.calc.calculate')}</button>
      </form>

      {(result || errorKey) && (
        <div className="results" aria-live="polite">
          {errorKey ? (
            <>
              <h2>{t('tool.calc.result')}</h2>
              <p className="error" role="alert">{t(errorKey)}</p>
              {/* Nur bei diesem Fehler: der Weg heraus steht direkt daneben. */}
              {errorKey === 'tool.calc.error.numberModel' && (
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    if (!core) return
                    clearResult()
                    state.set({ fractionMode: false })
                    void runCalculation(inputText)
                  }}
                >
                  {t('tool.calc.retryDecimal')}
                </button>
              )}
            </>
          ) : (
            <>
              <dl>
                <div>
                  <dt>{t('tool.calc.result')}</dt>
                  <dd>{shownResult}</dd>
                </div>
              </dl>
              {/* Sichtbar ohne Öffnen: der stille Modellwechsel darf nicht übersehen werden. */}
              {autoModel && <p className="scan-note">{t('tool.calc.accuracyModel')}</p>}
              {/* Kennzeichnung der Anzeige-Nullung (Karte M4-002): Die Anzeige zeigt 0, der Wert
                  ist es nicht — der Hinweis steht am Ergebnis, es gibt keine neue Ampelstufe. */}
              {displayRoundedToZero && (
                <p className="scan-note" data-display-zero="true">{t('tool.calc.displayZero')}</p>
              )}
            </>
          )}
        </div>
      )}

      {spec.renderPanels && core && spec.renderPanels({ core, options, state, input: inputText, result, resultRaw })}

      {spec.input === 'rpn' && <RpnPanels t={t} rpn={rpn} />}

      <div className="settings-card stack" id="calculator-history">
        <h2>{t('tool.calc.history')}</h2>
        {history.length === 0 ? (
          <p className="scan-note">{t('tool.calc.historyEmpty')}</p>
        ) : (
          <>
            <ul className="metadata-entries">
              {history.map((entry) => (
                <li key={`${entry.at}-${entry.expression}`}>
                  <code>{entry.expression} = {entry.display}</code>
                  <button type="button" onClick={() => setInputText(entry.expression)}>
                    {t('tool.calc.reuse')}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => void clearHistory()}>{t('tool.calc.clearHistory')}</button>
          </>
        )}
      </div>

      <div className="settings-card stack">
        <h2>{t('tool.calc.variables')}</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="calculator-variable-name">{t('tool.calc.variableName')}</label>
            <input
              id="calculator-variable-name"
              type="text"
              value={variableName}
              onChange={(event) => setVariableName(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="calculator-variable-value">{t('tool.calc.variableValue')}</label>
            <input
              id="calculator-variable-value"
              type="text"
              value={variableValue}
              onChange={(event) => setVariableValue(event.target.value)}
            />
          </div>
        </div>
        <button type="button" onClick={() => void addVariable()}>{t('tool.calc.addVariable')}</button>
        {Object.entries(variables).length > 0 && (
          <ul className="metadata-entries">
            {Object.entries(variables).map(([name, value]) => (
              <li key={name}>
                <code>{name} = {value}</code>
                <button type="button" onClick={() => void removeVariable(name)}>{t('tool.calc.removeVariable')}</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="settings-card">
        <summary>{t('tool.calc.formula')}</summary>
        <p className="scan-note">{t('tool.calc.formulaText')}</p>
        <p className="scan-note">{t('tool.calc.formulaNumber')}</p>
        <p className="scan-note">{t(spec.rulesKey)}</p>
        <p className="scan-note">{t('tool.calc.sources')}</p>
      </details>

      <p className="privacy-note">{t('tool.calc.exactNote')}</p>
      <LocalBadge />
    </div>
  )
}

/** Zeigt Stapel und Rechenweg des RPN-Rechners — gehört nur zu dieser Rechenart. */
export function RpnPanels({ t, rpn }: { t: Translate; rpn: ReturnType<CoreModule['evaluateRpn']> | null }) {
  return (
    <div className="settings-card stack">
      <h2>{t('tool.rpnCalculator.rpnStack')}</h2>
      {rpn && rpn.stack.length > 0 ? (
        <ul className="metadata-entries">
          {[...rpn.stack].reverse().map((value, index) => (
            <li key={`${index}-${value}`}><code>{value}</code></li>
          ))}
        </ul>
      ) : (
        <p className="scan-note">{t('tool.rpnCalculator.rpnStackEmpty')}</p>
      )}
      {rpn && rpn.steps.length > 0 && (
        <>
          <h2>{t('tool.rpnCalculator.rpnSteps')}</h2>
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
  )
}
