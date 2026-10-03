# ERLEDIGT: Startseite lud 5 MB mit, die sie nicht brauchte

> Behoben am 2026-10-03. Der allgemeine Export wurde von den PDF-Engines getrennt, die manuelle
> Bündelung entfernt und `bundle:check` als verbindliche Produktionsprüfung ergänzt. PDF-Routen und
> ihre Engines sind außerdem vom Vorab-Cache ausgenommen. Historische Diagnose folgt.

**Datum:** 2026-10-03
**Gemeldet von:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Adressat:** ChatGPT (Rolle: Webseite und Gesamtprojekt)
**Status:** Diagnose abgeschlossen, Belege gemessen — **es wurde nichts geändert**
**Dringlichkeit:** hoch (erster Eindruck der Seite, wirkt auf jeden Besucher)

---

## In einem Satz

Wer die Startseite von CommieTools öffnet, lädt **11,4 MB roh (rund 5 MB komprimiert)** mit,
davon eine 10,4 MB große WASM-Datei — obwohl er kein einziges PDF-Werkzeug geöffnet hat. Nötig
wären 153 kB komprimiert.

## Der Befund

Gemessen mit frischem Browserprofil, Startseite geladen, **kein Werkzeug angeklickt**:

| Datei | Größe roh | Übertragung komprimiert |
|---|---:|---:|
| `index-*.js` (Hauptbundle) | 488.729 B | 148.055 B |
| `index-*.css` | 24.759 B | 5.137 B |
| **`pdf-lib-*.js`** | **429.198 B** | ~178 kB |
| `mupdf-*.js` | 88.923 B | ~30 kB |
| **`mupdf-wasm-*.wasm`** | **10.409.826 B** | **4.743.120 B** |
| `workbox-window.prod.es5-*.js` | 5.748 B | ~2 kB |
| `__vite-browser-external-*.js` | 130 B | — |
| **Summe** | **11.447.313 B** | **~5,1 MB** |

Zum Vergleich: Alles, was zum Anzeigen der Startseite wirklich nötig ist, sind `index-*.js` und
das Stylesheet — **153 kB komprimiert**. Der Rest ist Ballast, der in diesem Moment zu null
Prozent gebraucht wird.

## Die Ursache

`packages/tools/src/index.ts` reexportiert die PDF-Logik:

```ts
export { … } from './pdf/core'   // Zeile ~32: enthält einen statischen pdf-lib-Import
export { … } from './pdf/m4'     // Zeile 65: enthält einen statischen mupdf-Import
export { … } from './pdf/m5'     // Zeile 76
```

- `packages/tools/src/pdf/core.ts`, Zeile 1:
  `import { degrees, EncryptedPDFError, PDFDocument, rgb, StandardFonts } from 'pdf-lib'`
- `packages/tools/src/pdf/m4.ts`, Zeile 1: `import * as mupdf from 'mupdf'`

Die Webanwendung importiert `@commietools/tools` **statisch** (Katalog, Suche, Formatlisten
brauchen dieses Paket auf der Startseite). Damit ist der komplette PDF-Apparat Teil des
Startmodulgraphen — nach ES-Modul-Regeln lädt der Browser alles mit, was über einen statischen
`import` erreichbar ist, **bevor** die Seite benutzbar ist.

### Warum die Trennung in eigene Chunks das nicht verhindert

`apps/web/vite.config.ts` legt die Engines über `manualChunks` in eigene Dateien
(`pdfjs`, `pdf-lib`, `mupdf`, `qpdf`). Das bestimmt nur, **in welcher Datei** der Code landet,
nicht **ob** er beim Start geladen wird: Ein statischer Import im Hauptbundle zieht den Chunk
beim Laden mit. Beispiel aus dem gebauten Hauptbundle:

```
import{g as Wv,a as $v}from"./pdf-lib-Dm0ksYTo.js"
```

### Seit wann

- **`pdf-lib` (429 kB):** Altbestand. Bereits in Commit `a45f950` (PDF-Grundlagen) statisch in
  `pdf/core.ts` und über den Hauptindex reexportiert. Das waren ~178 kB komprimiert — unschön,
  aber über längere Zeit unbemerkt geblieben.
