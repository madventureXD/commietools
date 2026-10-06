# Übergabe: R3 abgeschlossen, M2-009 nachgezogen — vier Karten und ein Prüfer

**Datum:** 2026-10-07
**Bearbeitet durch:** Faber (Hermes, Team 2)
**Auftrag:** „Durchziehen ohne Unterbrechung" für R3 und M2-009, im Wortlaut entschieden:
M4-004 „voller Kartenumfang … Abnahme über einen echten Netzausfall vor dem Browser",
M4-005 „abschließen mit benannter Grenze", M4-006 „StrictMode-Lauf gegen vite dev und
Wiederholungsnutzung nachholen, dann abschließen", M8-003 „voller Kartenumfang … Fehlervertrag
für die drei IDB-Stores + flüchtiger Sitzungsbetrieb mit wahrer Warnung …", M2-009 „beides:
Rückfall auf die Leinwandfarbe …, und jede verbleibende Lücke je Route benannt ausgeben" sowie
„`windows-latest`-Job in `.github/workflows/quality.yml`".
**Status:** abgeschlossen — **eine benannte, gemessene Abweichung** (M4-004, kein Retry im selben
Dokument)

## Ziel der Sitzung

Die vier R3-Karten mit Restforderung (M4-004, M4-005, M4-006, M8-003) und die letzte offene Karte
aus R4 (M2-009) so weit bringen, dass ihre **Abnahme** erbracht ist — mit Belegen aus echter
Ausführung, mit Mutationsgegenproben wo möglich und mit ausdrücklich benannten Grenzen, wo ein
Abnahmefall nicht herstellbar ist.

## Ergebnis

**R3 ist vollständig (6 von 6 Karten), R4 ist vollständig (8 von 8).** Gesamtstand der 59 Karten:
**28 erledigt, 1 mit Restforderung (M8-001), 30 offen.**

- **M4-005 ✓ mit benannter Grenze.** Abnahme auf dem heutigen Stand neu gefahren. Dabei **zwei
  Produktfehler gefunden und behoben**: Der Objekt-URL-Bestand des PDF-Teilers blieb offen, wenn
  man die Route **während** eines Auftrags verließ (gemessen 1200 Adressen; jetzt 0).
- **M4-006 ✓.** StrictMode-Zyklus und wiederholte Nutzung im Entwicklungsmodus belegt; fünf
  Aufträge hintereinander mit ausgeglichenen Zählern (Endstand 17/17/0), Mehrfachspeichern ohne
  Schaden.
- **M2-009 ✓.** Die Ursache des `skippedContrast` war der **Prüfer** (Hintergrundauflösung brach an
  durchsichtiger Vorfahrenkette ab); behoben mit Leinwandrückfall und **benannten** Lücken.
  Browserjob `browser` auf `windows-latest` verdrahtet. Gesamtläufe beider Schemata: 62 Routen ×
  2 Breiten, Exit 0, 0 Befunde, 0 Lücken.
- **M4-004 ✓ mit einer Abweichung.** Fehlerwege für Werkzeugtexte, Katalog, Menü und Suiten-Seite,
  Fehlergrenze mit getrennten Meldungen, Schleifensperre — Abnahme über einen Fehler-Proxy in
  sieben Prüfungen grün, 0 unbehandelte Zusagen. **Abweichung:** „Retry ohne Dokumentreload" ist
  bei einem gescheiterten Modulimport **nicht möglich** (gemessen: drei Versuche, eine
  Netzanfrage); statt eines wirkungslosen Knopfes steht das kontrollierte Neuladen.
- **M8-003 ✓.** Speicherfehlervertrag für Verlauf, Aufmaß und Prüffristen; Engine und Speicher
  **getrennt** geladen; flüchtiger Sitzungsbetrieb mit wahrer Warnung; kein „gespeichert" ohne
  Deckung; nach gescheitertem Lesen wird **nicht** geschrieben. Im Browser belegt: Der Rechner
  rechnet bei gesperrter IndexedDB (`2+3` = 5) und bei scheiterndem Schreiben (`7*6` = 42).

