import { commonDe } from './common/de'
import { commonEn } from './common/en'
import { suitesDe } from './suites/de'
import { suitesEn } from './suites/en'

export interface LocaleDefinition {
  label: string
  direction: 'ltr' | 'rtl'
  fallback: string
  messages: Readonly<Record<string, string>>
}

export const defaultLocale = 'en'

export const localeRegistry = {
  de: {
    label: 'Deutsch',
    direction: 'ltr',
    fallback: 'en',
    messages: { ...commonDe, ...suitesDe }
  },
  en: {
    label: 'English',
    direction: 'ltr',
    fallback: 'en',
    messages: { ...commonEn, ...suitesEn }
  }
} as const satisfies Record<string, LocaleDefinition>

export type Locale = keyof typeof localeRegistry

export const supportedLocales = Object.keys(localeRegistry) as Locale[]

export function isLocale(value: string): value is Locale {
  return value in localeRegistry
}

export function detectLocale(preferences: readonly string[]): Locale {
  for (const preference of preferences) {
    const normalized = preference.toLowerCase()
    if (isLocale(normalized)) return normalized
    const base = normalized.split('-')[0]
    if (base && isLocale(base)) return base
  }
  return defaultLocale
}
