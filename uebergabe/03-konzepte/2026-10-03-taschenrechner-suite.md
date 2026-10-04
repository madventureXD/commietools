# Konzept: Suite „Rechnen" (Taschenrechner)

**Datum:** 2026-10-03
**Verfasst von:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Status:** Vorschlag — nicht entschieden, nichts umgesetzt
**Auftrag:** Thomas, 2026-10-03. Erst Open-Source-Lage recherchieren, danach Gruppierung
bestimmen. **Währungsrechner ausdrücklich nicht aufnehmen.**
**Recherche:** 42 Registry-Inventare (13,7 s) und 15 Websuchen; Quellen unten je Aussage.

---

## Vorbemerkung zur Methode

Registry-Inventar zuerst (`npm-inventar.mjs`, 42 Pakete), danach Web-Recherche. Das
Lizenzfeld der Registry ist ein **Hinweis, kein Beleg** — belegt ist eine Lizenz erst, wenn
sie im Repository oder in der Lizenzdatei gelesen wurde. Diese Unterscheidung ist unten
durchgehalten. Es wurde nichts installiert und nichts im Projekt geändert.

Projektregel: `AGPL-3.0-only`. Erlaubt laut `licenses/policy.json`: MIT, ISC, Apache-2.0,
BSD-2/3-Clause, CC0-1.0, **CC-BY-4.0**, MPL-2.0, LGPL-3.0-or-later, 0BSD, BlueOak-1.0.0.
**GPL, AGPL-only, CC-BY-SA und alles Ungeklärte stehen in `reviewRequired`.**

---

## Querschnittsbefunde

### Q1 — Die besten freien Rechner sind GPL-Desktop-Programme

**Qalculate!** und **SpeedCrunch** gelten als die besten freien Rechner überhaupt, besonders
bei Einheiten und Genauigkeit. Beide sind **GPL** (SpeedCrunch GPL-2.0-or-later) und
Desktop-Anwendungen in C++/Qt (`unclouded.app`, `opensource.com`, `cloudspress.com`).
Sie scheiden doppelt aus: Lizenz und Plattform. Als **fachliche Referenz** für Funktionsumfang
und Bedienkonzept sind sie trotzdem wertvoll — SpeedCrunch ist ausdrücklich tastaturzentriert
und arbeitet mit Ausdrücken statt Tastenklicks. Genau diese Haltung ist für uns richtig.

### Q2 — Freie Web-Rechner sind fast alle Einzelprojekte

Die Suche fand Dutzende Web-Taschenrechner. Die Masse sind Einzelprojekte mit 0–3 Sternen,
einem Beitragenden und ohne Pflegehistorie. Vier geprüfte Fälle:

- **`lavaoverjava/OmniSolver-public`** — **MIT belegt** (Repo-Lizenzanzeige). 16 Solver
  (wissenschaftlich, Plotter, Gleichungen, symbolische Algebra, lineare Algebra, Statistik,
  Einheiten, Finanzen), offline, keine Konten, kein Tracking, React/TypeScript/Vite, PWA.
  Baut `math.js` und `nerdamer` **aus kuratierten Factories** statt aus dem `all`-Bündel und
  lässt den Bau scheitern, wenn ein Chunk sein Budget überschreitet. Hat eigene Abschnitte zu
  Genauigkeit, Barrierefreiheit und Sicherheit.
  **Bewertung: inhaltlich der nächste Verwandte dieses Vorhabens — aber 0 Sterne, ein
  Beitragender, angelegt 2026-08-13.** Als Abhängigkeit zu unreif; als **Architektur-Vorbild
  sehr wertvoll**, weil es genau unsere Fragen (Chunk-Budget, Factory-Import statt Vollbündel)
  schon beantwortet.
- **`TEJAS-MK2/Calculator`** — **Apache-2.0 belegt**, PWA mit Offline-Betrieb und exakter
  Arithmetik auf `BigInt`-Basis. Das JavaScript-Paket liegt aber nur auf **GitHub Packages**,
  nicht in der npm-Registry — Aufnahme wäre an ein Token gebunden. Als Referenz brauchbar.
- **`0thernes/professional-calculator`** — Lizenz **„Other"**, damit nicht bestimmbar →
  ausgeschieden. Inhaltlich (48 Rechner, 1123 Tests, null Laufzeitabhängigkeiten) beeindruckend,
  aber ohne klare Lizenz nicht verwendbar.
- **`ferraridamiano/ConverterNOW`** — **GPL** → ausgeschieden.

**Folgerung:** Keine dieser Anwendungen wird Abhängigkeit. Die Suche hat ihren Zweck trotzdem
erfüllt: Sie zeigt den Funktionsstand, den Nutzer erwarten, und liefert mit OmniSolver ein
Vorbild für den Aufbau.

### Q3 — Die eigentlichen Bausteine sind Bibliotheken, nicht Apps

Brauchbar und geprüft (Registry-Angabe, sofern nicht anders vermerkt):

| Zweck | Paket | Lizenz | Stand | Größe (Paket) |
|---|---|---|---|---|
| Exakte Brüche | `fraction.js` | MIT | 2025-08 | 144 kB |
| Dezimalarithmetik | `decimal.js` | MIT | 2025-07 | 278 kB |
| Dezimal (klein) | `big.js` | MIT | 2025-04 | 58 kB |
| Ausdruck → Zahl | `math-expression-evaluator` | MIT | 2025-06 | 67 kB |
| Ausdruck → Zahl | `expr-eval` | MIT | **2019-09** | 142 kB |
| Funktionsplot | `function-plot` | MIT | 2026-04 | 706 kB |
| Statistik | `simple-statistics` | ISC | 2026-09 | 1,3 MB |
| Symbolisch (CAS) | `nerdamer` | Apache-2.0 | 2026-10 | 3,0 MB |
| Einheiten | `convert` | MIT | 2026-09 | 1,0 MB |
| Einheiten | `unitmath` | Apache-2.0 | 2024-10 | 483 kB |
| Deutsche Feiertage | `feiertagejs` | MIT | 2026-04 | 235 kB |
| Lokaler Speicher | `idb-keyval` | Apache-2.0 | 2026-07 | 55 kB |

**Ausgeschieden wegen Größe:** `@cortex-js/compute-engine` (48 MB), `jsxgraph` (75 MB),
`mathjs` (9,2 MB), `plotly.js-dist-min` (6,0 MB), `chart.js` (6,0 MB), `mathlive` (5,6 MB),
`vega` (3,6 MB). **Ausgeschieden wegen Lizenz:** `jstat` (**keine Lizenzangabe**),
`jsxgraph` (nur mit LGPL-Option), `date-holidays` (siehe Q5).

### Q4 — Genauigkeit ist bei einem Rechner keine Feinheit, sondern die Kernanforderung

JavaScript rechnet in Gleitkomma: `0,1 + 0,2` ergibt `0.30000000000000004`. Bei einem
Bildwerkzeug ist das belanglos; bei einem Rechner ist es ein Fehler. Deshalb gehören
`fraction.js` (exakte Brüche) und `decimal.js` (Dezimalarithmetik) zum Kern, nicht als
spätere Verbesserung. Beide sind MIT und klein. **Das ist die einzige Stelle, an der die
Suite zwingend Bibliotheken braucht.**

Nebenbefund: Der Vorschlag „Bruchrechner" ist damit nicht ein Rechner unter vielen, sondern
das **Zahlenmodell**, auf dem die anderen aufsetzen.

### Q5 — Feiertage: der naheliegende Kandidat ist lizenzrechtlich gesperrt

`date-holidays` ist das bekannteste Paket für Feiertage und wäre für den Fristenrechner ideal.
Die **Lizenzdatei im Repository** sagt jedoch:

> „The data contained in `holidays.yaml` is available under **CC BY-SA 3.0**"

ShareAlike ist ein Copyleft auf den Daten und steht nicht in `allowedExpressions` (dort nur
CC-BY-4.0). Die Registry weist zusätzlich `(ISC AND CC-BY-3.0)` aus.
**`date-holidays` scheidet damit aus** — und zwar über die Datenlizenz, nicht über den Code.
Das ist genau die Falle, die der Prüf-Skill meint: das Lizenzfeld der Registry war der Hinweis,
die Lizenzdatei der Beleg.

**Ersatz:** `feiertagejs` (MIT, 235 kB, aktiv gepflegt 2026-04) berechnet deutsche Feiertage je
Bundesland ohne Abhängigkeiten. Vor der Aufnahme ist zu prüfen, woher die Termine stammen —
Feiertagstermine sind Fakten, ihre Zusammenstellung kann geschützt sein.

### Q6 — Vorbild „Formel mit Quelle": Free Tool Arena

Ein geprüftes Vergleichsangebot (`freetoolarena.com`) baut auf **demselben Stack wie
CommieTools** (pdf-lib, pdf.js, tesseract.js, qrcode) und zeigt unter jedem Rechner ein
Panel **„Show the math + sources"**: die Formel im Klartext, die getroffenen Annahmen, die
Quellen-URLs und das Datum der letzten Prüfung.

**Das ist für uns direkt übernehmbar und schließt eine Lücke.** Bei den Handwerkerrechnern
war die Normfrage der wunde Punkt: Normtabellen sind geschützt, Rechenwege nicht. Ein
Rechner, der seine Formel und seine Quelle offenlegt, ist sowohl rechtlich sauberer als auch
fachlich überprüfbar. **Empfehlung: „Formel und Quelle" wird ein Pflichtbestandteil jedes
Rechners in dieser Suite** — nicht ein Zusatz.

### Q7 — Ausdrucksauswertung: kein `eval`, und der Standardkandidat ist eingefroren

Ein Rechner, der Ausdrücke wie `2+3*(4-1)` annimmt, braucht einen Parser. `eval` ist tabu
(Sicherheitsrisiko, und es verbietet jede strenge CSP).

- `expr-eval` (MIT) beschreibt sich selbst als „safer and more math-oriented alternative to
  using JavaScript's eval", hat **0 Abhängigkeiten** und 269 abhängige Pakete — ist aber
  **seit 2019 nicht veröffentlicht**. Ein abgeschlossenes Formatstück darf stillstehen, ein
  Parser für beliebige Nutzereingabe eher nicht.
- `math-expression-evaluator` (MIT, **67 kB**, 2025-06) ist kleiner und jünger.
- `@networkteam/eel` (MIT, 44 kB, 2024) ist ein eigener kleiner Parser/Compiler.
- `expression-eval` ist **ausdrücklich als nicht mehr gepflegt markiert** → ausgeschieden.

**Entscheidung offen.** Ein eigener kleiner Parser (Tokenisieren, Rangfolge, Klammern) ist bei
diesem Umfang realistisch und macht uns unabhängig; die Bibliotheken sind der schnellere Weg.
Beides ist vertretbar — die Frage gehört vor den Baubeginn entschieden, nicht währenddessen.

---

## Die Rechnerarten und ihre Open-Source-Lage

Währungsrechner gestrichen (Auftrag). Es bleiben 23.

### A. Ausdrucksrechner

