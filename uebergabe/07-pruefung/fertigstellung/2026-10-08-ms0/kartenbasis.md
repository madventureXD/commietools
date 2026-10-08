# MS0: Karten- und Kriterienbasis

**Datum:** 2026-10-08  
**Basis:** `556159f58ac3beac3b6349851dae7326558b7fbb`  
**Umfang:** 59 Karten; 33 B / 16 R / 9 F / 1 O; 26 offen.

Die Fortschrittsübersicht bleibt `uebergabe/00-einstieg/vorgehen-qm-audit.md`. Diese eingefrorene Basis erfasst Originalvertrag und Nachprüfungsurteil; sie ist kein Abschlussbericht. Vollständige Wortlaute, Quellenhashes und Messfelder stehen in [basis.json](basis.json).

| Karte | Titel | Nachprüfungsstand | Bearbeitung | Originalquelle / Zeile |
|---|---|---|---|---|
| M8-001 | Auslieferungs-CSP blockiert benötigte Engines | O: bekannte Restforderung offen | MS4 | QM/70-reparaturempfehlungen/R1.md:9 |
| M9-001 | Rust-Komponenten und ihre Original-Lizenzhinweise fehlen im Register | R: Restabnahme offen | MS1 | QM/70-reparaturempfehlungen/R1.md:39 |
| M9-002 | Lizenzgate prüft seine Eingangswege unterschiedlich streng | F: erneut geöffnet | MS1 | QM/70-reparaturempfehlungen/R1.md:69 |
| M9-003 | Eigener Quellcodezugang fehlt auf der Lizenzseite; Buildlink führt ins Leere | R: Restabnahme offen | MS1 | QM/70-reparaturempfehlungen/R1.md:98 |
| M9-004 | Bekannte lopdf-Parser-Schwachstelle im dokumentierten Signaturpfad | R: Restabnahme offen | MS1 | QM/70-reparaturempfehlungen/R1.md:127 |
| M6-003 | Signaturbericht nennt bei veränderter Datei zugleich „Änderung: Keine“ | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R1.md:158 |
| M3-002 | Statistik liest lokalisierte Zahlen entgegen der Eingabeerklärung | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:9 |
| M4-001 | RPN verbindet formatierte Brüche ohne Klammern zu falschen Ausdrücken | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:37 |
| M4-002 | Anzeige-Nullschwelle vernichtet auch Rohwert und Genauigkeitsvergleich | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:65 |
| M4-003 | Plotter ersetzt das Zeichen x auch innerhalb von Funktionsnamen | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:93 |
| M6-001 | JSON-Formatierung verändert Zahlenwerte ohne Hinweis | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:121 |
| M6-002 | RPN-Tastenfeld kann mehrstellige Zahlen und Dezimalzahlen nicht zusammensetzen | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:149 |
| M8-004 | CSV-Freitext wird als potenzielle Tabellenformel exportiert | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R2.md:177 |
| M4-004 | Sprachladefehler bleiben gecacht; UI besitzt keinen Fehler-/Wiederholungszustand | F: erneut geöffnet | MS4 | QM/70-reparaturempfehlungen/R3.md:9 |
| M4-005 | PDF-Ergebnisse können nach Dateiwechsel dem falschen Namen zugeordnet werden | F: erneut geöffnet | MS2 | QM/70-reparaturempfehlungen/R3.md:41 |
| M4-006 | PDF-Teiler gibt Ergebnis-URLs beim Verlassen nicht frei | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R3.md:68 |
| M4-007 | Sprach-Type-Guard akzeptiert geerbte Objektschlüssel | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R3.md:96 |
| M8-002 | Erste Offline-Bereitschaft hängt an flüchtigem HTTP-Cache | F: erneut geöffnet | MS4 | QM/70-reparaturempfehlungen/R3.md:123 |
| M8-003 | Nicht verfügbarer Browser-Speicher verhindert Nutzung statt Rückfall | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R3.md:153 |
| M1-003 | Kein im Repository erkennbarer automatischer Freigabeschutz für `main` | F: erneut geöffnet | MS5 | QM/70-reparaturempfehlungen/R4.md:9 |
| M4-008 | Erfolgreiches Lint-Kommando prüft keine einzige Workspace-Codebasis | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R4.md:37 |
| M5-001 | PDF-Tests sichern zugesagte Seitenwahl und Nummerninhalte nicht ab | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R4.md:65 |
| M5-002 | Der zentrale Speichervorgang bleibt im automatischen Testlauf unbenutzt | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R4.md:93 |
| M5-003 | Kritische PDF-Engine-Pfade sind nicht Teil des normalen Testschutzes | F: erneut geöffnet | MS5 | QM/70-reparaturempfehlungen/R4.md:121 |
| M5-004 | Vorhandene Randfalltests erfassen wichtige Kombinationen nicht | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R4.md:150 |
| M2-009 | Versprochene automatische Barrierefreiheitsprüfung fehlt | F: erneut geöffnet | MS3 | QM/70-reparaturempfehlungen/R4.md:179 |
| M3-009 | Vorgeschriebene Sprachprüfungen sind nicht vollständig automatisiert | F: erneut geöffnet | MS3 | QM/70-reparaturempfehlungen/R4.md:207 |
| M2-006 | Zugängliche Namen bleiben unabhängig von der Sprache Englisch | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R5.md:9 |
| M2-007 | Drei Schaltflächenregeln unterschreiten die verbindlichen 44 Pixel | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R5.md:39 |
| M2-008 | Oberflächenfarben umgehen teilweise das semantische Tokensystem | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R5.md:68 |
| M7-001 | Weiße Aktionsbeschriftungen haben im dunklen Theme zu wenig Kontrast | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R5.md:96 |
| M7-002 | Die Menü-Fokusbegrenzung berücksichtigt sichtbare Kategorien nicht korrekt | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R5.md:125 |
| M7-003 | PDF-Schwärzung hat keine Tastaturalternative zur Rechteckauswahl | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R5.md:153 |
| M7-004 | Der PDF-Viewer stellt Dokumenttext nicht für assistive Technik bereit | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R5.md:181 |
| M7-005 | Schmale Layouts verdecken Beschriftungen und erzeugen Katalogüberlauf | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R5.md:209 |
| M7-006 | Nicht definierte CSS-Tokens lassen Layout- und Farbregeln ausfallen | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R5.md:238 |
| M3-001 | Spanische Übersetzung beschädigt drei technische Platzhalter | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:9 |
| M3-003 | Spanische Kerntexte ändern die fachliche Bedeutung | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:38 |
| M3-004 | Deutsche Richtungsbeschriftungen umgehen die Sprachpakete | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:67 |
| M3-006 | Ton und Terminologie sind nicht durchgängig eingehalten | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:95 |
| M3-007 | Lange Unicode-Dateinamen können beim Kürzen beschädigt werden | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:126 |
| M3-008 | Titelschreibung übersieht Wörter hinter spanischen Satzzeichen | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:153 |
| M3-010 | Zahlenformate folgen innerhalb derselben Oberfläche verschiedenen Regeln | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R6.md:181 |
| M1-001 | Haupt-README beschreibt einen veralteten Produktumfang | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R7.md:9 |
| M1-002 | Behauptung „Suche über alle Sprachen“ widerspricht dem Ladeverhalten | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R7.md:37 |
| M2-001 | Angenommener Sicherheits-ADR verbietet veröffentlichte M7-Werkzeuge | R: Restabnahme offen | MS7 | QM/70-reparaturempfehlungen/R7.md:68 |
| M2-002 | ADR verspricht harten Größenabbruch, aktuelles Gate warnt nur | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R7.md:96 |
| M2-003 | Angenommener Rechner-ADR enthält zwei überholte Budgets | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R7.md:124 |
| M2-004 | QPDF-ADR beschränkt die Engine fälschlich auf M5 | R: Restabnahme offen | MS5 | QM/70-reparaturempfehlungen/R7.md:152 |
| M2-005 | Entscheidungsindex verschweigt ADR 0006 | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R7.md:180 |
| M11-001 | Architekturbeschreibung führt vorhandene Engine- und Cachegrenzen als vertagt | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R7.md:208 |
| M10-001 | Erledigte Aufgaben und historische Statusköpfe bleiben aktiv geführt | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R8.md:9 |
| M10-002 | Verbindliche Übergabevorlage und tatsächliche Aktenstruktur driften auseinander | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R8.md:38 |
| M10-003 | Vorhandene Übergaben werden trotz Erhaltungsregel umgeschrieben | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R8.md:67 |
| M10-004 | Wesentliche Prüfskripte fehlen im versionierten Übergabebestand | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R8.md:95 |
| M10-005 | Abschlussbewertung wird nicht durchgehend am dokumentierten Umfang geprüft | R: Restabnahme offen | MS6 | QM/70-reparaturempfehlungen/R8.md:124 |
| M4-009 | Gemeinsame technische Verantwortlichkeiten sind mehrfach implementiert | F: erneut geöffnet | MS2 | QM/70-reparaturempfehlungen/R9.md:9 |
| M4-010 | Routenzuordnung hat einen fachfremden Standardfall statt Vollständigkeitsprüfung | B: Befundkern nachvollzogen, begrenzt | regression-only | QM/70-reparaturempfehlungen/R9.md:44 |
| M8-005 | Infrastruktur-Fehlerberichte fehlen im dokumentierten Datenfluss | R: Restabnahme offen | MS7 | QM/70-reparaturempfehlungen/R10.md:9 |

