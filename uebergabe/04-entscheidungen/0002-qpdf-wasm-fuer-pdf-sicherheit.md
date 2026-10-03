# ADR 0002: QPDF-WASM für PDF-Sicherheit und Strukturkompression

**Status:** angenommen  
**Datum:** 2026-10-03

## Kontext

M5 benötigt AES-256-Verschlüsselung, zuverlässige Entschlüsselung und inhaltsbewahrende PDF-Strukturkompression vollständig im Browser. Eine eigene Kryptografie- oder PDF-Verschlüsselungsengine wäre sicherheitskritisch und widerspräche ADR 0001.

## Kandidaten

- offizielles QPDF: gepflegt, Apache-2.0, bewährte Verschlüsselungs- und Transformationsfunktionen; benötigt Browser-WASM-Verpackung
- `@neslinesli93/qpdf-wasm`: QPDF 12.2.0, reproduzierbarer Docker-/Emscripten-Build, Browser-Dateisystem, TypeScript-Typen, keine transitiven npm-Abhängigkeiten
- `qpdf-wasm`: neuer alternativer Wrapper, größer und mit weniger dokumentierter Browserintegration
- MuPDF.js: bereits in M4 vorhanden, aber für diesen Meilenstein weniger klarer CLI-/Berechtigungsumfang als QPDF

## Entscheidung

CommieTools verwendet `@neslinesli93/qpdf-wasm` 0.3.0 mit QPDF 12.2.0. Die Engine wird ausschließlich auf M5-Routen geladen. Das WASM liegt im versionierten PDF-Laufzeitcache und nicht im PWA-Vorabcache.

Das npm-Paket allein genügt nicht für die Lizenztransparenz, weil das WASM QPDF, zlib und jpeg-turbo enthält. Deshalb wird das Binärartefakt mit Dateigröße, SHA-256, Upstream-Versionen/-Commits, Buildquelle, Werkzeugzuordnung und allen vollständigen SPDX-Lizenztexten registriert und auf der Webseite veröffentlicht.

## Folgen

- Keine eigene Kryptografieimplementierung.
- Ausschließlich AES-256 für neu geschützte PDFs; keine schwachen RC4-Modi.
- Berechtigungsflags werden nicht als unüberwindbarer Kopierschutz versprochen.
- QPDF-Kompression wird als Strukturkompression bezeichnet; Bildoptimierung ist separat und verlustbehaftet gekennzeichnet.
- Updates des Wrappers oder WASM schlagen bei abweichender Prüfsumme im Lizenzcheck sichtbar auf und erfordern eine erneute Komponentenprüfung.
