# Fortschrittsprotokoll: Genauigkeitsampel des Rechners

**Datum:** 2026-10-04
**Status:** abgeschlossen

## Umfang

Umsetzung des Konzepts [`03-konzepte/2026-10-04-rechner-ampel.md`](../03-konzepte/2026-10-04-rechner-ampel.md)
nach Thomas' fünf Entscheidungen (Form B, Ausweichen einmalig, zweistufig, keine Zahl, kein Kopierknopf):
Kernänderung, Ampel in der Anzeigezeile, Erklärung (Maus, Tippen, Tastatur), automatisches einmaliges
Ausweichen ins Dezimal-Modell, Texte in drei Sprachen, Nachweise im Browser.

## Ergebnisse

- **Kern:** `Calculation` trägt `full` (voller Wert, 64 Stellen) neben `display` und `raw`; `raw` bleibt
  die 14-Stellen-Anzeige. Der Vergleich `raw === full` entscheidet die Ampel — gemessen, nicht geschätzt.
- **Ampel (Form B):** 22 × 22 px, Zeichen `=` (grün, `complete`) oder `≈` (rot, `rounded`) in der
  Punktfläche, in der Merker-Zeile neben `DEZ`/`BRUCH`/`HEX`. Zustandstext im zugänglichen Namen.
- **Erklärung** öffnet per Zeigen (Maus), per Ansteuern (Tastatur) und per Anheften (Tippen/Klick).
  Auf Bildschirmen bis 640 px liegt sie als Blatt am unteren Rand (bei 320 px lief eine Sprechblase an
  der Ampel über den Rand — gefunden und behoben).
- **Automatisches Ausweichen:** Bruch-Modell + `√2` → Ergebnis im Dezimal-Modell, Ampel rot, sichtbarer
  Hinweis, Einstellung bleibt auf **Bruch (exakt)**.
- **Drei Fehler im eigenen Vorgehen gefunden und behoben** (siehe unten).

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Webtests | 339 in 18 Dateien | `npm run check`, 2026-10-04 |
| Lizenzprüflauf | 522 Pakete, 16 Texte, 188 Dokumente | `npm run licenses:check` |
| Werkzeugregister | 41 Werkzeuge, 3 Sprachen, 2.730 Begriffe, 92 Dateitypen | `npm run catalog:generate` |
| Startbündel | 136.967 B gzip (Schwelle 204.800) | `npm run build` |
| Rechenkern-Chunk | 103.709 B gzip (`core-DcY3n-Oi.js`) | Bundle-Audit |
| Werkzeugtexte Deutsch | 26.972 von 30.720 B gzip (+569 B) | `npm run build` |
| Ampelgröße | 22 × 22 px | CDP-Messung, `rechner-ampel/aufnahmen.txt` |
| Anzeigehöhe | 181 px mit und ohne Ampel; 176/184 px beim Öffnen unverändert | CDP-Messung |
| Erklärung bei 320 px | links 12 px, rechts 308 px (kein Überlauf) | CDP-Messung |
| Kontrast Rot dunkel / Rot hell / Grün hell | 5,76 / 5,27 / 4,80 zu 1 | CDP + WCAG-Rechnung |

## Die drei eigenen Fehler

1. **Fokusereignis blieb aus.** Der erste Beleglauf verlangte die Erklärung über React-Ereignisse
   (`onFocus`). Gemessen: `document.activeElement` war die Ampel, aber es kam **kein** `focus`/`focusin`
   an — die Erklärung blieb zu. Der Tastaturweg liegt jetzt in CSS (`:focus-within`, dazu `:hover`,
   angeheftet per Klick). Das ist unabhängig davon, ob ein Ereignis als React-Ereignis ankommt.
2. **Scheinbruch nach dem Modellwechsel.** Nach dem automatischen Ausweichen stand
   `14142135623731/10000000000000` als Bruch in der Anzeige — eine Genauigkeit, die es nicht gibt. Jetzt
   bleibt das Ergebnis nach dem Modellwechsel dezimal.
3. **Erklärung lief bei 320 px über den Rand** (links 158 px, rechts 454 px bei 320 px Fensterbreite).

Dazu zwei Fehler im Aufnahmewerkzeug selbst: ein Fluchtzeichen ergab einen ungültigen regulären Ausdruck
in der Seitenauswertung, und ein Fehler in der Seite rutschte als `undefined` durch und verdeckte die
Ursache. Beides ist im Werkzeug behoben (Seitenfehler werden jetzt mit Zeilennummer und Ausdruck gemeldet).

## Relevante Verweise

- Commit: `noch nicht committed` (Arbeitsbaum)
- Konzept: [`03-konzepte/2026-10-04-rechner-ampel.md`](../03-konzepte/2026-10-04-rechner-ampel.md)
- ADR: [`04-entscheidungen/0006-voller-wert-und-genauigkeitsampel.md`](../04-entscheidungen/0006-voller-wert-und-genauigkeitsampel.md)
- Belege: `07-pruefung/rechner-ampel/` (7 Aufnahmen + `aufnahmen.txt` + Genauigkeitsmessung)
- Übergabe: [`05-uebergaben/2026-10-04-rechner-ampel.md`](../05-uebergaben/2026-10-04-rechner-ampel.md)

## Folgemaßnahmen

- [ ] Ampel im RPN-Modus nachrüstbar machen: dazu müsste der RPN-Stapel den **vollen** Wert weiterreichen
      statt der 14-Stellen-Anzeige (heute bewusst ausgelassen, siehe ADR 0006).
- [ ] Hinweistext `tool.calculator.exactNote` prüfen: er sagt „Gerechnet wird exakt" — mit der Ampel wäre
      „ohne Gleitkomma-Artefakte gerechnet" genauer.
