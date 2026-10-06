import { useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import {
  buildGeometry,
  findRoots,
  sampleTable,
  segmentToPath,
  type PlotCurve,
  type PlotGeometry,
  type PlotOptions
} from '@commietools/tools/calculator/plotter'

type Translate = (key: string) => string

/** Kurvenfarben — bewusst wenige und klar unterscheidbare. */
const COLORS = ['#c91f2c', '#1f6fc9', '#1f9c53', '#b57b12', '#7a3fa8']

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value.trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function Plotter({ t }: { t: Translate }) {
  const [curvesText, setCurvesText] = useState('')
  const [xMin, setXMin] = useState('-10')
  const [xMax, setXMax] = useState('10')
  const [yMin, setYMin] = useState('')
  const [yMax, setYMax] = useState('')
  const [rows, setRows] = useState('21')
  const [shown, setShown] = useState(false)

  const curves: readonly PlotCurve[] = useMemo(() => {
    const lines = curvesText.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean)
    // Der Fallback ist nötig, weil der Indexzugriff ohne Prüfung  liefern kann.
    return lines.map((expression, index) => ({ expression, color: COLORS[index % COLORS.length] ?? '#c91f2c' }))
  }, [curvesText])

  const options: PlotOptions = useMemo(() => {
    const low = numberOr(xMin, -10)
    const high = numberOr(xMax, 10)
    const yLow = yMin.trim() ? numberOr(yMin, Number.NaN) : undefined
    const yHigh = yMax.trim() ? numberOr(yMax, Number.NaN) : undefined
    return {
      xMin: Math.min(low, high),
      xMax: Math.max(low, high),
      ...(yLow !== undefined && Number.isFinite(yLow) ? { yMin: yLow } : {}),
      ...(yHigh !== undefined && Number.isFinite(yHigh) ? { yMax: yHigh } : {})
    }
  }, [xMin, xMax, yMin, yMax])

  const [result, setResult] = useState<{
    geometry: PlotGeometry
    table: ReturnType<typeof sampleTable>
    roots: ReturnType<typeof findRoots>
  } | null>(null)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!curves.length) { setShown(false); setResult(null); return }
    setResult({
      geometry: buildGeometry(curves, options),
      table: sampleTable(curves, options, Math.max(2, Math.min(101, Math.round(numberOr(rows, 21))))),
      roots: findRoots(curves, options)
    })
    setShown(true)
  }

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="plotter-curves">{t('tool.plotter.field.curves')}</label>
          <textarea
            id="plotter-curves"
            rows={3}
            spellCheck={false}
            placeholder="x^2 - 4"
            value={curvesText}
            onChange={(event) => setCurvesText(event.target.value)}
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="plotter-xmin">{t('tool.plotter.field.xMin')}</label>
            <input id="plotter-xmin" type="text" autoComplete="off" value={xMin} onChange={(event) => setXMin(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="plotter-xmax">{t('tool.plotter.field.xMax')}</label>
            <input id="plotter-xmax" type="text" autoComplete="off" value={xMax} onChange={(event) => setXMax(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="plotter-ymin">{t('tool.plotter.field.yMin')}</label>
            <input id="plotter-ymin" type="text" autoComplete="off" value={yMin} onChange={(event) => setYMin(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="plotter-ymax">{t('tool.plotter.field.yMax')}</label>
            <input id="plotter-ymax" type="text" autoComplete="off" value={yMax} onChange={(event) => setYMax(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="plotter-rows">{t('tool.plotter.field.samples')}</label>
            <input id="plotter-rows" type="text" inputMode="numeric" autoComplete="off" value={rows} onChange={(event) => setRows(event.target.value)} />
          </div>
        </div>
        <button type="submit">{t('tool.calcCommon.calculate')}</button>
        <p className="scan-note">{t('tool.plotter.note.engine')}</p>
      </form>

      {shown && result && (
        <div className="settings-card stack">
          <h2>{t('tool.plotter.out.plot')}</h2>
          <div className="plot-target">
            <svg viewBox={`0 0 ${result.geometry.width} ${result.geometry.height}`} role="img" aria-label={t('tool.plotter.out.plot')}>
              {result.geometry.grid.map((line) => line.axis === 'x'
                ? <line key={`gx-${line.value}`} x1={line.position} y1={0} x2={line.position} y2={result.geometry.height} stroke="#dddddd" strokeWidth={1} />
                : <line key={`gy-${line.value}`} x1={0} y1={line.position} x2={result.geometry.width} y2={line.position} stroke="#dddddd" strokeWidth={1} />)}
              <line x1={0} y1={result.geometry.zeroLine} x2={result.geometry.width} y2={result.geometry.zeroLine} stroke="#888888" strokeWidth={1.4} />
              <line x1={46} y1={0} x2={46} y2={result.geometry.height} stroke="#888888" strokeWidth={1.4} />
              {result.geometry.paths.flatMap((path) => path.segments.map((segment, index) => (
                <path key={`${path.expression}-${index}`} d={segmentToPath(segment)} fill="none" stroke={path.color} strokeWidth={1.8} />
              )))}
              {result.geometry.xLabels.map((label) => (
                <text key={`lx-${label.label}-${label.x}`} x={label.x} y={result.geometry.height - 8} fontSize={11} textAnchor="middle" fill="#666666">{label.label}</text>
              ))}
              {result.geometry.yLabels.map((label) => (
                <text key={`ly-${label.label}-${label.y}`} x={38} y={label.y + 4} fontSize={11} textAnchor="end" fill="#666666">{label.label}</text>
              ))}
            </svg>
          </div>
          <ul className="segment-list">
            {curves.map((curve) => (
              <li key={curve.expression} style={{ borderColor: curve.color }}>
                <span aria-hidden="true" style={{ color: curve.color }}>■</span> {curve.expression}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && result.roots.length > 0 && (
        <div className="settings-card stack">
          <h2>{t('tool.plotter.out.roots')}</h2>
          <ul className="metadata-entries">
            {result.roots.map((root) => (
              <li key={`${root.curve}-${root.x}`}>
                <code>{curves[root.curve]?.expression} = 0 → x = {root.x}</code>
              </li>
            ))}
          </ul>
          <p className="scan-note">{t('tool.plotter.note.roots')}</p>
        </div>
      )}

      {result?.table.length ? (
        <div className="settings-card stack">
          <h2>{t('tool.plotter.out.table')}</h2>
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool.plotter.out.x')}</th>
                  {curves.map((curve) => <th key={curve.expression} scope="col">{curve.expression}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.table.map((row) => (
                  <tr key={row.x}>
                    <th scope="row">{row.x}</th>
                    {row.values.map((value, index) => (
                      <td key={`${row.x}-${index}`}>{value === null ? t('tool.plotter.out.notDefined') : value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.plotter.note.table')}</p>
        </div>
      ) : null}

      <details className="settings-card">
        <summary>{t('tool.calcCommon.formula')}</summary>
        <p className="scan-note">{t('tool.plotter.formulas')}</p>
        <h2>{t('tool.calcCommon.assumptions')}</h2>
        <p className="scan-note">{t('tool.plotter.assumptions')}</p>
        <p className="scan-note">{t('tool.plotter.sources')}</p>
        <p className="scan-note">{t('tool.calcCommon.lastChecked')}</p>
      </details>

      <p className="privacy-note">{t('tool.plotter.summary')}</p>
      <LocalBadge />
    </div>
  )
}
