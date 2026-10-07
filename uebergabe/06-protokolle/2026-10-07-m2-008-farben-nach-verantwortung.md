# M2-008 — Oberflächenfarben umgingen das semantische Tokensystem

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Karte:** M2-008 (R5)
**Ergebnis:** behoben; Rohfarben werden jetzt gemeldet und brauchen eine begründete Ausnahme.

## Was die Karte verlangt

- Farben nach **Verantwortung** klassifizieren: Appoberfläche, Dokumentbühne, Datenkurve,
  exportierter Dokumentinhalt.
- Für UI-Bühne, Achsen, Raster und Text **semantische Tokens je Schema** einführen und den Plotter
  daraus speisen.
- Benutzerdefinierte Kurvenfarben und absichtlich weißes PDF-/QR-Papier dürfen **explizite
  Dokumentfarben** bleiben.
- Exportstile brauchen **aufgelöste** Farben statt ungelöster CSS-Variablen.
- Der Token-/Kontrastprüfer **darf Rohfarben melden**, braucht dafür aber begründete, eng gefasste
  Ausnahmen.
- Abnahme: helles und dunkles Schema mit Kurven, Achsentext, Raster, Schwärzungsfläche und
  PDF-/QR-Export vergleichen; Daten-/Dokumentfarben bleiben fachlich identisch, UI-Texte lesbar.
- **Nicht tun:** kein globales Ersetzen aller `#fff` durch Themefarben.

## Bestandsaufnahme (gemessen)

Die drei in der Karte genannten Stellen plus die Umgebung, mit dem Stylesheet-Parser erhoben:

| Ort | Zustand vorher | Verantwortung |
|---|---|---|
| `Plotter.tsx` Raster/Zwischenachse | `#dddddd` fest | UI-Bühne → Token |
| `Plotter.tsx` Nulllinie/Y-Achse | `#888888` fest | UI-Bühne → Token |
| `Plotter.tsx` Achsenbeschriftung | `#666666` fest | UI-Text → Token |
| `Plotter.tsx` Kurvenfarben (5) | Palette fest | **Datenfarbe** — bleibt |
| `styles.css` `.pdf-viewer-stage` | `#303238` fest | Dokumentbühne → Token |
| `styles.css` `.redaction-editor` | `#777` fest | Dokumentbühne → Token (dieselbe Verantwortung!) |
| `styles.css` `.qr-canvas` | `#fff` | **QR-Papier** — bleibt (Dokumentfarbe) |
| `styles.css` `.pdf-viewer-thumbs img` | `white` | **Dokumentpapier** — bleibt |
| `styles.css` `.signature-pad canvas` | `white` | **Unterschriftenpapier** (wird als Bild ausgegeben) — bleibt |
| `styles.css` `.redaction-box` | `rgb(0 0 0 / 72%)` | **Schwärzungsmarke** — bleibt |

**Zusätzlich gefunden — dasselbe Muster wie M7-001, an drei Stellen übersehen:**
`color: white` auf Markenrot stand noch in `.brand-mark`, `.keypad-key.equals` und `.anchor-grid .active`.
Bei den ersten beiden ergibt weiße Schrift auf dem dunklen Markenrot 3,16:1 (verlangt 4,5:1). Bei
`.anchor-grid .active` war es **schlimmer**: dort fehlte jede Markenfläche, die weiße Beschriftung
stand im hellen Schema auf weißem Grund — die Beschriftung des gewählten Ankerpunkts war unsichtbar.
`a11y:check` hat es nicht gemeldet, weil diese Elemente in den geprüften Startzuständen nicht
sichtbar sind (das Schlüsselbrett muss aufgeklappt, ein Ankerpunkt gewählt werden).

**Exportstile:** Der Plotter hat keinen eigenen Export. Die exportierenden Wege (PDF-Bericht,
Aufmaß-PDF, Beschriftung, QR) tragen **aufgelöste** Farbwerte; der Tokenschutz aus Einheit 1 findet
`var()` ausschließlich in `styles.css` (2 CSS-Dateien, 471 Verwendungen) — in Exportcode keine
einzige ungelöste Variable.

## Umsetzung

1. **Neue Tokens je Schema** (`packages/ui/src/tokens.css`):
   `--color-document-stage`, `--color-plot-grid`, `--color-plot-axis`, `--color-plot-label`.
   Dunkle Werte so gewählt, dass sie auf der dunklen Fläche messbar lesbar bleiben:
   Raster `#3a404b`, Achse `#77808f`, Beschriftung `#c8cdd6`, Bühne `#22262c`.
2. **`styles.css`:** Dokumentbühne für Viewer **und** Schwärzungseditor aus `--color-document-stage`
   (vorher zwei verschiedene Grautöne `#303238` und `#777` für dieselbe Aufgabe — bewusst
   vereinheitlicht, also eine sichtbare Änderung im Schwärzungseditor); die drei Weiß-auf-Marke-Stellen
   auf `--color-action-text` bzw. die etablierte Aktiv-Regel (Markenfläche + `--color-action-text`);
   neue Klassen `.plot-grid`, `.plot-axis`, `.plot-label`.
