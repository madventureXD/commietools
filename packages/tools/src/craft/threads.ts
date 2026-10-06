/**
 * Gewinde, Bohrungen und Anzugsmomente (Welle E, Werkzeug 18) — reine Fachlogik.
 *
 * Keine Texte, kein DOM: Beschriftungen kommen aus den Sprachpaketen, das Zeichnen aus
 * `apps/web/src/tools/Threads.tsx`. Diese Datei trägt nur Kennungen, Zahlen und Rechenwege.
 *
 * Rechtliche Linie, die den Aufbau prägt (siehe Belegsammlung `18-gewinde.md`):
 * - Einzelne genormte Zahlen sind Tatsachen und nicht schutzfähig.
 * - Die konkrete **Zusammenstellung** (die Tabelle als Ganzes) ist geschützt.
 * - „Frei abrufbar“ ist nicht „frei übernehmbar“.
 * Deshalb steht hier **keine** abgeschriebene Normtabelle: Das Kernloch wird aus der belegten
 * Regel `Ø Kernloch = Nenndurchmesser − Steigung` **gerechnet** (H1, H2), und wo dennoch ein
 * Tabellenwert mitläuft (die gerundeten Bohrernormgrößen H1/H2), ist er als *Vergleichswert*
 * gekennzeichnet, nicht als Quelle der Rechnung. Anzugsmomente stehen ausschließlich als
 * **Spanne** und sind ausdrücklich Richtwerte. Jede Wertezeile trägt ihre Belegkürzel bei sich,
 * damit die Oberfläche die Quelle sichtbar zeigen kann.
 *
 * Abrufdatum aller Quellen: siehe `THREAD_RETRIEVED`.
 */

/** Gewindeart: Regelgewinde (grob) oder Feingewinde. */
export type ThreadSeries = 'coarse' | 'fine'

/** Schlüsselweiten-Reihe: aktuelle ISO-Werte oder die 1992 ersetzte alte DIN-Reihe. */
export type WrenchSeries = 'iso' | 'din'

/** Festigkeitsklasse eines metrischen Schrauben-Anzugsmoments. */
export type StrengthGrade = '8.8' | '10.9'

/** Durchgangsloch-Reihe nach DIN EN 20273 (ISO 273): mittel (H13) oder fein (H12). */
export type PassageSeries = 'medium' | 'fine'

/** Eine zitierte Belegquelle: Kürzel und Adresse. Der Name liegt im Sprachpaket. */
export interface ThreadSource {
  readonly code: string
  readonly url: string
}

/** Anzugsmoment als Spanne in Nm, mit der Festigkeitsklasse und den Belegkürzeln. */
export interface TorqueRange {
  readonly grade: StrengthGrade
  readonly minNm: number
  readonly maxNm: number
  readonly sources: readonly string[]
  /** Wahr, wenn nur eine einzige Quelle vorliegt — die Spanne ist dann ein Punkt. */
  readonly single: boolean
}

/** Eine Nenngröße mit allen belegten Werten. Fehlende Werte sind `null`, nicht erfunden. */
export interface ThreadSize {
  /** Nenngröße als Kennung, etwa `M10`. */
  readonly label: string
  /** Nenndurchmesser in mm. */
  readonly d: number
  /** Regelsteigung P in mm. */
  readonly coarsePitch: number
  /** Belegkürzel der Regelsteigung. */
  readonly coarseSources: readonly string[]
  /** Belegte Feingewinde-Steigungen in mm (absteigend), leer wenn nicht belegt. */
  readonly finePitches: readonly number[]
  /** Belegkürzel der Feingewindeliste. */
  readonly fineSources: readonly string[]
  /** Gerundete Bohrer-Normgröße des Kernlochs aus H1/H2 — nur zum Vergleich, nicht gerechnet. */
  readonly coreHoleTable: number | null
  /** Belegkürzel des Vergleichswerts. */
  readonly coreHoleSources: readonly string[]
  /** Schlüsselweite nach ISO (EN ISO 4014/4032). */
  readonly wrenchIso: number | null
  /** Schlüsselweite nach alter DIN-Reihe (DIN 931/934), nur wo sie abweicht. */
  readonly wrenchDin: number | null
  /** Belegkürzel der Schlüsselweiten. */
  readonly wrenchSources: readonly string[]
  /** Durchgangsloch mittlere Reihe (H13) in mm — normgebunden, nicht unabhängig bestätigt. */
  readonly passageMedium: number | null
  /** Durchgangsloch feine Reihe (H12) in mm — normgebunden, nicht unabhängig bestätigt. */
  readonly passageFine: number | null
  /** Belegkürzel des Durchgangslochs. */
  readonly passageSources: readonly string[]
  /** Anzugsmomente als Richtwertspannen (trocken, µ ≈ 0,12–0,14). */
  readonly torque: readonly TorqueRange[]
}

