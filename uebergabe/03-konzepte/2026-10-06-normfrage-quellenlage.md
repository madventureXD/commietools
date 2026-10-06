# Normfrage (Q2) — Quellenlage für Welle E

**Datum:** 2026-10-06 · **Bearbeiter:** Faber · **Zweck:** Entscheidungsgrundlage für Q2.
**Status:** Recherche abgeschlossen, **Entscheidung offen** — gebaut wird erst danach.

Grundlage: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md`, Q2 und Welle E. Die dortige Sperre
(„Erst nach Klärung der Normfrage") wurde eingehalten: Der Auftrag „Welle E" wurde **nicht** als
Bauauftrag ausgeführt, sondern zuerst die Datenlage erhoben.

## 1. Vorgehen

Fünf Datenbestände wurden getrennt recherchiert (13, 14, 15, 16, 18). Die Einzelwerte mit Quellen
und Abrufdaten liegen als Anlage bei: `06-protokolle/quellenlage-welle-e/` (fünf Dateien, 1301
Zeilen) — dort steht je Wert die Quelle, dort stehen auch die Widersprüche im Detail. Dieses
Dokument fasst die tragenden Ergebnisse zusammen und zieht die Folgerungen.

**Zwei Regeln für alle fünf:** Nach einer Norm zu *rechnen* ist erlaubt — die physikalischen Formeln
sind frei. Eine Norm*tabelle* zu übernehmen ist es nicht (OLG Hamburg, Az. 3 U 220/15, vgl. Q2).
Einzelne Werte sind Tatsachen; die Zusammenstellung ist geschützt. „Frei abrufbar" heißt nicht
„frei übernehmbar".

## 2. Meine eigene Nachprüfung (nicht die Zusammenfassung der Recherche)

Die Recherche wurde nicht geglaubt, sondern stichprobenweise gegen die Quellen geprüft. Ergebnis:

| Prüfung | Ergebnis |
|---|---|
| Gewindesteigungen (Wikipedia „Metrisches ISO-Gewinde") | **bestätigt** — Tabelle vorhanden, M10 Regelgewinde 1,5 mm, Feingewinde 1,25/1,0 |
| Wasser-Dichte und Viskosität (Anton Paar, IAPWS 2008) | **bestätigt** — Tabelle „Dyn. Viskosität / Kin. Viskosität / Dichte" bei 20 °C: 1,0016 mPa·s / 1,0034 mm²/s / 0,9982 g/cm³ |
| U-Werte (BBSR/GEG-Portal, Bundesbehörde) | **bestätigt** — Tabelle „Konstruktion/Baujahr/Bauteilaufbau/U-Wert (W/m²·K)" mit Einzelquellen je Zeile (z. B. Fenster 1979–95: 2,70) |
| Soll-Lux (BAuA, ASR A3.4) | **teilbestätigt** — die 300/500-lx-Systematik ist im Regelwerkstext belegt, die Anhang-3-Tabelle kam beim Abruf nicht mit |
| Strombelastbarkeit (ABB, „nach DIN VDE 0298-4") | **bestätigt — und das ist der Befund:** Der Titel des Herstellerdokuments lautet ausdrücklich „Verlegearten und Strombelastbarkeit von Kabeln/Leitungen **Nach DIN VDE 0298-4/Ausgabe Juni 2013**" |

**Einschränkung, ehrlich benannt:** Eine Prüfung im Browser war in dieser Sitzung nicht möglich —
das Werkzeug meldet „Chromium browser is missing". Zwei Quellen mit dynamisch geladenen Tabellen
(Schneider-Wiki, HELUKABEL) ließen sich deshalb **nicht** selbst nachsehen. Sie sind als
„nicht nachgeprüft" geführt, nicht als bestätigt.

## 3. Ergebnis je Datenbestand

### 13 — Leitungsquerschnitt und Spannungsfall (höchstes Risiko)

- **Nicht übernehmbar:** Die frei abrufbaren Strombelastbarkeitstabellen (ABB, HELUKABEL, Lapp,
  Schneider-Wiki) sind **genehmigte Auszüge aus DIN VDE 0298-4**, ausdrücklich als Wiedergabe
  gekennzeichnet. Diese Genehmigung gilt für die Hersteller, nicht für uns. Die Werte sind
  untereinander deckungsgleich — das macht sie nicht übernehmbar, es macht sie nur überprüfbar.
- **Frei belegbar:** die Rechenformeln (Spannungsfall ein- und dreiphasig), die spezifische
  Leitfähigkeit κ (Kupfer 56 / Aluminium 35, mit Streuung je Quelle und Bezug), die anerkannten
  Spannungsfallgrenzen (3 % Beleuchtung, 5 % andere) sowie die Umrechnungsfaktoren
  (Temperatur, Häufung) **als Größenordnung**.
- **Nicht belegt:** Aluminium-Strombelastbarkeit unter 25 mm², Aluminium in Verlegeart E,
  normativer Primärbeleg für 3 %/5 % (nur über Fachseiten referiert).
- **Konsequenz:** Der Querschnitt lässt sich aus dem **Spannungsfall** rechnen — das ist frei.
  Die **Strombelastbarkeit** darf nicht als Tabelle ins Werkzeug. Sie muss **Eingabefeld** sein
  (Wert aus der Tabelle des Nutzers) oder das Werkzeug prüft nur den Spannungsfall.
- **Zusätzlich Pflicht:** sichtbarer Hinweis „Vorplanung, ersetzt keine Elektrofachkraft".

### 14 — Beleuchtungsplanung nach Lux

- **Frei belegbar:** Soll-Beleuchtungsstärken aus **ASR A3.4** (Ausschuss für Arbeitsstätten, BAuA —
  öffentliches Regelwerk, frei abrufbar), DGUV Information 215-210/215-442, EKAS-Wegleitung, AMEV,
  ZVEI/licht.de. Das sind eigene Zusammenstellungen von Behörden und Verbänden, nicht die
  DIN-EN-12464-1-Tabelle. DIN EN 12464-1 wurde bewusst **nicht** als Quelle verwendet.
- **Widersprüche (benannt, nicht geglättet):** Umkleide/Sanitär 200 lx (ASR) gegen 100 lx (EKAS);
  Lager 50/100/150 lx je Definition; Flur 50/100/150 lx; Unterrichtsraum 300 lx (ASR) gegen
  500 lx (Städtetag, nach Anhebung); Werkstatt 200/300/500 lx je Arbeitsschwere; Wartungsfaktor
  0,50–0,67 gegen Standardwert 0,8 in Fachrechnern.
- **Nicht belegt:** raumtypspezifische Gleichmäßigkeitswerte (U0) — nur normgebunden; ein
  einheitlicher Wert für Verkaufsräume; ein allgemeingültiger Wartungsfaktor (existiert nicht).
- **Konsequenz:** Machbar als **eigene Wertetafel mit Quelle je Zeile**, jeder Wert änderbar;
  bei streitigen Raumtypen die Spanne zeigen statt einer Scheingenauigkeit. Gleichmäßigkeit nur
  als Eingabefeld.

### 15 — Rohrdimensionierung

- **Frei belegbar:** Wasser-Dichte und kinematische Viskosität 10–80 °C (Anton Paar/IAPWS 2008,
  stoffdaten-online — **von mir bestätigt**), Rohrrauigkeiten, Richtwerte der Strömungsgeschwindigkeit.
- **Herstellerabhängig (also Auswahl, nicht fest):** Kupfer-Wanddicken (EN 1057 lässt mehrere zu:
  15×0,7 und 15×1,0 sind beide normkonform), Stahl (EN 10255 light/medium/heavy), Verbundrohr
  (OD 20 → ID 14,4 bis 16,0 mm je Hersteller).
- **Nicht belegt:** normative Geschwindigkeitsgrenzen im Normtext, temperaturabhängige Rauigkeit,
  Druckverlust-Beiwerte für Fittings.
- **Auffälligkeit, die ich melden muss:** Als Beleg für EN 1057 wurde ein Normtext-PDF von einem
  **Dritt-Host** (`lador.ru`) herangezogen. Das ist derselbe Fehler wie eine übernommene Normtabelle,
  nur an anderer Stelle. Für den Bau sind Handel- und Herstellerkataloge zu verwenden, nicht dieses PDF.

### 16 — Heizlast-Überschlag

- **Frei belegbar:** U-Werte als **Beispielwerte des BBSR/GEG-Infoportals** (Bundesbehörde, mit
  Quelle je Zeile — von mir bestätigt), Innenraumtemperaturen (Umweltbundesamt), Luftwechselraten
  (Umweltamt Düsseldorf zu DIN 1946-6, IWU/Hessisches Ministerium, BAuA-Bericht F2072), Stoffdaten
  Luft.
- **Nicht belegt:** **Außen-Auslegungstemperatur** (regional/projektabhängig) — muss Eingabefeld
  sein; U-Wert Innentrennwände; erdberührte Bestandskonstruktionen (nur GEG-Höchstwert);
  Wärmebrücken und solare Gewinne.
- **Konsequenz:** Als **Überschlag** baubar, wenn Bezeichnung und Hinweis das trennen
  („keine normgerechte Heizlastberechnung nach DIN EN 12831") und die Außentemperatur eingegeben wird.

### 18 — Gewinde, Bohrungen, Anzugsmomente

- **Frei belegbar (und teils gerechnet statt abgeschrieben):** Gewindesteigungen M3–M30 (mehrfach
  unabhängig, von mir bestätigt), Kernloch als **Rechenregel Kernloch ≈ d − P** (keine Tabelle
  nötig), Kerndurchmesser D1 ≈ d − 1,0826·P (öffentliche Hochschulformelsammlung).
- **Widersprüche (benannt):** Anzugsmomente 8.8 streuen 10–20 % je Quelle (unterstellte Reibungszahl
  μ = 0,12 gegen 0,14–0,18): M8 24/25/27 Nm, M10 48/50/54 Nm. Schlüsselweiten: **alte DIN-Reihe**
  (M10 = 17, M12 = 19) gegen **aktuelle ISO-Reihe** (M10 = 16, M12 = 18) — nicht dieselbe Größe,
  muss gekennzeichnet werden.
- **Nicht belegt:** Durchgangsloch (nur normgebunden, keine Zweitquelle), geschmierte
  Einzelmomente, Zollfeingewinde BSF/BA, eine Behörden-/Berufsgenossenschaftsquelle für
  Anzugsmomente (gesucht, nicht gefunden — durchgehend Hersteller/Fachseiten).
- **Konsequenz:** Steigungen und Kernloch sind Rechnung und damit unbedenklich. Anzugsmomente nur
  als **Richtwert mit Spanne und Kennzeichnung**, änderbar. Durchgangsloch entweder Eingabefeld oder
  als „gerechnet nach d + Zuschlag" offengelegt.

## 4. Was daraus als gemeinsame Linie folgt

1. **Rechnen statt abschreiben, wo es geht** (Kernloch, Spannungsfall, Volumenstrom, Transmission).
   Das ist die einzige Stelle, an der ein Werkzeug gar kein Normrecht berührt.
2. **Wertetafeln nur aus Behörden-, Verbands- und eigenen Herstellerdaten** — je Zeile die Quelle,
   Abrufdatum sichtbar, **jeder Wert änderbar**.
3. **Was nicht frei belegt ist, wird Eingabefeld** — nicht geschätzt, nicht weggelassen.
4. **Abgrenzungshinweis** bei den regulierten Gewerken (13 Elektro, 16 SHK) und bei
   Richtwerten (Anzugsmomente, Strömungsgeschwindigkeit).
5. **Kein Norm-Nachschlagewerk:** keine „wo steht das"-Werkzeuge, keine Tabellenwiedergabe.

## 5. Entscheidungsvorlage für Q2

- **Q2 bestätigen:** eigene Werte aus mehreren frei zugänglichen Quellen, Quelle je Wert sichtbar,
  jeder Wert änderbar — **gilt für 14, 15, 16 und 18**.
- **Für 13 gesondert entscheiden** (eigenes Risiko): Strombelastbarkeit als Eingabefeld, oder
  Werkzeug auf den Spannungsfall begrenzen, oder 13 zurückstellen.
- **Nach der Entscheidung:** Bau der fünf Werkzeuge mit belegter Datenbasis; die Arbeitsdateien
  unter `work/recherche/` werden je Werkzeug zu einem Quellenabschnitt im Werkzeug verdichtet.

## 6. Offen und nicht geprüft

- Zwei Quellen mit dynamischen Tabellen (Schneider-Wiki, HELUKABEL) konnte ich **nicht** selbst
  nachsehen (kein Browser in dieser Sitzung). Ihre Werte sind deckungsgleich mit den bestätigten
  Quellen, aber nicht von mir geprüft.
- Die Recherche ist eine **Momentaufnahme mit Abrufdatum 2026-10-06**. Quellen können sich ändern;
  vor dem Bau ist der jeweilige Wert erneut abzurufen.
- Ob die Werte **fachlich** richtig sind, ist damit nicht belegt — nur ihre Herkunft und
  Zugänglichkeit. Die fachliche Prüfung durch eine Elektro- bzw. SHK-Fachkraft steht aus und ist
  mit diesem Vorgehen auch nicht ersetzbar.
