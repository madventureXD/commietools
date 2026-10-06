import { describe, expect, it } from 'vitest'
import {
  KERN_D1_FAKTOR,
  THREAD_SIZE_LABELS,
  THREAD_SIZES,
  coreDiameter,
  coreDiameterShown,
  coreHoleDrill,
  coreHoleRaw,
  findThreadSize,
  passageHole,
  planThreads,
  threadLimits,
  torqueRange,
  wrenchWidth,
  type ThreadInput
} from '@commietools/tools/craft/threads'

/** Vollständige, gültige Eingabe für M10 — Ausgangspunkt für die Grenzfälle. */
const eingabe = (patch: Partial<ThreadInput> = {}): ThreadInput => ({
  sizeLabel: 'M10',
  pitch: 1.5,
  coreHole: 8.5,
  coreDiameter: 8.4,
  passageHole: 11,
  wrench: 16,
  torqueMin: 48,
  torqueMax: 54,
  ...patch
})

describe('Gewinde — Kernloch als Rechenregel', () => {
  it('rechnet Ø Kernloch = Nenndurchmesser − Steigung', () => {
    expect(coreHoleRaw(10, 1.5)).toBeCloseTo(8.5, 6)
    expect(coreHoleRaw(8, 1.25)).toBeCloseTo(6.75, 6)
    expect(coreHoleRaw(30, 3.5)).toBeCloseTo(26.5, 6)
  })

  it('trifft die in der Belegsammlung genannten Tabellenwerte (Gegenprobe)', () => {
    // Die Rechnung ist die Grundlage, der Tabellenwert nur die Gegenprobe: Beide müssen
    // übereinstimmen, sonst ist entweder die Regel oder die Datenlage falsch.
    const mitTabelle = THREAD_SIZES.filter((size) => size.coreHoleTable !== null)
    expect(mitTabelle.length).toBe(15)
    for (const size of mitTabelle) {
      expect(coreHoleDrill(size.d, size.coarsePitch)).toBeCloseTo(size.coreHoleTable as number, 6)
    }
  })

  it('rundet die beiden exakten Halbschritte zur geraden Nachkommastelle', () => {
    // M8: 8 − 1,25 = 6,75 → 6,8 (auf). M12: 12 − 1,75 = 10,25 → 10,2 (ab).
    expect(coreHoleDrill(8, 1.25)).toBeCloseTo(6.8, 6)
    expect(coreHoleDrill(12, 1.75)).toBeCloseTo(10.2, 6)
    // Kaufmännisches Runden hätte bei M12 aufgerundet — der Grund für die eigene Rundung.
    expect(Math.round(10.25 * 10) / 10).toBeCloseTo(10.3, 6)
  })
})

describe('Gewinde — Kerndurchmesser D1', () => {
  it('rechnet D1 = d − 1,0826 · P', () => {
    // M10: 10 − 1,0826 · 1,5 = 8,3761 mm — theoretischer Wert, nicht der Bohrerdurchmesser.
    expect(coreDiameter(10, 1.5)).toBeCloseTo(8.3761, 4)
    expect(coreDiameter(10, 1.5)).toBeCloseTo(10 - KERN_D1_FAKTOR * 1.5, 10)
    expect(coreDiameter(6, 1)).toBeCloseTo(4.9174, 4)
  })

  it('rundet D1 für die Anzeige auf zwei Nachkommastellen', () => {
    // Belegt im Browser-Beleg: ungerundet stand im Feld „8,376100000000001“.
    expect(coreDiameterShown(10, 1.5)).toBe(8.38)
    expect(String(coreDiameterShown(10, 1.5))).toBe('8.38')
    expect(coreDiameterShown(12, 1.75)).toBe(10.11)
    // Die Rechenfunktion bleibt ungerundet — nur die Anzeige rundet.
    expect(coreDiameter(10, 1.5)).not.toBe(coreDiameterShown(10, 1.5))
  })
})

describe('Gewinde — Feingewinde', () => {
  it('führt die belegten Feingewinde-Steigungen je Größe', () => {
    expect(findThreadSize('M10')?.finePitches).toEqual([1.25, 1, 0.75])
    expect(findThreadSize('M8')?.finePitches).toEqual([1, 0.75])
    expect(findThreadSize('M12')?.finePitches).toEqual([1.5, 1.25, 1])
    expect(findThreadSize('M30')?.finePitches).toEqual([2, 1.5])
  })

  it('lässt Größen ohne belegtes Feingewinde leer, statt eines zu erfinden', () => {
    expect(findThreadSize('M3')?.finePitches).toEqual([])
    expect(findThreadSize('M9')?.finePitches).toEqual([])
  })

  it('rechnet das Kernloch auch mit einer Feingewinde-Steigung', () => {
    expect(coreHoleDrill(10, 1)).toBeCloseTo(9, 6)
    expect(coreHoleDrill(12, 1.5)).toBeCloseTo(10.5, 6)
  })
})

describe('Gewinde — Schlüsselweiten, beide Reihen getrennt', () => {
  it('führt die aktuelle und die alte DIN-Reihe getrennt', () => {
    const m10 = findThreadSize('M10')
    const m12 = findThreadSize('M12')
    const m22 = findThreadSize('M22')
    expect(m10 && wrenchWidth(m10, 'iso')).toBe(16)
    expect(m10 && wrenchWidth(m10, 'din')).toBe(17)
    expect(m12 && wrenchWidth(m12, 'iso')).toBe(18)
    expect(m12 && wrenchWidth(m12, 'din')).toBe(19)
    // M22 ist der bewusst benannte Widerspruch: neu größer als alt.
    expect(m22 && wrenchWidth(m22, 'iso')).toBe(34)
    expect(m22 && wrenchWidth(m22, 'din')).toBe(32)
  })

  it('gibt die alte Reihe nur dort an, wo sie abweicht', () => {
    const m6 = findThreadSize('M6')
    expect(m6 && wrenchWidth(m6, 'iso')).toBe(10)
    expect(m6 && wrenchWidth(m6, 'din')).toBeNull()
  })
})

