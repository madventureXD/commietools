import { useEffect, useMemo, useRef, useState } from 'react'
import type { ToolCategory, ToolManifest } from '@commietools/core'
import type { ToolSearchEntry } from '@commietools/core'
import { loadToolSearchIndex, MIN_QUERY_LENGTH, searchEntryById, searchTools, toolById, toolManifests } from '@commietools/tools'
import { toolTextsFrom } from './tool-texts'
import { addRecentTool, toggleToolId, validRecentTools, validToolIds, type RecentTool, type ToolSort } from './toolNavigationState'

type Translate = (key: string) => string

const FAVORITES_KEY = 'commietools-tool-favorites'
const RECENT_KEY = 'commietools-tool-recent'
const SORT_KEY = 'commietools-tool-sort'
const knownIds = new Set(toolManifests.map((tool) => tool.id))
const preferredCategoryOrder: ToolCategory[] = ['pdf', 'image', 'generator', 'developer', 'text']
const categoryOrder = [...new Set(toolManifests.map((tool) => tool.category))].sort((left, right) => {
  const leftIndex = preferredCategoryOrder.indexOf(left)
  const rightIndex = preferredCategoryOrder.indexOf(right)
  return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex)
})

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Navigation remains usable without storage. */ }
}

export function ToolNavigation({ t, locale, activeToolId, navigate }: { t: Translate; locale: string; activeToolId?: string; navigate: (path: string) => void }) {
  const [toolIndex, setToolIndex] = useState<readonly ToolSearchEntry[]>([])
  const [searchReady, setSearchReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<ToolSort>(() => {
    const saved = localStorage.getItem(SORT_KEY)
    return saved === 'az' || saved === 'recent' || saved === 'favorites' ? saved : 'category'
  })
  const [favorites, setFavorites] = useState<string[]>(() => validToolIds(readJson<string[]>(FAVORITES_KEY, []), knownIds))
  const [recent, setRecent] = useState<RecentTool[]>(() => validRecentTools(readJson<RecentTool[]>(RECENT_KEY, []), knownIds))
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const pushedHistory = useRef(false)

  useEffect(() => { let current=true;setSearchReady(false);void loadToolSearchIndex(locale as 'de'|'en'|'es').then((index)=>{if(current){setToolIndex(index);setSearchReady(true)}});return()=>{current=false} },[locale])

  useEffect(() => {
    if (!activeToolId || !knownIds.has(activeToolId)) return
    setRecent((current) => {
      const next = addRecentTool(current, activeToolId)
      writeJson(RECENT_KEY, next)
      return next
    })
  }, [activeToolId])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // On phones, focusing search immediately opens the software keyboard and
    // hides most of the navigation. Desktop keeps the keyboard-first flow.
    if (matchMedia('(min-width: 721px)').matches) requestAnimationFrame(() => searchRef.current?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')]
      if (!focusable.length) return
      const first = focusable[0]!
      const last = focusable.at(-1)!
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    const onPopState = () => {
      pushedHistory.current = false
      setOpen(false)
      triggerRef.current?.focus()
    }
    addEventListener('keydown', onKeyDown)
    addEventListener('popstate', onPopState)
    return () => {
      document.body.style.overflow = previousOverflow
      removeEventListener('keydown', onKeyDown)
      removeEventListener('popstate', onPopState)
    }
  }, [open])

  function openMenu() {
    if (open) return
    history.pushState({ ...history.state, commieToolsMenu: true }, '', location.href)
    pushedHistory.current = true
    setOpen(true)
  }

  function closeMenu() {
    setOpen(false)
    setQuery('')
    triggerRef.current?.focus()
    if (pushedHistory.current && history.state?.commieToolsMenu) {
      pushedHistory.current = false
      history.back()
    }
  }

  function selectSort(next: ToolSort) {
    setSort(next)
    try { localStorage.setItem(SORT_KEY, next) } catch { /* Optional preference. */ }
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = toggleToolId(current, id)
      writeJson(FAVORITES_KEY, next)
      return next
    })
  }

  function openTool(tool: ToolManifest) {
    setOpen(false)
    setQuery('')
    pushedHistory.current = false
    navigate(tool.route)
  }

  const trimmed = query.trim()
  const matches = useMemo(() => trimmed.length >= MIN_QUERY_LENGTH ? searchTools(toolIndex, { query: trimmed, locale, label: t }) : [], [toolIndex, trimmed, locale, t])
  /**
   * Titel aus dem **Suchpaket** — das Textpaket wird erst auf einer Werkzeugroute geladen
   * (2026-10-05). Über `t(tool.titleKey)` stünden in der Schublade die Schlüsselnamen.
   */
  const titleOf = (tool: ToolManifest) => toolTextsFrom(toolIndex, tool, locale, t).title
  const visible = useMemo(() => {
    if (trimmed.length >= MIN_QUERY_LENGTH) return matches.flatMap((match) => toolById.get(match.entry.id) ?? [])
    if (sort === 'favorites') return favorites.flatMap((id) => toolById.get(id) ?? [])
    if (sort === 'recent') return recent.flatMap((item) => toolById.get(item.id) ?? [])
    if (sort === 'az') return [...toolManifests].sort((left, right) => titleOf(left).localeCompare(titleOf(right), locale))
    return toolManifests
  }, [favorites, locale, matches, recent, sort, t, trimmed, toolIndex])

  const toolRow = (tool: ToolManifest) => {
    const entry = searchEntryById.get(tool.id)
    const match = matches.find((item) => item.entry.id === tool.id)
    const favorite = favorites.includes(tool.id)
    return <div className={`tool-menu-row${activeToolId === tool.id ? ' active' : ''}`} key={tool.id}>
      <button className="tool-menu-open button-reset" onClick={() => openTool(tool)} aria-current={activeToolId === tool.id ? 'page' : undefined}>
        {entry?.icon && <span className="tool-menu-icon" aria-hidden="true" style={{ maskImage: `url(${entry.icon})`, WebkitMaskImage: `url(${entry.icon})` }} />}
        <span><strong>{titleOf(tool)}</strong><small>{match ? `${t('catalog.foundVia')} ${match.matched}` : t(`category.${tool.category}`)}</small></span>
      </button>
      <button className="tool-menu-favorite button-reset" onClick={() => toggleFavorite(tool.id)} aria-label={t(favorite ? 'toolMenu.removeFavorite' : 'toolMenu.addFavorite')} aria-pressed={favorite}>{favorite ? '★' : '☆'}</button>
    </div>
  }

  const content = trimmed.length >= MIN_QUERY_LENGTH && !searchReady
    ? <div className="tool-menu-empty" role="status"><p>{t('toolMenu.search')} …</p></div>
    : trimmed.length >= MIN_QUERY_LENGTH || sort !== 'category'
    ? visible.length ? <div className="tool-menu-list">{visible.map(toolRow)}</div> : <div className="tool-menu-empty"><p>{t(trimmed ? 'toolMenu.noResults' : sort === 'favorites' ? 'toolMenu.noFavorites' : 'toolMenu.noRecent')}</p>{trimmed && <button className="text-link" onClick={() => setQuery('')}>{t('catalog.clear')}</button>}</div>
    : <div className="tool-menu-categories">{categoryOrder.map((category) => {
      const tools = visible.filter((tool) => tool.category === category)
      return tools.length ? <details className="tool-menu-group" key={category}>
        <summary><span>{t(`category.${category}`)}</span><span className="tool-menu-group-count">{tools.length}</span></summary>
        <div className="tool-menu-group-tools">{tools.map(toolRow)}</div>
      </details> : null
    })}</div>

  return <>
    <button ref={triggerRef} className="button tool-menu-trigger" onClick={openMenu} aria-label={t('toolMenu.open')} aria-expanded={open} aria-controls="tool-navigation"><span aria-hidden="true">☰</span></button>
    <div className={`tool-menu-layer${open ? ' open' : ''}`} aria-hidden={!open}>
      <button className="tool-menu-scrim" aria-label={t('toolMenu.close')} onClick={closeMenu} tabIndex={open ? 0 : -1} />
      <aside ref={drawerRef} id="tool-navigation" className="tool-menu-drawer" aria-label={t('toolMenu.title')}>
        <header className="tool-menu-heading"><div><h2>{t('toolMenu.title')}</h2><p>{t('toolMenu.intro')}</p></div><button className="button tool-menu-close" onClick={closeMenu} aria-label={t('toolMenu.close')}>×</button></header>
        <label className="tool-menu-search"><span aria-hidden="true">⌕</span><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('toolMenu.search')} aria-label={t('toolMenu.search')} /></label>
        <div className="tool-menu-sorts" role="group" aria-label={t('toolMenu.sort')}>
          {(['category', 'az', 'recent', 'favorites'] as const).map((item) => <button key={item} className={`button${sort === item ? ' active' : ''}`} aria-pressed={sort === item} onClick={() => selectSort(item)}>{t(`toolMenu.sort.${item}`)}</button>)}
        </div>
        <div className="tool-menu-content" aria-live="polite">{content}</div>
        <footer className="tool-menu-footer"><span>{visible.length} {t('toolMenu.tools')}</span><span>{t('toolMenu.local')}</span></footer>
      </aside>
    </div>
  </>
}