/**
 * Grenzen der Eingabefelder — je Feld **eine** Zeile, und jede Zeile wird in `planThreads`
 * wirklich abgefragt. Ohne diese Prüfung sieht ein Grenzwert wie ein geprüfter Wert aus,
 * obwohl er nie greift.
 */
export const threadLimits = {
  /** Steigung P in mm. */
  pitch: { min: 0.1, max: 6 },
  /** Kernlochdurchmesser in mm. */
  coreHole: { min: 0.5, max: 63 },
  /** Kerndurchmesser D1 in mm. */
  coreDiameter: { min: 0.5, max: 63 },
  /** Durchgangslochdurchmesser in mm. */
  passageHole: { min: 0.5, max: 70 },
  /** Schlüsselweite in mm. */
  wrench: { min: 3, max: 80 },
  /** Anzugsmoment in Nm (gilt für beide Spannenenden). */
  torque: { min: 0.1, max: 5000 }
} as const

/** Abrufdatum aller Quellen der Belegsammlung (18-gewinde.md). */
export const THREAD_RETRIEVED = '2026-10-06'

/**
 * Faktor des theoretischen Kerndurchmessers D1 des Muttergewindes: D1 = d − 2·H1 mit
 * H1 = 0,5413·P, also D1 ≈ d − 1,0826·P. Quelle: FS1 (TU Darmstadt, CAD-Norminfo).
 */
export const KERN_D1_FAKTOR = 1.0826

/** Vollständige Quellenliste der Belegsammlung, die dieses Werkzeug zitiert. */
export const THREAD_SOURCES: readonly ThreadSource[] = [
  { code: 'W1', url: 'https://de.wikipedia.org/wiki/Metrisches_ISO-Gewinde' },
  { code: 'H1', url: 'https://prohandling.de/anwendungsbereiche/kernlochbohrung' },
  { code: 'H2', url: 'https://gewindeaufschneider.de/kernlochmaszen' },
  { code: 'H3', url: 'https://hsos.eu/schluesselweiten-tabelle' },
  { code: 'H4', url: 'https://www.schraubenhandel24.de/lexikon/metrisches-gewinde' },
  { code: 'H5', url: 'http://www.frank-hafner.de/tipp/iso-gewinde.html' },
  { code: 'H6', url: 'https://www.landefeld.de/shop/media/webdownload/Tabellensammlung.pdf' },
  { code: 'FS1', url: 'https://www.iim.maschinenbau.tu-darmstadt.de/CAD-Tutorial/CAD-Norminfo/3_important_standards_and_data_sheets/2_screws_and_threads/1_metric_iso_thread/index.de.html' },
  { code: 'H7', url: 'https://amesweb.info/de/Durchgangslocher-Schrauben.aspx' },
  { code: 'H8', url: 'https://www.anzugsmoment.de/durchgangsloch/' },
  { code: 'H9', url: 'https://www.drehmoment-schluessel.de/drehmoment-schrauben/' },
  { code: 'H10', url: 'https://www.schraubenhandel24.de/lexikon/drehmoment' },
  { code: 'H11', url: 'https://www.zimmer-group.com/de/td' },
  { code: 'H15', url: 'https://www.dsm-messtechnik.de/schrauben-drehmoment-tabelle/' },
  { code: 'H16', url: 'https://de.zxc.wiki/wiki/Schl%C3%BCsselweite' },
  { code: 'H17', url: 'https://de.zippgroup.com/imperial-metric-bolt-head-wrench-size' },
  { code: 'H18', url: 'https://yhenghardware.com/de/hex-bolt-sizes-chart-metric-imperial-complete-dimension-table-2026' }
]

