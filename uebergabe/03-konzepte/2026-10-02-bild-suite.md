# Konzept: Bild-Suite

**Status:** entwurf  
**Datum:** 2026-10-02  
**Verantwortlich:** Faber (Hermes Agent), auf Vorschlag von Thomas

## Ausgangslage

Die Plattform führt derzeit vier Werkzeuge in drei Suiten (Text, Entwicklung, Generatoren).
Die Kategorie `image` existiert in `packages/core` bereits als Typ
(`ToolCategory = 'text' | 'pdf' | 'image' | 'developer' | 'generator'`), es gibt bisher aber
kein einziges Bildwerkzeug.

Bildbearbeitung ist für CommieTools.org ein naheliegendes nächster Schritt: private Fotos und
Dokumente sind der Bereich, in dem Nutzer am wenigsten bereit sind, fremde Dienste zu verwenden.
Der Bedarf deckt sich direkt mit dem Local-First- und Datenschutzversprechen der Plattform.

Die PDF-Suite wird parallel an anderer Stelle bearbeitet und ist nicht Gegenstand dieses
Konzepts. Die Abgrenzung ist im Abschnitt Nicht-Ziele festgehalten.

## Ziele

- Eine kuratierte Bild-Suite mit zehn Werkzeugen vorschlagen, geordnet nach Aufwand und Nutzen.
- Für jedes Werkzeug ausweisen, ob es rein lokal und offline umsetzbar ist.
- Für jedes Werkzeug eine technische Basis benennen, vorzugsweise eine Open-Source-Lösung.
- Die Machbarkeit dieser Vorschläge prüfen, einschließlich der Lizenzverträglichkeit mit
  `AGPL-3.0-only`.
- Die Reihenfolge der Umsetzung festlegen, damit zuerst wenige Werkzeuge vollständig
  entstehen statt vieler halber.

## Nicht-Ziele

- Keine Implementierung. Dieses Dokument ist ein Vorschlag, keine Entscheidung.
- Keine PDF-Werkzeuge; die PDF-Suite wird anderweitig erstellt.
- Keine Server-, Konten- oder Cloud-Funktionen.
- Kein Upload-Pfad, keine Verarbeitung außerhalb des Geräts.
- Keine verbindliche Festlegung auf Bibliotheken. Die Nennungen sind Kandidaten, keine
  Auswahl.
- Keine erneute Erörterung der bereits vertagten Architekturentscheidungen. Die
  WebAssembly-Grenze wird berührt, aber hier nur als offene Frage geführt.

## Vorschlag

### Gruppe A — Basis-Suite „Bild"

Werkzeuge ohne Modell und ohne große Engine. Überwiegend reine Browser-APIs (Canvas),
Local-First und offline ohne Zusatzdaten.

| # | ID | Werkzeug | Ausführung | Ressourcenklasse |
|---|---|---|---|---|
| 1 | `image-converter` | Format umwandeln (JPEG, PNG, WebP, AVIF, BMP, GIF) | lokal | universal |
| 2 | `image-optimizer` | Komprimieren auf Qualität oder Zielgröße in KB, mit Ersparnisanzeige | lokal | universal |
| 3 | `image-resize` | Skalieren, Zuschneiden, Drehen, Spiegeln | lokal | universal |
| 4 | `image-metadata` | Metadaten und GPS-Daten ansehen und entfernen | lokal | universal |
| 5 | `image-batch` | Mehrere Dateien, eine Regel; Ausgabe als ZIP | lokal | standard |
| 6 | `image-watermark` | Text- oder Logo-Wasserzeichen mit Live-Vorschau | lokal | universal |
| 7 | `color-tools` | Farbpipette, Palette, Umrechnung, WCAG-Kontrast, Farbsehschwäche | lokal | universal |
| 8 | `icon-generator` | Icon- und Favicon-Sätze aus einem Bild, inklusive PWA-Manifest | lokal | universal |

### Gruppe B — Fortgeschritten

Werkzeuge, die ein Modell oder eine große Engine benötigen. Lokal ausführbar, aber mit
Modellgewichten als optionalem, versioniertem Offline-Cache nach `docs/architecture.md`.

