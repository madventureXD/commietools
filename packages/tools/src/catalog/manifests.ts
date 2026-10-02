import type { SuiteManifest, ToolManifest } from '@commietools/core'

/**
 * Tool and suite manifests. Kept free of runtime imports so the catalogue
 * generator can read this file directly; translated text lives in the locale
 * catalogues and is referenced by key only.
 */
export const toolManifests: readonly ToolManifest[] = [
  {
    id: 'text-statistics',
    route: '/tools/text-statistics',
    category: 'text',
    titleKey: 'tool.textStats.title',
    descriptionKey: 'tool.textStats.description',
    summaryKey: 'tool.textStats.summary',
    termsKey: 'tool.textStats.terms',
    executionMode: 'local',
    resourceClass: 'universal',
    worksOffline: true
  },
  {
    id: 'case-converter', route: '/tools/case-converter', category: 'text',
    titleKey: 'tool.caseConverter.title', descriptionKey: 'tool.caseConverter.description',
    summaryKey: 'tool.caseConverter.summary', termsKey: 'tool.caseConverter.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'json-formatter', route: '/tools/json-formatter', category: 'developer',
    titleKey: 'tool.jsonFormatter.title', descriptionKey: 'tool.jsonFormatter.description',
    summaryKey: 'tool.jsonFormatter.summary', termsKey: 'tool.jsonFormatter.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'qr-code-generator', route: '/tools/qr-code-generator', category: 'generator',
    titleKey: 'tool.qr.title', descriptionKey: 'tool.qr.description',
    summaryKey: 'tool.qr.summary', termsKey: 'tool.qr.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true,
    files: {
      auxiliary: [{ role: 'logo', mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] }],
      output: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
    }
  },
  {
    id: 'image-metadata', route: '/tools/image-metadata', category: 'image',
    titleKey: 'tool.imageMetadata.title', descriptionKey: 'tool.imageMetadata.description',
    summaryKey: 'tool.imageMetadata.summary', termsKey: 'tool.imageMetadata.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true,
    // Reads all eight types but only the first three can be cleaned losslessly.
    files: {
      input: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif', 'image/heic'],
      output: ['image/jpeg', 'image/png', 'image/webp']
    }
  },
  {
    id: 'image-resize', route: '/tools/image-resize', category: 'image',
    titleKey: 'tool.imageResize.title', descriptionKey: 'tool.imageResize.description',
    summaryKey: 'tool.imageResize.summary', termsKey: 'tool.imageResize.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: {
      input: ['image/jpeg', 'image/png', 'image/webp'],
      output: ['image/jpeg', 'image/png', 'image/webp']
    }
  }
]

export const suiteManifests: readonly SuiteManifest[] = [
  { id: 'text', route: '/suites/text', titleKey: 'suite.text.title', descriptionKey: 'suite.text.description', toolIds: ['text-statistics', 'case-converter'] },
  { id: 'developer', route: '/suites/developer', titleKey: 'suite.developer.title', descriptionKey: 'suite.developer.description', toolIds: ['json-formatter'] },
  { id: 'generators', route: '/suites/generators', titleKey: 'suite.generators.title', descriptionKey: 'suite.generators.description', toolIds: ['qr-code-generator'] },
  { id: 'image', route: '/suites/image', titleKey: 'suite.image.title', descriptionKey: 'suite.image.description', toolIds: ['image-metadata', 'image-resize'] }
]
