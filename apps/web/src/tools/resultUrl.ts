import { useEffect, useState } from 'react'

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
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  const set = (bytes?: Uint8Array | null) => {
    setUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return bytes ? URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: mimeType })) : ''
    })
  }
  return [url, set] as const
}
