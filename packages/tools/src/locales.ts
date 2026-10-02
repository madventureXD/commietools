import { jsonFormatterDe } from './developer/json-formatter/locales/de'
import { jsonFormatterEn } from './developer/json-formatter/locales/en'
import { caseConverterDe } from './text/case-converter/locales/de'
import { caseConverterEn } from './text/case-converter/locales/en'
import { textStatisticsDe } from './text/text-statistics/locales/de'
import { textStatisticsEn } from './text/text-statistics/locales/en'

export const toolMessages = {
  de: { ...textStatisticsDe, ...caseConverterDe, ...jsonFormatterDe },
  en: { ...textStatisticsEn, ...caseConverterEn, ...jsonFormatterEn }
} as const
