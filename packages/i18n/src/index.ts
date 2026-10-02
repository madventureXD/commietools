import { commonDe } from './common/de'
import { commonEn } from './common/en'
import { suitesDe } from './suites/de'
import { suitesEn } from './suites/en'

export type Locale = 'de' | 'en'
export type MessageCatalog = Readonly<Record<string, string>>
export type LocalizedMessages = Readonly<Record<Locale, MessageCatalog>>

export const platformMessages: LocalizedMessages = {
  de: { ...commonDe, ...suitesDe },
  en: { ...commonEn, ...suitesEn }
}

export function createTranslator(locale: Locale, extensions: readonly LocalizedMessages[] = []) {
  const fallback = Object.assign({}, platformMessages.en, ...extensions.map((catalog) => catalog.en))
  const selected = locale === 'en' ? fallback : Object.assign({}, fallback, platformMessages[locale], ...extensions.map((catalog) => catalog[locale]))
  return (key: string): string => selected[key] ?? key
}
