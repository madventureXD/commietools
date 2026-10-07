# R8 / M10-002 — Verbindliche Übergabevorlage und tatsächliche Aktenstruktur driften auseinander

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug der QM-Stufe R8
**Auftrag:** Karte **M10-002** aus `QM/70-reparaturempfehlungen/R8.md`. Übergeordnet: Thomas,
„Auftrag: CommieTools — QM-Sanierung, Stufe R8 durchziehen", **kein Push**.
**Status:** abgeschlossen

---

## 1. Die Karte im Wortlaut (Auszüge)

> **Dauerhafte Lösung:** Eine verbindliche kleine Übergabespezifikation festlegen: Basisrevision,
> Umfang/Nichtumfang, Änderungen, tatsächlich ausgeführte Prüfungen samt Exit/Belegen, offene Risiken,
> Folgeschritte. Vorlagen und Arbeitsregel im gleichen Auftrag angleichen. Prüfer akzeptiert definierte
> Überschriftenvarianten und semantische Felder; unterscheidet fehlenden Inhalt von abweichender
> Überschrift. Neue Akten strikt prüfen, historische über datierten Ergänzungsblock migrieren.
> **Abnahme:** Beispiel mit gleichwertiger anderer Überschrift besteht; fehlender Prüfnachweis/Revision
> scheitert. Pflichtfelder mit Platzhaltertext bestehen nicht. Manueller fachlicher Review bleibt erforderlich.
> **Nicht tun / Abgrenzung:** Nicht alle alten Dokumente neu schreiben oder alle 40 auf identischen
> Wortlaut zwingen; damalige Inventarzahlen sind historische Messungen.

## 2. Bestandsaufnahme gegen den Live-Stand (gemessen, 2026-10-07)

49 Übergaben in `05-uebergaben/` gegen die Vorlage geprüft (Skript + Prüfer):

| Befund | Anzahl (Prüfer `npm run akte:check`, 2026-10-07) |
|---|---|
| Übergaben mit mindestens einer Lücke | **30 von 49** (Hinweise: 132) |
| Kopffeld `Auftrag` fehlt | **29** |
| Kopffeld `Bearbeitet durch` fehlt | 13 · `Status` 6 · `Datum` 5 |
| Abschnitt `Entscheidungen und Annahmen` fehlt | 11 · keine Revision 10 · `Offene Punkte` 9 · `Geänderte Bereiche` 9 · `Ziel der Sitzung` 8 · `Git` 8 · `Prüfungen` 4 · kein Prüfnachweis 4 |

*(Gemessen mit dem Prüfer, der im selben Durchzug entstanden ist — dieselbe Zahl ist mit
`npm run akte:check` reproduzierbar. Eine frühere, gröbere Zählung mit einem Ad-hoc-Skript ergab für
`Auftrag` 30 statt 29; maßgeblich ist die reproduzierbare Zahl des Prüfers.)*

**Die Ursache ist keine Nachlässigkeit der Schreibenden, sondern ein Widerspruch in der Akte selbst:**
`00-einstieg/arbeitsregeln.md` verlangt im Kopf die vier Felder `Datum`, `Bearbeitet durch`,
**`Auftrag`**, `Status` — `vorlagen/uebergabe.md` hatte nur drei, **`Auftrag` fehlte**. Wer der Vorlage
folgte, verletzte die Regel; wer die Regel befolgte, wich von der Vorlage ab. Genau das ist die
„Drift", die die Karte beschreibt.

## 3. Eingriff (kleinster hinreichender)

1. **Vorlage angeglichen:** `vorlagen/uebergabe.md` trägt jetzt im Kopf `**Auftrag:**` (zwischen
   `Bearbeitet durch` und `Status`) und unten den Abschnitt „Pflichtabschnitte und Prüfung dieser
   Vorlage" mit der Feldliste, der Variantenregel, der Pflicht zu Prüfnachweis und Revision sowie dem
   Stichtag.
2. **Arbeitsregel angeglichen** (datierten Zusatz, alter Wortlaut bleibt): Prüfung ist maschinell,
   Feldwiderspruch benannt, Variantenregel festgehalten.
