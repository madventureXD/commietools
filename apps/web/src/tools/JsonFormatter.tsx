/**
 * Werkzeugoberfläche „JSON formatieren" (Karte M6-001).
 *
 * Liegt als eigene Datei hinter `lazy()` in `App.tsx`, weil die Formatierung `jsonc-parser`
 * benutzt (+4 506 B gzip, gemessen 2026-10-06). Vorher stand dieses Werkzeug mit seiner Logik im
 * Startbündel — jede Nutzerin hätte die Bibliothek bei jedem Seitenaufruf mitgeladen, auch wenn sie
 * nie JSON formatiert. Die Datensparsamkeitsregel des Projekts verlangt, dass nur die Route lädt,
 * die das Werkzeug wirklich braucht.
 */
import { useMemo, useState } from 'react'
import { formatJson } from '@commietools/tools/developer/json-formatter'
import { TextArea } from './text-area'

type Translate = (key: string) => string

export function JsonFormatter({ t }: { t: Translate }) {
  const [text, setText] = useState('')
  const [indentation, setIndentation] = useState(2)
  const result = useMemo(() => formatJson(text, indentation), [text, indentation])

  return (
    <div className="stack">
      <div className="inline-field">
        <label htmlFor="indentation">{t('tool.jsonFormatter.indentation')}</label>
        <select id="indentation" value={indentation} onChange={(event) => setIndentation(Number(event.target.value))}>
          <option value="2">2</option>
          <option value="4">4</option>
        </select>
      </div>
      <div className="tool-grid">
        <TextArea id="json-input" label={t('tool.jsonFormatter.input')} value={text} onChange={setText} />
        <div>
          <TextArea id="json-result" label={t('tool.result')} value={result.value} readOnly />
          {result.error && (
            <p className="error" role="alert">
              {t('tool.jsonFormatter.invalid')}
              {/* Nur Wörter aus dem Sprachkatalog; im Code stehen allein Trennzeichen. */}
              {result.errorAt
                ? ` — ${t('tool.jsonFormatter.errorLine')} ${result.errorAt.line}, ${t('tool.jsonFormatter.errorColumn')} ${result.errorAt.column}`
                : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
