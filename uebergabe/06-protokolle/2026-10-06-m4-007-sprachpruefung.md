# Fortschrittsprotokoll: M4-007 (R3) — Sprachprüfung akzeptiert keine geerbten Objektschlüssel mehr

**Datum:** 2026-10-06
**Status:** abgeschlossen — Abnahmefälle der Karte alle belegt
**Karte:** M4-007 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`

## Umfang

`packages/i18n/src/registry.ts` (`isLocale`), Tests in `apps/web/src/App.test.ts`. Der Aufrufer
(`preferredLocale` in `App.tsx`) blieb unverändert — er ruft den Guard bereits vor der Verwendung.

## Ergebnisse

**1. Der Befund trifft zu.** Der Guard lautete `return value in localeRegistry`. Der
`in`-Operator fragt die **Prototypenkette** mit: `__proto__`, `constructor`, `toString`,
`hasOwnProperty`, `valueOf` galten damit als registrierte Sprachen. Über `detectLocale` und
`preferredLocale` (Speicherwert `commietools-locale`) konnte ein solcher Wert bis zum Loader
gelangen. Die Gegenprobe zeigt es wörtlich: mit der alten Zeile liefert
`detectLocale(['__proto__'])` den Wert `'__proto__'` statt des Rückfalls `'en'`.

**2. Lösung — Eigentum am Schlüssel statt Liste verbotener Namen.** Der Guard prüft jetzt
`typeof value === 'string'` **und** `Object.prototype.hasOwnProperty.call(localeRegistry, value)`.
Die Karte nennt `Object.hasOwn`; das verlangt ES2022 und ist in der `lib`-Einstellung dieses
Projekts nicht verfügbar (der projektweite Typcheck hat es gemeldet) — `hasOwnProperty.call` ist
dieselbe Aussage in einer überall verfügbaren Form.

**3. Die Signatur wurde auf `unknown` erweitert.** Die Abnahme verlangt, dass „nichtstringförmiger
Speicherinhalt" abgewiesen wird. Mit `value: string` wäre diese Prüfung nur eine Behauptung
gewesen: Zur Laufzeit kommt der Wert aus `localStorage`, und der ist nicht typisiert. Die
Erweiterung ist quellkompatibel (`string` ist `unknown`), und der alte Rumpf hätte damit gar nicht
mehr übersetzt (`value in …` verlangt `string | number | symbol`) — der Typcheck belegt, dass die
Prüfung nicht umgangen werden kann.

**4. Abgrenzung eingehalten.** Keine Liste einzelner verbotener Namen. `Object.hasOwn` beweist
Schlüsseleigentum, nicht den Inhalt beliebiger gespeicherter Objekte — das ist die Grenze der
Karte und ist hier so geblieben.

## Abnahmefälle der Karte

| Abnahmefall | Ergebnis |
|---|---|
| `__proto__`, `constructor`, `toString`, `hasOwnProperty`, `valueOf` | abgewiesen |
| leerer Wert, `de-DE`, `fr` | abgewiesen |
| nichtstringförmig: `null`, `42`, `{}`, `['de']` | abgewiesen |
| `de`, `en`, `es` | angenommen |
| dokumentierter Rückfall `es-ES` → `es`, `de-DE` → `de` | unverändert korrekt |

## Belege

- **Tests** in `apps/web/src/App.test.ts`, neuer Block „Sprachprüfung (M4-007)" mit drei Fällen.
- **Mutationsgegenprobe:** alte Zeile `value in localeRegistry` eingesetzt → genau die **drei**
  neuen Fälle rot (`expected true to be false`, `expected '__proto__' to be 'en'`), 12 übrige
  grün; Mutation zurückgenommen, 15 grün.
- **Prüfkette:** `npm run check` und `npm run build` (siehe Kennzahlen).

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Tests in `App.test.ts` | 12 → 15 | `npx vitest run src/App.test.ts` |
| geänderte Produktzeilen | 1 (Guard-Rumpf) + Kommentar | `registry.ts` |

## Folgemaßnahmen

- Keine. Die Karte nennt als weiteren Prüfpunkt die Speichereingänge (`preferredLocale`); sie
  setzen den Guard vor der Verwendung bereits ein.
