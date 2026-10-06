# Fortschrittsprotokoll: M3-002 (R2) — Statistik-Eingabegrammatik

**Datum:** 2026-10-06
**Status:** abgeschlossen, Beleg vollständig
**Karte:** M3-002 aus R2 (`QM/70-reparaturempfehlungen/R2.md`), Basis `a041ee0`

## Umfang

Statistikeingabe (`packages/tools/src/calculator/statistics.ts`, `parseNumbers`) und die
Hilfetexte in allen drei Sprachen. Die Karte verlangt eine **explizite Grammatik** unabhängig
vom Ausdrucksparser, mit vollständiger Tokenprüfung, gemeldeten ungültigen Tokens und ohne
geratenes Komma.

## Ergebnisse

**1. Der Befund der Karte trifft zu.** Die alte Regel lautete `/^\d+,\d+$/` und ließ damit
**jedes Vorzeichen** durchfallen: `-1,5` wurde zu `NaN`, also stillschweigend verworfen.
Ebenso fielen `+2,5` und Exponenten (`1,5e3`) durch.

**2. Neue Grammatik** — ein Token gilt nur dann als Zahl, wenn es **ganz** eine ist:

```
/^[+-]?\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?$/u
```

Damit sind Vorzeichen, Punkt **oder** Komma als Dezimalzeichen und Exponenten erlaubt. Bewusst
eng: `1,2,3` (mehrdeutige Kommaliste) und `1.234,56` (gemischte Gruppierung) werden **gemeldet,
nicht geraten**. Kein globales Komma-Ersetzen — `gcd(12,18)` bleibt ein ungültiger Token und
wird nicht zu `gcd(12.18)` verbogen (die Abgrenzung der Karte).

**3. Hilfetexte in allen drei Sprachen geändert.** Vorher stand dort „getrennt durch Leerzeichen,
**Komma** oder Zeilenumbruch" — das war irreführend, weil das Komma das Dezimalzeichen ist. Jetzt:
„getrennt durch Leerzeichen, Semikolon oder Zeilenumbruch; Punkt oder Komma als Dezimalzeichen"
(de/en/es).

**4. Tests ergänzt** — für `parseNumbers` gab es bislang **keinen** Test:
`apps/web/src/math-tools.test.ts`, Block „Statistik — Eingabegrammatik (Abnahme M3-002)",
4 Tests (Projekt 619 → **623**).

**5. Beleg an der ausgelieferten Seite** (`work/m3002-beleg.cjs`): sieben Fälle, alle BESTANDEN.

| Fall | Eingabe | Anzahl | Mittelwert | Meldung der Oberfläche |
|---|---|---:|---:|---|
| negativ-komma (Abnahmefall) | `-1,5 2,5` | 2 | 0,5 | — |
| punktzahlen | `1.5 -2.5` | 2 | −0,5 | — |
| vorzeichen-und-exponent | `+3 1,5e3 2.5E-2` | 3 | 501,008333333 | — |
| gemischte-gruppierung | `1.234,56 5` | 1 | 5 | Nicht gelesen (übersprungen): 1.234,56 |
| kommaliste-und-muell | `1,2,3 abc 7` | 1 | 7 | Nicht gelesen (übersprungen): 1,2,3, abc |
| nur-muell | `abc xyz` | — | — | Die Eingabe ist keine Zahl. |
| leer | `   ` | — | — | Bitte einen Wert eingeben. |

Damit ist auch der Punkt „dürfen nicht unbemerkt verschwinden" belegt: Die verworfenen Tokens
stehen **sichtbar** unter der Ergebnisliste. Aufnahmen:
`06-protokolle/screenshots/2026-10-06-m3002/`.

## Nachtrag 2026-10-06: Abnahme des Importvertrags

**Die Karte ist damit abgeschlossen.** Thomas hat den geänderten Vertrag ausdrücklich abgenommen
(Entscheidung im Gespräch, 2026-10-06): **Komma ist Dezimalzeichen, Semikolon trennt Listen** —
eindeutig, kein Raten. Damit ist die in der Karte geforderte Abnahme erteilt; die Alternativen
(Komma als Listentrenner bei ganzen Zahlen, Rückkehr zum alten Vertrag) wurden verworfen.

**Folge für die Akte:** Der Vertrag ist ab jetzt die gültige Konvention. Wer `1,2,3` eingibt, sieht
eine Meldung — das ist gewollt und keine Fehlfunktion.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Tests vorher / nachher | 619 → 623 | `npm run check` |
| Belegfälle | 7, davon 7 BESTANDEN | `work/m3002-beleg.cjs` |
| Startgröße | 148.147 B gzip (Warnschwelle 204.800) | `npm run build` |

## Relevante Verweise

- Karte: `QM/70-reparaturempfehlungen/R2.md`, Abschnitt M3-002
- Beleg: `work/m3002-beleg.cjs`; Aufnahmen `06-protokolle/screenshots/2026-10-06-m3002/`
- Prüfkette: `npm run check` grün (Katalog 62 Werkzeuge/3 Sprachen, 623 Tests in 39 Dateien)

## Folgemaßnahmen

- [ ] **Abnahme durch den Auftraggeber einholen:** Die Karte verlangt, „die Änderung des
  dokumentierten Importvertrags ausdrücklich abzunehmen". Der Hilfetext der Eingabe hat sich
  geändert (Komma ist nicht mehr Listentrenner) — das ist eine sichtbare Vertragsänderung.
- [ ] `parsePairs` (Wertepaare) hat weiterhin keine eigene Grammatikprüfung und keinen Test.