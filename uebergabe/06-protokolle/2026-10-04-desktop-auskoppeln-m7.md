# Fortschrittsprotokoll: Desktop-Auskoppeln — M7 Dokumentation und Übergabe

**Datum:** 2026-10-04  
**Status:** abgeschlossen

## Umfang

Abschluss des Vorhabens „Desktop-Erfahrung: Werkzeuge auskoppeln" (M0–M5 gebaut und belegt) durch
das Arbeitspaket **M7 — Dokumentation und Übergabe**, und dabei die offene Frage nach **M6
„Verhalten ohne PiP"** beantworten. Am Code wurde in diesem Schritt **nichts** geändert; betrachtet
wurden der bestehende Stand, seine Dokumentation und die Pflichtprüfungen.

## Ergebnisse

- **`docs/ui-system.md` ist fortgeschrieben.** Neuer Abschnitt „Detaching a tool into its own
  window": wo der Knopf erscheint (Werkzeugrouten, nie Katalog/Suiten, nur bei belegter Fähigkeit),
  eine Instanz über zwei Dokumente, gemessene statt deklarierte Zielgröße mit Größen-Hilfe,
  mitgeführtem Farbschema, Barrierefreiheits-Grundlinie und den ausdrücklich **dokumentierten
  Plattformgrenzen** (Größe nicht vorschreibbar, Position nicht setzbar, ein Fenster je Tab, kein
  Überleben des Herkunftsfensters, keine Navigation darin, Vollbild gesperrt, Top-Level und HTTPS).
- **M6 ist beantwortet und belegt**, ohne neue Messung: Der Knopf hängt an einer Fähigkeitsprüfung zur
  Laufzeit; ohne brauchbare Schnittstelle erscheint er nicht (gemessen `false`/`true` in M3/M5).
  Eine Messung in Safari fand nicht statt — der Browser steht auf diesem Rechner nicht zur Verfügung.
- **Stand und Aufgabenliste sind aktualisiert** (`01-stand/aktueller-stand.md`,
  `01-stand/offene-punkte.md`), das Konzept trägt einen datierten Nachtrag zu M6/M7.
- **Beide Pflichtprüfungen sind grün** und die Zahlen des Stands stammen aus dieser Messung, nicht aus
  der Erinnerung (siehe Kennzahlen).
- **Alle Übergaben dieses Vorhabens erfüllen die Vorlage** — geprüft mit der Abschnittsschleife aus
  `00-einstieg/arbeitsregeln.md`: `…-m0.md`, `…-m2.md`, `…-m3-m5.md` und die neue `…-m7.md`
  melden je alle acht Pflichtabschnitte.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Startbündel (Arbeitsstand, mit Auskoppeln) | 145.559 B gzip von 204.800 | `npm run build` → `bundle:check`, 2026-10-04 |
| Startbündel (veröffentlichter Sammelrelease, ohne Auskoppeln) | 136.967 B gzip | `01-stand/aktueller-stand.md` |
| Kosten der Auskoppel-Bibliothek | +8.598 B gzip | dieselbe Bauausgabe |
| Nachgeladener Rechenkern | 103.709 B gzip | Bauausgabe (`route engine: core-*.js`) |
| Werkzeugtexte Deutsch | 26.972 B von 30.720 | Bauausgabe |
| Erfasste Pakete / Lizenztexte / Originaldokumente | 524 / 16 / 189 | `npm run check` → `licenses:check` |
| Werkzeuge / Sprachen / Symbole / Dateitypen | 41 / 3 / 41 / 92 | `npm run check` → `catalog:check` |
| Webtests | 339 in 18 Dateien | `npm run check` → `vitest run` |
| Belegte Werkzeug-Routen für das Auskoppeln | 41 von 41 | M5, `…-m3-m5.md` |

## Relevante Verweise

- Commit: `3548b17` — „docs(desktop): document the detach rules in the UI system and close M7"
- Konzept: `uebergabe/03-konzepte/2026-10-04-desktop-auskoppeln.md` (Arbeitspakete M0–M7)
- ADR: `uebergabe/04-entscheidungen/0007-pip-it-up-auskoppeln.md`,
  `uebergabe/04-entscheidungen/0008-lizenzfeld-fehlt-bei-pip-it-up.md`
- Übergabe: `uebergabe/05-uebergaben/2026-10-04-desktop-auskoppeln-m7.md`

## Folgemaßnahmen

- [ ] Firefox-Verhalten des Auskoppelns messen (`geckodriver` fehlt auf diesem Rechner).
- [ ] Überbreiten-Freiheit bei 1920/1366/1024/768 px prüfen — bisher nur 320 px belegt.
- [ ] Veröffentlichung durch Push auf `main` — nur auf ausdrücklichen Auftrag (löst das
      Cloudflare-Pages-Deployment aus).
