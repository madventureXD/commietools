/**
 * Rechenkern der Suite „Rechnen" (ADR 0005).
 *
 * Diese Datei ist die Ladegrenze: Sie importiert `mathjs` statisch und darf deshalb **nur**
 * über den Unterpfad `@commietools/tools/calculator/core` geladen werden — nie über
 * `@commietools/tools` (das importiert der Katalog statisch, damit hinge mathjs am Start).
 *
 * Keine Anzeigetexte: Fehler werden als Codes zurückgegeben und in den Sprachkatalogen
 * übersetzt (Projektregel).
 */
import { create } from 'mathjs'
import type { FactoryFunctionMap, MathJsInstance } from 'mathjs'
import { calculatorFactories } from './functions'

/** Zahlenmodell. Gleitkomma (`number`) wird bewusst nicht angeboten — siehe ADR 0005. */
export type NumberMode = 'BigNumber' | 'Fraction'

export interface CalculatorOptions {
  readonly number?: NumberMode
  readonly precision?: number
}

/** Fehlerklassen, übersetzt in den Sprachkatalogen unter `calculator.error.<code>`. */
export type CalculatorErrorCode =
  | 'empty'
  | 'syntax'
  | 'unknownName'
  | 'zeroDivision'
  | 'outOfRange'
  | 'unsupported'

export interface Calculation {
  readonly ok: boolean
  /** Anzeigefertiger Wert; bei Fehlern leer. */
  readonly display: string
  /** Wert für die Weiterverwendung (etwa im Verlauf oder in einer Variablen). */
  readonly raw: string
  readonly error: CalculatorErrorCode | null
}

const DEFAULT_PRECISION = 64
const DISPLAY_PRECISION = 14

const instances = new Map<string, MathJsInstance>()

/**
 * mathjs deklariert jeden `…Dependencies`-Export als `FactoryFunctionMap | undefined`.
 * `create()` nimmt aber nur definierte Einträge — deshalb hier einmal herausfiltern, statt
 * an jeder Aufrufstelle zu casten.
 */
function usableFactories(): FactoryFunctionMap {
  const result: Record<string, FactoryFunctionMap> = {}
  for (const [name, value] of Object.entries(calculatorFactories)) {
    if (value) result[name] = value
  }
  return result
}

/**
 * Liefert die mathjs-Instanz für eine Konfiguration. Die Instanz wird zwischengespeichert:
 * `create()` ist der teure Teil, und ein Rechner wechselt selten das Zahlenmodell.
 */
export function calculatorFor(options: CalculatorOptions = {}): MathJsInstance {
  const number: NumberMode = options.number ?? 'Fraction'
  const precision = options.precision ?? DEFAULT_PRECISION
  const key = `${number}:${precision}`
  const existing = instances.get(key)
  if (existing) return existing
  const instance = create(usableFactories(), { number, precision })
  instances.set(key, instance)
  return instance
}

/**
 * Ordnet einen mathjs-Fehler einer übersetzbaren Klasse zu.
 * Die Reihenfolge ist wichtig: mathjs meldet unbekannte Namen als `Undefined …`.
 */
function classify(message: string): CalculatorErrorCode {
  if (/Undefined (function|symbol)/iu.test(message)) return 'unknownName'
  if (/Division by zero/iu.test(message)) return 'zeroDivision'
  if (/Value expected|Unexpected|Parenthesis|Invalid|Syntax|expected/iu.test(message)) return 'syntax'
  if (/out of range|Infinity|too large|exceeds/iu.test(message)) return 'outOfRange'
  return 'unsupported'
}

/**
 * Wertet einen Ausdruck aus. `scope` bindet benannte Variablen (etwa `{ hoehe: 2.8 }`).
 * Leere Eingabe ist kein Fehler im Sinne der Rechnung, sondern eine eigene Klasse.
 */
export function evaluate(
  expression: string,
  options: CalculatorOptions = {},
  scope: Record<string, unknown> = {}
): Calculation {
  const trimmed = expression.trim()
  if (!trimmed) return { ok: false, display: '', raw: '', error: 'empty' }

  const math = calculatorFor(options)
  try {
    const value = math.evaluate(trimmed, scope)
    const raw = math.format(value, { precision: DISPLAY_PRECISION })
    // mathjs wirft bei einer Division durch null nicht immer: im BigNumber-Modell kommt
    // `Infinity` heraus. Ein solches Ergebnis ist keine gültige Rechnung.
    if (/^(?:-?Infinity|NaN)$/u.test(raw)) {
      return { ok: false, display: '', raw: '', error: 'outOfRange' }
    }
    return { ok: true, display: raw, raw, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, display: '', raw: '', error: classify(message) }
  }
}

/**
 * Wandelt einen Wert in einen exakten Bruch um, wenn das ohne Genauigkeitsverlust geht.
 * Für den Bruchmodus: `0,75` soll als `3/4` erscheinen, nicht als `0.75`.
 */
export function toFraction(expression: string, options: CalculatorOptions = {}): Calculation {
  const result = evaluate(expression, options)
  if (!result.ok) return result

  const math = calculatorFor(options)
  try {
    const fraction = math.fraction(result.raw)
    const text = math.format(fraction)
    // Eine ganze Zahl bleibt eine Zahl: „3/1“ wäre im Rechner verwirrend.
    if (/^-?\d+$/u.test(text)) return { ok: true, display: text, raw: text, error: null }
    return { ok: true, display: text, raw: text, error: null }
  } catch {
    return { ok: false, display: '', raw: '', error: 'unsupported' }
  }
}

/**
 * Erzeugt eine benannte Variable für den Auswertungs-Scope. `options` muss dasselbe
 * Zahlenmodell sein wie die spätere Rechnung — sonst wird `2,80` im Bruchmodell zu `14/5`.
 */
export function withVariable(
  scope: Record<string, unknown>,
  name: string,
  value: string,
  options: CalculatorOptions = {}
): Record<string, unknown> {
  const key = name.trim()
  if (!key) return scope
  const parsed = evaluate(value, options)
  if (!parsed.ok) {
    // Ein ungültiger Wert löscht die Variable nicht — sonst verschwindet sie stillschweigend.
    return scope
  }
  return { ...scope, [key]: parsed.raw }
}

/** Zahleingabe mit deutschem Dezimalkomma in einen mathjs-lesbaren Ausdruck bringen. */
export function normalizeDecimalInput(input: string): string {
  return input.replace(/(\d),(?=\d)/gu, '$1.')
}
