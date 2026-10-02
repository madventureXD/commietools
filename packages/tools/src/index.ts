import type { ToolManifest } from '@commietools/core'

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
  }
]

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

