import { describe, expect, it } from 'vitest'
import { formatJson } from '@commietools/tools/developer/json-formatter'

/** Alle Leerraumzeichen außerhalb entfernen — für die Tokenfolge-Prüfung der Karte. */
const ohneLeerraum = (text: string) => text.replace(/\s+/gu, '')

describe('JSON formatieren (M6-001)', () => {
  it('keeps the token sequence — numbers are not rewritten', () => {
    // Vorher (JSON.parse/stringify): 9007199254740993 → …992, 1e309 → null, 1.2300 → 1.23, -0 → 0.
    const cases = [
      '{"gross":9007199254740993}',
      '{"neg":-9007199254740993}',
      '{"exp":1e309}',
      '{"negativnull":-0}',
      '{"nachkommastellen":1.2300}',
      '{"dup":1,"dup":2}',
      '[1,2,3]'
    ]
    for (const input of cases) {
      const result = formatJson(input, 2)
      expect(result.error).toBe(null)
      expect(ohneLeerraum(result.value)).toBe(ohneLeerraum(input))
    }
    expect(formatJson('{"gross":9007199254740993}').value).toContain('9007199254740993')
    expect(formatJson('{"exp":1e309}').value).toContain('1e309')
    expect(formatJson('{"nachkommastellen":1.2300}').value).toContain('1.2300')
  })

  it('keeps escaped strings unchanged', () => {
    const input = '{"esc":"a\\"b\\\\c\\u00e4\\n"}'
    const result = formatJson(input)
    expect(result.error).toBe(null)
    expect(ohneLeerraum(result.value)).toBe(ohneLeerraum(input))
  })

  it('indents as layout only and is idempotent', () => {
    expect(formatJson('{"ok":true}').value).toBe('{\n  "ok": true\n}')
    const once = formatJson('{"a":[1,2],"b":{"c":3}}').value
    expect(formatJson(once).value).toBe(once)
    expect(formatJson('{"a":1}', 4).value).toBe('{\n    "a": 1\n}')
  })

  it('rejects comments and a trailing comma, with the position of the first error', () => {
    const comment = formatJson('{"a":1} // weg')
    expect(comment.error).toBe('invalid-json')
    expect(comment.errorAt).not.toBe(null)
    expect(comment.value).toBe('{"a":1} // weg')

    const trailing = formatJson('{\n  "a": 1,\n}')
    expect(trailing.error).toBe('invalid-json')
    expect(trailing.errorAt?.line).toBe(3)
  })

  it('names the position of a broken line', () => {
    const result = formatJson('{\n  "a": 1\n  "b": 2\n}')
    expect(result.error).toBe('invalid-json')
    expect(result.errorAt?.line).toBe(3)
    expect(result.errorAt?.column).toBeGreaterThan(1)
  })

  it('leaves the empty input empty and reports nothing', () => {
    expect(formatJson('')).toEqual({ value: '', error: null, errorAt: null })
    expect(formatJson('   ')).toEqual({ value: '', error: null, errorAt: null })
  })
})
