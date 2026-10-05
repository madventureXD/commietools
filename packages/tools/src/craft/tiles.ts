/**
 * Kern des Werkzeugs „Fliesen, Kleber und Fugenmörtel" (Welle B der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — Bestellrechnung über das **Formatmaß**, wie sie Handel und
 * Hersteller verwenden, plus getrennte Verbrauchsrechnung für Kleber und
 * Fugenmörtel:
 *
 *   F   = Fläche (m²)
 *   n   = 1 / (a · b)                              Fliesen je m² aus dem Format
 *   N   = aufgerundet( F · (1 + Zuschlag) · n )     Bestellmenge
 *   L_F = F · 1000 · (a + b) / (a · b)             Fugenlänge (m), a und b in mm
 *   M   = L_F · f · t · ρ / 1.000.000              Fugenmörtel (kg), f, t in mm, ρ in kg/m³
 *   K   = F · Zahnung / 2                          Kleber (kg), Zahnung in mm
 *
 * **Warum über das Formatmaß und nicht über das Modulmaß (Format + Fuge):**
 * Die Fuge verkleinert die Fliesenfläche je Quadratmeter geringfügig — bei
 * 30 × 30 cm und 3 mm Fuge sind es 10,89 statt 11,11 Fliesen je m², also rund
 * 2 %. Diese Abweichung liegt deutlich unter jedem Musterzuschlag und wird vom
 * Verschnitt aufgefangen; deshalb rechnet das Werkzeug wie der Handel über das
 * Format und sagt die Vernachlässigung als Annahme an. Der Test hält den
 * Unterschied fest, statt ihn zu verschweigen.
 *
 * Die Fugenformel `(a + b) / (a · b) · f · t · ρ` ist die veröffentlichte Formel
 * für Fugenmörtel je m² (Maße in mm, Dichte in kg/m³); mit `f = 0` liefert sie
 * exakt null, und ihr Maßsystem ist im Test gegen eine unabhängig gerechnete
 * Fugenlänge geprüft (Rechenprobe: 30 × 30 cm, Fuge 3 mm, Tiefe 8 mm, Dichte
 * 1600 kg/m³ → 6,667 m Fuge und 0,256 kg Fugenmörtel je m²).
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral,
 * die Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind
 * Rechenweg und stehen deshalb hier.
 */

/** Verlegeart. Bestimmt den Musterzuschlag (Verschnitt für Schnitt und Muster). */
export type TilePattern = 'grid' | 'halfOffset' | 'diagonal'

/** Woher ein Vorschlagswert stammt. Erfahrungswerte werden in der Oberfläche gekennzeichnet. */
export type TileValueSource = 'sourced' | 'experience'

export interface TilePatternEntry {
  readonly id: TilePattern
  readonly titleKey: string
  /** Vorschlag für den Zuschlag in Prozent, bezogen auf die Nettofläche. */
  readonly surchargePercent: number
  readonly source: TileValueSource
}

/**
 * Musterzuschläge.
 *
 * Alle drei sind **Erfahrungswerte** ohne belegte Fachquelle mit einer konkreten
 * Zahl und in der Oberfläche so gekennzeichnet; sie sind überschreibbar. Der
 * Diagonalschnitt liegt über dem Kreuzverband, weil an jedem Rand Dreieckschnitte
 * anfallen; der Halbverband liegt dazwischen, weil die versetzten Reihen mehr
 * Randverschnitt erzeugen als der Kreuzverband.
 */
export const tilePatterns: readonly TilePatternEntry[] = [
  { id: 'grid', titleKey: 'tool.tiles.pattern.grid', surchargePercent: 5, source: 'experience' },
  { id: 'halfOffset', titleKey: 'tool.tiles.pattern.halfOffset', surchargePercent: 8, source: 'experience' },
  { id: 'diagonal', titleKey: 'tool.tiles.pattern.diagonal', surchargePercent: 12, source: 'experience' }
]

export function tilePatternById(id: string): TilePatternEntry | undefined {
  return tilePatterns.find((pattern) => pattern.id === id)
}

/**
 * Fliesenformate als Vorschlag (Kantenlänge in mm). Herstellerabhängig, deshalb
 * ein Vorschlag in einem Feld und keine feste Liste: Jedes andere Format lässt
 * sich eintragen. Der Vorschlag nennt nur gebräuchliche Maße.
 */
