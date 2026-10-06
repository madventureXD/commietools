# Vorgehen: QM-Sanierungsleitfaden (R1–R10)

**Zweck:** zentraler Wegweiser für die Abarbeitung der 59 Handlungskarten des QM-Audits —
Auftrag, Reihenfolge, Fundstellen aller Anweisungen und der Stand je Karte. Angelegt am
2026-10-06 auf Bitte von Thomas, weil die Vorgaben über mehrere Dateien verteilt sind.

**Diese Datei ist die einzige Fortschrittsübersicht.** Die Karten selbst bleiben in `QM/`
und werden **nicht** verändert; je Karte entsteht ein Fortschrittsprotokoll unter
`uebergabe/06-protokolle/`.

## 1. Auftrag (im Wortlaut)

> „Wir arbeiten weiter das qm-audit ab. Bitte wie gewohnt fortsetzen." — Thomas, 2026-10-06

Ausführlich (aus dem Auftrag vom selben Tag):

- Die **59 Handlungskarten in der vorgeschlagenen Reihenfolge** abarbeiten.
- **Das Audit ist keine Handlungsanweisung, sondern eine Empfehlung.** Widersprüchliche, wenig
  zielführende oder überholte Empfehlungen **nicht** ausführen, sondern mit Begründung und Beleg
  für das Endgespräch sammeln.
- **Nur unterbrechen, wenn ohne Thomas' Entscheidung gar nichts weitergeht** — sonst überspringen
  und die nächste Karte angehen. Durchziehen ist der Normalfall.
- **Jeden Schritt selbst kontrollieren**, wo möglich mit Screenshot.
- **„Fertig" heißt: der „Abnahme"-Abschnitt der jeweiligen Karte** ist das Abnahmekriterium;
  die **„Nicht tun"-Abschnitte** sind bindende Grenzen.
- **Push nur durch Thomas bestätigt, gesammelt am Ende.** Bis dahin alles lokal committen.
- Das QM wird **nur temporär und lokal** gebraucht — keine Sicherung nötig.

Zusätzlich gilt die Werkzeug-/Sprachenregel: vorher die Anleitungen lesen
(`02-architektur/werkzeug-erstellen.md`, `sprachpakete.md`), nach Abschluss mit Bild kontrollieren.

## 2. Wo die Vorgaben liegen (Fundstellen)

| Was | Datei | Anmerkung |
|---|---|---|
| Auditauftrag, Prüffelder, Grenzen | `QM/AUFTRAG.md` | verbindlich, unverändert |
| **Leseregeln und Reihenfolge der Karten** | `QM/70-reparaturempfehlungen/README.md` | **der eigentliche Einstieg in die Karten** |
| Die Karten selbst | `QM/70-reparaturempfehlungen/R1.md` … `R10.md` | je Karte: Eingriffsstellen, dauerhafte Lösung, Abnahme, „Nicht tun", Quellen |
| Architektur- und Migrationsplan | `QM/70-reparaturempfehlungen/01-architektur-und-migration.md` | vor der Umsetzung lesen |
| Quellenregister | `QM/70-reparaturempfehlungen/02-quellen.md` | 37 online geprüfte Primärquellen |
| Abnahme-/Übergabeplan | `QM/70-reparaturempfehlungen/03-pruef-und-uebergabeplan.md` | mitführen |
| ID-Zuordnung (62 Befund-IDs → 59 Karten) | `QM/70-reparaturempfehlungen/99-zuordnung.md` | zum Nachschlagen einzelner Befunde |
| Prüfstände und Grenzen des Audits | `QM/90-nicht-geprueft.md`, `QM/99-offene-fragen.md` | |
| Historischer Abschluss | `QM/60-abschluss-uebergabe.md` | Basis `cd556d1`, keine Gesamtfreigabe |
| **Datei-Inventar des QM** | `QM/INDEX.md` | 6,7 MB, listet jede QM-Datei — *kein* Wegweiser, nur Nachschlagewerk |
| Projekt-Arbeitsregeln | `uebergabe/00-einstieg/arbeitsregeln.md` | Sitzungsabschluss, Aktenpflege, Commit-Regeln |
| Werkzeug-/Sprachenbau | `uebergabe/02-architektur/werkzeug-erstellen.md`, `sprachpakete.md` | werden bei Umbauten leicht übersehen |
| **Was offen ist** | `uebergabe/01-stand/offene-punkte.md` | die verbindliche Aufgabenliste des Projekts |
| Roadmap | `uebergabe/01-stand/roadmap.md` | |
| Sitzungsstand | `uebergabe/05-uebergaben/`, `C:\projekte_mit_faber\SITZUNGEN.md` | je Sitzung |