| # | ID | Werkzeug | Ausführung | Ressourcenklasse |
|---|---|---|---|---|
| 9 | `image-text` | Texterkennung (OCR) aus Fotos und Scans, Sprachen als Zusatzcache | lokal | heavy |
| 10 | `image-cutout` | Hintergrund entfernen bzw. freistellen | lokal | heavy |

### Nutzerablauf

Alle Werkzeuge folgen dem verbindlichen Vier-Schritt-Fluss aus `docs/ui-system.md`:
Eingabe → Einstellungen → Aktion → Ergebnis. Schwere Einstellungen (Interpolation,
Modellwahl, Sprache) starten eingeklappt. Die Ausführungsklasse `local` wird vor der
Datenannahme sichtbar angezeigt, wie in `docs/architecture.md` gefordert.

### Beschreibung der Werkzeuge

1. **`image-converter`** — Umwandlung zwischen gängigen Rasterformaten. Canvas deckt JPEG,
   PNG und WebP ab. AVIF und JPEG XL sind im Browser nicht überall kodierbar; dort wäre eine
   zusätzliche Kodierung über WebAssembly nötig. Diese Abhängigkeit ist der Grund, das
   Werkzeug nicht als völlig abhängigkeitsfrei zu führen.
2. **`image-optimizer`** — Kompression mit Vorschau: Qualitätsregler, Vorgabe einer
   Zielgröße, Anzeige der tatsächlichen Ersparnis vor dem Download. Für Betreiber von
   Webseiten der meistgenutzte Werkzeugtyp dieses Bereichs.
3. **`image-resize`** — Größe ändern, zuschneiden, drehen, spiegeln. Seitenverhältnis
   sperrbar, exakte Pixelmaße, optional Angaben in Millimetern und DPI,
   Interpolationsverfahren wählbar.
4. **`image-metadata`** — EXIF-, Kamera- und GPS-Daten anzeigen und entfernen. Datenschutz-
   Aushänger der Suite: Standortdaten in Handyfotos sind genau der Fall, den ein werbefreies
   Local-First-Werkzeug adressieren soll. Entfernen ist teils ohne Neu-Enkodierung möglich.
5. **`image-batch`** — Mehrere Dateien mit einer Regel: Format, Größe, Qualität, Metadaten
   entfernen, Umbenennungsschema, Ausgabe als ZIP. Ersetzt das mühsame Einzelbearbeiten;
   die ZIP-Erzeugung ist rein lokal möglich.
6. **`image-watermark`** — Text oder eigenes Logo, Position, Deckkraft, Größe, Kachelmuster,
   mit Vorschau. Urheberkennzeichnung ohne fremden Dienst.
7. **`color-tools`** — Farbpipette, dominante Palette, Umrechnung HEX/RGB/HSL/LAB,
   Kontrastprüfung nach WCAG, Simulation von Farbsehschwächen. Doppelter Nutzen: eigenständiges
   Werkzeug und Hilfsmittel zur Pflege der Design-Tokens aus `docs/ui-system.md`.
8. **`icon-generator`** — Satz von Icon-Größen (16 bis 512 px), `favicon.ico`, PWA-Icons,
   optionale maskierbare Variante, dazu das Manifest-Snippet. Deckt einen Eigenbedarf des
   Projekts: die Varianten unter `assets/` entstanden bisher von Hand.
9. **`image-text`** — Texterkennung aus Fotos und Scans. Sprachen werden als freiwillig
   herunterladbare, versionierte Caches geführt; danach arbeitet das Werkzeug offline.
   Klare Abgrenzung zur PDF-Suite: dort die Textebene des Dokuments, hier die Pixel.
10. **`image-cutout`** — Freistellen bzw. Hintergrund entfernen über ein lokales
    Segmentierungsmodell, bevorzugt über WebGPU. Sichtbarster KI-Nutzen ohne Cloud, aber
    mit Modellgewichten als eigener Lizenzfrage.

### Nachrücker

