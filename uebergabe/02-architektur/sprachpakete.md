# Regularium für Sprachpakete

Dieses Dokument ist die verbindliche Übergaberegel für neue CommieTools-Sprachen. Ein Sprachpaket
ist eine Produktfunktion, keine lose Sammlung übersetzter Zeichenketten.

## 1. Entscheidung vor Beginn

Für jede Sprache werden vor der Übersetzung festgehalten:

- BCP-47-Sprachkennung und Selbstbezeichnung;
- Schreibrichtung `ltr` oder `rtl`;
- Rückfallsprache;
- Zielvariante, zum Beispiel neutrales `es` oder ausdrücklich `pt-BR`;
- Anrede, Ton, zentrale Terminologie und unerwünschte Regionalismen;
- zuständige Person für sprachliche Abnahme.

Sprache und Region bleiben getrennt. Sprache bestimmt Texte und Schreibrichtung; Region bestimmt
später gegebenenfalls Zahlen, Datum, Papierformat oder Maßeinheiten. Eine Sprachkennung darf diese
Produktentscheidung nicht stillschweigend vermischen.

## 2. Vollständigkeit und Freigabe

Ein öffentlich auswählbares Sprachpaket muss vollständig sein. Es enthält:

1. gemeinsame App-, Navigations-, Status-, Speicher-, Rechts- und Lizenztexte;
2. alle Suite-Texte;
3. für jeden Werkzeugkatalog alle sichtbaren Texte sowie `summary` und `terms`;
4. zugängliche Namen, leere Zustände, Warnungen, Fehler und Erfolgsmeldungen;
5. Suchbegriffe und mindestens ein lokales Tag je Werkzeug.

Englischer Fallback ist eine technische Ausfallsicherung, keine Freigabestrategie. Eine Sprache
darf während der Entwicklung unregistriert unvollständig sein. Sie darf erst in den Registry- und
Sprachschalter gelangen, wenn die Schlüsselprüfung vollständig grün ist. Neue Werkzeuge müssen vor
dem Zusammenführen alle bereits veröffentlichten Sprachen ergänzen.

## 3. Ablage und Zuständigkeit

- `packages/i18n/src/common/<locale>.ts`: App-Shell und gemeinsam verwendete Texte;
- `packages/i18n/src/suites/<locale>.ts`: Namen und Beschreibungen der Suiten;
- `packages/tools/src/<bereich>/<werkzeug>/locales/<locale>.ts`: werkzeugeigene Texte;
- lokaler `locales/index.ts`: Zuordnung der Sprachkennung zum Katalog;
- `packages/i18n/src/registry.ts`: einzige Quelle für auswählbare Sprachen;
- `toolIndex.ts`: nur erzeugtes Ergebnis, niemals von Hand übersetzen.

Schlüssel bleiben sprachneutral und stabil. Übersetzungen dürfen weder Anzeigetexte in Komponenten
noch sprachabhängige Verzweigungen in Werkzeuglogik erzeugen.

## 4. Inhaltliche Regeln

- Bedeutung, Einschränkungen und Sicherheitsniveau der Referenz bleiben erhalten.
- Kurze UI-Aktionen bleiben kurz; Erklärtexte dürfen zugunsten natürlicher Grammatik umgestellt
  werden.
- Ein Glossar legt wiederkehrende Begriffe fest. Synonyme gehören primär in Suchbegriffe, nicht
  wechselnd in sichtbare Texte.
- Markennamen, Dateiformate, MIME-Typen, Erweiterungen, SPDX-Bezeichner, Code, URLs und
  Nutzereingaben werden nicht übersetzt.
- Rechtliche Verweise werden erklärt, aber nie in eine vermeintlich entsprechende ausländische
  Rechtsnorm umgeschrieben.
- `summary` bleibt eine Zeile und höchstens 120 Zeichen lang. `terms` ist kommagetrennt,
  normalisiert eindeutig und enthält mindestens ein mit `#` beginnendes Tag.
- Übersetzungen dürfen keine zusätzlichen Funktionen oder stärkeren Versprechen behaupten.

## 5. Unicode und Sonderzeichen

- Alle Sprachdateien sind UTF-8 ohne künstliche Umschrift sichtbarer Texte.
- Texte werden in Unicode-Normalform NFC abgelegt und geprüft.
- Sprachtypische Zeichen werden direkt verwendet, beispielsweise `ñ`, `ç`, `ß`, `Ł`, griechische
  oder kyrillische Schriftzeichen. HTML-Entities und `\u`-Escapefolgen sind für normalen UI-Text
  unzulässig.
- Suche darf diakritische Zeichen fehlertolerant behandeln; sichtbare Texte bleiben orthografisch
  korrekt. Akzentlose Suchvarianten werden nur ergänzt, wenn die Normalisierung sie nicht bereits
  zuverlässig abdeckt.
