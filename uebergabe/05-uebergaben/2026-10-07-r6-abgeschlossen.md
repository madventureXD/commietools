# Übergabe: R6 abgeschlossen (Spanisch, Sonderzeichen und Formate)

**Datum:** 2026-10-07
**Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag:** *(nachgetragen 2026-10-07, QM-Karte M10-002 — das Kopffeld fehlte in dieser Übergabe.)* Thomas, wörtlich: „R6 Go, durchziehen." — die Karten der Stufe R6 aus `QM/70-reparaturempfehlungen/R6.md` abarbeiten, **kein Push**, R7–R10 nicht Teil. Der Wortlaut steht unverändert auch im Abschnitt „Ziel der Sitzung" unten.
**Status:** abgeschlossen — **R6 ist 7 von 7 Karten erledigt**

## Ziel der Sitzung

Thomas, wörtlich: „R6 Go, durchziehen." Damit: die sechs in `QM/70-reparaturempfehlungen/R6.md`
geführten Karten abarbeiten, jede mit gemessenem Beleg, Fortschritt auf der Platte, getrennten Code-
und Akten-Commits, ohne Push.

## Ergebnis

**Sieben Karten erledigt** (M3-007 stand zusätzlich in R6 und war in der Akte vorschnell als erledigt
geführt — die Einschätzung war falsch und ist berichtigt):

- **M3-001** Spanische Platzhalter: `{number}` in allen drei Quellen; Mutationsgegenprobe über die
  **Kette** (`catalog:check` Exit 1); UI-Beleg in drei Werkzeugen (spanisch, echte Nummer, 0
  Restklammern). **Mitbehoben:** drei pdf.js-Renderpfade hatten keine Zeitgrenze — im Bilderexport
  stand der Knopf dauerhaft auf „Procesando PDF…".
- **M3-003** Spanische Kerntexte: vier Sinnverwechslungen behoben (`Revelador`, `Ahorro` ×2,
  `software gratuito`), Fachglossar + `glossary:check` mit Mutationsgegenprobe; Lizenzseite,
  Werkzeugseite und Menü spanisch belegt.
- **M3-004** Zoll-Richtungen: beide Labels über Sprachschlüssel mit Parametern; neuer Prüfer
  `jsx:check` für sichtbare JSX-Literale (38 Texte geprüft, alle gedeckt) mit Gegenprobe; drei
  Sprachen belegt.
- **M3-006** Ton und Terminologie: vier echte Anredeverstöße auf den unpersönlichen Infinitiv
  umgestellt, fünf Positivkontrollen begründet unverändert; **datierter Stilnachtrag** in Konzept und
  Architektur; Stilcheck als Kandidatenmelder.
- **M3-007** Dateinamen: Kürzung jetzt an **Graphemgrenzen** (`Intl.Segmenter`) — ZWJ-Familien,
  Flaggen, Hauttöne und kombinierende Zeichen werden nicht mehr zerschnitten.
- **M3-008** Titelschreibung: Wortgrenzen über `Intl.Segmenter`/`isWordLike`; `¡hola! ¿qué tal?` →
  `¡Hola! ¿Qué Tal?`; Bindestrich-/Apostrophregel ausdrücklich festgelegt.
- **M3-010** Zahlenformate: gemeinsamer **Formatkontext** (Sprache und Region getrennt, Default
  benannt), vier genannte Stellen umgestellt; Sprache es bei Browser de-DE → „1.234.567,5", bei en-US
  → „1,234,567.5".

## Geänderte Bereiche

- `packages/tools/src/format.ts` (neu) — Formatkontext, `formatNumber`, `formatBytes`,
  `formatDateTime`, `formatTechnicalNumber`
- `packages/tools/src/index.ts` — Titelschreibung über `Intl.Segmenter`; Exporte des Formatkontexts
- `packages/i18n/src/common/es.ts` — vier Sinnverwechslungen, Anredehinweis
- `packages/tools/src/calculator/convert/locales/{de,en,es}.ts` — Einheitenzeichen und
  Richtungsmuster
