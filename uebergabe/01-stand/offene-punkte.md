# Offene Punkte

- [ ] Anbieterneutralen Übersetzungsablauf mit Google Cloud Translation Advanced gemäß
  `uebergabe/03-konzepte/2026-10-03-automatisierte-sprachpakete.md` erst bei der nächsten
  geplanten Sprache umsetzen.
- [ ] Lokales spanisches Testpaket gemäß `uebergabe/03-konzepte/2026-10-03-sprachpaket-spanisch.md`
  sprachlich und visuell gegenlesen; erst danach zur Veröffentlichung freigeben.
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

- [ ] Für Mehrfachausgaben nach gesonderter Größen- und Lizenzprüfung **Alle speichern …** per
  Ordnerauswahl und/oder ZIP-Fallback ergänzen; Einzel-Speichern mit frei wählbarem Namen und Ort
  ist bereits einheitlich umgesetzt.
- [ ] Schritt 3 der Katalogsuche: gezogene Datei gegen die deklarierten Dateitypen prüfen und passende Werkzeuge vorschlagen, mit Unterscheidung zwischen „liest" und „schreibt".
- [ ] Weitere Suchbegriffe ergänzen, wenn im Gebrauch Lücken auffallen (Register und Prüfung melden Dopplungen; zwei Tests finden tote Begriffe).
- [ ] Offline-Verhalten mit einem automatisierten Browser-Test absichern.
- [ ] Content Security Policy und spätere Deployment-Header konkretisieren.
- [ ] Größenbudgets zusätzlich pro große Tool-Engine festlegen; das Startbudget und die Sperre gegen PDF-Engines sind umgesetzt.
- [ ] **Werkzeugtexte je Sprache im Blick behalten — Reserve 4,3 KiB.** Mit dem umgesetzten
  Sprachpaket-Umbau ist das Startbündel entspannt (136.959 von 204.800 B gzip); das frühere
  Budgetproblem „vor Welle 6 den Ausweg bauen“ ist damit **erledigt**, ebenso der Punkt zur
  Aufnahme von `bundle:check` in den Prüflauf (die Größenkontrolle läuft im Build). An ihre
  Stelle tritt die neue Warnschwelle aus `sprachgetrennte-suchpakete`: **Werkzeugtexte Deutsch
  26.403 von 30.720 B gzip** nach Welle 6. Eine weitere Werkzeugwelle dieser Größe kann sie
  reißen; Ausweg ist die Aufteilung der Werkzeugtexte je Sprache (etwa je Suite).
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

- [ ] Speicheradapter für persistente lokale Nutzerdaten definieren.
- [ ] Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs des Registers messen; Ausweg ist eine abgerufene Registerdatei mit Ladezustand.
- [ ] Desktop- und Mobile-Shells evaluieren.
- [ ] Erweiterungsmodell für externe Tools oder Plugins bewerten.

## Pflege

- Erledigte Punkte mit Verweis auf Commit oder ADR in ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

