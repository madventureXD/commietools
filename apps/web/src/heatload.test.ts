import { describe, expect, it } from 'vitest'
import {
  AIR_DENSITY,
  AIR_HEAT_CAPACITY,
  heatloadErrorKeys,
  heatloadLimits,
  heatloadResult,
  heatloadSourceOfSurface,
  planHeatload,
  roomResult,
  roomVolume,
  transmissionLoss,
  ventilationLoss,
  type HeatloadInput,
  type RoomInput,
  type SurfaceInput
} from '@commietools/tools/craft/heatload'

/**
 * Handgerechnete Fälle. Alle Erwartungswerte sind mit `node -e` erzeugt und hier nur notiert —
 * Kopfrechnen hat in diesem Projekt schon mehrfach falsche Erwartungen erzeugt.
 */

const flaeche = (patch: Partial<SurfaceInput> = {}): SurfaceInput => ({ id: 'f1', presetId: '', area: 30, uValue: 1.0, ...patch })

const raum = (patch: Partial<RoomInput> = {}): RoomInput => ({
  id: 'raum-1',
  name: 'Wohnzimmer',
  use: 'wohnen',
  indoorTemp: 20,
  floorArea: 20,
  height: 2.5,
  airChange: 0.5,
  surfaces: [flaeche()],
  ...patch
})

const entwurf = (patch: Partial<HeatloadInput> = {}): HeatloadInput => ({ outdoorTemp: -10, rooms: [raum()], ...patch })

describe('Heizlast — Transmission', () => {
  it('rechnet U · A · ΔT', () => {
    // 1,0 · 30 · 30 = 900 W
    expect(transmissionLoss(1.0, 30, 30)).toBe(900)
    // 2,7 · 5 · 30 = 405 W
    expect(transmissionLoss(2.7, 5, 30)).toBe(405)
  })

  it('summiert die Bauteile eines Raums und bildet ΔT = innen − außen', () => {
    const ergebnis = roomResult(raum({ surfaces: [flaeche({ uValue: 1.0, area: 30 }), flaeche({ id: 'f2', uValue: 2.7, area: 5 })] }), -10)
    expect(ergebnis.deltaT).toBe(30)
    expect(ergebnis.transmission).toBe(1305) // 900 + 405
    expect(ergebnis.surfaces.map((zeile) => zeile.loss)).toEqual([900, 405])
  })
})

describe('Heizlast — Lüftung', () => {
  it('rechnet ρ · c_p · n · V · ΔT ÷ 3600 (n in h⁻¹, deshalb je Stunde)', () => {
    // Ohne die 3600 wären es 904 500 — die Division ist der Unterschied zwischen Energie je Stunde und Watt.
    expect(ventilationLoss(0.5, 50, 30)).toBeCloseTo(251.25, 6)
    expect(ventilationLoss(0.5, 37.5, 27)).toBeCloseTo(169.59375, 6)
    // Direkt gegen die belegten Stoffdaten gerechnet.
    expect(ventilationLoss(0.5, 50, 30)).toBeCloseTo((AIR_DENSITY * AIR_HEAT_CAPACITY * 0.5 * 50 * 30) / 3600, 10)
  })

  it('bildet das Volumen als Grundfläche × Höhe', () => {
    expect(roomVolume(20, 2.5)).toBe(50)
    expect(roomVolume(15, 2.5)).toBe(37.5)
  })
})

describe('Heizlast — Summe über zwei Räume', () => {
  it('addiert Transmission und Lüftung je Raum zum Gebäude', () => {
    const erster = raum({ surfaces: [flaeche({ uValue: 1.0, area: 30 }), flaeche({ id: 'f2', uValue: 2.7, area: 5 })] })
    const zweiter = raum({
      id: 'raum-2',
      name: 'Schlafzimmer',
      use: 'schlafen',
      indoorTemp: 17,
      floorArea: 15,
      airChange: 0.5,
      surfaces: [flaeche({ uValue: 2.0, area: 10 })]
    })
    const ergebnis = heatloadResult(entwurf({ rooms: [erster, zweiter] }))
    // Raum 1: 1305 + 251,25 = 1556,25 · Raum 2: 540 + 169,59375 = 709,59375
    expect(ergebnis.rooms[0]?.total).toBeCloseTo(1556.25, 6)
    expect(ergebnis.rooms[1]?.total).toBeCloseTo(709.59375, 6)
    expect(ergebnis.transmission).toBeCloseTo(1845, 6) // 1305 + 540
    expect(ergebnis.ventilation).toBeCloseTo(420.84375, 6) // 251,25 + 169,59375
    expect(ergebnis.total).toBeCloseTo(2265.84375, 6)
  })
})

describe('Heizlast — Außen-Auslegungstemperatur ist Pflicht und nicht vorbelegt', () => {
  it('weist einen Entwurf ohne Außen-Auslegungstemperatur ab', () => {
    expect(heatloadErrorKeys(entwurf({ outdoorTemp: null }))).toContain('tool.heatload.error.outdoorTempMissing')
    expect(planHeatload(entwurf({ outdoorTemp: null })).ok).toBe(false)
    expect(planHeatload(entwurf({ outdoorTemp: null })).result).toBeNull()
  })

  it('rechnet nur mit eingetragener Außen-Auslegungstemperatur', () => {
    expect(planHeatload(entwurf({ outdoorTemp: -10 })).ok).toBe(true)
  })
})

