/**
 * Tastenfeld des wissenschaftlichen Rechners: Winkelfunktionen mit `2nd`-Ebene, Logarithmen,
 * Potenzen, Konstanten, Klammern, Prozent — dazu das Blatt `⋯` aus dem gemeinsamen Rahmen.
 *
 * Jede zweite Belegung ist gegen die kuratierten Factories geprüft: `asin acos atan nthRoot cbrt
 * combinations exp log2` gibt es.
 */
import { SYMBOLS, digit, key, type KeyDefinition, type KeypadLayout } from '../keypad'

const SCIENTIFIC: readonly KeyDefinition[] = [
  key({ id: 'sin', label: 'sin', snippet: 'sin(', secondLabel: 'sin⁻¹', secondSnippet: 'asin(', role: 'function' }),
  key({ id: 'cos', label: 'cos', snippet: 'cos(', secondLabel: 'cos⁻¹', secondSnippet: 'acos(', role: 'function' }),
  key({ id: 'tan', label: 'tan', snippet: 'tan(', secondLabel: 'tan⁻¹', secondSnippet: 'atan(', role: 'function' }),
  key({ id: 'power', label: 'xʸ', snippet: '^', secondLabel: 'ⁿ√x', secondSnippet: 'nthRoot(', role: 'function' }),
  key({ id: 'factorial', label: 'n!', snippet: 'factorial(', secondLabel: 'C(n,k)', secondSnippet: 'combinations(', role: 'function' }),
  key({ id: 'sqrt', label: '√', snippet: 'sqrt(', secondLabel: '∛', secondSnippet: 'cbrt(', role: 'function' }),
  key({ id: 'square', label: 'x²', snippet: '^2', secondLabel: 'x³', secondSnippet: '^3', role: 'function' }),
  key({ id: 'tenPow', label: '10ˣ', snippet: '10^', secondLabel: '2ˣ', secondSnippet: '2^', role: 'function' }),
  key({ id: 'ln', label: 'ln', snippet: 'log(', secondLabel: 'eˣ', secondSnippet: 'exp(', role: 'function' }),
  key({ id: 'log', label: 'log', snippet: 'log10(', secondLabel: 'log₂', secondSnippet: 'log2(', role: 'function' })
]

export const SCIENTIFIC_KEYPAD: KeypadLayout = {
  columns: 5,
  rows: [
    [SYMBOLS.second, SYMBOLS.openParen, SYMBOLS.closeParen, SYMBOLS.pi, SYMBOLS.e],
    [SCIENTIFIC[0] ?? null, SCIENTIFIC[1] ?? null, SCIENTIFIC[2] ?? null, SCIENTIFIC[3] ?? null, SCIENTIFIC[4] ?? null],
    [SCIENTIFIC[5] ?? null, SCIENTIFIC[6] ?? null, SCIENTIFIC[7] ?? null, SCIENTIFIC[8] ?? null, SCIENTIFIC[9] ?? null],
    [SYMBOLS.clear, SYMBOLS.backspace, SYMBOLS.more, SYMBOLS.divide, SYMBOLS.multiply],
    [digit('7'), digit('8'), digit('9'), SYMBOLS.minus, key({ ...SYMBOLS.equals, rowSpan: 3 })],
    [digit('4'), digit('5'), digit('6'), SYMBOLS.plus, null],
    [digit('1'), digit('2'), digit('3'), SYMBOLS.percent, null],
    [SYMBOLS.sign, digit('0'), SYMBOLS.decimal, SYMBOLS.ans, null]
  ]
}
