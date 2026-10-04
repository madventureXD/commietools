import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { SuiteManifest, ToolManifest } from '@commietools/core'
import { createTranslator, detectLocale, isLocale, loadInterfaceMessages, localeRegistry, supportedLocales, type Locale } from '@commietools/i18n'
import { convertCase, formatJson, getSuiteTools, getTextStatistics, loadToolMessages, MIN_QUERY_LENGTH, searchEntryById, suiteByRoute, suiteManifests, toolByRoute, type CaseMode } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'
import { PipTrigger, PipWrapper } from '@pip-it-up/react'
import { CatalogSection } from './CatalogSection'
import { LicensePage } from './LicensePage'
import { LegalNoticePage } from './LegalNoticePage'
import { ToolCard } from './ToolCard'
import { ToolNavigation } from './ToolNavigation'
import { ImageMetadata } from './tools/ImageMetadata'
import { ImageResize } from './tools/ImageResize'
import { IconGenerator } from './tools/IconGenerator'
import { ImageWatermark } from './tools/ImageWatermark'
import { ColorTools } from './tools/ColorTools'
import { QrCodeGenerator } from './tools/QrCodeGenerator'

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
const Commercial = lazy(() => import('./tools/Commercial').then((module) => ({ default: module.Commercial })))
const Geometry = lazy(() => import('./tools/Geometry').then((module) => ({ default: module.Geometry })))
const Convert = lazy(() => import('./tools/Convert').then((module) => ({ default: module.Convert })))
const DateTime = lazy(() => import('./tools/DateTime').then((module) => ({ default: module.DateTime })))
const Plotter = lazy(() => import('./tools/Plotter').then((module) => ({ default: module.Plotter })))
const Statistics = lazy(() => import('./tools/Statistics').then((module) => ({ default: module.Statistics })))
const Equations = lazy(() => import('./tools/Equations').then((module) => ({ default: module.Equations })))
const Aufmass = lazy(() => import('./tools/Aufmass').then((module) => ({ default: module.Aufmass })))

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

