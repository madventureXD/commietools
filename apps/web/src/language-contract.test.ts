import { describe, expect, it } from 'vitest'
import { loadCommonToolTexts, loadToolTexts } from '@commietools/tools/text-loaders'
import { loadToolSearchIndex, toolManifests } from '@commietools/tools'
import { loadInterfaceMessages, supportedLocales } from '@commietools/i18n'
import { validateCatalog } from './language-contract'

describe('Raw language contract across tools, common, UI and suites (M3-009)', () => {
  it('validates both key directions, Unicode, syntax and placeholder multiplicity before fallback', async () => {
    const failures: string[] = []
    for (const locale of supportedLocales) {
      for (const tool of toolManifests) {
        const reference = (await loadToolTexts('de', tool.id)).de ?? {}
        const raw = (await loadToolTexts(locale, tool.id))[locale] ?? {}
        expect(Object.keys(reference).length).toBeGreaterThan(0)
        failures.push(...validateCatalog(reference, raw).map((error) => tool.id + '/' + locale + ': ' + error))
      }
      for (const [scope, loader] of [['common', loadCommonToolTexts], ['ui+suites', loadInterfaceMessages]] as const) {
        const reference = (await loader('de')).de ?? {}
        const raw = (await loader(locale))[locale] ?? {}
        expect(Object.keys(reference).length).toBeGreaterThan(5)
        failures.push(...validateCatalog(reference, raw).map((error) => scope + '/' + locale + ': ' + error))
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('rejects all reported mutants in every text class', () => {
    for (const scope of ['tool', 'common', 'ui', 'suite']) {
      const reference = { label: 'Value {number} {number}' }
      for (const mutant of [
        {}, { ...reference, extra: 'extra' }, { label: '' }, { label: '\ud800' },
        { label: 'e\u0301 {number} {number}' }, { label: 'x\u0000 {number} {number}' },
        { label: 'Value {number}' }, { label: 'Value }number{ {number}' },
        { label: 'Value {{number}} {number}' }
      ]) expect(validateCatalog(reference, mutant).length, scope).toBeGreaterThan(0)
      expect(validateCatalog(reference, reference), scope).toEqual([])
    }
  })

  it('has searchable localized catalog entries for every tool', async () => {
    for (const locale of supportedLocales) {
      const index = await loadToolSearchIndex(locale)
      expect(index.length).toBe(toolManifests.length)
      for (const tool of toolManifests) {
        const text = index.find((entry) => entry.id === tool.id)?.locales[locale]
        expect(text?.summary.trim(), tool.id + '/' + locale).toBeTruthy()
        expect(text?.terms.length, tool.id + '/' + locale).toBeGreaterThan(0)
      }
    }
  })
})
