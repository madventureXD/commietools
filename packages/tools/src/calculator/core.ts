/**
 * Rechenkern der Suite „Rechnen" (ADR 0005).
 *
 * Diese Datei ist die Ladegrenze: Sie importiert `mathjs` statisch und darf deshalb **nur**
 * über den Unterpfad `@commietools/tools/calculator/core` geladen werden — nie über
 * `@commietools/tools` (das importiert der Katalog statisch, damit hinge mathjs am Start).
 *
 * Keine Anzeigetexte: Fehler werden als Codes zurückgegeben und in den Sprachkatalogen
 * übersetzt (Projektregel).
 *
 * Fallstrick des Zahlenmodells `BigNumber`: mathjs nimmt rohe JS-Zahlen mit mehr als 15
 * signifikanten Stellen nicht implizit an. Die Winkelumrechnung läuft deshalb über
 * `unit(...)` mit mathjs-eigenen Werten, nicht über `Math.PI / 180`.
 */
import { create } from 'mathjs'
import type { FactoryFunctionMap, MathJsInstance } from 'mathjs'
import { calculatorFactories } from './functions'

/** Zahlenmodell. Gleitkomma (`number`) wird bewusst nicht angeboten — siehe ADR 0005. */
export type NumberMode = 'BigNumber' | 'Fraction'

/** Winkelmodus der trigonometrischen Funktionen. */
export type AngleMode = 'rad' | 'deg' | 'grad'

export interface CalculatorOptions {
  readonly number?: NumberMode
  readonly precision?: number
  readonly angleMode?: AngleMode
  /**
   * Dezimaltrenner der **Anzeige**. Ohne Angabe bleibt es beim Punkt — die Anzeige ist damit
   * sprachabhängig, der Rohwert (`raw`) nie: der trägt immer den Punkt und bleibt in jedem
   * Zahlenmodell wieder einlesbar.
   */
  readonly decimalSeparator?: ',' | '.'
}

/** Fehlerklassen, übersetzt in den Sprachkatalogen unter `calculator.error.<code>`. */
export type CalculatorErrorCode =
  | 'empty'
  | 'syntax'
  | 'unknownName'
  | 'zeroDivision'
  | 'outOfRange'
  | 'unsupported'
  | 'numberModel'
  | 'stackUnderflow'
  | 'stackLeftover'
  | 'wordRange'

/**
 * Alle Fehlerklassen zur Laufzeit — der Sprachkatalog muss für jede einen Text führen. Ohne
 * diese Liste wäre ein neuer Fehlercode in der Oberfläche ein Schlüssel ohne Text.
 */
export const calculatorErrorCodes = [
  'empty',
  'syntax',
  'unknownName',
  'zeroDivision',
  'outOfRange',
  'unsupported',
  'numberModel',
  'stackUnderflow',
  'stackLeftover',
  'wordRange'
] as const satisfies readonly CalculatorErrorCode[]

export interface Calculation {
  readonly ok: boolean
  /** Anzeigefertiger Wert; bei Fehlern leer. */
  readonly display: string
  /** Wert für die Weiterverwendung (etwa im Verlauf oder in einer Variablen). */
  readonly raw: string
  /**
   * Derselbe Wert in der **vollen Rechengenauigkeit** (64 Stellen), unformatiert lokalisiert.
   * Nur zum Vergleichen gedacht — die Genauigkeitsampel des Rechners erkennt daran, ob die
   * Anzeige der ganze Wert ist (`raw === full`). **Nicht** zum Anzeigen und **nicht** zum
   * Weiterrechnen: dafür bleibt `raw` zuständig. Bei Fehlern leer.
   */
  readonly full: string
  /**
   * Wahr, wenn die **Anzeige** auf `0` gerundet wurde — die Taschenrechner-Konvention für
   * Restfehler unterhalb der Anzeigepräzision. `raw` und `full` tragen in diesem Fall den
   * echten Wert; die Oberfläche muss die Nullung sichtbar kennzeichnen (Karte M4-002,
   * Entscheidung von Thomas am 2026-10-06: Hinweis am Ergebnis, keine neue Ampelstufe).
   */
  readonly displayRoundedToZero: boolean
  readonly error: CalculatorErrorCode | null
}

const DEFAULT_PRECISION = 64
const DISPLAY_PRECISION = 14
/** Werte unterhalb dieser Schwelle gelten für die Anzeige als null (s. `formatValue`). */
const ZERO_THRESHOLD = 1e-13

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
 * Setzt den Winkelmodus durch Überschreiben der Winkelfunktionen (mathjs kennt keine globale
 * Einstellung dafür). Der Rückweg liefert bewusst eine nackte Zahl ohne Einheit — sonst stünde
 * `asin(0.5)` als `30 deg` im Verlauf und würde in der nächsten Rechnung als Grad-Einheit weiterlaufen.
 */
