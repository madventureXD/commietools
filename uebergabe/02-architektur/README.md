# Architektur-Navigation

Die verbindliche Architektur steht in [`../../docs/architecture.md`](../../docs/architecture.md). Das UI-System steht in [`../../docs/ui-system.md`](../../docs/ui-system.md), die Spracharchitektur in [`../../docs/localization.md`](../../docs/localization.md).

Dieser Bereich ist für ergänzende, thematisch abgegrenzte Architekturleitfäden vorgesehen, beispielsweise:

- ein neues Tool hinzufügen oder ein vorhandenes erweitern,
- mehrere Tools zu einer Suite zusammenstellen,
- große lokale Engines und Offline-Caches integrieren,
- lokale Speicherung sicher anbinden,
- gemeinsame Verarbeitungslogik für Web, Desktop und Mobile vorbereiten.

## Erweiterungsregeln

### Open Source zuerst

Für jede neue Verarbeitungsfähigkeit werden zuerst geeignete, gepflegte Open-Source-Lösungen recherchiert, verglichen und möglichst prototypisch geprüft. Eine passende Lösung wird integriert, wenn sie Funktion, Local-/Offline-First, unterstützte Zielplattformen, Sicherheit, Datenschutz, Barrierefreiheit, Leistung und Lizenzanforderungen erfüllt.

Eigenentwicklung ist nur vorgesehen, wenn keine adäquate Open-Source-Lösung verfügbar ist oder alle Kandidaten an einem dokumentierten Muss-Kriterium scheitern. Diese Begründung gehört in das jeweilige Konzept, die Übergabe oder ein ADR. Eigene schlanke Adapter, Oberflächen, Validierung und Orchestrierung gelten nicht als Neuerfindung der Verarbeitungsengine, sondern als notwendige Einbindung in CommieTools.

Verbindliche Reihenfolge:

1. Anforderungen und Muss-Kriterien festlegen.
2. Open-Source-Kandidaten und deren Wartungszustand recherchieren.
3. Funktion, Offline-Fähigkeit, Sicherheit, Größe, Kompatibilität und Lizenz vergleichen.
4. geeignete Kandidaten mit realen Dateien prototypisch prüfen.
5. beste Lösung integrieren und vollständig in der Lizenzdatenbank erfassen.
6. nur bei dokumentierter Ablehnung aller Kandidaten selbst implementieren.

### Datensparsame Ladegrenzen

CommieTools lädt nur, was für die aktuell aufgerufene Funktion notwendig ist. Das ist eine
verbindliche Architekturregel und keine nachträgliche Leistungsoptimierung.

- Die Startseite enthält nur App-Shell, Katalog, UI-Grundlagen und die aktive Sprache.
- Jede Werkzeugoberfläche wird erst beim Öffnen ihrer Route geladen.
- Große Engines werden direkt vom nutzenden Werkzeug importiert und nicht über den allgemeinen
  Paket-Einstiegspunkt reexportiert.
- Benötigt ein Tool mehrere optionale Fähigkeiten, werden auch diese möglichst erst bei Aktivierung
  nachgeladen, beispielsweise OCR samt Sprachmodell erst nach Wahl der OCR-Funktion.
- Nicht aktive Sprachen, Beispiele, Zusatzschriften und Offline-Artefakte werden nicht vorsorglich
  übertragen.
- Offline-Caches dürfen nutzerinitiierte Downloads dauerhaft verfügbar machen, aber keine noch nie
  verwendeten Großmodule pauschal vorladen.
- Die Produktionsprüfung kontrolliert die statische Importkette der Startseite und ein komprimiertes
  Startbudget. Neue Engine-Klassen werden in diese Sperrliste aufgenommen.

Für PDF gilt konkret: `@commietools/tools` bleibt leicht. PDF-Funktionen kommen aus den expliziten
Einstiegspunkten `@commietools/tools/pdf/core`, `/pdf/m4` und `/pdf/m5`, die ausschließlich in den
verzögert geladenen PDF-Oberflächen verwendet werden.

### Neues Tool

Ein Tool besitzt eine eindeutige ID, ein Manifest, toolnahe Logik und bei Bedarf eigene Übersetzungen. Es verwendet gemeinsame UI-Komponenten und wird nicht durch fest codierte Navigation dupliziert.

Pflichtangaben, ohne die `npm run check` scheitert:

| Angabe | Ort | Bedeutung |
|---|---|---|
| `id`, `route`, `category` | `packages/tools/src/catalog/manifests.ts` | Route immer `/tools/<id>` |
| `titleKey`, `descriptionKey` | ebenda + Sprachkataloge | Name und Beschreibung für die Werkzeugseite |
| `summaryKey` | ebenda + **jede** Sprachdatei | eine Zeile für Karten und Trefferlisten, höchstens 120 Zeichen |
| `termsKey` | ebenda + **jede** Sprachdatei | kommagetrennte Suchbegriffe, führendes `#` markiert ein Schlagwort, mindestens ein Schlagwort, keine Dopplung |
| `files` | ebenda | `input`, `auxiliary` (`{ role, mimeTypes }`), `output` als MIME-Typen aus `knownFormats`; Pflicht bei den Kategorien `image` und `pdf`, sonst freiwillig |
| Symbol | `apps/web/public/tools/<id>.svg` | Strichzeichnung, `stroke="currentColor"`, 24×24 |

Danach `npm run catalog:generate` ausführen. Die Suche findet das Werkzeug danach über seine Begriffe, Schlagwörter, Titel, Beschreibungen, Dateitypen, Kategorie und Suite — ohne weitere Anmeldung.

### Vorhandenes Tool verbessern

Die bestehende ID und Route bleiben stabil, sofern kein zwingender Migrationsgrund besteht. Gemeinsame Logik wird erweitert, Tests werden ergänzt und neue Texte in den Tool-Katalog aufgenommen.

### Suite erstellen oder erweitern

Eine Suite referenziert Tool-IDs. Sie kopiert weder Tool-Code noch Übersetzungen. Dadurch kann dasselbe Tool in mehreren Suiten erscheinen und bleibt an einer Stelle wartbar.

### Neue gemeinsame Fähigkeit

Erst prüfen, ob sie genau einem Tool gehört. Nur Fähigkeiten mit mehreren tatsächlichen Nutzern werden in ein gemeinsames Paket verschoben. Neue Paketgrenzen oder irreversible Abhängigkeiten benötigen ein ADR.

