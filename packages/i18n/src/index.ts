import { defaultLocale, isLocale, localeRegistry, type Locale } from './registry'

export { defaultLocale, detectLocale, isLocale, localeRegistry, supportedLocales, type Locale, type LocaleDefinition } from './registry'

export type MessageCatalog = Readonly<Record<string, string>>
export type LocalizedMessages = Readonly<Partial<Record<string, MessageCatalog>>>

const interfaceLoaders = {
  de: async () => ({ ...(await import('./common/de')).commonDe, ...(await import('./suites/de')).suitesDe }),
  en: async () => ({ ...(await import('./common/en')).commonEn, ...(await import('./suites/en')).suitesEn }),
  es: async () => ({ ...(await import('./common/es')).commonEs, ...(await import('./suites/es')).suitesEs })
} as const
const interfaceCache = new Map<string, Promise<LocalizedMessages>>()

export function loadInterfaceMessages(locale: Locale): Promise<LocalizedMessages> {
  const key = locale === 'en' ? 'en' : `${locale}+en`
  const cached = interfaceCache.get(key); if (cached) return cached
  const promise = Promise.all([interfaceLoaders.en(), locale === 'en' ? interfaceLoaders.en() : interfaceLoaders[locale]()]).then(([english, selected]) => locale === 'en' ? { en: english } : { en: english, [locale]: selected })
  interfaceCache.set(key, promise); return promise
}

function resolveFallbackChain(locale: Locale): Locale[] {
  const chain: Locale[] = [locale]
  let current = locale
  while (true) {
    const fallback = localeRegistry[current].fallback
    if (!isLocale(fallback) || chain.includes(fallback)) break
    chain.push(fallback)
    current = fallback
  }
  if (!chain.includes(defaultLocale)) chain.push(defaultLocale)
  return chain.reverse()
}

export function createTranslator(locale: Locale, extensions: readonly LocalizedMessages[] = []) {
  const selected = Object.assign(
    {},
    ...resolveFallbackChain(locale).flatMap((current) => [
      localeRegistry[current].messages ?? {},
      ...extensions.map((catalog) => catalog[current] ?? {})
    ])
  ) as Record<string, string>

  return (key: string): string => selected[key] ?? key
}
