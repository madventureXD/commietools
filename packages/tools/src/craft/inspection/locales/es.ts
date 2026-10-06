export const inspectionEs = {
  'tool.inspection.title': 'Plazos de inspección',
  'tool.inspection.description': 'Gestionar las inspecciones periódicas de escaleras, EPI y medios de control: próxima fecha a partir de la última inspección y el intervalo, días restantes y clasificación en vencido, próximo a vencer y correcto — con exportación como tabla. Calcula y guarda por completo en el navegador.',
  'tool.inspection.summary': 'Próximas fechas de inspección desde la última y el intervalo, con días restantes.',
  'tool.inspection.terms': 'plazo de inspección,inspección periódica,fecha de inspección,escalera,revisión de escaleras,epi,medios de control,equipos,prevención,intervalo,vencido,próximo a vencer,lista de defectos,exportar,csv,#inspeccion,#prevencion',

  'tool.inspection.list': 'Lista de inspección',
  'tool.inspection.add': 'Añadir entrada',
  'tool.inspection.label': 'Elemento',
  'tool.inspection.interval': 'Intervalo (meses)',
  'tool.inspection.lastChecked': 'Última inspección',
  'tool.inspection.note': 'Nota (opcional)',
  'tool.inspection.remove': 'Quitar',
  'tool.inspection.empty': 'Todavía no hay entradas. Introducir nombre, intervalo y última inspección: la lista calcula la próxima fecha.',
  'tool.inspection.count': 'entradas',

  'tool.inspection.nextDue': 'Vence el',
  'tool.inspection.daysLeft': 'Días restantes',
  'tool.inspection.dueToday': 'vence hoy',
  'tool.inspection.daysOverdue': 'días de retraso',
  'tool.inspection.state.overdue': 'Vencido',
  'tool.inspection.state.dueSoon': 'Próximo a vencer',
  'tool.inspection.state.ok': 'Correcto',

  'tool.inspection.settings': 'Umbral de aviso',
  'tool.inspection.warnDays': 'Próximo a vencer desde (días antes)',

  'tool.inspection.export': 'Guardar la lista como tabla',
  'tool.inspection.exportName': 'plazos-de-inspeccion.csv',
  'tool.inspection.exportNote': 'Separado por punto y coma, fecha en el formato del idioma elegido: así los programas de hojas de cálculo alemanes y españoles abren el archivo sin preguntar.',

  'tool.inspection.header.label': 'Elemento',
  'tool.inspection.header.note': 'Nota',
  'tool.inspection.header.interval': 'Intervalo (meses)',
  'tool.inspection.header.lastChecked': 'Última inspección',
  'tool.inspection.header.nextDue': 'Vence el',
  'tool.inspection.header.days': 'Días restantes',

  'tool.inspection.noReminder': 'Sin servidor esta herramienta no puede recordar nada: al abrirla muestra lo que está pendiente y guarda la lista en este navegador. Para recibir avisos, llevar la tabla exportada al calendario.',
  'tool.inspection.assumptions': 'Supuestos: la próxima fecha es la última inspección más el intervalo en meses; los finales de mes se tratan correctamente (31 de enero + 1 mes = 28/29 de febrero). «Vence hoy» cuenta como próximo a vencer, no como vencido. La lista vive en este navegador, no en un servidor: estará ahí al volver a abrir, pero no en otro dispositivo. **Sin intervalos propuestos:** los plazos de inspección se derivan de la evaluación de riesgos del titular y de la normativa de prevención; esta herramienta no los conoce y no los inventa. La clasificación no sustituye ni una inspección ni una instrucción.',
  'tool.inspection.sources': 'Método: aritmética de fechas con Temporal (PlainDate), la misma base que la herramienta «Fecha y hora», para que los límites de mes y año sean correctos. Sin tablas de normas y sin plazos propuestos: la herramienta solo calcula lo que se introduce.',

  'tool.inspection.error.empty': 'Todavía no hay ninguna entrada. Introducir primero nombre, intervalo y última inspección.',
  'tool.inspection.error.label': 'Cada entrada necesita un nombre (80 caracteres como máximo).',
  'tool.inspection.error.interval': 'El intervalo debe ser un número entero entre 1 y 120 meses.',
  'tool.inspection.error.date': 'Falta la fecha de la última inspección o no es utilizable (AAAA-MM-DD).',
  'tool.inspection.error.future': 'La última inspección no puede estar en el futuro.',
  'tool.inspection.error.tooMany': 'La lista está llena (200 entradas como máximo). Quitar primero lo ya hecho.',
  'tool.inspection.error.warn': 'El umbral de aviso debe ser un número entero entre 1 y 365 días.'
} as const
