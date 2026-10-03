# Fortschrittsprotokoll: Datensparsame Ladegrenzen

## Ergebnis

Der dringende Startlastfehler der PDF-Suite wurde behoben. Der allgemeine Einstiegspunkt von
`@commietools/tools` enthält keine PDF-Verarbeitungsfunktionen mehr. PDF-Oberflächen beziehen ihre
Funktionen über explizite Unterpfade und bleiben an die verzögert geladenen Routen gebunden.

Die manuelle Engine-Bündelung wurde entfernt, weil sie trotz separater Dateien statische Imports im
Startcode erzeugte. Der Offline-Vorab-Cache schließt PDF-Routen, Engines, Worker und WASM aus; diese
Artefakte werden erst durch die Nutzung eines PDF-Werkzeugs abgerufen und danach laufzeitgesteuert
gespeichert.

## Dauerhafte Sicherung

- ADR 0003 erklärt die verbindliche Maxime.
- Arbeits- und Architekturregeln schreiben nutzungsabhängige Downloads vor.
- `bundle:check` verfolgt die statische Importkette ab `index.html`.
- Der Build scheitert bei einer statisch erreichbaren PDF-Engine oder mehr als 250 KiB komprimiertem
  Startcode.

## Prüfung

- `npm run check`: erfolgreich, 145 Tests.
- Produktionsbuild: erfolgreich.
- Startcode: 163.994 Byte gzip, ohne statisch erreichbare PDF-Engine.
