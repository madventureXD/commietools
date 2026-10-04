# Konzept: Oberfläche des Rechners — Tastenfeld und zweidimensionale Anzeige

**Status:** entwurf
**Datum:** 2026-10-04
**Verantwortlich:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle), im Auftrag von Thomas
**Bezug:** `2026-10-03-taschenrechner-suite.md` (Suite „Rechnen"), Werkzeuge 1 der Suite.
**Umgesetzt wird nichts, bevor dieses Konzept angenommen ist.** Es wurde kein Code geändert.

## Ausgangslage

Der Rechner steht seit Welle 1–5 als Route `/tools/rechner` mit vier Rechenarten (Standard,
Wissenschaftlich, Programmierer, RPN). Seine heutige Oberfläche hat drei Merkmale, die Thomas am
2026-10-04 beanstandet hat:

1. **Die Eingabe ist ein Textfeld.** Wer nicht tippen will, hat keinen Weg.
2. **Die Funktionen sind 31 Knöpfe mit englischen Bezeichnern** (`sin(`, `log10(`, `factorial(`,
   `combinations(` …) in einer umbrechenden Reihe — jede Funktion ist ein Wort, und die Reihe ist
   länger als das Tastenfeld, das sie ersetzt.
3. **Die Anzeige ist immer eindimensional.** Ein Ergebnis erscheint als `1/2` oder `sqrt(2)`,
   nie als Bruch mit Bruchstrich oder als Wurzel mit Überstrich.

Thomas' Vorgabe: **Tasten zum Drücken, möglichst wenig Text, eindeutige mathematische Zeichen** —
und für die Anzeige **beide Möglichkeiten, per Klick umschaltbar**: der heutige, leicht kopierbare
Text und eine vollständige zweidimensionale Darstellung.

**Zwei Feststellungen aus dem Bestand, die den Entwurf tragen:**

- **Ein Tastenfeld braucht keinen neuen Rechenkern.** Die Tasten hängen nur Schnipsel an den
  vorhandenen Ausdruck — genau das tut die vorhandene Funktion `appendSnippet` in
  `apps/web/src/calculator-ui.ts` bereits. Es entsteht kein Zuwachs am mathjs-Paket (89,5 KiB
  gzip, ADR 0005) und keine neue Abhängigkeit.
- **Der Rechenkern liefert die Vorlage für 2D, aber nicht die Darstellung.** Am 2026-10-04 im
  Projekt gemessen (mathjs 15.2.0 aus `node_modules`):
  `parse('1/2 + sqrt(2) + x^2').toTex()` → `\frac{1}{2}+\sqrt{2}+{x}^{2}` ✓ ·
  `toHTML()` → flaches HTML ohne Bruchstrich, Wurzelstrich und Hochstellung ✗ ·
  `toMathML()` → **existiert in 15.2.0 nicht** ✗.
  Die zweidimensionale Darstellung ist damit eine eigene Entscheidung, nicht eine
  Konfigurationsfrage.

## Ziele

- Der Rechner ist mit Fingern und Daumen bedienbar, ohne dass eine Funktion ein Wort ist.
- Ein mathematisches Zeichen schlägt jedes Wort. Zeichen sind in allen Sprachen dieselben.
- Die Anzeige zeigt Brüche untereinander, Wurzeln mit Überstrich und Hochzahlen oben — **und**
  bleibt in einem Klick der kopierbare Text.
- Beide Zustände zeigen **denselben Wert**. Die Darstellung ändert die Rechnung nicht.
- Kein neuer Rechenkern, keine neue Pflicht-Abhängigkeit.

## Nicht-Ziele

- **Kein visueller Eingabe-Editor** (Klasse MathLive). Damit bliebe die Eingabezeile nicht mehr
  kopierbarer Text, und die Größenfrage würde neu aufgeworfen. MathLive ist im Suite-Konzept
  bereits wegen Größe ausgeschieden (1.518 kB größte Nutzdatei).
- **Keine symbolische Umformung** und kein Rechenweg in 2D. Es wird dargestellt, was gerechnet
  wurde — nicht mehr.
- **Keine Änderung an Programmierer- und RPN-Modus** in dieser Welle. Sie behalten ihre
  Oberfläche; das Tastenfeld kommt für Standard und Wissenschaftlich.
- **Keine neue Abhängigkeit ohne Messung und ohne Entscheid.** Ein Anzeige-Renderer wird erst
  aufgenommen, wenn Lizenz, gebündelte Größe und Browser-Verhalten belegt sind.

## Vorschlag

### 1 · Tastenfeld

**Standard:** 4 Spalten × 5 Reihen. `AC`, Rückschritt (Symbol), `%`, `÷` · `7 8 9 ×` ·
`4 5 6 −` · `1 2 3 +` · `± 0 , =`.

**Wissenschaftlich:** 5 Spalten × 8 Reihen. Drei Funktionsreihen oben
(`2nd ( ) π e` · `sin cos tan xʸ n!` · `√ x² 10ˣ ln log`), darunter der Ziffernblock mit einer
Operator-Spalte; `=` läuft über drei Reihen. Die Taste **`2nd`** klappt sin/cos/tan, `√`, `ln` und
`log` auf ihre Umkehrfunktion um — dadurch halbiert sich die Tastenzahl gegenüber 31 Wortknöpfen.

**Das Tastenfeld ersetzt das Textfeld nicht.** Beide Wege bleiben: getippte Ausdrücke
(`2(3+4)`, `5 cm + 2 inch`) sind die Stärke des Kerns (Vorbild SpeedCrunch, siehe Q1 des
Suite-Konzepts), Tasten sind der Weg für Finger und Daumen. Beide schreiben in dieselbe
Eingabezeile.

### 2 · Tastensprache — vier Klassen, nur eine davon ist Text

| Klasse | Inhalt | behandelt |
|---|---|---|
| A · Reines Zeichen | `+ − × ÷ = % ± ( ) π e √ x² xʸ n! ,` | sprachfrei, kein Sprachschlüssel nötig |
| B · Genormte Abkürzung | `sin cos tan ln log DEG RAD ANS 2nd AC` | international genormt — wird **nicht** übersetzt |
| C · Symbol statt Wort | Rückschritt, Verlauf, Speichern, Abrufen, Verlauf löschen | Strichzeichnung 24 × 24, `stroke="currentColor"` |
| D · Sichtbarer Text | Rechnerart, „Ergebnis kopieren", „Verlauf löschen", Fehlermeldungen | übersetzt, aus den Sprachkatalogen |

**Unsichtbarer Text ist Pflicht:** `docs/ui-system.md` verlangt übersetzte zugängliche Namen. Jede
Taste bekommt ein `aria-label` aus dem Sprachkatalog — rund 35 neue Schlüssel je Sprache.

**Der Dezimaltrenner ist das eine Zeichen, das übersetzt wird:** `,` in Deutsch, `.` in Englisch.
Es ist damit die einzige Taste, deren Aufschrift von der Sprache abhängt.

### 3 · Anzeige — zwei Zustände, ein Klick

Der Umschalter sitzt **in der Anzeige selbst**, in der Zeile der Zustandszeichen (BRUCH · exakt),
rechts außen — er gehört zum Blick, nicht zur Einrichtung.

- **Zustand A · Text (Standard).** Wie heute: `1/2`, `sqrt(2)`. Kopierbar, auswertbar, sicher.
- **Zustand B · 2D.** `1` über `2` mit Bruchstrich, Wurzel mit Überstrich über dem Radikanden,
  Hochzahl oben statt Zirkumflex.

Regeln des Umschalters:

- **Ein Klick, keine Kette.** Kein Menü, kein Dialog, kein Verlassen der Seite.
- **Der Wert ändert sich nicht.** 2D gegen Text ist Darstellung, nicht Rechnung.
- **Kopiert und wiederverwendet wird immer der Text** — in beiden Zuständen. Die 2D-Form trägt den
  Klartext als unsichtbare Beschriftung und als zugänglichen Namen mit.
- **Die Wahl wird gemerkt**, im vorhandenen Einstellungsdatensatz neben Zahlenmodell und
  Winkelmaß. Standard bleibt **Text**.
- **Eine misslungene Vorschau ist kein Fehler.** Lässt sich eine Form nicht setzen, zeigt die
  Anzeige den Text und meldet nichts.
- **Die Eingabezeile bleibt immer Text.** Ein halb getippter Ausdruck hat keinen Baum und damit
  keine 2D-Form. Zweidimensional werden **Ergebnis und fertige Rechnung**.

### 4 · Was unverändert bleibt

Zahlenmodell (Dezimal/Bruch), Winkelmaß, Basis, Wortbreite, Verlauf (Ringpuffer 200),
Variablen, der Baustein **Formel und Quelle** (Pflicht seit Welle 1), die Suite „Rechnen" und die
Route `/tools/rechner`.

**Eine ehrliche Abweichung vom Vier-Schritt-Fluss:** `docs/ui-system.md` fordert Eingabe →
Einstellungen → Aktion → Ergebnis. Auf einem Tastenfeld verschmilzt die Aktion mit der Eingabe —
das ist die richtige Form für einen Rechner, aber es ist eine Abweichung, nicht eine
Selbstverständlichkeit. Die Einstellungen bleiben an ihrem Platz, der Auslöser bleibt sichtbar
dominant (`=`), und die Regel „keine zerstörende Handlung in der Nähe der Hauptaktion" bleibt
gewahrt: `AC` ist unauffällig gesetzt, nicht rot gefüllt.

## Alternativen

**Anzeige-Renderer (offen, ungemessen):**

| Kandidat | Lizenz | Einschätzung |
|---|---|---|
| **Temml** | MIT | LaTeX → MathML; nutzt die native Mathe-Darstellung des Browsers, keine Schriftdateien. Erster Kandidat. |
| **KaTeX** | MIT | Klassische Druckqualität; bringt rund 20 woff2-Schriftdateien mit, die offline mitgeliefert werden müssen. |
| **MathJax 3 (tex-svg)** | Apache-2.0 | Selbsttragende SVG-Ausgabe ohne Schriftdateien; der größte der drei. |
| **Eigene Baum→MathML-Abbildung** | — | Der Ausdrucksbaum von mathjs liegt bereits vor; Brüche, Wurzeln, Potenzen, Funktionen, Klammern sind grob 100 Zeilen, **0 kB**. Nach ADR 0001 („Open Source vor Eigenentwicklung") nur zulässig, wenn alle Kandidaten an einem dokumentierten Muss-Kriterium scheitern — oder wenn ein Kandidat die Muss-Kriterien (kopierbarer Klartext, Offline-Betrieb, 250-KiB-Budget) verfehlt. |

**Verworfen:**

- **Nur 2D** — die Kopierbarkeit des Ergebnisses wäre weg; Verlauf und „Übernehmen" hängen am Text.
- **Nur Text** — der Bruch bleibt `3/10`; genau der Anlass der Frage.
- **2D schon beim Tippen** — ohne visuellen Editor nicht möglich; ein unfertiger Ausdruck hat
  keinen Baum. Wurde bewusst nicht als Ziel gesetzt.
- **MathLive** — Eingabe-Editor, Größe (im Suite-Konzept ausgeschieden), ändert die Kopierbarkeit.

## Auswirkungen

- **Local First / Datenschutz:** unverändert. Tasten und Darstellung laufen im Browser, nichts
  verlässt das Gerät, kein Netzweg kommt hinzu.
- **Offline First:** unverändert, **sofern** ein Renderer lokal gebündelt wird. KaTeX brächte
  Schriftdateien in die PWA, die mit ausgeliefert und mitgecacht werden müssen — das ist ein
  neuer Posten im Umfang der Anwendung, nicht nur ein Skript. Eine eigene MathML-Abbildung und
  Temml (Browser-Matheschriften) hätten diesen Posten nicht.
- **UI / Barrierefreiheit:** Trefferfläche mindestens 44 px auf jeder Taste; Farbe nie alleiniger
  Träger (Operatoren zusätzlich fett, `=` zusätzlich gefüllt, aktiver Umschaltzustand zusätzlich
  gefüllt); übersetzte zugängliche Namen je Taste; Tastaturbedienung ist mit dem Tastenfeld
  leichter prüfbar als mit 31 Wortknöpfen — der seit Welle 5 offene Tastaturlauf bekommt damit
  eine realistische Gelegenheit.
- **Internationalisierung:** rund 35 Tastennamen je Sprache, dazu zwei Zustandsnamen und eine
  Fehlermeldung für die misslungene Vorschau. **Das ist die einzige harte Konsequenz:** die
  Werkzeugtexte Deutsch liegen nach Welle 6 bei 26.403 von 30.720 B gzip (Reserve 4,3 KiB).
- **Modularität / Suiten:** keine neue Werkzeug-ID, keine Suitenänderung, keine Manifest-Änderung.
  Die Arbeit bleibt in `apps/web/src/tools/Calculator.tsx`, `apps/web/src/calculator-ui.ts` und
  den vorhandenen Sprachkatalogen.
- **Abhängigkeiten / Lizenzen:** **heute keine neue Abhängigkeit.** Ein Anzeige-Renderer wird erst
  nach `npm run licenses:check` und nach einer gemessenen Größe aufgenommen; die Entscheidung
  gehört als ADR festgehalten, wenn sie fällt.
- **Tests / Migration:** kein Datenmodell betroffen — der Verlauf speichert weiterhin
  Textausdrücke, gespeicherte Einstellungen bekommen **einen** neuen Wert (Darstellung) mit
  Vorgabe Text. Keine Migration nötig. Neue Tests: Tastenzuordnung je Rechenart, Umschalter,
  identischer kopierter Text in beiden Zuständen, jede angebotene Funktion einmal ausgewertet
  (die bestehende Liste `calculatorFunctions` bleibt die Prüfung dafür).

## Offene Fragen

- [ ] **Ersetzt das Tastenfeld das Textfeld oder steht es daneben?** Empfehlung: daneben.
- [ ] **`2nd`-Umschalter oder alle Funktionen einzeln sichtbar?** Empfehlung: `2nd`.
- [ ] **Dezimaltrenner auf der Taste lokalisiert** (`, ` in Deutsch)? Empfehlung: ja.
- [ ] **Welcher Weg für die 2D-Darstellung** — Temml, KaTeX, MathJax oder eigene
      Baum→MathML-Abbildung? Vor der Umsetzung messen: Lizenz im Wortlaut, gebündelte Größe
      (esbuild + gzip), und im Browser nachweisen, dass Bruch und Wurzel wirklich gestrichen
      gezeichnet werden.
- [ ] **Liefert ein kopierter MathML-Knoten im Browser brauchbaren Klartext?** Eine Messung, keine
      Annahme. Wenn nicht, braucht die 2D-Anzeige eine eigene Kopierquelle.
- [ ] **Ist die Verschmelzung von Schritt 1 und 3 bei Rechenwerkzeugen im `ui-system.md` zu
      vermerken?**
- [ ] **Bleiben die 31 Wortknöpfe für Programmierer und RPN** oder werden sie ebenfalls zu Tasten?

## Akzeptanzkriterien

- [ ] Tastenfeld in beiden Rechenarten; bei **320 px** Breite kein waagerechter Überlauf, jede
      Taste mindestens 44 px Trefferfläche — im echten Browser gemessen, nicht nur im Test.
- [ ] Keine Taste trägt einen sichtbaren Anzeigetext außer den in §2 Klasse B und D benannten
      Ausnahmen; jede Taste hat einen **übersetzten** zugänglichen Namen in de, en und es.
- [ ] Umschalten zwischen Text und 2D mit **einem Klick**; der kopierte Text ist in beiden
      Zuständen **identisch** und auswertbar (Gegenprobe: kopierten Text erneut einwerfen → gleiches
      Ergebnis).
- [ ] Bruch als Bruch, Wurzel mit Überstrich, Hochzahl oben — **im Browser belegt**, mit dem
      tatsächlichen Renderer, nicht mit einer gezeichneten Attrappe.
- [ ] Alle vier Rechenarten funktionieren unverändert; `npm run check`, `npm run lint` und
      `npm run build` bestanden.
- [ ] Das Startbündel bleibt bei **136.961 B gzip** (heute gemessen, Welle 6); der Rechenkern-Chunk
      (heute 102.475 B gzip) wächst nur, wenn eine Anzeige-Bibliothek hinzukommt — und dann
      gemessen und begründet.
- [ ] Der Baustein **Formel und Quelle** bleibt erhalten.

## Anhang: Concept-Art

Gezeichnete Tafeln (HTML, mit Edge headless gerendert). Sie zeigen die **Zielform**, nicht den
Beweis, dass ein Renderer sie erzeugt — die 2D-Formen sind von Hand in HTML und CSS gesetzt.

- `work/rechner-tastatur-concept.html` + `.png` — Standard (dunkel und hell), wissenschaftlich,
  320 px, Tastensprache, Vergleich zum heutigen Rechner
- `work/rechner-anzeige-concept.html` + `.png` — beide Anzeigezustände, Wurzel/Potenz, Umschalter

**Hinweis zur Ablage:** `work/` steht in `.gitignore` und wird **nicht** versioniert (wie schon
die Tafeln zum Werkzeugmenü). Der Inhalt dieses Konzepts ist deshalb vollständig im Text
beschrieben; die Tafeln sind Illustration. Sollen die Tafeln mit dem Projekt überliefert werden,
gehören sie nach `uebergabe/` — eine Entscheidung von Thomas.

## Nachtrag 2026-10-04 (zweiter): Thomas' vier Antworten — und was sie nach sich ziehen

**Der Wortlaut oben bleibt stehen** (Vorschlag „neben dem Textfeld", `2nd`-Umschalter,
Dezimaltrenner lokalisiert als Empfehlung). Thomas hat am 2026-10-04 geantwortet; die
ausführliche Fassung mit allen Messungen steht in
`2026-10-03-taschenrechner-suite.md`, Abschnitt „Nachtrag 2026-10-04 (zweiter)".

**1 · Variante A oder B — nicht entschieden.** Thomas will **beide als Concept-Art** sehen. Damit
gilt: der Vorschlag „neben dem Textfeld" oben ist **zurückgestellt**, nicht beschlossen. Beide
Varianten sind gezeichnet in `work/rechner-tastatur-varianten.html`.

**2 · `2nd` plus eine Taste `⋯`.** Die zweite Belegung liegt auf den vorhandenen Tasten (oben
klein, in der Markenfarbe), alles Übrige holt ein Blatt `⋯` hervor — dasselbe Muster wie das
Werkzeugmenü. Die Taste gilt für **einen** Anschlag, nie „scharf" bleibend.
**Wichtige Einschränkung, gegen die Factory-Liste geprüft:** das Blatt führt nur, was
`calculator/functions.ts` wirklich lädt. `∛` und `ⁿ√x` sind Zeichen, keine Funktionen — sie setzen
`x^(1/3)` und `x^(1/n)` über die vorhandene Potenz; `nthRoot` und `cbrt` fehlen in der Liste.

**3 · Dezimaltrenner lokalisiert — ja.** `,` in Deutsch und Spanisch, `.` in Englisch. Das ist die
einzige Taste mit sprachabhängiger Aufschrift. **Aber:** die Anzeige benutzt heute einen **Punkt**
(belegt: `evaluate('sin(30)').display === '0.5'`). Taste und Anzeige sind gleichzuziehen — sonst
trägt die Taste ein anderes Zeichen als das, was der Rechner zeigt. Steht als offene Frage unten.

**4 · Auch Programmierer und RPN — ja.** Eigene Tastenfelder, gezeichnet in
`work/rechner-tasten-programmierer-rpn.html`. Zwei Folgen über die Oberfläche hinaus:
- **RPN:** `ENTER`, `DROP`, `SWAP`, `ROLL` verlangen einen **Stapelzustand** zwischen den
  Anschlägen. Heute ist RPN eine getippte Zeichenkette. Entweder (a) RPN bleibt die Zeichenkette
  und bekommt nur Zeichen statt Wörter, oder (b) es wird ein echter Stapelrechner — Aufwand im
  Rechenkern, nicht im Tastenfeld.
- **Programmierer:** `A–F` haben in DEC, OCT und BIN keine Ziffernbedeutung (in BIN bleiben `0` und
  `1`). Vorschlag: je Basis abschalten, nicht nur blass darstellen.

**Ebenfalls gemessen, weil es den Entwurf trägt:** der Rechenkern kennt die hübschen Zeichen nicht.
`2 × 3` → „Undefined symbol ×", `6 ÷ 2` → „Undefined symbol ÷", `5 − 2` (U+2212) → Syntaxfehler,
`1,5 + 1` → Fehler. Die Taste darf `×`, `÷`, `−` zeigen — **ablegen muss sie `*`, `/`, `-`.**
Empfehlung: die Eingabezeile zeigt die abgelegte Form. Eine zweite Umschreibregel zwischen Anzeige
und Ausdruck wäre genau die stille Zweideutigkeit, die in diesem Projekt schon einmal einen Faktor
1000 gekostet hat.

**Geändert gegenüber oben:** In der ersten Tafel war `40,7` gezeichnet — nach der Messung
berichtigt auf `40.7`. Die erste Tafel ist neu gerendert.

## Nachtrag 2026-10-04 (dritter): M2 und M3 sind ungenau beziehungsweise unvollständig

*Auf Thomas' Rückfrage („M2 was ist das Problem? M3 erklären"). Sein Wortlaut und der alte
Wortlaut bleiben stehen; dieser Abschnitt berichtigt und ergänzt.*

**M2 wird schärfer gefasst — der Dezimaltrenner ist heute schon ein Fehler in der Anwendung, nicht
nur ein Widerspruch in der Anzeige.** Im Code nachgelesen (`calculator/core.ts`):

- `evaluate(expression, …)` übergibt den Ausdruck **unverändert** an mathjs (Zeile 205). Ein
  deutsches Komma (`1,5 + 1`) läuft damit in einen Syntaxfehler — im Standard- und
  Wissenschaftlich-Modus ist `1,5` heute **nicht eingebbar**.
- Es gibt einen Helfer `normalizeDecimalInput` (Zeile 260), der `1,5` → `1.5` macht. Er wird
  **nur im RPN-Pfad** benutzt (Zeile 357, je Token). In der normalen Ausdrucksauswertung kommt er
  nicht vor.
- Die Anzeige gibt den Wert mit **Punkt** aus (`formatValue` → `raw` → `display`; belegt im Test:
  `evaluate('sin(30)').display === '0.5'`), während der Sprachkatalog im Satz „0,1 + 0,2 ergibt
  0,3" ein Komma verspricht.

**Folge für den Entwurf:** Eine Taste `,` ist damit **keine Aufschrift-Frage, sondern eine
Funktionsfrage.** Sie würde einen Ausdruck erzeugen, den der Kern ablehnt. Drei Wege:
(a) die Taste schreibt einen Punkt — dann stimmt die Aufschrift nicht mit dem überein, was
eingefügt wird; (b) der vorhandene Helfer wird auch auf den Ausdruckspfad angewendet — dann
funktioniert `1,5` überall; (c) zusätzlich wird die Anzeige lokalisiert.
**Empfehlung: (b) und (c) zusammen** — eine Regel für Eingabe und Anzeige, und ein bestehender
Fehler mitbehoben. Der Aufwand liegt im Rechenkern, nicht im Tastenfeld.

**M3 wird durch einen echten Fall ergänzt: das Zeichen `∛` wäre über `x^(1/3)` eine Falle.**
Gemessen in allen drei Zahlenmodellen (`number`, `BigNumber`, `Fraction`):

| Ausdruck | Ergebnis |
|---|---|
| `(-8)^(1/3)` | `1 + 1.732050807568877i` — **komplex** |
| `cbrt(-8)` | `-2` |
| `nthRoot(-8,3)` | `-2` |

Ein `∛`-Taste, die auf die vorhandene Potenz abgebildet wird, liefert für negative Zahlen also
**keine reelle Wurzel**, sondern eine komplexe Zahl — der klassische Fehler „∛−8 = −2" wird dort
nicht erfüllt. Damit stehen zwei Wege: (a) `cbrt` (und `nthRoot`) in die kuratierte Factory-Liste
aufnehmen — Kosten zu messen, dann ist `∛` korrekt; (b) `∛` nicht anbieten und nur `x^(1/n)`
führen. **Empfehlung: (a)**, mit gemessenem Preis.
Das gilt **nur** für die ungerade Wurzel aus negativen Zahlen; `√(-4)` ist im Reellen zu Recht
nicht definiert.

## Nachtrag 2026-10-04 (vierter): zwei Entscheidungen und der gemessene Preis für `cbrt`

*Auf Thomas' Antwort „2 nach deiner Empfehlung, 3 cbrt aufnehmen". Der alte Wortlaut bleibt stehen.*

### Entscheidung 2 — Dezimaltrenner: Eingabe **und** Anzeige, nach meiner Empfehlung

Festgelegt ist damit der Weg **(b) und (c)** aus dem dritten Nachtrag:

1. Der vorhandene Helfer `normalizeDecimalInput` wird **auch im Ausdruckspfad** angewendet, nicht
   nur im RPN-Pfad. `1,5 + 1` funktioniert danach überall. **Ein Fehler der Anwendung ist damit
   mitbehoben**, nicht nur eine Unstimmigkeit der neuen Oberfläche.
2. Die **Anzeige wird lokalisiert**: Deutsch und Spanisch zeigen `0,5`, Englisch `0.5`. Dafür
   braucht der Formatierer eine Dezimaltrenner-Option — heute liefert er immer einen Punkt.
3. Eine Regel für beide: was eingegeben wird und was angezeigt wird, benutzt denselben Trenner.
   Was **kopiert** wird, ist derselbe Text, der auch in der Anzeige steht — und weil die Eingabe
   normalisiert, ist er beim Wiedereinwerfen auswertbar.

### Entscheidung 3 — `cbrt` wird aufgenommen, Preis gemessen

**Messverfahren** (damit die Zahl nachprüfbar ist): esbuild `--bundle --minify --format=esm
--target=es2020`, Einstieg gegen die **echte** Factory-Liste des Projekts
(`packages/tools/src/calculator/functions.ts`), gzip über Node `zlib` Stufe 9. Wegwerf-Verzeichnis
`.measure/` im Projekt, nach der Messung wieder entfernt; kein Quellcode geändert.

| Variante | roh | **gzip** | Delta |
|---|---:|---:|---:|
| **Baseline** — heutige kuratierte Liste | 361.042 B | **102.073 B (99,7 KiB)** | — |
| **+ `cbrt`** | 362.509 B | **102.524 B (100,1 KiB)** | **+451 B (0,44 KiB)** |
| + `cbrt` und `nthRoot` | 364.680 B | 103.089 B (100,7 KiB) | +1.016 B |
| Referenz `create(all)` | 661.355 B | 191.755 B (187,3 KiB) | — |

**Kontrollprobe, die die Zahl glaubwürdig macht:** Die Baseline von **102.073 B gzip** trifft den im
Projekt selbst gemessenen Rechenkern-Chunk von **102.475 B gzip** (Übergabe Welle 6) auf 0,4 % genau.
Das Verfahren misst also das, was im Browser landet — nicht eine Wunschzahl. (Die im Suite-Konzept
genannten 91,6 kB waren eine andere Zusammenstellung; die 187,3 KiB für `create(all)` entsprechen der
dortigen Größenordnung von 185,3 KiB, mit anderem gzip-Werkzeug.)

**Funktionsnachweis, nicht nur Größe:** mit aufgenommener Factory liefert `cbrt(-8)` aus dem
gebauten Bündel den Wert **`-2`**, während `(-8)^(1/3)` weiterhin `1 + 1.732…i` ergibt. Die Taste
`∛` muss also auf **`cbrt(`** abgebildet werden, nicht auf die Potenz — der Unterschied ist genau
der Fehler, der sonst ausgeliefert würde.

**Folge für die Umsetzung:** `cbrtDependencies` kommt in `calculatorFactories`, und **`cbrt` gehört
in `calculatorFunctions`** — die Liste, die im Test jede angebotene Funktion einmal aufruft. Ohne
diesen Eintrag wäre die neue Factory nicht abgesichert (eine fehlende Factory bricht erst zur
Laufzeit, ADR 0005).

**Empfehlung, die dazu gehört:** `nthRoot` für **+565 B** mit aufnehmen. Ohne sie bleibt die Taste
`ⁿ√x` (zweite Belegung von `xʸ`) auf `x^(1/n)` angewiesen — und die liefert für `∛-8`-artige Fälle
wieder eine komplexe Zahl. Dieselbe Falle hätte sonst einen zweiten Eingang. **Braucht Thomas' Nod.**

### Weiterhin offen

- [ ] **Schreibweise im Ausdruck** (die erste der drei Fragen von damals ist nicht beantwortet).
      Empfehlung unverändert: **abgelegte Form** (`*`, `/`, `-`, Punkt) — ehrlich und sofort
      kopierbar. **Neue Nuance durch Entscheidung 2:** da der Ausdruckspfad jetzt ohnehin einen
      Normalisierungsschritt bekommt, wären auch die hübschen Zeichen dort umschreibbar. Beide Wege
      sind damit gangbar; die Frage ist, ob die Eingabezeile `2×3` oder `2*3` zeigt.
- [ ] `nthRoot` mit aufnehmen (Empfehlung: ja, +565 B).
- [ ] Variante A oder B · RPN-Zustand · Abschaltung der Zifferntasten · Umfang des Blattes `⋯` ·
      Anzeige-Renderer und Schriftlizenz (ungemessen).

## Nachtrag 2026-10-04 (fünfter): Anzeige 1 ist die 2D-Darstellung, Anzeige 2 der rohe Term

*Auf Thomas' Vorgabe. Der alte Wortlaut bleibt stehen — **er ist an einer Stelle überholt:***

> „**Standard bleibt Text** — der kopierbare Zustand ist der sichere Ausgangspunkt."
> (Abschnitt „3 · Anzeige — zwei Zustände, ein Klick", Vorschlag oben)

**Das gilt nicht mehr.** Thomas hat die Reihenfolge festgelegt: **Anzeige 1 ist die
zweidimensionale, schöne Darstellung; Anzeige 2 ist der rohe, maschinenlesbare, gut kopierbare,
leicht bearbeitbare Term.** Die 2D-Form ist damit die **erste** Anzeige, nicht die zweite.

**Was das nach sich zieht — und ich sage es, bevor gebaut wird:**

1. **Der ungemessene Renderer wird zur Grunderfahrung.** Bisher war 2D die Zugabe; jetzt ist es
   die Anzeige, die man zuerst sieht. Die Renderer-Prüfung (Temml, KaTeX, MathJax, eigene
   Abbildung) ist damit **Bedingung der Welle**, nicht ihr Nachtrag.
2. **Ein Rückfall ist Pflicht, nicht Kür.** Lässt sich ein Ausdruck nicht setzen (unbekannte Form,
   Ladefehler der Engine), zeigt Anzeige 1 den rohen Term und meldet nichts — dieselbe Regel wie
   bei der misslungenen Vorschau. Ohne diesen Rückfall wäre ein nicht gesetzter Ausdruck ein
   schwarzer Bildschirm.
3. **Dieselbe Höhe für beide Anzeigen** bleibt: sonst springt das Tastenfeld beim Umschalten.
   Gezeichnet ist das in `work/rechner-anzeige-2d.html` (124 px Mindesthöhe).
4. **Kopieren bleibt in beiden Zuständen der rohe Term** — aus Anzeige 1 heraus genauso. Die
   Zahlenmodell-Einstellung „Bruch" ist dabei der häufigste Fall für den Gewinn: `1/3 + 1/6` als
   gesetzter Bruch statt als Schrägstrich.
5. **Nicht zweidimensional wird:** eine reine Dezimalzahl (`4882812.5`), der RPN-Stapel und die
   Programmierer-Darstellungen. Dort bringt der 2D-Satz keinen Gewinn.
6. **Der Umschalter steht auf 2D** — die rohe Anzeige ist der Arbeitszustand für Tippen, Einfügen
   und Prüfen, die 2D-Anzeige der Ruhezustand nach der Rechnung. Ein Klick, kein Menü.

**Zeichnung:** `work/rechner-anzeige-2d.html` / `.png` — Anzeige 1 (dunkel und hell) mit
Bruchsumme, Wurzel aus einem Bruch, drei Ebenen ineinander, Kubikwurzel, Potenz mit kursiver
Variable; Anzeige 2 als roher Term mit Auswahl, Cursor und Kopierknöpfen; dazu eine Tafel mit den
Maßen (Schriftlage nach ISO 80000-2, Größenstufen, Bruchstrich 1,7 px, feste Anzeigehöhe, Umbruch
an den Rechenzeichen).

**Offen und in dieser Zeichnung ausdrücklich benannt:** die **Schrift** der Formeln. Die Tafel
benutzt die Systemschrift (Inter für Text, Cambria Math für die kursiven Variablen), damit 0 kB
und keine Lizenzfrage — aber das Bild ist dann je Gerät verschieden. Eine mitgelieferte
Matheschrift gäbe überall dasselbe Bild und brächte eine Schriftdatei **mit eigener Lizenzfrage**
mit. **Keine Matheschrift ist lizenzmäßig geprüft** — das gehört in dieselbe Messung wie der
Renderer.


---

## Nachtrag 6 · 2026-10-04 — Umsetzung gelaufen, vier gemessene Fehler behoben

Der Entwurf ist gebaut (Tastenfeld für vier Rechenarten, Anzeige 1/2 mit Eigenbau-MathML,
`cbrt` und `nthRoot` im Kern). Bei der Abnahme am laufenden Programm kamen Fehler heraus, die
der Entwurf nicht vorhersah. Sie stehen mit Beleg in
`uebergabe/05-uebergaben/2026-10-04-rechner-tastenfeld-umgesetzt.md`; hier die für den Entwurf
wichtigen Schlüsse:

1. **Ein Test einzelner Tasten ist zu wenig.** `appendSnippet` setzte zwischen zwei Ziffern ein
   Leerzeichen — jede mehrstellige Zahl war über die Tasten unlesbar. Der Entwurf sprach nur von
   „Tasten müssen einen lesbaren Ausdruck ergeben"; das muss **Folgen** prüfen, nicht Einzeltasten.
   Neuer Testblock `Tastenfolgen`.
2. **`=` braucht je Rechenart seinen Weg.** Im RPN-Modus bekam der Ausdrucksleser die
   Token-Zeichenkette. Der Entwurf hat die Taste `=` nicht ausdrücklich an den Stapel gebunden.
3. **Die Anzeige-Basis ist mehr als eine Darstellungstafel.** Bei `HEX` stand das Ergebnis
   dezimal. Konsequenz im Entwurf: der 2D-Satz kennt keine Basisschreibweise und fällt bei anderer
   Basis als DEC bewusst auf den rohen Term zurück.
4. **Der lokale Speicher darf das Rechnen nicht tragen.** Fehlte er, tat `=` stumm nichts. Verlauf
   und Einstellungen sind Beiwerk, nicht Voraussetzung.

**Offen bleibt im Entwurf:** die Schrift der Formeln (keine Matheschrift ist lizenzgeprüft), die
Schreibweise im abgelegten Term (`*`/`/` gegen `×`/`÷`), RPN-Stapeltasten und die Eingabe von
`A`–`F` im Programmierer-Modus.


---

## Nachtrag 7 · 2026-10-04 — die fünf offenen Punkte entschieden und umgesetzt

Thomas hat die offenen Punkte freigegeben („nach eigenem Ermessen lösen"). Entschieden und gebaut:

1. **Schreibweise im abgelegten Term bleibt `*` und `/`.** Die Taste zeigt `×`/`÷`, gespeichert
   wird die rechenbare Form. Grund: Anzeige 2 ist ausdrücklich die *maschinenlesbare* Fläche —
   ein `×` darin müsste beim Wiedereinfügen erst übersetzt werden. Damit ist der Punkt geschlossen,
   nicht verdrängt.
2. **RPN bekommt Stapelgriffe, aber keinen Stapel im Speicher.** `SWAP` und `DROP` arbeiten auf der
   **Tokenfolge**: `SWAP` tauscht die letzten beiden Werte, `DROP` verwirft den letzten. Damit lässt
   sich eine falsch getippte Reihenfolge korrigieren (`4 3` → `SWAP` → `3 4 +` = 7, belegt), ohne den
   Rechenkern um einen Stapelzustand zu erweitern. `ENTER` gibt es bewusst **nicht**: bei einer
   geschriebenen Folge trennt bereits das Leerzeichen — eine Taste ohne Wirkung wäre eine tote Taste.
3. **Ziffern `A`–`F` setzen ihr `0x` selbst.** Vorher erzeugten sie einen mathjs-Namen
   („Der Ausdruck ist nicht lesbar"), die Tasten waren tot. Jetzt wird `0x` vorangestellt, sofern
   nicht schon eine Hexadezimalzahl am Ende steht: `A` → `0xA`, danach `F` → `0xAF` = 175
   (belegt über die Tasten, Anzeige-Basis HEX → `0xaf`).
4. **Das Bruch-Modell bekommt einen sichtbaren Ausweg statt einer Sackgasse.** Die Meldung nennt
   jetzt den Grund, und direkt darunter steht der Knopf **„Mit Dezimal rechnen"**: derselbe Term
   wird im Dezimal-Modell gerechnet und das Modell dauerhaft umgestellt. Kein stiller Modellwechsel —
   die Umstellung ist sichtbar und wird ausdrücklich ausgelöst (belegt: `√2` → `1,4142135623731`).
5. **Variante A (Tastenfeld ohne Eingabezeile) wird nicht gebaut.** Anzeige 2 soll der „leicht
   manipulierbare Term" sein — dafür braucht es ein Feld, in dem man schreiben, korrigieren und
   einfügen kann. Das Tastenfeld tritt daneben, nicht an die Stelle.
6. **Schrift der Formeln bleibt die Systemschrift.** Eine mitgelieferte Matheschrift wäre 0 kB
   los, hätte aber eine eigene Lizenzfrage; die ist ungemessen. Solange das Bild nur je Gerät
   verschieden ist und nichts falsch setzt, bleibt es so.

**Zwei weitere Fehler fielen beim Belegen auf und sind behoben:** die RPN-Stapelgriffe rutschten im
Raster (SWAP neben `e`, DROP allein in einer Reihe — die Null ist jetzt drei Zellen breit, beide
stehen nebeneinander), und die Rasterprüfung konnte das nicht sehen, weil sie nur Überläufe prüft.
Dafür gibt es jetzt eine ausdrückliche Zusicherung zur Lage der beiden Griffe.
