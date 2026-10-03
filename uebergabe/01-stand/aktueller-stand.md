# Aktueller Projektstand

**Stand:** 2026-10-03  
**Letzter geprüfter Meilenstein:** PDF-Suite M4 (2026-10-03), davor PDF-Suite M3

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
- Icon-Generator: PNG-Satz von 16 bis 512 px, maskierbare Variante je Größe, `favicon.ico` mit selbst geschriebenem ICO-Container und kopierbarer `icons`-Eintrag für ein Web-App-Manifest
- Wasserzeichen: Text oder eigenes Logo, einzeln an neun Positionen oder als gedrehtes Kachelmuster über das Bild, mit Größe, Deckkraft, Rand- und Musterabstand
- Farbwerkzeuge: Umrechnung zwischen HEX, RGB, HSL und LAB, Pipette auf Bildern (Maus und Tastatur), Palette, WCAG-Kontrastprüfung sowie Simulation für Protanopie, Deuteranopie, Tritanopie und Achromatopsie
- CommieTools-Logo- und Iconvarianten
- vollständige AGPL-3.0-only-Projektlizenz
- automatisch erzeugte und auf der Webseite abrufbare Lizenzdatenbank
- Lizenzprüfung als verpflichtender Bestandteil von Check und Build
- öffentliches GitHub-Repository `madventureXD/commietools`; `main` löst automatische Cloudflare-Pages-Deployments aus
- Cloudflare-Pages-Bereitstellung aktiv unter `https://commietools.pages.dev`: SPA-Fallback, PWA-Cache-Regeln und Sicherheitsheader; Domainregistrierung bleibt bei Hetzner
- zweisprachige, dauerhaft im Footer erreichbare Impressumsseite mit Anbieteranschrift und E-Mail-Kontakt
- erzeugtes Werkzeugregister (`packages/tools/src/catalog/toolIndex.ts`) mit Symbol, Kurzbeschreibung und Suchbegriffen je Werkzeug und Sprache; Prüfung als Bestandteil von Check und Build
- deklarierte Dateifähigkeiten je Werkzeug im Manifest (`input`, `auxiliary`, `output`); Dateifelder, Formatlisten und Katalogkarten lesen daraus, nicht aus eigenen Kopien
- Katalogsuche über Suchbegriffe, Schlagwörter, Titel, Kurzbeschreibung und Beschreibung **aller** Sprachen sowie über deklarierte Dateitypen, Kategorie und Suite; Treffer in der eingestellten Sprache mit Begründung („gefunden über …"), offline und ohne unscharfe Suche
- gemeinsamer, UI-unabhängiger PDF-Kern für Prüfung, Seitenbereiche und Seitenoperationen
- PDF.js-Vorschau und `pdf-lib`-Verarbeitung als getrennt nachgeladene, offline zwischengespeicherte Engines
- PDF-Warnungen für Formulare, XFA, Annotationen und Signaturen sowie klare Ablehnung verschlüsselter oder beschädigter Dateien
- PDF-Suite M1 mit Zusammenführen, Teilen/Extrahieren sowie Sortieren, Drehen, Duplizieren und Löschen von Seiten
- Bilder zu PDF: JPEG/PNG-Reihenfolge, A4/Letter/Bildgröße, Ausrichtung, Rand und Einpassen/Beschneiden
- PDF zu Bildern: freie Seitenauswahl, PNG/JPEG, 72–300 DPI, JPEG-Qualität, Hintergrundfarbe und sequenzielle Ausgabe
- gemeinsame PDF-Platzierungsengine mit neun Ankerpositionen, CropBox-Versatz und rotationsgerechter sichtbarer Platzierung
- PDF-Wasserzeichen: Unicode-Text, Seitenauswahl, Einzel-/Kachelmodus, Position, Farbe, Größe, Winkel, Deckkraft, Rand und Abstand
- PDF-Seitenzahlen: Unicode-Präfix/-Suffix, Seitenauswahl, unabhängiger Startwert, Format, Position, Größe, Farbe, Deckkraft und Rand
- PDF sichtbar unterschreiben: Zeichnen per Maus/Stift/Touch, Namenssignatur oder PNG/JPEG-Import; Seite, Position, Breite, Deckkraft, Drehung und optionale Datumszeile; klar von Zertifikatssignaturen abgegrenzt
- PDF-Formular ausfüllen: lokale AcroForm-Erkennung und Bearbeitung von Text, Checkboxen, Optionsgruppen und Auswahllisten, optionales dauerhaftes Einbetten sowie klare XFA-Grenze
- PDF kommentieren und markieren: echte Notiz-, Text-, Markierungs-, Form-, Linien- und per Maus/Stift/Touch gezeichnete Ink-Annotationen einschließlich Löschen
- MuPDF.js als nur auf M4-Routen nachgeladene Open-Source-Spezialengine; großes WASM-Modul im PDF-Laufzeitcache statt im PWA-Vorabcache

## Derzeitige Tools

| Tool | ID | Suite | Ausführung | Dateien (deklariert) |
|---|---|---|---|---|
| Textstatistik | `text-statistics` | Text | lokal | keine (nur Information) |
| Groß-/Kleinschreibung | `case-converter` | Text | lokal | keine (nur Information) |
| JSON-Formatierer | `json-formatter` | Entwicklung | lokal | keine (nur Information) |
| QR-Code-Generator | `qr-code-generator` | Generatoren | lokal | Logo hinein (4 Typen), Bild heraus (4 Typen) |
| Bild-Metadaten | `image-metadata` | Bilder | lokal | 8 Typen hinein, 3 verlustfrei heraus |
| Bild skalieren | `image-resize` | Bilder | lokal | 3 Typen hinein und heraus |
| Icon-Generator | `icon-generator` | Bilder | lokal | PNG/JPEG/WebP hinein, PNG und ICO heraus |
| Wasserzeichen | `image-watermark` | Bilder | lokal | JPEG/PNG/WebP hinein und heraus; Logo als Nebenrolle |
| Farbwerkzeuge | `color-tools` | Bilder | lokal | JPEG/PNG/WebP hinein (nur Information) |
| PDFs zusammenführen | `pdf-merge` | PDF | lokal | PDF hinein und heraus |
| PDF teilen | `pdf-split` | PDF | lokal | PDF hinein und mehrere PDFs heraus |
| PDF-Seiten organisieren | `pdf-organize` | PDF | lokal | PDF hinein und heraus |
| Bilder zu PDF | `images-to-pdf` | PDF | lokal | JPEG/PNG hinein, PDF heraus |
| PDF zu Bildern | `pdf-to-images` | PDF | lokal | PDF hinein, PNG/JPEG heraus |
| PDF-Wasserzeichen | `pdf-watermark` | PDF | lokal | PDF hinein und heraus |
| PDF-Seitenzahlen | `pdf-page-numbers` | PDF | lokal | PDF hinein und heraus |
| PDF sichtbar unterschreiben | `pdf-visible-signature` | PDF | lokal | PDF sowie PNG/JPEG-Unterschrift hinein, PDF heraus |
| PDF-Formular ausfüllen | `pdf-form-fill` | PDF | lokal | PDF hinein und heraus |
| PDF kommentieren und markieren | `pdf-annotate` | PDF | lokal | PDF hinein und heraus |

## Derzeitige Suiten

- Text
- Entwicklung
- Generatoren
- Bilder (Bild-Metadaten, Bild skalieren, Icon-Generator, Wasserzeichen, Farbwerkzeuge)
- PDF (Zusammenführen, Teilen, Seiten organisieren, Bilder zu PDF, PDF zu Bildern, Wasserzeichen, Seitenzahlen, sichtbar unterschreiben, Formular ausfüllen, kommentieren und markieren)

## Qualität und Compliance

- Projekt und interne Pakete: `AGPL-3.0-only`
- Lizenzübersicht in der Webanwendung: `/licenses`
- erfasste externe Pakete: 497
- vollständige Lizenztexte: 14
- bewahrte originale Paketdokumente: 171
- letzter bekannter Teststand: 142 Tests bestanden
- Werkzeugregister: 19 Werkzeuge, 2 Sprachen, 19 Symbole, 66 deklarierte Dateitypen (`npm run catalog:check`)
- letzter bekannter Produktions-Build: bestanden; Hauptbundle 546,12 kB (160,37 kB komprimiert, **Warnung über 500 kB**), M4-Oberfläche 13,10 kB und MuPDF-JavaScript 88,90 kB getrennt nachgeladen; MuPDF-WASM 10,41 MB im PDF-Laufzeitcache, Vorab-Cache mit 36 Einträgen

Zahlen sind Momentaufnahmen. Nach Abhängigkeits-, Test- oder Tooländerungen müssen sie anhand der tatsächlichen Ausgabe aktualisiert werden.

## Noch nicht umgesetzt

- PDF-Suite M5 bis M7 (Schutz/Kompression, OCR und digitale Signaturen)
- Backend, Konten und Synchronisierung
- Desktop- und Mobile-Shells
- sichtbarer Source-Link in der Weboberfläche
- Abschluss der DNS-Propagation zu Cloudflare und Zuordnung von `commietools.org` sowie `www.commietools.org` zum Pages-Projekt
- umfassende automatisierte Barrierefreiheitstests
