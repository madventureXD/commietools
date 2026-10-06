/**
 * Kern des Werkzeugs „Rohrdimensionierung, Volumenstrom und Druckverlust" (Welle E, Werkzeug 15).
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`.
 *
 * Rechenweg — von der Leistung über den Volumenstrom zur Geschwindigkeit und zum
 * Druckverlustgefälle:
 *
 *   Q      = Wärmeleistung (W)
 *   ṁ      = Q / (c · ΔT)                     Massenstrom (kg/s), c in J/(kg·K)
 *   V̇      = ṁ / ρ                            Volumenstrom (m³/s), ρ in kg/m³
 *   A      = π · (d / 2)²                     Rohrquerschnitt (m²), d = Innendurchmesser
 *   w      = V̇ / A                            Strömungsgeschwindigkeit (m/s)
 *   Re     = w · d / ν                        Reynoldszahl
 *   λ      = Rohrreibungszahl (siehe unten)
 *   R      = λ · ρ · w² / (2 · d)             Druckverlustgefälle (Pa/m)
 *
 * **Zur Rohrreibungszahl — der gewählte Weg:** Für die laminare Strömung (Re < 2300) gilt
 * exakt `λ = 64 / Re`. Im turbulenten Bereich ist die implizite **Colebrook-White-Gleichung**
 * der Stand der Technik; sie lässt sich nicht geschlossen nach λ auflösen. Statt einer
 * Iteration wird hier die **explizite Näherung nach Haaland** verwendet:
 *
 *   1 / √λ = −1,8 · log10( (k / (3,7 · d))^1,11 + 6,9 / Re )
 *
 * Sie weicht von Colebrook-White um weniger als rund 1,5 % ab, kommt **ohne Iteration** aus und
 * ist damit nachvollziehbar und deterministisch. Der Übergangsbereich 2300 ≤ Re < 4000 wird
 * rechnerisch wie turbulent behandelt, aber als solcher **ausgewiesen** — dort ist keine der
 * beiden Formeln belastbar. Das ist ein **Überschlag**, keine Rohrnetzberechnung: Einzelwider-
 * stände von Fittings (ζ-Werte) sind nicht enthalten und in der Quellenlage ausdrücklich als
 * nicht belegt geführt.
 *
 * **Herkunft der Werte:** Rohr-Innenmaße und Wasser-Stoffdaten stammen ausschließlich aus der
 * Quellenlage `06-protokolle/quellenlage-welle-e/15-rohrdimensionierung.md` (Abruf 2026-10-06).
 * Innenmaße sind herstellerabhängig und streuen (Kupfer 15×0,7 und 15×1,0 beide normkonform;
 * Verbundrohr OD 20 → ID 14,4 bis 16,0 mm), deshalb ist jede Zeile eine **Auswahl mit Quelle**
 * und die Wanddicke bleibt änderbar. Der Normtext-Volltext von EN 1057 wurde von einem
 * Dritt-Host herangezogen und wird **nicht** verwendet; für Kupfer dienen die Handels- und
 * Herstellerkataloge der Belegsammlung.
 *
 * Keine Anzeigetexte: Kennungen, Bezeichner und Einheiten sind sprachneutral, die Beschriftungen
 * kommen aus den Sprachkatalogen. Formeln in Zeichen sind Rechenweg und stehen deshalb hier.
 */

/** Rohrart. Bestimmt die Auswahl der Nennweiten und die Vorgabe-Rauigkeit. */
export type PipeMaterial = 'copper' | 'steel' | 'composite'

/**
 * Woher ein Wert stammt. Die Rohrmaße und die Wasser-Daten sind **belegt** (Quelle je Zeile);
 * die spezifische Wärmekapazität ist in der Quellenlage nicht als Wert belegt und deshalb ein
 * **Eingabefeld** mit gebräuchlichem Vorgabewert, kein fest verdrahteter Stoffwert.
 */
export type PipeValueSource = 'sourced' | 'editable'

/** Eine Quelle mit Bezeichnung, Adresse und Abrufdatum. Das Abrufdatum steht in jeder Zeile. */
export interface PipeSource {
  readonly label: string
  readonly url: string
  readonly retrieved: string
}

/** Abrufdatum aller Quellen dieses Werkzeugs. */
export const PIPES_RETRIEVED = '2026-10-06'

