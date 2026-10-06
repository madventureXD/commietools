# Werkzeug 16 — Heizlast-Überschlag je Raum

**Zweck:** Datenbasis für einen vereinfachten Heizlast-**ÜBERSCHLAG**
(Transmission `Q_T = Σ U · A · ΔT` plus Lüftung `Q_L = ρ · c_p · n · V · ΔT`).

**Ausdrückliche Abgrenzung:** Dies ist **KEINE** normgerechte Heizlastberechnung
nach DIN EN 12831. Es wird **nicht** nach einer Norm gerechnet; es werden nur
frei zugängliche, öffentlich belegte **Erfahrungs-/Beispielwerte** als
Rechengrundlage verwendet. Nach einer Norm zu rechnen ist rechtlich erlaubt,
Normtabellen zu übernehmen nicht (OLG Hamburg, Az. 3 U 220/15). Deshalb stammen
alle Werte unten aus Behörden-, Verbraucherberatungs- und öffentlichen
Leitfadenquellen, **nicht** aus kostenpflichtigen Normtabellen.

- **Abrufdatum aller Quellen: 2026-10-06**
- Alle Werte sind als **Richtwerte / Bandbreiten** zu verstehen, nicht als
  Berechnungsnormwerte.

---

## (a) Wärmedurchgangskoeffizienten (U-Werte) für Bauteile eines Bestandsgebäudes

### a.1 Beispielhafte U-Werte nach Konstruktion (Bundesbehörde)

Quelle: **BBSR / GEG-Infoportal „Beispiele für U-Werte"**
(Bundesinstitut für Bau-, Stadt- und Raumforschung im Bundesamt für Bauwesen und
Raumordnung, Datum 03.04.2017).
URL: https://www.bbsr-geg.bund.de/GEGPortal/DE/Praxishilfen/Wirtschaftlichkeit/Tabellen/PDF/UWerte_DL.pdf
Quellentyp: **Bundesbehörde / öffentlicher Leitfaden** · Abruf: 2026-10-06

| Bauteil | Konstruktion | Baujahr | U-Wert [W/m²K] |
|---|---|---|---|
| Außenwand | Mauerwerk, monolithisch: 36,5 cm Vollziegel, verputzt | vor 1918 | 1,65 |
| Außenwand | Fachwerk: 16 cm Holzständer-Gefach, Lehmputz | vor 1918 | 1,66 |
| Außenwand | Mauerwerk, monolithisch: 38 cm Bimshohlblocksteine, verputzt | 1947–78 | 1,14 |
| Außenwand | Mauerwerk, zweischalig: 24 cm Hochlochziegel, 6 cm Luftschicht, 11,5 cm Vormauerschale | 1969–78 | 1,01 |
| Außenwand | Mauerwerk, verkleidet: 24 cm Kalksand-Lochstein, 3 cm Dämmung | 1969–78 | 0,78 |
| Außenwand | Mauerwerk, gedämmt: 36,5 cm Hochlochziegel + 12 cm Dämmung, saniert | saniert | 0,24 |
| Außenwand | Mauerwerk, gedämmt: 36,5 cm Vollziegel + 16 cm Dämmung | saniert | 0,22 |
| Dach | Steildach, Holzkonstruktion: belüftet, Tonziegel, 1 cm Schilfrohrmatte | bis 1948 | 1,96 |
| Dach | Steildach: 5 cm Holzwolle-Leichtbauplatte, verputzt | 1949–57 | 1,06 |
| Dach | Steildach: Sparren mit 4 cm Dämmung, belüftet | 1958–68 | 0,60 |
| Dach | Steildach: Sparren mit 4 cm Dämmung, Gipskarton, verputzt | 1948–78 | 0,95 |
| Oberste Geschossdecke | Holzkonstruktion: Holzbalken mit Schüttung + ruhender Luftschicht | bis 1948 | 0,82 |
| Oberste Geschossdecke | Betondecke: 15 cm Beton, 2,5 cm Dämmung, schwimmender Estrich | 1949–57 | 1,61 |
| Oberste Geschossdecke | Holzkonstruktion: Holzbalken mit Schlacke + ruhender Luftschicht | 1949–68 | 0,64 |
| Oberste Geschossdecke | Betondecke: 18 cm Beton, 5 cm schwimmender Estrich (ungedämmt) | 1949–68 | 2,46 |
| Oberste Geschossdecke | Betondecke, gedämmt: 19 cm Beton, 5 cm Estrich + 14 cm Dämmung | saniert | 0,22 |
| Kellerdecke | Holzbalkendecke: 16 cm Holzbalken/Lehmschlag, 2 cm Bretter, 2,5 cm Diele | bis 1918 | 1,13 |
| Kellerdecke | Kappendecke: 12 cm Kappendecke Vollziegel, Lagerhölzer/Schüttung | bis 1948 | 1,10 |
| Kellerdecke | Betondecke: 16 cm Betondecke, 6 cm Verbundestrich | 1919–49 | 1,94 |
| Kellerdecke | Betondecke: 15 cm Beton, 2,5 cm Dämmung, 1 cm Estrich | 1949–57 | 0,93 |
| Kellerdecke | Betondecke: 14 cm Beton, 4 cm Dämmung, 4 cm schwimmender Estrich | 1969–78 | 0,68 |
| Kellerdecke | Betondecke, gedämmt: 15 cm Beton, 4 cm Dämmung + 12 cm Dämmung | saniert | 0,22 |
| Fenster | Fenster mit Einfachglas | bis 1978 | 4,70 |
| Fenster | Verbund- und Kastenfenster | bis 1978 | 2,40 |
| Fenster | Fenster mit unbeschichtetem Isolierglas | 1979–95 | 2,70 |

