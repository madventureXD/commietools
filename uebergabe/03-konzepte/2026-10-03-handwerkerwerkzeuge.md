# Konzept: Handwerkerwerkzeuge für CommieTools

**Datum:** 2026-10-03
**Verfasst von:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Status:** Vorschlag — nicht entschieden, nichts umgesetzt
**Grundlage:** Auftrag von Thomas vom 2026-10-03 (24 Werkzeugvorschläge mit Open-Source-Lage und
Machbarkeit). Recherche: 25 Registry-Inventare und 23 Websuchen; Quellen unten je Aussage.

---

## Vorbemerkung zur Methode

1. **Registry-Inventar zuerst.** 32 npm-Kandidaten wurden über `npm-inventar.mjs` geprüft
   (Laufzeit 5,3 s). Das Lizenzfeld der Registry ist ein **Hinweis, kein Beleg**; belegt ist eine
   Lizenz erst, wenn sie im Repository oder in der Lizenzdatei gelesen wurde. Diese
   Unterscheidung ist unten durchgehalten: „Registry" heißt Hinweis, „belegt" heißt gelesen.
2. **Projektregeln:** `AGPL-3.0-only`. Erlaubt sind laut `licenses/policy.json`: MIT, ISC,
   Apache-2.0, BSD-2-Clause, BSD-3-Clause, CC0-1.0, CC-BY-4.0, MPL-2.0, LGPL-3.0-or-later,
   0BSD, BlueOak-1.0.0 sowie `AGPL-3.0-or-later`. **GPL jeder Variante steht in
   `reviewRequired`** und ist damit nicht ohne gesonderte Freigabe aufnehmbar.
3. **Keine Installation, kein Probeaufbau.** Alle Urteile sind Papierurteile mit Quelle. Der
   Probeaufbau ist ein eigener Schritt nach der Auswahl.
4. **Grundbedingung des Projekts:** rein lokal im Browser, kein Backend, kein Konto, keine
   Telemetrie. Jede Lösung, die einen Server voraussetzt, ist damit ausgeschieden — unabhängig
   von ihrer Lizenz.

---

## Querschnittsbefunde (gelten für viele Vorschläge)

### Q1 — Die meisten Vorschläge brauchen gar keine Abhängigkeit

22 der 24 Vorschläge sind **Rechenvorschriften**: Multiplikation, Trigonometrie, Tabellenzugriff.
Für Rechnen, Geometrie und Einheiten braucht es keine Bibliothek; die Formeln sind öffentlich und
kurz. Der Aufwand liegt in Oberfläche, Sprachkatalogen und Prüfungen — nicht in Abhängigkeiten.
Das ist ein Vorteil für die Lizenzordnung: was nicht aufgenommen wird, muss nicht geprüft werden.

Wo doch eine Bibliothek sinnvoll ist, steht sie unten am jeweiligen Vorschlag.

### Q2 — DIN- und VDE-Normen sind urheberrechtlich geschützt

Das OLG Hamburg hat 2017 (Az. 3 U 220/15) entschieden, dass DIN-Normen urheberrechtlich
geschützt sein **können**; die Schutzfähigkeit ist im Einzelfall zu prüfen
(`kanzlei.biz`, `urheberrecht.de`, `ferner-alsdorf.de` — alle drei nennen dasselbe Urteil).
Praktische Folge für dieses Projekt:

- **Zulässig:** nach einer Norm *rechnen* (die physikalischen Formeln sind frei), eigene
  Tabellen aus **frei zugänglichen** Quellen zusammentragen, die Herkunft je Wert angeben.
- **Nicht zulässig:** Tabellenwerke aus DIN/VDE-Entwürfen oder Tabellenbüchern abschreiben,
  Normtexte oder Auszüge einbetten.
- **Konsequenz:** Die Vorschläge 13 (Leitungsquerschnitt), 16 (Heizlast) und 18 (Gewinde)
  berühren Normen. Sie sind machbar, aber nur als **eigene Rechnung mit eigenen Datenquellen**
  und sichtbarer Quellenangabe — nicht als „die Norm zum Nachschlagen". Das ist ein eigener
  Prüfpunkt im Lizenz- und Artefaktgate, nicht ein Nebensatz.

