#!/usr/bin/env node
/**
 * **Stilcheck Spanisch** (Karte M3-006: „Stilcheck meldet Kandidaten, Mensch entscheidet mit Kontext").
 *
 * Der Prüfer **urteilt nicht**. Er meldet Stellen, die nach persönlicher Anrede aussehen
 * (2. Person Singular: Imperative, Pronomina, Verbformen), je Lektoratsscope — Shell, PDF-common,
 * Tools. Die Entscheidung braucht den Kontext und bleibt beim Menschen:
 *
 * - Dritte Person ist **nicht** automatisch persönliche Anrede („no se guarda nada").
 * - Substantive und Markentexte sind zulässig („Tus herramientas. Tu dispositivo. Tus datos.").
 * - Suchsynonyme (`*.terms`) sind keine Bedientexte und werden **getrennt** ausgewiesen.
 *
 * Lauf: `npm run style:check` (Kandidatenliste, Rückgabewert 0) oder `--streng` (Rückgabewert 1).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Muster persönlicher Anrede im Spanischen. Bewusst breit — es sind Kandidaten, keine Fehler. */
const MUSTER = /\b(tú|ti|tus|tu|puedes|tienes|debes|verás|haz|hazlo|elige|introduce|arrastra|escribe|selecciona|usa|abre|guarda|pulsa|marca|arrímate|mueve|coloca)\b/iu

const SCOPES = [
  { name: 'Shell (packages/i18n/src/common)', dateien: ['packages/i18n/src/common/es.ts'] },
  { name: 'PDF-common (packages/tools/src/pdf/common/locales)', dateien: ['packages/tools/src/pdf/common/locales/es.ts'] },
]

function sammleEsDateien(wurzel, treffer = []) {
  for (const eintrag of readdirSync(wurzel)) {
    const pfad = join(wurzel, eintrag)
    if (statSync(pfad).isDirectory()) sammleEsDateien(pfad, treffer)
    else if (eintrag === 'es.ts' && pfad.includes(`${join('', 'locales')}`)) treffer.push(pfad)
  }
  return treffer
}

const toolDateien = sammleEsDateien('packages/tools/src').filter((p) => !p.includes(join('pdf', 'common')))
SCOPES.push({ name: 'Tools (packages/tools/src/**/locales/es.ts)', dateien: toolDateien })

let gesamt = 0
let bedientexte = 0
for (const scope of SCOPES) {
  const kandidaten = []
  for (const datei of scope.dateien) {
    const inhalt = readFileSync(datei, 'utf8')
    for (const [nummer, zeile] of inhalt.split('\n').entries()) {
      const fund = MUSTER.exec(zeile)
      if (!fund) continue
      gesamt += 1
      const istSynonym = /'[^']*\.terms':/u.test(zeile)
      if (!istSynonym) bedientexte += 1
      // **Keine automatische Einordnung.** Ein regelbasierter Blick auf den Satzkontext hat am
      // 2026-10-07 falsche Sicherheit erzeugt („El dibujo usa" wurde als Kandidat geführt, „la
      // calculadora guarda" je nach Nachbarschaft mal so, mal so). Der Prüfer meldet deshalb
      // ausschließlich Kandidaten; die Beurteilung geschieht von Hand mit Kontext.
      kandidaten.push({ datei: datei.replace(/\\/gu, '/'), zeile: nummer + 1, wort: fund[0], synonym: istSynonym, text: zeile.trim() })
    }
  }
  console.log(`\n${scope.name}: ${kandidaten.length} Kandidat(en) in ${scope.dateien.length} Datei(en)`)
  for (const k of kandidaten) {
    console.log(`${k.synonym ? 'SYNONYM ' : 'KANDIDAT'} ${k.datei}:${k.zeile} [${k.wort}] ${k.text}`)
  }
}
console.log(`\nstyle:check — ${gesamt} Kandidat(en), davon ${bedientexte} in Bedientexten (ohne Suchsynonyme).`)
console.log('Kandidaten sind kein Urteil: dritte Person, Substantive und Markentexte sind zulässig.')
if (process.argv.includes('--streng') && bedientexte > 0) process.exit(1)
