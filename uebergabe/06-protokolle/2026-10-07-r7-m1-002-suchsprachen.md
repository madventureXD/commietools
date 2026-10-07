# R7 / M1-002 — „Suche über alle Sprachen" widerspricht dem Ladeverhalten: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „Suchversprechen weiterhin an tatsächliche Ladegrenzen anzupassen;
umfasst Alias M3-005." … „Produktversprechen auf aktive Sprache plus Englisch präzisieren."
**Status:** **erledigt** — README, Hilfetext in de/en/es und Suchkommentar sagen dasselbe wie das
Ladeverhalten; der Ladepfad lädt Englisch genau einmal.

## Was der Befund war

Das **Verhalten** war bereits richtig: `loadToolSearchIndex` lädt die gewählte Sprache plus Englisch
(bei Englisch nur Englisch). Falsch waren die **Behauptungen** darüber:

- `README.md`: „searchable **across every language**" — der Katalog *kann* mehr Sprachen enthalten,
  gleichzeitig durchsuchbar sind aber nur zwei.
- `catalog.searchHint` in de/en/es: „aller Sprachen" / „every language" / „cada idioma".
- `packages/tools/src/catalog/search.ts`: Kommentar „Curated text of every language".

## Bestandsaufnahme gegen den Live-Stand

Der Anker der Karte (`README.md:68`) traf dieselbe Zeile; `search.ts:37` („language") liegt im
Kommentar des Schleifenkopfs. **Zusätzlich gefunden:** der erzeugte Loader
(`catalog/generated/loaders.ts`) rief für die Oberflächensprache Englisch den englischen Lader
**zweimal** auf (`Promise.all([searchLoaders.en(), locale === 'en' ? searchLoaders.en() : …])`).
Die Doppelausführung fiel nur wegen des Modulspeichers des Browsers nicht auf — sie war aber keine
Absicht und wird von der Abnahme („Zweimal Englisch nicht laden") ausdrücklich verlangt.

## Umsetzung (kleinster hinreichender Eingriff)

- **README:** der Allsprachen-Satz ist durch „in the selected language plus English" ersetzt.
- **`catalog.searchHint`** de/en/es: nennt jetzt „der gewählten Sprache und auf Englisch" /
  „the selected language and English" / „del idioma seleccionado y del inglés".
- **`search.ts`:** Kopf- und Schleifenkommentar beschreiben den **Vertrag** (die geladenen Sprachen),
  nicht „alle Sprachen".
- **Generator `scripts/catalog-generate.mjs`:** die Fallunterscheidung `en` / `sonst` ist getrennt —
  Englisch wird nicht mehr doppelt angefordert. Die erzeugte Datei wurde über
  `npm run catalog:generate` neu erzeugt (Generatoren werden nie von Hand geändert).
- **Neuer Testvertrag:** `apps/web/src/tool-search.test.ts`, Block
  `search language contract (card M1-002)` — vier Prüfungen (nur gewählte Sprache + Englisch im
  Index, spanischer und englischer Treffer, kein deutscher Treffer, Antwort in der Oberflächensprache).
- **Nicht getan (Kartengrenze):** keine Rückkehr zur Allsprachen-Suche. **M3-005** ist dieselbe
  Abweichung in der Oberfläche und damit **mit** dieser Karte erledigt, keine eigene Reparaturgruppe.

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| Spanische UI findet spanische und englische Begriffe, nicht zwingend deutsche | ✓ `estad` → 2 Treffer, `resize` → 1 Treffer, `verkleinern` → **0** |
| Nach Wechsel auf Deutsch entsprechende Treffer | ✓ Sprachwechsel im laufenden Betrieb es→de: `verkleinern` → 2, `resize` → 1, `estad` → 0 |
| Ressourcennetztrace und sichtbare Hilfetexte decken sich | ✓ Hilfetext nennt wörtlich „gewählte Sprache und Englisch"; geladen werden **je Fall genau** `en` + gewählte Sprache |
| Zweimal Englisch nicht laden | ✓ Generatoreingriff (Englisch genau ein Aufruf); im Netz **eine** Adresse je Sprache |

## Mutationsgegenprobe

Mutation im erzeugten Loader: Englisch aus dem Index jeder **nicht-englischen** Sprache entfernt
(`Promise.all([searchLoaders.en(), …])` → `searchLoaders[locale]()`), also der Vertrag gebrochen.

```
AssertionError: text-statistics: expected [ 'es' ] to deeply equal [ 'en', 'es' ]
 Test Files  1 failed (1)
      Tests  9 failed | 15 passed (24)
```

Die Zeile mit `AssertionError` ist der Beleg. Danach `npm run catalog:generate` — der Baum war
gegenüber dem Commit unverändert (kein `git diff`).

## Beleg am ausgelieferten Bau (kopflose Edge über CDP, je Fall **frischer** Browser)

`work/r7-u2-beleg.cjs`, gegen `vite preview` des frischen Baus — **19 Befunde, alle ✓**:

| Fall | Oberfläche | Ergebnis |
|---|---|---|
| A | es | `resize` 1 · `verkleinern` **0** · `estad` 2 · geladen: `en`,`es` |
| B | en | `resize` 1 · `verkleinern` 0 · `estad` 0 · geladen: `en` (genau einmal als **eine** Adresse) |
| C | de | `resize` 1 · `verkleinern` 2 · `estad` 0 · geladen: `de`,`en` |
| D | es → Wechsel auf de | Hilfetext deutsch · `verkleinern` 2 · `resize` 1 · `estad` 0 |

0 Seitenfehler in allen Fällen. Aufnahmen in `screenshots/2026-10-07-r7-u2/`, Log `beleg.txt`.

**Ehrliche Einordnung der Netzspur:** jede Suchdatei erscheint **dreimal** mit **derselben** Adresse
(Modulimport, Warmlauf nach Service-Worker-Kontrolle aus M8-002, Wiederholung) — in allen Fällen,
auch bei der vorher doppelt aufgerufenen englischen Datei. Die Spur unterscheidet den einen vom
anderen Aufruf **nicht**, weil der Modulspeicher des Browsers einen zweiten Import derselben Adresse
ohnehin nicht ins Netz lässt. Der Nachweis „nicht zweimal geladen" ruht deshalb auf dem
Generatoreingriff **und** der Adresszählung (eine Adresse je Sprache), nicht auf der Anzahl der
Anfragen.

## Prüfkette

`npm run check` **Exit 0** — **719 Tests** in 51 Dateien (715 + 4 neue), 0 Lint-Fehler ·
`npm run build` **Exit 0**. Code-Commit `a1e0e11`. Nichts gepusht.

## Grenzen

- Die Oberflächensprache ist im Beleg über `localStorage` gesetzt (kopfloser Browser); ein echtes
  Gerät mit spanischer Systemsprache ist damit nicht ersetzt.
- Der Testvertrag prüft **Spanisch** als Beispiel für eine dritte Sprache; Deutsch↔Englisch war schon
  durch bestehende Tests gedeckt („does not load German search text in the English interface").
- Die Karte nennt „Ressourcennetztrace" als Abnahmeweg; die Trace-Grenze oben ist ehrlich benannt
  statt sie zu verschweigen.
