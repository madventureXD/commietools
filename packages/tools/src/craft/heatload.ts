/**
 * Heizlast-Überschlag je Raum (Welle E, Werkzeug 16) — reine Fachlogik, kein DOM, keine Texte.
 *
 * WARUM die Zahlen so aussehen: Eine normgerechte Heizlastberechnung nach DIN EN 12831 ist
 * ausdrücklich **nicht** Gegenstand dieses Werkzeugs. Alle Werte unten sind frei zugängliche,
 * öffentlich belegte Erfahrungs- und Beispielwerte (Abruf 2026-10-06), jeweils mit Quellenkennung
 * und vom Nutzer änderbar. Normtabellen werden bewusst **nicht** übernommen (OLG Hamburg,
 * Az. 3 U 220/15). Beschriftungen kommen aus den Sprachpaketen; hier stehen nur Kennungen.
 *
 * Der Überschlag rechnet je Raum zwei Anteile:
 *   Transmission: Q_T = Σ U · A · ΔT
 *   Lüftung:      Q_L = ρ · c_p · n · V · ΔT / 3600
 * Die Division durch 3600 ist nötig, weil die Luftwechselrate n in h⁻¹ angegeben ist: das Produkt
 * ρ·c_p·n·V·ΔT ist eine **Energie je Stunde**, gefragt ist aber eine Leistung (W = J/s).
 * Ohne diesen Schritt wären die Lüftungsverluste um den Faktor 3600 zu hoch.
 */

/** Abrufdatum aller Quellen (verbindlich aus der Quellenlage, 2026-10-06). */
export const HEATLOAD_RETRIEVED = '2026-10-06'

/** Quellentyp — die Anzeige läuft über Übersetzungsschlüssel. */
export type HeatloadSourceType =
  | 'behoerde'
  | 'gesetz'
  | 'verbraucher'
  | 'institut'
  | 'kommerziell'
  | 'enzyklopaedie'
  | 'fachdatenbank'
  | 'eigener'

export interface HeatloadSource {
  readonly id: string
  readonly type: HeatloadSourceType
  readonly url: string
}

/**
 * Quellenverzeichnis — genau die Quellen aus der Quellenlage (16-heizlast.md), nichts ergänzt.
 * Die Kennungen erscheinen je Zeile (U-Wert, Raumtemperatur, Luftwechsel, Stoffdaten der Luft).
 */
export const heatloadSources: readonly HeatloadSource[] = [
  { id: 'bbsr', type: 'behoerde', url: 'https://www.bbsr-geg.bund.de/GEGPortal/DE/Praxishilfen/Wirtschaftlichkeit/Tabellen/PDF/UWerte_DL.pdf' },
  { id: 'geg7', type: 'gesetz', url: 'https://www.gesetze-im-internet.de/geg/anlage_7.html' },
  { id: 'vznrw', type: 'verbraucher', url: 'https://www.verbraucherzentrale.nrw/sites/default/files/2025-03/fassadendammung_03_2025.pdf' },
  { id: 'uba', type: 'behoerde', url: 'https://www.umweltbundesamt.de/umwelttipps-fuer-den-alltag/richtiges-heizen-schuetzt-das-klima-den-geldbeutel' },
  { id: 'wikipedia', type: 'enzyklopaedie', url: 'https://de.wikipedia.org/wiki/Raumtemperatur' },
  { id: 'sanier', type: 'kommerziell', url: 'https://www.sanier.de/wissen/u-werte-von-gebaeudeteilen-und-bauteilkonstruktionen' },
  { id: 'enbw', type: 'kommerziell', url: 'https://www.enbw.com/blog/wohnen/energie-sparen/tipps-fuer-das-richtige-heizen-und-lueften' },
  { id: 'duesseldorf', type: 'behoerde', url: 'https://www.duesseldorf.de/fileadmin/Amt19/umweltamt/klimaschutz/pdf/klimaschutz/20140410_lueften_nach_konzept_din_1946_6.pdf' },
  { id: 'iwu', type: 'institut', url: 'https://www.iwu.de/fileadmin/publikationen/buergerinfo/espi/espi8.pdf' },
  { id: 'ewe', type: 'kommerziell', url: 'https://www.ewe.de/waerme/ratgeber/luftwechselrate' },
  { id: 'baua', type: 'behoerde', url: 'https://www.baua.de/DE/Angebote/Publikationen/Berichte/F2072.pdf' },
  { id: 'stoffdaten', type: 'fachdatenbank', url: 'https://stoffdaten-online.de/luft/' },
  { id: 'chemie', type: 'fachdatenbank', url: 'https://www.chemie.de/lexikon/Luftdichte.html' },
  { id: 'energiem', type: 'fachdatenbank', url: 'https://wiki.energie-m.de/Luft' },
  { id: 'custom', type: 'eigener', url: '' }
] as const

