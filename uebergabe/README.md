# Projektübergabe CommieTools.org

Dieser Ordner ist die gemeinsame Arbeits- und Übergabezentrale für Menschen und KI-Systeme. Er hält fest, was das Projekt ist, wo es steht, was entschieden wurde und wie eine Arbeitssitzung sauber übergeben wird.

Der Ordnername `uebergabe` verwendet bewusst nur ASCII-Zeichen, damit Skripte, Git-Werkzeuge und unterschiedliche Betriebssysteme zuverlässig damit arbeiten können.

## Schnellstart für neue Bearbeitende

1. [`00-einstieg/projektueberblick.md`](00-einstieg/projektueberblick.md) lesen.
2. [`00-einstieg/arbeitsregeln.md`](00-einstieg/arbeitsregeln.md) beachten.
3. [`01-stand/aktueller-stand.md`](01-stand/aktueller-stand.md) und [`01-stand/offene-punkte.md`](01-stand/offene-punkte.md) prüfen.
4. Betroffene Originaldokumente und den aktuellen Code lesen.
5. Vor einer größeren oder schwer umkehrbaren Entscheidung die Entscheidungsübersicht prüfen und bei Bedarf einen ADR anlegen.
6. Nach der Arbeit Status, offene Punkte und eine Übergabe aktualisieren.

## Ablage

```text
uebergabe/
├── 00-einstieg/       Projektüberblick und verbindliche Arbeitsregeln
├── 01-stand/          Aktueller Stand, offene Punkte und Roadmap
├── 02-architektur/    Architektur-Navigation und Erweiterungsleitfäden
├── 03-konzepte/       Geplante, noch nicht verbindlich entschiedene Vorhaben
├── 04-entscheidungen/ Dauerhafte Architekturentscheidungen (ADR)
├── 05-uebergaben/     Sitzungsbezogene Übergabeprotokolle
├── 06-protokolle/     Chronologische Fortschritts- und Prüfprotokolle
└── vorlagen/          Einheitliche Vorlagen
```

## Dokumentstatus

- **Quelle der Wahrheit:** bestehender Code, Paket-Manifeste, Tests sowie die ausdrücklich benannten Dokumente unter `docs/`.
- **Aktueller Stand:** wird in `01-stand/` zusammengefasst und muss nach relevanten Änderungen aktualisiert werden.
- **Konzept:** beschreibt eine mögliche Lösung, ist aber noch keine verbindliche Entscheidung.
- **ADR:** dokumentiert eine akzeptierte oder verworfene, langfristig relevante Entscheidung.
- **Übergabe:** beschreibt nur eine konkrete Arbeitssitzung und ersetzt keine dauerhafte Dokumentation.
- **Protokoll:** hält abgeschlossene Meilensteine und Prüfergebnisse nachvollziehbar fest.

Bei Widersprüchen gilt: Code und Tests beschreiben das tatsächliche Verhalten; angenommene Produkt- oder Architekturregeln müssen anschließend in der zuständigen dauerhaften Dokumentation berichtigt werden.

