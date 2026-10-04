/**
 * Kern des Werkzeugs „Dach" (Welle A der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: Trigonometrie mit `Math`.
 *
 * Der tragende Gedanke: Bei durchgehend gleicher Neigung ist die wahre
 * Dachfläche die **Grundrissfläche geteilt durch den Kosinus der Neigung** —
 * das gilt für Pult-, Sattel- und Walmdach gleichermaßen (Projektionsprinzip).
 * Deshalb braucht keine Dachform eine eigene Flächenformel, und der
 * Neigungsfaktor bleibt die eine prüfbare Größe:
 *
 *   f = 1 / cos(α)      (45° → √2 ≈ 1,4142)
 *   A = (L + 2u) · (B + 2u) · f
 *
 * Überstände werden rundum angesetzt. Die Neigung darf in Grad, Prozent oder
 * als Verhältnis („1 : 4") eingegeben werden; die Umrechnung ist öffentliche
 * Trigonometrie und steht hier, nicht in der Oberfläche.
 *
 * Keine Anzeigetexte: Kennungen und Formelzeichen sind sprachneutral.
 */

export type RoofShape = 'pent' | 'gable' | 'hip'

export const ROOF_LIMITS = {
  pitchDeg: { min: 0, max: 80 },
  lengthM: { min: 0.1, max: 200 },
  widthM: { min: 0.1, max: 200 },
  overhangM: { min: 0, max: 3 },
  wastePercent: { min: 0, max: 50 },
  spanSpacingM: { min: 0.3, max: 1.5 },
  coveringPerSqm: { min: 1, max: 50 }
} as const

export interface RoofInput {
  readonly shape: RoofShape
  /** Grundrisslänge entlang der Traufe in Metern. */
  readonly lengthM: number
  /** Grundrissbreite in Sparrenrichtung in Metern. */
  readonly widthM: number
  readonly pitchDeg: number
  readonly overhangM: number
  readonly wastePercent: number
  /** Abstand der Sparren in Metern. */
  readonly spanSpacingM: number
  /** Stück Eindeckung je Quadratmeter. */
  readonly coveringPerSqm: number
}

export interface RoofResult {
  /** Die tatsächlich gerechnete Neigung in Grad — auch wenn sie als Verhältnis eingegeben wurde. */
  readonly pitchDegreesUsed: number
  readonly pitchFactor: number
  /** Grundrissfläche einschließlich Überstand. */
  readonly footprintAreaM2: number
  /** Wahre Dachfläche, ohne Zuschlag. */
  readonly roofAreaM2: number
  /** Dachfläche mit Zuschlag. */
  readonly roofAreaWithWasteM2: number
  /** Firsthöhe über der Traufe. */
  readonly firstHeightM: number
  /** Längster Sparren einschließlich Überstand. */
  readonly rafterLengthM: number
  readonly rafterCount: number
  /** Firstlänge; beim Pultdach gibt es keinen First (0). */
  readonly ridgeLengthM: number
  readonly coveringPieces: number
  readonly formulas: readonly string[]
}

export type RoofCheck =
  | { readonly ok: true; readonly result: RoofResult }
  | { readonly ok: false; readonly errorKey: string }

/** Neigungsfaktor für eine Neigung in Grad. */
export function pitchFactor(pitchDeg: number): number {
  return 1 / Math.cos((pitchDeg * Math.PI) / 180)
}

/** Wandelt ein Verhältnis „Höhe zu Länge" (etwa 1 : 4) in Grad um. */
export function pitchDegFromRatio(rise: number, run: number): number {
  if (!(rise > 0) || !(run > 0)) return Number.NaN
  return (Math.atan(rise / run) * 180) / Math.PI
}

/** Wandelt Prozent Neigung (etwa 25 %) in Grad um. */
export function pitchDegFromPercent(percent: number): number {
  if (!Number.isFinite(percent)) return Number.NaN
  return (Math.atan(percent / 100) * 180) / Math.PI
}

