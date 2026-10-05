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

## Git

- Commit: `<nach dem Commit eingesetzt>` — lokal, **nicht gepusht**.
- Arbeitsbaum: unverändert die fremden Änderungen an `COPYRIGHT` und `LICENSE` (nicht angefasst,
  nicht gestagt).
- Die erzeugten Katalogpakete gehören mit in den Commit.