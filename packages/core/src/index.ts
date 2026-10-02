export type ToolExecutionMode = 'local' | 'hybrid' | 'online'
export type ToolResourceClass = 'universal' | 'standard' | 'heavy'
export type ToolCategory = 'text' | 'pdf' | 'image' | 'developer' | 'generator'

/**
 * Formats the platform knows by name and extension. This table is the single
 * source: file types are declared as MIME types and never written by hand, so
 * the searchable names and extensions cannot drift away from the code.
 */
export interface FormatInfo {
  readonly mime: string
  /** Language-neutral short name, used in lists and tool cards. */
  readonly name: string
  readonly extensions: readonly string[]
}

export const knownFormats: readonly FormatInfo[] = [
  { mime: 'image/jpeg', name: 'JPEG', extensions: ['.jpg', '.jpeg'] },
  { mime: 'image/png', name: 'PNG', extensions: ['.png'] },
  { mime: 'image/webp', name: 'WebP', extensions: ['.webp'] },
  { mime: 'image/avif', name: 'AVIF', extensions: ['.avif'] },
  { mime: 'image/gif', name: 'GIF', extensions: ['.gif'] },
  { mime: 'image/bmp', name: 'BMP', extensions: ['.bmp'] },
  { mime: 'image/tiff', name: 'TIFF', extensions: ['.tif', '.tiff'] },
  { mime: 'image/heic', name: 'HEIC', extensions: ['.heic'] },
  { mime: 'image/svg+xml', name: 'SVG', extensions: ['.svg'] },
  { mime: 'application/pdf', name: 'PDF', extensions: ['.pdf'] },
  { mime: 'text/plain', name: 'Text', extensions: ['.txt'] },
  { mime: 'application/json', name: 'JSON', extensions: ['.json'] },
  { mime: 'text/csv', name: 'CSV', extensions: ['.csv'] }
]

export function formatInfo(mime: string): FormatInfo | undefined {
  return knownFormats.find((entry) => entry.mime === mime)
}

/** Additional file input with its own allowed types, such as an overlay image. */
export interface AuxiliaryFileInput {
  /** Translation key suffix naming the role, e.g. `logo` for `tool.<x>.role.logo`. */
  readonly role: string
  readonly mimeTypes: readonly string[]
}

/**
 * Which files a tool reads and writes. Omitted entirely for tools that work on
 * typed text or only produce information.
 */
export interface ToolFileContract {
  /** MIME types offered as the main file input. */
  readonly input?: readonly string[]
  readonly auxiliary?: readonly AuxiliaryFileInput[]
  /** MIME types the tool can produce as a file the user keeps. */
  readonly output?: readonly string[]
}

export interface ToolManifest {
  id: string
  route: string
  category: ToolCategory
  titleKey: string
  descriptionKey: string
  /** One short line for search results and lists. Required. */
  summaryKey: string
  /** Comma-separated search terms; a leading `#` marks a tag. Required. */
  termsKey: string
  executionMode: ToolExecutionMode
  resourceClass: ToolResourceClass
  worksOffline: boolean
  files?: ToolFileContract
}

export interface SuiteManifest {
  id: string
  route: string
  titleKey: string
  descriptionKey: string
  toolIds: readonly string[]
}

/** One language's searchable and displayable text for a tool. */
export interface ToolLocaleEntry {
  readonly title: string
  readonly summary: string
  /** Long form, searched as well but ranked below title and summary. */
  readonly description: string
  /** Plain search terms. */
  readonly terms: readonly string[]
  /** Terms written with a leading `#`, shown as labels. */
  readonly tags: readonly string[]
}

/**
 * Generated catalogue entry. Written by `scripts/catalog-generate.mjs`; never
 * maintained by hand.
 */
export interface ToolSearchEntry {
  readonly id: string
  readonly route: string
  readonly icon: string
  readonly category: ToolCategory
  readonly suiteIds: readonly string[]
  readonly executionMode: ToolExecutionMode
  readonly resourceClass: ToolResourceClass
  readonly worksOffline: boolean
  readonly input: readonly string[]
  readonly output: readonly string[]
  readonly auxiliary: readonly AuxiliaryFileInput[]
  readonly locales: Readonly<Record<string, ToolLocaleEntry>>
}