**Grundlage der Karten:** Basis `a041ee0efda6b07687b3586977bb0d90bf1c89a8`. Zeilenangaben gehören
zu dieser Basis — vor Änderungen Hash und fachlichen Anker gegen den Live-Stand prüfen.

## 3. Reihenfolge (Stufen aus dem README des Empfehlungspakets)

| Stufe | Inhalt | Ergebnis vor der nächsten Stufe |
|---|---|---|
| A | Scope/Basis fixieren; R4-Grundgerüst und bekannte rote Regressionen | reproduzierbarer Ausgangsstand und echte Prüfbefehle |
| B | **R1** plus zugehörige R4-Engine-/Lizenztests | Parser/CSP/Lieferweg und Signaturberichte nachgewiesen |
| C | **R2 und R3**, dabei R9-Bausteine nur nach Bedarf | richtige Ergebnisse und robuste Abläufe mit Fehlerproben |
| D | **R5/R6**; R7/R8 begleitend statt erst am Ende | Bedien-/Sprach-/Dokumentverträge deckungsgleich |
| E | **R10**-Betreiberentscheidung, vollständige Releaseabnahme | ein unveränderliches geprüftes Artefakt, dokumentierte Restentscheidungen |

**R4 wird bei jeder Reparatur mitgeführt.** Kein pauschaler Rewrite.

## 4. Stand der Karten (2026-10-06)

Legende: ✓ erledigt · ◐ erledigt mit offener Restforderung · ○ offen

### R1 — PDF-Engines, Signaturen, Lizenzen (P0) — **abgeschlossen**

| Karte | Kurz | Stand |
|---|---|---|
| M8-001 | Auslieferungs-CSP blockiert die Engines | ◐ CSP und OCR-Erfolg belegt; **zwei Abnahmefälle offen** (beschädigtes Modell, Offlinewiederholung) — Nachweis nur über einen Proxy vor dem Browser |
| M9-001 | Rust-Lizenzhinweise fehlen im Register | ✓ 176 Komponenten, 171 mit Originalhinweis |
| M9-002 | Lizenzgate prüft Eingangswege ungleich streng | ✓ SPDX strukturell ausgewertet, offene Fälle in `rust-review.json` |
| M9-003 | Quell- und Buildzugang auf der Lizenzseite | ✓ Projekt- und Buildlinks absolut und revisionsgebunden |
| M9-004 | lopdf-Parser-Schwachstelle (RUSTSEC-2026-0187) | ✓ 0.36.0 → **0.42.0**, Grenzkorpus, Signaturkorpus, Advisoryscan |
| M6-003 | Signaturbericht nennt zugleich „Änderung: Keine" | ✓ getrennte Dimensionen, Bericht im Browser belegt |

Protokoll: `06-protokolle/2026-10-06-r1-*.md`, `…-m9-004-lopdf-anhebung.md`, `…-m8-001-ocr-und-abnahme.md` ·
Übergabe: `05-uebergaben/2026-10-06-r1-sanierungsleitfaden.md`

### R2 — Ergebnisrichtigkeit und Exportgrenzen (P1) — **abgeschlossen 2026-10-06** (7 Karten)

