/**
 * Colour arithmetic: conversions, WCAG contrast, dichromacy simulation and
 * palettes. Pure numbers only; reading pixels and drawing happen in the web
 * application.
 *
 * Two things are worth stating because they are easy to get wrong:
 *
 *   1. The dichromacy simulation runs on **linear** RGB. Applying the matrices
 *      to gamma-encoded values is a common mistake and shifts the mid-tones
 *      visibly.
 *   2. The simulation uses Brettel, Viénot & Mollon (1997), which projects onto
 *      two half-planes. The simpler single-plane Viénot 1999 model is fine for
 *      protanopia and deuteranopia but not for tritanopia, so one model is used
 *      for all three. The matrices below were computed with libDaltonLens (MIT)
 *      and are checked against it in the tests.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export interface Lab {
  l: number
  a: number
  b: number
}

export type CvdType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

export const CVD_TYPES: readonly CvdType[] = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']

/** Enough colours for a readable palette without turning the grid into noise. */
export const MAX_PALETTE_COLORS = 8

type Matrix = readonly [number, number, number, number, number, number, number, number, number]

interface CvdModel {
  /** Projection used on the positive side of the separation plane. */
  first: Matrix
  /** Projection used on the negative side. */
  second: Matrix
  /** Separation plane normal, expressed in linear RGB. */
  plane: readonly [number, number, number]
}

const BRETTEL: Record<Exclude<CvdType, 'achromatopsia'>, CvdModel> = {
  protanopia: {
    first: [0.1450961893, 1.2016532158, -0.3467494051, 0.1044650099, 0.8531639308, 0.0423710593, 0.0042896394, -0.0060295193, 1.0017398798],
    second: [0.1411517215, 1.1678219369, -0.3089736585, 0.1049470043, 0.8572979455, 0.0377550502, 0.0043094315, -0.0058597645, 1.0015503330],
    plane: [0.0004845495, 0.0041559296, -0.0046404791]
  },
  deuteranopia: {
    first: [0.3619823932, 0.8675466623, -0.2295290555, 0.2609853390, 0.6451242766, 0.0938903844, -0.0197542767, 0.0268609465, 0.9928933302],
    second: [0.3700900098, 0.8854017913, -0.2554918011, 0.2576688646, 0.6378205175, 0.1045106179, -0.0195032490, 0.0274137763, 0.9920894726],
    plane: [-0.0029279800, -0.0064481911, 0.0093761711]
  },
  tritanopia: {
    first: [1.0135416153, 0.1426823107, -0.1562239260, -0.0118053648, 0.8756118317, 0.1361935331, 0.0770725345, 0.8120809125, 0.1108465530],
    second: [0.9333697629, 0.1999900499, -0.1333598129, 0.0580871806, 0.8256518564, 0.1162609631, -0.3792281148, 1.1382497342, 0.2409783807],
    plane: [0.0396009507, -0.0283072037, -0.0112937470]
  }
}

/** Rec. 709 coefficients, the ones sRGB displays are built around. */
const LUMA = [0.2126, 0.7152, 0.0722] as const

export function clampChannel(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(255, Math.max(0, Math.round(value)))
}

export function toHex(rgb: Rgb): string {
  const part = (value: number) => clampChannel(value).toString(16).padStart(2, '0')
  return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`
}

/** Accepts `#abc`, `#aabbcc`, `aabbcc`, `rgb(1 2 3)`, `rgb(1,2,3)` and `hsl(210 50% 40%)`. */
export function parseColor(input: string): Rgb | null {
  const text = input.trim().toLowerCase()
  if (!text) return null

  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text)
  if (hex) {
    const digits = hex[1] ?? ''
    const expanded = digits.length === 3 ? digits.split('').map((digit) => digit + digit).join('') : digits
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16)
    }
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(text)
  if (rgb) {
    return { r: clampChannel(Number(rgb[1])), g: clampChannel(Number(rgb[2])), b: clampChannel(Number(rgb[3])) }
  }

  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/.exec(text)
  if (hsl) {
    return hslToRgb({ h: Number(hsl[1]), s: Number(hsl[2]), l: Number(hsl[3]) })
  }
  return null
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hue = ((Number.isFinite(h) ? h : 0) % 360 + 360) % 360
  const saturation = Math.min(100, Math.max(0, Number.isFinite(s) ? s : 0)) / 100
  const lightness = Math.min(100, Math.max(0, Number.isFinite(l) ? l : 0)) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const offset = lightness - chroma / 2
  const sector = Math.floor(hue / 60) % 6
  const table: readonly (readonly [number, number, number])[] = [
    [chroma, secondary, 0], [secondary, chroma, 0], [0, chroma, secondary],
    [0, secondary, chroma], [secondary, 0, chroma], [chroma, 0, secondary]
  ]
  const [r, g, b] = table[sector] ?? [0, 0, 0]
  return { r: clampChannel((r + offset) * 255), g: clampChannel((g + offset) * 255), b: clampChannel((b + offset) * 255) }
}

