/**
 * Kuratierte mathjs-Factories für die Suite „Rechnen" (ADR 0005).
 *
 * Vollständig gebündelt kostet mathjs 185,3 KiB gzip; mit genau diesen Factories sind es
 * 89,5 KiB (gemessen, esbuild --bundle --minify, gzip -9). `helpDependencies` fehlt bewusst:
 * die eingebettete Hilfe-Doku sind 22,5 KiB englischer Anzeigetexte und verstößt gegen die
 * Projektregel, keine nutzerseitigen Texte im Code zu führen.
 *
 * **Fällt eine Factory hier heraus, bricht die zugehörige Funktion erst zur Laufzeit** —
 * nicht beim Bau. Deshalb gehört jede im Rechner angebotene Funktion in
 * `calculatorFunctions` und wird in `calculator-core.test.ts` aufgerufen.
 *
 * Achtung beim Zahlenmodell `BigNumber`: mathjs nimmt rohe JS-Zahlen mit mehr als 15
 * signifikanten Stellen **nicht** implizit an. Eigene Wrapper müssen deshalb durchgehend mit
 * mathjs-Werten rechnen (etwa über `unit(...)`), nicht mit `Math.PI / 180`.
 */
import {
  absDependencies,
  acosDependencies,
  acoshDependencies,
  addDependencies,
  asinDependencies,
  asinhDependencies,
  atan2Dependencies,
  atanDependencies,
  atanhDependencies,
  bignumberDependencies,
  bitAndDependencies,
  bitNotDependencies,
  bitOrDependencies,
  bitXorDependencies,
  ceilDependencies,
  combinationsDependencies,
  compileDependencies,
  cosDependencies,
  coshDependencies,
  divideDependencies,
  eDependencies,
  evaluateDependencies,
  expDependencies,
  factorialDependencies,
  fixDependencies,
  floorDependencies,
  formatDependencies,
  fractionDependencies,
  gcdDependencies,
  lcmDependencies,
  leftShiftDependencies,
  logDependencies,
  log10Dependencies,
  log2Dependencies,
  maxDependencies,
  minDependencies,
  modDependencies,
  multiplyDependencies,
  numericDependencies,
  parseDependencies,
  permutationsDependencies,
  piDependencies,
  powDependencies,
  rightArithShiftDependencies,
  rightLogShiftDependencies,
  roundDependencies,
  signDependencies,
  sinDependencies,
  sinhDependencies,
  sqrtDependencies,
  subtractDependencies,
  sumDependencies,
  tanDependencies,
  tanhDependencies,
  typeOfDependencies,
  unaryMinusDependencies,
  unitDependencies
} from 'mathjs'

/** Alle Factories, aus denen die Rechner-Instanz gebaut wird. */
export const calculatorFactories = {
  absDependencies,
  acosDependencies,
  acoshDependencies,
  addDependencies,
  asinDependencies,
  asinhDependencies,
  atan2Dependencies,
  atanDependencies,
  atanhDependencies,
  bignumberDependencies,
  bitAndDependencies,
  bitNotDependencies,
  bitOrDependencies,
  bitXorDependencies,
  ceilDependencies,
  combinationsDependencies,
  compileDependencies,
  cosDependencies,
  coshDependencies,
  divideDependencies,
  eDependencies,
  evaluateDependencies,
  expDependencies,
  factorialDependencies,
  fixDependencies,
  floorDependencies,
  formatDependencies,
  fractionDependencies,
  gcdDependencies,
  lcmDependencies,
  leftShiftDependencies,
  logDependencies,
  log10Dependencies,
  log2Dependencies,
  maxDependencies,
  minDependencies,
  modDependencies,
  multiplyDependencies,
  numericDependencies,
  parseDependencies,
  permutationsDependencies,
  piDependencies,
  powDependencies,
  rightArithShiftDependencies,
  rightLogShiftDependencies,
  roundDependencies,
  signDependencies,
  sinDependencies,
  sinhDependencies,
  sqrtDependencies,
  subtractDependencies,
  sumDependencies,
  tanDependencies,
  tanhDependencies,
  typeOfDependencies,
  unaryMinusDependencies,
  unitDependencies
} as const

