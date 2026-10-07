# Übergabe: CommieTools QM-Sanierung — Stufe R9 abgeschlossen

**Datum:** 2026-10-07  
**Bearbeitet durch:** Faber (Hermes Agent) auf Anweisung von Thomas  
**Auftrag:** „R9 go" — Stufe R9 der QM-Sanierung (Karten `M4-009`, `M4-010` aus
`QM/70-reparaturempfehlungen/R9.md`) durchziehen. Ausdrücklich **nicht** beauftragt: der Push
(erst nach der unabhängigen Abschlusskontrolle), R10 (Betreiberentscheidung) und jede Änderung an
`licenses/registry.json`.  
**Status:** abgeschlossen

## Ziel der Sitzung

Beide Karten der Stufe R9 abarbeiten — eine Einheit je Karte: Auftrag im Wortlaut lesen,
Bestandsaufnahme gegen den Live-Stand, kleinster hinreichender Eingriff, Prüfkette, Beleg mit echter
Ausführung **und** Mutationsgegenprobe, Protokoll, Code- und Akten-Commit getrennt.

## Ergebnis

**R9 ist vollständig: 2 von 2 Karten.**

- **M4-009** — vier doppelte technische Verantwortlichkeiten sind zusammengelegt (nach Vertrag
  getrennt, nicht pauschal): `divRound`, `formatBytes`, Ergebnis-Adresse der Einzel-Ausgabe,
  Ladezustand der Werkzeugsuche. Die Karte nannte drei, zwei, zwei und zwei Stellen; gemessen waren
  es vier, vier, vier und fünf. Jede Zusammenlegung hat einen Wächter
  (`apps/web/src/consolidation.test.ts`).
- **M4-010** — die Kette aus 61 Vergleichen mit Rückfall auf `<PdfRedactTool/>` ist durch eine
  Zuordnungstabelle mit Vollständigkeitsprüfung ersetzt (`satisfies Record<ToolId, …>`); `ToolId`
  (alle 62 Bezeichner) erzeugt `scripts/catalog-generate.mjs` aus dem Register. Unbekannte Adresse und
  fehlende Zuordnung liefern klare Meldungen statt eines fremden Werkzeugs.

**Produktbefunde ohne eigene Karte** (mitbehoben und gemeldet): drei zusätzliche
Suchladezustände, eine zusätzliche `formatBytes`-Kopie, zwei zusätzliche Ergebnis-URL-Umsetzungen;
die Karte M4-009 nannte für `PdfPlacementTools.tsx:34` außerdem `usePdfDownload` — dort stand
tatsächlich `renderTextPng` (anderes Thema), die Kopie lag an anderer Stelle derselben Datei.

**Eine Lücke im Prüfmittel** wurde durch eine Mutationsgegenprobe aufgedeckt: `divRound` war von
**keiner** Prüfung direkt gefasst (das Abrunden eines halben Rests blieb unsichtbar). Geschlossen mit
`apps/web/src/rounding.test.ts`; erst danach griff die Gegenprobe. Drei Fehlschläge im Browserbeleg
waren ebenfalls Prüfmittel-Fehler (falsches Suchfeld, Dateifeld nach Neuaufbau, Klick auf den
Menüeintrag statt die Werkzeugtaste) — alle benannt und behoben.

## Geänderte Bereiche

- `packages/tools/src/calculator/rounding.ts` – neue gemeinsame Rundung (`divRound`), beide Aufrufer
  importieren sie; `aufmass.ts`/`commercial.ts` verlieren ihre Kopien
- `packages/tools/package.json` – Unterpfad `./calculator/rounding`; Haupteingang unverändert
- `apps/web/src/tools/resultUrl.ts` – **eine** Stelle für die Ergebnis-Adresse einer Ausgabe
- `apps/web/src/useToolSearchIndex.ts` – **eine** Stelle für den Ladezustand der Werkzeugsuche
- `apps/web/src/tools/{IconGenerator,ImageMetadata,ImageResize,ImageWatermark}.tsx` – gemeinsame
  Anzeigeform statt eigener Kopien (sichtbar: „KB"/zwei Nachkommastellen statt „kB"/einer)
- `apps/web/src/tools/{pdfUi,PdfInteractiveTools,PdfPlacementTools,PdfSecurityTools}.tsx` – nutzen
  `useResultUrl`
- `apps/web/src/{App,CatalogSection,ToolNavigation}.tsx` – Ladezustand bzw. Zuordnungstabelle
- `apps/web/src/{consolidation,rounding,tool-routing}.test.ts` – Wächter (neu)
- `scripts/catalog-generate.mjs` + `packages/tools/src/catalog/toolIndex.ts` – erzeugte `ToolId`-Union
- `packages/i18n/src/common/{de,en,es}.ts` – `tool.missingRenderer`, `tool.notFound`
- Akte: `06-protokolle/2026-10-07-r9-m4-009-zusammenlegung.md`, `…-m4-010-routenzuordnung.md`,
  Bildschirmabzüge unter `06-protokolle/screenshots/2026-10-07-r9-u1/` und `…-u2/`,
  Kartenstand in `00-einstieg/vorgehen-qm-audit.md`, `01-stand/offene-punkte.md` (OP-045 mit Zusatz)

## Entscheidungen und Annahmen

