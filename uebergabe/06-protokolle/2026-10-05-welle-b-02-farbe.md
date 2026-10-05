# Fortschrittsprotokoll: Welle B der Handwerkerwerkzeuge — Werkzeug 2 „Farbe, Tapeten und Beschichtung"

**Datum:** 2026-10-05  
**Status:** abgeschlossen (Werkzeug 2 von 4; Welle B läuft)

## Umfang

Werkzeug 10 des Konzepts `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Welle B „Ausbau"):
Netto-Wandfläche mit Abzügen, Farbbedarf nach Ergiebigkeit und Anstrichzahl, Tapetenbedarf in
Bahnen mit Rapportversatz. Kette wie bei Werkzeug 1.

## Ergebnisse

- **Fachlogik** `packages/tools/src/craft/paint.ts`: Wandfläche aus Umfang × Höhe, Abzüge über
  Türen, Fenster und einen weiteren Abzug; Farbbedarf über Ergiebigkeit und Anstrichzahl mit
  aufgerundeten Gebinden; Tapetenbedarf in **Bahnen** — nutzbare Breite geteilt durch Bahnbreite,
  Zuschnitt je Bahn auf den Ansatzschritt des Musters aufgerundet, Bahnen je Rolle abgerundet,
  Rollen aufgerundet, Verschnitt ausgewiesen.
- **Keine neue Abhängigkeit.** Reine Rechnung mit `Math`.
- **Der Kern des Werkzeugs ist die Bahnenrechnung.** Der Beleg zeigt es in Zahlen: derselbe Raum
  braucht ansatzfrei **5 Rollen**, mit geradem Rapport 0,64 m **7 Rollen** — eine reine
  Quadratmeterrechnung hätte den Bedarf nicht erkannt.
- **Muster wird ehrlich gerechnet:** der Zuschnitt ist immer ein Vielfaches des Ansatzschrittes
  (Rapportlänge, halbe Rapportlänge bei halbversetztem Muster, kein Schritt bei ansatzfrei). Der
  Werkzeugtext sagt ausdrücklich, dass damit für **jede** Bahn der passende Anschnitt reserviert
  wird — die günstigere Aufteilung zeigt sich erst an der Wand; das ist die vorsichtige Zahl.
- **Beleg am Artefakt** (`work/paint-shots.cjs`, 8 Aufnahmen): alle Ergebniswerte zurückgelesen und
  gegen unabhängige Erwartungen geprüft — 28,8 m² roh − 3,5 m² = 25,3 m² · 9,9 m nutzbare Breite ·
  Zuschnitt 2,5 m → 19 Bahnen, 5 Rollen · 3,61 l je Anstrich, 7,23 l gesamt, 2 Gebinde ·
  Rapport 0,64 m → Zuschnitt 2,56 m, 7 Rollen. Fehlerfall (Abzüge über der Wandfläche) greift,
  keine Überbreite bei 1360 und 390 px, **kein Sprachschlüssel auf der Seite** (Prüfung aus dem
  Befund von Werkzeug 1), Suchgegenprobe mit sinnlosem Wort liefert null Treffer.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Register | 50 | `npm run catalog:generate` |
| Suchbegriffe | 3.312 | `npm run catalog:generate` |
| Tests | 408 in 26 Dateien, bestanden | `npm run check` |
| Start-JavaScript | 146.695 B gzip (Warnschwelle 204.800; +278 B) | `npm run build` |
| Katalogbasis | 1.239 B gzip (+27 B) | `npm run build` |
| Suchpaket Deutsch | 9.720 B gzip (Warnschwelle 25.600; +436 B) | `npm run build` |
| Werkzeugtexte je Route (Deutsch) | 5.199 B gzip (Warnschwelle 30.720; ±0) | `npm run build` |
| Werkzeugtexte gesamt (Deutsch) | **38.193 B gzip** (Schwelle 40.960; +3.091 B) | `npm run build` |

**Vorwarnung, ausdrücklich:** Die **Summe** der Werkzeugtextpakete je Sprache liegt mit zwei
weiteren Werkzeugen der Welle voraussichtlich über der zweiten Schwelle (40.960 B). Diese Summe ist
ausdrücklich **informativ** — sie ist nicht die Last eines Besuchs, weil jede der 51 Dateien einen
eigenen gzip-Kopf trägt und ein Besuch **ein** Werkzeug lädt (Last je Route unverändert 5.199 B von
30.720). Bei Überschreitung ist die Schwelle zu begründen oder anzuheben, nicht stillschweigend zu
reißen.

## Relevante Verweise

- Commit: siehe Übergabe der Welle
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Werkzeug 10, Klasse a)
- Belege: `uebergabe/06-protokolle/screenshots/2026-10-05-welle-b/` (Aufnahmen 11–18),
  `07-pruefung/sprachpaket/funktionspruefung.txt` (alle Werkzeugrouten)

## Folgemaßnahmen

- [ ] Werkzeug 3 der Welle B: Trockenbaurechner (`drywall`)
- [ ] Werkzeug 4 der Welle B: Parkett-, Laminat- und Bodenbelagsrechner (`flooring`)
- [ ] Schwelle der Werkzeugtextsumme nach dem Wellenabschluss bewerten (anheben mit Begründung
      oder weiter aufteilen)