describe('Gewinde — Anzugsmoment als Spanne', () => {
  it('nennt die belegten Grenzen als Spanne, nicht als Einzelwert', () => {
    expect(torqueRange(findThreadSize('M10')!, '8.8')).toMatchObject({ minNm: 48, maxNm: 54 })
    expect(torqueRange(findThreadSize('M8')!, '8.8')).toMatchObject({ minNm: 24, maxNm: 27 })
    expect(torqueRange(findThreadSize('M10')!, '10.9')).toMatchObject({ minNm: 67, maxNm: 79 })
  })

  it('gibt nichts zurück, wo kein Anzugsmoment belegt ist', () => {
    expect(torqueRange(findThreadSize('M14')!, '8.8')).toBeNull()
    expect(torqueRange(findThreadSize('M3')!, '8.8')).toBeNull()
  })

  it('kennzeichnet eine Spanne aus nur einer Quelle als Einzelwert', () => {
    const spanne = torqueRange(findThreadSize('M30')!, '8.8')
    expect(spanne?.single).toBe(true)
    expect(spanne?.minNm).toBe(spanne?.maxNm)
  })
})

describe('Gewinde — Durchgangsloch', () => {
  it('führt die mittlere Reihe und die feine Reihe getrennt', () => {
    const m10 = findThreadSize('M10')
    expect(m10 && passageHole(m10, 'medium')).toBe(11)
    expect(m10 && passageHole(m10, 'fine')).toBe(10.5)
  })

  it('lässt Größen ohne belegten Wert leer', () => {
    const m22 = findThreadSize('M22')
    expect(m22 && passageHole(m22, 'medium')).toBeNull()
  })
})

describe('Gewinde — Auswahl und Kennungen', () => {
  it('führt jede belegte Nenngröße genau einmal', () => {
    expect(THREAD_SIZE_LABELS.length).toBe(THREAD_SIZES.length)
    expect(new Set(THREAD_SIZE_LABELS).size).toBe(THREAD_SIZE_LABELS.length)
    expect(THREAD_SIZE_LABELS).toContain('M10')
  })

  it('weist eine unbekannte Größe sauber ab, statt einen Wert zu raten', () => {
    expect(findThreadSize('M99')).toBeUndefined()
    expect(findThreadSize('')).toBeUndefined()
  })
})

describe('Gewinde — Grenzen (jede aus threadLimits einmal)', () => {
  it('nimmt eine vollständige Eingabe an', () => {
    expect(planThreads(eingabe())).toEqual({ ok: true, size: findThreadSize('M10') })
  })

  it('fragt jede Grenze des Objekts wirklich ab', () => {
    const felder = Object.keys(threadLimits).sort()
    expect(felder).toEqual(['coreDiameter', 'coreHole', 'passageHole', 'pitch', 'torque', 'wrench'])
  })

  it('meldet eine Steigung außerhalb der Grenzen', () => {
    const check = planThreads(eingabe({ pitch: threadLimits.pitch.max + 1 }))
    expect(check.ok).toBe(false)
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.pitch')
  })

  it('meldet ein Kernloch außerhalb der Grenzen', () => {
    const check = planThreads(eingabe({ coreHole: threadLimits.coreHole.max + 1 }))
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.coreHole')
    const unten = planThreads(eingabe({ coreHole: threadLimits.coreHole.min - 0.1 }))
    expect(unten.ok === false && unten.errorKey).toBe('tool.threads.error.coreHole')
  })

  it('meldet einen Kerndurchmesser außerhalb der Grenzen', () => {
    const check = planThreads(eingabe({ coreDiameter: threadLimits.coreDiameter.max + 1 }))
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.coreDiameter')
  })

  it('meldet ein Durchgangsloch außerhalb der Grenzen', () => {
    const check = planThreads(eingabe({ passageHole: threadLimits.passageHole.min - 0.1 }))
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.passageHole')
  })

  it('meldet eine Schlüsselweite außerhalb der Grenzen', () => {
    const check = planThreads(eingabe({ wrench: threadLimits.wrench.max + 1 }))
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.wrench')
  })

  it('meldet ein Anzugsmoment außerhalb der Grenzen', () => {
    const oben = planThreads(eingabe({ torqueMax: threadLimits.torque.max + 1 }))
    expect(oben.ok === false && oben.errorKey).toBe('tool.threads.error.torque')
    const unten = planThreads(eingabe({ torqueMin: threadLimits.torque.min - 0.05 }))
    expect(unten.ok === false && unten.errorKey).toBe('tool.threads.error.torque')
  })

  it('meldet eine verdrehte Momentenspanne', () => {
    const check = planThreads(eingabe({ torqueMin: 100, torqueMax: 50 }))
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.torqueOrder')
  })
})

describe('Gewinde — ungültige Eingabe', () => {
  it('weist eine unbekannte Nenngröße ab', () => {
    const check = planThreads(eingabe({ sizeLabel: 'M99' }))
    expect(check.ok === false && check.errorKey).toBe('tool.threads.error.unknownSize')
    const leer = planThreads(eingabe({ sizeLabel: '' }))
    expect(leer.ok === false && leer.errorKey).toBe('tool.threads.error.unknownSize')
  })

  it('weist leere Zahlenfelder als leer ab, nicht als Grenzfehler', () => {
    const check = planThreads(eingabe({ coreHole: Number.NaN }))
    expect(check.ok === false && check.errorKey).toBe('tool.craft.error.empty')
  })
})