**1. Standardrechner** — Grundrechenarten, Prozent, Wurzel, Speicher, Verlauf.
*Lage:* Keine Bibliothek nötig außer dem Zahlenmodell (Q4). Referenz: OmniSolver, TEJAS.
*Machbarkeit:* klein.

**2. Wissenschaftlicher Rechner** — Trigonometrie, Logarithmen, Potenzen, Konstanten, DEG/RAD.
*Lage:* Hängt an der Ausdrucksauswertung (Q7) und am Zahlenmodell (Q4).
*Machbarkeit:* **mittel — der schwierigste Teil der Suite.** Rangfolge, Klammern, implizite
Multiplikation, Fehlerbehandlung.

**3. Programmiererrechner** — HEX/DEC/OCT/BIN, Bitoperationen, Wortbreite, Zweierkomplement.
*Lage:* **keine Bibliothek nötig** — `BigInt` ist im Browser vorhanden und rechnet beliebig
breit. Referenz: `alt-romes/programmer-calculator`.
*Machbarkeit:* klein.

**4. RPN-Rechner** — umgekehrte polnische Notation mit Stapelanzeige.
*Lage:* Eigene Stapellogik, keine Bibliothek. Referenz: `jcfieldsdev/ee-calc` (JavaScript,
RPN mit komplexen Zahlen).
*Machbarkeit:* klein. Nische, aber billig — und ein Alleinstellungsmerkmal, weil kaum ein
Web-Rechner das anbietet.

**5. Bruchrechner** — exakte Brüche, gemischte Zahlen, Zollbrüche, Dezimal ↔ Bruch.
*Lage:* **`fraction.js` (MIT, 144 kB) — der ideal passende Baustein.**
*Machbarkeit:* klein. **Das ist das Zahlenmodell für die ganze Suite** (Q4).

### B. Umrechner

**6. Zoll- und Maßrechner** — Zollbrüche ↔ mm, Fuß/Zoll, Maßketten.
*Lage:* `fraction.js` plus eigene Umrechnungstabelle. Deckt den Handwerker-Vorschlag
„Maßketten-Rechner" mit ab.
*Machbarkeit:* klein.

**7. Zahlensystem- und Zahlenraumrechner** — Basen 2–36, römische Zahlen, Zahl in Worten.
*Lage:* `BigInt` nativ; `number-to-words` (MIT, **2018**) und `written-number` (MIT, 2021)
sind beide alt und für Deutsch ohnehin ungeeignet — **Zahlwörter selbst schreiben.**
*Machbarkeit:* klein.

**8. Einheitenrechner** — Länge, Fläche, Volumen, Masse, Druck, Kraft, Drehmoment, Temperatur,
Energie, Leistung, Geschwindigkeit.
*Lage:* `convert` (MIT, aktiv 2026-09) oder `unitmath` (Apache-2.0). `convert-units` ist
**seit 2018 eingefroren**.
*Machbarkeit:* klein bis mittel. Deckt den Handwerker-Vorschlag 3 ab.

### C. Kaufmännisch

**9. Prozent- und Kaufmannsrechner** — Prozent in drei Richtungen, Rabatt, Aufschlag, Marge,
MwSt, Skonto, Dreisatz.
*Lage:* Eigene Formeln auf `decimal.js`. Rechenwege sind öffentlich.
*Machbarkeit:* klein. Für Handwerksbetriebe täglich relevant.

**10. Zins- und Tilgungsrechner** — Zinseszins, Annuität, Tilgungsplan, Effektivzins.
*Lage:* Eigene Formeln auf `decimal.js`. Der Tilgungsplan ist eine Tabelle, keine Engine.
*Machbarkeit:* klein bis mittel.

### D. Zeit und Datum

**11. Datumsrechner** — Abstand, Datum ± Tage, Arbeitstage, Kalenderwoche, Wochentag.
*Lage:* `Date` genügt für die meisten Fälle; `@js-temporal/polyfill` (ISC, 2,9 MB) wäre
korrekter, ist aber groß. `date-fns` (MIT) und `dayjs` (MIT, 666 kB) sind Alternativen —
für diesen Umfang genügt Eigenlogik auf `Date`.
*Machbarkeit:* klein.

**12. Fristenrechner** — Fristbeginn und -ende, Wochen/Monate/Jahre, Feiertage je Bundesland.
*Lage:* **`feiertagejs` (MIT, 235 kB).** `date-holidays` ist **ausgeschieden** (Q5).
*Machbarkeit:* klein. **Nutzt später das Übergabeprotokoll** (BGB 5 Jahre / VOB 4 Jahre).

**13. Zeitrechner** — Zeitdauern addieren, Uhrzeiten differenzieren, Dezimalstunden ↔ `H:MM`.
*Lage:* Eigene Logik, keine Bibliothek.
*Machbarkeit:* klein. Für Stundenzettel direkt nützlich.

### E. Eigene Oberflächen

**14. Funktionsplotter** — Funktionen zeichnen, Wertetabelle, Nullstellen, Extremwerte.
*Lage:* **`function-plot` (MIT, 706 kB, aktiv 2026-04)** ist genau für diesen Zweck gebaut
und klein. `plotly` und `chart.js` sind mit je 6 MB zu groß, `d3` (ISC, 851 kB) wäre die
Basisschicht darunter.
*Machbarkeit:* klein bis mittel.

**15. Gleichungslöser** — linear, quadratisch mit Lösungsweg, Polynom, Gleichungssysteme.
*Lage:* Für lineare und quadratische Gleichungen genügen eigene Formeln. Für symbolische
Lösungen bräuchte es `nerdamer` (Apache-2.0, 3,0 MB, aktiv) oder `algebrite` (MIT,
**2021 eingefroren**). **Empfehlung: ohne symbolische Algebra anfangen.**
*Machbarkeit:* klein (ohne CAS) bis mittel (mit).

**16. Statistikrechner** — Mittelwert, Median, Streuung, Quartile, Korrelation, Regression.
*Lage:* **`simple-statistics` (ISC, 1,3 MB, aktiv 2026-09).** `jstat` hat **keine
Lizenzangabe** → ausgeschieden. `regression` (MIT) ist **seit 2017 eingefroren**.
`@stdlib/stats-*` (Apache-2.0, 46 kB je Verteilung) ist sehr granular, wenn nur einzelne
Verteilungen gebraucht werden.
*Machbarkeit:* klein. Anderes Eingabemodell (Datenliste) → eigenes Werkzeug.

**17. Geometrierechner** — Flächen, Umfang, Volumen, Oberfläche von Körpern.
*Lage:* Schulformeln, keine Bibliothek. **Überlappt bewusst mit dem Handwerker-Vorschlag
„Flächen für unregelmäßige Räume" — hier gehört es hin, dort wird es mitbenutzt.**
*Machbarkeit:* klein.

**18. Aufmaß- und Positionsrechner** — Positionen mit Bezeichnung, Menge, Einheit, Preis;
Summen; Export als Text, CSV oder PDF.
*Lage:* Eigene Logik; PDF über die **vorhandene** `pdf-lib`-Engine, Speicherung über
`idb-keyval`.
*Machbarkeit:* mittel. Anderes Eingabemodell (Liste) → eigenes Werkzeug.

### F. Querschnitt der Suite

**19. Verlauf und Speicher** — gemeinsamer Verlauf über alle Modi, benannte Variablen.
*Lage:* `idb-keyval` (Apache-2.0, 55 kB) genügt; `dexie` (3,2 MB) ist überdimensioniert.
*Machbarkeit:* klein. **Muss einmal gebaut werden, nicht je Rechner.**

**20. Tastatur- und Vorlesebedienung** — vollständige Tastaturbedienung, ARIA, einstellbare
Anzeigegröße.
*Lage:* Keine Bibliothek — Haltung. SpeedCrunch als Vorbild (Q1).
*Machbarkeit:* Aufwand, aber kein technisches Risiko. **Bei einem Rechner keine Kür: ein
Rechner ohne Tastaturbedienung ist kaputt.**

**21. Formel und Quelle** — je Rechner die Formel im Klartext, Annahmen, Quellen, Datum der
letzten Prüfung.
*Lage:* Vorbild Free Tool Arena (Q6). Eigener Baustein.
*Machbarkeit:* klein, aber **inhaltlich die Voraussetzung dafür, dass die Handwerkerrechner
später überhaupt gebaut werden dürfen** (Normfrage).

---

## Gruppierung — was sich zusammenfassen lässt

Die Recherche ändert die naheliegende Einteilung. Nicht das **Thema** verbindet die Rechner,
sondern das **Eingabemodell**. Rechner mit gleicher Eingabe und gleicher Ausgabe teilen sich
Oberfläche, Verlauf und Bedienung — getrennt gebaut wären sie dreimal dieselbe Arbeit.

**Gruppe 1 — Ausdrucksrechner.** Eingabe ist ein Ausdruck, Ausgabe eine Zahl.
Standard, wissenschaftlich, Programmierer, RPN, Bruch.
Gemeinsamer Kern: **Parser + Zahlenmodell + Verlauf.** Die Modi unterscheiden sich nur in
Funktionsumfang und Tastenbelegung.
→ **ein Werkzeug mit umschaltbaren Modi.**

**Gruppe 2 — Umrechner.** Eingabe ist ein Wert mit Einheit, Ausgabe ein Wert mit anderer Einheit.
Einheiten, Zahlensysteme, Zoll, Winkel.
Gemeinsamer Kern: **Faktorentabelle + Zielauswahl.**
→ **ein Werkzeug mit Kategorien.**

**Gruppe 3 — Kaufmännisch.** Eingabe sind Beträge und Prozentsätze, Ausgabe ist ein Plan.
Prozent, Marge, Zins, Tilgung.
Gemeinsamer Kern: **Prozentlogik + Planausgabe.**
→ **ein Werkzeug.**

**Gruppe 4 — Zeit und Datum.** Eingabe sind Daten und Zeitspannen, Ausgabe eine Spanne oder
ein Fristende. Datum, Fristen, Zeitdauern.
Gemeinsamer Kern: **Datumsarithmetik + Feiertagskalender.**
→ **ein Werkzeug.**

**Gruppe 5 — eigene Oberflächen.** Hier trägt das Eingabemodell die Gruppierung nicht mehr:
Plotter (Funktion), Statistik (Datenliste), Gleichungslöser (Gleichung), Aufmaß (Positionen).
→ **je ein eigenes Werkzeug.**

**Ergebnis: acht Werkzeuge in der Suite „Rechnen".**

| # | Werkzeug | enthält |
|---|---|---|
| 1 | Rechner | Standard, wissenschaftlich, Programmierer, RPN, Bruch |
| 2 | Umrechnen | Einheiten, Zahlensysteme, Zoll und Maß, Winkel |
| 3 | Kaufmännisch | Prozent, Marge, Zins, Tilgung |
| 4 | Zeit und Datum | Datum, Fristen, Zeitdauern |
| 5 | Funktionsplotter | Funktionen, Wertetabelle, Nullstellen |
| 6 | Statistik | Datenliste, Kennwerte, Regression |
| 7 | Gleichungslöser | linear, quadratisch, Systeme |
| 8 | Aufmaß | Positionen, Summen, Export |

