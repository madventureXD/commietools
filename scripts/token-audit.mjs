/**
 * **Staticcheck für CSS-Variablen (Karte M7-006).**
 *
 * Anlass: In `apps/web/src/styles.css` benutzten 18 Stellen Tokens, die es **nicht gibt**
 * (`--border`, `--surface`, `--muted`, `--accent`, `--space-5`, `--surface-muted`). Eine
 * unaufgelöste `var()`-Referenz ist keine Kleinigkeit: Nach der Spezifikation wird die ganze
 * Deklaration „invalid at computed-value time" — bei einer Kurzschrift wie `padding` fallen damit
 * **alle** Einzelwerte auf `initial` zurück. Der Werkzeugschubkasten hatte dadurch **keine**
 * Innenabstände, ohne dass irgendwo ein Fehler auftauchte. Kein Prüfer hat es gemeldet, weil
 * keiner nach Variablen sah.
 *
 * Der Lauf benutzt den **Stylesheet-Parser** (postcss, MIT, als Entwicklungsabhängigkeit
 * deklariert) statt regulärer Ausdrücke: Kommentare sind eigene Knoten, und ein `var()` in einer
 * Anmerkung darf nicht als Verwendung zählen. Nur der *Wert* einer Deklaration wird zusätzlich mit
 * einem klammerbewussten Durchlauf gelesen — verschachtelte Fallbacks wie
 * `color-mix(in srgb, var(--x, var(--y)) 9%, transparent)` enden sonst an der falschen Klammer.
 *
 * Aufrufe:
 *   node scripts/token-audit.mjs          prüfen (Exit 1 bei unaufgelösten Referenzen OHNE Fallback)
 *   node scripts/token-audit.mjs liste    Bestandsaufnahme ausgeben (Definitionen mit Geltungsbereich)
 *
 * **Eine Referenz MIT Fallback ist kein Fehler, aber eine Meldung:** Der Fallback verdeckt den
 * Tippfehler, das Ergebnis sieht richtig aus. Solche Stellen werden namentlich ausgegeben.
 */
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import postcss from 'postcss'

const WURZELN = ['apps/web/src', 'packages/ui/src']

/**
 * Tokens, die **absichtlich** nicht im Projekt-CSS stehen: Sie werden zur Laufzeit gesetzt oder
 * kommen aus einer eingebundenen Bibliothek. Jeder Eintrag braucht hier einen Grund — sonst wäre
 * die Liste ein Sammelbecken für Tippfehler.
 *
 * Derzeit leer: Das Projekt setzt keine Variablen zur Laufzeit (geprüft über
 * `setProperty('--…')` und Inline-Stile in `*.tsx`).
 */
const ERLAUBT = new Map()

/**
 * **Rohfarben-Ausnahmen (Karte M2-008).** Eine Farbe, die nicht aus dem Tokensystem kommt, ist
 * eine Umgehung — es sei denn, sie hat eine *andere Verantwortung* als die Benutzeroberflaeche.
 * Jeder Eintrag nennt Selektor, Eigenschaft und Grund; eng gefasst, nie „alle Farben in Datei X".
 */
const FARBAUSNAHMEN = [
  { selektor: '.pdf-viewer-thumbs img', eigenschaft: 'background', grund: 'Dokumentpapier — die Vorschau zeigt die weisse Seite des Dokuments, nicht eine UI-Flaeche (schemaunabhaengig gewollt)' },
  { selektor: '.color-cursor', eigenschaft: 'border', grund: 'Fadenkreuz der Farbpipette: muss ueber JEDEM Bildinhalt sichtbar bleiben, kann also keine Themefarbe sein' },
  { selektor: '.tool-menu-scrim', eigenschaft: 'background', grund: 'Abdunklung hinter einer modalen Flaeche — eine Verdunklung, keine Oberflaechenfarbe' },
  { selektor: '.redaction-box', eigenschaft: 'background', grund: 'Schwaerzungsmarke, also Dokumentinhalt; dieselbe Farbe wie im Export' },
  { selektor: '.qr-canvas', eigenschaft: 'background', grund: 'QR-Papier — ein QR-Code braucht weissen Grund, sonst ist er nicht lesbar (Dokumentfarbe)' },
  { selektor: '.signature-pad canvas', eigenschaft: 'background', grund: 'Unterschriftenpapier — die Flaeche wird als Bild ausgegeben, ist also Dokumentinhalt' }
]

