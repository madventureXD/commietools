# Konzept: Den Rechner in vier Werkzeuge aufteilen

**Datum:** 2026-10-04
**Verfasst von:** Faber (Hermes Agent)
**Status:** Vorschlag — nichts umgesetzt, nichts entschieden
**Auftrag (Thomas, 2026-10-04, Wortlaut):** „Ich möchte mit dir commietools.org bearbeiten
wir bschauen uns die Taschenrechner an. Aktuell sind standard, wissenschaftlich, Programmierer
und RPN noch in einem Rechner. Ich möchte sie gerne als 4 einzelne Tools. Das spezielle tool
zum speziellen Zweck. Auch checken ob durch die Vereinfachung Code wegfallen kann. Es sollte
die einzelnen Modelle nachher schlanker machen als das überholte gesamtmodell."

**Ausdrücklich nicht Teil dieses Auftrags:** die übrigen acht Werkzeuge der Suite
(Umrechnen, Kaufmännisch, Zeit und Datum, Plotter, Statistik, Gleichungen, Geometrie, Aufmaß).

---

## 1 · Ist-Stand (gezählt, 2026-10-04)

Ein Werkzeug `calculator` trägt vier Rechenarten; die Weiche ist eine Zustandsvariable
(`UiMode`), keine Trennung.

| Größe | Wert |
|---|---:|
| `apps/web/src/tools/Calculator.tsx` | 1.021 Zeilen |
| `apps/web/src/calculator-ui.ts` (Bedienhelfer) | 70 Zeilen |
| `packages/tools/src/calculator/keypad.ts` (reine Daten) | 359 Zeilen |
| `packages/tools/src/calculator/core.ts` (mathjs-Ladegrenze) | 449 Zeilen |
| Sprachschlüssel Deutsch (eine Datei, drei Sprachen parallel) | 95 Schlüssel |
| Stellen mit Modusweiche in der Oberfläche | 29 |
| Felder im gespeicherten Einstellungsdatensatz | 7 (u. a. `mode`) |
| Verlauf und Variablen | **einer für alle vier Modi** |

Die Gruppierung „Standard, wissenschaftlich, Programmierer, RPN = **ein** Werkzeug mit
umschaltbaren Modi" steht im Konzept `2026-10-03-taschenrechner-suite.md` (Gruppe 1). Sie war
dort als **Vorschlag** gekennzeichnet, nie als Entscheidung — dieser Vorschlag kehrt sie um,
ohne einen Beschluss zu brechen.

## 2 · Die Messung, die die Frage entscheidet: **der Rechenkern schrumpft nicht**

Gemessen mit dem projecteigenen `mathjs` 15.2.0 (`node_modules`), esbuild `--bundle --minify
--format=esm`, gzip -9 (zlib), Node 22.23.2. Je Rechenart ein eigenständiges Bündel — also die
Frage „was kostet **diese** Route allein". Skript: `work/rechner-mathjs-messung.mjs`.

| Variante | Factories | roh B | gzip B | gzip KiB |
|---|---:|---:|---:|---:|
| **heute (kuratierte Liste aus `functions.ts`)** | 59 | 364.637 | 103.056 | **100,6** |
| Standard | 26 | 334.415 | 95.363 | **93,1** |
| Wissenschaftlich | 52 | 353.679 | 101.005 | **98,6** |
| Programmierer | 33 | 345.373 | 97.536 | **95,3** |
| RPN | 28 | 337.882 | 96.917 | **94,6** |

**Befund 1 — `mathjs` hat einen Sockel.** Sechsundzwanzig Factories kosten 93,1 KiB, neunund-
fünfzig kosten 100,6 KiB. Der ganze Funktionsumfang der vier Rechenarten wiegt also rund
**7,5 KiB gzip (7 %)**. Der Parser, `decimal.js`, `fraction.js` und die Typmaschinerie sind der
Sockel und bleiben in jedem Fall.

