# Übergabe: Suite „Rechnen" — Welle 2 abgeschlossen (Oberfläche)

**Datum:** 2026-10-03
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Status:** abgeschlossen und im Artefakt geprüft — **Welle 2 ist abgenommen**

## Ziel der Sitzung

Die Oberfläche für die drei neuen Modi nachziehen und damit Welle 2 abschließen: ohne
Bedienelemente war der fertige Rechenkern für Nutzer nicht erreichbar.

## Ergebnis

`Calculator.tsx` bedient jetzt vier Rechnerarten und drei Zusatzbereiche:

- **Rechnerart** als Umschaltung: Standard, Wissenschaftlich, Programmierer, RPN
- **Zahlenmodell** getrennt davon (Dezimal exakt / Bruch exakt) — vorher war „Brüche" eine
  Rechnerart, jetzt ist es das, was es ist: ein Zahlenmodell
- **Wissenschaftlich:** Winkelmodus (Bogenmaß, Grad, Gon) und 32 Funktions- und Konstantentasten
- **Programmierer:** Anzeige-Basis (HEX/DEC/OCT/BIN), Wortbreite 8/16/32/64, Vorzeichen ja/nein,
  Bitoperations-Tasten; dazu eine **Darstellungs-Karte** mit demselben Wert in allen Basen und
  im Zweierkomplement
- **RPN:** Token-Eingabe, zehn Stapeltasten, **Stapelanzeige und Rechenweg live** — inklusive
  des Stapelzustands nach jedem Schritt

## Geänderte Bereiche

- `apps/web/src/tools/Calculator.tsx` – vollständiger Umbau der Oberfläche
- `apps/web/src/calculator-ui.ts` – neue, React-freie Bedien-Helfer (`splitRpnTokens`,
  `appendSnippet`), damit die Bedienlogik ohne Browser prüfbar ist
- `packages/tools/src/calculator/core.ts` – `RpnStep` trägt den Stapel nach jedem Schritt,
  `RpnResult` den Endstapel; `calculatorErrorCodes` als Liste für die Textprüfung
- `packages/tools/src/calculator/history.ts` – Einstellungen um Rechnerart, Winkelmodus, Basis,
  Wortbreite und Vorzeichen erweitert (rückwärtskompatibel: fehlende Felder fallen auf Vorgaben)
- `packages/tools/src/calculator/locales/{de,en,es}.ts` – neue Texte, plus die **fehlenden
  Fehlertexte** für `stackUnderflow`, `stackLeftover`, `wordRange`
- `apps/web/src/calculator-core.test.ts` – 29 Tests (vorher 21)

## Entscheidungen und Annahmen

- **Vier Rechnerarten in einer Oberfläche** (Standard, wissenschaftlich, Programmierer, RPN) statt
  vier Werkzeuge — sie teilen sich denselben Rechenkern, und ein Wechsel soll den Verlauf nicht
  verlieren.
- **Der Bruchmodell-Zustand verträgt den Winkelmodus nicht** — das war ein echter Fehler aus der
  vorigen Welle, behoben in `applyAngleMode`: Der Winkelmodus wird auf das Zahlenmodell angewandt,
  nicht auf das Bruchmodell.
- **Der RPN-Stapel wird je Schritt sichtbar**, nicht nur das Ergebnis: `RpnStep` trägt den Stapel
  nach dem Schritt, die Fehlerrückgabe liefert ihn mit. Ein Rechenweg ohne Zwischenstände ist kein
  Rechenweg.
- **Die Ergebniskarte ist tabellarisch** (`<dl>`) statt einer Zeile mit Trennzeichen — bei mehreren
  Ausgabewerten (Wortbreite, Basis, Zweierkomplement) war die Zeile nicht lesbar.
- **Kein `wordSize` im Ausgabeformat der Basisumrechnung:** mathjs hängt die Wortbreite als Suffix
  an (`0xffi64`). Erst die Browserprüfung am alten Zwischenspeicher hat das aufgedeckt.

*Nachtrag 2026-10-04: Dieser Abschnitt fehlte und wurde bei der Vorlagenprüfung ergänzt — der übrige Text ist unverändert.*

## Zwei echte Fehler, die diese Sitzung fand und behob

