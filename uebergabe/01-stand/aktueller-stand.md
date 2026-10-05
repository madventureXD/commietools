# Aktueller Projektstand

**Stand:** 2026-10-05
**Letzter geprüfter Meilenstein:** Sammelrelease mit 41 Werkzeugen, vollständiger Rechner-Suite, PDF-Suite M0–M9 und sprachgetrennten Suchpaketen auf `main` veröffentlicht (`95e1b2f`, 2026-10-04); automatische Cloudflare-Bereitstellung und Online-Nachkontrolle sind als nächster Schritt vorgesehen.

**Zusatz 2026-10-05 (Faber):** Suite „Handwerk" mit **Welle A und Welle B vollständig** — acht
Werkzeuge (Beton, Dach, Metallgewicht, Holzfeuchte, Fliesen, Farbe, Trockenbau, Bodenbelag),
Register **52 Werkzeuge**, 426 Tests in 28 Dateien, Startlast 146.867 B gzip von 204.800. Die
Sprachpaket-Aufteilung vom 2026-10-05 hatte zwölf Werkzeugflächen sichtbar beschädigt (Kurztext
stand als Schlüsselname in der Seite); repariert, mit Wächtertest und erweiterter
Funktionsprüfung. Entscheidung zur Textsumme: ADR 0011. Alles lokal, **nicht gepusht** —
Einzelheiten in `05-uebergaben/2026-10-05-welle-b-handwerkerwerkzeuge.md`.
**Zusatz 2026-10-05 (Faber), Welle C:** Suite „Handwerk" **vollständig** — die beiden
verbliebenen Werkzeuge der Lösungsklasse a sind gebaut: **Pflaster und Erdarbeiten** (`paving`) und
**Reifen und Drehmoment** (`tires`). Die Suite umfasst damit **zehn Werkzeuge**, das Register
**54 Werkzeuge**, **440 Tests in 30 Dateien**, Startlast 146.993 B gzip von 204.800. Beim
Pflasterwerkzeug rechnet das Werkzeug im Rastermaß (Stein plus Fuge), beim Reifenwerkzeug wird kein
Anzugsmoment vorgeschlagen — nur Einheiten und Toleranzbereich. Alles lokal, **nicht gepusht**;
Einzelheiten in `05-uebergaben/2026-10-05-welle-c-handwerkerwerkzeuge.md` und
`06-protokolle/2026-10-05-welle-c-gesamtbericht.md`.
**Lokal fertiggestellt, noch nicht veröffentlicht:** Desktop-Auskoppeln M0–M7 (Werkzeuge laufen in
einem eigenen Fenster); die elf zugehörigen Commits liegen lokal vor `origin/main`.

## Umgesetzt

- TypeScript/npm-Workspace-Grundstruktur
- React/Vite-Webanwendung und installierbare PWA
- responsives einheitliches UI mit Light/Dark Mode
- Local-/Offline-Kennzeichnung
- manifestbasierte Tools und Suiten
- hybride Internationalisierung mit Deutsch, Englisch und einem veröffentlichten spanischen Testpaket; Werkzeug- und Suchtexte werden je Sprache nachgeladen
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
- Produktivdomains `https://commietools.org` und `https://www.commietools.org` im Pages-Projekt aktiv; beide mit Cloudflare-SSL
- geprüfter Stand mit 41 Werkzeugen über `main` veröffentlicht; die Produktivkontrolle des Sammelreleases steht noch aus
- zweisprachige, dauerhaft im Footer erreichbare Impressumsseite mit Anbieteranschrift und E-Mail-Kontakt
- erzeugtes Werkzeugregister (`packages/tools/src/catalog/toolIndex.ts`) mit Symbol, Kurzbeschreibung und Suchbegriffen je Werkzeug und Sprache; Prüfung als Bestandteil von Check und Build
- deklarierte Dateifähigkeiten je Werkzeug im Manifest (`input`, `auxiliary`, `output`); Dateifelder, Formatlisten und Katalogkarten lesen daraus, nicht aus eigenen Kopien
- einheitliches lokales Speichern für alle 17 dateierzeugenden Werkzeuge: editierbarer Dateiname,
  nativer Speichern-unter-Dialog in unterstützenden Browsern und transparenter Download-Fallback;
  Mehrfachausgaben bieten diese Steuerung für jede einzelne Datei
