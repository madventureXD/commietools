# Welle E — technische Gewerke: Plan, Normfrage und Abnahmekriterien

**Datum:** 2026-10-06 · **Bearbeiter:** Faber · **Status:** Entscheidung Q2 gefallen, Bau beginnt

Grundlage: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Welle E, Q2) und
`03-konzepte/2026-10-06-normfrage-quellenlage.md` (Quellenlage, Anlage in
`06-protokolle/quellenlage-welle-e/`).

## 1. Entscheidungen (Thomas, 2026-10-06)

- **Q2 bestätigt für 14, 15, 16, 18:** eigene Werte aus **frei zugänglichen Behörden-, Verbands-
  und Herstellerquellen**, **je Wert die Quelle sichtbar**, **jeder Wert änderbar** (nicht fest
  verdrahtet). Keine Normtabelle, kein Normtext, kein Norm-Nachschlagewerk.
- **Q2-Sonderfall 13:** Die Strombelastbarkeit kommt **nicht** als Tabelle ins Werkzeug, sondern
  als **Eingabefeld** (Wert aus der Tabelle des Nutzers). Das Werkzeug rechnet den **Spannungsfall**
  und prüft ihn gegen die eingegebene Belastbarkeit.
- **Reihenfolge (technische Entscheidung, Faber):** 18 Gewinde → 14 Beleuchtung → 16 Heizlast →
  15 Rohrdimensionierung → 13 Leitungsquerschnitt.

## 2. Gemeinsame Regeln für alle fünf Werkzeuge

- **Rechnen statt abschreiben, wo es geht** (Kernloch, Spannungsfall, Volumenstrom, Transmission).
- **Wertetafel je Zeile mit Quelle** (Quellentyp + Abrufdatum 2026-10-06), jeder Wert änderbar.
- **Nicht Belegtes wird Eingabefeld** — nicht geschätzt, nicht weggelassen. Die Liste des nicht
  Belegten steht in der Quellenlage und wird je Werkzeug in den Annahmen benannt.
- **Abgrenzungshinweis** sichtbar: 13 und 16 sind Vorplanung/Überschlag und ersetzen keine
  Fachkraft bzw. keine normgerechte Berechnung; Richtwerte (Anzugsmomente, Strömungsgeschwindigkeit)
  werden als Richtwerte mit Spanne gekennzeichnet.
- Katalogpflicht je Sprache: `summary` (≤ 120 Zeichen), `terms` mit `#Tag`, Symbol, Dateivertrag,
  `catalog:generate` vor jeder Prüfung. Drei Sprachen.
- Nachweis im Browser (Edge kopflos), Werte **zurückgelesen** und gegen die Quelle geprüft.

## 3. Werkzeuge und Abnahmekriterien

### 18 — Gewinde, Bohrungen und Anzugsmomente (`threads`)

- **Zweck:** Metrisches Regel- und Feingewinde: Kernloch, Kerndurchmesser, Durchgangsloch,
  Schlüsselweiten, Anzugsmomente als Richtwerte.
- **Besonderheit:** Kernloch **rechnen** (≈ d − P), nicht aus einer Tabelle; Steigungen als einzelne
  Tatsachen mit Quelle; Anzugsmomente als Spanne (10–20 % Streuung) und Richtwert gekennzeichnet;
  **zwei Schlüsselweiten-Reihen** (alte DIN-Reihe gegen aktuelle ISO-Reihe) auswählbar, nicht vermischt.
- **Abnahmekriterien:** (1) Kernloch stimmt gegen die Rechenregel und gegen die belegten Tabellenwerte
  der Quellen, inkl. Feingewinde; (2) beide Schlüsselweiten-Reihen liefern die belegten Werte und sind
  unterscheidbar beschriftet; (3) Anzugsmomente erscheinen als Spanne mit Kennzeichnung; (4) nicht
  belegte Größen (Durchgangsloch-Zweitquelle, geschmierte Einzelmomente, Zoll-Feingewinde) sind
  Eingabefeld oder ausdrücklich als nicht belegt benannt; (5) Prüfläufe und Browser-Beleg grün.

