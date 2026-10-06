# Fortschrittsprotokoll: M6-002 (R2) — RPN-Tastenfeld setzt mehrstellige Zahlen zusammen

**Datum:** 2026-10-06
**Status:** abgeschlossen — Abnahmefälle der Karte alle belegt
**Karte:** M6-002 aus R2 (`QM/70-reparaturempfehlungen/R2.md`), Basis `a041ee0`

## Umfang

Neu: `packages/tools/src/calculator/rpnInput.ts` (Eingabereducer). Geändert:
`apps/web/src/tools/calculator-frame.tsx` (RPN-Eingabeweg, Eingabefeld, Stapelgriffe),
`packages/tools/src/calculator/keypad.ts` (drei Textfunktionen entfernt),
`packages/tools/src/calculator/keypads/rpn.ts` (Kommentar),
Tests `apps/web/src/calculator-keypad.test.ts`, neu `apps/web/src/rpn-input.test.ts`.

## Ergebnisse

**1. Der Befund trifft zu.** Jede Taste hängte ihren Schnipsel als **eigenen Token** an:
`1` `2` ergab die Folge `1 2` — zwei Werte statt der Zahl 12. Über das Tastenfeld ließ sich
damit keine mehrstellige Zahl eingeben, obwohl der Kern sie versteht.

**2. Lösung: ein Eingabereducer mit getrenntem Zahlentoken.** Der Zustand scheidet
**abgeschlossene Tokens** von einem **bearbeiteten Zahlentoken** (`draft`). Aktionen wie von der
Karte verlangt: `digit`, `decimal`, `sign`, `commit`, `operator`, `backspace`, `drop`, `swap`,
`clear`. Ziffern erweitern den Entwurf, `commit` (Enter) schließt ihn ab, eine Operator- oder
Werttaste übernimmt zuerst einen gültigen Entwurf. Der leere Enter tut nichts.

**3. Der Text allein genügt nicht — das war der Kern der Umsetzung.** Erste Fassung las den
Zustand bei jedem Tastendruck nur aus dem Text neu ein. Das schlug fehl, weil `3` als
**abgeschlossener Wert** genauso aussieht wie als **begonnene Zahl**: Nach `3` `Enter` `4` wurde
daraus `34`. Der Rahmen führt deshalb für den RPN-Modus einen eigenen Zustand
(`rpnState`) und leitet den sichtbaren Text daraus ab; die Tastatureingabe wird bewusst als Text
neu ausgelegt (`parseRpnInput`). Der Testsimulator musste auf denselben Zustandsweg umgestellt
werden — er trug vorher ebenfalls nur den Text durch die Folge.

**4. Ein eigener Fehler, messend gefunden.** Die Dezimaltaste des Tastenfelds liefert das
**deutsche Komma** (`,`) als Schnipsel, nicht den Punkt. Der Reducer kannte nur `.` und machte
daraus einen Operator-Token — die Folge war `1 , 5 2 *`. Behoben: Die Aktion `decimal` trägt den
Trenner, `rpnActionForSnippet` erkennt beide Zeichen, und `istZahlentwurf` lässt das Komma zu.
Die Anzeige bleibt damit beim deutschen Komma, der Kern normalisiert ohnehin.

**5. Kein Doppelmodell.** `appendRpnToken`, `dropRpnToken` und `swapRpnTokens` sind **entfernt**:
Sie kannten den bearbeiteten Zahlentoken nicht und waren nach dem Umbau ungenutzt. Die
Leerzeichen-Regel lebt jetzt in `rpnInputText`, die Stapelgriffe in den Aktionen `swap`/`drop`.
Der `±`-Griff bleibt die unäre Negation (`neg`), wenn kein Entwurf läuft — sonst wechselt er das
Vorzeichen des Entwurfs.

## Abnahmefälle der Karte

| Abnahmefall | Ergebnis (Browser, echte Klicks) |
|---|---|
| `1`→`2`→Enter→`3`→`+` | Eingabe `12 3 +`, Stapel **15**, Rechenweg `12 + 3 = 15` |
| `1`→Dezimal→`5`→Enter→`2`→`×` | Eingabe `1,5 2 *`, Stapel **3** |
| doppeltes Dezimalzeichen | `1,5` — das zweite wird nicht angenommen |
| leerer Enter | Eingabe unverändert (kein duplizierter Wert) |
| SWAP / DROP | `9 4` → SWAP → `4 9` → DROP → `4` |
| eingefügter RPN-Text `5 6 +` | bleibt stehen, wird gerechnet (**11**) |
| 390 px / hell | `78` bleibt eine Zahl, keine Überbreite |

## Belege

- **Reducer-Unit-Tests** `apps/web/src/rpn-input.test.ts` (9 Fälle, alle Aktionen und der
  Text-Rundlauf). **Tastenfolgen** in `apps/web/src/calculator-keypad.test.ts` auf den neuen
  Vertrag umgestellt (der alte Simulator prüfte den alten Eingabeweg).
- **Mutationsgegenprobe:** Kernregel „Ziffer erweitert den Entwurf" verletzt (ersetzt statt
  erweitert) → genau drei Tests rot (`expected '2' to be '12'`, `expected '2 3 +' to be
  '12 3 +'`, `expected '4' to be '34'`), 31 grün; Mutation zurückgenommen, alles grün.
- **Browserbeleg** `work/rpn-beleg.cjs` gegen `vite preview` (`127.0.0.1:4173`), 4 Aufnahmen unter
  `06-protokolle/screenshots/2026-10-06-m6-002/`, `aufnahmen.txt`: **alle Prüfungen bestanden**,
  keine Seitenfehler, kein sichtbarer Sprachschlüssel. Die Aufnahme wurde angesehen: Eingabefeld
  `12 3 +`, Stapel `15`, Rechenweg `12 + 3 = 15`, SWAP und DROP sichtbar.
- **Prüfkette:** `npm run check` → **649 Tests in 41 Dateien, Exit 0**; `npm run build` → Exit 0,
  Startbündel **148 025 B gzip** (vorher 148 032).
- Aufgeräumt: Preview-Kette beendet, Port 4173 frei, keine Edge-Reste.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Projekt-Tests | 639 → 649 | `npm run check` |
| Testdateien | 40 → 41 | dito |
| entfernte Kernfunktionen | 3 (`appendRpnToken`, `dropRpnToken`, `swapRpnTokens`) | `keypad.ts` |

## Folgemaßnahmen

- [ ] Der Browserbeleg liegt unter `work/` und damit außerhalb der Versionierung (Punkt M10-004).
- [ ] Die `2nd`-Belegung des RPN-Feldes ist nicht geprüft: Das Feld führt nur eine Ebene
      (`hasSecondPlane` bleibt für seine Tasten ohne Wirkung). Kein Kartenpunkt, aber offen.
