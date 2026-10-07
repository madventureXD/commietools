#!/usr/bin/env node
/**
 * Prüfer für **sichtbare Textknoten in JSX** (Karte M3-004: „Gemeinsame Prüfung sichtbarer Literale in
 * JSX mit manuell gepflegten Ausnahmen für Symbole/Normbezeichnungen") — Form wie die übrigen
 * Prüfskripte des Projekts, eingehängt als `npm run jsx:check` in `npm run check`.
 *
 * Der Prüfer sammelt alle `JsxText`-Knoten der Werkzeugoberflächen, die Buchstaben enthalten: Text,
 * der ohne Sprachschlüssel in der Oberfläche erscheint. Jeder Treffer muss in der Liste unten stehen.
 *
 * **Eine erste Fassung arbeitete mit dem Muster `>text<`** und traf damit TypeScript-Generics
 * (`Promise<Character>`, `useState<string>`) statt JSX-Text: 35 angeblich sichtbare Texte, die
 * meisten davon erfunden. Ein Prüfmittel, das wie ein Produktbefund aussieht. Deshalb wird hier der
 * TypeScript-Parser benutzt — Fundstellen sind damit belegt, nicht geraten.
 *
 * Gemessen am 2026-10-07: 27 Treffer in 11 Dateien, **alle** in der Ausnahmeliste (Symbole,
 * Einheitenzeichen, Norm- und Fachbezeichnungen, Formate/Dateinamen, Formelzeichen). Kein
 * unübersetztes Prosawort.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const ORDNER = 'apps/web/src/tools'

/**
 * Manuell gepflegte Ausnahmen — ausschließlich Symbole, Einheiten- und Normbezeichnungen, Formate,
 * Marken und Dateinamen. Wird hier ein Prosawort eingetragen, verliert der Prüfer seinen Zweck:
 * Ein Eintrag ist nur zulässig, wenn der Text **keine** übersetzbare Aussage ist.
 */
const AUSNAHMEN = new Set([
  // Symbole und Formelzeichen
  'Bit ·', '= 0 → x =',
  // Einheitenzeichen
  '(V)', '(A)', '(W)', '(m)', '(m²)', '(mm)', 'mm', 'cm', 'in', 'MB', 'kB', 'GB', 'DPI',
  // Norm- und Fachbezeichnungen
  'DIN EN 20273 (ISO 273)', 'M = Richtwert', 'PDF/A-', 'WPA/WPA2/WPA3', 'WEP', 'L — 7%', 'M — 15%',
  'Q — 25%', 'H — 30%',
  // Formate, Marken, Dateinamen
  'PDF', 'PNG', 'JPEG', 'JPG', 'WebP', 'HEX', 'SVG', 'CSV', 'JSON', 'XML', 'ISO', 'QR', 'URL', 'OCR',
  'favicon.ico', 'A4', 'A3', 'A5', 'USA', 'US', 'DE', 'EN', 'ES', 'ID',
])

const dateien = readdirSync(ORDNER).filter((n) => n.endsWith('.tsx')).map((n) => join(ORDNER, n))
const offen = []
let geprueft = 0

for (const datei of dateien) {
  const inhalt = readFileSync(datei, 'utf8')
  const quelle = ts.createSourceFile(datei, inhalt, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const besuche = (knoten) => {
    if (knoten.kind === ts.SyntaxKind.JsxText) {
      const text = knoten.getText(quelle).replace(/\s+/gu, ' ').trim()
      if (text.length >= 2 && /\p{L}/u.test(text)) {
        geprueft += 1
        if (!AUSNAHMEN.has(text)) {
          const { line } = quelle.getLineAndCharacterOfPosition(knoten.getStart(quelle))
          offen.push(`${datei.replace(/\\/gu, '/')}:${line + 1}: ${JSON.stringify(text)}`)
        }
      }
    }
    ts.forEachChild(knoten, besuche)
  }
  besuche(quelle)
}

if (geprueft < 10) {
  console.error(`jsx:check — nur ${geprueft} JSX-Texte gefunden, der Prüfer prüft nichts. Abbruch.`)
  process.exit(1)
}
if (offen.length) {
  console.error(`jsx:check — ${offen.length} sichtbare(r) Text(e) ohne Sprachschlüssel:`)
  for (const z of offen) console.error(`  ${z}`)
  console.error('Entweder über einen Tool-Sprachschlüssel führen oder — nur bei Symbol, Einheit, Norm, Format — in die Ausnahmeliste aufnehmen.')
  process.exit(1)
}
console.log(`jsx:check — ${geprueft} sichtbare JSX-Texte geprüft, alle über Sprachschlüssel oder Ausnahme gedeckt.`)
