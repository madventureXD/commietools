import { describe, expect, it } from 'vitest'
import { normaliseFileName, saveWithAdapter, type SaveEnvironment } from './tools/SaveFileControl'

/**
 * Karte M5-002: Der Speichervorgang war im automatischen Testlauf **unbenutzt** — eine Mutation,
 * die das Schreiben überspringt, hätte jeden Test überstanden. Hier wird der Ablauf mit
 * injizierter Umgebung geprüft: der Pickerpfad bis `write`/`close`, der Abbruch, der Schreibfehler
 * und der Rückfallweg. Geprüft werden die **Bytes** und der **Name**, nicht nur die Anzahl der
 * Aufrufe.
 */
function umgebung(übersteuerung: Partial<SaveEnvironment> = {}): SaveEnvironment {
  return { download: () => { throw new Error('Downloadweg darf hier nicht laufen') }, ...übersteuerung }
}

describe('save file names', () => {
  it('keeps a valid chosen name and required extension', () => {
    expect(normaliseFileName('bericht.pdf', 'document.pdf')).toBe('bericht.pdf')
  })

  it('replaces a conflicting extension', () => {
    expect(normaliseFileName('bericht.png', 'document.pdf')).toBe('bericht.pdf')
  })

  it('removes path separators and reserved device names', () => {
    expect(normaliseFileName('ordner/bericht?.pdf', 'document.pdf')).toBe('ordner-bericht-.pdf')
    expect(normaliseFileName('CON.pdf', 'document.pdf')).toBe('_CON.pdf')
  })

  it('schreibt über den Picker: Bytes, Name und MIME (M5-002)', async () => {
    const geschrieben: { daten: Blob }[] = []
    let geschlossen = 0
    const ergebnis = await saveWithAdapter({
      name: 'bericht.pdf',
      mimeType: 'application/pdf',
      environment: umgebung({
        picker: async (optionen) => {
          expect(optionen.suggestedName).toBe('bericht.pdf')
          expect(optionen.types?.[0]?.accept).toEqual({ 'application/pdf': ['.pdf'] })
          return {
            createWritable: async () => ({
              write: async (daten: Blob) => { geschrieben.push({ daten }) },
              close: async () => { geschlossen += 1 }
            })
          }
        }
      }),
      getBlob: async () => new Blob([new Uint8Array([1, 2, 3])])
    })
    expect(ergebnis).toBe('saved')
    expect(geschlossen, 'der Schreibstrom muss geschlossen werden').toBe(1)
    expect(geschrieben.length, 'genau ein Schreibvorgang').toBe(1)
    expect(new Uint8Array(await geschrieben[0]!.daten.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('behandelt den Nutzerabbruch als Abbruch — ohne heimlichen Download (M5-002)', async () => {
    let downloads = 0
    const ergebnis = await saveWithAdapter({
      name: 'bericht.pdf',
      mimeType: 'application/pdf',
      environment: umgebung({
        picker: async () => { throw new DOMException('abgebrochen', 'AbortError') },
        download: () => { downloads += 1 }
      }),
      getBlob: async () => new Blob(['x'])
    })
    expect(ergebnis).toBe('cancelled')
    expect(downloads, 'ein Abbruch darf keinen Download auslösen').toBe(0)
  })

  it('meldet einen Schreibfehler als Fehler (M5-002)', async () => {
    const ergebnis = await saveWithAdapter({
      name: 'bericht.pdf',
      mimeType: 'application/pdf',
      environment: umgebung({
        picker: async () => ({ createWritable: async () => ({ write: async () => { throw new Error('Platte voll') }, close: async () => {} }) })
      }),
      getBlob: async () => new Blob(['x'])
    })
    expect(ergebnis).toBe('error')
  })

  it('nutzt ohne Picker den Downloadweg und übergibt die erzeugten Bytes (M5-002)', async () => {
    let empfangen: { groesse: number; name: string } | null = null
    const ergebnis = await saveWithAdapter({
      name: 'bericht.pdf',
      mimeType: 'application/pdf',
      environment: umgebung({ download: (blob, name) => { empfangen = { groesse: blob.size, name } } }),
      getBlob: async () => new Blob([new Uint8Array([7, 8, 9, 10])])
    })
    expect(ergebnis).toBe('downloaded')
    expect(empfangen).toEqual({ groesse: 4, name: 'bericht.pdf' })
  })

  it('kommt mit asynchroner Blobproduktion und wiederholtem Klick zurecht (M5-002)', async () => {
    let aufrufe = 0
    const ergebnis = async () => saveWithAdapter({
      name: 'bericht.pdf',
      mimeType: 'application/pdf',
      environment: umgebung({ download: () => { aufrufe += 1 } }),
      getBlob: async () => { await new Promise((f) => setTimeout(f, 1)); return new Blob([new Uint8Array([1])]) }
    })
    expect(await ergebnis()).toBe('downloaded')
    expect(await ergebnis()).toBe('downloaded')
    expect(aufrufe).toBe(2)
  })

  it('meldet fehlende Daten als Fehler, statt einen leeren Download zu starten (M5-002)', async () => {
    let downloads = 0
    const ergebnis = await saveWithAdapter({
      name: 'bericht.pdf',
      mimeType: 'application/pdf',
      environment: umgebung({ download: () => { downloads += 1 } }),
      getBlob: async () => null
    })
    expect(ergebnis).toBe('error')
    expect(downloads).toBe(0)
  })

  it('uses the fallback for an empty name', () => {
    expect(normaliseFileName('  ', 'document.pdf')).toBe('document.pdf')
  })

  /**
   * Karte M3-007, als reguläre Regression übernommen (Karte M5-004): Das Kürzen eines langen
   * Namens darf **keine unpaarigen Surrogate** hinterlassen. Ein Emoji besteht aus zwei UTF-16-
   * Einheiten; wird zwischen ihnen abgeschnitten, entsteht ein Zeichen, das kein gültiger Text
   * mehr ist — genau das war der dokumentierte Fehler.
   */
  it('kürzt lange Namen ohne unpaarige Surrogate (M3-007)', () => {
    // Eigene Prüfung statt `isWellFormed`: die Typprüfung des Projekts steht auf ES2022.
    const wohlgeformt = (text: string) => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(text)
    const gekuerzt = normaliseFileName(`a${'😊'.repeat(90)}.pdf`, 'document.pdf')
    expect(wohlgeformt(gekuerzt), `nicht wohlgeformt: ${JSON.stringify(gekuerzt.slice(-6))}`).toBe(true)
    expect(gekuerzt.endsWith('.pdf')).toBe(true)
    // Gegenprobe: ein absichtlich zerschnittenes Emoji gilt als nicht wohlgeformt.
    expect(wohlgeformt('\ud83d')).toBe(false)
    expect(wohlgeformt('😊')).toBe(true)
  })

  /**
   * Karte M3-007, vollständige Abnahme: **Graphemgruppen** dürfen beim Kürzen nicht zerschnitten
   * werden — nicht nur Surrogatpaare. Eine ZWJ-Familie, eine Flagge, ein Hautton-Modifier und ein
   * kombinierendes Zeichen bestehen aus mehreren Codepoints und *bleiben* wohlgeformt, wenn man sie
   * mitten durchtrennt: das Ergebnis ist dann still zerstörter Text. Geprüft wird deshalb gegen eine
   * **unabhängig** gebildete Segmentliste, nicht gegen die Produktionsfunktion.
   */
  it('kürzt an Graphemgrenzen: ZWJ-Familie, Flagge, Hautton, kombinierendes Zeichen, CJK (M3-007)', () => {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    const grenzen = (text: string) => new Set([...segmenter.segment(text)].map((teil) => teil.index))
    const grenze = 180

    const faelle: Array<[string, string]> = [
      ['ZWJ-Familie', '👨‍👩‍👧‍👦'],
      ['Flagge', '🇩🇪'],
      ['Hautton-Modifier', '👍🏽'],
      ['kombinierendes Zeichen', 'n\u0303'],
      ['CJK', '漢'],
      ['Ersatzzeichen-Emoji', '😊'],
    ]

    for (const [was, zeichen] of faelle) {
      // So viele Gruppen, dass die 180er-Grenze mitten in einer Gruppe liegen muss.
      const original = `${'a'.repeat(3)}${zeichen.repeat(200)}${'.pdf'}`
      const gekuerzt = normaliseFileName(original, 'document.pdf')
      const rumpf = gekuerzt.slice(0, -'.pdf'.length)

      expect(gekuerzt.endsWith('.pdf'), `${was}: Endung verloren`).toBe(true)
      expect(gekuerzt.length, `${was}: Grenze überschritten`).toBeLessThanOrEqual(grenze)
      // Der Rumpf ist ein Präfix des Originals …
      expect(original.startsWith(rumpf), `${was}: Rumpf ist kein Präfix`).toBe(true)
      // … und endet auf einer Graphemgrenze (kein halbes Zeichen, keine halbe Gruppe).
      expect(grenzen(original).has(rumpf.length), `${was}: Schnitt liegt in einer Gruppe`).toBe(true)

      // Gegenprobe: der naive Schnitt auf dieselbe Länge liegt bei mehrteiligen Gruppen **nicht**
      // auf einer Grenze — der Test fordert also tatsächlich mehr als die Surrogatprüfung.
      if (zeichen.length > 1) {
        const naiv = rumpf.length + 1
        expect(grenzen(original).has(naiv), `${was}: Gegenprobe greift nicht`).toBe(false)
      }
    }
  })

  /** Der Rückfall ohne `Intl.Segmenter` darf höchstens ungenauer sein — nie länger als die Grenze. */
  it('hält die Längengrenze auch bei sehr langen Einzelgruppen (M3-007)', () => {
    const gekuerzt = normaliseFileName(`${'漢'.repeat(300)}.pdf`, 'document.pdf')
    expect(gekuerzt.length).toBeLessThanOrEqual(180)
    expect(gekuerzt.endsWith('.pdf')).toBe(true)
  })
})
