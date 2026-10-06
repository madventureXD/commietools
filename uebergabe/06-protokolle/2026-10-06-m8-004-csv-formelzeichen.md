# Fortschrittsprotokoll: M8-004 (R2) — CSV-Freitext wird nicht mehr als Tabellenformel exportiert

**Datum:** 2026-10-06
**Status:** abgeschlossen — **mit einem ausdrücklich nicht erfüllten Abnahmekriterium** (Tabellenprogramm-Probe)
**Karte:** M8-004 aus R2 (`QM/70-reparaturempfehlungen/R2.md`), Basis `a041ee0`

## Umfang

Neu: `packages/tools/src/calculator/spreadsheet.ts` (typisierte, entschärfte Zellen). Geändert:
`packages/tools/src/calculator/aufmass.ts` (`toCsv`, `csvField` entfernt),
`apps/web/src/tools/Aufmass.tsx` (Export-Hinweis in der Oberfläche), drei Sprachdateien des
Aufmaß-Werkzeugs, Tests `apps/web/src/aufmass.test.ts` und neu `apps/web/src/aufmass-csv.test.ts`.

## Ergebnisse

**1. Der Befund trifft zu.** `csvField` maskierte Anführungszeichen und Trennzeichen — aber ein
Freitextfeld mit führendem `=`, `+`, `-`, `@`, Tabulator oder Wagenrücklauf wurde unverändert
geschrieben. Ein Tabellenprogramm liest so eine Zelle beim Öffnen als **Formel**; die Datei trug
den Rechenweg des Nutzers, aber auch dessen Text als ausführbaren Ausdruck.

**2. Lösung: Zellen sind typisiert, Text wird gekennzeichnet.** `spreadsheetField` nimmt
`{ kind: 'text' | 'number', value }` und setzt bei Text mit Formelstarter ein führendes Apostroph —
die übliche Kennzeichnung „dies ist Text". Vollbreite Formelzeichen (`＝ ＋ － ＠`) sind
mitgenommen, weil Importer sie unterschiedlich auslegen.

**3. Der entscheidende Punkt: Zahlen bleiben Zahlen.** Eine pauschale Zeichenfilterung hätte
**negative Rechenwerte** zerstört (`-12,50` wäre zum Text mit Apostroph geworden). Rechenwerte
gehen deshalb als `number` durch und werden nur maskiert, nie gekennzeichnet. Die Karte verlangt
genau das („Validierte negative Zahlen bleiben numerisch").

**4. `toCsv` führt alle freien Felder durch den Encoder.** Titel, Kunde, Abschnitts-, Zeilen- und
Positionsbezeichnungen, Einheiten und Ausdrücke sind `text`; Menge, Preis, Betrag, Zwischensumme und
Gesamtsumme sind `number`. Der alte lokale `csvField` ist **entfernt** — ein Encoder, kein zweiter.

**5. „Nicht tabellensicher" steht in der Oberfläche.** Neuer Hinweis unter dem Export
(`tool.aufmass.export.spreadsheet`, drei Sprachen): Die Datei ist für Tabellenprogramme gedacht,
aber nicht als tabellensicher zugesichert; Spalten bitte als Text importieren. Die Karte verlangt
das ausdrücklich — eine bloße Kennzeichnung darf nicht als universelle Sicherheit beworben werden.

## Abnahmefälle der Karte

| Abnahmefall | Ergebnis |
|---|---|
| `=1+1`, `+1+1`, `-1+1`, `@SUM(1)` | als Text gekennzeichnet (`'=1+1` …) |
| führender Tabulator / Wagenrücklauf | gekennzeichnet und gequotet |
| Vollbreitenzeichen `＝`,`＠` | gekennzeichnet |
| Quotes und Separatoren | maskiert (`"sagt ""hallo"""`), `Wand; innen` gequotet, Dezimalkomma **nicht** gequotet |
| negative Zahl `-12,50` | **bleibt numerisch** (kein Apostroph) |

## Belege

- **Unit-Tests** `apps/web/src/aufmass-csv.test.ts` (5 Fälle) und der Integrationstest in
  `apps/web/src/aufmass.test.ts`: Formel im Titel und in der Bezeichnung wird gekennzeichnet,
  die Positionszeile bleibt numerisch ohne Apostroph.
- **Unabhängiger Leser (Ersatz für die Excel-/LibreOffice-Probe):** `work/m8-004-korpus.mjs`
  erzeugt den Korpus aus dem Kern, `work/m8-004-pruefen.py` liest ihn mit dem **fremden** CSV-Modul
  von Python und vergleicht Zelle für Zelle: **alle 11 Zeilen bestanden**, und keine Zelle beginnt
  nach dem Lesen mit einem Formelzeichen. Ein gefundener Unterschied ist festgehalten: Python
  normalisiert den Wagenrücklauf im gequoteten Feld zu LF (Eigenheit des Lesers, nicht des
  Erzeugers — der Korpus zeigt `"'\r=1+1"`).
- **Prüfkette:** `npm run catalog:generate` (Sprachschlüssel) → `npm run licenses:generate` →
  `npm run check` → `npm run build`.

## Ausdrücklich **nicht** erfülltes Abnahmekriterium

Die Karte verlangt zusätzlich: „Excel/LibreOffice unterstützte Versionen: Direktöffnung, Import und
erneutes Speichern/Öffnen." **Auf diesem Rechner ist weder Excel noch LibreOffice installiert**
(geprüft: kein `soffice.exe`, kein Office-Verzeichnis) — die Probe ist damit hier nicht möglich und
**nicht** durchgeführt. Der unabhängige Leser ersetzt sie nicht: Er prüft Quoting und Trennung,
nicht das Verhalten eines Tabellenprogramms. Offener Punkt, keine stille Auslassung.

## Nachtrag 2026-10-06: Abnahme ohne Tabellenprogramm

**Entscheidung Thomas:** Die Karte wird **ohne** Tabellenprogramm-Probe abgeschlossen. Auf dem
Rechner sind weder Excel noch LibreOffice vorhanden (geprüft: kein `soffice.exe`, kein
Office-Verzeichnis). Das Abnahmekriterium „Excel/LibreOffice unterstützte Versionen: Direktöffnung,
Import und erneutes Speichern/Öffnen" wird damit **bewusst fallen gelassen** und nicht als erfüllt
ausgegeben.

**Was weiterhin gilt:** Die unabhängige Gegenprobe bleibt maßgeblich — ein fremder CSV-Leser
(Python-`csv`, `work/m8-004-pruefen.py`) liest die erzeugte Datei und stellt fest, dass **keine**
Zelle nach dem Lesen mit einem Formelzeichen beginnt (11 Zeilen geprüft). Belegt sind damit
Maskierung, Trennzeichen und Formelneutralisierung — **nicht** das Verhalten eines
Tabellenprogramms.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| neue Testfälle | 6 (5 Unit + 1 Integration) | `npx vitest run` |
| entfernte Funktionen | 1 (`csvField`) | `aufmass.ts` |
| neue Sprachschlüssel | 1 in drei Sprachen | `aufmass/locales/*` |

## Folgemaßnahmen

- [ ] **Tabellenprogramm-Probe nachholen** (Excel oder LibreOffice): Direktöffnung, Import als
      Text, erneutes Speichern. Ohne sie ist die Abnahme der Karte unvollständig.
- [ ] Belegskripte liegen unter `work/` außerhalb der Versionierung (Punkt M10-004).