function applyAngleMode(math: MathJsInstance, angleMode: AngleMode): void {
  if (angleMode === 'rad') return
  const unit = angleMode === 'deg' ? 'deg' : 'grad'
  const base = {
    sin: math.sin, cos: math.cos, tan: math.tan,
    asin: math.asin, acos: math.acos, atan: math.atan
  }
  /**
   * `unit(...)` nimmt einen Bruch (`Fraction`) nicht an — im Bruchmodell käme sonst
   * „unsupported“ heraus, obwohl die Rechnung gültig ist. Ein Bruch wird deshalb für die
   * Winkelumrechnung in eine Dezimalzahl gehoben; das Ergebnis einer Winkelfunktion ist
   * ohnehin im Allgemeinen kein Bruch (sin 30° = 0,5, sin 45° = 0,707…).
   */
  const asUnitValue = (x: unknown) => (math.isFraction(x) ? math.bignumber(x) : x)
  const toRad = (x: unknown) => math.unit(asUnitValue(x) as never, unit).to('rad')
  // Zwei Fallen auf einmal: `toNumber(unit)` liefert ein **rohes** Decimal-Objekt, auf dem
  // `format(…, { precision })` nicht rundet, und `.value` gäbe den Wert in der Basiseinheit
  // (rad) zurück. Deshalb `toNumber(unit)` und dann in eine mathjs-Zahl wandeln.
  const fromRad = (x: unknown) => math.bignumber(math.unit(x as never, 'rad').toNumber(unit))
  math.import(
    {
      sin: (x: unknown) => base.sin(toRad(x)),
      cos: (x: unknown) => base.cos(toRad(x)),
      tan: (x: unknown) => base.tan(toRad(x)),
      asin: (x: unknown) => fromRad(base.asin(x as never)),
      acos: (x: unknown) => fromRad(base.acos(x as never)),
      atan: (x: unknown) => fromRad(base.atan(x as never))
    },
    { override: true }
  )
}

/**
 * Liefert die mathjs-Instanz für eine Konfiguration. Die Instanz wird zwischengespeichert:
 * `create()` ist der teure Teil, und ein Rechner wechselt selten Zahlen- oder Winkelmodus.
 */
export function calculatorFor(options: CalculatorOptions = {}): MathJsInstance {
  const number: NumberMode = options.number ?? 'Fraction'
  const precision = options.precision ?? DEFAULT_PRECISION
  const angleMode: AngleMode = options.angleMode ?? 'rad'
  const key = `${number}:${precision}:${angleMode}`
  const existing = instances.get(key)
  if (existing) return existing
  const instance = create(usableFactories(), { number, precision })
  applyAngleMode(instance, angleMode)
  instances.set(key, instance)
  return instance
}

/**
 * Ordnet einen mathjs-Fehler einer übersetzbaren Klasse zu.
 * Die Reihenfolge ist wichtig: mathjs meldet unbekannte Namen als `Undefined …`.
 */
function classify(message: string): CalculatorErrorCode {
  // Zuerst die Zahlenmodell-Grenze: mathjs kann im Bruch-Modell Wurzeln und Winkelfunktionen
  // nicht rechnen, weil deren Argumente intern in BigNumber gewandelt werden. Gemessen und
  // festgehalten am 2026-10-04 (mit und ohne die neuen Factories `cbrt`/`nthRoot`): `sqrt(2)`,
  // `sin(30)` im Bogenmaß, `cbrt(-8)` und `nthRoot(-8, 3)` scheitern **alle** mit dieser Meldung.
  // Eine eigene Klasse, weil die Meldung im Sprachkatalog einen brauchbaren Hinweis trägt —
  // „nicht unterstützt" wäre für den Nutzer eine Sackgasse.
  if (/Cannot implicitly convert/iu.test(message)) return 'numberModel'
  if (/Undefined (function|symbol)/iu.test(message)) return 'unknownName'
  if (/Division by zero/iu.test(message)) return 'zeroDivision'
  if (/Value expected|Unexpected|Parenthesis|Invalid|Syntax|expected/iu.test(message)) return 'syntax'
  if (/out of range|Infinity|too large|exceeds/iu.test(message)) return 'outOfRange'
  return 'unsupported'
}

