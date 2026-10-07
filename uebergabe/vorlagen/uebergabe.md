# Übergabe: <Titel>

**Datum:** YYYY-MM-DD  
**Bearbeitet durch:** <Name oder System>  
**Auftrag:** <Auftrag im Wortlaut oder in einem Satz — was war beauftragt, und was ausdrücklich nicht>  
**Status:** abgeschlossen | teilweise | blockiert

## Ziel der Sitzung

<Auftrag und gewünschtes Ergebnis>

## Ergebnis

<tatsächlich erreichter Stand>

## Geänderte Bereiche

- `<Pfad>` – <Änderung>

## Entscheidungen und Annahmen

- <Entscheidung oder ausdrücklich gekennzeichnete Annahme>

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | nicht ausgeführt |
| `npm run build` | nicht ausgeführt |

## Offene Punkte und Risiken

- [ ] <offener Punkt, Blocker oder Risiko>

## Empfohlener nächster Schritt

1. <konkreter nächster Schritt>

## Git

- Commit: `<Hash oder noch nicht committed>`
- Arbeitsbaum: `<sauber oder relevante offene Änderungen>`

---

## Pflichtabschnitte und Prüfung dieser Vorlage

Die Übergabe wird **nicht aus dem Gedächtnis** geprüft, sondern gegen diese Liste:

**Kopf:** `Datum` · `Bearbeitet durch` · `Auftrag` · `Status`
**Abschnitte:** Ziel der Sitzung · Ergebnis · Geänderte Bereiche · Entscheidungen und Annahmen ·
Prüfungen · Offene Punkte und Risiken · Empfohlener nächster Schritt · Git

**Gleichwertige Überschriften sind zugelassen.** Wer „Was jetzt da ist" statt „Ergebnis" schreibt,
hat den Abschnitt — die Prüfung meldet die Abweichung, wertet sie aber nicht als Mangel. Ein
**fehlender** Abschnitt ist ein Mangel, eine andere Überschrift nicht. Zusätzliche Abschnitte sind
erwünscht.

**Prüfnachweis und Revision sind Pflicht:** der Abschnitt „Prüfungen" muss eine **ausgeführte**
Prüfung mit Exit oder Beleg nennen, der Abschnitt „Git" einen Commit-Hash **oder** ausdrücklich
sagen, dass nichts committet wurde. Platzhaltertext in den Kopffeldern besteht nicht.

Geprüft wird mit `npm run akte:check` (QM-Karte M10-002). Übergaben **vor dem 2026-10-07** sind
historisch: ihre Lücken werden gemeldet, aber nicht gewertet und nicht rückwirkend umgeschrieben
(siehe `01-stand/offene-punkte.md`, OP-018/OP-034).