function TextArea({ label, value, onChange, readOnly = false }: { label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean }) {
  return <div className="input-panel"><label>{label}<textarea value={value} onChange={(event) => onChange?.(event.target.value)} readOnly={readOnly} /></label></div>
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

function JsonFormatterTool({ t }: { t: Translate }) {
  const [text, setText] = useState('')
  const [indentation, setIndentation] = useState(2)
  const result = useMemo(() => formatJson(text, indentation), [text, indentation])
  return <div className="stack"><div className="inline-field"><label htmlFor="indentation">{t('tool.jsonFormatter.indentation')}</label><select id="indentation" value={indentation} onChange={(event) => setIndentation(Number(event.target.value))}><option value="2">2</option><option value="4">4</option></select></div><div className="tool-grid"><TextArea label={t('tool.jsonFormatter.input')} value={text} onChange={setText} /><div><TextArea label={t('tool.result')} value={result.value} readOnly />{result.error && <p className="error" role="alert">{t('tool.jsonFormatter.invalid')}</p>}</div></div></div>
}

function ToolPage({ tool, t, locale, navigate }: { tool: ToolManifest; t: Translate; locale: Locale; navigate: (path: string) => void }) {
  const content = tool.id === 'text-statistics' ? <TextStatisticsTool t={t} />
    : tool.id === 'case-converter' ? <CaseConverterTool t={t} locale={locale} />
      : tool.id === 'json-formatter' ? <JsonFormatterTool t={t} />
        : tool.id === 'qr-code-generator' ? <QrCodeGenerator t={t} />
          : tool.id === 'image-metadata' ? <ImageMetadata t={t} locale={locale} />
            : tool.id === 'image-resize' ? <ImageResize t={t} locale={locale} />
              : tool.id === 'icon-generator' ? <IconGenerator t={t} locale={locale} />
                : tool.id === 'image-watermark' ? <ImageWatermark t={t} locale={locale} />
                  : tool.id === 'color-tools' ? <ColorTools t={t} />
                    : tool.id === 'calculator' ? <Suspense fallback={<p aria-live="polite">…</p>}><Calculator t={t} locale={locale} /></Suspense>
                      : tool.id === 'commercial' ? <Suspense fallback={<p aria-live="polite">…</p>}><Commercial t={t} locale={locale} /></Suspense>
                        : tool.id === 'geometry' ? <Suspense fallback={<p aria-live="polite">…</p>}><Geometry t={t} locale={locale} /></Suspense>
                        : tool.id === 'convert' ? <Suspense fallback={<p aria-live="polite">…</p>}><Convert t={t} locale={locale} /></Suspense>
                          : tool.id === 'datetime' ? <Suspense fallback={<p aria-live="polite">…</p>}><DateTime t={t} /></Suspense>
                            : tool.id === 'plotter' ? <Suspense fallback={<p aria-live="polite">…</p>}><Plotter t={t} /></Suspense>
                              : tool.id === 'statistics' ? <Suspense fallback={<p aria-live="polite">…</p>}><Statistics t={t} locale={locale} /></Suspense>
                                : tool.id === 'equations' ? <Suspense fallback={<p aria-live="polite">…</p>}><Equations t={t} locale={locale} /></Suspense>
                                  : tool.id === 'aufmass' ? <Suspense fallback={<p aria-live="polite">…</p>}><Aufmass t={t} locale={locale} /></Suspense>
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
  // Groesse, die das Werkzeug im Hauptfenster hat, bevor es hinauswandert.
  // Kein Wert aus einem Katalog, sondern gemessen - sie stimmt auch dann, wenn
  // sich ein Werkzeug spaeter aendert.
  const zielGroesse = useRef({ w: 0, h: 0 })
  const [passtGroesse, setPasstGroesse] = useState<boolean | null>(null)
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
  const detachTrigger = <PipTrigger pipId={pipId} renderOpen={t('tool.detach')} renderClose={t('tool.detach.return')} openLabel={t('tool.detach')} closeLabel={t('tool.detach.return')} className="button detach" onClickCapture={merkeGroesse} />
  const detachPlaceholder = <div className="pip-placeholder stack"><p className="privacy-note">{t('tool.detach.placeholder')}</p><p>{t('tool.detach.placeholderHint')}</p></div>
  const groessenHilfe = passtGroesse === false
    ? <div className="pip-fit"><p className="scan-note">{t('tool.detach.fitHint')}</p><Button onClick={passeGroesseAn} className="detach">{t('tool.detach.fit')}</Button></div>
    : null
  return <main className="detail-page"><button className="text-link back" onClick={() => navigate('/')}>← {t('tool.back')}</button><article className="tool-shell"><div className="tool-shell-bar">{detachTrigger}</div><PipWrapper id={pipId} fallback="none" placeholder={detachPlaceholder} onOpenChange={(offen) => { if (offen) window.setTimeout(vergleicheGroesse, 900); else setPasstGroesse(null) }}>{groessenHilfe}<header className="tool-header"><div>{icon && <span className="card-icon" aria-hidden="true" style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }} />}<p className="category">{t(`category.${tool.category}`)}</p><h1>{t(tool.titleKey)}</h1><p>{t(tool.descriptionKey)}</p></div><div className="tool-header-side"><LocalBadge>{t('status.local')}</LocalBadge></div></header><div className="tool-content">{content}</div></PipWrapper></article></main>
}

function SuitePage({ suite, t, locale, navigate }: { suite: SuiteManifest; t: Translate; locale: string; navigate: (path: string) => void }) {
  const tools = getSuiteTools(suite)
  return <main className="detail-page"><button className="text-link back" onClick={() => navigate('/')}>← {t('tool.back')}</button><section className="suite-hero"><p className="eyebrow">Suite</p><h1>{t(suite.titleKey)}</h1><p>{t(suite.descriptionKey)}</p><span>{tools.length} {t('suite.tools')}</span></section><div className="catalog-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} t={t} locale={locale} navigate={navigate} />)}</div></main>
}

