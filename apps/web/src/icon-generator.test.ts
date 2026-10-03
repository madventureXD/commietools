import { describe, expect, it } from 'vitest'
import {
  ICO_MAX_SIZE,
  IconError,
  buildIco,
  buildManifestIcons,
  icoSizes,
  normalizeSizes,
  planIcon,
  readPngSize
} from '@commietools/tools'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/**
 * Minimal PNG: signature plus an IHDR chunk, which is all the size reader and
 * the container builder look at. The CRC stays zero, so these bytes are not a
 * decodable image — the browser check covers the real thing.
 */
function pngBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(29)
  const view = new DataView(bytes.buffer)
  bytes.set(PNG_SIGNATURE, 0)
  view.setUint32(8, 13, false)
  bytes.set([0x49, 0x48, 0x44, 0x52], 12) // IHDR
  view.setUint32(16, width, false)
  view.setUint32(20, height, false)
  view.setUint8(24, 8) // bit depth
  view.setUint8(25, 6) // colour type: RGBA
  return bytes
}

describe('size list', () => {
  it('keeps requested sizes whole, unique and ascending', () => {
    expect(normalizeSizes([512, 16, 16, 32.4, 0, -3])).toEqual([16, 32, 512])
    expect(normalizeSizes([])).toEqual([])
  })

  it('drops sizes an ICO directory cannot describe', () => {
    expect(icoSizes([16, 256, 512])).toEqual([16, 256])
    expect(ICO_MAX_SIZE).toBe(256)
  })
})

describe('square geometry', () => {
  const landscape = { width: 4000, height: 3000 }

  it('covers the square with the image and lets it stick out', () => {
    const plan = planIcon(landscape, 512, { fit: 'cover' })
    expect(plan.draw.width).toBeGreaterThanOrEqual(512)
    expect(plan.draw.height).toBe(512)
    expect(plan.draw.x).toBeLessThanOrEqual(0)
    expect(plan.draw.y).toBe(0)
  })

  it('fits the image inside the square and leaves the rest over', () => {
    const plan = planIcon(landscape, 512, { fit: 'contain' })
    expect(plan.draw.width).toBe(512)
    expect(plan.draw.height).toBe(384)
    expect(plan.draw.x).toBe(0)
    expect(plan.draw.y).toBe(64)
  })

  it('treats a square source the same way in both modes', () => {
    const cover = planIcon({ width: 800, height: 800 }, 64, { fit: 'cover' })
    const contain = planIcon({ width: 800, height: 800 }, 64, { fit: 'contain' })
    expect(cover.draw).toEqual({ x: 0, y: 0, width: 64, height: 64 })
    expect(contain.draw).toEqual(cover.draw)
  })

  it('keeps the artwork inside the safe zone for a maskable icon', () => {
    const plan = planIcon(landscape, 512, { fit: 'contain', contentScale: 0.8 })
    expect(plan.draw.width).toBeLessThanOrEqual(512 * 0.8 + 1)
    expect(plan.draw.height).toBeLessThanOrEqual(512 * 0.8 + 1)
    expect(plan.draw.x).toBeGreaterThan(0)
    expect(plan.draw.y).toBeGreaterThan(0)
  })

  it('clamps a content scale that would erase or overflow the artwork', () => {
    expect(planIcon(landscape, 512, { contentScale: 5 }).contentScale).toBe(1)
    expect(planIcon(landscape, 512, { contentScale: 0 }).contentScale).toBe(0.1)
    expect(planIcon(landscape, 512, { contentScale: Number.NaN }).contentScale).toBe(1)
  })

  it('survives empty input without producing a zero-sized rectangle', () => {
    const plan = planIcon({ width: 0, height: 0 }, 0)
    expect(plan.size).toBe(1)
    expect(plan.draw.width).toBeGreaterThan(0)
    expect(plan.draw.height).toBeGreaterThan(0)
  })
})

describe('PNG header', () => {
  it('reads width and height from the IHDR chunk', () => {
    expect(readPngSize(pngBytes(512, 256))).toEqual({ width: 512, height: 256 })
  })

  it('rejects bytes that are not a PNG', () => {
    expect(readPngSize(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBeNull()
    expect(readPngSize(new Uint8Array(4))).toBeNull()
    expect(readPngSize(pngBytes(0, 32))).toBeNull()
  })
})

describe('ICO container', () => {
  it('writes a directory followed by the image data', () => {
    const small = pngBytes(16, 16)
    const large = pngBytes(256, 256)
    const ico = buildIco([small, large])
    const view = new DataView(ico.buffer)

    expect(view.getUint16(0, true)).toBe(0) // reserved
    expect(view.getUint16(2, true)).toBe(1) // icon, not cursor
    expect(view.getUint16(4, true)).toBe(2)

    // First entry: 16 × 16.
    expect(ico[6]).toBe(16)
    expect(ico[7]).toBe(16)
    expect(ico[8]).toBe(0) // colour count
    expect(ico[9]).toBe(0) // reserved
    expect(view.getUint16(10, true)).toBe(1) // planes
    expect(view.getUint16(12, true)).toBe(32) // bits per pixel
    expect(view.getUint32(14, true)).toBe(small.byteLength)
    expect(view.getUint32(18, true)).toBe(6 + 16 * 2)

    // Second entry: 256 is stored as 0, the largest edge a byte can express.
    expect(ico[22]).toBe(0)
    expect(ico[23]).toBe(0)
    expect(view.getUint32(34, true)).toBe(6 + 16 * 2 + small.byteLength)

    expect(ico.slice(6 + 16 * 2, 6 + 16 * 2 + small.byteLength)).toEqual(small)
    expect(ico.byteLength).toBe(6 + 16 * 2 + small.byteLength + large.byteLength)
  })

  it('refuses to write a file it cannot describe', () => {
    expect(() => buildIco([])).toThrow(IconError)
    expect(() => buildIco([])).toThrow('no-frames')
    expect(() => buildIco([new Uint8Array([1, 2, 3])])).toThrow('not-a-png')
    expect(() => buildIco([pngBytes(300, 300)])).toThrow('unsupported-size')
  })
})

describe('manifest entry', () => {
  it('states size, type and purpose for every icon', () => {
    const text = buildManifestIcons([
      { file: 'icon-192.png', size: 192 },
      { file: 'icon-maskable-512.png', size: 512, purpose: 'maskable' }
    ])
    expect(JSON.parse(text)).toEqual([
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ])
  })
})
