export const calculatorEn = {
  'tool.calculator.title': 'Calculator',
  'tool.calculator.description': 'Exact calculator with fractions and decimals, history and named variables. All computation stays in the browser.',
  'tool.calculator.summary': 'Calculates exactly with fractions and decimals.',
  'tool.calculator.terms': 'calculator,taschenrechner,math,calculate,computation,fraction,fractions,decimal,precision,exact,rounding,percentage,square root,power,arithmetic,history,variables,maths,#calculate,#math',

  'tool.calculator.expression': 'Expression',
  'tool.calculator.placeholder': 'e.g. 2 + 3 * (4 - 1)',
  'tool.calculator.calculate': 'Calculate',
  'tool.calculator.result': 'Result',
  'tool.calculator.mode': 'Mode',
  'tool.calculator.modeStandard': 'Standard',
  'tool.calculator.modeFraction': 'Fractions',
  'tool.calculator.numberMode': 'Number model',
  'tool.calculator.numberBignumber': 'Decimal (exact, 64 digits)',
  'tool.calculator.numberFraction': 'Fraction (exact)',
  'tool.calculator.exactNote': 'Computation is exact: 0.1 + 0.2 yields 0.3, not 0.30000000000000004.',

  'tool.calculator.history': 'History',
  'tool.calculator.historyEmpty': 'Nothing calculated yet.',
  'tool.calculator.clearHistory': 'Clear history',
  'tool.calculator.reuse': 'Reuse',

  'tool.calculator.variables': 'Variables',
  'tool.calculator.variableName': 'Name',
  'tool.calculator.variableValue': 'Value',
  'tool.calculator.addVariable': 'Set variable',
  'tool.calculator.removeVariable': 'Remove',

  'tool.calculator.error.empty': 'Please enter an expression.',
  'tool.calculator.error.syntax': 'The expression cannot be read. Check brackets and operators.',
  'tool.calculator.error.unknownName': 'Unknown function or name.',
  'tool.calculator.error.zeroDivision': 'Division by zero is not defined.',
  'tool.calculator.error.outOfRange': 'The result cannot be represented – for example a division by zero or a value that is too large.',
  'tool.calculator.error.unsupported': 'This expression is not supported.',

  'tool.calculator.formula': 'Rules',
  'tool.calculator.formulaText': 'Operator precedence: brackets, then power (right-associative: 2^3^2 = 512), then multiplication, then addition. The sign binds weaker than the power, so -2^2 = -4. A number before a bracket multiplies: 2(3+4) = 14.',
  'tool.calculator.formulaNumber': 'Number model: fractions are computed as fractions and stay exact. In standard mode the calculator works with 64 digits of decimal precision and displays 14.',
  'tool.calculator.sources': 'Built on mathjs (Apache-2.0) using curated factories, see ADR 0005. Rules and examples verified on 2026-10-03.'
} as const
