# Übergabe: Suite „Rechnen" — Welle 1 (Rechenkern und Hauptrechner)

**Datum:** 2026-10-03  
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)  
**Status:** teilweise — Welle 1 abgeschlossen, Wellen 2–5 offen

## Ziel der Sitzung

Auftrag von Thomas: **Wellen 1–5 der Rechner-Suite durchführen**, mit dem vorgegebenen
Rhythmus — vor jeder Welle Lizenzen prüfen, nach jeder Welle Funktion, Dokumentation,
Sprachdateien und Designkonzept prüfen.

Grundlage: Konzept `03-konzepte/2026-10-03-taschenrechner-suite.md`,
Roadmap-Phase 2, **ADR 0005** (mathjs aus kuratierten Factories).

## Ergebnis

**Welle 1 ist gebaut, geprüft und im Browser abgenommen.** Der Rechner existiert als erstes
Werkzeug der Suite „Rechnen" — mit den Modi Standard und Brüche, Verlauf, benannten Variablen
und dem Pflichtbaustein „Formel und Quelle".

Nachgewiesen im echten Browser (Edge 154 headless über CDP, drei Konfigurationen):
`2^3^2` = **512** (rechtsassoziativ korrekt), keine Konsolenfehler, bei 1360 px und 420 px,
hell und dunkel. Die Sichtprüfung fand einen echten Fehler (unübersetzter Kategorienschlüssel),
der behoben und erneut geprüft wurde.

## Geänderte Bereiche

- `packages/core/src/index.ts` – Kategorie `calculator` ergänzt
- `packages/tools/src/calculator/functions.ts` – **neu**: 31 kuratierte mathjs-Factories
  (ohne `help`), 23 Prüfausdrücke, Factory-Namensliste
- `packages/tools/src/calculator/core.ts` – **neu**: Rechenkern (`evaluate`, `toFraction`,
  `withVariable`), Fehlerklassifikation, Instanz-Cache; einzige Ladegrenze zu mathjs
- `packages/tools/src/calculator/history.ts` – **neu**: Verlauf (Ringpuffer 200), Variablen,
  Einstellungen — drei getrennte Speicherbereiche über `idb-keyval`
- `packages/tools/src/calculator/locales/{de,en,es,index}.ts` – **neu**: Texte in drei Sprachen
- `packages/tools/src/locales.ts`, `packages/tools/src/catalog/manifests.ts`,
  `packages/tools/package.json` (drei neue Unterpfade) – erweitert
- `packages/i18n/src/suites/{de,en,es}.ts` – Suite „Rechnen"/„Calculation"/„Cálculo"
- `packages/i18n/src/common/{de,en,es}.ts` – `category.calculator` (nach der Sichtprüfung)
- `apps/web/public/tools/calculator.svg` – **neu**
- `apps/web/src/tools/Calculator.tsx` – **neu**: Oberfläche, Rechenkern **dynamisch** geladen
- `apps/web/src/App.tsx` – Route als `lazy`
- `apps/web/src/calculator-core.test.ts` – **neu**: 8 Tests
- `licenses/registry.json`, `apps/web/public/licenses/registry.json`, `THIRD_PARTY_NOTICES.md`
  – durch `licenses:generate` erzeugt

## Entscheidungen und Annahmen

- **Kuratierte Factories statt Vollbündel** (ADR 0005): 185,3 → 89,5 KiB gzip gemessen.
  `helpDependencies` bleibt draußen — die eingebettete Hilfe sind englische Anzeigetexte und
  verstoßen gegen die Projektregel.
- **Zwei Zahlenmodelle, kein Gleitkomma:** Standard = `BigNumber` (64 Stellen),
  Brüche = `Fraction`. Damit ist `0,1 + 0,2` = `0,3` beziehungsweise `3/10`.
- **Der Rechenkern wird ausschließlich dynamisch geladen** — nur über die Unterpfade
  `calculator/{core,functions,history}`, **nie** über `@commietools/tools`.
- **Verlauf als Ringpuffer mit 200 Einträgen** — kein Aufräumen nötig, die Datenbank wächst nicht.
- **Variablen statt Speicherbänke** `M1…M5`.
- **Annahme:** Der Verlauf gehört in Welle 1. Das Konzept lässt offen, ob Werkzeug 9 einen
  eigenen Verlauf braucht; der eigene Speicherbereich ist vorbereitet, aber nicht angelegt.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `licenses:check` (vor der Welle) | 520 Pakete, 16 Lizenztexte, 187 Dokumente — bestanden |
