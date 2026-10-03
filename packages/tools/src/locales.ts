import { imageMetadataMessages } from './image/metadata/locales'
import { imageResizeMessages } from './image/resize/locales'
import { iconGeneratorMessages } from './image/icon/locales'
import { imageWatermarkMessages } from './image/watermark/locales'
import { colorToolsMessages } from './image/color/locales'
import { jsonFormatterMessages } from './developer/json-formatter/locales'
import { qrCodeGeneratorMessages } from './generator/qr-code-generator/locales'
import { caseConverterMessages } from './text/case-converter/locales'
import { textStatisticsMessages } from './text/text-statistics/locales'
import { pdfCommonMessages } from './pdf/common/locales'
import { pdfMergeMessages } from './pdf/merge/locales'
import { pdfSplitMessages } from './pdf/split/locales'
import { pdfOrganizeMessages } from './pdf/organize/locales'
import { imagesToPdfMessages } from './pdf/images-to-pdf/locales'
import { pdfToImagesMessages } from './pdf/pdf-to-images/locales'
import { pdfPlacementMessages } from './pdf/placement/locales'
import { pdfM4Messages } from './pdf/m4/locales'

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
  imageResizeMessages,
  iconGeneratorMessages,
  imageWatermarkMessages,
  colorToolsMessages,
  pdfCommonMessages,
  pdfMergeMessages,
  pdfSplitMessages,
  pdfOrganizeMessages,
  imagesToPdfMessages,
  pdfToImagesMessages,
  pdfPlacementMessages,
  pdfM4Messages
])
