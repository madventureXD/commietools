# Übergabe: R7 abgeschlossen (Wahrheitsgemäße Produkt- und Architekturakten)

**Datum:** 2026-10-07
**Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag:** CommieTools — QM-Sanierung, Stufe R7 durchziehen (8 Karten), **kein Push**, R8–R10 nicht Teil
**Status:** abgeschlossen — **R7 ist 8 von 8 Karten erledigt**

## Ziel der Sitzung

Die Karten der Stufe R7 aus `QM/70-reparaturempfehlungen/R7.md` abarbeiten, eine Einheit pro Karte:
Auftrag im Wortlaut lesen, gegen den Live-Stand prüfen, kleinster hinreichender Eingriff, Prüfkette,
Beleg mit echter Ausführung **und** Mutationsgegenprobe, Protokoll, Code- und Akten-Commit getrennt.
Produktfehler ohne eigene Karte mitbeheben und melden. Kein Push.

## Ergebnis

**Acht Karten abgeschlossen.** R7 hieß „Produkt- und Architekturakten, die nicht wahr sind" — jede
Karte hat eine Aussage der Dokumentation gegen den echten Stand gestellt und, wo nötig, korrigiert.

- **M1-001** (README-Umfang): Umfangszahlen sind aus dem kanonischen Katalog **generiert**
  (`scripts/readme-scope.mjs`, `readme:check` in `check`). Am ausgelieferten Bau nachgezählt:
  **62 Tools / 7 Suiten / 23 PDF-Werkzeuge** — deckungsgleich mit dem Block.
- **M1-002** (Suche): README, Hinweistext de/en/es und Suchkommentar sagen jetzt „gewählte Sprache
  plus Englisch"; der erzeugte Lader ruft Englisch **nicht mehr doppelt** auf; neuer Vertragstest.
  Beleg: vier Browsersprachen/-wechsel, 19 Befunde grün.
- **M2-001** (M7-Freigabekriterien): neuer **ADR 0014**, Status **`vorgeschlagen`** — Produktstand und
  Nachweis je Gate aus ADR 0004, offene Punkte benannt; ADR 0004 datiert verknüpft, Wortlaut erhalten.
- **M2-002** (Größenpolitik): datierter Nachtrag in ADR 0003 (Warnung vs. harter Fehler), an zwei
  Gegenproben belegt. **Prüfmittel-Lücke gefunden und behoben** (siehe unten).
- **M2-003** (Rechner-Budgets): Nachtrag in ADR 0005 (250→200 KiB, 95→110 KiB; 89,5/100,6/103.801 B
  sauber getrennt), Baseline selbsterklärend, **harte Regel „mathjs nie im Start"** ergänzt.
- **M2-004** (QPDF): ADR 0002 auf Sicherheit **und** Reparatur erweitert, Aufrufer und Ladegrenze
  benannt; im Browser holen Reparatur und Kompression **dieselbe** `qpdf-*.wasm`.
- **M2-005** (Entscheidungsindex): Doppelnummer 0006 aufgelöst (M9-Entscheidung → **0013**, Weiter-
  verweisakte am alten Pfad), Index vollständig; neuer **Doku-Gate `npm run adr:check`** in `check`.
- **M11-001** (Architektur): `docs/architecture.md` mit datiertem Iststand — je Grenze Codeanker,
  Verantwortung, Restarbeit; die Behauptungen K30/K31 sind geschlossen.

**Zwei Prüfmittel-Fehler gefunden und behoben** (Produktfehler-Klasse dieser Karten):

1. Der **Bundle-Prüfer ließ eine statisch eingebundene PDF-Engine durch** — er suchte `qpdf-wasm`,
   die Emscripten-Brücke heißt zur Laufzeit `qpdf.wasm`. Gemessen: der Starteingang wuchs auf
   167.133 B gzip, der Bau blieb grün. Signatur ergänzt; dieselbe Gegenprobe scheitert jetzt.
