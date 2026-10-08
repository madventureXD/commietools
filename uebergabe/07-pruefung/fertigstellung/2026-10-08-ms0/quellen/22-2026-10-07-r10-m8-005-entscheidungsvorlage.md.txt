# R10 · Karte M8-005 — Entscheidungsvorlage: Infrastruktur-Fehlerberichte (NEL)

Datum: 2026-10-07 · Stufe: R10 (Infrastruktur-Datenfluss, **Betreiberentscheidung**) ·
Karte: **M8-005** „Infrastruktur-Fehlerberichte fehlen im dokumentierten Datenfluss"

**Diese Vorlage entscheidet nicht.** Sie legt den gemessenen Stand und die Folgen der zwei Wege vor.
Die Umsetzung ist eine **autorisierte Hostingaktion** im Provider-Konto und liegt bei Thomas.

## 1. Auftrag im Wortlaut (Auszug aus `QM/70-reparaturempfehlungen/R10.md`)

> **Dauerhafte Lösung:** Betreiberentscheidung vorbereiten: Infrastruktur-NEL bewusst behalten und
> Datenfluss transparent dokumentieren **oder** über Cloudflare-Zoneneinstellung deaktivieren.
> Empfehlung bei konsequent datenarmem Betrieb: unbenötigte Fehlertelemetrie abschalten, sofern kein
> betriebliches Erfordernis besteht. Umsetzung ist autorisierte Hostingaktion, nicht bloß
> `_headers`-Edit; Provider kann Header hinzufügen. Dokumentverarbeitung, Ressourcenabrufe und
> Infrastrukturberichte sauber unterscheiden. Bereits gecachte Richtlinien und deren `max_age` beim
> Übergang berücksichtigen. **Abnahme:** Öffentliche Antwortheader mit Zeit/Deploymentrevision frisch
> erfassen … autorisierte harmlose Fehlerprobe nur auf eigener Testumgebung. Bei Beibehaltung
> dokumentierte Felder/Zweck/Empfänger prüfen. **Nicht tun:** keine Kontoänderung durch diesen
> Bericht, keine PDF-Upload-/Rechtsverletzungsbehauptung aus NEL-Header allein.

## 2. Bestandsaufnahme (gemessen am 2026-10-07, 18:34:54 UTC)

Messung: `curl -D -` gegen `https://commietools.org/` und `/sw.js`; vollständige Ausgabe in
`06-protokolle/2026-10-07-r10-oeffentliche-header.txt`.

| Gegenstand | Messwert |
|---|---|
| `Nel` | `{"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}` |
| `Report-To` | Gruppe `cf-nel`, `max_age 604800`, Endpunkt `https://a.nel.cloudflare.com/report/v4?s=…` |
| Absender | `Server: cloudflare` — die Kopfzeile setzt der **Anbieter**, sie steht **nicht** in `apps/web/public/_headers` |
| Beobachtungsumfang | `success_fraction: 0.0` → nur **Fehlschläge**, keine Stichprobe erfolgreicher Anfragen |
| Gültigkeitsdauer | `max_age 604800` = **7 Tage** (so lange gilt eine bereits ausgelieferte Richtlinie weiter) |
| Anwendungsseitige Telemetrie | **keine**: kein Analyse-, Werbe- oder Telemetriemodul im Programm; `docs/architecture.md` sagt das ausdrücklich zu |
| Dokumentation | `docs/architecture.md`, Abschnitt „Security and privacy defaults", nennt CSP und Bereitstellungs-Header — **Infrastrukturberichte kommen darin nicht vor** (genau der Befund der Karte) |
| Revisionsangabe | kein eigener Revisions-Header in der Antwort; als Kennzeichen erfasst: `Date`, `CF-RAY: a46f00a8cac13c43-DUS`, Zeitstempel |

**Wichtige Einschränkung der Messung:** die lebende Seite ist der zuletzt **veröffentlichte** Stand
(`origin/main`). Der Arbeitsbaum ist 144 Commits weiter und **nicht** veröffentlicht. Die gemessene
Kopfzeile beschreibt also den Betrieb, nicht den Entwicklungsstand; sie ist für die Entscheidung
maßgeblich, weil sie den Betrieb betrifft.

**Sichtbarer Unterschied, ebenfalls gemessen:** die lebende CSP des Dokuments lautet
`script-src 'self'`, während `apps/web/public/_headers` `'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net`
führt. Der Unterschied erklärt sich aus dem veröffentlichten Stand (der Arbeitsbaum ist weiter) — er
ist **kein** Widerspruch in der Datei und keine Nebenwirkung dieser Karte. Als Fund notiert, nicht
behoben.

**Was ich bewusst unterlassen habe:** die in der Abnahme genannte „autorisierte harmlose Fehlerprobe"
habe ich **nicht** gefahren — sie gehört laut Karte auf eine eigene Testumgebung, und eine
Fehlererzeugung gegen `commietools.org` wäre eine Einwirkung auf den Betrieb. Ein Versandnachweis
liegt damit **nicht** vor; er ist auch nicht Voraussetzung der Entscheidung, weil die Richtlinie
selbst gemessen ist.

## 3. Die zwei Wege

### Weg A — behalten und den Datenfluss transparent dokumentieren

