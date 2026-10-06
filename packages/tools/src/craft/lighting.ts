/**
 * Werkzeug 14 „Beleuchtungsplanung nach Lux" (Welle E, Suite „Handwerk") — reine Fachlogik.
 *
 * Keine Bibliothek, keine neue Abhängigkeit: reine Rechnung mit `Math`. Keine Anzeigetexte:
 * Beschriftungen kommen aus den Sprachpaketen (`craft/lighting/locales`), hier stehen nur
 * Kennungen, Werte und Quellverweise.
 *
 * WARUM die Wertetafel hier und nicht in der Oberfläche steht: Soll-Lux-Werte samt Quelle sind
 * Daten, keine Anzeige. Sie stammen ausschließlich aus der Belegsammlung
 * `uebergabe/06-protokolle/quellenlage-welle-e/14-beleuchtung.md` (Abrufdatum 2026-10-06).
 * Dort, wo sich die Quellen **widersprechen**, wird kein Mittelwert gebildet: geglättet wäre eine
 * Behauptung. Stattdessen trägt jeder widersprüchliche Raumtyp `conflict: true`, und die
 * Oberfläche zeigt die **Spanne** (kleinster bis größter belegter Wert) plus jede Quelle einzeln.
 *
 * Rechenweg (wie in öffentlichen Planungshilfen üblich):
 *   Lichtstrom (lm)   = Fläche (m²) · Soll-Lux ÷ Wartungsfaktor
 *   Leuchtenzahl      = Lichtstrom ÷ Lichtstrom je Leuchte, **aufgerundet** — halbe Leuchten gibt
 *                       es nicht zu kaufen.
 * Der Wartungsfaktor teilt, weil er den Lichtstromverlust zwischen zwei Reinigungen abbildet: ein
 * kleinerer Faktor verlangt **mehr** Lichtstrom, nicht weniger.
 *
 * Die Gleichmäßigkeit (Verhältnis E_min/Ē, Symbol U0) wird **nur als Eingabe** geführt. Die
 * raumtypen-spezifischen U0-Werte der DIN EN 12464-1 sind nicht frei belegt und werden deshalb
 * weder behauptet noch berechnet.
 */

/** Belegte Soll-Lux-Zeile eines Raumtyps: Nutzung, Wert und die zugehörige Quelle. */
export interface LightingValueRow {
  /** Nutzungsbeschreibung (Schlüssel im Sprachpaket). */
  readonly labelKey: string
  /** Soll-Beleuchtungsstärke in Lux, wie in der Quelle genannt. */
  readonly lux: number
  /** Kurzer Quellennachweis (Schlüssel im Sprachpaket), z. B. „ASR A3.4 Anhang 3 Nr. 4.2". */
  readonly citationKey: string
  /** Kennung im Quellenverzeichnis (`lightingSources`). */
  readonly sourceId: string
}

/** Ein wählbarer Raumtyp mit seiner Wertetafel. */
export interface LightingRoomType {
  readonly id: string
  readonly labelKey: string
  /** Vorgeschlagener Soll-Wert in Lux (in der Oberfläche änderbar). */
  readonly defaultLux: number
  /** Wahr, wenn sich die Quellen für diesen Raumtyp widersprechen — dann ist die Spanne zu zeigen. */
  readonly conflict: boolean
  readonly rows: readonly LightingValueRow[]
}

/** Wertespanne über alle belegten Zeilen (kleinster bis größter Wert). */
export interface LightingSpan {
  readonly min: number
  readonly max: number
}

/** Eintrag des Quellenverzeichnisses: frei zugängliche Quelle mit Art, Adresse und Abrufdatum. */
export interface LightingSourceEntry {
  readonly id: string
  readonly labelKey: string
  readonly typeKey: string
  readonly url: string
  readonly retrieved: string
}

/** Belegter Wartungsfaktor-Wert samt Quelle (Bandbreite, siehe `lightingMaintenanceFactor`). */
export interface LightingMaintenanceEntry {
  readonly labelKey: string
  readonly factor: number
  readonly citationKey: string
  readonly sourceId: string
}

