import { describe, expect, it } from 'vitest'
import { evaluatePolynomial, polynomialText, round12, shiftText, solve, worstCheck } from '@commietools/tools/calculator/equations'
import { parseNumbers, parsePairs, quantile, regress, regressionText, summarise } from '@commietools/tools/calculator/statistics'
import { buildGeometry, findRoots, niceTicks, sampleTable, segmentToPath, valueAt } from '@commietools/tools/calculator/plotter'

/**
 * Welle 5 der Rechner-Suite: Gleichungslöser, Statistik, Funktionsplotter.
 *
 * Der Gleichungslöser wird **doppelt** geprüft: gegen bekannte Wurzeln **und** gegen die Probe
 * (Funktionswert an der gefundenen Stelle). Die Statistik gegen unabhängige Nachrechnung.
 */

describe('Gleichungslöser — linear', () => {
  it('solves a linear equation and shows the way', () => {
    const solution = solve('linear', ['2', '4'])
    expect(solution.ok, String(solution.error)).toBe(true)
    expect(solution.roots[0]?.value).toBeCloseTo(-2, 9)
    expect(worstCheck(solution)).toBeLessThan(1e-6)
    // Der Lösungsweg muss die Formel und die eingesetzten Zahlen enthalten.
    const details = solution.steps.map((step) => step.detail).join('\n')
    expect(details).toContain('2x + 4 = 0')
    expect(details).toContain('x = −b / a')
    expect(details).toContain('f(-2) = 0')
  })

  it('refuses a missing x term instead of dividing by zero', () => {
    expect(solve('linear', ['0', '5']).ok).toBe(false)
    expect(solve('linear', ['0', '5']).error).toBe('degenerate')
    // 0 = 0 ist für jedes x erfüllt — das ist keine Wurzel, sondern eine Aussage.
    expect(solve('linear', ['0', '0']).steps.at(-1)?.detail).toContain('0 = 0')
  })
})

describe('Gleichungslöser — quadratisch', () => {
  it('solves x² − 5x + 6 = 0', () => {
    const solution = solve('quadratic', ['1', '-5', '6'])
    expect(solution.ok, String(solution.error)).toBe(true)
    expect(solution.roots.map((root) => root.value)).toEqual([2, 3])
    expect(solution.discriminant).toBeCloseTo(1, 9)
    expect(solution.vertex).toBeCloseTo(2.5, 9)
    expect(worstCheck(solution)).toBeLessThan(1e-6)
  })

  it('reports a double root once', () => {
    const solution = solve('quadratic', ['1', '-4', '4'])
    expect(solution.roots.length).toBe(1)
    expect(solution.roots[0]?.value).toBeCloseTo(2, 9)
    expect(solution.roots[0]?.multiplicity).toBe(2)
    expect(solution.discriminant).toBeCloseTo(0, 9)
  })

  it('reports no real solution for a negative discriminant', () => {
    const solution = solve('quadratic', ['1', '0', '1'])
    expect(solution.ok).toBe(true)
    expect(solution.roots).toEqual([])
    expect(solution.discriminant).toBeCloseTo(-4, 9)
    expect(solution.steps.at(-1)?.detail).toContain('keine reellen Lösungen')
  })

  it('solves an equation with a leading coefficient other than one', () => {
    // 2x² − 8 = 0 → x = ±2
    const solution = solve('quadratic', ['2', '0', '-8'])
    expect(solution.roots.map((root) => root.value)).toEqual([-2, 2])
  })

  it('reads a decimal comma', () => {
    const solution = solve('quadratic', ['1', '-2,5', '1'])
    expect(solution.ok).toBe(true)
    expect(worstCheck(solution)).toBeLessThan(1e-6)
  })
})