| Karte | Kurz | Stand |
|---|---|---|
| M3-002 | Statistik liest lokalisierte Zahlen falsch | ✓ neue Grammatik; **Importvertrag abgenommen (Thomas, 2026-10-06)**: Komma = Dezimalzeichen, Semikolon trennt Listen |
| M4-001 | RPN verkettet Brüche ohne Klammern | ✓ `geschuetzterOperand`, Abnahmefall 3/2 |
| M4-002 | Anzeige-Nullschwelle vernichtet Vollwert | ✓ `raw`/`full` echt; **Anzeige-Nullung am Ergebnis gekennzeichnet** (2026-10-06) |
| M4-003 | Plotter ersetzt `x` auch in Funktionsnamen | ✓ Scope-Bindung, `raw` statt `display`; Abnahmefälle im Browser belegt (2026-10-06) |
| M6-001 | JSON-Formatierung verändert Zahlenwerte | ✓ Textedits auf dem Originaltext, Fehlerstelle mit Zeile/Spalte; Werkzeug aus dem Startbündel gelöst (ADR 0012) |
| M6-002 | RPN-Tastenfeld setzt mehrstellige Zahlen nicht zusammen | ✓ Eingabereducer mit getrenntem Zahlentoken; Tastenfolgen im Browser belegt (2026-10-06) |
| M8-004 | CSV-Freitext als Tabellenformel exportiert | ✓ typisierte Zellen (Text/Zahl), führender Apostroph, Hinweis in der Oberfläche; **Abnahme bewusst ohne Tabellenprogramm** (Thomas, 2026-10-06) — unabhängige Python-Gegenprobe bleibt maßgeblich |

### R3 — Datei-Aufträge, Ressourcen, Offline (P1) — **teilweise: 3 erledigt, 3 mit Restforderung**

| Karte | Kurz | Stand |
|---|---|---|
| M4-004 | Sprachladefehler bleiben gecacht; kein Fehler-/Wiederholungszustand | ◐ Cache gibt abgelehnte Importe frei (5 Lader); Oberflächentexte mit Fehlermeldung + Retry — **Werkzeugtexte und Generationsschutz offen** (2026-10-06) |
| M4-005 | PDF-Ergebnisse nach Dateiwechsel dem falschen Namen zugeordnet | **✓ mit benannter Grenze** (2026-10-07): Abnahme auf dem heutigen Stand neu gefahren — A (1200 S.) verworfen, B allein sichtbar/speicherbar, Inhalt der 3 Ausgaben als `SEITE-B` geprüft, 60 s stabil; **Unmount im Erfolgs-, Lauf- und Fehlerweg belegt**. Dabei zwei Produktfehler gefunden+behoben (hängender Aktionsknopf; nicht freigegebene Adressen beim Verlassen während eines Auftrags). **Grenze:** Reihenfolge „A zuletzt fertig" nicht herstellbar (Verarbeitung 0,6 s, Grund gemessen) |
| M4-006 | PDF-Teiler gibt Ergebnis-URLs beim Verlassen nicht frei | ◐ **Zählerabnahme erbracht** 2026-10-06: create 1203 / revoke 1200 / offen 3 im Betrieb, nach clientseitigem Unmount revoke 1203 / offen 0. **Offen:** gemeinsamer `useObjectUrls`-Hook (nicht Abnahmebedingung), StrictMode-Zyklus |
| M4-007 | Sprach-Type-Guard akzeptiert geerbte Objektschlüssel | ✓ `hasOwnProperty.call` + `typeof`-Prüfung; `__proto__`/`constructor` abgewiesen (2026-10-06) |
| M8-002 | Erste Offline-Bereitschaft hängt am flüchtigen HTTP-Cache | **✓ erfüllt** (2026-10-06): frisches Profil, HTTP-Cache gelöscht, **Dienst beendet** → Reload lädt vollständig (**23 von 23 Antworten aus dem Service Worker, 0 gescheitert**), dritte Sprache wird nicht geholt. Lösung: Warmlauf der Sprachpakete nach SW-Kontrolle + `ignoreVary` in der Laufzeitregel. Offen: Warmbesuch, Localewechsel, SW-Versionswechsel |
| M8-003 | Fehlender Browser-Speicher verhindert Nutzung statt Rückfall | ◐ Adapter ohne Wurf (`readLocal`/`writeLocal`/`readLocalJson`), Startpfad abgesichert — **Verlaufs-/Store-Vertrag und flüchtiger Betrieb offen** (2026-10-06) |

### R4 — Wirksame Tests, Lint, Freigabeschranken (P1) — **abgeschlossen 2026-10-06**

