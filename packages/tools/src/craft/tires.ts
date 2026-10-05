/**
 * Kern des Werkzeugs „Reifen und Drehmoment" (Welle C der Suite „Handwerk").
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — Reifengröße (Beispiel 205/55 R16, Bezugsgröße 195/65 R15):
 *   Flankenhöhe      H   = B · S / 100                     = 205 · 55 / 100          = 112,75 mm
 *   Außendurchmesser D   = Zoll · 25,4 + 2 · H             = 406,4 + 225,5           = 631,90 mm
 *   Umfang           U   = π · D                           = π · 631,90 mm           = 1,9851 m
 *   Umdrehungen/km   nₖ  = 1.000.000 / U                   = 503,75 1/km
 *   Drehzahl         n_v = v / U · 1.000.000 / 60          = bei 100 km/h 839,6 U/min
 *   Vergleich        ΔU  = U Ist / U Bezug − 1             = −0,63 %  (Bezug 195/65 R15)
 *   Bei gleicher Raddrehzahl zeigt der Tacho 100 km/h, gefahren werden 99,37 km/h.
 *
 * Rechenweg — Anzugsmoment (Beispiel 120 Nm):
 *   ft·lb = Nm · 0,7375621   = 88,51 ft·lb
 *   kgf·m = Nm · 0,1019716   = 12,24 kgf·m
 *   Bereich bei ±5 % Toleranz: 114 Nm bis 126 Nm
 *
 * Wichtig: Der **Anzugswert selbst** wird nicht gerechnet und nicht vorgeschlagen — er kommt
 * vom Fahrzeughersteller (Betriebsanleitung, Werkstatthandbuch) und hängt von Gewindemaß,
 * Festigkeitsklasse, Rad und Befestigungsart ab. Dieses Werkzeug rechnet ausschließlich die
 * Einheiten um und den Toleranzbereich aus.
 *
 * Wichtig: Der **Abrollumfang** ist etwas kleiner als der Kreisumfang des Außendurchmessers
 * (der Reifen wölbt sich unter Last, je nach Bauart und Druck ein bis drei Prozent). Gerechnet
 * wird hier der geometrische Umfang; die Annahmen benennen das ausdrücklich, damit der
 * Tacho-Vergleich nicht für bare Münze genommen wird.
 */

/** Herkunft eines Vorschlagswerts: belegt (sourced) oder Erfahrungswert (experience). */
export type TireSource = 'sourced' | 'experience'

export interface TireSourceValue {
  readonly value: number
  readonly source: TireSource
}

/** Grenzen der Eingaben — jede wird einzeln geprüft. */
export const TIRE_LIMITS = {
  /** Reifenbreite in mm. */
  widthMm: { min: 100, max: 400 },
  /** Querschnittsverhältnis in Prozent. */
  profilePercent: { min: 20, max: 100 },
  /** Felgendurchmesser in Zoll. */
  rimInch: { min: 10, max: 26 },
  /** Bezugsgröße: Breite in mm. */
  referenceWidthMm: { min: 100, max: 400 },
  /** Bezugsgröße: Querschnitt in Prozent. */
  referenceProfilePercent: { min: 20, max: 100 },
  /** Bezugsgröße: Felge in Zoll. */
  referenceRimInch: { min: 10, max: 26 },
  /** Gefahrene Geschwindigkeit in km/h. */
  speedKmh: { min: 1, max: 400 },
  /** Anzugsmoment in Nm. */
  torqueNm: { min: 1, max: 2000 },
  /** Toleranz des Anzugswerts in Prozent. */
  tolerancePercent: { min: 0, max: 30 }
} as const

/** Vorschlagswerte mit Herkunft. */
export const TIRE_DEFAULTS = {
  /** Beispielgröße, wie sie in Fahrzeugscheinen steht — als Beispiel gekennzeichnet. */
  widthMm: { value: 205, source: 'experience' } as TireSourceValue,
  profilePercent: { value: 55, source: 'experience' } as TireSourceValue,
  rimInch: { value: 16, source: 'experience' } as TireSourceValue,
  referenceWidthMm: { value: 195, source: 'experience' } as TireSourceValue,
  referenceProfilePercent: { value: 65, source: 'experience' } as TireSourceValue,
  referenceRimInch: { value: 15, source: 'experience' } as TireSourceValue,
  speedKmh: { value: 100, source: 'experience' } as TireSourceValue,
  /** 120 Nm ist ein verbreiteter Anzugswert für Pkw-Radschrauben — als Beispiel, nicht als Vorgabe. */
  torqueNm: { value: 120, source: 'experience' } as TireSourceValue,
  tolerancePercent: { value: 5, source: 'experience' } as TireSourceValue
} as const

