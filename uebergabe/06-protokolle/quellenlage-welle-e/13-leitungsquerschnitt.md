# Werkzeug 13 – Leitungsquerschnitt und Spannungsfall

**Frei zugängliche Quellen für Strombelastbarkeit und Spannungsfallgrenzen**

- Stand/Abrufdatum aller Quellen: **2026-10-06**
- Zweck: Belegsammlung für die Suite „Handwerk" der commietools.
- Grundsatz: Nach einer Norm zu *rechnen* ist erlaubt (Formeln sind frei). Eine Norm-*Tabelle* zu übernehmen ist es nicht. Daher hier: **einzelne Werte aus mehreren frei zugänglichen Quellen**, je Wert mit Quelle. Keine Tabellenwerke abgeschrieben, keine Normtexte eingebettet, keine kostenpflichtigen Regelwerke als Quelle.
- **Kategorien** der Quellen: `Herstellerangabe` | `Behörde/Vorschrift` | `Öffentliche Formelsammlung` | `Fachseite` | `Wiki (privat/kollaborativ)`

> Wichtiger Hinweis zur Quellenlage: Mehrere der hier genutzten Hersteller-Dokumente (ABB, Helukabel, Lapp, HELU) geben ausdrücklich an, dass ihre Zahlentabellen **Auszüge** aus den VDE-Normen sind, die mit Genehmigung des DIN/VDE für eine limitierte Auflage wiedergegeben wurden. Diese Genehmigung ist NICHT auf dieses Projekt übertragbar. Die Werte sind hier **als Beleg für die Größenordnung und als nachrechenbare Richtwerte** gelistet, nicht als zu übernehmende Normtabelle. Für die Rechenlogik ist die Normformel frei nutzbar; die Zahlen sollten aus eigener Rechnung bzw. aus den freien Quellen konsistent bestätigt werden.

---

## (a) Strombelastbarkeit von Leitungen/Kabeln (A)

### Randbedingungen (Standardfall)

- Leiterwerkstoff: Kupfer (Cu), PVC-isoliert
- Zulässige Betriebstemperatur am Leiter: **70 °C**
- Umgebungstemperatur: **30 °C** (Luft)
- Anzahl belasteter Adern: **3**
- Verlegearten nach üblicher Buchstabenordnung A1, A2, B1, B2, C, E

### A1. Kupfer, PVC, 70 °C Leiter, 30 °C Umgebung, 3 belastete Adern

| Querschnitt mm² | A1 | A2 | B1 | B2 | C | E |
|---|---|---|---|---|---|---|
| 1,5 | 13,5 | 13,0 | 15,5 | 15,0 | 17,5 | 18,5 |
| 2,5 | 18,0 | 17,5 | 21,0 | 20,0 | 24,0 | 25,0 |
| 4   | 24,0 | 23,0 | 28,0 | 27,0 | 32,0 | 34,0 |
| 6   | 31,0 | 29,0 | 36,0 | 34,0 | 41,0 | 43,0 |
| 10  | 42,0 | 39,0 | 50,0 | 46,0 | 57,0 | 60,0 |
| 16  | 56,0 | 52,0 | 68,0 | 62,0 | 76,0 | 80,0 |

**Quellen (unabhängig bestätigt):**
- `Herstellerangabe` – ABB STOTZ-KONTAKT, „Verlegearten und Strombelastbarkeit von Kabeln/Leitungen", Tabelle 2 (Spalten A1, A2, B1, B2, C: 3 belastete Adern; Spalten E: 3 belastete Adern). URL: https://search.abb.com/library/download.aspx?documentid=2cdc401002d0106&languagecode=de&documentpartid=&action=launch
- `Herstellerangabe` – HELUKABEL, „Kabel und Leitungen richtig auslegen", Tabellen „Verlegeart A1, A2, B1, B2" und „C und E" (Cu, 70 °C, 30 °C). URL: https://www.helu.com/helu/publikationen/allgemeine-dokumente/helu-kabel-leitungen-richtig-auslegen.pdf
- `Wiki (kollaborativ, Schneider Electric)` – Electrical Installation Wiki, Abb. G20a (A1/A2/B1/B2/C, 3 Adern) und G20b (E, 3 Adern). Werte für A1–C identisch mit ABB/Helukabel, E identisch (18,5/25/34/43/60/80). URL: https://de.electrical-installation.org/dewiki/Bestimmung_des_Leiterquerschnittes_von_Kabeln_und_Leitungen_nach_ihrer_Verlegeart

