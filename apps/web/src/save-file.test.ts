import { describe, expect, it } from 'vitest'
import { normaliseFileName } from './tools/SaveFileControl'

describe('save file names', () => {
  it('keeps a valid chosen name and required extension', () => {
    expect(normaliseFileName('bericht.pdf', 'document.pdf')).toBe('bericht.pdf')
  })

  it('replaces a conflicting extension', () => {
    expect(normaliseFileName('bericht.png', 'document.pdf')).toBe('bericht.pdf')
  })

  it('removes path separators and reserved device names', () => {
    expect(normaliseFileName('ordner/bericht?.pdf', 'document.pdf')).toBe('ordner-bericht-.pdf')
    expect(normaliseFileName('CON.pdf', 'document.pdf')).toBe('_CON.pdf')
  })

  it('uses the fallback for an empty name', () => {
    expect(normaliseFileName('  ', 'document.pdf')).toBe('document.pdf')
  })
})
