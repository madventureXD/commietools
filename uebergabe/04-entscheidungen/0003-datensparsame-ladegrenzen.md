# ADR 0003: Datensparsame Ladegrenzen

## Status

Angenommen am 2026-10-03.

## Kontext

Der allgemeine Werkzeugeinstiegspunkt reexportierte PDF-Funktionen und machte dadurch MuPDF,
QPDF und pdf-lib bereits von der Startseite statisch erreichbar. Das widerspricht der Maxime, dass
Nutzer nur für tatsächlich verwendete Fähigkeiten Daten übertragen müssen.

## Entscheidung

Allgemeine Register-, Such- und Shell-Module bleiben frei von schweren Verarbeitungsengines.
Werkzeuge importieren Engines über explizite, routenlokale Einstiegspunkte. Der Produktionsbuild
prüft die statische Importkette der Startseite sowie ein komprimiertes Größenbudget und bricht bei
einer Verletzung ab.

Sprachmodelle, optionale Worker, Zusatzschriften, Beispiele und Offline-Pakete unterliegen derselben
Regel. Sie werden erst nach einer passenden Nutzeraktion geladen.

## Folgen

- Start- und Fremdwerkzeugrouten übertragen keine PDF-Engines.
- Neue Tools benötigen klar sichtbare Ladegrenzen.
- Gemeinsame Sammel-Exporte dürfen nur leichte, allgemein benötigte Module enthalten.
- Build-Budgets und Sperrlisten müssen bei neuen Engine-Klassen gepflegt werden.
