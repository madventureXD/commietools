/**
 * Gemeinsame Bausteine der vier Tastenfelder — **reine Daten und reine Funktionen**, keine
 * Oberfläche und keine Anzeigetexte. Die Belegungen selbst liegen je Rechenart in `keypads/`;
 * jede Werkzeugroute lädt damit nur ihr eigenes Feld (Entscheidung 2026-10-04: ein Werkzeug je
 * Rechenart).
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

/** Zahlensysteme des Programmierer-Rechners, wie im Kern. */
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
  readonly columns: number
  readonly rows: readonly KeyRow[]
}

export const key = (definition: KeyDefinition): KeyDefinition => definition

export const digit = (value: string, minBase?: KeypadBase): KeyDefinition =>
  key({ id: `digit${value}`, label: value, snippet: value, role: 'digit', minBase })

/**
 * Tasten, die in mehreren Rechenarten vorkommen — einmal definiert, mehrfach verwendet.
 * **Ohne** Typannotation, damit TypeScript die einzelnen Schlüssel kennt: `Record<string, …>`
 * machte aus jedem Zugriff ein `KeyDefinition | undefined`, und ein `spread` verlor dann die
 * Pflichtfelder.
 *
 * Die zugänglichen Namen liegen im **gemeinsamen Rahmen** (`tool.calc.key.*`) — sie sind für
 * alle vier Rechenarten dieselben und werden nur einmal übersetzt.
 */
export const SYMBOLS = {
  clear: key({ id: 'clear', label: 'AC', snippet: '', role: 'action', ariaKey: 'tool.calc.key.clear' }),
  backspace: key({ id: 'backspace', label: '⌫', snippet: '', role: 'action', ariaKey: 'tool.calc.key.backspace' }),
  more: key({ id: 'more', label: '⋯', snippet: '', role: 'action', ariaKey: 'tool.calc.key.more' }),
  representations: key({ id: 'representations', label: '≡', snippet: '', role: 'action', ariaKey: 'tool.calc.key.representations' }),
  second: key({ id: 'second', label: '2nd', snippet: '', role: 'action', ariaKey: 'tool.calc.key.second' }),
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
  ans: key({ id: 'ans', label: 'ANS', snippet: '', role: 'action', ariaKey: 'tool.calc.key.ans' }),
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

/** Alle Tasten eines Feldes in Reihenfolge — für Tests und für die Vollzähligkeit. */
export function keypadKeys(layout: KeypadLayout): readonly KeyDefinition[] {
  return layout.rows.flatMap((row) => row.filter((entry): entry is KeyDefinition => entry !== null))
}

/**
 * Ist die Taste in der gewählten Basis bedienbar? Im Programmierer-Rechner haben `A`–`F` in DEC,
 * OCT und BIN keine Ziffernbedeutung; in BIN bleibt von `8`/`9` und `2`–`7` nichts übrig (B2).
 */
export function isKeyEnabled(definition: KeyDefinition, base?: KeypadBase): boolean {
  if (base === undefined) return true
  return (definition.minBase ?? 2) <= base
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
 *
 * Es gehört zum **gemeinsamen Rahmen**: seit der Aufteilung erreicht jede der vier Rechenarten
 * das Blatt über die Taste `⋯` — auch der Standardrechner, der es vorher nicht hatte
 * (Entscheidung 2026-10-04).
 */
export const SHEET_GROUPS: readonly SheetGroup[] = [
  {
    titleKey: 'tool.calc.sheet.inverse',
    entries: [
      { label: 'asin', snippet: 'asin(' },
      { label: 'acos', snippet: 'acos(' },
      { label: 'atan', snippet: 'atan(' },
      { label: 'atan2', snippet: 'atan2(' }
    ]
  },
  {
    titleKey: 'tool.calc.sheet.hyperbolic',
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
    titleKey: 'tool.calc.sheet.rounding',
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
    titleKey: 'tool.calc.sheet.numberTheory',
    entries: [
      { label: 'P(n,k)', snippet: 'permutations(' },
      { label: 'gcd', snippet: 'gcd(' },
      { label: 'lcm', snippet: 'lcm(' },
      { label: 'mod', snippet: ' mod ' }
    ]
  },
  {
    titleKey: 'tool.calc.sheet.lists',
    entries: [
      { label: 'max', snippet: 'max(' },
      { label: 'min', snippet: 'min(' },
      { label: 'sum', snippet: 'sum(' }
    ]
  },
  {
    titleKey: 'tool.calc.sheet.constants',
    entries: [
      { label: 'π', snippet: 'pi' },
      { label: 'e', snippet: 'e' }
    ]
  }
]

/**
 * Funktionsnamen, die in den Tastenfeldern und im Blatt vorkommen — der Test stellt sie gegen
 * `calculatorFunctions`. So fällt eine Taste auf eine nicht geladene Factory hier auf und nicht
 * erst beim Nutzer (eine fehlende Factory bricht erst zur Laufzeit, ADR 0005).
 */
export function keypadFunctionNames(layouts: readonly KeypadLayout[]): readonly string[] {
  const names = new Set<string>()
  for (const layout of layouts) {
    for (const definition of keypadKeys(layout)) {
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
