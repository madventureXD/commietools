# Gesamtbericht: Welle A der Handwerkerwerkzeuge

**Datum:** 2026-10-04 · **Bearbeitet durch:** Faber (Hermes Agent) · **Status:** abgeschlossen
**Auftrag:** Welle A bauen, Screenshots je Werkzeug, Zwischenbericht je Werkzeug, Gesamtbericht am
Ende mit allen endgültigen Aufnahmen (Thomas, 2026-10-04).

## Was gebaut wurde

Vier Werkzeuge in der neuen Kategorie und Suite **„Handwerk"** (`craft`). Alle **ohne neue
Abhängigkeit** — reine Rechnung, drei Sprachen vollständig, je Werkzeug ein eigenes Symbol, Tests,
Manifest mit Kurzbeschreibung und Suchbegriffen.

| # | Werkzeug | ID | Rechenweg |
|---|---|---|---|
| 1 | Beton, Mörtel und Estrich | `concrete` | `Z = V·Zementgehalt`, `W = Z·w/z`, `G = V·ρ − Z − W`; Massenbilanz als Prüfung |
| 2 | Dach | `roof` | `f = 1/cos α`, `A = (L+2u)(B+2u)·f`, Firsthöhe aus Tangens, Sparrenzahl aufgerundet |
| 3 | Metallgewicht | `metal-weight` | `m = F·L·ρ/1000`; Rohre über Flächen-*Differenz*, nicht Näherung |
| 4 | Holzfeuchte und Holzgewicht | `wood` | `u = (m_nass − m_darr)/m_darr·100`; Gewicht `m = V·ρ·1000` |

## Belegte Werte (Quellen im Werkzeug sichtbar)

- **Beton:** Frischbeton 2.400 kg/m³, C20/25 300 kg/m³ bei w/z 0,60, C25/30 340 kg/m³ bei w/z 0,55,
  Magerbeton 180 kg/m³ (baumaterialkalkulator.de, bau-szene.de); Estrich 2.200 kg/m³
  (baumigo.de, nach DIN EN 1991-1-1); Höchstzementgehalt Estrichmörtel 450 kg/m³ (vdz-online.de).
  Mörtel- und Estrichwerte ohne Quelle sind **als Erfahrungswert gekennzeichnet**.
- **Metall:** Stahl 7,85, Edelstahl 1.4301 7,9, Aluminium 2,70, Kupfer 8,96, Messing 8,5, Gusseisen
  7,25 kg/dm³ (witte-tube, hug-technik, edelstahlrohrshop, mirrorinox).
- **Holz:** mittlere Rohdichten bei 12–15 % Feuchte nach der Tabelle der **Bayerischen Landesanstalt
  für Wald und Forstwirtschaft** (Fichte 0,46 · Kiefer 0,52 · Lärche 0,60 · Buche 0,71 · Eiche 0,71 …).

## Selbstkontrolle: die abgelesenen Werte

Die Aufnahme liest jeden Ergebniswert aus dem Browser zurück und prüft ihn gegen eine unabhängig
gerechnete Erwartung. Ein Bild allein wäre kein Beleg.

| Aufnahme | Abgelesen | Erwartung |
|---|---|---|
| Beton 2,5 × 2,0 m × 10 cm, C20/25, 5 % | 0,525 m³ · 157,5 kg · **7 Säcke** · 94,5 l · 1.008 kg Zuschlag · 1.260 kg | identisch |
| Dach 12 × 9 m, 35°, Überstand 0,5 m | f = 1,2208 · 158,7 m² · 18 Sparren | identisch |
| Dach Pult aus Verhältnis 1 : 4 | 14,04° | atan(1/4) = 14,036° |
| Metall Rundstahl 20 mm, 6 m | 2,466 kg/m · 14,797 kg | π/4·d²·ρ/1000 |
| Metall Aluminiumrohr 48,3 × 2,6 mm, 6 m | 6,047 kg | 17,58 · 2,70/7,85 |
| Holz 13 kg nass / 10 kg darr | **30 %** | Beispiel der Fachquelle holzland.de |
| Holz Eiche 60 × 120 mm, 4 m, 10 Stück | 20,45 kg je Stück · 204,48 kg | 0,0288 m³ · 0,71 kg/dm³ |

Fehlerfälle greifen: unmögliche Betonmischung, geschlossenes Rohrprofil, Darrmasse über Nassgewicht —
jeder Fall wird mit eigener Meldung abgewiesen (Aufnahmen 02, 11, 15).

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 45 Werkzeuge, 3 Sprachen, 45 Symbole, 3.018 Suchbegriffe |
| `npm run check` | bestanden — **375 Tests** in 22 Dateien, Lizenz- und Registerprüfung, Typprüfung |
| `npm run lint` | bestanden |
| `npm run build` + `bundle:check` | bestanden — Startsprung 145.931 B gzip von 204.800 |
| Belegaufnahme | 16 Bilder, keine Überbreite bei 390 px, Katalog und Suite sichtbar |

**Zwei Warnungen, nicht verschwiegen:** Werkzeugtexte **Deutsch 32.080 B** und **Spanisch 31.130 B**
liegen über der Warnschwelle 30.720 B (Englisch 29.264 B darunter). Der Build bricht deshalb nicht
ab; der Ausweg — Aufteilung der Werkzeugtexte je Sprache — steht im Konzept und sollte **vor Welle B**
gebaut werden.

**Nicht ausgeführt:** `npm run viewport:check` und eine automatisierte Barrierefreiheitsprüfung.
Beides ist in der Übergabe als offener Punkt benannt.

## Die endgültigen Aufnahmen

Alle unter `06-protokolle/screenshots/2026-10-04-welle-ab/` (mit `aufnahmen.txt` als Messprotokoll):

1. `01-beton-standard-dunkel.png` · 2. `02-beton-fehlerfall.png` ·
3. `03-beton-volumen-hell-390.png` · 4. `04-dach-satteldach-dunkel.png` ·
5. `05-dach-pult-verhaeltnis-dunkel.png` · 6. `06-dach-walm-hell-390.png` ·
7. `07-katalog-suite-handwerk.png` · 8. `08-suche-beton.png` ·
9. `09-metall-rundstahl-dunkel.png` · 10. `10-metall-rohr-aluminium-dunkel.png` ·
11. `11-metall-fehlerfall.png` · 12. `12-metall-flachstahl-hell-390.png` ·
13. `13-holz-feuchte-dunkel.png` · 14. `14-holz-gewicht-eiche-dunkel.png` ·
15. `15-holz-fehlerfall.png` · 16. `16-holz-hell-390.png`

## Zwischenberichte

- `2026-10-04-welle-a-01-beton.md`
- `2026-10-04-welle-a-02-dach.md`
- `2026-10-04-welle-a-03-metallgewicht.md`
- `2026-10-04-welle-a-04-holz.md`

## Was Welle A nicht ist

Keine Welle B (Ausbau) — auf Thomas' Anweisung während der Sitzung auf Welle A begrenzt. Keine
Veröffentlichung: nichts gepusht. Kein Nachweis der Barrierefreiheit über den Handlauf bei 390 px
hinaus.
