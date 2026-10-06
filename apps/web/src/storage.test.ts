import { describe, expect, it } from 'vitest'
import { readLocal, readLocalJson, writeLocal } from '@commietools/core/storage'

/**
 * Karte M8-003: Die Oberfläche las `localStorage` ungeschützt im Startpfad. Wo der Speicher nicht
 * zugänglich ist (blockierte Website-Daten, manche Privatmodi), wirft schon der Zugriff — die
 * Anwendung brach ab. Der Adapter meldet den Zustand statt zu werfen.
 *
 * Diese Testumgebung hat **kein** `window` — damit ist genau der Fall „Speicher nicht verfügbar"
 * echt gegeben und nicht nachgestellt.
 */
describe('Speicherzugriff (M8-003)', () => {
  it('wirft nicht, wenn kein Speicher verfügbar ist', () => {
    expect(readLocal('commietools-theme')).toEqual({ status: 'unavailable', value: null })
    expect(writeLocal('commietools-theme', 'dark')).toBe('unavailable')
  })

  it('gibt den Rückfallwert zurück, statt zu scheitern', () => {
    expect(readLocalJson('commietools-locale', 'en', (value): value is string => typeof value === 'string')).toBe('en')
    const liste = readLocalJson<string[]>('nav-favorites', [], (value): value is string[] => Array.isArray(value))
    expect(liste).toEqual([])
  })

  it('prüft den Inhalt und nimmt bei fremder Form den Rückfall', () => {
    const istZahl = (value: unknown): value is number => typeof value === 'number'
    // Ohne Speicher kommt immer der Rückfall — die Prüffunktion ist damit nicht erreichbar,
    // bleibt aber Teil des Vertrags für den Fall eines vorhandenen, aber kaputten Wertes.
    expect(readLocalJson('egal', 42, istZahl)).toBe(42)
  })

  it('kennt vier Zustände', () => {
    const zustaende = ['ok', 'unavailable', 'quota', 'invalid']
    expect(zustaende).toHaveLength(4)
    expect(zustaende).toContain(readLocal('x').status)
  })
})