/**
 * Formatiert ein Ergebnis für die Anzeige.
 *
 * Erst normal auf die Anzeigepräzision runden — das ist der Regelfall und liefert auch für
 * Werte aus der Grad-Umrechnung das richtige Ergebnis (`0.999…` → `1`).
 *
 * Nur wenn das eine **Exponentialschreibweise** ergibt (`1.3983816e+7`), wird auf die volle
 * Darstellung gewechselt: Für einen Taschenrechner ist `13983816` brauchbar, `1.3983816e+7`
 * nicht. `notation: 'fixed'` **ohne** `precision` ist dort Pflicht — mit `precision` füllte
 * mathjs zu `11.00000000000000` auf.
 *
 * `isInteger` allein taugt nicht als Weiche: es prüft mit Toleranz und hält `0.999…998`
 * (64 Stellen) für eine ganze Zahl.
 *
 * Der Nulldurchgang ist **Sache der Anzeige**, nicht der Formatierung. Vorher stand der
 * Nullfilter hier und vernichtete damit auch `raw` und `full`: Die Genauigkeitsampel (ADR 0006)
 * verglich dann zwei gefälschte Nullen und meldete „vollständig" für einen Wert, der nicht null
 * ist (Karte M4-002). Jetzt tragen `raw` und `full` den **echten** Wert. Die frühere
 * Taschenrechner-Konvention („`cos(100 gon)` zeigt `0`") ist damit **entfallen** — sie war eine
 * stille Approximation ohne Kennzeichnung, und die Karte lässt sie nur mit Kennzeichnung zu.
 */
function formatValue(math: MathJsInstance, value: unknown, precision: number = DISPLAY_PRECISION): string {
  const text = math.format(value, { precision })
  if (!/\de[+-]\d+$/iu.test(text)) return text
  try {
    if (math.isInteger(value as never)) return math.format(value, { notation: 'fixed' })
  } catch {
    // Kein Zahlenwert — dann bleibt die gerundete Darstellung.
  }
  return text
}

/**
 * Taschenrechner-Konvention **für die Anzeige**: Ein Wert unterhalb der Anzeigepräzision, der
 * nicht exakt null ist — etwa der trigonometrische Restfehler `cos(100 gon)` ≈ 1,5e-64 — wird
 * als `0` gezeigt. Die Karte M4-002 lässt das ausdrücklich zu („trigonometrische Restfehler
 * gegebenenfalls nur als eng begründete Anzeigeapproximation mit Kennzeichnung"), verlangt aber,
 * dass `raw` und `full` den echten Wert tragen — und genau das tun sie jetzt.
 *
 * Die von der Karte geforderte *Kennzeichnung* dieser Approximation liegt seit dem 2026-10-06
 * im Ergebnis selbst (`displayRoundedToZero`): Jede Stelle, die rechnet, gibt das Kennzeichen mit
 * heraus, und die Oberfläche zeigt darauf einen Hinweis am Ergebnis — **keine** neue Ampelstufe
 * (Entscheidung von Thomas). Damit ist die Nullung nie mehr eine stille Approximation.
 */
