/**
 * Katalogtexte eines Werkzeugs — Titel, Kurztext und Schlagwörter.
 *
 * **Sie stehen im Suchpaket, nicht im Textpaket** (Entscheidung 2026-10-05). Grund: Karten,
 * Werkzeugschublade und Suiten-Seiten zeigen sie, laden aber die Werkzeugtexte nicht — die kommen
 * erst auf einer Werkzeugroute. Wer sie über `t(tool.titleKey)` liest, bekommt außerhalb einer
 * Werkzeugroute den Schlüsselnamen zu sehen (im Browserbeleg gefunden: 22 Stellen auf Startseite
 * und Suiten-Seite).
 *
 * Der Rückfall auf `t(...)` bleibt, solange der Suchindex noch nicht geladen ist — dann steht dort
 * wenigstens ein Text und kein leeres Feld.
 */
import type { ToolManifest, ToolSearchEntry } from '@commietools/core'

export interface ToolTexts {
  readonly title: string
  readonly summary: string
  readonly tags: readonly string[]
}

/** Der Text eines Werkzeugs aus dem geladenen Suchindex, mit Rückfall auf die Sprachschlüssel. */
export function toolTextsFrom(
  index: readonly ToolSearchEntry[],
  tool: ToolManifest,
  locale: string,
  t: (key: string) => string
): ToolTexts {
  const text = index.find((candidate) => candidate.id === tool.id)?.locales[locale]
  return {
    title: text?.title ?? t(tool.titleKey),
    summary: text?.summary ?? t(tool.summaryKey),
    tags: text?.tags ?? []
  }
}