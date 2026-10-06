import { describe, expect, it } from 'vitest'
import { loadCommonToolTexts, loadToolTexts } from '@commietools/tools/text-loaders'
import { loadToolSearchIndex, toolManifests } from '@commietools/tools'
import { loadInterfaceMessages, supportedLocales, type Locale } from '@commietools/i18n'

/**
 * Sprachvertrag über **alle** Werkzeuge und Sprachen (Karte M3-009, mit Karte M3-001).
 *
 * **Was vorher fehlte:** Geprüft war die Schlüsselparität an einzelnen Stellen; Platzhalter,
 * leere Texte, Interpolationssyntax und Wohlgeformtheit waren nicht abgesichert. Genau dort lag
 * ein echter Fehler: In `pdf-organize`, `pdf-split` und `pdf-to-images` stand `{número}`, während
 * der Code nur `{number}` ersetzt — spanische Nutzer sahen den Platzhalter wörtlich.
 *
 * **Registrygesteuert** heißt: Die Schleife läuft über `supportedLocales` und `toolManifests`, nicht
 * über fest eingetragene Namen. Ein neues Werkzeug oder eine neue Sprache ist automatisch erfasst.
 *
 * Ein Fremdwort in den Suchbegriffen ist **kein** Fehler — Suchsynonyme sind eigene Sprache und
 * werden hier deshalb nur auf Vorhandensein, nicht auf Reinheit geprüft.
 */

/** Bezugssprache: die Fassung, an der gemessen wird. */
const REFERENZ = 'de'
const SPRACHEN: readonly Locale[] = supportedLocales

/** Platzhalter `{name}` samt Häufigkeit — Reihenfolge ist kein Merkmal. */
function platzhalter(text: string): string[] {
  return (text.match(/\{[^}\s]+\}/gu) ?? []).slice().sort()
}

/** Zeigt auf unvollständige Klammern: `{` ohne `}`, `}` ohne `{`. */
function klammerfehler(text: string): boolean {
  return (text.match(/\{/gu) ?? []).length !== (text.match(/\}/gu) ?? []).length
}

