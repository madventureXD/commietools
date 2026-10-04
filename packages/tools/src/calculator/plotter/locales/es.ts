export const plotterEs = {
  'tool.plotter.title': 'Representador de funciones',
  'tool.plotter.description': 'Representa varias funciones a la vez, con tabla de valores y raíces calculadas. El dibujo usa un trazador propio. Todo el cálculo ocurre en el navegador.',
  'tool.plotter.summary': 'Curvas, tabla de valores y raíces.',
  'tool.plotter.terms': 'representador de funciones,graficador,funcion,curva,grafica,diagrama,dibujar,raiz,cero,tabla de valores,parabola,seno,pendiente,interseccion,matematicas,escuela,formacion,#calcular,#matematicas',

  'tool.plotter.field.curves': 'Funciones (una por línea, variable x)',
  'tool.plotter.field.xMin': 'x desde',
  'tool.plotter.field.xMax': 'x hasta',
  'tool.plotter.field.yMin': 'y desde (opcional)',
  'tool.plotter.field.yMax': 'y hasta (opcional)',
  'tool.plotter.field.samples': 'Puntos de la tabla',
  'tool.plotter.out.plot': 'Gráfica',
  'tool.plotter.out.roots': 'Raíces',
  'tool.plotter.out.table': 'Tabla de valores',
  'tool.plotter.out.noRoots': 'No se encontró ninguna raíz en el intervalo.',
  'tool.plotter.out.curve': 'Curva',
  'tool.plotter.out.x': 'x',
  'tool.plotter.out.notDefined': 'no definido',

  'tool.plotter.note.engine': 'El dibujo usa un trazador propio: obtiene los puntos de las curvas del mismo núcleo que calcula la tabla de valores. No se carga ninguna biblioteca de dibujo.',
  'tool.plotter.note.table': 'La tabla de valores y las raíces las calcula el núcleo de la calculadora, no el trazador. Así solo hay un camino de cálculo para una expresión.',
  'tool.plotter.note.roots': 'Las raíces se buscan por cambios de signo y se acotan. Una asíntota como en 1/x no es una raíz y nunca se informa como tal.',

  'tool.plotter.formulas': 'El dibujo usa puntos de muestra en el intervalo de x indicado. La tabla de valores sustituye la cantidad pedida de valores de x en cada función. Raíces: se compara el signo del valor de la función entre puntos vecinos; si cambia, la posición se acota por bisección repetida hasta unos 1e-15 y se comprueba el valor allí.',
  'tool.plotter.assumptions': 'Supuestos: la variable se llama x. Los intervalos deben cumplir x desde < x hasta. Los límites de y son opcionales; sin ellos el motor escala solo. La tabla y las raíces calculan en el modelo decimal del núcleo (64 cifras). Los puntos no definidos (como una división entre cero) se marcan como tales, nunca como 0.',
  'tool.plotter.sources': 'Dibujo: trazador propio (geometría SVG), sin biblioteca de dibujo. Cálculo: núcleo propio (mathjs, Apache-2.0, ADR 0005). Búsqueda de raíces: bisección propia con comprobación de asíntotas. Estado 2026-10-03.'
} as const
