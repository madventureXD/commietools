import { describe, expect, it } from 'vitest'
import { toolManifests } from '@commietools/tools'
import { rendererFor, toolRenderers } from './App'

/**
 * **Jede Werkzeug-ID hat genau eine Zuordnung** (QM-Karte M4-010, Stufe R9).
 *
 * Die Karte verlangt: keine fachfremde Voreinstellung, sondern eine Vollständigkeitsprüfung; eine
 * unbekannte Adresse darf **nicht** `pdf-redact` öffnen, und eine bekannte ID ohne Zuordnung muss
 * als Konfigurationsfehler auffallen. Die Typprüfung (`satisfies Record<ToolId, …>`) fängt eine
 * fehlende Zuordnung schon beim Übersetzen; diese Prüfung hält dieselbe Aussage zur Laufzeit fest —
 * und zählt die IDs aus dem Register, nicht aus einer Liste in der Prüfung.
 */
const registerIds = toolManifests.map((tool) => tool.id)

describe('M4-010: Routenzuordnung ist vollständig', () => {
  it('enthält 62 Werkzeuge (Zahl aus dem Register, nicht abgeschrieben)', () => {
    expect(registerIds).toHaveLength(62)
    expect(new Set(registerIds).size).toBe(62)
  })

  it('jede Werkzeug-ID des Registers hat eine Komponente', () => {
    const ohneZuordnung = registerIds.filter((id) => rendererFor(id) === undefined)
    expect(ohneZuordnung).toEqual([])
  })

  it('die Zuordnung kennt keine ID, die im Register fehlt', () => {
    const bekannt = new Set(registerIds)
    expect(Object.keys(toolRenderers).filter((id) => !bekannt.has(id))).toEqual([])
  })

  it('unbekannte Adressen bekommen keine Komponente — kein fachfremdes Werkzeug', () => {
    expect(rendererFor('nicht-vorhanden')).toBeUndefined()
    expect(rendererFor('')).toBeUndefined()
    expect(rendererFor('PDF-MERGE')).toBeUndefined()
  })

  it('die Objektvorlage liefert nichts (kein Blick auf Prototyp-Schlüssel)', () => {
    expect(rendererFor('constructor')).toBeUndefined()
    expect(rendererFor('toString')).toBeUndefined()
    expect(rendererFor('__proto__')).toBeUndefined()
    expect(rendererFor('hasOwnProperty')).toBeUndefined()
  })

  it('die frühere Rückfallstelle ist jetzt eine reguläre Zuordnung', () => {
    expect(rendererFor('pdf-redact')).toBeDefined()
    expect(Object.hasOwn(toolRenderers, 'pdf-redact')).toBe(true)
  })
})
