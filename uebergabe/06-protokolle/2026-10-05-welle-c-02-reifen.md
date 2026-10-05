# Zwischenprotokoll Welle C, Werkzeug 2: Reifen und Drehmoment

Datum: 2026-10-05 · Suite „Handwerk" · Register: 54 Werkzeuge · Sprachen: de, en, es

## Auftrag

Zweites Werkzeug der Welle C: **KFZ-Reifen- und Drehmomentrechner** (Konzept Punkt 24,
Lösungsklasse a). Ausdrücklicher Auftrag vom 2026-10-05: „Go für c".

## Zweck

Reifengröße auswerten und mit einer Bezugsgröße vergleichen — Flankenhöhe, Außendurchmesser,
Umfang, Umdrehungen je Kilometer, Raddrehzahl, Abweichung des Umfangs und die bei gleicher
Raddrehzahl tatsächlich gefahrene Geschwindigkeit. Dazu der Anzugswert in Nm, ft·lb und kgf·m
mit Toleranzbereich.

## Entscheidung zum Anzugsmoment (wichtig)

Das Werkzeug **schlägt kein Anzugsmoment vor**. Der gezeigte Wert ist ein Beispiel, der gültige
Wert kommt vom Fahrzeughersteller und hängt von Gewindemaß, Festigkeitsklasse, Rad und
Befestigungsart ab. Genau so verlangt es das Konzept („als Eingabefeld oder als klar
gekennzeichnete Richtwerte, nicht als Fahrzeugdatenbank"). Umgerechnet werden nur Einheiten und
der Toleranzbereich.

## Entscheidung zum Umfang (wichtig)

Gerechnet wird der **geometrische** Umfang (π · Außendurchmesser). Der reale Abrollumfang ist
ein bis drei Prozent kleiner, weil sich der Reifen unter Last abflacht. Das steht in den
Annahmen — die Zahl ist eine Näherung, keine Messung. Eine stillschweigend eingebaute
„Abrollkorrektur" wäre eine erfundene Genauigkeit.

## Umsetzung

- Fachlogik `packages/tools/src/craft/tires.ts` (≈245 Zeilen), zwölf Rechenweg-Zeilen.
- Texte `packages/tools/src/craft/tires/locales/{de,en,es,index}.ts`.
- Oberfläche `apps/web/src/tools/Tires.tsx` (elf Ergebniszeilen, letzte Zeile trägt zwei Formeln),
  Symbol `tires.svg`.
- Tests `apps/web/src/craft-tires.test.ts` (fünf Gruppen).
- Registrierung in `manifests.ts`, `locales.ts`, `package.json`, `App.tsx`.
- Belegaufnahme `work/tires-shots.cjs` (neun Aufnahmen, Werte zurückgelesen und geprüft).

## Belege (zurückgelesen aus der laufenden Seite)

205/55 R16 gegen 195/65 R15, 100 km/h, 120 Nm, 5 % Toleranz:

- Flankenhöhe **112,75 mm** · Außendurchmesser **631,9 mm** · Umfang **1,9852 m**
- Umdrehungen je Kilometer **503,73** · Raddrehzahl bei 100 km/h **839,6 U/min**
- Umfang der Bezugsgröße **1,9933 m** · Abweichung **−0,41 %**
- Bei gleicher Raddrehzahl: Anzeige 100 km/h, gefahren **99,59 km/h**
- **88,51 ft·lb** · **12,24 kgf·m** · zulässiger Bereich **114 Nm bis 126 Nm**

Gegenproben: kleinerer Bezug 185/60 R14 → Abweichung **+9,401 %**, gefahren **109,4 km/h**;
Toleranz 0 % → Bereich **120 Nm bis 120 Nm** (beide Grenzen fallen zusammen); 195/65 R15 gegen
sich selbst → Abweichung **0 %**, gefahren **100 km/h**; 390 px ohne Überbreite; Katalog zeigt die
Suite „Handwerk" mit **zehn** Werkzeugen, das Pflasterwerkzeug bleibt über „pflastersteine"
auffindbar, „zzzqqq" liefert 0 Karten.

## Prüfungen

- `npm run check`: **440 Tests in 30 Dateien** grün (vorher 434 in 29).
- `npm run lint` grün · `npm run build` grün (EXIT 0).
- Belegaufnahme EXIT 0, neun Bilder, kein Sprachschlüssel auf der Seite, Überbreite 0 px.
- Startlast 146.993 B gzip von 204.800; Werkzeugtexte je Route 5.199 B von 30.720.
- Steuerpaket-Summe je Sprache von 46.750 (55 Pakete × 850 B, ADR 0011): de 44.366, es 43.627.

## Eigene Fehler — vom Test gefunden, nicht vom Auge

1. **Handrechnung falsch (Umfang)**: Ich hatte π · 0,6319 m = 1,985159 m notiert; richtig sind
   **1,9851724 m**. Der Test schlug fehl, ich rechnete die Erwartung mit dem Rechner nach
   (π · d/1000) und korrigierte Test **und** Belegschwellen.
2. **Richtung der Abweichung verwechselt**: Ich hatte erwartet, dass ein *größerer* Bezugsreifen
   eine positive Abweichung ergibt. Richtig ist das Gegenteil — die Abweichung ist „eigener
   Umfang gegen Bezug", ein größerer Bezug ergibt also einen negativen Wert. Der Test hat den
   Denkfehler aufgedeckt; die Belegprobe nutzt jetzt einen **kleineren** Bezug (185/60 R14) für
   den positiven Fall **und** einen größeren für den negativen.
3. **Anzeigerundung übersehen**: 839,5576 U/min werden auf eine Nachkommastelle als „839,6"
   angezeigt, nicht als „839,5". Auch das fand der Beleglauf.

Zu Punkt 2: Der Denkfehler war keine Rechenungenauigkeit, sondern eine falsche Vorstellung vom
Zusammenhang. Ohne den Test wäre eine in sich stimmige, aber falsch beschriftete Zahl in die
Oberfläche gegangen.

## Beobachtung am Layout (offener Punkt, nicht behoben)

Bei den beiden neuen Werkzeugen steht in den aufklappbaren Abschnitten die **erste Feldspalte**
auf der Zeile der Zusammenfassung, das zugehörige Eingabefeld darunter, während die zweite Spalte
normal sitzt. Alle Beschriftungen bleiben lesbar und richtig zugeordnet, es ist eine
Stilerscheinung des gemeinsamen Aufbaus (`details > summary` plus `.form-grid`). Noch nicht gegen
ein Werkzeug der Wellen A/B verglichen; als offener Punkt notiert.

## Offen

- Spanische Texte noch nicht gegengelesen (wie bei den übrigen zehn Handwerk-Werkzeugen).
- Der Vergleich mit dem realen Abrollumfang bleibt Näherung (in den Annahmen benannt).