## Verbindlicher Restumfang der 26 offenen Karten

### M8-001 — Auslieferungs-CSP blockiert benötigte Engines

**Stand:** bekannte Restforderung offen · **Milestone:** MS4

**Originalabnahme (unverändert):**

> Echte Signaturprüfung und OCR einer bekannten Bildseite unter den gebauten Auslieferungsheadern: Erfolg, abgelehnte Zustimmung, Abbruch, beschädigtes Modell, Offlinewiederholung. Netzprotokoll belegt Ressourcenabrufe ohne Dateiübertragung. Bloßes WASM-Minimalmodul reicht nicht.

**Bindende Abgrenzung (unverändert):**

> Kein unsafe-eval, CSP-Abschalten, globaler CDN-Wildcard oder Vorabladen aller OCR-Sprachen. CSP-Freigabe schließt M9-004 nicht.

**Ist-/Restbefund der Nachprüfung:** `apps/web/public/_headers`, `apps/web/src/tools/PdfTextOcr.tsx`: CSP geändert; beschädigtes OCR-Modell, Offlinewiederholung und real ausgelieferte neue Header nicht unabhängig abgenommen. Historischer Proxy-Erfolg ersetzt dies nicht.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, auslieferung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M9-001 — Rust-Komponenten und ihre Original-Lizenzhinweise fehlen im Register

