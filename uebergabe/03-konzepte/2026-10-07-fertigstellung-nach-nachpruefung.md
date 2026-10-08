# Konzept: Fertigstellung nach der unabhängigen Nachprüfung

**Status:** entwurf  
**Datum:** 2026-10-07  
**Verantwortlich:** Codex (Konzept); Umsetzung und Abnahmerollen vorgeschlagen  
**Bezugsrevision:** `556159f58ac3beac3b6349851dae7326558b7fbb`

## Ausgangslage

Die erste Sanierung hat viele Fehler behoben. Die Nachprüfung rechtfertigt dennoch keine neue Veröffentlichung: **33 Befundkerne nachvollzogen (B), 16 Restabnahmen (R), neun erneut zu öffnende Karten (F), eine bekannte offene Restforderung (O)**. Acht Befunde N1–N8 betreffen neun F-Karten, weil N6 zwei Karten betrifft. Damit verbleiben **26 Karten mit konkreter Reparatur-, Abnahme- oder Entscheidungsarbeit**. Die 33 B-Karten behalten ihre begrenzte positive Bewertung; auch sie sind keine pauschale Produktfreigabe.

Grundlage sind die lokalen Originalakten `QM/80-nachpruefung-2026-10-07/{00-bericht,10-befunde,20-kartenmatrix,90-nicht-geprueft,99-offene-fragen}.md`, aktuelle Projektregeln und die unten genannten Codepfade. `QM/` ist ignoriert. Dieses neue Konzept liegt bewusst in der versionierbaren Übergabe; es ersetzt oder verändert keine Originalakte. Die Nachprüfungszahlen 733 Tests, 110 Lint-Warnungen und 62 Werkzeugrouten sind zunächst **Messungen des Autors**; eigene aktuelle Grundläufe werden in der Sitzungsübergabe getrennt dokumentiert.

Eigener Quellabgleich bestätigt die beschriebenen Mechanismen bei CI-Trigger, Rust-Ausnahmen, PDF-Eingangsrennen, Menüselektor, URL-Updater, Sprachprüfung und Sprachcache. Die Browsergegenbelege wurden für dieses Konzept gelesen, nicht unabhängig erneut ausgeführt. Daraus folgt eine belastbare Umsetzungsrichtung, noch keine Abnahme der Reparaturen.

Zwei zusätzliche Planungsfolgen aus dem Quellabgleich:

- **Revisionszuordnung gesondert abnehmen:** OP-036 beschreibt einen inzwischen teilweise überholten Zustand. `scripts/license-audit.mjs`, Funktion `ohneRevision`, neutralisiert Revision und revisionsgebundene Links bereits beim Vergleich. Der historische Fehler „nach jedem Commit rot“ wird deshalb nicht als aktueller Defekt übernommen. Offen bleibt, ob ausgelieferte Links tatsächlich auf den Quellstand der ausgelieferten Binary zeigen. Die Neutralisierung beweist diese Herkunft nicht.
- **OP-Verweise prüfen:** Die Abschlussmatrix nennt beim Desktop-Breitenrest OP-031; die aktuelle Aufgabenliste verwendet OP-031 für Lizenzfragen. Im Abschluss dürfen Belege nicht allein über solche Nummern zugeordnet werden; Kriterium, Dateipfad und Inhalt müssen übereinstimmen. Dies ist eine Dokumentzuordnung, keine weitere Sanierungskarte.

## Ziele

1. Alle acht Gegenbelege beseitigen und ihre Fehlerfälle dauerhaft im tatsächlichen Prüfweg erkennen.
2. Die 16 Restabnahmen und M8-001 gegen ihre ursprünglichen Kriterien schließen; Abweichungen ausschließlich ausdrücklich und datiert entscheiden.
3. Einen nachweislich sperrenden Releaseweg herstellen: geprüfte Revision und geprüfte Artefakte müssen identisch mit der Veröffentlichung sein.
4. Die unabhängige Abschlusskontrolle A2 mit einem vollständigen, reproduzierbaren Belegpaket ermöglichen.

## Nicht-Ziele

Diese Fertigstellungsrunde baut keine zweite PDF-Engine, neue Suiten, allgemeine Übersetzungsautomation oder Desktop-/Mobile-Shells. Die 63 OPs sind keine 63 weiteren Auditkarten. Neue Produktvorhaben bleiben separat; berührte ursprüngliche Abnahmekriterien bleiben verbindlich. Die Runde beansprucht weder kryptografische Zertifizierung noch vollständige WCAG-Konformität allein aufgrund automatischer Scans.

## Vorschlag

### Arbeitsmodell und Verantwortlichkeiten

Vorgeschlagen: **Faber/Entwicklung** repariert und liefert Belege; **Thomas/Betreiber** entscheidet Lizenz-/Risikoausnahmen und führt Kontoeinstellungen/Freigabe aus; ein **unabhängiger Prüfer** übernimmt Gegenprüfung und A2. Eine benannte Person mit Zielgeräten übernimmt Vorleser-, Touch- und native Speicherdialogabnahmen. Rollen sind noch keine Beauftragung oder Terminbestätigung.

Ein einziger Abschlussdatensatz führt pro Karte: Originalkriterium und Quelle, ursprüngliches B/R/F/O-Urteil, zuständige Rolle, Milestone, Revision, Artefakt-/Fixture-Hashes, Sollwert, Istwert, ausgeführter Befehl bzw. Handprotokoll, Ergebnis und verbleibende Grenze. Implementiert, getestet, unabhängig abgenommen und Betreiberentscheidung werden getrennt erfasst. Fehlende Voraussetzung oder ausgelassener Test darf kein PASS erzeugen.