/** Eingaben der Planung. `uniformity` fließt bewusst in keine Rechnung ein — nur Eingabe. */
export interface LightingInput {
  readonly roomTypeId: string
  /** Fläche in m². */
  readonly area: number
  /** Soll-Beleuchtungsstärke in lx. */
  readonly lux: number
  /** Wartungsfaktor (dimensionslos, 0 < f ≤ 1). */
  readonly maintenanceFactor: number
  /** Lichtstrom je Leuchte in lm. */
  readonly lumensPerLuminaire: number
  /** Gleichmäßigkeit U0 — nur Eingabe, kein Ergebnis. */
  readonly uniformity: number
}

/** Ergebnis der Planung. */
export interface LightingResult {
  /** Benötigter Lichtstrom in lm (auf ganze Lumen gerundet — Anzeigewert). */
  readonly luminousFlux: number
  /** Leuchtenzahl, aufgerundet. */
  readonly luminaires: number
}

/** Abrufdatum aller Werte — aus der Belegsammlung übernommen, nicht aus dem Kopf. */
export const LIGHTING_RETRIEVED = '2026-10-06'

/**
 * Grenzen je Eingabefeld. Jede Grenze wird in `lightingErrorKeys` wirklich abgefragt; der Test
 * geht jede einzeln durch. Die Grenzen sind **Plausibilitätsgrenzen des Werkzeugs**, keine
 * Normwerte — sie fangen Zahlendreher ab, sie sagen nichts über zulässige Auslegung.
 */
export const lightingLimits = {
  area: { min: 1, max: 100000 },
  lux: { min: 20, max: 3000 },
  maintenanceFactor: { min: 0.4, max: 1 },
  lumensPerLuminaire: { min: 100, max: 200000 },
  uniformity: { min: 0.1, max: 1 }
} as const

/**
 * Quellenverzeichnis (alle frei zugänglich, Abruf 2026-10-06). Nur diese Quellen — DIN EN 12464-1
 * wurde bewusst nicht herangezogen (kostenpflichtig/urheberrechtlich geschützt).
 */