**Stand:** Restabnahme offen · **Milestone:** MS1

**Originalabnahme (unverändert):**

> lopdf-Originalhinweise im Register UND auf /licenses auffindbar; Stichproben aus weiteren tatsächlich ausgelieferten Komponenten. Entfernte Hinweisdatei lässt Gate scheitern. Zwei unabhängige saubere Builds vergleichen; Abweichungen dokumentieren statt reproduzierbar behaupten.

**Bindende Abgrenzung (unverändert):**

> 199 historische Lockeinträge sind weder 199 Binärkomponenten noch ein Lizenzverbot. Keine pauschale Freigabe einer Bibliothek allein wegen SPDX-Kennung.

**Ist-/Restbefund der Nachprüfung:** `licenses/rust-components.json`, `licenses/notices/rust/`, `scripts/license-audit.mjs`, `apps/web/src/LicensePage.tsx`: eigener Check zählt 176 / **172** Originalhinweise, vier ohne Original; Entscheidungen N2 und unabhängiger Liefer-/Neubaunachweis offen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, rust-lieferung, betreiberentscheidungen. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M9-002 — Lizenzgate prüft seine Eingangswege unterschiedlich streng

**Stand:** erneut geöffnet · **Milestone:** MS1 · **Befund:** N2

**Originalabnahme (unverändert):**

> M9-Gegenproben auf Reparaturstand: installierte Version 999.0.0, installierte Lizenz UNLICENSED, unbekannte Komponentenlizenz, ungeprüfte Artefaktlizenz jeweils ablehnen; Lock-Lizenz- und Override-Hash-Kontrollen weiter ablehnen. Sauberer Bestand besteht.

**Bindende Abgrenzung (unverändert):**

> Keine bloße Zählerprüfung, kein Weglassen optionaler eingebetteter Inhalte, kein manuelles Ändern der erzeugten Registry als Reparatur.

**Ist-/Restbefund der Nachprüfung:** `scripts/license-audit.mjs`, `licenses/rust-review.json`: N2, zwei nicht erlaubte Entscheidungszustände bestehen die isolierte Originalfunktion.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, rust-lieferung, betreiberentscheidungen. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M9-003 — Eigener Quellcodezugang fehlt auf der Lizenzseite; Buildlink führt ins Leere

**Stand:** Restabnahme offen · **Milestone:** MS1

**Originalabnahme (unverändert):**

> Jeden Produktlink aus gebauter App öffnen: richtige Ressource/Inhalt statt SPA-HTML mit Status 200. Revisionsvergleich und Hashzuordnung prüfen; unabhängiger sauberer Nachbau nach Anleitung.

**Bindende Abgrenzung (unverändert):**

> Kein bloßer Link auf wechselndes main, keine Behauptung AGPL-konform nur aufgrund eines sichtbaren Links. Ein fehlender Produktlink bedeutet nicht, dass es kein öffentliches Repository gibt.

