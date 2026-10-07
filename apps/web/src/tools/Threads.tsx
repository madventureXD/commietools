import { useMemo, useState, type FormEvent } from 'react'
import { LocalBadge } from '@commietools/ui'
import { anzeigeKontext } from './formatContext'
import {
  KERN_D1_FAKTOR,
  THREAD_RETRIEVED,
  THREAD_SIZE_LABELS,
  THREAD_SOURCES,
  coreDiameterShown,
  coreHoleDrill,
  coreHoleRaw,
  findThreadSize,
  passageHole,
  planThreads,
  torqueRange,
  wrenchWidth,
  type StrengthGrade,
  type ThreadSeries,
  type WrenchSeries
} from '@commietools/tools/craft/threads'

type Translate = (key: string) => string

/** Liest eine Zahl aus einem Textfeld: Komma oder Punkt als Dezimaltrennzeichen. */
function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

/** Zahl in der Sprache des Nutzers, ohne überflüssige Nullen. */
function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(anzeigeKontext(locale).regionLocale, { maximumFractionDigits: 4 }).format(value)
}

/** Quellenkürzel einer Zeile als Text; leer bedeutet: kein Beleg geführt. */
function sourceText(codes: readonly string[]): string {
  return codes.length ? codes.join(' · ') : ''
}

