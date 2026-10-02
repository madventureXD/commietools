# Fortschrittsprotokoll: Werkzeug „Bild skalieren"

**Datum:** 2026-10-03 (Sitzung begann am 2026-10-02)  
**Status:** abgeschlossen

## Umfang

Zweites Werkzeug der Bild-Suite: Skalieren, Zuschnitt, Drehen und Spiegeln von JPEG-, PNG-
und WebP-Dateien, vollständig auf dem Gerät. Umfasst Geometrie-Logik, Darstellungsweg,
Oberfläche, Übersetzungen, Manifest, Suitenzuordnung, Tests, Lizenzdatenbank und
Dokumentation.

## Ergebnisse

- Geometrie in `packages/tools/src/image/resize/resize.ts`, ohne Fremdabhängigkeit:
  Zielgröße nach Maßen oder Prozent, Seitenverhältnis-Sperre, Zuschnittbegrenzung,
  Vierteldrehungen, Spiegelung, Vorschaumaß und Rahmenanteile.
- Fester Ablauf, damit Vorschau, eingegebene Zahlen und Ergebnis nicht auseinanderlaufen
  können: **Ausrichtung (Drehen, dann Spiegeln) → Zuschnitt → Skalierung.** Der Zuschnitt
  bezieht sich immer auf das ausgerichtete Bild; eine Drehung setzt ihn deshalb zurück.
- Darstellung in `apps/web/src/tools/imageResizeRender.ts`: Ausrichtung über Canvas, Zuschnitt
  über Canvas, Skalierung über `pica` mit hochwertiger Filterung, Ausgabe als Blob.
- Oberfläche als Vier-Schritt-Fluss mit Live-Vorschau, Zuschnittrahmen über dem Bild,
  Zahlenfeldern für den Zuschnitt, Vierteldrehungen, Spiegelungen, Prozent- oder Maßvorgabe,
  Qualitätsregler und Ergebnisbild mit Speicherverweis.
- Grenze von 10.000 Pixeln je Kante wird **gemeldet**, nicht still angewandt.
- Bei gesperrtem Seitenverhältnis zeigt das zweite Feld den abgeleiteten Wert, damit
  Anzeige und Ergebnis nicht widersprechen.
- Deutsch und Englisch vollständig.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Tests bestanden | 40 in 3 Dateien | `npm run check`, Vitest (vorher 22 in 2 Dateien) |
| Lizenzierte Pakete | 478 | `npm run licenses:check` (vorher 475) |
| Neue Laufzeitabhängigkeiten | 3 | `pica` 10.0.3, `glur` 2.0.0, `multimath` 3.0.0 – alle MIT |
| Hauptbundle | 412,43 kB (125,18 kB komprimiert) | `npm run build` |
| Zuwachs durch die Abhängigkeit | +71,08 kB roh, +21,27 kB komprimiert | Vergleich der Bauausgaben vor/nach dem Einbau |
| Stylesheet | 14,32 kB (3,37 kB komprimiert) | `npm run build` |
| Vorab-Cache | 8 Einträge, 1.308,87 KiB | `npm run build` |

## Belege außerhalb der Testreihe

- **Echter Browser** (Edge headless über das DevTools-Protokoll), mit einer echten
  3840 × 2400 großen JPEG-Datei von 1,3 MB:
  Datei ausgewählt, Vorschau gezeichnet, Breite auf 800 gesetzt, Ergebnis **800 × 500**
  (Seitenverhältnis erhalten), verarbeitet, gespeichert. Die erzeugte Datei wurde
  anschließend **im selben Browser dekodiert und war 800 × 500 px groß** bei 54,7 kB.
  Drehung um 90° ergab eine Vorschau von 2400 × 3840. Keine Konsolenfehler.
- **Zuschnittrahmen bei zwei Fensterbreiten gemessen** (1360 px und 420 px): Die Anteile des
  Rahmens entsprachen in beiden Fällen dem eingestellten Zuschnitt (Abweichung unter 0,004,
  erklärt durch die 2 px breite Rahmenlinie).
- **Eigener Fehler gefunden und behoben:** Der Rahmen war zuerst in Vorschaupixeln
  positioniert. Sobald die Vorschau per CSS schmaler wurde, hätte er nicht mehr zum Bild
  gepasst. Er rechnet jetzt in Anteilen des Bildes; zusätzlich läuft die Vorschau auf
  schmalen Bildschirmen nicht mehr über.
- **Prüfhindernis, kein Produktfehler:** Der Service-Worker der PWA lieferte nach einem
  Neubau die zwischengespeicherte alte Programmfassung aus, wodurch die neue Route fehlte.
  Die Prüfung entfernt den Service-Worker und die Caches jetzt vor jedem Durchlauf und
  vergleicht die geladene Bündeldatei mit der gebauten.
- **Korrektur einer früheren Angabe:** Im Konzept stand für `pica` eine Bundle-Last von
  „~15 kB komprimiert" (aus der Paketangabe hochgerechnet). Gemessen sind es **21,27 kB**
  inklusive der beiden Hilfspakete und des eingebetteten Worker-Codes.

## Relevante Verweise

- Commit: `b0809d2` – Logik, Darstellung, Oberfläche, Tests, Manifest, Übersetzungen, README
  und Lizenzdatenbank
- Konzept: [`../03-konzepte/2026-10-02-bild-suite.md`](../03-konzepte/2026-10-02-bild-suite.md),
  Abschnitt „Umsetzungshinweis: zweites Werkzeug"
- Übergabe: [`../05-uebergaben/2026-10-03-image-resize.md`](../05-uebergaben/2026-10-03-image-resize.md)
- Grundlage: keine neue Architekturentscheidung nötig. Die Abweichung vom Konzept (Anwendung
  statt eigener Skalierung) ist im Konzept begründet.

## Folgemaßnahmen

- [ ] Für eine strenge Content-Security-Policy den Teilbau von `pica` verwenden, damit der
      Worker keine Blob-Adresse braucht (siehe offener Punkt „CSP").
- [ ] Ziehen des Zuschnittrahmens mit der Maus ergänzen – die Zahlenfelder bleiben der
      verbindliche Weg.
- [ ] Zuschnitt-Voreinstellungen (feste Seitenverhältnisse) prüfen.
