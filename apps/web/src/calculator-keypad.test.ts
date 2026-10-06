import { describe, expect, it } from 'vitest'
import { evaluate, evaluateRpn } from '@commietools/tools/calculator/core'
import { calculatorFactoryNames } from '@commietools/tools/calculator/functions'
import {
  SHEET_GROUPS,
  hasSecondPlane,
  isKeyEnabled,
  keypadFunctionNames,
  keypadKeys,
  resolveKey,
  type KeypadBase,
  type KeypadLayout
} from '@commietools/tools/calculator/keypad'
import {
  parseRpnInput,
  rpnActionForSnippet,
  rpnInputReducer,
  rpnInputText,
  type RpnInputAction,
  type RpnInputState
} from '@commietools/tools/calculator/rpnInput'
import { ALL_KEYPADS } from '@commietools/tools/calculator/keypads'
import { PROGRAMMER_KEYPAD } from '@commietools/tools/calculator/keypads/programmer'
import { RPN_KEYPAD } from '@commietools/tools/calculator/keypads/rpn'
import { SCIENTIFIC_KEYPAD } from '@commietools/tools/calculator/keypads/scientific'
import { STANDARD_KEYPAD } from '@commietools/tools/calculator/keypads/standard'
import { toMathML } from '@commietools/tools/calculator/render'
import { calculatorFor } from '@commietools/tools/calculator/core'
import { appendHexDigit, appendSnippet, splitRpnTokens } from './calculator-ui'

/**
 * Bedien-Teile der vier Rechenarten: Tastenfeld-Daten und der 2D-Satz.
 *
 * Jede Rechenart hat ihr **eigenes** Tastenfeld (`keypads/<rechenart>.ts`) — seit der Aufteilung
 * vom 2026-10-04 lädt eine Werkzeugroute nur ihr eigenes. Geprüft wird deshalb weiterhin über
 * **alle** Felder: keine Rechenart darf eine tote Taste führen.
 *
 * Der wichtigste Test ist der erste: eine Taste, deren Ausdruck der Kern nicht lesen kann, ist
 * eine **tote Taste**. Genau das war der alte Programmierer-Stand — ` bitAnd ` und ` leftShift `
 * sind keine mathjs-Operatoren (gemessen 2026-10-04: „Unexpected type of argument"), die Tasten
 * haben also nie gerechnet.
 */
