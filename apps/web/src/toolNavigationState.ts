export type ToolSort = 'category' | 'az' | 'recent' | 'favorites'

export interface RecentTool {
  readonly id: string
  readonly at: number
}

export function toggleToolId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

export function addRecentTool(items: readonly RecentTool[], id: string, at = Date.now(), limit = 10): RecentTool[] {
  return [{ id, at }, ...items.filter((item) => item.id !== id)].slice(0, limit)
}

export function validToolIds(ids: readonly string[], knownIds: ReadonlySet<string>): string[] {
  return [...new Set(ids.filter((id) => knownIds.has(id)))]
}

export function validRecentTools(items: readonly RecentTool[], knownIds: ReadonlySet<string>): RecentTool[] {
  return items.filter((item, index) => knownIds.has(item.id) && items.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((left, right) => right.at - left.at)
    .slice(0, 10)
}
