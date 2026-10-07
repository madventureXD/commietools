/**
 * Gemeinsame Voraussetzungen fuer die Belegskripte unter `scripts/belege/`.
 *
 * Zweck (QM-Karte M10-004): Die Belege lagen bisher unter `work/` — das ist durch die
 * Projekt-.gitignore **nicht versioniert**, also in einem frischen Checkout nicht vorhanden.
 * Hier stehen nur die **tragenden** Belege, portabel und mit ausdruecklicher Voraussetzungspruefung.
 *
 * Regeln, die diese Datei durchsetzt:
 *   - **Kein fester Rechnerpfad, kein fester Port.** Alles kommt aus der Umgebung, mit
 *     dokumentiertem Standardwert.
 *   - **Fehlende Voraussetzung ergibt einen klaren Abbruch (Exit 2)** — niemals ein gruenes
 *     Leerergebnis. Exit 1 ist dem Befund vorbehalten ("Beleg nicht erbracht").
 *   - **Eigene Prozesse werden aufgeraeumt** (`aufraeumen`).
 */
import { existsSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const EXIT_BEFUND = 1
export const EXIT_VORAUSSETZUNG = 2

/** Klarer Abbruch, wenn eine Voraussetzung fehlt — kein stiller Weiterlauf. */
export function abbruch(grund) {
  console.error(`ABBRUCH (Voraussetzung fehlt): ${grund}`)
  console.error('Voraussetzungen und Aufruf: scripts/belege/README.md')
  process.exit(EXIT_VORAUSSETZUNG)
}

/** Adresse des Vorschaudienstes. Standard 4173; `vite preview` lauscht hier auf localhost. */
export function previewUrl() {
  return process.env.COMMIETOOLS_PREVIEW_URL ?? process.env.CT_BASE ?? 'http://localhost:4173'
}

/** Browserprogramm: aus der Umgebung oder aus den ueblichen Orten. */
export function browserPfad() {
  const kandidaten = [
    process.env.COMMIETOOLS_BROWSER,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  const treffer = kandidaten.find((pfad) => existsSync(pfad))
  if (!treffer) {
    abbruch('kein Chromium-Browser gefunden. Edge/Chrome installieren oder COMMIETOOLS_BROWSER auf die Programmdatei setzen.')
  }
  return treffer
}

/** Erreichbarkeit des Vorschaudienstes pruefen — sonst liefe der Beleg gegen nichts. */
export async function pruefePreview(url) {
  let antwort = null
  try {
    antwort = await fetch(url, { signal: AbortSignal.timeout(5000) })
  } catch {
    // nicht erreichbar — `antwort` bleibt null, die Meldung unten nennt den Grund
  }
  if (!antwort || !antwort.ok) {
    abbruch(`Vorschaudienst nicht erreichbar unter ${url}. Erst \`npm run build\`, dann \`npx vite preview --host 127.0.0.1 --port 4173\` starten (oder COMMIETOOLS_PREVIEW_URL setzen).`)
  }
}

/** Erwartete Datei (Fixture, Bau, Modul) pruefen. */
export function pruefeDatei(pfad, beschreibung) {
  if (!existsSync(pfad)) abbruch(`${beschreibung} fehlt: ${pfad}`)
  return pfad
}

/** Eigenen Prozess, Socket und Profilordner hinterlassen — nichts liegen lassen. */
export function aufraeumen({ profil, prozess, socket } = {}) {
  try { socket?.close() } catch { /* egal */ }
  try { prozess?.kill() } catch { /* egal */ }
  if (profil) {
    try { rmSync(profil, { recursive: true, force: true }) } catch { /* egal */ }
  }
}
