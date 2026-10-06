# Fortschrittsprotokoll: R4 — wirksame Prüf- und Freigabeschranken

**Datum:** 2026-10-06
**Status:** sieben Karten abgeschlossen, eine teilweise (M2-009)

Auftrag von Thomas (im Wortlaut): „M8-002 umsetzen und r4 komplett durchziehen, ohne Unterbrechung.
Setze dir selber Erinnerungen zum weitermachen. Bin jetzt erstmal beschäftigt und kann nicht
eingreifen. Ich erwarte eine fertige M8-002 und r4 wenn ich das nächste mal vorbeischaue. GO"

## Übersicht

| Karte | Stand | Kern |
|---|---|---|
| M1-003 | ✓ mit benannten Grenzen | `.github/workflows/quality.yml` (Node-Job, Rust-Job) |
| M4-008 | ✓ (eigenes Protokoll) | Lint prüft jetzt 415 Dateien statt keiner |
| M5-001 | ✓ | Inhaltsorakel über pdfjs für Wasserzeichen und Nummerierung |
| M5-002 | ✓ | injizierbarer Speicheradapter, 11 Tests |
| M5-003 | ✓ mit offenem Rest | QPDF-Wirkung im Browser belegt (schützen/entsperren/falsches Passwort) |
| M5-004 | ✓ | dokumentierte Regressionen in der regulären Suite — **dabei ein echter Fehler gefunden und behoben** |
| M2-009 | ◐ | Prüfer erweitert (Menü, Grenzen); Namenslücke behoben; Kontrastgegenprobe nicht belastbar |
| M3-009 | ✓ | `language-contract.test.ts`, 6 Prüfungen, Mutationsgegenprobe |

## M1-003 — versionierter Freigabeschutz

**Neu:** `.github/workflows/quality.yml` mit zwei Jobs: Node (Lockinstallation, `npm run check`,
`npm run build`) und Rust (nativ und `wasm32-unknown-unknown`, Toolchain im Job gebunden).
Rechte minimal (`contents: read`), **kein** Deployment, keine Geheimnisse, keine Kontoeinstellungen.

**Grenzen, ausdrücklich benannt (die Karte verlangt das):**

1. **Der Workflow ist nie gelaufen.** Es wird nicht gepusht, also hat ihn GitHub nie ausgeführt. Die
   YAML ist damit ein **versionierter Pflichtrahmen**, kein belegter Lauf — das wäre erst nach einem
   Push über einen echten PR-Lauf zu zeigen. Eine erfolgreiche Meldung ohne Ausführung wäre eine
   Falschaussage.
2. **Actions sind mit Tags gepinnt (`@v4`), nicht mit Commit-SHAs.** Die Karte verlangt SHAs; einen
   SHA zu erfinden wäre schlimmer als ein Tag. Offen und im Workflow vermerkt.
3. **Kein Browserjob.** `viewport:check` und `a11y:check` steuern Edge unter Windows — auf einem
   Linux-Läufer laufen sie nicht. Ein Job, der in der Wirklichkeit nicht läuft, wurde **nicht**
   gebaut.
