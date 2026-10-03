# Roadmap

Die Roadmap beschreibt die derzeitige Reihenfolge, keine festen Termine.

## Phase 0 – Fundament

**Status:** weitgehend abgeschlossen

- Monorepo, Web/PWA, UI-System und Theme
- modulare Tool- und Suite-Manifeste
- hybride Internationalisierung
- Lizenzdatenbank und verpflichtende Prüfungen

## Phase 1 – PDF-Suite

**Status:** M0 bis M7 lokal umgesetzt; M7-Veröffentlichung wartet auf die unabhängige Abschlussprüfung

Vollständiges Umsetzungskonzept: [`../03-konzepte/2026-10-03-pdf-suite.md`](../03-konzepte/2026-10-03-pdf-suite.md)

- M0: gemeinsamer PDF-Kern, lizenzierter Testkorpus sowie PDF.js-/pdf-lib-Prototyp
- M1: Zusammenführen, Teilen und Seiten organisieren
- M2: Bilder zu PDF und PDF zu Bildern
- M3: Gestaltung und sichtbare Unterschriften – umgesetzt
- M4: Formulare und Kommentare – umgesetzt
- M5: Sicherheit und Kompression – umgesetzt
- M6: eigenständiger Viewer, Textextraktion und OCR – lokal umgesetzt, noch nicht veröffentlicht
- M7: digitale Signaturen – Rust-WASM-Alternative lokal umgesetzt und im Browser positiv/negativ geprüft; unabhängige Reader-/DSS-Gegenprüfung vor Veröffentlichung offen

## Phase 2 – Suite „Rechnen"

**Status:** geplant; Konzept und Machbarkeit belegt, nichts umgesetzt
**Konzept:** [`../03-konzepte/2026-10-03-taschenrechner-suite.md`](../03-konzepte/2026-10-03-taschenrechner-suite.md)
**Entscheidung:** [ADR 0005](../04-entscheidungen/0005-mathjs-rechenkern.md) — mathjs aus kuratierten Factories

Neun Werkzeuge aus achtzehn Rechnerarten (Gruppierung nach Eingabemodell, nicht nach Thema).
Gemessene Grundlage: kuratiertes `mathjs` 89,5 KiB gzip, `function-plot` 64,5 KiB,
`@js-temporal/polyfill` 45,8 KiB (nur nach Feature-Abfrage), `idb-keyval` 2,4 KiB.

**Querschnitt, den jede Welle mitführt:** Manifest, Symbol, Kurzbeschreibung und Suchbegriffe,
Beschreibungen in **drei Sprachen**, Tests, Formel-und-Quelle-Pflichtfelder,
`catalog:generate` und `licenses:generate`.

### Welle 1 – Rechenkern und Hauptrechner

- kuratiertes `mathjs` nach ADR 0005, **ohne** `help`; Zahlenmodell konfiguriert
  (`Fraction` für Brüche, `BigNumber` für Dezimalrechnung)
- Querschnittsbausteine: **Formel und Quelle**, **Verlauf/Variablen/Einstellungen**
- Werkzeug 1 „Rechner" in den Modi **Standard** und **Bruch**

**Abnahme:** `2^3^2` = 512 · `-2^2` = −4 · `2(3+4)` = 14 · `1/3+1/6` = `1/2` ·
`0.1+0.2` = `3/10` (Fraction) beziehungsweise `0.3` (BigNumber) · vollständige
Tastaturbedienung · Verlauf überlebt das Neuladen · **Rechner-Route ≤ 95 KiB gzip** ·
Startbudget unverändert · Prüfung des Artefakts in Edge headless bei zwei Fensterbreiten, hell
und dunkel · `check` und `build` grün.

### Welle 2 – Wissenschaftlich, Programmierer, RPN

- weitere Modi von Werkzeug 1; die vollständige **Funktionsliste** samt Aufruftest je Funktion
  (eine fehlende Factory bricht sonst erst zur Laufzeit)

**Abnahme:** Trigonometrie in DEG/RAD/GRAD · Logarithmen und Potenzen · Bitoperationen mit
Wortbreite 8/16/32/64 und Zweierkomplement · RPN-Stapel · jede gelistete Funktion in einem Test
aufgerufen.

### Welle 3 – Werkzeuge ohne neue Abhängigkeit

- Werkzeug 3 „Kaufmännisch", Werkzeug 8 „Geometrie"

**Abnahme:** Prozent in drei Richtungen, Rabatt, Aufschlag, Marge, MwSt raus/rein, Skonto,
Tilgungsplan · Geometrie-Formeln gegen unabhängige Nachrechnung · jede Formel mit Quelle und
Annahmen sichtbar.

### Welle 4 – Umrechnen und Kalender (erste neue Engine)

- Werkzeug 2 „Umrechnen" (Einheiten und Winkel über `mathjs`-`unit`, Zahlensysteme, Zoll,
  **Kalender**) und Werkzeug 4 „Zeit und Datum"