/** Wandelt Grad in Prozent Neigung um. */
export function pitchPercentFromDeg(pitchDeg: number): number {
  if (!Number.isFinite(pitchDeg)) return Number.NaN
  return Math.tan((pitchDeg * Math.PI) / 180) * 100
}

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/**
 * Rechnet Dachfläche, Firsthöhe, Sparren und Materialbedarf.
 *
 * Fehlerkennungen sind sprachneutral: `tool.craft.error.empty` und
 * `tool.craft.error.waste` liegen im gemeinsamen Handwerkskatalog, die
 * werkzeugeigenen beginnen mit `tool.roof.error.`.
 */
export function planRoof(input: RoofInput): RoofCheck {
  const { shape, lengthM, widthM, pitchDeg, overhangM, wastePercent, spanSpacingM, coveringPerSqm } = input

  for (const value of [lengthM, widthM, pitchDeg, overhangM, wastePercent, spanSpacingM, coveringPerSqm]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!within(lengthM, ROOF_LIMITS.lengthM) || !within(widthM, ROOF_LIMITS.widthM)) {
    return { ok: false, errorKey: 'tool.roof.error.size' }
  }
  if (!within(pitchDeg, ROOF_LIMITS.pitchDeg)) return { ok: false, errorKey: 'tool.roof.error.pitch' }
  if (!within(overhangM, ROOF_LIMITS.overhangM)) return { ok: false, errorKey: 'tool.roof.error.overhang' }
  if (!within(wastePercent, ROOF_LIMITS.wastePercent)) return { ok: false, errorKey: 'tool.craft.error.waste' }
  if (!within(spanSpacingM, ROOF_LIMITS.spanSpacingM)) return { ok: false, errorKey: 'tool.roof.error.spacing' }
  if (!within(coveringPerSqm, ROOF_LIMITS.coveringPerSqm)) return { ok: false, errorKey: 'tool.roof.error.covering' }

  const factor = pitchFactor(pitchDeg)
  const outerLength = lengthM + 2 * overhangM
  const outerWidth = widthM + 2 * overhangM
  const footprintAreaM2 = outerLength * outerWidth
  const roofAreaM2 = footprintAreaM2 * factor
  const roofAreaWithWasteM2 = roofAreaM2 * (1 + wastePercent / 100)

  // Firsthöhe und Sparrenlänge unterscheiden die Dachformen; die Fläche nicht.
  const halfSpan = shape === 'pent' ? widthM : widthM / 2
  const firstHeightM = shape === 'pent' ? widthM * Math.tan((pitchDeg * Math.PI) / 180) : halfSpan * Math.tan((pitchDeg * Math.PI) / 180)
  const rafterLengthM = (halfSpan + overhangM) / Math.cos((pitchDeg * Math.PI) / 180)
  const rafterCount = Math.ceil(outerLength / spanSpacingM) + 1
  const ridgeLengthM = shape === 'pent' ? 0 : shape === 'gable' ? outerLength : Math.max(0, lengthM - widthM) + 2 * overhangM
  const coveringPieces = Math.ceil(roofAreaWithWasteM2 * coveringPerSqm)

  return {
    ok: true,
    result: {
      pitchDegreesUsed: pitchDeg,
      pitchFactor: factor,
      footprintAreaM2,
      roofAreaM2,
      roofAreaWithWasteM2,
      firstHeightM,
      rafterLengthM,
      rafterCount,
      ridgeLengthM,
      coveringPieces,
      formulas: [
        'f = 1 / cos(α)',
        'A = (L + 2u) · (B + 2u) · f',
        shape === 'pent' ? 'H = B · tan(α)' : 'H = B/2 · tan(α)',
        shape === 'pent' ? 'S = (B + u) / cos(α)' : 'S = (B/2 + u) / cos(α)',
        'n = ⌈(L + 2u) / e⌉ + 1',
        'N = A · Stück/m²'
      ]
    }
  }
}
