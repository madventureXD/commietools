# Konzept: Einheitliches Speichern und frei wählbare Dateinamen

**Status:** umgesetzt (Stufe 1: Einzel-Speichern für alle Ausgabedateien)  
**Datum:** 2026-10-03  
**Verantwortlich:** Codex

## Ausgangslage

CommieTools erzeugt Dateien vollständig lokal, überlässt das Speichern derzeit aber vollständig
dem normalen Browser-Download. Die Oberfläche setzt nur einen vorgeschlagenen Namen über das
HTML-Attribut `download` oder über die Download-Funktion einer Bibliothek. Abhängig von Browser
und Benutzereinstellungen landet die Datei deshalb sofort im Download-Ordner oder der Browser
zeigt einen eigenen Dialog. CommieTools selbst bietet weder ein Feld für den Dateinamen noch eine
verlässliche Auswahl des Speicherorts an.

Die Prüfung aller 21 Werkzeuge ergibt:

- 17 Werkzeuge deklarieren eine Dateiausgabe und sind betroffen.
- 16 davon verwenden direkt Blob-URLs und `<a download="…">`; der QR-Code-Generator verwendet
  die in der QR-Bibliothek eingebaute Download-Funktion.
- 4 Werkzeuge erzeugen bewusst keine Datei: Textstatistik, Groß-/Kleinschreibung,
  JSON-Formatierer und Farbwerkzeuge.
- Es gibt keine gemeinsame Speicherkomponente, keinen gemeinsamen Browseradapter und keine
  einheitliche Prüfung von Dateinamen.
- Die meisten Einzeldatei-Werkzeuge leiten einen brauchbaren Namen aus der Eingabedatei ab.
  `images.pdf`, `page-1.png`, `commietools-qr.png` und `favicon.ico` sind dagegen weitgehend
  generisch.
- Mehrfachausgaben werden als einzelne Downloadlinks dargestellt. Das betrifft PDF teilen,
  PDF zu Bildern und den Icon-Generator.

Das HTML-Attribut `download` kann nur einen Namen vorschlagen; Browser dürfen ihn anpassen und
entscheiden anhand ihrer Einstellungen selbst, ob und wo sie nachfragen. Die File System Access
API kann mit `showSaveFilePicker()` einen echten Speichern-unter-Dialog mit vorgeschlagenem Namen
und Dateityp öffnen. Sie ist jedoch nicht in allen verbreiteten Browsern verfügbar, benötigt
HTTPS und muss unmittelbar durch eine Benutzeraktion ausgelöst werden. Das Konzept braucht daher
zwingend einen progressiven Fallback.

Referenzen:

- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
- MDN zum Downloadattribut: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download
- Spezifikation: https://wicg.github.io/file-system-access/

## Ziele

- Nutzer können vor dem Speichern den vollständigen Dateinamen ändern.
- Unterstützende Browser öffnen immer einen echten Speichern-unter-Dialog für Einzeldateien.
- Nutzer können dort selbst den Speicherort auswählen und vorhandene Dateien bewusst ersetzen.
- Nicht unterstützende Browser behalten einen zuverlässigen lokalen Download als Fallback.
- Alle Werkzeuge verwenden dieselbe Bedienung, Namenslogik, Dateitypprüfung und Rückmeldung.
- Dateiendung und MIME-Typ bleiben konsistent und können nicht versehentlich auseinanderlaufen.
- Abbrechen ist ein normaler Zustand und wird nicht als Fehler dargestellt.
- Keine Datei, kein Dateiname und kein gewählter Pfad werden an einen Server übertragen.

## Nicht-Ziele

- Browser-Sicherheitsregeln umgehen oder einen Speicherort ohne Benutzerentscheidung wählen.
- Absolute lokale Pfade anzeigen oder speichern; Browser geben diese aus Sicherheitsgründen nicht
  zuverlässig frei.
- In der ersten Stufe bestehende Dateien dauerhaft beobachten oder automatisch überschreiben.
- Einen eigenen Cloudspeicher oder serverseitige Exporte einführen.
- Mehrere Ergebnisse ohne ausdrückliche Bestätigung still in einen Ordner schreiben.

## Vorschlag

### 1. Gemeinsamer Ergebnisbereich

Jedes Werkzeug mit Dateiausgabe verwendet einen gemeinsamen Ergebnisbaustein. Er erhält mindestens:

- Dateiinhalt als `Blob` oder konvertierbare Bytes,
- vorgeschlagenen Basisnamen,
- unveränderlich zum Ausgabeformat gehörende Endung,
- MIME-Typ und sichtbare Formatbezeichnung,
- Dateigröße,
- optional eine Vorschau.

Der Ergebnisbereich zeigt in dieser Reihenfolge:

1. Ergebnis und Dateigröße,
2. editierbares Feld **Dateiname**,
3. klaren primären Button **Speichern unter …**,
4. Statusmeldung nach erfolgreichem Speichern.

