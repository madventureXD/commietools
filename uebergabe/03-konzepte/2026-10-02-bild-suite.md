# Konzept: Bild-Suite

**Status:** in-pruefung  
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

## Machbarkeitsprüfung (2026-10-02)

**Geprüft von:** Faber (Hermes Agent) · **Prüfart:** Papierprüfung, kein Probeaufbau

**Ergebnis in einem Satz:** Alle zehn Werkzeuge sind lokal und offline machbar. Sechs davon
brauchen keine neue Abhängigkeit, vier brauchen eine geprüfte Bibliothek oder Modellgewichte.
Zwei Kandidaten sind wegen ihrer Lizenz ausgeschlossen, drei weitere wegen fehlender Pflege
abzulehnen.

### Prüfmethodik und Belegstufen

1. **Eigene Messung** gegen die npm-Registry (Lizenzfeld, letzte Veröffentlichung, entpackte
   Größe) und gegen die Hugging-Face-Modellkarten.
2. **Quellenprüfung** in vier getrennten Strängen. Jede Behauptung musste mit Quellen-URL
   belegt werden; Nicht-Belegbares war ausdrücklich als „unbestätigt" zu kennzeichnen.
3. **Gegenprüfung der tragenden Aussagen** durch mich am Primärtext. Dabei wurden Abweichungen
   gegenüber den Rechercheberichten gefunden (siehe Abschnitt „Abweichungen von den
   Rechercheberichten").

Diese drei Stufen sind bewusst getrennt: Ein Bericht eines Recherchestrangs ist ein Bericht,
kein Beweis. Bei jedem Befund unten ist vermerkt, ob er **selbst geprüft** oder nur
**berichtet** ist.

### Ergebnis je Werkzeug

| # | Werkzeug | Umsetzungsweg | Bewertung | Neue Abhängigkeit |
|---|---|---|---|---|
| 1 | `image-converter` | Canvas für JPEG/PNG; WebP nativ außer Safari; AVIF nur über WASM | geeignet, AVIF kostet | optional `@jsquash/avif` |
| 2 | `image-optimizer` | Canvas `toBlob` mit `quality`; stärkere Kompression über MozJPEG-WASM | geeignet | optional `@jsquash/jpeg` |
| 3 | `image-resize` | `pica` (MIT) für Skalierung, Canvas-Transformation für Zuschnitt/Drehung | geeignet | ja: `pica` |
| 4 | `image-metadata` | `exifreader` (MPL-2.0, nur lesend) plus eigener Byte-Stripper | geeignet, Eigenarbeit | ja: `exifreader` |
| 5 | `image-batch` | `fflate` (MIT) für ZIP; Ordner-Schreibweg nur als Verbesserung | geeignet, Rückfall nötig | ja: `fflate` |
| 6 | `image-watermark` | Canvas direkt (`globalAlpha`, `createPattern`) | geeignet | keine |
| 7 | `color-tools` | `colorjs.io` (MIT) plus eigene Matrizen für Farbsehschwäche | geeignet | ja: `colorjs.io` |
| 8 | `icon-generator` | Canvas plus eigener ICO-Container | geeignet | keine |
| 9 | `image-text` | `tesseract.js` (Apache-2.0), Sprachdaten selbst gehostet | geeignet | ja + Sprachdaten |
| 10 | `image-cutout` | Transformers.js mit ModNet (Apache-2.0) als erster Weg; `@imgly` (AGPL-3.0) als zweiter | geeignet | ja + Modellgewichte |

### Befunde im Einzelnen

**1 — `image-converter`.** Nativ ist weniger, als es aussieht. `Canvas.toBlob` liefert bei
nicht unterstütztem Typ **still** ein PNG zurück, ohne Fehler — es gibt keine
Fähigkeitsabfrage, man muss `blob.type` prüfen. JPEG und PNG sind in allen Browsern
kodierbar, **WebP nicht in Safari**, **AVIF in keinem Browser** (offener Chromium-Fehler).
AVIF-Ausgabe braucht daher einen WASM-Encoder (~3,4 MB wasm). Die Multithread-Variante
verlangt zusammenhängende Herkunft (COOP/COEP) — eine Deployment-Bedingung, die mit der
offenen CSP-Frage des Projekts zusammenhängt. *(selbst geprüft: nativ nicht möglich;
berichtet: Versionsangaben, Chromium-Fehler)*

**2 — `image-optimizer`.** Die Rechnung „Qualität einstellen, Größe vergleichen" ist mit
`toBlob(…, quality)` nativ möglich. Der naheliegende Kandidat
`browser-image-compression` ist **abzulehnen**: letzte Veröffentlichung März 2023, 64 offene
Fehler, dokumentierte Fehlfunktionen (zerschnittene Bilder in Firefox, schwarze Ausgabe auf
iPad, Hänger bei 30 Bildern) und ein standardmäßiger Worker-Nachladevorgang von
`cdn.jsdelivr.net` — für ein Projekt ohne Fremdserver ein Ausschlussgrund. *(berichtet)*

**3 — `image-resize`.** `pica` ist MIT, läuft im Browser und im Web Worker, beherrscht
Lanczos und wiegt im Bundle nur ~14,8 kB gzip (die 1221 kB im Paket sind Quelle und
Quellkarten). Zuschneiden, Drehen und Spiegeln brauchen keine Bibliothek, das ist
Canvas-Transformation. Grenze: iOS-Canvas ist auf 4096 × 4096 px beschränkt, sehr große
Bilder müssen vorher verkleinert werden. *(selbst geprüft: Registry-Angaben;
berichtet: Bundle-Größe)*

**4 — `image-metadata`.** Der beste Leser ist `exifreader` (MPL-2.0, zuletzt 2026-09-26,
aktiv gepflegt) und kann GPS und Kamera auslesen — **aber nicht schreiben oder entfernen**;
das ist ein offener Wunsch im Projekt, nicht umgesetzt. Für das Entfernen ist daher ein
**eigener Byte-Stripper** nötig: bei JPEG die APP1/APP13/APP2- und COM-Segmente überspringen,
bei PNG die Text- und Farbprofil-Chunks, bei WebP die EXIF/XMP-Chunks — die Pixeldaten
bleiben dabei **bit-identisch**, es wird nicht neu enkodiert. HEIC, TIFF und animiertes WebP
gehen nur mit Neu-Enkodierung. `piexifjs` (MIT, 83 kB) könnte schreiben, ist aber seit 2019
eingefroren und arbeitet auf Zeichenketten statt Bytes. MPL-2.0 ist mit `AGPL-3.0-only`
verträglich (§1.12 zählt AGPL-3.0 zu den Secondary Licenses, §3.3 erlaubt das kombinierte
Werk). *(berichtet — dieser Punkt ist noch nicht selbst gegengeprüft und bleibt offen)*

**5 — `image-batch`.** `fflate` (MIT) erzeugt ZIP im Browser, streamfähig, ~12,5 kB gzip.
`client-zip` (MIT, 2,6 kB) ist noch kleiner, komprimiert aber nicht — für bereits
komprimierte Bilder genau richtig. Die **File System Access API** für „Ordner wählen und
Dateien dort zurückschreiben" gibt es nur in Chrome und Edge, **nicht in Firefox und Safari**.
Das Werkzeug braucht deshalb zwingend einen Rückfallweg über `<input type="file" multiple>`
und Einzeldownloads. *(berichtet)*

**6 — `image-watermark`.** `watermarkjs` kann Text, Logo, Deckkraft und Position, aber
**keine Kachelung**, und wird seit 2020 nicht gepflegt. Es ist ohnehin nur ein dünner
Canvas-Wrapper. Empfehlung: **Canvas direkt** — Deckkraft über `globalAlpha`, Kachelung über
`createPattern(…, "repeat")`. Damit entfällt die Abhängigkeit vollständig. *(berichtet)*

**7 — `color-tools`.** `colorjs.io` (MIT) ist baumelschüttelbar und rechnet Kontrast sowohl
nach WCAG 2.x (`contrastWCAG21`) als auch nach APCA. Die 15 MB der Registry sind der
ungepackte Tarball mit allen Farbräumen, nicht der eingebundene Anteil. Für die Simulation
von Farbsehschwächen ist **keine Bibliothek** zu empfehlen: die bekannte
`color-blind`-Bibliothek hat Teile unter CC-BY-SA und einer nicht-kommerziellen Lizenz. Die
Protan-/Deutan-Simulation ist eine einzelne 3×3-Matrix in linearem sRGB nach Viénot 1999 —
dieselben Werte, die auch Chromium verwendet — und daher selbst zu schreiben. Tritanopie
braucht das aufwändigere Brettel-Verfahren von 1997. *(berichtet)*

**8 — `icon-generator`.** `png-to-ico` ist **nicht** browserfähig: es importiert `node:fs`
und benutzt `Buffer`. Das ist kein Hindernis, denn der ICO-Container ist selbst schnell
geschrieben: ein 6-Byte-Kopf, danach je Bild ein 16-Byte-Eintrag, danach die Bilddaten —
eingebettete PNG-Daten sind seit Windows Vista offiziell zulässig. Damit bleibt das Werkzeug
abhängigkeitsfrei. Für die PWA-Variante gilt: eigenes Icon mit `purpose: "maskable"`, ein
deckender Hintergrund und alle wichtigen Inhalte innerhalb der sicheren Zone (Kreis mit 80 %
der kürzeren Kante). *(berichtet; der ICO-Aufbau ist dokumentiert, aber nicht selbst am
Primärtext gelesen)*

**9 — `image-text`.** `tesseract.js` ist Apache-2.0, läuft vollständig im Browser über einen
eigenen Web Worker und lässt sich über `workerPath`, `corePath` und `langPath` vollständig
selbst betreiben — Voraussetzung für den Offline-Betrieb. Größen der Sprachdaten: `deu`
**6,8 MiB**, `eng` **10,4 MiB** (komprimiert); die schnellere `tessdata_fast`-Variante
kommt auf 1,5 bzw. 3,9 MiB. Die Lizenz der tessdata-Sprachdaten ist Apache-2.0. Grenzen laut
offizieller Doku: beste Ergebnisse ab etwa 300 dpi, Schwächen bei Schräglage, Schatten und
Tabellen; Vorverarbeitung wird empfohlen. *(berichtet)*

**10 — `image-cutout`.** `@imgly/background-removal` steht tatsächlich unter **AGPL-3.0** —
am Lizenztext selbst gelesen, also mit dem Projekt verträglich. Zwei belastbare Einwände:
Die Bibliothek lädt ihre Gewichte **standardmäßig von `staticimgly.com`** (im Bibliothekscode
nachgelesen), was dem Grundsatz „kein Fremdserver" widerspricht und umkonfiguriert werden
muss; und das Datenpaket misst **284.706.412 Bytes ≈ 271,5 MiB** (selbst per HEAD gemessen).
Der leichtere und lizenzseitig einfachere Weg ist **Transformers.js**
(`@huggingface/transformers`, Apache-2.0) mit **ModNet** (`Xenova/modnet`, Apache-2.0,
quantisiert **6,32 MB** — beides selbst geprüft). Damit ist Werkzeug 10 ohne AGPL-Bindung und
ohne Hersteller-CDN baubar. Die weit verbreiteten BRIA-Modelle sind **ausgeschlossen** (siehe
Lizenzliste). MediaPipe ist abzulehnen, weil die Tasks-Bibliothek Nutzungsmetriken an Google
sendet — für eine werbefreie Plattform untragbar. *(selbst geprüft: AGPL-Text,
CDN-Standard, Datenpaketgröße, ModNet-Lizenz und -Größe)*

### Lizenzliste der Modellgewichte und Datensätze

Das ist die Grundlage für den unten entworfenen Prüfschritt.

| Artefakt | Lizenz | Nutzung eingeschränkt? | Beleg |
|---|---|---|---|
| `tesseract.js` (Code) | Apache-2.0 | nein | naptha/tesseract.js LICENSE |
| tessdata-Sprachdaten (deu, eng) | Apache-2.0 | nein | tesseract-ocr/tessdata |
| `@imgly/background-removal` (Code) | **AGPL-3.0** (selbst gelesen) | nein, aber Copyleft | imgly LICENSE.md |
| `@imgly/background-removal-data` (Gewichte) | AGPL-3.0 laut Paketfeld | nein, Copyleft | npm-Lizenzfeld |
| ISNet-Gewichte (von imgly genutzt) | laut imgly MIT; Quellprojekt DIS nennt Apache-2.0 für Code | **unbestätigt** | imgly ThirdPartyLicenses.json (berichtet) |
| `onnxruntime-web` | MIT | nein | imgly ThirdPartyLicenses.json (berichtet) |
| U-2-Net | Apache-2.0 | nein | xuebinqin/U-2-Net (berichtet) |
| ModNet / `Xenova/modnet` | **Apache-2.0** (selbst geprüft) | nein | HF-API `license: apache-2.0` |
| RMBG-1.4 (BRIA) | `other` / bria-rmbg-1.4 | **ja, nicht-kommerziell** | HF-Modellkarte (berichtet) |
| RMBG-2.0 (BRIA) | **CC BY-NC 4.0** (selbst geprüft) | **ja, nicht-kommerziell** | HF-API `license_link` → CC BY-NC |
| `@mediapipe/tasks-vision` | Apache-2.0 | Lizenz nein, **sendet aber Metriken an Google** | npm, MediaPipe-Privacy-Hinweis (berichtet) |

**Ausgeschlossen:** RMBG-1.4 und RMBG-2.0 (nicht-kommerziell), `potrace` und
`esm-potrace-wasm` (GPL-2.0, Variante unklar), `ocrad.js` (GPL-3.0, seit 2014 tot),
MediaPipe-Tasks (Metriken an Google).

**Abzulehnen wegen fehlender Pflege:** `browser-image-compression` (2023, CDN-Standard),
`watermarkjs` (2020, keine Kachelung), `exifr` (2021), `wasm-imagemagick` (2020),
`@squoosh/lib` (2023, eingestellt), `piexifjs` (2019).

### Abweichungen von den Rechercheberichten

Zwei Punkte der Zulieferungen haben der Gegenprüfung nicht standgehalten und sind deshalb
hier richtiggestellt:

1. **Version des imgly-Datenpakets.** Berichtet wurde Version 1.7.0. Auf npm ist die letzte
   veröffentlichte Fassung **1.4.5** (2024-02-26); die abweichende Nummer stammt von der
   Herstellerseite. Die Bibliothek zieht ihre Gewichte zur Laufzeit von dort, nicht aus npm.
   Konsequenz: Die Gewichte sind **nicht** über `npm run licenses:check` erfassbar — genau
   die Lücke, um die es geht.
2. **potrace-Lizenzvariante.** Berichtet wurde, die Originalquelle sei `GPL-2.0-or-later`
   und damit über GPL-3.0 doch mit AGPL-3.0 verträglich. Ich konnte den Lizenzsatz auf der
   Projektseite **nicht** bestätigen; das npm-Paket deklariert `GPL-2.0`. Solange die
   Variante nicht belegt ist, gilt die konservative Annahme `GPL-2.0-only` →
   **unverträglich**, also Ausschluss. Der SVG-Tracer bleibt damit nur über eine permissive
   Umsetzung möglich.

Zusätzlich konnte eine berichtete Paketangabe nicht bestätigt werden: `@image-tracer/browser`
existiert unter diesem Namen nicht in der Registry (das Repository existiert, der
Paketname ist zu klären).

### Was sich durch die Prüfung am Vorschlag ändert

1. **`image-converter` ist nicht abhängigkeitsfrei.** AVIF ist nativ in keinem Browser
   kodierbar. Entweder das Werkzeug startet ohne AVIF, oder die vertagte
   WebAssembly-Entscheidung wird vorher getroffen. Das ist eine echte Änderung gegenüber dem
   ersten Entwurf.
2. **`image-metadata` wird größer als gedacht.** Kein verfügbarer Leser schreibt, und der
   saubere Schreibweg ist ein selbst gebauter Byte-Stripper. Dafür bleibt das Werkzeug
   abhängigkeitsarm und kann sogar verlustfrei arbeiten — ein Alleinstellungsmerkmal
   gegenüber Anbietern, die Bilder dafür neu enkodieren.
3. **`image-cutout` bekommt einen anderen ersten Weg.** Nicht die AGPL-Bibliothek mit
   Hersteller-CDN und 271,5 MiB Datenpaket, sondern Transformers.js mit ModNet (6,32 MB,
   Apache-2.0). Das ist rund **40-mal kleiner** und lizenzseitig ungebunden.
4. **Drei Werkzeuge werden abhängigkeitsfrei:** `image-watermark`, `icon-generator` und
   `color-tools` (bis auf die Farbrechnung) — jeweils, weil die Bibliothekskandidaten tot
   oder unpassend sind und die Eigenlösung dokumentiert und klein ist.
5. **Der SVG-Tracer bleibt Nachrücker, ist aber nicht mehr ausgeschlossen.**
   `imagetracerjs` ist **Unlicense** (am Lizenztext selbst gelesen) und browserfähig; die
   Lizenzfrage ist damit gelöst. Es wird seit 2020 nicht mehr gepflegt, hat zwei offene
   Anmerkungen und liefert bei Fotos unbrauchbare Ergebnisse — als Werkzeug für Vorlagen mit
   Flächen aber machbar. Eine MIT-Umsetzung (`visioncortex/vtracer`) existiert, ist aber nur
   als Vorabversion 1.0.0-alpha veröffentlicht.
6. **`image-batch` braucht einen Rückfallweg.** Der bequeme Ordner-Schreibweg fehlt in
   Firefox und Safari. Das ist eine UI-Entscheidung, keine Nebensache.

### Vorgeschlagene Reihenfolge der Umsetzung

1. `image-metadata` — klein, hoher Datenschutznutzen, einzige Abhängigkeit ist ein Leser,
   die Kernarbeit ist eigene Logik. Dient zugleich als Referenzklasse für die Aufwandsmessung.
2. `image-resize` und `icon-generator` — beide überwiegend Canvas, wenig Risiko.
3. `image-watermark`, `color-tools`, `image-optimizer` — reine Eigenlösungen.
4. `image-converter` und `image-batch` — erst nach der Entscheidung über AVIF und den
   Datei-Rückfallweg.
5. `image-text`, dann `image-cutout` — zuletzt, weil sie den Prüfschritt für Gewichte und
   die Entscheidung über große Offline-Caches voraussetzen.

### Entwurf: Prüfschritt für Modellgewichte

Der bestehende Prüflauf erfasst nur npm-Pakete. Gewichte liegen außerhalb. Vorschlag — noch
nicht umgesetzt, weil er erst mit entschiedener Werkzeugauswahl sinnvoll ist:

- Eine eigene Datei `licenses/artifacts.json` mit je einem Eintrag pro Artefakt: Name,
  Herkunft, genaue Version, Lizenzkennung, dauerhafter Belegverweis und SHA-256-Prüfsumme.
- Eine Erweiterung von `scripts/license-audit.mjs`, die diese Datei prüft: unbekannte
  Lizenzkennung, fehlender Belegverweis, fehlende Prüfsumme oder nicht mehr erreichbare
  Herkunft lassen den Lauf fehlschlagen.
- Ausdrückliche Sperrliste für Kennungen wie `CC-BY-NC-*`, `bria-*` und alles ohne
  SPDX-Kennung.
- Anzeige derselben Angaben im Werkzeug, damit der Nutzer vor dem Laden großer Gewichte
  sieht, was er lädt.

## Offene Fragen

- [ ] Ist die Zehnerliste die richtige Auswahl, oder sollen Werkzeuge aus den Nachrückern
      getauscht werden?
- [ ] Sollen Werkzeuge der Gruppe B überhaupt in die Bild-Suite, oder zuerst nur Gruppe A?
- [ ] Wird die vertagte WebAssembly-Grenze aus `docs/architecture.md` durch
      `image-converter` (AVIF) vorzeitig berührt, oder bleibt das Werkzeug bis dahin auf
      browserfähige Formate begrenzt?
- [ ] Braucht die Suite einen eigenen Datei-Flow über `File System Access API`, oder genügt
      der klassische Download-Weg als alleiniger Weg?
- [ ] Ist für die gemeinsame Bildlogik ein eigenes Paket nötig, oder bleibt sie in
      `packages/tools`?
- [ ] Wie ist die Bildschirmausgabe für sehr große Bilder begrenzt (Speichergrenze im
      Browser, iOS 4096 px)?
- [ ] Sollen die Sprach- und Modelldaten beim ersten Nutzen geladen oder als Paket
      mitgeliefert werden?
- [ ] Wird der Prüfschritt für Modellgewichte vor dem ersten Gruppe-B-Werkzeug gebaut oder
      erst danach?
- [ ] Soll `image-metadata` auch Formate abdecken, die Neu-Enkodierung erzwingen (HEIC,
      TIFF), oder bleibt es beim verlustfreien Weg?
- [ ] Bleibt es bei der konservativen Auslegung für `potrace` (GPL-2.0 ohne Variantenangabe
      = ausgeschlossen), oder soll die Variante rechtlich geklärt werden?

## Akzeptanzkriterien

Bezogen auf dieses Konzept, nicht auf die Umsetzung:

- [x] Zehn Werkzeuge sind mit Zweck, Ausführungsklasse und Ressourcenklasse beschrieben.
- [x] Für jedes Werkzeug ist eine technische Basis benannt, vorzugsweise eine
      Open-Source-Lösung.
- [x] Für jedes Werkzeug ist die Machbarkeit bewertet, mit Angabe der Belegquelle.
- [x] Für jede in Betracht gezogene Abhängigkeit ist die Lizenz gegen `AGPL-3.0-only`
      geprüft, Modellgewichte eingeschlossen.
- [x] Werkzeuge, die nicht umsetzbar oder lizenzrechtlich unverträglich sind, sind ausdrücklich
      als solche gekennzeichnet und nicht stillschweigend weitergeführt.
- [x] Das Konzept widerspricht nicht `docs/architecture.md`, `docs/ui-system.md` und
      `docs/localization.md`.
- [x] Der Status des Dokuments ist auf `in-pruefung` gesetzt, sobald die Prüfung vorliegt.

### Anmerkung zur Prüftiefe

Die Prüfung ist eine Papierprüfung. Sie stützt sich auf Dokumentation, Lizenztexte und
Paketangaben, nicht auf ausgeführten Code. Nicht gedeckt sind damit: tatsächliches Verhalten
in den Browsern, reale Laufzeit und Speicherbedarf, Qualität der Ergebnisse und die
Baubarkeit im bestehenden Vite-Aufbau (bekannte Reibung bei WASM-Abhängigkeiten). Diese
Punkte brauchen einen Probeaufbau. Lizenzaussagen, die nicht selbst gegengeprüft wurden, sind
im Text als solche gekennzeichnet.
