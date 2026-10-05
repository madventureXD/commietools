import type { ToolManifest, ToolSearchEntry } from '@commietools/core'
import { searchEntryById } from '@commietools/tools'
import { LocalBadge } from '@commietools/ui'
import { toolTextsFrom } from './tool-texts'

export type Translate = (key: string) => string

/**
 * Ein Werkzeug in Katalog, Suiten-Liste und Trefferliste: Symbol, Titel, Kurztext, Schlagwörter.
 *
 * **Titel, Kurztext und Schlagwörter kommen aus dem Suchpaket** (`index`), nicht aus dem
 * Textpaket — das wird erst auf einer Werkzeugroute geladen (Entscheidung 2026-10-05). Fehlt der
 * Index noch, greift der Rückfall auf die Sprachschlüssel in `toolTextsFrom`.
 */
export function ToolCard({ tool, t, navigate, locale, match, index }: { tool: ToolManifest; t: Translate; navigate: (path: string) => void; locale: string; match?: { label: string; text: string }; index?: readonly ToolSearchEntry[] }) {
  const entry = searchEntryById.get(tool.id)
  const texts = toolTextsFrom(index ?? [], tool, locale, t)
  return (
    <article className="catalog-card">
      {entry && <span className="card-icon" aria-hidden="true" style={{ maskImage: `url(${entry.icon})`, WebkitMaskImage: `url(${entry.icon})` }} />}
      <p className="category">{t(`category.${tool.category}`)}</p>
      <h3>{texts.title}</h3>
      <p>{texts.summary}</p>
      {texts.tags.length > 0 && <p className="tag-list">{texts.tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</p>}
      {match && <p className="match-note">{match.label} <strong>{match.text}</strong></p>}
      <div className="card-footer"><LocalBadge>{t('status.local')}</LocalBadge><button className="text-link" onClick={() => navigate(tool.route)}>{t('catalog.open')} →</button></div>
    </article>
  )
}