export function App() {
  const [locale, setLocale] = useState<Locale>(preferredLocale)
  const [theme, setTheme] = useState<Theme>(preferredTheme)
  const [pathname, navigate] = usePathname()
  const [query, setQuery] = useState('')
  const [toolMessages, setToolMessages] = useState<Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>>({})
  const [interfaceMessages, setInterfaceMessages] = useState<Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>>({})
  useEffect(() => { let current = true; void Promise.all([loadToolMessages(locale),loadInterfaceMessages(locale)]).then(([tools,ui]) => { if (current) { setToolMessages(tools); setInterfaceMessages(ui) } }); return () => { current = false } }, [locale])
  const searching = query.trim().length >= MIN_QUERY_LENGTH
  const t: Translate = createTranslator(locale, [interfaceMessages, toolMessages])
  const activeTool = toolByRoute.get(pathname)
  const activeSuite = suiteByRoute.get(pathname)

  useEffect(() => {
    localStorage.setItem('commietools-locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = localeRegistry[locale].direction
  }, [locale])

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

  return <div className="app" data-theme={theme}><header className="site-header"><div className="header-leading"><ToolNavigation t={t} locale={locale} activeToolId={activeTool?.id} navigate={navigate} /><button className="brand button-reset" onClick={() => navigate('/')} aria-label={t('app.name')}><span className="brand-mark" aria-hidden="true">★</span><span>Commie<span>Tools</span></span></button></div><nav aria-label="Main navigation"><button className="button-reset" onClick={() => navigate('/')}>{t('nav.tools')}</button><button className="button-reset" onClick={goToSuites}>{t('nav.suites')}</button></nav><div className="header-actions"><select className="language-select" value={locale} aria-label={t('action.language')} onChange={(event) => { if (isLocale(event.target.value)) setLocale(event.target.value) }}>{supportedLocales.map((code) => <option key={code} value={code}>{localeRegistry[code].label}</option>)}</select><Button onClick={toggleTheme} aria-label={t('action.theme')}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span></Button></div></header>{pathname === '/licenses' ? <LicensePage t={t} navigate={navigate} /> : pathname === '/impressum' ? <LegalNoticePage t={t} navigate={navigate} /> : activeTool ? <ToolPage tool={activeTool} t={t} locale={locale} navigate={navigate} /> : activeSuite ? <SuitePage suite={activeSuite} t={t} locale={locale} navigate={navigate} /> : <main><section className="hero"><p className="eyebrow">CommieTools.org</p><h1>{t('app.tagline')}</h1><p className="hero-copy">{t('app.promise')}</p><div className="badges"><LocalBadge>{t('status.local')}</LocalBadge><LocalBadge>{t('status.offline')}</LocalBadge></div></section><section className="section" id="tools"><CatalogSection t={t} locale={locale} navigate={navigate} query={query} onQuery={setQuery} /></section>{!searching && <section className="section" id="suites"><div className="section-heading"><div><p className="eyebrow">02</p><h2>{t('suite.heading')}</h2></div><p>{t('suite.intro')}</p></div><div className="catalog-grid suites">{suiteManifests.map((suite) => <article className="catalog-card suite-card" key={suite.id}><p className="category">Suite</p><h3>{t(suite.titleKey)}</h3><p>{t(suite.descriptionKey)}</p><div className="card-footer"><span>{suite.toolIds.length} {t('suite.tools')}</span><button className="text-link" onClick={() => navigate(suite.route)}>{t('suite.open')} →</button></div></article>)}</div></section>}</main>}<footer className="site-footer"><span>© 2026 CommieTools contributors · AGPL-3.0-only</span><div className="footer-links"><button className="text-link" onClick={() => navigate('/impressum')}>{t('footer.legal')}</button><button className="text-link" onClick={() => navigate('/licenses')}>{t('footer.licenses')}</button></div></footer></div>
}
