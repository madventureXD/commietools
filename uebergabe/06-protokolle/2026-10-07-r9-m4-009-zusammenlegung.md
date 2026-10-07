# R8-Stufe R9 · Karte M4-009 — gemeinsame technische Verantwortlichkeiten

Datum: 2026-10-07 · Stufe: R9 (gemeinsame Bausteine und Routing) · Karte: **M4-009**
„Gemeinsame technische Verantwortlichkeiten sind mehrfach implementiert"

## Auftrag im Wortlaut (Auszug aus `QM/70-reparaturempfehlungen/R9.md`)

> **M4-009 Gemeinsame technische Verantwortlichkeiten sind mehrfach implementiert** (Mittel) —
> dieselbe Aufgabe wie hier steckt in mehreren Tool-Dateien. **Eingriffsstellen** (Messung 2026-10-05,
> Zeilen vor der Dienstschicht): `formatBytes` (IconGenerator:34, ImageResize:19, ImageWatermark:48),
> `function` (aufmass.ts:78, commercial.ts:36), `useDownload` (pdfUi.tsx:76) und
> `function usePdfDownload` (PdfInteractiveTools.tsx:25, PdfPlacementTools.tsx:34), gemeinsamer
> `loadToolSearchIndex` (CatalogSection.tsx, ToolNavigation.tsx). **Nicht tun:** ein pauschales
> `utils.ts` …; fachlich unterschiedliche Rundungsregeln zu vereinen. **Zuständigkeit:** reine
> Fachberechnung → `packages/tools`; Texte/Locale → `i18n`; Browserlebensdauer → `apps/web`;
> generische UI → `packages/ui`. **Abnahme:** Verhaltensvergleich aller migrierten Aufrufer,
> Fehler-/Cleanupfälle aus R3 und Formatfälle aus R6. Importgraph bleibt azyklisch, keine neue
> eager Engine-/Allsprachen-Abhängigkeit.

## 1. Bestandsaufnahme (gemessen am Live-Stand, nicht geschätzt)

| Verantwortlichkeit | vorher | Vertrag |
|---|---|---|
| `formatBytes` | **vier** lokale Kopien: IconGenerator:34, ImageMetadata:37, ImageResize:19, ImageWatermark:48 | drei wörtlich gleich („kB", 1 Nachkommastelle), eine abweichend (ab 1 MiB zwei Nachkommastellen) — **und alle vier wichen von der gemeinsamen, getesteten Form aus R6 ab** (`format-context.test.ts` prüft „4,58 MB") |
| `divRound` | **zwei** wörtlich gleiche Kopien: `aufmass.ts` und `commercial.ts` | identisch: kaufmännische Rundung, halbe auf, vorzeichenunabhängig |
| Ergebnis-Adresse (eine Ausgabe) | **vier** Umsetzungen: `useDownload` (pdfUi), `usePdfDownload` (PdfInteractiveTools), `usePdfResult` (PdfPlacementTools), `useResult` (PdfSecurityTools) | gleiche Lebensdauer (alte Adresse beim Wechsel freigeben, beim Verlassen freigeben), zwei Formen (deklarativ/imperativ) |
| Ladezustand der Werkzeugsuche | **fünf** Stellen: CatalogSection, ToolNavigation, `App.tsx` dreimal | zwei Verträge: mit `bereit/gescheitert` (zwei Stellen), nur Index (drei Stellen) |
| `renderTextPng`, `toolSearchIndex`-Verbrauch in `App.tsx` (abgeleitete Katalogschlüssel) | — | **verschiedener Vertrag** — bleibt stehen (siehe 3.) |

Zusätzlich gemessen: die Zuordnung der Werkzeuge (Karte M4-010) hängt an einer Kette aus **60**
Vergleichen in `App.tsx:176–221` mit `<PdfRedactTool/>` als Rückfall — dieses Ergebnis gehört zur
zweiten Karte und wird dort behandelt.

## 2. Eingriff (kleinstmöglich, je Verantwortlichkeit eine Stelle)

| # | Was | Wo jetzt | Beleg |
|---|---|---|---|
| 1 | `divRound` | `packages/tools/src/calculator/rounding.ts`, relativ eingebunden von beiden Aufrufern | `packages/tools/package.json` führt den Unterpfad `./calculator/rounding` (der Haupteingang bleibt unberührt) |
| 2 | `formatBytes` (Anzeige) | gemeinsame Form aus `@commietools/tools`; die vier Aufrufer rufen sie mit `anzeigeKontext(locale)` | `apps/web/src/consolidation.test.ts` |
| 3 | Ergebnis-Adresse (eine Ausgabe) | `apps/web/src/tools/resultUrl.ts` (`useResultUrl`); `useDownload` baut darauf auf | ebd. |
| 4 | Ladezustand der Werkzeugsuche | `apps/web/src/useToolSearchIndex.ts` | ebd. |

**Sichtbare Folge (beabsichtigt, benannt):** die vier Bildwerkzeuge zeigen Größen jetzt in der
gemeinsamen Form — „KB" statt „kB", ab 1 MiB **zwei** Nachkommastellen. Das ist die Angleichung an
die geprüfte Form aus R6, nicht eine neue Regel.

## 3. Nicht zusammengelegt — mit Begründung (Karte: „nur gleiche Verträge bündeln")

- **`PdfSplit`** erzeugt Adressen für eine **Liste** von Ausgaben (eine je Seitengruppe) — anderer
  Vertrag.