> Hinweis: Die Werte sind **beispielhaft** („Beispiele für U-Werte") und dienen
> der Orientierung, nicht als Nachweiswerte.

### a.2 Übersicht nach Baujahr (Verbraucher-/Energieberatungsquelle)

Quelle: **Sanier.de „U-Werte von Gebäudeteilen und Bauteilkonstruktionen"**
(Kommerzielle Energieberatungs-/Serviceplattform; Werte decken sich mit der
Baualtersklassen-Logik öffentlicher Leitfäden; als **Plausibilisierung**, nicht
als Behördenquelle geführt).
URL: https://www.sanier.de/wissen/u-werte-von-gebaeudeteilen-und-bauteilkonstruktionen
Quellentyp: **kommerziell / Energieberatung** · Abruf: 2026-10-06

| Bauteil | ~1900 | 1950–1970 | 1970–1990 | 1990–2000 |
|---|---|---|---|---|
| Außenwand | 1,3–1,7 | 1,1–1,5 | 0,7–1,0 | 0,4–0,6 |
| Dach (Steildach) | 1,0–1,5 | 0,9–1,3 | 0,6–0,9 | 0,3–0,5 |
| Flachdach | 1,2–1,6 | 1,0–1,4 | 0,7–1,0 | 0,4–0,6 |
| Oberste Geschossdecke | 1,0–1,5 | 0,9–1,3 | 0,6–0,9 | 0,3–0,5 |
| Fenster (Uw) | 4,0–5,0 | 3,0–4,0 | 2,0–3,0 | 1,5–2,0 |
| Außentüren (Ud) | 3,0–4,0 | 2,5–3,5 | 2,0–3,0 | 1,5–2,0 |
| Kellerdecke/Bodenplatte | 1,0–1,5 | 0,9–1,3 | 0,6–0,9 | 0,3–0,5 |

*(alle Werte in W/m²K)*

### a.3 Einzelwert: ungedämmte Bestandsmauer

Quelle: **Verbraucherzentrale NRW, „Fassadendämmung" (Broschüre 03/2025)**
URL: https://www.verbraucherzentrale.nrw/sites/default/files/2025-03/fassadendammung_03_2025.pdf
Quellentyp: **staatlich geförderte Verbraucherberatung** · Abruf: 2026-10-06

- Alte Außenwand 24 cm, ungedämmt (Häuser vor 1978): **U = 1,5 W/m²K**
- Gleiche Wand + 18 cm Außendämmung: **U = 0,17 W/m²K**
- (ältere Ausgabe 2019: ungedämmt 1,4 → gedämmt +14 cm = 0,2)

### a.4 Innentrennwände

**NICHT BELEGT als öffentlicher Richtwert.** Für Innentrennwände zwischen
beheizten Räumen ist der U-Wert für einen Heizlast-**Überschlag**
vernachlässigbar (`ΔT ≈ 0`); ein üblicher Richtwert (z. B. ~1,0–1,5 W/m²K für
unbeheizte Massivwand) konnte in den abgerufenen Behörden-/Verbraucherquellen
**nicht belegt** werden und wird deshalb hier **nicht angesetzt**. Für beheizte
Räume gegen unbeheizte Nachbarräume gilt die Kategorie „Decken/Wände gegen
unbeheizte Räume" (siehe GEG-Höchstwerte, Abschnitt a.5).

### a.5 Rechtliche Höchstwerte bei Sanierung (GEG) — nur zur Orientierung

Quelle: **GEG Anlage 7**, gesetze-im-internet.de (amtlicher Gesetzestext)
URL: https://www.gesetze-im-internet.de/geg/anlage_7.html
Quellentyp: **Gesetz / amtliche Quelle** · Abruf: 2026-10-06

Diese Werte sind **Sanierungs-Höchstwerte** (Maximalwerte, die nach Sanierung
nicht überschritten werden dürfen), **keine** typischen Bestands-U-Werte:

- Außenwände: U = 0,24 W/m²K
- Fenster (Uw): U = 1,3 W/m²K · Dachflächenfenster: 1,4 · Verglasung (Ug): 1,1
- Dachflächen / oberste Geschossdecke: 0,24 · Dachfläche mit Abdichtung: 0,20
- Kellerdecke/Bodenplatte + Wände gegen Erdreich/unbeheizt: 0,30
- Außentüren: 1,8 W/m²K (Türfläche)

---

## (b) Innenraum-Solltemperaturen je Raumnutzung

### b.1 Empfehlung Umweltbundesamt (Bundesbehörde)

Quelle: **Umweltbundesamt, „Richtiges Heizen schützt das Klima und den Geldbeutel"**
URL: https://www.umweltbundesamt.de/umwelttipps-fuer-den-alltag/richtiges-heizen-schuetzt-das-klima-den-geldbeutel
Quellentyp: **Bundesbehörde** · Abruf: 2026-10-06

- Wohnbereich: **≤ 20 °C** („möglichst nicht mehr als 20 °C")
- Küche: **18 °C**
- Schlafzimmer: **17 °C**
- Absenkung bei Abwesenheit: **18 °C** (kurz) bis **15 °C** (wenige Tage)

### b.2 Weitere öffentlich zugängliche Richtwerte (Bandbreiten)

Quellen (Übersichten/Ratgeber, als Bandbreiten-Richtwerte):
- **Wikipedia „Raumtemperatur"** (Bezugswert Gebäudetechnik: 20–21 °C für
  Wohnräume; Küche/Schlafzimmer 16–18 °C) — Quellentyp: **Enzyklopädie**
  (belegt sich u. a. auf VDI/DIN-Berechnungsbezug), Abruf 2026-10-06.
  URL: https://de.wikipedia.org/wiki/Raumtemperatur
- **EnBW-Ratgeber „Heizen und Lüften"** (Flur/Schlafzimmer 16–18 °C, Küche
  16–18 °C, Wohnzimmer 20–22 °C, Bad 22–24 °C) — Quellentyp: **kommerzieller
  Versorgungs-Ratgeber**, Abruf 2026-10-06.
  URL: https://www.enbw.com/blog/wohnen/energie-sparen/tipps-fuer-das-richtige-heizen-und-lueften

