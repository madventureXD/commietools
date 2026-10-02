import type { SuiteManifest, ToolCategory, ToolManifest } from '@commietools/core'

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
  }
]

export const suiteManifests: readonly SuiteManifest[] = [
  { id: 'text', route: '/suites/text', titleKey: 'suite.text.title', descriptionKey: 'suite.text.description', toolIds: ['text-statistics', 'case-converter'] },
  { id: 'developer', route: '/suites/developer', titleKey: 'suite.developer.title', descriptionKey: 'suite.developer.description', toolIds: ['json-formatter'] }
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

