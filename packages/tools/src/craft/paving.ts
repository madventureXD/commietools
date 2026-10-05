/**
 * Kern des Werkzeugs „Pflaster und Erdarbeiten" (Welle C der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — Pflasterarbeiten und den zugehörigen Erdbau in **einer** Rechnung:
 *
 *   F   = L · B                                  Pflasterfläche (m²)
 *   H   = L · Gefälle / 100                      Höhenunterschied (m)
 *   n   = 1 / ((a + f) · (b + f))                Steine je m², **im Rastermaß** (mit Fuge)
 *   N   = aufrunden( F · (1 + Zuschlag) · n )    Steine gesamt
 *   V_B = F · Dicke_Bettung                      Bettung (m³)
 *   M_B = V_B · ρ_Bettung                        Bettungsmasse (t)
 *   V_F = F · (a + b)/(a · b) · f · t · ρ_F      Fugenmaterial (kg)
 *   V_A = F · Tiefe_Aushub                       Aushub im Boden (m³)
 *   V_L = V_A · Auflockerungsfaktor              aufgelockerte Masse (m³)
 *   Paletten = aufrunden( N / Steine je Palette )
 *
 * **Warum das Rastermaß (Stein plus Fuge) hier richtig ist — anders als beim Fliesenwerkzeug:**
 * Beim Pflaster ist die Fuge Teil des Verbands: Fugenbreite 3 bis 8 mm bei 20 cm Stein, die
 * Steine werden über die Fläche im Raster verkauft, und der Handel rechnet genauso. Bei Fliesen
 * ist dagegen die Bestellrechnung über das Formatmaß üblich. Beide Werkzeuge sagen, wie sie
 * rechnen — sie widersprechen sich deshalb nicht, sondern folgen dem jeweiligen Gewerk.
 *
 * **Der Auflockerungsfaktor ist der Punkt, den man leicht vergisst:** Ein Kubikmeter gewachsener
 * Boden wird beim Ausheben zu rund 1,2 bis 1,3 m³ Haufwerk. Wer das nicht rechnet, plant zu
 * kleine Container und zu wenige Fahrten.
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral, die
 * Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind Rechenweg und
 * stehen deshalb hier.
 */

export type PavingValueSource = 'sourced' | 'experience'

export interface PavingSourceValue {
  readonly value: number
  readonly source: PavingValueSource
}

/**
 * Vorschlagswerte.
 *
 * Belegt (im Projektkonzept „Handwerkerwerkzeuge" mit Quelle geführt): Keine freie Bibliothek
 * nötig, reine Rechnung; Steinformate und Palettengrößen sind dort ausdrücklich als
 * **herstellerabhängig** eingeordnet — deshalb Felder mit Vorschlag, nicht feste Werte.
 *
 * Als Erfahrungswert gekennzeichnet (`'experience'`): Bettungsdicke (4 cm Splitt), Dichte der
 * Bettung (1,6 t/m³ Splitt), Tragschichtdicke (30 cm), Auflockerungsfaktor (1,25), Zuschlag für
 * Schnitt (3 %), Steine je Palette (400), Fugentiefe (6 cm) und Dichte des Fugenmaterials
 * (1,6 t/m³). Das Steinformat 20 × 10 cm und die Fugenbreite 4 mm sind gebräuchliche Werte und
 * ebenfalls als Vorschlag geführt.
 */
export const PAVING_DEFAULTS = {
  lengthM: 8,
  breadthM: 5,
  stoneLengthCm: { value: 20, source: 'experience' } as PavingSourceValue,
  stoneBreadthCm: { value: 10, source: 'experience' } as PavingSourceValue,
  jointMm: { value: 4, source: 'experience' } as PavingSourceValue,
  surchargePercent: { value: 3, source: 'experience' } as PavingSourceValue,
  bedThicknessCm: { value: 4, source: 'experience' } as PavingSourceValue,
  bedDensity: { value: 1.6, source: 'experience' } as PavingSourceValue,
  jointFillDepthCm: { value: 6, source: 'experience' } as PavingSourceValue,
  jointDensity: { value: 1.6, source: 'experience' } as PavingSourceValue,
  baseCourseCm: { value: 30, source: 'experience' } as PavingSourceValue,
  bulkFactor: { value: 1.25, source: 'experience' } as PavingSourceValue,
  stonesPerPallet: { value: 400, source: 'experience' } as PavingSourceValue,
  stoneThicknessCm: { value: 6, source: 'experience' } as PavingSourceValue,
  slopePercent: { value: 0.5, source: 'experience' } as PavingSourceValue
} as const