describe('Gleichungslöser — kubisch', () => {
  it('writes the substitution with a clean sign', () => {
    // „y − -2" wäre formal richtig und trotzdem falsch zu lesen.
    expect(shiftText(-2)).toBe('y + 2')
    expect(shiftText(2)).toBe('y − 2')
    expect(shiftText(0)).toBe('y')
  })

  it('finds three real roots (casus irreducibilis)', () => {
    // x³ − 6x² + 11x − 6 = (x−1)(x−2)(x−3) → Δ < 0
    const solution = solve('cubic', ['1', '-6', '11', '-6'])
    expect(solution.ok, String(solution.error)).toBe(true)
    expect(solution.roots.map((root) => root.value)).toEqual([1, 2, 3])
    expect(worstCheck(solution)).toBeLessThan(1e-6)
    expect(solution.discriminant).toBeLessThan(0)
    expect(solution.steps.map((step) => step.detail).join('\n')).toContain('casus irreducibilis')
  })

  it('finds the single real root when Δ > 0', () => {
    // x³ + x + 1 = 0 hat genau eine reelle Wurzel bei etwa −0,6823.
    const solution = solve('cubic', ['1', '0', '1', '1'])
    expect(solution.ok, String(solution.error)).toBe(true)
    expect(solution.roots.length).toBe(1)
    expect(solution.roots[0]?.value).toBeCloseTo(-0.6823278, 6)
    expect(worstCheck(solution)).toBeLessThan(1e-6)
  })

  it('handles Δ = 0 with a double root', () => {
    // x³ − 3x + 2 = (x−1)²(x+2)
    const solution = solve('cubic', ['1', '0', '-3', '2'])
    expect(solution.ok, String(solution.error)).toBe(true)
    expect(solution.roots.map((root) => root.value)).toEqual([-2, 1])
    expect(worstCheck(solution)).toBeLessThan(1e-6)
  })

  it('normalises a cubic with a leading coefficient other than one', () => {
    // 2x³ − 2x = 0 → x = −1, 0, 1
    const solution = solve('cubic', ['2', '0', '-2', '0'])
    expect(solution.roots.map((root) => root.value)).toEqual([-1, 0, 1])
    expect(worstCheck(solution)).toBeLessThan(1e-6)
  })

  it('refuses a degenerate case and unreadable input', () => {
    expect(solve('cubic', ['0', '1', '1', '1']).error).toBe('degenerate')
    expect(solve('quadratic', ['a', 'b', 'c']).error).toBe('invalid')
    expect(solve('linear', ['1']).error).toBe('invalid')
  })
})

describe('Gleichungslöser — Werkzeugfunktionen', () => {
  it('writes the polynomial and evaluates it by Horner', () => {
    expect(polynomialText([1, -5, 6])).toBe('x² − 5x + 6 = 0')
    expect(polynomialText([1, 0, -4])).toBe('x² − 4 = 0')
    expect(polynomialText([2, -4])).toBe('2x − 4 = 0')
    // Horner muss dasselbe liefern wie die direkte Rechnung.
    expect(evaluatePolynomial([1, -5, 6], 3)).toBeCloseTo(0, 12)
    expect(evaluatePolynomial([1, -5, 6], 2.5)).toBeCloseTo(2.5 ** 2 - 5 * 2.5 + 6, 12)
  })

  it('rounds to twelve significant digits', () => {
    expect(round12(0.6823278038280193)).toBe(0.682327803828)
    expect(round12(0)).toBe(0)
  })
})

