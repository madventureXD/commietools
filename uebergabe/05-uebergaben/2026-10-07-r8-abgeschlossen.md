# Übergabe: R8 abgeschlossen (Übergaben, Abschlusskriterien, Prüfverfahren)

**Datum:** 2026-10-07
**Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag:** CommieTools — QM-Sanierung, Stufe R8 durchziehen (5 Karten), **kein Push**, R9 und R10 nicht Teil; zusätzlich Produktfehler ohne eigene Karte mitbeheben und melden
**Status:** abgeschlossen — **R8 ist 5 von 5 Karten erledigt**; drei Produktbefunde gemeldet, davon zwei behoben

## Ziel der Sitzung

Die Karten der Stufe R8 aus `QM/70-reparaturempfehlungen/R8.md` abarbeiten, eine Einheit pro Karte:
Auftrag im Wortlaut lesen, gegen den Live-Stand prüfen, kleinster hinreichender Eingriff, Prüfkette,
Beleg mit echter Ausführung **und** Mutationsgegenprobe, Protokoll, Code- und Akten-Commit getrennt.
Fortschritt nach jeder Einheit auf die Platte (`work/r8-fortschritt.md`). Produktfehler ohne eigene
Karte mitbeheben und melden. Kein Push.

## Ergebnis

**Fünf Karten abgeschlossen.** R8 hieß „Nachvollziehbare Akten und portierbare Prüfverfahren" — jede
Karte hat einen Teil der Akte oder der Prüfverfahren gegen den echten Stand gestellt und, wo nötig,
korrigiert. Alles, was die Akte betraf, ist **ergänzt**, nicht umgeschrieben.

- **M10-001** (aktive Listen): Die verbindliche Aufgabenliste führt nur noch offene Arbeit. 40
  erledigte und 2 überholte Einträge stehen **wörtlich** im Archiv
  `06-protokolle/2026-10-07-erledigte-punkte-archiv.md` (Verlustkontrolle: **0** Zeilen ohne
  Entsprechung); die 6 erledigten Einträge, die noch **offene Teilpunkte** enthielten, sind als
  eigener Punkt erhalten geblieben. Aktive Punkte tragen IDs `OP-001`…`OP-063`, die Konvention steht
  im Kopf. **11 Konzept-Statusköpfe** datiert ergänzt (überholte Zahlen gegen Register, ADR und
  Aktenstand gemessen). Die `DRINGEND`-Akte ist als **historischer Vorgang** eingeordnet, die
  README-Regel unterscheidet jetzt offene und abgeschlossene Dringlichkeitsakten.
- **M10-002** (Übergabevorlage): **Der Befund der Karte ist bestätigt und hat eine Ursache, die
  niemandem anzulasten ist:** `arbeitsregeln.md` verlangte im Kopf das Feld `Auftrag`, die
  **Vorlage** hatte es nicht. Wer der Vorlage folgte, verletzte die Regel. Vorlage ergänzt, Regel
  datiert nachgezogen, neuer Prüfer `uebergabe`. **Gemessen:** 30 von 49 Übergaben mit Lücke,
  132 Hinweise — die Aufgabe OP-018/OP-034 ist damit erstmals **beziffert** statt geschätzt.
- **M10-003** (Aktenkorrektur): Das Verfahren ist **explizit** festgeschrieben (vier Pflichtangaben:
  ersetzte Aussage, Grund, richtige Aussage, Beleg; alte Fassung über `git show` abrufbar;
  Git-Geschichte wird nie umgeschrieben). **Gemessen:** vier Übergaben waren nachträglich
  umgeschrieben worden (`6e33dc3`: drei Dateien, +179/−82; `ed0ee4e`: +94/−39) — sie tragen jetzt
  einen datierten **„Hinweis zur Fassung"**; keine Bewertung, keine Absichtszuschreibung, kein
  Revert. Neuer Prüfer `korrektur`, der **verschwundene Worte** findet und **reine Formatierung
  ausdrücklich nicht** beanstandet.
- **M10-004** (Prüfskripte): **`scripts/belege/`** mit den zwei **tragenden** Belegen, portabel und
  versioniert (Netzbeleg der Sprachpakete, Größe des Rechner-Kerns, gemeinsame Voraussetzungshilfe,
  README); `npm run beleg:sprachpakete` / `beleg:rechner-kern`. **Abnahme echt gefahren:** frischer
  Checkout von `HEAD` **ohne `work/`**, beide Belege Exit 0; vier Negativproben brechen mit **Exit 2**
  und benannter Ursache ab. `work/` bleibt ignoriert, keine private Datei hochgeladen.
