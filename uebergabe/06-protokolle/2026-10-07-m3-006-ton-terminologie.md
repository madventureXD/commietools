# M3-006 — Ton und Terminologie: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Karte:** `QM/70-reparaturempfehlungen/R6.md`, M3-006 (R6)
**Auftrag:** Thomas, wörtlich: „R6 Go, durchziehen."
**Status:** **erledigt** — vier echte Anredeverstöße behoben, Stilnachtrag verankert, Stilcheck gebaut.

## Bestandsaufnahme

Die Entscheidung vom 2026-10-06 (unpersönlicher Infinitiv statt tú) war weitgehend umgesetzt. Ein
Durchlauf mit einem neuen Kandidatenmelder über Shell, PDF-common und alle Werkzeug-Locales ergab
**42 Kandidaten**; die Beurteilung von Hand ergab **vier echte Anredeverstöße**:

| Schlüssel | vorher (2. Person) | jetzt (unpersönlich) |
|---|---|---|
| `tool.pdfViewer.description` | „**Abre** y busca en archivos PDF…" | „**Abrir** y buscar en archivos PDF…" |
| `tool.pdfSignature.description` | „**Coloca** una imagen de firma…" | „**Colocar** una imagen de firma…" |
| `tool.pdfSignature.summary` | „**Coloca** una firma electrónica…" | „**Colocar** una firma electrónica…" |
| `tool.detach.placeholderHint` | „**Puedes** seguir trabajando allí; … si **quieres**." | „**Se puede** seguir trabajando allí; … si **se desea**." |
| `tool.calc.copyFailed` | „…; **selecciona** el texto a mano." | „…; el texto **debe seleccionarse** a mano." |

**Positivkontrollen (bewusst NICHT geändert, mit Begründung):**
- `app.promise` „Tus herramientas. Tu dispositivo. Tus datos." — **Markenslogan**, keine
  Bedienanweisung; im Konzept als Markenzeile geführt.
- `catalog.intro` „respetuosas con tus datos" — Werbeton der Katalogseite, gleiche Begründung.
- `tool.watermark.textPlaceholder` „© Tu nombre" — **Platzhalter-Beispielwert**, in den der Nutzer
  seinen eigenen Namen schreibt.
- Dritte Person: „El dibujo **usa** …", „La calculadora **guarda** …", „no **se** guarda nada" —
  genau der Fall, den die Karte nennt („dritte Person ist nicht automatisch persönliche Anrede").
- Substantive: „**marca** de agua" (Wasserzeichen), „TU Darmstadt" (Normquelle, kein Pronomen).

## Umsetzung

- **Stilcheck:** `scripts/style-audit.mjs` → `npm run style:check`. Er **meldet nur Kandidaten**
  (Rückgabewert 0, `--streng` erzwingt 1) und trennt Suchsynonyme (`*.terms`) von Bedientexten.
  Kandidatenliste vorher/nachher: `work/r6-m3-006-kandidaten.txt` (42) und
  `…-nachher.txt` (37).
- **Warum der Prüfer nicht urteilt:** Ein Versuch, den Satzkontext automatisch zu klassifizieren
  (dritte Person vs. Anrede), lieferte widersprüchliche Ergebnisse („El dibujo usa" als Kandidat,
  „la calculadora guarda" je nach Nachbarschaft anders). Das wäre **falsche Sicherheit** gewesen;
  die Klassifikation wurde entfernt und im Skript begründet.
- **Stilnachtrag (datiert, alter Wortlaut bleibt):** in
  `uebergabe/03-konzepte/2026-10-03-sprachpaket-spanisch.md` unter dem Ansprache-Satz, plus Verweis
  in `uebergabe/02-architektur/sprachpakete.md`. Damit **widerspricht das aktive Konzept der neuen
  Regel nicht mehr** — die tú-Zeile ist als Stand vom 2026-10-03 gekennzeichnet, die Entscheidung
  vom 2026-10-06 gilt.

## Abnahme der Karte

| Abnahmepunkt | Ergebnis |
|---|---|
| Stilcheck meldet Kandidaten, Mensch entscheidet mit Kontext | ✓ 42 Kandidaten gemeldet, Beurteilung von Hand (Tabelle oben), Suchsynonyme getrennt |
| 62-Tool-Texte gegen Shell/PDF-common querlesen | ✓ dieselbe Liste umfasst Shell, PDF-common und alle Werkzeug-Locales (`packages/tools/src/**/locales/es.ts`, 54 Dateien) |
| erlaubte dritte Person und Substantive als Positivkontrollen | ✓ benannt und unverändert (siehe oben) |
| neue Regel widerspricht dem aktiven Konzept nicht mehr | ✓ datierter Stilnachtrag, alter Wortlaut erhalten |
| UI-Nachweis der geänderten Texte | ✓ Beleg `work/r6-m3-006-beleg.cjs`: `/tools/pdf-viewer` zeigt „Abrir y buscar …", `/tools/pdf-visible-signature` zeigt „Colocar …", keine Imperativform mehr |

## Prüfkette

`npm run check` **Exit 0** (709 Tests in 50 Dateien, 0 Fehler) · `npm run build` **Exit 0**.
Commits: Code und Akte (siehe `git log`). Nichts gepusht.

## Grenzen

- Der Stilcheck ist ein **Kandidatenmelder**, kein Nachweis. Er kann Anredeverstöße übersehen
  (Wort nicht im Muster) und er meldet weiterhin 37 Kandidaten, die überwiegend dritte Person sind.
- **Keine muttersprachliche Endabnahme** — die Beurteilung ist fachlich begründet, aber nicht von
  einer spanischsprachigen Person bestätigt.
- Akzente wurden nicht als Kodierungsfehler gewertet (so bereits der historische Vermerk der Karte);
  geprüft wurde die Anredeform.
