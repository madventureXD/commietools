/**
 * Standardrechner — Grundrechenarten, Prozent, Klammern.
 *
 * Die Oberfläche steht im **gemeinsamen Rahmen** (`calculator-frame.tsx`): Anzeige in zwei
 * Zuständen, Tastenfeld-Ausgabe, Kopieren, Verlauf, Variablen, Rechenregeln. Hier steht nur, was
 * diese Rechenart ausmacht — ihr Tastenfeld, ihr Speicher, ihre Sprache (Entscheidung 2026-10-04:
 * ein Werkzeug je Rechenart, Rahmen geteilt).
 */
import { SHEET_GROUPS } from '@commietools/tools/calculator/keypad'
import { STANDARD_KEYPAD } from '@commietools/tools/calculator/keypads/standard'
import { CalculatorFrame, type CalculatorFrameSpec } from './calculator-frame'

type Translate = (key: string) => string

/**
 * Einstellungen dieser Rechenart: nur Zahlenmodell und Darstellung. Kein Winkelmodus, keine
 * Anzeige-Basis, keine Wortbreite — die standen früher im gemeinsamen Datensatz aller Rechenarten.
 */
const SPEC: CalculatorFrameSpec = {
  storageKey: 'calculator.standard',
  layout: STANDARD_KEYPAD,
  input: 'expression',
  sheet: SHEET_GROUPS,
  numberModelSwitch: true,
  accuracy: 'always',
  rulesKey: 'tool.calculator.rules'
}

export function Calculator({ t, locale }: { t: Translate; locale: string }) {
  return <CalculatorFrame spec={SPEC} t={t} locale={locale} />
}
