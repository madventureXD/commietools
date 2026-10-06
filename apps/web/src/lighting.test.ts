import { describe, expect, it } from 'vitest'
import {
  lightingErrorKeys,
  lightingLimits,
  lightingMaintenanceFactor,
  lightingResult,
  lightingRoomTypes,
  maintenanceFactorSpan,
  plannedFlux,
  roomTypeById,
  roomTypeSpan,
  type LightingInput
} from '@commietools/tools/craft/lighting'

/** Gültige Grundeingabe; einzelne Felder werden je Test überschrieben. */
const gueltig = (patch: Partial<LightingInput> = {}): LightingInput => ({
  roomTypeId: 'office',
  area: 20,
  lux: 500,
  maintenanceFactor: 0.8,
  lumensPerLuminaire: 2500,
  uniformity: 0.6,
  ...patch
})

describe('Beleuchtung — Rechnung', () => {
  it('rechnet Lichtstrom = Fläche × Lux ÷ Wartungsfaktor (von Hand nachgerechnet)', () => {
    // 20 m² · 500 lx ÷ 0,8 = 12 500 lm
    expect(plannedFlux({ area: 20, lux: 500, maintenanceFactor: 0.8 })).toBe(12500)
    expect(lightingResult(gueltig())).toEqual({ luminousFlux: 12500, luminaires: 5 })
    // 12 m² · 300 lx ÷ 0,75 = 4 800 lm; 4 800 ÷ 1 600 = 3 Leuchten
    expect(lightingResult(gueltig({ area: 12, lux: 300, maintenanceFactor: 0.75, lumensPerLuminaire: 1600 })))
      .toEqual({ luminousFlux: 4800, luminaires: 3 })
  })

  it('rundet die Leuchtenzahl immer auf (halbe Leuchten gibt es nicht)', () => {
    // 15 m² · 200 lx ÷ 0,8 = 3 750 lm; 3 750 ÷ 2 000 = 1,875 → 2 Leuchten
    expect(lightingResult(gueltig({ area: 15, lux: 200, lumensPerLuminaire: 2000 })))
      .toEqual({ luminousFlux: 3750, luminaires: 2 })
  })

  it('rundet den Anzeigelichtstrom, rechnet die Leuchtenzahl aber aus dem ungerundeten Wert', () => {
    // 12 m² · 300 lx ÷ 0,67 = 5 373,13… lm → Anzeige 5 373; 5 373,13… ÷ 1 200 = 4,477 → 5 Leuchten
    expect(lightingResult(gueltig({ area: 12, lux: 300, maintenanceFactor: 0.67, lumensPerLuminaire: 1200 })))
      .toEqual({ luminousFlux: 5373, luminaires: 5 })
  })

  it('lässt einen kleineren Wartungsfaktor das Ergebnis in die richtige Richtung ändern', () => {
    // Der Faktor teilt: schmutziger (kleinerer Faktor) verlangt MEHR Lichtstrom, nicht weniger.
    const sauber = lightingResult(gueltig({ area: 10, lux: 400, maintenanceFactor: 0.8, lumensPerLuminaire: 1000 }))!
    const schmutzig = lightingResult(gueltig({ area: 10, lux: 400, maintenanceFactor: 0.5, lumensPerLuminaire: 1000 }))!
    expect(sauber.luminousFlux).toBe(5000)
    expect(schmutzig.luminousFlux).toBe(8000)
    expect(schmutzig.luminousFlux).toBeGreaterThan(sauber.luminousFlux)
    expect(schmutzig.luminaires).toBe(8)
    expect(schmutzig.luminaires).toBeGreaterThan(sauber.luminaires)
  })
})

