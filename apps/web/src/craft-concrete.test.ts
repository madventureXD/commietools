import { describe, expect, it } from 'vitest'
import {
  CRAFT_LIMITS,
  craftMixById,
  craftMixes,
  craftMixesOfKind,
  planCraftMix,
  roundForDisplay,
  volumeFromArea,
  volumeFromDimensions,
  type CraftMixInput
} from '@commietools/tools/craft/concrete'

const base: CraftMixInput = {
  volumeCubicMeters: 0.5,
  cementPerCubicMeter: 300,
  waterCementRatio: 0.6,
  freshDensity: 2400,
  wastePercent: 0,
  bagSizeKg: 25
}

function result(input: Partial<CraftMixInput>) {
  const check = planCraftMix({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Beton, Mörtel und Estrich', () => {
  it('hält die Massenbilanz: Zement + Wasser + Zuschlag = Volumen · Dichte', () => {
    const value = result({})
    expect(value.cementKg + value.waterLiters + value.aggregateKg).toBeCloseTo(value.totalMassKg, 9)
    expect(value.totalMassKg).toBeCloseTo(0.5 * 2400, 9)
  })

  it('rechnet ein Baustellenbeispiel nach', () => {
    // 0,5 m³ C20/25, 5 % Verschnitt, 300 kg/m³, w/z 0,60, 2.400 kg/m³, 25-kg-Säcke
    const value = result({ wastePercent: 5 })
    expect(value.volumeCubicMeters).toBeCloseTo(0.525, 9)
    expect(value.cementKg).toBeCloseTo(157.5, 9)
    expect(value.waterLiters).toBeCloseTo(94.5, 9)
    expect(value.aggregateKg).toBeCloseTo(1008, 9)
    expect(value.totalMassKg).toBeCloseTo(1260, 9)
    expect(value.bags).toBe(7)
    expect(value.bagsRemainderKg).toBeCloseTo(17.5, 9)
    expect(value.aggregatePerCement).toBeCloseTo(6.4, 9)
  })

  it('rundet die Sackzahl immer auf, auch bei glatter Teilung', () => {
    expect(result({ volumeCubicMeters: 1, cementPerCubicMeter: 300, bagSizeKg: 25 }).bags).toBe(12)
    expect(result({ volumeCubicMeters: 1, cementPerCubicMeter: 300, bagSizeKg: 25 }).bagsRemainderKg).toBeCloseTo(0, 9)
    expect(result({ volumeCubicMeters: 0.5, cementPerCubicMeter: 301, wastePercent: 0, bagSizeKg: 25 }).bags).toBe(7)
  })

  it('rechnet das Volumen aus Maßen und aus der Fläche', () => {
    expect(volumeFromDimensions(2.5, 2, 0.1)).toBeCloseTo(0.5, 9)
    expect(volumeFromArea(5, 0.06)).toBeCloseTo(0.3, 9)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planCraftMix({ ...base, volumeCubicMeters: 0 })).toEqual({ ok: false, errorKey: 'tool.craft.error.volume' })
    expect(planCraftMix({ ...base, volumeCubicMeters: -1 })).toEqual({ ok: false, errorKey: 'tool.craft.error.volume' })
    expect(planCraftMix({ ...base, cementPerCubicMeter: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planCraftMix({ ...base, cementPerCubicMeter: CRAFT_LIMITS.cementPerCubicMeter.max + 1 })).toEqual({ ok: false, errorKey: 'tool.craft.error.cement' })
    expect(planCraftMix({ ...base, waterCementRatio: 2 })).toEqual({ ok: false, errorKey: 'tool.craft.error.ratio' })
    expect(planCraftMix({ ...base, freshDensity: 500 })).toEqual({ ok: false, errorKey: 'tool.craft.error.density' })
    expect(planCraftMix({ ...base, wastePercent: -5 })).toEqual({ ok: false, errorKey: 'tool.craft.error.waste' })
    expect(planCraftMix({ ...base, bagSizeKg: 60 })).toEqual({ ok: false, errorKey: 'tool.craft.error.bag' })
  })

  it('meldet eine Mischung, die keinen Zuschlag übrig lässt, als Fehler', () => {
    expect(planCraftMix({ ...base, cementPerCubicMeter: 800, waterCementRatio: 0.5, freshDensity: 1200 }))
      .toEqual({ ok: false, errorKey: 'tool.craft.error.mix' })
  })
})

describe('Vorschlagswerte', () => {
  it('liegt für jede Mischung innerhalb der geprüften Grenzen', () => {
    for (const mix of craftMixes) {
      expect(mix.cementPerCubicMeter, mix.id).toBeGreaterThanOrEqual(CRAFT_LIMITS.cementPerCubicMeter.min)
      expect(mix.cementPerCubicMeter, mix.id).toBeLessThanOrEqual(CRAFT_LIMITS.cementPerCubicMeter.max)
      expect(mix.waterCementRatio, mix.id).toBeGreaterThanOrEqual(CRAFT_LIMITS.waterCementRatio.min)
      expect(mix.waterCementRatio, mix.id).toBeLessThanOrEqual(CRAFT_LIMITS.waterCementRatio.max)
      expect(mix.freshDensity, mix.id).toBeGreaterThanOrEqual(CRAFT_LIMITS.freshDensity.min)
      expect(mix.freshDensity, mix.id).toBeLessThanOrEqual(CRAFT_LIMITS.freshDensity.max)
    }
  })

  it('rechnet für jede angebotene Mischung ein Volumen von 1 m³ fehlerfrei durch', () => {
    for (const mix of craftMixes) {
      const check = planCraftMix({
        volumeCubicMeters: 1,
        cementPerCubicMeter: mix.cementPerCubicMeter,
        waterCementRatio: mix.waterCementRatio,
        freshDensity: mix.freshDensity,
        wastePercent: 5,
        bagSizeKg: 25
      })
      expect(check.ok, mix.id).toBe(true)
    }
  })

  it('ordnet jede Mischung genau einer Art zu', () => {
    const kinds = ['concrete', 'mortar', 'screed'] as const
    for (const kind of kinds) {
      const mixes = craftMixesOfKind(kind)
      expect(mixes.length, kind).toBeGreaterThan(0)
      for (const mix of mixes) expect(mix.kind).toBe(kind)
    }
    expect(craftMixesOfKind('concrete').length + craftMixesOfKind('mortar').length + craftMixesOfKind('screed').length).toBe(craftMixes.length)
    expect(craftMixById('nicht-vorhanden')).toBeUndefined()
  })

  it('kennzeichnet Mörtel- und Estrichwerte als Erfahrungswerte', () => {
    // Belegte Werte dürfen als belegt geführt werden, unbelegte nicht — die Oberfläche zeigt das an.
    expect(craftMixById('c2025')?.source).toBe('sourced')
    expect(craftMixById('cementMortar')?.source).toBe('experience')
    expect(craftMixById('cementScreed')?.source).toBe('experience')
  })
})

describe('Anzeigerundung', () => {
  it('rundet auf zwölf gültige Stellen und lässt Sonderfälle stehen', () => {
    expect(roundForDisplay(28.274333882308138)).toBeCloseTo(28.27433388231, 10)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY)
  })
})