4. **Branchschutz/erforderliche Checks sind Kontosache** und bleiben beim Betreiber (Karte: „Kein
   Beweis fehlenden Kontoschutzes aus fehlender YAML ableiten").

## M5-001 — Inhaltsorakel statt Byteanzahl

**Befund:** Die bisherigen Prüfungen sahen nur Seitenzahl und Bytegröße an; sie wären auch bei
Markierung auf der falschen Seite grün gewesen.

**Neu** in `apps/web/src/pdf-tools.test.ts`: eine Testhilfe `textProSeite` liest das Ergebnis mit
**pdfjs** — einem anderen Weg als dem pdf-lib-Schreibpfad — und liefert den Text je Seite. Damit:
- Wasserzeichen auf `pages: [1]`: Seite 1 und 3 **ohne** „ENTWURF", Seite 2 **mit**.
- Nummerierung `pages: [1,2]`, Start 5: nicht gewählte Seite **leer**, gewählte zeigen „5 / 6"
  und „6 / 6". Der Sollwert wurde aus `formatPdfPageNumber` **gelesen**, nicht geraten (meine erste
  Erwartung „Gesamtzahl 2" war falsch — die Gesamtzahl ist `start + Anzahl - 1`).

## M5-003 — QPDF-Wirkung (echter Enginepfad)

**Beleg** (`work/m5-003-qpdf-wirkung.cjs` + `work/m5-003-inhalt.mjs`), am ausgelieferten Build im
Browser, beurteilt mit unabhängigem Leser:

| Prüfung | Ergebnis |
|---|---|
| PDF schützen (Nutzer- und Besitzerpasswort) | Ergebnis erzeugt, 3006 B |
| geschütztes PDF **ohne** Passwort lesen | **PasswordException** — nicht lesbar |
| geschütztes PDF **mit** Passwort lesen | lesbar, Inhalt `SEITE-B-1/2/3` vollständig |
| entsperren, Ergebnis **ohne** Passwort lesen | lesbar, Inhalt vollständig (2331 B) |
| **falsches** Passwort | echter Fehler: „Das Passwort fehlt, ist falsch oder erfüllt die Sicherheitsanforderungen nicht." |

**Damit ist der von der Karte verlangte Kern erfüllt:** eine Mutation, die das Entsperren überspringt
(„Unlock-noop"), kann diesen Beleg nicht bestehen — das Ergebnis wäre weiterhin verschlüsselt.

**Offen:** Der Signaturkorpus (gültig / verändert / inkrementell ergänzt / „unsupported") ist **nicht**
in den automatischen Testschutz übernommen; er wurde in R1 einmalig belegt
(`06-protokolle/2026-10-06-m9-004-lopdf-anhebung.md`).

## M5-002 — Speicheradapter

**Vorgefundener Zustand:** Der ganze Speicherablauf steckte in der Komponente; kein Test führte ihn
aus. Eine Mutation, die das Schreiben überspringt, hätte alle Tests überstanden.

**Neu:** `SaveEnvironment` (injinzierter Picker + Downloadweg) und `saveWithAdapter()` in
`SaveFileControl.tsx`; die Komponente übersetzt nur noch das Ergebnis in einen Status. Der Vertrag
ist ausdrücklich: **Der Picker wird als erste erwartete Operation aufgerufen** (sonst ist die
Nutzeraktivierung des Klicks verbraucht), Daten danach.

**Tests (7 neue):** Pickerpfad bis `write`/`close` mit **geprüften Bytes**, Name und MIME; Abbruch
(`AbortError`) → `cancelled` **ohne** heimlichen Download; Schreibfehler → `error`; fehlende API →
`downloaded` mit geprüften Bytes; asynchrone Blobproduktion und wiederholter Klick; fehlende Daten →
`error` statt leerem Download.

## M5-004 — dokumentierte Regressionen

**Ergebnis:** Sechs der sieben dokumentierten Fälle (M4-001, M4-002, M4-003, M3-002, M4-007, M3-007)
stehen jetzt in der regulären Suite; M3-001 (spanische Platzhalter) ist über die neue
Sprachprüfung (M3-009) abgedeckt. Die QM-Datei `QM/tools/recommendations-regressions.test.ts` bleibt
als Herkunftsnachweis liegen (QM ist kein Testbestandteil).

**Dabei ein echter Fehler gefunden und behoben:** Der Test für **M3-007** (UTF-16-Dateiname) schlug
fehl — `normaliseFileName` schnitt lange Namen bei 180 Zeichen **mitten in einem Zeichenpaar** ab; der
Dateiname enthielt danach ein unpaariges Surrogat (`…\uD83D.pdf`). Behoben über eine Grenzprüfung am
Ende der Kürzung. **M3-007 ist damit erledigt** (die Karte stand in R6 auf ○).

## M2-009 — automatische Barrierefreiheitsprüfung (teilweise)

**Vorgefundener Zustand:** `a11y:check` existiert und ist gut gebaut (Bedienzielgrößen,
zugängliche Namen, Feldbeschriftungen, Überschriftenfolge, Kontrast, abgeschnittener Inhalt; Routen
aus dem Katalog). Offen waren die von der Karte genannten **Erweiterungen**.

**Neu in `scripts/viewport-audit.mjs`:**
1. **Offenes Menü**: Die Werkzeugschublade wird geöffnet, mitgemessen und wieder geschlossen
   (Namen und Bedienziele der Menüeinträge) — der geschlossene Zustand war eine ungeprüfte Fläche.
2. **Grenzen des Prüfers** werden am Ende des a11y-Laufs ausdrücklich ausgegeben: Vorleserausgabe,
   Tastaturdurchlauf, 400 % Zoom, Fokusreihenfolge und reduzierte Bewegung sind **nicht** geprüft.
   Ein grüner Lauf ist kein WCAG-Urteil.
3. **Namenslücke behoben** (durch die Gegenprobe gefunden): Ein Knopf, dessen gesamter Inhalt in
   einem `aria-hidden`-Element steckt, galt als „benannt". Der zugängliche Name wird jetzt aus
   sichtbarem Text **ohne** `aria-hidden`-Kinder gebildet. Die Gegenprobe
   (`work/m2-009-mutation.cjs`) belegt: unbeschrifteter Symbolknopf **und** zu kleines Bedienziel
   werden erkannt, der korrekte Knopf wird nicht gemeldet.

**Offen (ehrlich):** Der Kontrastteil der Gegenprobe konnte **nicht** belegt werden: Die
Wegwerf-Seite mit einem absichtlich kontrastarmen Absatz `#c9c9c9` auf Weiß erzeugt **keinen**
Kontrastbefund, und der Prüfer meldet für diese Seite `skippedContrast: 3` (Elemente mit Text, aber
ohne ermittelten Hintergrund). Das ist ein **offener Befund am Prüfer**, nicht am Produkt — die
Ursache ist nicht geklärt und wurde bewusst nicht geraten. Ebenso fehlt die Verdrahtung von
`a11y:check` in einen CI-Job (siehe M1-003, Grenze 3).

## M3-009 — Sprachprüfungen

**Neu:** `apps/web/src/language-contract.test.ts` — registrygesteuert über `supportedLocales` und
`toolManifests`, 6 Prüfungen:
1. Schlüsselparität zur Bezugssprache und keine leeren Texte (Werkzeugtexte),
2. **Platzhalter** (Name und Häufigkeit) je Sprache gleich der Bezugssprache,
3. keine unvollständige Interpolation, keine unpaarigen Surrogate, keine Steuerzeichen,
4. gemeinsame Texte und Suiten (`loadInterfaceMessages`) nicht leer,
5. die veröffentlichte Platzhalterzusage der drei PDF-Werkzeuge (M3-001),
6. Kurztext und Suchbegriffe über das Katalogregister in jeder Sprache.

**Mutationsgegenprobe:** `{number}` → `{número}` in der spanischen Fassung von `pdf-split` gesetzt
→ **genau zwei Prüfungen rot** mit der Meldung „pdf-split/tool.pdfSplit.download [es]: {number}
gegen {número}"; nach Rücknahme 6 grün.

**Generatordeterminismus:** `npm run catalog:generate` zweimal gelaufen — beide Male keine Änderung
im Baum (identische Ausgabe).

## Prüflauf

- `npm run check` (Lizenz, Katalog, **Lint**, Typen, Tests) — Ergebnis siehe Übergabe.
- `node --check` für alle geänderten Prüfskripte.
- a11y-Gesamtlauf (beide Breiten, dunkles Schema) — Ergebnis siehe Übergabe.

## Eigene Fehler und Umwege (offen benannt)

1. **Mutationsgegenprobe zerstörte eigene Arbeit:** `git checkout -- <datei>` nahm in einer noch
   nicht committeten Datei auch meine vorherige Änderung zurück. Lehre: Gegenproben in Dateien ohne
   offene Änderungen fahren oder vorher committen.
2. **Extraktor schnitt den Messausdruck ab** (erstes `})()` statt Blockende) — die Gegenprobe lief
   mit einem halben Prüfer. Behoben mit einer Prüfung, dass der Kontrastteil enthalten ist.
3. **Backtick im Kommentar** innerhalb des Template-Strings des Prüfskripts — der bekannte Fehler,
   erneut gemacht, sofort an `node --check` erkannt.
4. **Falsche Erwartung im Nummerierungstest** (Gesamtzahl) — korrigiert nach Lesen von
   `formatPdfPageNumber`.
5. **Drei Passwortfelder gleich gefüllt** im QPDF-Beleg — die Oberfläche verlangt zu Recht
   unterschiedliche Nutzer-/Besitzerpasswörter. Fehler der Prüfung, nicht des Produkts.

## Folgemaßnahmen

- [ ] Kontrastprüfung des a11y-Scanners untersuchen (`skippedContrast`).
- [ ] Actions auf Commit-SHAs pinnen; Browserjob plattformunabhängig machen.
- [ ] Signaturkorpus in den normalen Testschutz übernehmen (M5-003).
- [ ] 96 Lint-Warnungen abarbeiten (M4-008).