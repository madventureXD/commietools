# Fortschrittsprotokoll: M2-009 — Kontrastmessung belastbar, Lücken benannt, Browserjob im CI

**Datum:** 2026-10-07
**Status:** **abgeschlossen** — Kontrastursache gemessen und behoben, Mutationsgegenprobe erbracht,
Browserjob verdrahtet (mit benannten Grenzen)
**Karte:** M2-009 aus R4 (`QM/70-reparaturempfehlungen/R4.md`), Basis `a041ee0`
**Auftrag (Thomas, 2026-10-07, im Wortlaut):** „Beides: Rückfall auf die Leinwandfarbe bei
durchsichtiger Vorfahrenkette, und jede verbleibende Lücke je Route benannt ausgegeben — der
Prüfer sagt damit selbst, was er nicht messen konnte" und „`windows-latest`-Job in
`.github/workflows/quality.yml`, der `a11y:check` fährt — mit denselben vier benannten Grenzen wie
M1-003 (nie gelaufen, kein Push, keine Branchschutz-Aussage)."

## Was offen war

Aus R4 blieb bei M2-009 genau ein Punkt stehen: Der **Kontrastteil der Gegenprobe war nicht
belastbar**. Eine Wegwerf-Seite mit absichtlich kontrastarmem Absatz (`#c9c9c9` auf Weiß) erzeugte
**keinen** Kontrastbefund; der Prüfer meldete stattdessen `skippedContrast: 3`. Die Ursache war
**nicht geklärt** und wurde bewusst nicht geraten.

## Ursache — gemessen, nicht geraten

Der Prüfer (`scripts/viewport-audit.mjs`) holt den wirksamen Hintergrund eines Textes, indem er
die Vorfahrenkette hochläuft und die erste **deckende** `background-color` nimmt. Fand er keine,
gab er `null` zurück — der Kandidat wurde nur gezählt und **übersprungen**. Ein Loch in der Messung
sah dadurch aus wie „kein Befund".

Nachgewiesen mit zwei Wegwerf-Seiten (`work/probe/`, Dienst `work/probe-server.mjs`), beide mit
demselben kontrastarmen Absatz:

| Seite | vor der Behebung | Kontrastbefund |
|---|---|---|
| ohne jeden Hintergrund | `Kontrast=0`, übersprungen **3** | **keiner** — der Mangel blieb unsichtbar |
| mit deckendem Weiß auf der Fläche | `Kontrast=1`, übersprungen 1 | **einer**, gemessen **1,66** bei verlangten 4,5 |

Dieselbe Regel, dieselbe Farbe: Nur die Hintergrundauflösung brach ab. Damit war der Fehler im
**Prüfmittel** lokalisiert, nicht im Produkt.

**Ein eigener Fehler dabei, offen benannt:** Der erste Anlauf der Prüfseiten setzte die
**Textfarbe** gar nicht — die Absätze standen schwarz auf weiß, das Fehlen des Befunds war also
richtig. Die Seiten wurden korrigiert; erst danach war die Messung aussagekräftig. Ohne diesen
Schritt hätte ich den Prüfer zu Unrecht verdächtigt.

## Behebung (kleinster hinreichender Eingriff)

In `scripts/viewport-audit.mjs`:

1. **Rückfall auf die Leinwandfarbe.** Findet die Kette keine deckende Fläche **und** liegt kein
   Bild/Verlauf darüber, gilt die Leinwandfarbe (Weiß) als Hintergrund. Die Annahme wird nicht
   verschwiegen: `Leinwandrueckfall` steht je Route in der Ausgabe.
2. **Lücken werden benannt.** `skippedContrast` ist keine Zahl mehr, sondern eine Liste aus
   Element, Textausschnitt und Grund (`hintergrund-ueber-bild`, `textfarbe-unlesbar`); jede Zeile
   wird im Lauf ausgegeben. Text über einem Bild oder Verlauf bleibt nicht messbar — das ist eine
   Eigenschaft der Sache, keine Lücke der Messung, und steht deshalb als Grund da.

## Mutationsgegenprobe (nach der Behebung, dieselben Eingaben)

| Seite | Kontrastbefund | übersprungen | Leinwandrückfall |
|---|---|---|---|
| ohne jeden Hintergrund | **1** (vorher 0) | **0** (vorher 3) | 3 |
| mit deckendem Weiß | 1 | 0 | 1 |
| Text über einem Verlauf | 0 | 1 — **benannt** ausgegeben | 2 |