/**
 * Eine wählbare Rohrgröße. `innerMm` ist aus Außendurchmesser und Wanddicke berechnet
 * (`ID = OD − 2·w`), so wie es die Quellenlage vorgibt; die Quellen nennen dieselben Innenmaße.
 * Über die Oberfläche ist die Wanddicke änderbar — der Innenmaß-Vorschlag ist dann nur noch
 * ein Startpunkt, nicht der Quelle entnommen.
 */
export interface PipeSize {
  readonly id: string
  readonly material: PipeMaterial
  /** Hersteller- oder Norm-Nennweite, wie sie in der Quelle steht (z. B. `15 × 0,7`, `DN 15 (1/2")`). */
  readonly label: string
  readonly outerMm: number
  readonly wallMm: number
  readonly source: PipeSource
}

/** Rauigkeit als wählbare Vorgabe je Werkstoff/Zustand. */
export interface RoughnessOption {
  readonly id: string
  readonly material: PipeMaterial
  readonly titleKey: string
  /** Sandrauhigkeit k in Millimetern. */
  readonly kMm: number
  readonly source: PipeSource
}

/**
 * Grenzen je Feld. **Jede dieser Grenzen wird in `planPipes` wirklich abgefragt** — ein
 * Grenzwert, der nie geprüft wird, sieht aus wie ein geprüfter Wert.
 */
export const pipeLimits = {
  /** Wärmeleistung in Kilowatt. */
  powerKw: { min: 0.1, max: 5000 },
  /** Spreizung (Vorlauf − Rücklauf) in Kelvin. */
  spreadK: { min: 1, max: 60 },
  /** Wassertemperatur für die Stoffdaten in Grad Celsius (Tabelle deckt 10–80 °C ab). */
  temperatureC: { min: 10, max: 80 },
  /** Außendurchmesser in Millimetern. */
  outerMm: { min: 2, max: 2000 },
  /** Wanddicke in Millimetern (streut je Halbzeug-Zustand, deshalb änderbar). */
  wallMm: { min: 0.2, max: 30 },
  /** Innendurchmesser in Millimetern — aus OD und Wand berechnet und geprüft. */
  innerMm: { min: 1, max: 1900 },
  /** Sandrauhigkeit in Millimetern. */
  roughnessMm: { min: 0, max: 10 },
  /** Spezifische Wärmekapazität in J/(kg·K) — Eingabefeld, nicht aus der Quellenlage belegt. */
  specificHeat: { min: 1000, max: 6000 }
} as const

/** Rohrarten mit Vorgabe-Rauigkeit. Die Beschriftung kommt aus den Sprachkatalogen. */
export const pipeMaterials: readonly {
  readonly id: PipeMaterial
  readonly titleKey: string
  readonly defaultRoughnessId: string
}[] = [
  { id: 'copper', titleKey: 'tool.pipes.material.copper', defaultRoughnessId: 'copper-drawn' },
  { id: 'steel', titleKey: 'tool.pipes.material.steel', defaultRoughnessId: 'steel-new' },
  { id: 'composite', titleKey: 'tool.pipes.material.composite', defaultRoughnessId: 'plastic-new' }
]

const SHK: PipeSource = {
  label: 'SHK-Markt24 (Handel, Kupferrohr EN 1057 RAL/DVGW)',
  url: 'https://shkmarkt24.de/shop/kupferrohr-ral-dvgw-en-1057-10mm-bis-54mm-5m-stangen-25-oder-50-meter',
  retrieved: PIPES_RETRIEVED
}
const TRADE: PipeSource = {
  label: 'Trade Calculator, UK-Kupferrohre (Tabelle X/Y der EN 1057-Ausgabe)',
  url: 'https://tradecalculator.co.uk/reference/uk-copper-pipe-sizes',
  retrieved: PIPES_RETRIEVED
}
const THYSSEN: PipeSource = {
  label: 'Thyssenkrupp Stahlrohre (Gewinderohre EN 10255, mittelschwere Reihe)',
  url: 'https://ucpcdn.thyssenkrupp.com/_legacy/UCPthyssenkruppBAMXJacobBek/assets.files/pdf/produkte/stahlrohre/stahlrohre.pdf',
  retrieved: PIPES_RETRIEVED
}
const UPONOR: PipeSource = {
  label: 'Uponor Uni Pipe PLUS, Technische Information Trinkwasser/Heizung',
  url: 'https://brandportal.uponor.com/m/56e67af918404ae3/original/TI-MLCP-Tap-Water-Heating-DE.pdf',
  retrieved: PIPES_RETRIEVED
}
const VIEGA: PipeSource = {
  label: 'Viega Raxofix 5302.3, Prospekt (16×2,2 / 20×2,8)',
  url: 'https://www.viega.de/content/dam/viegadm/en/products/piping-technology/raxofix/763565_Prospekt_Raxofix_DEAT_net.pdf',
  retrieved: PIPES_RETRIEVED
}
const GEP24: PipeSource = {
  label: 'gep24, Aluverbundrohr-Durchmesser (Multipipe)',
  url: 'https://www.gep24.de/magazin/welche-durchmesser-bei-aluverbundrohr-20230620140613.html',
  retrieved: PIPES_RETRIEVED
}

