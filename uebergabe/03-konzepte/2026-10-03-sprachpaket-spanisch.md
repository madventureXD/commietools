# Konzept: Spanisches Sprachpaket

**Status:** entworfen, noch nicht umgesetzt  
**Datum:** 2026-10-03  
**Sprachkennung:** `es`

## Ziel

CommieTools erhält zu Testzwecken ein vollständiges spanisches Sprachpaket. Es soll nicht nur die
Startseite übersetzen, sondern Navigation, Suiten, alle 21 Werkzeuge, Status- und Fehlermeldungen,
Speichern-Dialoge, Lizenzseite, Impressum sowie Katalog- und Menüsuche abdecken. Der Sprachschalter
wird erst aktiviert, wenn das Paket vollständig geprüft ist; bis dahin bleibt die öffentliche
Oberfläche unverändert.

## Sprachvariante und Stil

- Verwendet wird neutrales, international verständliches Spanisch (`es`), keine einzelne
  Landesvariante wie `es-ES` oder `es-MX`.
- Die Selbstbezeichnung im Sprachmenü lautet **Español**; Schreibrichtung ist `ltr`, Rückfall ist
  Englisch.
- Ansprache: **tú**, klar und freundlich, ohne regionale Umgangssprache.
- UI-Texte sind knapp und handlungsorientiert. Schaltflächen verwenden bevorzugt Infinitive:
  **Abrir**, **Guardar**, **Descargar**, **Eliminar**.
- Als neutrale Leitbegriffe gelten unter anderem **archivo** statt nur *fichero*, **imagen**,
  **herramienta**, **ajustes**, **resultado** und **contraseña**.
- Sinnvolle regionale Synonyme wie *fichero*, *computadora* oder *ordenador* können in den
  Suchbegriffen stehen, aber nicht wechselnd in derselben Oberfläche.

## Umfang

Der aktuelle Mindestumfang umfasst 726 Schlüssel:

| Bereich | Umfang | Zielort |
| --- | ---: | --- |
| App-Shell, Navigation, Rechtliches, Lizenzen | 94 | `packages/i18n/src/common/es.ts` |
| fünf Suiten | 14 | `packages/i18n/src/suites/es.ts` |
| 18 werkzeugnahe Kataloge für 21 Werkzeuge | 618 | jeweiliges `locales/es.ts` |

Zusätzlich werden alle lokalen Locale-Indizes um `es` ergänzt, der zentrale Registry-Eintrag
angelegt und das erzeugte Werkzeugregister aktualisiert. Die Web-App selbst erhält keine
sprachspezifische Sonderlogik.

## Sonderzeichen und Texttechnik

- Alle Quelldateien bleiben UTF-8. Spanische Zeichen werden direkt geschrieben:
  `á é í ó ú ü ñ ¿ ¡`; keine HTML-Entities und keine Unicode-Escapefolgen für normalen Text.
- Texte werden in Unicode-Normalform NFC gespeichert. Dadurch bleiben Suche, Vergleich und Diffs
  stabil, auch wenn Eingaben von Mobilgeräten kombiniert codierte Akzente enthalten.
- Akzente sind orthografisch verpflichtend: **página**, **compresión**, **tamaño**, **contraseña**.
  Eine akzentlose Ersatzschreibweise darf nur die Suche unterstützen, nie als sichtbarer Text
  erscheinen.
- Fragen und Ausrufezeichen werden paarig gesetzt: **¿…?** und **¡…!**.
- Die typografische Ellipse `…`, der Gedankenstrich `–` und geschützte technische Eigennamen wie
  PDF, JPEG, WebP, EXIF, JSON und QR bleiben konsistent.
- Dateiendungen, MIME-Typen, Dateinamen, Schlüssel, Code und Lizenzbezeichnungen werden nicht
  übersetzt. Vom Nutzer eingegebene Dateinamen müssen einschließlich `ñ` und Akzenten unverändert
  gespeichert werden.