| Raum | Richtwert-Spanne | bevorzugter Ansatz für Überschlag |
|---|---|---|
| Wohnzimmer / Wohnraum | 20–22 °C | **20 °C** |
| Schlafzimmer | 16–18 °C | **17 °C** |
| Küche | 18–20 °C | **18 °C** |
| Bad / Badezimmer | 22–24 °C | **22 °C** |
| Flur | 15–18 °C | **16 °C** |

> Für den Überschlag wird je Raum die Solltemperatur gewählt und ΔT =
> (Solltemperatur − Norm-Außentemperatur) gebildet. Die Norm-Außentemperatur
> selbst ist **NICHT BELEGT** in den abgerufenen Quellen (siehe unten) — sie ist
> projekt-/regionabhängig (Auslegungstemperatur) und muss separat gewählt werden.

---

## (c) Übliche Luftwechselraten (n, in h⁻¹) für Fensterlüftung in Wohnräumen

**Alle Werte sind RICHTWERTE**, keine Nachweiswerte.

### c.1 Hygienischer Mindest-/Nennluftwechsel

Quelle: **DIN 1946-6 — Vortrag „Lüften nach Konzept", Umweltamt/Verbraucher-
zentrale Düsseldorf** (Behörde; referiert die Norm, ohne Normtabelle zu
übernehmen)
URL: https://www.duesseldorf.de/fileadmin/Amt19/umweltamt/klimaschutz/pdf/klimaschutz/20140410_lueften_nach_konzept_din_1946_6.pdf
Quellentyp: **Kommune/Behörde (Vortragsfolien)** · Abruf: 2026-10-06

