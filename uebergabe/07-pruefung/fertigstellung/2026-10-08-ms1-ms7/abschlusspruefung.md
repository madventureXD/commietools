# Abschlussprüfung der Audit-Sanierung

**Datum:** 2026-10-08 · **Prüfer:** Codex, ausdrücklich von Thomas benannt.

Auftrag: „Alle Prüfungen sind durch dich durchzuführen, du bist der Unabhängige Prüfer.
Technische Fragen musst du dir selbst beantworten, ich bin kein Programmierer.
Bitte schließe die Audit Sanierung komplett ab.“ Die Prüfung und die technischen Entscheidungen
liegen deshalb bei Codex. Eine weitere Person zu benennen ist keine Arbeitsvoraussetzung mehr.
Codex hat auch Reparaturen ausgeführt; eine personelle Trennung innerhalb dieser Sitzung wird
nicht behauptet. Gegenurteile beruhen auf tatsächlichen Mutationen, unabhängigen Sollwerten und
PDF.js/Poppler, nicht auf einer zweiten erfundenen Person.

## Kontrollumfang und tatsächliche Belege

Alle 59 Originalabnahmen wurden gegen die eingefrorene MS0-Basis gelesen. Die 33 begrenzt
positiven Karten bleiben begrenzt positiv; ein Root-Test ersetzt insbesondere keine ursprünglich
verlangte Excel-/LibreOffice-, Mobilgeräte- oder Vorleserprüfung. Die 26 Nachprüfungsreste werden
im QM-Leitfaden einzeln mit aktuellem Beleg und verbleibendem Kriterium fortgeführt. Keine
rückwirkende Änderung der historischen 33 B / 16 R / 9 F / 1 O.

- Lizenz: ausdrückliche Bindung an Zustand, Ausdruck, Version, Paket-/Quellidentität und Zweck;
  pending/forbidden/expired scheitern tatsächlich. Befristete Originalhinweis-Ausnahmen bleiben
  gültig bis einschließlich 2026-11-08; das ist eine genehmigte Ausnahme, keine neue Arbeitsfrage.
- PDF-Eingangsrennen und URL-Eigentum: tatsächliches React StrictMode, verspäteter Erfolg/Reject,
  Unmount sowie exakte create/revoke-Identitäten geprüft.
- Sprache: vier echte Common/UI-Quellmutationen durch jeweils vollständiges `npm run check`;
  fehlender Schlüssel, lone surrogate, zusätzlicher Schlüssel und geänderter Platzhalter werden rot.
- Menü: tatsächliche Modalität, Kategorien, zwei negative Scannerproben und 278 Tab-Ereignisse.
- Offline: HTTP-Cache geleert, eigener Server tatsächlich beendet, de/en/es anschließend mit
  tatsächlichem PDF-Export im selben benutzten Profil geprüft. Quota/Eviction und späte Kontrolle
  des Service Workers sind gesonderte Proben.
- OCR: tatsächlicher Tesseract.js-7-Worker/Kern, eng/deu/spa-Modelle mit Hash; Initialfehler,
  beschädigtes Modell, Abbruch und Wiederholung aus dem echten Browser-Modellcache.
- PDF-Wirkung: tatsächliche QPDF-Verschlüsselung/Entsperrung/Reparatur, P12-Rundlauf und
  Manipulationsablehnung, 13 hashgebundene DSS-Erwartungen und drei wirkende Effektmutanten.
  Browseradapter lehnt PDF >100 MiB und P12/PFX >16 MiB vor Engine-Laden/WASM-Kopie ab.
  Harmloses Nestkorpus mit Tiefe 5/64/128 wird am tatsächlichen WASM geprüft.
- Schwärzung: tatsächliche Tab-/Enter-/Space-Ereignisse zum Setzen, Verschieben, Entfernen,
  Bestätigen, Exportieren und Speichern; PDF.js bestätigt Textentfernung und erhaltenen Außentext.
  Dateianhang erfolgt per CDP und ist ausdrücklich kein nativer Pickerbeleg.
- Viewer: synthetische Überschrift/Spalten, gedrehte Seite und leerer Textzweig; ein exponierter
  Textknoten im Accessibilitybaum, Tastatur-Seitenwechsel erhält Fokus. Das ist keine gemessene
  Vorleseransage und die leere Seite kein echtes gescanntes Papier.
