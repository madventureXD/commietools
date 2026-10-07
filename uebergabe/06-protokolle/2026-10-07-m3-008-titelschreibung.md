# M3-008 — Titelschreibung hinter spanischen Satzzeichen: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Karte:** `QM/70-reparaturempfehlungen/R6.md`, M3-008 (R6)
**Auftrag:** Thomas, wörtlich: „R6 Go, durchziehen."
**Status:** **erledigt**.

## Bestandsaufnahme (gegen den Live-Stand)

`convertCase` (`packages/tools/src/index.ts`) schrieb im Modus `title` über die Regel
`(^|\s)(\p{L})` groß — Wortgrenze war nur **Leerraum oder Zeilenanfang**. Damit blieb jedes Wort
hinter `¡` oder `¿` klein (`¿qué tal?` → `¿qué tal?`). Das war unverändert der Stand der Empfehlung.

## Umsetzung (nach der dauerhaften Lösung der Karte)

- Locale-bewusste Segmentierung mit `Intl.Segmenter`, `granularity: 'word'` und `isWordLike` —
  **nicht** ein um `¡`/`¿` erweitertes Muster (die Karte verbietet das ausdrücklich).
- Pro Wort wird das **erste Graphem** großgeschrieben (`granularity: 'grapheme'`), damit
  kombinierende Zeichen am Wortanfang beim Buchstaben bleiben.
- Satzzeichen, Leerraum, Klammern und Anführungszeichen werden unverändert übernommen.
- **Produktvertrag im Code benannt:** erster Buchstabe jedes Wortes groß; keine
  sprachwissenschaftliche Überschriftenkorrektur (kleine Wörter bleiben groß).
- **Festgelegte Sonderfälle** (die Karte verlangt eine ausdrückliche Festlegung):
  Bindestrich **trennt** Wortteile (`casa-mundo` → `Casa-Mundo`), Apostroph **trennt nicht**
  (`don't` → `Don't`).
- `upper`/`lower` bleiben unverändert die bewährten Locale-Operationen.
- Benannter Rückfall ohne `Intl.Segmenter`: die bisherige Wortanfangsregel.

## Abnahme der Karte

Eigener Test in `apps/web/src/App.test.ts` („schreibt Wörter hinter spanischen Satzzeichen groß
(M3-008)"). Gemessen:

| Abnahmefall | Ergebnis |
|---|---|
| `¡hola! ¿qué tal?` → `¡Hola! ¿Qué Tal?` | ✓ |
| Anführungen: `"hola" mundo` → `"Hola" Mundo` | ✓ |
| Klammern: `(hola) mundo` → `(Hola) Mundo` | ✓ |
| Bindestrich: `casa-mundo` → `Casa-Mundo` | ✓ |
| Apostroph: `don't stop` → `Don't Stop` | ✓ |
| `ñ` (eigener Codepoint) → `Niño` | ✓ |
| kombinierende Folge `nin\u0303o` → `Nin\u0303o`, Zeichen bleibt am Buchstaben | ✓ |
| Zeilen: jedes Zeilenanfangs-Wort erfasst | ✓ |
| leerer/Whitespace-String unverändert | ✓ |
| `upper` mit `de-DE`: `straße` → `STRASSE` | ✓ |
| **Gegenprobe** zur alten Regel: Ergebnis enthält **nicht** `¿qué` | ✓ |

**Mutationsgegenprobe:** Wortgroßschreibung ausgesetzt (`if (!teil.isWordLike || !/\s/u.test(...))`)
→ `FAIL … M3-008`, `AssertionError: expected '¡hola! ¿qué tal?' to be '¡Hola! ¿Qué Tal?'`,
`Tests 2 failed | 707 passed`, CHECK=1. Nach dem Zurücknehmen: grün.

**Verdrahtung der Oberfläche** (statisch geprüft): `CaseConverterTool({ t, locale })` gibt die
Oberflächensprache als `locale` an `convertCase` weiter — die Werkzeugausgabe folgt also der
gewählten Sprache.

## Prüfkette

`npm run check` **Exit 0** (709 Tests in 50 Dateien, 0 Fehler) · `npm run build` **Exit 0**.
Commit `0ed056c`. Nichts gepusht.

## Grenzen

- Zusätzliche Sprachen sind **nicht** freigegeben: geprüft sind `es` und `en` (Vertrag oben);
  für weitere Sprachen fehlen definierte Erwartungen (so verlangt es die Karte).
- Nicht gemessen: wie ein Screenreader die Zeichenkette vorliest.
