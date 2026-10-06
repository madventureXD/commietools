# Welle E — technische Gewerke: Bericht

**Datum:** 2026-10-06 · **Bearbeiter:** Faber · **Status:** fünf Werkzeuge gebaut, geprüft, committet (`11f09d4`)

Grundlage: `2026-10-06-welle-e-plan.md` (Plan mit Abnahmekriterien, **vor** dem Bau) und
`03-konzepte/2026-10-06-normfrage-quellenlage.md` (Quellenlage, Anlage
`06-protokolle/quellenlage-welle-e/`).

## 1. Die Normfrage (Q2) — war der eigentliche Aufwand

Welle E war im Konzept gesperrt, bis Q2 geklärt ist. Der Auftrag wurde deshalb **nicht** als
Bauauftrag ausgeführt: Erst wurden fünf Datenbestände recherchiert, dann habe ich die Fundstellen
**selbst stichprobenweise nachgeprüft**, dann entschied Thomas auf dieser Grundlage.

- **Tragender Befund:** Die frei abrufbaren Strombelastbarkeitstabellen (ABB, HELUKABEL, Lapp,
  Schneider-Wiki) sind **genehmigte Auszüge aus DIN VDE 0298-4** — beim ABB-Dokument steht es im
  Titel. Damit sind sie für dieses Projekt nicht übernehmbar. Alle vier anderen Werkzeuge stützen
  sich auf eigene Zusammenstellungen von Behörden und Verbänden (BAuA/ASR A3.4, DGUV, BBSR/GEG,
  UBA, IAPWS-Daten) — nutzbar mit Quellenangabe je Wert.
- **Meine Nachprüfung bestätigte** Gewindesteigungen, Wasser-Daten und die BBSR-U-Werte; die
  ASR-A3.4-Systematik teilweise; zwei Quellen mit dynamischen Tabellen konnte ich **nicht** prüfen
  (kein Browser in dieser Sitzung) — sie sind als „nicht nachgeprüft" gekennzeichnet, nicht als
  bestätigt.
- **Zusätzlich gemeldet:** Als Beleg für EN 1057 war ein Normtext-PDF von einem Dritt-Host
  (`lador.ru`) herangezogen worden — derselbe Fehler wie eine übernommene Normtabelle, nur an
  anderer Stelle. Für den Bau wurden Handels- und Herstellerkataloge verwendet, und ein Beleg prüft
  ausdrücklich, dass dieses PDF **nicht** als Quelle im Werkzeug auftaucht.

## 2. Was je Werkzeug belegt ist (Browser-Belege, keine Selbstauskunft)

| Werkzeug | Belegter Kern |
|---|---|
| 13 `cable` | Rechnet **exakt meine Handrechnung**: ΔU 6,857 V · 2,981 % · A_erf 2,484 mm² → 2,5 mm² · Auslastung 80 %. Strombelastbarkeit ist ein **Eingabefeld**; Werkzeug sagt selbst, dass es keine Tabelle enthält. Vorplanungs- und Elektrofachkraft-Hinweis sichtbar |
| 14 `lighting` | Soll-Lux je Raumtyp mit Quelle; bei streitigen Typen **„Spanne: 100–200 lx"** plus Widerspruchshinweis statt Mittelwert. Lichtstrom 3.750 lm bei 15 m²/200 lx/Wartungsfaktor 0,8 — nachgerechnet; bei Faktor 0,5 steigt er auf 6.000 lm |
| 15 `pipes` | Sechs Werte gegen unabhängige Nachrechnung geprüft: Volumenstrom 0,8616 m³/h · Geschwindigkeit 1,803 m/s · Reynolds 23.369,5 · Rohrreibungszahl 0,024975 · Druckverlustgefälle 3.117,2 Pa/m · Massenstrom 0,23889 kg/s. Richtwert-Hinweis statt Verbot; DN-Vorschlag mit Begründung |
| 16 `heatload` | Transmission **990 W** (1,65·20·30) und Lüftung **251,3 W** (ρ·c_p·n·V·ΔT/3600) — beides genau meine Nachrechnung, Summe 1.241,3 W mit Rechenweg. Außentemperatur **startet leer**, Abgrenzung zu DIN EN 12831 in Untertitel und Hinweis |
| 18 `threads` | Kernloch gerechnet (M10 8,5 · M12 10,2 · M6 5) mit Rechenweg; **beide** Schlüsselweiten-Reihen getrennt (M10 16/17, M12 18/19), M6 alt korrekt „nicht geführt"; Anzugsmoment als Spanne 48–54 Nm mit Richtwert-Hinweis; Quelle je Zeile, Abrufdatum sichtbar |

