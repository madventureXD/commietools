import { describe, expect, it } from 'vitest'
import {
  METAL_LIMITS,
  metalArea,
  metalFieldUse,
  metalMaterialById,
  metalMaterials,
  metalProfiles,
  planMetalWeight,
  type MetalInput
} from '@commietools/tools/craft/metal'

const base: MetalInput = {
  profile: 'round',
  fields: { a: 20, b: 5, t: 2 },
  lengthM: 6,
  density: 7.85,
  count: 1
}

function result(input: Partial<MetalInput>) {
  const check = planMetalWeight({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Metallgewicht', () => {
  it('rechnet Rundstahl gegen die bekannte Faustformel nach', () => {
    // Fachquellen nennen für Rundstahl: kg/m = 0,006165 · d². Für d = 20 mm: 2,4662 kg/m.
    const value = result({})
    expect(value.massPerMeterKg).toBeCloseTo(0.006165 * 400, 3)
    expect(value.massPerMeterKg).toBeCloseTo((Math.PI / 4) * 400 * 7.85 / 1000, 9)
    expect(value.massKg).toBeCloseTo((Math.PI / 4) * 400 * 7.85 / 1000 * 6, 9)
  })

  it('trifft den Prüfwert Vollmaterial 100 mm aus Stahl', () => {
    const value = result({ fields: { a: 100, b: 0, t: 0 } })
    expect(value.massPerMeterKg).toBeCloseTo(61.65, 1)
  })

  it('rechnet Vierkant, Flach und Sechskant gegen die Faustformeln', () => {
    expect(result({ profile: 'square', fields: { a: 20, b: 0, t: 0 } }).massPerMeterKg).toBeCloseTo(0.00785 * 400, 3)
    expect(result({ profile: 'flat', fields: { a: 80, b: 10, t: 0 } }).massPerMeterKg).toBeCloseTo(0.00785 * 800, 3)
    expect(result({ profile: 'hex', fields: { a: 50, b: 0, t: 0 } }).massPerMeterKg).toBeCloseTo(0.0068 * 2500, 2)
  })

  it('rechnet Rohre über die Flächendifferenz, nicht über eine Näherung', () => {
    // Geprüft wird gegen die exakte Nachrechnung aus Querschnitt und Grundformel.
    // ACHTUNG, gemessener Befund: Die Beispielangaben einer Fachquelle zu Rohrgewichten
    // weichen davon ab (Rundrohr 48,3 × 2,6 mm über 6 m: dort „ca. 17,32 kg", gerechnet
    // 17,58 kg = 1,5 % mehr; Rechteckrohr 100 × 50 × 4 mm über 3 m: dort „ca. 35,40 kg",
    // gerechnet 26,75 kg). Die Flachstahl-Angabe derselben Quelle stimmt dagegen genau.
    // Deshalb ist die exakte Rechnung der Maßstab — und die Faustformeln der zweiten Quelle
    // (0,00785 · b · t) bestätigen sie.
    const tube = result({ profile: 'tube', fields: { a: 48.3, b: 0, t: 2.6 }, lengthM: 6 })
    expect(tube.massPerMeterKg).toBeCloseTo((Math.PI * 45.7 * 2.6 * 7.85) / 1000, 9)
    expect(tube.massKg).toBeCloseTo(17.58, 2)
    const rect = result({ profile: 'rectTube', fields: { a: 100, b: 50, t: 4 }, lengthM: 3 })
    expect(rect.areaMm2).toBeCloseTo(100 * 50 - 92 * 42, 9)
    expect(rect.massKg).toBeCloseTo(1136 * 7.85 / 1000 * 3, 9)
    // Flachstahl 80 × 10 mm, 2 m: die Fachquelle nennt rund 12,56 kg — das stimmt genau.
    expect(result({ profile: 'flat', fields: { a: 80, b: 10, t: 0 }, lengthM: 2 }).massKg).toBeCloseTo(12.56, 2)
  })

  it('skaliert mit Stückzahl und Länge', () => {
    const single = result({ lengthM: 1, count: 1 })
    const many = result({ lengthM: 2, count: 5 })
    expect(many.totalMassKg).toBeCloseTo(single.totalMassKg * 10, 6)
    expect(many.massPerMeterKg).toBeCloseTo(single.massPerMeterKg, 6)
  })

  it('führt die Querschnittsflächen korrekt', () => {
    expect(metalArea('round', { a: 20, b: 0, t: 0 })).toBeCloseTo(Math.PI * 100, 6)
    expect(metalArea('square', { a: 10, b: 0, t: 0 })).toBe(100)
    expect(metalArea('angle', { a: 50, b: 0, t: 5 })).toBe(5 * (100 - 5))
    expect(metalArea('squareTube', { a: 40, b: 0, t: 2 })).toBe(40 * 40 - 36 * 36)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planMetalWeight({ ...base, lengthM: 0 })).toEqual({ ok: false, errorKey: 'tool.metal.error.length' })
    expect(planMetalWeight({ ...base, count: 0 })).toEqual({ ok: false, errorKey: 'tool.metal.error.count' })
    expect(planMetalWeight({ ...base, fields: { a: 0.1, b: 0, t: 0 } })).toEqual({ ok: false, errorKey: 'tool.metal.error.dimension' })
    expect(planMetalWeight({ ...base, density: 30 })).toEqual({ ok: false, errorKey: 'tool.metal.error.density' })
    expect(planMetalWeight({ ...base, fields: { a: Number.NaN, b: 0, t: 0 } })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    // Rundrohr 20 mm mit 10 mm Wand: das Profil wäre geschlossen.
    expect(planMetalWeight({ ...base, profile: 'tube', fields: { a: 20, b: 0, t: 10 } })).toEqual({ ok: false, errorKey: 'tool.metal.error.wall' })
    expect(planMetalWeight({ ...base, profile: 'tube', fields: { a: 20, b: 0, t: 1 } }).ok).toBe(true)
  })

  it('braucht für jedes Profil genau die Felder, die es verwendet', () => {
    for (const profile of metalProfiles) {
      const use = metalFieldUse(profile)
      expect(typeof use.a).toBe('boolean')
      const filled = planMetalWeight({ ...base, profile, fields: { a: 30, b: 20, t: 2 } })
      expect(filled.ok, profile).toBe(true)
    }
    expect(metalFieldUse('round')).toEqual({ a: true, b: false, t: false })
    expect(metalFieldUse('rectTube')).toEqual({ a: true, b: true, t: true })
  })

  it('führt die Werkstoffdichten mit ihrer Herkunft', () => {
    expect(metalMaterials.length).toBeGreaterThanOrEqual(6)
    expect(metalMaterialById('steel')?.density).toBe(7.85)
    expect(metalMaterialById('aluminium')?.density).toBe(2.7)
    expect(metalMaterialById('steel')?.sourced).toBe(true)
    expect(metalMaterialById('lead')?.sourced).toBe(false)
    for (const material of metalMaterials) {
      expect(material.density, material.id).toBeGreaterThanOrEqual(METAL_LIMITS.density.min)
      expect(material.density, material.id).toBeLessThanOrEqual(METAL_LIMITS.density.max)
    }
  })
})
