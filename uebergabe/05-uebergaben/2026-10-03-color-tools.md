# Übergabe: Werkzeug „Farbwerkzeuge“ gebaut

**Datum:** 2026-10-03
**Bearbeitet durch:** Faber (Hermes Agent)
**Status:** abgeschlossen

## Ziel der Sitzung

Zweiter Teil des Auftrags „Beide": nach dem Wasserzeichen das nächste Werkzeug der
Konzeptreihenfolge, `color-tools`. Farben umrechnen, Kontrast prüfen, Palette aus einem Bild
ziehen, Wirkung bei Farbsehschwäche zeigen — lokal und offline, mit eigener
Open-Source-Recherche vor der Festlegung.

## Ergebnis

Das Werkzeug ist gebaut, geprüft und benutzbar. Es zeigt einen Farbwert in HEX, RGB, HSL und
LAB, nimmt Farben über eine Pipette direkt aus einem Bild auf (Maus und Tastatur), zieht die
häufigsten Farben eines Bildes als Palette, prüft ein Vordergrund-/Hintergrund-Paar nach
WCAG 2.2 und stellt jede Farbe so dar, wie sie bei Protanopie, Deuteranopie, Tritanopie und
Achromatopsie erscheint.

**Keine neue Abhängigkeit.** Die Farbmathematik ist selbst geschrieben; das Konzept hatte
`colorjs.io` als Möglichkeit genannt, die Prüfung der Farbsehschwäche aber ausdrücklich als
Eigenlösung empfohlen. Eine Bibliothek hätte hier nur die Umrechnungen abgedeckt, die wenige
Zeilen sind — die Simulation und die Palette wären ohnehin Eigenarbeit geblieben.
`package-lock.json` unberührt.

## Geänderte Bereiche

- `packages/tools/src/image/color/color.ts` – Verarbeitungslogik: Konvertierungen, WCAG,
  Simulation, Palette
- `packages/tools/src/image/color/locales/{de,en,index}.ts` – werkzeugnahe Texte
- `packages/tools/src/index.ts` – Ausfuhren
- `packages/tools/src/locales.ts` – Katalog eingebunden
- `packages/tools/src/catalog/manifests.ts` – Manifest `color-tools`, Suite `image` erweitert
- `packages/tools/src/catalog/toolIndex.ts` – erzeugt
- `apps/web/public/tools/color-tools.svg` – Symbol
- `apps/web/src/tools/ColorTools.tsx` – Oberfläche mit Pipette, Palette, Kontrastprüfer
- `apps/web/src/App.tsx` – Route
- `apps/web/src/styles.css` – Farbkacheln, Cursor, Urteilsliste, Simulationstabelle
- `apps/web/src/color-tools.test.ts` – 16 neue Prüfungen
- `apps/web/src/tool-catalog.test.ts`, `apps/web/src/tool-search.test.ts` – Erwartungen ergänzt
- Doku: `01-stand/aktueller-stand.md`, `03-konzepte/2026-10-02-bild-suite.md`, `README.md`

## Entscheidungen und Annahmen

- **Die Simulation folgt Brettel, Viénot & Mollon (1997) für alle drei Dichromasien.** Das
  einfachere Viénot-1999-Verfahren mit einer einzigen Matrix ist für Protanopie und
  Deuteranopie brauchbar, für Tritanopie aber nachweislich ungenau. Ein Modell für alle drei ist
  ehrlicher als drei Verfahren mit unterschiedlicher Verlässlichkeit.
- **Die Matrizen wurden mit `libDaltonLens` (MIT) berechnet und eingebettet**, statt die
  LMS-Projektion bei jedem Bildpunkt zu rechnen. Herkunft und Verfahren stehen als Kommentar im
  Quelltext. `libDaltonLens` ist **kein Bestandteil des Projekts**: es lief nur als Prüfmittel in
  einer Wegwerf-Umgebung.
- **Die Simulation rechnet auf linearem sRGB.** Die Matrizen auf gamma-kodierte Werte anzuwenden
  ist ein verbreiteter Fehler und verschiebt die Mitteltöne sichtbar.
- **Die Palette ist deterministisch.** Startpunkte kommen aus einem groben Histogramm, danach
  folgt eine feste Zahl k-means-Runden. Eine zufällige Startwahl hätte bei jedem Lauf andere
  Farben geliefert und die Tests wertlos gemacht.
- **Die Pipette liest die Originalpixel.** Das Arbeitsbild wird für die Anzeige verkleinert, die
  Farbwerte kommen aber aus den vollen Bildpunkten — sonst hätte man Interpolationsfarben
  gemessen, die im Bild gar nicht vorkommen.
