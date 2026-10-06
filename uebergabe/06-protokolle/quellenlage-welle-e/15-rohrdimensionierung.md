# Werkzeug 15 — Rohrdimensionierung: frei belegbare Rohrmaße und Stoffdaten

**Zweck:** Datenbasis (keine Formeln) für den Rechner „Rohrdimensionierung, Volumenstrom und Druckverlust".
**Abrufdatum aller Quellen: 2026-10-06.**
**Prinzip:** Nur frei belegbare Werte mit Quelle. Widersprüche ausdrücklich benannt. Nicht Belegbares steht unter „NICHT BELEGT" — nicht geschätzt, nicht erfunden.
**Innendurchmesser** sind aus Außendurchmesser und Wanddicke berechnet (`ID = OD − 2·w`), sofern die Quelle sie nicht direkt nennt.

---

## (a) Rohr-Innenmaße / Wanddicken gängiger Rohrarten

### a1) Kupferrohr nach EN 1057

Herstellerangaben streuen (Wanddicke je Halbzeug-Zustand/Tabelle). Zwei Quellen gegenübergestellt:

| OD [mm] | Wanddicke w [mm] | ID [mm] | Quelle / Zustand |
|---|---|---|---|
| 12 | 1,0 | 10,0 | SHK-Markt24 (Handel), Katalogartikel EN 1057 RAL/DVGW |
| 15 | 0,7 | 13,6 | EN 1057 Tab. 3 (Tabelle X, halbhart R250), Trade Calculator |
| 15 | 1,0 | 13,0 | SHK-Markt24 (Handel) / EN 1057 Tabelle Y |
| 18 | 1,0 | 16,0 | SHK-Markt24 (Handel) |
| 22 | 0,9 | 20,2 | EN 1057 Tab. 3 / Trade Calculator (Tab. X) |
| 22 | 1,0 | 20,0 | SHK-Markt24 (Handel) |
| 22 | 1,2 | 19,6 | EN 1057 Tabelle Y |
| 28 | 0,9 | 26,2 | EN 1057 Tab. 3 / Trade Calculator (Tab. X) |
| 28 | 1,0 | 26,0 | SHK-Markt24 (Handel) |
| 28 | 1,2 | 25,6 | EN 1057 Tabelle Y |
| 35 | 1,2 | 32,6 | EN 1057 Tab. 3 / Trade Calculator (hart R290) |

- **Quellentyp:** Norm-Tabelle (EN 1057) + Handelskatalog (SHK-Markt24) + Bezugs-Seite (Trade Calculator).
- **Widerspruch:** EN 1057 (Tab. 3, Tabelle X) empfiehlt für 15 mm eine Wanddicke von **0,7 mm**, für 22/28 mm **0,9 mm**. Der deutsche Handel führt diese Nennweiten häufig mit **1,0 mm** (12×1,0; 15×1,0; 18×1,0; 22×1,0; 28×1,0). Beides ist normkonform (mehrere Wanddicken je OD zulässig, Tabelle X vs. Y). Der Rechner muss die Wanddicke daher als Eingabe zulassen.
- **URLs:**
  - EN 1057:2006 (Normtext): https://lador.ru/en/en-1057.pdf
  - EN 1057 Dimensions (Engineering ToolBox): https://www.engineeringtoolbox.com/amp/en-1075-copper-tubes-d_2115.html
  - Trade Calculator (Tab. X/Y): https://tradecalculator.co.uk/reference/uk-copper-pipe-sizes
  - SHK-Markt24 (Handel, DE): https://shkmarkt24.de/shop/kupferrohr-ral-dvgw-en-1057-10mm-bis-54mm-5m-stangen-25-oder-50-meter
  - Lawton Tube (Mechanical Properties, BS EN 1057): https://lawtontubes.co.uk/wp-content/uploads/2019/08/Plumbing-Tube-Working-Pressures-Data-Sheet.pdf

### a2) Stahlrohr / Gewinderohr nach EN 10255 (ersetzt DIN 2440)

| Nennweite | Gewinde | OD [mm] | Wanddicke (mittelschwer) w [mm] | ID [mm] | Quelle |
|---|---|---|---|---|---|
| DN 15 | 1/2" | 21,3 | 2,6 | 16,1 | EN 10255 (mittelschwer) |
| DN 20 | 3/4" | 26,9 | 2,6 | 21,7 | EN 10255 (mittelschwer) |
| DN 25 | 1" | 33,7 | 3,2 | 27,3 | EN 10255 (mittelschwer) |
| DN 32 | 1 1/4" | 42,4 | 3,2 | 36,0 | EN 10255 (mittelschwer) |

