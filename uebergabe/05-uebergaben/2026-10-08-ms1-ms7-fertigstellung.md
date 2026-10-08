# Übergabe: MS1–MS7 — lokale Reparaturen und Fertigstellungsbelege

**Datum:** 2026-10-08  
**Bearbeitet durch:** Codex  
**Auftrag:** „Ms1-ms7 komplett durchziehen“; gesamte Umsetzung grundsätzlich freigegeben, Vollzugriff bestätigt.  
**Status:** teilweise

## Ziel der Sitzung

Die 26 offenen Verträge aus der unabhängigen Nachprüfung reparieren, Gegenbelege versionieren und einen konkret prüfbaren Lieferkandidaten herstellen.

## Ergebnis

Lokale Reparaturen für N1–N8, zusätzliche OCR-/QPDF-/Bedienziel-/Reproduzierbarkeitsfehler behoben. Lizenzentscheidungen umgesetzt. Echte Wirkungsproben, Gegenproben, vollständige UI-Grundmatrix und frischer Clone ausgeführt. Paket: [MS1–MS7](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/README.md). Unabhängige A2, Konto-/Geräte-/Fach- und vollständige D/E-Abnahmen bleiben offen; keine Gesamtfreigabe behauptet.

## Geänderte Bereiche

- Lizenz-/Rust-Skripte, Register, Hinweisdateien und gebundene Entscheidungen.
- PdfSplit, Ergebnis-URL-Eigentum, OCR-Worker, Offlinecache und Ladefehlermeldung.
- Rohtextvalidator, Modalmenü-Prüfer und Tastaturgrenzen, Lizenz-/Impressum-Bedienziele.
- QPDF-Reparatur, P12/DSS-Wirkungsgates, workflow_dispatch/Action-SHAs/Pflichtaggregation.
- Referenz-WASM-Bau, portabler Dist-Dienst, versionierte Browser-/Mutations-/Clone-/Headerbelege und vier Archivfassungen.

## Entscheidungen und Annahmen

Die ausdrückliche Pauschalfreigabe gilt fort. Zlib/Unicode-Ausnahmen exakt gebunden; CMS/P12-Hinweise bis 2026-11-08 befristet. Keine allgemeine Lizenzrichtlinienerweiterung. OP-062 erhält die Archivvariante. Windows ist Referenz für Binary-Reproduzierbarkeit; anderer Checkoutpfad auf demselben Computer ist kein Zweitrechnerbeleg. NEL Weg A bleibt erhalten.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | Ausgeführt, Exit 0: 54 Dateien/730 Vitest-Tests, zwei Policy-Tests und drei Lizenzmutanten; 111 Warnungen, keine Lint-Fehler |
| `npm run build` | Ausgeführt, Exit 0; Bündelwarnungen erhalten |
| Rust nativ | Ausgeführt, Exit 0: 12 Unit- und 38 Integrationstests bestanden; fünf bewusst ignorierte Tests bleiben ausgewiesen |
| UI-Grundmatrix | 65 Routen × 1360/390 px × light/dark bestanden; Reflow 65 Routen bei 320 px bestanden |
| QPDF/P12/OCR/Offline | Echte Browserwirkung unter lokaler Liefer-CSP ausgeführt; Details/Hashes im Belegpaket |
| Frischer Clone | npm ci/check/build ohne QM/work bestanden, eigener WASM-Bau bytegleich; Kandidatenüberlagerung ausdrücklich genannt |
| Basiskriterien | `node scripts/belege/fertigstellung-basis.mjs`, Exit 0: 59 Karten, 23 Quellen, acht D/E-Routen unverändert |

Maßgeblich sind [proof-results.json](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/proof-results.json) mit 18 erfolgreichen lokalen Stufen und drei Zusatzbelegen sowie der ausdrücklich ausgewiesenen Check-Korrektur. Der abschließende Tastaturdurchlauf besteht mit sieben Gruppen und 278 Tab-Ereignissen. OP-062 wurde regelgerecht archiviert; anschließend vollständiger Root-Check/Build und Workflowprüfung bestanden. Fehlgeschlagene Vorversuche bleiben im Paket beschrieben. Konto-/Geräte-/Gesamtabnahme wird dadurch nicht behauptet.

## Offene Punkte und Risiken

Unabhängige A2 und Kontokopplung fehlen; reale Geräte-/Vorleser-/Fachprüfung, Foto-/Übergabe-Originalkriterien, weitere Offline-/Locale-/Altprofile sind offen. RSA ohne Fix und ttf-parser-Wartungshinweis verlangen unabhängige Bewertung. Öffentlicher CSP-Stand entspricht noch nicht dem lokalen Kandidaten. Hinweis-Ausnahmen laufen am 2026-11-08 ab. Originale 59-Karten-Basis bleibt unverändert; kein Häkchen ersetzt fehlende Messung.

## Empfohlener nächster Schritt

Das konkrete Kandidaten-/Belegpaket unabhängig kontrollieren, fehlende Personen/Geräte/Kontozugänge bereitstellen und die aufgeführten Restabnahmen durchführen. Danach echte Pflichtläufe und kontrollierte Auslieferung desselben Artefakts; keine erneute routinemäßige Arbeitsgenehmigung erforderlich.

## Git

Basisrevision: `556159f58ac3beac3b6349851dae7326558b7fbb`. Nichts committet und nichts gepusht. Arbeitsbaum enthält die beauftragten Änderungen; Kandidatenmanifest weist dies ausdrücklich aus. Kein Deployment in dieser Sitzung.
