# Fortschrittsprotokoll: M8-002 (R3) — Bestandsaufnahme der Offline-Bereitschaft

**Datum:** 2026-10-06
**Status:** **Bestandsaufnahme, keine Umsetzung** — die Karte verlangt einen echten Offline-Beleg, der in dieser Sitzung nicht gefahren wurde
**Karte:** M8-002 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`

## Was gemessen wurde

**1. Die Umlaufregeln erfassen die Sprachpakete — entgegen einer naheliegenden Vermutung.**
Gemessen am erzeugten Bündel (`apps/web/dist/assets`, Namen auf ihr Muster gekürzt): **189** Chunks
tragen die Form `tools-<sprache>-<werkzeug>-<hash>.js`. Die Regel in `apps/web/vite.config.ts`

```
urlPattern: /\/assets\/(?:search|tools|ui)-[a-z]{2,3}(?:-[A-Z]{2})?-/
```

trifft diese Namen (`tools-de-aufmass-…`), sie werden also per `CacheFirst` in
`commietools-language-packs-v1` abgelegt. Dasselbe gilt für `search-*`, `ui-*`, die PDF-Engines
(`commietools-pdf-engines-v2`) und `temporal-*` (`commietools-calculator-engines-v1`).

**2. Die Werkzeugoberflächen liegen im Precache.** Die Ausschlussliste (`precacheOptions.…
ignoreURLParametersMatching`/Ausschlussmuster) nennt PDF-Werkzeuge, Engines, `temporal-`,
`search-`, `tools-`, `ui-`. Die Oberflächen-Chunks (`Wood-*.js`, `Tiles-*.js`, …) und `core-*.js`
stehen **nicht** darin — sie sind damit Teil der vorab gespeicherten Dateien und offline da.

**3. Damit ist der Befund genauer als vermutet.** Es fehlt **nicht** eine Regel für die
Sprachpakete. Der historische Vermerk der Karte sagt: „Erstbesuch plus HTTP-Cache-Verlust
scheitert; warmer Cache 48/48 erfolgreich." Die Ursache liegt beim **Erstbesuch**: Solange der
Service Worker nach dem ersten Laden noch nicht aktiv ist, laufen die dynamischen Importe am
Arbeitsfaden vorbei — die Pakete landen nur im **HTTP-Cache**, nicht im CacheStorage. Verliert der
Browser diesen (oder ist er flüchtig), fehlen sie offline, obwohl die Regel richtig ist.

## Warum hier nicht umgesetzt wurde

Die Karte schreibt selbst: „`navigator.onLine` oder ein erfolgreicher RAM-Import ist **kein**
Offlinebeleg." Die notwendige Änderung — nach der Service-Worker-Kontrolle die benötigten URLs
(aktive Sprache plus Englisch) gezielt über `fetch` anfordern, den Abschluss abwarten und das
Vorhandensein prüfen — ist eine Verhaltensänderung im **Startpfad**. Ohne die Abnahme (frisches
Profil, App und Werkzeug laden, HTTP-Cache löschen, CacheStorage behalten, Netz aus, Reload) wäre
sie unbelegt, und ein unbelegter Eingriff in den Startpfad ist genau das, was diese Karte verhindern
soll.

Der Beleg erfordert: eigenes Browserprofil, Service-Worker-Zustand, gezieltes Löschen des
HTTP-Caches bei behaltenem CacheStorage, Netztrennung. Das ist ein eigener Arbeitsgang mit
Vorbereitung (Proxy oder CDP-Netzabschaltung) und war in dieser Sitzung nicht mehr zu fahren.

## Offen (die eigentliche Kartenarbeit)

- **Erstbesuch-Sicherung umsetzen:** nach SW-Kontrolle gezieltes Nachladen der benötigten Pakete mit
  Bestätigung, oder Anzeige einer „offline bereit"-Meldung erst nach geprüftem Vorhandensein.
- Offlinebereitschaft **pro Appversion, Sprache und tatsächlich geöffnetem Werkzeug** bestimmen und
  nur aktive Sprache plus Englisch sichern (die dritte Sprache darf **nicht** geladen werden).
- Quota und Abbruch müssen „eingeschränkte" statt „vollständige" Bereitschaft melden.
- Abnahme fahren: Frischbesuch, Warmbesuch, Localewechsel, fehlendes Paket, SW-Versionswechsel.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| erfasste Sprachpaket-Chunks | 189 | `ls apps/web/dist/assets` |
| geänderte Zeilen | 0 (Bestandsaufnahme) | — |