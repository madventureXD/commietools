# R7 / M2-005 — Entscheidungsindex verschweigt ADR 0006 (Doppelnummer): erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „Doppelnummer 0006 und Entscheidungsindex müssen nachvollziehbar
bereinigt werden." … „Index zunächst vollständig machen und doppelte Nummer explizit benennen. Für
dauerhafte eindeutige IDs eine dokumentierte Migration wählen: einen Konflikt unter neuer freier
Nummer führen, am alten Pfad kurze Weiterverweisakte behalten und alle aktiven Referenzen
aktualisieren; historische Links bleiben auflösbar. Keine rückwirkende inhaltliche Verschmelzung.
Künftiger Dokugate prüft ID-Eindeutigkeit, Existenz und Indexvollständigkeit."
**Status:** **erledigt** — Index vollständig, Nummer eindeutig, alter Pfad führt weiter, Doku-Gate
ist Pflichtteil von `npm run check`.

## Was der Befund war

Gemessen am Live-Stand (nicht aus dem Kartentext übernommen):

- **13 ADR-Dateien** in `uebergabe/04-entscheidungen/`, aber nur **12 Indexeinträge**: die
  M9-Konformitätsentscheidung fehlte im Index vollständig.
- **Zwei angenommene Entscheidungen trugen die Nummer 0006:**
  `0006-m9-konformitaetsgate.md` (Datum 2026-10-04) und
  `0006-voller-wert-und-genauigkeitsampel.md` (Datum 2026-10-04).

## Bestandsaufnahme der Verweise (Grundlage der Migrationswahl)

Eine Suche über den Baum fand **keinen** Verweis auf den Pfad `0006-m9-konformitaetsgate.md`
außerhalb des Indexes. Zwei **Textstellen** meinten die M9-Entscheidung mit „ADR 0006":
`uebergabe/01-stand/roadmap.md` (aktuelle Planung) und
`uebergabe/06-protokolle/2026-10-04-pdf-m9.md` (historisches Protokoll).

**Migrationswahl:** Von den beiden Dateien mit der Nummer 0006 wandert die **M9-Konformitätsdatei**
auf die nächste freie Nummer **0013** — sie trug die wenigsten Verweise. Die Rechner-Entscheidung
bleibt unter 0006 (das Protokoll `2026-10-04-rechner-ampel.md` und vier weitere Stellen verweisen
bereits auf ihren Pfad).

## Umsetzung

- `git mv 0006-m9-konformitaetsgate.md 0013-m9-konformitaetsgate.md`; die Entscheidung selbst wurde
  **inhaltlich nicht verändert** — Ergänzung ist ein datierter Kopfvermerk „Nummer nachvergeben am
  2026-10-07" mit Begründung; das Datum 2026-10-04 bleibt stehen.
- Am **alten Pfad** steht eine kurze **Weiterverweisakte** (`0006-m9-konformitaetsgate.md`) mit
  Status „Weiterverweis" und Link auf 0013; 0013 verlinkt die Weiterverweisakte zurück.
- **Index:** beide Dateien sind eingetragen (Weiterverweisakte als solche gekennzeichnet), dazu ein
  datierter Nachtrag, der die frühere Doppelnummer **explizit benennt**. Keine stillschweigende
  Glättung.
- **Roadmap:** die Textstelle „ADR 0006" behält ihren Wortlaut und bekam einen datierten Zusatz mit
  dem neuen Pfad. Das **historische** Protokoll bleibt unangetastet (Ergänzungsregel); sein Verweis
  löst über die Weiterverweisakte auf.
- **Neuer Doku-Gate** `scripts/adr-audit.mjs` → `npm run adr:check`, Pflichtteil von `npm run check`.
  Geprüft werden: (1) genau ein Indexeintrag je Datei, (2) jeder Indexverweis existiert, (2b) jeder
  relative Verweis **innerhalb** einer ADR-Datei existiert, (3) keine zwei **aktiven** Entscheidungen
  mit derselben Nummer (eine Weiterverweisakte zählt nicht mit), (4) jede Weiterverweisakte nennt in
  ihrer Status-Zeile einen vorhandenen Nachfolger, und der Nachfolger **verlinkt** sie zurück.

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| Jede aktive ADR-Datei hat genau einen Indexeintrag | ✓ 14 Dateien, Index vollständig |
| Keine zwei aktiven Entscheidungen dieselbe ID | ✓ 13 Entscheidungen, Nummern eindeutig; die aufgelöste Doppelnummer ist benannt |
| Alte und neue Links landen bei der richtigen fachlichen Entscheidung | ✓ Weiterverweisakte → 0013 und Rückverweis; alle relativen Verweise in und aus den Akten lösen auf |
| Dokugate prüft ID-Eindeutigkeit, Existenz, Indexvollständigkeit | ✓ `adr:check` in `check`; Ausgabe: „14 files, 13 decisions + 1 Weiterverweisakte(n), index complete, ids unique" |

## Mutationsgegenproben (fünf, jede mit Wiederherstellung und Hash-Vergleich)

| # | Mutation | Meldung des Prüfers |
|---|---|---|
| E | Indexeintrag von 0013 gelöscht | `0013-m9-konformitaetsgate.md: fehlt im Index` |
| F | Weiterverweisakte aus Versehen als „angenommen" geführt | `Nummer 0006 doppelt: 0006-m9-konformitaetsgate.md und 0006-voller-wert-und-genauigkeitsampel.md` |
| C | Rückverweis im Nachfolger nur als **Text**, nicht als Link | `Nachfolger 0013-… verlinkt die Weiterverweisakte … nicht (nur der Dateiname als Text genügt nicht)` |
| D | Status-Zeile der Weiterverweisakte ohne Link | `Weiterverweisakte 0006-…: die Status-Zeile nennt keinen Nachfolger` |
| G | Verweis **innerhalb** einer ADR-Datei zeigt ins Leere | `0006-… verweist auf eine fehlende Datei: 0006-gibt-es-nicht.md` |

**Fehler auf dem Weg, ehrlich benannt:** Mutation **C griff zuerst NICHT** — der Prüfer suchte den
Dateinamen des Vorgängers als **Text** im Nachfolger, und der Text stand noch da. Ursache lag im
**Prüfmittel**, nicht in der Akte; nachgeschärft auf einen echten Link (`](name)`). Die danach
aufgedeckte zweite Schwäche — der Stub zog bei fehlendem Link irgendeinen anderen Verweis heran —
wurde ebenfalls behoben, indem der Nachfolger an die **Status-Zeile** gebunden ist.

## Prüfkette

`npm run check` **Exit 0** — 719 Tests in 51 Dateien, 0 Lint-Fehler, `adr:check` läuft mit ·
Nichts gepusht. (Diese Karte ändert keinen Programmcode; `npm run build` ist davon unberührt und lief
im Rahmen der Nachbarkarten desselben Durchzugs.)

## Grenzen

- Der Gate prüft **Datei- und Nummernebene** und die Existenz aller relativen Verweise. Er prüft
  **nicht**, ob eine inhaltliche Aussage („ADR 0005") auf die fachlich richtige Nummer zeigt — das
  bleibt redaktionell.
- Historische Dateien (Protokolle, ältere Übergaben) werden bewusst **nicht** umgeschrieben; ihre
  alten Nummernangaben lösen über die Weiterverweisakte auf.
- Die Nummer 0013 wurde **nachvergeben**, ihre Entscheidung ist älter als die Nummer 0012. Das steht
  so in der Datei und im Index — es wird nicht rückdatiert.
