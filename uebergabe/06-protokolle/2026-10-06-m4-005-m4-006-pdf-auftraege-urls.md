# Fortschrittsprotokoll: M4-005 und M4-006 — Auftragsgeneration und URL-Lebensdauer im PDF-Teiler

**Datum:** 2026-10-06
**Status:** teilweise — Belege erbracht, **ein Abnahmefall nicht herstellbar**, ein Produktfehler gefunden und behoben

## Umfang

Die beiden Belegarbeiten der Stufe R3 am **PDF-Teiler** (`apps/web/src/tools/PdfSplit.tsx`):
**M4-005** (spätes Ergebnis eines alten Auftrags darf den neuen nicht überschreiben, Dateiname aus
dem Auftrag) und **M4-006** (`URL.createObjectURL`/`revokeObjectURL` genau einmal je Ergebnis, auch
beim Verlassen der Route). Der Code beider Karten war bereits umgesetzt; offen war die Abnahme.

## Gefundener und behobener Produktfehler

**Der Aktionsknopf blieb nach einem Dateiwechsel dauerhaft gesperrt.** Läuft ein Auftrag und wird
währenddessen eine andere Datei gewählt, darf der alte Auftrag den Fortschritt nicht beenden (sein
`finally` prüft die Generation, damit er nicht den Fortschritt eines *neuen* Auftrags beendet) —
aber niemand setzte ihn zurück. Ergebnis: `processing` blieb `true`, der Knopf blieb `disabled`, die
Werkzeugseite war eine **Sackgasse** (im ersten Beleglauf ließ sich B nicht starten: nach 30 s
weiterhin 0 Ergebnisse, kein Fehlertext).

**Behebung** an der Invalidierungsstelle in `selectFile`: `setProcessing(false)` neben
`generationRef.current += 1` und `clearResults()`. Damit endet der Fortschritt dort, wo der Auftrag
für ungültig erklärt wird — nicht im alten Auftrag, der dazu nicht berechtigt ist.

## Ergebnisse (belegt am ausgelieferten Build, Edge headless über CDP)

- **M4-005, Wirkung belegt:** A = 1200-Seiten-PDF, B = 3-Seiten-PDF mit anderem Namen und anderem
  Seiteninhalt. Nach dem Dateiwechsel läuft B allein: **3 Ergebniseinträge**, Teil 1–3.
  A's 1200 Ausgaben wurden **vollständig verworfen** und ihre Adressen sofort freigegeben.
  Nach **+20 s** unverändert — A trug nichts nach.
- **Inhalt geprüft, nicht nur die Anzahl:** Die drei Ausgabedateien wurden über ihre Blob-Adresse
  abgerufen, abgelegt und mit einem **unabhängigen** Leser (`pdfjs-dist` im Node) gelesen:
  jede 1 Seite, Text `SEITE-B-1`, `SEITE-B-2`, `SEITE-B-3` — **0 von 3 mit `SEITE-A`**.
- **M4-006, Zähler ausgeglichen:** `create = 1203` (1200 A verworfen + 3 B), `revoke = 1200`,
  **offen = 3** bei sichtbarem Ergebnis. Nach **clientseitigem** Routenwechsel (gleiches Dokument,
  also echter Unmount): `revoke = 1203`, **offen = 0**.
- **Bedienbarkeit während eines Auftrags:** Der Umschalter reagierte nach **1–8 ms**; der
  Hauptthread ist während der Verarbeitung **nicht** blockiert.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Ausgabedateien mit richtiger Quelle | **3 von 3** (`SEITE-B`) | `work/m4-005-text.mjs` |
