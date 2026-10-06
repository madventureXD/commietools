import { describe, expect, it } from 'vitest'
import {
  RECOMMENDED_VELOCITY,
  compositeSizes,
  copperSizes,
  crossSectionM2,
  frictionFactor,
  innerDiameterMm,
  pipeLimits,
  pipeSizesFor,
  planPipes,
  proposeSize,
  reynoldsNumber,
  steelSizes,
  velocityMs,
  velocityStatusFor,
  waterData,
  waterProperties,
  type PipesInput
} from '@commietools/tools/craft/pipes'
import { pipesMessages } from '../../../packages/tools/src/craft/pipes/locales'

/**
 * Alle Erwartungswerte sind mit `node -e` unabhängig nachgerechnet (Kommentar je Fall),
 * nicht im Kopf. Eingaben und Rohrgrößen entsprechen der Quellenlage (Abruf 2026-10-06).
 */

const basis = (patch: Partial<PipesInput> = {}): PipesInput => ({
  powerKw: 10,
  spreadK: 10,
  temperatureC: 20,
  material: 'copper',
  outerMm: 15,
  wallMm: 1.0,
  roughnessMm: 0.0015,
  specificHeat: 4186,
  ...patch
})

describe('Rohrdimensionierung — Volumenstrom', () => {
  it('rechnet 10 kW bei 10 K Spreizung auf den nachgerechneten Volumenstrom', () => {
    // ṁ = 10000 / (4186 · 10) = 0,23889154 kg/s; V̇ = ṁ / 998,2 = 2,3932232e-4 m³/s = 0,86156036 m³/h
    const check = planPipes(basis())
    expect(check.ok).toBe(true)
    if (!check.ok) return
    expect(check.result.massFlowKgS).toBeCloseTo(0.2388915432, 9)
    expect(check.result.volumeFlowM3S).toBeCloseTo(0.0002393223234, 12)
    expect(check.result.volumeFlowM3H).toBeCloseTo(0.8615603643, 9)
  })

  it('halbiert den Volumenstrom bei doppelter Spreizung', () => {
    const a = planPipes(basis())
    const b = planPipes(basis({ spreadK: 20 }))
    if (!a.ok || !b.ok) throw new Error('unerwartet')
    expect(b.result.volumeFlowM3S * 2).toBeCloseTo(a.result.volumeFlowM3S, 12)
  })

  it('nimmt die Dichte aus der Stoffdatentabelle', () => {
    const bei20 = planPipes(basis({ temperatureC: 20 }))
    const bei80 = planPipes(basis({ temperatureC: 80 }))
    if (!bei20.ok || !bei80.ok) throw new Error('unerwartet')
    // Wärmeres Wasser ist leichter (971,8 statt 998,2 kg/m³) → größerer Volumenstrom.
    expect(bei20.result.densityKgM3).toBe(998.2)
    expect(bei80.result.densityKgM3).toBe(971.8)
    expect(bei80.result.volumeFlowM3S).toBeGreaterThan(bei20.result.volumeFlowM3S)
  })
})

describe('Rohrdimensionierung — Geschwindigkeit', () => {
  it('trifft den nachgerechneten Fall w = V̇ / A', () => {
    // d = 13,0 mm → A = π · 0,0065² = 1,3273229e-4 m²; w = 2,3932232e-4 / A = 1,8030452 m/s
    expect(crossSectionM2(13)).toBeCloseTo(0.00013273229, 11)
    expect(velocityMs(0.0002393223234, 13)).toBeCloseTo(1.8030452, 6)
  })

  it('steigt mit kleinerem Durchmesser', () => {
    const weit = velocityMs(0.0002393223234, 20)
    const eng = velocityMs(0.0002393223234, 10)
    expect(eng).toBeGreaterThan(weit)
  })

  it('bewertet gegen die Richtwert-Spanne, ohne zu verbieten', () => {
    expect(velocityStatusFor(0.5)).toBe('below')
    expect(velocityStatusFor(1.2)).toBe('within')
    expect(velocityStatusFor(2.0)).toBe('above')
    expect(RECOMMENDED_VELOCITY.minMs).toBe(1.0)
    expect(RECOMMENDED_VELOCITY.maxMs).toBe(1.5)
  })
})

describe('Rohrdimensionierung — Reynoldszahl', () => {
  it('trifft den nachgerechneten Fall Re = w · d / ν', () => {
    // 1,8030452 · 0,013 / 1,003e-6 = 23369,48
    expect(reynoldsNumber(1.8030452, 13, 1.003e-6)).toBeCloseTo(23369.48, 1)
  })

  it('wird mit größerem Durchmesser größer', () => {
    expect(reynoldsNumber(1.0, 20, 1.003e-6)).toBeGreaterThan(reynoldsNumber(1.0, 10, 1.003e-6))
  })
})

