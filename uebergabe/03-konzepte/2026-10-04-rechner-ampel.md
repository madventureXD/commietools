# Konzept: Ampel für Rechengenauigkeit (Rechner)

**Status:** entwurf — berichtigt am 2026-10-04, siehe Nachtrag am Ende (der Wortlaut oben bleibt stehen)

**Zusatz 2026-10-07 (Faber, QM-Karte M10-001) — aktueller Statuskopf.** Die Ampel ist **umgesetzt und entschieden**: **ADR 0006** (`04-entscheidungen/0006-voller-wert-und-genauigkeitsampel.md`) trägt den vollen Wert getrennt von der Anzeige; die Oberfläche zeigt grün `=` oder rot `≈`, der einmalige Rückfall ins Dezimalmodell ist sichtbar. Der Statuskopf oben bleibt als damaliger Stand stehen.
Der Statuskopf oben bleibt als Stand vom 2026-10-04 stehen (Korrekturregel: ergänzen, nicht überschreiben).
**Datum:** 2026-10-04  
**Verantwortlich:** Faber (Umsetzung) · Thomas (Entscheidung)

Zeichnung: `work/rechner-ampel-concept.html` / `.png` (nicht versioniert, `work/` ist ausgenommen)

## Ausgangslage

Der Rechner kann in zwei Zahlenmodellen rechnen, und der Unterschied ist für den Nutzer **unsichtbar**:

- **Bruch-Modell** rechnet exakt, solange das Ergebnis ein Bruch sein kann (`1/3 + 1/6` → `1/2`,
  `0,1 + 0,2` → `3/10`). Wurzeln und Winkelfunktionen kann es **gar nicht**.
- **Dezimal-Modell** rechnet intern mit 64 Stellen, **zeigt aber 14 Stellen an** (`1/3` →
  `0,33333333333333`, `√2` → `1,4142135623731`). Angezeigt wird also gerundet.

Gemessen am 2026-10-04 mit dem echten Kern: die Einstellung hieß bis heute „Dezimal (exakt, 64
Stellen)" — das war **falsch** und ist inzwischen auf „Dezimal (14 Stellen angezeigt)" richtiggestellt.
Der ausführliche Hinweistext auf der Seite nannte 64/14 schon vorher korrekt.

Der lehrreichste gemessene Fall: `1/3 × 3` zeigt **`1`**, intern steht **0,999…9**. Wer die angezeigte
Zahl kopiert und weiterrechnet, arbeitet mit einer gerundeten Zahl — ohne es zu ahnen.

Dazu kommt die Sackgasse: wählt jemand „Bruch" und rechnet `√2`, meldet der Rechner heute einen
Fehler mit Ausweg-Knopf. Das ist ehrlich, aber es unterbricht den Fluss — und es ist die Stelle, an
der ein automatisches Ausweichen naheliegt.

## Ziele

- **Genauigkeit sichtbar machen**: ein Blick sagt, ob das Gezeigte vollständig oder gerundet ist.
- **Kein stiller Modellwechsel**: springt der Rechner ein, steht es sichtbar da.
- **Zeichen statt Wörter** in der Anzeige — passend zur Tastenlinie des Werkzeugs.
- **Barrierefrei**: die Ampel darf nicht allein über Farbe wirken.
- **Mobil bedienbar**: die Erklärung muss beim Tippen erscheinen, nicht nur beim Zeigen mit der Maus.

## Nicht-Ziele

- **Keine Änderung am Rechenkern.** Zustand und Ausweichen entstehen in der Oberfläche aus dem, was
  der Kern schon liefert (Fehlerart `numberModel`, Werte mit 14 und 64 Stellen).
- **Keine neue Abhängigkeit**, keine Schriftdatei, kein Ladezustand.
- **Kein permanenter Modellwechsel** durch die Hintertür (siehe Offene Fragen, Empfehlung).
- Keine Umstellung des abgelegten Terms (`*`/`/` bleiben — Nachtrag 7 des Oberflächenkonzepts).

## Vorschlag

### 1. Drei Zustände, an einer Stelle gemessen

Der Zustand wird **nicht geschätzt**, sondern am Ergebnis verglichen: die Ausgabe mit 14 Stellen
gegen die Ausgabe mit 64 Stellen. Beides liefert der Kern heute schon.

