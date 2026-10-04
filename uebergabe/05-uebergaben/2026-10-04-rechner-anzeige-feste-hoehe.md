# Übergabe: Anzeige des Rechners — feste Höhe und getauschte Zeilenfolge

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Auftrag:** Thomas, 2026-10-04: „Ich habe ... die x-Taste (löschen) getippt. Dadurch hat sich die Anzeigenänderung auf die displaygröße ausgewirkt. Dadurch hat sich die Tastatur verschoben. Die Tastatur darf sich zum schnellen Arbeiten aber auf keinen Fall verschieben. Außerdem würde ich die roheingabezeile und die hübsche Zeile miteinander tauschen." Danach zwei Entscheidungen: Reihenfolge (Ergebnis oben, rohe Eingabezeile darunter) · kleinere Matheschrift statt größerer Anzeigefläche.
**Status:** abgeschlossen (Umsetzung und Nachweise fertig; **nicht committet** — Freigabe von Thomas offen)

## Ziel der Sitzung

Zwei Befunde am veröffentlichten Rechner beheben: (1) die Anzeigefläche wächst mit ihrem Inhalt und
schiebt das Tastenfeld — das darf nicht sein; (2) die Zeilenfolge in der Anzeige tauschen.

## Ergebnis

**1. Der Fehler ist gemessen, nicht geschätzt.** Bei 390 px Breite:

| Zustand | Anzeigefläche | Tastenfeld oben |
|---|---|---|
| leer | 104 px | 1019 px |
| gesetzter Ausdruck `(1/3)/(2/3)` | **192 px** | **1108 px** |
| roher Term, dieselbe Rechnung | 131 px | 1046 px |

Ursache: die Fläche hatte nur eine **Mindesthöhe** (8rem). Ein gesetzter Bruch ist mit drei
Verschachtelungsebenen bei 1,9 rem Schrift fast doppelt so hoch wie eine Zeile. Beim Tippen der
Löschtaste fällt der gesetzte Ausdruck weg, die Fläche schrumpft — und das Tastenfeld springt um
**89 px**.

**2. Behoben:** `.calculator-display` hat jetzt eine **feste Höhe** (10rem) statt einer Mindesthöhe,
und die Matheschrift ist von 1,9 rem auf **1,45 rem** verkleinert (Entscheidung von Thomas: Ergebnis
kleiner, damit auch ein Bruch hineinpasst). Was nicht hineinpasst, rollt im Kasten, statt ihn zu
vergrößern. Gemessen in **jedem** Zustand bei 320, 390 und 1360 px: **160 px**, kein Rollen nötig,
Tastenfeld innerhalb einer Rechenart unverändert.

**3. Zeilenfolge getauscht** (Entscheidung von Thomas): **Ergebnis oben** — im zweidimensionalen Satz
gesetzt, sonst als Zahlenzeile — **rohe Eingabezeile darunter**. In beiden Anzeigearten dieselbe
Reihenfolge, damit die Zeilen beim Umschalten nicht die Plätze tauschen. Die **gesetzte Fassung der
Eingabe entfällt** damit; das entspricht der Regel des Oberflächen-Konzepts, dass der zweidimensionale
Satz für das Ergebnis da ist und die Eingabe Text bleibt (kopierbar).

**4. Ein Fehler in meiner eigenen Messung, gefunden und korrigiert.** Der erste Durchlauf zeigte bei
390 px einen Unterschied von 21 px zwischen „leer" und „mit Ergebnis". Ursache war das Messskript: die
Einstellungen überleben den Breitenwechsel im lokalen Speicher, also startete der zweite Durchlauf in
RPN. Nach dem Leeren des Speichers je Breite und ausdrücklichem Setzen der Ausgangslage ist das
Tastenfeld in beiden Zuständen identisch bei 1075 px. Es war **kein** Fehler des Rechners.

## Geänderte Bereiche

- `apps/web/src/tools/Calculator.tsx` – `twoDim` wird zu `twoDimResult` (nur noch das Ergebnis wird
  gesetzt); neue Zeilenfolge in beiden Anzeigearten
- `apps/web/src/styles.css` – `.calculator-display` feste Höhe 10rem mit `overflow-y: auto`;
  `.calculator-display math` von 1,9 rem auf 1,45 rem
- `uebergabe/07-pruefung/rechner-anzeige/` – **neu**: vier Aufnahmen und `aufnahmen.txt`
- `work/displayhoehe-messen.cjs`, `displayhoehe-messen2.cjs`, `displayhoehe-ursache.cjs`,
  `anzeige-shots.cjs` – Mess- und Aufnahmewerkzeuge (nicht versioniert, `work/` ist ausgenommen)
- `uebergabe/03-konzepte/2026-10-04-rechner-oberflaeche.md` – datierter Nachtrag

## Entscheidungen und Annahmen

- **Feste Höhe statt Mindesthöhe.** Die Anzeige ist der Anker über dem Tastenfeld; sie darf sich beim
  Rechnen nicht ändern. Preis: sie ist dauerhaft 160 px hoch (vorher 104 px im leeren Zustand), also
  rund 56 px mehr auf dem Handy. Die Alternative (nur so hoch wie der größte Fall, 192 px) wäre teurer
  gewesen; die dritte Möglichkeit (Ergebnis groß, tiefe Brüche mit eigener Rollfläche) hat Thomas
  verworfen.
