import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { SuiteManifest, ToolManifest, ToolSearchEntry } from '@commietools/core'
import { createTranslator, detectLocale, isLocale, loadInterfaceMessages, localeRegistry, supportedLocales, type Locale } from '@commietools/i18n'
import { convertCase, getSuiteTools, getTextStatistics, loadToolSearchIndex, MIN_QUERY_LENGTH, searchEntryById, suiteByRoute, suiteManifests, toolByRoute, type CaseMode } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'
import { PipTrigger, PipWrapper } from '@pip-it-up/react'
import { CatalogSection } from './CatalogSection'
import { LicensePage } from './LicensePage'
import { LegalNoticePage } from './LegalNoticePage'
import { ToolCard } from './ToolCard'
import { toolTextsFrom } from './tool-texts'
import { ToolNavigation } from './ToolNavigation'
import { ImageMetadata } from './tools/ImageMetadata'
import { ImageResize } from './tools/ImageResize'
import { IconGenerator } from './tools/IconGenerator'
import { ImageWatermark } from './tools/ImageWatermark'
import { ColorTools } from './tools/ColorTools'
import { QrCodeGenerator } from './tools/QrCodeGenerator'
import { TextArea } from './tools/text-area'

/**
 * Der JSON-Formatierer lädt nach (Karte M6-001): seine Logik benutzt `jsonc-parser`, und die soll
 * nur auf dieser Route ankommen, nicht bei jedem Aufruf der Startseite.
 */
const JsonFormatter = lazy(() => import('./tools/JsonFormatter').then((module) => ({ default: module.JsonFormatter })))

