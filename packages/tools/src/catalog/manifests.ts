import type { SuiteManifest, ToolManifest } from '@commietools/core'

/**
 * Tool and suite manifests. Kept free of runtime imports so the catalogue
 * generator can read this file directly; translated text lives in the locale
 * catalogues and is referenced by key only.
 */
export const toolManifests: readonly ToolManifest[] = [
  {
    id: 'text-statistics',
    route: '/tools/text-statistics',
    category: 'text',
    titleKey: 'tool.textStats.title',
    descriptionKey: 'tool.textStats.description',
    summaryKey: 'tool.textStats.summary',
    termsKey: 'tool.textStats.terms',
    executionMode: 'local',
    resourceClass: 'universal',
    worksOffline: true
  },
  {
    id: 'case-converter', route: '/tools/case-converter', category: 'text',
    titleKey: 'tool.caseConverter.title', descriptionKey: 'tool.caseConverter.description',
    summaryKey: 'tool.caseConverter.summary', termsKey: 'tool.caseConverter.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'json-formatter', route: '/tools/json-formatter', category: 'developer',
    titleKey: 'tool.jsonFormatter.title', descriptionKey: 'tool.jsonFormatter.description',
    summaryKey: 'tool.jsonFormatter.summary', termsKey: 'tool.jsonFormatter.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true
  },
  {
    id: 'qr-code-generator', route: '/tools/qr-code-generator', category: 'generator',
    titleKey: 'tool.qr.title', descriptionKey: 'tool.qr.description',
    summaryKey: 'tool.qr.summary', termsKey: 'tool.qr.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true,
    files: {
      auxiliary: [{ role: 'logo', mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] }],
      output: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
    }
  },
  {
    id: 'image-metadata', route: '/tools/image-metadata', category: 'image',
    titleKey: 'tool.imageMetadata.title', descriptionKey: 'tool.imageMetadata.description',
    summaryKey: 'tool.imageMetadata.summary', termsKey: 'tool.imageMetadata.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true,
    // Reads all eight types but only the first three can be cleaned losslessly.
    files: {
      input: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif', 'image/heic'],
      output: ['image/jpeg', 'image/png', 'image/webp']
    }
  },
  {
    id: 'image-resize', route: '/tools/image-resize', category: 'image',
    titleKey: 'tool.imageResize.title', descriptionKey: 'tool.imageResize.description',
    summaryKey: 'tool.imageResize.summary', termsKey: 'tool.imageResize.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: {
      input: ['image/jpeg', 'image/png', 'image/webp'],
      output: ['image/jpeg', 'image/png', 'image/webp']
    }
  },
  {
    id: 'icon-generator', route: '/tools/icon-generator', category: 'image',
    titleKey: 'tool.iconGenerator.title', descriptionKey: 'tool.iconGenerator.description',
    summaryKey: 'tool.iconGenerator.summary', termsKey: 'tool.iconGenerator.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: {
      input: ['image/png', 'image/jpeg', 'image/webp'],
      output: ['image/png', 'image/x-icon']
    }
  },
  {
    id: 'image-watermark', route: '/tools/image-watermark', category: 'image',
    titleKey: 'tool.watermark.title', descriptionKey: 'tool.watermark.description',
    summaryKey: 'tool.watermark.summary', termsKey: 'tool.watermark.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: {
      input: ['image/jpeg', 'image/png', 'image/webp'],
      auxiliary: [{ role: 'logo', mimeTypes: ['image/png', 'image/jpeg', 'image/webp'] }],
      output: ['image/jpeg', 'image/png', 'image/webp']
    }
  },
  {
    id: 'color-tools', route: '/tools/color-tools', category: 'image',
    titleKey: 'tool.colorTools.title', descriptionKey: 'tool.colorTools.description',
    summaryKey: 'tool.colorTools.summary', termsKey: 'tool.colorTools.terms',
    executionMode: 'local', resourceClass: 'universal', worksOffline: true,
    // Reads an image for the eyedropper and the palette, but produces no file.
    files: { input: ['image/jpeg', 'image/png', 'image/webp'] }
  },
  {
    id: 'pdf-merge', route: '/tools/pdf-merge', category: 'pdf',
    titleKey: 'tool.pdfMerge.title', descriptionKey: 'tool.pdfMerge.description',
    summaryKey: 'tool.pdfMerge.summary', termsKey: 'tool.pdfMerge.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-split', route: '/tools/pdf-split', category: 'pdf',
    titleKey: 'tool.pdfSplit.title', descriptionKey: 'tool.pdfSplit.description',
    summaryKey: 'tool.pdfSplit.summary', termsKey: 'tool.pdfSplit.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-organize', route: '/tools/pdf-organize', category: 'pdf',
    titleKey: 'tool.pdfOrganize.title', descriptionKey: 'tool.pdfOrganize.description',
    summaryKey: 'tool.pdfOrganize.summary', termsKey: 'tool.pdfOrganize.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'images-to-pdf', route: '/tools/images-to-pdf', category: 'pdf',
    titleKey: 'tool.imagesToPdf.title', descriptionKey: 'tool.imagesToPdf.description',
    summaryKey: 'tool.imagesToPdf.summary', termsKey: 'tool.imagesToPdf.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { input: ['image/jpeg', 'image/png'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-to-images', route: '/tools/pdf-to-images', category: 'pdf',
    titleKey: 'tool.pdfToImages.title', descriptionKey: 'tool.pdfToImages.description',
    summaryKey: 'tool.pdfToImages.summary', termsKey: 'tool.pdfToImages.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'], output: ['image/png', 'image/jpeg'] }
  },
  {
    id: 'pdf-watermark', route: '/tools/pdf-watermark', category: 'pdf',
    titleKey: 'tool.pdfWatermark.title', descriptionKey: 'tool.pdfWatermark.description',
    summaryKey: 'tool.pdfWatermark.summary', termsKey: 'tool.pdfWatermark.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-page-numbers', route: '/tools/pdf-page-numbers', category: 'pdf',
    titleKey: 'tool.pdfPageNumbers.title', descriptionKey: 'tool.pdfPageNumbers.description',
    summaryKey: 'tool.pdfPageNumbers.summary', termsKey: 'tool.pdfPageNumbers.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-visible-signature', route: '/tools/pdf-visible-signature', category: 'pdf',
    titleKey: 'tool.pdfSignature.title', descriptionKey: 'tool.pdfSignature.description',
    summaryKey: 'tool.pdfSignature.summary', termsKey: 'tool.pdfSignature.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: {
      input: ['application/pdf'],
      auxiliary: [{ role: 'signature', mimeTypes: ['image/png', 'image/jpeg'] }],
      output: ['application/pdf']
    }
  },
  {
    id: 'pdf-form-fill', route: '/tools/pdf-form-fill', category: 'pdf',
    titleKey: 'tool.pdfForm.title', descriptionKey: 'tool.pdfForm.description',
    summaryKey: 'tool.pdfForm.summary', termsKey: 'tool.pdfForm.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-annotate', route: '/tools/pdf-annotate', category: 'pdf',
    titleKey: 'tool.pdfAnnotate.title', descriptionKey: 'tool.pdfAnnotate.description',
    summaryKey: 'tool.pdfAnnotate.summary', termsKey: 'tool.pdfAnnotate.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-security', route: '/tools/pdf-security', category: 'pdf',
    titleKey: 'tool.pdfSecurity.title', descriptionKey: 'tool.pdfSecurity.description',
    summaryKey: 'tool.pdfSecurity.summary', termsKey: 'tool.pdfSecurity.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-compress', route: '/tools/pdf-compress', category: 'pdf',
    titleKey: 'tool.pdfCompress.title', descriptionKey: 'tool.pdfCompress.description',
    summaryKey: 'tool.pdfCompress.summary', termsKey: 'tool.pdfCompress.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-viewer', route: '/tools/pdf-viewer', category: 'pdf',
    titleKey: 'tool.pdfViewer.title', descriptionKey: 'tool.pdfViewer.description',
    summaryKey: 'tool.pdfViewer.summary', termsKey: 'tool.pdfViewer.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'] }
  },
  {
    id: 'pdf-text-ocr', route: '/tools/pdf-text-ocr', category: 'pdf',
    titleKey: 'tool.pdfTextOcr.title', descriptionKey: 'tool.pdfTextOcr.description',
    summaryKey: 'tool.pdfTextOcr.summary', termsKey: 'tool.pdfTextOcr.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'], output: ['text/plain'] }
  },
  {
    id: 'pdf-certificate-sign', route: '/tools/pdf-certificate-sign', category: 'pdf',
    titleKey: 'tool.pdfCertificateSign.title', descriptionKey: 'tool.pdfCertificateSign.description',
    summaryKey: 'tool.pdfCertificateSign.summary', termsKey: 'tool.pdfCertificateSign.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: {
      input: ['application/pdf'],
      auxiliary: [{ role: 'certificate', mimeTypes: ['application/x-pkcs12'] }],
      output: ['application/pdf']
    }
  },
  {
    id: 'pdf-signature-verify', route: '/tools/pdf-signature-verify', category: 'pdf',
    titleKey: 'tool.pdfVerify.title', descriptionKey: 'tool.pdfVerify.description',
    summaryKey: 'tool.pdfVerify.summary', termsKey: 'tool.pdfVerify.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true,
    files: { input: ['application/pdf'] }
  },
  {
    id: 'pdf-metadata', route: '/tools/pdf-metadata', category: 'pdf',
    titleKey: 'tool.pdfMetadata.title', descriptionKey: 'tool.pdfMetadata.description', summaryKey: 'tool.pdfMetadata.summary', termsKey: 'tool.pdfMetadata.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true, files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-crop', route: '/tools/pdf-crop', category: 'pdf',
    titleKey: 'tool.pdfCrop.title', descriptionKey: 'tool.pdfCrop.description', summaryKey: 'tool.pdfCrop.summary', termsKey: 'tool.pdfCrop.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true, files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-repair', route: '/tools/pdf-repair', category: 'pdf',
    titleKey: 'tool.pdfRepair.title', descriptionKey: 'tool.pdfRepair.description', summaryKey: 'tool.pdfRepair.summary', termsKey: 'tool.pdfRepair.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true, files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-attachments', route: '/tools/pdf-attachments', category: 'pdf',
    titleKey: 'tool.pdfAttachments.title', descriptionKey: 'tool.pdfAttachments.description', summaryKey: 'tool.pdfAttachments.summary', termsKey: 'tool.pdfAttachments.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true, files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'pdf-compare', route: '/tools/pdf-compare', category: 'pdf',
    titleKey: 'tool.pdfCompare.title', descriptionKey: 'tool.pdfCompare.description', summaryKey: 'tool.pdfCompare.summary', termsKey: 'tool.pdfCompare.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true, files: { input: ['application/pdf'] }
  },
  {
    id: 'pdf-a-preflight', route: '/tools/pdf-a-preflight', category: 'pdf',
    titleKey: 'tool.pdfA.title', descriptionKey: 'tool.pdfA.description', summaryKey: 'tool.pdfA.summary', termsKey: 'tool.pdfA.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true, files: { input: ['application/pdf'] }
  },
  {
    id: 'pdf-redact', route: '/tools/pdf-redact', category: 'pdf',
    titleKey: 'tool.pdfRedact.title', descriptionKey: 'tool.pdfRedact.description', summaryKey: 'tool.pdfRedact.summary', termsKey: 'tool.pdfRedact.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true, files: { input: ['application/pdf'], output: ['application/pdf'] }
  },
  {
    id: 'calculator', route: '/tools/calculator', category: 'calculator',
    titleKey: 'tool.calculator.title', descriptionKey: 'tool.calculator.description',
    summaryKey: 'tool.calculator.summary', termsKey: 'tool.calculator.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true
  },
  {
    id: 'commercial', route: '/tools/commercial', category: 'calculator',
    titleKey: 'tool.commercial.title', descriptionKey: 'tool.commercial.description',
    summaryKey: 'tool.commercial.summary', termsKey: 'tool.commercial.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  },
  {
    id: 'convert', route: '/tools/convert', category: 'calculator',
    titleKey: 'tool.convert.title', descriptionKey: 'tool.convert.description',
    summaryKey: 'tool.convert.summary', termsKey: 'tool.convert.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  },
  {
    id: 'datetime', route: '/tools/datetime', category: 'calculator',
    titleKey: 'tool.datetime.title', descriptionKey: 'tool.datetime.description',
    summaryKey: 'tool.datetime.summary', termsKey: 'tool.datetime.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  },
  {
    id: 'plotter', route: '/tools/plotter', category: 'calculator',
    titleKey: 'tool.plotter.title', descriptionKey: 'tool.plotter.description',
    summaryKey: 'tool.plotter.summary', termsKey: 'tool.plotter.terms',
    executionMode: 'local', resourceClass: 'heavy', worksOffline: true
  },
  {
    id: 'aufmass', route: '/tools/aufmass', category: 'calculator',
    titleKey: 'tool.aufmass.title', descriptionKey: 'tool.aufmass.description',
    summaryKey: 'tool.aufmass.summary', termsKey: 'tool.aufmass.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true,
    files: { output: ['text/csv', 'application/pdf', 'text/plain'] }
  },
  {
    id: 'statistics', route: '/tools/statistics', category: 'calculator',
    titleKey: 'tool.statistics.title', descriptionKey: 'tool.statistics.description',
    summaryKey: 'tool.statistics.summary', termsKey: 'tool.statistics.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  },
  {
    id: 'equations', route: '/tools/equations', category: 'calculator',
    titleKey: 'tool.equations.title', descriptionKey: 'tool.equations.description',
    summaryKey: 'tool.equations.summary', termsKey: 'tool.equations.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  },
  {
    id: 'geometry', route: '/tools/geometry', category: 'calculator',
    titleKey: 'tool.geometry.title', descriptionKey: 'tool.geometry.description',
    summaryKey: 'tool.geometry.summary', termsKey: 'tool.geometry.terms',
    executionMode: 'local', resourceClass: 'standard', worksOffline: true
  }
]

export const suiteManifests: readonly SuiteManifest[] = [
  { id: 'text', route: '/suites/text', titleKey: 'suite.text.title', descriptionKey: 'suite.text.description', toolIds: ['text-statistics', 'case-converter'] },
  { id: 'developer', route: '/suites/developer', titleKey: 'suite.developer.title', descriptionKey: 'suite.developer.description', toolIds: ['json-formatter'] },
  { id: 'generators', route: '/suites/generators', titleKey: 'suite.generators.title', descriptionKey: 'suite.generators.description', toolIds: ['qr-code-generator'] },
  { id: 'image', route: '/suites/image', titleKey: 'suite.image.title', descriptionKey: 'suite.image.description', toolIds: ['image-metadata', 'image-resize', 'icon-generator', 'image-watermark', 'color-tools'] },
  { id: 'pdf', route: '/suites/pdf', titleKey: 'suite.pdf.title', descriptionKey: 'suite.pdf.description', toolIds: ['pdf-viewer', 'pdf-text-ocr', 'pdf-signature-verify', 'pdf-certificate-sign', 'pdf-a-preflight', 'pdf-redact', 'pdf-metadata', 'pdf-crop', 'pdf-repair', 'pdf-attachments', 'pdf-compare', 'pdf-merge', 'pdf-split', 'pdf-organize', 'images-to-pdf', 'pdf-to-images', 'pdf-watermark', 'pdf-page-numbers', 'pdf-visible-signature', 'pdf-form-fill', 'pdf-annotate', 'pdf-security', 'pdf-compress'] },
  { id: 'calculator', route: '/suites/calculator', titleKey: 'suite.calculator.title', descriptionKey: 'suite.calculator.description', toolIds: ['calculator', 'convert', 'commercial', 'datetime', 'plotter', 'statistics', 'equations', 'geometry', 'aufmass'] }
]
