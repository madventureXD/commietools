import { describe, expect, it } from 'vitest'
import {
  PAINT_DEFAULTS,
  PAINT_LIMITS,
  cutLengthFor,
  dropsPerRoll,
  planPaint,
  roundForDisplay,
  type PaintInput
} from '@commietools/tools/craft/paint'

const base: PaintInput = {
  perimeterM: 12,
  heightM: 2.4,
  doorCount: 1,
  doorAreaM2: 2,
  doorWidthM: 0.9,
  windowCount: 1,
  windowAreaM2: 1.5,
  windowWidthM: 1.2,
  extraDeductionM2: 0,
  coats: 2,
  coverageSqmPerLitre: 7,
  tinSizeL: 5,
  rollLengthM: 10.05,
  rollWidthM: 0.53,
  repeatM: 0,
  repeat: 'free',
  cutAllowanceM: 0.1
}

function result(input: Partial<PaintInput>) {
  const check = planPaint({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Farbe, Tapeten und Beschichtung', () => {
  it('rechnet ein Baustellenbeispiel nach', () => {
    // 12 m Umfang, 2,4 m hoch, eine Tür (2 m²) und ein Fenster (1,5 m²), zwei Anstriche
    const value = result({})
    expect(value.grossAreaM2).toBeCloseTo(28.8, 9)
    expect(value.deductionAreaM2).toBeCloseTo(3.5, 9)
    expect(value.netAreaM2).toBeCloseTo(25.3, 9)
    expect(value.netWidthM).toBeCloseTo(9.9, 9)
    // 25,3 m² / 7 m² je Liter = 3,6143 l je Anstrich, zwei Anstriche → 7,2286 l → 2 Gebinde
    expect(value.paintLitresPerCoat).toBeCloseTo(3.6143, 4)
    expect(value.paintLitres).toBeCloseTo(7.2286, 4)
    expect(value.paintTins).toBe(2)
    // Zuschnitt ansatzfrei 2,5 m → 4 Bahnen je Rolle (10,05 / 2,5 = 4,02) → 19 Bahnen → 5 Rollen
    expect(value.cutLengthM).toBeCloseTo(2.5, 9)
    expect(value.dropsPerRoll).toBe(4)
    expect(value.drops).toBe(19)
    expect(value.rolls).toBe(5)
    // Verschnitt: 5 Rollen = 26,6325 m², gebraucht 19 · 2,5 · 0,53 = 25,175 m²
    expect(value.offcutAreaM2).toBeCloseTo(1.4575, 4)
  })

  it('rechnet die Fläche aus dem Umfang und zieht die Öffnungen ab', () => {
    const value = result({ doorCount: 3, windowCount: 2, extraDeductionM2: 1 })
    expect(value.deductionAreaM2).toBeCloseTo(3 * 2 + 2 * 1.5 + 1, 9)
    expect(value.netAreaM2).toBeCloseTo(28.8 - 10, 9)
    expect(value.netWidthM).toBeCloseTo(12 - 3 * 0.9 - 2 * 1.2, 9)
  })

  it('rechnet den Anstrich über Ergiebigkeit und Anstrichzahl', () => {
    expect(result({ coats: 1 }).paintLitres).toBeCloseTo(result({ coats: 1 }).paintLitresPerCoat, 9)
    expect(result({ coats: 3 }).paintLitres).toBeCloseTo(3 * result({ coats: 3 }).paintLitresPerCoat, 9)
    // Doppelte Ergiebigkeit halbiert den Bedarf
    expect(result({ coverageSqmPerLitre: 14 }).paintLitres).toBeCloseTo(result({ coverageSqmPerLitre: 7 }).paintLitres / 2, 9)
    // Größere Gebinde brauchen weniger Gebinde
    expect(result({ tinSizeL: 10 }).paintTins).toBe(1)
    expect(result({ tinSizeL: 2.5 }).paintTins).toBe(3)
  })

  it('rundet Bahnen je Rolle ab und Gebinde und Rollen auf', () => {
    // 10,05 / 2,51 = 4,004 → 4; Gebinde: 7,2286 / 5 = 1,45 → 2
    expect(dropsPerRoll(10.05, 2.51)).toBe(4)
    expect(dropsPerRoll(10.05, 5.03)).toBe(1)
    expect(result({ cutAllowanceM: 0.11 }).dropsPerRoll).toBe(4)
    expect(result({ cutAllowanceM: 0.5 }).dropsPerRoll).toBe(3)
  })
})

describe('Rapport und Zuschnitt', () => {
  it('schneidet ansatzfrei genau auf Wandhöhe plus Zugabe', () => {
    expect(cutLengthFor(2.4, 0.1, 0.64, 'free')).toBeCloseTo(2.5, 9)
    expect(cutLengthFor(2.5, 0, 0, 'straight')).toBeCloseTo(2.5, 9)
  })

  it('rundet den Zuschnitt auf den Ansatzschritt auf und nie unter die Wandhöhe', () => {
    const straight = cutLengthFor(2.4, 0.1, 0.64, 'straight')
    expect(straight).toBeCloseTo(2.56, 9)
    expect(straight / 0.64).toBeCloseTo(4, 9)
    const half = cutLengthFor(2.4, 0.1, 0.64, 'half')
    expect(half).toBeCloseTo(2.56, 9)
    // Der Schritt ist die Hälfte des Rapports — 2,56 ist ein Vielfaches davon
    expect(half / (0.64 / 2)).toBeCloseTo(8, 9)
    for (const repeat of ['straight', 'half'] as const) {
      for (const height of [2.2, 2.4, 2.5, 2.6, 3.1]) {
        const cut = cutLengthFor(height, 0.1, 0.64, repeat)
        expect(cut, `${repeat} bei ${height}`).toBeGreaterThanOrEqual(height + 0.1)
        const step = repeat === 'half' ? 0.32 : 0.64
        expect(Math.abs(cut / step - Math.round(cut / step)), `${repeat} Schritt bei ${height}`).toBeLessThan(1e-9)
      }
    }
  })

  it('belegt, dass der Rapport den Bedarf erhöht — der Grund für die Bahnenrechnung', () => {
    const free = result({})
    const straight = result({ repeat: 'straight', repeatM: 0.64 })
    const half = result({ repeat: 'half', repeatM: 0.64 })
    // Dieselbe Wand, dasselbe Muster: Zuschnitt wächst, damit auch die Rollenzahl
    expect(straight.cutLengthM).toBeGreaterThan(free.cutLengthM)
    expect(straight.drops).toBe(free.drops)
    expect(straight.rolls).toBeGreaterThan(free.rolls)
    expect(straight.repeatStepM).toBeCloseTo(0.64, 9)
    expect(half.repeatStepM).toBeCloseTo(0.32, 9)
    // Eine reine Flächenrechnung hätte den Bedarf nicht erkannt: 19 Bahnen · 0,53 m · 2,5 m
    // passen in 5 Rollen, der rapportierte Zuschnitt braucht 7
    expect(free.rolls).toBe(5)
    expect(straight.rolls).toBe(7)
  })

  it('weist einen Zuschnitt ab, der nicht in die Rolle passt', () => {
    expect(planPaint({ ...base, rollLengthM: 2.4, cutAllowanceM: 0.1 })).toEqual({ ok: false, errorKey: 'tool.paint.error.drops' })
  })
})

describe('Eingabeprüfung', () => {
  it('weist unbrauchbare Werte ab', () => {
    expect(planPaint({ ...base, perimeterM: 0 })).toEqual({ ok: false, errorKey: 'tool.paint.error.perimeter' })
    expect(planPaint({ ...base, heightM: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planPaint({ ...base, heightM: 0.1 })).toEqual({ ok: false, errorKey: 'tool.paint.error.height' })
    expect(planPaint({ ...base, doorCount: -1 })).toEqual({ ok: false, errorKey: 'tool.paint.error.openings' })
    expect(planPaint({ ...base, windowCount: 500 })).toEqual({ ok: false, errorKey: 'tool.paint.error.openings' })
    expect(planPaint({ ...base, doorAreaM2: 60 })).toEqual({ ok: false, errorKey: 'tool.paint.error.openingArea' })
    expect(planPaint({ ...base, windowWidthM: 30 })).toEqual({ ok: false, errorKey: 'tool.paint.error.openingWidth' })
    expect(planPaint({ ...base, extraDeductionM2: -1 })).toEqual({ ok: false, errorKey: 'tool.paint.error.deduction' })
    expect(planPaint({ ...base, coats: 5 })).toEqual({ ok: false, errorKey: 'tool.paint.error.coats' })
    expect(planPaint({ ...base, coverageSqmPerLitre: 1 })).toEqual({ ok: false, errorKey: 'tool.paint.error.coverage' })
    expect(planPaint({ ...base, tinSizeL: 40 })).toEqual({ ok: false, errorKey: 'tool.paint.error.tin' })
    expect(planPaint({ ...base, rollWidthM: 3 })).toEqual({ ok: false, errorKey: 'tool.paint.error.roll' })
    expect(planPaint({ ...base, repeatM: 2.5 })).toEqual({ ok: false, errorKey: 'tool.paint.error.repeat' })
    expect(planPaint({ ...base, cutAllowanceM: 1.5 })).toEqual({ ok: false, errorKey: 'tool.paint.error.allowance' })
  })

  it('meldet, wenn die Abzüge die Wandfläche aufbrauchen', () => {
    expect(planPaint({ ...base, doorCount: 20, windowCount: 20 })).toEqual({ ok: false, errorKey: 'tool.paint.error.deduction' })
    // Auch die Breite kann aufgebraucht sein, selbst wenn die Fläche reicht
    expect(planPaint({ ...base, doorCount: 10, windowCount: 3, doorAreaM2: 0, windowAreaM2: 0, extraDeductionM2: 0 }))
      .toEqual({ ok: false, errorKey: 'tool.paint.error.deduction' })
  })

  it('hält die Vorschlagswerte innerhalb der geprüften Grenzen', () => {
    for (const [name, entry] of Object.entries(PAINT_DEFAULTS)) {
      if (typeof entry !== 'object') continue
      const range = (PAINT_LIMITS as Record<string, { min: number; max: number } | undefined>)[name]
      if (!range) continue
      expect(entry.value, name).toBeGreaterThanOrEqual(range.min)
      expect(entry.value, name).toBeLessThanOrEqual(range.max)
    }
    expect(PAINT_DEFAULTS.coverageSqmPerLitre.source).toBe('sourced')
    expect(PAINT_DEFAULTS.rollWidthM.source).toBe('sourced')
    expect(PAINT_DEFAULTS.doorAreaM2.source).toBe('experience')
  })
})

describe('Anzeigerundung', () => {
  it('rundet auf zwölf gültige Stellen und lässt Sonderfälle stehen', () => {
    expect(roundForDisplay(3.6142857142857)).toBeCloseTo(3.61428571429, 10)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(Number.NaN)).toBeNaN()
  })
})