Die Zeile lautet im Lauf wörtlich:
`nicht messbar (hintergrund-ueber-bild): p "Dieser Text steht auf einem Verlauf und "`.
Damit ist belegt, dass die Prüfung einen echten Kontrastmangel **findet** und dass sie eine
verbleibende Lücke **ausspricht** statt sie zu verschweigen.

## Gesamtlauf über das Produkt (Regression, nach der Änderung)

| Lauf | Ergebnis |
|---|---|
| dunkles Schema | **Audit passed: 62 Routen × 2 Breiten**, Exit 0, **0 Befunde**, **0 benannte Lücken**, kein Leinwandrückfall |
| helles Schema | **Audit passed: 62 Routen × 2 Breiten**, Exit 0, **0 Befunde**, **0 benannte Lücken**, kein Leinwandrückfall |

**Aufschlussreich dabei:** Auf **keiner** der 62 Routen greift der Leinwandrückfall — jede
Textstelle hat eine deckende Fläche. Die Weiß-Annahme ist damit für das Produkt **nie**
wirksam; sie schließt die Lücke für fremde Seiten und für künftige Seiten ohne Flächenfarbe.
Die früheren `skippedContrast: 3` stammten aus der Wegwerf-Seite der Gegenprobe, nicht aus dem
Produkt — jetzt sind es dort 0.

Belege (außerhalb der Versionierung, bekannter Punkt M10-004):
`work/probe-server.mjs`, `work/probe/kontrast-*.html`,
`$LOCALAPPDATA/Temp/ct-a11y-dark-u3.log`, `-light-u3.log`.

## Browserjob im CI (Entscheidung Thomas)

Neu in `.github/workflows/quality.yml`: Job `browser` auf `windows-latest` — `npm ci`,
`npm run build`, Vorschaudienst starten und auf Erreichbarkeit warten, dann `a11y:check` in
**beiden** Schemata und `viewport:check`.

**Vier benannte Grenzen (wie bei M1-003, ausdrücklich im Workflow vermerkt):**

1. **Nie gelaufen.** Es wird nicht gepusht, GitHub hat den Job also nicht ausgeführt. Die YAML ist
   ein versionierter Pflichtrahmen, kein belegter Lauf.
2. **Er prüft den Bau auf dem Läufer, nicht die ausgelieferte Seite.** Die Prüfung gilt der
   Prüfung, nicht der Veröffentlichung.
3. **Actions mit Tags gepinnt**, nicht mit Commit-SHAs — offen, wie im Job `qualitaet`.
4. **Kein Ersatz** für erforderliche Statuschecks im Konto und nicht für Handarbeit: Vorleserausgabe,
   Tastaturdurchlauf, 400 % Zoom, Fokusreihenfolge und reduzierte Bewegung bleiben ungeprüft.

**Warum Windows:** Der Prüfer steuert Edge headless über das DevTools-Protokoll und ist
Windows-spezifisch. Auf `ubuntu-latest` würde der Job nicht laufen — ein Job, der in der
Wirklichkeit nicht läuft, wäre schlimmer als keiner.

**Prüfung der YAML:** mit einem YAML-Leser eingelesen — drei Jobs (`qualitaet`, `browser`, `rust`),
`browser` mit neun Schritten, `runs-on: windows-latest`. Ein gültiger Aufbau ist **kein** Beweis,
dass der Job läuft; das bleibt Grenze 1.

## Prüfkette

- `node --check scripts/viewport-audit.mjs` — Exit 0.
- `npm run check` — 687 Tests in 46 Dateien, Exit 0 (unverändert; das Skript liegt außerhalb des
  Prüflaufs, deshalb ist `node --check` hier der Beleg — eine grüne Werkstattprüfung sagt über
  ein eigenständiges Skript nichts).
- Gesamtläufe `a11y` in beiden Schemata: Exit 0 (siehe oben).
- **Nicht gepusht.**

## Offen geblieben (ausdrücklich)

- Der Job ist nie gelaufen (Grenze 1) — er kann erst nach einem Push über einen echten Lauf
  belegt werden.
- Die Handarbeitspunkte des Prüfers (Vorleserausgabe, Tastatur, Zoom, Fokusreihenfolge, reduzierte
  Bewegung) bleiben offen; sie stehen so auch in der Ausgabe des Prüfers.
