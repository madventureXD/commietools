/**
 * Wissenschaftlicher Rechner — Winkelfunktionen, Logarithmen, Potenzen, Konstanten.
 *
 * Eigen ist dieser Rechenart nur: das Tastenfeld mit `2nd`-Ebene, der **Winkelmodus** und der
 * Rechenregel-Text. Alles andere kommt aus dem gemeinsamen Rahmen.
 */
import { SHEET_GROUPS } from '@commietools/tools/calculator/keypad'
import { SCIENTIFIC_KEYPAD } from '@commietools/tools/calculator/keypads/scientific'
import { CalculatorFrame, type AngleMode, type CalculatorFrameSpec } from './calculator-frame'

type Translate = (key: string) => string

/** Winkelmodi dieser Rechenart — die Beschriftungen kommen aus ihrem Sprachkatalog. */
const ANGLES: readonly { readonly value: AngleMode; readonly key: string }[] = [
  { value: 'rad', key: 'tool.scientificCalculator.angleRad' },
  { value: 'deg', key: 'tool.scientificCalculator.angleDeg' },
  { value: 'grad', key: 'tool.scientificCalculator.angleGrad' }
]

export function ScientificCalculator({ t, locale }: { t: Translate; locale: string }) {
  const spec: CalculatorFrameSpec = {
    storageKey: 'calculator.scientific',
    layout: SCIENTIFIC_KEYPAD,
    input: 'expression',
    sheet: SHEET_GROUPS,
    numberModelSwitch: true,
    accuracy: 'always',
    rulesKey: 'tool.scientificCalculator.rules',
    renderSettings: (state) => (
      <div className="field">
        <span id="calculator-angle-label">{t('tool.scientificCalculator.angleMode')}</span>
        <div className="segmented" role="radiogroup" aria-labelledby="calculator-angle-label">
          {ANGLES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={state.angleMode === item.value}
              className={state.angleMode === item.value ? 'active' : ''}
              onClick={() => state.set({ angleMode: item.value })}
            >
              {t(item.key)}
            </button>
          ))}
        </div>
      </div>
    ),
    renderFlags: (state) => <span className="calculator-flag active">{state.angleMode.toUpperCase()}</span>
  }

  return <CalculatorFrame spec={spec} t={t} locale={locale} />
}
