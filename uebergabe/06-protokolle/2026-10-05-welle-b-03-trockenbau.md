# Fortschrittsprotokoll: Welle B der Handwerkerwerkzeuge — Werkzeug 3 „Trockenbau"

**Datum:** 2026-10-05  
**Status:** abgeschlossen (Werkzeug 3 von 4; Welle B läuft)

## Umfang

Werkzeug 11 des Konzepts `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Welle B „Ausbau"):
Platten, CW- und UW-Profile, Schrauben, Spachtelmasse, Fugendeckstreifen. Kette wie bei den
Werkzeugen 1 und 2.

## Ergebnisse

- **Fachlogik** `packages/tools/src/craft/drywall.ts`: Platten **in Bahnen** statt aus der Fläche —
  Bahnen über die Wandbreite, Platten je Bahn = Wandhöhe / Plattenlänge aufgerundet, je Lage
  multipliziert, Verschnitt als eigene Zeile. Dazu Ständer und Profile über die Profilmeter,
  UW-Profile über Boden und Decke, Schrauben und Spachtelmasse je m² und Lage, Fugenband aus dem
  Plattenformat.
- **Keine neue Abhängigkeit.** Reine Rechnung mit `Math`.
- **Zwei Modellfehler vor dem Bau gefunden und behoben** (beide im Test als Gegenprobe festgehalten):
  1. **Öffnungen dürfen die Bahnenbreite nicht kürzen.** Der erste Entwurf zog die Öffnungsbreiten
     von der Wandbreite ab — dann deckt die gekaufte Plattenfläche die Wand nicht mehr (8 statt 10
     Bahnen ergeben 26,0 m² Platte für 27,7 m² Wand). Bei Trockenbau wird um Öffnungen
     **herumgeschnitten**, nur die Fläche zählt; bei der Tapete ist es umgekehrt.
  2. **Profile werden über die Profilmeter gekauft.** „Ein Ständer je Profil" ergab 17 Profile für
     17 Ständer, obwohl 54,6 m Profil in 14 Profile passen. Der Rest eines 4-m-Profils bleibt für
     kurze Stücke verwendbar.
- **Beleg am Artefakt** (`work/drywall-shots.cjs`, 8 Aufnahmen, Werte zurückgelesen): 31,2 m² roh −
  3,5 m² = **27,7 m²** · **10 Bahnen** · **20 Platten**, Verschnitt **22,3 m²** · **21 Ständer** →
  54,6 m Profil → **14 CW / 6 UW** · **693 Schrauben** · Spachtel 9,7 kg (1 Sack, 15,31 kg darüber)
  · Band 36,01 m. Mit 2,60 m langen Platten: **10 Platten, Verschnitt 4,8 m² statt 22,3 m²** —
  das Plattenmaß entscheidet über den Verschnitt. Doppelt beplankt: 20 Platten, 1386 Schrauben,
  19,39 kg Spachtel. Fehlerfall greift, keine Überbreite bei 1360 und 390 px, **kein
  Sprachschlüssel auf der Seite**, Suchgegenprobe mit sinnlosem Wort → 0 Treffer.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Register | 51 | `npm run catalog:generate` |
| Suchbegriffe | 3.382 | `npm run catalog:generate` |
| Tests | 417 in 27 Dateien, bestanden | `npm run check` |
| Start-JavaScript | 146.775 B gzip (Warnschwelle 204.800; +358 B) | `npm run build` |
| Werkzeugtexte je Route (Deutsch) | 5.199 B gzip (Warnschwelle 30.720; ±0) | `npm run build` |
| Werkzeugtexte gesamt (Deutsch) | **39.962 B gzip** (Schwelle 40.960; +4.860 B) | `npm run build` |

**Die Summenschwelle fällt mit dem vierten Werkzeug.** 39.962 von 40.960 B — der Bodenbelagsrechner
bringt rund 1,5 kB je Sprache, die Summe liegt danach über der informativen Schwelle. Die **Last
eines Besuchs bleibt unverändert bei 5.199 B von 30.720**. Der Build bricht nicht ab (es ist eine
Warnung). Vorgehen beim Wellenabschluss: Zahlen vorlegen, Schwelle mit Begründung anheben — die
Summe zählt 52 Dateien mit je eigenem gzip-Kopf, sie ist nicht die Last eines Besuchs.

## Relevante Verweise

- Commit: siehe Übergabe der Welle
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Werkzeug 11, Klasse a)
- Belege: `uebergabe/06-protokolle/screenshots/2026-10-05-welle-b/` (Aufnahmen 19–26)

## Folgemaßnahmen

- [ ] Werkzeug 4 der Welle B: Parkett-, Laminat- und Bodenbelagsrechner (`flooring`)
- [ ] Danach Wellenabschluss: Stand, offene Punkte, Übergabe, Gesamtbericht, Schwellenentscheidung