describe('Sprachvertrag: Werkzeugtexte über alle Sprachen (M3-009)', () => {
  it('hat dieselben Schlüssel wie die Bezugssprache und keine leeren Texte', async () => {
    const bezug = new Map<string, string>()
    for (const tool of toolManifests) {
      const texte = await loadToolTexts(REFERENZ, tool.id)
      for (const [schluessel, wert] of Object.entries(texte[REFERENZ] ?? {})) bezug.set(`${tool.id}/${schluessel}`, wert)
    }
    expect(bezug.size, 'Bezugssprache liefert keine Werkzeugtexte').toBeGreaterThan(200)

    for (const sprache of SPRACHEN) {
      const fehlend: string[] = []
      const leer: string[] = []
      for (const tool of toolManifests) {
        const texte = await loadToolTexts(sprache, tool.id)
        const eigen = texte[sprache] ?? {}
        for (const [schluessel, wert] of Object.entries(eigen)) {
          if (!bezug.has(`${tool.id}/${schluessel}`)) fehlend.push(`${tool.id}/${schluessel}`)
          if (typeof wert !== 'string' || !wert.trim()) leer.push(`${tool.id}/${schluessel}`)
        }
      }
      expect(fehlend, `${sprache}: Schlüssel ohne Entsprechung in ${REFERENZ}`).toEqual([])
      expect(leer, `${sprache}: leere Texte`).toEqual([])
    }
  })

  it('führt in jeder Sprache dieselben Platzhalter wie die Bezugssprache', async () => {
    const abweichungen: string[] = []
    for (const tool of toolManifests) {
      const bezug = (await loadToolTexts(REFERENZ, tool.id))[REFERENZ] ?? {}
      for (const sprache of SPRACHEN) {
        if (sprache === REFERENZ) continue
        const eigen = (await loadToolTexts(sprache, tool.id))[sprache] ?? {}
        for (const [schluessel, wert] of Object.entries(bezug)) {
          const andere = eigen[schluessel]
          if (typeof andere !== 'string') continue
          const erwartet = platzhalter(wert)
          const gefunden = platzhalter(andere)
          if (erwartet.join(',') !== gefunden.join(',')) {
            abweichungen.push(`${tool.id}/${schluessel} [${sprache}]: ${erwartet.join(',') || '—'} gegen ${gefunden.join(',') || '—'}`)
          }
        }
      }
    }
    expect(abweichungen, `Platzhalter weichen ab:\n${abweichungen.join('\n')}`).toEqual([])
  })

  it('hat keine unvollständige Interpolation und keine unpaarigen Surrogate', async () => {
    const fehler: string[] = []
    for (const sprache of SPRACHEN) {
      for (const tool of toolManifests) {
        const eigen = (await loadToolTexts(sprache, tool.id))[sprache] ?? {}
        for (const [schluessel, wert] of Object.entries(eigen)) {
          if (typeof wert !== 'string') continue
          const kennung = `${tool.id}/${schluessel} [${sprache}]`
          if (klammerfehler(wert)) fehler.push(`${kennung}: unvollständige Klammer`)
          if (!wert.isWellFormed()) fehler.push(`${kennung}: unpaariges Surrogat`)
          // Steuerzeichen außer Zeilenumbruch und Tabulator gehören in keinen Oberflächentext.
          // Die Prüfung sucht sie **bewusst** — deshalb die eng begrenzte Ausnahme.
          // eslint-disable-next-line no-control-regex -- Absicht: genau diese Zeichen werden gesucht
          if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(wert)) fehler.push(`${kennung}: Steuerzeichen`)
        }
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  it('deckt auch die gemeinsamen Texte und Suiten ab', async () => {
    const fehler: string[] = []
    for (const sprache of SPRACHEN) {
      const gemeinsam = (await loadCommonToolTexts(sprache))[sprache] ?? {}
      expect(Object.keys(gemeinsam).length, `${sprache}: keine gemeinsamen Texte`).toBeGreaterThan(5)
      for (const [schluessel, wert] of Object.entries(gemeinsam)) {
        if (typeof wert !== 'string' || !wert.trim()) fehler.push(`common/${schluessel} [${sprache}]: leer`)
      }
      // `loadInterfaceMessages` liefert die gemeinsamen Texte **und** die Suitennamen zusammen.
      const schnittstelle = (await loadInterfaceMessages(sprache))[sprache] ?? {}
      expect(Object.keys(schnittstelle).length, `${sprache}: keine Schnittstellentexte (common + suites)`).toBeGreaterThan(5)
      for (const [schluessel, wert] of Object.entries(schnittstelle)) {
        if (typeof wert !== 'string' || !wert.trim()) fehler.push(`ui/${schluessel} [${sprache}]: leer`)
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  it('hält die veröffentlichte Platzhalterzusage der PDF-Werkzeuge fest (M3-001)', async () => {
    // Der historische Fehler: `{número}` statt `{number}` — hier bleibt er festgehalten.
    const faelle = [
      ['pdf-split', 'tool.pdfSplit.download'],
      ['pdf-to-images', 'tool.pdfToImages.download'],
      ['pdf-organize', 'tool.pdfOrganize.original']
    ] as const
    for (const [id, schluessel] of faelle) {
      const spanisch = (await loadToolTexts('es', id)).es ?? {}
      const englisch = (await loadToolTexts('en', id)).en ?? {}
      expect(spanisch[schluessel], `${id}: Text fehlt`).toBeTypeOf('string')
      expect(platzhalter(spanisch[schluessel] ?? ''), `${id}/${schluessel}: Platzhalter`).toEqual(platzhalter(englisch[schluessel] ?? ''))
    }
  })

  it('führt Kurztext und Suchbegriffe in jeder Sprache (Katalogseite)', async () => {
    for (const sprache of SPRACHEN) {
      const index = await loadToolSearchIndex(sprache)
      expect(index.length, `${sprache}: leeres Suchregister`).toBe(toolManifests.length)
      for (const tool of toolManifests) {
        const eintrag = index.find((kandidat) => kandidat.id === tool.id)
        const text = eintrag?.locales[sprache]
        expect(text, `${tool.id} [${sprache}]: keine Katalogtexte`).toBeTruthy()
        expect(text?.summary?.trim(), `${tool.id} [${sprache}]: leerer Kurztext`).toBeTruthy()
        expect(text?.terms.length, `${tool.id} [${sprache}]: keine Suchbegriffe`).toBeGreaterThan(0)
      }
    }
  })
})
