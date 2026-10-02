export type ToolExecutionMode = 'local' | 'hybrid' | 'online'
export type ToolResourceClass = 'universal' | 'standard' | 'heavy'
export type ToolCategory = 'text' | 'pdf' | 'image' | 'developer' | 'generator'

export interface ToolManifest {
  id: string
  route: string
  category: ToolCategory
  titleKey: string
  descriptionKey: string
  executionMode: ToolExecutionMode
  resourceClass: ToolResourceClass
  worksOffline: boolean
}

export interface SuiteManifest {
  id: string
  route: string
  titleKey: string
  descriptionKey: string
  toolIds: readonly string[]
}

