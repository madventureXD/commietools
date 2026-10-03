# Übergabe: Faber – GitHub, Cloudflare Pages und DNS-Umschaltung

**Datum:** 2026-10-03  
**Bearbeitet durch:** Codex  
**Status:** teilweise – Veröffentlichung aktiv, Custom Domain wartet auf Nameserver-Propagation

## Ziel der Sitzung

CommieTools öffentlich in GitHub veröffentlichen, automatisch über Cloudflare Pages ausliefern und die bei Hetzner registrierte Domain ohne Unterbrechung der bestehenden Hetzner-Mailkonfiguration vorbereiten.

## Ergebnis

- Öffentliches Repository: `https://github.com/madventureXD/commietools`
- Produktionszweig: `main`
- Git-Remote: `origin = https://github.com/madventureXD/commietools.git`
- Cloudflare Pages: `https://commietools.pages.dev`
- Cloudflare-Pages-Projekt: `commietools`
- Build: Node.js 22, `npm run build`, Ausgabe `apps/web/dist`
- Automatische Deployments aus `main` sind aktiv.
- Erfolgreiches Cloudflare-Deployment von Commit `99a06a7`; spätere Commits werden automatisch neu gebaut.
- Direkte Online-Prüfung bestanden: Startseite, QR-Code-Generator, Impressum und Lizenzseite.
- Cloudflare hat ausschließlich Zugriff auf das Repository `madventureXD/commietools`, nicht auf alle GitHub-Repositories.
- Domain `commietools.org` wurde als Cloudflare-Zone im Free-Tarif angelegt.
- Nameserver bei Hetzner wurden auf `clay.ns.cloudflare.com` und `nelci.ns.cloudflare.com` geändert. Cloudflare zeigte zuletzt „Waiting for your registrar to propagate your new nameservers“.

## DNS- und Mailzustand

Cloudflare hat die bisherigen Hetzner-Einträge importiert. Erhalten bleiben müssen:

- `CNAME autoconfig -> mail.your-server.de` – zwingend **DNS only**, nicht proxied
- `MX @ -> www4.your-server.de`, Priorität 10 – DNS only
- `_autodiscover._tcp -> 0 100 443 mail.your-server.de` – DNS only
- `_imaps._tcp -> 0 100 993 mail.your-server.de` – DNS only
- `_pop3s._tcp -> 0 100 995 mail.your-server.de` – DNS only
- `_submission._tcp -> 0 100 587 mail.your-server.de` – DNS only
- `TXT @ = v=spf1 +a +mx ?all` – DNS only

Die bisherigen A-/AAAA-Einträge für `@` und `www` zeigen noch auf das alte Hetzner-Webhosting. Sie dürfen erst im Rahmen der Pages-Custom-Domain-Zuordnung ersetzt werden. Die alte Hetzner-DNS-Zone vorerst nicht löschen und keine Mail-/Hostingprodukte kündigen.

## Lizenzkorrektur während des Deployments

Der erste Cloudflare-Build wurde von `npm run licenses:check` gestoppt, weil optionale native Pakete unter Linux andere installierte Metadaten lieferten als unter Windows. Commit `99a06a7` macht die Registry reproduzierbar:

- vollständige SPDX-Texte bleiben für alle 496 Pakete erhalten;
- Paketdokumente und Manifest-Metadaten optionaler nativer Pakete beeinflussen die Registry nicht mehr plattformabhängig;
- 13 vollständige Lizenztexte und 170 stabile Paketdokumente werden veröffentlicht.

## Geänderte Bereiche

- `scripts/license-audit.mjs` – plattformunabhängige Registry-Erzeugung
- `licenses/registry.json` – neu erzeugte interne Lizenzdatenbank
- `apps/web/public/licenses/registry.json` – neu erzeugte öffentliche Lizenzdatenbank
- `uebergabe/06-protokolle/2026-10-03-cloudflare-pages.md` – Bereitstellung dokumentiert
- `uebergabe/01-stand/` – GitHub-/Cloudflare-/DNS-Stand aktualisiert

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | nach Lizenzkorrektur bestanden; damals 88 Tests, aktueller Projektstand laut Statusdokument 133 Tests |
| `npm run build` | bestanden |
| Cloudflare Pages | bestanden für `99a06a7` |
| Online-Smoke-Test | Startseite, QR-Code, Impressum und Lizenzen erreichbar |

## Offene Punkte und Risiken

- [ ] Warten, bis Cloudflare die Zone als aktiv erkennt; Cloudflare prüft automatisch, ein manueller Check ist möglich.
- [ ] Danach unter Workers & Pages → `commietools` → Custom domains zuerst `commietools.org` zuordnen.
- [ ] Anschließend `www.commietools.org` zuordnen und eine kanonische Weiterleitung festlegen; bevorzugt `www` auf die Apex-Domain umleiten.
- [ ] Prüfen, ob Pages die alten A-/AAAA-Einträge für `@` und `www` ersetzt; keine parallelen widersprüchlichen Webeinträge stehen lassen.
- [ ] SSL-Status für beide Hostnamen abwarten und HTTP/HTTPS sowie direkte SPA-Routen testen.
- [ ] Mailauflösung und vorhandene Postfächer nach der Umschaltung prüfen.
- [ ] DNSSEC erst nach vollständig stabiler Aktivierung über Cloudflare neu einrichten; aktuell war kein DS-Eintrag gesetzt.
- [ ] Hetzner-DNS-Zone erst später entfernen, wenn Website und Mail nachweislich stabil laufen.

## Empfohlener nächster Schritt

1. Öffentliche NS-Auflösung prüfen, zum Beispiel mit `Resolve-DnsName commietools.org -Type NS`.
2. Erst fortfahren, wenn ausschließlich `clay.ns.cloudflare.com` und `nelci.ns.cloudflare.com` erscheinen beziehungsweise Cloudflare die Zone als aktiv markiert.
3. Custom Domains im bestehenden Pages-Projekt verbinden und danach Website, SPA-Routen, Zertifikate und Mail testen.

## Git

- Letzter veröffentlichter Infrastruktur-Commit: `99a06a7`
- Vor dem Einchecken dieser Übergabe aktuellen `HEAD` und Arbeitsbaum erneut prüfen, da Faber parallel am Projekt gearbeitet hat.
