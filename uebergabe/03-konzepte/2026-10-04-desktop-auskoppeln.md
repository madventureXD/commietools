# Konzept: Werkzeuge auskoppeln (Desktop-Erfahrung)

**Datum:** 2026-10-04
**Status:** Vorschlag — wartet auf Entscheidung und Go
**Grundlage:** `05-uebergaben/2026-10-04-desktop-auskoppeln-m0.md` (Messungen), ADR 0001, ADR 0003,
`02-architektur/werkzeug-erstellen.md`, `docs/ui-system.md`

## Auftrag

Ein Werkzeug soll sich aus der Seite **auskoppeln** lassen: Es läuft dann in einem eigenen Fenster,
das auf die vom Werkzeug gebrauchte Größe zugeschnitten ist, und liegt auf Wunsch ständig im
Vordergrund. Das Design der Desktop-Darstellung wird dabei nicht neu erfunden — der Ausgangspunkt ist
ausdrücklich „es sieht super aus".

## Abnahmekriterium

Das Vorhaben ist fertig, wenn **jeder Punkt belegt** ist — nicht, wenn der Bau durchläuft:

1. **Ein Instanz-Nachweis:** Eine Bedienfolge (mehrere Rechenschritte, Text eingeben) liefert im
   ausgekoppelten Fenster dasselbe Ergebnis wie zuvor im Hauptfenster, und im Hauptfenster läuft
   keine zweite Kopie. Es gibt genau **einen** Zustand und **einen** Rechenlauf.
2. **Ein Rückkehr-Nachweis:** Nach dem Schließen des Fensters ist der Werkzeuginhalt unverändert
   vorhanden und wieder bedienbar (Eingaben und Ergebnis stehen noch da).
3. **Ein Breiten-Nachweis:** `npm run viewport:check` bei laufender Vorschau über die Seiten
   (Startseite, Katalog, Suche, je ein Werkzeug jeder Kategorie) bei 1920/1366/1024/768 px ohne
   Überbreite — dieselben Maße wie im heutigen Stand, also **keine Verschlechterung**.
4. **Ein Zugänglichkeits-Nachweis:** Der Knopf ist per Tastatur erreichbar, hat einen übersetzten
   zugänglichen Namen, der Fokus kehrt nach dem Schließen dorthin zurück, und Hell/Dunkel wird im
   zweiten Fenster mitgeführt.
5. **Ein Ehrlichkeits-Nachweis:** Der Knopf erscheint **nur** dort, wo die Schnittstelle vorhanden
   ist. Wo der Vordergrund nicht möglich ist, wird er nicht versprochen.
6. **Die Prüfkette:** `npm run check`, `npm run lint`, `npm run build`, `npm run viewport:check` und
   `git diff --check` grün — oder jede Abweichung mit Grund in der Übergabe.

**Was das Abnahmekriterium ausdrücklich nicht verlangt:** eine exakte Fenstergröße. Die M0-Messung
zeigt, dass der Browser die Größenangabe in Edge 154 ignoriert (Fenstergröße des Aufrufers gewinnt).
Eine zugesicherte Größe wäre eine Zusage, die die Plattform nicht hergibt.

## Open-Source-Kandidatenprüfung (Pflicht nach ADR 0001)

Untersucht wurden die Wege zu einem schwebenden Fenster und die dafür verfügbaren freien Lösungen.

