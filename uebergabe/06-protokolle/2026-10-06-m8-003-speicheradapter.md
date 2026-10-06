# Fortschrittsprotokoll: M8-003 (R3) — Speicherzugriffe werfen nicht mehr

**Datum:** 2026-10-06
**Status:** **TEILWEISE** — Startpfad abgesichert; Verlaufs-/Store-Vertrag und flüchtiger Betrieb offen
**Karte:** M8-003 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`

## Umfang

Neu: `packages/core/src/storage.ts` (Speicheradapter), Unterpfad `@commietools/core/storage`.
Geändert: `apps/web/src/App.tsx` (Theme, Sprache), `apps/web/src/ToolNavigation.tsx`
(Sortierung, Favoriten/Verlauf), `packages/core/package.json`. Neu: `apps/web/src/storage.test.ts`.

## Ergebnisse

**1. Der Befund trifft zu — im Startpfad.** An vier Stellen wurde `localStorage` **ungeschützt**
gelesen: `preferredTheme`, `preferredLocale` (beide beim ersten Rendern) und zweimal in der
Werkzeugschublade. Wo der Speicher nicht zugänglich ist — blockierte Website-Daten, manche
Privatmodi — wirft schon der **Zugriff** oder das Lesen einen `SecurityError`. Da die Aufrufe in
der Initialisierung liegen, brach die Anwendung beim Start ab: leerer Bildschirm statt Werkzeug.

**2. Lösung: ein Adapter mit expliziten Ergebnissen.** `readLocal`, `writeLocal` und
`readLocalJson` melden `ok`, `unavailable`, `quota` oder `invalid` — **kein Wurf**, und kein leerer
`catch`-Block, der einen verlorenen Wert verschweigt (die Karte verbietet genau das). Der Zugriff
auf `window.localStorage` selbst liegt ebenfalls im Schutz, weil auch er werfen kann.

**3. Rückfall statt Abbruch.** Theme und Sprache fallen auf Systempräferenz bzw. `detectLocale`
zurück, Sortierung auf `category`, Favoriten und Verlauf auf leere Listen — alles bisherige
Verhalten, nur ohne Abbruch.

**4. Die Testumgebung belegt den Fall echt.** Die Tests laufen ohne `window`; damit ist
„Speicher nicht verfügbar" nicht nachgestellt, sondern tatsächlich gegeben: `readLocal` liefert
`unavailable`, `writeLocal` ebenso, und `readLocalJson` gibt den Rückfallwert.

## Was noch fehlt (ausdrücklich offen)

Die Karte verlangt deutlich mehr, und davon ist **nichts** umgesetzt:

- **Verlauf und Einstellungen vom Engine-Laden entkoppeln** (`calculator-frame.tsx`,
  `calculatorStore` in `calculator/history.ts`): Ein Speicherfehler soll den **flüchtigen
  Sitzungsbetrieb** aktivieren und das ehrlich anzeigen, statt die Rechnung zu verhindern.
- **Kein „gespeichert"-Erfolg bei flüchtiger Ablage:** Die Oberfläche prüft den Rückgabewert des
  Schreibens noch nicht.
- **Aufmaß- und Prüffristen-Speicher** nach demselben Fehlervertrag.
- **Quota, IDB-Reject und kaputtes JSON** sind nicht als Fehlerfälle gefahren (die Zustände
  `quota` und `invalid` existieren, sind aber nicht belegt).
- Die **Abnahme** der Karte fehlt vollständig.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| ungeschützte Speicherzugriffe | 4 → 0 (Startpfad/Schublade) | `App.tsx`, `ToolNavigation.tsx` |
| neue Testfälle | 4 | `apps/web/src/storage.test.ts` |
| neue Abhängigkeiten | 0 | — |