2. Das **neue ADR-Gate war zu weich**: es prüfte den Rückverweis nur als Text, nicht als Link, und
   zog bei fehlendem Link irgendeinen anderen Verweis heran. Nachgeschärft; die Gegenprobe greift.

**Unterlassung berichtigt:** die Leitdatei war nach R6 **nicht** nachgezogen — fünf Karten standen
dort noch auf „○". Datiert nachgetragen (alter Stand bleibt erkennbar).

## Geänderte Bereiche

- `README.md` — generierter Umfangsblock, Suchsatz präzisiert
- `packages/i18n/src/common/{de,en,es}.ts` — `catalog.searchHint`
- `packages/tools/src/catalog/search.ts`, `packages/tools/src/catalog/generated/loaders.ts` (erzeugt)
- `scripts/catalog-generate.mjs` (Englisch nur einmal laden), `scripts/readme-scope.mjs` (neu),
  `scripts/adr-audit.mjs` (neu), `scripts/bundle-audit.mjs` (qpdf-Signatur, harte mathjs-Regel),
  `scripts/bundle-size-baseline.json` (selbsterklärend)
- `apps/web/src/tool-search.test.ts` (Vertragstest, +4 Tests)
- `package.json` — `readme:check`, `readme:generate`, `adr:check`; `check` erweitert
- `docs/architecture.md` — Iststand 2026-10-07, vertagende Formulierungen korrigiert
- `uebergabe/04-entscheidungen/` — ADR 0002/0003/0005 datiert ergänzt, **ADR 0013** (nachvergeben),
  **ADR 0014** (neu, vorgeschlagen), Weiterverweisakte, Index
- `uebergabe/00-einstieg/vorgehen-qm-audit.md`, `01-stand/offene-punkte.md`, `01-stand/roadmap.md`,
  acht Protokolle unter `06-protokolle/2026-10-07-r7-*.md`, Belege unter
  `06-protokolle/screenshots/2026-10-07-r7-u1|u2|u4|u7/`

## Entscheidungen und Annahmen

- **Reihenfolge geändert:** M2-005 (Index + Gate) lief **vor** M2-001 (neuer ADR). Grund: der neue
  ADR braucht den Gate und einen sauberen Index. Die Kartenreihenfolge ist laut Auftrag eine
  Empfehlung; die technische Reihenfolge ist meine Entscheidung. Im Fortschritt benannt.
- **ADR 0014 bleibt `vorgeschlagen`** — die Freigabe ist eine Betreiberentscheidung und wurde
  **nicht** vorweggenommen. Historisch nicht belegte Angaben sind als solche geführt (die
  „Nutzerfreigabe 2026-10-03" nennt keine Revision).
- **Migrationswahl:** die M9-Entscheidung wandert auf **0013** (wenigste Verweise), nicht die
  Rechner-Entscheidung; keine inhaltliche Verschmelzung, beide Dateien erhalten.
- **Größenreferenz nicht angefasst** — eine Neusetzung würde Warnungen verstecken.
- **Vorwegnahme:** für Karten ohne Laufzeitbezug (ADR-Arbeiten) wurde **kein** Browser-Beleg
  erfunden; die Abnahme dort ist der Doku-Gate und die Messung. Wo Laufzeit zählt, wurde gemessen.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Endstand) | **Exit 0** — **719 Tests** in 51 Dateien (715 + 4 neue), 0 Lint-Fehler (109 Warnungen, Bestand), `readme:check` und `adr:check` laufen mit |
