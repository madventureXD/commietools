/**
 * Texte des RPN-Rechners. Der Rahmen liegt in `calculator/shell/locales`; die Namen der
 * Stapelgriffe (`SWAP`, `DROP`) stehen hier, weil nur dieses Tastenfeld sie führt.
 */
export const rpnDe = {
  'tool.rpnCalculator.title': 'RPN-Rechner',
  'tool.rpnCalculator.description': 'Rechner in umgekehrter polnischer Notation: Werte werden durch Leerzeichen getrennt geschrieben, Operatoren nehmen die beiden obersten Werte. Mit Stapelanzeige, Rechenweg nach jedem Schritt und den Griffen SWAP und DROP. Rechnet vollständig im Browser.',
  'tool.rpnCalculator.summary': 'Umgekehrte polnische Notation mit Stapel und Rechenweg.',
  'tool.rpnCalculator.terms': 'RPN,Umgekehrte polnische Notation,Polnische Notation,Postfix,Postfixnotation,Stapel,Stapelrechner,Stapelanzeige,SWAP,DROP,Rechenweg,Zwischenschritte,Taschenrechner ohne Klammern,kopfrechnen,#rechnen,#rpn',
  'tool.rpnCalculator.rpnTokens': 'RPN-Eingabe (durch Leerzeichen getrennt)',
  'tool.rpnCalculator.rpnPlaceholder': 'z. B. 3 4 + 5 *',
  'tool.rpnCalculator.rpnKeys': 'Stapeltasten',
  'tool.rpnCalculator.rpnStack': 'Stapel',
  'tool.rpnCalculator.rpnStackEmpty': 'Der Stapel ist leer.',
  'tool.rpnCalculator.rpnSteps': 'Rechenweg',
  'tool.rpnCalculator.key.swap': 'Letzte zwei Werte tauschen',
  'tool.rpnCalculator.key.drop': 'Letzten Wert verwerfen',
  'tool.rpnCalculator.rules': 'RPN: Die Eingabe wird von links nach rechts gelesen. Zahlen landen auf dem Stapel, Operatoren nehmen die beiden obersten Werte, unäre Tasten den obersten. Der Rechenweg zeigt nach jedem Schritt den Stapel. Am Ende muss genau ein Wert übrig bleiben.'
} as const