Falls anders gewichtet werden soll: Upscaler (2×/4×, `heavy`), Bildvergleich, Collage bzw.
Kontaktabzug, Passfoto-Bogen mit deutschen Normmaßen, animierte Formate (GIF/WebP/APNG),
SVG-Tracer. Der SVG-Tracer ist mit einem eigenen Lizenzvorbehalt versehen, siehe
Abhängigkeiten und Lizenzen.

### Vorgeschlagene Suiten

- `image` — Referenz auf die Werkzeuge 1 bis 8 (Basis-Suite, sofort nutzbar, ohne Zusatzdaten).
- `image-ai` oder `image-advanced` — Referenz auf die Werkzeuge 9 und 10, sobald die
  Engine-Entscheidung getroffen ist.

Suiten referenzieren, wie in `uebergabe/02-architektur/README.md` festgelegt, ausschließlich
Werkzeug-IDs. Kein Werkzeugcode und keine Übersetzungen werden kopiert.

## Alternativen

- **Ein einzelnes großes Bildwerkzeug mit Registerkarten.** Verworfen: widerspricht dem
  modularen Tool- und Manifestmodell und macht Offline-Kennzeichnung, Tests und
  Weiterentwicklung pro Funktion schwerer.
- **Bildbearbeitung ganz zurückstellen und zuerst die PDF-Suite abwarten.** Verworfen, weil
  die Bild-Suite unabhängig davon ist und Werkzeuge der Gruppe A keine der vertagten
  Architekturentscheidungen berühren.
- **Sofort mit dem sichtbarsten Werkzeug beginnen** (`image-cutout` oder ein Upscaler).
  Verworfen, weil beide die WebAssembly- bzw. Modellgrenze berühren und damit zuerst eine
  Grundsatzentscheidung bräuchten.
- **Werkzeug für Werkzeug durch ein anderes KI-System bauen lassen, ohne vorherige
  Machbarkeitsprüfung.** Verworfen: Die Lizenzprüfung des Projekts erfasst nur npm-Pakete,
  keine Modellgewichte. Ohne Vorprüfung entstehen Abhängigkeiten, die `npm run licenses:check`
  nicht sieht.

## Auswirkungen

- **Local First / Datenschutz:** durchgehend positiv. Kein Werkzeug der Liste benötigt eine
  Übertragung. `image-metadata` macht vorhandene Datenübertragung rückgängig. Für die
  Werkzeuge 9 und 10 ist ausdrücklich kein Modellaufruf an einen Dienst vorgesehen.
- **Offline First:** Gruppe A arbeitet ohne Zusatzdaten vollständig offline. Gruppe B benötigt
  einmalig herunterladbare, versionierte Modell- oder Sprachdaten; danach ebenfalls offline.
  Nutzerdokumente dürfen dabei nicht in einen gemeinsamen Cache geraten
  (`docs/architecture.md`, Abschnitt Offline-Modell).
- **UI / Barrierefreiheit:** Der Vier-Schritt-Fluss gilt unverändert. Neu sind
  Vorschauflächen und Dateiauswahl; beide brauchen Tastaturbedienung, sichtbaren Fokus,
  Mindestgrößen von 44 px und alternativ erreichbare Aktionen. Farbe darf nie alleiniger
  Bedeutungsträger sein — relevant für alle Farbausgaben in `color-tools`. Für Live-Vorschauen
  gilt `prefers-reduced-motion`.
- **Internationalisierung:** Neue Werkzeuge erhalten toolnahe Übersetzungen unter ihrem
  `locales`-Verzeichnis sowie Manifest-Schlüssel statt Anzeigetexte. Zahlen-, Einheiten- und
  Papierformate sind getrennt von der Sprache zu behandeln. `image-metadata` und
  `image-text` erzeugen sprachabhängige Ausgabe und brauchen dafür eigene Regeln.
- **Modularität / Suiten:** Zwei neue Suiten, acht bis zehn neue Manifeste, gemeinsame
  Bildlogik zunächst in `packages/tools`. Zeigt sich bei mehreren Werkzeugen echter geteilter
  Bedarf (Dateiannahme, Vorschau, Größenrechnung), ist nach den Erweiterungsregeln eine
  gemeinsame Fähigkeit in ein eigenes Paket zu ziehen; über eine neue Paketgrenze entscheidet
  ein ADR.
