# Fortschrittsprotokoll: entschiedene Kleinigkeiten umgesetzt (2026-10-06)

**Datum:** 2026-10-06
**Status:** umgesetzt und geprüft
**Grundlage:** Entscheidungen Thomas im Gespräch (`00-einstieg/vorgehen-qm-audit.md`, Abschnitt 6)

## 1. Revisionsbindung des Lizenzregisters gelöst

**Vorher:** `licenses:check` verglich den erzeugten Text **ganz**, und darin stand die Revision des
Erzeugungsstands samt der daraus gebildeten `blob/<revision>/`-Adressen. Nach jedem Commit war die
Prüfung deshalb rot, bis neu erzeugt wurde; die beiden Registries mussten dauerhaft uncommittet
bleiben.

**Jetzt:** Neue Funktion `ohneRevision()` in `scripts/license-audit.mjs` neutralisiert Revision und
Build-Adressen **nur für den Vergleich**. Beim Erzeugen wird die Revision weiterhin gebunden, die
ausgelieferte Datei trägt sie unverändert.

**Geprüft:** `npm run licenses:check` ist grün (Exit 0) **ohne** vorheriges `licenses:generate` —
genau der Fall, der vorher rot war. Damit sind die beiden Registries wieder versionierbar.

## 2. GPL-Einzelausnahme für `pdf_signer` eingetragen

`licenses/rust-review.json`: Der Eintrag `pdf_signer 0.3.2` ist von `needsDecision: true` auf
**entschieden** gesetzt — enge Einzel-Ausnahme für GPL-3.0-or-later, ausdrücklich **nicht** generell
in `allowedExpressions`. Grund, Datum, Zulässigkeit (AGPL-3.0 §13), Quellangebot und der weiter
offene Originalhinweis stehen im Eintrag.

## 3. Aufräumregel für die Rust-Hinweisordner

**Befund:** Beim Erzeugen wurden neue Ordner in `apps/web/public/licenses/notices/rust` angelegt,
alte **nie entfernt** — so sammelten sich 21 Leichen nicht mehr enthaltener Komponenten, während
`licenses/notices/rust` korrekt aufgeräumt war.

**Jetzt:** In `baueRustTeil()` wird der Zielordner mit der Komponentenliste abgeglichen.
Beim **Erzeugen** werden verwaiste Ordner entfernt; beim **Prüfen** werden sie **gemeldet**
(`fail`) statt still gelöscht — ein Prüflauf darf nichts ändern.

## Nicht umgesetzt (ausdrücklich offen)

- **Zlib** und **Unicode-3.0** in `allowedExpressions` — von Thomas **nicht** entschieden; bleibt
  offen (ich hatte sie vorgeschlagen, er hat nur die GPL-Frage beantwortet).
- **Fünf Advisory-Treffer** — Entscheidung war „erst messen, welche Pakete im ausgelieferten WASM
  landen". Diese Messung ist **nicht** gefahren.
- **13 ältere Übergaben** ergänzen — entschieden, noch nicht ausgeführt.
- **M2-009 / M3-001** prüfen — entschieden, noch nicht ausgeführt.
- **M10-004** (Belegskripte nach `scripts/belege/`) — entschieden, noch nicht ausgeführt.
