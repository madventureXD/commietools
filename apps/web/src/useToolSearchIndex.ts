import { useEffect, useState } from 'react'
import { loadToolSearchIndex } from '@commietools/tools'
import type { ToolSearchEntry } from '@commietools/core'

/**
 * Ladezustand des **Werkzeug-Suchindex** — eine Stelle statt zweier.
 *
 * Angelegt im Durchzug der QM-Stufe R9 (Karte **M4-009**, „UI-Suchladezustand"). Katalogseite und
 * Werkzeugmenü trugen **wörtlich dieselbe** Ladezeile (gleicher Vertrag: Index, bereit, gescheitert
 * — mit Abbruch bei Sprachwechsel). Der Vertrag ist damit kein Duplikat mehr, sondern eine Quelle.
 *
 * Der Abbruch bei Sprachwechsel bleibt Teil des Vertrags: eine späte Antwort einer **alten** Sprache
 * darf die neue nicht überschreiben (Fehlerweg aus R3, Karte M4-004).
 */
export function useToolSearchIndex(locale: string) {
  const [index, setIndex] = useState<readonly ToolSearchEntry[]>([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let current = true
    setReady(false)
    setFailed(false)
    void loadToolSearchIndex(locale as 'de' | 'en' | 'es').then(
      (loaded) => { if (current) { setIndex(loaded); setReady(true) } },
      () => { if (current) { setIndex([]); setReady(true); setFailed(true) } },
    )
    return () => { current = false }
  }, [locale])
  return { index, ready, failed } as const
}