export interface TireInput {
  /** Reifenbreite in mm (erste Zahl der Größe). */
  readonly widthMm: number
  /** Querschnittsverhältnis in Prozent (zweite Zahl der Größe). */
  readonly profilePercent: number
  /** Felgendurchmesser in Zoll (Zahl hinter dem R). */
  readonly rimInch: number
  /** Bezugsgröße für den Vergleich — Breite in mm. */
  readonly referenceWidthMm: number
  readonly referenceProfilePercent: number
  readonly referenceRimInch: number
  /** Gefahrene Geschwindigkeit in km/h; bestimmt die Raddrehzahl. */
  readonly speedKmh: number
  /** Anzugsmoment in Nm, wie vom Hersteller vorgegeben. */
  readonly torqueNm: number
  /** Zulässige Abweichung des Anzugswerts in Prozent. */
  readonly tolerancePercent: number
}

export interface TireResult {
  /** Flankenhöhe in mm. */
  readonly sidewallMm: number
  /** Außendurchmesser in mm. */
  readonly diameterMm: number
  /** Geometrischer Umfang in m. */
  readonly circumferenceM: number
  /** Umdrehungen je Kilometer. */
  readonly revolutionsPerKm: number
  /** Raddrehzahl bei der eingegebenen Geschwindigkeit, Umdrehungen je Minute. */
  readonly wheelRpm: number
  /** Umfang der Bezugsgröße in m. */
  readonly referenceCircumferenceM: number
  /** Abweichung des Umfangs gegenüber der Bezugsgröße in Prozent. */
  readonly circumferenceDeviationPercent: number
  /** Tatsächlich gefahrene Geschwindigkeit bei gleicher Raddrehzahl in km/h. */
  readonly trueSpeedKmh: number
  /** Anzugsmoment in Pound-force foot (ft·lb). */
  readonly torqueFtLb: number
  /** Anzugsmoment in Kilogramm-Kraft mal Meter (kgf·m). */
  readonly torqueKgfM: number
  /** Untere Grenze des Anzugswerts in Nm. */
  readonly torqueMinNm: number
  /** Obere Grenze des Anzugswerts in Nm. */
  readonly torqueMaxNm: number
  /** Schrittweiser Rechenweg, einer je Ergebniszeile. */
  readonly formulas: readonly string[]
}

export type TireCheck =
  | { readonly ok: true; readonly result: TireResult }
  | { readonly ok: false; readonly errorKey: string }

const within = (value: number, range: { min: number; max: number }): boolean =>
  value >= range.min && value <= range.max

/** Umrechnungsfaktoren, belegt über die Definition der Einheiten. */
export const FOOT_POUND_PER_NEWTON_METER = 0.73756214927727
export const KILOGRAM_FORCE_METER_PER_NEWTON_METER = 0.10197162129779

/** Ein Zoll sind exakt 25,4 mm. */
export const MM_PER_INCH = 25.4

/** Flankenhöhe eines Reifens in mm. */
export function sidewallHeight(widthMm: number, profilePercent: number): number {
  return (widthMm * profilePercent) / 100
}

/** Außendurchmesser eines Reifens in mm: Felge plus zwei Flankenhöhen. */
export function outerDiameter(widthMm: number, profilePercent: number, rimInch: number): number {
  return rimInch * MM_PER_INCH + 2 * sidewallHeight(widthMm, profilePercent)
}

/** Geometrischer Umfang eines Reifens in Metern. */
export function circumferenceM(widthMm: number, profilePercent: number, rimInch: number): number {
  return (Math.PI * outerDiameter(widthMm, profilePercent, rimInch)) / 1000
}

/** Raddrehzahl in Umdrehungen je Minute bei einer Geschwindigkeit in km/h. */
export function wheelRpm(circumference: number, speedKmh: number): number {
  return (speedKmh * 1000) / circumference / 60
}

/**
 * Rechnet Reifengröße und Anzugsmoment durch.
 *
 * Fehlerkennungen: `length`-Fehler gibt es hier nicht; die Kennungen nennen das betroffene Feld,
 * damit die Oberfläche dieselbe Meldung zeigen kann wie ein zulässiger Wert sie erzeugt.
 */