Die Endung soll sichtbar bleiben. Bei einem festen Ausgabeformat wird sie neben einem Feld für den
Basisnamen angezeigt oder beim Bearbeiten zuverlässig normalisiert. Bei auswählbaren Formaten ist
die Endung an den Formatwähler gekoppelt. Ein doppeltes `.pdf.pdf` oder eine JPEG-Datei mit
`.png`-Endung darf nicht entstehen.

### 2. Browseradapter statt Werkzeug-Sonderlösungen

Ein gemeinsamer Webadapter übernimmt das Speichern:

```text
saveFile({ blob, suggestedName, mimeType, extensions })
  ├─ showSaveFilePicker verfügbar → Speichern-unter-Dialog → direkt schreiben
  └─ nicht verfügbar             → Blob-URL + download-Attribut
```

Der Adapter gehört zur Webanwendung, nicht zur reinen Tool-Logik. Die visuelle Komponente kann im
gemeinsamen UI-Paket liegen; der Zugriff auf Browser-APIs bleibt in einem schmalen Adapter in
`apps/web`.

`showSaveFilePicker()` wird ausschließlich per Feature Detection verwendet. Browsernamen oder
User-Agent-Erkennung sind nicht nötig. Ein abgebrochener Dialog (`AbortError`) lässt das Ergebnis
unverändert und zeigt höchstens eine unaufdringliche Meldung. Schreibfehler werden verständlich
mit Wiederholungsmöglichkeit ausgegeben.

### 3. Fallback transparent benennen

Wo ein echter Speichern-unter-Dialog verfügbar ist, heißt die Aktion **Speichern unter …**. Im
Fallback bleibt der Name **Herunterladen**, ergänzt um einen kurzen Hinweis:

> Der Speicherort wird von den Download-Einstellungen deines Browsers bestimmt.

CommieTools darf nicht behaupten, einen Speicherort wählen zu können, wenn der Browser nur den
klassischen Download erlaubt. Nutzer können zusätzlich in ihren Browsereinstellungen „Vor jedem
Download nach dem Speicherort fragen“ aktivieren; diese Browseroption ist jedoch kein Ersatz für
die Anwendungslösung.

### 4. Verbindliche Namensregeln

- Eingabename ohne letzte Endung als Basis verwenden.
- Verständliches, werkzeugspezifisches Suffix anhängen, zum Beispiel `-merged`, `-organized`,
  `-watermark`, `-filled`, `-annotated`, `-protected` oder `-optimized`.
- Basisname ist vor dem Speichern vollständig editierbar.
- Leere Namen auf einen lokalisierten Standardnamen zurücksetzen.
- Steuerzeichen, Pfadtrenner und für gängige Dateisysteme unzulässige Namen abweisen oder sichtbar
  normalisieren.
- Führende und abschließende Leerzeichen/Punkte entfernen.
- Eine angemessene Maximallänge vor Dateiendung festlegen und Überschreitungen erklären.
- Keine Zeitstempel oder zufälligen IDs hinzufügen, solange keine Namenskollision vorliegt.
- Deutsche und englische Oberfläche beeinflussen Beschriftungen, nicht automatisch den Namen einer
  vorhandenen Eingabedatei.

### 5. Mehrfachausgaben

PDF teilen, PDF zu Bildern und der Icon-Generator benötigen eine eigene Mehrfachdatei-Variante:

- Jede Ergebnisdatei erhält einen sichtbaren, editierbaren Namen und eine Einzelaktion
  **Speichern unter …**.
- Eine spätere Aktion **Alle speichern …** darf in unterstützenden Browsern nach ausdrücklicher
  Ordnerauswahl über `showDirectoryPicker()` in einen gewählten Ordner schreiben.
- Weil auch die Verzeichnisauswahl nicht browserübergreifend verfügbar ist, muss vor der
  Implementierung von **Alle speichern** entschieden werden, ob als universeller Fallback ein
  ZIP-Archiv angeboten wird. Dafür sind Bibliotheks-, Größen-, Streaming- und Lizenzfolgen
  gesondert zu prüfen.
- Mehrere automatische Downloads ohne erneute Nutzeraktion sind kein geeigneter Standard, weil
  Browser sie blockieren oder zusätzliche Freigaben verlangen können.

Stufe 1 führt deshalb Einzel-Speichern für alle Dateien ein. Stufe 2 ergänzt nach eigener Prüfung
Ordnerauswahl und gegebenenfalls ZIP.

### 6. Migration

Empfohlene Reihenfolge:

1. Datentypen, Dateinamen-Normalisierung und Webadapter mit Tests erstellen.
2. Gemeinsamen Ergebnisbaustein samt deutschen und englischen Texten erstellen.
3. PDF-Einzeldateiwerkzeuge migrieren.
4. Bild-Metadaten, Bild skalieren, Wasserzeichen, Bilder zu PDF und QR-Code migrieren.
5. Mehrfachausgaben einzeln migrieren: PDF teilen, PDF zu Bildern, Icon-Generator.
6. Direkte `<a download>`-Verwendungen in Werkzeugoberflächen durch eine Prüfung verbieten.
7. Manuellen Browser-Matrix-Test durchführen und Ergebnis dokumentieren.