- Katalogsuche über Suchbegriffe, Schlagwörter, Titel, Kurzbeschreibung und Beschreibung der **gewählten Sprache plus Englisch** sowie über deklarierte Dateitypen, Kategorie und Suite; Treffer in der eingestellten Sprache mit Begründung („gefunden über …"), offline und ohne unscharfe Suche
- globale aufklappbare Werkzeugnavigation auf jeder Route: Desktop-Drawer und mobiles Vollbreiten-Sheet mit Kategoriensicht, A–Z, lokaler Suche, Favoriten und zehn zuletzt verwendeten Werkzeugen; keine Telemetrie und kein Vorabladen optionaler Toolmodule
- Werkzeuge in ein eigenes Fenster auskoppelbar (`@pip-it-up/react`, MIT-Ausnahme nach ADR 0007/0008): der Rahmen sitzt zentral in der Werkzeugseite, das Werkzeug wandert als **eine** Instanz per Portal in das zweite Fenster und kommt unverändert zurück; der Knopf erscheint nur bei belegter Fähigkeit zur Laufzeit (Safari und mobil: kein Knopf); Zielgröße **gemessen** statt im Katalog deklariert, mit Größen-Hilfe im Fenster; Farbschema wird mitgeführt; belegt auf allen 41 Werkzeug-Routen (M0–M7, `05-uebergaben/2026-10-04-desktop-auskoppeln-m3-m5.md`); Grenzen und Regeln in `docs/ui-system.md`
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
- PDF schützen und entsperren: AES-256, getrennte Öffnungs-/Besitzerpasswörter, verständliche Berechtigungen, falsches-Passwort-Schutz und rein lokale Verarbeitung
- PDF komprimieren: verlustfreie Strukturkompression sowie zwei klar gekennzeichnete optionale Bildstufen mit transparentem Größenvergleich
- eigenständiger PDF-Viewer mit Miniaturen, Seitennavigation, Zoom, Drehung und lokaler Volltextsuche
- PDF-Text & OCR mit Seitenauswahl, vorhandener Textebene, automatischem OCR-Fallback, Deutsch/Englisch/Spanisch, Fortschritt, Abbruch und TXT-Ausgabe; Tesseract.js und Sprachmodell werden erst nach ausdrücklicher Zustimmung geladen
- PDF mit Zertifikat signieren: lokale PAdES-B-B-Signatur mit PKCS#12/PFX und unmittelbar anschließender Eigenprüfung; Schlüssel und Passwort verlassen den Browser nicht
- PDF-Signaturen überprüfen: mathematische CMS-Prüfung, vollständige ByteRange-Abdeckung und Erkennung nachträglicher Änderungen; Vertrauensstatus wird ohne Trust Store ausdrücklich nicht behauptet
- PDF-Metadaten: Standard-Dokumentinfos und XMP-Eintrag lokal anzeigen und bereinigen, mit ausdrücklicher Grenze zur forensischen Anonymisierung
- PDF-Seiten beschneiden: CropBox ausgewählter Seiten mit validierten Rändern ändern; ausgeblendete Inhalte werden nicht als sicher gelöscht ausgegeben
- PDF reparieren und prüfen: Struktur mit QPDF normalisieren und das Ergebnis anschließend erneut auf Lesbarkeit und Seitenzahl prüfen
- PDF-Anhänge: eingebettete Dateien lokal auflisten, extrahieren, ergänzen und entfernen
- PDFs vergleichen: Seitenzahl, Seitengröße, Drehung und extrahierbaren Text seitenweise vergleichen
- PDF/A-Vorcheck: lokale Erkennung der PDF/A-Kennung, XMP, Ausgabeprofile, Verschlüsselung, JavaScript und eingebetteten Dateien; ausdrücklich keine Konformitätsaussage oder Konvertierung
- PDF sicher schwärzen: ausgewählte Rechtecke werden mit der offiziellen MuPDF-Redaktionsfunktion destruktiv entfernt, schwarz überdeckt und als neue Datei gespeichert
- `pdf_signer` 0.3.2 als vendorte und nur auf M7-Routen nachgeladene Rust-WASM-Engine; BER-Kompatibilität und revisionsübergreifende Signatursuche sind lokal gehärtet, Prüfsumme, Herkunft und GPL-3.0-or-later-Lizenz registriert
- QPDF 12.2.0 als getrennt nachgeladene Open-Source-WASM-Engine; Binärartefakt mit SHA-256, Upstream-Komponenten, festen Commits und vollständigen Lizenzen registriert
- datensparsame Ladegrenzen: Startseite und Fremdwerkzeuge laden keine PDF-Engine; PDF-Routen, Worker und WASM werden erst bei Nutzung übertragen und nicht vorab offline gespeichert
- automatische Startlastprüfung mit 200-KiB-Gzip-Warnschwelle; Größenüberschreitungen warnen, Architekturverstöße wie statisch erreichbare PDF- oder Rechen-Engines brechen den Prüflauf weiterhin ab
- Rechner (Suite „Rechnen", Welle 1): kuratierter mathjs-Rechenkern in eigenem dynamisch geladenen Chunk (94,3 KiB gzip), exakte Zahlenmodelle (`BigNumber` 64 Stellen, `Fraction`), Fehler als übersetzbare Codes, Verlauf als Ringpuffer, benannte Variablen, „Formel und Quelle"
- Rechner (Suite „Rechnen", Welle 2 abgenommen): vier Rechnerarten in der Oberfläche — Standard und Brüche als Zahlenmodell, wissenschaftlich mit Winkelmodus (Bogenmaß, Grad, Gon) und 32 Tasten, Programmierer mit Anzeige-Basis, Wortbreite 8/16/32/64 und Zweierkomplement samt Darstellungs-Karte, RPN mit Token-Eingabe, Stapeltasten, **live sichtbarem Stapel und Rechenweg** je Schritt; Funktionsliste mit Aufruftest je Funktion und belegter Fehlschlagprobe; Rechenkern 102.436 B gzip
- *Zusatz 2026-10-04: Die vier Rechnerarten stehen seit der Aufteilung (ADR 0009) nicht mehr in **einem** Werkzeug, sondern als **vier Werkzeuge** — Rechner, wissenschaftlicher Rechner, Programmiererrechner und RPN-Rechner — mit einem gemeinsamen Rahmen (`apps/web/src/tools/calculator-frame.tsx`), je einem eigenen Tastenfeld, je einem eigenen Verlauf und ohne Rechenart-Umschalter; der Rechenkern bleibt geteilt. Der Eintrag oben bleibt als Stand der Welle 2 stehen. Messwerte und Belege: `05-uebergaben/2026-10-04-rechner-vier-werkzeuge.md`.*
- Kaufmännisch (Suite „Rechnen", Welle 3): Prozent in drei Richtungen, Rabatt, Aufschlag, Marge **und** Aufschlag gemeinsam mit klarer Bezugsgröße, Umsatzsteuer raus und rein, Skonto, Dreisatz, Zinseszins und Tilgungsplan; rechnet ohne neue Abhängigkeit in `BigInt` cent-genau, Plan summiert sich exakt zum Darlehen; Formeln, Annahmen und Quellen in drei Sprachen
- Umrechnen (Suite „Rechnen", Welle 4): Einheiten in zwölf Größen, Winkel, Zahlensysteme 2–36 in `BigInt`, Zollbrüche und 18 Kalender; Umrechnungsfaktoren werden zur Laufzeit aus der Einheitenbibliothek **gemessen** statt abgeschrieben; Kalender vorwärts über `Intl`, Rückweg über `Temporal` mit `monthCode`
- Zeit und Datum (Suite „Rechnen", Welle 4): Datumsabstand, Verschieben über Monats- und Jahresgrenzen, Arbeitstage, Kalenderwoche nach ISO 8601, Fristen nach BGB §§ 187/188/193 und Zeitdauern für den Stundenzettel
- Gleichungslöser, Statistik und Funktionsplotter (Suite „Rechnen", Welle 5 abgenommen): lineare, quadratische und kubische Gleichungen mit sechsstufigem Lösungsweg (Normieren, Substitution, reduzierte Form, Diskriminante, Cardano-Fall, Probe) und Scheitelpunkt; Kennwerte mit Varianz und Standardabweichung **in beiden Bezugsarten**, Quartilen nach linearer Interpolation, Ausreißergrenzen, Regression mit Korrelation und Bestimmtheitsmaß; Plotter für mehrere Funktionen mit Wertetabelle und berechneten Nullstellen. **Keine neue Engine:** `function-plot` trägt wegen `BSL-1.0` einer mitgezogenen Abhängigkeit nicht (in der Lizenzpolitik nicht geprüft), deshalb ein eigener Zeichner, der SVG-Geometrie aus dem vorhandenen Rechenkern erzeugt; die gemessenen 3 Kurvenzüge für x²−4 und 1/x zeigen die Asttrennung an Polstellen, die Polstelle wird nicht als Nullstelle gemeldet
- `@js-temporal/polyfill` 0.5.1 als **nur nach Feature-Abfrage** nachgeladene Engine; eigener Chunk, vom Vorabcache ausgenommen und im Laufzeitcache (gemessen 154 kB roh)
- Geometrie (Suite „Rechnen", Welle 3): 16 Formen und Körper von Rechteck bis Kugel; jede Ergebniszeile zeigt ihre Formel im Klartext; Formeln und Annahmen in drei Sprachen, Werte gegen unabhängige Nachrechnung geprüft
- Aufmaß (Suite „Rechnen", Welle 6 abgenommen — **die Suite ist damit vollständig**): zwei getrennte Ebenen — Aufmaßzeile (Maßkette oder Formel → Menge) und Position (Menge × Einzelpreis → Betrag, Menge wahlweise aus einer Aufmaßzeile, dann bleibt der Rechenweg am Blatt). Abschnitte mit Zwischensummen, Mengensummen **je Einheit** und nie über Einheiten hinweg, Ausgabe als CSV, PDF oder Text (die PDF-Engine wird erst beim Auslösen geladen). Eigener Speicherbereich `aufmass.sheet.v1`, bewusst getrennt vom Rechner-Verlauf. **Keine neue Abhängigkeit:** eigener Vorrangparser in `BigInt` statt mathjs in der Fachlogik

- Rechner-Genauigkeitsampel (Suite „Rechnen"): Der Rechenkern gibt neben der 14-stelligen Anzeige den **vollen Wert** (64 Stellen) getrennt aus; daran entscheidet die Ampel in der Anzeigezeile, ob das Gezeigte der ganze Wert ist (grün `=`) oder gerundet wurde (rot `≈`). Die Erklärung öffnet per Zeigen, Ansteuern und Tippen und liegt unter 640 px als Blatt am unteren Rand. Kann das Bruch-Modell eine Rechnung nicht führen (Wurzeln, Winkelfunktionen), rechnet der Rechner **einmalig und sichtbar** im Dezimal-Modell; die Einstellung bleibt. Keine neue Abhängigkeit, keine neue Farbmarke (ADR 0006). Die Anzeigefläche hat eine **feste Höhe**, damit das Tastenfeld beim Rechnen nicht wandert; das Ergebnis steht gesetzt oben, die rohe Eingabezeile darunter
- Aufmaß (Suite „Rechnen", Welle 6 abgenommen — **die Suite ist damit vollständig**):

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
| PDF schützen und entsperren | `pdf-security` | PDF | lokal | PDF hinein und heraus |
| PDF komprimieren | `pdf-compress` | PDF | lokal | PDF hinein und heraus |
| PDF-Viewer | `pdf-viewer` | PDF | lokal | PDF hinein (nur Information) |
| PDF-Text & OCR | `pdf-text-ocr` | PDF | lokal | PDF hinein, Text heraus |
| PDF mit Zertifikat signieren | `pdf-certificate-sign` | PDF | lokal | PDF und PKCS#12/PFX hinein, PDF heraus |
| PDF-Signaturen überprüfen | `pdf-signature-verify` | PDF | lokal | PDF hinein (nur Information) |
| PDF-Metadaten | `pdf-metadata` | PDF | lokal | PDF hinein und heraus |
| PDF-Seiten beschneiden | `pdf-crop` | PDF | lokal | PDF hinein und heraus |
| PDF reparieren und prüfen | `pdf-repair` | PDF | lokal | PDF hinein und heraus |
| PDF-Anhänge | `pdf-attachments` | PDF | lokal | PDF und Anhänge hinein, PDF und Anhänge heraus |
| PDFs vergleichen | `pdf-compare` | PDF | lokal | zwei PDFs hinein (nur Information) |
| PDF/A-Vorcheck | `pdf-a-preflight` | PDF | lokal | PDF hinein (nur Information) |
| PDF sicher schwärzen | `pdf-redact` | PDF | lokal | PDF hinein und heraus |
| Rechner | `calculator` | Rechnen | lokal | keine (nur Information) |
| Kaufmännisch | `commercial` | Rechnen | lokal | keine (nur Information) |
| Geometrie | `geometry` | Rechnen | lokal | keine (nur Information) |
| Umrechnen | `convert` | Rechnen | lokal | keine (nur Information) |
| Funktionsplotter | `plotter` | Rechnen | lokal | keine (nur Information) |
| Statistik | `statistics` | Rechnen | lokal | keine (nur Information) |
| Gleichungslöser | `equations` | Rechnen | lokal | keine (nur Information) |
| Zeit und Datum | `datetime` | Rechnen | lokal | keine (nur Information) |
| Aufmaß | `aufmass` | Rechnen | lokal | CSV, PDF und Text heraus |
| Beton, Mörtel und Estrich | `concrete` | Handwerk | lokal | keine (nur Information) |
| Dach | `roof` | Handwerk | lokal | keine (nur Information) |
| Metallgewicht | `metal-weight` | Handwerk | lokal | keine (nur Information) |
| Holzfeuchte und Holzgewicht | `wood` | Handwerk | lokal | keine (nur Information) |
| Fliesen, Kleber und Fugenmörtel | `tiles` | Handwerk | lokal | keine (nur Information) |
| Farbe, Tapeten und Beschichtung | `paint` | Handwerk | lokal | keine (nur Information) |
| Trockenbau | `drywall` | Handwerk | lokal | keine (nur Information) |
| Parkett, Laminat und Bodenbelag | `flooring` | Handwerk | lokal | keine (nur Information) |
| Pflaster und Erdarbeiten | `paving` | Handwerk | lokal | keine (nur Information) |
| Reifen und Drehmoment | `tires` | Handwerk | lokal | keine (nur Information) |

## Derzeitige Suiten

- Text
- Entwicklung
- Generatoren
- Bilder (Bild-Metadaten, Bild skalieren, Icon-Generator, Wasserzeichen, Farbwerkzeuge)
- Rechnen (Rechner, Umrechnen, Kaufmännisch, Zeit und Datum, Funktionsplotter, Statistik, Gleichungslöser, Geometrie, Aufmaß)
- Handwerk (Beton/Mörtel/Estrich, Dach, Metallgewicht, Holzfeuchte und Holzgewicht) — Welle A der Handwerkerwerkzeuge, abgenommen am 2026-10-04
  *Zusatz 2026-10-05: um die Welle B erweitert — Fliesen/Kleber/Fugenmörtel, Farbe/Tapeten/Beschichtung, Trockenbau, Parkett/Laminat/Bodenbelag. Die Suite umfasst damit **acht Werkzeuge**.*
  *Zusatz 2026-10-05 (Welle C): um die beiden letzten Werkzeuge der Klasse a erweitert — Pflaster/Erdarbeiten und Reifen/Drehmoment. Die Suite umfasst damit **zehn Werkzeuge** und ist nach dem Konzept vollständig.*
- PDF (Viewer, Text/OCR, Zertifikatssignaturen prüfen und erstellen, Zusammenführen, Teilen, Seiten organisieren, Bilder zu PDF, PDF zu Bildern, Wasserzeichen, Seitenzahlen, sichtbar unterschreiben, Formular ausfüllen, kommentieren und markieren, schützen/entsperren, komprimieren, Metadaten, Beschneiden, Reparatur, Anhänge, Vergleich, PDF/A-Vorcheck und sichere Schwärzung)

## Qualität und Compliance

- Projekt und interne Pakete: `AGPL-3.0-only`
- Lizenzübersicht in der Webanwendung: `/licenses`
- erfasste externe Pakete: 524
- vollständige Lizenztexte: 16
- bewahrte originale Paketdokumente: 189
- eingebettete Binärartefakte: 2 registrierte WASM-Artefakte (QPDF und PDF Signer)
- letzter bekannter Teststand: 381 Webtests in 23 Dateien bestanden (`npm run check`, gemessen 2026-10-05); Rust-Tests in diesem Lauf nicht neu gemessen — der zuletzt bekannte Stand bleibt 50
  *Zusatz 2026-10-05 (Welle B): **426 Webtests in 28 Dateien** bestanden (`npm run check`); Rust-Tests unverändert nicht neu gemessen.*
  *Zusatz 2026-10-05 (Welle C): **440 Webtests in 30 Dateien** bestanden (`npm run check`), `lint` und `build` grün; Rust-Tests unverändert nicht neu gemessen.*
- Werkzeugregister: 48 Werkzeuge, 3 Sprachen, 48 Symbole, 3.164 Suchbegriffe, 92 deklarierte Dateitypen (`npm run catalog:generate`, gemessen 2026-10-05); Spanisch wird als noch gegenzulesendes Testpaket mitausgeliefert
  *Zusatz 2026-10-05 (Welle B): **52 Werkzeuge, 52 Symbole, 3.464 Suchbegriffe**, 92 Dateitypen (`npm run catalog:generate`); Startlast 146.867 B gzip von 204.800. Die Summenschwelle der Werkzeugtexte wird seit ADR 0011 je Paket gemessen (850 B × 53 Pakete); Deutsch liegt bei 41.309 B, Englisch 37.278 B, Spanisch 40.626 B, Last je Route unverändert 5.199 B von 30.720.*
  *Zusatz 2026-10-05 (Welle C): **54 Werkzeuge, 54 Symbole, 3.636 Suchbegriffe**, 92 Dateitypen; Startlast **146.993 B gzip** von 204.800. Textsumme je Paket (850 B × 55 Pakete = 46.750 B): Deutsch 44.366, Englisch 40.121, Spanisch 43.627; Last je Route unverändert 5.199 B (de) / 4.685 B (en) / 5.207 B (es) von 30.720.*
- Sprachpakete: **Werkzeugtexte liegen je Werkzeug und je Sprache** und werden erst auf dessen
  Route geholt (2026-10-05, ADR 0010); die Startseite lädt nur Oberflächentexte und das Suchpaket.
  Titel, Beschreibung, Kurztext und Suchbegriffe stehen **nur** im Suchpaket — Karten, Schublade,
  Suiten-Seite **und die Werkzeugkopfzeile** lesen sie von dort. Je Sprache ein gemeinsames Paket
  (`common.ts`, Rahmen- und Bereichstexte) plus ein Paket je Werkzeug; die Verweiskarte liegt in
  einer eigenen Datei außerhalb des Startbündels. Netzbeleg mit frischem Profil: Startseite
  171.986 B gzip in 7 Dateien **ohne** Werkzeugtexte, Rechnerroute mit `tools-de-common` +
  `tools-de-calculator` und ohne fremdes Werkzeug (`07-pruefung/hebel2/beleg.txt`)
- Produktions-Build: bestanden. **Veröffentlicht** (Sammelrelease, ohne Auskoppeln): 136.967 Byte
  Startcode komprimiert. **Aktueller Arbeitsstand** (mit Auskoppeln, Welle A der
  Handwerkerwerkzeuge, vier Rechnern und der Sprachpaket-Aufteilung, noch nicht gepusht):
  **146.408 Byte** von 204.800 (Reserve rund 58 kB), gemessen 2026-10-05. Sprachgetrennte Such- und
  Werkzeugtextpakete mit verzögertem Laden, ohne statisch erreichbare PDF- oder Rechen-Engine;
  PDF-/OCR-/Signaturrouten, Worker und WASM sind vom Vorab-Cache ausgeschlossen; nachgeladener
  Rechenkern 103.708 Byte gzip, Katalogbasis 1.212 Byte. Werkzeugtexte je Route (gemeinsames Paket
  plus größtes Werkzeugpaket): Deutsch 5.199, Englisch 4.685, Spanisch 5.207 Byte — **unter der
  Warnschwelle von 30.720 Byte**; die Summe aller 49 Pakete je Sprache (Deutsch 35.102 Byte) wird
  getrennt gegen 40.960 Byte geprüft, weil jede Datei einen eigenen gzip-Kopf trägt (gemessen
  2026-10-05)

Zahlen sind Momentaufnahmen. Nach Abhängigkeits-, Test- oder Tooländerungen müssen sie anhand der tatsächlichen Ausgabe aktualisiert werden.

## Noch nicht umgesetzt

- Backend, Konten und Synchronisierung
- Desktop- und Mobile-Shells (das Auskoppeln in ein eigenes Fenster ist der erste Teil davon und
  lokal fertig; die übrige Shell-Frage bleibt offen)
- sichtbarer Source-Link in der Weboberfläche
- umfassende automatisierte Barrierefreiheitstests
- **nicht belegt:** Firefox-Verhalten des Auskoppelns (geckodriver fehlt) und Überbreiten-Freiheit
  bei 1920/1366/1024/768 px — geprüft ist bisher nur 320 px durch `npm run viewport:check`
