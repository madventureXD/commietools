import { describe, expect, it } from 'vitest'
import {
  CVD_TYPES,
  clampChannel,
  contrastRatio,
  contrastVerdict,
  cvdRows,
  hslToRgb,
  paletteFromPixels,
  parseColor,
  relativeLuminance,
  rgbToHsl,
  rgbToLab,
  simulateCvd,
  toHex,
  type CvdType,
  type Rgb
} from '@commietools/tools'

/**
 * Reference values from libDaltonLens 0.1.5 (MIT), Brettel, Viénot & Mollon
 * 1997, computed on the same colours. The port must agree with the reference,
 * not with itself.
 */
const BRETTEL_REFERENCE: Record<Exclude<CvdType, 'achromatopsia'>, [Rgb, Rgb][]> = {
  protanopia: [
    [{ r: 255, g: 0, b: 0 }, { r: 106, g: 90, b: 13 }],
    [{ r: 0, g: 255, b: 0 }, { r: 254, g: 237, b: 0 }],
    [{ r: 0, g: 0, b: 255 }, { r: 0, g: 54, b: 254 }],
    [{ r: 255, g: 255, b: 0 }, { r: 254, g: 250, b: 0 }],
    [{ r: 255, g: 0, b: 255 }, { r: 0, g: 105, b: 254 }],
    [{ r: 230, g: 57, b: 70 }, { r: 105, g: 97, b: 71 }],
    [{ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 }]
  ],
  deuteranopia: [
    [{ r: 255, g: 0, b: 0 }, { r: 163, g: 138, b: 0 }],
    [{ r: 0, g: 255, b: 0 }, { r: 241, g: 209, b: 46 }],
    [{ r: 0, g: 0, b: 255 }, { r: 0, g: 86, b: 254 }],
    [{ r: 255, g: 0, b: 255 }, { r: 101, g: 160, b: 251 }],
    [{ r: 230, g: 57, b: 70 }, { r: 151, g: 133, b: 60 }]
  ],
  tritanopia: [
    [{ r: 255, g: 0, b: 0 }, { r: 254, g: 0, b: 78 }],
    [{ r: 0, g: 255, b: 0 }, { r: 123, g: 234, b: 254 }],
    [{ r: 0, g: 0, b: 255 }, { r: 0, g: 95, b: 134 }],
    [{ r: 0, g: 255, b: 255 }, { r: 73, g: 248, b: 254 }],
    [{ r: 255, g: 0, b: 255 }, { r: 238, g: 98, b: 120 }],
    [{ r: 230, g: 57, b: 70 }, { r: 230, g: 52, b: 89 }]
  ]
}

function near(actual: Rgb, expected: Rgb, tolerance = 2): boolean {
  return Math.abs(actual.r - expected.r) <= tolerance
    && Math.abs(actual.g - expected.g) <= tolerance
    && Math.abs(actual.b - expected.b) <= tolerance
}

describe('parsing and formatting', () => {
  it('reads the notations a user is likely to paste', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseColor('#1d3557')).toEqual({ r: 29, g: 53, b: 87 })
    expect(parseColor('1d3557')).toEqual({ r: 29, g: 53, b: 87 })
    expect(parseColor('rgb(29, 53, 87)')).toEqual({ r: 29, g: 53, b: 87 })
    expect(parseColor('rgb(29 53 87)')).toEqual({ r: 29, g: 53, b: 87 })
    expect(parseColor('hsl(210 50% 23%)')).toEqual(hslToRgb({ h: 210, s: 50, l: 23 }))
  })

  it('returns nothing for input it cannot read instead of guessing', () => {
    expect(parseColor('')).toBeNull()
    expect(parseColor('blau')).toBeNull()
    expect(parseColor('#12345')).toBeNull()
  })

  it('writes a colour back as six-digit hex', () => {
    expect(toHex({ r: 29, g: 53, b: 87 })).toBe('#1d3557')
    expect(toHex({ r: 255.6, g: -4, b: 300 })).toBe('#ff00ff')
    expect(clampChannel(Number.NaN)).toBe(0)
  })

  it('survives a round trip through HSL', () => {
    for (const color of [{ r: 29, g: 53, b: 87 }, { r: 230, g: 57, b: 70 }, { r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }]) {
      expect(near(hslToRgb(rgbToHsl(color)), color, 2), toHex(color)).toBe(true)
    }
  })

  it('places black and white where CIE-Lab expects them', () => {
    const white = rgbToLab({ r: 255, g: 255, b: 255 })
    const black = rgbToLab({ r: 0, g: 0, b: 0 })
    expect(white.l).toBeCloseTo(100, 1)
    expect(Math.abs(white.a)).toBeLessThan(0.5)
    expect(black.l).toBeCloseTo(0, 3)
  })
})