- **Quellentyp:** Normtabelle (EN 10255, Herstellerdatenblatt Salzgitter Mannesmann / Thyssenkrupp) + Bezugs-Seite.
- **Widerspruch:** EN 10255 kennt drei Wanddicken-Reihen (light/medium/heavy bzw. L1/L2). Werte streuen dadurch:
  - DN 15: wanddicke 2,0 (light, OD 21,3) vs. 2,3 / 2,6 / 3,2
  - DN 20: 2,3 (light) vs. 2,6 vs. 3,2
  - DN 25: 2,6 vs. 2,9 vs. 3,2 vs. 4,0
  - DN 32: 2,6 vs. 2,9 vs. 3,2 vs. 4,0
  Die obige Tabelle nutzt die übliche **mittelschwere** Reihe aus dem Thyssenkrupp-Katalog (EN 10255 M). Der Rechner sollte „light/medium/heavy" wählen lassen.
- **Hinweis:** DN 15 ist **nicht** der Innendurchmesser; der ID weicht je nach Wanddicke erheblich ab.
- **URLs:**
  - TUSPIPE EN 10255 Dimensions: https://www.tuspipe.com/standards/en-10255
  - Thyssenkrupp Stahlrohre (Gewinderohre EN 10255 M, Wanddicken): https://ucpcdn.thyssenkrupp.com/_legacy/UCPthyssenkruppBAMXJacobBek/assets.files/pdf/produkte/stahlrohre/stahlrohre.pdf
  - hts24 (Handel, 3/4" 26,9×2,65): https://www.hts24.de/gewinderohr-din-en-10255w-schwarz-geschweisst-3-m-stange-26-9-x-2-65mm-3-4.html

### a3) Mehrschichtverbundrohr (MLC / Alu-Verbundrohr)

| OD×w [mm] | ID [mm] | Hersteller / Quelle |
|---|---|---|
| 16 × 2,0 | 12,0 | Uponor Uni Pipe PLUS (16×2), gep24 (Multipipe) |
| 16 × 2,2 | 11,6 | Viega Raxofix 5302.3 (16×2,2) |
| 20 × 2,0 | 16,0 | gep24 (Multipipe, 20×2) |
| 20 × 2,25 | 15,5 | Uponor Uni Pipe PLUS (20×2,25) |
| 20 × 2,8 | 14,4 | Viega Raxofix 5302.3 (20×2,8) |
| 25 × 2,5 | 20,0 | Uponor Uni Pipe PLUS (25×2,5) |
| 26 × 3,0 | 20,0 | gep24 (Multipipe, 26×3) |
| 32 × 3,0 | 26,0 | Uponor Uni Pipe PLUS (32×3) |

- **Quellentyp:** Hersteller-Technische-Information (Uponor, Viega) + Handelsseite (gep24).
- **Widerspruch (deutlich):** Der Innendurchmesser ist **stark herstellerabhängig**. Bei 20 mm Außendurchmesser reicht der ID von **14,4 mm (Viega Raxofix 20×2,8)** bis **16,0 mm (Multipipe 20×2,0)** — Differenz ~11 %. Für die Dimensionierung unbedingt den Hersteller-ID verwenden, nicht den Außendurchmesser. Für 26 mm wurde nur die 26×3-Dimension gefunden (ID 20,0); andere Hersteller nutzen 25 mm statt 26 mm.
- **URLs:**
  - Uponor TI Trinkwasser/Heizung (di-Tabelle): https://brandportal.uponor.com/m/56e67af918404ae3/original/TI-MLCP-Tap-Water-Heating-DE.pdf
  - gep24 Aluverbundrohr-Durchmesser: https://www.gep24.de/magazin/welche-durchmesser-bei-aluverbundrohr-20230620140613.html
  - Viega Raxofix Prospekt (16×2,2 / 20×2,8): https://www.viega.de/content/dam/viegadm/en/products/piping-technology/raxofix/763565_Prospekt_Raxofix_DEAT_net.pdf
  - Viega Raxofix 20×2,8 am Handel: https://www.idealo.de/preisvergleich/OffersOfProduct/210621889_-raxofix-mehrschichtverbundrohr-20-mm-s-2-8-mm-l-25-m-modell-5302-3-718053-viega.html

---

## (b) Stoffdaten für Wasser, 10–80 °C

Dichte ρ und kinematische Viskosität ν. Zwei unabhängige frei zugängliche Quellen, die gut übereinstimmen.

| T [°C] | ρ [kg/m³] | ν [mm²/s = 10⁻⁶ m²/s] | Quelle A | Quelle B (ν) |
|---|---|---|---|---|
| 10 | 999,7 | 1,306 | Anton Paar (IAPWS 2008) | — |
| 20 | 998,2 | 1,003 | Anton Paar / stoffdaten-online | 1,003 |
| 30 | 995,6 | 0,801 | Anton Paar | — |
| 40 | 992,2 | 0,658 | Anton Paar / stoffdaten-online | 0,658 |
| 50 | 988,0 | 0,553 | Anton Paar | — |
| 60 | 983,2 | 0,474 | Anton Paar / stoffdaten-online | 0,474 |
| 70 | 977,8 | 0,413 | Anton Paar | — |
| 80 | 971,8 | 0,364 | Anton Paar / stoffdaten-online | 0,364 |

- **Quelle A (feine 1-K-Tabelle, Referenz IAPWS 2008):** Anton Paar Wiki, https://wiki.anton-paar.com/de-de/wasser/
- **Quelle B (5-K-Tabelle):** stoffdaten-online.de (Wenger Engineering), https://stoffdaten-online.de/wasser/
- **Quellentyp:** öffentliches Tabellenwerk / Hersteller-Stoffdaten (Anton Paar verweist explizit auf IAPWS 2008).
- **Übereinstimmung:** Bei 20/40/60/80 °C decken sich die ν-Werte auf 3 Nachkommastellen; die Dichte auf ≤ 0,02 kg/m³. **Kein Widerspruch.**
- **Hinweis:** Dynamische Viskosität, falls benötigt: η = ρ·ν (z. B. 20 °C → ~1,001 mPa·s). Zusätzliche Referenz-Volltabelle (Dichte+dyn. Viskosität) bei chemie.de: https://www.chemie.de/lexikon/Wasser_(Stoffdaten).html
- **Nur tangential belegt:** Prandtl-Zahl/Wärmeleitfähigkeit/cp sind nur vereinzelt frei belegt (stoffdaten-online liefert cp und λ), für Darcy-Weisbach jedoch nicht erforderlich.

---

## (c) Richtwerte Strömungsgeschwindigkeit in Heizungsrohren

> **Ausdrücklich Richtwerte** — keine Norm-Pflichtwerte, sondern Planungspraxis. Quelle nennt Wertebereich, nicht Einzelwert.

| Bereich | Richtwert v [m/s] | Quelle |
|---|---|---|
| Hauptverteilleitungen | 0,3 – 1,5 | baunetzwissen.de |
| Heizkörperanschlussleitungen | ~0,5 | baunetzwissen.de |
| Heizkreise, allgemein (Planungspraxis) | 0,2 – 0,7 (bis 1,0) | delta-q.de (Beispiel-Rohrnetzauslegung) |
| Wohnkomfort-Bereich | 0,4 – 0,8 | rechner-portal.de |
| Obergrenze Komfort/Geräusch | > 1,0 vermeiden; > 1,5 Erosionsrisiko | rechner-portal.de |
| Flächenheizung | 0,3 – 0,5 | rechner-portal.de |
| Saugleitungen (allg.) | 0,5 – 1,0 | schweizer-fn.de |
| Druckleitungen (allg.) | 2,0 – 5,0 | schweizer-fn.de |

- **Zugehöriges Druckgefälle (Richtwert):** 50 – 100 Pa/m, bis 200 Pa/m in großen Anlagen (baunetzwissen.de); delta-q-Beispiel: Rm = 100 Pa/m, üblich 50–150 (200) Pa/m.
- **Quellentyp:** Fachportal/Praxisleitfaden (baunetzwissen, delta-q), Rechner-Hilfstext (rechner-portal), Ingenieur-Tabelle (schweizer-fn).
- **Kennzeichnung:** Als **RICHTWERT** zu behandeln. Die genannten Quellen widersprechen sich in der Breite (z. B. Obergrenze 1,0 vs. 1,5 m/s) — bewusst als Bandbreite, nicht als Fixwert im Rechner hinterlegen.
- **URLs:**
  - baunetzwissen Rohrnetzberechnung: https://www.baunetzwissen.de/heizung/fachwissen/heizleitungen-zubehoer/rohrnetzberechnung-161276
  - delta-q Rohrnetzauslegung (PDF): https://www.delta-q.de/wp-content/uploads/rohrnetzberechnung-1.pdf
  - rechner-portal Rohrheizung-Rechner: https://rechner-portal.de/bau-handwerk/elektro-sanitaer/rohrheizung-rechner
  - schweizer-fn Richtwerte Strömungsgeschwindigkeit: https://www.schweizer-fn.de/helpdat/stroemung/help_druckverlust.php

---

## (d) Rauigkeit k (Sandrauhigkeit) von Kupfer, Stahl, Kunststoff

| Werkstoff / Zustand | k [mm] | Quelle |
|---|---|---|
| Kupfer, gezogen | 0,0013 – 0,0015 | IKZ (Wagner, Rohrleitungstechnik) |
| Kupfer, gezogen/gepresst neu | 0 – 0,0015 | schweizer-fn / tecciness |
| Stahl, nahtlos neu | 0,02 – 0,06 | IKZ / schweizer-fn (typische Walzhaut) |
| Stahl, längsnahtgeschweißt neu | 0,04 – 0,1 | IKZ |
| Stahl verzinkt | 0,04 – 0,16 | IKZ / schweizer-fn |
| Stahl, mäßig verrostet / leicht verkrustet | 0,1 – 0,4 | IKZ / schweizer-fn / tecciness |
| Stahl, starke Verkrustung | 1,0 – 4,0 | schweizer-fn / tecciness |
| Kunststoff, neu | 0,002 – 0,007 | schweizer-fn |
| Kunststoff, gebraucht | 0,010 – 0,030 | schweizer-fn |
| Kunststoff / PE | 0,001 – 0,010 | mcm-systeme |

- **Quellentyp:** Ingenieur-Standardtabellen (schweizer-fn.de nach Bohl/Jäger u. a.), Fachzeitschrift (IKZ, Quelle: W. Wagner, „Rohrleitungstechnik", Vogelverlag), Fachhandels-Referenz (tecciness, mcm-systeme).
- **Widerspruch / Streuung:** Kupfer wird je nach Quelle als „0 – 0,0015" (tecciness, glatt) bis „0,0015 – 0,01" (mcm-systeme) angegeben — der obere Wert von mcm-systeme erscheint hoch; die überwiegend genannten Werte für gezogenes Kupfer liegen bei ~0,0015 mm. Stahl „neu" streut zwischen 0,02 (Walzhaut) und 0,1 mm.
- **Empfehlung für den Rechner:** Standardannahmen — Kupfer 0,0015 mm; Stahl neu 0,05 mm; Kunststoff/PE-X 0,007 mm; als Alternativen „gebraucht/verkrustet" wählbar. Diese Auswahl ist ein Praxis-Konsens, kein Normwert.
- **URLs:**
  - schweizer-fn Rohrrauigkeit: https://www.schweizer-fn.de/stroemung/rauhigkeit/rauhigkeit.php
  - IKZ Kanal (Tabelle nach Wagner): https://www.ikz.de/ikz-archiv/1998/08/9808051.php
  - tecciness Rohrrauhigkeit: https://tecciness.de/hilfe/rohrrauhigkeit.php?quelldatei=aufruf
  - mcm-systeme Rohrrauhigkeit: https://www.mcm-systeme.de/Rohrrauhigkeit
  - KSB Kreiselpumpenlexikon (Rauigkeits-Anhaltswerte): https://www.ksb.com/de-global/kreiselpumpenlexikon/artikel/druckhoehenverlust-1076404

---

## Widersprüche zwischen Quellen (Zusammenfassung)

1. **Kupferrohr-Wanddicken:** EN 1057 Tabelle X (0,7/0,9 mm) vs. deutscher Handel (1,0 mm) — beide normkonform. → Wanddicke als Eingabe.
2. **Stahlrohr-Wanddicken:** EN 10255 bietet light/medium/heavy; ID je DN weicht deutlich ab. → Reihe wählen lassen.
3. **Verbundrohr-ID:** Bei gleichem OD (z. B. 20 mm) streut der ID stark (15,5 / 16,0 / 14,4 mm je Hersteller). → herstellerabhängiger ID.
4. **Rauigkeit Kupfer:** 0 – 0,0015 vs. 0,0015 – 0,01 mm je Quelle; Stahl „neu" 0,02 – 0,1 mm.
5. **Richtgeschwindigkeiten:** Obergrenzen 1,0 vs. 1,5 m/s; Bandbreiten überschneiden sich nur teilweise.
6. **Wasser:** keine relevanten Widersprüche (Anton Paar/IAPWS und stoffdaten-online stimmen überein).

---

## NICHT BELEGT

- **Normative Pflicht-Dimensionierungsvorschriften** (verbindliche v-Grenzwerte aus einer DIN/VDI-Norm im Volltext): nicht frei im Volltext belegt. Die Richtwerte unter (c) stammen aus Praxisquellen; die Bezüge auf „VDI 2035" in Sekundärquellen konnten nicht durch den Normtext selbst verifiziert werden.
- **Direkte Wanddickenangaben für Werkzeug-Sollwerte** jenseits der oben gelisteten Nennweiten (z. B. Hersteller-Umrechnungstabellen für DVGW-zertifizierte Einzelprodukte mit Chargentoleranzen) — nicht flächendeckend frei belegt.
- **Temperaturabhängige Rauigkeit** (z. B. Kunststoffrohr über Lebensdauer, Trinkwasser-Biofilm) — kein belastbarer frei verfügbarer Wert gefunden.
- **Dichte/Viskosität unter Systemdruck > 1 bar** (Heizungsanlagen bis ~3 bar): Tabellen gelten für 1 bar; Abweichung ist physikalisch klein, aber nicht eigens belegt.
- **Druckverlust-Beiwerte (ζ) für Fittings** (Bögen, T-Stücke, Ventile) gehören nicht zu diesem Datensatz und wurden nicht recherchiert; bei Bedarf separat belegen.

---

## Quellenverzeichnis (alle frei abrufbar, Abruf 2026-10-06)

1. EN 1057:2006 — https://lador.ru/en/en-1057.pdf
2. Engineering ToolBox EN 1057 Kupfer — https://www.engineeringtoolbox.com/amp/en-1075-copper-tubes-d_2115.html
3. Trade Calculator UK Copper — https://tradecalculator.co.uk/reference/uk-copper-pipe-sizes
4. SHK-Markt24 Kupferrohr — https://shkmarkt24.de/shop/kupferrohr-ral-dvgw-en-1057-10mm-bis-54mm-5m-stangen-25-oder-50-meter
5. Lawton Tube EN 1057 Data Sheet — https://lawtontubes.co.uk/wp-content/uploads/2019/08/Plumbing-Tube-Working-Pressures-Data-Sheet.pdf
6. TUSPIPE EN 10255 — https://www.tuspipe.com/standards/en-10255
7. Thyssenkrupp Stahlrohre (PDF) — https://ucpcdn.thyssenkrupp.com/_legacy/UCPthyssenkruppBAMXJacobBek/assets.files/pdf/produkte/stahlrohre/stahlrohre.pdf
8. hts24 Gewinderohr — https://www.hts24.de/gewinderohr-din-en-10255w-schwarz-geschweisst-3-m-stange-26-9-x-2-65mm-3-4.html
9. Uponor TI Verbundrohr (PDF) — https://brandportal.uponor.com/m/56e67af918404ae3/original/TI-MLCP-Tap-Water-Heating-DE.pdf
10. Viega Raxofix Prospekt (PDF) — https://www.viega.de/content/dam/viegadm/en/products/piping-technology/raxofix/763565_Prospekt_Raxofix_DEAT_net.pdf
11. gep24 Aluverbundrohr — https://www.gep24.de/magazin/welche-durchmesser-bei-aluverbundrohr-20230620140613.html
12. Anton Paar Wiki Wasser (IAPWS 2008) — https://wiki.anton-paar.com/de-de/wasser/
13. stoffdaten-online.de Wasser — https://stoffdaten-online.de/wasser/
14. chemie.de Wasser-Stoffdaten — https://www.chemie.de/lexikon/Wasser_(Stoffdaten).html
15. baunetzwissen Rohrnetzberechnung — https://www.baunetzwissen.de/heizung/fachwissen/heizleitungen-zubehoer/rohrnetzberechnung-161276
16. delta-q Rohrnetzauslegung (PDF) — https://www.delta-q.de/wp-content/uploads/rohrnetzberechnung-1.pdf
17. rechner-portal Rohrheizung-Rechner — https://rechner-portal.de/bau-handwerk/elektro-sanitaer/rohrheizung-rechner
18. schweizer-fn Richtwerte Strömungsgeschwindigkeit — https://www.schweizer-fn.de/helpdat/stroemung/help_druckverlust.php
19. schweizer-fn Rohrrauigkeit — https://www.schweizer-fn.de/stroemung/rauhigkeit/rauhigkeit.php
20. IKZ Rohrrauhigkeit (nach Wagner) — https://www.ikz.de/ikz-archiv/1998/08/9808051.php
21. tecciness Rohrrauhigkeit — https://tecciness.de/hilfe/rohrrauhigkeit.php?quelldatei=aufruf
22. mcm-systeme Rohrrauhigkeit — https://www.mcm-systeme.de/Rohrrauhigkeit
23. KSB Kreiselpumpenlexikon Druckhöhenverlust — https://www.ksb.com/de-global/kreiselpumpenlexikon/artikel/druckhoehenverlust-1076404
24. Omni Calculator Wasser-Viskosität — https://www.omnicalculator.com/de/physik/wasser-viskositaet-rechner
