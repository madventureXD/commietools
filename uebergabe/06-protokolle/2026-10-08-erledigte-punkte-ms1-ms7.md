# Erledigte Punkte — MS1–MS7

**Datum:** 2026-10-08 · **Bearbeitet durch:** Codex · **Status:** Archiv

## OP-062 — ursprünglicher Eintrag

Unverändert aus Basisrevision 556159f58ac3beac3b6349851dae7326558b7fbb übernommen. Die dort offene Entscheidung ist mit dem folgenden datierten Nachtrag erledigt.

- [ ] OP-062 — **Nachträgliche Entscheidung zur Strukturmigration von vier Übergaben** *(2026-10-07,
  Karte M10-003)*. Bei der Angleichung an die Vorlage wurden vier Übergaben **umgeschrieben** statt
  ergänzt: `6e33dc3` (2026-10-04, drei Dateien, +179/−82) und `ed0ee4e` (2026-10-05, +94/−39). Die
  vier Dateien tragen seit dem 2026-10-07 einen datierten **„Hinweis zur Fassung"** mit Umfang und
  Abrufweg der Fassung davor (`git show <commit>^:<pfad>`); die Git-Geschichte ist unverändert.
  **Offen ist allein die Entscheidung**, ob das nachträglich als *beschlossene Ausnahme* gilt oder ob
  für künftige Strukturmigrationen eine Archivfassung im Baum geführt werden soll — das
  Aktenkorrekturverfahren in `00-einstieg/arbeitsregeln.md` verlangt eine solche Ausnahme, eine
  gibt es für diese vier Dateien nicht. **Keine Schuldzuweisung, keine Behauptung verlorener
  Historie** (die Karte verbietet beides ausdrücklich). Protokoll:
  `06-protokolle/2026-10-07-r8-m10-003-aktenkorrektur.md`.

## Nachtrag 2026-10-08 — erledigt

Innerhalb des vollständig freigegebenen MS6-Auftrags wurde die Archivvariante umgesetzt. Vier Fassungen vor Migration sind mit vollständiger Revision und SHA-256 im Baum erhalten. Keine nachträgliche Freigabe am damaligen Datum behauptet; heutige Fassungen und Gitgeschichte bleiben erhalten. Unabhängige Gesamtprüfung steht weiterhin aus.

Beleg: [Archivmanifest](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/archiv/manifest.json), [MS1–MS7-Paket](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/README.md).

## OP-065 und OP-066 — ursprüngliche Einträge

Wörtlich aus Basisrevision `4cb2a47` übernommen; Erledigung durch den folgenden datierten Entscheidungsnachtrag.

- [ ] OP-065 — **26 offene Karten nach unabhängiger Nachprüfung bearbeiten.** Neun F-Karten
  sind ausdrücklich erneut geöffnet, 16 R-Abnahmen und M8-001 (O) bleiben offen. Maßgeblicher
  Stand: datierter Nachtrag im QM-Leitfaden; Kriterien-/Belegbasis:
  [MS0](../07-pruefung/fertigstellung/2026-10-08-ms0/README.md).
  **Verantwortlich:** Entwicklung bei Beauftragung MS1–MS7; Thomas für Betreiberentscheidungen.
  **Restabnahme:** MS1–MS7 gemäß Konzept, tatsächliche Gegenproben und unabhängige A2;
  keine automatische Erledigung durch administrative Häkchen. Die 33 B-Karten behalten ihre
  begrenzte positive Bewertung. Bestehende zugehörige OPs werden erst mit Einzelbeleg geschlossen.
- [ ] OP-066 — **Externe MS0-Abnahmen tatsächlich reservieren.** Geplante Rollen, notwendige
  Geräte/Reader/Kontozugänge und relative Zeitpunkte stehen in
  [Abnahmefenster](../07-pruefung/fertigstellung/2026-10-08-ms0/abnahmefenster.md).
  **Verantwortlich:** Thomas als Betreiber/Koordinator; unabhängiger Prüfer und Geräte-/Fachprüfer
  noch zu benennen. **Restabnahme:** bestätigte Personen und Verfügbarkeit vor dem jeweiligen
  Milestone (Rust/Lieferung MS1, Release/Reader MS5, Geräte/Fachlichkeit MS6, A2 MS7).
  MS0 darf eine vorgeschlagene Rolle oder relative Planung nicht als tatsächliche Buchung zählen.

## Nachtrag 2026-10-08 — OP-065/066 nach Rücksprache erledigt

Thomas hat nach Erläuterung der sieben Restkarten entschieden: „Gut. Hake die restlichen Karten
als nach Rücksprache bestanden ab“. Die bekannten nativen/physischen Messlücken sind für den
Auditabschluss akzeptiert. OP-065 ist durch technische Nachweise und diese ausdrückliche Abnahme
erledigt. Die externe Geräte-/Prüferreservierung OP-066 wird für diesen Abschluss nicht mehr
verlangt; keine tatsächlich erfolgte Buchung behauptet. Beleg:
[Abnahmeprotokoll](2026-10-08-audit-restkarten-abnahme.md). OP-067 bleibt offen.