- **Nennlüftung: n = 0,5 h⁻¹** („alle 2 Stunden Luftaustausch") — Zielwert
  gemäß DIN 4108-2 bzw. DIN 1946-6.
- Tatsächlicher Luftaustausch **nur über Gebäudeundichtheit**:
  - normale (unsanierte) Gebäude: **0,2–0,30 h⁻¹**
  - modernisierte/dichte Gebäude: **0,1–0,15 h⁻¹**
- Konsequenz der Quelle: „Der Luftaustausch allein über die Gebäudeundichtheiten
  gewährleistet keinen ausreichenden Luftwechsel!" → nutzerunterstützte
  Fensterlüftung erforderlich.

### c.2 Luftwechselraten für die Energiebilanz

Quelle: **IWU / Hessisches Min. f. Umwelt, Energie, Landwirtschaft und
Verbraucherschutz, „Lüftung im Wohngebäude" (Energiespar-Information Nr. 8, 10/04,
Überarb. 11/12)**
URL: https://www.iwu.de/fileadmin/publikationen/buergerinfo/espi/espi8.pdf
Quellentyp: **Forschungsinstitut + Landesministerium** · Abruf: 2026-10-06

- Gering/selten belegt: **n = 0,3–0,4 h⁻¹** (hygienisches Minimum)
- EnEV-Ansatz normal undichte Gebäude: **n = 0,7 h⁻¹**
- EnEV-Ansatz luftdichte Gebäude (n50 ≤ 3 h⁻¹): **n = 0,6 h⁻¹**
- Relativer Lüftungsanteil an den Gesamtwärmeverlusten: Altbau ~35 %,
  EnEV-Gebäude ~45 %, Niedrigenergiehaus ~62 % (bzw. „bis zu 2/3").

### c.3 Dichtheit (n50) als Randbedingung

Quelle: **EWE Ratgeber „Luftwechselrate"** (Versorgungsunternehmen)
URL: https://www.ewe.de/waerme/ratgeber/luftwechselrate
Quellentyp: **kommerzieller Ratgeber** · Abruf: 2026-10-06

- Gemäß EnEV darf die **n50-Luftwechselrate** in Gebäuden ohne Abluft-/
  Lüftungsanlagen **nicht mehr als 3 h⁻¹** betragen.

### c.4 Fensterlüftung — Mess-/Regelwerk

Quelle: **BAuA-Bericht „Lüftungsregeln für freie Lüftung" (Forschungsbericht
F2072)**
URL: https://www.baua.de/DE/Angebote/Publikationen/Berichte/F2072.pdf
Quellentyp: **Bundesanstalt für Arbeitsschutz und Arbeitsmedizin (Bundesbehörde)**
· Abruf: 2026-10-06

- Enthält u. a. eine Luftwechsel-Tabelle (nach DALER) sowie CO₂-Kriterien
  (Pettenkofer-Richtwert 1.000 ppm; Außenluft 350–400 ppm). Als Grundlage für
  die Annahme „Fensterlüftung liefert den hygienisch nötigen Luftwechsel" sowie
  für die Abhängigkeit von Temperaturdifferenz, Fensteröffnungsfläche und Wind.

**Für den Überschlag empfohlener Ansatz (Richtwert):**
- unsaniert/undicht (Altbau): **n ≈ 0,5–0,7 h⁻¹**
- dicht/modernisiert, Nutzer fensterlüftet: **n ≈ 0,4–0,5 h⁻¹**
- dichte Hülle, nur Infiltration: **n ≈ 0,1–0,3 h⁻¹**

---

## (d) Stoffdaten von Luft (Normbedingungen)

### d.1 Werte und Quellen