export const PAVING_LIMITS = {
  lengthM: { min: 0.2, max: 1000 },
  breadthM: { min: 0.2, max: 1000 },
  stoneLengthCm: { min: 4, max: 120 },
  stoneBreadthCm: { min: 4, max: 120 },
  jointMm: { min: 0, max: 30 },
  surchargePercent: { min: 0, max: 30 },
  /** Bettung (Splitt oder Sand) in cm. */
  bedThicknessCm: { min: 1, max: 20 },
  /** Schüttdichte der Bettung in t/m³. */
  bedDensity: { min: 0.8, max: 2.5 },
  jointFillDepthCm: { min: 0.5, max: 20 },
  jointDensity: { min: 0.8, max: 2.5 },
  /** Tragschicht unter der Bettung in cm. */
  baseCourseCm: { min: 0, max: 100 },
  bulkFactor: { min: 1, max: 1.8 },
  stonesPerPallet: { min: 1, max: 2000 },
  slopePercent: { min: 0, max: 20 },
  /** Steindicke in cm; bestimmt die Aushubtiefe mit. */
  stoneThicknessCm: { min: 2, max: 30 }
} as const

export interface PavingInput {
  readonly lengthM: number
  readonly breadthM: number
  readonly stoneLengthCm: number
  readonly stoneBreadthCm: number
  readonly jointMm: number
  readonly surchargePercent: number
  readonly bedThicknessCm: number
  readonly bedDensity: number
  readonly jointFillDepthCm: number
  readonly jointDensity: number
  readonly baseCourseCm: number
  readonly bulkFactor: number
  readonly stonesPerPallet: number
  readonly slopePercent: number
  /** Steindicke in cm — bestimmt die Aushubtiefe mit. */
  readonly stoneThicknessCm: number
}

export interface PavingResult {
  readonly areaM2: number
  /** Höhenunterschied über die Länge aus dem Gefälle. */
  readonly slopeDropM: number
  /** Steine je m² im Rastermaß. */
  readonly stonesPerSquareMeter: number
  readonly stones: number
  readonly pallets: number
  readonly bedVolumeM3: number
  /** Bettungsmasse in Tonnen. */
  readonly bedTons: number
  /** Bettungsmasse in Kilogramm — für die Anzeige neben Tonnen. */
  readonly bedKg: number
  readonly jointMaterialKg: number
  /** Aushubtiefe: Tragschicht plus Bettung plus Steindicke. */
  readonly digDepthM: number
  /** Aushub im gewachsenen Boden. */
  readonly digVolumeM3: number
  /** Aufgelockerte Masse (Haufwerk) — die Zahl für Container und Fahrten. */
  readonly digBulkVolumeM3: number
  readonly formulas: readonly string[]
}

export type PavingCheck =
  | { readonly ok: true; readonly result: PavingResult }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Steine je m² im Rastermaß (Stein plus Fuge) — die Bezugsgröße für die Bestellung. */
export function stonesPerSquareMeter(stoneLengthCm: number, stoneBreadthCm: number, jointMm: number): number {
  const lengthM = (stoneLengthCm + jointMm / 10) / 100
  const breadthM = (stoneBreadthCm + jointMm / 10) / 100
  return 1 / (lengthM * breadthM)
}

/**
 * Rechnet Steine, Bettung, Fugenmaterial und Erdbau einer Pflasterfläche.
 *
 * Fehlerkennungen sind sprachneutral und werden in der Oberfläche übersetzt:
 * `empty`, `length`/`breadth` (Fläche), `stone` (Steinformat), `joint` (Fugenbreite),
 * `surcharge` (Zuschlag), `bed` (Bettungsdicke), `bedDensity` (Dichte der Bettung),
 * `jointDepth` (Fugentiefe), `jointDensity` (Dichte des Fugenmaterials),
 * `baseCourse` (Tragschicht), `bulk` (Auflockerung), `pallet` (Steine je Palette),
 * `slope` (Gefälle), `stoneThickness` (Steindicke).
 */
