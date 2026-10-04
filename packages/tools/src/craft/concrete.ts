/**
 * Kern des Werkzeugs „Beton, Mörtel und Estrich" (Welle A der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — **Masseverfahren**, wie es auf der Baustelle und in der
 * Frischbeton-Bemessung üblich ist und das nachrechenbar bleibt:
 *
 *   V         = Volumen der Mischung, einschließlich Verschnitt
 *   Zement    = V · Zementgehalt
 *   Wasser    = Zement · Wasserzementwert
 *   Zuschlag  = V · Frischdichte − Zement − Wasser
 *
 * Die Massenbilanz geht damit immer auf:
 * `Zement + Wasser + Zuschlag = V · Frischdichte`. Genau das prüft der Test.
 * Eine Rechnung über Volumenteile („1 Teil Zement zu 4 Teilen Kies") wäre
 * mehrdeutig: Zement füllt die Hohlräume des Zuschlags, die Volumina addieren
 * sich also nicht — deshalb wird über Massen gerechnet.
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral,
 * die Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind
 * Rechenweg und stehen deshalb hier.
 */

export type CraftMixKind = 'concrete' | 'mortar' | 'screed'

/** Woher ein Vorschlagswert stammt. Erfahrungswerte werden in der Oberfläche gekennzeichnet. */
export type CraftValueSource = 'sourced' | 'experience'

export interface CraftMix {
  readonly id: string
  readonly kind: CraftMixKind
  readonly titleKey: string
  /** Vorschlag Zementgehalt in kg je m³ fertiger Mischung. */
  readonly cementPerCubicMeter: number
  /** Vorschlag Wasserzementwert (Masse Wasser zu Masse Zement). */
  readonly waterCementRatio: number
  /** Vorschlag Dichte der frischen Mischung in kg je m³. */
  readonly freshDensity: number
  /** Gibt an, ob die Vorschlagswerte aus einer genannten Fachquelle stammen. */
  readonly source: CraftValueSource
  /** Rechenweg in Formelzeichen, wie ihn die Oberfläche zeigt. */
  readonly ratioHint: string
}

/**
 * Vorschlagswerte je Mischung.
 *
 * Belegt (Fachquellen, frei zugänglich, Zahlen dort genannt):
 * - Frischbeton rund 2.400 kg/m³, Zementgehalt C20/25 300 kg/m³ bei w/z 0,60,
 *   C25/30 340 kg/m³ bei w/z 0,55, Magerbeton 180 kg/m³ bei w/z 0,75
 *   (`baumaterialkalkulator.de`, `bau-szene.de`).
 * - Zementestrich 2.200 kg/m³ (`baumigo.de`, entnommen DIN EN 1991-1-1);
 *   Zementgehalt von Estrichmörtel höchstens 450 kg/m³ (`vdz-online.de`, Merkblatt B19).
 *
 * Als Erfahrungswert gekennzeichnet (`'experience'`), weil diese Recherche keine
 * frei zugängliche Fachquelle mit einer konkreten Zahl gefunden hat:
 * Mörtel-Zementgehalt und die Wasserzementwerte von Mörtel und Estrich. Die
 * Oberfläche zeigt das an und der Nutzer kann jeden Wert überschreiben.
 */
export const craftMixes: readonly CraftMix[] = [
  {
    id: 'lean',
    kind: 'concrete',
    titleKey: 'tool.concrete.mix.lean',
    cementPerCubicMeter: 180,
    waterCementRatio: 0.75,
    freshDensity: 2400,
    source: 'sourced',
    ratioHint: 'Z ≈ 180 kg/m³ · w/z 0,75'
  },
  {
    id: 'c2025',
    kind: 'concrete',
    titleKey: 'tool.concrete.mix.c2025',
    cementPerCubicMeter: 300,
    waterCementRatio: 0.6,
    freshDensity: 2400,
    source: 'sourced',
    ratioHint: 'Z ≈ 300 kg/m³ · w/z 0,60'
  },
  {
    id: 'c2530',
    kind: 'concrete',
    titleKey: 'tool.concrete.mix.c2530',
    cementPerCubicMeter: 340,
    waterCementRatio: 0.55,
    freshDensity: 2400,
    source: 'sourced',
    ratioHint: 'Z ≈ 340 kg/m³ · w/z 0,55'
  },
  {
    id: 'c3037',
    kind: 'concrete',
    titleKey: 'tool.concrete.mix.c3037',
    cementPerCubicMeter: 380,
    waterCementRatio: 0.5,
    freshDensity: 2400,
    source: 'sourced',
    ratioHint: 'Z ≈ 380 kg/m³ · w/z 0,50'
  },
  {
    id: 'cementMortar',
    kind: 'mortar',
    titleKey: 'tool.concrete.mix.cementMortar',
    cementPerCubicMeter: 300,
    waterCementRatio: 0.5,
    freshDensity: 2000,
    source: 'experience',
    ratioHint: 'Z ≈ 300 kg/m³ · w/z 0,50'
  },
  {
    id: 'cementScreed',
    kind: 'screed',
    titleKey: 'tool.concrete.mix.cementScreed',
    cementPerCubicMeter: 330,
    waterCementRatio: 0.45,
    freshDensity: 2200,
    source: 'experience',
    ratioHint: 'Z ≈ 330 kg/m³ · w/z 0,45'
  }
]

