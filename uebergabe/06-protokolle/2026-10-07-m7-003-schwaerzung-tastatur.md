# M7-003 — PDF-Schwärzung ohne Tastaturalternative: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Karte:** `QM/70-reparaturempfehlungen/R5.md`, Abschnitt M7-003 (R5, Stufe D)
**Auftrag:** Thomas, wörtlich: „R5 bis zum Ende durchziehen."
**Status:** **erledigt** — mit vier benannten Grenzen (unten).

## Karte im Wortlaut (Abnahme)

> „Nur Tastatur: Datei wählen, Seite wählen, Rechteck exakt setzen, ändern, entfernen,
> exportieren. Ergebnis unabhängig prüfen: betroffener Inhalt tatsächlich entfernt, nicht nur
> optisch übermalt. Rotation, Zoom, Seitenrand und Touch-Gegenprobe."

**Nicht tun:** „Ein ARIA-Label auf der Zeichenfläche macht Zeichnen nicht tastaturbedienbar.
Zugänglichkeit darf Schwärzungssicherheit nicht ersetzen."

## Bestandsaufnahme vor der Änderung

`apps/web/src/tools/PdfComplianceTools.tsx` (PdfRedactTool): Rechteckauswahl **ausschließlich**
über `onPointerDown/Up`; ein einziger Bereich (`area`); keine Tastatureingabe; keine Liste; keine
Fehlermeldung. Damit war die Karte berechtigt.

## Umgesetzt

- **Ein Rechteckmodell für beide Eingabewege.** Bereiche werden in Anzeigekoordinaten geführt;
  das Tastaturformular (X/Y/Breite/Höhe in Punkten) und der Zeigerweg schreiben in dasselbe Modell.
  Der Zeigerweg füllt zusätzlich die vier Felder — gemessen im Beleg.
