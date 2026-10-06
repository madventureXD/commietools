# Übergabe 2026-10-06 — R1 des Reparaturleitfadens begonnen

## Ziel der Sitzung

Die 59 Handlungskarten des QM-Audits in der vorgeschlagenen Reihenfolge (R1 → R10) abarbeiten,
jede Karte gegen den heutigen Stand prüfen, widersprüchliche oder überholte Empfehlungen **nicht**
ausführen und stattdessen sammeln. Vorgabe des Auftraggebers: Empfehlung, keine Anweisung;
überspringen statt unterbrechen; jeden Schritt selbst kontrollieren, wo möglich mit Screenshot.

## Ergebnis

R1 (P0, blockierend) ist **begonnen und in vier Karten abgeschlossen**; zwei Karten aus R1 sind
offen. Alles lokal committet (`1a520fa`), **nicht gepusht** — Push erfolgt gesammelt am Ende
durch den Auftraggeber.

Erledigt und selbst belegt:

- **M8-001 (CSP)** — Änderung umgesetzt: `script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net`,
  `connect-src 'self' https://cdn.jsdelivr.net https://tessdata.projectnaptha.com`; alle übrigen
  Schutzdirektiven unangetastet, kein `unsafe-eval`. Belegt: echte Signaturprüfung läuft unter den
  ausgelieferten Kopfzeilen (gültige Datei → „Signatur mathematisch gültig · PAdES B-B ·
  Unterzeichner C=LU,OU=PKI-TEST,CN=good-user"; beschädigte Datei → „Signatur ungültig ·
  Dokument nach der Signatur verändert"). **OCR weiterhin offen** — siehe „Offene Punkte".
- **M9-001 (Rust-Lizenznachweise)** — `scripts/rust-components.mjs` liest die Komponenten aus
  `cargo metadata --filter-platform wasm32-unknown-unknown`: **174 Komponenten** (das Register
  führte vorher 2), **169 mit kopiertem Originalhinweis** (348 Dateien, 2,7 MB unter
  `licenses/notices/rust/`), fünf ohne. Gegenprobe bestanden: Entfernt man
  `licenses/notices/rust/lopdf-0.36.0/LICENSE`, scheitert die Prüfung mit Nennung der Datei.
- **M9-002 (Lizenzprüfung)** — SPDX-Ausdrücke werden strukturell ausgewertet (ODER/UND, Klammern);
  die informelle Schreibweise `/` wird als ODER gelesen und **im Bericht als Auslegung ausgewiesen**
  (13 Fälle). Die Zulassungsliste wurde **nicht** erweitert; offene Fälle stehen mit Grund und
  Datum in `licenses/rust-review.json` (7 Einträge).
- **M9-003 (Quell- und Buildzugang)** — Projektquellcode und Revision stehen auf der Lizenzseite,
  Buildlinks sind absolut und revisionsgebunden, 13 tote git-/ssh-Kurzformen wurden normalisiert.
  Belegt: Projektlink und Buildlink liefern HTTP 200 mit echtem Inhalt, der lopdf-Originalhinweis
  ist über `/licenses/notices/rust/lopdf-0.36.0/LICENSE` erreichbar („MIT License, Copyright (c)
  2016 Junfeng Liu").
- **M6-003 (Signaturbericht)** — Kernfehler behoben: `modification_kind` lieferte bei
  fehlgeschlagener Integrität **„none" = „Keine Änderung"**, weil zuerst `signed_end >= pdf.len()`
  geprüft wurde. Jetzt ist „none" nur bei belegter Integrität ohne weitere Revision möglich, sonst
  „unknown"; neue DTO-Dimension `modificationKindHint` kennzeichnet die Byte-Heuristik ausdrücklich
  als Hinweis. Bericht zeigt getrennte Dimensionen (Kryptographische Integrität, Dokumentinhalt,
  Vertrauen der Kette, Abdeckung, PAdES-Stufe, Zeitstempel, Änderungsart, Validierungsmaterial).
  Abnahme: vier Fälle über `work/m6-003-beleg.cjs` und Sichtkontrolle des Berichts.

## Geänderte Bereiche

- `apps/web/public/_headers` (CSP), `apps/web/src/LicensePage.tsx`, `apps/web/src/tools/PdfCertificateTools.tsx`
- `crates/pdf-signer-wasm/src/lib.rs` (+ neu gebaute `packages/tools/src/pdf/m7-wasm/engine_bg.wasm`)
- `packages/tools/src/pdf/m7.ts`, `packages/tools/src/pdf/m7/locales/{de,en,es}.ts`
- `packages/i18n/src/common/{de,en,es}.ts`, `packages/tools/src/catalog/generated/**` (erzeugt)
- `scripts/license-audit.mjs`, **neu** `scripts/rust-components.mjs`
- `licenses/registry.json`, `THIRD_PARTY_NOTICES.md`, **neu** `licenses/rust-components.json`,
  `licenses/rust-review.json`, `licenses/notices/rust/**` (348 Dateien),
  `apps/web/public/licenses/notices/rust/**`, `apps/web/public/licenses/rust-components.json`
- Arbeitsbelege (git-ignoriert, nur lokal): `work/csp-server.mjs`, `work/m8-001-beleg.cjs`,
  `work/m6-003-beleg.cjs`

## Entscheidungen und Annahmen

- Die CSP wurde **eng** erweitert: nur `wasm-unsafe-eval` (kein `unsafe-eval`) und nur die beiden
  tatsächlich benötigten Herkünfte. Begründung: Die Karte verlangt lauffähige Engines ohne
  Aufweichen der übrigen Direktiven.
- Die Zulassungsliste für Lizenzen wurde **nicht** erweitert. Nicht gedeckte Ausdrücke werden
  stattdessen als offene Entscheidung geführt (`licenses/rust-review.json`). Begründung: Der
  Auftraggeber hat ausdrücklich festgelegt, dass die Lizenzordnung unangetastet bleibt und
  Entscheidungen ihm gehören.
- Die Byte-Substring-Heuristik bleibt als Funktion erhalten, wird aber als **Hinweis** ausgewiesen
  statt entfernt. Begründung: Die Karte verbietet ausdrücklich einen Parserersatz, verlangt aber
  die Kennzeichnung als nicht belastbar.
- Die fünf Rust-Pakete ohne mitgelieferten Originalhinweis wurden **metadatenmäßig** erfasst und
  als offen markiert, nicht stillschweigend übergangen. Nachtragen der Texte aus den Repositories
  ist angeboten, aber noch nicht beauftragt.
- Angenommen wurde, dass die Signaturprüfung der P0-Karte die eigentliche Abnahmefrage ist; die
  OCR-Frage wurde als eigener Befund behandelt und nicht in die Signaturkarte hineingezogen.

## Prüfungen

- `npm run check` grün: Lizenzprüfung, Katalogprüfung (62 Werkzeuge, 3 Sprachen), Typprüfung,
  **619 Tests in 39 Dateien**.
- `npm run build` grün; `npm run m7:build` (Rust → WASM, wasm-bindgen 0.2.129) exit 0.
- `work/m6-003-beleg.cjs` — vier Fälle, Sichtkontrolle des Berichts für die veränderte Datei.
- Gegenprobe Lizenz: entfernte Hinweisdatei lässt die Prüfung scheitern (und nach Wiederherstellung
  wieder durchlaufen).
- Linkprüfung: Projektlink, Buildlink und Hinweislink liefern HTTP 200 mit echtem Inhalt; die Zahl
  toter Verweise auf `/licenses` ist von 13 auf 0 gefallen (gemessen über alle `main a`).
- **Nicht geprüft:** OCR-Abnahme (siehe offen); die zweite Hälfte der M6-003-Abnahme „Referenzurteile
  lokal mit unabhängigem Validator vergleichen" — es wurde gegen die EU-DSS-Prüfdateien geprüft,
  nicht gegen einen zweiten Validator; die Karten M9-004 und der Rest von R2–R10 sind unbearbeitet.

## Offene Punkte und Risiken

1. **OCR (aus M8-001 offen).** Das OCR-Werkzeug meldet für eine gültige, bildseitige PDF „Die PDF
   konnte nicht verarbeitet werden." — **nicht** durch die CSP verursacht: derselbe Fehlschlag
   tritt ohne CSP auf, und der PDF-Viewer liest dieselbe Datei fehlerfrei (1 Seite). Ursache
   ungeklärt; die Abnahme der Karte M8-001 ist insoweit unvollständig.
2. **M9-004:** lopdf ist in beiden Crates auf **0.36.0** — die bekannte Schwachstelle ist erst ab
   **0.42.0** behoben. Anhebung und Neubau der WASM stehen aus; API-Brüche sind zu erwarten.
3. **Vier Lizenzfragen warten auf den Auftraggeber:** `zlib-rs` (Lizenz „Zlib" nicht in der
   Richtlinie), `unicode-ident` („Unicode-3.0" fehlt), `pdf_signer` 0.3.2 (GPL-3.0-or-later,
   bereits ausgeliefert — bewusst so lassen?) sowie das Nachtragen der Originaltexte für fünf
   Pakete ohne Hinweisdatei.
4. **Risiko der eigenen Prüfmittel:** Zwei Fehler in meinen Auswerte-Skripten (Klick auf den
   Werkzeugmenü-Eintrag statt auf den Aktionsknopf; Zeilen nach Position statt nach Beschriftung
   gelesen) haben zeitweise falsche Ergebnisse erzeugt. Alle Befunde wurden erst nach der
   Korrektur als gültig gewertet.
5. **Kein automatischer Test deckt die Signatur-Engine** ab; die Abnahme ist belegt, aber nicht
   in der Testsuite verankert. Ob hier investiert wird, ist eine offene Entscheidung.

## Empfohlener nächster Schritt

Mit **M9-004** weitermachen (lopdf anheben, WASM neu bauen, Signatur und Prüfung erneut belegen) —
unabhängig von den vier Lizenzfragen durchführbar. Danach die OCR-Ursache klären, weil davon die
Abnahme von M8-001 abhängt. Die vier Lizenzfragen dem Auftraggeber zur Entscheidung vorlegen.

## Git

- Ausgangsstand: `a041ee0` (Basis der Auditvorschläge), davor ausgeliefert: `0b0b05c`.
- **Neu in dieser Sitzung: `1a520fa`** — R1-Teilstand (M6-003, M9-001/002/003, M8-001-Umsetzung).
- **Nicht gepusht.** Der Auftraggeber hat festgelegt: Push gesammelt am Ende, durch ihn bestätigt.