/**
 * Kupferrohr nach EN 1057. Die Wanddicke streut: Die eine Tabelle führt für 15 mm **0,7 mm**,
 * deutsche Händler führen dieselbe Nennweite mit **1,0 mm** — beides normkonform (Tabelle X vs. Y).
 * Deshalb stehen beide Zeilen nebeneinander, jede mit ihrer Quelle; nichts ist fest verdrahtet.
 * Für Kupfer werden die **Handels-/Herstellerkataloge** der Belegsammlung verwendet (SHK-Markt24,
 * Trade Calculator) — der Normtext-Volltext von einem Dritt-Host wird bewusst nicht herangezogen.
 */
export const copperSizes: readonly PipeSize[] = [
  { id: 'cu-12x10', material: 'copper', label: '12 × 1,0', outerMm: 12, wallMm: 1.0, source: SHK },
  { id: 'cu-15x07', material: 'copper', label: '15 × 0,7', outerMm: 15, wallMm: 0.7, source: TRADE },
  { id: 'cu-15x10', material: 'copper', label: '15 × 1,0', outerMm: 15, wallMm: 1.0, source: SHK },
  { id: 'cu-18x10', material: 'copper', label: '18 × 1,0', outerMm: 18, wallMm: 1.0, source: SHK },
  { id: 'cu-22x09', material: 'copper', label: '22 × 0,9', outerMm: 22, wallMm: 0.9, source: TRADE },
  { id: 'cu-22x10', material: 'copper', label: '22 × 1,0', outerMm: 22, wallMm: 1.0, source: SHK },
  { id: 'cu-28x09', material: 'copper', label: '28 × 0,9', outerMm: 28, wallMm: 0.9, source: TRADE },
  { id: 'cu-28x10', material: 'copper', label: '28 × 1,0', outerMm: 28, wallMm: 1.0, source: SHK },
  { id: 'cu-35x12', material: 'copper', label: '35 × 1,2', outerMm: 35, wallMm: 1.2, source: TRADE }
]

/**
 * Stahlrohr (Gewinderohr) nach EN 10255, **mittelschwere** Reihe. Die Norm kennt drei Reihen
 * (light/medium/heavy); der Innendurchmesser weicht je Reihe deutlich ab, deshalb ist die Reihe
 * Teil der Quelle. DN ist ausdrücklich **nicht** der Innendurchmesser.
 */
export const steelSizes: readonly PipeSize[] = [
  { id: 'st-dn15', material: 'steel', label: 'DN 15 (1/2")', outerMm: 21.3, wallMm: 2.6, source: THYSSEN },
  { id: 'st-dn20', material: 'steel', label: 'DN 20 (3/4")', outerMm: 26.9, wallMm: 2.6, source: THYSSEN },
  { id: 'st-dn25', material: 'steel', label: 'DN 25 (1")', outerMm: 33.7, wallMm: 3.2, source: THYSSEN },
  { id: 'st-dn32', material: 'steel', label: 'DN 32 (1 1/4")', outerMm: 42.4, wallMm: 3.2, source: THYSSEN }
]

/**
 * Mehrschichtverbundrohr (MLC). Der Innendurchmesser ist **stark herstellerabhängig**: Bei 20 mm
 * Außendurchmesser reicht er von 14,4 mm (Viega Raxofix 20×2,8) bis 16,0 mm (Multipipe 20×2,0),
 * rund 11 % Unterschied. Deshalb ist jede Zeile eine Herstellerangabe mit eigener Quelle.
 */
