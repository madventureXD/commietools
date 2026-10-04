import { describe, expect, it } from 'vitest'
import {
  annuityPlan,
  cashDiscount,
  compoundInterest,
  discount,
  formatNumber,
  margin,
  markup,
  parseNumber,
  percentBase,
  percentShare,
  percentValue,
  ruleOfThree,
  vatAdd,
  vatRemove
} from '@commietools/tools/calculator/commercial'
import { geometryShapeById, roundForDisplay } from '@commietools/tools/calculator/geometry'

/**
 * Welle 3 der Rechner-Suite. Beide Kerne werden **gegen unabhängige Nachrechnung** geprüft:
 * Erwartungswerte stehen als eigene Rechnung im Test, nicht als abgeschriebene Zahl.
 *
 * Werte werden numerisch verglichen und die Schreibweise getrennt geprüft: Ein Test auf
 * „47.50“ würde zwei Dinge auf einmal prüfen und bei einer Formatänderung den Rechenfehler
 * verdecken.
 */

function ok(result: { ok: boolean; values?: Readonly<Record<string, string>>; error?: string | null }) {
  expect(result.ok, `Fehler: ${String(result.error)}`).toBe(true)
  return result.values ?? {}
}

function num(result: { ok: boolean; display?: string; error?: string | null }): number {
  expect(result.ok, `Fehler: ${String(result.error)}`).toBe(true)
  return Number(result.display)
}

describe('Kaufmännisch — Prozent in drei Richtungen', () => {
  it('computes the percentage value', () => {
    expect(num(percentValue('250', '19'))).toBeCloseTo(47.5, 10)
    expect(num(percentValue('200', '7.5'))).toBeCloseTo(15, 10)
  })

  it('computes the percentage share', () => {
    expect(num(percentShare('47.50', '250'))).toBeCloseTo(19, 10)
    expect(num(percentShare('15', '200'))).toBeCloseTo(7.5, 10)
  })

  it('computes the base value', () => {
    expect(num(percentBase('47.50', '19'))).toBeCloseTo(250, 10)
    expect(num(percentBase('15', '7.5'))).toBeCloseTo(200, 10)
  })

  it('is a closed circle within the cent rounding', () => {
    // Die Zwischenwerte werden auf Cent gerundet — die Rückrechnung trifft deshalb den
    // Ausgangswert bis auf die Rundung von einem Cent je Schritt, nicht auf den Cent genau.
    for (const [base, percent] of [['1234.56', '19'], ['999999.99', '0.5']]) {
      const part = num(percentValue(base as string, percent as string))
      const back = num(percentBase(String(part), percent as string))
      expect(Math.abs(back - Number(base)), `${base}/${percent}`).toBeLessThanOrEqual(0.02)
    }
  })

  it('loses sub-cent amounts by design, not by accident', () => {
    // 3 % von 0,05 € sind 0,0015 € — in Cent ist das null. Das ist die Grenze der
    // Cent-Rechnung und wird hier festgehalten, damit sie nicht als Rechenfehler durchgeht.
    expect(percentValue('0.05', '3').display).toBe('0.00')
    expect(percentValue('0.05', '20').display).toBe('0.01')
  })

  it('writes amounts with two decimals and no floating point noise', () => {
    expect(percentValue('250', '19').display).toBe('47.50')
    expect(percentShare('47.50', '250').display).toBe('19.00')
    expect(formatNumber(parseNumber('1234.56') as bigint)).toBe('1234.56')
    expect(formatNumber(parseNumber('-12.5') as bigint)).toBe('-12.50')
    expect(formatNumber(parseNumber('1.234,56') as bigint)).toBe('1234.56')
  })
})

describe('Kaufmännisch — Rabatt, Aufschlag, Marge', () => {
  it('discounts and keeps the sum consistent', () => {
    const values = ok(discount('119', '20'))
    expect(Number(values.rabatt)).toBeCloseTo(23.8, 10)
    expect(Number(values.endpreis)).toBeCloseTo(95.2, 10)
    // Gegenprobe: Rabatt + Endpreis müssen den Ausgangsbetrag ergeben.
    expect(Number(values.rabatt) + Number(values.endpreis)).toBeCloseTo(119, 10)
  })

  it('adds a markup to the cost price', () => {
    const values = ok(markup('80', '25'))
    expect(Number(values.aufschlag)).toBeCloseTo(20, 10)
    expect(Number(values.verkaufspreis)).toBeCloseTo(100, 10)
  })

  it('separates margin and markup and proves the difference', () => {
    const values = ok(margin('100', '80'))
    expect(Number(values.rohertrag)).toBeCloseTo(20, 10)
    // Marge bezieht sich auf den Verkaufspreis, der Aufschlag auf den Einkaufspreis.
    expect(Number(values.marge)).toBeCloseTo(20, 10)
    expect(Number(values.aufschlag)).toBeCloseTo(25, 10)
    // Gegenprobe: derselbe Rohertrag aus beiden Richtungen.
    expect(Number(ok(markup('80', '25')).verkaufspreis)).toBeCloseTo(100, 10)
    expect(Number(ok(discount('100', '20')).endpreis)).toBeCloseTo(80, 10)
  })

  it('refuses a discount beyond the price', () => {
    expect(discount('100', '120').ok).toBe(false)
    expect(discount('100', '120').error).toBe('range')
  })
})

