# R7 / M1-001 — Haupt-README beschreibt einen veralteten Produktumfang: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „README-Umfang veraltet; aktueller Snapshot enthält 62 Tools." …
„Aktuelle Umfangszahlen aus kanonischem Katalog ableiten. Bevorzugt kleiner generierter, klar
markierter README-Bestandsblock mit Generator-check statt Zahlen über Fließtext zu verteilen."
**Status:** **erledigt** — die Zahlen stehen generiert in der README, der Prüflauf wacht darüber.

## Was der Befund war

Die README trug ihre Umfangszahlen als Fließtext und war stehen geblieben:

- „with **twenty-three** local tools and **five** curated suites" — tatsächlich **62 Tools** in
  **7 Suiten**.
- „The PDF suite provides **fourteen** tools" — tatsächlich **23 PDF-Werkzeuge**.
- „a **three-language** … catalogue" — die Zahl war richtig (de/en/es), gehörte aber genauso in
  eine gepflegte Quelle.

## Bestandsaufnahme gegen den Live-Stand

Gemessen mit `work/r7-zaehlen.mjs` (liest `packages/tools/src/catalog/manifests.ts` wie der
Kataloggenerator über `ts.transpileModule`):

```
tools=62   suites=7   pdfRoutes=23
categories= pdf:23 craft:17 calculator:12 image:6 text:2 developer:1 generator:1
suiteIds=text,developer,generators,image,pdf,calculator,craft
```

Der Anker der Karte (`README.md:68`, „twenty-three") zeigte auf dieselbe Zeile wie heute.

## Umsetzung (kleinster hinreichender Eingriff)

- **Neu:** `scripts/readme-scope.mjs` mit den Betriebsarten `generate` und `check`. Es leitet Tools,
  Suiten, Sprachen, PDF-Anteil und Kategorien aus dem **kanonischen Katalog** ab und schreibt einen
  klar markierten Block zwischen
  `<!-- BEGIN GENERATED SCOPE (scripts/readme-scope.mjs) -->` und `<!-- END GENERATED SCOPE -->`.
- **README:** der Zahlen-Fließtext ist durch den generierten Block ersetzt; die beschreibenden Sätze
  bleiben redaktionell und tragen keine harten Zahlen mehr. Sechs weitere Zahlen-Aussagen im Umfeld
  wurden zu qualitativen Sätzen (die Karte verbietet „hartgeschriebene neue Zahlen").
- **`package.json`:** `readme:generate` und `readme:check`; `readme:check` hängt in `npm run check`.
- **Nicht getan (Kartengrenze):** historische 41/54 wurden **nicht** durch 62 ersetzt; alte
  Protokolle behalten ihre damaligen Werte.
- **Offen gelassen (kein Teil dieser Karte):** der von der Karte gewünschte Abgleich mit R9
  (gemeinsame Bausteine/Routing) — R9 ist nicht Teil dieses Auftrags.

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| 62 Tools, 7 Suiten, 23 PDF-Routen gegen Generator/Registry prüfen | ✓ Generator meldet **62/7/23**; zusätzlich am ausgelieferten Bau gezählt (siehe Beleg) |
| Testtool in isolierter Kopie: veralteter Bestandsblock wird erkannt | ✓ `README_SCOPE_PATH` auf eine **Kopie** → Mutation „62" → „41" ⇒ Exit 1 mit Fundstelle |
| Neugenerierung deterministisch | ✓ zweimal `readme:generate` ⇒ identische SHA-256 (`3fb286fa…`) |
| Links funktionieren | ✓ `readme:check` prüft die relativen Markdown-Links der README und meldet keinen Bruch; Gegenprobe: kaputter Link ⇒ Exit 1 |

## Mutationsgegenproben (in isolierter Kopie, die echte README bleibt unberührt)

1. **Veralteter Bestandsblock** — in der Kopie `**62 tools**` → `**41 tools**`:
   `README scope audit failed: README scope block is out of date … now: … **41 tools** …`
2. **Kaputter Link** — in der Kopie `docs/architecture.md` → `docs/architektur-gibt-es-nicht.md`:
   `README scope audit failed: README has broken links: docs/architektur-gibt-es-nicht.md`

Beide Male Exit 1; der echte Lauf danach wieder Exit 0.

## Beleg am ausgelieferten Bau (kopflose Edge über CDP, frischer Browser)

`work/r7-u1-beleg.cjs`, gegen `vite preview` des **frischen Baus** — die README-Behauptung gegen die
laufende Anwendung:

| Messung | Wert |
|---|---|
| Werkzeugkarten (`.catalog-card` ohne `.suite-card`) auf `/tools` | **62** |
| davon Kategorie **PDF** | **23** |
| Suiten (`.suite-card`) | **7** |
| deckungsgleich mit dem generierten Block | **true** |
| Seitenfehler / Anfragen an fremde Hosts | 0 / 0 |

Aufnahme: `screenshots/2026-10-07-r7-u1/katalog.png` (angesehen: Katalograster mit 62 Karten,
Kategorien sichtbar, unten „Werkzeug-Suites" mit 7 Karten) · Log
`screenshots/2026-10-07-r7-u1/beleg.txt`.

**Nebenbefund (kein Produktfehler):** Werkzeug- und Suitenkarten teilen die Basisklasse
`.catalog-card`; die Suitenkarte ergänzt `.suite-card`. Ein naiver Zähler über `.catalog-card` ergibt
deshalb 69. Im Belegskript ist das getrennt.

## Prüfkette

`npm run check` **Exit 0** — 715 Tests in 51 Dateien, 0 Lint-Fehler, `readme:check` läuft mit ·
`npm run build` **Exit 0**. Code-Commit `85e2cd0`. Nichts gepusht.

## Grenzen

- Der Prüfer deckt **Zahlen und README-Links** ab. Beschreibende Aussagen („offline", „lokal")
  bleiben redaktionell, wie die Karte es ausdrücklich vorsieht.
- Die Fortschrittsdatei `work/r7-fortschritt.md` ist wie `work/` insgesamt durch die Projekt-.gitignore
  **nicht versioniert**; sie überlebt als Arbeitsstand, nicht als Commit.
