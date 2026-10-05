/**
 * Kern des Werkzeugs „Trockenbau" (Welle B der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — **Platten werden in Bahnen gestellt, nicht aus der Fläche geteilt.**
 * Wer die Fläche durch die Plattenfläche teilt, rechnet zu knapp: Eine Wand von
 * 2,60 m Höhe mit 2,00 m langen Platten braucht **zwei** Platten je Bahn, und der
 * Rest der zweiten lässt sich nicht anstückeln. Deshalb:
 *
 *   N   = U · H − Abzüge                          Nettofläche (m²)
 *   B   = aufrunden( U / Plattenbreite )          Bahnen (Streifen)
 *   Pb  = aufrunden( H / Plattenlänge )           Platten je Bahn
 *   P   = B · Pb · Lagen                          Platten gesamt
 *   Ständer = aufrunden( U / Abstand ) + 1
 *   Profilmeter = Ständer · H
 *   CW-Profile = aufrunden( Profilmeter / Profillänge )
 *   UW  = aufrunden( 2 · U / Profillänge )
 *   Schrauben = N · Lagen · Schrauben je m²
 *   S   = N · Lagen · Spachtelmasse je m²
 *   Band = N · (a + b) / (a · b)                  Fugendeckstreifen (m)
 *
 * **Zwei Modellentscheidungen, die den Unterschied machen** (beide im Test festgehalten):
 *
 * 1. Die Bahnen laufen über die **volle** Wandbreite. Türen und Fenster werden aus der
 *    Platte herausgeschnitten, sie nehmen der Wand keine ganze Bahn weg; nur die Fläche
 *    wird um sie verringert. Wer beides abzieht, rechnet doppelt und kommt auf weniger
 *    Plattenfläche, als die Wand überhaupt hat. (Bei der Tapete ist es umgekehrt: sie
 *    lässt sich nicht anstückeln, dort zählt die gekürzte Breite.)
 * 2. Profile werden über die **Profilmeter** gekauft, nicht je Ständer aus einem Stück:
 *    Der Rest eines 4-m-Profils ist für kurze Stücke weiter verwendbar. Die Gegenprobe im
 *    Test zeigt den Unterschied (17 Ständer aus 2,60 m Wandhöhe: 54,60 m Profil → 14
 *    Profile, nicht 17).
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral, die
 * Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind Rechenweg und
 * stehen deshalb hier.
 */

export type DrywallValueSource = 'sourced' | 'experience'

export interface DrywallSourceValue {
  readonly value: number
  readonly source: DrywallValueSource
}

/** Anzahl der Beplankungslagen. */
export type DrywallLayers = 1 | 2

/**
 * Vorschlagswerte.
 *
 * Belegt (im Projektkonzept „Handwerkerwerkzeuge" mit Quelle geführt): Plattenmaß
 * 2,00 × 1,25 m (Gipsbauplatte, das in Deutschland gebräuchliche Maß) und der Ständerabstand
 * 0,625 m für die senkrechte Beplankung mit 1,25 m breiten Platten — beides sind Hersteller-
 * und Systemangaben, keine Normaussage.
 *
 * Als Erfahrungswert gekennzeichnet (`'experience'`), weil keine genannte Fachquelle mit einer
 * konkreten Zahl gefunden wurde: Profillänge (4,0 m), Schrauben je m² und Lage (25),
 * Spachtelmasse je m² und Lage (0,35 kg), Sackgröße (25 kg) sowie Fläche und Breite je Tür
 * (2,0 m² / 0,9 m) und je Fenster (1,5 m² / 1,2 m) — dieselben Werte wie im Farbwerkzeug.
 */
export const DRYWALL_DEFAULTS = {
  perimeterM: 12,
  heightM: 2.6,
  doorAreaM2: { value: 2, source: 'experience' } as DrywallSourceValue,
  windowAreaM2: { value: 1.5, source: 'experience' } as DrywallSourceValue,
  plateLengthM: { value: 2, source: 'sourced' } as DrywallSourceValue,
  plateWidthM: { value: 1.25, source: 'sourced' } as DrywallSourceValue,
  studSpacingM: { value: 0.625, source: 'sourced' } as DrywallSourceValue,
  profileLengthM: { value: 4, source: 'experience' } as DrywallSourceValue,
  screwsPerSqm: { value: 25, source: 'experience' } as DrywallSourceValue,
  fillerPerSqm: { value: 0.35, source: 'experience' } as DrywallSourceValue,
  bagSizeKg: { value: 25, source: 'experience' } as DrywallSourceValue
} as const

