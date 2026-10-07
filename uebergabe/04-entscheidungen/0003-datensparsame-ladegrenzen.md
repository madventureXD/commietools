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

*Nachtrag 2026-10-07 (Faber, Karte M2-002).* Präzisierung der **tatsächlichen** Politik; der
vorstehende Text bleibt unverändert. Zwei Klassen von Prüfungen, zwei Folgen:

| Klasse | Was | Folge |
|---|---|---|
| **Strukturelle Regel** | schwere Engine statisch vom Start erreichbar; optionales Sprachpaket statisch erreichbar; Sprachpaket vorab gecacht; PDF-Engine im Vorabcache | **harter Fehler** — der Bau bricht ab (`scripts/bundle-audit.mjs`, `throw`) |
| **Größenbudget** | Startgröße, Katalogbasis, Suchsprache, Werkzeugtexte, UI-Texte, mathjs-Route | **Warnung** — `WARNUNG:` auf der Ausgabe, der Bau läuft weiter (Exit 0) |

Die Größe ist damit eine **Warnschwelle**, kein Verbot (Thomas' Entscheidung). Das Skript
**ändert die Referenzdatei `scripts/bundle-size-baseline.json` nie selbst** — sie ist eingecheckt und
wird nur gelesen; eine Warnung verschwindet also nicht dadurch, dass sie sich still nachzieht.
Jede Warnung trennt in der Ausgabe **Messwert**, **Warnschwelle** und **Abweichung zur
Referenz** und wird sichtbar in Übergabe und Release geführt, aber nicht über eine generische
„Warnungen sind Fehler"-Regel in ein Größenverbot umgedeutet.

Belegt am 2026-10-07 durch zwei Gegenproben (künstliche Überschreitung ⇒ Warnung, Bau grün;
unerlaubter statischer Engine-Import ⇒ harter Fehler) — Protokoll
`../06-protokolle/2026-10-07-r7-m2-002-groessenpolitik.md`.
