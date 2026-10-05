import { describe, expect, it } from 'vitest'
import {
  TILE_LIMITS,
  jointLengthPerMeterFromFormat,
  planTiles,
  roundForDisplay,
  tilePatternById,
  tilePatterns,
  tilesPerSquareMeterWithJoint,
  type TilesInput
} from '@commietools/tools/craft/tiles'

const base: TilesInput = {
  areaSquareMeters: 20,
  tileLengthMm: 300,
  tileBreadthMm: 300,
  jointMm: 3,
  jointDepthMm: 8,
  jointDensity: 1600,
  notchMm: 8,
  surchargePercent: 5,
  bagSizeKg: 25
}

function result(input: Partial<TilesInput>) {
  const check = planTiles({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Fliesen, Kleber und Fugenmörtel', () => {
  it('rechnet ein Baustellenbeispiel nach', () => {
    // 20 m², 30 × 30 cm, 3 mm Fuge, 8 mm Fugentiefe, 1600 kg/m³, Zahnung 8 mm, Kreuzverband
    const value = result({})
    expect(value.areaWithSurcharge).toBeCloseTo(21, 9)
    expect(value.tilesPerSquareMeter).toBeCloseTo(11.1111111111, 8)
    expect(value.tiles).toBe(234)
    expect(value.tilesWithoutSurcharge).toBe(223)
    expect(value.adhesiveKg).toBeCloseTo(80, 9)
    expect(value.adhesiveBags).toBe(4)
    expect(value.adhesiveRemainderKg).toBeCloseTo(20, 9)
    expect(value.jointMortarKg).toBeCloseTo(5.12, 9)
    expect(value.jointMortarBags).toBe(1)
    expect(value.jointMortarRemainderKg).toBeCloseTo(19.88, 9)
  })

  it('rechnet die Fugenlänge gegen eine unabhängig gerechnete Fugenlänge', () => {
    // Je 30-cm-Fliese entfallen 0,6 m Fuge auf sie (halber Umfang), bei 11,111 Fliesen je m².
    const expectedPerSquareMeter = (1 / 0.09) * 0.6
    expect(jointLengthPerMeterFromFormat(300, 300)).toBeCloseTo(expectedPerSquareMeter, 9)
    const value = result({})
    expect(value.jointLengthMeters).toBeCloseTo(20 * expectedPerSquareMeter, 6)
    // unabhängige Gegenprobe für den Fugenmörtel: Fugenvolumen × Dichte
    const volumePerSquareMeter = expectedPerSquareMeter * 0.003 * 0.008
    expect(value.jointMortarKg).toBeCloseTo(20 * volumePerSquareMeter * 1600, 6)
  })

  it('liefert bei stoßfugenloser Verlegung keinen Fugenmörtel', () => {
    expect(result({ jointMm: 0 }).jointMortarKg).toBe(0)
    expect(result({ jointMm: 0 }).jointMortarBags).toBe(0)
  })

  it('rechnet den Kleber nach der Zahnungsregel: Zahnung halbiert ergibt kg je m²', () => {
    expect(result({ notchMm: 6 }).adhesiveKg).toBeCloseTo(60, 9)
    expect(result({ notchMm: 10 }).adhesiveKg).toBeCloseTo(100, 9)
    expect(result({ notchMm: 0 }).adhesiveKg).toBe(0)
    expect(result({ notchMm: 0 }).adhesiveBags).toBe(0)
  })

  it('rundet Fliesen und Säcke immer auf', () => {
    expect(result({ areaSquareMeters: 0.09, surchargePercent: 0 }).tiles).toBe(1)
    expect(result({ areaSquareMeters: 0.1, surchargePercent: 0 }).tiles).toBe(2)
    // 1 m² mit 300 kg ... hier: Kleber 4 kg bei 25-kg-Säcken → genau 1 Sack, kein Rest
    expect(result({ areaSquareMeters: 1, notchMm: 8 }).adhesiveBags).toBe(1)
    expect(result({ areaSquareMeters: 1, notchMm: 8 }).adhesiveRemainderKg).toBeCloseTo(21, 9)
  })

  it('vernachlässigt die Fuge im Modul und hält die Abweichung klein', () => {
    // Formatmaß gegen Modulmaß (Format + Fuge): die Abweichung muss unter dem kleinsten
    // Musterzuschlag liegen, sonst wäre die Annahme nicht vertretbar.
    const withoutJoint = 1 / (0.3 * 0.3)
    const withJoint = tilesPerSquareMeterWithJoint(300, 300, 3)
    expect(withJoint).toBeCloseTo(1 / (0.303 * 0.303), 9)
    expect((withoutJoint - withJoint) / withoutJoint).toBeLessThan(0.02)
    expect((withoutJoint - withJoint) / withoutJoint).toBeGreaterThan(0.01)
  })

  it('hält große Formate und dicke Fugen aus', () => {
    const value = result({ tileLengthMm: 1200, tileBreadthMm: 200, jointMm: 5, jointDepthMm: 10 })
    expect(value.tilesPerSquareMeter).toBeCloseTo(1 / (1.2 * 0.2), 9)
    expect(value.jointLengthMeters).toBeGreaterThan(0)
    expect(Number.isFinite(value.jointMortarKg)).toBe(true)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planTiles({ ...base, areaSquareMeters: 0 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.area' })
    expect(planTiles({ ...base, areaSquareMeters: -5 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.area' })
    expect(planTiles({ ...base, areaSquareMeters: TILE_LIMITS.area.max + 1 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.areaRange' })
    expect(planTiles({ ...base, tileLengthMm: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planTiles({ ...base, tileLengthMm: 5 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.tile' })
    expect(planTiles({ ...base, tileBreadthMm: 3000 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.tile' })
    expect(planTiles({ ...base, jointMm: 40 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.joint' })
    expect(planTiles({ ...base, jointDepthMm: 1 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.depth' })
    expect(planTiles({ ...base, jointDensity: 500 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.density' })
    expect(planTiles({ ...base, notchMm: 25 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.notch' })
    expect(planTiles({ ...base, surchargePercent: 45 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.surcharge' })
    expect(planTiles({ ...base, bagSizeKg: 60 })).toEqual({ ok: false, errorKey: 'tool.tiles.error.bag' })
  })
})

describe('Verlegearten und Vorschlagswerte', () => {
  it('liegt für jede Verlegeart innerhalb der geprüften Grenzen', () => {
    for (const pattern of tilePatterns) {
      expect(pattern.surchargePercent, pattern.id).toBeGreaterThanOrEqual(TILE_LIMITS.surchargePercent.min)
      expect(pattern.surchargePercent, pattern.id).toBeLessThanOrEqual(TILE_LIMITS.surchargePercent.max)
    }
  })

  it('stuft den Zuschlag nach Verlegeart: Kreuzverband unter Diagonalverband', () => {
    const grid = tilePatternById('grid')
    const halfOffset = tilePatternById('halfOffset')
    const diagonal = tilePatternById('diagonal')
    expect(grid && halfOffset && diagonal).toBeTruthy()
    expect(grid!.surchargePercent).toBeLessThan(halfOffset!.surchargePercent)
    expect(halfOffset!.surchargePercent).toBeLessThan(diagonal!.surchargePercent)
    expect(tilePatternById('nicht-vorhanden')).toBeUndefined()
  })

  it('kennzeichnet alle Musterzuschläge als Erfahrungswerte', () => {
    // Belegte Werte dürfen als belegt geführt werden, unbelegte nicht — die Oberfläche zeigt das an.
    for (const pattern of tilePatterns) expect(pattern.source, pattern.id).toBe('experience')
  })

  it('rechnet jede Verlegeart mit dem eigenen Zuschlag durch', () => {
    for (const pattern of tilePatterns) {
      const value = result({ surchargePercent: pattern.surchargePercent })
      expect(value.tiles, pattern.id).toBeGreaterThan(0)
      expect(value.tiles).toBeGreaterThanOrEqual(value.tilesWithoutSurcharge)
    }
  })
})

describe('Anzeigerundung', () => {
  it('rundet auf zwölf gültige Stellen und lässt Sonderfälle stehen', () => {
    expect(roundForDisplay(6.666666666667)).toBeCloseTo(6.66666666667, 10)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(Number.NaN)).toBeNaN()
  })
})