**Ist-/Restbefund der Nachprüfung:** `licenses/artifacts.json`, `licenses/registry.json`, `apps/web/src/LicensePage.tsx`: absolute revisionsgebundene Quelle/Buildlinks vorhanden, Registercheck grün. Vollständige unabhängige Source→Lock→Build→Binary-Zuordnung/Reproduzierbarkeit nicht erneut gebaut.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, rust-lieferung, betreiberentscheidungen, auslieferung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M9-004 — Bekannte lopdf-Parser-Schwachstelle im dokumentierten Signaturpfad

**Stand:** Restabnahme offen · **Milestone:** MS1

**Originalabnahme (unverändert):**

> Harmloses Grenzkorpus für unterstützte Nesttiefe liefert Erfolg bzw. kontrollierten Fehler; gültige PDFs bleiben verarbeitbar. Signatur-/Entschlüsselungskorpus vor/nach Update vergleichen. Advisoryscan auf effektiven Ziel-/Featurestand und neu gebautes Artefakt beziehen.

**Bindende Abgrenzung (unverändert):**

> Worker, Dateigrößenlimit oder catch_unwind sind kein Ersatz für Parserfix. Keine Absturz-PoC im Nutzerbrowser; kein Reparaturnachweis nur durch Editieren von Cargo.toml.

**Ist-/Restbefund der Nachprüfung:** `crates/pdf-signer-engine/Cargo.toml`, beide `crates/*/Cargo.lock`, `packages/tools/src/pdf/m7-wasm/engine_bg.wasm`: lopdf 0.42.0 liegt im offiziell bestätigten Fixbereich; 13 aktuelle WASM-Korpusläufe. Neuer eigener Rust-Build und tiefer Parser-Grenzkorpus nicht wiederholt; keine umfassende Sicherheitsfreigabe.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, rust-lieferung, betreiberentscheidungen. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M4-004 — Sprachladefehler bleiben gecacht; UI besitzt keinen Fehler-/Wiederholungszustand

**Stand:** erneut geöffnet · **Milestone:** MS4 · **Befund:** N6

**Originalabnahme (unverändert):**

> Import bewusst ablehnen, Netz herstellen, Retry ohne Dokumentreload; Locale A langsam, B schnell; alter Reject darf neuen Erfolg nicht löschen. Evaluationsfehler und veralteten Deploymentchunk getrennt prüfen; keine unhandled rejection und kein endloses Laden.

**Bindende Abgrenzung (unverändert):**

> Keine Handreparatur generierter Dateien, kein beliebiges ?timestamp-Import-Busting, kein ErrorBoundary-Reset als alleiniger Beweis erneuten Imports.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/tool-load-recovery.ts`, `apps/web/src/App.tsx`, `apps/web/src/useToolSearchIndex.ts`: Cache-/Fehlerwege verbessert und Reload-Abweichung dokumentiert; N6 beweist falsche Deployment-Ursache bei unverändertem Offline-Build.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M4-005 — PDF-Ergebnisse können nach Dateiwechsel dem falschen Namen zugeordnet werden

**Stand:** erneut geöffnet · **Milestone:** MS2 · **Befund:** N3

**Originalabnahme (unverändert):**

> Deferred A starten, B auswählen, B fertig, A zuletzt fertig/fehlerhaft: ausschließlich B bleibt sichtbar und speicherbar, A beendet B nicht. Unmount während Erfolg und Fehler; echte Browserprobe mit unterschiedlichen Dateinamen/Seiteninhalten.

**Bindende Abgrenzung (unverändert):**

> Kein beliebiger Timeout, bloßes disabled des Aktionsbuttons oder Abfangen nur des Erfolgswegs. Fachlich verschiedene Engines nicht in Universalprozessor zwängen.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/tools/PdfSplit.tsx`: Verarbeitungsauftrag geschützt, Eingangsauftrag nicht; N3 reproduziert A/B-Umkehr.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M8-002 — Erste Offline-Bereitschaft hängt an flüchtigem HTTP-Cache

**Stand:** erneut geöffnet · **Milestone:** MS4 · **Befund:** N6

**Originalabnahme (unverändert):**

> Frisches Profil: App/Tool laden, SW bereit, HTTP-Cache löschen aber CacheStorage behalten, Netz aus, direkter Reload/Route funktioniert. Warmbesuch, Localewechsel, fehlendes Paket und SW-Versionswechsel getrennt testen; dritte Sprache wird nicht geladen.

**Bindende Abgrenzung (unverändert):**