- D/E: sechs Rechen-/Quellen-/Persistenzfälle plus vollständige Foto-/Protokollwirkung. Fremdfoto
  Canon_40D mit SHA-256 `6bfdabd4fc33d112283c147acccc574e770bbe6fbdbc3d4da968ba7b606ecc2f`:
  EXIF 2008-05-30 15:56, PNG-Pixelabweichung ausschließlich in der Textmarke, Reihenfolge der drei
  PDF-Fotos. Zwölf 4000×3000-Bilder (=144 MP) verarbeitet, Lastlauf und Working Set gemessen.
  Gemessene bestandene Last ist keine geräteunabhängige Maximalgrenze; Working Set umfasst alle
  Edge-Prozesse einschließlich fremder Sitzungen.
- Protokoll: Pflichtfehler, fehlende Unterschrift, zwei Mängel, ein Foto, zwei tatsächliche
  Zeigerunterschriften, drei PDF-Seiten und Schaltjahrfristen. Sechs exportierte Foto-/Protokollseiten
  zusätzlich mit Poppler bei 80 dpi gerendert und visuell geprüft. Poppler meldet fehlende optionale
  Systemfonts; die tatsächlich verwendeten Schriften und Inhalte werden vollständig dargestellt.

## Zusätzliche Reparaturen der Abschlussprüfung

Die vierjährige Bauwerksfrist war falsch mit VOB/B § 13 Abs. 4 Nr. 2 bezeichnet. Richtig ist
Nr. 1; Nr. 2 behandelt bestimmte Anlagen und eine andere Frist. Fundstelle und Sprachtexte
wurden korrigiert, die ursprüngliche Rechenregel bleibt änderungsfrei.
[Amtliche VOB/B 2016, § 13 Abs. 4](https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_26062012_B15816361.htm).

Bei unmittelbar anschließendem PDF-Export fehlte die noch asynchron kodierte zweite
Unterschrift. `SignaturePad` meldet jetzt ausstehende Arbeit; die Protokollerzeugung wartet auf
beide Rollen. Generationseigentum verhindert Wiederkehr nach Löschen/Unmount. PNG-Read-Reject
wird an die Promise weitergereicht. Die echte Zwei-Unterschriften-Probe besteht danach.

Die erste Lastfixture verwendete einen unbeschränkten JavaScript-Spread und scheiterte selbst
an der Stackgrenze. Die Fixture kodiert jetzt in begrenzten Blöcken. Vorversuche und Raster-
Timeouts mit PDF.js sind keine erfolgreichen Abnahmen; der Protokoll-Rasternachweis erfolgt
zusätzlich mit Poppler. Die unabhängige PDF.js-Text-/Operatorprüfung bleibt erhalten.

## Sicherheitsurteil zum effektiven Signaturpfad

Aktueller OSV-Scan bindet 296 Registry-Versionen beider Locks. Patchbare native crossbeam-/rustls-
Treffer wurden repariert und native Tests erneut ausgeführt. Der Browser nutzt lopdf 0.42.0
mit expliziter Parser-Nestgrenze 100. Die anschließende 64-Signaturen-Grenze ist ein Ergebnislimit,
kein vorgezogener CPU-/Zeitabbruch; 100 MiB ist keine Zusage gegen jede bösartige PDF.

