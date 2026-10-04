# Fortschrittsprotokoll: Suite „Rechnen" — Welle 6 (Aufmaß)

**Datum:** 2026-10-04
**Status:** abgeschlossen

## Umfang

Letzte Welle der Suite „Rechnen" aus
`03-konzepte/2026-10-03-taschenrechner-suite.md` (Werkzeug 9 „Aufmaß") nach den
Abnahmekriterien der Roadmap. Dazu die Festschreibung der Lösungsklassen a–d für die 24
Handwerker-Vorschläge.

## Ergebnisse

- Werkzeug „Aufmaß" (`/tools/aufmass`) steht in drei Sprachen mit Oberfläche, Manifest, Symbol
  und eigenem Speicherbereich.
- Zwei getrennte Ebenen: Aufmaßzeile (Mengenermittlung aus Maßketten und Formeln) und Position
  (Menge × Einzelpreis). Positionen können ihre Menge aus einer Aufmaßzeile beziehen; dann bleibt
  der Rechenweg im Blatt sichtbar.
- Mengensummen **je Einheit**, nie über Einheiten hinweg.
- Ausgabe als CSV, PDF und Text; die PDF-Engine wird erst beim Auslösen geladen.
- **Keine neue Abhängigkeit.** Eigener Vorrangparser in `BigInt` statt mathjs in der Fachlogik.
- Vier Testfunde und ein Abnahmefund vor der Abgabe behoben: Rückweg über die gerundete Anzeige
  (Betrag um Faktor 1000 zu hoch), gelöschte Quelle als stiller Rückfall, doppeltes Minus,
  Positionseinheit unabhängig von der Aufmaßzeile, PDF-Transliteration.
- Konzept-Nachtrag mit der Klassenzuordnung: 15 × a, 2 × b, 5 × c, 1 × d, 1 × gestrichen.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Katalog | 41 | `npm run catalog:generate` |
| Sprachen | 3 (de, en, es) | ebd. |
| Suchbegriffe | 2.730 | ebd. |
| Deklarierte Dateitypen | 92 | ebd. |
| Tests | 301 in 16 Dateien | `npm run check` |
| Neue Tests dieser Welle | 20 | `apps/web/src/aufmass.test.ts` |
| Start-JavaScript | 136.959 B gzip (+119) | `npm run build` |
| Rechenkern (eigener Chunk) | 102.475 B gzip | ebd. |
| Werkzeugtexte Deutsch | 26.403 B gzip (Schwelle 30.720) | ebd. |
| Neue Dateien | 8 | Commit `7121281` |

## Relevante Verweise

- Commit/PR: `7121281` (Welle 6, Code), `3739f69` (PDF-Ausgabe), `c758284` (Wortlaut und Doku)
- Konzept: `03-konzepte/2026-10-03-taschenrechner-suite.md` (Entwurf Werkzeug 9),
  `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Nachtrag zur Klassenzuordnung)
- ADR: keines — es wurde keine neue Abhängigkeit aufgenommen und keine Architekturfrage
  entschieden, die eine Entscheidung braucht

## Folgemaßnahmen

- [ ] Werkzeugtexte je Sprache aufteilen, bevor die Werkzeugtexte-Schwelle von 30 KiB reißt.
- [ ] Vorbestehenden Befund „Werkzeugseiten schneiden bei 320 px ab" der Shell behandeln.
- [ ] Veröffentlichung von Welle 6 — nur auf ausdrücklichen Auftrag (Push auf `main`).
