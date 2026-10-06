# Fortschrittsprotokoll: M7-001 (R5) — Schriftfarbe auf dem Markenrot je Schema

**Datum:** 2026-10-06
**Status:** umgesetzt und gemessen — Audit-Durchgang läuft zum Zeitpunkt dieses Schreibens
**Karte:** M7-001 aus R5 (`QM/70-reparaturempfehlungen/R5.md`), Basis `2deaaeb`

## Entscheidung

Die Karte war als **bewusst akzeptierte Abweichung** geführt (Betreiberentscheidung 06.10.: „nicht
als behoben führen"). Thomas hat im Gespräch am 2026-10-06 neu entschieden: **Markenrot bleibt in
beiden Schemata unverändert, die Schriftfarbe wird schemaabhängig.** Vorschlag und Entscheidung
kamen aus dem Gespräch, nachdem die Messwerte für schwarze Schrift vorgelegt wurden.

## Messung (ausgelieferter Build, Edge headless über CDP)

| Schema | Markenfarbe | Schrift | Kontrast | Bewertung |
|---|---|---|---:|---|
| dunkel (vorher) | `#ff4b59` | weiß | **3,2799:1** | AA verfehlt |
| dunkel (nachher) | `#ff4b59` | `#101114` | **5,7562:1** | AA erreicht |
| hell (vorher = nachher) | `#c91f2c` | weiß | **5,6514:1** | AA erreicht |

Nachgerechnet in Python (unabhängig vom Browser): weiß auf `#ff4b59` = 3,2799:1 — identisch mit dem
historischen Auditwert 3,279874:1. Für das helle Schema ist die weiße Schrift **richtig** und bleibt:
dort wäre schwarze Schrift mit 3,72:1 schlechter. Beide Schemata erfüllen AA mit rund 5,7:1.

**Deaktivierter Zustand (dunkel, `opacity: 0.5`), gemischt gerechnet:** effektiv **1,5257:1**. WCAG
2.2 nimmt deaktivierte Bedienelemente von der Kontrastanforderung aus (1.4.3, Ausnahme). Der Wert
steht hier zur Kenntnis, nicht als Befund — er war auch vorher so.

## Änderung

- `packages/ui/src/tokens.css`: neues Token `--color-action-text` — `:root` (hell) `#ffffff`,
  `[data-theme='dark']` `#101114`. Das Markenrot bleibt unangetastet.
- `apps/web/src/styles.css`: drei Stellen von `color: white` auf `color: var(--color-action-text)`:
  `.button.primary` / `form > button[type="submit"]`, `.segmented .active` und
  **`.calculator-switch button.active`**. Die dritte Stelle stand **nicht** in der Audit-Ausnahme,
  hatte aber dasselbe Problem — sie wäre sonst unentdeckt geblieben.
- `scripts/viewport-audit.mjs`: Die beiden Ausnahmen aus `AKZEPTIERTE_KONTRASTE` sind **entfernt**.
  Eine stehen gebliebene Ausnahme hätte künftige Regressionen an genau diesen Flächen verschluckt.

## Eigener Messfehler (offen benannt)

Mein erstes Messskript setzte `data-theme` am **`<html>`-Element**. Das Theme der Anwendung hängt
aber am `.app`-Div (`App.tsx`, `return <div className="app" data-theme={theme}>`). Die Tokens am
html-Element waren damit hell, während der gemessene Knopf weiter die dunklen Werte trug — die
Messung sah wie ein Fehler in der Anwendung aus, war aber einer im Prüfskript. Korrigiert: gesetzt
und gelesen wird am `.app`-Element. Der gemessene Knopf war `<button type="submit">Berechnen</button>`
(Gewerke-Kalkulation, `/tools/commercial`).

## Was nicht geprüft ist

- **Der Audit-Durchgang** (`viewport-audit.mjs a11y`, beide Schemata) — beim ersten Versuch ohne
  Terminal abgebrochen (`stdin is not a tty`) und meldete trotzdem Exit 0. Läuft mit Terminal
  erneut; das Ergebnis steht noch aus.
- **Hover und Fokus** auf den Aktionsflächen: nicht einzeln gemessen. Der Fokusring bleibt
  `--color-focus`, das ist unabhängig.
- `.tool-menu-sorts .button.active` nutzt `--color-text`/`--color-surface` statt der Markenfarbe und
  ist damit **nicht** betroffen — geprüft durch Lesen der Regel, nicht gemessen.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| geänderte Dateien | 3 | tokens.css, styles.css, viewport-audit.mjs |
| neue Abhängigkeiten | 0 | — |
| Tests / check / build | 665 grün, Exit 0 | `m7-001-check-1.log` |
| entfernte Audit-Ausnahmen | 2 | `AKZEPTIERTE_KONTRASTE` |
