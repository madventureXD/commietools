/**
 * Kern des Werkzeugs „Leitungsquerschnitt und Spannungsfall" (Welle E, Werkzeug 13).
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg (freie Normformel, siehe Quellenlage `13-leitungsquerschnitt.md`):
 *
 *   ΔU      = b · L · I / (κ · A)
 *   b = 2   einphasig (Hin- und Rückleitung)
 *   b = √3  dreiphasig (symmetrisch)
 *   ΔU%     = ΔU / U · 100
 *   A_erf   = b · L · I / (κ · ΔU_zulässig)
 *
 * Die Umkehrung nach dem Querschnitt löst dieselbe Gleichung nach A auf; der
 * nächstgrößere genormte Querschnitt folgt aus der üblichen Reihe.
 *
 * **Bewusste Entscheidung des Auftraggebers (nicht aufweichen):**
 * Die Strombelastbarkeitstabellen aus DIN VDE 0298-4 dürfen **nicht** ins
 * Werkzeug übernommen werden — die frei abrufbaren Herstellertabellen sind
 * lizenzierte Norm-Auszüge. Deshalb enthält dieses Modul **keine**
 * Strombelastbarkeitstabelle. Die Strombelastbarkeit ist ein **Eingabefeld**
 * („Wert aus Ihrer Tabelle/Norm entnehmen"); das Werkzeug rechnet nur den
 * Spannungsfall und **prüft** ihn gegen den eingegebenen Wert. Ein Test hält
 * ausdrücklich fest, dass kein Datenfeld Ampere-Werte je Querschnitt trägt.
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral,
 * die Beschriftungen kommen aus den Sprachkatalogen. Formeln in Zeichen sind
 * Rechenweg und stehen deshalb hier.
 */

/** Leiterwerkstoff. Nur zwei Materialien — mehr geben die Quellen nicht her. */
export type ConductorMaterial = 'copper' | 'aluminium'

/** Netzform: einphasig (b = 2) oder dreiphasig (b = √3). */
export type PhaseMode = 'single' | 'three'

/** Verwendungszweck bestimmt die Spannungsfallgrenze. */
export type UsageKind = 'lighting' | 'other'

/** Eingabe entweder als Strom direkt oder als Leistung, aus der der Strom folgt. */
export type CurrentInputMode = 'current' | 'power'

/**
 * Spezifische Leitfähigkeit κ in m/(Ω·mm²) je Werkstoff.
 *
 * `sourceKey` benennt die Herkunft im Sprachkatalog. Die Quellen streuen —
 * Kupfer 55…57 (Deutsches Kupferinstitut: 0,017–0,018 Ω·mm²/m), Aluminium
 * 35…36; die Wikipedia-Normnäherung nennt Rechenwerte ρ = 0,0225 bzw. 0,036
 * Ω·mm²/m (≈ κ 44 bzw. 28). Der Hinweis auf die Streuung steht in der
 * Oberfläche (`tool.cable.kappaSpread`), κ selbst ist überschreibbar.
 */
export interface KappaAssumption {
  readonly material: ConductorMaterial
  readonly kappa: number
  readonly sourceKey: string
}

export const kappaAssumptions: readonly KappaAssumption[] = [
  { material: 'copper', kappa: 56, sourceKey: 'tool.cable.kappaSourceCopper' },
  { material: 'aluminium', kappa: 35, sourceKey: 'tool.cable.kappaSourceAluminium' }
]

export function kappaAssumptionFor(material: ConductorMaterial): KappaAssumption {
  return kappaAssumptions.find((wert) => wert.material === material) ?? kappaAssumptions[0]!
}

/**
 * Wählbare Spannungsfallgrenze mit Quellenangabe.
 *
 * 3 % für Beleuchtungsstromkreise, 5 % für andere Verbrauchsmittel — referiert
 * aus DIN VDE 0100-520, Anhang G, Tabelle G.52.1. **Die Norm selbst ist nur
 * über Fachseiten/Wiki referiert, kein frei zugänglicher Primärbeleg** — das
 * sagt der Quellenhinweis in der Oberfläche ausdrücklich.
 */
export interface VoltageDropLimit {
  readonly usage: UsageKind
  readonly percent: number
  readonly sourceKey: string
}

export const voltageDropLimits: readonly VoltageDropLimit[] = [
  { usage: 'lighting', percent: 3, sourceKey: 'tool.cable.limitSourceLighting' },
  { usage: 'other', percent: 5, sourceKey: 'tool.cable.limitSourceOther' }
]

export function voltageDropLimitFor(usage: UsageKind): VoltageDropLimit {
  return voltageDropLimits.find((grenze) => grenze.usage === usage) ?? voltageDropLimits[1]!
}