## Alternativen

### Nur ein Dateinamenfeld vor dem bisherigen Download

Einfach und browserübergreifend, löst aber die Wahl des Speicherorts nicht. Als Fallback nötig,
als Gesamtlösung unzureichend.

### Nur auf Browsereinstellungen verweisen

Kein Entwicklungsaufwand, aber inkonsistent und für Nutzer schwer auffindbar. Außerdem bleibt der
Dateiname in der CommieTools-Oberfläche unveränderbar.

### File System Access API ohne Fallback

Bietet die beste Desktop-Bedienung, schließt aber Browser ohne diese API aus und widerspricht dem
plattformübergreifenden Anspruch.

### Immer ZIP für mehrere Dateien

Browserübergreifend und nur ein Speichervorgang, verursacht aber zusätzliche Rechenarbeit,
Speicherbedarf und eine weitere Archivabhängigkeit. Für große gerenderte PDF-Seiten kann das auf
Mobilgeräten problematisch sein.

## Auswirkungen

- **Local First / Datenschutz:** Inhalte bleiben lokal. Der Webadapter erhält nur den vom Nutzer
  erzeugten Blob; Pfade werden weder protokolliert noch synchronisiert.
- **Offline First:** Beide Speicherwege funktionieren nach geladenem PWA-Shell offline. Der echte
  Picker ist von Browser und sicherem Kontext abhängig, nicht von einem Serverdienst.
- **UI / Barrierefreiheit:** Ein echtes Label für den Dateinamen, sichtbare Endung, klare
  Fokusreihenfolge, Tastaturbedienung, `aria-live`-Status und verständliche Fehler sind Pflicht.
- **Internationalisierung:** Gemeinsame Texte für Dateiname, Speichern unter, Herunterladen,
  gespeichert, abgebrochen und Schreibfehler kommen nach `packages/i18n`; Werkzeugsuffixe bleiben
  bewusst stabile Dateinamensbestandteile und werden separat entschieden.
- **Modularität / Suiten:** Eine gemeinsame Abstraktion ersetzt mindestens fünf derzeit doppelte
  PDF-Ergebnisbausteine und sämtliche direkten Tool-Downloadlinks.
- **Abhängigkeiten / Lizenzen:** Für Einzeldateien ist keine neue Abhängigkeit nötig. ZIP bleibt
  bis zur gesonderten Prüfung offen.
- **Tests / Migration:** Unit-Tests für Namensnormalisierung und Picker-/Fallbackpfade,
  Komponententests für Tastatur und Abbruch sowie echte Browsertests für mindestens einen
  unterstützenden und einen Fallback-Browser.

## Offene Fragen

- [ ] Sollen werkzeugspezifische Suffixe in Dateinamen Englisch und stabil bleiben oder mit der
  Oberfläche lokalisiert werden?
- [ ] Soll die Endung als nicht editierbarer Zusatz neben dem Basisnamen oder als editierbarer Teil
  des vollständigen Dateinamens erscheinen?
- [ ] Soll **Alle speichern …** über Ordnerauswahl, ZIP oder beide Wege angeboten werden?
- [ ] Sollen Nutzer optional ein zuletzt verwendetes Namensschema pro Werkzeug lokal speichern
  können, ohne Verzeichnis-Handles dauerhaft aufzubewahren?

## Akzeptanzkriterien

- [x] Alle 17 dateierzeugenden Werkzeuge verwenden denselben Speicheradapter.
- [x] Vor jeder Einzeldateiausgabe kann der vorgeschlagene Dateiname geändert werden.
- [x] Unterstützende Browser öffnen durch eine direkte Nutzeraktion einen Speichern-unter-Dialog.
- [x] Andere Browser laden dieselbe Datei mit dem gewählten Namen zuverlässig herunter.
- [x] MIME-Typ, Format und Dateiendung stimmen immer überein.
- [x] Abbrechen erzeugt weder Fehlermeldung noch leere Datei.
- [x] Schreibfehler werden lokalisiert angezeigt und können wiederholt werden.
- [x] Mehrfachausgaben bieten mindestens pro Datei einen editierbaren Namen und Einzel-Speichern.
- [x] Kein Werkzeug verwendet danach eine eigene Downloadbibliothek oder einen direkten
  Downloadlink außerhalb der gemeinsamen Abstraktion.
- [x] Namensnormalisierung ist automatisiert getestet; Picker und Fallback sind über die gemeinsame
  Abstraktion zentral prüfbar.
- [x] `npm run check` und `npm run build` bestehen; Dokumentation und Übergabe sind aktualisiert.
