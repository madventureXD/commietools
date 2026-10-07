# Übergabe: Suite „Rechnen" — Welle 5 (Gleichungslöser, Statistik, Funktionsplotter)

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Team 2), auf Anweisung von Thomas
**Auftrag:** Thomas, 2026-10-04: „Welle 5 Go" — Fortsetzung der Rechner-Suite, parallel zur
PDF-Arbeit von ChatGPT
**Status:** abgeschlossen und im Artefakt geprüft — **Welle 5 ist abgenommen**

## Ziel der Sitzung

Werkzeug 7 „Gleichungslöser", Werkzeug 6 „Statistik" und Werkzeug 5 „Funktionsplotter" der Suite
„Rechnen" bauen — in drei Sprachen, mit Symbolen, Katalogeinträgen und Tests — und im Artefakt
belegen.

**Abnahmekriterien der Roadmap und ihr Beleg:**

| Abnahmekriterium | Beleg |
| --- | --- |
| Lineare, quadratische und kubische Gleichungen mit Lösungsweg | Sechs Schritte bis zur Cardano-Fallunterscheidung; im Browser x³ − 6x² + 11x − 6 = 0 → 1 · 2 · 3, Probe 0 · 0 · 0 |
| Statistik-Kennwerte gegen Nachrechnung | Browserlauf „1 2 3 4 abc" → Mittelwert 2,5 · IQR 1,5 · s 1,29099444874 · σ 1,11803398875; Regression y = 0,8x + 0,6, r² 0,64 — nachgerechnet |
| Plotter mit mehreren Kurven, Wertetabelle, Nullstellen | Zwei Kurven gleichzeitig, 3 Kurvenzüge, Nullstellen −2 und 2, Wertetabelle mit 9 Zeilen |
| Datenoptionen einzeln geprüft (`sampler`-Falle) | **Entfällt** — die Falle war eine Eigenschaft von `function-plot`, und die Engine trägt nicht (siehe unten) |
| Bedienung auch per Tastatur | **Nicht erfüllt** — nur native Formularelemente mit Beschriftungen, kein durchgespielter Tastaturlauf; offener Punkt |

## Ergebnis

Drei Werkzeuge, in drei Sprachen, mit Symbolen, Katalogeinträgen und Tests.

- **Gleichungslöser** (`equations`) — linear, quadratisch, kubisch. Eigene Formeln, kein
  Computeralgebra-System. Lösungsweg: Ausgangsgleichung, Normieren, Substitution, reduzierte Form,
  Diskriminante, Cardano-Fall, Rückweg, Probe; quadratisch zusätzlich mit Scheitelpunkt.
- **Statistik** (`statistics`) — Anzahl, Summe, Mittelwert, Median, Modus, Quartile (lineare
  Interpolation, wie in Tabellenkalkulationen), IQR, kleinster/größter Wert, Spannweite, Varianz
  und Standardabweichung **in beiden Bezugsarten** (n−1 und n), Ausreißergrenzen, Sortierung mit
  Rang; für Wertepaare Regression mit Steigung, Achsenabschnitt, Korrelation und Bestimmtheitsmaß.
- **Funktionsplotter** (`plotter`) — mehrere Funktionen gleichzeitig, Wertetabelle, berechnete
  Nullstellen, Achsen mit lesbaren Schritten, heller und dunkler Modus.

## Die eine Abweichung vom Konzept — mit Grund

Die Roadmap führte „zweite neue Engine: `function-plot` (MIT, ~64 KiB gzip)" und die
`sampler`-Falle als Prüfpunkt. **`function-plot` ist wieder entfernt.** Der Grund ist die
Lizenzprüfung, nicht der Aufwand:

```
function-plot → interval-arithmetic-eval → interval-arithmetic@1.1.3
License audit failed: interval-arithmetic uses unreviewed license expression BSL-1.0
```

`BSL-1.0` steht in der Projektpolitik weder in der Freigabe noch in der Prüfliste. Die
Lizenzordnung wird nicht nebenbei geändert, also trägt die Engine nicht — und damit erübrigt sich
die `sampler`-Falle, denn sie war eine Eigenschaft dieser Engine.

Stattdessen ein **eigener Zeichner** (`packages/tools/src/calculator/plotter.ts`): Er erzeugt reine
Geometrie (Kurvenzüge in Zeichenkoordinaten, Gitter, Beschriftungen, Nullstellen, Wertetabelle),
die Oberfläche setzt daraus SVG zusammen. Nebeneffekte, die willkommen sind:

- keine 64 KiB Engine, kein zusätzlicher Chunk, kein Vorablade-Thema;
- die Zeichnung ist **ohne Browser prüfbar**, weil nur Zahlen entstehen;
- Wertetabelle und Nullstellen rechnet derselbe Rechenkern (`calculator/core`) wie der Rechner —
  kein zweiter Ausdrucksauswerter, der anders rechnen könnte.

