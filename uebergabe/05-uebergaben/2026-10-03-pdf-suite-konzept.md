# Übergabe: Umsetzungskonzept für die PDF-Suite

**Datum:** 2026-10-03  
**Bearbeitet durch:** Codex  
**Status:** abgeschlossen

## Ziel der Sitzung

Eine belastbare Roadmap für alle 15 PDF-Werkzeuge erstellen, einschließlich Open-Source-Basis, Reihenfolge, gemeinsamer Architektur, Risiken und Freigabekriterien.

## Ergebnis

Das Konzept `03-konzepte/2026-10-03-pdf-suite.md` beschreibt vier Entwicklungsphasen und acht Meilensteine von M0 bis M7. Gemeinsamer PDF-Kern, optionale Engines, Offline-Artefakte und Sicherheitsgrenzen werden vor den einzelnen Werkzeugen festgelegt. Sichtbare Unterschriften und kryptografische Zertifikatssignaturen sind ausdrücklich getrennt.

## Geänderte Bereiche

- `uebergabe/03-konzepte/2026-10-03-pdf-suite.md` – vollständiges Konzept
- `uebergabe/01-stand/roadmap.md` – Phase 1 konkretisiert und verlinkt
- `uebergabe/01-stand/offene-punkte.md` – nächster Schritt auf Konzeptfreigabe und M0 geändert

## Entscheidungen und Annahmen

- Das Konzept ist `in-pruefung`, nicht automatisch freigegeben.
- Phase A verwendet voraussichtlich PDF.js und `pdf-lib`, aber erst nach einem realen Kompatibilitätsprototyp.
- QPDF, MuPDF und Tesseract werden nicht vor ihren Qualitäts- und Lizenzgates eingebunden.
- Werkzeuge 14 und 15 benötigen ein eigenes Sicherheits-ADR.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| interne Markdown-Verweise | bestanden |
| Codeprüfung | nicht erforderlich; ausschließlich Dokumentation |

## Offene Punkte und Risiken

- [ ] Nutzerfreigabe für Zielumfang und Reihenfolge.
- [ ] M0-Prototyp und Testkorpus durchführen.
- [ ] Exakte Paket- und Artefaktversionen erst nach technischer Prüfung festlegen.

## Empfohlener nächster Schritt

1. Konzept freigeben oder Prioritäten ändern.
2. Danach M0 als eigenen, messbaren Arbeitsschritt durchführen.

## Git

- Commit: siehe Git-Historie dieser Datei
- Arbeitsbaum vor Commit: ausschließlich Konzept- und Übergabedokumentation

