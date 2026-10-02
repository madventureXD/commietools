# Projektüberblick

## Ziel

CommieTools.org ist eine freie, werbefreie und datenschutzorientierte Plattform für praktische digitale Werkzeuge. Verarbeitung soll, soweit technisch sinnvoll, lokal auf dem Gerät stattfinden und ohne Internetverbindung funktionieren.

## Verbindliche Leitprinzipien

- Local First und Offline First
- keine unnötige Übertragung von Nutzerdaten
- einheitliches, präzises und barrierearmes Tool-UI
- Light und Dark Mode über gemeinsame semantische Design-Tokens
- modulare Tools mit wiederverwendbarer Kernlogik
- manifestbasierter Katalog und manifestbasierte Suiten
- erzeugtes Werkzeugregister: je Werkzeug und Sprache Symbol, Kurzbeschreibung und Suchbegriffe; Prüfung als Bestandteil von `check` und `build`
- Katalogsuche über die Begriffe, Schlagwörter, Titel und Beschreibungen aller Sprachen sowie über deklarierte Dateitypen, Kategorie und Suite
- hybride Internationalisierung: gemeinsame Plattform-/Suite-Texte plus toolnahe Übersetzungen
- vollständige, automatisch geprüfte Open-Source-Lizenzinformationen
- Projektlizenz `AGPL-3.0-only`

## Technischer Stand

- npm-Workspace-Monorepo mit TypeScript
- React-Webanwendung mit Vite
- installierbare PWA mit Offline-Shell
- gemeinsame Pakete für Core, UI, Tools und Internationalisierung
- automatisierte Tests, Typprüfung, Produktions-Build und Lizenzprüfung

## Verbindliche Fachdokumente

- Projektstart und Befehle: [`../../README.md`](../../README.md)
- Architektur: [`../../docs/architecture.md`](../../docs/architecture.md)
- Tool-UI-System: [`../../docs/ui-system.md`](../../docs/ui-system.md)
- Internationalisierung: [`../../docs/localization.md`](../../docs/localization.md)
- Lizenzverwaltung: [`../../licenses/README.md`](../../licenses/README.md)

Diese Dokumente werden nicht in der Übergabe dupliziert. Die Übergabe fasst sie zusammen und verweist auf sie.

