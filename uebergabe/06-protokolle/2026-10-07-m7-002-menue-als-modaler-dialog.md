# M7-002 — Die Menü-Fokusbegrenzung berücksichtigte sichtbare Kategorien nicht

**Datum:** 2026-10-07 · **Bearbeitet durch:** Faber (Hermes, Team 2) · **Karte:** M7-002 (R5)
**Ergebnis:** behoben — das Menü ist jetzt ein **nativer modaler Dialog**; eigene Tab-Liste entfallen.

## Was die Karte verlangt

- Menümodell ausdrücklich entscheiden; für den abschirmenden Schubkasten ist ein **modaler Dialog**
  konsistent. **Bevorzugt natives `dialog`/`showModal()`** evaluieren, sonst bewährte, lizenzgeprüfte
  Dialogprimitive statt einer unvollständigen eigenen Selektorliste.
- Hintergrund **wirklich inaktiv**; sichtbare `summary`, Links und Auswahlfelder einschließlich
  **geschlossener Details** korrekt behandeln.
- Auf Telefonen initial Überschrift/Schließen fokussieren, **nicht** die Suche (Tastatur verdeckt
  sonst das Menü).
- Verlauf zurück und Schließen dürfen nur **einmal** navigieren.
- **Nicht tun:** nicht nur `summary` an die alte Selektorliste anhängen — verborgene Nachfahren und
  der Hintergrund bleiben sonst problematisch. `aria-modal` allein sperrt keinen Hintergrund.

## Bestandsaufnahme (gemessen)

Der alte Zustand: eigene Tab-Liste `button:not(:disabled), input:not(:disabled)` im Effekt. Sie
- übersah `summary` (Bedienflächen der Kategorien) und `select`,
- zählte **verborgene Nachfahren geschlossener `<details>`** mit,
- hatte kein `role="dialog"`, kein `aria-modal` und **keinen** Mechanismus, der den Hintergrund sperrt.

## Umsetzung — Entscheidung: nativer modaler Dialog

`<dialog>` + `showModal()`. Damit kommt, was die Karte fordert, **aus der Plattform** statt aus
eigener Zählung:

| Anforderung | Wirkung von `showModal()` |
|---|---|
| Hintergrund wirkt nicht | alles hinter dem Dialog ist inaktiv (Tastatur und Hilfstechnik) |
| Fokus bleibt im Menü | Fokus ist im Dialog eingeschlossen |
| `Escape` schließt | natives `cancel`-Ereignis |
| Umlauf am Ende | Browser-Umlauf über das Dokument (siehe Beleg) |

Konkret:
1. `dialog.tool-menu-dialog` mit `aria-label`; darin der bisherige Schubkasten. Die alte
   Schirmfläche (`.tool-menu-scrim`) entfällt zugunsten von `::backdrop`; ein Klick auf die
   Rückseite schließt (`event.target === dialog`).
2. Die **eigene Tab-Liste ist entfernt** (die Karte verbietet das bloße Ergänzen von `summary`).
3. **Erste Fokussierung:** ab 721 px das Suchfeld (wie bisher), darunter der **Schließen-Knopf**.
4. **Fokus-Rückkehr** über einen nativen `close`-Zuhörer; zusätzlich bekommt der Auslöser den Fokus
   schon **beim Öffnen**, weil der Browser beim Schließen genau dorthin zurückgibt.
5. `Escape` läuft über `onCancel` → `closeMenu()` (ein Weg, ein Verlaufseintrag).

## Belege (`work/m7-002-fokus-beleg.cjs`, Messwerte in `work/m7-002-messwerte.json`)

Beide Breiten, echte Tastenereignisse (`Input.dispatchKeyEvent`), Zustände erzeugt:

| Prüfung | 1360 px | 390 px |
|---|---|---|
| Erste Fokussierung | Suchfeld | **Schließen-Knopf** |
| Hintergrund per Tastatur erreichbar | nein (bleibt gesperrt) | nein |
| Tabulatorlauf, geschlossene Kategorien (14 Schritte) | alle im Dialog, **0 verborgene Ziele** | dito |
| Tabulatorlauf, offene Kategorie (10 Schritte) | 0 außerhalb | dito |
| Shift+Tab (6 Schritte) | 0 außerhalb | dito |
| Ohne Treffer (`zzzqqq`) | Hinweis erscheint, 0 außerhalb | dito |
| Favoriten-Sortierung | 0 außerhalb | dito |
| Escape | schließt, Route bleibt `/`, Verlaufseintrag weg | dito |
| Rücktaste bei offenem Menü | schließt, Route bleibt `/` | dito |
| Fokus-Rückkehr | **zurück am Auslöser** (Verlauf über 8 Zeitpunkte) | dito |
| Werkzeugwechsel per echtem Zeigerklick | Route `/tools/pdf-merge`, Dialog **geschlossen** | dito |

**Prüfmittel-Lehren (eigene Fehler):**
1. **Der Umlauf am Ende landet auf `body`.** Ein Schritt außerhalb des Dialogs ist erst dann ein
   Befund, wenn er **kein** `body` ist — `body` ist der Browser-Umlauf, kein Hintergrundzugriff.
   Ohne diese Unterscheidung meldete der Lauf vier Befunde, die keine waren.
2. **`.click()` erzeugt keinen realistischen Bedienvorgang.** Der Werkzeugwechsel wurde erst mit
   einer echten Zeigerbewegung wirklich ausgelöst; ein Programmaufruf meldete „Dialog bleibt offen",
   obwohl er nie geklickt hatte. Jetzt wird der Trefferpunkt vorher geprüft.
3. **Eine Einzelmessung des Fokus ist zu wenig.** Der erste Anlauf meldete „Fokus kehrt nicht
   zurück"; die Abtastung über 8 Zeitpunkte zeigt den Verlauf und deckt auf, *wann* etwas passiert.
4. **Der Prüflauf selbst hatte den Zustand verändert** (Favoriten-Sortierung blieb im
   Gerätespeicher), sodass ein späterer Schritt gar keine Werkzeugzeilen mehr fand. Zustand vor dem
   Schritt ausdrücklich setzen.

**Kette:** `npm run check` Exit 0 (695 Tests, 48 Dateien, 109 Warnungen wie zuvor) ·
`npm run build` Exit 0 (Startbündel 149369 B gzip).

## Benannte Grenzen

- **Kein echter Vorleserlauf** — für M7-002 verlangt die Karte ihn nicht ausdrücklich; die
  Inaktivität des Hintergrunds für Hilfstechnik ist über das Plattformverhalten von
  `showModal()` begründet und über die Tastatur **gemessen**, nicht gesprochen geprüft.
- **Der `body`-Umlauf bleibt.** Beim Weiterlaufen am letzten Element läuft der Fokus kurz über das
  Dokument, bevor er wieder in den Dialog kommt. Kein Hintergrundbedienelement ist dabei
  erreichbar (gemessen) — benannt, weil es beobachtbar ist.
- Die Übergangsbewegung des Schubkastens ist mit dem Dialogknopf verbunden (`[open]`); ob sie in
  jedem Browser animiert, ist nicht geprüft (nicht Teil der Abnahme).
