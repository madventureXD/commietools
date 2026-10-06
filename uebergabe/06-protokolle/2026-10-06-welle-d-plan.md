# Welle D — Ziel, Umfang und Abnahmekriterien

**Datum:** 2026-10-06  
**Auftrag:** Go von Thomas vom 2026-10-06 („Go für d")  
**Grundlage:** `03-konzepte/2026-10-03-handwerkerwerkzeuge.md`, Welle D „Dokumentation":
19 Foto-Beschrifter, 20 Abnahme-/Übergabe-/Mängelprotokoll, 23 Prüffristen-Checkliste.
Alle drei Klasse a (erprobte Bausteine im Projekt, keine neue Abhängigkeit).

Vor der Arbeit gelesen: `02-architektur/werkzeug-erstellen.md` (§1 hält Zweck, Ein-/Ausgabe,
Fehlerfälle und Datenschutzgrenzen **vor** der Umsetzung fest — dieses Dokument erfüllt das),
`02-architektur/sprachpakete.md`, `docs/ui-system.md`, `docs/localization.md`.

## Reihenfolge (technische Entscheidung, begründet)

1. **Prüffristen (23)** — kleinster Baustein, keine Dateien, keine Engine. Nutzt `idb-keyval`
   (vorhanden, 2,4 KiB gzip) und die Fristenlogik aus `calculator/dates.ts`. Prüft die ganze
   Werkzeugkette erneut, ohne neue Abhängigkeit.
2. **Foto-Beschrifter (19)** — braucht Canvas, `pdf-lib` (vorhanden) und den eigenen EXIF-Leser
   (vorhanden). Legt die Datei- und PDF-Ausgabe bereit, die Werkzeug 20 wiederverwendet.
3. **Protokoll (20)** — braucht zuerst das **Herausziehen der Zeichenfläche** aus
   `PdfPlacementTools.tsx` als gemeinsamen Baustein (Vorgabe des Konzepts: „als gemeinsamer
   Baustein statt einer zweiten Umsetzung"), dann Formular, Fristen und PDF-Ausgabe.

## Werkzeug 23 — Prüffristen-Checkliste

- **Zweck:** wiederkehrende Prüfungen (Leitern, PSA, Prüfmittel) je Gegenstand mit Frist und
  letzter Prüfung verwalten; anzeigen, was fällig ist.
- **Eingabe:** Bezeichnung, Prüfart, Intervall (Monate), letzte Prüfung (Datum), Notiz.
- **Ausgabe:** Liste „überfällig / bald fällig / in Ordnung" mit Resttagen und nächstem Termin;
  Export als Datei (CSV) zum Übernehmen in Kalender oder Tabelle.
- **Fehlerfälle:** leeres Bezeichnungsfeld, Intervall ≤ 0 oder unplausibel groß, ungültiges Datum
  (z. B. 31.02.), Datum in der Zukunft als „letzte Prüfung".
- **Datenschutz:** alles im lokalen Speicher des Geräts (`idb-keyval`), keine Übertragung, kein Konto.
- **Ehrliche Grenze (aus dem Konzept, verbindlich):** ohne Server kann das Werkzeug **nicht
  erinnern** — es zeigt beim Öffnen, was fällig ist, und exportiert. Das wird in der Oberfläche
  benannt, nicht verschwiegen.
- **Abnahmekriterien:**
  1. Einträge überleben ein Neuladen (im Browser belegt, nicht im Test allein).
  2. Die Einordnung „überfällig / bald fällig / in Ordnung" stimmt gegen ein festes Bezugsdatum,
     samt Grenzfall (genau heute fällig = fällig).
  3. Intervall-Arithmetik über Monatsenden und Jahreswechsel stimmt (31.01. + 1 Monat).
  4. Der Export enthält genau die sichtbaren Einträge, Datumsformat aus dem Land der Sprache.
  5. Kein Netzverkehr beim Arbeiten (Beleg über den Netzwerkmitschnitt).
  6. `check`, `lint`, `build`, `a11y:check`, `viewport:check` grün; Texte in de/en/es vollständig.

## Werkzeug 19 — Baustellenfoto-Beschrifter

- **Zweck:** Fotos lokal mit Zeitstempel, Ortsnotiz, Pfeil und Text versehen und als Sammel-PDF
  ausgeben (Dokumentation, die sonst nur mit Server-Apps geht — hier bleibt das Bild im Gerät).
- **Eingabe:** eine oder mehrere Bilddateien (JPEG/PNG/WebP), je Foto Text, Pfeil (Position,
  Richtung), Zeitstempel (aus EXIF, überschreibbar).
- **Ausgabe:** je Foto ein beschriftetes Bild **und** ein Sammel-PDF in der Reihenfolge der Liste;
  Dateiname vor dem Speichern editierbar.
- **Fehlerfälle:** kein Foto, defektes Bild, Bild ohne EXIF (Zeitstempel dann leer statt geraten),
  sehr großes Foto, viele Fotos gleichzeitig (Speichergrenze — **messen, nicht annehmen**).
- **Datenschutz:** kein Upload, keine externe Bibliothek, kein Netz; EXIF wird lokal gelesen
  (eigener Leser, vorhanden).
- **Abnahmekriterien:**
  1. Der Zeitstempel stammt aus den EXIF-Daten eines **echten Fremdfotos**, nicht aus der Laufzeit
     des Programms (Beleg gegen eine frei verfügbare Bilddatei).
  2. Das erzeugte PDF ist mit einem unabhängigen Betrachter zu öffnen; die Reihenfolge stimmt.
  3. Das Originalbild bleibt unverändert (Pixelvergleich: Abweichungen nur im Bereich der Marke).
  4. Die Speichergrenze ist **gemessen** und im Bericht beziffert (Anzahl × Bildgröße ohne Absturz).
  5. Kein Netzverkehr; `check`, `lint`, `build`, `a11y:check`, `viewport:check` grün; drei Sprachen.

## Werkzeug 20 — Abnahme-, Übergabe- und Mängelprotokoll

- **Zweck:** Formular für Übergaben und Mängel, Unterschrift vor Ort, Fotos einbetten, PDF-Export;
  Fristen für Gewährleistung (BGB 5 Jahre, VOB 4 Jahre) werden berechnet, nicht behauptet.
- **Eingabe:** Objekt/Bauvorhaben, Auftraggeber und Auftragnehmer (Namen), Datum, Mängelzeilen
  (Beschreibung, Ort, Frist), Fotos, Unterschrift (Zeichenfläche).
- **Ausgabe:** ein PDF mit Kopf, Mängelliste, Fristen, Fotos und Unterschriften.
- **Fehlerfälle:** leere Pflichtfelder, kein Mangel erfasst, Datum ungültig, Unterschrift fehlt
  (Hinweis statt leerer Zeile), zu viele/large Fotos.
- **Datenschutz:** alle Angaben und Bilder bleiben im Gerät.
- **Rechtsgrenze:** Fristen sind **Rechtsanwendung, nicht Rechtsberatung** — als Hinweis sichtbar.
- **Abnahmekriterien:**
  1. Die Zeichenfläche ist **ein** gemeinsamer Baustein; die zweite Umsetzung in
     `PdfPlacementTools.tsx` ist entfernt (belegt über den Diff, nicht behauptet).
  2. Fristen stimmen gegen handgerechnete Fälle aus `calculator/dates.ts` (datierte Zufälle,
     Jahreswechsel enthalten).
  3. Das PDF öffnet sich, enthält alle erfassten Zeilen, Fotos und Unterschriften.
  4. Leere Pflichtfelder und fehlende Unterschrift werden als Hinweis gezeigt, nicht still erzeugt.
  5. `check`, `lint`, `build`, `a11y:check`, `viewport:check` grün; drei Sprachen.

## Gemeinsame Punkte aller drei Werkzeuge

- Katalogpflicht je Sprache: `summary` (≤ 120 Zeichen) und `terms` (mit `#Tag`), Symbol unter
  `apps/web/public/tools/<id>.svg`, Dateivertrag im Manifest, `catalog:generate` vor jeder Prüfung.
- Keine nutzerseitigen Texte im Code; Aufzählungswerte über Übersetzungsschlüssel.
- Neue Dateitypen nur nach Aufnahme in `knownFormats` (`packages/core`).
- Nachweise im Browser (Edge headless über CDP), Nebeneffekte **nachgemessen**, nicht behauptet.

## Vorgesehene Kennungen (Vorschlag, endgültig mit dem Manifest)

| Werkzeug | Kennung | Route | Kategorie |
|---|---|---|---|
| 23 Prüffristen | `inspection-due` | `/tools/inspection-due` | `craft` |
| 19 Foto-Beschrifter | `photo-caption` | `/tools/photo-caption` | `image` |
| 20 Protokoll | `acceptance-report` | `/tools/acceptance-report` | `pdf` |
