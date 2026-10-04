# Übergabe: Genauigkeitsampel des Rechners umgesetzt

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Auftrag:** Thomas, 2026-10-04: „Schau bitte nach, geplant ist eine Ampel die anzeigt ob die Rechnung exakt ist, oder intern gerundet wurde." Danach: „Konzept so berichtigen", Antworten auf die fünf Entscheidungsfragen, zuletzt: **„Go"**.
**Status:** abgeschlossen (Umsetzung und Nachweise fertig; **nichts committet**)

## Ziel der Sitzung

Prüfen, was zur Genauigkeitsampel geplant ist; das Konzept auf belegter Grundlage berichtigen; nach
Thomas' Entscheidungen die Ampel bauen — Kern, Oberfläche, Erklärung, automatisches Ausweichen, Texte in
drei Sprachen — und alles am Artefakt prüfen.

## Ergebnis

**1. Das Konzept hatte einen falschen tragenden Satz.** Es behauptete, der Vergleich „14 gegen 64
Stellen" sei mit dem heutigen Kern möglich, und führte „keine Änderung am Rechenkern" als Nicht-Ziel.
Gemessen am echten Kern: `evaluate` liefert `display` **und** `raw` als 14-Stellen-Text, die Option
`precision` ändert die Ausgabe nicht. Der volle Wert liegt intern vor, kam aber nicht heraus. Ohne
Kernänderung hätte die Ampel **raten** müssen. Konzept datiert berichtigt, Beleg unter
`07-pruefung/rechner-ampel/2026-10-04-genauigkeitsmessung.txt`.

**2. Die Ampel ist gebaut und misst statt zu schätzen.** Der Kern gibt `full` (64 Stellen) getrennt aus;
die Ampel steht auf grün (`=`), wenn `raw === full`, sonst auf rot (`≈`). Beide Zustände sind zusätzlich
an Zeichen und Text unterscheidbar, nicht nur an der Farbe.

**3. Thomas' Entscheidungen sind umgesetzt:** Form B (22-px-Punkt mit Zeichen in der Fläche) ·
Ausweichen **einmalig** (Einstellung bleibt auf Bruch) · **zweistufig** · keine Zahl in der Erklärung ·
kein Knopf „mit 64 Stellen kopieren".

**4. Drei Fehler im eigenen Vorgehen, gefunden im Beleglauf und behoben:**

| Fehler | Beleg | Behebung |
|---|---|---|
| Scheinbruch nach dem Modellwechsel: `√2` im Bruch-Modell ergab `14142135623731/10000000000000` | Beleglauf, erster Durchgang | Ergebnis bleibt nach dem Modellwechsel dezimal |
| Erklärung lief bei 320 px über den Rand (links 158 px, rechts 454 px) | Beleglauf, erster Durchgang | Unter 640 px liegt sie als Blatt am unteren Rand; gemessen jetzt 12–308 px |
| Tastatur öffnete die Erklärung nicht: `focus()` setzte den Fokus, aber es kam **kein** Fokusereignis an | eigene Messung (`work/ampel-focus-probe.cjs`) | Öffnen liegt in CSS (`:focus-within`, `:hover`), Anheften per Klick — unabhängig von React-Ereignissen |

**5. Vier Messungen am Artefakt** (vollständig in `07-pruefung/rechner-ampel/aufnahmen.txt`):
Ampel 22 × 22 px · Anzeigehöhe 181 px **mit und ohne** Ampel, beim Öffnen der Erklärung unverändert
(176 px / 184 px) · Erklärung ohne Überlauf bei 320 px und 390 px · Kontraste 5,76 / 5,27 / 4,80 zu 1
(AA für Text ab 4,5:1). Sieben Aufnahmen: grün dunkel, grün hell, rot mit offener Erklärung,
rot mit Modellwechsel, 320 px, 390 px, Graustufen.

## Geänderte Bereiche

- `packages/tools/src/calculator/core.ts` – `Calculation.full` ergänzt; `formatValue` nimmt die
  Genauigkeit als Parameter; `raw` unverändert
