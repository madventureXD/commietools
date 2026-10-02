# Aktueller Projektstand

**Stand:** 2026-10-02  
**Letzter geprüfter Meilenstein:** Werkzeug „Bild-Metadaten" (`f87be44`), davor vollständiges Lizenzsystem (`8a39f66`)

## Umgesetzt

- TypeScript/npm-Workspace-Grundstruktur
- React/Vite-Webanwendung und installierbare PWA
- responsives einheitliches UI mit Light/Dark Mode
- Local-/Offline-Kennzeichnung
- manifestbasierte Tools und Suiten
- hybride Internationalisierung mit Deutsch und Englisch
- QR-Code-Generator mit UTF-8-Unterstützung
- Bild-Metadaten: Anzeige und verlustfreies Entfernen von EXIF, XMP, IPTC und Kommentaren in JPEG, PNG und WebP, ohne Neuberechnung der Bildpunkte
- CommieTools-Logo- und Iconvarianten
- vollständige AGPL-3.0-only-Projektlizenz
- automatisch erzeugte und auf der Webseite abrufbare Lizenzdatenbank
- Lizenzprüfung als verpflichtender Bestandteil von Check und Build

## Derzeitige Tools

| Tool | ID | Suite | Ausführung |
|---|---|---|---|
| Textstatistik | `text-statistics` | Text | lokal |
| Groß-/Kleinschreibung | `case-converter` | Text | lokal |
| JSON-Formatierer | `json-formatter` | Entwicklung | lokal |
| QR-Code-Generator | `qr-code-generator` | Generatoren | lokal |
| Bild-Metadaten | `image-metadata` | Bilder | lokal |

## Derzeitige Suiten

- Text
- Entwicklung
- Generatoren
- Bilder

## Qualität und Compliance

- Projekt und interne Pakete: `AGPL-3.0-only`
- Lizenzübersicht in der Webanwendung: `/licenses`
- erfasste externe Pakete: 475
- vollständige Lizenztexte: 12
- bewahrte originale Paketdokumente: 162
- letzter bekannter Teststand: 22 Tests bestanden
- letzter bekannter Produktions-Build: bestanden; Hauptbundle 341,35 kB (103,91 kB komprimiert), Stylesheet 13,67 kB (3,25 kB komprimiert), Vorab-Cache mit 8 Einträgen

Zahlen sind Momentaufnahmen. Nach Abhängigkeits-, Test- oder Tooländerungen müssen sie anhand der tatsächlichen Ausgabe aktualisiert werden.

## Noch nicht umgesetzt

- PDF-Suite
- Backend, Konten und Synchronisierung
- Desktop- und Mobile-Shells
- öffentliches Quellcode-Repository und sichtbarer Source-Link für den späteren AGPL-Betrieb
- umfassende automatisierte Barrierefreiheitstests