**Befund 2 — geteilt ist der Kern teurer als getrennt.** Bleibt die Engine ein gemeinsames
Modul (heute so), trägt jede Route die **Vereinigung** aller Factories — also den heutigen
Stand, 0 KiB gespart. Gibt man jeder Route ihre eigene Kopie, spart nur der Standardrechner
etwas (7,5 KiB) und ein Nutzer, der zwei Rechner öffnet, lädt 93 KiB **zweimal**.

**Folgerung:** Der Rechenkern bleibt gemeinsam. Nicht weil die Zahl klein wäre, sondern weil
eine zweite Kopie 93 KiB verdoppelt, um 7 % zu sparen. **Die Vereinfachung kann nicht aus der
Engine kommen.**

**Gegenprobe und offener Widerspruch:** Dieselbe Liste aus `functions.ts` nachgemessen ergibt
364.637 B roh / 100,6 KiB gzip — **ADR 0005 nennt 89,5 KiB**. Zielumgebung (`esnext`, `es2020`,
`chrome120`) und Werkzeugliste sind als Ursache ausgeschlossen (identische Byte-Größe). Die
Abweichung von **11,1 KiB** ist damit unerklärt; sie ist hier benannt statt geglättet und
gehört nachgeprüft, weil die Zahl im Projekt zitiert wird.

## 3 · Wo die Vereinfachung wirklich greift

Der Gewinn liegt in der **Oberfläche, den Einstellungen, den Texten und dem Speicher** — und
er entsteht **nur**, wenn der gemeinsame Rahmen ein gemeinsamer Baustein wird.

### Fällt weg (in allen vier Rechenarten)

- die **Modusweiche** selbst: 29 Stellen, die Konstantenliste `MODES`, `switchMode`, das Feld
  `mode` in Einstellungen, Speicherschema und Typprüfung.
- rund **143 Zeilen modusspezifisches JSX** und rund **45 Zeilen modusabhängige Logik**
  (Aufteilen von `Calculator.tsx`).
- in der Einzelansicht: jede Verzweigung `mode === '…'` in Anzeige, Eingabezeile, Ampel,
  Tastenfreigabe und Verlaufsübernahme.

### Fällt je Werkzeug zusätzlich weg

| Werkzeug | fällt weg |
|---|---|
| Standard | Winkelmodus, Basis/Wortbreite/Vorzeichen, Darstellungstafel, Stapelgriffe, Hex-Ziffernpfad, RPN-Stapel |
| Wissenschaftlich | Basis/Wortbreite/Vorzeichen, Darstellungstafel, Hex-Ziffernpfad, Stapelgriffe, RPN-Stapel |
| Programmierer | Winkelmodus, **Zahlenmodell-Umschalter** (ein Bruch hat in Hex keinen Sinn), Bruch-Rückfall (`retryDecimal`), Genauigkeitsampel außerhalb DEC, Stapelgriffe, RPN-Stapel |
| RPN | Winkelmodus, Basis/Wortbreite, Darstellungstafel, Genauigkeitsampel (7 Schlüssel), Bruch-Rückfall, RPN-Stapel ist nicht „Zusatz" sondern der Kern |

Dazu die reinen Daten: `keypad.ts` trägt heute **alle vier** Tastenfelder und das Blatt `⋯`
(rund 130 der 359 Zeilen); je Werkzeug bleibt sein eigenes Feld.

### Texte

Heute **95 Schlüssel je Sprache**, alle in einer Datei. Ein Einzelrechner braucht gemessen an
der Schlüsselzuordnung etwa **45–60 eigene Schlüssel** — sein Sprachpaket ist damit rund
**halb so groß** wie das Gesamtmodell. Der **Rahmen** (Titel, Kurzbeschreibung, Begriffe,
Ausdruck, Ergebnis, Verlauf, Variablen, Fehlerklassen, Kopieren, Formel-und-Quelle) ist für
alle vier gleich und gehört in den vorhandenen gemeinsamen Block
(`packages/tools/src/calculator/common/locales/`, heute 15 Zeilen je Sprache).