export function heatloadSourceById(id: string): HeatloadSource | undefined {
  return heatloadSources.find((quelle) => quelle.id === id)
}

/**
 * U-Wert-Vorschläge aus der BBSR-Beispielsammlung (Bundesbehörde, 03.04.2017).
 * Jede Zeile trägt ihr `sourceId`; `category` gruppiert die Auswahl in der Oberfläche.
 * Der Wert ist ein Beispielwert („Beispiele für U-Werte") und in der Anzeige änderbar.
 */
export type UValueCategory = 'wand' | 'dach' | 'decke' | 'keller' | 'fenster'

export interface UValuePreset {
  readonly id: string
  readonly category: UValueCategory
  readonly uValue: number
  readonly sourceId: string
}

export const uValuePresets: readonly UValuePreset[] = [
  { id: 'wand_vollziegel_1918', category: 'wand', uValue: 1.65, sourceId: 'bbsr' },
  { id: 'wand_fachwerk_1918', category: 'wand', uValue: 1.66, sourceId: 'bbsr' },
  { id: 'wand_bims_1947_78', category: 'wand', uValue: 1.14, sourceId: 'bbsr' },
  { id: 'wand_zweischalig_1969_78', category: 'wand', uValue: 1.01, sourceId: 'bbsr' },
  { id: 'wand_verkleidet_1969_78', category: 'wand', uValue: 0.78, sourceId: 'bbsr' },
  { id: 'wand_gedaemmt_hlz_12', category: 'wand', uValue: 0.24, sourceId: 'bbsr' },
  { id: 'wand_gedaemmt_vz_16', category: 'wand', uValue: 0.22, sourceId: 'bbsr' },
  { id: 'dach_schilf_bis1948', category: 'dach', uValue: 1.96, sourceId: 'bbsr' },
  { id: 'dach_holzwolle_1949_57', category: 'dach', uValue: 1.06, sourceId: 'bbsr' },
  { id: 'dach_sparren4_1958_68', category: 'dach', uValue: 0.60, sourceId: 'bbsr' },
  { id: 'dach_sparren4_gk_1948_78', category: 'dach', uValue: 0.95, sourceId: 'bbsr' },
  { id: 'decke_holz_schuettung_bis1948', category: 'decke', uValue: 0.82, sourceId: 'bbsr' },
  { id: 'decke_beton_1949_57', category: 'decke', uValue: 1.61, sourceId: 'bbsr' },
  { id: 'decke_holz_schlacke_1949_68', category: 'decke', uValue: 0.64, sourceId: 'bbsr' },
  { id: 'decke_beton_ungedaemmt_1949_68', category: 'decke', uValue: 2.46, sourceId: 'bbsr' },
  { id: 'decke_beton_gedaemmt', category: 'decke', uValue: 0.22, sourceId: 'bbsr' },
  { id: 'kellerdecke_holz_1918', category: 'keller', uValue: 1.13, sourceId: 'bbsr' },
  { id: 'kellerdecke_kappen_bis1948', category: 'keller', uValue: 1.10, sourceId: 'bbsr' },
  { id: 'kellerdecke_beton_1919_49', category: 'keller', uValue: 1.94, sourceId: 'bbsr' },
  { id: 'kellerdecke_beton_1949_57', category: 'keller', uValue: 0.93, sourceId: 'bbsr' },
  { id: 'kellerdecke_beton_1969_78', category: 'keller', uValue: 0.68, sourceId: 'bbsr' },
  { id: 'kellerdecke_beton_gedaemmt', category: 'keller', uValue: 0.22, sourceId: 'bbsr' },
  { id: 'fenster_einfach_bis1978', category: 'fenster', uValue: 4.70, sourceId: 'bbsr' },
  { id: 'fenster_verbund_bis1978', category: 'fenster', uValue: 2.40, sourceId: 'bbsr' },
  { id: 'fenster_isolier_1979_95', category: 'fenster', uValue: 2.70, sourceId: 'bbsr' }
] as const

export function uValuePresetById(id: string): UValuePreset | undefined {
  return uValuePresets.find((vorlage) => vorlage.id === id)
}