- **`PdfSecurityTools.formatBytes`** ist eine zwei Zeilen lange Anpassung an die gemeinsame Funktion
  für den Fall **ohne Sprachzusage** in der Komponente (die dokumentierte Ausnahme in
  `scripts/format-audit.mjs`) — keine zweite Umsetzung; sie bleibt und ist im Wächter als Ausnahme
  benannt.
- **Der abgeleitete Katalogschlüssel-Effekt in `App.tsx`** lädt den Index zwar selbst, leitet daraus
  aber die vier Schlüssel **eines** Werkzeugs ab und hat einen eigenen Fehlerweg (Karte M4-004).
  Ihn in den gemeinsamen Haken zu ziehen würde diesen Fehlerweg entfernen.

## 4. Prüfkette (ausgeführt, nicht beschrieben)

- `npm run check` — **Exit 0** · 53 Prüfdateien, **727 Tests** · 0 Lint-Fehler, 110 Hinweise
  (Protokoll: `tmp/check-u1e.log`, Zahlen nach der Rundungsprüfung neu gemessen)
- `npm run build` — **Exit 0** · Eingang **149 863 B gzip** (vorher 150 082 B)
- Belegskripte: `tmp/m4-009-beleg.cjs` (Browser), `tmp/m4-009-mutationen.mjs` (Gegenproben)

## 5. Beleg gegen den ausgelieferten Bau (`tmp/m4-009-beleg.cjs`, je Fall frischer Browser)

| Fall | Gegenstand | Messung | Ergebnis |
|---|---|---|---|
| A | Anzeigeformat (Formatfälle aus R6) | Bild über 1 MiB: Seite zeigt **„2,75 MB"**; Bild darunter: **„10,7 KB"** — jeweils genau die gemeinsame Form, kein „kB" mehr | ok |
| B | Suchladezustand (gemeinsamer Haken) | Katalogsuche „beton": **„2 Werkzeuge gefunden"**, 2 Karten; Menüsuche: 4 Treffer | ok |
| C | Ergebnis-Adresse (Fehler-/Cleanupfall aus R3) | PDF komprimieren: nach dem Lauf erscheint **„Speichern unter …"** (Adresse gesetzt), keine Fehlermeldung | ok |

Ausgabe (Text) und Bildschirmabzüge: `uebergabe/06-protokolle/screenshots/2026-10-07-r9-u1/`.

**Drei Fehlschläge auf dem Weg waren Prüfmittel-Fehler, nicht Produktfehler** — als solche benannt:
1. Die Katalogsuche zählte 0 Treffer, weil die Sonde die **erste** `input[type=search]` der Seite traf
   (die des Kopfmenüs) statt die des Katalogs, und weil Treffer als Knopf, nicht als Verweis gerendert
   werden.
2. Das Dateifeld von PDF-Werkzeugen blieb leer bei `DOM.setFileInputFiles` (`belegt: [0]`); Ursache
   ist der Neuaufbau des Feldes beim Zustandswechsel. Die Datei wird jetzt seitennah über
   `File`/`DataTransfer` eingelegt.
3. Der Klick auf „Werkzeug starten" traf den **Menüeintrag** statt der Werkzeugtaste; der Klick ist
   jetzt auf `article.tool-shell` begrenzt.

## 6. Mutationsgegenproben (`tmp/m4-009-mutationen.mjs`)

| Nr. | Mutation | Belegzeile | Ergebnis |
|---|---|---|---|
| M1 | `divRound` rundet einen halben Rest **ab** | `AssertionError` in `rounding.test.ts` | GRIFF (nach Prüfmittel-Nachbesserung) |
| M2 | gemeinsame `formatBytes`: MB mit **einer** Nachkommastelle | `AssertionError: expected '4,6 MB' to be '4,58 MB'` | GRIFF |
| M3 | eine Kopie von `formatBytes` wiedereingebaut und benutzt | `AssertionError: expected [ Array(1) ] to deeply equal []` | GRIFF |

**M1 schlug im ersten Anlauf nicht an.** Nach der Regel wurde zuerst das **Prüfmittel** verdächtigt,
und die Messung bestätigte es: `divRound` war von **keiner** Prüfung direkt gefasst — die
Rechner-Prüfungen treffen keinen halben Rest. Die Lücke ist mit `apps/web/src/rounding.test.ts`
geschlossen (halbe Reste aufwärts, Vorzeichenunabhängigkeit, Nenner 0); danach griff M1. Der
Produktcode war die ganze Zeit unverändert richtig.

## 7. Produktbefunde außerhalb des Kartenwortlauts

- **Fünf** Suchladezustände statt der zwei genannten (drei weitere in `App.tsx`) — mitbehoben, soweit
  der Vertrag gleich war.
- **Vier** `formatBytes`-Kopien statt der drei genannten (`ImageMetadata` zusätzlich), und alle vier
  wichen von der gemeinsamen Form ab — mitbehoben.
- **Vier** Ergebnis-URL-Umsetzungen statt der zwei genannten — drei mitbehoben (`PdfSplit` als
  anderer Vertrag benannt).
- Die Karte nennt `PdfPlacementTools.tsx:34` als `usePdfDownload`-Kopie; dort stand tatsächlich
  `renderTextPng` (anderes Thema) und die Kopie an anderer Stelle derselben Datei.

## 8. Offene Punkte

- **OP-045** (aus R3, gemeinsamer Haken für Ergebnis-Adressen) ist mit dieser Karte **erledigt**;
  neuer Stand wird in der Akte nachgezogen.
- Der Wächter `consolidation.test.ts` findet die Kopien im **Quelltext**. Er hält damit die
  Zusammenlegung, prüft aber kein Verhalten — die Verhaltensseite decken die Fachprüfungen und der
  Browserbeleg ab. Diese Grenze ist im Test benannt.
