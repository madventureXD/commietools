/**
 * Kern des Werkzeugs „Parkett, Laminat und Bodenbelag" (Welle B der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — **schwimmende Verlegung**, also Laminat, Fertigparkett und Klickvinyl:
 *
 *   F  = L · B                                   Bodenfläche (m²)
 *   Z  = F · Zuschlagssatz                       Zuschlag für die Verlegeart (m²)
 *   Bedarf = F + Z
 *   Pakete = aufrunden( Bedarf / Paketfläche )
 *   Verschnitt = Pakete · Paketfläche − F        gekauft abzüglich gebraucht
 *   Dämmung = F · (1 + Überlappung)
 *   Rollen = aufrunden( Dämmung / Rollenfläche )
 *   U  = 2 · (L + B)                             Umfang
 *   Leisten = aufrunden( U / Stücklänge )
 *
 * **Warum der Zuschlag von der Verlegeart abhängt:** Im Kreuzverband reicht ein
 * geringer Zuschlag, weil fast jedes Reststück weiterverwendet wird. Im Halb- und
 * Drittelversatz entstehen an den Rändern zwangsläufig kurze Stücke, im
 * Diagonalverband zusätzlich Dreieckschnitte an **jeder** Wand. Die Sätze sind
 * Erfahrungswerte, in der Oberfläche als solche gekennzeichnet und überschreibbar.
 *
 * **Nicht enthalten, bewusst:** geklebtes Parkett (braucht Kleber und ein anderes
 * Vorgehen) und die Trittschall-Dämmung als Verbundsystem mit eigener Fläche — die
 * Rechnung nennt die Dämmfläche mit einem Überlappungszuschlag, nicht mehr.
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral, die
 * Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind Rechenweg und
 * stehen deshalb hier.
 */

/** Verlegeart. Bestimmt den Zuschlag (Verschnitt für Schnitt und Muster). */
export type FlooringPattern = 'parallel' | 'staggered' | 'diagonal'

export type FlooringValueSource = 'sourced' | 'experience'

export interface FlooringPatternEntry {
  readonly id: FlooringPattern
  readonly titleKey: string
  /** Vorschlag für den Zuschlag in Prozent, bezogen auf die Bodenfläche. */
  readonly surchargePercent: number
  readonly source: FlooringValueSource
}

/**
 * Zuschlagsätze je Verlegeart.
 *
 * Alle drei sind **Erfahrungswerte** ohne genannte Fachquelle mit einer konkreten Zahl und in der
 * Oberfläche so gekennzeichnet; sie sind überschreibbar. Reihenfolge und Begründung:
 * Kreuzverband (Fugen durchlaufend) am wenigsten, Halb-/Drittelversatz mehr (kurze Randstücke),
 * Diagonalverband am meisten (Dreieckschnitte an jeder Wand).
 */
export const flooringPatterns: readonly FlooringPatternEntry[] = [
  { id: 'parallel', titleKey: 'tool.flooring.pattern.parallel', surchargePercent: 5, source: 'experience' },
  { id: 'staggered', titleKey: 'tool.flooring.pattern.staggered', surchargePercent: 8, source: 'experience' },
  { id: 'diagonal', titleKey: 'tool.flooring.pattern.diagonal', surchargePercent: 12, source: 'experience' }
]

export function flooringPatternById(id: string): FlooringPatternEntry | undefined {
  return flooringPatterns.find((pattern) => pattern.id === id)
}

/**
 * Vorschlagswerte.
 *
 * Belegt (im Projektkonzept „Handwerkerwerkzeuge" mit Quelle geführt): Zuschläge je Verlegeart
 * sind dort ausdrücklich als **Erfahrungswerte** eingeordnet; die Paket- und Rollengrößen sind
 * herstellerabhängig und deshalb Felder mit Vorschlag.
 *
 * Als Erfahrungswert gekennzeichnet (`'experience'`): Paketfläche (2,0 m²), Rollenfläche der
 * Trittschalldämmung (15 m²), Überlappungszuschlag der Dämmung (5 %), Stücklänge der
 * Sockelleiste (2,4 m).
 */
export const FLOORING_DEFAULTS = {
  lengthM: 5,
  breadthM: 4,
  packageAreaM2: { value: 2, source: 'experience' } as { readonly value: number; readonly source: FlooringValueSource },
  underlayRollAreaM2: { value: 15, source: 'experience' } as { readonly value: number; readonly source: FlooringValueSource },
  underlayOverlapPercent: { value: 5, source: 'experience' } as { readonly value: number; readonly source: FlooringValueSource },
  trimPieceLengthM: { value: 2.4, source: 'experience' } as { readonly value: number; readonly source: FlooringValueSource }
} as const