/** Rohform einer Größe mit Vorgaben für die Felder, die nicht jede Größe trägt. */
interface ThreadSizeInput {
  readonly label: string
  readonly d: number
  readonly coarsePitch: number
  readonly coarseSources: readonly string[]
  readonly finePitches?: readonly number[]
  readonly fineSources?: readonly string[]
  readonly coreHoleTable?: number | null
  readonly coreHoleSources?: readonly string[]
  readonly wrenchIso?: number | null
  readonly wrenchDin?: number | null
  readonly wrenchSources?: readonly string[]
  readonly passageMedium?: number | null
  readonly passageFine?: number | null
  readonly passageSources?: readonly string[]
  readonly torque?: readonly TorqueRange[]
}

const S = (input: ThreadSizeInput): ThreadSize => ({
  label: input.label,
  d: input.d,
  coarsePitch: input.coarsePitch,
  coarseSources: input.coarseSources,
  finePitches: input.finePitches ?? [],
  fineSources: input.fineSources ?? [],
  coreHoleTable: input.coreHoleTable ?? null,
  coreHoleSources: input.coreHoleSources ?? [],
  wrenchIso: input.wrenchIso ?? null,
  wrenchDin: input.wrenchDin ?? null,
  wrenchSources: input.wrenchSources ?? [],
  passageMedium: input.passageMedium ?? null,
  passageFine: input.passageFine ?? null,
  passageSources: input.passageSources ?? [],
  torque: input.torque ?? []
})

/** Belegkürzel des Kernloch-Vergleichswerts (H1 und H2 sind deckungsgleich). */
const CORE_HOLE_SRC = ['H1', 'H2'] as const
/** Belegkürzel des Durchgangslochs — normgebunden (ISO 273), nicht unabhängig bestätigt. */
const PASSAGE_SRC = ['H7', 'H8'] as const

/**
 * Die Gewindereihe als Daten: Nenngröße, Regelsteigung und Feingewinde.
 *
 * Alle Werte stammen aus `18-gewinde.md` (Abrufdatum `THREAD_RETRIEVED`). Was dort nicht steht,
 * bleibt hier `null` — es wird nicht ergänzt.
 */