/** Schatten und Filter sind keine Flaechen- oder Textfarben. */
const SCHATTEN_EIGENSCHAFTEN = new Set(['box-shadow', 'text-shadow', 'filter', 'backdrop-filter', '-webkit-box-shadow'])

/** Farbangaben, die keine Farbe setzen. */
const OHNE_FARBE = /^(transparent|currentcolor|none|inherit|initial|unset|revert)$/i

/** Vollstaendig durchsichtige Farbangabe: setzt ebenfalls keine Farbe (#0000, #00000000). */
function istDurchsichtig(treffer) {
  if (!treffer.startsWith('#')) return false
  const ziffern = treffer.slice(1)
  if (ziffern.length === 4) return ziffern[3] === '0'
  if (ziffern.length === 8) return ziffern.slice(6) === '00'
  return false
}

const FARBMUSTER = /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|(?<![A-Za-z0-9_-])(?:white|black|red|blue|green|gray|grey|silver|orange|yellow|maroon|navy|teal|olive|lime|aqua|fuchsia|purple)(?![A-Za-z0-9_-])/g

/** Alle CSS-Dateien unter den Wurzeln, rekursiv. */
async function cssDateien(wurzel) {
  const gefunden = []
  const besuchen = async (ordner) => {
    for (const eintrag of await readdir(ordner, { withFileTypes: true })) {
      const pfad = join(ordner, eintrag.name)
      if (eintrag.isDirectory()) await besuchen(pfad)
      else if (eintrag.name.endsWith('.css')) gefunden.push(pfad)
    }
  }
  await besuchen(wurzel)
  return gefunden
}

/**
 * Liest die `var()`-Bezüge aus einem Deklarationswert — **klammerbewusst**, nicht per Regex.
 * `var(--a, var(--b))` ergibt zwei Bezüge; der äußere gilt als „mit Fallback".
 */
function varBezuege(wert) {
  const bezuege = []
  let suche = 0
  for (;;) {
    const start = wert.indexOf('var(', suche)
    if (start === -1) break
    let tiefe = 0
    let ende = -1
    for (let i = start + 3; i < wert.length; i += 1) {
      if (wert[i] === '(') tiefe += 1
      else if (wert[i] === ')') {
        tiefe -= 1
        if (tiefe === 0) { ende = i + 1; break }
      }
    }
    if (ende === -1) break   // unvollständig — die Datei ist ohnehin kaputt
    const inhalt = wert.slice(start + 4, ende - 1)
    // Erstes Komma auf oberster Ebene trennt Name und Fallback.
    let ebene = 0
    let komma = -1
    for (let i = 0; i < inhalt.length; i += 1) {
      if (inhalt[i] === '(') ebene += 1
      else if (inhalt[i] === ')') ebene -= 1
      else if (inhalt[i] === ',' && ebene === 0) { komma = i; break }
    }
    const name = (komma === -1 ? inhalt : inhalt.slice(0, komma)).trim()
    bezuege.push({ name, mitFallback: komma !== -1 })
    suche = ende
  }
  return bezuege
}

/** Nächstgelegener Regel-Selektor eines Knotens — für die Geltungsbereichsangabe. */
function selektor(node) {
  let eltern = node.parent
  while (eltern) {
    if (eltern.type === 'rule') return eltern.selector
    eltern = eltern.parent
  }
  return '(ohne Regel)'
}

async function sammeln() {
  const definitionen = new Map()   // name -> { geltungsbereiche:Set, dateien:Set }
  const verwendungen = []          // { name, mitFallback, datei, selektor, eigenschaft, wert }
  const rohfarben = []             // { farbe, datei, selektor, eigenschaft, grund }
  const dateien = []
  for (const wurzel of WURZELN) {
    for (const pfad of await cssDateien(wurzel)) {
      dateien.push(pfad)
      const wurzelKnoten = postcss.parse(await readFile(pfad, 'utf8'), { from: pfad })
      wurzelKnoten.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          const eintrag = definitionen.get(decl.prop) ?? { geltungsbereiche: new Set(), dateien: new Set() }
          eintrag.geltungsbereiche.add(selektor(decl))
          eintrag.dateien.add(pfad)
          definitionen.set(decl.prop, eintrag)
          return
        }
        for (const bezug of varBezuege(decl.value)) {
          verwendungen.push({ ...bezug, datei: pfad, selektor: selektor(decl), eigenschaft: decl.prop, wert: decl.value })
        }
        if (pfad.includes('tokens.css')) return           // Tokens SELBST sind die Farbquelle
        if (SCHATTEN_EIGENSCHAFTEN.has(decl.prop)) return // Schatten sind keine Farbflaeche
        for (const treffer of decl.value.match(FARBMUSTER) ?? []) {
          if (OHNE_FARBE.test(treffer.trim()) || istDurchsichtig(treffer)) continue
          const ausnahme = FARBAUSNAHMEN.find((a) => a.selektor === selektor(decl) && decl.prop.startsWith(a.eigenschaft))
          rohfarben.push({ farbe: treffer, datei: pfad, selektor: selektor(decl), eigenschaft: decl.prop, grund: ausnahme?.grund ?? null })
        }
      })
    }
  }
  return { dateien, definitionen, verwendungen, rohfarben }
}