export const DRYWALL_LIMITS = {
  perimeterM: { min: 0.5, max: 2000 },
  heightM: { min: 0.3, max: 20 },
  openings: { min: 0, max: 200 },
  openingAreaM2: { min: 0, max: 50 },
  plateLengthM: { min: 0.5, max: 6 },
  plateWidthM: { min: 0.4, max: 2 },
  /** Ständerabstand; 0,625 m ist die Regel für 1,25 m breite Platten. */
  studSpacingM: { min: 0.2, max: 1.25 },
  profileLengthM: { min: 1, max: 8 },
  screwsPerSqm: { min: 5, max: 80 },
  fillerPerSqm: { min: 0.05, max: 3 },
  bagSizeKg: { min: 1, max: 50 }
} as const

export interface DrywallInput {
  readonly perimeterM: number
  readonly heightM: number
  readonly doorCount: number
  readonly doorAreaM2: number
  readonly windowCount: number
  readonly windowAreaM2: number
  readonly layers: DrywallLayers
  readonly plateLengthM: number
  readonly plateWidthM: number
  readonly studSpacingM: number
  readonly profileLengthM: number
  readonly screwsPerSqm: number
  readonly fillerPerSqm: number
  readonly bagSizeKg: number
}

export interface DrywallResult {
  readonly grossAreaM2: number
  readonly deductionAreaM2: number
  readonly netAreaM2: number
  /**
   * Wandbreite, über die die Bahnen laufen.
   *
   * **Sie ist bewusst die volle Breite, nicht die um Öffnungen gekürzte:** Türen und Fenster
   * schneidet der Trockenbauer aus der Platte heraus, sie nehmen der Wand also keine ganze Bahn
   * weg (anders als bei der Tapete, die sich nicht anstückeln lässt). Nur die **Fläche** wird um
   * die Öffnungen verringert. Wer die Breite ebenfalls kürzt, rechnet doppelt ab und kommt auf
   * weniger Plattenfläche als die Wand überhaupt hat — genau dieser Fehler stand im ersten
   * Entwurf dieses Werkzeugs und ist im Test als Gegenprobe festgehalten.
   */
  readonly widthM: number

  /** Senkrechte Plattenstreifen (Bahnen). */
  readonly strips: number
  /** Platten je Bahn — aufgerundet, weil der Rest der letzten Platte nicht anstückelbar ist. */
  readonly platesPerStrip: number
  readonly platesPerLayer: number
  readonly plates: number
  readonly plateAreaM2: number
  /** Verschnitt: gekaufte Plattenfläche abzüglich benötigter Fläche. */
  readonly offcutAreaM2: number

  readonly studs: number
  /** Profilmeter für die Ständer (Ständer · Wandhöhe). */
  readonly studMeters: number
  readonly studProfiles: number
  readonly trackProfiles: number

  readonly screws: number
  readonly fillerKg: number
  readonly fillerBags: number
  readonly fillerRemainderKg: number
  /** Fugendeckstreifen über die Fugen der sichtbaren Lage. */
  readonly tapeMeters: number

  readonly formulas: readonly string[]
}

export type DrywallCheck =
  | { readonly ok: true; readonly result: DrywallResult }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Plattenstreifen über eine Breite: immer aufgerundet. */
export function stripsFor(widthM: number, plateWidthM: number): number {
  return Math.ceil(widthM / plateWidthM)
}

/** Platten je Streifen: die Wandhöhe geteilt durch die Plattenlänge, aufgerundet. */
export function platesPerStripFor(heightM: number, plateLengthM: number): number {
  return Math.ceil(heightM / plateLengthM)
}

/** Fugenlänge je m² in Metern für Platten der Größe a × b (in Metern). */
export function jointLengthPerMeterFromFormat(plateLengthM: number, plateWidthM: number): number {
  return (plateLengthM + plateWidthM) / (plateLengthM * plateWidthM)
}

/**
 * Rechnet Platten-, Profil-, Schrauben-, Spachtel- und Bandbedarf einer Trockenbauwand.
 *
 * Fehlerkennungen sind sprachneutral und werden in der Oberfläche übersetzt:
 * `empty`, `perimeter`, `height`, `openings`, `openingArea`, `plate` (Plattenmaß),
 * `spacing` (Ständerabstand), `profile` (Profillänge), `screws`, `filler`, `bag`,
 * `deduction` (Abzüge größer als die Wandfläche).
 */
