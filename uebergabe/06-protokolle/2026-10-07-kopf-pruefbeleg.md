# Kopf-Prüfbeleg — Stand für die externe Prüfung (QM-Sanierung R1–R10)

Datum: 2026-10-07 · erstellt von Faber (Hermes Agent) auf Anweisung von Thomas

**Zweck:** eine **versionierte** Zusammenfassung der Prüfungen am eingefrorenen Stand, damit ein
externer Prüfer die Angaben nachfahren kann, ohne Sitzungsprotokolle zu durchsuchen. Die
Einzelnachweise stehen in den Protokollen; hier stehen die Kommandos und ihre gemessenen Ergebnisse.

## 1. Stand

| Größe | Wert |
|---|---|
| Kopf (Code + Belegwerkzeug) | **`ca3b23b`** |
| Abstand zu `origin/main` | **148 Commits** (gemessen bei `ca3b23b` mit `git rev-list --count origin/main..HEAD`) |
| Arbeitsbaum | sauber bis auf zwei **bewusst** ignorierte Prüfdateien (siehe `.gitignore`) |
| Veröffentlicht | **nichts** — `main` ist der Produktionsbranch; der Push erfolgt erst nach der unabhängigen Abschlusskontrolle |

## 2. Prüfkette (gemessen am Kopf `ca3b23b`, Logs unter `tmp/`)

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **Exit 0** · 54 Prüfdateien, **733 Tests**, **0 Lint-Fehler**, 110 Hinweise |
| `npm run build` | **Exit 0** · Eingang **149 755 B gzip**, „Bundle audit passed" |
| `npm run akte:check` | **Exit 0** · vier Regelkreise (`listen`, `uebergabe`, `korrektur`, `abschluss`) |

Die Logdateien selbst liegen unter `tmp/` und sind **nicht** versioniert (Projekt-`.gitignore`).
Versioniert sind die **Marker** hier und in den Protokollen.

## 3. Belege gegen den ausgelieferten Bau (Vorschaudienst)

Aufruf je Beleg: `npm run build`, dann `npm run preview` und in einem zweiten Terminal
`npm run beleg:<name>`.

| Beleg | Ergebnis | Ausgabe |
|---|---|---|
| `npm run beleg:zusammenlegung` | **BELEG ERBRACHT** (Exit 0) — Anzeigeform, Katalog- und Menüsuche, Ergebnis-Adresse | `06-protokolle/screenshots/2026-10-07-r9-u1-portiert/` |
| `npm run beleg:routing` | **BELEG ERBRACHT** (Exit 0) — unbekannte Adresse, zwei Werkzeuge, Prototyp-Namen | `06-protokolle/screenshots/2026-10-07-r9-u2-portiert/` |

