# Offene Punkte

Diese Liste enthält bestätigte, noch nicht abgeschlossene Arbeit. Details gehören in verlinkte Konzepte oder Issues, sobald solche vorhanden sind.

## Hohe Priorität

- [ ] Nach erfolgreicher Domainumschaltung einen sichtbaren Source-Link auf `https://github.com/madventureXD/commietools` in die Weboberfläche integrieren.
- [ ] Mailbetrieb nach DNS-Umschaltung prüfen: MX, `autoconfig`, vier SRV-Einträge und SPF; `autoconfig` muss in Cloudflare auf „DNS only“ bleiben.
- [ ] PDF-Suite M6 vorbereiten: PDF.js-Textextraktion und Tesseract.js-OCR mit Sprachmodell-, Worker-, Cache-, Speicher- und Lizenzgate prototypisieren.
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

## Später / bei konkretem Bedarf

- [ ] Speicheradapter für persistente lokale Nutzerdaten definieren.
- [ ] Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs des Registers messen; Ausweg ist eine abgerufene Registerdatei mit Ladezustand.
- [ ] Desktop- und Mobile-Shells evaluieren.
- [ ] Erweiterungsmodell für externe Tools oder Plugins bewerten.

## Pflege

- Erledigte Punkte mit Verweis auf Commit oder ADR in ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

