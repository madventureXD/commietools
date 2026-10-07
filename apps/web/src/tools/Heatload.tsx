import { useMemo, useState } from 'react'
import { LocalBadge } from '@commietools/ui'
import { anzeigeKontext } from './formatContext'
import {
  AIR_DENSITY,
  AIR_DENSITY_SOURCE,
  AIR_HEAT_CAPACITY,
  AIR_HEAT_CAPACITY_SOURCE,
  HEATLOAD_RETRIEVED,
  airChangePresets,
  heatloadLimits,
  heatloadSourceById,
  heatloadSourceOfSurface,
  heatloadSources,
  planHeatload,
  roomUses,
  roomUseById,
  uValueCategories,
  uValuePresetById,
  uValuePresets,
  type HeatloadInput,
  type RoomUseKey
} from '@commietools/tools/craft/heatload'

type Translate = (key: string) => string

/**
 * Heizlast-Überschlag je Raum (Werkzeug 16).
 *
 * Der Entwurf wird live gerechnet: jede Änderung an Raum, Bauteil oder Außen-Auslegungstemperatur
 * fließt sofort in das Ergebnis. Die Außen-Auslegungstemperatur startet **leer** — sie ist in den
 * Quellen nicht belegt und ortsabhängig, deshalb kein Vorbelegungswert.
 */

interface SurfaceDraft {
  readonly id: string
  readonly presetId: string
  readonly area: string
  readonly uValue: string
}

interface RoomDraft {
  readonly id: string
  readonly name: string
  readonly use: RoomUseKey
  readonly indoorTemp: string
  readonly floorArea: string
  readonly height: string
  readonly airChange: string
  readonly surfaces: readonly SurfaceDraft[]
}

let laufendeNummer = 1

/** Zahl aus einem Textfeld: Komma oder Punkt als Dezimaltrennzeichen; leer → NaN. */
function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(',', '.')
  if (!cleaned) return Number.NaN
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : Number.NaN
}

/** Zahl als Textfeld in deutscher Schreibweise; nicht endliche Werte werden leer. */
function preset(value: number): string {
  return Number.isFinite(value) ? String(value).replace('.', ',') : ''
}

/** Zahl in der Sprache des Nutzers. */
function formatValue(value: number, locale: string, digits = 1): string {
  return new Intl.NumberFormat(anzeigeKontext(locale).regionLocale, { maximumFractionDigits: digits }).format(value)
}

function leereFlaeche(): SurfaceDraft {
  return { id: `flaeche-${laufendeNummer++}`, presetId: '', area: '', uValue: '' }
}

function leererRaum(): RoomDraft {
  const nutzung = roomUseById('wohnen')
  return {
    id: `raum-${laufendeNummer++}`,
    name: '',
    use: nutzung.id,
    indoorTemp: preset(nutzung.indoorTemp),
    floorArea: '',
    height: '2,5',
    airChange: '0,5',
    surfaces: [leereFlaeche()]
  }
}

/** Nur die öffentlichen Quellen; der „eigene Wert" hat keine URL und bleibt im Block draußen. */
const oeffentlicheQuellen = heatloadSources.filter((quelle) => quelle.id !== 'custom')