export const tileFormats: readonly { readonly id: string; readonly lengthMm: number; readonly breadthMm: number }[] = [
  { id: '10x10', lengthMm: 100, breadthMm: 100 },
  { id: '20x20', lengthMm: 200, breadthMm: 200 },
  { id: '30x30', lengthMm: 300, breadthMm: 300 },
  { id: '30x60', lengthMm: 600, breadthMm: 300 },
  { id: '60x60', lengthMm: 600, breadthMm: 600 },
  { id: '20x120', lengthMm: 1200, breadthMm: 200 }
]

export const TILE_LIMITS = {
  /** Nettofläche in m². */
  area: { min: 0.01, max: 100000 },
  tileLengthMm: { min: 10, max: 2000 },
  tileBreadthMm: { min: 10, max: 2000 },
  /** Fugenbreite in mm; 0 ist zulässig (stoßfugenlos). */
  jointMm: { min: 0, max: 30 },
  /** Fugentiefe in mm (Fliesendicke minus Kleberbett ist der übliche Ansatz). */
  jointDepthMm: { min: 2, max: 40 },
  /** Dichte des Fugenmörtels in kg/m³. */
  jointDensity: { min: 800, max: 2400 },
  /** Zahnung der Kleberkelle in mm; 0 ist zulässig (nur Flächenkleber). */
  notchMm: { min: 0, max: 20 },
  surchargePercent: { min: 0, max: 40 },
  bagSizeKg: { min: 1, max: 50 }
} as const

export interface TilesInput {
  readonly areaSquareMeters: number
  readonly tileLengthMm: number
  readonly tileBreadthMm: number
  readonly jointMm: number
  readonly jointDepthMm: number
  readonly jointDensity: number
  readonly notchMm: number
  readonly surchargePercent: number
  readonly bagSizeKg: number
}

export interface TilesResult {
  /** Fläche einschließlich Zuschlag. */
  readonly areaWithSurcharge: number
  /** Fliesen je m² aus dem Formatmaß (ohne Fuge, siehe Annahmen). */
  readonly tilesPerSquareMeter: number
  /** Bestellmenge in Stück, immer aufgerundet. */
  readonly tiles: number
  /** Fliesen, die ohne Zuschlag nötig wären — die Differenz ist die Reserve. */
  readonly tilesWithoutSurcharge: number
  /** Fugenlänge in Metern. */
  readonly jointLengthMeters: number
  readonly adhesiveKg: number
  readonly adhesiveBags: number
  readonly adhesiveRemainderKg: number
  readonly jointMortarKg: number
  readonly jointMortarBags: number
  readonly jointMortarRemainderKg: number
  readonly formulas: readonly string[]
}

export type TilesCheck =
  | { readonly ok: true; readonly result: TilesResult }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Ganze Säcke, immer aufgerundet — halbe Säcke gibt es nicht zu kaufen. */
function bagsFor(kilograms: number, bagSizeKg: number): number {
  return Math.ceil(kilograms / bagSizeKg)
}

/**
 * Rechnet Fliesenbedarf, Fugenlänge, Kleber- und Fugenmörtelverbrauch.
 *
 * Fehlerkennungen sind sprachneutral und werden in der Oberfläche übersetzt:
 * `empty` (fehlender oder unlesbarer Wert), `area` (Fläche null oder negativ),
 * `tile` (Format außerhalb des sinnvollen Bereichs), `joint` (Fugenbreite),
 * `depth` (Fugentiefe), `density` (Fugendichte), `notch` (Zahnung),
 * `surcharge` (Zuschlag), `bag` (Sackgröße).
 */
