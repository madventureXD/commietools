# Fortschrittsprotokoll: M9-004 (R1) — lopdf-Parser-Schwachstelle

**Datum:** 2026-10-06
**Status:** abgeschlossen
**Karte:** M9-004 aus R1 des QM-Sanierungsleitfadens (`QM/70-reparaturempfehlungen/R1.md`), Basis `a041ee0`
**Schwachstelle:** RUSTSEC-2026-0187 — `lopdf::Document::load_mem` parst verschachtelte Arrays und
Dictionaries ohne Tiefenbegrenzung; ein ~21 KB großes PDF mit ~10.380 Verschachtelungsebenen
erschöpft den Stack und beendet den Prozess mit `SIGABRT`. Kein `panic`, deshalb nicht mit
`catch_unwind` abfangbar. CVSS 3.1 7.5 (High). Behoben ab lopdf **0.42.0**.

## Umfang

Beide Crates der Signatur-Engine (`crates/pdf-signer-engine` — das vendored `pdf_signer` 0.3.2 —
und `crates/pdf-signer-wasm`), der WASM-Neubau und die Liefernachweise. Die Karte verlangt
zusätzlich: beide Lock-/Manifestpfade konsistent, WASM mit festgelegtem Rust- und
wasm-bindgen-Stand neu bauen, R1-Lizenz-/Herkunftsnachweise im selben Paket erneuern,
Parserressourcen begrenzen. Abnahme: Grenzkorpus für die Nesttiefe, Signaturkorpus vor/nach
vergleichen, Advisoryscan auf effektiven Ziel-/Featurestand und neu gebautes Artefakt.

## Ergebnisse

**1. Anhebung auf lopdf 0.42.0 (nicht 0.45.0) — begründet durch Messung.**

Beide Stände wurden gemessen, bevor entschieden wurde:

| | lopdf 0.36.0 (vorher) | lopdf 0.42.0 (gewählt) | lopdf 0.45.0 (verworfen) |
|---|---:|---:|---:|
| Pakete im Zielprofil | 174 | 177 | 183 |
| `sha2` im Graph | 0.10.9 | 0.10.9 | **0.10.9 + 0.11.0** |
| `aes` / `cbc` / `digest` | 0.8.4 / 0.1.2 / 0.10.7 | unverändert | **verdoppelt (0.9.3 / 0.2.1 / 0.11.3)** |
| `engine_bg.wasm` | 1.415.062 B | **1.557.077 B** (+142.015 B) | 1.777.137 B (+362.075 B) |

lopdf 0.45.0 zieht die RustCrypto-1.0-Generation zusätzlich herein, obwohl `pdf_signer` selbst
weiter auf `sha2 0.10` baut — die Folge sind zwei Krypto-Generationen im ausgelieferten Artefakt
und +362 KB statt +142 KB WASM. 0.42.0 ist die von der Karte ausdrücklich als Fix genannte
Version und der kleinste hinreichende Eingriff. Der Advisoryscan bestätigt für **beide** Stände
`lopdf-Treffer: 0`.

**2. Eine mitgezogene Abhängigkeit blockierte den Bau — nicht lopdf.**

lopdf ≥ 0.42 nutzt `rand 0.10`, das `getrandom 0.4.3` hereinzieht. Für `wasm32-unknown-unknown`
bricht der Bau ohne das Feature `wasm_js` mit `compile_error!` ab. Das gilt für 0.42.0 **und**
0.45.0 (beide Locks gemessen). Lösung im etablierten Projektmuster: `crates/pdf-signer-wasm`
führt `getrandom` 0.4 als direkte Abhängigkeit mit `wasm_js` — wie bereits für 0.2 (`js`) und
0.3 (`wasm_js`). Die `--cfg getrandom_backend="wasm_js"` in `.cargo/config.toml` bestand schon.

**3. Kein API-Bruch.** `cargo check` für `wasm32-unknown-unknown` und nativ je Exit 0; die
vorhandenen Parser-, Signatur-, Incremental- und Interoptests laufen unverändert durch
(**50 Tests: 12 + 38, 0 Fehler**, 5 nur wegen Netzwerk ignoriert).