| Größe | Wert | Quelle | Quellentyp | URL |
|---|---|---|---|---|
| Dichte ρ (20 °C, ~1 bar) | **1,189 kg/m³** | stoffdaten-online.de | Fachdatenbank | https://stoffdaten-online.de/luft/ |
| Dichte ρ (0 °C Normalbed., 1013,25 hPa) | **1,293 kg/m³** | chemie.de Lexikon „Luftdichte" | Fachlexikon | https://www.chemie.de/lexikon/Luftdichte.html |
| Dichte ρ (23 °C, 50 % rF, DIN EN ISO 10456) | **1,23 kg/m³** | energie-m Wiki „Luft" | Fach-Wiki (BMI-Bezug) | https://wiki.energie-m.de/Luft |
| spez. Wärmekapazität c_p (20 °C) | **1,006 kJ/kg·K = 1006 J/kg·K** | energie-m Wiki „Luft" / stoffdaten-online | Fach-Wiki / Fachdatenbank | siehe oben |
| spez. Wärmekapazität c_p (isobar, allgemein) | **1005 J/kg·K** | stoffdaten-online.de | Fachdatenbank | https://stoffdaten-online.de/luft/ |
| spez. Wärmekapazität c_p (23 °C, DIN EN ISO 10456) | **1008 J/kg·K** | energie-m Wiki „Luft" | Fach-Wiki | https://wiki.energie-m.de/Luft |
| Gas-/Wärmekapazität c_v (isochor) | 718 J/kg·K | stoffdaten-online.de | Fachdatenbank | https://stoffdaten-online.de/luft/ |

Abrufdatum aller: **2026-10-06**.

### d.2 Empfehlung für den Überschlag

Für die Lüftungswärme, gerechnet mit **Volumenstrom über die Luftwechselrate**:

```
Q_L = ρ · c_p · n · V_Raum · ΔT
```

- **ρ = 1,2 kg/m³** (Normbedingungen, gerundet; Bereich 1,19–1,29 je nach
  Bezugstemperatur)
- **c_p = 1005 J/(kg·K)**
- Das Produkt **ρ · c_p ≈ 1200 J/(m³·K)** ist der in der Baupraxis übliche
  Ansatz. (Achtung: 1,2 · 1005 ≈ 1206 J/m³K.)

---

## Widersprüche zwischen den Quellen (nicht geglättet)

1. **Definition „Normbedingungen" für Luftdichte:**
   - **0 °C** (DIN 1343 / klassische Normbedingungen) → **ρ = 1,293 kg/m³**
     (chemie.de).
   - **20 °C** (Normbedingungen im Sinne der Baumphysik, 1 bar) →
     **ρ = 1,189 kg/m³** (stoffdaten-online.de).
   - **23 °C / 50 % rF** (DIN EN ISO 10456) → **ρ = 1,23 kg/m³** (energie-m).
   → Diese Werte widersprechen sich **scheinbar**; Ursache ist der unterschiedliche
   Bezugspunkt (0/20/23 °C), nicht ein Fehler. Für den Überschlag muss der
   Bezugspunkt explizit festgelegt werden.

2. **c_p-Wert:** Quellen nennen **1005** (isobar, Näherung), **1006** (20 °C) und
   **1008 J/(kg·K)** (23 °C nach DIN EN ISO 10456). Differenz < 0,3 %, praktisch
   vernachlässigbar — aber es gibt keinen einzelnen „richtigen" Wert.

3. **Fenster-U-Wert nach Baujahr:**
   - BBSR (2017): Einfachglas **4,70**, Verbund-/Kastenfenster **2,40**,
     unbeschichtetes Isolierglas **2,70** W/m²K.
   - Sanier.de: Fenster ~1900 **4,0–5,0**, 1950–70 **3,0–4,0**, 1970–90
     **2,0–3,0** W/m²K.
   → Bandbreiten überlappen, aber die Klassen sind unterschiedlich geschnitten;
   die Quellen sind nicht 1:1 deckungsgleich.

4. **Raumtemperatur Schlafzimmer:** Umweltbundesamt nennt **17 °C** (konkret),
   Wikipedia/Ratgeber nennen **16–18 °C**. Kein echter Widerspruch, aber der
   Sollwert ist eine **Wahl**, keine binäre Zahl.

5. **Luftwechselraten:** DIN-1946-6-basierte Folien (Behörde) setzen Nennlüftung
   **0,5 h⁻¹** an; IWU/EnEV setzen für die Energiebilanz **0,6–0,7 h⁻¹** an;
   die reine Infiltration liegt bei **0,1–0,3 h⁻¹**. Die Werte beziehen sich auf
   **unterschiedliche Betrachtungen** (Hygiene-Nennlüftung vs. Jahres-
   Energiebilanz vs. Undichtheit) und dürfen nicht vermischt werden.

