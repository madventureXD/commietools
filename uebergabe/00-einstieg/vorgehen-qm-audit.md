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

## 4. Stand der Karten (2026-10-06, nachgeführt 2026-10-07)

Legende: ✓ erledigt · ◐ erledigt mit offener Restforderung · ○ offen

**Stand am 2026-10-07 (ausgezählt): 59 Karten — 28 erledigt · 1 mit Restforderung (M8-001) ·
30 offen.** R1, R2, R3 und R4 sind vollständig; R5–R10 stehen aus (R10 ist Betreiberentscheidung).

*Korrektur 2026-10-07 (Faber, Aktenpflege). Der vorstehende Satz widersprach der Tabelle dieses
Abschnitts und wurde nachgezählt — nicht aus der Summe, sondern Zeile für Zeile mit einem Skript
über die Kartentabellen: **59 Karten — 34 erledigt · 1 mit Restforderung (M8-001) · 24 offen.**
Je Stufe: R1 5 von 6 · R2 7 von 7 · R3 6 von 6 · R4 8 von 8 · R5 7 von 9 · **R6 7 von 7** (2026-10-07: M3-001, M3-003, M3-004, M3-006, M3-007, M3-008, M3-010) · · **R7 offen** ·
R7 0 von 8 · R8 0 von 5 · R9 0 von 2 · R10 0 von 1. Die alte Zahl beschrieb den Stand vor dem
R5-Durchzug; der Wortlaut bleibt deshalb stehen, maßgeblich ist die Tabelle mit dieser Korrektur.
Korrektur des zweiten Halbsatzes: R5 ist **begonnen** (7 von 9), nicht „steht aus".*

Grund der Abweichung: Die Summe wurde beim Anlegen der Übersicht gesetzt und beim Nachführen der
Tabelle nicht mitgezogen; die Tabelle war richtig, die Summe nicht.

*Nachtrag 2026-10-07 (R5 abgeschlossen).* Nach M7-003 und M7-004 steht der Stand bei
**59 Karten — 36 erledigt · 1 mit Restforderung (M8-001) · 22 offen.** R1, R2, R3, R4 und **R5**
sind vollständig; offen sind R6 (6), R7 (8), R8 (5), R9 (2) und R10 (1, Betreiberentscheidung).
Übergabe: `05-uebergaben/2026-10-07-r5-abgeschlossen.md`.*

*Nachtrag 2026-10-07 (R6 und R7 abgeschlossen, Faber).* Nachgezählt **Zeile für Zeile mit einem
Skript** über die Kartentabellen dieses Abschnitts (nicht aus einer Summe abgeleitet):
**59 Karten — 50 erledigt · 1 mit Restforderung (M8-001) · 8 offen.** Vollständig sind R1, R2, R3,
R4, R5, **R6 (7 von 7)** und **R7 (8 von 8)**; offen sind R8 (5), R9 (2) und R10 (1,
Betreiberentscheidung).

**Dabei eine Unterlassung berichtigt:** die Tabelle zu R6 war nach dem R6-Durchzug **nicht
nachgezogen** worden — fünf Karten (M3-003, M3-004, M3-006, M3-008, M3-010) standen weiter auf „○",
obwohl sie laut Übergabe `05-uebergaben/2026-10-07-r6-abgeschlossen.md` erledigt sind und dafür
Protokolle und Commits vorliegen. Sie sind jetzt **datiert nachgetragen** (Zusatz „nachgetragen“).
Die alte Angabe bleibt damit als damaliger Stand erkennbar; es wurde nichts umgeschrieben.

R7-Protokolle: `06-protokolle/2026-10-07-r7-m1-001-readme-umfang.md`, `…-r7-m1-002-suchsprachen.md`,
`…-r7-m2-001-m7-freigabekriterien.md`, `…-r7-m2-002-groessenpolitik.md`,
`…-r7-m2-003-rechner-budgets.md`, `…-r7-m2-004-qpdf-anwendungsbereich.md`,
`…-r7-m2-005-adr-index-und-gate.md`, `…-r7-m11-001-architektur-iststand.md`.
Übergabe: `05-uebergaben/2026-10-07-r7-abgeschlossen.md`.*

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

