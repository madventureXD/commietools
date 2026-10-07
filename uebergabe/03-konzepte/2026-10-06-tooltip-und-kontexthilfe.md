# Tooltips und kontextsensitive Hilfe

**Stand:** 06.10.2026  
**Status:** vollständiges Umsetzungskonzept, noch nicht implementiert  
**Geltungsbereich:** Web/PWA, Desktop, Touch, Stift, Tastatur und assistive Technik  
**Projektbezug:** `packages/ui`, `apps/web`, `packages/i18n` und werkzeugspezifische Sprachpakete

## 1. Entscheidung in einem Satz

CommieTools erhält ein zentrales Hilfesystem mit **echten, nicht interaktiven Tooltips für
Maus und Tastatur**, einer zusätzlichen **Press Preview für Touch-Aktionsknöpfe** sowie einem
sichtbaren **Info-Knopf für notwendige oder ausführliche Hilfe**.

Der verbindliche Kurzstandard lautet:

| Eingabe | Verhalten |
|---|---|
| Maus-Hover | kurze Hilfe nach 350 ms anzeigen |
| Tastaturfokus | kurze Hilfe ohne absichtliche Verzögerung anzeigen |
| Klick / kurzer Tap | normale Aktion ausführen |
| Touch halten | Press Preview nach 450 ms anzeigen |
| Nach Press Preview über dem Knopf loslassen | normale Aktion genau einmal ausführen |
| Vor dem Loslassen wegziehen | Aktion abbrechen; Zurückziehen kann sie wieder aktivieren |
| Info-Knopf aktivieren | ausführliche Kontexthilfe gezielt öffnen |
| `Escape` | offene Hilfe schließen, ohne die Aktion auszuführen |

Es gibt keine Tooltip-Einstellungen und kein Einführungs-Popup. Zeiten und Verhalten sind Teil
des Designsystems. Sicherheitsabfragen, Validierung und Bestätigungen bleiben unverändert.

## 2. Präzisierung des Vorkonzepts

Das Vorkonzept aus dem Chat bleibt in seinem Kern erhalten, wird technisch und semantisch aber
geschärft:

- **Long-Press bleibt eine Zusatzfunktion, nie der einzige Zugang zu erforderlicher Information.**
  Adobe React Spectrum zeigt auf Touch bewusst keine Tooltips und empfiehlt dort Popover bzw.
  Contextual Help. Das ist ein guter Hinweis gegen versteckte Pflichtinformation.
- Ein über Long-Press erscheinender Hinweis heißt intern **Press Preview**. Er darf visuell wie ein
  Tooltip aussehen, ist jedoch kein eigenständiges ARIA-Muster.
- **Loslassen führt aus**, sofern der Finger wieder über dem ursprünglichen Knopf liegt. Die
  eigentliche Fachaktion läuft erst über das normale `click`-Verhalten des nativen Knopfes.
- **Wegziehen bricht ab.** Das entspricht der von WCAG empfohlenen Aktivierung auf dem Up-Event und
  der üblichen Möglichkeit, vor dem Loslassen abzubrechen.
- Ein `ⓘ` ist für notwendige, längere oder interaktive Hilfe **verpflichtend**, für rein ergänzende
  Kurztexte optional. Damit bleibt die Regel aus `docs/ui-system.md` erhalten: Keine erforderliche
  Aktion und keine erforderliche Information darf nur über Hover oder eine versteckte Geste
  erreichbar sein.
- Ein Tooltip enthält niemals Links, Knöpfe, Eingaben oder „Mehr erfahren“. Sobald Interaktion oder
  strukturierter längerer Inhalt nötig ist, wird Kontexthilfe verwendet.

## 3. Ziele und Nicht-Ziele

### Ziele

- Die reduzierte Oberfläche erklärt sich bei Bedarf, ohne häufige Abläufe zu verlangsamen.
- Alle Werkzeuge verwenden dasselbe Verhalten und dieselbe Darstellung.
- Maus, Touch, Stift, Tastatur, Switch-/Sprachsteuerung und Screenreader bleiben gleichzeitig
  nutzbar; die zuletzt verwendete Eingabeart darf wechseln.
- Texte werden vollständig übersetzt und werkzeugspezifisch nachgeladen.
- Positionierung bleibt bei Zoom, kleinen Ansichten, RTL, Scrollcontainern und ausgekoppelten
  Werkzeugfenstern stabil.
- Die Lösung ist Local-/Offline-First, ohne Telemetrie, externe Schrift oder Laufzeit-CDN.
- Neue Werkzeuge liefern Hilfetexte deklarativ, nicht mit eigener Ereignislogik.

### Nicht-Ziele

- Tooltips ersetzen keine sichtbaren Feldbeschriftungen, Fehlermeldungen, Sicherheitsabfragen oder
  Dokumentation.