export const compositeSizes: readonly PipeSize[] = [
  { id: 'ml-16x20', material: 'composite', label: '16 × 2,0', outerMm: 16, wallMm: 2.0, source: UPONOR },
  { id: 'ml-16x22', material: 'composite', label: '16 × 2,2', outerMm: 16, wallMm: 2.2, source: VIEGA },
  { id: 'ml-20x20', material: 'composite', label: '20 × 2,0', outerMm: 20, wallMm: 2.0, source: GEP24 },
  { id: 'ml-20x225', material: 'composite', label: '20 × 2,25', outerMm: 20, wallMm: 2.25, source: UPONOR },
  { id: 'ml-20x28', material: 'composite', label: '20 × 2,8', outerMm: 20, wallMm: 2.8, source: VIEGA },
  { id: 'ml-25x25', material: 'composite', label: '25 × 2,5', outerMm: 25, wallMm: 2.5, source: UPONOR },
  { id: 'ml-26x30', material: 'composite', label: '26 × 3,0', outerMm: 26, wallMm: 3.0, source: GEP24 },
  { id: 'ml-32x30', material: 'composite', label: '32 × 3,0', outerMm: 32, wallMm: 3.0, source: UPONOR }
]

/** Alle Rohrgrößen. Aufsteigend nach Außendurchmesser, wie in der Quellenlage. */
export const pipeSizes: readonly PipeSize[] = [...copperSizes, ...steelSizes, ...compositeSizes]

export function pipeSizesFor(material: PipeMaterial): readonly PipeSize[] {
  return pipeSizes.filter((size) => size.material === material)
}

/**
 * Sandrauhigkeit k je Werkstoff/Zustand. Die Quellen streuen (Kupfer 0 – 0,0015 bis
 * 0,0015 – 0,01 mm; Stahl „neu" 0,02 – 0,1 mm); die Vorgaben sind der Praxis-Konsens der
 * Quellenlage, **kein Normwert**, und über ein Feld änderbar.
 */
export const roughnessOptions: readonly RoughnessOption[] = [
  {
    id: 'copper-drawn', material: 'copper', titleKey: 'tool.pipes.roughness.copperDrawn', kMm: 0.0015,
    source: { label: 'IKZ (Tabelle nach Wagner, Rohrleitungstechnik) / schweizer-fn', url: 'https://www.ikz.de/ikz-archiv/1998/08/9808051.php', retrieved: PIPES_RETRIEVED }
  },
  {
    id: 'steel-new', material: 'steel', titleKey: 'tool.pipes.roughness.steelNew', kMm: 0.05,
    source: { label: 'IKZ / schweizer-fn (Stahl neu, Walzhaut 0,02 – 0,1 mm)', url: 'https://www.schweizer-fn.de/stroemung/rauhigkeit/rauhigkeit.php', retrieved: PIPES_RETRIEVED }
  },
  {
    id: 'steel-zinc', material: 'steel', titleKey: 'tool.pipes.roughness.steelZinc', kMm: 0.1,
    source: { label: 'IKZ / schweizer-fn (Stahl verzinkt 0,04 – 0,16 mm)', url: 'https://www.schweizer-fn.de/stroemung/rauhigkeit/rauhigkeit.php', retrieved: PIPES_RETRIEVED }
  },
  {
    id: 'steel-aged', material: 'steel', titleKey: 'tool.pipes.roughness.steelAged', kMm: 0.3,
    source: { label: 'IKZ / schweizer-fn / tecciness (mäßig verrostet, 0,1 – 0,4 mm)', url: 'https://tecciness.de/hilfe/rohrrauhigkeit.php?quelldatei=aufruf', retrieved: PIPES_RETRIEVED }
  },
  {
    id: 'plastic-new', material: 'composite', titleKey: 'tool.pipes.roughness.plasticNew', kMm: 0.007,
    source: { label: 'schweizer-fn (Kunststoff, neu 0,002 – 0,007 mm)', url: 'https://www.schweizer-fn.de/stroemung/rauhigkeit/rauhigkeit.php', retrieved: PIPES_RETRIEVED }
  },
  {
    id: 'plastic-aged', material: 'composite', titleKey: 'tool.pipes.roughness.plasticAged', kMm: 0.02,
    source: { label: 'schweizer-fn (Kunststoff, gebraucht 0,010 – 0,030 mm)', url: 'https://www.schweizer-fn.de/stroemung/rauhigkeit/rauhigkeit.php', retrieved: PIPES_RETRIEVED }
  }
]

export function roughnessById(id: string): RoughnessOption | undefined {
  return roughnessOptions.find((option) => option.id === id)
}

export function roughnessFor(material: PipeMaterial): readonly RoughnessOption[] {
  return roughnessOptions.filter((option) => option.material === material)
}

export function defaultRoughnessId(material: PipeMaterial): string {
  return pipeMaterials.find((entry) => entry.id === material)?.defaultRoughnessId ?? 'steel-new'
}