- **M10-005** (Abschlussbewertung): neue **`01-stand/abschlussmatrix.md`** — 19 Kriterienzeilen aus
  elf Konzepten, je **Zitat + gemessener Istwert + Revision + Nachweis + Status**. Das unscharfe
  Startbudget ist in **drei getrennte Anforderungen** zerlegt; der identische Bytewert ist **nicht**
  eingehalten (136.961 → 150.082 B gzip) und bleibt als Abweichung stehen. Neuer Prüfer `abschluss`,
  der **jedes Zitat in seiner Quelle** sucht — damit ist „still entfernt" maschinell auffindbar.

**Drei Produktbefunde ohne eigene Karte** (alle gemeldet, zwei behoben):

1. **Vorlage und Regel widersprachen sich** (`Auftrag`) — der Kern von M10-002, behoben.
2. **`HEAD` ist im frischen Checkout nicht baubar** (neu, **OP-064**): `npm run build` scheitert an
   `licenses:check`, weil das committete Register `withNotices: 171 von 176` und
   `noticeMissing: true` für `pdf_signer` sagt, **obwohl** `crates/pdf-signer-engine/LICENSE` (Auflage
   A3) in `HEAD` liegt. **Nicht eigenmächtig geändert** — die Registerdateien sind eine getroffene
   Betreiberentscheidung (OP-036). Für die Belege genügt `npm run build --workspace @commietools/web`.
3. **Der Verweispruefer war zu grob** für mehrfache Backtick-Folgen — behoben, mit Gegenprobe.

**Vier zu schwache Mutationsversuche** traten auf und sind **jedes Mal als Prüfmittel-Frage**
behandelt worden, nicht als Produkt- oder Aktenfehler (Details in den Protokollen).

## Geänderte Bereiche

- `scripts/akte-audit.mjs` (**neu**) — Aktenprüfer mit vier Regelkreisen `listen`, `uebergabe`,
  `korrektur`, `abschluss`; `package.json` — `npm run akte:check` **in `check`** und `beleg:*`
- `scripts/belege/` (**neu**) — `voraussetzungen.mjs`, `sprachpakete-netzbeleg.mjs`,
  `rechner-kern-groesse.mjs`, `README.md`
- `uebergabe/00-einstieg/arbeitsregeln.md` — Aktenkorrekturverfahren, maschinelle Übergabeprüfung
- `uebergabe/00-einstieg/vorgehen-qm-audit.md` — R8-Zeilen, gezählter Kartenstand, Git-Nachtrag
- `uebergabe/vorlagen/uebergabe.md` — Kopffeld `Auftrag`, Abschnitt „Pflichtabschnitte"
- `uebergabe/01-stand/offene-punkte.md` — nur offene Arbeit, IDs, OP-062/063/064, Archivverweise
- `uebergabe/01-stand/aktueller-stand.md` — datierter R8-Zusatz
- `uebergabe/01-stand/abschlussmatrix.md` (**neu**)
- `uebergabe/06-protokolle/2026-10-07-erledigte-punkte-archiv.md` (**neu**) und fünf R8-Protokolle
- `uebergabe/03-konzepte/` — 11 datierte Statusköpfe; `uebergabe/README.md`,
  `uebergabe/DRINGEND-startlast-pdf-engines.md` — eingeordnet
- `uebergabe/05-uebergaben/` — `2026-10-07-r6-abgeschlossen.md` (Auftrag nachgetragen), zwei
  datierte Nachträge (M10-004), vier Fassungshinweise (M10-003)
- `uebergabe/07-pruefung/hebel2/beleg-2026-10-07.txt` (**neu**, datierter Beleg)

## Entscheidungen und Annahmen

- **Keine Akte umgeschrieben.** Jede Korrektur ist ein datierter Zusatz; der alte Wortlaut steht.
- **Der Prüfer blockt nicht vollständig** (M10-003): nur verschwundene Worte gegenüber `HEAD`; nach
  einem Commit ist der Vergleich leer. Bewusst so — die Karte nennt eine Vollsperre ausdrücklich zu
  grob. Die Grenze steht im Protokoll.
- **Stichtag statt Ausnahmeliste** (M10-002): streng geprüft wird ab 2026-10-07, ältere Übergaben
  werden nur gemeldet. Eine falsch benannte Datei würde falsch behandelt — benannt, nicht behoben.
- **Nur die tragenden Belege portiert** (Thomas, 2026-10-06 Punkt 6). Was liegen bleibt, steht
  namentlich in OP-063.
- **Keine Verantwortlichkeiten erfunden:** die Aufgabenliste nennt als Regel „Verantwortlich ist
  Faber", statt 63 geratene Zuständigkeiten einzutragen.
- **Die Abschlussmatrix wurde nicht mit erfundenen Kriterien gefüllt:** für die Handwerk-Wellen A–D
  gibt es **kein** schriftliches Kriterium — das steht als eigener Status in der Matrix.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Endstand) | **Exit 0** — **719 Tests** in 51 Dateien, 0 Lint-Fehler (109 Warnungen, Bestand); `akte:check` läuft mit |