Neue Belege werden unter versionierten `scripts/` und `test-assets/` gepflegt. Laufartefakte kommen in eine eindeutig revisionsgebundene Belegablage. Die Originalnachprüfung wird bei der Umsetzung selektiv mit Index und Prüfsummen archiviert oder ausdrücklich in die Übergabe übernommen; `QM/` wird dafür nicht pauschal entignoriert. Benutzerdateien, echte Schlüssel und Passwörter gehören nicht in die Belege.

### Milestones und Reihenfolge

Aufwände sind **Planungsannahmen in Personentagen**, keine zugesagten Kalendertermine. Ein Personentag bezeichnet ungefähr einen Arbeitstag konzentrierter Bearbeitung einschließlich eigener Prüfung. Zusätzliche Fehler aus Geräte-/Sicherheitsabnahmen können Nacharbeit auslösen.

| Milestone | Ergebnis | Aufwand | Voraussetzung | Abnahmeverantwortung |
|---|---|---:|---|---|
| MS0 | Verbindlicher Umfang und Belegbasis | 0,5–1 | Konzept als Arbeitsgrundlage | Entwicklung + Betreiber |
| MS1 | Lizenzentscheidungen und Liefernachweis belastbar | 2–4 | MS0 | Betreiber + unabhängiger Prüfer |
| MS2 | Dateiauswahl und URL-Lebenszyklen korrekt | 1–2 | MS0 | Entwicklung + Gegenprüfung |
| MS3 | Sprach- und Menüprüfungen erkennen Gegenbelege | 1–2 | MS0 | Entwicklung + Gegenprüfung |
| MS4 | Genutzte Werkzeuge und OCR offline/CSP abgenommen | 3–5 | MS2; MS3 für neue Texte | Entwicklung + Browser-/Geräteprüfung |
| MS5 | PDF-Wirkung und regulärer Releaseweg sperren | 3–5 | MS1–MS4 | Entwicklung + Betreiber |
| MS6 | Alle restlichen Geräte-, Liefer- und Umfangsabnahmen | 3–5 | MS2–MS5 | Zielgeräteprüfung + unabhängiger Prüfer |
| MS7 | A2 und kontrollierte Veröffentlichung | 1–2 | MS1–MS6 | unabhängiger Prüfer + Betreiber |

**Gesamt: 14,5–26 Personentage**, zuzüglich Verfügbarkeit der Geräte, Kontozugänge und externen Prüfer. Bei einem Entwickler entspricht das grob drei bis sechs Arbeitswochen einschließlich eines kleinen Nacharbeitsfensters; eine feste Datierung ist ohne diese Verfügbarkeiten nicht belastbar. Bei gesondert beauftragter paralleler Bearbeitung können MS1–MS3 und Teile der Vorbereitung von MS6 gleichzeitig laufen. Die Schlussabnahmen bleiben abhängig vom integrierten Stand.

**Kritischer Pfad:** MS0 → MS1/MS4 → MS5 → MS6 → MS7. Workflow-Syntax und Pinning aus MS5 werden bereits unmittelbar nach MS0 lokal vorbereitet; die vollständige Releaseabnahme folgt erst nach Integration der Wirkungstests.

### MS0 — Umfang und Abnahmebasis festhalten

- Die neun F-Karten sichtbar erneut öffnen; R/O als unerledigte Abnahmen führen. Historische Häkchen durch datierte Nachträge berichtigen, alten Wortlaut erhalten.
- Alle 59 IDs übernehmen und die 26 offenen Karten gegen die Tabelle unten prüfen. Die 33 B-Karten nur bei Änderungen am betroffenen Vertrag gezielt nachprüfen, zusätzlich den gesamten regulären Check/Build fahren.
- Originalkriterien der D/E-Funktionen und vorhandenen Freigabeauflagen zusammentragen. Bestehende Ausnahmeentscheidungen übernehmen; fehlende Kriterien als offen führen, statt rückwirkend Erfolg zu erfinden.
- Rollen, Zielgeräte und Prüfzugang reservieren. Für Produktionsheader einen gesonderten Auslieferungsprüfschritt vorsehen.

**Exit:** 59 eindeutige IDs, 26 offene Zuordnungen, keine fehlende Karten-/Kriteriumsquelle; jedes externe Kriterium hat eine zuständige Rolle und einen vorgesehenen Termin. Keine Statusänderung auf „abgenommen“ allein aufgrund dieses Konzepts.

### MS1 — N2 und Rust-Lieferkette schließen

**Betroffen:** M9-002 sowie M9-001/M9-003/M9-004; `scripts/license-audit.mjs`, `licenses/rust-review.json`, Rust-Locks, Generator und ausgelieferte Hinweise.

Die Lizenzprüfung bekommt ein validiertes Entscheidungsmodell mit `pending`, `approved`, `rejected`. Eine Genehmigung bindet Paketname, Version, Quelle/Commit bzw. Registry-Prüfsumme, den geprüften Lizenzausdruck, Entscheidungsträger, Datum, Begründung und Entscheidungstyp. Lizenzzulässigkeit und fehlender Originalhinweis sind **verschiedene Entscheidungen**; eine Lizenzgenehmigung behebt keinen fehlenden Hinweis. Ein `pending`-Eintrag zählt als offen. Eine ausdrücklich genehmigte vorübergehende Ausnahme braucht eigenen Umfang, Grund, Wiedervorlage und Beleg.

SPDX-Ausdrücke vollständig parsen und konsumieren. Informelle Angaben wie `MIT/Apache-2.0` nur durch belegte Normalisierung behandeln. Äquivalente Ausdrücke dürfen kanonisch verglichen werden; semantisch andere Ausdrücke derselben Paketversion dürfen niemals eine alte Ausnahme erben. Fehlende Felder, widersprüchliche Doppeleinträge oder unbekannter Status sperren.