- Interpunktion folgt der Zielsprache. Typografische Zeichen wie `…` und `–` werden konsistent
  verwendet.
- Bidirektionale Inhalte, Zahlen, Dateiendungen und Nutzereingaben müssen bei RTL-Sprachen separat
  visuell geprüft werden.
- Dateioperationen erhalten Unicode-Dateinamen unverändert. Sanitizing darf nur unzulässige
  Dateisystemzeichen behandeln, keine Buchstaben oder Akzente.

## 6. Variablen, Markup und Grammatik

- Platzhalter, Zeilenumbrüche und erforderliche Markup-Struktur werden vor und nach der
  Übersetzung automatisch verglichen.
- Satzbau darf Platzhalter nur umordnen, wenn benannte Platzhalter oder eine dafür geeignete API
  verwendet werden.
- Zusammengesetzte Sätze aus mehreren Übersetzungsschlüsseln sind zu vermeiden, weil Wortstellung,
  Geschlecht und Plural nicht zuverlässig sprachübergreifend funktionieren.
- Zahlen und Datumswerte werden nicht per Stringverkettung lokalisiert. Für neue dynamische Texte
  ist vor der Übersetzung zu entscheiden, ob Pluralregeln beziehungsweise `Intl` nötig sind.
- Übersetzungen enthalten kein HTML. Hervorhebung und Verlinkung bleiben Aufgabe der Komponente.

## 7. Suche und Katalog

- Titel, Kurzbeschreibung, Beschreibung und Suchbegriffe jeder veröffentlichten Sprache gehen in
  das erzeugte Register ein.
- Ein Treffer wird in der ausgewählten Sprache dargestellt, auch wenn ein Begriff aus einer
  anderen Sprache den Treffer ausgelöst hat.
- Begriffe müssen einzeln auffindbar sein und dürfen nach der Suchnormalisierung nicht doppelt
  vorkommen.
- Regionale Varianten und gebräuchliche Fremdwörter können Suchsynonyme sein. Irreführende,
  abwertende oder nur maschinell erzeugte Wortlisten sind unzulässig.
- Nach jeder Änderung an Sprachkatalogen wird das Register neu erzeugt und geprüft.

## 8. Prüfmatrix vor Freigabe

### Automatisch

- Schlüsselmenge gegen die vollständige Referenz prüfen;
- leere Werte, doppelte Schlüssel und unaufgelöste Schlüssel ablehnen;
- NFC, Ersatzzeichen `�`, unerwünschte Entities und Escape-Schreibweisen prüfen;
- Platzhaltergleichheit und maximale Länge von `summary` prüfen;
- jeden Werkzeugtitel und jeden einzelnen Suchbegriff auffindbar testen;
- Katalogerzeugung, Typprüfung, gesamte Testsuite, Produktions-Build und Bundle-Prüfung ausführen;
- Bundlezuwachs je Sprache dokumentieren.

### Sprachlich

- zweite Prüfung gegen Referenz und Glossar;
- keine ausgelassenen Verneinungen, Maßeinheiten oder Einschränkungen;
- konsistente Anrede, Terminologie, Großschreibung und Interpunktion;
- Rechtstexte und technische Warnungen gesondert gegenlesen.

### Visuell und funktional

- Startseite, Werkzeugmenü, Katalog, Suiten, Rechtliches und alle Werkzeuge prüfen;
- Desktop sowie 320 px, 360 px und übliches Mobilformat testen;
- 200 Prozent Zoom, lange Texte, Tastaturbedienung und Screenreader-Namen prüfen;
- helles und dunkles Farbschema sowie Offline-Neuladen prüfen;
- Eingabe, Suche, Dateiname, Speichern und erneutes Öffnen mit sprachtypischen Zeichen testen;
- bei RTL zusätzlich Spiegelung, gemischte Schreibrichtungen und technische Token prüfen.

## 9. Übergabeinhalt

Jede fertige Sprache erhält ein Übergabeprotokoll mit:

- Sprachkennung, Variante, Selbstbezeichnung, Richtung und Fallback;
- Umfang und Liste der geänderten Kataloge;
- Glossar und bewusst gewählte Regionalismen;
- Ergebnis der Schlüssel-, Unicode-, Such-, Build- und Layoutprüfungen;
- gemessenem Bundlezuwachs;
- bekannten Einschränkungen und zuständiger sprachlicher Abnahme;
- Commit und Veröffentlichungsstatus.

## 10. Abbruchkriterien

Nicht freigeben bei fehlenden Schlüsseln, sichtbarem Fallback, ungeprüfter Maschinenübersetzung,
kaputten Sonderzeichen, nicht auffindbaren Werkzeugen, abgeschnittenen Hauptaktionen,
verändertem rechtlichem Sinn oder nicht bestandenem Build. Diese Punkte werden behoben und nicht
als bekannte Einschränkung in die Veröffentlichung verschoben.

