# Fortschrittsprotokoll: Rechner in vier Werkzeuge geteilt (ADR 0009)

**Datum:** 2026-10-04  
**Status:** abgeschlossen

## Umfang

Der bisherige Gesamtrechner (`calculator`, vier umschaltbare Rechenarten) wurde in **vier
Werkzeuge** geteilt — Standard, wissenschaftlich, Programmierer, RPN — mit **einem gemeinsamen
Rahmen**. Betrachtet und geändert: Oberfläche, Tastenfelder, Sprachkataloge, Manifeste, Symbole,
Speicherbereiche, Tests. Gemessen wurde vorher, was der Rechenkern je Rechenart kostet
(`work/rechner-mathjs-messung.mjs`).

## Ergebnisse

- **Vier Routen statt einer:** `/tools/calculator`, `/tools/scientific-calculator`,
  `/tools/programmer-calculator`, `/tools/rpn-calculator`. Der Katalog führt **48 statt 45**
  Werkzeuge.
- **Keine Rechenart-Verzweigung mehr:** `grep -c "mode ===\|mode !==\|UiMode"` ergibt **0** in
  allen vier Werkzeugdateien und im Rahmen. Das Feld `mode` ist aus dem Einstellungsdatensatz
  entfallen; ein gespeicherter Altbestand wird beim Lesen stillschweigend fallengelassen.
- **Schlanker je Werkzeug:** 31 / 52 / 150 / 31 Zeilen gegen 1.021 Zeilen im Gesamtmodell; eigene
  Sprachschlüssel 5 / 9 / 11 / 13 gegen 95. Der gemeinsame Rahmen (854 Zeilen) und der gemeinsame
  Textblock (65 Schlüssel) stehen **einmal**.
- **Eigener Speicher je Werkzeug:** `calculator.standard.*`, `calculator.scientific.*`,
  `calculator.programmer.*`, `calculator.rpn.*` für Verlauf, Variablen und Einstellungen. Der alte
  Bereich `calculator.*` bleibt liegen und wird nicht gelöscht.
- **Der Rechenkern bleibt geteilt** und unverändert: die gemessene Ersparnis durch getrennte
  Factory-Listen beträgt 7,5 KiB gzip, eine zweite Engine-Kopie kostete 93 KiB.
- **Beleg am Artefakt:** acht Proben über vier Routen und zwei Fensterbreiten (1360 px, 390 px),
  jede Rechnung im Browser ausgeführt und der Wert aus dem DOM zurückgelesen:
  `1/3+1/6 = 0,5` · `sin(30°) = 0,5` · `255 → 0xff`, `0b11111111`, int8 `−1` · `3 4 + 5 * = 35`.
  Bilder und Protokoll: `07-pruefung/rechner-vier-werkzeuge/`.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Katalog | 48 (vorher 45) | `npm run catalog:check` |
| Suchbegriffe | 3.164 (vorher 3.018) | `npm run catalog:generate` |
| Start-JavaScript | 146.220 B gzip von 204.800 (vorher 136.961, +9.259) | `npm run build` |
| Werkzeugtexte Deutsch | 32.672 B gzip (**Warnschwelle 30.720**, vorher 32.080) | `npm run build` |
| Werkzeugtexte Spanisch | 31.645 B gzip (**Warnschwelle 30.720**, vorher 31.130) | `npm run build` |
| Werkzeugtexte Englisch | 29.787 B gzip (vorher 29.264) | `npm run build` |
| Rechenkern je Rechenart (allein gebündelt) | 93,1 / 98,6 / 95,3 / 94,6 KiB gzip gegen 100,6 KiB für alle vier | `work/rechner-mathjs-messung.mjs` |
| Zeilen Werkzeugoberflächen | 31 + 52 + 150 + 31 = 264 gegen 1.021 | `wc -l` |
| Zeilen gemeinsamer Rahmen | 854 | `wc -l` |
| Eigene Sprachschlüssel je Werkzeug (de) | 5 / 9 / 11 / 13, Rahmen 65 | `grep -c` in den Locale-Dateien |
| Tests | 380 in 23 Dateien, alle grün | `npm run check` |

## Relevante Verweise

- Commit/PR: **`d26e18a`** `feat(calculator): split the calculator into four tools on one shared
  frame` — lokal committet, **nicht gepusht**. Ein Push löst die Cloudflare-Bereitstellung aus und
  erfolgt nur auf ausdrücklichen Auftrag.
- Konzept: `03-konzepte/2026-10-04-rechner-aufteilen.md`
- ADR: `04-entscheidungen/0009-ein-werkzeug-je-rechenart.md`
- Übergabe: `05-uebergaben/2026-10-04-rechner-vier-werkzeuge.md`
- Belege: `07-pruefung/rechner-vier-werkzeuge/` (9 Bilder, `beleg.txt`)

## Folgemaßnahmen

- [ ] Werkzeugtexte je Sprache aufteilen (etwa je Suite) — die Warnschwelle ist in Deutsch und
      Spanisch weiter überschritten.
- [ ] Abweichung zwischen ADR 0005 (89,5 KiB gzip) und der Nachmessung (100,6 KiB gzip, gleiche
      Factory-Liste) klären.
- [ ] Werkzeugtexte Spanisch sprachlich gegenlesen (bestehender offener Punkt, unverändert).
- [ ] Beim nächsten Prüflauf `200 %` Zoom und Screenreader-Namen für die vier Rechner mitnehmen.
