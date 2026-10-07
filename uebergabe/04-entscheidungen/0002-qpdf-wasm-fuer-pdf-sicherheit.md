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

*Nachtrag 2026-10-07 (Faber, Karte M2-004).* Die Aussage „Die Engine wird **ausschließlich auf
M5-Routen** geladen" ist zu eng und wird hiermit richtiggestellt; der Ursprungstext bleibt stehen.

Tatsächlich genutzte Funktionen und Aufrufer:

| Fachaktion | Funktion | Aufrufer |
|---|---|---|
| PDF schützen | `protectPdf` (`pdf/m5.ts`) | Werkzeug `pdf-security` |
| PDF entsperren | `unlockPdf` (`pdf/m5.ts`) | Werkzeug `pdf-security` |
| Strukturkompression | `compressPdf` (`pdf/m5.ts`) | Werkzeug `pdf-compress` |
| **PDF reparieren** | `repairPdfWithQpdf` (`pdf/m5.ts:100`) | `pdf/m8.ts:3` (Import), `pdf/m8.ts:46` (Aufruf) → Werkzeug `pdf-repair` |

- **Eine** Importstelle der Engine: `packages/tools/src/pdf/m5.ts:1`
  (`@neslinesli93/qpdf-wasm ^0.3.0`, QPDF 12.2.0). Beide Werkzeugpfade laufen damit über
  **dieselbe** Engineversion.
- **Ladegrenze:** Der Engine-Adapter liegt hinter den eigenen Werkzeugeinstiegen
  (`packages/tools/package.json` → `./pdf/m5`, `./pdf/m8`), die die Oberfläche erst mit der
  Werkzeugroute lädt. Er wird **nicht** über `packages/tools/src/index.ts` reexportiert und ist
  nicht statisch vom Start erreichbar (`scripts/bundle-audit.mjs`, Engine-Klasse mit
  `staticBudget: 0`).
- Der Engine-Adapter ist eine **gemeinsame technische Zuständigkeit**; die Fachaktionen
  (Schützen, Entsperren, Komprimieren, Reparieren) bleiben getrennt.
- Herkunft, Lizenz und Versionsbindung werden **nicht hier** geregelt, sondern im Lizenzregister
  (`licenses/registry.json`, Komponente samt Hash) und in der R1-Übergabe
  (`../05-uebergaben/2026-10-06-r1-sanierungsleitfaden.md`); das Offlineverhalten in R3.

Abnahme und Messung: `../06-protokolle/2026-10-07-r7-m2-004-qpdf-anwendungsbereich.md`.
