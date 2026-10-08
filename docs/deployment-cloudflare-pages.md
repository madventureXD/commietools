# Deployment auf Cloudflare Pages mit Hetzner-Domain

## Zielbild

- Hetzner bleibt Registrar für `commietools.org`.
- Cloudflare übernimmt DNS, TLS, CDN und das statische Pages-Hosting.
- Es werden keine Nutzerdokumente hochgeladen oder serverseitig verarbeitet.
- Ein eigener Cloud-Server ist für den aktuellen Local-First-Stand nicht erforderlich.

## Voraussetzungen

1. Das Git-Repository ist bei einem von Cloudflare Pages unterstützten Anbieter erreichbar.
2. Ein Cloudflare-Konto existiert.
3. Zugriff auf die Hetzner-Domainverwaltung ist vorhanden.

## Pages-Projekt

Das Projekt wird aus dem Repository mit diesen Einstellungen angelegt:

| Einstellung | Wert |
|---|---|
| Framework | Vite |
| Produktionsbranch | `main` |
| Build-Befehl | `npm run build` |
| Ausgabeverzeichnis | `apps/web/dist` |
| Root-Verzeichnis | Repository-Wurzel |
| Node-Version | `22` |

Der Build führt Lizenz-, Katalog- und TypeScript-Prüfungen aus. Ein fehlgeschlagener Check darf nicht veröffentlicht werden.

## Domain bei Hetzner, DNS bei Cloudflare

1. In Cloudflare `commietools.org` als Website hinzufügen.
2. Vorhandene DNS-Einträge kontrollieren, insbesondere Einträge für E-Mail. MX-, SPF-, DKIM- und DMARC-Einträge dürfen nicht verloren gehen.
3. Die beiden von Cloudflare genannten autoritativen Nameserver notieren.
4. In der Hetzner-Domainverwaltung ausschließlich die Nameserver auf diese beiden Werte umstellen.
5. In Cloudflare Pages zuerst `commietools.org`, danach `www.commietools.org` als benutzerdefinierte Domains hinzufügen.
6. Eine der Varianten als kanonisch festlegen und die andere dauerhaft weiterleiten.

Die Nameserver sind kontospezifisch und dürfen nicht geraten oder aus einer fremden Anleitung übernommen werden.

## Mitgelieferte Hosting-Regeln

- `apps/web/public/_redirects` liefert unbekannte Pfade über `index.html`, damit direkte Tool-URLs funktionieren.
- `apps/web/public/_headers` setzt CSP, Clickjacking-, MIME- und Berechtigungsregeln.
- Gehashte Build-Assets werden ein Jahr unveränderlich gecacht.
- Service Worker, Manifest und HTML werden immer auf Aktualität geprüft.
- Benutzerdateien werden nicht in einen Servercache geschrieben.

## Prüfung nach der Veröffentlichung

- Startseite sowie eine direkte URL wie `/tools/pdf-merge` öffnen.
- Deutsch/Englisch, Light/Dark Mode und Installation als PWA prüfen.
- DevTools offline schalten und bereits geladene Werkzeuge erneut öffnen.
- Antwortheader von HTML, `sw.js`, einem Asset und einer PDF-Engine kontrollieren.
- `commietools.org` und `www.commietools.org` auf gültiges TLS und die gewünschte Weiterleitung prüfen.
- DNS-Einträge für vorhandene E-Mail-Dienste prüfen.

## Infrastrukturberichte des Anbieters (Network Error Logging)

Cloudflare hängt **jeder** Antwort der Zone `commietools.org` eine NEL-Richtlinie an. Sie steht
**nicht** in `apps/web/public/_headers` und wird nicht von der Anwendung gesetzt. Am ausgelieferten
Stand gemessen (2026-10-07 18:34 UTC):

```
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=…"}]}
```

- **Berichtet werden nur Fehlschläge** (`success_fraction: 0.0`); erfolgreiche Anfragen werden nicht
  stichprobenartig erfasst.
- Empfänger ist Cloudflare (`a.nel.cloudflare.com`) als Betreiber der Zustellung.
- `max_age: 604800` gilt **sieben Tage**: eine bereits an einen Browser ausgelieferte Richtlinie
  wirkt so lange weiter. Eine Änderung ist deshalb nie sofort wirksam — nach einer Umstellung
  frühestens nach dieser Frist erneut messen.

**Nachprüfen** (jederzeit, ohne Konto):

```bash
curl -sS -D - -o /dev/null https://commietools.org/ | grep -i "^nel\|^report-to"
```

**Abschalten** wäre eine Zone-Einstellung im Cloudflare-Konto (Network Error Logging), nicht eine
Änderung an diesem Repository. Die Entscheidung dazu ist im Sanierungsleitfaden festgehalten
(Karte M8-005): die Richtlinie bleibt bewusst aktiv, weil die Anwendung selbst nichts sendet und nur
Fehlschläge berichtet werden — der Datenfluss steht dafür in `architecture.md`.

## Spätere Erweiterung

Ein Hetzner-Cloud-Server wird erst ergänzt, wenn Konten, Synchronisierung, Datenbank oder andere serverseitige Funktionen tatsächlich benötigt werden. Große Modelle über dem Pages-Einzeldateilimit werden separat und versioniert gespeichert.

## Nachtrag 2026-10-08 — wirklicher Prüfweg und NEL-Beobachtung

Die vorhandene Git-Integration veröffentlicht Audit-Zweige als öffentliche Vorschau bereits
vor Abschluss aller GitHub-Pflichtjobs. "Deploy successful" ist deshalb kein Freigabeurteil.
`main` verlangt jetzt tatsächlich `Releasepflicht`, auch für Administratoren; ein roter oder
übersprungener Pflichtjob hält dieses Aggregat rot. Vorschauen bleiben Testlieferungen.

Für Weg A wurden auf eigener unveränderlicher Audit-Vorschau aktuelle Header mit Revision/Zeit
erfasst, ein frisches und danach bereits benutztes Testprofil unterschieden und eine harmlose
offline geschaltete `build.json`-Anfrage ausgeführt. Innerhalb der protokollierten Beobachtungszeit
war kein Reporting-API-Ereignis/Versand sichtbar. Das ist weder ein Versandnachweis noch ein
Beleg für deaktiviertes NEL. `max_age` bleibt 604800; keine Umstellung auf Weg B und damit kein
erfundener Lösch-/Ablaufnachweis. Der ursprüngliche Vertrag fordert Beobachtung "soweit prüfbar",
keinen Zugang zu internen Empfängerablagen. Belege: `nel-preview.json`, `github-delivery.json`
und `github-artifact.json` im Abschluss-Belegpaket; Feldpräzisierung in `architecture.md`.