- Es wird nicht jeder Textknopf mit einer redundanten Wiederholung seines Labels versehen.
- Das HTML-Attribut `title` ist keine Implementierung: Es ist auf Touch und für manche
  Tastaturnutzer nicht zuverlässig zugänglich und lässt sich nicht ausreichend steuern.
- Es gibt weder Nutzerkonto noch lokale Tooltip-Präferenzen.
- Hover-/Touch-Fähigkeit wird nicht aus Browsernamen oder Bildschirmbreite abgeleitet.

## 4. Informationsklassen

| Klasse | Inhalt | Darstellung | Zugang | Interaktiv? |
|---|---|---|---|---|
| `label` | Name eines reinen Symbolknopfes | Tooltip | Hover, Tastaturfokus; Touch über zugänglichen Namen | nein |
| `hint` | ein kurzer ergänzender Satz | Tooltip / Press Preview | Hover, Tastaturfokus, optional Long-Press | nein |
| `warning` | knappe Folge einer Aktion | Tooltip / Press Preview; sichtbare Bestätigung bleibt separat | wie `hint` | nein |
| `context` | mehrere Sätze, Fachbegriff, Beispiel | Popover auf breiter Ansicht, Bottom Sheet auf schmaler Ansicht | sichtbarer Info-Knopf | ja |
| `docs` | längere Anleitung, Tabellen, Verweise | Dokumentationsansicht | sichtbarer Link aus Kontexthilfe oder Werkzeug | ja |

Regeln für den Inhalt:

1. Ein Tooltip umfasst höchstens Überschrift plus ungefähr 140 Zeichen Fließtext. Keine harte
   Abschneidung: Ist der übersetzte Text länger, wird die Information als `context` entworfen.
2. Der zugängliche Name des Triggers bleibt kurz und eindeutig. Ergänzende Erklärung wird über
   `aria-describedby` zugeordnet.
3. Kritische Folgen stehen außerdem sichtbar nahe der Aktion oder in der nachfolgenden
   Bestätigung. Ein Tooltip ist nie die einzige Warnung.
4. Statusmeldungen wie „gespeichert“, Fortschritt und Fehler sind keine Tooltips; dafür bleiben
   Status-/Fehlerkomponenten zuständig.
5. Deaktivierte Knöpfe sind kein geeigneter Tooltip-Trigger, da sie regelmäßig weder Fokus noch
   Ereignisse erhalten. Der Grund steht sichtbar daneben oder hinter einem eigenen Info-Knopf.

## 5. Interaktionsmodell

### 5.1 Maus und hoverfähiger Stift

- `pointerenter` startet eine Öffnungsverzögerung von **350 ms**.
- Verlassen vor Ablauf verwirft den Timer.
- Tooltip bleibt offen, solange der Zeiger über Trigger **oder Tooltip** liegt. Zwischen beiden wird
  ein sicherer Bewegungskorridor verwendet.
- `Escape` schließt sofort. Nach einem `Escape` bleibt dieser Tooltip bis zum tatsächlichen
  Verlassen beziehungsweise neuen Fokus geschlossen; er springt nicht direkt wieder auf.
- Aktivierung des Triggers schließt den Tooltip und führt nur die normale Aktion aus.
- Pointer-Hover wird anhand des tatsächlichen `PointerEvent.pointerType` und ergänzend über
  `(hover: hover)` behandelt, nicht durch „Desktop“-Erkennung. Ein Notebook mit Touch und Maus darf
  beide Modelle nacheinander benutzen.

### 5.2 Tastatur und alternative Aktivierung

- Fokus durch Tastaturnavigation öffnet den Tooltip unmittelbar. Die Fachaktion startet dadurch
  nicht.
- Fokus bleibt auf dem Trigger; der Tooltip selbst erhält keinen Fokus.
- `Escape` schließt den Tooltip, `Tab` bewegt den Fokus normal weiter, `Enter`/Leertaste aktivieren
  den nativen Knopf.
- Ein bloßer Touch-Tap, der Browserfokus setzt, darf nicht zusätzlich den Fokus-Tooltip öffnen.
  Die Komponente unterscheidet daher sichtbaren Tastaturfokus (`:focus-visible`/Eingabemodalität)
  von pointerverursachtem Fokus.
- Screenreader erhalten den Namen des Steuerelements immer. Ergänzende kurze Information ist über
  `aria-describedby` verfügbar, auch wenn die visuelle Blase geschlossen ist.

### 5.3 Kurzer Touch-Tap

- Ein kurzer Tap bleibt ein normaler nativer `click` und führt die Aktion genau einmal aus.
- Es gibt keinen „erster Tap erklärt, zweiter Tap führt aus“-Modus.
- Der Hilfecode ruft die Fachaktion nicht auf `pointerdown` auf und ersetzt nicht pauschal den
  `onClick`-Handler.

