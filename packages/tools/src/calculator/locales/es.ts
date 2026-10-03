export const calculatorEs = {
  'tool.calculator.title': 'Calculadora',
  'tool.calculator.description': 'Calculadora exacta con fracciones y decimales, historial y variables con nombre. Todo el cálculo ocurre en el navegador.',
  'tool.calculator.summary': 'Calcula con exactitud usando fracciones y decimales.',
  'tool.calculator.terms': 'calculadora,calcular,matematicas,fraccion,fracciones,decimal,decimales,precision,exacto,redondeo,porcentaje,raiz cuadrada,potencia,aritmetica,historial,variables,#calcular,#matematicas',

  'tool.calculator.expression': 'Expresión',
  'tool.calculator.placeholder': 'p. ej. 2 + 3 * (4 - 1)',
  'tool.calculator.calculate': 'Calcular',
  'tool.calculator.result': 'Resultado',
  'tool.calculator.mode': 'Modo',
  'tool.calculator.modeStandard': 'Estándar',
  'tool.calculator.modeFraction': 'Fracciones',
  'tool.calculator.numberMode': 'Modelo numérico',
  'tool.calculator.numberBignumber': 'Decimal (exacto, 64 cifras)',
  'tool.calculator.numberFraction': 'Fracción (exacta)',
  'tool.calculator.exactNote': 'El cálculo es exacto: 0,1 + 0,2 da 0,3 y no 0,30000000000000004.',

  'tool.calculator.history': 'Historial',
  'tool.calculator.historyEmpty': 'Todavía no se ha calculado nada.',
  'tool.calculator.clearHistory': 'Borrar historial',
  'tool.calculator.reuse': 'Reutilizar',

  'tool.calculator.variables': 'Variables',
  'tool.calculator.variableName': 'Nombre',
  'tool.calculator.variableValue': 'Valor',
  'tool.calculator.addVariable': 'Definir variable',
  'tool.calculator.removeVariable': 'Quitar',

  'tool.calculator.error.empty': 'Introduce una expresión.',
  'tool.calculator.error.syntax': 'La expresión no se puede leer. Revisa los paréntesis y los operadores.',
  'tool.calculator.error.unknownName': 'Función o nombre desconocido.',
  'tool.calculator.error.zeroDivision': 'La división entre cero no está definida.',
  'tool.calculator.error.outOfRange': 'El resultado no se puede representar: por ejemplo una división entre cero o un valor demasiado grande.',
  'tool.calculator.error.unsupported': 'Esta expresión no es compatible.',

  'tool.calculator.formula': 'Reglas',
  'tool.calculator.formulaText': 'Prioridad de operadores: paréntesis, luego potencia (asociativa por la derecha: 2^3^2 = 512), luego multiplicación, luego suma. El signo tiene menos prioridad que la potencia, así que -2^2 = -4. Un número delante de un paréntesis multiplica: 2(3+4) = 14.',
  'tool.calculator.formulaNumber': 'Modelo numérico: las fracciones se calculan como fracciones y siguen siendo exactas. En el modo estándar la calculadora trabaja con 64 cifras decimales y muestra 14.',
  'tool.calculator.sources': 'Basado en mathjs (Apache-2.0) con fábricas seleccionadas, véase ADR 0005. Reglas y ejemplos verificados el 2026-10-03.'
} as const