Quellen für Normzahlen (Gewinde, Profile, Rohdichten) sind als **Fakten** nicht schutzfähig,
ihre konkrete Zusammenstellung schon. Werte einzeln aus mehreren freien Quellen belegen, nicht
eine Tabelle als Ganzes übernehmen.

### Q3 — Zwei MIT-Rechner-Sammlungen sind als Referenz brauchbar, nicht als Abhängigkeit

- **`buildvisionai/construction-calculators`** — MIT (README und LICENSE gelesen), reines
  TypeScript **ohne Laufzeitabhängigkeiten**, Registry 277 kB. Rechner für Beton, Kies,
  Dach, Trockenbau, Farbe, Boden, Treppen, Aufschlag/Lohn.
  **Einschränkung:** durchgehend **US-Einheiten und US-Materialien** (Sackgrößen in lb,
  Asphaltschindeln, R-Value). Als Formel-Referenz wertvoll, als Abhängigkeit ungeeignet.
- **`estimatorsuite/calculators`** — MIT (Website und Registry), 42 Rechner, React-Komponenten
  mit Tailwind, Registry 5,6 MB. Gleiche Einschränkung: US-Markt (Hardie-Siding, Mulch,
  R-Value), Preisdaten aus US-Marktforschung.
  Als Abhängigkeit **ungeeignet** (Größe, Styling, Einheiten); als Referenz für Formeln und
  für die Frage „welche Rechner fehlen uns" brauchbar.

**Beide sind kein deutsches Fachrechnen.** Kein Vorschlag unten hängt an ihnen.

### Q4 — Zuschnittoptimierung: der einzige echte Algorithmusfall

`bozokopic/opcut` (Guillotine-Schnitt, 184 Sterne) ist die naheliegende Lösung und **scheidet
aus zwei Gründen aus**: Lizenz **GPL-3.0** (README gelesen) und Architektur (Python-Server,
C-Anteil, REST-API) — beides unvereinbar mit `AGPL-3.0-only` und Local-First.
Für 2D-Packen stehen zwei freie npm-Pakete bereit (`maxrects-packer` MIT, Registry;
`binpackingjs` MIT, Registry), beide ohne Browserausschluss.
**Wichtig:** Einen GPL-Algorithmus nachzubauen, nur um seine Lizenz zu umgehen, ist nicht
zulässig. Ein eigener Zuschnittplaner muss aus der allgemeinen Literatur zum
Zuschnittproblem (First-Fit-Decreasing, Guillotine-Schnitt) entwickelt werden, nicht aus
fremdem Code übersetzt.

### Q5 — Für SHK-Heizlast gibt es nichts Browserfähiges

Gefunden: `TomLXXVI/python-hvac` (EN 12831-1, Python), `OpenHeatLoss/OpenHeatLoss`
(React-Frontend **plus Express-Server**, NEN 12831), `IWUGERMANY/CHLOE`. Alle drei setzen
Python oder einen Server voraus. Eine Browser-Bibliothek für Heizlast existiert nach dieser
Recherche **nicht**. Der Vorschlag bleibt trotzdem machbar — als **vereinfachter Überschlag**
mit eigenen Formeln, ausdrücklich nicht als normgerechte Berechnung.

---

## Die 24 Vorschläge

Aufwand: **S** = eine Sitzung bis wenige Tage · **M** = rund eine Woche · **L** = mehr als eine
Woche. Schätzung nach Referenzklasse: das Projekt hat vergleichbare Werkzeuge (Farbwerkzeuge,
Bild-Metadaten) in je einer Sitzung gebaut.

### A. Rechnen und Aufmaß (alle Gewerke)

#### 1. Maßketten-Rechner (Aufmaß)
**Was:** Längen addieren und subtrahieren, Zollbrüche (1 3/8″) und Dezimal, Zwischensummen.
**OSS-Lage:** `fraction.js` (MIT, Registry, 144 kB) rechnet Brüche exakt. Alternativ
`decimal.js` (MIT, 278 kB). Für Kettenrechnung genügt `fraction.js`.
*(Nachtrag 2026-10-03: Die frühere Angabe „`mathjs` mit 9,2 MB ist zu groß" war falsch — die
Registry-Größe zählt das ganze Paket; im Browser landet `lib/browser/math.js` mit 634,5 kB.
Siehe den Nachtrag im Konzept `2026-10-03-taschenrechner-suite.md`.)*
**Machbarkeit:** **S**, trivial. Reine Rechnung, kein DOM, kein Dateizugriff.
**Risiko:** keines. Kandidat für das erste Werkzeug überhaupt.

