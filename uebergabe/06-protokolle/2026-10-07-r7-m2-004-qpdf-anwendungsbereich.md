# R7 / M2-004 — QPDF-ADR beschränkt die Engine fälschlich auf M5: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „QPDF-Verwendung für Reparatur sachlich legitim, nur der verengte
ADR-Wortlaut ist falsch." … „ADR-Anwendungsbereich auf tatsächlich genutzte Sicherheits- **UND**
Reparaturfunktionen erweitern, mit exakten Aufrufern und Lazy-Load-Grenze."
**Status:** **erledigt** — Anwendungsbereich datiert richtiggestellt, Aufrufer und Ladegrenze belegt.

## Was der Befund war

ADR 0002 sagt: „Die Engine wird **ausschließlich auf M5-Routen** geladen." Tatsächlich bedient
dieselbe Engine auch die **Reparatur**, die zur M8-Werkzeuggruppe gehört.

## Bestandsaufnahme (gemessen am Quelltext)

| Fachaktion | Funktion | Aufrufer |
|---|---|---|
| schützen | `protectPdf` (`pdf/m5.ts`) | `pdf-security` |
| entsperren | `unlockPdf` (`pdf/m5.ts`) | `pdf-security` |
| komprimieren | `compressPdf` (`pdf/m5.ts`) | `pdf-compress` |
| **reparieren** | `repairPdfWithQpdf` (`pdf/m5.ts:100`) | `pdf/m8.ts:3` (Import), `:46` (Aufruf) → `pdf-repair` |

**Eine** Importstelle der Engine: `packages/tools/src/pdf/m5.ts:1`
(`@neslinesli93/qpdf-wasm ^0.3.0`). Kein Reexport über `packages/tools/src/index.ts`; die
Werkzeugeinstiege sind eigene Unterpfade in `packages/tools/package.json` (`./pdf/m5`, `./pdf/m8`).

## Umsetzung

- **ADR 0002:** datierter Nachtrag mit der Tabelle oben, der Ladegrenze und dem Hinweis, dass
  Herkunft/Lizenz/Versionsbindung **nicht hier**, sondern im Lizenzregister und in R1/R3 geregelt
  sind (keine kopierten Regeln). Ursprungstext unverändert.
- **Index:** Eintrag zu ADR 0002 um den erweiterten Anwendungsbereich ergänzt.
- **Nicht getan (Kartengrenze):** keine zusätzliche QPDF-Engine gebaut, um die alte M5-Grenze
  herzustellen.

## Abnahme

| Abnahmepunkt (Karte) | Ergebnis |
|---|---|
| Importkarte weist m5-/m8-Pfade aus | ✓ Tabelle im ADR; Importsuche bestätigt `m8.ts:3 → ./m5` |
| Startseite lädt QPDF nicht | ✓ Browser: 0 qpdf-Dateien auf `/`; zusätzlich harte Regel `staticBudget: 0` im Bauprüfer |
| Beide Toolpfade laufen mit identischer Engineversion | ✓ Browser: Reparatur **und** Kompression holen **dieselbe** Datei `qpdf-C3Giu3T4.wasm` |
| Dokumentation und tatsächliche Aufrufargumente passen | ✓ Funktionen und Argumentlisten aus `m5.ts` gelesen (Schützen/Entsperren/Komprimieren/Reparieren) |

## Beleg am ausgelieferten Bau (kopflose Edge über CDP, je Fall frischer Browser)

| Fall | Route | qpdf-WASM | Ergebnis |
|---|---|---|---|
| A | `/` | **keine** | Startseite lädt die Engine nicht ✓ |
| B | `/tools/pdf-repair` | `qpdf-C3Giu3T4.wasm` | „Prüfen und reparieren" → Speicherangebot sichtbar ✓ |
| C | `/tools/pdf-compress` | `qpdf-C3Giu3T4.wasm` | „PDF optimieren" → Hinweis + Speicherangebot ✓ |

Gleiche Datei in B und C: **true**. 0 Seitenfehler. Belege in `screenshots/2026-10-07-r7-u7/`.

## Mutationsgegenprobe

| # | Mutation | Meldung |
|---|---|---|
| L | Indexeintrag zu 0002 gelöscht | `0002-qpdf-wasm-fuer-pdf-sicherheit.md: fehlt im Index` |

Wiederherstellung per Hash geprüft. **Zusätzlich ehrlich:** ein erster Mutationsversuch (Verweis in
ADR 0002 soll ins Leere zeigen) **griff nicht** — der Verweis steht als Code-Span
(`` `../06-protokolle/…` ``), nicht als Markdown-Link, und der Prüfer sieht nur `](…)`. Das ist die
bekannte Grenze des Gaters, kein Produktfehler; der ungültige Versuch wird hier genannt, statt ihn
als Beleg auszugeben.

## Prüfkette

`npm run adr:check` grün · `npm run build` unverändert (Exit 0, aus M2-003). Diese Karte ändert
**keinen Programmcode** — nur ein Akten-Commit. Nichts gepusht.

## Grenzen

- Verweise auf Protokolle/Quellen stehen im Projekt als Code-Spans; der Gate prüft sie **nicht**.
- Die Aufrufargumente wurden gelesen, nicht durch einen Lauf gegen die Engine nachgemessen; der
  Browserbeleg zeigt, dass beide Pfade die Engine laden und ein Ergebnis liefern.