| `catalog:check` | 26 Werkzeuge, 3 Sprachen, 26 Symbole, 77 Dateitypen — bestanden |
| `npm run check` | bestanden: Lizenz, Katalog, Typen, **160 Tests** (12 Dateien) |
| `npm run build` | bestanden; `Bundle audit passed: entry 191327 B gzip` |
| Startbündel | **185,4 KiB gzip** — nicht gewachsen (vorher 185,6 KiB) |
| Route Rechner | **94,3 KiB gzip** (Calculator 1,7 + mathjs 92,6) |
| mathjs im Startbündel? | **nein** — `typed-function`, `bignumber`, `DecimalError`, `parseDependencies` je 0 Treffer; die Texttreffer sind die Quellenangabe im Sprachkatalog |
| Artefaktprüfung Edge headless | 3 von 3 Konfigurationen: `2^3^2` = 512, kein Konsolenfehler |
| Sichtprüfung | Fehler gefunden und behoben (s. u.), danach erneut geprüft |
| Fehlschlagproben | **nicht durchgeführt** (steht für die nächste Sitzung aus) |

**Zwei echte Fehler, die die Tests fanden:**
1. `1/0` wirft im BigNumber-Modell nicht, sondern ergibt `Infinity` — die Fehlerklassifikation
   lief daran vorbei; nicht-endliche Ergebnisse werden jetzt abgefangen.
2. `withVariable` parste ohne Optionen; `2,80` wurde im Bruchmodell zu `14/5`. Die Optionen
   werden jetzt durchgereicht.

**Ein Fehler, den die Sichtprüfung fand:** Die neue Kategorie erschien als
`CATEGORY.CALCULATOR` — `category.calculator` fehlte in den Plattformtexten. Dreisprachig
ergänzt und nachgeprüft.

**Eine falsche Erwartung von mir:** Ich hatte `1/3 + 1/6 = 0.5` erwartet. Der Bruchmodus
liefert korrekt `1/2` — der Test hatte recht.

## Offene Punkte und Risiken

- [ ] **Wellen 2–5 sind nicht begonnen.** Geschätzt 8–13 weitere Sitzungen.
- [ ] **Fehlschlagproben für Welle 1 fehlen.** Nach der Projektregel ist eine Prüfung erst
  belegt, wenn sie absichtlich verletzt wurde und **mit der erwarteten Meldung** scheitert.
  Für den Rechner: Ausdruck aus der Factory-Liste entfernen, `check` muss den Aufruftest
  scheitern lassen.
- [ ] **`bundle-audit.mjs` kennt die Rechner-Route nicht.** Heute prüft es nur das Startbudget
  und die PDF-Engines. Ein Engine-Budget für die Rechner-Route ist noch nicht eingetragen —
  die 94,3 KiB sind gemessen, aber nicht erzwungen.
- [ ] **Barrierefreiheit ist nur teilweise belegt.** Tastaturbedienung funktioniert (Formular,
  Knöpfe, ARIA-Rollen), aber Fokusreihenfolge und Vorlesbarkeit sind nicht systematisch geprüft.
  Die Roadmap sieht das als Voraussetzung vor.
- [ ] Der Verlauf ist im Browser **nicht** über das Neuladen hinweg geprüft (die Prüfung deckte
  Auswertung, Layout und Farbschema ab).
- [ ] Das Abnahmekriterium „Route ≤ 95 KiB" ist **knapp**: eigene Messung 94,3 KiB (gzip -9),
  Vite-Ausgabe 96,02 kB. Bei der nächsten Factory-Erweiterung zuerst messen.

## Empfohlener nächster Schritt

1. **Fehlschlagprobe** für die Factory-Liste und **Engine-Budget** in `bundle-audit.mjs`
   eintragen — Welle 1 dann abschließen.
2. **Welle 2:** wissenschaftlich, Programmierer, RPN — mit vollständiger Funktionsliste und
   Aufruftest je Funktion, Dateien und Layout gemäß der Projektstruktur.

## Git

- Commit: **noch nicht committed**
- Arbeitsbaum: enthält die Dateien dieser Welle sowie die Konzepte, ADR 0005 und die Roadmap;
  zusätzlich unverändert fremde Untracked-Ordner (`.codex-remote-attachments/`, `tmp/`, `work/`)
