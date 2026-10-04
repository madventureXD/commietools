# ADR 0008: Lizenzangabe aus der Paketdatei, wo das Lockfile sie nicht liefert

**Status:** angenommen
**Datum:** 2026-10-04

## Kontext

Die Lizenzprüfung las die Lizenz eines Fremdpakets **ausschließlich** aus `package-lock.json` und
brach ab, wenn dort kein Ausdruck stand:

```
License audit failed: @pip-it-up/core@0.2.0 has no license expression in package-lock.json
```

`@pip-it-up/core` (aufgenommen mit ADR 0007) deklariert seine Lizenz nicht im `package.json` — es
hat kein `license`-Feld. Die Lizenz steht ausschließlich in der beigelegten `LICENSE`-Datei
(MIT). Eine Durchsicht aller rund 50 Pakete im Projekt zeigte: **dieses Paket ist der einzige
Ausreißer**, es gibt keinen Gewohnheitsfall.

Zugleich verlangt ADR 0001, dass eine Lösung „vollständig in die Lizenzdatenbank aufgenommen werden
kann". Ohne einen Weg für diesen Fall wäre der Kandidat an einem Muss-Kriterium gescheitert und
Eigenentwicklung zulässig geworden — obwohl die Lizenz bekannt, gelesen und unstreitig ist. Das wäre
eine Ablehnung aus Formalie, nicht aus Rechtslage.

Im Projekt gab es dafür bereits ein Muster: `licenses/artifacts.json` führt Lizenzen von Hand mit
Quellenangabe, für eingebettete WASM-Binärdateien, die das Lockfile ebenfalls nicht beschreibt.

## Entscheidung

`licenses/overrides.json` führt einzelne, namentlich beschlossene Ausnahmen. Die Prüfung zieht einen
solchen Eintrag nur heran, wenn `package-lock.json` keinen Lizenzausdruck liefert, und nur dann,
wenn **alle** folgenden Bedingungen erfüllt sind:

1. Der Eintrag nennt **genau eine Name-Version-Kombination**. Eine neue Fassung des Pakets fällt
   durch, bis sie einzeln beschlossen ist.
2. Der Eintrag führt den **SHA-256 der Lizenzdatei** mit. Die Prüfung vergleicht ihn bei jedem Lauf
   gegen den tatsächlichen Dateiinhalt; eine geänderte Datei lässt den Eintrag verfallen
   („override … is stale").
3. Die genannte Lizenz muss in `licenses/policy.json` unter `allowedExpressions` stehen — die
   Ausnahme umgeht die Lizenzpolitik **nicht**, sie ersetzt nur die Quelle des Ausdrucks.
4. Der Eintrag nennt Grund, Datum und den zugehörigen ADR.

Die Herkunft wird sichtbar geführt: `licenseSource: "reviewed-override"` im Register und der Zusatz
„(from package LICENSE, reviewed)" in `THIRD_PARTY_NOTICES.md`.

## Folgen

- Die Lizenzordnung wird **nicht** aufgeweicht: es entsteht kein Sammel-Ausweg und keine automatische
  Ableitung aus Lizenztexten. Jede Ausnahme ist ein eigener, datierter Beschluss mit Beleg.
- Eine Ausnahme kann nicht stillschweigend auf andere Pakete wachsen — der Hash und die feste
  Version binden sie an genau eine Datei.
- Die Prüfung selbst wurde verletzt, um zu belegen, dass sie greift: verfälschter Hash → „is stale";
  falsche Version → „no reviewed override"; entfernter Eintrag → „no license expression". Danach
  wieder grün.
- **Künftige Kandidaten mit fehlendem Lizenzfeld sind nicht automatisch zulässig.** Ein Eintrag
  erfordert Beschluss und ADR; bleibt beides aus, scheitert der Kandidat wie bisher.
