# ADR 0013: M9 veröffentlicht keine unbelegte PDF/A- oder Office-Konvertierung

**Datum:** 2026-10-04
**Status:** angenommen; Gate abschließend bewertet
**Nummer nachvergeben am 2026-10-07 (Faber):** Diese Entscheidung stand bis dahin fälschlich unter
**0006** — derselben Nummer wie
[`0006-voller-wert-und-genauigkeitsampel.md`](0006-voller-wert-und-genauigkeitsampel.md). Zwei
angenommene Entscheidungen unter einer Nummer lassen sich nicht auflösen; von beiden trug diese die
weniger Verweise und wandert deshalb. Der ursprüngliche Inhalt unten ist **unverändert**; der alte
Pfad [`0006-m9-konformitaetsgate.md`](0006-m9-konformitaetsgate.md) führt als Weiterverweisakte
weiter hierher.

## Kontext

PDF/A-Konformität und originalgetreue Office-Konvertierung sind überprüfbare Produktversprechen. Eine PDF/A-Kennung im XMP beweist keine Konformität. veraPDF implementiert die formalen PDF/A-Regeln, wird offiziell aber als Java-Anwendung beziehungsweise Java-Bibliothek bereitgestellt.

Für DOCX, XLSX und PPTX existieren inzwischen grundsätzlich lokale Browserpfade: LibreOffice dokumentiert einen Emscripten-Build, und ZetaOffice/zetajs demonstriert lokale PDF-Konvertierung. Der derzeitige vollständige ZetaOffice-Laufzeitpfad umfasst jedoch ungefähr 154 MB WASM plus 95 MB Laufzeitdaten, benötigt COOP/COEP und besitzt im Projekt noch keinen reproduzierbaren Artefakt-, Schrift- und visuellen Referenztest. OnlyOffice-x2t-WASM ist ein weiterer Kandidat, aber ebenfalls noch nicht gegen das CommieTools-Lizenz-, Artefakt- und Layoutgate geprüft.

MuPDF.js bietet dagegen eine offizielle destruktive Redaktionsfunktion: Redact-Annotationen werden angewendet und betroffene Inhalte entfernt, statt nur überzeichnet zu werden.

## Entscheidung

- CommieTools bietet einen klar als unverbindlich bezeichneten PDF/A-Vorcheck an. Er liest Kennung und offensichtliche technische Merkmale, behauptet aber weder Gültigkeit noch Konvertierung.
- Eine echte PDF/A-Prüfung oder -Konvertierung bleibt gesperrt, bis ein lokal ausführbarer, lizenzierter und unabhängig geprüfter Validator-/Konverterpfad vorliegt.
- Office-Konvertierung bleibt gesperrt, bis eine rein lokale Engine mit realen Referenzdateien und klar definierter unterstützter Teilmenge besteht.
- Sichere Schwärzung wird mit MuPDF lokal umgesetzt und durch Negativtests auf entfernten Text abgesichert.
- Serverseitige oder proprietäre Upload-Dienste sind kein Fallback.

## Quellen

- https://docs.verapdf.org/validation/
- https://docs.verapdf.org/develop/
- https://mupdfjs.readthedocs.io/en/latest/how-to-guide/annotations/redactions/index.html
- https://github.com/LibreOffice/core/blob/master/static/README.wasm.md
- https://github.com/allotropia/zetajs
- https://github.com/cryptpad/onlyoffice-x2t-wasm
