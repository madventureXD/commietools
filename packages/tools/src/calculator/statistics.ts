/**
 * Statistik für das Werkzeug „Statistik" (Welle 5 der Suite „Rechnen").
 *
 * **Eigene Formeln, keine Abhängigkeit.** Mittelwert, Streuung, Quartile, Korrelation und
 * Regression sind wenige Zeilen Mathematik — eine Statistikbibliothek (`simple-statistics`,
 * ISC) wäre bequem, aber ein Paket mehr im Prüflauf für vier Formeln.
 *
 * **Zwei Streuungen, beide sichtbar:** Die Varianz der **Stichprobe** (Nenner n−1) und die der
 * **Grundgesamtheit** (Nenner n) unterscheiden sich — wer nur eine zeigt, erzeugt genau den
 * Fehler, den Nutzer dann nicht nachvollziehen können. Beide stehen deshalb im Ergebnis.
 *
 * **Quartile nach linearer Interpolation** (Typ 7, wie `QUANTIL` in Tabellenkalkulationen):
 * Bei n Werten liegt das p-Quantil bei Position (n−1)·p, zwischen zwei Werten wird interpoliert.
 * Andere Verfahren liefern andere Zahlen — die Methode steht deshalb im Ergebnis.
 *
 * Gerechnet wird in Gleitkomma. Für die Streuung gibt es eine **numerisch stabile** Form
 * (Summe der Abweichungsquadrate um den Mittelwert) — die Kurzform `Σx² − n·x̄²` kann bei
 * großen Zahlen mit kleiner Streuung das Vorzeichen verlieren.
 */

export interface StatisticsResult {
  readonly ok: boolean
  readonly values: Readonly<Record<string, number>>
  /** Anzahl der ausgewerteten Werte. */
  readonly count: number
  readonly ignored: readonly string[]
  readonly error: 'empty' | 'invalid' | 'range' | null
}

/**
 * Grammatik eines Eingabetokens: eine **vollständige** Zahl mit optionalem Vorzeichen,
 * genau **einem** Dezimaltrennzeichen (Punkt **oder** Komma) und optionalem Exponenten.
 *
 * Bewusst eng: Ein Token gilt nur als Zahl, wenn es ganz eine ist. Dadurch wird die
 * mehrdeutige Kommaliste `1,2` nicht geraten (sie bleibt eine Dezimalzahl) und eine
 * gemischte Gruppierung wie `1.234,56` wird **gemeldet** statt falsch gelesen. Ebenso
 * bleibt `gcd(12,18)` unangetastet — es wird nicht zu `gcd(12.18)` verbogen.
 */
const ZAHLENTOKEN = /^[+-]?\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?$/u

/**
 * Liest Zahlen aus freiem Text: Zeilenumbrüche, Semikolons und Leerzeichen trennen die
 * Werte; Punkt oder Komma ist das Dezimaltrennzeichen **innerhalb** eines Wertes.
 * Nicht lesbare Stücke werden **gemeldet**, nicht stillschweigend verworfen.
 */
export function parseNumbers(text: string): { numbers: number[]; ignored: string[] } {
  const chunks = text.split(/[\s;]+/u).map((chunk) => chunk.trim()).filter(Boolean)
  const numbers: number[] = []
  const ignored: string[] = []
  for (const chunk of chunks) {
    if (!ZAHLENTOKEN.test(chunk)) { ignored.push(chunk); continue }
    const value = Number(chunk.replace(',', '.'))
    if (Number.isFinite(value)) numbers.push(value)
    else ignored.push(chunk)
  }
  return { numbers, ignored }
}

/** Datenpaare aus Zeilen der Form `x ; y` (oder `x y`, `x,y`). */
export function parsePairs(text: string): { pairs: Array<readonly [number, number]>; ignored: string[] } {
  const pairs: Array<readonly [number, number]> = []
  const ignored: string[] = []
  for (const line of text.split(/\r?\n|;/u).map((item) => item.trim()).filter(Boolean)) {
    const parts = line.split(/[\s,;]+/u).map((item) => item.trim()).filter(Boolean)
    if (parts.length !== 2) {
      ignored.push(line)
      continue
    }
    const x = Number(parts[0])
    const y = Number(parts[1])
    if (Number.isFinite(x) && Number.isFinite(y)) pairs.push([x, y])
    else ignored.push(line)
  }
  return { pairs, ignored }
}

function sorted(numbers: readonly number[]): number[] {
  return [...numbers].sort((left, right) => left - right)
}

