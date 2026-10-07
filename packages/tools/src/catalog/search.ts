import type { ToolSearchEntry } from '@commietools/core'
import { knownFormats } from '@commietools/core'

/**
 * Search over the generated tool catalogue.
 *
 * There is no fuzzy matching and no ranking model: the query is compared as a
 * substring against curated text (terms, tags, title, summary, description) and
 * against material derived from the declarations (file types, category, suites).
 * Everything is deterministic and works offline.
 *
 * The caller hands in the entries of the **loaded** languages. By contract that set is the selected
 * language plus English (see `loadToolSearchIndex`, card M1-002): the search never widens it, so a
 * German-only term stays invisible while the Spanish interface is open.
 */

/** Shortest query the catalogue answers; shorter input counts as no query. */
export const MIN_QUERY_LENGTH = 2

/**
 * Folds text for matching: lower case, umlauts and accents resolved, sharp s
 * expanded. "Gross" then finds "Groß" and "vergroessern" finds "vergrößern" -
 * not the other way round; the German term lists carry both spellings.
 */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/gu, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .trim()
}

export type MatchField = 'tag' | 'term' | 'title' | 'summary' | 'description' | 'format' | 'category' | 'suite'

export interface ToolMatch {
  readonly entry: ToolSearchEntry
  /** The word or phrase the hit came from, for an honest "found via" line. */
  readonly matched: string
  readonly field: MatchField
  /** True when only the text of another language matched. */
  readonly foreign: boolean
  /** Lower is better; equal scores keep the catalogue order. */
  readonly score: number
}

/**
 * Ranking from strong to weak: curated tags and terms of the selected language
 * first, then its title and summary, then the long description, then material
 * derived from the declarations. A hit that exists only in another language
 * costs a fixed surcharge, so an exact English term still beats a vague German
 * substring without outranking a German exact hit.
 */
const rank: Record<MatchField, { exact: number; prefix: number; contains: number }> = {
  tag: { exact: 0, prefix: 4, contains: 8 },
  term: { exact: 1, prefix: 5, contains: 9 },
  title: { exact: 2, prefix: 6, contains: 10 },
  summary: { exact: 3, prefix: 7, contains: 11 },
  description: { exact: 12, prefix: 13, contains: 14 },
  format: { exact: 15, prefix: 16, contains: 17 },
  category: { exact: 18, prefix: 19, contains: 20 },
  suite: { exact: 21, prefix: 22, contains: 23 }
}

const FOREIGN_PENALTY = 4

const formatByMime = new Map(knownFormats.map((format) => [format.mime, format]))

/** Every file type a tool declares, as input, auxiliary input or output. */
export function declaredMimeTypes(entry: ToolSearchEntry): readonly string[] {
  return [...new Set([...entry.input, ...entry.output, ...entry.auxiliary.flatMap((extra) => extra.mimeTypes)])]
}

function rankFor(field: MatchField, value: string, query: string): number | null {
  const normalized = normalizeSearchText(value)
  if (!normalized || !normalized.includes(query)) return null
  const table = rank[field]
  if (normalized === query) return table.exact
  if (normalized.startsWith(query)) return table.prefix
  return table.contains
}

/**
 * Keeps a "found via" line readable: a hit inside a long sentence is reported
 * with the single word it came from, not with the whole sentence.
 */
export function matchExcerpt(value: string, query: string): string {
  if (value.length <= 40) return value
  const word = value.split(/\s+/u).find((part) => normalizeSearchText(part).includes(query))
  if (word && word.length <= 40) return word.replace(/[.,;:!?)]+$/u, '')
  return `${value.slice(0, 37).trimEnd()}…`
}

export interface SearchOptions {
  readonly query: string
  /** Language the results are shown in. */
  readonly locale: string
  /** Resolves translation keys, used for category and suite labels. */
  readonly label?: (key: string) => string
}

function bestMatch(entry: ToolSearchEntry, query: string, options: SearchOptions): ToolMatch | null {
  let best: ToolMatch | null = null

  const consider = (field: MatchField, value: string, foreign: boolean) => {
    const score = rankFor(field, value, query)
    if (score === null) return
    const total = foreign ? score + FOREIGN_PENALTY : score
    const reported = field === 'summary' || field === 'description' ? matchExcerpt(value, query) : value
    if (best === null || total < best.score) best = { entry, matched: reported, field, foreign, score: total }
  }

  // Curated text of the **loaded** languages only: the selected one plus English (card M1-002).
  // A German query finds English terms because English is always loaded; a third language is
  // neither loaded nor searched, so a German-only term stays invisible in the Spanish interface.
  for (const language of Object.keys(entry.locales)) {
    const text = entry.locales[language]
    if (!text) continue
    const foreign = language !== options.locale
    for (const tag of text.tags) consider('tag', tag, foreign)
    for (const term of text.terms) consider('term', term, foreign)
    consider('title', text.title, foreign)
    consider('summary', text.summary, foreign)
    consider('description', text.description, foreign)
  }

  // Derived, language-neutral material.
  for (const mime of declaredMimeTypes(entry)) {
    const format = formatByMime.get(mime)
    if (!format) continue
    consider('format', format.name, false)
    for (const extension of format.extensions) {
      consider('format', extension, false)
      consider('format', extension.slice(1), false)
    }
  }

  if (options.label) {
    consider('category', options.label(`category.${entry.category}`), false)
    consider('category', entry.category, false)
    for (const suiteId of entry.suiteIds) {
      consider('suite', options.label(`suite.${suiteId}.title`), false)
      consider('suite', suiteId, false)
    }
  }

  return best
}

export function searchTools(entries: readonly ToolSearchEntry[], options: SearchOptions): readonly ToolMatch[] {
  const query = normalizeSearchText(options.query)
  if (query.length < MIN_QUERY_LENGTH) return []
  const matches: ToolMatch[] = []
  for (const entry of entries) {
    const match = bestMatch(entry, query, options)
    if (match) matches.push(match)
  }
  // Stable ordering: equal scores keep the catalogue order.
  return matches.sort((left, right) => left.score - right.score)
}
