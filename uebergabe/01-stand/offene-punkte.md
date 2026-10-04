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

- [ ] **HEAD ist nicht baubar — die Fassung in `main` baut derzeit nicht.** Gemessen am
  2026-10-04: `apps/web/src/App.tsx` nutzt in HEAD `loadToolMessages` und `loadInterfaceMessages`
  (3 Vorkommen), beide Exporte fehlen in HEAD jedoch vollständig (`packages/i18n/src/index.ts`
  und `packages/tools/src/index.ts`: je 0 Vorkommen) — sie liegen nur uncommittet im Arbeitsbaum.
  Ursache: Beim Commit der Rechner-Welle 6 wurde `App.tsx` als ganze Datei gestaged, wodurch
  Änderungen des laufenden Sprachpaket-Umbaus ohne ihre Abhängigkeiten in HEAD geraten sind.
  **Folge: Ein Push auf `main` würde einen nicht baubaren Stand deployen.**
  Zwei Wege: **(a)** den Sprachpaket-Umbau vollständig committen (laut
  `06-protokolle/2026-10-04-startpaket-sprachpakete.md` lokal freigegeben und geprüft) — oder
  **(b)** `App.tsx` auf die vorherige Fassung zurücksetzen und nur die Aufmaß-Zeilen behalten.
  **Lehre für jede weitere Abnahme:** den zu veröffentlichenden Stand in einem **sauberen
  Auschecken von HEAD** prüfen, nicht im Arbeitsbaum — dort lagen alle uncommitteten Änderungen
  vor, weshalb `check` und `build` grün waren, obwohl HEAD selbst nicht baubar ist.
- [ ] Nach erfolgreicher Domainumschaltung einen sichtbaren Source-Link auf `https://github.com/madventureXD/commietools` in die Weboberfläche integrieren.
- [ ] Mailbetrieb nach DNS-Umschaltung prüfen: MX, `autoconfig`, vier SRV-Einträge und SPF; `autoconfig` muss in Cloudflare auf „DNS only“ bleiben.
- [ ] Den PDF-Testkorpus um frei weitergebbare verschlüsselte, XFA-, Annotations- und Signatur-Beispiele sowie Reader-Interoperabilität erweitern.
- [ ] Automatisierte Barrierefreiheitsprüfung für zentrale Komponenten und Tool-Flows ergänzen.
- [ ] **Werkzeugseiten schneiden bei 320 px ab (gemessen 2026-10-04).** Über den Viewport
  hinausragende Elemente je Route: `commercial` 20, `geometry` 19, `equations` 23, `aufmass` 28;
  Startseite 0. Die Seite bekommt dabei keinen waagerechten Scrollbalken, der Inhalt wird also
  **abgeschnitten** statt scrollbar. Betroffen ist die Werkzeugseiten-Vorlage insgesamt, nicht ein
  einzelnes Werkzeug.
  **Das ist ein offenes Abnahmekriterium, nicht nur Kosmetik:** `02-architektur/sprachpakete.md` §9
  verlangt „Desktop sowie 320 px, 360 px und übliches Mobilformat" zu testen, und
  `03-konzepte/2026-10-03-sprachpaket-spanisch.md` führt „Mobilansicht funktioniert ab 320 px ohne
  abgeschnittene Texte oder Aktionen" ausdrücklich als Abnahmekriterium.
  **Aufgabe für die Oberflächenseite (App-Shell), nicht für die einzelnen Werkzeuge.**
  Nächster Schritt: in Edge headless bei 320 px messen, welche Regel die Mindestbreite erzwingt
  (Kandidaten: `.settings-card`, `.form-grid`, `.download-row`, `.field` in `styles.css`), dann
  beheben und die Messung auf allen Routen wiederholen — die Startseite zeigt, dass 320 px
  grundsätzlich geht.

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

