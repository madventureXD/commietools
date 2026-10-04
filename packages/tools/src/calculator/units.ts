/**
 * Umrechnung für das Werkzeug „Umrechnen" (Welle 4 der Suite „Rechnen").
 *
 * **Keine neue Engine:** Gerechnet wird über den vorhandenen Rechenkern (`calculator/core`), der
 * mathjs bereits in einem eigenen, bedarfsgeladenen Chunk führt. Damit gibt es genau **eine**
 * mathjs-Instanz im Projekt und keinen zweiten 100-KiB-Chunk.
 *
 * **Gemessen und deshalb so gebaut:** Der Ausdruck `1 in to mm` funktioniert im kuratierten Kern
 * **nicht** (`unsupported`) — der `to`-Operator braucht mehr, als die kuratierten Factories
 * liefern. Der Weg über die Unit-API (`math.unit(...).to(...)`) geht. Deshalb läuft die
 * Umrechnung nicht über den Parser, sondern direkt über die API.
 *
 * Die Umrechnungsfaktoren werden ebenfalls **gemessen**: Zu jeder Einheit bestimmt mathjs einmal
 * den Wert einer Einheit in der Basiseinheit der Kategorie. Ein falsch abgeschriebener Faktor
 * kann so nicht entstehen. Gerechnet wird in `BigNumber` (64 Stellen), nicht in Gleitkomma.
 *
 * Ausnahme Pferdestärke: `PS` ist die **metrische** Pferdestärke (75 kgf·m/s = 735,49875 W);
 * mathjs kennt nur die mechanische (`hp` = 745,7 W).
 */
import { calculatorFor } from './core'

export interface QuantityResult {
  readonly ok: boolean
  readonly display: string
  readonly error: 'invalid' | 'unknownUnit' | 'unsupported' | 'range' | null
}

export interface UnitCategory {
  readonly id: string
  readonly labelKey: string
  /** Basiseinheit, in der die Faktoren bestimmt werden. */
  readonly base: string
  /** `true` bei Kategorien mit Verschiebung (Temperatur) — dort geht es direkt über die Unit-API. */
  readonly affine?: boolean
  readonly units: readonly string[]
}

/** Kategorien und ihre Einheiten, handwerksnah ausgewählt. */
export const unitCategories: readonly UnitCategory[] = [
  { id: 'length', labelKey: 'tool.convert.category.length', base: 'm', units: ['m', 'cm', 'mm', 'km', 'in', 'ft', 'yd', 'mi'] },
  { id: 'area', labelKey: 'tool.convert.category.area', base: 'm2', units: ['m2', 'cm2', 'mm2', 'hectare', 'sqft', 'sqin', 'acre'] },
  { id: 'volume', labelKey: 'tool.convert.category.volume', base: 'm3', units: ['m3', 'l', 'ml', 'cm3', 'gal', 'floz', 'cuft', 'cuin'] },
  { id: 'mass', labelKey: 'tool.convert.category.mass', base: 'kg', units: ['kg', 'g', 'mg', 't', 'lb', 'oz', 'stone'] },
  { id: 'temperature', labelKey: 'tool.convert.category.temperature', base: 'degC', affine: true, units: ['degC', 'degF', 'K', 'degR'] },
  { id: 'pressure', labelKey: 'tool.convert.category.pressure', base: 'Pa', units: ['Pa', 'kPa', 'bar', 'mbar', 'psi', 'atm', 'torr', 'mmHg'] },
  { id: 'force', labelKey: 'tool.convert.category.force', base: 'N', units: ['N', 'kN', 'dyn', 'lbf', 'kgf'] },
  { id: 'energy', labelKey: 'tool.convert.category.energy', base: 'J', units: ['J', 'kJ', 'Wh', 'kWh', 'eV', 'BTU', 'erg'] },
  { id: 'power', labelKey: 'tool.convert.category.power', base: 'W', units: ['W', 'kW', 'MW', 'hp', 'PS'] },
  { id: 'speed', labelKey: 'tool.convert.category.speed', base: 'm/s', units: ['m/s', 'km/h', 'mph', 'kn'] }
]