- **Abhängigkeiten / Lizenzen:** Der empfindlichste Punkt dieses Konzepts.
  - Gruppe A kommt überwiegend ohne neue Abhängigkeit aus (Canvas, `toBlob`, ZIP-Erzeugung).
  - AVIF-/JPEG-XL-Kodierung, Metadaten-Auswertung, OCR und Freistellen benötigen zusätzliche
    Pakete bzw. Modellgewichte.
  - Modellgewichte haben eigene Lizenzen, häufig mit Namensnennungspflicht und nicht immer
    OSI-konform. Die bestehende Prüfung `npm run licenses:check` deckt sie **nicht** ab. Das
    ist eine Lücke, für die ein eigener Prüfschritt nötig ist.
  - Der **SVG-Tracer** steht unter einem Vorbehalt: Die verbreiteten Tracer sind GPL-lizenziert.
    Bei `GPL-2.0-only` ist eine Verbindung mit `AGPL-3.0-only` nicht möglich, das Werkzeug
    fiele weg. Bei `GPL-2.0-or-later` wäre die Kombination über GPL-3.0 zulässig. Mindestens
    eine JavaScript-Umsetzung ist als gemeinfrei (Unlicense) veröffentlicht.
  - **Alle Lizenzangaben in diesem Konzept sind unbestätigt.** Sie sind vor einer Entscheidung
    einzeln zu prüfen.
- **Tests / Migration:** Keine Migration bestehender Daten oder Routen. Je Werkzeug sind
  Tests für die reine Verarbeitungslogik erforderlich, zusätzlich ein Test für
  Offline-Verhalten und Durchsatz bei mehreren Dateien. `image-batch` braucht einen Test mit
  mehreren Eingaben und Dateinamen mit Sonderzeichen.

## Offene Fragen

- [ ] Ist die Zehnerliste die richtige Auswahl, oder sollen Werkzeuge aus den Nachrückern
      getauscht werden?
- [ ] Sollen Werkzeuge der Gruppe B überhaupt in die Bild-Suite, oder zuerst nur Gruppe A?
- [ ] Werden Modellgewichte als eigener Prüfschritt in die Lizenzprüfung aufgenommen, oder
      gilt für sie ein dokumentiertes Ausnahmeverfahren?
- [ ] Wird die vertagte WebAssembly-Grenze aus `docs/architecture.md` durch
      `image-converter` (AVIF) vorzeitig berührt, oder bleibt das Werkzeug bis dahin auf
      browserfähige Formate begrenzt?
- [ ] Braucht die Suite einen eigenen Datei-Flow über `File System Access API`, oder genügt
      der klassische Download-Weg?
- [ ] Ist für die gemeinsame Bildlogik ein eigenes Paket nötig, oder bleibt sie in
      `packages/tools`?
- [ ] Wie ist die Bildschirmausgabe für sehr große Bilder begrenzt (Speichergrenze im
      Browser)?

## Akzeptanzkriterien

Bezogen auf dieses Konzept, nicht auf die Umsetzung:

- [ ] Zehn Werkzeuge sind mit Zweck, Ausführungsklasse und Ressourcenklasse beschrieben.
- [ ] Für jedes Werkzeug ist eine technische Basis benannt, vorzugsweise eine
      Open-Source-Lösung.
- [ ] Für jedes Werkzeug ist die Machbarkeit bewertet, mit Angabe der Belegquelle.
- [ ] Für jede in Betracht gezogene Abhängigkeit ist die Lizenz gegen `AGPL-3.0-only`
      geprüft, Modellgewichte eingeschlossen.
- [ ] Werkzeuge, die nicht umsetzbar oder lizenzrechtlich unverträglich sind, sind ausdrücklich
      als solche gekennzeichnet und nicht stillschweigend weitergeführt.
- [ ] Das Konzept widerspricht nicht `docs/architecture.md`, `docs/ui-system.md` und
      `docs/localization.md`.
- [ ] Der Status des Dokuments ist auf `in-pruefung` gesetzt, sobald die Prüfung vorliegt.
