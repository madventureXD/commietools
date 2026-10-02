import { defaultLocale, isLocale, localeRegistry, type Locale } from './registry'

export { defaultLocale, detectLocale, isLocale, localeRegistry, supportedLocales, type Locale, type LocaleDefinition } from './registry'

export type MessageCatalog = Readonly<Record<string, string>>
export type LocalizedMessages = Readonly<Partial<Record<string, MessageCatalog>>>

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
      localeRegistry[current].messages,
      ...extensions.map((catalog) => catalog[current] ?? {})
    ])
  ) as Record<string, string>

  return (key: string): string => selected[key] ?? key
}