**Ohne diesen gemeinsamen Block wächst die Summe** — viermal derselbe Rahmen ist ehrlich
gerechnet etwa doppelt so viel Text wie heute. Das ist die Bedingung, unter der „schlanker"
überhaupt zutrifft.

### Die harte Bedingung

`Calculator.tsx` ist zu rund drei Vierteln **Rahmen** (Anzeige in zwei Zuständen, Tastenfeld-
Ausgabe, Kopieren, Ergebnis, Verlauf, Variablen, Formel-und-Quelle, Laden und Speichern).
Vier Werkzeuge, die ihn jeweils abschreiben, ergeben statt 1.021 Zeilen rund 3.000 — **mehr**
Code, nicht weniger. Der Rahmen wird deshalb **einmal** als gemeinsamer Baustein gebaut
(`apps/web/src/calculator-frame.tsx` o. ä.) und je Werkzeug nur noch belegt: Tastenfeld,
Einstellungen, Texte, Kennungen, Rechenweg. Steht das, bleibt je Werkzeug eine Oberfläche von
schätzungsweise **120–180 Zeilen** gegenüber 1.021 heute.

## 4 · Vorschlag: vier Werkzeuge

| Werkzeug-ID | Route | Umfang | eigenes Tastenfeld | eigene Einstellungen |
|---|---|---|---|---|
| `calculator` (bleibt Standard) | `/tools/calculator` | Grundrechenarten, Prozent, Vorzeichen | 4 × 5 | Zahlenmodell, Darstellung |
| `scientific` | `/tools/scientific` | Funktionen, `2nd`-Ebene, Blatt `⋯` | 5 × 8 | Zahlenmodell, Darstellung, **Winkelmodus** |
| `programmer` | `/tools/programmer` | Basen, Bitoperationen, Wortbreite, Darstellungstafel | 6 × 6 | Anzeige-Basis, Wortbreite, Vorzeichen, Darstellung |
| `rpn` | `/tools/rpn` | umgekehrte polnische Notation, Stapel, Stapelgriffe | 5 × 7 | Darstellung |

- **`/tools/calculator` bleibt die Standard-Route** — bestehende Links und Verweise brechen
  dann nicht. Die drei neuen Werkzeuge bekommen eigene Kennungen, eigene Symbole
  (`apps/web/public/tools/<id>.svg`), eigene `summary` und `terms` in drei Sprachen.
- Alle vier bleiben in der Suite **„Rechnen"**; die Reihenfolge der Suite wird festgelegt.
- **Verlauf, Variablen und Einstellungen je Werkzeug** (Vorschlag, siehe Entscheidungen) —
  jeder Rechner hat seinen eigenen Verlaufsschlüssel; der heutige Bestand bleibt liegen und
  wird **nicht** stillschweigend gelöscht (Löschen ist im Projekt sichtbar und vollständig).
- **Kein zweiter Rechenkern, keine neue Abhängigkeit, keine zusätzliche Ebene.**

## 5 · Was wächst (ehrlich benannt)

- **Drei neue Manifeste je drei Sprachen** (Titel, Beschreibung, Kurzbeschreibung, Begriffe)
  und drei Symbole. Die Werkzeugtexte Deutsch liegen **heute schon bei 32.080 von 30.720 Byte
  über der Warnschwelle**. Mit dieser Welle wird die vorgesehene **Aufteilung der
  Werkzeugtexte je Sprache** fällig — oder die Überschreitung muss erneut begründet werden.
- **Werkzeugregister:** vier Einträge statt einem je Sprache. Das Register liegt im
  Hauptbundle; nach der Welle ist die Startgröße neu zu messen.
- **Katalog- und Suchprüfungen** halten feste Werkzeuglisten und brechen absichtlich. Vor dem
  Nachführen ist je Treffer zu klären, **worüber** er kommt (Kategorie, Dateityp, Teilkette)
  — blindes Erweitern verdeckt eine echte Regression.
