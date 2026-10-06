/**
 * Tastenfeld des RPN-Rechners. Hier stehen **Tokens** des RPN-Kerns (`evaluateRpn`) und keine
 * Ausdrucks-Schnipsel: `sqrt(` wäre als Token unlesbar, `sqrt` ist richtig. Klammern und Prozent
 * gibt es in der RPN nicht — sie fehlen deshalb, statt als tote Tasten dazustehen.
 */
import { SYMBOLS, digit, key, type KeyDefinition, type KeypadLayout } from '../keypad'

const RPN: readonly KeyDefinition[] = [
  key({ id: 'rpnNegate', label: '±', snippet: 'neg', role: 'function' }),
  key({ id: 'rpnInverse', label: '1/x', snippet: 'inv', role: 'function' }),
  key({ id: 'rpnSqrt', label: '√', snippet: 'sqrt', role: 'function' }),
  key({ id: 'rpnFactorial', label: 'n!', snippet: 'fact', role: 'function' }),
  // Eigene Potenztaste ohne zweite Belegung: `nthRoot(` ist ein Ausdruck, kein RPN-Token.
  key({ id: 'rpnPower', label: 'xʸ', snippet: '^', role: 'operator' })
]

/**
 * Stapelgriffe. Sie tragen keinen Schnipsel, sondern arbeiten auf dem RPN-Eingabezustand
 * (`rpnInput`, Aktionen `swap` und `drop`). `SWAP` und `DROP` sind die eingeführten Abkürzungen der
 * Stapelrechner — genormte Kürzel werden nicht übersetzt.
 */
const RPN_EDIT: readonly KeyDefinition[] = [
  key({ id: 'rpnSwap', label: 'SWAP', snippet: '', role: 'action', ariaKey: 'tool.rpnCalculator.key.swap' }),
  key({ id: 'rpnDrop', label: 'DROP', snippet: '', role: 'action', ariaKey: 'tool.rpnCalculator.key.drop' })
]

export const RPN_KEYPAD: KeypadLayout = {
  columns: 5,
  rows: [
    [SYMBOLS.backspace, SYMBOLS.clear, RPN[1] ?? null, RPN[2] ?? null, SYMBOLS.divide],
    [RPN[0] ?? null, RPN[3] ?? null, RPN[4] ?? null, SYMBOLS.mod, SYMBOLS.multiply],
    [digit('7'), digit('8'), digit('9'), SYMBOLS.minus, key({ ...SYMBOLS.equals, rowSpan: 3 })],
    [digit('4'), digit('5'), digit('6'), SYMBOLS.plus],
    [digit('1'), digit('2'), digit('3'), SYMBOLS.decimal],
    // Die Null ist drei Zellen breit: so ist die Reihe voll und die beiden Stapelgriffe stehen
    // in der letzten Reihe nebeneinander, statt einzeln zu verrutschen.
    [key({ ...digit('0'), colSpan: 3 }), SYMBOLS.pi, SYMBOLS.e],
    [RPN_EDIT[0] ?? null, RPN_EDIT[1] ?? null]
  ]
}
