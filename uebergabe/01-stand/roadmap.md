# Roadmap

Die Roadmap beschreibt die derzeitige Reihenfolge, keine festen Termine.

## Phase 0 – Fundament

**Status:** weitgehend abgeschlossen

- Monorepo, Web/PWA, UI-System und Theme
- modulare Tool- und Suite-Manifeste
- hybride Internationalisierung
- Lizenzdatenbank und verpflichtende Prüfungen

## Phase 1 – PDF-Suite

**Status:** M0 bis M6 umgesetzt; M7 am Sicherheitsgate gesperrt, M8 als nächster umsetzbarer Meilenstein

Vollständiges Umsetzungskonzept: [`../03-konzepte/2026-10-03-pdf-suite.md`](../03-konzepte/2026-10-03-pdf-suite.md)

- M0: gemeinsamer PDF-Kern, lizenzierter Testkorpus sowie PDF.js-/pdf-lib-Prototyp
- M1: Zusammenführen, Teilen und Seiten organisieren
- M2: Bilder zu PDF und PDF zu Bildern
- M3: Gestaltung und sichtbare Unterschriften – umgesetzt
- M4: Formulare und Kommentare – umgesetzt
- M5: Sicherheit und Kompression – umgesetzt
- M6: eigenständiger Viewer, Textextraktion und OCR – lokal umgesetzt, noch nicht veröffentlicht
- M7: digitale Signaturen – JavaScript-Pfad gesperrt; Rust-WASM-Alternative mit vorbereitetem Abschlussprüfplan gestartet

## Phase 2 – Plattformqualität

**Status:** offen

- automatisierte Barrierefreiheits- und Offline-Tests
- Performance-Budgets und versionierte optionale Engine-Caches
- sicherer Deployment- und CSP-Standard
- dokumentierter Tool-Generator bzw. Erweiterungsworkflow

## Phase 3 – Weitere Oberflächen und optionale Dienste

**Status:** bewusst zurückgestellt

- Desktop/Mobile erst nach stabiler Webarchitektur
- Konten, Synchronisierung und Cloud-Anbindungen nur mit validiertem Bedarf
- Plugin-/Drittanbieter-Modell erst nach klarer Sicherheits- und Lizenzstrategie

