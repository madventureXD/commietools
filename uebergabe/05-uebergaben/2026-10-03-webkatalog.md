# Übergabe: Werkzeugkatalog als erzeugtes Register

**Datum:** 2026-10-03  
**Bearbeitet durch:** Faber (Hermes Agent)  
**Status:** abgeschlossen

## Ziel der Sitzung

Eine zentrale, automatisch mitgepflegte Datenbank für die geplante Katalogsuche: je Werkzeug und Sprache Suchbegriffe, Symbol und eine kurze, für Trefferlisten geeignete Beschreibung. Die Suche soll später über alle Sprachen gehen; vorgeschlagen wird in der eingestellten Sprache, auch wenn der Suchbegriff aus einer anderen Sprache stammt.

## Ergebnis

Schritt 1 ist fertig: Die Datenbank existiert, wird erzeugt und ihre Vollständigkeit ist erzwungen — eine fehlende Kurzbeschreibung, ein fehlender Suchbegriff, ein unbekannter Dateityp, ein fehlendes Symbol oder eine veraltete Registerdatei lassen `npm run check` scheitern. Die Oberfläche liest bereits daraus.

Die **Suche selbst ist noch nicht gebaut** (Schritt 2). Die Registereinträge enthalten aber schon den Suchtext beider Sprachen.

## Geänderte Bereiche

- `packages/core/src/index.ts` – Formattabelle `knownFormats`, Dateivertrag, Pflichtschlüssel, Registertyp
- `packages/tools/src/catalog/manifests.ts` – Manifeste und Suiten ausgelagert, damit der Generator sie ohne Laufzeitabhängigkeiten lesen kann
- `packages/tools/src/catalog/toolIndex.ts` – **erzeugt**, nicht von Hand pflegen
- `packages/tools/src/index.ts` – Reexporte und abgeleitete Helfer (`acceptAttributeFor`, `formatNames`, `readOnlyFormatNames`, `auxiliaryMimeTypes`, `searchEntryById`)
- `packages/tools/src/*/locales/{de,en}.ts` – Kurzbeschreibung und Suchbegriffe je Werkzeug; der getippte `accepted`-Text entfällt
- `packages/i18n/src/common/{de,en}.ts` – Sammelbezeichnungen „Formate" und „Nur lesbar"
- `apps/web/public/tools/*.svg` – sechs Werkzeugsymbole
- `apps/web/src/App.tsx`, `apps/web/src/tools/*.tsx`, `apps/web/src/styles.css` – Karten und Dateifelder aus dem Register
- `apps/web/src/tool-catalog.test.ts` – 12 neue Tests
- `scripts/catalog-generate.mjs` – Erzeugung und Prüfung
- `package.json` – `catalog:generate`, `catalog:check`, eingebunden in `check` und `build`
- `docs/architecture.md`, `uebergabe/01-stand/aktueller-stand.md` – nachgezogen

## Entscheidungen und Annahmen

