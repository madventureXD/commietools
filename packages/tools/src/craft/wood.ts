/**
 * Kern des Werkzeugs „Holzfeuchte und Holzgewicht" (Welle A der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: zwei Definitionen und eine
 * Multiplikation.
 *
 * **Holzfeuchte** (Masse-Prozent, auf die Darrmasse bezogen — so definieren es
 * Fachquellen übereinstimmend):
 *
 *   u = (m_nass − m_darr) / m_darr · 100
 *
 * Der Rückweg (Darrmasse aus Nassmasse und Ziel-Feuchte) ist dieselbe Gleichung,
 * nach `m_darr` umgestellt:  m_darr = m_nass / (1 + u/100).
 *
 * **Holzgewicht** = Volumen · Rohdichte. Die Rohdichte ist **keine Konstante**:
 * Sie hängt von Holzart, Wuchs und vor allem von der Holzfeuchte ab. Die Tabelle
 * unten gibt deshalb ausdrücklich die Rohdichte bei **12 bis 15 % Holzfeuchte**
 * an (Gebrauchsfeuchte im Innenraum) — nicht mehr und nicht weniger. Eine
 * Umrechnung auf andere Feuchteniveaus wird bewusst nicht angeboten: Sie wäre
 * eine Scheingenauigkeit, weil Quellung das Volumen mitverändert.
 *
 * Keine Anzeigetexte: Kennungen und Formelzeichen sind sprachneutral.
 */

export interface WoodSpecies {
  readonly id: string
  readonly titleKey: string
  /** Rohdichte in g/cm³ (= kg/dm³) bei einer Holzfeuchte von 12 bis 15 %. */
  readonly density: number
  /** Kennzeichnet, ob die Rohdichte aus einer genannten Fachquelle stammt. */
  readonly sourced: boolean
}

/**
 * Mittlere Rohdichten bei 12 bis 15 % Holzfeuchte nach der Tabelle der
 * Bayerischen Landesanstalt für Wald und Forstwirtschaft (LWF), wie sie
 * `sanier.de` wiedergibt; Gegenprobe in `lwf.bayern.de` (Wissen 57): Kiefer 0,52,
 * Fichte 0,47, Tanne 0,47, Lärche 0,59, Douglasie 0,58, Eiche 0,67–0,69,
 * Buche 0,69–0,72.
 */
export const woodSpecies: readonly WoodSpecies[] = [
  { id: 'spruce', titleKey: 'tool.wood.species.spruce', density: 0.46, sourced: true },
  { id: 'fir', titleKey: 'tool.wood.species.fir', density: 0.46, sourced: true },
  { id: 'pine', titleKey: 'tool.wood.species.pine', density: 0.52, sourced: true },
  { id: 'larch', titleKey: 'tool.wood.species.larch', density: 0.6, sourced: true },
  { id: 'douglas', titleKey: 'tool.wood.species.douglas', density: 0.51, sourced: true },
  { id: 'beech', titleKey: 'tool.wood.species.beech', density: 0.71, sourced: true },
  { id: 'oak', titleKey: 'tool.wood.species.oak', density: 0.71, sourced: true },
  { id: 'ash', titleKey: 'tool.wood.species.ash', density: 0.7, sourced: true },
  { id: 'maple', titleKey: 'tool.wood.species.maple', density: 0.63, sourced: true },
  { id: 'lime', titleKey: 'tool.wood.species.lime', density: 0.53, sourced: true },
  { id: 'poplar', titleKey: 'tool.wood.species.poplar', density: 0.45, sourced: true },
  { id: 'robinia', titleKey: 'tool.wood.species.robinia', density: 0.74, sourced: true },
  { id: 'cherry', titleKey: 'tool.wood.species.cherry', density: 0.57, sourced: true },
  { id: 'walnut', titleKey: 'tool.wood.species.walnut', density: 0.68, sourced: true },
  { id: 'chestnut', titleKey: 'tool.wood.species.chestnut', density: 0.59, sourced: true },
  { id: 'elm', titleKey: 'tool.wood.species.elm', density: 0.65, sourced: true }
]

export function woodSpeciesById(id: string): WoodSpecies | undefined {
  return woodSpecies.find((species) => species.id === id)
}

export const WOOD_LIMITS = {
  massKg: { min: 0.001, max: 100000 },
  moisturePercent: { min: 0, max: 300 },
  density: { min: 0.05, max: 1.5 },
  dimensionMm: { min: 1, max: 12000 },
  lengthM: { min: 0.01, max: 100 },
  count: { min: 1, max: 100000 }
} as const

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Feuchtegrad, wie Fachquellen ihn einteilen: trocken, feucht, nass. */
export type WoodMoistureBand = 'dry' | 'working' | 'wet'