| `npm run build` (Endstand) | **Exit 0** — Bundle-Audit bestanden, Eingang 150.082 B gzip, Rechenkern-Chunk 103.801 B gzip |
| ADR-Gate | grün: 15 Dateien, 14 Entscheidungen + 1 Weiterverweisakte, Index vollständig, Nummern eindeutig |
| Mutationsgegenproben | M1-001 (2, in isolierter Kopie), M1-002 (`expected [ 'es' ] to deeply equal [ 'en', 'es' ]`), M2-005 (5), M2-001 (3), M2-002 (2), M2-003 (1), M2-004 (1) — jede mit Wiederherstellung, wo Dateien betroffen waren per Hash geprüft |
| Browser-Belege (kopflose Edge, je Fall frischer Browser) | M1-001 (62/7/23, deckungsgleich), M1-002 (4 Fälle, 19 Befunde), M2-001 (4 Fälle, Engine nur im Werkzeug), M2-004 (3 Fälle, dieselbe `qpdf-*.wasm`), M11-001 (Messung an `sw.js`) |

## Offene Punkte und Risiken

- [ ] **ADR 0014 braucht Thomas' Entscheidung** (`vorgeschlagen`). Offen vor einer Annahme:
  Schwachstellenstand des Signaturpfads (Gate 3), unabhängige Sicherheitsreview (Gate 10), fehlender
  Originalhinweis der GPL-Komponente (Gate 2), revisionsgebundener Abnahmebericht zum M7-Korpus.
- [ ] **Kein Prüfer bewacht die Leitdatei** `vorgehen-qm-audit.md` — die fünf falschen R6-Zeilen
  standen unbemerkt. Der neue Gate deckt nur den ADR-Index ab.
- [ ] **Kein Prüfer bewacht `docs/`** — die Iststandstafel ist eine Messung, keine Zusicherung.
- [ ] **Größenreferenz weiterhin veraltet** (bewusst): Abweichungszeilen im Baubricht sind groß.
- [ ] **Der historische M7-Prüfkorpus nennt keine Revision** — Gate 3 bleibt ohne Nachweis.
- [ ] **Nicht geprüft:** ob die **ausgelieferten** HTTP-Kopfzeilen die CSP aus
  `apps/web/public/_headers` tragen (nichts gepusht).
- [ ] Der Bundle-Prüfer erkennt nur **gepflegte** Signaturen; eine neue Engine-Brücke braucht einen
  Eintrag, sonst ist sie unsichtbar.
- [ ] **Nicht geprüft:** die drei `toolMessages … gesamt`-Größenwarnungen des laufenden Stands.

## Empfohlener nächster Schritt

1. **Entscheidung zu ADR 0014** (Thomas): annehmen, ablehnen oder die fehlenden Nachweise
   (Gate 3/Gate 10) erst beschaffen. Ohne Entscheidung bleibt die Sperre aus ADR 0004 sichtbar stehen.
2. **R8 aufnehmen** (Übergaben, Abschlusskriterien, Prüfverfahren) — dort wartet u. a. die eigene
   Karte M10-004 („wesentliche Prüfskripte fehlen im versionierten Bestand"), die genau die Belege
   betrifft, die in diesem Durchzug unter `work/` liegen.
3. **Push-Entscheidung** bleibt bei Thomas: `main` liegt weit vor `origin/main`, ein Push
   veröffentlicht commietools.org.

## Git

- Commits: `85e2cd0`, `ca2abeb` (M1-001) · `a1e0e11`, `eb354bc` (M1-002) · `00fa7e8`, `d3fd994` (M2-005)
  · `9d87eb7` (M2-001) · `e72c403`, `c61ac22` (M2-002) · `607c2d7`, `18b0ce2` (M2-003) · `f0b6f7a`
  (M2-004) · `26591fd` (M11-001) · Akten-Commit dieses Nachzugs (R6-Nachtrag, Kartenstände, offene
  Punkte, diese Übergabe)
- Arbeitsbaum: sauber bis auf die beiden fremden `licenses/registry.json`-Änderungen und die zwei
  M4-005-Testdateien (bewusst nicht angefasst)
- **Nichts gepusht** — 114 Commits vor `origin/main` (gemessen mit
  `git rev-list --count origin/main..HEAD` vor den Akten-Commits dieses Nachzugs)