| Kandidat | Befund | Urteil |
|---|---|---|
| `@pip-it-up/core` 0.2.0 | MIT (Lizenzdatei im Paket gelesen), keine Laufzeit-Abhängigkeiten, 34,1 kB roh / **8,0 kB gzip**, letzter Push 2026-10-03, SLSA-Provenienz, echte Feature-Erkennung | **geeignet** |
| `@pip-it-up/react` 0.2.0 | MIT, Kern + `react >= 18` als Peer, 52,8 kB / 12,5 kB gzip, ab 0.1.9 seit Mai 2026 | geeignet |
| `pip-it-up` 1.0.0 | **Stub mit 273 Bytes** („Use @pip-it-up/react instead"), trägt irreführend die höchste Versionsnummer | **unbrauchbar** |
| Eigenentwicklung | müsste Stilübertragung, Tastaturweiterleitung, Scroll- und Fokusrückkehr, Platzhalter und Rückfall selbst lösen | **nach ADR 0001 nicht zulässig** |

**Entscheidende Einzelheit:** Die M0-Messung hat gezeigt, dass der Rückweg **nicht** automatisch ist —
nach dem Schließen ist der Inhalt verloren, und ein zweites Auskoppeln liefert ein leeres Fenster.
Genau diese Arbeit leistet die Bibliothek (`mode: 'move'`, `reserveSpace`, `restoreScroll`,
`restoreFocus`, `forwardKeyboardEvents`). ADR 0001 gibt Open-Source-Lösungen Vorrang; ein Kandidat,
der die Muss-Kriterien erfüllt, ist vorhanden. **Die Bibliothek ist deshalb zu nehmen, nicht
nachzubauen.**

Unsere eigenen Teile bleiben: die Oberfläche und der Knopf, die Wunschgröße je Werkzeug, die
Sprachtexte, der Fehlerfall, die Tests und die Abnahme — also Adapter, nicht Kernfunktion.

**Zwei Vorbehalte, die bestehen bleiben:** 0.2.0 ist als „public beta" bezeichnet und das Projekt hat
einen Einzelentwickler (53 Sterne, rund 250 Abrufe im Monat). Rückversicherung ist die MIT-Lizenz:
ein Fork bleibt jederzeit möglich. Beides gehört in den Aufnahme-ADR.

## Technischer Aufbau (Skizze — in M3 zu belegen, nicht zu glauben)

- **Ein Rahmen um die Werkzeugseite.** Die Auskoppel-Steuerung gehört in den gemeinsamen Rahmen von
  `ToolPage`, nicht in jedes Werkzeug einzeln — sonst entsteht 41-mal dieselbe Logik.
- **Ein React-Baum, zwei Dokumente.** Der Werkzeuginhalt wird per Portal in das zweite Dokument
  gerendert. Erwartung: Die Komponente wird dabei **nicht** neu eingehängt, ihr lokaler Zustand
  bleibt also erhalten — das ist die Voraussetzung für den Instanz-Nachweis und in M3 ausdrücklich zu
  belegen.
- **Achtung, bekannte Falle:** Ein Element, das mit `append()` in ein fremdes Dokument verschoben
  wird, verliert die React-Ereignisse, weil React sie am Wurzelknoten des Herkunftsdokuments
  abfängt. Der M0-Versuch hat das Element bewegt (das Bild im Hauptfenster ist leer) — für React
  braucht es den Portal-Weg. Die Bibliothek bietet beide Wege (`move`, `clone`, `portal`).
- **Stile** werden mitgeführt (`copyStyles: 'sync'`, Standard); die Nachführung bei Hell/Dunkel ist
  in M3 zu prüfen. Ein zweiter Abruf externer Stylesheets ist dokumentiert und im PWA-Zwischenspeicher
  unkritisch.
- **Rückkehr** über `pagehide`; die Bibliothek hängt zurück und stellt Scrollposition und Fokus her.
- **Herkunft der Wunschgröße:** ins Manifest. „Perfekt zugeschnitten" muss eine Angabe sein, nicht
  geraten. Das erfordert einen Katalogumbau (`catalog-generate.mjs` und die Abnahme in
  `catalog:check` müssen das Feld kennen), sonst fällt es durch die Prüfung. *Diese technische
  Entscheidung ist hiermit getroffen und begründet.*
- **Keine neue Datenübertragung.** Alles bleibt lokal; es gibt keinen Upload-Pfad.

## Gemessene Grenzen, die das Konzept tragen muss

- **Der Vordergrund ist Chromium und Firefox vorbehalten** (Chrome/Edge/Opera 116+ bzw. 102+,
  Firefox 151+ seit Mai 2026). **Safari** hat keine Position und keine Implementierung; **mobil**
  gibt es die Schnittstelle nicht.
- **Die Größe ist nicht durchsetzbar** (siehe Abnahmekriterium). Offene Gegenprobe: Verhalten in
  Chrome und Firefox sowie nach nachträglicher Fenstergrößenänderung.
- **Ein Fenster je Tab**, es lebt **nie länger als das Herkunftsfenster**, ist nicht navigierbar,
  seine Position ist nicht setzbar, und Vollbild ist darin gesperrt.
- **Nur Top-Level und nur über HTTPS** — beides bei commietools.org erfüllt.
- **Im kopflosen Browser ist die Größe nicht abnehmbar.** Jede Größenabnahme braucht ein echtes
  Fenster; das ist ein eigener Schritt, kein Nebenprodukt.

## Arbeitspakete

| # | Paket | Inhalt | Beleg am Ende |
|---|---|---|---|
| M2 | Abhängigkeit aufnehmen | `licenses:generate`/`:check`, `bundle:check`, Startbudget messen, Aufnahme-ADR | grüne Prüfkette, gemessene gzip-Zahl |
| M3 | Ein Werkzeug ausgekoppelt | Rahmen, Knopf, Portal, Stile, Hell/Dunkel, Rückkehr, Fokus | Instanz- und Rückkehr-Nachweis, Bilder |
| M4 | Wunschgröße je Werkzeug | Manifestfeld, `catalog:generate`, Abnahme in `catalog:check`, Prüfung absichtlich verletzen | `catalog:check` grün, jede Größe begründet |
| M5 | Ausrollen | Verhalten je Werkzeugtyp, Texte in allen Sprachen, Symbolik | jede Werkzeugseite geprüft, Sprachtests grün |
| M6 | Verhalten ohne PiP | Vorgabe der Produktentscheidung umsetzen und belegen | belegtes Verhalten |
| M7 | Dokumentation und Übergabe | `docs/ui-system.md` fortschreiben, Stand, Übergabe | Abschnittsprüfung grün |

**Offen und ehrlich:** Aufwände in Sitzungen nenne ich erst nach M3. Der teure Einzelschritt ist M3
(er entscheidet über die Portal-Frage); M5 skaliert mit den Werkzeugen, die sich eignen — das ist
Gegenstand der Entscheidung unten.

## Entscheidungen, die Thomas treffen muss

Die folgenden vier Punkte sind Produktentscheidungen. Meine Empfehlung steht jeweils dabei, die
Begründung liegt im Text dieses Konzepts.

1. **Reichweite** — nur Werkzeugseiten oder auch Katalog und Suche auskoppelbar?
2. **Ersetzen oder Spiegeln** — läuft das Werkzeug im Hauptfenster als Platzhalter weiter (Ersetzen),
   oder zeigen beide Fenster dasselbe (Spiegeln)?
3. **Verhalten ohne Vordergrund** (Safari und jeder Browser ohne die Schnittstelle) — Knopf
   ausblenden oder Fenster ohne Vordergrund anbieten?
4. **Aufnahme der Bibliothek** — `@pip-it-up/core`/`-react` aufnehmen oder einen anderen Weg gehen?
