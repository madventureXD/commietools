# Übergabe: Desktop-Auskoppeln — M0 Machbarkeit und Bestandsaufnahme

**Datum:** 2026-10-04
**Bearbeitet durch:** Faber (Hermes Agent, Team 2)
**Auftrag:** M0 des Vorhabens „Desktop-Erfahrung: Werkzeuge auskoppeln" — Bestandsaufnahme und
Machbarkeitsnachweis (Go von Thomas am 2026-10-04).
**Status:** teilweise (Abnahmekriterium erfüllt mit einer ausdrücklich benannten Einschränkung)

## Ziel der Sitzung

Vor jeder Konzeption klären, worauf gebaut wird: Ist-Stand der Werkzeugseiten, tatsächliche
Fähigkeit der Browser-Schnittstelle, Abnehmbarkeit mit dem vorhandenen Prüfwerkzeug — und ob die
Anforderung „eigenes Fenster, perfekt auf die gebrauchte Größe zugeschnitten, auf Wunsch ständig im
Vordergrund" technisch trägt.

## Ergebnis

**Die Machbarkeit ist belegt.** Document Picture-in-Picture öffnet im Edge (154.0.4258.53) ein
echtes zweites, schwebendes Fenster; der ausgekoppelte Inhalt wird **bewegt, nicht kopiert**, und
Stile lassen sich übernehmen. Das größte Risiko — ob das Merkmal mit dem vorhandenen Prüfwerkzeug
überhaupt abgenommen werden kann — ist ausgeräumt: der kopflose Browser kennt die Schnittstelle und
ein über das DevTools-Protokoll ausgelöster **echter Mausklick** genügt als Nutzergeste.

**Der Ist-Stand des Projekts:**

- `main` bei `1c74d29`, Arbeitsbaum sauber.
- **41 Werkzeuge**: PDF 23, Rechner 9, Bild 5, Text 2, Entwickler 1, Generator 1.
- `apps/web/src/App.tsx` (188 Zeilen) führt `ToolPage` als Ternary-Kette über `tool.id`; ein Teil der
  Werkzeugkomponenten liegt direkt in dieser Datei, der Rest in `apps/web/src/tools/`.
- **Jeder Werkzeugzustand liegt lokal in seiner Komponente; es gibt keinen gemeinsamen Store.**
- Schwere Werkzeuge (PDF, Rechner) hängen bereits hinter `Suspense` und werden nachgeladen.
- `apps/web/src/styles.css` (420 Zeilen) trägt die gemeinsamen Klassen (`settings-card`, `stack`,
  `field`, `form-grid`, `privacy-note` …).

**Zwei Befunde, die den weiteren Plan bestimmen:**

1. **Die Fenstergröße folgt nicht der Anforderung, sondern dem öffnenden Fenster.** Gemessen in drei
   Modi, jeweils mit frisch geladenem Dokument, angefordert immer 800×600:

   | Aufbau | Hauptfenster innen | PiP-Fenster innen |
   |---|---|---|
   | echtes Fenster, ohne App-Modus | 584×458 | **584×458** |
   | App-Modus (`--app=`, Standalone-Fall) | 584×446 | **584×446** |
   | App-Modus, früherer Lauf | 1344×858 | **1344×858** |
   | kopfloser Modus | 1344×858 | 640×446 |

   `preferInitialWindowPlacement: true` änderte daran nichts. In den kopflosen Läufen kam zusätzlich
   keine stabile Größe zustande (320×240 exakt, 800×600 → 400×300, 1600×1000 → 438×273,
   3000×2400 → 387×309). **Damit ist die Anforderung „perfekt zugeschnitten" in dieser Browserfassung
   nicht erfüllt** — sie ist der wichtigste Gegenstand von M1.
2. **Der Rückweg ist nicht automatisch.** Nach dem Schließen des PiP-Fensters ist der ausgekoppelte
   Inhalt verloren (`shellZurueck: false`); ein zweites Auskoppeln liefert ein leeres Fenster. Wer
   nicht bei `pagehide` zurückhängt, zerstört den Werkzeuginhalt beim ersten Auskoppeln. Genau diese
   Arbeit leistet die geprüfte Bibliothek (`mode: 'move'`, `reserveSpace`, `restoreScroll`,
   `restoreFocus`) — der Grund, sie der Eigenlösung vorzuziehen.

**Belegte Einzelheiten:** `width`/`height` nur paarweise (`RangeError`); das PiP-Fenster ist ein
eigenes CDP-Ziel (`page:about:blank`) und damit objektiv nachweisbar; ein Overlay-Fenster ist nicht
auf der Seite, sondern ein Fenster des Browsers; ein Stylesheet ließ sich kopieren, die CSS-Variable
`--brand` kam als `#c91f2c` an.

**Geprüfte Bibliothek (Papierprüfung, nicht aufgenommen):** `@pip-it-up/core` 0.2.0 und
`@pip-it-up/react` 0.2.0, **MIT** (Lizenzdatei im Paket gelesen), ohne Laufzeit-Abhängigkeiten im
Kern, Kern 34,1 kB roh / **8,0 kB gzip**, React-Bindung 52,8 kB / 12,5 kB gzip, letzter Push
2026-10-03, SLSA-Provenienz, echte Feature-Erkennung (kein User-Agent-Test). Der Name `pip-it-up`
selbst ist ein **Stub mit 273 Bytes** und trägt irreführend Version 1.0.0 — nicht verwenden.

## Geänderte Bereiche

