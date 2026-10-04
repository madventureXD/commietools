import { describe, expect, it } from 'vitest'
import {
  computeDocument,
  computePosition,
  computeRow,
  documentStats,
  evaluateMeasure,
  formatMeasure,
  localizeNumber,
  parseMeasureNumber,
  toCsv,
  toText,
  type AufmassDocument,
  type AufmassSection,
  type ExportOptions
} from '@commietools/tools/calculator/aufmass'

const section = (overrides: Partial<AufmassSection>): AufmassSection => ({
  id: 'sec',
  label: '',
  rows: [],
  positions: [],
  ...overrides
})

const document = (overrides: Partial<AufmassDocument>): AufmassDocument => ({
  title: '',
  client: '',
  sections: [],
  ...overrides
})

const options: ExportOptions = {
  delimiter: ';',
  decimal: ',',
  thousands: '.',
  labels: {
    title: 'Aufmaß',
    client: 'Auftraggeber',
    section: 'Abschnitt',
    quantity: 'Menge',
    unit: 'Einheit',
    unitPrice: 'Einzelpreis',
    amount: 'Betrag',
    measure: 'Aufmaßzeilen',
    sum: 'Zwischensumme',
    total: 'Gesamtbetrag',
    expression: 'Maßkette'
  }
}

describe('Maßketten-Auswerter', () => {
  it('rechnet die vier Grundrechenarten und die Zeichen × ÷ ·', () => {
    expect(evaluateMeasure('3 + 4').display).toBe('7.000')
    expect(evaluateMeasure('10 - 2,5').display).toBe('7.500')
    expect(evaluateMeasure('3,50 × 2,80').display).toBe('9.800')
    expect(evaluateMeasure('9 ÷ 2').display).toBe('4.500')
    expect(evaluateMeasure('2 · 3').display).toBe('6.000')
  })

  it('hält die Vorrangregel ein — Punkt vor Strich', () => {
    // Unabhängig nachgerechnet: 2 + 3 · 4 = 14, nicht 20.
    expect(evaluateMeasure('2 + 3 * 4').display).toBe('14.000')
    // (2 + 3) · 4 = 20
    expect(evaluateMeasure('(2 + 3) * 4').display).toBe('20.000')
    // 2 · 3² ist hier nicht vorgesehen; aber Punkt vor Strich gilt auch rechts: 2 · 3 + 4 = 10
    expect(evaluateMeasure('2 * 3 + 4').display).toBe('10.000')
  })

  it('wertet Klammern und unäre Vorzeichen richtig aus', () => {
    expect(evaluateMeasure('2 × (2,40 + 1,80)').display).toBe('8.400')
    expect(evaluateMeasure('-(3 + 4) + 10').display).toBe('3.000')
    expect(evaluateMeasure('3 * -2 + 10').display).toBe('4.000')
  })

  it('liest Komma als Dezimaltrennzeichen und den Punkt vor drei Ziffern als Tausenderpunkt', () => {
    expect(parseMeasureNumber('3,50')).toBe(3_500_000_000_000n)
    expect(parseMeasureNumber('1.234')).toBe(1_234_000_000_000_000n)
    expect(parseMeasureNumber('3.50')).toBe(3_500_000_000_000n)
    // Nicht darstellbar: mehr als zwölf Nachkommastellen
    expect(parseMeasureNumber('3,1234567890123')).toBeNull()
    // Maße sind nie negativ
    expect(parseMeasureNumber('-3')).toBeNull()
  })

  it('rundet auf drei Nachkommastellen für Maße', () => {
    expect(evaluateMeasure('1 ÷ 3').display).toBe('0.333')
    expect(formatMeasure(123_456_000_000n, 3)).toBe('0.123')
    expect(formatMeasure(0n, 2)).toBe('0.00')
  })

  it('meldet die Fehlerfälle als Codes statt als Zahl', () => {
    expect(evaluateMeasure('')).toMatchObject({ ok: false, error: 'empty' })
    expect(evaluateMeasure('   ')).toMatchObject({ ok: false, error: 'empty' })
    expect(evaluateMeasure('(3 + 4')).toMatchObject({ ok: false, error: 'syntax' })
    expect(evaluateMeasure('3 + ')).toMatchObject({ ok: false, error: 'syntax' })
    expect(evaluateMeasure('3 + abc')).toMatchObject({ ok: false, error: 'syntax' })
    expect(evaluateMeasure('10 ÷ 0')).toMatchObject({ ok: false, error: 'zeroDivisor' })
    expect(evaluateMeasure('-5')).toMatchObject({ ok: false, error: 'range' })
    // `3 -- 4` ist 3 − (−4) = 7 — ein doppeltes Minus ist kein Fehler, sondern Rechnung.
    expect(evaluateMeasure('3 -- 4').display).toBe('7.000')
    expect(evaluateMeasure('1'.repeat(600))).toMatchObject({ ok: false, error: 'range' })
  })

  it('im Gegensatz zum Rechner ist eine geteilte Maßkette exakt bis zur Anzeigestelle', () => {
    // 1 ÷ 3 ist als Maß 0,333 m — die Probe muss auf die Anzeigestelle genau stimmen.
    const third = evaluateMeasure('1 ÷ 3')
    expect(third.ok).toBe(true)
    expect(evaluateMeasure('0,333 × 3').display).toBe('0.999')
  })
})

