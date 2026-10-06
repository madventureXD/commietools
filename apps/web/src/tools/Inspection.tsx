import { useEffect, useMemo, useState } from 'react'
import { Button } from '@commietools/ui'
import { loadTemporal } from '@commietools/tools/calculator/calendars'
import { clampWarnDays, formatInspectionDate, inspectionLimits, plan, toCsv, type InspectionItem } from '@commietools/tools/craft/inspection'
import { readInspection, writeInspection } from '@commietools/tools/craft/inspectionStore'
import { SaveFileControl } from './SaveFileControl'

type Translate = (key: string) => string
type TemporalApi = Awaited<ReturnType<typeof loadTemporal>>

interface InspectionProps {
  readonly t: Translate
  readonly locale: string
}

const CSV_HEADERS = [
  'tool.inspection.header.label',
  'tool.inspection.header.note',
  'tool.inspection.header.interval',
  'tool.inspection.header.lastChecked',
  'tool.inspection.header.nextDue',
  'tool.inspection.header.days'
] as const

/** Heutiges Datum in der **örtlichen** Zeitzone — `toISOString` wäre UTC und damit taggenau daneben. */
function localToday(): string {
  const heute = new Date()
  const zweistellig = (wert: number) => String(wert).padStart(2, '0')
  return `${heute.getFullYear()}-${zweistellig(heute.getMonth() + 1)}-${zweistellig(heute.getDate())}`
}