## 3. Fehler, die die Abnahme gefunden hat — alle behoben

1. **Gewinde: D1 zeigte `8,376100000000001`** (Gleitkomma-Rest als Millimeterwert). Eigene
   Anzeigefunktion, rundet auf zwei Stellen; die Rechenfunktion bleibt exakt und nachprüfbar.
2. **Gewinde: Quellen waren anklickbare Verweise** — das einzige Werkzeug im Projekt damit; 10
   Bedienziele unter 44 px. Jetzt Text (kopierbar), wie überall sonst.
3. **Beleuchtung: drei Textknöpfe 41 px breit** → Mindestbreite 44 px.
4. **Heizlast: Überlauf bei 320 px** — eine Quellenzeile wurde 871 px breit; Adressen brechen jetzt um.
5. **Beleuchtung: spanische Kurzbeschreibung 124 Zeichen** gegen die Hausgrenze 120 → gekürzt.
6. **Zwei eigene Fehler in meinen Belegskripten** (nicht im Werkzeug): falsche DOM-Annahmen (Werte
   stehen in Eingabefeldern, keine Knopfgruppen) und eine falsche Erwartung (M6-Schlüsselweite alt —
   die Datenlage führt sie nicht, das Werkzeug lag richtig).

## 4. Arbeitsteilung — und was sie gekostet hat

Die fünf Werkzeuge wurden an Beauftragte gegeben (klare Schnittstellen, Datenquelle vorgegeben,
Q2-Auflagen im Auftrag). Ich habe die gemeinsamen Dateien vorbehalten und die Abnahme selbst gemacht.

**Der Fehler war meine Koordination:** Ein Steuerungstext war missverständlich formuliert, worauf der
Rohr-Beauftragte seinen eigenen Manifest-Eintrag wieder entfernte; ein anderer schrieb entgegen der
Auflage ins Manifest, wodurch der Katalog zwischenzeitlich auf ein unbekanntes Werkzeug verwies.
**Lehre:** Bei mehreren gleichzeitigen Beauftragten die gemeinsamen Dateien **vorab** vollständig
vorbereiten und im Auftrag nicht nur verbieten, sondern sagen, was mit einem halbfertigen Zustand
geschieht. Kein Werkzeug war dadurch fehlerhaft — nur die Verdrahtung war zweimal zu richten.

## 5. Prüfstand

- `lint` · `check` (**619 Tests in 39 Dateien**) · `build` grün
- Katalog **62 Werkzeuge**, 3 Sprachen, 62 Symbole, 100 Dateitypen
- `a11y:check` (hell **und** dunkel) und `viewport:check` (320/390/1360 px) grün für alle fünf Routen;
  im dunklen Schema die bekannte, dokumentierte Markenfarbe-Ausnahme
- Belege: `06-protokolle/screenshots/2026-10-06-welle-e/` (Belegtexte, Aufnahmen)
- Startlast 147.711 B gzip von 204.800 (Warnschwelle), +1.294 B

## 6. Offen und nicht geprüft

- **Fachliche Richtigkeit ist damit nicht belegt** — nur Herkunft und Nachvollziehbarkeit der Werte.
  Die Prüfung durch eine Elektro- bzw. SHK-Fachkraft steht aus und ist durch dieses Vorgehen nicht
  ersetzbar. Das sagen die Werkzeuge selbst (Vorplanung/Überschlag, keine Fachkraft).
- **Keine Freigabe nach Norm** beansprucht: 13 und 16 sind ausdrücklich Vorplanung bzw. Überschlag.
- Zwei Quellen mit dynamischen Tabellen sind **nicht** von mir nachgeprüft (kein Browser verfügbar).
- **Nicht gepusht** — die lokale Reihe umfasst jetzt 21 Commits.
