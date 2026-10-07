import { useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { anzeigeKontext } from './formatContext'
import {
  annuityPlan,
  cashDiscount,
  compoundInterest,
  discount,
  margin,
  markup,
  percentBase,
  percentShare,
  percentValue,
  ruleOfThree,
  vatAdd,
  vatRemove,
  type CommercialErrorCode,
  type CommercialOperation
} from '@commietools/tools/calculator/commercial'

type Translate = (key: string) => string

/**
 * Rechenarten der Oberfläche. Je Rechenart stehen hier nur die **Feldnamen**; die Beschriftungen
 * kommen aus den Sprachkatalogen, die Ergebnisse liefert der Kern als exakte Dezimaltexte.
 */
const OPERATIONS: readonly {
  readonly id: CommercialOperation
  readonly fields: readonly string[]
  readonly outputs: readonly string[]
}[] = [
  { id: 'percentValue', fields: ['base', 'percent'], outputs: ['prozentwert'] },
  { id: 'percentShare', fields: ['part', 'base'], outputs: ['prozentsatz'] },
  { id: 'percentBase', fields: ['part', 'percent'], outputs: ['grundwert'] },
  { id: 'discount', fields: ['price', 'percent'], outputs: ['rabatt', 'endpreis'] },
  { id: 'markup', fields: ['cost', 'percent'], outputs: ['aufschlag', 'verkaufspreis'] },
  { id: 'margin', fields: ['revenue', 'cost'], outputs: ['rohertrag', 'marge', 'aufschlag'] },
  { id: 'vatAdd', fields: ['net', 'rate'], outputs: ['netto', 'steuer', 'brutto'] },
  { id: 'vatRemove', fields: ['gross', 'rate'], outputs: ['netto', 'steuer', 'brutto'] },
  { id: 'cashDiscount', fields: ['amount', 'percent'], outputs: ['skonto', 'zahlbetrag'] },
  { id: 'ruleOfThree', fields: ['a', 'b', 'c'], outputs: ['ergebnis'] },
  { id: 'compoundInterest', fields: ['principal', 'interest', 'years'], outputs: ['endkapital', 'zinsen', 'faktor'] },
  { id: 'annuityPlan', fields: ['principal', 'interest', 'years', 'perYear'], outputs: [] }
]

/** Beträge mit zwei Nachkommastellen in der Sprache des Nutzers. */
function formatAmount(text: string, locale: string): string {
  const value = Number(text)
  if (!Number.isFinite(value)) return text
  return new Intl.NumberFormat(anzeigeKontext(locale).regionLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

/** Einheitliches Ergebnis der Oberfläche, unabhängig davon, welcher Kernaufruf dahintersteht. */
interface Evaluation {
  readonly ok: boolean
  readonly values: Readonly<Record<string, string>>
  readonly error: CommercialErrorCode | null
}

function evaluate(operation: CommercialOperation, input: Readonly<Record<string, string>>): Evaluation {
  const single = (result: { ok: boolean; display: string; error: CommercialErrorCode | null }, key: string): Evaluation =>
    result.ok ? { ok: true, values: { [key]: result.display }, error: null } : { ok: false, values: {}, error: result.error }

  switch (operation) {
    case 'percentValue': return single(percentValue(input.base ?? '', input.percent ?? ''), 'prozentwert')
    case 'percentShare': return single(percentShare(input.part ?? '', input.base ?? ''), 'prozentsatz')
    case 'percentBase': return single(percentBase(input.part ?? '', input.percent ?? ''), 'grundwert')
    case 'ruleOfThree': return single(ruleOfThree(input.a ?? '', input.b ?? '', input.c ?? ''), 'ergebnis')
    case 'discount': return discount(input.price ?? '', input.percent ?? '')
    case 'markup': return markup(input.cost ?? '', input.percent ?? '')
    case 'margin': return margin(input.revenue ?? '', input.cost ?? '')
    case 'vatAdd': return vatAdd(input.net ?? '', input.rate ?? '')
    case 'vatRemove': return vatRemove(input.gross ?? '', input.rate ?? '')
    case 'cashDiscount': return cashDiscount(input.amount ?? '', input.percent ?? '')
    case 'compoundInterest': return compoundInterest(input.principal ?? '', input.interest ?? '', input.years ?? '')
    default: return { ok: false, values: {}, error: 'invalid' }
  }
}

export function Commercial({ t, locale }: { t: Translate; locale: string }) {
  const [operation, setOperation] = useState<CommercialOperation>('percentValue')
  const [input, setInput] = useState<Record<string, string>>({})
  const [values, setValues] = useState<Readonly<Record<string, string>> | null>(null)
  const [errorKey, setErrorKey] = useState('')
  const plan = useMemo(() => (operation === 'annuityPlan' ? annuityPlan(input.principal ?? '', input.interest ?? '', input.years ?? '', Number(input.perYear ?? '12') || 12) : null), [operation, input])

  const current = OPERATIONS.find((item) => item.id === operation) ?? OPERATIONS[0]
  if (!current) return null

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (operation === 'annuityPlan') {
      const result = annuityPlan(input.principal ?? '', input.interest ?? '', input.years ?? '', Number(input.perYear ?? '12') || 12)
      if (!result.ok) {
        setValues(null)
        setErrorKey(`tool.calcCommon.error.${result.error ?? 'invalid'}`)
        return
      }
      setErrorKey('')
      setValues({})
      return
    }
    const result = evaluate(operation, input)
    if (!result.ok) {
      setValues(null)
      setErrorKey(`tool.calcCommon.error.${result.error ?? 'invalid'}`)
      return
    }
    setErrorKey('')
    setValues(result.values)
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="commercial-operation">{t('tool.commercial.operation')}</label>
          <select
            id="commercial-operation"
            value={operation}
            onChange={(event) => {
              setOperation(event.target.value as CommercialOperation)
              setValues(null)
              setErrorKey('')
            }}
          >
            {OPERATIONS.map((item) => (
              <option key={item.id} value={item.id}>{t(`tool.commercial.op.${item.id}`)}</option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          {current.fields.map((field) => (
            <div className="field" key={field}>
              <label htmlFor={`commercial-${field}`}>{t(`tool.commercial.field.${field}`)}</label>
              {field === 'perYear' ? (
                <select
                  id={`commercial-${field}`}
                  value={input[field] ?? '12'}
                  onChange={(event) => setInput({ ...input, [field]: event.target.value })}
                >
                  {[12, 4, 2, 1].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              ) : (
                <input
                  id={`commercial-${field}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={input[field] ?? ''}
                  onChange={(event) => setInput({ ...input, [field]: event.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <button type="submit">{t('tool.calcCommon.calculate')}</button>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.calcCommon.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {values && current.outputs.length > 0 && (
        <div className="results" aria-live="polite">
          <dl>
            {current.outputs.map((key) => (
              <div key={key}>
                <dt>{t(`tool.commercial.out.${key}`)}</dt>
                <dd>{formatAmount(values[key] ?? '', locale)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {plan && plan.ok && (
        <div className="settings-card stack">
          <h2>{t('tool.commercial.plan')}</h2>
          <p>{t('tool.commercial.annuity')}: <strong>{formatAmount(plan.annuity, locale)}</strong></p>
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <caption className="scan-note">{t('tool.commercial.planNote')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('tool.commercial.col.period')}</th>
                  <th scope="col">{t('tool.commercial.col.interest')}</th>
                  <th scope="col">{t('tool.commercial.col.principal')}</th>
                  <th scope="col">{t('tool.commercial.col.payment')}</th>
                  <th scope="col">{t('tool.commercial.col.balance')}</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row) => (
                  <tr key={row.period}>
                    <th scope="row">{row.period}</th>
                    <td>{formatAmount(row.interest, locale)}</td>
                    <td>{formatAmount(row.principal, locale)}</td>
                    <td>{formatAmount(row.payment, locale)}</td>
                    <td>{formatAmount(row.balance, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {plan && !plan.ok && (
        <div className="results" aria-live="polite">
          <p className="error" role="alert">{t(`tool.calcCommon.error.${plan.error ?? 'invalid'}`)}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note" style={{ whiteSpace: 'pre-line' }}>{t('tool.commercial.formulas')}</p>
        <h2>{t('tool.calcCommon.assumptions')}</h2>
        <p className="scan-note">{t('tool.commercial.assumptions')}</p>
        <p className="scan-note">{t('tool.commercial.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.commercial.summary')}</p>
      <LocalBadge />
    </div>
  )
}
