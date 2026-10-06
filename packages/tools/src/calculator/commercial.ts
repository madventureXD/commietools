/**
 * Kern des Werkzeugs „Kaufmännisch" (Welle 3 der Suite „Rechnen").
 *
 * **Keine neue Abhängigkeit, keine Gleitkommazahl bei Geld.** Gerechnet wird durchgehend in
 * `BigInt` mit fester Skala — ein Cent-Betrag ist eine ganze Zahl, ein Prozentsatz ein
 * Bruchteil davon. `0.1 + 0.2` kann hier nicht 0,30000000000000004 ergeben, und ein
 * Tilgungsplan bleibt über 360 Perioden cent-genau.
 *
 * Keine Anzeigetexte: Ergebnisse sind exakte Dezimalzeichenketten mit Punkt; die Schreibweise
 * je Sprache (Tausenderpunkt, Komma) macht die Oberfläche über `Intl`. Fehler sind Codes.
 *
 * Die Rechenwege sind öffentlich (Prozentrechnung, kaufmännisches Rechnen, Annuitätenformel);
 * die Quelle je Rechenart steht in den Sprachkatalogen.
 */

/** Interne Skala: 12 Nachkommastellen. Cent-genauigkeit ist damit deutlich übererfüllt. */
const SCALE = 10n ** 12n

export type CommercialErrorCode = 'empty' | 'invalid' | 'range' | 'zeroDivisor' | 'periods'

export interface CommercialValue {
  readonly ok: boolean
  /** Exakter Dezimalwert mit Punkt, auf die angeforderte Stellenzahl gerundet. */
  readonly display: string
  readonly error: CommercialErrorCode | null
}

/** Mehrere benannte Ergebnisse einer Rechnung (`wert`, `rabatt`, `endpreis`, …). */
export interface CommercialResult {
  readonly ok: boolean
  readonly values: Readonly<Record<string, string>>
  readonly error: CommercialErrorCode | null
}

/** Kaufmännische Rundung (halbe auf), vorzeichenunabhängig. */
function divRound(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error('zeroDivisor')
  const negative = (numerator < 0n) !== (denominator < 0n)
  const a = numerator < 0n ? -numerator : numerator
  const b = denominator < 0n ? -denominator : denominator
  const quotient = (a * 2n + b) / (b * 2n)
  return negative ? -quotient : quotient
}

/**
 * Zahleneingabe. Dokumentierte Annahmen (stehen so auch in der Oberfläche):
 * - Ein Komma ist immer das Dezimaltrennzeichen („1.234,56" = 1234,56).
 * - Ohne Komma gilt: Steht hinter dem **letzten** Punkt genau eine Dreiergruppe, ist er ein
 *   Tausendertrenner („1.234" = 1234, „1.234.567" = 1234567). Sonst — etwa bei „1234.56" oder
 *   „33.333333" — ist der letzte Punkt das Dezimaltrennzeichen.
 * - Leerzeichen (auch als Tausendertrenner) und ein führendes `+` werden verworfen.
 *
 * Der ambivalente Fall „1.234" wird als Tausendertrenner gelesen: Für ein deutschsprachiges
 * Werkzeug ist das die erwartete Bedeutung; die englische Schreibweise schreibt 1,234.
 */
export function parseNumber(text: string): bigint | null {
  const raw = text.trim().replace(/\s/gu, '').replace(/^\+/u, '')
  if (!raw) return null

  let normalized = raw
  if (raw.includes(',')) {
    // Komma ist der Dezimaltrenner, alle Punkte sind Tausenderpunkte.
    normalized = raw.replace(/\./gu, '').replace(',', '.')
  } else if (raw.includes('.')) {
    const lastGroup = raw.slice(raw.lastIndexOf('.') + 1)
    // Genau drei Ziffern am Ende ⇒ Tausendertrenner; sonst Dezimaltrennzeichen.
    normalized = /^\d{3}$/u.test(lastGroup) ? raw.replace(/\./gu, '') : raw.replace(/\.(?=.*\.)/gu, '')
  }

  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/u.exec(normalized)
  if (!match) return null
  const [, sign, whole = '', fraction = ''] = match
  if (!whole && !fraction) return null
  if (fraction.length > 12) return null
  const digits = `${whole}${fraction.padEnd(12, '0')}`
  const value = BigInt(digits)
  return sign === '-' ? -value : value
}

