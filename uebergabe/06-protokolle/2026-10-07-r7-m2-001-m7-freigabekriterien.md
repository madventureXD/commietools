# R7 / M2-001 — Der Sicherheits-ADR verbietet veröffentlichte M7-Werkzeuge: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „Alter M7-Sicherheits-ADR und veröffentlichte Routen widersprechen
sich." … „Neuen, noch freien ADR für tatsächliche M7-Freigabekriterien **vorbereiten** … Alten ADR
datiert als ersetzt/ergänzt verknüpfen, ursprünglichen Inhalt erhalten. Historisch nicht belegte
Freigaben ausdrücklich unbekannt lassen. **Neue Entscheidung erst nach R1-/R4-Nachweisen annehmen**;
bis dahin Diskrepanz sichtbar, kein rückwirkendes Erfinden eines Sicherheitsgates."
**Status:** **erledigt** — Produktstand und Nachweisstand liegen in **ADR 0014 (Status
`vorgeschlagen`)**; ADR 0004 ist datiert verknüpft und im Wortlaut erhalten.

## Was der Befund war

ADR 0004 (2026-10-03) sperrt M7 und nennt zehn Gates. Seitdem ist M7 gebaut: **drei**
signaturbezogene Werkzeuge stehen im Katalog (`pdf-visible-signature`,
`pdf-certificate-sign`, `pdf-signature-verify`). Dokument und Produkt widersprachen sich.

## Was gemessen wurde (Grundlage von ADR 0014)

- Engine: `StrategicProjects/pdf_signer` **0.3.2** aus Commit
  **`6cc0218100d9ffc038f8dccee3b707e5bd136100`**, vendort unter `crates/pdf-signer-engine`,
  Adapter `crates/pdf-signer-wasm` (AGPL-3.0-only), Browser-Pfad `packages/tools/src/pdf/m7.ts`
  → `pdf/m7-wasm/engine.js`.
- Register: `licenses/rust-components.json` (manifest `crates/pdf-signer-wasm/Cargo.toml`,
  lockfile `a01a62b5c6835fce`, engineLockfile `321d36be5880aad4`, wasmAusgabe `4c051d96d47c42da`,
  rustc 1.99.0 / wasm-bindgen 0.2.129).
- Lizenz: Upstream **GPL-3.0-or-later**, datierte Einzel-Ausnahme in `licenses/rust-review.json`
  (Thomas, 2026-10-06).
- Auslieferung: eigener Chunk `engine-*.js` + `engine_bg-*.wasm` (1.557.077 B), **nicht** im Start.
- CSP: `apps/web/public/_headers` erlaubt `script-src 'self' 'wasm-unsafe-eval' …`.

## Umsetzung

- **Neu:** `uebergabe/04-entscheidungen/0014-m7-freigabekriterien.md`, Status **`vorgeschlagen`**.
  Enthält: Produktstand, **Tabelle Gate 1–10 mit Stand und Revision/Bericht je Zeile**,
  CSP-Abschnitt, einen nummerierten **Vorschlag** (noch keine Entscheidung) und eine
  **Rücknahmestrategie** (Werkzeuge aus dem Katalog nehmen, Engine-Cache neu versionieren, datiert
  vermerken; die sichtbare Unterschrift ist nicht betroffen).
- **ADR 0004:** datierter Nachtrag mit Verweis auf 0014; der ursprüngliche Wortlaut bleibt
  **unverändert** stehen.
- **Index:** 0014 eingetragen; Vorgänger/Nachfolger verlinken gegenseitig, beide Verweise sind
  durch `npm run adr:check` (Regel 2b) auf Existenz geprüft.