### 5.4 Press Preview auf Touch

Nur Aktionsknöpfe, für die ein kurzer Hinweis tatsächlich hilfreich ist, erhalten Press Preview.
Der Ablauf:

1. Primärer Touch-Zeiger wird auf einem aktiven nativen Knopf gedrückt.
2. Ein Timer von **450 ms** startet. Mehrfachberührung, `pointercancel`, Fenster-/Seitenwechsel,
   Scrollbeginn oder mehr als **10 CSS-Pixel** Bewegung vor Ablauf brechen den Timer ab.
3. Nach Ablauf erscheint die kurze Hilfe. Der Knopf erhält zusätzlich einen sichtbaren Zustand
   `data-press-preview="armed"`.
4. Solange der Finger innerhalb des tatsächlichen Trefferrechtecks liegt, ist Loslassen „scharf“.
   Außerhalb wechselt der Zustand sichtbar zu `cancelled`. Rückkehr innerhalb macht ihn wieder
   `armed`.
5. `pointerup` selbst führt die Fachaktion nicht manuell aus. Der unmittelbar folgende native
   `click` wird nur bei `armed` zugelassen. Bei `cancelled` wird genau dieser pointerverursachte
   Klick unterdrückt. So bleiben Form-, Link- und Tastatursemantik erhalten und Doppelausführung
   wird verhindert.
6. `pointercancel`, `lostpointercapture`, `visibilitychange`, Unmount und Routenwechsel räumen Timer,
   Zustand und Blase vollständig auf.

Der Zustand darf nie einen späteren Tastaturklick verschlucken. Die Unterdrückung wird deshalb an
Pointer-ID, Eingabetyp und die unmittelbar folgende Ereignisfolge gebunden, nicht an ein dauerhaftes
„ignore next click“-Flag.

#### Scrollen, Browsergesten und Kontextmenü

- `touch-action: none` ist für normale CommieTools-Knöpfe verboten, weil es Scrollen/Zoomen stören
  kann. Der Browser darf einen Scrollversuch mit `pointercancel` übernehmen.
- `preventDefault()` auf jedem `pointerdown` ist verboten.
- Ein durch denselben Touch-Long-Press erzeugtes Browser-Kontextmenü darf eng begrenzt unterdrückt
  werden, **erst nachdem** CommieTools die Press Preview erkannt hat. Maus-Rechtsklick und die
  Kontextmenü-Taste bleiben unangetastet.
- Da Browser Long-Press nicht vollständig identisch behandeln, ist eine echte Android-/iOS-Prüfung
  Freigabebedingung. Headless-Emulation genügt hier nicht.

### 5.5 Wegziehen und visuelles Feedback

Der Abbruch ist nicht nur farblich erkennbar:

- `armed`: bestehender gedrückter Zustand plus kurze Textzeile „Loslassen: ausführen“ in der Blase.
- `cancelled`: Hervorhebung verschwindet; Blase bleibt sichtbar und zeigt „Abgebrochen“ mit einem
  neutralen Abbruchsymbol.
- Rückkehr auf den Knopf: wieder `armed` und „Loslassen: ausführen“.
- Nach dem Loslassen verschwindet die Blase ohne künstliche Nachlaufzeit.

Die Zusatzzeilen sind Teil der zentralen Sprachpakete. Animation ist höchstens eine 100-ms-
Deckkraftänderung; bei `prefers-reduced-motion: reduce` entfällt sie.

### 5.6 Sicherheitskritische Aktionen

Press Preview ändert niemals die Sicherheitsstufe. Beispiel:

1. Halten auf „Alle Dateien entfernen“ zeigt die Folge.
2. Wegziehen bricht ab.
3. Loslassen über dem Knopf löst den normalen Klick aus.
4. Der normale Klick öffnet weiterhin „Alle 27 Dateien entfernen?“.
5. Erst die gesonderte Bestätigung entfernt die Dateien.

Für irreversible oder besonders folgenreiche Aktionen kann Press Preview deaktiviert bleiben;
der sichtbare Warntext und die Bestätigung sind maßgeblich.

## 6. Tooltip versus Popover/Bottom Sheet

### Tooltip

- `role="tooltip"`, eindeutige ID und Zuordnung vom Trigger über `aria-describedby`.
- Nicht fokussierbar und vollständig ohne Links, Knöpfe oder Eingabefelder.
- Öffnet automatisch durch Hover oder Tastaturfokus, bei Touch zusätzlich als Press Preview.
- Schließt durch `Escape`, Verlust von Fokus/Hover oder Abschluss/Abbruch der Touch-Sequenz.
- Erhält kein `aria-label`, weil dies den eigentlichen Inhalt als zugängliche Beschreibung
  überdecken kann.