/** Kategorien in Anzeigereihenfolge (Beschriftung aus den Sprachpaketen). */
export const uValueCategories: readonly UValueCategory[] = ['wand', 'dach', 'decke', 'keller', 'fenster'] as const

/**
 * Innenraum-Solltemperaturen je Raumnutzung. `span` ist die belegte Bandbreite, `indoorTemp`
 * der bevorzugte Ansatz für den Überschlag (siehe Quellenlage b.2); der Sollwert bleibt eine
 * Wahl und ist in der Oberfläche änderbar.
 */
export type RoomUseKey = 'wohnen' | 'schlafen' | 'kueche' | 'bad' | 'flur'

export interface RoomUse {
  readonly id: RoomUseKey
  readonly indoorTemp: number
  readonly span: readonly [number, number]
  readonly sourceId: string
}

export const roomUses: readonly RoomUse[] = [
  { id: 'wohnen', indoorTemp: 20, span: [20, 22], sourceId: 'uba' },
  { id: 'schlafen', indoorTemp: 17, span: [16, 18], sourceId: 'uba' },
  { id: 'kueche', indoorTemp: 18, span: [18, 20], sourceId: 'uba' },
  { id: 'bad', indoorTemp: 22, span: [22, 24], sourceId: 'enbw' },
  { id: 'flur', indoorTemp: 16, span: [15, 18], sourceId: 'enbw' }
] as const

export function roomUseById(id: RoomUseKey): RoomUse {
  const treffer = roomUses.find((nutzung) => nutzung.id === id)
  // Der erste Eintrag ist der Auffangwert; `roomUses` ist nie leer.
  return treffer ?? roomUses[0]!
}

/**
 * Luftwechselraten als **Richtwerte** (keine Nachweiswerte). Jeder Eintrag trägt `guideline: true`
 * und seine Quelle; die Oberfläche kennzeichnet die Richtwerte sichtbar.
 */
export interface AirChangePreset {
  readonly id: string
  readonly airChange: number
  readonly span: readonly [number, number]
  readonly sourceId: string
  readonly guideline: true
}

export const airChangePresets: readonly AirChangePreset[] = [
  { id: 'nennlueftung', airChange: 0.5, span: [0.5, 0.5], sourceId: 'duesseldorf', guideline: true },
  { id: 'infiltration_undicht', airChange: 0.3, span: [0.2, 0.3], sourceId: 'duesseldorf', guideline: true },
  { id: 'infiltration_dicht', airChange: 0.15, span: [0.1, 0.15], sourceId: 'duesseldorf', guideline: true },
  { id: 'energiebilanz_undicht', airChange: 0.7, span: [0.7, 0.7], sourceId: 'iwu', guideline: true },
  { id: 'energiebilanz_dicht', airChange: 0.6, span: [0.6, 0.6], sourceId: 'iwu', guideline: true },
  { id: 'hygiene_minimum', airChange: 0.4, span: [0.3, 0.4], sourceId: 'iwu', guideline: true }
] as const

/**
 * Stoffdaten der Luft (Quellenlage d.2, Empfehlung für den Überschlag).
 * ρ = 1,2 kg/m³ ist der in der Baupraxis übliche gerundete Ansatz (Bereich 1,19–1,29 je
 * Bezugstemperatur, siehe Widerspruch 1 der Quellenlage); c_p = 1005 J/(kg·K) die isobare
 * Näherung. Das Produkt ρ·c_p ≈ 1206 J/(m³·K).
 */
export const AIR_DENSITY = 1.2
export const AIR_DENSITY_SOURCE = 'stoffdaten'
export const AIR_HEAT_CAPACITY = 1005
export const AIR_HEAT_CAPACITY_SOURCE = 'stoffdaten'

/**
 * Grenzen: **je Feld eine Grenze, und jede wird in `heatloadErrorKeys` abgefragt.**
 * Ein Eintrag ohne Abfrage sähe wie ein geprüfter Wert aus, prüft aber nichts.
 */
export const heatloadLimits = {
  roomsMax: 40,
  nameMax: 80,
  surfacesMax: 12,
  areaMin: 0.1,
  areaMax: 2000,
  uValueMin: 0.05,
  uValueMax: 6,
  indoorTempMin: 5,
  indoorTempMax: 30,
  airChangeMin: 0,
  airChangeMax: 5,
  heightMin: 1.5,
  heightMax: 6,
  outdoorTempMin: -30,
  outdoorTempMax: 20
} as const

