# Designkonzept: Aufklappbare Werkzeugnavigation

**Status:** umgesetzt
**Datum:** 2026-10-03  
**Verantwortlich:** Codex

## Ausgangslage

CommieTools besitzt inzwischen 21 Werkzeuge in fünf Suiten. Katalog und Suche sind leistungsfähig,
aber von einer geöffneten Werkzeugseite aus fehlt ein schneller, überall erreichbarer Wechsel zu
einem anderen Werkzeug. Zurzeit muss der Nutzer erst zum Katalog zurückkehren. Mit wachsender
Werkzeugzahl wird dieser Umweg spürbar.

Benötigt wird ein aufklappbares Werkzeugmenü, das den Katalog nicht ersetzt, sondern als schneller
Navigator über jeder Seite liegt. Es muss auf Desktop und Mobil dieselbe Informationsarchitektur
verwenden, ohne auf kleinen Bildschirmen Arbeitsfläche dauerhaft zu belegen.

## Ziele

- Von jeder Seite mit höchstens zwei Aktionen ein anderes Werkzeug öffnen.
- Werkzeuge nach Kategorie, Alphabet, letzter lokaler Nutzung und Favoriten anzeigen.
- Suche nach Namen, Begriffen, Tags und Dateitypen direkt im Menü ermöglichen.
- Bestehenden manifestbasierten Katalog und seine sprachübergreifende Suche wiederverwenden.
- Bedienung per Tastatur, Touch und Screenreader vollständig unterstützen.
- Favoriten und Verlauf ausschließlich lokal auf dem Gerät speichern.
- Auf Mobile mindestens 44 px große Ziele und keinen horizontalen Bildlauf erzeugen.

## Nicht-Ziele

- Den vollständigen Katalog oder die Suite-Seiten ersetzen.
- Beliebtheit aus zentraler Telemetrie oder Nutzertracking ableiten.
- Konten oder geräteübergreifende Synchronisierung voraussetzen.
- Im ersten Schritt frei verschiebbare oder verschachtelte Menüstrukturen anbieten.

## Gemeinsame Informationsarchitektur

Das Menü besteht in beiden Darstellungen aus:

1. Titel **Werkzeuge** und Schließen-Aktion,
2. lokaler Werkzeugsuche,
3. vier Sortieransichten,
4. scrollbarer Werkzeugliste,
5. kleiner Fußzeile mit Anzahl der gefundenen Werkzeuge.

### Sortieransichten

- **Kategorien** – Standardansicht, gruppiert nach den vorhandenen fünf Suiten.
- **A–Z** – flache alphabetische Liste in der gewählten Sprache.
- **Zuletzt** – zuletzt auf diesem Gerät geöffnete Werkzeuge, neueste zuerst.
- **Favoriten** – vom Nutzer auf diesem Gerät markierte Werkzeuge.

Eine serverseitige Ansicht **Beliebt** wird bewusst nicht eingeführt, weil sie Nutzungsanalyse oder
Telemetrie voraussetzen würde. Dateitypen werden nicht als fünfte permanente Ansicht benötigt:
Die vorhandene Suche findet bereits `pdf`, `png`, `webp` und weitere deklarierte Formate.

Jeder Listeneintrag zeigt genau:

- Werkzeugsymbol,
- lokalisierten Namen,
- eine kurze Kategorie- oder Formatzeile,
- Favoritenstern.

Beschreibungen, Tags und Datenschutzbadges bleiben im vollständigen Katalog, damit der
Schnellnavigator kompakt bleibt.

## Browser/Desktop

### Auslöser

Links im globalen Header erscheint vor dem Logo ein klarer Menübutton mit beschriftetem
Tooltip **Werkzeugmenü öffnen**. Er bleibt auf jeder Route an derselben Position.

### Geöffnet

- Ein seitlicher Drawer fährt von links ein.
- Zielbreite: 380–400 px; maximal 40 % des nutzbaren Fensters.
- Der Seiteninhalt bleibt sichtbar, wird aber durch einen neutralen Scrim zurückgenommen.
- Klick auf Scrim, Schließen-Schaltfläche oder `Escape` schließt das Menü.
- Fokus wandert beim Öffnen in das Suchfeld und kehrt beim Schließen zum Auslöser zurück.
- Der Drawer kann später optional angeheftet werden; das ist nicht Bestandteil der ersten Stufe.

Desktop verwendet ein Overlay statt einer dauerhaft sichtbaren Seitenleiste. Dadurch behalten
PDF-Vorschauen, Bildwerkzeuge und komplexe Editoren ihre volle Arbeitsbreite.

## Mobile

### Auslöser

Der gleiche Menübutton steht links im kompakten Header. Logo, Sprachwahl und Farbschema dürfen
nicht verdrängt werden; bei sehr schmalen Geräten bleiben Sprache und Theme im bestehenden
Kopfbereich oder im sekundären App-Menü.

### Geöffnet

- Das Menü nimmt unterhalb des Headers die volle verfügbare Breite ein.
- Es verhält sich wie ein Navigation-Sheet, nicht wie ein schmaler Desktop-Drawer.
- Suche und Sortierchips bleiben am oberen Rand sichtbar, während nur die Werkzeugliste scrollt.
- Werkzeugzeilen sind mindestens 52 px hoch und vollständig antippbar.
- Ein Tippen auf ein Werkzeug öffnet es und schließt das Menü.
- Android-Zurück und `Escape` schließen zuerst das Menü, bevor die Route verlassen wird.
- Wischgesten sind optional; Schließen darf niemals nur per Geste möglich sein.