#### 2. Flächen für unregelmäßige Räume
**Was:** Teilflächen (Rechteck, Dreieck, Trapez, Kreisabschnitt) addieren, Öffnungen abziehen,
Summenblatt.
**OSS-Lage:** Keine Bibliothek nötig — Schulgeometrie, wenige Zeilen.
**Machbarkeit:** **S**, trivial. Grundlage für die Vorschläge 9–12.
**Risiko:** keines. Wert liegt in der Oberfläche (Skizze der Teilflächen), nicht der Rechnung.

#### 3. Umrechner technische Größen
**Was:** Druck, Kraft, Drehmoment, Temperatur, Volumen, Dichte, Länge, Fläche.
**OSS-Lage:** `js-quantities` (MIT, 574 kB, 2023), `unitmath` (Apache-2.0, 483 kB, 2024),
`convert-units` (MIT, **zuletzt 2018** — eingefroren, für ein statisches Einheitensystem aber
vertretbar). `mathjs` erneut zu groß.
**Machbarkeit:** **S**. Empfehlung: **eigene Einheitentabelle** statt Abhängigkeit — die
Umrechnungsfaktoren sind Konstanten, die Tabelle ist klein und prüfbar.
**Risiko:** keines.

### B. Bau, Rohbau, Holz

#### 4. Beton-, Mörtel- und Estrichrechner
**Was:** Volumen → Zement/Sand/Wasser nach Mischungsverhältnis, Sackzahl, Gewicht.
**OSS-Lage:** `buildvisionai` deckt Beton ab (MIT), aber **imperial** (Säcke in lb, yards).
Deutsche Mischungsverhältnisse (z. B. Zement:Sand 1:4) sind eigene Daten.
**Machbarkeit:** **S**. Eigene Formeln, kleine eigene Faktentabelle.
**Risiko:** Mischungsverhältnisse je Anwendungsfall sind Erfahrungswerte — als Richtwerte
kennzeichnen, nicht als Norm.

#### 5. Pflaster- und Erdarbeitenrechner (GaLaBau)
**Was:** Fläche + Steinformat → Stück/Paletten, Bettung, Fugenmaterial, Aushubvolumen, Gefälle.
**OSS-Lage:** Keine passende freie Bibliothek gefunden. Herstellerrechner (GftK) sind
proprietär und nicht übernehmbar — nur als fachliche Referenz gelesen.
**Machbarkeit:** **S**. Reine Rechnung.
**Risiko:** Palettengrößen und Steinformate sind herstellerabhängig — als Eingabefeld
auslegen, nicht fest verdrahten.

#### 6. Dachflächen-, Neigungs- und Sparrenrechner
**Was:** Pult-, Sattel-, Walmdach; Neigung ↔ Neigungsfaktor; Sparrenlänge; Materialbedarf.
**OSS-Lage:** `buildvisionai` hat Roof Pitch und Stairs (MIT, imperial). Formeln sind
Trigonometrie und öffentlich (Neigungsfaktor 45° = 1,414).
**Machbarkeit:** **S**. Eigene Trigonometrie.
**Risiko:** keines.

#### 7. Plattenzuschnitt-Optimierer
**Was:** Teileliste auf Plattenmaß legen, Verschnitt minimieren, Zuschnittplan als PDF.
**OSS-Lage:** `maxrects-packer` (MIT, 2022) und `binpackingjs` (MIT, 2026) sind
browserfähig. `opcut` scheidet aus (GPL-3.0, Server — siehe Q4).
**Machbarkeit:** **M**. Das ist der anspruchsvollste Rechenvorschlag: Der Optimierer muss
Sägeschnitt-Verlust und Guillotine-Schnitt (Schnitte durchgehend von Kante zu Kante) abbilden,
sonst ist der Plan nicht sägbar. Eigene Heuristik aus der Literatur; die zwei freien Pakete
sind als Vergleichsmaßstab nützlich.
**Risiko:** **Erwartungsfalle** — ein Optimierer, der den Verschnitt auf dem Papier senkt,
aber unsägbar schneidet, ist schlechter als keiner. Der Plan muss sägbar sein, nicht optimal.
Prüfung mit echten Plattenmaßen nötig.

