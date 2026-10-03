# Responsive Werkzeugnavigation

**Datum:** 2026-10-03  
**Status:** umgesetzt und geprüft

## Ergebnis

Jede normale CommieTools-Route besitzt nun einen Werkzeugmenü-Auslöser vor dem Logo. Auf Desktop
öffnet er einen linken Overlay-Drawer; unter 768 px wird daraus ein vollbreites Sheet unter dem
Header. Der Arbeitsbereich bleibt im geschlossenen Zustand unverändert breit.

Das Menü bietet:

- Gruppierung nach den fünf Werkzeugkategorien
- alphabetische Sortierung
- maximal zehn zuletzt auf diesem Gerät geöffnete Werkzeuge
- lokale Favoriten
- dieselbe sprachübergreifende Suche wie der Hauptkatalog, einschließlich Dateitypen
- Markierung des aktuell geöffneten Werkzeugs und klare leere Zustände

Favoriten, Verlauf und gewählte Sortierung werden ausschließlich lokal gespeichert. Suchbegriffe,
Dateinamen und Nutzerdokumente werden nicht persistiert. Die Navigation verwendet nur erzeugte
Katalogmetadaten und importiert keine Werkzeugimplementierung oder PDF-Engine.

## Bedienung

- Fokus startet beim Öffnen in der Suche und bleibt im geöffneten Overlay.
- Escape, Schließen-Schaltfläche, Hintergrund und mobile Zurück-Navigation schließen das Menü.
- Der Fokus kehrt zum Menüauslöser zurück.
- Alle Werkzeugzeilen und Favoritenaktionen sind getrennte, beschriftete Schaltflächen.
- Bewegung respektiert `prefers-reduced-motion`.

## Prüfung

- Lizenzprüfung bestanden: 498 Pakete
- Katalogprüfung bestanden: 21 Werkzeuge, 2 Sprachen, 21 Symbole und 70 Dateitypen
- TypeScript-Prüfung bestanden
- 152 Tests in 11 Testdateien bestanden
- Produktions-Build bestanden
- Bundle-Prüfung bestanden: Einstieg 167.241 Byte gzip, optionale PDF-Artefakte 13
- keine PDF-Engine vom Einstieg statisch erreichbar
