import { useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  addToDate,
  countWorkingDays,
  dateDifference,
  deadline,
  isoWeek,
  sumDurations,
  type DateResult,
  type DurationUnit
} from '@commietools/tools/calculator/dates'
import { loadTemporal, type TemporalApi } from '@commietools/tools/calculator/calendars'

type Translate = (key: string) => string

const MODES = ['difference', 'add', 'workingDays', 'week', 'deadline', 'duration'] as const
type Mode = (typeof MODES)[number]

const UNITS: readonly DurationUnit[] = ['days', 'weeks', 'months', 'years']

/** Ergebnisreihenfolge je Rechnung — fest, damit die Anzeige nicht von der Objektordnung abhängt. */
const OUTPUT_KEYS: Readonly<Record<Mode, readonly string[]>> = {
  difference: ['days', 'weeks', 'weeksRemainder', 'months', 'years', 'workingDays'],
  add: ['iso'],
  workingDays: ['workingDays'],
  week: ['week', 'isoYear', 'weekday', 'dayOfYear', 'daysInMonth', 'leapYear'],
  deadline: ['start', 'end', 'rawEnd', 'shifted'],
  duration: ['total', 'decimalHours', 'minutes', 'lines']
}

export function DateTime({ t }: { t: Translate }) {
  const [mode, setMode] = useState<Mode>('difference')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<DurationUnit>('days')
  const [durations, setDurations] = useState('')
  const [values, setValues] = useState<Readonly<Record<string, string>> | null>(null)
  const [errorKey, setErrorKey] = useState('')
  const [busy, setBusy] = useState(false)

  const apply = (outcome: DateResult) => {
    if (!outcome.ok) {
      setValues(null)
      setErrorKey(`tool.calcCommon.error.${outcome.error === 'invalidRange' ? 'range' : outcome.error === 'unsupported' ? 'unsupported' : 'invalid'}`)
      return
    }
    setErrorKey('')
    setValues(outcome.values)
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'duration') { apply(sumDurations(durations)); return }

    setBusy(true)
    try {
      const temporal: TemporalApi = await loadTemporal()
      if (mode === 'difference') apply(dateDifference(from, to, temporal))
      else if (mode === 'add') apply(addToDate(date, Number(amount), unit, temporal))
      else if (mode === 'deadline') apply(deadline(date, Number(amount), unit, temporal))
      else if (mode === 'week') apply(isoWeek(date, temporal))
      else {
        // Erst prüfen (dieselbe Datumsprüfung wie beim Abstand), dann zählen: `countWorkingDays`
        // allein kann einen Tippfehler im Datum nicht von „null Arbeitstage" unterscheiden.
        const check = dateDifference(from, to, temporal)
        if (!check.ok) { apply(check); return }
        apply({ ok: true, values: { workingDays: String(countWorkingDays(from, to, temporal)) }, error: null })
      }
    } finally {
      setBusy(false)
    }
  }

  const dateField = (id: string, labelKey: string, value: string, onChange: (next: string) => void) => (
    <div className="field">
      <label htmlFor={id}>{t(labelKey)}</label>
      <input id={id} type="text" autoComplete="off" placeholder="2026-10-03" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={(event) => void onSubmit(event)}>
        <div className="field">
          <label htmlFor="datetime-mode">{t('tool.datetime.mode')}</label>
          <select
            id="datetime-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as Mode)
              setValues(null)
              setErrorKey('')
            }}
          >
            {MODES.map((item) => <option key={item} value={item}>{t(`tool.datetime.mode.${item}`)}</option>)}
          </select>
        </div>

        {mode === 'difference' && (
          <div className="form-grid">
            {dateField('datetime-from', 'tool.datetime.field.from', from, setFrom)}
            {dateField('datetime-to', 'tool.datetime.field.to', to, setTo)}
          </div>
        )}

        {mode === 'workingDays' && (
          <div className="form-grid">
            {dateField('datetime-from', 'tool.datetime.field.from', from, setFrom)}
            {dateField('datetime-to', 'tool.datetime.field.to', to, setTo)}
          </div>
        )}

        {mode === 'add' && (
          <div className="form-grid">
            {dateField('datetime-date', 'tool.datetime.field.date', date, setDate)}
            <div className="field">
              <label htmlFor="datetime-amount">{t('tool.datetime.field.amount')}</label>
              <input id="datetime-amount" type="text" inputMode="numeric" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="datetime-unit">{t('tool.datetime.field.unit')}</label>
              <select id="datetime-unit" value={unit} onChange={(event) => setUnit(event.target.value as DurationUnit)}>
                {UNITS.map((item) => <option key={item} value={item}>{t(`tool.datetime.unit.${item}`)}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === 'deadline' && (
          <div className="form-grid">
            {dateField('datetime-date', 'tool.datetime.field.event', date, setDate)}
            <div className="field">
              <label htmlFor="datetime-amount">{t('tool.datetime.field.amount')}</label>
              <input id="datetime-amount" type="text" inputMode="numeric" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="datetime-unit">{t('tool.datetime.field.unit')}</label>
              <select id="datetime-unit" value={unit} onChange={(event) => setUnit(event.target.value as DurationUnit)}>
                {UNITS.map((item) => <option key={item} value={item}>{t(`tool.datetime.unit.${item}`)}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === 'week' && dateField('datetime-date', 'tool.datetime.field.date', date, setDate)}

        {mode === 'duration' && (
          <div className="field">
            <label htmlFor="datetime-durations">{t('tool.datetime.field.duration')}</label>
            <textarea id="datetime-durations" rows={5} value={durations} onChange={(event) => setDurations(event.target.value)} />
          </div>
        )}

        <button type="submit" disabled={busy}>{t('tool.calcCommon.calculate')}</button>
        {mode === 'deadline' && <p className="scan-note">{t('tool.datetime.note.deadline')}</p>}
        {mode === 'workingDays' && <p className="scan-note">{t('tool.datetime.note.workingDays')}</p>}
        {mode === 'duration' && <p className="scan-note">{t('tool.datetime.note.duration')}</p>}
      </form>

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.calcCommon.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {values && !errorKey && (
        <div className="results" aria-live="polite">
          <dl>
            {OUTPUT_KEYS[mode].map((key) => (
              <div key={key}>
                <dt>{t(`tool.datetime.out.${key}`)}</dt>
                <dd>{key === 'leapYear' ? (values[key] === 'true' ? '✓' : '—') : values[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note">{t('tool.datetime.formulas')}</p>
        <h2>{t('tool.calcCommon.assumptions')}</h2>
        <p className="scan-note">{t('tool.datetime.assumptions')}</p>
        <p className="scan-note">{t('tool.datetime.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.datetime.summary')}</p>
      <LocalBadge />
    </div>
  )
}