#### 8. Holzfeuchte-, Dichte- und Holzgewichtsrechner
**Was:** Holzfeuchte aus Nass-/Darrgewicht, Dichtetabelle je Holzart, Gewicht aus Maßen.
**OSS-Lage:** Keine Bibliothek nötig. **Datenquelle ist der Knackpunkt:** DIN 68364
(„Kennwerte von Holzarten") ist kostenpflichtig und geschützt (Q2). Frei zugängliche
Rohdichtewerte gibt es u. a. bei der LWF Bayern (Fichte 0,46 g/cm³ bei 12–15 % Feuchte).
**Machbarkeit:** **S** für die Rechnung, **M** für die Datenerhebung — je Holzart eine
belegte Quelle.
**Risiko:** Genau hier lauert die Urheberrechtsfrage. Werte einzeln aus freien Quellen
zusammentragen und **je Wert die Quelle nennen**; keine Tabelle übernehmen.

### C. Ausbau

#### 9. Fliesen-, Kleber- und Fugenmörtelrechner
**Was:** Fliesen, Kleber nach Zahnung, Fugenmörtel nach Fugenvolumen, Diagonal- und
Musterzuschlag, Teilflächen.
**OSS-Lage:** Keine freie Bibliothek. Die kommerzielle iOS-App TileWright zeigt den
Funktionsumfang, ist aber proprietär. Die Fugenformel ist öffentlich:
`kg/m² = ((A+B) ÷ (A×B)) × Fugenbreite × Fugentiefe × Dichte` (Dichte Zementfuge ≈ 1600 kg/m³).
**Machbarkeit:** **S**. Reine Rechnung mit eigenen Faktoren.
**Risiko:** Ergiebigkeitsangaben sind produktabhängig — als Eingabefeld, mit Richtwert als
Vorschlag.

#### 10. Farb-, Tapeten- und Beschichtungsrechner
**Was:** Netto-Fläche mit Abzügen, Ergiebigkeit, Anstrichzahl, Bahnenrechnung mit Rapport.
**OSS-Lage:** `estimatorsuite` hat Paint und Wallpaper (MIT), aber imperial und ohne Rapport.
Formeln belegt (Dispersionsfarbe 6–8 m²/L, Standardrolle 0,53 × 10,05 m).
**Machbarkeit:** **S**. Reine Rechnung.
**Risiko:** keines. Die Bahnenrechnung ist der wertvolle Teil — eine reine m²-Rechnung
unterschätzt den Bedarf systematisch.

#### 11. Trockenbau-Rechner
**Was:** Aufbau wählen (einfach/doppelt beplankt), Fläche → Platten, CW/UW-Profile,
Schrauben, Spachtelmasse.
**OSS-Lage:** `buildvisionai` und `estimatorsuite` haben Drywall (MIT, imperial, US-Plattenmaße).
**Machbarkeit:** **S**, nutzt Vorschlag 2 als Eingabe.
**Risiko:** Profilabstände und Plattenmaße sind Hersteller- und Systemangaben — als
Eingabefeld oder als deutlich gekennzeichneter Richtwert.

#### 12. Parkett-, Laminat- und Bodenbelagsrechner
**Was:** Fläche + Verlegeart (Halb-/Drittelverband, diagonal) → Pakete, Verschnitt,
Trittschalldämmung, Randprofile.
**OSS-Lage:** `estimatorsuite` hat Laminate Flooring (MIT, imperial).
**Machbarkeit:** **S**. Reine Rechnung.
**Risiko:** Verschnittzuschläge je Verlegeart sind Erfahrungswerte — als Richtwerte
kennzeichnen.

### D. Technische Gewerke

#### 13. Leitungsquerschnitt und Spannungsfall (VDE 0298-4)
**Was:** Verlegeart A1–G, Häufung, Umgebungstemperatur, Absicherung; Ausgabe des größeren
von zwei Querschnitten (Strombelastbarkeit, Spannungsfall) mit Rechenweg.
**OSS-Lage:** Keine freie Bibliothek. Formeln sind öffentlich und konsistent belegt:
`A = (2·L·I)/(κ·ΔU)` einphasig, mit √3 dreiphasig; Kupfer κ = 56, Aluminium 35;
Spannungsfall 3 % Beleuchtung / 5 % andere.
**Machbarkeit:** **S** für die Rechnung, **M** für die Datenlage.
**Risiko:** **Das größte Rechtsrisiko im ganzen Paket.** Die Strombelastbarkeitstabellen
stammen aus DIN VDE 0298-4 und sind geschützt (Q2). Zulässig ist die eigene Rechnung mit
eigenen Belastungswerten aus frei zugänglichen Quellen (Kabelherstellerangaben sind
verbreitet frei). Zusätzlich: Das Werkzeug muss **deutlich** sagen, dass es Vorplanung ist
und keine Elektrofachkraft ersetzt — alle gelesenen Referenzrechner tragen diesen Hinweis.

#### 14. Beleuchtungsplanung nach Lux und Raumtyp
**Was:** Raumtyp → Soll-Lux, Fläche → Lichtstrom und Leuchtenzahl, Gleichmäßigkeit.
**OSS-Lage:** Keine Bibliothek nötig.
**Machbarkeit:** **S**.
**Risiko:** Soll-Lux-Werte stammen aus DIN EN 12464-1 (geschützt) — hier gilt dasselbe wie
bei 13: eigene Werte mit Quellenangabe, keine Normtabelle.

#### 15. Rohrdimensionierung, Volumenstrom und Druckverlust (SHK)
**Was:** Leistung und Spreizung → Volumenstrom → DN-Vorschlag, Geschwindigkeitsprüfung.
**OSS-Lage:** `rechner-portal.de` und ZVPLAN zeigen den Umfang, sind aber proprietär.
Druckverlustformeln (Darcy-Weisbach, Colebrook) sind öffentliche Physik.
**Machbarkeit:** **M**. Die Rechnung ist einfach; der Aufwand liegt in der Rohrreibungszahl
und in plausiblen Grenzwerten.
**Risiko:** Rohrinnenmaße sind herstellerabhängig (Kupfer, Verbund, Stahl) — als Auswahl,
nicht fest verdrahtet.

#### 16. Heizlast-Überschlag je Raum (SHK)
**Was:** Vereinfachter Überschlag aus Transmission (U·A·ΔT) und Lüftung.
**OSS-Lage:** **Nichts Browserfähiges** (Q5). `python-hvac` (EN 12831-1) und
`OpenHeatLoss` (NEN 12831) setzen Python bzw. einen Server voraus.
**Machbarkeit:** **M**. Eigene Formeln; die U-Werte der Bauteile sind eine eigene
Datenaufgabe.
**Risiko:** **Abgrenzung ist Pflicht.** Ein Überschlag darf sich nicht wie eine normgerechte
Heizlastberechnung anfühlen — sonst entsteht ein Haftungsfall. Bezeichnung und Hinweistext
müssen das trennen.

#### 17. Metall-Gewichts- und Profilrechner
**Was:** Rund, Flach, Rohr, Winkel, Sechskant für Stahl, Alu, Edelstahl, Messing.
**OSS-Lage:** Keine Bibliothek nötig. Dichtewerte sind öffentlich und mehrfach belegt
(Stahl unlegiert 7,85 kg/dm³, Gusseisen 7,25, Kupfer 8,96).
**Machbarkeit:** **S**. Reine Rechnung.
**Risiko:** Gering. Nur die Dichtewerte je Werkstoff mit Quelle belegen.

#### 18. Gewinde-, Bohr- und Anzugsmoment-Tabelle
**Was:** Metrisch und Zoll, Regel- und Feingewinde, Kernloch, Durchgangsloch, Anzugsmomente.
**OSS-Lage:** Keine Bibliothek. Tabellen sind verbreitet (DIN 13-Auszüge bei mehreren
Händlern frei abrufbar) — **frei abrufbar heißt aber nicht frei übernehmbar** (Q2).
**Machbarkeit:** **S** für die Anzeige, **M** für die belegte Datenbasis.
**Risiko:** Normzahlen selbst sind Fakten; die Zusammenstellung nicht. Werte einzeln belegen.
Anzugsmomente streuen zusätzlich nach Werkstoff, Beschichtung und Schmiermittel — nur als
Richtwerte mit Kennzeichnung.

### E. Dokumentation

#### 19. Baustellenfoto-Beschrifter
**Was:** Fotos lokal mit Zeitstempel, Ortsnotiz, Pfeil und Text versehen, als Sammel-PDF ausgeben.
**OSS-Lage:** Canvas und die vorhandene PDF-Engine (`pdf-lib`, schon im Projekt) genügen.
Für EXIF wurde im Projekt **bereits ein eigener Leser geschrieben**, weil `exifreader`
39 kB gekostet hätte — diese Entscheidung gilt weiter. `exifr` (MIT) ist seit **2021
eingefroren**; `exifreader` (MPL-2.0, zugelassen) wird nicht gebraucht.
**Machbarkeit:** **M**. Der Aufwand liegt in der Bildmarkierung (Canvas), nicht in der
Datenhaltung. Bestehende kommerzielle Apps (DokuAI, Workstool, Betrivo) senden Bilder auf
ihre Server — genau das macht dieses Werkzeug lokal besser.
**Risiko:** Speichergrenzen bei vielen großen Fotos (mehrere Canvas-Flächen gleichzeitig) —
muss gemessen werden, nicht angenommen.

#### 20. Abnahme-, Übergabe- und Mängelprotokoll
**Was:** Formular, Unterschrift, Fotos einbetten, PDF-Export, Gewährleistungsfristen
(BGB 5 Jahre, VOB 4 Jahre).
**OSS-Lage:** `signature_pad` (MIT, 455 kB, aktiv gepflegt) oder `perfect-freehand`
(MIT, 109 kB) für die Unterschrift; PDF über die vorhandene Engine. Für Fristen genügt
`Date` — `date-fns` (10,6 MB), `luxon` (4,5 MB) und `dayjs` (666 kB) sind für diesen Zweck
überdimensioniert.
**Machbarkeit:** **M**. Nutzt vier vorhandene Bausteine des Projekts (PDF-Engine,
Dateispeicherung, Formulare, Sprachkataloge).
**Risiko:** Die Fristen sind Rechtsanwendung, nicht Rechnung — als Hinweis kennzeichnen,
nicht als Rechtsberatung.

#### 21. Normen- und Richtwert-Nachschlagewerk
**Was:** DIN 18015 (Steckdosen je Raum), DIN 18101 (Türmaße), Verlegearten, Mindestquerschnitte.
**OSS-Lage:** Keine freie Sammlung gefunden. DIN Media vertreibt die Normen kostenpflichtig.
**Machbarkeit:** **Eingeschränkt.**
**Risiko:** **Von diesem Vorschlag rate ich ab.** Ein Nachschlagewerk lebt davon, die Norm
wiederzugeben — und genau das ist geschützt (Q2). Ein Werkzeug, das nur „wo steht das"
beantwortet, ist dünn; eines, das die Tabelle zeigt, ist angreifbar. Als Ersatz empfehle ich,
die konkreten Zahlen dort einzubauen, wo sie gebraucht werden (Vorschlag 13), mit eigener
Quelle — nicht als Normwiedergabe.

#### 22. Aufmaß-Skizze
**Was:** Grundriss oder Wandabwicklung zeichnen, Maße eintragen, Fläche und Umfang automatisch.
**OSS-Lage:** `konva` (MIT, 1,8 MB, aktiv) oder `@svgdotjs/svg.js` (MIT, 2,2 MB).
`fabric` ist mit **21,7 MB** zu groß, `paper` mit 12,0 MB ebenfalls. Freie Vorbilder:
`iancometa/floorplan-canvas` (Konva + React), `theLodgeBots/open3dFloorplan`.
**Machbarkeit:** **L**. Der größte Vorschlag im Paket — Zeichnen, Maße, Fangpunkte,
Flächenberechnung aus der Zeichnung. `konva` ist eine echte neue Abhängigkeit und muss durch
das Gate.
**Risiko:** Ein halber Zeichnungseditor ist schlechter als ein Zettel. Entweder ganz oder gar
nicht; als erster Schritt nur die **Flächenberechnung mit Maßtabelle** (Vorschlag 2) und die
Skizze später.

#### 23. Prüffristen-Checkliste (Leitern, PSA, Prüfmittel)
**Was:** Prüffristen verwalten, Vorlagen, Erinnerungslisten, Export.
**OSS-Lage:** `idb-keyval` (Apache-2.0, **55 kB**, aktiv) genügt für lokale Speicherung;
`dexie` (Apache-2.0, 3,2 MB) ist mächtiger, aber für eine Liste überdimensioniert.
`localforage` ist seit **2021 eingefroren**.
**Machbarkeit:** **M**. Einfach zu bauen — aber: **Erinnerungen brauchen einen Zeitgeber.**
**Risiko:** Ein local-first Werkzeug ohne Server kann nicht von selbst erinnern. Möglich ist
nur „beim Öffnen anzeigen, was fällig ist" plus Export in den Kalender. Das muss ehrlich so
benannt werden — ein Werkzeug, das Erinnerungen verspricht und keine sendet, ist eine
Enttäuschung.

#### 24. KFZ-Reifen- und Drehmomentrechner
**Was:** Reifengrößen vergleichen (Abrollumfang, Tachoabweichung), Anzugsmomente.
**OSS-Lage:** `automa-tan/tireshift` (Codeberg) und mehrere kleine GitHub-Projekte — meist
ohne aussagekräftige Lizenz oder ohne Pflege. Die Geometrie ist trivial und gehört nicht in
eine Abhängigkeit.
**Machbarkeit:** **S**. Eigene Rechnung.
**Risiko:** Drehmomente sind fahrzeugspezifisch und in Datenbanken hinterlegt — als
Eingabefeld oder als klar gekennzeichnete Richtwerte, nicht als Fahrzeugdatenbank (die wäre
Backend-Arbeit und widerspricht der Projektlinie).

---

## Zusammenfassung nach Aufwand

**S — Reine Rechnung, keine Abhängigkeit (13):**
1 Maßketten, 2 Flächen, 3 Einheiten, 4 Beton, 5 Pflaster, 6 Dach, 8 Holzfeuchte (Rechnung),
9 Fliesen, 10 Farbe, 11 Trockenbau, 12 Bodenbelag, 17 Metallgewicht, 24 Reifen

**M — Mit Datenaufgabe oder neuer Abhängigkeit (9):**
7 Zuschnittoptimierer, 8 Holzfeuchte (Daten), 13 Leitungsquerschnitt, 15 Rohrdimensionierung,
16 Heizlast, 18 Gewinde, 19 Foto-Beschrifter, 20 Protokoll, 23 Prüffristen

**L — Großer eigener Baustein (1):**
22 Aufmaß-Skizze

**Eingeschränkt (1):**
21 Normen-Nachschlagewerk — **Empfehlung: streichen.**

## Empfohlene Wellen (Vorschlag, keine Entscheidung)

- **Welle 1 — die sichersten:** 1, 2, 3, 10. Reine Rechnung, kein Rechtsrisiko, sofort
  nützlich für mehrere Gewerke. Prüfen zugleich die neue Werkzeugkette ohne Abhängigkeiten.
- **Welle 2 — Gewerke-Kern:** 4, 6, 9, 11, 12, 17. Materialbedarf für die großen Gewerke.
- **Welle 3 — technische Gewerke mit Datenaufgabe:** 13, 15, 18. Erst nach Klärung der
  Normfrage (Q2) und mit belegter Datenbasis.
- **Welle 4 — Dokumentation:** 19, 20. Nutzt vorhandene Bausteine, hoher Praxiswert.
- **Einzeln:** 7 (Algorithmus), 22 (großer Baustein), 23 (Erinnerungsgrenze benennen).
- **Nicht:** 21.

## Offene Punkte

- [ ] **Normfrage entscheiden**, bevor 13/15/16/18 begonnen werden: Welche Belastungswerte
  aus welchen frei zugänglichen Quellen, und wie wird die Herkunft im Werkzeug sichtbar?
- [ ] **Datenbasis belegen** für 8, 13, 18: je Wert eine Quelle, keine übernommene Tabelle.
- [ ] **Nicht gemessen:** Bundle-Größe der genannten Kandidaten im Browser. Registry-Angaben
  sind das ganze Paket, nicht das, was im Browser landet.
- [ ] **Nicht geprüft:** ob `maxrects-packer` (2022) und `binpackingjs` (2026) die
  Guillotine-Bedingung und Sägeschnitt-Verlust abbilden. Vor einer Entscheidung für 7 messen.
- [ ] **Nicht geprüft:** Speichergrenzen bei mehreren großen Canvas-Flächen (19).
- [ ] Kein Probeaufbau erfolgt — alle Urteile sind Papierurteile mit Quelle.

## Nachtrag 2026-10-03, Faber: GPL ist kein Ausschlussgrund — die Begründung war zu pauschal

Auf Nachfrage von Thomas geprüft. Der Befund oben bleibt in der Sache richtig (opcut ist
unbrauchbar), die **Begründung** war falsch gewichtet. Richtigstellung:

- **`licenses/policy.json` verbietet GPL nicht.** Die Datei hat zwei Listen:
  `allowedExpressions` (ohne weitere Prüfung erlaubt) und `reviewRequired`
  (prüfpflichtig). GPL steht in der zweiten — das ist eine Bringschuld, kein Verbot.
- **GPL-3.0 ist mit AGPL-3.0 kombinierbar.** FSF, „License Compatibility and Relicensing":
  „you can include source code under the GNU GPL version 3 together with other source code
  under the GNU Affero GPL in a single combined program." §13 beider Lizenzen ist dafür
  gebaut. Das Gesamtwerk trägt dann AGPL — bei uns ohnehin die Projektlizenz.
- **Harter Ausschluss ist nur `GPL-2.0-only`** (FSF-Lizenzliste: die AGPL ist „not compatible
  with GPLv2"). Bei `GPL-2.0-or-later` ist auf 3.0 wählbar und die Kombination wieder zulässig.
- **Präzedenz im Projekt:** MuPDF ist AGPL-3.0 und wird für M4 eingesetzt (ADR 0002 nennt es
  als Kandidat, `aktueller-stand.md` als umgesetzt). Eine Copyleft-Engine steckt also längst
  im Projekt; der Umgang ist etabliert.

**Korrigierte Begründung für opcut:** ausgeschieden wegen der **Architektur** (Python-Server,
C-Anteil, REST-API — unvereinbar mit Local-First im Browser). Die Lizenz GPL-3.0 wäre für
sich genommen **kein** Hindernis gewesen; sie hätte lediglich die dokumentierte Prüfung nach
`reviewRequired` ausgelöst.

Der Satz „scheidet aus zwei Gründen aus" oben ist damit auf einen Grund zurückzuführen.

## Quellen

- Registry-Inventar: `npm-inventar.mjs` über 40 Kandidaten, 2026-10-03 (Lizenzfeld, Version,
  Datum, entpackte Größe, Repo).
- Lizenzen im Repo gelesen: `buildvisionai/construction-calculators` (MIT),
  `estimatorsuite/construction-calculators` (MIT), `bozokopic/opcut` (GPL-3.0).
- Normrecht: OLG Hamburg 3 U 220/15 (2017), referiert bei `kanzlei.biz`, `urheberrecht.de`,
  `ferner-alsdorf.de`.
- Formeln: Kabelquerschnitt und Spannungsfall (`elekrechner.com`, `mepbau.com`, `techeld.de`),
  Farb- und Tapetenbedarf (`techeld.de`, `rechenfix.de`), Dachfläche und Neigungsfaktor
  (`airteam.ai`, `omnicalculator.com`), Fugenmörtel (`tw.advema.de`), Holzfeuchte
  (`tischlernord.de` Formelsammlung, `holzland.de`), Rohdichte Fichte 0,46 g/cm³
  (`lwf.bayern.de`), Stahldichten (`schmiedekult.de`, `wloeckner`-Rechner).
- Vergleichsprodukte (nur als Funktionsreferenz gelesen, proprietär): TileWright, DokuAI,
  Workstool, Betrivo, heiz.report, ZVPLAN.
