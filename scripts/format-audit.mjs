#!/usr/bin/env node
/**
 * **Format-Prüfer** (Nachtrag zu Karte M3-010: „Werkzeugausgabe folgt dem Formatkontext").
 *
 * Meldet Zahlenformatierung, die nicht über den Anzeige-Kontext läuft:
 * - `Intl.NumberFormat(locale, …)` — die **Oberflächensprache** bestimmt dann das Zahlenformat;
 * - `Intl.NumberFormat(undefined, …)` — still am `navigator`;
 * - `toLocaleString()` / `toLocaleDateString()` **ohne Argument** — ebenfalls still am `navigator`.
 *
 * Erlaubt ist die Form `Intl.NumberFormat(anzeigeKontext(<sprache>).regionLocale, …)` bzw. die
 * Helfer aus `@commietools/tools`. **Technische Ausgaben** (JSON, CSS, CSV, Exportwerte mit
 * `useGrouping: false`) bleiben ausdrücklich erlaubt und stehen unten mit Begründung.
 *
 * Lauf: `npm run format:check` (hängt in `npm run check`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Begründete Ausnahmen: Datei + Muster im Text. Jeder Eintrag braucht einen Grund. */
const AUSNAHMEN = [
  {
    datei: 'tools/aufmassPdf.ts',
    text: 'useGrouping: false',
    grund: 'Exportwert für die Aufmaßliste (PDF): sprachneutral, ohne Gruppierung — bewusst kein Anzeigeformat.',
  },
]

const MUSTER = [
  { pruefung: /Intl\.NumberFormat\(\s*locale\s*,/u, was: 'Intl.NumberFormat(locale, …) — Oberflächensprache als Zahlen-Locale' },
  { pruefung: /Intl\.NumberFormat\(\s*undefined\s*,/u, was: 'Intl.NumberFormat(undefined, …) — still am navigator' },
  { pruefung: /\.toLocaleString\(\s*\)/u, was: 'toLocaleString() ohne Argument — still am navigator' },
  { pruefung: /\.toLocaleDateString\(\s*\)/u, was: 'toLocaleDateString() ohne Argument — still am navigator' },
]

function sammle(wurzel, treffer = []) {
  for (const eintrag of readdirSync(wurzel)) {
    const pfad = join(wurzel, eintrag)
    if (statSync(pfad).isDirectory()) sammle(pfad, treffer)
    else if (/\.(ts|tsx)$/u.test(eintrag) && !/\.test\./u.test(eintrag)) treffer.push(pfad)
  }
  return treffer
}

const dateien = sammle('apps/web/src')
const funde = []
for (const datei of dateien) {
  const inhalt = readFileSync(datei, 'utf8')
  for (const [nummer, zeile] of inhalt.split('\n').entries()) {
    if (zeile.trimStart().startsWith('*') || zeile.trimStart().startsWith('//')) continue
    const ausnahme = AUSNAHMEN.find((a) => datei.replace(/\\/gu, '/').endsWith(a.datei) && zeile.includes(a.text))
    if (ausnahme) continue
    for (const { pruefung, was } of MUSTER) {
      if (pruefung.test(zeile)) {
        funde.push(`${datei.replace(/\\/gu, '/')}:${nummer + 1}: ${was}\n    ${zeile.trim().slice(0, 120)}`)
      }
    }
  }
}

if (funde.length) {
  console.error(`format:check — ${funde.length} Stelle(n) ohne Anzeige-Kontext:`)
  for (const f of funde) console.error(`  ${f}`)
  console.error('Richtig: Intl.NumberFormat(anzeigeKontext(<sprache>).regionLocale, …) oder formatNumber/formatBytes aus @commietools/tools.')
  process.exit(1)
}
console.log(`format:check — keine Stelle mit Oberflächensprache oder navigator als Zahlen-Locale (${AUSNAHMEN.length} begründete Ausnahme(n)).`)
