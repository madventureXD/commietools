# Übergabe: Der Rechner wird vier Werkzeuge (ADR 0009)

**Datum:** 2026-10-04  
**Bearbeitet durch:** Faber (Hermes Agent)  
**Status:** abgeschlossen  
**Auftrag:** Thomas, 2026-10-04: „Aktuell sind standard, wissenschaftlich, Programmierer und RPN noch in einem Rechner. Ich möchte sie gerne als 4 einzelne Tools. Das spezielle tool zum speziellen Zweck. Auch checken ob durch die Vereinfachung Code wegfallen kann. Es sollte die einzelnen Modelle nachher schlanker machen als das überholte gesamtmodell." — Konzept vorher, Go am 2026-10-04 nach sieben beantworteten Entscheidungen.

## Ziel der Sitzung

Vier Werkzeuge statt eines, jedes schlanker als das Gesamtmodell, mit gemeinsamem Rahmen; die
Engine-Frage vorher messen statt annehmen.

## Ergebnis

**Umgesetzt und belegt.** Aus einem Werkzeug mit vier umschaltbaren Rechenarten sind vier
Werkzeuge geworden, die einen gemeinsamen Rahmen teilen:

| Werkzeug | Route | eigene Zeilen | eigene Schlüssel (de) | eigenes Tastenfeld |
|---|---|---:|---:|---|
| Rechner (Standard) | `/tools/calculator` | 31 | 5 | 4 × 6, mit `⋯`, `(` `)` |
| Wissenschaftlicher Rechner | `/tools/scientific-calculator` | 52 | 9 | 5 × 8, mit `2nd` |
| Programmiererrechner | `/tools/programmer-calculator` | 150 | 11 | 6 × 6 |
| RPN-Rechner | `/tools/rpn-calculator` | 31 | 13 | 5 × 7, mit SWAP/DROP |

Gegenüber dem alten Gesamtmodell: **1.021 Zeilen und 95 Schlüssel in einem Werkzeug** stehen jetzt
**264 Zeilen und 38 Schlüssel in vier Werkzeugen**; der gemeinsame Rahmen (854 Zeilen) und der
gemeinsame Textblock (65 Schlüssel) liegen **einmal**.

**Was durch die Vereinfachung wegfiel** (gemessen, nicht behauptet):

- **29 Stellen Rechenart-Verzweigung** in der Oberfläche, die Konstantenliste `MODES`,
  `switchMode`, das Feld `mode` im Einstellungs- und Speicherschema und der Typ `UiMode` — alle
  ersatzlos. `grep -c "mode ===\|mode !==\|UiMode"` ergibt **0** in allen vier Werkzeugdateien und
  im Rahmen.
- **Je Rechenart eigene Einstellungen** statt eines gemeinsamen Datensatzes: der Standardrechner
  kennt keinen Winkelmodus und keine Basis, der Programmiererrechner kein Zahlenmodell, der
  RPN-Rechner gar keinen Umschalter.
- **Je Rechenart ein eigener Verlauf** (`calculator.<rechenart>.*`) — die Vermischung aller vier
  Rechenarten in einer Verlaufsliste ist beendet.
- **Der Rechenkern schrumpft nicht.** Gemessen vor der Umsetzung: 93,1 KiB gzip (nur Standard) bis
  100,6 KiB (alle vier) — der Sockel von `mathjs` bleibt. Die Engine bleibt deshalb **ein** Modul.
  Diese Zahl steht im Konzept und im ADR, damit sie nicht als offenes Versprechen weiterläuft.

**Beleg am Artefakt:** acht Proben über vier Routen und zwei Fensterbreiten (1360 px, 390 px), jede
Rechnung im Browser ausgeführt, der Wert **aus dem DOM zurückgelesen** und gegen eine von Hand
hergeleitete Erwartung geprüft: `1/3+1/6 = 0,5` · `sin(30°) = 0,5` · `255 → 0xff`, `0b11111111`,
int8 `−1` · `3 4 + 5 * = 35`. Zusätzlich geprüft: auf **keiner** Route steht noch eine
Rechnerart-Umschaltleiste. Bilder und Protokoll: `07-pruefung/rechner-vier-werkzeuge/`.

## Geänderte Bereiche

- `packages/tools/src/calculator/keypad.ts` – nur noch gemeinsame Bausteine (Typen, `SYMBOLS`,
  Hilfsfunktionen, `SHEET_GROUPS`); die vier Belegungen liegen jetzt in `keypads/`.
- `packages/tools/src/calculator/keypads/{standard,scientific,programmer,rpn}.ts` – **neu**, je ein
  Tastenfeld; `keypads/index.ts` sammelt sie nur für Prüfungen.
- `packages/tools/src/calculator/history.ts` – `calculatorStore(kennung, vorgaben)` statt fester
  Schlüssel; Feld `mode` entfallen; die alten Schlüssel sind als `RETIRED_STORE_KEYS` benannt.
- `packages/tools/src/calculator/shell/locales/{de,en,es,index}.ts` – **neu**, die 65 Texte des
  Rahmens unter `tool.calc.*`.