function newId(): string {
  const zufall = globalThis.crypto?.randomUUID
  return typeof zufall === 'function' ? zufall.call(globalThis.crypto) : `eintrag-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

export function Inspection({ t, locale }: InspectionProps) {
  const [items, setItems] = useState<readonly InspectionItem[]>([])
  const [warnDays, setWarnDays] = useState('30')
  const [temporal, setTemporal] = useState<TemporalApi | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Gelesen wird einmal beim Öffnen; geschrieben erst danach. Sonst überschriebe der erste
  // Durchlauf die gespeicherte Liste mit dem leeren Anfangszustand.
  useEffect(() => {
    let aktiv = true
    void (async () => {
      const [api, gespeichert] = await Promise.all([loadTemporal(), readInspection()])
      if (!aktiv) return
      setTemporal(api)
      if (gespeichert) {
        setItems(gespeichert.items)
        setWarnDays(String(gespeichert.warnDays))
      }
      setLoaded(true)
    })()
    return () => { aktiv = false }
  }, [])

  useEffect(() => {
    if (!loaded) return
    void writeInspection({ warnDays: clampWarnDays(warnDays) ?? 30, items })
  }, [items, warnDays, loaded])

  const todayIso = useMemo(localToday, [])
  const warnDaysValue = clampWarnDays(warnDays)
  const result = useMemo(
    () => (temporal ? plan(items, todayIso, warnDaysValue ?? 30, temporal) : null),
    [items, todayIso, temporal, warnDaysValue]
  )
  const rows = result?.ok ? result.rows : []
  const errorKey = !items.length ? null : warnDaysValue === null ? 'tool.inspection.error.warn' : result && !result.ok ? `tool.inspection.error.${result.error}` : null
  const errorItemId = result && !result.ok ? result.errorItemId : null

  function update(id: string, patch: Partial<InspectionItem>): void {
    setItems((vorher) => vorher.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function add(): void {
    setItems((vorher) => vorher.length >= inspectionLimits.itemsMax
      ? vorher
      : [...vorher, { id: newId(), label: '', intervalMonths: '12', lastChecked: todayIso, note: '' }])
  }

  function remove(id: string): void {
    setItems((vorher) => vorher.filter((item) => item.id !== id))
  }

  const csvBlob = async (): Promise<Blob | null> => {
    if (!rows.length) return null
    const text = toCsv(rows, CSV_HEADERS.map((key) => t(key)), locale)
    // Byte-Reihenfolge-Marke, damit Tabellenprogramme UTF-8 erkennen (Umlaute in Notizen).
    return new Blob(['\ufeff' + text], { type: 'text/csv' })
  }

  return (
    <div className="stack">
      <p className="scan-note">{t('tool.inspection.noReminder')}</p>

      <div className="settings-card stack">
        <div className="inline-field">
          <h2>{t('tool.inspection.list')}</h2>
          <span className="scan-note">{rows.length} {t('tool.inspection.count')}</span>
        </div>

        {!items.length && <p className="scan-note">{t('tool.inspection.empty')}</p>}

        {items.length > 0 && (
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool.inspection.label')}</th>
                  <th scope="col">{t('tool.inspection.interval')}</th>
                  <th scope="col">{t('tool.inspection.lastChecked')}</th>
                  <th scope="col">{t('tool.inspection.note')}</th>
                  <th scope="col">{t('tool.inspection.nextDue')}</th>
                  <th scope="col">{t('tool.inspection.daysLeft')}</th>
                  <th scope="col"><span className="scan-note">{t('tool.inspection.remove')}</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const row = rows.find((eintrag) => eintrag.id === item.id)
                  const fehlerhaft = errorItemId === item.id
                  return (
                    <tr key={item.id}>
                      <td>
                        <input
                            aria-label={t('tool.inspection.label')}
                            value={item.label}
                            maxLength={inspectionLimits.labelMax}
                            aria-invalid={fehlerhaft || undefined}
                            onChange={(event) => update(item.id, { label: event.target.value })}
                          />
                      </td>
                      <td>
                        <input
                            aria-label={t('tool.inspection.interval')}
                            value={item.intervalMonths}
                            inputMode="numeric"
                            aria-invalid={fehlerhaft || undefined}
                            onChange={(event) => update(item.id, { intervalMonths: event.target.value })}
                          />
                      </td>
                      <td>
                        <input
                            aria-label={t('tool.inspection.lastChecked')}
                            type="date"
                            value={item.lastChecked}
                            aria-invalid={fehlerhaft || undefined}
                            onChange={(event) => update(item.id, { lastChecked: event.target.value })}
                          />
                      </td>
                      <td>
                        <input
                            aria-label={t('tool.inspection.note')}
                            value={item.note}
                            maxLength={inspectionLimits.noteMax}
                            onChange={(event) => update(item.id, { note: event.target.value })}
                          />
                      </td>
                      <td>{row ? formatInspectionDate(row.nextDue, locale) : '—'}</td>
                      <td>
                        {row && (
                          <span className={`inspection-state ${row.state}`}>
                            {row.daysUntil === 0
                              ? t('tool.inspection.dueToday')
                              : row.daysUntil < 0
                                ? `${Math.abs(row.daysUntil)} ${t('tool.inspection.daysOverdue')}`
                                : `${row.daysUntil}`}
                            {' · '}
                            {t(`tool.inspection.state.${row.state}`)}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="text-link"
                          aria-label={`${t('tool.inspection.remove')}: ${item.label || t('tool.inspection.label')}`}
                          onClick={() => remove(item.id)}
                        >
                          {t('tool.inspection.remove')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {errorKey && <p className="error" role="alert">{t(errorKey)}</p>}

        <div className="download-row">
          <Button onClick={add} disabled={items.length >= inspectionLimits.itemsMax}>{t('tool.inspection.add')}</Button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="settings-card stack">
          <h2>{t('tool.inspection.export')}</h2>
          <SaveFileControl
            suggestedName={t('tool.inspection.exportName')}
            mimeType="text/csv"
            t={t}
            getBlob={csvBlob}
          />
          <p className="scan-note">{t('tool.inspection.exportNote')}</p>
        </div>
      )}

      <details className="settings-card">
        <summary>{t('tool.inspection.settings')}</summary>
        <div className="form-grid">
          <label className="field">
            <span>{t('tool.inspection.warnDays')}</span>
            <input
              value={warnDays}
              inputMode="numeric"
              aria-invalid={warnDaysValue === null || undefined}
              onChange={(event) => setWarnDays(event.target.value)}
            />
          </label>
        </div>
      </details>

      <details className="settings-card">
        <summary>{t('tool.craft.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.inspection.assumptions')}</p>
        <p className="scan-note">{t('tool.inspection.sources')}</p>
      </details>
    </div>
  )
}