describe('Rohrdimensionierung — Rohrreibungszahl und Druckgefälle', () => {
  it('gibt laminar exakt 64 / Re', () => {
    expect(frictionFactor(1000, 0.0015, 13)).toBeCloseTo(0.064, 12)
  })

  it('trifft den nachgerechneten turbulenten Fall (Haaland)', () => {
    // λ(Re=23369,48; k=0,0015 mm; d=13 mm) = 0,024975131
    expect(frictionFactor(23369.48, 0.0015, 13)).toBeCloseTo(0.024975131, 8)
  })

  it('sinkt mit glatterem Rohr', () => {
    expect(frictionFactor(23369.48, 0.0015, 13)).toBeLessThan(frictionFactor(23369.48, 0.3, 13))
  })

  it('berechnet das Druckverlustgefälle nachgerechnet', () => {
    // R = λ · ρ · w² / (2 · d) = 0,024975131 · 998,2 · 1,8030452² / (2 · 0,013) = 3117,204 Pa/m
    const check = planPipes(basis())
    if (!check.ok) throw new Error('unerwartet')
    expect(check.result.velocityMs).toBeCloseTo(1.8030452, 6)
    expect(check.result.reynolds).toBeCloseTo(23369.48, 1)
    expect(check.result.frictionFactor).toBeCloseTo(0.024975131, 8)
    expect(check.result.pressureGradientPaPerM).toBeCloseTo(3117.204, 3)
  })
})

describe('Rohrdimensionierung — Wasser-Stoffdaten', () => {
  it('gibt an jeder Stützstelle exakt den Tabellenwert', () => {
    for (const row of waterData) {
      const check = waterProperties(row.temperatureC)
      if (!check.ok) throw new Error(`Tabelle ${row.temperatureC} nicht gefunden`)
      expect(check.densityKgM3).toBe(row.densityKgM3)
      expect(check.viscosityM2S).toBe(row.viscosityM2S)
    }
  })

  it('interpoliert zwischen den Stützstellen', () => {
    // 15 °C liegt genau zwischen 10 (999,7 / 1,306) und 20 (998,2 / 1,003)
    const check = waterProperties(15)
    if (!check.ok) throw new Error('unerwartet')
    expect(check.densityKgM3).toBeCloseTo(998.95, 6)
    expect(check.viscosityM2S).toBeCloseTo(1.1545e-6, 12)
  })

  it('rechnet außerhalb von 10 bis 80 °C nicht, statt zu raten', () => {
    expect(waterProperties(9).ok).toBe(false)
    expect(waterProperties(81).ok).toBe(false)
  })
})

