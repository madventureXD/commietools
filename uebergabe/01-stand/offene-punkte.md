# Offene Punkte

- [ ] Anbieterneutralen Übersetzungsablauf mit Google Cloud Translation Advanced gemäß
  `uebergabe/03-konzepte/2026-10-03-automatisierte-sprachpakete.md` erst bei der nächsten
  geplanten Sprache umsetzen.
- [ ] Veröffentlichtes spanisches Testpaket gemäß `uebergabe/03-konzepte/2026-10-03-sprachpaket-spanisch.md`
  online sprachlich und visuell gegenlesen.
  *(2026-10-04: Das Gegenlesen ist erst **nach** der Online-Stellung möglich. Bis dahin bleibt
  `es` im Sprachschalter sichtbar und wird mitausgeliefert — abweichend von
  `02-architektur/sprachpakete.md` §2, das ein Testpaket „niemals veröffentlicht" sieht. Die
  Abweichung ist damit datiert festgehalten und nicht stillschweigend.)*

Diese Liste enthält bestätigte, noch nicht abgeschlossene Arbeit. Details gehören in verlinkte Konzepte oder Issues, sobald solche vorhanden sind.

## Hohe Priorität

- [ ] Nach erfolgreicher Domainumschaltung einen sichtbaren Source-Link auf `https://github.com/madventureXD/commietools` in die Weboberfläche integrieren.
- [ ] Mailbetrieb nach DNS-Umschaltung prüfen: MX, `autoconfig`, vier SRV-Einträge und SPF; `autoconfig` muss in Cloudflare auf „DNS only“ bleiben.
- [ ] Den PDF-Testkorpus um frei weitergebbare verschlüsselte, XFA-, Annotations- und Signatur-Beispiele sowie Reader-Interoperabilität erweitern.
- [ ] Automatisierte Barrierefreiheitsprüfung für zentrale Komponenten und Tool-Flows ergänzen.

## Mittlere Priorität

- [x] **Werkzeugtexte je Sprache aufteilen** (etwa je Suite). Stand 2026-10-04 nach der Aufteilung
  des Rechners in vier Werkzeuge: Deutsch 32.672 und Spanisch 31.645 Byte über der Warnschwelle
  30.720; Englisch lag mit 29.787 darunter. Die drei neuen Werkzeuge vergrößern die Summe um rund
  0,5 kB je Sprache — der eigentliche Anteil kommt aus den früheren Wellen.
  *Zusatz 2026-10-05: **Die Warnschwelle ist wieder unterschritten** — Deutsch 27.310, Spanisch
  26.847, Englisch 25.023 Byte. Erreicht durch zwei Schritte: Kurztext und Suchbegriffe liegen nur
  noch im Suchpaket (Doppelung entfernt, rund 15 % des Textpakets), und das Textpaket wird erst auf
  einer Werkzeugroute geholt statt beim Start (Startseite spart 52.211 B gzip; Netzbeleg in
  `07-pruefung/sprachpaket/beleg.txt`). **Offen bleibt Hebel 2:** die Aufteilung je **Werkzeug** —
  erst damit wächst kein Paket mehr mit einem fremden Werkzeug. Siehe
  `05-uebergaben/2026-10-05-sprachpakete-beim-oeffnen-laden.md`.*
- [ ] **Abweichung bei der Rechenkern-Größe klären:** ADR 0005 nennt 89,5 KiB gzip, die Nachmessung
  derselben Factory-Liste ergibt 100,6 KiB (esbuild, gzip -9, mathjs 15.2.0, 2026-10-04). Ziel,
  Liste und Werkzeugliste als Ursache ausgeschlossen; die Zahl wird im Projekt zitiert und sollte
  stimmen. Messskript: `work/rechner-mathjs-messung.mjs`.
- [ ] **Vier Rechner: 200 % Zoom und Screenreader-Namen** prüfen (beim Beleglauf am 2026-10-04
  bewusst ausgelassen, dort wurden zwei Fensterbreiten und die Rückleseprüfung gefahren).
- [ ] **Startgröße im Blick behalten:** drei neue Katalogeinträge je Sprache kosten 9,3 kB gzip im
  Startbündel (146.220 von 204.800). Bei den nächsten Werkzeugwellen neu messen; Ausweg bleibt die
  abgerufene Registerdatei.
- [ ] Entschieden, aber noch nicht gebaut: der **alte Verlaufsbereich `calculator.*`** liegt im
  Gerät, hat aber keine Anzeige und keinen Löschweg. Entweder eine sichtbare Aufräummöglichkeit
  anbieten oder den Punkt schließen.
- [ ] Für Mehrfachausgaben nach gesonderter Größen- und Lizenzprüfung **Alle speichern …** per
  Ordnerauswahl und/oder ZIP-Fallback ergänzen; Einzel-Speichern mit frei wählbarem Namen und Ort
  ist bereits einheitlich umgesetzt.
