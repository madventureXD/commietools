# Fortschrittsprotokoll: M4-004 — Werkzeugladefehler bekommen einen Fehlerweg

**Datum:** 2026-10-07
**Status:** **abgeschlossen mit einer benannten, gemessenen Abweichung** (kein Retry im selben Dokument)
**Karte:** M4-004 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`
**Auftrag (Thomas, 2026-10-07, im Wortlaut):** „Voller Kartenumfang: Werkzeugtext-Fehlerweg +
Generationsschutz + Abnahme über einen echten Netzausfall vor dem Browser (~2–3 h)"

## Was offen war

Der Ladeeffekt der **Werkzeugtexte** in `App.tsx` hatte kein zweites Argument: Eine Ablehnung war
eine **unbehandelte Zusage**, `ready` wurde nie wahr, und die Werkzeugseite stand für immer im
Ladehinweis — kein Ende, keine Meldung, keine Wiederherstellung. Ebenso hatten der Katalogindex,
das Werkzeugmenü, die Suiten-Seite und der Katalogschlüssel-Weg der Werkzeugroute keinen
Fehlerweg. Eine Fehlergrenze für die nachgeladenen Werkzeuge gab es **nicht**: Ein gescheiterter
`lazy()`-Import riss die Seite mit einem leeren Bildschirm ab.

## Umgesetzt

1. **Sichtbarer Fehlerweg der Werkzeugtexte** (`App.tsx`, `ToolPage`): übersetzte Meldung
   (`tool.loadFailed`) statt endlosem Ladehinweis, mit dem kontrollierten Neuladen.
2. **Fehlergrenze für die Werkzeugoberfläche** (`apps/web/src/ToolErrorBoundary.tsx`, neu):
   fängt den Fehler des nachgeladenen Werkzeugs und zeigt eine Meldung statt eines leeren
   Bildschirms.
3. **Zwei Fehlerarten getrennt** (`apps/web/src/tool-load-recovery.ts`, neu, reine Funktionen):
   `istVeralteteFassung` unterscheidet den **veralteten Deployment-Chunk** (Meldung
   `tool.chunkStale`) vom **Auswertungsfehler** (`tool.chunkFailed`).
4. **Schleifensperre** (`darfNeuLaden`): Das Neuladen wird **einmal** angeboten; der Merker liegt
   im Gerätespeicher und überlebt das Neuladen. Danach steht der Hinweis `tool.reloadAgain`.
   Kein automatisches Neuladen — es ist immer eine Entscheidung des Nutzers.
5. **Fehlerwege für Katalog, Werkzeugmenü, Suiten-Seite und Katalogschlüssel** — jeweils mit
   Meldung statt stillem Rückfall. Vorher blieb dort eine unbehandelte Zusage stehen
   (`.then` ohne zweites Argument gibt die Ablehnung an eine neue Zusage weiter, die niemand
   behandelt).
6. **Texte in allen drei Sprachen** (`tool.loadFailed`, `catalog.loadFailed`, `tool.chunkStale`,
   `tool.chunkFailed`, `tool.reloadLosesInput`, `tool.reloadAgain`, `action.reload`) —
   die Sprachprüfung `language-contract.test.ts` vergleicht die Schlüssel aller Sprachen.
7. **Tests** (`apps/web/src/tool-load-recovery.test.ts`, 5 Fälle): Erkennung der Chunk-Meldungen,
   Abgrenzung gegen Auswertungsfehler, Schleifensperre vor und nach Ablauf.

## Die Abweichung — und warum sie sein muss (gemessen, nicht behauptet)

Die Karte verlangt: „Import bewusst ablehnen, Netz herstellen, **Retry ohne Dokumentreload**".
**Das ist bei einem gescheiterten Modulimport nicht möglich.** Der Browser merkt sich eine
gescheiterte Moduladresse im Modulspeicher des Dokuments; jeder weitere `import()` derselben
Adresse scheitert sofort, **ohne** eine neue Netzanfrage.

Minimalversuch (`work/modulimport-probe.cjs`, eigene Wegwerf-Seite, Sperre über den Proxy):

```
Versuch 1 (Sperre an):  fehler: Failed to fetch dynamically imported module: .../m.js
Sperre aus, dann:
Versuch 2:              fehler: Failed to fetch dynamically imported module: … (dieselbe Meldung)
Versuch 3:              fehler: … (dieselbe Meldung)
Netzanfragen auf m.js:  genau EINE — und die war die gesperrte
```

Derselbe Befund am Produkt: Nach dem gesperrten Textbaustein zeigte der Proxy **eine** Anfrage,
3,4 s **vor** dem Klick auf den damaligen Wiederholknopf — die Wiederholung hatte keine neue
Netzanfrage gestellt.

**Folge für die Umsetzung:** Statt eines Knopfes, der nichts bewirken kann, steht das
kontrollierte **Neuladen** (neues Dokument = leerer Modulspeicher) mit Schleifensperre und
sichtbarem Hinweis, dass nicht gespeicherte Eingaben verloren gehen. Ein `?timestamp`-Anhängen an
Importe, mit dem man den Modulspeicher austricksen könnte, verbietet die Karte ausdrücklich
(„Nicht tun").

**Was der Zwischenspeicher-Fix aus dem ersten Teil trotzdem leistet:** `cachedLoader` verwirft eine
abgelehnte Zusage, damit sie den **eigenen** Zwischenspeicher nicht vergiftet. Im Browser belegt:
Nach dem Neuladen mit wiederhergestelltem Netz lädt derselbe zuvor gescheiterte Baustein sauber
(Beleg `[1d]`, keine Schlüsselnamen, kein Fehler).

## Abnahme am ausgelieferten Build (Edge headless über den Fehler-Proxy)

Fehlerherstellung **vor dem Browser** (`work/fehler-proxy.mjs`, Port 4198) — nicht über
`Network.setBlockedURLs`, das dynamische Modulimporte nicht zuverlässig trifft (Falle aus M8-002).
Skript: `work/m4-004-abnahme.cjs`, Exit 0.

| Fall | Prüfung | Ergebnis |
|---|---|---|
| 1b | gesperrte Werkzeugtextdatei | Meldung **„Die Texte dieses Werkzeugs konnten nicht geladen werden."** + Knopf **„Neu laden"** — kein Ladehinweis, kein leerer Bildschirm |
| 1c | Klick auf „Neu laden", Sperre bleibt | **neues Dokument** (Marke weg), Meldung wieder da, **kein** zweiter Neuladeknopf |
| 1d | Netz wieder da, neue Seite | Werkzeug lädt mit echtem Text („PDF-Seiten organisieren"), **keine Schlüsselnamen** |
| 2c | Sprache A (de) verzögert gesperrt, in der Zwischenzeit auf **en** gewechselt | nach dem späten Fehlschlag: **keine** Fehlermeldung, englische Texte stehen — der alte Fehlschlag beschädigt die neue Sprache nicht |
| 3a | fauler Werkzeug-Chunk (`/assets/PdfSplit-*`) gesperrt | **„Diese Programmfassung ist veraltet …"** — die Fehlergrenze fängt den Fehler, kein leerer Bildschirm |
| 3b | nach „Neu laden", Sperre bleibt | neues Dokument, Meldung wieder da, **kein** Neuladeknopf, Hinweis **„Es wurde gerade schon neu geladen …"** (Schleifensperre) |
| 4 | Chunk mit 200, aber unbrauchbarem JavaScript (Auswertungsfehler) | **„Ein Teil dieses Werkzeugs konnte nicht geladen werden."** — getrennt vom veralteten Chunk |
| 5 | Seitenmeldungen über den ganzen Lauf | **0 unbehandelte Zusagen** |

## Eigene Fehler im Prüfmittel (offen benannt)

1. **Zu früh „fertig" geprüft.** Die Bedingung des Prüfskripts „es gibt einen Knopf im `main`"
   war durch die Kopfzeilenknöpfe immer erfüllt — der Lauf las den Ladezustand und meldete
   dreimal fälschlich „kein Fehler". Jetzt wartet das Skript auf **echten Werkzeuginhalt** (`<div>`
   im Inhaltsbereich) oder auf eine Meldung und **meldet die Wartezeit mit**.
2. **Der Proxy fing meine eigene Probeseite ab.** Sie lag unter `/__probe/` — genau dem Präfix der
   Steuerpfade. Der Minimalversuch las dadurch dreimal eine JSON-Antwort statt der Seite. Verschoben
   nach `/__modulprobe/`; erst danach war die Messung aussagekräftig.
3. **Ein Variablenname doppelt vergeben** (`nachNeuladen` in Fall 1 und 3) — der Lauf brach mit
   `SyntaxError` ab. `node --check` vor jedem Lauf gehört dazu (steht so im Skill und wurde
   diesmal erst nach dem Fehlschlag gemacht).

## Prüfkette

- `npm run catalog:generate` — Exit 0, Ausgabe unverändert (Generator deterministisch).
- `npm run check` — **692 Tests in 47 Dateien**, Exit 0; **0 Lint-Fehler** (109 Warnungen, bekannte
  Folgearbeit).
- `npm run build` — Exit 0, Startbündel **149 472 B gzip** von 204 800.
- Belegskripte: `node --check` je Datei.
- Abnahme: `work/m4-004-abnahme.cjs` **Exit 0**.
- **Nicht gepusht.** Commit **`ec226ea`**.

## Offen geblieben (ausdrücklich)

- **Kein Retry im selben Dokument** — gemessene Grenze des Browsers, siehe oben. Ein Weg wäre ein
  **benannter**, begrenzter Adresszusatz beim Import (kein beliebiges Zeitstempel-Anhängen); die
  Karte verbietet ihn, und er verlangt eine eigene Adresskarte der erzeugten Chunks. Als Vorschlag
  notiert, nicht umgesetzt.
- Der **Auswertungsfehler** lässt sich in der Wirklichkeit nur über einen absichtlich beschädigten
  Chunk herstellen (so geschehen); die Einordnung selbst ist zusätzlich über Tests abgesichert.