describe('Rohrdimensionierung — Rohrmaße mit Quelle', () => {
  it('rechnet ID = OD − 2·w für die belegten Zeilen nach', () => {
    expect(innerDiameterMm(15, 0.7)).toBeCloseTo(13.6, 10)
    expect(innerDiameterMm(15, 1.0)).toBeCloseTo(13.0, 10)
    expect(innerDiameterMm(22, 0.9)).toBeCloseTo(20.2, 10)
    expect(innerDiameterMm(20, 2.8)).toBeCloseTo(14.4, 10)
    expect(innerDiameterMm(20, 2.0)).toBeCloseTo(16.0, 10)
    expect(innerDiameterMm(21.3, 2.6)).toBeCloseTo(16.1, 10)
  })

  it('führt Kupfer 15 mm in beiden normkonformen Wanddicken', () => {
    const ids = copperSizes.filter((size) => size.outerMm === 15).map((size) => size.id)
    expect(ids.sort()).toEqual(['cu-15x07', 'cu-15x10'])
  })

  it('belegt jede Zeile mit einer Quelle und einem Abrufdatum', () => {
    for (const size of [...copperSizes, ...steelSizes, ...compositeSizes]) {
      expect(size.source.label.length).toBeGreaterThan(0)
      expect(size.source.url).toMatch(/^https:\/\//)
      expect(size.source.retrieved).toBe('2026-10-06')
    }
  })

  it('verwendet für Kupfer keinen Normtext-Volltext von einem Dritt-Host', () => {
    for (const size of copperSizes) {
      expect(size.source.url).not.toContain('lador.ru')
      expect(size.source.label.toLowerCase()).not.toContain('normtext')
    }
  })
})

describe('Rohrdimensionierung — DN-Vorschlag', () => {
  it('schlägt die kleinste Nennweite innerhalb des Richtwerts vor', () => {
    // 10 kW/10 K → V̇ = 2,3932232e-4 m³/s; Kupfer 13,0 mm → w = 1,80 (>1,5), 16,0 mm → w = 1,19 (≤1,5)
    const proposal = proposeSize('copper', 0.0002393223234)
    expect(proposal?.sizeId).toBe('cu-18x10')
    expect(proposal?.innerMm).toBeCloseTo(16, 10)
    expect(proposal?.velocityMs).toBeCloseTo(1.1902916, 6)
    expect(proposal?.status).toBe('within')
  })

  it('findet auch für Stahl eine passende Zeile', () => {
    const proposal = proposeSize('steel', 0.0002393223234)
    expect(proposal?.sizeId).toBe('st-dn15')
  })

  it('gibt ohne Volumenstrom nichts zurück, statt zu raten', () => {
    expect(proposeSize('copper', 0)).toBeNull()
    expect(proposeSize('copper', -1)).toBeNull()
  })
})

describe('Rohrdimensionierung — Grenzen', () => {
  it('weist jede Grenze aus pipeLimits wirklich ab', () => {
    // power
    expect(planPipes(basis({ powerKw: 0 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.power' })
    expect(planPipes(basis({ powerKw: 6000 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.power' })
    // spread
    expect(planPipes(basis({ spreadK: 0.5 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.spread' })
    expect(planPipes(basis({ spreadK: 61 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.spread' })
    // temperature
    expect(planPipes(basis({ temperatureC: 9 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.temperature' })
    expect(planPipes(basis({ temperatureC: 81 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.temperature' })
    // outer
    expect(planPipes(basis({ outerMm: 1 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.outer' })
    expect(planPipes(basis({ outerMm: 3000 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.outer' })
    // wall
    expect(planPipes(basis({ wallMm: 0.1 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.wall' })
    expect(planPipes(basis({ wallMm: 40 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.wall' })
    // inner: OD und Wand sind für sich zulässig, der Innenmaß aber nicht
    expect(planPipes(basis({ outerMm: 2, wallMm: 30 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.inner' })
    // roughness
    expect(planPipes(basis({ roughnessMm: 11 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.roughness' })
    // specificHeat
    expect(planPipes(basis({ specificHeat: 900 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.specificHeat' })
    expect(planPipes(basis({ specificHeat: 6001 }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.specificHeat' })
  })

  it('nimmt die Grenzwerte selbst noch an', () => {
    expect(planPipes(basis({ powerKw: 0.1 })).ok).toBe(true)
    expect(planPipes(basis({ spreadK: 60 })).ok).toBe(true)
    expect(planPipes(basis({ roughnessMm: 0 })).ok).toBe(true)
    expect(planPipes(basis({ specificHeat: 1000 })).ok).toBe(true)
    expect(pipeLimits.innerMm.min).toBe(1)
  })

  it('weist ungültige Eingaben ab', () => {
    expect(planPipes(basis({ powerKw: Number.NaN }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.empty' })
    expect(planPipes(basis({ outerMm: Number.POSITIVE_INFINITY }))).toEqual({ ok: false, errorKey: 'tool.pipes.error.empty' })
  })
})

describe('Rohrdimensionierung — Sprachpakete', () => {
  it('hat in allen drei Sprachen dieselben Schlüssel', () => {
    const de = Object.keys(pipesMessages.de).sort()
    expect(Object.keys(pipesMessages.en).sort()).toEqual(de)
    expect(Object.keys(pipesMessages.es).sort()).toEqual(de)
  })

  it('hält Kurztext und Suchbegriffe an die Katalogregeln', () => {
    for (const locale of ['de', 'en', 'es'] as const) {
      const summary = pipesMessages[locale]['tool.pipes.summary']
      const terms = pipesMessages[locale]['tool.pipes.terms']
      expect(summary.length).toBeLessThanOrEqual(120)
      expect(summary.length).toBeLessThan(pipesMessages[locale]['tool.pipes.description'].length)
      expect(terms).toContain('#')
      const list = terms.split(',').map((begriff) => begriff.trim()).filter(Boolean)
      expect(new Set(list.map((begriff) => begriff.toLowerCase())).size).toBe(list.length)
    }
  })

  it('bietet alle Rohrarten und Rauigkeiten als Übersetzungsschlüssel an', () => {
    const materialKeys = ['tool.pipes.material.copper', 'tool.pipes.material.steel', 'tool.pipes.material.composite'] as const
    for (const key of materialKeys) expect(pipesMessages.de[key]).toBeTruthy()
    for (const material of ['copper', 'steel', 'composite'] as const) {
      expect(pipeSizesFor(material).length).toBeGreaterThan(0)
    }
  })
})
