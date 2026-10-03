# Übergabe: Suite „Rechnen" — Welle 2 (Rechenkern)

**Datum:** 2026-10-03  
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)  
**Status:** teilweise — **Kern abgeschlossen und geprüft, Oberfläche offen**

## Ziel der Sitzung

Welle 2 der Rechner-Suite: wissenschaftlicher, Programmierer- und RPN-Modus, mit der
vollständigen Funktionsliste samt Aufruftest je Funktion (Roadmap-Phase 2).

## Ergebnis

**Der Rechenkern von Welle 2 steht und ist vollständig geprüft.** Die Roadmap-Abnahme ist im
Kern belegt:

| Abnahmekriterium | Beleg |
|---|---|
| Trigonometrie in DEG/RAD/GRAD | `calculatorAngleProbes`, 9 Prüfungen — alle grün |
| Logarithmen und Potenzen | `log2`, `log10`, `log`, `exp`, `pow`, `e` in der Funktionsliste |
| Bitoperationen mit Wortbreite 8/16/32/64 und Zweierkomplement | `toWord` gegen `BigInt.asIntN`/`asUintN` |
| RPN-Stapel | `evaluateRpn` mit nachvollziehbarem Rechenweg (`steps`) |
| jede gelistete Funktion in einem Test aufgerufen | `calls every listed function without a runtime error` |

**Was fehlt:** Die **Oberfläche** für die drei Modi. `Calculator.tsx` kennt weiterhin nur
Standard und Bruch; Winkelmodus, Wortbreite, Zahlensysteme und RPN sind Kernfunktionen ohne
Bedienelemente. Die Modi sind also **nicht abgenommen** — ein Nutzer kann sie noch nicht
benutzen.

## Geänderte Bereiche

- `packages/tools/src/calculator/functions.ts` – 30 neue Factories (Trig, Hyperbel, Log, Bit,
  Kombinatorik); **neue Funktionsliste** `calculatorFunctions`, `calculatorAngleProbes`,
  `calculatorWordSizes`
- `packages/tools/src/calculator/core.ts` – Winkelmodus, `toBase`, `toWord`, `evaluateRpn`,
  Anzeige-Regeln
- `apps/web/src/calculator-core.test.ts` – 15 neue Tests (160 → 175)

## Entscheidungen und Annahmen

- **Der Winkelmodus läuft über mathjs' Einheitenmechanik**, nicht über `Math.PI / 180`:
  mathjs nimmt rohe JS-Zahlen mit mehr als 15 signifikanten Stellen bei `BigNumber` nicht an.
- **Der Rückweg liefert eine nackte Zahl** ohne Einheit — sonst liefe „deg" als Einheit in die
  nächste Rechnung.
- **`rightLogShift` wurde bewusst entfernt:** mathjs bietet es nur vektoriell an. Der logische
  Rechts-Shift auf Skalaren gehört in die Wortbreiten-Funktion.
- **Werte unterhalb der Anzeigepräzision erscheinen als 0** (Taschenrechner-Konvention).
  `cos(100 gon)` ergibt rechnerisch `1,5e-64` statt exakt 0.
- **Annahme:** Die Funktionsliste führt jeden Ausdruck genau einmal; `expected` ist nur gesetzt,
  wo das Ergebnis exakt rund ist — sonst prüft der Test nur die Aufrufbarkeit.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `licenses:check` (vor der Welle) | 520 Pakete — bestanden, **keine neuen Abhängigkeiten** |
| `npm run check` | bestanden: **175 Tests** (12 Dateien), Katalog 26/3/26 |
| `npm run build` | bestanden |
| Rechenkern-Chunk | **102.374 B gzip** — Budget 110 KiB, eingehalten |
| Startbündel | **191.324 B gzip** — unverändert |
| Artefaktprüfung im Browser | **nicht durchgeführt** (Modi haben keine Oberfläche) |
| Fehlschlagprobe | **nicht durchgeführt** für die neue Funktionsliste |

**Fünf echte Fehler, die die Tests fanden — alle behoben:**
1. `rightLogShift` ist vektoriell und lehnt Skalare ab
2. `math.unit(x, e).value` liefert die **Basiseinheit** (rad), nicht die Zieleinheit
3. `math.isInteger` hält `0.999…998` für ganzzahlig → 64 Stellen in der Anzeige
4. `notation: 'fixed'` **mit** `precision` füllt zu `11.00000000000000` auf
5. Werte knapp unter der Anzeigepräzision erschienen als `1,5e-64`

**Eigene Fehlgriffe, offen benannt:**
- Mehrere Diagnose-Tests waren selbst falsch (verwechselten mathjs' `evaluate` mit dem eigenen;
  riefen den DEG-Wrapper mit einem Unit auf) und führten kurzzeitig in die Irre.
- Ein Fix in der Anzeige (**Regression**): das Wandeln in ein BigNumber machte aus dem Bruch
  `1/2` die Dezimalzahl `0.5`. Zurückgenommen, Ursache stattdessen an der Quelle behoben.
- Eine Diagnosedatei blieb liegen und ließ `npm run check` scheitern. Aufgeräumt.

## Offene Punkte und Risiken

- [ ] **Die Oberfläche für Welle 2 fehlt** — wissenschaftlich, Programmierer, RPN. Ohne sie ist
  Welle 2 nicht abgenommen.
- [ ] **Fehlschlagprobe** für `calculatorFunctions` (Funktion aus der Liste entfernen; der
  Aufruftest muss sie mit `unknownName` nennen — für die alte Liste ist das belegt).
- [ ] **Artefaktprüfung** der neuen Modi in Edge, zwei Fensterbreiten, hell und dunkel.
- [ ] Der logische Rechts-Shift auf Skalaren läuft noch über keine Bedienung; die Wortbreite
  deckt ihn rechnerisch ab.
- [ ] Vier der 18 Kalender sind im Temporal-Polyfill defekt (betrifft Welle 4).

## Empfohlener nächster Schritt

1. **Oberfläche Welle 2:** Modus-Umschaltung, Winkelmodus-Wähler, Wortbreiten-Wähler mit
   Zweierkomplement, RPN-Stapelanzeige mit Rechenweg; Texte in drei Sprachen.
2. Danach Artefaktprüfung und Fehlschlagprobe — Welle 2 damit abgenommen.
3. Erst dann **Welle 3** (Kaufmännisch, Geometrie).

## Git

- Commit: **`0a0b4fa`** — `feat(calculator): wave 2 core - angle modes, word sizes, RPN`
- Welle 1: `4bed2d9`
- Arbeitsbaum: sauber bis auf fremde Untracked-Ordner (`.codex-remote-attachments/`, `tmp/`, `work/`)