/** Eine Zeile der Wasser-Stoffdatentabelle: Temperatur, Dichte, kinematische Viskosität. */
export interface WaterRow {
  readonly temperatureC: number
  readonly densityKgM3: number
  /** Kinematische Viskosität in m²/s (Quelle in mm²/s, Faktor 1e-6). */
  readonly viscosityM2S: number
}

/**
 * Wasser-Stoffdaten, 10–80 °C. Dichte ρ und kinematische Viskosität ν, übernommen aus der
 * Belegsammlung (Abruf 2026-10-06), von der Auftraggeberseite nachgeprüft. Die beiden Quellen
 * stimmen überein (ν auf drei Nachkommastellen, ρ auf ≤ 0,02 kg/m³) — es gibt hier keinen
 * Widerspruch. ν steht in der Quelle in mm²/s; hier in m²/s umgerechnet.
 */
export const WATER_SOURCE: PipeSource = {
  label: 'Anton Paar Wiki (IAPWS 2008) und stoffdaten-online.de (Wenger Engineering)',
  url: 'https://wiki.anton-paar.com/de-de/wasser/',
  retrieved: PIPES_RETRIEVED
}

export const waterData: readonly WaterRow[] = [
  { temperatureC: 10, densityKgM3: 999.7, viscosityM2S: 1.306e-6 },
  { temperatureC: 20, densityKgM3: 998.2, viscosityM2S: 1.003e-6 },
  { temperatureC: 30, densityKgM3: 995.6, viscosityM2S: 0.801e-6 },
  { temperatureC: 40, densityKgM3: 992.2, viscosityM2S: 0.658e-6 },
  { temperatureC: 50, densityKgM3: 988.0, viscosityM2S: 0.553e-6 },
  { temperatureC: 60, densityKgM3: 983.2, viscosityM2S: 0.474e-6 },
  { temperatureC: 70, densityKgM3: 977.8, viscosityM2S: 0.413e-6 },
  { temperatureC: 80, densityKgM3: 971.8, viscosityM2S: 0.364e-6 }
]

/**
 * Spezifische Wärmekapazität von Wasser in J/(kg·K).
 *
 * **Nicht aus der Quellenlage belegt** (cp steht dort nur als „vereinzelt frei belegt"): Der Wert
 * ist deshalb ein **Eingabefeld** mit gebräuchlichem Vorgabewert und wird in der Oberfläche als
 * solcher gekennzeichnet, nicht als Stoffwert aus der Tabelle ausgegeben.
 */
export const defaultSpecificHeat = 4186
export const SPECIFIC_HEAT_SOURCE: PipeSource = {
  label: 'spezifische Wärmekapazität — in der Quellenlage nicht als Wert belegt, deshalb Eingabefeld',
  url: 'https://stoffdaten-online.de/wasser/',
  retrieved: PIPES_RETRIEVED
}

/**
 * Richtwert der Strömungsgeschwindigkeit als **Spanne**, ausdrücklich kein Grenzwert.
 *
 * Die Praxisquellen der Quellenlage widersprechen sich in der Breite (Obergrenze 1,0 gegen
 * 1,5 m/s); hinterlegt ist deshalb bewusst eine Bandbreite, und die Oberfläche kennzeichnet sie
 * als Richtwert. Überschreitung ist ein **Hinweis**, kein Verbot.
 */
export const RECOMMENDED_VELOCITY = {
  minMs: 1.0,
  maxMs: 1.5,
  source: {
    label: 'baunetzwissen Rohrnetzberechnung / rechner-portal (Planungspraxis, Richtwert mit Spanne)',
    url: 'https://www.baunetzwissen.de/heizung/fachwissen/heizleitungen-zubehoer/rohrnetzberechnung-161276',
    retrieved: PIPES_RETRIEVED
  } as PipeSource
} as const

/** Ebenfalls nur Richtwert: das übliche Druckgefälle der Planungspraxis, in Pa/m. */
export const RECOMMENDED_PRESSURE_GRADIENT = {
  minPaPerM: 50,
  maxPaPerM: 200,
  source: {
    label: 'baunetzwissen / delta-q (üblich 50 – 100 Pa/m, bis 200 Pa/m)',
    url: 'https://www.delta-q.de/wp-content/uploads/rohrnetzberechnung-1.pdf',
    retrieved: PIPES_RETRIEVED
  } as PipeSource
} as const

