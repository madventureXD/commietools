/**
 * Zweidimensionale Anzeige („Anzeige 1") — aus dem Ausdrucksbaum wird MathML.
 *
 * **Eigenbau, bewusst und begründet.** Die Alternativen (Temml, KaTeX, MathJax) sind
 * lizenzmäßig unbedenklich, aber **ungemessen** und nicht in der Lizenzprüfung des Projekts; eine
 * Aufnahme ohne diese Prüfung wäre gegen die Projektregel. Dieser Weg kostet **0 Byte** im Bündel,
 * braucht keine Schriftdatei und keine neue Lizenz. Er lässt sich später durch eine geprüfte
 * Bibliothek ersetzen — die Schnittstelle ist eine Funktion: Baum hinein, MathML oder `null`
 * heraus.
 *
 * Zwei Regeln aus dem Konzept:
 * 1. **Kein Rückfall ohne Rückfall.** Was hier nicht behandelt ist, ergibt `null`; die Oberfläche
 *    zeigt dann den rohen Term. Ein ungesetzter Ausdruck ist kein Fehler, sondern ein Zustand.
 * 2. **Kursiv nur die Variable.** Größen (`x`) sind kursiv, Zahlen, Konstanten (`π`, `e`) und
 *    Funktionsnamen stehen aufrecht — ISO 80000-2. MathML tut das von selbst, solange die
 *    Konstanten als `<mi>` ohne Kursivstellung und Funktionen als `<mi>` mit `mathvariant` stehen.
 *
 * Kein mathjs-Import: die Funktion arbeitet auf der **Struktur** eines Knotens, damit sie ohne
 * Rechenkern ladbar und prüfbar bleibt.
 */

/** Struktur eines mathjs-Knotens, soweit sie hier gebraucht wird. */
export interface MathNodeLike {
  readonly type?: string
  readonly op?: string
  readonly fn?: { readonly name?: string } | string
  readonly name?: string
  readonly value?: unknown
  readonly args?: readonly MathNodeLike[]
  readonly content?: MathNodeLike
}

const MATHML_NS = 'http://www.w3.org/1998/Math/MathML'

const escapeText = (text: string): string =>
  text.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;')

/** Zeichen, die in der Anzeige anders aussehen als im Ausdruck. `*` wird zum Malzeichen. */
const OPERATOR_SIGNS: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '×': '×',
  '/': '/',
  '=': '='
}

function operatorSign(operator: string): string {
  return OPERATOR_SIGNS[operator] ?? operator
}

function element(tag: string, content: string, attributes = ''): string {
  return `<${tag}${attributes}>${content}</${tag}>`
}

function functionName(node: MathNodeLike): string {
  if (typeof node.fn === 'string') return node.fn
  return node.fn?.name ?? ''
}

/** Argumente eines Knotens, immer als Feld. */
function nodeArgs(node: MathNodeLike): readonly MathNodeLike[] {
  return Array.isArray(node.args) ? node.args : []
}

/**
 * Wandelt einen Ausdrucksbaum in MathML. `null` heißt: **nicht darstellbar** — die Oberfläche
 * zeigt dann den rohen Term (kein Fehler, kein schwarzer Bildschirm).
 *
 * `decimalSeparator` gilt nur für die Anzeige der Zahlen im Satz; der Rohwert bleibt unberührt.
 */
export function toMathML(
  node: MathNodeLike | null | undefined,
  raw = '',
  decimalSeparator?: ',' | '.'
): string | null {
  const content = renderNode(node, decimalSeparator)
  if (!content) return null
  const annotation = raw ? element('annotation', escapeText(raw), ' encoding="text/plain"') : ''
  const inner = annotation ? element('semantics', content + annotation) : content
  return element('math', inner, ` xmlns="${MATHML_NS}" display="block"`)
}

/** Zahl für die Anzeige: Punkt zwischen Ziffern wird zum Trenner der Sprache. */
function displayNumber(value: unknown, separator?: ',' | '.'): string {
  const text = String(value)
  if (!separator || separator === '.') return text
  return text.replace(/(\d)\.(?=\d)/gu, `$1${separator}`)
}

