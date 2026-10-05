# Übergabe: Sprachpakete — Werkzeugtexte erst beim Öffnen laden, Doppelung entfernt

**Datum:** 2026-10-05  
**Bearbeitet durch:** Faber (Hermes Agent)  
**Status:** abgeschlossen (Schritt 1 und 3 des vereinbarten Plans; Schritt 2 offen)  
**Auftrag:** Thomas, 2026-10-05: „Wie könnten wir das sprachpaketproblem lösen?" — nach der Vorlage der drei Hebel: **„Erst 1 und 3 dann 2 go"**. Umgesetzt sind **Hebel 1** (Werkzeugtexte erst beim Öffnen laden) und **Hebel 3** (Doppelung von Kurztext und Suchbegriffen entfernen).

## Ziel der Sitzung

Die Startlast soll nicht mehr mit jedem neuen Werkzeug wachsen. Heute holt die Startseite das
Textpaket **aller** Werkzeugtexte mit — obwohl sie es nicht braucht. Zusätzlich stehen Kurztext und
Suchbegriffe doppelt (im Such- **und** im Textpaket), obwohl die Werkzeugoberfläche sie nie zeigt.

## Ergebnis

**Beide Schritte sind umgesetzt und belegt; die Warnschwelle ist wieder unterschritten.**

| Kennzahl (gzip) | vorher | nachher | Wirkung |
|---|---:|---:|---|
| Werkzeugtexte **Deutsch** | 32.672 B (über 30.720) | **27.310 B** | −5.362 B, **unter der Schwelle** |
| Werkzeugtexte **Spanisch** | 31.645 B (über 30.720) | **26.847 B** | −4.798 B, **unter der Schwelle** |
| Werkzeugtexte **Englisch** | 29.787 B | **25.023 B** | −4.764 B |
| Start-JavaScript | 146.220 B | 146.297 B | +77 B — das Textpaket lag **nie** im Startbündel |

**Der eigentliche Gewinn liegt nicht im Startbündel, sondern im Netzverkehr** — deshalb der
Netzbeleg mit frischem Browserprofil:

| Route | geholte JavaScript-Dateien | Summe gzip | Werkzeug-Textpaket |
|---|---:|---:|---|
| Startseite `/` | 7 | **171.867 B** | **nicht geholt** |
| Werkzeugroute `/tools/calculator` | 13 | 335.032 B | geholt (27.236 + 24.975 B) |

Die Startseite spart damit **52.211 B gzip** (deutsches und englisches Textpaket), die sie vorher
mitgeladen hat. Roh schrumpft das Textpaket je Sprache um rund 15 % (Deutsch 116.788 → 99.372 B).

**Was sich geändert hat:**

1. **Die Werkzeugtexte hängen an der Werkzeugroute.** `loadToolMessages(locale)` wird nicht mehr
   beim Aufbau der App geholt, sondern erst, wenn eine Werkzeugroute aktiv ist. Die Texte der
   Oberfläche (Navigation, Rechtliches, Status) kommen weiterhin beim Start — sie sind klein
   (2,6 kB gzip) und werden überall gebraucht.
2. **Kein Schlüsselname blitzt auf:** `createTranslator` gibt für einen unbekannten Schlüssel den
   Schlüssel selbst zurück. Bis die Texte da sind, zeigt die Werkzeugseite deshalb den Ladehinweis
   (`…`) — geprüft im Browserbeleg, die Werkzeugseiten erscheinen vollständig.
3. **Kurztext und Suchbegriffe liegen nur noch im Suchpaket.** Der Generator nimmt sie beim
   Schreiben des Textpakets heraus; **Titel und Beschreibung bleiben** darin, weil die
   Werkzeugkopfzeile sie braucht.
4. **Zwei Tests halten die Aufteilung fest:** „hält die Katalogschlüssel aus dem Textpaket"
   (Kurztext und Suchbegriffe dürfen im Textpaket nicht vorkommen, Titel und Beschreibung müssen)
   und die Anpassung des Katalogtests, der Kurztext und Suchbegriffe jetzt an der richtigen Quelle
   liest.

## Geänderte Bereiche

- `scripts/catalog-generate.mjs` – Textpaket ohne die Kurztext- und Suchbegriffsschlüssel der
  Werkzeuge (`searchOnlyKeys`, `toolTextFiles`); Schreib- und Prüfzweig angepasst.
