import { describe, expect, it } from 'vitest'
import * as cable from '@commietools/tools/craft/cable'
import {
  cableErrorKeys,
  cableLimits,
  currentFromPower,
  kappaAssumptionFor,
  normaliseCrossSection,
  planCable,
  standardCrossSections,
  voltageDropLimitFor,
  voltageDropPercent,
  voltageDropVolts,
  type CableInput
} from '@commietools/tools/craft/cable'

/**
 * Erwartungswerte sind mit `node -e` nachgerechnet, nicht im Kopf — die
 * Rechnung steht jeweils daneben.
 */

const gueltig = (patch: Partial<CableInput> = {}): CableInput => ({
  phaseMode: 'single',
  voltage: 230,
  current: 16,
  lengthMeters: 30,
  kappa: 56,
  usage: 'lighting',
  ampacity: 18.5,
  ...patch
})

describe('Spannungsfall — Rechnung', () => {
  it('rechnet einphasig ΔU = 2·L·I/(κ·A)', () => {
    // 2 · 30 · 16 / (56 · 2,5) = 6,857142857…
    const dU = voltageDropVolts({ phaseMode: 'single', lengthMeters: 30, current: 16, kappa: 56, crossSection: 2.5 })
    expect(dU).toBeCloseTo(6.857142857142857, 9)
    // 6,857142857 / 230 · 100 = 2,981366459627329
    expect(voltageDropPercent(dU, 230)).toBeCloseTo(2.981366459627329, 9)
  })

  it('rechnet dreiphasig ΔU = √3·L·I/(κ·A)', () => {
    // √3 · 120 · 63 / (56 · 16) = 14,614178688…
    const dU = voltageDropVolts({ phaseMode: 'three', lengthMeters: 120, current: 63, kappa: 56, crossSection: 16 })
    expect(dU).toBeCloseTo(14.6141786888624, 8)
    // 14,614178688 / 400 · 100 = 3,6535446722156
    expect(voltageDropPercent(dU, 400)).toBeCloseTo(3.6535446722156, 8)
  })
})

describe('Umkehrung nach dem Querschnitt', () => {
  it('rechnet den benötigten Querschnitt einphasig', () => {
    const check = planCable(gueltig())
    expect(check.ok).toBe(true)
    if (!check.ok) return
    // 2 · 30 · 16 / (56 · 6,9) = 2,484472…  mit ΔU_zul = 3 % von 230 V = 6,9 V
    expect(check.result.requiredCrossSection).toBeCloseTo(2.484472049689441, 9)
    expect(check.result.chosenCrossSection).toBe(2.5)
  })

  it('rechnet den benötigten Querschnitt dreiphasig', () => {
    const check = planCable(gueltig({ phaseMode: 'three', voltage: 400, current: 63, lengthMeters: 120, usage: 'other', ampacity: 80 }))
    expect(check.ok).toBe(true)
    if (!check.ok) return
    // √3 · 120 · 63 / (56 · 20) = 11,6913429…  mit ΔU_zul = 5 % von 400 V = 20 V
    expect(check.result.requiredCrossSection).toBeCloseTo(11.691342951089922, 8)
    expect(check.result.chosenCrossSection).toBe(16)
    // Spannungsfall beim Vorschlag 16 mm²: √3 · 120 · 63 / (56 · 16) = 14,6141786…
    expect(check.result.dropCrossSection).toBe(16)
    expect(check.result.dropVolts).toBeCloseTo(14.6141786888624, 8)
  })

  it('normalisiert auf die übliche Querschnittsreihe', () => {
    expect(normaliseCrossSection(2.484472)).toBe(2.5)
    expect(normaliseCrossSection(2.5)).toBe(2.5)
    expect(normaliseCrossSection(4.01)).toBe(6)
    expect(normaliseCrossSection(240)).toBe(240)
    // Über die Reihe hinaus wird nichts erfunden.
    expect(normaliseCrossSection(240.1)).toBeNull()
    expect(normaliseCrossSection(0)).toBeNull()
    expect(normaliseCrossSection(Number.NaN)).toBeNull()
  })

  it('meldet, wenn der Vorschlag über die Reihe hinausgeht', () => {
    const check = planCable(gueltig({ voltage: 230, current: 100, lengthMeters: 3000, ampacity: 120 }))
    expect(check.ok).toBe(true)
    if (!check.ok) return
    expect(check.result.chosenCrossSection).toBeNull()
    expect(check.result.beyondSeries).toBe(true)
    expect(check.result.dropCrossSection).toBeCloseTo(check.result.requiredCrossSection, 9)
  })
})

