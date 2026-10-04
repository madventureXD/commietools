# Übergabe: Oberfläche des Rechners — Konzept (Tastenfeld und 2D-Anzeige)

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Auftrag:** Thomas, 2026-10-04: „heutiges Thema: Design der Taschenrechner … Icons zum drücken,
möglichst wenig Text, mehr eindeutige mathematische Zeichen. Rohen Design-Vorschlag bitte
vorlegen, mit concept-Art." Danach: „Ich möchte beide Möglichkeiten (also aktuell, leicht
kopierbar) durch einen Klick switchbar auf schöne vollständige 2D Darstellung." Und zuletzt:
**„Erst Konzept"** — also festhalten, nicht umsetzen.
**Status:** abgeschlossen (Konzept liegt als **Entwurf** vor; nichts umgesetzt, nichts gemessen
außer der einen Kernfeststellung in §Ergebnis Punkt 2)

## Ziel der Sitzung

Einen rohen Design-Vorschlag für Standard- und wissenschaftlichen Rechner vorlegen — Tastenfeld
statt Textfeld, Zeichen statt Wörter — samt Concept-Art, und die Frage der
zweidimensionalen Anzeige (Brüche untereinander, Wurzeln mit Überstrich) klären: gibt es dafür
freie Lösungen, und wie wäre beides umschaltbar. Thomas hat entschieden: **erst das Konzept**.

## Ergebnis

**1. Zwei Concept-Tafeln liegen vor** (HTML, mit Edge headless gerendert, 2-fache Auflösung):

- `work/rechner-tastatur-concept.html` / `.png` — Standard (dunkel und hell), wissenschaftlich
  (5 × 8 mit drei Funktionsreihen und `2nd`-Umschalter), 320-px-Breite, Tastensprache in vier
  Klassen, Vergleich zum heutigen Rechner.
- `work/rechner-anzeige-concept.html` / `.png` — beide Anzeigezustände nebeneinander, der
  Umschalter in der Zeile der Zustandszeichen, Wurzel/Potenz, und die Regel, dass die Eingabezeile
  Text bleibt.

**2. Eine Feststellung, die den Anzeigeteil betrifft — gemessen, nicht angenommen.** In
`node_modules` des Projekts (mathjs 15.2.0, 2026-10-04):

| Aufruf | Ergebnis |
|---|---|
| `parse('1/2 + sqrt(2) + x^2').toTex()` | `\frac{1}{2}+\sqrt{2}+{x}^{2}` ✓ |
| `.toHTML()` | flaches HTML — **kein** Bruchstrich, **keine** Hochstellung ✗ |
| `.toMathML()` | **existiert in 15.2.0 nicht** ✗ |

Der vorhandene Rechenkern liefert also LaTeX, aber keine zweidimensionale Darstellung. Die
Anzeige-Frage ist damit eine eigene Entscheidung.

**3. Das Konzept ist geschrieben:** `03-konzepte/2026-10-04-rechner-oberflaeche.md`, Status
**entwurf**, nach der Vorlage `vorlagen/konzept.md`, mit Ausgangslage, Zielen, Nicht-Zielen,
Vorschlag, Alternativen, Auswirkungen (Local First, Offline, UI/Barrierefreiheit,
Internationalisierung, Modularität, Lizenzen, Tests), offenen Fragen und einem
Abnahmekriterien-Block.

**4. Kern des Entwurfs:** Tastenfeld für Standard (4 × 5) und Wissenschaftlich (5 × 8) neben dem
Textfeld — nicht statt seiner; Tastensprache in vier Klassen (reines Zeichen · genormte, nicht
übersetzte Abkürzung · Symbol statt Wort · sichtbarer Text nur für Zustände und Handlungen);
Anzeige in zwei Zuständen mit einem Klick, Wert identisch, kopiert wird immer der Text, Vorgabe
bleibt Text. **Kein neuer Rechenkern:** Tasten hängen Schnipsel an den vorhandenen Ausdruck
(`appendSnippet` tut das schon), also kein Zuwachs am mathjs-Paket und keine neue Abhängigkeit.

**5. Der Anzeige-Renderer ist ausdrücklich offen.** Kandidaten und Gründe stehen im Konzept
(Temml MIT · KaTeX MIT, brächte rund 20 Schriftdateien mit · MathJax 3 tex-svg Apache-2.0 ·
eigene Baum→MathML-Abbildung, 0 kB). **Alle Größenangaben sind ungemessen** und als solche im
Konzept gekennzeichnet — die Prüfung läuft nach `open-source-abhaengigkeit-pruefen`, wenn Thomas
sie beauftragt.

## Geänderte Bereiche

