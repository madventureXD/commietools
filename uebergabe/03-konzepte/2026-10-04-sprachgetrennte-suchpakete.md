# Konzept und Umsetzung: sprachgetrennte Suchpakete

## Ziel

Die Startseite soll nicht mit jeder zukünftigen Übersetzung wachsen. Katalogstruktur und Symbole
bleiben sprachneutral im Startpaket. Suchdaten, Werkzeugtexte und gemeinsame Oberflächentexte werden
je Sprache als eigene Pakete erzeugt und bei Bedarf geladen.

## Ladevertrag

- Aktive Sprache Deutsch oder Spanisch: aktive Sprache plus Englisch als Rückfall.
- Aktive Sprache Englisch: nur Englisch.
- Keine dritte Sprache im Speicher, in der Suchmenge oder im Vorabcache.
- Geladene Pakete werden im Arbeitsspeicher und durch den Service Worker zwischengespeichert.
- Ein Sprachwechsel zeigt einen Ladezustand und niemals einen vorzeitigen „keine Treffer“-Zustand.

## Erzeugte Struktur

`catalog-generate.mjs` erstellt aus den Locale-Quelldateien:

- `catalog/toolIndex.ts`: sprachneutrale Werkzeugdaten;
- `catalog/generated/search/<locale>.ts`: Suchtexte einer Sprache;
- `catalog/generated/messages/<locale>.ts`: sichtbare Werkzeugtexte einer Sprache;
- `catalog/generated/loaders.ts`: typisierte Lader, Rückfallregel und Cache.

Die gemeinsamen App- und Suite-Texte werden ebenfalls sprachweise verzögert geladen. Vite erzeugt
erkennbare Chunks `search-*`, `tools-*` und `ui-*`; die PWA legt sie erst nach Benutzung in einen
eigenen Laufzeitcache.

## Qualitäts- und Größenkontrolle

Die Produktionsprüfung sperrt weiterhin schwere Engines und optionale Fremdsprachen in der
statischen Startkette. Größen werden gzip-komprimiert gemessen und mit einem eingecheckten
Referenzstand verglichen. Die vorgeschlagenen Schwellen sind ausdrücklich Warnungen, keine festen
Grenzen: 200 KiB Start-JavaScript, 15 KiB Katalogbasis, 25 KiB Suchpaket sowie je 30 KiB
Werkzeugtexte und Oberflächentexte pro Sprache.

Eine Warnung verlangt Untersuchung und Dokumentation. Nur eine Architekturverletzung oder eine
fehlgeschlagene Funktionsprüfung stoppt den Build.
