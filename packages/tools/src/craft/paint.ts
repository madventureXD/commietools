/**
 * Kern des Werkzeugs „Farbe, Tapeten und Beschichtung" (Welle B der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — Anstrich und Bahnen getrennt, weil beide verschieden rechnen:
 *
 *   G  = U · H                                   Wandfläche roh (m²)
 *   N  = G − Türen − Fenster − weiterer Abzug    Nettofläche (m²)
 *   F  = N · Anstriche / Ergiebigkeit            Farbe (l)
 *   Gebinde = aufrunden( F / Gebindegröße )
 *
 *   Z  = (H + Zugabe) aufgerundet auf den Rapport   Zuschnitt je Bahn (m)
 *   B je Rolle = abrunden( Rollenlänge / Z )
 *   B  = aufrunden( nutzbare Wandbreite / Bahnbreite )
 *   Rollen = aufrunden( B / B je Rolle )
 *
 * **Warum die Bahnenrechnung der wertvolle Teil ist:** Eine reine Quadratmeterrechnung
 * unterschätzt den Tapetenbedarf systematisch — sie kennt weder den Rapportversatz noch die
 * Tatsache, dass eine Öffnung, die niedriger ist als die Wand, keine ganze Bahn spart. Deshalb
 * rechnet das Werkzeug in Bahnen (Breite) und Zuschnittlängen (Höhe), nicht in Fläche.
 *
 * **Rapport:** `Z` ist immer ein Vielfaches des Ansatzschrittes — bei geradem Rapport die
 * Rapportlänge, bei halbversetztem Rapport die halbe. Damit liegt jede Bahn auf dem Muster,
 * ohne dass die Oberfläche die tatsächliche Anordnung auf der Wand kennen muss. Das ist die
 * **vorsichtige** Zahl: sie reserviert für jede Bahn den passenden Anschnitt und liegt damit
 * über dem theoretischen Optimum, das man erst beim Kleben sieht. Der Test hält beides fest
 * (Vielfaches des Schritts, nie kürzer als die Wandhöhe plus Zugabe).
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral, die
 * Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind Rechenweg und stehen
 * deshalb hier.
 */

/** Aus welcher Richtung der Zuschnitt eines Musters kommt. */
export type PatternRepeat = 'free' | 'straight' | 'half'

export type PaintValueSource = 'sourced' | 'experience'

export interface PaintSourceValue {
  readonly value: number
  readonly source: PaintValueSource
}

/**
 * Vorschlagswerte.
 *
 * Belegt (frei zugängliche Fachquellen, Zahlen dort genannt; im Projektkonzept
 * „Handwerkerwerkzeuge" geführt):
 * - Dispersionsfarbe 6 bis 8 m² je Liter für einen Anstrich auf glattem Untergrund
 *   (`techeld.de`, `rechenfix.de`) — Vorgabe 7 m²/l, die Mitte des genannten Bereichs.
 * - Standardrolle 0,53 × 10,05 m (`techeld.de`, `rechenfix.de`).
 *
 * Als Erfahrungswert gekennzeichnet (`'experience'`), weil keine genannte Fachquelle mit einer
 * konkreten Zahl gefunden wurde: die Fläche je Tür (2,0 m²) und je Fenster (1,5 m²), die Breiten
 * (0,9 m / 1,2 m), die Zugabe oben und unten (0,10 m) sowie die Gebindegröße (5 l).
 */
export const PAINT_DEFAULTS = {
  perimeterM: 12,
  heightM: 2.5,
  doorAreaM2: { value: 2, source: 'experience' } as PaintSourceValue,
  doorWidthM: { value: 0.9, source: 'experience' } as PaintSourceValue,
  windowAreaM2: { value: 1.5, source: 'experience' } as PaintSourceValue,
  windowWidthM: { value: 1.2, source: 'experience' } as PaintSourceValue,
  coverageSqmPerLitre: { value: 7, source: 'sourced' } as PaintSourceValue,
  tinSizeL: { value: 5, source: 'experience' } as PaintSourceValue,
  rollLengthM: { value: 10.05, source: 'sourced' } as PaintSourceValue,
  rollWidthM: { value: 0.53, source: 'sourced' } as PaintSourceValue,
  cutAllowanceM: { value: 0.1, source: 'experience' } as PaintSourceValue
} as const

