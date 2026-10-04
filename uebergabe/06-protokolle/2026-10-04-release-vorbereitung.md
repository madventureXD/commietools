# Release-Vorbereitung 4. Oktober 2026

## Erledigt

- Fabers Hinweis zum nicht baubaren `HEAD` aufgenommen: Der vollständige zusammengehörige
  Arbeitsstand wird vor der Veröffentlichung gemeinsam eingecheckt.
- Gemeinsame Mindestbreiten der Werkzeugvorlage korrigiert; Formulare, Karten, Flexzeilen und
  lange Überschriften schrumpfen beziehungsweise umbrechen nun innerhalb des Viewports.
- Einen reproduzierbaren Edge-Check ergänzt, der jede Route aus dem erzeugten Werkzeugkatalog bei
  exakt 320 px vermisst und abgeschnittene Elemente ablehnt. Bewusst horizontal scrollbare
  Tabellen werden als solche erkannt.
- Alle 41 Werkzeugrouten bestehen den 320-px-Lauf.
- Das bereits online sichtbare Impressum bleibt unverändert; Anschrift und Kontakt sind vorhanden.

## Noch auszuführen

1. Gesamten zusammengehörigen Stand committen.
2. Exakt diesen Commit in einem separaten sauberen Checkout mit Katalog-, Lizenz-, Typ-, Test-,
   Build-, Bundle-, Diff- und 320-px-Prüfung abnehmen.
3. Veröffentlichung vorbereiten, aber ohne ausdrücklichen Folgeauftrag weder pushen noch deployen.
