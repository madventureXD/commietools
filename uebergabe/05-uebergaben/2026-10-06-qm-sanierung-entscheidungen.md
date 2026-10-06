# Übergabe: QM-Sanierung — Karten R2/R3, Entscheidungsrunde und M7-001

**Datum:** 2026-10-06 · **Sitzung:** `20261006_173922_d8b7e6a7` · **Quelle:** Telegram

## Ziel der Sitzung

Die QM-Sanierung fortsetzen: die Reparaturkarten in der vorgeschriebenen Reihenfolge abarbeiten und
die offenen Entscheidungen mit Thomas durchgehen.

## Ergebnis

**Sechs Karten bearbeitet** (M4-004, M4-005, M4-006, M8-003, M8-002, M7-001); **M7-001 ist fertig
und über den Prüfer belegt**, die übrigen stehen auf ◐ (Code da, Abnahme offen).

**Dreizehn Entscheidungen** mit Thomas getroffen und in `00-einstieg/vorgehen-qm-audit.md`
(Abschnitt 6) festgehalten. **Drei davon umgesetzt:**

- Revisionsbindung des Lizenzregisters gelöst — `licenses:check` ist grün **ohne** Neuerzeugen;
  die beiden Registries sind wieder versioniert.
- GPL-Einzelausnahme für `pdf_signer` in `licenses/rust-review.json` eingetragen.
- Aufräumregel für verwaiste Rust-Hinweisordner (Generator räumt, Prüfer meldet).

## Geänderte Bereiche

- `packages/core/src/loadCache.ts`, `storage.ts` (neu), `packages/core/package.json`
- `packages/i18n/src/index.ts`, `common/{de,en,es}.ts`
- `apps/web/src/App.tsx`, `ToolNavigation.tsx`, `tools/PdfSplit.tsx`, `styles.css`
- `packages/ui/src/tokens.css` — neues Token `--color-action-text` je Schema
- `scripts/catalog-generate.mjs`, `scripts/license-audit.mjs`, `scripts/viewport-audit.mjs`
- `licenses/rust-review.json`, `licenses/registry.json`, `apps/web/public/licenses/registry.json`
- Neue Tests: `load-cache.test.ts`, `storage.test.ts`; erweitert: `math-tools`, `aufmass`,
  `calculator-keypad`
- Akten: Protokolle zu M4-004/005/006, M8-002/003, M7-001, Kleinigkeiten; Index; offene Punkte

## Entscheidungen und Annahmen

1. **Importvertrag Statistik abgenommen** — Komma = Dezimalzeichen, Semikolon trennt Listen
   (eindeutig, kein Raten).
2. **Anzeige-Nullung** — Hinweis am Ergebnis statt neuer Ampelstufe.
3. **Tabellenprogramm-Probe (M8-004)** — bewusst fallen gelassen (kein Excel/LibreOffice im Haus);
   die unabhängige Python-Gegenprobe bleibt maßgeblich.
4. **Kontrast (M7-001)** — Markenrot bleibt, Schriftfarbe schemaabhängig.
5. **Push zurückgestellt** — `main` ist Produktionsbranch bei Cloudflare Pages.
6. **Prüfskripte (M10-004)** — nur tragende Belege nach `scripts/belege/`.
7. **GPL `pdf_signer`** — enge Einzel-Ausnahme, nicht generell geöffnet.
8. **Advisories** — erst messen, welche Pakete im ausgelieferten WASM landen.
9. **Revisionsbindung** — Prüfung von der Revision lösen, Revision beim Release binden.
10. **Rust-Hinweise** — verwaiste entfernen (Regel gebaut).
11. **13 Übergaben** — ergänzen, nur fehlenden Pflichtabschnitt anhängen, Wortlaut bleibt.
12. **M2-009/M3-001** — prüfen, dann über Entfall entscheiden.
13. **M8-005 (NEL)** — zurückgestellt.

**Nicht entschieden:** Aufnahme von `Zlib` und `Unicode-3.0` in `allowedExpressions`; die sechs
Pakete ohne Originaltext.

## Prüfungen

- **665 Tests grün**, `check` und `build` Exit 0 (nach jeder Änderung erneut gefahren).
- **M7-001 Einzelmessung** am ausgelieferten Build: dunkel 5,7562:1 (vorher 3,2799:1), hell
  5,6514:1, deaktiviert 1,5257:1 (WCAG nimmt deaktivierte Elemente aus). Unabhängig in Python
  nachgerechnet.
- **M7-001 Prüfer-Durchgang**: `viewport-audit.mjs a11y` in **beiden** Schemata —
  `Audit passed: 62 routes × 2 widths`, Exit 0, je Route `Kontrast=0`, `akzeptiert=0`.
- **`licenses:check` grün ohne Neuerzeugen** — der Kern der Revisionslösung, vorher unmöglich.
- **M8-004** gegen einen fremden CSV-Leser (Python), 11 Zeilen ohne Formelzeichen.

**Nicht geprüft:** deaktivierte Aktionsflächen gegen die WCAG-Anforderung (ausgenommen, Wert
gemessen); Hover/Fokus einzeln; M8-002-Offlineverhalten; M4-005/M4-006-Abnahmen im Browser.

## Offene Punkte und Risiken

- **Sieben Karten auf ◐**: M8-001 (R1), M4-002 (R2), M4-004/005/006, M8-002, M8-003 (R3). Bei
  M4-005, M4-006 und M8-002 fehlt nur die Abnahme; M4-002, M4-004 und M8-003 brauchen noch Code.
- **39 Karten nicht begonnen** (R4–R10), davon R4 als nächste ganze Stufe.
- **M8-005** wartet auf eine Betreiberentscheidung — zurückgestellt.
- **Risiko:** Ein Push veröffentlicht commietools.org; der Stand enthält sieben halbfertige Karten.
  Deshalb ausdrücklich zurückgestellt.
- Vier Anläufe des Prüfer-Durchgangs scheiterten an Vorbereitungsfehlern (Terminal, Datei-Redirect,
  Backtick im Prüfskript, falsche Adresse). Der letzte lief erst mit
  `COMMIETOOLS_AUDIT_URL=http://localhost:4173`.

## Empfohlener nächster Schritt

**M4-002 umsetzen** (Hinweis bei angezeigter Null): Die Entscheidung steht, der Eingriff ist klein —
`Calculation` braucht ein Kennzeichen, die Oberfläche den Hinweis, drei Sprachen den Text. Danach
die drei Belegarbeiten M4-005, M4-006 und M8-002 in einem Block, weil sie denselben Browser-Aufbau
brauchen.

## Git

- Kopf: `1469f56` · Arbeitsbaum sauber bis auf `uebergabe/03-konzepte/2026-10-06-tooltip-und-kontexthilfe.md`
  (**fremde Datei**, nicht von mir — nicht angefasst, nicht committet)
- **33+ Commits vor `origin/main`, nichts gepusht** (Entscheidung 5)
