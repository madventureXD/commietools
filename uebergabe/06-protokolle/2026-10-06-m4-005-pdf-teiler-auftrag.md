# Fortschrittsprotokoll: M4-005 (R3) — PDF-Teiler ordnet Ergebnisse dem richtigen Auftrag zu

**Datum:** 2026-10-06
**Status:** Code umgesetzt — **Browserabnahme der Karte noch offen**
**Karte:** M4-005 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`

## Umfang

`apps/web/src/tools/PdfSplit.tsx` (Auftrags-Snapshot, Generation, Dateiname aus dem Auftrag).

## Ergebnisse

**1. Der Befund trifft zu — an zwei Stellen.**

- **Der Dateiname kam aus dem Formular.** Im Ergebnisbereich stand
  `baseName(file?.name ?? 'document')`. Wurde nach dem Teilen eine andere Datei gewählt, trugen die
  fertigen Ergebnisse den Namen der **neuen** Datei; bei leerem Zustand sogar `document`. Der
  Dateiname hing damit am aktuellen Formularzustand statt am Auftrag, der ihn erzeugt hat.
- **Es gab keine Generation.** `process()` setzte Ergebnis, Fehler und `processing` ohne jede
  Prüfung, ob der Auftrag noch aktuell ist. Ein Dateiwechsel während der Verarbeitung leerte die
  Liste — das **späte** Ergebnis der alten Datei schrieb danach ihre Ergebnisse wieder hinein, und
  `finally` beendete den Fortschritt eines Auftrags, der gar nicht mehr lief.

**2. Lösung: unveränderlicher Auftrags-Snapshot mit Generation.**

- `process()` liest den Eingabestand **einmal** (`name`, `bytes`, `pageCount`, `mode`, `selection`)
  und rechnet nur damit. Spätere Formularänderungen berühren den laufenden Auftrag nicht.
- `generationRef` zählt Aufträge. Dateiwechsel und jeder neue Auftrag erhöhen die Nummer.
- Nach dem `await`: Ein Ergebnis mit veralteter Nummer wird **verworfen** und seine Objekt-URLs
  werden **sofort freigegeben** (keine Leiche im Speicher).
- Fehler und `processing` werden nur vom aktuellen Auftrag gesetzt — sonst stünde der neue Auftrag
  ohne Fortschrittsanzeige da, während er noch rechnet.
- Die Ergebnisse tragen den Namen aus dem Auftrag; der Ergebnisbereich liest ihn von dort.

**3. Abgrenzung eingehalten.** Kein Timeout, kein bloßes `disabled` des Knopfes und kein Abfangen
nur des Erfolgswegs — die Karte nennt alle drei ausdrücklich als unzureichend. Abgebrochen wird
logisch (Generation), nicht physisch: `splitPdf` ist nicht abbrechbar.

## Was noch fehlt (ausdrücklich offen)

Die **Abnahme der Karte** ist nicht gefahren: „Deferred A starten, B auswählen, B fertig, A zuletzt
fertig/fehlerhaft: ausschließlich B bleibt sichtbar"; ebenso der Unmount-Fall und die echte
Browserprobe mit unterschiedlichen Dateinamen und Seiteninhalten. Ohne sie ist die Karte **nicht**
abgenommen.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| geänderte Stellen | 3 (Zustand, `selectFile`, `process`, Ergebnisanzeige) | `PdfSplit.tsx` |
| neue Abhängigkeiten | 0 | — |

## Folgemaßnahmen

- [ ] **Abnahme mit zwei Aufträgen (Deferred) und im Browser** nachholen — der eigentliche Beleg
      der Karte. Ein Muster dafür liegt in `work/` noch nicht vor.
- [ ] Das Muster auf weitere asynchrone Dateiwerkzeuge übertragen (die Karte nennt es ausdrücklich
      als Folgeschritt).
- [ ] **M4-006** (Objekt-URLs beim Verlassen freigeben) hängt daran: Der Teiler gibt die URLs eines
      verworfenen Auftrags jetzt frei, die Freigabe beim **Unmount** und bei **Ersetzen** ist noch
      nicht geprüft.
