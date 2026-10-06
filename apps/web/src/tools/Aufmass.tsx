import { useEffect, useMemo, useRef, useState } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  MEASURE_DECIMALS,
  MONEY_DECIMALS,
  computeDocument,
  measureUnits,
  toCsv,
  toText,
  type AufmassDocument,
  type AufmassPosition,
  type AufmassRow,
  type AufmassSection,
  type ExportLabels,
  type ExportOptions,
  type MeasureErrorCode,
  type MeasureUnit
} from '@commietools/tools/calculator/aufmass'
import { clearSheet, readSheet, writeSheet } from '@commietools/tools/calculator/aufmassStore'
import { SaveFileControl } from './SaveFileControl'
import { buildAufmassPdf } from './aufmassPdf'

type Translate = (key: string) => string

let idCounter = 0
function newId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`
}

/** Beträge und Maße in der Schreibweise der Sprache; Tausenderzeichen ab vier Stellen. */
function formatValue(text: string, locale: string, decimals: number): string {
  if (!text) return '—'
  const value = Number(text)
  if (!Number.isFinite(value)) return text
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

/**
 * Ausgabeoptionen je Sprache. Sie gehören hierher und nicht in die Fachlogik: Die Logik liefert
 * exakte Dezimalzeichenketten mit Punkt, die Schreibweise ist Sache der Oberfläche.
 */
function exportOptionsFor(locale: string, labels: ExportLabels): ExportOptions {
  const germanStyle = locale.startsWith('de') || locale.startsWith('es')
  return {
    delimiter: germanStyle ? ';' : ',',
    decimal: germanStyle ? ',' : '.',
    thousands: germanStyle ? '.' : ',',
    labels
  }
}

export function Aufmass({ t, locale }: { t: Translate; locale: string }) {
  const [document, setDocument] = useState<AufmassDocument>({ title: '', client: '', sections: [] })
  const [restorable, setRestorable] = useState(false)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const loaded = useRef(false)

  // Beim Öffnen prüfen, ob ein Blatt liegt — **nicht** ungefragt laden, es könnte ein fremdes sein.
  useEffect(() => {
    void readSheet().then((stored) => {
      if (stored && stored.sections.length > 0) setRestorable(true)
    })
  }, [])

  // Jede Änderung sichern, kurz entprellt. Eigener Bereich, nie der Rechner-Verlauf.
  useEffect(() => {
    if (!loaded.current) return
    const timer = setTimeout(() => { void writeSheet(document) }, 400)
    return () => clearTimeout(timer)
  }, [document])

  const computed = useMemo(() => computeDocument(document), [document])

  const unitLabel = (unit: MeasureUnit) => t(`tool.aufmass.unit.${unit}`)
  const errorLabel = (code: MeasureErrorCode | null) => (code ? t(`tool.aufmass.error.${code}`) : '')

  const labels: ExportLabels = {
    title: t('tool.aufmass.title'),
    client: t('tool.aufmass.doc.client'),
    section: t('tool.aufmass.section'),
    quantity: t('tool.aufmass.position.quantity'),
    unit: t('tool.aufmass.position.unit'),
    unitPrice: t('tool.aufmass.position.price'),
    amount: t('tool.aufmass.position.amount'),
    measure: t('tool.aufmass.rows'),
    sum: t('tool.aufmass.section.sum'),
    total: t('tool.aufmass.total'),
    expression: t('tool.aufmass.row.expression')
  }
  const options = exportOptionsFor(locale, labels)

  const change = (next: AufmassDocument) => {
    loaded.current = true
    setNotice('')
    setDocument(next)
  }

  const updateSection = (sectionId: string, patch: Partial<AufmassSection>) => {
    change({ ...document, sections: document.sections.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)) })
  }

  const addSection = () => {
    change({ ...document, sections: [...document.sections, { id: newId('sec'), label: '', rows: [], positions: [] }] })
  }

  const addRow = (sectionId: string) => {
    // Flächen sind der häufigste Fall im Aufmaß — deshalb ist m² die Voreinstellung einer Zeile.
    const row: AufmassRow = { id: newId('row'), label: '', expression: '', unit: 'm2' }
    const section = document.sections.find((item) => item.id === sectionId)
    if (!section) return
    updateSection(sectionId, { rows: [...section.rows, row] })
  }

  const addPosition = (sectionId: string) => {
    const position: AufmassPosition = { id: newId('pos'), label: '', quantity: '', sourceRowId: null, unit: 'm', unitPrice: '' }
    const section = document.sections.find((item) => item.id === sectionId)
    if (!section) return
    updateSection(sectionId, { positions: [...section.positions, position] })
  }

  const fileName = (extension: string) => {
    const base = (document.title || t('tool.aufmass.title')).trim().replace(/[^\p{L}\p{N} ._-]/gu, '-').slice(0, 60) || 'aufmass'
    return `${base}.${extension}`
  }

  const copyText = async () => {
    const text = toText(computed, options, unitLabel)
    try {
      await navigator.clipboard.writeText(text)
      setNotice(t('tool.aufmass.export.copied'))
    } catch {
      setNotice(t('tool.aufmass.export.failed'))
    }
  }

  const csvBlob = () => new Blob([`\uFEFF${toCsv(computed, options)}`], { type: 'text/csv;charset=utf-8' })

  const pdfBlob = async (): Promise<Blob | null> => {
    setBusy(true)
    try {
      const bytes = await buildAufmassPdf(computed, {
        title: labels.title,
        client: labels.client,
        rows: labels.measure,
        positions: t('tool.aufmass.positions'),
        quantity: labels.quantity,
        unit: labels.unit,
        unitPrice: labels.unitPrice,
        amount: labels.amount,
        sum: labels.sum,
        sectionSum: t('tool.aufmass.section.sum'),
        total: labels.total,
        totals: t('tool.aufmass.totals')
      }, locale, unitLabel)
      return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
    } finally {
      setBusy(false)
    }
  }

  const quantities = measureUnits.filter((unit) => computed.totalsByUnit[unit] !== undefined)

  return (
    <div className="stack">
      <div className="settings-card stack">
        <div className="field">
          <label htmlFor="aufmass-title">{t('tool.aufmass.doc.title')}</label>
          <input
            id="aufmass-title"
            type="text"
            value={document.title}
            placeholder={t('tool.aufmass.doc.placeholder')}
            onChange={(event) => change({ ...document, title: event.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="aufmass-client">{t('tool.aufmass.doc.client')}</label>
          <input
            id="aufmass-client"
            type="text"
            value={document.client}
            onChange={(event) => change({ ...document, client: event.target.value })}
          />
        </div>
        <div className="download-row">
          <button type="button" onClick={addSection}>{t('tool.aufmass.section.add')}</button>
          <button
            type="button"
            disabled={!restorable}
            onClick={() => void readSheet().then((stored) => {
              if (!stored) { setNotice(t('tool.aufmass.doc.nothingStored')); return }
              change(stored)
              setRestorable(false)
              setNotice(t('tool.aufmass.doc.stored'))
            })}
          >
            {t('tool.aufmass.doc.restore')}
          </button>
          <button
            type="button"
            onClick={() => void clearSheet().then(() => {
              loaded.current = true
              setRestorable(false)
              setDocument({ ...emptyDocumentState })
            })}
          >
            {t('tool.aufmass.doc.clear')}
          </button>
        </div>
      </div>

      {document.sections.length === 0 && <p className="scan-note">{t('tool.aufmass.section.empty')}</p>}

      {document.sections.map((section, sectionIndex) => {
        const result = computed.sections.find((item) => item.id === section.id)
        return (
          <fieldset className="settings-card stack" key={section.id}>
            <legend>{`${t('tool.aufmass.section')} ${sectionIndex + 1}`}</legend>

            <div className="field">
              <label htmlFor={`aufmass-section-${section.id}`}>{t('tool.aufmass.section')}</label>
              <input
                id={`aufmass-section-${section.id}`}
                type="text"
                value={section.label}
                placeholder={t('tool.aufmass.section.untitled')}
                onChange={(event) => updateSection(section.id, { label: event.target.value })}
              />
            </div>

            <h3>{t('tool.aufmass.rows')}</h3>
            {section.rows.map((row) => {
              const computedRow = result?.rows.find((item) => item.id === row.id)
              return (
                <div className="form-grid" key={row.id}>
                  <div className="field">
                    <label htmlFor={`row-label-${row.id}`}>{t('tool.aufmass.row.label')}</label>
                    <input
                      id={`row-label-${row.id}`}
                      type="text"
                      value={row.label}
                      onChange={(event) => updateSection(section.id, {
                        rows: section.rows.map((item) => (item.id === row.id ? { ...item, label: event.target.value } : item))
                      })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`row-expression-${row.id}`}>{t('tool.aufmass.row.expression')}</label>
                    <input
                      id={`row-expression-${row.id}`}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      placeholder={t('tool.aufmass.row.hint')}
                      value={row.expression}
                      onChange={(event) => updateSection(section.id, {
                        rows: section.rows.map((item) => (item.id === row.id ? { ...item, expression: event.target.value } : item))
                      })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`row-unit-${row.id}`}>{t('tool.aufmass.position.unit')}</label>
                    <select
                      id={`row-unit-${row.id}`}
                      value={row.unit}
                      onChange={(event) => updateSection(section.id, {
                        rows: section.rows.map((item) => (item.id === row.id ? { ...item, unit: event.target.value as MeasureUnit } : item))
                      })}
                    >
                      {measureUnits.map((unit) => <option key={unit} value={unit}>{unitLabel(unit)}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <span className="scan-note">{t('tool.aufmass.row.result')}</span>
                    <output aria-live="polite">
                      {computedRow?.error
                        ? errorLabel(computedRow.error)
                        : `${formatValue(computedRow?.display ?? '', locale, MEASURE_DECIMALS)} ${computedRow ? unitLabel(computedRow.unit) : ''}`}
                    </output>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { rows: section.rows.filter((item) => item.id !== row.id) })}
                  >
                    {t('tool.aufmass.row.remove')}
                  </button>
                </div>
              )
            })}
            <button type="button" onClick={() => addRow(section.id)}>{t('tool.aufmass.row.add')}</button>

            <h3>{t('tool.aufmass.positions')}</h3>
            {section.positions.map((position) => {
              const computedPosition = result?.positions.find((item) => item.id === position.id)
              // Ist eine Quelle gesetzt, bestimmt sie die Einheit — siehe Auswahl oben.
              const sourceUnit = position.sourceRowId
                ? section.rows.find((item) => item.id === position.sourceRowId)?.unit
                : undefined
              return (
                <div className="form-grid" key={position.id}>
                  <div className="field">
                    <label htmlFor={`pos-label-${position.id}`}>{t('tool.aufmass.position.label')}</label>
                    <input
                      id={`pos-label-${position.id}`}
                      type="text"
                      value={position.label}
                      onChange={(event) => updateSection(section.id, {
                        positions: section.positions.map((item) => (item.id === position.id ? { ...item, label: event.target.value } : item))
                      })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`pos-source-${position.id}`}>{t('tool.aufmass.position.source')}</label>
                    <select
                      id={`pos-source-${position.id}`}
                      value={position.sourceRowId ?? ''}
                      onChange={(event) => {
                        // Die Einheit kommt mit der Quelle: Sonst könnte eine Menge in Metern an
                        // einem Quadratmeterpreis hängen — die Zahl wäre dann falsch zu lesen.
                        const chosen = event.target.value
                        const row = section.rows.find((item) => item.id === chosen)
                        updateSection(section.id, {
                          positions: section.positions.map((item) => (item.id === position.id
                            ? { ...item, sourceRowId: chosen || null, unit: row ? row.unit : item.unit }
                            : item))
                        })
                      }}
                    >
                      <option value="">{t('tool.aufmass.position.own')}</option>
                      {section.rows.map((row) => (
                        <option key={row.id} value={row.id}>{row.label || row.expression || t('tool.aufmass.row.legend')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`pos-quantity-${position.id}`}>{t('tool.aufmass.position.quantity')}</label>
                    <input
                      id={`pos-quantity-${position.id}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      disabled={position.sourceRowId !== null}
                      value={position.sourceRowId !== null ? (computedPosition?.quantityDisplay ?? '') : position.quantity}
                      onChange={(event) => updateSection(section.id, {
                        positions: section.positions.map((item) => (item.id === position.id ? { ...item, quantity: event.target.value } : item))
                      })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`pos-unit-${position.id}`}>{t('tool.aufmass.position.unit')}</label>
                    {sourceUnit ? (
                      <output id={`pos-unit-${position.id}`}>{unitLabel(sourceUnit)}</output>
                    ) : (
                      <select
                        id={`pos-unit-${position.id}`}
                        value={position.unit}
                        onChange={(event) => updateSection(section.id, {
                          positions: section.positions.map((item) => (item.id === position.id ? { ...item, unit: event.target.value as MeasureUnit } : item))
                        })}
                      >
                        {measureUnits.map((unit) => <option key={unit} value={unit}>{unitLabel(unit)}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor={`pos-price-${position.id}`}>{t('tool.aufmass.position.price')}</label>
                    <input
                      id={`pos-price-${position.id}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={position.unitPrice}
                      onChange={(event) => updateSection(section.id, {
                        positions: section.positions.map((item) => (item.id === position.id ? { ...item, unitPrice: event.target.value } : item))
                      })}
                    />
                  </div>
                  <div className="field">
                    <span className="scan-note">{t('tool.aufmass.position.amount')}</span>
                    <output aria-live="polite">
                      {computedPosition?.error
                        ? errorLabel(computedPosition.error)
                        : formatValue(computedPosition?.amountDisplay ?? '', locale, MONEY_DECIMALS)}
                    </output>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { positions: section.positions.filter((item) => item.id !== position.id) })}
                  >
                    {t('tool.aufmass.position.remove')}
                  </button>
                </div>
              )
            })}
            <button type="button" onClick={() => addPosition(section.id)}>{t('tool.aufmass.position.add')}</button>

            <p className="scan-note">
              {t('tool.aufmass.section.sum')}: <strong>{formatValue(computed.sectionTotals[section.id] ?? '', locale, MONEY_DECIMALS)}</strong>
            </p>
            <button type="button" onClick={() => change({ ...document, sections: document.sections.filter((item) => item.id !== section.id) })}>
              {t('tool.aufmass.section.remove')}
            </button>
          </fieldset>
        )
      })}

      <div className="results">
        <h2>{t('tool.aufmass.totals')}</h2>
        {quantities.length === 0 && <p className="scan-note">{t('tool.aufmass.noQuantities')}</p>}
        {quantities.length > 0 && (
          <dl>
            {quantities.map((unit) => (
              <div key={unit}>
                <dt>{unitLabel(unit)}</dt>
                <dd>{formatValue(computed.totalsByUnit[unit] ?? '', locale, MEASURE_DECIMALS)}</dd>
              </div>
            ))}
          </dl>
        )}
        <p>
          {t('tool.aufmass.total')}: <strong>{formatValue(computed.totalAmount, locale, MONEY_DECIMALS)}</strong>
        </p>
      </div>

      <div className="settings-card stack">
        <h2>{t('tool.aufmass.export')}</h2>
        <div className="download-row">
          <SaveFileControl
            suggestedName={fileName('csv')}
            mimeType="text/csv"
            t={t}
            getBlob={async () => csvBlob()}
          />
          <SaveFileControl
            suggestedName={fileName('pdf')}
            mimeType="application/pdf"
            t={t}
            getBlob={pdfBlob}
          />
          <button type="button" onClick={() => void copyText()}>{t('tool.aufmass.export.text')}</button>
        </div>
        {busy && <p className="scan-note" aria-live="polite">{t('tool.aufmass.export.working')}</p>}
        {notice && <p className="scan-note" aria-live="polite">{notice}</p>}
        <p className="scan-note">{t('tool.aufmass.export.spreadsheet')}</p>
        <p className="scan-note">{t('tool.aufmass.privacy')}</p>
      </div>

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note" style={{ whiteSpace: 'pre-line' }}>{t('tool.aufmass.formulas')}</p>
        <h3>{t('tool.calcCommon.assumptions')}</h3>
        <p className="scan-note">{t('tool.aufmass.assumptions')}</p>
        <p className="scan-note">{t('tool.aufmass.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.aufmass.summary')}</p>
      <LocalBadge />
    </div>
  )
}

const emptyDocumentState: AufmassDocument = { title: '', client: '', sections: [] }