- `packages/tools/src/calculator/scientific|programmer|rpn/locales/*` – **neu**, die Texte der drei
  neuen Werkzeuge in drei Sprachen.
- `packages/tools/src/calculator/locales/*` – die Texte des Standardrechners (Titel, Beschreibung,
  Kurztext, Suchbegriffe, Rechenregeln).
- `packages/tools/src/catalog/manifests.ts` – drei Manifeste, Suite „Rechnen" mit vier
  Rechner-IDs (Reihenfolge nach Umfang).
- `packages/tools/src/locales.ts` – vier neue Textkataloge eingetragen.
- `packages/tools/package.json` – fünf neue Unterpfade (`calculator/keypads`, `…/standard`,
  `…/scientific`, `…/programmer`, `…/rpn`).
- `apps/web/src/tools/calculator-frame.tsx` – **neu**, der gemeinsame Rahmen (854 Zeilen).
- `apps/web/src/tools/Calculator.tsx` – auf die Deklaration des Standardrechners verkürzt
  (1.021 → 31 Zeilen).
- `apps/web/src/tools/{ScientificCalculator,ProgrammerCalculator,RpnCalculator}.tsx` – **neu**.
- `apps/web/src/App.tsx` – drei Routen und drei `lazy`-Importe.
- `apps/web/src/calculator-keypad.test.ts` – auf die vier Felder umgestellt, neuer Test für das
  Standardfeld; `calculator-ampel.test.ts`, `calculator-core.test.ts` – Schlüssel des Rahmens.
- `apps/web/src/calculator-split.test.ts` – **neu**, hält die Trennung fest (Rahmen einmal,
  Schlüsselgrenze je Werkzeug, kein `mode` mehr).
- `apps/web/public/tools/{scientific-calculator,programmer-calculator,rpn-calculator}.svg` – neu.
- `packages/tools/src/catalog/generated/*`, `toolIndex.ts` – erzeugt (`npm run catalog:generate`).
- `uebergabe/04-entscheidungen/0009-ein-werkzeug-je-rechenart.md` und ADR-Index,
  `03-konzepte/2026-10-04-rechner-aufteilen.md` (datiert ergänzt), dieses Protokoll und diese
  Übergabe, `01-stand/aktueller-stand.md`, `01-stand/offene-punkte.md`.
- `work/rechner-mathjs-messung.mjs`, `work/rechner-vier-werkzeuge-beleg.cjs` – Mess- und
  Belegskripte (**nicht versioniert**, `work/` ist ignoriert).

## Entscheidungen und Annahmen

- **ADR 0009**: vier Werkzeuge, gemeinsamer Rahmen, eigenes Tastenfeld je Rechenart, eigener
  Speicher je Rechenart, Rechenart kein Zustand mehr, Rahmentexte einmal.
- Thomas' sieben Entscheidungen: Verlauf/ Variablen/ Einstellungen **je Werkzeug**; Blatt `⋯` auch
  im Standardrechner; Rechenkern **gemeinsam**; Ampel wie bisher (im Programmiererrechner nur in
  Basis 10, im RPN gar nicht); RPN **unverändert** (getippte Tokenfolge, kein echter Stapel);
  `/tools/calculator` bleibt der Standardrechner; Reihenfolge von Faber festgelegt.
- **Annahme (nicht erfragt):** die neue Werkzeugkennung `calculator.standard` für den Speicher,
  damit der alte gemeinsame Verlauf nicht als Verlauf einer einzelnen Rechenart weitergilt.
- **Abweichung, bewusst:** der Standardrechner bekam auf Entscheidung das Blatt `⋯`. Weil die
  sechste Reihe damit eine Lücke gehabt hätte, stehen dort zusätzlich `(` und `)` — der Rechenkern
  konnte sie immer schon lesen, sie hatten nur keine Taste. Datiert festgehalten in
  `03-konzepte/2026-10-04-rechner-aufteilen.md`; **zurücknehmbar**, wenn Thomas das nicht will.
- **Abweichung, ungeplant:** im Rahmen zeigen die Kennzeichen am Ergebnis „DEZ"/„BRUCH" statt
  vorher „Dezimal (14 Stellen angezeigt)"/„Bruch (exakt)" — die langen Beschriftungen hätten die
  Kennzeichenzeile gesprengt. Zwei neue Schlüssel (`tool.calc.numberShort*`).

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Lizenz, Katalog, Typen, Tests) | **grün** — 48 Werkzeuge, 3 Sprachen, 48 Symbole; 380 Tests in 23 Dateien |
| `npm run build` | **grün** — Start-JS 146.220 B gzip von 204.800; Bundle-Prüfung grün (19 PDF-Artefakte, Engine-Chunk `core-*.js` 103.709 B) |
| `npm run lint` | grün (keine Meldung) |
| `npm run viewport:check` (Vorschau) | **grün** — vier Rechner-Routen bei 320 px geprüft, anschließend **Gesamtlauf über alle 48 Routen bei 320 px: bestanden** |
| `git diff --check` | grün (nur die bekannten Zeilenende-Hinweise) |
| Browserbeleg, 4 Routen × 1360/390 px | **grün** — 8 Proben, alle Werte zurückgelesen; keine Rechnerart-Umschaltleiste mehr |
| Bilder gesichtet (Standard 390 px, Programmierer 1360 px, RPN 390 px) | in Ordnung — kein Überlauf, Stapel/Rechenweg und Darstellungstafel vollständig |

