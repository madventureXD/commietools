# M3-007 — Dateinamen an Graphemgrenzen kürzen: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Karte:** `QM/70-reparaturempfehlungen/R6.md`, M3-007 (R6)
**Auftrag:** Thomas, wörtlich: „R6 Go, durchziehen."
**Status:** **erledigt** — die Karte war in der Akte zu früh als „erledigt" geführt.

## Bestandsaufnahme (gegen den Live-Stand)

Der vorhandene Fix in `normaliseFileName` (`apps/web/src/tools/SaveFileControl.tsx`) prüfte nur, ob
der gekürzte Name auf einer **hohen Surrogathälfte** endet. Das rettet ein einzelnes Emoji, aber
nicht **Graphemgruppen**: eine ZWJ-Familie (sieben Codepoints), eine Flagge (zwei
Regionalindikatoren), ein Hautton-Modifier oder ein kombinierendes Zeichen (`n` + U+0303) bestehen
aus mehreren Codepoints und bleiben beim Durchschneiden **wohlgeformt** — der Dateiname ist dann
still zerstörter Text, ohne dass die Wohlgeformtheitsprüfung anschlägt.

**Damit war die frühere Einschätzung „M3-007 damit erledigt" falsch.** Diese Karte ist damit
vollständig erledigt (nachgezogen in der Akte).

## Umsetzung

- Neue Funktion `kuerzeAnGraphemgrenzen(stem, keep)` in `SaveFileControl.tsx`: kürzt über
  `Intl.Segmenter` mit `granularity: 'grapheme'` und übernimmt nur **vollständige** Grapheme.
- Gezählt wird weiterhin in **UTF-16-Einheiten** gegen die bestehende 180er-Grenze (die Karte
  verlangt ausdrücklich nicht 180 *Grapheme*).
- **Rückfall benannt:** ohne `Intl.Segmenter` (ältere Browser) greift der bisherige Surrogatschutz.
- Passt nicht einmal das erste Graphem in die Grenze, wird es dennoch genommen: ein zu langer, aber
  vollständiger Name schlägt einen leeren Rumpf mit richtiger Länge.

## Abnahme der Karte

| Abnahmefall | Ergebnis |
|---|---|
| `a` + 90 × Emoji (bestehender Test) | ✓ wohlgeformt, Endung erhalten |
| ZWJ-Familie, Flagge, Hautton, kombinierendes Zeichen, CJK, Emoji | ✓ eigener Test: Rumpf ist Präfix **und** endet auf einer Graphemgrenze |
| Ergebnis wohlgeformt, keine halben Grapheme | ✓ (Grenzenprüfung gegen **unabhängige** Segmentliste, nicht gegen die Produktionsfunktion) |
| Länge ≤ 180 UTF-16-Einheiten, Endung reserviert | ✓ |
| reservierte Namen, reine Endung, leerer Name | ✓ (bestehende Tests) |

**Mutationsgegenprobe (drei Anläufe, zwei davon wertlos — ehrlich benannt):**
1. `false && …` beim Segmenter → CHECK=1, aber **vom Linter** (3 Fehler), nicht vom Test: wertlos.
2. naive Kürzung als Ersatz → CHECK=1, wieder **Lint** („unbenutzt"), nicht der Test: wertlos.
3. Segmentierung auf Zeichenebene (`flatMap` über die Codepoints) → **echter** Fehlschlag:
   `ZWJ-Familie: Schnitt liegt in einer Gruppe: expected false to be true`,
   `Tests 1 failed | 707 passed`, CHECK=1.

Gegenprobe 3 belegt, dass der Test tatsächlich Graphemgrenzen fordert — die Anläufe 1 und 2 hätten
beinahe einen grünen Test als Beleg durchgehen lassen.

## Prüfkette

`npm run check` **Exit 0** (708 Tests in 50 Dateien, 0 Fehler, 109 Warnungen) · `npm run build`
**Exit 0**. Commit `0673e4f`. Nichts gepusht.

## Grenzen

- `Intl.Segmenter` ist Baseline in allen aktuellen Browsern; der Rückfall ist **nicht** in einem
  alten Browser gemessen, sondern nur als Codepfad vorhanden.
- Geprüft ist die Funktion `normaliseFileName`; nicht gemessen ist, wie ein echtes Betriebssystem
  einen Namen mit ZWJ-Gruppen im Dateidialog anzeigt (kein Zugriff auf den nativen Dialog).
