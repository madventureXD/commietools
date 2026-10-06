# Offene Punkte

- [ ] Anbieterneutralen Übersetzungsablauf mit Google Cloud Translation Advanced gemäß
  `uebergabe/03-konzepte/2026-10-03-automatisierte-sprachpakete.md` erst bei der nächsten
  geplanten Sprache umsetzen.
- [ ] **Veröffentlichtes spanisches Testpaket gemäß `uebergabe/03-konzepte/2026-10-03-sprachpaket-spanisch.md`
  online sprachlich und visuell gegenlesen.**
  *(2026-10-04: Das Gegenlesen ist erst **nach** der Online-Stellung möglich. Bis dahin bleibt
  `es` im Sprachschalter sichtbar und wird mitausgeliefert — abweichend von
  `02-architektur/sprachpakete.md` §2, das ein Testpaket „niemals veröffentlicht" sieht. Die
  Abweichung ist damit datiert festgehalten und nicht stillschweigend.)*
  *(Zusatz 2026-10-05: Der Rückstand wächst mit jeder Welle — acht Handwerk-Werkzeuge der Wellen A
  und B sind in Spanisch noch nicht gegengelesen. Das ist keine Regression, sondern die bekannte
  offene sprachliche Abnahme.)*
  *(Zusatz 2026-10-05, Welle C: **zehn** Handwerk-Werkzeuge sind es inzwischen; die beiden neuen
  (Pflaster, Reifen) kommen hinzu. Empfehlung: das Gegenlesen in **einem** Durchgang für die ganze
  Suite, nicht zehn Einzelläufe.)*
  *(2026-10-06: Die **zehn Handwerk-Werkzeuge** sind gegengelesen — sprachlich (elf Quelldateien,
  521 Schlüssel je Sprache, geprüft gegen den deutschen Wortlaut) und visuell (zehn Routen bei
  1360 px und 320 px, mit geöffneten Abschnitten). Zwei Befunde: eine **gemischte Anredeform**
  (20 Stellen im Projekt, darunter ein Widerspruch in derselben Datei) und eine **uneinheitlich
  wiedergegebene Konzept-Referenz**. Beide warten auf eine Entscheidung; die sprachliche Freigabe
  ist damit **nicht** erteilt, der Stand bleibt nach `02-architektur/sprachpakete.md` §11 „Lokales
  Testpaket". Bericht: `06-protokolle/2026-10-06-sprachabnahme-spanisch-handwerk.md`. Die übrigen
  **44** Werkzeuge des Registers stehen weiter aus.)*
  *(2026-10-06, Entscheidung und Umsetzung: **unpersönlicher Infinitiv.** Die vollständige
  Bestandsaufnahme fand **45** Schlüssel mit Anredeform im ganzen Projekt (nicht 20, wie der erste
  Suchlauf vermutete). **31** sind umgestellt — „Elige el archivo" → „Seleccionar archivo",
  „Introduce un valor." → „Introducir un valor.", „Rellene todos los campos." → „Rellenar todos los
  campos." —, **14** sind geprüft und unverändert gelassen, weil dritte Person oder Substantiv
  („Cambia" = ändert, „Firma" = Unterschrift, „Descarga iniciada"). Zwei Bedeutungskorrekturen
  gingen damit einher: „una cadena" → „una cadena **de medidas**" (Maßkette war unscharf übersetzt)
  und das doppelte „los PNG guardados". Bericht: `06-protokolle/2026-10-06-entscheidungen-umgesetzt.md`.)*

- [x] **Spanische Fassung des gesamten Registers gegengelesen (2026-10-06).** Die früher offenen
  **44 Werkzeuge** sind durch: sechs Prüfblöcke (Handwerk A/B, Bild, PDF A/B, Rechner/Text) haben
  die **veröffentlichte** spanische Seite Satz für Satz gegen Deutsch und Englisch gelesen.
  **23 Sprachdateien, rund 90 Korrekturen.** Meine Nachprüfung: Schlüsselgleichheit mit dem
  Deutschen **0 Abweichungen**, Platzhaltergleichheit über **2288 Schlüssel 0 Abweichungen**, keine
  deutschen oder englischen Reste. **Ernstester Fund:** In pdf-organize, pdf-split und pdf-to-images
  stand `{número}`, während der Code nur `{number}` ersetzt — spanische Nutzer sahen wörtlich
  „{número}" statt einer Zahl (im Code nachgelesen: `PdfOrganize.tsx`, `PdfSplit.tsx`). Weitere echte
  Fehler: „Carta blanca" (Blankoscheck) für Tinte, „Descubrir" für Entsperren, „Laboral" für „läuft",
  „Avance" für Vorschau, „Cultivo" für Zuschnitt, „Bien" für rechts. Die Anredeentscheidung
  (unpersönlicher Infinitiv) wurde auch dort angewandt, wo **meine eigenen** Welle-E-Werkzeuge sie
  nicht eingehalten hatten. **Entschieden statt offengelassen:** generischer „Raum" heißt überall
  **estancia** (sala = Wohnzimmer/Saal wäre für Flur, Werkstatt, Lager falsch; 13 Stellen geändert,
  nun 49× estancia), „solo" ohne Akzent nach RAE (4 Stellen), QR-Stile „Clásico/Clásico redondeado"
  wie im Deutschen (die englische Vorlage hatte „classy" wörtlich ergeben), „Reserva el corte" als
  Aussage umformuliert, unsichere Fachklammer „(lima-hoya cuadrada)" durch schlichte Beschreibung
  ersetzt. **Ausgeliefert und nachgemessen:** die ausgelieferten Hauptdateien sind byte-identisch mit
  dem geprüften Build, dieser enthält alle Korrekturen und keine alte Fassung. Commits `0b0b05c`,
  `d4cfc03`. **Ehrlich dazu:** Mein erster Online-Lauf meldete fünf „Abweichungen" — alle fünf waren
  Bedingungen **meines Prüfskripts** (die betroffenen Texte erscheinen erst nach dem Laden einer
  Datei), kein Produktfehler; deshalb die Byte-Prüfung am ausgelieferten Bündel als Beleg.
- [x] **Konzept-Referenz in der spanischen Fassung vereinheitlichen:** fünf Dateien schrieben
  «Handwerkerwerkzeuge», `craft/metal` übersetzte „concepto de herramientas para oficios".
  **Erledigt 2026-10-06: der Mehrheit gefolgt** — überall `concepto del proyecto
  «Handwerkerwerkzeuge»`, eine Stelle geändert (`craft/metal/locales/es.ts`). Der deutsche
  Dokumenttitel steht in Anführungszeichen und bleibt als Titel erkennbar.
- [ ] **Welle C des Handwerker-Konzepts:** Pflaster-/Erdarbeitenrechner (Vorschlag 5) und
  Reifen-/Drehmomentrechner (24) — beide Klasse a, keine neue Abhängigkeit zu erwarten.
  *(2026-10-05: Welle A und B sind abgeschlossen, die Suite „Handwerk" umfasst acht Werkzeuge;
  Übergabe `05-uebergaben/2026-10-05-welle-b-handwerkerwerkzeuge.md`.)*
  *(Zusatz 2026-10-05: **erledigt** — beide Werkzeuge gebaut, geprüft und belegt; Suite „Handwerk"
  mit zehn Werkzeugen, Register 54, 440 Tests in 30 Dateien. Commits `b80f527` und `3972f59`,
  Übergabe `05-uebergaben/2026-10-05-welle-c-handwerkerwerkzeuge.md`. **Nicht gepusht.**)*
- [x] **Welle D, Werkzeug 23 (Prüffristen, `inspection`)** — erledigt am 2026-10-06. Liste
  wiederkehrender Prüfungen mit nächstem Termin, Resttagen, Einordnung und Tabellen-Export;
  **keine vorgeschlagenen Intervalle** (die stammen aus der Gefährdungsbeurteilung des Betreibers)
  und **keine Erinnerung ohne Server** — beides steht sichtbar im Werkzeug. Abnahmekriterien im
  Browser belegt: Einträge überleben ein Neuladen, 463 und 146 Resttage unabhängig nachgerechnet,
  Export gelesen, kein fremder Netzverkehr. Bericht:
  `06-protokolle/2026-10-06-welle-d-01-prueffristen.md`, Belege in
  `06-protokolle/screenshots/2026-10-06-welle-d-prueffristen/`.
- [x] **Welle D, Werkzeuge 19 und 20 (Foto-Beschrifter `photo-caption`, Abnahme- und
  Mängelprotokoll `handover-report`)** — erledigt am 2026-10-06, **Welle D damit vollständig**.
  Werkzeug 19 (`photo-caption`): Aufnahmezeit aus den Bilddaten (eigener Exif-Leser; das echte
  Fremdfoto deckte einen Fehler in der Rückfallkette auf — die dritte Quelle heißt `ModifyDate`,
  nicht `DateTime`), Notiz, Pfeil, je Foto eine Datei und ein Sammel-PDF; Pixelvergleich belegt,
  dass das Original unverändert bleibt. Werkzeug 20 (`handover-report`): Kopfdaten, Mängelzeilen,
  Fotos, zwei Unterschriften, PDF; Gewährleistungsfristen gerechnet (5/4 Jahre, mit Schalttag und
  Jahreswechsel im Test). Die Zeichenfläche ist als **ein** gemeinsamer Baustein herausgezogen
  (`tools/SignaturePad.tsx`), die zweite Fassung in `PdfPlacementTools.tsx` entfernt. Die
  Speichergrenze wurde gemessen: **keine Bruchgrenze gefunden** (60 × 12 MP und 24 × 48 MP liefen
  fehlerfrei) — die Obergrenze von 60 Fotos ist deshalb eine bewusste Schranke, keine gemessene
  Grenze. Bericht: `06-protokolle/2026-10-06-welle-d-02-und-03.md`, Belege in
  `06-protokolle/screenshots/2026-10-06-welle-d-fotobeschrifter/` und `…-welle-d-protokoll/`.
  **Alle drei Werkzeuge der Welle D sind lokal, nichts gepusht.**
- [x] **Welle E (technische Gewerke: 13 Leitungsquerschnitt, 14 Beleuchtung, 15 Rohrdimensionierung,
  16 Heizlast, 18 Gewinde) — **abgeschlossen 2026-10-06: fünf Werkzeuge gebaut, geprüft, belegt** (`06-protokolle/2026-10-06-welle-e-bericht.md`); Suite „Handwerk" 17 Werkzeuge, Register 62. Offen bleibt allein die fachliche Abnahme durch eine Elektro-/SHK-Fachkraft — durch Belege nicht ersetzbar. Der weitere Text dieses Eintrags ist der Verlauf.** Das Konzept sperrte diese Welle bis zur
  Klärung der **Normfrage (Q2)**; der Auftrag „Welle E" wurde deshalb zuerst **nicht** als Bauauftrag
  ausgeführt. **Entscheidung Thomas, 2026-10-06:** zuerst die Quellenlage erheben, dann Q2 auf
  belegter Grundlage entscheiden, dann bauen. **Quellenlage erhoben und selbst nachgeprüft:**
  `03-konzepte/2026-10-06-normfrage-quellenlage.md` + Anlage `06-protokolle/quellenlage-welle-e/`
  (fünf Dateien, 1301 Zeilen, je Wert Quelle und Abrufdatum). **Tragender Befund:** die frei
  abrufbaren Strombelastbarkeitstabellen sind genehmigte Auszüge aus DIN VDE 0298-4 und damit nicht
  übernehmbar; für die übrigen vier sind die Quellen eigene Zusammenstellungen von Behörden/Verbänden.
  **Q2 bestätigt für 14, 15, 16, 18** (eigene Werte, Quelle je Wert sichtbar, jeder Wert änderbar);
  **Werkzeug 13:** Strombelastbarkeit als **Eingabefeld**, das Werkzeug rechnet und prüft den
  Spannungsfall. Bauplan mit Abnahmekriterien: `06-protokolle/2026-10-06-welle-e-plan.md`.
  Reihenfolge: 18 → 14 → 16 → 15 → 13.
  *(2026-10-06, Veröffentlichung: Welle E ist **gepusht und ausgeliefert** — `dd427df`, 31 Commits.
  Online nachgeprüft mit eigenem Beleg. Ein Fehler kam erst dabei heraus: Werkzeug 15 fehlte in der
  Suite „Handwerk" (16 statt 17), weil ein Beauftragter beim Zurücksetzen auch seinen Suite-Eintrag
  entfernt hatte; behoben in `832a5e2` und online bestätigt. Der Katalogprüfer findet das nicht.)*
- [x] **Stilerscheinung in den aufklappbaren Abschnitten der Handwerk-Werkzeuge prüfen:** Bei
  Pflaster und Reifen sitzt die erste Feldspalte auf der Zeile der Zusammenfassung, das
  Eingabefeld darunter. Lesbar und richtig zugeordnet, aber unschön. Ursache wird im gemeinsamen
  Aufbau (`details > summary` plus `.form-grid`) vermutet, noch nicht gegen ein Werkzeug der
  Wellen A/B verglichen — bewusst nicht nebenbei geändert, um keine Stiländerung an allen zwölf
  Werkzeugflächen mit einer Werkzeugwelle zu vermischen.
  *(2026-10-06: **gemessen und behoben.** Die Vermutung stimmt im Kern, die Beschreibung war zu
  scharf: Es war keine Überlappung (gemessen 1360 px und 390 px: Überlappung 0 px auf allen
  geprüften Routen), sondern ein **fehlender Abstand** — dort, wo dem `summary` direkt das
  Formularraster folgt, begann es auf dessen Unterkante, sodass die erste Feldbeschriftung wie ein
  Teil der Zusammenfassung aussah (0 px gegen 36 px, wo eine Hinweiszeile dazwischenliegt).
  Betroffen waren nicht zwei, sondern **drei** Abschnitte: Paving, Tires **und Paint** (Welle B) —
  also ein Vorbefund, nicht von Welle C erzeugt. Behoben an einer Stelle statt in den Werkzeugen:
  `details.settings-card > summary + .form-grid { margin-top: var(--space-4) }` in
  `apps/web/src/styles.css`; der Abstand entspricht damit dem Zeilenabstand des Rasters selbst.
  Belegt mit Messung vorher/nachher und Aufnahmen bei 1360 px und 390 px in
  `06-protokolle/screenshots/2026-10-06-details-abstand/`; die Abschnitte mit Hinweiszeile
  (Tiles, Concrete) sind unverändert (Abstand weiterhin 36 px). Messskripte:
  `work/details-layout-messen.cjs`, `work/details-layout-shots.cjs`,
  `work/details-inhalt-zaehlen.cjs`. **Erledigt mit Commit `57d94da`;
  Fortschrittsprotokoll `06-protokolle/2026-10-06-details-abstand.md`.**)*

- [x] **Bedienzielhöhe der aufklappbaren Kopfzeilen (44 px):** Der anklickbare `summary` eines
  aufklappbaren Abschnitts ist nur rund **21 px** hoch — `docs/ui-system.md` verlangt 44 px
  Mindestgröße für Bedienziele; derselbe Baustein nutzt im Werkzeugmenü `min-height: 3rem`.
  Betrifft **alle 30** Abschnitte in 19 Dateien und damit jede Werkzeugfläche, deshalb bewusst
  nicht nebenbei mitbehoben. Gemessen 2026-10-06 (Beleg `messung-nachher.txt`).
  *(2026-10-06: **erledigt im Barrierefreiheits-Durchgang** — `details.settings-card > summary
  { padding-block: var(--space-3) }` in `apps/web/src/styles.css`. Zugleich wurden alle
  `button`-Elemente auf 44 px gebracht (`button { min-height: 2.75rem }`), weil die Aktionsknöpfe
  der Rechner- und Handwerk-Werkzeuge keine Klasse tragen und mit 27 px (Berechnen) bzw. 20–21 px
  (Textknöpfe) unter der Schwelle lagen. Die Suite „Handwerk" ist damit in allen geprüften
  Kategorien befundfrei; Belege und Messungen im Fortschrittsprotokoll
  `06-protokolle/2026-10-06-barrierefreiheit-handwerk.md`.)*

- [x] **Kontrast der Markenfarbe entscheiden:** Weiße Schrift auf dem Markenrot ergibt
  **3,28:1**, verlangt sind 4,5:1 für Text in 16 px/700. Betrifft `.button.primary`,
  `.button.active` und `.segmented .active` — 38 Vorkommen in 14 Routen, also jeden Hauptknopf
  im Projekt. Zwei Wege: dunkleres Rot nur für Flächen (Marke bleibt) oder dunkle Schrift auf dem
  Rot. **Farbentscheidung, nicht eigenmächtig geändert.** Gemessen 2026-10-06 mit
  `npm run a11y:check`.
  *(2026-10-06: **Entscheidung: „so lassen".** Zugleich eine Korrektur meiner Angabe oben — die
  3,28:1 gelten **nur im dunklen Schema**; im hellen Schema ist derselbe Knopf mit **5,65:1**
  unauffällig. Der Durchgang lief im Vorgabeschema des Browsers (dunkel), das helle Schema war
  nicht mitgemessen — Lücke jetzt geschlossen: `COMMIETOOLS_AUDIT_SCHEME=dark|light`, ein
  vollständiger Durchgang läuft zweimal. Die entschiedene Ausnahme steht **im Prüfer**
  (`AKZEPTIERTE_KONTRASTE` in `scripts/viewport-audit.mjs`, mit Auswahl, Grund und Datum) und wird
  je Durchgang als `akzeptiert=N` weiterhin ausgewiesen — nicht verschwiegen, aber auch nicht als
  Befund gewertet. Bericht: `06-protokolle/2026-10-06-entscheidungen-umgesetzt.md`.)*

- [x] **Gestaltung der Hauptaktion entscheiden:** `<button type="submit">` trägt in **allen 18**
  Rechner- und Handwerk-Werkzeugen keine Klasse; es greift keine Regel, der Knopf zeigt die
  Browser-Vorgabe (grau, Schriftstärke 400) — `docs/ui-system.md` verlangt aber, dass die
  Hauptaktion optisch dominiert. Gemessen und im Bild belegt 2026-10-06. Zwei Wege: Klasse
  `button primary` an den 18 Stellen oder eine Regel für `button[type="submit"]`.
  *(2026-10-06: **Entscheidung: „eine Regel"** — umgesetzt in `apps/web/src/styles.css`, indem die
  vorhandenen `.button`-Regeln um den Selektor `form > button[type="submit"]` erweitert wurden
  (Grundwerte, `.primary`-Farben, `:disabled`, `:hover`). Keine Werkzeugdatei angefasst, keine
  Werte doppelt gepflegt. Gemessen: 1052 × 44 px, Markenfarbe als Hintergrund, weiße 700er Schrift
  — vorher 1052 × 27 px Browser-Standardknopf.)*

- [ ] **Schreibweisen in den spanischen PDF-Texten vereinheitlichen:** derselbe Text meint „Maus"
  und „Stift" zweimal verschieden — „mouse" (2 Dateien: `pdf/m4`, `pdf/placement`) gegen „ratón"
  (1: `pdf/m9`), „bolígrafo" (1: `pdf/m4`) gegen „lápiz" (2). Gemessen 2026-10-06 im Zuge der
  Anrede-Umstellung; bewusst nicht mitgeändert, weil die Anrede die eine Entscheidung war.

- [ ] **Bedienziele unter 44 px außerhalb der Suiten nachziehen:** Schieberegler
  (`input[type=range]`, 16 px hoch) und Kontrollkästchen (18 × 18 px) in acht Bild- und
  PDF-Werkzeugen, Tastenfelder im Programmiererrechner 25–34 px breit. Gemessen 2026-10-06 über
  alle 54 Routen.

- [ ] **Abgeschnittener Inhalt im Programmiererrechner:** vier Tasten `button.keypad-key.operator`
  sind 42 px breit bei 50–53 px Inhalt; über die Tastatur beschriftet, aber der Text wird
  beschnitten. Gemessen 2026-10-06.

Diese Liste enthält bestätigte, noch nicht abgeschlossene Arbeit. Details gehören in verlinkte Konzepte oder Issues, sobald solche vorhanden sind.

## Hohe Priorität

- [ ] Nach erfolgreicher Domainumschaltung einen sichtbaren Source-Link auf `https://github.com/madventureXD/commietools` in die Weboberfläche integrieren.
- [ ] Mailbetrieb nach DNS-Umschaltung prüfen: MX, `autoconfig`, vier SRV-Einträge und SPF; `autoconfig` muss in Cloudflare auf „DNS only“ bleiben.
- [ ] Den PDF-Testkorpus um frei weitergebbare verschlüsselte, XFA-, Annotations- und Signatur-Beispiele sowie Reader-Interoperabilität erweitern.
- [x] Automatisierte Barrierefreiheitsprüfung für zentrale Komponenten und Tool-Flows ergänzen.
  *(2026-10-06: **erledigt** — `scripts/viewport-audit.mjs` hat einen zweiten Durchgang
  (`npm run a11y:check`): Bedienzielgrößen (44 px), zugängliche Namen, Feldbeschriftungen,
  Überschriftenfolge auch im aufgeklappten Zustand, Kontrastfarben, abgeschnittener Inhalt. Der
  Durchgang läuft über alle Routen des Registers bei 1360 px und 390 px und **bricht mit Fehlercode
  2 ab**, wenn eine Route keinen prüfbaren Inhalt liefert — sonst meldet eine Prüfung „bestanden",
  ohne eine Seite angesehen zu haben (genau das passierte beim ersten Lauf, weil die Vorschau nur
  auf IPv6 lauscht). Läuft wie `viewport:check` nur bei laufender Vorschau, deshalb nicht in
  `npm run check`.)*

## Mittlere Priorität

- [x] **Werkzeugtexte je Sprache aufteilen** (etwa je Suite). Stand 2026-10-04 nach der Aufteilung
  des Rechners in vier Werkzeuge: Deutsch 32.672 und Spanisch 31.645 Byte über der Warnschwelle
  30.720; Englisch lag mit 29.787 darunter. Die drei neuen Werkzeuge vergrößern die Summe um rund
  0,5 kB je Sprache — der eigentliche Anteil kommt aus den früheren Wellen.
  *Zusatz 2026-10-05: **Die Warnschwelle ist wieder unterschritten** — Deutsch 27.310, Spanisch
  26.847, Englisch 25.023 Byte. Erreicht durch zwei Schritte: Kurztext und Suchbegriffe liegen nur
  noch im Suchpaket (Doppelung entfernt, rund 15 % des Textpakets), und das Textpaket wird erst auf
  einer Werkzeugroute geholt statt beim Start (Startseite spart 52.211 B gzip; Netzbeleg in
  `07-pruefung/sprachpaket/beleg.txt`). **Hebel 2 ist am 2026-10-05 umgesetzt** (ADR 0010): je
  Werkzeug und je Sprache ein Paket, dazu ein gemeinsames Paket je Sprache; Beleg
  `07-pruefung/hebel2/beleg.txt`. Nicht mehr offen ist damit die Aufteilung je **Werkzeug** —
  erst damit wächst kein Paket mehr mit einem fremden Werkzeug. Siehe
  `05-uebergaben/2026-10-05-sprachpakete-beim-oeffnen-laden.md`.*
- [ ] **Abweichung bei der Rechenkern-Größe klären:** ADR 0005 nennt 89,5 KiB gzip, die Nachmessung
  derselben Factory-Liste ergibt 100,6 KiB (esbuild, gzip -9, mathjs 15.2.0, 2026-10-04). Ziel,
  Liste und Werkzeugliste als Ursache ausgeschlossen; die Zahl wird im Projekt zitiert und sollte
  stimmen. Messskript: `work/rechner-mathjs-messung.mjs`.
- [ ] **Vier Rechner: 200 % Zoom und Screenreader-Namen** prüfen (beim Beleglauf am 2026-10-04
  bewusst ausgelassen, dort wurden zwei Fensterbreiten und die Rückleseprüfung gefahren).
- [ ] **Startgröße im Blick behalten:** drei neue Katalogeinträge je Sprache kosten 9,3 kB gzip im
  Startbündel (146.220 von 204.800). Bei den nächsten Werkzeugwellen neu messen; Ausweg bleibt die
  abgerufene Registerdatei.
- [ ] Entschieden, aber noch nicht gebaut: der **alte Verlaufsbereich `calculator.*`** liegt im
  Gerät, hat aber keine Anzeige und keinen Löschweg. Entweder eine sichtbare Aufräummöglichkeit
  anbieten oder den Punkt schließen.
- [ ] Für Mehrfachausgaben nach gesonderter Größen- und Lizenzprüfung **Alle speichern …** per
  Ordnerauswahl und/oder ZIP-Fallback ergänzen; Einzel-Speichern mit frei wählbarem Namen und Ort
  ist bereits einheitlich umgesetzt.
- [ ] Schritt 3 der Katalogsuche: gezogene Datei gegen die deklarierten Dateitypen prüfen und passende Werkzeuge vorschlagen, mit Unterscheidung zwischen „liest" und „schreibt".
- [ ] Weitere Suchbegriffe ergänzen, wenn im Gebrauch Lücken auffallen (Register und Prüfung melden Dopplungen; zwei Tests finden tote Begriffe).
- [ ] **Elf ältere Übergaben verfehlen die Pflichtabschnitte der Vorlage** (gemeldet am 2026-10-04
  aus der Welle-5-Übergabe; die Prüfung deckte zugleich Lücken in den Wellen 2 und 4 auf). Nicht
  angefasst — eigener Auftrag: fehlende Abschnitte **ergänzen, nie überschreiben**, mit datiertem
  Hinweis.
  *Zusatz 2026-10-04 (Rechner-Aufteilung): Die Prüfung der Rechner-Übergaben fand zwei weitere
  Fälle — `05-uebergaben/2026-10-04-rechner-tastenfeld-umgesetzt.md` (sechs Pflichtabschnitte
  fehlen als Überschrift) und `05-uebergaben/2026-10-04-sammelrelease-sprachen-pdf-rechner.md`
  (drei). **Wichtig zur Einordnung:** der Inhalt ist vorhanden, er steht nur unter anderen
  Überschriften („Was jetzt da ist" statt „Ergebnis", „Ziel" statt „Ziel der Sitzung", „Betroffene
  Bereiche" statt „Geänderte Bereiche" …). Es sind also **keine leeren** Übergaben — die Prüfung
  ist eine Überschriftenprüfung, und wer die Akte gewohnt ist, findet die Angaben nicht dort, wo
  sie stehen müssen.*
- [x] **Lint war ein Leerlauf (Karte M4-008): erledigt 2026-10-06.** `npm run lint` endete
  vorher mit Exit 0 **ohne eine einzige Ausgabe** — kein Arbeitsbereich hatte ein `lint`-Skript.
  Jetzt: `eslint.config.mjs` (risikoorientierte Regeln), Wurzel-`tsconfig.json` für die Paketquellen
  (der Parser sah vorher 290 Dateien nicht), `lint` = `eslint .` und Pflichtteil von `check`.
  Gemessen **0 Fehler, 96 Warnungen** über 415 Dateien; Mutationsgegenproben (ungenutzte Variable,
  unbehandeltes Promise) scheiterten wie erwartet. Als Warnung geführt und begründet:
  `no-misused-promises` (60) und die `no-unsafe-*`-Gruppe. Protokoll:
  `06-protokolle/2026-10-06-m4-008-lint.md`.
- [ ] **96 Lint-Warnungen abarbeiten** (angefangen bei `no-misused-promises`, 60 Treffer).
- [ ] **Kontrastprüfung des a11y-Scanners untersuchen** (Karte M2-009, offener Befund): Ein
  absichtlich kontrastarmer Absatz (`#c9c9c9` auf Weiß) erzeugt **keinen** Kontrastbefund; der
  Prüfer meldet für diese Seite `skippedContrast: 3`. Ursache nicht geklärt — bewusst nicht geraten.
- [ ] **CI-Workflow in Betrieb nehmen** (Karte M1-003): `.github/workflows/quality.yml` liegt
  versioniert, ist aber **nie gelaufen** (es wird nicht gepusht). Offen: Actions auf Commit-SHAs
  pinnen, Browserjob plattformunabhängig machen, Branchschutz und erforderliche Checks im Konto
  einrichten und mit Datum protokollieren.
- [ ] **Signaturkorpus in den normalen Testschutz übernehmen** (Karte M5-003): gültig, verändert,
  inkrementell ergänzt und „unsupported" je Datei mit Herkunft, Hash und Validatorversion.
- [ ] Offline-Verhalten mit einem automatisierten Browser-Test absichern.
  *(2026-10-06, **M8-002 gemessen: die Offline-Bereitschaft des ersten Besuchs ist nicht gegeben.**
  Frisches Profil, App geladen, Service Worker aktiv, HTTP-Cache gelöscht, **Vorschaudienst beendet**
  (Erreichbarkeit 0 geprüft), dann Reload: der Service Worker liefert 7 von 7 Antworten aus dem Cache,
  **eine** Datei scheitert — `/assets/ui-en-*.js` (`net::ERR_FAILED`) — und die Seite bleibt **leer**.
  Ursache im CacheStorage nachgewiesen: **acht** beim Öffnen nachgeladene Pakete (Sprach-, Such- und
  Werkzeugtexte) liegen **nicht** im CacheStorage, sondern nur im flüchtigen HTTP-Cache. Damit ist der
  Kartenbefund bestätigt und präzisiert; die Umsetzung nach der Karte (Sicherung dieser Pakete,
  gezieltes Nachladen nach SW-Kontrolle) steht aus. Teilfälle **nicht** geprüft: Warmbesuch,
  Localewechsel, fehlendes Einzelpaket, SW-Versionswechsel. Protokoll:
  `06-protokolle/2026-10-06-m8-002-offline-erster-besuch.md`.)
  *(2026-10-06, **umgesetzt und erfüllt:** Warmlauf der Sprachpakete nach Service-Worker-Kontrolle
  (`apps/web/src/pwaWarmCache.ts`, 5 neue Tests) **und** `ignoreVary: true` in der Laufzeitregel —
  ohne den zweiten Eingriff blieb der Modul-Import trotz Cache-Treffer bei `net::ERR_FAILED`. Beleg
  im frischen Profil mit beendetem Dienst: Reload lädt vollständig, **23 von 23 Antworten aus dem
  Service Worker, 0 gescheitert**, keine dritte Sprache. Offen bleiben die Teilfälle **Warmbesuch,
  Localewechsel und SW-Versionswechsel** (nicht geprüft) sowie die nie geöffnete Route, die offline
  nichts zeigt — das ist der UI-Teil von M4-004.)*
- [ ] Content Security Policy und spätere Deployment-Header konkretisieren.
- [ ] Größenbudgets zusätzlich pro große Tool-Engine festlegen; das Startbudget und die Sperre gegen PDF-Engines sind umgesetzt.
- [ ] **Werkzeugtexte je Sprache im Blick behalten — Reserve 4,3 KiB.** Mit dem umgesetzten
  Sprachpaket-Umbau ist das Startbündel entspannt (136.961 von 204.800 B gzip); das frühere
  Budgetproblem „vor Welle 6 den Ausweg bauen" ist damit **erledigt**, ebenso der Punkt zur
  Aufnahme von `bundle:check` in den Prüflauf (die Größenkontrolle läuft im Build). An ihre
  Stelle tritt die neue Warnschwelle aus `sprachgetrennte-suchpakete`: **Werkzeugtexte Deutsch
  26.403 von 30.720 B gzip** nach Welle 6. Eine weitere Werkzeugwelle dieser Größe kann sie
  reißen; Ausweg ist die Aufteilung der Werkzeugtexte je Sprache (etwa je Suite).
  *(2026-10-04: Das geplante Tastenfeld des Rechners (`03-konzepte/2026-10-04-rechner-oberflaeche.md`)
  bringt rund **35 zusätzliche Schlüssel je Sprache** — jedes Tastensymbol braucht laut
  `docs/ui-system.md` einen übersetzten zugänglichen Namen. Damit ist die Reserve von rund 4,3 KiB
  vor der Umsetzung neu zu messen; gegebenenfalls wird die Aufteilung der Werkzeugtexte je Sprache
  zur Voraussetzung dieser Welle statt zu einem Folgeschritt.)*
  *(Nachtrag 2026-10-04, Welle A der Handwerkerwerkzeuge: Die Schwelle ist **gerissen** — Deutsch
  **32.080 B** und Spanisch **31.130 B** gegen 30.720 B, Englisch 29.264 B darunter. Ursache ist der
  Umfang der vier neuen Handwerkswerkzeuge in drei Sprachen, nicht ein Fehler; der Build bricht zu
  Recht nicht ab. Der oben genannte Ausweg — Aufteilung der Werkzeugtexte je Sprache, etwa je
  Suite — ist damit **vor Welle B** zu bauen. Begründung im Einzelnen:
  `05-uebergaben/2026-10-04-welle-a-handwerkerwerkzeuge.md`.)*
  *(Zusatz 2026-10-05, Welle B: Der Punkt ist **erledigt**. Die Werkzeugtexte liegen je Werkzeug und
  je Sprache (ADR 0010); die Last einer Route ist mit 5.199 B von 30.720 B unverändert niedrig. Die
  **Summe** aller Pakete war mit dem vierten Werkzeug gerissen (Deutsch 41.309 B gegen 40.960 B) und
  wird seit **ADR 0011** je Paket gemessen (850 B × 53 Pakete = 45.050 B) — sie ist keine
  Besucherlast, sondern eine Kontrolle gegen ausufernde Einzelpakete. Die entscheidende Kennzahl
  bleibt die Last je Route gegen eine feste Schwelle.)*
- [ ] Bedienung per Tastatur automatisiert prüfen (seit Welle 5 offen; in Welle 6 erneut nur
  teilweise — native Formularelemente mit Beschriftungen, kein durchgespielter Tastaturlauf).
  *(2026-10-04: Der durchgespielte Lauf ist erst **nach** der Online-Stellung möglich; bis dahin
  wird die Suite ohne ihn ausgeliefert. Die Roadmap nennt die Barrierefreiheit ausdrücklich als
  Voraussetzung der Phase „Rechnen" — der Punkt bleibt deshalb hier stehen, bis er belegt ist.)*
- [ ] **PDF-Ausgabe ist auf WinAnsi beschränkt.** Zeichen außerhalb (kyrillisch, griechisch,
  chinesisch) werden transliteriert oder zu `?`. Für Deutsch, Englisch und Spanisch reicht das;
  eine Sprache mit anderer Schrift braucht eine eingebettete Schrift.
- [ ] Verhalten von Aufmaß bei sehr vielen Zeilen (mehrere hundert) und an Speichergrenzen messen.


## Später / bei konkretem Bedarf

- [x] **Werkzeuge in ein eigenes Fenster auskoppeln** (Desktop-Erfahrung). M0–M7 am 2026-10-04
  abgeschlossen: Auskoppeln funktioniert mit Zustandserhalt in beide Richtungen, Größen-Hilfe im
  Fenster (Zielgröße gemessen statt deklariert), Ehrlichkeits- und Farbschema-Nachweis;
  **41 von 41 Werkzeug-Routen belegt**; Regeln und Grenzen stehen seit M7 in `docs/ui-system.md`.
  Offen bleibt: Firefox-Messung, Desktop-Breiten (1920/1366/1024/768),
  **Veröffentlichung** (`05-uebergaben/2026-10-04-desktop-auskoppeln-m3-m5.md`,
  `05-uebergaben/2026-10-04-desktop-auskoppeln-m7.md`).
- [ ] Speicheradapter für persistente lokale Nutzerdaten definieren.
- [ ] Bei wachsender Werkzeug- und Sprachenzahl den Bundlezuwachs des Registers messen; Ausweg ist eine abgerufene Registerdatei mit Ladezustand.
- [ ] Desktop- und Mobile-Shells evaluieren. *(2026-10-04: Das Auskoppeln ist der erste Teil davon;
  der Punkt bleibt für die übrige Shell-Frage stehen.)*
- [ ] Erweiterungsmodell für externe Tools oder Plugins bewerten.

## R1 — Sanierungsleitfaden des QM-Audits (ab 2026-10-06)

- [x] **M9-004:** lopdf in beiden Crates von 0.36.0 auf ≥0.42.0 anheben und die WASM neu bauen
  (die bekannte Schwachstelle ist erst ab 0.42.0 behoben). API-Brüche sind zu erwarten; danach
  Signatur und Prüfung erneut belegen.
  *(2026-10-06, **erledigt und belegt:** angehoben auf **0.42.0** in Manifest und beiden Locks.
  Kein API-Bruch (`cargo check` wasm32 + nativ je Exit 0), 50 Rust-Tests grün. **Entschieden
  gegen 0.45.0**, weil dieses die RustCrypto-1.0-Generation zusätzlich hereinzieht (zwei
  `sha2`-Versionen im Graphen, WASM +362 KB statt +142 KB) — 0.42.0 ist die von der Karte
  genannte Fix-Version und der kleinste hinreichende Eingriff. Eine mitgezogene Abhängigkeit
  blockierte den Bau: lopdf ≥0.42 zieht über `rand 0.10` das `getrandom 0.4.3` herein, das für
  `wasm32-unknown-unknown` ohne `wasm_js` nicht baut; im etablierten Projektmuster als direkte
  Abhängigkeit der WASM-Hülle ergänzt. **Abnahme vollständig:** Grenzkorpus außerhalb des
  Browsers (0.36 stürzt ab Tiefe 1000 ab — Binärbetroffenheit damit experimentell belegt;
  0.42 liefert ab Tiefe 100 kontrollierte Fehler und stürzt bei keiner Tiefe ab; echtes
  signiertes PDF lädt weiter), Signaturkorpus vor/nach mit identischem Ergebnis über 0.36/0.42/0.45,
  Advisoryscan über 302 Pakete beider Locks mit **lopdf 0 Treffern**. Liefernachweise im selben
  Paket erneuert (176 Komponenten, 171 mit Originalhinweis). Bericht:
  `06-protokolle/2026-10-06-m9-004-lopdf-anhebung.md`, Aufnahmen in
  `06-protokolle/screenshots/2026-10-06-m9004/`. **Nicht gepusht.**)*
- [x] **OCR-Ursache klären:** Das OCR-Werkzeug meldet für eine gültige Bildseite „Die PDF konnte
  nicht verarbeitet werden." Der Fehlschlag tritt **auch ohne CSP** auf, und der PDF-Viewer liest
  dieselbe Datei fehlerfrei — die CSP ist nicht die Ursache. Hängt an der Abnahme von M8-001.
  *(2026-10-06, **geklärt: es war mein Prüfmittel, nicht das Produkt.** Die Konsolenmitschrift
  (`work/m8-001-ocr-diagnose.cjs`) zeigt `Failed to load module script: … non-JavaScript MIME type
  of "application/octet-stream"`: `work/csp-server.mjs` kannte die Endung `.mjs` nicht und lieferte
  den pdf.js-Worker (`pdf.worker.min-*.mjs`) als Binärstrom aus. Der Browser lehnt ein Modul-Skript
  mit falschem Typ ab, pdf.js kann nicht arbeiten, das Werkzeug meldet den generischen PDF-Fehler —
  und zwar **unabhängig von der CSP**, genau wie beobachtet. Nach Ergänzung von `.mjs` in der
  MIME-Tabelle: OCR läuft unter den gebauten Auslieferungsheadern, 329 Zeichen erkannt, „Gewinde"
  gefunden, keine Konsolenfehler (Aufnahme
  `06-protokolle/screenshots/2026-10-06-m8-001-ocr/ocr-erfolg.png`). **Offen bleibt** der Rest der
    M8-001-Abnahme: Abbruch, beschädigtes Modell, Offlinewiederholung. **Wichtig zur Einordnung:**
    Die ausgelieferte Seite (online geprüft) scheitert weiterhin — dort greift noch die alte CSP
    (`script-src 'self'` blockt den tesseract-Core), weil die M8-001-Reparatur committet, aber
    **nicht gepusht** ist.)*
    *(Zusatz 2026-10-06, Abnahmefälle: **Abbruch ist belegt** — „Die Texterkennung wurde
    abgebrochen.", Aufnahme `abbruch.png`. **Beschädigtes Modell und Offlinewiederholung konnte ich
    nicht belastbar herstellen.** `Network.setBlockedURLs` und `Network.emulateNetworkConditions`
    erreichen den tesseract-Worker nicht: In beiden Fällen lieferte die Seite nach 15 s das volle
    Ergebnis (329 Zeichen), also lief die OCR mit Netz weiter — die Messung sagt nichts über den
    Fehlerfall. Beobachtung aus einem Lauf mit **kaltem** Modell-Cache und abgeschaltetem Netz
    (`work/m8-001-abnahmefaelle.cjs`): Die Verarbeitung lief dort **165 s ohne Meldung, ohne
    Fortschritt und ohne Abbruch** weiter. Das ist ein **Verdacht, kein Befund** — er braucht einen
    Nachweis, den die Netzsimulation nicht liefern kann. Vorgeschlagener Weg: Edge mit
    `--proxy-server` starten und einen kleinen Proxy die CDN-Hosts blocken lassen, damit die
    Anfragen wirklich aus dem Worker-Kontext kommen. Sonden:
    `work/m8-001-abnahmefaelle.cjs`, `work/m8-001-ocr-fehlerfall.cjs`.)*
- [ ] **Vier Lizenzfragen zur Entscheidung** (stehen mit Grund und Datum in `licenses/rust-review.json`):
  `zlib-rs` (Lizenz „Zlib" nicht in der Richtlinie), `unicode-ident` („Unicode-3.0" fehlt),
  `pdf_signer` 0.3.2 (GPL-3.0-or-later, bereits ausgeliefert — bewusst so lassen?), und ob die
  Originaltexte der fünf Pakete ohne Hinweisdatei aus den Repositories nachgetragen werden sollen.
  *(2026-10-06, Zusatz aus M9-004: es sind **sechs** Pakete ohne Hinweisdatei — `alloc-stdlib 0.2.4`
  (BSD-3-Clause) kam mit lopdf ≥0.42 neu in den Graphen und steht ebenfalls in `rust-review.json`.
  Damit sind es **fünf** Lizenzfragen.)*
- [ ] **Fünf Advisory-Treffer außerhalb von lopdf bewerten** (gefunden am 2026-10-06 beim
  Advisoryscan zu M9-004 über 302 Pakete beider Rust-Locks, `work/m9004-advisoryscan-beleg.txt`):
  `crossbeam-epoch 0.9.18` (RUSTSEC-2026-0204, ungültige Zeigerdereferenzierung in `fmt::Pointer`),
  `rsa 0.9.10` (RUSTSEC-2023-0071, Marvin-Attack — **keine Fix-Version verfügbar**, nur Mitigation),
  `rustls 0.23.40` (RUSTSEC-2026-0285 / GHSA-2mjx-qc3c-rqvc; nur mit dem optionalen
  `https`-Feature im Graph) und `ttf-parser 0.25.1` (RUSTSEC-2026-0192, **unmaintained** —
  Wartungswarnung, kein Loch). Nicht Teil der Karte M9-004; Bewertung und Entscheidung stehen aus.
- [ ] **Aufräumregel für den ausgelieferten Hinweisordner:** `apps/web/public/licenses/notices/rust`
  sammelt Hinweise nicht mehr enthaltener Komponenten an — gefunden am 2026-10-06 mit **21 Leichen**
  (u. a. `lopdf-0.36.0`, `lopdf-0.45.0`, `sha2-0.11.0`), während `licenses/notices/rust` korrekt
  aufgeräumt war. `licenses:check` prüft diesen Pfad nicht. Zustand bereinigt; die Regel im
  Generator und eine Prüfung fehlen weiterhin.
- [ ] **13 ältere Übergaben ergänzen:** In `uebergabe/05-uebergaben/` fehlen bei 13 Dateien
  Pflichtabschnitte der Vorlage (betroffen: 2026-10-03-cloudflare-pages, -datensparsame-ladegrenzen,
  -faber-cloudflare-dns, -pdf-m0-m1, -pdf-m2, -pdf-m3, -pdf-m4, -pdf-m5, -pdf-m6,
  2026-10-04-rechner-tastenfeld-umgesetzt, -sammelrelease-sprachen-pdf-rechner). Fehlende
  Abschnitte **ergänzen, nie überschreiben**, mit datiertem Nachtragshinweis.
- [ ] **Entscheidung offen:** Soll die Signatur-Engine einen automatischen Test bekommen? Die
  Abnahme ist belegt (vier Fälle plus Sichtkontrolle), aber in der Testsuite nicht verankert.

## R2 — Ergebnisrichtigkeit und Exportgrenzen (ab 2026-10-06)

- [x] **M3-002 — Statistik liest lokalisierte Zahlen entgegen der Eingabeerklärung: erledigt.**
  Die alte Regel `/^\d+,\d+$/` ließ **jedes Vorzeichen** durchfallen; `-1,5` wurde stillschweigend
  verworfen. Neue Grammatik (vollständiger Zahlentoken mit Vorzeichen, Punkt **oder** Komma,
  Exponent); `1,2,3` und `1.234,56` werden **gemeldet statt geraten**, `gcd(12,18)` bleibt
  unangetastet. Hilfetexte in de/en/es berichtigt (das Komma war dort fälschlich als Listentrenner
  genannt). 4 neue Tests (Projekt 619 → 623); Beleg an der ausgelieferten Seite mit sieben Fällen,
  alle BESTANDEN — darunter der Abnahmefall `-1,5 2,5` → n=2, Mittel 0,5 und die sichtbare Meldung
  „Nicht gelesen (übersprungen): 1,2,3, abc". Bericht:
  `06-protokolle/2026-10-06-m3-002-statistik-eingabe.md`. **Offen: die Karte verlangt, die
  Änderung des dokumentierten Importvertrags ausdrücklich abzunehmen** — der Hilfetext hat sich
  geändert. **Nicht gepusht.**
- [ ] **Lizenzregister bindet die Quellrevision an `git rev-parse HEAD` — Entscheidung nötig.**
  `scripts/license-audit.mjs` schreibt in `licenses/registry.json` die Revision von HEAD und
  vergleicht beim Prüfen den **Dateiinhalt** mit einem frisch erzeugten Stand. Ein **committetes**
  Register enthält damit zwangsläufig die Revision seines Vorgänger-Commits, und `licenses:check`
  ist **nach jedem Commit rot** — auch in einem frischen Checkout von HEAD. Grün ist nur der
  Arbeitsbaum nach einem `licenses:generate`-Lauf. Gemessen am 2026-10-06 (M3-002). Betrifft jede
  künftige Prüfung und die Regel „geprüft wird der Stand, der veröffentlicht wird"; deshalb
  **nicht eigenmächtig** geändert (Regeländerung an der Prüfkette). Regel wäre etwa: die Revision
  nicht im Register führen, sie beim Anzeigen aus dem Build setzen, oder einen Vorfahren als
  gültig akzeptieren.
- [x] **M4-001 — RPN verbindet formatierte Brüche ohne Klammern zu falschen Ausdrücken: erledigt.**
  Der Kern baute den mathjs-Ausdruck aus den **Anzeigeformen** der Operanden; `1/2 / 1/3` liest
  mathjs linksassoziativ als 1/6 statt 3/2. Neu: `geschuetzterOperand` klammert, sobald der
  Operand kein einfacher Dezimaltoken ist — einfache Zahlen bleiben ohne Klammern, damit der
  Rechenweg lesbar bleibt. 4 neue Tests mit dem Abnahmefall **3/2** und einer **Gegenprobe**
  (der ungeschützte Ausdruck ergibt tatsächlich 1/6). Zwei eigene Erwartungen waren falsch und
  sind als bestehendes Verhalten festgehalten: `sqrt` auf einem Bruch scheitert im Fraction-Modell
  mit `numberModel`, `inv` auf 1/2 liefert dort `2/1`. Der Fall ist **latent** (kein UI-Bruchmodus).
  Bericht: `06-protokolle/2026-10-06-m4-001-rpn-brueche.md`. **Nicht gepusht.**
- [x] **M4-002 — Anzeige-Nullschwelle vernichtet auch Rohwert und Genauigkeitsvergleich: erledigt.**
  Der Filter (`ZERO_THRESHOLD = 1e-13`) stand in der **gemeinsamen** Formatierung und wirkte damit
  auch auf `raw` und `full`; die Genauigkeitsampel (ADR 0006) verglich zwei gefälschte Nullen und
  meldete für `1e-14` „vollständig". Jetzt formatiert `formatValue` nur noch — `raw` und `full`
  tragen den echten Wert —, und `anzeigeNull` prüft die Taschenrechner-Konvention **nur für
  `display`** (echte Null ausgenommen, `magnitude > 0`). 4 neue Tests (Projekt 627 → 631):
  `1e-14`, `-1e-14`, `1e-300`, `1e-500` bleiben in `raw`/`full` ungleich null, exakte Null bleibt
  null, `sin(pi)` zeigt `0` bei echtem Vergleichswert, Brüche und große Zahlen unverändert. Keine
  Schwelle verschoben, keine Modellkonvertierung. Bericht:
  `06-protokolle/2026-10-06-m4-002-nullfilter.md`. **Nicht gepusht.**
  **Selbstverschuldeter Umweg, offen benannt:** die Hilfsfunktion wurde durch zwei Patch-Läufe
  doppelt eingefügt und machte die Datei unbrauchbar; behoben über `git checkout` und
  kontrolliertes Neu-Anbringen mit Zählung danach.
- [x] **Kennzeichnung der Anzeige-Nullung entschieden** *(Thomas, 2026-10-06)*: **Hinweis am
  Ergebnis** — bei angezeigter Null steht der echte kleine Wert daneben; **keine** neue Ampelstufe.
  Umsetzung offen: `Calculation` braucht dafür ein Kennzeichen (heute ist `anzeigeNull` in `core.ts`
  lokal und nicht Teil des Ergebnisses), die Rechner-Oberfläche den Hinweis und alle drei Sprachen
  den Text.
  *(2026-10-06, **umgesetzt:** `Calculation.displayRoundedToZero` als Pflichtfeld — in allen
  Rückgabewegen des Kerns belegt, im RPN-Rechner durchgereicht; Hinweis am Ergebnis
  (`data-display-zero`) im Rahmen; `tool.calc.displayZero` in de/en/es. Das Bruchmodell bleibt
  ausgenommen, dort wird nie genullt. Belegt: **667 Tests** (665 → 667), Mutationsgegenprobe
  (genau die zwei neuen Tests rot), vier Browserfälle am ausgelieferten Build, Aufnahmen in
  `06-protokolle/screenshots/2026-10-06-m4-002/`. Zuwachs des gemeinsamen Sprachpakets je Sprache
  +50 bis +57 B gzip, Startbündel unverändert. Bericht:
  `06-protokolle/2026-10-06-m4-002-anzeigenullung-kennzeichnung.md`. **Nicht gepusht.**)*
- [ ] **Verlauf und ANS mit echten kleinen Werten prüfen:** sie hängen an `raw`; `1e-14` steht dort
  jetzt als `1e-14` statt `0`. Gewollte Folge, aber die Oberfläche ist darauf nicht geprüft.
- [ ] Offen in R2 außerdem: M4-003 und die weiteren Karten des Pakets (7 Gruppen).

- [x] **M4-003 — Plotter ersetzt das Zeichen x auch innerhalb von Funktionsnamen: erledigt**
  *(Nachtrag 2026-10-06)*. `valueAt` ersetzte `x` per Zeichenersetzung im Ausdruck: `exp(x)` wurde
  bei `x = 0` zu `e(0)p(0)`, der Kern scheiterte, der Wert war `null` — betroffen waren damit
  Wertetabelle, Nullstellensuche und gezeichnete Kurve gleichzeitig. Neu: der Ausdruck geht
  unverändert an den Kern, `x` wird über den vorhandenen Scope als `BigNumber` gebunden; an der
  Geometriegrenze wird `raw` gelesen und nicht mehr der lokalisierte `display`-Text, der zusätzlich
  die Anzeige-Nullung aus M4-002 trägt. Belegt durch zwei neue Tests mit Mutationsgegenprobe und
  sechs Browseraufnahmen (alle Abnahmefälle der Karte bestanden). Bericht:
  `06-protokolle/2026-10-06-m4-003-plotter-scope.md`. **Nicht gepusht.**
  - [ ] Offen aus M4-003: der von der Karte **optional** genannte `compile()`-Weg für viele
    Stützstellen ist nicht umgesetzt — derzeit wertet jeder Punkt über `evaluate` aus. Erst messen,
    dann entscheiden.
  - [ ] Fund am Rande, gehört zu **M3-010** (R6, nicht begonnen): die Wertetabelle des Plotters
    zeigt Punkt-Dezimalzahlen (`0.3678794412`) in der deutschen Oberfläche; der Rechner zeigt Komma.
- [ ] **Überholt:** der vorstehende Satz „Offen in R2 außerdem: M4-003 …" ist mit dem Nachtrag vom
  2026-10-06 nicht mehr zutreffend. M4-003 ist erledigt; offen sind in R2 noch **M6-001, M6-002,
  M8-004** sowie die beiden Entscheidungen aus M3-002 (Importvertrag) und M4-002 (Kennzeichnung der
  Anzeige-Nullung).
  *(Nachtrag 2026-10-06: Beide Entscheidungen sind **gefallen und umgesetzt** — Importvertrag
  abgenommen (M3-002), Kennzeichnung der Anzeige-Nullung gebaut (M4-002). Der Satz oben bleibt als
  damaliger Stand stehen.)*

- [x] **M6-001 — JSON-Formatierung verändert Zahlenwerte ohne Hinweis: erledigt** *(Nachtrag
  2026-10-06)*. `JSON.parse` + `JSON.stringify` schrieb das Dokument aus Werten neu: aus
  `9007199254740993` wurde `…992`, aus `"\u00e4"` ein `"ä"`, aus `1e309` ein `null`. Neu sind es
  **Textedits** auf dem Originaltext (`jsonc-parser` 3.3.1, MIT, ohne Unterabhängigkeiten); das
  parse-Ergebnis wird nie serialisiert. Kommentare und abschließendes Komma werden abgelehnt, die
  Fehlerstelle **als Zeile und Spalte** angezeigt (drei Sprachen). Das Werkzeug liegt jetzt
  **außerhalb des Startbündels** (Logik hinter eigenem Unterpfad, Oberfläche über `lazy`):
  Werkzeug-Chunk 4,86 kB gzip, Startbündel 148 147 → 148 032 B gzip. Entscheidung und Kosten in
  **ADR 0012**. Bericht: `06-protokolle/2026-10-06-m6-001-json-textedits.md`. **Nicht gepusht.**
  - [ ] Offen aus M6-001: Der Browserbeleg (`work/json-beleg.cjs`) liegt außerhalb der
    Versionierung — bekannter Punkt M10-004.
  - [ ] ADR-Index: **0012** nachgetragen; der Index selbst ist vollständig (ADR 0011 stand bereits
    dort — ein eigener Fehlschluss aus abgeschnittenem Lesen, im Protokoll benannt).
- [ ] **Überholt (dritter Nachtrag 2026-10-06):** Auch hier ist **M6-002 erledigt**; offen ist in
  R2 nur noch **M8-004** (CSV-Freitext als Tabellenformel), dazu die zwei Entscheidungen aus
  M3-002 und M4-002.

- [x] **M6-002 — RPN-Tastenfeld kann mehrstellige Zahlen und Dezimalzahlen nicht zusammensetzen:
  erledigt** *(Nachtrag 2026-10-06)*. Jede Taste hing ihren Schnipsel als **eigenen Token** an —
  `1` `2` ergab zwei Werte statt der Zahl 12. Neu: ein **Eingabereducer** mit getrenntem
  Zahlentoken und abgeschlossenen Tokens (`packages/tools/src/calculator/rpnInput.ts`), mit den
  Aktionen `digit`, `decimal`, `sign`, `commit`, `operator`, `backspace`, `drop`, `swap`, `clear`.
  Enter schließt den Entwurf ab; ein leerer Enter dupliziert nichts. Der Rahmen führt für den
  RPN-Modus einen **eigenen Zustand** — der Text allein kann „abgeschlossen" und „begonnen" nicht
  unterscheiden (das war der Fehler der ersten Fassung: `3` `Enter` `4` ergab `34`). Die
  Textfunktionen `appendRpnToken`, `dropRpnToken`, `swapRpnTokens` sind **entfernt** (kein
  Doppelmodell). Bericht: `06-protokolle/2026-10-06-m6-002-rpn-eingabereducer.md`. **Nicht gepusht.**
  - [ ] Offen aus M6-002: Die `2nd`-Belegung des RPN-Feldes ist ungeprüft (das Feld hat nur eine
    Ebene); der Browserbeleg liegt unter `work/` außerhalb der Versionierung (M10-004).

- [x] **M8-004 — CSV-Freitext wird als potenzielle Tabellenformel exportiert: erledigt, mit einer
  offenen Abnahme** *(Nachtrag 2026-10-06)*. `csvField` maskierte nur Quotes und Trennzeichen — ein
  Freitextfeld mit führendem `=`, `+`, `-`, `@`, Tabulator oder Wagenrücklauf blieb unverändert und
  wurde vom Tabellenprogramm als **Formel** gelesen. Neu: Zellen sind **typisiert**
  (`packages/tools/src/calculator/spreadsheet.ts`) — Text mit Formelstarter wird mit führendem
  Apostroph gekennzeichnet (auch Vollbreite-Zeichen), Rechenwerte bleiben **numerisch**, damit etwa
  `-12,50` nicht zerstört wird. `toCsv` führt alle freien Felder durch diesen einen Encoder; der
  alte lokale `csvField` ist entfernt. Die Oberfläche sagt ausdrücklich, dass die Datei **nicht als
  tabellensicher** zugesichert ist. Bericht: `06-protokolle/2026-10-06-m8-004-csv-formelzeichen.md`.
  **Nicht gepusht.**
  - [ ] **Abnahmekriterium der Karte nicht erfüllt:** „Excel/LibreOffice: Direktöffnung, Import und
    erneutes Speichern" — auf diesem Rechner ist **kein Tabellenprogramm installiert** (geprüft).
    Ersatzweise liest ein **unabhängiger** CSV-Leser (Pythons `csv`) den Korpus: alle 11 Zeilen
    bestanden, keine Zelle beginnt danach mit einem Formelzeichen. Das ersetzt die Probe nicht.

## R3 — Datei-Aufträge, Ressourcen, Offline (ab 2026-10-06)

- [ ] **M4-006 — PDF-Teiler gibt Ergebnis-URLs beim Verlassen nicht frei: Code umgesetzt, Zählerabnahme erbracht,
  offen** *(Nachtrag 2026-10-06)*. Der Teiler erzeugte pro Ergebnis eine Objekt-URL, gab sie aber
  nur bei `clearResults()` (Dateiwechsel, neuer Auftrag) frei — beim **Verlassen** der Route blieben
  sie bis zum Neuladen des Dokuments am Leben. Neu: ein Aufräumeffekt ohne Abhängigkeiten gibt die
  **aktuelle** Liste frei (über einen Ref, damit nicht die Liste des ersten Renderns widerrufen
  wird); verworfene Aufträge aus M4-005 geben ihre URLs bereits sofort frei.
  - [x] **Zählerabnahme erbracht** *(2026-10-06)*: create 1203 / revoke 1200 / offen 3 bei
    sichtbarem Ergebnis; nach **clientseitigem** Routenwechsel (gleiches Dokument, echter Unmount)
    revoke 1203 / offen 0. A's 1200 verworfene Ausgaben wurden sofort freigegeben.
  - [ ] **Offen:** der gemeinsame `useObjectUrls`-Hook bzw. die Erweiterung von `useDownload` (von
    der Karte vorgeschlagen, **nicht** Abnahmebedingung — der Teiler räumt an drei Stellen selbst
    auf), StrictMode-Zyklus (im ausgelieferten Build ruft React Effekte nicht doppelt auf; ein Lauf
    gegen `vite dev` fehlt) und Mehrfachspeichern.
- [ ] **M4-005 — PDF-Ergebnisse können nach Dateiwechsel dem falschen Namen zugeordnet werden:
  Code umgesetzt, Abnahme weitgehend erbracht, ein Fall nicht herstellbar** *(Nachtrag 2026-10-06)*. Zwei Befunde bestätigt: Der Ergebnisname
  kam aus `baseName(file?.name ?? 'document')` — also aus dem **aktuellen** Formularzustand; und
  `process()` setzte Ergebnis, Fehler und Fortschritt ohne Prüfung, ob der Auftrag noch aktuell ist
  (spätes Ergebnis der alten Datei überschrieb die Liste der neuen). Neu: unveränderlicher
  Auftrags-Snapshot (`name`, `bytes`, `pageCount`, `mode`, `selection`) und `generationRef`;
  veraltete Ergebnisse werden verworfen und ihre Objekt-URLs sofort freigegeben; Fehler und
  `processing` setzt nur der aktuelle Auftrag; der Dateiname kommt aus dem Auftrag. Bericht:
  `06-protokolle/2026-10-06-m4-005-pdf-teiler-auftrag.md`.
  - [x] **Browserprobe erbracht** *(2026-10-06)*: A = 1200-Seiten-PDF, B = 3-Seiten-PDF mit anderem
    Namen und Inhalt. Nach dem Dateiwechsel lief B allein (3 Ergebniseinträge), A's 1200 Ausgaben
    wurden verworfen und sofort freigegeben, nach +20 s unverändert. Die drei Ausgabedateien wurden
    abgerufen und mit einem **unabhängigen** Leser geprüft: alle 1 Seite, Inhalt `SEITE-B-1/2/3`,
    **0 von 3 mit `SEITE-A`**.
  - [x] **Produktfehler dabei gefunden und behoben:** Wurde während eines laufenden Auftrags eine
    andere Datei gewählt, blieb der Aktionsknopf **dauerhaft gesperrt** (der alte Auftrag durfte den
    Fortschritt nicht beenden, niemand setzte ihn zurück) — die Seite war eine Sackgasse. `selectFile`
    setzt jetzt `setProcessing(false)` an der Invalidierungsstelle.
  - [ ] **Nicht erfüllt:** der Abnahmefall „A zuletzt fertig" ließ sich **nicht herstellen** — der
    Teiler ist schneller als jede Bedienhandlung (1200 Seiten → 1200 Dokumente in rund 0,6 s,
    Zeitmarken im Protokoll). Künstliche Verlängerungen wurden als Prüfmittel-Eingriffe verworfen.
  - [ ] **Offen:** Unmount während eines **Fehler**wegs (Erfolgsweg belegt).
  - [ ] Muster auf weitere asynchrone Dateiwerkzeuge übertragen (von der Karte verlangt).
- [ ] **M4-004 — Sprachladefehler bleiben gecacht: TEILWEISE** *(Nachtrag 2026-10-06)*. Ursache
  behoben: Alle fünf Lader (`loadToolSearchIndex`, `loadCommonToolTexts`, `loadToolTexts`,
  `loadAllToolTexts`, `loadInterfaceMessages`) legten das Import-Promise ab, ohne es bei einer
  Ablehnung wieder zu entfernen — der nächste Versuch bekam für immer den alten Fehler. Neu:
  gemeinsamer Helfer `cachedLoader` in `packages/core/src/loadCache.ts` (eigener Unterpfad), der
  nur **dieses** Promise und nur **solange es das aktuelle ist** entfernt; der Generator wurde
  geändert und die erzeugten Dateien neu erzeugt. Bericht:
  `06-protokolle/2026-10-06-m4-004-ladecache-teil1.md`.
  - [ ] **Der von der Karte verlangte UI-Teil fehlt:** sichtbarer, übersetzter Fehlerzustand mit
    Wiederholung (`LoadState`, `requestKey`, Retry ohne Dokumentreload, Schutz vor
    Reloadschleifen) in `App.tsx`/`CatalogSection.tsx`/`ToolNavigation.tsx`. Die Abnahme der Karte
    ist damit **nicht** erfüllt.
- [x] **M4-007 — Sprach-Type-Guard akzeptiert geerbte Objektschlüssel: erledigt** *(Nachtrag
  2026-10-06)*. `isLocale` fragte mit `value in localeRegistry` und damit die **Prototypenkette**
  mit: `__proto__`, `constructor`, `toString` galten als Sprachen und erreichten über
  `detectLocale`/`preferredLocale` den Loader. Gegenprobe wörtlich: mit der alten Zeile liefert
  `detectLocale(['__proto__'])` den Wert `'__proto__'` statt `'en'`. Neu:
  `typeof value === 'string'` **und** `Object.prototype.hasOwnProperty.call(...)`
  (`Object.hasOwn` verlangt ES2022 und fehlt in der `lib`-Einstellung — der Typcheck hat es
  gemeldet); Signatur auf `unknown`, damit „nichtstringförmiger Speicherinhalt" wirklich geprüft
  und nicht nur behauptet wird. Bericht: `06-protokolle/2026-10-06-m4-007-sprachpruefung.md`.
  **Nicht gepusht.**
- [ ] Offen in R3: **M8-003** (fehlender Browser-Speicher blockiert statt Rückfall).
  *(Nachtrag 2026-10-07: **M4-004**, **M4-005** und **M4-006** sind abgeschlossen — M4-004 mit einer
  gemessenen Abweichung (kein Retry im selben Dokument), M4-005 mit benannter Grenze, M4-006
  vollständig; **M8-002** ist ✓. Bei allen blieben Produktfehler zu beheben, siehe die
  Protokoll-Nachträge `2026-10-06-m4-005-m4-006-pdf-auftraege-urls.md` und
  `2026-10-07-m4-004-ladefehler-und-fehlerwege.md`. Offen bleibt allein der gemeinsame
  `useObjectUrls`-Hook — laut Karte keine Abnahmebedingung.)*
- [ ] **Kein Retry im selben Dokument möglich** *(2026-10-07, gemessen)*. Ein gescheiterter
  dynamischer Modulimport lässt sich im laufenden Dokument nicht wiederholen: Der Browser merkt
  sich die Adresse, jeder weitere Versuch scheitert ohne neue Netzanfrage (Minimalversuch:
  3 Versuche, 1 Anfrage). Deshalb bietet die Oberfläche das kontrollierte Neuladen an. Nächster
  Schritt, falls gewünscht: ein **benannter**, begrenzter Adresszusatz beim Import (kein beliebiges
  Zeitstempel-Anhängen) — verlangt eine eigene Adresskarte der erzeugten Chunks und ist mit der
  Karte M4-004 abzustimmen.
- [ ] **Neu, nicht gemessen (2026-10-07): dasselbe Adressmuster in weiteren Werkzeugen.** Eine
  Ergebnisadresse entsteht **nach** einem `await`, ohne Aufräumen beim Aushängen — beim PDF-Teiler
  war das ein Leck von **1200 Adressen** (behoben). Dieselbe Stelle steht in
  `PdfToImages.tsx:36`, `ImageMetadata.tsx:125`, `ImageResize.tsx:140`, `ImageWatermark.tsx:197`,
  `IconGenerator.tsx:160/170` und in den Adressgebern von `PdfInteractiveTools.tsx`,
  `PdfSecurityTools.tsx`, `PdfPlacementTools.tsx`. **Nicht geprüft, nicht behoben** — die Angabe
  ist ein Fund am Quelltext, kein Messergebnis. Nächster Schritt: für **ein** Werkzeug denselben
  Zählerbeleg fahren; erst wenn er das Leck zeigt, ist es eine Fehlerklasse und keine Vermutung.
- [x] **M2-009 — automatische Barrierefreiheitsprüfung: abgeschlossen** *(2026-10-07)*. Der
  Kontrastteil der Gegenprobe ist belastbar: Die Ursache des `skippedContrast` war die
  Hintergrundauflösung des **Prüfers** (ohne deckende Vorfahrenfläche wurde der Kandidat still
  übersprungen), gemessen mit zwei Wegwerf-Seiten und behoben — Leinwandrückfall mit ausgewiesener
  Zahl, verbleibende Lücken mit Element und Grund benannt. Gesamtlauf 62 Routen × 2 Breiten in
  beiden Schemata Exit 0. Bericht: `06-protokolle/2026-10-07-m2-009-kontrast-und-ci.md`.
- [ ] **Der Browserjob im CI ist nie gelaufen** *(2026-10-07)*. `.github/workflows/quality.yml`
  hat jetzt einen Job `browser` auf `windows-latest` (Bau, Vorschaudienst, `a11y:check` in beiden
  Schemata, `viewport:check`) — aber es wird nicht gepusht, also hat GitHub ihn nie ausgeführt.
  Nächster Schritt: nach einem gewollten Push den ersten echten Lauf ansehen; bis dahin ist die
  YAML ein Pflichtrahmen, kein Beleg.
- [ ] **Handarbeitspunkte des Barrierefreiheits-Prüfers bleiben offen:** Vorleserausgabe,
  Tastaturdurchlauf, 400 % Zoom, Fokusreihenfolge, reduzierte Bewegung. Der Prüfer gibt sie am
  Ende jedes Laufs selbst aus. Nächster Schritt: bei Gelegenheit ein Vorleserdurchlauf (NVDA oder
  Narrator) auf einer Werkzeugroute, dokumentiert.

## Pflege

- Erledigte Punkte mit Verweis auf Commit oder ADR in ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

