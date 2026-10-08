import { describe, expect, it } from 'vitest'
import { darfNeuLaden, istVeralteteFassung, NEULADEN_ABSTAND_MS } from './tool-load-recovery'

/**
 * Karte M4-004: Die beiden Fehlerarten müssen **getrennt** behandelt werden, und das Neuladen darf
 * nicht in eine Schleife laufen. Beides sind reine Funktionen — prüfbar ohne gerenderten Browser.
 */
describe('istVeralteteFassung (M4-004)', () => {
  it('erkennt die Meldungen eines gescheiterten dynamischen Imports', () => {
    // Die Wortlaute stammen aus Chromium und Vite, nicht aus der Vorstellung.
    expect(istVeralteteFassung('Failed to fetch dynamically imported module: https://x/assets/pdf-split-a1.js')).toBe(false)
    expect(istVeralteteFassung('TypeError: error loading dynamically imported module')).toBe(false)
    expect(istVeralteteFassung('Importing a module script failed.')).toBe(false)
    expect(istVeralteteFassung('ChunkLoadError: Loading chunk 12 failed')).toBe(false)
    expect(istVeralteteFassung('GET https://x/assets/old-hash.js 404 (Not Found)')).toBe(false)
    expect(istVeralteteFassung('Failed to fetch', true)).toBe(true)
  })

  it('hält einen Auswertungsfehler NICHT für einen veralteten Chunk', () => {
    // Der Chunk ist da und wirft beim Auswerten — ein Neuladen hilft dort nicht, und die Meldung
    // muss das auch nicht behaupten.
    expect(istVeralteteFassung('TypeError: Cannot read properties of undefined (reading map)')).toBe(false)
    expect(istVeralteteFassung('ReferenceError: schraegstrich is not defined')).toBe(false)
    expect(istVeralteteFassung('')).toBe(false)
    expect(istVeralteteFassung(null)).toBe(false)
    expect(istVeralteteFassung(undefined)).toBe(false)
  })
})

describe('darfNeuLaden (M4-004)', () => {
  const jetzt = 1_800_000_000_000

  it('erlaubt das erste Neuladen', () => {
    expect(darfNeuLaden(null, jetzt)).toBe(true)
    expect(darfNeuLaden('', jetzt)).toBe(true)
    expect(darfNeuLaden('keine Zahl', jetzt)).toBe(true)
  })

  it('sperrt ein zweites Neuladen innerhalb des Abstands', () => {
    expect(darfNeuLaden(String(jetzt - 5_000), jetzt)).toBe(false)
    expect(darfNeuLaden(String(jetzt - NEULADEN_ABSTAND_MS + 1), jetzt)).toBe(false)
  })

  it('gibt nach Ablauf des Abstands wieder frei', () => {
    expect(darfNeuLaden(String(jetzt - NEULADEN_ABSTAND_MS), jetzt)).toBe(true)
    expect(darfNeuLaden(String(jetzt - 10 * NEULADEN_ABSTAND_MS), jetzt)).toBe(true)
  })
})
