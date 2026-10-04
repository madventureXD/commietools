# Prüfprotokoll: Startpaket und Sprachpakete

## Umgesetzt

- sprachneutrale Katalogbasis;
- getrennte Such-, Werkzeugtext- und Oberflächenpakete je Sprache;
- aktive Sprache plus Englisch, bei Englisch ausschließlich Englisch;
- verzögertes Laden mit Speicher- und PWA-Laufzeitcache;
- allgemeine Chunk-Erkennung für weitere BCP-47-nahe Sprachkennungen;
- Ladezustand statt falscher leerer Suchergebnisse;
- Warnschwellen und Referenzvergleich für Bundlegrößen.

## Lokale Freigabeprüfung

- Katalog: 41 Werkzeuge, 3 Sprachen, 2.730 Suchbegriffe und 92 deklarierte Dateitypen.
- Lizenzprüfung: 522 Pakete, 16 vollständige Lizenztexte und 188 erhaltene Paketdokumente.
- Typprüfung: bestanden.
- Tests: 16 Dateien, 301 Tests, vollständig bestanden.
- Produktions-Build und Bundle-Audit: bestanden.
- Lint- und Diff-Prüfung: bestanden.
- Service Worker: kein Sprachpaket im Vorabcache; Pakete werden erst nach Auswahl im
  Laufzeitcache abgelegt.
- Mobilprüfung: alle 41 Werkzeugrouten in Microsoft Edge bei 320 px ohne abgeschnittene Elemente;
  der reproduzierbare Lauf steht als `npm run viewport:check` bereit.
- Start-JavaScript: 136.961 B gzip; vorheriger Vergleichswert 208.861 B, damit rund 34,4 % kleiner.
- Katalogbasis: 1.100 B gzip.
- Suchpakete: Deutsch 7.833 B, Englisch 6.820 B, Spanisch 7.179 B gzip.
- Werkzeugtexte: Deutsch 26.403 B, Englisch 23.849 B, Spanisch 25.451 B gzip.
- Oberflächentexte: Deutsch 2.335 B, Englisch 2.049 B, Spanisch 2.351 B gzip.
- Keine Sprachgröße überschreitet die jeweilige Warnschwelle.

Die Werte wurden als Referenzstand in `scripts/bundle-size-baseline.json` festgehalten. Es erfolgt
in diesem Arbeitsschritt keine Veröffentlichung.