describe('Aufmaßzeilen und Positionen', () => {
  it('zeigt das Ergebnis einer Zeile mit Einheit und Fehler', () => {
    const good = computeRow({ id: 'r1', label: 'Wand', expression: '3,50 × 2,80', unit: 'm2' })
    expect(good.error).toBeNull()
    expect(good.display).toBe('9.800')

    const broken = computeRow({ id: 'r2', label: 'Wand', expression: '(3,50', unit: 'm2' })
    expect(broken.error).toBe('syntax')
    expect(broken.value).toBeNull()
  })

  it('nimmt die Menge aus der Aufmaßzeile und behält den Rechenweg', () => {
    const rows = [{ id: 'r1', label: 'Wand', expression: '3,50 × 2,80', unit: 'm2' as const }]
    const position = computePosition(
      { id: 'p1', label: 'Putz', quantity: '0', sourceRowId: 'r1', unit: 'm2', unitPrice: '12,50' },
      rows
    )
    expect(position.quantityDisplay).toBe('9.800')
    // Unabhängig nachgerechnet: 9,8 m² · 12,50 € = 122,50 €
    expect(position.amountDisplay).toBe('122.50')
    expect(position.sourceExpression).toBe('3,50 × 2,80')
  })

  it('rechnet eine Position aus der eingetragenen Menge', () => {
    const position = computePosition(
      { id: 'p1', label: 'Tür', quantity: '3', sourceRowId: null, unit: 'stk', unitPrice: '89,90' },
      []
    )
    // 3 · 89,90 = 269,70
    expect(position.amountDisplay).toBe('269.70')
    expect(position.sourceExpression).toBeNull()
  })

  it('meldet eine fehlende Menge, statt still null zu rechnen', () => {
    const missing = computePosition(
      { id: 'p1', label: 'Tür', quantity: '', sourceRowId: null, unit: 'stk', unitPrice: '89,90' },
      []
    )
    expect(missing.error).toBe('empty')
    expect(missing.amountDisplay).toBe('')

    const noPrice = computePosition(
      { id: 'p2', label: 'Tür', quantity: '3', sourceRowId: null, unit: 'stk', unitPrice: '' },
      []
    )
    expect(noPrice.error).toBe('invalid')
    expect(noPrice.amountDisplay).toBe('')
  })

  it('verweist auf eine gelöschte Quelle als Fehler, nicht als Zufallszahl', () => {
    const orphan = computePosition(
      { id: 'p1', label: 'Putz', quantity: '5', sourceRowId: 'weg', unit: 'm2', unitPrice: '10' },
      []
    )
    expect(orphan.error).toBe('invalid')
  })
})

