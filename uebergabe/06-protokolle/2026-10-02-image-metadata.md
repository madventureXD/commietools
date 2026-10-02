# Fortschrittsprotokoll: Werkzeug „Bild-Metadaten"

**Datum:** 2026-10-02  
**Status:** abgeschlossen

## Umfang

Erstes Werkzeug der geplanten Bild-Suite: Anzeige und verlustfreies Entfernen von Metadaten
aus JPEG-, PNG- und WebP-Dateien, vollständig auf dem Gerät. Umfasst Verarbeitungslogik,
Oberfläche, Übersetzungen, Manifest, Suite, Tests und Dokumentation.

## Ergebnisse

- Verarbeitungslogik in `packages/tools/src/image/metadata/metadata.ts`, ohne Laufzeitabhängigkeit.
  Gelesen werden IFD0, Exif-IFD und GPS-IFD aus der TIFF-Struktur hinter JPEG (APP1),
  PNG (eXIf) und WebP (EXIF); dazu PNG-Textblöcke.
- Entfernen arbeitet auf Containerebene: JPEG trennt sich von APP1 (EXIF/XMP), APP13 (IPTC),
  weiteren APP-Markierungen und Kommentaren, PNG von tEXt/iTXt/zTXt/eXIf/tIME, WebP von
  EXIF/XMP (mit Korrektur der RIFF-Größe und der VP8X-Merker). Die Bildpunkte werden
  byteweise übernommen, es findet keine Neuberechnung statt.
- APP0 (JFIF), APP14 (Adobe) und ICC-Farbprofile bleiben erhalten; Farbprofile lassen sich
  in den Einstellungen zusätzlich abwählen.
- Oberfläche als Vier-Schritt-Fluss (Datei, Einstellungen, Aktion, Ergebnis) mit
  Vorschaubild, Bereichsübersicht, gruppierten Angaben, Standortblock, Ergebnismeldung und
  Download. Alle Texte stammen aus dem Übersetzungskatalog.
- Neue Kategorie-Suite `image` mit dem Werkzeug `image-metadata`; Route `/tools/image-metadata`.
- Deutsch und Englisch vollständig, einschließlich übersetzter Aufzählungswerte für
  Ausrichtung, Programm, Messmethode, Blitz, Weißabgleich und Farbraum.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Tests bestanden | 22 | `npm run check`, Vitest (vorher 12) |
| Lizenzierte Pakete | 475 | `npm run licenses:check` |
| Vollständige Lizenztexte | 12 | `npm run licenses:check` |
| Neue Laufzeitabhängigkeiten | 0 | `package.json`, `package-lock.json` unverändert |
| Hauptbundle | 341,35 kB (103,91 kB komprimiert) | `npm run build` |
| Stylesheet | 13,67 kB (3,25 kB komprimiert) | `npm run build` |
| Einträge im Vorab-Cache | 8 (1.233,66 KiB) | `npm run build`, Angabe von vite-plugin-pwa |

## Belege außerhalb der Testreihe

- **Echte Kamera-Dateien** (Gegenprobe, weil Ersatzbilder aus eigener Hand zirkulär wären):
  Canon EOS 40D, Nikon COOLPIX P6000, Fujifilm FinePix E500. Gelesen wurden unter anderem
  Hersteller, Modell, Aufnahmezeitpunkt, Belichtungszeit, Blende, Empfindlichkeit, Brennweite
  und bei der Nikon-Datei die Position 43,467448 / 11,885127.
- **Echter Browser** (Edge headless über das DevTools-Protokoll, weil für das eingebaute
  Browserwerkzeug kein Chromium vorhanden ist): Datei über das Dateifeld ausgewählt,
  Metadaten angezeigt, Entfernen ausgelöst, Speicherverweis erzeugt. Die bereinigte Datei
  lud anschließend im selben Browser weiterhin als 640 × 480 Bild. Keine Konsolenfehler.
- **Byte-Vergleich** an einer 1,38 MB großen Wandbild-Datei: Der Dateiende-Bereich mit den
  Bilddaten war vor und nach dem Entfernen identisch; ein zweiter Durchlauf änderte nichts mehr.
- Aufgefallen und geprüft, **kein** Fehler: Die Nikon-Datei enthält eine Höhen-Referenz ohne
  Höhen-Wert, deshalb bleibt die Höhe leer. Bei einer selbst erzeugten Prüfdatei lagen die
  Offset-Angaben falsch; der Leser hat korrekt gelesen, was die Datei behauptete.

## Relevante Verweise

- Commit: `f87be44` – enthält Verarbeitungslogik, Oberfläche, Tests, README-Berichtigung,
  Standaktualisierung und diesen Vermerk
- Konzept: [`../03-konzepte/2026-10-02-bild-suite.md`](../03-konzepte/2026-10-02-bild-suite.md), Abschnitt „Umsetzungshinweis"
- Übergabe: [`../05-uebergaben/2026-10-02-image-metadata.md`](../05-uebergaben/2026-10-02-image-metadata.md)
- ADR: keiner. Die Entscheidung gegen eine Fremdbibliothek ist im Konzept begründet und
  betrifft nur ein Werkzeug.

## Folgemaßnahmen

- [ ] Prüfen, ob `image-metadata` auch TIFF und HEIC abdecken soll (nur mit Neuberechnung möglich).
- [ ] Barrierefreiheitsprüfung für Dateiauswahl und Ergebnisbereich automatisieren.
- [ ] Nächstes Werkzeug der Bild-Suite nach dem Konzept auswählen.
