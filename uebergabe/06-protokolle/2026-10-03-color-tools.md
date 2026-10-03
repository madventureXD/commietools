# Fortschrittsprotokoll: Bild-Suite — Farbwerkzeuge

**Datum:** 2026-10-03
**Status:** abgeschlossen

## Umfang

Fünftes Werkzeug der Bild-Suite: `color-tools`. Geprüft wurden die Farbkonvertierungen, die
WCAG-Kontrastrechnung, die Simulation der Farbsehschwäche gegen eine fremde Referenz, die
Palettenbildung sowie im Browser die Pipette mit einem Bild aus bekannten Farbflächen.

## Ergebnisse

- Farbwerte in HEX, RGB, HSL und LAB; Pipette mit Maus und Tastatur; Palette aus dem Bild;
  WCAG-Kontrastprüfung; Simulation für Protanopie, Deuteranopie, Tritanopie und Achromatopsie.
  Ohne neue Abhängigkeit.
- Die Simulation folgt Brettel, Viénot & Mollon (1997) und wurde farbweise gegen `libDaltonLens`
  0.1.5 geprüft: grösste Abweichung 1 von 255, entstanden durch die Ganzzahl-Rundung.
- Die Pipette liefert die Originalpixel: mit vier bekannten Farbflächen stimmen alle vier
  Klickergebnisse exakt.
- Die Palette ist deterministisch; ein Zufallslauf hätte den Test wertlos gemacht.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Katalog | 14 | `npm run catalog:check` |
| Symbole | 14 | `npm run catalog:check` |
| Suchbegriffe und Schlagwörter | 1023 | `npm run catalog:check` |
| Deklarierte Dateitypen | 54 | `npm run catalog:check` |
| Tests | 133 bestanden | `npm run check` |
| Neue Tests für dieses Werkzeug | 16 | `apps/web/src/color-tools.test.ts` |
| Externe Pakete in der Lizenzprüfung | 496 (unverändert) | `npm run licenses:check` |
| Hauptbundle | 525,83 kB (155,73 kB komprimiert) | `npm run build` |
| Vorheriges Hauptbundle | 503,28 kB (148,96 kB komprimiert) | `uebergabe/01-stand/aktueller-stand.md` |
| Abweichung zur Referenzsimulation | ≤ 1 von 255 | Test gegen libDaltonLens-Werte |
| Klickgenauigkeit der Pipette | 4 von 4 Flächen exakt | Browserprüfung |

## Relevante Verweise

- Commit: folgt
- Konzept: `uebergabe/03-konzepte/2026-10-02-bild-suite.md` (Umsetzungshinweis fünftes Werkzeug)
- Übergabe: `uebergabe/05-uebergaben/2026-10-03-color-tools.md`
- Referenz der Simulation: Brettel, Viénot & Mollon (1997), Werte berechnet mit libDaltonLens
  0.1.5 (MIT), ausserhalb des Projekts

## Folgemaßnahmen

- [ ] Werkzeugregister aus dem Hauptbundle herausnehmen, bevor weitere Werkzeuge dazukommen.
- [ ] Palette bei sehr großen Bildern prüfen (derzeit Stichprobe).