describe('Summen — je Einheit getrennt', () => {
  it('addiert Flächen, Längen und Stückzahlen nicht über Einheiten hinweg', () => {
    const computed = computeDocument(document({
      sections: [
        section({
          id: 's1',
          rows: [
            { id: 'r1', label: 'Wand', expression: '3,50 × 2,80', unit: 'm2' },
            { id: 'r2', label: 'Sockel', expression: '2 × (2,40 + 1,80)', unit: 'm' },
            { id: 'r3', label: 'Leiste', expression: '4,20', unit: 'm' }
          ],
          positions: [
            { id: 'p1', label: 'Putz', quantity: '0', sourceRowId: 'r1', unit: 'm2', unitPrice: '12,50' },
            { id: 'p2', label: 'Farbe', quantity: '2', sourceRowId: null, unit: 'stk', unitPrice: '24,90' }
          ]
        })
      ]
    }))

    expect(computed.totalsByUnit.m2).toBe('9.800')
    // 8,4 + 4,2 = 12,6 m — hier addieren sich zwei Längen, das ist zulässig.
    expect(computed.totalsByUnit.m).toBe('12.600')
    expect(computed.totalsByUnit.stk).toBeUndefined()
    // Es gibt keinen gemeinsamen Mengenwert über die Einheiten hinweg.
    expect(Object.keys(computed.totalsByUnit).sort()).toEqual(['m', 'm2'])
  })

  it('summiert Beträge je Abschnitt und in der Gesamtsumme', () => {
    const computed = computeDocument(document({
      sections: [
        section({
          id: 's1',
          positions: [
            { id: 'p1', label: 'A', quantity: '3', sourceRowId: null, unit: 'm2', unitPrice: '10' },
            { id: 'p2', label: 'B', quantity: '0,5', sourceRowId: null, unit: 'm2', unitPrice: '20' }
          ]
        }),
        section({
          id: 's2',
          positions: [{ id: 'p3', label: 'C', quantity: '1', sourceRowId: null, unit: 'stk', unitPrice: '100,05' }]
        })
      ]
    }))

    // 30,00 + 10,00 = 40,00 · 100,05 · zusammen 140,05
    expect(computed.sectionTotals.s1).toBe('40.00')
    expect(computed.sectionTotals.s2).toBe('100.05')
    expect(computed.totalAmount).toBe('140.05')
  })

  it('lässt fehlerhafte Zeilen aus der Summe heraus, ohne sie zu verstecken', () => {
    const computed = computeDocument(document({
      sections: [
        section({
          id: 's1',
          rows: [
            { id: 'r1', label: 'gut', expression: '1 + 1', unit: 'm' },
            { id: 'r2', label: 'kaputt', expression: '1 + ', unit: 'm' }
          ]
        })
      ]
    }))
    expect(computed.totalsByUnit.m).toBe('2.000')
    expect(documentStats(computed).broken).toBe(1)
  })

  it('kommt mit einem leeren Blatt zurecht', () => {
    const computed = computeDocument(document({}))
    expect(computed.totalAmount).toBe('0.00')
    expect(computed.totalsByUnit).toEqual({})
    expect(documentStats(computed)).toEqual({ sections: 0, rows: 0, positions: 0, broken: 0 })
  })
})

describe('Ausgabe', () => {
  const computed = computeDocument(document({
    title: 'Bad EG',
    client: 'Familie Müller',
    sections: [
      section({
        id: 's1',
        label: 'Bad',
        rows: [{ id: 'r1', label: 'Wandfläche', expression: '3,50 × 2,80', unit: 'm2' }],
        positions: [
          { id: 'p1', label: 'Putz', quantity: '0', sourceRowId: 'r1', unit: 'm2', unitPrice: '12,50' }
        ]
      })
    ]
  }))

  it('gibt eine CSV mit Rechenweg und Trennzeichen der Sprache aus', () => {
    const csv = toCsv(computed, options)
    expect(csv).toContain('Bad EG')
    expect(csv).toContain('Familie Müller')
    // Der Rechenweg steht in der Datei — das Blatt bleibt nachrechenbar.
    expect(csv).toContain('3,50 × 2,80 = 9,800')
    expect(csv).toContain('12,50')
    expect(csv).toContain('122,50')
    expect(csv.split('\r\n')[0]).toBe('Bad EG')
  })

  it('quotet Felder mit Trennzeichen, aber kein Dezimalkomma', () => {
    const withDelimiter = computeDocument(document({
      sections: [section({ id: 's1', rows: [{ id: 'r1', label: 'Wand; innen', expression: '1', unit: 'm' }] })]
    }))
    const csv = toCsv(withDelimiter, options)
    expect(csv).toContain('"Wand; innen"')
    // 9,800 ist ein Dezimalwert, kein Trennzeichenkonflikt — er darf unquoted bleiben.
    expect(toCsv(computed, options)).toContain(';9,800')
  })

  it('gibt den Text mit Einheit, Quelle und Betrag aus', () => {
    const text = toText(computed, options, (unit) => `[${unit}]`)
    expect(text).toContain('Wandfläche: 3,50 × 2,80 = 9,800 [m2]')
    expect(text).toContain('Putz: 9,800 [m2] (3,50 × 2,80) × 12,50 = 122,50')
    expect(text).toContain('Gesamtbetrag: 122,50')
  })

  it('bringt Zahlen in die Schreibweise der Sprache', () => {
    expect(localizeNumber('1234.5', options)).toBe('1.234,5')
    expect(localizeNumber('122.50', options)).toBe('122,50')
    expect(localizeNumber('', options)).toBe('')
    const english: ExportOptions = { delimiter: ',', decimal: '.', thousands: ',', labels: options.labels }
    expect(localizeNumber('1234.5', english)).toBe('1,234.5')
  })
})