- `@js-temporal/polyfill` **nur** nach Feature-Abfrage laden

**Abnahme:** Einheiten-Umrechnung inklusive Winkel · Kalender **vorwärts** für alle 18 ·
**Rückweg** für die 13 im Polyfill funktionierenden Kalender, die vier defekten (coptic,
ethiopic, chinese, dangi) ausdrücklich als „nicht unterstützt" gekennzeichnet und **nicht**
stillschweigend falsch · `monthCode` für den Rückweg · Datumsarithmetik inklusive Monats- und
Jahresgrenzen.

### Welle 5 – Mathematik (zweite neue Engine)

- Werkzeug 7 „Gleichungslöser", Werkzeug 6 „Statistik", Werkzeug 5 „Funktionsplotter"
- `function-plot` (64,5 KiB gzip), ausdrücklich als nachgeladenes Modul

**Abnahme:** lineare, quadratische und kubische Gleichungen mit Lösungsweg · Statistik-Kennwerte
gegen Nachrechnung · Plotter mit mehreren Kurven, Wertetabelle, Nullstellen · Datenoptionen
einzeln geprüft (`sampler`-Falle) · Bedienung auch per Tastatur.

### Welle 6 – Aufmaß

- Werkzeug 9 „Aufmaß": Aufmaßzeilen (Mengenermittlung) und Positionen (Menge × Preis), getrennt ·
  eigener Speicherbereich · Ausgabe CSV/PDF/Text · sichtbare Rechenwege

**Abnahme:** Mengenblatt ist nachrechenbar (jede Position zeigt ihre Maße) · Flächen, Längen und
Stückzahlen getrennt summiert · Export in allen drei Formaten geprüft · Preise und Kundendaten
liegen **nicht** im Rechner-Verlauf.

### Nicht in dieser Phase

- Aufmaß-Skizze (Grundriss mit Maßen) — eigener großer Baustein, im Handwerker-Konzept mit **L**
  eingeschätzt
- Preiskatalog oder Kostendatenbank — veraltete Daten und Backend-Arbeit
- symbolische Gleichungslösung über Polynome hinaus (`nerdamer` — 131,4 KiB gzip, Überlappung mit
  `mathjs`, einen Tag alte Major-Version mit Fehler im Prüflauf)
- Währungsrechner — auf Thomas' Wunsch nicht aufgenommen

### Aufwand

**Schätzung nach Referenzklasse, nicht gemessen** — Vergleichsmaßstab sind die Werkzeuge der
Bild- und PDF-Suiten des Projekts, die je Werkzeug eine Sitzung kosteten; Welle 1 trägt zusätzlich
drei Querschnittsbausteine und einen Konfigurationsschritt, Wellen 4 und 5 je eine neue Engine.

| Welle | Sitzungen (grob) |
|---|---|
| 1 Rechenkern und Hauptrechner | 2–4 |
| 2 Weitere Modi | 1–2 |
| 3 Kaufmännisch, Geometrie | 2 |
| 4 Umrechnen und Kalender | 2–3 |
| 5 Mathematik | 2–3 |
| 6 Aufmaß | 2–4 |
| **Summe** | **11–18** |

Die Spanne ist bewusst weit: Die Anzahl der Sprachen, die Prüfpflichten und die Katalogpflege je
Werkzeug sind der größte Unsicherheitsfaktor, nicht die Rechenlogik.

### Voraussetzungen und Risiken

- **Barrierefreiheit aus Phase 3 vorziehen.** Ein Rechner ohne vollständige Tastaturbedienung ist
  kaputt — die Prüfung darf nicht erst nach der Suite kommen. Betrifft mindestens
  Tastaturnavigation, Fokusreihenfolge und Vorlesbarkeit der Anzeige.
- **Startbudget:** `mathjs` darf nie im Startbündel liegen. `bundle-audit.mjs` muss die
  Rechner-Route erfassen; die heutige Prüfung kennt nur das Startbudget und die PDF-Engines.
- **Kuratierte Factories:** fehlende Funktionen brechen zur Laufzeit, nicht beim Bau.
- **Vier defekte Kalender** im Polyfill — Kennzeichnung statt stiller Fehlrechnung.
- **`BigInt` außerhalb von Chromium** ist auf diesem Rechner nicht prüfbar.

## Phase 3 – Plattformqualität

**Status:** offen

- automatisierte Barrierefreiheits- und Offline-Tests
- Performance-Budgets und versionierte optionale Engine-Caches
- sicherer Deployment- und CSP-Standard
- dokumentierter Tool-Generator bzw. Erweiterungsworkflow

## Phase 4 – Weitere Oberflächen und optionale Dienste

**Status:** bewusst zurückgestellt

- Desktop/Mobile erst nach stabiler Webarchitektur
- Konten, Synchronisierung und Cloud-Anbindungen nur mit validiertem Bedarf
- Plugin-/Drittanbieter-Modell erst nach klarer Sicherheits- und Lizenzstrategie

