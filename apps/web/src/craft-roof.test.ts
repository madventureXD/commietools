import { describe, expect, it } from 'vitest'
import {
  pitchDegFromPercent,
  pitchDegFromRatio,
  pitchFactor,
  pitchPercentFromDeg,
  planRoof,
  ROOF_LIMITS,
  type RoofInput
} from '@commietools/tools/craft/roof'

const base: RoofInput = {
  shape: 'gable',
  lengthM: 12,
  widthM: 9,
  pitchDeg: 35,
  overhangM: 0.5,
  wastePercent: 10,
  spanSpacingM: 0.8,
  coveringPerSqm: 10
}

function result(input: Partial<RoofInput>) {
  const check = planRoof({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Dach', () => {
  it('trifft den bekannten Neigungsfaktor bei 45 Grad', () => {
    expect(pitchFactor(45)).toBeCloseTo(Math.SQRT2, 12)
    expect(pitchFactor(0)).toBeCloseTo(1, 12)
  })

  it('rechnet die Dachfläche als Grundrissfläche geteilt durch den Kosinus', () => {
    const value = result({ pitchDeg: 45, lengthM: 10, widthM: 10, overhangM: 0 })
    expect(value.footprintAreaM2).toBeCloseTo(100, 9)
    expect(value.roofAreaM2).toBeCloseTo(100 * Math.SQRT2, 9)
  })

  it('gilt für Pult-, Sattel- und Walmdach gleichermaßen', () => {
    const areas = (['pent', 'gable', 'hip'] as const).map((shape) => result({ shape }).roofAreaM2)
    expect(areas[0]).toBeCloseTo(areas[1] ?? 0, 9)
    expect(areas[1]).toBeCloseTo(areas[2] ?? 0, 9)
  })

  it('rechnet Firsthöhe und Sparrenlänge je Dachform nach', () => {
    // Satteldach 35°, Breite 9 m, Überstand 0,5 m: H = 4,5 · tan35, S = 5,0 / cos35
    const gable = result({})
    expect(gable.firstHeightM).toBeCloseTo(4.5 * Math.tan((35 * Math.PI) / 180), 9)
    expect(gable.rafterLengthM).toBeCloseTo(5 / Math.cos((35 * Math.PI) / 180), 9)
    // Pultdach: die ganze Breite, nicht die halbe
    const pent = result({ shape: 'pent' })
    expect(pent.firstHeightM).toBeCloseTo(9 * Math.tan((35 * Math.PI) / 180), 9)
    expect(pent.rafterLengthM).toBeCloseTo(9.5 / Math.cos((35 * Math.PI) / 180), 9)
    expect(pent.ridgeLengthM).toBe(0)
  })

  it('setzt den Überstand rundum an', () => {
    const value = result({ lengthM: 10, widthM: 10, overhangM: 1 })
    expect(value.footprintAreaM2).toBeCloseTo(12 * 12, 9)
  })

  it('rundet Sparren und Eindeckung immer auf', () => {
    const value = result({})
    expect(Number.isInteger(value.rafterCount)).toBe(true)
    expect(Number.isInteger(value.coveringPieces)).toBe(true)
    expect(value.rafterCount).toBe(Math.ceil((12 + 1) / 0.8) + 1)
    expect(value.coveringPieces).toBe(Math.ceil(value.roofAreaWithWasteM2 * 10))
  })

  it('rechnet zwischen Grad, Prozent und Verhältnis um', () => {
    expect(pitchDegFromRatio(1, 1)).toBeCloseTo(45, 9)
    expect(pitchDegFromRatio(1, 4)).toBeCloseTo(14.0362434679, 6)
    expect(pitchDegFromPercent(100)).toBeCloseTo(45, 9)
    expect(pitchPercentFromDeg(45)).toBeCloseTo(100, 9)
    expect(Number.isNaN(pitchDegFromRatio(0, 4))).toBe(true)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planRoof({ ...base, lengthM: 0 })).toEqual({ ok: false, errorKey: 'tool.roof.error.size' })
    expect(planRoof({ ...base, widthM: 500 })).toEqual({ ok: false, errorKey: 'tool.roof.error.size' })
    expect(planRoof({ ...base, pitchDeg: 90 })).toEqual({ ok: false, errorKey: 'tool.roof.error.pitch' })
    expect(planRoof({ ...base, overhangM: 5 })).toEqual({ ok: false, errorKey: 'tool.roof.error.overhang' })
    expect(planRoof({ ...base, wastePercent: 80 })).toEqual({ ok: false, errorKey: 'tool.craft.error.waste' })
    expect(planRoof({ ...base, spanSpacingM: 2 })).toEqual({ ok: false, errorKey: 'tool.roof.error.spacing' })
    expect(planRoof({ ...base, coveringPerSqm: 0 })).toEqual({ ok: false, errorKey: 'tool.roof.error.covering' })
    expect(planRoof({ ...base, pitchDeg: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
  })

  it('führt die Grenzen mit, die die Oberfläche anzeigt', () => {
    expect(ROOF_LIMITS.pitchDeg.max).toBe(80)
    expect(ROOF_LIMITS.spanSpacingM.min).toBe(0.3)
  })
})