- `uebergabe/03-konzepte/2026-10-04-rechner-oberflaeche.md` – **neu**; Konzept nach Vorlage
- `uebergabe/03-konzepte/2026-10-03-taschenrechner-suite.md` – datierter Nachtrag mit Verweis und
  Kurzfassung; der Wortlaut oben bleibt stehen
- `uebergabe/01-stand/offene-punkte.md` – datierter Zusatz beim Punkt „Werkzeugtexte je Sprache":
  das Tastenfeld bringt rund 35 Schlüssel je Sprache mit
- `work/rechner-tastatur-concept.html`, `work/rechner-tastatur-concept.png`,
  `work/rechner-anzeige-concept.html`, `work/rechner-anzeige-concept.png` – **neu**, Concept-Art
- `work/rechner-concept-*.png` – Crops der ersten Tafel (Standard, wissenschaftlich,
  Tastensprache, Vergleich)
- **Kein Quellcode geändert.** Keine Datei unter `packages/`, `apps/`, `scripts/`, `licenses/`.

## Entscheidungen und Annahmen

- **Konzept vor Umsetzung.** Auf Thomas' ausdrückliche Ansage („Erst Konzept"); kein Probeaufbau,
  keine Bibliotheksmessung, kein Messlauf in einem Wegwerf-Verzeichnis.
- **Das Tastenfeld ersetzt das Textfeld nicht** — *Vorschlag*, von Thomas noch nicht bestätigt.
- **Kein visueller Eingabe-Editor** (Klasse MathLive): er würde die Kopierbarkeit der Eingabe
  kosten, und MathLive ist im Suite-Konzept bereits wegen Größe ausgeschieden.
- **2D nur für Ergebnis und fertige Rechnung**, nie für die halb getippte Eingabe — *Vorschlag*.
- **Ausdrücklich als Annahme gekennzeichnet:** die Größen von Temml, KaTeX und MathJax; das
  Verhalten eines kopierten MathML-Knotens; dass Temmls Schriftweg ohne eigene Schriftdateien
  auskommt.
- **Ehrlich benannte Abweichung:** Der Vier-Schritt-Fluss aus `docs/ui-system.md` verschmilzt auf
  einem Tastenfeld teilweise (Eingabe und Auslösen), und die Animations- und
  Einstellungsregeln bleiben gewahrt. Das ist als Abweichung im Konzept notiert, nicht
  stillschweigend.
- **Ablage der Tafeln:** `work/` ist per `.gitignore` ausgenommen. Die Tafeln sind damit **nicht**
  versioniert; der Inhalt ist vollständig im Konzepttext beschrieben, die Tafeln sind Illustration.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **nicht ausgeführt** — es wurde kein Code geändert |
| `npm run build` | **nicht ausgeführt** — kein Code geändert |
| `npm run lint` | **nicht ausgeführt** — kein Code geändert |
| `git status --porcelain` vor der Arbeit | sauber |
| mathjs-Fähigkeit (`toTex`, `toHTML`, `toMathML`) | gemessen, siehe §Ergebnis Punkt 2 |
| Concept-Art im Browser dargestellt | **ja** — Edge 154.0.4258.53 headless (`--force-device-scale-factor=2`), jede Tafel mit eigenem Auge geprüft (Bruchstrich, Wurzelstrich, Hochzahlen, 320-px-Tafel, keine abgeschnittenen Panels) |
| Vorlageabgleich Konzept (`vorlagen/konzept.md`) | Abschnitte Ausgangslage, Ziele, Nicht-Ziele, Vorschlag, Alternativen, Auswirkungen, Offene Fragen, Akzeptanzkriterien — vollständig |
| Prüfung der Umsetzung | **nicht möglich** — nichts umgesetzt |

**Nicht geprüft und ausdrücklich offen:** ob ein Renderer die gezeichnete Zielform wirklich
erzeugt (die 2D-Formen der Tafeln sind von Hand in HTML und CSS gesetzt, nicht von einer
Bibliothek); die gebündelten Größen der Renderer-Kandidaten; das Kopierverhalten von MathML;
MathML-Darstellung außerhalb Chromiums (auf diesem Rechner ist nur Edge vorhanden).

## Offene Punkte und Risiken

- [ ] **Der Anzeige-Renderer ist unentschieden und ungemessen.** Ohne ihn bleibt Zustand B des
      Umschalters eine Attrappe. Empfohlene Reihenfolge: Inventar, Bündelgröße, Browser-Nachweis,
      dann Entscheidung.
- [ ] **Kopierverhalten von MathML ist eine offene Messung**, keine Annahme. Liefert ein kopierter
      Knoten keinen brauchbaren Klartext, braucht die 2D-Anzeige eine eigene Kopierquelle.
