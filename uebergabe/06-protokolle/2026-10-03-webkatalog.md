# Fortschrittsprotokoll: Werkzeugkatalog als erzeugtes Register

**Datum:** 2026-10-03  
**Status:** abgeschlossen

## Umfang

Schritt 1 von drei für die geplante Katalogsuche: die zentrale, automatisch mitgepflegte Datenbank. Enthalten sind die Deklaration der Dateifähigkeiten je Werkzeug, Kurzbeschreibung und Suchbegriffe je Sprache, Werkzeugsymbole, das erzeugte Register und seine erzwungene Prüfung. **Nicht** enthalten: die Suchoberfläche (Schritt 2) und das Ablegen einer Datei mit Werkzeugvorschlag (Schritt 3).

## Ergebnisse

- Manifestvertrag erweitert: `summaryKey` und `termsKey` sind Pflicht, dazu `files: { input?, auxiliary?, output? }`. Ein Werkzeug ohne Dateieingabe behält kein Dateifeld; eines, das nur Informationen liefert, deklariert keine Ausgabe.
- `knownFormats` in `packages/core` ist die einzige Quelle für Formatnamen und Dateiendungen. Ein nicht eingetragener Typ lässt die Prüfung scheitern.
- `scripts/catalog-generate.mjs` erzeugt `packages/tools/src/catalog/toolIndex.ts` aus Manifesten und Sprachkatalogen. Es liest die TypeScript-Module über die Compiler-Schnittstelle des Projekts ein, ohne neuen Bauwerkzeugkasten und ohne Zusatzabhängigkeit.
- `npm run catalog:check` ist Bestandteil von `npm run check` und `npm run build` und scheitert, sobald die Registerdatei veraltet ist.
- Sechs Symbole unter `apps/web/public/tools/<id>.svg`; sie liegen im Vorab-Cache und kosten nichts, bis sie angezeigt werden.
- Die Oberfläche liest aus dem Register: Katalogkarten zeigen Symbol und Kurzbeschreibung, Dateifelder ihr `accept`, Werkzeugseiten ihre Formatliste. Bild-Metadaten unterscheiden dabei „Formate" (alles Lesbare) und „Nur lesbar" (lesbar, aber nicht verlustfrei bereinigt).
- Die von Hand getippten `accepted`-Texte sind entfallen. Die Prüfung verbietet zusätzlich `accept="…"` in den Werkzeugoberflächen.
- Das Register enthält den Suchtext **aller** Sprachen: ein deutscher Suchbegriff wird später auch englische Werkzeuge finden und umgekehrt; angezeigt wird in der eingestellten Sprache.
- Erledigt und damit aus `01-stand/offene-punkte.md` entfernt: „Standardisierten Generator bzw. Check für neue Tools definieren". Der Register-Generator ist dieser Check — ein neues Werkzeug ohne Kurzbeschreibung, Suchbegriffe, Dateideklaration oder Symbol kommt nicht durch `npm run check`.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeuge im Register | 6 | `npm run catalog:check` |
| Sprachen | 2 (de, en) | `npm run catalog:check` |
| Symbole geprüft | 6 | `npm run catalog:check` |
| Suchbegriffe gesamt (beide Sprachen) | 114 | `npm run catalog:check` |
| Deklarierte Dateitypen | 25 | `npm run catalog:check` |
| Tests | 52 bestanden (vorher 40) | `npm run check` |
| Lizenzprüfung | 478 Pakete, 12 Texte, 165 Dokumente (unverändert) | `npm run licenses:check` |
| Hauptbundle | 421,20 kB (127,30 kB komprimiert) | `npm run build` |
| Zuwachs durch das Register | +8,77 kB (+2,12 kB komprimiert) | Vergleich mit `b0809d2` |
| Vorab-Cache | 14 Einträge (1.319,86 KiB), vorher 8 | `npm run build` |
| Fehlschlagproben | 9 von 9 erwarteten Fehlschlägen eingetreten | `catalog-probes.mjs` |
| Sichtprüfung | 6 von 6 Karten mit Symbol und Kurztext, keine Konsolenfehler | Edge headless über DevTools-Protokoll |

## Relevante Verweise

- Commit/PR: `ef1d13e`
- Konzept: `uebergabe/03-konzepte/2026-10-02-bild-suite.md` (Bild-Suite, betrifft die Dateitypen)
- ADR: nicht angelegt; die Architekturentscheidung steht in `docs/architecture.md` (Abschnitt „Tool contract")
- Skript: `scripts/catalog-generate.mjs`, Register: `packages/tools/src/catalog/toolIndex.ts`

## Folgemaßnahmen

- [ ] Deutsche Suchbegriffe gegenlesen (Entwurf unten)
- [ ] Schritt 2: Suchfeld und Sprachübergriff im Katalog
- [ ] Schritt 3: gezogene Datei schlägt passende Werkzeuge vor
- [ ] Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs erneut messen; Ausweg ist das Register als abgerufene Datei

## Entwurf der deutschen Suchbegriffe (zum Gegenlesen)

> **Nachtrag 2026-10-03:** Diese Liste war der erste Entwurf mit 114 Einträgen. Auf Wunsch wurden die Begriffe deutlich erweitert; der gültige Stand umfasst 620 Einträge und steht im Protokoll `2026-10-03-katalogsuche.md`. Der ursprüngliche Entwurf bleibt hier als Verlauf stehen.

| Werkzeug | Kurzbeschreibung | Suchbegriffe | Schlagwörter |
|---|---|---|---|
| Textstatistik | Zählt Zeichen, Wörter und Zeilen. | Text, zählen, Wörter, Zeichen, Zeilen, Statistik, Länge, Umfang | #text |
| Groß-/Kleinschreibung | Ändert Groß- und Kleinschreibung. | Großschreibung, Kleinschreibung, Großbuchstaben, Kleinbuchstaben, Titelschreibung, umwandeln, Text | #text |
| JSON formatieren | Rückt JSON ein und prüft es. | JSON, formatieren, einrücken, verschönern, prüfen, validieren, Fehler finden | #entwicklung |
| QR-Code-Generator | Erzeugt QR-Codes als Bild. | QR-Code, WLAN, Zugang, Visitenkarte, vCard, Link, Adresse, E-Mail, erzeugen | #generator |
| Bild-Metadaten | Zeigt und entfernt versteckte Bilddaten. | Metadaten, EXIF, GPS, Standort, Ortsdaten, entfernen, löschen, Foto, Handyfoto, Privatsphäre, Datenschutz | #datenschutz, #bilder |
| Bild skalieren | Ändert Größe, Zuschnitt und Ausrichtung. | skalieren, verkleinern, vergrößern, Bildgröße, Zuschnitt, zuschneiden, drehen, spiegeln, Foto, Profilbild | #bilder |
