# Fortschrittsprotokoll: Welle D, Werkzeug 1 — Prüffristen (`inspection`)

**Datum:** 2026-10-06  
**Status:** abgeschlossen (erstes von drei Werkzeugen der Welle D)

## Umfang

Werkzeug **23 (Prüffristen-Checkliste)** aus dem Konzept der Handwerkerwerkzeuge, Welle D
„Dokumentation". Ziel, Umfang und Abnahmekriterien standen vorab fest
(`06-protokolle/2026-10-06-welle-d-plan.md`); gebaut wurde gegen genau diese Kriterien.

Vor der Umsetzung gelesen: `02-architektur/werkzeug-erstellen.md` §1–§5,
`02-architektur/sprachpakete.md`, `docs/ui-system.md`.

## Ergebnis

Ein neues Werkzeug in der bestehenden Suite „Handwerk": **Prüffristen** (`inspection`,
`/tools/inspection`, Kategorie `craft`). Liste wiederkehrender Prüfungen je Gegenstand mit
Intervall und letzter Prüfung; die Oberfläche rechnet den nächsten Termin, die Resttage und die
Einordnung **überfällig / bald fällig / in Ordnung** und exportiert die Liste als Tabelle.

**Bewusste Grenzen, sichtbar im Werkzeug:**
- **Keine vorgeschlagenen Intervalle.** Prüffristen stammen aus der Gefährdungsbeurteilung des
  Betreibers und aus den Unfallverhütungsvorschriften (Konzept Q2: nicht frei übernehmbar). Ein
  geratener Vorschlag wäre hier gefährlich statt hilfreich — das Werkzeug rechnet nur, was
  eingegeben wird, und sagt das in seinen Annahmen.
- **Keine Erinnerung.** Ohne Server kann das Werkzeug nicht erinnern; es zeigt beim Öffnen, was
  fällig ist, speichert die Liste im Browser und verweist für Erinnerungen auf den Export. Der Satz
  steht als erster Absatz der Seite, nicht in einer Fußnote.
- **Keine Normtabellen**, keine Rechtsauskunft.

**Wiederverwendet statt neu gebaut:** `idb-keyval` (Speicher, wie beim Aufmaß), `loadTemporal()`
und `addToDate` aus `calculator/dates.ts` (Monatsarithmetik — nur so stimmt 31.01. + 1 Monat),
`SaveFileControl` (Dateiname editierbar, Speichern-unter mit Rückfall), die gemeinsamen
`tool.craft.*`-Texte. **Keine neue Abhängigkeit.**

## Abnahmekriterien — Prüfung im Browser

Beleg: `work/prueffristen-beleg.cjs` gegen `npm run preview` (Edge headless über CDP);
Protokoll und Aufnahme in `06-protokolle/screenshots/2026-10-06-welle-d-prueffristen/`.

| Kriterium | Ergebnis |
|---|---|
| 1. Einträge überleben ein Neuladen | **erfüllt** — zwei Einträge vorher/nachher 2/2 mit unveränderten Werten (`Leiter Halle 2` / `Prüfmittel Nr. 12`) |
| 2. Einordnung stimmt gegen feste Daten | **erfüllt** — 2024-06-30 + 12 Monate = 2025-06-30 → **463 Tage überfällig · Überfällig**; 2026-09-01 + 6 Monate = 2027-03-01 → **146 · In Ordnung** (beide Zahlen unabhängig nachgerechnet) |
| 3. Intervall über Monatsenden und Jahreswechsel | **erfüllt** — 31.01. + 1 Monat = 28.02. (2026), 29.02. im Schaltjahr (2024), 15.12. + 3 Monate = 15.03. des Folgejahres; je ein Test |
| 4. Export enthält genau die sichtbaren Zeilen, Datum im Sprachformat | **erfüllt** — Datei `prueffristen.csv` im Beleg geschrieben und gelesen: UTF-8-Marke vorhanden, Semikolon, Kopfzeile deutsch, Zeilen `30.06.2024 / 30.06.2025 / -463` und `01.09.2026 / 01.03.2027 / 146` |
| 5. Kein Netzverkehr beim Arbeiten | **erfüllt** — 45 Anfragen, **0** an fremde Hosts, keine Seitenfehler |
| 6. Prüfläufe | **erfüllt** — `npm run check` 460 Tests in 31 Dateien, `npm run lint` sauber, `npm run build` EXIT 0 (Startlast 147.085 B gzip von 204.800, Bündelprüfung bestanden), `a11y:check` je 2 Breiten **ohne Befund** (helles und dunkles Schema), `viewport:check` bei 320 px bestanden |
| 7. Drei Sprachen vollständig | **erfüllt** — `catalog:check` bestanden: **55 Werkzeuge, 3 Sprachen, 55 Symbole**; `summary` und `terms` je Sprache, je Werkzeug mindestens ein `#Tag` |

