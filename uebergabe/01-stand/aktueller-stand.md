# Aktueller Projektstand

**Stand:** 2026-10-06

**Zusatz 2026-10-07 (Faber), R8 abgeschlossen — 5 von 5 Karten (Übergaben, Abschlusskriterien, Prüfverfahren):**
- **M10-001 ✓** Die verbindliche Aufgabenliste führt **nur offene Arbeit**: 40 erledigte und 2
  überholte Einträge **wörtlich** ins Archiv `06-protokolle/2026-10-07-erledigte-punkte-archiv.md`
  (nichts gelöscht); aktive Punkte tragen IDs `OP-001`…`OP-063`; **11 Konzept-Statusköpfe** datiert
  ergänzt; die `DRINGEND`-Akte als **historischen Vorgang** eingeordnet; neuer Prüfer
  `scripts/akte-audit.mjs` (Regelkreis `listen`) in `npm run check`.
- **M10-002 ✓** **Vorlage und Regel waren widersprüchlich** — `arbeitsregeln.md` verlangte das
  Kopffeld `Auftrag`, die Vorlage hatte es nicht. Vorlage ergänzt, Regel datiert nachgezogen. Neuer
  Regelkreis `uebergabe` (Kopffelder, Pflichtabschnitte **mit zugelassenen Varianten**, Prüfnachweis,
  Revision; Stichtag 2026-10-07). **Gemessen:** 30 von 49 Übergaben mit Lücke, 132 Hinweise
  (Aufgabe OP-018/OP-034, jetzt beziffert).
- **M10-003 ✓** Verfahren **„Aktenkorrektur — ergänzen statt umschreiben"** in `arbeitsregeln.md`
  (ersetzte Aussage, Grund, richtige Aussage, Beleg; alte Fassung über `git show` abrufbar; keine
  History-Umschreibung). Vier nachträglich umgeschriebene Übergaben (`6e33dc3`, `ed0ee4e`) datiert
  **sachlich gekennzeichnet**. Neuer Regelkreis `korrektur` (Wortvergleich; reine Formatierung löst
  **keinen** Befund aus).
- **M10-004 ✓** **`scripts/belege/`** — die tragenden Belege sind **versioniert und portabel**
  (Netzbeleg der Sprachpakete, Größe des Rechner-Kerns, gemeinsame Voraussetzungshilfe, README);
  `npm run beleg:sprachpakete` / `beleg:rechner-kern`. **Abnahme im frischen Checkout ohne `work/`
  gefahren** (beide Belege Exit 0), vier Negativproben brechen mit **Exit 2** und benannter Ursache
  ab statt ein leeres Ergebnis zu melden. Kein `work/` entignoriert, keine private Datei hochgeladen.
- **M10-005 ✓** Neue **`01-stand/abschlussmatrix.md`**: 19 Kriterienzeilen aus elf Konzepten, je
  **Zitat + gemessener Istwert + Revision + Nachweis + Status**. Das Startbudget ist in **drei
  getrennte Anforderungen** zerlegt (identischer Bytewert / kein Engine-Startimport / unter der
  Warnschwelle) — der Bytewert ist **nicht** eingehalten (136.961 → **150.082 B gzip**) und bleibt als
  Abweichung stehen, nicht als angepasste Anforderung. Neuer Regelkreis `abschluss`, der **jedes
  Zitat in seiner Quelle** sucht.
- **Drei Produktbefunde ohne eigene Karte**, alle gemeldet: Vorlage-Regel-Widerspruch (behoben);
  **`HEAD` ist im frischen Checkout nicht baubar** — das committete Lizenzregister widerspricht der
  eigenen Hinweisdatei (**OP-064**, nicht eigenmächtig geändert); der Verweispruefer war für
  mehrfache Backtick-Folgen zu grob (behoben, mit Gegenprobe).
- Prüfkette: `npm run check` Exit 0 (**719 Tests**, 51 Dateien, 0 Lint-Fehler, 109 Warnungen) ·
  `npm run build` Exit 0 (Eingang 150.082 B gzip) · `npm run akte:check` mit **vier** Regelkreisen
  grün. Übergabe: `05-uebergaben/2026-10-07-r8-abgeschlossen.md`. **Nichts gepusht.**
  Gezählter Kartenstand: **59 Karten — 55 erledigt · 1 mit Restforderung (M8-001) · 3 offen**
  (R9 2, R10 1).

**Zusatz 2026-10-07 (Faber), R7 abgeschlossen — 8 von 8 Karten (Produkt- und Architekturakten):**
- **M1-001 ✓** Umfangszahlen der README sind **generiert** (`scripts/readme-scope.mjs`,
  `npm run readme:check` in `check`); am ausgelieferten Bau gezählt **62 Tools / 7 Suiten / 23 PDF**.
- **M1-002 ✓** Suchversprechen überall auf **gewählte Sprache plus Englisch**; der erzeugte Lader ruft
  Englisch nicht mehr doppelt auf; Vertragstest + vier Browserfälle.
- **M2-001 ✓** neuer **ADR 0014** für die tatsächlichen M7-Freigabekriterien; ADR 0004 datiert
  verknüpft, Wortlaut erhalten. **(Entscheidung Thomas, 2026-10-07: angenommen mit vier Auflagen
  A1–A4; der Push ist darin nicht enthalten.)**
- **M2-002 ✓** Größenpolitik datiert festgehalten (Budget = **Warnung**, strukturelle Regel = **harter
  Fehler**), zwei Gegenproben.
- **M2-003 ✓** Rechner-Budgets richtiggestellt (200 KiB / 110 KiB); Baseline selbsterklärend; **harte
  Regel „mathjs nie im Startbündel"** ergänzt.
- **M2-004 ✓** QPDF-Anwendungsbereich umfasst jetzt auch die **Reparatur**; beide Pfade holen dieselbe
  `qpdf-*.wasm`.
- **M2-005 ✓** Doppelnummer 0006 aufgelöst (M9 → **0013**, Weiterverweisakte), Index vollständig,
  neuer Doku-Gate **`npm run adr:check`** in `check`.
- **M11-001 ✓** `docs/architecture.md` mit datiertem Iststand (Codeanker, Verantwortung, Restarbeit),
  Behauptungen K30/K31 geschlossen.
- **Zwei Prüfmittel-Fehler gefunden und behoben:** der Bundle-Prüfer war blind für die statisch
  eingebundene qpdf-Brücke (Signatur `qpdf-wasm` statt Laufzeitname `qpdf.wasm`); das neue ADR-Gate
  prüfte den Rückverweis nur als Text. Beide nachgeschärft und mit Gegenprobe belegt.
- **Unterlassung berichtigt:** die Leitdatei war nach R6 nicht nachgezogen (fünf Karten standen auf
  „○"); datiert nachgetragen. Gezählter Stand: **59 Karten — 50 erledigt · 1 mit Restforderung
  (M8-001) · 8 offen** (R8 5, R9 2, R10 1).
- Prüfkette: `npm run check` Exit 0 (**719 Tests**) · `npm run build` Exit 0 · `npm run adr:check`
  grün (15 Dateien). Übergabe: `05-uebergaben/2026-10-07-r7-abgeschlossen.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), R5-Durchzug — Einheit 6: M7-002 abgeschlossen, das Menü ist ein modaler Dialog:**
- **M7-002 ✓ behoben.** Entscheidung laut Karte: **nativer modaler Dialog** (`<dialog>` +
  `showModal()`) statt eigener Tab-Liste. Die alte Liste (`button, input`) übersah `summary` und
  `select` und fasste **verborgene Nachfahren geschlossener Details** mit; sie ist ersatzlos entfallen.
  Hintergrund wird jetzt von der Plattform inaktiv gestellt, `Escape` läuft über `cancel`, die
  Schirmfläche über `::backdrop` (Klick auf die Rückseite schließt).
- Erste Fokussierung: ab 721 px Suchfeld, darunter der **Schließen-Knopf** (die Tastatur würde sonst
  das Menü verdecken). Fokus-Rückkehr über nativen `close`-Zuhörer **und** Fokussetzung beim Öffnen.
- **Gemessen** (echte Tasten- und Zeigerereignisse, 1360 und 390 px): erster Fokus richtig,
  Hintergrund gesperrt, Tabulatorläufe (14/10/6 Schritte, geschlossene und offene Kategorien, ohne
  Treffer, Favoriten) **0 Ziele außerhalb** und **0 verborgene Ziele**, Escape und Rücktaste schließen
  ohne Routenwechsel und ohne übrigen Verlaufseintrag, Fokus kehrt zurück, Werkzeugwechsel per
  Zeigerklick schließt das Menü.
- Prüfkette: `npm run check` Exit 0 (695 Tests) · `npm run build` Exit 0. Protokoll:
  `06-protokolle/2026-10-07-m7-002-menue-als-modaler-dialog.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), R5-Durchzug — Einheit 5: M2-006 mit benannter Grenze abgeschlossen:**
- **M2-006 ✓ mit benannter Grenze.** Gefunden wurden genau **zwei** feste englische Namen:
  `aria-label="Main navigation"` an der Hauptnavigation und `aria-label="Case mode"` an einem
  `div.segmented` **ohne Rolle**. Beide sind jetzt Schlüssel (`nav.main`, `caseConverter.mode`) in
  allen drei common-Dateien; die Modusgruppe ist `role="group"` mit übersetztem Namen, jeder Knopf
  trägt `aria-pressed` (vorher stand die aktive Kennzeichnung nur als CSS-Klasse).
- **Gemessen am Accessibility-Baum** (`Accessibility.getFullAXTree`) nach echtem Sprachwechsel:
  Navigation **„Hauptnavigation" / „Main navigation" / „Navegación principal"**, Gruppe
  **„Schreibweise" / „Case mode" / „Mayúsculas y minúsculas"** — drei verschiedene Namen, also
  sprachgebunden. Tastatur mit echten Enter-Ereignissen: Modus wechselt in allen drei Sprachen
  (`true,false,false` → `false,true,false`).
- **Nicht herstellbar: echte Vorleseransage** — in dieser Umgebung gibt es keinen NVDA/Narrator.
  Belegt sind Baum und Tastatur; die gesprochene Ansage bleibt Handarbeit und ist **nicht** als
  erfüllt verbucht.