const PdfMerge = lazy(() => import('./tools/PdfMerge').then((module) => ({ default: module.PdfMerge })))
const PdfSplit = lazy(() => import('./tools/PdfSplit').then((module) => ({ default: module.PdfSplit })))
const PdfOrganize = lazy(() => import('./tools/PdfOrganize').then((module) => ({ default: module.PdfOrganize })))
const ImagesToPdf = lazy(() => import('./tools/ImagesToPdf').then((module) => ({ default: module.ImagesToPdf })))
const PdfToImages = lazy(() => import('./tools/PdfToImages').then((module) => ({ default: module.PdfToImages })))
const PdfWatermark = lazy(() => import('./tools/PdfPlacementTools').then((module) => ({ default: module.PdfWatermark })))
const PdfPageNumbers = lazy(() => import('./tools/PdfPlacementTools').then((module) => ({ default: module.PdfPageNumbers })))
const PdfVisibleSignature = lazy(() => import('./tools/PdfPlacementTools').then((module) => ({ default: module.PdfVisibleSignature })))
const PdfFormFill = lazy(() => import('./tools/PdfInteractiveTools').then((module) => ({ default: module.PdfFormFill })))
const PdfAnnotate = lazy(() => import('./tools/PdfInteractiveTools').then((module) => ({ default: module.PdfAnnotate })))
const PdfSecurity = lazy(() => import('./tools/PdfSecurityTools').then((module) => ({ default: module.PdfSecurity })))
const PdfCompress = lazy(() => import('./tools/PdfSecurityTools').then((module) => ({ default: module.PdfCompress })))
const PdfViewer = lazy(() => import('./tools/PdfViewer').then((module) => ({ default: module.PdfViewer })))
const PdfTextOcr = lazy(() => import('./tools/PdfTextOcr').then((module) => ({ default: module.PdfTextOcr })))
const PdfCertificateSign = lazy(() => import('./tools/PdfCertificateTools').then((module) => ({ default: module.PdfCertificateSign })))
const PdfSignatureVerify = lazy(() => import('./tools/PdfCertificateTools').then((module) => ({ default: module.PdfSignatureVerify })))
const PdfMetadataTool = lazy(() => import('./tools/PdfMaintenanceTools').then((module) => ({ default: module.PdfMetadataTool })))
const PdfCropTool = lazy(() => import('./tools/PdfMaintenanceTools').then((module) => ({ default: module.PdfCropTool })))
const PdfRepairTool = lazy(() => import('./tools/PdfMaintenanceTools').then((module) => ({ default: module.PdfRepairTool })))
const PdfAttachmentsTool = lazy(() => import('./tools/PdfMaintenanceTools').then((module) => ({ default: module.PdfAttachmentsTool })))
const PdfCompareTool = lazy(() => import('./tools/PdfMaintenanceTools').then((module) => ({ default: module.PdfCompareTool })))
const PdfAPreflightTool = lazy(() => import('./tools/PdfComplianceTools').then((module) => ({ default: module.PdfAPreflightTool })))
const PdfRedactTool = lazy(() => import('./tools/PdfComplianceTools').then((module) => ({ default: module.PdfRedactTool })))
const Calculator = lazy(() => import('./tools/Calculator').then((module) => ({ default: module.Calculator })))
const ScientificCalculator = lazy(() => import('./tools/ScientificCalculator').then((module) => ({ default: module.ScientificCalculator })))
const ProgrammerCalculator = lazy(() => import('./tools/ProgrammerCalculator').then((module) => ({ default: module.ProgrammerCalculator })))
const RpnCalculator = lazy(() => import('./tools/RpnCalculator').then((module) => ({ default: module.RpnCalculator })))
const Commercial = lazy(() => import('./tools/Commercial').then((module) => ({ default: module.Commercial })))
const Geometry = lazy(() => import('./tools/Geometry').then((module) => ({ default: module.Geometry })))
const Convert = lazy(() => import('./tools/Convert').then((module) => ({ default: module.Convert })))
const DateTime = lazy(() => import('./tools/DateTime').then((module) => ({ default: module.DateTime })))
const Plotter = lazy(() => import('./tools/Plotter').then((module) => ({ default: module.Plotter })))
const Statistics = lazy(() => import('./tools/Statistics').then((module) => ({ default: module.Statistics })))
const Equations = lazy(() => import('./tools/Equations').then((module) => ({ default: module.Equations })))
const Aufmass = lazy(() => import('./tools/Aufmass').then((module) => ({ default: module.Aufmass })))
const Concrete = lazy(() => import('./tools/Concrete').then((module) => ({ default: module.Concrete })))
const Roof = lazy(() => import('./tools/Roof').then((module) => ({ default: module.Roof })))
const MetalWeight = lazy(() => import('./tools/MetalWeight').then((module) => ({ default: module.MetalWeight })))
const Wood = lazy(() => import('./tools/Wood').then((module) => ({ default: module.Wood })))
const Tiles = lazy(() => import('./tools/Tiles').then((module) => ({ default: module.Tiles })))
const Paint = lazy(() => import('./tools/Paint').then((module) => ({ default: module.Paint })))
const Drywall = lazy(() => import('./tools/Drywall').then((module) => ({ default: module.Drywall })))
const Flooring = lazy(() => import('./tools/Flooring').then((module) => ({ default: module.Flooring })))
const Paving = lazy(() => import('./tools/Paving').then((module) => ({ default: module.Paving })))
const Tires = lazy(() => import('./tools/Tires').then((module) => ({ default: module.Tires })))
const Inspection = lazy(() => import('./tools/Inspection').then((module) => ({ default: module.Inspection })))
const PhotoCaption = lazy(() => import('./tools/PhotoCaption').then((module) => ({ default: module.PhotoCaption })))
const HandoverReport = lazy(() => import('./tools/HandoverReport').then((module) => ({ default: module.HandoverReport })))
const Threads = lazy(() => import('./tools/Threads').then((module) => ({ default: module.Threads })))
const Lighting = lazy(() => import('./tools/Lighting').then((module) => ({ default: module.Lighting })))
const Heatload = lazy(() => import('./tools/Heatload').then((module) => ({ default: module.Heatload })))
const Cable = lazy(() => import('./tools/Cable').then((module) => ({ default: module.Cable })))
const PipesTool = lazy(() => import('./tools/Pipes').then((module) => ({ default: module.Pipes })))

type Theme = 'light' | 'dark'
type Translate = (key: string) => string

