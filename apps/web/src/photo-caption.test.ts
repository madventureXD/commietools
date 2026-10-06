import { describe, expect, it } from 'vitest'
import {
  arrowGeometry,
  captionLayout,
  captionLimits,
  captionText,
  exifTimestamp,
  exifTimestampFrom,
  isUsableTimestamp,
  normaliseArrow,
  normalizeExifDate,
  resultName
} from '@commietools/tools/image/caption'

const eintrag = (tag: string, value: string) => ({ tag, group: 'time' as const, value })

describe('Foto-Beschrifter — Aufnahmezeit', () => {
  it('nimmt DateTimeOriginal vor CreateDate und DateTime', () => {
    const bericht = [
      eintrag('DateTime', '2020:01:01 00:00:00'),
      eintrag('CreateDate', '2021:02:02 10:00:00'),
      eintrag('DateTimeOriginal', '2026:10:06 09:12:33')
    ]
    expect(exifTimestamp(bericht)).toBe('2026-10-06 09:12')
  })

  it('fällt auf die nächste vorhandene Quelle zurück', () => {
    expect(exifTimestamp([eintrag('CreateDate', '2025:03:04 08:07:00')])).toBe('2025-03-04 08:07')
    expect(exifTimestamp([eintrag('ModifyDate', '2025-03-04 08:07:00')])).toBe('2025-03-04 08:07')
  })

  it('erfindet keinen Zeitstempel', () => {
    expect(exifTimestamp([])).toBe('')
    expect(exifTimestamp([eintrag('Make', 'Canon')])).toBe('')
    expect(exifTimestamp([eintrag('DateTimeOriginal', '0000:00:00 00:00:00')])).toBe('')
    expect(exifTimestamp([eintrag('DateTimeOriginal', '(leer)')])).toBe('')
  })

  it('greift auf das Änderungsdatum zu und nennt die Herkunft', () => {
    // Genau dieser Fall kam von einem echten Foto: ein in Photoshop bearbeitetes Windows-Bild hat
    // nur `ModifyDate` — vorher suchte die Kette den Namen „DateTime", den der Leser nicht vergibt.
    const bericht = [eintrag('Orientation', '1'), eintrag('ModifyDate', '2021-04-09 09:39:59')]
    expect(exifTimestampFrom(bericht)).toEqual({ value: '2021-04-09 09:39', from: 'ModifyDate' })
    expect(exifTimestamp(bericht)).toBe('2021-04-09 09:39')
  })

  it('nennt die Herkunft der Zeit, wenn die Aufnahmezeit selbst vorliegt', () => {
    expect(exifTimestampFrom([eintrag('DateTimeOriginal', '2026:10:05 14:22:07')])).toEqual({ value: '2026-10-05 14:22', from: 'DateTimeOriginal' })
    expect(exifTimestampFrom([eintrag('CreateDate', '2026:10:05 14:22:07')])).toEqual({ value: '2026-10-05 14:22', from: 'CreateDate' })
    expect(exifTimestampFrom([])).toEqual({ value: '', from: null })
  })

  it('nimmt den Wert an, den der eigene Exif-Leser liefert (ISO-Schreibweise)', () => {
    // Der Leser des Projekts setzt die Zeit schon um: belegt im Browser-Beleg, dort steht
    // "time | DateTimeOriginal = 2026-10-05 14:22:07" — nicht die rohe Form mit Doppelpunkten.
    expect(exifTimestamp([eintrag('DateTimeOriginal', '2026-10-05 14:22:07')])).toBe('2026-10-05 14:22')
    expect(normalizeExifDate('2026-10-05 14:22:07')).toBe('2026-10-05 14:22')
    expect(normalizeExifDate('2026-10-05T14:22:07')).toBe('2026-10-05 14:22')
  })

  it('wandelt auch die rohe Exif-Schreibweise um und weist Unmögliches ab', () => {
    expect(normalizeExifDate('2026:10:06 09:12:33')).toBe('2026-10-06 09:12')
    expect(normalizeExifDate('2026:02:31 09:12:33')).toBe('')
    expect(normalizeExifDate('2026:13:01 09:12:33')).toBe('')
    expect(normalizeExifDate('2026-02-31 09:12:33')).toBe('')
  })

  it('prüft die Eingabe des Zeitstempels', () => {
    expect(isUsableTimestamp('')).toBe(true) // „kein Zeitstempel" ist zulässig
    expect(isUsableTimestamp('2026-10-06 09:30')).toBe(true)
    expect(isUsableTimestamp('2026-10-06')).toBe(true)
    expect(isUsableTimestamp('2026-02-28')).toBe(true)
    expect(isUsableTimestamp('2024-02-29')).toBe(true)
    expect(isUsableTimestamp('2026-02-29')).toBe(false)
    expect(isUsableTimestamp('2026-02-31')).toBe(false)
    expect(isUsableTimestamp('2026-13-01')).toBe(false)
    expect(isUsableTimestamp('2026-10-06 24:00')).toBe(false)
    expect(isUsableTimestamp('2026-10-06 09:61')).toBe(false)
    expect(isUsableTimestamp('06.10.2026')).toBe(false)
  })

  it('setzt die Beschriftung aus Zeitstempel und Notiz zusammen', () => {
    expect(captionText({ timestamp: '2026-10-06 09:12', note: 'Riss in der Decke' })).toBe('2026-10-06 09:12 · Riss in der Decke')
    expect(captionText({ timestamp: '', note: 'nur Notiz' })).toBe('nur Notiz')
    expect(captionText({ timestamp: '2026-10-06 09:12', note: '   ' })).toBe('2026-10-06 09:12')
    expect(captionText({ timestamp: '', note: '' })).toBe('')
  })
})