- Erstellungsregeln festgeschrieben: `docs/ui-system.md` (Abschnitt „Accessible names are interface
  text, not source text") und Skill `commietools-werkzeug-bauen` — sichtbare Literale und
  ARIA-Attribute werden **zusammen** geprüft. Literale bleiben nur, wo sie keine Oberflächentexte
  sind (Datumsbeispiele, Terme wie `x^2 - 4`).
- Prüfkette: `npm run check` Exit 0 (695 Tests) · `npm run build` Exit 0. Protokoll:
  `06-protokolle/2026-10-07-m2-006-zugaengliche-namen.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), R5-Durchzug — Einheit 4: M7-005 abgeschlossen, intrinsische Breitenfehler behoben:**
- **M7-005 ✓ behoben.** Zwei gemessene Ursachen: (1) Der Rechner zeigte den Ausdruck
  `div.results` als Raster **ohne Spaltendefinition** — die automatische Spur rechnete auf
  **346,48 px** in einem **254 px** Kasten, der Inhalt wurde beschnitten, also **verdeckt**
  (Zahl ohne Umbruchmöglichkeit). (2) In den Umbruchregeln standen blanke `1fr`-Spuren
  (`minmax(auto,1fr)`), die nicht unter die Inhaltsmindestbreite schrumpfen; mit Textabständen nach
  WCAG 1.4.12 schob der Katalog die Seite auf **405 px** bei 320 px Fenster. Zusätzlich konnte
  `.card-footer` nicht umbrechen und schob den Aktionsknopf aus dem Kasten (rechts bei 380 px in
  einem 206 px breiten Fuß).
- **16 Regeln intrinsisch sicher gemacht:** blanke `1fr` → `minmax(0,1fr)` (Header, Section-Heading,
  Prinzipien, große Umbruchregel, Lizenzfilter, PDF-Viewer-Layout, PDF-Formularraster); feste
  Mindestbreiten in auto-fill-Rastern → `minmax(min(100%, X), 1fr)`; `.results` mit
  `minmax(0,1fr)` + umbrechende Ergebniszeile; `.card-footer` mit `flex-wrap: wrap`.
  **Kein `overflow:hidden`** als Reparatur (Karten-Abgrenzung).
- **Gemessen nach der Änderung:** sieben Zustände je Zeile (Startseite, Menü geöffnet, Rechner mit
  Ergebnis, langer Dateiname, Textabstände WCAG 1.4.12, 640 px und 683 px ≙ 200 % Zoom auf 1280/1366)
  in **320/390 px × de/en/es** und 1360 px — **alle 0 Befunde**; Kopfbereich überall vollständig im
  Bild. Textabstands-Überlauf 405 → 380 → **0** in zwei belegten Schritten.
- Projektprüfer: `viewport:check` (320 px, 62 Routen) *Audit passed*; `a11y:check` über fünf Routen
  in beiden Schemata je 8 Routen `ok`, keine Ziele < 44, nichts abgeschnitten.
- **Grenzen:** kein reales Mobilgerät; Zoom ersatzweise über die CSS-Breite gemessen; Auskoppeln bei
  320 px nicht als eigenes Fenster geprüft.
- Prüfkette: `npm run check` Exit 0 · `npm run build` Exit 0. Protokoll:
  `06-protokolle/2026-10-07-m7-005-schmale-layouts.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), R5-Durchzug — Einheit 3: M2-007 abgeschlossen, Greifgrößen real gemessen:**
- **M2-007 ✓ behoben.** Die Karte stimmt: Menüsortierung und PDF-Seitenaktionen waren **38 px** hoch
  (44–79 bzw. 44–84 breit), gemessen mit erzeugten Zuständen. Die Icon-Ergebnisse waren mit
  68×44 ✓ — der historische Verdacht ist auch hier widerlegt.
- Statt drei verstreuter Kleinvarianten (`2.35rem`, `38px`, `2.25rem`) jetzt **eine gemeinsame
  Variante** `.button.compact` (44×44 als Untergrenze, 0.35rem/0.7rem Innenabstand), angewandt in
  `ToolNavigation.tsx` (4 Sortierknöpfe) und `PdfOrganize.tsx` (6 Seitenaktionen). Die globale
  44-px-Regel blieb unangetastet.
- **Sechs Messzeilen** (320/390/1360 px × spanisch/deutsch × hell/dunkel, längste Sprache ist
  spanisch): alles ≥ 44 außer dem Zähler `<span>` in der Kategoriezeile (29×29, **kein Bedienziel** —
  Klickfläche ist die Zeile mit 294×48). PDF-Seiten- und -Zeilenaktionen jetzt 44×44,
  Icon-Ergebnisse 68–128 × 44–61, alle Summary-Ziele 45–78 hoch.
- Gegenprobe mit dem Projektprüfer über sechs Routen, beide Schemata: „Ziele<44=0",
  „MenueZiele<44=0". `/licenses` bricht der Prüfer mit „Route ohne Inhalt" ab (785 Paketzeilen);
  die Summarys dort sind im eigenen Beleg gemessen.
- Prüfkette: `npm run check` Exit 0 · `npm run build` Exit 0 (149495 B gzip). Protokoll:
  `06-protokolle/2026-10-07-m2-007-greifgroessen-gemessen.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), R5-Durchzug — Einheit 2: M2-008 abgeschlossen, Farben nach Verantwortung getrennt:**
- **M2-008 ✓ behoben.** Vier neue Tokens je Schema (`--color-document-stage`, `--color-plot-grid`,
  `--color-plot-axis`, `--color-plot-label`); der Plotter speist Raster, Achsen und Beschriftung
  daraus, die Kurvenfarben-Palette bleibt **Datenfarbe**. Dokumentbühne für Viewer und
  Schwärzungseditor aus einem Token (vorher zwei verschiedene Grautöne — bewusste Vereinheitlichung,
  im Schwärzungseditor sichtbar von `#777` auf `#303238`).
- **Drei übersehene Stellen desselben Musters wie M7-001 gefunden:** `color: white` auf Markenrot
  stand noch in `.brand-mark`, `.keypad-key.equals` (dunkel 3,16:1 bei verlangten 4,5:1) und in
  `.anchor-grid .active` — dort **ohne** Markenfläche, im hellen Schema also weiße Schrift auf weißem
  Grund, Beschriftung unsichtbar. `a11y:check` sah sie nicht, weil diese Elemente in den geprüften
  Startzuständen nicht sichtbar sind. Alle drei auf `--color-action-text` umgestellt.
- **Rohfarben werden jetzt geprüft:** `npm run tokens:check` meldet Rohfarben und **scheitert** ohne
  begründete Ausnahme; sechs eng gefasste Ausnahmen mit Grund (Dokumentpapier, QR-Papier,
  Unterschriftenpapier, Schwärzungsmarke, Pipetten-Fadenkreuz, Abdunklung).
- **Gemessen (beide Schemata, Zustände erzeugt):** Kurvenfarben identisch; Achsenbeschriftung
  **5,36:1 hell / 11,83:1 dunkel** (vorher dunkel `#666666` auf `rgb(16,17,20)` = **3,29:1**,
  im Browser überschrieben gemessen); Raster `#dddddd`/`#3a404b`; Bühne `#303238`/`#22262c`;
  Papier weiß in beiden; QR-Zeichnung in beiden Schemata identisch (Prüfsumme `83d3a137a49edae1`).
- Prüfkette: `npm run check` Exit 0 (695 Tests, 48 Dateien) · `npm run build` Exit 0. Protokoll:
  `06-protokolle/2026-10-07-m2-008-farben-nach-verantwortung.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), R5-Durchzug — Einheit 1: M7-006 abgeschlossen, Tokenschutz als Pflichtprüfung:**
- **M7-006 ✓ behoben.** Bestandsaufnahme mit dem Stylesheet-Parser: **20 Verwendungen von acht
  Namen, die nirgends definiert waren**, 18 davon **ohne** Fallback. Eine unaufgelöste `var()`-Referenz
  macht die ganze Deklaration ungültig: Der Werkzeugschubkasten hatte deshalb **keine Innenabstände**
  (Kopf/Suche/Sortierung/Inhalt/Fuß), der Inhalt klebte am Rand. Kein vorhandener Prüfer sah es —
  Größen-, Kontrast- und Bündelprüfung betrachten keine Variablen.
- Acht falsche Namen auf semantische Tokens abgebildet; **`--space-5` bewusst nicht eingeführt** (die
  Skala ist 1/2/3/4/6/8/12, eine 1,25-rem-Stufe bräche das Muster) — die sieben Stellen liegen auf
  `--space-4`. Neue Farbe **`--color-warning`** je Schema: hell `#b66a00` (wie der bisherige Fallback),
  dunkel `#e0a65c` (8,11:1 auf der dunklen Fläche, verlangt 3:1).
- **Neu: `npm run tokens:check`** (`scripts/token-audit.mjs`, postcss) als **Pflichtteil von
  `npm run check`**: unaufgelöste Referenzen **ohne** Fallback brechen die Kette; Referenzen **mit**
  Fallback werden als Meldung ausgegeben (der Fallback verdeckt den Namen). Liste erlaubter
  Laufzeit-Tokens vorhanden und leer. Mutationsgegenprobe: alter Name → Exit 1 mit Fundort,
  zurückgenommen → sauber.
- Wirkung im echten Layout belegt (beide Schemata, berechnete Werte): Schubladen-Innenabstände
  16/16/12, Rahmenfarben `rgb(223,225,230)` hell / `rgb(52,56,66)` dunkel, Faktenfläche
  `rgb(255,255,255)` / `rgb(32,35,42)`, aktive Vorschau `rgb(201,31,44)` / `rgb(255,75,89)`.
- Prüfkette: `npm run check` Exit 0 (695 Tests, 48 Dateien) · `npm run build` Exit 0 (Startbündel
  149486 B gzip). Protokoll: `06-protokolle/2026-10-07-m7-006-tokens-und-tokenschutz.md`.
  **Nichts gepusht** (`575a875`).
**Zusatz 2026-10-07 (Faber), R3/M2-009-Durchzug — Einheit 1: M4-005 abgeschlossen, ein Leck behoben:**
- **M4-005 ✓ mit benannter Grenze.** Abnahme auf dem heutigen Stand **neu gefahren**: A (1200 Seiten)
  verworfen, B (3 Seiten) allein sichtbar und speicherbar, über **60 s** unverändert; Zähler
  create 1203 / revoke 1200 / offen 3 → nach clientseitigem Routenwechsel revoke 1203 / **offen 0**.
  Unbelegt bleibt allein die Zeitreihenfolge „A zuletzt fertig" — der Teiler braucht für 1200 Seiten
  rund 0,6 s, der Grund ist gemessen, es wurde **kein** Ersatzbeleg erfunden.
