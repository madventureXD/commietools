# Übergabe: Suite „Rechnen" — Welle 4 (Umrechnen, Zeit und Datum)

**Datum:** 2026-10-03
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Status:** abgeschlossen und im Artefakt geprüft — **Welle 4 ist abgenommen**

## Ergebnis

**Umrechnen (`convert`)** — fünf Arten in einem Werkzeug:

- **Einheiten**: Länge, Fläche, Volumen, Masse, Temperatur, Druck, Kraft, Energie, Leistung,
  Geschwindigkeit — die Faktoren werden zur Laufzeit **aus der Einheitenbibliothek gemessen**,
  nicht aus einer Tabelle abgeschrieben
- **Winkel**: Grad, Bogenmaß, Gon, Winkelminute, Winkelsekunde
- **Zahlensysteme**: Basis 2 bis 36 in `BigInt`, beliebig große ganze Zahlen
- **Zoll und Maß**: Zollbruch → Millimeter und zurück (gekürzter Bruch, Nenner 2 bis 64)
- **Kalender**: 18 Kalender vorwärts **und** zurück

**Zeit und Datum (`datetime`)** — sechs Rechnungen:

- Abstand zwischen zwei Daten (Tage, Wochen, Resttage, volle Monate, volle Jahre, Arbeitstage)
- Datum verschieben über Monats- und Jahresgrenzen
- Arbeitstage (Montag bis Freitag)
- Kalenderwoche nach ISO 8601 mit Wochentag, Tag im Jahr, Schaltjahr
- **Fristen nach BGB** §§ 187, 188, 193
- Zeitdauern für den Stundenzettel (`1:30`, `1,5h`, `90min`, `2h 15m`)

## Entscheidungen — und warum

- **Keine zweite Engine für Einheiten.** Die Umrechnung nutzt den vorhandenen Rechenkern
  (`calculator/core`) samt seiner mathjs-Instanz. Eine eigene Instanz hätte einen zweiten
  ~100-KiB-Chunk bedeutet.
- **Der `to`-Operator funktioniert im kuratierten Kern nicht.** Gemessen: `1 in to mm` endet mit
  `unsupported`. Die Umrechnung läuft deshalb über die Unit-API (`unit(...).to(...)`) — nicht
  über den Parser. Das war die zentrale technische Weiche dieser Welle.
- **`Temporal` nur nach Abfrage.** Ist `Temporal` nativ vorhanden (Edge 154: ja), wird es
  genutzt; sonst wird `@js-temporal/polyfill` 0.5.1 (ISC) **erst dann** nachgeladen.
- **Das Polyfill wird nicht vorgeladen.** Gemessen: 154 kB roh (~46 kB gzip). Über einen festen
  Chunk-Namen (`temporal`) ist es vom Vorabcache ausgenommen und liegt im Laufzeitcache — wie
  die PDF-Engines. Ohne diese Regel bekäme jeder Besucher es mitinstalliert.
- **`monthCode` statt Monatszahl** beim Rückweg: In Kalendern mit Schaltmonaten (hebräisch,
  chinesisch) ist die Monatszahl allein nicht eindeutig. Temporal nimmt `monthCode` nur im
  Property-Bag an, nicht im ISO-Text — das war ein Fehlversuch, der erst im Test auffiel.
- **Feiertage sind bewusst nicht enthalten.** Die Welle-4-Abnahme verlangt sie nicht; sie
  bräuchten einen Kalender je Bundesland. Steht als Grenze in der Oberfläche.

## Wichtige Korrektur an einer älteren Feststellung

Das Konzept hielt fest: **„4 von 17 Kalendern im Polyfill defekt"** (coptic, ethiopic, chinese,
dangi). **Mit 0.5.1 bestätigt sich das nicht.** Gemessen am 2026-10-03: alle 18 Kalender aus
`Intl.supportedValuesOf('calendar')` gehen **beide** Wege, der Rückweg für jeden. Der Test prüft
das jetzt dauerhaft und schlägt fehl, sobald ein Kalender bricht. Der Rückweg bleibt trotzdem in
einem `try/catch`: Schlägt er fehl, meldet der Kern „nicht unterstützt" und **rät kein Datum**.

