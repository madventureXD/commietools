# Protokoll 2026-10-05: Werkzeugtexte je Werkzeug (Hebel 2)

Auftrag von Thomas: „2 genauestens vorab die Funktion prüfen, dann go". Die Vorabprüfung war Teil
des Auftrags, nicht Vorbereitung.

## Ablauf

1. **Vorabprüfung der Funktion** (Auftragswortlaut): Wie laden Werkzeugtexte heute, wer liest sie,
   was passiert beim Werkzeugwechsel, was beim Sprachwechsel, was auf Karten und Suiten-Seiten?
   Dabei fiel auf, dass **Karten, Werkzeugschublade und Suiten-Seite Titel und Kurztext über
   `t(tool.titleKey)` aus dem Textpaket lesen** — das seit Hebel 1 erst auf einer Werkzeugroute
   geladen wird. Beleg der Vorabprüfung: `work/sprachpaket-funktionspruefung.cjs`, 22 Schlüsselnamen
   auf der Startseite. **Der eigene vorige Schritt war fehlerhaft.**
2. **Behebung zuerst** (Commit `4caa7b8`): neuer Baustein `apps/web/src/tool-texts.ts`; Karten,
   Schublade und Suiten-Seite lesen die Katalogtexte aus dem Suchpaket, mit Rückfall auf die
   Sprachschlüssel. Danach 0 Schlüsselnamen.
3. **Planänderung gemeldet und freigegeben:** Weil das Suchpaket auf jeder Seite ohnehin geladen
   wird, kann auch die Werkzeugkopfzeile Titel und Beschreibung von dort nehmen; das Textpaket
   braucht sie dann nicht mehr. Thomas hat den angepassten Plan mit „2 go" freigegeben.
4. **Umsetzung:** Erzeuger (Paket je Werkzeug + gemeinsames Paket, veraltete Dateien entfernen),
   Lader in eigener Datei, Oberfläche je Werkzeug, Bündelprüfung je Route, Chunk-Namen, Prüfungen.
5. **Zwischenbefund beim ersten grünen Bau:** Der Eingang wuchs um 2,6 kB gzip, weil die
   Verweiskarte über 147 Module im Startbündel lag. Deshalb die Textlader in eine eigene Datei, die
   erst auf einer Werkzeugroute geholt wird → Eingang wieder bei 146.408 B gzip.
6. **Harter Fehler, von `check`/`build` nicht gesehen:** `ToolPage` rief Haken nach dem
   Ladehinweis-Rückgabewert; der neue Zustand löste einen zweiten Durchlauf mit anderem
   Hakenbestand aus, React brach den Aufbau ab, die Werkzeugseite blieb leer. Gefunden mit
   `work/werkzeugseite-diagnose.cjs` (Konsole der laufenden Seite), behoben durch Verschieben der Haken.
7. **Belege:** Netzbeleg (`07-pruefung/hebel2/beleg.txt`), Funktionsprüfung, Rechner-Beleg,
   `npm run check` (381), `npm run build`, `viewport:check`.

## Zahlen

| Kennzahl | vorher | nachher |
|---|---:|---:|
| Werkzeugroute, Textlast (de+en, Rechner) | 52.333 B gzip | 6.813 B gzip |
| Werkzeugroute, Textlast (größtes Werkzeug) | 52.333 B gzip | 9.884 B gzip |
| gemeinsames Paket (de) / größtes Werkzeugpaket (de) | — | 3.349 / 1.850 B gzip |
| Summe aller 49 Pakete (de) | 27.310 B gzip | 35.102 B gzip (+28 % durch gzip-Kopf je Datei) |
| Startbündel | 146.393 B gzip | 146.408 B gzip |
| Pakete insgesamt | 6 | 147 (+ 3 Suchpakete) |

## Entscheidungen unterwegs

- **Gemeinsames Paket je Sprache** statt eines Pakets je Bereich: die Zuordnung Werkzeug → Bereich
  wäre über Namensmuster geraten. Rund 3,3 kB gzip auf jeder Werkzeugroute sind der Preis; dafür ist
  die Zuordnung eindeutig.
- **Textlader in eigener Datei** statt im Paketzeiger: sonst zahlte die Startseite 2,6 kB gzip für
  etwas, das sie nie braucht.
- **Zwei Kennzahlen in der Bündelprüfung**: Summe je Sprache (Wachstumsschutz) und Last je Route
  (die Zahl, die ein Besuch zahlt). Eine Einzelpaket-Schwelle wäre durch 147 kleine Pakete
  wirkungslos geworden.
- **Veraltete Pakete werden gelöscht und gemeldet** — sonst bleibt die Datei eines entfernten
  Werkzeugs für immer liegen.
- **`loadAllToolTexts`** bleibt für Prüfungen erhalten; die Oberfläche benutzt es nicht.

## Lehren

- Ein Beleg, der die betroffene Seite nicht ansieht, beweist für sie nichts: `check`, `build`,
  `viewport:check` und der Netzbeleg waren grün, während die Werkzeugseite leer blieb und der
  Katalog Schlüsselnamen zeigte.
- Haken gehören vor jeden Rückgabewert. Dass React „0 Haken" im ersten Durchlauf durchgehen ließ,
  hat den Fehler monatelang verdeckt.
- Bei Aufteilung in viele kleine Pakete ist die **Summe** eine andere Zahl als die **Last je
  Route**; beide gehören in die Prüfung, sonst wird eine der beiden Schwellen wirkungslos.