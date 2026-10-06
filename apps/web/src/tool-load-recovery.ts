/**
 * Erkennung und Begrenzung der Wiederherstellung nach einem Ladefehler (Karte M4-004).
 *
 * Reine Funktionen ohne Browser und ohne React — damit sind sie ohne gerenderte Komponente
 * prüfbar (das Projekt rendert in seinen Tests nicht, siehe `QM/10-befunde.md`).
 *
 * Zwei Fehlerarten werden **getrennt** behandelt, weil sie verschiedene Ursachen haben:
 *
 * 1. **Veralteter Deployment-Chunk.** Die Seite läuft noch mit der alten Programmfassung, im
 *    Netz liegt bereits die neue — der alte Chunk ist unter seinem Namen nicht mehr da
 *    (404). Ein Neuladen ist die richtige Antwort, weil es die aktuelle Fassung holt.
 * 2. **Auswertungsfehler.** Der Chunk ist da und wirft beim Auswerten. Ein Neuladen hilft
 *    nicht; die Ursache liegt im Programm. Das wird auch so gesagt, statt eine Wiederholung
 *    anzubieten, die nichts bewirkt.
 */
export const NEULADEN_SCHLUESSEL = 'commietools-reload-at'

/** Innerhalb dieser Zeit wird höchstens **einmal** neu geladen. */
export const NEULADEN_ABSTAND_MS = 60_000

/**
 * Sieht der Fehler nach einem **veralteten Deployment-Chunk** aus?
 *
 * Die Muster sind die Meldungen, die Chromium und Vite für einen gescheiterten dynamischen
 * Import erzeugen; „404" deckt den Fall ab, dass der Server den alten Dateinamen nicht mehr
 * kennt. Bewusst eine Textprüfung: Der Browser liefert für diesen Fall keine eigene Kennung,
 * und ein Fehlurteil kostet hier nur die Wahl zwischen zwei Meldungen.
 */
export function istVeralteteFassung(nachricht: string | null | undefined): boolean {
  const text = String(nachricht ?? '').toLowerCase()
  return [
    'failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'importing a module script failed',
    'dynamically imported module',
    'chunkloaderror',
    '404'
  ].some((muster) => text.includes(muster))
}

/**
 * Darf jetzt neu geladen werden?
 *
 * Der Merker steht im **Gerätespeicher** und überlebt das Neuladen. Ohne diese Sperre würde
 * ein dauerhafter Fehler bei jedem Neuladen wieder einen Knopf anbieten — und wer ihn drückt,
 * lädt in einer Schleife. Genau die soll die Karte verhindern.
 */
export function darfNeuLaden(merker: string | null | undefined, jetzt: number, abstand: number = NEULADEN_ABSTAND_MS): boolean {
  const vorher = Number(merker)
  if (!Number.isFinite(vorher) || vorher <= 0) return true
  return jetzt - vorher >= abstand
}
