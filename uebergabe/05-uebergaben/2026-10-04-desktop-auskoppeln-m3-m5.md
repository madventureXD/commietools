# Übergabe: Desktop-Auskoppeln — M3 (ein Werkzeug) und M5 (Nachweis bei allen)

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Team 2)
**Auftrag:** M3 „Ein Werkzeug ausgekoppelt, vollständig" und M5 „Ausrollen bzw. Nachweis bei allen
Werkzeugen" des Vorhabens „Desktop-Erfahrung: Werkzeuge auskoppeln" (Go von Thomas am 2026-10-04).
**Status:** abgeschlossen mit zwei ausdrücklich benannten Lücken

## Ziel der Sitzung

Ein Werkzeug soll sich in ein eigenes, schwebendes Fenster auskoppeln lassen, das auf die vom
Werkzeug gebrauchte Größe zugeschnitten ist und auf Wunsch über allen anderen liegt — mit **einer**
Instanz (kein zweiter Rechenlauf), sauberer Rückkehr und ohne Zusage, die die Plattform nicht
hergibt.

## Ergebnis

**Das Auskoppeln funktioniert und ist bei allen 41 Werkzeugen belegt.**

- Der Auskoppel-Rahmen sitzt **zentral in `ToolPage`**; damit haben alle Werkzeuge die Fähigkeit
  ohne Einzelumbau.
- **Instanz-Nachweis:** Nach dem Auskoppeln steht im zweiten Fenster derselbe Zustand — belegt mit
  einem eingetippten Text und den berechneten Zahlen (`["49","7","1"]`), die **beide Richtungen**
  überleben. Der Inhalt wird per Portal bewegt, nicht neu eingehängt.
- **Rückkehr-Nachweis:** Beim Zurückholen ist der Inhalt unverändert vorhanden; der Knopf wechselt
  die Beschriftung („In eigenes Fenster auskoppeln" ⇄ „Zurück ins Hauptfenster").
- **Größen-Hilfe:** Nach dem Öffnen wird verglichen, ob die Fenstergröße der Werkzeuggröße
  entspricht. Nur bei Abweichung erscheint im ausgekoppelten Fenster der Knopf „Auf Werkzeuggröße
  setzen". Gemessen: 1344×858 → **1150×393**, exakt die Werkzeuggröße; der Hinweis verschwindet
  danach von selbst. Die Zielgröße wird **gemessen, nicht deklariert**.
- **Ehrlichkeits-Nachweis:** Ohne brauchbare Schnittstelle erscheint **kein** Knopf (gemessen:
  `false`), mit Schnittstelle `true`.
- **Farbschema wird mitgeführt:** Vor dem Umschalten `dark` mit weißem Text, nach dem Umschalten
  `light` mit schwarzem Text — im zweiten Fenster nachgeführt.
- **Alltagstauglichkeit:** Alle **41 Werkzeug-Routen** durchlaufen dieselbe Kette
  (Knopf → Fenster → Inhalt drüben → Platzhalter → Rückkehr) mit dem Ergebnis **41 von 41 OK**,
  ohne Abweichung, über alle sechs Kategorien.
- **Kosten der Bibliothek, gemessen:** Startbündel **145.559 B gzip** von 204.800 (Reserve ~59 kB);
  die Aufnahme kostet **+8,6 kB gzip** gegenüber dem Stand vor dem Umbau.

**Zwei Fehler wurden durch die Nachweise gefunden und behoben** (sie wären sonst ausgeliefert
worden):

1. Der Knopf erschien **ohne brauchbare Schnittstelle** — Verstoß gegen die Entscheidung „nichts
   anbieten, was nicht gilt". Ursache: `renderUnsupported` wirkt nicht bei einem ferngesteuerten
   Trigger, und `useIsPipSupported()` der Bibliothek prüft nur, ob das Feld existiert.
2. **Das Farbschema ging im zweiten Fenster verloren.** Die Farbvariablen hängen am `.app`-Element
   (`packages/ui/src/tokens.css`: `:root` + `[data-theme='dark']`), das im Hauptfenster bleibt. Der
   ausgekoppelte Inhalt lief mit falschen Farben. `copyStyles: 'sync'` kopiert Stylesheets, keine
   Attribute.

