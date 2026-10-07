# Architekturentscheidungen (ADR)

ADRs dokumentieren Entscheidungen, die langfristig wirken oder nur teuer rückgängig zu machen sind. Jede Entscheidung erhält eine fortlaufende Nummer:

```text
0001-kurzer-titel.md
0002-weiterer-titel.md
```

Mögliche Statuswerte: `vorgeschlagen`, `angenommen`, `verworfen`, `ersetzt`.

Wird eine Entscheidung ersetzt, bleiben beide Dateien erhalten und verweisen gegenseitig aufeinander. So bleibt nachvollziehbar, warum sich die Architektur verändert hat.

## Entscheidungsindex

- [`0001-open-source-first.md`](0001-open-source-first.md): Open-Source-Lösungen haben vor Eigenentwicklung Vorrang — angenommen.
- [`0002-qpdf-wasm-fuer-pdf-sicherheit.md`](0002-qpdf-wasm-fuer-pdf-sicherheit.md): QPDF-WASM für PDF-Sicherheit und Strukturkompression — angenommen. *(Nachtrag 2026-10-07: der Anwendungsbereich umfasst auch die **Reparatur** (`pdf/m8.ts` → `pdf/m5.ts`) — Karte M2-004.)*
- [`0003-datensparsame-ladegrenzen.md`](0003-datensparsame-ladegrenzen.md): Nur tatsächlich benötigte Tool-Module und Engines übertragen — angenommen. *(Nachtrag 2026-10-07: Größenbudgets sind **Warnschwellen**, strukturelle Regeln bleiben **harte Fehler** — Karte M2-002.)*
- [`0004-m7-signatur-sicherheitsgate.md`](0004-m7-signatur-sicherheitsgate.md): Kryptografische PDF-Signaturen bleiben bis zu einer sicher prüfbaren Browser-Engine gesperrt — angenommen.
- [`0005-mathjs-rechenkern.md`](0005-mathjs-rechenkern.md): mathjs aus kuratierten Factories als Rechenkern der Suite „Rechnen" — angenommen. *(Nachtrag 2026-10-07: die Budgetzahlen vom 2026-10-03 sind überholt; gültig sind die Schwellen in `scripts/bundle-audit.mjs` — Karte M2-003.)*
- [`0006-voller-wert-und-genauigkeitsampel.md`](0006-voller-wert-und-genauigkeitsampel.md): Der Rechenkern gibt den vollen Wert getrennt aus; die Genauigkeitsampel vergleicht Zeichenketten — angenommen.
- [`0006-m9-konformitaetsgate.md`](0006-m9-konformitaetsgate.md): **Weiterverweisakte** (keine eigene Entscheidung) — die Entscheidung liegt unter `0013-m9-konformitaetsgate.md`; die frühere doppelte Nummer 0006 ist damit aufgelöst.
- [`0007-pip-it-up-auskoppeln.md`](0007-pip-it-up-auskoppeln.md): `@pip-it-up/core` (MIT) trägt das Auskoppeln von Werkzeugen in ein eigenes Fenster — angenommen.
- [`0008-lizenzfeld-fehlt-bei-pip-it-up.md`](0008-lizenzfeld-fehlt-bei-pip-it-up.md): Lizenzangabe aus der Paketdatei über einen hashbelegten Einzeleintrag, wo das Lockfile sie nicht liefert — angenommen.
- [`0009-ein-werkzeug-je-rechenart.md`](0009-ein-werkzeug-je-rechenart.md): Der Rechner wird in vier Werkzeuge geteilt; sie teilen einen gemeinsamen Rahmen, je ein Tastenfeld und je einen Speicherbereich — angenommen.
- [`0010-werkzeugtexte-je-werkzeug.md`](0010-werkzeugtexte-je-werkzeug.md): Werkzeugtexte liegen je Werkzeug und je Sprache, dazu ein gemeinsames Paket je Sprache; Katalogtexte im Suchpaket, Textlader in eigener Datei — angenommen.
- [`0011-werkzeugtextsumme-je-paket.md`](0011-werkzeugtextsumme-je-paket.md): Die Summe der Werkzeugtextpakete wird je Paket gemessen (850 B), nicht gegen eine feste Obergrenze — angenommen.
- [`0012-json-formatierung-als-textedit.md`](0012-json-formatierung-als-textedit.md): JSON-Formatierung sind Textedits; `jsonc-parser` (MIT) als neue Abhängigkeit, Werkzeug aus dem Startbündel gelöst — angenommen.
- [`0013-m9-konformitaetsgate.md`](0013-m9-konformitaetsgate.md): M9 veröffentlicht keine unbelegte PDF/A- oder Office-Konvertierung — angenommen (Entscheidung vom 2026-10-04, Nummer am 2026-10-07 nachvergeben).
- [`0014-m7-freigabekriterien.md`](0014-m7-freigabekriterien.md): M7 — tatsächlicher Produktstand und Freigabekriterien der PDF-Signatur; ergänzt ADR 0004 — **angenommen am 2026-10-07 (Thomas) mit vier Auflagen A1–A4**; am selben Tag zuvor als `vorgeschlagen` geführt.

*Nachtrag 2026-10-07 (Faber, Karte M2-005): Bis zu diesem Tag fehlte in diesem Index jede Angabe zur
M9-Konformitätsentscheidung, und **zwei** angenommene Dateien trugen die Nummer **0006**
(`0006-m9-konformitaetsgate.md` und `0006-voller-wert-und-genauigkeitsampel.md`). Aufgelöst ohne
inhaltliche Verschmelzung: die M9-Entscheidung führt unter der nächsten freien Nummer **0013**
weiter, am alten Pfad steht eine Weiterverweisakte, beide Dateien verweisen gegenseitig aufeinander.
Die Entscheidung selbst ist **unverändert**; ihr Datum (2026-10-04) bleibt stehen. Eindeutigkeit,
Existenz und Vollständigkeit prüft `npm run adr:check`.*

Die allgemeine Architekturgrundlage ist in [`../../docs/architecture.md`](../../docs/architecture.md) dokumentiert.