- `apps/web/src/calculator-ui.ts` – `accuracyOf(raw, full)` mit Begründung des Zeichenkettenvergleichs
- `apps/web/src/tools/Calculator.tsx` – Ampel (Form B), Erklärung, automatisches einmaliges Ausweichen,
  `clearResult` als gemeinsamer Rücksetzer, Ampel aus im RPN-Modus und bei anderer Anzeige-Basis
- `apps/web/src/styles.css` – Ampel und Erklärung; Blatt ab 640 px abwärts
- `packages/tools/src/calculator/locales/{de,en,es}.ts` – sieben neue Schlüssel je Sprache
- `packages/tools/src/catalog/generated/messages/{de,en,es}.ts` – mit `npm run catalog:generate` erneuert
- `apps/web/src/calculator-ampel.test.ts` – **neu**, 8 Tests (Zustände, Fehlerfall, `math.equal`-Gegenprobe, Texte je Sprache)
- `uebergabe/03-konzepte/2026-10-04-rechner-ampel.md` – zwei datierte Nachträge (Berichtigung, Entscheidungen)
- `uebergabe/04-entscheidungen/0006-voller-wert-und-genauigkeitsampel.md` – **neu**
- `uebergabe/06-protokolle/2026-10-04-rechner-ampel.md` – **neu**
- `uebergabe/05-uebergaben/2026-10-04-rechner-ampel.md` – **neu** (diese Datei)
- `uebergabe/07-pruefung/rechner-ampel/` – **neu**: 7 Aufnahmen, `aufnahmen.txt`, Genauigkeitsmessung
- `work/ampel-shots.cjs`, `work/ampel-check*.ts`, `work/ampel-focus-probe.cjs` – Aufnahme- und Messwerkzeuge (nicht versioniert, `work/` ist ausgenommen)

## Entscheidungen und Annahmen

- **Zweistufig heißt: Rot deckt zwei Gründe ab** — „die Anzeige ist nicht der volle Wert" und „es musste
  automatisch das Dezimal-Modell einspringen". Unterschieden werden sie nur noch durch den sichtbaren
  Hinweistext. Bewusste Vereinfachung, im Konzept festgehalten.