> Nicht alle Sprachen/Engines precachen. navigator.onLine oder ein erfolgreicher RAM-Import ist kein Offlinebeleg. Keine zweite unkoordinierte Cachearchitektur.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/pwaWarmCache.ts`, `apps/web/vite.config.ts`: Sprach-Warmlauf ist real, aber verwendete PDF-Abhängigkeiten nicht gesichert; N6. Weitere Locale-/SW-/Quota-Abnahmen ebenfalls offen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M1-003 — Kein im Repository erkennbarer automatischer Freigabeschutz für `main`

**Stand:** erneut geöffnet · **Milestone:** MS5 · **Befund:** N1

**Originalabnahme (unverändert):**

> Absichtlich roter Test verhindert Merge/Release im vorgesehenen Weg; fehlender/übersprungener Job gilt nicht als grün. Buildrevision im Produkt gegen CI-Artefakt abgleichen. Externe Schutzkonfiguration mit Datum und Zuständigkeit protokollieren.

**Bindende Abgrenzung (unverändert):**

> Kein Beweis fehlenden Kontoschutzes aus fehlender YAML ableiten; in diesem Auftrag weder Kontoeinstellungen noch Deployment ändern.

**Ist-/Restbefund der Nachprüfung:** `.github/workflows/quality.yml`: drei sinnvolle Jobs, aber Triggerstruktur N1; kein eigener externer Lauf/Branchschutz, SHA-Pinning weiterhin offen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, releasekonto, reader-interop. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M5-002 — Der zentrale Speichervorgang bleibt im automatischen Testlauf unbenutzt

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Pickerpfad bis createWritable/write/close mit exakt erwarteten Bytes/Name/MIME; Abbruch, Schreibfehler, fehlende API, asynchrone Blobproduktion, wiederholter Klick. Ein Browserdownload wird wirklich abgefangen und inhaltlich gelesen; native Dialogprobe am Zielgerät separat.

**Bindende Abgrenzung (unverändert):**

> Keine Reparatur nur über Filename-Unit-Test; keine Berechtigungsabfrage außerhalb konkreter Nutzeraktion, keine sofortige Erfolgsmeldung ohne Schreibabschluss.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/tools/SaveFileControl.tsx`, `apps/web/src/save-file.test.ts`: injizierbarer Adapter, Bytes/Picker/Abbruch/Write/Close geprüft. Eigener echter abgefangener Browserdownload und native Zielgeräte-Dialogabnahme fehlen; Mock-Vertrag ist kein Platte-Beleg.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M5-003 — Kritische PDF-Engine-Pfade sind nicht Teil des normalen Testschutzes

**Stand:** erneut geöffnet · **Milestone:** MS5 · **Befund:** N7

**Originalabnahme (unverändert):**

> Unlock-noop wird erkannt. Mindestens gültige, manipulierte, inkrementell ergänzte Signatur und verschlüsselte PDF durch echten WASM-Pfad; UI unter CSP mitprüfen. Fehlende Fixture oder nicht gebaute Engine markiert blockiert, nicht bestanden.

**Bindende Abgrenzung (unverändert):**

> Keine Uploads privater PDFs an Onlinevalidatoren; öffentliche Referenzen lokal nutzen. Keine Zertifizierung aller PDF-/Signaturprofile durch kleines Korpus behaupten.

**Ist-/Restbefund der Nachprüfung:** `package.json`, `.github/workflows/quality.yml`, `scripts/m7-eu-dss-audit.mjs`: N7; einmaliger Enginebeleg ersetzt das verlangte normal sperrende Wirkungs-/Releasegate nicht.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, releasekonto, reader-interop. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M2-009 — Versprochene automatische Barrierefreiheitsprüfung fehlt

**Stand:** erneut geöffnet · **Milestone:** MS3 · **Befund:** N4

**Originalabnahme (unverändert):**

> Künstlicher unbeschrifteter Button und Kontrast-/Fokusfehler werden erkannt; leere Route scheitert. Echte Vorleserprüfung mindestens Viewer und Rechner/Menü, Tastaturdurchlauf sowie manuelle Zoomprobe bleiben Abnahmebestandteil.

**Bindende Abgrenzung (unverändert):**

> Nicht behaupten, es gäbe keinen Scanner mehr. Ein grüner heuristischer DOM-Scan oder axe-Lauf ist kein vollständiges WCAG-Urteil.

**Ist-/Restbefund der Nachprüfung:** `scripts/viewport-audit.mjs`: grüne Grundzustandsläufe in beiden Themes; Menüzustand wird tatsächlich nicht geprüft, N4. CI-Lauf und manuelle Kriterien offen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M3-009 — Vorgeschriebene Sprachprüfungen sind nicht vollständig automatisiert

**Stand:** erneut geöffnet · **Milestone:** MS3 · **Befund:** N8

**Originalabnahme (unverändert):**

