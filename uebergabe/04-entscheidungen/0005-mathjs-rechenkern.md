# ADR 0005: mathjs als Rechenkern der Suite „Rechnen"

**Status:** angenommen  
**Datum:** 2026-10-03

## Kontext

Die geplante Suite „Rechnen" (Konzept `03-konzepte/2026-10-03-taschenrechner-suite.md`)
braucht vier Dinge auf einmal: eine **Ausdrucksauswertung** mit korrekter Operatorrangfolge,
**exakte Zahlenmodelle** (Brüche und Dezimalarithmetik statt Gleitkomma), **Einheiten** und
**Datumsarithmetik**. Nach ADR 0001 haben Open-Source-Lösungen Vorrang vor Eigenentwicklung;
Eigenentwicklung ist nur zulässig, wenn keine adäquate Lösung existiert oder alle Kandidaten an
einem dokumentierten Muss-Kriterium scheitern.

## Kandidaten

- **Eigener Parser** (Tokenizer + Rangfolge-Auswerter) — ursprüngliche Empfehlung, **zurückgezogen**:
  sie beruhte auf einer ungemessenen Größenangabe (siehe unten).
- **`math-expression-evaluator`** (MIT, 67 kB) — **ausgeschieden, belegt**: Das README dokumentiert
  `^` als *linksassoziativ* („like MS Office"). `2^3^2` ergäbe 64 statt 512.
- **`expr-eval`** (MIT, 24,7 kB minifiziert) — korrekte Rangfolge, aber **seit 2019 ohne
  Veröffentlichung** und rechnet ausschließlich in JavaScript-`Number`; die Operatoren sind nicht
  auf ein anderes Zahlenmodell umstellbar.
- **`mathjs`** (Apache-2.0, aktiv gepflegt, 15.2.0 vom 2026-04) — Parser, BigNumber
  (auf `decimal.js`), Fraction (auf `fraction.js`), `Unit`, lineare Algebra, Polynomwurzeln,
  symbolische Umformung.

## Entscheidung

CommieTools verwendet **`mathjs`** als Rechenkern der Suite, und zwar **aus kuratierten
Factories statt aus dem `all`-Bündel** (`create({ …Dependencies })`).

Drei Festlegungen gehören dazu:

1. **`help` wird nicht eingebunden.** Die eingebettete Hilfe-Doku kostet gemessen 22,5 KiB gzip
   und besteht aus englischen Anzeigetexten — sie widerspricht der Projektregel, keine
   nutzerseitigen Texte im Code zu führen. Eigene Hilfetexte kommen aus den Sprachkatalogen.
2. **Das Zahlenmodell wird konfiguriert, nicht vorausgesetzt.** `mathjs` rechnet standardmäßig in
   Gleitkomma (`0.1 + 0.2` = `0.30000000000000004`). Die Suite setzt `number: 'Fraction'` für
   exakte Brüche und `number: 'BigNumber'` für Dezimalarithmetik. Ohne diese Konfiguration ist
   die Genauigkeitsanforderung **nicht** erfüllt.
3. **`mathjs` wird ausschließlich nachgeladen.** Es darf nie im Startbündel liegen
   (Startbudget 250 KiB gzip; die kuratierte Variante belegt 89,5 KiB).

## Messungen (Grundlage der Entscheidung)

esbuild, `--bundle --minify --format=esm --target=es2020`, gzip -9, 2026-10-03:

| Variante | gzip |
|---|---:|
| `create(all)` — vollständiges Bündel | 189.733 B (185,3 KiB) |
| **kuratiert, ohne `help`** | **91.631 B (89,5 KiB)** |
| kuratiert **mit** `help` | 114.653 B (112,0 KiB) |
| kuratiert **plus Einheiten** (`unit`, `to`) | 91.848 B (89,7 KiB) |
| nur Parser + Fraction | 89.974 B (87,9 KiB) |
| `mathjs/number` (ohne BigNumber/Fraction) | 111.045 B (108,4 KiB) |

Funktionsnachweise in der kuratierten Variante: `2^3^2` = 512 (rechtsassoziativ), `-2^2` = −4
(unäres Minus), `2(3+4)` = 14 (implizite Multiplikation), `5 cm + 2 inch` = `10.08 cm`,
`format(fraction(1,3))` = `1/3`. Mit `number: 'Fraction'` ergibt `1/3 + 1/6` = `1/2` und
`0.1 + 0.2` = `3/10`; mit `number: 'BigNumber'` ergibt `0.1 + 0.2` = `0.3` und
`(0.1 + 0.2) == 0.3` ist wahr.

## Folgen

- **Vier Bausteine entfallen:** `fraction.js`, `decimal.js`, `convert`/`unitmath` und
  `simple-statistics` werden nicht mehr einzeln aufgenommen — mathjs enthält sie beziehungsweise
  ihre Funktion. Das verkleinert die Abhängigkeitsliste und die zu prüfende Lizenzfläche.
- **Die Einheiten sind praktisch kostenlos:** +0,2 KiB gzip. Werkzeug 2 „Umrechnen" ist damit
  ohne eigenen Baustein zu bauen.
- **Die Entscheidung zu Werkzeug 3 und 4 wird einfacher:** `@js-temporal/polyfill` bleibt für
  Kalender/Datumsarithmetik nötig, wird aber nur nach Feature-Abfrage geladen (…).
- **Neue Pflicht bei kuratierten Factories:** Jede benötigte Funktion muss explizit als
  `…Dependencies` aufgeführt werden. Fehlt eine, schlägt sie **zur Laufzeit** fehl, nicht beim
  Bau — im Prüflauf fehlte `log10`. Die Suite braucht dafür eine Liste der benötigten Funktionen
  und einen Test, der jede einzelne aufruft.
- **Lizenzpflicht:** `mathjs` und seine Abhängigkeiten (`decimal.js`, `fraction.js`,
  `complex.js`, `typed-function`, `seedrandom`, `escape-latex`, `tiny-emitter`,
  `javascript-natural-sort`, `@babel/runtime`) müssen über `npm run licenses:generate` in die
  Lizenzdatenbank aufgenommen werden. Alle genannten stehen mit erlaubten Lizenzen in
  `licenses/policy.json`.
- **Größenbudget:** Für die Rechner-Route ist ein Budget von rund 95 KiB gzip anzusetzen und in
  `scripts/bundle-audit.mjs` zu prüfen.

## Was diese Entscheidung nicht regelt

- Ob `@js-temporal/polyfill` aufgenommen wird (eigener Punkt; natives Temporal in Chromium 154
  vorhanden, Polyfill nur als Rückfall).
- Ob `function-plot` für den Funktionsplotter aufgenommen wird (Größe gemessen, Browserfähigkeit
  **nicht** geprüft).
- Ob symbolische Gleichungslösung über Polynome hinaus gebraucht wird (`nerdamer`, 131,5 KiB gzip).

*Nachtrag 2026-10-07 (Faber, Karte M2-003).* Zwei Zahlen dieses ADR sind **überholt**; der
ursprüngliche Wortlaut bleibt stehen und wird nicht rückdatiert verändert.

| Aussage im ADR (2026-10-03) | Heute gültig |
|---|---|
| „Startbudget **250 KiB gzip**" | **200 KiB** — `warningBudgets.entry = 200 * 1024` in `scripts/bundle-audit.mjs` (Warnschwelle) |
| „Für die Rechner-Route … Budget von rund **95 KiB gzip**" | **110 KiB** — `routeBudget: 110 * 1024` für den Rechenkern-Chunk |
| „die kuratierte Variante belegt **89,5 KiB**" | historische Messung vom 2026-10-03 (esbuild, gzip -9, andere Factory-Liste). Eine Nachmessung derselben Factory-Liste am 2026-10-04 ergab **100,6 KiB** (`work/rechner-mathjs-messung.mjs`). Der **ausgelieferte** Chunk misst am 2026-10-07 **103.801 B gzip** (`core-*.js`, roh 364.658 B) — er enthält zusätzlich den Rechnerrahmen, ist also **nicht** mit der reinen mathjs-Messung gleichzusetzen |

**Messmethode und Umfang** stehen seit dem 2026-10-07 in
`scripts/bundle-size-baseline.json` selbst (`_einheit`, `_umfang`, `_hinweis`): alle Zahlen sind
gzip-Bytes; `entry` ist das Startskript aus `index.html`, die übrigen Kennzahlen sind einzelne
Chunks bzw. Summen. Die Referenzdatei wird **nur gelesen** und **nie automatisch** nachgezogen.

**Unverändert bleibt:** die Architekturentscheidung (mathjs aus kuratierten Factories) und die
Politik, dass die Größe eine **Warnung** ist. Geprüft wird die strukturelle Regression: eine
**zweite** mathjs-Instanz im Start wäre ein Fehler, nicht eine Funktionsausweitung.

Beleg: `../06-protokolle/2026-10-07-r7-m2-003-rechner-budgets.md`.