- **Tests:** heute drei Dateien für den Rechner (`calculator-core` 331, `calculator-keypad`
  415, `calculator-ampel` 109 Zeilen). Je Werkzeug kleinere Dateien; die Gesamtzahl der
  Testzeilen wächst, weil jeder Aufruftest seine eigene Liste braucht.
- **Der Arbeitsbaum trägt fremde Änderungen** (`COPYRIGHT`, `LICENSE`, uncommittet). Sie
  werden nicht angefasst; es wird selektiv mit expliziten Pfaden gestagt.

## 6 · Aufwand (Schätzung nach Referenzklasse)

Referenzklasse: **Welle A „Handwerk"** — vier Werkzeuge samt Suite, zwei Commits, eine
Sitzung. Dazu kommt hier der Umbau der vorhandenen Oberfläche in Rahmen plus vier Werkzeuge.

| Schritt | Schätzung |
|---|---|
| Rahmen auskoppeln, vier Werkzeugoberflächen, Tastenfelder, Texte, Manifeste, Symbole, Katalog | 2–3 h |
| Tests und Katalog-/Suchprüfungen nachführen, `npm run check` + `npm run build` | ~1 h |
| Browserbeleg über vier Routen (Edge headless, zwei Fensterbreiten) | ~1 h |
| Doku: `aktueller-stand.md`, Fortschrittsprotokoll, Übergabe, Suite-Konzept-Nachtrag | ~0,5 h |
| **Gesamt** | **4–5 h, zwei Sitzungen** |

Kein GPU-Job, kein Datenverlustrisiko: die Arbeit ist additiv für den Katalog und ein Umbau
genau einer Oberflächendatei. Rücknahme durch Verwerfen der neuen Dateien und
Wiederherstellen von `Calculator.tsx`.

## 7 · Abnahmekriterium (Vorschlag, prüfbar)

1. Vier Routen erreichbar; **kein Treffer `mode ===`** in den vier Werkzeugoberflächen.
2. **Jedes Werkzeug bringt höchstens 60 eigene Sprachschlüssel**; der Rahmen liegt genau
   einmal im gemeinsamen Block (Zählung im Prüfbericht).
3. **Je Werkzeug** ist eine Rechnung samt Verlauf im Browser ausgeführt und der gelesene Wert
   gegen eine unabhängig gerechnete Erwartung geprüft — bei zwei Fensterbreiten.
4. `npm run check` und `npm run build` grün; Katalog regeneriert; Startbudget gemessen und
   gegenüber heute unverändert (Engine bleibt gemeinsam).
5. Jeder angebotene Funktionsname steht in der Aufruftest-Liste des jeweiligen Werkzeugs.
6. Werkzeugtexte je Sprache gemessen, Schwellenlage im Bericht benannt.
7. Übergabe nach Vorlage geschrieben; **alle** Rechner-Übergaben desselben Vorhabens auf
   fehlende Pflichtabschnitte mitgeprüft.

## 8 · Entscheidungen, die dieses Konzept braucht

