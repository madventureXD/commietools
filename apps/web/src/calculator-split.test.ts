import { describe, expect, it } from 'vitest'
import type { ToolSearchEntry } from '@commietools/core'
import { loadToolSearchIndex } from '@commietools/tools'
import { loadAllToolTexts, loadCommonToolTexts, loadToolTexts } from '@commietools/tools/text-loaders'
import { supportedLocales } from '@commietools/i18n'

/**
 * Die Aufteilung des Rechners in vier Werkzeuge (2026-10-04).
 *
 * Geprüft wird, was die Abnahme versprochen hat:
 *
 * 1. **Der Rahmen liegt einmal.** Ausdruck, Ergebnis, Verlauf, Fehlerklassen und Tastenfeld-Griffe
 *    stehen unter `tool.calc.*` — nicht viermal je Werkzeug.
 * 2. **Jedes Werkzeug ist schlanker als das Gesamtmodell.** Seine eigenen Schlüssel bleiben weit
 *    unter den 95 des alten gemeinsamen Rechners; die Schranke von 60 ist die Abnahmegrenze.
 * 3. **Die Rechenart ist kein Zustand mehr.** Einen Schlüssel `tool.calculator.mode` und die vier
 *    Modusbeschriftungen gibt es nicht mehr — die Rechenart ist das Werkzeug.
 *
 * Der Rahmen trägt die Rechenarten nicht: kein Werkzeugschlüssel darf den Namen eines anderen
 * Werkzeugs enthalten (etwa `tool.calculator.scientificCalculator…`).
 */
const TOOLS = [
  { id: 'calculator', prefix: 'tool.calculator.', limit: 60, title: 'Rechner' },
  { id: 'scientific-calculator', prefix: 'tool.scientificCalculator.', limit: 60, title: 'Wissenschaftlicher Rechner' },
  { id: 'programmer-calculator', prefix: 'tool.programmerCalculator.', limit: 60, title: 'Programmiererrechner' },
  { id: 'rpn-calculator', prefix: 'tool.rpnCalculator.', limit: 60, title: 'RPN-Rechner' }
] as const

/** Die Schlüssel des Rahmens, ohne die keine der vier Rechenarten bedienbar wäre. */
const FRAME_KEYS = [
  'tool.calc.expression',
  'tool.calc.placeholder',
  'tool.calc.calculate',
  'tool.calc.result',
  'tool.calc.history',
  'tool.calc.variables',
  'tool.calc.formula',
  'tool.calc.keypad',
  'tool.calc.key.clear',
  'tool.calc.error.syntax'
] as const

const toolMessages = Object.fromEntries(
  await Promise.all(supportedLocales.map(async (locale) => [locale, (await loadAllToolTexts(locale))[locale] ?? {}]))
)

describe('Rechner: vier Werkzeuge und ein gemeinsamer Rahmen', () => {
  it('führt die Schlüssel des Rahmens in jeder Sprache', () => {
    for (const locale of supportedLocales) {
      for (const key of FRAME_KEYS) {
        expect(toolMessages[locale]?.[key], `${locale}: ${key}`).toBeTruthy()
      }
    }
  })

  it('hält jedes Werkzeug unter der Abnahmegrenze eigener Schlüssel', async () => {
    /**
     * Seit 2026-10-05 liegen die Texte **je Werkzeug** in eigenen Paketen
     * (`messages/<sprache>/<werkzeug>.ts`). Geprüft wird deshalb am Paket selbst: es darf nur
     * Schlüssel **dieses** Werkzeugs führen (kein fremdes Werkzeug) und höchstens `limit` davon.
     * Die Rahmen- und Bereichstexte kommen aus dem gemeinsamen Paket und zählen nicht mit.
     */
    const common = Object.fromEntries(await Promise.all(supportedLocales.map(async (locale) => [locale, (await loadCommonToolTexts(locale))[locale] ?? {}])))
    for (const locale of supportedLocales) {
      for (const tool of TOOLS) {
        const pack = (await loadToolTexts(locale, tool.id))[locale] ?? {}
        const own = Object.keys(pack).filter((key) => !(key in (common[locale] ?? {})))
        expect(own.length, `${locale}: ${tool.id} hat ${own.length} eigene Schlüssel`).toBeLessThanOrEqual(tool.limit)
        for (const key of own) {
          expect(key.startsWith(tool.prefix), `${locale}: ${tool.id} führt fremden Schlüssel ${key}`).toBe(true)
        }
      }
    }
  })

  it('führt Titel, Kurzbeschreibung und Suchbegriffe je Werkzeug und Sprache', async () => {
    /**
     * **Alle vier Katalogtexte stehen im Suchpaket** (2026-10-05): Karten, Werkzeugschublade,
     * Suiten-Seite und Werkzeugkopfzeile lesen sie von dort — eine Quelle, ein Paket, das auf
     * jeder Seite ohnehin geladen wird.
     */
    const indexes = Object.fromEntries(
      await Promise.all(supportedLocales.map(async (locale) => [locale, await loadToolSearchIndex(locale)]))
    ) as Record<string, readonly ToolSearchEntry[]>
    for (const locale of supportedLocales) {
      for (const tool of TOOLS) {
        const entry = indexes[locale]?.find((candidate: ToolSearchEntry) => candidate.id === tool.id)
        const title = entry?.locales[locale]?.title
        const summary = entry?.locales[locale]?.summary
        const description = entry?.locales[locale]?.description
        const list: string[] = [...(entry?.locales[locale]?.terms ?? []), ...(entry?.locales[locale]?.tags ?? [])]
        expect(title, `${locale}: ${tool.prefix}title`).toBeTruthy()
        expect(description, `${locale}: ${tool.prefix}description`).toBeTruthy()
        expect(summary, `${locale}: ${tool.prefix}summary`).toBeTruthy()
        // `summary` bleibt eine Zeile und höchstens 120 Zeichen (Regularium für Sprachpakete).
        expect((summary ?? '').length, `${locale}: ${tool.prefix}summary`).toBeLessThanOrEqual(120)
        expect(list.length, `${locale}: ${tool.prefix}terms`).toBeGreaterThan(3)
        expect(list.some((term) => term.startsWith('#')), `${locale}: ${tool.prefix}terms ohne Tag`).toBe(true)
        const normalized = list.map((term) => term.toLowerCase())
        expect(new Set(normalized).size, `${locale}: ${tool.prefix}terms wiederholt sich`).toBe(normalized.length)
      }
    }
  })

  it('kennt keine Rechenart mehr als Zustand', () => {
    for (const locale of supportedLocales) {
      const messages = toolMessages[locale] ?? {}
      // Das Feld `mode` und die vier Modusbeschriftungen des alten Gesamtrechners sind entfallen:
      // die Rechenart ist das Werkzeug selbst, nicht eine Einstellung darin.
      expect(messages['tool.calculator.mode'], `${locale}`).toBeUndefined()
      for (const gone of ['modeStandard', 'modeScientific', 'modeProgrammer', 'modeRpn']) {
        expect(messages[`tool.calculator.${gone}`], `${locale}: ${gone}`).toBeUndefined()
      }
    }
  })
})