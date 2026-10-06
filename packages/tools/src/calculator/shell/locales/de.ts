/**
 * Gemeinsame Texte der vier Rechenarten — der **Rahmen**.
 *
 * Er ist für alle vier derselbe (Ausdruck, Ergebnis, Anzeige, Kopieren, Tastenfeld-Griffe,
 * Verlauf, Variablen, Genauigkeitsampel, Fehlerklassen, Rechenregeln). Deshalb steht er **einmal**
 * hier und nicht viermal in den Werkzeugdateien (Entscheidung 2026-10-04). Was nur eine Rechenart
 * braucht — Winkelmodus, Basis, Wortbreite, RPN-Stapel —, steht in ihrer eigenen Datei.
 *
 * `tool.calc.key.second` und `tool.calc.key.representations` liegen hier, weil die Tastendaten
 * (`keypad.ts`) sie gemeinsam tragen.
 */
export const calcShellDe = {
  'tool.calc.expression': 'Ausdruck',
  'tool.calc.placeholder': 'z. B. 2 + 3 * (4 - 1)',
  'tool.calc.calculate': 'Berechnen',
  'tool.calc.result': 'Ergebnis',
  'tool.calc.numberMode': 'Zahlenmodell',
  'tool.calc.numberBignumber': 'Dezimal (14 Stellen angezeigt)',
  'tool.calc.numberFraction': 'Bruch (exakt)',
  'tool.calc.numberShortDecimal': 'DEZ',
  'tool.calc.numberShortFraction': 'BRUCH',
  'tool.calc.exactNote': 'Gerechnet wird exakt: 0,1 + 0,2 ergibt 0,3, nicht 0,30000000000000004.',
  'tool.calc.accuracyLabel': 'Genauigkeit',
  'tool.calc.accuracyStateComplete': 'vollständig',
  'tool.calc.accuracyStateRounded': 'gerundet',
  'tool.calc.accuracyOpen': 'Erklärung zur Genauigkeit',
  'tool.calc.accuracyComplete': 'Der gezeigte Wert ist der vollständige Wert des Rechners.',
  'tool.calc.accuracyRounded': 'Der Rechner hält mehr Stellen, als hier stehen.',
  'tool.calc.accuracyModel': 'Für diese Rechnung wurde automatisch das Dezimal-Modell benutzt.',
  'tool.calc.displayZero': 'Angezeigt wird 0, weil der Wert unter der Anzeigepräzision liegt. Er ist nicht null und bleibt vollständig erhalten.',

  'tool.calc.display': 'Darstellung',
  'tool.calc.display2d': 'Zweidimensional',
  'tool.calc.displayRaw': 'Roher Term',
  'tool.calc.copyExpression': 'Term kopieren',
  'tool.calc.copyResult': 'Ergebnis kopieren',
  'tool.calc.copyDone': 'Kopiert.',
  'tool.calc.copyFailed': 'Kopieren nicht möglich — bitte den Text von Hand markieren.',
  'tool.calc.keypad': 'Tastenfeld',
  'tool.calc.key.clear': 'Alles löschen',
  'tool.calc.key.ans': 'Letztes Ergebnis',
  'tool.calc.key.backspace': 'Letzte Eingabe löschen',
  'tool.calc.key.history': 'Verlauf anzeigen',
  'tool.calc.key.more': 'Weitere Funktionen',
  'tool.calc.key.second': 'Zweite Belegung der Tasten',
  'tool.calc.key.representations': 'Darstellungen der Basen',
  'tool.calc.secondActive': '2nd',
  'tool.calc.moreFunctions': 'Weitere Funktionen',
  'tool.calc.sheet.close': 'Blatt schließen',
  'tool.calc.sheet.inverse': 'Umkehrfunktionen',
  'tool.calc.sheet.hyperbolic': 'Hyperbelfunktionen',
  'tool.calc.sheet.rounding': 'Runden und Betrag',
  'tool.calc.sheet.numberTheory': 'Kombinatorik und Zahlentheorie',
  'tool.calc.sheet.lists': 'Mehrere Werte',
  'tool.calc.sheet.constants': 'Konstanten',

  'tool.calc.history': 'Verlauf',
  'tool.calc.historyEmpty': 'Noch nichts gerechnet.',
  'tool.calc.clearHistory': 'Verlauf löschen',
  'tool.calc.reuse': 'Übernehmen',

  'tool.calc.variables': 'Variablen',
  'tool.calc.variableName': 'Name',
  'tool.calc.variableValue': 'Wert',
  'tool.calc.addVariable': 'Variable setzen',
  'tool.calc.removeVariable': 'Entfernen',

  'tool.calc.error.empty': 'Bitte einen Ausdruck eingeben.',
  'tool.calc.error.syntax': 'Der Ausdruck ist nicht lesbar. Prüfe Klammern und Operatoren.',
  'tool.calc.error.unknownName': 'Unbekannte Funktion oder unbekannter Name.',
  'tool.calc.error.zeroDivision': 'Division durch null ist nicht definiert.',
  'tool.calc.error.outOfRange': 'Das Ergebnis ist nicht darstellbar – etwa bei einer Division durch null oder einem zu großen Wert.',
  'tool.calc.error.unsupported': 'Dieser Ausdruck wird nicht unterstützt.',
  'tool.calc.error.numberModel': 'Diese Rechnung braucht das Dezimal-Modell: Im Bruch-Modell lassen sich Wurzeln und Winkelfunktionen nicht rechnen. Stelle das Zahlenmodell auf „Dezimal" um.',
  'tool.calc.error.stackUnderflow': 'Für diese Operation liegen zu wenige Werte auf dem Stapel.',
  'tool.calc.error.stackLeftover': 'Am Ende muss genau ein Wert auf dem Stapel liegen – hier sind es mehrere.',
  'tool.calc.error.wordRange': 'Für die Wortbreite wird ein ganzer Wert gebraucht; Brüche und Kommazahlen haben dort keinen Platz.',

  'tool.calc.formula': 'Rechenregeln',
  'tool.calc.formulaText': 'Operatorrangfolge: Klammern, dann Potenz (rechtsassoziativ: 2^3^2 = 512), dann Punkt, dann Strich. Das Vorzeichen bindet schwächer als die Potenz, also ist -2^2 = -4. Eine Zahl vor einer Klammer multipliziert: 2(3+4) = 14.',
  'tool.calc.formulaNumber': 'Zahlenmodell: Brüche werden als Bruch gerechnet und bleiben exakt. Im Dezimalmodell rechnet der Rechner mit 64 Stellen Genauigkeit; das Ergebnis wird mit 14 Stellen angezeigt.',
  'tool.calc.sources': 'Grundlage: mathjs (Apache-2.0) aus kuratierten Factories, siehe ADR 0005. Rechenregeln und Beispiele geprüft am 2026-10-03.',
  'tool.calc.retryDecimal': 'Mit Dezimal rechnen'
} as const