> Ein umbenannter Parameter, fehlender dynamischer Schlüssel und absichtlich beschädigtes Unicode-Fixture scheitern; Akzente, Ñ/ñ, ¿/¡ und legitime technische Syntax bestehen. de+en bzw. es+en werden geladen, dritte Sprache nicht.

**Bindende Abgrenzung (unverändert):**

> Platzhaltergleichheit ist kein fachliches Spanisch-Lektorat; keine Installation eines Übersetzungsdiensts oder automatischen externen Uploads.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/language-contract.test.ts`, `scripts/catalog-generate.mjs`: Werkzeugvertrag verbessert; Unicode-Mutant der Schnittstellentexte besteht alle sechs Originaltests, N8.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M2-006 — Zugängliche Namen bleiben unabhängig von der Sprache Englisch

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> de/en/es: zugänglicher Name der Navigation und Modusgruppe im Accessibilitybaum korrekt; echte Vorleseransage, Tastaturbedienung und aktive Moduskennzeichnung prüfen.

**Bindende Abgrenzung (unverändert):**

> Keine Übersetzung mathematischer Symbole oder Eigennamen per blindem Such-Ersetzen; kein zusätzlicher versteckter redundanter Text ohne Nutzwert.

**Ist-/Restbefund der Nachprüfung:** `packages/i18n/src/common/{de,en,es}.ts`, `apps/web/src/App.tsx`: übersetzte zugängliche Namen vorhanden, Grundzustandsprüfung ohne Namensbefunde; echter Vorleserlauf OP-051 fehlt.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M2-007 — Drei Schaltflächenregeln unterschreiten die verbindlichen 44 Pixel

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Menüsortierung, PDF-Seitenaktionen, Icon-Ergebnisse und Details bei 320/390/1360 px, beiden Themes und längster Sprache. Ergebniszustände aktiv erzeugen, nicht nur leere Startformulare scannen.

**Bindende Abgrenzung (unverändert):**

> 44px bleibt Projektregel; nicht mit WCAG-AA-24px ersetzen. Keine unsichtbar überlappenden Klickflächen als Größenkosmetik.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/styles.css`, `packages/ui/src/tokens.css`: benannte kleinere Regeln korrigiert, Grundzustände grün; Menübeleg N4 ungültig, Ergebnis-/Fehler-/Menüzustände nicht vollständig unabhängig gemessen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M7-002 — Die Menü-Fokusbegrenzung berücksichtigt sichtbare Kategorien nicht korrekt

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Tab/Shift+Tab bei offenen/geschlossenen Kategorien, ohne Treffer, Favoriten/Sortierung; Escape, Back, Fokus-Rückkehr und Unmount. Hintergrund per Tastatur/AT nicht bedienbar, Searchkeyboard verdeckt nicht initial das Menü.

**Bindende Abgrenzung (unverändert):**

> Nicht nur summary zum alten Selector hinzufügen: versteckte Nachfahren und Hintergrund bleiben sonst problematisch. aria-modal allein sperrt keinen Hintergrund.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/ToolNavigation.tsx`: nativer `showModal`-Dialog vorhanden und im eigenen Browser geöffnet; vollständiger neuer Tab/Shift-Tab/summary/Escape/Zurück/Fokusrückgabe-Durchlauf fehlt, N4 macht Scannerbeleg hierfür unbrauchbar.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M7-003 — PDF-Schwärzung hat keine Tastaturalternative zur Rechteckauswahl

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Nur Tastatur: Datei wählen, Seite wählen, Rechteck exakt setzen, ändern, entfernen, exportieren. Ergebnis unabhängig prüfen: betroffener Inhalt tatsächlich entfernt, nicht nur optisch übermalt. Rotation, Zoom, Seitenrand und Touch-Gegenprobe.

**Bindende Abgrenzung (unverändert):**

> Ein ARIA-Label auf der Zeichenfläche macht Zeichnen nicht tastaturbedienbar. Zugänglichkeit darf Schwärzungssicherheit nicht ersetzen.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/tools/PdfInteractiveTools.tsx`, `apps/web/src/pdf-redaction-area.test.ts`, `pdf-redaction-rotation.test.ts`: Tastaturformular und gemeinsamer Rechteckvertrag, reguläre geometrische/Rotationsproben grün. Reales Touchgerät/abweichender Zoom offen (OP-048/054).

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M7-004 — Der PDF-Viewer stellt Dokumenttext nicht für assistive Technik bereit

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Text-PDF mit Überschriften, mehrspaltige PDF, gedrehte Seite und Scan: zwei reale Vorleser-/Browserkombinationen nach Möglichkeit, mindestens eine dokumentierte. Text erreichbar, Reihenfolge nachvollziehbar, keine doppelte Lesung von Bild/Text; Speichercleanup.