- `packages/tools/src/pdf/{m6,placement}/locales/es.ts` — Imperativ → Infinitiv
- `packages/tools/src/calculator/shell/locales/es.ts` — Anrede in Fehlermeldung
- `apps/web/src/tools/{pdfUi,Convert,ColorTools,Statistics,PdfSecurityTools,PdfMaintenanceTools}.tsx`
- `apps/web/src/{save-file.test.ts,App.test.ts,format-context.test.ts}`
- `scripts/{jsx-literal-audit,glossary-audit,style-audit}.mjs` (neu) + `package.json` (`jsx:check`,
  `glossary:check`, `style:check` in `npm run check`)
- Akte: Protokolle M3-001/003/004/006/007/008/010, `02-architektur/fachglossar-spanisch.md`,
  `03-konzepte/2026-10-03-sprachpaket-spanisch.md` (Stilnachtrag), `02-architektur/sprachpakete.md`,
  `01-stand/offene-punkte.md`, `00-einstieg/vorgehen-qm-audit.md`

## Entscheidungen und Annahmen

- **Entscheidung:** Zoll-Richtungen werden über Sprachschlüssel mit Parametern geführt; die
  Einheitenzeichen stehen als eigene Werte (de „Zoll", en/es „in"), das Muster `{from} → {to}`.
  Grund: fachlich eindeutig und übersetzbar, ohne Einheiten zu verstecken.
- **Entscheidung:** Bindestrich **trennt** Wortteile (`casa-mundo` → `Casa-Mundo`), Apostroph
  **trennt nicht** (`don't` → `Don't`). Die Karte verlangt eine ausdrückliche Festlegung.
- **Entscheidung:** Der Stilcheck **urteilt nicht**, er meldet Kandidaten. Ein Versuch,
  Satzkontext automatisch zu klassifizieren, lieferte widersprüchliche Ergebnisse und wurde
  verworfen (falsche Sicherheit).
- **Annahme:** Kostenfreiheit (`app.tagline`) und Freie Software (`licenses.projectDescription`)
  sind getrennte Aussagen — beide bleiben, ausdrücklich benannt.
