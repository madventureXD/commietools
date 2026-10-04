# Rechner-Suite, Welle 5 — Mathematik (Gleichungslöser, Statistik, Funktionsplotter)

**Datum:** 2026-10-04
**Auftrag:** Welle 5 der Suite „Rechnen": Gleichungslöser, Statistik, Funktionsplotter.
**Status:** fertig und im Artefakt belegt.

## Was gebaut wurde

Drei Werkzeuge, je Sprache in drei Sprachen, mit Icons, Katalogeinträgen und Tests.

**Gleichungslöser** (`equations`) — linear, quadratisch, kubisch, jeweils mit vollständigem
Lösungsweg: Ausgangsgleichung, Normieren, Substitution, reduzierte Form, Diskriminante,
Cardano-Fall, Rückweg, Probe. Quadratisch zeigt zusätzlich den Scheitelpunkt. Eigene Formeln,
kein Computeralgebra-System.

**Statistik** (`statistics`) — Kennwerte einer Reihe (Anzahl, Summe, Mittelwert, Median, Modus,
Quartile, IQR, kleinster/größter Wert, Spannweite, Varianz und Standardabweichung **in beiden
Bezugsarten**, Ausreißergrenzen) und Regression für Wertepaare (Steigung, Achsenabschnitt,
Korrelation, Bestimmtheitsmaß). Daneben eine Sortierung mit Rang.

**Funktionsplotter** (`plotter`) — mehrere Funktionen gleichzeitig, Wertetabelle, berechnete
Nullstellen, Achsen mit lesbaren Schritten, heller und dunkler Modus.

## Die eine Abweichung vom Konzept — mit Grund

Die Roadmap führte „zweite neue Engine: `function-plot` (MIT, ~64 KiB gzip)" und eine
„sampler-Falle" als Prüfpunkt. **`function-plot` ist wieder entfernt.** Grund ist die
Lizenzprüfung, nicht der Aufwand:

```
function-plot → interval-arithmetic-eval → interval-arithmetic@1.1.3
License audit failed: interval-arithmetic uses unreviewed license expression BSL-1.0
```

`BSL-1.0` steht in der Projektpolitik weder in der Freigabe noch in der Prüfliste. Die
Lizenzordnung wird nicht nebenbei geändert, also trägt die Engine nicht — und damit erübrigt sich
die sampler-Falle, denn sie war eine Eigenschaft dieser Engine.

Stattdessen ein **eigener Zeichner**: `plotter.ts` erzeugt reine Geometrie (Kurvenzüge in
Zeichenkoordinaten, Gitter, Beschriftungen, Nullstellen, Wertetabelle), die Oberfläche setzt
daraus SVG zusammen. Nebeneffekte, die willkommen sind:

- keine 64 KiB Engine, kein zusätzlicher Chunk, kein Vorabladen-Thema;
- die Zeichnung ist **ohne Browser prüfbar**, weil nur Zahlen entstehen;
- Wertetabelle und Nullstellen rechnet derselbe Rechenkern (`calculator/core`) wie der Rechner —
  kein zweiter Ausdrucksauswerter, der anders rechnen könnte.

**Wenn `BSL-1.0` in die Politik aufgenommen werden soll** (es ist eine einfache permissive
Lizenz), ist das eine Entscheidung am Lizenzgate — dann kann `function-plot` zurückkommen. Der
eigene Zeichner ist davon unabhängig lauffähig.

## Vier echte Fehler, gefunden und behoben

1. **Vorzeichen im kubischen Rückweg.** Die Kandidaten sind y-Werte der Normalform; der Rückweg
   `x = y − B/3` stand als `y + B/3` im Code. Der Fehler fiel **nicht** auf: Die Tests für
   Δ > 0 und Δ = 0 hatten zufällig `B = 0` (shift 0), und die Probe prüft nur, ob der gefundene
   Wert eine Nullstelle ist — nicht, ob es die *richtige* ist. Erst der Fall mit shift ≠ 0
   (x³ − 6x² + 11x − 6 = 0) brachte {−1, −2, −3} statt {1, 2, 3}. Jetzt wird zentral einmal
   zurückgerechnet, mit Kommentar.
2. **Exakte Rastertreffer übersehen.** Nullstellen wurden nur über `previous * current < 0`
   erkannt. Trifft das Raster eine Wurzel exakt (f(−2) = 0, etwa bei x² − 4), ist das Produkt 0
   und damit nicht kleiner als 0 — die Nullstelle fehlte. Jetzt werden exakte Treffer gesondert
   erfasst.
