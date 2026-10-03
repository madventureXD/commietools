import { describe, expect, it } from 'vitest'
import { knownFormats } from '@commietools/core'
import { supportedLocales } from '@commietools/i18n'
import {
  acceptAttributeFor,
  auxiliaryMimeTypes,
  detectImageFormat,
  formatNames,
  inputMimeTypes,
  readOnlyFormatNames,
  searchEntryById,
  suiteManifests,
  toolById,
  toolIndex,
  toolManifests,
  toolMessages,
  type ImageFormat
} from '@commietools/tools'

/** Builds a byte pattern; pads to the twelve bytes the detector needs. */
function header(...parts: Array<string | number[]>): Uint8Array {
  const bytes: number[] = []
  for (const part of parts) {
    if (typeof part === 'string') bytes.push(...[...part].map((character) => character.charCodeAt(0)))
    else bytes.push(...part)
  }
  while (bytes.length < 16) bytes.push(0)
  return new Uint8Array(bytes)
}

/** One recognisable file header per declared type. */
const signatures: Record<string, { bytes: Uint8Array; format: ImageFormat }> = {
  'image/jpeg': { bytes: header([0xff, 0xd8, 0xff, 0xe0]), format: 'jpeg' },
  'image/png': { bytes: header([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), format: 'png' },
  'image/webp': { bytes: header('RIFF', [0, 0, 0, 0], 'WEBP'), format: 'webp' },
  'image/gif': { bytes: header('GIF89a'), format: 'gif' },
  'image/bmp': { bytes: header('BM'), format: 'bmp' },
  'image/tiff': { bytes: header([0x49, 0x49, 0x2a, 0x00]), format: 'tiff' },
  'image/avif': { bytes: header([0, 0, 0, 24], 'ftyp', 'avif'), format: 'avif' },
  'image/heic': { bytes: header([0, 0, 0, 24], 'ftyp', 'heic'), format: 'heic' }
}

const fileToolIds = toolManifests
  .filter((tool) => (tool.files?.input ?? []).length > 0)
  .map((tool) => tool.id)

describe('tool catalogue', () => {
  it('covers every manifest in the same order', () => {
    expect(toolIndex.map((entry) => entry.id)).toEqual(toolManifests.map((tool) => tool.id))
  })

  it('carries identity, icon and suites of each manifest', () => {
    for (const tool of toolManifests) {
      const entry = searchEntryById.get(tool.id)
      expect(entry, tool.id).toBeDefined()
      expect(entry?.route).toBe(tool.route)
      expect(entry?.icon).toBe(`/tools/${tool.id}.svg`)
      expect(entry?.category).toBe(tool.category)
      expect(entry?.worksOffline).toBe(tool.worksOffline)
      expect(entry?.suiteIds).toEqual(suiteManifests.filter((suite) => suite.toolIds.includes(tool.id)).map((suite) => suite.id))
    }
  })

  it('holds a short summary and search terms in every supported language', () => {
    for (const tool of toolManifests) {
      for (const locale of supportedLocales) {
        const summary = toolMessages[locale]?.[tool.summaryKey]
        const description = toolMessages[locale]?.[tool.descriptionKey]
        const terms = toolMessages[locale]?.[tool.termsKey]
        expect(summary, `${tool.id}/${locale}`).toBeTruthy()
        expect(description, `${tool.id}/${locale}`).toBeTruthy()
        expect(terms, `${tool.id}/${locale}`).toBeTruthy()
        expect(summary?.length, `${tool.id}/${locale}`).toBeLessThanOrEqual(120)
        expect(summary, `${tool.id}/${locale}`).not.toBe(description)
        expect(summary?.trim().split(' ').length, `${tool.id}/${locale}`).toBeLessThan(description?.trim().split(' ').length ?? 0)
      }
    }
  })

  it('keeps the searchable text of every language in the catalogue', () => {
    for (const entry of toolIndex) {
      expect(Object.keys(entry.locales).sort()).toEqual([...supportedLocales].sort())
      for (const locale of supportedLocales) {
        const text = entry.locales[locale]
        expect(text?.title).toBeTruthy()
        expect(text?.summary).toBeTruthy()
        expect(text?.terms.length, `${entry.id}/${locale}`).toBeGreaterThan(0)
        expect(text?.tags.length, `${entry.id}/${locale}`).toBeGreaterThan(0)
        expect(text?.tags.every((tag) => tag.startsWith('#') && tag.length > 1)).toBe(true)
      }
    }
  })

  it('has no term twice, counting tags', () => {
    for (const entry of toolIndex) {
      for (const locale of supportedLocales) {
        const text = entry.locales[locale] ?? { title: '', summary: '', terms: [], tags: [] }
        const all = [...text.terms, ...text.tags].map((term) => term.toLowerCase())
        expect(new Set(all).size, `${entry.id}/${locale}`).toBe(all.length)
      }
    }
  })

  it('finds a tool through another language, as a German user searching an English word', () => {
    expect(toolIndex.find((entry) => entry.id === 'image-resize')?.locales.de?.terms).toContain('verkleinern')
    expect(toolIndex.find((entry) => entry.id === 'image-resize')?.locales.en?.terms).toContain('resize')
    expect(toolIndex.find((entry) => entry.id === 'image-metadata')?.locales.de?.tags).toContain('#datenschutz')
    expect(toolIndex.find((entry) => entry.id === 'image-metadata')?.locales.en?.tags).toContain('#privacy')
  })
})

describe('declared file types', () => {
  it('only uses types from the shared format table', () => {
    const known = new Set(knownFormats.map((format) => format.mime))
    for (const tool of toolManifests) {
      const declared = [...(tool.files?.input ?? []), ...(tool.files?.output ?? []), ...(tool.files?.auxiliary ?? []).flatMap((extra) => extra.mimeTypes)]
      for (const mime of declared) expect(known.has(mime), `${tool.id}: ${mime}`).toBe(true)
    }
  })

  it('derives the accept attribute instead of typing it by hand', () => {
    expect(acceptAttributeFor('image-metadata')).toBe('image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,image/heic')
    expect(acceptAttributeFor('image-resize')).toBe('image/jpeg,image/png,image/webp')
    expect(acceptAttributeFor('icon-generator')).toBe('image/png,image/jpeg,image/webp')
    expect(acceptAttributeFor('images-to-pdf')).toBe('image/jpeg,image/png')
    expect(acceptAttributeFor('text-statistics')).toBe('')
    expect(inputMimeTypes('unknown-tool')).toEqual([])
  })

  it('declares an input for every tool that works on files', () => {
    for (const tool of toolManifests) {
      if (tool.category === 'image' || tool.category === 'pdf') {
        expect(tool.files?.input?.length, tool.id).toBeGreaterThan(0)
      }
    }
    expect(fileToolIds).toEqual(['image-metadata', 'image-resize', 'icon-generator', 'image-watermark', 'color-tools', 'pdf-merge', 'pdf-split', 'pdf-organize', 'images-to-pdf', 'pdf-to-images', 'pdf-watermark', 'pdf-page-numbers', 'pdf-visible-signature', 'pdf-form-fill', 'pdf-annotate'])
  })

  it('separates types that are only read from types that are written', () => {
    expect(readOnlyFormatNames('image-metadata')).toEqual(['GIF', 'BMP', 'TIFF', 'AVIF', 'HEIC'])
    expect(readOnlyFormatNames('image-resize')).toEqual([])
    // The icon generator reads JPEG and WebP but writes PNG and ICO only.
    expect(readOnlyFormatNames('icon-generator')).toEqual(['JPEG', 'WebP'])
    // The watermark tool writes back every format it reads.
    expect(readOnlyFormatNames('image-watermark')).toEqual([])
    expect(formatNames(auxiliaryMimeTypes('image-watermark', 'logo'))).toEqual(['PNG', 'JPEG', 'WebP'])
    expect(formatNames(auxiliaryMimeTypes('qr-code-generator', 'logo'))).toEqual(['PNG', 'JPEG', 'WebP', 'SVG'])
    expect(auxiliaryMimeTypes('qr-code-generator', 'frame')).toEqual([])
    expect(toolById.get('qr-code-generator')?.files?.auxiliary?.[0]?.role).toBe('logo')
  })

  it('agrees with the format detection in the code', () => {
    const imageToolIds = toolManifests.filter((tool) => tool.category === 'image').map((tool) => tool.id)
    for (const toolId of imageToolIds) {
      for (const mime of inputMimeTypes(toolId)) {
        const signature = signatures[mime]
        expect(signature, `${toolId} declares ${mime} without a known header`).toBeDefined()
        if (!signature) continue
        expect(detectImageFormat(signature.bytes), `${toolId}: ${mime}`).toBe(signature.format)
      }
    }
  })

  it('keeps the hand-written accepted list out of the catalogues', () => {
    for (const locale of supportedLocales) {
      const typed = Object.keys(toolMessages[locale] ?? {}).filter((key) => key.endsWith('.accepted'))
      expect(typed, locale).toEqual([])
    }
  })
})
