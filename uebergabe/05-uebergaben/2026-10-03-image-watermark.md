# Übergabe: Werkzeug „Wasserzeichen“ gebaut

**Datum:** 2026-10-03
**Bearbeitet durch:** Faber (Hermes Agent)
**Status:** abgeschlossen

## Ziel der Sitzung

Auftrag von Thomas: „Beide“ — die nächsten beiden Werkzeuge der Bild-Suite nach der
Konzeptreihenfolge. Dies ist das erste davon, `image-watermark`: Text oder Logo als
Wasserzeichen auf ein Bild setzen, mit Position, Größe, Deckkraft, Drehung und Kachelmuster,
lokal und offline. Mit eigener Open-Source-Recherche vor der Festlegung.

## Ergebnis

Das Werkzeug ist gebaut, geprüft und benutzbar. Ein Bild lässt sich mit einer Textzeile (Schrift,
Farbe) oder einem eigenen Logo versehen — einzeln an einer von neun Positionen oder als
Kachelmuster über das ganze Bild, mit Größe, Deckkraft, Drehung, Randabstand und Musterabstand
als Regler. Die Vorschau rechnet mit derselben Geometrie wie das Ergebnis; gespeichert wird in
der Originalgröße der Quelle.

**Keine neue Abhängigkeit.** Gezeichnet wird mit der Canvas-API, ohne `watermarkjs` (seit 2020
ohne Pflege und ohne Kachelung) und ohne weitere Fremdbibliothek. `package-lock.json` unberührt.

## Geänderte Bereiche

- `packages/tools/src/image/watermark/watermark.ts` – Verarbeitungslogik: Anker, Skalierung,
  Kachelraster mit Drehung
- `packages/tools/src/image/watermark/locales/{de,en,index}.ts` – werkzeugnahe Texte
- `packages/tools/src/index.ts` – Ausfuhren der neuen Logik
- `packages/tools/src/locales.ts` – Werkzeugkatalog eingebunden
- `packages/tools/src/catalog/manifests.ts` – Manifest `image-watermark`, Suite `image` erweitert
- `packages/tools/src/catalog/toolIndex.ts` – erzeugt
- `apps/web/public/tools/image-watermark.svg` – Symbol
- `apps/web/src/tools/ImageWatermark.tsx` – Oberfläche
- `apps/web/src/tools/imageWatermarkRender.ts` – Messen und Zeichnen der Marke
- `apps/web/src/App.tsx` – Route
- `apps/web/src/styles.css` – Ankerfeld und Vorschaufläche
- `apps/web/src/image-watermark.test.ts` – 16 neue Prüfungen
- `apps/web/src/tool-catalog.test.ts`, `apps/web/src/tool-search.test.ts` – Erwartungen ergänzt
- Doku: `01-stand/aktueller-stand.md`, `03-konzepte/2026-10-02-bild-suite.md`, `README.md`

## Entscheidungen und Annahmen

- **Kein Paket.** `watermarkjs` kann keine Muster kacheln und ist seit 2020 unverändert; die
  Empfehlung des Konzepts (Canvas direkt) hat die Recherche bestätigt. Der Aufwand ist
  Geometrie, nicht Bildverarbeitung.
- **Die Marke wird an der kurzen Bildkante gemessen.** Eine Größenangabe in Prozent bedeutet
  deshalb auf Hoch- und Querformaten dasselbe.
- **Rotation dreht nur die Zeichnung, nicht die Platzierungsbox.** So bleiben Vorschau und
  Ergebnis an derselben Stelle; die Boxen sind achsenparallel und die Drehung geschieht um
  ihren Mittelpunkt.
- **Das Kachelraster entsteht über der Diagonalen**, zentriert auf das Bild und um den
  Drehwinkel gedreht. Dadurch bleibt bei jeder Drehung keine Ecke leer.
