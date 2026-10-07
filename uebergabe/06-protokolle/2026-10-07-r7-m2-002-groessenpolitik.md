# R7 / M2-002 — ADR verspricht harten Größenabbruch, das Gate warnt nur: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2), Durchzug auf Anweisung von Thomas
**Auftrag (Karte, Wortlaut):** „ADR-Hartgrenze passt nicht zur bestätigten Warnpolitik." … „Datierten
ADR-Nachtrag anlegen: Größenbudgets sind Warnschwellen gemäß Nutzerentscheidung; strukturelle Regeln
… bleiben harte Fehler. Berichte trennen Messwert, Referenz, Abweichung und Prüfklasse. Eine Warnung
muss sichtbar in Übergabe/Release landen, aber darf nicht indirekt über generisches
warnings-as-errors zum Größenverbot werden."
**Status:** **erledigt** — ADR-Nachtrag geschrieben, Politik an **zwei** Gegenproben am echten Bau
belegt. **Dabei ein echter Prüfmittel-Fehler gefunden und behoben.**

## Was der Befund war

ADR 0003 sagt: „Der Produktionsbuild prüft die statische Importkette der Startseite sowie ein
komprimiertes Größenbudget und **bricht bei einer Verletzung ab**." Tatsächlich: strukturelle
Verletzungen werfen (`throw`), Größenüberschreitungen erzeugen nur `WARNUNG:`.

## Umsetzung

- **ADR 0003**, datierter Nachtrag mit Tabelle „strukturelle Regel ⇒ harter Fehler" /
  „Größenbudget ⇒ Warnung". Der Ursprungstext bleibt **unverändert**.
- Festgehalten: die Referenzdatei `scripts/bundle-size-baseline.json` wird **nur gelesen**, nie
  automatisch nachgezogen (im Skript geprüft: kein `writeFile` auf diesem Pfad) — eine Warnung
  verschwindet also nicht still.
- **Index:** Eintrag zu ADR 0003 um die Politik ergänzt.

## Abnahme — zwei Gegenproben am echten Bau

**1. Künstliche Größenüberschreitung ⇒ sichtbare Warnung, Strukturcheck erfolgreich, Bau grün.**
`warningBudgets.entry` vorübergehend auf 1024 B gesetzt und gebaut:

```
WARNUNG: initiales JavaScript 150082 B gzip (Warnschwelle 1024 B, +3665 B zum Referenzstand)
Bundle audit passed: entry 150082 B gzip; optional PDF artifacts: 19
EXIT=0
```

Die Zeile trennt **Messwert** (150082 B), **Warnschwelle** (1024 B) und **Abweichung** (+3665 B).
Danach `git checkout` der Datei (Arbeitsstand unverändert).

**2. Unerlaubter globaler Import ⇒ harter Fehler.**
`import '@neslinesli93/qpdf-wasm'` in den Starteingang `apps/web/src/main.tsx` gesetzt und gebaut:

```
Error: PDF engine is statically reachable from the initial page (by content): index-BTBcZw5Z.js
EXIT=1
```

Danach `git checkout` der Quelle.

## Produktfehler, den die zweite Gegenprobe aufdeckte (mitbehoben)

**Die erste Fassung dieser Gegenprobe bestand — der Bau blieb grün, obwohl die Engine im Startbündel
lag.** Gemessen: Eingang **150.082 → 167.133 B gzip**, dazu ein emittiertes `qpdf-*.wasm`.

**Ursache lag im Prüfmittel, nicht im Produkt:** `scripts/bundle-audit.mjs` suchte im Inhalt die
Signatur `qpdf-wasm`; die Emscripten-Brücke der qpdf-Engine trägt aber den Laufzeitnamen
**`qpdf.wasm`** (im Bündel nachgezählt: `qpdf.wasm` 4×, `qpdf-wasm` 0×). Die Dateinamen-Regel greift
hier nicht, weil das JS der CJS-Brücke in den Eingangschunk eingebettet wird.

**Behebung:** Signatur um `qpdf\.wasm` erweitert. Danach: sauberer Bau grün **ohne** Fehlalarm,
Gegenprobe 2 greift mit dem erwarteten Fehler (Exit 1). Ohne diese Nachschärfung hätte das Gate einen
statisch eingebundenen PDF-Engine-Glue durchgelassen — genau die Klasse, die laut Karte hart
scheitern muss.

## Prüfkette

`npm run build` **Exit 0** (sauberer Bau nach der Nachschärfung) — der Prüfer läuft im Bau
(`bundle:check`), nicht in `npm run check`. `npm run check` war für denselben Codestand grün
(719 Tests); die Änderung berührt nur ein Prüfskript außerhalb des Testbaums. Nichts gepusht.

## Grenzen

- Das Gate erkennt **bekannte Laufzeitsignaturen** und Dateinamen. Eine künftige Engine-Brücke ohne
  solche Signatur kann ihm entgehen; das ist keine Zusicherung, sondern eine gepflegte Sperrliste.
- Die Größenwarnungen des laufenden Stands (drei Zeilen `toolMessages … gesamt`) sind **nicht**
  behoben und nicht Teil dieser Karte — sie stehen als Warnung im Baubricht.