export function Heatload({ t, locale }: { t: Translate; locale: string }) {
  const [outdoorTemp, setOutdoorTemp] = useState('')
  const [rooms, setRooms] = useState<readonly RoomDraft[]>([leererRaum()])

  const input: HeatloadInput = useMemo(
    () => ({
      outdoorTemp: parseNumber(outdoorTemp),
      rooms: rooms.map((raum) => ({
        id: raum.id,
        name: raum.name,
        use: raum.use,
        indoorTemp: parseNumber(raum.indoorTemp),
        floorArea: parseNumber(raum.floorArea),
        height: parseNumber(raum.height),
        airChange: parseNumber(raum.airChange),
        surfaces: raum.surfaces.map((flaeche) => ({
          id: flaeche.id,
          presetId: flaeche.presetId,
          area: parseNumber(flaeche.area),
          uValue: parseNumber(flaeche.uValue)
        }))
      }))
    }),
    [outdoorTemp, rooms]
  )

  const plan = useMemo(() => planHeatload(input), [input])
  const fehler = useMemo(() => [...new Set(plan.errors)], [plan.errors])

  function setzeRaum(id: string, patch: Partial<RoomDraft>): void {
    setRooms((vorher) => vorher.map((raum) => (raum.id === id ? { ...raum, ...patch } : raum)))
  }

  function setzeFlaeche(raumId: string, flaecheId: string, patch: Partial<SurfaceDraft>): void {
    setRooms((vorher) =>
      vorher.map((raum) =>
        raum.id === raumId
          ? { ...raum, surfaces: raum.surfaces.map((flaeche) => (flaeche.id === flaecheId ? { ...flaeche, ...patch } : flaeche)) }
          : raum
      )
    )
  }

  /** Nutzung wählen setzt die Innentemperatur der Nutzung — sie bleibt danach änderbar. */
  function waehleNutzung(raum: RoomDraft, use: RoomUseKey): void {
    setzeRaum(raum.id, { use, indoorTemp: preset(roomUseById(use).indoorTemp) })
  }

  const raumName = (index: number): string => rooms[index]?.name.trim() || `${t('tool.heatload.room')} ${index + 1}`

  return (
    <div className="stack">
      {/* Untertitel: trägt die Abgrenzung direkt unter der Überschrift (Bezeichnung). */}
      <p className="scan-note" data-role="heatload-subtitle">{t('tool.heatload.subtitle')}</p>

      <section className="settings-card stack">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="heatload-outdoor-temp">{t('tool.heatload.outdoorTemp')}</label>
            <input
              id="heatload-outdoor-temp"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={outdoorTemp}
              placeholder={t('tool.heatload.outdoorTempPlaceholder')}
              aria-invalid={!outdoorTemp.trim() || undefined}
              onChange={(event) => setOutdoorTemp(event.target.value)}
            />
          </div>
        </div>
        <p className="scan-note" data-role="heatload-outdoor-hint">{t('tool.heatload.outdoorTempHint')}</p>
      </section>

      {/* Hinweisblock mit der Abgrenzung — sichtbar, nicht in einem zugeklappten Bereich. */}
      <section className="settings-card stack" data-role="heatload-abgrenzung">
        <h2>{t('tool.heatload.abgrenzungTitle')}</h2>
        <p className="privacy-note">{t('tool.heatload.abgrenzung')}</p>
      </section>

      {rooms.map((raum, index) => {
        const nutzung = roomUseById(raum.use)
        return (
          <section className="settings-card stack" key={raum.id}>
            <div className="download-row">
              <h2>{`${t('tool.heatload.room')} ${index + 1}`}</h2>
              {rooms.length > 1 && (
                <button type="button" className="text-link" onClick={() => setRooms((vorher) => vorher.filter((eintrag) => eintrag.id !== raum.id))}>
                  {t('tool.heatload.removeRoom')}
                </button>
              )}
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor={`heatload-${raum.id}-name`}>{t('tool.heatload.roomName')}</label>
                <input
                  id={`heatload-${raum.id}-name`}
                  data-role="room-name"
                  value={raum.name}
                  maxLength={heatloadLimits.nameMax}
                  onChange={(event) => setzeRaum(raum.id, { name: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`heatload-${raum.id}-use`}>{t('tool.heatload.use')}</label>
                <select id={`heatload-${raum.id}-use`} data-role="room-use" value={raum.use} onChange={(event) => waehleNutzung(raum, event.target.value as RoomUseKey)}>
                  {roomUses.map((eintrag) => (
                    <option key={eintrag.id} value={eintrag.id}>{`${t(`tool.heatload.use.${eintrag.id}`)} — ${formatValue(eintrag.indoorTemp, locale, 0)} °C`}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`heatload-${raum.id}-temp`}>{t('tool.heatload.indoorTemp')}</label>
                <input
                  id={`heatload-${raum.id}-temp`}
                  data-role="room-temp"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={raum.indoorTemp}
                  onChange={(event) => setzeRaum(raum.id, { indoorTemp: event.target.value })}
                />
                <small className="scan-note">{`${t('tool.heatload.span')}: ${formatValue(nutzung.span[0], locale, 0)}–${formatValue(nutzung.span[1], locale, 0)} °C · ${t(`tool.heatload.source.${nutzung.sourceId}`)}`}</small>
              </div>
              <div className="field">
                <label htmlFor={`heatload-${raum.id}-area`}>{t('tool.heatload.floorArea')}</label>
                <input
                  id={`heatload-${raum.id}-area`}
                  data-role="room-area"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={raum.floorArea}
                  onChange={(event) => setzeRaum(raum.id, { floorArea: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`heatload-${raum.id}-height`}>{t('tool.heatload.height')}</label>
                <input
                  id={`heatload-${raum.id}-height`}
                  data-role="room-height"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={raum.height}
                  onChange={(event) => setzeRaum(raum.id, { height: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`heatload-${raum.id}-air`}>{t('tool.heatload.airChange')}</label>
                <input
                  id={`heatload-${raum.id}-air`}
                  data-role="room-air"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={raum.airChange}
                  onChange={(event) => setzeRaum(raum.id, { airChange: event.target.value })}
                />
                <small className="scan-note">{t('tool.heatload.guideline')}</small>
              </div>
            </div>

            <div className="field">
              <label htmlFor={`heatload-${raum.id}-air-preset`}>{t('tool.heatload.airChangePreset')}</label>
              <select
                id={`heatload-${raum.id}-air-preset`}
                value=""
                onChange={(event) => { if (event.target.value) setzeRaum(raum.id, { airChange: preset(Number(event.target.value)) }) }}
              >
                <option value="">—</option>
                {airChangePresets.map((eintrag) => (
                  <option key={eintrag.id} value={eintrag.airChange}>
                    {`${t(`tool.heatload.n.${eintrag.id}`)} · ${t('tool.heatload.guideline')}`}
                  </option>
                ))}
              </select>
            </div>

            <h3>{t('tool.heatload.surfaces')}</h3>
            <div className="cvd-table-wrap">
              <table className="cvd-table">
                <thead>
                  <tr>
                    <th scope="col">{t('tool.heatload.surfaceKind')}</th>
                    <th scope="col">{t('tool.heatload.surfaceArea')}</th>
                    <th scope="col">{t('tool.heatload.uValue')}</th>
                    <th scope="col">{t('tool.heatload.source')}</th>
                    <th scope="col">{t('tool.heatload.removeSurface')}</th>
                  </tr>
                </thead>
                <tbody>
                  {raum.surfaces.map((flaeche) => {
                    const quelleId = heatloadSourceOfSurface({
                      id: flaeche.id,
                      presetId: flaeche.presetId,
                      area: parseNumber(flaeche.area),
                      uValue: parseNumber(flaeche.uValue)
                    })
                    const quelle = heatloadSourceById(quelleId)
                    const quellenText = quelle
                      ? `${t(`tool.heatload.sourceType.${quelle.type}`)} · ${t(`tool.heatload.source.${quelle.id}`)}`
                      : t('tool.heatload.unknownSource')
                    return (
                      <tr key={flaeche.id}>
                        <td>
                          <select
                            id={`heatload-${raum.id}-${flaeche.id}-kind`}
                            data-role="surface-kind"
                            aria-label={t('tool.heatload.surfaceKind')}
                            value={flaeche.presetId}
                            onChange={(event) => {
                              const gewaehlt = event.target.value
                              const vorlage = uValuePresetById(gewaehlt)
                              setzeFlaeche(raum.id, flaeche.id, { presetId: gewaehlt, uValue: vorlage ? preset(vorlage.uValue) : flaeche.uValue })
                            }}
                          >
                            <option value="">{t('tool.heatload.surfaceKindChoose')}</option>
                            {uValueCategories.map((category) => (
                              <optgroup key={category} label={t(`tool.heatload.uGroup.${category}`)}>
                                {uValuePresets.filter((vorlage) => vorlage.category === category).map((vorlage) => (
                                  <option key={vorlage.id} value={vorlage.id}>{t(`tool.heatload.u.${vorlage.id}`)}</option>
                                ))}
                              </optgroup>
                            ))}
                            <option value="custom">{t('tool.heatload.uCustom')}</option>
                          </select>
                        </td>
                        <td>
                          <input
                            id={`heatload-${raum.id}-${flaeche.id}-area`}
                            data-role="surface-area"
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            aria-label={t('tool.heatload.surfaceArea')}
                            value={flaeche.area}
                            onChange={(event) => setzeFlaeche(raum.id, flaeche.id, { area: event.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            id={`heatload-${raum.id}-${flaeche.id}-u`}
                            data-role="surface-u"
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            aria-label={t('tool.heatload.uValue')}
                            value={flaeche.uValue}
                            onChange={(event) => setzeFlaeche(raum.id, flaeche.id, { uValue: event.target.value, presetId: 'custom' })}
                          />
                        </td>
                        <td><small className="scan-note" title={quelle?.url ?? ''}>{quellenText}</small></td>
                        <td>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => setzeRaum(raum.id, { surfaces: raum.surfaces.filter((eintrag) => eintrag.id !== flaeche.id) })}
                          >
                            {t('tool.heatload.removeSurface')}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="download-row">
              <button
                type="button"
                disabled={raum.surfaces.length >= heatloadLimits.surfacesMax}
                onClick={() => setzeRaum(raum.id, { surfaces: [...raum.surfaces, leereFlaeche()] })}
              >
                {t('tool.heatload.addSurface')}
              </button>
            </div>
          </section>
        )
      })}

      <div className="download-row">
        <button type="button" disabled={rooms.length >= heatloadLimits.roomsMax} onClick={() => setRooms((vorher) => [...vorher, leererRaum()])}>
          {t('tool.heatload.addRoom')}
        </button>
      </div>

      {fehler.length > 0 && (
        <section className="settings-card stack" aria-live="polite">
          <h2>{t('tool.heatload.result')}</h2>
          <p className="scan-note">{t('tool.heatload.resultEmpty')}</p>
          {fehler.map((key) => <p className="error" role="alert" key={key}>{t(key)}</p>)}
        </section>
      )}

      {plan.ok && plan.result && (
        <section className="settings-card stack" aria-live="polite">
          <h2>{t('tool.heatload.result')}</h2>
          <p className="scan-note">{t('tool.heatload.resultNote')}</p>
          <div className="cvd-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool.heatload.room')}</th>
                  <th scope="col">{t('tool.heatload.out.deltaT')}</th>
                  <th scope="col">{t('tool.heatload.out.transmission')}</th>
                  <th scope="col">{t('tool.heatload.out.ventilation')}</th>
                  <th scope="col">{t('tool.heatload.out.total')}</th>
                </tr>
              </thead>
              <tbody>
                {plan.result.rooms.map((ergebnis, index) => (
                  <tr key={ergebnis.id} data-role="heatload-room-result">
                    <th scope="row">{raumName(index)}</th>
                    <td>{`${formatValue(ergebnis.deltaT, locale, 1)} K`}</td>
                    <td>{`${formatValue(ergebnis.transmission, locale, 1)} W`}</td>
                    <td>{`${formatValue(ergebnis.ventilation, locale, 1)} W`}</td>
                    <td><strong>{`${formatValue(ergebnis.total, locale, 1)} W`}</strong></td>
                  </tr>
                ))}
                <tr data-role="heatload-sum">
                  <th scope="row">{t('tool.heatload.out.sum')}</th>
                  <td>—</td>
                  <td>{`${formatValue(plan.result.transmission, locale, 1)} W`}</td>
                  <td>{`${formatValue(plan.result.ventilation, locale, 1)} W`}</td>
                  <td><strong data-role="heatload-total">{`${formatValue(plan.result.total, locale, 1)} W`}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <details className="settings-card" open>
            <summary>{t('tool.heatload.rechenweg')}</summary>
            <ul className="metadata-entries">
              {plan.result.rooms.map((ergebnis, index) => (
                <li key={ergebnis.id}>
                  <strong>{raumName(index)}</strong>
                  <ul>
                    <li>{`${t('tool.heatload.out.transmission')}: ${t('tool.heatload.formulaTransmission')} = ${ergebnis.surfaces.map((flaeche) => `${formatValue(flaeche.uValue, locale, 2)}·${formatValue(flaeche.area, locale, 2)}·${formatValue(ergebnis.deltaT, locale, 1)}`).join(' + ')} = ${formatValue(ergebnis.transmission, locale, 1)} W`}</li>
                    <li>{`${t('tool.heatload.out.ventilation')}: ${t('tool.heatload.formulaVentilation')} = ${formatValue(AIR_DENSITY, locale, 1)} · ${formatValue(AIR_HEAT_CAPACITY, locale, 0)} · ${formatValue(parseNumber(rooms[index]?.airChange ?? ''), locale, 2)} · ${formatValue(ergebnis.volume, locale, 2)} m³ · ΔT ${formatValue(ergebnis.deltaT, locale, 1)} K = ${formatValue(ergebnis.ventilation, locale, 1)} W`}</li>
                    <li>{`${t('tool.heatload.out.total')}: ${formatValue(ergebnis.total, locale, 1)} W`}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <details className="settings-card" open>
        <summary>{t('tool.heatload.sourcesBlock')}</summary>
        <ul className="metadata-entries">
          {oeffentlicheQuellen.map((quelle) => (
            <li key={quelle.id}>
              <strong>{t(`tool.heatload.source.${quelle.id}`)}</strong>
              <small className="scan-note">{`${t(`tool.heatload.sourceType.${quelle.type}`)} · ${t('tool.heatload.abruf')}: ${HEATLOAD_RETRIEVED}`}</small>
              <small className="scan-note">{` (${quelle.url})`}</small>
            </li>
          ))}
        </ul>
      </details>

      <details className="settings-card">
        <summary>{t('tool.heatload.formula')}</summary>
        <ul className="metadata-entries">
          <li>
            <strong>{`${t('tool.heatload.air.density')} ρ = ${formatValue(AIR_DENSITY, locale, 2)} kg/m³`}</strong>
            <small className="scan-note">{` · ${t(`tool.heatload.source.${AIR_DENSITY_SOURCE}`)}`}</small>
          </li>
          <li>
            <strong>{`${t('tool.heatload.air.heatCapacity')} c_p = ${formatValue(AIR_HEAT_CAPACITY, locale, 0)} J/(kg·K)`}</strong>
            <small className="scan-note">{` · ${t(`tool.heatload.source.${AIR_HEAT_CAPACITY_SOURCE}`)}`}</small>
          </li>
          <li>
            <strong>{`${t('tool.heatload.air.product')} ρ · c_p ≈ ${formatValue(AIR_DENSITY * AIR_HEAT_CAPACITY, locale, 0)} J/(m³·K)`}</strong>
          </li>
        </ul>
        <p className="scan-note">{t('tool.heatload.air.note')}</p>
        <p className="scan-note">{t('tool.heatload.assumptions')}</p>
        <p className="scan-note">{`${t('tool.heatload.sourcesBlock')} · ${t('tool.heatload.abruf')}: ${HEATLOAD_RETRIEVED}`}</p>
      </details>

      <LocalBadge />
    </div>
  )
}
