import { useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  angleUnits,
  convertAngle,
  convertMeasure,
  inchFractionToMillimetres,
  millimetresToInchFraction,
  toNumberBase,
  unitCategories,
  type QuantityResult
} from '@commietools/tools/calculator/units'
import {
  calendarIds,
  formatCalendarDate,
  fromCalendarParts,
  loadTemporal,
  toCalendar,
  type CalendarConversion,
  type CalendarId,
  type TemporalApi
} from '@commietools/tools/calculator/calendars'

type Translate = (key: string) => string

const MODES = ['units', 'angle', 'base', 'inch', 'calendar'] as const
type Mode = (typeof MODES)[number]

/** Kalendernamen kommen aus der Spracheinstellung — 18 Kalender in drei Sprachen ohne eigene Texte. */
function calendarLabel(id: string, locale: string): string {
  try {
    return new Intl.DisplayNames(locale, { type: 'calendar' }).of(id) ?? id
  } catch {
    return id
  }
}

export function Convert({ t, locale }: { t: Translate; locale: string }) {
  const [mode, setMode] = useState<Mode>('units')
  const [category, setCategory] = useState('length')
  const [value, setValue] = useState('')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('cm')
  const [angleFrom, setAngleFrom] = useState('deg')
  const [angleTo, setAngleTo] = useState('rad')
  const [base, setBase] = useState('16')
  const [whole, setWhole] = useState('')
  const [numerator, setNumerator] = useState('')
  const [denominator, setDenominator] = useState('2')
  const [inchDirection, setInchDirection] = useState<'toMillimetres' | 'toInch'>('toMillimetres')
  const [calendar, setCalendar] = useState<CalendarId>('hebrew')
  const [calendarDirection, setCalendarDirection] = useState<'forward' | 'backward'>('forward')
  const [date, setDate] = useState('')
  const [year, setYear] = useState('')
  const [monthCode, setMonthCode] = useState('1')
  const [day, setDay] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [calendarResult, setCalendarResult] = useState<CalendarConversion | null>(null)
  const [errorKey, setErrorKey] = useState('')
  const [busy, setBusy] = useState(false)

  const current = useMemo(() => unitCategories.find((item) => item.id === category) ?? unitCategories[0], [category])

  const switchCategory = (id: string) => {
    const next = unitCategories.find((item) => item.id === id) ?? unitCategories[0]
    if (!next) return
    setCategory(id)
    setFrom(next.base)
    setTo(next.units.find((unit) => unit !== next.base) ?? next.base)
    setResult(null)
    setErrorKey('')
  }

  const show = (outcome: QuantityResult) => {
    if (!outcome.ok) {
      setResult(null)
      setErrorKey(outcome.error === 'unknownUnit' ? 'tool.convert.error.unknownUnit' : `tool.calcCommon.error.${outcome.error ?? 'invalid'}`)
      return
    }
    setErrorKey('')
    setResult(outcome.display)
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setCalendarResult(null)
    if (mode === 'units') { if (current) show(convertMeasure(value, from, to, current.id)); return }
    if (mode === 'angle') { show(convertAngle(value, angleFrom, angleTo)); return }
    if (mode === 'base') { show(toNumberBase(value, Number(base))); return }
    if (mode === 'inch') {
      show(inchDirection === 'toMillimetres'
        ? inchFractionToMillimetres(whole, numerator, denominator)
        : millimetresToInchFraction(value, Number(denominator)))
      return
    }
    // Kalender: Temporal nativ oder nachgeladen — erst hier, nie im Startbündel.
    setBusy(true)
    try {
      const temporal: TemporalApi = await loadTemporal()
      const outcome = calendarDirection === 'forward'
        ? toCalendar(date, calendar, temporal, locale)
        : fromCalendarParts(Number(year), Number(monthCode), Number(day), calendar, temporal)
      if (!outcome.ok) {
        setErrorKey(outcome.error === 'unsupported' ? 'tool.convert.error.unsupportedCalendar' : 'tool.calcCommon.error.invalid')
        setCalendarResult(null)
        return
      }
      setErrorKey('')
      setCalendarResult(outcome)
    } catch {
      setErrorKey('tool.convert.error.unsupportedCalendar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={(event) => void onSubmit(event)}>
        <div className="field">
          <label htmlFor="convert-mode">{t('tool.convert.mode')}</label>
          <select
            id="convert-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as Mode)
              setResult(null)
              setCalendarResult(null)
              setErrorKey('')
            }}
          >
            {MODES.map((item) => <option key={item} value={item}>{t(`tool.convert.mode.${item}`)}</option>)}
          </select>
        </div>

        {mode === 'units' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="convert-category">{t('tool.convert.category')}</label>
              <select id="convert-category" value={category} onChange={(event) => switchCategory(event.target.value)}>
                {unitCategories.map((item) => <option key={item.id} value={item.id}>{t(item.labelKey)}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="convert-value">{t('tool.convert.field.value')}</label>
              <input id="convert-value" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="convert-from">{t('tool.convert.field.from')}</label>
              <select id="convert-from" value={from} onChange={(event) => setFrom(event.target.value)}>
                {current?.units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="convert-to">{t('tool.convert.field.to')}</label>
              <select id="convert-to" value={to} onChange={(event) => setTo(event.target.value)}>
                {current?.units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === 'angle' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="convert-angle-value">{t('tool.convert.field.value')}</label>
              <input id="convert-angle-value" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="convert-angle-from">{t('tool.convert.field.from')}</label>
              <select id="convert-angle-from" value={angleFrom} onChange={(event) => setAngleFrom(event.target.value)}>
                {angleUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="convert-angle-to">{t('tool.convert.field.to')}</label>
              <select id="convert-angle-to" value={angleTo} onChange={(event) => setAngleTo(event.target.value)}>
                {angleUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === 'base' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="convert-base-value">{t('tool.convert.field.value')}</label>
              <input id="convert-base-value" type="text" inputMode="numeric" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="convert-base">{t('tool.convert.field.base')}</label>
              <input id="convert-base" type="text" inputMode="numeric" autoComplete="off" value={base} onChange={(event) => setBase(event.target.value)} />
            </div>
          </div>
        )}

        {mode === 'inch' && (
          <>
            <div className="field">
              <span>{t('tool.convert.inchDenominator')}</span>
              <select id="convert-inch-denominator" value={denominator} onChange={(event) => setDenominator(event.target.value)}>
                {[2, 4, 8, 16, 32, 64].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="field">
              <span>{t('tool.convert.field.value')}</span>
              <div className="segmented" role="radiogroup">
                <button type="button" role="radio" aria-checked={inchDirection === 'toMillimetres'} className={inchDirection === 'toMillimetres' ? 'active' : ''} onClick={() => setInchDirection('toMillimetres')}>
                  Zoll → mm
                </button>
                <button type="button" role="radio" aria-checked={inchDirection === 'toInch'} className={inchDirection === 'toInch' ? 'active' : ''} onClick={() => setInchDirection('toInch')}>
                  mm → Zoll
                </button>
              </div>
            </div>
            {inchDirection === 'toMillimetres' ? (
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="convert-inch-whole">{t('tool.convert.field.whole')}</label>
                  <input id="convert-inch-whole" type="text" inputMode="numeric" autoComplete="off" value={whole} onChange={(event) => setWhole(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="convert-inch-numerator">{t('tool.convert.field.numerator')}</label>
                  <input id="convert-inch-numerator" type="text" inputMode="numeric" autoComplete="off" value={numerator} onChange={(event) => setNumerator(event.target.value)} />
                </div>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="convert-value">{t('tool.convert.field.value')} (mm)</label>
                <input id="convert-value" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} />
              </div>
            )}
          </>
        )}

        {mode === 'calendar' && (
          <>
            <div className="field">
              <label htmlFor="convert-calendar">{t('tool.convert.field.calendar')}</label>
              <select id="convert-calendar" value={calendar} onChange={(event) => setCalendar(event.target.value as CalendarId)}>
                {calendarIds.map((id) => <option key={id} value={id}>{calendarLabel(id, locale)}</option>)}
              </select>
            </div>
            <div className="field">
              <span>{t('tool.convert.direction')}</span>
              <div className="segmented" role="radiogroup">
                <button type="button" role="radio" aria-checked={calendarDirection === 'forward'} className={calendarDirection === 'forward' ? 'active' : ''} onClick={() => setCalendarDirection('forward')}>
                  {t('tool.convert.direction.forward')}
                </button>
                <button type="button" role="radio" aria-checked={calendarDirection === 'backward'} className={calendarDirection === 'backward' ? 'active' : ''} onClick={() => setCalendarDirection('backward')}>
                  {t('tool.convert.direction.backward')}
                </button>
              </div>
            </div>
            {calendarDirection === 'forward' ? (
              <div className="field">
                <label htmlFor="convert-date">{t('tool.convert.field.date')}</label>
                <input id="convert-date" type="text" autoComplete="off" placeholder="2026-10-03" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
            ) : (
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="convert-year">{t('tool.convert.field.year')}</label>
                  <input id="convert-year" type="text" inputMode="numeric" autoComplete="off" value={year} onChange={(event) => setYear(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="convert-month">{t('tool.convert.field.monthCode')}</label>
                  <input id="convert-month" type="text" inputMode="numeric" autoComplete="off" value={monthCode} onChange={(event) => setMonthCode(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="convert-day">{t('tool.convert.field.day')}</label>
                  <input id="convert-day" type="text" inputMode="numeric" autoComplete="off" value={day} onChange={(event) => setDay(event.target.value)} />
                </div>
              </div>
            )}
          </>
        )}

        <button type="submit" disabled={busy}>{t('tool.calcCommon.calculate')}</button>
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.calcCommon.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {result !== null && !errorKey && (
        <div className="results" aria-live="polite">
          <dl>
            <div><dt>{t('tool.calcCommon.result')}</dt><dd>{result}</dd></div>
          </dl>
        </div>
      )}

      {calendarResult?.ok && (
        <div className="results" aria-live="polite">
          <dl>
            {calendarResult.display && (
              <div><dt>{t('tool.convert.calendarResult')}</dt><dd>{calendarResult.display}</dd></div>
            )}
            <div><dt>{t('tool.convert.gregorianResult')}</dt><dd>{calendarResult.iso}</dd></div>
            {calendarResult.calendarDate && !calendarResult.display && (
              <div><dt>{t('tool.convert.calendarResult')}</dt><dd>{formatCalendarDate(calendarResult.iso, calendar, locale) || calendarResult.calendarDate}</dd></div>
            )}
          </dl>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note">{t('tool.convert.formulas')}</p>
        <h2>{t('tool.calcCommon.assumptions')}</h2>
        <p className="scan-note">{t('tool.convert.assumptions')}</p>
        <p className="scan-note">{t('tool.convert.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.convert.summary')}</p>
      <LocalBadge />
    </div>
  )
}
