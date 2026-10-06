# Fortschrittsprotokoll: M4-003 (R2) — Plotter bindet `x` über den Scope

**Datum:** 2026-10-06
**Status:** abgeschlossen — Abnahmefälle der Karte alle belegt
**Karte:** M4-003 aus R2 (`QM/70-reparaturempfehlungen/R2.md`), Basis `a041ee0`

## Umfang

`valueAt` in `packages/tools/src/calculator/plotter.ts` — der einzige Weg, auf dem Wertetabelle,
Nullstellensuche und SVG-Geometrie Funktionswerte erhalten. Werkzeugoberfläche
(`apps/web/src/tools/Plotter.tsx`) und Rechenkern (`core.ts`) blieben unangetastet.

## Ergebnisse

**1. Der Befund trifft genau so zu.** Die alte Zeile war

```ts
const result = evaluate(expression.replace(/x/gu, `(${x})`), { number: 'BigNumber' })
```

Eine **Zeichenersetzung mitten im Ausdruck**: `exp(x)` wurde bei `x = 0` zur Zeichenfolge
`e(0)p(0)`, der Kern meldete einen Syntaxfehler und `valueAt` gab `null` zurück. Betroffen war
**jeder Name mit einem `x` darin** (`exp`, `max`, `expm1`, …) — nicht nur die Anzeige, sondern
Wertetabelle, Nullstellensuche und die gezeichnete Kurve gleichzeitig, weil alle drei über
`valueAt` laufen.

**2. Lösung — der Ausdruck bleibt unverändert, `x` kommt aus dem Scope.**
`evaluate(expression, { number: 'BigNumber' }, { x: math.bignumber(x) })`. Der Kern hatte die
Scope-Bindung längst (`evaluate` dritter Parameter, benutzt vom RPN- und Variablenpfad); die
Karte verlangt genau diesen Weg und untersagt ausdrücklich einen Wortgrenzen-Regex als Ersatz.
Die Bindung als mathjs-`BigNumber` vermeidet die dokumentierte Falle, dass rohe JS-Zahlen mit
mehr als 15 signifikanten Stellen im BigNumber-Modell nicht implizit angenommen werden — die
Rasterwerte (`xMin + step*index`) tragen genau solche Stellen.

**3. Zweiter Teil der Karte mit erledigt: nicht mehr `display` lesen.**
`Number(result.display)` las den **lokalisierten** Anzeigetext, der zusätzlich die
Anzeige-Nullung trägt (M4-002). Jetzt wird `raw` gelesen — der kanonische, wieder einlesbare
Dezimalwert. Das ist die von der Karte geforderte Grenze „Geometrie erst an der Renderergrenze in
endliche JS-Zahlen umwandeln".

**4. Abgrenzung eingehalten.** Kein neuer Ausdrucksparser, kein Wortgrenzen-Patch, keine
Zeichenersetzung. Die gemeinsame mathjs-Instanz kommt aus `calculatorFor` (Zwischenspeicher),
es wurde **keine** zweite Factory geladen.

**5. Der optionale Teil der Karte wurde nicht umgesetzt.** Die Karte nennt ein einmaliges
`compile()` bei vielen Stützstellen als **Möglichkeit** („optional"). Der Zeichenweg bleibt
zunächst beim `evaluate` je Punkt — er ist der geprüfte und der langsamere; die Messung dazu ist
als offener Punkt notiert, nicht stillschweigend ausgelassen.

## Abnahmefälle der Karte — alle am ausgelieferten Stand belegt

| Abnahmefall | Ergebnis |
|---|---|
| `exp(x)` bei 0 | **1** (vorher `null`) |
| `max(x, 2)` | 0→2, 1→2, 2→2, 3→3 |
| `x^2`, negatives `x` | `valueAt('x^2', -3)` = 9 |
| Namen mit `x` | `exp(x)`, `max(x,2)` — beide berechnet |
| Polstelle `1/x` bei 0 | „nicht definiert", Kurve zerfällt in **zwei** Äste |
| unbekannte Variable `y + 1` | überall „nicht definiert", **keine** Kurve |
| Tabelle/Nullstellen/Geometrie derselbe Auswerter | `exp(x)`-Tabelle, Nullstelle `exp(x)-1 → x = 0`, ein Kurvenzug |

## Belege

- **Test** `apps/web/src/math-tools.test.ts`, zwei neue Fälle (`binds x over the scope…`,
  `uses the same evaluator…`), Erwartungen gegen `Math.exp`/`Math.max` gerechnet.
- **Gegenprobe (Mutation):** alte Zeile eingesetzt, Testlauf → genau die **zwei** neuen Fälle rot
  (`expected null to be 1`, Tabelle ohne Wert), die 41 übrigen grün. Mutation zurückgenommen,
  Lauf wieder grün. Damit ist belegt, dass die Prüfung den alten Fehler wirklich fängt.
- **Browserbeleg** `work/plotter-beleg.cjs` gegen `vite preview` auf `127.0.0.1:4173`,
  Bündel `index-B3GNuPJh.js` (gegen `apps/web/dist/assets/` abgeglichen), Service-Worker vorher
  abgemeldet. Sechs Aufnahmen unter
  `06-protokolle/screenshots/2026-10-06-m4-003/`, Ergebnisdatei `aufnahmen.txt`:
  **alle Prüfungen bestanden**, Überbreite 0 px bei 390 px (hell) und 1360 px (dunkel).
  Die Aufnahmen wurden angesehen: `exp(x)` als durchgezogene Kurve mit Wertetabelle,
  `1/x` mit sichtbarer Unterbrechung bei 0.
- **Prüfkette:** `npm run check` → **633 Tests, 39 Dateien, Exit 0**; `npm run build` → Exit 0,
  Bündelprüfung grün (Start-JavaScript 148 147 B gzip, Warnschwelle 204 800 B).

## Funde, die nicht zu dieser Karte gehören

- **`licenses:check` war vor dem Lauf rot** — `licenses/registry.json` ist an die Revision
  gebunden und war noch auf `ebabc36`. Nach `npm run licenses:generate` auf `d78724f` gesetzt,
  danach grün. Das ist die bekannte offene Entscheidung 1 des Vorgehensindex; die beiden
  Registry-Dateien wurden **nicht** committet.
- **Die Wertetabelle des Plotters zeigt Punkt-Dezimalzahlen** (`0.3678794412`) in der deutschen
  Oberfläche, während der Rechner Komma zeigt. Das ist der Gegenstand von **M3-010**
  („Zahlenformate folgen innerhalb einer Oberfläche verschiedenen Regeln", R6) — dort mitführen,
  hier nicht mitreparieren.
- Die Warnungen „toolMessages … gesamt" im Bau sind der bekannte Zielkonflikt aus der
  Werkzeugtext-Aufteilung (Summe gegen Last je Route), keine neue Abweichung.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Tests in `math-tools.test.ts` | 41 → 43 | `npx vitest run src/math-tools.test.ts` |
| Projekt-Tests | 631 → 633 | `npm run check` |
| geänderte Produktzeilen | 1 Zeile Aufruf + Kommentar | `plotter.ts` |

## Folgemaßnahmen

- [ ] **Messung des optionalen `compile()`-Wegs** (viele Stützstellen): erst messen, dann
      entscheiden — derzeit wertet jeder Punkt über `evaluate` aus.
- [ ] Punkt-Dezimalzahlen der Wertetabelle in **M3-010** aufnehmen (R6, noch nicht begonnen).