- **Abweichung vom Konzept (datiert festgehalten):** Der Entwurf wollte bei `numberModel` die Ampel
  **rot** setzen. Bei zweistufiger Anzeige wäre das im Fall `√4` im Bruch-Modell eine Falschaussage
  (Ergebnis exakt `2`, trotzdem „gerundet"). Die Ampel folgt deshalb dem Wert; der Modellwechsel steht
  als Text daneben.
- **Keine neue Farbmarke:** grün und rot sind die vorhandenen `--color-success` und `--color-brand`. Die
  im Entwurf vorgeschlagene Gelbmarke entfällt mit der zweistufigen Entscheidung.
- **Annahme, ausdrücklich benannt:** Dass die Ampel im RPN-Modus ausbleibt, ist eine Folge des heutigen
  Stapels (er trägt die gerundete Anzeige weiter) und keine Produktentscheidung von Thomas. Der Punkt
  steht als Folgemaßnahme im Protokoll.
- **Verhalten der Ampel unterhalb der Anzeigeschwelle:** Werte unter 1e-13 gelten für die Anzeige als `0`
  (Taschenrechner-Konvention), deshalb steht `sin(pi)` auf vollständig. Bewusste Festlegung, mit Test
  festgehalten.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **grün** — Lizenzprüflauf (522 Pakete), Registerprüfung (41 Werkzeuge), Typecheck, **339 Tests in 18 Dateien** |
| `npm run lint` | grün |
| `npm run build` | grün, Startbündel 136.967 B gzip (Schwelle 204.800), Rechenkern `core-DcY3n-Oi.js` 103.709 B |
| Werkzeugtexte Deutsch | 26.972 von 30.720 B gzip (+569 B zum Referenzstand) |
| Bundle-Audit | bestanden; keine statisch erreichbare PDF- oder Rechen-Engine |
| Zustände am Artefakt | `1/3+1/6` grün; `1/3`, `2/7`, `√2`, `π`, `1/3×3`, `2^0,5` rot — im Browser, mit Aufnahme |
| Automatisches Ausweichen | `√2` im Bruch-Modell: Ergebnis `1,4142135623731`, Ampel rot, Hinweis sichtbar, Einstellung bleibt **Bruch (exakt)** |
| Erklärung: Maus / Tastatur / Tippen | alle drei Wege geöffnet (CDP-Messung: `Maus true, Tastatur true, Tippen true`) |
| Anzeigehöhe | 181 px mit und ohne Ampel; beim Öffnen der Erklärung unverändert |
| Schmale Breiten | 320 px und 390 px ohne Überlauf; Graustufenaufnahme vorhanden |
| Kontraste | Rot dunkel 5,76:1 · Rot hell 5,27:1 · Grün hell 4,80:1 (AA ab 4,5:1) |

**Nicht geprüft (ausdrücklich offen):**

- **Kein echter Screenreader-Lauf.** Geprüft sind nur der zugängliche Name, `aria-expanded` und die
  Sichtbarkeit. Ein Durchgang mit Vorleser steht weiter aus (seit Welle 5 offen).
- **Kein echter Tastaturlauf über `Tab`.** Der Weg ist über programmatischen Fokus belegt; gemessen
  wurde, dass die Erklärung dann erscheint — nicht, dass eine reale Tastendruckfolge durch die ganze
  Seite führt.
- **Spanisch nicht gegengelesen.** Die drei Sprachen sind über den Test „jeder Schlüssel vorhanden"
  abgesichert, nicht sprachlich geprüft.
- **Kein Produktionslauf.** Alle Nachweise stammen von `npm run preview` auf diesem Rechner.

## Offene Punkte und Risiken

- [ ] **Nichts committet.** Siehe Git-Abschnitt; `main` bleibt auf `f25cc82`.
- [ ] **Ampel im RPN-Modus fehlt** (Begründung in ADR 0006). Nachrüsten hieße: der Stapel reicht den
      vollen Wert weiter statt der Anzeige.
- [ ] **Ampel im Programmierer-Modus mit anderer Anzeige-Basis bleibt aus** — gleiche Bauart, anderer
      Grund (die Anzeige ist eine Schreibweise).
- [ ] **`tool.calculator.exactNote`** sagt „Gerechnet wird exakt". Mit der Ampel wäre „ohne
      Gleitkomma-Artefakte" genauer; Textänderung noch nicht gemacht.
- [ ] **Erklärung überlagert bei geöffnetem Zustand einen Teil der Anzeige** (wie ein Kurzhinweis). Sie
      ändert keine Höhe und verschwindet beim Weggehen; ob das so bleiben soll, ist eine
      Geschmacksfrage für Thomas.
- [ ] **Werkzeugtexte Deutsch bei 26.972 von 30.720 B** — die Reserve bleibt knapp; die nächste
      Werkzeugwelle dieser Größe reißt sie.

## Empfohlener nächster Schritt

1. **Commit und Freigabe** sind Thomas' Entscheidung. Der Arbeitsbaum trägt weiterhin die
   uncommittete Welle 7 (Tastenfeld, 2D-Anzeige) **und** die Ampel; ein Commit betrifft beide.
2. Danach: **Online-Kontrolle** der Rechner-Suite (Barrierefreiheits- und Tastaturlauf sind erst an der
   veröffentlichten Fassung sinnvoll) — der Punkt steht seit Welle 5 offen.
3. Offene Kleinigkeit aus dem Konzept: der Text `exactNote`.

## Git

- Commit: **noch nicht committet**
- `main`: unverändert auf `f25cc82` („docs(rechner): the wave 6 handover is shippable after all")
- Arbeitsbaum: die Änderungen dieser Sitzung sind `packages/tools/src/calculator/core.ts`,
  `apps/web/src/calculator-ui.ts`, `apps/web/src/tools/Calculator.tsx`, `apps/web/src/styles.css`,
  `apps/web/src/calculator-ampel.test.ts`, die drei Sprachdateien, die drei erzeugten
  Nachrichtenpakete sowie die Dokumente unter `uebergabe/`. **Fremde, uncommittete Änderungen** aus
  Welle 7 (`keypad.ts`, `render.ts`, `App.tsx`, `calculator-core.test.ts`, `package.json`,
  `functions.ts`, `history.ts`) liegen daneben im selben Arbeitsbaum — ein Commit muss sie mitnehmen,
  sonst ist `HEAD` nicht baubar.
