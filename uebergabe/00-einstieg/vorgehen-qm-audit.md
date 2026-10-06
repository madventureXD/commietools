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

### R2 — Ergebnisrichtigkeit und Exportgrenzen (P1) — **begonnen**

| Karte | Kurz | Stand |
|---|---|---|
| M3-002 | Statistik liest lokalisierte Zahlen falsch | ✓ neue Grammatik; **Abnahme des Importvertrags offen (Thomas)** |
| M4-001 | RPN verkettet Brüche ohne Klammern | ✓ `geschuetzterOperand`, Abnahmefall 3/2 |
| M4-002 | Anzeige-Nullschwelle vernichtet Vollwert | ◐ `raw`/`full` echt; **Kennzeichnung der Anzeige-Nullung offen** |
| M4-003 | Plotter ersetzt `x` auch in Funktionsnamen | ✓ Scope-Bindung, `raw` statt `display`; Abnahmefälle im Browser belegt (2026-10-06) |
| M6-001 | JSON-Formatierung verändert Zahlenwerte | ✓ Textedits auf dem Originaltext, Fehlerstelle mit Zeile/Spalte; Werkzeug aus dem Startbündel gelöst (ADR 0012) |
| M6-002 | RPN-Tastenfeld setzt mehrstellige Zahlen nicht zusammen | ✓ Eingabereducer mit getrenntem Zahlentoken; Tastenfolgen im Browser belegt (2026-10-06) |
| M8-004 | CSV-Freitext als Tabellenformel exportiert | ○ |

### R3 — Datei-Aufträge, Ressourcen, Offline (P1) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M4-004 | Sprachladefehler bleiben gecacht; kein Fehler-/Wiederholungszustand | ○ |
| M4-005 | PDF-Ergebnisse nach Dateiwechsel dem falschen Namen zugeordnet | ○ |
| M4-006 | PDF-Teiler gibt Ergebnis-URLs beim Verlassen nicht frei | ○ |
| M4-007 | Sprach-Type-Guard akzeptiert geerbte Objektschlüssel | ○ |
| M8-002 | Erste Offline-Bereitschaft hängt am flüchtigen HTTP-Cache | ○ |
| M8-003 | Fehlender Browser-Speicher verhindert Nutzung statt Rückfall | ○ |

### R4 — Wirksame Tests, Lint, Freigabeschranken (P1) — nicht begonnen (begleitend)

| Karte | Kurz | Stand |
|---|---|---|
| M1-003 | Kein erkennbarer Freigabeschutz für `main` | ○ |
| M4-008 | Erfolgreiches Lint-Kommando prüft keine Workspace-Codebasis | ○ |
| M5-001 | PDF-Tests sichern Seitenwahl und Nummerninhalte nicht ab | ○ |
| M5-002 | Zentraler Speichervorgang bleibt im Testlauf unbenutzt | ○ |
| M5-003 | Kritische PDF-Engine-Pfade ohne normalen Testschutz | ○ |
| M5-004 | Randfalltests erfassen wichtige Kombinationen nicht | ○ |
| M2-009 | Versprochene automatische Barrierefreiheitsprüfung fehlt | ○ |
| M3-009 | Vorgeschriebene Sprachprüfungen nicht vollständig automatisiert | ○ |

*Hinweis:* M2-009 dürfte überholt sein — laut README des Empfehlungspakets existiert inzwischen ein
`a11y:check`; im Projekt ist er als erledigt geführt. Beim Bearbeiten gegen den Live-Stand prüfen.

### R5 — Barrierefreiheit und Designsystem (P1) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M2-006 | Zugängliche Namen bleiben sprachunabhängig englisch | ○ |
| M2-007 | Drei Schaltflächenregeln unter 44 Pixel | ○ |
| M2-008 | Oberflächenfarben umgehen das semantische Tokensystem | ○ |
| M7-001 | Weiße Aktionsbeschriftung im dunklen Schema zu kontrastarm | ○ *(als akzeptierte Abweichung entschieden)* |
| M7-002 | Menü-Fokusbegrenzung berücksichtigt sichtbare Kategorien nicht | ○ |
| M7-003 | PDF-Schwärzung ohne Tastaturalternative | ○ |
| M7-004 | PDF-Viewer stellt Text assistiver Technik nicht bereit | ○ |
| M7-005 | Schmale Layouts verdecken Beschriftungen, Katalog läuft über | ○ |
| M7-006 | Nicht definierte CSS-Tokens lassen Regeln ausfallen | ○ |

*Hinweis:* **M7-001 widerspricht einer Entscheidung von Thomas** (Kontrast bleibt, als akzeptierte
Abweichung im Prüfer geführt). Nach der Auftragsregel also **nicht ausführen**, sondern in der
Entscheidungsliste sammeln.

### R6 — Spanisch, Unicode, regionale Formate (P1) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M3-001 | Spanische Übersetzung beschädigt drei technische Platzhalter | ○ *(laut README bereits korrigiert — prüfen)* |
| M3-003 | Spanische Kerntexte ändern die fachliche Bedeutung | ○ |
| M3-004 | Deutsche Richtungsbeschriftungen umgehen die Sprachpakete | ○ |
| M3-006 | Ton und Terminologie nicht durchgängig eingehalten | ○ |
| M3-007 | Lange Unicode-Dateinamen beim Kürzen beschädigt | ○ |
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
4. **Fünf Lizenzfragen** (`zlib-rs`, `unicode-ident`, `pdf_signer` GPL-3.0-or-later,
   Originaltexte für sechs Pakete ohne Hinweisdatei, u. a. `alloc-stdlib`).
5. **Fünf fremde Advisory-Treffer** (`crossbeam-epoch`, `rsa` ohne Fix-Version, `rustls`,
   `ttf-parser` unmaintained).
6. **Aufräumregel** für `apps/web/public/licenses/notices/rust`.
7. **13 ältere Übergaben** mit fehlenden Pflichtabschnitten ergänzen.
8. **Push** der 10 lokalen Commits (`03440a7` … `ebabc36`) — gesammelt am Ende durch Thomas.

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