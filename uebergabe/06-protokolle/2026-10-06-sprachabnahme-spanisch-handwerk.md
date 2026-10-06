# Fortschrittsprotokoll: Sprachliche Abnahme Spanisch der Suite „Handwerk"

**Datum:** 2026-10-06  
**Status:** teilweise — Prüfung abgeschlossen, **Freigabe steht aus** (zwei Entscheidungen offen)

## Umfang

Gegenlesen der spanischen Fassung der **zehn** Handwerk-Werkzeuge: elf Quelldateien
(`packages/tools/src/craft/*/locales/es.ts` und `craft/common/locales/es.ts`), zusammen **521
Schlüssel je Sprache** (Deutsch, Englisch, Spanisch gleich viele — die Schlüsselgleichheit erzwingt
zusätzlich `catalog:check`). Zusätzlich geprüft: die Rahmentexte der Werkzeugseite
(Zurück-Knopf, Auskoppeln, Navigation, Fußzeile), die Darstellung bei **1360 px und 320 px** in
Edge headless (zehn Routen, Sichtprüfung mit geöffneten Abschnitten) und die Frage nach deutschen
Resten.

Anleitungen vor der Arbeit gelesen: `uebergabe/02-architektur/sprachpakete.md` (§5 Inhaltliche
Regeln, §6 Unicode und Sonderzeichen, §9 Prüfmatrix „Sprachlich" und „Visuell und funktional",
§11 Statusmodell), `docs/ui-system.md`.

Grundlage der Prüfung war der deutsche Wortlaut, nicht die englische Fassung — Abweichungen
zwischen beiden wurden mitgelesen.

## Ergebnisse

### Zwei Befunde

