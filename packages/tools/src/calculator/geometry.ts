/**
 * Kern des Werkzeugs „Geometrie" (Welle 3 der Suite „Rechnen").
 *
 * Schulformeln der euklidischen Geometrie — **keine Bibliothek, keine neue Abhängigkeit**.
 * Gerechnet wird mit `Math` in Gleitkomma: Maße sind Messwerte, keine Geldbeträge; eine
 * Genauigkeit von 15 Stellen liegt weit über jeder Baumaßtoleranz. Wo ein Ergebnis gerundet
 * angezeigt wird, steht das in der Oberfläche.
 *
 * Keine Anzeigetexte: Feld- und Ergebnisnamen sind Bezeichner (`a`, `area`, `volume`), die
 * Beschriftungen kommen aus den Sprachkatalogen. Die Formelzeichen je Ergebniszeile sind
 * Mathematik und stehen deshalb hier — sie sind der Rechenweg, den die Oberfläche zeigt.
 */

export type GeometryUnit = 'length' | 'area' | 'volume' | 'angle' | 'count'

export interface GeometryField {
  /** Bezeichner des Eingabefelds, zugleich Schlüssel im Eingabeobjekt. */
  readonly id: string
  /** Beschriftungsschlüssel im Sprachkatalog. */
  readonly labelKey: string
  readonly unit: GeometryUnit
  /** Fester Wert statt Eingabe (etwa die Seitenzahl eines Achtecks). */
  readonly constant?: number
}

export interface GeometryOutput {
  readonly key: string
  readonly labelKey: string
  readonly value: number
  readonly unit: GeometryUnit
  /** Rechenweg in Formelzeichen, etwa `A = a · b`. */
  readonly formula: string
}

export interface GeometryShape {
  readonly id: string
  readonly titleKey: string
  readonly inputs: readonly GeometryField[]
  readonly compute: (input: Readonly<Record<string, number>>) => readonly GeometryOutput[]
}

const AREA = 'area'
const PERIMETER = 'perimeter'
const VOLUME = 'volume'
const SURFACE = 'surface'
const DIAGONAL = 'diagonal'

function out(key: string, value: number, unit: GeometryUnit, formula: string): GeometryOutput {
  return { key, labelKey: `tool.geometry.out.${key}`, value, unit, formula }
}

function length(id: string): GeometryField {
  return { id, labelKey: `tool.geometry.field.${id}`, unit: 'length' }
}