- **Produktfehler gefunden und behoben:** Verlässt man die Route, **während** ein Auftrag läuft,
  blieben **alle Ergebnisadressen** offen. Der Aufräumeffekt gab nur die bereits gesetzte Liste frei
  und erhöhte die Auftragsgeneration nicht, deshalb schrieb der späte Auftrag sein Ergebnis in eine
  ausgehängte Komponente. Gemessen an 1200 Seiten: vorher create 1200 / revoke 0 / **offen 1200**,
  nachher create 1200 / revoke 1200 / **offen 0**. Behebung in `apps/web/src/tools/PdfSplit.tsx`
  (Commit `30d949a`). Der dritte Abnahmefall — Verlassen aus dem **Fehlerzustand** — ist ebenfalls
  belegt (0/0/0, keine Ausnahme, keine Konsolenfehler).
- **Prüfmittel repariert (eigener Fehler):** Das Abnahmeskript merkte sich die Knoten-ID des
  Dateifelds **einmal** und benutzte sie für beide Auswahlen; ein Lauf, in dem B nie ankam, meldete
  trotzdem Erfolg. Jetzt frische Kennung vor **jeder** Auswahl, Warten auf die Reaktion der Seite
  und **Abbruch**, wenn der erwartete Dateiname fehlt.
- **Neu offen, ausdrücklich ungemessen:** dasselbe Adressmuster in acht weiteren Werkzeugdateien
  (`PdfToImages`, `ImageMetadata`, `ImageResize`, `ImageWatermark`, `IconGenerator`,
  `PdfInteractiveTools`, `PdfSecurityTools`, `PdfPlacementTools`) — Fund am Quelltext, Folgearbeit.
- Prüfkette: **`npm run check` 687 Tests in 46 Dateien, Exit 0** · **`npm run build` Exit 0,
  Startbündel 148 998 B gzip**. Protokoll-Nachtrag:
  `06-protokolle/2026-10-06-m4-005-m4-006-pdf-auftraege-urls.md`. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), Einheit 2: M4-006 abgeschlossen:**
- **M4-006 ✓.** Der StrictMode-Zyklus ist belegt — gefahren gegen `vite dev` mit eingehaengtem
  StrictMode (dort ruft React Effekte doppelt auf; im ausgelieferten Build nicht), Skript
  `work/m4-006-strictmode.cjs`. **Fünf Aufträge hintereinander**: Zähler in jedem Lauf genau wie
  erwartet (create 3n / revoke 3(n−1) / offen 3), danach **create 17 / revoke 17 / offen 0**.
  **Mehrfachspeichern** (steht in der Abnahme): zweimal gespeichert, die kurze Downloadadresse
  wird selbst freigegeben, die 3 Ergebniseinträge bleiben unverändert. Keine Ausnahme, keine
  Konsolenfehler.
- **Benannter Rest, ausdrücklich keine Abnahmebedingung:** der gemeinsame `useObjectUrls`-Hook ist
  nicht gebaut; der Teiler räumt an vier Stellen selbst auf. Bleibt als Aufräumarbeit.
- Prüfkette unverändert: `npm run check` 687 Tests, Exit 0. **Nichts gepusht.**

**Zusatz 2026-10-07 (Faber), Einheit 5: M8-003 abgeschlossen — Speicherfehler legen die Werkzeuge nicht mehr lahm:**
- **Vorher:** Die drei IndexedDB-Bereiche (Rechnerverlauf, Aufmaß, Prüffristen) liefen ungeschützt.
  Beim Rechner standen **Engine und Speicher in einem `Promise.all`** — ein Speicherfehler machte
  das Werkzeug **unbenutzbar**, obwohl beides nichts miteinander zu tun hat. Ein nicht lesbarer
  Bestand sah aus wie „nichts gespeichert" und wäre beim nächsten Schreiben überschrieben worden;
  Schreibvorgänge liefen als `void` ohne Rückmeldung.
- **Neu:** Speicheradapter mit expliziten Zuständen (`ok`/`unavailable`/`quota`/`invalid`,
  `packages/tools/src/storage/indexedStore.ts`), Engine und Speicher **getrennt** geladen,
  **flüchtiger Sitzungsbetrieb** mit sichtbarer Warnung in drei Sprachen, **kein „gespeichert"
  ohne Deckung**, und nach einem gescheiterten Lesen wird **nicht** geschrieben.
- **Abnahme im Browser** (Fehler über `Page.addScriptToEvaluateOnNewDocument` **vor** dem
  Programmstart eingespeist, `work/m8-003-abnahme.cjs`): gesperrtes `localStorage` → Start ohne
  leeren Bildschirm; kaputter Inhalt → Rückfall ohne erfundene Ursache; gesperrte IndexedDB →
  **Rechner rechnet trotzdem** (`2+3` = **5**) und warnt, Aufmaß und Prüffristen warnen;
  scheiterndes Schreiben → `7*6` = **42** und Warnung statt Erfolg. **0 Meldungen, 0 unbehandelte
  Zusagen.**
- **Nicht gemessen, offen benannt:** ob der eingespeiste `QuotaExceededError` als `quota` (statt
  `unavailable`) ankommt — die Warnung ist in beiden Fällen dieselbe; die Zuordnung ist über den
  Test zu `classifyStorageError` abgesichert.
- Prüfkette: `npm run check` **695 Tests in 48 Dateien** Exit 0, **0 Lint-Fehler**;
  `npm run build` Exit 0, Startbündel **149 481 B gzip**. Protokoll:
  `06-protokolle/2026-10-07-m8-003-speicherfehler-und-fluechtiger-betrieb.md`.
  **Nichts gepusht** (`bd95592`). **Damit ist R3 vollständig.**

**Zusatz 2026-10-07 (Faber), Einheit 4: M4-004 abgeschlossen — Ladefehler haben einen sichtbaren Fehlerweg:**
- **Vorher:** Eine abgelehnte Zusage beim Nachladen der Werkzeugtexte war **unbehandelt**, die
  Werkzeugseite stand für immer im Ladehinweis; ein gescheiterter `lazy()`-Import riss die Seite mit
  **leerem Bildschirm** ab; Katalog, Werkzeugmenü, Suiten-Seite und Katalogschlüssel hatten ebenfalls
  keinen Fehlerweg.
- **Neu:** übersetzte Meldung mit **kontrolliertem Neuladen** (einmal, Schleifensperre im
  Gerätespeicher, sichtbarer Hinweis auf verlorene Eingaben), **Fehlergrenze** für die nachgeladenen
  Werkzeuge mit **getrennten** Meldungen für veralteten Chunk und Auswertungsfehler, Fehlerwege für
  Katalog, Menü und Suiten-Seite, Texte in drei Sprachen, 5 Tests für die reinen Funktionen.
- **Abnahme über einen Fehler-Proxy vor dem Browser** (`work/fehler-proxy.mjs`, bewusst nicht über
  `Network.setBlockedURLs`): 7 Prüfungen grün — gesperrte Textdatei zeigt Meldung und Knopf,
  Neuladen bringt ein neues Dokument, Schleifensperre greift, mit wiederhergestelltem Netz lädt
  derselbe Baustein sauber, der verzögerte Fehlschlag der alten Sprache beschädigt die neue nicht,
  der faule Chunk wird gefangen, der Auswertungsfehler **anders** gemeldet.
  **0 unbehandelte Zusagen** im ganzen Lauf.
- **Abweichung von der Karte, gemessen und benannt:** „Retry ohne Dokumentreload" ist bei einem
  gescheiterten **Modulimport** nicht möglich. Der Minimalversuch (`work/modulimport-probe.cjs`)
  zeigt drei Versuche mit nur **einer** Netzanfrage: Der Browser merkt sich die gescheiterte Adresse
  im Modulspeicher des Dokuments. Statt eines Knopfes, der nichts bewirken kann, steht das Neuladen.
  Ein benannter, begrenzter Adresszusatz wäre der einzige Weg — die Karte verbietet ihn ausdrücklich.
- Prüfkette: `npm run check` **692 Tests in 47 Dateien** Exit 0, **0 Lint-Fehler**;
  `npm run build` Exit 0, Startbündel **149 472 B gzip**. Protokoll:
  `06-protokolle/2026-10-07-m4-004-ladefehler-und-fehlerwege.md`. **Nichts gepusht** (`ec226ea`).

**Zusatz 2026-10-07 (Faber), Einheit 3: M2-009 abgeschlossen — Kontrastmessung belastbar, Browserjob im CI:**
- **Ursache gemessen statt geraten:** Der Prüfer brach die Hintergrundauflösung ab, wenn über einem
  Text **keine deckende Fläche** lag — der Kandidat wurde still übersprungen. Zwei Wegwerf-Seiten
  mit demselben kontrastarmen Absatz belegten es: **ohne** Hintergrund `Kontrast=0` bei
  übersprungen **3**, **mit** deckendem Weiß `Kontrast=1` (gemessen **1,66** bei verlangten 4,5).
  Der Befund lag also im **Prüfmittel**, nicht im Produkt.
- **Behebung:** Rückfall auf die **Leinwandfarbe** (Weiß), ausgewiesen als `Leinwandrueckfall` je
  Route; nicht messbare Stellen (Text über Bild oder Verlauf) werden mit Element, Textausschnitt
  und Grund **benannt** ausgegeben statt gezählt. Mutationsgegenprobe: derselbe Absatz ergibt jetzt
  in beiden Fällen einen Befund (übersprungen 0 bzw. 1 — benannt).
- **Regression:** `a11y` in beiden Schemata **Exit 0, 62 Routen × 2 Breiten, 0 Befunde, 0 Lücken**.
  Auf **keiner** echten Route greift der Leinwandrückfall — jede Textstelle hat eine deckende
  Fläche; die Annahme ist für das Produkt nie wirksam.