export const PAINT_LIMITS = {
  perimeterM: { min: 0.5, max: 2000 },
  heightM: { min: 0.5, max: 20 },
  /** Zusätzlicher Abzug neben Türen und Fenstern, etwa eine Durchreiche. */
  extraDeductionM2: { min: 0, max: 2000 },
  openings: { min: 0, max: 200 },
  openingAreaM2: { min: 0, max: 50 },
  openingWidthM: { min: 0, max: 20 },
  /** Anstriche; mehr als drei sind unüblich, vier bleiben zulässig. */
  coats: { min: 1, max: 4 },
  coverageSqmPerLitre: { min: 2, max: 20 },
  tinSizeL: { min: 0.5, max: 30 },
  rollLengthM: { min: 1, max: 50 },
  rollWidthM: { min: 0.2, max: 2 },
  /** Rapportlänge in Metern; 0 bedeutet ansatzfrei. */
  repeatM: { min: 0, max: 2 },
  cutAllowanceM: { min: 0, max: 1 }
} as const

export interface PaintInput {
  /** Umfang der zu tapezierenden/streichenden Wandfläche in Metern. */
  readonly perimeterM: number
  readonly heightM: number
  readonly doorCount: number
  readonly doorAreaM2: number
  readonly doorWidthM: number
  readonly windowCount: number
  readonly windowAreaM2: number
  readonly windowWidthM: number
  readonly extraDeductionM2: number
  readonly coats: number
  readonly coverageSqmPerLitre: number
  readonly tinSizeL: number
  readonly rollLengthM: number
  readonly rollWidthM: number
  readonly repeatM: number
  readonly repeat: PatternRepeat
  readonly cutAllowanceM: number
}

export interface PaintResult {
  /** Wandfläche roh, vor Abzügen. */
  readonly grossAreaM2: number
  readonly deductionAreaM2: number
  /** Nettofläche — Grundlage für Anstrich und Bahnen. */
  readonly netAreaM2: number
  /** Nutzbare Wandbreite nach Abzug der Öffnungsbreiten. */
  readonly netWidthM: number

  readonly paintLitres: number
  readonly paintTins: number
  readonly paintLitresPerCoat: number

  /** Zuschnittlänge je Bahn in Metern (Vielfaches des Ansatzschrittes). */
  readonly cutLengthM: number
  /** Ansatzschritt: Rapportlänge, halbe Rapportlänge oder gar keiner. */
  readonly repeatStepM: number
  readonly drops: number
  readonly dropsPerRoll: number
  readonly rolls: number
  /** Verschnitt: gekaufte Bahnenfläche abzüglich benötigter Zuschnitte. */
  readonly offcutAreaM2: number
  readonly formulas: readonly string[]
}

export type PaintCheck =
  | { readonly ok: true; readonly result: PaintResult }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/**
 * Zuschnittlänge je Bahn: Wandhöhe plus Zugabe, aufgerundet auf den Ansatzschritt.
 *
 * Bei ansatzfreiem Muster ist der Schritt null — dann wird genau die Wandhöhe plus Zugabe
 * zugeschnitten. Der Rückgabewert ist nie kürzer als `height + allowance`, weil immer
 * **auf**gerundet wird.
 */
export function cutLengthFor(heightM: number, allowanceM: number, repeatM: number, repeat: PatternRepeat): number {
  const needed = heightM + allowanceM
  if (repeat === 'free' || repeatM <= 0) return needed
  const step = repeat === 'half' ? repeatM / 2 : repeatM
  return Math.ceil(needed / step) * step
}

/** Bahnen, die aus einer Rolle kommen — abgerundet, angebrochene Bahnen gibt es nicht. */
export function dropsPerRoll(rollLengthM: number, cutLengthM: number): number {
  return Math.floor(rollLengthM / cutLengthM)
}

/**
 * Rechnet Anstrichbedarf und Tapetenbedarf.
 *
 * Fehlerkennungen sind sprachneutral und werden in der Oberfläche übersetzt:
 * `empty` (fehlender oder unlesbarer Wert), `perimeter` (Umfang außerhalb des Bereichs),
 * `height` (Wandhöhe), `deduction` (Abzüge größer als die Wandfläche — dann bleibt nichts
 * zu streichen), `coats` (Anstriche), `coverage` (Ergiebigkeit), `tin` (Gebindegröße),
 * `roll` (Rollenlänge oder -breite), `repeat` (Rapport), `allowance` (Zugabe),
 * `openings` (Stückzahlen), `drops` (Rollenlänge reicht nicht für eine Bahn).
 */
