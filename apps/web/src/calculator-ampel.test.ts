import { describe, expect, it } from 'vitest'
import { calculatorFor, evaluate } from '@commietools/tools/calculator/core'
import { loadToolMessages } from '@commietools/tools'
import { supportedLocales } from '@commietools/i18n'
import { accuracyOf } from './calculator-ui'

const toolMessages = Object.fromEntries(
  await Promise.all(supportedLocales.map(async (locale) => [locale, (await loadToolMessages(locale))[locale] ?? {}]))
)

/**
 * Genauigkeitsampel des Rechners.
 *
 * Geprüft wird die Regel `raw === full` gegen **echte** Rechnungen des Kerns, nicht gegen
 * erfundene Zeichenketten — sonst belegt der Test nur, dass zwei Texte gleich sind. Die
 * Erwartungen sind am 2026-10-04 gemessen und in
 * `uebergabe/07-pruefung/rechner-ampel/2026-10-04-genauigkeitsmessung.txt` festgehalten.
 */
describe('calculator accuracy light', () => {
  it('liefert den vollen Wert nur als eigene Ausgabe, nicht als `raw`', () => {
    const result = evaluate('1/3', { number: 'BigNumber' })
    expect(result.ok).toBe(true)
    // `raw` bleibt die 14-Stellen-Anzeige — daran hängen Verlauf und Weiterverwendung.
    expect(result.raw).toBe('0.33333333333333')
    expect(result.full).toBe('0.3333333333333333333333333333333333333333333333333333333333333333')
    expect(accuracyOf(result.raw, result.full)).toBe('rounded')
  })

  it('meldet Fehler ohne vollen Wert', () => {
    const result = evaluate('sqrt(2)', { number: 'Fraction' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('numberModel')
    expect(result.full).toBe('')
  })

  it('steht auf vollständig, wo die Anzeige der ganze Wert ist', () => {
    const cases: readonly { readonly expression: string; readonly options?: Record<string, unknown> }[] = [
      { expression: '1/3+1/6' },
      { expression: 'sqrt(4)' },
      // Vollständig angezeigt — und trotzdem **kein** Beweis für eine exakte Rechnung:
      // die Wurzel war zwischendurch gerundet. Genau das sagt die Ampel nicht aus.
      { expression: 'sqrt(2)*sqrt(2)' },
      { expression: '1/7*7' },
      { expression: 'pi/pi' },
      { expression: '0.1+0.2' },
      { expression: 'log(1000,10)' },
      { expression: 'sin(30)', options: { angleMode: 'deg' } }
    ]
    for (const item of cases) {
      const result = evaluate(item.expression, { number: 'BigNumber', ...item.options } as never)
      expect(result.ok, item.expression).toBe(true)
      expect(accuracyOf(result.raw, result.full), item.expression).toBe('complete')
    }
  })

  it('steht auf gerundet, wo der Rechner mehr Stellen hält', () => {
    const cases: readonly string[] = ['1/3', '2/7', 'sqrt(2)', 'pi', '1/3*3', '2^0.5', '1/7']
    for (const expression of cases) {
      const result = evaluate(expression, { number: 'BigNumber' })
      expect(result.ok, expression).toBe(true)
      expect(accuracyOf(result.raw, result.full), expression).toBe('rounded')
    }
  })

  it('meldet den Bruch als vollständig — dort ist die Anzeige exakt', () => {
    for (const expression of ['1/3+1/6', '0.1+0.2', '1/3*3']) {
      const result = evaluate(expression, { number: 'Fraction' })
      expect(result.ok, expression).toBe(true)
      expect(accuracyOf(result.raw, result.full), expression).toBe('complete')
    }
  })

  it('nennt den Sonderfall unterhalb der Anzeigeschwelle vollständig', () => {
    // `sin(pi)` ist im Dezimal-Modell nicht exakt 0, liegt aber unter der Anzeigeschwelle
    // (1e-13). Die Anzeige sagt 0 — die Taschenrechner-Konvention. Beide Darstellungen tragen
    // sie, deshalb steht die Ampel auf vollständig. Bewusste Festlegung, kein Versehen.
    const result = evaluate('sin(pi)', { number: 'BigNumber' })
    expect(result.ok).toBe(true)
    expect(result.display).toBe('0')
    expect(accuracyOf(result.raw, result.full)).toBe('complete')
  })

  it('vergleicht Zeichenketten und nicht mit mathjs-Toleranz', () => {
    // Der Grund für den Zeichenkettenvergleich: mathjs' `equal` prüft mit `relTol` 1e-12 und
    // hält die 14-Stellen-Anzeige für **gleich** dem 64-Stellen-Wert. Eine Ampel, die so
    // vergliche, wäre blind — sie stünde auch bei `1/3` auf vollständig.
    const math = calculatorFor({ number: 'BigNumber' })
    const result = evaluate('1/3', { number: 'BigNumber' })
    expect(math.equal(math.evaluate('1/3') as never, math.bignumber(result.raw) as never)).toBe(true)
    expect(accuracyOf(result.raw, result.full)).toBe('rounded')
  })

  it('führt die Ampeltexte in jeder Sprache', () => {
    const keys = [
      'tool.calculator.accuracyLabel',
      'tool.calculator.accuracyStateComplete',
      'tool.calculator.accuracyStateRounded',
      'tool.calculator.accuracyOpen',
      'tool.calculator.accuracyComplete',
      'tool.calculator.accuracyRounded',
      'tool.calculator.accuracyModel'
    ]
    for (const locale of supportedLocales) {
      for (const key of keys) {
        expect(toolMessages[locale]?.[key], `${locale}: ${key}`).toBeTruthy()
      }
    }
  })
})
