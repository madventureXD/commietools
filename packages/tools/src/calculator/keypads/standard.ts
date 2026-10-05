/**
 * Tastenfeld des Standardrechners: vier Grundrechenarten, Prozent, Vorzeichen, Komma — dazu
 * `(` und `)` und das Blatt `⋯`.
 *
 * **Abweichung vom bisherigen Feld, bewusst und hier festgehalten:** Vorher waren es vier Reihen
 * zu vier Tasten ohne das Blatt. Auf Thomas' Entscheidung (2026-10-04) bekommt der
 * Standardrechner das Blatt `⋯`; damit die sechste Reihe keine Lücke hat, stehen dort die
 * Klammern — der Rechenkern konnte sie immer schon lesen, sie hatten nur keine Taste.
 */
import { SYMBOLS, digit, key, type KeypadLayout } from '../keypad'

export const STANDARD_KEYPAD: KeypadLayout = {
  columns: 4,
  rows: [
    [SYMBOLS.clear, SYMBOLS.backspace, SYMBOLS.percent, SYMBOLS.divide],
    [digit('7'), digit('8'), digit('9'), SYMBOLS.multiply],
    [digit('4'), digit('5'), digit('6'), SYMBOLS.minus],
    [digit('1'), digit('2'), digit('3'), SYMBOLS.plus],
    [SYMBOLS.sign, digit('0'), SYMBOLS.decimal, SYMBOLS.equals],
    [SYMBOLS.openParen, SYMBOLS.closeParen, key({ ...SYMBOLS.more, colSpan: 2 })]
  ]
}
