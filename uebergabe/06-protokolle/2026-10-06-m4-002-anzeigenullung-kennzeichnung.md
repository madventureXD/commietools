# Fortschrittsprotokoll: M4-002 — Kennzeichnung der Anzeige-Nullung

**Datum:** 2026-10-06
**Status:** abgeschlossen

## Umfang

Karte **M4-002** („Anzeige-Nullschwelle vernichtet auch Rohwert und Genauigkeitsvergleich"), zweiter
Teil. Der erste Teil (Nullfilter aus der gemeinsamen Formatierung entfernen, `raw`/`full` echt)
war bereits erledigt und protokolliert (`2026-10-06-m4-002-nullfilter.md`). Offen war die von der
Karte geforderte **Kennzeichnung** der verbliebenen Anzeige-Nullung.

**Entscheidung von Thomas (2026-10-06, bereits in der Akte):** **Hinweis am Ergebnis**, keine neue
Ampelstufe.

## Ergebnisse

- **`Calculation` trägt ein Kennzeichen.** Neues Pflichtfeld `displayRoundedToZero: boolean`. Es
  wird dort gesetzt, wo die Anzeige genullt wurde, und ist in **allen** Rückgabewegen des Kerns
  ausdrücklich belegt (Erfolgs- wie Fehlerwege, `toFraction`, `toBase`, `toWord`, `evaluateRpn`).
  Ein Pflichtfeld statt eines optionalen: der Typecheck erzwingt damit, dass kein Weg es vergisst.
- **Der RPN-Rechner reicht es durch.** `evaluateRpn` übernimmt das Kennzeichen des letzten Werts —
  sonst wäre die Nullung ausgerechnet dort wieder still.
- **Die Oberfläche kennzeichnet.** Der Rahmen (`calculator-frame.tsx`) führt den Zustand, setzt ihn
  beim Zurücksetzen zurück und zeigt unter dem Ergebnis eine Hinweiszeile mit `data-display-zero`.
  Im **Bruchmodell** bleibt das Kennzeichen aus: dort ist die Anzeige der Bruch aus dem echten Wert,
  es wird nie genullt.
- **Texte in allen drei Sprachen** (`packages/tools/src/calculator/shell/locales/{de,en,es}.ts`,
  Schlüssel `tool.calc.displayZero`), über den Generator in die Sprachpakete übernommen.
- **Keine Ampelstufe geändert.** Die Ampel vergleicht weiter `raw === full`; die Anzeige-Nullung ist
  ein eigener, sichtbarer Hinweis.

## Kennzahlen

| Kennzahl | Wert | Quelle |
|---|---:|---|
| Tests | 665 → **667** (2 neue) | `npm run check` |
| Mutationsgegenprobe | **2 von 667 rot**, genau die beiden neuen | `work`-Lauf, Log `ct-m4-002-mutation.log` |
| Browserbeleg am ausgelieferten Build | **4 von 4 Fällen bestanden** | `work/m4-002-anzeigenullung.cjs` |
| Gemeinsames Sprachpaket je Sprache | de **+56 B**, en **+50 B**, es **+57 B** gzip | `git show HEAD:<datei>` gegen Arbeitsbaum, `gzip -9` |
| Startbündel | **148398 B gzip, unverändert** (`displayZero` nicht im Startbündel) | `node scripts/bundle-audit.mjs` |
| Katalog / Lizenzen | unverändert grün (62 Werkzeuge, 525 Pakete) | `npm run catalog:check`, `npm run licenses:check` |

## Belege

- **Browserbeleg** (Edge headless über CDP gegen `vite preview`, geladenes Bündel
  `index-Dg2HmFcC.js`): `1e-14` → Ergebnis `0` **mit** Hinweis; `2 + 3` → `5` **ohne** Hinweis;
  `2 - 2` → `0` **ohne** Hinweis (echte Null wird nicht gekennzeichnet); `sin(pi)` → `0` **mit**
  Hinweis. Aufnahmen:
  `06-protokolle/screenshots/2026-10-06-m4-002/01-anzeigenullung-dunkel.png` und `…-hell.png`
  (im Bild angesehen: Ergebnis „0", darunter „Angezeigt wird 0, weil der Wert unter der
  Anzeigepräzision liegt. Er ist nicht null und bleibt vollständig erhalten.").
- **Mutationsgegenprobe:** `displayRoundedToZero: genullt` → `false` gesetzt; es wurden **genau die
  zwei neuen Tests** rot (`kennzeichnet die Anzeige-Nullung am Ergebnis…`, `reicht das Kennzeichen
  im RPN-Rechner durch`), 665 blieben grün. Mutation zurückgenommen.

## Eigene Fehler und Umwege (offen benannt)

1. **Meine erste Prüflogik war falsch.** Der Beleg verglich für die Fälle *ohne* Hinweis den
   erwarteten Wert mit sich selbst (`Boolean(gelesen.hinweis)` gegen das erwartete `false`) und
   meldete zwei korrekte Fälle als „ABWEICHUNG". Korrigiert wurde die **Prüfung**, nicht das
   Produkt: Erwartung und Messung werden jetzt verglichen. Danach 4 von 4.
2. **Die erste Aufnahme zeigte den Hinweis nicht.** Der Ergebnisbereich lag außerhalb des
   Aufnahmebereichs; ein `scrollIntoView` allein änderte die Aufnahme nicht. Erst ein ausdrücklich
   höher gesetztes Aufnahmemaß (`Emulation.setDeviceMetricsOverride`, 1280 × 2000) zeigt den
   Hinweis im Bild. **Eine DOM-Messung allein hätte den Mangel nicht aufgedeckt — dafür ist die
   angesehene Aufnahme da.**
3. **Der Vor/Nach-Größerlauf brach ab.** Beim `git stash` waren die drei erzeugten Sprachdateien
   (`catalog/generated/messages/*/common.ts`) nicht mitgenommen, `catalog:check` schlug zu Recht an,
   der Bau endete vor der Größenmessung. Der Zuwachs wurde danach **direkt am Paket** gemessen
   (dieselbe Datei aus HEAD gegen den Arbeitsbaum, `gzip -9`) — das ist die belastbarere Zahl.

## Relevante Verweise

- Commit: **`a0bad10`** („Anzeige-Nullung am Ergebnis gekennzeichnet (M4-002)"), 14 Dateien;
  **nicht gepusht**. Nachtrag vom 2026-10-06 nach der Ablage dieser Datei.
- Karte: `QM/70-reparaturempfehlungen/R2.md`, Abschnitt „M4-002" (Abnahme: „Anzeige darf den
  Vergleichswert nicht zurücküberschreiben")
- Entscheidung: Thomas, 2026-10-06 — Hinweis am Ergebnis, keine neue Ampelstufe
- Verwandt: ADR 0006 (`uebergabe/04-entscheidungen/0006-voller-wert-und-genauigkeitsampel.md`)

## Folgemaßnahmen

- [ ] **Verlauf und ANS mit echten kleinen Werten prüfen** (steht schon in `01-stand/offene-punkte.md`):
  der Verlauf speichert `display`; bei `1e-14` steht dort jetzt `0`. Ob der Verlauf den Hinweis
  braucht oder den echten Wert zeigen sollte, ist **nicht** entschieden — bewusst nicht mitgeändert.
- [ ] Vier Rechner: 200 % Zoom und Screenreader-Namen (bestehender offener Punkt, nicht Teil dieser
  Karte).