describe('Beleuchtung — Grenzen', () => {
  // Feldname in `lightingLimits` → Fehlerschlüssel. Jede Grenze wird genau einmal geprüft.
  const feldFehler: Readonly<Record<string, string>> = {
    area: 'tool.lighting.error.area',
    lux: 'tool.lighting.error.lux',
    maintenanceFactor: 'tool.lighting.error.maintenance',
    lumensPerLuminaire: 'tool.lighting.error.lumens',
    uniformity: 'tool.lighting.error.uniformity'
  }

  it('erklärt für jedes Feld eine Grenze mit zugehörigem Fehlerschlüssel', () => {
    for (const feld of Object.keys(lightingLimits)) {
      expect(feldFehler[feld], `kein Fehlerschlüssel für ${feld}`).toBeDefined()
    }
  })

  it('fragt jede einzelne Grenze aus lightingLimits wirklich ab', () => {
    for (const [feld, grenze] of Object.entries(lightingLimits)) {
      const key = feldFehler[feld]!
      // unterhalb der unteren Grenze
      expect(lightingErrorKeys(gueltig({ [feld]: grenze.min - 1 } )), `${feld} = unter min`).toContain(key)
      // oberhalb der oberen Grenze
      expect(lightingErrorKeys(gueltig({ [feld]: grenze.max + 1 } )), `${feld} = über max`).toContain(key)
      // genau auf den Grenzen ist zulässig
      expect(lightingErrorKeys(gueltig({ [feld]: grenze.min } )), `${feld} = min`).not.toContain(key)
      expect(lightingErrorKeys(gueltig({ [feld]: grenze.max } )), `${feld} = max`).not.toContain(key)
    }
  })

  it('meldet einen unbekannten Raumtyp', () => {
    expect(lightingErrorKeys(gueltig({ roomTypeId: 'gibtsnicht' }))).toContain('tool.lighting.error.roomType')
  })

  it('weist ungültige Eingaben ab, statt still eine Zahl zu liefern', () => {
    expect(lightingResult(gueltig({ area: 0 }))).toBeNull()
    expect(lightingResult(gueltig({ lux: Number.NaN }))).toBeNull()
    expect(lightingResult(gueltig({ maintenanceFactor: 2 }))).toBeNull()
    expect(lightingResult(gueltig({ lumensPerLuminaire: Number.NaN }))).toBeNull()
    expect(lightingResult(gueltig())).not.toBeNull()
  })
})

describe('Beleuchtung — streitige Raumtypen liefern eine Spanne', () => {
  it('führt jeden streitigen Raumtyp mit mindestens zwei verschiedenen Werten', () => {
    const streitig = lightingRoomTypes.filter((raum) => raum.conflict)
    expect(streitig.length).toBeGreaterThan(0)
    for (const raum of streitig) {
      const spanne = roomTypeSpan(raum)
      expect(spanne.min, `${raum.id} hat keine Spanne`).toBeLessThan(spanne.max)
    }
  })

  it('trifft die belegten Spannen (kleinster bis größter Wert)', () => {
    expect(roomTypeSpan(roomTypeById('sanitary')!)).toEqual({ min: 100, max: 200 })
    expect(roomTypeSpan(roomTypeById('corridor')!)).toEqual({ min: 50, max: 150 })
    expect(roomTypeSpan(roomTypeById('storage')!)).toEqual({ min: 50, max: 150 })
    expect(roomTypeSpan(roomTypeById('workshop')!)).toEqual({ min: 200, max: 500 })
    expect(roomTypeSpan(roomTypeById('classroom')!)).toEqual({ min: 300, max: 500 })
    expect(roomTypeSpan(roomTypeById('retail')!)).toEqual({ min: 300, max: 750 })
  })

  it('glättet unstreitige Raumtypen nicht zu einer Schein-Spanne', () => {
    expect(roomTypeSpan(roomTypeById('office')!)).toEqual({ min: 500, max: 500 })
    expect(roomTypeById('office')!.conflict).toBe(false)
    expect(roomTypeSpan(roomTypeById('kitchen')!)).toEqual({ min: 500, max: 500 })
  })

  it('kennt für den Wartungsfaktor ebenfalls eine belegte Bandbreite (0,5 bis 0,8)', () => {
    expect(maintenanceFactorSpan()).toEqual({ min: 0.5, max: 0.8 })
    expect(lightingMaintenanceFactor).toHaveLength(3)
  })
})

describe('Beleuchtung — Wertetafel', () => {
  it('hält jeden belegten Wert innerhalb der zulässigen Lux-Grenzen', () => {
    for (const raum of lightingRoomTypes) {
      expect(raum.rows.length).toBeGreaterThan(0)
      for (const zeile of raum.rows) {
        expect(zeile.lux).toBeGreaterThanOrEqual(lightingLimits.lux.min)
        expect(zeile.lux).toBeLessThanOrEqual(lightingLimits.lux.max)
        expect(zeile.citationKey.startsWith('tool.lighting.')).toBe(true)
        expect(zeile.sourceId).not.toBe('')
      }
    }
  })

  it('setzt den Vorschlag je Raumtyp auf einen der belegten Werte', () => {
    for (const raum of lightingRoomTypes) {
      expect(raum.rows.map((zeile) => zeile.lux)).toContain(raum.defaultLux)
    }
  })
})
