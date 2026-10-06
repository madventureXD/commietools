import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { loadTemporal } from '@commietools/tools/calculator/calendars'
import { buildReportPdf } from '@commietools/tools/pdf/report'
import {
  emptyItem,
  filledItems,
  handoverLimits,
  itemErrorKeys,
  reportErrorKeys,
  reportFileName,
  warrantyDeadlines,
  type HandoverDraft,
  type WarrantyDeadline
} from '@commietools/tools/craft/handover'
import { Button } from '@commietools/ui'
import { SaveFileControl } from './SaveFileControl'
import { SignaturePad, type SignatureSource } from './SignaturePad'

type Translate = (key: string) => string

interface HandoverReportProps {
  readonly t: Translate
  readonly locale: string
}

interface ReportPhoto {
  readonly id: string
  readonly name: string
  readonly bytes: Uint8Array
  readonly mimeType: 'image/jpeg' | 'image/png'
  readonly note: string
}

/** Heutiges Datum als `JJJJ-MM-TT` in der Zeitzone des Geräts (nicht UTC — sonst kippt der Tag abends). */
function heute(): string {
  const jetzt = new Date()
  const monat = String(jetzt.getMonth() + 1).padStart(2, '0')
  const tag = String(jetzt.getDate()).padStart(2, '0')
  return `${jetzt.getFullYear()}-${monat}-${tag}`
}

let laufendeNummer = 0