| Karte | Kurz | Stand |
|---|---|---|
| M1-003 | Kein erkennbarer Freigabeschutz für `main` | ✓ mit benannten Grenzen (2026-10-06): `.github/workflows/quality.yml` (Node- und Rust-Job, minimale Rechte, kein Deployment). **Grenzen:** nie ausgeführt (kein Push), Actions auf Tags statt SHAs, kein Browserjob (Edge/Windows), Branchschutz bleibt Kontosache |
| M4-008 | Erfolgreiches Lint-Kommando prüft keine Workspace-Codebasis | **✓ erledigt** (2026-10-06): `eslint.config.mjs` + Wurzel-`tsconfig.json`, `lint` = `eslint .` und Pflichtteil von `check`; **0 Fehler, 96 Warnungen**, 415 Dateien geprüft (vorher 0). Mutationsgegenprobe belegt. Neue MIT-Abhängigkeiten, Lizenzlauf grün (607 Pakete) |
| M5-001 | PDF-Tests sichern Seitenwahl und Nummerninhalte nicht ab | **✓ erledigt** (2026-10-06): unabhängiger Leser (pdfjs) im Test — Wasserzeichen nur auf der gewählten Seite, Nummerierung „5 / 6" und „6 / 6" inhaltlich geprüft, nicht gewählte Seite leer |
| M5-002 | Zentraler Speichervorgang bleibt im Testlauf unbenutzt | **✓ erledigt** (2026-10-06): injizierbarer Speicheradapter (`SaveEnvironment`/`saveWithAdapter`), 7 neue Tests mit geprüften Bytes/Name/MIME, Abbruch ohne heimlichen Download, Schreibfehler, fehlende API, wiederholter Klick |
| M5-003 | Kritische PDF-Engine-Pfade ohne normalen Testschutz | **✓ erledigt, ein Rest offen** (2026-10-06): QPDF-Wirkung im Browser belegt — geschützt ohne Passwort `PasswordException`, mit Passwort Inhalt `SEITE-B-1/2/3` vollständig, entsperrt inhaltlich unverändert, falsches Passwort ergibt echten Fehler. **Offen:** Signaturkorpus nicht im normalen Testschutz |
| M5-004 | Randfalltests erfassen wichtige Kombinationen nicht | **✓ erledigt** (2026-10-06): die dokumentierten Regressionen stehen in der regulären Suite (M3-001 über die neue Sprachprüfung). **Dabei ein echter Fehler gefunden und behoben:** `normaliseFileName` schnitt bei 180 Zeichen mitten in einem Emoji ab (unpaariges Surrogat) — **M3-007 damit erledigt** |
| M2-009 | Versprochene automatische Barrierefreiheitsprüfung fehlt | ◐ (2026-10-06): Prüfer erweitert — **offenes Menü** wird mitgemessen, **Grenzen** des Prüfers werden ausgegeben, **Namenslücke behoben** (`aria-hidden`-Inhalte galten als Name); Gegenprobe belegt Namen und Bedienziel. **Offen:** Kontrastteil der Gegenprobe nicht belastbar (`skippedContrast`), keine CI-Verdrahtung |
| M3-009 | Vorgeschriebene Sprachprüfungen nicht vollständig automatisiert | **✓ erledigt** (2026-10-06): `language-contract.test.ts`, registrygesteuert — Parität, leere Texte, **Platzhalter** (Name und Häufigkeit), Interpolationssyntax, Wohlgeformtheit, common+suites, Katalogtexte. Mutationsgegenprobe `{number}`→`{número}`: genau zwei Prüfungen rot. Generator liefert bei Wiederholung identische Ausgabe |

*Hinweis:* M2-009 dürfte überholt sein — laut README des Empfehlungspakets existiert inzwischen ein
`a11y:check`; im Projekt ist er als erledigt geführt. Beim Bearbeiten gegen den Live-Stand prüfen.
*(Nachtrag 2026-10-06: Bestätigt — `a11y:check` existiert und prüft alle Routen des Registers bei
zwei Breiten. Der Punkt bleibt trotzdem auf ◐, weil die Abdeckung erweitert wurde und zwei
Teilnachweise fehlen; siehe Protokoll `06-protokolle/2026-10-06-r4-pruef-und-freigabeschranken.md`.)*