**Bindende Abgrenzung (unverändert):**

> Keine vollständige PDF/UA-/WCAG-Konformität aus flacher Textextraktion ableiten; nicht PDF.js-master-Interna blind in v6 kopieren.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/tools/PdfViewer.tsx`: zugängliche Textansicht, Navigation und Grenzhinweise vorhanden; Vorleser und komplexe Lesereihenfolge nicht abschließend geprüft (OP-049/050).

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M7-005 — Schmale Layouts verdecken Beschriftungen und erzeugen Katalogüberlauf

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Startseite, Menü geöffnet, Rechner mit Ergebnis, lange Dateinamen, de/en/es bei 320px und 390px; native 200%-Zoom- und Textabstandsprobe separat. Keine verdeckte Funktion, kein horizontaler Ganzseitenüberlauf außer begründeten Datendarstellungen. Reales Mobilgerät separat.

**Bindende Abgrenzung (unverändert):**

> Kein overflow:hidden als generische Reparatur; Desktop-Viewportemulation ist kein realer Mobiltest.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/styles.css`: 62 Grundzustände bei 320 px bestehen eigene Breitenprüfung. Keine pauschale Abnahme aller Ergebnis-, Menü-, Auskoppel- und echten Browserzoomzustände; N4, OP-054.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M2-001 — Angenommener Sicherheits-ADR verbietet veröffentlichte M7-Werkzeuge

**Stand:** Restabnahme offen · **Milestone:** MS7

**Originalabnahme (unverändert):**

> Jede Gatebehauptung verweist auf konkrete Revision und Bericht; Produktstatus/Manifest/ADR konsistent. Fehlender Rust- oder CSP-Nachweis bleibt offen. Index verlinkt Vorgänger/Nachfolger eindeutig.

**Bindende Abgrenzung (unverändert):**

> Nicht die Sicherheitsanforderungen löschen, nur weil Funktionen bereits im Katalog stehen. Neue Entscheidung benötigt Betreiberfreigabe.

**Ist-/Restbefund der Nachprüfung:** `uebergabe/04-entscheidungen/0014-m7-freigabekriterien.md`, Vorgänger 0004: neue Entscheidung mit vier Auflagen vorhanden, Push nach unabhängiger Kontrolle. Diese Nachprüfung ist **keine automatische positive Sicherheitsfreigabe**; N2/N7 und restliche A2-Abnahme offen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, a2, auslieferung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M2-004 — QPDF-ADR beschränkt die Engine fälschlich auf M5

**Stand:** Restabnahme offen · **Milestone:** MS5

**Originalabnahme (unverändert):**

> Importkarte weist m5-/m8-Pfade aus; Startseite lädt QPDF nicht, beide Toolpfade laufen mit identischer Engineversion. Dokumentation und tatsächliche Aufrufargumente passen.

**Bindende Abgrenzung (unverändert):**

> Keine zusätzliche QPDF-Engine nur zur Herstellung der alten M5-Grenze.

**Ist-/Restbefund der Nachprüfung:** ADR 0002, `packages/tools/src/pdf/{m5,m8}.ts`: Sicherheit **und** Reparatur dokumentiert, gemeinsame QPDF-Engine; unabhängiger neuer Browser-CSP-Wirkungsnachweis beider Pfade fehlt. Kein Auftrag, zweite Engine zu bauen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, releasekonto, reader-interop. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M10-003 — Vorhandene Übergaben werden trotz Erhaltungsregel umgeschrieben

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Neue Korrektur lässt alte Aussage rekonstruierbar und aktuellen Status eindeutig; Absatzumbruch allein löst keinen Manipulationsbefund aus. Worte unverändert nur verwenden, wenn Vergleich das bestätigt.

**Bindende Abgrenzung (unverändert):**

> Kein Revert historischer Commits, keine Schuld-/Absichtszuschreibung, keine Behauptung verlorener Gitgeschichte.

**Ist-/Restbefund der Nachprüfung:** Arbeitsregeln und vier „Hinweis zur Fassung“-Akten: Rekonstruktion/Korrekturverfahren vorhanden, eigener Wortvergleich grün. Nachträgliche Ausnahme-/Archiventscheidung OP-062 nicht erledigt.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout, betreiberentscheidungen. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M10-004 — Wesentliche Prüfskripte fehlen im versionierten Übergabebestand

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Frischer Checkout auf zweiter Umgebung ohne work/: notwendige Proben laufen mit dokumentierten Voraussetzungen. Fehlende Fixtures/Browser/Preview ergeben klaren Abbruch, nicht grünes Leerergebnis.

