import { describe, expect, it } from 'vitest'
import { calendarIds, formatCalendarDate, fromCalendar, fromCalendarParts, loadTemporal, toCalendar } from '@commietools/tools/calculator/calendars'
import {
  convertAngle,
  convertMeasure,
  inchFractionToMillimetres,
  millimetresToInchFraction,
  toNumberBase,
  unitCategories,
  unitFactor
} from '@commietools/tools/calculator/units'
import {
  addToDate,
  countWorkingDays,
  dateDifference,
  deadline,
  formatMinutes,
  isoWeek,
  parseDuration,
  sumDurations
} from '@commietools/tools/calculator/dates'

/**
 * Welle 4 der Rechner-Suite. Die Kalenderprüfung ist zugleich die **Messung** der Abnahme:
 * 18 Kalender vorwärts, Rückweg für jeden, und der Rückweg über `monthCode`.
 */

const temporal = await loadTemporal()

describe('Kalender — vorwärts für alle 18', () => {
  it('lists exactly the calendars the platform knows', () => {
    const known = Intl.supportedValuesOf('calendar')
    expect([...calendarIds].sort()).toEqual([...known].sort())
  })

  it('converts the reference date into every calendar', () => {
    for (const id of calendarIds) {
      const result = toCalendar('2026-10-03', id, temporal, 'de-DE')
      expect(result.ok, `${id}: ${String(result.error)}`).toBe(true)
      // `iso8601` ist der Standardkalender — Temporal lässt dort die Annotation weg.
      if (id !== 'iso8601') expect(result.calendarDate, id).toContain(`[u-ca=${id}]`)
      expect(result.display, id).not.toBe('')
    }
  })

  it('shows the same day in different calendars, not a different day', () => {
    // Gegenprobe über den zweiten Weg: Die Anzeige über Intl muss denselben Tag meinen.
    const hebrew = formatCalendarDate('2026-10-03', 'hebrew', 'de-DE')
    const japanese = formatCalendarDate('2026-10-03', 'japanese', 'de-DE')
    // Der 3. Oktober 2026 ist der 22. Tischri 5787 — im hebräischen Kalender steht das
    // Kalenderjahr, nicht das gregorianische.
    expect(hebrew).toContain('5787')
    expect(hebrew).toContain('Tischri')
    // Japanisch zählt in Ären: 2026 ist das 8. Jahr der Reiwa-Ära.
    expect(japanese).toContain('Reiwa')
  })
})

describe('Kalender — Rückweg', () => {
  it('returns to the same gregorian date in every calendar', () => {
    // Das ist der Kern der Abnahme: kein Kalender darf stillschweigend ein anderes Datum liefern.
    const failures: string[] = []
    for (const id of calendarIds) {
      const forward = toCalendar('2026-10-03', id, temporal)
      expect(forward.ok, `${id} vorwärts`).toBe(true)
      const back = fromCalendar(forward.calendarDate, temporal)
      if (!back.ok || back.iso !== '2026-10-03') {
        failures.push(`${id}: ${back.error ?? ''} ${back.iso}`)
      }
    }
    expect(failures, 'Kalender mit fehlerhaftem Rückweg').toEqual([])
  })

  it('takes the monthCode route, which is what leap months need', () => {
    // Hebräisch hat Schaltmonate: die Monatszahl allein ist nicht eindeutig, `M01` ist es.
    const result = fromCalendarParts(5787, 1, 22, 'hebrew', temporal)
    expect(result.ok, String(result.error)).toBe(true)
    expect(result.iso).toBe('2026-10-03')
  })

  it('refuses an impossible calendar date instead of guessing', () => {
    const result = fromCalendar('5787-M13-99[u-ca=hebrew]', temporal)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('invalidCalendarDate')
    expect(result.iso).toBe('')
  })

  it('reports an unreadable date as its own class', () => {
    expect(toCalendar('nonsense', 'gregory', temporal).error).toBe('invalidDate')
    expect(fromCalendar('nonsense', temporal).error).toBe('invalidCalendarDate')
  })
})

