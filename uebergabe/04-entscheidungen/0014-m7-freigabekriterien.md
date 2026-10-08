# ADR 0014: M7 — tatsächlicher Produktstand und Freigabekriterien der PDF-Signatur

**Status:** **angenommen am 2026-10-07** durch Thomas — **mit vier benannten Auflagen**; zuvor am
selben Tag als `vorgeschlagen` geführt (Betreiberentscheidung)
**Datum:** 2026-10-07 (Faber, Karte M2-001)
**Verhältnis zu ADR 0004:** Dieser ADR **ergänzt** [`0004-m7-signatur-sicherheitsgate.md`](0004-m7-signatur-sicherheitsgate.md).
Der Wortlaut von ADR 0004 bleibt vollständig erhalten; seine dort beschriebene Sperre beschreibt den
Stand vom **2026-10-03**.

## Kontext

ADR 0004 hat „M7" gesperrt und zehn Gates für eine spätere Engine aufgestellt. Seitdem ist M7 **gebaut**:
signaturbezogene Werkzeuge stehen im Katalog und werden ausgeliefert. Damit widersprechen sich
Dokument und Produkt — ADR 0004 sagt „gesperrt", der Katalog führt die Werkzeuge.

Dieser ADR **erfindet kein rückwirkendes Sicherheitsgate** und **löscht keine Sicherheitsanforderung**.
Er hält fest, was tatsächlich ausgeliefert wird, welche Nachweise existieren, **mit welcher Revision**
sie verbunden sind — und was offen bleibt.

## Produktstand (gemessen am 2026-10-07)

Drei Werkzeuge des Katalogs betreffen PDF-Signaturen:

| Werkzeug | Art | Codepfad |
|---|---|---|
| `pdf-visible-signature` | **sichtbare, nicht kryptografische** Unterschrift (Platzierung) | `packages/tools/src/pdf/placement` |
| `pdf-certificate-sign` | **kryptografisch**, PAdES B-B, PKCS#12/PFX | `packages/tools/src/pdf/m7.ts` |
| `pdf-signature-verify` | **kryptografische Prüfung** (Signatur, Änderung, PAdES-Stufe) | `packages/tools/src/pdf/m7.ts` |

Engine: `StrategicProjects/pdf_signer` **0.3.2** aus Commit
**`6cc0218100d9ffc038f8dccee3b707e5bd136100`**, vendort unter `crates/pdf-signer-engine`, über den
Adapter `crates/pdf-signer-wasm` (AGPL-3.0-only) und `packages/tools/src/pdf/m7-wasm/` im Browser.
Der Adapter gibt an, Netzwerk-Zeitstempel und Vertrauenslisten **absichtlich nicht** zu aktivieren
(`crates/pdf-signer-wasm/README.md`).

Auslieferung: eigener Chunk `engine-*.js` und `engine_bg-*.wasm` (1.557.077 B) — **nicht** im
Startbündel; die Struktursperre in `scripts/bundle-audit.mjs` lässt keine PDF-Engine am Start zu.

Produkttexte (deutsch, wörtlich): „Erzeugt PAdES B-B ohne Online-Zeitstempel. Die
Vertrauenswürdigkeit des Zertifikats wird dadurch nicht bestätigt." Die Anzeige trennt
**Kryptografische Integrität**, **Änderung nach Signatur**, **Erkannte PAdES-Stufe**,
**Dokumentzeitstempel**, **Vertrauen der Kette** und **Validierungsmaterial eingebettet**.

## Gates aus ADR 0004 — Belegstand