export const FLOORING_LIMITS = {
  lengthM: { min: 0.2, max: 200 },
  breadthM: { min: 0.2, max: 200 },
  packageAreaM2: { min: 0.5, max: 10 },
  surchargePercent: { min: 0, max: 30 },
  underlayRollAreaM2: { min: 1, max: 60 },
  underlayOverlapPercent: { min: 0, max: 20 },
  trimPieceLengthM: { min: 0.5, max: 5 }
} as const

export interface FlooringInput {
  readonly lengthM: number
  readonly breadthM: number
  readonly packageAreaM2: number
  readonly pattern: FlooringPattern
  readonly surchargePercent: number
  readonly underlayRollAreaM2: number
  readonly underlayOverlapPercent: number
  readonly trimPieceLengthM: number
}

export interface FlooringResult {
  readonly areaM2: number
  /** Zuschlag in m² nach dem Satz der Verlegeart. */
  readonly surchargeM2: number
  /** Fläche einschließlich Zuschlag — die Fläche, die gedeckt sein muss. */
  readonly requiredM2: number
  readonly packages: number
  /** Gekaufte Fläche abzüglich der Bodenfläche. */
  readonly offcutM2: number
  readonly underlayM2: number
  readonly underlayRolls: number
  /** Umfang des Raums — Bezugsgröße für die Randprofile. */
  readonly perimeterM: number
  readonly trimPieces: number
  readonly trimMeters: number
  readonly formulas: readonly string[]
}

export type FlooringCheck =
  | { readonly ok: true; readonly result: FlooringResult }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/**
 * Rechnet Pakete, Zuschlag, Dämmung und Randprofile eines schwimmend verlegten Bodens.
 *
 * Fehlerkennungen sind sprachneutral und werden in der Oberfläche übersetzt:
 * `empty` (fehlender oder unlesbarer Wert), `length`/`breadth` (Raummaße),
 * `package` (Paketfläche), `surcharge` (Zuschlag), `roll` (Rollenfläche der Dämmung),
 * `overlap` (Überlappung), `trim` (Stücklänge der Sockelleiste).
 */
export function planFlooring(input: FlooringInput): FlooringCheck {
  const {
    lengthM, breadthM, packageAreaM2, surchargePercent,
    underlayRollAreaM2, underlayOverlapPercent, trimPieceLengthM
  } = input

  for (const value of [lengthM, breadthM, packageAreaM2, surchargePercent, underlayRollAreaM2, underlayOverlapPercent, trimPieceLengthM]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!within(lengthM, FLOORING_LIMITS.lengthM)) return { ok: false, errorKey: 'tool.flooring.error.length' }
  if (!within(breadthM, FLOORING_LIMITS.breadthM)) return { ok: false, errorKey: 'tool.flooring.error.breadth' }
  if (!within(packageAreaM2, FLOORING_LIMITS.packageAreaM2)) return { ok: false, errorKey: 'tool.flooring.error.package' }
  if (!within(surchargePercent, FLOORING_LIMITS.surchargePercent)) return { ok: false, errorKey: 'tool.flooring.error.surcharge' }
  if (!within(underlayRollAreaM2, FLOORING_LIMITS.underlayRollAreaM2)) return { ok: false, errorKey: 'tool.flooring.error.roll' }
  if (!within(underlayOverlapPercent, FLOORING_LIMITS.underlayOverlapPercent)) return { ok: false, errorKey: 'tool.flooring.error.overlap' }
  if (!within(trimPieceLengthM, FLOORING_LIMITS.trimPieceLengthM)) return { ok: false, errorKey: 'tool.flooring.error.trim' }

  const areaM2 = lengthM * breadthM
  const surchargeM2 = (areaM2 * surchargePercent) / 100
  const requiredM2 = areaM2 + surchargeM2
  const packages = Math.ceil(requiredM2 / packageAreaM2)
  const offcutM2 = packages * packageAreaM2 - areaM2

  const underlayM2 = areaM2 * (1 + underlayOverlapPercent / 100)
  const underlayRolls = Math.ceil(underlayM2 / underlayRollAreaM2)

  const perimeterM = 2 * (lengthM + breadthM)
  const trimPieces = Math.ceil(perimeterM / trimPieceLengthM)

  return {
    ok: true,
    result: {
      areaM2,
      surchargeM2,
      requiredM2,
      packages,
      offcutM2,
      underlayM2,
      underlayRolls,
      perimeterM,
      trimPieces,
      trimMeters: trimPieces * trimPieceLengthM,
      formulas: [
        'F = L · B',
        'Zuschlag = F · Zuschlagssatz',
        'Bedarf = F + Zuschlag',
        'Pakete = aufgerundet( Bedarf / Paketfläche )',
        'Verschnitt = Pakete · Paketfläche − F',
        'Dämmung = F · (1 + Überlappung)',
        'Rollen = aufgerundet( Dämmung / Rollenfläche )',
        'Umfang = 2 · (L + B)',
        'Leisten = aufgerundet( Umfang / Stücklänge )',
        'Leistenmeter = Leisten · Stücklänge'
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
