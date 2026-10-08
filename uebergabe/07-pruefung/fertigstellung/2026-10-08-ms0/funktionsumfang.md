# MS0: ursprünglicher Funktionsumfang Welle D/E

**Datum:** 2026-10-08  
**Status:** Abnahme offen; Kriterien gesammelt.

Acht bereits gebaute Werkzeuge werden in MS6 erneut gegen die vor dem Bau dokumentierten Kriterien geprüft. Keine erneute Welle D/E bauen. Gemeinsame Vorgaben und Entscheidungen stehen unverändert in den eingefrorenen Plänen; Daten in [funktionsumfang.json](funktionsumfang.json).

## D/23: inspection

**Aktuelle Route:** /tools/inspection · **Originalüberschrift:** Werkzeug 23 — Prüffristen-Checkliste

**Originalkriterien (unverändert):**

> 1. Einträge überleben ein Neuladen (im Browser belegt, nicht im Test allein).
>   2. Die Einordnung „überfällig / bald fällig / in Ordnung" stimmt gegen ein festes Bezugsdatum,
>      samt Grenzfall (genau heute fällig = fällig).
>   3. Intervall-Arithmetik über Monatsenden und Jahreswechsel stimmt (31.01. + 1 Monat).
>   4. Der Export enthält genau die sichtbaren Einträge, Datumsformat aus dem Land der Sprache.
>   5. Kein Netzverkehr beim Arbeiten (Beleg über den Netzwerkmitschnitt).
>   6. `check`, `lint`, `build`, `a11y:check`, `viewport:check` grün; Texte in de/en/es vollständig.

**Fachabnahme:** gemäß Originalkriterien; keine zusätzliche Fachfreigabe erfunden. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## D/19: photo-caption

**Aktuelle Route:** /tools/photo-caption · **Originalüberschrift:** Werkzeug 19 — Baustellenfoto-Beschrifter

**Originalkriterien (unverändert):**

> 1. Der Zeitstempel stammt aus den EXIF-Daten eines **echten Fremdfotos**, nicht aus der Laufzeit
>      des Programms (Beleg gegen eine frei verfügbare Bilddatei).
>   2. Das erzeugte PDF ist mit einem unabhängigen Betrachter zu öffnen; die Reihenfolge stimmt.
>   3. Das Originalbild bleibt unverändert (Pixelvergleich: Abweichungen nur im Bereich der Marke).
>   4. Die Speichergrenze ist **gemessen** und im Bericht beziffert (Anzahl × Bildgröße ohne Absturz).
>   5. Kein Netzverkehr; `check`, `lint`, `build`, `a11y:check`, `viewport:check` grün; drei Sprachen.

**Fachabnahme:** gemäß Originalkriterien; keine zusätzliche Fachfreigabe erfunden. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## D/20: handover-report

**Aktuelle Route:** /tools/handover-report · **Originalüberschrift:** Werkzeug 20 — Abnahme-, Übergabe- und Mängelprotokoll

**Originalkriterien (unverändert):**

> 1. Die Zeichenfläche ist **ein** gemeinsamer Baustein; die zweite Umsetzung in
>      `PdfPlacementTools.tsx` ist entfernt (belegt über den Diff, nicht behauptet).
>   2. Fristen stimmen gegen handgerechnete Fälle aus `calculator/dates.ts` (datierte Zufälle,
>      Jahreswechsel enthalten).
>   3. Das PDF öffnet sich, enthält alle erfassten Zeilen, Fotos und Unterschriften.
>   4. Leere Pflichtfelder und fehlende Unterschrift werden als Hinweis gezeigt, nicht still erzeugt.
>   5. `check`, `lint`, `build`, `a11y:check`, `viewport:check` grün; drei Sprachen.

**Fachabnahme:** gemäß Originalkriterien; keine zusätzliche Fachfreigabe erfunden. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## E/18: threads

**Aktuelle Route:** /tools/threads · **Originalüberschrift:** 18 — Gewinde, Bohrungen und Anzugsmomente (`threads`)

**Originalkriterien (unverändert):**

> (1) Kernloch stimmt gegen die Rechenregel und gegen die belegten Tabellenwerte
>   der Quellen, inkl. Feingewinde; (2) beide Schlüsselweiten-Reihen liefern die belegten Werte und sind
>   unterscheidbar beschriftet; (3) Anzugsmomente erscheinen als Spanne mit Kennzeichnung; (4) nicht
>   belegte Größen (Durchgangsloch-Zweitquelle, geschmierte Einzelmomente, Zoll-Feingewinde) sind
>   Eingabefeld oder ausdrücklich als nicht belegt benannt; (5) Prüfläufe und Browser-Beleg grün.

**Fachabnahme:** gemäß Originalkriterien; keine zusätzliche Fachfreigabe erfunden. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## E/14: lighting

