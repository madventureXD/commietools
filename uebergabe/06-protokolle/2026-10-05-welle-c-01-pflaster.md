# Zwischenprotokoll Welle C, Werkzeug 1: Pflaster und Erdarbeiten

Datum: 2026-10-05 · Suite „Handwerk" · Konto/Register: 53 Werkzeuge · Sprachen: de, en, es

## Auftrag

Welle C des Konzepts „Handwerkerwerkzeuge" (Fortsetzung von Welle A und B). Erstes der beiden
Werkzeuge: **Pflaster und Erdarbeiten** (Konzept Punkt 5, GaLaBau/Tiefbau). Ausdrücklicher
Auftrag vom 2026-10-05: „Go für c".

## Zweck

Aus Fläche, Steinformat, Fugenbreite und Aufbau die Bestellung und den Erdbau rechnen: Steine,
Paletten, Bettung, Fugenmaterial, Aushubtiefe, Aushubvolumen und das aufgelockerte Volumen für
Container und Fahrten.

## Umsetzung

- Fachlogik `packages/tools/src/craft/paving.ts` (246 Zeilen): elf Ergebniszeilen mit
  Rechenweg, Grenzwertprüfung je Feld, Vorschlagswerte mit Herkunft (`sourced` / `experience`).
- Texte `packages/tools/src/craft/paving/locales/{de,en,es,index}.ts` (je ~50 Schlüssel).
- Oberfläche `apps/web/src/tools/Paving.tsx` (≈300 Zeilen), Symbol `paving.svg`.
- Tests `apps/web/src/craft-paving.test.ts` (sechs Gruppen).
- Registrierung: `catalog/manifests.ts` (Werkzeug und Suite-Liste `craft`), `locales.ts`,
  `package.json`, `App.tsx` (Ladepfad und Route).
- Belegaufnahme `work/paving-shots.cjs` (neun Aufnahmen, Werte werden zurückgelesen und geprüft).

## Eigenheit gegenüber dem Fliesenwerkzeug

Gerechnet wird im **Rastermaß** — Stein plus Fugenbreite —, nicht über das Formatmaß wie beim
Fliesenwerkzeug. Begründung: Beim Pflaster ist die Fuge Teil des Verbands und der Handel verkauft
die Steine so; die Fugenbreite ist hier kein Zusatz, sondern Bestandteil des Rasters. Die
Gegenprobe zeigt den Unterschied: mit 4 mm Fuge 1942 Steine, ohne Fuge 2060 Steine auf 40 m².
Beide Werkzeuge sagen in ihren Annahmen, wie sie rechnen — kein stiller Unterschied.

## Belege (zurückgelesen aus der laufenden Seite)

Standardfall 8 × 5 m, Stein 20 × 10 cm, 4 mm Fuge, 3 % Zuschlag, Aufbau 30/4/6 cm:

- Pflasterfläche **40 m²** · Höhenunterschied aus 0,5 % Gefälle **0,04 m**
- Steine je m² **47,13** (Raster 0,204 × 0,104 m) → **1942 Steine** → **5 Paletten**
- Bettung **1,6 m³ = 2,56 t** · Fugenmaterial **230,4 kg**
- Aushubtiefe **0,40 m** → Aushub im Boden **16 m³** → aufgelockert **20 m³** (Faktor 1,25)

Gegenproben: Fugenbreite 0 mm → 2060 Steine, Fugenmaterial 0 kg (das Rastermaß entscheidet);
Auflockerungsfaktor 1 → Haufwerk 16 m³ = Bodenvolumen; 10 × 3 m → 1457 Steine, 4 Paletten,
Haufwerk 15 m³; 390 px ohne Überbreite; Katalog zählt die Suite „Handwerk" mit neun Werkzeugen.

## Prüfungen

- `npm run check`: **434 Tests in 29 Dateien** grün (vorher 426 in 28).
- `npm run lint` grün · `npm run build` grün (EXIT 0) · `catalog:generate` ohne Änderung.
- Belegaufnahme EXIT 0, neun Bilder, kein Sprachschlüssel auf der Seite, Überbreite 0 px.
- Startlast 146.935 B gzip von 204.800 (Warnschwelle); Werkzeugtexte je Route 5.199 B von 30.720.
- Steuerpaket-Summe Deutsch 42.903 B von 45.900 (54 Pakete × 850 B, ADR 0011).

## Eigene Fehler — vor dem Weiterbauen gefunden und behoben

1. **Einheitenfehler Fugenlänge**: Faktor 1000 statt 100 bei Zentimeter-Eingabe (Fugenlänge je m²
   wäre zehnfach zu groß gewesen). Vor dem Test gefunden, Rechenprobe im Kommentar ergänzt.
2. **Einheitenfehler Fugenmaterial**: Formel hätte Kilogramm statt Tonnen geliefert.
3. **Zertrümmerte Datei durch einen eigenen Patch**: Eine Grenzwert-Ergänzung schnitt die
   schließende Klammer des Grenzwertobjekts weg. Aufgefallen beim nächsten Patch, repariert.
4. **Wirksame Lücke daraus**: Die Steindicke wurde geprüft, aber gegen die Grenzen der
   Steinbreite (4–120 cm statt 2–30 cm) — 40 cm Steindicke ging durch. **Der Test hat das
   gefunden**, nicht das Auge: `check` meldete drei Fehlschläge, einer davon dieser. Behoben,
   danach grün.

Punkt 4 ist der Grund, warum die Prüfkette Grenzwerte einzeln prüft: Eine Zahl, die irgendwo
zwischen zwei plausiblen Grenzen liegt, sieht in der Anzeige vollkommen richtig aus.

## Offen

- Spanische Texte des Werkzeugs noch nicht gegengelesen (wie bei den acht Werkzeugen der Wellen A und B).
- Bettrandsteine, Drainage und Entsorgungskosten sind bewusst nicht enthalten (in den Annahmen benannt).