### R5 — Barrierefreiheit und Designsystem (P1) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M2-006 | Zugängliche Namen bleiben sprachunabhängig englisch | ○ |
| M2-007 | Drei Schaltflächenregeln unter 44 Pixel | ○ |
| M2-008 | Oberflächenfarben umgehen das semantische Tokensystem | ○ |
| M7-001 | Weiße Aktionsbeschriftung im dunklen Schema zu kontrastarm | **✓ behoben** (Thomas-Entscheidung 2026-10-06): Token `--color-action-text` je Schema — dunkel `#101114` auf `#ff4b59` = 5,7562:1, hell weiß auf `#c91f2c` = 5,6514:1, beide AA; Audit-Ausnahmen entfernt |
| M7-002 | Menü-Fokusbegrenzung berücksichtigt sichtbare Kategorien nicht | ○ |
| M7-003 | PDF-Schwärzung ohne Tastaturalternative | ○ |
| M7-004 | PDF-Viewer stellt Text assistiver Technik nicht bereit | ○ |
| M7-005 | Schmale Layouts verdecken Beschriftungen, Katalog läuft über | ○ |
| M7-006 | Nicht definierte CSS-Tokens lassen Regeln ausfallen | ○ |

*Hinweis:* **M7-001 wurde am 2026-10-06 durch Thomas neu entschieden** (Markenrot bleibt, Schriftfarbe
schemaabhängig) und ist **behoben** — siehe Protokoll `06-protokolle/2026-10-06-m7-001-kontrast-token.md`.
Die frühere akzeptierte Abweichung ist damit aufgehoben; die Audit-Ausnahmen wurden entfernt.

### R6 — Spanisch, Unicode, regionale Formate (P1) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M3-001 | Spanische Übersetzung beschädigt drei technische Platzhalter | ○ *(laut README bereits korrigiert — prüfen)* |
| M3-003 | Spanische Kerntexte ändern die fachliche Bedeutung | ○ |
| M3-004 | Deutsche Richtungsbeschriftungen umgehen die Sprachpakete | ○ |
| M3-006 | Ton und Terminologie nicht durchgängig eingehalten | ○ |
| M3-007 | Lange Unicode-Dateinamen beim Kürzen beschädigt | **✓ behoben** 2026-10-06 (bei M5-004 gefunden): `normaliseFileName` schnitt bei 180 Zeichen mitten in einem Emoji ab; Grenzprüfung ergänzt, Regressionstest in `save-file.test.ts` |
| M3-008 | Titelschreibung übersieht Wörter hinter spanischen Satzzeichen | ○ |
| M3-010 | Zahlenformate folgen innerhalb einer Oberfläche verschiedenen Regeln | ○ |

### R7 — Wahrheitsgemäße Produkt- und Architekturakten (P2) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M1-001 | Haupt-README beschreibt veralteten Produktumfang | ○ |
| M1-002 | „Suche über alle Sprachen" widerspricht dem Ladeverhalten | ○ |
| M2-001 | Sicherheits-ADR verbietet veröffentlichte M7-Werkzeuge | ○ |
| M2-002 | ADR verspricht harten Größenabbruch, das Gate warnt nur | ○ |
| M2-003 | Rechner-ADR enthält zwei überholte Budgets | ○ |
| M2-004 | QPDF-ADR beschränkt die Engine fälschlich auf M5 | ○ |
| M2-005 | Entscheidungsindex verschweigt ADR 0006 | ○ |
| M11-001 | Architekturbeschreibung führt vorhandene Grenzen als vertagt | ○ |

### R8 — Übergaben, Abschlusskriterien, Prüfverfahren (P2) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M10-001 | Erledigte Aufgaben bleiben in aktiven Listen | ○ |
| M10-002 | Übergabevorlage und tatsächliche Aktenstruktur driften auseinander | ○ |
| M10-003 | Übergaben werden trotz Erhaltungsregel umgeschrieben | ○ |
| M10-004 | Wesentliche Prüfskripte fehlen im versionierten Bestand | ○ |
| M10-005 | Abschlussbewertung nicht am dokumentierten Umfang gemessen | ○ |

### R9 — Gemeinsame Bausteine und Routing (P2) — nicht begonnen (nach Bedarf)

| Karte | Kurz | Stand |
|---|---|---|
| M4-009 | Gemeinsame technische Verantwortlichkeiten mehrfach implementiert | ○ |
| M4-010 | Routenzuordnung hat fachfremden Standardfall statt Vollständigkeitsprüfung | ○ |