### Kontexthilfe

- Wird ausschließlich über einen echten, sichtbaren Knopf geöffnet, beispielsweise
  `<button aria-label="Hilfe zur Komprimierungsstärke">ⓘ</button>`.
- Darf Absätze, Listen, Beispiele, Links und eine Schließen-Schaltfläche enthalten.
- Breite Ansicht: nichtmodales, verankertes Popover mit `role="dialog"`, zugänglichem Titel,
  `Escape`, Light-Dismiss und Fokus-Rückgabe.
- Schmale Ansicht oder zu wenig verfügbarer Raum: modales natives `<dialog>` als Bottom Sheet.
  Fokus wird hinein bewegt, Hintergrund ist inert, `Escape` und sichtbarer Schließen-Knopf sind
  vorhanden; beim Schließen kehrt Fokus zum Info-Knopf zurück.
- Die Auswahl zwischen Popover und Bottom Sheet folgt verfügbarem Platz/Viewport, nicht der
  Behauptung „dies ist ein Mobilgerät“.

Wichtige Information darf zusätzlich sichtbar direkt unter einem Feld stehen. Ein Info-Knopf ist
kein Mittel, um notwendige Labels oder Fehlertexte zu verstecken.

## 7. Visuelles System

### Tooltip / Press Preview

- bevorzugte Position: oberhalb mittig; automatische Ausweichreihenfolge unten, rechts, links;
- Abstand zum Trigger: 8 px; Sicherheitsabstand zum Viewport: 12 px;
- maximale Breite: `min(20rem, calc(100vw - 24px))`;
- Mindestschriftgröße: `0.875rem`, Zeilenhöhe mindestens 1.4;
- Oberfläche: `--color-surface-raised`, Text: `--color-text`, Rand: `--color-border`;
- Schatten aus einem neuen semantischen Overlay-Token, nicht als lokaler Zahlenwert;
- Pfeil ist dekorativ und `aria-hidden`; Hilfe funktioniert auch ohne Pfeil;
- z-index als benannter Overlay-Layer oberhalb Header und Werkzeugmenü, aber unter modalem Dialog;
- Zoom bis 400 %, Textvergrößerung, 320 CSS px Breite und RTL dürfen nichts abschneiden.

### Info-Knopf

- mindestens 44 × 44 CSS px gemäß bestehendem CommieTools-Standard (strenger als WCAG 2.2 AA mit
  grundsätzlich 24 × 24 CSS px);
- verständlicher lokalisierter zugänglicher Name, sichtbarer Fokus und kein reines Farbsignal;
- kein winziges `ⓘ` innerhalb des Aktionsknopfes mit überlappender Klickfläche;
- steht neben dem beschriebenen Label/Steuerelement und verweist auf denselben Hilfetext.

### Bottom Sheet

- oben abgerundete Oberfläche, maximale Höhe `min(80dvh, 42rem)`, interner Scrollbereich;
- sichtbarer Titel und Schließen-Knopf im Kopf;
- Respekt für Safe-Area-Inset am unteren Rand;
- keine erzwungene Wischgeste zum Schließen; Wischen kann später nur als zusätzlicher Zugang folgen.

## 8. Komponenten- und Datenarchitektur

### Vorgesehene Dateien

| Pfad | Verantwortung |
|---|---|
| `packages/ui/src/help/TooltipProvider.tsx` | zentrale Warmup-/Cooldown-Steuerung, jeweils eine offene Kurz- und Kontexthilfe |
| `packages/ui/src/help/Tooltip.tsx` | visuelle/semantische nichtinteraktive Tooltip-Blase |
| `packages/ui/src/help/HintedAction.tsx` | Komposition mit nativem Button und Touch-Zustandsautomat |
| `packages/ui/src/help/ContextHelp.tsx` | Info-Knopf, Popover und Bottom-Sheet-Variante |
| `packages/ui/src/help/usePressPreview.ts` | Pointer-ID, Timer, Geometrie, Abbruch und Click-Gate |
| `packages/ui/src/help/help.css` | Overlay-, Press-, RTL-, Zoom- und Reduced-Motion-Stile |
| `packages/ui/src/help/*.test.tsx` | Komponenten-, Tastatur- und Pointer-Zustandstests |
| `packages/ui/src/index.tsx` | ausschließlich öffentliche Exporte ergänzen |
| `packages/ui/package.json` | geprüfte UI-Abhängigkeit und Testskripte |
| `packages/ui/src/tokens.css` | semantische Overlay-/Warn-/Abbruch-Token für beide Themes |
| `apps/web/src/main.tsx` | globalen `TooltipProvider` einhängen und UI-Stile laden |
| `packages/i18n/src/common/{de,en,es}.ts` | allgemeine Bedienwörter wie Hilfe, Schließen, Abgebrochen |
| jeweiliges `packages/tools/src/**/locales/{de,en,es}.ts` | fachlicher Hilfetext des Werkzeugs |
| `docs/ui-system.md` | verbindliche Regeln nach erfolgreichem Pilot ergänzen |
| `uebergabe/02-architektur/werkzeug-erstellen.md` | Anleitung und Prüfliste für neue Tool-Hilfen ergänzen |