describe('Kaufmännisch — Umsatzsteuer', () => {
  it('adds the tax on top of the net amount', () => {
    const values = ok(vatAdd('100', '19'))
    expect(Number(values.netto)).toBeCloseTo(100, 10)
    expect(Number(values.steuer)).toBeCloseTo(19, 10)
    expect(Number(values.brutto)).toBeCloseTo(119, 10)
  })

  it('takes the tax out of a gross amount without rounding up', () => {
    const values = ok(vatRemove('119', '19'))
    expect(Number(values.netto)).toBeCloseTo(100, 10)
    expect(Number(values.steuer)).toBeCloseTo(19, 10)
    // Die Umkehrung muss wieder genau beim Ausgangswert landen.
    expect(Number(ok(vatAdd(values.netto ?? '', '19')).brutto)).toBeCloseTo(119, 10)
    // Sieben Prozent, damit es nicht nur mit dem Normalsatz stimmt.
    expect(Number(ok(vatRemove('107', '7')).netto)).toBeCloseTo(100, 10)
  })

  it('takes the reduction from the net amount, not from the gross amount', () => {
    // Der häufige Fehler: 19 % vom Bruttobetrag abziehen. Das ergäbe 96,39 statt 100.
    const wrong = 119 - 119 * 0.19
    expect(Math.abs(wrong - 100)).toBeGreaterThan(0.5)
    expect(Number(ok(vatRemove('119', '19')).netto)).toBeCloseTo(100, 10)
  })
})

describe('Kaufmännisch — Skonto, Dreisatz, Zinsen, Tilgung', () => {
  it('computes the cash discount', () => {
    const values = ok(cashDiscount('1190', '3'))
    expect(Number(values.skonto)).toBeCloseTo(35.7, 10)
    expect(Number(values.zahlbetrag)).toBeCloseTo(1154.3, 10)
  })

  it('solves the rule of three', () => {
    // 3 verhält sich zu 4,5 wie 7 zu x → x = 10,5
    expect(num(ruleOfThree('3', '4.5', '7'))).toBeCloseTo(10.5, 10)
    expect(num(ruleOfThree('100', '1', '250'))).toBeCloseTo(2.5, 10)
  })

  it('computes compound interest against an independent power', () => {
    const values = ok(compoundInterest('1000', '3', '10'))
    // Unabhängige Nachrechnung mit der Potenzfunktion von JavaScript.
    expect(Number(values.endkapital)).toBeCloseTo(1000 * 1.03 ** 10, 2)
    expect(values.endkapital).toBe('1343.92')
    expect(values.zinsen).toBe('343.92')
  })

  it('builds an annuity plan that ends at zero', () => {
    const plan = annuityPlan('100000', '4', '10', 12)
    expect(plan.ok, String(plan.error)).toBe(true)
    expect(plan.rows.length).toBe(120)
    // Unabhängige Nachrechnung der Annuität: A = K·i / (1 − (1+i)^−n).
    const i = 0.04 / 12
    const expected = (100000 * i) / (1 - (1 + i) ** -120)
    expect(Number(plan.annuity)).toBeCloseTo(expected, 2)
    // Der Plan muss aufgehen: Restschuld null und die Tilgungen summieren sich zum Darlehen.
    expect(plan.rows[plan.rows.length - 1]?.balance).toBe('0.00')
    const principalSum = plan.rows.reduce((total, row) => total + Number(row.principal), 0)
    expect(principalSum).toBeCloseTo(100000, 2)
    const interestSum = plan.rows.reduce((total, row) => total + Number(row.interest), 0)
    const paymentSum = plan.rows.reduce((total, row) => total + Number(row.payment), 0)
    expect(paymentSum).toBeCloseTo(100000 + interestSum, 2)
    // Die Restschuld muss monoton fallen — kein Plan mit Tilgung im letzten Moment.
    const balances = plan.rows.map((row) => Number(row.balance))
    for (let index = 1; index < balances.length; index += 1) {
      expect(balances[index] ?? 0, `Periode ${index + 1}`).toBeLessThanOrEqual(balances[index - 1] ?? 0)
    }
  })

  it('handles a loan without interest without dividing by zero', () => {
    const plan = annuityPlan('1200', '0', '1', 12)
    expect(plan.ok, String(plan.error)).toBe(true)
    expect(plan.rows.length).toBe(12)
    expect(Number(plan.rows[0]?.payment)).toBeCloseTo(100, 10)
    expect(plan.rows[11]?.balance).toBe('0.00')
  })

  it('refuses an unrepresentable number of periods', () => {
    expect(annuityPlan('1000', '4', '200', 12).error).toBe('periods')
    expect(compoundInterest('1000', '3', '500').error).toBe('periods')
  })
})