export const lightingSources: readonly LightingSourceEntry[] = [
  { id: 'asr', labelKey: 'tool.lighting.src.asr', typeKey: 'tool.lighting.type.authority', url: 'https://www.baua.de/DE/Angebote/Regelwerk/ASR/pdf/ASR-A3-4.pdf?__blob=publicationFile', retrieved: LIGHTING_RETRIEVED },
  { id: 'baua', labelKey: 'tool.lighting.src.baua', typeKey: 'tool.lighting.type.authority', url: 'https://www.baua.de/DE/Themen/Arbeitsgestaltung/Gefaehrdungsbeurteilung/Handbuch-Gefaehrdungsbeurteilung/Expertenwissen/Arbeitsumgebungsbedingungen/Beleuchtung-Licht/Beleuchtung-Licht_dossier', retrieved: LIGHTING_RETRIEVED },
  { id: 'dguv210', labelKey: 'tool.lighting.src.dguv210', typeKey: 'tool.lighting.type.bg', url: 'https://cdn.vbg.de/media/5700d8e36d2d4243ba73fe7c27afad8b/dld:attachment/DGUV_Information_215-210_Beleuchtung_von_Arbeitsstaetten.pdf', retrieved: LIGHTING_RETRIEVED },
  { id: 'dguv442', labelKey: 'tool.lighting.src.dguv442', typeKey: 'tool.lighting.type.bg', url: 'https://www.bgbau.de/fileadmin/Medien-Objekte/Medien/DGUV-Informationen/215_442/215-442_BG_BAU.pdf', retrieved: LIGHTING_RETRIEVED },
  { id: 'lichtwartung', labelKey: 'tool.lighting.src.lichtwartung', typeKey: 'tool.lighting.type.planning', url: 'https://www.licht.de/de/lichtplanung/planung-in-der-praxis/wartung-und-wartungsfaktor', retrieved: LIGHTING_RETRIEVED },
  { id: 'lichtnorm', labelKey: 'tool.lighting.src.lichtnorm', typeKey: 'tool.lighting.type.planning', url: 'https://www.licht.de/de/lichtplanung/normen-und-vorschriften/hinweise-zu-din-en-12464-1/raum-und-sehaufgabe', retrieved: LIGHTING_RETRIEVED },
  { id: 'lichtlager', labelKey: 'tool.lighting.src.lichtlager', typeKey: 'tool.lighting.type.planning', url: 'https://www.licht.de/de/lichtanwendungen/bereich/1-gesundheit-und-pflege/41-lager-und-logistik', retrieved: LIGHTING_RETRIEVED },
  { id: 'ekas', labelKey: 'tool.lighting.src.ekas', typeKey: 'tool.lighting.type.authority', url: 'https://wegleitung.ekas.ch/uebersicht-wegleitung/arbeitsumgebung/beleuchtung-der-arbeitsumgebung/beleuchtungsstaerke', retrieved: LIGHTING_RETRIEVED },
  { id: 'amev', labelKey: 'tool.lighting.src.amev', typeKey: 'tool.lighting.type.planning', url: 'https://www.amev-online.de/AMEVInhalt/Planen/Elektrotechnik/Beleuchtung/Beleuchtung_2023_Stand_03-25.pdf', retrieved: LIGHTING_RETRIEVED },
  { id: 'staedtetag', labelKey: 'tool.lighting.src.staedtetag', typeKey: 'tool.lighting.type.association', url: 'https://www.staedtetag.de/files/dst/docs/Dezernat-6/2025/Hinweise_4_2_Raumtemperaturen.pdf', retrieved: LIGHTING_RETRIEVED },
  { id: 'baunetz', labelKey: 'tool.lighting.src.baunetz', typeKey: 'tool.lighting.type.trade', url: 'https://www.baunetzwissen.de/licht/fachwissen/beleuchtungsarten/beleuchtungsstaerken-empfehlungen-fuer-raeume-167320', retrieved: LIGHTING_RETRIEVED },
  { id: 'zvei', labelKey: 'tool.lighting.src.zvei', typeKey: 'tool.lighting.type.planning', url: 'https://www.vde.com/resource/blob/718806/2207ff996de6d90f678c035614a5d3e5/zvei-leitfadfen---download-data.pdf', retrieved: LIGHTING_RETRIEVED },
  { id: 'augustmueller', labelKey: 'tool.lighting.src.augustmueller', typeKey: 'tool.lighting.type.trade', url: 'https://www.augustmuellerlichttechnik.de/', retrieved: LIGHTING_RETRIEVED },
  { id: 'pranaair', labelKey: 'tool.lighting.src.pranaair', typeKey: 'tool.lighting.type.trade', url: 'https://pranaair.com/', retrieved: LIGHTING_RETRIEVED }
]

/** Nachschlagen einer Quelle im Verzeichnis — die Oberfläche holt so die Quellenart zur Zeile. */
export function sourceById(id: string): LightingSourceEntry | undefined {
  return lightingSources.find((eintrag) => eintrag.id === id)
}

/**
 * Wertetafel je Raumtyp mit **einer Quelle je Zeile**.
 * `conflict: true` bedeutet: die Quellen widersprechen sich (siehe Belegsammlung, Abschnitt
 * „Widersprüche"), die Oberfläche zeigt dann die Spanne statt eines geglätteten Einzelwerts.
 */
