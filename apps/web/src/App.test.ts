import { describe, expect, it } from 'vitest'
import { getTextStatistics } from '@commietools/tools'

describe('text statistics', () => {
  it('counts empty input', () => {
    expect(getTextStatistics('')).toEqual({ characters: 0, words: 0, lines: 0 })
  })

  it('counts localized text and line endings', () => {
    expect(getTextStatistics('Hallo Welt\r\nNeue Zeile')).toEqual({ characters: 22, words: 4, lines: 2 })
  })
})

