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
 * `calculatorProbes` und wird in `calculator-core.test.ts` aufgerufen.
 */
import {
  absDependencies,
  addDependencies,
  bignumberDependencies,
  ceilDependencies,
  compileDependencies,
  divideDependencies,
  evaluateDependencies,
  expDependencies,
  fixDependencies,
  floorDependencies,
  formatDependencies,
  fractionDependencies,
  gcdDependencies,
  lcmDependencies,
  logDependencies,
  log10Dependencies,
  maxDependencies,
  minDependencies,
  modDependencies,
  multiplyDependencies,
  numericDependencies,
  parseDependencies,
  piDependencies,
  powDependencies,
  roundDependencies,
  signDependencies,
  sqrtDependencies,
  subtractDependencies,
  sumDependencies,
  typeOfDependencies,
  unaryMinusDependencies
} from 'mathjs'

/** Alle Factories, aus denen die Rechner-Instanz gebaut wird. */
export const calculatorFactories = {
  absDependencies,
  addDependencies,
  bignumberDependencies,
  ceilDependencies,
  compileDependencies,
  divideDependencies,
  evaluateDependencies,
  expDependencies,
  fixDependencies,
  floorDependencies,
  formatDependencies,
  fractionDependencies,
  gcdDependencies,
  lcmDependencies,
  logDependencies,
  log10Dependencies,
  maxDependencies,
  minDependencies,
  modDependencies,
  multiplyDependencies,
  numericDependencies,
  parseDependencies,
  piDependencies,
  powDependencies,
  roundDependencies,
  signDependencies,
  sqrtDependencies,
  subtractDependencies,
  sumDependencies,
  typeOfDependencies,
  unaryMinusDependencies
} as const

/**
 * Prüfausdrücke: je angebotener Funktion und je Operatorrangfolge-Falle einer.
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