- `uebergabe/05-uebergaben/2026-10-04-desktop-auskoppeln-m0.md` — diese Übergabe.
- `uebergabe/01-stand/offene-punkte.md` — neuer Punkt zum Vorhaben.
- **Keine Datei in `apps/`, `packages/` oder `docs/` geändert.** Der Messaufbau lag außerhalb des
  Projekts (`%LOCALAPPDATA%\Temp\piptest\`) und ist Wegwerf.

## Entscheidungen und Annahmen

- **Document Picture-in-Picture ist der einzige Web-Weg zu „ständig im Vordergrund"** — belegt über
  W3C/WICG-Spezifikation, MDN und Chrome-Dokumentation. `window.open` kann es nicht; die
  WebExtensions-Schnittstelle `chrome.windows.create` hat kein `alwaysOnTop` (Manifest V3).
  Verfügbarkeit: Chromium 116+, Firefox 151+ (Mai 2026), **Safari nicht**, mobil nicht.
- **Annahme (gekennzeichnet):** Die zuletzt gemessene Größenkopplung wurde in dieser Browserfassung
  (Edge 154) und mit `--window-size` gestarteten Fenstern gemessen. Nicht geprüft ist, ob ein vom
  Nutzer nachträglich verändertes Fenster dieselbe Wirkung zeigt. Das ist eine offene Gegenprobe,
  keine Feststellung.
- **Vorläufig, in M1 zu entscheiden:** Aufnahme der Bibliothek; Ersetzen statt Spiegeln beim
  Auskoppeln; Verhalten für Safari; Herkunft der Wunschgröße je Werkzeug.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | **nicht ausgeführt** — keine Änderung an Quelltext, Manifesten, Sprachkatalogen oder Symbolen |
| `npm run build` | **nicht ausgeführt** — derselbe Grund |
| `git status` | sauber vor der Sitzung (`main` bei `1c74d29`) |
| Machbarkeit im kopflosen Edge | API vorhanden `true`, sicherer Kontext `true`, Fenster geöffnet, eigenes CDP-Ziel |
| Nutzergeste | echter Mausklick löst aus; `Runtime.evaluate(…, userGesture: true)` ebenfalls |
| Stilübernahme ins zweite Dokument | 1 Stylesheet kopiert, 0 Fehler, CSS-Variable kommt an |
| `width` ohne `height` | `RangeError` (normgemäß) |
| Größenmessung, 4 Werte, kopflos | 320×240 exakt; darüber geklemmt und nicht monoton |
| Größenmessung, echtes Fenster und App-Modus | **Anforderung wird ignoriert; Fenstergröße des Aufrufers übernommen** |
| Rückkehr nach Schließen | Inhalt verloren, wenn nicht bei `pagehide` zurückgehängt |

Ein Wegwerf-Messaufbau kann ein Ergebnis falsch aussehen lassen: Die erste Fassung des Messskripts
scheiterte an der Serialisierung des Window-Objekts („Object reference chain is too long") und
meldete Größen als Aufruffehler. Die Zahlen oben stammen aus der korrigierten Fassung, bei der vor
jeder Messung das Dokument frisch geladen wird.

## Offene Punkte und Risiken

- [ ] **Die Größenanforderung wird in Edge 154 ignoriert** (Fenstergröße des Aufrufers gewinnt).
      Gegenprobe offen: Verhalten nach nachträglicher Fenstergrößenänderung; Verhalten in Chrome und
      Firefox. Solange das gilt, ist „perfekt zugeschnitten" nicht zugesagt.
- [ ] **Die Größe ist im kopflosen Browser nicht abnehmbar.** Für diesen Nachweis braucht es ein
      echtes Fenster; das ist ein zusätzlicher Schritt in jeder Abnahme.
- [ ] **Die Bibliothek ist „public beta" (0.2.0, September 2026), Bus-Faktor 1** (53 Sterne, rund 250
      Abrufe im Monat). Rückversicherung ist die MIT-Lizenz; ein Fork bleibt möglich.
- [ ] **Safari erhält keinen Vordergrund.** Position von WebKit ist offen und ohne Beschluss; eine
      Implementierung ist nicht absehbar.
- [ ] **Hell/Dunkel-Nachführung der Stile im zweiten Dokument** ist noch nicht geprüft; die
      Messung zeigt nur die einmalige Übernahme.
- [ ] **Der Zustand liegt je Werkzeug lokal**, es gibt keinen gemeinsamen Store. Für 41 Werkzeuge
      heißt das: jeder Werkzeugtyp braucht eine eigene Entscheidung, ob und wie er sich auskoppeln
      lässt.

## Empfohlener nächster Schritt

1. **M1 — Konzept und Entscheidungen** (beauftragt): Abnahmekriterium mit Zielbreiten und Seitenliste
   festlegen; die vier Produktentscheidungen herbeiführen (Reichweite, Ersetzen oder Spiegeln,
   Verhalten ohne PiP, Aufnahme der Bibliothek); Herkunft der Wunschgröße je Werkzeug klären.
   Ergebnis ist ein Konzept unter `uebergabe/03-konzepte/` und ein ADR für die Abhängigkeit.
2. Vor dem Ausrollen: Gegenprobe zur Größekopplung in Chrome und Firefox.

## Git

- Commit: `789faef` — „docs(desktop): record the M0 feasibility finding for detachable tool
  windows" (diese Übergabe und `offene-punkte.md`). Das Konzept zu M1 liegt in
  `03-konzepte/2026-10-04-desktop-auskoppeln.md`.
- Arbeitsbaum: nach dem Commit sauber; **nicht gepusht** — ein Push auf `main` löst das
  Cloudflare-Pages-Deployment aus und erfolgt nur auf ausdrücklichen Auftrag.
