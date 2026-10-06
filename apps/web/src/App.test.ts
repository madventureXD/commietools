import { describe, expect, it } from 'vitest'
import { createTranslator, detectLocale, loadInterfaceMessages, localeRegistry, supportedLocales } from '@commietools/i18n'
import { buildQrPayload, convertCase, encodeQrPayload, getSuiteTools, getTextStatistics, suiteManifests, toolByRoute } from '@commietools/tools'
import { formatJson } from '@commietools/tools/developer/json-formatter'
import { loadAllToolTexts } from '@commietools/tools/text-loaders'

const deMessages = await loadAllToolTexts('de')
const deInterface = await loadInterfaceMessages('de')

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
  it('encodes German characters and other Unicode as UTF-8 bytes', () => {
    const text = 'ÄÖÜ äöü ß – Grüße 👋'
    const encoded = encodeQrPayload(text)

    expect(Uint8Array.from(encoded, (character) => character.charCodeAt(0))).toEqual(new TextEncoder().encode(text))
    expect(new TextDecoder().decode(Uint8Array.from(encoded, (character) => character.charCodeAt(0)))).toBe(text)
  })

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
    const t = createTranslator('de', [deInterface, deMessages])
    expect(t('nav.tools')).toBe('Werkzeuge')
    // Ein Schlüssel der Werkzeugoberfläche — Titel und Beschreibung liegen seit 2026-10-05 im
    // Suchpaket, das die Werkzeugseite ohnehin lädt.
    expect(t('tool.jsonFormatter.input')).toBe('JSON eingeben')
  })

  it('falls back to English and exposes missing keys', () => {
    const incomplete = { de: {}, en: { 'tool.example.title': 'Example' } }
    const t = createTranslator('de', [incomplete])
    expect(t('tool.example.title')).toBe('Example')
    expect(t('missing.key')).toBe('missing.key')
  })

  it('derives supported languages and browser matching from the registry', () => {
    expect(supportedLocales).toEqual(['de', 'en', 'es'])
    expect(detectLocale(['de-AT', 'en-US'])).toBe('de')
    expect(detectLocale(['es-MX', 'en-US'])).toBe('es')
    expect(detectLocale(['fr-FR'])).toBe('en')
    expect(localeRegistry.de.direction).toBe('ltr')
    expect(localeRegistry.es.label).toBe('Español')
  })
})

