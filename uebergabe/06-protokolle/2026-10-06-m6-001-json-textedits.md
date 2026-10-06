# Fortschrittsprotokoll: M6-001 (R2) — JSON-Formatierung ändert keine Zahlenwerte mehr

**Datum:** 2026-10-06
**Status:** abgeschlossen — Abnahmefälle der Karte alle belegt; eine Architekturentscheidung nötig geworden (ADR 0012)
**Karte:** M6-001 aus R2 (`QM/70-reparaturempfehlungen/R2.md`), Basis `a041ee0`

## Umfang

`formatJson` (vorher `packages/tools/src/index.ts`), neu
`packages/tools/src/developer/json-formatter/format.ts`; Oberfläche neu
`apps/web/src/tools/JsonFormatter.tsx`; Einbindung in `apps/web/src/App.tsx`;
gemeinsamer Baustein `apps/web/src/tools/text-area.tsx`; Sprachschlüssel in `de/en/es`;
neue Abhängigkeit `jsonc-parser`; ADR 0012.

## Ergebnisse

**1. Der Befund trifft zu — und er ist keine Anzeigefrage.** Der alte Weg
(`JSON.parse` → `JSON.stringify`) schreibt den Text aus Werten neu. Gemessen im Mutationslauf der
neuen Tests:

| Eingabe (gültig) | Ausgabe des alten Wegs |
|---|---|
| `9007199254740993` | `9007199254740992` |
| `"\u00e4"` | `"ä"` |

Dazu laut Karte: `1e309` → `null`, `1.2300` → `1.23`, `-0` → `0`. Das Werkzeug gab also ein
**anderes Dokument** zurück als das eingegebene, ohne Hinweis.

**2. Lösung: Textedits auf dem Originaltext.** `jsonc-parser` (MIT, ohne eigene Abhängigkeiten)
liefert Scanner, strikte Validierung und Editberechnung; `applyEdits` setzt ausschließlich
Einrückung in den Originaltext. Das parse-Ergebnis wird nie serialisiert — Zahllexeme, Escapes,
Schlüsselreihenfolge und doppelte Schlüssel bleiben unangetastet. Die Abgrenzung der Karte ist
eingehalten: **keine** BigInt-Umwandlung, **kein** Zeichenketten-Regex-Formatter, **kein** eigener
Ausdrucksparser.

**3. Die Fehlerstelle wird benannt.** Kommentare und abschließendes Komma werden abgelehnt
(`disallowComments: true`, `allowTrailingComma: false`), die Fehlerliste wird zwingend ausgewertet
und der erste Fehler als **Zeile und Spalte** angezeigt. Die Wörter dafür kommen aus dem
Sprachkatalog (`tool.jsonFormatter.errorLine` / `errorColumn`, drei Sprachen), im Code stehen nur
Trennzeichen.

**4. Eine Messung entlastet die Kartenwarnung.** Die Karte verlangt, den Fall „große Exponenten
werden als ungültig bewertet" ausdrücklich zu behandeln. Gemessen mit `jsonc-parser` 3.3.1:
`1e309`, `9007199254740993`, `-0` und `1.2300` ergeben **keine** Fehler. Der Fall tritt bei dieser
Version nicht ein — das ist belegt, nicht angenommen, und im Test festgehalten.

**5. Der Umbau war nötig, nicht Kosmetik.** `formatJson` lag in `packages/tools/src/index.ts`, und
diesen Einstieg importiert die App **statisch** — das Werkzeug gehörte damit zum Startbündel. Eine
Bibliothek dort hätte jeder Besuch mitgeladen (Verstoß gegen ADR 0003). Deshalb liegt die Logik
jetzt hinter dem eigenen Unterpfad `@commietools/tools/developer/json-formatter` und die Oberfläche
lädt über `lazy()`. Entscheidung und Kosten: ADR 0012.

**6. Der `TextArea`-Baustein ist zusammengeführt.** Er stand nur in `App.tsx`; die ausgelagerte
Oberfläche hätte ihn abgeschrieben. Er liegt jetzt in `apps/web/src/tools/text-area.tsx` und wird
von beiden genutzt (Hinweis für M4-009, das die mehrfachen Implementierungen bemängelt).

## Abnahmefälle der Karte

