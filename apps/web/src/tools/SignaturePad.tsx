import { useEffect, useRef, type PointerEvent } from 'react'
import { Button } from '@commietools/ui'

/**
 * Zeichenfläche für Unterschriften — **ein** gemeinsamer Baustein.
 *
 * Vorher lag dieselbe Umsetzung in `PdfPlacementTools.tsx`; das Übergabeprotokoll braucht sie
 * ebenfalls. Statt einer zweiten Fassung liegt sie jetzt hier und wird von beiden Werkzeugen
 * benutzt. Die Zeichenfläche ist bewusst größer als die Anzeige (720×240) und die Zeigerposition
 * wird über das Verhältnis der Anzeigegröße umgerechnet — sonst wandert der Strich bei anderer
 * Fensterbreite neben dem Finger.
 */

/** Eine Unterschrift als Bild, wie sie die PDF-Erzeuger erwarten. */
export interface SignatureSource {
  readonly bytes: Uint8Array
  readonly mimeType: 'image/png' | 'image/jpeg'
  readonly name: string
}

/** Zeichenfläche als PNG-Bytes auslesen. */
export function canvasPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (!blob) { reject(new Error('PNG export failed')); return }
    blob.arrayBuffer().then((bytes) => resolve(new Uint8Array(bytes)), reject)
  }, 'image/png'))
}

export function SignaturePad({ onChange, onPendingChange, clearLabel, label, width = 720, height = 240 }: {
  readonly onChange: (signature: SignatureSource | null) => void
  readonly onPendingChange?: (pending: boolean) => void
  readonly clearLabel: string
  readonly label: string
  readonly width?: number
  readonly height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const generation = useRef(0)
  useEffect(() => () => { generation.current += 1 }, [])
  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!; const context = canvas.getContext('2d')!; const at = point(event)
    generation.current += 1; onPendingChange?.(true)
    drawing.current = true; canvas.setPointerCapture(event.pointerId); context.beginPath(); context.moveTo(at.x, at.y)
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const context = canvasRef.current!.getContext('2d')!; const at = point(event)
    context.lineWidth = 4; context.lineCap = 'round'; context.lineJoin = 'round'; context.strokeStyle = '#17181b'; context.lineTo(at.x, at.y); context.stroke()
  }
  async function end(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    drawing.current = false; canvasRef.current!.releasePointerCapture(event.pointerId)
    const owner = generation.current
    try {
      const bytes = await canvasPng(canvasRef.current!)
      if (owner === generation.current) onChange({ bytes, mimeType: 'image/png', name: label })
    } catch {
      if (owner === generation.current) onChange(null)
    } finally {
      if (owner === generation.current) onPendingChange?.(false)
    }
  }
  function clear() { generation.current += 1; drawing.current = false; const canvas = canvasRef.current!; canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height); onChange(null); onPendingChange?.(false) }
  return <div className="signature-pad"><canvas ref={canvasRef} width={width} height={height} aria-label={label} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} /><Button onClick={clear}>{clearLabel}</Button></div>
}