- Platzhalter, Zahlen und dynamische Werte dürfen beim Übersetzen weder entfernt noch umgeordnet
  werden, sofern die aufrufende Komponente keine benannten Platzhalter unterstützt.

## Suche

- Jeder spanische Werkzeugkatalog erhält `summary` und `terms`, einschließlich mindestens eines
  spanischen Tags.
- Sichtbare Begriffe verwenden korrekte Akzente. Die bestehende Suchnormalisierung muss
  beispielsweise `tamano` auf **tamaño**, `pagina` auf **página** und `compresion` auf
  **compresión** abbilden.
- Regionale Synonyme werden gezielt als Suchbegriffe gepflegt; Dopplungen nach Normalisierung sind
  verboten.
- Fremdsprachige Treffer bleiben möglich, angezeigt wird bei ausgewähltem Spanisch jedoch immer
  der spanische Titel und die spanische Kurzbeschreibung.

## Rechtliches und fachliche Grenzen

- Namen, Anschrift, E-Mail-Adresse, SPDX-Ausdrücke und Lizenznamen bleiben unverändert.
- Das deutsche DDG wird nicht in ein spanisches Gesetz umgedeutet. Die spanische Fassung erklärt
  sinngemäß, dass es sich um Angaben gemäß § 5 des deutschen Digitale-Dienste-Gesetzes handelt.
- Technische Aussagen dürfen nicht erweitert werden. Insbesondere bleiben Datenschutz-,
  Offline-, Qualitäts- und Formatversprechen deckungsgleich mit der deutschen und englischen
  Fassung.

## Qualitätsprüfung

1. Schlüsselgleichheit gegen die deutsche Referenz für gemeinsame Texte, Suiten und jeden lokalen
   Werkzeugkatalog prüfen.
2. Automatisch nach Ersatzzeichen `�`, HTML-Entities, unerlaubten Escape-Schreibweisen,
   vergessenen englischen/deutschen Texten und leerem Inhalt suchen.
3. Unicode-NFC und Suche mit akzentierter sowie akzentloser Eingabe testen.
4. Katalog erzeugen und `catalog:check`, Typprüfung, Tests, Build und Bundle-Prüfung ausführen.
5. Alle 21 Werkzeuge in Spanisch auf Desktop und Mobil prüfen: Überläufe, abgeschnittene
   Schaltflächen, Dateinamen, Fehlermeldungen, Speichern und Navigation.
6. Zweite sprachliche Prüfung mit Fokus auf Natürlichkeit, Fachbegriffe und regionale Neutralität.

## Abnahmekriterien

- Kein sichtbarer Rückfall auf Englisch oder Deutsch im normalen Bedienweg.
- Alle 726 derzeitigen Schlüssel und jede später hinzugekommene Referenz sind abgedeckt.
- `Español` wird automatisch erkannt, gespeichert und mit `lang="es"` ausgegeben.
- Suche funktioniert mit `ñ`, Akzenten und üblichen akzentlosen Eingaben.
- Nutzerdateinamen und Inhalte mit spanischen Sonderzeichen bleiben unverändert.
- Mobilansicht funktioniert ab 320 px ohne abgeschnittene Texte oder Aktionen.
- Das Paket ist vollständig lokal/offline verfügbar und lädt keine externen Sprachressourcen.
- Der Bundlezuwachs wird vor Freigabe gemessen und dokumentiert.

## Umsetzungsreihenfolge

1. Prüfregeln für Vollständigkeit, NFC und Sonderzeichen ergänzen.
2. gemeinsame und Suite-Texte übersetzen;
3. werkzeugnahe Kataloge einschließlich Suchbegriffen übersetzen;
4. lokale Indizes und Registry erweitern;
5. Register erzeugen und automatische Prüfungen ausführen;
6. sprachliches und visuelles Gegenlesen;
7. erst nach Abnahme den Sprachschalter freigeben.