| Ausgabedateien mit falscher Quelle | **0 von 3** | dito |
| URL-Zähler nach B-Ergebnis | create 1203 / revoke 1200 / offen 3 | `work/m4-005-inhalt.cjs` |
| URL-Zähler nach Unmount | create 1203 / revoke 1203 / offen 0 | `work/m4-005-abnahme.cjs` |
| Reaktionszeit der Oberfläche während A | 1–8 ms | dito |
| Verarbeitungsdauer A (1200 Seiten) | rund **0,6 s** | Zeitmarken der Seite |
| Tests / Prüfkette | 667 grün, `check`/`build` Exit 0 | `npm run check && npm run build` |

## Nicht erfüllter Abnahmefall (ausdrücklich benannt)

**„A zuletzt fertig" ließ sich nicht herstellen.** Die Karte verlangt: A starten, B wählen, B fertig,
**A zuletzt** fertig. Gemessen ist der Teiler schneller als jede Bedienhandlung — 1200 Seiten
ergeben 1200 Dokumente in rund 0,6 s (Zeitmarken der Seite: A-Ergebnis bei 7931 ms, B-Klick bei
10260 ms). Versuche, A künstlich zu verlängern, wurden als **Prüfmittel**-Eingriffe wieder verworfen:
eine CPU-Bremse (Faktor 15 → A weiterhin zuerst; Faktor 40 → Seite nicht mehr geladen) und mehr
Seiten halfen nicht.

**Was stattdessen belegt ist:** die *Wirkung* der Maßnahme — A's vollständiges Ergebnis wurde
verworfen, nichts davon wurde sichtbar, B blieb allein sichtbar und speicherbar mit geprüftem
Inhalt. **Nicht belegt** ist damit die Reihenfolge „A kommt nach B zurück"; der Schutz greift
belegt für den Fall „A kommt zurück, nachdem B gewählt wurde".

**Ebenfalls offen:** Unmount während eines **Fehler**wegs (der Erfolgsweg ist belegt), und der
StrictMode-Zyklus — im ausgelieferten Build ruft React Effekte nicht doppelt auf (das tut es nur im
Entwicklungsmodus), der Zähler ist dort also nicht zusätzlich belastet; ein Lauf gegen `vite dev`
fehlt.

## Eigene Fehler im Prüfmittel (offen benannt)

1. **Veraltete DOM-Knoten-ID:** Das Dateifeld wird von React nach einem Ereignis ersetzt; die
   gemerkte Knoten-ID zeigte auf einen abgehängten Knoten, die zweite Datei kam nie an. Behoben:
   die Kennung wird vor **jeder** Auswahl frisch bestimmt, und der geladene Dateiname wird geprüft.
2. **Modus nicht zurückgestellt:** Die Bedienbarkeitsmessung schaltet auf „Eigene Gruppen" um und
   stellte nicht zurück; B lief danach mit der Standardauswahl `1-3; 4-6` auf einem 3-Seiten-PDF und
   scheiterte zu Recht mit „Die Seitenangabe ist ungültig." Das sah zwei Läufe lang wie ein
   Produktfehler aus. Behoben — die Beschriftungen („Jede Seite einzeln"/„Eigene Gruppen") wurden
   dafür im DOM nachgelesen statt geraten.
3. **Ein einzelner Klick kann verpuffen**, wenn React das Element unmittelbar vorher ersetzt hat;
   der Beleg prüft jetzt, ob die Verarbeitung wirklich anläuft.

## Relevante Verweise