Die Dateinamen sind Zielstruktur für die Umsetzung, keine Behauptung, dass sie bereits existieren.

### Öffentliche Komponenten-API

Die UI-Bibliothek bekommt keine Übersetzungsabhängigkeit. Sie erhält bereits übersetzte Strings:

```tsx
type HintContent = {
  id: string
  text: string
  tone?: 'neutral' | 'warning'
}

<HintedAction hint={hint}>
  <Button type="button" onClick={compress}>PDF komprimieren</Button>
</HintedAction>

<ContextHelp
  label={t('common.helpFor', { subject: t('tool.pdfCompress.quality') })}
  title={t('tool.pdfCompress.qualityHelpTitle')}
>
  <p>{t('tool.pdfCompress.qualityHelp')}</p>
</ContextHelp>
```

Anforderungen an die API:

- genau **ein** semantischer Trigger im DOM; keine verschachtelten Knöpfe;
- Kind muss Ref und Ereignis-Props zuverlässig annehmen; Entwicklungsmodus warnt bei ungeeignetem
  Kind;
- vorhandene `onPointer*`, `onFocus`, `onBlur`, `onKeyDown` und `onClick` werden komponiert, nicht
  überschrieben;
- `disabled`, `aria-describedby`, Formularattribute und React-19-Ref bleiben erhalten;
- stabile IDs über `useId`, aber optional explizite ID für reproduzierbare Tests;
- Portale werden in das jeweilige `ownerDocument` gerendert. Das ist für die bereits vorhandene
  Document-Picture-in-Picture-Funktion zwingend: ausgekoppelte Tools dürfen ihre Hilfe nicht im
  Hauptfenster anzeigen;
- keine Tool- oder Dateidaten gelangen in globale Speicherung.

### Zustandsautomat der Press Preview

```text
idle
  └─ pointerdown(touch, primary) → pending
pending
  ├─ 450 ms ohne Abbruch → armed/open
  └─ move>10px | cancel | scroll | zweite Berührung → idle
armed/open
  ├─ außerhalb → cancelled/open
  ├─ pointerup innen → native click einmal zulassen → idle
  └─ cancel | route | hidden → idle
cancelled/open
  ├─ wieder innerhalb → armed/open
  └─ pointerup außerhalb → zugehörigen click unterdrücken → idle
```

Geometrie wird anhand des aktuellen Trigger-Rechtecks und der Pointerkoordinaten bestimmt. Wegen
impliziter Pointer-Capture bei direkter Touch-Manipulation reicht `event.target` nicht als Aussage,
ob der Finger noch über dem Knopf liegt.

## 9. Open-Source-Vergleich und Entscheidung

Die Architektur verlangt vor einer Eigenentwicklung einen Vergleich geeigneter Open-Source-
Lösungen.

| Kandidat | Stärke | Grenze für CommieTools | Ergebnis |
|---|---|---|---|
| Native Popover-/Dialog-APIs | Top Layer, Escape/Light-Dismiss bzw. Modalität und Fokusgrundlagen; keine Laufzeitabhängigkeit | Popover erst seit 2025 Baseline; Positionierung/Touch-Press-Preview und einheitlicher Fallback bleiben eigene Arbeit | Für Dialog/Popover-Semantik nutzen, nicht allein ausreichend |
| Floating UI React | gepflegte MIT-Primitiven für Position, Flip, Shift, Hover, Fokus, Dismiss, Portale und automatische Aktualisierung | liefert keine fertige CommieTools-Press-Preview und nimmt Inhalts-/ARIA-Entscheidungen nicht ab | **Bevorzugte Basis**, nach Bundle-, Lizenz- und Sicherheitstest |
| Radix Tooltip/Popover/Dialog | fertige MIT-Primitiven, ARIA-orientiert, Provider und Zeitsteuerung | mehrere Primitivpakete und eigenes Touch-Modell weiterhin nötig; mehr fremde Komponentenoberfläche als benötigt | Reserve, falls Pilot mit Floating UI scheitert |
| React Spectrum / React Aria | starke Accessibility-Grundsätze und Contextual-Help-Modell | Spectrum-Tooltip wird auf Touch ausdrücklich nicht angezeigt; Übernahme des ganzen Systems wäre für das kleine bestehende UI unverhältnismäßig | Als Referenz, nicht als Implementierung |
| vollständig selbst positionieren | keine Abhängigkeit | Kollision, Zoom, Scrollcontainer, RTL, Portale und Overlay-Lebenszyklus würden unnötig neu implementiert | abgelehnt |

