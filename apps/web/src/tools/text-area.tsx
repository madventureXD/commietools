/**
 * Eingabefeld mit Beschriftung — von der Startseite (`App.tsx`) und den ausgelagerten Werkzeugen
 * gemeinsam genutzt. Eine zweite Abschrift in jeder Werkzeugdatei wäre genau die Mehrfachimplementierung,
 * die Karte M4-009 (R9) bemängelt.
 */
export function TextArea({
  label,
  value,
  onChange,
  readOnly = false,
  id
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  id?: string
}) {
  return (
    <div className="input-panel">
      <label htmlFor={id}>
        {label}
        <textarea id={id} value={value} onChange={(event) => onChange?.(event.target.value)} readOnly={readOnly} />
      </label>
    </div>
  )
}