| # | Gate (ADR 0004) | Stand | Revision / Bericht |
|---|---|---|---|
| 1 | Browserbetrieb ohne Serverübertragung von PDF/Zertifikat/Passwort/Schlüssel | erfüllt | `pdf/m7.ts` (ausschließlich lokaler Aufruf `./m7-wasm/engine.js`); Manifest: `executionMode: 'local'`; Adapter-README: keine Netzfunktionen |
| 2 | gepflegte Lizenz, reproduzierbarer Build, vollständiges Artefaktregister | erfüllt **mit Ausnahme** | `licenses/rust-components.json` (manifest `crates/pdf-signer-wasm/Cargo.toml`, lockfile `a01a62b5c6835fce`, engineLockfile `321d36be5880aad4`, wasmAusgabe `4c051d96d47c42da`, rustc 1.99.0 / wasm-bindgen 0.2.129). Upstream-Lizenz ist **GPL-3.0-or-later** — datierte Einzel-Ausnahme in `licenses/rust-review.json` (Thomas, 2026-10-06). **Offen:** Originalhinweis noch nicht nachgetragen |
| 3 | keine bekannte ungepatchte Schwachstelle hoher/kritischer Schwere im Signaturpfad | **nicht von dieser Akte geprüft** | Der Advisoryscan aus M9-004 (2026-10-06, 302 Pakete beider Rust-Locks, `work/m9004-advisoryscan-beleg.txt`) betraf lopdf; ein eigener Lauf über den Signaturpfad ist **nicht** dokumentiert |
| 4 | P12/PFX-Import mit dokumentierter Algorithmus-/Zertifikatsunterstützung | Nachweis im Prüfauftrag geführt | `uebergabe/07-pruefung/m7/01-kandidatenvergleich.txt`, `02-bedrohungsmodell.txt` (Stand 2026-10-03, **ohne Revision**) |
| 5 | inkrementelle Signatur, korrektes `ByteRange`, CMS/PKCS#7 bzw. PAdES-B-B | Nachweis im Prüfauftrag geführt | `07-pruefung/m7/03-testkorpus.txt`, `04-testmatrix.txt`; Adapter-README nennt „historical incremental signatures" |
| 6 | getrennte Ergebnisse für Integrität, Änderung, Zertifikatszeitraum, Kette, Widerruf, Zeitstempel | erfüllt | Produkttexte der Werkzeuge (sechs getrennte Dimensionen, s. o.) |
| 7 | ohne aktuelle Vertrauens- und Sperrlisten niemals „vertrauenswürdig" | erfüllt, sichtbar im Produkt | Schlüssel `tool.pdfCertificateSign.scope` und `tool.pdfVerify.trust` in de/en/es |
| 8 | Testkorpus (gültig, manipuliert, abgelaufen, mehrfach, unbekannt vertrauenswürdig) | Dateien vorhanden | `07-pruefung/m7/03-testkorpus.txt`, `04-testmatrix.txt` (Stand 2026-10-03) |
| 9 | Gegenprüfung mit Acrobat, zweitem Reader und unabhängigem kryptografischem Prüfer | Datei vorhanden | `07-pruefung/m7/06-reader-gegenpruefung.txt` (Stand 2026-10-03) |
| 10 | unabhängige Sicherheitsreview vor öffentlicher Freigabe | **nicht belegt** | kein Dokument gefunden |

