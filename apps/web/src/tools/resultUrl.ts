import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Ergebnis-Adresse für **eine** Ausgabe — die eine Stelle, an der eine Objekt-Adresse entsteht und
 * wieder freigegeben wird.
 *
 * Angelegt im Durchzug der QM-Stufe R9 (Karte **M4-009**, „Ergebnis-URLs"). Vorher gab es zwei
 * Implementierungen mit **verschiedenem Vertrag**: `useDownload(bytes)` in `pdfUi.tsx` (deklarativ,
 * Adresse folgt den Bytes) und `usePdfDownload()` in `PdfInteractiveTools.tsx` (imperativ, Setter
 * je Auftrag). Beide erzeugten und widerriefen Adressen selbst — und genau dort saß in R3 das
 * Leck (M4-006: **1200** nicht freigegebene Adressen beim Verlassen während eines Auftrags).
 *
 * Der imperative Vertrag deckt beide Fälle ab: der Aufrufer setzt, wann er will; der Hook gibt die
 * **vorige** Adresse frei, sobald eine neue gesetzt wird, und die **aktuelle** beim Aushängen.
 * `useDownload` in `pdfUi.tsx` ist darauf aufgebaut — es gibt nur noch **eine** Umsetzung.
 *
 * Bewusst **nicht** zusammengelegt: die Werkzeuge mit **mehreren** gleichzeitigen Ausgaben
 * (PDF-Teiler, PDF zu Bildern …). Dort gehört eine Liste von Adressen verwaltet; ein anderer
 * Vertrag ist kein Duplikat („Nur gleiche Verträge bündeln", Karte M4-009).
 */
export function useResultUrl(mimeType: string) {
  const [url, setUrl] = useState('')
  const owner = useRef('')
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (owner.current) URL.revokeObjectURL(owner.current)
      owner.current = ''
    }
  }, [])
  const set = useCallback((bytes?: Uint8Array | null) => {
    if (!mounted.current) return
    // Creation precedes replacement so a failed allocation preserves the old result.
    const next = bytes ? URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: mimeType })) : ''
    if (owner.current) URL.revokeObjectURL(owner.current)
    owner.current = next
    setUrl(next)
  }, [mimeType])
  return [url, set] as const
}
