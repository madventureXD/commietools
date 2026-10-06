import { describe, expect, it } from 'vitest'
import { LANGUAGE_PACK_PATTERN, languagePackUrls } from './pwaWarmCache'

/**
 * Karte M8-002: Der Warmlauf darf **nur** die Sprachpakete anfassen. Ein zu weites Muster würde
 * Startbündel oder Werkzeug-Engines mitziehen und damit Datensparsamkeit und Budget verletzen.
 */
describe('Sprachpakete für den Warmlauf auswählen', () => {
  const start = [
    'http://localhost:4173/assets/index-CUwse5DD.js',
    'http://localhost:4173/assets/ui-en-zjLg7ZHU.js',
    'http://localhost:4173/assets/ui-de-TiS8QJyj.js',
    'http://localhost:4173/assets/search-en-B19y3lpY.js',
    'http://localhost:4173/assets/search-de-gEeq6FeQ.js',
    'http://localhost:4173/assets/tools-en-common-DUsgfIKt.js',
    'http://localhost:4173/assets/tools-de-common-CjKD_mG8.js',
    'http://localhost:4173/assets/tools-en-calculator-3Z_StFyp.js',
    'http://localhost:4173/assets/tools-de-calculator-BQXPdwM6.js',
    'http://localhost:4173/assets/catalog-base-BPHs9pGK.js',
    'http://localhost:4173/assets/index-BinmLAiT.css',
    'http://localhost:4173/assets/pdf-YYBQA8p7.js',
    'http://localhost:4173/assets/engine-COb99Vos.js',
    'http://localhost:4173/manifest.webmanifest',
    'http://localhost:4173/icon.svg'
  ]

  it('findet genau die acht Sprachpakete dieses Starts', () => {
    const gefunden = languagePackUrls(start)
    expect(gefunden).toHaveLength(8)
    expect(gefunden).toContain('http://localhost:4173/assets/ui-en-zjLg7ZHU.js')
    expect(gefunden).toContain('http://localhost:4173/assets/tools-de-calculator-BQXPdwM6.js')
  })

  it('lässt Startbündel, Katalogbasis, Engines und Fremddateien unangetastet', () => {
    const gefunden = languagePackUrls(start)
    for (const nicht of [
      'http://localhost:4173/assets/index-CUwse5DD.js',
      'http://localhost:4173/assets/catalog-base-BPHs9pGK.js',
      'http://localhost:4173/assets/pdf-YYBQA8p7.js',
      'http://localhost:4173/assets/engine-COb99Vos.js',
      'http://localhost:4173/assets/index-BinmLAiT.css',
      'http://localhost:4173/manifest.webmanifest',
      'http://localhost:4173/icon.svg'
    ]) {
      expect(gefunden, nicht).not.toContain(nicht)
    }
  })

  it('nennt jede Adresse nur einmal', () => {
    expect(languagePackUrls([...start, ...start])).toHaveLength(8)
  })

  it('nimmt keine fremde Sprache mit, die gar nicht geladen wurde', () => {
    // Nur die aktive Sprache und Englisch sind im Start — Spanisch darf nicht auftauchen.
    expect(languagePackUrls(start).some((u) => u.includes('ui-es-'))).toBe(false)
  })

  it('erkennt auch regionale Sprachkürzel und Ausnahmen nicht als Paket', () => {
    expect(LANGUAGE_PACK_PATTERN.test('/assets/ui-pt-BR-a1b2c3.js')).toBe(true)
    // Eine Engine mit ähnlichem Anfang ist kein Sprachpaket.
    expect(LANGUAGE_PACK_PATTERN.test('/assets/pdf-YYBQA8p7.js')).toBe(false)
    expect(LANGUAGE_PACK_PATTERN.test('/assets/search-locale-tool.js')).toBe(false)
  })
})
