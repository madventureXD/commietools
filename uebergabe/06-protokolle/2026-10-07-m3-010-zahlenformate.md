# M3-010 — Zahlenformate: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Karte:** `QM/70-reparaturempfehlungen/R6.md`, M3-010 (R6)
**Auftrag:** Thomas, wörtlich: „R6 Go, durchziehen."
**Status:** **erledigt** für den Auftragsumfang der Karte; **ein Befund bleibt offen** (siehe unten).

## Bestandsaufnahme (gegen den Live-Stand)

29 Formatierstellen im Baum. Die Karte benennt vier davon als Eingriffspunkte — alle vier hingen an
der falschen Größe:

| Stelle | vorher | Problem |
|---|---|---|
| `ColorTools.tsx` `formatNumber` | `Intl.NumberFormat(undefined, …)` | still am `navigator` |
| `Statistics.tsx` `format` | `Intl.NumberFormat(locale, …)` | Oberflächen**sprache** statt Region |
| `PdfSecurityTools.tsx` `formatBytes` | `toFixed(1)` / `toFixed(2)` | immer Punkt („4.5 KB" in deutscher Oberfläche) |
| `PdfMaintenanceTools.tsx` | `value.toLocaleString()` | still am `navigator`, Zeitzone unsichtbar |

## Umsetzung

- **Neuer gemeinsamer Formatkontext** `packages/tools/src/format.ts`: trennt `uiLocale` (Texte) von
  `regionLocale` (Zahlen, Datum) und **dokumentiert den Default** statt still `navigator` zu benutzen:
  1. erste Browsersprache **mit Region**, 2. Oberflächensprache, 3. Vorgabe `de-DE`.
- `formatNumber`, `formatBytes`, `formatDateTime` (mit sichtbarer Zeitzone über
  `deviceTimeZone()`), und `formatTechnicalNumber` für **technische Austauschsyntax**
  (Punkt, keine Gruppierung).
- Die vier Stellen umgestellt; Datum in den PDF-Metadaten zeigt jetzt Datum/Uhrzeit der Gerätezone
  **mit Zeitzonenkennung** in Klammern.

## Abnahme der Karte

| Abnahmepunkt | Ergebnis |
|---|---|
| Sprache **es** bei Browser **de-DE** | ✓ Statistik zeigt „1.234.567,5" |
| Sprache **es** bei Browser **en-US** | ✓ Statistik zeigt „1,234,567.5" |
| große und negative Zahlen, Dezimal-/Gruppentrenner | ✓ Test: 1234567,5 und −1234567,5 in beiden Regionen; Bytes 4,5 KB / 4.5 KB |
| Bytes und Datumswerte | ✓ `formatBytes` nach Region; Datum mit Zeitzonenkennung |
| JSON/CSS gültig, Exportwerte nicht unbemerkt lokalisiert | ✓ `formatTechnicalNumber` hält den Punkt (1234.5, −0.25, 0.0000001, keine Gruppierung); JSON schreibt ohnehin über `JSON.stringify` |
| UI konsistent | ✓ für die vier Stellen; **übrige 25 Stellen sind Bestand** (siehe Befund) |

**Mutationsgegenprobe:** `formatBytes` auf `toFixed` zurückgestellt → `AssertionError: expected
'4.5 KB' to be '4,5 KB'`, `Tests 1 failed | 714 passed`, CHECK=1. Zurückgenommen: grün.

## Prüfkette

`npm run check` **Exit 0** (715 Tests in 51 Dateien, 0 Fehler) · `npm run build` **Exit 0**.
Commits: `git log` (Code und Akte getrennt). Nichts gepusht.

## Befund, der offen bleibt (gehört gemeldet)

**25 weitere Formatierstellen** halten sich nicht an den neuen Kontext — überwiegend
`Intl.NumberFormat(locale, …)` mit der **Oberflächensprache** (Aufmaß, Kabel, Beton, Trockenbau,
Böden, Geometrie, Wärmelast, Icon-Generator u. a.). Nach der Entscheidung der Karte („Nicht alle
`toFixed`-Aufrufe pauschal lokalisieren") wurden sie **nicht** angefasst: Sie sind fachlich
vorhandene Werkzeugausgaben, und eine pauschale Umstellung wäre ein eigener, größerer Eingriff mit
Abnahmebedarf je Werkzeug. Vorschlag: eigene Karte mit dem Muster „Werkzeugausgabe folgt dem
Formatkontext" (messbar: Anzahl der Stellen mit `Intl.NumberFormat(locale, …)` gegen 0).

## Grenzen

- Die Browsersprache wurde im Beleg **simuliert** (`Page.addScriptToEvaluateOnNewDocument`), weil sich
  `navigator.languages` im kopflosen Browser nicht über einen Startsсhalter setzen lässt. Ein echtes
  Gerät mit en-US-Systemsprache ist damit **nicht** ersetzt. Genau daran ist ein erster Beleglauf
  gescheitert: er sah wie ein Produktfehler aus („en-US wirkt nicht"), war aber ein Prüfmittel-Fehler
  — `--lang` ändert nur `navigator.language`, die **Liste** bleibt `["de","de-DE",…]`.
- Zahlen**eingabe** ist ausdrücklich nicht Teil dieser Karte (`Intl.NumberFormat` ist kein Parser);
  die Eingabegrammatik der Werkzeuge blieb unverändert.
