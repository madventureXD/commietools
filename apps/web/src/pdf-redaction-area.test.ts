import { describe, expect, it } from 'vitest'
import { normaliseRedactionArea, nudgeRedactionArea } from '@commietools/tools/pdf/m9'

/**
 * Das Redaktionsrechteck-Modell der Karte M7-003: eine Prüfstelle für Zeigerweg und
 * Tastaturformular. Die Erwartungen sind hier von Hand gerechnet und im Kommentar belegt.
 */
const A4 = { width: 595, height: 842 }

describe('Redaktionsbereich prüfen', () => {
  it('nimmt einen Bereich innerhalb der Seite an', () => {
    const check = normaliseRedactionArea({ pageIndex: 0, x: 100, y: 200, width: 150.5, height: 60.25 }, A4)
    expect(check.ok).toBe(true)
    if (check.ok) expect(check.area).toEqual({ pageIndex: 0, x: 100, y: 200, width: 150.5, height: 60.25 })
  })

  it('weist nicht-numerische Werte ab', () => {
    const check = normaliseRedactionArea({ pageIndex: 0, x: Number.NaN, y: 0, width: 10, height: 10 }, A4)
    expect(check.ok).toBe(false)
    if (!check.ok) expect(check.reason).toBe('number')
  })

  it('weist Breite oder Höhe null ab', () => {
    const check = normaliseRedactionArea({ pageIndex: 0, x: 10, y: 10, width: 0, height: 25 }, A4)
    expect(check.ok).toBe(false)
    if (!check.ok) expect(check.reason).toBe('size')
  })

  it('weist einen Bereich außerhalb der Seite ab', () => {
    // x + Breite = 600 liegt über der Seitenbreite 595.
    const check = normaliseRedactionArea({ pageIndex: 0, x: 500, y: 10, width: 100, height: 25 }, A4)
    expect(check.ok).toBe(false)
    if (!check.ok) expect(check.reason).toBe('bounds')
  })

  it('lässt einen Bereich genau am Seitenrand zu (Rundungstoleranz 0,01 Punkt)', () => {
    const check = normaliseRedactionArea({ pageIndex: 0, x: 495, y: 792, width: 100, height: 50 }, A4)
    expect(check.ok).toBe(true)
  })
})

describe('Redaktionsbereich mit den Pfeiltasten verschieben', () => {
  it('verschiebt innerhalb der Seite unverändert', () => {
    const moved = nudgeRedactionArea({ pageIndex: 0, x: 100, y: 200, width: 50, height: 40 }, A4, 1, -1)
    expect(moved).toEqual({ pageIndex: 0, x: 101, y: 199, width: 50, height: 40 })
  })

  it('klemmt an der linken und oberen Kante bei 0', () => {
    const moved = nudgeRedactionArea({ pageIndex: 0, x: 2, y: 3, width: 50, height: 40 }, A4, -10, -10)
    expect(moved.x).toBe(0)
    expect(moved.y).toBe(0)
  })

  it('klemmt an der rechten und unteren Kante an der Seitenbox', () => {
    // Rechte Kante 595 - 50 = 545, untere Kante 842 - 40 = 802.
    const moved = nudgeRedactionArea({ pageIndex: 0, x: 540, y: 800, width: 50, height: 40 }, A4, 10, 10)
    expect(moved.x).toBe(545)
    expect(moved.y).toBe(802)
  })
})