export function planPaint(input: PaintInput): PaintCheck {
  const {
    perimeterM, heightM,
    doorCount, doorAreaM2, doorWidthM,
    windowCount, windowAreaM2, windowWidthM,
    extraDeductionM2,
    coats, coverageSqmPerLitre, tinSizeL,
    rollLengthM, rollWidthM, repeatM, repeat, cutAllowanceM
  } = input

  for (const value of [
    perimeterM, heightM, doorCount, doorAreaM2, doorWidthM, windowCount, windowAreaM2, windowWidthM,
    extraDeductionM2, coats, coverageSqmPerLitre, tinSizeL, rollLengthM, rollWidthM, repeatM, cutAllowanceM
  ]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!within(perimeterM, PAINT_LIMITS.perimeterM)) return { ok: false, errorKey: 'tool.paint.error.perimeter' }
  if (!within(heightM, PAINT_LIMITS.heightM)) return { ok: false, errorKey: 'tool.paint.error.height' }
  if (doorCount < 0 || windowCount < 0 || doorCount > PAINT_LIMITS.openings.max || windowCount > PAINT_LIMITS.openings.max) {
    return { ok: false, errorKey: 'tool.paint.error.openings' }
  }
  if (!within(doorAreaM2, PAINT_LIMITS.openingAreaM2) || !within(windowAreaM2, PAINT_LIMITS.openingAreaM2)) {
    return { ok: false, errorKey: 'tool.paint.error.openingArea' }
  }
  if (!within(doorWidthM, PAINT_LIMITS.openingWidthM) || !within(windowWidthM, PAINT_LIMITS.openingWidthM)) {
    return { ok: false, errorKey: 'tool.paint.error.openingWidth' }
  }
  if (!within(extraDeductionM2, PAINT_LIMITS.extraDeductionM2)) return { ok: false, errorKey: 'tool.paint.error.deduction' }
  if (!within(coats, PAINT_LIMITS.coats)) return { ok: false, errorKey: 'tool.paint.error.coats' }
  if (!within(coverageSqmPerLitre, PAINT_LIMITS.coverageSqmPerLitre)) return { ok: false, errorKey: 'tool.paint.error.coverage' }
  if (!within(tinSizeL, PAINT_LIMITS.tinSizeL)) return { ok: false, errorKey: 'tool.paint.error.tin' }
  if (!within(rollLengthM, PAINT_LIMITS.rollLengthM) || !within(rollWidthM, PAINT_LIMITS.rollWidthM)) {
    return { ok: false, errorKey: 'tool.paint.error.roll' }
  }
  if (!within(repeatM, PAINT_LIMITS.repeatM)) return { ok: false, errorKey: 'tool.paint.error.repeat' }
  if (!within(cutAllowanceM, PAINT_LIMITS.cutAllowanceM)) return { ok: false, errorKey: 'tool.paint.error.allowance' }

  const grossAreaM2 = perimeterM * heightM
  const deductionAreaM2 = doorCount * doorAreaM2 + windowCount * windowAreaM2 + extraDeductionM2
  const netAreaM2 = grossAreaM2 - deductionAreaM2
  if (netAreaM2 <= 0) return { ok: false, errorKey: 'tool.paint.error.deduction' }

  const netWidthM = perimeterM - doorCount * doorWidthM - windowCount * windowWidthM
  if (netWidthM <= 0) return { ok: false, errorKey: 'tool.paint.error.deduction' }

  const paintLitresPerCoat = netAreaM2 / coverageSqmPerLitre
  const paintLitres = paintLitresPerCoat * coats
  const paintTins = Math.ceil(paintLitres / tinSizeL)

  const cutLengthM = cutLengthFor(heightM, cutAllowanceM, repeatM, repeat)
  const repeatStepM = repeat === 'free' || repeatM <= 0 ? 0 : repeat === 'half' ? repeatM / 2 : repeatM
  const perRoll = dropsPerRoll(rollLengthM, cutLengthM)
  if (perRoll < 1) return { ok: false, errorKey: 'tool.paint.error.drops' }
  const drops = Math.ceil(netWidthM / rollWidthM)
  const rolls = Math.ceil(drops / perRoll)
  const offcutAreaM2 = rolls * rollLengthM * rollWidthM - drops * cutLengthM * rollWidthM

  return {
    ok: true,
    result: {
      grossAreaM2,
      deductionAreaM2,
      netAreaM2,
      netWidthM,
      paintLitres,
      paintLitresPerCoat,
      paintTins,
      cutLengthM,
      repeatStepM,
      drops,
      dropsPerRoll: perRoll,
      rolls,
      offcutAreaM2,
      formulas: [
        'G = U · H',
        'Abzüge = Türen · Fläche + Fenster · Fläche + weiterer Abzug',
        'N = G − Abzüge',
        'Breite = U − Türen · Breite − Fenster · Breite',
        'Z = (H + Zugabe) aufgerundet auf den Ansatzschritt',
        'B je Rolle = abrunden( Rollenlänge / Z )',
        'B = aufgerundet( Breite / Bahnbreite )',
        'Rollen = aufgerundet( B / B je Rolle )',
        'F = N / Ergiebigkeit',
        'F gesamt = N · Anstriche / Ergiebigkeit',
        'Gebinde = aufgerundet( F / Gebindegröße )',
        'Verschnitt = Rollen · Rollenlänge · Bahnbreite − B · Z · Bahnbreite'
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
