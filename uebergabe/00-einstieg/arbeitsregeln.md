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
- **Jedes Tool braucht `summaryKey` (eine Zeile für Karten und Trefferlisten) und `termsKey`
  (kommagetrennte Suchbegriffe, führendes `#` markiert ein Schlagwort) sowie ein Symbol unter
  `apps/web/public/tools/<id>.svg`; Werkzeuge, die Dateien lesen oder schreiben, deklarieren das im
  Manifest unter `files`.**
- **Das Werkzeugregister `packages/tools/src/catalog/toolIndex.ts` wird erzeugt und nie von Hand
  geändert.** Dateitypen in Oberflächen kommen aus der Deklaration (`acceptAttributeFor`), nicht aus
  getippten Listen — die Prüfung lehnt `accept="…"` ab.
- Abhängigkeiten nur mit dokumentierter Notwendigkeit und geprüfter Lizenz ergänzen.
- Datenschutz-, Offline- und Barrierefreiheitsfolgen mitbedenken.
- **Datensparsamkeit gilt auch für Downloads:** Eine Route lädt nur Shell, aktive Sprache und die
  tatsächlich benötigten Tool-Module. Große Engines, Sprachmodelle, Worker, Schriften und Beispiele
  werden erst bei konkreter Nutzung nachgeladen. Suite-Zugehörigkeit allein darf keinen Download
  auslösen.
- Tool- und Suite-Einstiegspunkte dürfen keine schweren optionalen Engines reexportieren. Direkte
  Modulimporte markieren die Ladegrenze; neue Engines benötigen ein geprüftes Größenbudget.
- Keine Geheimnisse, Zugangsdaten oder personenbezogenen Daten dokumentieren.

## Pflichtprüfungen

Vor einer abgeschlossenen Übergabe mindestens ausführen:

```bash
npm run check
npm run build
```

Der Build führt `bundle:check` aus. Die Prüfung muss scheitern, wenn eine PDF-Engine statisch von der
Startseite erreichbar ist oder deren komprimierter Einstieg das festgelegte Budget überschreitet.

Nach Änderungen an Manifesten, Sprachkatalogen oder Werkzeugsymbolen zuerst das Register erzeugen:

```bash
npm run catalog:generate
npm run catalog:check
```

`catalog:check` läuft in `check` und `build` mit und scheitert absichtlich, wenn das Register veraltet
ist oder eine Angabe fehlt (Kurzbeschreibung, Suchbegriffe, Dateityp, Symbol, doppelter Begriff).

Bei Abhängigkeitsänderungen zusätzlich die Lizenzdatenbank erzeugen und prüfen:

```bash
npm run licenses:generate
npm run licenses:check
```

Fehlgeschlagene oder nicht ausführbare Prüfungen müssen in der Übergabe ausdrücklich genannt werden.

## Sitzungsabschluss

**Eine Sitzung ist erst abgeschlossen, wenn ihre Übergabe geschrieben ist.** Die Übergabe ist kein
Anhang und keine Kür: Sie ist der Teil des Abschlusses, der die Sitzung überlebt, und sie entsteht
**bei jedem Abschluss**, auch wenn nur geprüft und nichts gebaut wurde.

Pflicht dabei:

1. **Ablage:** `uebergabe/05-uebergaben/YYYY-MM-DD-kurzer-titel.md`, erzeugt **nach der Vorlage**
   `uebergabe/vorlagen/uebergabe.md`.
2. **Alle Abschnitte der Vorlage** in ihrer Reihenfolge: Kopf (`Datum`, `Bearbeitet durch`,
   `Auftrag`, `Status`), Ziel der Sitzung, Ergebnis, Geänderte Bereiche, Entscheidungen und
   Annahmen, Prüfungen, Offene Punkte und Risiken, Empfohlener nächster Schritt, Git.
   Ein fehlender Pflichtabschnitt macht die Übergabe unbrauchbar, auch wenn der Inhalt reich ist —
   wer die Akte gewohnt ist, sucht die Angaben dort, wo sie stehen müssen.
3. **Gegen die Vorlage prüfen, nicht aus dem Gedächtnis.** Vor dem Melden die Abschnittsliste der
   Vorlage mit der geschriebenen Datei abgleichen (Zeile für Zeile), nicht „ich habe doch alles
   drin" annehmen. Die Vorlage ist die Prüfung.
4. **Nicht erfüllte Abnahmekriterien ausdrücklich benennen** — im Ergebnis oder in den offenen
   Punkten, mit dem Grund. Ein Kriterium stillschweigend fallen zu lassen ist der gefährlichste
   Fehler einer Übergabe.
5. **Prüfresultate nur belegbar eintragen** und fehlgeschlagene oder nicht ausgeführte Prüfungen
   ausdrücklich nennen. Commits mit Hash, und ob gepusht wurde oder nicht.
6. **Bestehende Übergaben werden ergänzt, nicht überschrieben.** Wird ein fehlender Abschnitt
   nachgetragen, bekommt er einen datierten Hinweis; der alte Wortlaut bleibt stehen.

*Aufgenommen am 2026-10-04 auf Thomas' Anweisung, weil die Welle-5-Übergabe der Vorlage nicht
folgte und zwei ältere Übergaben Lücken hatten.*

## Dokumentationspflicht nach Änderungen

- tatsächlichen Projektstand in `01-stand/aktueller-stand.md` aktualisieren,
- neue oder erledigte Aufgaben in `01-stand/offene-punkte.md` pflegen,
- größere Entscheidungen als ADR dokumentieren,
- neue Vorhaben zunächst als Konzept erfassen,
- eine sitzungsbezogene Übergabe nach der Vorlage anlegen (**Pflichtteil des Sitzungsabschlusses,
  siehe oben**),
- nur belegbare Prüfresultate eintragen.

## Git-Regeln

- Bestehende fremde Änderungen respektieren.
- Keine destruktiven Git-Befehle ohne ausdrückliche Freigabe.
- Inhaltlich zusammengehörige Änderungen gemeinsam committen.
- Commit-Nachrichten kurz und aussagekräftig formulieren.
- Eine Übergabe nennt relevante Commit-Hashes, sofern vorhanden.

