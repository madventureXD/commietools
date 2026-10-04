# Zwischenbericht: Welle A, Werkzeug 1 — Beton, Mörtel und Estrich

**Datum:** 2026-10-04 · **Bearbeitet durch:** Faber (Hermes Agent) · **Status:** abgeschlossen
**Teil von:** Welle A der Handwerkerwerkzeuge (`03-konzepte/2026-10-03-handwerkerwerkzeuge.md`, Vorschlag 4)

## Umfang

Werkzeug-ID `concrete`, Route `/tools/concrete`, Kategorie und Suite neu: **`craft` / „Handwerk"**.
Rechenarten Beton, Mörtel und Estrich über das **Masseverfahren**:

- `V = Volumen (Maße L×B×D, Fläche×Dicke oder direkt), einschließlich Verschnitt`
- `Z = V · Zementgehalt` · `W = Z · w/z` · `G = V · ρ − Z − W`
- Ausgabe: Mischungsvolumen, Zement, **Sackzahl aufgerundet**, Wasser, Zuschlag, Gesamtmasse,
  Masseverhältnis Zement : Zuschlag.

Die Massenbilanz `Zement + Wasser + Zuschlag = V · ρ` geht bauartbedingt immer auf — sie ist die
Prüfung im Test, nicht eine Ausgabe daneben.

## Entscheidungen

- **Masseverfahren statt Volumenteile.** „1 Teil Zement zu 4 Teilen Kies" lässt sich nicht eindeutig
  in Volumen umrechnen (Zement füllt die Hohlräume des Zuschlags); die Oberfläche sagt das ausdrücklich.
- **Vorschlagswerte mit Herkunftskennzeichnung.** Die Oberfläche unterscheidet sichtbar zwischen
  belegten Fachwerten und Erfahrungswerten ohne Fachquellenbeleg (Mörtel- und Estrichwerte).
  Die Recherche fand für Mörtel-Zementgehalt und die w/z-Werte von Mörtel und Estrich keine frei
  zugängliche Quelle mit konkreter Zahl — das wird nicht verdeckt, sondern angezeigt.
- **Keine neue Abhängigkeit.** Reine Rechnung mit `Math`; die im Konzept genannten Pakete
  (`fraction.js`, `decimal.js`) entfallen ersatzlos.
- **Vorauswahl C20/25.** Im Browserbeleg aufgefallen: Die Erstbelegung stand auf Magerbeton
  (erstes Element der Liste). Korrigiert auf den häufigsten Fall (Fundament, Bodenplatte, Decke).

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 42 Werkzeuge, 3 Sprachen, 2.791 Begriffe (gemessen) |
| `npm run check` | bestanden |
| `npm run build` | bestanden, `bundle:check` bestanden |
| Belegaufnahme im Browser (Edge headless) | 3 Aufnahmen, siehe unten |

Unabhängige Nachrechnung des Belegfalls (2,50 × 2,00 m × 10 cm, C20/25, 5 % Verschnitt):
0,525 m³ · 157,5 kg Zement · **7 Säcke** · 94,5 l Wasser · 1.008 kg Zuschlag · 1.260 kg Gesamtmasse
· 1 : 6,4. Im Browser abgelesen und gegen diese Erwartung geprüft.

## Bilder

`06-protokolle/screenshots/2026-10-04-welle-ab/`
- `01-beton-standard-dunkel.png` — Standardfall, dunkles Thema, 1360 px
- `02-beton-fehlerfall.png` — Mischung ohne Zuschlag wird als Fehler gemeldet
- `03-beton-volumen-hell-390.png` — Volumeneingabe, helles Thema, 390 px, keine Überbreite

## Bekannte Grenzen

- Mörtel- und Estrich-Vorschlagswerte sind Erfahrungswerte (in der Oberfläche gekennzeichnet).
- Keine Betonprüfung, keine Normaussage, keine Expositionsklassen-Auswahl.
- Kein Speichern des Materialscheins (Ausgabe ist bewusst nur Information).