Querschnittsbausteine (Verlauf, Tastaturbedienung, Formel-und-Quelle) gehören **nicht** in
eigene Werkzeuge, sondern in gemeinsame Bausteine, die alle acht nutzen.

---

## Was aufgenommen würde — und was nicht

**Neue Abhängigkeiten, vorgeschlagen (alle erlaubte Lizenz):**
`fraction.js` (MIT), `decimal.js` (MIT), `feiertagejs` (MIT), `function-plot` (MIT),
`simple-statistics` (ISC), `idb-keyval` (Apache-2.0).
Dazu **eine offene Entscheidung** bei der Ausdrucksauswertung (Q7) und eine bei den
Einheiten (`convert` oder `unitmath` oder eigene Tabelle).

**Ausgeschieden, mit Grund:**
- `Qalculate`, `SpeedCrunch`, `ConverterNOW` — **GPL** und/oder Desktop
- `date-holidays` — Daten unter **CC-BY-SA-3.0** (Lizenzdatei gelesen)
- `jstat` — **keine Lizenzangabe**
- `0thernes/professional-calculator` — Lizenz **„Other"**, nicht bestimmbar
- `expression-eval` — ausdrücklich nicht mehr gepflegt
- `@cortex-js/compute-engine` (48 MB), `jsxgraph` (75 MB), `mathjs` (9,2 MB),
  `plotly.js-dist-min` und `chart.js` (je 6 MB), `mathlive` (5,6 MB) — **Größe**
- `number-to-words`, `written-number` — alt und ohne deutsche Zahlwörter
- `date-fns`, `dayjs`, `luxon`, `@js-temporal/polyfill` — für diesen Umfang überdimensioniert
- **Währungsrechner** — auf Thomas' Wunsch nicht aufgenommen

**Als Referenz gelesen, nicht als Abhängigkeit:**
`OmniSolver-public` (MIT — Architektur-Vorbild, Q2), `TEJAS-MK2/Calculator` (Apache-2.0),
`ee-calc` (RPN), `alt-romes/programmer-calculator`, Free Tool Arena (Formel-Quellenangabe).

---

## Empfehlung für den Anfang

**Welle 1: Werkzeug 1 (Rechner) im Modus Standard + Bruch, mit Verlauf und Tastaturbedienung.**
Begründung: Es erprobt alle vier Querschnittsbausteine (Zahlenmodell, Parser, Verlauf,
Formel-und-Quelle) an der einfachsten Oberfläche. Wenn die stehen, sind die übrigen sieben
Werkzeuge überwiegend Fachlogik — nicht Technik.

**Vorher zu entscheiden:** die Ausdrucksauswertung (Q7) und ob „Formel und Quelle" schon in
Welle 1 Pflicht wird (Q6). Meine Empfehlung: beides ja.

## Offene Punkte

- [ ] **Ausdrucksauswertung entscheiden:** eigener Parser, `math-expression-evaluator` oder
      `expr-eval`. Beeinflusst Größe, Sicherheit und CSP.
- [ ] **Nicht geprüft:** ob `function-plot`, `simple-statistics`, `feiertagejs` und `convert`
      wirklich browserfähig sind (Node-Abhängigkeiten, `fs`, `Buffer`) und was sie im Browser
      tatsächlich kosten. Registry-Größen sind das ganze Paket, nicht das Bündel.
- [ ] **Nicht geprüft:** Herkunft der Feiertagstermine in `feiertagejs` (Fakten gegen
      geschützte Zusammenstellung).
- [ ] **Nicht geprüft:** ob `BigInt`-Arithmetik in allen Zielbrowsern des Projekts verfügbar
      ist (für Programmierer- und Zahlensystemrechner zwingend).
- [ ] Kein Probeaufbau erfolgt — alle Urteile sind Papierurteile mit Quelle.

## Nachtrag 2026-10-03, Faber: GPL ist kein Ausschlussgrund — die Begründung war zu pauschal

Auf Nachfrage von Thomas geprüft. Die Ausschlüsse oben bleiben in der Sache richtig, die
**Begründung** war falsch gewichtet. Richtigstellung:

- **`licenses/policy.json` verbietet GPL nicht.** Die Datei hat zwei Listen:
  `allowedExpressions` (ohne weitere Prüfung erlaubt) und `reviewRequired` (prüfpflichtig).
  GPL steht in der zweiten — das ist eine Bringschuld, kein Verbot.
- **GPL-3.0 ist mit AGPL-3.0 kombinierbar.** FSF, „License Compatibility and Relicensing":
  „you can include source code under the GNU GPL version 3 together with other source code
  under the GNU Affero GPL in a single combined program." §13 beider Lizenzen ist dafür
  gebaut. Das Gesamtwerk trägt dann AGPL — bei uns ohnehin die Projektlizenz.