### 14 — Beleuchtungsplanung nach Lux (`lighting`)

- **Zweck:** Raumtyp → Soll-Lux (auswählbar), Fläche und Wartungsfaktor → Lichtstrom und Leuchtenzahl.
- **Abnahmekriterien:** (1) Soll-Lux-Tafel aus ASR A3.4/DGUV mit Quelle je Zeile; (2) bei den
  streitigen Raumtypen (Umkleide, Lager, Flur, Unterricht, Werkstatt) wird die **Spanne** der Quellen
  gezeigt statt einer Scheingenauigkeit; (3) Gleichmäßigkeit nur als Eingabe, nicht behauptet;
  (4) Wartungsfaktor als Eingabe mit belegter Bandbreite als Hinweis; (5) Prüfläufe und Beleg grün.

### 16 — Heizlast-Überschlag je Raum (`heatload`)

- **Zweck:** Vereinfachter Überschlag aus Transmission (U·A·ΔT) und Lüftung je Raum.
- **Abnahmekriterien:** (1) Bezeichnung und Hinweis trennen den Überschlag **sichtbar** von einer
  normgerechten Heizlastberechnung (DIN EN 12831 wird ausdrücklich nicht gerechnet); (2) U-Werte aus
  der BBSR-Beispielsammlung mit Quelle je Zeile, änderbar; (3) **Außen-Auslegungstemperatur ist
  Eingabefeld** (nicht frei belegt) und wird nicht vorbelegt; (4) Rechnung gegen handgerechnete Fälle
  geprüft (Fläche, ΔT, Luftwechsel); (5) Prüfläufe und Beleg grün.

### 15 — Rohrdimensionierung, Volumenstrom, Druckverlust (`pipes`)

- **Zweck:** Leistung und Spreizung → Volumenstrom → DN-Vorschlag mit Geschwindigkeitsprüfung.
- **Abnahmekriterien:** (1) Volumenstrom gegen handgerechnete Fälle; (2) Rohr-Innenmaße als
  **Auswahl** je Rohrart (Kupfer/Stahl/Verbund mit den unterschiedlichen Wanddicken) — nichts fest
  verdrahtet, Quelle je Zeile; (3) Wasser-Daten (Dichte, Viskosität) aus den belegten Tabellen;
  (4) Geschwindigkeit als **Richtwert mit Spanne** gekennzeichnet; (5) kein Norm-PDF von Dritt-Hosts
  als Quelle; (6) Prüfläufe und Beleg grün.

### 13 — Leitungsquerschnitt und Spannungsfall (`cable`)

- **Zweck:** Spannungsfall rechnen und prüfen; Querschnittsvorschlag aus dem Spannungsfallkriterium.
- **Abnahmekriterien:** (1) **keine** Strombelastbarkeitstabelle im Werkzeug — der Wert ist
  Eingabefeld, und das steht sichtbar dabei („Wert aus Ihrer Tabelle/Norm entnehmen"); (2) Rechnung
  ein- und dreiphasig gegen handgerechnete Fälle, κ Cu 56 / Al 35 als änderbare Annahme; (3) die
  Grenzen 3 % / 5 % werden angewendet und als belegt benannt; (4) der Hinweis „Vorplanung, ersetzt
  keine Elektrofachkraft" steht sichtbar im Werkzeug; (5) Prüfläufe und Beleg grün.

## 4. Aufwand

Schätzung nach Referenzklasse (Welle D: drei Werkzeuge in einer Sitzung): **5–7 Sitzungen** für fünf
Werkzeuge mit belegter Datenbasis, davon ist die Quellenarbeit **erledigt**. Fehlermarge nach oben
offen. Je Werkzeug ein eigener Commit; Nachweis im Browser je Werkzeug.
