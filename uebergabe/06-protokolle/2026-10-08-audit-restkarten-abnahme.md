# Audit-Restkarten: Abnahme nach Rücksprache

**Datum:** 2026-10-08  
**Bearbeitet durch:** Codex  
**Entscheidung:** Thomas, ausdrücklich im Gespräch  
**Status:** abgeschlossen

## Auftrag und Entscheidung

Nach Erläuterung der sieben Restkarten und der fehlenden nativen/physischen Messungen hat
Thomas angeordnet:

> „Gut. Hake die restlichen Karten als nach Rücksprache bestanden ab“

Die Entscheidung gilt für die sieben zuvor einzeln erläuterten Karten. Sie akzeptiert die
bekannten Abnahmelücken für diesen Auditabschluss. Die nicht ausgeführten Prüfungen werden
dadurch nicht zu gemessenen erfolgreichen Testläufen. Die bisherigen Messberichte bleiben erhalten.

## Abgenommene Karten

| Karte | Entscheidung | Akzeptierte Abnahmelücke |
|---|---|---|
| M5-002 | ✓ **nach Rücksprache bestanden** | Native Speicherdialogprobe am Zielgerät |
| M2-009 | ✓ **nach Rücksprache bestanden** | Tatsächliche Vorleserprüfung und nativer Browserzoom |
| M2-006 | ✓ **nach Rücksprache bestanden** | Gesprochene Vorleseransagen in de/en/es |
| M7-002 | ✓ **nach Rücksprache bestanden** | Reale Hilfstechnik und Bildschirmtastatur im Menü |
| M7-003 | ✓ **nach Rücksprache bestanden** | Verbleibende Touch-/Rotations-/Zoom- und native Bedienproben |
| M7-004 | ✓ **nach Rücksprache bestanden** | Reale Vorleser-/Lesereihenfolge und natives Auskoppeln |
| M7-005 | ✓ **nach Rücksprache bestanden** | Nativer 200-%-Zoom und reales Mobilgerät |

## Grundlage und Wirkung

Dokumentationsbasis: `4cb2a47`; tatsächlich extern geprüfter Produktkandidat:
`5815c67be9e377446c68c2bc63b9083fa5bf0b2d`, Quellidentität
`590f3b15fdf305249d7bb78ccd3c17fddb05c342e12abfde32005f5e425e0963`.
[CI-Lauf 37771905865](https://github.com/madventureXD/commietools/actions/runs/37771905865)
hat vier erfolgreiche Pflichtjobs. Die tatsächlichen lokalen und öffentlichen Messungen stehen
im [Abschlussbericht](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/abschlusspruefung.md).
Windows-Zugriffsfehler und fehlende physische Geräte bleiben dort als Messgrenzen dokumentiert.

Die Aussage aus `4cb2a47` „Sieben Originalkarten ... verhindern weiterhin ein uneingeschränktes
Gesamturteil“ wird für den **formalen Auditabschluss** durch diese ausdrückliche Betreiberabnahme
ersetzt. Der Sanierungsauftrag MS0–MS7 ist damit nach Rücksprache abgenommen. Der Gesamtbestand
umfasst 59 abgeschlossene Karten: 33 mit vorheriger begrenzter positiver Bewertung,
19 technisch geprüfte Nachprüfungsreste und sieben nach Rücksprache bestandene Karten.
Das ist kein Nachweis vollständiger WCAG-Konformität oder bestandener ungemessener Gerätetests.

OP-065 und OP-066 sind als Audit-Sammelpunkte erledigt; eine Geräte-/Prüferreservierung wird
für diesen Abschluss nicht mehr verlangt. Die Originaleinträge werden ins Erledigungsarchiv
übernommen. OP-067 zur genehmigten, bis 2026-11-08 befristeten Hinweisnachverfolgung bleibt offen.
Diese Entscheidung führt keinen Merge, Produktionspush oder Deployment aus.

## Prüfungen nach der Aktenänderung

Root-Check und Build tatsächlich ausgeführt, jeweils Exit 0; auch Workflow- und temporäre
Manifestprüfung Exit 0. Die anschließende Aktenprüfung besteht mit 63 aktiven OPs und
13 streng geprüften aktuellen Übergaben. Neue native/physische Messungen wurden nicht ausgeführt.
Die eingefrorene technische Kandidatendatei bleibt bytegleich erhalten.
[Prüfbeleg mit Loghashes](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/abnahme-ruecksprache-pruefbeleg.json).
