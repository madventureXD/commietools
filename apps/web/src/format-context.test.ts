import { describe, expect, it } from 'vitest'
import { createFormatContext, deviceTimeZone, formatBytes, formatDateTime, formatNumber, formatTechnicalNumber } from '@commietools/tools'

/**
 * Karte M3-010: Sprache und Region sind getrennt; der Default ist deterministisch und benannt.
 * Abnahme der Karte: „Ausgewählte Sprache es bei Browser de-DE/en-US; große/negative Zahlen,
 * Dezimal-/Gruppentrenner, Bytes und Datumswerte. UI konsistent, JSON/CSS gültig, Kopier-/
 * Exportwerte nicht unbemerkt lokalisiert."
 */
describe('Formatkontext (M3-010)', () => {
  it('trennt Oberflächensprache und Region', () => {
    const de = createFormatContext('es', ['de-DE', 'de'])
    expect(de.uiLocale).toBe('es')
    expect(de.regionLocale).toBe('de-DE')
    const us = createFormatContext('es', ['en-US', 'en'])
    expect(us.regionLocale).toBe('en-US')
  })

  it('bildet ohne Regionssprache einen benannten Default (nicht still navigator)', () => {
    // Browsersprache ohne Region → Oberflächensprache; trägt die auch keine Region → Vorgabe de-DE.
    expect(createFormatContext('es', ['en']).regionLocale).toBe('de-DE')
    expect(createFormatContext('de-DE', []).regionLocale).toBe('de-DE')
    expect(createFormatContext('es', []).regionLocale).toBe('de-DE')
  })

  it('formatiert große und negative Zahlen nach der Region', () => {
    const de = createFormatContext('es', ['de-DE'])
    const us = createFormatContext('de', ['en-US'])
    expect(formatNumber(1234567.5, de)).toBe('1.234.567,5')
    expect(formatNumber(1234567.5, us)).toBe('1,234,567.5')
    expect(formatNumber(-1234567.5, de)).toBe('-1.234.567,5')
    expect(formatNumber(-1234567.5, us)).toBe('-1,234,567.5')
    expect(formatNumber(0.5, de)).toBe('0,5')
  })

  it('formatiert Byte-Angaben mit dem Dezimaltrenner der Region', () => {
    const de = createFormatContext('es', ['de-DE'])
    const us = createFormatContext('de', ['en-US'])
    expect(formatBytes(4608, de)).toBe('4,5 KB')
    expect(formatBytes(4608, us)).toBe('4.5 KB')
    expect(formatBytes(4_800_000, de)).toBe('4,58 MB')
    expect(formatBytes(512, de)).toBe('512 B')
  })

  it('hält technische Ausgaben sprachneutral (Punkt, keine Gruppierung)', () => {
    // JSON, CSS und CSV brauchen den Punkt — sie dürfen nicht mitformatiert werden.
    expect(formatTechnicalNumber(1234.5)).toBe('1234.5')
    expect(formatTechnicalNumber(-0.25)).toBe('-0.25')
    expect(formatTechnicalNumber(0.0000001)).toBe('0.0000001')
    // Keine Gruppierung: der Wert wird ohne Tausenderzeichen ausgegeben (gemessen: ausgeschrieben,
    // nicht in Exponentialschreibweise — JSON selbst schreibt mit `JSON.stringify` und nutzt dafür
    // gar kein `Intl`).
    expect(formatTechnicalNumber(1e21)).toBe('1000000000000000000000')
    expect(formatTechnicalNumber(1e21)).not.toMatch(/,/u)
  })

  it('formatiert Datumswerte nach der Region und nennt die Zeitzone', () => {
    const de = createFormatContext('es', ['de-DE'])
    const wert = new Date('2026-10-07T12:30:00Z')
    expect(formatDateTime(wert, de)).toMatch(/07\.10\.2026|7\. Okt/iu)
    expect(typeof deviceTimeZone()).toBe('string')
    expect(deviceTimeZone().length).toBeGreaterThan(2)
  })
})
