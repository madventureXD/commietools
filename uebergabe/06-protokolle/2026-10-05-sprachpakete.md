# Fortschrittsprotokoll: Sprachpakete — Hebel 1 und 3 (Werkzeugtexte erst beim Öffnen, Doppelung entfernt)

**Datum:** 2026-10-05  
**Status:** abgeschlossen (Hebel 2 des Plans bleibt offen)

## Umfang

Das Wachstum der Sprachpakete beim Start der Seite. Untersucht und geändert: Erzeugung der
Sprachpakete (`scripts/catalog-generate.mjs`), Ladezeitpunkt in der App (`apps/web/src/App.tsx`),
zugehörige Tests. Gemessen: Verteilung des Textpakets je Suite und Werkzeug
(`work/sprachpaket-verteilung.cjs`) und der tatsächliche Netzverkehr beim Aufruf zweier Routen mit
frischem Browserprofil (`work/sprachpaket-netzbeleg.cjs`).

## Ergebnisse

- **Die Startseite holt das Werkzeug-Textpaket nicht mehr.** Netzbeleg, frische Sitzung:
  Startseite 7 JavaScript-Dateien / **171.867 B gzip** ohne Textpaket; Werkzeugroute 13 Dateien /
  335.032 B gzip mit. **Ersparnis beim Start: 52.211 B gzip** (deutsches + englisches Textpaket).
- **Kurztext und Suchbegriffe stehen nur noch im Suchpaket.** Das Textpaket je Sprache schrumpft
  roh um rund 15 % (Deutsch 116.788 → 99.372 B), gzip von 32.672 → 27.310 B.
- **Beide Sprachen über der Warnschwelle liegen wieder darunter:** Deutsch 27.310 und Spanisch
  26.847 von 30.720 B (vorher 32.672 und 31.645).
- **Das Startbündel ändert sich praktisch nicht** (146.220 → 146.297 B gzip, +77 B): das Textpaket
  lag nie im Startbündel. Die Startgröße war die falsche Kennzahl — der Netzverkehr ist die
  richtige. Das steht so in der Übergabe, damit die Zahl nicht falsch gelesen wird.
- **Kein Schlüsselname blitzt auf:** bis die Texte geladen sind, zeigt die Werkzeugseite den
  Ladehinweis; der Rechner-Beleg über vier Routen läuft unverändert grün (8 Proben).

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Werkzeugtexte Deutsch | 27.310 B gzip (vorher 32.672) | `npm run build` |
| Werkzeugtexte Spanisch | 26.847 B gzip (vorher 31.645) | `npm run build` |
| Werkzeugtexte Englisch | 25.023 B gzip (vorher 29.787) | `npm run build` |
| Startseite, geholte JavaScript-Dateien | 171.867 B gzip (7 Dateien) | `work/sprachpaket-netzbeleg.cjs` |
| Werkzeugroute, geholte JavaScript-Dateien | 335.032 B gzip (13 Dateien) | dito |
| Textpaket roh, Deutsch | 99.372 B (vorher 116.788) | `wc -c packages/tools/src/catalog/generated/messages/de.ts` |
| Anteil Kurztext + Suchbegriffe im Textpaket | 17.475 B von 116.788 (15,0 %) — entfallen | `work/sprachpaket-verteilung.cjs` |
| Tests | 381 in 23 Dateien, alle grün | `npm run check` |

## Relevante Verweise

- Commit: `<nach dem Commit eingesetzt>`, lokal, **nicht gepusht**
- Übergabe: `05-uebergaben/2026-10-05-sprachpakete-beim-oeffnen-laden.md`
- Regelergänzung: `02-architektur/sprachpakete.md`
- Belege: `07-pruefung/sprachpaket/beleg.txt`
- Vorherige Welle zum Rechner: `05-uebergaben/2026-10-04-rechner-vier-werkzeuge.md`, ADR 0009

## Folgemaßnahmen

- [ ] **Hebel 2:** Textpaket je Werkzeug aufteilen (Auftrag liegt vor).
- [ ] **Vorab-Cache des Dienst-Workers** prüfen: Textpakete gehören in den Laufzeit-Cache, sonst
      zahlt der zweite Besuch sie wieder mit.
- [ ] Spanisches Paket sprachlich gegenlesen (unverändert offen).
- [ ] Danach zurück zur Handwerk-Suite, Welle B — die dort notierte Vorbedingung (Textsplit) ist
      erfüllt.