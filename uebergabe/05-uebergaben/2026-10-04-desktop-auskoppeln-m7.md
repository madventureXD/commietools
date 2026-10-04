# Übergabe: Desktop-Auskoppeln — M7 Dokumentation und Übergabe

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Team 2)
**Auftrag:** M7 „Dokumentation und Übergabe" des Vorhabens „Desktop-Erfahrung: Werkzeuge auskoppeln"
(Go von Thomas am 2026-10-04, Anweisung „M7 durchführen"). Kein Push.
**Status:** abgeschlossen

## Ziel der Sitzung

Das Vorhaben dokumentarisch abschließen: `docs/ui-system.md` um das Auskoppeln fortschreiben, den
Projektstand und die offene-Punkte-Liste pflegen und die Sitzung nach Vorlage übergeben — mit den
Pflichtprüfungen und belegbaren Zahlen. **Am Code sollte nichts geändert werden.**

## Ergebnis

**M7 ist durchgeführt; das Vorhaben ist in der geplanten Form abgeschlossen.**

- **`docs/ui-system.md` hat einen neuen Abschnitt „Detaching a tool into its own window"** — er
  beschreibt die Umsetzung, nicht den Plan: Ort und Erscheinen des Knopfes (Werkzeugrouten; Katalog,
  Suiten, Lizenzseite und Impressum **nicht**), die Fähigkeitsprüfung zur Laufzeit statt
  Browsererkennung, eine Instanz über zwei Dokumente mit Platzhalter im Hauptfenster, die
  **gemessene** Zielgröße samt Größen-Hilfe (samt der Einzelheit, dass `resizeTo()` die *äußere*
  Größe setzt und der Klick im zweiten Fenster fallen muss), das mitgeführte Farbschema und die
  Barrierefreiheits-Grundlinie. Die Plattformgrenzen sind dort als **Grenzen** festgehalten, nicht
  als Zusagen: Größe beim Öffnen nicht vorschreibbar, Position nicht setzbar, ein Fenster je Tab,
  kein Überleben des Herkunftsfensters, keine Navigation darin, Vollbild gesperrt, Top-Level + HTTPS.
- **M6 „Verhalten ohne PiP" ist damit ebenfalls beantwortet:** Der Knopf hängt an der Prüfung
  `typeof window.documentPictureInPicture?.requestWindow === 'function'`; ohne brauchbare
  Schnittstelle erscheint er nicht (in M3/M5 gemessen: `false` → kein Knopf, `true` → Knopf). Im
  Konzept ist das als datierter Nachtrag festgehalten.
- **Stand und Aufgabenliste sind aktualisiert.** `01-stand/aktueller-stand.md` nennt jetzt das
  Auskoppeln als umgesetzt, trennt **veröffentlichten** Stand (136.967 B) von **aktuellem
  Arbeitsstand** (145.559 B) und benennt die zwei nicht belegten Punkte. `01-stand/offene-punkte.md`
  führt den Auskoppel-Punkt auf M0–M7 geführt und hat den Posten „elf ältere Übergaben verfehlen die
  Vorlage" aufgenommen, der bisher nur in Übergaben stand.
- **Fortschrittsprotokoll** `06-protokolle/2026-10-04-desktop-auskoppeln-m7.md` und die datierten
  Nachträge in Konzept und Vorlage-Dateien liegen vor.
- **Alle Übergaben dieses Vorhabens erfüllen die Vorlage.** Geprüft mit der Abschnittsschleife aus
  `00-einstieg/arbeitsregeln.md`: `…-m0.md`, `…-m2.md`, `…-m3-m5.md` und diese Datei melden je alle
  acht Pflichtabschnitte. Die drei älteren waren bereits vollständig — **kein Nachtrag nötig**.

## Geänderte Bereiche

- `docs/ui-system.md` — neuer Abschnitt „Detaching a tool into its own window"
- `uebergabe/01-stand/aktueller-stand.md` — Kopf um „lokal fertiggestellt, nicht veröffentlicht"
  ergänzt, Auskoppeln in der Umgesetzt-Liste, Zahlen aus der heutigen Messung, veröffentlichte und
  aktuelle Startgröße getrennt, „Noch nicht umgesetzt" um die zwei offenen Nachweise ergänzt
- `uebergabe/01-stand/offene-punkte.md` — Auskoppeln auf M0–M7 geführt; neuer Posten „elf ältere
  Übergaben ohne Pflichtabschnitte"
- `uebergabe/03-konzepte/2026-10-04-desktop-auskoppeln.md` — datierter Nachtrag „M6 und M7
  abgeschlossen" (ergänzt, nichts überschrieben)
- `uebergabe/06-protokolle/2026-10-04-desktop-auskoppeln-m7.md` — **neu**
- `uebergabe/05-uebergaben/2026-10-04-desktop-auskoppeln-m7.md` — **neu** (diese Datei)

**Kein Code geändert:** `apps/`, `packages/` und `scripts/` sind unberührt.

## Entscheidungen und Annahmen

- **M6 wird durch die vorhandene Fähigkeitsprüfung als erfüllt gewertet und nicht eigens nachgemessen.**
  Grund: Die Produktentscheidung 3 („ohne Vordergrund wird nichts angeboten") verlangt belegtes
  Verhalten ohne Schnittstelle — dieses Verhalten ist in M3/M5 mit `false`/`true` gemessen. Eine
  Messung in einem Browser, der die Schnittstelle nicht kennt (Safari), fand **nicht** statt, weil
  Safari auf diesem Rechner nicht verfügbar ist; die Prüfung hängt nicht am Browsernamen, sondern an
  der Fähigkeit. Das ist eine **gekennzeichnete Bewertung**, keine Messung.
- **Die zwei Größenangaben bleiben getrennt statt in einer Zahl.** Der veröffentlichte Sammelrelease
  (136.967 B) und der Arbeitsstand mit Auskoppeln (145.559 B) sind verschiedene Dinge; eine einzelne
  Zahl hätte den Stand verschleiert.
- **Keine Oberflächenprüfung in diesem Schritt.** `viewport:check` wurde nicht erneut ausgeführt —
  es wurde kein Oberflächen-Code geändert, und die Prüfung aus M5 (41 von 41 Routen, 320 px) gilt
  unverändert. Das ist eine begründete Auslassung, kein vergessener Schritt.
- **Annahme, gekennzeichnet:** Die aus M5 übernommenen Zahlen zum Auskoppeln (41 von 41 Routen,
  Größen-Hilfe 1150×393, Startbündel-Kosten) sind in dieser Sitzung **nicht** neu gemessen; sie
  stammen aus `…-m3-m5.md`. Neu gemessen wurde nur, was das Bauwerkzeug heute ausgibt.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **grün** — 524 Pakete, 16 Lizenztexte, 189 Originaldokumente; Katalog 41 Werkzeuge / 3 Sprachen / 41 Symbole / 92 Dateitypen; Typprüfung sauber; **339 Tests in 18 Dateien** |
| `npm run build` | **grün**, inklusive `bundle:check`: Startbündel **145.559 B gzip** von 204.800 (+8.598 B zum Referenzstand nach Aufnahme der Auskoppel-Bibliothek); Rechenkern 103.709 B; Werkzeugtexte de 26.972 B von 30.720 |
| `git diff --check` | sauber (nur die bekannten CRLF-Hinweise) |
| Abschnittsprüfung der Übergaben | **grün** — `m0`, `m2`, `m3-m5`, `m7` je mit allen acht Pflichtabschnitten |
| `npm run lint` | **nicht ausgeführt** — kein Workspace-Skript vorhanden (seit Welle 5 offen) |
| `npm run viewport:check` | **nicht erneut ausgeführt** — kein Oberflächen-Code geändert (siehe Entscheidungen) |
| Firefox-Verhalten des Auskoppelns | **nach wie vor nicht gemessen** |
| Desktop-Breiten 1920/1366/1024/768 | **nach wie vor nicht geprüft** |

**Nicht erfüllte Abnahmekriterien, ausdrücklich benannt:** Punkt 3 des Abnahmekriteriums
(Überbreiten-Freiheit bei 1920/1366/1024/768 px über Startseite, Katalog, Suche und je ein Werkzeug
je Kategorie) bleibt **offen** — nachgewiesen ist weiterhin nur 320 px. Punkt 6 verlangt `npm run
lint`; das Skript existiert im Projekt nicht, deshalb ist die Zeile eine begründete Abweichung. Beide
Punkte stehen in `01-stand/offene-punkte.md` und im Fortschrittsprotokoll.

## Offene Punkte und Risiken

- [ ] **Firefox ist nicht gemessen.** `geckodriver` fehlt auf dem Rechner; der Zugang über WebDriver
      BiDi war in M3/M5 gescheitert. Erwartet: Der Knopf erscheint, weil die Größe ankommt — belegt
      ist das nicht.
- [ ] **Desktop-Breiten sind nicht geprüft** (Punkt 3 des Abnahmekriteriums).
- [ ] **Nicht veröffentlicht.** Elf Commits liegen lokal vor `origin/main`; `main` löst das
      Cloudflare-Pages-Deployment aus. Push nur auf ausdrücklichen Auftrag.
- [ ] **Die Bibliothek ist „public beta" (0.2.0) mit Einzelentwickler**; Rückversicherung ist die
      MIT-Lizenz (ADR 0007) und der Ausnahmeweg in `licenses/overrides.json` (ADR 0008, zwei Einträge).
- [ ] **`COPYRIGHT` und `LICENSE` melden sich als geändert, ohne Inhaltsänderung** — Artefakt von
      `core.autocrlf=true` (`git diff` ist leer). Nicht angefasst; gehört bei Gelegenheit bereinigt.
- [ ] **Elf ältere Übergaben verfehlen die Pflichtabschnitte** (nicht die des Auskoppel-Vorhabens) —
      gemeldet, nicht angefasst, eigener Auftrag.

## Empfohlener nächster Schritt

1. **Die zwei Lücken des Abnahmekriteriums schließen:** zuerst die Desktop-Breiten (ohne neue
   Abhängigkeit mit dem vorhandenen Werkzeug messbar), danach Firefox (verlangt `geckodriver`, also
   eine Installation).
2. Danach **die Veröffentlichung** als eigener, ausdrücklich beauftragter Schritt — Push auf `main`
   mit anschließender Online-Kontrolle auf `commietools.org` (dort noch offen: spanisches Testpaket,
   mobiler Rauchtest).
3. Der Posten „elf ältere Übergaben ohne Pflichtabschnitte" bleibt ein eigener Auftrag.

## Git

- Commit: **noch nicht committed** zum Zeitpunkt des Schreibens — dieser Dokumentationssatz
  (5 geänderte, 1 neue Datei) wird anschließend als ein Commit gesetzt.
- Vorherige Commits dieses Vorhabens: `789faef` (M0) · `3b1eeea` (M1-Konzept) · `d1c3588` (M1,
  ADR 0007) · `6395ab0` (M2, ADR 0008) · `4c9b497` (M2-Übergabe) · `ef13f81` · `fa77f83` ·
  `ba0647e` · `73847de` · `467b45c` · `e948954` (M3–M5 und Übergaben) · M7 (dieser Commit)
- Arbeitsbaum: sauber bis auf `COPYRIGHT`/`LICENSE` (Zeilenenden-Artefakt, Inhalt identisch)
- **Nicht gepusht** — alle Commits dieses Vorhabens liegen lokal vor `origin/main`.
