# Stufe R9 · Karte M4-010 — Routenzuordnung mit Vollständigkeitsprüfung

Datum: 2026-10-07 · Stufe: R9 (gemeinsame Bausteine und Routing) · Karte: **M4-010**
„Routenzuordnung hat einen fachfremden Standardfall statt Vollständigkeitsprüfung"

## Auftrag im Wortlaut (Auszug aus `QM/70-reparaturempfehlungen/R9.md`)

> **Stand dieser Empfehlung:** Fachfremder Default bleibt latentes Registry-/Erweiterungsrisiko.
> **Eingriffsstellen:** `apps/web/src/App.tsx:42` (Anker „PdfRedact"), `packages/tools/src/catalog/toolIndex.ts:6`
> (Anker „export"), `packages/core/src/index.ts:58` (Anker „ToolManifest"), `scripts/catalog-generate.mjs:32`
> (Anker „function"). **Dauerhafte Lösung:** … ToolId aus kanonischem Register als Literalunion
> erzeugen und Zuordnung mit `satisfies Record<ToolId,…>` prüfen; wenn bestehende string-Typisierung
> Union verwischt, zusätzlich generatorseitiger Mengenvergleich. Unbekannte URL liefert Not-found,
> bekannte ID ohne Renderer klaren Konfigurationsfehler; nie fachfremdes Werkzeug. Lazy-Ladegrenzen
> erhalten. Lookup eigener Schlüssel/Map statt ungeprüfter Objektprototypen. **Abnahme:** Alle 62
> Snapshot-IDs genau einmal gerendert … Entfernten Renderer/neue ID ohne Renderer erkennt Gate.
> `/tools/nicht-vorhanden` öffnet nicht `pdf-redact`. **Nicht tun:** nicht lediglich `default` durch
> noch ein anderes Tool ersetzen; keine komplette Routingbibliotheksmigration.

## 1. Bestandsaufnahme (gemessen)

| Gegenstand | Messung |
|---|---|
| Werkzeug-IDs im Register (`packages/tools/src/catalog/manifests.ts`) | **62** |
| Zweige der Vergleichskette in `App.tsx` | **61** explizite Vergleiche `tool.id === '…'` |
| Rückfall der Kette | `<PdfRedactTool/>` — **fachfremd** (Schwärzen) |
| Zuordnung heute vollständig? | **ja** — 61 Zweige + `pdf-redact` decken alle 62 IDs ab. Der Mangel ist **strukturell**: er zeigt sich erst, wenn eine ID ohne Zweig dazukommt oder ein Zweig entfällt |
| Nachladen | 54 der Komponenten laden nach (`lazy`), 6 sind statisch eingebunden, 2 sind lokale Komponenten in `App.tsx` |
| Typ des Bezeichners | überall `string` — keine Literalunion, also keine Vollständigkeitsprüfung möglich |
| Prototyp-Gefahr | die Kette fragt Werte ab, keine Objektprototypen — der Punkt der Karte trifft die **neue** Tabelle, nicht den Altstand |

## 2. Eingriff

1. **Erzeuger** (`scripts/catalog-generate.mjs`): schreibt `export type ToolId = '…' | '…'` mit **allen
   62 Bezeichnern** in `packages/tools/src/catalog/toolIndex.ts`. Die Liste kommt aus dem Register —
   sie wird nicht zweitgepflegt. `catalog:check` hält sie automatisch aktuell.
2. **Zuordnung** (`apps/web/src/App.tsx`): die 61 Vergleiche und der Rückfall sind ersetzt durch

   ```ts
   export const toolRenderers = {
     'text-statistics': TextStatisticsTool,
     …62 Einträge…
   } satisfies Record<ToolId, WerkzeugKomponente>
   ```

   Die Zuordnung bleibt in `App.tsx`, weil zehn Zweige statische Importe und lokale Komponenten
   benutzen — eine Auslagerung hieße, diese zehn Namen erst zu verschieben, ohne Gewinn für die Karte.
3. **Aussehen** (statt Rückfall): `rendererFor(id)` liefert `undefined`, wenn es keine Zuordnung gibt;
   die Seite zeigt dann die Meldung `tool.missingRenderer` (neu in den drei Sprachkatalogen) — es wird
   **nie** ein anderes Werkzeug geöffnet.
4. **Adresse ohne Werkzeug:** `/tools/…` ohne Treffer zeigt `tool.notFound` (neu) statt still der
   Startseite; vorher war der Fall von der Startseite nicht zu unterscheiden.
5. **Nachschlagen:** `Object.hasOwn` (eigene Schlüssel) statt Auskunft über die Objektvorlage.
6. **Nachladen unverändert:** die `lazy`-Grenzen sind unangetastet; der Beleglauf misst am Eingang
   **149 755 B gzip** (vorher 149 863 B — die Tabelle ist beim Übersetzen eingefroren).

## 3. Prüfkette (ausgeführt)

- `npm run check` — **Exit 0** · **54** Prüfdateien, **733** Tests · 0 Lint-Fehler, 110 Hinweise
  (`tmp/check-u2.log`)
- `npm run build` — **Exit 0** · Eingang **149 755 B gzip** (`tmp/build-u2.log`)
- `npm run catalog:check` ist Teil der Prüfkette und vergleicht den erzeugten Katalog samt `ToolId`
  mit der Datei (grün)

## 4. Beleg gegen den ausgelieferten Bau (`tmp/m4-010-beleg.cjs`, je Fall frischer Browser)

| Fall | Messung | Ergebnis |
|---|---|---|
| A | `/tools/nicht-vorhanden` → Meldung „Diese Werkzeugadresse gibt es nicht. Die Übersicht zeigt alle Werkzeuge.", **0** Werkzeughüllen, kein Schwärzen-Werkzeug | ok |
| B | `/tools/text-statistics` (lokale Komponente) und `/tools/image-resize` (nachgeladen): je genau **1** Werkzeughülle, Überschrift „Textstatistik" bzw. „Bild skalieren" | ok |
| C | `/tools/constructor` und `/tools/toString`: 0 Werkzeughüllen, Meldung steht da (kein Prototyp-Treffer) | ok |

Abzüge und Textausgabe: `uebergabe/06-protokolle/screenshots/2026-10-07-r9-u2/`.

## 5. Mutationsgegenproben (`tmp/m4-010-mutationen.mjs`)

| Nr. | Mutation | Belegzeile | Ergebnis |
|---|---|---|---|
| M1 | Eintrag `pdf-merge` entfernt | `AssertionError: expected [ 'pdf-merge' ] to deeply equal []` | GRIFF |
| M2 | Eintrag `nicht-im-register` ergänzt | `AssertionError: expected [ 'nicht-im-register' ] to deeply equal []` | GRIFF |
| M3 | Suche über `in` statt `Object.hasOwn` | `AssertionError: expected [Function Object] to be undefined` | GRIFF |
| M4 | unbekannte ID auf `PdfRedactTool` geleitet (die alte Voreinstellung) | `AssertionError: expected { Object ($$typeof, _payload, …) } to be undefined` (2×) | GRIFF |

Alle vier greifen im ersten Anlauf; ein Prüfmittel-Fehler trat in dieser Karte nicht auf.

## 6. Was die Abnahme fordert — und womit sie belegt ist

- **„Alle 62 Snapshot-IDs genau einmal gerendert"** — `apps/web/src/tool-routing.test.ts` zählt die IDs
  aus dem Register (nicht aus einer abgeschriebenen Liste): 62 eindeutige IDs, jede mit Komponente,
  keine Zuordnung ohne Register-Werkzeug. Doppelte Schlüssel sind in einem Objekt nicht möglich.
- **„Entfernten Renderer/neue ID ohne Renderer erkennt Gate"** — zwei Tore: die Typprüfung
  (`satisfies Record<ToolId, …>`, greift beim Übersetzen) und die Laufzeitprüfung (M1/M2 oben).
- **„`/tools/nicht-vorhanden` öffnet nicht `pdf-redact`"** — Belegfall A, Mutationsgegenprobe M4.
- **„Lazy-Ladegrenzen erhalten"** — keine Änderung an den `lazy`-Grenzen; die Eingangsgröße ist
  gemessen (149 755 B gzip).

**Ehrliche Grenze:** Der Browserbeleg prüft fünf Adressen, nicht alle 62. Die Vollständigkeit ist über
Register, Typprüfung und Prüfskript belegt, nicht über 62 Bildschirmabzüge.

## 7. Offene Punkte

Keine neuen. `pdf-redact` ist von der Rückfallstelle zu einer regulären Zuordnung geworden; die
frühere Sonderstellung ist damit auch in der Typprüfung sichtbar.

---

*Zusatz 2026-10-07 (Belegskripte versioniert):* Die in dieser Datei genannten Belegskripte lagen beim Schreiben unter `tmp/` — das ist
durch die Projekt-`.gitignore` **nicht versioniert** und in einem frischen Checkout nicht vorhanden
(dieselbe Lücke, die Karte M10-004 beschreibt). Sie sind **nachgezogen** und liegen jetzt versioniert
in `scripts/belege/`:

| vorher (nicht versioniert) | jetzt (versioniert) |
|---|---|
| `tmp/m4-009-beleg.cjs` | `scripts/belege/zusammenlegung-beleg.cjs` (`npm run beleg:zusammenlegung`) |
| `tmp/m4-010-beleg.cjs` | `scripts/belege/routing-beleg.cjs` (`npm run beleg:routing`) |
| `tmp/m4-009-mutationen.mjs` | `scripts/belege/mutation-zusammenlegung.mjs` (`npm run beleg:mutation-zusammenlegung`) |
| `tmp/m4-010-mutationen.mjs` | `scripts/belege/mutation-routing.mjs` (`npm run beleg:mutation-routing`) |
| `work/ct-harness.cjs` | `scripts/belege/cdp-harness.cjs` |
| `tmp/kartenstand.mjs` | `scripts/belege/kartenstand.mjs` (`npm run beleg:kartenstand`) |

Fachlich unverändert; portabel gemacht (Pfade relativ zum Ablageort, Browserprogramm aus
`COMMIETOOLS_BROWSER`, Exit 2 bei fehlender Voraussetzung, Prüfbilder in den Temporärordner,
Mutationsprotokolle datiert nach `06-protokolle/`). **Nachgemessen nach dem Umzug:** beide
Seitenbelege melden „BELEG ERBRACHT" von ihrem neuen Ort, Ausgaben in
`06-protokolle/screenshots/2026-10-07-r9-u1-portiert/` und `…-u2-portiert/` (die ursprünglichen
Ordner bleiben unberührt).
