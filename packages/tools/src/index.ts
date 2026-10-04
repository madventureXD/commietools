import { formatInfo } from '@commietools/core'
import type { SuiteManifest, ToolCategory, ToolManifest } from '@commietools/core'
import { suiteManifests, toolManifests } from './catalog/manifests'
import { toolIndex } from './catalog/toolIndex'

export { suiteManifests, toolManifests } from './catalog/manifests'
export { toolIndex } from './catalog/toolIndex'
export { loadToolMessages, loadToolSearchIndex, type GeneratedLocale } from './catalog/generated/loaders'
export {
  MIN_QUERY_LENGTH,
  declaredMimeTypes,
  matchExcerpt,
  normalizeSearchText,
  searchTools,
  type MatchField,
  type SearchOptions,
  type ToolMatch
} from './catalog/search'
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
export {
  ICO_MAX_SIZE,
  ICON_SIZES,
  IconError,
  MASKABLE_SAFE_ZONE,
  buildIco,
  buildManifestIcons,
  icoSizes,
  normalizeSizes,
  planIcon,
  planIcons,
  readPngSize,
  type IconBox,
  type IconErrorCode,
  type IconFit,
  type IconPlanItem,
  type IconPlanOptions,
  type ManifestIconEntry
} from './image/icon/icon'
export {
  MAX_SCALE,
  MIN_SCALE,
  WATERMARK_ANCHORS,
  clampOpacity,
  clampScale,
  clampSpacing,
  markSize,
  normalizeRotation,
  placeWatermark,
  type WatermarkAnchor,
  type WatermarkBox,
  type WatermarkOptions
} from './image/watermark/watermark'
export {
  CVD_TYPES,
  MAX_PALETTE_COLORS,
  clampChannel,
  contrastRatio,
  contrastVerdict,
  cvdRows,
  hslToRgb,
  linearFromSrgbChannel,
  paletteFromPixels,
  parseColor,
  relativeLuminance,
  rgbToHsl,
  rgbToLab,
  simulateCvd,
  srgbFromLinearChannel,
  toHex,
  type ContrastVerdict,
  type CvdType,
  type Hsl,
  type Lab,
  type Rgb
} from './image/color/color'

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

/** MIME types a tool offers in its main file input. */
export function inputMimeTypes(toolId: string): readonly string[] {
  return toolById.get(toolId)?.files?.input ?? []
}

/** Value for the `accept` attribute of a file input, derived from the manifest. */
export function acceptAttributeFor(toolId: string): string {
  return inputMimeTypes(toolId).join(',')
}

/** Language-neutral format names for a list of MIME types. */
export function formatNames(mimeTypes: readonly string[]): readonly string[] {
  return mimeTypes.flatMap((mime) => {
    const info = formatInfo(mime)
    return info ? [info.name] : []
  })
}

/** Format names a tool can read but not write back, in the declared order. */
export function readOnlyFormatNames(toolId: string): readonly string[] {
  const files = toolById.get(toolId)?.files
  const output = files?.output ?? []
  return formatNames((files?.input ?? []).filter((mime) => !output.includes(mime)))
}

/** MIME types declared for one auxiliary input role, such as a logo image. */
export function auxiliaryMimeTypes(toolId: string, role: string): readonly string[] {
  const extra = toolById.get(toolId)?.files?.auxiliary?.find((item) => item.role === role)
  return extra?.mimeTypes ?? []
}

/** Generated catalogue entries by tool id. */
export const searchEntryById = new Map(toolIndex.map((entry) => [entry.id, entry]))

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
