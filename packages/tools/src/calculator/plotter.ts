/**
 * Funktionsplotter für das Werkzeug „Funktionsplotter" (Welle 5 der Suite „Rechnen").
 *
 * **Eigener Zeichner statt `function-plot`** — aus einem Lizenzgrund, nicht aus Bequemlichkeit:
 * Die Engine zieht `interval-arithmetic` mit, das unter **BSL-1.0** steht. Diese Lizenz ist in
 * der Projektpolitik weder freigegeben noch geprüft („unreviewed"), und die Lizenzordnung wird
 * nicht nebenbei geändert. Der Zeichner ist deshalb selbst gebaut: Er erzeugt reine **Geometrie**
 * (Punkte, Achsen, Beschriftungen), die Oberfläche setzt daraus SVG zusammen.
 *
 * Der Nebeneffekt ist willkommen: keine 64 KiB Engine, kein zusätzlicher Chunk, und die Zeichnung
 * ist ohne Browser prüfbar, weil hier nur Zahlen entstehen.
 *
 * **Wertetabelle und Nullstellen rechnet der Rechenkern** — nicht ein zweiter Ausdrucksauswerter.
 * Sonst gäbe es zwei Rechenwege für denselben Ausdruck, die sich unterscheiden können.
 *
 * **Nullstellen** werden über Vorzeichenwechsel auf einem Raster gesucht und mit Bisektion
 * verfeinert. Eine Stelle gilt nur dann als Nullstelle, wenn der Funktionswert dort klein bleibt
 * — ein Vorzeichenwechsel an einer **Polstelle** (etwa 1/x) ist keine Nullstelle.
 */
import { evaluate } from './core'

/** Standardfarbe, wenn keine angegeben ist — ein Test braucht keine Farben. */
export const defaultCurveColor = '#c91f2c'

export interface PlotCurve {
  readonly expression: string
  readonly color?: string
}

export interface PlotOptions {
  readonly xMin: number
  readonly xMax: number
  readonly yMin?: number
  readonly yMax?: number
}

export interface SampleRow {
  readonly x: number
  readonly values: readonly (number | null)[]
}

export interface PlotRoot {
  /** Index der Kurve in der übergebenen Liste. */
  readonly curve: number
  readonly x: number
  readonly y: number
}

export interface PlotPoint {
  readonly x: number
  readonly y: number
}

/** Ein Kurvenzug in Zeichenkoordinaten (0…width, 0…height). */
export interface PlotPath {
  readonly color: string
  readonly expression: string
  /** Zusammenhängende Abschnitte — an nicht definierten Stellen wird die Linie unterbrochen. */
  readonly segments: readonly (readonly PlotPoint[])[]
  readonly hasValues: boolean
}

export interface PlotGeometry {
  readonly width: number
  readonly height: number
  readonly bounds: { readonly xMin: number; readonly xMax: number; readonly yMin: number; readonly yMax: number }
  readonly paths: readonly PlotPath[]
  /** Gitterlinien mit Wert — in Zeichenkoordinaten. */
  readonly grid: readonly { readonly axis: 'x' | 'y'; readonly position: number; readonly value: number }[]
  readonly xLabels: readonly { readonly x: number; readonly label: string }[]
  readonly yLabels: readonly { readonly y: number; readonly label: string }[]
  /** Lage der x-Achse (y = 0) in Zeichenkoordinaten, gekappt auf den Zeichenbereich. */
  readonly zeroLine: number
}

const DEFAULT_WIDTH = 720
const DEFAULT_HEIGHT = 420
const PADDING = { left: 46, right: 14, top: 14, bottom: 28 }

/** Funktionswert über den Rechenkern. `null` heißt: an dieser Stelle nicht definiert. */
export function valueAt(expression: string, x: number): number | null {
  const result = evaluate(expression.replace(/x/gu, `(${x})`), { number: 'BigNumber' })
  if (!result.ok) return null
  const value = Number(result.display)
  return Number.isFinite(value) ? value : null
}