## Suche und Sortierung

Die Menüsuche verwendet dieselbe Normalisierung und dieselben erzeugten Katalogdaten wie die
Hauptsuche. Sie darf keine zweite Suchlogik entwickeln. Während einer Suche werden die
Sortiergruppen ausgeblendet und Treffer als flache, gewichtete Liste mit kurzer Trefferbegründung
angezeigt.

Sortierung und Suchtext sind reine Ansichtsstände. Favoriten und maximal zehn zuletzt geöffnete
Werkzeuge werden lokal gespeichert. Es werden nur Werkzeug-IDs und Zeitpunkte gespeichert, keine
Dateinamen, Suchbegriffe oder Nutzerdokumente.

## Zustände

- **Standard:** Kategorien geöffnet; zuletzt gewählte Sortierung darf lokal gemerkt werden.
- **Suche:** flache Trefferliste mit Ergebniszahl und Treffergrund.
- **Keine Treffer:** klare leere Ansicht mit Aktion **Suche löschen**.
- **Keine Favoriten:** Erklärung plus Möglichkeit, Sterne direkt in anderen Ansichten zu setzen.
- **Erstes Gerät / leerer Verlauf:** Zuletzt-Ansicht erklärt, dass der Verlauf nur lokal entsteht.
- **Aktuelles Werkzeug:** wird mit Text und dezentem Hintergrund markiert, nicht nur mit Farbe.

## Barrierefreiheit

- Menübutton verwendet `aria-expanded` und `aria-controls`.
- Drawer ist eine benannte Navigation, kein modaler Dialog; Hintergrundinteraktion wird im offenen
  Overlayzustand dennoch unterbunden.
- Natürliche Fokusreihenfolge: Schließen, Suche, Sortierung, Werkzeuge, Fußzeile.
- Fokusfalle nur während des geöffneten Overlays; Rückgabe an den Auslöser ist Pflicht.
- Sortierung wird als ein beschriftetes Set von Toggle-Schaltflächen oder Tabs umgesetzt.
- Trefferänderungen werden einmalig und knapp über `aria-live="polite"` angesagt.
- Bewegung respektiert `prefers-reduced-motion`.
- Aktiver Zustand, Favorit und Kategorie hängen nie allein von Farbe ab.

## Responsive Regeln

- ab 768 px: seitlicher Overlay-Drawer, 380–400 px breit;
- unter 768 px: vollbreites Sheet unter dem Header;
- unter 360 px: Sortierchips horizontal scrollbar, Werkzeugzeilen bleiben ohne horizontalen Scroll;
- Querformat auf Mobilgeräten: Kopf des Menüs kompakter, Liste erhält die verbleibende Höhe;
- Zoom bis 200 % darf keine Aktion verdecken.

## Technische Einordnung

- Manifest, Symbole, Übersetzungen und `toolIndex.ts` bleiben die einzigen Werkzeugquellen.
- `searchTools` beziehungsweise seine reine Suchlogik wird wiederverwendet.
- Ein schmaler lokaler Navigationsspeicher verwaltet Favoriten, letzte Werkzeug-IDs und gewählte
  Sortierung; Fehler beim lokalen Speicher dürfen die Navigation nicht blockieren.
- Die Komponente gehört zur Web-Shell, nicht in die Werkzeugimplementierungen.
- Das Menü darf keine Toolmodule oder optionale Engines importieren. Es arbeitet ausschließlich mit
  Katalogmetadaten, damit die datensparsamen Ladegrenzen erhalten bleiben.
- Routenwechsel erfolgt über die vorhandene Navigation; kein vollständiger Seiten-Reload.

## Umsetzungsschritte

1. Datenmodell für Sortierung, Favoriten und lokalen Verlauf mit Tests definieren.
2. zugänglichen Desktop-Drawer und mobilen Sheet-Zustand als eine responsive Komponente bauen.
3. vorhandene Katalogsuche integrieren.
4. Header-Auslöser, Fokusmanagement, Escape und Android-Zurück anbinden.
5. Favoriten und Verlauf lokal persistieren.
6. Komponenten-, Tastatur-, Responsive- und Offline-Tests ergänzen.
7. manuellen Test auf Desktop-Chromium, Firefox, Safari/WebKit sowie Android und iOS durchführen.

## Akzeptanzkriterien

- [x] Werkzeugmenü ist von jeder normalen App-Route erreichbar.
- [x] Desktop zeigt einen seitlichen Overlay-Drawer; Mobile ein vollbreites Sheet.
- [x] Kategorien, A–Z, Zuletzt und Favoriten funktionieren ohne Netzwerk.
- [x] Suche entspricht dem Hauptkatalog und findet auch Dateitypen sowie fremdsprachige Begriffe.
- [x] Favoriten und Verlauf bleiben lokal und enthalten keine Nutzerdaten.
- [x] Aktuelles Werkzeug und leere Zustände sind verständlich dargestellt.
- [x] Öffnen, Schließen, Fokus, Escape und Zurück-Taste sind implementiert.
- [x] Kein optionales Toolmodul und keine PDF-Engine wird durch das Menü vorab geladen.
- [x] Responsive Layout und Touchziele sind ab 320 px ausgelegt.
- [x] `npm run check`, `npm run build` und Bundle-Prüfung bestehen.