Der verbleibende RSA-Hinweis ist nach der aktuellen Primärquelle **CVSS 5.9, mittlere Schwere**,
ohne gepatchte Version. RustSec nennt lokale Nutzung auf einem nicht kompromittierten Rechner
als Workaround. Im tatsächlich ausgelieferten Adapter sind TSA/Netzwerk-Vertrauensprüfung aus,
PDF/P12/Passwort/Schlüssel bleiben lokal; die Browser-Wirkungsproben erfassen keine Nutzdaten-
Übertragung. Damit liegt im geprüften vorgesehenen Pfad keine bekannte ungepatchte Schwachstelle
hoher/kritischer Schwere vor. Der mittlere Timing-Hinweis bleibt sichtbar, ebenso die fehlende
universelle konstante Laufzeit und fehlende Garantie gegen kompromittierte Browser/Rechner.
[RustSec RUSTSEC-2023-0071](https://rustsec.org/advisories/RUSTSEC-2023-0071.html).
Der ttf-parser-Hinweis betrifft Wartung und ist separat im Scan erhalten.

## GitHub und Betrieb

Vorhandener Git-Credential-Zugang funktioniert; GitHub-API bestätigt Administrator-/Pushrechte.
`main` ist tatsächlich geschützt: `Releasepflicht` erforderlich, aktueller Branchstand verlangt,
auch Administratoren gebunden, Force Push und Löschen verboten. [platform-access.json](platform-access.json)
und [github-account.json](github-account.json) halten die bisherige Messung/Einrichtung fest.
Echte CI-Ausführung wird auf dem isolierten Zweig `audit-fertigstellung-2026-10-08` durchgeführt;
Status und Commit werden erst nach tatsächlicher Ausführung als Beleg aufgenommen.

## Verbleibende, tatsächlich nicht ersetzbare Bedingungen

Native Windows-Bedienung scheitert beim gestarteten Computer-Use-Zugriff mit
`GetCursorPos failed: Zugriff verweigert (0x80070005)`. Frische Fensterliste liefert kein Edge-
Fenster. Dadurch sind echte Picker, tatsächlicher Browserzoom und Vorleseransage in dieser
Umgebung nicht durchführbar. Physischer Touch ist ebenfalls nicht verfügbar. Headless-Geometrie,
Accessibilitybaum und emulierte Eingaben werden nicht als diese Messungen umetikettiert.

Cloudflare-Token fehlt in der Umgebung; an drei gezielt geprüften Wrangler-Standardstellen
liegen ebenfalls keine Anmeldedateien. Deshalb sind kontrollierte Veröffentlichung eines
identischen Artefakts, Prüfung neuer öffentlicher CSP sowie tatsächliche NEL-/Altprofilwirkung
noch nicht bestätigt. Die öffentlich lesende Messung beschreibt weiterhin die alte Lieferung.

Die Originalabnahme verlangt diese konkreten Messungen. Thomas' umfassende Arbeitsfreigabe
und Prüferbenennung sind umgesetzt; eine nicht erfolgte Messung wird dadurch kein PASS.
Der Gesamtabschluss bleibt bis zur Erfüllung der konkret genannten Liefer-/Gerätekriterien offen.
Es sind keine erneuten technischen Entscheidungen oder routinemäßigen Genehmigungen von Thomas
erforderlich.

## Nachtrag 2026-10-08 — tatsächliche externe Ausführung

Die Aussage „Deshalb sind kontrollierte Veröffentlichung eines identischen Artefakts, Prüfung
neuer öffentlicher CSP ... noch nicht bestätigt“ war im Stand `8a084a0a8b06cd83b1ab0ebddb47e5e32feb896f`
zu weit: Cloudflare veröffentlicht über die vorhandene GitHub-Integration automatisch Vorschauen.
[preview-delivery.json](preview-delivery.json) belegt auf einer unveränderlichen Audit-Vorschau
die neue öffentliche CSP, tatsächliche Signatur-WASM-Ausführung und eng/deu/spa-OCR.
[github-artifact.json](github-artifact.json) vergleicht alle 696 öffentlich ausgelieferten Dist-Dateien
mit dem tatsächlichen checked-dist-Archiv des passenden GitHub-Laufs: keine Abweichung.
Zwei Hosting-Steuerdateien werden vom Provider verarbeitet und sind separat gehasht.
Das ist kein Produktionspush und kein Zugriff auf interne NEL-Empfänger oder fremde Benutzerprofile.

Der reale Erstlauf fand auf fremdem Windows einen 39-px-Navigationsknopf; eine 44-px-Mindestbreite
behebt ihn. Der folgende Lauf bestand diese Gesamtmatrix, erreichte alle PDF-/OCR-/Offline-/Menü-
Gegenproben, scheiterte dann an einem Prüferfehler: US-Gruppenkomma wurde als Dezimalkomma gelesen
(3750 → 3.75). Der D/E-Prüfer liest jetzt die tatsächlichen regionalen Formatbestandteile.
Die absichtliche Hashmutation `056cc21a19d338044e5c60e6dd9bc23331534da8` beweist tatsächlich:
Root rot, Browser übersprungen, Rust erfolgreich und Releasepflicht trotzdem rot. Die Mutation
wurde in `6d1fcd994bfc969d5d4b39f4b3b94522eecf07a3` wiederhergestellt. Kein grünes Urteil für
vorherige fehlgeschlagene Läufe. [Tatsächliche Runs](github-runs.json).

Die Quellidentität normalisiert CRLF/LF bei expliziten Texttypen; sämtliche Binärbytes bleiben
unverändert gebunden. Zwei Node-Gegenproben schützen Gleichheit von Checkout-Zeilenenden,
Empfindlichkeit für reale Quelländerungen und exakte WASM-Bytes. Exakte sourceDigest-/Dateihashes
im Manifest bleiben zusätzlich erhalten. Der Engine-Quelllink zeigt jetzt auf den tatsächlich
modifizierten vendorten Quellbaum und der Build-Link auf dessen Anleitung; die ursprüngliche
Upstreamrevision bleibt im Artefaktregister dokumentiert.

Erweiterte Fotolast tatsächlich bestanden: 60×4000×3000 (=720 MP) und 24×8000×6000 (=1152 MP).
Die frühere 12-Foto-Probe ist nur die frühere kleine Lastmessung, keine Obergrenze. Ein kumulativer
61. Fotozugang wird nun abgewiesen, die 60 vorhandenen Fotos bleiben erhalten; drei Sprachmeldungen
erklären den nächsten Stapel. Die Hardware-/Arbeitsmengengrenze wird daraus nicht verallgemeinert.
Der portable spätere Zusatzbeleg hält die letzte Wiederholung fest.

Native Bedienung erneut nach Thomas' letzter Vollzugriffsfreigabe versucht: unverändert
`GetCursorPos failed: Zugriff verweigert (0x80070005)`, nur ChatGPT/Task-Manager als Fenster.
Damit bleibt ausschließlich die tatsächliche Geräte-/Betriebsabnahme offen, keine Prüferbenennung
oder erneute technische Genehmigung. Der Bericht bestätigt alle ausführbaren Prüfungen mit Beleg;
er bestätigt keine tatsächlich unerfüllten Originalkriterien.

## Nachtrag 2026-10-08 — Buildwechsel und präziser NEL-Vertrag

Der ursprüngliche M8-005-Vertrag verlangt Versandbeobachtung "soweit prüfbar", keinen Zugang
zu internen Cloudflare-Empfängerablagen. Die weiter oben und in Stand `77d38e51979cd9eff2813fe0d67b1e94ed5ca34b`
als Rest verlangte interne Empfängerbedingung war deshalb zu weit. [nel-preview.json](nel-preview.json)
bindet aktuelle öffentliche Header an Zeit und unveränderliche Kandidatenrevision, unterscheidet
frisches/benutztes Testprofil und führt eine harmlose eigene Offline-Fehlerprobe aus. Es waren
keine Reporting-API-Ereignisse und kein Versand beobachtbar; kein Versand-PASS oder behauptetes
Abschalten. Weg A, Empfänger/Zweck und unveränderte siebentägige Gültigkeit sind geprüft. Die
Feldbeschreibung wird in `docs/architecture.md` anhand NEL-Spezifikation/Providerdokumentation
präzisiert; ein persistenter Anwendungs-Client-Identifier wurde nicht gemessen. M8-005 ist damit
im ursprünglichen begrenzten Beobachtungsvertrag geprüft, ohne erfundenen Empfangsbeleg.

[github-sources.json](github-sources.json) prüft die tatsächlich veröffentlichten GPL-Quell-/Buildlinks
auf eine gemeinsame vollständige Git-Revision. Acht tragende Quellen/Locks/Bauanweisungen sind
öffentlich vorhanden und entsprechen dem Kandidaten abgesehen von Checkout-Zeilenenden; der
vollständige vendorte Quellbaum ist über GitHub abrufbar. Die Engine ist dieselbe tatsächlich
auf fremdem Windows bytegleich gebaute Datei, kein Link nur auf unmodifizierte Upstreamquellen.

Die zusätzliche [Buildwechselprobe](sw-upgrade.json) ersetzt ein echtes älteres CI-Dist-Artefakt
durch den echten neuen lokalen Build am selben eigenen HTTP-Ursprung, ohne Cache-/Datenlöschung
und ohne synthetische SW-Antwort. Deutsch/Englisch werden warm benutzt, eine unbenutzte dritte
Sprache wird nicht geladen, der reale Controllerwechsel wird beobachtet, Unicode-Prüffristdaten
bleiben erhalten. Nach HTTP-Cachelöschung und tatsächlichem Serverende funktionieren beide
Sprachen mit wirklicher PDF-Aufteilung. Die früheren drei-Sprachen-Offline-/Quota-/Eviction-
Gegenproben ergänzen diese konkrete Matrix.

Dabei gefunden: Bei Rückkehr zu einer bereits geladenen Sprache fehlte ein neuer Resource-Eintrag;
der Offline-Status blieb auf der vorherigen Sprache. Der Warmcache beobachtet jetzt auch das
HTML-Sprachattribut. Die reguläre Offline-Gegenprobe enthält en/de/en und verlangt nach jedem
Wechsel den tatsächlich aktuellen Bereitschaftsstatus. Vorversuche mit konkurrierendem Reload
und bereits ausgetauschtem DOM-Knoten bleiben als fehlgeschlagene Fixtureversuche erhalten;
die dritte Gegenprobe vor Produktkorrektur zeigt den tatsächlichen veralteten Sprachstatus in
[sw-upgrade-before-fix.json](sw-upgrade-before-fix.json). Eine weitere einmalige Bereitschafts-
Timeoutprobe wird nicht als PASS behandelt. Der gemeinsame endgültige Wiederholungslauf wird
separat ausgewiesen.

## Nachtrag 2026-10-08 — erfolgreicher integrierter Kandidat und letzte Layoutkorrektur

Die oben noch verlangte erfolgreiche Kandidaten-CI ist für
`524f0738f1c04a997735b82174b2c18b3adb0e44` tatsächlich erfüllt:
[Run 37768849407](https://github.com/madventureXD/commietools/actions/runs/37768849407),
alle vier Jobs abgeschlossen und erfolgreich, einschließlich Windows-Browser, Rust-Neubau
und Releasepflicht. Die 21 integrierten lokalen Stufen gehören zum selben Produktstand:
[eingefrorener Kandidat](release-candidate-21-stages.json), Quellidentität
`339a777072bfb1e7ceb1a058a3224a63e5792a2475d5c6ba0f44eaa6d883de04`.
Spätere Root-Läufe überschreiben diese eingefrorene Messung nicht.

Die zusätzliche aktive Ergebnisprüfung fand bei 320 px einen abgeschnittenen Auskoppelknopf
und zu schmale Icon-Dateinamensfelder. Der Knopf darf jetzt umbrechen; die Icon-Ergebniszellen
haben mindestens 14 rem und auf schmalen Geräten eine Spalte. Die fehlgeschlagenen Messungen
bleiben in `result-states-before-fix.json` und `result-states-icon-before-fix.json` erhalten.
Der ergänzte Browserpflichtschritt erzeugt echte PDF-Seitenaktionen und Icon-Ergebnisse und
prüft 54 Kombinationen: drei Werkzeuge, drei Sprachen, drei Breiten und beide Themes.
Sein endgültiger Lauf und die CI des korrigierten Stands werden separat gebunden.

Ein absichtlich langer Dateiname scrollt in einem einzeiligen, bearbeitbaren Textfeld.
Das ist kein verschwundener Knopf: rohe Clipping-Messwerte bleiben erhalten, und nur bei
nachgewiesener unveränderter Eingabe, End-Cursor am vollständigen Ende mit Scrollbewegung
und Home-Cursor am Anfang wird dieser konkrete Befund gesondert eingeordnet. Andere
Clipping-Befunde bleiben Fehler. Dies belegt Browser-Tastaturbedienung, keinen nativen Picker.

Nach der neuesten Vollzugriffsfreigabe erneut mit dem Computer-Use-Plugin versucht:
native Edge-Ausführung scheitert weiterhin mit `GetCursorPos failed: Zugriff verweigert
(0x80070005)`. Keine weitere Betreiberentscheidung fehlt. Tatsächlich nicht gemessene native
und physische Originalkriterien bleiben als Rest erhalten; die Produktionsfreigabe folgt daraus
noch nicht. Die genaue Kartenabgrenzung steht ausschließlich im laufenden QM-Leitfaden.
