/**
 * Programmiererrechner — Basen, Bitoperationen, Wortbreite, Zweierkomplement.
 *
 * Eigen ist dieser Rechenart: das Tastenfeld mit Ziffernbuchstaben, die **Anzeige-Basis**, die
 * **Wortbreite**, das Vorzeichen, die Darstellungstafel — und die Regel, dass Ziffernbuchstaben ihr
 * `0x` bekommen und die Genauigkeitsampel außerhalb der Basis 10 schweigt. Ein Zahlenmodell
 * (Bruch gegen Dezimal) hat hier keinen Sinn und fehlt deshalb: `numberModelSwitch` ist aus.
 */
import { SHEET_GROUPS } from '@commietools/tools/calculator/keypad'
import { PROGRAMMER_KEYPAD } from '@commietools/tools/calculator/keypads/programmer'
import {
  CALCULATOR_BASES,
  CalculatorFrame,
  baseLabel,
  type CalculatorFrameSpec,
  type PanelInfo
} from './calculator-frame'
import { appendHexDigit, appendSnippet } from '../calculator-ui'

type Translate = (key: string) => string

const WORD_SIZES: readonly number[] = [8, 16, 32, 64]

/** Die Darstellungstafel: derselbe Wert in allen Basen und in der gewählten Wortbreite. */
function Representations({ t, info }: { t: Translate; info: PanelInfo }) {
  const { core, options, state, input } = info
  if (!input.trim()) return null
  const rows = CALCULATOR_BASES.map((item) => {
    const value =
      item === 10 ? core.evaluate(input, options) : core.toBase(input, item, options)
    return { base: item, text: value.ok ? value.display : '—' }
  })
  const word = core.toWord(input, state.wordBits, state.signed, options)
  return (
    <div className="settings-card stack">
      <h2>{t('tool.programmerCalculator.representations')}</h2>
      <dl className="metadata-entries">
        {rows.map((row) => (
          <div key={row.base}>
            <dt>{baseLabel(row.base)}</dt>
            <dd><code>{row.text}</code></dd>
          </div>
        ))}
        <div>
          <dt>
            {state.wordBits} Bit ·{' '}
            {state.signed
              ? t('tool.programmerCalculator.wordSignedYes')
              : t('tool.programmerCalculator.wordSignedNo')}
          </dt>
          <dd><code>{word.ok ? word.display : '—'}</code></dd>
        </div>
      </dl>
    </div>
  )
}

export function ProgrammerCalculator({ t, locale }: { t: Translate; locale: string }) {
  const spec: CalculatorFrameSpec = {
    storageKey: 'calculator.programmer',
    layout: PROGRAMMER_KEYPAD,
    input: 'expression',
    sheet: SHEET_GROUPS,
    numberModelSwitch: false,
    accuracy: 'always',
    // Die Ampel bleibt aus, wo die Anzeige eine Schreibweise zeigt statt den Wert.
    accuracyAllowed: (state) => state.base === 10,
    allowTwoDim: (state) => state.base === 10,
    rulesKey: 'tool.programmerCalculator.rules',
    // Ohne `0x` läse der Kern einen Namen — die Taste wäre tot.
    appendSnippet: (current, snippet) =>
      /^[A-F]$/u.test(snippet) ? appendHexDigit(current, snippet) : appendSnippet(current, snippet),
    renderSettings: (state) => (
      <>
        <div className="form-grid">
          <div className="field">
            <span id="calculator-base-label">{t('tool.programmerCalculator.base')}</span>
            <div className="segmented" role="radiogroup" aria-labelledby="calculator-base-label">
              {CALCULATOR_BASES.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={state.base === item}
                  className={state.base === item ? 'active' : ''}
                  onClick={() => state.set({ base: item })}
                >
                  {baseLabel(item)}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span id="calculator-word-label">{t('tool.programmerCalculator.wordSize')}</span>
            <div className="segmented" role="radiogroup" aria-labelledby="calculator-word-label">
              {WORD_SIZES.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={state.wordBits === item}
                  className={state.wordBits === item ? 'active' : ''}
                  onClick={() => state.set({ wordBits: item })}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="field">
          <span id="calculator-sign-label">{t('tool.programmerCalculator.wordSigned')}</span>
          <div className="segmented" role="radiogroup" aria-labelledby="calculator-sign-label">
            <button
              type="button"
              role="radio"
              aria-checked={state.signed}
              className={state.signed ? 'active' : ''}
              onClick={() => state.set({ signed: true })}
            >
              {t('tool.programmerCalculator.wordSignedYes')}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!state.signed}
              className={!state.signed ? 'active' : ''}
              onClick={() => state.set({ signed: false })}
            >
              {t('tool.programmerCalculator.wordSignedNo')}
            </button>
          </div>
        </div>
      </>
    ),
    renderFlags: (state) => <span className="calculator-flag active">{baseLabel(state.base)}</span>,
    renderPanels: (info) => <Representations t={t} info={info} />,
    /**
     * Die Anzeige-Basis betrifft **auch das Ergebnis** — vorher stand bei aktivem HEX die Zahl
     * `61440` statt `F000`.
     */
    displayResult: (core, options, state, result, resultRaw) => {
      if (state.base === 10 || !resultRaw) return result
      const converted = core.toBase(resultRaw, state.base, options)
      return converted.ok ? converted.display : result
    }
  }

  return <CalculatorFrame spec={spec} t={t} locale={locale} />
}