## Geänderte Bereiche

- `apps/web/src/tools/PdfSplit.tsx` – laufender Auftrag beim Verlassen ungültig machen (Leck behoben)
- `apps/web/src/tools/ToolErrorBoundary.tsx` (neu) – Fehlergrenze + `LoadFailureNotice`
- `apps/web/src/tool-load-recovery.ts` (neu) + `tool-load-recovery.test.ts` – Erkennung und
  Schleifensperre, 5 Tests
- `apps/web/src/App.tsx` – Fehlerweg der Werkzeugtexte, Fehlerwege für Katalogschlüssel und
  Suiten-Seite, Fehlergrenze um den Werkzeuginhalt
- `apps/web/src/CatalogSection.tsx`, `ToolNavigation.tsx` – sichtbarer Fehlerweg
- `apps/web/src/tools/calculator-frame.tsx` – Engine und Speicher getrennt, Schreibprüfung,
  Warnung im flüchtigen Betrieb
- `apps/web/src/tools/Aufmass.tsx`, `Inspection.tsx` – Zustand auswerten, warnen, nicht
  überschreiben
- `packages/tools/src/storage/indexedStore.ts` (neu) – Speicheradapter mit expliziten Zuständen
- `packages/tools/src/calculator/history.ts`, `calculator/aufmassStore.ts`,
  `craft/inspectionStore.ts` – Zustandsvertrag statt Wurf
- `packages/tools/package.json` – Unterpfad `./storage/indexedStore`
- `packages/i18n/src/common/{de,en,es}.ts` – 10 neue Texte (Lade- und Speicherfehler)
- `scripts/viewport-audit.mjs` – Leinwandrückfall, benannte Lücken
- `.github/workflows/quality.yml` – Job `browser` (windows-latest)
- Akte: `00-einstieg/vorgehen-qm-audit.md`, `01-stand/aktueller-stand.md`,
  `01-stand/offene-punkte.md`, 3 neue Protokolle, Nachtrag im PDF-Protokoll

## Entscheidungen und Annahmen

- **M4-005 wird mit benannter Grenze abgeschlossen** (Thomas): Wirkung belegt, nur die
  Zeitreihenfolge „A zuletzt fertig" unbelegt — der Grund ist gemessen (0,6 s für 1200 Seiten).
- **M4-006 erst nach dem Entwicklungsmodus-Lauf** (Thomas), nicht vorher abgeschlossen.
- **M2-009: Rückfall auf die Leinwandfarbe UND benannte Lücken** (Thomas). *Annahme:* Die Leinwand
  ist weiß; sie wird je Route als Rückfallzahl ausgewiesen, und auf allen 62 Routen ist diese Zahl
  **0** — die Annahme wird für das Produkt nie wirksam.
- **M4-004: Abweichung statt Ersatzbeleg.** Ein Retry-Knopf, der nichts bewirken kann, wäre eine
  Behauptung gewesen; die Karte verbietet zudem ein `?timestamp`-Anhängen an Importe.