Vorgesehene Auswahl: **Floating UI als schmale Positionierungs-/Interaktionsbasis**, native
`<button>`-/`<dialog>`-/Popover-Semantik dort, wo sie zuverlässig passt, und nur der
CommieTools-spezifische Press-Preview-Zustandsautomat als eigener Adapter.

Vor Aufnahme der Abhängigkeit sind im tatsächlichen Stand auszuführen:

1. aktuelle Version und Transitiven inventarisieren;
2. MIT-Lizenztext in Registry/Notices übernehmen und `npm run licenses:check` bestehen;
3. Sicherheits-/Wartungszustand prüfen;
4. Produktionsbundle vor/nach Pilot messen; die Budgetüberschreitung ist gemäß Projektregel eine
   Warnung und eine dokumentierte Entscheidung, keine erfundene harte Grenze;
5. Offline-Build ohne CDN und ohne neue Netzwerkzugriffe verifizieren.

## 10. Lokalisierung und Textregeln

- Fachtexte liegen beim jeweiligen Werkzeug; allgemeine Bedienzustände liegen in `packages/i18n`.
- Alle drei vorhandenen Sprachen `de`, `en`, `es` werden im Pilot gleichzeitig ergänzt. Der
  Kataloggenerator darf nicht für Tooltip-Langtexte missbraucht werden, sofern der Text nur auf der
  Werkzeugroute benötigt wird.
- Kein JSX enthält deutsche oder englische Hilfetexte als Literal.
- Platzhalter werden benannt, nicht positionsabhängig; Zahlen und Dateigrößen werden mit den
  vorhandenen Locale-Helfern formatiert.
- Tooltip und Popover übernehmen `lang`/`dir` aus ihrem `ownerDocument`; Pfeil und Ausrichtung
  funktionieren in RTL.
- Textprüfung umfasst Sonderzeichen, Akzente, lange deutsche Wörter, spanische Interpunktion sowie
  mindestens eine künstlich um 30 % verlängerte Pseudolokalisierung.
- Screenreader-Name und sichtbares Label dürfen nicht in verschiedenen Sprachen auseinanderlaufen.

## 11. Einführung in das bestehende Projekt

### Phase A – technischer Prototyp

- zentrale Komponenten nur in `packages/ui`;
- isolierte Beispiele für Maus, Tastatur, Touch, Abbruch, Rückkehr, Kontextdialog und
  ausgekoppeltes Fenster;
- Floating UI gegen native APIs messen und Lizenz-/Bundleprüfung abschließen;
- noch keine breite Änderung aller Werkzeuge.

### Phase B – Pilot an drei repräsentativen Stellen

1. **Reiner Symbolknopf** im Rechner: echter Kurztooltip, zugänglicher Name.
2. **Normale, ungefährliche Aktion** wie eine Vorschau-/Erzeugen-Aktion: Press Preview mit
   Loslassen/Ausführen und Wegziehen/Abbruch.
3. **Komplexe Einstellung** wie Komprimierungsstärke: sichtbarer Info-Knopf und längere
   Kontexthilfe/Bottom Sheet.

Der Pilot muss hell/dunkel, de/en/es, 320/390/768/1360 px, 200/400 % Zoom und das ausgekoppelte
Werkzeugfenster abdecken.

### Phase C – Regeln festschreiben

Erst nach bestandenem Pilot werden `docs/ui-system.md` und
`uebergabe/02-architektur/werkzeug-erstellen.md` verbindlich aktualisiert. Dabei entsteht eine
Inventarliste: Welche vorhandenen Controls brauchen `label`, `hint`, `warning`, `context` oder gar
keine zusätzliche Hilfe?

### Phase D – gestaffelte Ausrollung

- zuerst gemeinsame Shell, Navigation und wiederverwendete PDF-/Rechnerkomponenten;
- anschließend Toolgruppen in kleinen, überprüfbaren Änderungen;
- kein automatisches Bestücken aller Buttons mit Katalogbeschreibungen;
- pro Welle Sprachschlüssel, Screenshot-/Browserbeleg und Abnahmeprotokoll.

## 12. Prüfstrategie

### Automatisierte Komponentenprüfungen

- Hover öffnet nach 350 ms, nicht vorher; Verlassen verwirft Timer.
- Tastaturfokus öffnet sofort; pointerverursachter Fokus auf Touch nicht.
- `Escape` schließt und hält bis zum echten Re-Entry geschlossen.
- Tooltip ist per `aria-describedby` zugeordnet, `role="tooltip"`, nicht fokussierbar und ohne
  interaktive Nachfahren.