describe('Einheiten', () => {
  const convert = (value: string, from: string, to: string, category: string) => {
    const result = convertMeasure(value, from, to, category)
    expect(result.ok, `${from}->${to}: ${String(result.error)}`).toBe(true)
    return Number(result.display)
  }

  it('converts lengths against the exact definitions', () => {
    // Ein Zoll ist per Definition genau 25,4 mm, ein Fuß genau 0,3048 m.
    expect(convert('1', 'in', 'mm', 'length')).toBeCloseTo(25.4, 9)
    expect(convert('1', 'ft', 'mm', 'length')).toBeCloseTo(304.8, 9)
    expect(convert('1', 'mi', 'km', 'length')).toBeCloseTo(1.609344, 9)
    expect(convert('2', 'm', 'cm', 'length')).toBeCloseTo(200, 9)
  })

  it('converts areas and volumes', () => {
    expect(convert('1', 'm2', 'cm2', 'area')).toBeCloseTo(10000, 6)
    expect(convert('1', 'hectare', 'm2', 'area')).toBeCloseTo(10000, 6)
    expect(convert('1', 'l', 'cm3', 'volume')).toBeCloseTo(1000, 6)
    expect(convert('1', 'm3', 'l', 'volume')).toBeCloseTo(1000, 6)
    expect(convert('1', 'gal', 'l', 'volume')).toBeCloseTo(3.785411784, 6)
  })

  it('converts masses', () => {
    expect(convert('1', 'kg', 'g', 'mass')).toBeCloseTo(1000, 6)
    expect(convert('1', 't', 'kg', 'mass')).toBeCloseTo(1000, 6)
    expect(convert('1', 'lb', 'g', 'mass')).toBeCloseTo(453.59237, 6)
    expect(convert('1', 'kg', 'lb', 'mass')).toBeCloseTo(2.2046226218, 6)
  })

  it('handles temperature with its offset, not with a factor', () => {
    expect(convert('0', 'degC', 'degF', 'temperature')).toBeCloseTo(32, 6)
    expect(convert('100', 'degC', 'degF', 'temperature')).toBeCloseTo(212, 6)
    expect(convert('-40', 'degC', 'degF', 'temperature')).toBeCloseTo(-40, 6)
    expect(convert('0', 'degC', 'K', 'temperature')).toBeCloseTo(273.15, 6)
  })

  it('converts pressure, force, energy, power and speed', () => {
    expect(convert('1', 'bar', 'Pa', 'pressure')).toBeCloseTo(100000, 3)
    expect(convert('1', 'kN', 'N', 'force')).toBeCloseTo(1000, 6)
    expect(convert('1', 'kWh', 'J', 'energy')).toBeCloseTo(3600000, 3)
    expect(convert('1', 'kW', 'W', 'power')).toBeCloseTo(1000, 6)
    expect(convert('1', 'km/h', 'm/s', 'speed')).toBeCloseTo(1 / 3.6, 6)
    // Die metrische Pferdestärke ist 735,49875 W — nicht die mechanische mit 745,7 W.
    expect(convert('1', 'PS', 'W', 'power')).toBeCloseTo(735.49875, 6)
  })

  it('converts angles', () => {
    expect(convert2('180', 'deg', 'rad')).toBeCloseTo(Math.PI, 9)
    expect(convert2('100', 'grad', 'deg')).toBeCloseTo(90, 9)
    expect(convert2('1', 'rad', 'deg')).toBeCloseTo(57.2957795131, 6)
    expect(convert2('1', 'deg', 'arcmin')).toBeCloseTo(60, 6)
  })

  it('measures its own factors instead of trusting a table', () => {
    // Der Faktor wird über mathjs bestimmt; ein falsch eingetragener Faktor kann so nicht passieren.
    expect(unitFactor('in', 'm')).toBeCloseTo(0.0254, 12)
    expect(unitFactor('kWh', 'J')).toBeCloseTo(3600000, 6)
    expect(unitFactor('gibtsnicht', 'm')).toBe(null)
  })

  it('refuses unknown units and unreadable values', () => {
    expect(convertMeasure('1', 'xyz', 'm', 'length').error).toBe('unknownUnit')
    expect(convertMeasure('', 'm', 'cm', 'length').error).toBe('invalid')
    expect(convertMeasure('1', 'm', 'cm', 'gibtsnicht').error).toBe('unsupported')
  })
})