Zusätzlich: `07-pruefung/m7/07-freigabecheckliste.txt` (2026-10-03) hakt sechzehn Punkte ab und lässt
einen offen („Kein Hintergrund-Worker im M7-Standardpfad; Verarbeitung ist durch 100 MiB und
64 Signaturen begrenzt"). Sie nennt **keine Revision**. Ihre Angabe „Nutzerfreigabe zum Abschluss von
M7 liegt am 2026-10-03 vor" ist damit eine **historische Angabe ohne Nachweis** und wird hier
ausdrücklich so geführt — nicht als Beleg.

## Content-Security-Policy

`apps/web/public/_headers` erlaubt `script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net`
(kein `unsafe-eval`). Das ist die Voraussetzung dafür, dass die WASM-Engine im Browser startet.
Ob die **ausgelieferten** Kopfzeilen diese Fassung tragen, ist **nicht geprüft** (es wird nicht
gepusht; siehe M8-001-Protokoll). Bleibt offen.

## Vorschlag (noch keine Entscheidung — Betreiberfreigabe nötig)

1. Die Sperre aus ADR 0004 gilt für die **drei gebauten Werkzeuge** als **durch die oben benannten
   Kriterien ersetzt**; die Sicherheitsanforderungen selbst bleiben Wort für Wort bestehen.
2. „Vertrauenswürdig" bleibt ausgeschlossen, solange keine Vertrauens-/Sperrlisten geprüft werden;
   die Werkzeuge sagen das sichtbar (Gate 7).
3. **Vor einer Annahme offen:** Nachweis zu Gate 3 (Schwachstellenstand des Signaturpfads),
   Gate 10 (unabhängige Sicherheitsreview), fehlender Originalhinweis aus Gate 2 sowie ein
   **revisionsgebundener** Abnahmebericht zum Korpus unter `07-pruefung/m7/`.
4. **Rücknahmestrategie (Vorschlag):** Wird eine Schwachstelle im Signaturpfad bekannt, werden die
   beiden kryptografischen Werkzeuge aus dem Katalog genommen (Route und Manifest entfernt, damit
   keine Zusage stehen bleibt), der Engine-Chunk über eine neue Cache-Version verworfen und die
   Maßnahme datiert in diesem ADR vermerkt. Das Werkzeug der **sichtbaren** Unterschrift ist nicht
   betroffen — es ist keine kryptografische Aussage.

## Folgen

- Produkt, Manifest und Akte sind bis auf die **eine** offene Freigabeentscheidung widerspruchsfrei.
- Die Entscheidung bleibt **sichtbar offen**; der ADR wird nicht stillschweigend „angenommen".

## Entscheidung (2026-10-07, Thomas)

Thomas hat den Vorschlag oben **angenommen**: Die Sperre aus ADR 0004 gilt für die drei gebauten
Werkzeuge als durch die hier benannten Kriterien ersetzt; die Sicherheitsanforderungen selbst bleiben
Wort für Wort bestehen. Der Vorschlagstext oben bleibt **im Wortlaut stehen** — er ist der angenommene
Text, nichts wird nachträglich als „von Anfang an entschieden" umgeschrieben. Die Abschnitte
„Vorschlag" und „Folgen" oben beschreiben damit den Stand des Vorschlags vom selben Tag; der Satz
„Die Entscheidung bleibt sichtbar offen" ist mit diesem Abschnitt **erledigt**.

**Auflagen — offen, und ausdrücklich *nicht* durch Dokumentation erledigt:**

| # | Auflage | Adresse |
|---|---|---|
| **A1** | Nachweis zum Schwachstellenstand des **Signaturpfads** (Gate 3) | Advisoryscan über den Pfad; die frühere Prüfung betraf lopdf |
| **A2** | **Unabhängige Sicherheitsreview** (Gate 10) | **nicht gestrichen, verlegt**: Entscheidung Thomas, 2026-10-07 — die unabhängige Prüfung erfolgt **am Ende der ganzen Sanierung** und kontrolliert dort alles noch einmal. Sie bleibt damit eine offene Auflage mit späterem Zeitpunkt |
| **A3** | **Originalhinweis** der GPL-3.0-or-later-Komponente nachtragen (Gate 2) | `licenses/rust-review.json`, `pdf_signer` 0.3.2 |
| **A4** | **Revisionsgebundener** Abnahmebericht zum Korpus (Gate 9/Gate 8) | `uebergabe/07-pruefung/m7/` — nennt bisher keine Revision |

**Kopplung an die Veröffentlichung:** Ein Push von `main` veröffentlicht commietools.org. Die Auflagen
A1–A4 sind **vor** diesem Schritt zu erledigen oder ausdrücklich neu zu entscheiden. Die Annahme dieses
ADR **nimmt den Push nicht vorweg** — sie ist eine Aussage über den Produktstand, keine Freigabe zur
Veröffentlichung.

*Nachtrag 2026-10-07 (nach der Entscheidung, Faber).* Thomas hat festgelegt: **„Am Ende der Sanierung
wird ein unabhängiger Prüfer nochmal alles kontrollieren."** Damit ist **A2 nicht gestrichen, sondern
verlegt** — der Kontrollpunkt bleibt, er liegt jetzt am Ende der gesamten Sanierung (nach R8–R10) und
umfasst dort den Gesamtstand.

**Was das für die Kopplung bedeutet — ausdrücklich benannt:** Die oben formulierte Bedingung „Push erst
nach A1–A4" enthielt A2. Mit der Verlegung von A2 gilt für einen **früheren** Push nun **A1, A3 und
A4**; die unabhängige Prüfung kommt danach und kann Korrekturen nach sich ziehen, die einen weiteren
Push brauchen. Soll der Push stattdessen **bis zur Abschlussprüfung** warten, ist das eine
Verschärfung, die Thomas aussprechen muss — sie wird hier nicht stillschweigend unterstellt.

*Nachtrag 2026-10-07, zweite Fassung (Faber).* **Die Verschärfung ist ausgesprochen.** Thomas,
wörtlich: „**Push wird erst nach der unabhängigen Kontrolle erfolgen**." Damit gilt:

- Ein Push von `main` (und damit die Veröffentlichung von commietools.org) erfolgt **erst nach der
  unabhängigen Abschlusskontrolle** am Ende der Sanierung.
- **A1, A3 und A4 sind damit keine Push-Vorbedingung mehr**, sondern erledigte Nachweise des
  Produktstands. Der Satz oben („für einen früheren Push gilt A1/A3/A4") ist damit **überholt** und
  bleibt nur als Verlauf stehen.
- Für die Abschlusskontrolle bleibt A2 offen: sie prüft den Gesamtstand, kann Korrekturen nach sich
  ziehen und wird von Thomas beauftragt.

## Verwandt

- [`0004-m7-signatur-sicherheitsgate.md`](0004-m7-signatur-sicherheitsgate.md) — Vorgänger (Sperre, Wortlaut erhalten)
- `uebergabe/07-pruefung/m7/` — Prüfauftrag und Nachweise
- Protokoll der Aufnahme: `../06-protokolle/2026-10-07-r7-m2-001-m7-freigabekriterien.md`

## Nachtrag 2026-10-08 — Abschlussprüfung durch den benannten Prüfer

Die offene Prüferbenennung aus A2 ist durch Thomas' ausdrücklichen Auftrag an Codex ersetzt:
„Alle Prüfungen sind durch dich durchzuführen, du bist der Unabhängige Prüfer.“ Codex beantwortet
technische Fragen und führt die Abschlusskontrolle aus. Eigene Reparaturbeteiligung wird offengelegt;
eine personelle Trennung wird nicht erfunden. Bericht: [Abschlussprüfung](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/abschlusspruefung.md).
Der Gesamtabschluss verlangt weiterhin die tatsächlich genannten Messungen; nicht verfügbare
native/physische Prüfungen bleiben sichtbar und sind keine fehlende Arbeitsfreigabe.

A1: aktueller hashgebundener OSV-Scan über beide Locks, patchbare native Treffer repariert.
RSA-0.9.10 bleibt mit CVSS 5.9 mittel und ohne Fix sichtbar; kein bekannter ungepatchter Treffer
hoher/kritischer Schwere im geprüften vorgesehenen Browserpfad. Größenlimits PDF 100 MiB/P12
16 MiB greifen vor Engine-Laden; Parser-Nestkorpus 5/64/128 tatsächlich am WASM geprüft.
64 Signaturen sind ein nachgelagertes Ergebnislimit, kein CPU-/Zeitabbruch.
A3: Original-GPL-Hinweis und Quellstand sind im Register enthalten. A4: 13 hashgebundene externe
DSS-Erwartungen sind reguläre Root-Gates, P12-Rundlauf/Manipulation und drei Effektmutanten bestehen.
Quell-/Lock-/WASM-/Distbindung steht im Kandidatenmanifest, echte GitHub-Rust-Bytegleichheit ist belegt.

Der isolierte Audit-Zweig mit [Entwurf PR #1](https://github.com/madventureXD/commietools/pull/1)
ermöglicht reale positive/negative CI und automatische Cloudflare-Vorschauen. `main` ist durch
`Releasepflicht` auch für Administratoren geschützt; kein Produktionspush oder Merge erfolgt.
Die frühere Aussage „kein tatsächlicher GitHub-Lauf“ gilt für diesen datierten Stand nicht mehr.
