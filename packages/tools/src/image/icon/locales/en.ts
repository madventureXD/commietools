export const iconGeneratorEn = {
  'tool.iconGenerator.title': 'Icon generator',
  'tool.iconGenerator.description': 'Turns one image into a complete set of icons: favicon, PWA icons, Apple touch icon and a maskable variant – entirely on your device.',
  'tool.iconGenerator.summary': 'Creates favicon and icon sets from one image.',
  'tool.iconGenerator.terms': 'icon,icons,favicon,favicon.ico,app icon,website icon,icon set,icon sizes,sizes,16x16,32x32,180x180,192x192,512x512,pwa,web app manifest,manifest.json,maskable,android,homescreen,home screen,apple touch icon,touch icon,create favicon,browser tab,tab icon,png,ico,windows,program icon,desktop shortcut,#icon,#favicon,#pwa',

  'tool.iconGenerator.source': 'Image',
  'tool.iconGenerator.chooseFile': 'Choose file',
  'tool.iconGenerator.selected': 'Selected file',
  'tool.iconGenerator.originalSize': 'Original',
  'tool.iconGenerator.preview': 'Preview',
  'tool.iconGenerator.privacy': 'The image stays on your device.',
  'tool.iconGenerator.error': 'The image could not be processed.',

  'tool.iconGenerator.sizes': 'Sizes',
  'tool.iconGenerator.sizesHint': 'Every selected size is written as a PNG. Small sizes look soft in a browser, because they are scaled down sharply.',

  'tool.iconGenerator.fit': 'Fitting',
  'tool.iconGenerator.fit.cover': 'fill and crop',
  'tool.iconGenerator.fit.contain': 'fit and pad',
  'tool.iconGenerator.fitHint': 'Filling covers the whole square and crops the edges. Fitting keeps the image complete and pads the edges with the background colour.',

  'tool.iconGenerator.background': 'Background colour',
  'tool.iconGenerator.backgroundHint': 'Used for padded edges and always for the maskable variant. Maskable icons should be opaque, because the operating system crops them into any shape.',
  'tool.iconGenerator.transparent': 'Transparent',
  'tool.iconGenerator.transparentHint': 'Without a background colour the edges stay transparent. This does not apply to the maskable variant.',

  'tool.iconGenerator.maskable': 'Also create a maskable variant',
  'tool.iconGenerator.maskableHint': 'Maskable icons place the artwork in a circle of 80 % of the shorter edge. Anything outside may be cropped by the operating system.',
  'tool.iconGenerator.maskableChip': 'maskable',

  'tool.iconGenerator.ico': 'Create favicon.ico',
  'tool.iconGenerator.icoHint': 'The Windows file only accepts sizes up to 256 pixels. Larger sizes are kept as PNG.',
  'tool.iconGenerator.icoOversize': 'Sizes above 256 pixels do not fit into favicon.ico and are written as PNG only.',

  'tool.iconGenerator.action': 'Create icons',
  'tool.iconGenerator.processing': 'Working …',
  'tool.iconGenerator.result': 'Result',
  'tool.iconGenerator.resultHint': 'The files are saved one by one; they all belong in the same folder.',
  'tool.iconGenerator.download': 'Save',

  'tool.iconGenerator.manifest': 'Manifest entry',
  'tool.iconGenerator.manifestHint': 'For the manifest.json of your web app. Store the saved PNGs next to the manifest file.',
  'tool.iconGenerator.copy': 'Copy',
  'tool.iconGenerator.copied': 'Copied'
} as const