describe('Statistik — Kennwerte gegen Nachrechnung', () => {
  it('computes the position measures', () => {
    const result = summarise('1 2 3 4')
    expect(result.ok, String(result.error)).toBe(true)
    expect(result.count).toBe(4)
    expect(result.values.sum).toBe(10)
    expect(result.values.mean).toBe(2.5)
    expect(result.values.median).toBe(2.5)
    expect(result.values.min).toBe(1)
    expect(result.values.max).toBe(4)
    expect(result.values.range).toBe(3)
  })

  it('computes quartiles by linear interpolation (type 7)', () => {
    // Position (n−1)·p: Q1 bei 0,75 → 1 + 0,75 · (2−1) = 1,75; Q3 bei 2,25 → 3,25
    expect(quantile([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75, 10)
    expect(quantile([1, 2, 3, 4], 0.75)).toBeCloseTo(3.25, 10)
    const result = summarise('1 2 3 4')
    expect(result.values.iqr).toBeCloseTo(1.5, 10)
    expect(result.values.lowerFence).toBeCloseTo(-0.5, 10)
    expect(result.values.upperFence).toBeCloseTo(5.5, 10)
  })

  it('shows both spreads and checks them independently', () => {
    const values = [1, 2, 3, 4]
    const mean = 2.5
    const sumSquares = values.reduce((total, value) => total + (value - mean) ** 2, 0)
    const result = summarise('1 2 3 4')
    expect(result.values.variancePopulation).toBeCloseTo(sumSquares / 4, 10)
    expect(result.values.varianceSample).toBeCloseTo(sumSquares / 3, 10)
    expect(result.values.deviationPopulation).toBeCloseTo(Math.sqrt(sumSquares / 4), 10)
    expect(result.values.deviationSample).toBeCloseTo(Math.sqrt(sumSquares / 3), 10)
  })

  it('stays stable where the short formula loses the sign', () => {
    // Große Werte, kleine Streuung: Die Kurzform Σx² − n·x̄² kann hier negativ werden.
    const result = summarise('1000000001 1000000002 1000000003')
    expect(result.ok).toBe(true)
    expect(result.values.variancePopulation).toBeGreaterThan(0)
    expect(result.values.deviationPopulation).toBeCloseTo(0.816496580928, 9)
  })

  it('finds the mode only when a value really repeats', () => {
    expect(summarise('1 2 3').values.modeCount).toBe(0)
    const repeated = summarise('1 1 2')
    expect(repeated.values.modeCount).toBe(1)
    expect(repeated.values.modes).toBe(1)
  })

  it('reads a decimal comma and reports what it could not read', () => {
    const parsed = parseNumbers('1,5 2,5 abc 3')
    expect(parsed.numbers).toEqual([1.5, 2.5, 3])
    expect(parsed.ignored).toEqual(['abc'])
    const result = summarise('1 2 abc')
    expect(result.ok).toBe(true)
    expect(result.ignored).toEqual(['abc'])
    expect(summarise('abc').error).toBe('invalid')
    expect(summarise('').error).toBe('empty')
  })
})

describe('Statistik — Regression', () => {
  it('reproduces a perfect line', () => {
    const result = regress('1 2\n2 4\n3 6')
    expect(result.ok, String(result.error)).toBe(true)
    expect(result.slope).toBeCloseTo(2, 10)
    expect(result.intercept).toBeCloseTo(0, 10)
    expect(result.correlation).toBeCloseTo(1, 10)
    expect(result.rSquared).toBeCloseTo(1, 10)
    expect(regressionText(result.slope, result.intercept)).toBe('y = 2 x + 0')
  })

  it('computes slope and correlation against the independent formula', () => {
    const pairs: Array<[number, number]> = [[1, 1], [2, 3], [3, 2], [4, 5], [5, 4]]
    const n = pairs.length
    const meanX = pairs.reduce((total, [x]) => total + x, 0) / n
    const meanY = pairs.reduce((total, [, y]) => total + y, 0) / n
    const sxy = pairs.reduce((total, [x, y]) => total + (x - meanX) * (y - meanY), 0)
    const sxx = pairs.reduce((total, [x]) => total + (x - meanX) ** 2, 0)
    const syy = pairs.reduce((total, [, y]) => total + (y - meanY) ** 2, 0)

    const result = regress('1 1\n2 3\n3 2\n4 5\n5 4')
    expect(result.slope).toBeCloseTo(sxy / sxx, 10)
    expect(result.intercept).toBeCloseTo(meanY - (sxy / sxx) * meanX, 10)
    expect(result.correlation).toBeCloseTo(sxy / Math.sqrt(sxx * syy), 10)
    expect(result.rSquared).toBeLessThan(1)
  })

  it('refuses data it cannot fit', () => {
    // Alle x gleich: keine Gerade eindeutig bestimmbar.
    expect(regress('5 1\n5 2\n5 3').error).toBe('range')
    expect(regress('1 2').error).toBe('range')
    expect(regress('').error).toBe('empty')
    expect(parsePairs('1 2\n3 4 5').ignored).toEqual(['3 4 5'])
  })
})

describe('Funktionsplotter', () => {
  it('computes function values through the calculator core', () => {
    expect(valueAt('x^2', 3)).toBe(9)
    expect(valueAt('x^2 - 4', 2)).toBe(0)
    expect(valueAt('sin(x)', 0)).toBe(0)
    // Division durch null ist keine Zahl — die Stelle muss als „nicht definiert" gelten.
    expect(valueAt('1/x', 0)).toBe(null)
  })

  it('builds a sample table over the requested domain', () => {
    const table = sampleTable([{ expression: 'x^2' }], { xMin: 0, xMax: 10 }, 11)
    expect(table.length).toBe(11)
    expect(table[0]?.x).toBe(0)
    expect(table[0]?.values[0]).toBe(0)
    expect(table[5]?.x).toBe(5)
    expect(table[5]?.values[0]).toBe(25)
    expect(table[10]?.x).toBe(10)
    expect(table[10]?.values[0]).toBe(100)
    expect(sampleTable([{ expression: 'x' }], { xMin: 5, xMax: 5 }).length).toBe(0)
  })

  it('finds the roots of a parabola', () => {
    const roots = findRoots([{ expression: 'x^2 - 4' }], { xMin: -5, xMax: 5, yMin: -10, yMax: 10 })
    expect(roots.length).toBe(2)
    expect(roots[0]?.x).toBeCloseTo(-2, 6)
    expect(roots[1]?.x).toBeCloseTo(2, 6)
    expect(roots.every((root) => root.curve === 0)).toBe(true)
  })

  it('finds several curves and their roots separately', () => {
    const roots = findRoots(
      [{ expression: 'x - 1' }, { expression: 'x + 2' }],
      { xMin: -5, xMax: 5, yMin: -10, yMax: 10 }
    )
    expect(roots.map((root) => [root.curve, Number(root.x.toFixed(6))])).toEqual([[0, 1], [1, -2]])
  })

  it('does not mistake a pole for a root', () => {
    // 1/x wechselt bei 0 das Vorzeichen, ohne dort definiert zu sein — das ist KEINE Nullstelle.
    const roots = findRoots([{ expression: '1/x' }], { xMin: -5, xMax: 5, yMin: -10, yMax: 10 })
    expect(roots).toEqual([])
  })

  it('builds geometry with axes and nice ticks', () => {
    const geometry = buildGeometry([{ expression: 'x^2', color: '#c91f2c' }], { xMin: -3, xMax: 3 }, 60, 600, 300)
    expect(geometry.width).toBe(600)
    expect(geometry.paths.length).toBe(1)
    expect(geometry.paths[0]?.hasValues).toBe(true)
    expect(geometry.paths[0]?.segments.length).toBe(1)
    // Gitter und Beschriftungen entstehen aus dem sichtbaren Bereich.
    expect(geometry.grid.some((line) => line.axis === 'x')).toBe(true)
    expect(geometry.grid.some((line) => line.axis === 'y')).toBe(true)
    expect(geometry.xLabels.length).toBeGreaterThan(2)
    expect(geometry.yLabels.length).toBeGreaterThan(2)
    expect(geometry.bounds.xMin).toBe(-3)
    expect(geometry.bounds.xMax).toBe(3)
    // y-Grenzen werden ohne Vorgabe aus den Werten abgeleitet und schließen die Kurve ein.
    expect(geometry.bounds.yMin).toBeLessThan(0)
    expect(geometry.bounds.yMax).toBeGreaterThan(9)
  })

  it('breaks the line where the function is not defined', () => {
    // 1/x hat bei 0 keine Definitionslücke in der Zeichnung, sondern einen Bruch: zwei Äste.
    const geometry = buildGeometry([{ expression: '1/x', color: '#000000' }], { xMin: -2, xMax: 2 }, 40, 600, 300)
    expect(geometry.paths[0]?.segments.length).toBe(2)
  })

  it('writes a curve as an SVG path', () => {
    const path = segmentToPath([{ x: 0, y: 10 }, { x: 5, y: 20 }])
    expect(path).toBe('M 0.00 10.00 L 5.00 20.00')
  })

  it('picks readable axis steps', () => {
    expect(niceTicks(0, 10)).toEqual([0, 2, 4, 6, 8, 10])
    // Ein Bereich von sechs Einheiten bekommt den Schritt 1 — sieben Linien für ein Ziel von sechs.
    expect(niceTicks(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2, 3])
    expect(niceTicks(0, 1)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(niceTicks(5, 5)).toEqual([])
  })

})