export const THREAD_SIZES: readonly ThreadSize[] = [
  S({ label: 'M3', d: 3, coarsePitch: 0.5, coarseSources: ['W1', 'H1', 'H2', 'H3', 'H5'], coreHoleTable: 2.5, coreHoleSources: CORE_HOLE_SRC, passageMedium: 3.4, passageFine: 3.2, passageSources: PASSAGE_SRC }),
  S({ label: 'M3,5', d: 3.5, coarsePitch: 0.6, coarseSources: ['W1', 'H1', 'H2'] }),
  S({ label: 'M4', d: 4, coarsePitch: 0.7, coarseSources: ['W1', 'H1', 'H2', 'H3'], coreHoleTable: 3.3, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 7, wrenchSources: ['H3', 'H18'], passageMedium: 4.5, passageFine: 4.3, passageSources: PASSAGE_SRC }),
  S({ label: 'M4,5', d: 4.5, coarsePitch: 0.75, coarseSources: ['H1', 'H2'] }),
  S({ label: 'M5', d: 5, coarsePitch: 0.8, coarseSources: ['W1', 'H1', 'H2', 'H3'], coreHoleTable: 4.2, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 8, wrenchSources: ['H3', 'H18'], passageMedium: 5.5, passageFine: 5.3, passageSources: PASSAGE_SRC }),
  S({ label: 'M6', d: 6, coarsePitch: 1, coarseSources: ['W1', 'H1', 'H2', 'H3'], finePitches: [0.75, 0.5], fineSources: ['H3'], coreHoleTable: 5, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 10, wrenchSources: ['H3', 'H18'], passageMedium: 6.6, passageFine: 6.4, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 9.9, maxNm: 10, sources: ['H10', 'H11'], single: false }, { grade: '10.9', minNm: 14, maxNm: 15, sources: ['H10', 'H11'], single: false }] }),
  S({ label: 'M7', d: 7, coarsePitch: 1, coarseSources: ['H1', 'H2'] }),
  S({ label: 'M8', d: 8, coarsePitch: 1.25, coarseSources: ['W1', 'H1', 'H2', 'H3'], finePitches: [1, 0.75], fineSources: ['W1', 'H3'], coreHoleTable: 6.8, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 13, wrenchSources: ['H3', 'H17', 'H18'], passageMedium: 9, passageFine: 8.4, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 24, maxNm: 27, sources: ['H9', 'H10', 'H11'], single: false }, { grade: '10.9', minNm: 34, maxNm: 40, sources: ['H9', 'H10', 'H11'], single: false }] }),
  S({ label: 'M9', d: 9, coarsePitch: 1.25, coarseSources: ['H1', 'H2'] }),
  S({ label: 'M10', d: 10, coarsePitch: 1.5, coarseSources: ['W1', 'H1', 'H2', 'H3'], finePitches: [1.25, 1, 0.75], fineSources: ['W1', 'H3'], coreHoleTable: 8.5, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 16, wrenchDin: 17, wrenchSources: ['H3', 'H16', 'H17'], passageMedium: 11, passageFine: 10.5, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 48, maxNm: 54, sources: ['H9', 'H10', 'H11'], single: false }, { grade: '10.9', minNm: 67, maxNm: 79, sources: ['H9', 'H10', 'H11'], single: false }] }),
  S({ label: 'M11', d: 11, coarsePitch: 1.5, coarseSources: ['H1', 'H2'] }),
  S({ label: 'M12', d: 12, coarsePitch: 1.75, coarseSources: ['W1', 'H1', 'H2', 'H3'], finePitches: [1.5, 1.25, 1], fineSources: ['W1', 'H3'], coreHoleTable: 10.2, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 18, wrenchDin: 19, wrenchSources: ['H3', 'H16'], passageMedium: 13.5, passageFine: 13, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 83, maxNm: 93, sources: ['H9', 'H11'], single: false }, { grade: '10.9', minNm: 117, maxNm: 137, sources: ['H9', 'H11'], single: false }] }),
  S({ label: 'M14', d: 14, coarsePitch: 2, coarseSources: ['W1', 'H1', 'H2', 'H3'], finePitches: [1.5, 1], fineSources: ['W1', 'H3'], coreHoleTable: 12, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 21, wrenchDin: 22, wrenchSources: ['H3', 'H16'], passageMedium: 15.5, passageSources: PASSAGE_SRC }),
  S({ label: 'M16', d: 16, coarsePitch: 2, coarseSources: ['H1', 'H2', 'H3'], finePitches: [1.5, 1], fineSources: ['H3'], coreHoleTable: 14, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 24, wrenchSources: ['H3', 'H16', 'H18'], passageMedium: 17.5, passageFine: 17, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 200, maxNm: 230, sources: ['H9', 'H11'], single: false }, { grade: '10.9', minNm: 285, maxNm: 338, sources: ['H9', 'H11'], single: false }] }),
  S({ label: 'M18', d: 18, coarsePitch: 2.5, coarseSources: ['H1', 'H2', 'H3'], finePitches: [2, 1.5, 1], fineSources: ['H3'], coreHoleTable: 15.5, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 27, wrenchSources: ['H3', 'H16', 'H18'] }),
  S({ label: 'M20', d: 20, coarsePitch: 2.5, coarseSources: ['H1', 'H2', 'H3'], finePitches: [2, 1.5, 1], fineSources: ['H3', 'H6'], coreHoleTable: 17.5, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 30, wrenchSources: ['H3', 'H16', 'H17', 'H18'], passageMedium: 22, passageFine: 21, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 390, maxNm: 464, sources: ['H9', 'H11'], single: false }, { grade: '10.9', minNm: 550, maxNm: 661, sources: ['H9', 'H11'], single: false }] }),
  S({ label: 'M22', d: 22, coarsePitch: 2.5, coarseSources: ['H1', 'H2', 'H3'], finePitches: [2, 1.5, 1], fineSources: ['H3'], coreHoleTable: 19.5, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 34, wrenchDin: 32, wrenchSources: ['H3', 'H16', 'H17'] }),
  S({ label: 'M24', d: 24, coarsePitch: 3, coarseSources: ['H1', 'H2', 'H3'], finePitches: [2, 1.5, 1], fineSources: ['H3', 'H6'], coreHoleTable: 21, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 36, wrenchSources: ['H3', 'H16', 'H18'], passageMedium: 26, passageFine: 25, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 675, maxNm: 798, sources: ['H9', 'H11'], single: false }, { grade: '10.9', minNm: 950, maxNm: 1136, sources: ['H9', 'H11'], single: false }] }),
  S({ label: 'M27', d: 27, coarsePitch: 3, coarseSources: ['H1', 'H2', 'H4'], finePitches: [2, 1.5, 1], fineSources: ['H3'], coreHoleTable: 24, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 41, wrenchSources: ['H3', 'H18'] }),
  S({ label: 'M30', d: 30, coarsePitch: 3.5, coarseSources: ['H1', 'H2', 'H3', 'H4'], finePitches: [2, 1.5], fineSources: ['H3', 'H6'], coreHoleTable: 26.5, coreHoleSources: CORE_HOLE_SRC, wrenchIso: 46, wrenchSources: ['H3', 'H17', 'H18'], passageMedium: 33, passageFine: 31, passageSources: PASSAGE_SRC, torque: [{ grade: '8.8', minNm: 1350, maxNm: 1350, sources: ['H11'], single: true }, { grade: '10.9', minNm: 1900, maxNm: 1900, sources: ['H11'], single: true }] })
]

