/**
 * Texte des Standardrechners. Der Rahmen (Ausdruck, Ergebnis, Verlauf, Variablen, Fehler,
 * Tastenfeld-Griffe) liegt gemeinsam in `calculator/shell/locales` — hier steht nur, was diese
 * Rechenart ausmacht (Entscheidung 2026-10-04: ein Werkzeug je Rechenart).
 */
export const calculatorDe = {
  'tool.calculator.title': 'Rechner',
  'tool.calculator.description': 'Taschenrechner für die Grundrechenarten: Plus, Minus, Mal, Geteilt, Prozent, Klammern und Vorzeichen. Rechnet exakt mit Brüchen oder Dezimalzahlen, vollständig im Browser.',
  'tool.calculator.summary': 'Grundrechenarten, Prozent und Klammern – exakt gerechnet.',
  'tool.calculator.terms': 'Rechner,Taschenrechner,Rechnen,Grundrechenarten,Addition,Subtraktion,Multiplikation,Division,Prozent,Prozentrechnung,Klammern,Vorzeichen,Dezimal,Dezimalzahl,Komma,Genauigkeit,exakt,Bruch,Brüche,Brueche,Bruchrechnung,Ergebnis,Verlauf,#rechnen,#mathematik',
  'tool.calculator.rules': 'Standardrechner: Punktrechnung bindet stärker als Strichrechnung, Klammern zuerst. Prozent rechnet mit dem Faktor 1/100, also ergibt 200 * 15% den Wert 30. Gerechnet wird exakt als Bruch oder mit 64 Dezimalstellen; angezeigt werden 14.'
} as const
