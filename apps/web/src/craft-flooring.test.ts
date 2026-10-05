import { describe, expect, it } from 'vitest'
import {
  FLOORING_DEFAULTS,
  FLOORING_LIMITS,
  flooringPatternById,
  flooringPatterns,
  planFlooring,
  roundForDisplay,
  type FlooringInput
} from '@commietools/tools/craft/flooring'

const base: FlooringInput = {
  lengthM: 5,
  breadthM: 4,
  packageAreaM2: 2,
  pattern: 'parallel',
  surchargePercent: 5,
  underlayRollAreaM2: 15,
  underlayOverlapPercent: 5,
  trimPieceLengthM: 2.4
}

function result(input: Partial<FlooringInput>) {
  const check = planFlooring({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Parkett, Laminat und Bodenbelag', () => {
  it('rechnet ein Baustellenbeispiel nach', () => {
    // 5 × 4 m, Kreuzverband, 2,0-m²-Pakete, 15-m²-Rolle Dämmung, 2,4-m-Leisten
    const value = result({})
    expect(value.areaM2).toBeCloseTo(20, 9)
    expect(value.surchargeM2).toBeCloseTo(1, 9)
    expect(value.requiredM2).toBeCloseTo(21, 9)
    // 21 / 2 = 10,5 → 11 Pakete
    expect(value.packages).toBe(11)
    expect(value.offcutM2).toBeCloseTo(2, 9)
    // Dämmung 20 · 1,05 = 21 m² → 2 Rollen
    expect(value.underlayM2).toBeCloseTo(21, 9)
    expect(value.underlayRolls).toBe(2)
    // Umfang 18 m → 18 / 2,4 = 7,5 → 8 Leistenstücke = 19,2 m
    expect(value.perimeterM).toBeCloseTo(18, 9)
    expect(value.trimPieces).toBe(8)
    expect(value.trimMeters).toBeCloseTo(19.2, 9)
  })

  it('rechnet einen kleinen Raum nach', () => {
    // 3 × 2,5 m = 7,5 m² · +5 % = 7,875 m² → 4 Pakete · Rest 0,5 m²
    const value = result({ lengthM: 3, breadthM: 2.5 })
    expect(value.areaM2).toBeCloseTo(7.5, 9)
    expect(value.requiredM2).toBeCloseTo(7.875, 9)
    expect(value.packages).toBe(4)
    expect(value.offcutM2).toBeCloseTo(0.5, 9)
    expect(value.underlayRolls).toBe(1)
    expect(value.perimeterM).toBeCloseTo(11, 9)
    expect(value.trimPieces).toBe(5)
  })

  it('stuft den Zuschlag nach Verlegeart: Diagonalverband am höchsten', () => {
    const parallel = result({ pattern: 'parallel', surchargePercent: 5 })
    const staggered = result({ pattern: 'staggered', surchargePercent: 8 })
    const diagonal = result({ pattern: 'diagonal', surchargePercent: 12 })
    expect(parallel.surchargeM2).toBeLessThan(staggered.surchargeM2)
    expect(staggered.surchargeM2).toBeLessThan(diagonal.surchargeM2)
    // Diagonal: 20 · 1,12 = 22,4 m² → 12 Pakete, Verschnitt 4 m²
    expect(diagonal.requiredM2).toBeCloseTo(22.4, 9)
    expect(diagonal.packages).toBe(12)
    expect(diagonal.offcutM2).toBeCloseTo(4, 9)
    // Die Bodenfläche und die Leisten hängen nicht an der Verlegeart
    expect(diagonal.areaM2).toBeCloseTo(parallel.areaM2, 9)
    expect(diagonal.trimPieces).toBe(parallel.trimPieces)
  })

  it('rundet Pakete, Rollen und Leisten immer auf', () => {
    // Genau aufgehend: 2 × 2 m = 4 m², kein Zuschlag → 2 Pakete, kein Rest
    const even = result({ lengthM: 2, breadthM: 2, surchargePercent: 0 })
    expect(even.packages).toBe(2)
    expect(even.offcutM2).toBeCloseTo(0, 9)
    // Eine Fläche knapp über der Paketgrenze erzwingt ein weiteres Paket
    expect(result({ lengthM: 2, breadthM: 2.01, surchargePercent: 0 }).packages).toBe(3)
    expect(result({ underlayRollAreaM2: 21, underlayOverlapPercent: 0 }).underlayRolls).toBe(1)
    expect(result({ underlayRollAreaM2: 19, underlayOverlapPercent: 0 }).underlayRolls).toBe(2)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planFlooring({ ...base, lengthM: 0 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.length' })
    expect(planFlooring({ ...base, breadthM: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planFlooring({ ...base, breadthM: 300 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.breadth' })
    expect(planFlooring({ ...base, packageAreaM2: 0.2 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.package' })
    expect(planFlooring({ ...base, surchargePercent: 40 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.surcharge' })
    expect(planFlooring({ ...base, underlayRollAreaM2: 0.5 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.roll' })
    expect(planFlooring({ ...base, underlayOverlapPercent: 25 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.overlap' })
    expect(planFlooring({ ...base, trimPieceLengthM: 6 })).toEqual({ ok: false, errorKey: 'tool.flooring.error.trim' })
  })
})

describe('Verlegearten und Vorschlagswerte', () => {
  it('liegt für jede Verlegeart innerhalb der geprüften Grenzen', () => {
    for (const pattern of flooringPatterns) {
      expect(pattern.surchargePercent, pattern.id).toBeGreaterThanOrEqual(FLOORING_LIMITS.surchargePercent.min)
      expect(pattern.surchargePercent, pattern.id).toBeLessThanOrEqual(FLOORING_LIMITS.surchargePercent.max)
    }
  })

  it('kennzeichnet alle Zuschlagsätze als Erfahrungswerte', () => {
    for (const pattern of flooringPatterns) expect(pattern.source, pattern.id).toBe('experience')
    expect(flooringPatternById('nicht-vorhanden')).toBeUndefined()
  })

  it('hält die Vorschlagswerte innerhalb der geprüften Grenzen', () => {
    const pairs: Array<[number, { min: number; max: number }]> = [
      [FLOORING_DEFAULTS.packageAreaM2.value, FLOORING_LIMITS.packageAreaM2],
      [FLOORING_DEFAULTS.underlayRollAreaM2.value, FLOORING_LIMITS.underlayRollAreaM2],
      [FLOORING_DEFAULTS.underlayOverlapPercent.value, FLOORING_LIMITS.underlayOverlapPercent],
      [FLOORING_DEFAULTS.trimPieceLengthM.value, FLOORING_LIMITS.trimPieceLengthM]
    ]
    for (const [value, range] of pairs) {
      expect(value).toBeGreaterThanOrEqual(range.min)
      expect(value).toBeLessThanOrEqual(range.max)
    }
    expect(FLOORING_DEFAULTS.packageAreaM2.source).toBe('experience')
  })
})

describe('Anzeigerundung', () => {
  it('rundet auf zwölf gültige Stellen und lässt Sonderfälle stehen', () => {
    expect(roundForDisplay(7.874999999999999)).toBeCloseTo(7.875, 10)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(Number.NaN)).toBeNaN()
  })
})