- `apps/web/src/App.tsx` – Werkzeugtexte werden an die Werkzeugroute gebunden geladen
  (`toolTextsLocale`), Ladehinweis in `ToolPage` statt Schlüsselnamen.
- `apps/web/src/tool-catalog.test.ts` – Kurztext/Suchbegriffe aus dem Suchpaket; neuer Test zur
  Aufteilung.
- `apps/web/src/calculator-split.test.ts` – gleiche Umstellung; Untergrenze der Werkzeugschlüssel
  auf 3 (Titel, Beschreibung, Rechenregeln) angepasst.
- `packages/tools/src/catalog/generated/{messages,search}/*`, `toolIndex.ts` – erzeugt.
- `work/sprachpaket-netzbeleg.cjs`, `work/sprachpaket-verteilung.cjs` – Mess- und Belegskripte
  (**nicht versioniert**, `work/` ist ignoriert).
- `uebergabe/07-pruefung/sprachpaket/beleg.txt` – Netzbeleg.
- `uebergabe/02-architektur/sprachpakete.md` – datierte Regelergänzung (siehe unten).
- `uebergabe/01-stand/aktueller-stand.md`, `01-stand/offene-punkte.md`, dieses Protokoll und diese
  Übergabe.

## Entscheidungen und Annahmen

- **Titel und Beschreibung bleiben im Textpaket.** Sie aus dem Suchpaket zu lesen hieße, auf einer
  direkt aufgerufenen Werkzeugroute 9,3 kB gzip für zwei Zeichenketten zu holen. Die Aufteilung
  folgt damit dem Bedarf der Oberfläche, nicht der Systematik.
- **Ladehinweis statt Schlüsselnamen.** Die Alternative — die Werkzeugseite ohne Kopfzeile rendern
  und nachschieben — hätte einen Sprung im Aufbau ergeben.
- **Der Generator entscheidet, was ins Textpaket gehört**, nicht die Oberfläche: die Regel liegt an
  einer Stelle und wird von der Prüfung erzwungen.
- **Annahme:** Spanisch bleibt wie bisher ein lokales Testpaket; die Texte wurden nicht sprachlich
  gegengelesen.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 48 Werkzeuge, 3 Sprachen, 3.164 Suchbegriffe |
| `npm run check` | **grün** — 381 Tests in 23 Dateien (ein Test mehr als vorher) |
| `npm run build` | **grün** — Start-JS 146.297 B von 204.800; Werkzeugtexte **alle drei Sprachen unter der Warnschwelle** |
| Netzbeleg mit frischem Profil | **grün** — Startseite ohne Textpaket, Werkzeugroute mit; Zahlen oben |
| Browserbeleg der vier Rechner (Wiederholung) | **grün** — 8 Proben über 4 Routen × 2 Fensterbreiten, alle Werte unverändert |
| `git diff --check` | grün (nur die bekannten Zeilenende-Hinweise) |

**Nicht geprüft:** `npm run viewport:check` und `npm run lint` liefen in diesem Schritt nicht
(keine Layoutänderung; der Ladehinweis nutzt den vorhandenen Platzhalter-Stil). 200 % Zoom und
Screenreader-Namen weiterhin offen (bestehender Punkt).

## Offene Punkte und Risiken

- [ ] **Hebel 2 steht noch aus:** Aufteilung des Textpakets **je Werkzeug** (nicht je Suite). Dann
      lädt eine Werkzeugroute nur die Texte ihres Werkzeugs (≤ 9 kB roh) statt 27 kB gzip. Ohne ihn
      wächst das Paket weiterhin mit jedem Werkzeug — nur langsamer.
- [ ] **Vorab-Cache prüfen:** Der Dienst-Worker legt Dateien vorab an. Wenn das Werkzeug-Textpaket
      dort liegt, zahlt der zweite Besuch es wieder mit; dann gehört es in den Laufzeit-Cache. In
      diesem Schritt **nicht** angefasst.
- [ ] Das spanische Textpaket ist sprachlich nicht gegengelesen (unverändert offen).
- [ ] Der Doppelungen-Test deckt nur Werkzeugschlüssel ab; eine allgemeine Regel „kein Schlüssel in
      zwei Paketen" wäre eine eigene Prüfung.

## Empfohlener nächster Schritt

