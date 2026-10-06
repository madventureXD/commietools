# Fortschrittsprotokoll: M8-003 — Speicherfehler legen die Werkzeuge nicht mehr lahm

**Datum:** 2026-10-07
**Status:** **abgeschlossen** — Speicherfehlervertrag, flüchtiger Sitzungsbetrieb mit wahrer Warnung,
Abnahme in vier Fällen im Browser belegt
**Karte:** M8-003 aus R3 (`QM/70-reparaturempfehlungen/R3.md`), Basis `a041ee0`
**Auftrag (Thomas, 2026-10-07, im Wortlaut):** „Voller Kartenumfang: Fehlervertrag für die drei
IDB-Stores + flüchtiger Sitzungsbetrieb mit wahrer Warnung + Belege für Quota/IDB-Reject/kaputtes
JSON + Abnahme (~3–4 h)"

## Was offen war

Der Startpfad war seit dem ersten Teil abgesichert (`readLocal`/`writeLocal`/`readLocalJson`), aber
die **drei IndexedDB-Bereiche** — Rechnerverlauf, Aufmaß, Prüffristen — liefen ungeschützt:

- `await get(...)` und `await set(...)` aus `idb-keyval` **werfen** bei gesperrter Datenbank oder
  voller Platte. Die Würfe wanderten ungebremst in die Oberfläche.
- **Am härtesten beim Rechner:** Er lud die Rechen-Engine und die gespeicherten Einstellungen in
  **einem** `Promise.all`. Scheiterte der Speicher, wurde auch `core` nie gesetzt — der Rechner war
  **unbenutzbar**, obwohl der Speicher mit dem Rechnen nichts zu tun hat.
- Die drei Speicherdateien fingen Fehler zwar ab (`catch { return null }`), aber ein **leerer**
  Rückfall sah aus wie „nichts gespeichert". Ein vorhandenes Aufmaß, das nur nicht gelesen werden
  konnte, wäre beim nächsten Schreiben **überschrieben** worden.
- Schreibvorgänge liefen als `void` ohne Rückmeldung: ein voller Speicher sah aus wie ein Erfolg.

## Umgesetzt

1. **`packages/tools/src/storage/indexedStore.ts` (neu):** Zugriffe mit explizitem Ergebnis
   (`ok` / `unavailable` / `quota` / `invalid`) statt Wurf. `classifyStorageError` trennt „voll"
   von „nicht erreichbar"; „nicht verstanden" wird als `invalid` gemeldet und heißt ausdrücklich
   **nicht** „nichts da".
2. **`calculator/history.ts`:** alle sieben Zugriffe melden ihren Zustand (`StoredResult<T>`).
   `pushHistory` liefert den neuen Verlauf **und** den Zustand — der Verlauf gilt in der Sitzung,
   aber „gespeichert" wird nicht behauptet, wenn er nicht liegt.
3. **`aufmassStore.ts` / `inspectionStore.ts`:** Lesen mit Zustand, Schreiben mit Ergebnis.
   `status: 'ok'` + `value: null` heißt „nichts da"; jeder andere Zustand heißt „nicht lesbar".
4. **`calculator-frame.tsx`:** Engine und Speicher **getrennt** geladen; jeder Schreibvorgang
   geprüft; sichtbare Warnung (`storage.volatile`) im flüchtigen Betrieb.
5. **`Aufmass.tsx` / `Inspection.tsx`:** Warnung beim Lesen (`storage.readFailed`) und beim
   Schreiben; **nach einem gescheiterten Lesen wird nicht geschrieben** — ein vorhandener Stand
   wird nicht mit dem Anfangszustand überschrieben.
6. **Texte** `storage.volatile`, `storage.readFailed` in drei Sprachen.
7. **Tests** (`apps/web/src/indexed-store.test.ts`): kein Wurf ohne IndexedDB, Rückfallwert,
   Unterscheidung „voll"/„nicht erreichbar", „unbekannter Fehler wird nicht als voll gemeldet".

## Abnahme am ausgelieferten Build (Edge headless, Fehler im Browser vor dem Programmstart)

Die Fehler werden über `Page.addScriptToEvaluateOnNewDocument` **vor** jedem Programmstart im
Dokument hergestellt — echter Code im echten Browser. Skript: `work/m8-003-abnahme.cjs`.

| Fall | Einspeisung | Ergebnis |
|---|---|---|
| A | `localStorage`-Zugriff wirft `SecurityError` | Startseite lädt vollständig — **kein leerer Bildschirm** |
| B | kaputter Inhalt (`'{kaputt'`, `'[1,2'`, `'nicht-json'`) | Start mit Rückfall, keine erfundene Ursache in der Oberfläche |
| C1/C2 | `IDBFactory.prototype.open` wirft, `indexedDB` gesperrt | Rechner zeigt die Warnung **und rechnet**: `2+3` → **Ergebnis 5** |
| C3 | wie C1 | Aufmaß zeigt „Der Speicher dieses Geräts ließ sich nicht lesen …" |
| C4 | wie C1 | Prüffristen zeigen dieselbe Warnung |
| D | `IDBObjectStore.prototype.put` wirft `QuotaExceededError` | Rechner rechnet `7*6` → **Ergebnis 42** und zeigt **nach dem gescheiterten Schreiben** die Warnung — kein „gespeichert" ohne Deckung |
| E | Seitenmeldungen über den ganzen Lauf | **0 Meldungen, 0 unbehandelte Zusagen** |

**Was D belegt und was nicht:** Belegt ist die **Wirkung** — ein gescheitertes Schreiben führt zur
Warnung statt zu einem Erfolg. **Nicht gemessen** ist, ob der eingespeiste `QuotaExceededError`
durch die Transaktion als `quota` bei uns ankommt oder als `unavailable` (die Warnung ist in beiden
Fällen dieselbe). Die **Zuordnung** selbst ist über den Test zu `classifyStorageError` abgesichert,
nicht über einen Browserlauf.

## Prüfkette

- `npm run check` — **695 Tests in 48 Dateien**, Exit 0; **0 Lint-Fehler** (109 Warnungen, bekannte
  Folgearbeit). Zwei echte Befunde beim ersten Lauf korrigiert: drei `no-unnecessary-type-assertion`
  (überflüssige Typbehauptungen an den neuen Aufrufen).
- `npm run build` — Exit 0, Startbündel **149 481 B gzip** von 204 800.
- Abnahme `work/m8-003-abnahme.cjs` — Exit 0.
- Keine neue Abhängigkeit (`idb-keyval` war bereits im Projekt), Lizenzregister unverändert.
- **Nicht gepusht.** Commit **`bd95592`**.

## Offen geblieben (ausdrücklich)

- Siehe „Was D belegt und was nicht" oben.
- Der Kartenpunkt „exportierbaren Speicherzustand anbieten" war **nicht** Teil des gewählten
  Umfangs (Thomas hat den vollen Kartenumfang ohne diesen Zusatz gewählt); er steht weiter offen.
