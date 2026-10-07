# R8 / M10-005 — Abschlussbewertung wird nicht durchgehend am dokumentierten Umfang geprüft

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug der QM-Stufe R8
**Auftrag:** Karte **M10-005** aus `QM/70-reparaturempfehlungen/R8.md`. Übergeordnet: Thomas,
„Auftrag: CommieTools — QM-Sanierung, Stufe R8 durchziehen", **kein Push**.
**Status:** abgeschlossen

---

## 1. Die Karte im Wortlaut (Auszüge)

> **Dauerhafte Lösung:** Aktuelle Abschlussmatrix für tatsächlich beauftragte Wellen erstellen,
> Originalkriterium unverändert zitieren und separat Istwert, Revision, Nachweis, Status/Entscheidung
> führen. … Unscharfes Startbudget unverändert in messbare Bedeutung überführen: identischer Bytewert,
> kein neuer Engine-Startimport oder unter Warnschwelle sind verschiedene Anforderungen. Änderung nur
> als datierte neue Entscheidung, nicht rückwirkend zur Erfüllung erklären.
> **Abnahme:** Jedes ursprüngliche Kriterium hat belegt erfüllt/abweichend/ausdrücklich verschoben,
> nicht still entfernt. D/E-Funktionsabnahme und neue Routen gesondert prüfen; Audit der alten 54 Tools
> ersetzt das nicht.
> **Nicht tun / Abgrenzung:** Keine erneute Welle D/E bauen. Keine harte Budgetverletzung oder
> vorsätzliche Kriteriumsverschiebung ohne entsprechenden Beleg behaupten.

## 2. Bestandsaufnahme (gemessen)

- **Elf Konzepte** unter `03-konzepte/` tragen einen Abnahmeabschnitt
  (`Akzeptanzkriterien`/`Abnahmekriterien`/`Abnahmekriterium`/`Freigabekriterien`).
- **Zwei** davon haben **keinen**: `2026-10-03-handwerkerwerkzeuge.md` und
  `2026-10-04-sprachgetrennte-suchpakete.md` — für die Handwerk-Wellen A–D existiert damit **kein
  schriftliches Kriterium**, an dem sich „erfüllt/abweichend/verschoben" prüfen ließe. Das ist der
  Befund der Karte, nicht eine Unterlassung dieses Durchzugs.
- Die Abschlussbewertung stand bisher verstreut in Übergaben, Protokollen und den Konzepten selbst;
  **keine** Stelle stellte ein ursprüngliches Kriterium einem gemessenen Istwert gegenüber.
- Das unscharfe Startbudget: im Konzept der Rechner-Oberfläche als **identischer Bytewert**
  (136.961 B gzip) formuliert, im Bauprüfer als **strukturelle Sperre** und als **Warnschwelle**
  (204.800 B) — drei verschiedene Anforderungen in zwei Dokumenten, nirgends zusammengeführt.

## 3. Eingriff

1. **Neu: `01-stand/abschlussmatrix.md`.** Je Kriterium eine Zeile mit **Zitat (wörtlich)**, Quelle,
   **Istwert (gemessen)**, Revision, Nachweis und Status. 19 Kriterienzeilen aus elf Konzepten und
   zwei Aktenstellen. Fünf zugelassene Statuswerte: `erfüllt`, `erfüllt mit Abweichung`,
   `verschoben`, `offen`, `ohne schriftliches Kriterium`.
2. **Das Startbudget ausdrücklich getrennt** (eigener Abschnitt): (1) identischer Bytewert —
   **nicht** eingehalten (136.961 → 150.082 B gzip), als *Abweichung* geführt, mit gemessenem Grund
   und Verweis auf die datierte Entscheidung ADR 0005; (2) kein neuer Engine-Startimport —
   eingehalten, in R7 mit Mutationsgegenprobe belegt; (3) unter der Warnschwelle — eingehalten.
   **Keine rückwirkende Umdeutung zur Erfüllung.**
3. **Prüfer** `scripts/akte-audit.mjs`, Regelkreis `abschluss` (in `npm run akte:check` = Teil von
   `check`): prüft je Zeile den Status gegen die fünf Werte, verlangt Istwert und Revision, prüft den
   Nachweis auf Existenz und — der Kern — **sucht jedes Zitat in seiner Quelle**. Zusätzlich: jedes
   Konzept mit Abnahmeabschnitt muss in der Matrix vertreten sein.

## 4. Prüfkette

| Prüfung | Ergebnis |
|---|---|
| `node --check scripts/akte-audit.mjs` | Exit 0 |
| `npm run check` | **Exit 0** — 719 Tests in 51 Dateien, 0 Lint-Fehler (109 Warnungen) |
| `npm run build` | **Exit 0** — Bundle-Audit bestanden |
| `npm run akte:check` | `abschluss: 19 Kriterienzeilen geprueft, jedes Zitat in seiner Quelle gefunden, 11 Konzepte mit Abnahmeabschnitt vertreten` |