- **Die Palette ist auf acht Farben begrenzt** und die Simulationstabelle auf sechs Einträge,
  damit die Ausgabe lesbar bleibt.
- **Achromatopsie** wird als relative Luminanz gerechnet — dieselbe Größe, die WCAG benutzt.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | bestanden; Typprüfung ohne Fehler, **133 Tests** bestanden (vorher 117), Katalogprüfung bestanden (14 Werkzeuge, 14 Symbole, 1023 Begriffe, 54 deklarierte Dateitypen), Lizenzprüfung bestanden (496 Pakete, unverändert) |
| `npm run build` | bestanden; Hauptbundle 525,83 kB (155,73 kB komprimiert), Stylesheet 23,19 kB (4,92 kB), Vorab-Cache 28 Einträge; **Warnung über 500 kB besteht fort** |
| **Gegenprobe der Simulation gegen eine fremde Referenz** | bestanden; die Werte von `libDaltonLens` 0.1.5 (Python, MIT) für 16 Farben × 3 Dichromasien sind im Test hinterlegt, die eigene Rechnung weicht höchstens um 1 von 255 ab (Ganzzahl-Rundung) |
| WCAG-Kontrast gegen unabhängig gerechnete Werte | bestanden; 4,1681 : 1 für Weiß auf `#e63946`, 8,0789 : 1 für `#1d3557` auf `#a8dadc`, 21 : 1 für Schwarz auf Weiß |
| echter Browser (Edge headless über CDP) | bestanden; Überschrift, Bundle aktuell, keine Seitenfehler |
| **Pipette mit einem Bild aus vier bekannten Farbflächen** | bestanden; alle vier Klicks liefern exakt die Farbe der Fläche (255,0,0 / 0,255,0 / 0,0,255 / 29,53,87) |
| **Tastaturbedienung der Pipette** | bestanden; sechs Schritte mit Umschalt+Pfeil bewegen den Cursor von (179,99) nach (239,99) und wechseln dabei von Rot auf Grün |
| Palette aus dem Testbild | bestanden; genau die vier Flächenfarben, in Häufigkeitsreihenfolge |
| Farbwerte im Browser | bestanden; `rgb(230, 57, 70)` ergibt `#e63946`, HSL 355°/78 %/56 %, Kontrast 4,17 : 1 und die Urteile ✗ AA, ✗ AAA, ✓ großer Text — rechnerisch korrekt |
| ungültige Eingabe | bestanden; „quatsch" wird als nicht lesbar gemeldet, die zuletzt gültige Farbe bleibt stehen |
| zwei Fensterbreiten (1360 px und 420 px) | bestanden; Tabelle bleibt scrollbar, nichts läuft über |

## Offene Punkte und Risiken

- [ ] **Das Hauptbundle wächst weiter** (525,83 kB). Das erzeugte Werkzeugregister ist mit jedem
  Werkzeug größer geworden. Der Ausweg steht im Konzept: Register als eigene, abgerufene Datei
  mit Ladezustand. Spätestens beim nächsten Werkzeug sollte das entschieden werden.
- [ ] Die Simulation zeigt die Wirkung, ersetzt aber keine Prüfung mit betroffenen Personen. Das
  steht als Hinweis in der Oberfläche.
- [ ] Die Palette arbeitet auf dem Arbeitsbild (längste Kante 900 px, jeder vierte Bildpunkt).
  Für sehr große Bilder ist das eine Stichprobe, nicht eine vollständige Auszählung.
- [ ] Die LAB-Umrechnung nutzt feste D65-Werte und keine Farbprofile aus der Datei.
- [ ] Die Barrierefreiheit ist handwerklich umgesetzt (Tastaturpipette, `aria-label` je Kachel,
  Farbe nie allein als Bedeutungsträger), aber nicht automatisiert geprüft.

## Empfohlener nächster Schritt

1. `image-optimizer` — die nächste Zeile der Konzeptreihenfolge, ebenfalls abhängigkeitsfrei.
   Davor die Bundlegröße angehen: das Register aus dem Hauptbundle herauszunehmen ist eine
   kleine, klar abgegrenzte Arbeit und wirkt für alle künftigen Werkzeuge.

## Git

- Commit: `584af3b` (Umsetzung, Tests, Dokumentation); die Nachträge in einem zweiten Commit
- Arbeitsbaum: die genannten Bereiche; `package-lock.json` unverändert