1. **Hebel 2 umsetzen** (Werkzeugtexte je Werkzeug, Lader über die Werkzeugkennung) — der Auftrag
   dafür liegt vor („dann 2").
2. Danach den Vorab-Cache des Dienst-Workers prüfen und die Aufteilung dort nachziehen.
3. Dann zurück zur Handwerk-Suite (Welle B: Fliesen, Farbe, Trockenbau, Bodenbelag) — der
   Textsplit, der dort als Vorbedingung notiert war, ist mit diesem Schritt erledigt.

## Zusatz 2026-10-05 (zweiter), Faber: Hebel 1 hatte die Startseite zerlegt — gefunden bei der Vorabprüfung

**Der Fehler:** `ToolCard` (Katalogkarten, Suiten-Liste) und `ToolNavigation` (die Werkzeugschublade
auf **jeder** Seite) lasen Titel, Kurztext und Schlagwörter über `t(tool.titleKey)` — also aus dem
Textpaket, das seit Hebel 1 erst auf einer Werkzeugroute geholt wird. Auf der Startseite und den
Suiten-Seiten standen dadurch **Schlüsselnamen** statt Text: im Beleg **22 Stellen**
(„tool.textStats.title", „tool.pdfMerge.title" …). Die Schlagwörter auf den Karten verschwanden
ganz, weil auch `tool.termsKey` nicht mehr im Paket liegt.

**Warum meine eigenen Belege es nicht gesehen haben** (das ist der eigentliche Befund):

| Beleg | Was er prüft | Warum er blind war |
|---|---|---|
| Netzbeleg | welcher Verkehr anfällt | prüft Verkehr, nicht Text |
| Rechner-Beleg | Werte auf **Werkzeugrouten** | dort **wird** das Textpaket geladen |
| `viewport:check` | Überbreite bei 320 px | prüft Breiten, nicht Inhalte |
| `npm run check` | Typen, Tests, Katalogregeln | die Tests lesen die Pakete direkt, nicht die gerenderte Seite |

Erst die von Thomas verlangte **Vorabprüfung der Funktion** hat es aufgedeckt. Neues Skript:
`work/sprachpaket-funktionspruefung.cjs` — es liest auf vier Orten die sichtbaren Texte und meldet
jeden, der wie ein Sprachschlüssel aussieht (Beleg:
`07-pruefung/sprachpaket/funktionspruefung.txt`).

**Die Behebung** (Commit `4caa7b8`): Titel, Kurztext und Schlagwörter kommen jetzt aus dem
**Suchpaket** — über den neuen Baustein `apps/web/src/tool-texts.ts`. Karten, Schublade und
Suiten-Seite geben ihren geladenen Suchindex mit; die Suiten-Seite lädt ihn dafür selbst. Nach dem
Umbau: **0 Schlüsselnamen** auf Startseite, Schublade, Suiten-Seite und Werkzeugroute; der
Netzbeleg bleibt unverändert günstig (Startseite ohne Textpaket).

**Folge für Hebel 2 — die Aufteilung wird dadurch einfacher:** Der Suchindex wird ohnehin auf jeder
Seite geladen (die Schublade steckt im Kopfbereich). Wenn die Werkzeugkopfzeile Titel und
Beschreibung ebenfalls von dort nimmt, braucht das Textpaket **weder Titel noch Beschreibung** —
je Werkzeug bleiben nur seine eigenen Oberflächentexte übrig. Damit sinkt die Last einer
Werkzeugroute auf: gemeinsame Werkzeugtexte (rund 10 kB roh) **plus** die Texte **eines**
Werkzeugs (0,2–9 kB roh) statt heute 27 kB gzip für alle 48.

**Lehre für die Prüfkette** (in den Skill übernommen): Wer den Ladezeitpunkt von Texten ändert,
muss **die gerenderten Texte** prüfen, nicht nur Verkehr, Breiten und Typen. Ein Beleg, der die
betroffene Seite nicht ansieht, beweist für sie nichts.

## Git

- Commit: **`320443e`** — `perf(i18n): load tool texts on the tool route and drop the duplicated
  catalogue keys`; **`4caa7b8`** — `fix(catalogue): read tool titles and summaries from the search
  package` (die Behebung des oben beschriebenen Fehlers). Lokal, **nicht gepusht**.
- Arbeitsbaum: unverändert die fremden Änderungen an `COPYRIGHT` und `LICENSE` (nicht angefasst,
  nicht gestagt).
- Die erzeugten Katalogpakete gehören mit in den Commit.