const { dateien, definitionen, verwendungen, rohfarben } = await sammeln()

if (process.argv[2] === 'liste') {
  console.log(`Dateien: ${dateien.length} · Definitionen: ${definitionen.size} · Verwendungen: ${verwendungen.length}\n`)
  console.log('Definitionen (mit Geltungsbereich):')
  for (const name of [...definitionen.keys()].sort()) {
    const e = definitionen.get(name)
    console.log(`  ${name.padEnd(26)} ${[...e.geltungsbereiche].join(', ')}`)
  }
  const nieBenutzt = [...definitionen.keys()].filter((name) => !verwendungen.some((v) => v.name === name)).sort()
  console.log(`\nDefiniert, aber nie benutzt (${nieBenutzt.length}): ${nieBenutzt.join(', ') || '—'}`)
  console.log(`
Rohfarben (${rohfarben.length}):`)
  for (const r of rohfarben) console.log(`  ${r.farbe.padEnd(20)} ${r.selektor} { ${r.eigenschaft} } ${r.grund ? '[Ausnahme]' : '[OHNE GRUND]'}`)
  process.exit(0)
}

const ohneFallback = []
const mitFallback = []
for (const verwendung of verwendungen) {
  if (definitionen.has(verwendung.name) || ERLAUBT.has(verwendung.name)) continue
  ;(verwendung.mitFallback ? mitFallback : ohneFallback).push(verwendung)
}

const kurz = (v) => `${v.datei}: ${v.selektor} { ${v.eigenschaft}: ${v.wert} }`

if (mitFallback.length) {
  console.log(`Meldung: ${mitFallback.length} Verwendung(en) eines NICHT definierten Tokens MIT Fallback.`)
  console.log('  Der Fallback verdeckt den Namen — das Ergebnis sieht richtig aus, die Absicht steht nur hier:')
  for (const v of mitFallback) console.log(`  · ${v.name}  in ${kurz(v)}`)
  console.log('')
}

if (ohneFallback.length) {
  console.error(`FEHLER: ${ohneFallback.length} Verwendung(en) eines NICHT definierten Tokens OHNE Fallback.`)
  console.error('  Solche Deklarationen sind ungültig: die Eigenschaft fällt auf ihren Anfangswert zurück.')
  for (const v of ohneFallback) console.error(`  · ${v.name}  in ${kurz(v)}`)
  process.exit(1)
}

console.log(`Tokenschutz: ${dateien.length} Datei(en), ${verwendungen.length} Verwendungen, ${definitionen.size} Definitionen — alle Referenzen aufgeloest.`)

const ohneGrund = rohfarben.filter((r) => !r.grund)
if (rohfarben.length) {
  console.log(`Rohfarben: ${rohfarben.length} Stelle(n), davon ${rohfarben.length - ohneGrund.length} mit begruendeter Ausnahme.`)
  for (const r of rohfarben.filter((eintrag) => eintrag.grund)) console.log(`  · ${r.farbe}  ${r.selektor} { ${r.eigenschaft} } — ${r.grund}`)
}
if (ohneGrund.length) {
  console.error(`FEHLER: ${ohneGrund.length} Rohfarbe(n) ohne begruendete Ausnahme.`)
  console.error('  Entweder ein semantisches Token in packages/ui/src/tokens.css einfuehren oder eine')
  console.error('  eng gefasste Ausnahme in FARBAUSNAHMEN mit Grund eintragen (Karte M2-008).')
  for (const r of ohneGrund) console.error(`  · ${r.farbe}  in ${r.datei}: ${r.selektor} { ${r.eigenschaft} }`)
  process.exit(1)
}
if (mitFallback.length) console.log('(Mit den oben genannten Fallback-Meldungen.)')