## 5. Mutationsgegenproben — 5 von 5 erkannt, jede mit Wiederherstellung per Hash

| Mutation | Erwartete Meldung | Exit |
|---|---|---|
| Zitat heimlich umformuliert („hart codierten" → „fest verdrahteten") | „das Zitat steht nicht in der Quelle" | 1 |
| Zitat **verkürzt** (Auslassungszeichen statt des vollen Wortlauts) | „das Zitat steht nicht in der Quelle" | 1 |
| Status außerhalb der fünf Werte | „keiner der fuenf zugelassenen Werte" | 1 |
| Nachweis zeigt auf eine nicht vorhandene Datei | „fehlende Stelle" | 1 |
| Ein Konzept mit Abnahmeabschnitt fällt aus der Matrix | „fehlt aber in der Abschlussmatrix" | 1 |

**Der Prüfer fand einen echten Fehler in meiner eigenen Matrix:** die Zeile zum Desktop-Auskoppeln
zitierte das Breiten-Kriterium mit **Auslassungszeichen** statt im vollen Wortlaut — der Lauf brach
ab, ich habe den vollen Wortlaut eingesetzt. Genau der Fall, den die Karte meint („nicht still
entfernt", nicht heimlich gekürzt).

**Und eine zu schwache Gegenprobe, als solche benannt:** der erste Status-Mutationsversuch traf die
**Legendenzeile** statt der Matrixzeile (derselbe Wortlaut kommt in beiden vor) und lief deshalb grün
durch — kein Befund über den Prüfer, sondern ein ungültiger Mutationslauf. Nach dem Zielen auf das
Zeilenende ist der Fall aussagekräftig. Damit sind in diesem Durchzug **vier** zu schwache
Mutationsversuche aufgetreten und jedes Mal als Prüfmittel-Frage behandelt worden.

## 6. Abnahme der Karte, Punkt für Punkt

| Abnahmekriterium | Stand |
|---|---|
| Jedes ursprüngliche Kriterium hat belegt erfüllt/abweichend/ausdrücklich verschoben | **erfüllt** — 19 Zeilen, jede mit Status aus fünf Werten; `verschoben` (Breiten-Nachweis) und `erfüllt mit Abweichung` (Startbudget, Spanisch, Welle E) sind ausdrücklich so benannt |
| **nicht still entfernt** | **erfüllt und maschinell gesichert** — jedes Zitat muss in seiner Quelle vorkommen; zusätzlich muss jedes Konzept mit Abnahmeabschnitt in der Matrix stehen |
| D/E-Funktionsabnahme und neue Routen gesondert prüfen | **benannt** — die Matrix führt Kriterien und Status, die Funktionsabnahme bleibt je Übergabe und Protokoll; das steht ausdrücklich in der Matrix („Was diese Matrix nicht ist") |
| Alt-Audit der 54 Tools ersetzt das nicht | **benannt** — dasselbe Feld |
| Keine erneute Welle D/E bauen | **erfüllt** — nichts gebaut, nur bewertet |
| Keine harte Budgetverletzung ohne Beleg behaupten | **erfüllt** — die Abweichung ist auf 13.121 B beziffert und mit der Ursache (spätere Wellen) benannt |

## 7. Bewusst nicht getan / Grenzen

- **Keine Kriterien neu gesetzt und keine bestehenden geändert.** Wo ein Kriterium nicht erfüllt ist,
  steht die Abweichung — nicht eine angepasste Anforderung.
- **19 Zeilen sind nicht alle Kriterien des Projekts.** Aufgenommen sind die Kriterien, die sich
  **prüfbar** zitieren lassen; die Handwerk-Wellen A–D und Wellen ohne Kriterienabschnitt stehen als
  `ohne schriftliches Kriterium` bzw. sind nicht erfasst. Der Prüfer erzwingt die Abdeckung je
  **Konzept mit Abnahmeabschnitt**, nicht je Kriterium.
- **Ein einzelnes entferntes Kriterium** innerhalb eines abgedeckten Konzepts fällt nur auf, wenn
  seine Zeile ein Zitat trägt, das nicht mehr stimmt. Ein ersatzlos gestrichenes Kriterium, dessen
  Konzept noch vertreten ist, bleibt unbemerkt — die Grenze ist benannt.
- **Der Status ist Handarbeit.** Der Prüfer prüft Form, Zitat und Nachweisweg; ob „erfüllt" stimmt,
  entscheidet der Beleg, nicht das Skript.

## 8. Git

- Code: `scripts/akte-audit.mjs` (Regelkreis `abschluss`) — Hash siehe `work/r8-fortschritt.md`
- Akte: `uebergabe/01-stand/abschlussmatrix.md` (neu), dieses Protokoll
- **Nichts gepusht.**
