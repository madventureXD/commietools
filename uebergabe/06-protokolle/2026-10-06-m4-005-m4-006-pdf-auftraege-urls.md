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