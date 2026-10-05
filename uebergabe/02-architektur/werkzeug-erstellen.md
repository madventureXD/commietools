# Arbeitsanweisung: Werkzeug erstellen

Diese Anweisung ist für jedes neue CommieTools-Werkzeug verbindlich. Ziel ist ein lokales,
barrierearmes, übersetzbares und klein ausgeliefertes Werkzeug, das ohne Sonderfälle im Katalog,
Werkzeugmenü und Offline-Betrieb erscheint.

## 1. Vor der Umsetzung

1. Zweck, Ein- und Ausgabe, Fehlerfälle, Datenschutz- und Sicherheitsgrenzen festhalten.
2. Zuerst gepflegte Open-Source-Lösungen prüfen: Funktion, Browser-/Offline-Fähigkeit,
   Wartungszustand, Größe, Sicherheit und Lizenz. Eigenentwicklung begründen, wenn kein Kandidat
   passt.
3. Reale und problematische Testdateien beschaffen oder reproduzierbar erzeugen. Lizenz und
   Herkunft von Fremdprüfdateien dokumentieren.
4. Eindeutige, dauerhafte Tool-ID und Route `/tools/<id>` wählen.

## 2. Verbindliche Bausteine

- Manifest in `packages/tools/src/catalog/manifests.ts` mit ID, Route, Kategorie, allen Textschlüsseln
  und vollständigem Datei-Vertrag.
- Fachlogik im passenden Bereich unter `packages/tools/src/`; UI und Fachlogik bleiben getrennt.
- Oberfläche in `apps/web/src/tools/`; große Oberflächen und jede schwere Engine nur verzögert von
  der Tool-Route laden.
- Symbol als `apps/web/public/tools/<id>.svg`, 24×24, `currentColor`, verständliche Strichgrafik.
- Eine Locale-Datei für **jede veröffentlichte Sprache**. Pflicht sind Titel, Beschreibung,
  Karten-Kurztext, Suchbegriffe/Tags und alle sichtbaren Zustände, Aktionen, Fehler und Hinweise.
  **Zusatz 2026-10-05:** Titel, Beschreibung, Kurztext und Suchbegriffe gehen **nicht** in das
  Textpaket der Werkzeugoberfläche, sondern ausschließlich in das erzeugte **Suchpaket** der
  Sprache (ADR 0010). Die Werkzeugkopfzeile liest Titel und Beschreibung von dort
  (`apps/web/src/tool-texts.ts`); fehlt die Quelle, zeigt die Seite die Sprachschlüssel statt Text.
- Unit-Tests für Fachlogik und Fehlerfälle sowie mindestens ein Katalog-/Integrationstest.

Schwere Bibliotheken dürfen nicht über den allgemeinen Einstiegspunkt `@commietools/tools`
reexportiert werden. Nur kleine Typen, Manifeste und leichte Hilfen gehören in die Startkette.

## 3. Texte, Suche und Dateien

- Keine sichtbaren Texte direkt in Komponenten schreiben.
- `summary` ist höchstens 120 Zeichen lang; `terms` ist kommagetrennt, eindeutig und enthält
  mindestens ein `#Tag`.
- Suchbegriffe beschreiben reale Absichten, Dateiendungen und gebräuchliche Synonyme; keine
  ungeprüften maschinellen Wortlisten.
- Dateinamen bleiben vor dem Speichern editierbar. Wo die Browser-API es unterstützt, wird
  „Speichern unter …“ angeboten; ein kompatibler Download bleibt der Rückfall.
- Unicode-Dateinamen und Inhalte bleiben erhalten. Nur tatsächlich unzulässige Dateisystemzeichen
  werden bereinigt.

## 4. Registrierung und Erzeugung

Nach den Quelldateien ausführen:

```text
npm run catalog:generate
```

Der Generator baut die sprachneutrale Katalogbasis sowie getrennte Such- und Werkzeugtextpakete
unter `packages/tools/src/catalog/generated/`. Diese Dateien nie von Hand korrigieren. Änderungen
gehören in Manifest oder Locale-Quelldatei. Neue Abhängigkeiten erfordern zusätzlich eine
aktualisierte Lizenzdatenbank.

**Zusatz 2026-10-05 (ADR 0010): der Absatz oben nennt zwei Paketarten, es sind heute drei.** Der
Generator erzeugt: das **Suchpaket** je Sprache (`generated/search/<sprache>.ts` — Titel, Kurztext,
Beschreibung, Suchbegriffe, Schlagwörter; wird auf **jeder** Seite geladen), das **gemeinsame
Werkzeugtextpaket** je Sprache (`generated/messages/<sprache>/common.ts` — Rahmen- und
Bereichstexte wie `tool.calc.*`, `tool.craft.*`) und **je Werkzeug und Sprache ein eigenes**
Textpaket (`generated/messages/<sprache>/<werkzeugkennung>.ts`, erst auf dessen Route geholt). Die
Zuordnung Werkzeug → Paket liegt in `generated/textLoaders.ts` außerhalb des Startbündels. Ein neues
Werkzeug vergrößert damit kein fremdes Paket mehr — es braucht aber beide Katalogschlüssel in jeder
veröffentlichten Sprache, sonst greift `catalog:check`. Der Generator **entfernt veraltete
Paketdateien**, und `catalog:check` meldet liegengebliebene (etwa nach Umbenennen eines Werkzeugs).
Gemessen 2026-10-05: 49 Pakete je Sprache (48 Werkzeuge + `common`), 147 nachgeladene Module. Der
Wortlaut oben bleibt als früherer Stand stehen; verbindlich ist dieser Zusatz.

## 5. Abnahme

Mindestens prüfen:

1. Erfolgsweg, leere/defekte/große Eingabe, Abbruch und wiederholte Nutzung.
2. Dateiname, Speicherziel/Download-Rückfall und erneutes Öffnen des Ergebnisses.
3. Alle veröffentlichten Sprachen, Sonderzeichen, lange Texte und englischer Rückfall.
4. Tastatur, Fokus, Screenreader-Namen, 200 % Zoom, 320/360 px Mobilbreite und Desktop.
5. Hell/Dunkel, offline nach einmaligem Laden und keine Übertragung von Nutzerdateien.
6. `npm run check`, `npm run lint`, `npm run build`, `npm run viewport:check` bei laufender lokaler
   Vorschau und `git diff --check`.

Größenbudgets melden Warnungen und Veränderungen zum Referenzstand. Warnungen werden geprüft und
in der Übergabe begründet, sind aber keine starre Obergrenze. Harte Fehler bleiben unter anderem:
fehlende Texte/Metadaten, eine schwere Engine oder optionale Fremdsprache in der Startkette,
Lizenzfehler sowie fehlgeschlagene Typ-, Test- oder Build-Prüfungen.

## 6. Übergabe

Dokumentiert werden Funktionsumfang, Open-Source-Entscheidung, geänderte Dateien/Abhängigkeiten,
Testdateien, automatische und manuelle Prüfergebnisse, Größenwarnungen, bekannte Grenzen und
Veröffentlichungsstatus. Erst nach dieser Abnahme wird das Werkzeug zur Veröffentlichung gebündelt.
