# Fortschrittsprotokoll: M8-002 — Offline-Bereitschaft des ersten Besuchs

**Datum:** 2026-10-06
**Status:** **Abnahme erfüllt** (2026-10-06) — Bestandsaufnahme des Befunds unten bleibt stehen,
die Umsetzung ist im Nachtrag am Ende beschrieben

## Umfang

Karte **M8-002** („Erste Offline-Bereitschaft hängt an flüchtigem HTTP-Cache"), Stufe R3. Der Code
ist noch nicht umgesetzt; die Karte verlangt zuerst den Nachweis. Geprüft wurde am **ausgelieferten
Build** im **frischen Profil**, mit **echtem Netztrennen** (Vorschaudienst beendet), nicht über eine
Netzsimulation.

## Ablauf der Messung

1. Eigener Vorschaudienst auf `127.0.0.1:4188` (das Skript startet und beendet ihn selbst).
2. Frisches Edge-Profil, App-Route `/tools/calculator` laden, auf `navigator.serviceWorker.controller`
   warten (Steuerelement vorhanden, 1 Registrierung, 1 Cachegruppe).
3. `Network.clearBrowserCache` — der **HTTP-Cache** ist weg, der **CacheStorage** bleibt
   (116 Einträge vorher wie nachher, unverändert).
4. **Dienst beendet** und geprüft, dass er wirklich nicht mehr antwortet (Erreichbarkeit 0). Erst
   danach der Reload.
5. Reload und zweite Route (`/tools/pdf-split`) ohne Netz; Antwortherkunft je Anfrage ausgewertet.

## Befund

**Die vom Start nachgeladenen Pakete stehen nicht im CacheStorage.**

| Beim ersten Besuch geholt (8) | im CacheStorage? |
|---|---|
| `/assets/index-*.js` (Startbündel) | ja |
| `ui-en-*`, `ui-de-*` (Oberflächentexte) | **nein** |
| `search-en-*`, `search-de-*` (Suchpakete) | **nein** |
| `tools-en-common-*`, `tools-de-common-*`, `tools-en-calculator-*`, `tools-de-calculator-*` | **nein** |

Der CacheStorage führt 116 Adressen; die genannten acht sind **nicht** darunter, die übrigen 38
Bundle-Dateien des CacheStorage wurden in diesem Besuch dagegen gar nicht angefordert (sie gehören
zu Werkzeugen, die nicht geöffnet wurden — der Precache greift also wie vorgesehen).

**Folge, gemessen:** Nach HTTP-Cache-Löschung und Netztrennung liefert der Service Worker 7 von 7
Anfragen aus dem Cache — **bis auf eine**: `/assets/ui-en-zjLg7ZHU.js` scheitert mit
`net::ERR_FAILED`. Die Seite lädt dann kein Skript mehr und bleibt **leer** (keine Überschrift, kein
sichtbarer Text). Die Route `/tools/pdf-split` ebenso: 6 von 6 aus dem Service Worker, wieder eine
Datei gescheitert.

Damit ist der Kartenbefund **bestätigt** und präzisiert: Nicht die Startkette an sich fehlt, sondern
die **beim Öffnen nachgeladenen Sprach- und Werkzeugpakete** liegen nur im flüchtigen HTTP-Cache.
Der Erstbesuch ist offline nicht bedienbar.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| CacheStorage vor/nach HTTP-Cache-Löschung | 116 / 116 Einträge | `work/m8-002-offline2.cjs` |
| Beim Besuch geholte Bundle-Dateien | 17 | `work/m8-002-precache.cjs` |
| Davon **nicht** im CacheStorage | **8** | dito |
| Antworten aus dem Service Worker nach Netztrennung | 7 von 7 (Route 1), 6 von 6 (Route 2) | `work/m8-002-offline2.cjs` |
| Gescheiterte Datei | `/assets/ui-en-*.js` (`net::ERR_FAILED`) | dito |
| Bedienbarkeit ohne Netz | **nicht gegeben** (Seite leer) | Aufnahme `screenshots/2026-10-06-m8-002/` |

## Was der Beleg **nicht** sagt

- **Kein** Urteil über den Warmbesuch, den Localewechsel, ein fehlendes Einzelpaket oder einen
  SW-Versionswechsel — diese Teilfälle der Karte sind **nicht** geprüft.
- Die Frage, ob die dritte Sprache (`es`) ungewollt geladen wird, ist damit ebenfalls nicht
  beantwortet: In diesem Lauf wurden nur `de` und `en` angefordert (17 Bundle-Dateien), was der
  Erwartung entspricht — der Fall „dritte Sprache" ist aber nicht gesondert belegt.
- Ob die acht Dateien beim **zweiten** Besuch (mit aktivem SW) in den CacheStorage wandern, ist
  nicht geprüft.

## Eigene Fehler im Prüfmittel (offen benannt)

1. **Erster Weg war untauglich:** `Network.setBlockedURLs` auf den Origin ließ die Navigation aus
   dem Service Worker kommen, fing aber **die Subressourcen** ab, bevor der Worker sie bedienen
   konnte (7 gescheiterte Anfragen, Seite leer). Das sah wie ein Produktfehler aus und war eine
   Eigenschaft der Sperre. Belegt wurde der Unterschied durch einen Blick **in** den CacheStorage
   (die Adressen lagen dort). Erst der zweite Weg — Dienst wirklich beenden — ist belastbar.
2. **`Page.reload({ignoreCache: true})` schaltet den Service Worker aus.** Der erste Reload lief
   damit am Worker vorbei (Steuerelement danach „nein"); ein normaler Reload ist der Fall der Karte.

## Relevante Verweise

- Karte: `QM/70-reparaturempfehlungen/R3.md`, M8-002 (Lösungsweg: Offlinebereitschaft je Version,
  Sprache und geöffnetem Werkzeug; benötigte Adressen aus dem Buildmanifest; nach SW-Kontrolle
  gezieltes Nachladen und bestätigte Cache-Warm-Nachricht)
- Belegskripte (außerhalb der Versionierung, bekannter Punkt M10-004):
  `work/m8-002-offline2.cjs` (echtes Netztrennen), `work/m8-002-offline.cjs` (erster, untauglicher
  Weg — als Fehlversuch benannt), `work/m8-002-precache.cjs` (Cache-Bestandsaufnahme)
- Aufnahmen: `06-protokolle/screenshots/2026-10-06-m8-002/`

## Nachtrag: Umsetzung und Lösung (2026-10-06, nach dem Befund oben)

**Zwei Eingriffe, beide gemessen begründet:**

1. **Warmlauf der Sprachpakete** — neues Modul `apps/web/src/pwaWarmCache.ts`, aufgerufen aus
   `main.tsx` nach dem Laden der Seite. Sobald der Service Worker die Seite kontrolliert, werden
   genau die Sprachpakete **dieses** Starts (aktive Sprache + Englisch + Texte der geöffneten Route)
   erneut angefordert und ihr Vorhandensein im Laufzeitcache geprüft. Kein Vorabladen fremder
   Sprachen oder nicht geöffneter Werkzeuge. 5 neue Tests (`pwa-warm-cache.test.ts`), Projekt
   667 → 672.
2. **`ignoreVary: true` in der Laufzeitregel** (`vite.config.ts`) — **der entscheidende Hebel.**
   Ohne ihn half der Warmlauf nicht: Die Pakete lagen nachweislich im Cache (`fetch` auf dieselbe
   Adresse lieferte 200 `text/javascript`), aber der **dynamische `import()`** scheiterte weiter mit
   `net::ERR_FAILED`. Eingegrenzt durch Gegenproben: Ein Modul-Import einer **Precache**-Datei war
   erfolgreich, einer Laufzeitcache-Datei nicht — der Cache-Treffer scheiterte am `Vary`-Kopffeld,
   weil Modul-Load und `fetch` unterschiedliche Anfrage-Kopfzeilen stellen.

**Beleg nach der Umsetzung** (frisches Profil, HTTP-Cache gelöscht, Dienst beendet):

| Prüfung | Ergebnis |
|---|---|
| Warmlauf | 2 Cachegruppen, **8 Sprachpakete** im Laufzeitcache |
| Reload ohne Netz | Überschrift **„Rechner"**, Seite vollständig gerendert (Aufnahme angesehen) |
| Antworten aus dem Service Worker | **23 von 23, 0 gescheitert** |
| Dritte Sprache | nicht geholt (`ui-de`, `ui-en`, `search-de`, `search-en` — kein `es`) |
| Nie geöffnete Route `/tools/pdf-split` | scheitert **nur** an ihren nie geholten Texten `tools-{de,en}-pdf-split-*.js` — kartenkonform („Offlinebereitschaft je tatsächlich geöffnetem Werkzeug") |

**Folge, die nicht zu dieser Karte gehört:** Die nie geöffnete Route zeigt offline **nichts** statt
einer Shell mit Hinweis. Das ist der offene UI-Teil von **M4-004** (sichtbarer Fehlerzustand mit
Wiederholung).

## Folgemaßnahmen

- [ ] **Umsetzung nach der Karte** (offen): Sicherung der nachgeladenen Sprach-/Werkzeugpakete —
  entweder im Precache oder als gezieltes Nachladen nach Service-Worker-Kontrolle mit Prüfung.
- [ ] Teilfälle nachziehen: Warmbesuch, Localewechsel, fehlendes Einzelpaket, SW-Versionswechsel.
- [ ] Zweiter Besuch: Wandern die acht Dateien dann in den CacheStorage?
- [ ] Prüfen, ob die Runtime-Regeln (`runtimeCaching` in `apps/web/vite.config.ts`) die
  Sprachpakete überhaupt erfassen oder nur den HTTP-Cache daneben liegen lassen.