/** Wertetabelle über den angeforderten Bereich. */
export function sampleTable(curves: readonly PlotCurve[], options: PlotOptions, rows = 21): SampleRow[] {
  if (!(options.xMax > options.xMin) || rows < 2) return []
  const step = (options.xMax - options.xMin) / (rows - 1)
  const table: SampleRow[] = []
  for (let index = 0; index < rows; index += 1) {
    const x = options.xMin + step * index
    table.push({
      x: Math.round(x * 1e10) / 1e10,
      values: curves.map((curve) => {
        const value = valueAt(curve.expression, x)
        return value === null ? null : Math.round(value * 1e10) / 1e10
      })
    })
  }
  return table
}

/** Bisektion zwischen zwei Stützstellen mit Vorzeichenwechsel. */
function bisect(expression: string, left: number, right: number): number | null {
  const fLeft = valueAt(expression, left)
  const fRight = valueAt(expression, right)
  if (fLeft === null || fRight === null) return null
  if (fLeft === 0) return left
  if (fRight === 0) return right
  if (fLeft * fRight > 0) return null

  let low = left
  let high = right
  let fLow = fLeft
  for (let step = 0; step < 80; step += 1) {
    const middle = (low + high) / 2
    const fMiddle = valueAt(expression, middle)
    if (fMiddle === null) return null
    if (fMiddle === 0) return middle
    if (fLow * fMiddle < 0) { high = middle } else { low = middle; fLow = fMiddle }
  }
  return (low + high) / 2
}

/**
 * Nullstellen aller Kurven im Bereich. Zwei Bedingungen müssen erfüllt sein: der Wert an der Stelle
 * ist betragsmäßig klein **und** links und rechts hat der Wert verschiedene Vorzeichen (oder die
 * Stelle trifft exakt).
 */
export function findRoots(curves: readonly PlotCurve[], options: PlotOptions, rows = 200): PlotRoot[] {
  const step = (options.xMax - options.xMin) / rows
  if (!(step > 0)) return []
  const roots: PlotRoot[] = []
  curves.forEach((curve, curveIndex) => {
    let previous = valueAt(curve.expression, options.xMin)
    let previousX = options.xMin
    for (let index = 1; index <= rows; index += 1) {
      const x = options.xMin + step * index
      const current = valueAt(curve.expression, x)
      // Zwei Fälle sind Nullstellen: ein Vorzeichenwechsel zwischen zwei Stützstellen **und** ein
      // exakter Treffer auf einer Stützstelle. Ohne den zweiten Fall wird eine Wurzel wie
      // f(-2) = 0 genau dann übersehen, wenn das Raster sie zufällig trifft.
      const exactHit = current === 0 ? x : null
      if (exactHit !== null || (previous !== null && current !== null && previous * current < 0)) {
        const zero = exactHit ?? bisect(curve.expression, previousX, x)
        if (zero !== null) {
          const y = valueAt(curve.expression, zero)
          // Polstellenprüfung: Bei einem Pol wächst der Betrag in der Nähe stark an.
          const neighbourhood = Math.max(
            Math.abs(valueAt(curve.expression, zero - step / 4) ?? Number.POSITIVE_INFINITY),
            Math.abs(valueAt(curve.expression, zero + step / 4) ?? Number.POSITIVE_INFINITY)
          )
          const scale = Math.max(1, Math.abs(options.yMax ?? 1), Math.abs(options.yMin ?? 1))
          if (y !== null && Math.abs(y) < 1e-6 && neighbourhood < scale * 100) {
            roots.push({ curve: curveIndex, x: Math.round(zero * 1e10) / 1e10, y: Math.round(y * 1e10) / 1e10 })
          }
        }
      }
      previous = current
      previousX = x
    }
  })
  return roots
}

/** „Schöne" Achsenschritte: 1, 2 oder 5 mal eine Zehnerpotenz. */
export function niceTicks(min: number, max: number, target = 6): number[] {
  if (!(max > min)) return []
  const rough = (max - min) / target
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) * magnitude
  const ticks: number[] = []
  const start = Math.ceil(min / step) * step
  for (let value = start; value <= max + step / 1000; value += step) {
    ticks.push(Math.abs(value) < step / 1000 ? 0 : Math.round(value * 1e10) / 1e10)
    if (ticks.length > 40) break
  }
  return ticks
}

