# Übergabe: Suite „Rechnen" — Welle 3 (Kaufmännisch, Geometrie)

**Datum:** 2026-10-03
**Bearbeitet durch:** Faber (Hermes Agent, Rolle: Werkzeuge und Kontrolle)
**Status:** abgeschlossen und im Artefakt geprüft — **Welle 3 ist abgenommen**
**Auftrag:** Thomas, 2026-10-03: „Welle 2 abschließen, danach direkt Welle 3" (parallel zur
laufenden PDF-Arbeit)

## Ziel der Sitzung

Zwei neue Werkzeuge der Suite „Rechnen" ohne neue Abhängigkeit: Werkzeug 3 „Kaufmännisch" und
Werkzeug 8 „Geometrie", mit dem Pflichtbaustein Formel-und-Quelle.

## Ergebnis

**Kaufmännisch (`commercial`)** — cent-genau, ohne neue Abhängigkeit:

- Prozent in drei Richtungen (Prozentwert, Prozentsatz, Grundwert)
- Rabatt, Aufschlag, Marge **und** Aufschlag gemeinsam — die beiden werden am häufigsten
  verwechselt, deshalb stehen Bezugsgröße und Wert nebeneinander
- Umsatzsteuer aufschlagen und herausrechnen (herausrechnen über den Faktor, nicht per Abzug vom
  Bruttobetrag)
- Skonto, Dreisatz, Zinseszins
- **Tilgungsplan** mit einstellbaren Zahlungen je Jahr (12/4/2/1)

**Geometrie (`geometry`)** — 16 Formen und Körper: Rechteck, Quadrat, Dreieck, rechtwinkliges
Dreieck, Kreis, Kreisring, Trapez, Parallelogramm, Raute, regelmäßiges Vieleck, Quader, Würfel,
Zylinder, Kegel, quadratische Pyramide, Kugel. Jede Ergebniszeile trägt ihre **Formel im
Klartext**.

## Entscheidungen — und warum

- **`BigInt` statt Gleitkomma bei Geld.** Kaufmännisches Rechnen ist die Stelle, an der
  `0.1 + 0.2` wirklich schadet. Der Kern führt Beträge in Cent mit zwölf Nachkommastellen
  Zwischengenauigkeit; `decimal.js` wäre eine neue Abhängigkeit gewesen und ist nicht nötig.
- **Der Tilgungsplan rundet jede Periode auf Cent**, wie ein Bankplan. Vorher summierte sich die
  Tilgungsspalte auf 99.999,97 € statt 100.000 € — jede Zeile für sich richtig, zusammen falsch.
  Die letzte Rate gleicht den Rest aus; seitdem geht die Summe exakt auf (Test).
- **Geometrie bleibt bei Gleitkomma**, aber mit nachvollziehbarer Anzeige-Rundung auf zwölf
  gültige Stellen: Maße sind Messwerte, Geldbeträge nicht.
- **Formelzeichen im Code, Beschriftungen im Sprachkatalog.** `A = a · b` ist Mathematik, kein
  Anzeigetext — so bleibt die Formelpflicht erfüllt, ohne Formeln dreimal zu übersetzen.
- **Zahleneingabe mit dokumentierten Annahmen:** Komma ist immer Dezimaltrennzeichen; ein Punkt
  vor genau drei Ziffern am Ende ist Tausenderpunkt, sonst Dezimalpunkt. Der ambivalente Fall
  „1.234" wird als Tausenderpunkt gelesen und ist als Annahme sichtbar.

## Geänderte Bereiche

- `packages/tools/src/calculator/commercial.ts` (neu) – Kern in `BigInt`
- `packages/tools/src/calculator/geometry.ts` (neu) – 16 Formen mit Formel je Ausgabe
- `packages/tools/src/calculator/{common,commercial,geometry}/locales/{de,en,es}.ts` (neu)
- `apps/web/src/tools/Commercial.tsx`, `Geometry.tsx` (neu), `App.tsx` (Verdrahtung)
- `apps/web/public/tools/{commercial,geometry}.svg` (neu)
- `packages/tools/src/catalog/manifests.ts` (zwei Werkzeuge, Suite-Reihenfolge),
  `packages/tools/src/locales.ts`, `packages/tools/package.json` (Unterpfade)
- `apps/web/src/commercial-geometry.test.ts` (neu, 33 Tests)

