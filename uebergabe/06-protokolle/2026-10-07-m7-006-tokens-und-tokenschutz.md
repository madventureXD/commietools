# M7-006 — Nicht definierte CSS-Tokens ließen Regeln ausfallen

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Karte:** M7-006 (R5)
**Ergebnis:** behoben, mit dauerhaftem Staticcheck.

## Was die Karte verlangt

- Alle `var()`-Bezüge auflösen; falsche Namen auf semantische Tokens abbilden.
- `--space-5` nur hinzufügen, wenn eine echte konsistente 1,25-rem-Stufe gewollt ist, sonst
  vorhandene Abstände wählen.
- Statische Prüfung auf unaufgelöste Referenzen ohne Fallback über einen Stylesheet-Parser, nicht
  per regulärem Ausdruck; rechtmäßige Laufzeit-/Bibliothekstokens ausdrücklich erlaubt.
- Abnahme: ein bekannter Tippfehler lässt die Prüfung scheitern; Fallback- und Theme-Überschreibung
  bestehen.

## Bestandsaufnahme (gemessen, vorher)

Ein Durchlauf über alle CSS-Dateien des Projekts (postcss) ergab **20 Verwendungen von acht Namen,
die nirgends definiert waren** — 18 davon **ohne** Fallback, also ungültige Deklarationen:

| Alter Name | Anzahl | Ort |
|---|---|---|
| `--space-5` | 7 | Schublade (Kopf, Suche, Sortierung, Inhalt, Fuß), Kontrastprobe |
| `--border` | 4 | PDF-Dateizeile, PDF-Zeile, Vorschau-Rahmen, Faktenzeile |
| `--muted` | 2 | PDF-Zeile, Organizer-Beschriftung |
| `--surface` | 2 | PDF-Zeile, Zeilenrahmen |
| `--accent` / `--color-accent` | 1 + 1 | Schwärzungsrahmen, aktive Vorschau |
| `--surface-muted` | 1 | Faktenzeile |
| `--warning` | 2 | Warnhinweise (mit Fallback `#b66a00`) |

**Warum das mehr als Kosmetik ist:** Nach der Spezifikation wird eine Deklaration mit unaufgelöstem
`var()` „invalid at computed-value time". Bei einer Kurzschrift wie `padding: var(--space-5) var(--space-5) var(--space-3)`
fallen damit **alle** Einzelwerte auf `initial` zurück — der Werkzeugschubkasten hatte **keine
Innenabstände**, der Inhalt klebte am Rand. Kein vorhandener Prüfer hat es gemeldet: `a11y:check`,
`viewport:check` und `bundle:check` sehen Größen, Kontraste und Überläufe, aber keine Variablen.

## Umsetzung

1. **`packages/ui/src/tokens.css`** — neue semantische Farbe `--color-warning` je Schema:
   hell `#b66a00` (unverändert der bisherige Fallback, also keine sichtbare Änderung), dunkel
   `#e0a65c`. Nicht-Text-Kontrast auf der dunklen Fläche `#181a1f`: **8,11:1** (verlangt 3:1);
   hell auf Weiß **4,16:1**.
2. **`apps/web/src/styles.css`** — falsche Namen auf vorhandene semantische Tokens abgebildet
   (`--border`→`--color-border`, `--surface`→`--color-surface`, `--surface-muted`→`--color-surface-raised`,
   `--muted`→`--color-text-muted`, `--accent`/`--color-accent`→`--color-brand`, `--warning`→`--color-warning`).
3. **`--space-5` wird NICHT eingeführt.** Die Skala lautet bewusst 1/2/3/4/6/8/12
   (0,25/0,5/0,75/1/1,5/2/3 rem) — eine 1,25-rem-Stufe bräche das Muster. Die sieben Stellen sind auf
   `--space-4` (1 rem) gezogen.
4. **`scripts/token-audit.mjs`** (neu, 164 Zeilen) — Staticcheck mit **postcss** (MIT, jetzt als
   Entwicklungsabhängigkeit deklariert, damit `npm ci` ihn garantiert). Kein regulärer Ausdruck:
   Kommentare sind eigene Knoten und zählen nicht als Verwendung; nur der Deklarationswert wird
   zusätzlich mit einem **klammerbewussten** Durchlauf gelesen, damit
   `color-mix(in srgb, var(--x, var(--y)) 9%, transparent)` nicht an der falschen Klammer endet.
   Der Aufruf `liste` gibt die Bestandsaufnahme mit Geltungsbereich aus (`:root` bzw. `[data-theme='dark']`).
   Eine Liste ausdrücklich erlaubter Laufzeit-Tokens ist vorhanden und **derzeit leer** — das Projekt
   setzt keine Variablen zur Laufzeit (geprüft über `setProperty('--…')` und Inline-Stile in `*.tsx`).
5. **`package.json`** — `tokens:check` neu, als Pflichtteil von `check` (nach `catalog:check`).