Zu tun: `docs/architecture.md` (Abschnitt „Security and privacy defaults" bzw. ein eigener Absatz
„Infrastrukturberichte") und `docs/deployment-cloudflare-pages.md` um den gemessenen Sachverhalt
ergänzen: Absender ist der Anbieter, Zweck ist Fehlerbeobachtung der Zustellung, Empfänger ist
Cloudflare unter `a.nel.cloudflare.com`, Umfang sind **nur Fehlschläge** (`success_fraction: 0.0`),
Gültigkeit 7 Tage, und die Anwendung selbst sendet nichts. Zusätzlich die Abgrenzung
**Dokumentverarbeitung / Ressourcenabrufe / Infrastrukturberichte** ausdrücklich benennen.

- Vorteil: schließt den Kartenbefund (fehlende Dokumentation) ohne Eingriff in den Betrieb; keine
  Kontoaktion nötig; die Zusage „keine Telemetrie" wird nicht stillschweigend relativiert, sondern
  eingeordnet (Hosting-Infrastruktur ≠ Anwendungstelemetrie).
- Nachteil: die Kopfzeile bleibt aktiv; die dokumentierte Zusage muss sprachlich sauber gefasst sein.
- Aufwand: 1 Dokumentänderung + 1 Commit, ≈ 20 Minuten, kein Risiko für den Betrieb.

### Weg B — über die Cloudflare-Zoneneinstellung abschalten

Zu tun: im Cloudflare-Konto der Zone `commietools.org` die Network-Error-Logging-Einstellung
abschalten (autorisierte Hostingaktion, **kann nur Thomas**; ich habe keinen Kontozugang und soll
laut Karte keine Kontoänderung vornehmen). Danach erneut messen und dokumentieren, dass keine
`Nel`/`Report-To`-Kopfzeile mehr ausgeliefert wird.

- Vorteil: passt zur konsequent datenarmen Linie; die Zusage „keine Telemetrie" gilt dann auch für
  die Infrastruktur.
- Nachteil: die Fehlerbeobachtung der Zustellung entfällt; bereits ausgelieferte Richtlinien gelten
  bis zu **7 Tage** weiter (die Abschaltung wirkt nicht sofort für Bestandsbrowser); die Umsetzung
  liegt außerhalb meiner Reichweite.
- Aufwand: Kontoaktion durch Thomas (Minuten) + Nachmessung und Dokumentation durch mich (≈ 20 Minuten).

### Weg C — vertagen

Nichts ändern. Der Punkt bleibt offen; die Lücke in der Dokumentation bleibt bestehen, und die
Abschlusskontrolle führt ihn als offene Betreiberentscheidung.

## 4. Empfehlung

**Weg A.** Begründung: der Kartenbefund ist eine **Dokumentationslücke**, nicht ein beobachteter
Datenabfluss der Anwendung — die Anwendung sendet nachweislich nichts, und die Berichte betreffen
ausschließlich **Fehlschläge** der Zustellung (`success_fraction: 0.0`). Weg A schließt die Lücke
vollständig, kostet keine Betriebsänderung und macht die Ausnahme sichtbar statt still. Weg B bleibt
sachlich vertretbar, wenn du die datenarme Linie auch für die Infrastruktur gelten lassen willst —
dann gehört die Abschaltung in dein Konto, und ich messe und dokumentiere danach.

**In beiden Fällen gleich:** die Abgrenzung Dokumentverarbeitung / Ressourcenabrufe /
Infrastrukturberichte gehört in die Dokumentation — sie fehlt heute unabhängig von der Entscheidung.

## 5. Was nach der Entscheidung zu tun war

- **A:** Dokumentation ergänzen (gemessene Werte, Zweck, Empfänger, Umfang, Dauer), Prüfkette
  (`check`/`build`/`akte:check`), Protokoll, Commits, Kartenstand nachziehen.
- **B:** auf die Rückmeldung „abgeschaltet" warten, dann **neu messen** (Kopfzeile weg?), den
  Nachweis ablegen und die Dokumentation auf den neuen Stand setzen.
- **C:** Punkt offen lassen, Kartenstand auf „Entscheidung offen", nichts ändern.

## 6. Entscheidung und Umsetzung

*Entschieden am 2026-10-07 von Thomas: **Weg A** — behalten und den Datenfluss transparent
dokumentieren.*

Umgesetzt (zwei Dokumentänderungen, ergänzt statt umgeschrieben):

- `docs/architecture.md`, Abschnitt „Security and privacy defaults" → **neu**: Unterabschnitt
  „Infrastructure error reports (Network Error Logging)" mit den gemessenen Werten, der
  Unterscheidung **Dokumentverarbeitung / Ressourcenabrufe / Infrastrukturberichte** und dem Hinweis,
  dass Behalten, Ändern oder Abschalten eine Hostingaktion ist.
- `docs/deployment-cloudflare-pages.md` → **neu**: Abschnitt „Infrastrukturberichte des Anbieters
  (Network Error Logging)" mit Messwerten, Nachprüf-Befehl (`curl … | grep -i '^nel\|^report-to'`)
  und dem Hinweis auf `max_age` (7 Tage — eine Änderung ist nie sofort wirksam).

Der Kartenbefund ist damit geschlossen: die Infrastrukturberichte stehen im dokumentierten
Datenfluss, ohne dass sich am Betrieb etwas ändert. Keine Kontoaktion, kein Push, keine
Veröffentlichung.

**Was weiterhin nicht vorliegt:** ein Versandnachweis (die harmlose Fehlerprobe gegen den Betrieb
wurde bewusst nicht gefahren). Die Richtlinie selbst ist gemessen — für die Dokumentation ist das
der tragende Beleg.
