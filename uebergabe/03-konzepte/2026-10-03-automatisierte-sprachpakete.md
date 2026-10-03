# Konzept: Automatisierte Sprachpakete

**Status:** beschlossen, noch nicht umgesetzt
**Datum:** 2026-10-03

## Ziel

Neue CommieTools-Werkzeuge und vollständige Sprachpakete sollen weitgehend automatisch
vorübersetzt, technisch geprüft und als lokaler Teststand bereitgestellt werden. Die Automatisierung
ersetzt nicht die Freigabe: Codex führt die sprachlich-technische Vorabkontrolle durch, der
Auftraggeber übernimmt die Endkontrolle. Bei nicht ausreichend beherrschten Zielsprachen wird vor
einer Veröffentlichung zusätzlich ein Muttersprachler empfohlen.

Verbindliche Qualitäts- und Übergaberegeln stehen in
`uebergabe/02-architektur/sprachpakete.md`.

## Anbieterentscheidung

Erster Anbieter wird **Google Cloud Translation Advanced** mit offiziellem API-Zugang. Gründe:

- breite Abdeckung für geplante Weltsprachen;
- Stapelübersetzung und mehrere Texte je Anfrage;
- Glossare für verbindliche CommieTools-Terminologie;
- Service-Account, Rollen, Abrechnungslabels und regionale Endpunkte;
- NMT und bei Bedarf Translation LLM über dieselbe Plattform.

Die interne Anbindung bleibt anbieterneutral. Ein Übersetzungsadapter kapselt Authentifizierung,
Anfragen und Antworten. DeepL kann später als Vergleichs- oder Zweitanbieter ergänzt werden, ohne
Sprachdateien oder Prüfablauf umzubauen. Der freie undokumentierte Google-Translate-Endpunkt wird
nicht für den dauerhaften Prozess verwendet.

## Ablauf

1. Referenzschlüssel und öffentliche englische Ausgangstexte aus den Katalogen lesen.
2. Nur neue oder geänderte Texte bestimmen.
3. geschützte Begriffe, technische Token und Platzhalter sichern;
4. Zielsprachen-Glossar anwenden und Texte stapelweise übersetzen;
5. Antwort in UTF-8/NFC normalisieren und wieder den unveränderten Schlüsseln zuordnen;
6. Schlüssel, Platzhalter, Längen, Suchbegriffe und Sonderzeichen automatisch prüfen;
7. Katalog erzeugen sowie Tests, Build und Bundle-Prüfung ausführen;
8. lokalen Teststand und Prüfbericht erzeugen;
9. Vorabkontrolle durch Codex, Endkontrolle durch den Auftraggeber;
10. erst nach dokumentierter Freigabe in den Veröffentlichungsstapel aufnehmen.

## Automatisierungsumfang

Automatisiert werden:

- Erkennen fehlender und geänderter Übersetzungen;
- Stapelübersetzung mit Glossar;
- Schutz von Produktnamen, Dateiformaten, URLs, Code und Platzhaltern;
- Schlüsselgleichheit, Unicode-NFC und Ersatzzeichenprüfung;
- Prüfung von `summary`, `terms`, Tags und normalisierten Dopplungen;
- Browsererkennung der Basissprache und regionaler Kennungen;
- Katalogerzeugung, Tests, Build und Bundle-Messung;
- Bericht über Herkunft, Änderungen, Kostenmenge und Freigabestatus.

Nicht automatisch freigegeben werden Natürlichkeit, regionale Angemessenheit, Rechtstexte,
Sicherheits- und Datenschutzversprechen sowie das visuelle Verhalten langer Texte.

## Glossar und Übersetzungsspeicher

- Ein versioniertes Glossar enthält feste Begriffe, nicht zu übersetzende Namen und bevorzugte
  Zielbegriffe je Sprache.
- Freigegebene Übersetzungen bilden einen lokalen Translation Memory. Identische Ausgangstexte
  werden wiederverwendet und nicht erneut bezahlt oder verändert.
