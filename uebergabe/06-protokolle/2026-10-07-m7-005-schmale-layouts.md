# M7-005 — Schmale Layouts verdeckten Inhalte und erzeugten Katalogüberlauf

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Karte:** M7-005 (R5)
**Ergebnis:** behoben — zwei an der Sache gemessene Ursachen, beide über intrinsisch sichere Regeln.

## Was die Karte verlangt

- Auf den vorhandenen CSS-Regeln aufsetzen und **intrinsische Breitenfehler** beheben:
  `minmax(0,1fr)`/`min-width:0` an Flex-/Grid-Kindern, responsiver Kopfbereich mit lesbarem
  Marken-, Sprach- und Menüzugang, **umbrechende Aktionsbeschriftungen**.
- Nicht alle Elemente pauschal abschneiden; kein `overflow:hidden` als generische Reparatur.
- PiP-/Auskoppelsteuerung mit langen Texten und schmaler Ansicht prüfen.
- Abnahme: Startseite, Menü geöffnet, Rechner mit Ergebnis, lange Dateinamen, de/en/es bei
  320 px und 390 px; **native 200-%-Zoom- und Textabstandsprobe separat**.
- Keine verdeckte Funktion, kein horizontaler Ganzseitenüberlauf außer begründeten
  Datendarstellungen.

## Bestandsaufnahme (gemessen, `work/m7-005-messwerte.json`)

Sieben Zustände je Zeile: Startseite, Menü geöffnet, Rechner mit Ergebnis, langer Dateiname
(69 Zeichen), Startseite mit Textabständen (WCAG 1.4.12), Startseite bei 640 px und bei 683 px
(entspricht 200 % Zoom auf 1280 bzw. 1366 px).

| Zeile | vorher | Befund |
|---|---|---|
| 320 es | 2 Zustände mit Befund | Rechner: `dl` **346 px breit** in 320 px Fenster (rechts bei 379) — zwei weitere Elemente folgen<br>Textabstände: **Ganzseitenüberlauf 405 px** bei 320 px Fenster, 450 überbreite Stellen |
| 390 es | — | nur Textabstände auffällig |
| 320/390 de, 320/390 en, 1360 es | — | nur Textabstände auffällig |

**Ursache des Rechner-Befunds (gemessen über die Vorfahrenkette, nicht geraten):**
`div.results` ist ein Raster **ohne Spaltendefinition**; die automatische Spur rechnete auf
**346,484 px** in einem **254 px** breiten Kasten. Die Zahl kann nicht umbrechen, die Spur nicht
schrumpfen — der Inhalt wurde beschnitten, also **verdeckt** statt sichtbar. Genau das, was die
Karte beschreibt.

**Ursache des Textabstands-Befunds:** Die Spuren in den Umbruchregeln standen als blankes `1fr`
(`minmax(auto, 1fr)`); eine solche Spur kann nicht unter die **Inhaltsmindestbreite** schrumpfen.
Mit 1,2-facher Schrift und zusätzlichen Abständen schob der Katalog die Seite über die Fensterbreite.
Zusätzlich konnte `.card-footer` (Flex, `justify-content: space-between`) nicht umbrechen und schob
den Aktionsknopf **aus dem Kasten** (rechts bei 380 px in einem 206 px breiten Fuß).

## Umsetzung (16 Regeln, alle intrinsisch sicher)

1. **Blanke `1fr`-Spuren → `minmax(0, 1fr)`**: `.site-header` (12, 263), `.section-heading` (82),
   `.principle-grid` (208), die große Umbruchregel (272), `.license-filters` (277),
   `.pdf-viewer-layout` (346), `.pdf-form-grid` (350).
2. **Feste Mindestbreiten in auto-fill-Rastern → `minmax(min(100 %, X), 1fr)`**:
   `.pdf-thumbnail-grid`/`.pdf-organizer` (145 px), `.pdf-result-list` (180 px),
   `.pdf-image-results` (190 px), `.icon-size-list` (6,5 rem), `.icon-result-grid` (9,5 rem).
   Eine feste Untergrenze, die größer als das Behältnis ist, kann den Kasten sonst überlaufen.
