import { describe, expect, it } from 'vitest'
import {
  PAVING_DEFAULTS,
  PAVING_LIMITS,
  planPaving,
  roundForDisplay,
  stonesPerSquareMeter,
  type PavingInput
} from '@commietools/tools/craft/paving'

const base: PavingInput = {
  lengthM: 8,
  breadthM: 5,
  stoneLengthCm: 20,
  stoneBreadthCm: 10,
  stoneThicknessCm: 6,
  jointMm: 4,
  surchargePercent: 3,
  slopePercent: 0.5,
  bedThicknessCm: 4,
  bedDensity: 1.6,
  jointFillDepthCm: 6,
  jointDensity: 1.6,
  baseCourseCm: 30,
  bulkFactor: 1.25,
  stonesPerPallet: 400
}

function result(input: Partial<PavingInput>) {
  const check = planPaving({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Pflaster und Erdarbeiten', () => {
  it('rechnet ein Baustellenbeispiel nach', () => {
    // 8 × 5 m, Stein 20 × 10 cm, 4 mm Fuge, 3 % Zuschlag, Aufbau 30/4/6 cm
    const value = result({})
    expect(value.areaM2).toBeCloseTo(40, 9)
    expect(value.slopeDropM).toBeCloseTo(0.04, 9)
    // Raster 0,204 × 0,104 m = 0,021216 m² → 1 / 0,021216 = 47,13423831 Steine je m²
    expect(value.stonesPerSquareMeter).toBeCloseTo(47.1342, 3)
    // 40 · 1,03 · 47,134238 · = 1941,93 → 1942 Steine → 5 Paletten
    expect(value.stones).toBe(1942)
    expect(value.pallets).toBe(5)
    // Bettung 40 · 0,04 m = 1,6 m³ · 1,6 t/m³ = 2,56 t
    expect(value.bedVolumeM3).toBeCloseTo(1.6, 9)
    expect(value.bedTons).toBeCloseTo(2.56, 9)
    // Fugenmaterial: 15 m Fugenlänge je m² · 0,004 m · 0,06 m · 1600 kg/m³ · 40 m² = 230,4 kg
    expect(value.jointMaterialKg).toBeCloseTo(230.4, 4)
    // Aushub: 30 + 4 + 6 = 40 cm → 16 m³ · 1,25 = 20 m³ aufgelockert
    expect(value.digDepthM).toBeCloseTo(0.4, 9)
    expect(value.digVolumeM3).toBeCloseTo(16, 9)
    expect(value.digBulkVolumeM3).toBeCloseTo(20, 9)
  })

  it('rechnet im Rastermaß — die Fuge zählt mit', () => {
    // 20 × 10 cm ohne Fuge wären 50 Steine je m²; mit 4 mm Fuge sind es 47,13.
    expect(stonesPerSquareMeter(20, 10, 0)).toBeCloseTo(50, 9)
    expect(stonesPerSquareMeter(20, 10, 4)).toBeCloseTo(47.1342, 3)
    expect(stonesPerSquareMeter(20, 10, 4)).toBeCloseTo(1 / (0.204 * 0.104), 9)
    expect(stonesPerSquareMeter(20, 10, 4)).toBeLessThan(stonesPerSquareMeter(20, 10, 0))
    // Und die Bestellung folgt dem kleineren Wert: 1942 statt 2060 Steine
    expect(result({}).stones).toBeLessThan(result({ jointMm: 0 }).stones)
    expect(result({ jointMm: 0 }).stones).toBe(2060)
  })

  it('rechnet die Fugenlänge gegen eine unabhängig gerechnete Länge', () => {
    // Je 20-cm-Seite des Steins entfallen (a + b) = 30 cm auf ihn: 47,1343 · 0,30 m = 14,14 m…
    // — gerechnet wird mit dem Raster (Stein plus Fuge), deshalb 15 m je m² über die Kantensumme.
    const perSquareMeter = (100 * (20 + 10)) / (20 * 10)
    expect(perSquareMeter).toBeCloseTo(15, 9)
    const expectedKg = 40 * perSquareMeter * 0.004 * 0.06 * 1600
    expect(result({}).jointMaterialKg).toBeCloseTo(expectedKg, 6)
    // Ohne Fuge bleibt die Fugenlänge dieselbe (sie ist eine Kantensumme), das Material aber null
    expect(result({ jointMm: 0 }).jointMaterialKg).toBe(0)
  })

  it('rechnet den Aushub über den ganzen Aufbau und zeigt ihn aufgelockert', () => {
    const flat = result({ baseCourseCm: 0, bedThicknessCm: 4, stoneThicknessCm: 6 })
    expect(flat.digDepthM).toBeCloseTo(0.1, 9)
    expect(flat.digVolumeM3).toBeCloseTo(4, 9)
    expect(flat.digBulkVolumeM3).toBeCloseTo(5, 9)
    expect(result({ bulkFactor: 1 }).digBulkVolumeM3).toBeCloseTo(result({ bulkFactor: 1 }).digVolumeM3, 9)
    // Ohne Auflockerung ist das Haufwerk genau das Bodenvolumen; mit Faktor mehr
    expect(result({ bulkFactor: 1.3 }).digBulkVolumeM3).toBeGreaterThan(result({ bulkFactor: 1.25 }).digBulkVolumeM3)
  })

  it('rundet Steine und Paletten immer auf', () => {
    // 2 × 1 m mit derselben Rasterfläche: 2 m² · 1,03 · 47,1343 = 97,1 → 98 Steine → 1 Palette
    const small = result({ lengthM: 2, breadthM: 1 })
    expect(small.stones).toBe(98)
    expect(small.pallets).toBe(1)
    // Genau eine Palette voll: die Steinzahl selbst als Palettengröße
    const full = result({}).stones
    expect(result({ stonesPerPallet: full }).pallets).toBe(1)
    expect(result({ stonesPerPallet: full - 1 }).pallets).toBe(2)
    expect(result({ stonesPerPallet: 100 }).pallets).toBe(20)
    expect(result({ stonesPerPallet: full + 1 }).pallets).toBe(1)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planPaving({ ...base, lengthM: 0 })).toEqual({ ok: false, errorKey: 'tool.paving.error.length' })
    expect(planPaving({ ...base, breadthM: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planPaving({ ...base, breadthM: 2000 })).toEqual({ ok: false, errorKey: 'tool.paving.error.breadth' })
    expect(planPaving({ ...base, stoneLengthCm: 2 })).toEqual({ ok: false, errorKey: 'tool.paving.error.stone' })
    expect(planPaving({ ...base, stoneThicknessCm: 40 })).toEqual({ ok: false, errorKey: 'tool.paving.error.stoneThickness' })
    expect(planPaving({ ...base, jointMm: 40 })).toEqual({ ok: false, errorKey: 'tool.paving.error.joint' })
    expect(planPaving({ ...base, surchargePercent: 40 })).toEqual({ ok: false, errorKey: 'tool.paving.error.surcharge' })
    expect(planPaving({ ...base, bedThicknessCm: 0 })).toEqual({ ok: false, errorKey: 'tool.paving.error.bed' })
    expect(planPaving({ ...base, bedDensity: 3 })).toEqual({ ok: false, errorKey: 'tool.paving.error.bedDensity' })
    expect(planPaving({ ...base, jointFillDepthCm: 0 })).toEqual({ ok: false, errorKey: 'tool.paving.error.jointDepth' })
    expect(planPaving({ ...base, jointDensity: 3 })).toEqual({ ok: false, errorKey: 'tool.paving.error.jointDensity' })
    expect(planPaving({ ...base, baseCourseCm: 200 })).toEqual({ ok: false, errorKey: 'tool.paving.error.baseCourse' })
    expect(planPaving({ ...base, bulkFactor: 2 })).toEqual({ ok: false, errorKey: 'tool.paving.error.bulk' })
    expect(planPaving({ ...base, stonesPerPallet: 0 })).toEqual({ ok: false, errorKey: 'tool.paving.error.pallet' })
    expect(planPaving({ ...base, slopePercent: 30 })).toEqual({ ok: false, errorKey: 'tool.paving.error.slope' })
  })
})

describe('Vorschlagswerte', () => {
  it('hält jeden Vorschlag innerhalb der geprüften Grenzen', () => {
    const pairs: Array<[number, { min: number; max: number }]> = [
      [PAVING_DEFAULTS.stoneLengthCm.value, PAVING_LIMITS.stoneLengthCm],
      [PAVING_DEFAULTS.stoneBreadthCm.value, PAVING_LIMITS.stoneBreadthCm],
      [PAVING_DEFAULTS.stoneThicknessCm.value, PAVING_LIMITS.stoneThicknessCm],
      [PAVING_DEFAULTS.jointMm.value, PAVING_LIMITS.jointMm],
      [PAVING_DEFAULTS.surchargePercent.value, PAVING_LIMITS.surchargePercent],
      [PAVING_DEFAULTS.bedThicknessCm.value, PAVING_LIMITS.bedThicknessCm],
      [PAVING_DEFAULTS.bedDensity.value, PAVING_LIMITS.bedDensity],
      [PAVING_DEFAULTS.jointFillDepthCm.value, PAVING_LIMITS.jointFillDepthCm],
      [PAVING_DEFAULTS.jointDensity.value, PAVING_LIMITS.jointDensity],
      [PAVING_DEFAULTS.baseCourseCm.value, PAVING_LIMITS.baseCourseCm],
      [PAVING_DEFAULTS.bulkFactor.value, PAVING_LIMITS.bulkFactor],
      [PAVING_DEFAULTS.stonesPerPallet.value, PAVING_LIMITS.stonesPerPallet],
      [PAVING_DEFAULTS.slopePercent.value, PAVING_LIMITS.slopePercent]
    ]
    for (const [value, range] of pairs) {
      expect(value).toBeGreaterThanOrEqual(range.min)
      expect(value).toBeLessThanOrEqual(range.max)
    }
    // Herstellerabhängige Werte sind als Erfahrungswerte gekennzeichnet, nicht als belegt
    expect(PAVING_DEFAULTS.stonesPerPallet.source).toBe('experience')
    expect(PAVING_DEFAULTS.baseCourseCm.source).toBe('experience')
  })
})

describe('Anzeigerundung', () => {
  it('rundet auf zwölf gültige Stellen und lässt Sonderfälle stehen', () => {
    expect(roundForDisplay(47.1342852967)).toBeCloseTo(47.1342852967, 9)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(Number.NaN)).toBeNaN()
  })
})