/** Alle Nenngrößen in Anzeigereihenfolge. */
export const THREAD_SIZE_LABELS: readonly string[] = THREAD_SIZES.map((size) => size.label)

/** Sucht eine Nenngröße über ihre Kennung; unbekannt ergibt `undefined` (kein Rückfallwert). */
export function findThreadSize(label: string): ThreadSize | undefined {
  return THREAD_SIZES.find((size) => size.label === label)
}

/**
 * Kernlochdurchmesser nach der belegten Rechenregel `Ø Kernloch = d − P` (H1, H2).
 *
 * Das ist der **rohe** Wert vor dem Runden auf eine genormte Bohrergröße.
 */
export function coreHoleRaw(nominal: number, pitch: number): number {
  return nominal - pitch
}

/**
 * Kernloch als genormte Bohrergröße: der rohe Wert auf eine Nachkommastelle gerundet.
 *
 * Kaufmännisches Runden würde bei den beiden exakten Halbschritten abweichen — die belegten
 * Bohrerwerte H1/H2 runden `6,75 → 6,8` (auf) und `10,25 → 10,2` (ab). Beide Fälle sind genau
 * der „halbe Weg“; geregelt wird das durch **Runden zur geraden Nachkommastelle** (halbe Werte
 * gehen zur geraden Zahl). Damit trifft die Rechnung alle fünfzehn in der Belegsammlung
 * genannten Tabellenwerte. Die Rechnung ist die Grundlage, der Tabellenwert nur die Gegenprobe.
 */
export function coreHoleDrill(nominal: number, pitch: number): number {
  return roundHalfEven(coreHoleRaw(nominal, pitch), 1)
}

/** Theoretischer Kerndurchmesser D1 des Muttergewindes: D1 ≈ d − 1,0826·P (FS1). */
export function coreDiameter(nominal: number, pitch: number): number {
  return nominal - KERN_D1_FAKTOR * pitch
}

/**
 * D1 mit zwei Nachkommastellen — der Wert, der in der Oberfläche stehen darf.
 *
 * Ohne die Rundung stand dort „8,376100000000001“ (Gleitkomma-Rest). Ein Millimeterwert mit
 * fünfzehn Stellen täuscht eine Genauigkeit vor, die die Rechnung nicht hat. Nur die **Anzeige**
 * rundet; die Rechenfunktion bleibt exakt, damit sie nachprüfbar ist.
 */
export function coreDiameterShown(nominal: number, pitch: number): number {
  return Math.round(coreDiameter(nominal, pitch) * 100) / 100
}

