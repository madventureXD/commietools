# Übergabe · Rechner-Oberfläche umgesetzt (Tastenfeld, Anzeige 1/2, vier Rechenarten)

Datum: 2026-10-04 · Werkzeug: Rechner (`/tools/calculator`) · Stand: **nicht committet**, alles auf der Platte
Vorgeschichte: Konzept `uebergabe/03-konzepte/2026-10-04-rechner-oberflaeche.md`

## Was jetzt da ist

- **Tastenfeld** für alle vier Rechenarten, Tastaturdaten in `packages/tools/src/calculator/keypad.ts`:
  Standard 4 × 5 · Wissenschaftlich 5 × 8 mit zweiter Belegung (`2nd`) und Blatt `⋯` ·
  Programmierer 6 × 6 mit `A`–`F` und Bitoperationen · RPN 5 × 6 mit Tokens.
- **Zwei Anzeigen**, Umschalter in der Anzeigezeile, gleiche Höhe, Auswahl wird gespeichert:
  Anzeige 1 = gesetzter zweidimensionaler Satz, Anzeige 2 = roher Term.
  Der 2D-Satz ist ein **Eigenbau** (`render.ts`: Ausdrucksbaum → MathML, etwa 170 Zeilen, 0 Byte
  zusätzlich, keine Schriftdatei, keine neue Abhängigkeit). Was sich nicht setzen lässt, fällt auf
  den rohen Term zurück.
- **Beide Eingabewege bleiben**: Eingabezeile und Tastenfeld schreiben denselben Ausdruck.
- **Nichts Neues an Abhängigkeiten**: die Rechenkern-Factory ist um `cbrt` und `nthRoot` erweitert
  (beide waren in der kuratierten Liste nicht enthalten, siehe Messung unten).

## Vier Fehler, gefunden und behoben — jeder mit Messung belegt

1. **Mehrstellige Zahlen ließen sich nicht tippen.** `appendSnippet` setzte zwischen zwei Ziffern
   ein Leerzeichen: die Folge `6 1 4 4 0` ergab den Ausdruck `6 1 4 4 0`, der Kern meldete
   „Der Ausdruck ist nicht lesbar". Betraf **alle** Rechenarten.
   Beleg: Programmierer-Aufnahme vor der Korrektur (Anzeige ohne Ergebnis) und Rot-Nachweis mit der
   alten Regel: `evaluate('6 1 4 4 0')` → `ok: false`.
   Behoben in `apps/web/src/calculator-ui.ts`; neuer Test **Tastenfolgen** (siehe unten), weil ein
   Test einzelner Tasten diesen Fehler nicht sehen konnte.
2. **`=` rechnete im RPN-Modus nicht.** Die Taste gab dem *Ausdrucksleser* die Token-Zeichenkette
   `3 4 + 5 *` — der meldete „Der Ausdruck ist nicht lesbar". Der RPN-Weg über den Stapel wurde nur
   von der Eingabetaste genommen. Gemessen: `RPN-Anzeige: 3 4 + 5 * 35` nach der Korrektur
   (`runRpn` in `Calculator.tsx`), vorher ohne Ergebnis.
3. **Die Anzeige-Basis wirkte nicht auf das Ergebnis.** Bei aktivem `HEX` stand das Ergebnis
   `61440` statt `F000`; die Basis galt nur für die Darstellungstafel. Gemessen und behoben
   (`displayResult`); der 2D-Satz fällt bei anderer Basis als DEC bewusst auf den rohen Term zurück,
   statt eine falsche Zahl zu setzen.
4. **`=` war stumm tot, wenn der lokale Speicher fehlt.** `runCalculation` brach ab, solange `store`
   nicht gesetzt war — kein Ergebnis, keine Meldung. Der Speicher trägt nur Verlauf und
   Einstellungen. Gemessen im Programmierer-Bild (blockiertes IndexedDB durch das Aufnahmewerkzeug);
   jetzt rechnet der Rechner auch ohne Speicher, der Verlauf entfällt dann still.

## Drei Altlasten aus dem alten Stand mitbehoben