export interface SurfaceInput {
  readonly id: string
  /** Der zuletzt gewählte U-Wert-Vorschlag (Kennung) oder '' für einen eigenen Wert. */
  readonly presetId: string
  readonly area: number
  readonly uValue: number
}

export interface RoomInput {
  readonly id: string
  readonly name: string
  readonly use: RoomUseKey
  readonly indoorTemp: number
  /** Grundfläche für das Luftvolumen; die Wärme übertragenden Flächen stehen in `surfaces`. */
  readonly floorArea: number
  readonly height: number
  readonly airChange: number
  readonly surfaces: readonly SurfaceInput[]
}

export interface HeatloadInput {
  /**
   * Außen-Auslegungstemperatur in °C. In der Quellenlage **nicht belegt** (orts-/projektabhängig)
   * und deshalb **ohne Vorbelegung**: `null` oder `NaN` heißt „nicht eingetragen".
   */
  readonly outdoorTemp: number | null
  readonly rooms: readonly RoomInput[]
}

/** Ein leeres Bauteilfeld. Die Kennung ist fortlaufend, damit die Oberfläche stabil bleibt. */
export function emptySurface(number: number): SurfaceInput {
  return { id: `flaeche-${number}`, presetId: '', area: Number.NaN, uValue: Number.NaN }
}

/** Ein leerer Raum mit sinnvollen, aber änderbaren Vorgaben (Außen-Auslegungstemp. gehört hier nicht hin). */
export function emptyRoom(number: number): RoomInput {
  const nutzung = roomUseById('wohnen')
  return {
    id: `raum-${number}`,
    name: '',
    use: nutzung.id,
    indoorTemp: nutzung.indoorTemp,
    floorArea: Number.NaN,
    height: 2.5,
    airChange: 0.5,
    surfaces: [emptySurface(1)]
  }
}

/** Grundfläche mal Höhe = Raumvolumen (m³) für den Lüftungsanteil. */
export function roomVolume(floorArea: number, height: number): number {
  return floorArea * height
}

/** Transmissionswärmestrom eines Bauteils: U · A · ΔT in Watt. */
export function transmissionLoss(uValue: number, area: number, deltaT: number): number {
  return uValue * area * deltaT
}

/**
 * Lüftungswärmestrom in Watt: ρ · c_p · n · V · ΔT / 3600.
 * Die 3600 wandeln die Energie je Stunde (n in h⁻¹) in eine Leistung um.
 */
export function ventilationLoss(airChange: number, volume: number, deltaT: number, density = AIR_DENSITY, heatCapacity = AIR_HEAT_CAPACITY): number {
  return (density * heatCapacity * airChange * volume * deltaT) / 3600
}

export interface SurfaceResult {
  readonly id: string
  readonly area: number
  readonly uValue: number
  readonly sourceId: string
  readonly loss: number
}

export interface RoomResult {
  readonly id: string
  readonly deltaT: number
  readonly volume: number
  readonly transmission: number
  readonly ventilation: number
  readonly total: number
  readonly surfaces: readonly SurfaceResult[]
}

export interface HeatloadResult {
  readonly rooms: readonly RoomResult[]
  readonly transmission: number
  readonly ventilation: number
  readonly total: number
}

/** Ergebnis eines Raums nachrechnen (keine Prüfung — die liegt in `heatloadErrorKeys`). */
export function roomResult(room: RoomInput, outdoorTemp: number): RoomResult {
  const deltaT = room.indoorTemp - outdoorTemp
  const volume = roomVolume(room.floorArea, room.height)
  const surfaces: SurfaceResult[] = room.surfaces.map((flaeche) => ({
    id: flaeche.id,
    area: flaeche.area,
    uValue: flaeche.uValue,
    sourceId: heatloadSourceOfSurface(flaeche),
    loss: transmissionLoss(flaeche.uValue, flaeche.area, deltaT)
  }))
  const transmission = surfaces.reduce((summe, flaeche) => summe + flaeche.loss, 0)
  const ventilation = ventilationLoss(room.airChange, volume, deltaT)
  return { id: room.id, deltaT, volume, transmission, ventilation, total: transmission + ventilation, surfaces }
}

/** Quelle der Zeile: der gewählte Vorschlag, sonst der eigene Wert (`custom`). */
export function heatloadSourceOfSurface(flaeche: SurfaceInput): string {
  const vorlage = uValuePresetById(flaeche.presetId)
  if (vorlage && vorlage.uValue === flaeche.uValue) return vorlage.sourceId
  return 'custom'
}