| `npm run build` (Endstand) | **Exit 0** — Bundle-Audit bestanden, Eingang 150.082 B gzip, Rechenkern-Chunk 103.801 B |
| `npm run akte:check` | grün: `listen` (216 Akten-Dateien, 59 Verweise, 64 aktive Punkte, 15 Statusköpfe), `uebergabe` (5 streng, 44 historisch gemeldet), `korrektur` (keine verschwundenen Worte), `abschluss` (19 Kriterienzeilen, jedes Zitat in seiner Quelle, 11 Konzepte vertreten) |
| Mutationsgegenproben | **M10-001 7/7**, **M10-002 5/5 + Selbsttest 6/6**, **M10-003 4/4**, **M10-005 5/5** — jede mit Wiederherstellung per Hash |
| Abnahme im frischen Checkout (M10-004) | Worktree von `HEAD`, **ohne `work/`**: beide Belege **Exit 0**, „BELEG ERBRACHT"; vier Negativproben **Exit 2** mit benannter Ursache |
| Belege am gebauten Stand | Netzbeleg `07-pruefung/hebel2/beleg-2026-10-07.txt` (Startseite ohne Werkzeugtexte, Werkzeugroute nur mit eigenem Paket); Rechenkern-Messung (100,6 KiB gzip heute wie in der Nachmessung vom 2026-10-04) |

## Offene Punkte und Risiken

- [ ] **OP-064 — `HEAD` ist im frischen Checkout nicht baubar** (neu, Produktbefund): das committete
  Lizenzregister widerspricht der eigenen Hinweisdatei. Braucht eine Entscheidung von Thomas
  (Register committen oder Prüfung entschärfen) — **nicht** eigenmächtig geändert.
- [ ] **OP-018/OP-034 — 30 Übergaben mit 132 Lücken**: jetzt beziffert, Migration steht aus
  (datierter Ergänzungsblock je Datei, nie überschreiben).
- [ ] **OP-062 — Entscheidung zur Strukturmigration** der vier umgeschriebenen Übergaben.
- [ ] **OP-063 — nicht übernommene Belegskripte** der Wellen A–E: entscheiden, ob einzelne portiert
  werden.
- [ ] **Der frische Checkout ist keine zweite Maschine**: die Abhängigkeiten kamen als Junction aus
  dem Arbeitsbaum, ein `npm install` im Checkout wurde **nicht** gefahren.
- [ ] **Der Netzbeleg braucht Edge/Chrome und einen laufenden Vorschaudienst** — Handarbeit, kein
  Teil von `npm run check`.
- [ ] **Kein Prüfer bewacht die Leitdatei** `vorgehen-qm-audit.md` (weiterhin offen; der Kartenstand
  wurde hier per Skript gezählt, nicht geprüft).
- [ ] **Der Aktenprüfer sieht nur den Arbeitsbaum gegen `HEAD`**: eine Umschreibung, die ohne
  `akte:check`-Lauf committet wird, bleibt unbemerkt (Grenze, im Protokoll benannt).
- [ ] **Nicht Teil dieses Auftrags und weiterhin offen:** der **Push** (erst nach der unabhängigen
  Abschlusskontrolle), **R9** (2 Karten) und **R10** (1 Karte, Betreiberentscheidung).

## Empfohlener nächster Schritt

1. **R9 aufnehmen** (gemeinsame Bausteine und Routing, 2 Karten) — die letzte inhaltliche Stufe vor
   der Betreiberentscheidung R10.
2. **Entscheidung zu OP-064** (baubarer `HEAD`) vor der unabhängigen Abschlusskontrolle.
3. **Aktenlücken OP-018/OP-034** im selben Zug schließen wie die Fassungshinweise aus M10-003.
4. **Push** bleibt bei Thomas: `main` liegt 130 Commits vor `origin/main` (gemessen), ein Push
   veröffentlicht commietools.org.

## Git

- Commits: `44f64ff`, `740d2e1`, `faa9e70` (M10-001) · `bf36c21`, `05ba888` (M10-002) · `1338a61`,
  `8248c14` (M10-003) · `5e75b0a`, `9a9667b`, `7e95b94` (M10-004) · `0b26f8c`, `3792313` (M10-005) ·
  Akten-Commit dieses Nachzugs (Kartenstand, Stand, diese Übergabe)
- Arbeitsbaum: sauber bis auf die beiden bewusst uncommitteten `licenses/registry.json`-Änderungen
  und die zwei M4-005-Testdateien (nicht angefasst)
- **Nichts gepusht** — **130 Commits vor `origin/main`** (gemessen mit
  `git rev-list --count origin/main..HEAD` vor den Akten-Commits dieses Nachzugs)
- **Endstand der Aktenpflege** (datiert nachgetragen 2026-10-07): Kopf **`2cbac41`**,
  **134 Commits vor `origin/main`** — gemessen bei genau diesem Kopf, damit die Zahl auch nach
  weiteren Commits eindeutig bleibt. `main` ist damit weiterhin **unveröffentlicht**.