function formatTick(value: number): string {
  if (value === 0) return '0'
  const magnitude = Math.abs(value)
  if (magnitude >= 1e5 || magnitude < 1e-3) return value.toExponential(1)
  return String(Math.round(value * 1000) / 1000)
}

/**
 * Rechnet Kurven und Achsen in Zeichenkoordinaten um. Ohne y-Grenzen wird der sichtbare
 * Wertebereich aus den Stichproben bestimmt (mit einem kleinen Rand) — so bleibt eine Kurve im
 * Bild, statt aus dem Ausschnitt zu laufen.
 */
export function buildGeometry(
  curves: readonly PlotCurve[],
  options: PlotOptions,
  rows = 400,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT
): PlotGeometry {
  const xMin = options.xMin
  const xMax = options.xMax
  const samples = Math.max(2, rows)
  const step = (xMax - xMin) / samples

  const series = curves.map((curve) => {
    const points: { x: number; y: number | null }[] = []
    for (let index = 0; index <= samples; index += 1) {
      const x = xMin + step * index
      points.push({ x, y: valueAt(curve.expression, x) })
    }
    return { curve, points }
  })

  let yMin = options.yMin ?? Number.NaN
  let yMax = options.yMax ?? Number.NaN
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    const values = series
      .flatMap((item) => item.points.map((point) => point.y))
      .filter((value): value is number => value !== null && Number.isFinite(value))
    const low = values.length ? Math.min(...values) : -1
    const high = values.length ? Math.max(...values) : 1
    const span = high - low || 1
    if (!Number.isFinite(options.yMin)) yMin = low - span * 0.08
    if (!Number.isFinite(options.yMax)) yMax = high + span * 0.08
  }
  if (!(yMax > yMin)) { yMin -= 1; yMax += 1 }

  const plotWidth = width - PADDING.left - PADDING.right
  const plotHeight = height - PADDING.top - PADDING.bottom
  const toScreenX = (x: number) => PADDING.left + ((x - xMin) / (xMax - xMin)) * plotWidth
  const toScreenY = (y: number) => PADDING.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight

  const paths: PlotPath[] = series.map(({ curve, points }) => {
    const segments: PlotPoint[][] = []
    let current: PlotPoint[] = []
    for (const point of points) {
      if (point.y === null || !Number.isFinite(point.y)) {
        if (current.length > 1) segments.push(current)
        current = []
        continue
      }
      // Werte weit außerhalb des Ausschnitts werden gekappt, damit die Linie nicht „ausläuft".
      const clamped = Math.min(Math.max(point.y, yMin - (yMax - yMin)), yMax + (yMax - yMin))
      current.push({ x: toScreenX(point.x), y: toScreenY(clamped) })
    }
    if (current.length > 1) segments.push(current)
    return { color: curve.color ?? defaultCurveColor, expression: curve.expression, segments, hasValues: segments.length > 0 }
  })

  const xTicks = niceTicks(xMin, xMax)
  const yTicks = niceTicks(yMin, yMax)
  const grid: PlotGeometry['grid'] = [
    ...xTicks.map((value) => ({ axis: 'x' as const, position: toScreenX(value), value })),
    ...yTicks.map((value) => ({ axis: 'y' as const, position: toScreenY(value), value }))
  ]

  return {
    width,
    height,
    bounds: { xMin, xMax, yMin, yMax },
    paths,
    grid,
    xLabels: xTicks.map((value) => ({ x: toScreenX(value), label: formatTick(value) })),
    yLabels: yTicks.map((value) => ({ y: toScreenY(value), label: formatTick(value) })),
    zeroLine: Math.min(Math.max(toScreenY(0), PADDING.top), height - PADDING.bottom)
  }
}

/** Ein Kurvenzug als SVG-Pfad (`M x y L x y …`). */
export function segmentToPath(segment: readonly PlotPoint[]): string {
  return segment.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
}

export const plotPadding = PADDING
