# MS1–MS7: Reparaturen und Abnahmevorbereitung

**Datum:** 2026-10-08 · **Bearbeitet durch:** Codex · **Status:** teilweise

Thomas hat „Ms1-ms7 komplett durchziehen“, anschließend „Alles ist grundsätzlich genehmigt worden“ und „Habe Vollzugriff erteilt“ erklärt. Die Auftragsfreigabe gilt für die gesamte Umsetzung. Weitere routinemäßige fachliche Genehmigungen sind nicht erforderlich. Die zwei konkreten Lizenzantworten stehen in [lizenzentscheidungen.md](lizenzentscheidungen.md). Fehlende unabhängige Prüfung, echte Geräte und Kontoanbindung sind fehlende Abnahmen/Zugänge, keine erneute Genehmigungsrunde.

Die [MS0-Basis](../2026-10-08-ms0/README.md) bleibt eingefroren. Maßgebliche laufende Kartenübersicht ist der datierte Nachtrag in [vorgehen-qm-audit.md](../../../00-einstieg/vorgehen-qm-audit.md). Dieses Paket liefert Belege; es ersetzt kein unabhängiges Gesamturteil über die 59 Karten.

## Ergebnis je Milestone

| Milestone | Lokal umgesetzt und geprüft | Verbleibender Exit |
|---|---|---|
| MS1 | Status-/Ausdruck-/Quellen-/Zweckbindung der Ausnahmen; drei echte Lizenzmutanten; Originalhinweise für asn1-rs-impl/defmt-parser; 176 Rust-Komponenten, 174 mit Hinweisen; exakt genehmigte CMS/P12-Hinweisausnahmen; eigener Rust/WASM-Bau; aktueller Advisoryscan und verfügbare native Patches | Hinweisnachlieferung bis 2026-11-08; unabhängige Sicherheits-/Parserabnahme; veröffentlichte Quell-/Binary-Zuordnung |
| MS2 | PdfSplit schützt jedes Read-/Inspect-await und die Fehlerwege gegen überholte Auswahl; alte Datei sofort entzogen; Ergebnis-URL-Eigentümer außerhalb des State-Updaters; echter React-StrictMode-Lauf mit Identitätsprüfung | Unabhängige Kontrolle der integrierten Änderung |
| MS3 | Gemeinsamer Rohtextvertrag für Werkzeug-/Common-/UI-/Suitentexte; fehlender UI-Schlüssel und lone surrogate scheitern im Root-Test; Scanner öffnet echten Dialog, prüft Kategorien und Fokus-Rückkehr; zwei Menümutanten scheitern; alle 65 Grundrouten in zwei Themes sowie Reflow | Reale Vorleser-/Zoom-/Geräteabnahme und systematische zusätzliche Werkzeugzustände |
| MS4 | Cache genutzter statischer Abhängigkeiten inklusive PDF-Worker, dauerhaft beobachtete späte SW-Kontrolle, bestätigte Cache-Schreibvorgänge; Quota-/Eviction-Probe; Stale-Meldung nur bei beobachtetem Buildwechsel; OCR-Worker von Beginn an eigener Besitzer, Fehler-/Abbruch-/Zeitlimit; echtes Modell und beschädigtes Modell geprüft | Locale-/Buildwechsel-/Altprofilmatrix, Modelle de/es, tatsächliche neue Lieferheader |
| MS5 | Workflow-Syntax mit hashgeprüftem actionlint 1.7.12; Actions an echte Commits gebunden; gebaute Dist als Browserartefakt; Releasepflicht verlangt drei erfolgreiche Jobs; wirkende QPDF-/P12-Gates und 13 hashgebundene DSS-Sollurteile | Echte GitHub-Läufe, Branchschutz und kontrollierte Kopplung an Cloudflare |
| MS6 | Echter Plattendownload mit Unicode-Dateiname und Bytevergleich; native Rust-Tests; frischer Clone mit Kandidatenüberlagerung ohne QM/work, npm ci/check/build, bytegleicher WASM-Neubau; D/E-Browserfälle für sechs Werkzeuge; vier frühere Übergabefassungen im Baum archiviert | Native Picker, NVDA/Narrator, Touch/Rotation/realer Zoom, komplexe PDF-Lesereihenfolge, Foto-/Übergabe-Originalkriterien und SHK-/Elektrofachabnahme |
| MS7 | Kandidatenmanifest mit Quellidentität, Lock-/WASM-/Dist-Hashes; lesende Messung des bestehenden öffentlichen Headerstands; konkrete Restabnahme zusammengestellt | Unabhängige A2; reale CI-/Betriebsbelege; identisches Artefakt ausliefern und öffentliche Wirkung einschließlich Altprofil/NEL prüfen |