describe('Spannungsfallgrenze je Verwendung', () => {
  it('wählt 3 % für Beleuchtung und 5 % für andere Verbrauchsmittel', () => {
    expect(voltageDropLimitFor('lighting').percent).toBe(3)
    expect(voltageDropLimitFor('other').percent).toBe(5)
  })

  it('setzt die gewählte Grenze im Ergebnis durch', () => {
    const alsAndere = planCable(gueltig({ usage: 'other' }))
    expect(alsAndere.ok).toBe(true)
    if (!alsAndere.ok) return
    expect(alsAndere.result.limitPercent).toBe(5)
    expect(alsAndere.result.maxDropVolts).toBeCloseTo(11.5, 9) // 5 % von 230 V
  })
})

describe('Prüfung gegen die eingegebene Strombelastbarkeit', () => {
  it('meldet Auslastung und Einhaltung unterhalb der Belastbarkeit', () => {
    const check = planCable(gueltig({ current: 16, ampacity: 18.5 }))
    expect(check.ok).toBe(true)
    if (!check.ok) return
    // 16 / 18,5 · 100 = 86,48648648…
    expect(check.result.utilisationPercent).toBeCloseTo(86.48648648648648, 9)
    expect(check.result.ampacityWithin).toBe(true)
  })

  it('meldet die Überschreitung oberhalb der Belastbarkeit', () => {
    const check = planCable(gueltig({ current: 16, ampacity: 13.5 }))
    expect(check.ok).toBe(true)
    if (!check.ok) return
    // 16 / 13,5 · 100 = 118,5185185…
    expect(check.result.utilisationPercent).toBeCloseTo(118.5185185185185, 9)
    expect(check.result.ampacityWithin).toBe(false)
  })

  it('rechnet die Leistung in Strom um', () => {
    const einphasig = currentFromPower(3680, 230, 'single')
    expect(einphasig.ok).toBe(true)
    if (einphasig.ok) expect(einphasig.current).toBeCloseTo(16, 12)
    const dreiphasig = currentFromPower(22080, 400, 'three')
    expect(dreiphasig.ok).toBe(true)
    if (dreiphasig.ok) expect(dreiphasig.current).toBeCloseTo(31.869734859267343, 9)
  })
})

describe('Grenzen — je Feld eine, jede abgefragt', () => {
  it('weist die Spannung außerhalb der Grenze ab', () => {
    expect(cableErrorKeys(gueltig({ voltage: 0 }))).toContain('tool.cable.error.voltage')
    expect(cableErrorKeys(gueltig({ voltage: cableLimits.voltage.max + 1 }))).toContain('tool.cable.error.voltage')
  })

  it('weist den Strom außerhalb der Grenze ab', () => {
    expect(cableErrorKeys(gueltig({ current: 0 }))).toContain('tool.cable.error.current')
    expect(cableErrorKeys(gueltig({ current: cableLimits.current.max + 1 }))).toContain('tool.cable.error.current')
  })

  it('weist die Leistung außerhalb der Grenze ab', () => {
    expect(currentFromPower(0, 230, 'single')).toEqual({ ok: false, errorKey: 'tool.cable.error.power' })
    expect(currentFromPower(cableLimits.power.max + 1, 230, 'single')).toEqual({ ok: false, errorKey: 'tool.cable.error.power' })
  })

  it('weist die Leitungslänge außerhalb der Grenze ab', () => {
    expect(cableErrorKeys(gueltig({ lengthMeters: 0 }))).toContain('tool.cable.error.length')
    expect(cableErrorKeys(gueltig({ lengthMeters: cableLimits.length.max + 1 }))).toContain('tool.cable.error.length')
  })

  it('weist die Leitfähigkeit κ außerhalb der Grenze ab', () => {
    expect(cableErrorKeys(gueltig({ kappa: 0.5 }))).toContain('tool.cable.error.kappa')
    expect(cableErrorKeys(gueltig({ kappa: cableLimits.kappa.max + 1 }))).toContain('tool.cable.error.kappa')
  })

  it('weist die Strombelastbarkeit außerhalb der Grenze ab', () => {
    expect(cableErrorKeys(gueltig({ ampacity: 0 }))).toContain('tool.cable.error.ampacity')
    expect(cableErrorKeys(gueltig({ ampacity: cableLimits.ampacity.max + 1 }))).toContain('tool.cable.error.ampacity')
  })
})

describe('Ungültige Eingabe wird abgewiesen', () => {
  it('meldet fehlende Werte als empty', () => {
    expect(planCable(gueltig({ voltage: Number.NaN }))).toEqual({ ok: false, errorKey: 'tool.cable.error.empty' })
    expect(planCable(gueltig({ lengthMeters: Number.NaN }))).toEqual({ ok: false, errorKey: 'tool.cable.error.empty' })
  })

  it('gibt bei einem Fehler kein Ergebnis zurück', () => {
    const check = planCable(gueltig({ current: 3000 }))
    expect(check.ok).toBe(false)
    if (!check.ok) expect(check.errorKey).toBe('tool.cable.error.current')
  })

  it('verlangt einen positiven Leistungsfaktor', () => {
    expect(currentFromPower(1000, 230, 'single', 0)).toEqual({ ok: false, errorKey: 'tool.cable.error.phase' })
  })
})