describe('Foto-Beschrifter — Pfeil und Anordnung', () => {
  it('begrenzt das Pfeilziel auf die Bildfläche', () => {
    expect(normaliseArrow(50, 50)).toEqual({ x: 50, y: 50 })
    expect(normaliseArrow(-10, 120)).toEqual({ x: 0, y: 100 })
    expect(normaliseArrow(Number.NaN, 50)).toBeNull()
    expect(normaliseArrow(50, Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('zieht den Pfeil von der Leistenkante zum Ziel', () => {
    const layout = captionLayout()
    const geometrie = arrowGeometry({ x: 25, y: 40 }, layout)
    expect(geometrie).not.toBeNull()
    expect(geometrie?.from.x).toBeCloseTo(0.25, 5)
    expect(geometrie?.from.y).toBeCloseTo(1 - layout.bandFraction, 5)
    expect(geometrie?.to).toEqual({ x: 0.25, y: 0.4 })
  })

  it('gibt keinen Pfeil, wenn das Ziel in der Leiste liegt', () => {
    expect(arrowGeometry({ x: 50, y: 100 })).toBeNull()
    expect(arrowGeometry({ x: 50, y: 95 })).toBeNull()
  })

  it('hält die Anordnung in den erklärten Grenzen', () => {
    const layout = captionLayout()
    expect(layout.bandFraction).toBeGreaterThanOrEqual(captionLimits.bandFractionMin)
    expect(layout.bandFraction).toBeLessThanOrEqual(captionLimits.bandFractionMax)
    expect(layout.fontSizeFraction).toBeGreaterThanOrEqual(captionLimits.fontSizeFractionMin)
    expect(layout.fontSizeFraction).toBeLessThanOrEqual(captionLimits.fontSizeFractionMax)
    // Die Leiste darf den Text nicht erdrücken: sie muss höher sein als die Schriftzeile.
    expect(layout.bandFraction).toBeGreaterThan(layout.fontSizeFraction)
  })
})

describe('Foto-Beschrifter — Dateinamen', () => {
  it('hängt die Kennzeichnung an und entfernt die alte Endung', () => {
    expect(resultName('IMG_0421.jpg', 0)).toBe('IMG_0421-beschriftet.jpg')
    expect(resultName('baustelle.png', 1)).toBe('baustelle-beschriftet.jpg')
  })

  it('ersetzt unzulässige Zeichen und fängt leere Namen ab', () => {
    expect(resultName('wand/ost:1.jpg', 0)).toBe('wand-ost-1-beschriftet.jpg')
    expect(resultName('   ', 2)).toBe('foto-3-beschriftet.jpg')
  })

  it('macht Namen eindeutig, wenn derselbe Name zweimal vorkommt', () => {
    const verwendet = [resultName('IMG_0421.jpg', 0)]
    expect(resultName('IMG_0421.jpg', 1, verwendet)).toBe('IMG_0421-beschriftet-2.jpg')
  })

  it('benennt die Datei nach dem gewählten Format', () => {
    // Der Fehler war echt: die Endung stand fest auf .jpg, auch wenn PNG ausgegeben wurde.
    expect(resultName('IMG_0421.jpg', 0, [], 'png')).toBe('IMG_0421-beschriftet.png')
    expect(resultName('IMG_0421.jpg', 0)).toBe('IMG_0421-beschriftet.jpg')
  })
})