- **Harter Ausschluss ist nur `GPL-2.0-only`** (FSF-Lizenzliste: die AGPL ist „not compatible
  with GPLv2"). Bei `GPL-2.0-or-later` ist auf 3.0 wählbar und die Kombination wieder zulässig.
- **Präzedenz im Projekt, belegt:** MuPDF wird für M4 eingesetzt und steht in
  `licenses/registry.json` mit der Lizenz `AGPL-3.0-or-later` (Version 1.28.1, Artifex
  Software). Die Variante `AGPL-3.0-or-later` steht in `allowedExpressions` — sie ist also
  nicht nur geduldet, sondern ausdrücklich erlaubt. Eine Copyleft-Engine steckt damit längst
  im Projekt und wird über die Lizenzdatenbank transparent geführt.

**Korrigierte Begründung je Kandidat:**

| Kandidat | Lizenz | Ausschlussgrund |
|---|---|---|
| Qalculate | GPL-2.0-or-later | **nur technisch** (Desktop, C++/Qt) |
| SpeedCrunch | GPL-2.0-or-later | **nur technisch** (Desktop, C++/Qt) |
| ConverterNOW | GPL | **nur technisch** (Android/Desktop-App) |

Alle drei wären lizenzrechtlich über „or later" auf GPL-3.0 wählbar und damit mit
`AGPL-3.0-only` kombinierbar. Der Satz „Sie scheiden doppelt aus: Lizenz und Plattform" oben
ist auf **einen** Grund zurückzuführen.

**Was von der Liste oben unverändert gilt:** `date-holidays` (Daten unter CC BY-SA 3.0),
`jstat` (keine Lizenzangabe), `0thernes/professional-calculator` (Lizenz „Other") und der
Größenblock — diese Ausschlüsse tragen weiterhin.

## Nachtrag 2026-10-03, Faber: zwei Zähl- und Zuordnungsfehler in diesem Konzept

Bei der Beantwortung der Frage „welche Rechner gehen problemlos" gegen den eigenen Text
geprüft. Zwei Fehler, alter Wortlaut bleibt oben stehen:

**1. Die Zahl „Es bleiben 23" (Abschnitt „Die Rechnerarten") ist falsch.**
Die Liste führt **18 Rechnerarten** (1–18) und **3 Querschnittsbausteine** (19–21), also
21 Einträge. Die 23 stammt aus der ersten Chat-Fassung, in der noch einzeln gezählt wurde;
im Konzept sind mehrere Arten zusammengefasst worden (etwa „Prozent- und Kaufmannsrechner").
Richtig ist: **18 Rechnerarten, 3 Querschnittsbausteine.**

**2. Die Geometrie (Nr. 17) fehlt in der Gruppierung.**
Gruppe 1 nennt 5, Gruppe 2 nennt 4, Gruppe 3 nennt 4, Gruppe 4 nennt 3, Gruppe 5 nennt 4
Positionen. Gruppe 2 enthält in Wahrheit nur drei Einträge (Zoll, Zahlensysteme, Einheiten —
„Winkel" ist kein eigener Eintrag, sondern Teil des Einheitenrechners), und **Nr. 17
(Geometrie) ist in keiner Gruppe zugeordnet.** Die Rechnung „5+4+4+3+4" geht daher nicht auf.

**Korrektur — Geometrie wird ein eigenes Werkzeug:**
Sie hat ein eigenes Eingabemodell (Maße → Fläche/Volumen/Oberfläche) und wird auch ohne
Aufmaß gebraucht; eine Zuordnung zum Aufmaß würde sie unnötig an eine Positionsliste binden.
Die Gruppierung lautet damit:

| Gruppe | Werkzeug | enthält |
|---|---|---|
| 1 | Rechner | Standard, wissenschaftlich, Programmierer, RPN, Bruch |
| 2 | Umrechnen | Einheiten **und Winkel**, Zahlensysteme, Zoll und Maß |
| 3 | Kaufmännisch | Prozent, Marge, Dreisatz, Zins, Tilgung |
| 4 | Zeit und Datum | Datum, Fristen, Zeitdauern |
| 5 | Funktionsplotter | Funktionen, Wertetabelle, Nullstellen |
| 6 | Statistik | Datenliste, Kennwerte, Regression |
| 7 | Gleichungslöser | linear, quadratisch, Systeme |
| 8 | Geometrie | Flächen, Umfang, Volumen, Oberfläche |
| 9 | Aufmaß | Positionen, Summen, Export |

**Ergebnis: neun Werkzeuge, nicht acht.** Die Zuordnung „Flächen für unregelmäßige Räume
gehört zur Geometrie und wird vom Aufmaß mitbenutzt" bleibt bestehen.

## Nachtrag 2026-10-03, Faber: Parser-Kandidaten im Detail geprüft — der Blocker ist das Zahlenmodell

Auf Nachfrage von Thomas beide Kandidaten-READMEs gelesen (npm, 2026-10-03). Zwei Befunde,
die die Entscheidung aus Q7 praktisch vorentscheiden:

**1. Beide Kandidaten rechnen in JavaScript-`Number`, also IEEE-754-Gleitkomma.**
Belege aus den READMEs: `expr-eval` bezieht seine Konstanten aus der Laufzeit
(„E — The value of `Math.E` from your JavaScript runtime", „PI — The value of `Math.PI`") und
kann Ausdrücke in native JavaScript-Funktionen übersetzen (`toJSFunction`). Das
`math-expression-evaluator`-README zeigt als Ergebnis `0.017261434031253`.
Damit gilt in beiden: `0,1 + 0,2 = 0.30000000000000004` — **genau der Fall, der nach Q4
ausgeschlossen wurde.**

**Ein fertiger Parser bringt sein Zahlenmodell mit.** Die Operatoren (`+`, `*`) sind im
Parser-Kern auf `Number` verdrahtet; austauschbar sind laut README nur Funktionen und
Konstanten (`parser.functions`, `parser.consts`), nicht die Arithmetik. `fraction.js` oder
`decimal.js` lassen sich also nicht einfach einhängen.

**2. `math-expression-evaluator` weicht bewusst von der Mathematik ab.**
Das README dokumentiert selbst: „**2^3** | 8 | Exponent (note this operator is **left
associative** like MS Office)". Linksassoziativ heißt: `2^3^2` ergibt **64**, mathematisch
korrekt ist 2^(3^2) = **512**. `expr-eval` macht es richtig — seine Rangfolgetabelle führt
`^` als „Right"-assoziativ.

**Ein wissenschaftlicher Rechner, der `2^3^2` falsch rechnet, ist unbrauchbar.** Damit
scheidet `math-expression-evaluator` für Werkzeug 1 aus.

**Weitere belegte Anforderungen an den Parser** (aus `expr-evals` Rangfolge- und
Operatorentabelle, als Prüffälle für eine Eigenlösung):
- `^` rechtsassoziativ, `*,/` linksassoziativ
- unäres Minus hat „normal precedence" (also `-2^2` = −4, nicht 4)
- `sin x^2` ist `sin(x^2)`, aber `sin(x)^2` ist `(sin x)^2`
- Gradmaß umschaltbar: `math-expression-evaluator` kennt Degree- und Radian-Modus explizit
- `!` Fakultät mit Gamma-Fortsetzung für Nicht-Ganzzahlen (expr-eval)

**Folge für die Optionen:**
- `expr-eval` — korrekte Rangfolge, 0 Abhängigkeiten, aber Gleitkomma und **7 Jahre ohne
  Veröffentlichung**; die Operatoren umzubauen hieße, den Kern zu ersetzen.
- `math-expression-evaluator` — **ausgeschieden** (linksassoziativer Exponent).
- `mathjs` — löst Parser, BigNumber, Fraction und Einheiten in einem, kostet aber 9,2 MB.
- **Eigener Parser** — Tokenizer, Rangfolge-Auswertung (Shunting-Yard) und Auswerter direkt
  auf `fraction.js`/`decimal.js`. Erfüllt die Genauigkeitsanforderung von Anfang an, keine
  Abhängigkeit, kein Größenbudget, und jeder der Prüffälle oben wird ein Testfall.

**Empfehlung: eigener Parser.** Nicht weil er billiger ist, sondern weil die fertigen Parser
die gesetzte Genauigkeitsanforderung nicht erfüllen — und ein nachträglicher Wechsel des
Zahlenmodells die halbe Oberfläche mitzieht.

**Noch nicht geprüft:** ob sich bei `expr-eval` die Operatoren doch auf ein anderes
Zahlenmodell umbiegen lassen. Nach dem README ist das nicht vorgesehen; das ist eine
Erwartung, kein Befund.

## Nachtrag 2026-10-03, Faber: Größenangaben falsch — Empfehlung „eigener Parser" zurückgezogen

Auslöser war Thomas' Frage, ob es einen eigenen Parser, der unseren Ansprüchen genügt, nicht
längst geben müsste. **Er hat recht. Er heißt `mathjs`, und ich habe ihn mit einer falschen
Zahl weggeworfen.**

**Messung (jsDelivr, 2026-10-03):** Registry-Gesamtgröße gegen die größte Nutzdatei gestellt.

| Paket | Registry gesamt | größte Nutzdatei | Korrektur |
|---|---:|---:|---|
| `mathjs` | 9.213 kB | **634,5 kB** (`lib/browser/math.js`) | war „zu groß" — **falsch** |
| `chart.js` | 6.034 kB | **406,7 kB** | war „zu groß" — **falsch** |
| `jstat` | 690 kB | 126,9 kB | klein (Lizenz bleibt offen) |
| `unitmath` | 483 kB | 116,3 kB | klein |
| `nerdamer` | 3.019 kB | 528,1 kB | vertretbar |
| `mathlive` | 5.606 kB | 1.518,0 kB | wirklich groß |
| `plotly.js-dist-min` | 6.010 kB | 4.702,9 kB | wirklich groß ✓ |
| `jsxgraph` | 75.633 kB | 4.486,4 kB | wirklich groß ✓ |
| `@cortex-js/compute-engine` | 48.454 kB | 7.380,8 kB | wirklich groß ✓ |

Die Registry-Zahl zählt 2.540 Dateien — Sourcemaps, TypeScript-Deklarationen, Changelog,
Testdateien. Im Browser landet `lib/browser/math.js`. **Genau der Fehler, den der Prüf-Skill
als Pitfall führt — und ich bin hineingelaufen.**

**Der entscheidende Befund:** `mathjs` hängt laut Registry direkt an **`decimal.js` und
`fraction.js`** — also an genau den beiden Bibliotheken, die oben als Bausteine genannt sind.
`mathjs` ist damit nicht „eine große Alternative", sondern **die fertige Kombination aus
Parser, exakter Dezimalarithmetik, exakten Brüchen und Einheiten**, die dieses Konzept sonst
selbst zusammensetzen wollte. Apache-2.0, aktiv gepflegt (15.2.0, 2026-04).

**Damit ist die Empfehlung „eigener Parser" zurückgezogen.** Sie war eine Präferenz auf einer
ungemessenen Zahl, kein Befund. Zusätzlich verlangt **ADR 0001 („Open Source vor
Eigenentwicklung")**: Eigenentwicklung nur, wenn keine adäquate Lösung existiert **oder alle
Kandidaten an einem dokumentierten Muss-Kriterium scheitern**. Ein solches Scheitern ist hier
nicht dokumentiert.

**Was von der Analyse oben trägt:**
- Der Befund zu `math-expression-evaluator` bleibt gültig und belegt: linksassoziativer
  Exponent (`2^3^2` = 64 statt 512). Dieser eine Kandidat scheidet aus.
- `expr-eval` bleibt eingefroren und rechnet in Gleitkomma — als **Vergleichsmaßstab**.
- Die Genauigkeitsanforderung (Q4) bleibt richtig. Sie ist nur **erfüllbar** — durch `mathjs`.

**Neue Empfehlung:** `mathjs` als Kandidat ernsthaft prüfen, und zwar **aus kuratierten
Factories statt aus dem `all`-Bündel** (so macht es `OmniSolver-public`). Vor der Entscheidung
messen, was das tatsächlich gebündelt kostet. Der Vergleich lautet dann nicht mehr
„eigener Parser gegen Gleitkomma-Parser", sondern **„mathjs mit kuratierten Factories gegen
Eigenbau"** — und bei dieser Frage liegt die Beweislast nach ADR 0001 beim Eigenbau.

## Nachtrag 2026-10-03, Faber: Übertragungsgrößen gemessen — mathjs ersetzt vier der sechs Bausteine

**Gemessen** (CDN-Auslieferung, `gzip -9`, 2026-10-03) — das ist die Zahl, die zählt, nicht die
Registry-Größe:

| Paket | roh | **gzip** |
|---|---:|---:|
| `mathjs` (Browser-Bündel) | 649.724 B | **174.720 B (170,6 KiB)** |
| `nerdamer` | 540.799 B | 134.704 B (131,5 KiB) |
| `function-plot` | 202.953 B | 59.870 B (58,5 KiB) |
| `simple-statistics` | 169.699 B | 44.822 B (43,8 KiB) |
| `unitmath` | 119.109 B | 22.897 B (22,4 KiB) |
| `expr-eval` (min) | 25.276 B | 7.584 B (7,4 KiB) |
| `feiertagejs` | 28.087 B | 6.726 B (6,6 KiB) |
| `idb-keyval` | 9.866 B | 2.408 B (2,4 KiB) |

**Einordnung:** `mathjs` kostet praktisch so viel wie `pdf-lib` — im Projekt mit rund **178 kB
gzip** gemessen und bereits als **nachgeladene** Engine im Einsatz. Die Größe ist damit kein
Hindernis, sondern eine bekannte Größenordnung. **Bedingung:** `mathjs` darf nie im
Startbündel landen (das Budget liegt bei 250 KiB gzip; mathjs allein belegt davon 68 %),
sondern ausschließlich dynamisch in den Rechner-Routen.

**Was `mathjs` belegt abdeckt** (Funktionsreferenz `mathjs.org/docs/reference/functions.html`,
2026-10-03 gelesen):

- **Parser:** `parse`, `compile`, `evaluate`, `parser`
- **Zahlenmodelle:** `bignumber` (beliebige Präzision), `fraction`, `bigint`, `numeric`,
  `typeOf` — aufgebaut auf `decimal.js` und `fraction.js`
- **Einheiten:** `unit`, `to`, `toBest`, `createUnit`, `splitUnit` — mit eigener
  Einheitenregistrierung
- **Gleichungssysteme und lineare Algebra:** `lusolve`, `lsolve`, `usolve`, `qr`, `lup`,
  `schur`, `matrix`, `sparse`
- **Polynomwurzeln:** `polynomialRoot` — **numerisch**, bis kubisch
- **Symbolische Umformung:** `derivative`, `simplify`, `rationalize`, `symbolicEqual`
- **Zahlentheorie:** `isPrime`; dazu Trigonometrie, Logarithmen, komplexe Zahlen
- **Statistik:** im gelesenen Auszug **nicht gesehen** — die Doku hat einen eigenen
  Statistikabschnitt; Beleg steht aus.

**Folge — die Abhängigkeitsliste schrumpft:** `mathjs` **enthält** `decimal.js` und
`fraction.js`, bringt Einheiten (`unit`) und Statistik mit. Damit werden die oben einzeln
vorgeschlagenen Bausteine `fraction.js`, `decimal.js`, `convert`/`unitmath` und
`simple-statistics` **überflüssig**, sobald `mathjs` für Werkzeug 1 aufgenommen ist — vier von
sechs. Es bleiben: `mathjs`, `function-plot`, `feiertagejs`, `idb-keyval` — und `nerdamer`
nur, falls symbolische Gleichungslösung gebraucht wird.

**Nicht belegt:** Ob `mathjs` mit kuratierten Factories deutlich unter 170,6 KiB kommt, und
wie viel davon nach dem Bau und Tree-Shaking im Bündel bleibt. Beides ist ungemessen.

## Nachtrag 2026-10-03, Faber: Fristenrechner gestrichen, Kalenderrechner aufgenommen (mit OSS-Prüfung)

### Fristenrechner (Nr. 12) — gestrichen auf Thomas' Wunsch

Grund (trägt): `feiertagejs` ist **rein deutsch**. Für ein dreisprachiges Projekt bräuchte es
Feiertagsdaten je Land, und der einzige breite Kandidat `date-holidays` ist über die
**Datenlizenz (CC BY-SA 3.0)** gesperrt. Datenpflege pro Land ohne gesicherte Quelle — der
Aufwand steht in keinem Verhältnis. **Feiertage und Fristen entfallen.**

Werkzeug 4 „Zeit und Datum" enthält damit nur noch **Datum und Zeitdauern**.

### Kalenderrechner — neu aufgenommen

**Was:** Ein Datum in die verschiedenen Kalendersysteme umrechnen und zurück.

**Gemessen in Node 22 (dessen ICU), 2026-10-03:** Der Browser kennt die Kalender bereits über
`Intl.DateTimeFormat` mit der Option `-u-ca-<kalender>`. `Intl.supportedValuesOf('calendar')`
liefert **18 Kalender**: buddhist, chinese, coptic, dangi, ethioaa, ethiopic, gregory, hebrew,
indian, islamic, islamic-civil, islamic-rgsa, islamic-tbla, islamic-umalqura, iso8601,
japanese, persian, roc.

Beispiel für 2026-10-03: gregorianisch 3. Oktober 2026 · japanisch 8 Reiwa · buddhistisch
2569 BE · indisch 11. Ashvina 1948 Śaka · persisch 11. Mehr 1405 AP · hebräisch 22. Tischri
5787 AM · chinesisch 23. M08 bing-wu.

**Fachlicher Befund, der den Rechner rechtfertigt:** Die vier islamischen Varianten liefern für
denselben Tag **verschiedene Daten** — `islamic`/`islamic-umalqura` den 22., `islamic-tbla` den
21., `islamic-civil` den 20. Rabiʻ II 1448. Ein Rechner, der nur „islamisch" anbietet,
verschweigt das. Die Anforderung „Formel und Quelle" (Q6) ist hier keine Pflichtübung, sondern
Bedingung für eine nicht irreführende Anzeige.

**Grenzen des nativen Wegs:** `Intl` ist eine **Einbahnstraße** — es formatiert von einem
Zeitpunkt in einen Kalender, **parsen kann es nicht**. Der Rückweg (Kalenderdatum →
gregorianisch) braucht eigene Arithmetik. Außerdem ist die Ausgabe nicht überall vollständig
(chinesisch: „23. M08 bing-wu", ohne Jahresangabe).

### Open-Source-Prüfung (Registry-Inventar über 20 Kandidaten, 5,3 s)

| Kandidat | Lizenz (Registry) | Stand | Bewertung |
|---|---|---|---|
| `@js-temporal/polyfill` | ISC | 2025-03 | **Kandidat** — TC39-Referenz |
| `temporal-polyfill` | MIT | 2026-09 | Kandidat (fullcalendar) |
| `temporal-polyfill-lite` | MIT | 2026-09 | Kandidat, kleiner |
| `moment-hijri` | MIT | 2024-10 | nur ein Kalender, braucht moment |
| `jalaali-js` | MIT | **2026-08** | nur persisch, aktiv |
| `moment-jalaali` | MIT | 2026-08 | nur persisch, braucht moment |
| `date-fns-jalali` | MIT | 2026-05 | nur persisch |
| `ummalqura` | MIT | 2026-06 | nur islamisch (Umm al-Qura) |
| `hijri-date` | MIT | **2017** | eingefroren |
| `julian` | MIT | **2017** | eingefroren |
| `astronomia` | MIT | 2025-08 | Astronomie, 18 MB Registry — überdimensioniert |
| `intl` (Intl.js) | MIT | **2016** | veraltet, für moderne Browser unnötig |
| `@hebcal/core` | **GPL-2.0** | 2026-10 | **ausgeschieden** (s. u.) |
| `hebcal` | GPL-3.0+ | 2019 | ausgeschieden, deprecated |
| `hijri-date-converter` | **keine Angabe** | — | ausgeschieden |
| `cal-date`, `islamic-calendar`, `convert-hijri` | — | — | **Paketnamen falsch** (nicht gefunden) |
| `moment` | MIT | 2026-09 | Altbestand, in Maintenance |
| `dayspan` | MIT | 2019 | eingefroren |

**`@hebcal/core` ist der harte Ausschluss:** **GPL-2.0**. Nach FSF ist die AGPL „not compatible
with GPLv2" — bei `GPL-2.0-or-later` wäre auf 3.0 wählbar, bei `GPL-2.0` nicht. Das Paket ist
zudem mit 3,8 MB Registry und hebräischen Feiertagen deutlich mehr, als gebraucht wird.

### Gemessene Übertragungsgrößen (gzip -9, 2026-10-03)

| Paket | roh | **gzip** |
|---|---:|---:|
| `@js-temporal/polyfill` (`dist/index.esm.js`) | 128.868 B | **36.033 B (35,2 KiB)** |
| `@js-temporal/polyfill` (`dist/index.umd.js`) | 242.064 B | 57.754 B (56,4 KiB) |

**Ergebnis des OSS-Checks — zwei Wege, beide gangbar:**

- **Nativ `Intl`** — **0 kB**, 18 Kalender, aber nur vorwärts. Rückweg als eigene Arithmetik.
- **`@js-temporal/polyfill`** — **35,2 KiB gzip** (ESM), ISC, aktiv gepflegt (TC39-Referenz).
  Kann **beide Richtungen**: `Temporal.PlainDate.from()` liest ein Datum samt Kalenderannotation
  (RFC 9557 Strings), `withCalendar()` rechnet zwischen Kalendern um. Deckt zusätzlich die
  **Datumsarithmetik** ab — bedient also Werkzeug 4 „Zeit und Datum" gleich mit.

**Empfehlung:** `@js-temporal/polyfill`. Der Aufpreis von 35 KiB kauft den Rückweg, die
Datumsarithmetik und eine gepflegte Referenzimplementierung statt eigener Kalenderarithmetik
mit eigenem Fehlerraum. Damit wäre auch der eingefrorene Eigenbau-Verdacht bei Werkzeug 4
erledigt. (`temporal-polyfill-lite` bleibt als kleinere MIT-Alternative zu prüfen.)

**Nicht geprüft:**
- ob die 18 Kalender auch im **Zielbrowser** (Edge/Chrome) verfügbar sind — gemessen wurde in
  Node 22. `Intl.supportedValuesOf` gibt es ab Chrome/Edge 99.
- ob `@js-temporal/polyfill` die **islamischen Varianten** in derselben Vollständigkeit
  anbietet wie `Intl` — die Kalenderliste ist von ICU abhängig.
- ob Temporal in absehbarer Zeit nativ verfügbar ist (MDN: „not Baseline") — bis dahin Polyfill.
- Genaue gzip-Größen von `temporal-polyfill-lite` (Chunk-Aufteilung, Shims statt Hauptdatei).

## Nachtrag 2026-10-03, Faber: Messprotokoll Kalenderrechner — Polyfill mit vier defekten Kalendern

Gemessen, nicht nachgeschlagen. Werkzeuge: Edge 154 headless (`--dump-dom`), Node 22.23.2,
esbuild-Bündelung. Wegwerf-Umgebung unter `%LOCALAPPDATA%\Temp\ct-oss\`, nichts im Projekt
installiert.

### M1 — Kalenderliste im echten Browser (Edge 154 headless)

**18 Kalender, identisch mit Node/ICU:** buddhist, chinese, coptic, dangi, ethioaa, ethiopic,
gregory, hebrew, indian, islamic, islamic-civil, islamic-rgsa, islamic-tbla, islamic-umalqura,
iso8601, japanese, persian, roc. `Intl.DateTimeFormat` formatiert **alle 18 fehlerfrei**,
einschließlich chinesisch.

### M2 — Temporal ist in Edge 154 nativ vorhanden

`typeof Temporal === 'object'` — **ja**. Und nativ ist es **fehlerfrei**: alle 18 Kalender,
Round-Trip für hebräisch geprüft (`5787-M01-22` → `2026-10-03`). MDN führt Temporal als
„not Baseline"; in Chromium 154 ist es da. Für ältere Browser bleibt ein Polyfill nötig —
das ist eine **Feature-Abfrage zur Laufzeit** (`typeof Temporal !== 'undefined'`), keine
Bauzeitentscheidung.

### M3 — `@js-temporal/polyfill` 0.5.1, gebündelt gemessen

esbuild, `--bundle --minify --format=esm --target=es2020`, inklusive der Abhängigkeit `jsbi`:

| | Wert |
|---|---:|
| roh | 162.171 B |
| **gzip -9** | **46.866 B (45,8 KiB)** |

(Die reine CDN-Datei `dist/index.esm.js` war 35,2 KiB gzip — die Differenz ist Bündelung und
`jsbi`.)

### M4 — Funktionsprüfung über den ganzen Eingaberaum: 4 von 17 Kalendern defekt

Round-Trip (Kalenderdatum → gregorianisch) je Kalender geprüft:

**OK (13):** gregory, iso8601, hebrew, islamic-umalqura, islamic-civil, islamic-tbla,
islamic-rgsa, indian, persian, ethioaa, japanese, buddhist, roc.

**DEFEKT (4):**
- `coptic` — `RangeError: Era am (ISO year 1743) was not matched by any era`
- `ethiopic` — `RangeError: Era am (ISO year 2019) was not matched by any era`
- `chinese` — `RangeError: Unexpected leap month suffix: Mo8`
- `dangi` — derselbe Fehler

**Wichtig zur Einordnung:** Die **Formatierung** (`toLocaleString`) funktioniert im Polyfill
für **alle** 18 Kalender — defekt ist der **Feldzugriff und damit der Rückweg** bei diesen vier.
Das native Temporal in Edge hat den Fehler **nicht**.

### M5 — Zwei Umsetzungsbefunde, die leicht zu Fehlern führen

1. **`withCalendar()` ändert die ISO-Werte nicht.** `PlainDate.from('2026-10-03').withCalendar('chinese').toString()`
   ergibt `2026-10-03[u-ca=chinese]` — die ISO-Werte bleiben, nur die Interpretation wechselt.
   Die Kalenderwerte stehen ausschließlich in `.year`/`.month`/`.day` oder `toLocaleString`.
2. **`equals()` vergleicht auch den Kalender.** `PlainDate.from('2026-10-03')` (iso8601) und das
   Ergebnis eines Rückwegs (gregory) sind **nicht** gleich, obwohl sie denselben Tag bezeichnen.
   In meinem ersten Prüflauf hat das alle 13 funktionierenden Kalender fälschlich als
   „ABWEICHUNG" gemeldet — der Fehler lag im Test, nicht in der Bibliothek.
3. **Für den Rückweg `monthCode` statt `month` verwenden.** Beim hebräischen Kalender liefert
   `withCalendar('hebrew')` für den 22. Tischri `month=1, monthCode=M01`. Die **angezeigte**
   Monatsnummer hat mit dem **Index** nichts zu tun; `monthCode` ist eindeutig, und ohne ihn
   hatte ich in einem früheren Lauf fälschlich 2027-03-31 statt 2026-10-03 erhalten.

### Folgerung für den Kalenderrechner

- **Vorwärts (Datum → Kalender):** `Intl.DateTimeFormat`, **0 kB**, alle 18 Kalender, in allen
  Browsern. Das ist der Weg.
- **Rückweg (Kalenderdatum → gregorianisch):** natives Temporal, wenn vorhanden
  (Chromium 154+), sonst der Polyfill mit 45,8 KiB — **mit dem Vorbehalt, dass coptic,
  ethiopic, chinese und dangi dort nicht funktionieren.** Diese vier entweder als
  „nicht unterstützt" kennzeichnen oder aus eigener Arithmetik bedienen.
- **Kein Bündel-Zwang:** Der Polyfill lädt nur in Browsern ohne natives Temporal.

**Damit ist der Kalenderrechner machbar und gemessen** — nicht mehr nur geplant.

## Offene Punkte — bereinigter Stand 2026-10-03

*Die Liste unter „Offene Punkte" weiter oben ist überholt; sie nennt die Ausdrucksauswertung und
`feiertagejs` als offen, was inzwischen entschieden beziehungsweise gestrichen ist. Hier der
gültige Stand. Erledigtes ist mit Grund vermerkt, damit nachvollziehbar bleibt, warum es
verschwunden ist.*

### A. Entscheidungen, die ausstehen

- [ ] **`mathjs` aufnehmen — ja oder nein.** Das ist der Angelpunkt: nimmt es die Suite auf,
      entfallen `fraction.js`, `decimal.js`, `convert`/`unitmath` und `simple-statistics` als
      eigene Bausteine. Nach ADR 0001 liegt die Beweislast beim Eigenbau, nicht bei der
      Bibliothek.
- [ ] **Formel-und-Quelle in Welle 1 verpflichtend oder später.** Meine Empfehlung: ja, von
      Anfang an — es ist der Baustein, der die Handwerkerrechner später erst zulässig macht.
- [ ] **Symbolische Gleichungslösung nötig?** `mathjs` kann Ableitung, Vereinfachung und
      Polynomwurzeln (numerisch, bis kubisch). Für allgemeine symbolische Auflösung bräuchte es
      `nerdamer` (131,5 KiB gzip). Das ist eine Anforderungsfrage, keine technische.
- [ ] **Einheiten: `mathjs`-`unit` gegen eigene Faktentabelle.** Wenn mathjs ohnehin geladen
      wird, sind die Einheiten bezahlt. Eigene Tabelle kostet 0 kB, aber eigene Arbeit.
- [ ] **Verlauf und Speicher: was gehört hinein.** `idb-keyval` (2,4 KiB gzip) ist gesetzt; die
      inhaltliche Frage (Verlauf über alle Modi? benannte Variablen? Löschverhalten?) ist offen.
- [ ] **Werkzeug 9 „Aufmaß" spezifizieren.** Größter Einzelbaustein, Eingabemodell und
      Ausgabeformat noch nicht festgelegt.

### B. Messungen, die fehlen

- [ ] **`mathjs` mit kuratierten Factories bauen und messen.** Die 170,6 KiB gzip sind das
      vollständige Browser-Bündel. Was nach kuratierten Factories, Bau und Tree-Shaking in der
      Rechner-Route landet, ist **ungemessen** — und genau die Zahl, die über die Aufnahme
      entscheidet. Messung wie beim Kalender: esbuild, `--bundle --minify`, gzip zählen.
- [ ] **Statistik-Funktionen von `mathjs` belegen.** Im gelesenen Auszug der Funktionsreferenz
      nicht gesehen; die Doku hat einen eigenen Statistikabschnitt. Solange das offen ist, ist
      auch offen, ob `simple-statistics` (43,8 KiB gzip) entfällt.
- [ ] **`function-plot` browserfähig?** 58,5 KiB gzip gemessen, aber **nicht im Browser
      ausgeführt**. Node-Abhängigkeiten, `fs`, `Buffer` — ungeprüft.
- [ ] **`BigInt` in allen Zielbrowsern.** Für Programmierer- und Zahlensystemrechner zwingend.
      In Node und Edge vorhanden, für die übrigen Zielbrowser nicht geprüft.
- [ ] **`temporal-polyfill-lite` als kleinere MIT-Alternative.** Chunk-Aufteilung, Shims statt
      Hauptdatei — die echten Übertragungsgrößen sind nicht gemessen.
- [ ] **Ob `expr-eval` die Operatoren auf ein anderes Zahlenmodell umbiegen lässt.** Nach README
      nicht vorgesehen; Erwartung, kein Befund. Nur noch relevant, falls mathjs verworfen wird.

### C. Befunde, die in die Umsetzung einfließen müssen

- [ ] **Vier Kalender im Polyfill defekt** (coptic, ethiopic, chinese, dangi). Für den Rückweg
      entweder als „nicht unterstützt" kennzeichnen oder aus eigener Arithmetik bedienen.
- [ ] **Der Polyfill lädt nur nach Feature-Abfrage.** Natives Temporal ist in Chromium 154
      vorhanden und fehlerfrei; ältere Browser bekommen den Polyfill (45,8 KiB gzip).
- [ ] **`monthCode` statt `month` für den Rückweg** — die angezeigte Monatsnummer ist nicht der
      Index.

### Erledigt oder entfallen (Grund)

- **Ausdrucksauswertung** — entschieden: `mathjs` statt Eigenbau oder der kleinen Parser.
  `math-expression-evaluator` ist belegt ausgeschieden (linksassoziativer Exponent).
- **`feiertagejs`** — entfällt mit dem Fristenrechner (rein deutsch, Internationalität nicht
  leistbar, `date-holidays` datenlizenzrechtlich gesperrt).
- **Kalenderliste im Browser** — gemessen: 18 Kalender in Edge 154, identisch mit Node.
- **`@js-temporal/polyfill` gebündelt** — gemessen: 45,8 KiB gzip.
- **Kein Probeaufbau erfolgt** (früherer Punkt) — inzwischen teilweise erledigt: Kalender und
  Polyfill sind im Wegwerf-Bau gemessen, nicht mehr nur am Papier.

## Nachtrag 2026-10-03, Faber: mathjs entschieden und gemessen — 89,5 KiB statt 185,3 KiB

**Thomas hat `mathjs` angenommen.** Festgehalten als **ADR 0005** (angenommen) mit den
Messwerten als Begründung. Hier das Messprotokoll.

### Messung (esbuild, `--bundle --minify --format=esm --target=es2020`, gzip -9)

| Variante | roh | **gzip** |
|---|---:|---:|
| `create(all)` — vollständig | 661.400 B | 189.733 B (**185,3 KiB**) |
| **kuratiert, ohne `help`** | 323.230 B | **91.631 B (89,5 KiB)** |
| kuratiert **mit** `help` | 412.192 B | 114.653 B (112,0 KiB) |
| kuratiert **plus Einheiten** | 324.014 B | 91.848 B (**89,7 KiB**) |
| nur Parser + Fraction | 317.325 B | 89.974 B (87,9 KiB) |
| `mathjs/number` | 380.883 B | 111.045 B (108,4 KiB) |

**Kuratierte Factories halbieren die Last: 185,3 → 89,5 KiB gzip.**

### Drei Befunde, die die Umsetzung bestimmen

**1. `help` kostet 22,5 KiB gzip — und wird nicht gebraucht.** Die Differenz zwischen „mit help"
und „ohne help" ist genau die eingebettete Hilfe-Doku. Sie besteht aus **englischen
Anzeigetexten** und verstößt damit gegen die Projektregel, keine nutzerseitigen Texte im Code zu
führen. Eigene Hilfetexte kommen aus den Sprachkatalogen. **`helpDependencies` wird nicht
importiert.**

**2. mathjs rechnet standardmäßig in Gleitkomma — die Konfiguration ist Pflicht, nicht Kür.**

| Konfiguration | `0.1 + 0.2` | `1/3 + 1/6` |
|---|---|---|
| Standard (number) | `0.30000000000000004` | `0.5` |
| `{ number: 'BigNumber' }` | **`0.3`** | `0.5` |
| `{ number: 'Fraction' }` | **`3/10`** | **`1/2`** |

Mit `number: 'BigNumber'` ist auch `(0.1 + 0.2) == 0.3` **wahr**. Ohne die Konfiguration ist die
Genauigkeitsanforderung aus Q4 **nicht** erfüllt — die Bibliothek kann sie, liefert sie aber
nicht von selbst.

**3. Bei kuratierten Factories schlägt eine fehlende Funktion zur Laufzeit fehl.** Im Prüflauf
fehlte `log10` (`Undefined function log10`), weil ich `log10Dependencies` nicht aufgeführt hatte.
Der Bau war grün. **Die Suite braucht eine Liste der benötigten Funktionen und einen Test, der
jede einzelne aufruft.**

### Korrektheit nachgewiesen (kuratierte Variante)

`2^3^2` = **512** (rechtsassoziativ, nicht 64) · `-2^2` = **−4** (unäres Minus bindet schwächer
als die Potenz) · `2(3+4)` = **14** (implizite Multiplikation) · `sqrt(81)` = 9 ·
`5 cm + 2 inch` = `10.08 cm` · `format(fraction(1,3))` = `1/3`.

Damit sind genau die Fallen vermieden, an denen `math-expression-evaluator` scheitert.

### Einheiten sind praktisch kostenlos

`unit` + `to` kosten **+0,2 KiB gzip** (91.631 → 91.848 B). Werkzeug 2 „Umrechnen" ist damit
ohne eigenen Baustein zu bauen, sobald der Rechenkern lädt.

### Wie die offene-Punkte-Liste sich damit ändert

- **Erledigt:** „`mathjs` aufnehmen ja/nein" (A) — entschieden, ADR 0005.
- **Erledigt:** „`mathjs` mit kuratierten Factories messen" (B) — gemessen, 89,5 KiB.
- **Erledigt:** „`expr-eval` auf anderes Zahlenmodell umbiegen" (B) — entfällt, mathjs ist gesetzt.
- **Weiter offen:** ob `simple-statistics` entfällt (Statistik-Funktionen von mathjs sind noch
  nicht belegt), `function-plot` im Browser, `BigInt` in allen Zielbrowsern,
  `temporal-polyfill-lite`, Werkzeug 9 spezifizieren, Verlauf-Design.
- **Neu:** Die Liste der benötigten mathjs-Funktionen und ein Test, der jede aufruft.

## Nachtrag 2026-10-03, Faber: offene Punkte abgearbeitet — vier geklärt, vier bleiben Entscheidungen

### GEKLÄRT

**1. Statistik-Funktionen von `mathjs` — vorhanden, `simple-statistics` entfällt.**
Alle geprüft: `mean`, `median`, `std`, `variance`, `quantileSeq`, `mode`, `sum`, `min`, `max`,
`corr`, `mad`, `cumsum` — jede mit eigener `…Dependencies` und aufrufbar. Stichprobe:
`mean([1,2,3,4])` = 2.5, `median` = 2.5, `std` = 1.2909944487358056.
→ **`simple-statistics` (43,8 KiB gzip) wird nicht aufgenommen.** Die Abhängigkeitsliste
schrumpft damit auf **`mathjs` + `function-plot` + `@js-temporal/polyfill` (nach
Feature-Abfrage) + `idb-keyval`**.

**2. `function-plot` ist browserfähig — belegt im Browser, nicht behauptet.**
Gebündelt mit esbuild (IIFE, minifiziert): 219.749 B roh / **66.043 B gzip (64,5 KiB)**.
In Edge 154 headless gerendert: `x^2`, `sin(x)*3` und `sqrt(x)` werden **korrekt gezeichnet**
(Gitter, Achsenbeschriftung, 8 Pfade je Plot, kein Fehlertext); die Sinuswelle visuell geprüft.
Es zieht **keine** Node-Abhängigkeiten — die Abhängigkeiten sind d3-Teilmodule
(`d3-scale`, `d3-shape`, `d3-axis`, `d3-zoom`, …) plus eigene Evaluatoren
(`built-in-math-eval`, `interval-arithmetic-eval`). **`mathjs` wird als Evaluator nicht
gebraucht.**
*Anmerkung:* Die Option `sampler: 'builtIn'` ließ eine Kurve verschwinden — für die Umsetzung
heißt das: die Datenoptionen einzeln prüfen, nicht blind setzen.

**3. `temporal-polyfill-lite` — ausgeschieden.**
Es unterstützt nur **gregorianisch und ISO-8601**; die anderen **15 Kalender** werfen
`RangeError: unsupported calendar`. Größe: **18,0 KiB gzip** — es ist genau deshalb so klein,
weil die Kalender fehlen. Damit ist es für den Kalenderrechner unbrauchbar.
**`@js-temporal/polyfill` (45,8 KiB gzip, 13 von 17 Kalendern) bleibt die Wahl.**

**4. `BigInt` — in Edge vorhanden, `2n**64n` = 18446744073709551616.** Auf diesem Rechner ist
Edge der einzige verfügbare Browser; **Firefox und Safari sind nicht installierbar/installiert
und damit nicht prüfbar.** Der Punkt bleibt als Teilprüfung offen (siehe unten).

### BLEIBT OFFEN — vier Entscheidungen

**A. „Formel und Quelle" in Welle 1 verpflichtend?**
Meine Empfehlung: **ja, von Anfang an.** Es ist der Baustein, der die Handwerkerrechner später
überhaupt zulässig macht (Normfrage), und er ist am einfachsten, solange nur wenige Rechner ihn
brauchen. **Braucht Thomas' Entscheid.**

**B. Symbolische Gleichungslösung über Polynome hinaus?**
`mathjs` deckt bis kubisch (`polynomialRoot`, numerisch) sowie `derivative` und `simplify`.
Für allgemeine symbolische Auflösung bräuchte es `nerdamer` (131,5 KiB gzip).
Meine Empfehlung: **zunächst nicht** aufnehmen; die Anforderung später anhand echter Fälle
entscheiden. **Braucht Thomas' Entscheid.**

**C. Verlauf und Speicher — Design offen.**
`idb-keyval` (2,4 KiB gzip) ist gesetzt. Offen ist, was gespeichert wird: gemeinsamer Verlauf über
alle Modi, benannte Variablen, Aufbewahrungsdauer, Löschverhalten, und ob der Verlauf im
Export („Formel und Quelle") erscheint. Das ist ein Entwurf, keine Messung.

**D. Werkzeug 9 „Aufmaß" spezifizieren.**
Größter Einzelbaustein. Offen: Eingabemodell (freie Positionen gegen Formelzeilen), Einheiten,
Ausgabeformate, ob Rechenwege exportiert werden.

### Teilprüfung, die auf diesem Rechner nicht geht

- **`BigInt` außerhalb von Edge/Chromium.** Nutzer des Projekts können Firefox oder Safari
  verwenden. `BigInt` ist seit 2019/2020 in allen großen Browsern vorhanden, aber **gemessen ist
  hier nur Chromium**. Bei der Umsetzung gehört eine Laufzeitprüfung mit verständlicher Meldung
  dazu, statt es anzunehmen.

## Nachtrag 2026-10-03, Faber: B geklärt (nerdamer), A festgehalten, C und D ausgearbeitet

### B — „Was ist das Problem mit nerdamer?"

**Kein Lizenzproblem.** Gemessen: `nerdamer` 2.0.0, **Apache-2.0**, genau **eine** Abhängigkeit
(`decimal.js`, MIT). Die Lizenz ist sauber und in `licenses/policy.json` erlaubt. Wer ein
Lizenzproblem vermutet, liegt falsch.

**Das Problem ist ein anderes — drei Punkte:**

**1. Größe.** Gemessen mit esbuild (`--bundle --minify --format=esm`), gzip -9:

| | roh | gzip |
|---|---:|---:|
| `nerdamer` allein | 467.734 B | 134.529 B (**131,4 KiB**) |
| **kuratiertes mathjs + nerdamer** | 831.936 B | **237.790 B (232,2 KiB)** |

Die Rechner-Route stiege von **89,5 KiB auf 232,2 KiB** — das Zweieinhalbfache, und nur knapp
unter dem Startbudget von 250 KiB, für **eine** Werkzeugroute.

**2. Überlappung.** `mathjs` liefert bereits `derivative`, `simplify`, `rationalize`,
`symbolicEqual` und `polynomialRoot`. `nerdamer` ist ein vollständiges CAS mit
`integrate`, `laplace`, `groebner`, `limit`. Zwei CAS-Engines nebeneinander heißen zwei
Semantiken für dieselbe Frage, zwei Fehlerquellen, zwei Lizenzpflegen.

**3. Reife — der eigentliche Befund.** `nerdamer` 2.0.0 ist laut Registry **am 2026-10-02
veröffentlicht, also einen Tag alt** (Vorgänger: 1.x). Im Prüflauf:

- `solve('2*x+5=13','x')` → `{4}` ✓
- `solve('x^2-9=0','x')` → `{3, -3}` ✓
- `diff('x^3','x')` → `3*x^2` ✓
- **`expand('(x+1)^3')` → `TypeError: e.isFunction is not a function`** ✗

Bei der **dritten** Grundfunktion steigt die einen Tag alte Major-Version aus. Die Ursache habe
ich nicht weiter eingegrenzt — dafür ist es zu früh. Festgehalten als Befund mit Reproduktion,
**nicht** als endgültiges Urteil über das Projekt.

**Empfehlung, unverändert: nerdamer vorerst nicht aufnehmen.** Nicht wegen der Lizenz, sondern
wegen Größe, Überlappung und Reife. Die Anforderung „symbolische Gleichungslösung" ist ohnehin
nicht belegt — sie war eine Annahme von mir. **Braucht weiterhin Thomas' Entscheid**, aber die
Faktenlage ist jetzt vollständig.

### A — festgehalten: „Formel und Quelle" ist Pflicht in Welle 1

Auf Thomas' Entscheid. Folgen für die Umsetzung:

- Jeder Rechner trägt **Formel im Klartext**, getroffene **Annahmen**, **Quellen** und **Datum
  der letzten Prüfung** — als Bestandteil der Oberfläche, nicht als Fußnote.
- Neue Pflichtfelder je Werkzeug in den Sprachkatalogen: Formeltext und Quellenliste, in
  **allen** Sprachen.
- Für die Rechner ohne Fachnorm (Kaufmännisch, Geometrie) ist die Quellenangabe kürzer, entfällt
  aber nicht.
- Bei den Handwerkerrechnern ist dieser Baustein die **Voraussetzung für die Zulässigkeit**
  (Normfrage Q2 im Handwerker-Konzept).

### C — Entwurf: Verlauf und Speicher

*Entwurf, keine Messung. Speicherbaustein: `idb-keyval` (2,4 KiB gzip, Apache-2.0).*

**Vier getrennte Speicherbereiche, nicht einer:**

1. **Verlauf** — je Eintrag: Modus, Eingabe (Ausdruck), Ergebnis, verwendetes Zahlenmodell und
   Winkelmaß, Zeitstempel. **Gemeinsam über alle Modi** der Werkzeuge 1 und 2. Ringpuffer mit
   fester Obergrenze (**200 Einträge**), älteste fallen heraus — damit die Datenbank nicht
   unbegrenzt wächst und keine Aufräumlogik nötig ist.
2. **Variablen** — benannte Werte statt Speicherbänke `M1…M5`. Gründe: mathjs hat bereits einen
   `scope`; benannte Variablen sind selbsterklärend (`wandhoehe = 2,80`), Speicherbänke nicht.
   Die Variablen erscheinen im Verlauf und im Ausdruck.
3. **Einstellungen** — Zahlenmodell (`Fraction`/`BigNumber`/`number`), Genauigkeit, Winkelmaß,
   Nachkommastellen. **Getrennt vom Verlauf**, weil sie über Sitzungen hinweg gelten sollen,
   während der Verlauf nur Historie ist.
4. **Aufmaß-Daten** (Werkzeug 9) — **eigener Bereich**, nicht im Rechner-Verlauf. Begründung:
   Aufmaße enthalten Preise und Kundendaten; sie dürfen nicht versehentlich mit dem Verlauf
   gelöscht werden, und der Verlauf darf sie nicht in die Zwischenablage oder in einen Export
   ziehen.

**Verhalten:**

- **Löschen ist sichtbar und vollständig.** Ein Knopf „Verlauf löschen"; er löscht genau einen
  Bereich. Kein stilles Löschen durch Aufräumroutinen.
- **Nichts verlässt das Gerät.** Kein Sync, keine Übertragung — auch nicht „optional".
- **Der Verlauf ist Teil des Exports.** „Formel und Quelle" zeigt die Formel; der Verlauf zeigt
  die Rechnung. Beides als Text oder PDF (vorhandene `pdf-lib`-Engine).
- **Kein Verlauf bei Konsolenfehlern und abgebrochenen Eingaben** — nur erfolgreich ausgewertete
  Ausdrücke kommen hinein.

**Offen im Entwurf:** ob Werkzeug 9 seinen eigenen Verlauf braucht (für Rechenwege je Position)
oder ob der Rechner-Verlauf mitgenutzt wird. Entscheidung fällt mit der Umsetzung.

### D — Entwurf: Werkzeug 9 „Aufmaß"

*Entwurf, keine Messung.*

**Zweck:** Aus Messwerten ein prüffähiges Mengen- und Positionsblatt machen — das, was sonst
Zettelwirtschaft ist (Handwerker-Konzept, Vorschläge 20/21).

**Zwei Ebenen, bewusst getrennt:**

1. **Aufmaßzeile** — eine beschriftete Rechnung aus Maßen: Bezeichnung, Maßkette oder Formel
   (`3,50 × 2,80`, `2 × (2,40 + 1,80)`, Trapez `(a+c)/2 × h`), Ergebnis mit Einheit.
   Nutzt den Rechenkern und die Geometrie-Formeln aus Werkzeug 8.
2. **Position** — Menge × Einheit × Einzelpreis = Betrag, mit Positionsnummer.

Diese Trennung ist der Kern: Ein Aufmaß ist **nicht** eine Preistabelle, sondern zuerst eine
Mengenermittlung; der Preis kommt danach. Wer beides vermischt, kann eine Menge nicht mehr
nachrechnen.

**Aufbau:**

- **Abschnitte** (etwa je Raum oder Bauteil) mit Zwischensummen — Flächen, Längen, Stückzahlen
  getrennt, weil sie nicht addierbar sind.
- **Rechenwege bleiben sichtbar:** jede Position zeigt, aus welchen Maßen sie entstanden ist.
  Das ist dieselbe Anforderung wie A und macht das Blatt prüffähig (VOB: nachvollziehbar).
- **Einheiten:** m, m², m³, Stück, kg, l, h — als Auswahl, nicht frei.
- **Ausgabe:** CSV (für die Weiterverarbeitung), PDF (für den Kunden, über die vorhandene
  Engine), Text (für die Zwischenablage). Der Rechenweg geht mit, wenn er eingeschaltet ist.
- **Eigener Speicherbereich** (siehe C), damit Preise und Kundendaten nicht im Rechner-Verlauf
  landen.
- **Kein Preiskatalog, keine Kostendatenbank.** Preise kommen aus der Eingabe. Ein mitgelieferter
  Katalog wäre veraltete Daten und Backend-Arbeit — beides gegen die Projektlinie.

**Nicht enthalten:** Aufmaß aus Zeichnung oder Foto, Mengenermittlung aus CAD, Anbindung an
eine Rechnungssoftware. Das wäre ein anderes Vorhaben.

**Offen:** ob zusätzlich eine Skizzenansicht (Grundriss mit eingetragenen Maßen) gehört. Nach
dem Konzept ist das Werkzeug 8/9-übergreifend und wäre ein eigener großer Baustein — der
Handwerker-Vorschlag 22 „Aufmaß-Skizze" ist mit **L** (groß) eingeschätzt und sollte nicht
beiläufig mit hineinrutschen.

## Quellen

- Registry-Inventar: `npm-inventar.mjs` über 42 Kandidaten, 2026-10-03.
- Lizenzen im Repository gelesen: `OmniSolver-public` (MIT), `0thernes/professional-calculator`
  (Other), `TEJAS-MK2/Calculator` (Apache-2.0), `date-holidays` (Daten: CC BY-SA 3.0,
  `LICENSE` im Repo), `ConverterNOW` (GPL).
- GPL und Desktop: `unclouded.app/apps/speedcrunch`, `opensource.com/article/18/1/...`,
  `cloudspress.com` (Qalculate GPL v2+).
- Ausdrucksauswertung: `npmjs.com/package/expr-eval`, `github.com/donmccurdy/expression-eval`
  (Deprecated-Hinweis), `github.com/networkteam/eel`.
- Formel-Quellenangabe: `freetoolarena.com/source` (Q6).
- Projektregeln: `licenses/policy.json`, `uebergabe/00-einstieg/arbeitsregeln.md`.

## Nachtrag 2026-10-04, Faber: die Oberfläche des Rechners bekommt ein eigenes Konzept

Auf Thomas' Vorgabe vom 2026-10-04 („Design der Taschenrechner … Tasten zum Drücken, möglichst
wenig Text, mehr eindeutige mathematische Zeichen", dazu eine per Klick umschaltbare
zweidimensionale Anzeige) liegt der Entwurf jetzt als eigenes Konzept:
**`2026-10-04-rechner-oberflaeche.md`**. Der Wortlaut oben bleibt stehen.

Kurzfassung, damit dieses Konzept nicht zwei Orte für dieselbe Frage hat:

- **Tastenfeld** für Standard (4 × 5) und Wissenschaftlich (5 × 8 mit drei Funktionsreihen und
  `2nd`-Umschalter) — ersetzt die 31 Wortknöpfe, **nicht** das Textfeld.
- **Tastensprache** in vier Klassen: reines Zeichen, genormte Abkürzung (nicht übersetzt), Symbol
  statt Wort, sichtbarer Text für Zustände und Handlungen. Dazu ein **übersetzter** zugänglicher
  Name je Taste (`docs/ui-system.md`).
- **Anzeige** in zwei Zuständen, ein Klick, Wert identisch, kopiert wird immer der Text.
- **Kein neuer Rechenkern.** Tasten hängen Schnipsel an den vorhandenen Ausdruck; `appendSnippet`
  tut das schon. Damit wächst weder die mathjs-Last (89,5 KiB, ADR 0005) noch die Lizenzliste.
- **Der Anzeige-Renderer ist offen und ungemessen.** Gemessen ist nur, dass der vorhandene Kern
  LaTeX liefert (`toTex` ✓), aber keine 2D-Darstellung: `toHTML` ist flach, `toMathML` gibt es in
  mathjs 15.2.0 nicht.

Was dieses Konzept **nicht** berührt: Werkzeug 2–9 der Suite, die Währungsentscheidung, die
Gruppierung, die in diesem Dokument festgehaltenen OSS-Urteile.

## Nachtrag 2026-10-04 (zweiter), Faber: Thomas' vier Antworten und die Messungen dazu

**Der Wortlaut oben bleibt stehen.** Thomas hat am 2026-10-04 auf die vier offenen Bedienfragen
geantwortet:

| Frage | Antwort | Folge |
|---|---|---|
| 1 · Tastenfeld allein oder neben dem Textfeld | **„bitte concept Art für beide Varianten"** | nicht entschieden — beide Varianten sind als Tafel vorgelegt (`work/rechner-tastatur-varianten.html`) |
| 2 · `2nd` oder alle Funktionen einzeln | **`2nd` plus eine weitere Taste** für alles, was keinen Platz mehr hat | zweite Belegung auf vorhandenen Tasten; Rest im Blatt `⋯` |
| 3 · Dezimaltrenner lokalisiert | **ja** | `,` deutsch/spanisch, `.` englisch — die einzige Taste mit sprachabhängiger Aufschrift |
| 4 · Auch Programmierer und RPN | **ja** | eigene Tastenfelder für beide Rechenarten (`work/rechner-tasten-programmierer-rpn.html`) |

### Messungen, die dabei angefallen sind (nicht angenommen)

**M1 — Der Rechenkern kennt die hübschen Zeichen nicht.** Gemessen in mathjs 15.2.0 aus
`node_modules` des Projekts:

| Eingabe | Ergebnis |
|---|---|
| `2 × 3` | `Undefined symbol ×` |
| `6 ÷ 2` | `Undefined symbol ÷` |
| `5 − 2` (U+2212) | `Syntax error in part "− 2"` |
| `2 · 3` | Syntaxfehler |
| `1,5 + 1` | `Unexpected operator ,` |

**Folge:** Die Taste darf `×`, `÷`, `−` zeigen, **ablegen muss sie `*`, `/`, `-`** — und der
Dezimaltrenner im Ausdruck ist der Punkt. Damit steht eine Festlegung an: entweder zeigt die
Eingabezeile die abgelegte Form (ehrlich, kopierbar, ohne zweite Wahrheit), oder sie zeigt die
hübschen Zeichen und die Auswertung normalisiert vorher. **Empfehlung: erstere** — eine zweite
Umschreibregel zwischen Anzeige und Ausdruck ist genau die Art stiller Zweideutigkeit, die dieses
Projekt schon einmal einen Faktor 1000 gekostet hat.

**M2 — Die Anzeige benutzt heute einen Punkt, kein Komma.** Belegt im vorhandenen Projekttest:
`evaluate('sin(30)', …).display` ergibt `'0.5'` (`calculator-core.test.ts`). Eine **lokalisierte
Komma-Taste** (Antwort 3) vor einer Anzeige mit Punkt ist widersprüchlich. Zu entscheiden: Taste
und Anzeige gleich ziehen — entweder beide lokalisiert (dann braucht der Formatierer eine
Dezimaltrenner-Option) oder Taste bleibt beim Punkt.

**M3 — Die kuratierte Factory-Liste ist enger als der übliche Funktionsumfang.**
`packages/tools/src/calculator/functions.ts` lädt unter anderem **nicht**:
`nthRoot`, `cbrt`, `tau`, `phi`, `i`, `arg`, `isPrime`, `mean`, `std`, `hypot`.
Eine fehlende Factory bricht erst zur Laufzeit, nie beim Bau (ADR 0005). Deshalb:
- Die Zeichen `∛` und `ⁿ√x` sind **Zeichen, keine Funktionen** — sie setzen `x^(1/3)` und `x^(1/n)`
  über die vorhandene Potenz.
- Das Blatt `⋯` führt **nur**, was die Factories wirklich hergeben:
  `asin acos atan atan2` · `sinh cosh tanh asinh acosh atanh` · `abs round floor ceil fix sign` ·
  `gcd lcm mod` · `combinations permutations` · `max min sum` · `π e`.

**M4 — `rightLogShift` bleibt außen vor.** mathjs bietet es nur vektoriell und lehnt Skalare ab
(steht so im Kommentar der Factory-Liste). Ein logischer Rechts-Shift auf einem Wert läuft über die
Wortbreite (`toWord`) und wäre eine eigene Ergänzung, kein Tastensymbol. Die Tafel zeigt daher nur
`<<` und `>>`.

### Zwei Befunde, die über die Oberfläche hinausgehen

**B1 — RPN mit einem echten Stapel ist eine Kernänderung, keine Tastenbelegung.** Heute liest der
RPN-Modus eine **getippte Zeichenkette** (`splitRpnTokens`, `evaluateRpn`) und zeigt den Stapel als
Ergebnis. Die vorgeschlagenen Tasten `ENTER`, `DROP`, `SWAP`, `ROLL` verlangen einen **Zustand
zwischen den Anschlägen**. Zwei Wege, beide gangbar:
(a) RPN bleibt die getippte Zeichenkette und bekommt nur Zeichen statt Wörter — die vier
Stapeltasten entfallen;
(b) RPN wird ein echter Stapelrechner — Aufwand im Rechenkern, nicht im Tastenfeld.
**Braucht Thomas' Entscheidung.**

**B2 — Im Programmierer-Modus haben `A–F` nicht in jeder Basis eine Bedeutung.** In DEC, OCT und
BIN sind sie keine Ziffern; in BIN bleiben nur `0` und `1`. Vorschlag: je Basis **abgeschaltet**
(nicht nur blass, sondern nicht bedienbar). Das ist die einzige Verhaltensänderung dieser
Rechenart.

### Offene Fragen — bereinigter Stand

- [ ] **Variante A oder B** (Tafel liegt vor).
- [ ] **Dezimaltrenner in Eingabe und Anzeige gleich ziehen** (M1/M2).
- [ ] **Schreibweise im Ausdruck:** abgelegte Form (`* / -` und Punkt) oder hübsche Zeichen mit
      Normalisierung? Empfehlung: abgelegte Form.
- [ ] **RPN:** Zeichenkette (a) oder echter Stapel (b)?
- [ ] **Programmierer:** Zifferntasten je Basis abschalten (B2)?
- [ ] **Umfang des Blattes `⋯`** bestätigen (M3).
- [ ] **Anzeige-Renderer** für die 2D-Darstellung — weiterhin ungemessen.
- [ ] **Werkzeugtexte Deutsch** nach den rund 35 neuen Schlüsseln je Sprache neu messen.

### Zeichnungen zu diesem Nachtrag

- `work/rechner-tastatur-varianten.html` — Variante A und B, `2nd`-Ebene, Blatt `⋯`, die vier
  Antworten
- `work/rechner-tasten-programmierer-rpn.html` — Programmierer (HEX, ausgegraute `A–F` in DEC) und
  RPN mit Stapel
- `work/rechner-tastatur-concept.html`, `work/rechner-anzeige-concept.html` — die früheren Tafeln
  (in der ersten war `40,7` gezeichnet; nach M2 berichtigt auf `40.7`)
