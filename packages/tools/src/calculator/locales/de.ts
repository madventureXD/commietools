export const calculatorDe = {
  'tool.calculator.title': 'Rechner',
  'tool.calculator.description': 'Exakter Taschenrechner mit Brüchen und Dezimalzahlen, Verlauf und benannten Variablen. Rechnet vollständig im Browser.',
  'tool.calculator.summary': 'Rechnet exakt mit Brüchen und Dezimalzahlen.',
  'tool.calculator.terms': 'Rechner,Taschenrechner,Rechnen,Bruch,Brüche,Bruchrechnung,Dezimal,Dezimalzahl,Komma,Genauigkeit,exakt,Rundung,Prozent,Quadratwurzel,Wurzel,Potenz,Grundrechenarten,Rechenweg,Verlauf,Taschenrechner online,kopfrechnen,#rechnen,#mathematik',

  'tool.calculator.expression': 'Ausdruck',
  'tool.calculator.placeholder': 'z. B. 2 + 3 * (4 - 1)',
  'tool.calculator.calculate': 'Berechnen',
  'tool.calculator.result': 'Ergebnis',
  'tool.calculator.mode': 'Modus',
  'tool.calculator.modeStandard': 'Standard',
  'tool.calculator.modeFraction': 'Brüche',
  'tool.calculator.numberMode': 'Zahlenmodell',
  'tool.calculator.numberBignumber': 'Dezimal (exakt, 64 Stellen)',
  'tool.calculator.numberFraction': 'Bruch (exakt)',
  'tool.calculator.exactNote': 'Gerechnet wird exakt: 0,1 + 0,2 ergibt 0,3, nicht 0,30000000000000004.',

  'tool.calculator.history': 'Verlauf',
  'tool.calculator.historyEmpty': 'Noch nichts gerechnet.',
  'tool.calculator.clearHistory': 'Verlauf löschen',
  'tool.calculator.reuse': 'Übernehmen',

  'tool.calculator.variables': 'Variablen',
  'tool.calculator.variableName': 'Name',
  'tool.calculator.variableValue': 'Wert',
  'tool.calculator.addVariable': 'Variable setzen',
  'tool.calculator.removeVariable': 'Entfernen',

  'tool.calculator.error.empty': 'Bitte einen Ausdruck eingeben.',
  'tool.calculator.error.syntax': 'Der Ausdruck ist nicht lesbar. Prüfe Klammern und Operatoren.',
  'tool.calculator.error.unknownName': 'Unbekannte Funktion oder unbekannter Name.',
  'tool.calculator.error.zeroDivision': 'Division durch null ist nicht definiert.',
  'tool.calculator.error.outOfRange': 'Das Ergebnis ist nicht darstellbar – etwa bei einer Division durch null oder einem zu großen Wert.',
  'tool.calculator.error.unsupported': 'Dieser Ausdruck wird nicht unterstützt.',

  'tool.calculator.formula': 'Rechenregeln',
  'tool.calculator.formulaText': 'Operatorrangfolge: Klammern, dann Potenz (rechtsassoziativ: 2^3^2 = 512), dann Punkt, dann Strich. Das Vorzeichen bindet schwächer als die Potenz, also ist -2^2 = -4. Eine Zahl vor einer Klammer multipliziert: 2(3+4) = 14.',
  'tool.calculator.formulaNumber': 'Zahlenmodell: Brüche werden als Bruch gerechnet und bleiben exakt. Im Standardmodus rechnet der Rechner mit 64 Stellen Dezimalgenauigkeit; das Ergebnis wird mit 14 Stellen angezeigt.',
  'tool.calculator.sources': 'Grundlage: mathjs (Apache-2.0) aus kuratierten Factories, siehe ADR 0005. Rechenregeln und Beispiele geprüft am 2026-10-03.'
} as const
