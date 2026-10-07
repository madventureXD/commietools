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
- **Datensparsamkeit gilt auch für Downloads:** Eine Route lädt nur Shell, aktive Sprache, Englisch
  als Rückfall und die
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

*Zusatz 2026-10-07 (Faber, QM-Karte M10-002): Die Prüfung ist ab jetzt **maschinell**:
`npm run akte:check` (Teil von `npm run check`) prüft die Kopffelder, die Pflichtabschnitte,
den Prüfnachweis und die Revision. Die **Vorlage** trägt den Kopf jetzt ebenfalls mit `Auftrag` —
bis dahin verlangte diese Regel ein Feld, das die Vorlage nicht hatte (gefundene Abweichung).
Gleichwertige Überschriften sind zugelassen und werden nur gemeldet; ein fehlender Abschnitt ist
ein Mangel. Übergaben vor dem 2026-10-07 sind historisch: Lücken werden gemeldet, nicht gewertet
(siehe `01-stand/offene-punkte.md`, OP-018/OP-034).*

## Aktenkorrektur — ergänzen statt umschreiben

Gilt für alles, was in der Akte steht: Übergaben, Protokolle, Konzepte, ADRs, Stand und offene
Punkte. Eine bestehende Aussage wird **nicht ersetzt** — sie bleibt im Wortlaut stehen und bekommt
einen **datierten Nachtrag**. Der Nachtrag nennt vier Dinge:

1. **die ersetzte Aussage** — im Wortlaut zitiert oder mit Zeilenverweis,
2. **den Grund** — was sie widerlegt (Messung, Entscheidung, Commit),
3. **die richtige Aussage** — der heutige Stand,
4. **den Beleg** — Commit, Protokoll, ADR oder Messung.

Die **ursprüngliche Fassung bleibt abrufbar**: sie steht in der Git-Geschichte
(`git show <revision>:<pfad>`), und der Nachtrag nennt die Revision. Die Git-Geschichte wird **nie**
umgeschrieben — kein Rebase, kein Amend an veröffentlichten Ständen, kein Revert zum Aufräumen.

**Strukturmigration** (eine Akte auf eine neue Vorlage bringen) ist nur mit **beschlossener Ausnahme**
zulässig; die Fassung davor bleibt als Archivfassung erhalten und wird im Kopf der Akte benannt.
Ohne Beschluss gilt der Nachtrag.

**Wortwahl:** „Wortlaut bleibt stehen" darf nur schreiben, wer den Vergleich gemacht hat. Eine
Behauptung über die eigene Sorgfalt ist selbst eine Aussage, die belegt werden muss.

**Maschinelle Prüfung:** `npm run akte:check` (Regelkreis `korrektur`) vergleicht den Arbeitsbaum
gegen `HEAD` und sucht **verschwundene Worte** in den geschützten Akten (`05-uebergaben/`,
`06-protokolle/`, `03-konzepte/`, `04-entscheidungen/`). Reine Formatierung — Absatzumbruch,
Einrückung, Leerzeichen — verändert kein Wort und löst **keinen** Befund aus. Eine inhaltliche
Änderung ohne datierten Nachtrag scheitert. Eine **Vollsperre** gibt es bewusst nicht: Metadaten-,
Link- und Ergänzungskorrekturen müssen möglich bleiben.

*Aufgenommen am 2026-10-07 (QM-Karte M10-003). Anlass, gemessen: vier Übergaben waren bei der
Angleichung an die Vorlage umgeschrieben worden — `6e33dc3` (drei Dateien, +179/−82) und `ed0ee4e`
(+94/−39) —, ohne dass die Akte das kennzeichnete. Die betroffenen Dateien tragen seit dem
2026-10-07 einen datierten „Hinweis zur Fassung" mit dem Abrufweg der Fassung davor; ihre
Git-Geschichte ist unverändert.*

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