## Ausführbare Prüfkette

`npm run verify:finish` führt die lokale Standardkette aus. `npm run verify:finish final` prüft den integrierten Stand einschließlich frischem Checkout und erzeugt den Kandidaten. Zusätzliche benannte Läufe: `extras`, `remaining`, `repro`, `advisories`, `rust-patches`, `public-read`, `de`, `root-final`. Der letzte Modus prüft Root-Check, Build, Workflow-Syntax und Kandidatenmanifest nach Aktenkorrekturen. Logs gehen nach `QM/83-ms1-ms7-2026-10-08/`; die Skripte benötigen dort keine ursprünglichen Hilfen. [proof-results.json](proof-results.json) hält die 18 erfolgreichen lokalen Stufen, drei Zusatzbelege, Loghashes und begrenzte Logauszüge fest. Die ursprüngliche fehlgeschlagene Check-Stufe und ihr erfolgreicher Ersatz werden ausdrücklich ausgewiesen. Aufruf zur Belegaktualisierung: `node scripts/finish-proof-results.mjs`, nach der Manifestaktualisierung. Das Kandidatenmanifest bindet zusätzlich die tatsächlichen Quell-, Skript-, Workflow-, Lizenz- und Fixture-Dateien im Arbeitsbaum über Einzelhashes und sourceDigest.

Die neuen regulären Gates enthalten zwei Policy-Tests, drei tatsächliche Lizenzmutanten und die 13 DSS-Fixtures. Root-Check: 54 Testdateien/730 Tests; zusätzlich Node-Policy-Tests. Der Wechsel von 733 auf 730 Vitest-Tests folgt dem Ersatz der sechs getrennten Sprachprüfungen durch drei gemeinsame Prüfungen einschließlich aller Textklassen und Gegenbeispiele. Keine weggefallene Sprachklasse. Der bisherige Warnstand von 110 hat sich auf 111 Lint-Warnungen erhöht; keine Lint-Fehler. Bündelwarnungen bleiben sichtbar und wurden nicht durch höhere Budgets verborgen.

PDF-Wirkung ist gegen den unabhängigen PDF.js-Leser geprüft: Passwortpflicht, falsches Passwort, wirklich entsperrtes Ergebnis und reparierte Querverweistabelle. Signieren nutzt das synthetische öffentliche P12, Integrität/Coverage und Manipulation werden geprüft; selbstsigniert wird nicht als vertrauenswürdig bezeichnet. Die drei PDF-Mutanten ersetzen isoliert den API-Effekt in der Fixture (Protect-noop, Unlock-noop, Always-valid); sie verändern keine Produktionsdatei.

Die OCR-Probe nutzt den echten installierten Tesseract.js-7-Worker und WASM-Kern unter der unveränderten Projekt-CSP; nur Core-/Modellpfade zeigen auf den kontrollierten lokalen Server. Ein echtes englisches Modell wird mit Herkunft/Hash im Log erfasst. Das ist weder eine Behauptung erfolgreicher de/es-Modelltests noch ein Beweis der derzeit öffentlichen CSP. Der neue kleine Worker-Client verwendet das Protokoll der installierten Version; künftige Tesseract-Upgrades müssen diese Wirkungsprobe bestehen.

## Zusätzlich gefundene und reparierte Fehler