**Wenn `BSL-1.0` in die Politik aufgenommen werden soll** (eine einfache permissive Lizenz), ist
das eine Entscheidung am Lizenzgate — dann kann `function-plot` zurückkommen. Der eigene Zeichner
bleibt davon unabhängig lauffähig.

## Vier echte Fehler, gefunden und behoben

1. **Vorzeichen im kubischen Rückweg.** Die Kandidaten sind y-Werte der Normalform; der Rückweg
   `x = y − B/3` stand als `y + B/3` im Code. Der Fehler fiel **nicht** auf: Die Tests für Δ > 0
   und Δ = 0 hatten zufällig `B = 0` (Versatz 0), und die Probe prüft nur, ob der gefundene Wert
   eine Nullstelle ist — nicht, ob es die *richtige* ist. Erst der Fall mit Versatz
   (x³ − 6x² + 11x − 6 = 0) brachte {−1, −2, −3} statt {1, 2, 3}. Jetzt wird zentral **einmal**
   zurückgerechnet, mit Kommentar.
2. **Exakte Rastertreffer übersehen.** Nullstellen wurden nur über `previous * current < 0`
   erkannt. Trifft das Raster eine Wurzel exakt (f(−2) = 0, etwa bei x² − 4), ist das Produkt 0 und
   damit nicht kleiner als 0 — die Nullstelle fehlte. Jetzt werden exakte Treffer gesondert
   erfasst, und eine Polstellenprüfung hält `1/x` aus der Nullstellenliste heraus.
3. **Suchbegriff-Rauschen.** „Ausbildung" in den Suchbegriffen macht „bild" zum Treffer für
   Gleichungslöser und Plotter (Teilwortsuche). Der vorhandene Test „keeps the catalogue order when
   scores are equal" hat es gemeldet; die Begriffe heißen jetzt „Berufsschule".