export function craftMixById(id: string): CraftMix | undefined {
  return craftMixes.find((mix) => mix.id === id)
}

export function craftMixesOfKind(kind: CraftMixKind): readonly CraftMix[] {
  return craftMixes.filter((mix) => mix.kind === kind)
}

/** Grenzen, innerhalb derer eine Eingabe als Baumischung sinnvoll ist. */
export const CRAFT_LIMITS = {
  cementPerCubicMeter: { min: 50, max: 800 },
  waterCementRatio: { min: 0.2, max: 1.2 },
  freshDensity: { min: 1200, max: 2800 },
  wastePercent: { min: 0, max: 50 },
  bagSizeKg: { min: 5, max: 50 }
} as const

export interface CraftMixInput {
  readonly volumeCubicMeters: number
  readonly cementPerCubicMeter: number
  readonly waterCementRatio: number
  readonly freshDensity: number
  readonly wastePercent: number
  readonly bagSizeKg: number
}

export interface CraftMixResult {
  /** Volumen der Mischung einschließlich Verschnitt. */
  readonly volumeCubicMeters: number
  readonly cementKg: number
  /** Ganze Säcke, immer aufgerundet — halbe Säcke gibt es nicht zu kaufen. */
  readonly bags: number
  /** Masse, die über die ganze Sackzahl hinausgeht (Rest im letzten Sack). */
  readonly bagsRemainderKg: number
  readonly waterLiters: number
  readonly aggregateKg: number
  readonly totalMassKg: number
  /** Masseverhältnis Zement : Zuschlag, auf Zement = 1 bezogen. */
  readonly aggregatePerCement: number
  readonly formulas: readonly string[]
}

export type CraftMixCheck =
  | { readonly ok: true; readonly result: CraftMixResult }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/**
 * Rechnet den Materialbedarf einer Baumischung.
 *
 * Fehlerkennungen sind sprachneutral und werden in der Oberfläche übersetzt:
 * `empty` (fehlender oder unlesbarer Wert), `range` (Wert außerhalb des
 * sinnvollen Bereichs), `volume` (Volumen null oder negativ).
 */
export function planCraftMix(input: CraftMixInput): CraftMixCheck {
  const { volumeCubicMeters, cementPerCubicMeter, waterCementRatio, freshDensity, wastePercent, bagSizeKg } = input

  for (const value of [volumeCubicMeters, cementPerCubicMeter, waterCementRatio, freshDensity, wastePercent, bagSizeKg]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (volumeCubicMeters <= 0) return { ok: false, errorKey: 'tool.craft.error.volume' }
  if (!within(cementPerCubicMeter, CRAFT_LIMITS.cementPerCubicMeter)) return { ok: false, errorKey: 'tool.craft.error.cement' }
  if (!within(waterCementRatio, CRAFT_LIMITS.waterCementRatio)) return { ok: false, errorKey: 'tool.craft.error.ratio' }
  if (!within(freshDensity, CRAFT_LIMITS.freshDensity)) return { ok: false, errorKey: 'tool.craft.error.density' }
  if (!within(wastePercent, CRAFT_LIMITS.wastePercent)) return { ok: false, errorKey: 'tool.craft.error.waste' }
  if (!within(bagSizeKg, CRAFT_LIMITS.bagSizeKg)) return { ok: false, errorKey: 'tool.craft.error.bag' }

  const volume = volumeCubicMeters * (1 + wastePercent / 100)
  const cementKg = volume * cementPerCubicMeter
  const waterLiters = cementKg * waterCementRatio
  const totalMassKg = volume * freshDensity
  const aggregateKg = totalMassKg - cementKg - waterLiters

  if (!Number.isFinite(aggregateKg) || aggregateKg <= 0) return { ok: false, errorKey: 'tool.craft.error.mix' }

  const bags = Math.ceil(cementKg / bagSizeKg)
  const bagsRemainderKg = bags * bagSizeKg - cementKg

  return {
    ok: true,
    result: {
      volumeCubicMeters: volume,
      cementKg,
      bags,
      bagsRemainderKg,
      waterLiters,
      aggregateKg,
      totalMassKg,
      aggregatePerCement: aggregateKg / cementKg,
      formulas: [
        'V = L · B · D · (1 + Verschnitt)',
        'Z = V · Zementgehalt',
        'W = Z · w/z',
        'G = V · ρ − Z − W'
      ]
    }
  }
}

/** Volumen aus Länge × Breite × Dicke, alle Maße in Metern. */
export function volumeFromDimensions(length: number, breadth: number, thickness: number): number {
  return length * breadth * thickness
}

/** Volumen aus Grundfläche × Dicke, beide in Metern. */
export function volumeFromArea(area: number, thickness: number): number {
  return area * thickness
}

/** Rundet für die Anzeige auf zwölf gültige Stellen — Maße sind Messwerte, keine Geldbeträge. */
export function roundForDisplay(value: number, digits = 12): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (digits - 1 - exponent)
  return Math.round(value * factor) / factor
}