---

## NICHT BELEGT (bewusst offen gelassen, nicht geschätzt)

- **Außen-Auslegungstemperatur** (Norm-Außentemperatur bzw. „kältester Tag"):
  in den abgerufenen freien Quellen **nicht** als Wert belegt. Regional/projekt-
  abhängig; muss für einen Überschlag separat (z. B. ortsbezogen) angenommen
  werden.
- **U-Wert Innentrennwände** zwischen beheizten Räumen: kein belegter Richtwert
  gefunden.
- **U-Wert Erdreich/eroberührt** für Bestandskonstruktionen: in den abgerufenen
  Quellen nur als GEG-Höchstwert (0,30) belegt, nicht als Bestands-Beispielwert.
- **Wärmebrücken-Zuschläge** und **solare Gewinne**: nicht Teil dieser Recherche;
  für einen reinen Überschlag ggf. pauschal, aber hier **nicht belegt**.
- **Konkrete Fensterlüftungs-Luftwechselrate für eine einzelne Stoßlüftung**
  (Kipp-/Stoßlüftung, Dauerabhängig): BAuA liefert Zusammenhänge, aber keinen
  einzelnen Pauschalwert — daher nicht als Zahl übernommen.

---

## Quellenverzeichnis (Kurz)

| Nr. | Quelle | Typ | URL |
|---|---|---|---|
| 1 | BBSR / GEG-Infoportal „Beispiele für U-Werte" (2017) | Bundesbehörde | https://www.bbsr-geg.bund.de/GEGPortal/DE/Praxishilfen/Wirtschaftlichkeit/Tabellen/PDF/UWerte_DL.pdf |
| 2 | GEG Anlage 7 (gesetze-im-internet.de) | Gesetz | https://www.gesetze-im-internet.de/geg/anlage_7.html |
| 3 | Verbraucherzentrale NRW „Fassadendämmung" (03/2025) | Verbraucherberatung | https://www.verbraucherzentrale.nrw/sites/default/files/2025-03/fassadendammung_03_2025.pdf |
| 4 | Umweltbundesamt „Richtiges Heizen" | Bundesbehörde | https://www.umweltbundesamt.de/umwelttipps-fuer-den-alltag/richtiges-heizen-schuetzt-das-klima-den-geldbeutel |
| 5 | Wikipedia „Raumtemperatur" | Enzyklopädie | https://de.wikipedia.org/wiki/Raumtemperatur |
| 6 | Sanier.de „U-Werte von Gebäudeteilen" | Energieberatung (kommerziell) | https://www.sanier.de/wissen/u-werte-von-gebaeudeteilen-und-bauteilkonstruktionen |
| 7 | EnBW Ratgeber „Heizen und Lüften" | Versorger-Ratgeber | https://www.enbw.com/blog/wohnen/energie-sparen/tipps-fuer-das-richtige-heizen-und-lueften |
| 8 | DIN 1946-6 Folien, Umweltamt Düsseldorf | Kommune/Behörde | https://www.duesseldorf.de/fileadmin/Amt19/umweltamt/klimaschutz/pdf/klimaschutz/20140410_lueften_nach_konzept_din_1946_6.pdf |
| 9 | IWU/Hess. Ministerium „Lüftung im Wohngebäude" | Institut + Landesministerium | https://www.iwu.de/fileadmin/publikationen/buergerinfo/espi/espi8.pdf |
| 10 | EWE Ratgeber „Luftwechselrate" | Versorger-Ratgeber | https://www.ewe.de/waerme/ratgeber/luftwechselrate |
| 11 | BAuA-Bericht F2072 „Lüftungsregeln für freie Lüftung" | Bundesbehörde | https://www.baua.de/DE/Angebote/Publikationen/Berichte/F2072.pdf |
| 12 | stoffdaten-online.de „Luft" | Fachdatenbank | https://stoffdaten-online.de/luft/ |
| 13 | chemie.de Lexikon „Luftdichte" | Fachlexikon | https://www.chemie.de/lexikon/Luftdichte.html |
| 14 | energie-m Wiki „Luft" | Fach-Wiki | https://wiki.energie-m.de/Luft |

**Stand: 2026-10-06. Alle Werte sind Richtwerte. Kein Ersatz für eine
normgerechte Heizlastberechnung nach DIN EN 12831.**