3. **Suchbegriff-Rauschen.** „Ausbildung" in den Suchbegriffen macht „bild" zum Treffer für
   Gleichungslöser und Plotter (Teilwortsuche). Der vorhandene Test
   „keeps the catalogue order when scores are equal" hat es gemeldet; die Begriffe heißen jetzt
   „Berufsschule".
4. **Lesbare Formeln.** „x = y − B/3 = y − -2" und „x³ + (-6)x² + (11)x + (-6) = 0" waren formal
   richtig und schlecht zu lesen. Jetzt `shiftText` („y + 2") und `polynomialText`
   („x³ − 6x² + 11x − 6 = 0").

## Messwerte

| Größe | vorher (Welle 4) | jetzt |
| --- | --- | --- |
| Tests | 248 in 14 Dateien | **281 in 15 Dateien** |
| Katalog | 37 Werkzeuge / 89 Dateitypen | **40 Werkzeuge / 40 Icons / 89 Dateitypen** |
| Lizenzen | 522 Pakete | **522 Pakete** (function-plot samt Anhang wieder entfernt) |
| Startbündel | 216.392 B gzip | **226.708 B gzip** (Budget 250 KiB) |
| Rechenkern | 102.437 B | **102.437 B** (Gate 110 KiB) |
| Vorabladen | 56 Einträge | **62 Einträge (2363,60 KiB)** |

Der Katalog steht bei 2646 Suchbegriffen. **Das Startbündel ist um 10,3 kB gewachsen** — siehe
offene Punkte.

## Artefaktprüfung (Edge headless, Port 4174, Build aus dem Arbeitsbaum)

Skript `C:\hermes-team2\tmp\ct-verify\verify_welle5.py`; Service Worker umgangen, Vorab-Cache
deaktiviert.

- **Gleichungslöser, kubisch** x³ − 6x² + 11x − 6 = 0 → „x = 1 · x = 2 · x = 3",
  Δ = −0,037037037037, Probe „0 · 0 · 0"; sechs Schritte bis zur Cardano-Fallunterscheidung
  sichtbar (`casus irreducibilis`).
- **Statistik** „1 2 3 4 abc" → Anzahl 4, Summe 10, Mittelwert 2,5, Median 2,5, IQR 1,5,
  σ (Grundgesamtheit) 1,11803398875, s (Stichprobe) 1,29099444874, Varianzen 1,25 und
  1,66666666667, Ausreißergrenzen −0,5 und 5,5; gemeldet: „Nicht gelesen (übersprungen): abc".
- **Regression** (1,1) (2,3) (3,2) (4,5) (5,4) → Steigung 0,8, Achsenabschnitt 0,6,
  r = 0,8, r² = 0,64 (gegen Nachrechnung geprüft).
- **Plotter** „x^2 - 4" und „1/x" über −4…4 → SVG vorhanden, **3 Kurvenzüge** (x² − 4 in einem
  Zug, 1/x in zwei Ästen), 16 Achsenlinien, Nullstellen „x = −2" und „x = 2" — die Polstelle von
  1/x wird **nicht** als Nullstelle gemeldet; Wertetabelle mit 9 Zeilen.
- **Dunkel und schmal** (390 px): Thema wechselt, Zeichnung bleibt.

## Nicht geprüft

- Die Tastaturbedienung ist nicht im Artefakt durchgespielt (die Abnahme nennt sie). Die
  Formulare sind native `form`/`input`-Elemente mit Beschriftungen; ein automatisierter
  Tastaturlauf fehlt weiterhin (steht schon in den offenen Punkten).
- Rechengenauigkeit der kubischen Wurzeln jenseits der Proben: Cardano und die trigonometrische
  Form rechnen in Gleitkomma, danach poliert ein Newton-Schritt. Die Probe zeigt Beträge unter
  1e-6, eine Fehlerschranke über viele Gleichungen hinweg ist **nicht** gemessen.

## Commits

`Welle 5` — Code; dazu die Doku in einem zweiten Commit. Geteilte Dateien (`App.tsx`,
`manifests.ts`, generierter Katalog, `styles.css`, `vite.config.ts`, `tool-catalog.test.ts`) sind
mitgenommen, weil sie die parallele PDF-Arbeit bereits enthalten; deren Quelldateien
(`pdf/m5.ts`, `pdf/m8.ts`, `pdfUi.tsx`, PDF-Tests, PDF-Komponenten) sind **unangetastet** und
nicht committet.
