# Aktueller Projektstand

**Stand:** 2026-10-03  
**Letzter geprüfter Meilenstein:** PDF-Suite M2, davor PDF-Suite M0/M1 (`a45f950`)

## Umgesetzt

- TypeScript/npm-Workspace-Grundstruktur
- React/Vite-Webanwendung und installierbare PWA
- responsives einheitliches UI mit Light/Dark Mode
- Local-/Offline-Kennzeichnung
- manifestbasierte Tools und Suiten
- hybride Internationalisierung mit Deutsch und Englisch
- QR-Code-Generator mit UTF-8-Unterstützung
- Bild-Metadaten: Anzeige und verlustfreies Entfernen von EXIF, XMP, IPTC und Kommentaren in JPEG, PNG und WebP, ohne Neuberechnung der Bildpunkte
- Bild skalieren: Skalieren, Zuschnitt, Drehen und Spiegeln mit hochwertiger Filterung im Web Worker; fester Ablauf Ausrichtung → Zuschnitt → Skalierung
- CommieTools-Logo- und Iconvarianten
- vollständige AGPL-3.0-only-Projektlizenz
- automatisch erzeugte und auf der Webseite abrufbare Lizenzdatenbank
- Lizenzprüfung als verpflichtender Bestandteil von Check und Build
- erzeugtes Werkzeugregister (`packages/tools/src/catalog/toolIndex.ts`) mit Symbol, Kurzbeschreibung und Suchbegriffen je Werkzeug und Sprache; Prüfung als Bestandteil von Check und Build
- deklarierte Dateifähigkeiten je Werkzeug im Manifest (`input`, `auxiliary`, `output`); Dateifelder, Formatlisten und Katalogkarten lesen daraus, nicht aus eigenen Kopien
- Katalogsuche über Suchbegriffe, Schlagwörter, Titel, Kurzbeschreibung und Beschreibung **aller** Sprachen sowie über deklarierte Dateitypen, Kategorie und Suite; Treffer in der eingestellten Sprache mit Begründung („gefunden über …"), offline und ohne unscharfe Suche
- gemeinsamer, UI-unabhängiger PDF-Kern für Prüfung, Seitenbereiche und Seitenoperationen
- PDF.js-Vorschau und `pdf-lib`-Verarbeitung als getrennt nachgeladene, offline zwischengespeicherte Engines
- PDF-Warnungen für Formulare, XFA, Annotationen und Signaturen sowie klare Ablehnung verschlüsselter oder beschädigter Dateien
- PDF-Suite M1 mit Zusammenführen, Teilen/Extrahieren sowie Sortieren, Drehen, Duplizieren und Löschen von Seiten
- Bilder zu PDF: JPEG/PNG-Reihenfolge, A4/Letter/Bildgröße, Ausrichtung, Rand und Einpassen/Beschneiden
- PDF zu Bildern: freie Seitenauswahl, PNG/JPEG, 72–300 DPI, JPEG-Qualität, Hintergrundfarbe und sequenzielle Ausgabe

## Derzeitige Tools

| Tool | ID | Suite | Ausführung | Dateien (deklariert) |
|---|---|---|---|---|
| Textstatistik | `text-statistics` | Text | lokal | keine (nur Information) |
| Groß-/Kleinschreibung | `case-converter` | Text | lokal | keine (nur Information) |
| JSON-Formatierer | `json-formatter` | Entwicklung | lokal | keine (nur Information) |
| QR-Code-Generator | `qr-code-generator` | Generatoren | lokal | Logo hinein (4 Typen), Bild heraus (4 Typen) |
| Bild-Metadaten | `image-metadata` | Bilder | lokal | 8 Typen hinein, 3 verlustfrei heraus |
| Bild skalieren | `image-resize` | Bilder | lokal | 3 Typen hinein und heraus |
| PDFs zusammenführen | `pdf-merge` | PDF | lokal | PDF hinein und heraus |
| PDF teilen | `pdf-split` | PDF | lokal | PDF hinein und mehrere PDFs heraus |
| PDF-Seiten organisieren | `pdf-organize` | PDF | lokal | PDF hinein und heraus |
| Bilder zu PDF | `images-to-pdf` | PDF | lokal | JPEG/PNG hinein, PDF heraus |
| PDF zu Bildern | `pdf-to-images` | PDF | lokal | PDF hinein, PNG/JPEG heraus |

## Derzeitige Suiten

- Text
- Entwicklung
- Generatoren
- Bilder (Bild-Metadaten, Bild skalieren)
- PDF (Zusammenführen, Teilen, Seiten organisieren, Bilder zu PDF, PDF zu Bildern)

## Qualität und Compliance

- Projekt und interne Pakete: `AGPL-3.0-only`
- Lizenzübersicht in der Webanwendung: `/licenses`
- erfasste externe Pakete: 496
- vollständige Lizenztexte: 13
- bewahrte originale Paketdokumente: 172
- letzter bekannter Teststand: 88 Tests bestanden
- Werkzeugregister: 11 Werkzeuge, 2 Sprachen, 11 Symbole, **776** Suchbegriffe und Schlagwörter, 37 deklarierte Dateitypen (`npm run catalog:check`)
- letzter bekannter Produktions-Build: bestanden; Hauptbundle 458,60 kB (138,56 kB komprimiert), PDF-Engines in getrennten nachgeladenen Chunks, Vorab-Cache mit 25 Einträgen (1.410,69 KiB)

Zahlen sind Momentaufnahmen. Nach Abhängigkeits-, Test- oder Tooländerungen müssen sie anhand der tatsächlichen Ausgabe aktualisiert werden.

## Noch nicht umgesetzt

- PDF-Suite M3 bis M7 (Platzierung, Formulare/Kommentare, Schutz/Kompression, OCR und digitale Signaturen)
- Backend, Konten und Synchronisierung
- Desktop- und Mobile-Shells
- öffentliches Quellcode-Repository und sichtbarer Source-Link für den späteren AGPL-Betrieb
- umfassende automatisierte Barrierefreiheitstests
