import { describe, expect, it } from 'vitest'
import { convertCase, formatJson, getSuiteTools, getTextStatistics, suiteManifests, toolByRoute } from '@commietools/tools'

describe('text statistics', () => {
  it('counts empty input', () => {
    expect(getTextStatistics('')).toEqual({ characters: 0, words: 0, lines: 0 })
  })

  it('counts localized text and line endings', () => {
    expect(getTextStatistics('Hallo Welt\r\nNeue Zeile')).toEqual({ characters: 22, words: 4, lines: 2 })
  })
})

describe('tool registry', () => {
  it('resolves tools by route', () => {
    expect(toolByRoute.get('/tools/json-formatter')?.id).toBe('json-formatter')
  })

  it('resolves suite members without duplication', () => {
    expect(getSuiteTools(suiteManifests[0]!).map((tool) => tool.id)).toEqual(['text-statistics', 'case-converter'])
  })
})

describe('local tool engines', () => {
  it('converts letter case', () => {
    expect(convertCase('hallo welt', 'upper')).toBe('HALLO WELT')
    expect(convertCase('hallo welt', 'title')).toBe('Hallo Welt')
  })

  it('formats valid JSON and reports invalid JSON', () => {
    expect(formatJson('{"ok":true}').value).toBe('{\n  "ok": true\n}')
    expect(formatJson('{').error).toBe('invalid-json')
  })
})