/** Gesamtergebnis über alle Räume (Summe je Raum und für das Gebäude). */
export function heatloadResult(input: HeatloadInput): HeatloadResult {
  const outdoor = input.outdoorTemp ?? Number.NaN
  const rooms = input.rooms.map((raum) => roomResult(raum, outdoor))
  const transmission = rooms.reduce((summe, raum) => summe + raum.transmission, 0)
  const ventilation = rooms.reduce((summe, raum) => summe + raum.ventilation, 0)
  return { rooms, transmission, ventilation, total: transmission + ventilation }
}

function istZahl(wert: number | null): wert is number {
  return typeof wert === 'number' && Number.isFinite(wert)
}

/**
 * Prüft den ganzen Entwurf. Gibt Übersetzungsschlüssel zurück; leer heißt „annehmbar".
 * **Je Feld eine Zeile in der Prüfung** — sonst sieht eine nicht abgefragte Grenze wie geprüft aus.
 */
export function heatloadErrorKeys(input: HeatloadInput): readonly string[] {
  const fehler: string[] = []

  // (1) Außen-Auslegungstemperatur — Pflichtfeld ohne Vorbelegung.
  if (!istZahl(input.outdoorTemp)) {
    fehler.push('tool.heatload.error.outdoorTempMissing')
  } else if (input.outdoorTemp < heatloadLimits.outdoorTempMin || input.outdoorTemp > heatloadLimits.outdoorTempMax) {
    fehler.push('tool.heatload.error.outdoorTempRange')
  }

  // (2) Räume.
  if (input.rooms.length === 0) fehler.push('tool.heatload.error.noRooms')
  if (input.rooms.length > heatloadLimits.roomsMax) fehler.push('tool.heatload.error.tooManyRooms')

  for (const raum of input.rooms) {
    const name = raum.name.trim()
    if (!name) fehler.push('tool.heatload.error.roomNameMissing')
    if (name.length > heatloadLimits.nameMax) fehler.push('tool.heatload.error.roomNameLong')

    // `!(x >= areaMin)` fängt auch NaN und 0 ab und fragt damit `areaMin` wirklich ab.
    if (!(raum.floorArea >= heatloadLimits.areaMin)) fehler.push('tool.heatload.error.floorAreaMissing')
    else if (raum.floorArea > heatloadLimits.areaMax) fehler.push('tool.heatload.error.floorAreaRange')

    if (!istZahl(raum.height) || raum.height < heatloadLimits.heightMin || raum.height > heatloadLimits.heightMax) {
      fehler.push('tool.heatload.error.heightRange')
    }
    if (!istZahl(raum.indoorTemp) || raum.indoorTemp < heatloadLimits.indoorTempMin || raum.indoorTemp > heatloadLimits.indoorTempMax) {
      fehler.push('tool.heatload.error.indoorTempRange')
    }
    if (!istZahl(raum.airChange) || raum.airChange < heatloadLimits.airChangeMin || raum.airChange > heatloadLimits.airChangeMax) {
      fehler.push('tool.heatload.error.airChangeRange')
    }

    if (raum.surfaces.length === 0) fehler.push('tool.heatload.error.noSurfaces')
    if (raum.surfaces.length > heatloadLimits.surfacesMax) fehler.push('tool.heatload.error.tooManySurfaces')

    for (const flaeche of raum.surfaces) {
      if (!(flaeche.area >= heatloadLimits.areaMin)) fehler.push('tool.heatload.error.surfaceAreaMissing')
      else if (flaeche.area > heatloadLimits.areaMax) fehler.push('tool.heatload.error.surfaceAreaRange')

      if (!istZahl(flaeche.uValue) || flaeche.uValue < heatloadLimits.uValueMin || flaeche.uValue > heatloadLimits.uValueMax) {
        fehler.push('tool.heatload.error.uValueRange')
      }
    }
  }

  return fehler
}

export interface HeatloadPlan {
  readonly ok: boolean
  readonly errors: readonly string[]
  readonly result: HeatloadResult | null
}

/** Prüfen und rechnen in einem Schritt: nur ein fehlerfreier Entwurf liefert ein Ergebnis. */
export function planHeatload(input: HeatloadInput): HeatloadPlan {
  const errors = heatloadErrorKeys(input)
  return { ok: errors.length === 0, errors, result: errors.length === 0 ? heatloadResult(input) : null }
}