## Zwei eigene Fehler, die die Prüfung gefunden hat

1. **`tool.craft.settings` gibt es nicht.** Der gemeinsame Handwerk-Textblock führt keinen
   Schlüssel „settings"; die Kopfzeile hätte **den Schlüsselnamen** angezeigt — genau die
   Fehlerklasse, die im Projekt schon einmal zwölf Werkzeugflächen beschädigt hat. Gefunden beim
   Nachlesen des eigenen Codes, vor der Prüfung; korrigiert auf `tool.inspection.settings`.
2. **Doppelte Spaltenbeschriftungen.** In jeder Tabellenzeile stand über jedem Eingabefeld noch
   einmal der Spaltenname, obwohl die Kopfzeile ihn bereits trägt. Gefunden **im Bild**, nicht in
   den Zahlen: die Barrierefreiheitsprüfung war in beiden Schemata grün. Behoben: die
   Feldbeschriftung ist jetzt ein `aria-label` am Feld, die sichtbare Benennung liefert die
   Kopfzeile.

**Dazu eine Lehre für Belegskripte:** Der erste Beleglauf fand die Schaltfläche „Eintrag
hinzufügen" nicht — mein Suchmuster war groß-/kleinschreibungssensitiv (`/Hinzufügen/`), die
Schaltfläche heißt aber „Eintrag **h**inzufügen". Die Diagnose mit `/…/i` fand sie sofort. Ein
Muster in einem Belegskript gehört mit `i` geschrieben oder über ein stabiles Merkmal gesucht. Der
Beleg prüft die Beschriftung außerdem gegen `tool.`-Präfix, damit ein nicht geladener Sprachschlüssel
sofort auffällt.

**Nicht reproduzierbar ohne Zutun:** Der Speichern-Dialog (`showSaveFilePicker`) lässt sich im
kopflosen Browser nicht bedienen; der erste Beleglauf schrieb mal eine Datei, mal nicht. Für den
Beleg wird deshalb der **dokumentierte Ausweichweg** (gewöhnlicher Browser-Download) erzwungen und
der Statussatz („Download gestartet.") mitgelesen. Der Dialogweg selbst bleibt eine manuelle
Prüfung.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Neue Dateien | 6 (`craft/inspection.ts`, `craft/inspectionStore.ts`, 4 Sprachdateien) + Oberfläche, Symbol, Test | Zählung |
| Tests für das Werkzeug | 20 (Prüffristen) von 460 gesamt | `npm run check` |
| Werkzeuge im Register | 55 (vorher 54) | `catalog:check` |
| Symbole | 55 | `catalog:check` |
| Werkzeugtexte je Route | deutsch 5.207 B gzip von 30.720 (unverändert im Rahmen) | `npm run build` |
| Startlast | 147.085 B gzip von 204.800 | `npm run build` |
| Speicherbereich | `inspection.items.v1` (Liste + Warnschwelle), strukturell geprüft beim Lesen | `inspectionStore.ts` |
| Grenzwerte | Intervall 1–120 Monate, Warnschwelle 1–365 Tage, 200 Einträge, Notiz 200 Zeichen — **jeder mit eigener Prüfzeile** | `inspectionLimits` + Tests |

## Relevante Verweise

- Commit: siehe „Git" im Sitzungsbericht
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md` (Welle D), Plan `06-protokolle/2026-10-06-welle-d-plan.md`
- Belege: `06-protokolle/screenshots/2026-10-06-welle-d-prueffristen/` (Aufnahme, Belegprotokoll, Beispiel-Export)
- Mess-/Belegwerkzeug: `work/prueffristen-beleg.cjs`

## Folgemaßnahmen

- [ ] Welle D, Werkzeug 2: Baustellenfoto-Beschrifter (`photo-caption`) — Speichergrenze **messen**.
- [ ] Welle D, Werkzeug 3: Abnahme-/Mängelprotokoll (`acceptance-report`) — vorher die Zeichenfläche
      aus `PdfPlacementTools.tsx` als gemeinsamen Baustein herausziehen.
- [ ] Spanische und englische Texte des neuen Werkzeugs stehen unter der entschiedenen
      unpersönlichen Anrede; die sprachliche Abnahme der spanischen Fassung bleibt offen (wie für
      die übrigen Werkzeuge).
