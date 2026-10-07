# Übergabe: R5 zur Hälfte durchgezogen — sechs Karten abgeschlossen, zwei offen

**Datum:** 2026-10-07
**Bearbeitet durch:** Faber (Hermes, Team 2)
**Auftrag:** Thomas, wörtlich: „R5 durchziehen"
**Status:** **teilweise abgeschlossen** — sechs von acht Karten erledigt (M7-006, M2-008, M2-007,
M7-005, M2-006, M7-002). Offen: M7-003, M7-004. Der Durchzug wurde auf Wunsch von Thomas beendet
(Sitzungsabschluss), **nicht** wegen eines fachlichen Hindernisses.
**Sitzung:** `20261007_000828_ba61cf44` · telegram · 9 h 8 min · 1,8053 USD (geschätzt) · 496 API-Aufrufe

## Ziel der Sitzung

R5 (Barrierefreiheit und Designsystem) vollständig abarbeiten: acht offene Karten, jede mit
**gemessenem** Beleg, Akte und getrennten Commits (Code / Akte), nichts pushen.

## Ergebnis

Sechs Karten abgeschlossen, davon **eine mit benannter Grenze** (M2-006: echter Vorleserlauf nicht
herstellbar). Zwei Karten (M7-003, M7-004) sind **nicht** begonnen — der Anknüpfungspunkt steht in
`work/r5-fortschritt.md` und unten unter „nächster Schritt".

**Neu eingeführte, dauerhafte Prüfungen:** `npm run tokens:check` (Pflichtteil von `npm run check`)
prüft ungelöste CSS-Variablen **und** Rohfarben ohne begründete Ausnahme.

**Gefundene Produktfehler, die keine Karte nannte** (mitbehoben und gemeldet):
- Der Werkzeugschubkasten hatte **keine Innenabstände** (18 ungültige `var()`-Deklarationen).
- **1200 Objekt-URLs** blieben offen, wenn ein PDF-Auftrag beim Verlassen der Route noch lief.
- Weiße Beschriftung auf Markenrot an drei Stellen; bei der Ankerwahl im hellen Schema **unsichtbar**.
- Achsenbeschriftung des Plotters im dunklen Schema bei **3,29:1** (verlangt 4,5).
- Rechner-Ergebniszeile: Rasterspur **346 px in einem 254-px-Kasten** → Inhalt beschnitten.
- Katalog schob die Seite auf **405 px** bei 320 px Fenster (Textabstände).
- Menü-Tab-Liste erreichte **verborgene Nachfahren geschlossener Details**.

## Geänderte Bereiche

**Code (Commits, nichts gepusht):**
| Commit | Inhalt |
|---|---|
| `575a875` | M7-006: Tokens korrigiert, `scripts/token-audit.mjs` neu, `tokens:check` in `check` |
| `378be03` | M2-008: vier Tokens je Schema, Plotter aus Tokens, drei Weiß-auf-Marke-Stellen, Rohfarbenprüfung |
| `d36ab20` | M2-007: gemeinsame kompakte Größenvariante, drei Kleinvarianten bereinigt |
| `8665bce` | M7-005: 16 intrinsisch sichere Layoutregeln |
| `cb5d047` | M2-006: `nav.main`, `caseConverter.mode`, Modusgruppe als `role="group"`, `aria-pressed`, `docs/ui-system.md` |
| `b973679` | M7-002: Menü als nativer modaler Dialog, eigene Tab-Liste entfallen |

**Akte:** sieben Protokolle in `uebergabe/06-protokolle/` (je Karte eines, plus Nachtrag),
`00-einstieg/vorgehen-qm-audit.md` (Kartenstand), `01-stand/aktueller-stand.md` (Zusätze je Einheit),
`docs/ui-system.md` (Erstellungs- und Layoutregeln).

**Belege (Arbeitsnotizen, bewusst außerhalb der Versionierung):** `work/r5-fortschritt.md`,
`work/m7-006-beleg.log`, `work/m2-008-messwerte.json`, `work/m2-007-messwerte.json`,
`work/m7-005-messwerte.json`, `work/m2-006-messwerte.json`, `work/m7-002-messwerte.json` und die
zugehörigen Belegskripte `work/*-beleg.cjs`.

## Entscheidungen

- **Modell für das Werkzeugmenü: nativer modaler Dialog** (`<dialog>` + `showModal()`) statt eigener
  Fokusliste — die Karte bevorzugt es, und Hintergrundsperre, Fokuseinschluss und Escape kommen so
  aus der Plattform statt aus eigener Zählung.
- **`--space-5` wird nicht eingeführt.** Die Abstandsskala ist 1/2/3/4/6/8/12; eine 1,25-rem-Stufe
  bräche das Muster. Die sieben Stellen liegen auf `--space-4`.
