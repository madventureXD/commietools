# Übergabe: Werkzeug „Bild-Metadaten" gebaut

**Datum:** 2026-10-02  
**Bearbeitet durch:** Faber (Hermes Agent)  
**Status:** abgeschlossen

## Ziel der Sitzung

Auftrag von Thomas: mit dem ersten Werkzeug der Bild-Suite beginnen — Metadaten anzeigen und
entfernen — und dabei Lizenzregeln, Sprachregelung, Design-Vorgaben und Prüfpflichten des
Projekts einhalten. Grundlage war der zuvor von mir erstellte und geprüfte Konzeptvorschlag
`03-konzepte/2026-10-02-bild-suite.md`.

## Ergebnis

Das Werkzeug ist gebaut, geprüft und benutzbar: Anzeige der Metadaten eines Bildes und
verlustfreies Entfernen der Metadatenblöcke in JPEG, PNG und WebP. Die Bildpunkte werden
byteweise übernommen, es wird nicht neu gerechnet — bei JPEG, PNG und WebP bleibt das Bild
also qualitativ identisch. Alles läuft lokal und offline.

Das Werkzeug braucht **keine neue Abhängigkeit**. Damit ist die strengste Anforderung dieses
Projekts erfüllt, ohne eine Ausnahme zu beanspruchen.

## Geänderte Bereiche

- `packages/tools/src/image/metadata/metadata.ts` – Verarbeitungslogik: Formaterkennung,
  Containerprüfung, verlustfreies Entfernen, EXIF-Leser, Werteformatierung
- `packages/tools/src/image/metadata/locales/{de,en,index}.ts` – werkzeugnahe Texte
- `packages/tools/src/index.ts` – Manifest `image-metadata`, Suite `image`, Ausfuhren der Logik
- `packages/tools/src/locales.ts` – Werkzeugkatalog eingebunden
- `packages/i18n/src/suites/{de,en}.ts` – Suitenname „Bild Suite" / „Image Suite"
- `apps/web/src/tools/ImageMetadata.tsx` – Oberfläche
- `apps/web/src/App.tsx` – Route auf die Oberfläche gelegt
- `apps/web/src/styles.css` – Gestaltung für Dateibereich, Angabenliste und Bereichsmarken
- `apps/web/src/image-metadata.test.ts` – zehn Prüfungen für Erkennung, Entfernen und Lesen
- `README.md` – Abschnitt „Current scope" berichtigt: fünf Werkzeuge, vier Suiten
- `uebergabe/01-stand/aktueller-stand.md` – Werkzeug, Suite, Kennzahlen
- `uebergabe/03-konzepte/2026-10-02-bild-suite.md` – Umsetzungshinweis ergänzt

## Entscheidungen und Annahmen

- **Abweichung vom Konzept, offengelegt:** Das Konzept sah für dieses Werkzeug die Bibliothek
  `exifreader` (MPL-2.0) vor. Beim Bauen zeigte sich, dass ihr Typpaket `@types/node` verlangt
  (eine zweite Abhängigkeit in einer reinen Browseranwendung), dass sie eine einzelne 133 KB
  große, nicht baumelschüttelbare Datei mitbringt (39 KB komprimiert) und dass ihr
  Nachinstallationsschritt blockiert war. Ich habe deshalb einen eigenen Leser für die
  benötigte Teilmenge geschrieben und die Abweichung samt Begründung im Konzept festgehalten.
  **Kein Widerspruch zum Konzept, aber eine Änderung, die einer nachträglichen Zustimmung
  bedarf.** Die Lizenzregel wurde dadurch nicht umgangen, sondern ohne neue Abhängigkeit erfüllt.
- Farbprofile (ICC) bleiben standardmäßig erhalten, weil ihr Entfernen die Farbdarstellung
  verändern kann; die Einstellung ist sichtbar und abwählbar.
- APP0 (JFIF) und APP14 (Adobe-Kennung) gelten als Struktur, nicht als Metadaten, und bleiben
  erhalten.
- Formate ohne unterstützten Container (TIFF, HEIC, GIF, BMP) werden unverändert gelassen und
  ausdrücklich als nicht verlustfrei bereinigbar gekennzeichnet — statt sie stillschweigend
  neu zu berechnen.
- Die Prüfung gegen echte Dateien erfolgte über fremde Beispieldateien
  (exif-samples-Sammlung) statt nur über selbst erzeugte Ersatzbilder, weil ein eigener Leser
  gegen eigene Ersatzbilder nichts beweist.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | bestanden; Typprüfung ohne Fehler, 22 Tests bestanden, Lizenzprüfung bestanden (475 Pakete, 12 Lizenztexte, 162 Paketdokumente) |
| `npm run build` | bestanden; Hauptbundle 341,35 kB (103,91 kB komprimiert), Stylesheet 13,67 kB (3,25 kB komprimiert), PWA-Vorab-Cache mit 8 Einträgen |
| `npm run licenses:generate` / `licenses:check` | bestanden; keine Änderung an `licenses/registry.json`, `THIRD_PARTY_NOTICES.md` oder `package-lock.json` |
| echte Kamera-Dateien (Canon 40D, Nikon COOLPIX P6000, Fujifilm E500) | gelesen, Werte plausibel und bei der Nikon-Datei mit dokumentierter Position übereinstimmend |
| echter Browser (Edge headless) mit Dateiauswahl, Anzeige, Entfernen, Speichern | bestanden; bereinigte Datei lud weiterhin als 640 × 480, keine Konsolenfehler |
| Byte-Vergleich der Bilddaten vor und nach dem Entfernen | identisch; zweiter Durchlauf ohne Wirkung |

## Offene Punkte und Risiken

- [ ] Die Konzeptabweichung (eigener Leser statt `exifreader`) ist zu bestätigen. Sie steht im
      Konzept unter „Umsetzungshinweis" und ist die einzige inhaltliche Abweichung.
- [ ] Der Leser deckt bewusst nur die angezeigte Teilmenge der EXIF-Struktur ab (rund
      30 Kennungen). Weitere Herstellerfelder (Maker Notes), XMP-Inhalte und ICC-Angaben
      werden nicht im Einzelnen dargestellt, aber vollständig entfernt.
- [ ] Sehr große Bilder werden beim Vorschaubild vollständig dekodiert; eine Speichergrenze
      für sehr große Dateien ist noch nicht festgelegt.
- [ ] Ob TIFF und HEIC aufgenommen werden, ist offen (nur mit Neuberechnung möglich).
- [ ] Die Barrierefreiheit ist handwerklich umgesetzt (Beschriftungen, Mindestgrößen,
      Fokus, `aria-live`), aber nicht automatisiert geprüft.

## Empfohlener nächster Schritt

1. Konzeptabweichung bestätigen und anschließend das nächste Werkzeug der Bild-Suite wählen —
   laut Konzept entweder `image-resize` oder `icon-generator`, beide überwiegend ohne
   Fremdbibliothek. Vor einem Beginne wäre die Aufwandsmessung aus diesem Werkzeug die
   belastbare Referenzklasse.

## Git

- Commit: `f87be44` (Umsetzung, Tests, Dokumentation); Konzept und Prüfbericht in `68a21e1`,
  `d49be7d`, `cc9d983`
- Arbeitsbaum vor Commit: ausschließlich die oben genannten Bereiche