export function Threads({ t, locale }: { t: Translate; locale: string }) {
  const [sizeLabel, setSizeLabel] = useState('M10')
  const [series, setSeries] = useState<ThreadSeries>('coarse')
  const [finePitch, setFinePitch] = useState<number | null>(null)
  const [wrenchSeries, setWrenchSeries] = useState<WrenchSeries>('iso')
  const [grade, setGrade] = useState<StrengthGrade>('8.8')
  // Überschreibungen je Wert. Leer heißt: der vorgeschlagene Wert gilt.
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [errorKey, setErrorKey] = useState('')
  const [result, setResult] = useState(false)

  const size = findThreadSize(sizeLabel)
  const pitchOptions: readonly number[] = size ? (series === 'fine' ? size.finePitches : [size.coarsePitch]) : []
  const defaultPitch = series === 'fine' ? (finePitch ?? pitchOptions[0] ?? size?.coarsePitch ?? Number.NaN) : (size?.coarsePitch ?? Number.NaN)

  const computed = useMemo(() => {
    if (!size) return null
    return {
      coreHoleRaw: coreHoleRaw(size.d, defaultPitch),
      coreHole: coreHoleDrill(size.d, defaultPitch),
      // Der theoretische Kerndurchmesser D1 des Muttergewindes — nicht der Bohrerdurchmesser.
      // Auf zwei Nachkommastellen gerundet: ungerundet stand hier 8,376100000000001 (Gleitkomma-Rest),
      // ein Millimeterwert mit fünfzehn Stellen ist im Werkzeug eine falsche Genauigkeit.
      coreDiameter: coreDiameterShown(size.d, defaultPitch),
      passage: passageHole(size, 'medium'),
      wrench: wrenchWidth(size, wrenchSeries),
      torque: torqueRange(size, grade)
    }
  }, [size, defaultPitch, wrenchSeries, grade])

  /** Angezeigter Wert: die Überschreibung, sonst der Vorschlag. */
  const shown = (key: string, fallback: number | null): string => {
    if (key in overrides) return overrides[key] ?? ''
    return fallback === null ? '' : String(fallback).replace('.', ',')
  }

  const setField = (key: string, value: string): void => setOverrides((vorher) => ({ ...vorher, [key]: value }))

  // Größe, Gewindeart und Steigung ändern die Rechengrundlage — deshalb fallen Überschreibungen
  // dann weg, statt still einen Wert aus der vorigen Größe weiterzuschleppen.
  const resetComputation = (): void => {
    setOverrides({})
    setErrorKey('')
    setResult(false)
  }

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault()
    const check = planThreads({
      sizeLabel,
      pitch: parseNumber(shown('pitch', defaultPitch)),
      coreHole: parseNumber(shown('coreHole', computed?.coreHole ?? null)),
      coreDiameter: parseNumber(shown('coreDiameter', computed?.coreDiameter ?? null)),
      passageHole: parseNumber(shown('passage', computed?.passage ?? null)),
      wrench: parseNumber(shown('wrench', computed?.wrench ?? null)),
      torqueMin: parseNumber(shown('torqueMin', computed?.torque?.minNm ?? null)),
      torqueMax: parseNumber(shown('torqueMax', computed?.torque?.maxNm ?? null))
    })
    if (!check.ok) {
      setResult(false)
      setErrorKey(check.errorKey)
      return
    }
    setErrorKey('')
    setResult(true)
  }

  // Vereinigung der Belegkürzel, die zur aktuellen Auswahl gehören — Grundlage des Quellenblocks.
  const usedCodes = useMemo(() => {
    if (!size) return []
    const menge = new Set<string>([
      ...size.coarseSources,
      ...size.fineSources,
      ...size.coreHoleSources,
      ...size.wrenchSources,
      ...size.passageSources,
      ...size.torque.flatMap((range) => range.sources)
    ])
    return [...menge].sort((a, b) => a.localeCompare(b, 'en'))
  }, [size])

  return (
    <div className="stack">
      <form className="settings-card stack" onSubmit={onSubmit}>
        <h2>{t('tool.threads.input')}</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="threads-size">{t('tool.threads.size')}</label>
            <select id="threads-size" value={sizeLabel} onChange={(event) => { setSizeLabel(event.target.value); setFinePitch(null); resetComputation() }}>
              {THREAD_SIZE_LABELS.map((label) => <option key={label} value={label}>{label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="threads-series">{t('tool.threads.series')}</label>
            <select id="threads-series" value={series} onChange={(event) => { setSeries(event.target.value === 'fine' ? 'fine' : 'coarse'); setFinePitch(null); resetComputation() }}>
              <option value="coarse">{t('tool.threads.series.coarse')}</option>
              <option value="fine">{t('tool.threads.series.fine')}</option>
            </select>
          </div>
          {series === 'fine' && pitchOptions.length > 1 && (
            <div className="field">
              <label htmlFor="threads-fine">{t('tool.threads.pitch')}</label>
              <select id="threads-fine" value={String(finePitch ?? pitchOptions[0])} onChange={(event) => { setFinePitch(Number(event.target.value)); resetComputation() }}>
                {pitchOptions.map((pitch) => <option key={pitch} value={String(pitch)}>{formatNumber(pitch, locale)} mm</option>)}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="threads-pitch">{t('tool.threads.pitch')}</label>
            <input id="threads-pitch" type="text" inputMode="decimal" autoComplete="off" value={shown('pitch', defaultPitch)} onChange={(event) => setField('pitch', event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="threads-wrench-series">{t('tool.threads.wrenchSeries')}</label>
            <select id="threads-wrench-series" value={wrenchSeries} onChange={(event) => { setWrenchSeries(event.target.value === 'din' ? 'din' : 'iso'); setErrorKey(''); setResult(false) }}>
              <option value="iso">{t('tool.threads.wrenchSeries.iso')}</option>
              <option value="din">{t('tool.threads.wrenchSeries.din')}</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="threads-grade">{t('tool.threads.grade')}</label>
            <select id="threads-grade" value={grade} onChange={(event) => { setGrade(event.target.value === '10.9' ? '10.9' : '8.8'); setErrorKey(''); setResult(false) }}>
              <option value="8.8">8.8</option>
              <option value="10.9">10.9</option>
            </select>
          </div>
        </div>
        {series === 'fine' && pitchOptions.length === 0 && <p className="scan-note">{t('tool.threads.noFine')}</p>}
        <button type="submit">{t('tool.craft.calculate')}</button>
      </form>

      {computed && size && (
        <div className="settings-card stack">
          <h2>{t('tool.threads.result')}</h2>
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool.threads.valueColumn')}</th>
                  <th scope="col">{t('tool.threads.formulaColumn')}</th>
                  <th scope="col">{t('tool.threads.sourceColumn')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <label htmlFor="threads-core-hole">{t('tool.threads.coreHole')}</label>
                    <input id="threads-core-hole" type="text" inputMode="decimal" autoComplete="off" value={shown('coreHole', computed.coreHole)} onChange={(event) => setField('coreHole', event.target.value)} />
                    {size.coreHoleTable !== null && <small className="scan-note">{`${t('tool.threads.comparisonNote')} ${formatNumber(size.coreHoleTable, locale)} mm`}</small>}
                  </th>
                  <td><code>{`Ø_K = d − P = ${formatNumber(size.d, locale)} − ${formatNumber(defaultPitch, locale)} = ${formatNumber(computed.coreHoleRaw, locale)}`}</code></td>
                  <td>{sourceText(size.coreHoleSources)}</td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="threads-core-diameter">{t('tool.threads.coreDiameter')}</label>
                    <input id="threads-core-diameter" type="text" inputMode="decimal" autoComplete="off" value={shown('coreDiameter', computed.coreDiameter)} onChange={(event) => setField('coreDiameter', event.target.value)} />
                  </th>
                  <td><code>{`D1 = d − ${String(KERN_D1_FAKTOR).replace('.', ',')} · P`}</code></td>
                  <td>{sourceText(['FS1'])}</td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="threads-passage">{t('tool.threads.passageHole')}</label>
                    <input id="threads-passage" type="text" inputMode="decimal" autoComplete="off" value={shown('passage', computed.passage)} onChange={(event) => setField('passage', event.target.value)} />
                    <small className="scan-note">{t('tool.threads.notVerified')}</small>
                  </th>
                  <td><code>DIN EN 20273 (ISO 273)</code></td>
                  <td>{sourceText(size.passageSources)}</td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="threads-wrench">{t('tool.threads.wrench')}</label>
                    <input id="threads-wrench" type="text" inputMode="decimal" autoComplete="off" value={shown('wrench', computed.wrench)} onChange={(event) => setField('wrench', event.target.value)} />
                    {computed.wrench === null && <small className="scan-note">{t('tool.threads.notListed')}</small>}
                  </th>
                  <td><code>{wrenchSeries === 'iso' ? 'EN ISO 4014/4032' : 'DIN 931/934'}</code></td>
                  <td>{sourceText(size.wrenchSources)}</td>
                </tr>
                <tr>
                  <th scope="row">
                    <label htmlFor="threads-torque-min">{t('tool.threads.torque')}</label>
                    <div className="download-row">
                      <input id="threads-torque-min" aria-label={`${t('tool.threads.torque')} ${t('tool.threads.torqueFrom')}`} type="text" inputMode="decimal" autoComplete="off" value={shown('torqueMin', computed.torque?.minNm ?? null)} onChange={(event) => setField('torqueMin', event.target.value)} />
                      <span aria-hidden="true">–</span>
                      <input id="threads-torque-max" aria-label={`${t('tool.threads.torque')} ${t('tool.threads.torqueTo')}`} type="text" inputMode="decimal" autoComplete="off" value={shown('torqueMax', computed.torque?.maxNm ?? null)} onChange={(event) => setField('torqueMax', event.target.value)} />
                    </div>
                    {computed.torque === null && <small className="scan-note">{t('tool.threads.notListed')}</small>}
                    {computed.torque?.single && <small className="scan-note">{t('tool.threads.torqueSingle')}</small>}
                  </th>
                  <td><code>M = Richtwert</code></td>
                  <td>{sourceText(computed.torque?.sources ?? [])}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="scan-note">{t('tool.threads.editableHint')}</p>
          <p className="scan-note">{t('tool.threads.torqueSpanNote')}</p>
          <p className="scan-note">{t('tool.threads.torqueHint')}</p>
          <button type="button" className="text-link" onClick={resetComputation}>{t('tool.craft.reset')}</button>
        </div>
      )}

      {errorKey && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.threads.result')}</h2>
          <p className="error" role="alert">{t(errorKey)}</p>
        </div>
      )}

      {result && errorKey === '' && (
        <div className="results" aria-live="polite">
          <h2>{t('tool.threads.result')}</h2>
          <p className="scan-note">{t('tool.threads.editableHint')}</p>
        </div>
      )}

      <details className="settings-card" open>
        <summary>{t('tool.threads.sourcesHead')}</summary>
        <p className="scan-note">{`${t('tool.threads.retrieved')}: ${THREAD_RETRIEVED}`}</p>
        <dl className="metadata-entries">
          {usedCodes.map((code) => {
            const quelle = THREAD_SOURCES.find((eintrag) => eintrag.code === code)
            return (
              <div key={code}>
                <dt>{code}</dt>
                <dd>
                  {t(`tool.threads.source.${code}`)}
                  {/* Die Adresse steht als Text, nicht als Verweis: In diesem Projekt zeigen alle
                      Werkzeuge ihre Quellen als Text (kein Werkzeug außer diesem verlinkte sie), und
                      ein Verweis wäre mit rund 21 px Höhe ein zu kleines Bedienziel für die
                      Barrierefreiheitsprüfung (44 px). Kopieren ist möglich, Absprung nicht. */}
                  {quelle && <> <span className="source-url">{quelle.url}</span></>}
                </dd>
              </div>
            )
          })}
        </dl>
      </details>

      <details className="settings-card">
        <summary>{t('tool.threads.formulaSection')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.threads.assumptions')}</p>
        <p className="scan-note">{t('tool.threads.narrativeSources')}</p>
      </details>

      <p className="privacy-note">{t('tool.threads.summary')}</p>
      <LocalBadge />
    </div>
  )
}