- **Nicht getan (Karte M3-010):** die übrigen 25 Formatierstellen wurden **nicht** pauschal
  umgestellt („nicht alle `toFixed`-Aufrufe lokalisieren") — als Befund gemeldet, nicht verschwiegen.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **Exit 0** — 715 Tests in 51 Dateien, 0 Lint-Fehler (109 Warnungen, Bestand), `tokens:check`, `jsx:check`, `glossary:check` laufen mit |
| `npm run build` | **Exit 0** |
| Mutationsgegenproben | M3-001 (`catalog:check` Exit 1), M3-007 (ZWJ durchgefallen, `1 failed/707 passed`), M3-008 (`'¡hola! ¿qué tal?'` statt `'¡Hola! ¿Qué Tal?'`), M3-003 (`glossary:check` Exit 1), M3-010 (`expected '4.5 KB' to be '4,5 KB'`) |
| UI-Belege (kopflose Edge, je Fall frischer Browser) | M3-001 (3 Werkzeuge), M3-003 (Lizenzseite, Werkzeugseite, Menü), M3-004 (3 Sprachen), M3-006 (2 Werkzeugseiten), M3-010 (2 Browsersprachen) |

## Offene Punkte und Risiken

- [ ] **25 weitere Formatierstellen** folgen weiter der Oberflächensprache statt dem Formatkontext
  (Aufmaß, Kabel, Beton, Trockenbau, Böden, Geometrie, Wärmelast, Icon-Generator u. a.). Vorschlag:
  eigene Karte „Werkzeugausgabe folgt dem Formatkontext", messbar über die Anzahl der
  `Intl.NumberFormat(locale, …)`-Stellen gegen 0.
- [ ] **Keine muttersprachliche Abnahme** des Spanischen. Die Karte M3-003 verbietet ausdrücklich,
  einen Regexlauf als muttersprachlich abgenommen zu bezeichnen. Spanischsprachige Gegenlesung steht
  weiter aus — sie ist der einzige Weg, die Stilentscheidungen wirklich abzuschließen.
- [ ] **Der pdf.js-Hänger** (mehrere Ladevorgänge derselben Route in einer Browser-Sitzung) ist
  **nicht behoben**, sondern gemeldet: alle Renderpfade haben jetzt eine Zeitgrenze und zeigen
  `tool.pdf.error.timeout`. Auslöser liegt auf Browser-/Bibliotheksebene.
- [ ] `tool.pdfToImages.download` ist ein **ungenutzter Sprachschlüssel** (nur im Sprachvertrag).
- [ ] Zwei Dateien (`licenses/registry.json`, `apps/web/public/licenses/registry.json`) sind im
  Arbeitsbaum geändert und **nicht** von dieser Arbeit — nicht angefasst, nicht committet.
- [ ] Die Sichtprüfung „sichtbare JSX-Literale" führt pro Treffer eine **manuell gepflegte**
  Ausnahmeliste; ein Prosawort in der Liste würde den Prüfer entwerten.

## Empfohlener nächster Schritt

1. **Push-Entscheidung** (liegt bei Thomas): `main` ist **96 Commits** vor `origin/main`; R1–R6 sind
   belegt und abgenommen, aber nichts davon ist veröffentlicht.
2. **R7 aufnehmen** (laut Leitfaden begleitend zu R6 — jetzt mit R6 erledigt): im
   `vorgehen-qm-audit.md` als nächste offene Stufe geführt.
3. Vorher klären: soll die Restsichtenliste (25 Formatierstellen) als eigene Karte in R7/R8 laufen?

## Nachtrag 2026-10-07 (nach dem Abschluss dieser Übergabe)

Der oben als **offener Punkt** geführte Befund „25 Formatierstellen folgen weiter der
Oberflächensprache" ist **erledigt** worden — auf Thomas' Anweisung („Ja, mache das nun") noch in
derselben Sitzung, **vor** R7:

- 26 Stellen beurteilt, **25 Anzeige-Stellen** auf den gemeinsamen Formatkontext umgestellt
  (`anzeigeKontext()`, `apps/web/src/tools/formatContext.ts`); **1 technische Ausnahme** bleibt
  begründet (`aufmassPdf.ts`, `useGrouping: false` — Exportwert).
- Neuer Prüfer `npm run format:check`, eingehängt in `npm run check`; Gegenprobe gefahren
  (eine Stelle zurückgestellt → Exit 1 mit Fundstelle).
- UI-Beleg mit **abweichender** Geräte-Region: Oberfläche deutsch + Gerät en-US → „1,234,567.5" und
  „1,523,990.25"; Oberfläche spanisch + Gerät de-DE → „1.234.567,5" und „1.523.990,25".
- Protokoll: `06-protokolle/2026-10-07-formatkontext-reststellen.md` · Commits `34be880` (Code),
  `40ac01c` (Akte). Prüfkette unverändert grün (715 Tests, 51 Dateien).

Damit ist der Punkt **nicht mehr offen**; der Eintrag oben bleibt als damaliger Stand stehen.

## Git

- Commits: `7123077`, `02af58a` (M3-001) · `0673e4f`, `360accc`, `6302ca6` (M3-007) · `0ed056c` (M3-008)
  · `ba3098e` (M3-004) · `bf65c01`, `d7ff3ae`, `03850ab` (M3-003) · `66be1cb`, `5a1ff4d` (M3-006) ·
  `33278da`, `fdbbb91` (M3-010)
- Arbeitsbaum: sauber bis auf die beiden fremden `licenses/registry.json`-Änderungen
- **Nichts gepusht** — 96 Commits vor `origin/main`
