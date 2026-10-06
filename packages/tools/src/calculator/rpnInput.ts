/**
 * Eingabe der RPN-Tokenfolge als **Reducer** (Karte M6-002).
 *
 * Vorher hängte jede Taste ihren Schnipsel als eigenen Token an die Eingabe
 * (`appendRpnToken`): `1` `2` ergab die Folge `1 2` — zwei Werte statt der Zahl 12, und der
 * Stapelrechner konnte mehrstellige Zahlen über das Tastenfeld gar nicht eingeben.
 *
 * Der Zustand trennt deshalb **abgeschlossene Tokens** von einem **bearbeiteten Zahlentoken**
 * (`draft`). Ziffern erweitern den Entwurf, `commit` schließt ihn ab, eine Operator- oder
 * Werttaste übernimmt zuerst einen gültigen Entwurf.
 *
 * Der sichtbare Text bleibt die **Quelle der Wahrheit**: `parseRpnInput` gewinnt den Zustand aus
 * dem Text und `rpnInputText` schreibt ihn zurück. Deshalb benutzen Tippen, Einfügen und
 * Tastenfeld denselben Vertrag — Cursor- und Pastenachbearbeitung sind damit ohne Sonderweg
 * gültig (jede Taste liest den Text neu ein und legt ihn neu aus).
 *
 * Die fachliche Auswertung bleibt im Kern (`evaluateRpn`); hier entsteht nur die Folge.
 */

/** Abgeschlossene Tokens und der bearbeitete Zahlentoken (leer = keiner). */
export interface RpnInputState {
  readonly tokens: readonly string[]
  readonly draft: string
}

export type RpnInputAction =
  | { readonly type: 'digit'; readonly value: string }
  /** Dezimaltrenner: der Punkt oder — in der deutschen Oberfläche — das Komma. */
  | { readonly type: 'decimal'; readonly separator?: string }
  | { readonly type: 'sign' }
  | { readonly type: 'commit' }
  /** Fertiger Token: Operator, Funktion oder Konstante — übernimmt zuerst den Entwurf. */
  | { readonly type: 'operator'; readonly value: string }
  | { readonly type: 'backspace' }
  | { readonly type: 'drop' }
  | { readonly type: 'swap' }
  | { readonly type: 'clear' }

const SEPARATOR = /\s+/u

/** Operatoren des Kerns — sie sind immer fertige Tokens, nie ein Zahlentwurf. */
const OPERATORS = new Set(['+', '-', '*', '/', '^', 'mod'])
/** Unäre Funktionen des Kerns — ebenfalls fertige Tokens. */
const FUNCTIONS = new Set(['neg', 'sqrt', 'inv', 'fact'])

/** Ist der Teilstück-Text eine begonnene Zahl (und damit ein Entwurf)? */
function istZahlentwurf(token: string): boolean {
  if (token === '') return true
  if (OPERATORS.has(token) || FUNCTIONS.has(token)) return false
  return /^\d*(?:[.,]\d*)?$/u.test(token)
}

/** Liest den Zustand aus dem sichtbaren Text. Der letzte Token ist der Entwurf, wenn er eine Zahl ist. */
export function parseRpnInput(text: string): RpnInputState {
  const trimmed = text.trim()
  if (!trimmed) return { tokens: [], draft: '' }
  const parts = trimmed.split(SEPARATOR)
  const last = parts[parts.length - 1] ?? ''
  if (istZahlentwurf(last)) return { tokens: parts.slice(0, -1), draft: last }
  return { tokens: parts, draft: '' }
}

/** Schreibt den Zustand als Text — die Anzeige des Eingabefelds. */
export function rpnInputText(state: RpnInputState): string {
  const tokens = state.draft ? [...state.tokens, state.draft] : [...state.tokens]
  return tokens.join(' ')
}

/** Der Entwurf als Token-Liste (für Auswertung und Anzeige ohne Sonderweg). */
export function rpnInputTokens(state: RpnInputState): readonly string[] {
  return state.draft ? [...state.tokens, state.draft] : [...state.tokens]
}

function mitVorzeichen(draft: string): string {
  if (!draft) return draft
  return draft.startsWith('-') ? draft.slice(1) : `-${draft}`
}

