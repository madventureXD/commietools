/**
 * Tastenfeld des Programmiererrechners: Bitoperationen, vier Basen, Ziffernbuchstaben `A`–`F`
 * (in DEC, OCT und BIN abgeschaltet statt nur blass) und die Darstellungstafel.
 */
import { SYMBOLS, digit, type KeypadLayout } from '../keypad'

export const PROGRAMMER_KEYPAD: KeypadLayout = {
  columns: 6,
  rows: [
    [SYMBOLS.bitAnd, SYMBOLS.bitOr, SYMBOLS.bitXor, SYMBOLS.bitNot, SYMBOLS.leftShift, SYMBOLS.rightShift],
    [SYMBOLS.clear, SYMBOLS.backspace, SYMBOLS.openParen, SYMBOLS.closeParen, SYMBOLS.mod, SYMBOLS.divide],
    [digit('7', 8), digit('8', 10), digit('9', 10), digit('A', 16), digit('B', 16), SYMBOLS.multiply],
    [digit('4', 8), digit('5', 8), digit('6', 8), digit('C', 16), digit('D', 16), SYMBOLS.minus],
    [digit('1'), digit('2', 8), digit('3', 8), digit('E', 16), digit('F', 16), SYMBOLS.plus],
    [digit('0'), digit('00'), SYMBOLS.more, SYMBOLS.representations, SYMBOLS.sign, SYMBOLS.equals]
  ]
}