Diese beiden Läufe sind **nach dem Umzug der Skripte** (aus `tmp/` nach `scripts/belege/`, siehe
Abschnitt 4) gefahren: sie beweisen, dass die **versionierten** Fassungen laufen. Die ursprünglichen
Ordner `…-u1/` und `…-u2/` bleiben unberührt (Aktenregel „ergänzen statt umschreiben").

## 4. Belegwerkzeug ist versioniert und portabel

Commit `ca3b23b`. In `scripts/belege/` liegen jetzt: `cdp-harness.mjs`, `voraussetzungen.mjs`,
`zusammenlegung-beleg.mjs`, `routing-beleg.mjs`, `mutation-zusammenlegung.mjs`,
`mutation-routing.mjs`, `kartenstand.mjs`, `sprachpakete-netzbeleg.mjs`, `rechner-kern-groesse.mjs`
(und `README.md`). Alle **ESM**, Pfade relativ zum Ablageort, Browserprogramm aus
`COMMIETOOLS_BROWSER`, Exit 2 bei fehlender Voraussetzung.

**Warum das ein eigener Punkt ist:** die Belege dieser Stufe lagen zuerst unter `tmp/` — nicht
versioniert — und die Protokolle zitierten von dort. Das ist dieselbe Lücke, die Karte **M10-004**
beschreibt, eine Stufe später. Der Vorgang steht in den Protokollen von R9 als datierter Zusatz.

## 5. Kartenstand (gezählt, nicht fortgeschrieben)

```
npm run beleg:kartenstand
```

Ergebnis am 2026-10-07: **59 Karten — 58 erledigt · 1 Restforderung (M8-001) · 0 offen.**
Das Skript zählt die Tabellen der Leitdatei zeilenweise.

**Korrektur, die dabei auffiel (gemeldet, nicht verschwiegen):** unmittelbar nach dem Abschluss von
R10 stimmte die **Tabellenzeile** der Karte M8-005 noch nicht mit der Überschrift überein (`○` statt
`✓`); der erste berichtete Kartenstand war damit einen Schritt zu früh. Die Zeile ist korrigiert, die
Zahl stimmt seither und ist mit dem Zähler belegbar.

## 6. Was dieser Beleg **nicht** behauptet

- **Kein Versandnachweis für NEL.** Die Richtlinie ist gemessen (Kopfzeilen der lebenden Seite), ein
  tatsächlicher Berichtsversand wurde **nicht** provoziert (die Karte erlaubt eine Fehlerprobe nur auf
  eigener Testumgebung). Siehe `06-protokolle/2026-10-07-r10-oeffentliche-header.txt`.
- **Keine Aussage über den veröffentlichten Stand.** Die lebende Seite ist `origin/main` und damit
  älter als dieser Kopf; die Header-Messung beschreibt den Betrieb.
- **Die portierten Mutationsgegenproben sind nicht erneut gefahren.** Sie sind syntaxgeprüft
  (`node --check`) und lint-sauber (`eslint scripts/belege/`); ihre **inhaltlichen** Belege stammen
  aus den Läufen **vor** dem Umzug (identische Logik) und stehen mit `AssertionError`-Zeilen in den
  Protokollen M4-009 und M4-010. Nachfahren im **Vordergrund** (je Lauf 5–10 Minuten):
  `npm run beleg:mutation-zusammenlegung` und `npm run beleg:mutation-routing`. Im **Hintergrund**
  bricht ein direkter `node`-Aufruf in dieser Umgebung ab („stdin is not a tty", Exit 1, ohne
  Wirkung) — das ist eine Eigenheit der Shell, kein Befund über das Skript.

  *Berichtigung 2026-10-07 (Faber, unmittelbar danach — der Satz oben war beim Schreiben richtig und
  ist es nicht mehr):* **Beide portierten Gegenproben sind inzwischen gefahren.**
  M4-009: **drei von drei** gegriffen, M4-010: **vier von vier** gegriffen, jeweils mit
  `AssertionError`-Zeile. Versionierte Belege:
  `06-protokolle/mutationen-zusammenlegung-2026-10-07.txt` und `…-routing-2026-10-07.txt`.
  Die Umgebungsnotiz (Vordergrund statt Hintergrund) bleibt gültig und ist der Grund, warum der
  M4-009-Lauf zunächst kein Ergebnis hinterließ.
- **Keine Bewertung von Recht oder Datenschutz.** Die Karte verbietet ausdrücklich, aus einer
  NEL-Kopfzeile allein eine Rechtsfolge abzuleiten.

## 7. Nachfahren in fünf Schritten

```bash
npm ci                      # oder vorhandenes node_modules nutzen
npm run check               # erwartet: Exit 0, 54 Dateien, 733 Tests, 0 Lint-Fehler
npm run build               # erwartet: Exit 0, Eingang 149755 B gzip
npm run akte:check          # erwartet: Exit 0, vier Regelkreise
npm run beleg:kartenstand   # erwartet: 59 Karten — 58 erledigt, 1 Restforderung, 0 offen
```

Für die Seitenbelege zusätzlich `npm run preview` in einem zweiten Terminal, dann
`npm run beleg:zusammenlegung` und `npm run beleg:routing` (erwartet: „BELEG ERBRACHT").

---

*Nachtrag 2026-10-07 (Faber, nach den zugehörigen Akten-Commits — gemessen, nicht geschätzt):*
Codestand bleibt **`ca3b23b`** (die Commits danach tragen **nur** Akten). Kopf des Aktenstands:
**`7a9f19c`**, **150 Commits vor `origin/main`**. Kartenstand erneut gezählt mit
`npm run beleg:kartenstand`: **59 Karten — 58 erledigt · 1 Restforderung (M8-001) · 0 offen**.
Arbeitsbaum: **sauber** (`git status --porcelain` leer; die zwei M4-005-Prüfdateien sind jetzt in
`.gitignore` festgeschrieben). `npm run akte:check`: Exit 0.

**Einstieg für die Prüfung:** `uebergabe/00-einstieg/vorgehen-qm-audit.md` (Leitdatei mit Kartenstand),
`uebergabe/01-stand/offene-punkte.md` (offene Punkte), `uebergabe/05-uebergaben/` (Übergaben je Stufe),
`uebergabe/06-protokolle/` (Belege je Karte) und dieser Beleg als Ablaufanleitung.