### R10 — Infrastrukturberichte/NEL (P1) — nicht begonnen, **Betreiberentscheidung**

| Karte | Kurz | Stand |
|---|---|---|
| M8-005 | Infrastruktur-Fehlerberichte fehlen im dokumentierten Datenfluss | ○ *(braucht Betreiberautorisierung)* |

## 5. Arbeitsweise je Karte (gilt für alle)

1. **Karte im Wortlaut lesen** — Abnahme und „Nicht tun" sind die Grenzen.
2. **Gegen den heutigen Stand prüfen:** Pfad, fachlicher Anker, Aufrufkette, Zeilennummer.
   Die Karten sind Empfehlungen auf Basis `a041ee0`; überholte Punkte werden **gesammelt**, nicht
   ausgeführt.
3. **Umsetzen** mit dem kleinsten hinreichenden Eingriff; vorhandene Bausteine nutzen.
4. **Belegen:** Test mit den Abnahmeeingaben der Karte, dazu ein Browser-Beleg an der
   ausgelieferten Seite und eine Aufnahme, die selbst angesehen wird.
5. **Prüfkette:** `npm run licenses:generate` (nach jeder Änderung am Rust-/npm-Graph) →
   `npm run catalog:generate` (nach Sprachänderungen) → `npm run check` → `npm run build`.
   Rust: `cargo check --target wasm32-unknown-unknown` + `cargo test`.
6. **Akte:** Fortschrittsprotokoll nach `06-protokolle/`, `01-stand/offene-punkte.md` datiert
   ergänzen (nie überschreiben), bei Abschluss die Projekt-Übergabe.
7. **Commit** selektiv mit expliziten Pfaden — nie `git add -A`. **Nicht pushen.**

**Bekannte Stolperfallen** stehen im Skill `commietools-werkzeug-bauen` (Fallen aus Welle A–E,
R1, M9-004) — vor einer neuen Welle dort nachsehen statt neu zu stolpern.

## 6. Offene Entscheidungen für Thomas (Stand 2026-10-06)

1. **Revisionsbindung des Lizenzregisters** — `licenses:check` ist nach jedem Commit rot.
   *(Nachtrag 2026-10-06, gemessen bei M4-003: Der Unterschied zwischen Arbeitsbaum und HEAD ist
   **genau** die Revisionszeile samt daraus gebildeter Build-Adresse — kein inhaltlicher. Vor der
   Arbeit stand sie auf `ebabc36`, `npm run licenses:generate` setzte sie auf die aktuelle Revision
   und `npm run check` lief danach grün bis zum Ende. Die beiden Registry-Dateien werden deshalb
   nicht committet; solange die Bindung besteht, ist jeder Commit für sich `licenses:check`-rot.)*
2. **Importvertrag der Statistik** (M3-002) — ausdrücklich abzunehmen.
3. **Kennzeichnung der Anzeige-Nullung** (M4-002) — fehlt.
   *(Nachtrag 2026-10-06: **erledigt.** `Calculation` trägt `displayRoundedToZero`, die Oberfläche
   zeigt unter dem Ergebnis den Hinweis, de/en/es sind ergänzt. Belegt mit 667 Tests,
   Mutationsgegenprobe und vier Browserfällen; Protokoll
   `06-protokolle/2026-10-06-m4-002-anzeigenullung-kennzeichnung.md`.)*
4. **Fünf Lizenzfragen** (`zlib-rs`, `unicode-ident`, `pdf_signer` GPL-3.0-or-later,
   Originaltexte für sechs Pakete ohne Hinweisdatei, u. a. `alloc-stdlib`).
5. **Fünf fremde Advisory-Treffer** (`crossbeam-epoch`, `rsa` ohne Fix-Version, `rustls`,
   `ttf-parser` unmaintained).
6. **Aufräumregel** für `apps/web/public/licenses/notices/rust`.
7. **13 ältere Übergaben** mit fehlenden Pflichtabschnitten ergänzen.
8. **Push** der lokalen Commits — **vorerst zurückgestellt** (Thomas, 2026-10-06): `main` ist der
   Produktionsbranch bei Cloudflare Pages, ein Push veröffentlicht commietools.org. Entscheidung
   später; Stand damals: 33 Commits vor `origin/main`.

