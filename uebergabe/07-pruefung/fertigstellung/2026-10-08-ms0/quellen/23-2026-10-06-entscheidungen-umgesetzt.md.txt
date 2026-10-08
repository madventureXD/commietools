# Fortschrittsprotokoll: Umsetzung der drei Entscheidungen vom 2026-10-06

**Datum:** 2026-10-06  
**Status:** abgeschlossen

## Umfang

Thomas hat am 2026-10-06 drei offene Entscheidungen beantwortet, die aus dem
Barrierefreiheits-Durchgang und der spanischen Sprachabnahme stammten:

1. Markenfarbe (Kontrast weiß auf Rot): **„so lassen"**
2. Gestaltung der Hauptaktion: **„eine Regel"** (statt 18 Einzeländerungen)
3. Spanische Anredeform: **„unpersönlich Infinitiv"**

Dazu gab er das **Go für Welle D**. Dieses Protokoll deckt die Punkte 1 bis 3 ab.

## Ergebnisse

### 1. Markenfarbe bleibt — mit einer Korrektur meiner früheren Aussage

Die Entscheidung lautet: die Markenfarbe wird nicht geändert. Bei der Nachmessung fiel auf, dass
meine frühere Angabe zu grob war:

| Schema | Hintergrund der Hauptaktion | Weiß darauf | verlangt |
|---|---|---:|---:|
| **hell** | `rgb(201, 31, 44)` | **5,65:1** | 4,5:1 — **bestanden** |
| **dunkel** | `rgb(255, 75, 89)` | **3,28:1** | 4,5:1 — **unterschritten** |

Im Bericht zum Durchgang stand „betrifft jeden Hauptknopf im Projekt" (38 Vorkommen in 14 Routen).
**Richtig ist: der Kontrastmangel besteht nur im dunklen Schema.** Im hellen Schema ist derselbe
Knopf mit 5,65:1 unauffällig. Das war eine Messlücke, keine Fehlmessung: der Durchgang lief im
Vorgabeschema des Browsers (dunkel), das helle Schema wurde nicht mitgemessen.

**Umgesetzt:**
- `scripts/viewport-audit.mjs` misst das Schema jetzt ausdrücklich
  (`COMMIETOOLS_AUDIT_SCHEME=dark|light`) und nennt es in der Schlusszeile. Ein vollständiger
  Durchgang läuft **zweimal**; das steht als Kommentar im Skript. Damit ist die Lücke geschlossen.
- Die entschiedene Ausnahme steht **im Prüfer**, nicht im Verborgenen: `AKZEPTIERTE_KONTRASTE`
  nennt Auswahl, Grund und Datum; solche Funde werden **getrennt gezählt und weiterhin
  ausgewiesen** (`akzeptiert=N` in jeder Zeile). Sie verschwinden also nicht, sie werden nur nicht
  als Befund gewertet. Ohne diesen Schritt hätte der Prüfer nach der Entscheidung 18 weitere
  Routen rot gemeldet und wäre damit unbrauchbar geworden.

### 2. Die Hauptaktion hat jetzt eine Regel

Kein Werkzeug wurde angefasst; ergänzt wurden die **Selektoren** der vorhandenen Regeln in
`apps/web/src/styles.css`:

```css
.button, form > button[type="submit"] { … }
.button.primary, form > button[type="submit"] { … }
.button:disabled, form > button[type="submit"]:disabled { … }
.button:hover, form > button[type="submit"]:hover { … }
```

**Gemessen am Artefakt** (`work/nachpruefung-entscheidungen.cjs`, Route `/tools/paving`):
Der Knopf ist 1052 × 44 px, Hintergrund `rgb(201, 31, 44)` im hellen und `rgb(255, 75, 89)` im
dunklen Schema, Schrift weiß und 700 — vorher war es der Browser-Standardknopf (grau, 400, 27 px,
ohne Rahmenfarbe). Die Werte sind nicht neu gesetzt, sondern dieselben wie `.button.primary`;
damit können sie nicht auseinanderlaufen.

### 3. Spanische Anredeform umgestellt (31 Stellen in 21 Dateien)

Unpersönlicher Infinitiv statt persönlicher Anrede. Der erste Suchlauf hatte 20 Stellen vermutet;
die vollständige Bestandsaufnahme (`work/anrede-inventar.cjs`, 70 Verbformen) fand **45 Schlüssel**
im ganzen Projekt. Davon sind:

- **31 echte Anredeformen** — umgestellt („Elige el archivo" → „Seleccionar archivo",
  „Introduce un valor." → „Introducir un valor.", „Rellene todos los campos." →
  „Rellenar todos los campos.", „Dibuja una firma, ingresa un nombre o elige una imagen." →
  „Dibujar una firma, introducir un nombre o seleccionar una imagen.", „Pruebe códigos…" →
  „Probar códigos…").
- **14 keine Anredeform** — unverändert gelassen, weil dritte Person oder Substantiv:
  `catalog.searchHint` („Busca términos…" = „[die Suche] sucht"), `imageResize.summary`
  („Cambia de tamaño" = „[es] ändert"), `pdfViewer.description` („Abre y busca"),
  `pdfCertificateSign.summary`, `pdfMetadata.scope`, `pdfCrop.description`,
  `pdfRedact.description`, `save.downloadStarted` („Descarga iniciada" — Substantiv),
  `pdfVerify.valid` / `.invalid` / `pdfVerify.modification.signature` und
  `pdfSignature.image` („Firma" = Unterschrift), `pdfWatermark.terms` (Begriffsliste),
  `caseConverter.summary`. Alle 14 stehen mit ihrem deutschen Wortlaut im Inventar und sind
  geprüft worden, nicht übersehen.

**Zwei Stellen außerhalb der reinen Anrede wurden mit angepasst und ausdrücklich benannt:**
- `tool.aufmass.error.empty`: das spanische „una cadena" (Zeichenkette) war zu unscharf für
  „Maßkette" → „una **cadena de medidas** o una fórmula". Damit ist eine Bedeutung
  wiederhergestellt, die vorher verloren war.
- `tool.iconGenerator.manifestHint`: „Guarde los PNG guardados…" → „…: guardar los PNG junto al
  archivo de manifiesto." Das doppelte „guardados" entfiel mit dem Imperativ.

**Nicht angefasst, aber gemessen und gemeldet** (eigene Entscheidung nötig): derselbe Text meint
„Maus"/„Stift" zweimal verschieden — „mouse" (2 Dateien) gegen „ratón" (1), „bolígrafo" (1) gegen
„lápiz" (2).

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 54 Werkzeuge, drei Sprachen, 3.636 Suchbegriffe |
| `npm run catalog:check` | bestanden |
| `npm run check` | **440 Tests in 30 Dateien** bestanden |
| `npm run build` | EXIT 0, Startlast 146.990 B gzip, Bündelprüfung bestanden |
| Barrierefreiheit Handwerk, dunkel | **bestanden**, 10 Routen × 2 Breiten, `akzeptiert=1` je Durchgang |
| Barrierefreiheit Handwerk, hell | **bestanden**, `akzeptiert=0` (heller Kontrast ist ausreichend) |
| Bedienziel des Absende-Knopfs | 1052 × 44 px in beiden Schemata (vorher 1052 × 27) |
| Spanische Texte am Artefakt | Fehlermeldung „Introducir una expresión." im Rechner gelesen; keine alte Anredeform auf der Seite |
| Verbleibende Anredeformen | 14, alle als dritte Person oder Substantiv belegt |

## Relevante Verweise

- Commit: siehe „Git" im Sitzungsbericht
- Entscheidung: Thomas, 2026-10-06 (drei Antworten auf die offenen Punkte)
- Ausnahme im Prüfer: `scripts/viewport-audit.mjs`, `AKZEPTIERTE_KONTRASTE`
- Belege: `06-protokolle/screenshots/2026-10-06-entscheidungen/` (Knopf hell und dunkel,
  spanische Fehlermeldung, Durchgang außerhalb der Suite)
- Messwerkzeuge: `work/anrede-inventar.cjs`, `work/anrede-umstellen.cjs`,
  `work/nachpruefung-entscheidungen.cjs`

## Offene Punkte

- [ ] **Verbleibende Bedienziele außerhalb der Suite** (Schieberegler, Kontrollkästchen,
      Tastenfelder) und **abgeschnittener Inhalt** im Programmiererrechner — unverändert offen,
      gemessen 2026-10-06.
- [ ] **Schreibweisen vereinheitlichen:** „mouse"/„ratón" und „bolígrafo"/„lápiz" in den drei
      PDF-Werkzeugen.
- [ ] **Konzept-Referenz in der spanischen Fassung vereinheitlichen** («Handwerkerwerkzeuge»
      gegen „concepto de herramientas para oficios").
- [ ] Die spanische Fassung bleibt **lokales Testpaket**, bis die sprachliche Abnahme erteilt ist;
      44 Werkzeuge des Registers sind noch nicht gegengelesen.
