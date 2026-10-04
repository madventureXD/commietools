import { describe, expect, it } from 'vitest'
import { calculatorErrorCodes, evaluate, evaluateRpn, toBase, toFraction, toWord, withVariable } from '@commietools/tools/calculator/core'
import {
  calculatorAngleProbes,
  calculatorFunctions,
  calculatorProbes,
  calculatorWordSizes
} from '@commietools/tools/calculator/functions'
import { toolMessages } from '@commietools/tools'
import { supportedLocales } from '@commietools/i18n'
import { appendSnippet, splitRpnTokens } from './calculator-ui'

/**
 * Der Rechner-Kern. Drei Dinge werden hier bewiesen:
 * 1. Jeder angebotene Ausdruck wird tatsächlich ausgewertet — eine fehlende Factory in
 *    `functions.ts` bricht erst zur Laufzeit, nicht beim Bau.
 * 2. Die Operatorrangfolge stimmt an den Stellen, an denen `math-expression-evaluator`
 *    nachweislich scheitert.
 * 3. Jede im Werkzeug gelistete Funktion (Welle 2) wird aufgerufen.
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

describe('liste der Funktionen (Welle 2)', () => {
  it('calls every listed function without a runtime error', () => {
    for (const entry of calculatorFunctions) {
      const result = evaluate(entry.expression, { number: 'BigNumber' })
      expect(result.ok, `${entry.name}: ${entry.expression} -> ${String(result.error)}`).toBe(true)
    }
  })

  it('matches the expected value wherever one is given', () => {
    for (const entry of calculatorFunctions) {
      if (entry.expected === undefined) continue
      const result = evaluate(entry.expression, { number: 'BigNumber' })
      expect(result.display, `${entry.name}: ${entry.expression}`).toBe(entry.expected)
    }
  })

  it('covers both offered modes', () => {
    const modes = new Set(calculatorFunctions.map((entry) => entry.mode))
    expect(modes).toEqual(new Set(['scientific', 'programmer']))
  })

  it('lists every function name only once', () => {
    const names = calculatorFunctions.map((entry) => entry.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('Winkelmodi', () => {
  it('computes degrees and gradians', () => {
    for (const probe of calculatorAngleProbes) {
      const result = evaluate(probe.expression, { number: 'BigNumber', angleMode: probe.angleMode })
      expect(result.display, `${probe.angleMode}: ${probe.expression}`).toBe(probe.expected)
    }
  })

  it('returns a bare number from the inverse functions', () => {
    const result = evaluate('asin(0.5)', { number: 'BigNumber', angleMode: 'deg' })
    expect(result.display).toBe('30')
    // Ohne Einheit — sonst liefe „deg" als Einheit in die nächste Rechnung.
    expect(result.display).not.toContain('deg')
  })

  it('leaves radians untouched', () => {
    expect(evaluate('sin(pi/6)', { number: 'BigNumber', angleMode: 'rad' }).display).toBe('0.5')
    // 180° ist pi im Bogenmaß: der Grad-Modus darf das Bogenmaß nicht verändern.
    expect(evaluate('180', { number: 'BigNumber', angleMode: 'deg' }).display).toBe('180')
  })
})

describe('Programmierer-Modus', () => {
  it('shows the same value in other bases', () => {
    const hex = toBase('255', 16, { number: 'BigNumber' })
    const bin = toBase('5', 2, { number: 'BigNumber' })
    const oct = toBase('8', 8, { number: 'BigNumber' })
    expect(hex.ok, String(hex.error)).toBe(true)
    expect(bin.ok, String(bin.error)).toBe(true)
    expect(oct.ok, String(oct.error)).toBe(true)
    // Die Darstellung darf die Zahl nicht verändern.
    expect(toBase('255', 10, { number: 'BigNumber' }).display).toBe('255')
    // Konkrete Schreibweise: mathjs hängte mit `wordSize` im Format ein `i64` an (`0xffi64`),
    // das die Eingabe-Notation beschreibt und in einer Anzeige nichts zu suchen hat.
    expect(hex.display).toBe('0xff')
    expect(toBase('255', 2, { number: 'BigNumber' }).display).toBe('0b11111111')
    expect(toBase('255', 8, { number: 'BigNumber' }).display).toBe('0o377')
    expect(hex.display).not.toContain('i64')
  })

  it('reduces to every word size as twos complement', () => {
    for (const bits of calculatorWordSizes) {
      const unsigned = toWord('255', bits, false, { number: 'BigNumber' })
      expect(unsigned.ok, `${bits} bit unsigned: ${String(unsigned.error)}`).toBe(true)
      // In jeder Wortbreite ≥ 8 bleibt 255 darstellbar.
      expect(unsigned.display).toBe('255')
    }
    // Alles Einsen sind -1 mit Vorzeichen, 2^bits-1 ohne.
    expect(toWord('255', 8, true, { number: 'BigNumber' }).display).toBe('-1')
    expect(toWord('-1', 8, false, { number: 'BigNumber' }).display).toBe('255')
    expect(toWord('65535', 16, true, { number: 'BigNumber' }).display).toBe('-1')
    expect(toWord('255', 8, false, { number: 'BigNumber' }).display).toBe('255')
    // Der Überlauf wird abgeschnitten, nicht stillschweigend vergrößert.
    expect(toWord('256', 8, false, { number: 'BigNumber' }).display).toBe('0')
  })

  it('rejects non-integer values for a word size', () => {
    const result = toWord('1/3', 8, true, { number: 'Fraction' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('wordRange')
  })
})

describe('RPN-Stapel', () => {
  it('computes a simple stack', () => {
    const result = evaluateRpn(['3', '4', '+'], { number: 'BigNumber' })
    expect(result.ok, String(result.error)).toBe(true)
    expect(result.display).toBe('7')
  })

  it('computes a nested stack and shows the steps', () => {
    // 3 4 + 5 * = (3+4)*5 = 35
    const result = evaluateRpn(['3', '4', '+', '5', '*'], { number: 'BigNumber' })
    expect(result.display).toBe('35')
    expect(result.steps.length).toBe(2)
    expect(result.steps[0]?.expression).toBe('3 + 4')
    expect(result.steps[1]?.expression).toBe('7 * 5')
  })

  it('supports unary operations', () => {
    expect(evaluateRpn(['3', 'neg'], { number: 'BigNumber' }).display).toBe('-3')
    expect(evaluateRpn(['9', 'sqrt'], { number: 'BigNumber' }).display).toBe('3')
    expect(evaluateRpn(['4', 'inv'], { number: 'BigNumber' }).display).toBe('0.25')
    expect(evaluateRpn(['5', 'fact'], { number: 'BigNumber' }).display).toBe('120')
  })

  it('reports an empty stack instead of guessing', () => {
    expect(evaluateRpn(['+'], { number: 'BigNumber' }).error).toBe('stackUnderflow')
    // Zwei Werte ohne Operator sind kein Ergebnis, sondern ein offener Rest.
    expect(evaluateRpn(['1', '2'], { number: 'BigNumber' }).error).toBe('stackLeftover')
  })

  it('binds variables in the stack', () => {
    const scope = withVariable({}, 'breite', '4', { number: 'BigNumber' })
    expect(evaluateRpn(['breite', '3', '*'], { number: 'BigNumber' }, scope).display).toBe('12')
  })

  it('shows the stack after every step', () => {
    // Ohne den Zwischenstand könnte die Oberfläche den Rechenweg nicht zeigen, ohne ihn selbst
    // nachzurechnen — hier liegt er im Ergebnis.
    const result = evaluateRpn(['3', '4', '+', '5', '*'], { number: 'BigNumber' })
    expect(result.steps.map((step) => step.stack)).toEqual([['7'], ['35']])
    expect(result.stack).toEqual(['35'])
  })

  it('keeps the stack readable when an operation fails', () => {
    // Ein zweites „+" hat keinen zweiten Operanden: der bis dahin erreichte Stapel bleibt sichtbar.
    const result = evaluateRpn(['1', '2', '+', '+'], { number: 'BigNumber' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('stackUnderflow')
    expect(result.stack).toEqual(['3'])
  })
})

describe('Bedienung', () => {
  it('splits the RPN input at whitespace and keeps the decimal comma', () => {
    expect(splitRpnTokens('3 4 +')).toEqual(['3', '4', '+'])
    expect(splitRpnTokens('  3   4   +  ')).toEqual(['3', '4', '+'])
    expect(splitRpnTokens('3,5 2 *')).toEqual(['3,5', '2', '*'])
    expect(splitRpnTokens('   ')).toEqual([])
  })

  it('appends a key without welding it to the previous token', () => {
    expect(appendSnippet('', 'sin(')).toBe('sin(')
    expect(appendSnippet('2+3', 'sin(')).toBe('2+3 sin(')
    expect(appendSnippet('2+', 'sin(')).toBe('2+sin(')
    expect(appendSnippet('sin(', 'pi')).toBe('sin(pi')
    expect(appendSnippet('2 ', 'bitAnd')).toBe('2 bitAnd')
    expect(appendSnippet('4 5', '+')).toBe('4 5+')
  })
})

describe('Fehlertexte', () => {
  it('translates every error code of the core in every language', () => {
    for (const locale of supportedLocales) {
      for (const code of calculatorErrorCodes) {
        expect(toolMessages[locale]?.[`tool.calculator.error.${code}`], `${locale}/${code}`).toBeTruthy()
      }
    }
  })

  it('covers the angle mode in the fraction model as well', () => {
    // Das Bruchmodell darf den Winkelmodus nicht stillschweigend abschalten.
    const result = evaluate('sin(30)', { number: 'Fraction', angleMode: 'deg' })
    expect(result.ok, String(result.error)).toBe(true)
    expect(result.display).toBe('0.5')
  })
})
