import { describe, expect, it } from 'vitest'
import { loadToolSearchIndex, toolManifests } from '@commietools/tools'
import { loadToolTexts } from '@commietools/tools/text-loaders'
import { createTranslator } from '@commietools/i18n'

/**
 * Wächter für die Trennung von Suchpaket und Werkzeugtextpaket (Aufteilung 2026-10-05).
 *
 * **Der Fehler, den diese Prüfung festhält:** `title`, `summary`, `description` und `terms` liegen
 * im **Suchpaket**, nicht im Textpaket des Werkzeugs. Werkzeugoberflächen geben ihren Kurztext aber
 * über `t('tool.<x>.summary')` aus — ohne die Katalogschlüssel im Übersetzer der Route stand dort
 * der Schlüsselname (im Beleg zu „Fliesen, Kleber und Fugenmörtel" gesehen, zwölf Werkzeuge
 * betroffen). `App.tsx` hängt deshalb die vier Schlüssel des aktiven Werkzeugs in den Übersetzer;
 * hier wird dieselbe Zusammenstellung nachgebildet, damit die Mechanik und die Trennung der Pakete
 * nicht stillschweigend auseinanderlaufen.
 *
 * Die Verdrahtung in `App.tsx` selbst belegt der Browserlauf
 * (`work/sprachpaket-funktionspruefung.cjs`, Abschnitt „Werkzeugrouten").
 */
const LOCALES = ['de', 'en'] as const

describe('Katalogschlüssel im Übersetzer der Werkzeugroute', () => {
  it('liefert Titel und Kurztext aus dem Suchpaket und nicht aus dem Textpaket', async () => {
    for (const locale of LOCALES) {
      const index = await loadToolSearchIndex(locale)
      for (const tool of toolManifests) {
        const entry = index.find((candidate) => candidate.id === tool.id)
        expect(entry, `${tool.id} fehlt im Suchpaket ${locale}`).toBeTruthy()
        const text = entry?.locales[locale]
        expect(text, `${tool.id} hat keine Texte in ${locale}`).toBeTruthy()
        if (!text) continue

        // 1 · Die Trennung selbst: das Werkzeugtextpaket führt diese Schlüssel nicht.
        const toolMessages = await loadToolTexts(locale, tool.id)
        const ownMessages = toolMessages[locale] ?? {}
        expect(ownMessages[tool.summaryKey], `${tool.id}/${locale}: summary darf nicht im Textpaket stehen`).toBeUndefined()
        expect(ownMessages[tool.descriptionKey], `${tool.id}/${locale}: description darf nicht im Textpaket stehen`).toBeUndefined()

        // 2 · Mit den Katalogschlüsseln im Übersetzer lösen sie sich auf — kein Schlüsselname.
        const catalogueKeys: Record<string, Record<string, string>> = {
          [locale]: {
            [tool.titleKey]: text.title,
            [tool.summaryKey]: text.summary,
            [tool.descriptionKey]: text.description,
            [tool.termsKey]: [...text.terms, ...text.tags].join(', ')
          }
        }
        const t = createTranslator(locale, [toolMessages, catalogueKeys])
        expect(t(tool.titleKey), `${tool.id}/${locale}: Titel`).toBe(text.title)
        expect(t(tool.summaryKey), `${tool.id}/${locale}: Kurztext`).toBe(text.summary)
        const firstTag = text.tags[0]
        expect(t(tool.descriptionKey), `${tool.id}/${locale}: Beschreibung`).toBe(text.description)
        if (firstTag) expect(t(tool.termsKey), `${tool.id}/${locale}: Begriffe`).toContain(firstTag)
      }
    }
  })

  it('hält mindestens ein Werkzeug mit Kurztext im Rumpf fest', () => {
    // Werkzeuge, die ihren Katalog-Kurztext in der Oberfläche ausgeben, hängen an dieser Zusage.
    // Fällt eines davon weg, ist das in Ordnung — dann gehört diese Liste angepasst.
    const tools = toolManifests.map((tool) => tool.id)
    expect(tools).toContain('tiles')
    expect(tools).toContain('concrete')
  })
})