- [ ] **Die Werkzeugtexte Deutsch liegen bei 26.403 von 30.720 B gzip** (Reserve 4,3 KiB); das
      Tastenfeld bringt rund 35 Schlüssel je Sprache mit. Vor der Umsetzung neu messen.
- [ ] **Risiko: die Tafeln liegen in `work/` und sind nicht versioniert.** Geht der Arbeitsbaum
      verloren, ist nur der Text erhalten. Entscheidung von Thomas, ob die Tafeln nach `uebergabe/`
      gehören.
- [ ] **Vier Entscheidungen brauchen Thomas:** Tastenfeld allein oder neben dem Textfeld;
      `2nd`-Umschalter oder alle Funktionen einzeln; Dezimaltrenner lokalisiert; und ob die
      31 Wortknöpfe auch für Programmierer und RPN zu Tasten werden.
- [ ] **Nicht geprüft:** Tastaturlauf (seit Welle 5 offen) — das Tastenfeld macht ihn leichter
      prüfbar, ersetzt die Prüfung aber nicht.

## Empfohlener nächster Schritt

1. **Thomas liest das Konzept und entscheidet die offenen Fragen** — insbesondere die vier
   Bedienfragen. Ohne sie ist das Tastenfeld nicht baubar.
2. Erst danach die **Renderer-Prüfung** (Inventar, Bündelgröße, Browser-Nachweis) — halbe Sitzung,
   Ergebnis als belegtes Urteil je Kandidat, direkt in das Konzept.
3. Erst dann die Umsetzung als eigene Welle.

**Kein Push.** `main` löst das Cloudflare-Pages-Deployment aus; ein Push ist eine
Veröffentlichung und erfolgt nur auf Thomas' ausdrücklichen Auftrag.

## Git

- Commit: **noch nicht committet.** Die Änderungen liegen im Arbeitsbaum; Committen ist eine
  eigene Entscheidung von Thomas.
- Arbeitsbaum: fünf geänderte bzw. neue Dateien unter `uebergabe/` (Konzept, Nachtrag,
  offene Punkte, Übergabe) plus vier Dateien unter dem ignorierten `work/`.
