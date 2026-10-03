import { describe, expect, it } from 'vitest'
import { evaluate, toFraction, withVariable } from '@commietools/tools/calculator/core'
import { calculatorProbes } from '@commietools/tools/calculator/functions'

/**
 * Der Rechner-Kern. Zwei Dinge werden hier bewiesen:
 * 1. Jeder angebotene Ausdruck wird tatsächlich ausgewertet — eine fehlende Factory in
 *    `functions.ts` bricht erst zur Laufzeit, nicht beim Bau.
 * 2. Die Operatorrangfolge stimmt an den Stellen, an denen `math-expression-evaluator`
 *    nachweislich scheitert.
 */
describe('calculator core', () => {
  it('evaluates every probe expression', () => {
    for (const probe of calculatorProbes) {
      const result = evaluate(probe.expression, { number: 'BigNumber' })
      expect(result.ok, `${probe.expression} -> ${String(result.error)}`).toBe(true)
    }
  })

  it('matches the expected values of the probes', () => {
    for (const probe of calculatorProbes) {
      if (!probe.expected) continue
      const result = evaluate(probe.expression, { number: 'BigNumber' })
      expect(result.display, probe.expression).toBe(probe.expected)
    }
  })

  it('gets operator precedence right', () => {
    // Rechtsassoziativ: 2^(3^2) = 512, nicht (2^3)^2 = 64.
    expect(evaluate('2^3^2', { number: 'BigNumber' }).display).toBe('512')
    // Unäres Minus bindet schwächer als die Potenz.
    expect(evaluate('-2^2', { number: 'BigNumber' }).display).toBe('-4')
    // Implizite Multiplikation.
    expect(evaluate('2(3+4)', { number: 'BigNumber' }).display).toBe('14')
  })

  it('computes decimals exactly in BigNumber mode', () => {
    const result = evaluate('0.1 + 0.2', { number: 'BigNumber' })
    expect(result.display).toBe('0.3')
    expect(evaluate('(0.1 + 0.2) == 0.3', { number: 'BigNumber' }).display).toBe('true')
    expect(evaluate('0.1 * 3', { number: 'BigNumber' }).display).toBe('0.3')
  })

  it('computes fractions exactly in Fraction mode', () => {
    // Im Bruchmodus bleibt das Ergebnis ein Bruch — das ist der Zweck des Modus.
    expect(evaluate('1/3 + 1/6', { number: 'Fraction' }).display).toBe('1/2')
    expect(toFraction('1/3 + 1/6', { number: 'Fraction' }).display).toBe('1/2')
    expect(toFraction('0.75', { number: 'Fraction' }).display).toBe('3/4')
    expect(evaluate('2/3 + 1/6', { number: 'Fraction' }).display).toBe('5/6')
  })

  it('reports empty input as its own class', () => {
    const result = evaluate('   ')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('empty')
  })

  it('classifies errors instead of throwing', () => {
    // mathjs wirft im BigNumber-Modell nicht, sondern liefert `Infinity`.
    expect(evaluate('1/0', { number: 'BigNumber' }).error).toBe('outOfRange')
    expect(evaluate('(1+2', { number: 'BigNumber' }).error).toBe('syntax')
    expect(evaluate('nichtvorhanden(3)', { number: 'BigNumber' }).error).toBe('unknownName')
  })

  it('binds named variables through the scope', () => {
    const scope = withVariable({}, 'hoehe', '2.80', { number: 'BigNumber' })
    expect(scope.hoehe).toBe('2.8')
    expect(evaluate('hoehe * 3', { number: 'BigNumber' }, scope).display).toBe('8.4')
    // Ein ungültiger Wert lässt die Variable unangetastet.
    expect(withVariable(scope, 'hoehe', '((((', { number: 'BigNumber' }).hoehe).toBe('2.8')
  })
})