export function planTires(input: TireInput): TireCheck {
  const {
    widthMm, profilePercent, rimInch,
    referenceWidthMm, referenceProfilePercent, referenceRimInch,
    speedKmh, torqueNm, tolerancePercent
  } = input

  for (const value of [
    widthMm, profilePercent, rimInch,
    referenceWidthMm, referenceProfilePercent, referenceRimInch,
    speedKmh, torqueNm, tolerancePercent
  ]) {
    if (!Number.isFinite(value)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }

  if (!within(widthMm, TIRE_LIMITS.widthMm)) return { ok: false, errorKey: 'tool.tires.error.width' }
  if (!within(profilePercent, TIRE_LIMITS.profilePercent)) return { ok: false, errorKey: 'tool.tires.error.profile' }
  if (!within(rimInch, TIRE_LIMITS.rimInch)) return { ok: false, errorKey: 'tool.tires.error.rim' }
  if (!within(referenceWidthMm, TIRE_LIMITS.referenceWidthMm)) return { ok: false, errorKey: 'tool.tires.error.referenceWidth' }
  if (!within(referenceProfilePercent, TIRE_LIMITS.referenceProfilePercent)) return { ok: false, errorKey: 'tool.tires.error.referenceProfile' }
  if (!within(referenceRimInch, TIRE_LIMITS.referenceRimInch)) return { ok: false, errorKey: 'tool.tires.error.referenceRim' }
  if (!within(speedKmh, TIRE_LIMITS.speedKmh)) return { ok: false, errorKey: 'tool.tires.error.speed' }
  if (!within(torqueNm, TIRE_LIMITS.torqueNm)) return { ok: false, errorKey: 'tool.tires.error.torque' }
  if (!within(tolerancePercent, TIRE_LIMITS.tolerancePercent)) return { ok: false, errorKey: 'tool.tires.error.tolerance' }

  const sidewall = sidewallHeight(widthMm, profilePercent)
  const diameter = outerDiameter(widthMm, profilePercent, rimInch)
  const circumference = circumferenceM(widthMm, profilePercent, rimInch)
  const referenceCircumference = circumferenceM(referenceWidthMm, referenceProfilePercent, referenceRimInch)
  const revolutions = 1000 / circumference
  const rpm = wheelRpm(circumference, speedKmh)
  const deviation = (circumference / referenceCircumference - 1) * 100
  // Gleiche Raddrehzahl: der Tacho zeigt `speedKmh`, gefahren wird der um das Umfangsverhältnis
  // versetzte Wert. Ein größerer Reifen legt je Umdrehung mehr Weg zurück als angezeigt.
  const trueSpeed = speedKmh * (circumference / referenceCircumference)
  const torqueFtLb = torqueNm * FOOT_POUND_PER_NEWTON_METER
  const torqueKgfM = torqueNm * KILOGRAM_FORCE_METER_PER_NEWTON_METER
  const torqueMin = torqueNm * (1 - tolerancePercent / 100)
  const torqueMax = torqueNm * (1 + tolerancePercent / 100)

  return {
    ok: true,
    result: {
      sidewallMm: sidewall,
      diameterMm: diameter,
      circumferenceM: circumference,
      revolutionsPerKm: revolutions,
      wheelRpm: rpm,
      referenceCircumferenceM: referenceCircumference,
      circumferenceDeviationPercent: deviation,
      trueSpeedKmh: trueSpeed,
      torqueFtLb,
      torqueKgfM,
      torqueMinNm: torqueMin,
      torqueMaxNm: torqueMax,
      formulas: [
        'H = B · S / 100',
        'D = Zoll · 25,4 + 2 · H',
        'U = π · D',
        'nₖ = 1.000.000 / U',
        'n_v = v / U / 60',
        'U₂ = π · D₂',
        'ΔU = (U / U₂ − 1) · 100',
        'v_ist = v_Anzeige · U / U₂',
        'M_ft·lb = M_Nm · 0,7375621',
        'M_kgf·m = M_Nm · 0,1019716',
        'M_min = M · (1 − Toleranz / 100)',
        'M_max = M · (1 + Toleranz / 100)'
      ]
    }
  }
}

/**
 * Rundet auf zwölf gültige Stellen — die Anzeige soll lesbar sein, ohne die Rechnung zu
 * beschönigen: Zwölf Stellen sind mehr, als jedes Eingabefeld hergibt.
 */
export function roundForDisplay(value: number): number {
  if (!Number.isFinite(value) || value === 0) return value
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (11 - magnitude)
  return Math.round(value * factor) / factor
}