- **CI:** neuer Job `browser` auf `windows-latest` (Bau, Vorschaudienst mit Wartezeit, `a11y:check`
  in beiden Schemata, `viewport:check`) — mit vier benannten Grenzen (nie gelaufen; prüft den Bau
  auf dem Läufer, nicht die ausgelieferte Seite; Actions als Tags statt SHAs; kein Ersatz für
  Kontoschutz und Handarbeit). YAML mit einem YAML-Leser eingelesen: drei Jobs, `browser` mit neun
  Schritten.
- **Ein eigener Fehler, offen benannt:** Die erste Fassung der Prüfseiten setzte die Textfarbe
  nicht — das Fehlen des Befunds war dort richtig. Erst nach der Korrektur war die Messung
  aussagekräftig.
- Protokoll: `06-protokolle/2026-10-07-m2-009-kontrast-und-ci.md`. Prüfkette: `npm run check`
  687 Tests Exit 0, `node --check` für das Skript. **Nichts gepusht.**

**Zusatz 2026-10-06 (Faber), QM-Sanierung R3/R4 — nach dem Durchzug:**
- **M8-002 (R3, erfüllt):** Offline-Bereitschaft des ersten Besuchs — Warmlauf der beim Start
  geholten Sprachpakete (`apps/web/src/pwaWarmCache.ts`) und **`ignoreVary: true`** in der
  Laufzeitregel (`vite.config.ts`; ohne diesen Hebel scheiterte der Modul-Import trotz
  Cache-Treffer mit `net::ERR_FAILED`). Beleg mit beendetem Dienst: **23 von 23 Antworten aus dem
  Service Worker, 0 gescheitert**, keine dritte Sprache.
- **R4 (sieben von acht Karten):** **M4-008** Lint prüft jetzt 415 Dateien (**0 Fehler**; vorher
  lief das Kommando ohne eine einzige Datei), **M5-001** Inhaltsorakel über pdfjs, **M5-002**
  Speicheradapter mit geprüften Bytes, **M5-003** QPDF-Wirkung im Browser (geschützt/entsperrt/
  falsches Passwort), **M5-004** dokumentierte Regressionen in der regulären Suite, **M3-009**
  registrygesteuerter Sprachkontrakt mit Mutationsgegenprobe, **M1-003** versionierter CI-Workflow
  (vier Grenzen benannt, **nie gelaufen** — kein Push). **M2-009 ◐:** Prüfer um offenes
  Werkzeugmenü und eigene Grenzen erweitert, `aria-hidden`-Namenslücke behoben; Gesamtlauf
  **62 Routen × 2 Breiten grün**, die Kontrastprüfung ist offen (absichtlich kontrastarmer Absatz
  erzeugt keinen Befund, `skippedContrast: 3`, Ursache ungeklärt).
- **Zwei Produktfehler behoben:** Der Aktionsknopf im PDF-Teiler blieb nach einem Dateiwechsel
  dauerhaft gesperrt (M4-005); `normaliseFileName` schnitt bei 180 Zeichen mitten in einem Emoji ab
  (**M3-007 damit erledigt**).
Teststand **687 Tests** (`npm run check`, Exit 0), Startbündel **149 000 B gzip** von 204.800,
`build` Exit 0, **nicht gepusht** (`9882c57`, `86082e5`; 44 Commits vor `origin/main`).
Protokolle: `06-protokolle/2026-10-06-r4-pruef-und-freigabeschranken.md` u. a.; Übergabe:
`05-uebergaben/2026-10-06-m8-002-und-r4.md`.
**Zusatz 2026-10-06 (Faber), Welle E — abgeschlossen:** Suite „Handwerk" umfasst jetzt **17
Werkzeuge** (neu: Leitungsquerschnitt/Spannungsfall, Beleuchtung, Rohrdimensionierung, Heizlast,
Gewinde). Register **62 Werkzeuge**, **619 Tests in 39 Dateien**, Startlast 147.711 B gzip von
204.800, `lint`/`check`/`build` grün, `a11y:check` (hell und dunkel) und `viewport:check`
(320/390/1360 px) je Route grün. Jede Zahl stammt aus einer belegten Quelle mit sichtbarer
Angabe je Zeile (Abrufdatum 2026-10-06); Werkzeug 13 enthält **absichtlich keine**
Strombelastbarkeitstabelle, sondern ein Eingabefeld (Entscheidung Q2). Die Abnahme fand sechs
Fehler, alle behoben. Einzelheiten: `06-protokolle/2026-10-06-welle-e-bericht.md`, Belege in
`06-protokolle/screenshots/2026-10-06-welle-e/`. Alles lokal, **nicht gepusht** (`11f09d4`, `8d9be23`).
**Fachliche Freigabe beanspruchen 13 und 16 ausdrücklich nicht** (Vorplanung bzw. Überschlag).

**Zusatz 2026-10-06 (Faber), QM-Sanierung Stufe C (R2) — zwei Karten erledigt:** In R2 sind
**M4-003** und **M6-001** abgeschlossen.

- **M4-003 (Plotter):** `valueAt` ersetzte `x` per Zeichenersetzung **im Ausdruck** — `exp(x)` wurde
  bei `x = 0` zu `e(0)p(0)`, und jeder Name mit einem `x` darin lieferte `null` (Wertetabelle,
  Nullstellensuche und Kurve gleichzeitig). Jetzt geht der Ausdruck unverändert an den Kern, `x`
  hängt am vorhandenen Scope, und an der Geometriegrenze wird `raw` statt des lokalisierten
  `display` gelesen.
- **M6-001 (JSON):** Die Formatierung schrieb das Dokument aus Werten neu — `9007199254740993`
  wurde `…992`, `"\u00e4"` wurde `"ä"`, `1e309` wurde `null`. Jetzt sind es **Textedits** auf dem
  Originaltext (`jsonc-parser` 3.3.1, MIT, ohne Unterabhängigkeiten), Kommentare und
  abschließendes Komma werden abgelehnt und die Fehlerstelle als **Zeile und Spalte** benannt.
  Das Werkzeug lädt seitdem **nach** (eigener Chunk 4,86 kB gzip) — Entscheidung und Messwerte in
  **ADR 0012**. Erst dadurch blieb die neue Bibliothek aus dem Startbündel.

Register unverändert **62 Werkzeuge**, **639 Tests in 40 Dateien** (`npm run check`), Startlast
**148.032 B gzip** von 204.800 (vorher 148.147 — trotz neuer Bibliothek 115 B kleiner), `check` und
`build` grün. Neue Abhängigkeit: **`jsonc-parser` 3.3.1** (MIT), im Lizenzregister und in
`THIRD_PARTY_NOTICES.md` eingetragen. Alles lokal, **nicht gepusht** (`c30cb74`, `00da6c7`,
`dac33b7`). Einzelheiten: `06-protokolle/2026-10-06-m4-003-plotter-scope.md` und
`06-protokolle/2026-10-06-m6-001-json-textedits.md`.

**Zusatz 2026-10-06 (Faber), Nachtrag zu M6-002:** Das **RPN-Tastenfeld** setzt jetzt
mehrstellige Zahlen zusammen: Ein Eingabereducer scheidet den bearbeiteten Zahlentoken von den
abgeschlossenen Tokens (`packages/tools/src/calculator/rpnInput.ts`); `1` `2` `Enter` ergibt die
Zahl 12 statt zweier Werte. Die Textfunktionen `appendRpnToken`, `dropRpnToken` und
`swapRpnTokens` sind entfernt. Im Browser belegt (`12 3 +` → 15, `1,5 2 *` → 3, SWAP/DROP,
eingefügter Text). Projekt-Tests **649 in 41 Dateien**, Startbündel **148 025 B gzip**.
Bericht: `06-protokolle/2026-10-06-m6-002-rpn-eingabereducer.md`. **Nicht gepusht** (`15f386f`).

**Zusatz 2026-10-06 (Faber), Veröffentlichung:** Welle E ist **ausgeliefert** — 31 Commits gepusht
(`dd427df`), die Auslieferung spielte den Stand nach rund zwei Minuten aus (Katalogdatei
`BPHs9pGK`), online nachgeprüft mit eigenem Beleg (`work/online-nachpruefung.cjs`): Suite
„Handwerk" zeigt **17 Werkzeuge**, alle fünf neuen sind aufgeführt, Werkzeug 15 lädt, Werkzeug 18
rechnet online richtig (M10: Kernloch 8,5 · D1 8,38 · Durchgangsloch 11 · Schlüsselweite 16 ·
Anzugsmoment 48–54 Nm), die Suche findet „Gewinde".

**Dabei ein Fehler gefunden, den kein Test und keine Prüfung im Repository gemeldet hat:**
Werkzeug 15 (Rohr) war im Register, **fehlte aber in der Suite „Handwerk"** (16 statt 17). Ursache
war ein Beauftragter, der beim Zurücksetzen seiner Verdrahtung auch seinen Suite-Eintrag entfernt
hatte — **nachdem** meine Verdrahtungsprüfung gelaufen war. Der Katalogprüfer schweigt dazu, weil
ein nicht aufgeführter Werkzeugeintrag kein Fehler ist. Gefunden hat es erst der Blick auf die
**ausgelieferte Seite**; behoben in `832a5e2`, danach erneut ausgeliefert und online bestätigt.
Lehre im Skill: nach dem Zurückkehren der Beauftragten **Einträge zählen** und die Suite-Zeile
**einzeln** nachsehen — nicht nur den Kataloglauf bestehen lassen.

**Letzter geprüfter Meilenstein:** Sammelrelease mit 41 Werkzeugen, vollständiger Rechner-Suite, PDF-Suite M0–M9 und sprachgetrennten Suchpaketen auf `main` veröffentlicht (`95e1b2f`, 2026-10-04); automatische Cloudflare-Bereitstellung und Online-Nachkontrolle sind als nächster Schritt vorgesehen.

