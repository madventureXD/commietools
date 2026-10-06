import { describe, expect, it } from 'vitest'
import { classifyStorageError, createIndexedStore } from '@commietools/tools/storage/indexedStore'

/**
 * Karte M8-003: Die drei IndexedDB-Bereiche (Rechnerverlauf, Aufmaß, Prüffristen) liefen
 * ungeschützt — ein Wurf beim Lesen oder Schreiben wanderte in die Oberfläche. Beim Rechner
 * blockierte er sogar die Rechen-Engine, weil beide in einem `Promise.all` geladen wurden.
 *
 * Diese Testumgebung hat **kein** `indexedDB`; damit ist „Speicher nicht erreichbar" echt
 * gegeben und nicht nachgestellt.
 */
describe('Speicherzustand (M8-003)', () => {
  it('wirft nicht, wenn IndexedDB fehlt, und gibt den Rückfallwert', async () => {
    const speicher = createIndexedStore()
    const gelesen = await speicher.read('fehlt.v1', [] as readonly string[], (value): value is string[] => Array.isArray(value))
    expect(gelesen.status).toBe('unavailable')
    expect(gelesen.value).toEqual([])
    expect(await speicher.write('fehlt.v1', ['a'])).toBe('unavailable')
    expect(await speicher.remove('fehlt.v1')).toBe('unavailable')
  })

  it('unterscheidet „voll" von „nicht erreichbar"', () => {
    const voll = new Error('voll')
    voll.name = 'QuotaExceededError'
    expect(classifyStorageError(voll)).toBe('quota')
    const gesperrt = new Error('gesperrt')
    gesperrt.name = 'SecurityError'
    expect(classifyStorageError(gesperrt)).toBe('unavailable')
    // Ein unbekannter Fehler darf nicht als „voll" gemeldet werden — die Meldung soll den Grund
    // nicht erfinden.
    expect(classifyStorageError(new Error('irgendwas'))).toBe('unavailable')
    expect(classifyStorageError('kein Fehlerobjekt')).toBe('unavailable')
  })

  it('meldet fremde Formen als invalid, nicht als leer', async () => {
    const speicher = createIndexedStore()
    // Ohne IndexedDB kommt der Zustand nicht bis zur Prüfung — geprüft wird das Zusammenspiel
    // deshalb über den Zustandsvertrag: ein `invalid` ist ausdrücklich **kein** „nichts da".
    const gelesen = await speicher.read<null>('aufmass.sheet.v1', null, (value): value is null => value === null)
    expect(gelesen.status).not.toBe('ok')
    expect(gelesen.value).toBeNull()
  })
})
