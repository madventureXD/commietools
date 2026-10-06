/**
 * JSON formatieren — reine **Layouttransformation** (Karte M6-001).
 *
 * Warum nicht mehr `JSON.parse` + `JSON.stringify`: Dieser Weg wandelt den Text in Werte und
 * schreibt sie neu. Dabei gehen allein die Zahllexeme verloren — `9007199254740993` wird zu
 * `9007199254740992`, `1e309` zu `null`, `1.2300` zu `1.23`, `-0` zu `0`. Die Eingabe war gültiges
 * JSON, die Ausgabe war ein **anderes Dokument**, und angezeigt wurde kein Hinweis darauf.
 *
 * Deshalb arbeitet dieses Modul wie ein Editor: `jsonc-parser` (MIT, ohne Abhängigkeiten) liest
 * den Text, liefert **Textedits** (Einrückung), und `applyEdits` setzt sie auf den **Originaltext**
 * an. Das parse-Ergebnis und die daraus gewonnenen Zahlenwerte werden nie serialisiert — nur die
 * Lage der Zeichen ändert sich. Schlüsselreihenfolge, Zahllexeme, Escapes und doppelte Schlüssel
 * bleiben damit erhalten.
 *
 * Die Prüfung ist streng: Kommentare und ein abschließendes Komma werden **abgelehnt** (JSON, nicht
 * JSONC), und die Fehlerliste wird zwingend ausgewertet — kein stilles `null`. Zu jedem Fehler
 * gehört seine Stelle als Zeile und Spalte, damit die Oberfläche sie benennen kann.
 *
 * Messung 2026-10-06 (`work/jsonc-messung.mjs`, esbuild + gzip -9): der volle Satz kostet
 * **4 506 B gzip**, die reine Validierung 3 290 B. Das Modul liegt deshalb **nicht** im
 * Paket-Einstieg (`index.ts`), sondern hinter dem eigenen Unterpfad
 * `@commietools/tools/developer/json-formatter` — sonst läge es im Startbündel.
 */
import { applyEdits, format as computeFormatEdits, parse, type ParseError } from 'jsonc-parser'

export interface JsonErrorPosition {
  /** 1-basiert. */
  readonly line: number
  /** 1-basiert. */
  readonly column: number
}

export interface JsonFormatResult {
  readonly value: string
  /** Fehlerklasse für den Sprachkatalog — `null`, wenn die Eingabe gültig war. */
  readonly error: string | null
  /** Stelle des **ersten** Fehlers; `null`, wenn kein Fehler vorliegt. */
  readonly errorAt: JsonErrorPosition | null
}

/** Rechnet einen Zeichenversatz in Zeile und Spalte um — beide 1-basiert. */
function positionOf(text: string, offset: number): JsonErrorPosition {
  const clamped = Math.min(Math.max(offset, 0), text.length)
  const before = text.slice(0, clamped)
  const line = before.split('\n').length
  const column = clamped - before.lastIndexOf('\n')
  return { line, column }
}

/**
 * Formatiert JSON durch Textedits. Ungültige Eingabe kommt **unverändert** zurück — die Anzeige
 * zeigt den Originaltext und dazu die Fehlerstelle, statt eine halb reparierte Fassung anzubieten.
 */
export function formatJson(input: string, indentation = 2): JsonFormatResult {
  if (!input.trim()) return { value: '', error: null, errorAt: null }

  const errors: ParseError[] = []
  // `disallowComments: true` und `allowTrailingComma: false`: JSON, nicht JSONC. `allowEmptyContent`
  // bleibt aus — leere Eingabe ist oben schon abgefangen und soll kein zweites Mal durchlaufen.
  parse(input, errors, { disallowComments: true, allowTrailingComma: false })
  const first = errors[0]
  if (first) {
    return { value: input, error: 'invalid-json', errorAt: positionOf(input, first.offset) }
  }

  const edits = computeFormatEdits(input, undefined, { tabSize: indentation, insertSpaces: true, eol: '\n' })
  return { value: applyEdits(input, edits), error: null, errorAt: null }
}