| Abnahmefall | Ergebnis |
|---|---|
| `9007199254740993`, `-9007199254740993`, `1e309`, `-0`, `1.2300` | Tokenfolge unverändert (Test und Browserbeleg) |
| escaped Strings | unverändert (`\u00e4` bleibt `\u00e4`) |
| doppelte Schlüssel | beide bleiben erhalten (die Karte verlangt höchstens eine Warnung, nicht mehr) |
| Kommentar / trailing comma | abgelehnt, Fehlerstelle als Zeile und Spalte |
| zweites Formatieren | idempotent |

## Belege

- **Test** `apps/web/src/json-formatter.test.ts` (6 Fälle). **Mutationsgegenprobe:** alter Weg
  eingesetzt → genau die zwei inhaltlichen Fälle rot (`expected '{"gross":9007199254740992}' to be
  '{"gross":9007199254740993}'`), die vier übrigen grün; Mutation zurückgenommen, alles grün.
- **Browserbeleg** `work/json-beleg.cjs` gegen `vite preview` (`127.0.0.1:4173`), 3 Aufnahmen unter
  `06-protokolle/screenshots/2026-10-06-m6-001/`, Ergebnisdatei `aufnahmen.txt`: **alle Prüfungen
  bestanden**, keine Konsolenfehler, kein sichtbarer Sprachschlüssel, Überbreite 0 px bei 390 px.
  Die Aufnahmen wurden angesehen.
- **Datensparsamkeit gemessen, nicht behauptet:** Startseite lädt keinen Werkzeug-Chunk (7 Skripte
  geprüft), das Startbündel `index-CwYpvqWh.js` enthält den Parser nicht (503 721 Zeichen geprüft),
  die Werkzeugroute lädt `JsonFormatter-BgLbGY3I.js` (13 665 Zeichen) **mit** dem Parser.
- **Größen:** Werkzeug-Chunk 13,67 kB / **4,86 kB gzip**; Startbündel 148 147 → **148 032 B gzip**
  (115 B kleiner trotz neuer Bibliothek). Vorabmessung der Bibliothek: 4 506 B gzip
  (`work/jsonc-messung.mjs`).
- **Prüfkette:** `npm run catalog:generate` (drei Textpakete erneuert) →
  `npm run licenses:generate` (`jsonc-parser` im Register und in `THIRD_PARTY_NOTICES.md`) →
  `npm run check` → **639 Tests, Exit 0** → `npm run build` → Exit 0, Bündelprüfung grün.

## Entscheidungen und Annahmen

- **`jsonc-parser` 3.3.1 statt Eigenbau** — begründet in ADR 0012; MIT ist in
  `licenses/policy.json` freigegeben, die Lizenzordnung blieb unangetastet.
- **Annahme:** Die Werkzeugoberfläche durfte aus `App.tsx` herausgelöst werden, obwohl die
  Werkzeuge der ersten Welle dort üblicherweise inline stehen. Grund: nur so bleibt die neue
  Bibliothek aus dem Startbündel. Die übrigen Welle-1-Werkzeuge blieben unangetastet.

## Eigener Fehler, offen benannt

Beim Eintragen des ADR-Index habe ich aus einem **abgeschnittenen** Lesevorgang (`head -25`)
geschlossen, ADR 0011 fehle im Index, und ihn „nachgetragen" — er stand längst dort. Aufgefallen
ist es erst beim Diff, der meine Zeile **doppelt** zeigte. Korrigiert: falscher Eintrag entfernt,
Reihenfolge wiederhergestellt. Lehre: ein abgeschnittenes Lesen ist keine Bestandsaufnahme.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Projekt-Tests | 633 → 639 | `npm run check` |
| Werkzeug-Chunk | 13,67 kB / 4,86 kB gzip | `npm run build` |
| Startbündel (gzip) | 148 147 → 148 032 B | Bündelprüfung |
| neue Abhängigkeiten | 1 (`jsonc-parser`, MIT, ohne Unterabhängigkeiten) | `packages/tools/package.json` |

## Folgemaßnahmen

- [ ] **Der Browserbeleg liegt unter `work/` und damit außerhalb der Versionierung** (bekannter
      Punkt M10-004). Soll er dauerhaft prüfbar sein, gehört er in den versionierten Bestand.
- [ ] Die übrigen Welle-1-Werkzeuge liegen weiterhin im Startbündel — hier absichtlich nicht
      mitgeändert.