export const lightingRoomTypes: readonly LightingRoomType[] = [
  {
    id: 'office', labelKey: 'tool.lighting.room.office', defaultLux: 500, conflict: false,
    rows: [
      { labelKey: 'tool.lighting.label.office.v1', lux: 500, citationKey: 'tool.lighting.cite.asr4_2', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.office.v2', lux: 500, citationKey: 'tool.lighting.src.baua', sourceId: 'baua' },
      { labelKey: 'tool.lighting.label.office.v3', lux: 500, citationKey: 'tool.lighting.src.baunetz', sourceId: 'baunetz' }
    ]
  },
  {
    id: 'corridor', labelKey: 'tool.lighting.room.corridor', defaultLux: 100, conflict: true,
    rows: [
      { labelKey: 'tool.lighting.label.corridor.v1', lux: 50, citationKey: 'tool.lighting.cite.asr1_2', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.corridor.v2', lux: 100, citationKey: 'tool.lighting.src.ekas', sourceId: 'ekas' },
      { labelKey: 'tool.lighting.label.corridor.v3', lux: 150, citationKey: 'tool.lighting.src.augustmueller', sourceId: 'augustmueller' }
    ]
  },
  {
    id: 'workshop', labelKey: 'tool.lighting.room.workshop', defaultLux: 300, conflict: true,
    rows: [
      { labelKey: 'tool.lighting.label.workshop.v1', lux: 200, citationKey: 'tool.lighting.src.augustmueller', sourceId: 'augustmueller' },
      { labelKey: 'tool.lighting.label.workshop.v2', lux: 300, citationKey: 'tool.lighting.src.ekas', sourceId: 'ekas' },
      { labelKey: 'tool.lighting.label.workshop.v3', lux: 500, citationKey: 'tool.lighting.src.ekas', sourceId: 'ekas' }
    ]
  },
  {
    id: 'storage', labelKey: 'tool.lighting.room.storage', defaultLux: 100, conflict: true,
    rows: [
      { labelKey: 'tool.lighting.label.storage.v1', lux: 50, citationKey: 'tool.lighting.cite.asr2_2', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.storage.v2', lux: 100, citationKey: 'tool.lighting.cite.asr2_3', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.storage.v3', lux: 150, citationKey: 'tool.lighting.src.ekas', sourceId: 'ekas' },
      { labelKey: 'tool.lighting.label.storage.v4', lux: 150, citationKey: 'tool.lighting.src.augustmueller', sourceId: 'augustmueller' }
    ]
  },
  {
    id: 'sanitary', labelKey: 'tool.lighting.room.sanitary', defaultLux: 200, conflict: true,
    rows: [
      { labelKey: 'tool.lighting.label.sanitary.v1', lux: 200, citationKey: 'tool.lighting.cite.asr3_4', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.sanitary.v2', lux: 200, citationKey: 'tool.lighting.src.staedtetag', sourceId: 'staedtetag' },
      { labelKey: 'tool.lighting.label.sanitary.v3', lux: 100, citationKey: 'tool.lighting.src.ekas', sourceId: 'ekas' },
      { labelKey: 'tool.lighting.label.sanitary.v4', lux: 100, citationKey: 'tool.lighting.src.baunetz', sourceId: 'baunetz' }
    ]
  },
  {
    id: 'classroom', labelKey: 'tool.lighting.room.classroom', defaultLux: 300, conflict: true,
    rows: [
      { labelKey: 'tool.lighting.label.classroom.v1', lux: 300, citationKey: 'tool.lighting.cite.asr27_2', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.classroom.v2', lux: 500, citationKey: 'tool.lighting.src.staedtetag', sourceId: 'staedtetag' },
      { labelKey: 'tool.lighting.label.classroom.v3', lux: 500, citationKey: 'tool.lighting.src.lichtnorm', sourceId: 'lichtnorm' }
    ]
  },
  {
    id: 'retail', labelKey: 'tool.lighting.room.retail', defaultLux: 300, conflict: true,
    rows: [
      { labelKey: 'tool.lighting.label.retail.v1', lux: 300, citationKey: 'tool.lighting.src.augustmueller', sourceId: 'augustmueller' },
      { labelKey: 'tool.lighting.label.retail.v2', lux: 750, citationKey: 'tool.lighting.src.pranaair', sourceId: 'pranaair' }
    ]
  },
  {
    id: 'kitchen', labelKey: 'tool.lighting.room.kitchen', defaultLux: 500, conflict: false,
    rows: [
      { labelKey: 'tool.lighting.label.kitchen.v1', lux: 500, citationKey: 'tool.lighting.cite.asr3_10', sourceId: 'asr' },
      { labelKey: 'tool.lighting.label.kitchen.v2', lux: 500, citationKey: 'tool.lighting.src.staedtetag', sourceId: 'staedtetag' }
    ]
  }
]

/**
 * Belegte Bandbreite des Wartungsfaktors. Die Quellen widersprechen sich auch hier: licht.de nennt
 * bei dreijährigem Wartungsintervall 0,67 (saubere Räume) bis 0,5 (schmutzige Räume), Rechner setzen
 * dagegen häufig 0,8 an. Ein allgemeingültiger Wert existiert nicht — deshalb ist das Feld eine
 * Eingabe mit Hinweis, keine feste Zahl.
 */
export const lightingMaintenanceFactor: readonly LightingMaintenanceEntry[] = [
  { labelKey: 'tool.lighting.maintenance.clean', factor: 0.67, citationKey: 'tool.lighting.src.lichtwartung', sourceId: 'lichtwartung' },
  { labelKey: 'tool.lighting.maintenance.dirty', factor: 0.5, citationKey: 'tool.lighting.src.lichtwartung', sourceId: 'lichtwartung' },
  { labelKey: 'tool.lighting.maintenance.default', factor: 0.8, citationKey: 'tool.lighting.cite.maintenanceDefault', sourceId: 'lichtwartung' }
]

/** Raumtyp nach Kennung, oder `undefined` — nie ein geratener Ersatz. */
export function roomTypeById(id: string): LightingRoomType | undefined {
  return lightingRoomTypes.find((raum) => raum.id === id)
}

/** Spanne über die belegten Zeilen eines Raumtyps (kleinster bis größter Wert). */
export function roomTypeSpan(room: LightingRoomType): LightingSpan {
  const werte = room.rows.map((zeile) => zeile.lux)
  return { min: Math.min(...werte), max: Math.max(...werte) }
}

/** Spanne der belegten Wartungsfaktoren (0,5 bis 0,8) — Hinweis für die Eingabe. */
export function maintenanceFactorSpan(): LightingSpan {
  const werte = lightingMaintenanceFactor.map((eintrag) => eintrag.factor)
  return { min: Math.min(...werte), max: Math.max(...werte) }
}

/**
 * Prüft jede Eingabe gegen `lightingLimits`. Jede dort erklärte Grenze wird hier abgefragt; die
 * Fehlerschlüssel zeigen in die Sprachpakete. Nicht-endliche Zahlen (NaN, Infinity) fallen ebenfalls
 * durch, weil sie jede Rechnung stillschweigend verfälschen würden.
 */
export function lightingErrorKeys(input: LightingInput): readonly string[] {
  const fehler: string[] = []
  if (!roomTypeById(input.roomTypeId)) fehler.push('tool.lighting.error.roomType')
  if (!imBereich(input.area, lightingLimits.area.min, lightingLimits.area.max)) fehler.push('tool.lighting.error.area')
  if (!imBereich(input.lux, lightingLimits.lux.min, lightingLimits.lux.max)) fehler.push('tool.lighting.error.lux')
  if (!imBereich(input.maintenanceFactor, lightingLimits.maintenanceFactor.min, lightingLimits.maintenanceFactor.max)) fehler.push('tool.lighting.error.maintenance')
  if (!imBereich(input.lumensPerLuminaire, lightingLimits.lumensPerLuminaire.min, lightingLimits.lumensPerLuminaire.max)) fehler.push('tool.lighting.error.lumens')
  if (!imBereich(input.uniformity, lightingLimits.uniformity.min, lightingLimits.uniformity.max)) fehler.push('tool.lighting.error.uniformity')
  return fehler
}

function imBereich(wert: number, min: number, max: number): boolean {
  return Number.isFinite(wert) && wert >= min && wert <= max
}

/**
 * Geplanter Lichtstrom in Lumen, **ungerundet** — die Rundung gehört in die Anzeige, nicht in die
 * Weiterrechnung, sonst weicht die Leuchtenzahl um eine Leuchte ab.
 */
export function plannedFlux(input: Pick<LightingInput, 'area' | 'lux' | 'maintenanceFactor'>): number {
  return (input.area * input.lux) / input.maintenanceFactor
}

/** Leuchtenzahl: Lichtstrom ÷ Lichtstrom je Leuchte, **aufgerundet** (halbe Leuchten gibt es nicht). */
export function luminaireCount(input: LightingInput): number {
  return Math.ceil(plannedFlux(input) / input.lumensPerLuminaire)
}

/**
 * Ergebnis der Planung. Bei ungültiger Eingabe `null` statt einer stillschweigend falschen Zahl —
 * der Aufrufer zeigt dann die Fehlerschlüssel aus `lightingErrorKeys`.
 */
export function lightingResult(input: LightingInput): LightingResult | null {
  if (lightingErrorKeys(input).length > 0) return null
  return { luminousFlux: Math.round(plannedFlux(input)), luminaires: luminaireCount(input) }
}
