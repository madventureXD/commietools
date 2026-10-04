/**
 * Tastenfeld des Rechners — **reine Daten**, keine Oberfläche und keine Anzeigetexte.
 *
 * Drei Regeln, die hier festgehalten sind (Konzept `2026-10-04-rechner-oberflaeche.md`):
 *
 * 1. **Das Zeichen auf der Taste ist nicht das Zeichen im Ausdruck.** Die Taste zeigt `×`, der
 *    Ausdruck bekommt `*`. mathjs kennt `×`, `÷` und U+2212 nicht (gemessen 2026-10-04), und was
 *    kopiert wird, muss wieder einlesbar sein. `label` ist die Anzeige, `snippet` die Ablage.
 * 2. **Nur Tasten ohne selbsterklärendes Zeichen bekommen einen Sprachschlüssel** (`ariaKey`).
 *    `+`, `π` oder `sin` liest jeder Screenreader in jeder Sprache gleich vor.
 * 3. **Eine fehlende Factory bricht erst zur Laufzeit** (ADR 0005) — deshalb prüft der Test, dass
 *    jede hier angebotene Funktion in `calculatorFunctions` steht.
 */

/** Rechenarten der Oberfläche. Der Rechenkern kennt diese Einteilung nicht — sie ist Bedienung. */
export type KeypadMode = 'standard' | 'scientific' | 'programmer' | 'rpn'

/** Zahlensysteme des Programmierer-Modus, wie im Kern. */
export type KeypadBase = 2 | 8 | 10 | 16

export type KeyRole = 'digit' | 'operator' | 'function' | 'action' | 'equals' | 'constant'

export interface KeyDefinition {
  /** Stabiler Bezeichner — auch der Name des Sprachschlüssels, wo einer nötig ist. */
  readonly id: string
  /** Was auf der Taste steht: ein Zeichen oder eine genormte Abkürzung. */
  readonly label: string
  /** Was in den Ausdruck kommt. */
  readonly snippet: string
  readonly role: KeyRole
  /** Zweite Belegung, aktiv solange `2nd` gedrückt ist. */
  readonly secondLabel?: string
  readonly secondSnippet?: string
  /**
   * Kleinste Basis, in der die Taste eine Bedeutung hat. `A`–`F` brauchen 16, die Ziffern `8`/`9`
   * brauchen 10, `2`–`7` brauchen 8. In BIN bleiben nur `0` und `1` übrig (Konzept B2).
   */
  readonly minBase?: KeypadBase
  /** Sprachschlüssel des zugänglichen Namens — nur wo das Zeichen nicht selbsterklärend ist. */
  readonly ariaKey?: string
  readonly colSpan?: number
  readonly rowSpan?: number
}

/** Eine Tastenreihe. `null` ist eine freie Zelle (der Platz gehört einer Taste mit `rowSpan`). */
export type KeyRow = readonly (KeyDefinition | null)[]

export interface KeypadLayout {
  readonly mode: KeypadMode
  readonly columns: number
  readonly rows: readonly KeyRow[]
}

const key = (definition: KeyDefinition): KeyDefinition => definition

const digit = (value: string, minBase?: KeypadBase): KeyDefinition =>
  key({ id: `digit${value}`, label: value, snippet: value, role: 'digit', minBase })

/**
 * Tasten, die in mehreren Rechenarten vorkommen — einmal definiert, mehrfach verwendet.
 * **Ohne** Typannotation, damit TypeScript die einzelnen Schlüssel kennt: `Record<string, …>`
 * machte aus jedem Zugriff ein `KeyDefinition | undefined`, und ein `spread` verlor dann die
 * Pflichtfelder.
 */