/** Winkel: mathjs führt Grad, Bogenmaß und Gon als eigene Einheiten. */
export const angleUnits: readonly string[] = ['deg', 'rad', 'grad', 'arcmin', 'arcsec']

/** Einheiten, die mathjs nicht kennt: Wert einer Einheit in der Basiseinheit der Kategorie. */
const extraFactors: Readonly<Record<string, number>> = {
  // Metrische Pferdestärke: 75 kgf·m/s = 735,49875 W (nicht zu verwechseln mit hp = 745,7 W).
  PS: 735.49875,
  // Meile je Stunde und Knoten fehlen in mathjs 15. Beide sind per Definition exakt:
  // 1 mph = 1609,344 m / 3600 s, 1 kn = 1852 m / 3600 s.
  mph: 0.44704,
  kn: 0.5144444444444444
}

function instance() {
  // Immer das Dezimalmodell: Brüche sind für physikalische Größen unbrauchbar, und die
  // Unit-API von mathjs liefert mit `Fraction` Werte wie `127/5 mm`.
  return calculatorFor({ number: 'BigNumber', precision: 64 })
}

/**
 * Zahlenteil einer formatierten Größe (`25.4 mm` → `25.4`, `1e-4 m2` → `1e-4`).
 *
 * Nicht über ein Muster am **Ende** abschneiden: Einheiten wie `m2` oder `m3` enden auf eine
 * Ziffer, dann bliebe die Einheit stehen (und `degF` würde zu `de` zerlegt, weil `e` auch als
 * Exponentenzeichen gilt). Deshalb die führende Zahl lesen.
 */
function numericPart(text: string): string {
  const match = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/u.exec(text.trim())
  return match ? match[0] : text.trim()
}

const factorCache = new Map<string, string>()

/** Wert einer Einheit in der Basiseinheit der Kategorie als exakte Dezimalzeichenkette. */
export function unitFactorText(unit: string, base: string): string | null {
  const extra = extraFactors[unit]
  if (extra !== undefined) return String(extra)
  const key = `${unit}->${base}`
  const cached = factorCache.get(key)
  if (cached !== undefined) return cached
  const math = instance()
  try {
    const factor = math.unit(1, unit).to(base)
    const text = numericPart(math.format(factor, { precision: 20 }))
    if (!/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu.test(text)) return null
    factorCache.set(key, text)
    return text
  } catch {
    return null
  }
}

