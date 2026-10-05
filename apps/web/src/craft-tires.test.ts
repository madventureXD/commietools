import { describe, expect, it } from 'vitest'
import {
  FOOT_POUND_PER_NEWTON_METER,
  KILOGRAM_FORCE_METER_PER_NEWTON_METER,
  TIRE_DEFAULTS,
  TIRE_LIMITS,
  circumferenceM,
  outerDiameter,
  planTires,
  sidewallHeight,
  wheelRpm,
  type TireInput
} from '@commietools/tools/craft/tires'

const base: TireInput = {
  widthMm: 205,
  profilePercent: 55,
  rimInch: 16,
  referenceWidthMm: 195,
  referenceProfilePercent: 65,
  referenceRimInch: 15,
  speedKmh: 100,
  torqueNm: 120,
  tolerancePercent: 5
}

function result(input: Partial<TireInput>) {
  const check = planTires({ ...base, ...input })
  if (!check.ok) throw new Error(`erwartet ok, war ${check.errorKey}`)
  return check.result
}

describe('Reifen und Drehmoment', () => {
  it('rechnet 205/55 R16 gegen 195/65 R15 nach', () => {
    const value = result({})
    // Flankenhöhe 205 · 55 / 100 = 112,75 mm; Durchmesser 16 · 25,4 + 2 · 112,75 = 631,90 mm
    expect(value.sidewallMm).toBeCloseTo(112.75, 6)
    expect(value.diameterMm).toBeCloseTo(631.9, 6)
    // Umfang π · 0,6319 m = 1,9851724 m (nicht 1,985159 — meine erste Handrechnung war falsch)
    expect(value.circumferenceM).toBeCloseTo(1.9851724, 6)
    expect(value.circumferenceM).toBeCloseTo((Math.PI * 631.9) / 1000, 9)
    // Bezug 195/65 R15: Durchmesser 634,5 mm → Umfang 1,9933405 m
    expect(value.referenceCircumferenceM).toBeCloseTo(1.9933405, 6)
    expect(value.referenceCircumferenceM).toBeCloseTo((Math.PI * 634.5) / 1000, 9)
    // Abweichung (1,9851724 / 1,9933405 − 1) · 100 = −0,40977 %
    expect(value.circumferenceDeviationPercent).toBeCloseTo(-0.4098, 3)
    // Gleiche Raddrehzahl: bei 100 km/h Anzeige werden 99,590 km/h gefahren
    expect(value.trueSpeedKmh).toBeCloseTo(99.59, 2)
    // Umdrehungen je Kilometer 1000 / 1,9851724 = 503,7346
    expect(value.revolutionsPerKm).toBeCloseTo(503.7346, 3)
    // Drehzahl bei 100 km/h: 100000 / 60 / 1,9851724 = 839,5576 U/min
    expect(value.wheelRpm).toBeCloseTo(839.5576, 3)
  })

  it('rechnet das Anzugsmoment um und bildet den Toleranzbereich', () => {
    const value = result({})
    expect(value.torqueFtLb).toBeCloseTo(88.5074, 3)
    expect(value.torqueKgfM).toBeCloseTo(12.2366, 3)
    expect(value.torqueMinNm).toBeCloseTo(114, 9)
    expect(value.torqueMaxNm).toBeCloseTo(126, 9)
    // Toleranz null: beide Grenzen fallen auf den Wert
    const tight = result({ tolerancePercent: 0 })
    expect(tight.torqueMinNm).toBeCloseTo(120, 9)
    expect(tight.torqueMaxNm).toBeCloseTo(120, 9)
    // Die Umrechnungsfaktoren sind Konstanten, keine Schätzungen
    expect(FOOT_POUND_PER_NEWTON_METER).toBeCloseTo(0.7375621, 6)
    expect(KILOGRAM_FORCE_METER_PER_NEWTON_METER).toBeCloseTo(0.1019716, 6)
    expect(120 * FOOT_POUND_PER_NEWTON_METER).toBeCloseTo(88.5075, 3)
  })

  it('rechnet die Umfänge unabhängig nachgerechnet gegen', () => {
    // Umfang = π · Durchmesser / 1000 — direkt aus der Geometrie, ohne das Werkzeug
    expect(circumferenceM(205, 55, 16)).toBeCloseTo((Math.PI * 631.9) / 1000, 9)
    expect(sidewallHeight(205, 55)).toBeCloseTo(112.75, 9)
    expect(outerDiameter(205, 55, 16)).toBeCloseTo(631.9, 9)
    // Ein Zoll sind exakt 25,4 mm: 1 Zoll mehr macht 25,4 mm Durchmesser mehr
    expect(outerDiameter(205, 55, 17) - outerDiameter(205, 55, 16)).toBeCloseTo(25.4, 9)
    // Drehzahl und Umfang hängen umgekehrt zusammen
    expect(wheelRpm(2, 60)).toBeCloseTo(500, 9)
    expect(wheelRpm(1, 60)).toBeCloseTo(1000, 9)
  })

  it('zeigt den Zustand gleicher Reifen als Nullabweichung', () => {
    const same = result({
      referenceWidthMm: base.widthMm,
      referenceProfilePercent: base.profilePercent,
      referenceRimInch: base.rimInch
    })
    expect(same.circumferenceDeviationPercent).toBeCloseTo(0, 9)
    expect(same.trueSpeedKmh).toBeCloseTo(base.speedKmh, 9)
    // Richtung der Abweichung: Der **Bezug** entscheidet. Ein größerer Bezugsreifen macht die
    // eigene Abweichung negativ (der eigene Radumfang ist kleiner), ein kleinerer positiv.
    const biggerReference = result({
      referenceWidthMm: 205,
      referenceProfilePercent: 65,
      referenceRimInch: 16
    })
    // Bezug 205/65 R16: Umfang 2,113983 m → (1,9851724 / 2,113983 − 1) · 100 = −6,093 %
    expect(biggerReference.circumferenceDeviationPercent).toBeCloseTo(-6.093, 3)
    expect(biggerReference.trueSpeedKmh).toBeLessThan(base.speedKmh)
    const smallerReference = result({
      referenceWidthMm: 185,
      referenceProfilePercent: 60,
      referenceRimInch: 14
    })
    // Bezug 185/60 R14: Durchmesser 577,6 mm → Umfang 1,814578 m → +9,40 %
    expect(smallerReference.circumferenceDeviationPercent).toBeCloseTo(9.4, 2)
    expect(smallerReference.trueSpeedKmh).toBeGreaterThan(base.speedKmh)
  })

  it('weist unbrauchbare Eingaben ab', () => {
    expect(planTires({ ...base, widthMm: Number.NaN })).toEqual({ ok: false, errorKey: 'tool.craft.error.empty' })
    expect(planTires({ ...base, widthMm: 50 })).toEqual({ ok: false, errorKey: 'tool.tires.error.width' })
    expect(planTires({ ...base, profilePercent: 10 })).toEqual({ ok: false, errorKey: 'tool.tires.error.profile' })
    expect(planTires({ ...base, rimInch: 28 })).toEqual({ ok: false, errorKey: 'tool.tires.error.rim' })
    expect(planTires({ ...base, referenceWidthMm: 50 })).toEqual({ ok: false, errorKey: 'tool.tires.error.referenceWidth' })
    expect(planTires({ ...base, referenceProfilePercent: 10 })).toEqual({ ok: false, errorKey: 'tool.tires.error.referenceProfile' })
    expect(planTires({ ...base, referenceRimInch: 28 })).toEqual({ ok: false, errorKey: 'tool.tires.error.referenceRim' })
    expect(planTires({ ...base, speedKmh: 500 })).toEqual({ ok: false, errorKey: 'tool.tires.error.speed' })
    expect(planTires({ ...base, torqueNm: 0 })).toEqual({ ok: false, errorKey: 'tool.tires.error.torque' })
    expect(planTires({ ...base, tolerancePercent: 40 })).toEqual({ ok: false, errorKey: 'tool.tires.error.tolerance' })
  })
})

