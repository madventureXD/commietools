import { describe, expect, it } from 'vitest'
import { numberCell, spreadsheetField, spreadsheetRow, textCell } from '@commietools/tools/calculator/spreadsheet'

/**
 * Abnahmefälle der Karte M8-004: Ein Freitextfeld, das ein Tabellenprogramm als **Formel** lesen
 * würde, muss als Text gekennzeichnet werden; ein Rechenwert darf dabei **numerisch** bleiben.
 */
describe('Tabellenzellen entschärfen (M8-004)', () => {
  const feld = (value: string) => spreadsheetField(textCell(value), ';')

  it('kennzeichnet harmlose Formelstarter als Text', () => {
    // Ohne Kennzeichnung rechnet Excel/LibreOffice diese Zellen beim Öffnen aus.
    expect(feld('=1+1')).toBe("'=1+1")
    expect(feld('+1+1')).toBe("'+1+1")
    expect(feld('-1+1')).toBe("'-1+1")
    expect(feld('@SUM(1)')).toBe("'@SUM(1)")
    // Führender Tabulator und Wagenrücklauf stehen in der OWASP-Beschreibung.
    expect(feld('\t=1+1')).toBe('"\'\t=1+1"')
    expect(feld('\r=1+1')).toBe('"\'\r=1+1"')
    // Vollbreite Formelzeichen: Importer legen sie unterschiedlich aus.
    expect(feld('＝1+1')).toBe("'＝1+1")
    expect(feld('＠SUM(1)')).toBe("'＠SUM(1)")
  })

  it('lässt gewöhnlichen Text unangetastet', () => {
    expect(feld('Wandfläche')).toBe('Wandfläche')
    expect(feld('3,5 × 2,8')).toBe('3,5 × 2,8')
  })

  it('maskiert Anführungszeichen und quotet nur, was es braucht', () => {
    expect(feld('sagt "hallo"')).toBe('"sagt ""hallo"""')
    // Ein Dezimalkomma bei Semikolon-Trennung wird ausdrücklich **nicht** gequotet.
    expect(feld('12,5')).toBe('12,5')
    expect(spreadsheetField(textCell('a;b'), ';')).toBe('"a;b"')
    expect(spreadsheetField(textCell('Zeile1\nZeile2'), ';')).toBe('"Zeile1\nZeile2"')
  })

  it('hält Rechenwerte numerisch — auch negative', () => {
    // Der Kern der Typisierung: Eine pauschale Zeichenfilterung würde `-12,5` zerstören.
    expect(spreadsheetField(numberCell('-12,5'), ';')).toBe('-12,5')
    expect(spreadsheetField(numberCell('0,5'), ';')).toBe('0,5')
    expect(spreadsheetField(numberCell('1.234,56'), ';')).toBe('1.234,56')
    // Auch bei Trennzeichen im Wert bleibt die Zahl eine Zahl (Quoting, kein Apostroph).
    expect(spreadsheetField(numberCell('1;2'), ';')).toBe('"1;2"')
  })

  it('baut eine Zeile mit gemischten Zeltypen', () => {
    expect(spreadsheetRow([textCell('=Falle'), numberCell('-3,5'), textCell('a;b')], ';')).toBe(`'=Falle;-3,5;"a;b"`)
  })
})