- Commits: **`49dcaf2`** („PDF-Teiler: gesperrter Aktionsknopf nach Dateiwechsel behoben (M4-005)").
  Nachtrag vom 2026-10-06 nach der Ablage dieser Datei. **Nicht gepusht.**
- Die Prüfdateien `test-assets/m4-005-langsam-A.pdf` (599 kB) und `-schnell-B.pdf` liegen
  **unversioniert**; ihre Erzeugung steht in `work/m4-005-dateien.mjs` (außerhalb der
  Versionierung — bekannter Punkt M10-004).
- Karten: `QM/70-reparaturempfehlungen/R3.md`, M4-005 und M4-006 („Nicht tun": kein Timeout, kein
  bloßes `disabled` des Knopfes, kein globales URL-Sammelarray)
- Belegskripte (außerhalb der Versionierung, bekannter Punkt M10-004):
  `work/m4-005-dateien.mjs`, `work/m4-005-abnahme.cjs`, `work/m4-005-inhalt.cjs`,
  `work/m4-005-text.mjs`; Prüfdateien `test-assets/m4-005-*.pdf`

## Folgemaßnahmen

- [ ] **Unmount während eines Fehlerwegs** prüfen (Erfolgsweg ist belegt).
- [ ] **Sichtbarer Fehler weg vom Dateiwechsel:** nach einem neuen Auftrag bleibt ein alter
  Fehlertext nicht stehen? Im Beleg blieb der Fehler des Gruppenlaufs sichtbar, bis B erfolgreich
  lief — das ist gewollt (`setError('')` im neuen Auftrag).
- [ ] Der gemeinsame `useObjectUrls`-Hook bzw. die Erweiterung von `useDownload` auf Ergebnislisten
  (von der Karte als Weg genannt) ist **nicht** gebaut: Der Teiler räumt an drei Stellen selbst auf
  (neuer Auftrag, verworfener Auftrag, Unmount). Für M4-006 ist der Zähler ausgeglichen; eine
  gemeinsame Abstraktion wäre eine Aufräumarbeit, keine Abnahmebedingung.
- [ ] Muster auf weitere asynchrone Dateiwerkzeuge übertragen (von der Karte verlangt).

## Nachtrag 2026-10-07 (Faber): Abnahme auf dem geänderten Stand, ein Produktfehler behoben

**Entscheidung Thomas (2026-10-07, im Gespräch):** M4-005 wird **mit benannter Grenze
abgeschlossen** — die Wirkung ist belegt, unbelegt bleibt allein die Zeitreihenfolge. M4-006 wird
erst nach dem StrictMode-Lauf und einem Lauf mit wiederholter Nutzung abgeschlossen.

### Der bisher ungeprüfte Abnahmefall „Unmount während Erfolg und Fehler" — ein echter Fehler

Verlässt man die Route, **während** ein Auftrag läuft, blieben alle Ergebnisadressen offen.
Gemessen am ausgelieferten Build (`work/m4-006-unmount-laufend.cjs`), 1200-Seiten-Datei:

| Prüfung | vorher | nachher |
|---|---|---|
| Adressen nach dem Unmount während des Auftrags | create 1200 / revoke 0 / **offen 1200** | create 1200 / revoke 1200 / **offen 0** |

**Ursache:** Der Aufräumeffekt gab beim Aushängen nur die **bereits gesetzte** Ergebnisliste frei.
Die Auftragsgeneration blieb dabei unverändert, deshalb hielt sich der noch laufende Auftrag für
den aktuellen, schrieb sein Ergebnis in eine ausgehängte Komponente und erzeugte dabei Adressen,
die niemand mehr freigab. Die Zeitmarken belegen die Reihenfolge: Klick bei 6761 ms, Routenwechsel
bei 6762 ms, die Adressen entstanden erst 7239–7469 ms — also **nach** dem Aushängen.
**Behebung** an der Invalidierungsstelle: der Aufräumeffekt erhöht jetzt die Generation; der späte
Auftrag verwirft sein Ergebnis und gibt die gerade erzeugten Adressen selbst frei
(`apps/web/src/tools/PdfSplit.tsx`).

**Dritter Fall, ebenfalls gemessen** (`work/m4-006-unmount-fehler.cjs`): Aus dem **Fehlerzustand**
heraus verlassen (ungültige Seitengruppe „9-1" → „Die Seitenangabe ist ungültig."), danach
create 0 / revoke 0 / **offen 0**, keine Ausnahme, keine Konsolenfehler. Damit ist die Forderung
„Unmount während Erfolg und Fehler" in **allen drei** Ausprägungen belegt (Ergebnis sichtbar,
Auftrag laufend, Fehler angezeigt) — die frühere Folgemaßnahme ist damit erledigt.