## Geänderte Bereiche

- `apps/web/src/App.tsx` — Auskoppel-Rahmen in `ToolPage`: `PipWrapper`/`PipTrigger`, gemessene
  Zielgröße, Größen-Vergleich und -Hilfe, Fähigkeitsprüfung, Farbschema-Spiegelung, Theme-Nachführung
- `apps/web/src/styles.css` — `.tool-shell-bar`, `.detach`, `.pip-placeholder`, `.pip-fit`
- `packages/i18n/src/common/de.ts`, `en.ts`, `es.ts` — je vier Textschlüssel (`tool.detach`,
  `.return`, `.placeholder`, `.placeholderHint`, `.fit`, `.fitHint`)
- `uebergabe/03-konzepte/2026-10-04-desktop-auskoppeln.md` — M4 als ersetzt vermerkt, Entscheidung 5
  (Knopf bei jedem Werkzeug) aufgenommen
- `uebergabe/05-uebergaben/2026-10-04-desktop-auskoppeln-m0.md`, `…-m2.md` — in dieser Sitzung
  angelegt

## Entscheidungen und Annahmen

- **Der Auskoppel-Knopf bleibt bei jedem Werkzeug** (Thomas, 2026-10-04). Keine Auswahl „geeigneter"
  Werkzeuge: Der Rahmen ist zentral, es gibt keinen Sonderfall je Werkzeug, und eine Auswahl bräuchte
  eine gepflegte Liste mit Begründung je Werkzeug — Aufwand ohne belegten Nutzen.
- **M4 entfällt in der geplanten Form und ist ersetzt.** Eine Wunschgröße im Manifest hätte keine
  Wirkung, weil Chromium die Größenangabe ignoriert. An ihre Stelle tritt die gemessene Werkzeuggröße
  und die Größen-Hilfe im Fenster. **Damit entfällt der Katalogumbau** (kein Manifestfeld, keine
  Änderung an `catalog-generate.mjs` oder `catalog:check`).
- **Keine Browser-Erkennung.** Statt „welcher Browser" wird geprüft, ob die Größe angekommen ist —
  eine Fähigkeitsprüfung zur Laufzeit, die von selbst verschwindet, wenn ein Browser das Verhalten
  korrigiert. Der Knopf steht nur dort, wo er etwas bewirkt.
- **Grenzen, die nicht zugesagt werden:** Die Fenstergröße lässt sich beim Öffnen nicht
  vorschreiben (Chromium ignoriert sie), die Position nicht setzen, `resizeTo` nur mit einer
  Nutzergeste **im** Fenster, ein Fenster je Tab, und es lebt nie länger als das Herkunftsfenster.
- **Annahme (gekennzeichnet):** Firefox übernimmt die Wunschgröße laut Quellcode
  (`DocumentPictureInPicture.cpp`: `size = CSSIntSize(aRequestedWidth, aRequestedHeight)`, geklemmt
  auf ein Minimum und 80 % des Bildschirms). **Gemessen ist das nicht.**

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **grün** — 524 Pakete, Katalog 41 Werkzeuge / 3 Sprachen, 339 Tests in 18 Dateien |
| `npm run build` | **grün**, inklusive `bundle:check` |
| `npm run viewport:check` | **grün** — 41 Werkzeug-Routen bei 320 px ohne Überbreite |
| `git diff --check` | sauber |
| Instanz-Nachweis (Zustand überlebt das Auskoppeln) | **bestanden** |
| Rückkehr-Nachweis (Inhalt und Zustand zurück) | **bestanden** |
| Ehrlichkeits-Nachweis (kein Knopf ohne Fähigkeit) | **bestanden** — nach behobenem Fehler |
| Hell/Dunkel im zweiten Fenster | **bestanden** — nach behobenem Fehler |
| Zugänglichkeit (Tastatur, Name, Mindestgröße) | **bestanden** — fokussierbar, Name „In eigenes Fenster auskoppeln", Höhe 44 px, in der Tab-Reihenfolge |
| Größen-Hilfe trifft die Werkzeuggröße | **bestanden** — 1150×393 exakt, Hinweis danach weg |
| Prüfung aller Werkzeug-Routen | **41 von 41 OK** |
| Firefox-Verhalten | **nicht gemessen** — der Zugang (WebDriver BiDi) kam nicht hoch; zwei Argumentformen versucht, danach aufgeräumt |
| Desktop-Breiten 1920/1366/1024/768 | **nicht geprüft** — `viewport:check` deckt nur 320 px ab |
| `npm run lint` | **nicht ausgeführt** — kein Workspace-Skript vorhanden |