- **`mupdf` + WASM (10,4 MB):** Neu, entstanden mit der Arbeit an PDF-Formularen/Annotationen
  (M4) und den aktuellen M5-Arbeiten. Das nimmt dem Startvorgang seine Tragfähigkeit.

## Was bereits richtig gebaut ist (nicht anfassen)

- **pdf.js lädt korrekt nur bei Bedarf:** `apps/web/src/tools/pdfUi.tsx` holt es dynamisch
  (`await import('pdfjs-dist')`); der Worker kommt über `?url` und wird mitgeladen, wenn das
  Werkzeug es braucht. Genau so soll es sein.
- **Die Engines sind aus dem Vorab-Cache ausgenommen:** `globIgnores` in `vite.config.ts` enthält
  `pdfjs-*`, `pdf-lib-*`, `mupdf-*.js`, `mupdf-*.wasm`, `qpdf-*`, `pdf.worker*`. Sie landen also
  nicht im Offline-Cache.
- **Die Werkzeugoberflächen der PDF-Suite sind nachgeladen** (`lazy()` in `App.tsx`).

## Vorgeschlagene Lösung (nicht umgesetzt)

**Kleinster Eingriff mit der größten Wirkung — und der erste Schritt:**

Die Reexporte `./pdf/m4` und `./pdf/m5` aus `packages/tools/src/index.ts` entfernen und die
betreffenden PDF-Werkzeuge direkt (und nachgeladen) aus den Modulen importieren. Das nimmt
**10,4 MB** vom Startvorgang, ohne eine einzige Funktion zu ändern.

**Zweiter Schritt, danach zu entscheiden:**

`pdf/core.ts` aufteilen: die reinen Rechenfunktionen (`inspectPdf`, `parsePageSelection`, …)
ohne `pdf-lib` in ein eigenes Modul; alles, was `pdf-lib` zum Schreiben braucht, in ein zweites,
das nur das jeweilige Werkzeug lädt. Damit fällt der Rest vom Startvorgang ab.

**Alternative (größerer Umbau):** `PDFDocument` in den PDF-Komponenten dynamisch holen
(`const { PDFDocument } = await import('pdf-lib')`). Sauber, aber jede aufrufende Stelle muss
angepasst werden.

### Was **nicht** die Lösung ist

- `build.chunkSizeWarningLimit` erhöhen — versteckt nur die Warnung, das Laden bleibt.
- Die Werkzeugregister-Datei auszulagern — spart 8,5 kB komprimiert, hier völlig nebensächlich.
- Die Bildwerkzeuge nachzuladen — spart 31 kB komprimiert, ebenfalls klein dagegen. (Sinnvoll,
  aber nicht dringend.)

### Erwartetes Ergebnis

Startvorgang bei ~153 kB komprimiert statt ~5 MB. Der erste Eindruck der Seite hängt daran.

## Wie man es nachprüft

**Schnelltest ohne Browser** (findet die Ursache in Sekunden):

```bash
# 1. Ist die Engine am Hauptbundle festgenagelt?
grep -o "pdf-lib-[A-Za-z0-9_-]*\.js" apps/web/dist/assets/index-*.js   # Treffer = Problem
grep -o "mupdf-[A-Za-z0-9_-]*\.js"   apps/web/dist/assets/index-*.js   # Treffer = Problem

# 2. Über welche Kette hängt sie dran?
grep -n "pdf/m4\|pdf/m5\|pdf/core" packages/tools/src/index.ts
grep -n "pdf-lib\|mupdf" packages/tools/src/pdf/core.ts packages/tools/src/pdf/m4.ts | head
```

**Vollständige Prüfung im Browser:**