**4. Grenzkorpus Nesttiefe — außerhalb des Browsers, wie die Karte es verlangt.**

Wegwerf-Umgebung `%LOCALAPPDATA%\Temp\ct-nest-poc` (beide lopdf-Stände in **einem** Graphen,
kein Teil des Projekts). Syntaktisch gültiges PDF, dessen Catalog ein n-fach verschachteltes
Array trägt; geladen im **Release**-Build (die ausgelieferte WASM ist Release, ein Debug-Build
verbraucht pro Ebene so viel Stack, dass die Messung nichts über die Bibliotheksgrenze sagt).
Das Objekt wird zusätzlich per `get_object` **angefordert** — lopdf parst verzögert, ein
erfolgreiches `load_mem` allein beweist nichts.

| Tiefe | lopdf 0.36.0 | lopdf 0.42.0 |
|---:|---|---|
| 99 | lädt | lädt |
| 100 | lädt | kontrollierter Fehler (`object ID 1 0 not found`) |
| 101 – 50000 | **ab 1000 Stack-Overflow-Abort** | kontrollierter Fehler, **kein Absturz** |
| echtes signiertes PDF | lädt, 1 Seite | lädt, 1 Seite |

Damit ist die Binärbetroffenheit, die die Karte als „nicht experimentell bewiesen" führte,
**experimentell belegt** — und der Fix greift. Die Grenze steht im Quelltext:
`MAX_NESTING_DEPTH: usize = 100` (`lopdf-0.42.0/src/reader.rs`), angewandt in
`_direct_object` (`src/parser/mod.rs`): bei `depth == 0` liefert der Parser
`NomError(ErrorKind::TooLarge)` statt weiterzurekursionieren.

**5. Signaturkorpus vor/nach — Ergebnis identisch.**

`work/m6-003-beleg.cjs` (vier Fälle: gültig/unverändert, manipulierte signierte Bytes,
Nachlauf ohne PDF-Schlüsselwörter, Nachlauf mit Anmerkungsstruktur) wurde gegen **0.36.0**,
**0.42.0** und **0.45.0** gefahren. Alle drei Läufe liefern dieselbe Tabelle; am Endstand sind
alle vier Fälle BESTANDEN.

*Korrektur am Prüfmittel:* Die beiden Nachlauf-Fälle wurden zuerst als „ABWEICHUNG" gemeldet.
Ursache war **die Erwartung im Belegskript**, nicht das Produkt: erwartet war „gültig", gemessen
wird „ungültig". Ein Nachlauf verlängert die Datei, die ByteRange deckt sie nicht mehr
vollständig ab — das Werkzeug meldet das zu Recht und weist die Änderungsart als Hinweis aus.
Die Erwartung ist im Skript berichtigt und die Herkunft dort vermerkt.

**6. Advisoryscan auf den effektiven Stand.**

`work/m9004-advisoryscan.mjs` fragt **alle** Pakete beider Locks (302, vereinigt) bei OSV.dev ab
(RustSec ist dort eingespeist). Ergebnis am Endstand: **`lopdf` 0.42.0, 0 Treffer**.
Fünf Treffer in **anderen** Paketen — nicht Teil dieser Karte, in der Entscheidungsliste:

- `crossbeam-epoch 0.9.18` — RUSTSEC-2026-0204, ungültige Zeigerdereferenzierung in `fmt::Pointer`
- `rsa 0.9.10` — RUSTSEC-2023-0071, Marvin-Attack (Timing-Seitenkanal), **keine Fix-Version verfügbar**
- `rustls 0.23.40` — RUSTSEC-2026-0285 / GHSA-2mjx-qc3c-rqvc (TLS 1.3-Handshake über
  Encryption-Level-Grenzen). Nur mit dem optionalen `https`-Feature im Graph
- `ttf-parser 0.25.1` — RUSTSEC-2026-0192, **unmaintained** (Wartungswarnung, kein Loch)

