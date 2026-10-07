# Abschlussmatrix — tatsächlich beauftragte Vorhaben

**Angelegt:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Grundlage:** QM-Karte
**M10-005** („Abschlussbewertung wird nicht durchgehend am dokumentierten Umfang geprüft")

**Wozu diese Datei.** Die Abschlussbewertung des Projekts stand bisher verstreut in Übergaben,
Protokollen und Konzepten; ein **ursprüngliches Kriterium** ließ sich damit nirgends gegen einen
**gemessenen Istwert** stellen, und nichts verhinderte, dass ein Kriterium still verschwand oder im
Nachhinein umgedeutet wurde. Diese Matrix führt beides getrennt:

- **Zitat** — das ursprüngliche Kriterium, **wörtlich** aus der genannten Quelle. Das Zitat wird
  maschinell gegen die Quelle geprüft (`npm run akte:check`, Regelkreis `abschluss`): **ein Zitat, das
  in seiner Quelle nicht vorkommt, scheitert.** Damit ist „still entfernt" oder „heimlich
  umformuliert" nicht mehr möglich, ohne dass es auffällt.
- **Istwert** — was heute tatsächlich dasteht, **gemessen**, mit Datum und Revision.
- **Nachweis** — die Stelle, an der die Messung steht.
- **Status** — einer von fünf Werten, siehe Legende.

**Die Kriterien werden hier nicht neu gesetzt.** Ändert sich ein Kriterium, wird das eine **datierte
neue Entscheidung** (ADR) — es wird **nicht** rückwirkend zur Erfüllung erklärt.

## Legende

| Status | Bedeutung |
|---|---|
| **erfüllt** | Das ursprüngliche Kriterium ist mit Beleg erfüllt. |
| **erfüllt mit Abweichung** | Das Kriterium ist erfüllt, aber ein benannter Teil weicht ab — die Abweichung steht im Istwert. |
| **verschoben** | Das Kriterium ist ausdrücklich **nicht** erfüllt und als offener Punkt geführt (nicht still gefallen). |
| **offen** | Noch nicht bewertet oder Bearbeitung läuft. |
| **ohne schriftliches Kriterium** | Für dieses Vorhaben wurde **kein** prüfbares Kriterium festgehalten. Das ist der Zustand, nicht die Erfüllung. |

## Matrix

| Vorhaben | Ursprüngliches Kriterium (Zitat) | Quelle | Istwert (gemessen) | Revision | Nachweis | Status |
|---|---|---|---|---|---|---|
| Bild-Suite | „Für jede in Betracht gezogene Abhängigkeit ist die Lizenz gegen `AGPL-3.0-only` geprüft, Modellgewichte eingeschlossen." | `03-konzepte/2026-10-02-bild-suite.md` | `licenses:check` und `licenses:generate` grün; 6 Bild-Werkzeuge im Register (das Konzept beschreibt zehn — die Kriterien dort sind Konzeptkriterien) | 2026-10-07 | `npm run licenses:check` | **erfüllt** |
| PDF-Suite | „Deutsch/Englisch vollständig; keine sichtbaren hart codierten Texte." | `03-konzepte/2026-10-03-pdf-suite.md` | `jsx:check` grün; 23 PDF-Werkzeuge in **drei** Sprachen (de/en/es), nicht nur zwei | 2026-10-07 | `npm run jsx:check` | **erfüllt** |
| PDF-Suite | „lokale Verarbeitung ohne unerwarteten Netzwerkzugriff." | `03-konzepte/2026-10-03-pdf-suite.md` | Netzbeleg: die Seite holt ausschließlich eigene Dateien; keine Fremdadresse | 2026-10-07 | `07-pruefung/hebel2/beleg-2026-10-07.txt` | **erfüllt** |
| Rechner-Aufteilung | „Vier Routen erreichbar; **kein Treffer `mode ===`** in den vier Werkzeugoberflächen." | `03-konzepte/2026-10-04-rechner-aufteilen.md` | vier Rechner-Werkzeuge im Register; `grep "mode ==="` über die vier Oberflächen: **0 Treffer** | 2026-10-07 | `packages/tools/src/catalog/manifests.ts` | **erfüllt** |
| Rechner-Aufteilung | „**Jedes Werkzeug bringt höchstens 60 eigene Sprachschlüssel**; der Rahmen liegt genau einmal im gemeinsamen Block (Zählung im Prüfbericht)." | `03-konzepte/2026-10-04-rechner-aufteilen.md` | eigene Schlüssel je Werkzeug: calculator **1**, scientific **5**, programmer **7**, rpn **9** (≤ 60); der Rahmen steht **einmal** in `common.ts` (160 Schlüssel) | 2026-10-07 | `packages/tools/src/catalog/generated/messages/de/` | **erfüllt** |
| Rechner-Aufteilung | „`npm run check` und `npm run build` grün; Katalog regeneriert; Startbudget gemessen und gegenüber heute unverändert (Engine bleibt gemeinsam)." | `03-konzepte/2026-10-04-rechner-aufteilen.md` | `check` und `build` grün, Katalog aktuell, Rechenkern **gemeinsam** (eine Engine für alle vier) — aber das Startbündel ist **nicht unverändert** (siehe nächste Zeile) | 2026-10-07 | `npm run check` | **erfüllt mit Abweichung** |
| Rechner-Oberfläche | „Das Startbündel bleibt bei **136.961 B gzip** (heute gemessen, Welle 6)" | `03-konzepte/2026-10-04-rechner-oberflaeche.md` | Eingang heute **150.082 B gzip** — **+13.121 B** gegen den damaligen Wert. Ursache sind spätere Wellen (Handwerk A–E, Welle D/E), nicht der Rechner. **Datiert entschieden:** das Budget ist eine **Warnschwelle**, harte Fehler sind die **strukturellen** Regeln (kein statisch erreichbarer Engine-Import) — ADR 0005, in R7 datiert nachgetragen | 2026-10-07 | `npm run build` (Bundle-Audit) | **erfüllt mit Abweichung** |
| Rechner-Oberfläche | „Tastenfeld in beiden Rechenarten; bei **320 px** Breite kein waagerechter Überlauf, jede Taste mindestens 44 px Trefferfläche — im echten Browser gemessen, nicht nur im Test." | `03-konzepte/2026-10-04-rechner-oberflaeche.md` | `viewport:check` über 62 Routen bei 320 px: *Audit passed*; Bedienziele der Rechner über 44 px (R5 nachgemessen) | 2026-10-07 | `npm run viewport:check` | **erfüllt** |
| Rechner-Ampel | „Für `1/3+1/6`, `√4` und `sin(30°)` steht die Ampel auf **grün**, für `1/3`, `2/7`, `√2`, `π` und `1/3*3` auf **gelb** — nachgewiesen durch Testfälle, die beide Ausgaben vergleichen." | `03-konzepte/2026-10-04-rechner-ampel.md` | Abnahmefälle liegen als reguläre Tests vor; Ampel-Kennzeichen ist Pflichtfeld im Ergebnis | 2026-10-07 | `apps/web/src/calculator-ampel.test.ts` | **erfüllt** |
| Desktop-Auskoppeln | „Es gibt genau **einen** Zustand und **einen** Rechenlauf." | `03-konzepte/2026-10-04-desktop-auskoppeln.md` | belegt auf allen 41 damaligen Werkzeug-Routen; eine Instanz, Portal in das zweite Fenster, Rückkehr unverändert | 2026-10-04 | `05-uebergaben/2026-10-04-desktop-auskoppeln-m3-m5.md` | **erfüllt** |
| Desktop-Auskoppeln | „Ein Breiten-Nachweis: `npm run viewport:check` bei laufender Vorschau über die Seiten (Startseite, Katalog, Suche, je ein Werkzeug jeder Kategorie) bei 1920/1366/1024/768 px ohne Überbreite" | `03-konzepte/2026-10-04-desktop-auskoppeln.md` | **nicht gefahren.** Gemessen ist 320 px über 62 Routen; die Desktop-Breiten 1920/1366/1024/768 px und Firefox (geckodriver fehlt) stehen aus | 2026-10-07 | `01-stand/offene-punkte.md` (OP-031) | **verschoben** |
| Einheitliches Speichern | „Alle 17 dateierzeugenden Werkzeuge verwenden denselben Speicheradapter." | `03-konzepte/2026-10-03-einheitliches-speichern.md` | umgesetzt und im Konzept auf `umgesetzt (Stufe 1)` gesetzt; heute 17+ dateierzeugende Werkzeuge über denselben Adapter | 2026-10-06 | `06-protokolle/2026-10-06-welle-d-02-und-03.md` | **erfüllt** |
| Werkzeugnavigation | „Kein optionales Toolmodul und keine PDF-Engine wird durch das Menü vorab geladen." | `03-konzepte/2026-10-03-werkzeugnavigation.md` | Bundle-Audit grün: Eingang 150.082 B gzip, **keine** statisch erreichbare PDF- oder Rechen-Engine | 2026-10-07 | `npm run bundle:check` | **erfüllt** |
| Sprachgetrennte Suchpakete | „Die Startseite soll nicht mit jeder zukünftigen Übersetzung wachsen." | `03-konzepte/2026-10-04-sprachgetrennte-suchpakete.md` | Startseite holt 7 Dateien / 183.532 B gzip **ohne** jedes Werkzeug-Textpaket; Werkzeugtexte kommen je Route | 2026-10-07 | `07-pruefung/hebel2/beleg-2026-10-07.txt` | **erfüllt** |
| Spanisches Sprachpaket | „Kein sichtbarer Rückfall auf Englisch oder Deutsch im normalen Bedienweg." | `03-konzepte/2026-10-03-sprachpaket-spanisch.md` | Register und Werkzeugflächen gegengelesen (zwei Durchgänge, rund 90 Korrekturen); Status bleibt **Testpaket** — die **muttersprachliche** Abnahme fehlt | 2026-10-07 | `06-protokolle/2026-10-06-entscheidungen-umgesetzt.md` | **erfüllt mit Abweichung** |
| Handwerk, Welle E (technische Gewerke) | „Fachliche Freigabe beanspruchen 13 und 16 ausdrücklich nicht" | `01-stand/aktueller-stand.md` | fünf Werkzeuge gebaut, geprüft und am 2026-10-06 ausgeliefert; Quelle und Abrufdatum je Wert, Werkzeug 13 mit Eingabefeld statt Tabelle — die **fachliche Abnahme durch eine Elektro-/SHK-Fachkraft** fehlt | 2026-10-07 | `06-protokolle/2026-10-06-welle-e-bericht.md` | **erfüllt mit Abweichung** |
| Handwerk, Wellen A–D | *(kein schriftliches Kriterium festgehalten)* | `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` | Das Konzept führt **keinen** Abnahmeabschnitt; die Abnahme steht je Welle in der jeweiligen Übergabe. Für diese Wellen lässt sich „erfüllt/abweichend/verschoben" deshalb **nicht** am dokumentierten Umfang prüfen — genau der Befund der Karte | 2026-10-07 | `05-uebergaben/2026-10-04-welle-a-handwerkerwerkzeuge.md` | **ohne schriftliches Kriterium** |
| Tooltip und Kontexthilfe | „Die Implementierung gilt erst als fertig, wenn alle folgenden Aussagen belegt sind" | `03-konzepte/2026-10-06-tooltip-und-kontexthilfe.md` | Konzept vollständig, **nichts implementiert** (kein Treffer für `Tooltip`/`Kontexthilfe` im Quelltext) | 2026-10-07 | `03-konzepte/2026-10-06-tooltip-und-kontexthilfe.md` | **offen** |
| Automatisierte Sprachpakete | „Jede erzeugte Sprache besteht Schlüssel-, Unicode-, Such-, Test- und Build-Prüfung." | `03-konzepte/2026-10-03-automatisierte-sprachpakete.md` | Das Vorhaben ist **nicht umgesetzt** (Status im Konzept: „beschlossen, noch nicht umgesetzt"); die Sprache `es` ist von Hand gepflegt und gegengelesen worden, nicht über einen Übersetzungsablauf | 2026-10-07 | `01-stand/offene-punkte.md` (OP-003) | **offen** |