function within(value: number, range: { readonly min: number; readonly max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

/** Innendurchmesser aus Außendurchmesser und Wanddicke. Negativwerte werden nicht zugelassen. */
export function innerDiameterMm(outerMm: number, wallMm: number): number {
  return outerMm - 2 * wallMm
}

/** Rohrquerschnitt in m² aus dem Innendurchmesser in mm. */
export function crossSectionM2(innerMm: number): number {
  const d = innerMm / 1000
  return Math.PI * (d / 2) ** 2
}

/** Strömungsgeschwindigkeit w = V̇ / A in m/s. */
export function velocityMs(volumeFlowM3S: number, innerMm: number): number {
  const area = crossSectionM2(innerMm)
  if (!(area > 0)) return Number.NaN
  return volumeFlowM3S / area
}

/** Reynoldszahl Re = w · d / ν. */
export function reynoldsNumber(velocity: number, innerMm: number, viscosityM2S: number): number {
  if (!(viscosityM2S > 0)) return Number.NaN
  return (velocity * (innerMm / 1000)) / viscosityM2S
}

export type FlowRegime = 'laminar' | 'transitional' | 'turbulent'

export function flowRegime(reynolds: number): FlowRegime {
  if (reynolds < 2300) return 'laminar'
  if (reynolds < 4000) return 'transitional'
  return 'turbulent'
}

/**
 * Rohrreibungszahl λ.
 *
 * Laminar exakt `64 / Re`; turbulent nach der expliziten Näherung von Haaland (siehe Dateikopf).
 * Der Übergangsbereich 2300 ≤ Re < 4000 wird wie turbulent gerechnet, aber im Ergebnis als
 * `transitional` ausgewiesen — dort ist das Ergebnis unsicher.
 */
export function frictionFactor(reynolds: number, roughnessMm: number, innerMm: number): number {
  if (!(reynolds > 0) || !(innerMm > 0)) return Number.NaN
  if (reynolds < 2300) return 64 / reynolds
  const d = innerMm / 1000
  const k = roughnessMm / 1000
  const term = (k / (3.7 * d)) ** 1.11 + 6.9 / reynolds
  const inverse = -1.8 * Math.log10(term)
  if (!(inverse > 0)) return Number.NaN
  return 1 / (inverse * inverse)
}

/** Druckverlustgefälle R = λ · ρ · w² / (2 · d) in Pa/m. */
export function pressureGradientPaPerM(velocity: number, innerMm: number, densityKgM3: number, lambda: number): number {
  if (!(innerMm > 0)) return Number.NaN
  const d = innerMm / 1000
  return (lambda * densityKgM3 * velocity * velocity) / (2 * d)
}

export type WaterCheck =
  | { readonly ok: true; readonly row: WaterRow; readonly densityKgM3: number; readonly viscosityM2S: number }
  | { readonly ok: false; readonly errorKey: string }

/**
 * Stoffdaten bei beliebiger Temperatur zwischen 10 und 80 °C.
 *
 * Zwischen den Stützstellen der Tabelle wird **linear interpoliert**; die Stützstellen selbst
 * liefern exakt die Tabellenwerte (der Test prüft das). Außerhalb des Tabellenbereichs wird
 * **nicht** extrapoliert, sondern ein Fehler gemeldet — eine Zahl außerhalb des Belegten wäre
 * erfunden.
 */
export function waterProperties(temperatureC: number): WaterCheck {
  if (!Number.isFinite(temperatureC)) return { ok: false, errorKey: 'tool.pipes.error.temperature' }
  if (temperatureC < pipeLimits.temperatureC.min || temperatureC > pipeLimits.temperatureC.max) {
    return { ok: false, errorKey: 'tool.pipes.error.temperature' }
  }
  const first = waterData[0]
  const last = waterData[waterData.length - 1]
  if (!first || !last) return { ok: false, errorKey: 'tool.pipes.error.temperature' }
  // Exakter Tabellentreffer hat Vorrang vor der Interpolation.
  const exact = waterData.find((row) => row.temperatureC === temperatureC)
  if (exact) return { ok: true, row: exact, densityKgM3: exact.densityKgM3, viscosityM2S: exact.viscosityM2S }
  for (let index = 0; index < waterData.length - 1; index += 1) {
    const unten = waterData[index]
    const oben = waterData[index + 1]
    if (!unten || !oben) continue
    if (temperatureC > unten.temperatureC && temperatureC < oben.temperatureC) {
      const anteil = (temperatureC - unten.temperatureC) / (oben.temperatureC - unten.temperatureC)
      return {
        ok: true,
        row: unten,
        densityKgM3: unten.densityKgM3 + anteil * (oben.densityKgM3 - unten.densityKgM3),
        viscosityM2S: unten.viscosityM2S + anteil * (oben.viscosityM2S - unten.viscosityM2S)
      }
    }
  }
  return { ok: false, errorKey: 'tool.pipes.error.temperature' }
}

export interface PipesInput {
  /** Wärmeleistung in Kilowatt. */
  readonly powerKw: number
  /** Spreizung in Kelvin. */
  readonly spreadK: number
  /** Wassertemperatur in Grad Celsius (für die Stoffdaten). */
  readonly temperatureC: number
  readonly material: PipeMaterial
  /** Außendurchmesser des gewählten Rohrs in mm. */
  readonly outerMm: number
  /** Wanddicke des gewählten Rohrs in mm — änderbar. */
  readonly wallMm: number
  /** Sandrauhigkeit k in mm. */
  readonly roughnessMm: number
  /** Spezifische Wärmekapazität in J/(kg·K) — Eingabefeld. */
  readonly specificHeat: number
}

export interface PipesProposal {
  readonly sizeId: string
  readonly label: string
  readonly innerMm: number
  readonly wallMm: number
  readonly velocityMs: number
  readonly status: VelocityStatus
}

export type VelocityStatus = 'below' | 'within' | 'above'

export interface PipesResult {
  readonly innerMm: number
  readonly densityKgM3: number
  readonly viscosityM2S: number
  /** Massenstrom ṁ in kg/s. */
  readonly massFlowKgS: number
  /** Volumenstrom V̇ in m³/s. */
  readonly volumeFlowM3S: number
  /** Volumenstrom in m³/h (die gebräuchliche Anzeigenheit). */
  readonly volumeFlowM3H: number
  readonly areaM2: number
  readonly velocityMs: number
  readonly reynolds: number
  readonly regime: FlowRegime
  readonly frictionFactor: number
  readonly pressureGradientPaPerM: number
  readonly velocityStatus: VelocityStatus
  readonly proposal: PipesProposal | null
  readonly formulas: readonly string[]
}

export type PipesCheck =
  | { readonly ok: true; readonly result: PipesResult }
  | { readonly ok: false; readonly errorKey: string }

/** Prüft **jede** Grenze aus `pipeLimits` und liefert die erste verletzte als Fehlerkennung. */
export function pipesErrorKey(input: PipesInput): string | null {
  if (
    !Number.isFinite(input.powerKw) || !Number.isFinite(input.spreadK) || !Number.isFinite(input.temperatureC) ||
    !Number.isFinite(input.outerMm) || !Number.isFinite(input.wallMm) ||
    !Number.isFinite(input.roughnessMm) || !Number.isFinite(input.specificHeat)
  ) {
    return 'tool.pipes.error.empty'
  }
  if (!within(input.powerKw, pipeLimits.powerKw)) return 'tool.pipes.error.power'
  if (!within(input.spreadK, pipeLimits.spreadK)) return 'tool.pipes.error.spread'
  if (!within(input.temperatureC, pipeLimits.temperatureC)) return 'tool.pipes.error.temperature'
  if (!within(input.outerMm, pipeLimits.outerMm)) return 'tool.pipes.error.outer'
  if (!within(input.wallMm, pipeLimits.wallMm)) return 'tool.pipes.error.wall'
  if (!within(input.specificHeat, pipeLimits.specificHeat)) return 'tool.pipes.error.specificHeat'
  // Der Innendurchmesser folgt aus OD und Wand — und wird gegen seine **eigene** Grenze geprüft,
  // sonst liefe eine Wanddicke durch, die den Querschnitt verschwinden lässt.
  const inner = innerDiameterMm(input.outerMm, input.wallMm)
  if (!Number.isFinite(inner) || !within(inner, pipeLimits.innerMm)) return 'tool.pipes.error.inner'
  if (!within(input.roughnessMm, pipeLimits.roughnessMm)) return 'tool.pipes.error.roughness'
  return null
}

/** Geschwindigkeitsbewertung gegen die Richtwert-Spanne. Rein beschreibend, kein Verbot. */
export function velocityStatusFor(velocity: number, band: { readonly minMs: number; readonly maxMs: number } = RECOMMENDED_VELOCITY): VelocityStatus {
  if (velocity < band.minMs) return 'below'
  if (velocity > band.maxMs) return 'above'
  return 'within'
}

/**
 * DN-Vorschlag: die **kleinste** Nennweite einer Rohrart, deren Geschwindigkeit die obere
 * Richtwertgrenze nicht überschreitet. Trifft keine zu, wird die größte angebotene Zeile
 * vorgeschlagen und als „über dem Richtwert" gekennzeichnet — nicht verschwiegen.
 */
export function proposeSize(
  material: PipeMaterial,
  volumeFlowM3S: number,
  band: { readonly minMs: number; readonly maxMs: number } = RECOMMENDED_VELOCITY
): PipesProposal | null {
  if (!(volumeFlowM3S > 0)) return null
  const sizes = [...pipeSizesFor(material)].sort((a, b) => innerDiameterMm(a.outerMm, a.wallMm) - innerDiameterMm(b.outerMm, b.wallMm))
  let gewaehlt: PipeProposal | null = null
  for (const size of sizes) {
    const inner = innerDiameterMm(size.outerMm, size.wallMm)
    if (!(inner > 0)) continue
    const w = velocityMs(volumeFlowM3S, inner)
    if (w <= band.maxMs) {
      gewaehlt = { sizeId: size.id, label: size.label, innerMm: inner, wallMm: size.wallMm, velocityMs: w, status: velocityStatusFor(w, band) }
      break
    }
  }
  if (!gewaehlt) {
    const letzte = sizes[sizes.length - 1]
    if (!letzte) return null
    const inner = innerDiameterMm(letzte.outerMm, letzte.wallMm)
    const w = velocityMs(volumeFlowM3S, inner)
    gewaehlt = { sizeId: letzte.id, label: letzte.label, innerMm: inner, wallMm: letzte.wallMm, velocityMs: w, status: velocityStatusFor(w, band) }
  }
  return gewaehlt
}

type PipeProposal = PipesProposal

/**
 * Vollständige Rechnung. Fehlerkennungen sind sprachneutral und werden in der Oberfläche
 * übersetzt: `empty`, `power`, `spread`, `temperature`, `outer`, `wall`, `inner`, `roughness`,
 * `specificHeat`.
 */
export function planPipes(input: PipesInput): PipesCheck {
  const fehler = pipesErrorKey(input)
  if (fehler) return { ok: false, errorKey: fehler }
  const wasser = waterProperties(input.temperatureC)
  if (!wasser.ok) return { ok: false, errorKey: wasser.errorKey }

  const inner = innerDiameterMm(input.outerMm, input.wallMm)
  const area = crossSectionM2(inner)
  const leistungW = input.powerKw * 1000
  const massFlowKgS = leistungW / (input.specificHeat * input.spreadK)
  const volumeFlowM3S = massFlowKgS / wasser.densityKgM3
  const velocity = velocityMs(volumeFlowM3S, inner)
  const reynolds = reynoldsNumber(velocity, inner, wasser.viscosityM2S)
  const regime = flowRegime(reynolds)
  const lambda = frictionFactor(reynolds, input.roughnessMm, inner)
  const gradient = pressureGradientPaPerM(velocity, inner, wasser.densityKgM3, lambda)

  return {
    ok: true,
    result: {
      innerMm: inner,
      densityKgM3: wasser.densityKgM3,
      viscosityM2S: wasser.viscosityM2S,
      massFlowKgS,
      volumeFlowM3S,
      volumeFlowM3H: volumeFlowM3S * 3600,
      areaM2: area,
      velocityMs: velocity,
      reynolds,
      regime,
      frictionFactor: lambda,
      pressureGradientPaPerM: gradient,
      velocityStatus: velocityStatusFor(velocity),
      proposal: proposeSize(input.material, volumeFlowM3S),
      formulas: [
        'ṁ = Q / (c · ΔT)',
        'V̇ = ṁ / ρ',
        'A = π · (d / 2)²',
        'w = V̇ / A',
        'Re = w · d / ν',
        'λ = 64 / Re (laminar)',
        '1 / √λ = −1,8 · log₁₀( (k / 3,7·d)^1,11 + 6,9 / Re )',
        'R = λ · ρ · w² / (2 · d)'
      ]
    }
  }
}

/** Rundet für die Anzeige auf zwölf gültige Stellen — Stoffdaten und Maße sind Messwerte. */
export function roundForDisplay(value: number, digits = 12): number {
  if (!Number.isFinite(value)) return value
  if (value === 0) return 0
  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (digits - 1 - exponent)
  return Math.round(value * factor) / factor
}
