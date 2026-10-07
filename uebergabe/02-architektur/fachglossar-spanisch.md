# Fachglossar Spanisch (Schlüsselkontext)

**Angelegt:** 2026-10-07 (Karte M3-003, Stufe R6) · **Bearbeitet durch:** Faber (Hermes, Team 2)
**Maschinenlesbare Fassung:** `scripts/glossary-audit.mjs`, eingehängt als `npm run glossary:check`
in `npm run check`.

## Warum schlüsselgenau und nicht global

Ein unerwünschter Begriff ist nur in **dem Schlüssel** falsch, in dem er den Sinn verändert.
„Ahorro" (Ersparnis) ist beim Speichern falsch und in der Komprimierung richtig — eine globale
Wortsuche meckert entweder legitime Texte an oder übersieht den eigentlichen Fehler. Deshalb prüft
das Glossar Paare aus Datei + Schlüssel.

## Einträge

| Schlüssel | unerwünscht | freigegeben | Begründung |
|---|---|---|---|
| `category.developer` (`packages/i18n/src/common/es.ts`) | „Revelador" | „Desarrollo" | „Revelador" heißt „enthüllend" (wie bei einem Foto); gemeint ist die Werkzeugkategorie für Entwickler. |
| `save.saving` (ebd.) | „Ahorro…" | „Guardando…" | „Ahorro" ist die Ersparnis; während des Speicherns läuft der Vorgang. |
| `save.cancelled` (ebd.) | „Ahorro cancelado." | „Guardado cancelado." | Abgebrochen wird das Speichern, nicht eine Ersparnis. |
| `licenses.projectDescription` (ebd.) | „software gratuito" | „software libre" | AGPL bedeutet Freie Software; „gratuito" beschreibt nur die Kostenfreiheit. Diese wird **getrennt** benannt (`app.tagline`: „Herramientas gratuitas"). |

## Zulässige Verwendungen außerhalb dieser Schlüssel (bewusst nicht geprüft)

- „Ahorro" in `packages/tools/src/pdf/m5/locales/es.ts` und im erzeugten Sprachpaket
  `…/messages/es/pdf-compress.ts`: dort bedeutet es die Platzersparnis beim Verkleinern — fachlich
  richtig. Gemessen: `glossary:check` läuft grün, obwohl „Ahorro" im Baum an anderer Stelle steht.
- `app.tagline` („Herramientas gratuitas para todos.") nennt die **Kostenfreiheit** und bleibt
  unverändert — sie ist keine Freie-Software-Aussage.

## Prüfung

`npm run glossary:check` prüft die vier Paare und schlägt an, wenn einer der bekannten Fehler
zurückkehrt. **Mutationsgegenprobe:** `save.saving` zurück auf „Ahorro…" → Exit 1 mit Meldung;
zurückgenommen → Exit 0 (gemessen am 2026-10-07).

## Grenzen

- Der Prüfer findet **nur die bekannten** Sinnverwechslungen. Neue Bedeutungsfehler erkennt er
  nicht — dafür ist das Lektorat da.
- Es gibt **keine muttersprachliche Endabnahme**. Die Bewertung stützt sich auf Wörterbuchbedeutung
  und Kontext; die Karte verbietet ausdrücklich, einen reinen Regexlauf als muttersprachliche
  Abnahme zu bezeichnen. Spanischsprachige Gegenlesung steht weiter aus.