function anzeigeNull(math: MathJsInstance, value: unknown): boolean {
  try {
    const magnitude = math.number(math.abs(value as never) as never)
    // `magnitude > 0`: Eine echte Null ist kein Restfehler und wird nicht „genullt“.
    return Number.isFinite(magnitude) && magnitude > 0 && magnitude < ZERO_THRESHOLD
  } catch {
    // Kein Zahlenwert (Einheit, Wahrheitswert, Matrix) — dann keine Anzeige-Nullung.
    return false
  }
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
  if (!trimmed) return { ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error: 'empty' }

  const math = calculatorFor(options)
  try {
    let value: unknown
    try {
      value = math.evaluate(trimmed, scope)
    } catch (first) {
      /**
       * Zweiter Versuch mit deutschem Dezimalkomma — **nur** wenn der Ausdruck sonst nicht lesbar
       * ist. Warum nicht vorher umschreiben: mathjs benutzt das Komma als **Argumenttrenner**.
       * Eine blinde Umschreibung machte aus `gcd(12,18)` die Zahl `gcd(12.18)`. Erst scheitern
       * lassen heißt: jeder gültige Ausdruck behält seine Bedeutung, und nur `1,5` wird zur
       * Dezimalzahl. Dieselbe Regel wie im RPN-Pfad, wo je Token umgeschrieben wird.
       */
      const normalized = normalizeDecimalInput(trimmed)
      if (normalized === trimmed) throw first
      value = math.evaluate(normalized, scope)
    }
    const raw = formatValue(math, value)
    // Derselbe Wert in voller Rechengenauigkeit — nur für den Vergleich, nicht für die Anzeige.
    const full = formatValue(math, value, DEFAULT_PRECISION)
    // mathjs wirft bei einer Division durch null nicht immer: im BigNumber-Modell kommt
    // `Infinity` heraus. Ein solches Ergebnis ist keine gültige Rechnung.
    if (/^(?:-?Infinity|NaN)$/u.test(raw)) {
      return { ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error: 'outOfRange' }
    }
    // Nur die ANZEIGE bekommt die Taschenrechner-Nullung; `raw` und `full` tragen den echten Wert
    // und damit den ehrlichen Vergleich der Genauigkeitsampel (ADR 0006, Karte M4-002). Ob genullt
    // wurde, geht als Kennzeichen mit — sonst wäre die Nullung wieder still.
    const genullt = anzeigeNull(math, value)
    const angezeigt = genullt ? '0' : raw
    return {
      ok: true,
      display: localizeNumber(angezeigt, options.decimalSeparator),
      raw,
      full,
      displayRoundedToZero: genullt,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error: classify(message) }
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
    const display = localizeNumber(text, options.decimalSeparator)
    // Eine ganze Zahl bleibt eine Zahl: „3/1“ wäre im Rechner verwirrend.
    // Der Bruch ist eine eigene Darstellung des echten Werts — hier wird nie auf null gerundet.
    if (/^-?\d+$/u.test(text)) return { ok: true, display, raw: text, full: text, displayRoundedToZero: false, error: null }
    return { ok: true, display, raw: text, full: text, displayRoundedToZero: false, error: null }
  } catch {
    return { ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error: 'unsupported' }
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

/**
 * Bringt einen Anzeigewert in den Dezimaltrenner der Sprache. Nur die **Anzeige** wird
 * umgeschrieben; `raw` behält immer den Punkt und bleibt damit in jedem Zahlenmodell
 * wieder einlesbar. Betroffen ist nur ein Punkt zwischen Ziffern — Exponenten (`1.5e+10`) werden
 * mitgenommen, Trennzeichen in anderen Schreibweisen (`3/4`, `F000`, `1 + 2i`) bleiben unberührt.
 */
export function localizeNumber(text: string, separator: ',' | '.' | undefined): string {
  if (!separator || separator === '.') return text
  return text.replace(/(\d)\.(?=\d)/gu, `$1${separator}`)
}

/** Zahlensysteme des Programmierer-Modus. */
export type NumberBase = 2 | 8 | 10 | 16

const BASE_NOTATION: Record<NumberBase, 'bin' | 'oct' | 'hex' | undefined> = {
  2: 'bin', 8: 'oct', 10: undefined, 16: 'hex'
}

/**
 * Stellt einen Wert in einem Zahlensystem dar. Die Zahl selbst bleibt exakt — nur die Schreibweise
 * ändert sich. Basis 10 bekommt die übliche Dezimaldarstellung.
 */
export function toBase(
  expression: string,
  base: NumberBase,
  options: CalculatorOptions = {}
): Calculation {
  const result = evaluate(expression, options)
  if (!result.ok) return result
  const math = calculatorFor(options)
  try {
    const notation = BASE_NOTATION[base]
    if (!notation) return result
    // `format` braucht den Wert, nicht die Zeichenkette: aus dem Rohwert neu einlesen.
    // Kein `wordSize` im Format: mathjs hängt sonst die Wortbreite als Suffix an (`0xffi64`) —
    // das Suffix beschreibt die Eingabe-Notation, nicht den Wert.
    const value = math.evaluate(result.raw)
    const text = math.format(value, { notation, precision: DISPLAY_PRECISION })
    // In einer anderen Basis ist die Schreibweise die ganze Zahl; die Ampel bleibt dort aus,
    // weil schon die Anzeige-Basis eine eigene Einstellung ist.
    return { ok: true, display: localizeNumber(text, options.decimalSeparator), raw: text, full: text, displayRoundedToZero: false, error: null }
  } catch {
    return { ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error: 'unsupported' }
  }
}

/**
 * Reduziert einen Wert auf eine Wortbreite und liest ihn als Zweierkomplement.
 * `signed` unterscheidet `intN` (mit Vorzeichen) von `uintN` (ohne) — genau der Unterschied,
 * den ein Programmiererrechner sichtbar machen muss.
 */
export function toWord(
  expression: string,
  bits: number,
  signed: boolean,
  options: CalculatorOptions = {}
): Calculation {
  const result = evaluate(expression, options)
  if (!result.ok) return result
  try {
    const value = BigInt(result.raw)
    const reduced = signed ? BigInt.asIntN(bits, value) : BigInt.asUintN(bits, value)
    const text = reduced.toString()
    return { ok: true, display: text, raw: text, full: text, displayRoundedToZero: false, error: null }
  } catch {
    // Kein ganzer Wert (etwa ein Bruch) — die Wortbreite ergibt dann keinen Sinn.
    return { ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error: 'wordRange' }
  }
}

const RPN_OPERATORS = new Set(['+', '-', '*', '/', '^', 'mod'])
const RPN_UNARY = new Set(['neg', 'sqrt', 'inv', 'fact'])

/**
 * Ein RPN-Schritt für den sichtbaren Rechenweg.
 * `stack` ist der Stapel **nach** dem Schritt — erst damit lässt sich der Rechenweg in der
 * Oberfläche Schritt für Schritt zeigen, ohne die Rechenregeln dort ein zweites Mal zu haben.
 */
export interface RpnStep {
  readonly expression: string
  readonly result: string
  readonly stack: readonly string[]
}

export interface RpnResult extends Calculation {
  /** Der Stapel nach jedem Schritt — macht den Rechenweg nachvollziehbar. */
  readonly steps: readonly RpnStep[]
  /** Der Stapel am Ende: genau ein Wert, sonst `stackLeftover`. */
  readonly stack: readonly string[]
}

/**
 * Schützt einen RPN-Operanden für die Verknüpfung zu einem mathjs-Ausdruck.
 *
 * `raw` ist die **Anzeigeform** des Werts. Ein Bruch wie `1/2` ist darin ein Ausdruck, kein
 * Wert: Ungeklammert ergäbe `1/2 / 1/3` nach linksassoziativer Präzedenz `((1/2)/1)/3` = 1/6
 * statt (1/2)/(1/3) = 3/2. Deshalb wird geklammert, sobald der Operand kein einfacher
 * Dezimaltoken ist; einfache Zahlen bleiben ohne Klammern, damit der Verlauf lesbar bleibt.
 */
function geschuetzterOperand(raw: string): string {
  return /^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/u.test(raw) ? raw : `(${raw})`
}

/**
 * Wertet die umgekehrte polnische Notation aus. Die Operanden werden **über mathjs**
 * verknüpft, nicht über eigene Rechenregeln — sonst entstünde eine zweite, abweichende
 * Rechenlogik neben dem Kern.
 */
export function evaluateRpn(
  tokens: readonly string[],
  options: CalculatorOptions = {},
  scope: Record<string, unknown> = {}
): RpnResult {
  const stack: string[] = []
  const steps: RpnStep[] = []
  const fail = (error: CalculatorErrorCode): RpnResult => ({ ok: false, display: '', raw: '', full: '', displayRoundedToZero: false, error, steps, stack: [...stack] })

  for (const token of tokens) {
    const entry = normalizeDecimalInput(token.trim())
    if (!entry) continue

    if (RPN_OPERATORS.has(entry)) {
      if (stack.length < 2) return fail('stackUnderflow')
      const right = stack.pop() as string
      const left = stack.pop() as string
      const expression = `${geschuetzterOperand(left)} ${entry} ${geschuetzterOperand(right)}`
      const step = evaluate(expression, options, scope)
      if (!step.ok) return { ...step, steps, stack: [...stack] }
      stack.push(step.raw)
      steps.push({ expression, result: step.display, stack: [...stack] })
      continue
    }

    if (RPN_UNARY.has(entry)) {
      if (stack.length < 1) return fail('stackUnderflow')
      const operand = stack.pop() as string
      const expression =
        entry === 'neg' ? `-(${operand})`
        : entry === 'sqrt' ? `sqrt(${operand})`
        : entry === 'inv' ? `1/(${operand})`
        : `factorial(${operand})`
      const step = evaluate(expression, options, scope)
      if (!step.ok) return { ...step, steps, stack: [...stack] }
      stack.push(step.raw)
      steps.push({ expression, result: step.display, stack: [...stack] })
      continue
    }

    const value = evaluate(entry, options, scope)
    if (!value.ok) return { ...value, steps, stack: [...stack] }
    stack.push(value.raw)
  }

  // Ein Ergebnis heißt genau ein Wert auf dem Stapel: sonst wurde etwas vergessen.
  if (stack.length !== 1) return fail('stackLeftover')
  const display = evaluate(stack[0] as string, options, scope)
  if (!display.ok) return { ...display, steps, stack: [...stack] }
  // Das Kennzeichen der Anzeige-Nullung kommt vom letzten Wert des Stapels — sonst wäre die
  // Nullung ausgerechnet im RPN-Rechner wieder still.
  return { ok: true, display: display.display, raw: display.raw, full: display.full, displayRoundedToZero: display.displayRoundedToZero, error: null, steps, stack: [...stack] }
}
