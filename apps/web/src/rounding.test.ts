import { describe, expect, it } from 'vitest'
import { divRound } from '@commietools/tools/calculator/rounding'

/**
 * Prüfung der **gemeinsamen** Rundung (QM-Karte M4-009, Stufe R9).
 *
 * Angelegt, weil die Mutationsgegenprobe eine Lücke aufgedeckt hat: `divRound` stand in zwei
 * Werkzeugen und wurde von **keiner** Prüfung direkt gefasst — das Abrunden eines halben Rests
 * blieb damit unsichtbar, obwohl es ein anderes Ergebnis liefert. Der Gegenstand der Karte ist
 * „gleiche Verträge bündeln"; hier steht der Vertrag selbst.
 */
describe('divRound — kaufmännische Rundung, halbe auf', () => {
  it('rundet einen halben Rest auf (nicht ab)', () => {
    expect(divRound(1n, 2n)).toBe(1n)
    expect(divRound(3n, 2n)).toBe(2n)
    expect(divRound(5n, 2n)).toBe(3n)
  })

  it('rundet unterhalb der Hälfte ab', () => {
    expect(divRound(1n, 3n)).toBe(0n)
    expect(divRound(2n, 3n)).toBe(1n)
  })

  it('ist vorzeichenunabhängig', () => {
    expect(divRound(-1n, 2n)).toBe(-1n)
    expect(divRound(1n, -2n)).toBe(-1n)
    expect(divRound(-1n, -2n)).toBe(1n)
  })

  it('weist einen Nenner von 0 ab', () => {
    expect(() => divRound(1n, 0n)).toThrow('zeroDivisor')
  })
})
