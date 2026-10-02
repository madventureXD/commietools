import { describe, expect, it } from 'vitest'
import { MAX_EDGE, clampCrop, cropBoxFraction, fitScale, normalizeTurns, orientedSize, planResize } from '@commietools/tools'

describe('orientation', () => {
  it('swaps the edges on odd quarter turns only', () => {
    expect(orientedSize({ width: 4000, height: 3000 }, 0)).toEqual({ width: 4000, height: 3000 })
    expect(orientedSize({ width: 4000, height: 3000 }, 1)).toEqual({ width: 3000, height: 4000 })
    expect(orientedSize({ width: 4000, height: 3000 }, 2)).toEqual({ width: 4000, height: 3000 })
    expect(orientedSize({ width: 4000, height: 3000 }, 3)).toEqual({ width: 3000, height: 4000 })
  })

  it('normalises turn counts instead of trusting them', () => {
    expect(normalizeTurns(4)).toBe(0)
    expect(normalizeTurns(5)).toBe(1)
    expect(normalizeTurns(-1)).toBe(3)
    expect(normalizeTurns(undefined)).toBe(0)
  })
})

describe('crop', () => {
  it('keeps the whole image when no crop is given', () => {
    expect(clampCrop(null, { width: 800, height: 600 })).toEqual({ x: 0, y: 0, width: 800, height: 600 })
  })

  it('accepts a zero offset instead of shifting the crop', () => {
    expect(clampCrop({ x: 0, y: 0, width: 400, height: 300 }, { width: 800, height: 600 })).toEqual({ x: 0, y: 0, width: 400, height: 300 })
    expect(clampCrop({ x: 100, y: 50, width: 400, height: 300 }, { width: 800, height: 600 })).toEqual({ x: 100, y: 50, width: 400, height: 300 })
  })

  it('moves a crop that would stick out back inside the image', () => {
    expect(clampCrop({ x: 700, y: 500, width: 400, height: 300 }, { width: 800, height: 600 })).toEqual({ x: 400, y: 300, width: 400, height: 300 })
  })

  it('shrinks a crop that is larger than the image', () => {
    expect(clampCrop({ x: 0, y: 0, width: 2000, height: 2000 }, { width: 800, height: 600 })).toEqual({ x: 0, y: 0, width: 800, height: 600 })
  })

  it('never produces a zero-sized crop', () => {
    expect(clampCrop({ x: 0, y: 0, width: 0, height: 0 }, { width: 800, height: 600 })).toEqual({ x: 0, y: 0, width: 1, height: 1 })
  })
})

describe('target size', () => {
  const source = { width: 4000, height: 3000 }

  it('scales by percent, rounded to whole pixels', () => {
    const plan = planResize(source, { mode: 'percent', percent: 50 })
    expect(plan.target).toEqual({ width: 2000, height: 1500 })
    expect(plan.scale).toBe(0.5)
  })

  it('derives the second edge from the first when the aspect ratio is locked', () => {
    expect(planResize(source, { mode: 'dimensions', width: 800, lockAspect: true }).target).toEqual({ width: 800, height: 600 })
    expect(planResize(source, { mode: 'dimensions', height: 600, lockAspect: true }).target).toEqual({ width: 800, height: 600 })
  })

  it('keeps the aspect ratio of the crop, not of the source', () => {
    const plan = planResize(source, { mode: 'dimensions', width: 500, lockAspect: true, crop: { x: 0, y: 0, width: 1000, height: 1000 } })
    expect(plan.target).toEqual({ width: 500, height: 500 })
  })

  it('stretches when the aspect ratio is unlocked', () => {
    expect(planResize(source, { mode: 'dimensions', width: 800, height: 800, lockAspect: false }).target).toEqual({ width: 800, height: 800 })
  })

  it('falls back to the cropped size when no edge is given', () => {
    expect(planResize(source, { mode: 'dimensions' }).target).toEqual({ width: 4000, height: 3000 })
  })

  it('reports a target that had to be limited', () => {
    const plan = planResize(source, { mode: 'dimensions', width: 30000, lockAspect: false })
    expect(plan.target.width).toBe(MAX_EDGE)
    expect(plan.clamped).toBe(true)
    expect(planResize(source, { mode: 'dimensions', width: 1200, lockAspect: true }).clamped).toBe(false)
  })

  it('survives empty and nonsensical input', () => {
    const plan = planResize({ width: 0, height: 0 }, { mode: 'dimensions', width: Number.NaN, height: -5 })
    expect(plan.source).toEqual({ width: 1, height: 1 })
    expect(plan.target).toEqual({ width: 1, height: 1 })
    expect(planResize(source, { mode: 'percent', percent: 0 }).target).toEqual({ width: 4000, height: 3000 })
  })

  it('crops before scaling, so the crop decides the result size', () => {
    const plan = planResize(source, { mode: 'dimensions', width: 400, lockAspect: true, crop: { x: 100, y: 100, width: 2000, height: 1000 } })
    expect(plan.crop).toEqual({ x: 100, y: 100, width: 2000, height: 1000 })
    expect(plan.target).toEqual({ width: 400, height: 200 })
  })
})

describe('preview geometry', () => {
  it('fits an image into a box without enlarging it', () => {
    expect(fitScale({ width: 400, height: 400 }, { width: 4000, height: 2000 })).toBe(0.1)
    expect(fitScale({ width: 400, height: 400 }, { width: 100, height: 50 })).toBe(1)
    expect(fitScale({ width: 0, height: 400 }, { width: 100, height: 50 })).toBe(1)
  })

  it('places the crop frame where the numbers say, as fractions of the image', () => {
    const plan = planResize({ width: 1000, height: 800 }, { mode: 'percent', percent: 50, crop: { x: 100, y: 50, width: 500, height: 400 } })
    expect(cropBoxFraction(plan)).toEqual({ x: 0.1, y: 0.0625, width: 0.5, height: 0.5 })
  })

  it('describes the whole image as the full frame', () => {
    const plan = planResize({ width: 1000, height: 800 }, { mode: 'percent', percent: 50 })
    expect(cropBoxFraction(plan)).toEqual({ x: 0, y: 0, width: 1, height: 1 })
  })
})
