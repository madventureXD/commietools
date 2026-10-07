# R7 / M2-003 — Angenommener Rechner-ADR enthält zwei überholte Budgets: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „Rechner-ADR enthält überholte Größen-/Budgetaussagen." … „Historische
250KiB-/Welle-2-Angaben mit datiertem Nachtrag vom aktuellen gemessenen Stand und gültiger
Warnschwelle unterscheiden; nicht nachträglich alte Messwerte verfälschen. Baseline erklärt
Messmethode roh/gzip und Chunkumfang. Überflüssige Parallelimporte als strukturelle Regression
prüfen."
**Status:** **erledigt** — Nachtrag im ADR, Messmethode in der Referenzdatei, und eine fehlende
**harte** Regel ergänzt (siehe „mitbehoben").

## Was der Befund war

ADR 0005 nennt drei Zahlen, die nicht mehr gelten: „Startbudget 250 KiB gzip", „rund 95 KiB gzip" für
die Rechner-Route und eine Messung von „89,5 KiB". Im Gate stehen heute **200 KiB** (Startwarnschwelle)
und **110 KiB** (Rechenkern-Chunk).

## Umsetzung

- **ADR 0005:** datierter Nachtrag als Gegenüberstellungstabelle (alte Aussage → heute gültig), mit
  **Trennung** von historischer Messung (2026-10-03, andere Factory-Liste), Nachmessung (2026-10-04,
  **100,6 KiB**) und ausgeliefertem Chunk (2026-10-07, **103.801 B gzip** — enthält zusätzlich den
  Rechnerrahmen, also **nicht** gleichzusetzen). Der Ursprungstext bleibt unverändert.
- **`scripts/bundle-size-baseline.json`:** erklärt sich jetzt selbst — `_einheit` (Byte, gzip),
  `_umfang` (Eingangsskript vs. Chunk/Summe) und `_hinweis` (wird nur gelesen, nie automatisch
  nachgezogen). Die Zahlen selbst wurden **nicht** angepasst: eine neue Referenz wäre eine eigene
  Entscheidung und würde die Abweichung verstecken.
- **Index:** Eintrag zu ADR 0005 um den Hinweis auf die überholten Zahlen ergänzt.

## Mitbehoben: fehlende harte Regel für mathjs

ADR 0005 sagt: „mathjs wird ausschließlich nachgeladen. Es darf **nie** im Startbündel liegen."
Der Prüfer hatte dafür **keine** harte Regel — `staticBudget` war beim Rechenkern nicht gesetzt, ein
statischer Import wäre nur als **Größenwarnung** erschienen. Ergänzt: `staticBudget: 0` (wie bei den
PDF-Engines). Sauberer Bau danach grün, **kein** Fehlalarm.

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| Buildreport und ADR-Nachtrag nennen konsistente Einheit/Umfang | ✓ beide **gzip-Bytes**; Umfang in der Baseline-Datei und im Nachtrag gleich benannt |
| Keine zweite komplette mathjs-Instanz im Start | ✓ gemessen: **genau 1** Chunk mit mathjs-Signatur (`core-*.js`), **nicht** im Eingang |
| Größenwarnung bleibt Warnung | ✓ Bau grün (Exit 0), Rechenkern-Chunk 103.801 B gzip von 110 KiB Schwelle |
| Kein pauschales Upgrade/Rewrite | ✓ nur Dokumentation, Referenzerklärung und eine Prüfregel angefasst |

## Mutationsgegenprobe

Statischer Import des Rechenkerns in den Starteingang (`apps/web/src/main.tsx`):

```
Error: Rechenkern (mathjs) engine is statically reachable from the initial page (by content): index-Cel0uAVV.js
EXIT=1
```

Danach `git checkout` der Quelle, sauberer Bau wieder **Exit 0** (Eingang 150.082 B gzip).

## Gemessener Stand am ausgelieferten Bau (2026-10-07)

```
Eingang: index-*.js (150082 B gzip)
Chunks mit mathjs-Signatur: 1
  core-*.js  roh 364658 B · gzip 103801 B
mathjs im Eingang: false
```

Messung: `work/r7-u6-messung.mjs`.

## Prüfkette

`npm run build` **Exit 0** (sauber, nach der Nachschärfung) · `npm run check` für denselben Codestand
grün (719 Tests). **Ehrlich benannt:** der erste Anlauf des sauberen Baus hinterließ keine Logdatei;
er wurde **wiederholt** und das Ergebnis oben stammt aus dem wiederholten, vollständig protokollierten
Lauf. Nichts gepusht.

## Grenzen

- Die Baseline-Zahlen selbst sind **weiterhin** der Stand eines früheren Baus; die Abweichungszeile im
  Baubricht ist deshalb groß und **ehrlich**. Eine Neusetzung ist eine eigene Entscheidung.
- Die Messung „genau 1 mathjs-Chunk" gilt für den heutigen Bau; eine künftige zweite Instanz würde
  durch die neue harte Regel nur erkannt, wenn sie **statisch erreichbar** ist — eine zweite,
  dynamisch geladene Instanz (echte Doppelung im Lazy-Pfad) fände der Prüfer **nicht**.