- Touch-Tap erzeugt exakt einen Klick.
- Halten + Loslassen innen erzeugt exakt einen Klick.
- Halten + Wegziehen + Loslassen erzeugt keinen Klick.
- Halten + Wegziehen + Zurückziehen + Loslassen erzeugt exakt einen Klick.
- Bewegung vor 450 ms, `pointercancel`, zweite Berührung, Unmount und Routenwechsel erzeugen keinen
  hängenden Timer und keine Aktion.
- Keyboard-`Enter`/Leertaste funktionieren nach einer abgebrochenen Touch-Geste weiterhin.
- vorhandene Consumer-Handler, Formular-Submit und `disabled` werden nicht beschädigt.
- Kontexthilfe setzt/verwaltet Fokus und gibt ihn beim Schließen zurück.
- Mehrere Tooltips: niemals überlagerte Kurzblasen; Timer werden sauber übergeben.
- Fake Timer und `act()` verhindern flackernde/zeitabhängige Tests.

### Statische und automatisierte Accessibility-Prüfung

- `npm run typecheck`, `npm run test`, `npm run a11y:check`, `npm run viewport:check`;
- axe/vergleichbare DOM-Regeln im Komponenten-Pilot;
- Test gegen fehlende Übersetzungsschlüssel in allen registrierten Sprachen;
- Regel: `role="tooltip"` darf keine fokussierbaren Nachfahren enthalten;
- Zielgrößenprüfung bleibt bei 44 px und prüft auch separate Info-Knöpfe.

### Reale Browser- und Geräteprüfung

| Umgebung | Pflichtfälle |
|---|---|
| Chromium/Edge Desktop | Maus, Tastatur, Zoom, Scrollcontainer, hell/dunkel, PiP-Fenster |
| Firefox Desktop | Hover/Fokus, Portalposition, `Escape`, Zoom |
| Safari Desktop | Hover/Fokus, Portal/Top Layer, Zoom |
| Android Chrome echtes Gerät | Tap, Long-Press, Scrollabbruch, Kontextmenü, Wegziehen/Rückkehr, TalkBack |
| iOS Safari echtes Gerät | Tap, Long-Press, Scroll-/Auswahlgesten, Wegziehen/Rückkehr, VoiceOver |
| Touch-Laptop/Hybridgerät | Wechsel zwischen Maus, Touch und Tastatur ohne Reload |

Mindestens NVDA + Firefox/Chromium auf Windows sowie VoiceOver auf iOS werden manuell geprüft.
„Headless bei 390 px“ ist kein Ersatz für Touch-, Screenreader- oder Browsergestenprüfung.

### Qualitäts- und Leistungsprüfung

- kein zusätzlicher Netzwerkzugriff;
- kein Tooltip-Code in schweren Tool-Chunks dupliziert;
- Listener/`autoUpdate` nur bei geöffneter Blase aktiv und beim Schließen bereinigt;
- keine Layoutverschiebung beim Öffnen;
- Start-/Route-Bundle vor und nach Änderung protokollieren;
- 100 wiederholte Öffnen/Schließen-Zyklen ohne wachsende Listener/Timer;
- keine Aktion während Tooltip-Anzeige vor dem Up-Event;
- kein abgeschnittener Inhalt bei Viewportkante, Browserzoom und Bildschirmtastatur.

## 13. Abnahmekriterien

Die Implementierung gilt erst als fertig, wenn alle folgenden Aussagen belegt sind:

- Ein Nutzer kann jede Hauptfunktion ohne Kenntnis von Hover oder Long-Press bedienen.
- Erforderliche Hilfe besitzt einen sichtbaren, mindestens 44 px großen Zugang oder steht direkt im
  Inhalt.
- Tooltip-Inhalt ist nicht interaktiv; interaktive Hilfe verwendet Dialog/Popover.
- Hover-Hilfe ist dismissible, hoverable und persistent gemäß WCAG 1.4.13.
- Aktionen geschehen nicht auf `pointerdown`; Wegziehen vor dem Loslassen bricht zuverlässig ab.
- Tap, Long-Press-Ausführung und Tastaturaktivierung lösen jeweils genau einmal aus.
- Scrollen, Zoom und native Browser-/Assistive-Gesten bleiben nutzbar.
- Fokus, `Escape`, Screenreaderbeschreibung und Fokus-Rückgabe sind nachgewiesen.
- de/en/es, RTL-Vorbereitung, Sonderzeichen und lange Texte sind geprüft.
- Darstellung funktioniert in Haupt- und ausgekoppeltem Dokument.
- Lizenz, Abhängigkeiten, Bundleauswirkung und Offline-Verhalten sind dokumentiert.
- Reale Android-/iOS-Prüfung sowie Desktop Chromium/Firefox/Safari sind protokolliert; fehlende
  Plattformen werden nicht als bestanden behauptet.

