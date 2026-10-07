# Offene Punkte

**Diese Datei ist die verbindliche Aufgabenliste des Projekts und führt nur offene Arbeit.**
Erledigtes steht wörtlich im Archiv `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`;
die historischen Nachträge der früheren Einträge bleiben dort erhalten.

**Konvention (festgelegt 2026-10-07, QM-Karte M10-001):**

- Jeder aktive Punkt trägt eine **eindeutige ID** (`OP-nnn`). IDs werden einmal vergeben und bleiben;
  neue Punkte bekommen die nächste freie Nummer — es wird nicht umnummeriert.
- **Status** ist die Checkbox: `[ ]` offen. Ein erledigter Punkt wird **nicht** hier abgehakt, sondern
  mit Beleg ins Archiv übernommen (siehe „Pflege" am Ende).
- **Beleg** ist ein Commit-Hash, ein Protokoll, ein ADR oder eine Übergabe. Eine Erfolgsmeldung ohne
  solche Stelle ist kein Beleg.
- **Restabnahme** ist das, woran die Erledigung erkennbar ist; sie steht im Eintrag, wo sie nicht
  offensichtlich ist.
- **Verantwortlich** ist Faber. Wo eine Betreiberentscheidung nötig ist, steht das ausdrücklich im
  Eintrag.

**Gegliedert nach Herkunft** (Welle, Stufe, Priorität) — die Überschrift sagt, woher der Punkt kommt,
der Eintrag sagt, was noch fehlt.

*(Umstellung 2026-10-07: erledigte Einträge ins Archiv überführt, IDs vergeben, offene Teilpunkte
erledigter Einträge als eigene Punkte erhalten. Der frühere Kopf lautete: „Diese Liste enthält
bestätigte, noch nicht abgeschlossene Arbeit." — der Satz bleibt inhaltlich gültig; neu ist, dass die
Liste ihn jetzt auch einhält.)*

## Neu aus R6 (2026-10-07)

- [ ] OP-001 — **Keine muttersprachliche Abnahme des Spanischen** *(2026-10-07)*. Die Stil- und
  Glossarentscheidungen aus R6 sind fachlich begründet, aber nicht von einer spanischsprachigen
  Person bestätigt; die Karte M3-003 verbietet, einen Regexlauf so zu bezeichnen.
- [ ] OP-002 — **`tool.pdfToImages.download` ist ungenutzt** *(2026-10-07)* — der Schlüssel lebt nur im
  Sprachvertragstest; die Ergebnisdateien heißen sprachneutral `page-N.png`.

- [ ] OP-003 — Anbieterneutralen Übersetzungsablauf mit Google Cloud Translation Advanced gemäß
  `uebergabe/03-konzepte/2026-10-03-automatisierte-sprachpakete.md` erst bei der nächsten
  geplanten Sprache umsetzen.
- [ ] OP-004 — **Veröffentlichtes spanisches Testpaket gemäß `uebergabe/03-konzepte/2026-10-03-sprachpaket-spanisch.md`
  online sprachlich und visuell gegenlesen.**
  *(2026-10-04: Das Gegenlesen ist erst **nach** der Online-Stellung möglich. Bis dahin bleibt
  `es` im Sprachschalter sichtbar und wird mitausgeliefert — abweichend von
  `02-architektur/sprachpakete.md` §2, das ein Testpaket „niemals veröffentlicht" sieht. Die
  Abweichung ist damit datiert festgehalten und nicht stillschweigend.)*
  *(Zusatz 2026-10-05: Der Rückstand wächst mit jeder Welle — acht Handwerk-Werkzeuge der Wellen A
  und B sind in Spanisch noch nicht gegengelesen. Das ist keine Regression, sondern die bekannte
  offene sprachliche Abnahme.)*
  *(Zusatz 2026-10-05, Welle C: **zehn** Handwerk-Werkzeuge sind es inzwischen; die beiden neuen
  (Pflaster, Reifen) kommen hinzu. Empfehlung: das Gegenlesen in **einem** Durchgang für die ganze
  Suite, nicht zehn Einzelläufe.)*
  *(2026-10-06: Die **zehn Handwerk-Werkzeuge** sind gegengelesen — sprachlich (elf Quelldateien,
  521 Schlüssel je Sprache, geprüft gegen den deutschen Wortlaut) und visuell (zehn Routen bei
  1360 px und 320 px, mit geöffneten Abschnitten). Zwei Befunde: eine **gemischte Anredeform**
  (20 Stellen im Projekt, darunter ein Widerspruch in derselben Datei) und eine **uneinheitlich
  wiedergegebene Konzept-Referenz**. Beide warten auf eine Entscheidung; die sprachliche Freigabe
  ist damit **nicht** erteilt, der Stand bleibt nach `02-architektur/sprachpakete.md` §11 „Lokales
  Testpaket". Bericht: `06-protokolle/2026-10-06-sprachabnahme-spanisch-handwerk.md`. Die übrigen
  **44** Werkzeuge des Registers stehen weiter aus.)*
  *(2026-10-06, Entscheidung und Umsetzung: **unpersönlicher Infinitiv.** Die vollständige
  Bestandsaufnahme fand **45** Schlüssel mit Anredeform im ganzen Projekt (nicht 20, wie der erste
  Suchlauf vermutete). **31** sind umgestellt — „Elige el archivo" → „Seleccionar archivo",
  „Introduce un valor." → „Introducir un valor.", „Rellene todos los campos." → „Rellenar todos los
  campos." —, **14** sind geprüft und unverändert gelassen, weil dritte Person oder Substantiv
  („Cambia" = ändert, „Firma" = Unterschrift, „Descarga iniciada"). Zwei Bedeutungskorrekturen
  gingen damit einher: „una cadena" → „una cadena **de medidas**" (Maßkette war unscharf übersetzt)
  und das doppelte „los PNG guardados". Bericht: `06-protokolle/2026-10-06-entscheidungen-umgesetzt.md`.)*

- [ ] OP-005 — **Schreibweisen in den spanischen PDF-Texten vereinheitlichen:** derselbe Text meint „Maus"
  und „Stift" zweimal verschieden — „mouse" (2 Dateien: `pdf/m4`, `pdf/placement`) gegen „ratón"
  (1: `pdf/m9`), „bolígrafo" (1: `pdf/m4`) gegen „lápiz" (2). Gemessen 2026-10-06 im Zuge der
  Anrede-Umstellung; bewusst nicht mitgeändert, weil die Anrede die eine Entscheidung war.

- [ ] OP-006 — **Bedienziele unter 44 px außerhalb der Suiten nachziehen:** Schieberegler
  (`input[type=range]`, 16 px hoch) und Kontrollkästchen (18 × 18 px) in acht Bild- und
  PDF-Werkzeugen, Tastenfelder im Programmiererrechner 25–34 px breit. Gemessen 2026-10-06 über
  alle 54 Routen.

- [ ] OP-007 — **Abgeschnittener Inhalt im Programmiererrechner:** vier Tasten `button.keypad-key.operator`
  sind 42 px breit bei 50–53 px Inhalt; über die Tastatur beschriftet, aber der Text wird
  beschnitten. Gemessen 2026-10-06.

Diese Liste enthält bestätigte, noch nicht abgeschlossene Arbeit. Details gehören in verlinkte Konzepte oder Issues, sobald solche vorhanden sind.

## Hohe Priorität

- [ ] OP-008 — Nach erfolgreicher Domainumschaltung einen sichtbaren Source-Link auf `https://github.com/madventureXD/commietools` in die Weboberfläche integrieren.
- [ ] OP-009 — Mailbetrieb nach DNS-Umschaltung prüfen: MX, `autoconfig`, vier SRV-Einträge und SPF; `autoconfig` muss in Cloudflare auf „DNS only“ bleiben.
- [ ] OP-010 — Den PDF-Testkorpus um frei weitergebbare verschlüsselte, XFA-, Annotations- und Signatur-Beispiele sowie Reader-Interoperabilität erweitern.

## Mittlere Priorität

- [ ] OP-011 — **Abweichung bei der Rechenkern-Größe klären:** ADR 0005 nennt 89,5 KiB gzip, die Nachmessung
  derselben Factory-Liste ergibt 100,6 KiB (esbuild, gzip -9, mathjs 15.2.0, 2026-10-04). Ziel,
  Liste und Werkzeugliste als Ursache ausgeschlossen; die Zahl wird im Projekt zitiert und sollte
  stimmen. Messskript: `work/rechner-mathjs-messung.mjs`.
- [ ] OP-012 — **Vier Rechner: 200 % Zoom und Screenreader-Namen** prüfen (beim Beleglauf am 2026-10-04
  bewusst ausgelassen, dort wurden zwei Fensterbreiten und die Rückleseprüfung gefahren).
- [ ] OP-013 — **Startgröße im Blick behalten:** drei neue Katalogeinträge je Sprache kosten 9,3 kB gzip im
  Startbündel (146.220 von 204.800). Bei den nächsten Werkzeugwellen neu messen; Ausweg bleibt die
  abgerufene Registerdatei.
- [ ] OP-014 — Entschieden, aber noch nicht gebaut: der **alte Verlaufsbereich `calculator.*`** liegt im
  Gerät, hat aber keine Anzeige und keinen Löschweg. Entweder eine sichtbare Aufräummöglichkeit
  anbieten oder den Punkt schließen.
- [ ] OP-015 — Für Mehrfachausgaben nach gesonderter Größen- und Lizenzprüfung **Alle speichern …** per
  Ordnerauswahl und/oder ZIP-Fallback ergänzen; Einzel-Speichern mit frei wählbarem Namen und Ort
  ist bereits einheitlich umgesetzt.
- [ ] OP-016 — Schritt 3 der Katalogsuche: gezogene Datei gegen die deklarierten Dateitypen prüfen und passende Werkzeuge vorschlagen, mit Unterscheidung zwischen „liest" und „schreibt".
- [ ] OP-017 — Weitere Suchbegriffe ergänzen, wenn im Gebrauch Lücken auffallen (Register und Prüfung melden Dopplungen; zwei Tests finden tote Begriffe).
- [ ] OP-018 — **Elf ältere Übergaben verfehlen die Pflichtabschnitte der Vorlage** (gemeldet am 2026-10-04
  aus der Welle-5-Übergabe; die Prüfung deckte zugleich Lücken in den Wellen 2 und 4 auf). Nicht
  angefasst — eigener Auftrag: fehlende Abschnitte **ergänzen, nie überschreiben**, mit datiertem
  Hinweis.
  *Zusatz 2026-10-04 (Rechner-Aufteilung): Die Prüfung der Rechner-Übergaben fand zwei weitere
  Fälle — `05-uebergaben/2026-10-04-rechner-tastenfeld-umgesetzt.md` (sechs Pflichtabschnitte
  fehlen als Überschrift) und `05-uebergaben/2026-10-04-sammelrelease-sprachen-pdf-rechner.md`
  (drei). **Wichtig zur Einordnung:** der Inhalt ist vorhanden, er steht nur unter anderen
  Überschriften („Was jetzt da ist" statt „Ergebnis", „Ziel" statt „Ziel der Sitzung", „Betroffene
  Bereiche" statt „Geänderte Bereiche" …). Es sind also **keine leeren** Übergaben — die Prüfung
  ist eine Überschriftenprüfung, und wer die Akte gewohnt ist, findet die Angaben nicht dort, wo
  sie stehen müssen.*
  *(Zusatz 2026-10-07, QM-Karte M10-002: **Die Lücken sind jetzt einzeln messbar.** `npm run akte:check`
  prüft jede Übergabe gegen die Spezifikation; der Lauf vom 2026-10-07 meldet **30 von 49 Übergaben mit
  einer Lücke, zusammen 132 Hinweise** (5 Übergaben ab dem 2026-10-07 sind streng geprüft und
  fehlerfrei). Häufigste Lücken: Kopffeld `Auftrag` (29 ×), `Bearbeitet durch` (13 ×), Abschnitt
  `Entscheidungen und Annahmen` (11 ×), keine Revision (10 ×), `Offene Punkte` (9 ×),
  `Geänderte Bereiche` (9 ×), `Ziel der Sitzung` (8 ×), `Git` (8 ×), `Status` (6 ×), `Datum` (5 ×),
  `Prüfungen` (4 ×), kein Prüfnachweis (4 ×). Damit ist der Umfang dieser Aufgabe zum ersten Mal
  vollständig aufgezählt statt geschätzt. Zusammen mit **OP-034** zu erledigen; Vorgehen: datierter
  Ergänzungsblock je Datei, **nie** überschreiben — genau so ist am 2026-10-07
  `05-uebergaben/2026-10-07-r6-abgeschlossen.md` behandelt worden.)*
- [ ] OP-019 — **96 Lint-Warnungen abarbeiten** (angefangen bei `no-misused-promises`, 60 Treffer).
- [ ] OP-020 — **CI-Workflow in Betrieb nehmen** (Karte M1-003): `.github/workflows/quality.yml` liegt
  versioniert, ist aber **nie gelaufen** (es wird nicht gepusht). Offen: Actions auf Commit-SHAs
  pinnen, Browserjob plattformunabhängig machen, Branchschutz und erforderliche Checks im Konto
  einrichten und mit Datum protokollieren.
- [ ] OP-021 — **Signaturkorpus in den normalen Testschutz übernehmen** (Karte M5-003): gültig, verändert,
  inkrementell ergänzt und „unsupported" je Datei mit Herkunft, Hash und Validatorversion.
- [ ] OP-022 — Offline-Verhalten mit einem automatisierten Browser-Test absichern.
  *(2026-10-06, **M8-002 gemessen: die Offline-Bereitschaft des ersten Besuchs ist nicht gegeben.**
  Frisches Profil, App geladen, Service Worker aktiv, HTTP-Cache gelöscht, **Vorschaudienst beendet**
  (Erreichbarkeit 0 geprüft), dann Reload: der Service Worker liefert 7 von 7 Antworten aus dem Cache,
  **eine** Datei scheitert — `/assets/ui-en-*.js` (`net::ERR_FAILED`) — und die Seite bleibt **leer**.
  Ursache im CacheStorage nachgewiesen: **acht** beim Öffnen nachgeladene Pakete (Sprach-, Such- und
  Werkzeugtexte) liegen **nicht** im CacheStorage, sondern nur im flüchtigen HTTP-Cache. Damit ist der
  Kartenbefund bestätigt und präzisiert; die Umsetzung nach der Karte (Sicherung dieser Pakete,
  gezieltes Nachladen nach SW-Kontrolle) steht aus. Teilfälle **nicht** geprüft: Warmbesuch,
  Localewechsel, fehlendes Einzelpaket, SW-Versionswechsel. Protokoll:
  `06-protokolle/2026-10-06-m8-002-offline-erster-besuch.md`.)
  *(2026-10-06, **umgesetzt und erfüllt:** Warmlauf der Sprachpakete nach Service-Worker-Kontrolle
  (`apps/web/src/pwaWarmCache.ts`, 5 neue Tests) **und** `ignoreVary: true` in der Laufzeitregel —
  ohne den zweiten Eingriff blieb der Modul-Import trotz Cache-Treffer bei `net::ERR_FAILED`. Beleg
  im frischen Profil mit beendetem Dienst: Reload lädt vollständig, **23 von 23 Antworten aus dem
  Service Worker, 0 gescheitert**, keine dritte Sprache. Offen bleiben die Teilfälle **Warmbesuch,
  Localewechsel und SW-Versionswechsel** (nicht geprüft) sowie die nie geöffnete Route, die offline
  nichts zeigt — das ist der UI-Teil von M4-004.)*
- [ ] OP-023 — Content Security Policy und spätere Deployment-Header konkretisieren.
- [ ] OP-024 — Größenbudgets zusätzlich pro große Tool-Engine festlegen; das Startbudget und die Sperre gegen PDF-Engines sind umgesetzt.
- [ ] OP-025 — Bedienung per Tastatur automatisiert prüfen (seit Welle 5 offen; in Welle 6 erneut nur
  teilweise — native Formularelemente mit Beschriftungen, kein durchgespielter Tastaturlauf).
  *(2026-10-04: Der durchgespielte Lauf ist erst **nach** der Online-Stellung möglich; bis dahin
  wird die Suite ohne ihn ausgeliefert. Die Roadmap nennt die Barrierefreiheit ausdrücklich als
  Voraussetzung der Phase „Rechnen" — der Punkt bleibt deshalb hier stehen, bis er belegt ist.)*
- [ ] OP-026 — **PDF-Ausgabe ist auf WinAnsi beschränkt.** Zeichen außerhalb (kyrillisch, griechisch,
  chinesisch) werden transliteriert oder zu `?`. Für Deutsch, Englisch und Spanisch reicht das;
  eine Sprache mit anderer Schrift braucht eine eingebettete Schrift.
- [ ] OP-027 — Verhalten von Aufmaß bei sehr vielen Zeilen (mehrere hundert) und an Speichergrenzen messen.

## Später / bei konkretem Bedarf

- [ ] OP-028 — Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs des Registers messen; Ausweg ist eine abgerufene Registerdatei mit Ladezustand.
- [ ] OP-029 — Desktop- und Mobile-Shells evaluieren. *(2026-10-04: Das Auskoppeln ist der erste Teil davon;
  der Punkt bleibt für die übrige Shell-Frage stehen.)*
- [ ] OP-030 — Erweiterungsmodell für externe Tools oder Plugins bewerten.

## R1 — Sanierungsleitfaden des QM-Audits (ab 2026-10-06)

- [ ] OP-031 — **Vier Lizenzfragen zur Entscheidung** (stehen mit Grund und Datum in `licenses/rust-review.json`):
  `zlib-rs` (Lizenz „Zlib" nicht in der Richtlinie), `unicode-ident` („Unicode-3.0" fehlt),
  `pdf_signer` 0.3.2 (GPL-3.0-or-later, bereits ausgeliefert — bewusst so lassen?), und ob die
  Originaltexte der fünf Pakete ohne Hinweisdatei aus den Repositories nachgetragen werden sollen.
  *(2026-10-06, Zusatz aus M9-004: es sind **sechs** Pakete ohne Hinweisdatei — `alloc-stdlib 0.2.4`
  (BSD-3-Clause) kam mit lopdf ≥0.42 neu in den Graphen und steht ebenfalls in `rust-review.json`.
  Damit sind es **fünf** Lizenzfragen.)*
- [ ] OP-032 — **Fünf Advisory-Treffer außerhalb von lopdf bewerten** (gefunden am 2026-10-06 beim
  Advisoryscan zu M9-004 über 302 Pakete beider Rust-Locks, `work/m9004-advisoryscan-beleg.txt`):
  `crossbeam-epoch 0.9.18` (RUSTSEC-2026-0204, ungültige Zeigerdereferenzierung in `fmt::Pointer`),
  `rsa 0.9.10` (RUSTSEC-2023-0071, Marvin-Attack — **keine Fix-Version verfügbar**, nur Mitigation),
  `rustls 0.23.40` (RUSTSEC-2026-0285 / GHSA-2mjx-qc3c-rqvc; nur mit dem optionalen
  `https`-Feature im Graph) und `ttf-parser 0.25.1` (RUSTSEC-2026-0192, **unmaintained** —
  Wartungswarnung, kein Loch). Nicht Teil der Karte M9-004; Bewertung und Entscheidung stehen aus.
- [ ] OP-033 — **Aufräumregel für den ausgelieferten Hinweisordner:** `apps/web/public/licenses/notices/rust`
  sammelt Hinweise nicht mehr enthaltener Komponenten an — gefunden am 2026-10-06 mit **21 Leichen**
  (u. a. `lopdf-0.36.0`, `lopdf-0.45.0`, `sha2-0.11.0`), während `licenses/notices/rust` korrekt
  aufgeräumt war. `licenses:check` prüft diesen Pfad nicht. Zustand bereinigt; die Regel im
  Generator und eine Prüfung fehlen weiterhin.
- [ ] OP-034 — **13 ältere Übergaben ergänzen:** In `uebergabe/05-uebergaben/` fehlen bei 13 Dateien
  Pflichtabschnitte der Vorlage (betroffen: 2026-10-03-cloudflare-pages, -datensparsame-ladegrenzen,
  -faber-cloudflare-dns, -pdf-m0-m1, -pdf-m2, -pdf-m3, -pdf-m4, -pdf-m5, -pdf-m6,
  2026-10-04-rechner-tastenfeld-umgesetzt, -sammelrelease-sprachen-pdf-rechner). Fehlende
  Abschnitte **ergänzen, nie überschreiben**, mit datiertem Nachtragshinweis.
- [ ] OP-035 — **Entscheidung offen:** Soll die Signatur-Engine einen automatischen Test bekommen? Die
  Abnahme ist belegt (vier Fälle plus Sichtkontrolle), aber in der Testsuite nicht verankert.

## R2 — Ergebnisrichtigkeit und Exportgrenzen (ab 2026-10-06)

- [ ] OP-036 — **Lizenzregister bindet die Quellrevision an `git rev-parse HEAD` — Entscheidung nötig.**
  `scripts/license-audit.mjs` schreibt in `licenses/registry.json` die Revision von HEAD und
  vergleicht beim Prüfen den **Dateiinhalt** mit einem frisch erzeugten Stand. Ein **committetes**
  Register enthält damit zwangsläufig die Revision seines Vorgänger-Commits, und `licenses:check`
  ist **nach jedem Commit rot** — auch in einem frischen Checkout von HEAD. Grün ist nur der
  Arbeitsbaum nach einem `licenses:generate`-Lauf. Gemessen am 2026-10-06 (M3-002). Betrifft jede
  künftige Prüfung und die Regel „geprüft wird der Stand, der veröffentlicht wird"; deshalb
  **nicht eigenmächtig** geändert (Regeländerung an der Prüfkette). Regel wäre etwa: die Revision
  nicht im Register führen, sie beim Anzeigen aus dem Build setzen, oder einen Vorfahren als
  gültig akzeptieren.
- [ ] OP-037 — **Verlauf und ANS mit echten kleinen Werten prüfen:** sie hängen an `raw`; `1e-14` steht dort
  jetzt als `1e-14` statt `0`. Gewollte Folge, aber die Oberfläche ist darauf nicht geprüft.

- [ ] OP-038 — **Restarbeit aus einem erledigten Eintrag — M4-003** *(erledigter Teil vollständig im Archiv: `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`)*
  - [ ] Offen aus M4-003: der von der Karte **optional** genannte `compile()`-Weg für viele
    Stützstellen ist nicht umgesetzt — derzeit wertet jeder Punkt über `evaluate` aus. Erst messen,
    dann entscheiden.
  - [ ] Fund am Rande, gehört zu **M3-010** (R6, nicht begonnen): die Wertetabelle des Plotters
    zeigt Punkt-Dezimalzahlen (`0.3678794412`) in der deutschen Oberfläche; der Rechner zeigt Komma.

- [ ] OP-039 — **Restarbeit aus einem erledigten Eintrag — M6-001** *(erledigter Teil vollständig im Archiv: `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`)*
  - [ ] Offen aus M6-001: Der Browserbeleg (`work/json-beleg.cjs`) liegt außerhalb der
    Versionierung — bekannter Punkt M10-004.
  - [ ] ADR-Index: **0012** nachgetragen; der Index selbst ist vollständig (ADR 0011 stand bereits
    dort — ein eigener Fehlschluss aus abgeschnittenem Lesen, im Protokoll benannt).

- [ ] OP-040 — **Restarbeit aus einem erledigten Eintrag — M6-002** *(erledigter Teil vollständig im Archiv: `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`)*
  - [ ] Offen aus M6-002: Die `2nd`-Belegung des RPN-Feldes ist ungeprüft (das Feld hat nur eine
    Ebene); der Browserbeleg liegt unter `work/` außerhalb der Versionierung (M10-004).

- [ ] OP-041 — **Restarbeit aus einem erledigten Eintrag — M8-004** *(erledigter Teil vollständig im Archiv: `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`)*
  - [ ] **Abnahmekriterium der Karte nicht erfüllt:** „Excel/LibreOffice: Direktöffnung, Import und
    erneutes Speichern" — auf diesem Rechner ist **kein Tabellenprogramm installiert** (geprüft).
    Ersatzweise liest ein **unabhängiger** CSV-Leser (Pythons `csv`) den Korpus: alle 11 Zeilen
    bestanden, keine Zelle beginnt danach mit einem Formelzeichen. Das ersetzt die Probe nicht.

## R3 — Datei-Aufträge, Ressourcen, Offline (ab 2026-10-06)

- [ ] OP-042 — **Restarbeit aus einem erledigten Eintrag — M4-006** *(erledigter Teil vollständig im Archiv: `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`)*
  - [ ] **Offen (keine Abnahmebedingung):** der gemeinsame `useObjectUrls`-Hook bzw. die Erweiterung
    von `useDownload` — der Teiler räumt an drei Stellen selbst auf.
- [ ] OP-043 — **Restarbeit aus einem erledigten Eintrag — M4-005** *(erledigter Teil vollständig im Archiv: `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`)*
  - [ ] **Nicht erfüllt:** der Abnahmefall „A zuletzt fertig" ließ sich **nicht herstellen** — der
    Teiler ist schneller als jede Bedienhandlung (1200 Seiten → 1200 Dokumente in rund 0,6 s,
    Zeitmarken im Protokoll). Künstliche Verlängerungen wurden als Prüfmittel-Eingriffe verworfen.
  - [ ] Muster auf weitere asynchrone Dateiwerkzeuge übertragen (von der Karte verlangt) — Fund am
    Quelltext, kein Messergebnis; siehe den Punkt „Neu, nicht gemessen (2026-10-07)" unten.
- [ ] OP-044 — **Kein Retry im selben Dokument möglich** *(2026-10-07, gemessen)*. Ein gescheiterter
  dynamischer Modulimport lässt sich im laufenden Dokument nicht wiederholen: Der Browser merkt
  sich die Adresse, jeder weitere Versuch scheitert ohne neue Netzanfrage (Minimalversuch:
  3 Versuche, 1 Anfrage). Deshalb bietet die Oberfläche das kontrollierte Neuladen an. Nächster
  Schritt, falls gewünscht: ein **benannter**, begrenzter Adresszusatz beim Import (kein beliebiges
  Zeitstempel-Anhängen) — verlangt eine eigene Adresskarte der erzeugten Chunks und ist mit der
  Karte M4-004 abzustimmen.
- [ ] OP-045 — **Neu, nicht gemessen (2026-10-07): dasselbe Adressmuster in weiteren Werkzeugen.** Eine
  Ergebnisadresse entsteht **nach** einem `await`, ohne Aufräumen beim Aushängen — beim PDF-Teiler
  war das ein Leck von **1200 Adressen** (behoben). Dieselbe Stelle steht in
  `PdfToImages.tsx:36`, `ImageMetadata.tsx:125`, `ImageResize.tsx:140`, `ImageWatermark.tsx:197`,
  `IconGenerator.tsx:160/170` und in den Adressgebern von `PdfInteractiveTools.tsx`,
  `PdfSecurityTools.tsx`, `PdfPlacementTools.tsx`. **Nicht geprüft, nicht behoben** — die Angabe
  ist ein Fund am Quelltext, kein Messergebnis. Nächster Schritt: für **ein** Werkzeug denselben
  Zählerbeleg fahren; erst wenn er das Leck zeigt, ist es eine Fehlerklasse und keine Vermutung.
- [ ] OP-046 — **Der Browserjob im CI ist nie gelaufen** *(2026-10-07)*. `.github/workflows/quality.yml`
  hat jetzt einen Job `browser` auf `windows-latest` (Bau, Vorschaudienst, `a11y:check` in beiden
  Schemata, `viewport:check`) — aber es wird nicht gepusht, also hat GitHub ihn nie ausgeführt.
  Nächster Schritt: nach einem gewollten Push den ersten echten Lauf ansehen; bis dahin ist die
  YAML ein Pflichtrahmen, kein Beleg.
- [ ] OP-047 — **Handarbeitspunkte des Barrierefreiheits-Prüfers bleiben offen:** Vorleserausgabe,
  Tastaturdurchlauf, 400 % Zoom, Fokusreihenfolge, reduzierte Bewegung. Der Prüfer gibt sie am
  Ende jedes Laufs selbst aus. Nächster Schritt: bei Gelegenheit ein Vorleserdurchlauf (NVDA oder
  Narrator) auf einer Werkzeugroute, dokumentiert.

## R5 — Barrierefreiheit und Designsystem (ab 2026-10-07)

- [ ] OP-048 — **Offen aus M7-003: Zoom nur bei 100 % gemessen** *(2026-10-07)*. Die Skalierung ist im
  Zeigerweg belegt, eine abweichende Zoomstufe wurde nicht geprüft.
- [ ] OP-049 — **Offen aus M7-004: kein Vorleserlauf gemessen** *(2026-10-07)*. Belegt sind Accessibility-Baum,
  Fokusverhalten und sichtbare Beschriftung; eine echte Vorleseransage (NVDA/Narrator) fehlt in
  dieser Umgebung und bleibt Handarbeit.
- [ ] OP-050 — **Offen aus M7-004: Lesereihenfolge ist flach** *(2026-10-07)*. Der Text folgt dem Inhaltsstrom
  der Datei (mehrspaltig gemessen: spaltenweise). Ein Umbruch-/Spaltenmodell gibt es nicht; der
  Hinweis steht sichtbar im Werkzeug.
- [ ] OP-051 — **M2-006 — echter Vorleserlauf nicht herstellbar** *(2026-10-07)*: belegt sind
  Accessibility-Baum (drei Sprachen) und Tastaturbedienung; die gesprochene Ansage bleibt Handarbeit
  und ist **nicht** als erfüllt verbucht. Nächster Schritt: ein Vorleserdurchlauf (NVDA oder
  Narrator) auf einer Werkzeugroute, dokumentiert.
- [ ] OP-052 — **`/licenses` bricht im Projektprüfer ab** *(2026-10-07, neu)*: `a11y:check`/`viewport:check`
  melden „Route ohne Inhalt" — 785 Paketzeilen, für den Prüfer zu lang. Nicht durch die
  R5-Änderungen verursacht, Ursache ungeklärt. Nächster Schritt: Prüfer für lange Routen messen
  oder die Route aufteilen.
- [ ] OP-053 — **`a11y:check` nicht über alle Routen gefahren** *(2026-10-07)*: belegt sind 62 Routen ×
  2 Breiten in beiden Schemata; der Gesamtlauf über alle Routen lief in dieser Sitzung **nicht**
  (Laufzeit über dem Zeitfenster; im Vordergrund nötig, im Hintergrund „stdin is not a tty").
  Nächster Schritt: vollständiger Lauf im Vordergrund mit großzügigem Zeitfenster.
- [ ] OP-054 — **Kein reales Mobilgerät, kein echter Browserzoom** *(2026-10-07)*: die schmalen Layouts sind
  über die CSS-Breite (320/390/640/683 px ≙ 200 % Zoom) gemessen, nicht auf einem Gerät; das
  Auskoppeln bei 320 px ist nicht als eigenes Fenster geprüft.

## R7 — Wahrheitsgemäße Produkt- und Architekturakten (abgeschlossen 2026-10-07)

- [ ] OP-055 — **Auflage A2 — unabhängige Sicherheitsreview: nicht gestrichen, verlegt** *(Entscheidung Thomas,
  2026-10-07)*. Sie erfolgt **am Ende der ganzen Sanierung** und kontrolliert dort alles noch einmal
  (nach R8–R10). **Sie ist die Bedingung für den Push** (siehe nächster Punkt).
- [ ] OP-056 — **Push erst nach der unabhängigen Kontrolle** *(Entscheidung Thomas, 2026-10-07, wörtlich:
  „Push wird erst nach der unabhängigen Kontrolle erfolgen")*. Damit sind **A1, A3 und A4 erledigte
  Nachweise, keine Push-Vorbedingung**; die frühere Kopplung „Push erst nach A1–A4" ist überholt.
  `main` bleibt bis dahin **unveröffentlicht** (Cloudflare Pages veröffentlicht bei Push).
- [ ] OP-057 — **Kein Prüfer bewacht die Leitdatei** `00-einstieg/vorgehen-qm-audit.md` *(2026-10-07, gemessen)*.
  Nach dem R6-Durchzug standen dort **fünf** Karten (M3-003, M3-004, M3-006, M3-008, M3-010) noch auf
  „○", obwohl sie erledigt waren — kein Lauf hat das gemeldet. Nachgetragen; ein Abgleich
  Karte ↔ Protokoll ↔ Commit wäre als Prüfer denkbar (Kartengrenze von M2-005 war der ADR-Index).
- [ ] OP-058 — **Kein Prüfer bewacht `docs/`** *(2026-10-07)*. Die Tafel „Actual state 2026-10-07" in
  `docs/architecture.md` ist eine **Messung**, keine Zusicherung: ein umbenannter Cache oder ein
  entfernter Codeanker fiele niemandem automatisch auf. Die Empfindlichkeit der Messung wurde
  geprüft (Cachename geändert ⇒ `sw.js` folgt), aber es gibt keine Kopplung.
- [ ] OP-059 — **Die Größenreferenz ist weiterhin der Stand eines früheren Baus** *(2026-10-07)*. Der
  Baubricht meldet deshalb durchweg große positive Abweichungen (Eingang 150.082 B gegen 146.417 B).
  Eine bewusste Neusetzung der Referenz ist eine eigene Entscheidung — sie darf **nicht** nebenbei
  geschehen, sonst verschwinden Warnungen still.
- [ ] OP-060 — **Prüfer erkennen nur gepflegte Signaturen** *(2026-10-07)*. Zwei Lücken wurden in diesem
  Durchzug geschlossen (qpdf-Laufzeitsignatur, harte mathjs-Regel); eine künftige Engine-Brücke ohne
  passende Signatur oder Dateiname kann dem Bundle-Prüfer weiter entgehen. Die Sperrliste braucht bei
  jeder neuen Engine-Klasse einen Eintrag.
- [ ] OP-061 — **Verweise auf Protokolle stehen als Code-Spans** *(2026-10-07)*. `npm run adr:check` prüft nur
  Markdown-Links `](…)`; ein Verweis in Backticks wird nicht auf Existenz geprüft. Bewusst so
  gelassen (Projektstil), aber bekannt.

## Pflege

- **Erledigte Punkte werden hier nicht abgehakt, sondern übernommen:** Eintrag wörtlich nach
  `06-protokolle/2026-10-07-erledigte-punkte-archiv.md` (mit Beleg: Commit, Protokoll, ADR oder
  Übergabe) und hier entfernen. Die ID wird **nicht** wiederverwendet.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen und
  die nächste freie `OP`-Nummer vergeben.
- Bleibt von einem Eintrag nur ein Teil offen, bleibt der offene Teil stehen — mit Verweis auf die
  Archivstelle, die den erledigten Teil trägt.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

*(Fassung 2026-10-07. Die frühere Regel lautete: „Erledigte Punkte mit Verweis auf Commit oder ADR in
ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen." — sie bleibt gültig und ist hier
nur um die Archivstelle, die ID-Regel und den Teilerledigt-Fall ergänzt.)*


