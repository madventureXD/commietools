# MS0: verbindlicher Umfang und Belegbasis

**Datum:** 2026-10-08  
**Bearbeitet durch:** Codex  
**Auftrag:** „Ms0 go“ (Thomas)  
**Status:** lokale Kriterien-/Zuordnungsarbeit abgeschlossen; organisatorischer Exit offen

## Einstieg

- [Kartenbasis](kartenbasis.md): Übersicht aller 59 Karten und Originalabnahmen/Abgrenzungen der 26 offenen Karten.
- [Maschinenlesbare Basis](basis.json): Originalverträge aller 59 Karten, Quellenhashes, Nachprüfungsurteile, Milestones, Verantwortungsrollen und getrennte Mess-/Entscheidungsfelder.
- [Funktionsumfang D/E](funktionsumfang.md): ursprüngliche Kriterien aller acht bereits gebauten Werkzeuge; [Daten](funktionsumfang.json).
- [Prüfzugang und Abnahmefenster](abnahmefenster.md): Rollen, relative Prüfzeitpunkte, notwendige Geräte/Kontozugänge und offene Bestätigungen.

Die einzige Fortschrittsübersicht bleibt
[der QM-Leitfaden](../../../00-einstieg/vorgehen-qm-audit.md).
Diese Dateien sind eine datierte Ausgangsbasis, kein zweites laufendes Fortschrittsregister.
Spätere Ergebnisse erhalten separate datierte Protokolle; Originalurteile und Quellen werden
nicht zu Reparaturergebnissen umgeschrieben.

## Umfang und verbindliche Grenzen

59 eindeutige Karten: **33 B · 16 R · 9 F · 1 O**. Die neun F-Karten sind im aktuellen Nachtrag
erneut geöffnet, R/O bleiben offen. B bedeutet Befundkern nachvollzogen, keine Gesamtfreigabe.
Die 63 früheren OPs bleiben eigenständige Projektarbeit. MS0 führt zwei neue gebündelte OPs für
Sanierungsfortsetzung und externe Abnahmeorganisation; keine stillschweigende Erledigung alter OPs.

Die `Abnahme`- und `Nicht tun / Abgrenzung`-Abschnitte aller Originalkarten sind als unveränderte
Textauszüge übernommen. Ergänzungen aus der Nachprüfung stehen getrennt daneben. Empfehlungen
werden auf aktuelle Verträge geprüft; bekannte Entscheidungen gelten weiter: enge pdf_signer-
Ausnahme, NEL Weg A, Infinitivstil, Warnbudgets mit harten Strukturgrenzen, bestehende Rechner-
Präzisionsregel und ausdrücklich dokumentierte CSV-Abnahmegrenze. Dies sind keine neu erteilten
Ausnahmen. Die frühere Kontrastausnahme wird nicht neu aktiviert: die Nachprüfung belegt die
tatsächliche Tokenkorrektur.

Welle D/E ist bereits gebaut. Der vor dem Bau erstellte D-Plan hat konkrete Kriterien und darf
nicht unter einer pauschalen Aussage „A–D ohne schriftliches Kriterium“ verschwinden. Die aktuellen
Kennungen `inspection` und `handover-report` ersetzen lediglich damalige Vorschlagskennungen in
der Prüfzuordnung; historische Texte bleiben erhalten. Nicht abgeschlossene andere Produktkonzepte
bleiben getrennt; fehlende ursprüngliche Kriterien werden nicht rückwirkend erfunden.

## Herkunft und Integrität

23 ausgewählte Textquellen liegen byteidentisch unter `quellen/`; ihre SHA-256-Prüfsummen und
Originalpfade stehen in `basis.json`. Die zusätzliche Endung `.txt` kennzeichnet unveränderte
historische Texte: darin enthaltene Links und Zeilen beziehen sich auf ihre damalige Ablage/Basis.
Sie werden nicht als aktuelle Navigation ausgegeben. Die Originale unter `QM/` wurden nicht
verändert oder entignoriert. Es wurden keine PDFs, Screenshots, Nutzerdaten oder privaten Schlüssel
übernommen; die Ablage enthält ausschließlich Karten, Berichte, Pläne und Entscheidungen.

Prüfung aus einem Checkout ohne ursprüngliches `QM/`:

```text
node scripts/belege/fertigstellung-basis.mjs
```

Der Prüfer liest nur diese versionierbare Basis und das aktuelle Manifest. Er bestätigt Quellenhashes,
exakte Kriterien-/Grenztexte, ID-/Urteilszuordnung, neun wieder geöffnete Karten, alle Milestones,
externe Abnahmegruppen und die tatsächlichen acht D/E-Routen. Er beweist keine Produktreparatur.

## MS0-Exit

| Kriterium | Stand |
|---|---|
| 59 eindeutige IDs / 26 offene Zuordnungen | erhoben; mit dem Belegprüfer verifizieren |
| Originalkriterien und Grenzen / keine fehlende Kartenquelle | für alle 59 erfasst; Quellen eingefroren |
| Ursprüngliche D/E-Kriterien und Freigabeauflagen | zusammengetragen; A2 und externe Abnahmen weiterhin offen |
| Rollen und vorgesehene Prüfzeitpunkte | je Gruppe zugeordnet, relative Milestone-Fenster |
| Prüfer/Geräte/Zugänge tatsächlich reserviert | **offen**; MS0 kann diesen organisatorischen Exit noch nicht als erfüllt ausweisen |

Nächste lokale Arbeit ist MS1. Die Planung der externen Abnahmen muss vor dem entsprechenden
Abnahmefenster bestätigt werden. MS1–MS7 sind durch diesen MS0-Auftrag noch nicht ausgeführt.

## Prüfabschluss 2026-10-08

Der Belegprüfer besteht (Exit 0): 59 Karten, 26 offen, 23 Quellenhashes, acht D/E-Routen;
alle Kriterien- und Abgrenzungstexte stimmen vollständig mit ihren Originalabschnitten überein.
Zusätzlicher Vergleich gegen die ursprünglichen Ablagen bestätigt alle 23 Originaldateien
unverändert. Aufruf aus einem anderen Arbeitsverzeichnis ebenfalls erfolgreich.

`npm run check` nach genehmigter Eskalation besteht mit 733 Tests und 110 Lint-Warnungen
bei null Fehlern. Der erste Sandboxlauf führte wegen eines EPERM-Fehlers im temporären
Vitestcache keine Tests aus. `npm run build` besteht: Einstieg 149755 B gzip und Rechenkern
103801 B gzip; die vorhandenen Werkzeugtext-Gesamtwarnungen bleiben sichtbar.
Einzelheiten und Belegpfade stehen in der
[Sitzungsübergabe](../../../05-uebergaben/2026-10-08-ms0-umfang-und-belegbasis.md).
Die organisatorische Restabnahme OP-066 bleibt offen.
