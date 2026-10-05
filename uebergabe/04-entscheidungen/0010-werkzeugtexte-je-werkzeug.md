# ADR 0010: Werkzeugtexte liegen je Werkzeug und je Sprache

**Status:** angenommen  
**Datum:** 2026-10-05

## Kontext

Nach dem Umbau vom 2026-10-05 (ADR 0009 sowie die Aufteilung in Such- und Textpaket) wurde das
Textpaket **erst auf einer Werkzeugroute** geholt. Es enthielt aber weiterhin die Texte **aller 48
Werkzeuge**: Wer den Rechner öffnete, lud die Texte von PDF-Werkzeugen, Bildwerkzeugen und der
Handwerk-Suite mit. Das Paket wuchs mit jedem neuen Werkzeug, obwohl ein Besuch immer nur eines
braucht.

Thomas hat den Umbau am 2026-10-05 freigegeben („2 go"), nachdem die Vorabprüfung der Funktion
einen Fehler im vorherigen Schritt aufgedeckt hatte (siehe Nachtrag in
`02-architektur/sprachpakete.md`).

## Entscheidung

1. **Ein Textpaket je Werkzeug und je Sprache**: `messages/<sprache>/<werkzeugkennung>.ts`.
2. **Ein gemeinsames Paket je Sprache** für Schlüssel ohne Werkzeugbezug
   (`messages/<sprache>/common.ts`): Rahmen- und Bereichstexte wie `tool.calc.*` (Rechnerrahmen),
   `tool.calcCommon.*`, `tool.pdf.*`, `tool.pdfPlacement.*` und `tool.craft.*`. Es wird auf jeder
   Werkzeugroute mitgeladen.
3. **Titel, Beschreibung, Kurztext und Suchbegriffe stehen ausschließlich im Suchpaket.** Die
   Werkzeugkopfzeile liest Titel und Beschreibung von dort (`apps/web/src/tool-texts.ts`), weil das
   Suchpaket auf jeder Seite ohnehin geladen wird (die Werkzeugschublade steckt im Kopfbereich).
   Das Textpaket führt damit nur noch die Texte der Werkzeugoberfläche selbst.
4. **Die Verweiskarte liegt in einer eigenen Datei** (`generated/textLoaders.ts`, eigener Chunk):
   Die Zuordnung Werkzeug → Paket umfasst 147 nachgeladene Module und kostet rund 2,6 kB gzip. Läge
   sie im Eingang, zahlte die Startseite sie bei jedem Besuch mit, obwohl sie dort nie gebraucht
   wird.
5. **Zwei Kennzahlen statt einer** in der Bündelprüfung: die Last **je Route** (gemeinsames Paket +
   größtes Werkzeugpaket) gegen die bisherige Schwelle, und die **Summe je Sprache** informativ mit
   eigener, weiterer Schwelle.

## Begründung und Messwerte

| Kennzahl | vorher | nachher |
|---|---:|---:|
| Textlast einer Werkzeugroute (deutsch + englisch, Rechner) | 52.333 B gzip | **6.813 B gzip** |
| Textlast einer Werkzeugroute (größtes Werkzeug) | 52.333 B gzip | 9.884 B gzip |
| größtes Einzelpaket (deutsch, Bild-Metadaten) | — | 1.850 B gzip |
| gemeinsames Paket (deutsch) | — | 3.349 B gzip |
| Startbündel (Eingang) | 146.393 B gzip | 146.408 B gzip |
| Summe aller 49 Pakete (deutsch) | 27.310 B gzip | 35.102 B gzip |

Die Summe je Sprache **wächst** um 28 %: jede der 49 Dateien trägt einen eigenen gzip-Kopf und ein
eigenes Wörterbuch. Das ist der ehrliche Preis der Aufteilung und der Grund, warum die Summe nicht
die Kennzahl für die Last eines Besuchs ist. Ein Besuch zahlt **ein** Werkzeug, nicht 49.

## Folgen

- Ein neues Werkzeug vergrößert kein bestehendes Paket mehr; es kommt ein eigenes Paket hinzu.
- `catalog:generate` schreibt 147 Pakete und **entfernt veraltete** Dateien (ein gelöschtes
  Werkzeug lässt sein Paket nicht liegen); `catalog:check` schlägt bei liegengebliebenen Dateien an.
- `scripts/bundle-audit.mjs` summiert die Werkzeugpakete je Sprache und prüft die Route.
- Die Werkzeugkopfzeile hängt am Suchpaket. Fällt es aus, zeigt die Kopfzeile die Sprachschlüssel —
  der Rückfall steht in `tool-texts.ts`.

## Nachtrag 2026-10-05: ein latenter Fehler wurde dabei aufgedeckt

`ToolPage` rief `useRef` und `useState` **nach** dem Rückgabewert für den Ladehinweis auf. Solange
im ersten Durchlauf **kein** Haken lief, ließ React das durchgehen; der zusätzliche Zustand
`toolCatalogue` ließ im ersten Durchlauf zwei Haken laufen, und der zweite Durchlauf rief einen
dritten — React brach den ganzen Aufbau ab („Rendered more hooks than during the previous render"),
die Seite blieb leer. `npm run check` und `npm run build` waren dabei **grün**; gefunden hat es der
Blick auf die laufende Seite. Alle Haken stehen jetzt vor dem Rückgabewert.