const SYMBOLS = {
  clear: key({ id: 'clear', label: 'AC', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.clear' }),
  backspace: key({ id: 'backspace', label: '⌫', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.backspace' }),
  more: key({ id: 'more', label: '⋯', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.more' }),
  representations: key({ id: 'representations', label: '≡', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.representations' }),
  second: key({ id: 'second', label: '2nd', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.second' }),
  percent: key({ id: 'percent', label: '%', snippet: '%', role: 'function' }),
  divide: key({ id: 'divide', label: '÷', snippet: '/', role: 'operator' }),
  multiply: key({ id: 'multiply', label: '×', snippet: '*', role: 'operator' }),
  minus: key({ id: 'minus', label: '−', snippet: '-', role: 'operator' }),
  plus: key({ id: 'plus', label: '+', snippet: '+', role: 'operator' }),
  equals: key({ id: 'equals', label: '=', snippet: '', role: 'equals' }),
  sign: key({ id: 'sign', label: '±', snippet: '-', role: 'function' }),
  decimal: key({ id: 'decimal', label: ',', snippet: ',', role: 'digit' }),
  openParen: key({ id: 'openParen', label: '(', snippet: '(', role: 'function' }),
  closeParen: key({ id: 'closeParen', label: ')', snippet: ')', role: 'function' }),
  pi: key({ id: 'pi', label: 'π', snippet: 'pi', role: 'constant' }),
  e: key({ id: 'e', label: 'e', snippet: 'e', role: 'constant' }),
  ans: key({ id: 'ans', label: 'ANS', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.ans' }),
  mod: key({ id: 'mod', label: 'mod', snippet: ' mod ', role: 'operator' }),
  // Bitoperationen: `<<` und `>>` sind echte Operatoren, `bitAnd` und Verwandte sind
  // **Funktionen**. Gemessen am 2026-10-04: `12 bitAnd 10` ist ein Fehler, `1 << 4` ergibt 16,
  // und `12 and 10` ist in mathjs **logisch** (true), nicht bitweise. Die frühere Belegung
  // (` bitAnd ` als Operator) hat deshalb nie gerechnet — sie ist hier berichtigt.
  bitAnd: key({ id: 'bitAnd', label: 'AND', snippet: 'bitAnd(', role: 'operator' }),
  bitOr: key({ id: 'bitOr', label: 'OR', snippet: 'bitOr(', role: 'operator' }),
  bitXor: key({ id: 'bitXor', label: 'XOR', snippet: 'bitXor(', role: 'operator' }),
  bitNot: key({ id: 'bitNot', label: 'NOT', snippet: 'bitNot(', role: 'operator' }),
  leftShift: key({ id: 'leftShift', label: '<<', snippet: '<<', role: 'operator' }),
  rightShift: key({ id: 'rightShift', label: '>>', snippet: '>>', role: 'operator' }),
  inverse: key({ id: 'inverse', label: '1/x', snippet: '1/(', role: 'function' })
}

/** Wissenschaftliche Tasten mit zweiter Belegung. Jede zweite Funktion ist gegen die
 *  kuratierten Factories geprüft: `asin acos atan nthRoot cbrt combinations exp log2` gibt es. */
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

/** Tasten der RPN-Eingabe. Hier stehen **Tokens** des RPN-Kerns (`evaluateRpn`) und keine
 *  Ausdrucks-Schnipsel: `sqrt(` wäre als Token unlesbar, `sqrt` ist richtig. Klammern und Prozent
 *  gibt es in der RPN nicht — sie fehlen deshalb, statt als tote Tasten dazustehen. */
const RPN: readonly KeyDefinition[] = [
  key({ id: 'rpnNegate', label: '±', snippet: 'neg', role: 'function' }),
  key({ id: 'rpnInverse', label: '1/x', snippet: 'inv', role: 'function' }),
  key({ id: 'rpnSqrt', label: '√', snippet: 'sqrt', role: 'function' }),
  key({ id: 'rpnFactorial', label: 'n!', snippet: 'fact', role: 'function' }),
  // Eigene Potenztaste ohne zweite Belegung: `nthRoot(` ist ein Ausdruck, kein RPN-Token.
  key({ id: 'rpnPower', label: 'xʸ', snippet: '^', role: 'operator' })
]

/**
 * Stapelgriffe der RPN-Eingabe. Sie tragen keinen Schnipsel, sondern arbeiten auf der Token-Folge
 * (`dropRpnToken`, `swapRpnTokens`). `SWAP` und `DROP` sind die eingeführten Abkürzungen der
 * Stapelrechner — genormte Kürzel werden nicht übersetzt.
 */
const RPN_EDIT: readonly KeyDefinition[] = [
  key({ id: 'rpnSwap', label: 'SWAP', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.swap' }),
  key({ id: 'rpnDrop', label: 'DROP', snippet: '', role: 'action', ariaKey: 'tool.calculator.key.drop' })
]

const NUMERIC_ROWS: readonly KeyRow[] = [
  [digit('7'), digit('8'), digit('9')],
  [digit('4'), digit('5'), digit('6')],
  [digit('1'), digit('2'), digit('3')],
  [SYMBOLS.sign, digit('0'), SYMBOLS.decimal]
]

export const KEYPADS: Record<KeypadMode, KeypadLayout> = {
  standard: {
    mode: 'standard',
    columns: 4,
    rows: [
      [SYMBOLS.clear, SYMBOLS.backspace, SYMBOLS.percent, SYMBOLS.divide],
      [digit('7'), digit('8'), digit('9'), SYMBOLS.multiply],
      [digit('4'), digit('5'), digit('6'), SYMBOLS.minus],
      [digit('1'), digit('2'), digit('3'), SYMBOLS.plus],
      [SYMBOLS.sign, digit('0'), SYMBOLS.decimal, SYMBOLS.equals]
    ]
  },
  scientific: {
    mode: 'scientific',
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
  },
  programmer: {
    mode: 'programmer',
    columns: 6,
    rows: [
      [SYMBOLS.bitAnd, SYMBOLS.bitOr, SYMBOLS.bitXor, SYMBOLS.bitNot, SYMBOLS.leftShift, SYMBOLS.rightShift],
      [SYMBOLS.clear, SYMBOLS.backspace, SYMBOLS.openParen, SYMBOLS.closeParen, SYMBOLS.mod, SYMBOLS.divide],
      [digit('7', 8), digit('8', 10), digit('9', 10), digit('A', 16), digit('B', 16), SYMBOLS.multiply],
      [digit('4', 8), digit('5', 8), digit('6', 8), digit('C', 16), digit('D', 16), SYMBOLS.minus],
      [digit('1'), digit('2', 8), digit('3', 8), digit('E', 16), digit('F', 16), SYMBOLS.plus],
      [digit('0'), digit('00'), SYMBOLS.more, SYMBOLS.representations, SYMBOLS.sign, SYMBOLS.equals]
    ]
  },
  rpn: {
    mode: 'rpn',
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
}

/** Belegung einer Taste im aktuellen Zustand — mit zweiter Ebene, wenn `2nd` aktiv ist. */
export function resolveKey(definition: KeyDefinition, second: boolean): { readonly label: string; readonly snippet: string } {
  if (second && definition.secondLabel && definition.secondSnippet) {
    return { label: definition.secondLabel, snippet: definition.secondSnippet }
  }
  return { label: definition.label, snippet: definition.snippet }
}

/** Hat die Taste überhaupt eine zweite Belegung? Nur dann zeigt `2nd` etwas an. */
export function hasSecondPlane(definition: KeyDefinition): boolean {
  return Boolean(definition.secondLabel && definition.secondSnippet)
}

/** Alle Tasten einer Rechenart in Reihenfolge — für Tests und für die Vollzähligkeit. */
export function keypadKeys(mode: KeypadMode): readonly KeyDefinition[] {
  const layout = KEYPADS[mode]
  return layout.rows.flatMap((row) => row.filter((entry): entry is KeyDefinition => entry !== null))
}

/**
 * Ist die Taste in der gewählten Basis bedienbar? Im Programmierer-Modus haben `A`–`F` in DEC,
 * OCT und BIN keine Ziffernbedeutung; in BIN bleibt von `8`/`9` und `2`–`7` nichts übrig (B2).
 */
export function isKeyEnabled(definition: KeyDefinition, base?: KeypadBase): boolean {
  if (base === undefined) return true
  return (definition.minBase ?? 2) <= base
}

/**
 * Hängt ein Tasten-Zeichen an die **RPN**-Eingabe. Anders als beim Ausdruck wird hier immer ein
 * Leerzeichen gesetzt: die RPN-Eingabe wird an Leerraum zerlegt, `4 5+` wäre zwei Tokens
 * (`4` und `5+`) und damit unlesbar. Der vorhandene Helfer `appendSnippet` setzt bewusst kein
 * Leerzeichen vor einen Operator — für RPN ist das die falsche Regel.
 */
export function appendRpnToken(current: string, token: string): string {
  const trimmed = current.trimEnd()
  return trimmed ? `${trimmed} ${token}` : token
}

/**
 * Verwirft den **letzten Wert** der RPN-Eingabe. Anders als `⌫`, das ein einzelnes Zeichen löscht,
 * arbeitet dieser Griff auf Token-Ebene — so wie der `DROP`-Griff eines Stapelrechners, nur auf
 * der geschriebenen Folge statt auf einem Stapel im Speicher.
 */
export function dropRpnToken(current: string): string {
  const tokens = current.trim() ? current.trim().split(/\s+/u) : []
  tokens.pop()
  return tokens.join(' ')
}

/**
 * Tauscht die letzten beiden Werte — der `SWAP`-Griff eines Stapelrechners. Bei weniger als zwei
 * Werten bleibt die Eingabe unverändert.
 */
export function swapRpnTokens(current: string): string {
  const trimmed = current.trim()
  if (!trimmed) return ''
  const tokens = trimmed.split(/\s+/u)
  if (tokens.length < 2) return trimmed
  const last = tokens[tokens.length - 1] ?? ''
  const before = tokens[tokens.length - 2] ?? ''
  tokens.splice(tokens.length - 2, 2, last, before)
  return tokens.join(' ')
}

/** Eine Funktionstaste des Blattes „Weitere Funktionen". */
export interface SheetEntry {
  readonly label: string
  readonly snippet: string
}

export interface SheetGroup {
  /** Sprachschlüssel der Gruppenüberschrift — sichtbarer Text, deshalb übersetzt. */
  readonly titleKey: string
  readonly entries: readonly SheetEntry[]
}

/**
 * Das Blatt `⋯` führt **nur**, was die kuratierte Factory-Liste hergibt (ADR 0005, gemessen
 * 2026-10-04). Deshalb fehlen hier `tau`, `phi`, `i`, `arg`, `isPrime`, `mean` und `std`.
 */
export const SHEET_GROUPS: readonly SheetGroup[] = [
  {
    titleKey: 'tool.calculator.sheet.inverse',
    entries: [
      { label: 'asin', snippet: 'asin(' },
      { label: 'acos', snippet: 'acos(' },
      { label: 'atan', snippet: 'atan(' },
      { label: 'atan2', snippet: 'atan2(' }
    ]
  },
  {
    titleKey: 'tool.calculator.sheet.hyperbolic',
    entries: [
      { label: 'sinh', snippet: 'sinh(' },
      { label: 'cosh', snippet: 'cosh(' },
      { label: 'tanh', snippet: 'tanh(' },
      { label: 'asinh', snippet: 'asinh(' },
      { label: 'acosh', snippet: 'acosh(' },
      { label: 'atanh', snippet: 'atanh(' }
    ]
  },
  {
    titleKey: 'tool.calculator.sheet.rounding',
    entries: [
      { label: 'abs', snippet: 'abs(' },
      { label: 'round', snippet: 'round(' },
      { label: 'floor', snippet: 'floor(' },
      { label: 'ceil', snippet: 'ceil(' },
      { label: 'fix', snippet: 'fix(' },
      { label: 'sign', snippet: 'sign(' }
    ]
  },
  {
    titleKey: 'tool.calculator.sheet.numberTheory',
    entries: [
      { label: 'P(n,k)', snippet: 'permutations(' },
      { label: 'gcd', snippet: 'gcd(' },
      { label: 'lcm', snippet: 'lcm(' },
      { label: 'mod', snippet: ' mod ' }
    ]
  },
  {
    titleKey: 'tool.calculator.sheet.lists',
    entries: [
      { label: 'max', snippet: 'max(' },
      { label: 'min', snippet: 'min(' },
      { label: 'sum', snippet: 'sum(' }
    ]
  },
  {
    titleKey: 'tool.calculator.sheet.constants',
    entries: [
      { label: 'π', snippet: 'pi' },
      { label: 'e', snippet: 'e' }
    ]
  }
]

/**
 * Funktionsnamen, die im Tastenfeld und im Blatt vorkommen — der Test stellt sie gegen
 * `calculatorFunctions`. So fällt eine Taste auf eine nicht geladene Factory hier auf und nicht
 * erst beim Nutzer (eine fehlende Factory bricht erst zur Laufzeit, ADR 0005).
 */
export function keypadFunctionNames(): readonly string[] {
  const names = new Set<string>()
  for (const mode of Object.keys(KEYPADS) as KeypadMode[]) {
    for (const definition of keypadKeys(mode)) {
      for (const snippet of [definition.snippet, definition.secondSnippet]) {
        const match = snippet ? /^([a-zA-Z][a-zA-Z0-9]*)\(/u.exec(snippet) : null
        if (match?.[1]) names.add(match[1])
      }
    }
  }
  for (const group of SHEET_GROUPS) {
    for (const entry of group.entries) {
      const match = /^([a-zA-Z][a-zA-Z0-9]*)\(/u.exec(entry.snippet)
      if (match?.[1]) names.add(match[1])
    }
  }
  return [...names].sort()
}