**Zusatz 2026-10-05 (Faber):** Suite „Handwerk" mit **Welle A und Welle B vollständig** — acht
Werkzeuge (Beton, Dach, Metallgewicht, Holzfeuchte, Fliesen, Farbe, Trockenbau, Bodenbelag),
Register **52 Werkzeuge**, 426 Tests in 28 Dateien, Startlast 146.867 B gzip von 204.800. Die
Sprachpaket-Aufteilung vom 2026-10-05 hatte zwölf Werkzeugflächen sichtbar beschädigt (Kurztext
stand als Schlüsselname in der Seite); repariert, mit Wächtertest und erweiterter
Funktionsprüfung. Entscheidung zur Textsumme: ADR 0011. Alles lokal, **nicht gepusht** —
Einzelheiten in `05-uebergaben/2026-10-05-welle-b-handwerkerwerkzeuge.md`.
**Zusatz 2026-10-05 (Faber), Welle C:** Suite „Handwerk" **vollständig** — die beiden
verbliebenen Werkzeuge der Lösungsklasse a sind gebaut: **Pflaster und Erdarbeiten** (`paving`) und
**Reifen und Drehmoment** (`tires`). Die Suite umfasst damit **zehn Werkzeuge**, das Register
**54 Werkzeuge**, **440 Tests in 30 Dateien**, Startlast 146.993 B gzip von 204.800. Beim
Pflasterwerkzeug rechnet das Werkzeug im Rastermaß (Stein plus Fuge), beim Reifenwerkzeug wird kein
Anzugsmoment vorgeschlagen — nur Einheiten und Toleranzbereich. Alles lokal, **nicht gepusht**;
Einzelheiten in `05-uebergaben/2026-10-05-welle-c-handwerkerwerkzeuge.md` und
`06-protokolle/2026-10-05-welle-c-gesamtbericht.md`.
**Zusatz 2026-10-06 (Faber), Barrierefreiheit, Sprache und drei Entscheidungen:** Der
Barrierefreiheits-Durchgang der Suite „Handwerk" ist **befundfrei** (Bedienziele 44 px,
Überschriftenfolge, zugängliche Namen, Kontrast, abgeschnittener Inhalt) und als zweiter Durchgang
im vorhandenen Belegapparat dauerhaft nutzbar (`npm run a11y:check`, Farbschema einstellbar). Die
spanische Fassung der zehn Handwerk-Werkzeuge ist sprachlich und visuell gegengelesen; die Anrede
steht seit der Entscheidung vom 2026-10-06 durchgehend im unpersönlichen Infinitiv (31 Stellen).
Drei Entscheidungen sind umgesetzt und belegt: Markenfarbe bleibt (Kontrastmangel **nur im dunklen
Schema**, 3,28:1 gegen 5,65:1 im hellen), die Hauptaktion trägt jetzt die Gestaltung von
`button primary` über **eine** Regel, und die spanische Anrede ist vereinheitlicht. Einzelheiten in
`06-protokolle/2026-10-06-barrierefreiheit-handwerk.md`, `…-sprachabnahme-spanisch-handwerk.md` und
`…-entscheidungen-umgesetzt.md`.
**Lokal fertiggestellt, noch nicht veröffentlicht:** Desktop-Auskoppeln M0–M7 (Werkzeuge laufen in
einem eigenen Fenster); die elf zugehörigen Commits liegen lokal vor `origin/main`.

## Umgesetzt

- TypeScript/npm-Workspace-Grundstruktur
- React/Vite-Webanwendung und installierbare PWA
- responsives einheitliches UI mit Light/Dark Mode
- Local-/Offline-Kennzeichnung
- manifestbasierte Tools und Suiten
- hybride Internationalisierung mit Deutsch, Englisch und einem veröffentlichten spanischen Testpaket; Werkzeug- und Suchtexte werden je Sprache nachgeladen
- QR-Code-Generator mit UTF-8-Unterstützung
- Bild-Metadaten: Anzeige und verlustfreies Entfernen von EXIF, XMP, IPTC und Kommentaren in JPEG, PNG und WebP, ohne Neuberechnung der Bildpunkte
- Bild skalieren: Skalieren, Zuschnitt, Drehen und Spiegeln mit hochwertiger Filterung im Web Worker; fester Ablauf Ausrichtung → Zuschnitt → Skalierung
- Icon-Generator: PNG-Satz von 16 bis 512 px, maskierbare Variante je Größe, `favicon.ico` mit selbst geschriebenem ICO-Container und kopierbarer `icons`-Eintrag für ein Web-App-Manifest
- Wasserzeichen: Text oder eigenes Logo, einzeln an neun Positionen oder als gedrehtes Kachelmuster über das Bild, mit Größe, Deckkraft, Rand- und Musterabstand
- Farbwerkzeuge: Umrechnung zwischen HEX, RGB, HSL und LAB, Pipette auf Bildern (Maus und Tastatur), Palette, WCAG-Kontrastprüfung sowie Simulation für Protanopie, Deuteranopie, Tritanopie und Achromatopsie
- CommieTools-Logo- und Iconvarianten
- vollständige AGPL-3.0-only-Projektlizenz
- automatisch erzeugte und auf der Webseite abrufbare Lizenzdatenbank
- Lizenzprüfung als verpflichtender Bestandteil von Check und Build
- öffentliches GitHub-Repository `madventureXD/commietools`; `main` löst automatische Cloudflare-Pages-Deployments aus
- Cloudflare-Pages-Bereitstellung aktiv unter `https://commietools.pages.dev`: SPA-Fallback, PWA-Cache-Regeln und Sicherheitsheader; Domainregistrierung bleibt bei Hetzner
- Produktivdomains `https://commietools.org` und `https://www.commietools.org` im Pages-Projekt aktiv; beide mit Cloudflare-SSL
- geprüfter Stand mit 41 Werkzeugen über `main` veröffentlicht; die Produktivkontrolle des Sammelreleases steht noch aus
- zweisprachige, dauerhaft im Footer erreichbare Impressumsseite mit Anbieteranschrift und E-Mail-Kontakt
- erzeugtes Werkzeugregister (`packages/tools/src/catalog/toolIndex.ts`) mit Symbol, Kurzbeschreibung und Suchbegriffen je Werkzeug und Sprache; Prüfung als Bestandteil von Check und Build
- deklarierte Dateifähigkeiten je Werkzeug im Manifest (`input`, `auxiliary`, `output`); Dateifelder, Formatlisten und Katalogkarten lesen daraus, nicht aus eigenen Kopien
- einheitliches lokales Speichern für alle 17 dateierzeugenden Werkzeuge: editierbarer Dateiname,
  nativer Speichern-unter-Dialog in unterstützenden Browsern und transparenter Download-Fallback;
  Mehrfachausgaben bieten diese Steuerung für jede einzelne Datei
