import { describe, expect, it } from 'vitest'
import {
  planWoodDryMass,
  planWoodMoisture,
  planWoodWeight,
  WOOD_LIMITS,
  woodMoistureBand,
  woodSpecies,
  woodSpeciesById,
  woodVolumeFromMm
} from '@commietools/tools/craft/wood'

describe('Holzfeuchte und Holzgewicht', () => {
  it('rechnet das Beispiel der Fachquelle nach', () => {
    // 10 kg trocken, 13 kg feucht → 30 % Holzfeuchte (holzland.de)
    const check = planWoodMoisture({ wetKg: 13, dryKg: 10 })
    if (!check.ok) throw new Error(check.errorKey)
    expect(check.result.moisturePercent).toBeCloseTo(30, 9)
    expect(check.result.waterKg).toBeCloseTo(3, 9)
    expect(check.result.drySharePercent).toBeCloseTo(76.923, 3)
    expect(check.result.band).toBe('working')
  })

  it('stuft die Bereiche wie die Fachquelle ein', () => {
    expect(woodMoistureBand(5.9)).toBe('dry')
    expect(woodMoistureBand(6)).toBe('working')
    expect(woodMoistureBand(34.9)).toBe('working')
    expect(woodMoistureBand(35)).toBe('wet')
  })

  it('ist der Rückweg derselben Gleichung', () => {
    const back = planWoodDryMass(13, 30)
    if (!back.ok) throw new Error(back.errorKey)
    expect(back.result.dryKg).toBeCloseTo(10, 9)
    expect(back.result.waterKg).toBeCloseTo(3, 9)
    const zero = planWoodDryMass(13, 0)
    if (!zero.ok) throw new Error(zero.errorKey)
    expect(zero.result.dryKg).toBeCloseTo(13, 9)
  })

  it('weist eine Darrmasse über dem Nassgewicht ab', () => {
    expect(planWoodMoisture({ wetKg: 10, dryKg: 13 })).toEqual({ ok: false, errorKey: 'tool.wood.error.dryHeavier' })
    expect(planWoodMoisture({ wetKg: 0, dryKg: 0 })).toEqual({ ok: false, errorKey: 'tool.wood.error.mass' })
    expect(planWoodMoisture({ wetKg: Number.NaN, dryKg: 10 })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planWoodDryMass(10, 400)).toEqual({ ok: false, errorKey: 'tool.wood.error.moisture' })
  })

  it('rechnet das Holzgewicht aus Maßen', () => {
    // Kantholz 60 × 120 mm, 4 m, Fichte 0,46 kg/dm³: 0,0288 m³ → 13,248 kg
    const volume = woodVolumeFromMm(60, 120, 4000)
    expect(volume).toBeCloseTo(0.0288, 9)
    const check = planWoodWeight({ volumeM3: volume, density: 0.46, count: 10 })
    if (!check.ok) throw new Error(check.errorKey)
    expect(check.result.massKg).toBeCloseTo(13.248, 6)
    expect(check.result.totalMassKg).toBeCloseTo(132.48, 6)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planWoodWeight({ volumeM3: 0, density: 0.46, count: 1 })).toEqual({ ok: false, errorKey: 'tool.craft.error.volume' })
    expect(planWoodWeight({ volumeM3: 0.01, density: 2, count: 1 })).toEqual({ ok: false, errorKey: 'tool.wood.error.density' })
    expect(planWoodWeight({ volumeM3: 0.01, density: 0.46, count: 0 })).toEqual({ ok: false, errorKey: 'tool.wood.error.count' })
    expect(planWoodWeight({ volumeM3: Number.NaN, density: 0.46, count: 1 })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
  })

  it('führt die Rohdichten mit ihrer Herkunft', () => {
    expect(woodSpecies.length).toBeGreaterThanOrEqual(12)
    expect(woodSpeciesById('spruce')?.density).toBe(0.46)
    expect(woodSpeciesById('oak')?.density).toBe(0.71)
    expect(woodSpeciesById('pine')?.density).toBe(0.52)
    for (const species of woodSpecies) {
      expect(species.sourced, species.id).toBe(true)
      expect(species.density, species.id).toBeGreaterThanOrEqual(WOOD_LIMITS.density.min)
      expect(species.density, species.id).toBeLessThanOrEqual(WOOD_LIMITS.density.max)
    }
    expect(woodSpeciesById('nicht-vorhanden')).toBeUndefined()
  })
})