function preferredTheme(): Theme {
  const saved = localStorage.getItem('commietools-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function preferredLocale(): Locale {
  const saved = localStorage.getItem('commietools-locale')
  return saved && isLocale(saved) ? saved : detectLocale(navigator.languages)
}

function usePathname() {
  const [pathname, setPathname] = useState(location.pathname)
  useEffect(() => {
    const update = () => setPathname(location.pathname)
    addEventListener('popstate', update)
    return () => removeEventListener('popstate', update)
  }, [])
  return [pathname, (path: string) => {
    if (history.state?.commieToolsMenu) history.replaceState({}, '', path)
    else history.pushState({}, '', path)
    setPathname(path)
    scrollTo({ top: 0, behavior: 'smooth' })
  }] as const
}

function TextStatisticsTool({ t }: { t: Translate }) {
  const [text, setText] = useState('')
  const stats = useMemo(() => getTextStatistics(text), [text])
  return <div className="tool-grid"><TextArea label={t('tool.textStats.input')} value={text} onChange={setText} /><dl className="results" aria-live="polite">{[[t('tool.textStats.characters'), stats.characters], [t('tool.textStats.words'), stats.words], [t('tool.textStats.lines'), stats.lines]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
}

function CaseConverterTool({ t, locale }: { t: Translate; locale: Locale }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<CaseMode>('upper')
  const output = useMemo(() => convertCase(text, mode, locale), [text, mode, locale])
  const labels: Record<CaseMode, string> = { upper: 'tool.caseConverter.upper', lower: 'tool.caseConverter.lower', title: 'tool.caseConverter.titleCase' }
  return <div className="stack"><TextArea label={t('tool.caseConverter.input')} value={text} onChange={setText} /><div className="segmented" aria-label="Case mode">{(['upper', 'lower', 'title'] as const).map((item) => <Button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{t(labels[item])}</Button>)}</div><TextArea label={t('tool.result')} value={output} readOnly /></div>
}

function ToolPage({ tool, t, locale, navigate, ready }: { tool: ToolManifest; t: Translate; locale: Locale; navigate: (path: string) => void; ready: boolean }) {
  /**
   * Titel und Beschreibung stehen im **Suchpaket** (2026-10-05) — es ist auf jeder Seite geladen,
   * weil die Werkzeugschublade im Kopfbereich steckt; das Textpaket dieses Werkzeugs enthält sie
   * deshalb nicht mehr. `loadToolSearchIndex` liefert die zwischengespeicherte Zusage.
   */
  const [toolCatalogue, setToolCatalogue] = useState<readonly ToolSearchEntry[]>([])
  useEffect(() => {
    let current = true
    void loadToolSearchIndex(locale).then((entries) => { if (current) setToolCatalogue(entries) })
    return () => { current = false }
  }, [locale])
  const toolsKopf = toolTextsFrom(toolCatalogue, tool, locale, t)
  // Groesse, die das Werkzeug im Hauptfenster hat, bevor es hinauswandert.
  // Kein Wert aus einem Katalog, sondern gemessen - sie stimmt auch dann, wenn
  // sich ein Werkzeug spaeter aendert.
  //
  // **Alle Haken stehen vor dem Ladehinweis-Rückgabewert.** Standen sie darunter, liefen sie im
  // ersten Durchlauf nicht und im zweiten schon: React bricht das mit „Rendered more hooks than
  // during the previous render" ab. Der Fehler war vorhanden, seit die Kopfzeile den Ladehinweis
  // zeigt — er fiel erst auf, als ein zusätzlicher Zustand (`toolCatalogue`) den zweiten
  // Durchlauf mit demselben Hakenbestand auslöste.
  const zielGroesse = useRef({ w: 0, h: 0 })
  const [passtGroesse, setPasstGroesse] = useState<boolean | null>(null)
  // Ohne die Texte dieser Sprache stünden die Schlüsselnamen auf der Seite (`createTranslator`
  // gibt einen unbekannten Schlüssel unverändert zurück). Deshalb erst der Ladehinweis.
  if (!ready) {
    return <main className="detail-page"><p aria-live="polite">…</p></main>
  }
  const content = tool.id === 'text-statistics' ? <TextStatisticsTool t={t} />
    : tool.id === 'case-converter' ? <CaseConverterTool t={t} locale={locale} />
      : tool.id === 'json-formatter' ? <Suspense fallback={<p aria-live="polite">…</p>}><JsonFormatter t={t} /></Suspense>
        : tool.id === 'qr-code-generator' ? <QrCodeGenerator t={t} />
          : tool.id === 'image-metadata' ? <ImageMetadata t={t} locale={locale} />
            : tool.id === 'image-resize' ? <ImageResize t={t} locale={locale} />
              : tool.id === 'icon-generator' ? <IconGenerator t={t} locale={locale} />
                : tool.id === 'image-watermark' ? <ImageWatermark t={t} locale={locale} />
                  : tool.id === 'color-tools' ? <ColorTools t={t} />
                    : tool.id === 'calculator' ? <Suspense fallback={<p aria-live="polite">…</p>}><Calculator t={t} locale={locale} /></Suspense>
                      : tool.id === 'scientific-calculator' ? <Suspense fallback={<p aria-live="polite">…</p>}><ScientificCalculator t={t} locale={locale} /></Suspense>
                        : tool.id === 'programmer-calculator' ? <Suspense fallback={<p aria-live="polite">…</p>}><ProgrammerCalculator t={t} locale={locale} /></Suspense>
                          : tool.id === 'rpn-calculator' ? <Suspense fallback={<p aria-live="polite">…</p>}><RpnCalculator t={t} locale={locale} /></Suspense>
                      : tool.id === 'commercial' ? <Suspense fallback={<p aria-live="polite">…</p>}><Commercial t={t} locale={locale} /></Suspense>
                        : tool.id === 'geometry' ? <Suspense fallback={<p aria-live="polite">…</p>}><Geometry t={t} locale={locale} /></Suspense>
                        : tool.id === 'convert' ? <Suspense fallback={<p aria-live="polite">…</p>}><Convert t={t} locale={locale} /></Suspense>
                          : tool.id === 'datetime' ? <Suspense fallback={<p aria-live="polite">…</p>}><DateTime t={t} /></Suspense>
                            : tool.id === 'plotter' ? <Suspense fallback={<p aria-live="polite">…</p>}><Plotter t={t} /></Suspense>
                              : tool.id === 'statistics' ? <Suspense fallback={<p aria-live="polite">…</p>}><Statistics t={t} locale={locale} /></Suspense>
                                : tool.id === 'equations' ? <Suspense fallback={<p aria-live="polite">…</p>}><Equations t={t} locale={locale} /></Suspense>
                                  : tool.id === 'aufmass' ? <Suspense fallback={<p aria-live="polite">…</p>}><Aufmass t={t} locale={locale} /></Suspense>
                                  : tool.id === 'concrete' ? <Suspense fallback={<p aria-live="polite">…</p>}><Concrete t={t} locale={locale} /></Suspense>
                                  : tool.id === 'roof' ? <Suspense fallback={<p aria-live="polite">…</p>}><Roof t={t} locale={locale} /></Suspense>
                                  : tool.id === 'metal-weight' ? <Suspense fallback={<p aria-live="polite">…</p>}><MetalWeight t={t} locale={locale} /></Suspense>
                                  : tool.id === 'wood' ? <Suspense fallback={<p aria-live="polite">…</p>}><Wood t={t} locale={locale} /></Suspense>
                                  : tool.id === 'tiles' ? <Suspense fallback={<p aria-live="polite">…</p>}><Tiles t={t} locale={locale} /></Suspense>
                                  : tool.id === 'paint' ? <Suspense fallback={<p aria-live="polite">…</p>}><Paint t={t} locale={locale} /></Suspense>
                                  : tool.id === 'drywall' ? <Suspense fallback={<p aria-live="polite">…</p>}><Drywall t={t} locale={locale} /></Suspense>
                                  : tool.id === 'flooring' ? <Suspense fallback={<p aria-live="polite">…</p>}><Flooring t={t} locale={locale} /></Suspense>
                                  : tool.id === 'paving' ? <Suspense fallback={<p aria-live="polite">…</p>}><Paving t={t} locale={locale} /></Suspense>
                                  : tool.id === 'tires' ? <Suspense fallback={<p aria-live="polite">…</p>}><Tires t={t} locale={locale} /></Suspense>
                                  : tool.id === 'inspection' ? <Suspense fallback={<p aria-live="polite">…</p>}><Inspection t={t} locale={locale} /></Suspense>
                                    : tool.id === 'photo-caption' ? <Suspense fallback={<p aria-live="polite">…</p>}><PhotoCaption t={t} locale={locale} /></Suspense>
                                      : tool.id === 'handover-report' ? <Suspense fallback={<p aria-live="polite">…</p>}><HandoverReport t={t} locale={locale} /></Suspense>
                                        : tool.id === 'threads' ? <Suspense fallback={<p aria-live="polite">…</p>}><Threads t={t} locale={locale} /></Suspense>
                                            : tool.id === 'lighting' ? <Suspense fallback={<p aria-live="polite">…</p>}><Lighting t={t} locale={locale} /></Suspense>
                                              : tool.id === 'heatload' ? <Suspense fallback={<p aria-live="polite">…</p>}><Heatload t={t} locale={locale} /></Suspense>
                                                : tool.id === 'cable' ? <Suspense fallback={<p aria-live="polite">…</p>}><Cable t={t} locale={locale} /></Suspense>
                                                  : tool.id === 'pipes' ? <Suspense fallback={<p aria-live="polite">…</p>}><PipesTool t={t} locale={locale} /></Suspense>
              : tool.id === 'pdf-merge' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfMerge t={t} /></Suspense>
                : tool.id === 'pdf-split' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfSplit t={t} /></Suspense>
                  : tool.id === 'pdf-organize' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfOrganize t={t} /></Suspense>
                    : tool.id === 'images-to-pdf' ? <Suspense fallback={<p aria-live="polite">…</p>}><ImagesToPdf t={t} /></Suspense>
                      : tool.id === 'pdf-to-images' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfToImages t={t} /></Suspense>
                        : tool.id === 'pdf-watermark' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfWatermark t={t} /></Suspense>
                          : tool.id === 'pdf-page-numbers' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfPageNumbers t={t} /></Suspense>
                            : tool.id === 'pdf-visible-signature' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfVisibleSignature t={t} /></Suspense>
                              : tool.id === 'pdf-form-fill' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfFormFill t={t} /></Suspense>
                                : tool.id === 'pdf-annotate' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfAnnotate t={t} /></Suspense>
                                  : tool.id === 'pdf-security' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfSecurity t={t} /></Suspense>
                                    : tool.id === 'pdf-compress' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfCompress t={t} /></Suspense>
                                      : tool.id === 'pdf-viewer' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfViewer t={t} /></Suspense>
                                        : tool.id === 'pdf-text-ocr' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfTextOcr t={t} /></Suspense>
                                          : tool.id === 'pdf-certificate-sign' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfCertificateSign t={t} /></Suspense>
                                            : tool.id === 'pdf-signature-verify' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfSignatureVerify t={t} /></Suspense>
                                              : tool.id === 'pdf-metadata' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfMetadataTool t={t} /></Suspense>
                                                : tool.id === 'pdf-crop' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfCropTool t={t} /></Suspense>
                                                  : tool.id === 'pdf-repair' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfRepairTool t={t} /></Suspense>
                                                    : tool.id === 'pdf-attachments' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfAttachmentsTool t={t} /></Suspense>
                                                      : tool.id === 'pdf-compare' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfCompareTool t={t} /></Suspense>
                                                        : tool.id === 'pdf-a-preflight' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfAPreflightTool t={t} /></Suspense>
                                                          : <Suspense fallback={<p aria-live="polite">…</p>}><PdfRedactTool t={t} /></Suspense>
  const icon = searchEntryById.get(tool.id)?.icon
  // Auskoppeln: eine Instanz, zwei Orte. Der Inhalt wandert per Portal in das eigene
  // Fenster und kommt beim Schliessen unveraendert zurueck. Ohne Unterstuetzung
  // (Safari, mobil) verschwindet der Knopf, statt etwas Halbes anzubieten.
  const pipId = `tool-${tool.id}`
  // Ohne brauchbare Schnittstelle wird nichts angeboten - und zwar anhand einer
  // Pruefung, die wirklich die Faehigkeit testet. Der Hook der Bibliothek genuegt
  // hier nicht: Er sieht das Feld als vorhanden an, auch wenn es nichts kann.
  const unterstuetztAuskoppeln = typeof window !== 'undefined'
    && typeof window.documentPictureInPicture?.requestWindow === 'function'
  // Das Farbschema haengt am .app-Element im Hauptfenster. Das zweite Dokument
  // kennt es nicht - ohne das Attribut verliert der ausgewanderte Inhalt seine
  // Farben. Deshalb wird es beim Oeffnen mitgegeben.
  function setzeFarbschemaImFenster() {
    const w = window.documentPictureInPicture?.window
    if (!w) return
    const thema = document.querySelector('.app')?.getAttribute('data-theme') ?? 'light'
    w.document.documentElement.setAttribute('data-theme', thema)
  }
  function merkeGroesse() {
    const el = document.querySelector('.tool-content')
    if (el instanceof HTMLElement) zielGroesse.current = { w: el.clientWidth, h: el.clientHeight }
  }
  // Nicht "welcher Browser", sondern "ist die Groesse angekommen" - eine
  // Faehigkeitspruefung zur Laufzeit, die von selbst verschwindet, wenn ein
  // Browser das Verhalten korrigiert.
  function vergleicheGroesse() {
    const w = window.documentPictureInPicture?.window
    const ziel = zielGroesse.current
    if (!w || ziel.w <= 0) { setPasstGroesse(null); return }
    const nah = (a: number, b: number) => Math.abs(a - b) <= 24
    setPasstGroesse(nah(w.innerWidth, ziel.w) && nah(w.innerHeight, ziel.h))
  }
  // Der Klick muss im ausgekoppelten Fenster fallen - nur dort gilt er als
  // Erlaubnis fuer resizeTo. Deshalb steht dieser Knopf im ausgewanderten Inhalt.
  function passeGroesseAn() {
    const w = window.documentPictureInPicture?.window
    const ziel = zielGroesse.current
    if (!w || ziel.w <= 0) return
    // resizeTo setzt die AEUSSERE Fenstergroesse, gefordert ist die innere.
    // Der gemessene Rahmen des Fensters wird deshalb eingerechnet (Rahmenbreite
    // und Titelleiste) - sonst fehlen genau diese Pixel.
    const rahmenBreite = Math.max(0, w.outerWidth - w.innerWidth)
    const rahmenHoehe = Math.max(0, w.outerHeight - w.innerHeight)
    try { w.resizeTo(ziel.w + rahmenBreite, ziel.h + rahmenHoehe) } catch { /* ohne Nutzergeste nicht erlaubt */ }
    window.setTimeout(vergleicheGroesse, 800)
  }
  // Ein Knopf, eine Stelle: Er bleibt im Hauptfenster stehen und steuert das Fenster ueber
  // die Kennung. So ist der Rueckweg immer erreichbar - auch waehrend das Werkzeug draussen ist.
  const detachTrigger = <PipTrigger pipId={pipId} renderUnsupported={null} renderOpen={t('tool.detach')} renderClose={t('tool.detach.return')} openLabel={t('tool.detach')} closeLabel={t('tool.detach.return')} className="button detach" onClickCapture={merkeGroesse} />
  const detachPlaceholder = <div className="pip-placeholder stack"><p className="privacy-note">{t('tool.detach.placeholder')}</p><p>{t('tool.detach.placeholderHint')}</p></div>
  const groessenHilfe = passtGroesse === false
    ? <div className="pip-fit"><p className="scan-note">{t('tool.detach.fitHint')}</p><Button onClick={passeGroesseAn} className="detach">{t('tool.detach.fit')}</Button></div>
    : null
  return <main className="detail-page"><button className="text-link back" onClick={() => navigate('/')}>← {t('tool.back')}</button><article className="tool-shell"><div className="tool-shell-bar">{unterstuetztAuskoppeln ? detachTrigger : null}</div><PipWrapper id={pipId} fallback="none" placeholder={detachPlaceholder} onOpenChange={(offen) => { if (offen) { window.setTimeout(vergleicheGroesse, 900); window.setTimeout(setzeFarbschemaImFenster, 100); } else setPasstGroesse(null) }}>{groessenHilfe}<header className="tool-header"><div>{icon && <span className="card-icon" aria-hidden="true" style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }} />}<p className="category">{t(`category.${tool.category}`)}</p><h1>{toolsKopf.title}</h1><p>{toolsKopf.description}</p></div><div className="tool-header-side"><LocalBadge>{t('status.local')}</LocalBadge></div></header><div className="tool-content">{content}</div></PipWrapper></article></main>
}

function SuitePage({ suite, t, locale, navigate }: { suite: SuiteManifest; t: Translate; locale: string; navigate: (path: string) => void }) {
  const tools = getSuiteTools(suite)
  /**
   * Die Suiten-Seite braucht das **Suchpaket**: Titel, Kurztext und Schlagwörter der Karten stehen
   * dort (2026-10-05), nicht im Textpaket — das wird erst auf einer Werkzeugroute geladen.
   */
  const [index, setIndex] = useState<readonly ToolSearchEntry[]>([])
  useEffect(() => {
    let current = true
    void loadToolSearchIndex(locale as 'de' | 'en' | 'es').then((entries) => { if (current) setIndex(entries) })
    return () => { current = false }
  }, [locale])
  return <main className="detail-page"><button className="text-link back" onClick={() => navigate('/')}>← {t('tool.back')}</button><section className="suite-hero"><p className="eyebrow">Suite</p><h1>{t(suite.titleKey)}</h1><p>{t(suite.descriptionKey)}</p><span>{tools.length} {t('suite.tools')}</span></section><div className="catalog-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} t={t} locale={locale} navigate={navigate} index={index} />)}</div></main>
}

export function App() {
  const [locale, setLocale] = useState<Locale>(preferredLocale)
  const [theme, setTheme] = useState<Theme>(preferredTheme)
  const [pathname, navigate] = usePathname()
  const [query, setQuery] = useState('')
  const [toolMessages, setToolMessages] = useState<Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>>({})
  /** Die Sprache, deren Werkzeugtexte geladen sind — `null`, solange keine geladen ist. */
  const [toolTextsLocale, setToolTextsLocale] = useState<Locale | null>(null)
  const [toolTextsTool, setToolTextsTool] = useState<string | null>(null)
  const [interfaceMessages, setInterfaceMessages] = useState<Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>>({})
  /**
   * **Nur die Texte der Oberfläche werden beim Start geholt** (Entscheidung 2026-10-05). Die Texte
   * der Werkzeugoberflächen kommen erst auf einer Werkzeugroute — Startseite, Katalog und Suiten
   * brauchen sie nicht: Karten und Suiten lesen Titel und Kurztext aus dem **Suchpaket**. Damit
   * wächst die Startlast nicht mehr mit jedem neuen Werkzeug.
   */
  useEffect(() => { let current = true; void loadInterfaceMessages(locale).then((ui) => { if (current) setInterfaceMessages(ui) }); return () => { current = false } }, [locale])
  const searching = query.trim().length >= MIN_QUERY_LENGTH
  const activeTool = toolByRoute.get(pathname)
  const activeSuite = suiteByRoute.get(pathname)
  /**
   * **Die Katalogtexte des aktiven Werkzeugs gehören in den Übersetzer der Werkzeugroute.**
   * `title`, `summary`, `description` und `terms` liegen seit der Aufteilung (2026-10-05) im
   * **Suchpaket** und damit **nicht** mehr im Textpaket des Werkzeugs. Oberflächen, die sie über
   * `t('tool.<x>.summary')` ausgeben, zeigten deshalb den Schlüsselnamen statt Text — gefunden am
   * 2026-10-05 im Beleg zu „Fliesen, Kleber und Fugenmörtel" (zwölf Werkzeuge betroffen).
   * Der Suchindex ist auf jeder Seite geladen (die Werkzeugschublade steckt im Kopfbereich);
   * hier werden nur die vier Schlüssel **dieses** Werkzeugs in den Übersetzer gehängt.
   */
  const [catalogueKeys, setCatalogueKeys] = useState<Readonly<Record<string, Readonly<Record<string, string>>>>>({})
  useEffect(() => {
    if (!activeTool) { setCatalogueKeys({}); return undefined }
    let current = true
    void loadToolSearchIndex(locale).then((entries) => {
      if (!current) return
      const text = entries.find((entry) => entry.id === activeTool.id)?.locales[locale]
      setCatalogueKeys(text
        ? {
            [locale]: {
              [activeTool.titleKey]: text.title,
              [activeTool.summaryKey]: text.summary,
              [activeTool.descriptionKey]: text.description,
              [activeTool.termsKey]: [...text.terms, ...text.tags].join(', ')
            }
          }
        : {})
    })
    return () => { current = false }
  }, [activeTool, locale])
  const t: Translate = createTranslator(locale, [interfaceMessages, toolMessages, catalogueKeys])
  /**
   * Die Werkzeugtexte werden **an die Werkzeugroute gebunden** geholt. Bis sie da sind, zeigt die
   * Werkzeugseite den Ladehinweis statt der Schlüsselnamen — `createTranslator` gibt für einen
   * unbekannten Schlüssel den Schlüssel selbst zurück.
   */
  useEffect(() => {
    if (!activeTool) return undefined
    let current = true
    // Die Textlader liegen in einem eigenen Chunk (Verweiskarte über 147 Pakete, ~2,6 kB gzip):
    // die Startseite soll sie nicht mitladen. Sie werden erst hier geholt.
    void import('@commietools/tools/text-loaders')
      .then(({ loadToolTexts }) => loadToolTexts(locale, activeTool.id))
      .then((tools) => {
        if (!current) return
        setToolMessages(tools)
        setToolTextsLocale(locale)
        setToolTextsTool(activeTool.id)
      })
    return () => { current = false }
  }, [activeTool, locale])

  useEffect(() => {
    localStorage.setItem('commietools-locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = localeRegistry[locale].direction
  }, [locale])

  // Das Farbschema auch im ausgekoppelten Fenster nachfuehren: Es haengt am
  // .app-Element des Hauptfensters, das dort nicht existiert.
  useEffect(() => {
    const w = window.documentPictureInPicture?.window
    if (w) w.document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('commietools-theme', next)
  }

  const goToSuites = () => {
    navigate('/')
    setQuery('')
    requestAnimationFrame(() => document.getElementById('suites')?.scrollIntoView())
  }

  return <div className="app" data-theme={theme}><header className="site-header"><div className="header-leading"><ToolNavigation t={t} locale={locale} activeToolId={activeTool?.id} navigate={navigate} /><button className="brand button-reset" onClick={() => navigate('/')} aria-label={t('app.name')}><span className="brand-mark" aria-hidden="true">★</span><span>Commie<span>Tools</span></span></button></div><nav aria-label="Main navigation"><button className="button-reset" onClick={() => navigate('/')}>{t('nav.tools')}</button><button className="button-reset" onClick={goToSuites}>{t('nav.suites')}</button></nav><div className="header-actions"><select className="language-select" value={locale} aria-label={t('action.language')} onChange={(event) => { if (isLocale(event.target.value)) setLocale(event.target.value) }}>{supportedLocales.map((code) => <option key={code} value={code}>{localeRegistry[code].label}</option>)}</select><Button onClick={toggleTheme} aria-label={t('action.theme')}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span></Button></div></header>{pathname === '/licenses' ? <LicensePage t={t} navigate={navigate} /> : pathname === '/impressum' ? <LegalNoticePage t={t} navigate={navigate} /> : activeTool ? <ToolPage tool={activeTool} t={t} locale={locale} navigate={navigate} ready={toolTextsLocale === locale && toolTextsTool === activeTool.id} /> : activeSuite ? <SuitePage suite={activeSuite} t={t} locale={locale} navigate={navigate} /> : <main><section className="hero"><p className="eyebrow">CommieTools.org</p><h1>{t('app.tagline')}</h1><p className="hero-copy">{t('app.promise')}</p><div className="badges"><LocalBadge>{t('status.local')}</LocalBadge><LocalBadge>{t('status.offline')}</LocalBadge></div></section><section className="section" id="tools"><CatalogSection t={t} locale={locale} navigate={navigate} query={query} onQuery={setQuery} /></section>{!searching && <section className="section" id="suites"><div className="section-heading"><div><p className="eyebrow">02</p><h2>{t('suite.heading')}</h2></div><p>{t('suite.intro')}</p></div><div className="catalog-grid suites">{suiteManifests.map((suite) => <article className="catalog-card suite-card" key={suite.id}><p className="category">Suite</p><h3>{t(suite.titleKey)}</h3><p>{t(suite.descriptionKey)}</p><div className="card-footer"><span>{suite.toolIds.length} {t('suite.tools')}</span><button className="text-link" onClick={() => navigate(suite.route)}>{t('suite.open')} →</button></div></article>)}</div></section>}</main>}<footer className="site-footer"><span>© 2026 CommieTools contributors · AGPL-3.0-only</span><div className="footer-links"><button className="text-link" onClick={() => navigate('/impressum')}>{t('footer.legal')}</button><button className="text-link" onClick={() => navigate('/licenses')}>{t('footer.licenses')}</button></div></footer></div>
}