### A2. Aluminium (Al)

Die frei zugänglichen Quellen decken Aluminium **nicht im gleichen Umfang** ab wie Kupfer:

| Querschnitt mm² | A1 | A2 | B1 | B2 | C | E |
|---|---|---|---|---|---|---|
| 25 | 57 | 53 | 70 | 62 | 73 | – |
| 35 | 70 | 65 | 86 | 77 | 90 | – |
| 50 | 84 | 78 | 104 | 92 | 110 | – |

**Quelle:** `Wiki (kollaborativ, Schneider Electric)` – Electrical Installation Wiki, Abb. G20a (Aluminium, 3 Adern, PVC, 70 °C, 30 °C in Luft). A1/A2/B1/B2/C belegt; E-Grundtabelle für Al nicht in dieser Abbildung enthalten.
URL: https://de.electrical-installation.org/dewiki/Bestimmung_des_Leiterquerschnittes_von_Kabeln_und_Leitungen_nach_ihrer_Verlegeart

Ein weiterer Wert, für den in keiner Hersteller- oder Fachquelle ein Beleg am gleichen Randbedingungssatz gefunden wurde: Aluminium-16-mm²-Wert (48/60/54/66/63 A für A1/B1/B2/C/E) taucht nur auf einer kommerziellen Fachseite (elekrechner.com) auf, die ihrerseits die Norm als Quelle nennt, aber keine Primär-Bestätigung liefert — siehe **Widersprüche / NICHT BELEGT** unten. Der Wert wird hier deshalb **nicht** als belastbar übernommen.

---

## (b) Umrechnungsfaktoren

### B1. Andere Umgebungstemperaturen (bezogen auf 30 °C Basis)

Bezug: zulässige Betriebstemperatur am Leiter 70 °C (PVC) — Umrechnungsfaktor auf die Belastbarkeit nach (a).

| Umgebungstemp. °C | Faktor (70 °C Leiter) |
|---|---|
| 10 | 1,22 |
| 15 | 1,17 |
| 20 | 1,12 |
| 25 | 1,06 |
| 30 | 1,00 |
| 35 | 0,94 |
| 40 | 0,87 |
| 45 | 0,79 |
| 50 | 0,71 |
| 55 | 0,61 |
| 60 | 0,50 |
| 65 | 0,35 |

**Quellen:**
- `Herstellerangabe` – ABB, Tabelle 5, Spalte „70 °C". URL: https://search.abb.com/library/download.aspx?documentid=2cdc401002d0106&languagecode=de&documentpartid=&action=launch
- `Wiki (kollaborativ, Schneider Electric)` – Electrical Installation Wiki, Abb. G12, Spalte „70 °C". URL: https://de.electrical-installation.org/dewiki/Bestimmung_des_Leiterquerschnittes_von_Kabeln_und_Leitungen_nach_ihrer_Verlegeart

Zusätzlich aus denselben Quellen (für 90 °C Leiter / VPE): 10 °C→1,15; 30 °C→1,00; 50 °C→0,82; 60 °C→0,71; 70 °C→0,58; 80 °C→0,41; 85 °C→0,29.

### B2. Häufung (mehrere Stromkreise gebündelt)

Bezug: mehrere gleich belastete, gleichartige Kabel/Leitungen, Verlegeart B/C (gebündelt direkt auf Wand/Fußboden, im Rohr/Kanal).

| Anzahl Stromkreise/Kabel | Faktor (gebündelt) |
|---|---|
| 1 | 1,00 |
| 2 | 0,80 |
| 3 | 0,70 |
| 4 | 0,65 |
| 5 | 0,60 |
| 6 | 0,57 |
| 8 | 0,52 |
| 10 | 0,48 |
| 12 | 0,45 |
| 14 | 0,43 |