/**
 * Übliche Querschnittsreihe in mm² (DIN VDE 0295 / Normreihe R10 für die
 * kleinen, R20 für die größeren Stufen). Reine Zahlen — **keine**
 * Strombelastbarkeit, das ist der entscheidende Unterschied.
 */
export const standardCrossSections: readonly number[] = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240
]

/**
 * Grenzen je Eingabefeld. **Je Feld eine Grenze, und jede wird in `planCable`
 * bzw. `currentFromPower` wirklich abgefragt** — ein Grenzwert, der nirgends
 * greift, sieht sonst wie eine geprüfte Zahl aus.
 */
export const cableLimits = {
  voltage: { min: 1, max: 1500 },
  current: { min: 0.1, max: 2000 },
  power: { min: 1, max: 2000000 },
  length: { min: 0.1, max: 5000 },
  kappa: { min: 1, max: 100 },
  ampacity: { min: 0.1, max: 5000 }
} as const

export interface CableInput {
  readonly phaseMode: PhaseMode
  readonly voltage: number
  readonly current: number
  readonly lengthMeters: number
  readonly kappa: number
  readonly usage: UsageKind
  /** Die vom Nutzer eingegebene Strombelastbarkeit — nicht aus einer Tabelle. */
  readonly ampacity: number
}

export interface CableResult {
  /** Spannungsfallgrenze in Prozent (3 oder 5). */
  readonly limitPercent: number
  /** Zulässiger Spannungsfall in Volt (aus Grenze und Spannung). */
  readonly maxDropVolts: number
  /** Querschnitt, bei dem der Spannungsfall ausgewiesen wird (der Vorschlag). */
  readonly dropCrossSection: number
  /** Gerechneter Spannungsfall in Volt beim vorgeschlagenen Querschnitt. */
  readonly dropVolts: number
  /** Gerechneter Spannungsfall in Prozent der Nennspannung. */
  readonly dropPercent: number
  /** Liegt der Spannungsfall innerhalb der Grenze? */
  readonly withinLimit: boolean
  /** Kleinster Querschnitt, der die Spannungsfallgrenze einhält (ungerundet, mm²). */
  readonly requiredCrossSection: number
  /** Nächstgrößerer genormter Querschnitt (mm²) oder `null`, wenn die Reihe nicht reicht. */
  readonly chosenCrossSection: number | null
  /** Wahr, wenn der benötigte Querschnitt über die Reihe hinausgeht. */
  readonly beyondSeries: boolean
  /** Auslastung gegen die eingegebene Strombelastbarkeit in Prozent. */
  readonly utilisationPercent: number
  /** Liegt der Strom innerhalb der eingegebenen Strombelastbarkeit? */
  readonly ampacityWithin: boolean
  /** Rechenweg in Formelzeichen, wie ihn die Oberfläche zeigt. */
  readonly formulas: readonly string[]
}

export type CableCheck =
  | { readonly ok: true; readonly result: CableResult }
  | { readonly ok: false; readonly errorKey: string }

export type CurrentCheck =
  | { readonly ok: true; readonly current: number }
  | { readonly ok: false; readonly errorKey: string }

