import type { SuiteManifest, ToolCategory, ToolManifest } from '@commietools/core'
export { toolMessages } from './locales'
export {
  detectImageFormat,
  findMetadataSegments,
  readMetadata,
  stripMetadata,
  type ImageFormat,
  type MetadataEntry,
  type MetadataGroup,
  type MetadataPosition,
  type MetadataReport,
  type MetadataSegment,
  type StripOptions,
  type StripResult
} from './image/metadata/metadata'
export {
  MAX_EDGE,
  clampCrop,
  cropBoxFraction,
  cropSourceRect,
  fitScale,
  normalizeTurns,
  orientedSize,
  planResize,
  type CropRect,
  type ResizeMode,
  type ResizeOptions,
  type ResizePlan,
  type Size
} from './image/resize/resize'

export const toolManifests: readonly ToolManifest[] = [
  {
    id: 'text-statistics',
    route: '/tools/text-statistics',
    category: 'text',
    titleKey: 'tool.textStats.title',
    descriptionKey: 'tool.textStats.description',
    executionMode: 'local',
    resourceClass: 'universal',
    worksOffline: true
  },
  {
    id: 'case-converter', route: '/tools/case-converter', category: 'text',
    titleKey: 'tool.caseConverter.title', descriptionKey: 'tool.caseConverter.description',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'json-formatter', route: '/tools/json-formatter', category: 'developer',
    titleKey: 'tool.jsonFormatter.title', descriptionKey: 'tool.jsonFormatter.description',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'qr-code-generator', route: '/tools/qr-code-generator', category: 'generator',
    titleKey: 'tool.qr.title', descriptionKey: 'tool.qr.description',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'image-metadata', route: '/tools/image-metadata', category: 'image',
    titleKey: 'tool.imageMetadata.title', descriptionKey: 'tool.imageMetadata.description',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'image-resize', route: '/tools/image-resize', category: 'image',
    titleKey: 'tool.imageResize.title', descriptionKey: 'tool.imageResize.description',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  }
]

export const suiteManifests: readonly SuiteManifest[] = [
  { id: 'text', route: '/suites/text', titleKey: 'suite.text.title', descriptionKey: 'suite.text.description', toolIds: ['text-statistics', 'case-converter'] },
  { id: 'developer', route: '/suites/developer', titleKey: 'suite.developer.title', descriptionKey: 'suite.developer.description', toolIds: ['json-formatter'] },
  { id: 'generators', route: '/suites/generators', titleKey: 'suite.generators.title', descriptionKey: 'suite.generators.description', toolIds: ['qr-code-generator'] },
  { id: 'image', route: '/suites/image', titleKey: 'suite.image.title', descriptionKey: 'suite.image.description', toolIds: ['image-metadata', 'image-resize'] }
]

export const toolById = new Map(toolManifests.map((tool) => [tool.id, tool]))
export const toolByRoute = new Map(toolManifests.map((tool) => [tool.route, tool]))
export const suiteByRoute = new Map(suiteManifests.map((suite) => [suite.route, suite]))

export function getToolsByCategory(category: ToolCategory): readonly ToolManifest[] {
  return toolManifests.filter((tool) => tool.category === category)
}

export function getSuiteTools(suite: SuiteManifest): readonly ToolManifest[] {
  return suite.toolIds.flatMap((id) => {
    const tool = toolById.get(id)
    return tool ? [tool] : []
  })
}

export interface TextStatistics {
  characters: number
  words: number
  lines: number
}

export function getTextStatistics(input: string): TextStatistics {
  const normalized = input.trim()
  return {
    characters: input.length,
    words: normalized ? normalized.split(/\s+/u).length : 0,
    lines: input ? input.split(/\r\n|\r|\n/u).length : 0
  }
}

export type CaseMode = 'upper' | 'lower' | 'title'

export function convertCase(input: string, mode: CaseMode, locale = 'de-DE'): string {
  if (mode === 'upper') return input.toLocaleUpperCase(locale)
  if (mode === 'lower') return input.toLocaleLowerCase(locale)
  return input.toLocaleLowerCase(locale).replace(/(^|\s)(\p{L})/gu, (_, space: string, letter: string) => `${space}${letter.toLocaleUpperCase(locale)}`)
}

export interface JsonFormatResult { value: string; error: string | null }

export function formatJson(input: string, indentation = 2): JsonFormatResult {
  if (!input.trim()) return { value: '', error: null }
  try {
    return { value: JSON.stringify(JSON.parse(input), null, indentation), error: null }
  } catch {
    return { value: input, error: 'invalid-json' }
  }
}

export type QrContentType = 'text' | 'url' | 'wifi' | 'contact' | 'email' | 'phone' | 'sms' | 'geo'

export interface QrPayloadInput {
  type: QrContentType
  text?: string
  url?: string
  ssid?: string
  password?: string
  security?: 'WPA' | 'WEP' | 'nopass'
  hidden?: boolean
  firstName?: string
  lastName?: string
  organization?: string
  phone?: string
  email?: string
  website?: string
  subject?: string
  body?: string
  latitude?: string
  longitude?: string
}

function escapeWifi(value = ''): string {
  return value.replace(/([\\;,:"])/gu, '\\$1')
}

function escapeVCard(value = ''): string {
  return value.replace(/\\/gu, '\\\\').replace(/\n/gu, '\\n').replace(/([;,])/gu, '\\$1')
}

export function buildQrPayload(input: QrPayloadInput): string {
  switch (input.type) {
    case 'url': return input.url?.trim() ?? ''
    case 'wifi': return `WIFI:T:${input.security ?? 'WPA'};S:${escapeWifi(input.ssid)};P:${escapeWifi(input.password)};H:${input.hidden ? 'true' : 'false'};;`
    case 'contact': return ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeVCard(input.lastName)};${escapeVCard(input.firstName)};;;`, `FN:${escapeVCard([input.firstName, input.lastName].filter(Boolean).join(' '))}`, input.organization ? `ORG:${escapeVCard(input.organization)}` : '', input.phone ? `TEL:${escapeVCard(input.phone)}` : '', input.email ? `EMAIL:${escapeVCard(input.email)}` : '', input.website ? `URL:${escapeVCard(input.website)}` : '', 'END:VCARD'].filter(Boolean).join('\n')
    case 'email': {
      const params = new URLSearchParams()
      if (input.subject) params.set('subject', input.subject)
      if (input.body) params.set('body', input.body)
      const query = params.toString()
      return `mailto:${input.email ?? ''}${query ? `?${query}` : ''}`
    }
    case 'phone': return `tel:${input.phone ?? ''}`
    case 'sms': return `SMSTO:${input.phone ?? ''}:${input.body ?? ''}`
    case 'geo': return `geo:${input.latitude ?? ''},${input.longitude ?? ''}`
    default: return input.text ?? ''
  }
}

/**
 * Converts Unicode text to the byte string expected by qrcode-generator.
 * The renderer otherwise truncates every UTF-16 code unit to one byte.
 */
export function encodeQrPayload(payload: string): string {
  return Array.from(new TextEncoder().encode(payload), (byte) => String.fromCharCode(byte)).join('')
}

