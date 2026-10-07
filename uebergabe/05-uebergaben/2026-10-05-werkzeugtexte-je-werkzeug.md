# Übergabe 2026-10-05: Werkzeugtexte je Werkzeug

> **Strukturnachtrag 2026-10-05, Faber:** Diese Übergabe wurde zuerst ohne die Pflichtabschnitte der
> Vorlage geschrieben (nur „Auftrag", „Ergebnis in einem Satz", „Was gebaut wurde", „Belege",
> „Offen"). Die Prüfung gegen `uebergabe/vorlagen/uebergabe.md` deckte das auf. Die Abschnitte sind
> hier ergänzt; der Inhalt der ursprünglichen Abschnitte ist **unverändert** übernommen.

## Ziel der Sitzung

„2 go" — Hebel 2 aus der Sprachpaket-Reihe umsetzen: die Werkzeugtexte nicht mehr je Sprache über
alle 48 Werkzeuge, sondern je Werkzeug. Vorab war die Funktion „genauestens zu prüfen".

## Ergebnis

Eine Werkzeugroute lädt nur noch die Texte ihres Werkzeugs plus ein kleines gemeinsames Paket —
**6.813 statt 52.333 B gzip** im Rechnerbeispiel (deutsch + englisch), bei **unverändertem
Startbündel** von 146.408 B gzip. Dazu zwei aufgedeckte und behobene Fehler (siehe „Prüfungen").

## Geänderte Bereiche

1. **Erzeuger** (`scripts/catalog-generate.mjs`): schreibt je Sprache ein gemeinsames Paket
   (`messages/<sprache>/common.ts`) und ein Paket je Werkzeug
   (`messages/<sprache>/<werkzeug>.ts`). Die Zuordnung Schlüssel → Werkzeug geschieht über den
   längsten passenden Schlüsselpräfix (abgeleitet aus `titleKey`); alles ohne Werkzeugpräfix landet
   im gemeinsamen Paket. Titel, Beschreibung, Kurztext und Suchbegriffe bleiben ausschließlich im
   Suchpaket. Veraltete Paketdateien werden beim Erzeugen entfernt, und `check` meldet sie.
2. **Lader** (`packages/tools/src/catalog/generated/textLoaders.ts`, eigener Chunk):
   `loadCommonToolTexts`, `loadToolTexts`, `loadAllToolTexts` (letzteres für Prüfungen). Eigene
   Datei, damit die Verweiskarte über 147 Module nicht im Startbündel liegt. Der Paketzeiger
   (`packages/tools/src/index.ts`) führt sie **nicht**; eigener Einstieg `./text-loaders` in
   `packages/tools/package.json`.
3. **Oberfläche** (`apps/web/src/App.tsx`): Die Werkzeugroute holt die Textlader per
   `import('@commietools/tools/text-loaders')` und lädt die Texte ihres Werkzeugs. Die Kopfzeile
   nimmt Titel und Beschreibung aus dem Suchpaket (`apps/web/src/tool-texts.ts`). Die Bereitschaft
   hängt jetzt an **Sprache und Werkzeug** (`toolTextsTool`), damit beim Werkzeugwechsel keine
   fremden Texte aufblitzen. Alle Haken von `ToolPage` stehen vor dem Ladehinweis-Rückgabewert.
4. **Bündelprüfung** (`scripts/bundle-audit.mjs`): Werkzeugtexte werden je Sprache summiert; geprüft
   wird zusätzlich die Last **je Route** (gemeinsames Paket + größtes Werkzeugpaket). Der
   Referenzstand (`scripts/bundle-size-baseline.json`) ist auf den neuen Stand gezogen.
5. **Chunk-Benennung** (`apps/web/vite.config.ts`): `tools-<sprache>-<werkzeug>`.
6. **Prüfungen**: Der Sammellader wird aus dem eigenen Einstieg geholt; die Rechner- und
   Katalogprüfungen sind auf die neue Struktur nachgeführt — die Rechnerprüfung prüft jetzt am
   Paket selbst, dass kein fremdes Werkzeug darin liegt.
7. Belege unter `uebergabe/07-pruefung/hebel2/` und `…/sprachpaket/`.

## Entscheidungen und Annahmen

- **Gemeinsames Paket je Sprache** statt je Bereich: die Zuordnung Werkzeug → Bereich wäre über
  Namensmuster geraten. Preis: rund 3,3 kB gzip auf jeder Werkzeugroute.
- **Textlader in eigener Datei** statt im Paketzeiger — sonst zahlt die Startseite 2,6 kB gzip für
  etwas, das sie nie braucht.
- **Titel und Beschreibung im Suchpaket** (Kopfzeile liest von dort), weil es auf jeder Seite
  ohnehin geladen wird (Werkzeugschublade im Kopfbereich).
- **Zwei Kennzahlen in der Bündelprüfung** — eine Einzelpaket-Schwelle wäre durch 147 kleine Pakete
  wirkungslos geworden, eine Summenschwelle bestraft die Aufteilung.
- **Annahme:** Ein Besuch lädt ein Werkzeug, nicht 49 — deshalb ist die Last je Route die
  maßgebliche Zahl, nicht die Summe.
- ADR: `uebergabe/04-entscheidungen/0010-werkzeugtexte-je-werkzeug.md`.

## Prüfungen

**Geprüft (mit Beleg):**

- **Netzbeleg** `work/hebel2-netzbeleg.cjs`, Ergebnis in `07-pruefung/hebel2/beleg.txt`: Startseite
  7 Dateien / 171.986 B gzip **ohne** Werkzeugtexte; Rechnerroute lädt `tools-de-common`,
  `tools-de-calculator` und die englischen Gegenstücke, **kein** fremdes Werkzeug; Bild-Metadaten
  lädt `tools-de-image-metadata` und **nicht** den Rechner.
- **Funktionsprüfung** `work/sprachpaket-funktionspruefung.cjs`: **0 Schlüsselnamen** auf
  Startseite, Werkzeugschublade, Suiten-Seite und Werkzeugroute; Titel auf der Werkzeugroute
  „Rechner".
- **Rechner-Beleg** `work/rechner-vier-werkzeuge-beleg.cjs`: 8 Proben über 4 Routen und 2
  Fensterbreiten, alle Werte zurückgelesen (1/3+1/6 = 0,5 · sin 30° = 0,5 · 255 = 0xff · 3 4 + 5 *
  = 35), kein Rechnerart-Umschalter.
- `npm run check`: 381 Prüfungen in 23 Dateien grün. `npm run build` grün.
- `viewport:check`: 48 Werkzeugrouten bei 320 px grün.
- Bündelprüfung: Eingang 146.408 B gzip; Werkzeugtexte je Route de 5.199 / en 4.685 / es 5.207 B
  gzip (Schwelle 30.720), Summe je Sprache de 35.102 B (Schwelle 40.960).

**Nicht geprüft:**

- **Rust-Tests** in diesem Lauf nicht ausgeführt (zuletzt bekannter Stand 50).
- **Keine Prüfung auf echten Geräten** — nur Edge headless, Fensterbreiten 320 / 390 / 1360 px.
- **Spanisch** weiterhin nur mitgeliefert, sprachliche Gegenlesung offen.
- Die **Summe je Sprache** ist eine Serverkennzahl; ein Nutzer, der alle 48 Werkzeuge besucht, wurde
  nicht gemessen.
- **Keine Prüfung der veröffentlichten Fassung** nach dem Push (die Bereitstellung läuft dort erst).

## Offene Punkte und Risiken

- **Zwei Fehler wurden aufgedeckt und behoben** (Details im Protokoll und in
  `07-pruefung`):
  1. **Der vorige Schritt (Hebel 1) hatte den Katalog zerlegt**: Auf Startseite, Schublade und
     Suiten-Seite standen 22 Schlüsselnamen statt Text. Ursache und Behebung stehen in der Übergabe
     `2026-10-05-sprachpakete-beim-oeffnen-laden.md` (Commit `4caa7b8`).
  2. **`ToolPage` hatte Haken nach einem Rückgabewert** — React brach nach dem Umbau den Aufbau ab,
     die Werkzeugseite blieb leer, obwohl `check` und `build` grün waren. Ursache: der zusätzliche
     Zustand `toolCatalogue` ließ den ersten Durchlauf zwei Haken ausführen. Behoben durch
     Verschieben aller Haken vor den Ladehinweis. Ohne die Prüfung der laufenden Seite wäre das in
     die Veröffentlichung gegangen.
- **Risiko:** Die Werkzeugtexte liegen jetzt 147-fach vor. Bei jeder Sprachänderung schreibt der
  Erzeuger sie neu; die Änderung ist damit größer in der Versionsverwaltung, aber erzeugt und geprüft.
- **Befund am Rande, nicht behoben:** Mehrere **ältere** Übergaben haben Lücken gegen die Vorlage
  (u. a. `2026-10-03-cloudflare-pages`, `2026-10-03-datensparsame-ladegrenzen`,
  `2026-10-03-pdf-m0-m1` … `pdf-m6`, `2026-10-04-rechner-tastenfeld-umgesetzt`,
  `2026-10-04-sammelrelease-sprachen-pdf-rechner`). Sie sind nicht nachgezogen — eigener Auftrag.
- Nebenbei aufgefallen und **nicht** geändert: `suite.titleKey`/`descriptionKey` werden weiterhin aus
  dem Oberflächenpaket gelesen — dort liegen sie, das ist unverändert in Ordnung.
- **Push (Nachtrag 2026-10-05):** Hier stand ursprünglich „Nicht gepusht". Thomas hat am
  Sitzungsende „Push" gesagt; ausgeführt und gegengeprüft: `1c74d29..cdc8854  main -> main`,
  `git ls-remote origin main` = `cdc88542fd…` = lokaler Stand. Die Bereitstellung ist damit ausgelöst.

## Empfohlener nächster Schritt

**Handwerk-Suite Welle B**: Fliesen, Farbe, Trockenbau, Bodenbelag. Der Textsplit, der dort als
Vorbedingung notiert war, ist mit dieser Arbeit erledigt. Zweiter Kandidat: die älteren Übergaben an
die Vorlage angleichen.

## Git

- Commit: **`095b04e`** — `perf(i18n): load tool texts per tool instead of per language`;
  **`cdc8854`** — `docs(i18n): record the per-tool text packages (ADR 0010, handover, protocol)`.
  Aus demselben Auftrag: **`4caa7b8`** (Katalogkorrektur) und **`3283172`** (Dokumentation dazu).
- **Gepusht am 2026-10-05:** `git push origin main` → `1c74d29..cdc8854  main -> main` (26 Commits).
- Arbeitsbaum sauber bis auf die fremden Änderungen an `COPYRIGHT` und `LICENSE` (nicht angefasst).

---

## Hinweis zur Fassung (2026-10-07)

Diese Übergabe wurde am 2026-10-05 im Commit `ed0ee4e` **strukturell an die
Vorlage angeglichen** (Abschnitte umgestellt, Text verschoben); dabei wurden in dieser Datei
**39 Zeile(n) entfernt oder ersetzt** (94 hinzugefügt). Die Angleichung ist hier
**sachlich gekennzeichnet**, nicht bewertet, und es wird keine Absicht zugeschrieben.

Die Fassung **davor** ist unverändert abrufbar:
`git show ed0ee4e^:uebergabe/05-uebergaben/2026-10-05-werkzeugtexte-je-werkzeug.md`. Die Git-Geschichte selbst ist
**nicht** verändert worden.

*Aufgenommen im Durchzug der QM-Stufe R8 (Karte M10-003). Ab dem 2026-10-07 gilt das
Aktenkorrekturverfahren in `00-einstieg/arbeitsregeln.md`, Abschnitt „Aktenkorrektur":
ergänzen statt umschreiben, datierter Nachtrag mit ersetzter Aussage, Grund, richtiger Aussage
und Beleg.*

---

## Nachtrag 2026-10-07 (QM-Stufe R8, Karte M10-004): Belegskripte sind umgezogen

Die oben genannten Belege lagen unter `work/` — das ist durch die Projekt-`.gitignore` **nicht
versioniert**, in einem frischen Checkout also nicht vorhanden. Der **tragende** Netzbeleg ist
portiert und liegt jetzt versioniert:

- Aufruf **`npm run beleg:sprachpakete`**, Skript `scripts/belege/sprachpakete-netzbeleg.mjs`,
  hervorgegangen aus `work/hebel2-netzbeleg.cjs` (fachlich unverändert).
- Ergebnis jetzt **datiert** unter `uebergabe/07-pruefung/hebel2/beleg-<Datum>.txt`; der damalige
  `beleg.txt` bleibt als Fassung vom 2026-10-05 **unverändert** stehen.
- Erster Lauf der portablen Fassung am 2026-10-07: Startseite 183.532 B gzip **ohne** Werkzeugtexte,
  Rechnerroute `tools-de-calculator` + `tools-de-common` und **kein** fremdes Werkzeug,
  Bild-Metadaten-Route `tools-de-image-metadata` und **nicht** den Rechner — dieselben drei
  Feststellungen wie oben, andere Zahlen (der Bau hat sich seither geändert).

Voraussetzungen, Grenzen und die Liste der **nicht** übernommenen Proben: `scripts/belege/README.md`.
`work/sprachpaket-funktionspruefung.cjs` und `work/rechner-vier-werkzeuge-beleg.cjs` sind **nicht**
übernommen (Sitzungsbelege dieser Welle); der Rechenkern hat mit `npm run beleg:rechner-kern` einen
versionierten Nachfolger, der Rest steht als offener Punkt in `01-stand/offene-punkte.md`.
Der Wortlaut oben bleibt unverändert stehen.
