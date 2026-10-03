import { describe, expect, it } from 'vitest'
import { createTranslator } from '@commietools/i18n'
import { MIN_QUERY_LENGTH, matchExcerpt, normalizeSearchText, searchTools, toolIndex } from '@commietools/tools'

const de = createTranslator('de', [])
const en = createTranslator('en', [])
const germanIds = (query: string) => searchTools(toolIndex, { query, locale: 'de', label: de }).map((match) => match.entry.id)
const englishIds = (query: string) => searchTools(toolIndex, { query, locale: 'en', label: en }).map((match) => match.entry.id)

describe('search folding', () => {
  it('resolves case, umlauts and the sharp s', () => {
    expect(normalizeSearchText('  Größe ')).toBe('grosse')
    expect(normalizeSearchText('Ändern')).toBe('andern')
    expect(normalizeSearchText('Höhe')).toBe('hohe')
    expect(normalizeSearchText('EXIF')).toBe('exif')
  })

  it('answers nothing below the minimum length', () => {
    expect(MIN_QUERY_LENGTH).toBe(2)
    expect(searchTools(toolIndex, { query: '', locale: 'de' })).toEqual([])
    expect(searchTools(toolIndex, { query: 'a', locale: 'de' })).toEqual([])
    expect(searchTools(toolIndex, { query: '  a ', locale: 'de' })).toEqual([])
    expect(searchTools(toolIndex, { query: 'ab', locale: 'de' }).length).toBeGreaterThan(0)
  })

  it('finds a tool when the umlaut is typed the other way round', () => {
    expect(germanIds('gross')).toContain('case-converter')
    expect(germanIds('Groesse')).toContain('image-resize')
    expect(germanIds('vergroessern')).toContain('image-resize')
  })
})

describe('search across languages', () => {
  it('finds the resizing tool through English words in the German interface', () => {
    for (const query of ['resize', 'shrink', 'enlarge', 'rotate', 'thumbnail']) {
      expect(germanIds(query), query).toContain('image-resize')
    }
  })

  it('finds German tools through German words in the English interface', () => {
    for (const query of ['datenschutz', 'verkleinern', 'metadaten', 'grossschreibung']) {
      expect(englishIds(query), query).not.toEqual([])
    }
    expect(englishIds('datenschutz')).toContain('image-metadata')
    expect(englishIds('verkleinern')).toContain('image-resize')
    expect(englishIds('grossschreibung')).toContain('case-converter')
  })

  it('marks a hit that came only from another language', () => {
    const [first] = searchTools(toolIndex, { query: 'shrink', locale: 'de', label: de })
    expect(first?.entry.id).toBe('image-resize')
    expect(first?.foreign).toBe(true)
    expect(first?.matched).toBe('shrink')

    const [german] = searchTools(toolIndex, { query: 'verkleinern', locale: 'de', label: de })
    expect(german?.entry.id).toBe('image-resize')
    expect(german?.foreign).toBe(false)
  })

  it('answers in the language the user selected, whatever matched', () => {
    const hit = searchTools(toolIndex, { query: 'resize', locale: 'de', label: de })[0]
    expect(hit?.entry.locales.de?.title).toBe('Bild skalieren')
    expect(hit?.entry.locales.de?.summary).toBe('Ändert Größe, Zuschnitt und Ausrichtung.')
  })
})

