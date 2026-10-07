# Übergabe: Welle C der Handwerkerwerkzeuge (Pflaster und Erdarbeiten, Reifen und Drehmoment)

**Datum:** 2026-10-05  
**Bearbeitet durch:** Faber (Hermes Team 2)  
**Status:** abgeschlossen (Suite „Handwerk" damit zehn Werkzeuge; **nicht gepusht**)

## Ziel der Sitzung

Welle C des Konzepts `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` bauen: die beiden
verbliebenen Vorschläge der Lösungsklasse a ohne neue Abhängigkeit — **5 Pflaster- und
Erdarbeitenrechner** und **24 KFZ-Reifen- und Drehmomentrechner**. Auftrag im Wortlaut:
„Go für c".

## Ergebnis

Beide Werkzeuge sind gebaut, registriert, dreisprachig (de, en, es), geprüft und mit
Belegaufnahmen versehen. Das Register umfasst jetzt **54 Werkzeuge**, die Suite „Handwerk"
**zehn** Werkzeuge (acht aus den Wellen A und B plus die zwei neuen).

- **Pflaster und Erdarbeiten** (`paving`, `/tools/paving`): Steine, Paletten, Bettung,
  Fugenmaterial, Aushubtiefe, Aushubvolumen und aufgelockertes Haufwerk — elf Ergebniszeilen.
  Gerechnet wird im **Rastermaß** (Stein plus Fugenbreite), weil beim Pflaster die Fuge Teil des
  Verbands ist; das Fliesenwerkzeug rechnet bewusst über das Formatmaß, beide sagen es in ihren
  Annahmen.
- **Reifen und Drehmoment** (`tires`, `/tools/tires`): Flankenhöhe, Außendurchmesser, Umfang,
  Umdrehungen je Kilometer, Raddrehzahl, Vergleich mit einer Bezugsgröße samt tatsächlich
  gefahrener Geschwindigkeit sowie Anzugsmoment in Nm/ft·lb/kgf·m mit Toleranzbereich. Der
  **Anzugswert wird nicht vorgeschlagen** — er kommt vom Fahrzeughersteller; umgerechnet werden
  nur Einheiten und der Toleranzbereich.

## Geänderte Bereiche

- `packages/tools/src/craft/paving.ts`, `packages/tools/src/craft/paving/locales/{de,en,es,index}.ts`
- `packages/tools/src/craft/tires.ts`, `packages/tools/src/craft/tires/locales/{de,en,es,index}.ts`
- `apps/web/src/tools/Paving.tsx`, `apps/web/src/tools/Tires.tsx`
- `apps/web/src/craft-paving.test.ts`, `apps/web/src/craft-tires.test.ts`
- `apps/web/public/tools/paving.svg`, `apps/web/public/tools/tires.svg`
- `packages/tools/src/catalog/manifests.ts` (zwei Werkzeuge, Suite-Liste `craft`),
  `packages/tools/src/locales.ts`, `packages/tools/package.json`, `apps/web/src/App.tsx`
- `packages/tools/src/catalog/generated/**` (erzeugt: Suchpakete, Textpakete, Register)
- `work/paving-shots.cjs`, `work/tires-shots.cjs` (Belegaufnahmen)
- `uebergabe/06-protokolle/2026-10-05-welle-c-01-pflaster.md`, `…-02-reifen.md`, dieser Bericht
- `uebergabe/06-protokolle/screenshots/2026-10-05-welle-c/` (18 Aufnahmen, zwei Protokolldateien)
- `uebergabe/01-stand/aktueller-stand.md`, `uebergabe/01-stand/offene-punkte.md`

## Nachtrag 2026-10-07 (QM-Stufe R8, Karte M10-004): Belegaufnahmen sind ersetzt

Die beiden Aufnahmeskripte `work/paving-shots.cjs` und `work/tires-shots.cjs` sind **nicht**
versioniert worden. An ihre Stelle tritt der **versionierte** Prüfer `scripts/viewport-audit.mjs`
(`npm run viewport:check`, `npm run a11y:check`), der **dieselben Routen** mechanisch prüft
(Überläufe, Bedienzielgrößen, Kontrast, abgeschnittener Inhalt) — **er erzeugt keine Bilder**; das
ist der Unterschied und wird hier ausdrücklich benannt. Die 18 Aufnahmen selbst liegen versioniert
unter `uebergabe/06-protokolle/screenshots/2026-10-05-welle-c/` und bleiben damit erhalten.
Der Wortlaut oben bleibt unverändert stehen.

## Entscheidungen und Annahmen

- **Rastermaß beim Pflaster** (Stein plus Fuge): Beim Pflaster ist die Fuge Bestandteil des
  Verbands, der Handel verkauft die Steine im Raster; Gegenprobe 1942 gegen 2060 Steine auf 40 m².
- **Geometrischer Umfang beim Reifen**: Der reale Abrollumfang liegt ein bis drei Prozent darunter
  (Abflachung unter Last). Keine stillschweigend eingebaute „Abrollkorrektur" — das wäre erfundene
  Genauigkeit; die Annahmen benennen es.
- **Kein vorgeschlagenes Anzugsmoment**: nur Eingabefeld, Umrechnung und Toleranzbereich. So
  verlangt es das Konzept („nicht als Fahrzeugdatenbank").
- **Zwei neue Werkzeuge in der bestehenden Suite `craft`**, keine neue Suite — das Konzept führt
  Vorschlag 24 unter derselben Sammlung.
- Vorschlagswerte tragen weiterhin ihre Herkunft (`sourced` / `experience`); belegt sind nur die
  Einheitenfaktoren (1 Zoll = 25,4 mm; 0,7375621 ft·lb/Nm; 0,1019716 kgf·m/Nm).
- Keine Dateien, kein Upload, keine neue Abhängigkeit — reine Rechnung mit `Math`.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 54 Werkzeuge, 54 Symbole, 3.636 Suchbegriffe, 92 Dateitypen |
| `npm run catalog:check` | bestanden (`54 tools, 3 languages, 54 icons, 92 file types`) |
| `npm run check` | **440 Tests in 30 Dateien** bestanden (vorher 434 in 29) |
| `npm run lint` | bestanden |
| `npm run build` | bestanden (EXIT 0); Startlast **146.993 B gzip** von 204.800 |
| Werkzeugtexte je Route | 5.199 B (de) / 4.685 B (en) / 5.207 B (es) von 30.720 |
| Summe der Textpakete (ADR 0011) | 55 Pakete × 850 B = 46.750 B; de 44.366, en 40.121, es 43.627 |
| Belegaufnahmen | `work/paving-shots.cjs` EXIT 0 (9 Bilder), `work/tires-shots.cjs` EXIT 0 (9 Bilder) |
| Werte zurückgelesen | Pflaster: 40 m², 47,13 Steine/m², 1942 Steine, 5 Paletten, 1,6 m³ = 2,56 t, 230,4 kg, 0,40 m, 16 m³ → 20 m³. Reifen: 112,75 mm, 631,9 mm, 1,9852 m, 503,73 U/km, 839,6 U/min, −0,41 %, 99,59 km/h, 88,51 ft·lb, 12,24 kgf·m, 114–126 Nm |
| Sprachschlüssel auf der Seite | keine (beide Werkzeuge, alle geprüften Breiten) |
| Überbreite | 0 px bei 1360 px und bei 390 px |

## Offene Punkte und Risiken

- [ ] Spanische Texte der **zehn** Handwerk-Werkzeuge weiterhin nicht gegengelesen.
- [ ] Beobachtung am Layout: In den aufklappbaren Abschnitten der beiden neuen Werkzeuge sitzt die
      erste Feldspalte auf der Zeile der Zusammenfassung, das Eingabefeld darunter. Lesbar und
      richtig zugeordnet, aber unschön; noch nicht gegen ein Werkzeug der Wellen A/B verglichen.
- [ ] `npm run viewport:check`, durchgespielter Tastaturlauf, 200 % Zoom und Screenreader-Namen für
      die Handwerk-Suite stehen weiterhin aus (wie bei der Rechner-Suite).
- [ ] Welle C ist **nicht gepusht**; die Veröffentlichung erfolgt nur auf ausdrücklichen Auftrag.

## Empfohlener nächster Schritt

1. Veröffentlichung (Push) der Wellen A–C, sobald Thomas es beauftragt — dann mit Online-Nachkontrolle.
2. Danach die sprachliche Abnahme der spanischen Texte und die Barrierefreiheitsprüfung der Suite
   nachziehen (ein Durchgang für alle zehn Werkzeuge statt zehn Einzelläufe).

## Git

- Commit: `b80f527` (Pflaster), `3972f59` (Reifen)
- Arbeitsbaum: sauber bis auf die bekannten Zeilenenden-Markierungen in `COPYRIGHT`/`LICENSE`
- Branch `main`, **nicht gepusht** (wie die Wellen A und B)
