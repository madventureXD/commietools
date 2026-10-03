# Übergabe: Datensparsame Ladegrenzen

## Ziel

Fabers dringenden Startlastbefund beheben und die Nutzervorgabe „nur tatsächlich Benötigtes laden“
als dauerhafte Projektregel verankern.

## Änderungen

- PDF-Funktionen aus dem allgemeinen Einstiegspunkt von `@commietools/tools` entfernt.
- Explizite PDF-Unterpfade in der Paketoberfläche ergänzt.
- Alle verzögert geladenen PDF-Oberflächen und PDF-Tests auf direkte Unterpfade umgestellt.
- Problematische manuelle Engine-Bündelung entfernt.
- PDF-Routen, Worker, Engines und WASM vom PWA-Vorab-Cache ausgeschlossen.
- `bundle:check` samt 250-KiB-Startbudget und Engine-Sperre in den Build aufgenommen.
- Maxime in Arbeitsregeln, Architekturleitfaden und ADR 0003 verankert.

## Prüfungen

- `npm run check`: erfolgreich; 145 Tests.
- `npm run build`: erfolgreich; Startcode 163.994 Byte gzip, keine statisch erreichbare PDF-Engine.

## Offen

- Separate Größenbudgets je großer Engine sind noch festzulegen.
- Ein automatisierter Browser-Netzwerktest kann später zusätzlich belegen, dass einzelne Routen nur
  ihre jeweiligen Artefakte abrufen.