export function planPaving(input: PavingInput): PavingCheck {
  const {
    lengthM, breadthM, stoneLengthCm, stoneBreadthCm, jointMm, surchargePercent,
    bedThicknessCm, bedDensity, jointFillDepthCm, jointDensity, baseCourseCm,
    bulkFactor, stonesPerPallet, slopePercent, stoneThicknessCm
  } = input

  for (const value of [
    lengthM, breadthM, stoneLengthCm, stoneBreadthCm, jointMm, surchargePercent,
    bedThicknessCm, bedDensity, jointFillDepthCm, jointDensity, baseCourseCm,
    bulkFactor, stonesPerPallet, slopePercent, stoneThicknessCm
  ]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!within(lengthM, PAVING_LIMITS.lengthM)) return { ok: false, errorKey: 'tool.paving.error.length' }
  if (!within(breadthM, PAVING_LIMITS.breadthM)) return { ok: false, errorKey: 'tool.paving.error.breadth' }
  if (!within(stoneLengthCm, PAVING_LIMITS.stoneLengthCm) || !within(stoneBreadthCm, PAVING_LIMITS.stoneBreadthCm)) {
    return { ok: false, errorKey: 'tool.paving.error.stone' }
  }
  if (!within(stoneThicknessCm, PAVING_LIMITS.stoneThicknessCm)) return { ok: false, errorKey: 'tool.paving.error.stoneThickness' }
  if (!within(jointMm, PAVING_LIMITS.jointMm)) return { ok: false, errorKey: 'tool.paving.error.joint' }
  if (!within(surchargePercent, PAVING_LIMITS.surchargePercent)) return { ok: false, errorKey: 'tool.paving.error.surcharge' }
  if (!within(bedThicknessCm, PAVING_LIMITS.bedThicknessCm)) return { ok: false, errorKey: 'tool.paving.error.bed' }
  if (!within(bedDensity, PAVING_LIMITS.bedDensity)) return { ok: false, errorKey: 'tool.paving.error.bedDensity' }
  if (!within(jointFillDepthCm, PAVING_LIMITS.jointFillDepthCm)) return { ok: false, errorKey: 'tool.paving.error.jointDepth' }
  if (!within(jointDensity, PAVING_LIMITS.jointDensity)) return { ok: false, errorKey: 'tool.paving.error.jointDensity' }
  if (!within(baseCourseCm, PAVING_LIMITS.baseCourseCm)) return { ok: false, errorKey: 'tool.paving.error.baseCourse' }
  if (!within(bulkFactor, PAVING_LIMITS.bulkFactor)) return { ok: false, errorKey: 'tool.paving.error.bulk' }
  if (!within(stonesPerPallet, PAVING_LIMITS.stonesPerPallet)) return { ok: false, errorKey: 'tool.paving.error.pallet' }
  if (!within(slopePercent, PAVING_LIMITS.slopePercent)) return { ok: false, errorKey: 'tool.paving.error.slope' }

  const areaM2 = lengthM * breadthM
  const slopeDropM = (lengthM * slopePercent) / 100
  const perSquareMeter = stonesPerSquareMeter(stoneLengthCm, stoneBreadthCm, jointMm)
  const stones = Math.ceil(areaM2 * (1 + surchargePercent / 100) * perSquareMeter)
  const pallets = Math.ceil(stones / stonesPerPallet)

  const bedVolumeM3 = areaM2 * (bedThicknessCm / 100)
  const bedTons = bedVolumeM3 * bedDensity

  // Fugenlänge je m² in Metern: je Stein entfallen (a + b) auf ihn (halber Umfang), im Raster
  // also n · (a + b). Mit a, b in **Zentimetern** ergibt der Faktor 100 daraus Meter je m².
  // Rechenprobe 20 × 10 cm: (30/200) · 100 = 15 m Fugenlänge je m².
  const jointLengthPerSquareMeter = (100 * (stoneLengthCm + stoneBreadthCm)) / (stoneLengthCm * stoneBreadthCm)
  const jointMaterialKg =
    areaM2 * jointLengthPerSquareMeter * (jointMm / 1000) * (jointFillDepthCm / 100) * (jointDensity * 1000)

  const digDepthM = (baseCourseCm + bedThicknessCm + stoneThicknessCm) / 100
  const digVolumeM3 = areaM2 * digDepthM
  const digBulkVolumeM3 = digVolumeM3 * bulkFactor

  return {
    ok: true,
    result: {
      areaM2,
      slopeDropM,
      stonesPerSquareMeter: perSquareMeter,
      stones,
      pallets,
      bedVolumeM3,
      bedTons,
      bedKg: bedTons * 1000,
      jointMaterialKg,
      digDepthM,
      digVolumeM3,
      digBulkVolumeM3,
      formulas: [
        'F = L · B',
        'H = L · Gefälle / 100',
        'n = 1 / ((a + f) · (b + f))',
        'N = aufgerundet( F · (1 + Zuschlag) · n )',
        'Paletten = aufgerundet( N / Steine je Palette )',
        'V_B = F · Dicke Bettung',
        'M_B = V_B · ρ Bettung',
        'M_F = F · Fugenlänge/m² · f · t · ρ Fugenmaterial',
        'T = Tragschicht + Bettung + Steindicke',
        'V_A = F · T',
        'V_L = V_A · Auflockerungsfaktor'
      ]
    }
  }
}

/** Rundet für die Anzeige auf zwölf gültige Stellen — Maße sind Messwerte, keine Geldbeträge. */
export function roundForDisplay(value: number, digits = 12): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (digits - 1 - exponent)
  return Math.round(value * factor) / factor
}
