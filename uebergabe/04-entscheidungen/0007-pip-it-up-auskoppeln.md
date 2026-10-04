# ADR 0007: pip-it-up für das Auskoppeln von Werkzeugen

**Status:** angenommen
**Datum:** 2026-10-04

## Kontext

Ein Werkzeug soll sich in ein eigenes, schwebendes Fenster auskoppeln lassen, das auf Wunsch ständig
im Vordergrund liegt. Nach ADR 0001 haben Open-Source-Lösungen vor Eigenentwicklung Vorrang; eine
Eigenlösung ist nur zulässig, wenn kein Kandidat die Muss-Kriterien erfüllt.

Der Weg zu einem schwebenden Fenster ist im Web eindeutig festgelegt: nur die Document
Picture-in-Picture-Schnittstelle (Chromium 116+, Firefox 151+ seit Mai 2026) kann einen Vordergrund
herstellen. `window.open` kann es nicht, und die WebExtensions-Schnittstelle `chrome.windows.create`
kennt in Manifest V3 kein `alwaysOnTop`.

Die Machbarkeitsmessung (M0, `05-uebergaben/2026-10-04-desktop-auskoppeln-m0.md`) hat eine
Eigenschaft freigelegt, die die Entscheidung trägt: **Der Rückweg ist nicht automatisch.** Nach dem
Schließen des Fensters ist der ausgekoppelte Inhalt verloren; ein zweites Auskoppeln liefert ein
leeres Fenster. Zusammen mit der Stilübertragung in das zweite Dokument, der Tastaturweiterleitung,
der Rückkehr von Scrollposition und Fokus sowie dem Platzhalter im Hauptfenster entsteht daraus eine
Reihe von Aufgaben, die eine Bibliothek bereits löst.

## Geprüfte Kandidaten

| Kandidat | Befund | Urteil |
|---|---|---|
| `@pip-it-up/core` 0.2.0 | **MIT** (Lizenzdatei im Paket gelesen), keine Laufzeit-Abhängigkeiten, 34,1 kB roh / 8,0 kB gzip, letzter Push 2026-10-03, veröffentlicht mit SLSA-Provenienz über GitHub Actions, Unterstützungsprüfung als echte Merkmalserkennung (kein User-Agent-Test) | **geeignet** |
| `@pip-it-up/react` 0.2.0 | MIT, hängt an `@pip-it-up/core` und `react >= 18` als Peer, 52,8 kB / 12,5 kB gzip; 0.1.x seit Mai 2026 | geeignet |
| `pip-it-up` 1.0.0 | **Stub mit 273 Bytes** („Use @pip-it-up/react instead"); trägt die höchste Versionsnummer und ist damit eine Verwechslungsfalle | unbrauchbar |
| Eigenentwicklung | müsste Stilübertragung, Tastaturweiterleitung, Scroll- und Fokusrückkehr, Platzhalter und Rückfall selbst lösen — Funktionen, die kein Kandidat verfehlt | **nach ADR 0001 nicht zulässig** |

Die Lizenz `MIT` steht in der Prüfordnung des Projekts (`licenses/policy.json`) ausdrücklich unter
`allowedExpressions`. Die Typen der Bibliothek enthalten keine `node`-Referenz und kein `Buffer`;
TypeScript 5.9.3 kennt `documentPictureInPicture` in `lib.dom.d.ts` nicht, die Typverbreiterung der
Bibliothek schließt diese Lücke also, statt zu kollidieren.

## Entscheidung

`@pip-it-up/core` (und, wenn React-Bindungen gebraucht werden, `@pip-it-up/react`) wird als
Abhängigkeit aufgenommen. Der Auskoppel-Mechanismus wird nicht nachgebaut.

Eigene Teile bleiben: die Oberfläche und die Auskoppel-Steuerung, die Wunschgröße je Werkzeug im
Manifest, die sichtbaren Texte über die Sprachkataloge, der Fehlerfall, die Tests und die Abnahme.

## Folgen

- Die Aufnahme erfolgt erst nach `npm run licenses:generate` und `licenses:check`; sonst scheitert
  die Prüfung mit „stale".
- Die Bündelgröße wird vor der Freigabe im Startbudget gemessen (`bundle:check`), nicht geschätzt.
- **Vorbehalte, die dokumentiert bleiben:** Version 0.2.0 ist als „public beta" bezeichnet und die
  API ist nicht eingefroren; das Projekt hat einen Einzelentwickler (53 Sterne, rund 250 Abrufe im
  Monat). Rückversicherung ist die MIT-Lizenz — ein Fork und eigene Pflege bleiben jederzeit möglich.
  Wird die Bibliothek aufgegeben, ist das ein eigener ADR, der diesen ersetzt.
- **Die Fenstergröße ist keine zugesicherte Eigenschaft.** Gemessen: Edge 154 ignoriert
  `width`/`height` und übernimmt die Größe des aufrufenden Fensters. Die Spezifikation erlaubt das
  ausdrücklich; das WICG führt es als offenes Problem (#120). Das Abnahmekriterium in
  `03-konzepte/2026-10-04-desktop-auskoppeln.md` verlangt deshalb keine exakte Größe.
- Eine Gegenprobe in Chrome und Firefox steht aus und ist in der Übergabe als offener Punkt geführt.
