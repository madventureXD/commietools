import { commonEn } from './common/en'
import { suitesEn } from './suites/en'

export interface LocaleDefinition {
  label: string
  direction: 'ltr' | 'rtl'
  fallback: string
  messages?: Readonly<Record<string, string>>
}

export const defaultLocale = 'en'

export const localeRegistry = {
  de: {
    label: 'Deutsch',
    direction: 'ltr',
    fallback: 'en',
    messages: {}
  },
  en: {
    label: 'English',
    direction: 'ltr',
    fallback: 'en',
    messages: { ...commonEn, ...suitesEn }
  },
  es: {
    label: 'Español',
    direction: 'ltr',
    fallback: 'en',
    messages: {}
  }
} as const satisfies Record<string, LocaleDefinition>

export type Locale = keyof typeof localeRegistry

export const supportedLocales = Object.keys(localeRegistry) as Locale[]

/**
 * Ist der Wert eine **registrierte** Sprache?
 *
 * Vorher stand hier `value in localeRegistry`. Der `in`-Operator fragt die **Prototypenkette** mit:
 * `__proto__`, `constructor` oder `toString` sind damit „Sprachen" — ein Wert, der aus dem
 * Speicher oder aus einer Browserpräferenz kommt, erreicht so einen Loader (Karte M4-007).
 * `Object.hasOwn` prüft dagegen nur eigene Schlüssel; die Prüfung auf `string` fängt
 * nichtstringförmigen Speicherinhalt ab, bevor überhaupt nachgeschlagen wird.
 *
 * Die Prüfung steht als `Object.prototype.hasOwnProperty.call(...)` — dieselbe Aussage, aber in der
 * `lib`-Einstellung dieses Projekts verfügbar (`Object.hasOwn` verlangt ES2022).
 *
 * Keine Liste verbotener Namen: Eine Aufzählung wäre unvollständig, das Eigentum am Schlüssel ist
 * die richtige Frage.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(localeRegistry, value)
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
