import { describe, expect, it } from 'vitest'
import { createTranslator, detectLocale, localeRegistry, supportedLocales } from '@commietools/i18n'
import { buildQrPayload, convertCase, formatJson, getSuiteTools, getTextStatistics, suiteManifests, toolByRoute, toolMessages } from '@commietools/tools'

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

describe('QR payloads', () => {
  it('builds escaped Wi-Fi payloads', () => {
    expect(buildQrPayload({ type: 'wifi', ssid: 'Office;West', password: 'a:b', security: 'WPA', hidden: true })).toBe('WIFI:T:WPA;S:Office\\;West;P:a\\:b;H:true;;')
  })

  it('builds contact and email payloads', () => {
    expect(buildQrPayload({ type: 'contact', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.org' })).toContain('FN:Ada Lovelace')
    expect(buildQrPayload({ type: 'email', email: 'info@example.org', subject: 'Hello world' })).toBe('mailto:info@example.org?subject=Hello+world')
  })
})

describe('hybrid translations', () => {
  it('merges platform and per-tool messages', () => {
    const t = createTranslator('de', [toolMessages])
    expect(t('nav.tools')).toBe('Werkzeuge')
    expect(t('tool.jsonFormatter.title')).toBe('JSON formatieren')
  })

  it('falls back to English and exposes missing keys', () => {
    const incomplete = { de: {}, en: { 'tool.example.title': 'Example' } }
    const t = createTranslator('de', [incomplete])
    expect(t('tool.example.title')).toBe('Example')
    expect(t('missing.key')).toBe('missing.key')
  })

  it('derives supported languages and browser matching from the registry', () => {
    expect(supportedLocales).toEqual(['de', 'en'])
    expect(detectLocale(['de-AT', 'en-US'])).toBe('de')
    expect(detectLocale(['fr-FR'])).toBe('en')
    expect(localeRegistry.de.direction).toBe('ltr')
  })
})