describe('Kaufmännisch — Zahleneingabe und Genauigkeit', () => {
  it('reads German and English notation', () => {
    expect(parseNumber('1.234,56')).toBe(parseNumber('1234.56'))
    expect(parseNumber('1.234')).toBe(1234n * 10n ** 12n)
    expect(parseNumber('0,05')).toBe(50000000000n)
    expect(parseNumber('-12,5')).toBe(-125n * 10n ** 11n)
    expect(parseNumber('')).toBe(null)
    expect(parseNumber('abc')).toBe(null)
  })

  it('does not produce floating point noise', () => {
    // Der klassische Fall: 0,1 + 0,2 darf hier nie 0,30000000000000004 ergeben.
    const values = ok(vatAdd('0.1', '200'))
    expect(Number(values.steuer)).toBeCloseTo(0.2, 10)
    expect(Number(values.brutto)).toBeCloseTo(0.3, 10)
    expect(values.brutto).toBe('0.30')
    // Cent-Genauigkeit über viele Stellen: 33,333333 % von 0,03 € bleibt ein Cent.
    expect(num(percentValue('0.03', '33.333333'))).toBeCloseTo(0.01, 10)
  })

  it('rounds half up', () => {
    expect(num(percentValue('1', '5'))).toBeCloseTo(0.05, 10)
    expect(num(percentValue('1', '0.5'))).toBeCloseTo(0.01, 10)
    expect(Number(ok(discount('1', '0.5')).endpreis)).toBeCloseTo(1, 10)
  })
})