- [ ] Schritt 3 der Katalogsuche: gezogene Datei gegen die deklarierten Dateitypen prüfen und passende Werkzeuge vorschlagen, mit Unterscheidung zwischen „liest" und „schreibt".
- [ ] Weitere Suchbegriffe ergänzen, wenn im Gebrauch Lücken auffallen (Register und Prüfung melden Dopplungen; zwei Tests finden tote Begriffe).
- [ ] **Elf ältere Übergaben verfehlen die Pflichtabschnitte der Vorlage** (gemeldet am 2026-10-04
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
- [ ] Offline-Verhalten mit einem automatisierten Browser-Test absichern.
- [ ] Content Security Policy und spätere Deployment-Header konkretisieren.
- [ ] Größenbudgets zusätzlich pro große Tool-Engine festlegen; das Startbudget und die Sperre gegen PDF-Engines sind umgesetzt.
- [ ] **Werkzeugtexte je Sprache im Blick behalten — Reserve 4,3 KiB.** Mit dem umgesetzten
  Sprachpaket-Umbau ist das Startbündel entspannt (136.961 von 204.800 B gzip); das frühere
  Budgetproblem „vor Welle 6 den Ausweg bauen" ist damit **erledigt**, ebenso der Punkt zur
  Aufnahme von `bundle:check` in den Prüflauf (die Größenkontrolle läuft im Build). An ihre
  Stelle tritt die neue Warnschwelle aus `sprachgetrennte-suchpakete`: **Werkzeugtexte Deutsch
  26.403 von 30.720 B gzip** nach Welle 6. Eine weitere Werkzeugwelle dieser Größe kann sie
  reißen; Ausweg ist die Aufteilung der Werkzeugtexte je Sprache (etwa je Suite).
  *(2026-10-04: Das geplante Tastenfeld des Rechners (`03-konzepte/2026-10-04-rechner-oberflaeche.md`)
  bringt rund **35 zusätzliche Schlüssel je Sprache** — jedes Tastensymbol braucht laut
  `docs/ui-system.md` einen übersetzten zugänglichen Namen. Damit ist die Reserve von rund 4,3 KiB
  vor der Umsetzung neu zu messen; gegebenenfalls wird die Aufteilung der Werkzeugtexte je Sprache
  zur Voraussetzung dieser Welle statt zu einem Folgeschritt.)*
  *(Nachtrag 2026-10-04, Welle A der Handwerkerwerkzeuge: Die Schwelle ist **gerissen** — Deutsch
  **32.080 B** und Spanisch **31.130 B** gegen 30.720 B, Englisch 29.264 B darunter. Ursache ist der
  Umfang der vier neuen Handwerkswerkzeuge in drei Sprachen, nicht ein Fehler; der Build bricht zu
  Recht nicht ab. Der oben genannte Ausweg — Aufteilung der Werkzeugtexte je Sprache, etwa je
  Suite — ist damit **vor Welle B** zu bauen. Begründung im Einzelnen:
  `05-uebergaben/2026-10-04-welle-a-handwerkerwerkzeuge.md`.)*
- [ ] Bedienung per Tastatur automatisiert prüfen (seit Welle 5 offen; in Welle 6 erneut nur
  teilweise — native Formularelemente mit Beschriftungen, kein durchgespielter Tastaturlauf).
  *(2026-10-04: Der durchgespielte Lauf ist erst **nach** der Online-Stellung möglich; bis dahin
  wird die Suite ohne ihn ausgeliefert. Die Roadmap nennt die Barrierefreiheit ausdrücklich als
  Voraussetzung der Phase „Rechnen" — der Punkt bleibt deshalb hier stehen, bis er belegt ist.)*
- [ ] **PDF-Ausgabe ist auf WinAnsi beschränkt.** Zeichen außerhalb (kyrillisch, griechisch,
  chinesisch) werden transliteriert oder zu `?`. Für Deutsch, Englisch und Spanisch reicht das;
  eine Sprache mit anderer Schrift braucht eine eingebettete Schrift.
- [ ] Verhalten von Aufmaß bei sehr vielen Zeilen (mehrere hundert) und an Speichergrenzen messen.


## Später / bei konkretem Bedarf

- [x] **Werkzeuge in ein eigenes Fenster auskoppeln** (Desktop-Erfahrung). M0–M7 am 2026-10-04
  abgeschlossen: Auskoppeln funktioniert mit Zustandserhalt in beide Richtungen, Größen-Hilfe im
  Fenster (Zielgröße gemessen statt deklariert), Ehrlichkeits- und Farbschema-Nachweis;
  **41 von 41 Werkzeug-Routen belegt**; Regeln und Grenzen stehen seit M7 in `docs/ui-system.md`.
  Offen bleibt: Firefox-Messung, Desktop-Breiten (1920/1366/1024/768),
  **Veröffentlichung** (`05-uebergaben/2026-10-04-desktop-auskoppeln-m3-m5.md`,
  `05-uebergaben/2026-10-04-desktop-auskoppeln-m7.md`).
- [ ] Speicheradapter für persistente lokale Nutzerdaten definieren.
- [ ] Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs des Registers messen; Ausweg ist eine abgerufene Registerdatei mit Ladezustand.
- [ ] Desktop- und Mobile-Shells evaluieren. *(2026-10-04: Das Auskoppeln ist der erste Teil davon;
  der Punkt bleibt für die übrige Shell-Frage stehen.)*
- [ ] Erweiterungsmodell für externe Tools oder Plugins bewerten.

## Pflege

- Erledigte Punkte mit Verweis auf Commit oder ADR in ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