function within(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Faktor b der Netzform: 2 einphasig, √3 dreiphasig. */
export function phaseFactor(mode: PhaseMode): number {
  return mode === 'three' ? Math.sqrt(3) : 2
}

/**
 * Spannungsfall in Volt: `b · L · I / (κ · A)`.
 * Alle Maße in SI-nahen Einheiten: L in m, I in A, κ in m/(Ω·mm²), A in mm².
 */
export function voltageDropVolts(input: {
  readonly phaseMode: PhaseMode
  readonly lengthMeters: number
  readonly current: number
  readonly kappa: number
  readonly crossSection: number
}): number {
  return (phaseFactor(input.phaseMode) * input.lengthMeters * input.current) / (input.kappa * input.crossSection)
}

/** Spannungsfall in Prozent der Nennspannung. */
export function voltageDropPercent(dropVolts: number, voltage: number): number {
  return (dropVolts / voltage) * 100
}

/**
 * Umkehrung nach dem Querschnitt: kleinster Querschnitt, der die
 * Spannungsfallgrenze einhält. `A_erf = b · L · I / (κ · ΔU_zulässig)`.
 */
export function requiredCrossSection(input: {
  readonly phaseMode: PhaseMode
  readonly voltage: number
  readonly current: number
  readonly lengthMeters: number
  readonly kappa: number
  readonly limitPercent: number
}): number {
  const zulaessig = (input.limitPercent / 100) * input.voltage
  return (phaseFactor(input.phaseMode) * input.lengthMeters * input.current) / (input.kappa * zulaessig)
}

/**
 * Nächstgrößerer genormter Querschnitt. Gibt `null`, wenn der benötigte
 * Querschnitt über die Reihe hinausgeht — dann wird **nichts** erfunden.
 */
export function normaliseCrossSection(required: number): number | null {
  if (!Number.isFinite(required) || required <= 0) return null
  return standardCrossSections.find((wert) => wert >= required) ?? null
}

/** Auslastung der eingegebenen Strombelastbarkeit in Prozent. */
export function utilisationPercent(current: number, ampacity: number): number {
  return (current / ampacity) * 100
}

/**
 * Strom aus der Leistung. Einphasig `I = P / (U · cos φ)`, dreiphasig
 * `I = P / (√3 · U · cos φ)`. Prüft die Leistungsgrenze aus `cableLimits`.
 *
 * **Nicht `phaseFactor` verwenden:** der Faktor 2 der Spannungsfallformel steht
 * für Hin- und Rückleitung, nicht für die Leistung — für `P = U · I · cos φ`
 * wäre er schlicht falsch (er halbierte den Strom).
 */
export function currentFromPower(power: number, voltage: number, phaseMode: PhaseMode, cosPhi = 1): CurrentCheck {
  if (!Number.isFinite(power) || !Number.isFinite(voltage) || !Number.isFinite(cosPhi)) return { ok: false, errorKey: 'tool.cable.error.empty' }
  if (!within(power, cableLimits.power)) return { ok: false, errorKey: 'tool.cable.error.power' }
  if (cosPhi <= 0) return { ok: false, errorKey: 'tool.cable.error.phase' }
  const faktor = phaseMode === 'three' ? Math.sqrt(3) : 1
  return { ok: true, current: power / (faktor * voltage * cosPhi) }
}

/**
 * Prüft jede Eingabe gegen ihre Grenze aus `cableLimits` und liefert die
 * Fehlerkennungen in fester Reihenfolge. Leere/fehlende Werte ergeben `empty`.
 */
export function cableErrorKeys(input: CableInput): readonly string[] {
  if ([input.voltage, input.current, input.lengthMeters, input.kappa, input.ampacity].some((wert) => !Number.isFinite(wert))) {
    return ['tool.cable.error.empty']
  }
  const fehler: string[] = []
  if (!within(input.voltage, cableLimits.voltage)) fehler.push('tool.cable.error.voltage')
  if (!within(input.current, cableLimits.current)) fehler.push('tool.cable.error.current')
  if (!within(input.lengthMeters, cableLimits.length)) fehler.push('tool.cable.error.length')
  if (!within(input.kappa, cableLimits.kappa)) fehler.push('tool.cable.error.kappa')
  if (!within(input.ampacity, cableLimits.ampacity)) fehler.push('tool.cable.error.ampacity')
  return fehler
}

/**
 * Rechnet den Spannungsfall, die Umkehrung nach dem Querschnitt und die
 * Prüfung gegen die eingegebene Strombelastbarkeit.
 */
export function planCable(input: CableInput): CableCheck {
  const fehler = cableErrorKeys(input)
  if (fehler.length) return { ok: false, errorKey: fehler[0]! }

  const grenze = voltageDropLimitFor(input.usage)
  const maxDropVolts = (grenze.percent / 100) * input.voltage
  const required = requiredCrossSection({
    phaseMode: input.phaseMode,
    voltage: input.voltage,
    current: input.current,
    lengthMeters: input.lengthMeters,
    kappa: input.kappa,
    limitPercent: grenze.percent
  })
  const chosen = normaliseCrossSection(required)
  // Ausgewiesen wird der Spannungsfall beim **vorgeschlagenen** Querschnitt
  // (der nächstgrößere genormte Wert); geht die Reihe nicht weit genug, beim
  // ungerundet benötigten Querschnitt.
  const dropCrossSection = chosen ?? required
  const dropVolts = voltageDropVolts({
    phaseMode: input.phaseMode,
    lengthMeters: input.lengthMeters,
    current: input.current,
    kappa: input.kappa,
    crossSection: dropCrossSection
  })
  const dropPercent = voltageDropPercent(dropVolts, input.voltage)
  const auslastung = utilisationPercent(input.current, input.ampacity)

  return {
    ok: true,
    result: {
      limitPercent: grenze.percent,
      maxDropVolts,
      dropCrossSection,
      dropVolts,
      dropPercent,
      withinLimit: dropPercent <= grenze.percent,
      requiredCrossSection: required,
      chosenCrossSection: chosen,
      beyondSeries: chosen === null,
      utilisationPercent: auslastung,
      ampacityWithin: auslastung <= 100,
      formulas: [
        input.phaseMode === 'three' ? 'ΔU = √3 · L · I / (κ · A)' : 'ΔU = 2 · L · I / (κ · A)',
        'ΔU% = ΔU / U · 100',
        'A_erf = b · L · I / (κ · ΔU_zulässig)',
        'A_gewählt = kleinste Normstufe ≥ A_erf',
        'Auslastung = I / I_zul · 100'
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
