# Fortschrittsprotokoll: M4-004 (R3) — abgelehnte Importe vergiften den Zwischenspeicher nicht mehr

**Datum:** 2026-10-06
**Status:** **TEILWEISE** — Ursache behoben; der von der Karte verlangte **UI-Fehler- und Wiederholungszustand fehlt noch**
**Karte:** M4-004 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`

## Umfang dieses Schritts

Neu: `packages/core/src/loadCache.ts` (`cachedLoader`) mit eigenem Unterpfad-Export.
Geändert: `scripts/catalog-generate.mjs` (Generator — die erzeugten Dateien werden **nicht** von
Hand angefasst), `packages/i18n/src/index.ts`, `packages/core/package.json`, neu
`apps/web/src/load-cache.test.ts`. Neu erzeugt: `catalog/generated/loaders.ts`,
`catalog/generated/textLoaders.ts`.

## Ergebnisse

**1. Der Befund trifft zu — an vier Stellen mit demselben Muster.** Alle Lader hießen:

```ts
const cached = cache.get(key); if (cached) return cached
const promise = import(…)
cache.set(key, promise); return promise
```

Ein **abgelehnter** Import bleibt darin liegen. Der nächste Aufruf findet die Ablehnung, gibt sie
sofort wieder zurück und lädt **nie** neu: Ein Netzaussetzer beim ersten Aufruf machte eine Sprache
oder ein Werkzeug dauerhaft unbrauchbar. Betroffen: `loadToolSearchIndex` (Suchpaket),
`loadCommonToolTexts`, `loadToolTexts`, `loadAllToolTexts` und `loadInterfaceMessages`.

**2. Lösung: ein gemeinsamer Helfer statt vier Abschriften.** `cachedLoader(cache, key, load)`
entfernt die Ablehnung wieder — und zwar **nur dieses Promise** und **nur, solange es das aktuelle
ist**. Die zweite Bedingung ist der von der Karte benannte Fall („alter Reject darf neuen Erfolg
nicht löschen"): Treffen zwei Anfragen aufeinander (Sprache A langsam, B schnell), darf der späte
Fehlschlag von A den gelungenen Eintrag von B nicht entfernen.

**3. Der Generator wurde geändert, nicht sein Ergebnis.** Die erzeugten Ladedateien tragen den
Hinweis „do not edit by hand"; beide (Suchindex und Textlader) entstehen jetzt mit `cachedLoader`
und wurden anschließend über `npm run catalog:generate` neu erzeugt.

**4. Eine Falle, die den Generator lahmlegte.** Der erste Versuch exportierte den Helfer über
`@commietools/core` (Reexport in `index.ts`). Der Generator liest `core/index.ts` über eine
`data:`-URL — ein **Laufzeitimport** darin ist dort nicht auflösbar, und `catalog:generate` brach
mit `ERR_INVALID_URL` ab. Richtig ist der eigene Unterpfad `@commietools/core/loadCache`; `index.ts`
bleibt frei von Laufzeitimporten.

**5. Der helfende Sprachspeicher steht inline.** `@commietools/i18n` hängt nicht von `core` ab; für
zwei Zeilen wurde **keine** neue Paketgrenze gezogen. Die Logik steht dort als Kommentar begründet
und ist identisch.

## Was noch fehlt (ausdrücklich offen)

Die Karte verlangt zusätzlich einen **sichtbaren, übersetzten Fehlerzustand mit Wiederholung**
(`LoadState idle/loading/ready/error`, `requestKey`, Retry ohne Dokumentreload, getrennte
Rückfalltexte, Generationsschutz). Das ist **nicht** umgesetzt. Belegt ist bisher nur die Ursache:
dass ein Wiederholungsversuch jetzt überhaupt neu laden **kann**. Die Abnahme der Karte ist damit
**nicht** erfüllt.

## Belege

- **Tests** `apps/web/src/load-cache.test.ts`: Retry nach Ablehnung lädt wirklich neu (Zähler 2),
  Erfolg wird nur einmal geladen, später Fehlschlag löscht einen neueren Eintrag nicht.
- **Prüfkette:** `npm run catalog:generate` (Exit 0) → `npm run licenses:generate` →
  `npm run check` → `npm run build`.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Stellen mit dem vergifteten Muster | 5 → 0 | `loaders.ts`, `textLoaders.ts`, `i18n/index.ts` |
| neue Testfälle | 3 | `npx vitest run` |
| neue Paketabhängigkeiten | 0 (Unterpfad statt Reexport) | `packages/core/package.json` |

## Folgemaßnahmen

- [ ] **UI-Fehler-/Wiederholungszustand umsetzen** (Kern der Karte): Ladezustand in
      `App.tsx`/`CatalogSection.tsx`/`ToolNavigation.tsx`, sichtbare übersetzte Fehlermeldung,
      Retry-Knopf ohne Dokumentreload, Schutz vor Reloadschleifen.
- [ ] Abnahme der Karte fahren: Import bewusst ablehnen (Proxy vor dem Browser), Netz herstellen,
      Retry; Locale A langsam, B schnell; alter Reject darf neuen Erfolg nicht löschen.
