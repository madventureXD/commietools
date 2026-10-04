# Übergabe: Suite „Rechnen" — Welle 6 (Aufmaß)

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Auftrag:** Thomas, 2026-10-04: „So im Konzept festhalten. Dann Welle 6 durchführen und Sessionabschluss"
**Status:** abgeschlossen

## Ziel der Sitzung

Drei Teile in dieser Reihenfolge:

1. Die von Thomas vorgegebenen Lösungsklassen a–d für alle 24 Handwerker-Vorschläge im Konzept
   `2026-10-03-handwerkerwerkzeuge.md` festschreiben.
2. Welle 6 der Suite „Rechnen" durchführen: Werkzeug 9 „Aufmaß".
3. Sessionabschluss.

**Abnahmekriterien der Welle 6** (aus `01-stand/roadmap.md`, unverändert übernommen):
Mengenblatt ist nachrechenbar (jede Position zeigt ihre Maße) · Flächen, Längen und Stückzahlen
getrennt summiert · Export in allen drei Formaten geprüft · Preise und Kundendaten liegen **nicht**
im Rechner-Verlauf.

## Ergebnis

**Alle vier Abnahmekriterien sind erfüllt** — das vierte erst nach einer Nachholung (siehe
„Prüfungen", Punkt 6). Das Werkzeug steht als Route `/tools/aufmass` in der Suite „Rechnen".

**1. Konzept-Nachtrag geschrieben.** Die Lösungsklassen sind in
`03-konzepte/2026-10-03-handwerkerwerkzeuge.md` als datierter Nachtrag festgehalten, mit dem
Auftrag im Wortlaut, der Zuordnung aller 24 Vorschläge, Einzelnachweisen und einem neuen
Wellenvorschlag. Ergebnis der Zuordnung: **15 × a** (einfach, erprobte Lösung im Projekt),
**2 × b** (OSS vorhanden, Integration unerprobt: Zuschnittoptimierer, Aufmaß-Skizze), **5 × c**
(Eigenbau nötig: Leitungsquerschnitt, Beleuchtung, Rohrdimensionierung, Heizlast, Gewinde),
**1 × d** (überholt: Umrechner technische Größen — steckt in Werkzeug „Umrechnen"),
**1 × gestrichen** (Normen-Nachschlagewerk, rechtliches Hindernis).

**2. Aufmaß gebaut.** Zwei getrennte Ebenen, wie im Konzept entworfen:

- **Aufmaßzeile** — Bezeichnung, Maßkette oder Formel (`3,50 × 2,80`, `2 × (2,40 + 1,80)`),
  Einheit, Ergebnis. Der Rechenweg bleibt im Blatt stehen.
- **Position** — Menge × Einheit × Einzelpreis = Betrag. Die Menge kann aus einer Aufmaßzeile
  stammen; dann zeigt die Position ihre Maße und ist nachrechenbar.
- Abschnitte mit Zwischensummen; **Mengensummen je Einheit**, nie über Einheiten hinweg.
- Ausgabe als CSV, PDF und Text. Eigener Speicherbereich (`aufmass.sheet.v1`).

**3. Abweichung vom Konzeptentwurf, offen benannt.** Der Entwurf sagte „nutzt den Rechenkern und
die Geometrie-Formeln". Die Fachlogik rechnet stattdessen mit einem **eigenen, kleinen
Vorrangparser** in `BigInt` — mathjs wird bewusst nicht importiert. Grund: Die Logik bleibt
engine-frei und ohne Browser prüfbar, und der Rechenkern hätte für Maßketten (`3,50 × 2,80`,
Klammern, Punkt vor Strich) keinen Gegenwert gebracht. Dieselbe Rechentechnik wie `commercial.ts`
(feste Skala 10¹²), also kein neues Verfahren.

## Geänderte Bereiche

- `packages/tools/src/calculator/aufmass.ts` – neu; Auswerter, Dokumentmodell, Berechnung,
  Summen, CSV- und Textausgabe
- `packages/tools/src/calculator/aufmassStore.ts` – neu; eigener Speicherbereich
- `packages/tools/src/calculator/aufmass/locales/{de,en,es,index}.ts` – neu; drei Sprachen
- `packages/tools/src/locales.ts` – Sprachkatalog eingetragen
- `packages/tools/src/catalog/manifests.ts` – Werkzeugmanifest (`files.output`: CSV, PDF, Text)
  und Suite „Rechnen" um `aufmass` erweitert
- `packages/tools/src/catalog/toolIndex.ts`, `catalog/generated/**` – erzeugt, nicht von Hand
- `packages/tools/package.json` – zwei neue Einstiegspunkte (`calculator/aufmass`,
  `calculator/aufmassStore`)
- `apps/web/src/tools/Aufmass.tsx` – neu; Oberfläche nach dem Vier-Schritt-Fluss
- `apps/web/src/tools/aufmassPdf.ts` – neu; PDF-Ausgabe, `pdf-lib` erst beim Auslösen geladen
- `apps/web/src/App.tsx` – Route der `ToolPage`-Kette ergänzt
- `apps/web/public/tools/aufmass.svg` – neu; Symbol
- `apps/web/src/aufmass.test.ts` – neu; 20 Tests
- `uebergabe/03-konzepte/2026-10-03-handwerkerwerkzeuge.md` – datierter Nachtrag
- `uebergabe/01-stand/*`, `uebergabe/06-protokolle/2026-10-04-rechner-welle6.md` – Stand und
  Protokoll

## Entscheidungen und Annahmen

- **Eigener Maßketten-Auswerter statt mathjs in der Fachlogik** (siehe „Ergebnis", Punkt 3).
- **Mengen werden nie über die Anzeige zurückgelesen.** `evaluateMeasure` gibt zusätzlich den
  exakten skalierten Wert zurück. Anlass war ein Testfund: Der Rückweg über den Text `9.800`
  wurde als Tausenderpunkt gelesen, der Betrag war dadurch **um Faktor 1000 zu hoch**.
- **Ist eine Quelle benannt, aber gelöscht, wird die eigene Menge nicht stillschweigend
  gerechnet** — die Position meldet einen Fehler, statt eine Zahl zu zeigen, die nicht mehr auf
  dem Blatt steht.
- **Die Einheit einer Position kommt mit der Quelle.** Ohne diese Regel konnte eine Menge in
  Metern an einem Quadratmeterpreis hängen. Gefunden in der Browser-Abnahme, nicht im Test.
- **Voreinstellung einer Aufmaßzeile ist m²** (Flächen sind der häufigste Fall im Aufmaß).
- **Maße mit drei, Geld mit zwei Nachkommastellen**, durchgehend in beiden Ausgaben.
- **Aufmaßdaten liegen in einem eigenen Bereich**, nicht im Rechner-Verlauf. Der Kommentar in
  `history.ts` hielt diesen Bereich seit Welle 1 ausdrücklich frei.
- **Kein Preiskatalog.** Preise kommen ausschließlich aus der Eingabe (Projektlinie: keine
  veralteten Daten, keine Backend-Arbeit).
- **Angenommen:** Ein Komma ist immer das Dezimaltrennzeichen, ein Punkt vor genau drei Ziffern
  ein Tausenderpunkt. Steht so in allen drei Sprachkatalogen.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Lizenz, Katalog, Typen, Tests) | bestanden |
| davon Tests | **301 in 16 Dateien bestanden** (davon 20 neue für Aufmaß) |
| `npm run lint` | bestanden |
| `npm run build` | bestanden |
| `npm run bundle:check` (im Build) | bestanden |
| `git diff --check` | bestanden (nur die üblichen CRLF-Hinweise) |
| `catalog:generate` | 41 Werkzeuge, 3 Sprachen, 2.730 Suchbegriffe, 92 Dateitypen |

**Zusätzlich am echten Artefakt in Edge headless (nicht nur im Test):**

1. Route `/tools/aufmass` lädt mit der Überschrift „Aufmaß"; Eingabe über Titel, Abschnitt,
   Aufmaßzeile und Position durchgespielt.
2. `3,50 × 2,80` ergibt **9,800 m²**; Position mit Menge aus der Zeile und 12,50 €/m² ergibt
   **122,50 €**; Zwischensumme und Gesamtbetrag 122,50; Mengensumme 9,800 m².
3. **Keine PDF-Engine beim Öffnen**: geladen werden nur `Aufmass-*.js` und `aufmass.svg`.
4. Kein waagerechter Überlauf der Seite bei 320 px (Startseite 0 überstehende Elemente).
5. **PDF-Ausgabe wirklich ausgeführt** (derselbe Code, außerhalb des Browsers): drei Sprachen,
   gültiger `%PDF`-Kopf, A4, eine Seite — und mit einem **fremden Leser** (`pdfjs-dist`)
   zurückgelesen: Umlaute, `m²`, Gedankenstrich und die Zahlen stehen richtig, mit den
   Dezimaltrennzeichen der jeweiligen Sprache.
6. **Nachgeholt, weil zunächst offen:** Kriterium 3 („Export in allen drei Formaten geprüft") war
   nach dem ersten Durchlauf für PDF **nicht** belegt. Es wurde nicht als erfüllt gemeldet,
   sondern nachgeholt.
7. **Nicht geprüft:** systematischer Tastaturlauf (wie schon in Welle 5), Bedienung mit
   Screenreader, Verhalten bei mehreren hundert Zeilen.

**Größen (gemessen, Warnschwellen sind keine harten Grenzen):**

| Größe | Wert | Schwelle |
|---|---:|---:|
| Start-JavaScript | 136.959 B gzip (+119) | 204.800 B |
| Katalogbasis | 1.100 B gzip | 15.360 B |
| Suchpaket je Sprache | de 7.833 / en 6.820 / es 7.179 B gzip | 25.600 B |
| Werkzeugtexte je Sprache | de **26.403** / en 23.849 / es 25.451 B gzip | 30.720 B |
| Rechenkern (eigener Chunk) | 102.475 B gzip | – |

## Offene Punkte und Risiken

- [ ] **Werkzeugtexte Deutsch liegen bei 26.403 von 30.720 B** — Reserve rund 4,3 KiB. Die nächste
      Werkzeugwelle kann die Warnschwelle reißen. Vorher entscheiden, ob die Texte je Sprache
      weiter aufgeteilt werden.
- [ ] **320 px: Werkzeugseiten schneiden ab.** Gemessen: überstehende Elemente commercial 20,
      geometry 19, equations 23, aufmass 28; die Startseite 0. Das ist ein **vorbestehender
      Befund der Werkzeugseiten-Vorlage**, keine Regression dieser Welle — die vorgeschriebene
      Breite 320 px ist auf Werkzeugseiten aber derzeit nicht eingehalten.
- [ ] **PDF-Schrift ist auf WinAnsi beschränkt.** Zeichen außerhalb (kyrillisch, griechisch,
      chinesisch) werden transliteriert oder zu `?`. Für die drei veröffentlichten Sprachen
      reicht das; eine vierte Sprache mit anderer Schrift braucht eine eingebettete Schrift.
- [ ] **Tastaturbedienung nicht systematisch durchgespielt** (offen seit Welle 5).
- [ ] **Bedienung mit Screenreader** und **Verhalten bei sehr vielen Zeilen** nicht geprüft.

## Empfohlener nächster Schritt

1. **Welle 6 veröffentlichen** — sie ist gebaut und geprüft, aber nicht ausgeliefert. Ein Push
   auf `main` löst das Deployment aus und ist **ausdrücklich Thomas' Entscheidung**.
2. Danach die **Werkzeugtexte-Aufteilung** angehen, bevor die Handwerker-Werkzeuge beginnen:
   Bei 4,3 KiB Reserve ist die Schwelle sonst in der ersten Handwerker-Welle fällig.
3. Erst dann **Welle A der Handwerker-Werkzeuge** (Beton, Dach, Holzfeuchte, Metall) nach dem
   neuen Nachtrag — nach Thomas' Plan liegt dazwischen die Aktualisierung von commietools.org
   durch ChatGPT.

## Git

- Commit: `7121281` (Welle 6, Code) und der Dokumentations-Commit
- Arbeitsbaum: Der Commit enthält **nur** die Dateien dieser Welle. Die Änderungen des laufenden
  Umbaus (App-Shell, `packages/i18n`, `docs/`, `scripts/`, Sprachpakete) lagen bereits
  uncommittet im Baum und wurden **nicht** mitgenommen; die erzeugten Katalogpakete unter
  `catalog/generated/` gehören zum Werkzeug und sind enthalten.
- **Nicht gepusht.** `main` löst das Cloudflare-Pages-Deployment aus.
