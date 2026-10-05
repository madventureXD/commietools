import { describe, expect, it } from 'vitest'
import {
  DRYWALL_DEFAULTS,
  DRYWALL_LIMITS,
  jointLengthPerMeterFromFormat,
  planDrywall,
  platesPerStripFor,
  roundForDisplay,
  stripsFor,
  type DrywallInput
} from '@commietools/tools/craft/drywall'

const base: DrywallInput = {
  perimeterM: 12,
  heightM: 2.6,
  doorCount: 1,
  doorAreaM2: 2,
  windowCount: 1,
  windowAreaM2: 1.5,
  layers: 1,
  plateLengthM: 2,
  plateWidthM: 1.25,
  studSpacingM: 0.625,
  profileLengthM: 4,
  screwsPerSqm: 25,
  fillerPerSqm: 0.35,
  bagSizeKg: 25
}

function result(input: Partial<DrywallInput>) {
  const check = planDrywall({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Trockenbau', () => {
  it('rechnet ein Baustellenbeispiel nach', () => {
    // 12 m Wand, 2,6 m hoch, eine Tür (2 m²) und ein Fenster (1,5 m²), einfach beplankt
    const value = result({})
    expect(value.grossAreaM2).toBeCloseTo(31.2, 9)
    expect(value.deductionAreaM2).toBeCloseTo(3.5, 9)
    expect(value.netAreaM2).toBeCloseTo(27.7, 9)
    expect(value.widthM).toBeCloseTo(12, 9)
    // Bahnen: 12 / 1,25 = 9,6 → 10 · Platten je Bahn: 2,6 / 2,0 = 1,3 → 2 · je Lage 20 Platten
    expect(value.strips).toBe(10)
    expect(value.platesPerStrip).toBe(2)
    expect(value.platesPerLayer).toBe(20)
    expect(value.plates).toBe(20)
    // Verschnitt: 20 · 2,5 m² = 50 m² gekauft, gebraucht 27,7 m²
    expect(value.offcutAreaM2).toBeCloseTo(22.3, 4)
    // Ständer: 12 / 0,625 = 19,2 → 20 + 1 = 21 · Profilmeter 54,6 m → 14 Profile · UW 24/4 → 6
    expect(value.studs).toBe(21)
    expect(value.studMeters).toBeCloseTo(54.6, 9)
    expect(value.studProfiles).toBe(14)
    expect(value.trackProfiles).toBe(6)
    expect(value.screws).toBe(693)
    expect(value.fillerKg).toBeCloseTo(9.695, 4)
    expect(value.fillerBags).toBe(1)
    expect(value.fillerRemainderKg).toBeCloseTo(15.305, 4)
    expect(value.tapeMeters).toBeCloseTo(36.01, 3)
  })

  it('belegt, dass die kürzere Platte den Verschnitt senkt — der Kern der Bahnenrechnung', () => {
    const short = result({ plateLengthM: 2 })
    const exact = result({ plateLengthM: 2.6 })
    expect(short.platesPerStrip).toBe(2)
    expect(exact.platesPerStrip).toBe(1)
    expect(short.plates).toBe(20)
    expect(exact.plates).toBe(10)
    expect(exact.offcutAreaM2).toBeCloseTo(10 * 2.6 * 1.25 - 27.7, 4)
    expect(exact.offcutAreaM2).toBeLessThan(short.offcutAreaM2 / 3)
    // Eine reine Flächenteilung hätte 27,7 / 2,5 = 11,08 → 12 Platten ergeben — also weniger als
    // die 20, die bei 2,60 m Wandhöhe mit 2,00 m Platten tatsächlich gebraucht werden.
    expect(short.plates).toBeGreaterThan(Math.ceil(short.netAreaM2 / (2 * 1.25)))
  })

  it('rechnet die Bahnen über die volle Wandbreite — Öffnungen nehmen keine ganze Bahn weg', () => {
    // Gegenprobe zum Modellfehler des ersten Entwurfs: würde man die Öffnungsbreiten abziehen,
    // deckte die gekaufte Plattenfläche die Wand gar nicht mehr.
    const value = result({})
    const covered = value.strips * 1.25 * 2.6
    expect(covered).toBeGreaterThan(value.netAreaM2)
    const withReducedWidth = stripsFor(12 - 0.9 - 1.2, 1.25) * 1.25 * 2.6
    expect(withReducedWidth).toBeLessThan(value.netAreaM2)
    expect(stripsFor(12, 1.25)).toBe(10)
    expect(stripsFor(9.9, 1.25)).toBe(8)
  })

  it('verdoppelt Platten und Verbrauch bei doppelter Beplankung', () => {
    const single = result({})
    const double = result({ layers: 2 })
    expect(double.plates).toBe(single.plates * 2)
    expect(double.screws).toBe(single.screws * 2)
    expect(double.fillerKg).toBeCloseTo(single.fillerKg * 2, 9)
    expect(double.fillerBags).toBe(1)
    expect(double.fillerRemainderKg).toBeCloseTo(25 - 19.39, 4)
    // Bahnen und Profile hängen nicht an der Lage
    expect(double.strips).toBe(single.strips)
    expect(double.studProfiles).toBe(single.studProfiles)
  })

  it('rundet Bahnen, Platten und Profile auf, Säcke ebenfalls', () => {
    expect(platesPerStripFor(2.6, 2)).toBe(2)
    expect(platesPerStripFor(2.6, 2.7)).toBe(1)
    expect(platesPerStripFor(2.6, 0.9)).toBe(3)
    expect(stripsFor(12.5, 1.25)).toBe(10)
    expect(stripsFor(12.51, 1.25)).toBe(11)
    expect(result({ fillerPerSqm: 1 }).fillerBags).toBe(2)
    expect(result({ bagSizeKg: 5 }).fillerBags).toBe(2)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planDrywall({ ...base, perimeterM: 0 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.perimeter' })
    expect(planDrywall({ ...base, heightM: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planDrywall({ ...base, heightM: 0.1 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.height' })
    expect(planDrywall({ ...base, doorCount: 500 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.openings' })
    expect(planDrywall({ ...base, windowAreaM2: 60 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.openingArea' })
    expect(planDrywall({ ...base, layers: 3 as 1 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.layers' })
    expect(planDrywall({ ...base, plateWidthM: 3 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.plate' })
    expect(planDrywall({ ...base, plateLengthM: 0.2 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.plate' })
    expect(planDrywall({ ...base, studSpacingM: 0.1 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.spacing' })
    expect(planDrywall({ ...base, profileLengthM: 0.5 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.profile' })
    expect(planDrywall({ ...base, screwsPerSqm: 100 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.screws' })
    expect(planDrywall({ ...base, fillerPerSqm: 5 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.filler' })
    expect(planDrywall({ ...base, bagSizeKg: 60 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.bag' })
    expect(planDrywall({ ...base, doorCount: 20, windowCount: 20 })).toEqual({ ok: false, errorKey: 'tool.drywall.error.deduction' })
  })
})

describe('Fugenband und Vorschlagswerte', () => {
  it('rechnet die Fugenlänge je m² aus dem Plattenformat', () => {
    // Je 2,00 × 1,25 m Platte entfallen (a + b) auf sie: (3,25) / (2,5) = 1,3 m je m²
    expect(jointLengthPerMeterFromFormat(2, 1.25)).toBeCloseTo(1.3, 9)
    expect(jointLengthPerMeterFromFormat(2.6, 1.25)).toBeCloseTo(1.1846, 4)
  })

  it('hält die Vorschlagswerte innerhalb der geprüften Grenzen', () => {
    expect(DRYWALL_DEFAULTS.plateLengthM.value).toBeGreaterThanOrEqual(DRYWALL_LIMITS.plateLengthM.min)
    expect(DRYWALL_DEFAULTS.plateWidthM.value).toBeLessThanOrEqual(DRYWALL_LIMITS.plateWidthM.max)
    expect(DRYWALL_DEFAULTS.studSpacingM.value).toBeLessThanOrEqual(DRYWALL_LIMITS.studSpacingM.max)
    expect(DRYWALL_DEFAULTS.screwsPerSqm.value).toBeLessThanOrEqual(DRYWALL_LIMITS.screwsPerSqm.max)
    expect(DRYWALL_DEFAULTS.fillerPerSqm.value).toBeLessThanOrEqual(DRYWALL_LIMITS.fillerPerSqm.max)
    expect(DRYWALL_DEFAULTS.plateLengthM.source).toBe('sourced')
    expect(DRYWALL_DEFAULTS.studSpacingM.source).toBe('sourced')
    expect(DRYWALL_DEFAULTS.screwsPerSqm.source).toBe('experience')
  })
})

describe('Anzeigerundung', () => {
  it('rundet auf zwölf gültige Stellen und lässt Sonderfälle stehen', () => {
    expect(roundForDisplay(9.694999999999999)).toBeCloseTo(9.695, 10)
    expect(roundForDisplay(0)).toBe(0)
    expect(roundForDisplay(Number.NaN)).toBeNaN()
  })
})
