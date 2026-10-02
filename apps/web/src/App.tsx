import { useMemo, useState } from 'react'
import { translate, type Locale, type MessageKey } from '@commietools/i18n'
import { getTextStatistics, toolManifests } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'

type Theme = 'light' | 'dark'

function preferredTheme(): Theme {
  const saved = localStorage.getItem('commietools-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function App() {
  const [locale, setLocale] = useState<Locale>(() => navigator.language.startsWith('de') ? 'de' : 'en')
  const [theme, setTheme] = useState<Theme>(preferredTheme)
  const [text, setText] = useState('')
  const t = (key: MessageKey) => translate(locale, key)
  const stats = useMemo(() => getTextStatistics(text), [text])
  const manifest = toolManifests[0]!

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('commietools-theme', next)
  }

  return (
    <div className="app" data-theme={theme}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={t('app.name')}>
          <span className="brand-mark" aria-hidden="true">★</span>
          <span>Commie<span>Tools</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#tools">{t('nav.tools')}</a>
          <a href="#principles">{t('nav.about')}</a>
        </nav>
        <div className="header-actions">
          <Button onClick={() => setLocale(locale === 'de' ? 'en' : 'de')} aria-label={t('action.language')}>
            {locale.toUpperCase()}
          </Button>
          <Button onClick={toggleTheme} aria-label={t('action.theme')}>
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">CommieTools.org</p>
          <h1>{t('app.tagline')}</h1>
          <p className="hero-copy">{t('app.promise')}</p>
          <div className="badges">
            <LocalBadge>{t('status.local')}</LocalBadge>
            <LocalBadge>{t('status.offline')}</LocalBadge>
          </div>
        </section>

        <section className="section" id="tools" aria-labelledby="tools-title">
          <div className="section-heading">
            <div><p className="eyebrow">01</p><h2 id="tools-title">{t('catalog.title')}</h2></div>
            <p>{t('catalog.intro')}</p>
          </div>

          <article className="tool-shell">
            <header className="tool-header">
              <div>
                <p className="category">{t(`category.${manifest.category}` as MessageKey)}</p>
                <h3>{t(manifest.titleKey as MessageKey)}</h3>
                <p>{t(manifest.descriptionKey as MessageKey)}</p>
              </div>
              <LocalBadge>{t('status.local')}</LocalBadge>
            </header>
            <div className="tool-grid">
              <div className="input-panel">
                <label htmlFor="text-input">{t('tool.textStats.input')}</label>
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t('tool.textStats.placeholder')}
                />
              </div>
              <dl className="results" aria-live="polite">
                <div><dt>{t('tool.textStats.characters')}</dt><dd>{stats.characters}</dd></div>
                <div><dt>{t('tool.textStats.words')}</dt><dd>{stats.words}</dd></div>
                <div><dt>{t('tool.textStats.lines')}</dt><dd>{stats.lines}</dd></div>
              </dl>
            </div>
          </article>
        </section>

        <section className="section principles" id="principles" aria-labelledby="principles-title">
          <p className="eyebrow">02</p>
          <h2 id="principles-title">{t('principles.title')}</h2>
          <div className="principle-grid">
            <p>{t('principles.local')}</p>
            <p>{t('principles.offline')}</p>
            <p>{t('principles.consistent')}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