- **Das Register wird erzeugt, nicht geschrieben** — nach dem Muster des Lizenzsystems. Damit ist „automatisch mitgepflegt" erzwungen statt zugesagt; von Hand gäbe es die Angaben doppelt.
- **Die Kurzbeschreibung ist ein eigener Schlüssel**, nicht die vorhandene Beschreibung. Annahme: ein ganzer Satz ist für eine Trefferliste zu lang.
- **Formatnamen werden sprachneutral angezeigt** (JPEG, PNG, WebP …). Annahme: das sind Eigennamen; dadurch brauchen sie keine Übersetzung und können nicht von der Deklaration abweichen.
- **Die Bibliothek des Generators ist das Projekt selbst:** die TypeScript-Module werden über die Compiler-Schnittstelle des vorhandenen `typescript`-Pakets eingelesen. Keine neue Abhängigkeit, kein zusätzlicher Bauwerkzeugkasten.
- **Symbole sind Dateien und werden in der Oberfläche als CSS-Maske eingebunden.** Grund: `currentColor` in einer per `<img>` geladenen SVG-Datei folgt dem Farbschema der Seite nicht. Über die Maske nimmt das Symbol die Farbe der Umgebung an.
- **Suiten bleiben ohne Symbol** und nutzen weiterhin die lange Beschreibung. Das Register gilt für Programme, nicht für Sammlungen.
- Zusatzentscheidung ohne Auftrag: die Prüfung verbietet `accept="…"` in den Werkzeugoberflächen, damit Deklaration und Oberfläche nicht auseinanderlaufen können.
- Annahme: die Symbole sind schlichte geometrische Zeichen. Bessere Grafik kann sie ersetzen, ohne dass Code geändert werden muss — die Prüfung verlangt nur ihre Existenz.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | bestanden: Lizenzprüfung 478 Pakete, Registerprüfung 6 Werkzeuge / 2 Sprachen / 6 Symbole / 25 Dateitypen, Typprüfung, 52 Tests |
| `npm run build` | bestanden: Hauptbundle 421,20 kB (127,30 kB komprimiert), Vorab-Cache 14 Einträge (1.319,86 KiB) |
| Fehlschlagproben | 9 von 9 erwarteten Fehlschlägen eingetreten, danach Prüfung wieder grün (`catalog-probes.mjs`) |
| Sichtprüfung Edge headless | 6 von 6 Karten mit Symbol und Kurzbeschreibung; `accept` aus dem Manifest für drei Werkzeuge; Formatlisten korrekt (Bild-Metadaten: 8 Formate, davon 5 „nur lesbar"); keine Konsolenfehler; geprüft bei 1360 px und 420 px, hell und dunkel |

Die Fehlschlagproben decken ab: fehlende Dateideklaration bei einem Bildwerkzeug, fehlendes Feld `summaryKey`, fehlendes Feld `termsKey`, Schlüssel ohne Eintrag im Sprachkatalog, fehlendes Symbol, unbekannter Dateityp, veraltete Registerdatei, getippte `accept`-Liste.

## Offene Punkte und Risiken

- [ ] **Die deutschen Suchbegriffe sind ein Entwurf** und brauchen dein Gegenlesen (Liste im Protokoll `2026-10-03-webkatalog.md`). Das ist die einzige Stelle, an der geraten wurde.
- [ ] Die Suche selbst fehlt noch (Schritt 2) und das Ablegen einer Datei mit Werkzeugvorschlag (Schritt 3).
- [ ] Ein Registereintrag trägt die Anzeigetexte **aller** Sprachen und liegt damit im Hauptbundle: +8,77 kB (+2,12 kB komprimiert). Bei vielen Werkzeugen und Sprachen neu messen; Ausweg ist das Register als abgerufene Datei (dann mit Ladezustand, wie die Lizenzseite).
- [ ] Suiten haben kein Symbol und keine Kurzbeschreibung (bewusst).
- [ ] Symbole sind einfache Strichzeichen, keine gestalteten Bilder.
- [ ] Aus vorheriger Arbeit offen: ob beim Speichern von `image-resize` ein Farbprofil der Quelldatei erhalten bleibt, ist weiterhin **nicht gemessen**.
- [ ] Aus vorheriger Arbeit offen: `worker-src blob:` für die CSP wegen `pica`.

## Empfohlener nächster Schritt

1. Kurzbeschreibungen und deutsche Suchbegriffe gegenlesen und ändern — dafür genügt `npm run catalog:generate`, die Prüfung zeigt jede Lücke.
2. Danach Schritt 2: Suchfeld im Katalog mit normalisierter Teilwortsuche über die Begriffe aller Sprachen, Treffer in der eingestellten Sprache, ehrliche Anzeige des Grundes („gefunden über: resize").
3. Zuletzt Schritt 3: gezogene Datei gegen die deklarierten Dateitypen prüfen und passende Werkzeuge vorschlagen.

## Git

- Commit: `ef1d13e`
- Arbeitsbaum: sauber