- **Eine kompakte Größenvariante statt dreier Einzelregeln** (`.button.compact`, 44×44 als
  Untergrenze) — die Karte verlangt genau das, und die globale 44-px-Regel bleibt unangetastet.
- **Kein `overflow:hidden` als Reparatur** (Karten-Abgrenzung); stattdessen intrinsisch sichere
  Spuren und umbrechende Fußzeilen.
- **Dokumentbühne vereinheitlicht:** Viewer und Schwärzungseditor nutzen ein Token; der
  Schwärzungseditor wechselt dadurch sichtbar von `#777` auf `#303238` (eine bewusste Änderung).
- **Trennung nach Verantwortung bei Farben:** Dokumentpapier/-marke bleiben ausdrücklich feste
  Farben (mit Grund im Prüfer hinterlegt), UI-Flächen kommen aus Tokens.

## Prüfungen

- **Je Karte ein eigenes Belegskript** mit erzeugten Zuständen (nicht nur leere Startformulare) —
  Messwerte als JSON in `work/`.
- **Mutationsgegenprobe (M7-006):** alter Tokenname → `tokens:check` scheitert mit Exit 1 und
  Fundort; zurückgenommen → sauber.
- **Vorher/Nachher-Messung (M2-008):** dunkle Achsenbeschriftung 3,29:1 → 11,83:1, hell unverändert
  5,36:1; Kurvenfarben in beiden Schemata identisch; QR-Zeichnung identisch.
- **Sechs Messzeilen (M2-007):** 320/390/1360 px × de/es × hell/dunkel, alles ≥ 44 außer einem
  `<span>`-Zähler ohne Bedienfunktion.
- **Sieben Zustände × sechs Zeilen (M7-005):** 0 Befunde; Textabstands-Überlauf in zwei belegten
  Schritten 405 → 380 → 0.
- **Accessibility-Baum (M2-006):** Navigation und Modusgruppe in drei Sprachen korrekt, aktive
  Kennzeichnung vorhanden, Tastatur wechselt den Modus.
- **Modaler Dialog (M7-002):** bei 1360 und 390 px je 14/10/6 Tab-Schritte ohne Ziel außerhalb,
  Escape und Rücktaste schließen ohne Routenwechsel, Fokus kehrt zurück.
- **Projektprüfer:** `viewport:check` 62 Routen grün; `a11y:check` über die betroffenen Routen in
  beiden Schemata grün.
- **Kette:** `npm run check` Exit 0 (695 Tests, 48 Dateien, 0 Fehler) · `npm run build` Exit 0.

## Offene Punkte

- **M7-003 (PDF-Schwärzung ohne Tastaturalternative) — nicht begonnen.**
- **M7-004 (PDF-Viewer ohne zugänglichen Text) — nicht begonnen.**
- **M2-006: echter Vorleserlauf** (NVDA/Narrator) nicht herstellbar; Restforderung der Karte, als
  Grenze geführt.
- **Kein reales Mobilgerät, kein echter Browserzoom** (M7-005) — Ersatzwege benannt.
- **Vollständiger `a11y:check` über alle 124 Routen** in dieser Sitzung nicht gefahren (Laufzeit über
  dem Zeitfenster; im Vordergrund nötig, Hintergrund scheitert mit „stdin is not a tty").
- **`/licenses` bricht im Prüfer ab** („Route ohne Inhalt", 785 Paketzeilen) — seit dieser Sitzung
  bekannt, ungeklärt, nicht durch diese Änderungen verursacht.
- **Nichts gepusht.** `main` liegt weiter vor `origin/main` (Abstand wächst mit jedem Akten-Commit;
  nicht aus einem Text ablesen, sondern `git rev-list --count origin/main..HEAD`).

## Empfohlener nächster Schritt

**R5 fortsetzen mit U7 (M7-003), dann U8 (M7-004)** — Anknüpfungspunkt mit Dateien, Zuständen und
Belegplan steht in `work/r5-fortschritt.md` (Abschnitte „Anknüpfungspunkt U7/U8"). Danach der
Abschluss für R5 mit Übergabe und Sitzungseintrag. Für diese Sitzung endet der Durchzug hier, weil
der Arbeitsspeicher des Durchgangs erschöpft war — **kein fachlicher Blocker**.

## Git

- **Acht Commits:** sechs Code-Commits (siehe Tabelle) und zwei Akten-Commits in dieser Sitzung
  (`4c05df7`, `f916374`, `55dcde0`, `4f60aee`, `40a3619`, `f100ddb` — je Einheit Code und Akte
  getrennt).
- **Nichts gepusht.** Ein Push veröffentlicht (Produktionsbranch Cloudflare Pages).
- Registry-Dateien (`licenses/registry.json`, `apps/web/public/licenses/registry.json`) bleiben wie
  vereinbart uncommittet (nur Revisionsbindung).
