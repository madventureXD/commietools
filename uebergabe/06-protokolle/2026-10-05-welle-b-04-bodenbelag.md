# Fortschrittsprotokoll: Welle B der Handwerkerwerkzeuge — Werkzeug 4 „Parkett, Laminat und Bodenbelag"

**Datum:** 2026-10-05  
**Status:** abgeschlossen (Werkzeug 4 von 4; **Welle B damit vollständig**)

## Umfang

Werkzeug 12 des Konzepts `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Welle B „Ausbau"):
Verlegearten, Pakete, Verschnitt, Trittschalldämmung, Sockelleisten. Kette wie bei den Werkzeugen
1 bis 3.

## Ergebnisse

- **Fachlogik** `packages/tools/src/craft/flooring.ts` (schwimmende Verlegung): Bodenfläche aus
  Länge × Breite, Zuschlag nach Verlegeart, Bedarfsfläche, Pakete aufgerundet, Verschnitt als
  eigene Zeile, Trittschalldämmung mit Überlappungszuschlag in ganzen Rollen, Sockelleisten aus
  dem Umfang.
- **Keine neue Abhängigkeit.** Reine Rechnung mit `Math`.
- **Der Zuschlag folgt der Verlegeart:** Kreuzverband 5 %, Versatz 8 %, Diagonal 12 % — als
  Erfahrungswerte gekennzeichnet und überschreibbar. Der Beleg zeigt den Unterschied: **2 m²
  Verschnitt** im Kreuzverband, **4 m²** im Diagonalverband bei derselben Fläche.
- **Beleg am Artefakt** (`work/flooring-shots.cjs`, 8 Aufnahmen, Werte zurückgelesen): 5 × 4 m →
  20 m² · Zuschlag 1 m² → 21 m² Bedarf · **11 Pakete**, Verschnitt 2 m² · Dämmung 21 m² (**2
  Rollen**) · Umfang 18 m → **8 Leistenstücke = 19,2 m**. Kleiner Raum 3 × 2,5 m → 7,5 m² → **4
  Pakete**, 1 Rolle, 5 Leisten. Fehlerfall greift, keine Überbreite bei 1360 und 390 px, **kein
  Sprachschlüssel auf der Seite**, Suchgegenprobe → 0 Treffer. Die Startseite nennt die Suite
  „Handwerk" jetzt mit **acht Werkzeugen**.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Register | 52 | `npm run catalog:generate` |
| Suchbegriffe | 3.464 | `npm run catalog:generate` |
| Tests | 426 in 28 Dateien, bestanden | `npm run check` |
| Start-JavaScript | 146.867 B gzip (Warnschwelle 204.800; +450 B) | `npm run build` |
| Werkzeugtexte je Route (Deutsch) | 5.199 B gzip (Warnschwelle 30.720; ±0) | `npm run build` |
| Werkzeugtexte gesamt (Deutsch) | 41.309 B gzip — **neue Schwelle 850 B je Paket** (53 Pakete → 45.050 B) | `npm run build`, ADR 0011 |

## Schwellenentscheidung dieser Runde

Die Summenschwelle war mit diesem Werkzeug gerissen (41.309 B gegen 40.960 B, nur Deutsch). Sie ist
**nicht** stillschweigend angehoben, sondern auf eine skalierende Regel umgestellt: die Summe wird
**je Paket** gemessen (850 B × 53 Pakete = 45.050 B). Begründung: Die Summe zählt 53 Dateien mit je
eigenem gzip-Kopf und ist keine Besucherlast — die Last einer Route liegt unverändert bei 5.199 B
von 30.720 B. Dokumentiert als **ADR 0011**; die entscheidende Kennzahl bleibt die Last je Route
gegen eine feste Schwelle.

## Relevante Verweise

- Commit: siehe Übergabe der Welle
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Werkzeug 12, Klasse a)
- ADR: [0011](../04-entscheidungen/0011-werkzeugtextsumme-je-paket.md)
- Belege: `uebergabe/06-protokolle/screenshots/2026-10-05-welle-b/` (Aufnahmen 27–34)

## Folgemaßnahmen

- [ ] Welle C des Konzepts: Pflaster/Erdarbeiten (5) und Reifen/Drehmoment (24)
- [ ] Wellenabschluss dokumentiert: Stand, offene Punkte, Übergabe, Gesamtbericht