## Belege

**Mutationsgegenprobe (Abnahmefall der Karte):** `--color-border` in `.pdf-file-row` durch das alte
`--border` ersetzt → `npm run tokens:check` **scheitert** mit Exit 1 und nennt Datei, Selektor,
Eigenschaft und Wert:

```
FEHLER: 1 Verwendung(en) eines NICHT definierten Tokens OHNE Fallback.
  · --border  in apps\web\src\styles.css: .pdf-file-row { border: 1px solid var(--border) }
```

Danach zurückgenommen, Arbeitsbaum sauber.

**Wirkung im echten Layout** (`work/m7-006-token-beleg.cjs`, Beleg `work/m7-006-beleg.log`) —
berechnete Werte, Zustände erzeugt, beide Schemata über
`Emulation.setEmulatedMedia('prefers-color-scheme')`:

| Stelle | hell | dunkel |
|---|---|---|
| Schubladenkopf Innenabstand | 16px 16px 12px 16px | gleich |
| Schubladensuche Außenabstand | 0px 16px 12px 16px | gleich |
| Schublade Sortierung / Inhalt / Fuß | 0/16/12 · 0/12/16 · 12/16 | gleich |
| Kontrastprobe Innenabstand | 16px | gleich |
| PDF-Dateizeile Rahmen | `rgb(223,225,230)` | `rgb(52,56,66)` |
| Faktenfläche (Trennungsroute) | `rgb(255,255,255)` | `rgb(32,35,42)` |
| Aktive Viewer-Vorschau Rahmen | `rgb(201,31,44)` | `rgb(255,75,89)` |
| `--color-warning` | `#b66a00` | `#e0a65c` |

Vorher waren die ersten sechs Zeilen **wirkungslos** (Innenabstand 0, Rahmenfarbe nicht gesetzt).

**Kette:** `npm run licenses:generate` → `npm run check` Exit 0 (Tokenschutz greift, 695 Tests in
48 Dateien, 0 Fehler, 109 Warnungen) → `npm run build` Exit 0 („Bundle audit passed: entry 149486 B gzip").

## Benannte Grenzen

- **Der Warnhinweis selbst wurde nicht erzeugt.** `.pdf-warnings .warning` erscheint nur bei einer
  PDF mit Besonderheit (Signatur, XFA, Formulare); die beiden Testdateien haben keine. Belegt ist
  deshalb die **Farbe über den Tokenwert je Schema**, nicht das gerenderte Element. Die Karte
  verlangt genau das („Fallback bzw. Theme-Überschreibung bestehen").
- **Kein realer Vorleserlauf** — für M7-006 nicht verlangt und hier nicht nötig.

## Prüfmittel-Lehren (eigene Fehler, für die Akte)

Vier Irrwege, bevor der Beleg stand — alle im Prüfmittel, keiner im Produkt:

1. **`data-theme` von Hand am `.app` setzen ist falsch.** Die Anwendung überschreibt das Attribut
   beim nächsten Neuzeichnen aus ihrem eigenen Zustand; im Ergebnis maß der „helle" Durchgang
   dunkle Werte. Richtig ist `Emulation.setEmulatedMedia('prefers-color-scheme')` — so wie es der
   Projektprüfer `viewport-audit.mjs` tut und wie es beim Nutzer aus der Systemeinstellung kommt.
2. **Dasselbe Neuzeichnen brach die Vorschaubilder ab.** Der Viewer zeigte 0 von 3 Vorschaubildern,
   während das Dokument nachweislich geladen war („1 / 3", 125 %). Nicht das Produkt war schuld,
   sondern das erzwungene Neuzeichnen durch mein Attribut-Setzen. Ohne das Setzen: 3 Bilder, in
   beiden Schemata.
3. **Ohne `DOM.enable` löst die Knotensuche nach mehreren Navigationen still nicht auf** — die
   Datei landet in einem abgehängten Element, die Seite bleibt im Leerzustand, ohne Fehlermeldung.
   Der Beleglauf legt Dateien jetzt über die Dokumentwurzel und **scheitert laut**, wenn kein Knoten
   kommt; „nicht gefunden" ist ein Fehlschlag, kein „kein Befund".
4. **Falsche Erwartung an die Selektoren.** `.pdf-file-row` lebt in Zusammenführung/Bilder→PDF,
   `.pdf-document-facts` in der Trennung. Ein fehlendes Element wurde zuerst als Fehlschlag
   gemeldet, obwohl es auf dieser Route gar nicht existiert. Das Urteil verlangt jetzt jedes
   gemessene Element auf der Route, auf der es tatsächlich vorkommt.

**Nicht** bestätigt hat sich der Verdacht, abgeschalteter Cache oder Service Worker verhindere die
Vorschaubilder — mit und ohne Abschaltung dasselbe Ergebnis. Der Schalter bleibt im Prüfskript,
wird aber nicht benutzt.
