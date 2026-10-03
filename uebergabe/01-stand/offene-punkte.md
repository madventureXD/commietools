# Offene Punkte

- [ ] Anbieterneutralen Übersetzungsablauf mit Google Cloud Translation Advanced gemäß
  `uebergabe/03-konzepte/2026-10-03-automatisierte-sprachpakete.md` erst bei der nächsten
  geplanten Sprache umsetzen.
- [ ] Lokales spanisches Testpaket gemäß `uebergabe/03-konzepte/2026-10-03-sprachpaket-spanisch.md`
  sprachlich und visuell gegenlesen; erst danach zur Veröffentlichung freigeben.

Diese Liste enthält bestätigte, noch nicht abgeschlossene Arbeit. Details gehören in verlinkte Konzepte oder Issues, sobald solche vorhanden sind.

## Hohe Priorität

- [ ] M7-Rust-WASM-Prototyp gemäß `uebergabe/07-pruefung/m7/` durchführen: zuerst `StrategicProjects/pdf_signer` nativ reproduzieren, anschließend minimalen B-B-WASM-Adapter prüfen; `@signpdf/signer-p12`/`node-forge` wegen `GHSA-86w9-cpqp-85rv` nicht einsetzen.
- [ ] Nach erfolgreicher Domainumschaltung einen sichtbaren Source-Link auf `https://github.com/madventureXD/commietools` in die Weboberfläche integrieren.
- [ ] Mailbetrieb nach DNS-Umschaltung prüfen: MX, `autoconfig`, vier SRV-Einträge und SPF; `autoconfig` muss in Cloudflare auf „DNS only“ bleiben.
- [ ] PDF-Suite M8/M9 gemäß erweitertem 24-Werkzeuge-Konzept umsetzen; mit dem vorhandenen
  PDF.js-Unterbau nach dem umgesetzten eigenständigen Viewer mit Metadaten, Beschneiden,
  Reparatur, Anhänge und Vergleich umsetzen; anschließend die risikoreicheren Werkzeuge PDF/A,
  sichere Schwärzung und Office-Konvertierung angehen. Für jeden Schritt gilt das dokumentierte
  Open-Source-, Lizenz- und Artefaktgate; proprietäre Dienste sind kein Fallback.
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