- Die Programmierer-Tasten fügten ` bitAnd ` und ` leftShift ` ein — **keine mathjs-Operatoren**,
  die Tasten haben nie gerechnet („Unexpected type of argument"). Jetzt `bitAnd(` und `<<`/`>>`.
- Die RPN-Tasten klebten am Vorgänger (`4 5+` ist für den Stapel *zwei* Tokens) — jetzt eigenes
  Leerzeichen je Token.
- Das Dezimalkomma war nur im RPN-Pfad behandelt; `1,5 + 1` war im normalen Rechner ein Syntaxfehler.

## Prüfungen (alle auf der Platte gelaufen)

| Prüfung | Ergebnis |
| --- | --- |
| `npm run typecheck --workspaces` | grün |
| `npm run test --workspaces` | **325 Tests grün** (vorher 301), 17 Dateien |
| `npm run lint` | grün |
| `npm run build` | grün, Bundle-Audit bestanden |
| Startbündel | 136.961 B gzip (Schwelle 204.800 B) |
| Rechenkern-Chunk | 103.669 B gzip — **+1.194 B** gegenüber 102.475 B; Vorhersage war +1.016 B |
| Werkzeugtexte de | 26.811 B von 30.720 B (+408 B zum Referenzstand) |

Neue Tests (`apps/web/src/calculator-keypad.test.ts`): jede Taste einzeln gegen den Kern,
Rasterprüfung (keine Taste läuft über den Rand), 2D-Satz (Bruch, Wurzel, Hochzahl, `×`/`−`),
und der Block **Tastenfolgen** (mehrstellige Zahl, `1/3+1/6`, deutsches Komma, `2*e`, RPN-Folge).

## Bilder (echte Aufnahmen aus dem laufenden Programm)

`uebergabe/07-pruefung/rechner-welle7/` — Edge headless über CDP gegen `npm run preview`
(Bündel `index-KE3S4svh.js`), je Aufnahme wird die geladene Bündeldatei protokolliert:

- `rechner-standard-dunkel.png`, `rechner-standard-hell.png` — 1/3 + 1/6 = 1/2 als gesetzte Brüche
- `rechner-anzeige-2-roh.png` — dieselbe Rechnung als roher Term (Anzeige 2)
- `rechner-wissenschaftlich-2nd.png` — zweite Belegung sichtbar
- `rechner-wissenschaftlich-ergebnis.png` — sin⁻¹(0,5) = 30 im Grad-Modus, deutsches Komma
- `rechner-programmierer-hex.png` — 61440, Anzeige-Basis HEX → Ergebnis `0xf000`
- `rechner-rpn.png` — `3 4 + 5 *` → 35 mit Stapelvorschau
- `rechner-320-dunkel.png` — 320 px Breite, kein Überlauf

Aufnahmewerkzeug: `work/rechner-shots.cjs` (nicht versioniert). Es protokolliert zu jeder Aufnahme
den Anzeigeinhalt — deshalb steht im Lauf `RPN-Anzeige: 3 4 + 5 * 35` und
`Programmierer-Anzeige: 61440 0xf000`. Drei Fallen des Werkzeugs sind darin ausdrücklich behandelt:
fester Debug-Port (führt zur Verbindung mit einem alten Reiter), `deleteDatabase` aus der Seite
(blockiert und legt die App still), und mehrdeutige Knopfaufschriften (`×` steht auch auf dem
Schließen-Knopf des Werkzeugmenüs — Tasten werden deshalb zuerst im Tastenfeld gesucht).

## Offen — braucht eine Entscheidung

1. **Schreibweise im abgelegten Term**: heute `*` und `/` (rechenbar), die Taste zeigt `×` und `÷`.
2. **RPN-Stapeltasten** `ENTER`/`DROP`/`SWAP`/`ROLL` fehlen: die RPN-Eingabe ist heute eine
   Zeichenkette, ein echter Stapel bräuchte Zustand im Kern.
3. **Ziffern `A`–`F` im Programmierer-Modus**: sie erzeugen in mathjs einen unbekannten Namen
   (`A` allein → „Der Ausdruck ist nicht lesbar"); Hexadezimalzahlen mit mehreren Stellen brauchen
   heute `0x` aus der Eingabezeile. Vorschlag: Tasten setzen ein eigenes `0x`-Schnipsel.
4. **Bruch-Zahlenmodell rechnet keine Wurzeln und Winkelfunktionen** (`sqrt(2)`, `sin(30)`,
   `cbrt(-8)` → „Cannot implicitly convert a Fraction to BigNumber"). Älter als diese Änderung,
   jetzt mit eigener Fehlermeldung („braucht das Dezimal-Modell") statt „nicht unterstützt".
5. **Variante A** (nur Tastenfeld, ohne Eingabezeile) ist nicht gebaut.

## Nicht geprüft

- Keine Bedienprüfung mit Tastatur/Screenreader über die Aufnahmen hinaus (die Tasten haben
  zugängliche Namen, das ist gesetzt, aber nicht durchgemessen).
- Keine Messung der Bruch-Genauigkeit bei großen Zahlen.
- Die Aufnahmen zeigen Dark und Light, aber nur die Standard-Rechenart in beiden Farbthemen.

## Nicht committet

`git status` zeigt geänderte und neue Dateien im Arbeitsverzeichnis; `main` steht unverändert auf
`f25cc82`. Kein Commit, kein Push — das entscheidet Thomas.


---

## Nachtrag · 2026-10-04 — offene Punkte nach eigenem Ermessen gelöst

Freigabe: „Offene Punkte nach eigenem Ermessen lösen. Fortfahren." Ergebnis:

| Punkt | Entscheidung | Beleg |
| --- | --- | --- |
| Schreibweise im abgelegten Term | bleibt `*`/`/` — Anzeige 2 ist die maschinenlesbare Fläche | Entwurf, Punkt 1 aus Nachtrag 6 |
| RPN-Stapeltasten | `SWAP` und `DROP` gebaut, arbeiten auf der **Tokenfolge**; `ENTER` bewusst nicht (leere Wirkung) | `4 3` → `SWAP` → `+` → `=` ergibt 7; Test „macht aus SWAP … eine lesbare Rechnung" |
| `A`–`F` im Programmierer | Ziffernbuchstabe setzt `0x` selbst (`A` → `0xA`, dann `F` → `0xAF`) | Aufnahme `rechner-programmierer-hex-tasten.png`, Protokoll `0xAF 0xaf` |
| Bruch-Modell ohne Wurzeln | sichtbarer Knopf **„Mit Dezimal rechnen"** statt Sackgasse | Aufnahmen `rechner-bruch-rueckfall-vorher/-nachher.png`, Protokoll `1,4142135623731` |
| Variante A ohne Eingabezeile | nicht gebaut — Anzeige 2 braucht ein schreibbares Feld | Entwurf |
| Matheschrift | bleibt Systemschrift (0 kB, keine Lizenzfrage) | Entwurf |

**Zwei weitere Fehler beim Belegen gefunden und behoben:**

1. Die beiden Stapelgriffe rutschten im Raster — `SWAP` landete neben `e`, `DROP` allein in einer
   Reihe. Die Null ist jetzt drei Zellen breit, beide stehen nebeneinander in der letzten Reihe.
2. Die Rasterprüfung konnte das nicht sehen (sie prüft nur Überläufe). Neu: eine ausdrückliche
   Zusicherung, dass beide Griffe in derselben Reihe direkt nebeneinander liegen.

**Stand der Prüfungen nach diesem Schritt**

| Prüfung | Ergebnis |
| --- | --- |
| `npm run catalog:generate` | gelaufen: 41 Werkzeuge, 3 Sprachen |
| `npm run typecheck --workspaces` | grün |
| `npm run test --workspaces` | **331 Tests grün** (vorher 325) |
| `npm run lint` | grün |
| `npm run build` + Bundle-Audit | grün: Startbündel 136.962 B gzip, Rechenkern-Chunk 103.670 B |
| Werkzeugtexte de | 26.848 B von 30.720 B (+445 B) |

**Aufnahmen:** jetzt **zwölf** in `uebergabe/07-pruefung/rechner-welle7/`; neu dazu
`rechner-programmierer-hex-tasten.png`, `rechner-bruch-rueckfall-vorher.png`,
`rechner-bruch-rueckfall-nachher.png`, `rechner-rpn-stapelgriffe.png`. Das Aufnahmeskript
protokolliert zu jeder Aufnahme den Anzeigeinhalt — im Lauf steht deshalb
`Hex über Tasten: 0xAF 0xaf`, `Bruch-Modell: … Mit Dezimal rechnen`,
`nach dem Rückfall: 1,4142135623731` und `Stapelgriffe: 3 4 + 7`.

**Nichts committet**, `main` unverändert auf `f25cc82`.