- **Kleinere Matheschrift (1,45 rem)** ist Thomas' Entscheidung; die reine Zahlenzeile bleibt bei
  1,9 rem.
- **Angenommen, nicht bestätigt:** dass die getauschte Reihenfolge auch in der **rohen** Anzeigeart
  gilt. Thomas' Formulierung betraf „rohe Eingabezeile und hübsche Zeile"; ich habe sie in beiden
  Anzeigearten gleich umgesetzt, damit beim Umschalten nichts die Plätze wechselt. Ein Wort von ihm
  genügt, wenn es nur im zweidimensionalen Satz gelten soll.
- **Nicht angetastet:** die Ampelerklärung (geprüft: sie ändert die Höhe nicht) und die
  Kopierknöpfe (auf schmalen Bildschirmen zwei Zeilen übereinander, 96 px — ein eigener Kandidat,
  aber nicht Teil dieses Auftrags).

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **grün** — 339 Tests in 18 Dateien, Lizenz- und Registerprüfung, Typecheck |
| `npm run lint` | grün |
| `npm run build` | grün, Startbündel 136.956 B gzip; Bundle-Audit bestanden |
| Anzeigehöhe in allen Zuständen | **160 px** bei 320, 390 und 1360 px; kein Zustand rollt |
| Tastenfeld | innerhalb einer Rechenart in allen Zuständen identisch (390 px: 1075 px) |
| Zeilenfolge am Artefakt | Ergebnis gesetzt oben, rohe Eingabezeile darunter — in beiden Anzeigearten |
| Löschtaste | Anzeigehöhe und Tastenfeld unverändert (Aufnahmen `anzeige-mobil-ergebnis-oben`, `anzeige-mobil-nach-loeschen`) |
| Ampel | unverändert: Erklärung ändert die Höhe nicht (192 px vor und nach dem Öffnen) |

**Nicht geprüft:** kein echter Tastatur- und Screenreader-Lauf; die drei Sprachen sind nicht visuell
gegeneinander geprüft (die feste Höhe wurde nur in Deutsch gemessen — bei längeren Beschriftungen in
anderen Sprachen könnten die Merker umbrechen und die Fläche rollt dann im Kasten statt das Tastenfeld
zu schieben).

## Offene Punkte und Risiken

- [ ] **Nicht committet.** Nichts gepusht; `main` steht auf `43f12fb`.
- [ ] **Merker-Zeile bei langen Beschriftungen:** auf 320 px belegt die Merker-und-Werkzeugzeile
      bereits zwei Zeilen (51 px). In einer Sprache mit längeren Beschriftungen könnte es knapp
      werden; die feste Höhe verhindert dann nur noch das Verschieben, nicht das Rollen.
- [ ] **Kopierknöpfe** stehen auf schmalen Bildschirmen untereinander und kosten 96 px vor dem
      Tastenfeld — ein Kandidat für eine eigene Zeile, nicht angefasst.
- [ ] Die Ampel bleibt weiterhin im RPN-Modus und bei anderer Anzeige-Basis aus (ADR 0006).

## Empfohlener nächster Schritt

1. **Freigabe zum Commit** durch Thomas; danach wie beim letzten Mal: Prüfung im sauberen Auschecken,
   dann Push (löst die Bereitstellung aus).
2. Wenn gewünscht: die Merker-Zeile auf schmalen Bildschirmen entlasten (etwa nur den Zahlenmodus als
   Merker, Basis und Winkel in die Einstellungen).

## Git

- Commit: **noch nicht committet**
- `main` steht auf `43f12fb` („docs(rechner): record the accuracy light commit, the clean-checkout run
  and the push"); Arbeitsbaum: die drei oben genannten Dateien sind geändert bzw. neu

---

## Nachtrag 2026-10-04 — Commit, Prüfung im sauberen Auschecken, Push

*Ergänzt nach Thomas' Go. Der Wortlaut oben bleibt stehen; die folgenden Angaben ersetzen den
Git-Abschnitt.*

**Commit:** `4a9f872` — „fix(rechner): keep the display height fixed and put the result on top"
(11 Dateien, 199 Einfügungen / 37 Löschungen). Enthält zusätzlich den datierten Nachtrag im
Ampel-Konzept („keine Bruch-Erkennung im Dezimal-Modell", Thomas' Entscheidung zum Fall `1/3+1/3`).
Kein QM-Element enthalten (nachgeprüft). Arbeitsbaum danach sauber.

**Prüfung im sauberen Auschecken** (`git worktree add --detach … HEAD`, danach `npm ci`):
`npm ci` Exit 0, `licenses:check` grün (522 Pakete), `catalog:check` grün, **339 Tests in 18 Dateien**
grün, `lint` grün, `build` grün mit Startbündel 136.956 B gzip und bestandenem Bundle-Audit —
**alle vier Schritte Exit 0**. Bündeldatei `index-CQGqOIbn.js` in beiden Bäumen gleich.

**Push:** `43f12fb..4a9f872  main -> main`. `main` ist danach in Sync mit `origin/main`.

**Bereitstellung nachgeprüft:** `https://commietools.org/` verweist auf `assets/index-CQGqOIbn.js`, und
die ausgelieferte Datei ist **byteweise identisch** mit dem lokalen Bau
(SHA-256 `e61d83ac0281c8576c20198d0d843a79…`, 463.305 Bytes).

**Aufgeräumt:** Auscheckverzeichnis und `node_modules` entfernt; `git worktree list` zeigt nur den
Hauptbaum.
