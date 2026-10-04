import type { ToolManifest } from '@commietools/core'
import { searchEntryById } from '@commietools/tools'
import { LocalBadge } from '@commietools/ui'

export type Translate = (key: string) => string

/** One tool in the catalogue: symbol, short summary, labels, optional match note. */
export function ToolCard({ tool, t, navigate, locale, match }: { tool: ToolManifest; t: Translate; navigate: (path: string) => void; locale: string; match?: { label: string; text: string } }) {
  const entry = searchEntryById.get(tool.id)
  const tags = t(tool.termsKey).split(',').map((term) => term.trim()).filter((term) => term.startsWith('#'))
  return (
    <article className="catalog-card">
      {entry && <span className="card-icon" aria-hidden="true" style={{ maskImage: `url(${entry.icon})`, WebkitMaskImage: `url(${entry.icon})` }} />}
      <p className="category">{t(`category.${tool.category}`)}</p>
      <h3>{t(tool.titleKey)}</h3>
      <p>{t(tool.summaryKey)}</p>
      {tags.length > 0 && <p className="tag-list">{tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</p>}
      {match && <p className="match-note">{match.label} <strong>{match.text}</strong></p>}
      <div className="card-footer"><LocalBadge>{t('status.local')}</LocalBadge><button className="text-link" onClick={() => navigate(tool.route)}>{t('catalog.open')} →</button></div>
    </article>
  )
}
