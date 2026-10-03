# Fortschrittsprotokoll: Cloudflare Pages

**Datum:** 2026-10-03

- Cloudflare-Pages-SPA-Fallback ergänzt.
- Sicherheitsheader und differenzierte Cache-Regeln ergänzt.
- falschen Favicon-Pfad von `/favicon.svg` auf das vorhandene `/icon.svg` korrigiert.
- Deployment- und DNS-Ablauf für eine bei Hetzner registrierte Domain dokumentiert.
- Öffentliches GitHub-Repository `madventureXD/commietools` angelegt und `main` als Produktionszweig verbunden.
- Cloudflare Pages mit ausschließlich diesem Repository verbunden; Build über Node.js 22 und `npm run build`, Ausgabe aus `apps/web/dist`.
- Lizenzprüfung plattformunabhängig gemacht: optionale native Pakete behalten vollständige SPDX-Texte, betriebssystemspezifische Installationsmetadaten und Zusatzdokumente fließen nicht mehr in die reproduzierbare Registry ein.
- Hetzner-Domain und DNS bewusst noch nicht verändert; die erste Veröffentlichung erfolgt zunächst unter `commietools.pages.dev`.