**7. Liefernachweise im selben Paket erneuert.**

`node scripts/rust-components.mjs` neu erzeugt: **176 Komponenten, 171 mit Originalhinweis**,
lopdf **0.42.0** mit `notices/rust/lopdf-0.42.0/LICENSE`. Die Hinweisdatei der alten Version ist
entfernt. Zusätzlich: `alloc-stdlib 0.2.4` (BSD-3-Clause) kam mit lopdf ≥ 0.42 neu in den Graphen,
liefert keine Hinweisdatei mit und steht deshalb mit Grund und Datum in `licenses/rust-review.json`
— dieselbe offene Frage wie bei den fünf übrigen Paketen ohne Hinweisdatei.

**8. Nebenfund: der Generator räumt den ausgelieferten Hinweisordner nicht auf.**

`licenses/notices/rust` war korrekt (171 Ordner, 0 Leichen), `apps/web/public/licenses/notices/rust`
enthielt dagegen **21 Leichen** aus den Zwischenständen (u. a. `lopdf-0.36.0`, `lopdf-0.45.0`,
`sha2-0.11.0`). `licenses:check` deckt diesen Pfad nicht ab. Zustand bereinigt (171 Ordner,
0 Leichen); die fehlende Aufräumregel ist als offener Punkt eingetragen, nicht stillschweigend
mitrepariert.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| lopdf-Version (Manifest + beide Locks) | 0.42.0 | `Cargo.toml`, `Cargo.lock` |
| Rust-Komponenten im Zielprofil | 176 (171 mit Originalhinweis) | `licenses/rust-components.json` |
| `engine_bg.wasm` | 1.557.077 B (+142.015 B gegen 0.36.0) | `packages/tools/src/pdf/m7-wasm/` |
| Start-JavaScript | 148.159 B gzip (Warnschwelle 204.800) | `npm run build` |
| Rust-Tests | 50 (12 + 38), 0 Fehler, 5 ignoriert | `cargo test` (nativ) |
| Projekt-Tests | 619 in 39 Dateien | `npm run check` |
| Nesttiefe bis Absturz, lopdf 0.36.0 | 1000 (Release) | `work/m9004-nestkorpus-*` |
| Nesttiefe bis kontrolliertem Fehler, lopdf 0.42.0 | 100, kein Absturz bis 50000 | dito |
| Advisoryscan | 302 Pakete, lopdf 0 Treffer, 5 fremde Treffer | `work/m9004-advisoryscan-beleg.txt` |
| Werkzeugstand | rustc 1.99.0, cargo 1.99.0, wasm-bindgen 0.2.129 | `--version` |

## Relevante Verweise

- Karte: `QM/70-reparaturempfehlungen/R1.md`, Abschnitt M9-004
- Advisory: RUSTSEC-2026-0187 (`https://rustsec.org/advisories/RUSTSEC-2026-0187`)
- Belege: `work/m6-003-beleg.cjs`, `work/m6-003-dimensionen.cjs`, `work/m9004-screenshots.cjs`,
  `work/m9004-advisoryscan.mjs`, `work/m9004-advisoryscan-beleg.txt`
- Aufnahmen: `uebergabe/06-protokolle/screenshots/2026-10-06-m9004/`
- Wegwerf-Umgebung: `%LOCALAPPDATA%\Temp\ct-nest-poc` (nicht Teil des Projekts)
- Commit: siehe Übergabe

## Folgemaßnahmen

- [ ] Fünf fremde Advisory-Treffer bewerten (Entscheidungsliste; `rsa` hat keine Fix-Version).
- [ ] `alloc-stdlib` und die fünf übrigen Pakete ohne Hinweisdatei: Originaltexte nachtragen?
- [ ] Aufräumregel für `apps/web/public/licenses/notices/rust` im Generator ergänzen und in
  `licenses:check` aufnehmen.
- [ ] OCR-Ursache aus M8-001 bleibt offen (nächster Punkt in R1).