function convert2(value: string, from: string, to: string): number {
  const result = convertAngle(value, from, to)
  expect(result.ok, `${from}->${to}: ${String(result.error)}`).toBe(true)
  return Number(result.display)
}

describe('Zahlensysteme und Zoll', () => {
  it('writes whole numbers in any base from 2 to 36', () => {
    const base = (value: string, radix: number) => {
      const result = toNumberBase(value, radix)
      expect(result.ok, `${value} in Basis ${radix}: ${String(result.error)}`).toBe(true)
      return result.display
    }
    expect(base('255', 16)).toBe('ff')
    expect(base('255', 2)).toBe('11111111')
    expect(base('255', 8)).toBe('377')
    expect(base('1295', 36)).toBe('zz')
    expect(base('-255', 16)).toBe('-ff')
    // Beliebige Größe: BigInt, nicht Number.
    expect(base('123456789012345678901234567890', 16)).toBe('18ee90ff6c373e0ee4e3f0ad2')
  })

  it('refuses an impossible base', () => {
    expect(toNumberBase('10', 37).error).toBe('range')
    expect(toNumberBase('10', 1).error).toBe('range')
    expect(toNumberBase('', 16).error).toBe('invalid')
  })

  it('turns inch fractions into millimetres', () => {
    expect(Number(inchFractionToMillimetres('0', '1', '2').display)).toBeCloseTo(12.7, 9)
    expect(Number(inchFractionToMillimetres('0', '3', '4').display)).toBeCloseTo(19.05, 9)
    expect(Number(inchFractionToMillimetres('1', '1', '2').display)).toBeCloseTo(38.1, 9)
    // Ein Nenner von null ist keine Angabe — das muss abgelehnt werden, nicht NaN ergeben.
    expect(inchFractionToMillimetres('0', '1', '0').ok).toBe(false)
  })

  it('turns millimetres back into the nearest fraction and shortens it', () => {
    expect(millimetresToInchFraction('25.4', 64).display).toBe('1')
    expect(millimetresToInchFraction('12.7', 64).display).toBe('1/2')
    expect(millimetresToInchFraction('19.05', 64).display).toBe('3/4')
    expect(millimetresToInchFraction('38.1', 64).display).toBe('1 1/2')
  })
})

