import { imageMetadataMessages } from './image/metadata/locales'
import { imageResizeMessages } from './image/resize/locales'
import { jsonFormatterMessages } from './developer/json-formatter/locales'
import { qrCodeGeneratorMessages } from './generator/qr-code-generator/locales'
import { caseConverterMessages } from './text/case-converter/locales'
import { textStatisticsMessages } from './text/text-statistics/locales'

type MessageCatalog = Readonly<Record<string, string>>
type PartialLocalizedMessages = Readonly<Record<string, MessageCatalog>>

function mergeToolCatalogs(catalogs: readonly PartialLocalizedMessages[]) {
  const merged: Record<string, Record<string, string>> = {}
  for (const catalog of catalogs) {
    for (const [locale, messages] of Object.entries(catalog)) {
      merged[locale] = { ...merged[locale], ...messages }
    }
  }
  return merged
}

export const toolMessages = mergeToolCatalogs([
  textStatisticsMessages,
  caseConverterMessages,
  jsonFormatterMessages,
  qrCodeGeneratorMessages,
  imageMetadataMessages,
  imageResizeMessages
])