- Katalogsuche über Suchbegriffe, Schlagwörter, Titel, Kurzbeschreibung und Beschreibung der **gewählten Sprache plus Englisch** sowie über deklarierte Dateitypen, Kategorie und Suite; Treffer in der eingestellten Sprache mit Begründung („gefunden über …"), offline und ohne unscharfe Suche
- globale aufklappbare Werkzeugnavigation auf jeder Route: Desktop-Drawer und mobiles Vollbreiten-Sheet mit Kategoriensicht, A–Z, lokaler Suche, Favoriten und zehn zuletzt verwendeten Werkzeugen; keine Telemetrie und kein Vorabladen optionaler Toolmodule
- Werkzeuge in ein eigenes Fenster auskoppelbar (`@pip-it-up/react`, MIT-Ausnahme nach ADR 0007/0008): der Rahmen sitzt zentral in der Werkzeugseite, das Werkzeug wandert als **eine** Instanz per Portal in das zweite Fenster und kommt unverändert zurück; der Knopf erscheint nur bei belegter Fähigkeit zur Laufzeit (Safari und mobil: kein Knopf); Zielgröße **gemessen** statt im Katalog deklariert, mit Größen-Hilfe im Fenster; Farbschema wird mitgeführt; belegt auf allen 41 Werkzeug-Routen (M0–M7, `05-uebergaben/2026-10-04-desktop-auskoppeln-m3-m5.md`); Grenzen und Regeln in `docs/ui-system.md`
- gemeinsamer, UI-unabhängiger PDF-Kern für Prüfung, Seitenbereiche und Seitenoperationen
- PDF.js-Vorschau und `pdf-lib`-Verarbeitung als getrennt nachgeladene, offline zwischengespeicherte Engines
- PDF-Warnungen für Formulare, XFA, Annotationen und Signaturen sowie klare Ablehnung verschlüsselter oder beschädigter Dateien
- PDF-Suite M1 mit Zusammenführen, Teilen/Extrahieren sowie Sortieren, Drehen, Duplizieren und Löschen von Seiten
- Bilder zu PDF: JPEG/PNG-Reihenfolge, A4/Letter/Bildgröße, Ausrichtung, Rand und Einpassen/Beschneiden
- PDF zu Bildern: freie Seitenauswahl, PNG/JPEG, 72–300 DPI, JPEG-Qualität, Hintergrundfarbe und sequenzielle Ausgabe
- gemeinsame PDF-Platzierungsengine mit neun Ankerpositionen, CropBox-Versatz und rotationsgerechter sichtbarer Platzierung
- PDF-Wasserzeichen: Unicode-Text, Seitenauswahl, Einzel-/Kachelmodus, Position, Farbe, Größe, Winkel, Deckkraft, Rand und Abstand
- PDF-Seitenzahlen: Unicode-Präfix/-Suffix, Seitenauswahl, unabhängiger Startwert, Format, Position, Größe, Farbe, Deckkraft und Rand
- PDF sichtbar unterschreiben: Zeichnen per Maus/Stift/Touch, Namenssignatur oder PNG/JPEG-Import; Seite, Position, Breite, Deckkraft, Drehung und optionale Datumszeile; klar von Zertifikatssignaturen abgegrenzt
- PDF-Formular ausfüllen: lokale AcroForm-Erkennung und Bearbeitung von Text, Checkboxen, Optionsgruppen und Auswahllisten, optionales dauerhaftes Einbetten sowie klare XFA-Grenze
- PDF kommentieren und markieren: echte Notiz-, Text-, Markierungs-, Form-, Linien- und per Maus/Stift/Touch gezeichnete Ink-Annotationen einschließlich Löschen
- MuPDF.js als nur auf M4-Routen nachgeladene Open-Source-Spezialengine; großes WASM-Modul im PDF-Laufzeitcache statt im PWA-Vorabcache
- PDF schützen und entsperren: AES-256, getrennte Öffnungs-/Besitzerpasswörter, verständliche Berechtigungen, falsches-Passwort-Schutz und rein lokale Verarbeitung
- PDF komprimieren: verlustfreie Strukturkompression sowie zwei klar gekennzeichnete optionale Bildstufen mit transparentem Größenvergleich
- eigenständiger PDF-Viewer mit Miniaturen, Seitennavigation, Zoom, Drehung und lokaler Volltextsuche
- PDF-Text & OCR mit Seitenauswahl, vorhandener Textebene, automatischem OCR-Fallback, Deutsch/Englisch/Spanisch, Fortschritt, Abbruch und TXT-Ausgabe; Tesseract.js und Sprachmodell werden erst nach ausdrücklicher Zustimmung geladen
- PDF mit Zertifikat signieren: lokale PAdES-B-B-Signatur mit PKCS#12/PFX und unmittelbar anschließender Eigenprüfung; Schlüssel und Passwort verlassen den Browser nicht
- PDF-Signaturen überprüfen: mathematische CMS-Prüfung, vollständige ByteRange-Abdeckung und Erkennung nachträglicher Änderungen; Vertrauensstatus wird ohne Trust Store ausdrücklich nicht behauptet
- PDF-Metadaten: Standard-Dokumentinfos und XMP-Eintrag lokal anzeigen und bereinigen, mit ausdrücklicher Grenze zur forensischen Anonymisierung
- PDF-Seiten beschneiden: CropBox ausgewählter Seiten mit validierten Rändern ändern; ausgeblendete Inhalte werden nicht als sicher gelöscht ausgegeben
- PDF reparieren und prüfen: Struktur mit QPDF normalisieren und das Ergebnis anschließend erneut auf Lesbarkeit und Seitenzahl prüfen
- PDF-Anhänge: eingebettete Dateien lokal auflisten, extrahieren, ergänzen und entfernen
- PDFs vergleichen: Seitenzahl, Seitengröße, Drehung und extrahierbaren Text seitenweise vergleichen
- PDF/A-Vorcheck: lokale Erkennung der PDF/A-Kennung, XMP, Ausgabeprofile, Verschlüsselung, JavaScript und eingebetteten Dateien; ausdrücklich keine Konformitätsaussage oder Konvertierung
- PDF sicher schwärzen: ausgewählte Rechtecke werden mit der offiziellen MuPDF-Redaktionsfunktion destruktiv entfernt, schwarz überdeckt und als neue Datei gespeichert
- `pdf_signer` 0.3.2 als vendorte und nur auf M7-Routen nachgeladene Rust-WASM-Engine; BER-Kompatibilität und revisionsübergreifende Signatursuche sind lokal gehärtet, Prüfsumme, Herkunft und GPL-3.0-or-later-Lizenz registriert
- QPDF 12.2.0 als getrennt nachgeladene Open-Source-WASM-Engine; Binärartefakt mit SHA-256, Upstream-Komponenten, festen Commits und vollständigen Lizenzen registriert
- datensparsame Ladegrenzen: Startseite und Fremdwerkzeuge laden keine PDF-Engine; PDF-Routen, Worker und WASM werden erst bei Nutzung übertragen und nicht vorab offline gespeichert
- automatische Startlastprüfung mit 200-KiB-Gzip-Warnschwelle; Größenüberschreitungen warnen, Architekturverstöße wie statisch erreichbare PDF- oder Rechen-Engines brechen den Prüflauf weiterhin ab
- Rechner (Suite „Rechnen", Welle 1): kuratierter mathjs-Rechenkern in eigenem dynamisch geladenen Chunk (94,3 KiB gzip), exakte Zahlenmodelle (`BigNumber` 64 Stellen, `Fraction`), Fehler als übersetzbare Codes, Verlauf als Ringpuffer, benannte Variablen, „Formel und Quelle"
- Rechner (Suite „Rechnen", Welle 2 abgenommen): vier Rechnerarten in der Oberfläche — Standard und Brüche als Zahlenmodell, wissenschaftlich mit Winkelmodus (Bogenmaß, Grad, Gon) und 32 Tasten, Programmierer mit Anzeige-Basis, Wortbreite 8/16/32/64 und Zweierkomplement samt Darstellungs-Karte, RPN mit Token-Eingabe, Stapeltasten, **live sichtbarem Stapel und Rechenweg** je Schritt; Funktionsliste mit Aufruftest je Funktion und belegter Fehlschlagprobe; Rechenkern 102.436 B gzip
- *Zusatz 2026-10-04: Die vier Rechnerarten stehen seit der Aufteilung (ADR 0009) nicht mehr in **einem** Werkzeug, sondern als **vier Werkzeuge** — Rechner, wissenschaftlicher Rechner, Programmiererrechner und RPN-Rechner — mit einem gemeinsamen Rahmen (`apps/web/src/tools/calculator-frame.tsx`), je einem eigenen Tastenfeld, je einem eigenen Verlauf und ohne Rechenart-Umschalter; der Rechenkern bleibt geteilt. Der Eintrag oben bleibt als Stand der Welle 2 stehen. Messwerte und Belege: `05-uebergaben/2026-10-04-rechner-vier-werkzeuge.md`.*
- Kaufmännisch (Suite „Rechnen", Welle 3): Prozent in drei Richtungen, Rabatt, Aufschlag, Marge **und** Aufschlag gemeinsam mit klarer Bezugsgröße, Umsatzsteuer raus und rein, Skonto, Dreisatz, Zinseszins und Tilgungsplan; rechnet ohne neue Abhängigkeit in `BigInt` cent-genau, Plan summiert sich exakt zum Darlehen; Formeln, Annahmen und Quellen in drei Sprachen
- Umrechnen (Suite „Rechnen", Welle 4): Einheiten in zwölf Größen, Winkel, Zahlensysteme 2–36 in `BigInt`, Zollbrüche und 18 Kalender; Umrechnungsfaktoren werden zur Laufzeit aus der Einheitenbibliothek **gemessen** statt abgeschrieben; Kalender vorwärts über `Intl`, Rückweg über `Temporal` mit `monthCode`
- Zeit und Datum (Suite „Rechnen", Welle 4): Datumsabstand, Verschieben über Monats- und Jahresgrenzen, Arbeitstage, Kalenderwoche nach ISO 8601, Fristen nach BGB §§ 187/188/193 und Zeitdauern für den Stundenzettel
- Gleichungslöser, Statistik und Funktionsplotter (Suite „Rechnen", Welle 5 abgenommen): lineare, quadratische und kubische Gleichungen mit sechsstufigem Lösungsweg (Normieren, Substitution, reduzierte Form, Diskriminante, Cardano-Fall, Probe) und Scheitelpunkt; Kennwerte mit Varianz und Standardabweichung **in beiden Bezugsarten**, Quartilen nach linearer Interpolation, Ausreißergrenzen, Regression mit Korrelation und Bestimmtheitsmaß; Plotter für mehrere Funktionen mit Wertetabelle und berechneten Nullstellen. **Keine neue Engine:** `function-plot` trägt wegen `BSL-1.0` einer mitgezogenen Abhängigkeit nicht (in der Lizenzpolitik nicht geprüft), deshalb ein eigener Zeichner, der SVG-Geometrie aus dem vorhandenen Rechenkern erzeugt; die gemessenen 3 Kurvenzüge für x²−4 und 1/x zeigen die Asttrennung an Polstellen, die Polstelle wird nicht als Nullstelle gemeldet
- `@js-temporal/polyfill` 0.5.1 als **nur nach Feature-Abfrage** nachgeladene Engine; eigener Chunk, vom Vorabcache ausgenommen und im Laufzeitcache (gemessen 154 kB roh)
- Geometrie (Suite „Rechnen", Welle 3): 16 Formen und Körper von Rechteck bis Kugel; jede Ergebniszeile zeigt ihre Formel im Klartext; Formeln und Annahmen in drei Sprachen, Werte gegen unabhängige Nachrechnung geprüft
- Aufmaß (Suite „Rechnen", Welle 6 abgenommen — **die Suite ist damit vollständig**): zwei getrennte Ebenen — Aufmaßzeile (Maßkette oder Formel → Menge) und Position (Menge × Einzelpreis → Betrag, Menge wahlweise aus einer Aufmaßzeile, dann bleibt der Rechenweg am Blatt). Abschnitte mit Zwischensummen, Mengensummen **je Einheit** und nie über Einheiten hinweg, Ausgabe als CSV, PDF oder Text (die PDF-Engine wird erst beim Auslösen geladen). Eigener Speicherbereich `aufmass.sheet.v1`, bewusst getrennt vom Rechner-Verlauf. **Keine neue Abhängigkeit:** eigener Vorrangparser in `BigInt` statt mathjs in der Fachlogik

- Rechner-Genauigkeitsampel (Suite „Rechnen"): Der Rechenkern gibt neben der 14-stelligen Anzeige den **vollen Wert** (64 Stellen) getrennt aus; daran entscheidet die Ampel in der Anzeigezeile, ob das Gezeigte der ganze Wert ist (grün `=`) oder gerundet wurde (rot `≈`). Die Erklärung öffnet per Zeigen, Ansteuern und Tippen und liegt unter 640 px als Blatt am unteren Rand. Kann das Bruch-Modell eine Rechnung nicht führen (Wurzeln, Winkelfunktionen), rechnet der Rechner **einmalig und sichtbar** im Dezimal-Modell; die Einstellung bleibt. Keine neue Abhängigkeit, keine neue Farbmarke (ADR 0006). Die Anzeigefläche hat eine **feste Höhe**, damit das Tastenfeld beim Rechnen nicht wandert; das Ergebnis steht gesetzt oben, die rohe Eingabezeile darunter
- Aufmaß (Suite „Rechnen", Welle 6 abgenommen — **die Suite ist damit vollständig**):

| Tool | ID | Suite | Ausführung | Dateien (deklariert) |
|---|---|---|---|---|
| Textstatistik | `text-statistics` | Text | lokal | keine (nur Information) |
| Groß-/Kleinschreibung | `case-converter` | Text | lokal | keine (nur Information) |
| JSON-Formatierer | `json-formatter` | Entwicklung | lokal | keine (nur Information) |
| QR-Code-Generator | `qr-code-generator` | Generatoren | lokal | Logo hinein (4 Typen), Bild heraus (4 Typen) |
| Bild-Metadaten | `image-metadata` | Bilder | lokal | 8 Typen hinein, 3 verlustfrei heraus |
| Bild skalieren | `image-resize` | Bilder | lokal | 3 Typen hinein und heraus |
| Icon-Generator | `icon-generator` | Bilder | lokal | PNG/JPEG/WebP hinein, PNG und ICO heraus |
| Wasserzeichen | `image-watermark` | Bilder | lokal | JPEG/PNG/WebP hinein und heraus; Logo als Nebenrolle |
| Farbwerkzeuge | `color-tools` | Bilder | lokal | JPEG/PNG/WebP hinein (nur Information) |
| PDFs zusammenführen | `pdf-merge` | PDF | lokal | PDF hinein und heraus |
| PDF teilen | `pdf-split` | PDF | lokal | PDF hinein und mehrere PDFs heraus |
| PDF-Seiten organisieren | `pdf-organize` | PDF | lokal | PDF hinein und heraus |
| Bilder zu PDF | `images-to-pdf` | PDF | lokal | JPEG/PNG hinein, PDF heraus |
| PDF zu Bildern | `pdf-to-images` | PDF | lokal | PDF hinein, PNG/JPEG heraus |
| PDF-Wasserzeichen | `pdf-watermark` | PDF | lokal | PDF hinein und heraus |
| PDF-Seitenzahlen | `pdf-page-numbers` | PDF | lokal | PDF hinein und heraus |
| PDF sichtbar unterschreiben | `pdf-visible-signature` | PDF | lokal | PDF sowie PNG/JPEG-Unterschrift hinein, PDF heraus |
| PDF-Formular ausfüllen | `pdf-form-fill` | PDF | lokal | PDF hinein und heraus |
| PDF kommentieren und markieren | `pdf-annotate` | PDF | lokal | PDF hinein und heraus |
| PDF schützen und entsperren | `pdf-security` | PDF | lokal | PDF hinein und heraus |
| PDF komprimieren | `pdf-compress` | PDF | lokal | PDF hinein und heraus |
| PDF-Viewer | `pdf-viewer` | PDF | lokal | PDF hinein (nur Information) |
| PDF-Text & OCR | `pdf-text-ocr` | PDF | lokal | PDF hinein, Text heraus |
| PDF mit Zertifikat signieren | `pdf-certificate-sign` | PDF | lokal | PDF und PKCS#12/PFX hinein, PDF heraus |
| PDF-Signaturen überprüfen | `pdf-signature-verify` | PDF | lokal | PDF hinein (nur Information) |
| PDF-Metadaten | `pdf-metadata` | PDF | lokal | PDF hinein und heraus |
| PDF-Seiten beschneiden | `pdf-crop` | PDF | lokal | PDF hinein und heraus |
| PDF reparieren und prüfen | `pdf-repair` | PDF | lokal | PDF hinein und heraus |
| PDF-Anhänge | `pdf-attachments` | PDF | lokal | PDF und Anhänge hinein, PDF und Anhänge heraus |
| PDFs vergleichen | `pdf-compare` | PDF | lokal | zwei PDFs hinein (nur Information) |
| PDF/A-Vorcheck | `pdf-a-preflight` | PDF | lokal | PDF hinein (nur Information) |
| PDF sicher schwärzen | `pdf-redact` | PDF | lokal | PDF hinein und heraus |
| Rechner | `calculator` | Rechnen | lokal | keine (nur Information) |
| Kaufmännisch | `commercial` | Rechnen | lokal | keine (nur Information) |
| Geometrie | `geometry` | Rechnen | lokal | keine (nur Information) |
| Umrechnen | `convert` | Rechnen | lokal | keine (nur Information) |
| Funktionsplotter | `plotter` | Rechnen | lokal | keine (nur Information) |
| Statistik | `statistics` | Rechnen | lokal | keine (nur Information) |
| Gleichungslöser | `equations` | Rechnen | lokal | keine (nur Information) |
| Zeit und Datum | `datetime` | Rechnen | lokal | keine (nur Information) |
| Aufmaß | `aufmass` | Rechnen | lokal | CSV, PDF und Text heraus |
| Beton, Mörtel und Estrich | `concrete` | Handwerk | lokal | keine (nur Information) |
| Dach | `roof` | Handwerk | lokal | keine (nur Information) |
| Metallgewicht | `metal-weight` | Handwerk | lokal | keine (nur Information) |
| Holzfeuchte und Holzgewicht | `wood` | Handwerk | lokal | keine (nur Information) |
| Fliesen, Kleber und Fugenmörtel | `tiles` | Handwerk | lokal | keine (nur Information) |
| Farbe, Tapeten und Beschichtung | `paint` | Handwerk | lokal | keine (nur Information) |
| Trockenbau | `drywall` | Handwerk | lokal | keine (nur Information) |
| Parkett, Laminat und Bodenbelag | `flooring` | Handwerk | lokal | keine (nur Information) |
| Pflaster und Erdarbeiten | `paving` | Handwerk | lokal | keine (nur Information) |
| Reifen und Drehmoment | `tires` | Handwerk | lokal | keine (nur Information) |
| Prüffristen | `inspection` | Handwerk | lokal | CSV heraus |
| Baustellenfoto-Beschrifter | `photo-caption` | Bild | lokal | Bilder + PDF heraus |
| Abnahme- und Mängelprotokoll | `handover-report` | Handwerk | lokal | PDF heraus |

## Derzeitige Suiten

- Text
- Entwicklung
- Generatoren
- Bilder (Bild-Metadaten, Bild skalieren, Icon-Generator, Wasserzeichen, Farbwerkzeuge)
- Rechnen (Rechner, Umrechnen, Kaufmännisch, Zeit und Datum, Funktionsplotter, Statistik, Gleichungslöser, Geometrie, Aufmaß)
- Handwerk (Beton/Mörtel/Estrich, Dach, Metallgewicht, Holzfeuchte und Holzgewicht) — Welle A der Handwerkerwerkzeuge, abgenommen am 2026-10-04
  *Zusatz 2026-10-05: um die Welle B erweitert — Fliesen/Kleber/Fugenmörtel, Farbe/Tapeten/Beschichtung, Trockenbau, Parkett/Laminat/Bodenbelag. Die Suite umfasst damit **acht Werkzeuge**.*
  *Zusatz 2026-10-05 (Welle C): um die beiden letzten Werkzeuge der Klasse a erweitert — Pflaster/Erdarbeiten und Reifen/Drehmoment. Die Suite umfasst damit **zehn Werkzeuge** und ist nach dem Konzept vollständig.*
  *Zusatz 2026-10-06 (Welle D, erstes Werkzeug): **Prüffristen** (`inspection`) ergänzt die Suite um die Verwaltung wiederkehrender Prüfungen — nächster Termin aus letzter Prüfung plus Intervall (Monatsarithmetik über Temporal), Resttage, Einordnung in überfällig/bald fällig/in Ordnung und Export als Tabelle. **Keine vorgeschlagenen Intervalle:** Prüffristen stammen aus der Gefährdungsbeurteilung des Betreibers; das Werkzeug rechnet nur, was eingegeben wird, und sagt die Grenze („ohne Server keine Erinnerung") sichtbar. Die Suite umfasst damit **elf Werkzeuge**. Noch offen aus Welle D: Foto-Beschrifter und Protokoll.*
  *Zusatz 2026-10-06 (Welle D, zweites und drittes Werkzeug — **Welle D damit vollständig**): **Abnahme- und Mängelprotokoll** (`handover-report`) als zwölftes Werkzeug — Kopfdaten, Mängelzeilen mit Frist, Fotos, zwei Unterschriften, PDF-Ausgabe; Gewährleistungsfristen werden aus dem Abnahmedatum **gerechnet** (fünf und vier Jahre, BGB § 634a Abs. 1 Nr. 2 / VOB/B § 13 Abs. 4 Nr. 2) und sichtbar als Rechtsanwendung statt Rechtsberatung gekennzeichnet. Die Unterschriften-Zeichenfläche liegt jetzt als **ein** gemeinsamer Baustein (`tools/SignaturePad.tsx`) und wird auch vom Werkzeug „sichtbar unterschreiben" benutzt; die zweite Fassung ist dort entfernt. Außerhalb der Suite, in der Bildgruppe: **Baustellenfoto-Beschrifter** (`photo-caption`) — Aufnahmezeit aus den Bilddaten (eigener Exif-Leser, niemals erfunden), Notiz, Pfeil auf die entscheidende Stelle, je Foto eine Datei und ein Sammel-PDF. Die Speichergrenze wurde im Browser **gemessen**: 60 Fotos mit 12 Megapixeln und 24 Fotos mit 48 Megapixeln liefen fehlerfrei durch (Zuwachs unter 0,7 GB, Arbeitsmenge des Browsers); eine Bruchgrenze war nicht zu finden, die Obergrenze von 60 Fotos ist daher eine bewusste Schranke und keine gemessene Grenze. Register damit **57 Werkzeuge**, **497 Tests in 34 Dateien**. Beide Protokolle: `06-protokolle/2026-10-06-welle-d-02-und-03.md`, Werkzeug 23 in `…-01-prueffristen.md`.*
- PDF (Viewer, Text/OCR, Zertifikatssignaturen prüfen und erstellen, Zusammenführen, Teilen, Seiten organisieren, Bilder zu PDF, PDF zu Bildern, Wasserzeichen, Seitenzahlen, sichtbar unterschreiben, Formular ausfüllen, kommentieren und markieren, schützen/entsperren, komprimieren, Metadaten, Beschneiden, Reparatur, Anhänge, Vergleich, PDF/A-Vorcheck und sichere Schwärzung)

## Qualität und Compliance

- Projekt und interne Pakete: `AGPL-3.0-only`
- Lizenzübersicht in der Webanwendung: `/licenses`
- erfasste externe Pakete: 524
- vollständige Lizenztexte: 16
- bewahrte originale Paketdokumente: 189
- eingebettete Binärartefakte: 2 registrierte WASM-Artefakte (QPDF und PDF Signer)
- letzter bekannter Teststand: 381 Webtests in 23 Dateien bestanden (`npm run check`, gemessen 2026-10-05); Rust-Tests in diesem Lauf nicht neu gemessen — der zuletzt bekannte Stand bleibt 50
  *Zusatz 2026-10-05 (Welle B): **426 Webtests in 28 Dateien** bestanden (`npm run check`); Rust-Tests unverändert nicht neu gemessen.*
  *Zusatz 2026-10-05 (Welle C): **440 Webtests in 30 Dateien** bestanden (`npm run check`), `lint` und `build` grün; Rust-Tests unverändert nicht neu gemessen.*
- Werkzeugregister: 48 Werkzeuge, 3 Sprachen, 48 Symbole, 3.164 Suchbegriffe, 92 deklarierte Dateitypen (`npm run catalog:generate`, gemessen 2026-10-05); Spanisch wird als noch gegenzulesendes Testpaket mitausgeliefert
  *Zusatz 2026-10-05 (Welle B): **52 Werkzeuge, 52 Symbole, 3.464 Suchbegriffe**, 92 Dateitypen (`npm run catalog:generate`); Startlast 146.867 B gzip von 204.800. Die Summenschwelle der Werkzeugtexte wird seit ADR 0011 je Paket gemessen (850 B × 53 Pakete); Deutsch liegt bei 41.309 B, Englisch 37.278 B, Spanisch 40.626 B, Last je Route unverändert 5.199 B von 30.720.*
  *Zusatz 2026-10-05 (Welle C): **54 Werkzeuge, 54 Symbole, 3.636 Suchbegriffe**, 92 Dateitypen; Startlast **146.993 B gzip** von 204.800. Textsumme je Paket (850 B × 55 Pakete = 46.750 B): Deutsch 44.366, Englisch 40.121, Spanisch 43.627; Last je Route unverändert 5.199 B (de) / 4.685 B (en) / 5.207 B (es) von 30.720.*
- Sprachpakete: **Werkzeugtexte liegen je Werkzeug und je Sprache** und werden erst auf dessen
  Route geholt (2026-10-05, ADR 0010); die Startseite lädt nur Oberflächentexte und das Suchpaket.
  Titel, Beschreibung, Kurztext und Suchbegriffe stehen **nur** im Suchpaket — Karten, Schublade,
  Suiten-Seite **und die Werkzeugkopfzeile** lesen sie von dort. Je Sprache ein gemeinsames Paket
  (`common.ts`, Rahmen- und Bereichstexte) plus ein Paket je Werkzeug; die Verweiskarte liegt in
  einer eigenen Datei außerhalb des Startbündels. Netzbeleg mit frischem Profil: Startseite
  171.986 B gzip in 7 Dateien **ohne** Werkzeugtexte, Rechnerroute mit `tools-de-common` +
  `tools-de-calculator` und ohne fremdes Werkzeug (`07-pruefung/hebel2/beleg.txt`)
- Produktions-Build: bestanden. **Veröffentlicht** (Sammelrelease, ohne Auskoppeln): 136.967 Byte
  Startcode komprimiert. **Aktueller Arbeitsstand** (mit Auskoppeln, Welle A der
  Handwerkerwerkzeuge, vier Rechnern und der Sprachpaket-Aufteilung, noch nicht gepusht):
  **146.408 Byte** von 204.800 (Reserve rund 58 kB), gemessen 2026-10-05. Sprachgetrennte Such- und
  Werkzeugtextpakete mit verzögertem Laden, ohne statisch erreichbare PDF- oder Rechen-Engine;
  PDF-/OCR-/Signaturrouten, Worker und WASM sind vom Vorab-Cache ausgeschlossen; nachgeladener
  Rechenkern 103.708 Byte gzip, Katalogbasis 1.212 Byte. Werkzeugtexte je Route (gemeinsames Paket
  plus größtes Werkzeugpaket): Deutsch 5.199, Englisch 4.685, Spanisch 5.207 Byte — **unter der
  Warnschwelle von 30.720 Byte**; die Summe aller 49 Pakete je Sprache (Deutsch 35.102 Byte) wird
  getrennt gegen 40.960 Byte geprüft, weil jede Datei einen eigenen gzip-Kopf trägt (gemessen
  2026-10-05)

Zahlen sind Momentaufnahmen. Nach Abhängigkeits-, Test- oder Tooländerungen müssen sie anhand der tatsächlichen Ausgabe aktualisiert werden.

## Noch nicht umgesetzt

- Backend, Konten und Synchronisierung
- Desktop- und Mobile-Shells (das Auskoppeln in ein eigenes Fenster ist der erste Teil davon und
  lokal fertig; die übrige Shell-Frage bleibt offen)
- sichtbarer Source-Link in der Weboberfläche
- umfassende automatisierte Barrierefreiheitstests
- **nicht belegt:** Firefox-Verhalten des Auskoppelns (geckodriver fehlt) und Überbreiten-Freiheit
  bei 1920/1366/1024/768 px — geprüft ist bisher nur 320 px durch `npm run viewport:check`

## Nachtrag 2026-10-08 — MS0 / unabhängige Nachprüfung (Codex)

Die bisherigen Sanierungshäkchen beschreiben die erste Runde. Der aktuelle fachliche Stand ist
**33 B / 16 R / 9 F / 1 O** über 59 Karten, also **26 offen**; keine neue Veröffentlichung
aus der Nachprüfung ableiten. Maßgebliche Fortschrittsübersicht bleibt der datierte Nachtrag in
`00-einstieg/vorgehen-qm-audit.md`.

Thomas hat mit „Ms0 go“ die lokale Umfangs-/Belegarbeit beauftragt. Unter
`07-pruefung/fertigstellung/2026-10-08-ms0/` sind alle Originalabnahmen und Abgrenzungen,
Nachprüfungsgrenzen und D/E-Kriterien gesammelt; 23 Textquellen sind mit Hash eingefroren.
Die neun F-Karten sind wieder geöffnet. Keine Produktreparatur oder neue Freigabe in MS0.
Prüfrollen und Milestone-Fenster sind geplant; tatsächliche Personen-/Geräte-/Zugangsbuchungen
bleiben offen (OP-066). Fortsetzung MS1–MS7 ist als OP-065 geführt.

Die frühere Aussage „Handwerk A–D ohne schriftliches Kriterium“ wird für D eingegrenzt:
`06-protokolle/2026-10-06-welle-d-plan.md` enthält vor dem Bau festgelegte Kriterien.
Die aktuellen Kennungen lauten `inspection`, `photo-caption`, `handover-report`; die fünf
E-Werkzeuge sind `threads`, `lighting`, `heatload`, `pipes`, `cable`.

Beleg: neue MS0-Sitzungsübergabe und `node scripts/belege/fertigstellung-basis.mjs`.
MS0 ist wegen offener externer Reservierung organisatorisch noch nicht vollständig abgenommen.

## Nachtrag 2026-10-08 — MS1–MS7 umgesetzt, Abnahmen getrennt geführt

Die Fortsetzung ist ausdrücklich vollständig beauftragt, einschließlich Pauschalfreigabe und
Vollzugriff. Lokale Lizenz-, Async-/URL-, Sprach-, Menü-, Offline-/OCR-, QPDF-/Signatur- und
Workflow-Reparaturen sind ausgeführt. Root-Check/Bau, echte Browserwirkungen, Gegenproben,
65-Routen-Grundmatrix und frischer Clone mit bytegleichem Signatur-WASM wurden geprüft.
Details und konkrete Grenzen: [Belegpaket](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/README.md).

Die bisherige Aussage „keine Produktreparatur“ beschreibt ausschließlich MS0. Heute besteht
ein prüfbarer lokaler Kandidat. Keine unabhängige A2, Konto-/Geräte-/Fachabnahme oder neue
Veröffentlichung behauptet. Öffentliche Header gehören noch zum vorherigen Stand; dessen CSP
erlaubt das lokale WASM/OCR-Verhalten nicht. Fortschritt und alle 26 Restverträge stehen im
datieren Leitfadennachtrag; er bleibt die einzige laufende Kartenübersicht.

## Nachtrag 2026-10-08 — tatsächliche Abschlusskontrolle und Audit-Vorschau

Die vorstehende Aussage „Keine unabhängige A2, Konto-/Geräte-/Fachabnahme oder neue
Veröffentlichung behauptet“ beschreibt den Stand vor Thomas' ausdrücklicher Benennung von Codex
als Prüfer. Die Abschlusskontrolle ist ausgeführt und dokumentiert, einschließlich eigener
Reparaturbeteiligung, Sicherheitsbewertung, Gegenproben und unabhängiger PDF-Leser. Weitere
technische Fragen beantwortet Codex selbst; die umfassende Auftragsfreigabe bleibt gültig.
Beleg: [Abschlussprüfung](../07-pruefung/fertigstellung/2026-10-08-ms1-ms7/abschlusspruefung.md).

GitHub-Adminzugang und main-Schutz durch Releasepflicht funktionieren; tatsächliche Ubuntu-/Windows-
Pflichtläufe und eine absichtlich rote Hash-Gegenprobe wurden ausgeführt. Der Audit-Zweig hat
automatische Cloudflare-Vorschauen: neue öffentliche CSP, Signatur-WASM und eng/deu/spa-OCR
bestehen dort. 696 öffentliche Dist-Dateien der ersten Vorschau sind bytegleich zum tatsächlichen
CI-Artefakt; Hosting-Steuerdateien werden separat erfasst. Kein main-Merge/Produktionspush.
Entwurf: [PR #1](https://github.com/madventureXD/commietools/pull/1).

Zusätzliche tatsächliche Prüfungen: alle drei Offline-UI-Sprachen, vier vollständige Sprach-Root-
Mutanten, Schwärzungs-/Viewer-Tastatur, Fremdfoto-EXIF/Pixel/PDF-Reihenfolge, zwei Protokoll-
Zeigerunterschriften, sechs visuell gerenderte PDF-Seiten und große Fotostapel 60×12 MP/24×48 MP.
Repariert: Unterschrift-PNG-Rennen, falsche VOB/B-Fundstelle (jetzt §13 Abs.4 Nr.1), kumulative
60-Foto-Grenze und 39-px-Navigationsknopf auf fremdem Windows. Quellidentität berücksichtigt
plattformabhängige Text-Zeilenenden; Binärbytes bleiben exakt gebunden.

21 erfolgreiche lokale Stufen stehen im neuen portablen Endbeleg. Letzter ergänzender Root-Lauf:
730 Vitest-Tests/54 Dateien und vier Node-Tests, 113 Lint-Warnungen/0 Fehler, Build Exit 0 mit
150300 B gzip Einstieg. Warnschwellen wurden nicht erhöht. Tatsächliche CI-Schlussergebnisse werden
separat geführt. Native Dateidialoge, echte Vorleseransagen/Browserzoom/physischer Touch und noch
unbestätigte originale Betriebsbedingungen bleiben offen. Windows-Bedienzugriff scheitert auch
nach erneuter Vollzugriffsfreigabe mit 0x80070005; kein erfundenes Gesamt-PASS.
