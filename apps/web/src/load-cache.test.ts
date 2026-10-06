import { describe, expect, it } from 'vitest'
import { cachedLoader } from '@commietools/core/loadCache'

/**
 * Karte M4-004: Ein abgelehnter Import lag für immer im Zwischenspeicher — der nächste Versuch
 * bekam sofort wieder den Fehler und lud nie neu. `cachedLoader` entfernt die Ablehnung, aber nur,
 * wenn es noch der aktuelle Eintrag ist.
 */
describe('cachedLoader (M4-004)', () => {
  it('lädt nach einer Ablehnung beim nächsten Versuch wirklich neu', async () => {
    const cache = new Map<string, Promise<string>>()
    let versuche = 0
    const laden = () => {
      versuche += 1
      return versuche === 1 ? Promise.reject(new Error('Netz weg')) : Promise.resolve('da')
    }
    await expect(cachedLoader(cache, 'de', laden)).rejects.toThrow('Netz weg')
    // Ohne das Aufräumen käme hier sofort wieder die Ablehnung — und `versuche` bliebe 1.
    await expect(cachedLoader(cache, 'de', laden)).resolves.toBe('da')
    expect(versuche).toBe(2)
  })

  it('lädt einen Erfolg nur einmal', async () => {
    const cache = new Map<string, Promise<string>>()
    let versuche = 0
    const laden = () => {
      versuche += 1
      return Promise.resolve('da')
    }
    expect(await cachedLoader(cache, 'de', laden)).toBe('da')
    expect(await cachedLoader(cache, 'de', laden)).toBe('da')
    expect(versuche).toBe(1)
  })

  it('lässt einen späten Fehlschlag nicht den Erfolg eines neueren Versuchs löschen', async () => {
    const cache = new Map<string, Promise<string>>()
    let ablehnen: (error: Error) => void = () => {}
    const alt = new Promise<string>((_, reject) => {
      ablehnen = reject
    })
    cachedLoader(cache, 'de', () => alt)
    // Der neuere Versuch hat den Eintrag ersetzt (etwa nach einem Sprach- oder Netzwechsel).
    const neuer = Promise.resolve('neu')
    cache.set('de', neuer)
    // Jetzt trifft die Ablehnung des alten Versuchs ein.
    ablehnen(new Error('alt'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(cache.get('de')).toBe(neuer)
  })
})