3. **Rechner-Ergebniszeile:** `.results` bekommt `grid-template-columns: minmax(0, 1fr)`;
   `.results div` bekommt `flex-wrap: wrap` + `min-width: 0`; `.results dd` bekommt
   `min-width: 0` und `overflow-wrap: anywhere`.
4. **Kartenfußzeile:** `.card-footer` bekommt `flex-wrap: wrap`; `.card-footer .text-link`
   zusätzlich `min-width: 0` und `overflow-wrap: anywhere`.
   **Kein `overflow:hidden` als Reparatur** — die Karte verbietet es, und es hätte den Inhalt
   verdeckt statt ihn sichtbar zu machen.

## Belege nach der Änderung

| Zeile | Zustände | Befund |
|---|---|---|
| 320 es | 7 | **0** — auch Textabstände und beide Zoombreiten sauber |
| 390 es | 7 | **0** |
| 320 de | 7 | **0** |
| 390 de | 7 | **0** |
| 320 en | 7 | **0** |
| 390 en | 7 | **0** |
| 1360 es | 7 | **0** |

Der Textabstandsbefund ging dabei über zwei Schritte: Ganzseitenüberlauf **405 px → 380 px**
(nach Schritt 1/2) → **0** (nach Schritt 4). Beide Schritte sind einzeln belegt.

**Zusätzlich gemessen:** Der Kopfbereich bleibt in **allen** Zeilen lesbar — Marke, Sprachwahl,
Menüknopf und Themenschalter liegen vollständig im Bild (`marke/sprache/menue/thema: ok`), auch bei
320 px mit Textabständen und bei 200 % Zoom.

**Projektprüfer:**
- `viewport:check` (Überbreite, 320 px, **62 Routen**): *Audit passed*.
- `a11y:check` über `/`, `/tools/pdf-organize`, `/tools/pdf-merge`, `/tools/calculator`,
  `/tools/icon-generator`, beide Schemata: 8 Routen je Schema `ok`, keine Ziele < 44, keine
  abgeschnittenen Elemente, keine Kontrast- oder Namensbefunde.

**Kette:** `npm run check` Exit 0 · `npm run build` Exit 0 (Startbündel 149481 B gzip, 19 optionale
PDF-Artefakte).

## Benannte Grenzen

- **Kein reales Mobilgerät.** Gemessen ist die Breitenemulation (320/390 px); die Karte verlangt das
  Gerät ausdrücklich *separat* — das bleibt offen.
- **Zoom ist ersatzweise gemessen.** Statt eines echten Browserzooms wurde die CSS-Breite
  entsprechend gesetzt (640 px ≙ 200 % auf 1280, 683 px ≙ 200 % auf 1366). Das ist der übliche
  Ersatzweg, aber kein echter Zoomvorgang mit Gerätepixeln.
- **PiP-/Auskoppeln mit langen Texten** ist über den langen Dateinamen und die schmalen Breiten
  mitgemessen, aber nicht als eigenes ausgekoppeltes Fenster bei 320 px (die Auskopplung öffnet ein
  eigenes Fenster; das ist ein eigener Beleg).
- Begründet scrollende Darstellungen (Lizenztext, Tabellen) waren in den gemessenen Zuständen
  nicht auffällig und bleiben erlaubt.

## Prüfmittel-Lehren (eigene Fehler)

1. **Wieder die Escape-Falle beim Schreiben von Quelltext aus einem Python-Heredoc** — diesmal
   zerriss es eine Vorlagenzeichenkette. Der Abschnitt wurde ohne Vorlagenzeichenketten neu
   geschrieben. Regel: komplexen JS-Quelltext nur über `write_file`/`patch` schreiben, nicht über
   ein Heredoc.
2. **Eine Datei mit ungerader Backtick-Zahl ist kein Beweis für einen Fehler** — die Klammer- und
   Zeichenkettenzählung mit dem eigenen Zählwerk war selbst fehlerhaft. Die Suche nach der Ursache
   hat länger gedauert als das Neuschreiben des Abschnitts.