## 14. Quellen und verifizierte Aussagen

Alle Quellen wurden am **06.10.2026** abgerufen. Verwendet wurden Norm-/Browser-/Projektquellen und
offizielle Bibliotheksdokumentation, keine Blog-Anleitungen.

1. [W3C APG – Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/): Tooltip auf
   Hover/Fokus, Fokus bleibt am Trigger, `Escape`, `role="tooltip"`, `aria-describedby`; das Muster
   ist ausdrücklich noch „work in progress“ und enthält keine interaktiven Inhalte.
2. [WCAG 2.2 – Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html):
   zusätzliche Hover-/Fokus-Inhalte müssen dismissible, hoverable und persistent sein.
3. [WCAG 2.2 – Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html):
   Up-Event-Aktivierung und Wegziehen vor dem Loslassen ermöglichen Abbruch.
4. [WCAG Technique G212](https://www.w3.org/WAI/WCAG22/Techniques/general/G212): native Controls
   und inputunabhängiges `click` bewahren Up-Event- und Tastatursemantik.
5. [WCAG 2.2 – Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
   grundsätzlich 24 × 24 CSS px oder definierte Abstandsausnahme; CommieTools behält bewusst 44 px.
6. [W3C APG – Accessible Names and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/):
   klare zugängliche Namen und `aria-describedby`, auch zu verborgenem Beschreibungstext.
7. [W3C Pointer Events](https://www.w3.org/TR/pointerevents/): Pointer-Typen, implizite Capture bei
   direkter Manipulation, `pointercancel` und die Rolle von `touch-action`.
8. [MDN – PointerEvent.pointerType](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType):
   laufzeitbezogene Unterscheidung von Maus, Stift und Touch statt Browsererkennung.
9. [MDN – Media Queries / hover und pointer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media):
   Fähigkeitsabfragen für primäre und weitere Eingabegeräte; kein Ersatz für das konkrete Event.
10. [MDN – Tooltip role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role):
    keine interaktiven Inhalte, `aria-describedby`, `Escape`; `title` ist auf Touch/Tastatur keine
    belastbare Lösung.
11. [MDN – Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using): Top
    Layer, Light-Dismiss, Invoker-Beziehung und aktuelle Tooltip-/Popover-Grundlagen.
12. [MDN – dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog):
    native Modalität, Fokusgrundlagen, sichtbarer Schließen-Zugang und `Escape`.
13. [W3C APG – Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):
    Fokusführung, Fokusfalle, `Escape`, Beschriftung und Fokus-Rückgabe.
14. [MDN – prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion):
    Systempräferenz für reduzierte oder entfallende nicht notwendige Animation.
15. [Floating UI – React](https://floating-ui.com/docs/react),
    [Hover](https://floating-ui.com/docs/usehover),
    [Auto Update](https://floating-ui.com/docs/autoupdate) und
    [Tutorial](https://floating-ui.com/docs/tutorial): Positionierungs-/Interaktionsprimitiven,
    hoverbarer Übergang, Aufräumen und `offset`/`flip`/`shift`.
16. [Floating UI – MIT-Lizenz](https://github.com/floating-ui/floating-ui/blob/master/LICENSE):
    grundsätzlich AGPL-kompatible permissive Lizenz; konkrete Paketversion/Notices werden erst bei
    Aufnahme in den Lockstand freigegeben.
17. [Radix – Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip): alternative
    MIT-Primitiven mit zentraler Verzögerung und Hover-/Fokusverhalten.
18. [React Spectrum – Tooltip](https://react-spectrum.adobe.com/Tooltip): offizielle Empfehlung,
    Tooltips auf Touch nicht zu zeigen und notwendige Information über Popover/Contextual Help
    zugänglich zu machen.

## 15. Schlussfolgerung

Das Vorkonzept ist tragfähig, wenn CommieTools drei Dinge sauber trennt:

1. **Tooltip** ist kurze, nichtinteraktive Zusatzinformation für Hover und Tastaturfokus.
2. **Press Preview** ist eine zusätzliche Touch-Vorschau auf einem Aktionsknopf; Loslassen führt
   über den nativen Klick aus, Wegziehen bricht ab.
3. **Kontexthilfe** hat einen sichtbaren Info-Knopf und wird als zugängliches Popover oder Bottom
   Sheet geöffnet.

So bleibt die Oberfläche schnell und reduziert, ohne Hilfe in einer unbekannten Geste zu verstecken.
Die Lösung passt zur vorhandenen UI-Baseline, lässt sich zentral auf viele Werkzeuge skalieren und
bewahrt die normalen Browser-, Formular- und Accessibility-Verträge.