describe('Heizlast — Quellenkennung je Bauteil', () => {
  it('nennt die Quelle des gewählten Vorschlags, sonst den eigenen Wert', () => {
    expect(heatloadSourceOfSurface({ id: 'f1', presetId: 'fenster_einfach_bis1978', area: 4, uValue: 4.7 })).toBe('bbsr')
    // Abweichender Wert trotz Vorschlagskennung → eigener Wert.
    expect(heatloadSourceOfSurface({ id: 'f1', presetId: 'fenster_einfach_bis1978', area: 4, uValue: 3.2 })).toBe('custom')
    expect(heatloadSourceOfSurface({ id: 'f1', presetId: '', area: 4, uValue: 3.2 })).toBe('custom')
  })
})

describe('Heizlast — ganze Prüfung', () => {
  it('nimmt einen vollständigen Entwurf an', () => {
    expect(heatloadErrorKeys(entwurf())).toEqual([])
  })

  it('meldet fehlende Pflichtangaben', () => {
    expect(heatloadErrorKeys(entwurf({ rooms: [] }))).toContain('tool.heatload.error.noRooms')
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ name: '  ' })] }))).toContain('tool.heatload.error.roomNameMissing')
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ surfaces: [] })] }))).toContain('tool.heatload.error.noSurfaces')
  })
})

describe('Heizlast — jede Grenze aus heatloadLimits wird einmal geprüft', () => {
  /** Fälle: eine Grenze je Zeile, jeweils knapp außerhalb. */
  const grenzfaelle: ReadonlyArray<readonly [keyof typeof heatloadLimits, HeatloadInput, string]> = [
    ['outdoorTempMin', entwurf({ outdoorTemp: heatloadLimits.outdoorTempMin - 1 }), 'tool.heatload.error.outdoorTempRange'],
    ['outdoorTempMax', entwurf({ outdoorTemp: heatloadLimits.outdoorTempMax + 1 }), 'tool.heatload.error.outdoorTempRange'],
    [
      'roomsMax',
      entwurf({ rooms: Array.from({ length: heatloadLimits.roomsMax + 1 }, (_, i) => raum({ id: `raum-${i}`, name: `Raum ${i}` })) }),
      'tool.heatload.error.tooManyRooms'
    ],
    ['nameMax', entwurf({ rooms: [raum({ name: 'x'.repeat(heatloadLimits.nameMax + 1) })] }), 'tool.heatload.error.roomNameLong'],
    ['areaMin', entwurf({ rooms: [raum({ floorArea: 0 })] }), 'tool.heatload.error.floorAreaMissing'],
    ['areaMax', entwurf({ rooms: [raum({ floorArea: heatloadLimits.areaMax + 1 })] }), 'tool.heatload.error.floorAreaRange'],
    [
      'surfacesMax',
      entwurf({ rooms: [raum({ surfaces: Array.from({ length: heatloadLimits.surfacesMax + 1 }, (_, i) => flaeche({ id: `f${i}` })) })] }),
      'tool.heatload.error.tooManySurfaces'
    ],
    ['uValueMin', entwurf({ rooms: [raum({ surfaces: [flaeche({ uValue: heatloadLimits.uValueMin - 0.01 })] })] }), 'tool.heatload.error.uValueRange'],
    ['uValueMax', entwurf({ rooms: [raum({ surfaces: [flaeche({ uValue: heatloadLimits.uValueMax + 1 })] })] }), 'tool.heatload.error.uValueRange'],
    ['indoorTempMin', entwurf({ rooms: [raum({ indoorTemp: heatloadLimits.indoorTempMin - 1 })] }), 'tool.heatload.error.indoorTempRange'],
    ['indoorTempMax', entwurf({ rooms: [raum({ indoorTemp: heatloadLimits.indoorTempMax + 1 })] }), 'tool.heatload.error.indoorTempRange'],
    ['airChangeMin', entwurf({ rooms: [raum({ airChange: heatloadLimits.airChangeMin - 0.1 })] }), 'tool.heatload.error.airChangeRange'],
    ['airChangeMax', entwurf({ rooms: [raum({ airChange: heatloadLimits.airChangeMax + 0.1 })] }), 'tool.heatload.error.airChangeRange'],
    ['heightMin', entwurf({ rooms: [raum({ height: heatloadLimits.heightMin - 0.1 })] }), 'tool.heatload.error.heightRange'],
    ['heightMax', entwurf({ rooms: [raum({ height: heatloadLimits.heightMax + 0.1 })] }), 'tool.heatload.error.heightRange']
  ]

  it('deckt jede Grenze ab', () => {
    // Wächter: kommt eine Grenze dazu, ohne Fall, fällt es hier auf.
    const geprueft = new Set(grenzfaelle.map(([name]) => name))
    expect(geprueft).toEqual(new Set(Object.keys(heatloadLimits)))
  })

  for (const [name, eingabe, erwartet] of grenzfaelle) {
    it(`verletzt ${name}`, () => {
      expect(heatloadErrorKeys(eingabe)).toContain(erwartet)
    })
  }

  it('nimmt die Grenzwerte selbst noch an', () => {
    expect(heatloadErrorKeys(entwurf({ outdoorTemp: heatloadLimits.outdoorTempMin }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ outdoorTemp: heatloadLimits.outdoorTempMax }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ floorArea: heatloadLimits.areaMin })] }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ height: heatloadLimits.heightMin })] }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ height: heatloadLimits.heightMax })] }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ airChange: heatloadLimits.airChangeMin })] }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ surfaces: [flaeche({ uValue: heatloadLimits.uValueMin })] })] }))).toEqual([])
    expect(heatloadErrorKeys(entwurf({ rooms: [raum({ surfaces: [flaeche({ uValue: heatloadLimits.uValueMax })] })] }))).toEqual([])
  })
})