export function planDrywall(input: DrywallInput): DrywallCheck {
  const {
    perimeterM, heightM,
    doorCount, doorAreaM2, windowCount, windowAreaM2,
    layers, plateLengthM, plateWidthM, studSpacingM, profileLengthM,
    screwsPerSqm, fillerPerSqm, bagSizeKg
  } = input

  for (const value of [
    perimeterM, heightM, doorCount, doorAreaM2, windowCount, windowAreaM2,
    layers, plateLengthM, plateWidthM, studSpacingM, profileLengthM, screwsPerSqm, fillerPerSqm, bagSizeKg
  ]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }
  if (!within(perimeterM, DRYWALL_LIMITS.perimeterM)) return { ok: false, errorKey: 'tool.drywall.error.perimeter' }
  if (!within(heightM, DRYWALL_LIMITS.heightM)) return { ok: false, errorKey: 'tool.drywall.error.height' }
  if (doorCount < 0 || windowCount < 0 || doorCount > DRYWALL_LIMITS.openings.max || windowCount > DRYWALL_LIMITS.openings.max) {
    return { ok: false, errorKey: 'tool.drywall.error.openings' }
  }
  if (!within(doorAreaM2, DRYWALL_LIMITS.openingAreaM2) || !within(windowAreaM2, DRYWALL_LIMITS.openingAreaM2)) {
    return { ok: false, errorKey: 'tool.drywall.error.openingArea' }
  }
  if (layers !== 1 && layers !== 2) return { ok: false, errorKey: 'tool.drywall.error.layers' }
  if (!within(plateLengthM, DRYWALL_LIMITS.plateLengthM) || !within(plateWidthM, DRYWALL_LIMITS.plateWidthM)) {
    return { ok: false, errorKey: 'tool.drywall.error.plate' }
  }
  if (!within(studSpacingM, DRYWALL_LIMITS.studSpacingM)) return { ok: false, errorKey: 'tool.drywall.error.spacing' }
  if (!within(profileLengthM, DRYWALL_LIMITS.profileLengthM)) return { ok: false, errorKey: 'tool.drywall.error.profile' }
  if (!within(screwsPerSqm, DRYWALL_LIMITS.screwsPerSqm)) return { ok: false, errorKey: 'tool.drywall.error.screws' }
  if (!within(fillerPerSqm, DRYWALL_LIMITS.fillerPerSqm)) return { ok: false, errorKey: 'tool.drywall.error.filler' }
  if (!within(bagSizeKg, DRYWALL_LIMITS.bagSizeKg)) return { ok: false, errorKey: 'tool.drywall.error.bag' }

  const grossAreaM2 = perimeterM * heightM
  const deductionAreaM2 = doorCount * doorAreaM2 + windowCount * windowAreaM2
  const netAreaM2 = grossAreaM2 - deductionAreaM2
  if (netAreaM2 <= 0) return { ok: false, errorKey: 'tool.drywall.error.deduction' }

  const strips = stripsFor(perimeterM, plateWidthM)
  const platesPerStrip = platesPerStripFor(heightM, plateLengthM)
  const platesPerLayer = strips * platesPerStrip
  const plates = platesPerLayer * layers
  const plateAreaM2 = plateLengthM * plateWidthM
  const offcutAreaM2 = plates * plateAreaM2 - netAreaM2 * layers

  // Ständer: je angefangener Abstand einer, plus einer am Ende der Wand.
  const studs = Math.ceil(perimeterM / studSpacingM) + 1
  const studMeters = studs * heightM
  const studProfiles = Math.ceil(studMeters / profileLengthM)
  // UW-Profile: Boden und Decke über die ganze Länge.
  const trackProfiles = Math.ceil((2 * perimeterM) / profileLengthM)

  const screws = Math.ceil(netAreaM2 * layers * screwsPerSqm)
  const fillerKg = netAreaM2 * layers * fillerPerSqm
  const fillerBags = Math.ceil(fillerKg / bagSizeKg)
  const tapeMeters = netAreaM2 * jointLengthPerMeterFromFormat(plateLengthM, plateWidthM)

  return {
    ok: true,
    result: {
      grossAreaM2,
      deductionAreaM2,
      netAreaM2,
      widthM: perimeterM,
      strips,
      platesPerStrip,
      platesPerLayer,
      plates,
      plateAreaM2,
      offcutAreaM2,
      studs,
      studMeters,
      studProfiles,
      trackProfiles,
      screws,
      fillerKg,
      fillerBags,
      fillerRemainderKg: fillerBags * bagSizeKg - fillerKg,
      tapeMeters,
      formulas: [
        'F = U · H',
        'Abzüge = Türen · Fläche + Fenster · Fläche',
        'N = F − Abzüge',
        'B = aufgerundet( U / Plattenbreite )',
        'P je Bahn = aufgerundet( H / Plattenlänge )',
        'P je Lage = B · P je Bahn',
        'P gesamt = P je Lage · Lagen',
        'Verschnitt = P gesamt · Plattenfläche − N · Lagen',
        'Ständer = aufgerundet( U / Abstand ) + 1',
        'Profilmeter = Ständer · H',
        'CW-Profile = aufgerundet( Profilmeter / Profillänge )',
        'UW = aufgerundet( 2 · U / Profillänge )',
        'Schrauben = N · Lagen · Schrauben je m²',
        'S = N · Lagen · Spachtelmasse je m²',
        'Säcke = aufgerundet( S / Sackgröße )',
        'Band = N · (a + b) / (a · b)'
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