describe('Tastenfeld', () => {
  it('macht jede Taste zu einem Ausdruck, den der Kern lesen kann', () => {
    /**
     * Der Aufruf einer Funktion braucht die richtige Zahl von Argumenten — die steht nicht im
     * Schnipsel. `sqrt(8)` ist gültig, `bitAnd(8)` nicht. Diese Liste führt die Funktionen des
     * Tastenfelds mit mehr als einem Argument; alles andere wird mit einem aufgerufen.
     */
    const MULTI_ARGUMENT = new Set([
      'nthRoot', 'atan2', 'bitAnd', 'bitOr', 'bitXor', 'leftShift', 'rightArithShift',
      'gcd', 'lcm', 'combinations', 'permutations', 'max', 'min', 'sum'
    ])
    /** Umkehrfunktionen mit eingeschränktem Wertebereich: `asin(8)` ist zu Recht ein Fehler. */
    const ONE_HALF = new Set(['asin', 'acos', 'atanh'])
    const OPERATORS = new Set(['+', '-', '*', '/', '^', '%', '<<', '>>', 'mod'])
    const OPERANDS = /^(?:\d+|pi|e)$/u
    const HEX_DIGIT = /^[A-F]$/u

    /** Baut aus einem Schnipsel einen **vollständigen, gültigen** Ausdruck als Probe. */
    const probeFor = (snippet: string): string | null => {
      const trimmed = snippet.trim()
      const call = /^([a-zA-Z][a-zA-Z0-9]*)\($/u.exec(snippet)
      if (call?.[1]) {
        if (ONE_HALF.has(call[1])) return `${snippet}0.5)`
        return MULTI_ARGUMENT.has(call[1]) ? `${snippet}8, 2)` : `${snippet}8)`
      }
      if (snippet.startsWith('1/(')) return `${snippet}8)`
      // Klammern treten nur im Paar auf — die Probe bildet deshalb beide Zeichen ab.
      if (snippet === '(' || snippet === ')') return '(8)'
      // Der Operator `^` selbst steht in der Operatorliste; `^2` und `10^` sind dagegen
      // **Suffix**- und **Präfix**-Tasten und brauchen eine Basis beziehungsweise eine Hochzahl.
      if (OPERATORS.has(trimmed)) return `8 ${trimmed} 2`
      if (trimmed.startsWith('^')) return `3${trimmed}`
      if (trimmed.endsWith('^')) return `${trimmed}3`
      if (snippet === ',') return '8,5'
      // Eine Ziffer der Basis 16 ist nur mit Präfix ein gültiger mathjs-Ausdruck.
      if (HEX_DIGIT.test(trimmed)) return `0x${trimmed}`
      if (OPERANDS.test(trimmed)) return trimmed
      return null
    }

    /**
     * In RPN sind die Schnipsel **Tokens** für `evaluateRpn`, keine Ausdrücke: `sqrt` ist dort
     * richtig, `sqrt(` wäre unlesbar. Die Probe prüft deshalb je Rechenart mit dem passenden
     * Werkzeug — und zwar so, dass am Ende genau ein Wert auf dem Stapel liegt.
     */
    const RPN_UNARY = new Set(['neg', 'inv', 'sqrt', 'fact'])
    const rpnProbe = (snippet: string): readonly string[] | null => {
      const trimmed = snippet.trim()
      if (OPERATORS.has(trimmed)) return ['2', '3', trimmed]
      if (RPN_UNARY.has(trimmed)) return ['2', trimmed]
      if (snippet === ',') return ['2,5']
      if (OPERANDS.test(trimmed)) return [trimmed]
      return null
    }

    const deadKeys: string[] = []
    for (const layout of ALL_KEYPADS) {
      const isRpn = layout === RPN_KEYPAD
      for (const definition of keypadKeys(layout)) {
        for (const snippet of [definition.snippet, definition.secondSnippet]) {
          if (!snippet) continue
          if (isRpn) {
            const tokens = rpnProbe(snippet)
            if (tokens === null) {
              deadKeys.push(`rpn/${definition.id}: ${JSON.stringify(snippet)} — keine Probe möglich`)
              continue
            }
            const outcome = evaluateRpn(tokens, { number: 'BigNumber' })
            if (!outcome.ok) {
              deadKeys.push(`rpn/${definition.id}: ${JSON.stringify(snippet)} → ${tokens.join(' ')} → ${String(outcome.error)}`)
            }
            continue
          }
          const probe = probeFor(snippet)
          if (probe === null) {
            deadKeys.push(`${definition.id}: ${JSON.stringify(snippet)} — keine Probe möglich`)
            continue
          }
          const result = evaluate(probe, { number: 'BigNumber' })
          if (!result.ok) {
            deadKeys.push(`${definition.id}: ${JSON.stringify(snippet)} → ${probe} → ${String(result.error)}`)
          }
        }
      }
    }
    expect(deadKeys).toEqual([])
  })

  it('bietet nur Funktionen an, deren Factory geladen ist', () => {
    /**
     * Eine fehlende Factory bricht erst zur Laufzeit, nie beim Bau (ADR 0005) — deshalb dieser
     * Abgleich gegen die **Factory-Liste**, nicht gegen die Aufrufliste: in `calculatorFunctions`
     * stehen nur die Funktionen mit eigener Modusangabe, während `round`, `floor`, `gcd` und
     * Verwandte über die Prüfausdrücke laufen. Die Factory-Liste ist die Wahrheit darüber, was
     * überhaupt existiert.
     */
    const loaded = new Set(calculatorFactoryNames)
    const missing = keypadFunctionNames(ALL_KEYPADS).filter((name) => !loaded.has(`${name}Dependencies`))
    expect(missing).toEqual([])
  })

  it('führt im Blatt nur Funktionen mit geladener Factory', () => {
    const loaded = new Set(calculatorFactoryNames)
    for (const group of SHEET_GROUPS) {
      expect(group.titleKey.startsWith('tool.calc.sheet.'), group.titleKey).toBe(true)
      for (const entry of group.entries) {
        const match = /^([a-zA-Z][a-zA-Z0-9]*)\(/u.exec(entry.snippet)
        if (!match?.[1]) continue
        expect(loaded.has(`${match[1]}Dependencies`), `${entry.label} → ${match[1]}`).toBe(true)
      }
    }
  })

  it('legt jede Taste innerhalb des Rasters ab', () => {
    /**
     * Nachbau der Rasterplatzierung: eine Taste, die über den Rand läuft, landet in der
     * nächsten Reihe — im Bild ist die Tastatur dann verschoben, ohne dass ein Test anschlägt.
     * Die Simulation zählt die Zellen so, wie CSS Grid sie vergibt (`rowSpan`, `colSpan`).
     */
    const fits = (layout: KeypadLayout): string | null => {
      const occupied = new Set<string>()
      let row = 0
      let column: number
      for (const keyRow of layout.rows) {
        column = 0
        for (const entry of keyRow) {
          if (!entry) continue
          while (occupied.has(`${row}:${column}`)) column += 1
          const colSpan = entry.colSpan ?? 1
          const rowSpan = entry.rowSpan ?? 1
          if (column + colSpan > layout.columns) return `${entry.id} läuft in Reihe ${row + 1} über`
          for (let r = row; r < row + rowSpan; r += 1) {
            for (let c = column; c < column + colSpan; c += 1) occupied.add(`${r}:${c}`)
          }
          column += colSpan
        }
        row += 1
      }
      return null
    }
    for (const layout of ALL_KEYPADS) {
      expect(fits(layout), `${layout.columns} Spalten`).toBeNull()
    }
  })

  it('stellt die RPN-Stapelgriffe nebeneinander in die letzte Reihe', () => {
    /**
     * Die Simulation oben prüft nur, dass nichts überläuft. Sie hat deshalb nicht gesehen, dass
     * `SWAP` neben `e` rutschte und `DROP` allein in einer Reihe stand — im Bild sah man es.
     * Deshalb diese ausdrückliche Zusicherung: beide Griffe in **derselben** Reihe, direkt
     * nebeneinander.
     */
    const layout = RPN_KEYPAD
    const occupied = new Set<string>()
    const places = new Map<string, { row: number; column: number }>()
    let row = 0
    for (const keyRow of layout.rows) {
      let column = 0
      for (const entry of keyRow) {
        if (!entry) continue
        while (occupied.has(`${row}:${column}`)) column += 1
        places.set(entry.id, { row, column })
        const colSpan = entry.colSpan ?? 1
        const rowSpan = entry.rowSpan ?? 1
        for (let r = row; r < row + rowSpan; r += 1) {
          for (let c = column; c < column + colSpan; c += 1) occupied.add(`${r}:${c}`)
        }
        column += colSpan
      }
      row += 1
    }
    const swap = places.get('rpnSwap')
    const drop = places.get('rpnDrop')
    expect(swap).toBeDefined()
    expect(drop).toBeDefined()
    expect(drop?.row).toBe(swap?.row)
    expect(drop?.column).toBe((swap?.column ?? 0) + 1)
  })

  it('zeigt die zweite Belegung nur auf Tasten, die eine haben', () => {
    const scientific = keypadKeys(SCIENTIFIC_KEYPAD)
    const withSecond = scientific.filter((definition) => hasSecondPlane(definition))
    expect(withSecond.map((definition) => definition.id)).toEqual([
      'sin', 'cos', 'tan', 'power', 'factorial', 'sqrt', 'square', 'tenPow', 'ln', 'log'
    ])
    const tangent = scientific.find((definition) => definition.id === 'tan')
    expect(tangent && resolveKey(tangent, false).snippet).toBe('tan(')
    expect(tangent && resolveKey(tangent, true).snippet).toBe('atan(')
    // Ohne zweite Belegung ändert `2nd` nichts — sonst zeigte die Taste etwas Falsches.
    const pi = scientific.find((definition) => definition.id === 'pi')
    expect(pi && resolveKey(pi, true).snippet).toBe('pi')
    expect(pi && hasSecondPlane(pi)).toBe(false)
  })

  it('schaltet Zifferntasten je Basis ab, statt sie nur blass zu zeigen', () => {
    const programmer = keypadKeys(PROGRAMMER_KEYPAD)
    const find = (id: string) => programmer.find((definition) => definition.id === id)
    const enabled = (id: string, base: KeypadBase) => {
      const definition = find(id)
      return definition ? isKeyEnabled(definition, base) : false
    }
    expect(enabled('digitA', 16)).toBe(true)
    expect(enabled('digitA', 10)).toBe(false)
    expect(enabled('digit8', 10)).toBe(true)
    expect(enabled('digit8', 8)).toBe(false)
    expect(enabled('digit7', 8)).toBe(true)
    expect(enabled('digit7', 2)).toBe(false)
    expect(enabled('digit0', 2)).toBe(true)
    expect(enabled('digit1', 2)).toBe(true)
  })

  it('setzt in RPN ein Leerzeichen zwischen die Tokens', () => {
    // Ohne das Leerzeichen wäre `4 5+` zwei Tokens (`4` und `5+`) und damit unlesbar. Seit Karte
    // M6-002 liegt die Regel im Eingabereducer (`rpnInputText`), nicht mehr in einer Textfunktion.
    const text = (tokens: string[], draft = '') => rpnInputText({ tokens, draft })
    expect(text([], '3')).toBe('3')
    expect(text(['3'], '4')).toBe('3 4')
    expect(text(['3', '4'], '+')).toBe('3 4 +')
    expect(text(['3', '4', '+'])).toBe('3 4 +')
  })

  it('gibt dem Standardrechner ein eigenes Feld mit Blatt und Klammern', () => {
    // Entscheidung 2026-10-04: der Standardrechner bekommt das Blatt `⋯`; damit die sechste
    // Reihe keine Lücke hat, stehen dort die Klammern — dieselben Tasten wie im Programmierer.
    const ids = keypadKeys(STANDARD_KEYPAD).map((entry) => entry.id)
    expect(ids).toContain('more')
    expect(ids).toContain('openParen')
    expect(ids).toContain('closeParen')
    expect(ids).toContain('digit0')
    expect(STANDARD_KEYPAD.columns).toBe(4)
  })
})

/**
 * Der 2D-Satz ist ein Eigenbau (siehe Kopf von `render.ts`). Geprüft wird die Struktur des
 * MathML, das der Browser setzt — nicht ein Bild: den Bildbeweis liefert erst der Durchlauf im
 * Browser, und der ist Teil der Abnahme.
 */
describe('2D-Satz', () => {
  const math = calculatorFor({ number: 'BigNumber' })

  it('setzt den Bruch als Bruch, nicht als Schrägstrich', () => {
    const markup = toMathML(math.parse('1/3'), '1/3')
    expect(markup).toContain('<mfrac>')
    expect(markup).toContain('display="block"')
    expect(markup).toContain('encoding="text/plain"')
    expect(markup).not.toContain('<mo>/</mo>')
  })

  it('setzt Wurzel, Kubikwurzel, Hochzahl und Fakultät als eigene Formen', () => {
    expect(toMathML(math.parse('sqrt(2)'))).toContain('<msqrt>')
    expect(toMathML(math.parse('cbrt(8)'))).toContain('<mroot>')
    expect(toMathML(math.parse('nthRoot(8, 3)'))).toContain('<mroot>')
    expect(toMathML(math.parse('x^2'))).toContain('<msup>')
    expect(toMathML(math.parse('factorial(5)'))).toContain('<mo>!</mo>')
  })

  it('schreibt Malzeichen und Minuszeichen der Anzeige, nicht die Tastaturzeichen', () => {
    const markup = toMathML(math.parse('2*3')) ?? ''
    expect(markup).toContain('<mo>×</mo>')
    expect(markup).not.toContain('<mo>*</mo>')
    expect(toMathML(math.parse('5-3'))).toContain('<mo>−</mo>')
  })

  it('lässt Konstanten aufrecht und Variablen kursiv', () => {
    const pi = toMathML(math.parse('pi')) ?? ''
    expect(pi).toContain('mathvariant="normal"')
    const variable = toMathML(math.parse('x')) ?? ''
    expect(variable).not.toContain('mathvariant="normal"')
  })

  it('gibt `null` zurück, wo es keine Form kennt — der Rückfall auf den rohen Term', () => {
    // Kein Absturz, keine falsche Formel: die Oberfläche zeigt dann den Text.
    expect(toMathML({ type: 'EtwasUnbekanntes' })).toBeNull()
    expect(toMathML(null)).toBeNull()
    expect(toMathML(undefined)).toBeNull()
    expect(toMathML(math.parse('[[1,2],[3,4]]'))).toBeNull()
  })
})

/**
 * Tastenfolgen statt einzelner Tasten.
 *
 * Der Test oben prüft **eine** Taste — und hat deshalb nicht gesehen, dass zwei Ziffern
 * hintereinander den Ausdruck `6 1 4 4 0` ergeben und damit unlesbar sind. Gemessen am
 * 2026-10-04: `appendSnippet('6', '1')` setzte ein Leerzeichen; im Programmierer-Bild stand
 * „Der Ausdruck ist nicht lesbar". Erst eine Folge zeigt, was der Nutzer wirklich tippt.
 */
/**
 * Drückt Tasten aufeinander und gibt den entstehenden Ausdruck zurück.
 *
 * Im RPN-Feld läuft die Folge über den **Eingabereducer** (Karte M6-002) — dieselbe Abbildung wie
 * im Rahmen: Ziffern erweitern den Zahlentoken, eine Operator- oder Werttaste schließt ihn ab,
 * `Enter` schließt ihn ohne Rechnung ab. Eine Nachbildung über `appendRpnToken` prüfte den alten
 * Eingabeweg und würde mehrstellige Zahlen übersehen.
 */
const pressSequence = (layout: KeypadLayout, tokens: readonly string[]): string => {
  const keys = keypadKeys(layout)
  const snippetOf = (token: string) => {
    const definition = keys.find((entry) => entry.label === token || entry.id === token)
    if (!definition) throw new Error(`Keine Taste „${token}"`)
    return { id: definition.id, snippet: resolveKey(definition, false).snippet }
  }
  if (layout !== RPN_KEYPAD) {
    return tokens.reduce((current, token) => appendSnippet(current, snippetOf(token).snippet), '')
  }
  /**
   * RPN: **derselbe Zustandsweg wie im Rahmen**. Den Text allein durchzureichen genügt nicht — er
   * kann „abgeschlossener Wert" und „begonnener Wert" nicht unterscheiden (`3` nach `Enter` sähe
   * aus wie ein laufender Entwurf, und `3` `Enter` `4` ergäbe `34`).
   */
  const state = tokens.reduce<RpnInputState>((current, token) => {
    if (token === 'Enter') return rpnInputReducer(current, { type: 'commit' })
    const { id, snippet } = snippetOf(token)
    const action = rpnActionForSnippet(snippet)
    if (action) return rpnInputReducer(current, action)
    switch (id) {
      case 'clear': return rpnInputReducer(current, { type: 'clear' })
      case 'backspace': return rpnInputReducer(current, { type: 'backspace' })
      case 'rpnSwap': return rpnInputReducer(current, { type: 'swap' })
      case 'rpnDrop': return rpnInputReducer(current, { type: 'drop' })
      // Alles andere ist ein fertiger Token (etwa ein eingesetztes Ergebnis).
      default: return rpnInputReducer(current, { type: 'operator', value: snippet })
    }
  }, { tokens: [], draft: '' })
  return rpnInputText(state)
}

describe('Tastenfolgen', () => {
  it('hält mehrstellige Zahlen zusammen', () => {
    expect(pressSequence(STANDARD_KEYPAD, ['1', '2'])).toBe('12')
    expect(pressSequence(PROGRAMMER_KEYPAD, ['6', '1', '4', '4', '0'])).toBe('61440')
    const outcome = evaluate('61440', { number: 'BigNumber' })
    expect(outcome.ok).toBe(true)
    expect(outcome.raw).toBe('61440')
  })

  it('rechnet 1/3 + 1/6 über die Tasten zu 0,5', () => {
    const expression = pressSequence(STANDARD_KEYPAD, ['1', '÷', '3', '+', '1', '÷', '6'])
    expect(expression).toBe('1/3+1/6')
    const outcome = evaluate(expression, { number: 'BigNumber' })
    expect(outcome.ok).toBe(true)
    expect(outcome.raw).toBe('0.5')
  })

  it('schreibt das deutsche Komma und liest es richtig', () => {
    const expression = pressSequence(STANDARD_KEYPAD, ['3', 'decimal', '5', '×', '2'])
    expect(expression).toBe('3,5*2')
    const outcome = evaluate(expression, { number: 'BigNumber', decimalSeparator: ',' })
    expect(outcome.ok).toBe(true)
    expect(outcome.raw).toBe('7')
  })

  it('trennt Zahl und Funktionsname — sonst läse der Kern `2e`', () => {
    const expression = pressSequence(SCIENTIFIC_KEYPAD, ['2', '×', 'e'])
    expect(expression).toBe('2*e')
    expect(evaluate(expression, { number: 'BigNumber' }).ok).toBe(true)
  })

  it('hält eine RPN-Zahl zusammen und rechnet die Folge richtig (M6-002)', () => {
    // `3` `4` sind ohne Enter **eine** Zahl (34) — der alte Weg machte daraus zwei Werte.
    expect(pressSequence(RPN_KEYPAD, ['3', '4'])).toBe('34')
    expect(pressSequence(RPN_KEYPAD, ['3', 'Enter', '4', 'Enter', '+'])).toBe('3 4 +')
    expect(pressSequence(RPN_KEYPAD, ['3', 'Enter', '4', 'Enter', '+', '5', '×'])).toBe('3 4 + 5 *')
    const outcome = evaluateRpn(splitRpnTokens('3 4 + 5 *'), { number: 'BigNumber' })
    expect(outcome.ok).toBe(true)
    expect(outcome.raw).toBe('35')
  })

  it('erfüllt die Abnahmefälle der Karte M6-002', () => {
    // 1 → 2 → Enter → 3 → + : die 12 ist eine Zahl, dann die 3, dann die Addition → 15.
    const fifteen = pressSequence(RPN_KEYPAD, ['1', '2', 'Enter', '3', '+'])
    expect(fifteen).toBe('12 3 +')
    const sum = evaluateRpn(splitRpnTokens(fifteen), { number: 'BigNumber' })
    expect(sum.ok).toBe(true)
    expect(sum.raw).toBe('15')

    // 1 → Dezimal → 5 → Enter → 2 → × : 1,5 mal 2 → 3. Das RPN-Feld liefert das **deutsche
    // Komma** als Dezimalzeichen (wie das Tastenfeld des Standardrechners).
    const three = pressSequence(RPN_KEYPAD, ['1', 'decimal', '5', 'Enter', '2', '×'])
    expect(three).toBe('1,5 2 *')
    const product = evaluateRpn(splitRpnTokens(three), { number: 'BigNumber' })
    expect(product.ok).toBe(true)
    expect(product.raw).toBe('3')
  })
})

/**
 * Stapelgriffe und Ziffernbuchstaben.
 *
 * `DROP` und `SWAP` arbeiten auf der geschriebenen Tokenfolge (es gibt keinen Stapel im Speicher);
 * die Ziffernbuchstaben `A`–`F` brauchen ihr `0x`, sonst liest der Kern einen Namen und die Taste
 * wäre tot — genau der Fehler, der vorher gemessen wurde.
 */
describe('Stapelgriffe und Ziffernbuchstaben', () => {
  const apply = (text: string, action: RpnInputAction) => rpnInputText(rpnInputReducer(parseRpnInput(text), action))

  it('verwirft einen ganzen Wert statt eines Zeichens', () => {
    expect(apply('3 4 + 5', { type: 'drop' })).toBe('3 4 +')
    expect(apply('3', { type: 'drop' })).toBe('')
    expect(apply('   ', { type: 'drop' })).toBe('')
    // Mit laufendem Entwurf ist **der** der letzte Wert — er wird verworfen, nicht der davor.
    expect(apply('3 4', { type: 'drop' })).toBe('3')
  })

  it('tauscht die letzten beiden Werte', () => {
    expect(apply('3 4 +', { type: 'swap' })).toBe('3 + 4')
    expect(apply('3', { type: 'swap' })).toBe('3')
    expect(apply('', { type: 'swap' })).toBe('')
    // Der bearbeitete Zahlentoken zählt als oberster Wert mit (Karte M6-002).
    expect(apply('3 4', { type: 'swap' })).toBe('4 3')
  })

  it('macht aus SWAP auf der Folge eine lesbare Rechnung', () => {
    // Der Fall, für den SWAP gedacht ist: die letzten beiden **Werte** stehen in falscher
    // Reihenfolge — tauschen, dann rechnen.
    const expression = pressSequence(RPN_KEYPAD, ['4', 'Enter', '3', 'rpnSwap', '+'])
    expect(expression).toBe('3 4 +')
    const outcome = evaluateRpn(splitRpnTokens(expression), { number: 'BigNumber' })
    expect(outcome.ok).toBe(true)
    expect(outcome.raw).toBe('7')
  })

  it('gibt Ziffernbuchstaben ein 0x mit, sodass der Kern sie liest', () => {
    const einstellig = appendHexDigit('', 'A')
    expect(einstellig).toBe('0xA')
    expect(evaluate(einstellig, { number: 'BigNumber' }).raw).toBe('10')

    const zweistellig = appendHexDigit(einstellig, 'F')
    expect(zweistellig).toBe('0xAF')
    expect(evaluate(zweistellig, { number: 'BigNumber' }).raw).toBe('175')

    expect(appendHexDigit('3+', 'F')).toBe('3+0xF')
  })

  it('führt SWAP und DROP als Tasten der RPN-Rechenart', () => {
    const keys = keypadKeys(RPN_KEYPAD)
    expect(keys.map((entry) => entry.id)).toContain('rpnSwap')
    expect(keys.map((entry) => entry.id)).toContain('rpnDrop')
    // Die Stapelgriffe tragen keinen Schnipsel, sie arbeiten auf der Folge.
    for (const id of ['rpnSwap', 'rpnDrop']) {
      const definition = keys.find((entry) => entry.id === id)
      expect(definition?.snippet).toBe('')
      expect(definition?.role).toBe('action')
    }
  })
})