## Prüfungen (alle bestanden)

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 33 Werkzeuge, 3 Sprachen, 2.232 Suchbegriffe, 86 Dateitypen |
| `npm run check` | grün: Lizenzprüfung, Katalog, Typecheck, **218 Tests** (13 Dateien) |
| `npm run build` | grün |
| Startbündel | **206.547 B gzip** — Budget 250 KiB, eingehalten |
| Rechenkern-Chunk | **102.436 B gzip** — Gate 110 KiB, eingehalten |
| Tests Kaufmännisch | Annuität gegen unabhängige Formel, Tilgungssumme = Darlehen, Restschuld 0,00, Steuerumkehr, Skonto, Zinseszins gegen `1.03^10` |
| Tests Geometrie | jede Formel gegen unabhängige Nachrechnung (π, √, 3-4-5) |
| **Artefaktprüfung** Edge headless | Rabatt 119 @ 20 % → **23,80 / 95,20** · MwSt heraus 119 @ 19 % → **100,00 / 19,00 / 119,00** · Tilgungsplan 100.000 / 4 % / 10 Jahre → Annuität **1.012,45**, **120 Zeilen**, Restschuld **0,00** · Kreis r = 2 → **12,5663706144 m²** und **12,5663706144 m** (je 4π) mit Formelzeile · hell 1100 px, dunkel 390 px |

**Drei echte Fehler, die die Prüfungen fanden — alle behoben:**

1. Der **Tilgungsplan** summierte sich um drei Cent zu niedrig (Zwischenrundung ohne Cent-Führung).
2. Die **Zahleneingabe** las `33.333333` als 33.333.333 (Punktregel zu grob).
3. `roundForDisplay` rundete auf zwölf **gültige** Stellen, mein Test erwartete zwölf
   **Nachkommastellen** — der Test war falsch, nicht der Code.

**Eigener Fehlgriff, offen benannt:** Das erste Artefakt-Prüfskript setzte `<select>`-Felder mit
dem Setter für Texteingaben. React bekam die Änderung nie, alle Messwerte waren leer — das sah
zuerst nach einem Fehler in der Oberfläche aus und war einer im Werkzeug. Ebenso lieferte der
**Service Worker** der PWA zuerst den vorigen Build aus (sichtbar an `0xffi64`); die Skripte
umgehen ihn jetzt.

## Offene Punkte

- `npm run bundle:check` ist nicht Teil von `check`/`build`; die Zahlen stammen aus eigenem Lauf.
- Startbündel wuchs von 191.327 auf 206.547 B gzip. Ursache sind zum größeren Teil die
  **Sprachkataloge** (die neuen Werkzeuge plus die erweiterten Rechnertexte, zusammen ~34 kB roh)
  und zum kleineren Teil die parallel entstandene PDF-Arbeit. Beide Rechner-Werkzeuge laden
  ihren Kern dynamisch; im Startbündel liegen nur die Texte. Wenn das weiter wächst, ist der
  Ausweg eine abgerufene Textdatei mit Ladezustand — noch nicht nötig, aber absehbar.
- Effektivzins und Sondertilgung sind bewusst nicht enthalten (siehe Roadmap).

## Empfohlener nächster Schritt

**Welle 4 – Umrechnen und Kalender** (Werkzeug 2 „Umrechnen", Werkzeug 4 „Zeit und Datum") mit
`@js-temporal/polyfill` **nur** nach Feature-Abfrage. Achtung: vier der 18 Kalender sind im
Polyfill defekt (coptic, ethiopic, chinese, dangi) und müssen ausdrücklich als „nicht
unterstützt" gekennzeichnet werden.

## Git

- Commit: **`af3c019`** — `feat(rechner): wave 2 surface (angle, word size, RPN) and wave 3 tools`
- Welle 1: `4bed2d9` · Welle 2 Kern: `0a0b4fa`
- **Nicht gepusht.** `main` löst automatisch ein Cloudflare-Pages-Deployment auf die
  Produktivdomain aus — das ist eine Veröffentlichung und braucht Thomas' ausdrückliche Freigabe.
- Der Commit enthält bewusst auch den **generierten Katalog** (`toolIndex.ts`) und die
  App-Verdrahtung, die mit der parallel laufenden PDF-Arbeit geteilt sind; deren Einträge sind
  unverändert mitgenommen. Die PDF-Quelldateien selbst bleiben unangetastet im Arbeitsbaum.