1. **`toBase` zeigte `0xffi64`** — mathjs hängt bei gesetztem `wordSize` im Format die Wortbreite
   als Suffix an; das Suffix beschreibt die Eingabe-Notation und gehört nicht in eine Anzeige.
   Gefunden in der Artefaktprüfung, nicht im Test — die Tests prüften nur `ok`, jetzt die
   konkrete Schreibweise.
2. **Der Winkelmodus brach im Bruchmodell ab** (`unsupported`): `math.unit` nimmt einen
   `Fraction` nicht an. Brüche werden für die Winkelumrechnung in eine Dezimalzahl gehoben;
   dass eine Winkelfunktion im Allgemeinen keinen Bruch ergibt, steht als Begründung im Code.

## Prüfungen (alle bestanden)

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | grün: Lizenzprüfung, Katalog, Typecheck, **218 Tests** (13 Dateien) |
| `npm run build` | grün |
| Rechenkern-Chunk | **102.436 B gzip** — Budget 110 KiB, eingehalten |
| Startbündel | **206.547 B gzip** — Budget 250 KiB, eingehalten |
| **Fehlschlagprobe** Funktionsliste | belegt: `log2Dependencies` entfernt → Test meldet `log2: log2(1024) -> unknownName`; zurückgenommen, wieder grün |
| **Artefaktprüfung** Edge headless | durchgeführt: sin(30) in Grad = 0,5 · 255 = `0xff` / `0o377` / `0b11111111` · RPN `3 4 + 5 *` = 35 mit Stapel [35] und Rechenweg „3 + 4 = 7 [7]", „7 * 5 = 35 [35]" · zwei Fensterbreiten (1100 px, 390 px) · hell und dunkel |

**Wichtiger Fallstrick, der eine Messung wertlos machte:** Der erste Artefaktlauf zeigte weiter
`0xffi64`. Ursache war der **Service Worker der PWA** — er lieferte den vorigen Build aus. Seit
dieser Sitzung laufen die Prüfskripte mit `Network.setCacheDisabled` und
`Network.setBypassServiceWorker`. Ohne diesen Bypass prüft man den alten Stand und hält es für
eine echte Messung.

## Offene Punkte

- `npm run bundle:check` ist derzeit **nicht** Teil von `check` oder `build`; die Zahlen oben
  stammen aus einem eigenen Lauf von `scripts/bundle-audit.mjs`.
- Ein zweites RPN-Beispiel mit Variablen ist in der Oberfläche nicht ausgeschrieben; der Kern
  kann es (Test vorhanden).

## Empfohlener nächster Schritt

Welle 3 ist in derselben Sitzung umgesetzt worden — siehe
[`2026-10-03-rechner-welle3.md`](2026-10-03-rechner-welle3.md). Danach folgt Welle 4
(Umrechnen und Kalender) mit der ersten neuen Engine.

## Git

- Arbeitsbaum gemeinsam mit der parallel laufenden PDF-Arbeit; Commit **`af3c019`** (Welle 2 und
  Welle 3 in einem Commit), siehe Welle-3-Übergabe. Nicht gepusht.

---

## Hinweis zur Fassung (2026-10-07)

Diese Übergabe wurde am 2026-10-04 im Commit `6e33dc3` **strukturell an die
Vorlage angeglichen** (Abschnitte umgestellt, Text verschoben); dabei wurden in dieser Datei
**1 Zeile(n) entfernt oder ersetzt** (19 hinzugefügt). Die Angleichung ist hier
**sachlich gekennzeichnet**, nicht bewertet, und es wird keine Absicht zugeschrieben.

Die Fassung **davor** ist unverändert abrufbar:
`git show 6e33dc3^:uebergabe/05-uebergaben/2026-10-03-rechner-welle2-oberflaeche.md`. Die Git-Geschichte selbst ist
**nicht** verändert worden.

*Aufgenommen im Durchzug der QM-Stufe R8 (Karte M10-003). Ab dem 2026-10-07 gilt das
Aktenkorrekturverfahren in `00-einstieg/arbeitsregeln.md`, Abschnitt „Aktenkorrektur":
ergänzen statt umschreiben, datierter Nachtrag mit ersetzter Aussage, Grund, richtiger Aussage
und Beleg.*
