# Fortschrittsprotokoll: Barrierefreiheits-Durchgang der Suite „Handwerk"

**Datum:** 2026-10-06  
**Status:** abgeschlossen (Suite „Handwerk" befundfrei; Befunde außerhalb der Suite offen gemeldet)

## Umfang

Auftrag: „erst 2 dann 1" — zuerst die kleine Aufräumarbeit (Layout-Stilerscheinung, spanisches
Gegenlesen, Barrierefreiheit), danach Welle D. Dieser Bericht deckt den **Barrierefreiheits-Teil**
ab: die zehn Handwerk-Werkzeuge, gemessen bei 1360 px und 390 px in Edge headless über CDP gegen
`npm run preview`. Zusätzlich wurde der Durchgang über **alle 54 Routen** gefahren, um den Umfang
außerhalb der Suite zu kennen (54 Routen × 2 Breiten = 108 Durchgänge).

Anleitungen vor der Arbeit gelesen: `uebergabe/02-architektur/werkzeug-erstellen.md` (§5 Abnahme:
„Tastatur, Fokus, Screenreader-Namen, 200 % Zoom, 320/360 px Mobilbreite und Desktop"),
`uebergabe/02-architektur/sprachpakete.md` (§9 visuell und funktional),
`docs/ui-system.md` (§Accessibility baseline: 44 px Mindestgröße für Bedienziele).

**Kein neues Werkzeug:** Der vorhandene Belegapparat `scripts/viewport-audit.mjs`
(`npm run viewport:check`) wurde um einen zweiten Durchgang erweitert — Bedienzielgrößen,
zugängliche Namen, Feldbeschriftungen, Überschriftenfolge, Kontrastfarben und abgeschnittener
Inhalt. Aufruf: `npm run a11y:check`.

## Ergebnisse

### Der Prüfer selbst hatte zwei Fehler — beide gefunden und behoben

1. **Er prüfte eine leere Seite und hätte das als Erfolg gemeldet.** Die Vorgabe-Adresse des
   Skripts ist `http://127.0.0.1:5173`; die Vorschau (`vite preview`) lauscht auf diesem Rechner
   aber nur auf **IPv6** (`[::1]`). Ergebnis: 20 Durchgänge ohne Inhalt. Aufgefallen ist das nur,
   weil der Durchgang **mit dem Fehlercode 2 abbricht**, wenn eine Route keinen prüfbaren Inhalt
   liefert — ohne diesen Wächter hätte der Lauf „bestanden" gemeldet, ohne eine einzige Seite
   anzusehen.
2. **Er hielt Inhalte in geschlossenen `<details>` für sichtbar.** Chromium versteckt sie über
   `content-visibility`, nicht über `display` — `getBoundingClientRect()` liefert weiter ein
   Rechteck. Deshalb meldete der Durchgang zunächst einen Überschriften-Sprung, der im
   Anfangszustand gar nicht besteht. Prüfung jetzt über `Element.checkVisibility()`. Dieselbe
   Schwäche steckte im **Überbreiten-Durchgang** (`viewport:check`) und ist dort ebenfalls behoben.

### Befunde in der Suite „Handwerk" und ihre Behebung

Alle drei befunden Kategorien betreffen **gemeinsame Bausteine**, nicht einzelne Werkzeuge:

- **Bedienziele unter 44 px** (6–11 je Route, identisch über alle zehn Werkzeuge):
  `summary` der aufklappbaren Abschnitte 21 px, der Absende-Knopf „Berechnen" 27 px,
  Textknöpfe (Zurück, Vorschlagswerte zurücksetzen, Impressum, Lizenzen) 20–21 px,
  Kopfzeilenknöpfe 21–32 px. Behoben mit zwei Regeln in `apps/web/src/styles.css`:
  `button { min-height: 2.75rem }` (die Aktionsknöpfe tragen keine Klasse, deshalb am Element)
  und `details.settings-card > summary { padding-block: var(--space-3) }` (Innenabstand statt
  fester Höhe, damit der Aufklapp-Pfeil bleibt und mehrzeilige Kopfzeilen mitwachsen).
- **Überschriftenfolge h1 → h3.** Die Überschrift „Annahmen" in „Formel und Quelle" stand als
  `h3`, ohne dass ein `h2` davorsteht — sichtbar wird das erst beim Aufklappen, weshalb die
  Prüfung zusätzlich mit **geöffneten** Abschnitten misst. Betroffen waren **17 von 54 Routen**
  (zehn Handwerk plus sieben Rechner). Umgestellt auf `h2` in genau diesen 17 Dateien.
  **Aufmaß bleibt unverändert:** dort steht ein `h2` (`tool.aufmass.totals`) davor, die Messung
  meldet keinen Sprung — die Prüfung hat hier also nicht pauschal, sondern begründet angeschlagen.
- **Kontrast:** In der Suite kein Befund.

### Befunde außerhalb der Suite (nicht behoben, gemeldet)

- **Weiße Schrift auf dem Markenrot hat 3,28:1** (nötig 4,5:1 für 16 px/700). Betrifft
  `.button.primary`, `.button.active` und `.segmented .active` — also jeden Hauptknopf im ganzen
  Projekt (38 Vorkommen in 14 Routen). Das ist eine **Farbentscheidung**, kein Fehler im Code:
  entweder dunkleres Rot für Flächen oder dunkle Schrift auf dem Rot. Nicht eigenmächtig geändert.
- **Der Absende-Knopf ist ungestylt.** `<button type="submit">` trägt in **allen 18** Rechner- und
  Handwerk-Werkzeugen keine Klasse; es greift keine Regel, der Knopf trägt die Browser-Vorgabe
  (grau, 400er Schrift). `docs/ui-system.md` verlangt „the primary action is visually dominant"
  — im Bild ist sie das nicht. Das ist eine Gestaltungsentscheidung und wurde deshalb nur
  gemeldet, nicht geändert.
- **Weitere Bedienziele unter 44 px** außerhalb der Suite: Schieberegler (`input[type=range]`)
  mit 16 px Höhe und Kontrollkästchen mit 18 × 18 px in acht Bild-/PDF-Werkzeugen, Tastenfelder
  im Programmiererrechner 25–34 px breit.
- **Abgeschnittener Inhalt:** vier Vorkommen `button.keypad-key.operator` (42 px breit, Inhalt
  50–53 px) im Programmiererrechner.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Durchgänge Handwerk-Suite | 10 Routen × 2 Breiten | `a11y-handwerk-nachher.txt` |
| Befunde Handwerk, vorher | 6–11 Bedienziele unter 44 px und 1 Überschriften-Sprung je Route und Breite | `a11y-handwerk-vorher.txt` |
| Befunde Handwerk, nachher | **0** (alle Kategorien) | `a11y-handwerk-nachher.txt` |
| Durchgänge Projekt (54 Routen × 2) | 108 | `a11y-projekt-…-teil1–3.txt` |
| Routen ohne Befund / mit Befund | 23 / 31 | dieselben Belege |
| Befunde gesamt | 64 Bedienziele, 38 Kontrast, 34 Überschriften-Sprünge, 4 abgeschnitten | Auswertung `work/a11y-auswerten.cjs` |
| Zugängliche Namen fehlend | 0 (kein einziges Vorkommen im ganzen Projekt) | dieselben Belege |
| Feldbeschriftungen fehlend | 0 | dieselben Belege |
| Tests | 440 in 30 Dateien bestanden | `npm run check` |
| Build | EXIT 0, Startlast 146.992 B gzip von 204.800 | `npm run build` |
| `git diff --check` | keine Whitespace-Fehler | Projektbefehl |

## Relevante Verweise

- Commits: siehe „Git" im Sitzungsbericht (Durchgang, Behebung, Belege)
- Konzept: `03-konzepte/2026-10-03-handwerkerwerkzeuge.md`
- Vorlage: `docs/ui-system.md` §Accessibility baseline; `02-architektur/werkzeug-erstellen.md` §5
- Belege: `06-protokolle/screenshots/2026-10-06-a11y-handwerk/` (zwei Seitenaufnahmen vorher/nachher,
  fünf Messprotokolle)
- Messwerkzeuge: `scripts/viewport-audit.mjs` (`npm run a11y:check`), `work/a11y-auswerten.cjs`,
  `work/a11y-probe.cjs`, `work/details-sichtbarkeit-probe.cjs`

## Folgemaßnahmen

- [ ] Kontrast der Markenfarbe entscheiden (dunkleres Rot für Flächen oder dunkle Schrift) — betrifft
      jeden Hauptknopf im Projekt.
- [ ] Gestaltung der Hauptaktion entscheiden (Klasse `button primary` an 18 Absende-Knöpfen oder
      eine Regel für `button[type="submit"]`).
- [ ] Bedienziele außerhalb der Suite nachziehen: Schieberegler, Kontrollkästchen, Tastenfelder.
- [ ] Abgeschnittenen Inhalt im Programmiererrechner beheben.
- [ ] `npm run a11y:check` in den Prüfablauf der Wellen aufnehmen (läuft nur bei laufender Vorschau,
      wie `viewport:check`).