- `main` bleibt auf `f25cc82` („docs(rechner): the wave 6 handover is shippable after all").

## Nachtrag 2026-10-04 (zweiter): Thomas' vier Antworten, zwei weitere Concept-Tafeln

*Ergänzt nach den Antworten; der Wortlaut oben bleibt stehen.*

**Thomas hat geantwortet:** (1) beide Varianten als Concept-Art vorlegen · (2) `2nd` **plus** eine
Taste für alles, was keinen Platz mehr hat · (3) Dezimaltrenner lokalisiert · (4) Tastenfeld auch
für Programmierer und RPN.

**Geliefert — drei neue bzw. erneuerte Tafeln in `work/` (nicht versioniert):**

- `rechner-tastatur-varianten.html` / `.png` — **Variante A** (nur Tastenfeld) gegen **Variante B**
  (Tastenfeld neben der Eingabezeile), die `2nd`-Ebene mit zweiter Belegung auf denselben Tasten,
  das Blatt `⋯` mit allen weiteren Funktionen, und die vier Antworten.
- `rechner-tasten-programmierer-rpn.html` / `.png` — Programmierer (Basen, Wortbreite, `A–F`,
  Bitoperationen; `A–F` in DEC abgeschaltet) und RPN mit vier sichtbaren Stapelebenen.
- `rechner-tastatur-concept.html` — **neu gerendert**, weil die Anzeige darin `40,7` zeigte.

**Vier Messungen, die beim Zeichnen angefallen sind und die den Entwurf ändern:**

| Nr. | Befund | Folge |
|---|---|---|
| M1 | mathjs lehnt `×`, `÷`, `−` (U+2212), `·` und das Komma ab: `Undefined symbol ×`, `Syntax error` | Taste darf `×`/`÷`/`−` zeigen, abgelegt wird `*`/`/`/`-`; offene Festlegung, was die Eingabezeile zeigt |
| M2 | `evaluate('sin(30)').display` ist `'0.5'` — die Anzeige benutzt einen **Punkt** | „Dezimaltrenner lokalisiert" (Antwort 3) ist mit der Anzeige gleichzuziehen |
| M3 | Die kuratierte Factory-Liste lädt `nthRoot`, `cbrt`, `tau`, `phi`, `i`, `arg`, `isPrime`, `mean`, `std` **nicht** | `∛` und `ⁿ√x` sind Zeichen über `x^(1/3)`/`x^(1/n)`; das Blatt `⋯` führt nur Vorhandenes |
| M4 | `rightLogShift` ist nur vektoriell (steht so im Code-Kommentar) | kein eigenes Tastenpaar für den logischen Rechts-Shift; das läuft über `toWord` |

**Zwei Befunde, die über die Oberfläche hinausgehen und Entscheidungen brauchen:**

- **RPN:** `ENTER`, `DROP`, `SWAP`, `ROLL` setzen einen **Stapelzustand** voraus. Heute ist RPN eine
  getippte Zeichenkette. (a) Zeichenkette behalten, nur Zeichen statt Wörter — oder (b) echter
  Stapelrechner mit Aufwand im Rechenkern.
- **Programmierer:** `A–F` in DEC/OCT/BIN abschalten (nicht nur blass). Einzige Verhaltensänderung
  dieser Rechenart.

**Dokumentiert:** der Suite-Nachtrag in `03-konzepte/2026-10-03-taschenrechner-suite.md` und der
zweite Nachtrag in `03-konzepte/2026-10-04-rechner-oberflaeche.md`, beide datiert, keiner
überschreibt alten Wortlaut.

**Prüfungen dieses Nachtrags:** keine der Projektprüfungen ausgeführt — es wurde **kein Quellcode
geändert**, nur gezeichnet und dokumentiert. Die vier Messungen liefen in `node -e` gegen
`node_modules` des Projekts (mathjs 15.2.0); M2 ist zusätzlich über den vorhandenen Projekttest
belegt. Alle Tafeln wurden im Browser dargestellt und mit eigenem Auge geprüft (Edge 154.0.4258.53
headless, zweifache Auflösung).

**Offen geblieben:** Variante A oder B · Dezimaltrenner in Eingabe und Anzeige · RPN-Zustand ·
Abschaltung der Zifferntasten · Umfang des Blattes `⋯` · Anzeige-Renderer (ungemessen) ·
Werkzeugtexte nach rund 35 neuen Schlüsseln je Sprache neu messen.

## Nachtrag 2026-10-04 (dritter): zwei Entscheidungen, ein Messlauf

*Ergänzt nach Thomas' Antwort „2 nach deiner Empfehlung, 3 cbrt aufnehmen". Der Wortlaut oben
bleibt stehen.*

**Entschieden:**
- **Dezimaltrenner (Frage 2)** — nach meiner Empfehlung: der vorhandene Helfer
  `normalizeDecimalInput` wird **auch im Ausdruckspfad** angewendet (heute nur im RPN-Pfad), **und**
  die Anzeige wird lokalisiert. Damit ist ein **bestehender Fehler** mitbehoben: `1,5` lässt sich
  heute im Standard-Modus gar nicht eingeben.
- **`cbrt` wird aufgenommen (Frage 3).**

**Gemessen (nicht behauptet)** — esbuild-Bündel gegen die echte Factory-Liste, gzip über Node
`zlib` Stufe 9, Wegwerf-Verzeichnis `.measure/` nach der Messung entfernt, **kein Quellcode
geändert**:

| Variante | gzip | Delta |
|---|---:|---:|
| Baseline (heutige Liste) | 102.073 B (99,7 KiB) | — |
| + `cbrt` | 102.524 B (100,1 KiB) | **+451 B (0,44 KiB)** |
| + `cbrt` und `nthRoot` | 103.089 B (100,7 KiB) | +1.016 B |
| `create(all)` als Referenz | 191.755 B (187,3 KiB) | — |

**Kontrollprobe:** die Baseline trifft den im Projekt gemessenen Rechenkern-Chunk (102.475 B gzip,
Übergabe Welle 6) auf **0,4 %** genau — das Verfahren misst also das, was im Browser landet.
**Funktionsnachweis:** mit aufgenommener Factory liefert `cbrt(-8)` aus dem gebauten Bündel `-2`,
während `(-8)^(1/3)` `1 + 1.732…i` ergibt. Die Taste `∛` muss daher auf `cbrt(` abgebildet werden.

**Nicht ausgeführt:** `npm run check`, `npm run lint`, `npm run build` — es wurde **kein Quellcode
geändert**, und der Messlauf lag außerhalb des Prüfpfads (Wegwerf-Verzeichnis, danach entfernt).

**Weiterhin offen:** Schreibweise im Ausdruck (`2×3` oder `2*3`) · `nthRoot` mit aufnehmen
(Empfehlung ja, +565 B) · Variante A oder B · RPN-Zustand · Zifferntasten je Basis · Umfang des
Blattes `⋯` · Anzeige-Renderer und Schriftlizenz.