- **Nur gleiche Verträge gebündelt** (Vorgabe der Karte). Nicht zusammengelegt und mit Grund benannt:
  `PdfSplit` (Adressen für eine Liste), `PdfSecurityTools.formatBytes` (Anzeigekontext ohne
  Sprachzusage — die dokumentierte Ausnahme in `scripts/format-audit.mjs`), der abgeleitete
  Katalogschlüssel-Effekt in `App.tsx` (eigener Fehlerweg aus M4-004).
- **`ToolId` kommt aus dem Erzeuger**, nicht aus `manifests.ts`: ein `as const` im Register brach
  bestehende Aufrufer (`toolById.get(…)`, Katalogprüfungen). Die Karte nennt `toolIndex.ts` und
  `catalog-generate.mjs` selbst als Eingriffsstellen.
- **Die Zuordnung bleibt in `App.tsx`**: zehn der 61 Zweige nutzen statische Importe bzw. lokale
  Komponenten; eine Auslagerung hieße, diese zehn Namen erst zu verschieben.
- **OP-045 ist nur teils erledigt** und bleibt deshalb offen stehen (der Punkt nennt auch dasselbe
  Muster **nach** einem `await` in weiteren Werkzeugen — dazu wurde nichts gemessen).
- Die Anzeige der Bildgrößen ändert sich sichtbar („kB" → „KB", zwei Nachkommastellen ab 1 MiB).
  Das ist die Angleichung an die geprüfte Form aus R6, keine neue Regel — benannt und belegt.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (M4-009) | Exit 0 · 53 Dateien, 727 Tests, 0 Lint-Fehler, 110 Hinweise |
| `npm run build` (M4-009) | Exit 0 · Eingang 149 863 B gzip |
| `npm run check` (M4-010) | Exit 0 · 54 Dateien, 733 Tests, 0 Lint-Fehler, 110 Hinweise |
| `npm run build` (M4-010) | Exit 0 · Eingang 149 755 B gzip |
| Browserbeleg M4-009 (`tmp/m4-009-beleg.cjs`) | 3 Fälle, **BELEG ERBRACHT** |
| Browserbeleg M4-010 (`tmp/m4-010-beleg.cjs`) | 3 Fälle, **BELEG ERBRACHT** |
| Mutationsgegenproben | 3 (M4-009) + 4 (M4-010), alle mit `AssertionError` belegt |

## Offene Punkte und Risiken

- [ ] **OP-064** (aus R8) — `npm run build` scheitert im **frischen Checkout** an
  `licenses/registry.json` (`pdf_signer`); Betreiberentscheidung, nicht angefasst.
- [ ] **OP-045** — zweiter Teil offen (Adressmuster **nach** `await` in `PdfToImages`, `ImageMetadata`,
  `ImageResize`, `ImageWatermark`, `IconGenerator`); in R9 nicht gemessen.
- [ ] **OP-062/OP-063** (aus R8) — Strukturmigration nachträglich billigen?, weitere Belegskripte
  portieren?
- [ ] **OP-018/OP-034** — 132 Aktenlücken in historischen Übergaben (werden gemeldet, nicht gewertet).
- [ ] **Der Push** — erst nach der unabhängigen Abschlusskontrolle (Entscheidung Thomas, 2026-10-07);
  `main` ist der Produktionsbranch von Cloudflare Pages.
- Risiko: der Wächter `consolidation.test.ts` prüft den **Quelltext**, kein Verhalten. Die
  Verhaltensseite decken die Fachprüfungen und der Browserbeleg; die Grenze ist im Test benannt.

## Empfohlener nächster Schritt

1. **R10 aufnehmen** — die letzte Stufe, ausdrücklich Betreiberentscheidung (1 Karte,
   Infrastrukturberichte/NEL). Vorher gehört die Entscheidung zu OP-064 dazu, weil sie den baubaren
   `HEAD` betrifft.
2. Danach die **unabhängige Abschlusskontrolle** über alle Stufen; erst danach steht der Push zur
   Entscheidung.
3. Wenn gewünscht, den zweiten Teil von OP-045 messen (Zählerbeleg in **einem** Werkzeug; erst ein
   gezeigtes Leck macht daraus eine Fehlerklasse statt einer Vermutung).

## Git

- Commit (Code M4-009): `4a37e50` · Commit (Akte M4-009): `71864ed`
- Commit (Code M4-010): `b192eba` · Commit (Akte M4-010): `bfa723d`
- Commit dieser Übergabe und der Aktenpflege: `28a37aa` (Kartenstand, OP-045-Zusatz, diese Datei)
- Arbeitsbaum: nur die bekannten, bewusst nicht committeten Ausnahmen
  (`licenses/registry.json`, `apps/web/public/licenses/registry.json`, zwei
  `test-assets/m4-005-*.pdf`)

*Nachtrag 2026-10-07 (Faber, gemessen statt geschätzt):* Kopf nach dieser Stufe ist **`28a37aa`**.
R9 hat **fünf** Commits erzeugt (seit dem R8-Kopf `5769598`, gezählt mit
`git rev-list --count 5769598..HEAD`). Abstand zu `origin/main`: **140 Commits**.
- **Nichts gepusht.**

---

*Nachtrag 2026-10-07 (Faber): Kopf und Commit-Zahl werden nach dem letzten Akten-Commit mit
`git log -1 --format=%h` und `git rev-list --count` **gemessen** und im Abschnitt „Git" nachgetragen —
nicht geschätzt.*
