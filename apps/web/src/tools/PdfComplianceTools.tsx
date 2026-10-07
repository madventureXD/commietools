import { useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from 'react'
import { acceptAttributeFor } from '@commietools/tools'
import { inspectPdf, type PdfInspection } from '@commietools/tools/pdf/core'
import { normaliseRedactionArea, nudgeRedactionArea, preflightPdfA, redactPdf, type PdfAPreflight, type PdfRedactionArea } from '@commietools/tools/pdf/m9'
import { Button, LocalBadge } from '@commietools/ui'
import { SaveFileControl } from './SaveFileControl'
import { baseName, pdfErrorKey, readPdfGeometry, useDownload, usePdfThumbnails, type Translate } from './pdfUi'
import { redactionBounds, type PdfPageGeometry } from './pdfGeometry'

type Loaded = { name: string; bytes: Uint8Array; inspection: PdfInspection }
type PlacedArea = PdfRedactionArea & { id: string }
type Draft = { x: string; y: string; width: string; height: string }

const EMPTY_DRAFT: Draft = { x: '', y: '', width: '', height: '' }
const NUDGE: Record<string, readonly [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

/** Accepts a point value typed with a comma or a dot; anything else is not a number. */
function parsePoint(value: string): number {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed.replace(',', '.')) : Number.NaN
}

function formatPoint(value: number): string {
  return value.toFixed(1)
}

function formatSpan(value: number): string {
  return String(Math.round(value * 100) / 100)
}

/**
 * Position eines Bereichs im angezeigten Blatt, in Prozent der Anzeigemaße.
 * Bereiche liegen bereits in Anzeigekoordinaten (siehe `pdfGeometry.ts`) — es gibt keine
 * Rotationsumkehr, weder hier noch beim Aufziehen.
 */
function areaStyle(geometry: PdfPageGeometry, area: PdfRedactionArea) {
  return {
    left: `${area.x / geometry.viewWidth * 100}%`,
    top: `${area.y / geometry.viewHeight * 100}%`,
    width: `${area.width / geometry.viewWidth * 100}%`,
    height: `${area.height / geometry.viewHeight * 100}%`
  }
}

async function select(event: ChangeEvent<HTMLInputElement>): Promise<Loaded | null> { const file=event.target.files?.[0];event.target.value='';if(!file)return null;const bytes=new Uint8Array(await file.arrayBuffer());return{name:file.name,bytes,inspection:await inspectPdf(bytes)} }
function ErrorText({value,t}:{value:string;t:Translate}){return value?<p className="error" role="alert">{t(value)}</p>:null}
function Result({bytes,name,t}:{bytes:Uint8Array;name:string;t:Translate}){const url=useDownload(bytes);return url?<section className="settings-card stack"><div className="preview-heading"><h2>{t('tool.pdf.result')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><SaveFileControl url={url} suggestedName={name} mimeType="application/pdf" t={t}/></section>:null}

export function PdfAPreflightTool({t}:{t:Translate}){
  const [report,setReport]=useState<PdfAPreflight|null>(null),[error,setError]=useState('')
  async function choose(event:ChangeEvent<HTMLInputElement>){try{const file=await select(event);setReport(file?preflightPdfA(file.bytes):null);setError('')}catch(x){setReport(null);setError(pdfErrorKey(x))}}
  return <section className="settings-card stack"><label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-a-preflight')} onChange={choose}/></label><p className="warning">{t('tool.pdfA.limit')}</p>{report&&<><h2>{t(report.verdict==='not-declared'?'tool.pdfA.notDeclared':'tool.pdfA.declared')}</h2>{report.declaredPart&&<p>PDF/A-{report.declaredPart}{report.declaredConformance?.toLowerCase()}</p>}<dl className="results">{(['hasXmp','hasOutputIntent','hasEncryption','hasJavaScript','hasEmbeddedFiles'] as const).map(key=><div key={key}><dt>{t(`tool.pdfA.${key}`)}</dt><dd>{t(report[key]?'tool.pdfA.yes':'tool.pdfA.no')}</dd></div>)}</dl><p>{t('tool.pdfA.verapdf')}</p></>}<ErrorText value={error} t={t}/></section>
}

export function PdfRedactTool({t}:{t:Translate}){
  const [file,setFile]=useState<Loaded|null>(null),[geometry,setGeometry]=useState<PdfPageGeometry[]>([])
  const [page,setPage]=useState(1),[areas,setAreas]=useState<PlacedArea[]>([]),[draft,setDraft]=useState<Draft>(EMPTY_DRAFT)
  const [draftError,setDraftError]=useState(''),[start,setStart]=useState<{x:number;y:number}|null>(null),[pending,setPending]=useState<PdfRedactionArea|null>(null)
  const [selected,setSelected]=useState(''),[clearMetadata,setClearMetadata]=useState(true),[removeAnnotations,setRemoveAnnotations]=useState(true)
  const [result,setResult]=useState<Uint8Array|null>(null),[error,setError]=useState(''),[confirmed,setConfirmed]=useState(false)
  const thumbs=usePdfThumbnails(file?.bytes??null,220)
  const current=geometry[page-1]
  const pageAreas=areas.filter((area)=>area.pageIndex===page-1)

  async function choose(event:ChangeEvent<HTMLInputElement>){
    try{
      const next=await select(event)
      setFile(next);setPage(1);setAreas([]);setDraft(EMPTY_DRAFT);setDraftError('');setPending(null);setSelected('');setResult(null);setConfirmed(false);setError('')
      setGeometry(next?await readPdfGeometry(next.bytes):[])
    }catch(e){setFile(null);setGeometry([]);setError(pdfErrorKey(e))}
  }
  function selectPage(next:number){setPage(next);setPending(null);setSelected('');setConfirmed(false)}

  /** Adds the rectangle described by the four fields — the keyboard path into the same model. */
  function addFromFields(){
    if(!current)return
    const candidate:PdfRedactionArea={pageIndex:page-1,x:parsePoint(draft.x),y:parsePoint(draft.y),width:parsePoint(draft.width),height:parsePoint(draft.height)}
    const check=normaliseRedactionArea(candidate,redactionBounds(current))
    if(!check.ok){setDraftError(check.reason==='number'?'tool.pdfRedact.errorNumber':check.reason==='size'?'tool.pdfRedact.errorSize':'tool.pdfRedact.errorBounds');return}
    setAreas((list)=>[...list,{...check.area,id:crypto.randomUUID()}]);setDraft(EMPTY_DRAFT);setPending(null);setDraftError('');setConfirmed(false)
  }

  /**
   * Marks the fields the current message is about: a non-number or an area outside the page concerns
   * all four values, a zero size only width and height. The message alone is not enough for
   * assistive technology — the field itself has to carry the state.
   */
  function invalid(field:'x'|'y'|'width'|'height'):boolean{
    if(!draftError)return false
    if(draftError==='tool.pdfRedact.errorSize')return field==='width'||field==='height'
    return true
  }

  function removeArea(id:string){setAreas((list)=>list.filter((area)=>area.id!==id));if(selected===id)setSelected('');setConfirmed(false)}

  /** Arrow keys move the focused area; plain keys by one point, with Shift by ten. */
  function nudge(event:KeyboardEvent<HTMLButtonElement>,id:string,area:PdfRedactionArea){
    const delta=NUDGE[event.key]
    if(!delta||!current)return
    event.preventDefault()
    const step=event.shiftKey?10:1
    setAreas((list)=>list.map((item)=>item.id===id?{...item,...nudgeRedactionArea(area,redactionBounds(current),delta[0]*step,delta[1]*step)}:item))
    setConfirmed(false)
  }

  function point(event:PointerEvent<HTMLDivElement>){const rect=event.currentTarget.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top,rect}}
  function begin(event:PointerEvent<HTMLDivElement>){if(!current)return;event.currentTarget.setPointerCapture(event.pointerId);const p=point(event);setStart({x:p.x,y:p.y});setPending(null);setConfirmed(false)}
  /**
   * Der Zeigerweg schreibt in dasselbe Modell wie das Formular: Bildpunkte werden auf die
   * angezeigten Seitenmaße umgerechnet (Zoom!), der Bereich entsteht in Anzeigekoordinaten und
   * füllt anschließend die vier Felder.
   */
  function finish(event:PointerEvent<HTMLDivElement>){
    if(!start||!current)return
    const p=point(event),geom=current
    const xVon=start.x/p.rect.width*geom.viewWidth,yVon=start.y/p.rect.height*geom.viewHeight
    const xBis=p.x/p.rect.width*geom.viewWidth,yBis=p.y/p.rect.height*geom.viewHeight
    setStart(null)
    const check=normaliseRedactionArea({pageIndex:page-1,x:Math.min(xVon,xBis),y:Math.min(yVon,yBis),width:Math.abs(xBis-xVon),height:Math.abs(yBis-yVon)},redactionBounds(geom))
    if(!check.ok){setPending(null);return}
    setPending(check.area)
    setDraft({x:formatPoint(check.area.x),y:formatPoint(check.area.y),width:formatPoint(check.area.width),height:formatPoint(check.area.height)})
    setDraftError('')
  }
  function run(){if(!file||!confirmed||!areas.length)return;try{setResult(redactPdf(file.bytes,areas.map((area)=>({pageIndex:area.pageIndex,x:area.x,y:area.y,width:area.width,height:area.height})),{clearMetadata,removePageAnnotations:removeAnnotations}));setError('')}catch(e){setError(pdfErrorKey(e))}}

  function areaLabel(area:PdfRedactionArea,index:number){
    return t('tool.pdfRedact.areaItem').replace('{index}',String(index+1)).replace('{page}',String(area.pageIndex+1)).replace('{x}',formatPoint(area.x)).replace('{y}',formatPoint(area.y)).replace('{w}',formatPoint(area.width)).replace('{h}',formatPoint(area.height))
  }

  return <div className="stack">
    <section className="settings-card stack">
      <label className="field"><span>{t('tool.pdf.choose')}</span><input type="file" accept={acceptAttributeFor('pdf-redact')} onChange={choose}/></label>
      <p className="warning">{t('tool.pdfRedact.warning')}</p>
      {file&&<>
        <div className="pdf-thumbnail-grid">{thumbs.images.map((image,index)=><button className={`pdf-page-card button-reset ${page===index+1?'selected':''}`} key={image} aria-current={page===index+1?'page':undefined} onClick={()=>selectPage(index+1)}><img src={image} alt={`${t('tool.pdf.page')} ${index+1}`}/><span>{index+1}</span></button>)}</div>
        {thumbs.images[page-1]&&current&&<>
          <p>{t('tool.pdfRedact.draw')}</p>
          <div className="redaction-editor" onPointerDown={begin} onPointerUp={finish} onPointerCancel={()=>setStart(null)}>
            <img draggable="false" src={thumbs.images[page-1]} alt={`${t('tool.pdf.page')} ${page}`}/>
            {pageAreas.map((area)=><span className={`redaction-box ${selected===area.id?'selected':''}`} key={area.id} style={areaStyle(current,area)}/>)}
            {pending&&<span className="redaction-box draft" style={areaStyle(current,pending)}/>}
          </div>
          <p className="scan-note">{t('tool.pdfRedact.pageSize').replace('{w}',formatSpan(current.viewWidth)).replace('{h}',formatSpan(current.viewHeight))}</p>
          <fieldset className="stack redaction-form">
            <legend>{t('tool.pdfRedact.keyboard')}</legend>
            <div className="form-grid">
              <label className="field"><span>{t('tool.pdfRedact.areaX')}</span><input inputMode="decimal" value={draft.x} aria-invalid={invalid('x')} onChange={(event)=>setDraft({...draft,x:event.target.value})}/></label>
              <label className="field"><span>{t('tool.pdfRedact.areaY')}</span><input inputMode="decimal" value={draft.y} aria-invalid={invalid('y')} onChange={(event)=>setDraft({...draft,y:event.target.value})}/></label>
              <label className="field"><span>{t('tool.pdfRedact.areaWidth')}</span><input inputMode="decimal" value={draft.width} aria-invalid={invalid('width')} onChange={(event)=>setDraft({...draft,width:event.target.value})}/></label>
              <label className="field"><span>{t('tool.pdfRedact.areaHeight')}</span><input inputMode="decimal" value={draft.height} aria-invalid={invalid('height')} onChange={(event)=>setDraft({...draft,height:event.target.value})}/></label>
            </div>
            <Button onClick={addFromFields}>{t('tool.pdfRedact.addArea')}</Button>
            <ErrorText value={draftError} t={t}/>
          </fieldset>
          <section className="stack">
            <h2>{t('tool.pdfRedact.areaList')}</h2>
            {areas.length?<ul className="redaction-list">{areas.map((area,index)=><li key={area.id}>
              <button type="button" className="redaction-area-select" aria-pressed={selected===area.id} onClick={()=>setSelected(area.id)} onKeyDown={(event)=>nudge(event,area.id,area)}>{areaLabel(area,index)}</button>
              <Button aria-label={`${t('tool.pdfRedact.remove')}: ${areaLabel(area,index)}`} onClick={()=>removeArea(area.id)}>{t('tool.pdfRedact.remove')}</Button>
            </li>)}</ul>:<p>{t('tool.pdfRedact.noAreas')}</p>}
          </section>
          <label className="check-field"><input type="checkbox" checked={clearMetadata} onChange={(event)=>setClearMetadata(event.target.checked)}/>{t('tool.pdfRedact.clearMetadata')}</label>
          <label className="check-field"><input type="checkbox" checked={removeAnnotations} onChange={(event)=>setRemoveAnnotations(event.target.checked)}/>{t('tool.pdfRedact.removeAnnotations')}</label>
          <label className="check-field"><input type="checkbox" checked={confirmed} disabled={!areas.length} onChange={(event)=>setConfirmed(event.target.checked)}/>{t('tool.pdfRedact.confirm')}</label>
          <Button className="primary" disabled={!confirmed||!areas.length} onClick={run}>{t('tool.pdfRedact.action')}</Button>
        </>}
      </>}
      <ErrorText value={error} t={t}/>
    </section>
    {result&&file&&<Result bytes={result} name={`${baseName(file.name)}-redacted.pdf`} t={t}/>}
  </div>
}
