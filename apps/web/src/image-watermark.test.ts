import { describe, expect, it } from 'vitest'
import {
  MIN_SCALE,
  WATERMARK_ANCHORS,
  clampOpacity,
  clampScale,
  clampSpacing,
  markSize,
  normalizeRotation,
  placeWatermark,
  type WatermarkBox,
  type WatermarkOptions
} from '@commietools/tools'

const source = { width: 1000, height: 500 }
const mark = { width: 200, height: 100 }

function options(overrides: Partial<WatermarkOptions> = {}): WatermarkOptions {
  return { anchor: 'bottom-right', scale: 0.2, margin: 0.1, rotation: 0, tiled: false, spacing: 0.5, ...overrides }
}

function centre(box: WatermarkBox): { x: number; y: number } {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function distanceToImage(point: { x: number; y: number }, size: { width: number; height: number }): number {
  const dx = point.x < 0 ? -point.x : point.x > size.width ? point.x - size.width : 0
  const dy = point.y < 0 ? -point.y : point.y > size.height ? point.y - size.height : 0
  return Math.sqrt(dx * dx + dy * dy)
}

describe('input guards', () => {
  it('keeps opacity, scale and spacing inside usable bounds', () => {
    expect(clampOpacity(1.4)).toBe(1)
    expect(clampOpacity(-2)).toBe(0)
    expect(clampOpacity(undefined)).toBe(1)
    expect(clampScale(0)).toBe(MIN_SCALE)
    expect(clampScale(5)).toBe(1)
    expect(clampSpacing(-1)).toBe(0)
    expect(clampSpacing(99)).toBe(4)
  })

  it('normalises rotation to a half turn', () => {
    expect(normalizeRotation(0)).toBe(0)
    expect(normalizeRotation(90)).toBe(90)
    expect(normalizeRotation(181)).toBe(-179)
    expect(normalizeRotation(-180)).toBe(180)
    expect(normalizeRotation(360)).toBe(0)
    expect(normalizeRotation(Number.NaN)).toBe(0)
  })
})

describe('mark size', () => {
  it('measures the mark against the shorter edge and keeps its shape', () => {
    // Short edge 500, scale 20 % → 100 px wide, half as tall as it is wide.
    expect(markSize(source, mark, 0.2)).toEqual({ width: 100, height: 50 })
  })

  it('falls back to a square when the mark cannot be measured', () => {
    expect(markSize(source, { width: 0, height: 0 }, 0.2)).toEqual({ width: 100, height: 100 })
  })

  it('never produces a zero-sized mark', () => {
    const size = markSize({ width: 0, height: 0 }, mark, 0)
    expect(size.width).toBeGreaterThan(0)
    expect(size.height).toBeGreaterThan(0)
  })
})

describe('single placement', () => {
  it('puts the mark in the named corner with the edge distance', () => {
    // gap = 10 % of the short edge (500) = 50 px; mark is 100 × 50.
    expect(placeWatermark(source, mark, options({ anchor: 'top-left' }))[0]).toEqual({ x: 50, y: 50, width: 100, height: 50 })
    expect(placeWatermark(source, mark, options({ anchor: 'bottom-right' }))[0]).toEqual({ x: 850, y: 400, width: 100, height: 50 })
    expect(placeWatermark(source, mark, options({ anchor: 'top-right' }))[0]).toEqual({ x: 850, y: 50, width: 100, height: 50 })
  })

  it('centres the mark on an edge or in the middle', () => {
    expect(placeWatermark(source, mark, options({ anchor: 'center' }))[0]).toEqual({ x: 450, y: 225, width: 100, height: 50 })
    expect(placeWatermark(source, mark, options({ anchor: 'top' }))[0]).toEqual({ x: 450, y: 50, width: 100, height: 50 })
    expect(placeWatermark(source, mark, options({ anchor: 'left' }))[0]).toEqual({ x: 50, y: 225, width: 100, height: 50 })
  })

  it('returns exactly one box and knows every anchor', () => {
    expect(WATERMARK_ANCHORS).toHaveLength(9)
    for (const anchor of WATERMARK_ANCHORS) {
      expect(placeWatermark(source, mark, options({ anchor })), anchor).toHaveLength(1)
    }
  })

  it('does not let a large edge distance push the mark off the image', () => {
    const [box] = placeWatermark({ width: 100, height: 100 }, mark, options({ anchor: 'bottom-right', scale: 1, margin: 0.4 }))
    expect(box).toBeDefined()
    if (!box) return
    expect(box.x + box.width).toBeLessThanOrEqual(100)
    expect(box.y + box.height).toBeLessThanOrEqual(100)
  })
})

describe('pattern placement', () => {
  const square = { width: 300, height: 300 }
  const tile = { width: 100, height: 100 }
  // The scale refers to the image's short edge, so a 300 px image with a third
  // of that as the mark width yields 100 px tiles.
  const third = 1 / 3

  it('builds a grid over the whole image', () => {
    const boxes = placeWatermark(square, tile, options({ tiled: true, spacing: 0, scale: third }))
    expect(boxes.length).toBeGreaterThan(9)
    // Without rotation the grid stays square to the axes: every centre is a multiple of the step.
    for (const box of boxes) {
      const middle = centre(box)
      expect(Math.round(middle.x) % 100).toBe(0)
      expect(Math.round(middle.y) % 100).toBe(0)
    }
  })

  it('reaches every corner of the image', () => {
    const boxes = placeWatermark(square, tile, options({ tiled: true, spacing: 0, scale: third }))
    const corners = [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 0, y: 300 }, { x: 300, y: 300 }]
    for (const corner of corners) {
      const nearest = Math.min(...boxes.map((box) => {
        const middle = centre(box)
        return Math.hypot(middle.x - corner.x, middle.y - corner.y)
      }))
      expect(nearest).toBeLessThan(60)
    }
  })

  it('drops tiles that cannot touch the image', () => {
    const boxes = placeWatermark(square, tile, options({ tiled: true, spacing: 0.5, scale: third }))
    const size = markSize(square, tile, third)
    const radius = Math.hypot(size.width, size.height) / 2
    expect(boxes.length).toBeGreaterThan(0)
    for (const box of boxes) {
      expect(distanceToImage(centre(box), square)).toBeLessThanOrEqual(radius + 1)
    }
  })

  it('turns the grid with the mark', () => {
    const straight = placeWatermark(square, tile, options({ tiled: true, spacing: 0, scale: third, rotation: 0 }))
    const turned = placeWatermark(square, tile, options({ tiled: true, spacing: 0, scale: third, rotation: 30 }))
    const straightX = new Set(straight.map((box) => Math.round(centre(box).x)))
    const turnedX = new Set(turned.map((box) => Math.round(centre(box).x)))
    // A turned grid no longer lands on the same vertical lines.
    expect(turnedX.size).toBeGreaterThan(straightX.size)
  })

  it('still covers the whole image when turned', () => {
    const boxes = placeWatermark(square, tile, options({ tiled: true, spacing: 0, scale: third, rotation: -30 }))
    const corners = [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 0, y: 300 }, { x: 300, y: 300 }]
    for (const corner of corners) {
      const nearest = Math.min(...boxes.map((box) => {
        const middle = centre(box)
        return Math.hypot(middle.x - corner.x, middle.y - corner.y)
      }))
      expect(nearest).toBeLessThan(90)
    }
  })

  it('keeps the rows of a text pattern further apart than the glyph height', () => {
    // A wide, flat mark would otherwise stack rows at its own tiny height.
    const flat = { width: 200, height: 14 }
    const boxes = placeWatermark(square, flat, options({ tiled: true, spacing: 0, scale: 1 / 3 }))
    const rows = [...new Set(boxes.map((box) => Math.round(centre(box).y)))].sort((a, b) => a - b)
    expect(rows.length).toBeGreaterThan(1)
    const gaps = rows.slice(1).map((value, index) => value - (rows[index] ?? value))
    for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(40)
  })

  it('survives empty dimensions without returning nonsense', () => {
    const boxes = placeWatermark({ width: 0, height: 0 }, mark, options({ tiled: true }))
    expect(Array.isArray(boxes)).toBe(true)
    for (const box of boxes) {
      expect(box.width).toBeGreaterThan(0)
      expect(box.height).toBeGreaterThan(0)
    }
  })
})
