import { useState } from 'react'
import {
  lightingErrorKeys,
  lightingMaintenanceFactor,
  lightingResult,
  lightingRoomTypes,
  lightingSources,
  maintenanceFactorSpan,
  roomTypeById,
  roomTypeSpan,
  sourceById,
  type LightingInput
} from '@commietools/tools/craft/lighting'

type Translate = (key: string) => string

interface LightingProps {
  readonly t: Translate
  readonly locale: string
}

/** Zahl aus einem Textfeld. Leer oder unbrauchbar ergibt `NaN` — das fällt dann durch die Prüfung. */
function alsZahl(text: string): number {
  const bereinigt = text.trim().replace(',', '.')
  return bereinigt === '' ? Number.NaN : Number(bereinigt)
}

/** Anzeige einer Zahl in der Sprache des Nutzers; `stellen` steuert die Nachkommastellen. */
function zahl(wert: number, locale: string, stellen = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: stellen }).format(wert)
}

export function Lighting({ t, locale }: LightingProps) {
  const ersteId = lightingRoomTypes[0]?.id ?? ''
  const [roomId, setRoomId] = useState(ersteId)
  const [area, setArea] = useState('20')
  const [lux, setLux] = useState(String(roomTypeById(ersteId)?.defaultLux ?? 500))
  const [maintenanceFactor, setMaintenanceFactor] = useState('0.8')
  const [lumensPerLuminaire, setLumensPerLuminaire] = useState('2500')
  const [uniformity, setUniformity] = useState('0.6')

  // Raumwechsel setzt den Soll-Wert auf den belegten Vorschlag dieses Raumtyps — der Nutzer kann ihn
  // danach frei ändern. Absicht: der Vorschlag darf nicht stillschweigend von der alten Auswahl stehen
  // bleiben, sonst rechnet man mit einem Wert, der zu einem anderen Raumtyp gehört.
  function waehleRaum(next: string): void {
    setRoomId(next)
    const neuerRaum = roomTypeById(next)
    if (neuerRaum) setLux(String(neuerRaum.defaultLux))
  }

  const input: LightingInput = {
    roomTypeId: roomId,
    area: alsZahl(area),
    lux: alsZahl(lux),
    maintenanceFactor: alsZahl(maintenanceFactor),
    lumensPerLuminaire: alsZahl(lumensPerLuminaire),
    uniformity: alsZahl(uniformity)
  }

  const fehler = lightingErrorKeys(input)
  const ergebnis = fehler.length === 0 ? lightingResult(input) : null
  const mfSpanne = maintenanceFactorSpan()
  const raum = roomTypeById(roomId)

  return (
    <div className="stack">
      <section className="settings-card">
        <div className="form-grid">
          <label className="field">
            <span>{t('tool.lighting.roomType')}</span>
            <select value={roomId} onChange={(event) => waehleRaum(event.target.value)} aria-label={t('tool.lighting.roomType')}>
              {lightingRoomTypes.map((eintrag) => (
                <option key={eintrag.id} value={eintrag.id}>{t(eintrag.labelKey)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('tool.lighting.lux')}</span>
            <input inputMode="decimal" value={lux} aria-label={t('tool.lighting.lux')} onChange={(event) => setLux(event.target.value)} />
            {raum?.conflict && (
              <small className="lighting-span" role="note">{`${t('tool.lighting.spanLabel')}: ${zahl(roomTypeSpan(raum).min, locale)}–${zahl(roomTypeSpan(raum).max, locale)} lx`}</small>
            )}
          </label>
          <label className="field">
            <span>{t('tool.lighting.area')}</span>
            <input inputMode="decimal" value={area} aria-label={t('tool.lighting.area')} onChange={(event) => setArea(event.target.value)} />
          </label>
          <label className="field">
            <span>{t('tool.lighting.maintenanceFactor')}</span>
            <input inputMode="decimal" value={maintenanceFactor} aria-label={t('tool.lighting.maintenanceFactor')} onChange={(event) => setMaintenanceFactor(event.target.value)} />
            <small className="scan-note">{t('tool.lighting.maintenanceFactor.hint')}</small>
          </label>
          <label className="field">
            <span>{t('tool.lighting.lumensPerLuminaire')}</span>
            <input inputMode="decimal" value={lumensPerLuminaire} aria-label={t('tool.lighting.lumensPerLuminaire')} onChange={(event) => setLumensPerLuminaire(event.target.value)} />
          </label>
          <label className="field">
            <span>{t('tool.lighting.uniformity')}</span>
            <input inputMode="decimal" value={uniformity} aria-label={t('tool.lighting.uniformity')} onChange={(event) => setUniformity(event.target.value)} />
            <small className="scan-note">{t('tool.lighting.uniformity.hint')}</small>
          </label>
        </div>
      </section>

      <section className="settings-card stack" aria-live="polite">
        <h2>{t('tool.lighting.result')}</h2>
        {ergebnis ? (
          <>
            <dl className="results">
              <div>
                <dt>{t('tool.lighting.result.flux')}</dt>
                <dd>{zahl(ergebnis.luminousFlux, locale)}</dd>
              </div>
              <div>
                <dt>{t('tool.lighting.result.luminaires')}</dt>
                <dd>{zahl(ergebnis.luminaires, locale)}</dd>
              </div>
            </dl>
            <p className="scan-note">{`${t('tool.lighting.step.flux')}: ${zahl(input.area, locale, 2)} × ${zahl(input.lux, locale, 2)} ÷ ${zahl(input.maintenanceFactor, locale, 3)} = ${zahl(ergebnis.luminousFlux, locale)} lm`}</p>
            <p className="scan-note">{`${t('tool.lighting.step.luminaires')}: ${zahl(ergebnis.luminousFlux, locale)} ÷ ${zahl(input.lumensPerLuminaire, locale)} = ${zahl(ergebnis.luminaires, locale)}`}</p>
            <p className="scan-note">{t('tool.lighting.result.note')}</p>
          </>
        ) : (
          <>
            <p className="scan-note">{t('tool.lighting.result.invalid')}</p>
            {fehler.map((key) => <p className="error" role="alert" key={key}>{t(key)}</p>)}
          </>
        )}
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.lighting.values')}</h2>
        {raum?.conflict && <p className="scan-note" role="note">{t('tool.lighting.conflictNote')}</p>}
        <div className="cvd-table-wrap">
          <table className="cvd-table lighting-table">
            <thead>
              <tr>
                <th scope="col">{t('tool.lighting.table.use')}</th>
                <th scope="col">{t('tool.lighting.table.lux')}</th>
                <th scope="col">{t('tool.lighting.table.source')}</th>
                <th scope="col">{t('tool.lighting.table.type')}</th>
                <th scope="col">{t('tool.lighting.table.retrieved')}</th>
                <th scope="col">{t('tool.lighting.lux.pick')}</th>
              </tr>
            </thead>
            <tbody>
              {(raum?.rows ?? []).map((zeile) => {
                const quelle = sourceById(zeile.sourceId)
                return (
                  <tr key={`${zeile.labelKey}-${zeile.lux}-${zeile.sourceId}`}>
                    <td>{t(zeile.labelKey)}</td>
                    <td>{`${zahl(zeile.lux, locale)} lx`}</td>
                    <td>{t(zeile.citationKey)}</td>
                    <td>{quelle ? t(quelle.typeKey) : ''}</td>
                    <td>{quelle?.retrieved ?? ''}</td>
                    <td>
                      <button
                        type="button"
                        className="text-link value-take"
                        aria-label={`${t('tool.lighting.lux.pick')}: ${t(zeile.labelKey)} (${zahl(zeile.lux, locale)} lx)`}
                        onClick={() => setLux(String(zeile.lux))}
                      >
                        {`${zahl(zeile.lux, locale)} lx`}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.lighting.maintenance.head')}</h2>
        <ul className="scan-note">
          {lightingMaintenanceFactor.map((eintrag) => (
            <li key={eintrag.labelKey}>{`${t(eintrag.labelKey)}: ${zahl(eintrag.factor, locale, 2)} — ${t(eintrag.citationKey)}`}</li>
          ))}
        </ul>
        <p className="scan-note">{`${t('tool.lighting.spanLabel')}: ${zahl(mfSpanne.min, locale, 2)}–${zahl(mfSpanne.max, locale, 2)}`}</p>
      </section>

      <section className="settings-card stack">
        <h2>{t('tool.lighting.sources.head')}</h2>
        <p className="scan-note">{t('tool.lighting.sources.note')}</p>
        <div className="cvd-table-wrap">
          <table className="cvd-table">
            <tbody>
              {lightingSources.map((quelle) => (
                <tr key={quelle.id}>
                  <td>{t(quelle.labelKey)}</td>
                  <td>{t(quelle.typeKey)}</td>
                  <td>{quelle.retrieved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="settings-card">
        <summary>{t('tool.lighting.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.lighting.assumptions')}</p>
        <p className="scan-note">{t('tool.lighting.sources')}</p>
      </details>
    </div>
  )
}
