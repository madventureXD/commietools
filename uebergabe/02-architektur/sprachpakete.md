# Regularium für Sprachpakete

Dieses Dokument ist die verbindliche Übergaberegel für neue CommieTools-Sprachen. Ein Sprachpaket
ist eine Produktfunktion, keine lose Sammlung übersetzter Zeichenketten.

Das geplante technische Verfahren mit Google Cloud Translation, Glossar, Translation Memory,
Kostenkontrolle und anbieterneutralem Adapter ist in
`uebergabe/03-konzepte/2026-10-03-automatisierte-sprachpakete.md` beschrieben.

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
darf während der Entwicklung unregistriert unvollständig sein. Für einen ausdrücklich lokalen
Abnahmetest darf sie nach vollständiger Schlüsselprüfung vorübergehend in Registry und
Sprachschalter erscheinen. Dieser Stand wird als **lokales Testpaket** dokumentiert und niemals
veröffentlicht. Die öffentliche Freigabe erfolgt erst nach sprachlicher und visueller Abnahme. Neue
Werkzeuge müssen vor dem Zusammenführen alle bereits veröffentlichten Sprachen ergänzen.

## 3. Übersetzungsquellen und externe Dienste

- Menschliche Übersetzung oder fachlich geprüftes Gegenlesen bleibt die Freigabegrundlage.
- Maschinelle Übersetzung darf einen lokalen Erstentwurf erzeugen, aber niemals ungeprüft
  veröffentlicht werden.
- Vor Nutzung eines externen Übersetzungsdienstes ist die ausdrückliche Zustimmung des
  Auftraggebers einzuholen. Dabei werden Dienst und übertragener Inhalt genannt.
- Übertragen werden ausschließlich öffentliche Referenztexte. Nutzerdaten, Nutzerdateien,
  Zugangsdaten, interne Geheimnisse und nicht öffentliche Inhalte sind ausgeschlossen.
- Das Übergabeprotokoll nennt Ausgangssprache, Zielsprache, verwendeten Dienst, Datum,
  Nachbearbeitung und ausstehende sprachliche Prüfung.
- Fachbegriffe, rechtliche Aussagen, Verneinungen, Sicherheits- und Datenschutzversprechen werden
  nach maschineller Übersetzung besonders geprüft.

## 4. Ablage und Zuständigkeit

- `packages/i18n/src/common/<locale>.ts`: App-Shell und gemeinsam verwendete Texte;
- `packages/i18n/src/suites/<locale>.ts`: Namen und Beschreibungen der Suiten;
- `packages/tools/src/<bereich>/<werkzeug>/locales/<locale>.ts`: werkzeugeigene Texte;
- lokaler `locales/index.ts`: Zuordnung der Sprachkennung zum Katalog;
- `packages/i18n/src/registry.ts`: einzige Quelle für auswählbare Sprachen;
- `packages/i18n/src/index.ts`: verzögerter Lader für gemeinsame Texte der aktiven Sprache;
- `packages/tools/src/catalog/generated/`: erzeugte Such- und Werkzeugtextpakete je Sprache;
- `toolIndex.ts`: erzeugte sprachneutrale Katalogbasis, niemals von Hand bearbeiten.

Schlüssel bleiben sprachneutral und stabil. Übersetzungen dürfen weder Anzeigetexte in Komponenten
noch sprachabhängige Verzweigungen in Werkzeuglogik erzeugen.

## 5. Inhaltliche Regeln

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

## 6. Unicode und Sonderzeichen

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

## 7. Variablen, Markup und Grammatik

- Platzhalter, Zeilenumbrüche und erforderliche Markup-Struktur werden vor und nach der
  Übersetzung automatisch verglichen.
- Satzbau darf Platzhalter nur umordnen, wenn benannte Platzhalter oder eine dafür geeignete API
  verwendet werden.
- Zusammengesetzte Sätze aus mehreren Übersetzungsschlüsseln sind zu vermeiden, weil Wortstellung,
  Geschlecht und Plural nicht zuverlässig sprachübergreifend funktionieren.
- Zahlen und Datumswerte werden nicht per Stringverkettung lokalisiert. Für neue dynamische Texte
  ist vor der Übersetzung zu entscheiden, ob Pluralregeln beziehungsweise `Intl` nötig sind.
- Übersetzungen enthalten kein HTML. Hervorhebung und Verlinkung bleiben Aufgabe der Komponente.

## 8. Suche, Katalog und Ladepolitik

- Titel, Kurzbeschreibung, Beschreibung und Suchbegriffe jeder veröffentlichten Sprache gehen in
  deren eigenes erzeugtes Suchpaket ein.
- Im Browser werden ausschließlich das Such- und Textpaket der aktiven Sprache sowie Englisch als
  Rückfall geladen. Bei Englisch wird nur Englisch geladen. Andere Sprachpakete dürfen nicht über
  die statische Startkette oder den Vorabcache erreichbar sein.
- Ein Treffer wird in der ausgewählten Sprache dargestellt. Englische Begriffe bleiben über den
  mitgeladenen Rückfall auffindbar; Begriffe einer dritten, nicht aktiven Sprache werden bewusst
  nicht geladen und nicht durchsucht.
- Begriffe müssen einzeln auffindbar sein und dürfen nach der Suchnormalisierung nicht doppelt
  vorkommen.
- Regionale Varianten und gebräuchliche Fremdwörter können Suchsynonyme sein. Irreführende,
  abwertende oder nur maschinell erzeugte Wortlisten sind unzulässig.
