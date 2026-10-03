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

Die allgemeine Architekturgrundlage ist in [`../../docs/architecture.md`](../../docs/architecture.md) dokumentiert.

