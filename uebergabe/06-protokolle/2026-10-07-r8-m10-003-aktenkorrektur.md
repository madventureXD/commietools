# R8 / M10-003 — Vorhandene Übergaben werden trotz Erhaltungsregel umgeschrieben

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug der QM-Stufe R8
**Auftrag:** Karte **M10-003** aus `QM/70-reparaturempfehlungen/R8.md`. Übergeordnet: Thomas,
„Auftrag: CommieTools — QM-Sanierung, Stufe R8 durchziehen", **kein Push**.
**Status:** abgeschlossen

---

## 1. Die Karte im Wortlaut (Auszüge)

> **Dauerhafte Lösung:** Aktenkorrekturverfahren explizit definieren: datierter Nachtrag nennt
> ersetzte Aussage, Grund, richtige Aussage und Beleg. Ursprüngliche freigegebene Fassung verlinkt
> erhalten. Strukturmigration nur mit beschlossener Ausnahme und unveränderlicher Archivfassung.
> Diffs historischer Akten im Review hervorheben; automatische Vollsperre wäre wegen erlaubter
> Metadaten-/Linkkorrekturen zu grob. Frühere inhaltliche Änderungen sachlich kennzeichnen,
> Gitgeschichte nicht umschreiben.
> **Abnahme:** Neue Korrektur lässt alte Aussage rekonstruierbar und aktuellen Status eindeutig;
> Absatzumbruch allein löst keinen Manipulationsbefund aus. Worte unverändert nur verwenden, wenn
> Vergleich das bestätigt.
> **Nicht tun / Abgrenzung:** Kein Revert historischer Commits, keine Schuld-/Absichtszuschreibung,
> keine Behauptung verlorener Gitgeschichte.

## 2. Bestandsaufnahme (gemessen, nicht behauptet)

Der Befund der Karte ist **bestätigt und beziffert**. Über die gesamte Git-Historie gelöschte Zeilen
je Übergabe (Skript über `git log --numstat`):

| Datei | gelöschte Zeilen | wo |
|---|---|---|
| `2026-10-04-rechner-welle5.md` | **80** | `6e33dc3` (2026-10-04) „bring the wave 2/4/5 handovers in line with the template" |
| `2026-10-05-werkzeugtexte-je-werkzeug.md` | **39** | `ed0ee4e` (2026-10-05) „bring the per-tool handover in line with the handover template" |
| `2026-10-04-rechner-vier-werkzeuge.md` | 15 | eigene Nachträge (datierter Zusatz vorhanden) |
| `2026-10-03-rechner-welle4.md` | 1 | `6e33dc3` |
| `2026-10-03-rechner-welle2-oberflaeche.md` | 1 | `6e33dc3` |

**Zwei Commits haben vier Übergaben strukturell umgeschrieben** (`6e33dc3`: 3 Dateien, +179/−82;
`ed0ee4e`: +94/−39) — **ohne datierten Hinweis in den Dateien und ohne beschlossene Ausnahme**. Die
Erhaltungsregel stand zu diesem Zeitpunkt bereits in `00-einstieg/arbeitsregeln.md`; sie war aber
nicht als Verfahren ausformuliert und **von keinem Prüfer bewacht**. Genau das beschreibt die Karte.

## 3. Eingriff (kleinster hinreichender)

1. **Verfahren explizit festgeschrieben** — neuer Abschnitt **„Aktenkorrektur — ergänzen statt
   umschreiben"** in `00-einstieg/arbeitsregeln.md`: der datierte Nachtrag nennt (1) die ersetzte
   Aussage, (2) den Grund, (3) die richtige Aussage, (4) den Beleg; die ursprüngliche Fassung bleibt
   über `git show <revision>:<pfad>` abrufbar und wird im Nachtrag genannt; die Git-Geschichte wird
   nie umgeschrieben; Strukturmigration nur mit **beschlossener Ausnahme**; „Wortlaut bleibt stehen"
   darf nur schreiben, wer den Vergleich gemacht hat.
2. **Prüfer** `scripts/akte-audit.mjs`, Regelkreis `korrektur` (in `npm run akte:check` = Teil von
   `check`): vergleicht den Arbeitsbaum gegen `HEAD` für die geschützten Akten
   (`05-uebergaben/`, `06-protokolle/`, `03-konzepte/`, `04-entscheidungen/`) und sucht
   **verschwundene Worte** (Multimengen-Vergleich der Wortlisten, nicht der Zeilen). Reine
   Formatierung verändert kein Wort und löst keinen Befund aus; eine inhaltliche Änderung ohne
   datierten Nachtrag scheitert. **Bewusst keine Vollsperre** — die Karte nennt sie ausdrücklich zu
   grob (Metadaten- und Linkkorrekturen müssen erlaubt bleiben).
3. **Vier betroffene Übergaben sachlich gekennzeichnet:** datierter Abschnitt **„Hinweis zur
   Fassung (2026-10-07)"** mit Commit, Datum, Zahl der entfernten/ersetzten Zeilen und dem
   Abrufweg der Fassung davor. **Keine Bewertung, keine Absichtszuschreibung.**