**Quellen (deckungsgleich, zusätzliche Stützstellen bei Schneider):**
- `Herstellerangabe` – ABB, Tabelle 7, Zeile „Gebündelt direkt auf der Wand, auf dem Fußboden, im Elektroinstallationsrohr oder -kanal…". URL: https://search.abb.com/library/download.aspx?documentid=2cdc401002d0106&languagecode=de&documentpartid=&action=launch
- `Wiki (kollaborativ, Schneider Electric)` – Abb. G16, Zeile „Gebündelt, direkt auf der Wand…" (dort zusätzlich n=7→0,54; 9→0,50; 16→0,41; 20→0,38). URL: https://de.electrical-installation.org/dewiki/Bestimmung_des_Leiterquerschnittes_von_Kabeln_und_Leitungen_nach_ihrer_Verlegeart

Ergänzend (vieladrige Kabel/Leitungen, > 3 belastete Adern) aus ABB/Helukabel/Lapp übereinstimmend: 5 Adern → 0,75; 7 → 0,65; 10 → 0,55; 14 → 0,50.
`Herstellerangabe` – Lapp T12, Tabelle 12-3. URL: https://contentmedia.lappcdn.com/e/lapp/fuk2Jf1cPlV6EesaZZFavA~~

---

## (c) Anerkannte Spannungsfallgrenzen

| Grenze | Geltungsbereich | Quelle | Kategorie |
|---|---|---|---|
| **0,5 %** | Hauptstromversorgungssystem, Hausanschlusskasten (HAK) bis Stromzähler; bis 100 kVA | NAV § 13 Abs. 4 (Niederspannungsanschlussverordnung) | `Behörde/Vorschrift` |
| **3 %** | Beleuchtungsstromkreise, vom Hausanschluss bis zum Verbrauchsmittel | DIN VDE 0100-520, Anhang G, Tabelle G.52.1 (referiert) | `Fachseite`/`Wiki` |
| **5 %** | Andere Verbrauchsmittel, vom Hausanschluss bis zum Verbrauchsmittel | DIN VDE 0100-520, Anhang G, Tabelle G.52.1 (referiert) | `Fachseite`/`Wiki` |
| **3 %** | Vom Zähler bis zur Steckdose/Geräteanschlussklemme | DIN 18015-1 (referiert) | `Fachseite`/`Wiki` |
| **0,5 %** | Hauptstromversorgungssystem (Harmonisierung NAV / VDE-AR-N 4100 / TAB) | TAB 2023, BDEW-Bundesmusterwortlaut, Abschnitt 6(5) | `Behörde/Verband` |

**Belege:**
- `Behörde/Vorschrift` – NAV § 13 Abs. 4, „Elektrische Anlagen", via Gesetze-im-Internet. URL: https://www.gesetze-im-internet.de/nav/__13.html
- `Behörde/Verband` – BDEW Bundesmusterwortlaut TAB 2023, Punkt (5): „… darf der Spannungsfall gemäß § 13 Abs. 4 NAV einen Wert von 0,5 % der Nennspannung nicht überschreiten." URL: https://www.bdew.de/media/documents/3000_BDEW_Bundesmusterwortlaut_TAB_2023_v20230502.pdf
- `Wiki (privat/kollaborativ)` – Wikipedia „Spannungsabfall" (gesichtete Version 16.05.2026), Abschnitt „Grenzwerte": referiert DIN VDE 0100-520 Tabelle G.52.1 (3 % Beleuchtung, 5 % andere), DIN 18015-1 (3 % Zähler→Steckdose), NAV § 13(4) (0,5 %). URL: https://de.wikipedia.org/wiki/Spannungsabfall
- `Fachseite` – iwer.info „Zulässiger Spannungsfall" (privat betriebene Elektrotechnik-Fachseite, ohne redaktionelle Prüfung; ausdrücklicher Hinweis des Betreibers). URL: https://iwer.info/article/Elektrotechnik/zulaessiger-Spannungsfall/index.html
- `Fachseite` – Elektropraktiker, Leseranfrage-Beitrag (2020): referiert den 3-%-Wert für Beleuchtung aus DIN VDE 0100-520 Anhang G, Tabelle G.52.1. URL: https://www.elektropraktiker.de/downloads/download/?file=42578&uid=11909

**Formel (frei, aus Wikipedia/DIN VDE 0100-520 Anhang G referiert):**

```
ΔU ≈ l · b · ( ρ/A · cos φ + X′ · sin φ ) · I
b = 1  (dreiphasig, symmetrisch)
b = 2  (einphasig, Hin- und Rückleitung)
```

