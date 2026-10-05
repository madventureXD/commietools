# Gesamtbericht Welle C der Handwerkerwerkzeuge

**Datum:** 2026-10-05 · **Bearbeitet durch:** Faber (Hermes Team 2) · **Auftrag:** „Go für c"

## Was geliefert wurde

Zwei Werkzeuge der Lösungsklasse a, dreisprachig, ohne neue Abhängigkeit, mit Belegaufnahmen:

1. **Pflaster und Erdarbeiten** (`paving`) — Commit `b80f527`
2. **Reifen und Drehmoment** (`tires`) — Commit `3972f59`

Suite „Handwerk" damit **zehn Werkzeuge**, Register **54 Werkzeuge**. Einzelheiten in den
Zwischenprotokollen `2026-10-05-welle-c-01-pflaster.md` und `…-02-reifen.md` sowie in der Übergabe
`05-uebergaben/2026-10-05-welle-c-handwerkerwerkzeuge.md`.

## Ablauf je Werkzeug

Fachlogik mit Rechenweg und Grenzwerten → Texte in drei Sprachen → Manifest, Symbol und Route →
Oberfläche → Tests → `catalog:generate`, `check`, `lint`, `build` → Belegaufnahme in Edge headless
mit **zurückgelesenen** Werten → Zwischenprotokoll → Commit.

## Zahlen

| Größe | vor Welle C | nach Welle C |
|---|---|---|
| Werkzeuge im Register | 52 | **54** |
| Werkzeuge in der Suite „Handwerk" | 8 | **10** |
| Suchbegriffe | 3.464 | **3.636** |
| Tests | 426 in 28 Dateien | **440 in 30 Dateien** |
| Startlast gzip | 146.867 B | **146.993 B** von 204.800 |
| Textsumme Deutsch | 42.903 B | **44.366 B** von 46.750 (55 × 850 B) |

## Eigene Fehler in dieser Welle (alle vom Test oder von der Belegprobe gefunden)

Werkzeug Pflaster:

1. Einheitenfehler Fugenlänge (Faktor 1000 statt 100 bei Zentimeter-Eingabe).
2. Einheitenfehler Fugenmaterial (Kilogramm statt Tonnen).
3. Eine eigene Korrektur zertrümmerte die Datei: Die schließende Klammer des Grenzwertobjekts
   wurde beim Einfügen entfernt. Beim nächsten Schreibvorgang aufgefallen, repariert.
4. **Wirksame Folge daraus**: Die Steindicke wurde gegen die Grenzen der **Steinbreite** geprüft
   (4–120 cm statt 2–30 cm) — 40 cm Steindicke lief durch. Vom Test gefunden, nicht vom Auge.

Werkzeug Reifen:

5. Handrechnung falsch: Ich hatte π · 0,6319 m = 1,985159 m notiert; richtig sind 1,9851724 m.
6. **Denkfehler bei der Richtung**: Ich erwartete, dass ein *größerer* Bezugsreifen eine positive
   Abweichung ergibt — richtig ist das Gegenteil, die Abweichung ist „eigener Umfang gegen Bezug".
   Der Test deckte es auf; die Belegprobe prüft jetzt beide Richtungen.
7. Anzeigerundung übersehen: 839,5576 U/min erscheinen auf eine Nachkommastelle als „839,6".

Alle sieben waren vor dem Commit behoben. Keiner hat die Abnahme überlebt; keiner ist stillgelegt.

## Prüfungen der Prüfung

- Der Fehler 4 aus dem Pflasterwerkzeug ist nur aufgefallen, weil die Prüfkette **jedes**
  Grenzwertfeld einzeln testet — die fehlerhafte Zahl lag zwischen zwei plausiblen Grenzen und sah
  in der Anzeige vollkommen richtig aus.
- Die Belegproben lesen die angezeigten Werte **aus der laufenden Seite** zurück und prüfen sie
  gegen unabhängig gerechnete Erwartungen. Dabei wird zusätzlich geprüft: kein Sprachschlüssel als
  sichtbarer Text, Überbreite null bei 1360 px und 390 px, und die Suche mit Gegenprobe (ein
  kleines Werkzeug bleibt auffindbar, ein sinnloser Begriff liefert null Karten).

## Beobachtung, die als offener Punkt bleibt

In den aufklappbaren Abschnitten der beiden neuen Werkzeuge sitzt die erste Feldspalte auf der
Zeile der Zusammenfassung, ihr Eingabefeld darunter; Beschriftungen bleiben lesbar und richtig
zugeordnet. Ursache liegt im gemeinsamen Aufbau (`details > summary` plus `.form-grid`), nicht in
den neuen Werkzeugen. Noch nicht gegen ein Werkzeug der Wellen A/B verglichen — bewusst nicht
nebenbei umgebaut, um die Welle nicht mit einer Stiländerung an allen zwölf Werkzeugflächen zu
vermischen.

## Stand

Nicht gepusht. Veröffentlichung nur auf ausdrücklichen Auftrag.