- Der Cache-Schlüssel berücksichtigt Ausgangssprache, Zielsprache, Text, Glossarversion,
  Anbieter und Modell.
- Manuell korrigierte Texte haben Vorrang vor späteren Maschinenantworten.
- Suchsynonyme bleiben vom sichtbaren Leitbegriff getrennt.

## Datenschutz und Zugang

- Übertragen werden ausschließlich öffentliche UI-Referenztexte.
- Nutzerdaten, Nutzerdateien, Dateinamen, Zugangsdaten und interne Geheimnisse dürfen den
  Übersetzungsdienst niemals erreichen.
- Für jeden neuen externen Dienst ist vor der ersten Übertragung ausdrückliche Zustimmung nötig.
- Der Google-Service-Account erhält nur erforderliche Übersetzungsrechte.
- Zugangsdaten liegen ausschließlich lokal, vorzugsweise über
  `GOOGLE_APPLICATION_CREDENTIALS`, und niemals im Repository, Protokoll oder Chat.
- Das Übergabeprotokoll nennt Anbieter, Modell, Datum, Sprachpaar und ausstehende Prüfung.

## Kosten und Schutzmaßnahmen

Preisstand 2026-10-03 für Google Cloud Translation:

- NMT: erste 500.000 Zeichen pro Monat als gemeinsames Freikontingent; danach 20 USD je Million
  Eingabezeichen;
- Translation LLM: 10 USD je Million Eingabezeichen plus 10 USD je Million Ausgabezeichen;
- Glossarerstellung ohne separate Übersetzungsgebühr.

Der aktuelle englische Bestand umfasst 726 Texte mit ungefähr 22.230 Zeichen. Ein vollständiges
Sprachpaket kostet außerhalb des Freikontingents mit NMT ungefähr 0,44 USD. Preise werden vor einer
späteren Einrichtung erneut anhand der offiziellen Google-Preisliste geprüft.

Verpflichtende Sicherungen:

- niedriges Tageskontingent und Google-Budgetalarm;
- standardmäßig Trockenlauf mit Zeichen- und Kostenschätzung;
- explizite Bestätigung vor einer kostenpflichtigen Stapelübersetzung;
- maximale Anzahl Zielsprachen und Zeichen je Lauf;
- keine automatische Wiederholung fehlgeschlagener Großaufträge;
- Abrechnungslabels je Projekt, Sprache und Lauf;
- Übersetzung nur von Änderungen statt des gesamten Bestands.

## Bedienung des geplanten lokalen Werkzeugs

Der Ablauf erhält eine kleine Kommandozeilenschnittstelle, beispielsweise für:

- Bestandsaufnahme und Kostenschätzung;
- Entwurf einer einzelnen Sprache;
- Ergänzung neuer Werkzeugtexte in allen bestehenden Sprachen;
- technische Prüfung ohne Netzwerkzugriff;
- Ausgabe eines Prüfberichts.

Standardverhalten ist immer lokal und schreibgeschützt. Netzwerkzugriff und das Schreiben neuer
Sprachdateien sind getrennte, sichtbare Schritte. Veröffentlichung oder Git-Push gehören nicht zum
Übersetzungswerkzeug.

## Abnahmekriterien

- Anbieter kann später ohne Änderung der Sprachkataloge ausgetauscht werden.
- API-Schlüssel oder Zugangsdaten erscheinen in keinem Commit und keinem Protokoll.
- Trockenlauf nennt Texte, Zeichen, Zielsprachen und geschätzte Kosten.
- Nur öffentliche UI-Texte werden übertragen.
- Unveränderte Texte werden aus dem lokalen Übersetzungsspeicher übernommen.
- Jede erzeugte Sprache besteht Schlüssel-, Unicode-, Such-, Test- und Build-Prüfung.
- Lokale Testpakete sind klar von freigabebereiten und veröffentlichten Paketen getrennt.
- Keine Sprache wird ohne dokumentierte Endkontrolle veröffentlicht.

