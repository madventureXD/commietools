/**
 * Geometrie für die PDF-Schwärzung.
 *
 * **Gemessene Wahrheit (2026-10-07, `work/m7-003-rotation-sonde.mjs`):** MuPDF setzt
 * Redaktionsrechtecke im **angezeigten** Seitenraum — also in den Koordinaten, die der Betrachter
 * sieht, Seitenrotation eingerechnet. Auf einer um 90 Grad gedrehten Seite traf ein Rechteck im
 * unrotierten Raum den Text **nicht**; dasselbe Rechteck in Anzeigekoordinaten entfernte ihn.
 *
 * Daraus folgt für die Oberfläche: Ein Bereich wird in **Anzeigepunkten** geführt
 * (`viewWidth` × `viewHeight`). Es gibt keine Rotationsumkehr — die Koordinaten, die der Nutzer
 * im Bild aufzieht, sind genau die, die die Engine erwartet.
 */

export interface PdfPageGeometry {
  readonly pageNumber: number
  /** Rotation der Seite in Grad im Uhrzeigersinn (0, 90, 180, 270) — nur zur Information. */
  readonly rotation: number
  /** Unrotierte Seitenbox in PDF-Punkten (Rohmaß der Datei). */
  readonly width: number
  readonly height: number
  /** Angezeigte Maße — **der gültige Koordinatenraum für alle Bereiche**. */
  readonly viewWidth: number
  readonly viewHeight: number
}

/** Gültiger Bereich für Rechtecke: die angezeigten Maße der Seite. */
export function redactionBounds(geometry: PdfPageGeometry): { width: number; height: number } {
  return { width: geometry.viewWidth, height: geometry.viewHeight }
}
