import { useEffect, useMemo, useState } from 'react'
import type { ToolSearchEntry } from '@commietools/core'
import { loadToolSearchIndex, MIN_QUERY_LENGTH, searchTools, toolById, toolManifests } from '@commietools/tools'
import { ToolCard, type Translate } from './ToolCard'

/**
 * The tool catalogue with its search. Without a query it lists every tool;
 * from two characters on it shows matches with the reason they matched.
 */
export function CatalogSection({ t, locale, navigate, query, onQuery }: { t: Translate; locale: string; navigate: (path: string) => void; query: string; onQuery: (value: string) => void }) {
  const [toolIndex, setToolIndex] = useState<readonly ToolSearchEntry[]>([])
  const [searchReady, setSearchReady] = useState(false)
  /**
   * **Fehlerweg des Katalogindex (Karte M4-004).** Ohne ihn blieb eine unbehandelte Ablehnung
   * stehen (`.then` ohne zweites Argument gibt die Ablehnung an eine neue Zusage weiter, die
   * niemand behandelt) und die Suche stand für immer auf „wird geladen". Jetzt steht eine
   * übersetzte Meldung da; die Liste der Werkzeuge kommt weiter aus dem Register selbst, nur die
   * Katalogtexte fehlen.
   */
  const [searchFailed, setSearchFailed] = useState(false)
  useEffect(() => { let current=true;setSearchReady(false);setSearchFailed(false);void loadToolSearchIndex(locale as 'de'|'en'|'es').then((index)=>{if(current){setToolIndex(index);setSearchReady(true)}},()=>{if(current){setToolIndex([]);setSearchReady(true);setSearchFailed(true)}});return()=>{current=false} },[locale])
  const trimmed = query.trim()
  const isSearching = trimmed.length >= MIN_QUERY_LENGTH
  const results = useMemo(() => searchTools(toolIndex, { query: trimmed, locale, label: t }), [toolIndex, trimmed, locale, t])

  return (
    <section className="section" id="tools">
      <div className="section-heading"><div><p className="eyebrow">01</p><h2>{t('catalog.title')}</h2></div><p>{t('catalog.intro')}</p></div>
      <div className="catalog-search">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={query} aria-label={t('catalog.search')} placeholder={t('catalog.search')} onChange={(event) => onQuery(event.target.value)} />
        </label>
        {query !== '' && <button className="text-link" onClick={() => onQuery('')}>{t('catalog.clear')}</button>}
      </div>
      <p className="search-hint">{t('catalog.searchHint')}</p>
      {searchFailed && <p className="error" role="alert">{t('catalog.loadFailed')}</p>}
      {isSearching && !searchReady ? <p className="search-count" role="status">{t('catalog.search')} …</p> : isSearching ? (
        results.length > 0 ? (
          <>
            <p className="search-count" aria-live="polite"><strong>{results.length}</strong> {t('catalog.results')}</p>
            <div className="catalog-grid">
              {results.map((match) => {
                const tool = toolById.get(match.entry.id)
                return tool ? <ToolCard key={tool.id} tool={tool} t={t} locale={locale} navigate={navigate} index={toolIndex} match={{ label: t('catalog.foundVia'), text: match.matched }} /> : null
              })}
            </div>
          </>
        ) : (
          <p className="search-empty" role="status">{t('catalog.noResults')}</p>
        )
      ) : (
        <div className="catalog-grid">
          {toolManifests.map((tool) => <ToolCard key={tool.id} tool={tool} t={t} locale={locale} navigate={navigate} index={toolIndex} />)}
        </div>
      )}
    </section>
  )
}