export function rgbToHsl(rgb: Rgb): Hsl {
  const r = clampChannel(rgb.r) / 255
  const g = clampChannel(rgb.g) / 255
  const b = clampChannel(rgb.b) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const delta = max - min
  if (delta === 0) return { h: 0, s: 0, l: Math.round(lightness * 100) }
  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  let hue = 0
  if (max === r) hue = 60 * (((g - b) / delta) % 6)
  else if (max === g) hue = 60 * ((b - r) / delta + 2)
  else hue = 60 * ((r - g) / delta + 4)
  return {
    h: Math.round((hue + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100)
  }
}

/** sRGB transfer function, both directions, as defined for the sRGB standard. */
export function linearFromSrgbChannel(value: number): number {
  const channel = Math.min(1, Math.max(0, value))
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

export function srgbFromLinearChannel(value: number): number {
  const channel = Math.min(1, Math.max(0, value))
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055
}

/** Approximate CIE-Lab coordinates at D65, for readable colour ordering. */
export function rgbToLab(rgb: Rgb): Lab {
  const r = linearFromSrgbChannel(clampChannel(rgb.r) / 255)
  const g = linearFromSrgbChannel(clampChannel(rgb.g) / 255)
  const b = linearFromSrgbChannel(clampChannel(rgb.b) / 255)
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
  const y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1
  const z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
  const f = (value: number) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116)
  const fx = f(x)
  const fy = f(y)
  const fz = f(z)
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

/** Relative luminance per WCAG 2.x, computed on linearised channels. */
export function relativeLuminance(rgb: Rgb): number {
  const r = linearFromSrgbChannel(clampChannel(rgb.r) / 255)
  const g = linearFromSrgbChannel(clampChannel(rgb.g) / 255)
  const b = linearFromSrgbChannel(clampChannel(rgb.b) / 255)
  return LUMA[0] * r + LUMA[1] * g + LUMA[2] * b
}

/** WCAG contrast ratio, always at least 1. */
export function contrastRatio(first: Rgb, second: Rgb): number {
  const a = relativeLuminance(first)
  const b = relativeLuminance(second)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

export interface ContrastVerdict {
  ratio: number
  /** WCAG 2.2 AA for body text: 4.5:1. */
  aa: boolean
  /** WCAG 2.2 AAA for body text: 7:1. */
  aaa: boolean
  /** AA for large text and for interface elements: 3:1. */
  large: boolean
}

export function contrastVerdict(first: Rgb, second: Rgb): ContrastVerdict {
  const ratio = contrastRatio(first, second)
  return { ratio, aa: ratio >= 4.5, aaa: ratio >= 7, large: ratio >= 3 }
}

function applyMatrix(matrix: Matrix, r: number, g: number, b: number): readonly [number, number, number] {
  return [
    matrix[0] * r + matrix[1] * g + matrix[2] * b,
    matrix[3] * r + matrix[4] * g + matrix[5] * b,
    matrix[6] * r + matrix[7] * g + matrix[8] * b
  ]
}

/** Relative luminance of a linear colour, used for achromatopsia. */
function luminanceFromLinear(r: number, g: number, b: number): number {
  return LUMA[0] * r + LUMA[1] * g + LUMA[2] * b
}

/**
 * Simulates how a colour appears with a dichromatic colour vision deficiency.
 * Values are linearised first, projected in linear RGB, then encoded back.
 */
export function simulateCvd(rgb: Rgb, type: CvdType): Rgb {
  const r = linearFromSrgbChannel(clampChannel(rgb.r) / 255)
  const g = linearFromSrgbChannel(clampChannel(rgb.g) / 255)
  const b = linearFromSrgbChannel(clampChannel(rgb.b) / 255)

  let out: readonly [number, number, number]
  if (type === 'achromatopsia') {
    const lum = luminanceFromLinear(r, g, b)
    out = [lum, lum, lum]
  } else {
    const model = BRETTEL[type]
    const side = model.plane[0] * r + model.plane[1] * g + model.plane[2] * b
    out = applyMatrix(side >= 0 ? model.first : model.second, r, g, b)
  }
  return {
    r: clampChannel(srgbFromLinearChannel(out[0]) * 255),
    g: clampChannel(srgbFromLinearChannel(out[1]) * 255),
    b: clampChannel(srgbFromLinearChannel(out[2]) * 255)
  }
}

function distance(first: Rgb, second: Rgb): number {
  const dr = first.r - second.r
  const dg = first.g - second.g
  const db = first.b - second.b
  return dr * dr + dg * dg + db * db
}

/**
 * Most frequent colours of an image, as a small palette.
 *
 * The colour space is sampled into coarse buckets for the starting points, then
 * refined with a fixed number of k-means rounds. Everything is deterministic:
 * the same pixels always produce the same palette, which a random seeding would
 * not guarantee and which would make the tests meaningless.
 */
export function paletteFromPixels(
  data: Uint8ClampedArray,
  options: { count?: number; step?: number; rounds?: number } = {}
): Rgb[] {
  const count = Math.min(MAX_PALETTE_COLORS, Math.max(1, Math.round(options.count ?? 6)))
  const step = Math.max(4, Math.floor(options.step ?? 4))
  const rounds = Math.max(1, Math.round(options.rounds ?? 6))

  const samples: Rgb[] = []
  for (let index = 0; index + 3 < data.length; index += 4 * step) {
    const alpha = data[index + 3] ?? 255
    if (alpha < 8) continue
    samples.push({ r: data[index] ?? 0, g: data[index + 1] ?? 0, b: data[index + 2] ?? 0 })
  }
  if (!samples.length) return []

  // Coarse histogram (5 bits per channel) decides the starting centres.
  const buckets = new Map<number, { total: number; r: number; g: number; b: number }>()
  for (const sample of samples) {
    const key = ((sample.r >> 3) << 10) | ((sample.g >> 3) << 5) | (sample.b >> 3)
    const entry = buckets.get(key)
    if (entry) {
      entry.total += 1
      entry.r += sample.r
      entry.g += sample.g
      entry.b += sample.b
    } else {
      buckets.set(key, { total: 1, r: sample.r, g: sample.g, b: sample.b })
    }
  }
  const seeds = [...buckets.values()]
    .sort((left, right) => right.total - left.total)
    .slice(0, count)
    .map((entry) => ({ r: entry.r / entry.total, g: entry.g / entry.total, b: entry.b / entry.total }))

  let centres = seeds
  let assignments = new Array<number>(samples.length).fill(0)
  for (let round = 0; round < rounds; round += 1) {
    const totals = centres.map(() => ({ count: 0, r: 0, g: 0, b: 0 }))
    assignments = samples.map((sample) => {
      let best = 0
      let bestDistance = Number.POSITIVE_INFINITY
      centres.forEach((centre, centreIndex) => {
        const current = distance(sample, { r: centre.r, g: centre.g, b: centre.b })
        if (current < bestDistance) {
          bestDistance = current
          best = centreIndex
        }
      })
      const bucket = totals[best]
      if (bucket) {
        bucket.count += 1
        bucket.r += sample.r
        bucket.g += sample.g
        bucket.b += sample.b
      }
      return best
    })
    centres = totals.map((total, index) => {
      if (!total.count) return centres[index] ?? { r: 0, g: 0, b: 0 }
      return { r: total.r / total.count, g: total.g / total.count, b: total.b / total.count }
    })
  }

  const share = centres.map(() => 0)
  assignments.forEach((centre) => { share[centre] = (share[centre] ?? 0) + 1 })
  return centres
    .map((centre, index) => ({ rgb: { r: clampChannel(centre.r), g: clampChannel(centre.g), b: clampChannel(centre.b) }, share: share[index] ?? 0 }))
    .filter((entry) => entry.share > 0)
    .sort((left, right) => right.share - left.share)
    .map((entry) => entry.rgb)
}

/**
 * The same colour set with every dichromacy simulation applied, so a palette can
 * be checked for pairs that collapse into each other.
 */
export function cvdRows(colors: readonly Rgb[]): { color: Rgb; simulations: { type: CvdType; color: Rgb }[] }[] {
  return colors.map((color) => ({
    color,
    simulations: CVD_TYPES.map((type) => ({ type, color: simulateCvd(color, type) }))
  }))
}
