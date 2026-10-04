/**
 * Gleichungslöser für das Werkzeug „Gleichungslöser" (Welle 5 der Suite „Rechnen").
 *
 * **Eigene Formeln, kein Computeralgebra-System.** Linear, quadratisch und kubisch lassen sich
 * geschlossen lösen — und nur so lässt sich der **Lösungsweg** zeigen, den die Abnahme verlangt.
 * Für Polynome höheren Grades bräuchte es ein CAS (`nerdamer`, 131 KiB gzip, im Konzept
 * ausgeschlossen) — hier bewusst nicht.
 *
 * Gerechnet wird in Gleitkomma: Wurzeln sind im Allgemeinen irrational, ein exakter Bruch ist
 * dort nicht möglich. Deshalb gehört zu jeder Lösung eine **Probe** — der Funktionswert an der
 * gefundenen Stelle. Jede Wurzel wird zusätzlich mit zwei Newton-Schritten nachpoliert; erst
 * die Probe entscheidet, ob die Wurzel brauchbar ist.
 *
 * Kubisch: Normalform x³ + px + q = 0 nach der Substitution x = y − B/3, dann Cardano. Der
 * casus irreducibilis (drei reelle Wurzeln) läuft über die trigonometrische Form — Cardano
 * allein liefert dort komplexe Zwischenwerte.
 */

export type EquationDegree = 'linear' | 'quadratic' | 'cubic'

export interface EquationStep {
  /** Beschriftungsschlüssel im Sprachkatalog. */
  readonly labelKey: string
  /** Rechenweg in Formelzeichen mit eingesetzten Zahlen — Mathematik, kein Anzeigetext. */
  readonly detail: string
}

export interface EquationRoot {
  /** Gerundeter Wert für die Anzeige. */
  readonly value: number
  /** Funktionswert an dieser Stelle — die Probe. */
  readonly check: number
  readonly multiplicity: number
}

export interface EquationSolution {
  readonly ok: boolean
  readonly degree: EquationDegree
  readonly roots: readonly EquationRoot[]
  readonly steps: readonly EquationStep[]
  readonly discriminant: number | null
  readonly vertex: number | null
  readonly error: 'invalid' | 'degenerate' | 'range' | null
}

const DIGITS = 12

/** Rundet auf zwölf gültige Stellen — genug zum Nachrechnen, wenig genug gegen Rauschen. */
export function round12(value: number): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const factor = 10 ** (DIGITS - 1 - Math.floor(Math.log10(Math.abs(value))))
  return Math.round(value * factor) / factor
}

function fail(degree: EquationDegree, error: 'invalid' | 'degenerate' | 'range'): EquationSolution {
  return { ok: false, degree, roots: [], steps: [], discriminant: null, vertex: null, error }
}

/** Wert des Polynoms an der Stelle x (Horner-Schema, weniger Rundungsfehler als Summe der Potenzen). */
export function evaluatePolynomial(coefficients: readonly number[], x: number): number {
  let result = 0
  for (const coefficient of coefficients) result = result * x + coefficient
  return result
}

/** Ableitung an der Stelle x — für die Newton-Schritte. */
function evaluateDerivative(coefficients: readonly number[], x: number): number {
  const degree = coefficients.length - 1
  let result = 0
  for (let index = 0; index < degree; index += 1) {
    result = result * x + (degree - index) * (coefficients[index] ?? 0)
  }
  return result
}

/** Poliert eine Wurzel mit Newton nach und liefert sie mit Probe. */
function polish(coefficients: readonly number[], start: number, multiplicity = 1): EquationRoot {
  let x = start
  for (let step = 0; step < 3; step += 1) {
    const f = evaluatePolynomial(coefficients, x)
    const df = evaluateDerivative(coefficients, x)
    if (df === 0 || !Number.isFinite(f) || !Number.isFinite(df)) break
    const next = x - f / df
    if (!Number.isFinite(next)) break
    x = next
  }
  return { value: round12(x), check: round12(evaluatePolynomial(coefficients, x)), multiplicity }
}

function readCoefficients(values: readonly string[], degree: EquationDegree): number[] | null {
  if (values.length === 2) {
    const [a, b] = values
    const first = Number((a ?? '').trim().replace(',', '.'))
    const second = Number((b ?? '').trim().replace(',', '.'))
    if (!Number.isFinite(first) || !Number.isFinite(second)) return null
    return degree === 'linear' ? [first, second] : null
  }
  if (values.length === 3) {
    const numbers = values.map((value) => Number(value.trim().replace(',', '.')))
    if (numbers.some((value) => !Number.isFinite(value))) return null
    return degree === 'quadratic' ? numbers : null
  }
  if (values.length === 4) {
    const numbers = values.map((value) => Number(value.trim().replace(',', '.')))
    if (numbers.some((value) => !Number.isFinite(value))) return null
    return degree === 'cubic' ? numbers : null
  }
  return null
}

