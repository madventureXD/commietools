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
- [`0002-qpdf-wasm-fuer-pdf-sicherheit.md`](0002-qpdf-wasm-fuer-pdf-sicherheit.md): QPDF-WASM für PDF-Sicherheit und Strukturkompression — angenommen.
- [`0003-datensparsame-ladegrenzen.md`](0003-datensparsame-ladegrenzen.md): Nur tatsächlich benötigte Tool-Module und Engines übertragen — angenommen.
- [`0004-m7-signatur-sicherheitsgate.md`](0004-m7-signatur-sicherheitsgate.md): Kryptografische PDF-Signaturen bleiben bis zu einer sicher prüfbaren Browser-Engine gesperrt — angenommen.
- [`0005-mathjs-rechenkern.md`](0005-mathjs-rechenkern.md): mathjs aus kuratierten Factories als Rechenkern der Suite „Rechnen" — angenommen.
- [`0006-voller-wert-und-genauigkeitsampel.md`](0006-voller-wert-und-genauigkeitsampel.md): Der Rechenkern gibt den vollen Wert getrennt aus; die Genauigkeitsampel vergleicht Zeichenketten — angenommen.
- [`0007-pip-it-up-auskoppeln.md`](0007-pip-it-up-auskoppeln.md): `@pip-it-up/core` (MIT) trägt das Auskoppeln von Werkzeugen in ein eigenes Fenster — angenommen.
- [`0008-lizenzfeld-fehlt-bei-pip-it-up.md`](0008-lizenzfeld-fehlt-bei-pip-it-up.md): Lizenzangabe aus der Paketdatei über einen hashbelegten Einzeleintrag, wo das Lockfile sie nicht liefert — angenommen.
- [`0009-ein-werkzeug-je-rechenart.md`](0009-ein-werkzeug-je-rechenart.md): Der Rechner wird in vier Werkzeuge geteilt; sie teilen einen gemeinsamen Rahmen, je ein Tastenfeld und je einen Speicherbereich — angenommen.
- [`0010-werkzeugtexte-je-werkzeug.md`](0010-werkzeugtexte-je-werkzeug.md): Werkzeugtexte liegen je Werkzeug und je Sprache, dazu ein gemeinsames Paket je Sprache; Katalogtexte im Suchpaket, Textlader in eigener Datei — angenommen.

Die allgemeine Architekturgrundlage ist in [`../../docs/architecture.md`](../../docs/architecture.md) dokumentiert.