- Nach jeder Änderung an Sprachkatalogen wird das Register neu erzeugt und geprüft.

## 9. Prüfmatrix vor Freigabe

### Automatisch

- Schlüsselmenge gegen die vollständige Referenz prüfen;
- Browsererkennung für die Basissprache und mindestens eine regionale Kennung prüfen, zum Beispiel
  `es` und `es-MX`;
- leere Werte, doppelte Schlüssel und unaufgelöste Schlüssel ablehnen;
- NFC, Ersatzzeichen `�`, unerwünschte Entities und Escape-Schreibweisen prüfen;
- Platzhaltergleichheit und maximale Länge von `summary` prüfen;
- jeden Werkzeugtitel und jeden einzelnen Suchbegriff auffindbar testen;
- Katalogerzeugung, Typprüfung, gesamte Testsuite, Produktions-Build und Bundle-Prüfung ausführen;
- Bundlezuwachs je Sprache dokumentieren. Die Größenbudgets sind Warnschwellen, keine feste
  Freigabegrenze: Eine Überschreitung muss untersucht und begründet werden, lässt den Build aber
  nicht allein deshalb scheitern. Statische Fremdsprachen oder schwere Engines im Startpaket
  bleiben dagegen harte Architekturfehler.

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

## 10. Übergabeinhalt

Jede fertige Sprache erhält ein Übergabeprotokoll mit:

- Sprachkennung, Variante, Selbstbezeichnung, Richtung und Fallback;
- Umfang und Liste der geänderten Kataloge;
- Glossar und bewusst gewählte Regionalismen;
- Herkunft des Erstentwurfs und gegebenenfalls verwendeter externer Übersetzungsdienst;
- Ergebnis der Schlüssel-, Unicode-, Such-, Build- und Layoutprüfungen;
- gemessenem Bundlezuwachs;
- bekannten Einschränkungen und zuständiger sprachlicher Abnahme;
- Commit und Veröffentlichungsstatus.

## 11. Statusmodell

Jedes Sprachpaket trägt genau einen nachvollziehbaren Status:

1. **Konzept** – Variante, Ton, Umfang und Prüfplan sind festgelegt.
2. **Entwurf** – Übersetzung ist in Arbeit und nicht auswählbar.
3. **Lokales Testpaket** – alle Schlüssel und technischen Prüfungen sind vollständig; nur lokal
   auswählbar, sprachliche oder visuelle Abnahme steht noch aus.
4. **Freigabebereit** – sprachlich, fachlich und visuell abgenommen.
5. **Veröffentlicht** – ausgeliefert und im öffentlichen Sprachschalter sichtbar.

Ein Statuswechsel wird im Konzept oder Fortschrittsprotokoll festgehalten. „Technisch vollständig“
ist nicht gleichbedeutend mit „sprachlich freigegeben“.

## Nachtrag 2026-10-05, Faber: die Werkzeugtexte liegen in **zwei** Paketen

Abschnitt 2 („Vollständigkeit und Freigabe", Punkt 3: „für jeden Werkzeugkatalog alle sichtbaren
Texte sowie `summary` und `terms`") gilt in der Sache weiter, verteilt sich aber seit dem
2026-10-05 auf **zwei** erzeugte Pakete je Sprache:

- **Suchpaket** (`packages/tools/src/catalog/generated/search/<sprache>.ts`) — Titel, Kurztext,
  Beschreibung, Suchbegriffe und Schlagwörter. Es wird im Startvorgang geholt: Katalog und Suche
  brauchen es.
- **Textpaket** (`packages/tools/src/catalog/generated/messages/<sprache>.ts`) — alle sichtbaren
  Texte der Werkzeugoberflächen, darunter **Titel und Beschreibung** (Kopfzeile), aber **ohne**
  Kurztext und Suchbegriffe. Es wird **erst auf einer Werkzeugroute** geholt.

**Warum:** Die Doppelung kostete je Sprache rund 15 % des Textpakets (Deutsch 17.475 von 116.788
Byte roh), und das Textpaket wurde beim Start geladen, obwohl nur Werkzeugrouten es brauchen.
Gemessen mit frischem Browserprofil: Startseite 171.867 B gzip ohne Textpaket, Werkzeugroute
335.032 B mit (Beleg: `07-pruefung/sprachpaket/beleg.txt`).

**Pflicht bleibt unverändert:** Ein Sprachpaket ist erst vollständig, wenn **beide** Teile für alle
Werkzeuge vorliegen. `catalog:check` scheitert weiterhin, wenn ein Titel-, Beschreibungs-, Kurztext-
oder Begriffsschlüssel in einer Sprache fehlt; zwei Tests halten die Grenze fest
(`apps/web/src/tool-catalog.test.ts`: „hält die Katalogschlüssel aus dem Textpaket").

**Noch offen:** die Aufteilung des Textpakets **je Werkzeug** (statt je Sprache über alle
Werkzeuge). Erst damit wächst kein Paket mehr mit einem fremden Werkzeug.

## 12. Abbruchkriterien

Nicht freigeben bei fehlenden Schlüsseln, sichtbarem Fallback, ungeprüfter Maschinenübersetzung,
kaputten Sonderzeichen, nicht auffindbaren Werkzeugen, abgeschnittenen Hauptaktionen,
verändertem rechtlichem Sinn oder nicht bestandenem Build. Diese Punkte werden behoben und nicht
als bekannte Einschränkung in die Veröffentlichung verschoben.