describe('search over declared file types and labels', () => {
  it('finds tools by file type and by extension, with and without the dot', () => {
    // The two image tools carry "WebP" as a curated term, the QR tool only as a
    // declared output type - the curated term ranks above the derived type.
    const byType = searchTools(toolIndex, { query: 'webp', locale: 'de', label: de })
    expect(byType.map((match) => match.entry.id)).toEqual(['image-metadata', 'image-resize', 'qr-code-generator', 'icon-generator'])
    expect(byType.slice(0, 2).every((match) => match.field === 'term')).toBe(true)
    expect(byType[2]?.field).toBe('format')
    expect(germanIds('heic')).toEqual(['image-metadata'])
    expect(germanIds('.jpg')).toContain('image-resize')
    expect(germanIds('.jpg')).toContain('image-metadata')
  })

  it('finds tools by tag and by keyword', () => {
    expect(germanIds('#bilder')).toEqual(['image-metadata', 'image-resize', 'images-to-pdf', 'pdf-to-images'])
    expect(germanIds('bilder')).toEqual(['images-to-pdf', 'image-metadata', 'image-resize', 'pdf-to-images', 'icon-generator'])
    expect(germanIds('#datenschutz')).toEqual(['image-metadata'])
  })

  it('finds tools by category and suite name of the selected language', () => {
    expect(germanIds('entwicklung')).toContain('json-formatter')
    expect(englishIds('development')).toContain('json-formatter')
    expect(germanIds('generator')).toContain('qr-code-generator')
    expect(englishIds('generators')).toContain('qr-code-generator')
  })

  it('works without a label resolver too', () => {
    expect(searchTools(toolIndex, { query: 'webp', locale: 'de' }).length).toBe(4)
    expect(searchTools(toolIndex, { query: 'exif', locale: 'de' })[0]?.entry.id).toBe('image-metadata')
  })
})

describe('match excerpts', () => {
  it('reports the single word a long sentence matched on', () => {
    const [first] = searchTools(toolIndex, { query: 'customizable', locale: 'de', label: de })
    expect(first?.entry.id).toBe('qr-code-generator')
    expect(first?.field).toBe('description')
    expect(first?.matched).toBe('customizable')
  })

  it('leaves short matches untouched', () => {
    expect(matchExcerpt('#bilder', 'bild')).toBe('#bilder')
    expect(matchExcerpt('WebP', 'webp')).toBe('WebP')
  })
})

describe('search ranking and completeness', () => {
  it('puts a curated term above a phrase from the long description', () => {
    const results = searchTools(toolIndex, { query: 'ohne Neuberechnung', locale: 'de', label: de })
    expect(results[0]?.entry.id).toBe('image-metadata')
    expect(results[0]?.field).toBe('term')
  })

  it('ranks a curated term of the selected language above the same word in another language', () => {
    const local = searchTools(toolIndex, { query: 'foto', locale: 'de', label: de })[0]
    const foreign = searchTools(toolIndex, { query: 'photo', locale: 'de', label: de })[0]
    expect(local?.entry.id).toBe('image-metadata')
    expect(local?.foreign).toBe(false)
    expect(foreign?.entry.id).toBe('image-metadata')
    expect(foreign?.foreign).toBe(true)
    expect(local?.score ?? 99).toBeLessThan(foreign?.score ?? 0)
  })

  it('keeps the catalogue order when scores are equal', () => {
    // "Bild" scores the same for six tools, so the catalogue decides their order.
    expect(germanIds('bild')).toEqual(['qr-code-generator', 'image-metadata', 'image-resize', 'images-to-pdf', 'pdf-to-images', 'icon-generator'])
  })

  it('answers a nonsense query with nothing instead of guessing', () => {
    expect(germanIds('zzzzzz')).toEqual([])
    expect(germanIds('quatschwerkzeug')).toEqual([])
  })

  it('gives the same answer on the second call', () => {
    expect(germanIds('bild')).toEqual(germanIds('bild'))
    expect(germanIds('webp')).toEqual(germanIds('webp'))
  })

  it('finds every tool by its own title in both languages', () => {
    for (const entry of toolIndex) {
      for (const locale of ['de', 'en'] as const) {
        const title = entry.locales[locale]?.title ?? ''
        const results = searchTools(toolIndex, { query: title, locale, label: locale === 'de' ? de : en })
        expect(results.map((match) => match.entry.id), `${entry.id}/${locale}: ${title}`).toContain(entry.id)
      }
    }
  })

  it('finds every tool by every one of its terms and tags', () => {
    for (const entry of toolIndex) {
      for (const locale of ['de', 'en'] as const) {
        const text = entry.locales[locale]
        if (!text) continue
        for (const term of [...text.terms, ...text.tags]) {
          const results = searchTools(toolIndex, { query: term, locale, label: locale === 'de' ? de : en })
          expect(results.map((match) => match.entry.id), `${entry.id}/${locale}: ${term}`).toContain(entry.id)
        }
      }
    }
  })
})