**Nicht geprüft (ehrlich benannt):**

- **200 % Zoom und Screenreader-Namen** für die vier Rechner — nicht in diesem Durchlauf.
- **Spanische Texte** nur auf Schlüsselgleichheit geprüft (Test), nicht sprachlich gegelesen; der
  Status des spanischen Pakets ist unverändert „lokales Testpaket".
- **Firefox/Safari** — auf diesem Rechner nicht verfügbar, geprüft wurde Edge.
- **Der alte Verlaufsbereich `calculator.*`** liegt noch im Gerät: gewollt (nichts wird
  stillschweigend gelöscht), aber es gibt **keine Anzeige und keinen Löschweg** dafür. Bewusst
  offen gelassen.
- Die Abweichung **ADR 0005 (89,5 KiB gzip) gegen die Nachmessung (100,6 KiB gzip)** bei identischer
  Factory-Liste ist **nicht** erklärt; als offener Punkt geführt.

## Offene Punkte und Risiken

- [ ] **Werkzeugtexte weiter über der Warnschwelle:** Deutsch 32.672 B, Spanisch 31.645 B (Schwelle
      30.720 B). Die Aufteilung der Werkzeugtexte je Sprache bleibt der vorgesehene Ausweg.
- [ ] **Start-JavaScript +9.259 B** durch drei zusätzliche Katalogeinträge je Sprache — gewollt,
      aber im Blick zu behalten (146.220 von 204.800 B).
- [ ] **RPN ohne Zahlenmodell-Umschalter:** der alte Gesamtrechner bot im RPN-Modus auch „Bruch
      (exakt)". Der RPN-Rechner rechnet jetzt im Dezimalmodell. Nicht eigens entschieden —
      mitgeteilt, damit es nicht als Versehen durchgeht.
- [ ] **Rekonstruierbarkeit der Teile:** `Calculator.tsx` wurde inhaltlich ersetzt; die alte Fassung
      liegt in der Git-Historie (`4a9f872`), nicht mehr im Baum.
- [ ] Kein Push erfolgt (Cloudflare-Bereitstellung); Veröffentlichung nur auf Auftrag.

## Empfohlener nächster Schritt

1. Thomas die beiden Abweichungen vorlegen (Klammern im Standardfeld, kurze DEZ/BRUCH-Kennzeichen)
   und entscheiden lassen.
2. Danach die Werkzeugtexte je Sprache aufteilen — sie sind die einzige Kennzahl, die in dieser
   Welle schlechter wurde.
3. Die fehlenden Pflichtüberschriften der beiden älteren Rechner-Übergaben ergänzen (Inhalt ist
   vorhanden, steht nur unter anderen Überschriften — siehe offene Punkte).

## Git

- Commit: **`d26e18a`** — `feat(calculator): split the calculator into four tools on one shared
  frame`. Lokal committet, **nicht gepusht** (ein Push löst die Cloudflare-Bereitstellung aus).
- Arbeitsbaum: enthält weiterhin **fremde, uncommittete Änderungen** an `COPYRIGHT` und `LICENSE`
  (nicht von dieser Arbeit, nicht angefasst, nicht gestagt). Gestagt wurde selektiv mit expliziten
  Pfaden.
- Die erzeugten Katalogpakete (`packages/tools/src/catalog/generated/*`, `toolIndex.ts`) sind im
  Commit enthalten — ohne sie wäre er nicht baubar.
- **Der geprüfte Stand ist der committete Stand:** außer `COPYRIGHT` und `LICENSE` weicht der
  Arbeitsbaum in keiner Datei von `HEAD` ab; `check`, `build`, `lint`, `viewport:check` und der
  Browserbeleg liefen auf genau diesem Inhalt.

## Zusatz 2026-10-04, Faber: Gesamtlauf und Altprüfung nachgetragen

Nach dem Commit nachgeholt, was in der Übergabe noch offen stand:

- **`npm run viewport:check` über alle 48 Routen bei 320 px: bestanden.** Damit ist die
  Überbreiten-Prüfung nicht nur für die vier neuen Rechner-Routen, sondern für den ganzen Katalog
  grün.
- **Pflichtabschnitte der älteren Rechner-Übergaben geprüft.** Zwei Fälle fehlen als Überschrift:
  `2026-10-04-rechner-tastenfeld-umgesetzt.md` (sechs) und
  `2026-10-04-sammelrelease-sprachen-pdf-rechner.md` (drei). Der **Inhalt ist vorhanden**, er steht
  unter anderen Überschriften; die Ergänzung ist ein eigener Auftrag und in
  `01-stand/offene-punkte.md` datiert vermerkt. Das Abnahmekriterium 7 ist damit **erfüllt**: die
  Prüfung lief über alle Übergaben desselben Vorhabens, nicht nur über diese.