| Zustand | Zeichen | Bedingung | Gemessene Beispiele |
| --- | --- | --- | --- |
| vollständig | `=` grün | 14-Stellen-Ausgabe **gleich** 64-Stellen-Ausgabe — oder Bruch-Modell mit Bruchergebnis | `1/3+1/6` → `0.5`, `√4` → `2`, `sin(30°)` → `0.5`, `1/2`, `2/7` |
| gerundet | `≈` gelb | die beiden Ausgaben **unterscheiden sich** | `1/3` → `0.33333333333333`, `2/7`, `√2`, `π`, `1/3*3` → `1` |
| nur anderes Modell | `≈` rot | Kern meldet `numberModel`; gerechnet wurde im anderen Modell | `√2`, `sin(30°)` im Bruch-Modell |

**Grün heißt nicht „mathematisch exakt", sondern „das Angezeigte ist der ganze Wert dieser Anzeige".**
Deshalb ist `sin(30°)` grün, obwohl es keine Bruchrechnung ist. Die Ampel ist ein
**Wahrheitsanzeiger**, keine Fehlermeldung — `1/3 × 3` wird gelb, obwohl `1` harmlos aussieht.

### 2. Zwei Formen zur Wahl

- **A — Punkt mit Zeichen daneben** (10 px Punkt, Zeichen `=`/`≈` in derselben Farbe): schlank, fügt
  sich in die Zeile der Merker (`DEZ`, `BRUCH`, `HEX`) ein. **Empfehlung.**
- **B — Zeichen im Punkt** (22 px, Zeichen in der Punktfläche): auffälliger, zieht aber Aufmerksamkeit
  von der Rechnung weg.