/** Alle angebotenen Formen. Reihenfolge = Reihenfolge in der Oberfläche. */
export const geometryShapes: readonly GeometryShape[] = [
  {
    id: 'rectangle',
    titleKey: 'tool.geometry.shape.rectangle',
    inputs: [length('a'), length('b')],
    compute: ({ a = Number.NaN, b = Number.NaN }) => [
      out(AREA, a * b, 'area', 'A = a · b'),
      out(PERIMETER, 2 * (a + b), 'length', 'U = 2 · (a + b)'),
      out(DIAGONAL, Math.hypot(a, b), 'length', 'd = √(a² + b²)')
    ]
  },
  {
    id: 'square',
    titleKey: 'tool.geometry.shape.square',
    inputs: [length('a')],
    compute: ({ a = Number.NaN }) => [
      out(AREA, a * a, 'area', 'A = a²'),
      out(PERIMETER, 4 * a, 'length', 'U = 4 · a'),
      out(DIAGONAL, a * Math.SQRT2, 'length', 'd = a · √2')
    ]
  },
  {
    id: 'triangle',
    titleKey: 'tool.geometry.shape.triangle',
    inputs: [length('g'), length('h')],
    compute: ({ g = Number.NaN, h = Number.NaN }) => [
      out(AREA, (g * h) / 2, 'area', 'A = g · h / 2')
    ]
  },
  {
    id: 'rightTriangle',
    titleKey: 'tool.geometry.shape.rightTriangle',
    inputs: [length('a'), length('b')],
    compute: ({ a = Number.NaN, b = Number.NaN }) => [
      out('hypotenuse', Math.hypot(a, b), 'length', 'c = √(a² + b²)'),
      out(AREA, (a * b) / 2, 'area', 'A = a · b / 2'),
      out(PERIMETER, a + b + Math.hypot(a, b), 'length', 'U = a + b + c')
    ]
  },
  {
    id: 'circle',
    titleKey: 'tool.geometry.shape.circle',
    inputs: [length('r')],
    compute: ({ r = Number.NaN }) => [
      out(AREA, Math.PI * r * r, 'area', 'A = π · r²'),
      out(PERIMETER, 2 * Math.PI * r, 'length', 'U = 2 · π · r'),
      out('diameter', 2 * r, 'length', 'd = 2 · r')
    ]
  },
  {
    id: 'annulus',
    titleKey: 'tool.geometry.shape.annulus',
    inputs: [length('R'), length('r')],
    compute: ({ R = Number.NaN, r = Number.NaN }) => [
      out(AREA, Math.PI * (R * R - r * r), 'area', 'A = π · (R² − r²)'),
      out(PERIMETER, 2 * Math.PI * (R + r), 'length', 'U = 2 · π · (R + r)')
    ]
  },
  {
    id: 'trapezoid',
    titleKey: 'tool.geometry.shape.trapezoid',
    inputs: [length('a'), length('c'), length('h')],
    compute: ({ a = Number.NaN, c = Number.NaN, h = Number.NaN }) => [
      out(AREA, ((a + c) / 2) * h, 'area', 'A = (a + c) / 2 · h')
    ]
  },
  {
    id: 'parallelogram',
    titleKey: 'tool.geometry.shape.parallelogram',
    inputs: [length('a'), length('b'), length('h')],
    compute: ({ a = Number.NaN, b = Number.NaN, h = Number.NaN }) => [
      out(AREA, a * h, 'area', 'A = a · h'),
      out(PERIMETER, 2 * (a + b), 'length', 'U = 2 · (a + b)')
    ]
  },
  {
    id: 'rhombus',
    titleKey: 'tool.geometry.shape.rhombus',
    inputs: [length('e'), length('f')],
    compute: ({ e = Number.NaN, f = Number.NaN }) => [
      out(AREA, (e * f) / 2, 'area', 'A = e · f / 2'),
      out(PERIMETER, 4 * Math.hypot(e / 2, f / 2), 'length', 'U = 4 · √((e/2)² + (f/2)²)')
    ]
  },
  {
    id: 'regularPolygon',
    titleKey: 'tool.geometry.shape.regularPolygon',
    inputs: [length('s'), { id: 'n', labelKey: 'tool.geometry.field.n', unit: 'count' }],
    compute: ({ s = Number.NaN, n = Number.NaN }) => [
      out(AREA, (n * s * s) / (4 * Math.tan(Math.PI / n)), 'area', 'A = n · s² / (4 · tan(π/n))'),
      out(PERIMETER, n * s, 'length', 'U = n · s')
    ]
  },
  {
    id: 'cuboid',
    titleKey: 'tool.geometry.shape.cuboid',
    inputs: [length('a'), length('b'), length('c')],
    compute: ({ a = Number.NaN, b = Number.NaN, c = Number.NaN }) => [
      out(VOLUME, a * b * c, 'volume', 'V = a · b · c'),
      out(SURFACE, 2 * (a * b + a * c + b * c), 'area', 'O = 2 · (a·b + a·c + b·c)'),
      out(DIAGONAL, Math.hypot(a, b, c), 'length', 'd = √(a² + b² + c²)')
    ]
  },
  {
    id: 'cube',
    titleKey: 'tool.geometry.shape.cube',
    inputs: [length('a')],
    compute: ({ a = Number.NaN }) => [
      out(VOLUME, a * a * a, 'volume', 'V = a³'),
      out(SURFACE, 6 * a * a, 'area', 'O = 6 · a²'),
      out(DIAGONAL, a * Math.sqrt(3), 'length', 'd = a · √3')
    ]
  },
  {
    id: 'cylinder',
    titleKey: 'tool.geometry.shape.cylinder',
    inputs: [length('r'), length('h')],
    compute: ({ r = Number.NaN, h = Number.NaN }) => [
      out(VOLUME, Math.PI * r * r * h, 'volume', 'V = π · r² · h'),
      out(SURFACE, 2 * Math.PI * r * (r + h), 'area', 'O = 2 · π · r · (r + h)'),
      out('lateral', 2 * Math.PI * r * h, 'area', 'M = 2 · π · r · h')
    ]
  },
  {
    id: 'cone',
    titleKey: 'tool.geometry.shape.cone',
    inputs: [length('r'), length('h')],
    compute: ({ r = Number.NaN, h = Number.NaN }) => {
      const s = Math.hypot(r, h)
      return [
        out('slant', s, 'length', 's = √(r² + h²)'),
        out(VOLUME, (Math.PI * r * r * h) / 3, 'volume', 'V = π · r² · h / 3'),
        out(SURFACE, Math.PI * r * (r + s), 'area', 'O = π · r · (r + s)')
      ]
    }
  },
  {
    id: 'pyramid',
    titleKey: 'tool.geometry.shape.pyramid',
    inputs: [length('a'), length('h')],
    compute: ({ a = Number.NaN, h = Number.NaN }) => {
      const hs = Math.hypot(h, a / 2)
      return [
        out('slant', hs, 'length', 'hs = √(h² + (a/2)²)'),
        out(VOLUME, (a * a * h) / 3, 'volume', 'V = a² · h / 3'),
        out(SURFACE, a * a + 2 * a * hs, 'area', 'O = a² + 2 · a · hs')
      ]
    }
  },
  {
    id: 'sphere',
    titleKey: 'tool.geometry.shape.sphere',
    inputs: [length('r')],
    compute: ({ r = Number.NaN }) => [
      out(VOLUME, (4 / 3) * Math.PI * r * r * r, 'volume', 'V = 4/3 · π · r³'),
      out(SURFACE, 4 * Math.PI * r * r, 'area', 'O = 4 · π · r²')
    ]
  }
]

/** Formen für die Auswahl in der Oberfläche, nach Kennung. */
export function geometryShapeById(id: string): GeometryShape | undefined {
  return geometryShapes.find((shape) => shape.id === id)
}

/**
 * Rundet für die Anzeige auf zwölf gültige Stellen. Gleitkomma liefert sonst Werte wie
 * `28.274333882308138` — für ein Maß ist `28.274333882308` die ehrlichere Zahl: die Abweichung
 * liegt weit unterhalb jeder Messgenauigkeit, die Zahl bleibt aber nachrechenbar.
 */
export function roundForDisplay(value: number, digits = 12): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (digits - 1 - exponent)
  return Math.round(value * factor) / factor
}

/** Einheitenzeichen je Größe — sprachneutral. */
export const geometryUnitSymbols: Readonly<Record<GeometryUnit, string>> = {
  length: 'm',
  area: 'm²',
  volume: 'm³',
  angle: '°',
  count: ''
}
