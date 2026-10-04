/**
 * Kern des Werkzeugs „Metallgewicht" (Welle A der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: Querschnittsflächen und eine
 * Grundformel.
 *
 * Die eine tragende Formel (Fachquellen nennen sie übereinstimmend als
 * Grundformel der Gewichtsberechnung von Stahl):
 *
 *   m = F · L · ρ / 1000
 *   F = Querschnittsfläche in mm², L = Länge in m, ρ = Dichte in g/cm³ (= kg/dm³)
 *
 * Belegt: Stahl 7,85 kg/dm³ (praxisüblicher Standardwert), Edelstahl 1.4301 7,9,
 * Aluminium 2,70, Kupfer 8,96, Messing 8,5; die Querschnittsformeln sind
 * Schulgeometrie und stehen hier als Rechenweg im Klartext.
 *
 * Keine Anzeigetexte: Kennungen und Formelzeichen sind sprachneutral.
 */

export type MetalProfile =
  | 'round'
  | 'square'
  | 'flat'
  | 'tube'
  | 'squareTube'
  | 'rectTube'
  | 'angle'
  | 'hex'

export interface MetalMaterial {
  readonly id: string
  readonly titleKey: string
  /** Dichte in kg/dm³ (= g/cm³). */
  readonly density: number
  /** Kennzeichnet, ob die Dichte aus einer genannten Fachquelle stammt. */
  readonly sourced: boolean
}

export const metalMaterials: readonly MetalMaterial[] = [
  { id: 'steel', titleKey: 'tool.metal.material.steel', density: 7.85, sourced: true },
  { id: 'stainless', titleKey: 'tool.metal.material.stainless', density: 7.9, sourced: true },
  { id: 'castIron', titleKey: 'tool.metal.material.castIron', density: 7.25, sourced: true },
  { id: 'aluminium', titleKey: 'tool.metal.material.aluminium', density: 2.7, sourced: true },
  { id: 'copper', titleKey: 'tool.metal.material.copper', density: 8.96, sourced: true },
  { id: 'brass', titleKey: 'tool.metal.material.brass', density: 8.5, sourced: true },
  { id: 'bronze', titleKey: 'tool.metal.material.bronze', density: 8.8, sourced: false },
  { id: 'zinc', titleKey: 'tool.metal.material.zinc', density: 7.14, sourced: false },
  { id: 'lead', titleKey: 'tool.metal.material.lead', density: 11.34, sourced: false },
  { id: 'titanium', titleKey: 'tool.metal.material.titanium', density: 4.51, sourced: false }
]

export function metalMaterialById(id: string): MetalMaterial | undefined {
  return metalMaterials.find((material) => material.id === id)
}

export const METAL_LIMITS = {
  dimension: { min: 0.5, max: 2000 },
  thickness: { min: 0.2, max: 200 },
  length: { min: 0.01, max: 1000 },
  count: { min: 1, max: 10000 },
  density: { min: 1, max: 25 }
} as const

export interface MetalFields {
  /** Erste Abmessung in mm: Durchmesser, Seitenlänge, Schenkel, Schlüsselweite, Breite. */
  readonly a: number
  /** Zweite Abmessung in mm: Dicke, Höhe. */
  readonly b: number
  /** Dritte Abmessung in mm: Wandstärke. */
  readonly t: number
}

export interface MetalInput {
  readonly profile: MetalProfile
  readonly fields: MetalFields
  readonly lengthM: number
  readonly density: number
  readonly count: number
}

export interface MetalResult {
  /** Querschnittsfläche in mm². */
  readonly areaMm2: number
  /** Masse eines Stücks in kg. */
  readonly massKg: number
  /** Masse je Meter in kg. */
  readonly massPerMeterKg: number
  /** Masse aller Stücke in kg. */
  readonly totalMassKg: number
  /** Volumen eines Stücks in dm³. */
  readonly volumeDm3: number
  readonly formula: string
}

export type MetalCheck =
  | { readonly ok: true; readonly result: MetalResult }
  | { readonly ok: false; readonly errorKey: string }

/** Profilarten für die Auswahl, in der Reihenfolge der Oberfläche. */
export const metalProfiles: readonly MetalProfile[] = [
  'round', 'square', 'flat', 'tube', 'squareTube', 'rectTube', 'angle', 'hex'
]