4. **Neuer offener Punkt OP-062** für die einzige verbleibende Entscheidung: ob die vier Fälle
   nachträglich als *beschlossene Ausnahme* gelten oder künftig eine Archivfassung im Baum geführt
   werden soll.

## 4. Prüfkette

| Prüfung | Ergebnis |
|---|---|
| `node --check scripts/akte-audit.mjs` | Exit 0 |
| `npm run check` | **Exit 0** — 719 Tests in 51 Dateien, 0 Lint-Fehler (109 Warnungen) |
| `npm run build` | **Exit 0** — Bundle-Audit bestanden |
| `npm run akte:check` | `korrektur: keine verschwundenen Worte in geschuetzten Akten` |

## 5. Mutationsgegenproben — 4 von 4 wie erwartet, jede mit Wiederherstellung per Hash

Gefahren an einer **echten** geschützten Akte ohne datierten Nachtrag
(`06-protokolle/2026-10-03-color-tools.md`):

| Fall | erwartet | Ergebnis |
|---|---|---|
| reine Formatierung (Absatzumbruch, Worte unverändert) | **besteht** | besteht (Exit 0) — *„Absatzumbruch allein löst keinen Manipulationsbefund aus"* |
| ein Wort entfernt, kein Nachtrag | **scheitert** | Exit 1: `1 Wort(e) verschwinden ohne datierten Nachtrag (z. B. "palettenbildung")` |
| dasselbe Wort entfernt, **mit** datiertem Nachtrag | **besteht** | besteht (Exit 0) |
| reine Ergänzung (Text angehängt) | **besteht** | besteht (Exit 0) |

**Erster Versuch war ein ungültiger Mutationslauf und ist als solcher benannt:** die Entfernung
zielte auf das Wort „Dateien", das in dieser Datei **nicht vorkommt** — die Mutation griff nicht
(„Mutation greift nicht"), also war auch der Fall „mit Nachtrag" kein Beleg. Erst nach der Messung
eines tatsächlich vorhandenen Wortes sind beide Fälle aussagekräftig.

## 6. Abnahme der Karte, Punkt für Punkt

| Abnahmekriterium | Stand |
|---|---|
| Neue Korrektur lässt **alte Aussage rekonstruierbar** | **erfüllt** — Fassung davor je Datei über `git show <commit>^:<pfad>` benannt; Git-Geschichte unverändert (kein Rebase, kein Amend) |
| **aktueller Status eindeutig** | **erfüllt** — „Hinweis zur Fassung" nennt Datum, Commit, Umfang und den heute gültigen Verfahrensabschnitt |
| **Absatzumbruch allein** löst keinen Manipulationsbefund aus | **erfüllt** — Wortvergleich statt Zeilenvergleich; Gegenprobe 1 besteht |
| „Worte unverändert" nur verwenden, wenn Vergleich das bestätigt | **erfüllt** — die Regel steht wörtlich im Verfahren; für die vier Dateien ist der Vergleich **gemessen** (Zahlen je Datei) |
| Kein Revert historischer Commits | **erfüllt** — kein Rebase, kein Amend, kein Revert |
| Keine Schuld-/Absichtszuschreibung | **erfüllt** — die Hinweise nennen Vorgang, Umfang und Abrufweg, keine Wertung |
| Keine Behauptung verlorener Gitgeschichte | **erfüllt** — das Gegenteil steht ausdrücklich in jeder Kennzeichnung |

## 7. Bewusst nicht getan / Grenzen

- **Der Prüfer blockt nicht vollständig.** Er sieht nur **verschwundene Worte** in geschützten Akten
  und nur gegenüber `HEAD`. Nach einem Commit ist der Vergleich leer — der Lauf vor dem Commit ist
  deshalb der entscheidende. Eine Umschreibung, die zwischen zwei Commits passiert, ohne dass
  `akte:check` lief, bleibt unbemerkt; dafür gibt es die Review-Regel und die Git-Geschichte.
- **Wortvergleich, kein Bedeutungsvergleich.** Eine inhaltliche Änderung, die dieselben Worte behält
  (etwa eine Umstellung, die den Sinn dreht), fällt nicht auf. Benannt, nicht behoben.
- **Die vier Altfälle sind gekennzeichnet, nicht rückgängig gemacht.** Ein Revert wäre laut Karte
  verboten und würde die spätere Nutzung der Akten beschädigen.

## 8. Git

- Code: `scripts/akte-audit.mjs` (Regelkreis `korrektur`) — Hash siehe `work/r8-fortschritt.md`
- Akte: `uebergabe/00-einstieg/arbeitsregeln.md`, vier Übergaben unter `uebergabe/05-uebergaben/`,
  `uebergabe/01-stand/offene-punkte.md` (OP-062)
- **Nichts gepusht.**
