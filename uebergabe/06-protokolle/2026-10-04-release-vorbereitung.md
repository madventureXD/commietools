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
- Die saubere Checkout-Prüfung deckte zeilenendenabhängige Vergleiche in Lizenz- und
  Katalogprüfung auf. Hashes und generierte Texte werden nun als kanonischer LF-Text verglichen,
  damit derselbe Commit unter Windows mit CRLF und in einem frischen Checkout mit LF identisch
  geprüft wird.

## Abschluss

Der zusammengehörige Stand wurde mit `a47d725` eingecheckt, in einem separaten sauberen Checkout
vollständig abgenommen und nach zwei Nachbesserungen als `95e1b2f` auf `main` veröffentlicht.
Bestanden haben Katalog-, Lizenz-, Typ-, Test-, Build-, Bundle-, Diff- und 320-px-Prüfung. Der
Push löst die automatische Cloudflare-Pages-Bereitstellung aus; die Online-Nachkontrolle ist in
der Abschlussübergabe als nächster Schritt festgehalten.
