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

## Spätere Erweiterung

Ein Hetzner-Cloud-Server wird erst ergänzt, wenn Konten, Synchronisierung, Datenbank oder andere serverseitige Funktionen tatsächlich benötigt werden. Große Modelle über dem Pages-Einzeldateilimit werden separat und versioniert gespeichert.
