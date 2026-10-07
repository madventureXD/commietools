import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Zaehlt die Kartenstaende zeilenweise in den Tabellen der Leitdatei (Lehre aus R6/R7:
// nicht die Summe fortschreiben, sondern die Tabelle zaehlen).
// Portiert nach `scripts/belege/` (2026-10-07, Stufe R9): Wurzel aus dem Ablageort statt aus dem
// Arbeitsverzeichnis — sonst zaehlt der Aufruf aus einem anderen Ordner stillschweigend nichts.
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const zeilen = readFileSync(join(REPO, 'uebergabe', '00-einstieg', 'vorgehen-qm-audit.md'), 'utf8').split('\n')
let stufe = null
const jeStufe = {}
const alle = []
for (const zeile of zeilen) {
  const h = /^###\s+(R\d+)\b/u.exec(zeile)
  if (h) { stufe = h[1]; continue }
  const m = /^\|\s*([A-Z]\d+-\d+)\s*\|/u.exec(zeile)
  if (!m || !stufe) continue
  const zellen = zeile.split('|').map((z) => z.trim())
  const statusZelle = (zellen[3] ?? '').replace(/\*/gu, '')
  const status = statusZelle.includes('✓') ? 'erledigt' : statusZelle.includes('◐') ? 'Restforderung' : statusZelle.includes('○') ? 'offen' : 'unklar'
  alle.push({ stufe, karte: m[1], status })
  jeStufe[stufe] = jeStufe[stufe] || { erledigt: 0, Restforderung: 0, offen: 0, unklar: 0 }
  jeStufe[stufe][status] += 1
}
const summe = alle.reduce((a, k) => { a[k.status] = (a[k.status] || 0) + 1; return a }, {})
console.log('Karten gesamt (zeilenweise gezaehlt):', alle.length)
console.log('Summe:', JSON.stringify(summe))
for (const [s, v] of Object.entries(jeStufe)) console.log(` ${s}: ${v.erledigt} erledigt / ${v.Restforderung} Rest / ${v.offen} offen / ${v.unklar} unklar`)
const unklar = alle.filter((k) => k.status === 'unklar')
if (unklar.length) console.log('unklare Zellen:', unklar.map((k) => `${k.karte} (${k.stufe})`).join(', '))