/**
 * Ein Schritt der Eingabe. Die Regeln sind absichtlich vollständig aufgezählt — keine Aktion
 * entscheidet über eine Sonderbedingung außerhalb:
 *
 * - `digit` erweitert den Entwurf (auch mehrstellig),
 * - `decimal` beginnt mit `0.` und wird nur **einmal** angenommen,
 * - `sign` kehrt das Vorzeichen des Entwurfs um; **ohne** Entwurf hängt es die unäre Negation `neg`
 *   an — so bleibt der `±`-Griff benutzbar, wenn der oberste Wert aus dem Stapel kommt,
 * - `commit` schließt den Entwurf ab; ein **leerer** Enter dupliziert nichts,
 * - `operator` schließt einen gültigen Entwurf zuerst ab und hängt dann den Token an,
 * - `backspace` löscht im Entwurf ein Zeichen, sonst den letzten Token,
 * - `drop` verwirft den letzten **Wert** (Entwurf, sonst Token), `swap` tauscht die letzten zwei.
 */
export function rpnInputReducer(state: RpnInputState, action: RpnInputAction): RpnInputState {
  const { tokens, draft } = state
  switch (action.type) {
    case 'digit':
      return { tokens, draft: `${draft}${action.value}` }
    case 'decimal': {
      // Ein zweites Trennzeichen wird nicht angenommen; ein leeres Feld beginnt mit `0`.
      const separator = action.separator ?? '.'
      if (draft.includes('.') || draft.includes(',')) return state
      return { tokens, draft: draft ? `${draft}${separator}` : `0${separator}` }
    }
    case 'sign':
      return draft ? { tokens, draft: mitVorzeichen(draft) } : { tokens: [...tokens, 'neg'], draft: '' }
    case 'commit':
      return draft ? { tokens: [...tokens, draft], draft: '' } : state
    case 'operator':
      return { tokens: draft ? [...tokens, draft, action.value] : [...tokens, action.value], draft: '' }
    case 'backspace':
      if (draft) return { tokens, draft: draft.slice(0, -1) }
      return { tokens: tokens.slice(0, -1), draft: '' }
    case 'drop':
      if (draft) return { tokens, draft: '' }
      return { tokens: tokens.slice(0, -1), draft: '' }
    case 'swap': {
      const werte = rpnInputTokens(state)
      if (werte.length < 2) return state
      const letzter = werte[werte.length - 1] ?? ''
      const vorletzter = werte[werte.length - 2] ?? ''
      const getauscht = [...werte.slice(0, -2), letzter, vorletzter]
      return { tokens: getauscht, draft: '' }
    }
    case 'clear':
      return { tokens: [], draft: '' }
    default:
      return state
  }
}

/**
 * Übersetzt einen Tastenschnipsel in eine Aktion. `null` heißt: kein Sonderfall — der Aufrufer
 * hängt den Text unverändert an (so bleibt etwa ein eingesetztes Ergebnis eine fertige Zahl).
 */
export function rpnActionForSnippet(snippet: string): RpnInputAction | null {
  if (/^\d$/u.test(snippet)) return { type: 'digit', value: snippet }
  if (snippet === '.') return { type: 'decimal' }
  // Das deutsche Tastenfeld liefert das Komma als Dezimalzeichen — der Kern liest beide.
  if (snippet === ',') return { type: 'decimal', separator: ',' }
  if (snippet === 'neg') return { type: 'sign' }
  if (OPERATORS.has(snippet) || FUNCTIONS.has(snippet)) return { type: 'operator', value: snippet }
  // Konstanten sind fertige Werte: Sie dürfen nicht mit einem laufenden Entwurf verschmelzen.
  if (snippet === 'pi' || snippet === 'e') return { type: 'operator', value: snippet }
  return null
}

/** Kurzweg für das Tastenfeld: Text rein, Text raus. */
export function applyRpnSnippet(text: string, snippet: string): string {
  const action = rpnActionForSnippet(snippet)
  if (!action) return text
  return rpnInputText(rpnInputReducer(parseRpnInput(text), action))
}
