export const rpnEn = {
  'tool.rpnCalculator.title': 'RPN calculator',
  'tool.rpnCalculator.description': 'Calculator in reverse Polish notation: values are written separated by spaces, operators take the two topmost values. With a stack view, the working after every step and the SWAP and DROP handles. All computation stays in the browser.',
  'tool.rpnCalculator.summary': 'Reverse Polish notation with stack and working steps.',
  'tool.rpnCalculator.terms': 'RPN,reverse polish notation,polish notation,postfix,postfix notation,stack,stack calculator,stack display,SWAP,DROP,working steps,calculator without brackets,#calculate,#rpn',
  'tool.rpnCalculator.rpnTokens': 'RPN input (separated by spaces)',
  'tool.rpnCalculator.rpnPlaceholder': 'e.g. 3 4 + 5 *',
  'tool.rpnCalculator.rpnKeys': 'Stack keys',
  'tool.rpnCalculator.rpnStack': 'Stack',
  'tool.rpnCalculator.rpnStackEmpty': 'The stack is empty.',
  'tool.rpnCalculator.rpnSteps': 'Working',
  'tool.rpnCalculator.key.swap': 'Swap the last two values',
  'tool.rpnCalculator.key.drop': 'Drop the last value',
  'tool.rpnCalculator.rules': 'RPN: the input is read from left to right. Numbers go on the stack, operators take the two topmost values, unary keys the topmost one. The working shows the stack after every step. Exactly one value must be left at the end.'
} as const
