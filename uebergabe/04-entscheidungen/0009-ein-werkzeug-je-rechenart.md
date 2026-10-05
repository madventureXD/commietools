# ADR 0009: Ein Werkzeug je Rechenart, ein gemeinsamer Rahmen

**Status:** angenommen  
**Datum:** 2026-10-04

## Kontext

Das Werkzeug `calculator` trug vier Rechenarten in **einem** Werkzeug: Standard, wissenschaftlich,
Programmierer und RPN. Die Gruppierung stammte aus dem Konzept
`03-konzepte/2026-10-03-taschenrechner-suite.md` (Gruppe 1: „ein Werkzeug mit umschaltbaren
Modi") und war dort als **Vorschlag** gekennzeichnet. Thomas hat am 2026-10-04 entschieden:
„Ich möchte sie gerne als 4 einzelne Tools. Das spezielle tool zum speziellen Zweck."

Damit standen zwei Fragen: **Was fällt durch die Trennung weg?** Und: **Wird jedes Einzelmodell
schlanker als das Gesamtmodell?**

Gemessen vor der Umsetzung (`work/rechner-mathjs-messung.mjs`, esbuild, gzip -9, mathjs 15.2.0):

| Bündelvariante | Factories | gzip |
|---|---:|---:|
| heutige kuratierte Liste (alle vier Rechenarten) | 59 | 100,6 KiB |
| nur Standard | 26 | 93,1 KiB |
| nur wissenschaftlich | 52 | 98,6 KiB |
| nur Programmierer | 33 | 95,3 KiB |
| nur RPN | 28 | 94,6 KiB |

**Befund:** Der Rechenkern hat einen Sockel von rund 93 KiB gzip (Parser, `decimal.js`,
`fraction.js`, Typmaschinerie). Der gesamte Funktionsumfang aller vier Rechenarten wiegt 7,5 KiB.
Getrennte Werkzeuge sparen dort praktisch nichts — und wenn jede Route ihre eigene Engine-Kopie
trüge, würde ein Nutzer, der zwei Rechner öffnet, 93 KiB zweimal laden.

## Entscheidung

1. **Vier Werkzeuge** statt eines: `calculator` (Standard, behält Route und Kennung),
   `scientific-calculator`, `programmer-calculator`, `rpn-calculator`. Reihenfolge in der Suite:
   nach wachsendem Umfang.
2. **Ein gemeinsamer Rahmen** (`apps/web/src/tools/calculator-frame.tsx`): Anzeige in zwei
   Zuständen, Tastenfeld-Ausgabe, Kopieren, Ergebnis, Verlauf, Variablen, Rechenregeln, Fehler und
   Speicherung. Ohne ihn ergäben vier Werkzeuge rund 3.000 Zeilen statt 1.021 — **mehr** Code.
3. **Je Rechenart ein eigenes Tastenfeld** (`packages/tools/src/calculator/keypads/<rechenart>.ts`);
   jede Route lädt nur ihres.
4. **Je Rechenart ein eigener Speicherbereich** (`calculator.<rechenart>.*` für Verlauf, Variablen
   und Einstellungen). Der alte gemeinsame Bereich `calculator.*` bleibt liegen und wird nicht
   stillschweigend gelöscht.
5. **Die Rechenart ist kein Zustand mehr.** Kein `mode`, keine Umschaltleiste, kein Feld `mode` in
   den Einstellungen. Was eine Rechenart zusätzlich braucht, deklariert sie als Fähigkeit ihres
   Rahmens (`numberModelSwitch`, `accuracy`, `allowTwoDim`, `renderSettings`, `displayResult` …).
6. **Die Texte des Rahmens liegen einmal** unter `tool.calc.*`
   (`packages/tools/src/calculator/shell/locales/`); jede Rechenart führt nur ihre eigenen
   Schlüssel.

## Folgen

- Jede Werkzeugdatei bleibt dünn (31 / 52 / 150 / 31 Zeilen) gegen 1.021 Zeilen im Gesamtmodell;
  eigene Sprachschlüssel je Werkzeug 5 / 9 / 11 / 13 gegen 95.
- Der Rahmen wächst auf 854 Zeilen — er trägt, was vorher alle vier Wege zusammen trugen.
- Der Rechenkern bleibt **ein** Modul. Die Route lädt unverändert die Vereinigung aller Factories.
- Drei neue Katalogeinträge je Sprache kosten Startgröße: **+9,3 kB gzip** im Start-JavaScript
  (Register und Suchpakete liegen im Bündel). Gemessen 2026-10-04: 146.220 B von 204.800 B.
- Die Werkzeugtexte je Sprache wachsen um rund 0,5 kB (Deutsch 32.672 B, Spanisch 31.645 B) — die
  beiden liegen damit weiter über der Warnschwelle von 30.720 B. Der Grund steht in
  `01-stand/offene-punkte.md`; der vorgesehene Ausweg bleibt die Aufteilung der Werkzeugtexte je
  Sprache.
- Eine **Abweichung** wurde dabei bewusst gemacht und ist im Konzept datiert festgehalten: der
  Standardrechner bekommt auf Entscheidung das Blatt `⋯` und damit eine sechste Tastenreihe; in
  die freien Zellen dieser Reihe kamen `(` und `)` — der Kern konnte sie immer schon lesen, sie
  hatten nur keine Taste.

## Verweise

- Auftrag und Messungen: `03-konzepte/2026-10-04-rechner-aufteilen.md` (samt datierten Nachträgen)
- Kern: ADR 0005 · Voller Wert und Ampel: ADR 0006
- Umsetzung und Belege: `05-uebergaben/2026-10-04-rechner-vier-werkzeuge.md`,
  `07-pruefung/rechner-vier-werkzeuge/`