describe('Geometrie — Formeln gegen unabhängige Nachrechnung', () => {
  const outputsOf = (shapeId: string, input: Record<string, number>) => {
    const shape = geometryShapeById(shapeId)
    expect(shape, shapeId).toBeDefined()
    return shape?.compute(input) ?? []
  }
  const pick = (shapeId: string, input: Record<string, number>, key: string) => {
    const entry = outputsOf(shapeId, input).find((item) => item.key === key)
    expect(entry, `${shapeId}/${key}`).toBeDefined()
    return entry?.value ?? Number.NaN
  }

  it('rectangle: area, perimeter and diagonal', () => {
    expect(pick('rectangle', { a: 3, b: 4 }, 'area')).toBe(12)
    expect(pick('rectangle', { a: 3, b: 4 }, 'perimeter')).toBe(14)
    expect(pick('rectangle', { a: 3, b: 4 }, 'diagonal')).toBe(5)
  })

  it('square: area, perimeter and diagonal', () => {
    expect(pick('square', { a: 5 }, 'area')).toBe(25)
    expect(pick('square', { a: 5 }, 'perimeter')).toBe(20)
    expect(pick('square', { a: 5 }, 'diagonal')).toBeCloseTo(5 * Math.SQRT2, 10)
  })

  it('right triangle: hypotenuse, area, perimeter', () => {
    expect(pick('rightTriangle', { a: 3, b: 4 }, 'hypotenuse')).toBe(5)
    expect(pick('rightTriangle', { a: 3, b: 4 }, 'area')).toBe(6)
    expect(pick('rightTriangle', { a: 3, b: 4 }, 'perimeter')).toBe(12)
  })

  it('triangle and trapezoid against the half rule', () => {
    expect(pick('triangle', { g: 6, h: 4 }, 'area')).toBe(12)
    expect(pick('trapezoid', { a: 3, c: 1, h: 2 }, 'area')).toBe(4)
    expect(pick('parallelogram', { a: 5, b: 3, h: 2 }, 'area')).toBe(10)
    expect(pick('parallelogram', { a: 5, b: 3, h: 2 }, 'perimeter')).toBe(16)
    expect(pick('rhombus', { e: 4, f: 6 }, 'area')).toBe(12)
  })

  it('circle and annulus against pi', () => {
    expect(pick('circle', { r: 2 }, 'area')).toBeCloseTo(4 * Math.PI, 10)
    expect(pick('circle', { r: 2 }, 'perimeter')).toBeCloseTo(4 * Math.PI, 10)
    expect(pick('circle', { r: 2 }, 'diameter')).toBe(4)
    expect(pick('annulus', { R: 2, r: 1 }, 'area')).toBeCloseTo(3 * Math.PI, 10)
    expect(pick('annulus', { R: 2, r: 1 }, 'perimeter')).toBeCloseTo(6 * Math.PI, 10)
  })

  it('regular polygon: a square drawn as a polygon must match the square', () => {
    expect(pick('regularPolygon', { s: 1, n: 4 }, 'area')).toBeCloseTo(1, 10)
    expect(pick('regularPolygon', { s: 1, n: 4 }, 'perimeter')).toBe(4)
    expect(pick('regularPolygon', { s: 1, n: 6 }, 'area')).toBeCloseTo((3 * Math.sqrt(3)) / 2, 10)
  })

  it('cuboid and cube: volume, surface and space diagonal', () => {
    expect(pick('cuboid', { a: 2, b: 3, c: 4 }, 'volume')).toBe(24)
    expect(pick('cuboid', { a: 2, b: 3, c: 4 }, 'surface')).toBe(52)
    expect(pick('cuboid', { a: 2, b: 3, c: 4 }, 'diagonal')).toBeCloseTo(Math.sqrt(29), 10)
    expect(pick('cube', { a: 3 }, 'volume')).toBe(27)
    expect(pick('cube', { a: 3 }, 'surface')).toBe(54)
    expect(pick('cube', { a: 3 }, 'diagonal')).toBeCloseTo(3 * Math.sqrt(3), 10)
  })

  it('cylinder, cone and sphere against pi', () => {
    expect(pick('cylinder', { r: 1, h: 1 }, 'volume')).toBeCloseTo(Math.PI, 10)
    expect(pick('cylinder', { r: 1, h: 1 }, 'surface')).toBeCloseTo(4 * Math.PI, 10)
    expect(pick('cylinder', { r: 1, h: 1 }, 'lateral')).toBeCloseTo(2 * Math.PI, 10)
    // Kegel 3-4-5: Mantellinie 5, Volumen 12π, Oberfläche 24π.
    expect(pick('cone', { r: 3, h: 4 }, 'slant')).toBeCloseTo(5, 10)
    expect(pick('cone', { r: 3, h: 4 }, 'volume')).toBeCloseTo(12 * Math.PI, 10)
    expect(pick('cone', { r: 3, h: 4 }, 'surface')).toBeCloseTo(24 * Math.PI, 10)
    expect(pick('sphere', { r: 1 }, 'volume')).toBeCloseTo((4 / 3) * Math.PI, 10)
    expect(pick('sphere', { r: 1 }, 'surface')).toBeCloseTo(4 * Math.PI, 10)
  })

  it('pyramid: volume and surface against the independent root', () => {
    // Quadratische Pyramide a=2, h=3: hs = √10, V = 4, O = 4 + 4·√10.
    expect(pick('pyramid', { a: 2, h: 3 }, 'slant')).toBeCloseTo(Math.sqrt(10), 10)
    expect(pick('pyramid', { a: 2, h: 3 }, 'volume')).toBeCloseTo(4, 10)
    expect(pick('pyramid', { a: 2, h: 3 }, 'surface')).toBeCloseTo(4 + 4 * Math.sqrt(10), 10)
  })

  it('gives every shape a formula for every output', () => {
    for (const id of ['rectangle', 'square', 'triangle', 'rightTriangle', 'circle', 'annulus', 'trapezoid', 'parallelogram', 'rhombus', 'regularPolygon', 'cuboid', 'cube', 'cylinder', 'cone', 'pyramid', 'sphere']) {
      const shape = geometryShapeById(id)
      expect(shape, id).toBeDefined()
      if (!shape) continue
      const input = Object.fromEntries(shape.inputs.map((field) => [field.id, 2]))
      const entries = shape.compute(input)
      expect(entries.length, id).toBeGreaterThan(0)
      for (const entry of entries) {
        // Jede Ergebniszeile trägt ihren Rechenweg — Pflichtfeld „Formel und Quelle".
        expect(entry.formula, `${id}/${entry.key}`).toBeTruthy()
        expect(Number.isFinite(entry.value), `${id}/${entry.key}`).toBe(true)
      }
    }
  })

  it('rounds for display without changing the value', () => {
    // Zwölf gültige Stellen: genug zum Nachrechnen, wenig genug gegen Gleitkomma-Rauschen.
    expect(roundForDisplay(28.274333882308138)).toBe(28.2743338823)
    expect(Math.abs(roundForDisplay(28.274333882308138) - 28.274333882308138)).toBeLessThan(1e-10)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(12)).toBe(12)
  })
})