1. **Verlauf, Variablen und Einstellungen: je Werkzeug oder gemeinsam?** Vorschlag: je
   Werkzeug („das spezielle Werkzeug zum speziellen Zweck"), der heutige Bestand bleibt
   liegen.
2. **Bekommt der Standardrechner das Blatt `⋯`** (abs, round, min, max …)? Heute hat er es
   nicht; als eigener Rechner wäre er der einzige ohne. Vorschlag: ja.
3. **Rechenkern gemeinsam lassen?** Vorschlag: ja — gemessen (Abschnitt 2).
4. **Genauigkeitsampel:** Standard und Wissenschaftlich ja, Programmierer nur in DEC, RPN
   nein — wie heute. Bestätigen?
5. **RPN verhält sich unverändert** (getippte Zeichenkette statt echtem Stapel)? Die offene
   Frage B1 aus `2026-10-04-rechner-oberflaeche` bleibt damit offen. Vorschlag: ja.
6. **`/tools/calculator` bleibt die Route des Standardrechners?** Vorschlag: ja.
7. **Reihenfolge der vier Werkzeuge in der Suite „Rechnen"** festlegen.

## 9 · Nachweise

- Messskript: `work/rechner-mathjs-messung.mjs` (nicht versioniert, `work/` ist ignoriert).
- Messumgebung: Node 22.23.2, esbuild aus `node_modules` des Projekts, `mathjs` 15.2.0,
  gzip -9 (zlib), 2026-10-04, 22:1x Uhr.
- `packages/tools/src/calculator/functions.ts` (kuratierte Factories), ADR 0005.
- Vorherige Konzepte: `2026-10-03-taschenrechner-suite.md` (Gruppierung, OSS-Lage),
  `2026-10-04-rechner-oberflaeche.md` (Tastenfeld, offene Bedienfragen).

## Nachtrag 2026-10-04, Faber: Thomas entscheidet gegen die Textschwelle — Trennung bleibt

Auf die Meldung „die Werkzeugtexte liegen heute schon über der Warnschwelle und drei neue
Manifeste verschärfen das" hat Thomas geantwortet:

> „Ich weiß, tooltexte liegen an der warnschwelle, trotzdem trennen."

**Festgehalten als Entscheidung:** Die Aufteilung in vier Werkzeuge wird **nicht** wegen der
Textschwelle verschoben oder abgeschwächt. Der Wortlaut oben bleibt stehen.

**Folge, unverändert gültig und nicht weggeredet:** Die Warnschwelle für die Werkzeugtexte je
Sprache (30.720 Byte; Deutsch heute 32.080) wird mit dieser Welle weiter überschritten. Eine
Überschreitung ist eine **Warnung, kein Bauabbruch** — sie muss im Bericht begründet werden
und ist begründet: der Zweck „ein Werkzeug je Rechenart" wiegt schwerer als die Schwelle, und
die vorgesehene Aufteilung der Werkzeugtexte je Sprache bleibt der Weg, sie später wieder zu
unterlaufen. Sie wird damit nur nicht zur Vorbedingung dieser Welle.

**Weiterhin offen:** die sieben Entscheidungen aus Abschnitt 8 — insbesondere Verlauf je
Werkzeug, das Blatt `⋯` im Standardrechner, die Engine-Frage und die Route des
Standardrechners. **Ausgeführt wird erst auf ausdrückliches Go.**

## Nachtrag 2026-10-04 (zweiter), Faber: Thomas' sieben Entscheidungen — das Konzept ist angenommen

Auf die sieben Fragen aus Abschnitt 8, in einem Zug beantwortet:

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Verlauf, Variablen, Einstellungen | **je Werkzeug** — eigener Speicherbereich, der heutige Bestand bleibt liegen und wird nicht stillschweigend gelöscht |
| 2 | Blatt `⋯` im Standardrechner | **ja** — der Standardrechner bekommt es |
| 3 | Rechenkern | **gemeinsam** (ein Modul, eine Ladung; die gemessenen 7,5 KiB sind die Verdopplung nicht wert) |
| 4 | Genauigkeitsampel | **ja** — Standard und Wissenschaftlich, im Programmierer nur in DEC, im RPN keine (wie heute) |
| 5 | RPN | **unverändert** — getippte Zeichenkette, kein echter Stapel; die offene Frage B1 bleibt offen |
| 6 | Route des Standardrechners | **`/tools/calculator` bleibt** |
| 7 | Reihenfolge in der Suite | von Faber entschieden: **Standard, Wissenschaftlich, Programmierer, RPN** (wachsender Umfang, deckt sich mit der bisherigen Reihenfolge der Rechenarten) |

**Damit ist das Konzept angenommen; die Umsetzung wartet auf das Go.** Das Abnahmekriterium
ist Abschnitt 7 dieses Dokuments. Thomas' Handlungsanweisungen kommen Stück für Stück.

## Nachtrag 2026-10-04 (dritter), Faber: umgesetzt — und was dabei anders kam als geplant

Das Go kam am 2026-10-04 („Go"). Die Umsetzung ist abgeschlossen, festgehalten als **ADR 0009**;
Übergabe und Belege: `05-uebergaben/2026-10-04-rechner-vier-werkzeuge.md`,
`07-pruefung/rechner-vier-werkzeuge/`. Der Wortlaut oben bleibt stehen, hier nur, was abweicht oder
sich beim Bauen genauer gezeigt hat.

### Was das Abnahmekriterium (Abschnitt 7) ergeben hat

| Kriterium | Ergebnis |
|---|---|
| 1 · vier Routen, kein `mode ===` in den Werkzeugoberflächen | erfüllt — `grep -c "mode ===\|mode !==\|UiMode"` ergibt 0 in allen vier Dateien **und** im Rahmen |
| 2 · höchstens 60 eigene Sprachschlüssel je Werkzeug, Rahmen einmal | erfüllt — 5 / 9 / 11 / 13 gegen 95 im Gesamtmodell; Rahmen 65 Schlüssel einmal |
| 3 · je Werkzeug Rechnung und Verlauf im Browser geprüft, zwei Fensterbreiten | erfüllt — 8 Proben, jeder Wert aus dem DOM zurückgelesen |
| 4 · `check` + `build` grün, Katalog regeneriert, Startgröße gemessen | erfüllt — Startgröße **+9,3 kB gzip** (146.220 von 204.800), Engine geteilt und unverändert |
| 5 · Funktionsnamen im Aufruftest | erfüllt — `keypadFunctionNames(ALL_KEYPADS)` gegen die kuratierten Factories |
| 6 · Werkzeugtexte je Sprache gemessen und Lage benannt | erfüllt — Deutsch 32.672, Spanisch 31.645, Englisch 29.787 (Warnschwelle 30.720) |
| 7 · Übergabe nach Vorlage, alte Rechner-Übergaben mitgeprüft | erfüllt — die neue Übergabe hat alle Pflichtabschnitte; die Prüfung lief über **alle** Rechner-Übergaben und fand in zwei älteren Fällen fehlende Pflicht**überschriften** (Inhalt vorhanden, steht unter anderen Überschriften); datiert in `01-stand/offene-punkte.md` vermerkt |

### Zwei Abweichungen, die nicht im Konzept standen

1. **Der Standardrechner bekam `(` und `)`, nicht nur das Blatt.** Entscheidung 2 („Blatt `⋯` auch
   im Standardrechner") machte eine sechste Tastenreihe nötig; in deren freie Zellen kamen die
   Klammern — der Rechenkern konnte sie immer schon lesen, sie hatten nur keine Taste. Damit fehlt
   keine Zelle und es gibt keine Lücke im Raster. **Zurücknehmbar**, wenn Thomas das Feld schlanker
   will.
2. **Die Kennzeichen am Ergebnis heißen jetzt „DEZ"/„BRUCH".** Vorher stand dort der volle Text
   („Dezimal (14 Stellen angezeigt)"/„Bruch (exakt)"); im ersten Belegbild sprengte er die
   Kennzeichenzeile auf schmaler Breite. Zwei Schlüssel `tool.calc.numberShort*` kamen hinzu.

### Eine Annahme, die erfragt gehört hätte

Der **RPN-Rechner hat keinen Zahlenmodell-Umschalter** mehr: der alte Gesamtrechner bot im
RPN-Modus auch „Bruch (exakt)" an. Die Stapelrechnung läuft jetzt im Dezimalmodell. Das war nicht
Gegenstand der sieben Entscheidungen; es ist in der Übergabe als Abweichung benannt. Soll der
RPN-Rechner den Umschalter zurückbekommen, ist es eine Zeile im `CalculatorFrameSpec`.

### Was die Messung aus Abschnitt 2 bestätigt hat

Der Rechenkern blieb **ein** Modul; die Route lädt unverändert die Vereinigung aller Factories
(Engine-Chunk 103.708 Byte im Bau). Die ausgelieferte Startgröße wuchs ausschließlich durch die
**drei zusätzlichen Katalogeinträge je Sprache** (+9,3 kB gzip) — nicht durch die Rechenarten.