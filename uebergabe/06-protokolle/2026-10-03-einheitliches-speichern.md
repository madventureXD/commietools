# Einheitliches Speichern für alle Dateiausgaben

**Datum:** 2026-10-03  
**Status:** Stufe 1 umgesetzt und geprüft

## Ergebnis

Alle 17 dateierzeugenden Werkzeuge verwenden nun dieselbe Speichersteuerung. Vor dem Speichern ist
der vorgeschlagene Dateiname editierbar. In Browsern mit File System Access API öffnet die
Nutzeraktion einen nativen Speichern-unter-Dialog, in dem Name und Speicherort gewählt werden.
Andere Browser erhalten denselben Inhalt und Namen über einen klassischen Download; die Oberfläche
weist dort ausdrücklich darauf hin, dass die Browser-Einstellungen den Speicherort bestimmen.

Dateinamen werden zentral normalisiert. Unzulässige Pfadzeichen, leere Namen, reservierte
Windows-Gerätenamen, überlange Namen und eine zum MIME-Typ widersprüchliche Endung werden
konsistent behandelt. Abbruch und Schreibfehler haben eigene lokalisierte Zustände.

PDF teilen, PDF zu Bildern und der Icon-Generator bieten die Steuerung für jede einzelne
Ergebnisdatei. Automatische Mehrfachdownloads wurden bewusst nicht eingeführt. Eine spätere
Sammelaktion per Ordnerauswahl und/oder ZIP bleibt nach Größen- und Lizenzprüfung offen.

## Zentrale Ablage

- Webadapter und UI: `apps/web/src/tools/SaveFileControl.tsx`
- Tests: `apps/web/src/save-file.test.ts`
- gemeinsame Texte: `packages/i18n/src/common/de.ts` und `en.ts`
- Konzept: `uebergabe/03-konzepte/2026-10-03-einheitliches-speichern.md`

## Prüfung

- keine direkten `download`-Attribute oder Bibliotheks-Downloadaufrufe mehr in den
  Werkzeugoberflächen
- Lizenzprüfung bestanden: 498 Pakete
- Katalogprüfung bestanden: 21 Werkzeuge, 2 Sprachen, 21 Symbole, 70 Dateitypen
- TypeScript-Prüfung bestanden
- 149 Tests in 10 Testdateien bestanden
- Produktions-Build bestanden
- Bundle-Prüfung bestanden: Einstieg 165.127 Byte gzip, optionale PDF-Artefakte 13

## Noch offen

- manueller Browser-Matrix-Test des nativen Pickers und des Download-Fallbacks
- Entscheidung über Ordnerauswahl und/oder ZIP für **Alle speichern …** bei Mehrfachausgaben

## Mobile Nachkorrektur

Ein Praxistest auf Android zeigte, dass der Speicherdialog zunächst mit einer allgemeinen
Fehlermeldung abbrach. Vor `showSaveFilePicker()` war der Ergebnis-Blob asynchron aufgelöst worden;
dadurch konnte die für den Picker erforderliche direkte Nutzeraktivierung verloren gehen. Der
Picker wird nun als erste asynchrone Operation unmittelbar aus dem Tippen geöffnet. Mobile Browser,
die die Methode zwar anbieten, den Dialog aber dennoch ablehnen, wechseln kontrolliert zum
klassischen Download-Fallback. Ein bewusst abgebrochener Dialog bleibt weiterhin ein Abbruch und
löst keinen Download aus.