/** Modus, in dem eine Funktion angeboten wird. */
export type CalculatorMode = 'scientific' | 'programmer'

/**
 * Vollständige Funktionsliste der Werkzeug-Modi. **Jede hier gelistete Funktion wird im Test
 * aufgerufen** — eine fehlende Factory fällt sonst erst zur Laufzeit auf.
 *
 * `expected` wird nur gesetzt, wo das Ergebnis exakt rund ist. Winkelfunktionen laufen hier im
 * Bogenmaß (Standard); die Grad-Modi prüft `calculatorAngleProbes`.
 */
export const calculatorFunctions: readonly {
  readonly name: string
  readonly expression: string
  readonly expected?: string
  readonly mode: CalculatorMode
}[] = [
  // Wissenschaftlich — Trigonometrie
  { name: 'sin', expression: 'sin(pi/6)', expected: '0.5', mode: 'scientific' },
  { name: 'cos', expression: 'cos(0)', expected: '1', mode: 'scientific' },
  { name: 'tan', expression: 'tan(0)', expected: '0', mode: 'scientific' },
  { name: 'asin', expression: 'asin(0.5)', mode: 'scientific' },
  { name: 'acos', expression: 'acos(1)', expected: '0', mode: 'scientific' },
  { name: 'atan', expression: 'atan(0)', expected: '0', mode: 'scientific' },
  { name: 'atan2', expression: 'atan2(0, 1)', expected: '0', mode: 'scientific' },
  // Wissenschaftlich — Hyperbelfunktionen
  { name: 'sinh', expression: 'sinh(0)', expected: '0', mode: 'scientific' },
  { name: 'cosh', expression: 'cosh(0)', expected: '1', mode: 'scientific' },
  { name: 'tanh', expression: 'tanh(0)', expected: '0', mode: 'scientific' },
  { name: 'asinh', expression: 'asinh(0)', expected: '0', mode: 'scientific' },
  { name: 'acosh', expression: 'acosh(1)', expected: '0', mode: 'scientific' },
  { name: 'atanh', expression: 'atanh(0)', expected: '0', mode: 'scientific' },
  // Wissenschaftlich — Logarithmen, Potenzen, Konstanten
  { name: 'log2', expression: 'log2(1024)', expected: '10', mode: 'scientific' },
  { name: 'log10', expression: 'log10(1000)', expected: '3', mode: 'scientific' },
  { name: 'log', expression: 'log(1)', expected: '0', mode: 'scientific' },
  { name: 'exp', expression: 'exp(0)', expected: '1', mode: 'scientific' },
  { name: 'pow', expression: '2^10', expected: '1024', mode: 'scientific' },
  { name: 'sqrt', expression: 'sqrt(144)', expected: '12', mode: 'scientific' },
  { name: 'pi', expression: 'pi', mode: 'scientific' },
  { name: 'e', expression: 'e', mode: 'scientific' },
  // Wissenschaftlich — Kombinatorik
  { name: 'factorial', expression: 'factorial(5)', expected: '120', mode: 'scientific' },
  { name: 'combinations', expression: 'combinations(49, 6)', expected: '13983816', mode: 'scientific' },
  { name: 'permutations', expression: 'permutations(5, 2)', expected: '20', mode: 'scientific' },
  // Programmierer — Bitoperationen
  { name: 'bitAnd', expression: 'bitAnd(12, 10)', expected: '8', mode: 'programmer' },
  { name: 'bitOr', expression: 'bitOr(12, 10)', expected: '14', mode: 'programmer' },
  { name: 'bitXor', expression: 'bitXor(12, 10)', expected: '6', mode: 'programmer' },
  { name: 'bitNot', expression: 'bitNot(0)', expected: '-1', mode: 'programmer' },
  { name: 'leftShift', expression: 'leftShift(1, 4)', expected: '16', mode: 'programmer' },
  { name: 'rightArithShift', expression: 'rightArithShift(-8, 1)', expected: '-4', mode: 'programmer' },
  // `rightLogShift` fehlt hier bewusst: mathjs bietet es nur als **vektorielle** Funktion an
  // (erwartet Array oder Matrix) und lehnt Skalare ab. Der logische Rechts-Shift auf einem
  // skalaren Wert läuft im Programmierer-Modus über die Wortbreite (`toWord`).
  // Programmierer — Rechnen im Wortbereich
  { name: 'mod', expression: '10 mod 3', expected: '1', mode: 'programmer' },
  { name: 'abs', expression: 'abs(-7)', expected: '7', mode: 'programmer' },
  { name: 'sign', expression: 'sign(-5)', expected: '-1', mode: 'programmer' }
]

