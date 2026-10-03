import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { SuiteManifest, ToolManifest } from '@commietools/core'
import { createTranslator, detectLocale, isLocale, localeRegistry, supportedLocales, type Locale } from '@commietools/i18n'
import { convertCase, formatJson, getSuiteTools, getTextStatistics, MIN_QUERY_LENGTH, searchEntryById, suiteByRoute, suiteManifests, toolByRoute, toolMessages, type CaseMode } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'
import { CatalogSection } from './CatalogSection'
import { LicensePage } from './LicensePage'
import { LegalNoticePage } from './LegalNoticePage'
import { ToolCard } from './ToolCard'
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
    history.pushState({}, '', path)
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
              : tool.id === 'pdf-merge' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfMerge t={t} /></Suspense>
                : tool.id === 'pdf-split' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfSplit t={t} /></Suspense>
                  : tool.id === 'pdf-organize' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfOrganize t={t} /></Suspense>
                    : tool.id === 'images-to-pdf' ? <Suspense fallback={<p aria-live="polite">…</p>}><ImagesToPdf t={t} /></Suspense>
                      : tool.id === 'pdf-to-images' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfToImages t={t} /></Suspense>
                        : tool.id === 'pdf-watermark' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfWatermark t={t} /></Suspense>
                          : tool.id === 'pdf-page-numbers' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfPageNumbers t={t} /></Suspense>
                            : tool.id === 'pdf-visible-signature' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfVisibleSignature t={t} /></Suspense>
                              : tool.id === 'pdf-form-fill' ? <Suspense fallback={<p aria-live="polite">…</p>}><PdfFormFill t={t} /></Suspense>
                                : <Suspense fallback={<p aria-live="polite">…</p>}><PdfAnnotate t={t} /></Suspense>
  const icon = searchEntryById.get(tool.id)?.icon
  return <main className="detail-page"><button className="text-link back" onClick={() => navigate('/')}>← {t('tool.back')}</button><article className="tool-shell"><header className="tool-header"><div>{icon && <span className="card-icon" aria-hidden="true" style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }} />}<p className="category">{t(`category.${tool.category}`)}</p><h1>{t(tool.titleKey)}</h1><p>{t(tool.descriptionKey)}</p></div><LocalBadge>{t('status.local')}</LocalBadge></header><div className="tool-content">{content}</div></article></main>
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
  const searching = query.trim().length >= MIN_QUERY_LENGTH
  const t: Translate = createTranslator(locale, [toolMessages])
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

  return <div className="app" data-theme={theme}><header className="site-header"><button className="brand button-reset" onClick={() => navigate('/')} aria-label={t('app.name')}><span className="brand-mark" aria-hidden="true">★</span><span>Commie<span>Tools</span></span></button><nav aria-label="Main navigation"><button className="button-reset" onClick={() => navigate('/')}>{t('nav.tools')}</button><button className="button-reset" onClick={goToSuites}>{t('nav.suites')}</button></nav><div className="header-actions"><select className="language-select" value={locale} aria-label={t('action.language')} onChange={(event) => { if (isLocale(event.target.value)) setLocale(event.target.value) }}>{supportedLocales.map((code) => <option key={code} value={code}>{localeRegistry[code].label}</option>)}</select><Button onClick={toggleTheme} aria-label={t('action.theme')}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span></Button></div></header>{pathname === '/licenses' ? <LicensePage t={t} navigate={navigate} /> : pathname === '/impressum' ? <LegalNoticePage t={t} navigate={navigate} /> : activeTool ? <ToolPage tool={activeTool} t={t} locale={locale} navigate={navigate} /> : activeSuite ? <SuitePage suite={activeSuite} t={t} locale={locale} navigate={navigate} /> : <main><section className="hero"><p className="eyebrow">CommieTools.org</p><h1>{t('app.tagline')}</h1><p className="hero-copy">{t('app.promise')}</p><div className="badges"><LocalBadge>{t('status.local')}</LocalBadge><LocalBadge>{t('status.offline')}</LocalBadge></div></section><section className="section" id="tools"><CatalogSection t={t} locale={locale} navigate={navigate} query={query} onQuery={setQuery} /></section>{!searching && <section className="section" id="suites"><div className="section-heading"><div><p className="eyebrow">02</p><h2>{t('suite.heading')}</h2></div><p>{t('suite.intro')}</p></div><div className="catalog-grid suites">{suiteManifests.map((suite) => <article className="catalog-card suite-card" key={suite.id}><p className="category">Suite</p><h3>{t(suite.titleKey)}</h3><p>{t(suite.descriptionKey)}</p><div className="card-footer"><span>{suite.toolIds.length} {t('suite.tools')}</span><button className="text-link" onClick={() => navigate(suite.route)}>{t('suite.open')} →</button></div></article>)}</div></section>}</main>}<footer className="site-footer"><span>© 2026 CommieTools contributors · AGPL-3.0-only</span><div className="footer-links"><button className="text-link" onClick={() => navigate('/impressum')}>{t('footer.legal')}</button><button className="text-link" onClick={() => navigate('/licenses')}>{t('footer.licenses')}</button></div></footer></div>
}