/** Wie `unitFactorText`, aber als Zahl — für Prüfungen und Anzeigen. */
export function unitFactor(unit: string, base: string): number | null {
  const text = unitFactorText(unit, base)
  if (text === null) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

function readValue(value: string): string | null {
  const trimmed = value.trim().replace(',', '.')
  return /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu.test(trimmed) ? trimmed : null
}

/**
 * Rechnet einen Wert zwischen zwei Einheiten einer Kategorie um — exakt in `BigNumber`.
 *
 * Einheiten mit Verschiebung (Temperatur) laufen direkt über `unit(...).to(...)`, weil dort nicht
 * nur skaliert, sondern auch verschoben wird. Alles andere geht über die Basiseinheit:
 * Wert × Faktor(aus) ÷ Faktor(nach).
 */
export function convertMeasure(value: string, from: string, to: string, categoryId: string): QuantityResult {
  const category = unitCategories.find((item) => item.id === categoryId)
  if (!category) return { ok: false, display: '', error: 'unsupported' }
  if (!category.units.includes(from) || !category.units.includes(to)) {
    return { ok: false, display: '', error: 'unknownUnit' }
  }
  const trimmed = readValue(value)
  if (trimmed === null) return { ok: false, display: '', error: 'invalid' }

  const math = instance()
  try {
    const input = math.bignumber(trimmed)
    if (category.affine) {
      const result = math.unit(input, from).to(to)
      return { ok: true, display: numericPart(math.format(result, { precision: 14 })), error: null }
    }
    const factorFrom = unitFactorText(from, category.base)
    const factorTo = unitFactorText(to, category.base)
    if (factorFrom === null || factorTo === null) return { ok: false, display: '', error: 'unknownUnit' }
    const result = math.divide(math.multiply(input, math.bignumber(factorFrom)), math.bignumber(factorTo))
    return { ok: true, display: math.format(result, { precision: 14 }), error: null }
  } catch {
    return { ok: false, display: '', error: 'range' }
  }
}

/** Winkelumrechnung — dieselbe Mechanik über die Unit-API. */
export function convertAngle(value: string, from: string, to: string): QuantityResult {
  const trimmed = readValue(value)
  if (trimmed === null) return { ok: false, display: '', error: 'invalid' }
  if (!angleUnits.includes(from) || !angleUnits.includes(to)) {
    return { ok: false, display: '', error: 'unknownUnit' }
  }
  const math = instance()
  try {
    const result = math.unit(math.bignumber(trimmed), from).to(to)
    return { ok: true, display: numericPart(math.format(result, { precision: 14 })), error: null }
  } catch {
    return { ok: false, display: '', error: 'range' }
  }
}

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Zahlensysteme 2 bis 36 über `BigInt` — beliebig große ganze Zahlen, ohne Genauigkeitsverlust.
 */
export function toNumberBase(value: string, base: number): QuantityResult {
  if (!Number.isInteger(base) || base < 2 || base > 36) return { ok: false, display: '', error: 'range' }
  const trimmed = value.trim().replace(/\s/gu, '')
  if (!trimmed) return { ok: false, display: '', error: 'invalid' }
  if (!/^-?[0-9]+$/u.test(trimmed)) return { ok: false, display: '', error: 'invalid' }

  let number = BigInt(trimmed)
  const negative = number < 0n
  if (negative) number = -number
  let text = ''
  const radix = BigInt(base)
  do {
    text = (DIGITS[Number(number % radix)] ?? '') + text
    number /= radix
  } while (number > 0n)
  return { ok: true, display: `${negative ? '-' : ''}${text}`, error: null }
}

/** Zollbruch → Millimeter. `1 1/2` heißt einundeinhalb Zoll. */
export function inchFractionToMillimetres(whole: string, numerator: string, denominator: string): QuantityResult {
  const w = readValue(whole || '0')
  const n = readValue(numerator || '0')
  const d = readValue(denominator || '0')
  if (w === null || n === null || d === null) return { ok: false, display: '', error: 'invalid' }
  const math = instance()
  try {
    if (math.bignumber(d).isZero()) return { ok: false, display: '', error: 'invalid' }
    // Ein Zoll ist per Definition genau 25,4 mm (internationale Festlegung von 1959).
    const inches = math.add(math.bignumber(w), math.divide(math.bignumber(n), math.bignumber(d)))
    const result = math.multiply(inches, math.bignumber('25.4'))
    return { ok: true, display: math.format(result, { precision: 14 }), error: null }
  } catch {
    return { ok: false, display: '', error: 'range' }
  }
}

/** Millimeter → nächstliegender Zollbruch mit dem gewählten Nenner (2 bis 64), gekürzt. */
export function millimetresToInchFraction(value: string, denominator: number): QuantityResult {
  const trimmed = readValue(value)
  if (trimmed === null) return { ok: false, display: '', error: 'invalid' }
  if (!Number.isInteger(denominator) || denominator < 1 || denominator > 1024) {
    return { ok: false, display: '', error: 'range' }
  }
  const millimetres = Number(trimmed)
  const steps = Math.round((millimetres / 25.4) * denominator)
  const whole = Math.trunc(steps / denominator)
  let numerator = steps - whole * denominator
  let den = denominator
  while (numerator > 0 && numerator % 2 === 0 && den % 2 === 0) {
    numerator /= 2
    den /= 2
  }
  const text = numerator === 0 ? `${whole}` : whole === 0 ? `${numerator}/${den}` : `${whole} ${numerator}/${den}`
  return { ok: true, display: text.trim(), error: null }
}