### R3 — Datei-Aufträge, Ressourcen, Offline (P1) — **abgeschlossen 2026-10-07** (6 Karten: M4-004 ◐→✓ mit benannter Abweichung, M4-005 ✓ mit benannter Grenze, M4-006 ✓, M4-007 ✓, M8-002 ✓, M8-003 ✓)

| Karte | Kurz | Stand |
|---|---|---|
| M4-004 | Sprachladefehler bleiben gecacht; kein Fehler-/Wiederholungszustand | **✓ mit benannter Abweichung** (2026-10-07): Cache gibt abgelehnte Importe frei (5 Lader); **Fehlerweg überall sichtbar** — Werkzeugtexte, Katalog, Werkzeugmenü, Suiten-Seite, Katalogschlüssel; **Fehlergrenze** für die nachgeladenen Werkzeuge mit getrennten Meldungen (veralteter Chunk / Auswertungsfehler); **Schleifensperre** für das Neuladen. Abnahme über einen Fehler-Proxy: 7 Prüfungen grün, **0 unbehandelte Zusagen**. **Abweichung (gemessen):** „Retry ohne Dokumentreload" ist bei einem gescheiterten Modulimport nicht möglich — der Browser merkt sich die Adresse im Dokument (Minimalversuch: 3 Versuche, 1 Netzanfrage); statt eines wirkungslosen Knopfes steht das kontrollierte Neuladen |
| M4-005 | PDF-Ergebnisse nach Dateiwechsel dem falschen Namen zugeordnet | **✓ mit benannter Grenze** (2026-10-07): Abnahme auf dem heutigen Stand neu gefahren — A (1200 S.) verworfen, B allein sichtbar/speicherbar, Inhalt der 3 Ausgaben als `SEITE-B` geprüft, 60 s stabil; **Unmount im Erfolgs-, Lauf- und Fehlerweg belegt**. Dabei zwei Produktfehler gefunden+behoben (hängender Aktionsknopf; nicht freigegebene Adressen beim Verlassen während eines Auftrags). **Grenze:** Reihenfolge „A zuletzt fertig" nicht herstellbar (Verarbeitung 0,6 s, Grund gemessen) |
| M4-006 | PDF-Teiler gibt Ergebnis-URLs beim Verlassen nicht frei | **✓ abgeschlossen** (2026-10-07): Zählerbeleg im Betrieb (create 1203 / revoke 1200 / offen 3) und nach dem Verlassen (revoke 1203 / **offen 0**); **Unmount während laufender Verarbeitung** war ein echtes Leck (offen **1200**, behoben); **StrictMode-Zyklus und wiederholte Nutzung** gegen `vite dev` belegt (5 Aufträge, Zähler je Lauf ausgeglichen, Endstand 17/17/**0**), Mehrfachspeichern ohne Schaden. **Rest (keine Abnahmebedingung):** gemeinsamer `useObjectUrls`-Hook nicht gebaut |
| M4-007 | Sprach-Type-Guard akzeptiert geerbte Objektschlüssel | ✓ `hasOwnProperty.call` + `typeof`-Prüfung; `__proto__`/`constructor` abgewiesen (2026-10-06) |
| M8-002 | Erste Offline-Bereitschaft hängt am flüchtigen HTTP-Cache | **✓ erfüllt** (2026-10-06): frisches Profil, HTTP-Cache gelöscht, **Dienst beendet** → Reload lädt vollständig (**23 von 23 Antworten aus dem Service Worker, 0 gescheitert**), dritte Sprache wird nicht geholt. Lösung: Warmlauf der Sprachpakete nach SW-Kontrolle + `ignoreVary` in der Laufzeitregel. Offen: Warmbesuch, Localewechsel, SW-Versionswechsel |
| M8-003 | Fehlender Browser-Speicher verhindert Nutzung statt Rückfall | **✓ abgeschlossen** (2026-10-07): Speicheradapter mit expliziten Zuständen (`ok`/`unavailable`/`quota`/`invalid`) für Rechnerverlauf, Aufmaß und Prüffristen; **Engine und Speicher getrennt geladen** (vorher machte ein Speicherfehler den Rechner unbenutzbar); **flüchtiger Sitzungsbetrieb** mit sichtbarer Warnung; **kein „gespeichert" ohne Deckung**; nach gescheitertem Lesen wird **nicht** geschrieben. Abnahme im Browser (Fehler vor dem Programmstart eingespeist): gesperrtes `localStorage`, kaputter Inhalt, gesperrte IndexedDB, scheiterndes Schreiben — **Rechner rechnet in allen Fällen** (2+3=5, 7*6=42), Warnung sichtbar, **0 unbehandelte Zusagen**. **Nicht gemessen:** ob der eingespeiste `QuotaExceededError` als `quota` (statt `unavailable`) ankommt — die Zuordnung ist über Tests abgesichert |

### R4 — Wirksame Tests, Lint, Freigabeschranken (P1) — **abgeschlossen 2026-10-06, vollständig 2026-10-07** (M2-009 nachgezogen)

| Karte | Kurz | Stand |
|---|---|---|
| M1-003 | Kein erkennbarer Freigabeschutz für `main` | ✓ mit benannten Grenzen (2026-10-06): `.github/workflows/quality.yml` (Node- und Rust-Job, minimale Rechte, kein Deployment). **Grenzen:** nie ausgeführt (kein Push), Actions auf Tags statt SHAs, kein Browserjob (Edge/Windows), Branchschutz bleibt Kontosache |
| M4-008 | Erfolgreiches Lint-Kommando prüft keine Workspace-Codebasis | **✓ erledigt** (2026-10-06): `eslint.config.mjs` + Wurzel-`tsconfig.json`, `lint` = `eslint .` und Pflichtteil von `check`; **0 Fehler, 96 Warnungen**, 415 Dateien geprüft (vorher 0). Mutationsgegenprobe belegt. Neue MIT-Abhängigkeiten, Lizenzlauf grün (607 Pakete) |
| M5-001 | PDF-Tests sichern Seitenwahl und Nummerninhalte nicht ab | **✓ erledigt** (2026-10-06): unabhängiger Leser (pdfjs) im Test — Wasserzeichen nur auf der gewählten Seite, Nummerierung „5 / 6" und „6 / 6" inhaltlich geprüft, nicht gewählte Seite leer |
| M5-002 | Zentraler Speichervorgang bleibt im Testlauf unbenutzt | **✓ erledigt** (2026-10-06): injizierbarer Speicheradapter (`SaveEnvironment`/`saveWithAdapter`), 7 neue Tests mit geprüften Bytes/Name/MIME, Abbruch ohne heimlichen Download, Schreibfehler, fehlende API, wiederholter Klick |
| M5-003 | Kritische PDF-Engine-Pfade ohne normalen Testschutz | **✓ erledigt, ein Rest offen** (2026-10-06): QPDF-Wirkung im Browser belegt — geschützt ohne Passwort `PasswordException`, mit Passwort Inhalt `SEITE-B-1/2/3` vollständig, entsperrt inhaltlich unverändert, falsches Passwort ergibt echten Fehler. **Offen:** Signaturkorpus nicht im normalen Testschutz |
| M5-004 | Randfalltests erfassen wichtige Kombinationen nicht | **✓ erledigt** (2026-10-06): die dokumentierten Regressionen stehen in der regulären Suite (M3-001 über die neue Sprachprüfung). **Dabei ein echter Fehler gefunden und behoben:** `normaliseFileName` schnitt bei 180 Zeichen mitten in einem Emoji ab (unpaariges Surrogat) — **M3-007 damit erledigt** |
| M2-009 | Versprochene automatische Barrierefreiheitsprüfung fehlt | **✓ abgeschlossen** (2026-10-07): Prüfer erweitert (offenes Menü mitgemessen, eigene Grenzen ausgegeben, `aria-hidden`-Namenslücke behoben). **Kontrastursache gemessen und behoben** — ohne deckende Vorfahrenfläche brach die Hintergrundauflösung ab, der Mangel blieb unsichtbar (Wegwerf-Seite: Kontrast=0 bei übersprungen=3). Jetzt Leinwandrückfall (Weiß) mit ausgewiesener Zahl je Route, Lücken mit Element und Grund **benannt**; Mutationsgegenprobe: derselbe Absatz ergibt Kontrast=1 (1,66/4,5). **Browserjob** `browser` auf `windows-latest` verdrahtet. Läufe: 62 Routen × 2 Breiten in beiden Schemata Exit 0, 0 Befunde, 0 Lücken. **Grenzen:** Job nie gelaufen, Vorleserausgabe/Tastatur/Zoom/Fokusreihenfolge/reduzierte Bewegung bleiben Handarbeit |
| M3-009 | Vorgeschriebene Sprachprüfungen nicht vollständig automatisiert | **✓ erledigt** (2026-10-06): `language-contract.test.ts`, registrygesteuert — Parität, leere Texte, **Platzhalter** (Name und Häufigkeit), Interpolationssyntax, Wohlgeformtheit, common+suites, Katalogtexte. Mutationsgegenprobe `{number}`→`{número}`: genau zwei Prüfungen rot. Generator liefert bei Wiederholung identische Ausgabe |

*Hinweis:* M2-009 dürfte überholt sein — laut README des Empfehlungspakets existiert inzwischen ein
`a11y:check`; im Projekt ist er als erledigt geführt. Beim Bearbeiten gegen den Live-Stand prüfen.
*(Nachtrag 2026-10-06: Bestätigt — `a11y:check` existiert und prüft alle Routen des Registers bei
zwei Breiten. Der Punkt bleibt trotzdem auf ◐, weil die Abdeckung erweitert wurde und zwei
Teilnachweise fehlen; siehe Protokoll `06-protokolle/2026-10-06-r4-pruef-und-freigabeschranken.md`.)*

### R5 — Barrierefreiheit und Designsystem (P1) — **abgeschlossen** (9 von 9, Stand 2026-10-07)

| Karte | Kurz | Stand |
|---|---|---|
| M2-006 | Zugängliche Namen bleiben sprachunabhängig englisch | **✓ mit benannter Grenze** (2026-10-07): Namen im Accessibility-Baum in de/en/es korrekt, Modusgruppe als `role="group"` mit `aria-pressed`, Tastatur wechselt den Modus — **nicht herstellbar: echte Vorleseransage** (kein NVDA/Narrator in dieser Umgebung); Protokoll `06-protokolle/2026-10-07-m2-006-zugaengliche-namen.md` |
| M2-007 | Drei Schaltflächenregeln unter 44 Pixel | **✓ behoben** (2026-10-07) |
| M2-008 | Oberflächenfarben umgehen das semantische Tokensystem | **✓ behoben** (2026-10-07) |
| M7-001 | Weiße Aktionsbeschriftung im dunklen Schema zu kontrastarm | **✓ behoben** (Thomas-Entscheidung 2026-10-06): Token `--color-action-text` je Schema — dunkel `#101114` auf `#ff4b59` = 5,7562:1, hell weiß auf `#c91f2c` = 5,6514:1, beide AA; Audit-Ausnahmen entfernt |
| M7-002 | Menü-Fokusbegrenzung berücksichtigt sichtbare Kategorien nicht | **✓ behoben** (2026-10-07): nativer modaler Dialog (`showModal`), Hintergrund inaktiv, Tabulator bleibt im Menü — gemessen bei 1360 und 390 px |
| M7-003 | PDF-Schwärzung ohne Tastaturalternative | **✓ mit benannten Grenzen** (2026-10-07): Rechteckmodell für Zeiger **und** Tastaturformular, Bereichsliste mit Entfernen, Pfeiltasten (1/10 Punkte), Fehlermeldung mit `aria-invalid`, gemeinsame Prüfstelle im Kern. **Fund: MuPDF erwartet Rechtecke im angezeigten Raum** — auf gedrehten Seiten war die bisherige Umrechnung falsch (Sonde mit fünf Kandidaten); Anzeigemaße sind jetzt der gültige Koordinatenraum, Regressionstest hält beide Hälften fest. Beleg: Tastaturabnahme mit unabhängiger Textprüfung (pdf.js) und Pixelmessung (MuPDF), Rotationslauf separat. Protokoll `06-protokolle/2026-10-07-m7-003-schwaerzung-tastatur.md`. **Grenzen:** nativer Dateidialog kein DOM, Touchgerät fehlt, Zoom nur bei 100 %, zweites Setzen einer Datei im Prüfmittel unklar |
| M7-004 | PDF-Viewer stellt Text assistiver Technik nicht bereit | **✓ mit benannten Grenzen** (2026-10-07): zugängliche Textansicht je Seite (Überschrift + Absatz im Accessibility-Baum), `aria-current` an der aktiven Miniatur, Vorschaubild dekorativ (keine doppelte Lesung), Fokus bleibt beim Blättern — auf der letzten Seite wandert er auf die Gegenrichtung, weil der deaktivierte Knopf den Fokus verliert (gemessen). Scan zeigt Hinweis statt Text; mehrspaltige Reihenfolge spaltenweise gemessen und im Produkt als Grenze sichtbar. Protokoll `06-protokolle/2026-10-07-m7-004-viewer-text.md`. **Grenzen:** kein Vorleserlauf, flache Lesereihenfolge, Speichercleanup nicht über langen Lauf gemessen |
| M7-005 | Schmale Layouts verdecken Beschriftungen, Katalog läuft über | **✓ behoben** (2026-10-07) |
| M7-006 | Nicht definierte CSS-Tokens lassen Regeln ausfallen | **✓ behoben** (2026-10-07) |

*Hinweis:* **M7-001 wurde am 2026-10-06 durch Thomas neu entschieden** (Markenrot bleibt, Schriftfarbe
schemaabhängig) und ist **behoben** — siehe Protokoll `06-protokolle/2026-10-06-m7-001-kontrast-token.md`.
Die frühere akzeptierte Abweichung ist damit aufgehoben; die Audit-Ausnahmen wurden entfernt.

### R6 — Spanisch, Unicode, regionale Formate (P1) — nicht begonnen

| Karte | Kurz | Stand |
|---|---|---|
| M3-001 | Spanische Übersetzung beschädigt drei technische Platzhalter | **✓ erledigt** (2026-10-07): Die drei Stellen tragen `{number}`; Sprachvertragstest vorhanden, **Mutationsgegenprobe über die Kette** (`catalog:check` Exit 1 mit „out of date", zurückgenommen Exit 0) — der Einzeltest bleibt dabei grün, weil er die generierten Pakete liest. UI-Beleg in drei Werkzeugen (spanisch, echte Nummer, 0 Restklammern). **Mitbehoben:** die drei pdf.js-Renderpfade hatten keine Zeitgrenze — im Bilderexport stand der Knopf dauerhaft auf „Procesando PDF…"; jetzt Meldung statt Dauerlauf. Nebenbefund: `tool.pdfToImages.download` wird im Code nicht mehr verwendet. Protokoll `06-protokolle/2026-10-07-m3-001-platzhalter.md`, Commit `7123077` |
| M3-003 | Spanische Kerntexte ändern die fachliche Bedeutung | **✓ erledigt** (2026-10-07, nachgetragen): vier Sinnverwechslungen behoben (`Revelador`, `Ahorro` ×2, `software gratuito`), Fachglossar + `glossary:check` mit Gegenprobe; Commits `bf65c01`, `d7ff3ae`, `03850ab`; Protokoll `06-protokolle/2026-10-07-m3-003-spanische-kerntexte.md` |
| M3-004 | Deutsche Richtungsbeschriftungen umgehen die Sprachpakete | **✓ erledigt** (2026-10-07, nachgetragen): Zoll-Richtungen über Sprachschlüssel mit Parametern; neuer Prüfer `jsx:check`; Commit `ba3098e`; siehe R6-Übergabe `05-uebergaben/2026-10-07-r6-abgeschlossen.md` |
| M3-006 | Ton und Terminologie nicht durchgängig eingehalten | **✓ erledigt** (2026-10-07, nachgetragen): vier Anredeverstöße auf den unpersönlichen Infinitiv umgestellt, fünf Positivkontrollen begründet unverändert; Commits `66be1cb`, `5a1ff4d`; Protokoll `06-protokolle/2026-10-07-m3-006-ton-terminologie.md` |
| M3-007 | Lange Unicode-Dateinamen beim Kürzen beschädigt | **✓ erledigt — zweistufig.** 2026-10-06 (bei M5-004 gefunden): `normaliseFileName` schnitt bei 180 Zeichen mitten in einem Emoji ab; Surrogat-Grenzprüfung + Regressionstest ergänzt. **Nachtrag 2026-10-07 (nach R6):** Die Karte war richtig, aber halb umgesetzt — 25 weitere Stellen
benutzten weiter die Oberflächensprache. Nachgezogen: `anzeigeKontext()` für alle Anzeige-Stellen und
Prüfer `npm run format:check` (in `npm run check`); Beleg mit abweichender Geräte-Region. Protokoll
`06-protokolle/2026-10-07-formatkontext-reststellen.md`. **2026-10-07 (R6, Durchzug):** das war zu kurz gegriffen — es schützt nur Surrogatpaare, nicht **Graphemgruppen** (ZWJ-Familie, Flagge, Hautton, kombinierendes Zeichen bleiben beim Durchschneiden wohlgeformt und sind trotzdem zerstört). Jetzt `Intl.Segmenter` (`granularity: 'grapheme'`), gezählt weiter in UTF-16-Einheiten gegen die 180er-Grenze, benannter Rückfall. Test prüft gegen **unabhängige** Segmentliste; echte Mutationsgegenprobe (zeichenweise Segmentierung) lässt die ZWJ-Familie durchfallen — zwei frühere Mutationsanläufe scheiterten am Linter und waren wertlos (im Protokoll benannt). Protokoll `06-protokolle/2026-10-07-m3-007-graphemgrenzen.md`, Commit `0673e4f` |
| M3-008 | Titelschreibung übersieht Wörter hinter spanischen Satzzeichen | **✓ erledigt** (2026-10-07, nachgetragen): Wortgrenzen über `Intl.Segmenter`/`isWordLike`; Bindestrich-/Apostrophregel festgelegt; Commit `0ed056c`; Protokoll `06-protokolle/2026-10-07-m3-008-titelschreibung.md` |
| M3-010 | Zahlenformate folgen innerhalb einer Oberfläche verschiedenen Regeln | **✓ erledigt** (2026-10-07, nachgetragen): gemeinsamer Formatkontext, vier genannte Stellen umgestellt; **Nachtrag:** weitere 25 Anzeige-Stellen folgen dem Kontext, Prüfer `format:check`; Commits `33278da`, `fdbbb91`, `34be880`; Protokolle `06-protokolle/2026-10-07-m3-010-zahlenformate.md`, `…-formatkontext-reststellen.md` |

### R7 — Wahrheitsgemäße Produkt- und Architekturakten (P2) — nicht begonnen

*Zusatz 2026-10-07 (Faber, Durchzug auf Anweisung von Thomas): **R7 ist vollständig — 8 von 8
Karten.** Die Überschrift dieses Abschnitts ist der Stand vom 2026-10-06 und bleibt stehen;
maßgeblich ist die Spalte „Stand" und der Nachsatz am Ende dieses Abschnitts.*

| Karte | Kurz | Stand |
|---|---|---|
| M1-001 | Haupt-README beschreibt veralteten Produktumfang | **✓ erledigt** (2026-10-07): Umfangszahlen stehen in einem **generierten** README-Block (`scripts/readme-scope.mjs`, `npm run readme:check` in `check`); am Bau nachgezählt 62 Tools / 7 Suiten / 23 PDF. Protokoll `06-protokolle/2026-10-07-m1-001-readme-umfang.md`, Commit `85e2cd0` |
| M1-002 | „Suche über alle Sprachen" widerspricht dem Ladeverhalten | **✓ erledigt** (2026-10-07): README, Hinweistext de/en/es und Suchkommentar sagen „gewählte Sprache plus Englisch"; der erzeugte Lader ruft Englisch nicht mehr doppelt auf; Vertragstest. Beleg: 4 Browserfälle. Protokoll `…-r7-m1-002-suchsprachen.md`, Commit `a1e0e11` |
| M2-001 | Sicherheits-ADR verbietet veröffentlichte M7-Werkzeuge | **✓ erledigt** (2026-10-07): neuer **ADR 0014** mit Produktstand und Nachweis je Gate; ADR 0004 datiert verknüpft und im Wortlaut erhalten. **Entscheidung Thomas am 2026-10-07: angenommen mit vier Auflagen A1–A4** (Schwachstellenstand des Signaturpfads, unabhängige Review, GPL-Originalhinweis, revisionsgebundener Korpusbericht); der Push ist darin ausdrücklich **nicht** enthalten. Protokoll `…-r7-m2-001-m7-freigabekriterien.md`, Commit `9d87eb7` |
| M2-002 | ADR verspricht harten Größenabbruch, das Gate warnt nur | **✓ erledigt** (2026-10-07): datierter Nachtrag in ADR 0003 (Warnung vs. harter Fehler); zwei Gegenproben. **Prüfmittel-Lücke dabei gefunden und behoben:** die qpdf-Laufzeitsignatur fehlte, ein statischer Engine-Import blieb unentdeckt. Protokoll `…-r7-m2-002-groessenpolitik.md`, Code `e72c403` |
| M2-003 | Rechner-ADR enthält zwei überholte Budgets | **✓ erledigt** (2026-10-07): Nachtrag in ADR 0005 (250→200 KiB, 95→110 KiB, Herkunft der 89,5/100,6/103.801 B getrennt); Baseline selbsterklärend; **harte Regel** „mathjs nicht im Start" ergänzt. Protokoll `…-r7-m2-003-rechner-budgets.md`, Code `607c2d7` |
| M2-004 | QPDF-ADR beschränkt die Engine fälschlich auf M5 | **✓ erledigt** (2026-10-07): Anwendungsbereich in ADR 0002 auf Sicherheit **und** Reparatur erweitert, Aufrufer und Ladegrenze belegt; Browser zeigt in beiden Pfaden dieselbe `qpdf-*.wasm`. Protokoll `…-r7-m2-004-qpdf-anwendungsbereich.md`, Commit `f0b6f7a` |
| M2-005 | Entscheidungsindex verschweigt ADR 0006 | **✓ erledigt** (2026-10-07): Doppelnummer 0006 aufgelöst (M9-Entscheidung → **0013**, Weiterverweisakte am alten Pfad), Index vollständig; neuer Doku-Gate `npm run adr:check`. Protokoll `…-r7-m2-005-adr-index-und-gate.md`, Code `00fa7e8` |
| M11-001 | Architekturbeschreibung führt vorhandene Grenzen als vertagt | **✓ erledigt** (2026-10-07): `docs/architecture.md` mit datiertem Iststand (Codeanker, Verantwortung, Restarbeit je Grenze); K30/K31 geschlossen; Cachenamen gegen Buildkonfiguration und `sw.js` gemessen. Protokoll `…-r7-m11-001-architektur-iststand.md`, Commit `26591fd` |

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
   *(Zusatz 2026-10-07: Abstand **73 Commits** — gemessen mit `git rev-list --count origin/main..HEAD`,
   nicht aus einem Text abgelesen. Beim Nachführen vor jedem Bericht neu messen.)*

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


*Nachtrag 2026-10-07 (Aktenpflege, Faber).* Kopf ist **`3ca76bf`** („Uebergabe-README: Zahl der
lueckenhaften Alt-Uebergaben berichtigt (elf)"), davor `895a30a` („Uebergabe R5 (sechs Karten) und
Befund zu zehn lueckenhaften Alt-Uebergaben"). `main` stand **73 Commits vor `origin/main`**
(gemessen am 2026-10-07 **vor** der Aktenpflege) — **nichts gepusht**; ein Push veröffentlicht
commietools.org. Die Zahl ist bewusst eine Messung mit Zeitpunkt, keine Dauerangabe: jeder
Akten-Commit erhöht sie, deshalb vor jedem Bericht neu messen statt abschreiben. Außerhalb der Commits
trägt der Arbeitsbaum die beiden revisionsgebundenen Registry-Dateien (bewusst uncommittet), zwei
Testdateien aus dem M4-005-Nachweis (`test-assets/m4-005-langsam-A.pdf`, `…-schnell-B.pdf`) und die
fremde Konzeptdatei `03-konzepte/2026-10-06-tooltip-und-kontexthilfe.md` (nicht angefasst).

In dieser Aktenpflege berichtigt: die ausgezählte Summe in Abschnitt 4 (28/1/30 → **34/1/24**, mit
Grund), die R5-Überschrift (7 von 9) und der Push-Abstand in Abschnitt 6 Punkt 8. Die Kartenstände
der Tabelle selbst waren bereits nachgeführt und blieben unverändert.

*Nachtrag 2026-10-07 (R6 und R7, Faber).* Kopf nach dem R7-Codestand ist **`26591fd`**; die
Akten-Commits dieses Nachzugs folgen darauf. `main` stand zu diesem Zeitpunkt **114 Commits vor
`origin/main`** — **gemessen** mit `git rev-list --count origin/main..HEAD`, nicht aus einem Text
abgelesen. **Nichts gepusht**; ein Push veröffentlicht commietools.org.

In diesem Durchzug zusätzlich eingerichtet: der Doku-Gate `npm run adr:check` (Teil von `check`).
**Zwei Prüflücken wurden dabei gefunden und behoben** (das ADR-Gate war zu weich, der Bundle-Prüfer
blind für die qpdf-Brücke). **Nicht** behoben und ausdrücklich benannt: die Leitdatei selbst wird von
keinem Prüfer bewacht — die R6-Zeilen standen fünf Karten lang falsch, ohne dass etwas anschlug.

Außerhalb der Commits trägt der Arbeitsbaum die beiden revisionsgebundenen Registry-Dateien
(`licenses/registry.json`, `apps/web/public/licenses/registry.json`), die zwei Testdateien aus dem
M4-005-Nachweis und die Belege unter `work/` (durch die Projekt-.gitignore nicht versioniert).

## 8. Pflege dieser Datei

Aktualisiert wird **nur Spalte „Stand"** in Abschnitt 4 und die Abschnitte 6 und 7 — jeweils mit
Datum. Der Wortlaut von Auftrag, Reihenfolge und Arbeitsweise bleibt stehen; Änderungen daran
bekommen einen datierten Zusatz (Korrekturregel des Projekts). Bei jedem Sitzungsabschluss
mitführen, solange die Sanierung läuft.