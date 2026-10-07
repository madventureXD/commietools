#!/usr/bin/env node
/**
 * **Fachglossar-Prüfer Spanisch** (Karte M3-003: „Fachglossar je Schlüsselkontext pflegen mit
 * unerwünschtem Sinnwechsel, Quelle/Begründung und freigegebener Übersetzung").
 *
 * Geprüft wird **schlüsselgenau**, nicht global: Ein unerwünschter Begriff ist nur in genau dem
 * Schlüssel falsch, in dem er den Sinn verändert. „Ahorro" ist zum Beispiel in der Komprimierung
 * richtig (Platzersparnis) und beim Speichern falsch — eine globale Wortsuche würde beides
 * vermischen und entweder legitime Texte anmeckern oder den echten Fehler übersehen.
 *
 * Lauf: `npm run glossary:check` (hängt in `npm run check`).
 */
import { readFileSync } from 'node:fs'

/** Quelle der Wahrheit. `unerwuenscht` wird als Zeichenkette im Wert gesucht. */
const GLOSSAR = [
  {
    datei: 'packages/i18n/src/common/es.ts',
    schluessel: 'category.developer',
    unerwuenscht: 'Revelador',
    freigegeben: 'Desarrollo',
    begruendung: '„Revelador" heißt „enthüllend" (wie bei einem Foto); gemeint ist die Werkzeugkategorie für Entwickler.',
  },
  {
    datei: 'packages/i18n/src/common/es.ts',
    schluessel: 'save.saving',
    unerwuenscht: 'Ahorro',
    freigegeben: 'Guardando…',
    begruendung: '„Ahorro" ist die Ersparnis. Während des Speicherns läuft der Vorgang: „Guardando…".',
  },
  {
    datei: 'packages/i18n/src/common/es.ts',
    schluessel: 'save.cancelled',
    unerwuenscht: 'Ahorro',
    freigegeben: 'Guardado cancelado.',
    begruendung: 'Abgebrochen wird das Speichern, nicht eine Ersparnis.',
  },
  {
    datei: 'packages/i18n/src/common/es.ts',
    schluessel: 'licenses.projectDescription',
    unerwuenscht: 'software gratuito',
    freigegeben: 'software libre',
    begruendung:
      'AGPL bedeutet Freie Software („software libre"); „software gratuito" beschreibt nur die Kostenfreiheit und ist die übliche Verwechslung. Die Kostenfreiheit wird getrennt benannt (app.tagline: „Herramientas gratuitas").',
  },
]

let fehler = 0
for (const eintrag of GLOSSAR) {
  const inhalt = readFileSync(eintrag.datei, 'utf8')
  const muster = new RegExp(`'${eintrag.schluessel.replace(/\./gu, '\\.')}':\\s*'([^']*)'`, 'u')
  const treffer = muster.exec(inhalt)
  if (!treffer) {
    console.error(`glossary:check — Schlüssel ${eintrag.schluessel} in ${eintrag.datei} nicht gefunden.`)
    fehler += 1
    continue
  }
  const wert = treffer[1]
  if (wert.includes(eintrag.unerwuenscht)) {
    console.error(`glossary:check — ${eintrag.datei}: ${eintrag.schluessel} enthält „${eintrag.unerwuenscht}": ${JSON.stringify(wert)}`)
    console.error(`                 freigegeben wäre: ${JSON.stringify(eintrag.freigegeben)} — ${eintrag.begruendung}`)
    fehler += 1
  }
}

if (fehler) {
  console.error(`glossary:check — ${fehler} Verstoß/Verstöße.`)
  process.exit(1)
}
console.log(`glossary:check — ${GLOSSAR.length} Schlüssel geprüft, keine der bekannten Sinnverwechslungen vorhanden.`)