1. `npm run build` im Projekt.
2. `apps/web/dist` statisch ausliefern (`npx vite preview` oder ein beliebiger statischer Server).
3. Frisches Browserprofil (kein Vorab-Cache), Startseite öffnen, DevTools → Netzwerk.
4. Erwartet nach der Korrektur: **nur** `index-*.js`, `index-*.css`, das Manifest und kleine
   Hilfsdateien. Kein `pdf-lib`, kein `mupdf`, kein `mupdf-wasm`.

Nach der Korrektur zusätzlich gegenprüfen, dass die PDF-Werkzeuge weiterhin arbeiten: ein PDF
mit einem PDF-Werkzeug öffnen (Vorschau, Zusammenführen) und prüfen, dass die Engines **dann**
tatsächlich geladen werden.

## Wichtige Randbedingungen für die Umsetzung

- **Es liegt unfertige Parallelarbeit im Arbeitsbaum** (`packages/tools/src/index.ts`, `pdf/m4.ts`,
  `pdf/m5.ts`, `App.tsx`, neue Dateien unter `pdf/m5/` und `PdfSecurityTools.tsx`). Die Korrektur
  darf **nicht** gleichzeitig mit laufender Arbeit an denselben Dateien erfolgen, sonst
  überschreiben sich die Bearbeitungen.
- **Prüfpflichten bleiben bestehen:** `npm run check` (Lizenz, Katalog, Typen, Tests),
  `npm run build`, danach der Browserdurchlauf. Nach Änderungen an Manifesten zuerst
  `npm run catalog:generate`.
- **Keine neue Abhängigkeit** ist für diese Korrektur nötig.
- Nach dem Entfernen der Reexporte kann `apps/web/src/pdf-tools.test.ts` betroffen sein, weil er
  Funktionen über `@commietools/tools` bezieht. Import anpassen, Tests unverändert lassen.

## Rollenabgrenzung

- **Faber:** Werkzeuge erstellen, prüfen, gegenprüfen. Hat diesen Befund gemessen und belegt.
  **Am Code wurde nichts geändert.**
- **ChatGPT:** Webseite und Gesamtprojekt, damit auch `vite.config.ts`, `App.tsx`, die
  Bauweise der Paket-Exporte. Die Umsetzung liegt dort.
- Soll Faber die Korrektur ausführen, braucht es ein ausdrückliches Go von Thomas.

## Der Befund widerspricht einer bereits notierten eigenen Regel

In `uebergabe/01-stand/offene-punkte.md` steht seit M4 als Vorgabe für WASM-Engines:

> „großes WASM nur nachgeladen, versionierter Laufzeitcache, vollständiges Lizenzregister und
> klarer Nutzerhinweis"

Der Vorab-Cache-Teil davon ist umgesetzt (Ausnahmeliste `globIgnores`) und der Nutzerhinweis
existiert. Das **Nachladen** ist jedoch nicht eingehalten: Die WASM-Datei wird beim Aufruf der
Startseite mitgeladen, weil der Import statisch über `packages/tools/src/index.ts` hängt. Die
Regel ist also nicht vergessen worden, sondern ihre Umsetzung greift an dieser Stelle nicht —
das ist der eigentliche Punkt der Korrektur.

## Nicht geprüft / offen

- Nicht gemessen: wie sich die Auslieferung über Cloudflare Pages verhält (Brotli/Kompression
  für WASM). Über die Leitung dürfte die WASM-Datei dort kleiner ankommen als die hier
  gemessenen 4,74 MB — am Problem selbst ändert das nichts.
- Nicht gemessen: Ladezeit auf einem echten Mobilgerät. Eine Größenordnung von 5 MB legt nahe,
  dass sie deutlich spürbar ist.
- Nicht betrachtet: ob die ebenfalls neue `qpdf`-Bindung (`@neslinesli93/qpdf-wasm`, im
  Arbeitsbaum als eigener 42,7 kB großer Chunk vorhanden) denselben Fehler hat. Im
  Startmitschnitt tauchte sie **nicht** auf — das ist ein Hinweis, aber kein Beweis, weil der
  Messstand möglicherweise älter war als dieser Teil der Arbeit. Bei der Gelegenheit mitprüfen
  (gleicher Schnelltest weiter oben).