/** p-Quantil nach linearer Interpolation (Typ 7). */
export function quantile(numbers: readonly number[], p: number): number {
  if (!numbers.length) return Number.NaN
  const values = sorted(numbers)
  const position = (values.length - 1) * p
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  const low = values[lower] ?? 0
  const high = values[upper] ?? low
  return low + (high - low) * (position - lower)
}

export function summarise(text: string): StatisticsResult {
  const { numbers, ignored } = parseNumbers(text)
  if (!numbers.length) {
    return { ok: false, values: {}, count: 0, ignored, error: ignored.length ? 'invalid' : 'empty' }
  }
  const values = sorted(numbers)
  const count = values.length
  const sum = values.reduce((total, value) => total + value, 0)
  const mean = sum / count
  const median = quantile(values, 0.5)
  const q1 = quantile(values, 0.25)
  const q3 = quantile(values, 0.75)
  const iqr = q3 - q1

  // Stabile Streuung: Summe der Abweichungsquadrate um den Mittelwert.
  const sumSquares = values.reduce((total, value) => total + (value - mean) ** 2, 0)
  const variancePopulation = sumSquares / count
  const varianceSample = count > 1 ? sumSquares / (count - 1) : Number.NaN

  const frequencies = new Map<number, number>()
  for (const value of values) frequencies.set(value, (frequencies.get(value) ?? 0) + 1)
  const top = Math.max(...frequencies.values())
  const modes = top > 1 ? [...frequencies.entries()].filter(([, frequency]) => frequency === top).map(([value]) => value) : []

  return {
    ok: true,
    values: {
      count,
      sum: round(sum),
      mean: round(mean),
      median: round(median),
      q1: round(q1),
      q3: round(q3),
      iqr: round(iqr),
      min: round(values[0] ?? Number.NaN),
      max: round(values[count - 1] ?? Number.NaN),
      range: round((values[count - 1] ?? 0) - (values[0] ?? 0)),
      variancePopulation: round(variancePopulation),
      varianceSample: round(varianceSample),
      deviationPopulation: round(Math.sqrt(variancePopulation)),
      deviationSample: round(Math.sqrt(varianceSample)),
      lowerFence: round(q1 - 1.5 * iqr),
      upperFence: round(q3 + 1.5 * iqr),
      modeCount: modes.length,
      modes: modes.length ? modes[0] ?? Number.NaN : Number.NaN
    },
    count,
    ignored,
    error: null
  }
}

/**
 * Pearson-Korrelation und lineare Regression (Methode der kleinsten Quadrate).
 * r² ist das Bestimmtheitsmaß — der Anteil der Streuung, den die Gerade erklärt.
 */
export function regress(text: string): StatisticsResult & { slope: number; intercept: number; correlation: number; rSquared: number } {
  const { pairs, ignored } = parsePairs(text)
  const empty = { slope: Number.NaN, intercept: Number.NaN, correlation: Number.NaN, rSquared: Number.NaN }
  if (pairs.length < 2) {
    return { ok: false, values: {}, count: pairs.length, ignored, error: pairs.length ? 'range' : 'empty', ...empty }
  }
  const n = pairs.length
  const meanX = pairs.reduce((total, [x]) => total + x, 0) / n
  const meanY = pairs.reduce((total, [, y]) => total + y, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (const [x, y] of pairs) {
    sxy += (x - meanX) * (y - meanY)
    sxx += (x - meanX) ** 2
    syy += (y - meanY) ** 2
  }
  if (sxx === 0 || syy === 0) {
    return { ok: false, values: {}, count: n, ignored, error: 'range', ...empty }
  }
  const slope = sxy / sxx
  const intercept = meanY - slope * meanX
  const correlation = sxy / Math.sqrt(sxx * syy)
  const rSquared = correlation ** 2
  return {
    ok: true,
    values: {
      count: n,
      meanX: round(meanX),
      meanY: round(meanY),
      slope: round(slope),
      intercept: round(intercept),
      correlation: round(correlation),
      rSquared: round(rSquared),
      sumX: round(pairs.reduce((total, [x]) => total + x, 0)),
      sumY: round(pairs.reduce((total, [, y]) => total + y, 0))
    },
    count: n,
    ignored,
    error: null,
    slope,
    intercept,
    correlation,
    rSquared
  }
}

/** Regressionsgerade als Text in Formelzeichen. */
export function regressionText(slope: number, intercept: number): string {
  const sign = intercept < 0 ? '−' : '+'
  return `y = ${round(slope)} x ${sign} ${round(Math.abs(intercept))}`
}

function round(value: number): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const factor = 10 ** (12 - 1 - Math.floor(Math.log10(Math.abs(value))))
  return Math.round(value * factor) / factor
}