- **M8-003: nach gescheitertem Lesen wird nicht geschrieben** — ein vorhandener Stand wird nicht
  mit dem Anfangszustand überschrieben (Karte: „nicht automatisch überschreiben").

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **695 Tests in 48 Dateien**, Exit 0; **0 Lint-Fehler** (109 Warnungen, bekannte Folgearbeit) |
| `npm run build` | Exit 0, Startbündel **149 481 B gzip** von 204 800 |
| `npm run catalog:generate` | Exit 0, Ausgabe unverändert (deterministisch) |
| `node --check` je Belegskript | Exit 0 |
| `work/m4-005-abnahme.cjs` | Abnahme M4-005/M4-006 neu gefahren, Exit 0 (1203/1200/3 → 1203/0) |
| `work/m4-006-unmount-laufend.cjs` | Leck vorher/nachher: offen **1200** → **0**, Exit 0 |
| `work/m4-006-unmount-fehler.cjs` | Verlassen aus dem Fehlerzustand: 0/0/0, keine Ausnahme |
| `work/m4-006-strictmode.cjs` | 5 Aufträge, Zähler je Lauf wie erwartet, Endstand 17/17/0 |
| `work/m4-004-abnahme.cjs` | 7 Prüfungen über den Fehler-Proxy, Exit 0, **0 unbehandelte Zusagen** |
| `work/modulimport-probe.cjs` | 3 Versuche, **1** Netzanfrage — Grenze belegt |
| `work/m8-003-abnahme.cjs` | 4 Fälle (gesperrtes localStorage, kaputter Inhalt, gesperrte IndexedDB, Schreibfehler), Exit 0 |
| `a11y:check` beide Schemata | 62 Routen × 2 Breiten, Exit 0, 0 Befunde, 0 Lücken |
| **Nicht ausgeführt** | Der CI-Job `browser` ist **nie gelaufen** (kein Push) |

## Offene Punkte und Risiken

- [ ] **Kein Retry im selben Dokument möglich** (gemessen). Weg, falls gewünscht: ein **benannter**,
  begrenzter Adresszusatz beim Import — verlangt eine eigene Adresskarte der Chunks, mit M4-004
  abzustimmen.
- [ ] **CI-Job `browser` nie gelaufen** — wird erst nach einem gewollten Push belegbar.
- [ ] **Nicht gemessen:** ob ein `QuotaExceededError` durch die IndexedDB-Transaktion als `quota`
  (statt `unavailable`) bei uns ankommt; die Warnung ist in beiden Fällen dieselbe, die Zuordnung
  ist über Tests abgesichert.
- [ ] **Dasselbe Objekt-URL-Muster in acht weiteren Werkzeugdateien** (Fund am Quelltext, **nicht
  gemessen**): `PdfToImages`, `ImageMetadata`, `ImageResize`, `ImageWatermark`, `IconGenerator`,
  `PdfInteractiveTools`, `PdfSecurityTools`, `PdfPlacementTools`.
- [ ] Der gemeinsame `useObjectUrls`-Hook ist nicht gebaut (laut Karte keine Abnahmebedingung).
- [ ] **Push** bleibt bei Thomas: **56 Commits vor `origin/main`**, `main` ist der
  Produktionsbranch.
- [ ] M8-002-Grenzen (Warmbesuch, Localewechsel, SW-Versionswechsel) als Folgearbeit.
- [ ] Handarbeitspunkte des Barrierefreiheits-Prüfers (Vorleserausgabe, Tastatur, 400 % Zoom,
  Fokusreihenfolge, reduzierte Bewegung).
- [ ] Die 109 Lint-Warnungen (größte Gruppe `no-misused-promises`) als eigene Folgearbeit.

## Empfohlener nächster Schritt

1. **R5 angehen** (Barrierefreiheit und Designsystem, P1, 6 Karten offen): M2-006, M2-007, M2-008,
   M7-002 … M7-006. M7-001 ist bereits behoben.
2. Danach **R6** (Spanisch/Unicode/Formate) — dort sind M3-007 erledigt und M3-001 laut README
   überholt („prüfen").
3. **Vor R5 den Push entscheiden:** 56 Commits liegen lokal; `M1-003` und der neue Browserjob
   werden erst mit einem echten Lauf belegbar.

## Git

- Commits dieser Sitzung: **`30d949a`** (Leck im PDF-Teiler), **`bb0a607`**, **`6f9b675`**,
  **`4c9ddd4`** (Kontrastprüfer + CI-Job), **`57753dc`**, **`ec226ea`** (Ladefehler-Fehlerwege),
  **`8308acd`**, **`bd95592`** (Speicherfehlervertrag), **`3eeef74`**, dazu dieser Akten-Commit.
- Arbeitsbaum: sauber bis auf die drei bewusst unversionierten Einträge
  (`test-assets/m4-005-*.pdf`, fremde Datei `uebergabe/03-konzepte/2026-10-06-tooltip-und-kontexthilfe.md`).
- **Nichts gepusht.**
  *(Nachtrag 2026-10-07, nach dem Akten-Commit: Damit liegt `main` **57 Commits** vor
  `origin/main`.)*