1. **Die Anredeform ist gemischt (formell „usted" und informell „tú" nebeneinander).**
   Gemessen im ganzen Projekt, betroffen sind 20 Stellen:

   | Form | Vorkommen | Fundstellen |
   |---|---:|---|
   | informell | 13 | „Elige el archivo" (QR, Bild-Metadaten, Größe ändern, Wasserzeichen, Farbwerkzeuge), „Introduce" (Rechner-Rahmen, Aufmaß, kaufmännischer Rechner), „Rellena" (PDF-M4, Katalog), „Marca" (PDF-Platzierung, Katalog) |
   | formell | 7 | „Elija el archivo" (PDF-Rahmen, Bilder→PDF, Zusammenführen), „Elija una imagen" (Farbwerkzeuge), „Introduzca" (JSON), „Rellene" (Handwerk-Rahmen) |

   **Belegt und besonders deutlich:** `packages/tools/src/image/color/locales/es.ts` widerspricht
   sich **in derselben Datei** — Zeile 17 „Elige el archivo", Zeile 30 „Elija una imagen primero".

   **Grundlage der Empfehlung:** Der deutsche Wortlaut ist durchweg unpersönlich („Datei
   auswählen", „Für eine Palette zuerst ein Bild auswählen"); im ganzen deutschen Bestand stehen nur
   drei persönliche Imperative. Die spanische Mischung hat also keine Entsprechung im Original. Nach
   `sprachpakete.md` §1 gehört „Anrede, Ton, zentrale Terminologie" zur Entscheidung **vor** der
   Übersetzung — sie ist nie getroffen worden. Empfehlung: unpersönlicher Infinitiv
   („Seleccionar archivo"), damit die Frage umgangen wird und der Ton zum Deutschen passt.
   **Entscheidung steht bei Thomas.**

2. **Dieselbe Referenz wird zweimal verschieden wiedergegeben.** Die Konzeptdatei des Projekts
   heißt in fünf Dateien unverändert «Handwerkerwerkzeuge» (Pflaster, Trockenbau, Bodenbelag,
   Fliesen, Farbe), in `craft/metal/locales/es.ts` dagegen übersetzt „concepto de herramientas para
   oficios". Beide Wege sind vertretbar, **nebeneinander aber nicht**: ein Leser sieht zwei
   Bezeichnungen für dieselbe Sache. Vorschlag: bei der Mehrheit bleiben («Handwerkerwerkzeuge»).

### Widerlegte Verdachtsfälle (geprüft und verworfen — damit sie nicht wieder auftauchen)

- **„Descoplar" gibt es nicht.** Im verkleinerten Bild glaubte ich, das zu lesen; die Quelle und die
  Messung am DOM sagen `Desacoplar en su propia ventana`. Kein Fehler.
- **„Estampado" für „Muster"** entspricht dem deutschen Aufbau (Werte: „Sin rapport", „Rapport
  recto", „Rapport a medio desfase" = „Ansatzfrei", „Gerader Rapport", „Halbversetzter Rapport").
- **„Chopo negro" für „Schwarzpappel"** ist die richtige Art (Populus nigra), nicht zu eng gefasst.
- **„Superficie" für „Untergrund"** steht genauso in der englischen Fassung („Surface, paint and
  wallpaper") — keine spanische Abweichung.
- **Keine deutschen Reste:** Umlaute und ß kommen in den spanischen Handwerk-Dateien nicht vor
  (allein die unveränderte Konzeptbezeichnung «Handwerkerwerkzeuge»).
- **Keine Einschränkung verloren:** Die Negationen des Originals sind vorhanden („El par de apriete
  **no** se propone", „Los huecos de puerta **no** se descuentan", „No incluido, a propósito").
- **Keine Überbreite, keine abgeschnittenen Texte:** zehn Routen bei 1360 px und 320 px, Dokument-
  breite gleich Ansichtsbreite in allen zwanzig Durchgängen; Sichtprüfung mit allen Abschnitten
  geöffnet.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Geprüfte Quelldateien | 11 (10 Werkzeuge + gemeinsamer Block) | Zählung |
| Schlüssel je Sprache | 521 / 521 / 521 (de, en, es) | `grep` über die Sprachdateien |
| Zeilen spanischer Text | rund 550 | Zählung |
| Gemischte Anredeformen | 20 Stellen (13 informell, 7 formell) | `grep` mit Wortliste |
| Widerspruch in einer Datei | 1 (`image/color/locales/es.ts`, Zeile 17 gegen 30) | Datei gelesen |
| Uneinheitliche Referenz | 5 zu 1 | Dateien verglichen |
| Sichtprüfung | 10 Routen × 2 Breiten, 0 Überbreite | `work/sprachbilder.cjs` |
| Rahmentexte | 6 geprüft, alle korrekt | DOM-Auslesung |
| Tests / Build | 440 Tests bestanden; Build EXIT 0 | `npm run check`, `npm run build` |

## Relevante Verweise

- Commit: siehe „Git" im Sitzungsbericht (Belege)
- Konzept: `03-konzepte/2026-10-03-sprachpaket-spanisch.md`,
  `03-konzepte/2026-10-03-handwerkerwerkzeuge.md`
- Regelwerk: `02-architektur/sprachpakete.md` §1 (Entscheidung vor Beginn), §5, §9, §11
- Belege: `06-protokolle/screenshots/2026-10-06-spanisch-handwerk/`
- Messwerkzeug: `work/sprachbilder.cjs`, `work/sprachvergleich-handwerk.cjs`

## Offene Punkte

- [ ] **Anredeform entscheiden** (Empfehlung: unpersönlicher Infinitiv) — 20 Stellen im Projekt,
      davon 13 informell und 7 formell; danach ist die Regel im Glossar festzuhalten.
- [ ] **Referenz «Handwerkerwerkzeuge» vereinheitlichen** (eine Stelle, Vorschlag: Mehrheit folgen).
- [ ] **Der spanische Sprachstand bleibt „Lokales Testpaket" (Status 3).** Die technische Prüfung
      ist vollständig, die **sprachliche Abnahme** ist mit diesem Bericht vorbereitet, aber nicht
      erteilt — nach `sprachpakete.md` §2 und §11 gibt erst die Abnahme durch die benannte Person
      frei. Die zehn Handwerk-Werkzeuge sind jetzt gegengelesen; die übrigen Werkzeuge des
      Registers (44) noch nicht.
- [ ] Verbleibende Werkzeuge des Registers in einem Durchgang nachziehen.