**Aktuelle Route:** /tools/lighting · **Originalüberschrift:** 14 — Beleuchtungsplanung nach Lux (`lighting`)

**Originalkriterien (unverändert):**

> (1) Soll-Lux-Tafel aus ASR A3.4/DGUV mit Quelle je Zeile; (2) bei den
>   streitigen Raumtypen (Umkleide, Lager, Flur, Unterricht, Werkstatt) wird die **Spanne** der Quellen
>   gezeigt statt einer Scheingenauigkeit; (3) Gleichmäßigkeit nur als Eingabe, nicht behauptet;
>   (4) Wartungsfaktor als Eingabe mit belegter Bandbreite als Hinweis; (5) Prüfläufe und Beleg grün.

**Fachabnahme:** gemäß Originalkriterien; keine zusätzliche Fachfreigabe erfunden. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## E/16: heatload

**Aktuelle Route:** /tools/heatload · **Originalüberschrift:** 16 — Heizlast-Überschlag je Raum (`heatload`)

**Originalkriterien (unverändert):**

> (1) Bezeichnung und Hinweis trennen den Überschlag **sichtbar** von einer
>   normgerechten Heizlastberechnung (DIN EN 12831 wird ausdrücklich nicht gerechnet); (2) U-Werte aus
>   der BBSR-Beispielsammlung mit Quelle je Zeile, änderbar; (3) **Außen-Auslegungstemperatur ist
>   Eingabefeld** (nicht frei belegt) und wird nicht vorbelegt; (4) Rechnung gegen handgerechnete Fälle
>   geprüft (Fläche, ΔT, Luftwechsel); (5) Prüfläufe und Beleg grün.

**Fachabnahme:** Thomas organisiert Elektro-/SHK-Fachkraft; noch nicht benannt. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## E/15: pipes

**Aktuelle Route:** /tools/pipes · **Originalüberschrift:** 15 — Rohrdimensionierung, Volumenstrom, Druckverlust (`pipes`)

**Originalkriterien (unverändert):**

> (1) Volumenstrom gegen handgerechnete Fälle; (2) Rohr-Innenmaße als
>   **Auswahl** je Rohrart (Kupfer/Stahl/Verbund mit den unterschiedlichen Wanddicken) — nichts fest
>   verdrahtet, Quelle je Zeile; (3) Wasser-Daten (Dichte, Viskosität) aus den belegten Tabellen;
>   (4) Geschwindigkeit als **Richtwert mit Spanne** gekennzeichnet; (5) kein Norm-PDF von Dritt-Hosts
>   als Quelle; (6) Prüfläufe und Beleg grün.

**Fachabnahme:** gemäß Originalkriterien; keine zusätzliche Fachfreigabe erfunden. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## E/13: cable

**Aktuelle Route:** /tools/cable · **Originalüberschrift:** 13 — Leitungsquerschnitt und Spannungsfall (`cable`)

**Originalkriterien (unverändert):**

> (1) **keine** Strombelastbarkeitstabelle im Werkzeug — der Wert ist
>   Eingabefeld, und das steht sichtbar dabei („Wert aus Ihrer Tabelle/Norm entnehmen"); (2) Rechnung
>   ein- und dreiphasig gegen handgerechnete Fälle, κ Cu 56 / Al 35 als änderbare Annahme; (3) die
>   Grenzen 3 % / 5 % werden angewendet und als belegt benannt; (4) der Hinweis „Vorplanung, ersetzt
>   keine Elektrofachkraft" steht sichtbar im Werkzeug; (5) Prüfläufe und Beleg grün.

**Fachabnahme:** Thomas organisiert Elektro-/SHK-Fachkraft; noch nicht benannt. **Ausführung:** offen in MS6; siehe [Abnahmefenster](abnahmefenster.md).

## Beleggrenzen und Entscheidungen

Die alten Erfolgsprotokolle sind historische Belege, keine neue Abnahme. Bei Foto-Beschrifter war keine Bruchgrenze gefunden: bestandene Lasten nicht in eine gemessene Maximalgrenze umdeuten. Beim Protokoll wurden Rechtsfundstellen damals nicht erneut geprüft; dies bleibt Teil der Quellenabnahme in MS6. Welle E bewahrt Q2: keine Normtabellenübernahme, änderbare Werte mit Quellen; Kabel-Strombelastbarkeit als Eingabefeld, Heizlast nur Überschlag.

Die Abschlussmatrix fasst A–D ohne schriftliches Kriterium zusammen. Für D existiert jedoch der Plan vom 2026-10-06 mit konkreten Kriterien; diese Sammlung macht ihn nutzbar. A–C werden dadurch weder neu abgenommen noch rückwirkend mit neuen Kriterien versehen.
