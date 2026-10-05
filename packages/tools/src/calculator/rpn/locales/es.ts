export const rpnEs = {
  'tool.rpnCalculator.title': 'Calculadora RPN',
  'tool.rpnCalculator.description': 'Calculadora en notación polaca inversa: los valores se escriben separados por espacios y los operadores toman los dos valores superiores. Con vista de la pila, desarrollo tras cada paso y los mandos SWAP y DROP. Todo el cálculo ocurre en el navegador.',
  'tool.rpnCalculator.summary': 'Notación polaca inversa con pila y desarrollo.',
  'tool.rpnCalculator.terms': 'RPN,notacion polaca inversa,notacion polaca,postfija,notacion postfija,pila,calculadora de pila,vista de pila,SWAP,DROP,desarrollo,calculadora sin parentesis,#calcular,#rpn',
  'tool.rpnCalculator.rpnTokens': 'Entrada RPN (separada por espacios)',
  'tool.rpnCalculator.rpnPlaceholder': 'p. ej. 3 4 + 5 *',
  'tool.rpnCalculator.rpnKeys': 'Teclas de pila',
  'tool.rpnCalculator.rpnStack': 'Pila',
  'tool.rpnCalculator.rpnStackEmpty': 'La pila está vacía.',
  'tool.rpnCalculator.rpnSteps': 'Desarrollo',
  'tool.rpnCalculator.key.swap': 'Intercambiar los dos últimos valores',
  'tool.rpnCalculator.key.drop': 'Descartar el último valor',
  'tool.rpnCalculator.rules': 'RPN: la entrada se lee de izquierda a derecha. Los números van a la pila, los operadores toman los dos valores superiores y las teclas unarias el superior. El desarrollo muestra la pila después de cada paso. Al final debe quedar exactamente un valor.'
} as const
