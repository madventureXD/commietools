/**
 * Gemeinsame Rundungsprimitive der Rechner-Suite.
 *
 * Angelegt im Durchzug der QM-Stufe R9 (Karte **M4-009**, „Gemeinsame technische
 * Verantwortlichkeiten sind mehrfach implementiert"). `divRound` stand **wörtlich identisch** in
 * `aufmass.ts` und `commercial.ts`; die Karte verlangt, **gleiche Verträge** zu bündeln und
 * veraltete Kopien zu entfernen — ausdrücklich **nicht** fachlich unterschiedliche Rundungsregeln
 * zu vereinen.
 *
 * Zuständigkeit: reine Fachberechnung gehört nach `packages/tools`; dieses Modul liegt deshalb
 * neben seinen Aufrufern und wird **nicht** über den Paket-Haupteingang reexportiert (die
 * gemeinsame API bleibt klein — wer es braucht, importiert es relativ neben sich).
 */

/**
 * Kaufmännische Rundung (halbe auf), vorzeichenunabhängig.
 *
 * `(2a + b) / 2b` in Ganzzahlen: exakt, ohne Gleitkomma, und rundet einen halben Rest **auf** —
 * unabhängig davon, ob Zähler und Nenner negativ sind.
 */
export function divRound(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error('zeroDivisor')
  const negative = (numerator < 0n) !== (denominator < 0n)
  const a = numerator < 0n ? -numerator : numerator
  const b = denominator < 0n ? -denominator : denominator
  const quotient = (a * 2n + b) / (b * 2n)
  return negative ? -quotient : quotient
}