**Bindende Abgrenzung (unverändert):**

> Nicht work/ pauschal entignorieren oder private Testdateien hochladen. Lokal vorhanden ist nicht verschwunden, aber noch nicht übergabefähig.

**Ist-/Restbefund der Nachprüfung:** `scripts/belege/`, `package.json`: tragende Programme versioniert, eigener Sprach-Netzbeleg läuft ohne `work/`. Kein neuer eigener Zweitrechner-/frischer-Checkout-Lauf; Browseraufbereitung nicht vollständig portabel, ausgewählte übrige Proben OP-063 offen.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M10-005 — Abschlussbewertung wird nicht durchgehend am dokumentierten Umfang geprüft

**Stand:** Restabnahme offen · **Milestone:** MS6

**Originalabnahme (unverändert):**

> Jedes ursprüngliche Kriterium hat belegt erfüllt/abweichend/ausdrücklich verschoben, nicht still entfernt. D/E-Funktionsabnahme und neue Routen gesondert prüfen; Audit der alten 54 Tools ersetzt das nicht.

**Bindende Abgrenzung (unverändert):**

> Keine erneute Welle D/E bauen. Keine harte Budgetverletzung oder vorsätzliche Kriteriumsverschiebung ohne entsprechenden Beleg behaupten.

**Ist-/Restbefund der Nachprüfung:** `uebergabe/01-stand/abschlussmatrix.md`, `scripts/akte-audit.mjs`: Kriterienmatrix/Quellenprüfung vorhanden und eigener Gatecheck grün. Inhaltliche Freigaben für sämtliche neuen D/E-Funktionen/ursprünglichen Kriterien nicht unabhängig komplett neu durchgespielt; zählt nicht automatisch als Produkterfüllung.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, zielgeraete, frischer-checkout, fachabnahme. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M4-009 — Gemeinsame technische Verantwortlichkeiten sind mehrfach implementiert

**Stand:** erneut geöffnet · **Milestone:** MS2 · **Befund:** N5

**Originalabnahme (unverändert):**

> Verhaltensvergleich aller migrierten Aufrufer, Fehler-/Cleanupfälle aus R3 und Formatfälle aus R6. Importgraph bleibt azyklisch, keine neue eager Engine-/Allsprachen-Abhängigkeit.

**Bindende Abgrenzung (unverändert):**

> Keine Universal-PDF-Factory, kein pauschales utils.ts, keine fachlich unterschiedlichen Rundungsregeln vereinen. Kein Nachweis von AI-Autorschaft allein aus Codegeruch.

**Ist-/Restbefund der Nachprüfung:** `apps/web/src/tools/resultUrl.ts`, `apps/web/src/useToolSearchIndex.ts`, gemeinsame Formate/Rundung: Konsolidierung vorhanden, aber neuer URL-Lebenszyklus verletzt Reinheit und leckt im StrictMode, N5.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

### M8-005 — Infrastruktur-Fehlerberichte fehlen im dokumentierten Datenfluss

**Stand:** Restabnahme offen · **Milestone:** MS7

**Originalabnahme (unverändert):**

> Öffentliche Antwortheader mit Zeit/Deploymentrevision frisch erfassen. Frisches und bereits benutztes Profil unterscheiden; autorisierte harmlose Fehlerprobe nur auf eigener Testumgebung, tatsächlichen Versand soweit prüfbar beobachten. Bei Beibehaltung dokumentierte Felder/Zweck/Empfänger prüfen.

**Bindende Abgrenzung (unverändert):**

> Keine Kontoänderung durch diesen Bericht, keine PDF-Upload-/Rechtsverletzungsbehauptung aus NEL-Header allein. Anbieterbehauptung keine PII ist kein eigenes Rechtsgutachten.

**Ist-/Restbefund der Nachprüfung:** `docs/architecture.md`, Cloudflare-Betriebsdoku, `uebergabe/06-protokolle/2026-10-07-r10-m8-005-entscheidungsvorlage.md`: Betreiberwahl **Weg A** und Infrastruktur-NEL transparent dokumentiert. Kein neuer eigener aktueller Header-/Altprofil-/Versandlauf, kein daraus erfundener Upload-/Rechtsbefund.

**Verantwortlichkeit:** Entwicklung; Betreiber für Entscheidungen/Kontoeingriffe. **Externe Abnahmen:** gegenpruefung, a2, auslieferung. Terminierung siehe [Prüfzugang und Abnahmefenster](abnahmefenster.md).

**Messung/Beleg auf dem Reparaturstand:** noch nicht erhoben; weder Umsetzung noch Abnahme durch MS0.