export function HandoverReport({ t }: HandoverReportProps) {
  const [draft, setDraft] = useState<HandoverDraft>({ object: '', client: '', contractor: '', date: heute(), items: [emptyItem(1)] })
  const [photos, setPhotos] = useState<readonly ReportPhoto[]>([])
  const [clientSignature, setClientSignature] = useState<SignatureSource | null>(null)
  const [contractorSignature, setContractorSignature] = useState<SignatureSource | null>(null)
  const [warranty, setWarranty] = useState<readonly WarrantyDeadline[]>([])
  const [fehler, setFehler] = useState<readonly string[]>([])
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [ergebnis, setErgebnis] = useState<{ name: string; blob: Blob } | null>(null)

  // Fristen hängen am Abnahmedatum — nachrechnen, nicht behaupten.
  useEffect(() => {
    let abgebrochen = false
    loadTemporal()
      .then((temporal) => { if (!abgebrochen) setWarranty(warrantyDeadlines(draft.date, temporal)) })
      .catch(() => { if (!abgebrochen) setWarranty([]) })
    return () => { abgebrochen = true }
  }, [draft.date])

  const unterschriften = useMemo(() => (clientSignature ? 1 : 0) + (contractorSignature ? 1 : 0), [clientSignature, contractorSignature])

  async function waehleFotos(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const dateien = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!dateien.length) return
    if (photos.length + dateien.length > handoverLimits.photosMax) {
      setFehler(['tool.handover.error.tooManyPhotos'])
      return
    }
    const geladen: ReportPhoto[] = []
    let unlesbar = 0
    for (const datei of dateien) {
      const art = datei.type === 'image/png' ? 'image/png' : datei.type === 'image/jpeg' ? 'image/jpeg' : null
      if (!art) continue
      try {
        geladen.push({ id: `foto-${laufendeNummer++}`, name: datei.name, bytes: new Uint8Array(await datei.arrayBuffer()), mimeType: art, note: '' })
      } catch {
        unlesbar += 1
      }
    }
    setFehler(unlesbar ? ['tool.handover.error.photoUnreadable'] : [])
    setPhotos((vorher) => [...vorher, ...geladen])
  }

  function setzeMangel(id: string, patch: Partial<HandoverDraft['items'][number]>): void {
    setDraft((vorher) => ({ ...vorher, items: vorher.items.map((zeile) => (zeile.id === id ? { ...zeile, ...patch } : zeile)) }))
  }

  async function erzeuge(): Promise<void> {
    const alle = reportErrorKeys(draft, unterschriften)
    // Die fehlende Unterschrift hält die Erzeugung **nicht** auf — sie wird als Hinweis geführt
    // und im PDF bleibt die Unterschriftsseite leer, statt still eine leere Zeile zu erzeugen.
    const blockierend = alle.filter((key) => key !== 'tool.handover.error.noSignature')
    if (blockierend.length) {
      setFehler(blockierend)
      setHinweis(null)
      setErgebnis(null)
      return
    }
    setFehler([])
    setHinweis(alle.includes('tool.handover.error.noSignature') ? 'tool.handover.error.noSignature' : null)
    setBusy(true)
    try {
      const bytes = await buildReportPdf({
        title: t('tool.handover.title'),
        object: draft.object.trim(),
        client: draft.client.trim(),
        contractor: draft.contractor.trim(),
        date: draft.date.trim(),
        items: filledItems(draft.items).map((zeile) => ({ description: zeile.description.trim(), location: zeile.location.trim(), deadline: zeile.deadline.trim() })),
        photos: photos.map((foto) => ({ bytes: foto.bytes, mimeType: foto.mimeType, note: foto.note.trim() })),
        signatures: [
          ...(clientSignature ? [{ role: t('tool.handover.signatureClient'), bytes: clientSignature.bytes, mimeType: clientSignature.mimeType }] : []),
          ...(contractorSignature ? [{ role: t('tool.handover.signatureContractor'), bytes: contractorSignature.bytes, mimeType: contractorSignature.mimeType }] : [])
        ],
        warranty: warranty.map((grenze) => ({ label: t(grenze.key === 'bgb' ? 'tool.handover.warrantyBgb' : 'tool.handover.warrantyVob'), date: grenze.date })),
        labels: {
          object: t('tool.handover.object'),
          client: t('tool.handover.client'),
          contractor: t('tool.handover.contractor'),
          date: t('tool.handover.date'),
          items: t('tool.handover.items'),
          description: t('tool.handover.itemDescription'),
          location: t('tool.handover.location'),
          deadline: t('tool.handover.deadline'),
          photos: t('tool.handover.photos'),
          signatures: t('tool.handover.signatures'),
          warranty: t('tool.handover.warranty'),
          page: t('tool.handover.page'),
          empty: t('tool.handover.emptyItems')
        },
        disclaimer: t('tool.handover.disclaimer')
      })
      setErgebnis({ name: reportFileName(draft.object, draft.date), blob: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }) })
    } catch {
      setFehler(['tool.handover.error.photoUnreadable'])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <section className="settings-card">
        <h2>{t('tool.handover.head')}</h2>
        <div className="form-grid">
          <label className="field">
            <span>{t('tool.handover.object')}</span>
            <input value={draft.object} maxLength={handoverLimits.objectMax} onChange={(event) => setDraft((vorher) => ({ ...vorher, object: event.target.value }))} />
          </label>
          <label className="field">
            <span>{t('tool.handover.date')}</span>
            <input value={draft.date} placeholder="2026-10-06" aria-invalid={!draft.date.trim() || undefined} onChange={(event) => setDraft((vorher) => ({ ...vorher, date: event.target.value }))} />
          </label>
          <label className="field">
            <span>{t('tool.handover.client')}</span>
            <input value={draft.client} maxLength={handoverLimits.nameMax} onChange={(event) => setDraft((vorher) => ({ ...vorher, client: event.target.value }))} />
          </label>
          <label className="field">
            <span>{t('tool.handover.contractor')}</span>
            <input value={draft.contractor} maxLength={handoverLimits.nameMax} onChange={(event) => setDraft((vorher) => ({ ...vorher, contractor: event.target.value }))} />
          </label>
        </div>
      </section>

      <section className="settings-card">
        <h2>{t('tool.handover.items')}</h2>
        {!draft.items.length && <p className="scan-note">{t('tool.handover.emptyItems')}</p>}
        <div className="cvd-table-wrap">
          <table className="cvd-table">
          <thead>
            <tr>
              <th scope="col">{t('tool.handover.itemDescription')}</th>
              <th scope="col">{t('tool.handover.location')}</th>
              <th scope="col">{t('tool.handover.deadline')}</th>
              <th scope="col">{t('tool.handover.removeItem')}</th>
            </tr>
          </thead>
          <tbody>
            {draft.items.map((zeile) => (
              <tr key={zeile.id}>
                <td>
                  <input value={zeile.description} maxLength={handoverLimits.descriptionMax} aria-label={`${t('tool.handover.itemDescription')}`} onChange={(event) => setzeMangel(zeile.id, { description: event.target.value })} />
                  {itemErrorKeys(zeile).slice(0, 1).map((key) => <small className="error" key={key}>{t(key)}</small>)}
                </td>
                <td><input value={zeile.location} maxLength={handoverLimits.locationMax} aria-label={t('tool.handover.location')} onChange={(event) => setzeMangel(zeile.id, { location: event.target.value })} /></td>
                <td><input value={zeile.deadline} placeholder="2026-10-20" aria-label={t('tool.handover.deadline')} onChange={(event) => setzeMangel(zeile.id, { deadline: event.target.value })} /></td>
                <td><button type="button" className="text-link" aria-label={`${t('tool.handover.removeItem')} ${t('tool.handover.row')} ${zeile.id.split('-').pop()}`} onClick={() => setDraft((vorher) => ({ ...vorher, items: vorher.items.filter((eintrag) => eintrag.id !== zeile.id) }))}>{t('tool.handover.removeItem')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="download-row">
          <Button disabled={draft.items.length >= handoverLimits.itemsMax} onClick={() => setDraft((vorher) => ({ ...vorher, items: [...vorher.items, emptyItem(vorher.items.length + 1 + laufendeNummer)] }))}>{t('tool.handover.addItem')}</Button>
        </div>
      </section>

      <section className="settings-card">
        <h2>{t('tool.handover.photos')}</h2>
        <label className="field">
          <span>{t('tool.handover.choosePhotos')}</span>
          <input type="file" multiple accept={acceptAttributeFor('handover-report')} onChange={waehleFotos} />
        </label>
        {photos.map((foto) => (
          <div className="form-grid" key={foto.id}>
            <label className="field">
              <span>{`${t('tool.handover.photoNote')}: ${foto.name}`}</span>
              <input value={foto.note} maxLength={120} onChange={(event) => setPhotos((vorher) => vorher.map((eintrag) => (eintrag.id === foto.id ? { ...eintrag, note: event.target.value } : eintrag)))} />
            </label>
          </div>
        ))}
        <p className="privacy-note">{t('tool.handover.footerNote')}</p>
      </section>

      <section className="settings-card">
        <h2>{t('tool.handover.signatures')}</h2>
        <p className="scan-note">{t('tool.handover.signatureClient')}</p>
        <SignaturePad onChange={setClientSignature} clearLabel={t('tool.handover.clearSignature')} label={t('tool.handover.signatureClient')} />
        <p className="scan-note">{t('tool.handover.signatureContractor')}</p>
        <SignaturePad onChange={setContractorSignature} clearLabel={t('tool.handover.clearSignature')} label={t('tool.handover.signatureContractor')} />
      </section>

      {warranty.length > 0 && (
        <section className="settings-card stack">
          <h2>{t('tool.handover.warranty')}</h2>
          <ul className="scan-note">
            {warranty.map((grenze) => (
              <li key={grenze.key}>{`${t(grenze.key === 'bgb' ? 'tool.handover.warrantyBgb' : 'tool.handover.warrantyVob')}: ${grenze.date}`}</li>
            ))}
          </ul>
          <p className="scan-note">{t('tool.handover.warrantyHint')}</p>
          <p className="scan-note">{t('tool.handover.disclaimer')}</p>
        </section>
      )}

      {fehler.length > 0 && (
        <section className="settings-card stack">
          {fehler.map((key) => <p className="error" role="alert" key={key}>{t(key)}</p>)}
        </section>
      )}

      <div className="download-row">
        <Button className="primary" disabled={busy} onClick={erzeuge}>{busy ? t('tool.handover.processing') : t('tool.handover.action')}</Button>
      </div>

      {hinweis && <p className="scan-note" role="status">{t(hinweis)}</p>}

      {ergebnis && (
        <section className="settings-card stack" aria-live="polite">
          <h2>{t('tool.handover.result')}</h2>
          <p className="scan-note">{t('tool.handover.resultNote')}</p>
          <SaveFileControl suggestedName={ergebnis.name} mimeType="application/pdf" blob={ergebnis.blob} t={t} />
        </section>
      )}

      <details className="settings-card">
        <summary>{t('tool.handover.formula')}</summary>
        <h2>{t('tool.craft.assumptions')}</h2>
        <p className="scan-note">{t('tool.handover.assumptions')}</p>
        <p className="scan-note">{t('tool.handover.sources')}</p>
      </details>
    </div>
  )
}