### Kartenabnahme auf dem geänderten Stand neu gefahren

`work/m4-005-abnahme.cjs`: A = 1200 Seiten (anderer Name, anderer Seiteninhalt), B = 3 Seiten.

- `[3]` Antwortzeit der Oberfläche während A: **80 ms**; Knopf zeigt „PDF wird verarbeitet …", gesperrt.
- `[4]` nach dem Dateiwechsel ist der Knopf **wieder frei** — der am 2026-10-06 behobene Fehler
  bleibt behoben, auch mit der neuen Zeile im Aufräumeffekt.
- `[5]` B-Ergebnis: **3 Einträge**, nur B; `[6]` über **60 s unverändert** (A trug nichts nach).
- `[7]` vor dem Verlassen: create **1203** / revoke **1200** / offen **3**.
- `[8]` nach clientseitigem Routenwechsel: revoke **1203** / **offen 0**.

### Prüfmittel repariert (eigener Fehler, der einen Lauf wertlos machte)

Das Abnahmeskript merkte sich die Knoten-ID des Dateifelds **einmal** und benutzte sie für beide
Auswahlen. Im ersten Wiederholungslauf kam B deshalb nie an; der Lauf sah wie ein reiner A-Fall aus
und meldete trotzdem Erfolg (Exit 0, 1200 Einträge, „B-Ergebnis"). Jetzt wird die Kennung **vor
jeder** Auswahl frisch bestimmt, der Lauf wartet auf die Reaktion der Seite statt auf eine feste
Zeit, und er **bricht ab**, wenn der erwartete Dateiname nicht erscheint. Ohne diese Prüfung hätte
ein grüner Lauf eine Abnahme behauptet, die nie gefahren wurde.

### Weiterhin nicht herstellbar (benannte Grenze, Grund gemessen)

„A zuletzt fertig": Der Teiler erzeugt 1200 Dokumente in rund 0,6 s und ist damit immer vor jeder
Bedienhandlung fertig. Künstliche Verlangsamungen (CPU-Bremse Faktor 15 und 40, mehr Seiten) wurden
als Prüfmitteleingriff verworfen. Belegt ist der Schutz für den Fall „A kommt zurück, nachdem B
gewählt wurde".

### Neu aufgenommener offener Punkt (nicht mitbehoben, nicht gemessen)

Dasselbe Muster — eine Adresse entsteht **nach** einem `await`, ohne Aufräumen beim Aushängen —
steht an weiteren Stellen: `PdfToImages.tsx:36`, `ImageMetadata.tsx:125`, `ImageResize.tsx:140`,
`ImageWatermark.tsx:197`, `IconGenerator.tsx:160/170` sowie in den Adressgebern von
`PdfInteractiveTools.tsx`, `PdfSecurityTools.tsx`, `PdfPlacementTools.tsx`. Das ist **nicht** Teil
der Karten M4-005/M4-006; es wird als Folgearbeit geführt und ist **nicht gemessen**. Ein Mittun
ohne Beleg wäre eine Behauptung.

**Prüfkette:** `npm run check` **687 Tests in 46 Dateien**, Exit 0 · `npm run build` Exit 0,
Startbündel **148 998 B gzip** · `node --check` für beide neuen Belegskripte.
**Nicht gepusht.**

### Nachtrag 2026-10-07 zur Folgemaßnahmenliste oben

Die Punkte „Unmount während eines Fehlerwegs" und „Muster auf weitere asynchrone Dateiwerkzeuge"
sind oben offen geführt. Der erste ist mit diesem Nachtrag **erledigt**; beim zweiten ist das
Muster gefunden und benannt, die Übertragung selbst steht weiter aus.