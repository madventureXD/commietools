/**
 * RPN-Rechner — umgekehrte polnische Notation mit Stapel und Rechenweg.
 *
 * Eigen ist dieser Rechenart: die **Tokenfolge** als Eingabe (`input: 'rpn'`), die Stapelgriffe
 * SWAP und DROP im Tastenfeld — und dass die Genauigkeitsampel schweigt: der Stapel trägt die auf
 * 14 Stellen gerundete Darstellung von Schritt zu Schritt weiter, „vollständig" wäre dort eine
 * Falschaussage.
 *
 * Kein Blatt `⋯` (das Tastenfeld hat die Taste nicht) und kein Zahlenmodell-Umschalter: die
 * Stapelrechnung läuft im Dezimalmodell.
 */
import { RPN_KEYPAD } from '@commietools/tools/calculator/keypads/rpn'
import { CalculatorFrame, type CalculatorFrameSpec } from './calculator-frame'

type Translate = (key: string) => string

const SPEC: CalculatorFrameSpec = {
  storageKey: 'calculator.rpn',
  layout: RPN_KEYPAD,
  input: 'rpn',
  sheet: null,
  numberModelSwitch: false,
  accuracy: 'never',
  labelKey: 'tool.rpnCalculator.rpnTokens',
  placeholderKey: 'tool.rpnCalculator.rpnPlaceholder',
  rulesKey: 'tool.rpnCalculator.rules'
}

export function RpnCalculator({ t, locale }: { t: Translate; locale: string }) {
  return <CalculatorFrame spec={SPEC} t={t} locale={locale} />
}