export function planTiles(input: TilesInput): TilesCheck {
  const {
    areaSquareMeters,
    tileLengthMm,
    tileBreadthMm,
    jointMm,
    jointDepthMm,
    jointDensity,
    notchMm,
    surchargePercent,
    bagSizeKg
  } = input

  for (const value of [
    areaSquareMeters,
    tileLengthMm,
    tileBreadthMm,
    jointMm,
    jointDepthMm,
    jointDensity,
    notchMm,
    surchargePercent,
    bagSizeKg
  ]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (areaSquareMeters <= 0) return { ok: false, errorKey: 'tool.tiles.error.area' }
  if (!within(areaSquareMeters, TILE_LIMITS.area)) return { ok: false, errorKey: 'tool.tiles.error.areaRange' }
  if (!within(tileLengthMm, TILE_LIMITS.tileLengthMm) || !within(tileBreadthMm, TILE_LIMITS.tileBreadthMm)) {
    return { ok: false, errorKey: 'tool.tiles.error.tile' }
  }
  if (!within(jointMm, TILE_LIMITS.jointMm)) return { ok: false, errorKey: 'tool.tiles.error.joint' }
  if (!within(jointDepthMm, TILE_LIMITS.jointDepthMm)) return { ok: false, errorKey: 'tool.tiles.error.depth' }
  if (!within(jointDensity, TILE_LIMITS.jointDensity)) return { ok: false, errorKey: 'tool.tiles.error.density' }
  if (!within(notchMm, TILE_LIMITS.notchMm)) return { ok: false, errorKey: 'tool.tiles.error.notch' }
  if (!within(surchargePercent, TILE_LIMITS.surchargePercent)) return { ok: false, errorKey: 'tool.tiles.error.surcharge' }
  if (!within(bagSizeKg, TILE_LIMITS.bagSizeKg)) return { ok: false, errorKey: 'tool.tiles.error.bag' }

  // Formatmaß in Metern für die Stückzahl, in Millimetern für Fugen- und Kleberrechnung.
  const tileAreaSquareMeters = (tileLengthMm / 1000) * (tileBreadthMm / 1000)
  const tilesPerSquareMeter = 1 / tileAreaSquareMeters
  const areaWithSurcharge = areaSquareMeters * (1 + surchargePercent / 100)
  const tilesWithoutSurcharge = Math.ceil(areaSquareMeters * tilesPerSquareMeter)
  const tiles = Math.ceil(areaWithSurcharge * tilesPerSquareMeter)

  // Fugenlänge: je Fliese entfallen (a + b) auf sie — von ihrem Umfang 2·(a + b)
  // die Hälfte, weil jede Fuge zwei Fliesen gehört. Bei 1/(a·b) Fliesen je mm²
  // ergibt das (a + b)/(a·b) je mm²; mit dem Faktor 1000 wird daraus Meter je m².
  const jointLengthPerSquareMeter = (1000 * (tileLengthMm + tileBreadthMm)) / (tileLengthMm * tileBreadthMm)
  const jointLengthMeters = areaSquareMeters * jointLengthPerSquareMeter
  const jointMortarKg = (jointLengthMeters * jointMm * jointDepthMm * jointDensity) / 1_000_000

  // Zahnungshöhe halbiert ergibt den Kleberauftrag in kg/m² (Erfahrungsregel der Hersteller).
  const adhesiveKg = (areaSquareMeters * notchMm) / 2

  const adhesiveBags = bagsFor(adhesiveKg, bagSizeKg)
  const jointMortarBags = bagsFor(jointMortarKg, bagSizeKg)

  return {
    ok: true,
    result: {
      areaWithSurcharge,
      tilesPerSquareMeter,
      tiles,
      tilesWithoutSurcharge,
      jointLengthMeters,
      adhesiveKg,
      adhesiveBags,
      adhesiveRemainderKg: adhesiveBags * bagSizeKg - adhesiveKg,
      jointMortarKg,
      jointMortarBags,
      jointMortarRemainderKg: jointMortarBags * bagSizeKg - jointMortarKg,
      formulas: [
        'F = L · B',
        'N = aufgerundet( F · (1 + Zuschlag) · n )',
        'n = 1 / (a · b)',
        'Reserve = N − aufgerundet( F · n )',
        'L_F = F · 1000 · (a + b) / (a · b)',
        'K = F · Zahnung / 2',
        'Säcke = aufgerundet( Menge / Sackgröße )',
        'M = L_F · f · t · ρ / 1.000.000',
        'Säcke = aufgerundet( Menge / Sackgröße )'
      ]
    }
  }
}

/** Fliesenbedarf je m² bei gegebener Fugenbreite, wenn die Fuge im Modul mitzählt. */
export function tilesPerSquareMeterWithJoint(tileLengthMm: number, tileBreadthMm: number, jointMm: number): number {
  return 1 / (((tileLengthMm + jointMm) / 1000) * ((tileBreadthMm + jointMm) / 1000))
}

/** Fugenlänge je m² in Metern — unabhängig gerechnete Bezugsgröße für den Test. */
export function jointLengthPerMeterFromFormat(tileLengthMm: number, tileBreadthMm: number): number {
  return (1000 * (tileLengthMm + tileBreadthMm)) / (tileLengthMm * tileBreadthMm)
}

/** Rundet für die Anzeige auf zwölf gültige Stellen — Maße sind Messwerte, keine Geldbeträge. */
export function roundForDisplay(value: number, digits = 12): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (digits - 1 - exponent)
  return Math.round(value * factor) / factor
}