export function woodMoistureBand(moisturePercent: number): WoodMoistureBand {
  if (moisturePercent < 6) return 'dry'
  if (moisturePercent < 35) return 'working'
  return 'wet'
}

export interface WoodMoistureInput {
  /** Nassgewicht in kg. */
  readonly wetKg: number
  /** Darrmasse (Trockenmasse) in kg. */
  readonly dryKg: number
}

export interface WoodMoistureResult {
  readonly moisturePercent: number
  readonly band: WoodMoistureBand
  /** Masse des enthaltenen Wassers in kg. */
  readonly waterKg: number
  /** Trockenmasse-Anteil am Nassgewicht in Prozent. */
  readonly drySharePercent: number
  readonly formula: string
}

export type WoodCheck<T> =
  | { readonly ok: true; readonly result: T }
  | { readonly ok: false; readonly errorKey: string }

export function planWoodMoisture(input: WoodMoistureInput): WoodCheck<WoodMoistureResult> {
  const { wetKg, dryKg } = input
  if (!Number.isFinite(wetKg) || !Number.isFinite(dryKg)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  if (!within(wetKg, WOOD_LIMITS.massKg) || !within(dryKg, WOOD_LIMITS.massKg)) return { ok: false, errorKey: 'tool.wood.error.mass' }
  if (dryKg > wetKg) return { ok: false, errorKey: 'tool.wood.error.dryHeavier' }

  const waterKg = wetKg - dryKg
  const moisturePercent = (waterKg / dryKg) * 100

  return {
    ok: true,
    result: {
      moisturePercent,
      band: woodMoistureBand(moisturePercent),
      waterKg,
      drySharePercent: (dryKg / wetKg) * 100,
      formula: 'u = (m_nass − m_darr) / m_darr · 100'
    }
  }
}

export interface WoodDryMassResult {
  readonly dryKg: number
  readonly waterKg: number
  readonly formula: string
}

/** Darrmasse aus Nassgewicht und angestrebter Holzfeuchte. */
export function planWoodDryMass(wetKg: number, moisturePercent: number): WoodCheck<WoodDryMassResult> {
  if (!Number.isFinite(wetKg) || !Number.isFinite(moisturePercent)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  if (!within(wetKg, WOOD_LIMITS.massKg)) return { ok: false, errorKey: 'tool.wood.error.mass' }
  if (!within(moisturePercent, WOOD_LIMITS.moisturePercent)) return { ok: false, errorKey: 'tool.wood.error.moisture' }

  const dryKg = wetKg / (1 + moisturePercent / 100)
  return {
    ok: true,
    result: { dryKg, waterKg: wetKg - dryKg, formula: 'm_darr = m_nass / (1 + u/100)' }
  }
}

export interface WoodWeightInput {
  readonly volumeM3: number
  /** Rohdichte in kg/dm³ bei 12 bis 15 % Holzfeuchte. */
  readonly density: number
  readonly count: number
}

export interface WoodWeightResult {
  readonly volumeM3: number
  readonly massKg: number
  readonly totalMassKg: number
  /** Masse je Meter, wenn der Querschnitt als Fläche angegeben wurde. */
  readonly formula: string
}

export function planWoodWeight(input: WoodWeightInput): WoodCheck<WoodWeightResult> {
  const { volumeM3, density, count } = input
  if (!Number.isFinite(volumeM3) || !Number.isFinite(density) || !Number.isFinite(count)) {
    return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!(volumeM3 > 0)) return { ok: false, errorKey: 'tool.craft.error.volume' }
  if (!within(density, WOOD_LIMITS.density)) return { ok: false, errorKey: 'tool.wood.error.density' }
  if (!within(count, WOOD_LIMITS.count)) return { ok: false, errorKey: 'tool.wood.error.count' }

  const massKg = volumeM3 * density * 1000
  return {
    ok: true,
    result: {
      volumeM3,
      massKg,
      totalMassKg: massKg * count,
      formula: 'm = V · ρ · 1000'
    }
  }
}

/** Volumen aus drei Maßen in Millimetern, Ergebnis in Kubikmetern. */
export function woodVolumeFromMm(a: number, b: number, c: number): number {
  return (a / 1000) * (b / 1000) * (c / 1000)
}
