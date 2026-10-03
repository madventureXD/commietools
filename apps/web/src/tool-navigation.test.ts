import { describe, expect, it } from 'vitest'
import { addRecentTool, toggleToolId, validRecentTools, validToolIds } from './toolNavigationState'

describe('tool navigation state', () => {
  it('toggles favorites without disturbing their order', () => {
    expect(toggleToolId(['a', 'b'], 'a')).toEqual(['b'])
    expect(toggleToolId(['a'], 'b')).toEqual(['a', 'b'])
  })

  it('moves a recent tool to the front and limits the history', () => {
    expect(addRecentTool([{ id: 'a', at: 1 }, { id: 'b', at: 2 }], 'a', 3)).toEqual([{ id: 'a', at: 3 }, { id: 'b', at: 2 }])
    expect(addRecentTool(Array.from({ length: 10 }, (_, index) => ({ id: String(index), at: index })), 'new', 20)).toHaveLength(10)
  })

  it('drops unknown and duplicate persisted entries', () => {
    const known = new Set(['a', 'b'])
    expect(validToolIds(['a', 'x', 'a'], known)).toEqual(['a'])
    expect(validRecentTools([{ id: 'a', at: 1 }, { id: 'x', at: 9 }, { id: 'a', at: 3 }, { id: 'b', at: 2 }], known)).toEqual([{ id: 'b', at: 2 }, { id: 'a', at: 1 }])
  })
})