## Das Startbudget — drei verschiedene Anforderungen, getrennt geführt

Die Karte M10-005 verlangt ausdrücklich, das unscharfe Startbudget **unverändert** in messbare
Bedeutung zu überführen, statt es im Nachhinein zu erfüllen. Es sind drei verschiedene Dinge:

1. **Identischer Bytewert** (das Kriterium der Rechner-Oberfläche, 136.961 B gzip): **nicht
   eingehalten** — 150.082 B gzip heute. Grund gemessen und benannt; die Anforderung ist als
   *Abweichung* geführt, nicht gestrichen.
2. **Kein neuer Engine-Startimport** (strukturelle Regel, ADR 0003/0005): **eingehalten** —
   `bundle:check` bricht bei statisch erreichbarer PDF- oder Rechen-Engine ab, und dieser Abbruch ist
   in R7 mit einer Mutationsgegenprobe belegt worden.
3. **Unter der Warnschwelle** 200 KiB gzip: **eingehalten** — 150.082 B von 204.800 B.

Eine Änderung von (1) wäre eine **datierte neue Entscheidung**, keine rückwirkende Erfüllung. Eine
solche Entscheidung ist **nicht** getroffen; (1) bleibt als Abweichung stehen.

## Was diese Matrix nicht ist

- **Sie ersetzt die Funktionsabnahme nicht.** Die Karte sagt ausdrücklich: „D/E-Funktionsabnahme und
  neue Routen gesondert prüfen; Audit der alten 54 Tools ersetzt das nicht." Die Matrix führt
  Kriterien und ihren Status — die Funktion ist je Übergabe und Protokoll belegt.
- **Sie behauptet keine harte Budgetverletzung** und keine vorsätzliche Kriteriumsverschiebung. Wo
  etwas abweicht, steht der gemessene Grund daneben.
- **Sie baut keine Welle D/E erneut.** Die Wellen sind gebaut und ausgeliefert; hier steht nur, ob
  die ursprünglichen Kriterien erfüllt sind.
- **Sie ist kein Ersatz für die offenen Punkte.** Wo ein Kriterium verschoben ist, nennt die Zeile
  den offenen Punkt in `01-stand/offene-punkte.md`.

*Pflege: neue Vorhaben kommen mit ihrem ersten prüfbaren Kriterium hierher; erreicht ein Vorhaben
seinen Abschluss, wird die Zeile auf einen Status gesetzt. Das Zitat bleibt unverändert — wird das
Kriterium geändert, entsteht eine neue Zeile mit datierter Entscheidung.*
