import { describe, expect, it } from 'vitest'
import {
  parseRpnInput,
  rpnActionForSnippet,
  rpnInputReducer,
  rpnInputText,
  type RpnInputAction,
  type RpnInputState
} from '@commietools/tools/calculator/rpnInput'

const leer: RpnInputState = { tokens: [], draft: '' }
const leere = (tokens: string[], draft = ''): RpnInputState => ({ tokens, draft })
const schritt = (state: RpnInputState, action: RpnInputAction) => rpnInputReducer(state, action)
const text = (state: RpnInputState) => rpnInputText(state)

describe('RPN-Eingabereducer (M6-002)', () => {
  it('erweitert einen begonnenen Zahlentoken statt ihn zu ersetzen', () => {
    expect(text(schritt(leere([], '1'), { type: 'digit', value: '2' }))).toBe('12')
    expect(text(schritt(leere([], '12'), { type: 'digit', value: '3' }))).toBe('123')
    // Nach dem Abschluss beginnt wieder ein neuer Entwurf — die Trennung ist der Kern der Karte.
    const abgeschlossen = schritt(schritt(leere([], '1'), { type: 'commit' }), { type: 'digit', value: '2' })
    expect(abgeschlossen).toEqual({ tokens: ['1'], draft: '2' })
    expect(text(abgeschlossen)).toBe('1 2')
  })

  it('nimmt nur ein Dezimalzeichen an und beginnt mit einer Null', () => {
    expect(text(schritt(leer, { type: 'decimal' }))).toBe('0.')
    expect(text(schritt(leere([], '1'), { type: 'decimal' }))).toBe('1.')
    expect(text(schritt(leere([], '1.'), { type: 'decimal' }))).toBe('1.')
    // Das deutsche Komma ist das Trennzeichen des Tastenfelds — ein zweites wird nicht angenommen.
    expect(text(schritt(leere([], '1,5'), { type: 'decimal', separator: ',' }))).toBe('1,5')
  })

  it('kehrt das Vorzeichen des Entwurfs um, sonst negiert es den Stapelwert', () => {
    expect(text(schritt(leere([], '5'), { type: 'sign' }))).toBe('-5')
    expect(text(schritt(leere([], '-5'), { type: 'sign' }))).toBe('5')
    // Ohne Entwurf bleibt der ±-Griff die unäre Operation auf dem obersten Wert.
    expect(schritt({ tokens: ['3'], draft: '' }, { type: 'sign' })).toEqual({ tokens: ['3', 'neg'], draft: '' })
  })

  it('lässt einen leeren Enter nichts tun', () => {
    expect(schritt(leer, { type: 'commit' })).toEqual(leer)
    expect(schritt({ tokens: ['3', '4'], draft: '' }, { type: 'commit' })).toEqual({ tokens: ['3', '4'], draft: '' })
    expect(schritt(leere([], '12'), { type: 'commit' })).toEqual({ tokens: ['12'], draft: '' })
  })

  it('schließt vor einer Operator- oder Werttaste einen gültigen Entwurf ab', () => {
    expect(schritt({ tokens: ['3'], draft: '4' }, { type: 'operator', value: '+' })).toEqual({ tokens: ['3', '4', '+'], draft: '' })
    expect(schritt(leere([], '2'), { type: 'operator', value: 'pi' })).toEqual({ tokens: ['2', 'pi'], draft: '' })
  })

  it('löscht im Entwurf ein Zeichen, sonst den letzten Token', () => {
    expect(text(schritt(leere([], '12'), { type: 'backspace' }))).toBe('1')
    expect(schritt({ tokens: ['3', '4'], draft: '' }, { type: 'backspace' })).toEqual({ tokens: ['3'], draft: '' })
  })

  it('verwirft und tauscht den letzten Wert — den Entwurf mitgezählt', () => {
    expect(schritt(leere([], '5'), { type: 'drop' })).toEqual(leer)
    expect(schritt({ tokens: ['3', '4'], draft: '' }, { type: 'drop' })).toEqual({ tokens: ['3'], draft: '' })
    expect(schritt(leere(['3'], '4'), { type: 'swap' })).toEqual({ tokens: ['4', '3'], draft: '' })
    expect(schritt({ tokens: ['3'], draft: '' }, { type: 'swap' })).toEqual({ tokens: ['3'], draft: '' })
    expect(schritt(leer, { type: 'clear' })).toEqual(leer)
  })

  it('liest den Text neu ein und schreibt ihn unverändert zurück', () => {
    for (const eingabe of ['3 4 +', '3 4', '1,5 2 *', '12 3 +', 'pi', '']) {
      expect(rpnInputText(parseRpnInput(eingabe))).toBe(eingabe)
    }
    // Der letzte Token ist der Entwurf, wenn er eine Zahl ist — ein Operator ist keiner.
    expect(parseRpnInput('3 4')).toEqual({ tokens: ['3'], draft: '4' })
    expect(parseRpnInput('3 4 +')).toEqual({ tokens: ['3', '4', '+'], draft: '' })
  })

  it('übersetzt die Schnipsel des Tastenfelds', () => {
    expect(rpnActionForSnippet('7')).toEqual({ type: 'digit', value: '7' })
    expect(rpnActionForSnippet('.')).toEqual({ type: 'decimal' })
    expect(rpnActionForSnippet(',')).toEqual({ type: 'decimal', separator: ',' })
    expect(rpnActionForSnippet('neg')).toEqual({ type: 'sign' })
    expect(rpnActionForSnippet('sqrt')).toEqual({ type: 'operator', value: 'sqrt' })
    expect(rpnActionForSnippet('pi')).toEqual({ type: 'operator', value: 'pi' })
    // Unbekanntes (etwa ein eingesetztes Ergebnis) entscheidet der Aufrufer.
    expect(rpnActionForSnippet('15')).toBe(null)
  })
})