### Entschieden am 2026-10-06 (im Gespräch, Thomas)

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Importvertrag der Statistik (M3-002) | **abgenommen**: Komma = Dezimalzeichen, Semikolon trennt Listen |
| 2 | Kennzeichnung der Anzeige-Nullung (M4-002) | **Hinweis am Ergebnis**, keine neue Ampelstufe — umgesetzt am 2026-10-06 |
| 3 | Tabellenprogramm-Probe (M8-004) | **bewusst fallen gelassen**, Karte ohne sie abgeschlossen |
| 4 | Kontrast der Aktionsbeschriftung (M7-001) | **behoben**: Markenrot bleibt, Schriftfarbe je Schema |
| 5 | Push | **zurückgestellt** (main = Produktionsbranch) |
| 6 | Prüfskripte (M10-004) | nur die **tragenden Belegskripte** nach `scripts/belege/` |
| 7 | Lizenz `pdf_signer` (GPL-3.0-or-later) | **enge Einzel-Ausnahme** mit Grund, Datum, Quellangebot |
| 8 | Advisory-Treffer | **erst messen**, welche Pakete im ausgelieferten WASM landen |
| 9 | Revisionsbindung des Registers | **Prüfung von der Revision lösen**, Revision nur beim Release binden |
| 10 | Rust-Hinweise | **aufräumen**: verwaiste entfernen |
| 11 | 13 ältere Übergaben | **ergänzen**, nur den fehlenden Pflichtabschnitt anhängen, Wortlaut bleibt |
| 12 | M2-009 / M3-001 | **prüfen**, dann über Entfall entscheiden |
| 13 | M8-005 (NEL) | **zurückgestellt** |

**Noch nicht entschieden:** Aufnahme von `Zlib` (`zlib-rs`) und `Unicode-3.0` (`unicode-ident`) in
`allowedExpressions` — beide permissiv und unkritisch, vorgeschlagen, aber ausdrücklich noch nicht
abgenommen. Ebenso die sechs Pakete ohne Originaltext (Beschaffung).

## 7. Git-Stand

- Kopf: `ebabc36` (Übergabe-Nachtrag), Arbeitsbaum sauber bis auf die bewusst uncommittete
  `licenses/registry.json` mit HEAD-Revision.
- 10 Commits seit `0a4ecea` in dieser Arbeit. **Nichts gepusht.**