/** Skalierter Wert als exakte Dezimalzeichenkette, auf `decimals` Stellen gerundet. */
export function formatNumber(value: bigint, decimals = 2): string {
  const factor = 10n ** BigInt(12 - decimals)
  const rounded = divRound(value, factor)
  const negative = rounded < 0n
  const digits = (negative ? -rounded : rounded).toString().padStart(decimals + 1, '0')
  const whole = digits.slice(0, digits.length - decimals)
  const fraction = decimals > 0 ? digits.slice(digits.length - decimals) : ''
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`
}

function ok(value: string): CommercialValue {
  return { ok: true, display: value, error: null }
}

function fail(error: CommercialErrorCode): CommercialValue {
  return { ok: false, display: '', error }
}

function values(entries: Record<string, string>): CommercialResult {
  return { ok: true, values: entries, error: null }
}

/** Multiplikation zweier skalierter Werte, wieder auf die Skala gerundet. */
function mul(a: bigint, b: bigint): bigint {
  return divRound(a * b, SCALE)
}

/** Division zweier skalierter Werte, wieder auf die Skala gerundet. */
function div(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('zeroDivisor')
  return divRound(a * SCALE, b)
}

/** `base` hoch `exponent` bei fester Skala — Zwischenergebnisse werden auf die Skala gerundet. */
function power(base: bigint, exponent: number): bigint {
  let result = SCALE
  let factor = base
  let steps = exponent
  while (steps > 0) {
    if (steps % 2 === 1) result = mul(result, factor)
    factor = mul(factor, factor)
    steps = Math.floor(steps / 2)
  }
  return result
}

/** Prozentwert: W = G · p / 100 */
export function percentValue(base: string, percent: string, decimals = 2): CommercialValue {
  const g = parseNumber(base)
  const p = parseNumber(percent)
  if (g === null || p === null) return fail('invalid')
  if (g < 0n) return fail('range')
  return ok(formatNumber(div(mul(g, p), 100n * SCALE) , decimals))
}

/** Prozentsatz: p = W / G · 100 */
export function percentShare(part: string, base: string, decimals = 2): CommercialValue {
  const w = parseNumber(part)
  const g = parseNumber(base)
  if (w === null || g === null) return fail('invalid')
  if (g === 0n) return fail('zeroDivisor')
  return ok(formatNumber(div(mul(w, 100n * SCALE), g), decimals))
}

/** Grundwert: G = W / p · 100 */
export function percentBase(part: string, percent: string, decimals = 2): CommercialValue {
  const w = parseNumber(part)
  const p = parseNumber(percent)
  if (w === null || p === null) return fail('invalid')
  if (p === 0n) return fail('zeroDivisor')
  return ok(formatNumber(div(mul(w, 100n * SCALE), p), decimals))
}

/** Rabatt: Rabatt = Preis · p / 100, Endpreis = Preis − Rabatt */
export function discount(price: string, percent: string): CommercialResult {
  const g = parseNumber(price)
  const p = parseNumber(percent)
  if (g === null || p === null) return { ok: false, values: {}, error: 'invalid' }
  if (p < 0n || p > 100n * SCALE) return { ok: false, values: {}, error: 'range' }
  const amount = div(mul(g, p), 100n * SCALE)
  return values({ rabatt: formatNumber(amount), endpreis: formatNumber(g - amount) })
}

/** Aufschlag: Aufschlag = Einkaufspreis · p / 100, Verkaufspreis = EK + Aufschlag */
export function markup(cost: string, percent: string): CommercialResult {
  const k = parseNumber(cost)
  const p = parseNumber(percent)
  if (k === null || p === null) return { ok: false, values: {}, error: 'invalid' }
  if (p < 0n) return { ok: false, values: {}, error: 'range' }
  const amount = div(mul(k, p), 100n * SCALE)
  return values({ aufschlag: formatNumber(amount), verkaufspreis: formatNumber(k + amount) })
}

/**
 * Marge und Aufschlag aus Verkaufspreis und Einkaufspreis — die beiden werden leicht
 * verwechselt und deshalb **beide** ausgegeben, mit klarer Bezugsgröße.
 */
export function margin(revenue: string, cost: string): CommercialResult {
  const vk = parseNumber(revenue)
  const ek = parseNumber(cost)
  if (vk === null || ek === null) return { ok: false, values: {}, error: 'invalid' }
  if (vk <= 0n || ek < 0n) return { ok: false, values: {}, error: 'range' }
  const gross = vk - ek
  const marginPercent = div(mul(gross, 100n * SCALE), vk)
  const markupPercent = ek === 0n ? null : div(mul(gross, 100n * SCALE), ek)
  return values({
    rohertrag: formatNumber(gross),
    marge: formatNumber(marginPercent),
    ...(markupPercent === null ? {} : { aufschlag: formatNumber(markupPercent) })
  })
}

/** Umsatzsteuer aufschlagen: Steuer = Netto · p / 100, Brutto = Netto + Steuer */
export function vatAdd(net: string, rate: string): CommercialResult {
  const n = parseNumber(net)
  const p = parseNumber(rate)
  if (n === null || p === null) return { ok: false, values: {}, error: 'invalid' }
  if (n < 0n || p < 0n) return { ok: false, values: {}, error: 'range' }
  const tax = div(mul(n, p), 100n * SCALE)
  return values({ netto: formatNumber(n), steuer: formatNumber(tax), brutto: formatNumber(n + tax) })
}

/**
 * Umsatzsteuer herausrechnen: Netto = Brutto / (1 + p/100).
 * Der Steuersatz wird als Faktor gerechnet, nicht als Abzug vom Bruttobetrag — sonst wäre das
 * Ergebnis um den Faktor (1 + p/100) zu hoch.
 */
export function vatRemove(gross: string, rate: string): CommercialResult {
  const b = parseNumber(gross)
  const p = parseNumber(rate)
  if (b === null || p === null) return { ok: false, values: {}, error: 'invalid' }
  if (b < 0n || p < 0n) return { ok: false, values: {}, error: 'range' }
  const factor = SCALE + div(mul(p, SCALE), 100n * SCALE)
  const net = div(b, factor)
  return values({ netto: formatNumber(net), steuer: formatNumber(b - net), brutto: formatNumber(b) })
}

/** Skonto: Abzug = Betrag · p / 100, Zahlbetrag = Betrag − Abzug */
export function cashDiscount(amount: string, percent: string): CommercialResult {
  const a = parseNumber(amount)
  const p = parseNumber(percent)
  if (a === null || p === null) return { ok: false, values: {}, error: 'invalid' }
  if (p < 0n || p > 100n * SCALE) return { ok: false, values: {}, error: 'range' }
  const reduction = div(mul(a, p), 100n * SCALE)
  return values({ skonto: formatNumber(reduction), zahlbetrag: formatNumber(a - reduction) })
}

/** Dreisatz: a verhält sich zu b wie c zu x → x = b · c / a */
export function ruleOfThree(a: string, b: string, c: string, decimals = 4): CommercialValue {
  const first = parseNumber(a)
  const second = parseNumber(b)
  const third = parseNumber(c)
  if (first === null || second === null || third === null) return fail('invalid')
  if (first === 0n) return fail('zeroDivisor')
  return ok(formatNumber(div(mul(second, third), first), decimals))
}

/** Zinseszins: Kn = K0 · (1 + i)^n */
export function compoundInterest(principal: string, rate: string, years: string): CommercialResult {
  const capital = parseNumber(principal)
  const interest = parseNumber(rate)
  const duration = parseNumber(years)
  if (capital === null || interest === null || duration === null) return { ok: false, values: {}, error: 'invalid' }
  if (capital < 0n || interest < 0n || duration < 0n) return { ok: false, values: {}, error: 'range' }
  const periods = Number(duration / SCALE)
  if (periods > 200) return { ok: false, values: {}, error: 'periods' }
  const factor = SCALE + div(mul(interest, SCALE), 100n * SCALE)
  const total = mul(capital, power(factor, periods))
  return values({
    endkapital: formatNumber(total),
    zinsen: formatNumber(total - capital),
    faktor: formatNumber(factor, 6)
  })
}

export interface AnnuityRow {
  /** Periodennummer, beginnend bei 1. */
  readonly period: number
  readonly interest: string
  readonly principal: string
  readonly payment: string
  readonly balance: string
}

export interface AnnuityPlan {
  readonly ok: boolean
  readonly rows: readonly AnnuityRow[]
  readonly annuity: string
  readonly error: CommercialErrorCode | null
}

/**
 * Annuitätendarlehen: A = K · i / (1 − (1 + i)^−n).
 *
 * `rate` ist der **Jahreszinssatz in Prozent**, `years` die Laufzeit in Jahren, `perYear` die
 * Zahlungen je Jahr. Bei einem Zinssatz von null ist die Annuität K / n — die Formel selbst
 * wäre dort eine Division durch null.
 */
export function annuityPlan(
  amount: string,
  rate: string,
  years: string,
  perYear = 12
): AnnuityPlan {
  const capital = parseNumber(amount)
  const interestRate = parseNumber(rate)
  const duration = parseNumber(years)
  if (capital === null || interestRate === null || duration === null) {
    return { ok: false, rows: [], annuity: '', error: 'invalid' }
  }
  if (capital <= 0n || interestRate < 0n || duration <= 0n) {
    return { ok: false, rows: [], annuity: '', error: 'range' }
  }
  if (perYear < 1 || perYear > 12) return { ok: false, rows: [], annuity: '', error: 'range' }

  const periods = Math.round(Number(duration / SCALE) * perYear)
  if (periods < 1 || periods > 600) return { ok: false, rows: [], annuity: '', error: 'periods' }

  const ratePerPeriod = div(mul(interestRate, SCALE), 100n * SCALE * BigInt(perYear))

  let annuity: bigint
  if (ratePerPeriod === 0n) {
    annuity = divRound(capital, BigInt(periods))
  } else {
    const factor = SCALE + ratePerPeriod
    const denominator = SCALE - div(SCALE, power(factor, periods))
    if (denominator <= 0n) return { ok: false, rows: [], annuity: '', error: 'range' }
    annuity = div(mul(capital, ratePerPeriod), denominator)
  }

  /**
   * Geld wird in **Cent** geführt: Zins und Tilgung werden je Periode auf Cent gerundet, wie es
   * ein Bankplan auch tut. Ohne diese Rundung weichen die ausgewiesenen Spaltenwerte in der
   * Summe um mehrere Cent vom Darlehen ab — die Zeilen wären dann einzeln richtig und zusammen
   * falsch. Der Rest der Restschuld wird in der letzten Rate ausgeglichen.
   */
  const toCents = (value: bigint) => divRound(value, 10n ** 10n) * 10n ** 10n

  const rows: AnnuityRow[] = []
  let balance = toCents(capital)
  const annuityRounded = toCents(annuity)
  for (let period = 1; period <= periods; period += 1) {
    const interest = toCents(mul(balance, ratePerPeriod))
    // Die letzte Rate löst die Restschuld vollständig auf — sonst bliebe ein Cent-Rest stehen.
    const payment = period === periods ? balance + interest : annuityRounded
    const principalPart = payment - interest
    balance -= principalPart
    if (balance < 0n && period === periods) balance = 0n
    const row: AnnuityRow = {
      period,
      interest: formatNumber(interest),
      principal: formatNumber(principalPart),
      payment: formatNumber(payment),
      balance: formatNumber(balance < 0n ? 0n : balance)
    }
    rows.push(row)
  }

  return { ok: true, rows, annuity: formatNumber(annuityRounded), error: null }
}

/** Die angebotenen Rechenarten — der Katalog und die Oberfläche lesen daraus. */
export const commercialOperations = [
  'percentValue',
  'percentShare',
  'percentBase',
  'discount',
  'markup',
  'margin',
  'vatAdd',
  'vatRemove',
  'cashDiscount',
  'ruleOfThree',
  'compoundInterest',
  'annuityPlan'
] as const

export type CommercialOperation = (typeof commercialOperations)[number]