- **Liste aller Bereiche** mit Seitenbezug („Bereich 1, Seite 1: X … Y … Breite … Höhe …"),
  je Bereich ein Entfernen-Knopf; mehrere Bereiche auch über mehrere Seiten.
- **Pfeiltasten** verschieben den fokussierten Bereich um 1 Punkt, mit Umschalttaste um 10; an den
  Seitenrändern wird geklemmt (`nudgeRedactionArea`, reine Funktion im Kern).
- **Fehlerweg mit Feldkennzeichnung:** außerhalb der Seite / Größe 0 / Nicht-Zahl werden mit
  übersetzter Meldung abgewiesen, die betroffenen Felder tragen `aria-invalid` (nur Breite/Höhe bei
  „Größe 0", alle vier sonst).
- **Gemeinsame Prüfstelle im Kern:** `normaliseRedactionArea` (Grenzen, Größe, Nicht-Zahl) — von
  Formular, Zeigerweg und Tests benutzt.
- Bestätigung vor der Schwärzung bleibt (Karte: „bewusst bestätigen").
- Sprachschlüssel in **de/en/es** ergänzt (19 je Sprache).

## Der eigentliche Fund: Koordinatenraum auf gedrehten Seiten

Die Karte verlangt „Previewkoordinaten korrekt in PDF-Koordinaten inklusive Rotation/Zoom
übertragen". Erste Umsetzung: Umrechnung Anzeige → unrotierter PDF-Raum (Formel gegen pdf.js
`convertToPdfPoint` geprüft). **Im Beleg fiel sie durch:** Auf einer um 90 Grad gedrehten Seite
blieb der Text trotz passend gerechneter Fläche stehen.

Sonde `work/m7-003-rotation-sonde.mjs` (MuPDF direkt, fünf Kandidaten):

| Kandidat | Ergebnis |
|---|---|
| unrotierter Raum, Textbox | Text **bleibt** |
| unrotierter Raum, großzügig | Text **bleibt** |
| **Anzeigekoordinaten (quer 842 × 595)** | **Text entfernt** |
| Anzeige, y gespiegelt | Text bleibt |
| unrotierter Raum, y von unten | Text bleibt |

**MuPDF setzt Redaktionsrechtecke im angezeigten Seitenraum** — die Rotation wird nicht
eingerechnet. Die Umrechnung ist damit überflüssig und war in der alten Fassung (und in meiner
ersten) **falsch**. Umgesetzt: Bereiche liegen in Anzeigekoordinaten, die Grenzprüfung und die
Seitengrößen-Anzeige nutzen die Anzeigemaße. Der Regressionstest
`apps/web/src/pdf-redaction-rotation.test.ts` hält beide Hälften fest (Anzeigekoordinaten treffen,
unrotierte treffen nicht).

## Belege (echte Ausführung)

**Tastaturabnahme** `work/m7-003-beleg.cjs` (kopflose Edge, ausgelieferter Bau):
Bereich per Tastatur gesetzt (X 95,0 / Y 135,0 / Breite 170,0 / Höhe 40,0) · Pfeiltaste 95 → 96 ·
Umschalt+Pfeil 96 → 106 · Fehlerweg „Der Bereich liegt ganz oder teilweise außerhalb der Seite."
mit `aria-invalid` an allen vier Feldern · Bereich entfernt · Bestätigung mit der Leertaste ·
Speichern über den Rückfallweg · **Ergebnis unabhängig geprüft:** Textebene Seite 1 **ohne
„GEHEIM"** (pdf.js), Seite 2 unverändert „OEFFENTLICH", schwarz gefüllter Pfad vorhanden;
**Pixelmessung mit MuPDF:** 1700 von 1700 Rasterpunkten im Bereich dunkel, Punkt außerhalb weiß,
Bereichsmitte schwarz.

**Rotation** `work/m7-003-rotation.cjs` (frischer Browser, rotierte Seite als erste Datei):
Textposition unabhängig aus pdf.js · Zeigerweg über dem sichtbaren Text · Bereich X 684,3 /
Y 86,7 / Breite 55,3 / Höhe 161,2 · **Text „DREHTEXT" entfernt** · Fläche im Raster sichtbar
(2239 dunkle Punkte). Der Zeigerweg füllte dabei das Tastaturformular (ein Modell).

**Prüfkette:** `npm run check` Exit 0 (**706 Tests in 50 Dateien**, 0 Lint-Fehler) ·
`npm run build` Exit 0. Commit `17ce942`, **nichts gepusht**.

## Benannte Grenzen (nicht herstellbar bzw. nicht gemessen)

1. **Nativer Dateiauswahldialog** ist kein DOM: Die Datei wird im Beleg per CDP ins Feld gelegt.
   Der Weg „Datei wählen" ist damit nicht mit der Tastatur gemessen, nur das Feld selbst.
2. **Zweites Setzen einer Datei** in derselben Sitzung nimmt das Werkzeug im Prüfmittel nicht mehr
   an (gemessen mit `work/m7-003-diag2.cjs`: `change`-Ereignis kommt an, keine Reaktion, keine
   Konsolenmeldung — beide Einspeisewege). Ein zweites Laden derselben Route zeigt dasselbe Bild.
   Ob das ein Produkt- oder ein Prüfmittelverhalten ist, ist **nicht geklärt**; für den echten
   Nutzerweg (nativer Dialog) gilt es nicht als Befund. Als offener Punkt geführt.
3. **Touch-Gegenprobe:** kein Touchgerät vorhanden; der Weg „Finger" ist derselbe Pointer-Pfad.
4. **Zoom** ist über die Skalierung im Zeigerweg belegt (Bildpunkte → Anzeigepunkte), aber nicht
   bei einer von 100 % abweichenden Zoomstufe gemessen.
5. Echte Vorleseransage (NVDA/Narrator) fehlt in dieser Umgebung.

## Nebenbefund

`npm run tokens:check` hat die erste CSS-Fassung **abgelehnt** (Rohfarbe `rgb(0 0 0 / 35%)` für den
Entwurfsrahmen) — der in U1 gebaute Tokenschutz greift also. Statt einer Ausnahme wurde die
Rohfarbe entfernt (Entwurf: gestrichelter Rahmen + Deckkraft, gleiche Markenfarbe).