- **Das Wasserzeichen wird eingerechnet** und ist danach nicht mehr zu entfernen. Das steht als
  Hinweis in der Oberfläche — ein Werkzeug, das das verschweigt, wäre irreführend.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | bestanden; Typprüfung ohne Fehler, **117 Tests** bestanden (vorher 116), Katalogprüfung bestanden (13 Werkzeuge, 13 Symbole, 942 Begriffe, 51 deklarierte Dateitypen), Lizenzprüfung bestanden (496 Pakete) |
| `npm run build` | bestanden; Hauptbundle 503,28 kB (148,96 kB komprimiert), Stylesheet 21,32 kB (4,60 kB), Vorab-Cache 27 Einträge |
| **eigene Prüfungen fanden drei Fehler, alle behoben** | 1. Die neun Anker waren zeilen-/spaltenverdreht („oben links“ landete auf halber Höhe). 2. Ein großer Randabstand konnte die Marke aus dem Bild schieben; der Abstand gibt jetzt nach. 3. Im Muster stapelten sich Textzeilen im Abstand der Glyphenhöhe (7 px); das Zeilenraster hält jetzt mindestens die halbe Markenbreite Abstand. Ohne die Tests wären alle drei durchgegangen |
| echter Browser (Edge headless über CDP) mit echtem Foto (640 × 480, als PNG) | bestanden; Überschrift, neun Ankerknöpfe mit korrekten Beschriftungen, Marke 86 × 55 px, Vorschau und Ergebnis stimmen überein |
| **Pixelvergleich Original gegen Ergebnis (PNG-Quelle, dadurch verlustfrei)** | **356 veränderte Pixel, davon 0 in der bildfreien Ecke oben links und 356 im Bereich der Marken** — das Bild selbst bleibt unangetastet, nur das Wasserzeichen wird eingerechnet |
| Kachelmuster | bestanden; 255 Kacheln vor der Abstandskorrektur, danach deutlich weniger Kacheln mit sichtbarem Zeilenabstand; 76 240 veränderte Pixel über das ganze Bild |
| Logo-Modus | bestanden; zweites Dateifeld erscheint, Logo wird proportional skaliert (86 × 34 px bei einem 300 × 120 großen Logo), Raster über dem ganzen Bild |
| zwei Fensterbreiten (1360 px und 420 px) | bestanden; kein Überlauf, Ankerfeld und Regler vollständig bedienbar |

## Offene Punkte und Risiken

- [ ] **Das Hauptbundle überschreitet 500 kB** (503,28 kB, 148,96 kB komprimiert) und der
  Bauvorgang warnt jetzt. Ursache ist das erzeugte Werkzeugregister, das mit jedem Werkzeug und
  jeder Sprache wächst. Der im Konzept genannte Ausweg ist eine abgerufene Registerdatei mit
  Ladezustand — spätestens vor dem nächsten Werkzeug eine Entscheidung wert.
- [ ] Textmarken mit mehreren Zeilen sind nicht vorgesehen; ein Umbruch wird nicht angeboten.
- [ ] Das Muster bietet keine Zufallsverschiebung, Muster sind immer streng regelmäßig.
- [ ] Die Barrierefreiheit ist handwerklich umgesetzt (Beschriftungen je Ankerknopf, `aria-live`
  für das Ergebnis), aber nicht automatisiert geprüft.
- [ ] Ob die Vorschau bei sehr großen Bildern (über 20 Megapixel) flüssig bleibt, ist nicht
  gemessen; die Vorschau zeichnet bei jeder Reglerbewegung neu.

## Empfohlener nächster Schritt

1. `color-tools` — die dritte Zeile der Konzeptreihenfolge und laut Machbarkeitsprüfung bis auf
   die Farbrechnung abhängigkeitsfrei. Vorher oder danach die Bundlegröße entscheiden.

## Git

- Commit: `87e1ae0` (Umsetzung, Tests, Dokumentation); die Nachträge in einem zweiten Commit
- Arbeitsbaum: die genannten Bereiche; `package-lock.json` unverändert