describe('Leitfähigkeit κ als Annahme', () => {
  it('nennt Kupfer 56 und Aluminium 35 als Vorgabe', () => {
    expect(kappaAssumptionFor('copper').kappa).toBe(56)
    expect(kappaAssumptionFor('aluminium').kappa).toBe(35)
  })

  it('liefert zu jedem Werkstoff eine Quellenangabe', () => {
    expect(kappaAssumptionFor('copper').sourceKey).toBe('tool.cable.kappaSourceCopper')
    expect(kappaAssumptionFor('aluminium').sourceKey).toBe('tool.cable.kappaSourceAluminium')
  })
})

/**
 * Diese Prüfung hält die Auflage des Auftraggebers fest: **keine**
 * Strombelastbarkeitstabelle im Modul. Die Werte der DIN VDE 0298-4 / der
 * Herstellerauszüge dürfen nicht übernommen werden.
 */
describe('Keine Strombelastbarkeitstabelle im Modul', () => {
  /** Sammelt jedes exportierte Zahlenfeld (eine Amperetabelle wäre genau das). */
  function sammleZahlenfelder(wert: unknown, pfad: string, treffer: Array<{ pfad: string; werte: number[] }>): void {
    if (Array.isArray(wert)) {
      if (wert.every((eintrag) => typeof eintrag === 'number')) {
        treffer.push({ pfad, werte: wert })
        return
      }
      wert.forEach((eintrag, index) => sammleZahlenfelder(eintrag, `${pfad}[${index}]`, treffer))
      return
    }
    if (wert && typeof wert === 'object') {
      for (const [schluessel, inhalt] of Object.entries(wert as Record<string, unknown>)) {
        sammleZahlenfelder(inhalt, `${pfad}.${schluessel}`, treffer)
      }
    }
  }

  /** Sammelt Eigenschaftsnamen, die auf eine Belastbarkeitstabelle hindeuten. */
  function sammleVerdaechtigeSchluessel(wert: unknown, pfad: string, treffer: string[]): void {
    if (Array.isArray(wert)) {
      wert.forEach((eintrag, index) => sammleVerdaechtigeSchluessel(eintrag, `${pfad}[${index}]`, treffer))
      return
    }
    if (wert && typeof wert === 'object') {
      for (const [schluessel, inhalt] of Object.entries(wert as Record<string, unknown>)) {
        // Eine Tabelle wäre eine **Reihung** (Ampere je Querschnitt). Ein
        // einfacher Grenzwert wie { min, max } ist keine Tabelle und zählt nicht.
        if (/(ampacity|ampere|strombelastbar|belastbar)/iu.test(schluessel) && enthaeltReihung(inhalt)) {
          treffer.push(`${pfad}.${schluessel}`)
        }
        sammleVerdaechtigeSchluessel(inhalt, `${pfad}.${schluessel}`, treffer)
      }
    }
  }

  function enthaeltReihung(wert: unknown): boolean {
    if (Array.isArray(wert)) return true
    if (wert && typeof wert === 'object') return Object.values(wert as Record<string, unknown>).some(enthaeltReihung)
    return false
  }

  it('enthält als einziges Zahlenfeld die Querschnittsreihe', () => {
    const felder: Array<{ pfad: string; werte: number[] }> = []
    sammleZahlenfelder(cable, 'cable', felder)
    expect(felder).toHaveLength(1)
    expect(felder[0]?.pfad).toBe('cable.standardCrossSections')
    expect(felder[0]?.werte).toEqual([...standardCrossSections])
  })

  it('trägt kein Datenfeld mit Ampere-Werten je Querschnitt', () => {
    const verdaechtig: string[] = []
    sammleVerdaechtigeSchluessel(cable, 'cable', verdaechtig)
    expect(verdaechtig).toEqual([])
  })

  it('enthält keinen der bekannten Belastbarkeitswerte (Nachweis über die Reihe)', () => {
    // Die 1,5-mm²-Werte der drei VDE-Auszüge (13,5 A1 / 15,5 B1 / 18,5 E) dürfen
    // an keiner Stelle des Moduls auftauchen — in der Querschnittsreihe nicht und
    // in keinem anderen exportierten Zahlenfeld.
    const alleZahlen: number[] = []
    const durchgehen = (wert: unknown): void => {
      if (Array.isArray(wert)) { wert.forEach(durchgehen); return }
      if (wert && typeof wert === 'object') { Object.values(wert as Record<string, unknown>).forEach(durchgehen); return }
      if (typeof wert === 'number') alleZahlen.push(wert)
    }
    durchgehen(cable)
    for (const verdaechtig of [13.5, 15.5, 18.5]) expect(alleZahlen).not.toContain(verdaechtig)
  })
})