3. **`Plotter.tsx`:** Raster, Achsen und Beschriftung über Klassen statt fester Attributwerte.
   Die Kurvenfarben-Palette bleibt unverändert im Quelltext — sie ist Datenfarbe.
   *(Technischer Grund für Klassen statt `var()` im Attribut: SVG-Präsentationsattribute kennen kein
   `var()`; nur CSS-Eigenschaften tun das.)*
4. **`scripts/token-audit.mjs`:** Rohfarben werden erfasst und **gemeldet**; eine Rohfarbe **ohne**
   begründete Ausnahme lässt die Prüfung scheitern. Sechs eng gefasste Ausnahmen mit Grund
   (Dokumentpapier, QR-Papier, Unterschriftenpapier, Schwärzungsmarke, Fadenkreuz der Pipette,
   Abdunklung hinter modalen Flächen). Schatten- und Filtereigenschaften sind ausgenommen, weil sie
   keine Flächen- oder Textfarbe setzen; vollständig durchsichtige Angaben (`#0000`) ebenfalls, weil
   sie keine Farbe setzen.

## Belege (gemessen, `work/m2-008-farben-beleg.cjs`, Messwerte in `work/m2-008-messwerte.json`)

Beide Schemata über `Emulation.setEmulatedMedia('prefers-color-scheme')`, Zustände **erzeugt**
(zwei Kurven gezeichnet, Dokument im Viewer geladen, Schwärzungsrahmen mit Zeigerbewegung gezogen,
QR erzeugt):

| Messung | hell | dunkel |
|---|---|---|
| Kurvenfarben (Datenfarben) | `rgb(201,31,44)`, `rgb(31,111,201)` | **identisch** |
| Raster | `rgb(221,221,221)` | `rgb(58,64,75)` |
| Achse | `rgb(136,136,136)` | `rgb(119,128,143)` |
| Achsenbeschriftung | `rgb(102,102,102)` | `rgb(200,205,214)` |
| Fläche hinter dem Schaubild | `rgb(246,247,249)` | `rgb(16,17,20)` |
| **Kontrast der Beschriftung** | **5,36:1** | **11,83:1** |
| Dokumentbühne | `rgb(48,50,56)` | `rgb(34,38,44)` |
| Papier (Vorschaubild) | `rgb(255,255,255)` | `rgb(255,255,255)` |
| Schwärzungsmarke | `rgba(0,0,0,0.72)` | `rgba(0,0,0,0.72)` |
| QR-Ausgabe (Prüfsumme der Zeichnung) | `83d3a137a49edae1` | **identisch** |

**Vorher-Wert für die dunkle Beschriftung** (Token ausschließlich **im Browser** auf `#666666`
überschrieben, kein Eingriff am Quelltext): `rgb(102,102,102)` auf `rgb(16,17,20)` = **3,29:1** —
unter den verlangten 4,5:1. Nach der Änderung **11,83:1**. Im hellen Schema bleibt es bei 5,36:1,
weil dort bewusst derselbe Wert wie vorher steht.

**Kette:** `npm run check` Exit 0 — Tokenschutz grün (471 Verwendungen, 6 begründete Rohfarben-
Ausnahmen), 695 Tests in 48 Dateien, 0 Fehler, 109 Warnungen. `npm run build` Exit 0
(Startbündel 149490 B gzip).

## Benannte Grenzen

- **Der QR-Export wurde als Zeichnung geprüft, nicht als Datei.** Gemessen ist die Zeichnung, aus der
  die Datei entsteht (Prüfsumme in beiden Schemata gleich), nicht die heruntergeladene Datei selbst.
- **Kein reales Mobilgerät, kein echter Vorleserlauf** — für M2-008 nicht verlangt.
- **Die Seitendarstellung im kopflosen Browser ist unzuverlässig.** Im ersten Anlauf mit beiden
  Schemata in *einem* Browserprozess kam die Seitendarstellung im zweiten Durchgang auch nach 45 s
  nicht zustande; je Schema in einem eigenen Browserlauf gelingen Viewer und Schwärzungseditor im
  ersten Versuch. Der Beleg führt deshalb beide Schemata getrennt und einen protokollierten
  Wiederholungsversuch (bis zu drei) — ein Erfolg im zweiten Anlauf wird als solcher ausgewiesen.
  Ursache liegt in der Prüfumgebung; im Produkt nicht nachgewiesen.

## Prüfmittel-Lehren (eigene Fehler, für die Akte)

1. **Urteilsfehler:** Das Urteil verglich `plot.label` — ein Feld, das es nicht gibt — und meldete
   „Achsenbeschriftung in beiden Schemata gleich". Beide Seiten waren `undefined`. Ein Vergleich
   zweier fehlender Werte ist eine Übereinstimmung, die nichts bedeutet; der Fehler war im Urteil,
   nicht in der Messung.
2. **Irrweg Doppel-Durchgang:** Zwei Schemata in einem Browserprozess erzeugen schwere
   Seitendarstellungen nicht zuverlässig. Erst der Einzelaufruf je Schema trennt Prüfumgebungs- von
   Produktverhalten.
3. **`\b` über ein Python-Heredoc geschrieben wird zu einem Rückschritt-Zeichen.** Der Farbmelder
   fand dadurch zunächst nur 2 statt 8 Rohfarben, weil das Wortgrenzen-Muster still kaputt war. Ein
   Prüfmittel, das zu wenig findet, sieht aus wie ein sauberes Ergebnis.