*Nachtrag 2026-10-06 (nach M4-003).* Kopf ist jetzt **`c30cb74`**
(„Plotter: x ueber den Scope binden statt Zeichen ersetzen (M4-003)"), davor `d78724f` und
`352b726`. `main` steht **15 Commits vor `origin/main`** — **nichts gepusht**. Der Arbeitsbaum
trägt außerhalb dieses Commits nur die beiden revisionsgebundenen Registry-Dateien
(`licenses/registry.json`, `apps/web/public/licenses/registry.json`), bewusst uncommittet auf der
Revision `d78724f`; sie unterscheiden sich nachweislich **nur** in der Revisionsangabe und der
daraus gebildeten Build-Adresse. Die frühere Formulierung („Kopf `ebabc36`") ist damit überholt,
nicht falsch gewesen.

*Nachtrag 2026-10-06 (nach M6-001).* Kopf ist jetzt **`dac33b7`**
(„JSON-Formatierung als Textedits statt Neu-Serialisierung (M6-001)"), davor `00da6c7`, `c30cb74`,
`d78724f` und `352b726`. `main` steht damit weiter **vor** `origin/main` — **nichts gepusht**. Der
Arbeitsbaum trägt außerhalb der Commits nur die beiden revisionsgebundenen Registry-Dateien,
bewusst uncommittet auf der Revision `dac33b7`; die inhaltliche Registrierung der neuen Abhängigkeit
`jsonc-parser` ist dagegen **committet**. Die früheren Stände (`ebabc36`, dann `c30cb74`) sind damit
überholt, nicht falsch gewesen.

*Nachtrag 2026-10-06 (nach R4).* **R4 ist durch.** Sieben Karten erledigt (M1-003, M4-008, M5-001,
M5-002, M5-003, M5-004, M3-009), eine teilweise (M2-009 ◐ — Prüfer erweitert und Namenslücke
behoben, Kontrastgegenprobe offen). Zwei echte Produktfehler dabei gefunden und behoben: der
hängende Aktionsknopf (M4-005) und der zerteilte Emoji-Dateiname (**M3-007**, damit erledigt).
Protokoll: `06-protokolle/2026-10-06-r4-pruef-und-freigabeschranken.md`. **Nichts gepusht.**

*Nachtrag 2026-10-06 (nach M4-008).* Kopf wird mit dem Commit zu M4-008 fortgeschrieben. `lint`
prüft jetzt die Produktbasis (415 Dateien) und läuft als Pflichtteil in `check`; zwei echte Befunde
dabei behoben (fünf nicht behandelte Zusagen in `pdfUi.tsx`, ein toter Zustand in `ImageResize.tsx`),
ein `throw` im `finally` des Prüfskripts beseitigt. Protokoll:
`06-protokolle/2026-10-06-m4-008-lint.md`. **Nichts gepusht.**

*Nachtrag 2026-10-06 (nach M8-002).* Kopf weiter **`49dcaf2`** (M8-002 hat nur gemessen, keinen Code
geändert); Akten-Commit folgt. **M8-002 ist belegt nicht erfüllt** — Offline-Reload im frischen
Profil bleibt leer, acht beim Öffnen nachgeladene Pakete fehlen im CacheStorage. Protokoll:
`06-protokolle/2026-10-06-m8-002-offline-erster-besuch.md`. **Nichts gepusht.**

*Nachtrag 2026-10-06 (nach M4-005/M4-006).* Kopf ist jetzt **`49dcaf2`**
(„PDF-Teiler: gesperrter Aktionsknopf nach Dateiwechsel behoben"), davor `64bc150`, `a0bad10`.
Belege für M4-005/M4-006 erbracht (Zähler, Ausgabedateien inhaltlich geprüft); ein Abnahmefall
(„A zuletzt fertig") ist **nicht herstellbar** und im Protokoll benannt. Protokoll:
`06-protokolle/2026-10-06-m4-005-m4-006-pdf-auftraege-urls.md`. **Nichts gepusht.**

*Nachtrag 2026-10-06 (nach M4-002-Anzeigenullung).* Kopf ist jetzt **`a0bad10`** („Anzeige-Nullung
am Ergebnis gekennzeichnet (M4-002)"), davor `0711dcc`, `1469f56` und die in den früheren Nachträgen
genannten Commits. `main` steht damit **37 Commits vor `origin/main`** — **nichts gepusht.** Der
Arbeitsbaum trägt außerhalb des Commits nur die bewusst uncommittete fremde Konzeptdatei
`03-konzepte/2026-10-06-tooltip-und-kontexthilfe.md` (nicht angefasst, nicht committet). Der
geprüfte Stand ist identisch mit `a0bad10`: 667 Tests, `check`, `build`, `licenses:check` und
`catalog:check` je Exit 0.

*Nachtrag 2026-10-06 (nach M6-002).* Kopf ist jetzt **`15f386f`** („RPN: Eingabereducer mit
getrenntem Zahlentoken (M6-002)"), davor `86be4d8`, `dac33b7`, `00da6c7`, `c30cb74` und `d78724f`.
**Nichts gepusht.** Der Arbeitsbaum trägt außerhalb der Commits nur die beiden
revisionsgebundenen Registry-Dateien (bewusst uncommittet); ihre inhaltliche Registrierung ist
committet. Vor jedem Prüflauf ist deshalb `npm run licenses:generate` nötig, sonst ist
`licenses:check` rot — der gemessene Vorbefund aus Abschnitt 6, Punkt 1.

## 8. Pflege dieser Datei

Aktualisiert wird **nur Spalte „Stand"** in Abschnitt 4 und die Abschnitte 6 und 7 — jeweils mit
Datum. Der Wortlaut von Auftrag, Reihenfolge und Arbeitsweise bleibt stehen; Änderungen daran
bekommen einen datierten Zusatz (Korrekturregel des Projekts). Bei jedem Sitzungsabschluss
mitführen, solange die Sanierung läuft.