describe('WCAG contrast', () => {
  it('agrees with the reference ratios', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 3)
    expect(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 230, g: 57, b: 70 })).toBeCloseTo(4.1681, 3)
    expect(contrastRatio({ r: 29, g: 53, b: 87 }, { r: 168, g: 218, b: 220 })).toBeCloseTo(8.0789, 3)
    expect(contrastRatio({ r: 128, g: 128, b: 128 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(3.9494, 3)
  })

  it('is symmetric and never below one', () => {
    const a = { r: 29, g: 53, b: 87 }
    const b = { r: 168, g: 218, b: 220 }
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
    expect(contrastRatio(a, a)).toBeCloseTo(1, 10)
  })

  it('reports the thresholds that matter for text', () => {
    expect(contrastVerdict({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toMatchObject({ aa: true, aaa: true, large: true })
    expect(contrastVerdict({ r: 255, g: 255, b: 255 }, { r: 230, g: 57, b: 70 })).toMatchObject({ aa: false, aaa: false, large: true })
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0)
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 10)
  })
})

describe('colour vision deficiency', () => {
  it('matches the reference implementation colour by colour', () => {
    for (const type of ['protanopia', 'deuteranopia', 'tritanopia'] as const) {
      for (const [input, expected] of BRETTEL_REFERENCE[type]) {
        const actual = simulateCvd(input, type)
        expect(near(actual, expected), `${type} ${toHex(input)} → ${toHex(actual)} statt ${toHex(expected)}`).toBe(true)
      }
    }
  })

  it('leaves grey and the extremes untouched', () => {
    for (const type of CVD_TYPES) {
      expect(near(simulateCvd({ r: 128, g: 128, b: 128 }, type), { r: 128, g: 128, b: 128 }, 2), type).toBe(true)
      expect(near(simulateCvd({ r: 0, g: 0, b: 0 }, type), { r: 0, g: 0, b: 0 }, 2), type).toBe(true)
    }
  })

  it('turns a colour grey for achromatopsia', () => {
    const grey = simulateCvd({ r: 230, g: 57, b: 70 }, 'achromatopsia')
    expect(grey.r).toBe(grey.g)
    expect(grey.g).toBe(grey.b)
    expect(grey.r).toBeLessThan(200)
  })

  it('shows why red and green must not carry meaning alone', () => {
    // Under deuteranopia red and green end up with similar luminance.
    const red = simulateCvd({ r: 255, g: 0, b: 0 }, 'deuteranopia')
    const green = simulateCvd({ r: 0, g: 255, b: 0 }, 'deuteranopia')
    const ratio = contrastRatio(red, green)
    expect(ratio).toBeLessThan(3)
    expect(cvdRows([{ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }])).toHaveLength(2)
    expect(cvdRows([{ r: 255, g: 0, b: 0 }])[0]?.simulations).toHaveLength(4)
  })
})

describe('palette', () => {
  function pixels(colors: readonly Rgb[], repeats: number): Uint8ClampedArray {
    const data = new Uint8ClampedArray(colors.length * repeats * 4)
    let offset = 0
    for (const color of colors) {
      for (let copy = 0; copy < repeats; copy += 1) {
        data[offset] = color.r
        data[offset + 1] = color.g
        data[offset + 2] = color.b
        data[offset + 3] = 255
        offset += 4
      }
    }
    return data
  }

  it('finds the colours an image is actually made of', () => {
    const red = { r: 240, g: 10, b: 12 }
    const blue = { r: 10, g: 20, b: 240 }
    const palette = paletteFromPixels(pixels([red, blue], 400), { count: 2, step: 1 })
    expect(palette).toHaveLength(2)
    expect(near(palette[0] ?? red, red, 6) || near(palette[1] ?? red, red, 6)).toBe(true)
    expect(near(palette[0] ?? blue, blue, 6) || near(palette[1] ?? blue, blue, 6)).toBe(true)
  })

  it('is deterministic, so the same picture always gives the same palette', () => {
    const data = pixels([{ r: 200, g: 30, b: 40 }, { r: 20, g: 40, b: 200 }, { r: 30, g: 200, b: 60 }], 250)
    expect(paletteFromPixels(data, { count: 3, step: 1 })).toEqual(paletteFromPixels(data, { count: 3, step: 1 }))
  })

  it('ignores transparent pixels and empty input', () => {
    const data = new Uint8ClampedArray(64)
    for (let index = 3; index < data.length; index += 4) data[index] = 0
    expect(paletteFromPixels(data)).toEqual([])
    expect(paletteFromPixels(new Uint8ClampedArray(0))).toEqual([])
  })

  it('never returns more colours than allowed', () => {
    const many = Array.from({ length: 20 }, (_, index) => ({ r: index * 12, g: 255 - index * 9, b: (index * 7) % 255 }))
    expect(paletteFromPixels(pixels(many, 30), { count: 20, step: 1 }).length).toBeLessThanOrEqual(8)
  })
})