/** Winkelmodi und ihre Prüfausdrücke — Grad und Gon gegen das Bogenmaß nachgerechnet. */
export const calculatorAngleProbes: readonly {
  readonly angleMode: 'deg' | 'grad'
  readonly expression: string
  readonly expected: string
}[] = [
  { angleMode: 'deg', expression: 'sin(30)', expected: '0.5' },
  { angleMode: 'deg', expression: 'cos(60)', expected: '0.5' },
  { angleMode: 'deg', expression: 'tan(45)', expected: '1' },
  { angleMode: 'deg', expression: 'asin(0.5)', expected: '30' },
  { angleMode: 'deg', expression: 'acos(0.5)', expected: '60' },
  { angleMode: 'deg', expression: 'atan(1)', expected: '45' },
  { angleMode: 'grad', expression: 'sin(100)', expected: '1' },
  { angleMode: 'grad', expression: 'cos(100)', expected: '0' },
  { angleMode: 'grad', expression: 'tan(50)', expected: '1' }
]

/** Wortbreiten des Programmierer-Modus (Zweierkomplement). */
export const calculatorWordSizes: readonly number[] = [8, 16, 32, 64]

/**
 * Prüfausdrücke des Hauptrechners: je angebotener Funktion und je Operatorrangfolge-Falle einer.
 * Erwartung als Zeichenkette, damit der Test keine zweite Rechenregel einführt.
 */
export const calculatorProbes: readonly { readonly expression: string; readonly expected: string }[] = [
  // Grundrechenarten
  { expression: '2+3*(4-1)', expected: '11' },
  { expression: '10-3-2', expected: '5' },
  { expression: '7*6', expected: '42' },
  { expression: '12/4', expected: '3' },
  { expression: '10 mod 3', expected: '1' },
  // Operatorrangfolge — die Fallen, an denen math-expression-evaluator scheitert
  { expression: '2^3^2', expected: '512' },
  { expression: '-2^2', expected: '-4' },
  { expression: '2(3+4)', expected: '14' },
  // Vorzeichen, Betrag, Rundung
  { expression: 'abs(-7)', expected: '7' },
  { expression: 'round(2.5)', expected: '3' },
  { expression: 'floor(2.7)', expected: '2' },
  { expression: 'ceil(2.1)', expected: '3' },
  { expression: 'fix(2.7)', expected: '2' },
  { expression: 'sign(-5)', expected: '-1' },
  // Wurzeln, Potenzen, Logarithmen
  { expression: 'sqrt(81)', expected: '9' },
  { expression: 'exp(0)', expected: '1' },
  { expression: 'log(1)', expected: '0' },
  { expression: 'log10(1000)', expected: '3' },
  { expression: 'max(2, 9, 4)', expected: '9' },
  { expression: 'min(2, 9, 4)', expected: '2' },
  { expression: 'sum(1, 2, 3, 4)', expected: '10' },
  { expression: 'gcd(12, 18)', expected: '6' },
  { expression: 'lcm(4, 6)', expected: '12' },
  { expression: 'pi', expected: '' }
]

/** Factory-Namen, die aus dem Paket importiert werden — für die Prüfung der Abdeckung. */
export const calculatorFactoryNames: readonly string[] = Object.keys(calculatorFactories)
