import { describe, expect, it } from 'vitest'

/**
 * **Zusammenlegung bleibt zusammengelegt** (QM-Karte M4-009).
 *
 * Die Karte verlangt, gleiche technische Verantwortlichkeiten zu bündeln und die **veraltete Kopie
 * zu entfernen**. Ein Bündeln ohne Wächter verrottet: die nächste Welle kopiert denselben Helfer
 * wieder. Diese Prüfung hält den erreichten Stand fest — sie sucht die Kopien im **Quelltext**,
 * statt Verhalten zu messen, weil genau das der Gegenstand ist.
 *
 * Gelesen wird über `import.meta.glob` (Rohinhalt, schon zur Übersetzungszeit eingesammelt): kein
 * Dateisystem, keine Node-Typen nötig — die Web-Prüfungen laufen sonst ohne `@types/node`.
 *
 * Sind neue Ausnahmen nötig, gehören sie **hier** mit Grund und Datum hinein — nicht still in eine
 * Tool-Datei.
 */
const web = import.meta.glob('./**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
const kern = import.meta.glob('../../../packages/tools/src/**/*.ts', { query: '?raw', import: 'default', eager: true })

const webQuellen = Object.entries(web).filter(([pfad]) => !pfad.endsWith('.test.ts'))
const kernQuellen = Object.entries(kern).filter(([pfad]) => !pfad.endsWith('.test.ts'))

/** Pfadangaben im Vergleich immer ab `apps/web/src/` bzw. `packages/tools/src/`. */
const kurz = (eintrag: readonly [string, unknown]): string => String(eintrag[0]).replace(/^\.\//u, 'apps/web/src/')

const findeWeb = (muster: RegExp): string[] =>
  webQuellen.filter(([, inhalt]) => muster.test(String(inhalt))).map(kurz)
const findeKern = (muster: RegExp): string[] =>
  kernQuellen.filter(([, inhalt]) => muster.test(String(inhalt))).map(([pfad]) => String(pfad).replace(/^\.\.\/\.\.\/\.\.\//u, ''))

describe('M4-009: Kopien bleiben entfernt', () => {
  it('formatBytes wird nur einmal umgesetzt (gemeinsam in @commietools/tools)', () => {
    // Begründete Ausnahme: `PdfSecurityTools.tsx` hat **keine** Sprachzusage in der Komponente und
    // bildet den Kontext aus Dokument und Browser (die eine Ausnahme in `scripts/format-audit.mjs`).
    // Ihr lokaler Name ist eine 2-Zeilen-Anpassung an die gemeinsame Funktion, keine zweite Umsetzung.
    const ausnahmen = ['PdfSecurityTools.tsx']
    const kopien = webQuellen
      .filter(([pfad]) => !ausnahmen.some((name) => pfad.endsWith(name)))
      .filter(([, inhalt]) => /function formatBytes\(/u.test(String(inhalt)))
      .map(kurz)
    expect(kopien).toEqual([])
  })

  it('divRound wird nur einmal umgesetzt (gemeinsam im Rechner-Kern)', () => {
    expect(findeKern(/function divRound\(/u)).toEqual(['packages/tools/src/calculator/rounding.ts'])
  })

  it('der Ladezustand der Werkzeugsuche steht an einer Stelle', () => {
    // Zweite Fundstelle ist begründet: der Effekt in `App.tsx` leitet aus dem Index die vier
    // Katalogschlüssel **eines** Werkzeugs ab und hat dafür einen eigenen Fehlerweg
    // (Karte M4-004). Ihn in den gemeinsamen Haken zu ziehen würde diesen Fehlerweg entfernen —
    // „nur gleiche Verträge bündeln". Er lädt deshalb weiterhin selbst, und zwar genau einmal.
    expect(findeWeb(/loadToolSearchIndex\(/u)).toEqual([
      'apps/web/src/App.tsx',
      'apps/web/src/useToolSearchIndex.ts',
    ])
    const app = String(webQuellen.find(([pfad]) => pfad === './App.tsx')?.[1] ?? '')
    expect(app.match(/loadToolSearchIndex\(/gu)).toHaveLength(1)
  })

  it('die Ergebnis-Adresse für eine Ausgabe entsteht an einer Stelle', () => {
    // Verbleibende Fundstelle ist begründet: `PdfSplit` erzeugt Adressen für eine **Liste** von
    // Ausgaben (eine je Seitengruppe) — anderer Vertrag, kein Duplikat.
    expect(findeWeb(/URL\.createObjectURL\(new Blob\(\[new Uint8Array\(bytes\)\], \{ type: 'application\/pdf' \}\)\)/u))
      .toEqual(['apps/web/src/tools/PdfSplit.tsx'])
  })
})
