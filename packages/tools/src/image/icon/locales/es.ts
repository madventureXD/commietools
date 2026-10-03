export const iconGeneratorEs = {
  'tool.iconGenerator.title': 'Generador de iconos',
  'tool.iconGenerator.description': 'Convierte una imagen en un conjunto completo de íconos: favicon, íconos de PWA, ícono táctil de Apple y una variante enmascarable, completamente en tu dispositivo.',
  'tool.iconGenerator.summary': 'Crea conjuntos de iconos y favicon a partir de una imagen.',
  'tool.iconGenerator.terms': 'icono,iconos,favicon,favicon.ico,icono de aplicación,icono de sitio web,conjunto de iconos,tamaños de iconos,tamaños,16x16,32x32,180x180,192x192,512x512,pwa,manifiesto de aplicación web,manifest.json,enmascarable,android,pantalla de inicio,icono de Apple Touch,icono táctil,crear favicon,pestaña del navegador,pestaña icono,png,ico,windows,icono de programa,acceso directo al escritorio,#icono,#favicon,#pwa',

  'tool.iconGenerator.source': 'Imagen',
  'tool.iconGenerator.chooseFile': 'Elige el archivo',
  'tool.iconGenerator.selected': 'Archivo seleccionado',
  'tool.iconGenerator.originalSize': 'Original',
  'tool.iconGenerator.preview': 'Avance',
  'tool.iconGenerator.privacy': 'La imagen permanece en su dispositivo.',
  'tool.iconGenerator.error': 'La imagen no se pudo procesar.',

  'tool.iconGenerator.sizes': 'Tallas',
  'tool.iconGenerator.sizesHint': 'Cada tamaño seleccionado se escribe como PNG. Los tamaños pequeños parecen suaves en un navegador porque están muy reducidos.',

  'tool.iconGenerator.fit': 'Adecuado',
  'tool.iconGenerator.fit.cover': 'rellenar y recortar',
  'tool.iconGenerator.fit.contain': 'ajuste y almohadilla',
  'tool.iconGenerator.fitHint': 'El relleno cubre todo el cuadrado y recorta los bordes. El ajuste mantiene la imagen completa y rellena los bordes con el color de fondo.',

  'tool.iconGenerator.background': 'Color de fondo',
  'tool.iconGenerator.backgroundHint': 'Se utiliza para bordes acolchados y siempre para la variante enmascarable. Los íconos enmascarables deben ser opacos, porque el sistema operativo los recorta en cualquier forma.',
  'tool.iconGenerator.transparent': 'Transparente',
  'tool.iconGenerator.transparentHint': 'Sin color de fondo, los bordes permanecen transparentes. Esto no se aplica a la variante enmascarable.',

  'tool.iconGenerator.maskable': 'También crea una variante enmascarable.',
  'tool.iconGenerator.maskableHint': 'Los iconos enmascarables colocan la obra de arte en un círculo del 80 % del borde más corto. El sistema operativo puede recortar todo lo que esté fuera.',
  'tool.iconGenerator.maskableChip': 'enmascarable',

  'tool.iconGenerator.ico': 'Crear favicon.ico',
  'tool.iconGenerator.icoHint': 'El archivo de Windows sólo acepta tamaños de hasta 256 píxeles. Los tamaños más grandes se mantienen como PNG.',
  'tool.iconGenerator.icoOversize': 'Los tamaños superiores a 256 píxeles no caben en favicon.ico y están escritos únicamente como PNG.',

  'tool.iconGenerator.action': 'Crear iconos',
  'tool.iconGenerator.processing': 'Laboral …',
  'tool.iconGenerator.result': 'Resultado',
  'tool.iconGenerator.resultHint': 'Los archivos se guardan uno por uno; todos pertenecen a la misma carpeta.',
  'tool.iconGenerator.download': 'Ahorrar',

  'tool.iconGenerator.manifest': 'Entrada manifiesta',
  'tool.iconGenerator.manifestHint': 'Para el manifest.json de su aplicación web. Guarde los PNG guardados junto al archivo de manifiesto.',
  'tool.iconGenerator.copy': 'Copiar',
  'tool.iconGenerator.copied': 'copiado'
} as const