**Nicht erfüllte Abnahmekriterien, ausdrücklich benannt:**
Punkt 3 des Kriteriums verlangt Überbreiten-Freiheit bei 1920/1366/1024/768 px über Startseite,
Katalog, Suche und je ein Werkzeug pro Kategorie. Nachgewiesen ist nur die schmale Breite (320 px)
durch das vorhandene Werkzeug — die geforderten Desktop-Breiten sind **offen**.
Punkt 5 (Ehrlichkeit) ist erfüllt, aber erst nach einem behobenen Fehler.

## Offene Punkte und Risiken

- [ ] **Firefox ist nicht gemessen.** Offen, ob der Knopf dort erscheint (erwartet: nein, weil die
      Größe ankommt). Zugang über WebDriver BiDi gescheitert; `geckodriver` ist auf dem Rechner
      nicht installiert.
- [ ] **Desktop-Breiten nicht geprüft** (siehe oben).
- [ ] **`docs/ui-system.md` ist nicht fortgeschrieben.** Das Auskoppeln ist ein zusätzlicher Rahmen
      neben dem Vier-Schritt-Fluss und gehört dort hinein (M7).
- [ ] **Die Bibliothek ist „public beta" (0.2.0) mit Einzelentwickler** — Rückversicherung ist die
      MIT-Lizenz (ADR 0007).
- [ ] **Der Ausnahmeweg in `licenses/overrides.json` hat jetzt zwei Einträge** (core und react) und
      ist damit erprobt; weitere Kandidaten ohne Lizenzfeld bleiben einzeln beschluss- und ADR-pflichtig.
- [ ] **Elf ältere Übergaben verfehlen die Vorlage** (Pflichtabschnitte fehlen) — gemeldet am
      2026-10-04, nicht angefasst, eigener Auftrag.
- [ ] **Nur Chromium ist belegt.** Ob Firefox oder eine künftige Chromium-Fassung die Größe anders
      behandelt, ändert das Verhalten des Knopfes — die Laufzeitprüfung fängt das ab, ohne Codeänderung.

## Empfohlener nächster Schritt

1. **M7 — Dokumentation und Übergabe:** `docs/ui-system.md` um das Auskoppeln fortschreiben,
   `01-stand/aktueller-stand.md` und `01-stand/offene-punkte.md` pflegen.
2. Danach die zwei Lücken schließen: Firefox (geckodriver) und die Desktop-Breiten.
3. **Veröffentlichen erst auf ausdrücklichen Auftrag** — ein Push auf `main` löst das
   Cloudflare-Pages-Deployment aus.

## Git

- Commits dieser Sitzung (10, ältester zuletzt), HEAD `467b45c`:
  `789faef` (M0-Übergabe) · `3b1eeea` (M1-Konzept) · `d1c3588` (M1-Entscheidungen, ADR 0007) ·
  `6395ab0` (M2 Aufnahme core, ADR 0008) · `4c9b497` (M2-Übergabe) ·
  `ef13f81` (React-Bindungen) · `fa77f83` (Auskoppeln) · `ba0647e` (Größen-Hilfe) ·
  `73847de` (Ehrlichkeit + Farbschema) · `467b45c` (Knopf bei jedem Werkzeug, M4 ersetzt)
- Startpunkt der Sitzung: `1c74d29`
- Arbeitsbaum: sauber bis auf `LICENSE`/`COPYRIGHT`, die git als geändert meldet, obwohl der Inhalt
  identisch ist — ein Artefakt von `core.autocrlf=true` (`git diff --quiet` ist leer)
- **Nicht gepusht** — alle 10 Commits liegen lokal