/** Durchgangslochdurchmesser nach DIN EN 20273 — normgebunden (H7/H8), oder `null`. */
export function passageHole(size: ThreadSize, series: PassageSeries): number | null {
  return series === 'medium' ? size.passageMedium : size.passageFine
}

/** Schlüsselweite je Reihe: aktuelle ISO-Werte oder die alte DIN-Reihe, oder `null`. */
export function wrenchWidth(size: ThreadSize, series: WrenchSeries): number | null {
  return series === 'iso' ? size.wrenchIso : size.wrenchDin
}

/** Anzugsmomentspanne je Festigkeitsklasse, oder `null` wenn nicht belegt. */
export function torqueRange(size: ThreadSize, grade: StrengthGrade): TorqueRange | null {
  return size.torque.find((range) => range.grade === grade) ?? null
}

/** Eingaben des Rechners — reine Zahlen, bereits aus den Textfeldern gelesen. */
export interface ThreadInput {
  readonly sizeLabel: string
  readonly pitch: number
  readonly coreHole: number
  readonly coreDiameter: number
  readonly passageHole: number
  readonly wrench: number
  readonly torqueMin: number
  readonly torqueMax: number
}

export type ThreadCheck =
  | { readonly ok: true; readonly size: ThreadSize }
  | { readonly ok: false; readonly errorKey: string }

const within = (value: number, range: { readonly min: number; readonly max: number }): boolean =>
  value >= range.min && value <= range.max

/**
 * Prüft alle Eingaben gegen `threadLimits` und weist unbelegte Größen und leere Felder ab.
 *
 * Reihenfolge: erst die Nenngröße (unbekannt → eigener Fehler), dann leere (nicht-endliche)
 * Felder, dann jedes Feld des Grenzwertobjekts — **eine Zeile je Feld**, damit kein Grenzwert
 * unbefragt bleibt. Zuletzt die Ordnung der Momentenspanne (bis ≥ von).
 */
export function planThreads(input: ThreadInput): ThreadCheck {
  const size = findThreadSize(input.sizeLabel)
  if (!size) return { ok: false, errorKey: 'tool.threads.error.unknownSize' }

  const werte = [input.pitch, input.coreHole, input.coreDiameter, input.passageHole, input.wrench, input.torqueMin, input.torqueMax]
  for (const wert of werte) {
    if (!Number.isFinite(wert)) return { ok: false, errorKey: 'tool.craft.error.empty' }
  }

  if (!within(input.pitch, threadLimits.pitch)) return { ok: false, errorKey: 'tool.threads.error.pitch' }
  if (!within(input.coreHole, threadLimits.coreHole)) return { ok: false, errorKey: 'tool.threads.error.coreHole' }
  if (!within(input.coreDiameter, threadLimits.coreDiameter)) return { ok: false, errorKey: 'tool.threads.error.coreDiameter' }
  if (!within(input.passageHole, threadLimits.passageHole)) return { ok: false, errorKey: 'tool.threads.error.passageHole' }
  if (!within(input.wrench, threadLimits.wrench)) return { ok: false, errorKey: 'tool.threads.error.wrench' }
  if (!within(input.torqueMin, threadLimits.torque)) return { ok: false, errorKey: 'tool.threads.error.torque' }
  if (!within(input.torqueMax, threadLimits.torque)) return { ok: false, errorKey: 'tool.threads.error.torque' }
  if (input.torqueMax < input.torqueMin) return { ok: false, errorKey: 'tool.threads.error.torqueOrder' }

  return { ok: true, size }
}

/**
 * Rundet einen Wert auf eine feste Zahl Nachkommastellen, halbe Werte zur **geraden** Ziffer.
 *
 * Eigene Umsetzung, weil `Math.round` halbe Werte immer aufrundet und damit `10,25 → 10,3`
 * ergäbe, während die Belegsammlung `10,2` nennt.
 */
function roundHalfEven(value: number, digits: number): number {
  const factor = 10 ** digits
  const scaled = value * factor
  const floor = Math.floor(scaled)
  const diff = scaled - floor
  const rounded = Math.abs(diff - 0.5) < 1e-9 ? (floor % 2 === 0 ? floor : floor + 1) : Math.round(scaled)
  return rounded / factor
}