/**
 * Querschnittsfläche in mm². Rohre werden über die Differenz von Außen- und
 * Innenfläche gerechnet — nicht über eine Näherung.
 */
export function metalArea(profile: MetalProfile, { a, b, t }: MetalFields): number {
  switch (profile) {
    case 'round':
      return (Math.PI / 4) * a * a
    case 'square':
      return a * a
    case 'flat':
      return a * b
    case 'tube': {
      const inner = a - 2 * t
      return (Math.PI / 4) * (a * a - inner * inner)
    }
    case 'squareTube': {
      const inner = a - 2 * t
      return a * a - inner * inner
    }
    case 'rectTube': {
      const innerA = a - 2 * t
      const innerB = b - 2 * t
      return a * b - innerA * innerB
    }
    case 'angle':
      return t * (2 * a - t)
    case 'hex':
      return (Math.sqrt(3) / 2) * a * a
    default:
      return Number.NaN
  }
}

/** Formel in Zeichen — der Rechenweg, den die Oberfläche zeigt. */
export const metalFormulas: Readonly<Record<MetalProfile, string>> = {
  round: 'F = π/4 · d²',
  square: 'F = a²',
  flat: 'F = b · t',
  tube: 'F = π/4 · (D² − d²)',
  squareTube: 'F = a² − (a − 2t)²',
  rectTube: 'F = b · h − (b − 2t) · (h − 2t)',
  angle: 'F = t · (2 · b − t)',
  hex: 'F = √3/2 · SW²'
}

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Welche Felder eine Profilart braucht: `a`, `b` und/oder `t`. */
export function metalFieldUse(profile: MetalProfile): { a: boolean; b: boolean; t: boolean } {
  switch (profile) {
    case 'round':
      return { a: true, b: false, t: false }
    case 'square':
      return { a: true, b: false, t: false }
    case 'flat':
      return { a: true, b: true, t: false }
    case 'tube':
      return { a: true, b: false, t: true }
    case 'squareTube':
      return { a: true, b: false, t: true }
    case 'rectTube':
      return { a: true, b: true, t: true }
    case 'angle':
      return { a: true, b: false, t: true }
    case 'hex':
      return { a: true, b: false, t: false }
    default:
      return { a: true, b: false, t: false }
  }
}

export function planMetalWeight(input: MetalInput): MetalCheck {
  const { profile, fields, lengthM, density, count } = input
  const use = metalFieldUse(profile)

  for (const value of [lengthM, density, count]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  for (const key of ['a', 'b', 't'] as const) {
    if (use[key] && !Number.isFinite(fields[key])) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!within(fields.a, METAL_LIMITS.dimension)) return { ok: false, errorKey: 'tool.metal.error.dimension' }
  if (use.b && !within(fields.b, METAL_LIMITS.dimension)) return { ok: false, errorKey: 'tool.metal.error.dimension' }
  if (use.t && !within(fields.t, METAL_LIMITS.thickness)) return { ok: false, errorKey: 'tool.metal.error.thickness' }
  if (!within(lengthM, METAL_LIMITS.length)) return { ok: false, errorKey: 'tool.metal.error.length' }
  if (!within(density, METAL_LIMITS.density)) return { ok: false, errorKey: 'tool.metal.error.density' }
  if (!within(count, METAL_LIMITS.count)) return { ok: false, errorKey: 'tool.metal.error.count' }

  // Eine Wandstärke, die das Profil verschließt oder überschreitet, ist keine Wand.
  if (use.t) {
    const limit = Math.min(fields.a, use.b ? fields.b : Number.POSITIVE_INFINITY)
    if (fields.t * 2 >= limit) return { ok: false, errorKey: 'tool.metal.error.wall' }
  }

  const area = metalArea(profile, fields)
  if (!Number.isFinite(area) || area <= 0) return { ok: false, errorKey: 'tool.metal.error.profile' }

  const massPerMeterKg = (area * density) / 1000
  const massKg = massPerMeterKg * lengthM

  return {
    ok: true,
    result: {
      areaMm2: area,
      massKg,
      massPerMeterKg,
      totalMassKg: massKg * count,
      volumeDm3: (area * lengthM) / 1000,
      formula: metalFormulas[profile]
    }
  }
}