describe('Zeit und Datum', () => {
  const values = (result: { ok: boolean; values: Readonly<Record<string, string>>; error?: string | null }) => {
    expect(result.ok, String(result.error)).toBe(true)
    return result.values
  }

  it('counts the distance between two dates', () => {
    const result = values(dateDifference('2026-10-01', '2026-10-31', temporal))
    expect(result.days).toBe('30')
    expect(result.weeks).toBe('4')
    // Volle Monate sind es null: Vom 1.10. bis zum 31.10. fehlt ein Tag zum Monat.
    expect(result.months).toBe('0')
    expect(values(dateDifference('2026-10-01', '2026-11-01', temporal)).months).toBe('1')
  })

  it('handles month and year borders when adding', () => {
    // 31. Januar + 1 Monat: Februar hat keinen 31. — Temporal liefert den 28./29.
    expect(values(addToDate('2026-01-31', 1, 'months', temporal)).iso).toBe('2026-02-28')
    expect(values(addToDate('2024-01-31', 1, 'months', temporal)).iso).toBe('2024-02-29')
    // 29. Februar + 1 Jahr: kein Schalttag im Folgejahr.
    expect(values(addToDate('2024-02-29', 1, 'years', temporal)).iso).toBe('2025-02-28')
    expect(values(addToDate('2026-10-03', 14, 'days', temporal)).iso).toBe('2026-10-17')
    expect(values(addToDate('2026-10-03', -3, 'days', temporal)).iso).toBe('2026-09-30')
  })

  it('reports calendar week and weekday with ISO rules', () => {
    const result = values(isoWeek('2026-10-03', temporal))
    expect(result.week).toBe('40')
    expect(result.weekday).toBe('6')
    expect(result.daysInMonth).toBe('31')
    expect(values(isoWeek('2024-02-29', temporal)).leapYear).toBe('true')
  })

  it('counts working days without holidays', () => {
    // Eine volle Woche Montag bis Montag enthält fünf Werktage.
    expect(countWorkingDays('2026-10-05', '2026-10-12', temporal)).toBe(5)
    expect(countWorkingDays('2026-10-03', '2026-10-04', temporal)).toBe(0)
    expect(countWorkingDays('2026-10-05', '2026-10-05', temporal)).toBe(0)
  })

  it('computes a deadline by the German civil code', () => {
    // Ereignis Samstag, 3.10.2026. § 187: Fristbeginn 4.10. § 188: 14 Tage → 17.10.
    // § 193: der 17.10.2026 ist ein Samstag → Montag, 19.10.2026.
    const twoWeeks = values(deadline('2026-10-03', 14, 'days', temporal))
    expect(twoWeeks.start).toBe('2026-10-04')
    expect(twoWeeks.rawEnd).toBe('2026-10-17')
    expect(twoWeeks.end).toBe('2026-10-19')
    expect(twoWeeks.shifted).toBe('2')

    // Wochenfrist: Ende am gleichnamigen Tag der letzten Woche — Montag bleibt Montag.
    const weeks = values(deadline('2026-10-05', 2, 'weeks', temporal))
    expect(weeks.end).toBe('2026-10-19')

    // Monatsfrist mit fehlendem Tag: § 188 Abs. 3 → letzter Tag des Monats.
    const months = values(deadline('2026-01-31', 1, 'months', temporal))
    // § 188 Abs. 3: Der 31. Februar gibt es nicht → der 28.02. ist das rechnerische Ende.
    // Der 28.02.2026 ist ein Samstag, § 193 schiebt auf Montag, den 02.03.2026.
    expect(months.rawEnd).toBe('2026-02-28')
    expect(months.end).toBe('2026-03-02')
  })

  it('reads and sums durations like a timesheet', () => {
    expect(parseDuration('1:30')).toBe(90)
    expect(parseDuration('1,5h')).toBe(90)
    expect(parseDuration('90min')).toBe(90)
    expect(parseDuration('2h 15m')).toBe(135)
    expect(parseDuration('quatsch')).toBe(null)
    expect(formatMinutes(90)).toBe('1:30')
    expect(formatMinutes(0)).toBe('0:00')
    expect(formatMinutes(-75)).toBe('-1:15')

    const total = values(sumDurations('1:30\n2:15\n0:45'))
    expect(total.total).toBe('4:30')
    expect(total.decimalHours).toBe('4.50')
    expect(sumDurations('1:30\nquatsch').error).toBe('invalidDate')
  })

  it('refuses invalid dates instead of silently correcting them', () => {
    expect(dateDifference('2026-02-30', '2026-03-01', temporal).error).toBe('invalidDate')
    expect(addToDate('', 1, 'days', temporal).error).toBe('invalidDate')
    expect(deadline('2026-10-03', 0, 'days', temporal).error).toBe('invalidRange')
  })
})

describe('Einheitenkatalog', () => {
  it('has a base unit inside every category', () => {
    for (const category of unitCategories) {
      expect(category.units, category.id).toContain(category.base)
    }
  })

  it('measures a factor for every listed unit', () => {
    const missing: string[] = []
    for (const category of unitCategories) {
      for (const unit of category.units) {
        const factor = unitFactor(unit, category.base)
        if (factor === null || !Number.isFinite(factor)) missing.push(`${category.id}/${unit}`)
      }
    }
    expect(missing).toEqual([])
  })
})
