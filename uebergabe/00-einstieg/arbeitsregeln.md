# Arbeitsregeln für Menschen und KI-Systeme

## Vor jeder Änderung

1. Arbeitsbaum und jüngste Commits prüfen.
2. Betroffene Dateien und vorhandene Dokumentation vollständig lesen.
3. Vorhandenes nicht unnötig überschreiben oder parallel neu erfinden.
4. Bei größeren Architekturentscheidungen zuerst Konzepte und ADRs prüfen.
5. Annahmen ausdrücklich kennzeichnen; unbekannte Fakten nicht erfinden.

## Während der Arbeit

- Änderungen klein, modular und nachvollziehbar halten.
- Tool-Logik von App-Shell und Darstellung trennen.
- Keine nutzerseitigen Texte hart im Tool-Code hinterlegen.
- Neue Tools über Manifeste integrieren und vorhandene gemeinsame UI-Bausteine verwenden.
- Abhängigkeiten nur mit dokumentierter Notwendigkeit und geprüfter Lizenz ergänzen.
- Datenschutz-, Offline- und Barrierefreiheitsfolgen mitbedenken.
- Keine Geheimnisse, Zugangsdaten oder personenbezogenen Daten dokumentieren.

## Pflichtprüfungen

Vor einer abgeschlossenen Übergabe mindestens ausführen:

```bash
npm run check
npm run build
```

Bei Abhängigkeitsänderungen zusätzlich die Lizenzdatenbank erzeugen und prüfen:

```bash
npm run licenses:generate
npm run licenses:check
```

Fehlgeschlagene oder nicht ausführbare Prüfungen müssen in der Übergabe ausdrücklich genannt werden.

## Dokumentationspflicht nach Änderungen

- tatsächlichen Projektstand in `01-stand/aktueller-stand.md` aktualisieren,
- neue oder erledigte Aufgaben in `01-stand/offene-punkte.md` pflegen,
- größere Entscheidungen als ADR dokumentieren,
- neue Vorhaben zunächst als Konzept erfassen,
- eine sitzungsbezogene Übergabe nach der Vorlage anlegen,
- nur belegbare Prüfresultate eintragen.

## Git-Regeln

- Bestehende fremde Änderungen respektieren.
- Keine destruktiven Git-Befehle ohne ausdrückliche Freigabe.
- Inhaltlich zusammengehörige Änderungen gemeinsam committen.
- Commit-Nachrichten kurz und aussagekräftig formulieren.
- Eine Übergabe nennt relevante Commit-Hashes, sofern vorhanden.

