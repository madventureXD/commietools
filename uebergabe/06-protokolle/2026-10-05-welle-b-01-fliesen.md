# Fortschrittsprotokoll: Welle B der Handwerkerwerkzeuge — Werkzeug 1 „Fliesen, Kleber und Fugenmörtel"

**Datum:** 2026-10-05  
**Status:** abgeschlossen (Werkzeug 1 von 4; Welle B läuft)

## Umfang

Werkzeug 9 des Konzepts `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Welle B „Ausbau"):
Fliesenbedarf, Fugenlänge, Kleber nach Zahnung und Fugenmörtel nach Fugenvolumen. Kette wie in
Welle A: Fachlogik ohne Texte, Texte in drei Sprachen, Manifest und Symbol, Oberfläche, Tests,
Register, Prüflauf, Belegaufnahme am Artefakt.

## Ergebnisse

- **Fachlogik** `packages/tools/src/craft/tiles.ts`: Bestellrechnung über das **Formatmaß**
  (Handelsrechnung), Fugenlänge aus dem Fugenanteil je Fliese, Kleber nach der Zahnungsregel
  („Zahnung halbiert ergibt kg/m²"), Fugenmörtel nach der veröffentlichten Fugenvolumenformel mit
  1600 kg/m³. Fliesen und Säcke werden immer aufgerundet.
- **Keine neue Abhängigkeit.** Reine Rechnung mit `Math`.
- **Zwei Einheitenfehler beim Nachrechnen gefunden und vor dem Test behoben:** die Fugenlänge je m²
  braucht den Faktor 1000 (mm→m), der Fugenmörtel die Division durch 1.000.000. Die Rechenprobe
  (30 × 30 cm, 3 mm Fuge, 8 mm Tiefe, 1600 kg/m³ → 6,667 m Fuge und 0,256 kg je m²) steht im
  Kopf der Datei und im Test gegen eine unabhängig gerechnete Fugenlänge.
- **Beleg am Artefakt** (`work/tiles-shots.cjs`, 10 Aufnahmen): alle Ergebniswerte werden
  zurückgelesen und gegen unabhängige Erwartungen geprüft — 21 m² · 234 Fliesen (Reserve 11) ·
  133,33 m Fugenlänge · 80 kg Kleber (4 Säcke) · 5,1 kg Fugenmörtel (1 Sack); Diagonalverband
  249 Fliesen; Fuge 0 mm → 0 kg Fugenmörtel; 3 × 2 m mit 60 × 60 cm → 18 Fliesen; Fehlerfall
  greift; keine Überbreite bei 1360 und 390 px.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Register | 49 | `npm run catalog:generate` |
| Suchbegriffe | 3.235 | `npm run catalog:generate` |
| Tests | 396 in 25 Dateien, bestanden | `npm run check` |
| Start-JavaScript | 146.624 B gzip (Warnschwelle 204.800; +207 B) | `npm run build` |
| Katalogbasis | 1.225 B gzip (+13 B) | `npm run build` |
| Suchpaket Deutsch | 9.488 B gzip (Warnschwelle 25.600; +204 B) | `npm run build` |
| Werkzeugtexte je Route (Deutsch) | 5.199 B gzip (Warnschwelle 30.720; ±0) | `npm run build` |
| Werkzeugtexte gesamt (Deutsch) | 36.558 B gzip (Warnschwelle 40.960; +1.456 B) | `npm run build` |

## Nebenbefund, der Zeit gekostet hat — und die eigentliche Reparatur dieser Sitzung

Die Belegaufnahme zeigte **`tool.tiles.summary` als Schlüsselnamen** in der Seite. Ursache: Mit der
Aufteilung der Sprachpakete (2026-10-05) liegen `title`, `summary`, `description` und `terms` im
**Suchpaket**; zwölf Werkzeugoberflächen geben ihren Katalog-Kurztext aber über `t('tool.<x>.summary')`
aus und standen seitdem mit dem Schlüsselnamen da — auch die vier Werkzeuge der Welle A.

- **Reparatur an der richtigen Stelle:** `apps/web/src/App.tsx` hängt die vier Katalogschlüssel des
  **aktiven** Werkzeugs in den Übersetzer der Werkzeugroute (der Suchindex ist dort ohnehin geladen).
- **Wächter:** `apps/web/src/catalogue-keys.test.ts` hält die Trennung der Pakete fest und prüft
  für jedes Werkzeug in zwei Sprachen, dass die Katalogschlüssel sich auflösen.
- **Die Funktionsprüfung `work/sprachpaket-funktionspruefung.cjs` sieht jetzt jede Werkzeugroute an**
  (Routen aus dem erzeugten Register, jeder sichtbare Textknoten). Vorher prüfte sie vier Seiten und
  keine einzige Werkzeugroute — deshalb hatte kein Beleg den Fehler gesehen.
- **Prüfung der Prüfung (Mutation):** `catalogueKeys` aus `createTranslator` entfernt, neu gebaut,
  Prüfung laufen lassen → sie meldete auf allen geprüften Routen genau `tool.<x>.summary` und endete
  mit Exit 2. Mutation zurückgenommen, neu gebaut, alle **49 Routen** sauber.
- **Ehrlich benannt:** die Werkzeugrouten-Sammlung über `a[href^="/tools/"]` aus dem DOM ergab
  **null** Routen (die Katalogkarten sind keine Links); die Prüfung lief damit einmal grün durch,
  ohne eine Werkzeugseite anzusehen. Die Routen kommen jetzt aus `catalog/toolIndex.ts`, und die
  Prüfung bricht ab, wenn weniger als 40 Routen gefunden werden.

## Relevante Verweise

- Commit: siehe Übergabe der Welle
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Werkzeug 9, Klasse a)
- Belege: `07-pruefung/sprachpaket/funktionspruefung.txt` (alle 49 Routen),
  `uebergabe/06-protokolle/screenshots/2026-10-05-welle-b/` (10 Aufnahmen)
- ADR: 0010 (Werkzeugtexte je Werkzeug und je Sprache)

## Folgemaßnahmen

- [ ] Werkzeug 2 der Welle B: Farb-, Tapeten- und Beschichtungsrechner (`paint`)
- [ ] Beim Abschluss der Welle: `01-stand/aktueller-stand.md`, `01-stand/offene-punkte.md`,
      Übergabe und Gesamtbericht
- [ ] Der Befund gehört in die Übergabe: die Sprachpaket-Aufteilung hatte zwölf Werkzeuge sichtbar
      beschädigt, ohne dass `check` oder `build` etwas meldeten
