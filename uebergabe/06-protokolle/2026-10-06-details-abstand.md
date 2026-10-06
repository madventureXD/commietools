# Fortschrittsprotokoll: Abstand in den aufklappbaren Abschnitten der Werkzeugflächen

**Datum:** 2026-10-06  
**Status:** abgeschlossen

## Umfang

Der in der Welle-C-Übergabe notierte Stilbefund: „Bei Pflaster und Reifen sitzt die erste
Feldspalte auf der Zeile der Zusammenfassung, das Eingabefeld darunter." Betrachtet wurden **alle**
Werkzeugoberflächen mit `details className="settings-card"` — nicht nur die beiden genannten neuen
Werkzeuge. Gemessen wurde bei 1360 px und 390 px in Edge headless über CDP gegen `npm run preview`.

Anleitungen vor der Arbeit gelesen: `uebergabe/02-architektur/werkzeug-erstellen.md` (Abschnitt 5,
Abnahme), `uebergabe/02-architektur/sprachpakete.md` (keine Textänderung berührt),
`docs/ui-system.md` (Abschnitt „Accessibility baseline").

## Ergebnisse

- **Es war keine Überlappung, sondern ein fehlender Abstand.** Gemessene Überlappung zwischen
  Kopfzeile und folgendem Inhalt: **0 px** auf allen geprüften Routen, in beiden Breiten. Falsch war
  die Beschreibung „sitzt auf der Zeile der Zusammenfassung" — richtig ist: Wo dem `summary`
  **direkt** das Formularraster folgt, beginnt dieses auf der Unterkante der Kopfzeile
  (Abstand **0 px**), während Abschnitte mit einer Hinweiszeile dazwischen **36 px** zeigen. Die
  Beschriftung des ersten Feldes sieht dadurch aus wie ein Teil der Zusammenfassung.
- **Drei Abschnitte betroffen, nicht zwei:** `Paving.tsx:168`, `Tires.tsx:140` **und**
  `Paint.tsx:155` (Welle B). Ein Vorbefund also, nicht von Welle C erzeugt — ohne den Vergleich mit
  einem Werkzeug der Wellen A/B wäre der fremde Anteil entweder verschwiegen oder sich selbst
  zugeschrieben worden.
- **Behoben an einer Stelle statt in den Werkzeugen.** Von den 30 aufklappbaren Abschnitten in 19
  Dateien liegt bei 16 eine Hinweiszeile (`p.scan-note`) direkt nach der Kopfzeile, bei 11 ein `h3`
  (mit eigenem Abstand) und bei **3** das Raster. Eine Regel im gemeinsamen Baustein:
  `details.settings-card > summary + .form-grid { margin-top: var(--space-4); }` in
  `apps/web/src/styles.css`. Der Abstand entspricht damit genau dem Zeilenabstand des Rasters
  (`gap: var(--space-4)`) — die erste Zeile sitzt so weit unter der Kopfzeile wie die Zeilen
  zueinander.
- **Keine Regression:** In den Abschnitten mit Hinweiszeile (Tiles, Concrete) blieb der Abstand
  Kopfzeile → erste Beschriftung unverändert bei 36 px; die Höhe der Abschnitte ändert sich dort
  nicht. Geändert hat sich nur die Höhe der drei betroffenen Abschnitte (gemessen: Paving
  343 → 359 px, Tires 233 → 249 px, je **+16 px**). Für **Paint** liegt keine Vorher-Aufnahme vor
  — die Aufnahmeserie vor der Änderung umfasste Paving, Tires, Tiles und Concrete; die Höhe nach der
  Änderung beträgt 427 px, ein Vorher-Wert ist nicht belegt und wird deshalb nicht genannt.
- **Gesonderter Befund, bewusst nicht mitbehoben:** Der anklickbare `summary` ist rund **21 px**
  hoch. `docs/ui-system.md` verlangt 44 px Mindestgröße für Bedienziele; derselbe Baustein nutzt
  beim Werkzeugmenü `min-height: 3rem`. Das betrifft alle 30 Abschnitte und jede Werkzeugfläche und
  ist damit ein eigener Auftrag (siehe offene Punkte).

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Aufklappbare Abschnitte gesamt | 30 in 19 Dateien | `work/details-inhalt-zaehlen.cjs` |
| davon „Raster direkt nach Kopfzeile" | 3 (Paving, Tires, Paint) | dieselbe Zählung |
| Abstand Kopfzeile → erste Beschriftung, vorher | 0 px | `messung-vorher.txt` |
| Abstand Kopfzeile → erste Beschriftung, nachher | 16 px | `messung-nachher.txt` |
| Abstand in Abschnitten mit Hinweiszeile, vorher/nachher | 36 px / 36 px | dieselben Belege |
| Überlappung Kopfzeile/Inhalt | 0 px in beiden Breiten | dieselben Belege |
| Höhe `summary` (Bedienziel) | 21 px von 44 px gefordert | `messung-nachher.txt`, `docs/ui-system.md` |
| Tests | 440 in 30 Dateien bestanden | `npm run check` |
| Testsuiten/Lint/Build | `npm run check` grün, `npm run build` EXIT 0 | `ct-check-layout-1.log`, `ct-build-layout-1.log` |
| Startlast | 146.990 B gzip von 204.800 | `npm run build` |
| Größenwarnungen | keine gerissen (Werkzeugtexte je Route 5.199/4.685/5.207 von 30.720 B) | `npm run build` |
| `git diff --check` | keine Whitespace-Fehler | Projektbefehl |

## Relevante Verweise

- Commit/PR: `57d94da` (Regel und Belege), dieser Bericht
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Wellen A–C, Suite „Handwerk")
- ADR: keiner — die Änderung fällt unter `docs/ui-system.md`, nicht unter eine Architekturentscheidung
- Belege: `06-protokolle/screenshots/2026-10-06-details-abstand/` (vier Aufnahmen vorher/nachher,
  zwei Messprotokolle)
- Messwerkzeuge: `work/details-layout-messen.cjs`, `work/details-layout-shots.cjs`,
  `work/details-inhalt-zaehlen.cjs`

## Folgemaßnahmen

- [ ] Bedienzielhöhe der aufklappbaren Kopfzeilen auf 44 px anheben (eigener Auftrag, betrifft
      alle Werkzeugflächen).
- [ ] Spanische Sprachabnahme der zehn Handwerk-Werkzeuge und die Barrierefreiheitsprüfung der
      Suite in einem Durchgang nachziehen.
