# Offene Punkte

Diese Liste enthält bestätigte, noch nicht abgeschlossene Arbeit. Details gehören in verlinkte Konzepte oder Issues, sobald solche vorhanden sind.

## Hohe Priorität

- [ ] Öffentliches Git-Repository festlegen und vor Veröffentlichung einen sichtbaren Quellcode-Link integrieren.
- [ ] Danach Cloudflare-Pages-Projekt verbinden und die Hetzner-Domain gemäß `docs/deployment-cloudflare-pages.md` umstellen; vorhandene E-Mail-DNS-Einträge vorher sichern.
- [ ] PDF-Suite M3 umsetzen: Wasserzeichen, Seitenzahlen und sichtbare Unterschrift mit einer gemeinsamen Platzierungsengine.
- [ ] Den PDF-Testkorpus um frei weitergebbare verschlüsselte, XFA-, Annotations- und Signatur-Beispiele sowie Reader-Interoperabilität erweitern.
- [ ] Automatisierte Barrierefreiheitsprüfung für zentrale Komponenten und Tool-Flows ergänzen.

## Mittlere Priorität

- [ ] Schritt 3 der Katalogsuche: gezogene Datei gegen die deklarierten Dateitypen prüfen und passende Werkzeuge vorschlagen, mit Unterscheidung zwischen „liest" und „schreibt".
- [ ] Weitere Suchbegriffe ergänzen, wenn im Gebrauch Lücken auffallen (Register und Prüfung melden Dopplungen; zwei Tests finden tote Begriffe).
- [ ] Offline-Verhalten mit einem automatisierten Browser-Test absichern.
- [ ] Content Security Policy und spätere Deployment-Header konkretisieren.
- [ ] Performance-Budgets für große Tool-Engines und optionale Offline-Caches festlegen.

## Später / bei konkretem Bedarf

- [ ] Speicheradapter für persistente lokale Nutzerdaten definieren.
- [ ] Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs des Registers messen; Ausweg ist eine abgerufene Registerdatei mit Ladezustand.
- [ ] Grenze für WebAssembly-basierte Verarbeitungs-Engines entscheiden.
- [ ] Desktop- und Mobile-Shells evaluieren.
- [ ] Erweiterungsmodell für externe Tools oder Plugins bewerten.

## Pflege

- Erledigte Punkte mit Verweis auf Commit oder ADR in ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