Die sieben `needsDecision: true`-Einträge einzeln bearbeiten: `alloc-stdlib`, `zlib-rs`, `unicode-ident`, `asn1-rs-impl`, `cms`, `defmt-parser`, `p12-keystore`. Die vorhandene enge `pdf_signer`-Entscheidung wird in das Modell übernommen, ihr Umfang bleibt eng. Hinweisdateien aus belegten Paket-/Upstreamständen übernehmen und aus dem tatsächlichen Graphen ausliefern; die öffentlich ausgelieferte Hinweisablage auf fehlende, leere und verwaiste Dateien prüfen.

Rust und wasm-bindgen mit konkreten Werkzeugversionen, Ziel und beiden Locks neu bauen. `--locked` verwenden; Quelle einschließlich lokaler Patches, Featuregraph, Compiler/CLI-Version und Artefakthashes dokumentieren. Ein frischer zweiter Bau prüft Byteidentität. Falls sie nicht erreicht wird, Differenz lokalisieren und die Reproduzierbarkeitsforderung offen halten oder ausdrücklich entscheiden; ein semantisch erfolgreicher Lauf allein ersetzt sie nicht. Der frisch gebaute Browser-WASM-Stand muss die Wirkungstests aus MS5 bestehen.

Aktuellen Advisoryscan für beide Locks und tatsächlich verwendete Ziel-/Featuregraphen wiederholen. lopdf 0.42.0 liegt im Fixbereich von [RUSTSEC-2026-0187](https://rustsec.org/advisories/RUSTSEC-2026-0187.html); zusätzlich tief verschachtelte und weitere Grenzdateien mit externem Zeitlimit testen. Das ungepatchte [rsa/Marvin-Risiko](https://rustsec.org/advisories/RUSTSEC-2023-0071.html) erfordert eine Bewertung der erreichbaren Operationen und Timing-Beobachtbarkeit im Browser. Aus „lokal“ folgt keine pauschale Entwarnung. Unmaintained-Warnung, nicht erreichbare optionale Abhängigkeit und erreichbare Schwachstelle getrennt bewerten; Ausnahme mit Geltungsbereich und Wiedervorlage dokumentieren.

**Exit:** Beide N2-Mutanten scheitern im regulären Gate; die gültige enge Genehmigung besteht. Alle sieben offenen Einträge sind entschieden oder sperren weiterhin. Hinweisbestand und Source→Lock→Build→Binary sind belegt; Quelllinks werden zusätzlich gegen den tatsächlichen Lieferstand geprüft. Verbleibende Sicherheitsrisiken sind A2 vorgelegt.

### MS2 — N3/N5: asynchrone Aufträge und Blob-Adressen

**Betroffen:** M4-005/M4-009; `PdfSplit.tsx`, `resultUrl.ts` und deren Nutzer.

Ein Auftragstoken schützt **Lesen, Inspektion, Erfolg, Fehler und Abschluss**. Datei, Eingabefeld und Auftrag werden vor dem ersten Await erfasst; nach jedem relevanten Await darf nur der aktuelle, noch montierte Auftrag Zustand schreiben. Neue Auswahl zeigt unmittelbar den Ladezustand, entwertet alte Ausgaben und sperrt Aktionen auf dem alten Dokument. Nicht abbrechbare Arbeit wird verworfen; Abbruch allein ersetzt keine Generationprüfung. Reset und Unmount entwerten den Auftrag ebenfalls.

Für die Einzel-URL wird ein klarer Eigentümer festgelegt. Erzeugung und Widerruf liegen außerhalb funktionaler State-Updater; State bildet nur die sichtbare Adresse ab. Ref/Effekt-Cleanup müssen auch Ersetzung vor einem Commit, mehrere Setzungen im selben Tick, Reset, StrictMode und späte Async-Antworten korrekt behandeln. Mehrfachausgaben behalten ihren eigenen Listenvertrag.

Nahe Dateilesepfade anhand `arrayBuffer`, `inspectPdf` und Auftrags-Refs inventarisieren, insbesondere OCR und andere PDF-Werkzeuge. Gemeinsam reparieren nur nach Prüfung ihres jeweiligen Vertrags. Bei OCR ist ein ähnlicher ungeschützter Auswahlpfad im Quelltext sichtbar; er ist eine Prüfspur, noch kein separat reproduzierter Befund.

**Exit:** Deterministische A/B-Tests halten B nach spätem A-Erfolg und spätem A-Fehler; Unmount/Reset/neuer Auftrag werden geprüft. Bestehender laufender Split und großer Mehrfachausgabe-Cleanup bleiben korrekt. Bei Production und Development/StrictMode ist nach Unmount die Menge `erzeugte URLs minus widerrufene URLs` leer. Aufrufzahlen allein gelten nicht als Nachweis. React verlangt reine Updater und kann diese im StrictMode doppelt ausführen ([useState](https://react.dev/reference/react/useState)).

### MS3 — N4/N8: Prüfungen müssen ihren Vertrag prüfen

**Betroffen:** M2-009/M3-009; Menüscanner, `ToolNavigation.tsx`, Sprachloader und Sprachtests.

Der Menütest bedient den echten Öffner, vorzugsweise über zugängliche Rolle/Name und den zugehörigen Dialog. Vor Messung assertiert er `dialog.open`, modalen Zustand, Fokus im Dialog und unveränderte Route. Messung auf den Dialog beschränken. Kategorien öffnen, Suche/Treffer/Leerergebnis/Ladefehler prüfen; Schließen über interne Taste und Escape, Browser-Zurück und Fokus-Rückkehr getrennt behandeln. Auf Zustände warten, keine feste Pause als Erfolgsbeweis. Ein fehlender/unerreichbarer Öffner oder geschlossen gebliebener Dialog macht den Test rot.

Ein gemeinsamer Sprachvalidator erfasst Werkzeugtexte, gemeinsame Werkzeugtexte, UI- und Suitenpakete: Schlüsselparität **in beiden Richtungen**, keine leeren Werte, Unicode-Wohlgeformtheit, vereinbarte NFC-Form, Steuerzeichen, gültige Interpolationssyntax und Platzhalter-Multimengen. Gleiche Klammerzahlen genügen nicht; erlaubte wörtliche Klammern benötigen einen festgelegten Vertrag. Fallbacks dürfen fehlende Originaleinträge nicht verdecken. Dynamische Schlüssel aus Registry und deklarierte Sprachlisten einschließen.

**Exit:** Beide Themes und alle aktuellen Werkzeugrouten bestehen mit tatsächlich geöffnetem Menü. Öffner-Mutant scheitert. UI-Surrogat, fehlender Schlüssel, zusätzlicher Schlüssel und geänderter Platzhalter scheitern über den **gesamten unveränderten Root-Prüfweg**. Die Mutationseinrichtung bestätigt jeweils, dass der defekte Wert tatsächlich eingespeist wurde; ein normaler PASS wird nicht als Mutationsnachweis ausgegeben.

### MS4 — N6/M8-001: Offlinebereitschaft und OCR/CSP

**Betroffen:** M4-004/M8-002/M8-001; Warmcache, SW-Konfiguration, Fehlergrenze und OCR.

**Empfohlener Vertrag:** Offlinebereitschaft gilt pro Build, Werkzeug, UI-Sprache und optional aktivierter Funktion erst nach bestätigter Sicherung ihrer Abhängigkeiten. Genutzte PDFs bleiben lokal; in den Ressourcencache gehören ausschließlich öffentliche Programm-/Modellressourcen. Ein großer globaler Engine-Precache würde die bestehende Datensparsamkeitsregel verletzen.

Eine beim Build erzeugte Assetzuordnung liefert die notwendigen statischen Abhängigkeiten eines geöffneten Tools. Bereits tatsächlich aktivierte dynamische Engines/Worker werden ergänzt. OCR-Modellsprachen sind von der UI-Sprache getrennt und werden erst nach Einwilligung/Nutzung berücksichtigt. Die Zuordnung enthält keine Pflicht, jede optionale Engine eines Tools vorzuladen. Performance-Einträge helfen bei Diagnose, sind wegen fehlender Einträge, Puffergrenzen und Workerressourcen allein keine vollständige Abhängigkeitsquelle.

Nach SW-Kontrolle werden benötigte Ressourcen gezielt gesichert. Ein erweitertes GenerateSW-Verfahren reicht, wenn Abschluss und Vollständigkeit zuverlässig bestätigt werden können. Andernfalls gezielt auf einen eigenen Worker mit Workbox/InjectManifest wechseln: Build-ID und validierte Ressourcenliste per Nachricht, Sicherung über dieselbe Strategie, Abschlussbestätigung erst nach den Cache-Schreib-Promises und Bestandsprüfung. Workbox unterscheidet bei `handleAll` Antwort und abgeschlossenes Hintergrund-Caching ([Strategien](https://developer.chrome.com/docs/workbox/modules/workbox-strategies)). Neue Werkzeugnutzung, Sprachwechsel und `controllerchange` aktualisieren die Bereitschaft; ein abgelaufenes anfängliches Wartefenster darf sie nicht dauerhaft verhindern.

Cachebereinigung berücksichtigt aktive alte Clients: einen noch benötigten Build nicht mitten in einer Sitzung entfernen. Bereitschaft bei Quota, Cacheverlust oder SW-Wechsel zurücknehmen und neu prüfen. Ein Browser kann Daten später entfernen; die Anzeige bestätigt den gemessenen Zustand, keine dauerhafte Speicherzusage. `ignoreVary` aus der vorhandenen Sprachlösung nicht ungeprüft auf fremde Ressourcen übertragen.

Ladefehler erhalten die Zustände fehlende Offline-Ressource, nachgewiesener Buildwechsel und unklare Ursache. „Failed to fetch“ und `navigator.onLine` reichen nicht für „veraltet“. Einen Buildwechsel nur anhand unabhängig abrufbarer Versionsinformation feststellen; offline fehlt diese Evidenz. Die neutrale Meldung bietet einen begrenzten sinnvollen Wiederholungsweg, ohne Daten durch unkontrollierten Reload zu verlieren.

OCR bekommt Tests für erstmaliges Laden nach Zustimmung, Native-Text ohne unnötige Modelldownloads, beschädigtes Modell, kontrollierte Erholung/Retry, Abbruch, Dateiwechsel und Unmount. Offline-Wiederholung muss Core, Worker, benötigtes Modell und Renderingabhängigkeiten abdecken. Falls Fremdressourcen nicht zuverlässig cachebar sind, begrenzte Selbsthostung genau der benötigten versionierten Ressourcen prüfen, einschließlich Lizenz und Größenwirkung. CSP dafür nicht pauschal lockern.

**Exit:** Verzögerter erster SW-Start aus N6 besteht mit leerem HTTP-Cache, erhaltenem CacheStorage und tatsächlich abgeschaltetem eigenem Server; das PDF-Werkzeug führt eine neue lokale Operation aus. Warmstart, UI-/OCR-Sprachwechsel, Buildwechsel, fehlendes Chunk/Modell, Quota und Fremdhostausfall sind getrennt geprüft. Fehlerursachen stimmen. OCR funktioniert unter der vorgesehenen CSP; tatsächliche Cloudflare-Header werden in MS7 geprüft. Ein Vite-Preview liefert allein keinen Nachweis der Pages-Header ([Cloudflare Headers](https://developers.cloudflare.com/pages/configuration/headers/)).

### MS5 — N1/N7: Wirkungstests und tatsächlicher Releaseweg

**Betroffen:** M1-003/M5-003 und Nachweise für M2-004/M9-004.

1. `workflow_dispatch` unter `on` einordnen und Workflow mit festgelegter Version von [actionlint](https://github.com/rhysd/actionlint) lokal sowie in CI prüfen. Jede externe Action auf verifizierten vollständigen Commit-SHA binden; Werkzeugketten ebenfalls festlegen. `cargo check` ist kein WASM-Neubau; Rust-Test, wasm32-Bau, wasm-bindgen und Browserwirkung bilden getrennte Schichten.
2. `scripts/m7-eu-dss-audit.mjs` zum erwartungsprüfenden Gate erweitern. Manifest mit vollständiger Fixtureliste, Hash, Herkunft/Lizenz, separat begründeten Sollurteilen für CMS-Integrität, Dokumentabdeckung, Änderung, Mehrfachsignaturen, Zeitstempel und unsupported-Fälle. Fehlende Fixtures/Engine oder leerer Korpus scheitern. Sollwerte aus Upstreamtests und unabhängigem Prüfer ableiten, niemals aus der aktuellen Engineausgabe allein.
3. Signieren mit synthetischem Test-P12/PFX und Verifizieren im echten Browser-WASM unter CSP. Selbst signierte/abgelaufene Testzertifikate, falsches PFX-Passwort, Manipulation, inkrementelle Mehrfachsignaturen, beschädigtes CMS und unsupported-Algorithmen abdecken. Zertifikatszeitpunkte ausdrücklich festlegen; zeitabhängige Vertrauensurteile nicht zufällig vom Tagesdatum abhängen lassen. Offline-Integrität und qualifiziertes/vertrauenswürdiges Gesamturteil bleiben getrennt ([DSS-Dokumentation](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/doc/dss-documentation.html)).
4. QPDF schützen/entsperren/reparieren wirklich ausführen. Korrektes/falsches Passwort, Verschlüsselungsstatus, unabhängiges erneutes Lesen sowie Seiten/Text/Rendering prüfen. Schutz verändert Bytes; sinnvoller Inhaltserhalt ersetzt ungeeignete Bytegleichheit. Noop-Unlock muss scheitern. Externe CLI-Prüfung ergänzt Browserwirkung; QPDF-Prüfoptionen haben besondere Exitcodes, insbesondere `--is-encrypted` ([QPDF CLI](https://qpdf.readthedocs.io/en/stable/cli.html)).
5. Reguläre Pflichtjobs vorsehen: bestehender Check/Build, Workflowvalidierung, Rust-Neubau/Advisories, PDF-Wirkung/Signaturen unter CSP, Offline, UI/Barrierefreiheit und Gegenproben. Namen und Kommandos neu festlegen; die hier beschriebenen zusätzlichen Befehle existieren noch nicht. Zusammenfassender `release-ready`-Job mit `needs` und `if: always()` akzeptiert nur tatsächlich erfolgreiche Pflichtjobs und vollständige erwartete Belegdateien; skipped/cancelled/neutral/fehlend sperren. GitHub behandelt übersprungene Jobs sonst teils als Erfolg ([Statuschecks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)).

**Empfohlene Infrastruktur:** Bestehendes Pages-Projekt behalten, automatisches Produktionsdeployment abschalten und das geprüfte Artefakt erst über einen nachgeordneten autorisierten Deployschritt mit Wrangler veröffentlichen. Das geht auch bei bestehender Gitintegration; ein Projektneubau ist dafür nicht nötig ([Cloudflare Gitintegration](https://developers.cloudflare.com/pages/configuration/git-integration/)). Artefaktmanifest bindet Quellrevision, Locks, Toolchain, WASM und Dist-Prüfsummen. Browserjobs prüfen dasselbe Dist; anschließend kein unkontrollierter zweiter Produktionsbau. Falls Upload/Gateway Bytes verändert, Veränderung dokumentieren und Header/Dateien danach nachprüfen.

**Inbetriebnahme ohne Umgehen der Push-Regel:** Lokale Reparaturen und erste unabhängige technische Kontrolle zuerst. Die aktuelle Entscheidung „Push erst nach unabhängiger Kontrolle“ bleibt wirksam. Falls ein isolierter CI-Testbranch vor der endgültigen A2 benötigt wird, muss Thomas dafür ausdrücklich eine datierte Ausnahme beschließen und zuvor automatische Produktion sowie ungewollte Previews deaktivieren. Ohne diese Ausnahme erst nach entsprechender unabhängiger Kontrolle pushen, dann echte CI-/Kontobelege erheben; bis dahin bleibt die finale Freigabe offen. `workflow_dispatch` allein ersetzt keinen regulären PR-/Push-Check; die offizielle Syntax setzt außerdem eine Workflowdatei im Defaultbranch voraus ([Workflowsyntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatch)). Ein PR-Lauf kann den neuen Workflow vor dem Merge prüfen.

**Exit:** Echte GitHub-Läufe mit Run-URL und SHA; erforderliche Checks und Direktpushschutz im Konto belegt. Absichtlich rote Probe verhindert Merge/Deployment, fehlgeschlagener Engine-Setup- oder Fixturelauf verhindert Freigabe. Synthetische Noop-/falsch-positive Mutanten werden zuverlässig rot. Ohne Kontoabnahme ist MS5 nur lokal vorbereitet.

### MS6 — Die verbleibenden R-Abnahmen durchführen

**UI:** Alle 62 Werkzeuggrundzustände erneut prüfen, dazu `/`, Katalog/Suche, Suiten, `/licenses` und tatsächlich vorhandene Rechtsseiten. Die lange Lizenzroute erhält eine verlässliche Bereitschaftsbedingung; Timeout oder Trunkierung darf nicht als leerer Produktinhalt fehlgedeutet werden. Ergebnis-/Fehler-/Lade-/Menüzustände mit Fixtures systematisch auslösen, Theme und alle unterstützten Sprachen für gemeinsame Komponenten abdecken. Ein Zustandsmanifest weist geprüft/fehlend/nicht zutreffend pro Tool aus; nicht blind jeden Zustand mit jeder Gerätekombination multiplizieren.

**Handarbeit:** NVDA oder Narrator auf mindestens zwei repräsentativen Werkzeugen einschließlich PDF-Textansicht und Dateispeichern; Menü/Kategorien mit Tab, Shift-Tab, summary, Escape und Zurück. Fokus bleibt während des modalen Dialogs darin und kehrt sinnvoll zurück ([W3C Dialogmuster](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)). Echten Browserzoom 200/400 %, Textabstand und Reduced Motion prüfen; 320 CSS-px dient als Reflowmaßstab, geometrische Emulation ersetzt den Browserzoom nicht ([W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)). Die projektspezifischen 44-px-Ziele bleiben eigene Vorgabe.

Schwärzungsrechtecke auf realem Touchgerät und bei abweichendem Zoom/Rotation prüfen; exportiertes Resultat und Koordinaten vergleichen. PDF-Textansicht mit mehrspaltigem/komplexem Dokument und Vorleser prüfen. Bleibt die Lesereihenfolge begrenzt, ist gegen das Originalkriterium zu entscheiden, ob ein sichtbarer Hinweis genügt oder Implementierung nachgezogen werden muss.

**Speichern:** echten Browserdownload abfangen, Datei auf Platte lesen und Bytes/MIME/Name gegen Quelle vergleichen. Native Picker auf unterstützten Zielgeräten prüfen, zusätzlich Fallback, Abbruch und Schreibfehler. Ein Browserdownload belegt den Fallback, nicht automatisch den nativen Picker.

**Lieferung/Umfang:** Frischen Checkout mit festgelegter Toolchain ohne `work/`/QM-Hilfen ausführen. Tragende historische Belege übernehmen, weitere OP-063-Skripte nach ihrem ursprünglichen Kriterium auswählen. Neue D/E-Routen und Funktionen gegen beauftragten Umfang prüfen; notwendige Fachabnahmen für Elektro-/SHK-Funktionen reservieren. Nicht umgesetzte Konzepte werden ausdrücklich als Restvorhaben geführt, nicht automatisch in diese Sanierung eingebaut. OP-062 braucht eine datierte Betreiberentscheidung zur historischen Strukturmigration. Statuslisten und Abschlussmatrix bekommen belegte Nachträge einschließlich überholter OP-Verweise.

**Exit:** Für jede R-Karte ist das ursprüngliche Restkriterium erfüllt oder die zulässige Abweichung explizit entschieden. Fehlende Geräte, Reader oder Fachprüfer bleiben offene Abnahmen. Portabilität wird am frischen Checkout belegt.

### MS7 — A2, Auslieferung und Abschluss

Releasekandidat mit Revision und unveränderlichen Artefakthashes einfrieren. Unabhängiger Prüfer kontrolliert N1–N8, die zugehörigen Gegenproben, sämtliche Abschlussbelege der 26 offenen Karten und den integrierten Gesamtstand; A2 umfasst weiterhin den ursprünglichen Gesamtauftrag. Findings zurück an den zuständigen Milestone geben; Änderungen nach Review machen eine gezielte erneute Prüfung und neue Artefaktbindung erforderlich.

Die finale Betreiberfreigabe bezieht sich auf dieses konkrete Belegpaket. GitHub-/Cloudflare-Einstellungen, tatsächliche Header und NEL müssen real überprüft sein. Die bestehende NEL-Entscheidung **Weg A** bleibt erhalten: Header frischer und vorhandener Profile, Report-Endpunkte und kontrollierte Fehlerzustellung mit synthetischen URLs prüfen; keine privaten Inhalte in Reports erzeugen. Ein Clientlog kann eine Versandbeobachtung, keine vollständige Einsicht beim Empfänger beweisen. Der geprüfte Headerstand muss dem tatsächlichen öffentlichen Stand entsprechen.

Vorgesehene Reihenfolge: lokale Prüfung → unabhängige technische Kontrolle → autorisierte CI-Inbetriebnahme → geschützte Preview mit Lieferheaderprüfung → abschließende A2 über Code, Artefakte und Betriebsbelege → Betreiberfreigabe → Deployment desselben Artefakts → öffentlicher Smoke-/Header-/Offlinecheck. Preview ist ebenfalls eine Veröffentlichung und bedarf in der Umsetzung der entsprechenden Autorisierung. Wenn Preview- und Produktionsheader verschieden sind, bleibt die öffentliche Kontrolle ein eigener Abschlussrest.

Rückfallplan vorab festhalten: vorheriges geprüf­tes Dist und dessen SW-/Cachevertrag verfügbar halten; kein pauschales Cachelöschen. Bei fehlgeschlagener öffentlicher Wirkung Veröffentlichung anhalten/zurücksetzen, Zustand und betroffene Benutzerprofile prüfen und Belege erhalten.

**Exit:** Positives A2-Protokoll und Betreiberfreigabe für den konkreten Stand, echte sperrende Checks, Deployment-ID/URL, öffentliche Header- und Wirkungsmessung, abgeschlossene Karten-/Abweichungsmatrix und Übergabe. A2 allein schließt keine noch fehlende Betriebs-/Geräteabnahme.

### Vollständige Zuordnung der 26 offenen Karten

| Karte | Urteil der Nachprüfung | Bearbeitung | Abschließender Nachweis |
|---|---|---|---|
| M9-002 | F / N2 | MS1 | Entscheidungen und Lizenzmutanten im regulären Gate |
| M1-003 | F / N1 | MS5 | Syntax, SHAs, echte CI, erforderliche Checks, Deploysperre |
| M4-005 | F / N3 | MS2 | A/B-Erfolg/Fehler, Unmount/Reset, Verarbeitung |
| M2-009 | F / N4 | MS3 → MS6 | echter modaler Menüzustand, Negativprobe, kompletter UI-Lauf |
| M4-009 | F / N5 | MS2 | identitätsbasierter URL-Cleanup einschließlich StrictMode |
| M4-004 | F / N6 | MS4 | wahre Fehlerursache, begrenzte Erholung |
| M8-002 | F / N6 | MS4 | erster/warm­er Offlinebesuch, Locale/SW/Quota |
| M5-003 | F / N7 | MS5 | QPDF-/Signaturwirkung mit Sollurteilen als Pflichtjobs |
| M3-009 | F / N8 | MS3 | einheitlicher Sprachvertrag, Root-Gate-Mutanten |
| M8-001 | O | MS4 → MS7 | OCR-Modellfehler/Offline/CSP und tatsächliche Lieferheader |
| M9-001 | R | MS1 | vollständige Hinweise/Entscheidungen, unabhängiger Lieferbau |
| M9-003 | R | MS1 → MS7 | Quelle/Lock/Build/Binary/öffentliche Links eindeutig gebunden |
| M9-004 | R | MS1 → MS5 | eigener Rust/WASM-Bau, Parsergrenzen, aktuelle Risikoentscheidung |
| M5-002 | R | MS6 | Plattendownload und native Zielgeräte-Picker |
| M2-006 | R | MS6 | reale Vorleseransagen, Namen in unterstützten Sprachen |
| M2-007 | R | MS3 → MS6 | Bedienziele/Abschneiden in Menü/Ergebnis/Fehler |
| M7-002 | R | MS3 → MS6 | vollständiger Tastatur-/Fokus-/Zurück-Durchlauf |
| M7-003 | R | MS6 | Touch, Zoom/Rotation und exportierte Schwärzungskoordinaten |
| M7-004 | R | MS6 | Vorleser/komplexe Lesereihenfolge, Kriteriumsentscheidung |
| M7-005 | R | MS6 | schmale Zustände, echter Zoom, Auskoppelfenster |
| M2-001 | R | MS7 | positive unabhängige A2, aktuelle Auflagen-/Freigabebindung |
| M2-004 | R | MS5 | beide QPDF-Pfade mit Browser-CSP-Wirkung |
| M10-003 | R | MS6 | ausdrückliche OP-062-Entscheidung, abrufbare alte Fassung |
| M10-004 | R | MS6 | frischer Checkout/Zweitrechner, tragende Belege ohne lokale Hilfen |
| M10-005 | R | MS6 | ursprüngliche Kriterien und D/E-Funktionen inhaltlich abgenommen |
| M8-005 | R | MS7 | aktuelle Header/Altprofile/NEL-Beobachtung gemäß Weg A |

## Alternativen

**Nur acht punktuelle Fixes:** geringer Anfangsaufwand, lässt die 16 R-Karten und M8-001 offen. Reicht nicht zur Fertigstellung.

**Kompletter Neuaufbau der Testlandschaft:** vermeidet Teile der vorhandenen Windows-Abhängigkeit, kostet erheblich und gefährdet den vorhandenen Belegvertrag. Empfohlen ist zunächst die Reparatur des bestehenden Scanners; für neue Zustands-/Download-/Offlinefälle ist Playwright ein möglicher kleiner, versionierter Zusatz. Einführung erst mit Lizenz-/Abhängigkeitsprüfung. Seine dokumentierten SW-Steuerungsmöglichkeiten beziehen sich auf Chromium; Firefox/WebKit bzw. native Geräte benötigen passende ergänzende Prüfungen ([Playwright SW](https://playwright.dev/docs/service-workers)).

**Alles precachen:** einfacher Offlineerfolg, unnötige Engine-/Sprachdownloads und Quota-Belastung. Empfohlen ist gezielte, bestätigte Sicherung genutzter Abhängigkeiten.

**Cloudflare-Gitdeployment beibehalten:** möglich bei tatsächlich erzwungenem Branchschutz und vollständigem Pflichtcheck vor jedem Produktionspush. Schwächer hinsichtlich identischem geprüften Artefakt und Erstinbetriebnahme; bei Wahl dieses Wegs muss der Cloudflare-Bau seinen vollständigen Prüfweg selbst erzwingen und seine Binary-Zuordnung liefern. Ein paralleler Prüfworkflow nach dem Push genügt nicht.

## Auswirkungen

- **Local First / Datenschutz:** synthetische Fixtures, öffentliche Programmressourcen im Cache; Netzwerkbelege unterscheiden Engine-/Modelldownloads und NEL von Nutzdaten. Keine echten PFX/Passwörter an Dienste.
- **Offline First:** konkrete messbare Bereitschaft je genutztem Funktionsumfang; Buildwechsel und Quota werden sichtbar behandelt.
- **UI / Barrierefreiheit:** wahrheitsgemäße Ladefehler, neue Auswahl sofort als ladend; reale Dialog-/Gerätezustände werden Teil der Abnahme.
- **Internationalisierung:** neue Zustands-/Fehlertexte in de/en/es und gemeinsamer Validator über alle Textklassen.
- **Modularität / Suiten:** Lazygrenzen bleiben erhalten; Auftrags- und URL-Helfer nur bei gleichem Vertrag teilen.
- **Abhängigkeiten / Lizenzen:** Werkzeugversionen/SHAs und Lizenzentscheidungen belegen; keine pauschale Erweiterung der Lizenzpolitik.
- **Tests / Migration:** bestehende Positivtests behalten; echte Gegenbelege versionieren. Beschädigte Mutanten laufen isoliert und dürfen keine Produktionsdateien oder globale Datenbestände zurücklassen.

## Offene Fragen

- [ ] Wer übernimmt unabhängige A2 und reale Geräte-/Fachabnahmen, und wann sind sie verfügbar?
- [ ] Welche Entscheidung trifft Thomas zu jedem der sieben Rust-Einträge und den verbleibenden erreichbaren Advisoryrisiken?
- [ ] Wird der empfohlene Artefaktdeployweg gewählt? Falls ein früher isolierter CI-Push notwendig ist: ausdrückliche datierte Ausnahme zur bisherigen Push-Regel festhalten.
- [ ] Welche ursprünglich nicht vollständig spezifizierten D/E-Kriterien werden für die Abnahme schriftlich präzisiert, welche Restvorhaben bleiben ausdrücklich separat?
- [ ] Welche konkrete OP-062-Ausnahme-/Archivregel und welche zusätzlich tragenden OP-063-Belege werden beschlossen?

Diese Entscheidungen sind Umsetzungsabhängigkeiten. Das Konzept erfordert jetzt weder Kontoänderung noch Push; seine Erstellung hängt nicht von einer sofortigen Antwort ab.

## Akzeptanzkriterien

- [ ] Alle neun F-Karten erfüllen ihren Vertrag; jede zugehörige Negativprobe scheitert im regulären Prüfweg.
- [ ] Alle 16 R-Karten und M8-001 haben tatsächliche Abnahmen oder explizite zulässige, datierte Entscheidungen; keine verdeckte Restforderung.
- [ ] Grundprüfungen und alle neuen Pflichtjobs bestehen am integrierten Releasekandidaten; fehlende Messung kann kein Grün erzeugen.
- [ ] Unabhängiger Lieferbau und Quell-/Artefakt-/Deploymentzuordnung sind nachvollziehbar; Warnbudgets werden nicht still neu gesetzt.
- [ ] Geräte-, Vorleser-, Reader-, OCR-/CSP-/Offline- und D/E-Abnahmen decken die ursprünglichen Kriterien ab.
- [ ] A2 und Betreiberfreigabe beziehen sich auf die tatsächlich veröffentlichten Artefakte; öffentliche Header und Wirkung sind überprüft.
- [ ] Historische Akten bleiben erhalten; neue Abschlüsse sind als datierte Nachträge mit Belegen geführt.

**Recherche:** Die verlinkten offiziellen Primärquellen wurden am 2026-10-07 abgerufen. Sie begründen technische Vertragsanforderungen und Optionen; sie sind keine Abnahme dieses Projekts und keine pauschale Lizenz-/Sicherheitsfreigabe.

## Nachtrag 2026-10-08 — MS0 beauftragt und lokal ausgeführt

Thomas hat mit „Ms0 go“ MS0 beauftragt. Der historische Entwurfskopf bleibt erhalten;
das Konzept gilt für diese Stufe als Arbeitsgrundlage. Daraus folgt keine Betreiberentscheidung
zu späteren Lizenz-/Hostingoptionen und keine Beauftragung externer Personen.

Die [MS0-Kriterienbasis](../07-pruefung/fertigstellung/2026-10-08-ms0/README.md) erfasst alle
59 IDs, 26 offene Karten, Originalabnahmen/Abgrenzungen und Kriterien der acht D/E-Werkzeuge
mit eingefrorenen Quellen. Die neun F-Karten sind im Leitfaden erneut geöffnet.
Prüfrollen und relative Termine sind geplant; konkrete Reservierung und Bestätigung stehen
noch aus. Der MS0-Exit „Rollen, Zielgeräte und Prüfzugang reservieren“ bleibt deshalb offen,
bis OP-066 mit tatsächlichen Bestätigungen geschlossen wird. Keine Produkterfüllung durch MS0.

## Nachtrag 2026-10-08 — MS1–MS7 vollständig beauftragt

Thomas hat „Ms1-ms7 komplett durchziehen“, die grundsätzliche Genehmigung aller Arbeiten und
anschließend Vollzugriff erklärt. Die vorstehende Beschränkung auf MS0 ist für den aktuellen
Auftrag überholt. Die engeren Lizenzentscheidungen sind ausdrücklich beantwortet und umgesetzt;
OP-062 erhält innerhalb dieses Auftrags die Archivvariante. Wiederholte routinemäßige
Arbeitsgenehmigungen sind nicht erforderlich.

Lokale Umsetzung und konkrete Prüfungen stehen im
[MS1–MS7-Paket](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/README.md).
Die beschriebenen Exitkriterien gelten weiter: eine tatsächliche unabhängige A2 sowie
Geräte-/Fach-/Kontonachweise lassen sich nicht durch die Arbeitsfreigabe oder lokale Testzahlen
ersetzen. Der integrierte Kandidat ist vorbereitet; noch keine Veröffentlichung oder vollständige
Abnahme aller 26 Restverträge behauptet. Maßgeblicher Fortschritt bleibt der QM-Leitfaden.
