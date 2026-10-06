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

- [ ] **Konzept-Referenz in der spanischen Fassung vereinheitlichen:** fünf Dateien schreiben
  «Handwerkerwerkzeuge», `craft/metal` übersetzt „concepto de herramientas para oficios". Beide
  Wege vertretbar, nebeneinander nicht. Vorschlag: der Mehrheit folgen. Gemessen 2026-10-06.
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
- [ ] Offline-Verhalten mit einem automatisierten Browser-Test absichern.
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

## Pflege

- Erledigte Punkte mit Verweis auf Commit oder ADR in ein Fortschrittsprotokoll übernehmen und anschließend hier entfernen.
- Neue Punkte mit Priorität, klarer Definition und möglichst einem nächsten Schritt eintragen.
- Vermutungen oder lose Ideen gehören zunächst nach `03-konzepte/`, nicht in diese verbindliche Aufgabenliste.

