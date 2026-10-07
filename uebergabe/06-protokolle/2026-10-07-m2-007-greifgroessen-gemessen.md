# M2-007 — Drei Schaltflächenregeln unterschritten die verbindlichen 44 Pixel

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Karte:** M2-007 (R5)
**Ergebnis:** behoben — eine gemeinsame kompakte Größenvariante statt drei Einzelregeln; real gemessen.

## Was die Karte verlangt

- Die globale Mindesthöhe **nicht** zurückbauen.
- Kleinere spezifische Varianten bereinigen und eine **gemeinsame Größenvariante** für kompakte,
  trotzdem 44×44 große Bedienelemente schaffen.
- **Höhe UND Breite im realen Layout messen**; mehrzeilige Inhalte und zugängliche Labelklickflächen
  beachten; neu gepolsterte Summary-Ziele ebenfalls nachmessen.
- CSS-Text allein beweist keine Unterschreitung (der historische Icon-Speicherknopf war bereits
  128×44).
- Abnahme: Menüsortierung, PDF-Seitenaktionen, Icon-Ergebnisse und Details bei 320/390/1360 px,
  beiden Themes und längster Sprache; Ergebniszustände **aktiv erzeugen**.
- **Nicht tun:** 44 px nicht durch WCAG-AA-24 px ersetzen; keine unsichtbar überlappenden
  Klickflächen als Größenkosmetik.

## Bestandsaufnahme (gemessen, Zustände erzeugt, 320 px / spanisch / hell)

Längste Sprache ist **spanisch** (180.960 Zeichen gegen deutsch 177.498 und englisch 171.024).

| Stelle | gemessen | Ergebnis |
|---|---|---|
| Menüsortierung (`.tool-menu-sorts .button`) | 4 Knöpfe, **45–79 × 38 px** | **unter 44** (Höhe) |
| PDF-Seitenaktionen (`.pdf-page-actions .button`) | 18 Knöpfe, **44–84 × 38 px** | **unter 44** (Höhe) |
| Icon-Ergebnisse (`.icon-result figcaption .button`) | 13 Knöpfe, **68 × 44 px** | ✓ — der historische Verdacht ist auch hier gemessen widerlegt |
| Kategoriezeilen im Menü (`details > summary`) | 294 × 48 px | ✓ |
| Werkzeugzeilen im Menü | 286 × 54 px | ✓ |
| Einstellkarten (`details > summary`) | 220 × 45 px | ✓ |
| Lizenzpakete (`summary`) | 785 Zeilen, 286 × 78 px | ✓ |
| Zähler `.tool-menu-group-count` | 29 × 29 px | **kein Bedienziel** — ein `<span>` in der Kategoriezeile; Klickfläche ist die Zeile (294 × 48) |

Die beiden Unterschreitungen kamen aus genau den in der Karte genannten Regeln: `min-height: 2.35rem`
(37,6 px) und `min-height: 38px`.

## Umsetzung

1. **`styles.css` — eine gemeinsame Variante:**
   `.button.compact { min-width: 2.75rem; min-height: 2.75rem; padding: 0.35rem 0.7rem; font-size: 0.85rem; }`
   mit Begründung im Quelltext (44×44 bleibt Untergrenze; ersetzt drei Einzelregeln).
2. **Drei Kleinvarianten bereinigt:** `.tool-menu-sorts .button` behält nur noch die Pillenform,
   `.pdf-page-actions .button` entfällt ganz, `.icon-result figcaption .button` behält nur
   Innenabstand und Schriftgröße (die Höhe kommt jetzt aus der globalen 44-px-Regel).
3. **Angewandt** in `ToolNavigation.tsx` (4 Sortierknöpfe) und `PdfOrganize.tsx` (6 Seitenaktionen).

## Belege (Messwerte in `work/m2-007-messwerte.json`, Skript `work/m2-007-groessen-beleg.cjs`)

Kleinste gemessene Box je Stelle; `!` = mindestens ein Element unter 44:

| Stelle | 320 de hell | 320 es dunkel | 320 es hell | 390 es hell | 1360 de hell | 1360 es hell |
|---|---|---|---|---|---|---|
| Menüsortierung | 45×44 | 44×44 | 44×44 | 49×44 | 49×44 | 49×44 |
| Kategoriezeilen (summary) | 294×48 | 294×48 | 294×48 | 364×48 | 365×48 | 365×48 |
| Werkzeugzeilen | 286×54 | 286×54 | 286×54 | 356×54 | 357×54 | 357×54 |
| Zähler (kein Bedienziel) | 29×29 ! | 29×29 ! | 29×29 ! | 29×29 ! | 29×29 ! | 29×29 ! |
| Einstellkarten (summary) | 220×45 | 220×45 | 220×45 | 290×45 | 1052×45 | 1052×45 |
| Lizenzpakete (summary) | 286×78 | 286×78 | 286×78 | 356×78 | 1150×45 | 1150×45 |
| PDF-Seitenaktionen | 44×44 | 44×44 | 44×44 | 44×44 | 44×44 | 44×44 |
| PDF-Seitenkarten | 104×410 | 104×490 | 104×490 | 139×420 | 165×426 | 165×426 |
| PDF-Zeilenaktionen | 44×44 | 44×44 | 44×44 | 44×44 | 44×44 | 44×44 |
| Icon-Ergebnisse | 68×61 | 68×44 | 68×44 | 103×44 | 128×44 | 121×44 |
| Größen-Auswahlfelder | 220×44 | 220×44 | 220×44 | 137×44 | 118×44 | 118×44 |

**Gemessen wurde immer die eigene Box des Bedienelements**, zusätzlich die Etikettfläche, wo es eine
gibt (Größen-Auswahlfelder: eigene Box 220×44, Klickfläche das Etikett). Eine unsichtbar
überlappende Klickfläche als Größentarnung wäre so aufgefallen — es gibt keine.

**Vorher/Nachher der beiden Unterschreitungen:** Menüsortierung 38 → **44 px** Höhe (Breite 45–79
unverändert), PDF-Seitenaktionen 38 → **44 px** Höhe (Breite 44–84 unverändert).

**Gegenprobe mit dem Projektprüfer** (`viewport-audit.mjs a11y`, Routen `/`, `/tools/pdf-organize`,
`/tools/pdf-merge`, `/tools/icon-generator`, `/tools/calculator`, beide Schemata): alle
„Ziele<44=0", auch die Menüziele (`MenueZiele<44=0`). `/licenses` bricht der Prüfer mit „Route ohne
Inhalt" ab — die Seite mit 785 Paketzeilen liefert ihm nicht rechtzeitig prüfbaren Inhalt; die
Lizenz-Summarys sind deshalb über den eigenen Beleg oben abgedeckt (286×78 bzw. 1150×45).
Der vollständige Durchgang über alle 124 Routen wurde **nicht** wiederholt (Laufzeit über dem
Zeitfenster der Sitzung); die Routen der Karte sind vollständig gemessen.

**Kette:** `npm run check` Exit 0 (Tokenschutz grün, 695 Tests, 48 Dateien) · `npm run build` Exit 0
(Startbündel 149495 B gzip).

## Benannte Grenzen

- **Kein reales Mobilgerät** — gemessen ist die Breitenemulation bei 320/390 px. Die Karte nennt das
  Gerät zusätzlich; das bleibt offen und wird hier als Grenze geführt.
- **Kein Tastatur- oder Vorleserlauf** — für M2-007 nicht verlangt (der Prüfer weist es selbst als
  nicht geprüft aus).
- **Exakt 44 px ist die Untergrenze, nicht mehr.** Die Karte verlangt „nicht unter 44", das ist
  erfüllt; ein größerer Puffer ist nicht gefordert.

## Prüfmittel-Lehren (eigene Fehler, für die Akte)

1. **Doppelter Messpunkt meldete einen erfundenen Fehlschlag.** Die PDF-Zeilenaktionen standen
   zweimal im Skript — einmal auf der Route, auf der es sie nicht gibt (Organize), einmal auf der
   richtigen (Merge). Der erste Eintrag meldete „Zustand nicht erzeugt", obwohl die Stelle gemessen
   war. Jede Stelle wird jetzt **nur auf der Route gemessen, auf der sie tatsächlich vorkommt**.
2. **Falscher Öffner.** Der Schubkasten öffnet über `button.tool-menu-trigger`; mein erster Lauf
   klickte `button.tool-menu-open` (eine Werkzeugzeile) und meldete den ganzen Kasten als „nicht
   erzeugt".
3. **Falsche Adresse für den Projektprüfer.** `viewport-audit.mjs` erwartet die Vorschau unter
   `http://127.0.0.1:5173`, die laufende Vorschau hört auf `localhost:4173` — ohne
   `COMMIETOOLS_AUDIT_URL` meldet der Prüfer „Route ohne Inhalt" und läuft in den Abbruch.
4. **Prüfläufe im Hintergrund scheitern mit „stdin is not a tty"** — auch der Projektprüfer. CDP-
   gesteuerte Läufe gehören in den Vordergrund; der vollständige Durchgang ist deshalb nicht
   gefahren worden.
5. **Zähler nicht mit Bedienzielen verwechseln.** Ein `<span>` ohne Rolle in einer Zeile ist keine
   Klickfläche; die Zeile ist es. Wer den Zähler mitzählt, meldet einen Fehler, den es nicht gibt.
