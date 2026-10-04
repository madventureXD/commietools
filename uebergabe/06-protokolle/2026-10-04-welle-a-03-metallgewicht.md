# Zwischenbericht: Welle A, Werkzeug 3 — Metallgewicht

**Datum:** 2026-10-04 · **Bearbeitet durch:** Faber (Hermes Agent) · **Status:** abgeschlossen
**Teil von:** Welle A der Handwerkerwerkzeuge, Vorschlag 17

## Umfang

Werkzeug-ID `metal-weight`, Route `/tools/metal-weight`, Kategorie/Suite `craft` / „Handwerk".
Acht Profilarten (Rundstab, Vierkant, Flach, Rundrohr, Quadratrohr, Rechteckrohr, Winkel,
Sechskant) und zehn Werkstoffe mit überschreibbarer Dichte.

Eine Grundformel trägt alles: `m = F · L · ρ / 1000` (F in mm², L in m, ρ in kg/dm³). Rohre werden
über die **Differenz von Außen- und Innenfläche** gerechnet, nicht über eine Näherungsformel.
Eine Wandstärke, die das Profil schließt oder überschreitet, wird als Fehler abgewiesen.

## Befund, der festgehalten gehört

Beim Nachrechnen gegen die Beispielangaben einer Fachquelle (witte-tube.com) zeigte sich: Die
Angaben zu **Rohrgewichten** stimmen nicht mit der Grundformel überein — Rundrohr 48,3 × 2,6 mm
über 6 m: dort „ca. 17,32 kg", gerechnet **17,58 kg** (+1,5 %); Rechteckrohr 100 × 50 × 4 mm über
3 m: dort „ca. 35,40 kg", gerechnet **26,75 kg** (−24 %). Die **Flachstahl**-Angabe derselben
Quelle trifft dagegen genau (80 × 10 mm über 2 m → 12,56 kg).

Konsequenz: Prüfmaßstab ist die exakte Nachrechnung aus Querschnitt und Grundformel, die
zusätzlich durch die unabhängigen Faustformeln einer zweiten Quelle bestätigt wird
(`0,006165 · d²` Rundstahl, `0,00785 · a²` Vierkant, `0,00785 · b · t` Flach, `0,0068 · SW²`
Sechskant). Der Widerspruch wird nicht geglättet, sondern im Test und hier benannt.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 45 Werkzeuge, 3.018 Begriffe (gemessen) |
| `npm run check` | bestanden (nach Korrektur zweier falscher Testerwartungen) |
| `npm run lint`, `npm run build` | bestanden |
| Belegaufnahme im Browser | 4 Aufnahmen (Rundstahl, Aluminiumrohr, Fehlerfall, Flachstahl 390 px) |

Abgelesene Belegwerte: Rundstahl 20 mm → **2,466 kg/m**, 6 m → **14,797 kg**; Aluminiumrohr
48,3 × 2,6 mm, 6 m → 5,96 kg (aus 17,58 kg Stahl × 2,70/7,85); Flachstahl 80 × 10 mm.

## Bilder

`06-protokolle/screenshots/2026-10-04-welle-ab/`
- `09-metall-rundstahl-dunkel.png` · `10-metall-rohr-aluminium-dunkel.png`
- `11-metall-fehlerfall.png` · `12-metall-flachstahl-hell-390.png`

## Bekannte Grenzen

- Beim Winkel ist die Fläche ohne Ausrundungen gerechnet (Ergebnis leicht unter dem Kataloggewicht).
- Bronze, Zink, Blei und Titan sind als Erfahrungswerte gekennzeichnet, nicht als Fachquellenwerte.
- Kein Liefergewicht, keine Werkstoffnorm — theoretische Rechnung aus Geometrie.