1. QPDF konnte eine beschädigte XRef-Tabelle nicht direkt öffnen. Nur bei dem definierten Unsupported-Fehler wird mit PDF-lib ohne `ignoreEncryption` die Tabelle rekonstruiert und danach erneut QPDF aufgerufen. QPDF-Warnstatus 3 wird ausschließlich bei Reparatur akzeptiert; Fehlerstatus 2 bleibt Fehler. Unabhängiger Inhaltstest erforderlich. [QPDF-Exitstatus](https://qpdf.readthedocs.io/en/stable/cli.html#exit-status).
2. OCR-Modellinitialisierung konnte hängen, bevor die bisherige createWorker-Zusage einen terminierbaren Worker lieferte. Der native Worker wird nun vor jedem Initialisierungsschritt besessen; jeder Reject, Abbruch, Unmount und Zeitlimit beendet offene Jobs. Der echte beschädigte-Modell-/Downloadabbruch-Test besteht.
3. Quellcode-Link auf `/licenses` und E-Mail-Link auf `/impressum` waren nur 21 px hoch. Bestehende Link-Button-Gestaltung vergrößert beide Bedienziele; die erneute Gesamtmatrix besteht.
4. Rust-Binaries enthielten zuerst Rechnerpfade; Remapping entfernte diese. Der erste andere Checkoutpfad änderte dennoch 292 Bytes im Layout. Der Windows-Referenzbau nutzt deshalb vorübergehend ein freies `J:` als virtuellen Checkoutpfad und entfernt seine eigene Zuordnung nach Cargo. Vorhandene Laufwerke werden nicht ersetzt. Zwei getrennte Ziele und der dritte Bau im frischen Clone liefern SHA-256 `fbe9efd3a25010a40f7bec6858a79a38ad5ef8cc76ceedc0070e087969264697`. Kein Nachweis gleicher Bytes auf Linux oder anderer Hardware. [Windows subst](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/subst), [Cargo/RUSTFLAGS und Reproduzierbarkeit](https://blog.rust-lang.org/inside-rust/2025/01/17/this-development-cycle-in-cargo-1.85/).
5. Der echte Tab-Durchlauf zeigte an der letzten Menüposition einen Wechsel zur Browseroberfläche. Ergänzende Schleifen nur an erster/letzter sichtbarer Position erhalten die native Modalität; sichtbare summary und geschlossene Nachfahren werden korrekt berücksichtigt. Die anschließende Prüfung besteht: sieben Gruppen, 278 Tab-Ereignisse vorwärts/rückwärts, Enter/Space, Escape, Browser-Zurück, stabile Route und Fokus-Rückkehr bei 390 px. Kein Vorleser- oder Touch-Beleg.

Frühere fehlgeschlagene Versuche (Sandbox/Browserstart, ZIP-Entpacken mit fehlendem PowerShell-Modul, Fixture-Skript vor body, frischer Clone ohne identischen Referenzpfad, Menü-Tab) sind keine erfolgreichen Abnahmen. Sie wurden jeweils korrigiert und erneut geprüft. Der integrierte Endlauf hatte noch eine Aktenverletzung: OP-062 stand mit abgeschlossenem Häkchen in der aktiven Liste. Der Originalpunkt wurde unverändert ins [Erledigungsarchiv](../../../06-protokolle/2026-10-08-erledigte-punkte-ms1-ms7.md) übernommen und aus der aktiven Liste entfernt. Aktenprüfung und anschließender vollständiger Root-Check/Build bestehen. Erfolgreiche Ersatzprüfungen sind in der Ergebnisdatei von den gescheiterten Vorversuchen unterschieden; kein stilles Ignorieren fehlgeschlagener Stufen.

## Sicherheitsrecherche und Betrieb

[rust-advisories.json](rust-advisories.json) bindet den aktuellen offiziellen OSV-API-Abruf an beide Cargo-Locks: 296 unterschiedliche Registry-Versionen einschließlich optionaler/dev-Abhängigkeiten. Crossbeam-epoch 0.9.18 und rustls 0.23.40 waren nur im nativen Lockstand betroffen; auf 0.9.20 bzw. 0.23.45 aktualisiert, rustls-webpki dabei auf 0.103.15. Native Tests erneut bestanden. Der verbleibende RSA-0.9.10-Hinweis [RUSTSEC-2023-0071](https://rustsec.org/advisories/RUSTSEC-2023-0071.html) hat weiterhin keine Fix-Version; `ttf-parser` 0.25.1 hat einen Wartungshinweis. Beide sind im Browsergraphen vorhanden. Local First reduziert die für Marvin beschriebene Netz-Timing-Exposition, ist aber kein unabhängiger Nachweis, dass sämtliche erreichbaren Kryptopfade sicher sind. A2 muss die vorhandenen Risiken einschließlich Parser-/Größen-/Signaturgrenzen beurteilen. Der Scan-Exit 0 bedeutet vollständig ausgeführte Abfrage, keine Sicherheitsfreigabe.

[production-readonly.json](production-readonly.json) hält den **vorhandenen** öffentlichen Stand vom 2026-10-08 fest. Er liefert `script-src 'self'` und `connect-src 'self'`; damit ist die aktuell lokale WASM/OCR-CSP dort nicht ausgeliefert. NEL `cf-nel` mit `success_fraction:0.0`/604800 Sekunden und Cloudflare-Report-Endpunkt ist weiter vorhanden. Weg A bleibt erhalten. Lesende Headerabfrage ersetzt weder neue Veröffentlichung noch Altprofil-/Versand-/Empfängerprüfung. Kontoanbindung und tatsächliche GitHub-Läufe sind in dieser Umgebung nicht verfügbar; keine Kontoeinstellung behauptet.

## OP-062: Archivvariante

Im vollständig beauftragten MS6 wird die konservative Archivvariante umgesetzt: [archiv/manifest.json](archiv/manifest.json) bindet vier unveränderte Fassung-vor-Migration-Dateien an vollständige Git-Revisionen und Hashes. Die aktuellen Übergaben und die Git-Geschichte bleiben erhalten. Es wird **keine** nachträgliche individuelle Freigabe am 2026-10-04/05 erfunden. Künftige Strukturmigrationen brauchen weiter den Beschluss und eine erhaltene Archivfassung gemäß Arbeitsregeln. Die Archivierung ist die Umsetzung der bereits erteilten Auftragsfreigabe; kein erneuter Betreiberentscheid nötig.

## Restabnahme mit tatsächlichen Ressourcen

- Unabhängiger A2-Prüfer prüft den integrierten Kandidaten, alle ursprünglichen 26 Restverträge sowie Parser-/Kryptorisiken; bisher keiner benannt/bestätigt.
- GitHub-/Cloudflare-Kontozugang: echte grüne/rote Pflichtläufe, erforderliche Checks, Deploysperre und Artefaktidentität belegen. Bestehende unabhängige Kontrolle vor Push bleibt unerfüllt; keine Veröffentlichung ohne diesen Nachweis.
- Reales Zielgerät: Picker/Abbruch/Schreibfehler, NVDA/Narrator, 200/400% Browserzoom, Touch-Schwärzung mit Rotation und Exportkoordinaten, PDF-Lesereihenfolge und Auskoppelfenster prüfen.
- D/E: echte Fremdfoto-EXIF-/Pixel-/Speichergrenzen und vollständiges Übergabe-PDF einschließlich Fotos/Unterschriften; acht eingefrorene Originalkriterien Zeile für Zeile abnehmen. SHK-/Elektroprüfer ergänzen die bereits geprüften Rechenbeispiele.
- Offline: weitere Locale-/Buildwechsel-/Altprofilkombinationen und deutsche/spanische OCR-Modelle ergänzen. Nach Veröffentlichung tatsächliche Header/NEL beobachten; ursprüngliche Fragen bleiben sichtbar.
- CMS/P12-Hinweise spätestens am 2026-11-08 nachliefern oder vor Ablauf ausdrücklich neu entscheiden; der Gate-Ablauf sperrt danach automatisch.

MS1–MS7 sind deshalb **beauftragt und lokal weitgehend umgesetzt, insgesamt noch nicht vollständig abgenommen**. Eine Pauschalfreigabe ersetzt die beschriebenen Messungen und unabhängige A2 nicht. Die Arbeitsfreigabe wird nicht nochmals abgefragt.

## Nachtrag 2026-10-08 — benannte Abschlussprüfung und echte Ausführung

Die Aussagen „bisher keiner benannt/bestätigt“, „Kontoanbindung und tatsächliche GitHub-Läufe
sind in dieser Umgebung nicht verfügbar“ und die offenen de/es-Modelltests beschreiben den
vorherigen Stand in Commit `8a084a0a8b06cd83b1ab0ebddb47e5e32feb896f`. Thomas hat Codex ausdrücklich
als Prüfer benannt. [Abschlussprüfung](abschlusspruefung.md) dokumentiert diese Review einschließlich
der eigenen Reparaturbeteiligung und tatsächlichen Gegenproben. Eine weitere Person ist keine
Arbeitsvoraussetzung. [Abschluss-Endbeleg](abschluss-proof-results.json) friert alle 21 erfolgreichen
integrierten lokalen Stufen mit Loghashes ein; der ältere 18-Stufen-Beleg bleibt historische Messung.

OCR eng/deu/spa, alle drei zuvor benutzten Oberflächensprachen nach echtem Offline-Reload,
Schwärzung über Tastatur mit unabhängig gelesener Exportwirkung, Viewer-Tastatur/Textbaum,
Fremdfoto/EXIF/Pixelvergleich und Protokoll mit zwei tatsächlichen Zeigerunterschriften sind
zusätzlich geprüft. Die VOB-Fundstelle und das Rennen zwischen Unterschrift-PNG und PDF-Export
wurden dabei repariert. Sechs Foto-/Protokollseiten wurden mit Poppler visuell kontrolliert.

GitHub-Zugang funktioniert; `main` ist tatsächlich auch für Administratoren durch `Releasepflicht`
geschützt. [PR #1](https://github.com/madventureXD/commietools/pull/1) ist ein Entwurf auf dem isolierten
Audit-Zweig. Der erste reale Lauf fand einen 39-px-Navigationsknopf auf dem fremden Windows-Rechner;
Commit `c4a437d486bb98077a4eb3a91670ea1582b45a9d` setzt 44 px Mindestbreite. Rust-Neubau und Bytegleichheit
bestanden bereits dort. Die absichtliche Hashverletzung `056cc21a19d338044e5c60e6dd9bc23331534da8`
wurde ausschließlich als negative CI-Probe veröffentlicht und in `6d1fcd9` wiederhergestellt.
Die tatsächlichen Läufe stehen in [github-runs.json](github-runs.json); laufend ist kein PASS.

Cloudflare erzeugt automatisch Audit-Vorschauen. [preview-delivery.json](preview-delivery.json)
belegt tatsächliche neue öffentliche CSP, WASM-Prüfung und OCR in allen drei Modellsprachen.
Ein separater Cloudflare-Token ist dafür nicht erforderlich. Diese Vorschau ist keine Veröffentlichung
auf der Produktivdomain und ersetzt keinen Nachweis bytegleicher kompletter CI-/Hostingartefakte.
Headless-PDF-Rasterung benötigt eine aktive Prüftab-Seite; frühere Timeoutversuche werden nicht als
OCR-PASS geführt. Die bestandene Wiederholung aktiviert die eigene Headless-Seite explizit.

Offen bleiben tatsächlich nicht verfügbare native Dateidialoge, Vorleseransagen, echter Browserzoom,
physischer Touch und originale noch nicht gemessene Liefer-/Altprofil-/NEL-Empfängerbedingungen.
Windows verweigert auch nach erneuter Vollzugriffsfreigabe `GetCursorPos` mit `0x80070005`.
Diese Messungen werden nicht durch Häkchen ersetzt. Keine neue technische Betreiberentscheidung
und keine erneute Arbeitsfreigabe erforderlich.

## Nachtrag 2026-10-08 — tatsächlicher grüner Kandidat

Die noch offene erfolgreiche CI in den früheren Tabellen ist für Revision
`524f0738f1c04a997735b82174b2c18b3adb0e44` durch
[Run 37768849407](https://github.com/madventureXD/commietools/actions/runs/37768849407)
erfüllt: alle vier Pflichtjobs erfolgreich. `github-artifact.json` bindet die komplette
öffentliche Vorschau an das tatsächliche CI-Archiv, 696 öffentliche Dateien ohne Abweichung;
die frühere pauschale Aussage über einen fehlenden kompletten Artefaktnachweis ist überholt.
Quell-/Buildlinks, NEL-Beobachtung im ursprünglichen begrenzten Vertrag und echter
Service-Worker-Buildwechsel sind ebenfalls geprüft. Siehe [Abschlussprüfung](abschlusspruefung.md).

Die eingefrorene 21-Stufen-Messung gehört zu `release-candidate-21-stages.json`.
Die abschließende CSS-Korrektur und die ergänzte 54-Fälle-Ergebnismatrix werden separat
geprüft; kein rückwirkendes Umetikettieren der 21 Stufen. Zusätzlich ausführbar:
`npm run verify:finish result-states` und `npm run verify:finish de-regions`.
Native Originalabnahmen bleiben wegen des erneut bestätigten Windows-Zugriffsfehlers offen.

Die zusätzliche Original-Textabstandsprobe besteht 36/36 Fälle, separat ausführbar mit
`npm run verify:finish text-spacing`; Bericht und genaue Grenzen in
[abschlusspruefung.md](abschlusspruefung.md). Dieser spätere Zusatzprüfer verändert keinen
Produktcode und wird nicht als Bestandteil eines früher gestarteten CI-Laufs behauptet.

Der abschließende [Pflichtlauf 37771905865](https://github.com/madventureXD/commietools/actions/runs/37771905865)
zum gepushten Produktstand `5815c67be9e377446c68c2bc63b9083fa5bf0b2d` ist mit vier
erfolgreichen Jobs abgeschlossen. Auch die 54-Fälle-Matrix ist darin tatsächlich bestanden.
Die Endbelege werden danach lokal separat gesichert. Das [Endurteil](abschlusspruefung.md)
benennt die sieben nativen/physischen Restkarten; keine falsche Gesamtproduktionsfreigabe.
