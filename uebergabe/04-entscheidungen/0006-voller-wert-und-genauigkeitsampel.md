# 0006 — Voller Wert im Rechenkern und die Genauigkeitsampel des Rechners

**Status:** angenommen
**Datum:** 2026-10-04

## Kontext

Der Rechner rechnet in zwei Zahlenmodellen: `Fraction` (exakt, rationale Arithmetik) und `BigNumber`
(64 Stellen intern). Angezeigt werden immer 14 Stellen. Der Unterschied war für den Nutzer unsichtbar:
`1/3 × 3` zeigt `1`, intern steht `0,999…9`. Das Konzept
[`../03-konzepte/2026-10-04-rechner-ampel.md`](../03-konzepte/2026-10-04-rechner-ampel.md) macht ihn
mit einer Ampel sichtbar — und die ist ein Wahrheitsanzeiger, der nicht raten darf.

Gemessen am 2026-10-04 (Beleg `07-pruefung/rechner-ampel/2026-10-04-genauigkeitsmessung.txt`):
`evaluate` liefert `display` **und** `raw` als 14-Stellen-Zeichenkette; die Option `precision` wirkt
ausschließlich auf die interne Rechnung. Der volle Wert liegt also vor, kommt aber nicht heraus.
Der erste Entwurf des Konzepts hatte daraus geschlossen, es brauche gar keine Kernänderung — das war
falsch und ist im Konzept datiert berichtigt.

## Entscheidung

1. `Calculation` erhält ein zusätzliches Feld **`full`**: derselbe Wert in der vollen
   Rechengenauigkeit, unformatiert lokalisiert, bei Fehlern leer.
2. **`raw` bleibt unangetastet** die 14-Stellen-Anzeige. Verlauf, Weiterverwendung und Variablen hängen
   daran; ein Umbiegen wäre eine stille Verhaltensänderung (Regel aus Welle 6: wer weiterrechnet, nimmt
   den Wert, nie die Anzeige).
3. Die Ampel entscheidet über den **Zeichenkettenvergleich** `raw === full` — **nicht** über
   mathjs-Vergleiche: `math.equal` prüft mit `relTol` 1e-12 und hält `1/3` fälschlich für vollständig.
4. **Zwei Zustände**: `complete` (grün, Zeichen `=`) und `rounded` (rot, Zeichen `≈`). Rot deckt auch
   den automatisch nötigen Modellwechsel ab; dessen Grund steht als sichtbarer Text dahinter.

## Folgen

- „Vollständig" heißt **nicht** „mathematisch exakt": `√2×√2` zeigt `2` vollständig an, obwohl die
  Wurzel zwischendurch gerundet wurde. Die Texte der Erklärung sagen das ausdrücklich.
- Wo die Ampel nicht ehrlich sein könnte, bleibt sie **aus**: im RPN-Modus (der Stapel trägt die
  gerundete 14-Stellen-Darstellung von Schritt zu Schritt weiter — „vollständig" wäre dort falsch) und
  im Programmierer-Modus mit anderer Anzeige-Basis (die Anzeige ist dann eine Schreibweise).
- Der volle Wert wird **nur verglichen, nie angezeigt**: keine Zahl in der Erklärung, kein Knopf
  „mit 64 Stellen kopieren" (Entscheidung von Thomas, 2026-10-04).
- Die Anzeigehöhe ändert sich durch die Ampel nicht (gemessen 181 px mit und ohne, und 176 px / 184 px
  beim Öffnen der Erklärung unverändert). Die Ampel ist 22 × 22 px (Form B).
- Die Regel ist mit Testfällen über beide Modelle belegt
  (`apps/web/src/calculator-ampel.test.ts`), einschließlich der Gegenprobe, dass `math.equal` für
  diese Frage untauglich ist.
