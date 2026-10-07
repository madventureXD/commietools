# Nachtrag zu M3-010 — Werkzeugausgabe folgt dem Formatkontext: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Auftrag:** Thomas, wörtlich: „Ja, mache das nun" — auf meine Frage, ob die 24 Reststellen als eigene
kleine Karte **vor** R7 laufen sollen.
**Status:** **erledigt** — der in R6 gemeldete Befund ist geschlossen.

## Was der Befund war

In R6 wurde der gemeinsame Formatkontext gebaut und **vier** in Karte M3-010 benannte Stellen
umgestellt. **25 weitere Stellen** benutzten weiter die **Oberflächensprache** als Zahlen-Locale.
Damit war die von der Karte bemängelte Inkonsistenz nicht beseitigt, sondern **verschoben**: Auf
einem Gerät mit englischer Region und deutscher Oberfläche zeigten die vier umgestellten Stellen
englisch, alle übrigen deutsch.

## Bestandsaufnahme und Beurteilung

27 Treffer im Baum (davon einer ein Kommentar) → **26 echte Stellen**:

| Beurteilung | Anzahl | Grundlage |
|---|---|---|
| **Anzeige** → Region | 25 | Maße, Flächen, Gewichte, Größen, Bilddaten — das sind Werte für Menschen |
| **technisch** → bleibt Punkt | 1 | `aufmassPdf.ts`: `useGrouping: false` — Exportwert für die Aufmaßliste |

## Umsetzung

- Neu: `apps/web/src/tools/formatContext.ts` mit `anzeigeKontext(uiLocale?)` — macht aus der
  Oberflächensprache den **Anzeige**-Kontext (Region aus `navigator.languages`, dokumentierter Default
  in `createFormatContext`).
- 25 Stellen von `Intl.NumberFormat(locale, …)` auf
  `Intl.NumberFormat(anzeigeKontext(locale).regionLocale, …)` umgestellt (22 Werkzeugdateien).
- **Neuer Prüfer** `scripts/format-audit.mjs` → `npm run format:check`, hängt in `npm run check`.
  Er meldet `Intl.NumberFormat(locale|undefined, …)` und `toLocaleString()`/`toLocaleDateString()`
  **ohne Argument**; die eine technische Ausnahme steht mit Begründung in der Liste.

**Zahlen-Eingabe blieb unberührt** (die Karte verbietet es ausdrücklich: `Intl.NumberFormat` ist
kein Parser).

## Abnahme

| Abnahmepunkt | Ergebnis |
|---|---|
| Anzeige-Stellen ohne Oberflächensprache/navigator | ✓ `format:check` grün: „keine Stelle mit Oberflächensprache oder navigator als Zahlen-Locale (1 begründete Ausnahme)" |
| Gegenprobe des Prüfers | ✓ eine Stelle auf `locale` zurückgestellt → Exit 1 mit Fundstelle; zurückgenommen → Exit 0 |
| UI-Beleg mit **abweichender** Region, zwei Werkzeuge | ✓ siehe unten |

**UI-Beleg** (`work/r6b-format-beleg.cjs`, je Fall frischer Browser, Gerätesprache simuliert):

| Oberfläche | Gerät | Statistik | Geometrie |
|---|---|---|---|
| **deutsch** | en-US | „1,234,567.5" | „1,523,990.25" |
| **spanisch** | de-DE | „1.234.567,5" | „1.523.990,25" |

Das ist die **Umkehrung** der alten Regel: Zahlen folgen der Region, Texte der Sprache.

## Prüfkette

`npm run check` **Exit 0** — 715 Tests in 51 Dateien, 0 Lint-Fehler, `format:check` läuft mit ·
`npm run build` **Exit 0**. Commit `34be880`. Nichts gepusht.

## Fehler auf dem Weg (ehrlich)

1. **Mein erster Umbau war falsch gedacht:** `Intl.NumberFormat(anzeigeKontext(locale), …)` — die
   Funktion will eine Locale, keinen Kontext → 25 × `error TS2769: No overload matches this call`.
   Korrigiert auf `anzeigeKontext(locale).regionLocale`.
2. **Import-Einfügen in mehrzeilige Imports:** 16 × `Parsing error: Identifier expected`, weil die
   neue Importzeile mitten in einen mehrzeiligen Import geriet. Repariert (Einfügen nach dem
   **Abschluss** des letzten Imports).
3. **Beleg-Skript-Fehler:** `Page.addScriptToEvaluateOnNewDocument` ist **kumulativ** — zwei
   registrierte Gerätesprachen liefen gleichzeitig, der zweite Fall zeigte das Format des ersten.
   Behoben: je Fall ein eigener Browserlauf.
4. **Zu enge Prüfregel:** Ich suchte „1.234,5" in der Geometrie-Ausgabe — 1234,5 × 1234,5 ist aber
   „1.523.990,25". Prüfung auf das **Muster** der Region umgestellt.

## Grenzen

- Die Gerätesprache ist im Beleg **simuliert** (kopfloser Browser, `navigator.languages`
  überschrieben) — ein echtes Gerät mit fremder Systemsprache ist damit nicht ersetzt.
- Der Prüfer erkennt die drei genannten Muster. Andere Wege in ein falsches Zahlenformat (eigene
  Formatierfunktionen, `String(number)`) findet er **nicht**.
- Die 25 Stellen wurden auf **einen** Anzeigeweg umgestellt; je Werkzeug gibt es keinen
  Einzelnachweis, sondern den gemeinsamen Beleg über zwei Werkzeuge und den Prüfer.