## Prüfungen (alle bestanden)

| Prüfung | Ergebnis |
|---|---|
| `npm run licenses:generate` / `check` | 522 Pakete (2 neu), 16 Lizenztexte, 188 Dokumente |
| `npm run catalog:generate` / `check` | 37 Werkzeuge, 3 Sprachen, 2.458 Suchbegriffe, 89 Dateitypen |
| `npm run check` | grün: **248 Tests** in 14 Dateien, Typecheck |
| `npm run build` | grün |
| Startbündel | **216.392 B gzip** — Budget 250 KiB, eingehalten |
| Rechenkern-Chunk | **102.437 B gzip** — Gate 110 KiB, eingehalten |
| **Artefaktprüfung** Edge headless | 2 m → **200** cm · 100 °C → **212** °F · 180° → **3,1415926535898** rad · 255 in Basis 16 → **ff** · 3/4 Zoll → **19,05** mm · 3.10.2026 → **22. Tischri 5787 AM** · 5787 / Monat 1 / Tag 22 → **2026-10-03** · Frist 14 Tage ab 3.10.2026 → Beginn **04.10.**, rechnerisch **17.10.**, Ende **19.10.** (2 Tage verschoben) · 1:30 + 2:15 → **3:45** (3,75 h) · hell 1100 px, dunkel 390 px |

**Vier echte Fehler, die die Prüfungen fanden — alle behoben:**

1. **Faktoren mit Einheitenziffer** wurden nicht erkannt: Das Abschneiden des Zahlenteils lief
   über ein Muster am *Ende*, deshalb blieb bei `m2`/`m3` die Einheit stehen und `degF` wurde zu
   `de` zerlegt (`e` gilt auch als Exponentenzeichen). Jetzt wird die führende Zahl gelesen.
2. **`ha`, `mph` und `kn`** kennt mathjs nicht (`Unit "ha" not found`). Hektar heißt dort
   `hectare`; Meile je Stunde und Knoten sind als benannte Konstanten hinterlegt
   (1 mph = 1609,344 m/3600 s, 1 kn = 1852 m/3600 s).
3. **Temporal lehnt gemischte Vorzeichen** in einem Feldobjekt ab (`{ weeks: 2, days: -1 }` →
   `RangeError`) — die Subtraktion ist jetzt ein eigener Schritt.
4. **Der Monatsrückweg über `monthCode` im ISO-Text** ist nicht möglich; nur der Property-Bag
   nimmt ihn an.

**Eigene Fehlgriffe, offen benannt:** Drei Testerwartungen waren falsch und nicht der Code — der
japanische Kalender zeigt die Ära statt des gregorianischen Jahres, der 28.02.2026 ist ein
Samstag (also rutscht das Fristende zu Recht auf Montag), und vom 1.10. bis 31.10. ist es kein
voller Monat. Korrigiert wurden die Tests, nicht die Fachlogik.

## Offene Punkte

- **Startbündel wächst weiter:** 206.547 → 216.392 B gzip. Der Zuwachs dieser Welle ist
  überwiegend Sprachkatalog (zwei Werkzeuge × drei Sprachen). Noch im Budget, aber der Punkt
  steht schon länger auf der Liste.
- `npm run bundle:check` läuft weiterhin nur von Hand.
- Feiertage je Bundesland fehlen (bewusst).

## Empfohlener nächster Schritt

**Welle 5 – Mathematik**: Werkzeug 7 „Gleichungslöser", Werkzeug 6 „Statistik", Werkzeug 5
„Funktionsplotter" mit `function-plot` (64,5 KiB gzip) als ausdrücklich nachgeladenem Modul.
Dort gilt dieselbe Regel wie hier: neue Engine nur dynamisch, Chunk vom Vorabladen ausnehmen,
Budget nachmessen.

## Git

- Commit: **`8f00f01`** — `feat(rechner): wave 4 - units, angles, bases, inches and calendars; time and date`
- **Nicht gepusht** (gemeinsamer Upload, siehe Welle 2/3).
- Der Commit enthält den generierten Katalog und die erzeugten Lizenzdateien; fremde
  PDF-Änderungen im Arbeitsbaum bleiben unberührt.
