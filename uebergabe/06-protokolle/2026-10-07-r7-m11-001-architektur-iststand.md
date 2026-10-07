# R7 / M11-001 — Architekturbeschreibung führt vorhandene Grenzen als vertagt: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „Rust-/Cachegrenzen existieren bereits; Doku beschreibt sie teils als
vertagt." … „Architektur um aktuellen datierten Iststand ergänzen … Je Grenze Codeanker,
Verantwortung und reale Restarbeit benennen. … Keine Formulierung vertagt für bereits vorhandenen
Pfad ohne präzise Einschränkung."
**Status:** **erledigt** — drei vertagende Formulierungen datiert richtiggestellt, Iststandstafel mit
Codeankern ergänzt, gegen die Buildkonfiguration gemessen.

## Was der Befund war

`docs/architecture.md` beschrieb drei **vorhandene** Wege als offen oder künftig:

- Kopf: „Rust/WASM choices remain open" — die Rust-Brücke existiert
  (`crates/pdf-signer-wasm`, `pdf/m7-wasm/`, dynamischer Import in `pdf/m7.ts:30`).
- Offline-Modell: Werkzeuge „will add versioned, opt-in caches **later**" — die Laufzeitcaches
  existieren (`commietools-pdf-engines-v2`, `commietools-calculator-engines-v1`,
  `commietools-language-packs-v1`).
- Vertagte Entscheidungen: „Rust/WebAssembly tool engine boundary" — ebenfalls vorhanden.
- Zusätzlich im selben Absatz als künftig beschrieben: der Speicheradapter — er existiert
  (`packages/tools/src/storage/indexedStore.ts`, M8-003).

## Umsetzung

- Drei datierte Richtigstellungen im Fließtext (der alte Wortlaut bleibt sichtbar bzw. ist als
  korrigiert benannt), keine Löschung.
- **Neuer Abschnitt „Actual state 2026-10-07"** mit einer Tafel je Grenze: **Codeanker**,
  **Verantwortung**, **reale Restarbeit**. Sechs Zeilen: Browser-App/lazy Werkzeugmodule,
  PDF-Engines (JavaScript), **Rust/WebAssembly-Brücke**, Laufzeitcaches, Sprach-/Werkzeugpaket-
  Granularität, persistente Nutzerdaten.
- Keine zweite Rust-Brücke und keine neue Cacheversion gebaut (Kartengrenze).

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| Vertagte Formulierung nur noch mit präziser Einschränkung | ✓ Rust-Brücke: „realized for the PDF signing engine; other engine classes still have no Rust boundary" |
| Import- und Cachekarte stimmen mit der Buildkonfiguration überein | ✓ alle drei Cachenamen je **1×** in `apps/web/vite.config.ts` **und** je **1×** im erzeugten `apps/web/dist/sw.js` |
| Je Grenze Codeanker, Verantwortung, Restarbeit benannt | ✓ Tafel mit sechs Grenzen; Restarbeit u. a. „nur die Signatur-Engine hat eine Rust-Grenze", „Cachewechsel bisher von Hand" |

## Gegenprobe der Messung (kein Gate vorhanden)

`docs/` hat **keinen** Prüfer — die Tafel ist eine Messung, keine erzwungene Zusicherung. Deshalb
wurde die **Messempfindlichkeit** selbst geprüft: Cachename in `vite.config.ts` von
`commietools-language-packs-v1` auf `…-v9` geändert und neu gebaut.

Ergebnis: alter Name im erzeugten Service Worker **0×**, neuer Name **1×** — die Prüfung hätte eine
Abweichung zwischen Dokument und Bau also **erkannt**. Danach zurückgenommen und neu gebaut; der
dokumentierte Name steht wieder **1×** in `sw.js`.

**Ehrlich dazu:** das ist eine Empfindlichkeitsprobe, **keine** Mutationsgegenprobe an einer Prüfung —
es gibt für `docs/` keine. Wäre der Cachename falsch dokumentiert, fiele es niemandem automatisch auf.

## Prüfkette

`npm run build` **Exit 0** (sauberer Bau nach der Rücknahme) · `npm run check` grün für denselben
Codestand (719 Tests). Diese Karte ändert **keinen Programmcode** — nur Dokumentation. Nichts gepusht.

## Grenzen

- Für `docs/architecture.md` gibt es **keinen** automatischen Abgleich mit Code oder Build — die
  Angaben sind so gut wie ihre letzte Messung (hier datiert 2026-10-07).
- Die Tafel beschreibt den heutigen Stand; sie ist **kein** Ersatz für die ADRs, sondern deren
  Wegweiser.
- Zu den beiden Behauptungen der Karte: die Tafel liegt in `QM/20-messungen/M11/behauptungstafel.md`
  (nicht versioniert, QM ist per `.gitignore` ausgeschlossen). **K30** = `docs/architecture.md:89`
  („Rust/WebAssembly tool engine boundary") und **K31** = `:57` (Caches „later") sind dort beide als
  **„überholt"** geführt und mit dem Iststand oben geschlossen. K31 verlangt ausdrücklich, **nicht**
  zu behaupten, jede Ressource sei erfolgreich gecacht worden — die Tafel sagt deshalb „Offline-
  Wiederverwendung des bereits Geholten, keine Zusage für den ersten Besuch oder Versionswechsel".

