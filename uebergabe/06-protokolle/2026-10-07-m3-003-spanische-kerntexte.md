# M3-003 — Spanische Kerntexte: erledigt

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Karte:** `QM/70-reparaturempfehlungen/R6.md`, M3-003 (R6)
**Auftrag:** Thomas, wörtlich: „R6 Go, durchziehen."
**Status:** **erledigt** — mit einem neuen Prüfer und einer ausdrücklich benannten Grenze.

## Bestandsaufnahme (gegen den Live-Stand)

Vier Stellen in `packages/i18n/src/common/es.ts` trugen Sinnverwechslungen:

| Schlüssel | vorher | Bedeutung des Wortes |
|---|---|---|
| `category.developer` | „Revelador" | „enthüllend" (wie ein Film) — nicht die Werkzeugkategorie |
| `save.saving` | „Ahorro…" | die Ersparnis — nicht der laufende Speichervorgang |
| `save.cancelled` | „Ahorro cancelado." | dieselbe Verwechslung |
| `licenses.projectDescription` | „software gratuito" | Kostenfreiheit — AGPL meint aber **Freie Software** |

Geprüft, **nicht** überschrieben: die Case-Converter-Beschreibung
(`packages/tools/src/text/case-converter/locales/es.ts`) entspricht dem Vertrag aus M3-008 und ist
sachlich richtig — sie bleibt.

## Umsetzung

- `category.developer` → **„Desarrollo"**, `save.saving` → **„Guardando…"**,
  `save.cancelled` → **„Guardado cancelado."**
- `licenses.projectDescription` → **„software libre"**. Die **Kostenfreiheit wird getrennt benannt**
  (`app.tagline`: „Herramientas gratuitas para todos.") — beide Aussagen bleiben unterscheidbar.
- **Neues Fachglossar:** `uebergabe/02-architektur/fachglossar-spanisch.md` (Schlüssel, unerwünschter
  Sinnwechsel, freigegebene Übersetzung, Begründung) plus maschinenlesbare Fassung in
  `scripts/glossary-audit.mjs` → `npm run glossary:check`, eingehängt in `npm run check`.

**Warum schlüsselgenau und nicht global:** „Ahorro" ist in der Komprimierung **richtig**
(Platzersparnis, `pdf-compress`). Eine globale Wortsuche würde entweder diesen legitimen Text
anmeckern oder den echten Fehler übersehen. Der Prüfer nennt deshalb Datei **und** Schlüssel.

## Abnahme der Karte

| Abnahmepunkt | Ergebnis |
|---|---|
| Lizenzseite auf Spanisch aufgerufen | ✓ „CommieTools es **software libre** con licencia pública general GNU Affero, versión 3 únicamente."; kein „software gratuito" |
| Entwicklerkategorie auf Spanisch aufgerufen | ✓ Werkzeugseite des JSON-Formatierers: „DESARROLLO"; Werkzeugmenü: „DESARROLLO"; „Revelador" nirgends |
| Kostenfreiheit getrennt | ✓ Startseite „Herramientas gratuitas para todos." **und** Lizenzseite „software libre" — zwei getrennte Aussagen |
| Speichern läuft/abgebrochen | ✓ Prüfer und Sprachvertrag (`save.saving`, `save.cancelled`); **in der Oberfläche nicht ausgelöst** — siehe Grenzen |
| Glossarprüfung warnt bei Rückkehr, lässt legitime Verwendungen zu | ✓ **Mutationsgegenprobe:** `save.saving` zurück auf „Ahorro…" → Exit 1 mit Meldung; zurückgenommen → Exit 0. Legitime „Ahorro"-Verwendung in `pdf-compress` bleibt unbeanstandet (Prüfer läuft grün, obwohl das Wort im Baum steht) |

## Prüfkette

`npm run check` **Exit 0** (709 Tests in 50 Dateien, 0 Fehler; `glossary:check` und `jsx:check`
laufen mit) · `npm run build` **Exit 0**. Commit `0f3c452`. Nichts gepusht.

## Grenzen

- **Keine muttersprachliche Abnahme.** Die Bewertung stützt sich auf Wörterbuchbedeutung und
  Kontext; die Karte verbietet ausdrücklich, einen Regexlauf als muttersprachlich abgenommen zu
  bezeichnen. Spanischsprachige Gegenlesung steht aus.
- Der Prüfer findet **nur die bekannten** Verwechslungen — neue Bedeutungsfehler erkennt er nicht.
- Die flüchtigen Zustände (`save.saving`, `save.saved`, `save.cancelled`) wurden **nicht** in der
  Oberfläche ausgelöst: sie erscheinen nur während eines Speichervorgangs, der sich im kopflosen
  Lauf nicht zuverlässig herstellen ließ. Belegt sind sie über Sprachvertrag und Glossarprüfer.
- Zwei Prüfmittel-Fehler unterwegs, die wie Produktfehler aussahen und als solche benannt sind:
  (1) der Beleg lief zunächst gegen den **alten Bau** (nach Textänderungen nicht neu gebaut);
  (2) die Kategoriesuche war groß-/kleinschreibungsempfindlich, obwohl die Oberfläche per CSS groß
  schreibt („DESARROLLO").