/** `2x² + 3x - 5 = 0` als Text — reine Mathematik, deshalb hier und nicht im Sprachkatalog. */
export function polynomialText(coefficients: readonly number[]): string {
  const names = ['x³', 'x²', 'x', '']
  const parts: string[] = []
  coefficients.forEach((coefficient, index) => {
    if (coefficient === 0) return
    const name = names[names.length - coefficients.length + index] ?? ''
    const sign = parts.length === 0 ? (coefficient < 0 ? '-' : '') : coefficient < 0 ? ' − ' : ' + '
    const magnitude = Math.abs(round12(coefficient))
    const number = name && magnitude === 1 ? '' : String(magnitude)
    parts.push(`${sign}${number}${name}`)
  })
  return parts.length ? `${parts.join('')} = 0` : '0 = 0'
}

/** `B/3` im Text: Ein negatives Vorzeichen darf nicht als „y − -2" erscheinen. */
export function shiftText(shift: number): string {
  const value = round12(shift)
  if (value === 0) return 'y'
  return value > 0 ? `y − ${value}` : `y + ${Math.abs(value)}`
}

export function solve(degree: EquationDegree, values: readonly string[]): EquationSolution {
  const coefficients = readCoefficients(values, degree)
  if (!coefficients) return fail(degree, 'invalid')

  if (degree === 'linear') {
    const [a, b] = coefficients as [number, number]
    if (a === 0) {
      // Ohne x-Term ist es keine lineare Gleichung: entweder immer wahr oder nie.
      return { ...fail(degree, 'degenerate'), steps: [
        { labelKey: 'tool.equations.step.standard', detail: polynomialText(coefficients) },
        { labelKey: 'tool.equations.step.note', detail: b === 0 ? '0 = 0 — für jedes x erfüllt' : `${round12(b)} = 0 — nicht erfüllt` }
      ] }
    }
    const root = polish(coefficients, -b / a)
    return {
      ok: true,
      degree,
      roots: [root],
      steps: [
        { labelKey: 'tool.equations.step.standard', detail: polynomialText(coefficients) },
        { labelKey: 'tool.equations.step.isolate', detail: 'x = −b / a' },
        { labelKey: 'tool.equations.step.substitute', detail: `x = −(${round12(b)}) / (${round12(a)}) = ${root.value}` },
        { labelKey: 'tool.equations.step.check', detail: `f(${root.value}) = ${root.check}` }
      ],
      discriminant: null,
      vertex: null,
      error: null
    }
  }

  if (degree === 'quadratic') {
    const [a, b, c] = coefficients as [number, number, number]
    if (a === 0) return fail(degree, 'degenerate')
    const discriminant = b * b - 4 * a * c
    const vertex = -b / (2 * a)
    const steps: EquationStep[] = [
      { labelKey: 'tool.equations.step.standard', detail: polynomialText(coefficients) },
      { labelKey: 'tool.equations.step.discriminant', detail: `D = b² − 4ac = (${round12(b)})² − 4 · (${round12(a)}) · (${round12(c)}) = ${round12(discriminant)}` },
      { labelKey: 'tool.equations.step.formula', detail: 'x = (−b ± √D) / (2a)' },
      { labelKey: 'tool.equations.step.vertex', detail: `xS = −b / (2a) = ${round12(vertex)}` }
    ]
    if (discriminant < 0) {
      return {
        ok: true,
        degree,
        roots: [],
        steps: [...steps, { labelKey: 'tool.equations.step.noReal', detail: `D < 0 → keine reellen Lösungen (komplex: ${round12(vertex)} ± ${round12(Math.sqrt(-discriminant) / (2 * Math.abs(a)))} i)` }],
        discriminant,
        vertex,
        error: null
      }
    }
    const rootOfD = Math.sqrt(discriminant)
    const first = polish(coefficients, (-b + rootOfD) / (2 * a), discriminant === 0 ? 2 : 1)
    if (discriminant === 0) {
      return {
        ok: true,
        degree,
        roots: [first],
        steps: [...steps, { labelKey: 'tool.equations.step.substitute', detail: `x1 = x2 = (${round12(-b)}) / (2 · ${round12(a)}) = ${first.value}` }, { labelKey: 'tool.equations.step.check', detail: `f(${first.value}) = ${first.check}` }],
        discriminant,
        vertex,
        error: null
      }
    }
    const second = polish(coefficients, (-b - rootOfD) / (2 * a))
    const roots = [first, second].sort((left, right) => left.value - right.value)
    return {
      ok: true,
      degree,
      roots,
      steps: [
        ...steps,
        { labelKey: 'tool.equations.step.substitute', detail: `x1 = (${round12(-b)} + √${round12(discriminant)}) / (2 · ${round12(a)}) = ${roots[1]?.value}` },
        { labelKey: 'tool.equations.step.substitute', detail: `x2 = (${round12(-b)} − √${round12(discriminant)}) / (2 · ${round12(a)}) = ${roots[0]?.value}` },
        { labelKey: 'tool.equations.step.check', detail: `f(${roots[0]?.value}) = ${roots[0]?.check}, f(${roots[1]?.value}) = ${roots[1]?.check}` }
      ],
      discriminant,
      vertex,
      error: null
    }
  }

  // Kubisch: x³ + Bx² + Cx + D, dann Substitution x = y − B/3.
  const [a, b, c, d] = coefficients as [number, number, number, number]
  if (a === 0) return fail(degree, 'degenerate')
  const B = b / a
  const C = c / a
  const D = d / a
  const shift = B / 3
  const p = C - (B * B) / 3
  const q = (2 * B * B * B) / 27 - (B * C) / 3 + D
  const delta = (q / 2) ** 2 + (p / 3) ** 3

  const base: EquationStep[] = [
    { labelKey: 'tool.equations.step.standard', detail: polynomialText(coefficients) },
    { labelKey: 'tool.equations.step.normalize', detail: polynomialText([1, B, C, D]) },
    { labelKey: 'tool.equations.step.substitute', detail: `x = y − B/3 = ${shiftText(shift)}` },
    { labelKey: 'tool.equations.step.reduced', detail: polynomialText([1, p, q]).replace('x', 'y') },
    { labelKey: 'tool.equations.step.discriminant', detail: `Δ = (q/2)² + (p/3)³ = ${round12(delta)}` }
  ]

  // Die Kandidaten sind y-Werte der Normalform. Der Rückweg x = y − shift passiert **einmal**
  // am Ende: Ein Vorzeichenfehler an dieser Stelle verschiebt sonst alle Wurzeln, ohne dass die
  // Probe ihn bemerkt — sie prüft nur, ob der Wert eine Nullstelle ist.
  const candidatesY: number[] = []
  if (delta > 0) {
    const root = Math.cbrt(-q / 2 + Math.sqrt(delta)) + Math.cbrt(-q / 2 - Math.sqrt(delta))
    candidatesY.push(root)
    base.push({ labelKey: 'tool.equations.step.cardano', detail: `Δ > 0 → eine reelle Lösung: y = ∛(−q/2 + √Δ) + ∛(−q/2 − √Δ) = ${round12(root)}` })
  } else if (delta === 0) {
    const root = 2 * Math.cbrt(-q / 2)
    candidatesY.push(root, -Math.cbrt(-q / 2))
    base.push({ labelKey: 'tool.equations.step.cardano', detail: `Δ = 0 → mehrfache Lösung: y1 = 2∛(−q/2) = ${round12(root)}, y2 = y3 = −∛(−q/2) = ${round12(-Math.cbrt(-q / 2))}` })
  } else {
    // Casus irreducibilis: drei reelle Wurzeln über die trigonometrische Form.
    const radius = 2 * Math.sqrt(-p / 3)
    const angle = Math.acos((3 * q) / (2 * p) * Math.sqrt(-3 / p))
    for (let index = 0; index < 3; index += 1) {
      candidatesY.push(radius * Math.cos((angle - 2 * Math.PI * index) / 3))
    }
    base.push({ labelKey: 'tool.equations.step.cardano', detail: `Δ < 0 → drei reelle Lösungen über die trigonometrische Form (casus irreducibilis): y = 2√(−p/3) · cos(⅓·arccos(…) − 2πk/3)` })
  }

  const roots = candidatesY
    .map((candidate) => polish(coefficients, candidate - shift))
    .filter((root) => Number.isFinite(root.value))
    .sort((left, right) => left.value - right.value)
    // Mehrfachwurzeln zusammenfassen (Δ = 0 liefert dieselbe Stelle zweimal).
    .filter((root, index, all) => index === 0 || Math.abs((all[index - 1]?.value ?? Number.NaN) - root.value) > 1e-9)

  return {
    ok: true,
    degree,
    roots,
    steps: [...base, { labelKey: 'tool.equations.step.back', detail: `x = ${shiftText(shift)}` }, { labelKey: 'tool.equations.step.check', detail: roots.map((root) => `f(${root.value}) = ${root.check}`).join(', ') }],
    discriminant: round12(delta),
    vertex: null,
    error: null
  }
}

/** Probe: Der größte Betrag der Funktionswerte an den gefundenen Wurzeln. */
export function worstCheck(solution: EquationSolution): number {
  return solution.roots.reduce((worst, root) => Math.max(worst, Math.abs(root.check)), 0)
}