- `Wiki (kollaborativ)` – Wikipedia „Spannungsabfall", Abschnitt „Norm für Niederspannungsnetze". URL: https://de.wikipedia.org/wiki/Spannungsabfall
- `Fachseite` – lightrechner.com gibt die vereinfachte Form ΔU = (2 · L · I · cos φ)/(κ · A) für einphasig (Faktor √3 statt 2 bei Drehstrom). URL: https://lightrechner.com/tabellen/spannungsabfall-grenzwerte

---

## (d) Spezifische Leitfähigkeit κ bzw. spezifischer Widerstand ρ

Alle Angaben bei 20 °C, sofern nicht anders vermerkt. ρ = 1/κ.

| Werkstoff | ρ in Ω·mm²/m | κ in m/(Ω·mm²) | Quelle | Kategorie |
|---|---|---|---|---|
| Kupfer (Cu-ETP, geglüht, 20 °C) | 0,017–0,018 | 55–57 | Deutsches Kupferinstitut, Werkstoff-Datenblatt Cu-ETP, Ziff. 3.6/3.7 | `Herstellerangabe` (Brancheninstitut) |
| Kupfer (Cu-ETP, kaltumgeformt, 20 °C) | 0,017–0,018 | – | Deutsches Kupferinstitut, ebd., Ziff. 3.7 | `Herstellerangabe` (Brancheninstitut) |
| Kupfer (Richtwert, 20 °C) | 0,018 | 56 | elektrotechnik-fachwissen.de, Tabelle „Spezifische Widerstände und Leitfähigkeiten" | `Öffentliche Formelsammlung` |
| Kupfer (Cu, 20 °C) | 0,0172 (1,72·10⁻⁸ Ωm) | 58,14·10⁶ S/m | electronics-tutorials.ws (deutsche Fassung) | `Fachseite` |
| Kupfer (Cu, Rechenwert für Leitungsberechnung) | – | 56 | lightrechner.com / voltflow.net („γ = 56 für Kupfer") | `Fachseite` |
| Aluminium (20 °C) | 0,028 | 36 | elektrotechnik-fachwissen.de, Tabelle | `Öffentliche Formelsammlung` |
| Aluminium (20 °C) | 2,82·10⁻⁸ Ωm | ~61 % IACS (bezogen auf Cu 100 %) | langhe-industry.com (Werkstoffvergleich) | `Fachseite` |
| Aluminium (Rechenwert für Leitungsberechnung) | – | 35 | lightrechner.com („κ = 35") | `Fachseite` |
| Kupfer (Rechenwert nach Normnäherung) | 0,0225 | – | Wikipedia „Spannungsabfall": „… oder 1,25-mal der spezifische elektrische Widerstand bei 20 °C, oder 0,0225 Ω·mm²/m für Kupfer" | `Wiki (kollaborativ)` |
| Aluminium (Rechenwert nach Normnäherung) | 0,036 | – | Wikipedia „Spannungsabfall" (ebd.) | `Wiki (kollaborativ)` |

**Quellen-URLs:**
- Deutsches Kupferinstitut, Cu-ETP Werkstoff-Datenblatt. URL: https://www.kupfer.de/wp-content/uploads/2019/11/Cu-ETP.pdf
- elektrotechnik-fachwissen.de, „Spezifische Widerstände und Leitfähigkeiten wichtiger Werkstoffe". URL: https://www.elektrotechnik-fachwissen.de/tabellen/spezifische-widerstaende-leitwerte.php
- electronics-tutorials.ws (dt.), „Spezifischer Widerstand und elektrische Leitfähigkeit". URL: https://www.electronics-tutorials.ws/de/widerstande/spezifischer-widerstand.html
- langhe-industry.com, „Aluminium vs. Kupfer". URL: https://langhe-industry.com/de/aluminum-vs-copper
- lightrechner.com, „Spannungsabfall Grenzwerte". URL: https://lightrechner.com/tabellen/spannungsabfall-grenzwerte
- Wikipedia „Spannungsabfall". URL: https://de.wikipedia.org/wiki/Spannungsabfall

**Zusätzlicher Beleg – temperaturabhängiger Temperaturkoeffizient (Cu):** 0,00393 K⁻¹ (20 °C, geglüht) bzw. 0,00381 K⁻¹ (kaltumgeformt). `Herstellerangabe`/Brancheninstitut – Deutsches Kupferinstitut, Cu-ETP, Ziff. 3.8.

**Zusätzlicher Beleg – Leiterwiderstände (DIN VDE 0295, Klasse 2, Cu blank, Ohm/km):** 1,5→12,1; 2,5→7,41; 4→4,61; 6→3,08; 10→1,83; 16→1,15 (höhere Querschnitte in der Quelle). Aluminium (Klasse 2) nur für 10 mm² mit 3,08 Ω/km angegeben.
`Herstellerangabe` – HELUKABEL, „Leiterwiderstände (DIN VDE 0295, IEC 60228)". URL: https://www.helu.com/helu/publikationen/allgemeine-dokumente/helu-kabel-leitungen-richtig-auslegen.pdf

---

## Widersprüche zwischen Quellen (ausdrücklich benannt, nicht geglättet)

1. **Häufungstabelle – erste Spalte/Referenz**
   ABB (Tabelle 7) nennt für n=1 den Faktor **1,00** bei „gebündelt direkt auf der Wand…", Schneider (G16) ebenfalls 1,00 in derselben Zeile. Bei „Einlagig unter der Decke, mit Berührung" beginnt ABB bei **0,95** (n=1), Schneider ebenfalls **0,95**. Insofern deckungsgleich; kein echter Widerspruch — die Zeilen sind unterschiedlich definiert und dürfen nicht verwechselt werden.

2. **Umgebungstemperatur-Tabelle – erste Spalte**
   Die Textbook-Seite content-select.com zeigt eine Umrechnungstabelle, in der bei 35 °C ein Faktor **0,71** in der ersten Spalte steht. ABB und Schneider führen für die 70-°C-Leiter-Spalte bei 35 °C dagegen **0,94**. Die erste Spalte bei content-select entspricht offensichtlich einer anderen Bezugstemperatur (30 °C-Leiter/Basis), ABB/Schneider sind für die in Werkzeug 13 relevante 70-°C-Spalte maßgeblich. **Wert 0,71 bei 35 °C wird nicht übernommen** — er passt nicht zum PVC-70-°C-Fall.
   `Öffentliche Formelsammlung/Lehrbuch-Auszug` – content-select.com, „9 Strombelastbarkeit von Kabeln und Leitungen DIN VDE 0298-4". URL: https://content-select.com/de/portal/media/download_extract/5c7e722d-9830-490a-aca3-7986b0dd2d03

3. **κ/ρ von Kupfer und Aluminium schwankt je Quelle**
   Für Kupfer: ρ zwischen **0,017** (Kupferinstitut, geglüht) und **0,018** (elektrotechnik-fachwissen) und **0,0225** (Wikipedia, = 1,25 × 20-°C-Wert als Betriebsrechenwert). Für Aluminium: κ = **35** (lightrechner) vs. **36** (elektrotechnik-fachwissen); ρ = 0,028 vs. 0,036 (Wikipedia-Rechenwert). Das sind **keine Fehler**, sondern unterschiedliche Bezüge (reiner Materialwert bei 20 °C vs. Rechenwert für den gestörten Betrieb/servicetypische Temperatur). Für die Querschnittsberechnung ist die Unterscheidung zu dokumentieren.

4. **Spannungsfall-Grenze „4 %" vs. „3 %/5 %"**
   Quelle iwer.info (Leseranfrage) nennt 4 % (DIN VDE 0100-520, Abschnitt 525, HAK→Verbraucher) neben 3 %/5 % (Tabelle G.52.1) und 3 % (DIN 18015). Die Werte gelten für unterschiedliche Abschnitte (HAK→Verbraucher vs. Zähler→Verbraucher). „4 %" ist nicht dieselbe Größe wie „3 %/5 %".

5. **Grenzwertänderung TAB (historisch)**
   TAB 2007 (Ausgabe 2011) hatte den Spannungsfall im Hauptstromversorgungssystem **leistungsabhängig** gestaffelt (0,5 / 1,0 / 1,25 / 1,5 %). Die ab 2019 gültige Fassung (TAB 2019/2023, VDE-AR-N 4100) nennt nur noch **0,5 %**. Der gestaffelte Wert ist damit **überholt** — nicht als aktueller Wert verwenden. (Belegt durch iwer.info und TAB-2007/2019-Vergleich.)

---

## NICHT BELEGT (nicht geschätzt, nicht erfunden)

Die folgenden für Werkzeug 13 ggf. gewünschten Werte ließen sich aus den gesichteten **frei zugänglichen** Quellen **nicht** mit angegebener Randbedingung und belastbarer Quelle belegen:

1. **Aluminium-Strombelastbarkeit für 1,5 / 2,5 / 4 / 6 / 10 / 16 mm²** (Verlegearten A1, A2, B1, B2, C, E, 3 Adern, 70 °C).
   Frei belegt (Schneider-Wiki, Abb. G20a) ist Aluminium erst **ab 25 mm²**. Für 1,5–16 mm² Aluminium lieferte nur die kommerzielle Fachseite elekrechner.com Zahlen (16 mm²: 48/60/54/66/63 A). Diese Zahlen haben **keine unabhängige Zweitbestätigung** und die Seite nennt als Randbedingung „Umgebung 25 °C (Luft)/20 °C (Erde)" (also NICHT 30 °C), weshalb sie nicht direkt auf den geforderten 30-°C-Fall passen. → **Für Al unter 25 mm²: NICHT BELEGT.**
   `Fachseite (nicht als Beleg übernommen)` – elekrechner.com, Strombelastbarkeitstabelle. URL: https://www.elekrechner.com/tabellen/strombelastbarkeit

2. **Aluminium in Verlegeart E bei 30 °C Umgebung.**
   Die Schneider-Abb. G20b (Verlegearten E/F/G) führt nur **Kupfer**; die Al-Spalte für E fehlt in der frei einsehbaren Tabelle. → **NICHT BELEGT.**

3. **Strombelastbarkeit für Aluminium bei 2 belasteten Adern.**
   In den gesichteten freien Quellen nur für Kupfer ausgewiesen. → **NICHT BELEGT.**

4. **Eine geschlossene, normkonforme Umrechnungstabelle für Aluminium (Häufung + Temperatur).**
   Die Häufungs- und Temperaturfaktoren der Quellen sind für Kupfer/PVC-Systeme angegeben; ob sie 1:1 auf Aluminium konduktoren anwendbar sind, wird in den gesichteten Quellen nicht ausdrücklich gesagt. → **NICHT BELEGT** (nicht extrapolieren).

5. **Aluminium-Leiterwiderstände in Ω/km für 1,5–6 mm² (Klasse 2).**
   HELUKABEL listet Aluminium-Klasse-2-Widerstand nur für **10 mm²** (3,08 Ω/km). Werte für kleinere Querschnitte fehlen in der frei einsehbaren Tabelle. → **NICHT BELEGT.**

6. **Ein normativer Primärbeleg für die Grenzwerte 3 %/5 %.**
   Die Grenzwerte aus DIN VDE 0100-520 Anhang G Tabelle G.52.1 und DIN 18015-1 sind hier nur **über Fachseiten/Wiki referiert** (Wikipedia, iwer.info, Elektropraktiker, martin-fels, rechnerplus) belegt, nicht über einen frei zugänglichen Primär-Normtext. Der Normtext selbst ist kostenpflichtig und wurde bewusst **nicht** eingebettet. → **Primärtext: NICHT BELEGT** (Sekundärbeleg mehrfach vorhanden).

---

## Quellenverzeichnis (alle, mit Abrufdatum 2026-10-06)

| # | Quelle | Kategorie | URL |
|---|---|---|---|
| 1 | ABB STOTZ-KONTAKT, „Verlegearten und Strombelastbarkeit von Kabeln/Leitungen" | Herstellerangabe | https://search.abb.com/library/download.aspx?documentid=2cdc401002d0106&languagecode=de&documentpartid=&action=launch |
| 2 | HELUKABEL, „Kabel und Leitungen richtig auslegen" (Technischer Leitfaden) | Herstellerangabe | https://www.helu.com/helu/publikationen/allgemeine-dokumente/helu-kabel-leitungen-richtig-auslegen.pdf |
| 3 | Lapp, „Technische Tabellen T12" | Herstellerangabe | https://contentmedia.lappcdn.com/e/lapp/fuk2Jf1cPlV6EesaZZFavA~~ |
| 4 | ACS (Österreich), „Strombelastbarkeiten" (Katalogauszug) | Herstellerangabe | https://www.acs.at/fileadmin/user_upload/Downloads/Strombelastbarkeiten.pdf |
| 5 | Electrical Installation Wiki (Schneider Electric), „Bestimmung des Leiterquerschnittes …" | Wiki (kollaborativ) | https://de.electrical-installation.org/dewiki/Bestimmung_des_Leiterquerschnittes_von_Kabeln_und_Leitungen_nach_ihrer_Verlegeart |
| 6 | Wikipedia, „Spannungsabfall" | Wiki (kollaborativ) | https://de.wikipedia.org/wiki/Spannungsabfall |
| 7 | iwer.info, „Zulässiger Spannungsfall" | Fachseite (privat) | https://iwer.info/article/Elektrotechnik/zulaessiger-Spannungsfall/index.html |
| 8 | Elektropraktiker, Leseranfrage Spannungsfall | Fachseite (Fachzeitschrift) | https://www.elektropraktiker.de/downloads/download/?file=42578&uid=11909 |
| 9 | Deutsches Kupferinstitut, Werkstoff-Datenblatt Cu-ETP | Herstellerangabe/Brancheninstitut | https://www.kupfer.de/wp-content/uploads/2019/11/Cu-ETP.pdf |
| 10 | elektrotechnik-fachwissen.de, „Spezifische Widerstände und Leitfähigkeiten" | Öffentliche Formelsammlung | https://www.elektrotechnik-fachwissen.de/tabellen/spezifische-widerstaende-leitwerte.php |
| 11 | electronics-tutorials.ws (dt.), „Spezifischer Widerstand und elektrische Leitfähigkeit" | Fachseite | https://www.electronics-tutorials.ws/de/widerstande/spezifischer-widerstand.html |
| 12 | langhe-industry.com, „Aluminium vs. Kupfer" | Fachseite | https://langhe-industry.com/de/aluminum-vs-copper |
| 13 | lightrechner.com, „Spannungsabfall Grenzwerte" | Fachseite | https://lightrechner.com/tabellen/spannungsabfall-grenzwerte |
| 14 | BDEW, TAB 2023 Bundesmusterwortlaut | Behörde/Verband | https://www.bdew.de/media/documents/3000_BDEW_Bundesmusterwortlaut_TAB_2023_v20230502.pdf |
| 15 | NAV § 13 Abs. 4 (gesetze-im-internet.de) | Behörde/Vorschrift | https://www.gesetze-im-internet.de/nav/__13.html |
| 16 | content-select.com, Lehrbuch-Auszug „Strombelastbarkeit … DIN VDE 0298-4" | Öffentliche Formelsammlung | https://content-select.com/de/portal/media/download_extract/5c7e722d-9830-490a-aca3-7986b0dd2d03 |
| 17 | elekrechner.com, Strombelastbarkeitstabelle | Fachseite (nicht als Beleg übernommen) | https://www.elekrechner.com/tabellen/strombelastbarkeit |

---

## Empfehlung für Werkzeug 13

- **Berechnung immer über die freie Formel** (ΔU = l·b·(ρ/A·cosφ + X′·sinφ)·I), nicht über abgeschriebene Normtabellen.
- Für Strombelastbarkeit eine **kleine Auswahl** wie oben (Cu, 3 Adern, A1/A2/B1/B2/C/E, 1,5–16 mm²) aus den drei sich gegenseitig bestätigenden Quellen (ABB, Helukabel, Schneider-Wiki) hinterlegen; korrekturfaktoren für Temperatur und Häufung nach (b) anwenden.
- **Aluminium unter 25 mm² und Aluminium in E nicht anbieten**, solange kein Freibeleg vorliegt (siehe NICHT BELEGT).
- **Spannungsfall-Grenzwerte** konfigurierbar halten (3 %/5 % als Standard, 0,5 % HAK→Zähler optional), da sie aus unterschiedlichen Regelwerken je Abschnitt stammen.
- Vor der Veröffentlichung: die über VDE-Normzitate belegten Zahlen erneut aus unabhängigen, frei zugänglichen Primärquellen (Kabelhersteller-Kataloge) gegenprüfen, um die DIN/VDE-Limitierungsfrage sauber vom Produkt zu trennen.