- **Nicht getan (Kartengrenze):** keine Sicherheitsanforderung gelöscht, **keine** Freigabe
  vorweggenommen, keine historische Annahmezeit erfunden.

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| Jede Gatebehauptung verweist auf konkrete Revision und Bericht | ✓ Tabelle mit Revision/Datei je Gate; wo keine Revision existiert, steht das ausdrücklich da |
| Produktstatus/Manifest/ADR konsistent | ✓ drei Werkzeuge im Manifest = drei in der Akte = drei am ausgelieferten Bau (Beleg unten) |
| Fehlender Rust- oder CSP-Nachweis bleibt offen | ✓ Gate 3 (Advisorystand des Signaturpfads) und Gate 10 (unabhängige Review) sind als **nicht belegt** geführt; die CSP-Fassung ist im Repo belegt, ihre **Auslieferung** ausdrücklich offen |
| Index verlinkt Vorgänger/Nachfolger eindeutig | ✓ 0004 ⇄ 0014, 15 Dateien / 14 Entscheidungen / 1 Weiterverweisakte, Index vollständig |

**Bewusst nicht als Freigabe geführt:** die Zeile „Nutzerfreigabe zum Abschluss von M7 liegt am
2026-10-03 vor" aus `07-pruefung/m7/07-freigabecheckliste.txt` — die Liste nennt **keine Revision**.
Sie steht im ADR als historische Angabe ohne Nachweis.

*Nachtrag 2026-10-07 (nach dem Durchzug).* Thomas hat die Karte **angenommen (Weg A)**: ADR 0014 steht
auf **`angenommen` mit den Auflagen A1–A4**; die Werkzeuge bleiben im Katalog; der **Push ist darin
nicht enthalten**. Der obige Text beschreibt den Stand des Vorschlags und bleibt stehen.

## Mutationsgegenproben

| # | Mutation | Meldung |
|---|---|---|
| H | 0014-Indexeintrag gelöscht | `0014-m7-freigabekriterien.md: fehlt im Index` |
| I | Nachfolgerverweis in ADR 0004 zeigt ins Leere | `0004-m7-signatur-sicherheitsgate.md verweist auf eine fehlende Datei: 0014-gibt-es-nicht.md` |
| J | Nummer 0014 ein zweites Mal vergeben | `Nummer 0014 doppelt: 0014-doppelt-probe.md und 0014-m7-freigabekriterien.md` |

Alle Wiederherstellungen hash-geprüft.

## Beleg am ausgelieferten Bau (kopflose Edge über CDP, je Fall frischer Browser)

`work/r7-u4-beleg.cjs`, gegen `vite preview` des frischen Baus:

| Fall | Messung | Ergebnis |
|---|---|---|
| A | Startseite | Engine **nicht** geladen: `engine-*.js` 0, `engine_bg-*.wasm` 0 ✓ |
| B | `/tools/pdf-signature-verify` | Datei angenommen, Knopf gedrückt → Engine **geladen** (js 1, wasm 1), Ergebnis „Keine kryptografische PDF-Signatur gefunden." ✓ |
| C | `/tools/pdf-certificate-sign` | Vertrauensvorbehalt („ohne Online-Zeitstempel … nicht bestätigt") und Datenschutzhinweis sichtbar ✓ |
| D | `/tools/pdf-visible-signature` | Werkzeug rendert („PDF sichtbar unterschreiben") ✓ |

0 Seitenfehler in allen Fällen; Aufnahmen in `screenshots/2026-10-07-r7-u4/`.

## Prüfkette

`npm run adr:check` **grün** (15 Dateien) · `npm run build` **Exit 0**. Diese Karte ändert **keinen
Programmcode** — deshalb nur ein Akten-Commit. Nichts gepusht.

## Grenzen

- Der Doku-Gate prüft Datei-/Nummernebene und Verweisziele, **nicht** ob eine ADR-Aussage zum
  Manifest passt. Die Konsistenz „drei Werkzeuge" ist hier **von Hand** verglichen und im Browser
  belegt, nicht durch ein Prüfmittel erzwungen.
- Ob die **ausgelieferten** HTTP-Kopfzeilen die CSP aus `public/_headers` tragen, ist nicht geprüft
  (nichts gepusht) — im ADR als offen benannt.
- Gate 3 (Schwachstellenstand des Signaturpfads) wurde **nicht** nachgemessen; der frühere
  Advisoryscan betraf lopdf.
