# Architektur-Navigation

Die verbindliche Architektur steht in [`../../docs/architecture.md`](../../docs/architecture.md). Das UI-System steht in [`../../docs/ui-system.md`](../../docs/ui-system.md), die Spracharchitektur in [`../../docs/localization.md`](../../docs/localization.md).

Dieser Bereich ist für ergänzende, thematisch abgegrenzte Architekturleitfäden vorgesehen, beispielsweise:

- ein neues Tool hinzufügen oder ein vorhandenes erweitern,
- mehrere Tools zu einer Suite zusammenstellen,
- große lokale Engines und Offline-Caches integrieren,
- lokale Speicherung sicher anbinden,
- gemeinsame Verarbeitungslogik für Web, Desktop und Mobile vorbereiten.

## Erweiterungsregeln

### Neues Tool

Ein Tool besitzt eine eindeutige ID, ein Manifest, toolnahe Logik und bei Bedarf eigene Übersetzungen. Es verwendet gemeinsame UI-Komponenten und wird nicht durch fest codierte Navigation dupliziert.

### Vorhandenes Tool verbessern

Die bestehende ID und Route bleiben stabil, sofern kein zwingender Migrationsgrund besteht. Gemeinsame Logik wird erweitert, Tests werden ergänzt und neue Texte in den Tool-Katalog aufgenommen.

### Suite erstellen oder erweitern

Eine Suite referenziert Tool-IDs. Sie kopiert weder Tool-Code noch Übersetzungen. Dadurch kann dasselbe Tool in mehreren Suiten erscheinen und bleibt an einer Stelle wartbar.

### Neue gemeinsame Fähigkeit

Erst prüfen, ob sie genau einem Tool gehört. Nur Fähigkeiten mit mehreren tatsächlichen Nutzern werden in ein gemeinsames Paket verschoben. Neue Paketgrenzen oder irreversible Abhängigkeiten benötigen ein ADR.