4. **Lesbare Formeln.** „x = y − B/3 = y − -2" und „x³ + (-6)x² + (11)x + (-6) = 0" waren formal
   richtig und schlecht zu lesen. Jetzt `shiftText` („y + 2") und `polynomialText`
   („x³ − 6x² + 11x − 6 = 0").

## Geänderte Bereiche

- `packages/tools/src/calculator/equations.ts` — neu, Gleichungslöser (272 Zeilen)
- `packages/tools/src/calculator/statistics.ts` — neu, Kennwerte und Regression (197 Zeilen)
- `packages/tools/src/calculator/plotter.ts` — neu, eigener Zeichner (Geometrie, Wertetabelle,
  Nullstellen)
- `packages/tools/src/calculator/{equations,statistics,plotter}/locales/{de,en,es,index}.ts` — neu,
  je drei Sprachen
- `packages/tools/src/locales.ts` — neun Sprachkataloge registriert
- `packages/tools/package.json` — Exporte für die drei neuen Kernmodule
- `packages/tools/src/catalog/manifests.ts` — drei Werkzeuge, Suite-Werkzeugliste erweitert
- `packages/tools/src/catalog/toolIndex.ts` — erzeugt: 40 Werkzeuge / 3 Sprachen / 2646 Begriffe
- `apps/web/src/tools/{Equations,Statistics,Plotter}.tsx` — neu, Oberflächen
- `apps/web/src/math-tools.test.ts` — neu, 33 Tests für die drei Kerne
- `apps/web/public/tools/{equations,statistics,plotter}.svg` — neu, Symbole
- `apps/web/src/App.tsx`, `apps/web/src/styles.css` — Routen und Zeichenfläche (geteilte Dateien)
- `apps/web/vite.config.ts` — Plotter-Chunk wieder entfernt (mit der Engine entfiel er)

## Entscheidungen und Annahmen

- **Eigener Zeichner statt `function-plot`** — die mitgezogene `BSL-1.0`-Abhängigkeit trägt nicht,
  und die Lizenzordnung wird nicht nebenbei geändert.
- **Wertetabelle und Nullstellen über den Rechenkern**, nicht über einen zweiten Auswerter — sonst
  gäbe es zwei Rechenwege für denselben Ausdruck, die sich unterscheiden können.
- **Quartile nach linearer Interpolation** (Typ 7, wie `QUANTIL` in Tabellenkalkulationen) — es
  gibt mehrere übliche Verfahren, diese Wahl ist eine **Annahme** und steht im Werkzeug als solche
  beschriftet.
- **Varianz und Standardabweichung in beiden Bezugsarten** werden gezeigt statt eine auszuwählen —
  der häufigste Stolperstein beim Nachrechnen.
- **Kubische Wurzeln in Gleitkomma mit Newton-Polierung** statt exakt: Die Probe zeigt Beträge
  unter 1e-6, eine Fehlerschranke über viele Gleichungen ist **nicht** gemessen (siehe offene
  Punkte).

## Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| `npm run check` (Lizenz, Katalog, Typen, Tests) | bestanden — 522 Lizenzpakete, 40 Werkzeuge / 3 Sprachen / 40 Symbole / 89 Dateitypen, 281 Tests in 15 Dateien |
| `npm run build` | bestanden |
| `npm run bundle-audit` | bestanden — Startbündel 226.708 B gzip (Budget 250 KiB), Rechenkern 102.437 B (Gate 110 KiB) |
| Artefaktprüfung im Browser (Edge headless über CDP, Port 4174) | bestanden — `C:\hermes-team2\tmp\ct-verify\verify_welle5.py`, Service Worker und Vorabcache umgangen |
| Anzeige in dunkel und schmal (390 px) | bestanden |

Messwerte gegen die vorige Welle:

| Größe | Welle 4 | Welle 5 |
| --- | --- | --- |
| Tests | 248 in 14 Dateien | **281 in 15 Dateien** |
| Katalog | 37 Werkzeuge / 89 Dateitypen | **40 Werkzeuge / 40 Symbole / 2646 Begriffe / 89 Dateitypen** |
| Lizenzen | 522 Pakete | **522 Pakete** (function-plot samt Anhang wieder entfernt) |
| Startbündel | 216.392 B gzip | **226.708 B gzip** (+10,3 kB) |
| Rechenkern | 102.437 B | **102.437 B** |
| Vorabladen | 56 Einträge | **62 Einträge (2363,44 KiB)** |

## Offene Punkte und Risiken

- [ ] **Startbündel-Reserve schrumpft auf ~29 kB:** 191.327 → 206.547 → 226.708 B gzip. Eine
  weitere Welle dieser Größe reißt das Budget von 250 KiB. **Vor Welle 6 fällig:** Sprachdateien
  und/oder Register abgerufen mit Ladezustand statt im Startcode.
- [ ] **Tastaturbedienung nicht durchgespielt** — Teil der Welle-5-Abnahme und bislang offen.
- [ ] **Keine Fehlerschranke für die kubischen Wurzeln** — nur Einzelproben unter 1e-6.
- [ ] **`BSL-1.0` nicht bewertet** — Entscheidung liegt bei Thomas; bis dahin bleibt der eigene
  Zeichner.
- [ ] **`bundle:check` läuft nur von Hand** — ein Zuwachs fällt erst beim Nachmessen auf, nicht im
  Prüflauf.

## Empfohlener nächster Schritt

1. **Vor Welle 6 das Startbündel entspannen** (Sprachdateien und Register abgerufen, mit
   Ladezustand) — sonst reißt die nächste Welle das Budget.
2. Danach **Welle 6 (Aufmaß)**: Aufmaßzeilen und Positionen getrennt, eigener Speicherbereich,
   Ausgabe CSV/PDF/Text, sichtbare Rechenwege.
3. Nebenbei entscheiden, ob `BSL-1.0` in `licenses/policy.json` aufgenommen wird.

## Git

- Commits: `cb3045c` (Welle 5, Code) und `a8ee4b8` (Wortlaut und Doku) — **nicht gepusht**
- Geteilte Dateien (`App.tsx`, `manifests.ts`, generierter Katalog, `styles.css`, `vite.config.ts`,
  `tool-catalog.test.ts`) sind mitgenommen, weil sie die parallele PDF-Arbeit bereits enthalten;
  deren Quelldateien (`pdf/m5.ts`, `pdf/m8.ts`, `pdfUi.tsx`, PDF-Tests, PDF-Komponenten) sind
  **unangetastet** und nicht committet.

---

## Hinweis zur Fassung (2026-10-07)

Diese Übergabe wurde am 2026-10-04 im Commit `6e33dc3` **strukturell an die
Vorlage angeglichen** (Abschnitte umgestellt, Text verschoben); dabei wurden in dieser Datei
**80 Zeile(n) entfernt oder ersetzt** (127 hinzugefügt). Die Angleichung ist hier
**sachlich gekennzeichnet**, nicht bewertet, und es wird keine Absicht zugeschrieben.

Die Fassung **davor** ist unverändert abrufbar:
`git show 6e33dc3^:uebergabe/05-uebergaben/2026-10-04-rechner-welle5.md`. Die Git-Geschichte selbst ist
**nicht** verändert worden.

*Aufgenommen im Durchzug der QM-Stufe R8 (Karte M10-003). Ab dem 2026-10-07 gilt das
Aktenkorrekturverfahren in `00-einstieg/arbeitsregeln.md`, Abschnitt „Aktenkorrektur":
ergänzen statt umschreiben, datierter Nachtrag mit ersetzter Aussage, Grund, richtiger Aussage
und Beleg.*
