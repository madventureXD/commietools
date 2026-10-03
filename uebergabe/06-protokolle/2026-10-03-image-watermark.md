# Fortschrittsprotokoll: Bild-Suite — Wasserzeichen

**Datum:** 2026-10-03
**Status:** abgeschlossen

## Umfang

Viertes Werkzeug der Bild-Suite nach `image-metadata`, `image-resize` und `icon-generator`:
`image-watermark`. Geprüft wurden die Platzierungsgeometrie für neun Anker, das gedrehte
Kachelraster, die Skalierung an der kurzen Bildkante sowie im echten Browser die Frage, ob
tatsächlich nur die Wasserzeichen-Pixel verändert werden.

## Ergebnisse

- Text oder Logo als Wasserzeichen, einzeln oder als Muster, mit Größe, Deckkraft, Drehung,
  Rand- und Musterabstand. Ohne neue Abhängigkeit.
- Der entscheidende Nachweis gelingt mit einer PNG-Quelle: Original und Ergebnis sind
  pixelgleich außerhalb der Marke (0 veränderte Pixel in der bildfreien Ecke, 356 im
  Markenbereich). Damit ist belegt, dass das Werkzeug das Bild nicht neu berechnet.
- Drei Fehler wurden von den eigenen Tests gefunden und behoben: verdrehte Ankerachsen, ein
  Randabstand, der die Marke aus dem Bild schieben konnte, und ein zu enger Zeilenabstand im
  Muster.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Katalog | 13 | `npm run catalog:check` |
| Symbole | 13 | `npm run catalog:check` |
| Suchbegriffe und Schlagwörter | 942 | `npm run catalog:check` |
| Deklarierte Dateitypen | 51 | `npm run catalog:check` |
| Tests | 117 bestanden | `npm run check` |
| Neue Tests für dieses Werkzeug | 16 | `apps/web/src/image-watermark.test.ts` |
| Externe Pakete in der Lizenzprüfung | 496 (unverändert) | `npm run licenses:check` |
| Hauptbundle | 503,28 kB (148,96 kB komprimiert) — **Warnung über 500 kB** | `npm run build` |
| Vorheriges Hauptbundle | 480,59 kB (143,85 kB komprimiert) | `uebergabe/01-stand/aktueller-stand.md` |
| Veränderte Pixel außerhalb der Marke | 0 | Browserprüfung, Pixelvergleich |
| Kacheln im Muster (640 × 480, Marke 18 %) | 255 vor der Abstandskorrektur | Browserprüfung |

## Relevante Verweise

- Commit: `87e1ae0` (Umsetzung, Tests, Dokumentation)
- Konzept: `uebergabe/03-konzepte/2026-10-02-bild-suite.md` (Umsetzungshinweis viertes Werkzeug)
- Übergabe: `uebergabe/05-uebergaben/2026-10-03-image-watermark.md`

## Folgemaßnahmen

- [ ] Bundlegröße entscheiden: Register aus dem Hauptbundle herausnehmen, bevor weitere
      Werkzeuge dazukommen.
- [ ] Mehrzeilige Textmarken und unregelmäßige Muster prüfen, falls Bedarf gemeldet wird.