describe('Vorschlagswerte und Grenzen', () => {
  it('hält jeden Vorschlag innerhalb der geprüften Grenzen', () => {
    const pairs: Array<[number, { min: number; max: number }]> = [
      [TIRE_DEFAULTS.widthMm.value, TIRE_LIMITS.widthMm],
      [TIRE_DEFAULTS.profilePercent.value, TIRE_LIMITS.profilePercent],
      [TIRE_DEFAULTS.rimInch.value, TIRE_LIMITS.rimInch],
      [TIRE_DEFAULTS.referenceWidthMm.value, TIRE_LIMITS.referenceWidthMm],
      [TIRE_DEFAULTS.referenceProfilePercent.value, TIRE_LIMITS.referenceProfilePercent],
      [TIRE_DEFAULTS.referenceRimInch.value, TIRE_LIMITS.referenceRimInch],
      [TIRE_DEFAULTS.speedKmh.value, TIRE_LIMITS.speedKmh],
      [TIRE_DEFAULTS.torqueNm.value, TIRE_LIMITS.torqueNm],
      [TIRE_DEFAULTS.tolerancePercent.value, TIRE_LIMITS.tolerancePercent]
    ]
    for (const [value, range] of pairs) {
      expect(value).toBeGreaterThanOrEqual(range.min)
      expect(value).toBeLessThanOrEqual(range.max)
    }
    // Das Anzugsmoment ist ein Beispiel, keine Vorgabe — und als Erfahrungswert gekennzeichnet
    expect(TIRE_DEFAULTS.torqueNm.source).toBe('experience')
    expect(TIRE_DEFAULTS.widthMm.source).toBe('experience')
  })
})
