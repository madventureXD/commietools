# Fortschrittsprotokoll: Welle A der Handwerkerwerkzeuge (Suite „Handwerk")

**Datum:** 2026-10-04 · **Bearbeitet durch:** Faber (Hermes Agent)

## Abgeschlossen

- **Neue Kategorie und Suite `craft` / „Handwerk"** in `packages/core` (`ToolCategory`) und in den
  drei Sprachdateien (`category.craft`, `suite.craft.title`, `suite.craft.description`).
- **Vier Werkzeuge gebaut, geprüft und im Katalog** (Vorschläge 4, 6, 17 und 8 des Konzepts
  `03-konzepte/2026-10-03-handwerkerwerkzeuge.md`):
  `concrete`, `roof`, `metal-weight`, `wood` — Schwellenwert Einträge je Werkzeug: Manifest,
  Kurzbeschreibung ≤ 120 Zeichen, Suchbegriffe mit `#Tag`, Symbol, dreisprachige Texte vollständig.
- **Keine neue Abhängigkeit.** Die im Konzept genannten Pakete (`fraction.js`, `decimal.js`,
  `js-quantities`, `unitmath`, `convert-units`) sind ersatzlos entfallen.

## Prüfstand

| Prüfung | Ergebnis |
|---|---|
| `npm run catalog:generate` | 45 Werkzeuge, 3 Sprachen, 45 Symbole, 3.018 Suchbegriffe |
| `npm run check` | bestanden — 375 Tests in 22 Dateien |
| `npm run lint`, `npm run build` | bestanden, `bundle:check` bestanden |
| Belegaufnahme im Browser | 16 Bilder mit abgelesenen Werten gegen unabhängige Nachrechnung |

## Befunde, die festgehalten wurden

- **Fachquellenangaben zu Rohrgewichten stimmen nicht mit der Grundformel überein** (Rundrohr
  +1,5 %, Rechteckrohr −24 %). Prüfmaßstab sind deshalb die exakte Nachrechnung und die
  unabhängigen Faustformeln der zweiten Quelle. Siehe Zwischenbericht Metallgewicht.
- **Erstbelegung im Beton-Werkzeug stand auf Magerbeton** statt auf Standardbeton C20/25 —
  im Browserbeleg aufgefallen und korrigiert.
- **Zwei eigene Testerwartungen waren falsch** (zu streng gerundet; falscher Aluminium-Wert auf
  Grundlage der unzuverlässigen Fremdangabe). Korrigiert, nicht das Ergebnis angepasst.
- **Warnschwelle der Werkzeugtexte gerissen:** Deutsch 32.080 B, Spanisch 31.130 B gegen
  30.720 B. Ausweg (Aufteilung je Suite) steht in `01-stand/offene-punkte.md`.

## Nicht erledigt

- `npm run viewport:check` und automatisierte Barrierefreiheitsprüfung (in der Übergabe benannt).
- Welle B des Konzepts (Ausbau) — auf Thomas' Anweisung während der Sitzung zurückgestellt.