/** Ein Knoten als MathML — `null`, wenn die Form nicht behandelt wird. */
function renderNode(node: MathNodeLike | null | undefined, separator?: ',' | '.'): string | null {
  if (!node || typeof node.type !== 'string') return null

  switch (node.type) {
    case 'ConstantNode': {
      // Der Wert ist **nicht** immer eine Zeichenkette oder Zahl: im Zahlenmodell `BigNumber`
      // steht dort ein Decimal-Objekt (gemessen 2026-10-04 — genau daran lieferte der Satz
      // zuerst `null`). `String(...)` deckt beide Fälle ab.
      if (node.value === null || node.value === undefined) return null
      return element('mn', escapeText(displayNumber(node.value, separator)))
    }
    case 'SymbolNode': {
      const name = node.name ?? ''
      if (!name) return null
      // Konstanten stehen aufrecht (ISO 80000-2), Variablen kursiv — das ist in MathML die Vorgabe.
      if (name === 'pi') return element('mi', 'π', ' mathvariant="normal"')
      if (name === 'e') return element('mi', 'e', ' mathvariant="normal"')
      if (name === 'Infinity') return element('mi', '∞')
      if (name.length > 1) return element('mi', escapeText(name), ' mathvariant="normal"')
      return element('mi', escapeText(name))
    }
    case 'ParenthesisNode': {
      const inner = renderNode(node.content, separator)
      return inner ? element('mrow', element('mo', '(') + inner + element('mo', ')')) : null
    }
    case 'OperatorNode': {
      const args = nodeArgs(node)
      const op = node.op ?? ''
      if (op === '/' && args.length === 2) {
        const [numerator, denominator] = args
        const top = renderNode(numerator, separator)
        const bottom = renderNode(denominator, separator)
        return top && bottom ? element('mfrac', top + bottom) : null
      }
      if (op === '^' && args.length === 2) {
        const [base, exponent] = args
        const baseHtml = renderNode(base, separator)
        const exponentHtml = renderNode(exponent, separator)
        return baseHtml && exponentHtml ? element('msup', baseHtml + exponentHtml) : null
      }
      if ((op === '-' || op === '+') && args.length === 1) {
        const operand = renderNode(args[0] ?? null, separator)
        return operand ? element('mrow', element('mo', operatorSign(op)) + operand) : null
      }
      if (args.length >= 2) {
        const parts: string[] = []
        for (let index = 0; index < args.length; index += 1) {
          const rendered = renderNode(args[index] ?? null, separator)
          if (!rendered) return null
          if (index > 0) parts.push(element('mo', operatorSign(op)))
          parts.push(rendered)
        }
        return element('mrow', parts.join(''))
      }
      return null
    }
    case 'FunctionNode': {
      const name = functionName(node)
      const args = nodeArgs(node)
      const rendered = args.map((argument) => renderNode(argument, separator))
      if (rendered.some((entry) => entry === null)) return null
      const list = rendered as string[]

      if (name === 'sqrt' && list.length === 1) return element('msqrt', list[0] ?? '')
      if (name === 'cbrt' && list.length === 1) {
        return element('mroot', (list[0] ?? '') + element('mn', '3'))
      }
      if (name === 'nthRoot' && list.length === 2) {
        // mathjs: nthRoot(Wert, Grad) — in MathML steht der Grad **vorn**.
        return element('mroot', (list[0] ?? '') + (list[1] ?? ''))
      }
      if (name === 'factorial' && list.length === 1) {
        return element('mrow', (list[0] ?? '') + element('mo', '!'))
      }
      if (name === 'abs' && list.length === 1) {
        return element('mrow', element('mo', '|') + (list[0] ?? '') + element('mo', '|'))
      }
      if (name === 'percent' && list.length === 1) {
        return element('mrow', (list[0] ?? '') + element('mo', '%'))
      }
      if (!name) return null
      const head = element('mi', escapeText(name), ' mathvariant="normal"')
      const parameters = list
        .map((entry, index) => (index > 0 ? element('mo', ',') + entry : entry))
        .join('')
      return element('mrow', head + element('mo', '(') + parameters + element('mo', ')'))
    }
    default:
      // Unbekannte Form: lieber der rohe Term als eine falsche Formel.
      return null
  }
}