In beiden Formen **trägt das Zeichen die Bedeutung, die Farbe verstärkt sie**. Gelb und Rot teilen sich
das Zeichen `≈`; unterschieden werden sie durch den sichtbaren Hinweistext dahinter
(„automatisch mit Dezimal gerechnet") — also nicht allein durch Farbe.

### 3. Erklärung bei Zeigen und Tippen

Eine eigene kleine Sprechblase am Rechner, geöffnet durch:
- **Zeigen** mit der Maus,
- **Tippen** auf dem Handy,
- **Ansteuern mit der Tastatur** (Fokus, `Enter`/`Leertaste`).

Inhalt: drei Zeilen — was `=`, `≈` gelb und `≈` rot bedeuten. Technisch ist die Ampel ein Knopf mit
`aria-expanded` und die Blase ein Element mit `role="status"`; der Zustandstext wird zusätzlich als
`aria-label` geführt, damit Vorleser ihn ohne Öffnen haben.

**Nicht** ausreichend: ein nativer Kurzhinweis (`title`) — der erscheint auf dem Handy beim Tippen
nicht. Genau deshalb eine eigene Blase.

### 4. Automatisches Rechnen (Empfehlung: einmalig, nicht dauerhaft)

1. Modell steht auf **Bruch**, eingetippt wird `√2`.
2. Der Kern lehnt ab — Grund ist als eigene Fehlerart geführt (`numberModel`).
3. Der Rechner rechnet **einmalig** im Dezimal-Modell und zeigt das Ergebnis.
4. Ampel wird **rot**, darunter steht „automatisch mit Dezimal gerechnet".
5. Die **Einstellung bleibt auf Bruch**. Wer dauerhaft dezimal will, stellt es selbst um — der
   vorhandene Knopf „Mit Dezimal rechnen" bleibt als ausdrücklicher Weg bestehen.

## Alternativen

| Alternative | Warum nicht (oder nur als Variante) |
| --- | --- |
| Dauerhafter Modellwechsel beim Ausweichen | Ändert stillschweigend eine Einstellung des Nutzers; die nächste Rechnung verhält sich anders, ohne dass es jemand erwartet. Nur auf ausdrücklichen Wunsch. |
| Nur der vorhandene Fehler-Knopf (heutiger Stand) | Ehrlich, aber unterbricht den Fluss — der Nutzer muss den Fehler erst lesen und dann handeln. Bleibt als Weg erhalten, nicht als einziger. |
| Prozentangabe der Genauigkeit („13 von 14 Stellen") | Zahl im Kopf, wo ein Blick genügt; zudem wäre „Stellen" bei Brüchen unsinnig. Die Blase kann die Zahl nennen, die Ampel nicht. |
| Eine Zahl als Genauigkeitsmaß im Verlauf (`≈`-Marke) | Nützlich für später; heute kein Bedarf, weil der Verlauf keine Rechnungen vergleicht. |
| Farbe allein (Punkt ohne Zeichen) | Fällt bei Farbwahrnehmungsstörungen weg (WCAG 1.4.1 „Use of Color"). |
| Neue Bibliothek für Hinweisfenster | Nicht nötig: eine Zustandsvariable und etwas CSS leisten dasselbe. Kein Bundlezuwachs. |

## Auswirkungen

- **Local First / Datenschutz:** nichts verlässt den Browser; die Ampel rechnet nur mit, was schon da ist.
- **Offline First:** keine Abhängigkeit von Netz oder Zusatzdatei.
- **UI / Barrierefreiheit:** Zeichen zusätzlich zur Farbe (WCAG 1.4.1); Blase per Tastatur erreichbar;
  Zustandstext als `aria-label`; die Anzeigehöhe bleibt **unverändert** (die Regel des
  Oberflächenkonzepts: sonst springt das Tastenfeld beim Umschalten).
- **Internationalisierung:** rund fünf neue Schlüssel je Sprache (Blasen-Text, Zustandsnamen,
  Hinweis „automatisch mit Dezimal gerechnet"). Textbudget: derzeit 26,8 KiB von 30,7 KiB gzip —
  Reserve reicht; nach dem Bau wird gemessen, nicht gerechnet.
- **Modularität / Suiten:** nur der Rechner betroffen. Die Farbmarke liegt in `packages/ui/src/tokens.css`
  und steht damit allen Werkzeugen zur Verfügung.
- **Abhängigkeiten / Lizenzen:** keine neue Abhängigkeit, kein neuer Lauf im Lizenzprüflauf.
  Für Gelb fehlt eine Farbmarke: Vorschlag `--color-caution`, hell `#8a5a00`, dunkel `#f0b352`
  (neu, kein Fremdmaterial).
- **Tests / Migration:** der Zustand ist **messbar**, also prüfbar — Testfälle über die
  Modelle hinweg (grün/gelb/rot). Für die Blase: Bedienprüfung per Tastatur und Tippen in der
  Aufnahme; keine Datenmigration nötig (nichts wird gespeichert).

## Offene Fragen

- [ ] **Ampel A oder B?** (Empfehlung A — schlank, fügt sich in die Merker-Zeile.)
- [ ] **Soll die Einstellung beim automatischen Ausweichen mitwandern** oder einmalig gelten?
      (Empfehlung: einmalig, Einstellung bleibt.)
- [ ] Zweistufig (grün/rot) oder dreistufig (grün/gelb/rot)? (Empfehlung: dreistufig — der Unterschied
      zwischen „gerundet, aber wie gewünscht gerechnet" und „nur mit dem anderen Modell möglich" ist
      die eigentliche Information.)
- [ ] Soll die Blase zusätzlich die Zahl nennen („wahr: 1,41421356237309504…", „gerechnet mit 64 Stellen")?
      (Empfehlung: ja, in der Blase, nicht in der Ampel.)
- [ ] Soll der zusätzliche Knopf „Ergebnis mit 64 Stellen kopieren" gebaut werden (Idee aus der
      Besprechung), damit der kopierte Term wirklich vollständig ist?

## Akzeptanzkriterien

- [ ] Für `1/3+1/6`, `√4` und `sin(30°)` steht die Ampel auf **grün**, für `1/3`, `2/7`, `√2`, `π` und
      `1/3*3` auf **gelb** — nachgewiesen durch Testfälle, die beide Ausgaben vergleichen.
- [ ] Bei gewähltem Bruch-Modell und `√2` steht das Ergebnis da, die Ampel ist **rot**, der Hinweis
      „automatisch mit Dezimal gerechnet" ist sichtbar, und die Einstellung steht weiterhin auf **Bruch**.
- [ ] Die Erklärung öffnet sich per Maus, per Tippen **und** per Tastatur; ohne Farbwahrnehmung ist der
      Zustand an Zeichen und Text unterscheidbar (Prüfung: Graustufenaufnahme).
- [ ] Die Anzeigehöhe ist mit und ohne Ampel gleich (gemessen im Browser, kein Springen des Tastenfelds).
- [ ] Geprüft in allen drei Sprachen (de/en/es) und in beiden Farbthemen; Farbkontraste mindestens AA
      (gemessen: Grün 5,15:1 hell / 9,31:1 dunkel, Gelb 5,93:1 / 9,35:1, Rot 5,65:1 / 5,31:1).
- [ ] `npm run check` grün; Startbündel und Werkzeugtexte innerhalb der Schwellen (Messwerte im Beleg).

## Aufwand (Schätzung nach Referenzklasse)

Etwa **2 bis 3 Stunden** in einem Zug, gemessen an der heutigen Arbeit am selben Werkzeug: Ampel und
Blase in der Oberfläche, Zustandsregel mit Testfällen, Ausweichen automatisch statt per Klick, fünf
Schlüssel in drei Sprachen, Farbmarke in beiden Themen, Belegaufnahmen, Dokunachtrag. Kein Eingriff in
den Rechenkern, keine neue Abhängigkeit.

**Ehrliche Unsicherheit:** die Blase auf dem Handy und die Tastaturbedienung sind bisher in diesem
Projekt **nicht** erprobt (die vorhandenen Aufnahmen prüfen nur Klicken) — das ist der Teil, der
länger dauern kann als geschätzt.

---

## Nachtrag 2026-10-04 — Berichtigung nach eigener Messung

*Ergänzt auf Thomas' Weisung „Konzept so berichtigen". Der Wortlaut oben bleibt stehen; die
folgenden Punkte ersetzen ihn, wo sie ihm widersprechen.*

**Anlass.** Der Entwurf stützt sich auf den Satz „die Ausgabe mit 14 Stellen gegen die Ausgabe mit
64 Stellen — beides liefert der Kern heute schon" und führt als Nicht-Ziel „keine Änderung am
Rechenkern". Dieser Satz ist **falsch**. Nachgemessen am echten Rechenkern (esbuild-Bündel der
Kernmodule, mathjs 15.2.0 aus dem Projekt, kein Quellcode geändert); vollständige Ausgabe in
`07-pruefung/rechner-ampel/2026-10-04-genauigkeitsmessung.txt`.

**1. Der volle Wert kommt nicht heraus.** `evaluate('1/3', { number: 'BigNumber' })` liefert
`display` **und** `raw` als `0.33333333333333` — 14 Stellen, beide gleich. Die Option `precision`
(40 und 14 geprüft) ändert die Ausgabe **nicht**: `formatValue` formatiert fest mit
`DISPLAY_PRECISION = 14`; `precision` wirkt ausschließlich auf die interne Rechnung. Der volle Wert
existiert im Kern und ist über dessen mathjs-Instanz abrufbar
(`format(value, { precision: 64 })` → 64 Stellen) — er wird nur nicht herausgegeben.

**Folge:** Der geplante Vergleich „14 gegen 64" ist mit dem heutigen Kern **nicht durchführbar**.
Ohne zusätzliche Ausgabe müsste die Ampel raten; ein Wahrheitsanzeiger, der rät, ist schlimmer als
keiner. **Das Nicht-Ziel „keine Änderung am Rechenkern" fällt.**

**2. Vorgeschlagene Kernänderung (klein und prüfbar).** `Calculation` erhält ein zusätzliches Feld
(vorschlagsweise `full`) mit dem unformatierten Wert neben `display`. Setzstelle ist `evaluate`
(Zeile der Rückgaben), die Formatierung bleibt unangetastet. `raw` wird **nicht** umgedeutet: an
`raw` hängen Verlauf und Weiterverwendung (Regel aus Welle 6: „wer weiterrechnet, nimmt den Wert —
nie die Anzeige"). Mit Testfällen über beide Zahlenmodelle. Keine neue Abhängigkeit.

**3. Das Verfahren ist belegt — aber „grün" hat eine Grenze, die der Blasentext sagen muss.**
Gemessen im Dezimal-Modell (Anzeige 14 Stellen gegen intern 64):

| Term | angezeigt | intern (64) | Befund |
| --- | --- | --- | --- |
| `1/3×3` | `1` | `0.9999…9` | gerundet |
| `√2` | `1.4142135623731` | `1.4142135623730950488…` | gerundet |
| `2^0.5` | `1.4142135623731` | `1.4142135623730950488…` | gerundet |
| `sin(pi)` (rad) | `3.0781640628621e-6` | `3.0781640628620899862…` | gerundet |
| `√2×√2` | `2` | `2` | vollständig angezeigt |
| `1/7×7`, `pi/pi` | `1` | `1` | vollständig angezeigt |
| `0,1+0,2`, `sin(30°)`, `log(1000,10)` | `0,3` / `0,5` / `3` | gleich | vollständig angezeigt |

`√2×√2` ist der lehrreiche Fall: „vollständig angezeigt" ist richtig, „exakt gerechnet" wäre falsch
— die Wurzel war zwischendurch gerundet. **Genau so bleibt die Diktion des Entwurfs** („das
Angezeigte ist der ganze Wert dieser Anzeige"), nur der Beweisweg ändert sich.

**4. Im Bruch-Modell ist eine Aussage mehr möglich, als der Entwurf annimmt.** Ein Bruchergebnis ist
beweisbar exakt (`1/2`, `3/10`, `1/1` — rationale Arithmetik, keine Rundung). Das Modell springt
aber für Wurzeln und Winkelfunktionen auf gewöhnliche Rechnerzahlen um: `sin(pi)` steht intern als
`1.2246467991473532e-16` und wird als `0` angezeigt, `2^0.5` als `1.4142135623730951` gegen `1.4142135623731`
in der Anzeige. Dort ist nichts exakt. Die Ampel muss das als gerundet melden. Damit sind es drei
ehrliche Stufen: **exakt (Bruch) · vollständig angezeigt (Dezimal) · gerundet**.

**5. Ein Messfehler, der hier festgehalten gehört.** Der erste Prüflauf verglich mit `math.equal`
und hielt `1/3` für „unverändert": `math.equal` prüft mit Toleranz (`relTol` 1e-12) und ist für
Genauigkeitsfragen untauglich. Belastbar ist der **Zeichenkettenvergleich** beider Darstellungen —
so misst die Tabelle oben. Wer die Ampel baut, darf nicht über mathjs-Vergleiche rückenschließen.

**6. Zwei Nebenbefunde.** Das Vorgabe-Zahlenmodell des Kerns ist `Fraction`
(`calculatorFor`: `options.number ?? 'Fraction'`), nicht BigNumber — eine Messung ohne ausdrückliche
Option misst den Bruchweg. Und die Fehlerklasse `numberModel` existiert real (`√4`, `√2`,
`sin(30°)` im Bruch-Modell), der rote Zustand hat also eine belegte Grundlage stärker als im
Entwurf angenommen.

**7. Berichtigter Aufwand.** Statt 2–3 Stunden **2,5 bis 3,5 Stunden**: hinzu kommt die Kernänderung
mit Testfällen (rund zehn Zeilen plus Prüfungen über beide Modelle), hinzu kommt die Messung als
Beleglage. Kein Eingriff in die Rechenlogik, keine neue Abhängigkeit, kein neuer Lizenzlauf.

**8. Folge für den Blasentext.** Nicht „mathematisch genau", sondern: *„Der gezeigte Wert ist der
vollständige Wert des Rechners"* (grün) · *„Der Rechner hat mehr Stellen, als hier stehen"* (gelb) ·
*„Für diese Rechnung wurde automatisch das Dezimal-Modell benutzt"* (rot) · *„Exakter Bruch"*
(Bruch-Modell). Die Einschränkung aus Punkt 3 gehört in die Blase, nicht ins Kleingedruckte.

**Offen bleibt wie zuvor:** die fünf Entscheidungsfragen (Ampel A oder B · Ausweichen einmalig oder
dauerhaft · zwei- oder dreistufig · Zahl in der Blase · Knopf „Ergebnis mit 64 Stellen kopieren").

---

## Nachtrag 2026-10-04 (zweiter) — Thomas' fünf Entscheidungen

*Ergänzt nach Thomas' Antworten. Der Wortlaut oben bleibt stehen; die folgenden Punkte sind die
gültige Fassung.*

| Frage | Entscheidung |
| --- | --- |
| Form der Ampel | **B** — 22-px-Punkt mit dem Zeichen `=` / `≈` **in** der Punktfläche |
| Automatisches Ausweichen | **Einmalig** — Ergebnis wird gezeigt, die Einstellung bleibt auf Bruch |
| Zustände | **Zweistufig grün / rot** — der Unterschied zwischen „gerundet" und „nur im anderen Modell möglich" fällt weg |
| Zahl in der Blase | **Nein** — Ampel und Blase nennen keine Zahl |
| Knopf „Ergebnis mit 64 Stellen kopieren" | **Nein** — erst bei Bedarf |

**Was daraus folgt — und was ausdrücklich verloren geht.** Rot deckt jetzt **zwei** Gründe ab:
(a) die Anzeige ist nicht der volle Wert (`1/3×3` zeigt `1`, intern `0,999…9`), und (b) für die
Rechnung musste automatisch das Dezimal-Modell einspringen. Beide sind damit nur noch über den
**sichtbaren Hinweistext** hinter der Ampel unterscheidbar, nicht mehr über die Farbe allein — die
Trennung „gewollt dezimal" gegen „ungewollt dezimal" ist also nicht mehr auf einen Blick zu sehen.
Das ist eine bewusste Vereinfachung, keine Verbesserung; sie steht hier, damit sie später nicht als
Versehen gelesen wird.

**Berichtigte Abnahmekriterien** (ersetzen den entsprechenden Punkt im Block oben):

- **grün** für `1/3+1/6`, `√4`, `sin(30°)`, `√2×√2`, `1/7×7`, `pi/pi`, `0,1+0,2`, `log(1000,10)`
  — nachgewiesen durch Testfälle, die den vollen Wert und die Anzeige vergleichen.
- **rot** für `1/3`, `2/7`, `√2`, `π`, `1/3×3`, `2^0,5`, `sin(pi)` im Bogenmaß — und ebenso für
  jeden Fall, in dem der Kern `numberModel` meldet (`√4`, `√2`, `sin(30°)` im Bruch-Modell), dort
  zusätzlich mit dem Hinweis „automatisch mit Dezimal gerechnet" und der Einstellung weiterhin auf
  **Bruch**.
- Die Erklärung öffnet sich per Maus, **Tippen** und **Tastatur**; in Graustufen sind die beiden
  Zustände an `=` gegen `≈` und am Text unterscheidbar. Die Anzeigehöhe bleibt mit und ohne Ampel
  gleich (im Browser gemessen).
- Die Entscheidung „keine Zahl in der Blase" ist geprüft: ohne Zahl bleiben Ampel und Blase auch
  ohne den Nachweis aus Nachtrag 1 verständlich — der volle Wert wird also **nur intern** gebraucht,
  nie angezeigt.

**Aufwand, berichtigt nach den Entscheidungen:** **2 bis 3 Stunden.** Gegenüber dem ersten
berichtigten Stand fällt die gelbe Farbmarke weg (`--color-caution` wird nicht gebraucht), es
bleiben zwei Zustandsnamen und weniger Textschlüssel; hinzu kommt weiterhin die kleine
Kernänderung (`full` in `Calculation` mit Testfällen über beide Modelle). Keine neue Abhängigkeit,
kein neuer Lizenzlauf, keine Schriftdatei.

**Damit ist der Entwurf entscheidungsreif.** Der Go zum Bauen liegt bei Thomas.

---

## Nachtrag 2026-10-04 (dritter) — die Umsetzung und ihre Abweichungen

*Ergänzt nach dem Go und der Umsetzung. Der Wortlaut oben bleibt stehen.*

Gebaut ist die Ampel in **Form B** (22 × 22 px, Zeichen in der Punktfläche), **zweistufig**, mit
**einmaligem** Ausweichen und **ohne** Zahl in der Erklärung. Belege in `07-pruefung/rechner-ampel/`,
Entscheidung als [ADR 0006](../04-entscheidungen/0006-voller-wert-und-genauigkeitsampel.md).

**Fünf Abweichungen vom Entwurf, jede mit Grund und Messung:**

1. **`numberModel` setzt die Ampel nicht auf rot.** Der Entwurf wollte den automatischen Modellwechsel
   als roten Zustand führen. Bei zwei Zuständen wäre das im Fall `√4` im Bruch-Modell eine
   **Falschaussage**: das Ergebnis ist exakt `2`, „gerundet" stimmt nicht. Die Ampel folgt deshalb allein
   dem Wert; der Modellwechsel steht als sichtbarer Hinweis unter dem Ergebnis und als dritte Zeile in
   der Erklärung.
2. **Keine neue Farbmarke.** Statt eines neuen `--color-caution` nutzt die Ampel die vorhandenen
   `--color-success` und `--color-brand`. Mit der zweistufigen Entscheidung entfällt das Gelb ohnehin.
   Gemessene Kontraste: Rot dunkel 5,76:1, Rot hell 5,27:1, Grün hell 4,80:1 (AA ab 4,5:1).
3. **Die Erklärung liegt unter 640 px als Blatt am unteren Rand.** Eine Sprechblase an der Ampel lief
   bei 320 px Breite über den rechten Rand (gemessen: links 158 px, rechts 454 px bei 320 px Fenster).
   Jetzt: 12–308 px. Über 640 px bleibt es bei der Sprechblase an der Ampel.
4. **Geöffnet wird über CSS (`:hover`, `:focus-within`), angeheftet über den Klick.** Grund: der erste
   Beleglauf verlangte das Öffnen über React-Fokusereignisse und scheiterte — der Fokus saß auf der
   Ampel, aber es kam **kein** `focus`/`focusin` an (gemessen mit einem eigenen Werkzeug). Der CSS-Weg
   hängt nicht davon ab. Folge: `aria-expanded` spiegelt nur den angehefteten Zustand; der Zustandstext
   steht weiterhin im zugänglichen Namen, wie der Entwurf es verlangt.
5. **Die Ampel bleibt in zwei Fällen aus** — im **RPN-Modus** (der Stapel trägt die gerundete
   14-Stellen-Darstellung von Schritt zu Schritt weiter; „vollständig" wäre dort falsch) und im
   **Programmierer-Modus** mit anderer Anzeige-Basis (die Anzeige ist dann eine Schreibweise, nicht der
   Wert). Beides ist **keine** Entscheidung von Thomas, sondern eine Folge des heutigen Stands und steht
   als offener Punkt im Protokoll.

**Ein Fehler kam erst durch die Prüfung heraus:** nach dem automatischen Modellwechsel stand
`14142135623731/10000000000000` als Bruch in der Anzeige — eine Scheingenauigkeit aus einem gerundeten
Dezimalwert. Behoben: nach dem Modellwechsel bleibt das Ergebnis dezimal.

**Nicht geprüft und damit offen:** echter Screenreader-Lauf, echter Tastaturlauf über `Tab`, sprachliche
Gegenlesung des Spanischen, Lauf gegen die veröffentlichte Fassung.

---

## Nachtrag 2026-10-04 (vierter) — keine Bruch-Erkennung im Dezimal-Modell

*Ergänzt nach Thomas' Entscheidung. Der Wortlaut oben bleibt stehen.*

**Anlass:** Am veröffentlichten Rechner zeigt `1/3+1/3` im Modell „Dezimal (14 Stellen angezeigt)"
den Wert `0,66666666666667` — nicht `2/3`. Gemessen am 2026-10-04: im Dezimal-Modell liegt intern
`0,66666666666666666666666666666666…` (64 Sechsen) vor, im Bruch-Modell `2/3` mit grüner Ampel.

**Entschieden (Thomas):** **Es bleibt so.** Der Rechner erkennt aus einer gerundeten Dezimalzahl
**nicht** automatisch einen Bruch. Begründung: diese Erkennung wäre eine Vermutung — das Gerät müsste
entscheiden, ob `0,6666…7` „2/3" bedeutet oder etwas anderes; bei krummen Werten entstünden Brüche, die
es nicht gibt. Für einen Wahrheitsanzeiger ist das der falsche Weg. Wer den exakten Bruch will, schaltet
auf „Bruch (exakt)" — zwei Klicks, und die Ampel wird grün.

**Verworfene Alternativen** (für den Fall, dass die Frage zurückkommt): Näherungshinweis „≈ 2/3" in der
Erklärung der Ampel · Erkennung nur bei exakt aufgehendem Bruch mit kleinem Nenner. Beide nicht gebaut.

**Nicht betroffen:** Die Bruchumwandlung der Oberfläche läuft weiterhin **nur** im Bruch-Modell. Auf
einen gerundeten Dezimalwert angewandt ergäbe sie `66666666666667/100000000000000` — ein Scheinbruch,
der im Test ausdrücklich festgehalten ist.