3. **Prüfer** `scripts/akte-audit.mjs`, Regelkreis `uebergabe` (in `npm run akte:check` = Teil von `check`):
   - Kopffelder `Datum`/`Bearbeitet durch`/`Auftrag`/`Status` — Pflicht, **ohne Platzhaltertext**
     (`<…>`, `YYYY-MM-DD`, „noch nicht committed");
   - acht Pflichtabschnitte mit **akzeptierten Varianten** und einer zweiten, weiteren Liste
     „verwandter" Überschriften: eine gleichwertige, aber nicht gelistete Überschrift **besteht** und
     wird als Hinweis gemeldet (fehlender Inhalt ≠ andere Überschrift);
   - **Prüfnachweis:** der Abschnitt muss eine ausgeführte Prüfung mit Exit/Beleg nennen; eine Tabellenzeile,
     die **nur** „nicht ausgeführt" sagt, ist der Platzhalter der Vorlage und scheitert — mit Begründung
     („nicht ausgeführt — kein Bau nötig") bleibt sie zulässig;
   - **Revision:** Commit-Hash **oder** ausdrücklicher Hinweis, dass nichts committet wurde;
   - **Stichtag 2026-10-07:** neuere Übergaben sind streng, ältere werden nur gemeldet (Lücken bleiben
     Aufgabe OP-018/OP-034, nicht rückwirkend umgeschrieben — „Nicht tun" der Karte).
4. **Erste historische Migration erbracht:** `05-uebergaben/2026-10-07-r6-abgeschlossen.md` fehlte das
   Kopffeld `Auftrag` — datiert nachgetragen (Wortlaut der Übergabe unverändert, der Auftrag steht
   wörtlich weiter auch im Abschnitt „Ziel der Sitzung").
5. **OP-018 datiert ergänzt:** die 44 historischen Übergaben mit ihren **132 gemessenen Hinweisen** und
   der Häufigkeit je Lücke — der Umfang dieser offenen Aufgabe ist damit gezählt statt geschätzt.

## 4. Prüfkette

| Prüfung | Ergebnis |
|---|---|
| `node --check scripts/akte-audit.mjs` | Exit 0 |
| `npm run check` | **Exit 0** — 719 Tests in 51 Dateien, 0 Lint-Fehler (109 Warnungen) |
| `npm run build` | **Exit 0** — Bundle-Audit bestanden, Eingang 150.082 B gzip |
| `npm run akte:check` | `uebergabe: 5 Uebergaben ab 2026-10-07 streng geprueft, 44 historische nur gemeldet` (132 Hinweise) |
| Selbsttest der Übergabeprüfung | **6 von 6** Fällen wie erwartet |

## 5. Belege (echte Ausführung)

**Selbsttest** (`node scripts/akte-audit.mjs uebergabe-selftest`) baut die Fälle in einem
temporären Verzeichnis und prüft die Prüfung selbst:

| Fall | erwartet | Ergebnis |
|---|---|---|
| gleichwertige andere Überschrift | besteht | besteht |
| fehlender Prüfnachweis | scheitert | scheitert |
| Prüfzeile „nicht ausgeführt" **mit** Begründung | besteht | besteht |
| fehlende Revision | scheitert | scheitert |
| Platzhaltertext im Pflichtfeld | scheitert | scheitert |
| Pflichtabschnitt fehlt | scheitert | scheitert |

**Mutationsgegenproben an den echten Akten — 5 von 5 erkannt, jede mit Wiederherstellung per Hash:**

| Mutation | Erwartete Meldung | Exit |
|---|---|---|
| `**Auftrag:**` aus `2026-10-07-r7-abgeschlossen.md` entfernt | „Kopffeld \„Auftrag\"" fehlt | 1 |
| Prüfzeile durch „nicht ausgeführt" ersetzt | „kein Pruefnachweis" | 1 |
| Revision entfernt (kein Hash, kein Hinweis) | „keine Revision" | 1 |
| Platzhaltertext im Kopffeld | „Platzhaltertext" | 1 |
| Ergebnis-Überschrift gelöscht | „Pflichtabschnitt fehlt: Ergebnis" | 1 |

## 6. Zwei Prüfmittel-Fehler, gefunden statt das Produkt verdächtigt

1. **Die ersten zwei Gegenproben schlugen nicht an** — beide Male lag es am **Prüfmittel**, nicht an
   der Akte: (a) die Mutation „Prüfnachweis durch Platzhalter ersetzt" traf nur **eine** Tabellenzeile,
   während eine zweite echte Nachweiszeile stehen blieb — die Regel „irgendwo im Abschnitt steht ein
   Beleg" war zu schwach; sie prüft jetzt zusätzlich, ob eine Zeile **nur** „nicht ausgeführt" sagt.
   (b) die Mutation „Pflichtabschnitt entfernt" benannte `## Ergebnis` in `## Ergebnisbericht` um — was
   die akzeptierte Variantenliste weiterhin traf, also **gar keine** Entfernung war. Beide Fälle sind
   als ungültige Mutationsversuche benannt, nicht als Beleg ausgegeben.
2. **Doppelte Backtick-Spans wurden nicht entfernt.** Der Verweispruefer entfernte nur einfache
   Backticks; ein Verweis in doppelten Backticks galt deshalb als Verweis auf eine fehlende Datei.
   Ursache war mein **eigenes Protokoll** zu M10-001, in dem genau diese Schreibweise vorkommt.
   Behoben: mehrfache Backtick-Folgen werden bis zum Fixpunkt entfernt (dreifach, doppelt, einfach).
   **Der Fund kam aus der eigenen Akte — der Prüfer war zu grob, nicht die Akte zu schlecht.**
   *Nachtrag dazu (2026-10-07, noch im selben Durchzug):* Der erste Gegenversuch mit einem
   künstlichen Text aus zwei Backticks bestand — die **echte** Stelle im Protokoll hatte aber vier
   Backticks in Folge und fiel weiter durch. Erst der Fixpunkt-Lauf ist grün. Die Gegenprobe war
   damit **zu schwach gebaut**; sie ist am echten Vorkommen wiederholt worden.

## 7. Abnahme der Karte, Punkt für Punkt

| Abnahmekriterium | Stand |
|---|---|
| Beispiel mit gleichwertiger anderer Überschrift **besteht** | **erfüllt** — Selbsttest 1 und die 5 strengen Übergaben mit Varianten (z. B. „Prüfung", „Nächster Einstieg") |
| Fehlender Prüfnachweis **scheitert** | **erfüllt** — Selbsttest + Gegenprobe |
| Fehlende Revision **scheitert** | **erfüllt** — Selbsttest + Gegenprobe |
| Pflichtfelder mit Platzhaltertext bestehen nicht | **erfüllt** — Selbsttest + Gegenprobe |
| Manueller fachlicher Review bleibt erforderlich | **benannt** — der Prüfer meldet abweichende Überschriften ausdrücklich als Hinweis für einen Menschen; er urteilt nicht über den Inhalt |

## 8. Bewusst nicht getan / Grenzen

- **Die 44 historischen Übergaben sind nicht massenhaft umgeschrieben.** Das verbietet die Karte
  („Nicht tun") und es ist bereits eine eigene Aufgabe (OP-018/OP-034). Stattdessen: der Weg ist
  **definiert** und an **einer** Datei **vorgeführt**, und der Umfang ist jetzt gemessen.
- **Der Prüfer urteilt nicht über Inhalt.** Er sieht Überschriften, Felder, Nachweis- und Revisionsformen.
  Eine inhaltsreiche Übergabe mit falschem Inhalt besteht ihn weiterhin — das ist der ausdrücklich
  benannte Rest des manuellen Reviews.
- **Stichtag statt Ausnahmeliste:** die Grenze „streng ab 2026-10-07" ist an das Datum im Dateinamen
  gebunden, nicht an eine gepflegte Liste. Eine falsch benannte Datei würde damit falsch behandelt —
  benannt, nicht behoben.

## 9. Git

- Code: `scripts/akte-audit.mjs` (Regelkreis `uebergabe` + gehärtete Code-Span-Behandlung) — Hash siehe
  `work/r8-fortschritt.md`
- Akte: `uebergabe/vorlagen/uebergabe.md`, `uebergabe/00-einstieg/arbeitsregeln.md`,
  `uebergabe/05-uebergaben/2026-10-07-r6-abgeschlossen.md`, `uebergabe/01-stand/offene-punkte.md`
- **Nichts gepusht.**
